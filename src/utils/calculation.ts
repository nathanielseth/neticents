// ph payroll computation
// every rate is a snapshot of a published issuance

import type {
	Sector,
	WorkSchedule,
	TaxInputs,
	TaxResults,
	PremiumPayResult,
	PremiumDayType,
	PremiumDayLine,
	PremiumWork,
	SSSResult,
	Deductions,
	AnnualBenefits,
	NightDiffRate,
	TaxRegime,
} from "../types";

// helpers

const roundCents = (n: number): number =>
	Math.round((n + Number.EPSILON) * 100) / 100;
const clamp = (n: number, min: number, max: number): number =>
	Math.min(max, Math.max(min, n));
// NaN/negative/infinite treated as zero instead of poisoning a result
const positive = (n: number): number => (Number.isFinite(n) && n > 0 ? n : 0);

// tax-exempt benefits

// nirc sec. 32(b)(7)(e), train (ra 10963)
// 13th month and other benefits combined
// excluded up to this per year. not a de minimis limit
export const EXEMPT_BENEFITS_ANNUAL_CAP = 90_000;

// bir rr 29-2025 (eff 6 jan 2026): de minimis ceilings per category, annualised
// categories can't be pooled in law; sum is the max one person can receive
// excess counts as "other benefit".
const DE_MINIMIS_ANNUAL_CEILINGS = {
	riceSubsidy: 2_500 * 12,
	laundryAllowance: 400 * 12,
	medicalCashAllowanceToDependents: 2_000 * 2, // per semester
	uniformAndClothing: 8_000,
	actualMedicalAssistance: 12_000,
	employeeAchievementAwards: 12_000,
	christmasAndAnniversaryGifts: 6_000,
	cbaAndProductivityIncentives: 12_000, // combined
} as const;

export const DE_MINIMIS_ANNUAL_LIMIT = Object.values(
	DE_MINIMIS_ANNUAL_CEILINGS,
).reduce((sum, ceiling) => sum + ceiling, 0);
export const DE_MINIMIS_MONTHLY_LIMIT = DE_MINIMIS_ANNUAL_LIMIT / 12;

// same cap applies: ra 6686 cash gift, eo 201 productivity incentive
const GOVERNMENT_CASH_GIFT = 5_000;
const GOVERNMENT_PEI = 5_000;

// gross 13th-month-equivalent per year, full service and eligibility assumed
const yearEndBenefits = (sector: Sector, basicSalary: number): number => {
	switch (sector) {
		case "private": // pd 851: 1/12 of basic earned
			return basicSalary;
		case "public": // mid-year + year-end (1 mo each) + cash gift + pei
			return 2 * basicSalary + GOVERNMENT_CASH_GIFT + GOVERNMENT_PEI;
		case "selfemployed":
			return 0;
	}
};

// includeYearEnd off for employees not entitled (pd 851 excludes managerial)
// then only an over-limit allowance can use up the exclusion
const computeAnnualBenefits = (
	sector: Sector,
	basicSalary: number,
	monthlyAllowance: number,
	includeYearEnd: boolean,
): AnnualBenefits => {
	const yearEnd = includeYearEnd ? yearEndBenefits(sector, basicSalary) : 0;
	const allowanceOverDeMinimis = Math.max(
		0,
		monthlyAllowance * 12 - DE_MINIMIS_ANNUAL_LIMIT,
	);
	return {
		yearEnd,
		taxableExcess: Math.max(
			0,
			yearEnd + allowanceOverDeMinimis - EXEMPT_BENEFITS_ANNUAL_CAP,
		),
	};
};

// income tax

interface TaxBracket {
	over: number;
	base: number;
	rate: number;
}

// train law (ra 10963), rates from 1 jan 2023 onward, unchanged for 2026
// lower bounds only, so brackets are contiguous by construction
const TAX_BRACKETS: readonly TaxBracket[] = [
	{ over: 0, base: 0, rate: 0 },
	{ over: 250_000, base: 0, rate: 0.15 },
	{ over: 400_000, base: 22_500, rate: 0.2 },
	{ over: 800_000, base: 102_500, rate: 0.25 },
	{ over: 2_000_000, base: 402_500, rate: 0.3 },
	{ over: 8_000_000, base: 2_202_500, rate: 0.35 },
];

