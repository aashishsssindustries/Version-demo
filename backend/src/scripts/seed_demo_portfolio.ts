
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
const { v4: uuidv4 } = require('uuid');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// --- Configuration ---
const DEMO_USER_EMAIL = 'demo-user-001@wealthmax.app';
const TARGET_XIRR_MIN = 0.11; // 11%
const TARGET_XIRR_MAX = 0.14; // 14%
// const TARGET_BENCHMARK_RETURN = 0.13; // 13% fixed

// --- Data Definitions ---

interface AssetDef {
    isin: string;
    name: string;
    type: 'EQUITY' | 'MUTUAL_FUND';
    ticker?: string;
    allocationWeight: number; // Relative weight to aim for
    concentration?: boolean; // If true, make this the >30% holding
}

const ASSETS: AssetDef[] = [
    // Equity (6 Stocks) ~ 65% total target
    { isin: 'INE002A01018', name: 'Reliance Industries Ltd', type: 'EQUITY', ticker: 'RELIANCE', allocationWeight: 35, concentration: true }, // Large Cap, Concentrated
    { isin: 'INE030A01027', name: 'Hindustan Unilever Ltd', type: 'EQUITY', ticker: 'HINDUNILVR', allocationWeight: 8 }, // Large Cap
    { isin: 'INE009A01021', name: 'Infosys Ltd', type: 'EQUITY', ticker: 'INFY', allocationWeight: 7 }, // Large Cap
    { isin: 'INE018A01030', name: 'Larsen & Toubro Ltd', type: 'EQUITY', ticker: 'LT', allocationWeight: 5 }, // Large Cap
    { isin: 'INE742F01042', name: 'Adani Ports', type: 'EQUITY', ticker: 'ADANIPORTS', allocationWeight: 5 }, // Large Cap
    { isin: 'INE123W01016', name: 'Polycab India Ltd', type: 'EQUITY', ticker: 'POLYCAB', allocationWeight: 5 }, // Mid Cap

    // Mutual Funds (5 Funds) ~ 35% total target
    { isin: 'INF209K01KV0', name: 'Aditya Birla Sun Life Frontline Equity Fund', type: 'MUTUAL_FUND', allocationWeight: 10 }, // Large Cap
    { isin: 'INF769K01EG9', name: 'Mirae Asset Large Cap Fund', type: 'MUTUAL_FUND', allocationWeight: 8 }, // Large Cap
    { isin: 'INF846K01164', name: 'Axis Long Term Equity Fund', type: 'MUTUAL_FUND', allocationWeight: 7 }, // ELSS
    { isin: 'INF179K01BE2', name: 'HDFC Short Term Debt Fund', type: 'MUTUAL_FUND', allocationWeight: 5 }, // Debt
    { isin: 'INF200K01V76', name: 'SBI Magnum Gilt Fund', type: 'MUTUAL_FUND', allocationWeight: 5 }, // Debt
];

// --- Helpers ---

// Random date between start and end
function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Add months to date
function addMonths(date: Date, months: number) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

// Format date for SQL - Unused
// const TARGET_BENCHMARK_RETURN = 0.13; // 13% fixed - Unused for now


// Calculate target value based on Cashflows and Target XIRR
// FV = Sum ( P * (1+r)^t ) where t is years from investment to now
function calculateTargetValuation(transactions: { amount: number, date: Date }[], targetXirr: number): number {
    const now = new Date();
    let totalValue = 0;

    for (const trx of transactions) {
        const timeDiffMs = now.getTime() - trx.date.getTime();
        const timeInYears = timeDiffMs / (1000 * 60 * 60 * 24 * 365.25);
        // FV = PV * (1 + r)^t
        const fv = trx.amount * Math.pow(1 + targetXirr, timeInYears);
        totalValue += fv;
    }
    return totalValue;
}

// --- Main Script ---

