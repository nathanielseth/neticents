import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { ThemeContext } from "../utils/themeContext";

export const ThemeProvider = ({ children }) => {
	const getInitialTheme = () => {
		const savedTheme = localStorage.getItem("theme");
		const systemPrefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)"
		).matches;
		return savedTheme || (systemPrefersDark ? "dark" : "light");
	};

	const [theme, setTheme] = useState(getInitialTheme);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () =>
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));

	const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme]);

	return (
		<ThemeContext.Provider value={contextValue}>
			{children}
		</ThemeContext.Provider>
	);
};

ThemeProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
