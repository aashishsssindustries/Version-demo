/**
 * Seed Script: Demo Portfolio Data
 * 
 * IMPORTANT: This is for DEMO and MOCK PURPOSES ONLY.
 * - Creates a demo user with realistic portfolio data
 * - Does NOT affect production users
 * - Does NOT modify Phase-1 logic
 * - Data flows through existing analytics pipelines
 */

import db from '../src/config/database';
const bcrypt = require('bcrypt');

// Demo User Credentials
const DEMO_EMAIL = 'demo@wealthmax.in';
const DEMO_PASSWORD = 'Demo@123';
const DEMO_MOBILE = '+919876543210';
const DEMO_NAME = 'Demo User';

// Mutual Fund Data (5 funds with different categories and performance)
const MUTUAL_FUNDS = [
    {
        isin: 'INF123456789',
        name: 'HDFC Top 100 Fund Direct Growth',
        type: 'MUTUAL_FUND' as const,
        ticker: null,
        current_nav: 58.42,
        nav_date: new Date('2026-01-21'),
        description: 'Large Cap Equity Fund',
        category: 'Large Cap',
        returns_pct: 12, // +12% returns
    },
    {
        isin: 'INF234567890',
        name: 'SBI Midcap Fund Direct Growth',
        type: 'MUTUAL_FUND' as const,
        ticker: null,
        current_nav: 45.87,
        nav_date: new Date('2026-01-21'),
        description: 'Mid Cap Equity Fund',
        category: 'Mid Cap',
        returns_pct: 18, // +18% strong returns
    },
    {
        isin: 'INF345678901',
        name: 'Axis Long Term Equity Fund Direct Growth',
        type: 'MUTUAL_FUND' as const,
        ticker: null,
        current_nav: 32.15,
        nav_date: new Date('2026-01-21'),
        description: 'ELSS Tax Saver Fund',
        category: 'ELSS',
        returns_pct: 10, // +10% moderate returns
    },
    {
        isin: 'INF456789012',
        name: 'ICICI Prudential Balanced Advantage Fund Direct Growth',
        type: 'MUTUAL_FUND' as const,
        ticker: null,
        current_nav: 28.93,
        nav_date: new Date('2026-01-21'),
        description: 'Hybrid Fund (Balanced)',
        category: 'Hybrid',
        returns_pct: 6, // +6% modest returns
    },
    {
        isin: 'INF567890123',
        name: 'HDFC Corporate Bond Fund Direct Growth',
        type: 'MUTUAL_FUND' as const,
        ticker: null,
        current_nav: 22.78,
        nav_date: new Date('2026-01-21'),
        description: 'Debt Fund (Corporate Bonds)',
        category: 'Debt',
        returns_pct: -2, // -2% loss for diversity
    },
];

// Equity Share Data (4 blue-chip stocks with different performance)
const EQUITY_SHARES = [
    {
        isin: 'INE002A01018',
        name: 'Reliance Industries Ltd',
        type: 'EQUITY' as const,
        ticker: 'RELIANCE',
        current_nav: 2845.50,
        nav_date: new Date('2026-01-21'),
        description: 'Diversified Conglomerate',
        returns_pct: 15, // +15% strong performance
    },
    {
        isin: 'INE040A01034',
        name: 'HDFC Bank Ltd',
        type: 'EQUITY' as const,
        ticker: 'HDFCBANK',
        current_nav: 1687.20,
        nav_date: new Date('2026-01-21'),
        description: 'Private Sector Bank',
        returns_pct: 8, // +8% moderate gains
    },
    {
        isin: 'INE009A01021',
        name: 'Infosys Ltd',
        type: 'EQUITY' as const,
        ticker: 'INFY',
        current_nav: 1456.75,
        nav_date: new Date('2026-01-21'),
        description: 'IT Services',
        returns_pct: 12, // +12% good performance
    },
    {
        isin: 'INE081A01012',
        name: 'Tata Steel Ltd',
        type: 'EQUITY' as const,
        ticker: 'TATASTEEL',
        current_nav: 142.30,
        nav_date: new Date('2026-01-21'),
        description: 'Steel Manufacturing',
        returns_pct: -5, // -5% loss (sector headwinds)
    },
];

interface HoldingConfig {
    isin: string;
    sipAmount?: number;
    sipMonths?: number;
    lumpSumCount?: number;
    lumpSumAmounts?: number[];
    startDate?: Date;
    equityPurchases?: Array<{ date: Date; amount: number; }>;
}

