import type { PremiumDayHours, PremiumDayType, TaxInputs } from "../types";
import type { SalaryCalculatorSetters } from "../utils/useSalaryCalculator";
import {
	PREMIUM_DAY_MULTIPLIERS,
	maxPremiumDayHours,
	maxPremiumDayOvertime,
} from "../utils/calculation";
import { maxPremiumNight } from "../utils/inputLimits";
import {
	dayHoursInfo,
	dayNightInfo,
	dayOvertimeInfo,
} from "../utils/inputHints";
import { FieldHint } from "./Field";
import InfoTip from "./InfoTip";
import NumberField from "./NumberField";

type Column = keyof PremiumDayHours;

const COLUMN_LABELS: Record<Column, string> = {
	hours: "Hours",
	overtime: "Overtime",
	night: "Night",
};

const PRIVATE_COLUMNS: readonly Column[] = ["hours", "overtime", "night"];
// government pay has no separate overtime rate on these days
const PUBLIC_COLUMNS: readonly Column[] = ["hours", "night"];

const PRIVATE_ROWS: readonly { type: PremiumDayType; label: string }[] = [
	{ type: "restDay", label: "Rest day" },
	{ type: "specialDay", label: "Special non-working day" },
	{ type: "specialRestDay", label: "Special day on a rest day" },
	{ type: "regularHoliday", label: "Regular holiday" },
	{ type: "holidayRestDay", label: "Regular holiday on a rest day" },
];

// government uses a single bucket for all three kinds of day
const PUBLIC_ROW = {
	type: "restDay",
	label: "Rest day, holiday or special day",
} as const;
const PUBLIC_RATE = 1.5;

const PUBLIC_NOTE =
	"Paid at 150% (CSC-DBM JC 2, s. 2015). Many agencies give compensatory time off instead.";

const columnMax = (
	column: Column,
	row: PremiumDayHours,
	isPublic: boolean,
): number => {
	switch (column) {
		case "hours":
			return maxPremiumDayHours;
		case "overtime":
			return maxPremiumDayOvertime;
		case "night":
			return maxPremiumNight(isPublic ? "public" : "private", row);
	}
};

interface PremiumWorkTableProps {
	inputs: TaxInputs;
	setters: SalaryCalculatorSetters;
}

const PremiumWorkTable = ({ inputs, setters }: PremiumWorkTableProps) => {
	const { sector, premiumWork, workSchedule } = inputs;
	const isPublic = sector === "public";
	const columns = isPublic ? PUBLIC_COLUMNS : PRIVATE_COLUMNS;
	const rows = isPublic ? [PUBLIC_ROW] : PRIVATE_ROWS;
	// tailwind only sees complete class names, so both track lists stay literal
	const grid = isPublic
		? "grid-cols-[minmax(0,1fr)_repeat(2,5rem)]"
		: "grid-cols-[minmax(0,1fr)_repeat(3,5rem)]";

	const columnInfo: Record<Column, string> = {
		hours: dayHoursInfo(),
		overtime: dayOvertimeInfo(),
		night: dayNightInfo(sector),
	};

	const note = isPublic
		? PUBLIC_NOTE
		: workSchedule === "mon-sun"
			? "Your salary already covers these days, so only the premium is added."
			: "Rest-day hours are paid in full since your salary doesn't cover them. Other days add only the premium.";

	return (
		<div>
			<div className="space-y-3">
				<div
					className={`grid gap-x-2 text-xs font-medium text-muted ${grid}`}
				>
					<span />
					{columns.map((column) => (
						<span
							key={column}
							className="flex items-center justify-center gap-0.5"
						>
							{COLUMN_LABELS[column]}
							<InfoTip label={`About ${COLUMN_LABELS[column]} hours`}>
								{columnInfo[column]}
							</InfoTip>
						</span>
					))}
				</div>

				{rows.map(({ type, label }) => {
					const row = premiumWork[type];
					const rate = isPublic ? PUBLIC_RATE : PREMIUM_DAY_MULTIPLIERS[type];
					return (
						<div key={type}>
							<div className={`grid items-center gap-x-2 ${grid}`}>
								<div className="min-w-0">
									<div className="text-sm text-fg">{label}</div>
									<div className="text-xs text-muted">
										{Math.round(rate * 100)}% pay
									</div>
								</div>
								{columns.map((column) => (
									<NumberField
										key={column}
										compact
										stepper
										hideLabel
										label={`${label}, ${COLUMN_LABELS[column].toLowerCase()} hours`}
										value={row[column]}
										max={columnMax(column, row, isPublic)}
										onChange={(value) =>
											setters.setPremiumWork(type, column, value)
										}
									/>
								))}
							</div>
						</div>
					);
				})}
			</div>

			<div className="mt-4">
				<FieldHint>{note}</FieldHint>
			</div>
		</div>
	);
};

export default PremiumWorkTable;
