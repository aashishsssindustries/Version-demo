/**
 * Seed Script: Benchmark Indices and History
 */

import db from '../src/config/database';

const BENCHMARKS = [
    {
        name: 'NIFTY 50',
        symbol: 'NIFTY50',
        type: 'EQUITY',
        startValue: 15000,
        cagr: 0.12, // 12%
        volatility: 0.15 // 15%
    },
    {
        name: 'NIFTY Midcap 150',
        symbol: 'NIFTYMID150',
        type: 'EQUITY',
        startValue: 8000,
        cagr: 0.18, // 18%
        volatility: 0.20 // 20%
    },
    {
        name: 'NIFTY Smallcap 250',
        symbol: 'NIFTYSML250',
        type: 'EQUITY',
        startValue: 6000,
        cagr: 0.22, // 22%
        volatility: 0.25 // 25%
    },
    {
        name: 'CRISIL Composite Bond Fund Index',
        symbol: 'CRISILBOND',
        type: 'DEBT',
        startValue: 100,
        cagr: 0.07, // 7%
        volatility: 0.03 // 3%
    },
    {
        name: 'NIFTY Hybrid Index',
        symbol: 'NIFTYHYBRID',
        type: 'HYBRID',
        startValue: 1000,
        cagr: 0.10, // 10%
        volatility: 0.08 // 8%
    },
    {
        name: 'NIFTY 500',
        symbol: 'NIFTY500',
        type: 'EQUITY',
        startValue: 12000,
        cagr: 0.13, // 13%
        volatility: 0.16 // 16%
    }
];

// Map Fund Categories to Benchmark Names (Matches benchmark.config.ts)
const CATEGORY_MAP: Record<string, string> = {
    'Large Cap': 'NIFTY 50',
    'Mid Cap': 'NIFTY Midcap 150',
    'Small Cap': 'NIFTY Smallcap 250',
    'Debt': 'CRISIL Composite Bond Fund Index',
    'ELSS': 'NIFTY 500', // ELSS usually benchmarked vs 500
    'Hybrid': 'NIFTY Hybrid Index',
    'Multi Cap': 'NIFTY 500',
    'Flexi Cap': 'NIFTY 500'
};