export const computeAnnualIncomeTax = (taxableAnnualIncome: number): number => {
	for (let i = TAX_BRACKETS.length - 1; i >= 0; i--) {
		const { over, base, rate } = TAX_BRACKETS[i];
		if (taxableAnnualIncome > over) {
			return base + (taxableAnnualIncome - over) * rate;
		}
	}
	return 0;
};

// nirc sec. 24(a)(2)(b), train, bir rr 8-2018 and rmo 23-2018: instead of graduated
// plus percentage tax, 8% of gross receipts above 250k, only while gross stays within 3M vat threshold
// purely self-employed get the 250k; mixed-income earners not
export const FLAT_TAX = {
	rate: 0.08,
	exemptAmount: 250_000,
	grossLimit: 3_000_000,
} as const;
export const isFlatTaxAvailable = (monthlyIncome: number): boolean =>
	monthlyIncome * 12 <= FLAT_TAX.grossLimit;

// nirc sec. 116: non-vat individuals pay 3%. the 1% create rate ended 30 jun 2023, so 3% applies in 2026
const PERCENTAGE_TAX_RATE = 0.03;

// sss

// ra 11199 as of 2025 (sss circular 2024-006), unchanged for 2026: 15% of msc
// employed pay 5%, employer 10%; self-employed pay full 15%
const SSS_EMPLOYEE_RATE = 0.05;
const SSS_TOTAL_RATE = 0.15;
const MSC = {
	min: 5_000,
	max: 35_000,
	step: 500,
	regularSsCap: 20_000,
} as const;

// published table is this rule: 500-peso credits covering (credit-250) up to (credit+250), floored 5k, capped 35k
export const monthlySalaryCredit = (compensation: number): number =>
	clamp(
		Math.floor((compensation + MSC.step / 2) / MSC.step) * MSC.step,
		MSC.min,
		MSC.max,
	);

// credit up to 20k funds regular ss, excess funds mpf
export const computeSSS = (
	compensation: number,
	isSelfEmployed = false,
): SSSResult => {
	if (!(compensation > 0) || !Number.isFinite(compensation)) {
		return { sss: 0, mpf: 0 };
	}
	const rate = isSelfEmployed ? SSS_TOTAL_RATE : SSS_EMPLOYEE_RATE;
	const credit = monthlySalaryCredit(compensation);
	const regularCredit = Math.min(credit, MSC.regularSsCap);
	return {
		sss: roundCents(regularCredit * rate),
		mpf: roundCents((credit - regularCredit) * rate),
	};
};

// philhealth

// ra 11223 (uhc): 5% of monthly basic, floor 10k, ceiling 100k, unchanged for 2026
// employee and employer split equally; self-employed pay all
const PHILHEALTH = { rate: 0.05, floor: 10_000, ceiling: 100_000 } as const;

export const computePhilHealth = (
	basicMonthlySalary: number,
	isSelfEmployed = false,
): number => {
	if (!(basicMonthlySalary > 0) || !Number.isFinite(basicMonthlySalary))
		return 0;
	const totalPremium =
		clamp(basicMonthlySalary, PHILHEALTH.floor, PHILHEALTH.ceiling) *
		PHILHEALTH.rate;
	return roundCents(isSelfEmployed ? totalPremium : totalPremium / 2);
};

// pag-ibig

// hdmf circular 460 (feb 2024): employee 1% if comp <= 1,500 else 2%; employer 2%;
// base capped at 10,000 fund salary. self-employed treated as both, pay both shares
const PAGIBIG = {
	maxFundSalary: 10_000,
	lowIncomeThreshold: 1_500,
	employeeRateLow: 0.01,
	employeeRate: 0.02,
	employerRate: 0.02,
} as const;

export const computePagIbig = (
	monthlyCompensation: number,
	isSelfEmployed = false,
): number => {
	if (!(monthlyCompensation > 0) || !Number.isFinite(monthlyCompensation))
		return 0;
	const fundSalary = Math.min(monthlyCompensation, PAGIBIG.maxFundSalary);
	const employeeRate =
		monthlyCompensation <= PAGIBIG.lowIncomeThreshold
			? PAGIBIG.employeeRateLow
			: PAGIBIG.employeeRate;
	const rate = isSelfEmployed
		? employeeRate + PAGIBIG.employerRate
		: employeeRate;
	return roundCents(fundSalary * rate);
};