// Transaction configurations for each holding
const HOLDING_CONFIGS: HoldingConfig[] = [
    // Mutual Funds
    {
        isin: 'INF123456789', // Large Cap
        sipAmount: 5000,
        sipMonths: 36, // 3 years of SIPs
        lumpSumCount: 2,
        lumpSumAmounts: [50000, 30000],
        startDate: new Date('2023-01-05'),
    },
    {
        isin: 'INF234567890', // Mid Cap
        sipAmount: 3000,
        sipMonths: 24, // 2 years of SIPs
        lumpSumCount: 1,
        lumpSumAmounts: [40000],
        startDate: new Date('2024-01-05'),
    },
    {
        isin: 'INF345678901', // ELSS
        sipAmount: 10000,
        sipMonths: 48, // 4 years of SIPs
        lumpSumCount: 1,
        lumpSumAmounts: [150000],
        startDate: new Date('2022-01-05'),
    },
    {
        isin: 'INF456789012', // Hybrid
        sipAmount: 4000,
        sipMonths: 36, // 3 years of SIPs
        lumpSumCount: 1,
        lumpSumAmounts: [25000],
        startDate: new Date('2023-01-05'),
    },
    {
        isin: 'INF567890123', // Debt
        sipAmount: 7000,
        sipMonths: 30, // 2.5 years of SIPs
        lumpSumCount: 2,
        lumpSumAmounts: [60000, 40000],
        startDate: new Date('2023-07-05'),
    },
    // Equity Shares
    {
        isin: 'INE002A01018', // Reliance
        equityPurchases: [
            { date: new Date('2024-03-15'), amount: 50000 },
            { date: new Date('2024-09-20'), amount: 40000 },
            { date: new Date('2025-06-10'), amount: 45000 },
        ],
    },
    {
        isin: 'INE040A01034', // HDFC Bank
        equityPurchases: [
            { date: new Date('2023-08-12'), amount: 35000 },
            { date: new Date('2024-02-18'), amount: 30000 },
            { date: new Date('2024-10-05'), amount: 25000 },
            { date: new Date('2025-07-22'), amount: 40000 },
        ],
    },
    {
        isin: 'INE009A01021', // Infosys
        equityPurchases: [
            { date: new Date('2024-04-08'), amount: 30000 },
            { date: new Date('2024-11-15'), amount: 35000 },
            { date: new Date('2025-08-25'), amount: 28000 },
        ],
    },
    {
        isin: 'INE081A01012', // Tata Steel
        equityPurchases: [
            { date: new Date('2024-06-20'), amount: 20000 },
            { date: new Date('2025-03-10'), amount: 22000 },
        ],
    },
];

/**
 * Calculate historical NAV/Price based on returns
 */
function calculateHistoricalNav(currentNav: number, returnsPct: number, monthsAgo: number): number {
    // Simple linear approximation for historical NAV
    const totalReturn = returnsPct / 100;
    const monthlyReturn = totalReturn / (monthsAgo || 1);
    const historicalNav = currentNav / (1 + totalReturn - (monthlyReturn * monthsAgo));
    return parseFloat(historicalNav.toFixed(2));
}

/**
 * Main seeding function
 */
