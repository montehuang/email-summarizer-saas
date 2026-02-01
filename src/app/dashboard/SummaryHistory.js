"use client";

import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";

export default function SummaryHistory({ history }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
            <h2 className={styles.sectionTitle}>Processing History</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem' }}>Time</th>
                            <th style={{ padding: '0.75rem' }}>Result</th>
                            <th style={{ padding: '0.75rem' }}>Emails</th>
                            <th style={{ padding: '0.75rem' }}>Channels</th>
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
                                <td style={{ padding: '0.75rem' }}>
                                    <span style={{ opacity: 0.7 }}>{record.channels || "-"}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