async function seedBenchmarks() {
    console.log('🌱 Starting Benchmark Seeding...\n');

    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 5); // 5 years ago

        for (const bench of BENCHMARKS) {
            console.log(`Processing ${bench.name}...`);

            // 1. Create or Get Index
            let indexId: string;
            const existing = await db.query('SELECT id FROM market_indices WHERE name = $1', [bench.name]);

            if (existing.rows.length > 0) {
                indexId = existing.rows[0].id;
                console.log(`   ✓ Found existing index (ID: ${indexId})`);
            } else {
                const res = await db.query(
                    `INSERT INTO market_indices (name, symbol, type, description)
                     VALUES ($1, $2, $3, $4)
                     RETURNING id`,
                    [bench.name, bench.symbol, bench.type, `Benchmark index for ${bench.type}`]
                );
                indexId = res.rows[0].id;
                console.log(`   ✓ Created index (ID: ${indexId})`);
            }

            // 2. Generate History (Monthly)
            // Geometric Brownian Motion (simplified)
            // S_t = S_0 * exp((mu - 0.5*sigma^2)*t + sigma*W_t)
            // But simpler: monthly return = mu/12 + sigma/sqrt(12) * N(0,1)

            const months = 60;
            let currentValue = bench.startValue;
            let historyCount = 0;

            const mu = bench.cagr / 12;
            const sigma = bench.volatility / Math.sqrt(12);

            // Fetch existing history to avoid re-inserting
            const historyRes = await db.query('SELECT date FROM market_index_history WHERE index_id = $1', [indexId]);
            const existingDates = new Set(historyRes.rows.map(r => new Date(r.date).toISOString().slice(0, 7))); // YYYY-MM

            for (let i = 0; i <= months; i++) {
                const date = new Date(startDate);
                date.setMonth(date.getMonth() + i);

                // Set to end of month usually, or just 1st of month. Let's use 1st.
                date.setDate(1);
                const dateStr = date.toISOString().slice(0, 10);
                const monthStr = date.toISOString().slice(0, 7);

                if (!existingDates.has(monthStr)) {
                    // Add random shock
                    const shock = (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / 3; // Approx N(0,1)
                    const returnPct = mu + sigma * shock;

                    if (i > 0) { // Keep start value at start date
                        currentValue = currentValue * (1 + returnPct);
                    }

                    await db.query(
                        `INSERT INTO market_index_history (index_id, date, value)
                         VALUES ($1, $2, $3)
                         ON CONFLICT (index_id, date) DO NOTHING`,
                        [indexId, dateStr, parseFloat(currentValue.toFixed(2))]
                    );
                    historyCount++;
                } else {
                    // Advance currentValue anyway to keep simulation consistent if we were continuing,
                    // but here logic is imperfect if partially seeded. Assuming all or nothing usually.
                    // For now, simpler to just skip.
                }
            }
            console.log(`   ✓ Seeded ${historyCount} history points`);
        }

        // 3. Link Indices to Holding Metadata
        console.log('\nLinking Holdings to Benchmarks...');
        const holdingsProps = await db.query("SELECT isin, description, name, type FROM holding_metadata");
        // Note: category isn't in holding_metadata schema?
        // Let's check holding_metadata schema.
        // It has description.
        // My seed script added 'category' to MUTUAL_FUNDS array but inserted into 'description' or lost?
        // Step 41: `description` is text.
        // In seed-demo-portfolio.ts:
        // `description: 'Large Cap Equity Fund'`
        // `category: 'Large Cap'`
        // Insert: `VALUES (..., description)`
        // So 'category' field was NOT inserted into DB. It was used in TS config only.
        // I need to infer category from description or name using simple matching.

        // Let's iterate and update.
        let linkCount = 0;
        for (const holding of holdingsProps.rows) {
            let category = 'Other';
            const desc = (holding.description || '').toLowerCase();
            const name = (holding.name || '').toLowerCase();

            if (desc.includes('large cap') || name.includes('large cap')) category = 'Large Cap';
            else if (desc.includes('mid cap') || name.includes('mid cap')) category = 'Mid Cap';
            else if (desc.includes('small cap') || name.includes('small cap')) category = 'Small Cap';
            else if (desc.includes('elss') || name.includes('elss') || name.includes('tax saver')) category = 'ELSS';
            else if (desc.includes('hybrid') || name.includes('hybrid') || name.includes('balanced')) category = 'Hybrid';
            else if (desc.includes('debt') || name.includes('bond') || name.includes('liquid')) category = 'Debt';
            else if (holding.type === 'EQUITY') category = 'Large Cap'; // Default equities to Nifty 50 for now, or match specific?

            // Refine Equity:
            // Reliance -> Nifty 50
            // HDFC Bank -> Nifty 50
            // Infosys -> Nifty 50
            // Tata Steel -> Nifty 50
            // Most blue chips are Large Cap.

            const benchmarkName = CATEGORY_MAP[category] || 'NIFTY 500';

            // Get index ID
            const idxRes = await db.query('SELECT id FROM market_indices WHERE name = $1', [benchmarkName]);
            if (idxRes.rows.length > 0) {
                const idxId = idxRes.rows[0].id;
                await db.query('UPDATE holding_metadata SET benchmark_index_id = $1 WHERE isin = $2', [idxId, holding.isin]);
                linkCount++;
                console.log(`   Linked ${holding.name} -> ${benchmarkName}`);
            }
        }
        console.log(`\n✓ Linked ${linkCount} holdings to benchmarks`);

        console.log('\n✅ Benchmark Seeding Complete!');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    } finally {
        await db.close();
    }
}

seedBenchmarks()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
