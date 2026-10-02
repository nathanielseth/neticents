export type Theme = "light" | "dark";
export type Sector = "private" | "public" | "selfemployed";
export type WorkSchedule = "mon-fri" | "mon-sat" | "mon-sun";
export type NightDiffRate = number; // percent premium, e.g. 12 for 12%
export type PayPeriod = "monthly" | "semimonthly" | "biweekly" | "annual";
export type TaxRegime = "graduated" | "flat8";

// work on a rest day, special non-working day or regular holiday (and the combinations of them)
export type PremiumDayType =
	| "restDay"
	| "specialDay"
	| "specialRestDay"
	| "regularHoliday"
	| "holidayRestDay";

// hours logged for one kind of premium day in a month
export interface PremiumDayHours {
	hours: number; // first 8 hours of each shift
	overtime: number; // hours beyond 8
	night: number; // hours inside the night window (any of the hours above)
}
export type PremiumWork = Record<PremiumDayType, PremiumDayHours>;

export interface TaxInputs {
	salary: number;
	allowance: number;
	sector: Sector;
	overtimeHours: number;
	nightDifferentialHours: number;
	nightDifferentialRate: NightDiffRate; // percent premium
	workSchedule: WorkSchedule;
	premiumWork: PremiumWork;
	includeThirteenthMonth: boolean;
	taxRegime: TaxRegime; // self-employed only
}

export interface TaxResults {
	inputs: TaxInputs;
	takeHomePay: number;
	grossIncome: number;
	deductions: Deductions;
	visibleDeductions: [string, number][];
	totalDeductions: number;
	premiumPay: PremiumPayResult;
	annualBenefits: AnnualBenefits;
	appliedTaxRegime: TaxRegime; // what was actually used (8% falls back to graduated above the limit)
	effectiveRate: number;
}

// 13th-month-type benefits share one annual tax exclusion (see calculation.ts)
export interface AnnualBenefits {
	yearEnd: number; // gross 13th month / year-end bonuses expected in a year
	taxableExcess: number; // portion above the exclusion cap, taxed as compensation
}

export interface Deductions {
	withholdingTax: number;
	percentageTax: number; // self-employed on graduated rates only
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

export interface PremiumDayLine {
	type: PremiumDayType;
	hours: number;
	overtimeHours: number;
	nightHours: number;
	pay: number; // extra pay on top of the monthly salary
}

export interface PremiumPayResult {
	regularOvertimePay: number;
	regularNightPay: number;
	nightOvertimePay: number;
	dayWork: PremiumDayLine[];
	dayWorkPay: number;
	totalPremiumPay: number;
	breakdown: {
		regularOvertimeHours: number;
		regularNightHours: number;
		overlapHours: number;
		rates: {
			overtime: number; // multiplier of hourly rate for an overtime hour
			nightDiffPremium: number; // premium *added* to hours already paid via salary
			nightOvertime: number; // multiplier of hourly rate for an hour that is both
		};
	};
}

export interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

export interface ReferenceLink {
	title: string;
	subtitle: string;
	url: string;
}
