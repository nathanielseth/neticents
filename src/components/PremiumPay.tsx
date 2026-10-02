import type { TaxInputs, WorkSchedule } from "../types";
import type { SalaryCalculatorSetters } from "../utils/useSalaryCalculator";
import {
	defaultNightDiffRate,
	maxNightHours,
	maxOvertimeHours,
} from "../utils/calculation";
import { maxNightRate } from "../utils/inputLimits";
import {
	nightHoursInfo,
	nightRateInfo,
	overtimeInfo,
	scheduleInfo,
} from "../utils/inputHints";
import Disclosure from "./Disclosure";
import NumberField from "./NumberField";
import PremiumWorkTable from "./PremiumWorkTable";
import Segmented from "./Segmented";
import type { SegmentedOption } from "./Segmented";

const WORK_SCHEDULE_OPTIONS: readonly SegmentedOption<WorkSchedule>[] = [
	{ value: "mon-fri", label: "5 days/week" },
	{ value: "mon-sat", label: "6 days/week" },
	{ value: "mon-sun", label: "Every day" },
];

const hasDayWork = ({ sector, premiumWork }: TaxInputs): boolean =>
	// government uses a single bucket, so only that row's fields count
	sector === "public"
		? premiumWork.restDay.hours > 0 || premiumWork.restDay.night > 0
		: Object.values(premiumWork).some(
				(row) => row.hours > 0 || row.overtime > 0 || row.night > 0,
			);

interface PremiumPayProps {
	inputs: TaxInputs;
	setters: SalaryCalculatorSetters;
}

const PremiumPay = ({ inputs, setters }: PremiumPayProps) => {
	const {
		sector,
		workSchedule,
		overtimeHours,
		nightDifferentialHours,
		nightDifferentialRate,
	} = inputs;

	// government hourly rate is fixed at monthly / 22 / 8, so the schedule has no effect there
	const scheduleApplies = sector === "private";

	return (
		<>
			{scheduleApplies && (
				<Segmented
					label="Work Schedule"
					options={WORK_SCHEDULE_OPTIONS}
					value={workSchedule}
					onChange={setters.setWorkSchedule}
					info={scheduleInfo()}
				/>
			)}

			<div>
				<div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] items-end gap-2 sm:gap-3">
					<NumberField
						label="Overtime"
						info={overtimeInfo()}
						suffix="hrs"
						stepper
						max={maxOvertimeHours(sector, workSchedule)}
						value={overtimeHours}
						onChange={setters.setOvertimeHours}
					/>
					<NumberField
						label="Night Hours"
						info={nightHoursInfo(sector)}
						suffix="hrs"
						stepper
						max={maxNightHours(sector, workSchedule, overtimeHours)}
						value={nightDifferentialHours}
						onChange={setters.setNightDifferentialHours}
					/>
					<NumberField
						label="Night Rate"
						info={nightRateInfo(sector)}
						suffix="%"
						stepper
						min={1}
						max={maxNightRate(sector)}
						placeholder={String(defaultNightDiffRate(sector))}
						value={nightDifferentialRate}
						onChange={setters.setNightDifferentialRate}
					/>
				</div>
			</div>

			<Disclosure
				title="Holiday & Rest-Day Work"
				defaultOpen={hasDayWork(inputs)}
			>
				<PremiumWorkTable inputs={inputs} setters={setters} />
			</Disclosure>
		</>
	);
};

export default PremiumPay;