async function seed() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        console.log('Starting seed process...');

        // 1. Create/Get User
        let userId: string;
        const userRes = await client.query('SELECT id FROM users WHERE email = $1', [DEMO_USER_EMAIL]);

        if (userRes.rows.length > 0) {
            userId = userRes.rows[0].id;
            console.log(`User ${DEMO_USER_EMAIL} exists with ID: ${userId}`);
        } else {
            const newUser = await client.query(`
                INSERT INTO users (id, email, mobile, name, password_hash, role, is_email_verified)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `, [uuidv4(), DEMO_USER_EMAIL, '9999999999', 'Demo User', 'hash_placeholder', 'user', true]);
            userId = newUser.rows[0].id;
            console.log(`Created new user with ID: ${userId}`);

            // Create Profile
            await client.query(`
                INSERT INTO profiles (user_id, risk_class, risk_score)
                VALUES ($1, 'Aggressive', 8)
            `, [userId]);
        }

        // 2. Create/Get Portfolio
        let portfolioId: string;
        const portRes = await client.query('SELECT id FROM user_portfolios WHERE user_id = $1', [userId]);

        if (portRes.rows.length > 0) {
            portfolioId = portRes.rows[0].id;
            console.log(`Using portfolio ID: ${portfolioId}`);

            // Clean existing data for this portfolio to avoid duplication logic complexity
            console.log('Cleaning existing holdings and transactions for demo user...');
            await client.query('DELETE FROM portfolio_transactions WHERE portfolio_id = $1', [portfolioId]);
            await client.query('DELETE FROM portfolio_holdings WHERE portfolio_id = $1', [portfolioId]);

        } else {
            const newPort = await client.query(`
                INSERT INTO user_portfolios (user_id, portfolio_alias, source)
                VALUES ($1, 'Demo Portfolio', 'MANUAL')
                RETURNING id
            `, [userId]);
            portfolioId = newPort.rows[0].id;
            console.log(`Created new portfolio with ID: ${portfolioId}`);
        }

        // 3. Process Assets
        let totalInvested = 0;
        let totalCurrentValue = 0;

        for (const asset of ASSETS) {
            console.log(`Processing ${asset.name}...`);

            // Ensure Holding Metadata Exists
            await client.query(`
                INSERT INTO holding_metadata (isin, name, type, ticker, description)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (isin) DO UPDATE SET name = EXCLUDED.name
            `, [asset.isin, asset.name, asset.type, asset.ticker, `Demo Data for ${asset.name}`]);

            // Generate Transactions
            const transactions: any[] = [];
            const isin = asset.isin;

            // Generate a random target XIRR for this specific asset within range
            const assetXirr = TARGET_XIRR_MIN + Math.random() * (TARGET_XIRR_MAX - TARGET_XIRR_MIN);

            if (asset.type === 'EQUITY') {
                // Bulk buys 
                const numTx = Math.floor(Math.random() * 3) + 1; // 1-3 transactions
                for (let i = 0; i < numTx; i++) {
                    const date = randomDate(new Date('2020-01-01'), new Date('2024-01-01'));
                    // Allocation weight roughly guides amount
                    const baseAmount = (asset.allocationWeight / 100) * 1000000; // Base on 10L portfolio
                    const amount = Math.floor(baseAmount / numTx * (0.8 + Math.random() * 0.4)); // Variance

                    // Mock price
                    const price = 500 + Math.random() * 1500;
                    const units = amount / price;

                    transactions.push({
                        date,
                        type: 'BUY',
                        units,
                        amount,
                        price
                    });
                }
            } else {
                // SIPs
                const numTx = Math.floor(Math.random() * 5) + 8; // 8-12 transactions
                const startDate = randomDate(new Date('2021-01-01'), new Date('2022-01-01'));
                const sipAmount = Math.floor(((asset.allocationWeight / 100) * 1000000) / numTx);

                for (let i = 0; i < numTx; i++) {
                    const date = addMonths(startDate, i);
                    if (date > new Date()) break;

                    // Mock NAV
                    const nav = 20 + Math.random() * 10 + (i * 0.5); // Slight upward trend
                    const units = sipAmount / nav;

                    transactions.push({
                        date,
                        type: 'BUY',
                        units,
                        amount: sipAmount,
                        price: nav // NAV
                    });
                }
            }

            // Insert Transactions
            let totalUnits = 0;
            let totalCost = 0;
            const cashflowsForXirr = [];

            for (const tx of transactions) {
                totalUnits += tx.units;
                totalCost += tx.amount;
                cashflowsForXirr.push({ amount: tx.amount, date: tx.date });

                await client.query(`
                    INSERT INTO portfolio_transactions 
                    (portfolio_id, isin, transaction_date, transaction_type, units, amount, nav, source)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, 'MANUAL')
                `, [portfolioId, isin, tx.date, tx.type, tx.units, tx.amount, tx.price]);
            }

            // Calculate Target Valuation based on XIRR
            const targetValuation = calculateTargetValuation(cashflowsForXirr, assetXirr);
            // Current NAV = Target Value / Units
            const currentNav = targetValuation / totalUnits;
            const avgPrice = totalCost / totalUnits;

            // Update Metadata with Current NAV
            await client.query(`
                UPDATE holding_metadata 
                SET current_nav = $1, nav_date = NOW(), updated_at = NOW()
                WHERE isin = $2
            `, [currentNav, isin]);

            // Create Portfolio Holding
            await client.query(`
                INSERT INTO portfolio_holdings
                (portfolio_id, isin, quantity, average_price, last_valuation, source)
                VALUES ($1, $2, $3, $4, $5, 'MANUAL')
            `, [portfolioId, isin, totalUnits, avgPrice, targetValuation]);

            totalInvested += totalCost;
            totalCurrentValue += targetValuation;

            console.log(`  > Invested: ${totalCost.toFixed(2)}, Value: ${targetValuation.toFixed(2)}, XIRR Target: ${(assetXirr * 100).toFixed(2)}%`);
        }

        // Summary
        const portfolioAbsReturn = ((totalCurrentValue - totalInvested) / totalInvested) * 100;
        console.log('-------------------------------------------');
        console.log(`Portfolio Seeding Complete`);
        console.log(`Total Invested: ${totalInvested.toFixed(2)}`);
        console.log(`Total Value:    ${totalCurrentValue.toFixed(2)}`);
        console.log(`Abs Return:     ${portfolioAbsReturn.toFixed(2)}%`);
        console.log(`Target XIRR Range: ${TARGET_XIRR_MIN * 100}% - ${TARGET_XIRR_MAX * 100}%`);

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error seeding data:', e);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
