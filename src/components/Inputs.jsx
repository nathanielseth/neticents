import PropTypes from "prop-types";
import { useSalaryCalculator } from "../utils/useSalaryCalculator";

const Inputs = ({
	setMonthlySalary,
	setAllowance,
	setTakeHomePay,
	setWithholdingTax,
	setSector,
	theme,
}) => {
	const {
		activeSector,
		allowanceTaxable,
		monthlySalary,
		allowance,
		handleSalaryChange,
		handleAllowanceChange,
		handleSectorChange,
		handleTaxableChange,
	} = useSalaryCalculator(
		setMonthlySalary,
		setAllowance,
		setTakeHomePay,
		setWithholdingTax
	);

	const handleSectorClick = (sector) => {
		handleSectorChange(sector);
		setSector(sector);
	};

	const renderButton = (label, isActive, onClick) => (
		<button
			onClick={onClick}
			className={`btn ${isActive ? "btn-active" : "btn-inactive"} ${
				theme === "dark" ? "dark-mode" : ""
			}`} // Add theme-based styles
		>
			{label.charAt(0).toUpperCase() + label.slice(1)}
		</button>
	);

	const isMobile = window.innerWidth < 768;

	return (
		<div
			className={`p-6 rounded-lg ${
				theme === "dark" ? "bg-gray-900  text-white" : "bg-white text-gray-900"
			}`}
		>
			<label className="label">Monthly Basic Pay</label>
			<div className="input-wrapper">
				<span
					className={`input-prefix ${
						theme === "dark" ? "dark-mode" : "light-mode"
					}`}
				>
					PHP
				</span>
				<input
					type="text"
					className={`input-field ${
						theme === "dark" ? "dark-mode" : "light-mode"
					}`}
					placeholder="0.00"
					value={monthlySalary}
					onChange={handleSalaryChange}
					maxLength={14}
				/>
			</div>

			<label className="label">Sector</label>
			<div className="flex mt-2 space-x-2">
				{["private", "public"].map((sector, index) => (
					<div key={index}>
						{renderButton(sector, activeSector === sector, () =>
							handleSectorClick(sector)
						)}
					</div>
				))}
			</div>

			<label className="label">Allowance</label>
			<div className="input-wrapper">
				<span
					className={`input-prefix ${
						theme === "dark" ? "dark-mode" : "light-mode"
					}`}
				>
					PHP
				</span>
				<input
					type="text"
					className={`input-field ${theme === "dark" ? "dark-mode" : ""}`}
					value={allowance}
					placeholder="0.00"
					onChange={handleAllowanceChange}
					maxLength={14}
				/>
			</div>

			<label className="label">Is Allowance Taxable?</label>
			<div className="flex mt-2 space-x-2">
				{["Taxable", "Non-Taxable"].map((type, index) => (
					<div key={index}>
						{renderButton(type, allowanceTaxable === (index === 0), () =>
							handleTaxableChange(index === 0)
						)}
					</div>
				))}
			</div>

			{!isMobile && (
				<div
					className={`mt-9 text-sm ${
						theme === "dark" ? "text-gray-400" : "text-gray-600"
					}`}
					data-html2canvas-ignore
				>
					Note: Overtime and other special factors are not included in this
					calculation. This web application serves as a tool for estimation
					purposes and should not be considered a replacement for payroll
					professionals.
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
	theme: PropTypes.string.isRequired,
};

export default Inputs;
