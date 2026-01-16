// Flow Guard Utilities - Single Source of Truth Enforcement

export interface ProfileCompletionResult {
    isComplete: boolean;
    percentage: number;
    missingFields: string[];
    canDownloadReport: boolean;
    canApplyToProfile: boolean;
    primaryCTA: 'complete-profile' | 'improve-score' | 'use-calculator';
}

const REQUIRED_FIELDS = [
    { key: 'gross_income', label: 'Annual Income' },
    { key: 'fixed_expenses', label: 'Monthly Expenses' },
    { key: 'monthly_emi', label: 'Monthly EMI' },
    { key: 'existing_assets', label: 'Savings/Investments' }
];

const OPTIONAL_FIELDS = [
    { key: 'insurance_premium', label: 'Insurance Premium' },
    { key: 'insurance_cover', label: 'Life Cover' },
    { key: 'emergency_fund_amount', label: 'Emergency Fund' }
];

export const checkProfileCompletion = (profile: any): ProfileCompletionResult => {
    if (!profile) {
        return {
            isComplete: false,
            percentage: 0,
            missingFields: REQUIRED_FIELDS.map(f => f.label),
            canDownloadReport: false,
            canApplyToProfile: false,
            primaryCTA: 'complete-profile'
        };
    }

    const allFields = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];
    const completedFields = allFields.filter(f => profile[f.key] && profile[f.key] > 0);
    const missingRequired = REQUIRED_FIELDS.filter(f => !profile[f.key] || profile[f.key] <= 0);

    const percentage = Math.round((completedFields.length / allFields.length) * 100);
    const isComplete = missingRequired.length === 0;

    // Determine primary CTA
    let primaryCTA: 'complete-profile' | 'improve-score' | 'use-calculator' = 'complete-profile';
    if (isComplete) {
        const healthScore = profile.health_score || 0;
        if (healthScore < 70) {
            primaryCTA = 'improve-score';
        } else {
            primaryCTA = 'use-calculator';
        }
    }

    return {
        isComplete,
        percentage,
        missingFields: missingRequired.map(f => f.label),
        canDownloadReport: isComplete,
        canApplyToProfile: isComplete,
        primaryCTA
    };
};

export const getFlowGuardMessage = (result: ProfileCompletionResult): string => {
    if (result.isComplete) return '';

    if (result.missingFields.length === 1) {
        return `Please add ${result.missingFields[0]} to continue.`;
    }

    return `Complete your profile (${result.missingFields.join(', ')}) to unlock this feature.`;
};
