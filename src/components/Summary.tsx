import { useState } from 'react'
import type { Sector, PayPeriod, PayPeriodOption } from '../types'
import LineChart from './LineChart'
import { computeGSIS, computeSSS, computePhilHealth, computePagIbig } from '../utils/calculation'
import { numberFormat } from '../utils/format'

interface SummaryProps {
  takeHomePay: number
  withholdingTax: number
  monthlySalary: number
  activeSector: Sector
}

interface DeductionsMap {
  withholdingTax: number
  gsis: number
  sss: number
  philHealth: number
  pagIbig: number
}

const Summary = ({
  takeHomePay,
  withholdingTax,
  monthlySalary,
  activeSector,
}: SummaryProps) => {
  const [payPeriod, setPayPeriod] = useState<PayPeriod>('monthly')

  const numericTakeHomePay = parseFloat(String(takeHomePay)) || 0
  const numericMonthlySalary = parseFloat(String(monthlySalary)) || 0

  const isSelfEmployed = activeSector === 'selfemployed'
  const isPrivateSector = activeSector === 'private' || activeSector === 'selfemployed'

  const deductions: DeductionsMap = {
    withholdingTax: numericTakeHomePay > 0 ? parseFloat(String(withholdingTax)) || 0 : 0,
    gsis:
      numericTakeHomePay > 0 && activeSector === 'public'
        ? computeGSIS(numericMonthlySalary)
        : 0,
    sss:
      numericTakeHomePay > 0 && isPrivateSector
        ? computeSSS(numericMonthlySalary, isSelfEmployed).sss +
          computeSSS(numericMonthlySalary, isSelfEmployed).mpf
        : 0,
    philHealth:
      numericTakeHomePay > 0 ? computePhilHealth(numericMonthlySalary, isSelfEmployed) : 0,
    pagIbig: numericTakeHomePay > 0 ? computePagIbig(numericMonthlySalary) : 0,
  }

  const visibleDeductions = Object.entries(deductions).filter(([key]) => {
    if (key === 'gsis' && isPrivateSector) {
      return false
    }
    if (key === 'sss' && activeSector === 'public') {
      return false
    }
    return true
  })

  const totalDeductions = visibleDeductions.reduce((acc, [, value]) => acc + value, 0)

  const getMultiplier = (): number => {
    switch (payPeriod) {
      case 'biweekly':
        return 12 / 26
      case 'annual':
        return 12
      default:
        return 1
    }
  }

  const multiplier = getMultiplier()
  const displayedTotalDeductions = totalDeductions * multiplier
  const displayedTakeHomePay = numericTakeHomePay * multiplier

  const payPeriodOptions: PayPeriodOption[] = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'annual', label: 'Annual' },
    { value: 'biweekly', label: 'Biweekly' },
  ]

  return (
    <div className="relative">
      <div
        className="p-6 rounded-lg border-t border-l border-r border-b-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-t-gray-200 dark:border-t-gray-700 border-l-gray-200 dark:border-l-gray-700 border-r-gray-200 dark:border-r-gray-700 border-b-[#4169e1]"
        style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)' }}
      >
        <div className="flex justify-center mb-5">
          <div className="flex items-center p-1 rounded-full bg-gray-200 dark:bg-gray-700">
            {payPeriodOptions.map((option) => (
              <button
                key={option.value}
                className={`px-3 py-1 rounded-full ${
                  payPeriod === option.value
                    ? 'bg-[#4169e1] text-white shadow-sm'
                    : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => setPayPeriod(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <h3 className="text-md font-normal text-center text-gray-600 dark:text-gray-300 mt-1 mb-2">
          Take Home Pay:
        </h3>
        <div className="grid grid-cols-1 justify-items-center">
          <h1 className="text-4xl font-bold text-[#4169e1] dark:text-blue-400">
            ₱
            {displayedTakeHomePay.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h1>
        </div>

        <LineChart deductions={{ ...deductions, total: totalDeductions }} />

        <div className="mt-6 space-y-4 text-gray-900 dark:text-gray-300">
          {visibleDeductions.map(([key, value]) => {
            const displayedValue = value * multiplier

            return (
              <div className="flex justify-between items-center" key={key}>
                <span className="flex items-center">
                  <span className={`w-3 h-3 rounded-full ${getColor(key)} mr-2`}></span>
                  <span className="font-semibold text-zinc-600 dark:text-gray-300">
                    {getLabel(key)}
                  </span>
                </span>
                <span className="font-bold">₱{numberFormat(displayedValue.toFixed(2))}</span>
              </div>
            )
          })}
          <div className="flex justify-between items-center font-bold">
            <span>Total Deductions</span>
            <span>₱{numberFormat(displayedTotalDeductions.toFixed(2))}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const getColor = (key: string): string => {
  const colors: Record<string, string> = {
    withholdingTax: 'bg-red-500',
    gsis: 'bg-green-500',
    sss: 'bg-green-500',
    philHealth: 'bg-purple-500',
    pagIbig: 'bg-yellow-500',
    total: 'bg-blue-500',
  }
  return colors[key] || ''
}

const getLabel = (key: string): string => {
  const labels: Record<string, string> = {
    withholdingTax: 'Withholding Tax',
    gsis: 'GSIS Contribution',
    sss: 'SSS Contribution',
    philHealth: 'PhilHealth Contribution',
    pagIbig: 'Pag-IBIG Contribution',
    total: 'Total Deduction',
  }
  return labels[key] || ''
}

export default Summary