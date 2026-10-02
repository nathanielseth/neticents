import { useId } from "react";
import type { Sector, TaxInputs, TaxRegime } from "../types";
import type { SalaryCalculatorSetters } from "../utils/useSalaryCalculator";
import { isFlatTaxAvailable } from "../utils/calculation";
import {
	deMinimisHint,
	deMinimisInfo,
	grossReceiptsInfo,
	taxRegimeHint,
	taxRegimeInfo,
	thirteenthMonthInfo,
} from "../utils/inputHints";
import { RotateCcw } from "lucide-react";
import { FieldLabel } from "./Field";
import InfoTip from "./InfoTip";
import NumberField from "./NumberField";
import PremiumPay from "./PremiumPay";
import Segmented from "./Segmented";
import type { SegmentedOption } from "./Segmented";

const SECTOR_OPTIONS: readonly SegmentedOption<Sector>[] = [
	{ value: "private", label: "Private" },
	{ value: "public", label: "Public" },
	{ value: "selfemployed", label: "Self-Employed" },
];

const TAX_REGIME_OPTIONS: readonly SegmentedOption<TaxRegime>[] = [
	{ value: "graduated", label: "Graduated Rates" },
	{ value: "flat8", label: "8% Flat Rate" },
];

interface SwitchRowProps {
	label: string;
	info: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}

const SwitchRow = ({ label, info, checked, onChange }: SwitchRowProps) => {
	const switchId = useId();

	return (
		<div className="flex items-center justify-between gap-4">
			<span className="flex items-center gap-1">
				<label htmlFor={switchId} className="cursor-pointer">
					<FieldLabel>{label}</FieldLabel>
				</label>
				<InfoTip label={`About ${label}`}>{info}</InfoTip>
			</span>
			<label className="cursor-pointer">
				<input
					id={switchId}
					type="checkbox"
					role="switch"
					className="peer sr-only"
					checked={checked}
					onChange={(e) => onChange(e.target.checked)}
				/>
				<span
					aria-hidden
					className="relative block h-6 w-10 shrink-0 rounded-full bg-field-line transition-colors peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4 motion-reduce:transition-none motion-reduce:after:transition-none"
				/>
			</label>
		</div>
	);
};

interface InputsProps {
	inputs: TaxInputs;
	setters: SalaryCalculatorSetters;
}

const Inputs = ({ inputs, setters }: InputsProps) => {
	const { sector } = inputs;
	const isSelfEmployed = sector === "selfemployed";
	const regimeHint = taxRegimeHint(
		inputs.taxRegime,
		isFlatTaxAvailable(inputs.salary),
	);
	const regimeInfo = taxRegimeInfo();

	return (
		<div className="@container space-y-6">
			<Segmented
				label="Employment Type"
				options={SECTOR_OPTIONS}
				value={sector}
				onChange={setters.setSector}
				action={
					<button
						type="button"
						onClick={setters.reset}
						className="flex items-center gap-1 text-xs font-medium text-muted hover:text-fg"
					>
						<RotateCcw aria-hidden className="size-3" />
						Reset
					</button>
				}
			/>

			<div className="grid items-start gap-5 @md:grid-cols-2">
				<NumberField
					label={isSelfEmployed ? "Monthly Income" : "Monthly Basic Pay"}
					prefix="₱"
					mode="currency"
					placeholder="0.00"
					step={1000}
					stepper
					value={inputs.salary}
					onChange={setters.setSalary}
					info={isSelfEmployed ? grossReceiptsInfo() : null}
				/>
				{!isSelfEmployed && (
					<NumberField
						label="De Minimis Allowance"
						prefix="₱"
						mode="currency"
						placeholder="0.00"
						step={500}
						stepper
						value={inputs.allowance}
						onChange={setters.setAllowance}
						info={deMinimisInfo()}
						hint={deMinimisHint(inputs.salary, inputs.allowance)}
					/>
				)}
			</div>

			{isSelfEmployed ? (
				<Segmented
					label="Income Tax Option"
					options={TAX_REGIME_OPTIONS}
					value={inputs.taxRegime}
					onChange={setters.setTaxRegime}
					info={
						<>
							<span className="block font-semibold">Graduated Rates</span>
							<span className="block text-muted">{regimeInfo.graduated}</span>
							<span className="mt-2 block font-semibold">8% Flat Rate</span>
							<span className="block text-muted">{regimeInfo.flat8}</span>
						</>
					}
					hint={regimeHint?.text}
					warn={regimeHint?.warn}
				/>
			) : (
				<>
					<SwitchRow
						label={
							sector === "public"
								? "Include Year-End Bonuses"
								: "Include 13th Month Pay"
						}
						info={thirteenthMonthInfo(sector)}
						checked={inputs.includeThirteenthMonth}
						onChange={setters.setIncludeThirteenthMonth}
					/>

					<PremiumPay inputs={inputs} setters={setters} />
				</>
			)}
		</div>
	);
};

export default Inputs;