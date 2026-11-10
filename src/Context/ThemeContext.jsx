import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'taskmaster-theme'; // 'light' | 'dark' | 'system'

function getSystemPreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system');
    const [resolvedTheme, setResolvedTheme] = useState(() =>
        theme === 'system' ? getSystemPreference() : theme
    );

    useEffect(() => {
        const applied = theme === 'system' ? getSystemPreference() : theme;
        setResolvedTheme(applied);
        document.documentElement.setAttribute('data-theme', applied);
    }, [theme]);

    useEffect(() => {
        if (theme !== 'system') return;

        // Si está en 'system', escuchamos cambios en vivo del SO
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            const applied = getSystemPreference();
            setResolvedTheme(applied);
            document.documentElement.setAttribute('data-theme', applied);
        };

        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [theme]);

    const setTheme = (value) => {
        setThemeState(value);
        localStorage.setItem(STORAGE_KEY, value);
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme debe usarse dentro de un ThemeProvider');
    }
    return context;
}