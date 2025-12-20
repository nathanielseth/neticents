import jsPDF from 'jspdf'
import type { TaxData, Sector } from '../types'
import { computeGSIS, computeSSS, computePhilHealth, computePagIbig } from './calculation'

const computePremiumPay = (
  monthlySalary: number,
  overtimeHours: number,
  nightDiffHours: number,
  sector: Sector
) => {
  const hourlyRate = monthlySalary / 168
  const overtimeRate = hourlyRate * 1.25
  const nightDiffRate = sector === 'public' ? hourlyRate * 0.2 : hourlyRate * 0.1
  const nightOvertimeRate = sector === 'public' ? hourlyRate * 0.3 : hourlyRate * 0.1

  const regularOvertimePay = overtimeHours * overtimeRate
  const regularNightPay = nightDiffHours * nightDiffRate
  const nightOvertimePay = Math.min(overtimeHours, nightDiffHours) * nightOvertimeRate
  const totalPremiumPay = regularOvertimePay + regularNightPay + nightOvertimePay

  return {
    regularOvertimePay,
    regularNightPay,
    nightOvertimePay,
    totalPremiumPay,
  }
}

const SECTOR_NAMES: Record<Sector, string> = {
  private: 'Private Employee',
  public: 'Government Employee',
  selfemployed: 'Self-Employed',
}

