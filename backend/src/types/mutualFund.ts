/**
 * Mutual Fund Types for Phase 2 Integration
 * Read-only metadata and NAV data types
 */

/**
 * Basic mutual fund scheme information
 */
export interface MutualFundScheme {
    schemeCode: number;
    schemeName: string;
}

/**
 * Scheme details with latest NAV
 */
export interface SchemeDetails {
    schemeCode: number;
    schemeName: string;
    nav: string;
    date: string;
}

/**
 * Single NAV data point
 */
export interface NAVDataPoint {
    date: string;
    nav: string;
}

/**
 * Complete NAV history for a scheme
 */
export interface NAVHistory {
    schemeCode: number;
    schemeName: string;
    data: NAVDataPoint[];
}

/**
 * API response wrapper for mutual fund endpoints
 */
export interface MutualFundResponse<T> {
    success: boolean;
    data: T;
    cached: boolean;
    timestamp: string;
}

/**
 * Error response for mutual fund API failures
 */
export interface MutualFundError {
    success: false;
    error: {
        message: string;
        code: string;
    };
    timestamp: string;
}

/**
 * Search query parameters
 */
export interface SchemeSearchParams {
    query?: string;
    limit?: number;
}
