"use client";

import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import { deleteSummaryHistory, clearAllSummaryHistory } from "./actions";

export default function SummaryHistory({ history }) {
    const [mounted, setMounted] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isClearing, setIsClearing] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleDeleteSingle = async (id) => {
        if (!confirm("Are you sure you want to delete this record?")) return;
        setDeletingId(id);
        try {
            await deleteSummaryHistory(id);
        } catch (err) {
            alert("Failed to delete record");
        } finally {
            setDeletingId(null);
        }
    };

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to clear ALL history records? This cannot be undone.")) return;
        setIsClearing(true);
        try {
            await clearAllSummaryHistory();
        } catch (err) {
            alert("Failed to clear history");
        } finally {
            setIsClearing(false);
        }
    };

    if (!history || history.length === 0) {
        return (
            <div className={`${styles.formPanel} glass-panel`} style={{ marginTop: '2rem' }}>
                <h2 className={styles.sectionTitle}>Processing History</h2>
                <p style={{ color: 'var(--text-dim)', textAlign: 'center' }}>No history records yet.</p>
            </div>
        );
    }

    return (
        <div className={`${styles.formPanel} glass-panel`} style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Processing History</h2>
                <button
                    onClick={handleClearAll}
                    disabled={isClearing}
                    style={{
                        background: 'rgba(248, 113, 113, 0.1)',
                        border: '1px solid #f87171',
                        color: '#f87171',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(248, 113, 113, 0.2)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(248, 113, 113, 0.1)'}
                >
                    {isClearing ? "..." : "Clear All"}
                </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem' }}>Time</th>
                            <th style={{ padding: '0.75rem' }}>Result</th>
                            <th style={{ padding: '0.75rem' }}>Emails</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((record) => (
                            <tr key={record.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                <td style={{ padding: '0.75rem' }}>
                                    {mounted ? new Date(record.createdAt).toLocaleString() : "Loading..."}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <span style={{
                                        color: record.result === "Success" ? "#4ade80" : "#f87171"
                                    }}>
                                        {record.result}
                                    </span>
                                </td>
                                <td style={{ padding: '0.75rem' }}>{record.count}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleDeleteSingle(record.id)}
                                        disabled={deletingId === record.id}
                                        style={{
                                            background: 'rgba(248, 113, 113, 0.1)',
                                            border: '1px solid rgba(248, 113, 113, 0.2)',
                                            color: '#f87171',
                                            cursor: 'pointer',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.target.style.background = 'rgba(248, 113, 113, 0.2)'}
                                        onMouseOut={(e) => e.target.style.background = 'rgba(248, 113, 113, 0.1)'}
                                        title="Delete this record"
                                    >
                                        {deletingId === record.id ? "..." : "Delete"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