const formatCurrency = (value: number): string => {
  return `P${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface DeductionsMap {
  withholdingTax: number
  gsis: number
  sss: number
  philHealth: number
  pagIbig: number
}

const calculateDeductions = (taxData: TaxData) => {
  const { monthlySalary, sector, takeHomePay, withholdingTax } = taxData

  const numericMonthlySalary = Number(monthlySalary) || 0
  const numericTakeHomePay = Number(takeHomePay) || 0
  const numericWithholdingTax = Number(withholdingTax) || 0

  const isSelfEmployed = sector === 'selfemployed'
  const isPrivateSector = sector === 'private' || sector === 'selfemployed'
  const hasIncome = numericTakeHomePay > 0

  const deductions: DeductionsMap = {
    withholdingTax: hasIncome ? numericWithholdingTax : 0,
    gsis: hasIncome && sector === 'public' ? computeGSIS(numericMonthlySalary) : 0,
    sss: hasIncome && isPrivateSector
      ? (() => {
          const sssData = computeSSS(numericMonthlySalary, isSelfEmployed)
          return sssData.sss + sssData.mpf
        })()
      : 0,
    philHealth: hasIncome ? computePhilHealth(numericMonthlySalary, isSelfEmployed) : 0,
    pagIbig: hasIncome ? computePagIbig(numericMonthlySalary) : 0,
  }

  const visibleDeductions = Object.entries(deductions).filter(([key]) => {
    if (key === 'gsis' && isPrivateSector) return false
    if (key === 'sss' && sector === 'public') return false
    return true
  })

  const totalDeductions = visibleDeductions.reduce((acc, [, value]) => acc + value, 0)

  return { visibleDeductions, totalDeductions }
}

export const generateTaxSummaryPDF = async (taxData: TaxData): Promise<string> => {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPos = 22

  const { visibleDeductions, totalDeductions } = calculateDeductions(taxData)

  const numericMonthlySalary = Number(taxData.monthlySalary) || 0
  const numericAllowance = Number(taxData.allowance) || 0
  const numericOvertimeHours = Number(taxData.overtimeHours) || 0
  const numericNightDiffHours = Number(taxData.nightDifferentialHours) || 0
  const numericTakeHomePay = Number(taxData.takeHomePay) || 0

  const isSelfEmployed = taxData.sector === 'selfemployed'

  // calculate premium pay
  const premiumPay = isSelfEmployed
    ? { regularOvertimePay: 0, regularNightPay: 0, nightOvertimePay: 0, totalPremiumPay: 0 }
    : computePremiumPay(
        numericMonthlySalary,
        numericOvertimeHours,
        numericNightDiffHours,
        taxData.sector
      )

  const grossIncome = numericMonthlySalary + numericAllowance + premiumPay.totalPremiumPay

  // header
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.setTextColor(0, 0, 0)
  pdf.text('Income Tax Summary', 20, yPos)
  yPos += 6

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Generated on ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, yPos)
  yPos += 12

  // employment information
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.setTextColor(0, 0, 0)
  pdf.text('Employment Information', 20, yPos)
  yPos += 1.5
  pdf.setLineWidth(0.3)
  pdf.setDrawColor(150, 150, 150)
  pdf.line(20, yPos, pageWidth - 20, yPos)
  yPos += 6

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(40, 40, 40)
  
  pdf.text('Employment Type', 20, yPos)
  pdf.text(SECTOR_NAMES[taxData.sector], pageWidth - 20, yPos, { align: 'right' })
  yPos += 6

  pdf.text('Monthly Basic Salary', 20, yPos)
  pdf.text(formatCurrency(numericMonthlySalary), pageWidth - 20, yPos, { align: 'right' })
  yPos += 6

  // income breakdown section
  if (!isSelfEmployed && (numericOvertimeHours > 0 || numericNightDiffHours > 0 || numericAllowance > 0)) {
    yPos += 2
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Income Breakdown', 20, yPos)
    yPos += 1.5
    pdf.line(20, yPos, pageWidth - 20, yPos)
    yPos += 6

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(40, 40, 40)

    if (numericOvertimeHours > 0) {
      pdf.text(`Overtime Pay (${numericOvertimeHours} hrs)`, 20, yPos)
      pdf.text(formatCurrency(premiumPay.regularOvertimePay), pageWidth - 20, yPos, { align: 'right' })
      yPos += 6
    }

    if (numericNightDiffHours > 0) {
      pdf.text(`Night Differential Pay (${numericNightDiffHours} hrs)`, 20, yPos)
      pdf.text(formatCurrency(premiumPay.regularNightPay), pageWidth - 20, yPos, { align: 'right' })
      yPos += 6
    }

    if (premiumPay.nightOvertimePay > 0) {
      pdf.text('Night Overtime Premium', 20, yPos)
      pdf.text(formatCurrency(premiumPay.nightOvertimePay), pageWidth - 20, yPos, { align: 'right' })
      yPos += 6
    }

    if (numericAllowance > 0) {
      pdf.text(`De Minimis Allowance (${numericAllowance > 7500 ? 'Taxable' : 'Non-Taxable'})`, 20, yPos)
      pdf.text(formatCurrency(numericAllowance), pageWidth - 20, yPos, { align: 'right' })
      yPos += 6
    }
  } else if (numericAllowance > 0) {
    pdf.text(`De Minimis Allowance (${numericAllowance > 7500 ? 'Taxable' : 'Non-Taxable'})`, 20, yPos)
    pdf.text(formatCurrency(numericAllowance), pageWidth - 20, yPos, { align: 'right' })
    yPos += 6
  }

  yPos += 2

  // monthly deductions
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.setTextColor(0, 0, 0)
  pdf.text('Monthly Deductions', 20, yPos)
  yPos += 1.5
  pdf.line(20, yPos, pageWidth - 20, yPos)
  yPos += 6

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(40, 40, 40)

  const deductionLabels: Record<string, string> = {
    withholdingTax: 'Withholding Tax',
    gsis: 'GSIS Contribution',
    sss: 'SSS Contribution',
    philHealth: 'PhilHealth Contribution',
    pagIbig: 'Pag-IBIG Contribution',
  }

  visibleDeductions.forEach(([key, value]) => {
    pdf.text(deductionLabels[key], 20, yPos)
    pdf.text(formatCurrency(value), pageWidth - 20, yPos, { align: 'right' })
    yPos += 6
  })

  yPos += 2

  // monthly summary
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.setTextColor(0, 0, 0)
  pdf.text('Monthly Summary', 20, yPos)
  yPos += 1.5
  pdf.line(20, yPos, pageWidth - 20, yPos)
  yPos += 6

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(40, 40, 40)

  pdf.text('Gross Monthly Income', 20, yPos)
  pdf.text(formatCurrency(grossIncome), pageWidth - 20, yPos, { align: 'right' })
  yPos += 6

  pdf.text('Total Monthly Deductions', 20, yPos)
  pdf.text(formatCurrency(totalDeductions), pageWidth - 20, yPos, { align: 'right' })
  yPos += 6

  pdf.text('Monthly Take Home Pay', 20, yPos)
  pdf.text(formatCurrency(numericTakeHomePay), pageWidth - 20, yPos, { align: 'right' })
  yPos += 6

  // effective tax rate
  const effectiveTaxRate = grossIncome > 0 ? (totalDeductions / grossIncome) * 100 : 0
  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(9)
  pdf.setTextColor(80, 80, 80)
  pdf.text(`Effective Deduction Rate: ${effectiveTaxRate.toFixed(2)}%`, 20, yPos)
  yPos += 10

  // annual summary
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.setTextColor(0, 0, 0)
  pdf.text('Annual Summary', 20, yPos)
  yPos += 1.5
  pdf.line(20, yPos, pageWidth - 20, yPos)
  yPos += 6

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(40, 40, 40)

  pdf.text('Annual Gross Income', 20, yPos)
  pdf.text(formatCurrency(grossIncome * 12), pageWidth - 20, yPos, { align: 'right' })
  yPos += 6

  pdf.text('Annual Total Deductions', 20, yPos)
  pdf.text(formatCurrency(totalDeductions * 12), pageWidth - 20, yPos, { align: 'right' })
  yPos += 6

  pdf.text('Annual Take Home Pay', 20, yPos)
  pdf.text(formatCurrency(numericTakeHomePay * 12), pageWidth - 20, yPos, { align: 'right' })
  yPos += 6

  // 13th month pay estimate (basic salary only)
  const thirteenthMonthPay = numericMonthlySalary
  
  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(9)
  pdf.setTextColor(80, 80, 80)
  pdf.text(`Estimated 13th Month Pay: ${formatCurrency(thirteenthMonthPay)}`, 20, yPos)
  yPos += 16

  // disclaimer
  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(8)
  pdf.setTextColor(100, 100, 100)
  const disclaimer = 'This tax summary is an estimate based on 2025 Philippine tax regulations. Actual deductions may vary.'
  const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 40)
  pdf.text(disclaimerLines, pageWidth / 2, yPos, { align: 'center' })

  // footer
  yPos = pageHeight - 10
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(120, 120, 120)
  pdf.text('nathanielseth.github.io/neticents', pageWidth / 2, yPos, { align: 'center' })

  const pdfBlob = pdf.output('blob')
  return URL.createObjectURL(pdfBlob)
}

export const downloadPDF = (blobUrl: string) => {
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = `neticents-${new Date().toLocaleDateString('en-PH').replace(/\//g, '-')}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}