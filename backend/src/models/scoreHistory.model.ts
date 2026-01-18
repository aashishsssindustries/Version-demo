import db from '../config/database';

export interface ScoreHistoryEntry {
    id: string;
    user_id: string;
    health_score: number;
    persona_label?: string;
    created_at: Date;
}

export class ScoreHistoryModel {
    /**
     * Save a new score history entry
     */
    static async saveScore(userId: string, healthScore: number, personaLabel?: string): Promise<ScoreHistoryEntry> {
        const result = await db.query(
            `INSERT INTO score_history (user_id, health_score, persona_label)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [userId, healthScore, personaLabel]
        );
        return result.rows[0];
    }

    /**
     * Get score history for a user (last N entries)
     */
    static async getHistory(userId: string, limit: number = 30): Promise<ScoreHistoryEntry[]> {
        const result = await db.query(
            `SELECT * FROM score_history 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2`,
            [userId, limit]
        );
        return result.rows.reverse(); // Reverse to get chronological order (oldest first)
    }

    /**
     * Get the latest score entry for a user
     */
    static async getLatestScore(userId: string): Promise<ScoreHistoryEntry | null> {
        const result = await db.query(
            `SELECT * FROM score_history 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [userId]
        );
        return result.rows[0] || null;
    }
}
