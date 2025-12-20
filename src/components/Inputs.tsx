import { useRef, useEffect, useCallback, memo } from 'react'
import type { Sector, SectorOption, WorkScheduleOption } from '../types'
import { useSalaryCalculator } from '../utils/useSalaryCalculator'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { handleInput, parseFormattedNumber } from '../utils/format'

const SECTOR_OPTIONS: SectorOption[] = [
  { id: 'private', label: 'Private' },
  { id: 'public', label: 'Public' },
  { id: 'selfemployed', label: 'Self-Employed' },
]

// only takes into account the ot and nd
const WORK_SCHEDULE_OPTIONS: WorkScheduleOption[] = [
  { id: 'mon-fri', label: 'Mon-Fri' },
  { id: 'mon-sat', label: 'Mon-Sat' },
  { id: 'mon-sun', label: 'Mon-Sun' },
]

interface SpinButtonProps {
  direction: 'up' | 'down'
  onClick: () => void
  onStop: () => void
  disabled?: boolean
}

const SpinButton = memo(({ direction, onClick, onStop, disabled }: SpinButtonProps) => {
  const Icon = direction === 'up' ? ChevronUp : ChevronDown

  return (
    <button
      type="button"
      onMouseDown={onClick}
      onMouseUp={onStop}
      onMouseLeave={onStop}
      onTouchStart={onClick}
      onTouchEnd={onStop}
      disabled={disabled}
      className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
      tabIndex={-1}
    >
      <Icon size={12} className="text-gray-600 dark:text-gray-400" />
    </button>
  )
})

SpinButton.displayName = 'SpinButton'

interface InputFieldProps {
  label: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  useFormatter?: boolean
  step?: number
  min?: number
  helperText?: string | null
}