// gsis

// ra 8291 sec. 5: 9% of basic monthly salary
const GSIS_EMPLOYEE_RATE = 0.09;
export const computeGSIS = (basicMonthlySalary: number): number =>
	roundCents(positive(basicMonthlySalary) * GSIS_EMPLOYEE_RATE);

// premium pay

const HOURS_PER_DAY = 8;

// only used to cap hour inputs at what a month can hold, not for pay
const WORK_SCHEDULES: Record<WorkSchedule, number> = {
	"mon-fri": 22,
	"mon-sat": 26,
	"mon-sun": 30,
};

// dole handbook equivalent monthly rate: days in a year the monthly salary pays for
// daily rate = monthly x 12 / factor
//   261: paid except saturdays and sundays
//   313: paid except sundays
//   365: paid every day including rest days and holidays
// exact, unlike the rounded 22 / 26 / 30 days seen in some tools
export const PAY_FACTORS: Record<WorkSchedule, number> = {
	"mon-fri": 261,
	"mon-sat": 313,
	"mon-sun": 365,
};

// government: hourly = monthly / 22 days / 8 hours (ra 11701 irr, csc-dbm jc 2 s. 2015)
const GOVERNMENT_WORKING_DAYS = 22;

export const hourlyRateFor = (
	sector: Sector,
	schedule: WorkSchedule,
	monthlySalary: number,
): number =>
	sector === "public"
		? monthlySalary / GOVERNMENT_WORKING_DAYS / HOURS_PER_DAY
		: (monthlySalary * 12) / (PAY_FACTORS[schedule] * HOURS_PER_DAY);

// labor code art. 87: overtime on an ordinary day is hourly rate + at least 25%
const OVERTIME_MULTIPLIER = 1.25;

// night differential is a premium on top of pay the hour already earns
// private: labor code art. 86 sets 10% floor (10pm-6am); employers may pay more
// public: ra 11701, up to 20% (6pm-6am) as set by the agency head
export const NIGHT_DIFF_RATE_OPTIONS: readonly NightDiffRate[] = [10, 15, 20];
export const DEFAULT_NIGHT_DIFF_RATE: NightDiffRate = 10;
export const defaultNightDiffRate = (sector: Sector): NightDiffRate =>
	sector === "public" ? 20 : 10;

// blank or zero means sector default; private floored at 10% (capped 100% sanity), govt capped at 20%
export const resolveNightDiffPercent = (
	sector: Sector,
	percent?: number,
): number => {
	if (sector === "selfemployed") return 0;
	const requested =
		percent !== undefined && Number.isFinite(percent) && percent > 0
			? percent
			: defaultNightDiffRate(sector);
	return sector === "private"
		? clamp(requested, 10, 100)
		: clamp(requested, 0, 20);
};

const resolveNightDiffPremium = (sector: Sector, percent?: number): number =>
	resolveNightDiffPercent(sector, percent) / 100;

// realistic monthly ceilings so a typo can't produce an impossible payslip
export const workingDaysPerMonth = (
	sector: Sector,
	schedule: WorkSchedule,
): number =>
	sector === "public" ? WORK_SCHEDULES["mon-fri"] : WORK_SCHEDULES[schedule];
// dole allows a 12-hour day (8 regular + 4 overtime)
export const maxOvertimeHours = (
	sector: Sector,
	schedule: WorkSchedule,
): number => workingDaysPerMonth(sector, schedule) * 4;
// night hours include overtime hours worked at night, ceiling is regular + overtime
export const maxNightHours = (
	sector: Sector,
	schedule: WorkSchedule,
	overtimeHours: number,
): number =>
	workingDaysPerMonth(sector, schedule) * HOURS_PER_DAY +
	Math.min(positive(overtimeHours), maxOvertimeHours(sector, schedule));

