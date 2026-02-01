"use client";

import { useState } from "react";
import { runEmailSummarization } from "./actions";
import styles from "./dashboard.module.css";

import ReactMarkdown from "react-markdown";

export default function SummarizeButton() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSummarize = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await runEmailSummarization();
            setResult(res);
            if (!res.success) {
                console.error("Summarization Result Error:", res.error);
            }
        } catch (error) {
            console.error("Summarization Catch Error:", error);
            setResult({ success: false, error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <button
                onClick={handleSummarize}
                disabled={loading}
                className="glow-btn"
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            >
                {loading ? "Processing Inbox..." : "⚡ Fetch & Summarize Emails"}
            </button>

            {result && (
                <div className={`${styles.formPanel} glass-panel`} style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
                    {result.success ? (
                        <div>
                            <h3 className={styles.success} style={{ marginBottom: '1rem' }}>
                                ✓ {result.message || `Summarized ${result.count} emails!`}
                            </h3>
                            {result.summary && (
                                <div className={styles.markdownContent} style={{
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    color: 'var(--text-main)',
                                    background: 'var(--gradient-surface)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-glass)'
                                }}>
                                    <ReactMarkdown>{result.summary}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    ) : (
                        <h3 className={styles.error}>Error: {result.error}</h3>
                    )}
                </div>
            )}
        </div>
    );
}
