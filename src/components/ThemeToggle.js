"use client";

import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
    const [theme, setTheme] = useState("dark"); // Default to dark for SSR consistency

    useEffect(() => {
        // Find current theme from attribute or localStorage
        const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
        setTheme(currentTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme-preference", newTheme);
    };

    const resetToAuto = () => {
        localStorage.removeItem("theme-preference");
        // Trigger a re-run of ThemeController logic by refreshing or just let it happen next hour
        // For better UX, we'll manually re-run time check
        const hour = new Date().getHours();
        const autoTheme = hour >= 6 && hour < 18 ? "light" : "dark";
        setTheme(autoTheme);
        document.documentElement.setAttribute("data-theme", autoTheme);
    };

    return (
        <div className={styles.container}>
            <button
                onClick={toggleTheme}
                className={styles.toggleBtn}
                title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            >
                {theme === "light" ? "🌙" : "☀️"}
            </button>
            <button
                onClick={resetToAuto}
                className={styles.autoBtn}
                title="Reset to Time-based Auto Theme"
            >
                Auto
            </button>
        </div>
    );
}
