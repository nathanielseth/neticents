import type { SSSResult } from '../types'

interface TaxBracket {
  min: number
  max: number
  rate: number
  base: number
}

// train jan 2023 bracket
export const computeWithholdingTax = (taxableAnnualIncome: number): number => {
  const taxBrackets: TaxBracket[] = [
    { min: 0, max: 250000, rate: 0, base: 0 },
    { min: 250001, max: 400000, rate: 0.15, base: 0 },
    { min: 400001, max: 800000, rate: 0.2, base: 22500 },
    { min: 800001, max: 2000000, rate: 0.25, base: 102500 },
    { min: 2000001, max: 8000000, rate: 0.3, base: 402500 },
    { min: 8000001, max: Infinity, rate: 0.35, base: 2202500 },
  ]

  for (const bracket of taxBrackets) {
    if (
      taxableAnnualIncome >= bracket.min &&
      taxableAnnualIncome <= bracket.max
    ) {
      if (bracket.rate === 0) {
        return 0
      }

      const excess = taxableAnnualIncome - bracket.min

      // base = fixed tax from lower brackets
      const annualTax = bracket.base + excess * bracket.rate
      return annualTax / 12
    }
  }

  return 0
}

// sss jan 2025 table
// format: [lower, upper, sss, mpf]
type SSSMatrixRow = [number, number, number, number]

const SSS_MATRIX: SSSMatrixRow[] = [
  [0, 5249.99, 250.0, 0.0],
  [5250, 5749.99, 275.0, 0.0],
  [5750, 6249.99, 300.0, 0.0],
  [6250, 6749.99, 325.0, 0.0],
  [6750, 7249.99, 350.0, 0.0],
  [7250, 7749.99, 375.0, 0.0],
  [7750, 8249.99, 400.0, 0.0],
  [8250, 8749.99, 425.0, 0.0],
  [8750, 9249.99, 450.0, 0.0],
  [9250, 9749.99, 475.0, 0.0],
  [9750, 10249.99, 500.0, 0.0],
  [10250, 10749.99, 525.0, 0.0],
  [10750, 11249.99, 550.0, 0.0],
  [11250, 11749.99, 575.0, 0.0],
  [11750, 12249.99, 600.0, 0.0],
  [12250, 12749.99, 625.0, 0.0],
  [12750, 13249.99, 650.0, 0.0],
  [13250, 13749.99, 675.0, 0.0],
  [13750, 14249.99, 700.0, 0.0],
  [14250, 14749.99, 725.0, 0.0],
  [14750, 15249.99, 750.0, 0.0],
  [15250, 15749.99, 775.0, 0.0],
  [15750, 16249.99, 800.0, 0.0],
  [16250, 16749.99, 825.0, 0.0],
  [16750, 17249.99, 850.0, 0.0],
  [17250, 17749.99, 875.0, 0.0],
  [17750, 18249.99, 900.0, 0.0],
  [18250, 18749.99, 925.0, 0.0],
  [18750, 19249.99, 950.0, 0.0],
  [19250, 19749.99, 975.0, 0.0],
  [19750, 20249.99, 1000.0, 0.0],
  [20250, 20749.99, 1000.0, 25.0],
  [20750, 21249.99, 1000.0, 50.0],
  [21250, 21749.99, 1000.0, 75.0],
  [21750, 22249.99, 1000.0, 100.0],
  [22250, 22749.99, 1000.0, 125.0],
  [22750, 23249.99, 1000.0, 150.0],
  [23250, 23749.99, 1000.0, 175.0],
  [23750, 24249.99, 1000.0, 200.0],
  [24250, 24749.99, 1000.0, 225.0],
  [24750, 25249.99, 1000.0, 250.0],
  [25250, 25749.99, 1000.0, 275.0],
  [25750, 26249.99, 1000.0, 300.0],
  [26250, 26749.99, 1000.0, 325.0],
  [26750, 27249.99, 1000.0, 350.0],
  [27250, 27749.99, 1000.0, 375.0],
  [27750, 28249.99, 1000.0, 400.0],
  [28250, 28749.99, 1000.0, 425.0],
  [28750, 29249.99, 1000.0, 450.0],
  [29250, 29749.99, 1000.0, 475.0],
  [29750, 30249.99, 1000.0, 500.0],
  [30250, 30749.99, 1000.0, 525.0],
  [30750, 31249.99, 1000.0, 550.0],
  [31250, 31749.99, 1000.0, 575.0],
  [31750, 32249.99, 1000.0, 600.0],
  [32250, 32749.99, 1000.0, 625.0],
  [32750, 33249.99, 1000.0, 650.0],
  [33250, 33749.99, 1000.0, 675.0],
  [33750, 34249.99, 1000.0, 700.0],
  [34250, 34749.99, 1000.0, 725.0],
  [34750, Infinity, 1000.0, 750.0],
]

export const computeSSS = (salary: number, isSelfEmployed = false): SSSResult => {
  if (isNaN(salary)) {
    return { sss: 0, mpf: 0 }
  }

  // self-employed pays both employer + employee share
  const multiplier = isSelfEmployed ? 3 : 1

  // below minimum MSC: fixed contribution
  if (salary < 5250.0) {
    const applicableMsc = 5000
    return {
      sss: applicableMsc * 0.05 * multiplier,
      mpf: 0,
    }
  }

  // above max MSC: SSS capped, excess goes to MPF
  if (salary >= 34750.0) {
    const applicableMsc = 35000
    const sss = 20000 * 0.05 * multiplier
    const mpf = (applicableMsc - 20000) * 0.05 * multiplier
    return {
      sss,
      mpf: parseFloat(mpf.toFixed(2)),
    }
  }

  for (const [lower, upper, sss, mpf] of SSS_MATRIX) {
    if (salary >= lower && salary <= upper) {
      return {
        sss: sss * multiplier,
        mpf: mpf * multiplier,
      }
    }
  }

  return { sss: 0, mpf: 0 }
}

// philhealth jan 2024 bracket
export const computePhilHealth = (monthly: number, isSelfEmployed = false): number => {
  if (!monthly || isNaN(monthly) || monthly <= 0) {
    return 0
  }

  // self-employed shoulders full contribution, otherwise shared equally
  const multiplier = isSelfEmployed ? 2 : 1

  if (monthly <= 10000) {
    return 500 * 0.5 * multiplier
  }

  if (monthly <= 99999.99) {
    return monthly * 0.05 * 0.5 * multiplier
  }

  if (monthly >= 100000) {
    return 5000 * 0.5 * multiplier
  }

  return 0
}

// feb 2024 table
export const computePagIbig = (salary: number): number => {
  if (salary <= 1500) return salary * 0.01
  if (salary <= 10000) return salary * 0.02
  return 200
}

// gsis employee contribution rate
export const computeGSIS = (salary: number): number => {
  return salary * 0.09
}