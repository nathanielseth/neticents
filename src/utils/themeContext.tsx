import { createContext, use } from "react";
import type { ThemeContextType } from "../types";

export const ThemeContext = createContext<ThemeContextType | undefined>(
	undefined,
);

export const useTheme = (): ThemeContextType => {
	const context = use(ThemeContext);

	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
};