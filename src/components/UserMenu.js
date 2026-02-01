"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import styles from "./UserMenu.module.css";

export default function UserMenu() {
    const { data: session, status } = useSession();

    if (status === "loading") return <div className={styles.loading}></div>;

    if (session) {
        return (
            <div className={styles.container}>
                <Link href="/dashboard" className={styles.dashboardLink}>
                    Dashboard
                </Link>
                <button onClick={() => signOut()} className={styles.logoutBtn}>
                    Sign Out
                </button>
            </div>
        );
    }

    return (
        <Link href="/auth/signin">
            <button className="glow-btn">Sign In</button>
        </Link>
    );
}
