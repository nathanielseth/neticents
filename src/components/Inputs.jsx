import PropTypes from "prop-types";
import { useState } from "react";

const Inputs = ({ setMonthlySalary, setAllowance, setSector, setPeriod }) => {
	const [activeSector, setActiveSector] = useState("private");
	const [activePeriod, setActivePeriod] = useState("monthly");
	const [allowanceTaxable, setAllowanceTaxable] = useState(false);

	const handleSalaryChange = (e) => setMonthlySalary(e.target.value);
	const handleAllowanceChange = (e) => setAllowance(e.target.value);
	const handleSectorChange = (sector) => {
		setActiveSector(sector);
		setSector(sector);
	};
	const handlePeriodChange = (period) => {
		setActivePeriod(period);
		setPeriod(period);
	};
	const handleTaxableChange = (taxable) => {
		setAllowanceTaxable(taxable);
	};

	return (
		<div className="p-6 rounded-lg">
			<label className="label">Monthly Salary</label>
			<div className="input-wrapper">
				<span className="input-prefix">PHP</span>
				<input
					type="text"
					className="input-field"
					placeholder="0.00"
					onChange={handleSalaryChange}
				/>
			</div>

			<label className="label">Sector</label>
			<div className="flex mt-2 space-x-2">
				{["private", "public"].map((sector) => (
					<button
						key={sector}
						onClick={() => handleSectorChange(sector)}
						className={`${"btn"} ${
							activeSector === sector ? "btn-active" : "btn-inactive"
						}`}
					>
						{sector.charAt(0).toUpperCase() + sector.slice(1)}
					</button>
				))}
			</div>

			<label className="label">Allowance</label>
			<div className="input-wrapper">
				<span className="input-prefix">PHP</span>
				<input
					type="text"
					className="input-field"
					placeholder="(optional)"
					onChange={handleAllowanceChange}
				/>
			</div>

			<label className="label">Is Allowance Taxable?</label>
			<div className="flex mt-2 space-x-2">
				{["Taxable", "Non-Taxable"].map((type, index) => (
					<button
						key={type}
						onClick={() => handleTaxableChange(index === 0)}
						className={`${"btn"} ${
							allowanceTaxable === (index === 0) ? "btn-active" : "btn-inactive"
						}`}
					>
						{type}
					</button>
				))}
			</div>

			<label className="label">Period</label>
			<div className="flex mt-2 space-x-2">
				{["monthly", "bi-weekly", "annually"].map((period) => (
					<button
						key={period}
						onClick={() => handlePeriodChange(period)}
						className={`${"btn"} ${
							activePeriod === period ? "btn-active" : "btn-inactive"
						}`}
					>
						{period.charAt(0).toUpperCase() + period.slice(1)}
					</button>
				))}
			</div>
		</div>
	);
};

Inputs.propTypes = {
	setMonthlySalary: PropTypes.func.isRequired,
	setAllowance: PropTypes.func.isRequired,
	setSector: PropTypes.func.isRequired,
	setPeriod: PropTypes.func.isRequired,
};

export default Inputs;
