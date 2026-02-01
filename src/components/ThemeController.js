"use client";

import { useEffect } from "react";

export default function ThemeController() {
    useEffect(() => {
        const updateTheme = () => {
            const savedTheme = localStorage.getItem("theme-preference");
            if (savedTheme) {
                document.documentElement.setAttribute("data-theme", savedTheme);
                console.log(`[ThemeController] Using saved preference: ${savedTheme}`);
                return;
            }

            const hour = new Date().getHours();
            // Day mode: 6 AM to 6 PM (18:00)
            const theme = hour >= 6 && hour < 18 ? "light" : "dark";

            document.documentElement.setAttribute("data-theme", theme);
            console.log(`[ThemeController] System hour: ${hour}, Setting theme to: ${theme}`);
        };

        updateTheme();

        // Optional: Check every hour for changes if the app stays open
        const interval = setInterval(updateTheme, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return null; // This component doesn't render anything
}
