import type { Sector, TaxRegime } from "../types";

export type DeductionKey =
	| "withholdingTax"
	| "percentageTax"
	| "gsis"
	| "sss"
	| "philHealth"
	| "pagIbig";

interface DeductionMeta {
	label: string;
	colorClass: string;
}

export const DEDUCTION_META: Record<DeductionKey, DeductionMeta> = {
	withholdingTax: {
		label: "Withholding Tax",
		colorClass: "bg-red-500",
	},
	percentageTax: {
		label: "Percentage Tax (3%)",
		colorClass: "bg-orange-500",
	},
	gsis: {
		label: "GSIS Contribution",
		colorClass: "bg-emerald-500",
	},
	sss: {
		label: "SSS Contribution",
		colorClass: "bg-emerald-500",
	},
	philHealth: {
		label: "PhilHealth Contribution",
		colorClass: "bg-purple-500",
	},
	pagIbig: {
		label: "Pag-IBIG Contribution",
		colorClass: "bg-amber-500",
	},
};

// the tax line is withheld from an employee but paid directly by a self-employed person
export const deductionLabel = (
	key: string,
	sector: Sector,
	regime: TaxRegime,
): string => {
	if (key === "withholdingTax" && sector === "selfemployed") {
		return regime === "flat8" ? "Income Tax (8%)" : "Income Tax";
	}
	return DEDUCTION_META[key as DeductionKey]?.label ?? key;
};
