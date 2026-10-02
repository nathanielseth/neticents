import type { Sector, TaxRegime } from "../types";
import {
	DE_MINIMIS_ANNUAL_LIMIT,
	DE_MINIMIS_MONTHLY_LIMIT,
	EXEMPT_BENEFITS_ANNUAL_CAP,
	FLAT_TAX,
	defaultNightDiffRate,
} from "./calculation";
import { formatPeso } from "./format";

export interface Hint {
	text: string;
	warn: boolean;
}

export const scheduleInfo = (): string =>
	"Sets your hourly rate.";

export const deMinimisInfo = (): string =>
	`Tax-free up to ${formatPeso(Math.round(DE_MINIMIS_MONTHLY_LIMIT), 0)}/mo (${formatPeso(DE_MINIMIS_ANNUAL_LIMIT, 0)}/yr). Excess counts toward the ${formatPeso(EXEMPT_BENEFITS_ANNUAL_CAP, 0)} benefits cap.`;

export const deMinimisHint = (
	salary: number,
	allowance: number,
): string | null => {
	if (allowance > 0 && salary <= 0) return "Enter basic pay first";
	if (allowance > DE_MINIMIS_MONTHLY_LIMIT) {
		return `Excess counts toward the ${formatPeso(EXEMPT_BENEFITS_ANNUAL_CAP, 0)} cap`;
	}
	return null;
};

export const thirteenthMonthInfo = (sector: Sector): string =>
	`${sector === "public" ? "Year-end bonuses, cash gift and PEI" : "13th month pay (PD 851)"}, counted in the Annual view. Tax-free up to ${formatPeso(EXEMPT_BENEFITS_ANNUAL_CAP, 0)}.`;

export const grossReceiptsInfo = (): string =>
	"Gross receipts, before business expenses.";

export const taxRegimeInfo = (): { graduated: string; flat8: string } => ({
	graduated:
		"Graduated rates on income after contributions, plus 3% percentage tax. Expenses and the 40% standard deduction aren't modeled.",
	flat8: `8% of gross receipts above ${formatPeso(FLAT_TAX.exemptAmount, 0)}, instead of income tax and percentage tax. Contributions aren't deductible. Elect it on your first quarterly return.`,
});

// only a problem worth interrupting for stays inline
export const taxRegimeHint = (
	regime: TaxRegime,
	flatTaxAvailable: boolean,
): Hint | null =>
	regime === "flat8" && !flatTaxAvailable
		? {
				text: `Not available above ${formatPeso(FLAT_TAX.grossLimit, 0)} in gross receipts a year, so graduated rates are used`,
				warn: true,
			}
		: null;

export const overtimeInfo = (): string =>
	"Hours beyond 8 a day, paid at 125% of your hourly rate.";

export const nightHoursInfo = (sector: Sector): string =>
	`Hours worked between ${sector === "public" ? "6 PM" : "10 PM"} and 6 AM.`;

export const nightRateInfo = (sector: Sector): string =>
	`Extra pay on night hours. Defaults to ${defaultNightDiffRate(sector)}%.`;

// premium-day table
export const dayHoursInfo = (): string => "First 8 hours of each shift.";

export const dayOvertimeInfo = (): string =>
	"Hours beyond 8, paid 30% more on that day's rate.";

export const dayNightInfo = (sector: Sector): string =>
	`${sector === "public" ? "6 PM to 6 AM" : "10 PM to 6 AM"}. Counted within the hours entered.`;