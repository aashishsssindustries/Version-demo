/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    // 1. Create missing score_history table
    // Checked: scoreHistory.model.ts uses: user_id, health_score, persona_label, created_at
    pgm.createTable('score_history', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
        user_id: {
            type: 'uuid',
            notNull: true,
            references: '"users"',
            onDelete: 'CASCADE',
        },
        health_score: { type: 'integer', notNull: true },
        persona_label: { type: 'varchar(100)' },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Create index for fast history retrieval
    pgm.createIndex('score_history', 'user_id');

    // 2. Add missing columns to profiles table
    // Checked: profile.controller.ts and profile.model.ts usage
    pgm.addColumn('profiles', {
        emergency_fund_amount: { type: 'decimal(15,2)', default: 0 },
        dependents: { type: 'integer', default: 0 },
        insurance_cover: { type: 'decimal(15,2)', default: 0 },
        pan_number: { type: 'varchar(20)' }
    });
};

exports.down = (pgm) => {
    pgm.dropColumn('profiles', ['emergency_fund_amount', 'dependents', 'insurance_cover', 'pan_number']);
    pgm.dropTable('score_history');
};
