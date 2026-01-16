import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, CheckCircle2, ArrowRight, Calculator, User, TrendingUp } from 'lucide-react';
import { profileService } from '../services/api';
import './Dashboard.css';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { InteractivePersonaCard } from '../components/dashboard/InteractivePersonaCard';
import { HealthScoreCard } from '../components/dashboard/HealthScoreCard';
import { ActionItemsGrid } from '../components/dashboard/ActionItemsGrid';
import { checkProfileCompletion, getFlowGuardMessage } from '../utils/flowGuard';

const Dashboard: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showWizard, setShowWizard] = useState(false);
    const [downloadingPDF, setDownloadingPDF] = useState(false);
    const [pdfError, setPdfError] = useState('');
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const profileData = await profileService.getProfile();
            setProfile(profileData);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setProfile(null);
            } else {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile data');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        if (searchParams.get('updated') === 'true') {
            setShowSuccessToast(true);
            setSearchParams({});
            setTimeout(() => setShowSuccessToast(false), 5000);
        }
    }, []);

    const handleWizardComplete = () => {
        setShowWizard(false);
        fetchProfile();
    };

    // Flow Guard Check
    const flowStatus = checkProfileCompletion(profile);

    const handleDownloadPDF = async () => {
        if (!flowStatus.canDownloadReport) {
            setPdfError(getFlowGuardMessage(flowStatus));
            return;
        }

        try {
            setDownloadingPDF(true);
            setPdfError('');

            const token = localStorage.getItem('token');
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}/pdf/advisory-report`,
                {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/pdf' }
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to generate PDF');
            }

            const blob = await response.blob();
            if (blob.type !== 'application/pdf') throw new Error('Invalid PDF received');

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `WealthMax_Advisory_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err: any) {
            console.error('PDF Download Error:', err);
            setPdfError(err.message || 'Failed to download PDF report');
        } finally {
            setDownloadingPDF(false);
        }
    };

    // Scroll to action items
    const scrollToActions = () => {
        document.querySelector('.action-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Render Primary CTA based on flow state
    const renderPrimaryCTA = () => {
        switch (flowStatus.primaryCTA) {
            case 'complete-profile':
                return (
                    <Link to="/profile" className="primary-cta incomplete">
                        <User size={18} />
                        Complete Profile
                        <ArrowRight size={16} />
                    </Link>
                );
            case 'improve-score':
                return (
                    <button className="primary-cta improve" onClick={scrollToActions}>
                        <TrendingUp size={18} />
                        Improve Score
                        <ArrowRight size={16} />
                    </button>
                );
            case 'use-calculator':
                return (
                    <Link to="/calculators" className="primary-cta calculator">
                        <Calculator size={18} />
                        Plan Your Goals
                        <ArrowRight size={16} />
                    </Link>
                );
        }
    };

    if (loading && !profile) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <span>Loading your financial dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <p>{error}</p>
                <button className="retry-btn" onClick={fetchProfile}>Retry</button>
            </div>
        );
    }

    const actionItems = profile?.action_items || [];

    return (
        <div className="dashboard-container">
            {/* Success Toast */}
            {showSuccessToast && (
                <div className="success-toast">
                    <CheckCircle2 size={20} />
                    <div>
                        <strong>Profile Updated!</strong>
                        <span>Your insights have been refreshed.</span>
                    </div>
                </div>
            )}

            {/* Sticky Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Dashboard</h1>
                    <p className="header-subtitle">
                        Overview of your financial health
                        {profile?.updated_at && (
                            <span className="last-updated">
                                • Last updated {new Date(profile.updated_at).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                        )}
                    </p>
                </div>
                <div className="header-right">
                    {/* Primary CTA */}
                    {renderPrimaryCTA()}

                    {/* Download Report */}
                    <button
                        className={`download-btn ${!flowStatus.canDownloadReport ? 'disabled' : ''}`}
                        onClick={handleDownloadPDF}
                        disabled={downloadingPDF || !flowStatus.canDownloadReport}
                        title={!flowStatus.canDownloadReport ? getFlowGuardMessage(flowStatus) : 'Download Advisory Report'}
                    >
                        <Download size={18} />
                        {downloadingPDF ? 'Generating...' : 'Download Report'}
                    </button>
                    {pdfError && <p className="pdf-error">{pdfError}</p>}
                </div>
            </header>

            {/* Profile Incomplete Alert */}
            {!flowStatus.isComplete && profile && (
                <div className="flow-alert">
                    <div className="alert-content">
                        <span className="alert-text">
                            Profile {flowStatus.percentage}% complete.
                            <strong> Missing: {flowStatus.missingFields.join(', ')}</strong>
                        </span>
                        <Link to="/profile" className="alert-cta">Complete Now →</Link>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Primary Insight Row - 2 Column Grid */}
                <section className="primary-insights">
                    <div className="insight-card">
                        <InteractivePersonaCard profile={profile} />
                    </div>
                    <div className="insight-card">
                        <HealthScoreCard profile={profile} />
                    </div>
                </section>

                {/* Action Intelligence Section */}
                <section className="action-section">
                    <ActionItemsGrid actionItems={actionItems} hasProfile={!!profile} />
                </section>
            </main>

            {/* Onboarding Wizard Modal */}
            {showWizard && (
                <OnboardingWizard
                    onClose={() => setShowWizard(false)}
                    onComplete={handleWizardComplete}
                />
            )}
        </div>
    );
};

export default Dashboard;
