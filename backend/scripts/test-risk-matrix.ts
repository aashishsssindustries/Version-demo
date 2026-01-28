/**
 * Test script to verify risk-return matrix distribution
 */

import db from '../src/config/database';
import { PortfolioRiskService } from '../src/services/portfolioRisk.service';

async function testRiskMatrix() {
    try {
        // Get demo user ID
        const userRes = await db.query("SELECT id FROM users WHERE email = 'demo@wealthmax.in'");

        if (userRes.rows.length === 0) {
            console.error('Demo user not found!');
            process.exit(1);
        }

        const userId = userRes.rows[0].id;
        console.log('🧪 Testing Risk-Return Matrix\n');

        // Get risk metrics
        const riskMetrics = await PortfolioRiskService.getPortfolioRiskMetrics(userId);

        console.log('📊 Risk-Return Matrix:');
        console.log(`Total Holdings: ${riskMetrics.riskReturnMatrix.length}\n`);

        // Group by quadrant
        const quadrants = {
            'HighReturn-LowRisk': [] as any[],
            'HighReturn-HighRisk': [] as any[],
            'LowReturn-LowRisk': [] as any[],
            'LowReturn-HighRisk': [] as any[]
        };

        riskMetrics.riskReturnMatrix.forEach(item => {
            quadrants[item.quadrant].push(item);
        });

        // Display each quadrant
        Object.entries(quadrants).forEach(([quadrant, items]) => {
            console.log(`\n${quadrant}: ${items.length} holdings`);
            items.forEach(item => {
                console.log(`  - ${item.name}`);
                console.log(`    Return: ${item.return.toFixed(2)}%, Risk: ${item.risk}%, Weight: ${item.weight.toFixed(1)}%`);
            });
        });

        // Check if all quadrants have at least one holding
        console.log('\n✅ Quadrant Coverage:');
        let allCovered = true;
        Object.entries(quadrants).forEach(([quadrant, items]) => {
            const status = items.length > 0 ? '✓' : '✗';
            console.log(`  ${status} ${quadrant}: ${items.length} holdings`);
            if (items.length === 0) allCovered = false;
        });

        // Display concentration risk
        console.log('\n🎯 Concentration Risk:');
        console.log(`  Has Risk: ${riskMetrics.concentrationRisk.hasRisk}`);
        console.log(`  Severity: ${riskMetrics.concentrationRisk.severity}`);
        console.log(`  ${riskMetrics.concentrationRisk.explanation}`);

        // Display diversification
        console.log('\n📈 Diversification:');
        console.log(`  Total Holdings: ${riskMetrics.diversificationFlag.totalHoldings}`);
        console.log(`  Over-diversified: ${riskMetrics.diversificationFlag.isOverDiversified}`);
        console.log(`  ${riskMetrics.diversificationFlag.explanation}`);

        if (allCovered) {
            console.log('\n✅ All quadrants have holdings!');
        } else {
            console.log('\n⚠️  Some quadrants are empty!');
        }

    } catch (error: any) {
        console.error('Error:', error.message);
        console.error(error.stack);
    } finally {
        await db.close();
    }
}

testRiskMatrix();
