import axios, { AxiosInstance, AxiosError } from 'axios';
import config from '../config/env';
import redisCache from '../config/redis';
import logger from '../config/logger';
import {
    MutualFundScheme,
    SchemeDetails,
    NAVHistory,
    NAVDataPoint,
} from '../types/mutualFund';

/**
 * Mutual Fund Service
 * Provides read-only access to mutual fund scheme metadata and NAV data
 * using mfapi.in as the data source with Redis caching.
 */
export class MutualFundService {
    private static client: AxiosInstance;

    // Cache TTL in seconds
    private static readonly SCHEME_LIST_TTL = 86400; // 24 hours
    private static readonly NAV_TTL = 3600; // 1 hour
    private static readonly NAV_HISTORY_TTL = 86400; // 24 hours

    // Cache keys
    private static readonly CACHE_PREFIX = 'mf:';

    /**
     * Get axios client instance
     */
    private static getClient(): AxiosInstance {
        if (!this.client) {
            const baseURL = config.get('MFAPI_BASE_URL');
            this.client = axios.create({
                baseURL,
                timeout: 10000, // 10 seconds
                headers: {
                    'Accept': 'application/json',
                },
            });
        }
        return this.client;
    }

    /**
     * Retry wrapper for API calls with exponential backoff
     */
    private static async withRetry<T>(
        fn: () => Promise<T>,
        maxRetries = 3,
        baseDelayMs = 500
    ): Promise<T> {
        let lastError: Error | undefined;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error as Error;

                if (attempt === maxRetries) {
                    break;
                }

                // Exponential backoff
                const delay = baseDelayMs * Math.pow(2, attempt - 1);
                logger.warn(`API call failed, retrying in ${delay}ms`, {
                    attempt,
                    maxRetries,
                    error: (error as Error).message,
                });

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    }

    /**
     * Search mutual fund schemes by name
     */
    static async searchSchemes(query?: string, limit = 50): Promise<MutualFundScheme[]> {
        const cacheKey = `${this.CACHE_PREFIX}search:${query || 'all'}:${limit}`;

        // Check cache first
        try {
            const cached = await redisCache.get(cacheKey);
            if (cached) {
                logger.debug('Cache hit for scheme search', { query, limit });
                return JSON.parse(cached);
            }
        } catch (error) {
            logger.warn('Cache read failed for scheme search', { error: (error as Error).message });
        }

        try {
            let schemes: MutualFundScheme[];

            if (query) {
                // Search by name
                const response = await this.withRetry(() =>
                    this.getClient().get<Array<{ schemeCode: number; schemeName: string }>>(`/mf/search?q=${encodeURIComponent(query)}`)
                );
                schemes = response.data.slice(0, limit);
            } else {
                // Get all schemes (paginated list)
                const response = await this.withRetry(() =>
                    this.getClient().get<Array<{ schemeCode: number; schemeName: string }>>('/mf')
                );
                schemes = response.data.slice(0, limit);
            }

            // Cache results
            try {
                await redisCache.set(cacheKey, JSON.stringify(schemes), this.SCHEME_LIST_TTL);
            } catch (error) {
                logger.warn('Cache write failed for scheme search', { error: (error as Error).message });
            }

            return schemes;
        } catch (error) {
            this.handleApiError(error as AxiosError, 'searchSchemes');
            return [];
        }
    }

    /**
     * Get scheme details with latest NAV
     */
    static async getSchemeDetails(schemeCode: number): Promise<SchemeDetails | null> {
        const cacheKey = `${this.CACHE_PREFIX}scheme:${schemeCode}`;

        // Check cache first
        try {
            const cached = await redisCache.get(cacheKey);
            if (cached) {
                logger.debug('Cache hit for scheme details', { schemeCode });
                return JSON.parse(cached);
            }
        } catch (error) {
            logger.warn('Cache read failed for scheme details', { error: (error as Error).message });
        }

        try {
            const response = await this.withRetry(() =>
                this.getClient().get<{
                    meta: { scheme_code: number; scheme_name: string };
                    data: Array<{ date: string; nav: string }>;
                }>(`/mf/${schemeCode}/latest`)
            );

            const { meta, data } = response.data;
            const latestNav = data[0];

            const schemeDetails: SchemeDetails = {
                schemeCode: meta.scheme_code,
                schemeName: meta.scheme_name,
                nav: latestNav?.nav || 'N/A',
                date: latestNav?.date || 'N/A',
            };

            // Cache results
            try {
                await redisCache.set(cacheKey, JSON.stringify(schemeDetails), this.NAV_TTL);
            } catch (error) {
                logger.warn('Cache write failed for scheme details', { error: (error as Error).message });
            }

            return schemeDetails;
        } catch (error) {
            this.handleApiError(error as AxiosError, 'getSchemeDetails');

            // Try to return stale cache if available
            try {
                const staleCache = await redisCache.get(cacheKey);
                if (staleCache) {
                    logger.info('Returning stale cache for scheme details', { schemeCode });
                    return JSON.parse(staleCache);
                }
            } catch {
                // Ignore cache errors
            }

            return null;
        }
    }

