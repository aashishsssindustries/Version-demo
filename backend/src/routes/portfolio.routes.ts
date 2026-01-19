import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolio.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Add a single holding manually
router.post('/manual', authenticateToken, PortfolioController.addManualHolding);

// Upload holdings via CSV
router.post('/upload-csv', authenticateToken, PortfolioController.uploadCSV);

// Get all user holdings
router.get('/holdings', authenticateToken, PortfolioController.getHoldings);

// Delete a specific holding
router.delete('/holdings/:id', authenticateToken, PortfolioController.deleteHolding);

export default router;
