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
	const [activePeriod, setActivePeriod] = useState("monthly");
	const [allowanceTaxable, setAllowanceTaxable] = useState(false);
	const [monthlySalary, setMonthlySalaryValue] = useState("");
	const [allowance, setAllowanceValue] = useState("");

	const calculate = (
		salary,
		allowanceAmount,
		allowanceTaxable,
		sector,
		period
	) => {
		const annualIncome = salary * 12;

		salary =
			period === "annually"
				? salary * 12
				: period === "bi-weekly"
				? salary / 2
				: salary;

		let adjustedSalary = salary;
		if (allowanceTaxable) {
			adjustedSalary += allowanceAmount;
		}

		let sss = 0,
			mpf = 0,
			gsis = 0;

		if (sector === "private") {
			({ sss, mpf } = computeSSS(adjustedSalary));
		} else {
			gsis = computeGSIS(adjustedSalary);
		}

		let philHealth = computePhilHealth(adjustedSalary);
		let pagIbig = computePagIbig();

		if (period === "annually") {
			sss *= 12;
			mpf *= 12;
			gsis *= 12;
			pagIbig *= 12;
			philHealth *= 12;
		} else if (period === "bi-weekly") {
			sss /= 2;
			mpf /= 2;
			gsis /= 2;
			philHealth /= 2;
		}

		const totalDeductions =
			sector === "private"
				? sss + mpf + philHealth + pagIbig
				: gsis + philHealth + pagIbig;
		const totalAnnualDeductions = totalDeductions * 12;

		const taxableAnnualIncome = annualIncome - totalAnnualDeductions;

		const calculatedWithholdingTax = computeWithholdingTax(taxableAnnualIncome);

		const withholdingTax =
			period === "annually"
				? calculatedWithholdingTax * 12
				: period === "bi-weekly"
				? calculatedWithholdingTax / 26
				: calculatedWithholdingTax;

		setWithholdingTax(withholdingTax);

		const finalDeductions = totalDeductions + withholdingTax;

		const calculatedTakeHomePay = calculateTakeHomePay(
			salary,
			finalDeductions,
			allowanceAmount,
			allowanceTaxable
		);
		setTakeHomePay(calculatedTakeHomePay);
	};

	const handleSalaryChange = (e) => {
		const rawValue = e.target.value;
		const formattedValue = handleInput(rawValue);
		setMonthlySalaryValue(formattedValue);
		const salary = parseFloat(formattedValue.replace(/,/g, "")) || 0;
		setMonthlySalary(salary);

		const allowanceAmount = parseFloat(allowance.replace(/,/g, "")) || 0;
		calculate(
			salary,
			allowanceAmount,
			allowanceTaxable,
			activeSector,
			activePeriod
		);
	};

	const handleAllowanceChange = (e) => {
		const rawValue = e.target.value;
		const formattedValue = handleInput(rawValue);
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
		calculate(salary, allowanceAmount, taxable, activeSector, activePeriod);
	};

	const calculateTakeHomePay = (
		salary,
		totalDeductions,
		allowanceAmount,
		allowanceTaxable
	) => {
		const takeHomePay = salary - totalDeductions;
		const finalTakeHomePay = allowanceTaxable
			? takeHomePay
			: takeHomePay + allowanceAmount;
		return finalTakeHomePay > 0 ? finalTakeHomePay.toFixed(2) : "₱0.00";
	};

	const handleSectorChange = (sector) => {
		setActiveSector(sector);
		const salary = parseFloat(monthlySalary.replace(/,/g, "")) || 0;
		const allowanceAmount = parseFloat(allowance.replace(/,/g, "")) || 0;
		calculate(salary, allowanceAmount, allowanceTaxable, sector, activePeriod);
	};

	const handlePeriodChange = (period) => {
		setActivePeriod(period);
		const salary = parseFloat(monthlySalary.replace(/,/g, "")) || 0;
		const allowanceAmount = parseFloat(allowance.replace(/,/g, "")) || 0;
		calculate(salary, allowanceAmount, allowanceTaxable, activeSector, period);
	};

	return {
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
	};
};
