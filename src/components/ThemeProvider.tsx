import { useEffect, useState, useMemo, type ReactNode } from "react";
import { ThemeContext } from "../utils/themeContext";
import type { Theme } from "../types";

function getInitialTheme(): Theme {
	const savedTheme = localStorage.getItem("theme");

	if (savedTheme === "dark" || savedTheme === "light") {
		return savedTheme;
	}

	const systemPrefersDark = window.matchMedia(
		"(prefers-color-scheme: dark)",
	).matches;
	return systemPrefersDark ? "dark" : "light";
}

interface ThemeProviderProps {
	children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	};

	const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme]);

	return (
		<ThemeContext.Provider value={contextValue}>
			{children}
		</ThemeContext.Provider>
	);
};