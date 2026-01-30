/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    // Add remaining missing columns identified from error logs and code review
    pgm.addColumns('profiles', {
        employment_type: { type: 'varchar(50)', default: 'Salaried' },
        monthly_emi: { type: 'decimal(15,2)', default: 0 },
        insurance_premium: { type: 'decimal(15,2)', default: 0 }
    }, {
        ifNotExists: true
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('profiles', ['employment_type', 'monthly_emi', 'insurance_premium']);
};
