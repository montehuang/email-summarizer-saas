import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserPreferences, updateUserPreferences, getSummaryHistory } from "./actions";
import styles from "./dashboard.module.css";
import UserMenu from "@/components/UserMenu";
import SummarizeButton from "./SummarizeButton";
import SummaryHistory from "./SummaryHistory";
import PreferencesForm from "./PreferencesForm";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect("/auth/signin");

    const preferences = await getUserPreferences();
    const history = await getSummaryHistory();

    return (
        <div className={styles.container}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <span className="gradient-text">MailAI</span> Dashboard
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ThemeToggle />
                    <UserMenu />
                </div>
            </nav>

            <header className={styles.header}>
                <h1 className={`${styles.title} gradient-text`}>Welcome back, {session.user.name.split(' ')[0]}!</h1>
            </header>

            <div className={styles.grid}>
                <aside>
                    <div className={`${styles.profileCard} glass-panel`}>
                        <img
                            src={session.user.image}
                            alt={session.user.name}
                            className={styles.avatar}
                        />
                        <h2 className={styles.userName}>{session.user.name}</h2>
                        <p className={styles.userEmail}>{session.user.email}</p>
                    </div>

                    <div>
                        <h2 className={styles.sectionTitle}>Manual Fetch</h2>
                        <div className={`${styles.formPanel} glass-panel`}>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                                Click the button below to immediately fetch unread emails and generate a summary report.
                            </p>
                            <SummarizeButton />
                        </div>

                        <SummaryHistory history={history} />
                    </div>
                </aside>

                <main>
                    <PreferencesForm preferences={preferences} />
                </main>
            </div>
        </div>
    );
}