    /**
     * Get NAV history for a scheme
     */
    static async getNavHistory(schemeCode: number, limit = 365): Promise<NAVHistory | null> {
        const cacheKey = `${this.CACHE_PREFIX}history:${schemeCode}`;

        // Check cache first
        try {
            const cached = await redisCache.get(cacheKey);
            if (cached) {
                logger.debug('Cache hit for NAV history', { schemeCode });
                const history = JSON.parse(cached) as NAVHistory;
                return {
                    ...history,
                    data: history.data.slice(0, limit),
                };
            }
        } catch (error) {
            logger.warn('Cache read failed for NAV history', { error: (error as Error).message });
        }

        try {
            const response = await this.withRetry(() =>
                this.getClient().get<{
                    meta: { scheme_code: number; scheme_name: string };
                    data: Array<{ date: string; nav: string }>;
                }>(`/mf/${schemeCode}`)
            );

            const { meta, data } = response.data;

            const navHistory: NAVHistory = {
                schemeCode: meta.scheme_code,
                schemeName: meta.scheme_name,
                data: data.map((item): NAVDataPoint => ({
                    date: item.date,
                    nav: item.nav,
                })),
            };

            // Cache full history
            try {
                await redisCache.set(cacheKey, JSON.stringify(navHistory), this.NAV_HISTORY_TTL);
            } catch (error) {
                logger.warn('Cache write failed for NAV history', { error: (error as Error).message });
            }

            return {
                ...navHistory,
                data: navHistory.data.slice(0, limit),
            };
        } catch (error) {
            this.handleApiError(error as AxiosError, 'getNavHistory');
            return null;
        }
    }

    /**
     * Handle API errors gracefully
     */
    private static handleApiError(error: AxiosError, operation: string): void {
        if (error.response) {
            // Server responded with error status
            logger.error(`MF API error in ${operation}`, {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
            });
        } else if (error.request) {
            // No response received
            logger.error(`MF API no response in ${operation}`, {
                message: error.message,
            });
        } else {
            // Request setup error
            logger.error(`MF API request error in ${operation}`, {
                message: error.message,
            });
        }
    }

    /**
     * Check if caching is using Redis or memory fallback
     */
    static getCacheStatus(): { usingRedis: boolean } {
        return {
            usingRedis: redisCache.isUsingRedis(),
        };
    }

    // ==========================================
    // ISIN-based NAV Lookup (mf.captnemo.in)
    // ==========================================

    private static captnemoClient: AxiosInstance;

    /**
     * Get captnemo axios client instance for ISIN-based lookups
     */
    private static getCaptnemoClient(): AxiosInstance {
        if (!this.captnemoClient) {
            const baseURL = config.get('CAPTNEMO_BASE_URL');
            this.captnemoClient = axios.create({
                baseURL,
                timeout: 10000,
                headers: {
                    'Accept': 'application/json',
                },
            });
        }
        return this.captnemoClient;
    }

    /**
     * Get NAV data by ISIN using mf.captnemo.in API
     * Returns scheme name, latest NAV, and NAV date
     */
    static async getNavByIsin(isin: string): Promise<{
        name: string;
        nav: number | null;
        date: string | null;
    } | null> {
        const cacheKey = `${this.CACHE_PREFIX}isin:${isin}`;

        // Check cache first
        try {
            const cached = await redisCache.get(cacheKey);
            if (cached) {
                logger.debug('Cache hit for ISIN NAV lookup', { isin });
                return JSON.parse(cached);
            }
        } catch (error) {
            logger.warn('Cache read failed for ISIN NAV', { error: (error as Error).message });
        }

        try {
            const response = await this.withRetry(() =>
                this.getCaptnemoClient().get<{
                    ISIN: string;
                    name: string;
                    nav: number;
                    date: string;
                }>(`/nav/${isin}`)
            );

            const { name, nav, date } = response.data;

            const navData = {
                name: name || 'Unknown Mutual Fund',
                nav: nav ?? null,
                date: date || null,
            };

            // Cache for 1 hour
            try {
                await redisCache.set(cacheKey, JSON.stringify(navData), this.NAV_TTL);
            } catch (error) {
                logger.warn('Cache write failed for ISIN NAV', { error: (error as Error).message });
            }

            return navData;
        } catch (error) {
            this.handleApiError(error as AxiosError, `getNavByIsin:${isin}`);
            return null;
        }
    }
}

