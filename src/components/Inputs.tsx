import { useId, useRef, useEffect, useCallback } from "react";
import type { Sector, WorkSchedule, TaxInputs } from "../types";
import type { SalaryCalculatorSetters } from "../utils/useSalaryCalculator";
import {
	DE_MINIMIS_MONTHLY_LIMIT,
	DE_MINIMIS_ANNUAL_LIMIT,
} from "../utils/calculation";
import { ChevronUp, ChevronDown } from "lucide-react";
import { numberFormat, parseFormattedNumber } from "../utils/format";

interface ToggleButtonProps {
	label: string;
	isActive: boolean;
	onClick: () => void;
}

const ToggleButton = ({ label, isActive, onClick }: ToggleButtonProps) => (
	<button
		type="button"
		onClick={onClick}
		className={`btn ${isActive ? "btn-active" : ""}`}
	>
		{label}
	</button>
);
ToggleButton.displayName = "ToggleButton";

interface SpinButtonProps {
	direction: "up" | "down";
	onClick: () => void;
	onStop: () => void;
	disabled?: boolean;
}

const SpinButton = ({
	direction,
	onClick,
	onStop,
	disabled,
}: SpinButtonProps) => {
	const Icon = direction === "up" ? ChevronUp : ChevronDown;
	return (
		<button
			type="button"
			onMouseDown={onClick}
			onMouseUp={onStop}
			onMouseLeave={onStop}
			onTouchStart={(e) => {
				e.preventDefault();
				onClick();
			}}
			onTouchEnd={(e) => {
				e.preventDefault();
				onStop();
			}}
			disabled={disabled}
			className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${
				disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
			}`}
			tabIndex={-1}
		>
			<Icon size={12} className="text-gray-600 dark:text-gray-400" />
		</button>
	);
};
SpinButton.displayName = "SpinButton";

function formatDisplayValue(value: number, useCurrencyFormat: boolean): string {
	if (value === 0) return "";
	return useCurrencyFormat ? numberFormat(value.toString()) : value.toString();
}

interface InputFieldProps {
	label: string;
	value: number;
	onChange: (value: number) => void;
	placeholder?: string;
	disabled?: boolean;
	useCurrencyFormat?: boolean;
	step?: number;
	helperText?: string | null;
}

const InputField = ({
	label,
	value,
	onChange,
	placeholder,
	disabled = false,
	useCurrencyFormat = false,
	step = 1,
	helperText = null,
}: InputFieldProps) => {
	const inputId = useId();

	// value from parent is the only source of truth; the display string is
	// derived inline rather than mirrored into its own state
	const displayValue = formatDisplayValue(value, useCurrencyFormat);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const raw = e.target.value;

			// cap input length to prevent huge numbers
			if (raw.length > (useCurrencyFormat ? 15 : 3)) return;

			if (useCurrencyFormat) {
				onChange(parseFormattedNumber(raw));
			} else {
				const cleaned = raw.replace(/[^0-9]/g, "");
				onChange(cleaned === "" ? 0 : parseInt(cleaned, 10));
			}
		},
		[useCurrencyFormat, onChange],
	);

	// hold-to-repeat for spin buttons
	const intervalRef = useRef<number | null>(null);
	const timeoutRef = useRef<number | null>(null);

	const stop = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, []);

	useEffect(() => stop, [stop]);

	const applyStep = useCallback(
		(direction: 1 | -1) => {
			if (disabled) return;
			onChange(Math.max(0, value + step * direction));
		},
		[disabled, value, step, onChange],
	);

	// use a ref so the interval always calls the latest applyStep
	const applyStepRef = useRef(applyStep);
	useEffect(() => {
		applyStepRef.current = applyStep;
	}, [applyStep]);

	const startRepeat = useCallback(
		(direction: 1 | -1) => {
			// immediate first tick on press
			applyStepRef.current(direction);
			stop();
			timeoutRef.current = setTimeout(() => {
				intervalRef.current = setInterval(
					() => applyStepRef.current(direction),
					100,
				);
			}, 400);
		},
		[stop],
	);

	return (
		<div>
			<label className="label" htmlFor={inputId}>
				{label}
			</label>
			<div className="relative input-wrapper">
				<input
					id={inputId}
					type="text"
					inputMode={useCurrencyFormat ? "decimal" : "numeric"}
					className={`input-field rounded-l pr-8 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
					placeholder={placeholder}
					value={displayValue}
					onChange={handleChange}
					disabled={disabled}
				/>
				<div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
					<SpinButton
						direction="up"
						onClick={() => startRepeat(1)}
						onStop={stop}
						disabled={disabled}
					/>
					<SpinButton
						direction="down"
						onClick={() => startRepeat(-1)}
						onStop={stop}
						disabled={disabled}
					/>
				</div>
			</div>
			{helperText && (
				<div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
					{helperText}
				</div>
			)}
		</div>
	);
};
InputField.displayName = "InputField";

