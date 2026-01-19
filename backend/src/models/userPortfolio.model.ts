import db from '../config/database';

export interface UserPortfolio {
    id: string;
    user_id: string;
    portfolio_alias: string;
    source?: string;
    created_at: Date;
    updated_at: Date;
}

export class UserPortfolioModel {
    static async findById(id: string): Promise<UserPortfolio | null> {
        const result = await db.query('SELECT * FROM user_portfolios WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    static async findByUserId(userId: string): Promise<UserPortfolio[]> {
        const result = await db.query(
            'SELECT * FROM user_portfolios WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    }

    static async create(portfolio: Partial<UserPortfolio>): Promise<UserPortfolio> {
        const { user_id, portfolio_alias, source } = portfolio;
        const result = await db.query(
            `INSERT INTO user_portfolios (user_id, portfolio_alias, source)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [user_id, portfolio_alias || 'Main Portfolio', source]
        );
        return result.rows[0];
    }

    static async updateAlias(id: string, alias: string): Promise<UserPortfolio | null> {
        const result = await db.query(
            `UPDATE user_portfolios 
             SET portfolio_alias = $1, updated_at = NOW() 
             WHERE id = $2 
             RETURNING *`,
            [alias, id]
        );
        return result.rows[0] || null;
    }

    static async delete(id: string): Promise<boolean> {
        const result = await db.query('DELETE FROM user_portfolios WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
