/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    // Table: holding_metadata (Master table for securities)
    pgm.createTable('holding_metadata', {
        isin: { type: 'varchar(12)', primaryKey: true },
        name: { type: 'varchar(255)', notNull: true },
        type: {
            type: 'varchar(20)',
            notNull: true,
            check: "type IN ('EQUITY', 'MUTUAL_FUND')"
        },
        ticker: { type: 'varchar(50)' },
        current_nav: { type: 'decimal(15,4)' },
        nav_date: { type: 'timestamptz' },
        description: { type: 'text' },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp')
        },
        updated_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp')
        }
    });

    // Table: user_portfolios (Container for user holdings)
    pgm.createTable('user_portfolios', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
        user_id: {
            type: 'uuid',
            notNull: true,
            references: '"users"',
            onDelete: 'CASCADE'
        },
        portfolio_alias: { type: 'varchar(100)', default: 'Main Portfolio' },
        source: { type: 'varchar(50)' },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp')
        },
        updated_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp')
        }
    });

    // Table: portfolio_holdings (Link table between portfolio and securities)
    pgm.createTable('portfolio_holdings', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
        portfolio_id: {
            type: 'uuid',
            notNull: true,
            references: '"user_portfolios"',
            onDelete: 'CASCADE'
        },
        isin: {
            type: 'varchar(12)',
            notNull: true,
            references: '"holding_metadata"',
            onDelete: 'RESTRICT'
        },
        quantity: { type: 'decimal(20,4)', notNull: true },
        average_price: { type: 'decimal(15,4)' },
        last_valuation: { type: 'decimal(15,2)' },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp')
        },
        updated_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp')
        }
    });

    // Indexes
    pgm.createIndex('user_portfolios', 'user_id');
    pgm.createIndex('portfolio_holdings', 'portfolio_id');
    pgm.createIndex('portfolio_holdings', 'isin');
};

exports.down = (pgm) => {
    pgm.dropTable('portfolio_holdings');
    pgm.dropTable('user_portfolios');
    pgm.dropTable('holding_metadata');
};
