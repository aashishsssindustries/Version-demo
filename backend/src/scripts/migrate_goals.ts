
import db from '../config/database';

async function migrate_goals() {
    console.log('Starting Goals Migration...');
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS goals (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                name VARCHAR(255) NOT NULL,
                target_amount DECIMAL(15,2) NOT NULL,
                target_date DATE NOT NULL,
                current_amount DECIMAL(15,2) DEFAULT 0,
                monthly_contribution DECIMAL(15,2) DEFAULT 0,
                priority VARCHAR(20) DEFAULT 'Medium',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Created goals table');

    } catch (error) {
        console.error('Migration Failed:', error);
    } finally {
        process.exit();
    }
}

migrate_goals();
