import { useState, useMemo } from "react";
import type { Sector, WorkSchedule, TaxInputs, TaxResults } from "../types";
import { computeTaxSummary } from "./calculation";

export interface SalaryCalculatorSetters {
	setSalary: (value: number) => void;
	setAllowance: (value: number) => void;
	setSector: (sector: Sector) => void;
	setOvertimeHours: (value: number) => void;
	setNightDifferentialHours: (value: number) => void;
	setWorkSchedule: (schedule: WorkSchedule) => void;
}

export interface UseSalaryCalculatorReturn {
	inputs: TaxInputs;
	results: TaxResults;
	setters: SalaryCalculatorSetters;
}

// hook
export const useSalaryCalculator = (): UseSalaryCalculatorReturn => {
	const [salary, setSalary] = useState(0);
	const [allowance, setAllowance] = useState(0);
	const [sector, setSectorState] = useState<Sector>("private");
	const [overtimeHours, setOvertimeHoursState] = useState(0);
	const [nightDifferentialHours, setNightDifferentialHoursState] = useState(0);
	const [workSchedule, setWorkScheduleState] =
		useState<WorkSchedule>("mon-fri");

	const results = useMemo(
		() =>
			computeTaxSummary({
				salary,
				allowance,
				sector,
				overtimeHours,
				nightDifferentialHours,
				workSchedule,
			}),
		[
			salary,
			allowance,
			sector,
			overtimeHours,
			nightDifferentialHours,
			workSchedule,
		],
	);

	const inputs: TaxInputs = {
		salary,
		allowance,
		sector,
		overtimeHours,
		nightDifferentialHours,
		workSchedule,
	};

	// this resets ot + nd when switching to self-employed
	const setSector = (next: Sector) => {
		setSectorState(next);
		if (next === "selfemployed") {
			setOvertimeHoursState(0);
			setNightDifferentialHoursState(0);
		}
	};

	const setters: SalaryCalculatorSetters = {
		setSalary,
		setAllowance,
		setSector,
		setOvertimeHours: setOvertimeHoursState,
		setNightDifferentialHours: setNightDifferentialHoursState,
		setWorkSchedule: setWorkScheduleState,
	};

	return { inputs, results, setters };
};
