/**
 * Simple test to check if growth curve calculation works
 */

import db from '../src/config/database';
import { PortfolioPerformanceService } from '../src/services/portfolioPerformance.service';

async function testGrowthCurve() {
    try {
        // Get demo user ID
        const userRes = await db.query("SELECT id FROM users WHERE email = 'demo@wealthmax.in'");

        if (userRes.rows.length === 0) {
            console.error('Demo user not found!');
            process.exit(1);
        }

        const userId = userRes.rows[0].id;
        console.log(`Testing with user ID: ${userId}\n`);

        console.log('Calculating growth curve...');
        const growthCurve = await PortfolioPerformanceService.calculateGrowthCurve(userId);

        console.log(`Result: ${growthCurve.length} data points`);
        if (growthCurve.length > 0) {
            console.log('First 3 points:');
            growthCurve.slice(0, 3).forEach(p => console.log(`  ${p.date}: ₹${p.value}`));
        }

    } catch (error: any) {
        console.error('Error:', error.message);
        console.error(error.stack);
    } finally {
        await db.close();
    }
}

testGrowthCurve();
