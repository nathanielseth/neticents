import { useState, useMemo, useEffect } from "react";
import type {
	Sector,
	WorkSchedule,
	NightDiffRate,
	PremiumDayType,
	PremiumDayHours,
	TaxInputs,
	TaxRegime,
	TaxResults,
} from "../types";
import { computeTaxSummary, defaultNightDiffRate } from "./calculation";
import {
	createDefaultInputs,
	emptyPremiumWork,
	loadInputs,
	saveInputs,
} from "./savedInputs";
import { limitInputs } from "./inputLimits";

export interface SalaryCalculatorSetters {
	setSalary: (value: number) => void;
	setAllowance: (value: number) => void;
	setSector: (sector: Sector) => void;
	setOvertimeHours: (value: number) => void;
	setNightDifferentialHours: (value: number) => void;
	setNightDifferentialRate: (rate: NightDiffRate) => void;
	setWorkSchedule: (schedule: WorkSchedule) => void;
	setPremiumWork: (
		type: PremiumDayType,
		field: keyof PremiumDayHours,
		value: number,
	) => void;
	setIncludeThirteenthMonth: (include: boolean) => void;
	setTaxRegime: (regime: TaxRegime) => void;
	reset: () => void;
}

export interface UseSalaryCalculatorReturn {
	inputs: TaxInputs;
	results: TaxResults;
	setters: SalaryCalculatorSetters;
}

export const useSalaryCalculator = (): UseSalaryCalculatorReturn => {
	const [inputs, setInputs] = useState<TaxInputs>(() =>
		limitInputs(loadInputs()),
	);

	useEffect(() => {
		saveInputs(inputs);
	}, [inputs]);

	const results = useMemo(() => computeTaxSummary(inputs), [inputs]);

	const patch = (changes: Partial<TaxInputs>) =>
		setInputs((current) => limitInputs({ ...current, ...changes }));

	const setSector = (next: Sector) =>
		setInputs((current) =>
			limitInputs({
				...current,
				sector: next,
				nightDifferentialRate: defaultNightDiffRate(next), // 10% private, 20% government
				...(next === "selfemployed"
					? {
							allowance: 0,
							overtimeHours: 0,
							nightDifferentialHours: 0,
							premiumWork: emptyPremiumWork(),
						}
					: {}),
			}),
		);

	const setters: SalaryCalculatorSetters = {
		setSalary: (salary) => patch({ salary }),
		setAllowance: (allowance) => patch({ allowance }),
		setSector,
		setOvertimeHours: (overtimeHours) => patch({ overtimeHours }),
		setNightDifferentialHours: (nightDifferentialHours) =>
			patch({ nightDifferentialHours }),
		setNightDifferentialRate: (nightDifferentialRate) =>
			patch({ nightDifferentialRate }),
		setWorkSchedule: (workSchedule) => patch({ workSchedule }),
		setPremiumWork: (type, field, value) =>
			setInputs((current) =>
				limitInputs({
					...current,
					premiumWork: {
						...current.premiumWork,
						[type]: { ...current.premiumWork[type], [field]: value },
					},
				}),
			),
		setIncludeThirteenthMonth: (includeThirteenthMonth) =>
			patch({ includeThirteenthMonth }),
		setTaxRegime: (taxRegime) => patch({ taxRegime }),
		reset: () => setInputs(createDefaultInputs()),
	};

	return { inputs, results, setters };
};