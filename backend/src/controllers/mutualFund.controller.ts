import { Request, Response } from 'express';
import { MutualFundService } from '../services/mutualFund.service';
import logger from '../config/logger';

/**
 * Mutual Fund Controller
 * Handles HTTP requests for mutual fund scheme data
 */
export class MutualFundController {
    /**
     * GET /schemes
     * Search/list mutual fund schemes
     * Query params: search (optional), limit (optional, default 50)
     */
    static async getSchemes(req: Request, res: Response): Promise<void> {
        try {
            const { search, limit } = req.query;
            const limitNum = limit ? parseInt(limit as string, 10) : 50;

            const schemes = await MutualFundService.searchSchemes(
                search as string | undefined,
                Math.min(limitNum, 100) // Cap at 100
            );

            res.json({
                success: true,
                data: schemes,
                count: schemes.length,
                cached: false, // Would need service modification to track this
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            logger.error('Error in getSchemes controller', { error: (error as Error).message });
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to fetch mutual fund schemes',
                    code: 'MF_FETCH_ERROR',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }

    /**
     * GET /schemes/:schemeCode
     * Get scheme details with latest NAV
     */
    static async getSchemeDetails(req: Request, res: Response): Promise<void> {
        try {
            const schemeCode = parseInt(req.params.schemeCode, 10);

            if (isNaN(schemeCode)) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'Invalid scheme code. Must be a number.',
                        code: 'INVALID_SCHEME_CODE',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }

            const schemeDetails = await MutualFundService.getSchemeDetails(schemeCode);

            if (!schemeDetails) {
                res.status(404).json({
                    success: false,
                    error: {
                        message: 'Scheme not found or temporarily unavailable',
                        code: 'SCHEME_NOT_FOUND',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }

            res.json({
                success: true,
                data: schemeDetails,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            logger.error('Error in getSchemeDetails controller', { error: (error as Error).message });
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to fetch scheme details',
                    code: 'MF_FETCH_ERROR',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }

    /**
     * GET /schemes/:schemeCode/nav-history
     * Get NAV history for a scheme
     * Query params: limit (optional, default 365)
     */
    static async getNavHistory(req: Request, res: Response): Promise<void> {
        try {
            const schemeCode = parseInt(req.params.schemeCode, 10);
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 365;

            if (isNaN(schemeCode)) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'Invalid scheme code. Must be a number.',
                        code: 'INVALID_SCHEME_CODE',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }

            const navHistory = await MutualFundService.getNavHistory(
                schemeCode,
                Math.min(limit, 1000) // Cap at 1000 entries
            );

            if (!navHistory) {
                res.status(404).json({
                    success: false,
                    error: {
                        message: 'NAV history not found or temporarily unavailable',
                        code: 'NAV_HISTORY_NOT_FOUND',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }

            res.json({
                success: true,
                data: navHistory,
                count: navHistory.data.length,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            logger.error('Error in getNavHistory controller', { error: (error as Error).message });
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to fetch NAV history',
                    code: 'MF_FETCH_ERROR',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }

    /**
     * GET /cache-status
     * Get cache status info (for debugging)
     */
    static getCacheStatus(_req: Request, res: Response): void {
        const status = MutualFundService.getCacheStatus();
        res.json({
            success: true,
            data: status,
            timestamp: new Date().toISOString(),
        });
    }
}
