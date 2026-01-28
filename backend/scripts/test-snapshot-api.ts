/**
 * Test script to verify portfolio snapshot API returns time-series data
 */

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

async function testSnapshotAPI() {
    try {
        console.log('🧪 Testing Portfolio Snapshot API...\n');

        // 1. Login as demo user
        console.log('1️⃣  Logging in as demo user...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'demo@wealthmax.in',
            password: 'Demo@123'
        });

        if (!loginRes.data.success) {
            throw new Error('Login failed');
        }

        const token = loginRes.data.data.token;
        console.log('   ✓ Login successful\n');

        // 2. Get portfolio snapshot
        console.log('2️⃣  Fetching portfolio snapshot...');
        const snapshotRes = await axios.get(`${API_URL}/analytics/portfolio-snapshot`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!snapshotRes.data.success) {
            throw new Error('Snapshot fetch failed');
        }

        const snapshot = snapshotRes.data.data;
        console.log('   ✓ Snapshot fetched\n');

        // 3. Verify time-series data
        console.log('3️⃣  Verifying time-series data...\n');

        const { performance } = snapshot;

        // Check growth_curve
        if (performance.growth_curve) {
            console.log(`   ✅ growth_curve: ${performance.growth_curve.length} data points`);
            if (performance.growth_curve.length < 12) {
                console.warn(`   ⚠️  Less than 12 data points!`);
            }
            if (performance.growth_curve.length > 0) {
                console.log(`      First: ${performance.growth_curve[0].date} = ₹${performance.growth_curve[0].value}`);
                console.log(`      Last: ${performance.growth_curve[performance.growth_curve.length - 1].date} = ₹${performance.growth_curve[performance.growth_curve.length - 1].value}`);
            }
        } else {
            console.error('   ❌ growth_curve is missing or empty!');
        }

        // Check rolling_returns
        if (performance.rolling_returns) {
            console.log(`\n   ✅ rolling_returns: ${performance.rolling_returns.length} data points`);
            if (performance.rolling_returns.length < 12) {
                console.warn(`   ⚠️  Less than 12 data points!`);
            }
            if (performance.rolling_returns.length > 0) {
                console.log(`      First: ${performance.rolling_returns[0].date} = ${performance.rolling_returns[0].return}%`);
                console.log(`      Last: ${performance.rolling_returns[performance.rolling_returns.length - 1].date} = ${performance.rolling_returns[performance.rolling_returns.length - 1].return}%`);
            }
        } else {
            console.error('   ❌ rolling_returns is missing or empty!');
        }

        // Check drawdown_series
        if (performance.drawdown_series) {
            console.log(`\n   ✅ drawdown_series: ${performance.drawdown_series.length} data points`);
            if (performance.drawdown_series.length < 12) {
                console.warn(`   ⚠️  Less than 12 data points!`);
            }
            if (performance.drawdown_series.length > 0) {
                const maxDrawdown = Math.min(...performance.drawdown_series.map((d: any) => d.drawdown));
                console.log(`      Max Drawdown: ${maxDrawdown.toFixed(2)}%`);
            }
        } else {
            console.error('   ❌ drawdown_series is missing or empty!');
        }

        console.log('\n✅ Test Complete!');

    } catch (error: any) {
        console.error('\n❌ Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

testSnapshotAPI();
