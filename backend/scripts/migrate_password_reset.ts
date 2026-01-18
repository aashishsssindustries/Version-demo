import db from '../src/config/database';

const migrate = async () => {
    try {
        console.log('Starting migration: Add Password Reset Fields...');

        // Check if columns exist
        const checkQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='reset_password_token';
        `;
        const checkResult = await db.query(checkQuery);

        if (checkResult.rows.length > 0) {
            console.log('Migration already applied. Skipping.');
        } else {
            // Apply Alter Table
            await db.query(`
                ALTER TABLE users 
                ADD COLUMN reset_password_token VARCHAR(255),
                ADD COLUMN reset_password_expires TIMESTAMP;
            `);
            console.log('✅ Successfully added reset_password_token and reset_password_expires columns.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit();
    }
};

migrate();