export function computePremiumPay(
	hourlyRate: number,
	overtimeHours: number,
	nightHours: number,
	sector: Sector,
	nightDiffPercent?: number,
): PremiumPayResult {
	// self-employed have no employer to pay premiums
	const eligible = sector !== "selfemployed";
	const otHours = eligible ? positive(overtimeHours) : 0;
	const ndHours = eligible ? positive(nightHours) : 0;
	const nightDiffPremium = resolveNightDiffPremium(sector, nightDiffPercent);
	const rate = positive(hourlyRate);

	// hours both overtime and night are paid once at the combined rate, not twice
	const overlapHours = Math.min(otHours, ndHours);
	const regularOvertimeHours = otHours - overlapHours;
	const regularNightHours = ndHours - overlapHours;

	// art. 87: night differential on an overtime hour is computed on the overtime rate itself
	const nightOvertimeMultiplier = OVERTIME_MULTIPLIER * (1 + nightDiffPremium);

	// overtime hours are extra (paid in full); regular night hours already inside monthly
	// salary, so only the premium is added. paying 1.10x would count basic pay twice
	const regularOvertimePay = roundCents(
		regularOvertimeHours * rate * OVERTIME_MULTIPLIER,
	);
	const regularNightPay = roundCents(
		regularNightHours * rate * nightDiffPremium,
	);
	const nightOvertimePay = roundCents(
		overlapHours * rate * nightOvertimeMultiplier,
	);

	return {
		regularOvertimePay,
		regularNightPay,
		nightOvertimePay,
		dayWork: [],
		dayWorkPay: 0,
		totalPremiumPay: roundCents(
			regularOvertimePay + regularNightPay + nightOvertimePay,
		),
		breakdown: {
			regularOvertimeHours,
			regularNightHours,
			overlapHours,
			rates: {
				overtime: OVERTIME_MULTIPLIER,
				nightDiffPremium,
				nightOvertime: nightOvertimeMultiplier,
			},
		},
	};
}

// holiday and rest-day work

// pay for first 8 hours, as multiple of ordinary daily rate. dole advisories (12-25),
// labor code arts. 91-94:
//   rest day 130%, special non-working 130%, special on rest day 150%,
//   regular holiday 200%, regular holiday on rest day 260%
//   double holidays (300%) not modeled
export const PREMIUM_DAY_MULTIPLIERS: Record<PremiumDayType, number> = {
	restDay: 1.3,
	specialDay: 1.3,
	specialRestDay: 1.5,
	regularHoliday: 2,
	holidayRestDay: 2.6,
};
export const PREMIUM_DAY_TYPES: readonly PremiumDayType[] = [
	"restDay",
	"specialDay",
	"specialRestDay",
	"regularHoliday",
	"holidayRestDay",
];
const FALLS_ON_REST_DAY: Record<PremiumDayType, boolean> = {
	restDay: true,
	specialDay: false,
	specialRestDay: true,
	regularHoliday: false,
	holidayRestDay: true,
};

// dole: hours beyond 8 on a rest day or holiday earn a further 30% of that day's hourly rate
const PREMIUM_DAY_OVERTIME_MULTIPLIER = 1.3;

// government outside labor code. csc-dbm jc 2 s. 2015 pays overtime on rest day,
// holiday, or special non-working day at 150% (125% on workday)
const GOVERNMENT_PREMIUM_DAY_MULTIPLIER = 1.5;

const MAX_DAYS_IN_MONTH = 31;
export const maxPremiumDayHours = HOURS_PER_DAY * MAX_DAYS_IN_MONTH;
export const maxPremiumDayOvertime = 4 * MAX_DAYS_IN_MONTH;

// monthly salary already pays 100% of the day for every day the factor counts as paid
// factors 261/313 are daily-paid equivalents, rest day not in salary, so worked hours paid in full
// factor 365 pays rest days too, so only premium added
// regular holidays and special days that fall on a workday are always inside the salary.
const restDaysArePaid = (schedule: WorkSchedule): boolean =>
	PAY_FACTORS[schedule] === 365;

