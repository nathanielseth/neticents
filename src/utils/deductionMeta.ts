export type DeductionKey =
	| "withholdingTax"
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