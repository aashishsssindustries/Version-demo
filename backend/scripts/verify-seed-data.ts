
import db from '../src/config/database';

async function verifySeedData() {
    console.log('🔍 Verifying Seed Data...\n');
    let hasErrors = false;

    try {
        // 1. Verify User
        const userRes = await db.query("SELECT * FROM users WHERE email = 'demo@wealthmax.in'");
        if (userRes.rows.length === 1) {
            console.log('✅ User found: demo@wealthmax.in');
        } else {
            console.error('❌ User NOT found!');
            hasErrors = true;
        }

        if (userRes.rows.length > 0) {
            const userId = userRes.rows[0].id;

            // 2. Verify Profile
            const profileRes = await db.query("SELECT * FROM profiles WHERE user_id = $1", [userId]);
            if (profileRes.rows.length === 1) {
                const p = profileRes.rows[0];
                console.log(`✅ Profile found: Age ${p.age}, Risk ${p.risk_class}, Income ${p.gross_income}`);
                if (p.age !== 32 || p.risk_class !== 'Moderate') {
                    console.error('❌ Profile data mismatch!');
                    hasErrors = true;
                }
            } else {
                console.error('❌ Profile NOT found!');
                hasErrors = true;
            }

            // 3. Verify Portfolio
            const portRes = await db.query("SELECT * FROM user_portfolios WHERE user_id = $1", [userId]);
            if (portRes.rows.length > 0) {
                const portId = portRes.rows[0].id;
                console.log(`✅ Portfolio found: ID ${portId}`);

                // 4. Verify Holdings
                const holdingsRes = await db.query("SELECT * FROM portfolio_holdings WHERE portfolio_id = $1", [portId]);
                console.log(`✅ Holdings count: ${holdingsRes.rows.length} (Expected: 9)`);
                if (holdingsRes.rows.length !== 9) {
                    console.error('❌ Holdings count mismatch!');
                    hasErrors = true;
                }

                // 5. Verify Transactions
                const txRes = await db.query("SELECT * FROM portfolio_transactions WHERE portfolio_id = $1", [portId]);
                console.log(`✅ Transactions count: ${txRes.rows.length} (Expected: ~190)`);
                if (txRes.rows.length < 150) {
                    console.error('❌ Transaction count seems low!');
                    hasErrors = true;
                }

                // 6. Verify Equity vs Mutual Fund
                const equityRes = await db.query(`
                    SELECT count(*) as count FROM portfolio_holdings ph
                    JOIN holding_metadata hm ON ph.isin = hm.isin
                    WHERE ph.portfolio_id = $1 AND hm.type = 'EQUITY'
                `, [portId]);
                console.log(`✅ Equity Holdings: ${equityRes.rows[0].count} (Expected: 4)`);

                const mfRes = await db.query(`
                    SELECT count(*) as count FROM portfolio_holdings ph
                    JOIN holding_metadata hm ON ph.isin = hm.isin
                    WHERE ph.portfolio_id = $1 AND hm.type = 'MUTUAL_FUND'
                `, [portId]);
                console.log(`✅ Mutual Fund Holdings: ${mfRes.rows[0].count} (Expected: 5)`);

            } else {
                console.error('❌ Portfolio NOT found!');
                hasErrors = true;
            }
        }

    } catch (err) {
        console.error('❌ Error verifying data:', err);
        hasErrors = true;
    } finally {
        await db.close();
    }

    if (hasErrors) {
        console.log('\n❌ Verification FAILED');
        process.exit(1);
    } else {
        console.log('\n✨ Verification SUCCESSFUL');
        process.exit(0);
    }
}

verifySeedData();
