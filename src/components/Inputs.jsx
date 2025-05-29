import PropTypes from "prop-types";
import { useRef, useEffect, useCallback, memo } from "react";
import { useSalaryCalculator } from "../utils/useSalaryCalculator";
import { ChevronUp, ChevronDown } from "lucide-react";
import { handleInput, parseFormattedNumber } from "../utils/calculation";

const SECTOR_OPTIONS = [
	{ id: "private", label: "Private" },
	{ id: "public", label: "Public" },
	{ id: "selfemployed", label: "Self-Employed" },
];

const WORK_SCHEDULE_OPTIONS = [
	{ id: "mon-fri", label: "Mon-Fri" },
	{ id: "mon-sat", label: "Mon-Sat" },
	{ id: "mon-sun", label: "Mon-Sun" },
];

const SpinButton = memo(({ direction, onClick, onStop, disabled, theme }) => {
	const Icon = direction === "up" ? ChevronUp : ChevronDown;

	return (
		<button
			type="button"
			onMouseDown={onClick}
			onMouseUp={onStop}
			onMouseLeave={onStop}
			onTouchStart={onClick}
			onTouchEnd={onStop}
			disabled={disabled}
			className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
				disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
			}`}
			tabIndex={-1}
		>
			<Icon
				size={12}
				className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
			/>
		</button>
	);
});

SpinButton.displayName = "SpinButton";

SpinButton.propTypes = {
	direction: PropTypes.oneOf(["up", "down"]).isRequired,
	onClick: PropTypes.func.isRequired,
	onStop: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
	theme: PropTypes.string.isRequired,
};

const InputField = memo(
	({
		label,
		value,
		onChange,
		placeholder,
		theme,
		disabled = false,
		useFormatter = false,
		step = 1,
		min = 0,
		helperText = null,
	}) => {
		const intervalRef = useRef(null);
		const timeoutRef = useRef(null);

		const formatValue = useCallback(
			(val) => (useFormatter ? handleInput(val.toString()) : val.toString()),
			[useFormatter]
		);

		const parseValue = useCallback(
			(val) =>
				useFormatter
					? parseFormattedNumber(val || "0")
					: parseFloat(val || "0"),
			[useFormatter]
		);

		const updateValue = useCallback(
			(newValue) => {
				const clampedValue = Math.max(min, newValue);
				const syntheticEvent = {
					target: { value: formatValue(clampedValue) },
				};
				onChange(syntheticEvent);
			},
			[min, formatValue, onChange]
		);

		const stopChangingValue = useCallback(() => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		}, []);

		const performIncrement = useCallback(() => {
			if (disabled) return;
			const currentValue = parseValue(value);
			updateValue(currentValue + step);
		}, [disabled, parseValue, value, updateValue, step]);

		const performDecrement = useCallback(() => {
			if (disabled) return;
			const currentValue = parseValue(value);
			updateValue(currentValue - step);
		}, [disabled, parseValue, value, updateValue, step]);

		const latestIncrementFn = useRef(performIncrement);
		const latestDecrementFn = useRef(performDecrement);

		useEffect(() => {
			latestIncrementFn.current = performIncrement;
		}, [performIncrement]);

		useEffect(() => {
			latestDecrementFn.current = performDecrement;
		}, [performDecrement]);

		const startRepeatingAction = useCallback(
			(actionType) => {
				if (actionType === "increment") {
					latestIncrementFn.current();
				} else {
					latestDecrementFn.current();
				}

				stopChangingValue();

				timeoutRef.current = setTimeout(() => {
					intervalRef.current = setInterval(() => {
						if (actionType === "increment") {
							latestIncrementFn.current();
						} else {
							latestDecrementFn.current();
						}
					}, 100);
				}, 400);
			},
			[stopChangingValue]
		);

		useEffect(() => {
			return stopChangingValue;
		}, [stopChangingValue]);

		return (
			<div>
				<label className="label">{label}</label>
				<div className="relative input-wrapper">
					<input
						type="text"
						inputMode="decimal"
						className={`input-field ${
							theme === "dark" ? "dark-mode" : "light-mode"
						} rounded-l pr-8 ${
							disabled ? "opacity-50 cursor-not-allowed" : ""
						}`}
						placeholder={placeholder}
						value={value}
						onChange={onChange}
						disabled={disabled}
					/>
					<div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
						<SpinButton
							direction="up"
							onClick={() => startRepeatingAction("increment")}
							onStop={stopChangingValue}
							disabled={disabled}
							theme={theme}
						/>
						<SpinButton
							direction="down"
							onClick={() => startRepeatingAction("decrement")}
							onStop={stopChangingValue}
							disabled={disabled}
							theme={theme}
						/>
					</div>
				</div>
				{helperText && (
					<div className="mt-1 text-xs text-gray-500">{helperText}</div>
				)}
			</div>
		);
	}
);

InputField.displayName = "InputField";

InputField.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	theme: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	useFormatter: PropTypes.bool,
	step: PropTypes.number,
	min: PropTypes.number,
	helperText: PropTypes.string,
};

const ToggleButton = memo(({ label, isActive, onClick, theme }) => (
	<button
		type="button"
		onClick={onClick}
		className={`btn ${isActive ? "btn-active" : "btn-inactive"} ${
			theme === "dark" ? "dark-mode" : ""
		}`}
	>
		{label}
	</button>
));

ToggleButton.displayName = "ToggleButton";

ToggleButton.propTypes = {
	label: PropTypes.string.isRequired,
	isActive: PropTypes.bool.isRequired,
	onClick: PropTypes.func.isRequired,
	theme: PropTypes.string.isRequired,
};

const Inputs = ({
	setMonthlySalary,
	setAllowance,
	setTakeHomePay,
	setWithholdingTax,
	setSector,
	theme,
	overtimeHours,
	setOvertimeHours,
	nightDifferentialHours,
	setNightDifferentialHours,
}) => {
	const {
		activeSector,
		workSchedule,
		monthlySalary: displayMonthlySalary,
		allowance: displayAllowance,
		handleSalaryChange,
		handleAllowanceChange,
		handleSectorChange,
		handleWorkScheduleChange,
		handleOvertimeHoursChange,
		handleNightDifferentialHoursChange,
		getDeMinimisHelperText,
	} = useSalaryCalculator(
		setMonthlySalary,
		setAllowance,
		setTakeHomePay,
		setWithholdingTax,
		setSector,
		setOvertimeHours,
		setNightDifferentialHours
	);

	const isSelfEmployed = activeSector === "selfemployed";

	const getOvertimeHelperText = () => {
		return isSelfEmployed ? "Not applicable" : "Assumes standard 25% rate";
	};

	const getNightDifferentialHelperText = () => {
		if (isSelfEmployed) return "Not applicable";
		if (activeSector === "private") return "+10% pay from 10 PM to 6 AM";
		if (activeSector === "public") return "+20% pay from 6 PM to 6 AM";
		return "";
	};

	return (
		<div
			className={`p-6 rounded-lg ${
				theme === "dark"
					? "dark-mode bg-gray-900 text-white"
					: "bg-[#fbfcfd] text-gray-900"
			}`}
		>
			<div className="space-y-3">
				<div>
					<label className="label">Employment Type</label>
					<div className="flex mt-2 space-x-2 flex-wrap gap-y-2">
						{SECTOR_OPTIONS.map((sector) => (
							<ToggleButton
								key={sector.id}
								label={sector.label}
								isActive={activeSector === sector.id}
								onClick={() => handleSectorChange(sector.id)}
								theme={theme}
							/>
						))}
					</div>
				</div>

				<InputField
					label="Monthly Basic Pay"
					value={displayMonthlySalary}
					onChange={handleSalaryChange}
					placeholder="0.00"
					theme={theme}
					useFormatter
					step={1000}
					min={0}
				/>

				<InputField
					label="De Minimis Allowance"
					value={displayAllowance}
					onChange={handleAllowanceChange}
					placeholder="0.00"
					theme={theme}
					useFormatter
					step={500}
					min={0}
					helperText={getDeMinimisHelperText()}
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<InputField
						label="Overtime Hours"
						value={isSelfEmployed ? "" : overtimeHours}
						onChange={handleOvertimeHoursChange}
						placeholder={isSelfEmployed ? "N/A" : "0"}
						theme={theme}
						disabled={isSelfEmployed}
						step={1}
						min={0}
						helperText={getOvertimeHelperText()}
					/>

					<InputField
						label="Night Differential Hours"
						value={isSelfEmployed ? "" : nightDifferentialHours}
						onChange={handleNightDifferentialHoursChange}
						placeholder={isSelfEmployed ? "N/A" : "0"}
						theme={theme}
						disabled={isSelfEmployed}
						step={1}
						min={0}
						helperText={getNightDifferentialHelperText()}
					/>
				</div>

				<div>
					<label className="label">Work Schedule</label>
					<div className="flex mt-2 space-x-2 flex-wrap gap-y-2">
						{WORK_SCHEDULE_OPTIONS.map((schedule) => (
							<ToggleButton
								key={schedule.id}
								label={schedule.label}
								isActive={workSchedule === schedule.id}
								onClick={() => handleWorkScheduleChange(schedule.id)}
								theme={theme}
							/>
						))}
					</div>
				</div>
			</div>

			<div className="mt-6 text-sm text-gray-500">
				<strong>Note:</strong> This calculator is intended for estimation
				purposes only, it does not account for holidays or other unique
				circumstances.
			</div>
		</div>
	);
};

Inputs.propTypes = {
	setMonthlySalary: PropTypes.func.isRequired,
	setAllowance: PropTypes.func.isRequired,
	setSector: PropTypes.func.isRequired,
	setTakeHomePay: PropTypes.func.isRequired,
	setWithholdingTax: PropTypes.func.isRequired,
	theme: PropTypes.string.isRequired,
	overtimeHours: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		.isRequired,
	setOvertimeHours: PropTypes.func.isRequired,
	nightDifferentialHours: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number,
	]).isRequired,
	setNightDifferentialHours: PropTypes.func.isRequired,
};

export default Inputs;
