import PropTypes from "prop-types";
import { useSalaryCalculator } from "../utils/useSalaryCalculator";
import { useEffect, useState } from "react";

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
	maxLength,
	theme,
	type = "text",
	inputMode = "text",
	disabled = false,
}) => (
	<div className="mb-4">
		<label className="label">{label}</label>
		<div className="input-wrapper">
			<input
				type={type}
				inputMode={inputMode}
				className={`input-field ${
					theme === "dark" ? "dark-mode" : "light-mode"
				} rounded-l focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-blue-500 dark:focus:ring-blue-400 ${
					disabled ? "opacity-50 cursor-not-allowed" : ""
				}`}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				maxLength={maxLength}
				disabled={disabled}
			/>
		</div>
	</div>
);

InputField.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	maxLength: PropTypes.number,
	theme: PropTypes.string.isRequired,
	type: PropTypes.string,
	inputMode: PropTypes.string,
	disabled: PropTypes.bool,
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

	// Determine if fields should be disabled based on sector
	const isOvertimeDisabled =
		activeSector === "selfemployed" || activeSector === "public";
	const isNightDiffDisabled = activeSector === "selfemployed";

	return (
		<div
			className={`p-6 rounded-lg ${
				theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
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

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
				<InputField
					label="Monthly Basic Pay"
					value={displayMonthlySalary}
					onChange={handleSalaryChange}
					placeholder="0.00"
					maxLength={14}
					theme={theme}
					inputMode="decimal"
				/>

				<InputField
					label="Allowance"
					value={displayAllowance}
					onChange={handleAllowanceChange}
					placeholder="0.00"
					maxLength={14}
					theme={theme}
					inputMode="decimal"
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

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
				<InputField
					label={"Overtime Hours"}
					value={isOvertimeDisabled ? "" : overtimeHours}
					onChange={handleOvertimeHoursChange}
					placeholder={isOvertimeDisabled ? "N/A" : "0"}
					maxLength={3}
					theme={theme}
					inputMode="decimal"
					disabled={isOvertimeDisabled}
				/>

				<InputField
					label={"Night Differential Hours"}
					value={isNightDiffDisabled ? "" : nightDifferentialHours}
					onChange={handleNightDifferentialHoursChange}
					placeholder={isNightDiffDisabled ? "N/A" : "0"}
					maxLength={3}
					theme={theme}
					inputMode="decimal"
					disabled={isNightDiffDisabled}
				/>
			</div>

			{!isMobile && (
				<div
					className={`mt-6 text-sm ${
						theme === "dark" ? "text-gray-400" : "text-gray-600"
					}`}
					data-html2canvas-ignore
				>
					Note: This web application serves as a tool for estimation purposes
					and should not be considered a replacement for payroll professionals.
				</div>
			)}
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
