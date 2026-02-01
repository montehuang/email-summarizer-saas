"use client";

import { useActionState, useState, useEffect } from "react";
import { updateUserPreferences } from "./actions";
import styles from "./dashboard.module.css";

const initialState = {
    message: null,
    error: null,
    success: false,
};

export default function PreferencesForm({ preferences }) {
    const [state, formAction, isPending] = useActionState(updateUserPreferences, initialState);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Detect browser timezone on mount
    const browserTimezone = typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
    const displayTimezone = (preferences.timezone && preferences.timezone !== 'UTC')
        ? preferences.timezone
        : browserTimezone;

    return (
        <div className={`${styles.formPanel} glass-panel`}>
            <h2 className={styles.sectionTitle}>Notification Settings</h2>
            <form action={formAction}>
                <input type="hidden" name="timezone" value={browserTimezone} />

                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.5rem', textAlign: 'right' }}>
                    Current Timezone: <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{mounted ? displayTimezone : "Loading..."}</span>
                    {mounted && (preferences.timezone === 'UTC' || !preferences.timezone ? ' (Detected)' : ' (Saved)')}
                </p>

                <div className={styles.field}>
                    <label className={styles.label}>Summarization Language</label>
                    <select name="language" className={styles.select} defaultValue={preferences.language}>
                        <option value="zh">Chinese (Simplified)</option>
                        <option value="en">English</option>
                    </select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Notification Channel</label>
                    <select name="notificationChannel" className={styles.select} defaultValue={preferences.notificationChannel}>
                        <option value="slack">Slack Webhook</option>
                        <option value="whatsapp">WhatsApp Business</option>
                        <option value="telegram">Telegram Bot</option>
                    </select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Telegram Chat ID</label>
                    <input
                        name="telegramChatId"
                        type="text"
                        className={styles.input}
                        placeholder="e.g. 123456789"
                        defaultValue={preferences.telegramChatId || ""}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                        Get your ID by messaging <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>@userinfobot</a>
                    </p>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Slack Webhook URL</label>
                    <input
                        name="slackWebhookUrl"
                        type="url"
                        className={styles.input}
                        placeholder="https://hooks.slack.com/services/..."
                        defaultValue={preferences.slackWebhookUrl || ""}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>WhatsApp Phone Number</label>
                    <input
                        name="whatsappPhone"
                        type="tel"
                        className={styles.input}
                        placeholder="+86138..."
                        defaultValue={preferences.whatsappPhone || ""}
                    />
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: '2rem 0' }} />

                <h2 className={styles.sectionTitle}>Automation Settings</h2>

                <div className={styles.field} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                        type="checkbox"
                        name="automationEnabled"
                        id="automationEnabled"
                        defaultChecked={preferences.automationEnabled}
                        style={{ width: '20px', height: '20px' }}
                    />
                    <label htmlFor="automationEnabled" className={styles.label} style={{ marginBottom: 0 }}>
                        Enable Daily Automated Summaries
                    </label>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Preferred Summary Time (Daily)</label>
                    <input
                        name="summaryTime"
                        type="time"
                        className={styles.input}
                        defaultValue={preferences.summaryTime || "08:00"}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                        MailAI will automatically fetch and summarize your emails at this time every day.
                    </p>
                </div>

                <button type="submit" className={styles.saveBtn} disabled={isPending}>
                    {isPending ? "Saving..." : "Save Preferences"}
                </button>

                {state?.success && (
                    <p className={`${styles.statusMessage} ${styles.success}`}>{state.message}</p>
                )}
                {state?.error && (
                    <p className={`${styles.statusMessage} ${styles.error}`}>{state.error}</p>
                )}
            </form>
        </div>
    );
}
