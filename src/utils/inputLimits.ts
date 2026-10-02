import type { PremiumDayHours, PremiumWork, Sector, TaxInputs } from "../types";
import {
	PREMIUM_DAY_TYPES,
	maxNightHours,
	maxOvertimeHours,
	maxPremiumDayHours,
	maxPremiumDayOvertime,
} from "./calculation.ts";

// form clamps as entered, so a field always shows what the calculation counts and never needs a warning

export const maxNightRate = (sector: Sector): number =>
	sector === "public" ? 20 : 100;

// private night hours may include overtime worked at night, public may not
export const maxPremiumNight = (
	sector: Sector,
	row: PremiumDayHours,
): number => (sector === "public" ? row.hours : row.hours + row.overtime);

const limitRow = (sector: Sector, row: PremiumDayHours): PremiumDayHours => {
	const hours = Math.min(row.hours, maxPremiumDayHours);
	const overtime = Math.min(row.overtime, maxPremiumDayOvertime);
	const night = Math.min(
		row.night,
		maxPremiumNight(sector, { hours, overtime, night: row.night }),
	);
	return { hours, overtime, night };
};

// ceilings are interdependent, lowering one field can push another past its limit, settle all in one pass
export const limitInputs = (inputs: TaxInputs): TaxInputs => {
	const { sector, workSchedule } = inputs;
	const overtimeHours = Math.min(
		inputs.overtimeHours,
		maxOvertimeHours(sector, workSchedule),
	);

	return {
		...inputs,
		overtimeHours,
		nightDifferentialHours: Math.min(
			inputs.nightDifferentialHours,
			maxNightHours(sector, workSchedule, overtimeHours),
		),
		nightDifferentialRate: Math.min(
			inputs.nightDifferentialRate,
			maxNightRate(sector),
		),
		premiumWork: Object.fromEntries(
			PREMIUM_DAY_TYPES.map((type) => [
				type,
				limitRow(sector, inputs.premiumWork[type]),
			]),
		) as PremiumWork,
	};
};