export function computePremiumDayPay(
	hourlyRate: number,
	premiumWork: PremiumWork,
	sector: Sector,
	schedule: WorkSchedule,
	nightDiffPercent?: number,
): { lines: PremiumDayLine[]; total: number } {
	if (sector === "selfemployed") return { lines: [], total: 0 };
	const rate = positive(hourlyRate);
	const nightPremium = resolveNightDiffPremium(sector, nightDiffPercent);
	const lines: PremiumDayLine[] = [];

	if (sector === "public") {
		// one bucket: every hour is overtime at 150%, night diff on top of that rate
		const hours = Math.min(
			positive(premiumWork.restDay.hours),
			maxPremiumDayHours,
		);
		const night = Math.min(positive(premiumWork.restDay.night), hours);
		if (hours > 0) {
			lines.push({
				type: "restDay",
				hours,
				overtimeHours: 0,
				nightHours: night,
				pay: roundCents(
					rate *
						GOVERNMENT_PREMIUM_DAY_MULTIPLIER *
						(hours + night * nightPremium),
				),
			});
		}
	} else {
		for (const type of PREMIUM_DAY_TYPES) {
			const row = premiumWork[type];
			const hours = Math.min(positive(row.hours), maxPremiumDayHours);
			const overtime = Math.min(positive(row.overtime), maxPremiumDayOvertime);
			if (hours + overtime === 0) continue;
			const night = Math.min(positive(row.night), hours + overtime);

			const multiplier = PREMIUM_DAY_MULTIPLIERS[type];
			const overtimeMultiplier = multiplier * PREMIUM_DAY_OVERTIME_MULTIPLIER;
			const inSalary =
				FALLS_ON_REST_DAY[type] && !restDaysArePaid(schedule) ? 0 : 1;

			// night from regular hours first, then overtime. 
			// night diff is a percent of the rate that hour is paid at (dole order: day type, overtime, then night diff)
			const regularNight = Math.min(night, hours);
			const overtimeNight = night - regularNight;
			const pay =
				rate *
				(hours * (multiplier - inSalary) +
					overtime * overtimeMultiplier +
					nightPremium *
						(regularNight * multiplier + overtimeNight * overtimeMultiplier));

			lines.push({
				type,
				hours,
				overtimeHours: overtime,
				nightHours: night,
				pay: roundCents(pay),
			});
		}
	}

	return {
		lines,
		total: roundCents(lines.reduce((sum, line) => sum + line.pay, 0)),
	};
}

// summary

interface Contributions {
	sss: number; // sss + mpf, shown as one line
	gsis: number;
	philHealth: number;
	pagIbig: number;
}

function computeContributions(
	sector: Sector,
	basicSalary: number,
	compensation: number, // basic + premium pay
): Contributions {
	const isSelfEmployed = sector === "selfemployed";
	const { sss, mpf } =
		sector === "public"
			? { sss: 0, mpf: 0 }
			: computeSSS(compensation, isSelfEmployed);

	return {
		sss: roundCents(sss + mpf),
		gsis: sector === "public" ? computeGSIS(basicSalary) : 0,
		philHealth: computePhilHealth(basicSalary, isSelfEmployed),
		pagIbig: computePagIbig(compensation, isSelfEmployed),
	};
}

