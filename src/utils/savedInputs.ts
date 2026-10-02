import type {
	PremiumDayHours,
	PremiumWork,
	Sector,
	TaxInputs,
	TaxRegime,
	WorkSchedule,
} from "../types";
import { PREMIUM_DAY_TYPES, defaultNightDiffRate } from "./calculation.ts";

const STORAGE_KEY = "neticents:inputs:v1";

const SECTORS: readonly Sector[] = ["private", "public", "selfemployed"];
const SCHEDULES: readonly WorkSchedule[] = ["mon-fri", "mon-sat", "mon-sun"];
const REGIMES: readonly TaxRegime[] = ["graduated", "flat8"];

const MAX_AMOUNT = 1_000_000_000_000;
const MAX_HOURS = 10_000;
const MAX_PERCENT = 100;

export const emptyPremiumWork = (): PremiumWork => ({
	restDay: { hours: 0, overtime: 0, night: 0 },
	specialDay: { hours: 0, overtime: 0, night: 0 },
	specialRestDay: { hours: 0, overtime: 0, night: 0 },
	regularHoliday: { hours: 0, overtime: 0, night: 0 },
	holidayRestDay: { hours: 0, overtime: 0, night: 0 },
});

export const createDefaultInputs = (): TaxInputs => ({
	salary: 0,
	allowance: 0,
	sector: "private",
	overtimeHours: 0,
	nightDifferentialHours: 0,
	nightDifferentialRate: defaultNightDiffRate("private"),
	workSchedule: "mon-fri",
	premiumWork: emptyPremiumWork(),
	includeThirteenthMonth: false,
	taxRegime: "graduated",
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const cleanNumber = (value: unknown, max: number): number =>
	typeof value === "number" && Number.isFinite(value) && value > 0
		? Math.min(value, max)
		: 0;

const oneOf = <T extends string>(
	value: unknown,
	options: readonly T[],
	fallback: T,
): T => (options.includes(value as T) ? (value as T) : fallback);

const cleanHours = (value: unknown): PremiumDayHours => {
	const row = isRecord(value) ? value : {};
	return {
		hours: cleanNumber(row.hours, MAX_HOURS),
		overtime: cleanNumber(row.overtime, MAX_HOURS),
		night: cleanNumber(row.night, MAX_HOURS),
	};
};

// always returns a complete, valid TaxInputs with keys in a fixed order
export const sanitizeInputs = (raw: unknown): TaxInputs => {
	const defaults = createDefaultInputs();
	if (!isRecord(raw)) return defaults;

	const sector = oneOf(raw.sector, SECTORS, defaults.sector);
	const work = isRecord(raw.premiumWork) ? raw.premiumWork : {};
	const premiumWork = emptyPremiumWork();
	for (const type of PREMIUM_DAY_TYPES) {
		premiumWork[type] = cleanHours(work[type]);
	}

	// a stored rate of 0 or junk means "the sector default"
	const rate = cleanNumber(raw.nightDifferentialRate, MAX_PERCENT);

	return {
		salary: cleanNumber(raw.salary, MAX_AMOUNT),
		allowance: cleanNumber(raw.allowance, MAX_AMOUNT),
		sector,
		overtimeHours: cleanNumber(raw.overtimeHours, MAX_HOURS),
		nightDifferentialHours: cleanNumber(raw.nightDifferentialHours, MAX_HOURS),
		nightDifferentialRate: rate > 0 ? rate : defaultNightDiffRate(sector),
		workSchedule: oneOf(raw.workSchedule, SCHEDULES, defaults.workSchedule),
		premiumWork,
		includeThirteenthMonth:
			typeof raw.includeThirteenthMonth === "boolean"
				? raw.includeThirteenthMonth
				: defaults.includeThirteenthMonth,
		taxRegime: oneOf(raw.taxRegime, REGIMES, defaults.taxRegime),
	};
};

export const isDefaultInputs = (inputs: TaxInputs): boolean =>
	JSON.stringify(sanitizeInputs(inputs)) ===
	JSON.stringify(createDefaultInputs());

export const loadInputs = (): TaxInputs => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored === null
			? createDefaultInputs()
			: sanitizeInputs(JSON.parse(stored));
	} catch {
		// storage blocked, or the stored text is not valid json
		return createDefaultInputs();
	}
};

export const saveInputs = (inputs: TaxInputs): void => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
	} catch {
		// private mode or a full quota: the calculator still works, just cant remember
	}
};