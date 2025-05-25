import { useState, useCallback } from "react";
import {
	handleInput,
	computeWithholdingTax,
	computeSSS,
	computePhilHealth,
	computePagIbig,
	computeGSIS,
	parseFormattedNumber,
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

	const calculate = useCallback(
		(salary, allowanceAmount, isAllowanceTaxable, sector) => {
			const baseSalary = salary;
			const taxableSalary = isAllowanceTaxable
				? salary + allowanceAmount
				: salary;
			const annualIncome = taxableSalary * 12;

			const contributions = {
				sss: 0,
				mpf: 0,
				gsis: 0,
				philHealth: 0,
				pagIbig: computePagIbig(taxableSalary),
			};

			// Determine contribution rates based on sector
			const isSelfEmployed = sector === "selfemployed";

			if (sector === "private" || sector === "selfemployed") {
				const sssResult = computeSSS(taxableSalary, isSelfEmployed);
				contributions.sss = sssResult.sss;
				contributions.mpf = sssResult.mpf;
				contributions.philHealth = computePhilHealth(
					taxableSalary,
					isSelfEmployed
				);
			} else if (sector === "public") {
				contributions.gsis = computeGSIS(taxableSalary);
				contributions.philHealth = computePhilHealth(taxableSalary, false); // Public employees share 50/50
			}

			const totalContributions =
				sector === "public"
					? contributions.gsis +
					  contributions.philHealth +
					  contributions.pagIbig
					: contributions.sss +
					  contributions.mpf +
					  contributions.philHealth +
					  contributions.pagIbig;

			const taxableAnnualIncome = annualIncome - totalContributions * 12;
			const monthlyWithholdingTax = computeWithholdingTax(taxableAnnualIncome);
			setWithholdingTax(monthlyWithholdingTax);

			const totalDeductions = totalContributions + monthlyWithholdingTax;
			const netPay = baseSalary - totalDeductions;
			const finalTakeHome = isAllowanceTaxable
				? Math.max(netPay, 0)
				: Math.max(netPay + allowanceAmount, 0);

			setTakeHomePay(parseFloat(finalTakeHome.toFixed(2)));
		},
		[setWithholdingTax, setTakeHomePay]
	);

	const parseValue = useCallback((formattedValue) => {
		return parseFormattedNumber(formattedValue);
	}, []);

	const handleSalaryChange = useCallback(
		(e) => {
			const formattedValue = handleInput(e.target.value);
			setMonthlySalaryValue(formattedValue);

			const salary = parseValue(formattedValue);
			const allowanceAmount = parseValue(allowance);

			setMonthlySalary(salary);
			calculate(salary, allowanceAmount, allowanceTaxable, activeSector);
		},
		[
			allowance,
			allowanceTaxable,
			activeSector,
			calculate,
			parseValue,
			setMonthlySalary,
		]
	);

	const handleAllowanceChange = useCallback(
		(e) => {
			const formattedValue = handleInput(e.target.value);
			setAllowanceValue(formattedValue);

			const allowanceAmount = parseValue(formattedValue);
			const salary = parseValue(monthlySalary);

			setAllowance(allowanceAmount);
			calculate(salary, allowanceAmount, allowanceTaxable, activeSector);
		},
		[
			monthlySalary,
			allowanceTaxable,
			activeSector,
			calculate,
			parseValue,
			setAllowance,
		]
	);

	const handleTaxableChange = useCallback(
		(taxable) => {
			setAllowanceTaxable(taxable);

			const salary = parseValue(monthlySalary);
			const allowanceAmount = parseValue(allowance);

			calculate(salary, allowanceAmount, taxable, activeSector);
		},
		[monthlySalary, allowance, activeSector, calculate, parseValue]
	);

	const handleSectorChange = useCallback(
		(sector) => {
			setActiveSector(sector);

			const salary = parseValue(monthlySalary);
			const allowanceAmount = parseValue(allowance);

			calculate(salary, allowanceAmount, allowanceTaxable, sector);
		},
		[monthlySalary, allowance, allowanceTaxable, calculate, parseValue]
	);

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
