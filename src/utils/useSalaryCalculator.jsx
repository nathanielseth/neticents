import { useState, useCallback, useEffect } from "react";
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
	setWithholdingTax,
	setSector,
	setAllowanceTaxable,
	setOvertimeHours,
	setNightDifferentialHours
) => {
	const [activeSector, setActiveSector] = useState("private");
	const [allowanceTaxable, setAllowanceTaxableState] = useState(false);
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
		(salary, allowanceAmount, isAllowanceTaxable, sector, otHours, ndHours) => {
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

			// For tax calculation: include allowance if taxable
			const taxableSalary = isAllowanceTaxable
				? totalGrossPay + allowanceAmount
				: totalGrossPay;
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

			// BUG FIX: Always add allowance to final take-home pay
			// The tax status only affects whether allowance was included in tax calculations above
			const finalTakeHome = Math.max(netPay + allowanceAmount, 0);

			setTakeHomePay(parseFloat(finalTakeHome.toFixed(2)));

			return {
				baseSalary,
				hourlyRate,
				premiumPayBreakdown: premiumPayResult.breakdown,
				totalGrossPay,
				finalTakeHome,
			};
		},
		[setWithholdingTax, setTakeHomePay, calculatePremiumPay]
	);

	const parseValue = useCallback((formattedValue) => {
		return parseFormattedNumber(formattedValue);
	}, []);

	const handleSalaryChange = useCallback(
		(e) => {
			const formattedValue = handleInput(e.target.value);
			setMonthlySalaryValue(formattedValue);

			const salary = parseValue(formattedValue);
			setMonthlySalary(salary);

			const allowanceAmount = parseValue(allowance);
			const otHours = parseValue(overtimeHours);
			const ndHours = parseValue(nightDifferentialHours);
			calculate(
				salary,
				allowanceAmount,
				allowanceTaxable,
				activeSector,
				otHours,
				ndHours
			);
		},
		[
			allowance,
			overtimeHours,
			nightDifferentialHours,
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
			setAllowance(allowanceAmount);

			const salary = parseValue(monthlySalary);
			const otHours = parseValue(overtimeHours);
			const ndHours = parseValue(nightDifferentialHours);
			calculate(
				salary,
				allowanceAmount,
				allowanceTaxable,
				activeSector,
				otHours,
				ndHours
			);
		},
		[
			monthlySalary,
			overtimeHours,
			nightDifferentialHours,
			allowanceTaxable,
			activeSector,
			calculate,
			parseValue,
			setAllowance,
		]
	);

	const handleTaxableChange = useCallback(
		(taxable) => {
			setAllowanceTaxableState(taxable);
			setAllowanceTaxable(taxable);

			const salary = parseValue(monthlySalary);
			const allowanceAmount = parseValue(allowance);
			const otHours = parseValue(overtimeHours);
			const ndHours = parseValue(nightDifferentialHours);
			calculate(
				salary,
				allowanceAmount,
				taxable,
				activeSector,
				otHours,
				ndHours
			);
		},
		[
			monthlySalary,
			allowance,
			overtimeHours,
			nightDifferentialHours,
			activeSector,
			calculate,
			parseValue,
			setAllowanceTaxable,
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
			calculate(
				salary,
				allowanceAmount,
				allowanceTaxable,
				sector,
				otHours,
				ndHours
			);
		},
		[
			monthlySalary,
			allowance,
			overtimeHours,
			nightDifferentialHours,
			allowanceTaxable,
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

			const formattedValue = handleInput(e.target.value);
			setOvertimeHoursValue(formattedValue);

			const otHours = parseValue(formattedValue);
			setOvertimeHours(otHours);

			const salary = parseValue(monthlySalary);
			const allowanceAmount = parseValue(allowance);
			const ndHours = parseValue(nightDifferentialHours);
			calculate(
				salary,
				allowanceAmount,
				allowanceTaxable,
				activeSector,
				otHours,
				ndHours
			);
		},
		[
			activeSector,
			monthlySalary,
			allowance,
			nightDifferentialHours,
			allowanceTaxable,
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

			const formattedValue = handleInput(e.target.value);
			setNightDifferentialHoursValue(formattedValue);

			const ndHours = parseValue(formattedValue);
			setNightDifferentialHours(ndHours);

			const salary = parseValue(monthlySalary);
			const allowanceAmount = parseValue(allowance);
			const otHours = parseValue(overtimeHours);
			calculate(
				salary,
				allowanceAmount,
				allowanceTaxable,
				activeSector,
				otHours,
				ndHours
			);
		},
		[
			activeSector,
			monthlySalary,
			allowance,
			overtimeHours,
			allowanceTaxable,
			calculate,
			parseValue,
			setNightDifferentialHours,
		]
	);

	return {
		activeSector,
		allowanceTaxable,
		monthlySalary,
		allowance,
		overtimeHours,
		nightDifferentialHours,
		handleSalaryChange,
		handleAllowanceChange,
		handleSectorChange,
		handleTaxableChange,
		handleOvertimeHoursChange,
		handleNightDifferentialHoursChange,
	};
};
