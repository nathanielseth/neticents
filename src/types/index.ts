export type Theme = 'light' | 'dark'
export type Sector = 'private' | 'public' | 'selfemployed'
export type WorkSchedule = 'mon-fri' | 'mon-sat' | 'mon-sun'
export type PayPeriod = 'monthly' | 'annual' | 'biweekly'

export interface TaxData {
  monthlySalary: number
  allowance: number
  allowanceTaxable: boolean
  sector: Sector
  takeHomePay: number
  withholdingTax: number
  overtimeHours: number
  nightDifferentialHours: number
  generatedDate: string
}

export interface Deductions {
  withholdingTax: number
  gsis: number
  sss: number
  philHealth: number
  pagIbig: number
  total: number
}

export interface SSSResult {
  sss: number
  mpf: number
}

export interface PremiumPayResult {
  regularOvertimePay: number
  regularNightPay: number
  nightOvertimePay: number
  totalPremiumPay: number
  breakdown: {
    regularOvertimeHours: number
    regularNightHours: number
    overlapHours: number
    rates: {
      overtime: number
      nightDiff: number
      nightOvertime: number
    }
  }
}

export interface CalculatedDeductions {
  deductions: Deductions
  visibleDeductions: [string, number][]
  totalDeductions: number
  grossIncome: number
}

// Component prop types
export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

export interface SectorOption {
  id: Sector
  label: string
}

export interface WorkScheduleOption {
  id: WorkSchedule
  label: string
}

export interface PayPeriodOption {
  value: PayPeriod
  label: string
}

export interface ReferenceLink {
  title: string
  subtitle: string
  url: string
  category: 'sss' | 'gsis' | 'philhealth' | 'pagibig' | 'tax' | 'other'
}