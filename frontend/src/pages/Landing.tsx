import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    User, Zap, Trophy, ChevronDown, ChevronUp, Shield,
    Target, CheckCircle, ArrowRight, Menu, X
} from 'lucide-react';
import './Landing.css';

const Landing: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            question: "How secure is my financial data?",
            answer: "We use bank-level 256-bit encryption and never store your passwords. All data is encrypted at rest and in transit."
        },
        {
            question: "How does the 80% LTV process work?",
            answer: "You pledge your assets (mutual funds, stocks) as collateral. We provide up to 80% of their value as margin, allowing you to access liquidity without selling."
        },
        {
            question: "What asset classes do you support?",
            answer: "We support Mutual Funds, Stocks, Insurance products, and Options trading. More asset classes are being added regularly."
        },
        {
            question: "Is there a free trial?",
            answer: "Yes! Our Basic Advisor plan is completely free and includes automated financial profiling and health score tracking."
        }
    ];

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-logo">WealthMax</div>

                    {/* Desktop Menu */}
                    <div className="nav-links desktop-only">
                        <a href="#solutions">Solutions</a>
                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#faq">Resources</a>
                    </div>

                    <div className="nav-actions desktop-only">
                        <Link to="/login" className="btn-text">Log In</Link>
                        <Link to="/signup" className="btn-primary-pill">Get Started</Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn mobile-only"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        <a href="#solutions" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
                        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
                        <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                        <a href="#faq" onClick={() => setMobileMenuOpen(false)}>Resources</a>
                        <Link to="/login" className="btn-text" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                        <Link to="/signup" className="btn-primary-pill" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Your Automated<br />Financial Advisor
                        </h1>
                        <p className="hero-subtitle">
                            From data profiling to solution execution. We guide your financial
                            journey with precision and intelligence.
                        </p>
                        <div className="hero-ctas">
                            <Link to="/signup" className="btn-primary">
                                Get Your Health Score
                                <ArrowRight size={20} />
                            </Link>
                            <button className="btn-secondary">
                                View Live Demo
                            </button>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="dashboard-mockup">
                            <div className="mockup-header">
                                <div className="mockup-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span className="mockup-title">Dashboard</span>
                            </div>
                            <div className="mockup-content">
                                <div className="chart-placeholder">
                                    <div className="chart-bars">
                                        <div className="bar" style={{ height: '40%' }}></div>
                                        <div className="bar" style={{ height: '65%' }}></div>
                                        <div className="bar" style={{ height: '50%' }}></div>
                                        <div className="bar" style={{ height: '80%' }}></div>
                                        <div className="bar" style={{ height: '70%' }}></div>
                                        <div className="bar" style={{ height: '90%' }}></div>
                                    </div>
                                    <div className="chart-label">Portfolio Growth</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trusted By Strip */}
                <div className="trusted-section">
                    <p className="trusted-label">Trusted by financial leaders</p>
                    <div className="trusted-logos">
                        <div className="logo-placeholder">HDFC</div>
                        <div className="logo-placeholder">ICICI</div>
                        <div className="logo-placeholder">Zerodha</div>
                        <div className="logo-placeholder">Groww</div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="features-section">
                <div className="features-container">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <User size={28} />
                        </div>
                        <h3 className="feature-title">Smart Data Profiling</h3>
                        <p className="feature-description">
                            AI-driven analysis of your financial footprint. Get personalized
                            insights based on your unique situation.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <Zap size={28} />
                        </div>
                        <h3 className="feature-title">Automated Execution</h3>
                        <p className="feature-description">
                            Seamless investment in Insurance, Mutual Funds, and Options.
                            Your wealth, on autopilot.
                        </p>
                    </div>

                    <div className="feature-card feature-card-highlight">
                        <div className="feature-badge">Core Feature</div>
                        <div className="feature-icon">
                            <Trophy size={28} />
                        </div>
                        <h3 className="feature-title">Financial Health Score</h3>
                        <p className="feature-description">
                            Gamify your finances. Improve your score to unlock better rates
                            and premium financial products.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contrast Feature Section */}
            <section className="contrast-section">
                <div className="contrast-container">
                    <div className="contrast-visual">
                        <div className="ltv-card">
                            <div className="ltv-header">
                                <Shield size={32} />
                                <span className="ltv-badge">80% LTV</span>
                            </div>
                            <div className="ltv-stats">
                                <div className="stat">
                                    <span className="stat-label">Asset Value</span>
                                    <span className="stat-value">₹10,00,000</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Available Margin</span>
                                    <span className="stat-value highlight">₹8,00,000</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contrast-content">
                        <h2 className="contrast-title">
                            Unlock Liquidity with<br />
                            <span className="gradient-text">Option Wealth</span>
                        </h2>
                        <p className="contrast-description">
                            Get up to an 80% LTV margin against your pledged assets.
                            Don't sell your future to fund your present.
                        </p>
                        <ul className="contrast-benefits">
                            <li>
                                <CheckCircle size={20} />
                                <span>Retain ownership of your investments</span>
                            </li>
                            <li>
                                <CheckCircle size={20} />
                                <span>Access cash without selling assets</span>
                            </li>
                            <li>
                                <CheckCircle size={20} />
                                <span>Flexible repayment terms</span>
                            </li>
                        </ul>

                        <div className="testimonial-box">
                            <p className="testimonial-text">
                                "The 80% LTV was a game changer for my liquidity needs.
                                I kept my portfolio intact while accessing emergency funds."
                            </p>
                            <p className="testimonial-author">— Rajesh K., Pro Wealth Member</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section">
                <div className="pricing-header">
                    <h2 className="section-title">Everything You Need to Manage Wealth</h2>
                    <p className="section-subtitle">Choose the plan that fits your financial goals</p>
                </div>

                <div className="pricing-grid">
                    {/* Basic Plan */}
                    <div className="pricing-card">
                        <h3 className="plan-name">Basic Advisor</h3>
                        <div className="plan-price">
                            <span className="price">Free</span>
                            <span className="period">Forever</span>
                        </div>
                        <ul className="plan-features">
                            <li>
                                <CheckCircle size={18} />
                                <span>Financial Health Score</span>
                            </li>
                            <li>
                                <CheckCircle size={18} />
                                <span>Automated profiling</span>
                            </li>
                            <li>
                                <CheckCircle size={18} />
                                <span>Basic recommendations</span>
                            </li>
                            <li>
                                <CheckCircle size={18} />
                                <span>Risk assessment</span>
                            </li>
                            <li className="disabled">
                                <X size={18} />
                                <span>Option Wealth (80% LTV)</span>
                            </li>
                        </ul>
                        <Link to="/signup" className="btn-outline">Get Started</Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="pricing-card pricing-card-featured">
                        <div className="popular-badge">Most Popular</div>
                        <h3 className="plan-name">Pro Wealth</h3>
                        <div className="plan-price">
                            <span className="price">₹999</span>
                            <span className="period">per month</span>
                        </div>
                        <ul className="plan-features">
                            <li>
                                <CheckCircle size={18} />
                                <span>Everything in Basic</span>
                            </li>
                            <li>
                                <CheckCircle size={18} />
                                <span>Priority support</span>
                            </li>
                            <li>
                                <CheckCircle size={18} />
                                <span>Advanced analytics</span>
                            </li>
                            <li>
                                <CheckCircle size={18} />
                                <span>Custom portfolio strategies</span>
                            </li>
                            <li className="highlight">
                                <Target size={18} />
                                <span><strong>Option Wealth - 80% LTV Access</strong></span>
                            </li>
                        </ul>
                        <Link to="/signup" className="btn-primary-full">Start Pro Trial</Link>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="faq-section">
                <div className="faq-container">
                    <h2 className="section-title">Frequently Asked Questions</h2>
                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <div key={index} className="faq-item">
                                <button
                                    className="faq-question"
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span>{faq.question}</span>
                                    {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                {openFaq === index && (
                                    <div className="faq-answer">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-row">
                        <div className="footer-section">
                            <h4 className="footer-logo">WealthMax</h4>
                            <p className="footer-tagline">
                                Your automated financial advisor.<br />
                                Powered by AI, built for you.
                            </p>
                        </div>

                        <div className="footer-section">
                            <h5 className="footer-title">Solutions</h5>
                            <ul className="footer-links">
                                <li><a href="#profiling">Profiling</a></li>
                                <li><a href="#execution">Execution</a></li>
                                <li><a href="#option-wealth">Option Wealth</a></li>
                                <li><a href="#calculators">Calculators</a></li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h5 className="footer-title">Resources</h5>
                            <ul className="footer-links">
                                <li><a href="#blog">Blog</a></li>
                                <li><a href="#faq">FAQ</a></li>
                                <li><a href="#support">Support</a></li>
                                <li><a href="#api">API Docs</a></li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h5 className="footer-title">Ready to start?</h5>
                            <p className="footer-cta-text">
                                Get your financial health score in minutes.
                            </p>
                            <Link to="/signup" className="btn-primary-pill">
                                Get Started Free
                            </Link>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2024 WealthMax. All rights reserved.</p>
                        <div className="footer-legal">
                            <a href="#privacy">Privacy Policy</a>
                            <a href="#terms">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