const InputField = memo(
  ({
    label,
    value,
    onChange,
    placeholder,
    disabled = false,
    useFormatter = false,
    step = 1,
    min = 0,
    helperText = null,
  }: InputFieldProps) => {

    // for press & hold increment/decrement
    const intervalRef = useRef<number | null>(null)
    const timeoutRef = useRef<number | null>(null)

    const formatValue = useCallback(
      (val: number): string => (useFormatter ? handleInput(val.toString()) : val.toString()),
      [useFormatter]
    )

    const parseValue = useCallback(
      (val: string): number =>
        useFormatter ? parseFormattedNumber(val || '0') : parseFloat(val || '0'),
      [useFormatter]
    )

    const updateValue = useCallback(
      (newValue: number) => {
        const clampedValue = Math.max(min, newValue)

        // normalize updates to the same contract as native input events
        const syntheticEvent = {
          target: { value: formatValue(clampedValue) },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      },
      [min, formatValue, onChange]
    )

    const stopChangingValue = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }, [])

    const performIncrement = useCallback(() => {
      if (disabled) return
      const currentValue = parseValue(String(value))
      updateValue(currentValue + step)
    }, [disabled, parseValue, value, updateValue, step])

    const performDecrement = useCallback(() => {
      if (disabled) return
      const currentValue = parseValue(String(value))
      updateValue(currentValue - step)
    }, [disabled, parseValue, value, updateValue, step])

    const latestIncrementFn = useRef(performIncrement)
    const latestDecrementFn = useRef(performDecrement)

    useEffect(() => {
      latestIncrementFn.current = performIncrement
    }, [performIncrement])

    useEffect(() => {
      latestDecrementFn.current = performDecrement
    }, [performDecrement])

    const startRepeatingAction = useCallback(
      (actionType: 'increment' | 'decrement') => {
        if (actionType === 'increment') {
          latestIncrementFn.current()
        } else {
          latestDecrementFn.current()
        }

        stopChangingValue()

        timeoutRef.current = setTimeout(() => {
          intervalRef.current = setInterval(() => {
            if (actionType === 'increment') {
              latestIncrementFn.current()
            } else {
              latestDecrementFn.current()
            }
          }, 100)
        }, 400)
      },
      [stopChangingValue]
    )

    useEffect(() => {
      return stopChangingValue
    }, [stopChangingValue])

    return (
      <div>
        <label className="label">{label}</label>
        <div className="relative input-wrapper">
          <input
            type="text"
            inputMode="decimal"
            className={`input-field rounded-l pr-8 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
            <SpinButton
              direction="up"
              onClick={() => startRepeatingAction('increment')}
              onStop={stopChangingValue}
              disabled={disabled}
            />
            <SpinButton
              direction="down"
              onClick={() => startRepeatingAction('decrement')}
              onStop={stopChangingValue}
              disabled={disabled}
            />
          </div>
        </div>
        {helperText && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</div>}
      </div>
    )
  }
)

InputField.displayName = 'InputField'

interface ToggleButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
}

const ToggleButton = memo(({ label, isActive, onClick }: ToggleButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`btn ${isActive ? 'btn-active' : ''}`}
  >
    {label}
  </button>
))

ToggleButton.displayName = 'ToggleButton'

interface InputsProps {
  setMonthlySalary: (value: number) => void
  setAllowance: (value: number) => void
  setTakeHomePay: (value: number) => void
  setWithholdingTax: (value: number) => void
  setSector: (sector: Sector) => void
  overtimeHours: string | number
  setOvertimeHours: (value: number) => void
  nightDifferentialHours: string | number
  setNightDifferentialHours: (value: number) => void
}

const Inputs = ({
  setMonthlySalary,
  setAllowance,
  setTakeHomePay,
  setWithholdingTax,
  setSector,
  overtimeHours,
  setOvertimeHours,
  nightDifferentialHours,
  setNightDifferentialHours,
}: InputsProps) => {
  const {
    activeSector,
    workSchedule,
    monthlySalary: displayMonthlySalary,
    allowance: displayAllowance,
    handleSalaryChange,
    handleAllowanceChange,
    handleSectorChange,
    handleWorkScheduleChange,
    handleOvertimeHoursChange,
    handleNightDifferentialHoursChange,
    getDeMinimisHelperText,
  } = useSalaryCalculator(
    setMonthlySalary,
    setAllowance,
    setTakeHomePay,
    setWithholdingTax,
    setSector,
    setOvertimeHours,
    setNightDifferentialHours
  )

  const isSelfEmployed = activeSector === 'selfemployed'

  const getOvertimeHelperText = (): string => {
    return isSelfEmployed ? 'Not applicable' : 'Assumes standard 25% rate'
  }

  const getNightDifferentialHelperText = (): string => {
    if (isSelfEmployed) return 'Not applicable'
    if (activeSector === 'private') return '+10% pay from 10 PM to 6 AM'
    if (activeSector === 'public') return '+20% pay from 6 PM to 6 AM'
    return ''
  }

  return (
    <div className="p-6 rounded-lg bg-[#fbfcfd] dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="space-y-3">
        <div>
          <label className="label">Employment Type</label>
          <div className="flex mt-2 space-x-2 flex-wrap gap-y-2">
            {SECTOR_OPTIONS.map((sector) => (
              <ToggleButton
                key={sector.id}
                label={sector.label}
                isActive={activeSector === sector.id}
                onClick={() => handleSectorChange(sector.id)}
              />
            ))}
          </div>
        </div>

        <InputField
          label="Monthly Basic Pay"
          value={displayMonthlySalary}
          onChange={handleSalaryChange}
          placeholder="0.00"
          useFormatter
          step={1000}
          min={0}
        />

        <InputField
          label="De Minimis Allowance"
          value={displayAllowance}
          onChange={handleAllowanceChange}
          placeholder="0.00"
          useFormatter
          step={500}
          min={0}
          helperText={getDeMinimisHelperText()}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Overtime Hours"
            value={isSelfEmployed ? '' : overtimeHours}
            onChange={handleOvertimeHoursChange}
            placeholder={isSelfEmployed ? 'N/A' : '0'}
            disabled={isSelfEmployed}
            step={1}
            min={0}
            helperText={getOvertimeHelperText()}
          />

          <InputField
            label="Night Differential Hours"
            value={isSelfEmployed ? '' : nightDifferentialHours}
            onChange={handleNightDifferentialHoursChange}
            placeholder={isSelfEmployed ? 'N/A' : '0'}
            disabled={isSelfEmployed}
            step={1}
            min={0}
            helperText={getNightDifferentialHelperText()}
          />
        </div>

        <div>
          <label className="label">Work Schedule</label>
          <div className="flex mt-2 space-x-2 flex-wrap gap-y-2">
            {WORK_SCHEDULE_OPTIONS.map((schedule) => (
              <ToggleButton
                key={schedule.id}
                label={schedule.label}
                isActive={workSchedule === schedule.id}
                onClick={() => handleWorkScheduleChange(schedule.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <strong>Note:</strong> This calculator is intended for estimation purposes only, it does
        not account for holidays or other unique circumstances.
      </div>
    </div>
  )
}

export default Inputs