export function computeTaxSummary(inputs: TaxInputs): TaxResults {
	const { sector, workSchedule } = inputs;
	const isSelfEmployed = sector === "selfemployed";
	const salary = positive(inputs.salary);
	// no employer, no de minimis benefits
	const allowance = isSelfEmployed ? 0 : positive(inputs.allowance);

	// nothing to compute without a salary
	if (salary === 0) {
		return emptyResults(inputs, allowance);
	}

	const hourlyRate = hourlyRateFor(sector, workSchedule, salary);

	const overtimeHours = Math.min(
		positive(inputs.overtimeHours),
		maxOvertimeHours(sector, workSchedule),
	);
	const nightHours = Math.min(
		positive(inputs.nightDifferentialHours),
		maxNightHours(sector, workSchedule, overtimeHours),
	);
	const ordinaryPremiumPay = computePremiumPay(
		hourlyRate,
		overtimeHours,
		nightHours,
		sector,
		inputs.nightDifferentialRate,
	);
	const dayWork = computePremiumDayPay(
		hourlyRate,
		inputs.premiumWork,
		sector,
		workSchedule,
		inputs.nightDifferentialRate,
	);
	const premiumPay: PremiumPayResult = {
		...ordinaryPremiumPay,
		dayWork: dayWork.lines,
		dayWorkPay: dayWork.total,
		totalPremiumPay: roundCents(
			ordinaryPremiumPay.totalPremiumPay + dayWork.total,
		),
	};

	// regular monthly pay: base for contributions (philhealth and gsis use basic only)
	const compensation = salary + premiumPay.totalPremiumPay;
	const contributions = computeContributions(sector, salary, compensation);
	const employeeContributions =
		contributions.sss +
		contributions.gsis +
		contributions.philHealth +
		contributions.pagIbig;

	// annualised: 12 months of regular pay plus 13th-month excess over cap, less mandatory
	// contributions (nirc sec. 32(b)(7)(f)), taxed on graduated table
	// year-end excess spread over 12 months so the figure reads as a monthly avg
	const annualBenefits = computeAnnualBenefits(
		sector,
		salary,
		allowance,
		inputs.includeThirteenthMonth,
	);
	let withholdingTax: number;
	let percentageTax = 0;
	let appliedTaxRegime: TaxRegime = "graduated";

	if (isSelfEmployed) {
		// gross receipts (no employer, so no premium pay or allowance)
		const annualGross = compensation * 12;
		if (inputs.taxRegime === "flat8" && isFlatTaxAvailable(salary)) {
			// 8% of gross above 250k. contributions not deductible because base is gross
			appliedTaxRegime = "flat8";
			withholdingTax = roundCents(
				(Math.max(0, annualGross - FLAT_TAX.exemptAmount) * FLAT_TAX.rate) / 12,
			);
		} else {
			withholdingTax = roundCents(
				computeAnnualIncomeTax(annualGross - employeeContributions * 12) / 12,
			);
			// above vat threshold the percentage tax gives way to vat, not modeled
			if (isFlatTaxAvailable(salary)) {
				percentageTax = roundCents(compensation * PERCENTAGE_TAX_RATE);
			}
		}
	} else {
		const taxableAnnualIncome =
			compensation * 12 +
			annualBenefits.taxableExcess -
			employeeContributions * 12;
		withholdingTax = roundCents(
			computeAnnualIncomeTax(taxableAnnualIncome) / 12,
		);
	}

	const grossIncome = roundCents(
		salary + allowance + premiumPay.totalPremiumPay,
	);

	const deductions: Deductions = {
		withholdingTax,
		percentageTax,
		gsis: contributions.gsis,
		sss: contributions.sss,
		philHealth: contributions.philHealth,
		pagIbig: contributions.pagIbig,
		total: 0,
	};
	deductions.total = roundCents(
		withholdingTax + percentageTax + employeeContributions,
	);

	return {
		inputs,
		takeHomePay: roundCents(Math.max(0, grossIncome - deductions.total)),
		grossIncome,
		deductions,
		visibleDeductions: filterDeductions(deductions, sector),
		totalDeductions: deductions.total,
		premiumPay,
		annualBenefits,
		appliedTaxRegime,
		effectiveRate: grossIncome > 0 ? (deductions.total / grossIncome) * 100 : 0,
	};
}

// no basic pay means nothing to deduct, take-home equals whatever allowance was entered
function emptyResults(inputs: TaxInputs, allowance: number): TaxResults {
	const deductions: Deductions = {
		withholdingTax: 0,
		percentageTax: 0,
		gsis: 0,
		sss: 0,
		philHealth: 0,
		pagIbig: 0,
		total: 0,
	};
	return {
		inputs,
		takeHomePay: allowance,
		grossIncome: allowance,
		deductions,
		visibleDeductions: filterDeductions(deductions, inputs.sector),
		totalDeductions: 0,
		premiumPay: computePremiumPay(0, 0, 0, inputs.sector),
		annualBenefits: { yearEnd: 0, taxableExcess: 0 },
		appliedTaxRegime: "graduated",
		effectiveRate: 0,
	};
}

function filterDeductions(
	deductions: Deductions,
	sector: Sector,
): [string, number][] {
	const isPrivateSector = sector === "private" || sector === "selfemployed";

	return Object.entries(deductions).filter(([key, value]) => {
		if (key === "total") return false; // derived, not a line item
		if (key === "percentageTax" && value === 0) return false; // only some self-employed pay
		if (key === "gsis" && isPrivateSector) return false;
		if (key === "sss" && sector === "public") return false;
		return true;
	}) as [string, number][];
}