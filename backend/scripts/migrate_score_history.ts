import db from '../src/config/database';

const migrate = async () => {
    try {
        console.log('Starting migration: Create score_history table...');

        // Check if table exists
        const checkQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name='score_history';
        `;
        const checkResult = await db.query(checkQuery);

        if (checkResult.rows.length > 0) {
            console.log('Migration already applied. Skipping.');
        } else {
            // Create score_history table
            await db.query(`
                CREATE TABLE score_history (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    health_score INTEGER NOT NULL,
                    persona_label VARCHAR(100),
                    created_at TIMESTAMP DEFAULT NOW()
                );
            `);

            // Create index for faster queries
            await db.query(`
                CREATE INDEX idx_score_history_user_date ON score_history(user_id, created_at DESC);
            `);

            console.log('✅ Successfully created score_history table and index.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit();
    }
};

migrate();