async function seedDemoPortfolio() {
    console.log('🌱 Starting Demo Portfolio Seeding...\n');

    try {
        // Step 1: Check if demo user already exists
        console.log('1️⃣  Checking for existing demo user...');
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [DEMO_EMAIL]
        );

        let userId: string;

        if (existingUser.rows.length > 0) {
            userId = existingUser.rows[0].id;
            console.log(`   ✓ Demo user already exists (ID: ${userId})\n`);
        } else {
            // Create demo user
            console.log('   Creating new demo user...');
            const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
            const userResult = await db.query(
                `INSERT INTO users (email, mobile, name, password_hash, role, is_email_verified, is_mobile_verified)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id`,
                [DEMO_EMAIL, DEMO_MOBILE, DEMO_NAME, passwordHash, 'user', true, true]
            );
            userId = userResult.rows[0].id;
            console.log(`   ✓ Demo user created (ID: ${userId})\n`);
        }

        // Step 2: Create/Update financial profile
        console.log('2️⃣  Creating/Updating financial profile...');
        const existingProfile = await db.query(
            'SELECT id FROM profiles WHERE user_id = $1',
            [userId]
        );

        if (existingProfile.rows.length > 0) {
            // Update profile
            await db.query(
                `UPDATE profiles SET 
                    age = $2, 
                    employment_type = $3,
                    gross_income = $4,
                    monthly_emi = $5,
                    fixed_expenses = $6,
                    insurance_premium = $7,
                    total_liabilities = $8,
                    existing_assets = $9,
                    risk_score = $10,
                    risk_class = $11,
                    emergency_fund_amount = $12,
                    dependents = $13,
                    insurance_cover = $14,
                    updated_at = NOW()
                 WHERE user_id = $1`,
                [
                    userId,
                    32, // age
                    'Salaried',
                    1500000, // ₹15L gross income
                    15000, // ₹15k EMI
                    35000, // ₹35k fixed expenses
                    5000, // ₹5k insurance premium
                    500000, // ₹5L liabilities
                    800000, // ₹8L existing assets
                    55, // moderate risk score
                    'Moderate',
                    300000, // ₹3L emergency fund
                    2, // 2 dependents
                    10000000, // ₹1Cr insurance cover
                ]
            );
            console.log('   ✓ Profile updated\n');
        } else {
            // Create new profile
            await db.query(
                `INSERT INTO profiles (
                    user_id, age, employment_type, gross_income, monthly_emi, 
                    fixed_expenses, insurance_premium, total_liabilities, existing_assets,
                    risk_score, risk_class, health_score, emergency_fund_amount,
                    dependents, insurance_cover
                 )
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
                [
                    userId,
                    32, // age
                    'Salaried',
                    1500000, // ₹15L gross income
                    15000, // ₹15k EMI
                    35000, // ₹35k fixed expenses
                    5000, // ₹5k insurance premium
                    500000, // ₹5L liabilities
                    800000, // ₹8L existing assets
                    55, // moderate risk score
                    'Moderate',
                    72, // health score
                    300000, // ₹3L emergency fund
                    2, // 2 dependents
                    10000000, // ₹1Cr insurance cover
                ]
            );
            console.log('   ✓ Profile created\n');
        }

        // Step 3: Create asset metadata (Mutual Funds + Equities)
        console.log('3️⃣  Creating asset metadata...');

        const allAssets = [...MUTUAL_FUNDS, ...EQUITY_SHARES];
        let metadataCount = 0;

        for (const asset of allAssets) {
            const existing = await db.query(
                'SELECT isin FROM holding_metadata WHERE isin = $1',
                [asset.isin]
            );

            if (existing.rows.length === 0) {
                await db.query(
                    `INSERT INTO holding_metadata (isin, name, type, ticker, current_nav, nav_date, description)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        asset.isin,
                        asset.name,
                        asset.type,
                        asset.ticker,
                        asset.current_nav,
                        asset.nav_date,
                        asset.description,
                    ]
                );
                metadataCount++;
            }
        }
        console.log(`   ✓ ${metadataCount} new asset metadata entries created\n`);

        // Step 4: Get or create user portfolio
        console.log('4️⃣  Setting up user portfolio...');
        let portfolioResult = await db.query(
            'SELECT id FROM user_portfolios WHERE user_id = $1',
            [userId]
        );

        let portfolioId: string;
        if (portfolioResult.rows.length > 0) {
            portfolioId = portfolioResult.rows[0].id;
            console.log(`   ✓ Using existing portfolio (ID: ${portfolioId})\n`);
        } else {
            const newPortfolio = await db.query(
                `INSERT INTO user_portfolios (user_id, portfolio_alias, source)
                 VALUES ($1, $2, $3)
                 RETURNING id`,
                [userId, 'Demo Portfolio', 'MANUAL']
            );
            portfolioId = newPortfolio.rows[0].id;
            console.log(`   ✓ Portfolio created (ID: ${portfolioId})\n`);
        }

        // Step 5: Generate transactions and holdings
        console.log('5️⃣  Generating transactions...');
        let totalTransactions = 0;
        let totalInvested = 0;
        let totalCurrentValue = 0;

        for (const config of HOLDING_CONFIGS) {
            const asset = allAssets.find(a => a.isin === config.isin);
            if (!asset) continue;

            console.log(`   Processing ${asset.name}...`);

            const transactions: Array<{
                date: Date;
                type: 'SIP' | 'BUY';
                amount: number;
                nav: number;
                units: number;
            }> = [];

            // Generate SIP transactions for mutual funds
            if (config.sipAmount && config.sipMonths && config.startDate) {
                for (let i = 0; i < config.sipMonths; i++) {
                    const txDate = new Date(config.startDate);
                    txDate.setMonth(txDate.getMonth() + i);

                    // Calculate historical NAV
                    const monthsFromNow = Math.floor(
                        (new Date().getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
                    );
                    const historicalNav = calculateHistoricalNav(
                        asset.current_nav,
                        asset.returns_pct || 0,
                        monthsFromNow
                    );

                    const units = config.sipAmount / historicalNav;

                    transactions.push({
                        date: txDate,
                        type: 'SIP',
                        amount: config.sipAmount,
                        nav: historicalNav,
                        units: parseFloat(units.toFixed(4)),
                    });
                }
            }

            // Generate lump-sum transactions for mutual funds
            if (config.lumpSumCount && config.lumpSumAmounts && config.startDate) {
                for (let i = 0; i < config.lumpSumCount; i++) {
                    const txDate = new Date(config.startDate);
                    txDate.setMonth(txDate.getMonth() + ((config.sipMonths || 0) / (config.lumpSumCount + 1)) * (i + 1));

                    const monthsFromNow = Math.floor(
                        (new Date().getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
                    );
                    const historicalNav = calculateHistoricalNav(
                        asset.current_nav,
                        asset.returns_pct || 0,
                        monthsFromNow
                    );

                    const amount = config.lumpSumAmounts[i];
                    const units = amount / historicalNav;

                    transactions.push({
                        date: txDate,
                        type: 'BUY',
                        amount,
                        nav: historicalNav,
                        units: parseFloat(units.toFixed(4)),
                    });
                }
            }

            // Generate equity purchases
            if (config.equityPurchases) {
                for (const purchase of config.equityPurchases) {
                    const monthsFromNow = Math.floor(
                        (new Date().getTime() - purchase.date.getTime()) / (1000 * 60 * 60 * 24 * 30)
                    );
                    const historicalPrice = calculateHistoricalNav(
                        asset.current_nav,
                        asset.returns_pct || 0,
                        monthsFromNow
                    );

                    const units = purchase.amount / historicalPrice;

                    transactions.push({
                        date: purchase.date,
                        type: 'BUY',
                        amount: purchase.amount,
                        nav: historicalPrice,
                        units: parseFloat(units.toFixed(4)),
                    });
                }
            }

            // Insert all transactions
            let holdingUnits = 0;
            let holdingInvested = 0;

            for (const tx of transactions) {
                // Check for duplicate
                const duplicate = await db.query(
                    `SELECT id FROM portfolio_transactions 
                     WHERE portfolio_id = $1 AND isin = $2 AND transaction_date = $3 AND amount = $4`,
                    [portfolioId, config.isin, tx.date, tx.amount]
                );

                if (duplicate.rows.length === 0) {
                    await db.query(
                        `INSERT INTO portfolio_transactions 
                         (portfolio_id, isin, transaction_date, transaction_type, units, amount, nav, source)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [portfolioId, config.isin, tx.date, tx.type, tx.units, tx.amount, tx.nav, 'MANUAL']
                    );
                    totalTransactions++;
                }

                holdingUnits += tx.units;
                holdingInvested += tx.amount;
            }

            totalInvested += holdingInvested;

            // Calculate current valuation
            const currentValuation = holdingUnits * asset.current_nav;
            totalCurrentValue += currentValuation;

            // Insert or update holding
            const existingHolding = await db.query(
                'SELECT id FROM portfolio_holdings WHERE portfolio_id = $1 AND isin = $2',
                [portfolioId, config.isin]
            );

            const averagePrice = holdingInvested / holdingUnits;

            if (existingHolding.rows.length > 0) {
                await db.query(
                    `UPDATE portfolio_holdings 
                     SET quantity = $3, average_price = $4, last_valuation = $5, updated_at = NOW()
                     WHERE id = $1 AND portfolio_id = $2`,
                    [
                        existingHolding.rows[0].id,
                        portfolioId,
                        parseFloat(holdingUnits.toFixed(4)),
                        parseFloat(averagePrice.toFixed(2)),
                        parseFloat(currentValuation.toFixed(2)),
                    ]
                );
            } else {
                await db.query(
                    `INSERT INTO portfolio_holdings (portfolio_id, isin, quantity, average_price, last_valuation, source)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        portfolioId,
                        config.isin,
                        parseFloat(holdingUnits.toFixed(4)),
                        parseFloat(averagePrice.toFixed(2)),
                        parseFloat(currentValuation.toFixed(2)),
                        'MANUAL',
                    ]
                );
            }

            console.log(`      ✓ ${transactions.length} transactions, ${holdingUnits.toFixed(2)} units`);
        }

        console.log(`   ✓ Total ${totalTransactions} transactions created\n`);

        // Summary
        console.log('✅ SEEDING COMPLETE!\n');
        console.log('📊 Summary:');
        console.log(`   - Demo Email: ${DEMO_EMAIL}`);
        console.log(`   - Demo Password: ${DEMO_PASSWORD}`);
        console.log(`   - Total Holdings: ${HOLDING_CONFIGS.length} (5 MFs + 4 Equities)`);
        console.log(`   - Total Transactions: ${totalTransactions}`);
        console.log(`   - Total Invested: ₹${totalInvested.toLocaleString('en-IN')}`);
        console.log(`   - Current Value: ₹${totalCurrentValue.toLocaleString('en-IN')}`);
        console.log(`   - Overall Returns: ₹${(totalCurrentValue - totalInvested).toLocaleString('en-IN')} (${((totalCurrentValue - totalInvested) / totalInvested * 100).toFixed(2)}%)`);
        console.log('\n🎉 You can now login with the demo credentials!');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    } finally {
        await db.close();
    }
}

// Run the seeding script
seedDemoPortfolio()
    .then(() => {
        console.log('\n✨ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });
