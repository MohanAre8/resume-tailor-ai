// Save this as: src/app/privacy/page.tsx

export default function PrivacyPolicy() {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0a0f1e',
            color: '#e2e8f0',
            fontFamily: "'Inter', sans-serif",
            padding: '60px 24px',
        }}>
            <div style={{
                maxWidth: '760px',
                margin: '0 auto',
            }}>

                {/* Header */}
                <div style={{ marginBottom: '48px' }}>
                    <a href="/" style={{
                        color: '#4ade80',
                        textDecoration: 'none',
                        fontSize: '14px',
                        letterSpacing: '0.05em',
                    }}>
                        ← Back to Resume Tailor AI
                    </a>
                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: '700',
                        marginTop: '24px',
                        marginBottom: '8px',
                        background: 'linear-gradient(135deg, #4ade80, #22d3ee)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Privacy Policy
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>
                        Last updated: March 2026
                    </p>
                </div>

                {/* Intro */}
                <Section>
                    <p style={{ color: '#94a3b8', lineHeight: '1.8', fontSize: '16px' }}>
                        Resume Tailor AI is built on a simple principle: your data belongs to you, not us.
                        This page explains exactly what we collect, what we don't, and how your information is handled.
                    </p>
                </Section>

                {/* What we don't collect */}
                <Section title="What We Do Not Collect">
                    <p style={{ color: '#94a3b8', lineHeight: '1.8' }}>
                        We do not store any of the following on our servers:
                    </p>
                    <ul style={{ color: '#94a3b8', lineHeight: '2', paddingLeft: '20px', marginTop: '12px' }}>
                        <li>Your resume content</li>
                        <li>Your job descriptions</li>
                        <li>Your name, email, or personal details beyond what Google provides for sign-in</li>
                        <li>Any files you upload or select from Google Drive</li>
                        <li>Your application tracking data</li>
                    </ul>
                    <p style={{ color: '#94a3b8', lineHeight: '1.8', marginTop: '12px' }}>
                        We have no central database. None of your data is persisted on our infrastructure after your session ends.
                    </p>
                </Section>

                {/* What we do */}
                <Section title="What We Do">
                    <p style={{ color: '#94a3b8', lineHeight: '1.8' }}>
                        When you use Resume Tailor AI, here is what happens:
                    </p>
                    <ul style={{ color: '#94a3b8', lineHeight: '2', paddingLeft: '20px', marginTop: '12px' }}>
                        <li>Your resume is temporarily processed in memory to generate a tailored version</li>
                        <li>The tailored resume is saved directly to <strong style={{ color: '#e2e8f0' }}>your own Google Drive</strong> — not ours</li>
                        <li>Application details are logged to <strong style={{ color: '#e2e8f0' }}>your own Google Sheets</strong> — not ours</li>
                        <li>All processing happens in a serverless environment and is discarded immediately after</li>
                    </ul>
                </Section>

                {/* Google OAuth */}
                <Section title="Google Sign-In and Permissions">
                    <p style={{ color: '#94a3b8', lineHeight: '1.8' }}>
                        We use Google OAuth 2.0 for authentication. We request only the minimum permissions needed:
                    </p>
                    <ul style={{ color: '#94a3b8', lineHeight: '2', paddingLeft: '20px', marginTop: '12px' }}>
                        <li>Google Drive — to read your resume file and save the tailored version</li>
                        <li>Google Sheets — to log your application tracking data</li>
                    </ul>
                    <p style={{ color: '#94a3b8', lineHeight: '1.8', marginTop: '12px' }}>
                        We do not request access to Gmail, Contacts, Calendar, or any other Google services.
                        You can revoke access at any time from your{' '}
                        <a
                            href="https://myaccount.google.com/permissions"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#4ade80' }}
                        >
                            Google Account permissions page
                        </a>.
                    </p>
                </Section>

                {/* Third party */}
                <Section title="Third Party Services">
                    <p style={{ color: '#94a3b8', lineHeight: '1.8' }}>
                        Resume Tailor AI uses the following external services during processing:
                    </p>
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { name: 'Groq API', detail: 'LLM inference for resume improvement and scoring. Resume content is sent over encrypted HTTPS. Groq does not train on user data.' },
                            { name: 'Tavily API', detail: 'Web search for company research. Only the company name and job role are sent — no personal data.' },
                            { name: 'Vercel', detail: 'Hosting and serverless infrastructure. No user data is logged in production.' },
                        ].map(({ name, detail }) => (
                            <div key={name} style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '10px',
                                padding: '16px 20px',
                            }}>
                                <p style={{ color: '#e2e8f0', fontWeight: '600', marginBottom: '4px' }}>{name}</p>
                                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.7' }}>{detail}</p>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* GDPR */}
                <Section title="GDPR and Data Rights">
                    <p style={{ color: '#94a3b8', lineHeight: '1.8' }}>
                        Because we store no personal data on our servers, there is nothing to delete, export, or correct on our end.
                        Your resume files and tracking sheets live entirely in your Google account — you own and control them directly.
                        To delete your data, simply delete the files from your Google Drive and Sheets.
                    </p>
                </Section>

                {/* Contact */}
                <Section title="Contact">
                    <p style={{ color: '#94a3b8', lineHeight: '1.8' }}>
                        If you have any questions about this privacy policy or how the app works, feel free to reach out at{' '}
                        <a href="mailto:mohan.areti7@gmail.com" style={{ color: '#4ade80' }}>
                            mohan.areti7@gmail.com
                        </a>
                    </p>
                </Section>

                {/* Footer */}
                <div style={{
                    marginTop: '60px',
                    paddingTop: '24px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    color: '#334155',
                    fontSize: '13px',
                    textAlign: 'center',
                }}>
                    Resume Tailor AI — Privacy First Workflow
                </div>

            </div>
        </div>
    );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <div style={{
            marginBottom: '40px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '28px 32px',
        }}>
            {title && (
                <h2 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#e2e8f0',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
}