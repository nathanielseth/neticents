import { useState } from "react";
import {
	handleInput,
	computeWithholdingTax,
	computeSSS,
	computePhilHealth,
	computePagIbig,
	computeGSIS,
} from "../utils/calculation";

export const useSalaryCalculator = (
	setMonthlySalary,
	setAllowance,
	setTakeHomePay,
	setWithholdingTax
) => {
	const [activeSector, setActiveSector] = useState("private");
	const [allowanceTaxable, setAllowanceTaxable] = useState(false);
	const [monthlySalary, setMonthlySalaryValue] = useState("");
	const [allowance, setAllowanceValue] = useState("");

	const calculate = (salary, allowanceAmount, allowanceTaxable, sector) => {
		if (allowanceTaxable) salary += allowanceAmount;

		const annualIncome = salary * 12;

		let sss = 0,
			mpf = 0,
			gsis = 0;

		if (sector === "private") {
			sss = computeSSS(salary).sss;
			mpf = computeSSS(salary).mpf;
		} else {
			gsis = computeGSIS(salary);
		}

		const philHealth = computePhilHealth(salary);
		const pagIbig = computePagIbig();
		const totalDeductions =
			sector === "private"
				? sss + mpf + philHealth + pagIbig
				: gsis + philHealth + pagIbig;

		const taxableAnnualIncome = annualIncome - totalDeductions * 12;
		const calculatedWithholdingTax = computeWithholdingTax(taxableAnnualIncome);
		setWithholdingTax(calculatedWithholdingTax);

		const finalDeductions = totalDeductions + calculatedWithholdingTax;
		setTakeHomePay(
			calculateTakeHomePay(
				salary,
				finalDeductions,
				allowanceAmount,
				allowanceTaxable
			)
		);
	};

	const handleSalaryChange = (e) => {
		const formattedValue = handleInput(e.target.value);
		setMonthlySalaryValue(formattedValue);

		const salary = parseFloat(formattedValue.replace(/,/g, "")) || 0;
		setMonthlySalary(salary);

		const allowanceAmount = parseFloat(allowance.replace(/,/g, "")) || 0;
		calculate(salary, allowanceAmount, allowanceTaxable, activeSector);
	};

	const handleAllowanceChange = (e) => {
		const formattedValue = handleInput(e.target.value);
		setAllowanceValue(formattedValue);

		const allowanceAmount = parseFloat(formattedValue.replace(/,/g, "")) || 0;
		setAllowance(allowanceAmount);

		const salary = parseFloat(monthlySalary.replace(/,/g, "")) || 0;
		calculate(salary, allowanceAmount, allowanceTaxable, activeSector);
	};

	const handleTaxableChange = (taxable) => {
		setAllowanceTaxable(taxable);

		const salary = parseFloat(monthlySalary.replace(/,/g, "")) || 0;
		const allowanceAmount = parseFloat(allowance.replace(/,/g, "")) || 0;
		calculate(salary, allowanceAmount, taxable, activeSector);
	};

	const calculateTakeHomePay = (
		salary,
		totalDeductions,
		allowanceAmount,
		allowanceTaxable
	) => {
		const takeHomePay = salary - totalDeductions;
		return allowanceTaxable
			? takeHomePay > 0
				? takeHomePay.toFixed(2)
				: "₱0.00"
			: takeHomePay + allowanceAmount > 0
			? (takeHomePay + allowanceAmount).toFixed(2)
			: "₱0.00";
	};

	const handleSectorChange = (sector) => {
		setActiveSector(sector);
		const salary = parseFloat(monthlySalary.replace(/,/g, "")) || 0;
		const allowanceAmount = parseFloat(allowance.replace(/,/g, "")) || 0;
		calculate(salary, allowanceAmount, allowanceTaxable, sector);
	};

	return {
		activeSector,
		allowanceTaxable,
		monthlySalary,
		allowance,
		handleSalaryChange,
		handleAllowanceChange,
		handleSectorChange,
		handleTaxableChange,
	};
};
