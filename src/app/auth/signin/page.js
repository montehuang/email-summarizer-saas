"use client";

import { signIn } from "next-auth/react";
import styles from "./signin.module.css";

export default function SignInPage() {
    return (
        <div className={styles.container}>
            <div className="glass-panel">
                <div className={styles.card}>
                    <h1 className="gradient-text">Welcome to MailAI</h1>
                    <p className={styles.subtitle}>Connect your account to start automating your inbox intelligence.</p>

                    <button
                        className="glow-btn"
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    >
                        Continue with Google
                    </button>

                    <div className={styles.divider}>
                        <span>Secured by Google OAuth2</span>
                    </div>

                    <p className={styles.legal}>
                        By signing in, you agree to our Terms of Service and Privacy Policy. We only request read-only access to your emails.
                    </p>
                </div>
            </div>
        </div>
    );
}
