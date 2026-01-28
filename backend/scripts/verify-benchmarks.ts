
import db from '../src/config/database';

async function verifyBenchmarks() {
    console.log('🔍 Verifying Benchmark Data...\n');
    let hasErrors = false;

    try {
        // 1. Verify Indices
        const indicesRes = await db.query("SELECT * FROM market_indices");
        console.log(`✅ Indices count: ${indicesRes.rows.length}`);
        if (indicesRes.rows.length < 6) {
            console.error('❌ Index count is low!');
            hasErrors = true;
        }

        // 2. Verify History
        const historyRes = await db.query("SELECT count(*) as count FROM market_index_history");
        const historyCount = parseInt(historyRes.rows[0].count);
        console.log(`✅ History records: ${historyCount}`);

        if (historyCount < 300) {
            console.error('❌ History count is low (Expected > 300)!');
            hasErrors = true;
        }

        // 3. Verify Linkage
        const linkedRes = await db.query("SELECT count(*) as count FROM holding_metadata WHERE benchmark_index_id IS NOT NULL");
        const linkedCount = parseInt(linkedRes.rows[0].count);
        console.log(`✅ Linked Holdings: ${linkedCount}`);

        const totalHoldingsRes = await db.query("SELECT count(*) as count FROM holding_metadata");
        const totalHoldings = parseInt(totalHoldingsRes.rows[0].count);

        if (linkedCount < totalHoldings) {
            console.warn(`⚠️ Only ${linkedCount}/${totalHoldings} holdings are linked to benchmarks. This might be expected if categories differ.`);
        } else {
            console.log('✅ All holdings linked to benchmarks');
        }

    } catch (err) {
        console.error('❌ Error verifying benchmarks:', err);
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

verifyBenchmarks();
