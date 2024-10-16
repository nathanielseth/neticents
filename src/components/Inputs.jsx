import PropTypes from "prop-types";
import { useSalaryCalculator } from "../utils/useSalaryCalculator";

const Inputs = ({
	setMonthlySalary,
	setAllowance,
	setTakeHomePay,
	setWithholdingTax,
	setSector,
}) => {
	const {
		activeSector,
		activePeriod,
		allowanceTaxable,
		monthlySalary,
		allowance,
		handleSalaryChange,
		handleAllowanceChange,
		handleSectorChange,
		handlePeriodChange,
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
			className={`btn ${isActive ? "btn-active" : "btn-inactive"}`}
		>
			{label.charAt(0).toUpperCase() + label.slice(1)}
		</button>
	);

	return (
		<div className="p-6 rounded-lg">
			<label className="label">Monthly Salary</label>
			<div className="input-wrapper">
				<span className="input-prefix">PHP</span>
				<input
					type="text"
					className="input-field"
					placeholder="0.00"
					value={monthlySalary}
					onChange={handleSalaryChange}
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
				<span className="input-prefix">PHP</span>
				<input
					type="text"
					className="input-field"
					placeholder="(optional)"
					value={allowance}
					onChange={handleAllowanceChange}
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

			<label className="label">Period</label>
			<div className="flex mt-2 space-x-2">
				{["monthly", "bi-weekly", "annually"].map((period, index) => (
					<div key={index}>
						{renderButton(period, activePeriod === period, () =>
							handlePeriodChange(period)
						)}
					</div>
				))}
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
};

export default Inputs;
