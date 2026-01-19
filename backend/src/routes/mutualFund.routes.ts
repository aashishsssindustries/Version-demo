import { Router } from 'express';
import { MutualFundController } from '../controllers/mutualFund.controller';

const router = Router();

/**
 * Mutual Fund Routes (Phase 2)
 * Read-only access to mutual fund scheme metadata and NAV data
 * 
 * Base path: /api/v1/mutual-funds
 */

// GET /schemes - Search/list mutual fund schemes
// Query params: search (optional), limit (optional, default 50)
router.get('/schemes', MutualFundController.getSchemes);

// GET /schemes/:schemeCode - Get scheme details with latest NAV
router.get('/schemes/:schemeCode', MutualFundController.getSchemeDetails);

// GET /schemes/:schemeCode/nav-history - Get NAV history
// Query params: limit (optional, default 365)
router.get('/schemes/:schemeCode/nav-history', MutualFundController.getNavHistory);

// GET /cache-status - Get cache status (for debugging)
router.get('/cache-status', MutualFundController.getCacheStatus);

export default router;
