import { useId } from "react";
import type { ReactNode } from "react";
import { FieldHint, FieldLabel } from "./Field";
import InfoTip from "./InfoTip";

export interface SegmentedOption<T extends string> {
	value: T;
	label: string;
}

interface SegmentedProps<T extends string> {
	label: string;
	hideLabel?: boolean;
	compact?: boolean;
	action?: ReactNode;
	options: readonly SegmentedOption<T>[];
	value: T;
	onChange: (value: T) => void;
	hint?: string | null;
	info?: ReactNode;
	warn?: boolean;
}

const Segmented = <T extends string>({
	label,
	hideLabel = false,
	compact = false,
	action,
	options,
	value,
	onChange,
	hint = null,
	info = null,
	warn = false,
}: SegmentedProps<T>) => {
	const name = useId();
	const labelId = useId();
	const hintId = useId();

	return (
		<div className="min-w-0">
			<div
				className={
					hideLabel
						? "sr-only"
						: "mb-1.5 flex items-center justify-between gap-3"
				}
			>
				<span className="flex items-center gap-1">
					<FieldLabel id={labelId}>{label}</FieldLabel>
					{info && <InfoTip label={`About ${label}`}>{info}</InfoTip>}
				</span>
				{action}
			</div>
			<div
				role="radiogroup"
				aria-labelledby={labelId}
				aria-describedby={hint ? hintId : undefined}
				className={`grid grid-flow-col gap-0.5 rounded-lg bg-sunken p-0.5 ${compact ? "auto-cols-auto" : "auto-cols-fr"}`}
			>
				{options.map((option) => (
					<label
						key={option.value}
						className={`cursor-pointer rounded-md py-2 text-center font-medium whitespace-nowrap text-muted transition-colors select-none hover:text-fg has-checked:bg-raised has-checked:text-fg has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-brand motion-reduce:transition-none ${compact ? "px-1.5 text-[13px] lg:px-2 lg:text-sm" : "px-2 text-sm sm:px-3"}`}
					>
						<input
							type="radio"
							name={name}
							value={option.value}
							checked={option.value === value}
							onChange={() => onChange(option.value)}
							className="sr-only"
						/>
						{option.label}
					</label>
				))}
			</div>
			{hint && (
				<FieldHint id={hintId} warn={warn}>
					{hint}
				</FieldHint>
			)}
		</div>
	);
};

export default Segmented;
