import PropTypes from "prop-types";
import { useSalaryCalculator } from "../utils/useSalaryCalculator";
import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { handleInput, parseFormattedNumber } from "../utils/calculation";

const SECTOR_OPTIONS = [
	{ id: "private", label: "Private" },
	{ id: "public", label: "Public" },
	{ id: "selfemployed", label: "Self-Employed" },
];

const TAXABLE_OPTIONS = [
	{ id: true, label: "Taxable" },
	{ id: false, label: "Non-Taxable" },
];

const InputField = ({
	label,
	value,
	onChange,
	placeholder,
	theme,
	disabled = false,
	useFormatter = false,
	step = 1,
	min = 0,
}) => {
	const formatValue = (val) =>
		useFormatter ? handleInput(val.toString()) : val.toString();
	const parseValue = (val) =>
		useFormatter ? parseFormattedNumber(val || "0") : parseFloat(val || "0");

	const updateValue = (newValue) => {
		const clampedValue = Math.max(min, newValue);
		const syntheticEvent = {
			target: { value: formatValue(clampedValue) },
		};
		onChange(syntheticEvent);
	};

	const handleIncrement = () => {
		if (disabled) return;
		const currentValue = parseValue(value);
		updateValue(currentValue + step);
	};

	const handleDecrement = () => {
		if (disabled) return;
		const currentValue = parseValue(value);
		updateValue(currentValue - step);
	};

	return (
		<div className="mb-4">
			<label className="label">{label}</label>
			<div className="relative input-wrapper">
				<input
					type="text"
					inputMode="decimal"
					className={`input-field ${
						theme === "dark" ? "dark-mode" : "light-mode"
					} rounded-l pr-8 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					disabled={disabled}
				/>

				<div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
					<button
						type="button"
						onClick={handleIncrement}
						disabled={disabled}
						className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
							disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
						}`}
						tabIndex={-1}
					>
						<ChevronUp
							size={12}
							className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
						/>
					</button>
					<button
						type="button"
						onClick={handleDecrement}
						disabled={disabled}
						className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
							disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
						}`}
						tabIndex={-1}
					>
						<ChevronDown
							size={12}
							className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
						/>
					</button>
				</div>
			</div>
		</div>
	);
};

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
};

const ToggleButton = ({ label, isActive, onClick, theme }) => (
	<button
		type="button"
		onClick={onClick}
		className={`btn ${isActive ? "btn-active" : "btn-inactive"} ${
			theme === "dark" ? "dark-mode" : ""
		}`}
	>
		{label}
	</button>
);

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
	setAllowanceTaxable,
	theme,
	overtimeHours,
	setOvertimeHours,
	nightDifferentialHours,
	setNightDifferentialHours,
}) => {
	const {
		activeSector,
		allowanceTaxable,
		monthlySalary: displayMonthlySalary,
		allowance: displayAllowance,
		handleSalaryChange,
		handleAllowanceChange,
		handleSectorChange,
		handleTaxableChange,
		handleOvertimeHoursChange,
		handleNightDifferentialHoursChange,
	} = useSalaryCalculator(
		setMonthlySalary,
		setAllowance,
		setTakeHomePay,
		setWithholdingTax,
		setSector,
		setAllowanceTaxable,
		setOvertimeHours,
		setNightDifferentialHours
	);

	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const isOvertimeDisabled =
		activeSector === "selfemployed" || activeSector === "public";
	const isNightDiffDisabled = activeSector === "selfemployed";

	return (
		<div
			className={`p-6 rounded-lg ${
				theme === "dark"
					? "dark-mode bg-gray-900 text-white"
					: "bg-white text-gray-900"
			}`}
		>
			<div className="mb-4">
				<label className="label">Employment Type</label>
				<div className="flex mt-2 space-x-2 flex-wrap gap-y-2">
					{SECTOR_OPTIONS.map((sectorOpt) => (
						<ToggleButton
							key={sectorOpt.id}
							label={sectorOpt.label}
							isActive={activeSector === sectorOpt.id}
							onClick={() => handleSectorChange(sectorOpt.id)}
							theme={theme}
						/>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1">
				<InputField
					label="Monthly Basic Pay"
					value={displayMonthlySalary}
					onChange={handleSalaryChange}
					placeholder="0.00"
					theme={theme}
					useFormatter={true}
					step={1000}
					min={0}
				/>

				<InputField
					label="Allowance"
					value={displayAllowance}
					onChange={handleAllowanceChange}
					placeholder="0.00"
					theme={theme}
					useFormatter={true}
					step={500}
					min={0}
				/>
			</div>

			<div className="mb-4">
				<label className="label">Is Allowance Taxable?</label>
				<div className="flex mt-2 space-x-2">
					{TAXABLE_OPTIONS.map((option) => (
						<ToggleButton
							key={option.label}
							label={option.label}
							isActive={allowanceTaxable === option.id}
							onClick={() => handleTaxableChange(option.id)}
							theme={theme}
						/>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
				<InputField
					label="Overtime Hours"
					value={isOvertimeDisabled ? "" : overtimeHours}
					onChange={handleOvertimeHoursChange}
					placeholder={isOvertimeDisabled ? "N/A" : "0"}
					theme={theme}
					disabled={isOvertimeDisabled}
					useFormatter={false}
					step={1}
					min={0}
				/>

				<InputField
					label="Night Differential Hours"
					value={isNightDiffDisabled ? "" : nightDifferentialHours}
					onChange={handleNightDifferentialHoursChange}
					placeholder={isNightDiffDisabled ? "N/A" : "0"}
					theme={theme}
					disabled={isNightDiffDisabled}
					useFormatter={false}
					step={1}
					min={0}
				/>
			</div>

			<div
				className={`mt-1 text-sm ${
					theme === "dark" ? "text-gray-400" : "text-gray-600"
				}`}
				data-html2canvas-ignore
			>
				Note: This web application provides estimates based on standard working
				conditions and does not factor in holidays or other specific
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
	setAllowanceTaxable: PropTypes.func.isRequired,
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
