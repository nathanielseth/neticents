// core domain types
export type Theme = "light" | "dark";
export type Sector = "private" | "public" | "selfemployed";
export type WorkSchedule = "mon-fri" | "mon-sat" | "mon-sun";
export type PayPeriod = "monthly" | "annual" | "biweekly";

// calculation I/O
export interface TaxInputs {
	salary: number;
	allowance: number;
	sector: Sector;
	overtimeHours: number;
	nightDifferentialHours: number;
	workSchedule: WorkSchedule;
}

export interface TaxResults {
	inputs: TaxInputs;
	takeHomePay: number;
	grossIncome: number;
	deductions: Deductions;
	visibleDeductions: [string, number][];
	totalDeductions: number;
	premiumPay: PremiumPayResult;
	effectiveRate: number;
}

// intermediate calculation shapes
export interface Deductions {
	withholdingTax: number;
	gsis: number;
	sss: number;
	philHealth: number;
	pagIbig: number;
	total: number;
}

export interface SSSResult {
	sss: number;
	mpf: number;
}

export interface PremiumPayResult {
	regularOvertimePay: number;
	regularNightPay: number;
	nightOvertimePay: number;
	totalPremiumPay: number;
	breakdown: {
		regularOvertimeHours: number;
		regularNightHours: number;
		overlapHours: number;
		rates: {
			overtime: number;
			nightDiff: number;
			nightOvertime: number;
		};
	};
}

// component prop types

export interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

export interface SectorOption {
	id: Sector;
	label: string;
}

export interface WorkScheduleOption {
	id: WorkSchedule;
	label: string;
}

export interface PayPeriodOption {
	value: PayPeriod;
	label: string;
}

export interface ReferenceLink {
	title: string;
	subtitle: string;
	url: string;
	category: "sss" | "gsis" | "philhealth" | "pagibig" | "tax" | "other";
}
