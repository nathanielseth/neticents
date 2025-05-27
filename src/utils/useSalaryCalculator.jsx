import { useState, useCallback, useEffect } from "react";
import {
	handleInput,
	computeWithholdingTax,
	computeSSS,
	computePhilHealth,
	computePagIbig,
	computeGSIS,
	parseFormattedNumber,
	numberFormat,
} from "../utils/calculation";

const DE_MINIMIS_ANNUAL_LIMIT = 90000;
const DE_MINIMIS_MONTHLY_LIMIT = DE_MINIMIS_ANNUAL_LIMIT / 12; // 7,500

export const useSalaryCalculator = (
	setMonthlySalary,
	setAllowance,
	setTakeHomePay,
	setWithholdingTax,
	setSector,
	setOvertimeHours,
	setNightDifferentialHours
) => {
	const [activeSector, setActiveSector] = useState("private");
	const [monthlySalary, setMonthlySalaryValue] = useState("");
	const [allowance, setAllowanceValue] = useState("");
	const [overtimeHours, setOvertimeHoursValue] = useState("");
	const [nightDifferentialHours, setNightDifferentialHoursValue] = useState("");

	useEffect(() => {
		if (activeSector === "selfemployed") {
			setOvertimeHoursValue("");
			setNightDifferentialHoursValue("");
			setOvertimeHours(0);
			setNightDifferentialHours(0);
		} else if (activeSector === "public") {
			setOvertimeHoursValue("");
			setOvertimeHours(0);
		}
	}, [activeSector, setOvertimeHours, setNightDifferentialHours]);

	const getDeMinimisHelperText = useCallback(() => {
		const salary = parseFormattedNumber(monthlySalary || "0");
		const allowanceAmount = parseFormattedNumber(allowance || "0");
		const monthlyLimit = DE_MINIMIS_MONTHLY_LIMIT;

		if (allowanceAmount > 0 && salary <= 0) {
			return "Enter basic pay to calculate de minimis benefits.";
		}

		if (allowanceAmount === 0) {
			return `Tax-free up to ₱${numberFormat(
				monthlyLimit.toFixed(0)
			)}/month (₱${numberFormat(DE_MINIMIS_ANNUAL_LIMIT)}/year)`;
		}

		if (allowanceAmount <= monthlyLimit) {
			const remaining = monthlyLimit - allowanceAmount;
			return `Tax-free (₱${numberFormat(
				remaining.toFixed(0)
			)} remaining this month)`;
		} else {
			const excess = allowanceAmount - monthlyLimit;
			return `Exceeds limit by ₱${numberFormat(
				excess.toFixed(0)
			)} and will be taxed.`;
		}
	}, [allowance, monthlySalary]);

	const calculatePremiumPay = useCallback(
		(hourlyRate, otHours, ndHours, sector) => {
			if (sector === "selfemployed") {
				return {
					regularOvertimePay: 0,
					regularNightPay: 0,
					nightOvertimePay: 0,
					totalPremiumPay: 0,
					breakdown: {
						regularOvertimeHours: 0,
						regularNightHours: 0,
						overlapHours: 0,
						rates: {
							overtime: 0,
							nightDiff: 0,
							nightOvertime: 0,
						},
					},
				};
			}

			const nightDiffRate = sector === "public" ? 1.2 : 1.1;
			const overtimeRate = 1.25;
			const nightOvertimeRate = 1.375;

			const effectiveOtHours = sector === "public" ? 0 : otHours;
			const overlapHours = Math.min(effectiveOtHours, ndHours);

			const regularOvertimeHours = effectiveOtHours - overlapHours;
			const regularNightHours = ndHours - overlapHours;

			const regularOvertimePay =
				regularOvertimeHours * hourlyRate * overtimeRate;
			const regularNightPay = regularNightHours * hourlyRate * nightDiffRate;
			const nightOvertimePay = overlapHours * hourlyRate * nightOvertimeRate;

			return {
				regularOvertimePay,
				regularNightPay,
				nightOvertimePay,
				totalPremiumPay:
					regularOvertimePay + regularNightPay + nightOvertimePay,
				breakdown: {
					regularOvertimeHours,
					regularNightHours,
					overlapHours,
					rates: {
						overtime: overtimeRate,
						nightDiff: nightDiffRate,
						nightOvertime: nightOvertimeRate,
					},
				},
			};
		},
		[]
	);

	const calculate = useCallback(
		(salary, allowanceAmount, sector, otHours, ndHours) => {
			// DON'T CALCULATE IF NO BASIC SALARY
			if (salary <= 0) {
				setWithholdingTax(0);
				setTakeHomePay(0);
				return;
			}

			const baseSalary = salary;
			const hourlyRate = salary / (22 * 8);

			const premiumPayResult = calculatePremiumPay(
				hourlyRate,
				otHours,
				ndHours,
				sector
			);
			const totalPremiumPay = premiumPayResult.totalPremiumPay;

			const totalGrossPay = baseSalary + totalPremiumPay;

			const monthlyDeMinimisLimit = DE_MINIMIS_MONTHLY_LIMIT; // 7,500
			const taxableAllowance = Math.max(
				0,
				allowanceAmount - monthlyDeMinimisLimit
			);

			const taxableSalary = totalGrossPay + taxableAllowance;
			const annualIncome = taxableSalary * 12;

			const contributions = {
				sss: 0,
				mpf: 0,
				gsis: 0,
				philHealth: 0,
				pagIbig: computePagIbig(taxableSalary),
			};

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
				contributions.philHealth = computePhilHealth(taxableSalary, false);
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
			const netPay = totalGrossPay - totalDeductions;

			const finalTakeHome = Math.max(netPay + allowanceAmount, 0);

			setTakeHomePay(parseFloat(finalTakeHome.toFixed(2)));
		},
		[setWithholdingTax, setTakeHomePay, calculatePremiumPay]
	);

	const parseValue = useCallback((formattedValue) => {
		return parseFormattedNumber(formattedValue);
	}, []);

	const handleSalaryChange = useCallback(
		(e) => {
			let raw = e.target.value;
			const stringValue = String(raw);
			if (stringValue.length > 14) return;

			const formattedValue = handleInput(e.target.value);
			setMonthlySalaryValue(formattedValue);

			const salary = parseValue(formattedValue);
			setMonthlySalary(salary);

			const allowanceAmount = parseValue(allowance);
			const otHours = parseValue(overtimeHours);
			const ndHours = parseValue(nightDifferentialHours);
			calculate(salary, allowanceAmount, activeSector, otHours, ndHours);
		},
		[
			allowance,
			overtimeHours,
			nightDifferentialHours,
			activeSector,
			calculate,
			parseValue,
			setMonthlySalary,
		]
	);

	const handleAllowanceChange = useCallback(
		(e) => {
			let raw = e.target.value;
			const stringValue = String(raw);
			if (stringValue.length > 14) return;

			const formattedValue = handleInput(e.target.value);
			setAllowanceValue(formattedValue);

			const allowanceAmount = parseValue(formattedValue);
			setAllowance(allowanceAmount);

			const salary = parseValue(monthlySalary);
			const otHours = parseValue(overtimeHours);
			const ndHours = parseValue(nightDifferentialHours);
			calculate(salary, allowanceAmount, activeSector, otHours, ndHours);
		},
		[
			monthlySalary,
			overtimeHours,
			nightDifferentialHours,
			activeSector,
			calculate,
			parseValue,
			setAllowance,
		]
	);

	const handleSectorChange = useCallback(
		(sector) => {
			setActiveSector(sector);
			setSector(sector);

			const salary = parseValue(monthlySalary);
			const allowanceAmount = parseValue(allowance);
			const otHours = parseValue(overtimeHours);
			const ndHours = parseValue(nightDifferentialHours);
			calculate(salary, allowanceAmount, sector, otHours, ndHours);
		},
		[
			monthlySalary,
			allowance,
			overtimeHours,
			nightDifferentialHours,
			calculate,
			parseValue,
			setSector,
		]
	);

	const handleOvertimeHoursChange = useCallback(
		(e) => {
			if (activeSector === "selfemployed" || activeSector === "public") {
				return;
			}
			let raw = e.target.value;
			const stringValue = String(raw);
			if (stringValue.length > 3) return;

			const formattedValue = handleInput(e.target.value);
			setOvertimeHoursValue(formattedValue);

			const otHours = parseValue(formattedValue);
			setOvertimeHours(otHours);

			const salary = parseValue(monthlySalary);
			const allowanceAmount = parseValue(allowance);
			const ndHours = parseValue(nightDifferentialHours);
			calculate(salary, allowanceAmount, activeSector, otHours, ndHours);
		},
		[
			activeSector,
			monthlySalary,
			allowance,
			nightDifferentialHours,
			calculate,
			parseValue,
			setOvertimeHours,
		]
	);

	const handleNightDifferentialHoursChange = useCallback(
		(e) => {
			if (activeSector === "selfemployed") {
				return;
			}
			let raw = e.target.value;
			const stringValue = String(raw);
			if (stringValue.length > 3) return;

			const formattedValue = handleInput(e.target.value);
			setNightDifferentialHoursValue(formattedValue);

			const ndHours = parseValue(formattedValue);
			setNightDifferentialHours(ndHours);

			const salary = parseValue(monthlySalary);
			const allowanceAmount = parseValue(allowance);
			const otHours = parseValue(overtimeHours);
			calculate(salary, allowanceAmount, activeSector, otHours, ndHours);
		},
		[
			activeSector,
			monthlySalary,
			allowance,
			overtimeHours,
			calculate,
			parseValue,
			setNightDifferentialHours,
		]
	);

	return {
		activeSector,
		monthlySalary,
		allowance,
		overtimeHours,
		nightDifferentialHours,
		handleSalaryChange,
		handleAllowanceChange,
		handleSectorChange,
		handleOvertimeHoursChange,
		handleNightDifferentialHoursChange,
		getDeMinimisHelperText,
	};
};