const SECTOR_OPTIONS: { id: Sector; label: string }[] = [
	{ id: "private", label: "Private" },
	{ id: "public", label: "Public" },
	{ id: "selfemployed", label: "Self-Employed" },
];

const WORK_SCHEDULE_OPTIONS: { id: WorkSchedule; label: string }[] = [
	{ id: "mon-fri", label: "Mon-Fri" },
	{ id: "mon-sat", label: "Mon-Sat" },
	{ id: "mon-sun", label: "Mon-Sun" },
];

function getDeMinimisHelperText(salary: number, allowance: number): string {
	if (allowance > 0 && salary <= 0) {
		return "Enter basic pay to calculate de minimis benefits";
	}
	if (allowance <= DE_MINIMIS_MONTHLY_LIMIT) {
		return `Tax-free up to ₱${numberFormat(DE_MINIMIS_ANNUAL_LIMIT.toString())} annually (₱${numberFormat(
			Math.round(DE_MINIMIS_MONTHLY_LIMIT).toString(),
		)}/month)`;
	}
	return "Exceeds limit, excess will be taxed";
}

function getOvertimeHelperText(sector: Sector): string {
	return sector === "selfemployed"
		? "Not applicable"
		: "Assumes standard 25% rate";
}

function getNightDifferentialHelperText(sector: Sector): string {
	if (sector === "selfemployed") return "Not applicable";
	if (sector === "private") return "+10% pay from 10 PM to 6 AM";
	if (sector === "public") return "+20% pay from 6 PM to 6 AM";
	return "";
}

interface InputsProps {
	inputs: TaxInputs;
	setters: SalaryCalculatorSetters;
}

const Inputs = ({ inputs, setters }: InputsProps) => {
	const isSelfEmployed = inputs.sector === "selfemployed";

	return (
		<div className="p-3 rounded-lg bg-[#fbfcfd] dark:bg-gray-900 text-gray-900 dark:text-white">
			<div className="space-y-3">
				{/* Employment Type */}
				<div>
					<span className="label">Employment Type</span>
					<div className="flex mt-2 space-x-2 flex-wrap gap-y-2">
						{SECTOR_OPTIONS.map((option) => (
							<ToggleButton
								key={option.id}
								label={option.label}
								isActive={inputs.sector === option.id}
								onClick={() => setters.setSector(option.id)}
							/>
						))}
					</div>
				</div>

				<InputField
					label="Monthly Basic Pay"
					value={inputs.salary}
					onChange={setters.setSalary}
					placeholder="0.00"
					useCurrencyFormat
					step={1000}
				/>

				<InputField
					label="De Minimis Allowance"
					value={inputs.allowance}
					onChange={setters.setAllowance}
					placeholder="0.00"
					useCurrencyFormat
					step={500}
					helperText={getDeMinimisHelperText(inputs.salary, inputs.allowance)}
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<InputField
						label="Overtime Hours"
						value={isSelfEmployed ? 0 : inputs.overtimeHours}
						onChange={setters.setOvertimeHours}
						placeholder={isSelfEmployed ? "N/A" : "0"}
						disabled={isSelfEmployed}
						step={1}
						helperText={getOvertimeHelperText(inputs.sector)}
					/>
					<InputField
						label="Night Differential Hours"
						value={isSelfEmployed ? 0 : inputs.nightDifferentialHours}
						onChange={setters.setNightDifferentialHours}
						placeholder={isSelfEmployed ? "N/A" : "0"}
						disabled={isSelfEmployed}
						step={1}
						helperText={getNightDifferentialHelperText(inputs.sector)}
					/>
				</div>

				<div>
					<span className="label">Work Schedule</span>
					<div className="flex mt-2 space-x-2 flex-wrap gap-y-2">
						{WORK_SCHEDULE_OPTIONS.map((option) => (
							<ToggleButton
								key={option.id}
								label={option.label}
								isActive={inputs.workSchedule === option.id}
								onClick={() => setters.setWorkSchedule(option.id)}
							/>
						))}
					</div>
				</div>
			</div>

			<div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
				<strong>Note:</strong> This calculator is intended for estimation
				purposes only, it does not account for holidays or other unique
				circumstances.
			</div>
		</div>
	);
};

export default Inputs;