import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FieldHint, FieldLabel } from "./Field";
import InfoTip from "./InfoTip";
import {
	formatDraft,
	numberFormat,
	parseFormattedNumber,
	sanitizeDecimalInput,
} from "../utils/format";

type NumberMode = "currency" | "decimal";

// what a person can type before it stops being a plausible figure
const MAX_LENGTH: Record<NumberMode, number> = { currency: 15, decimal: 6 };

const formatValue = (value: number, mode: NumberMode): string => {
	if (value === 0) return "";
	return mode === "currency" ? numberFormat(value.toString()) : value.toString();
};

interface NumberFieldProps {
	label: string;
	hideLabel?: boolean;
	value: number;
	onChange: (value: number) => void;
	mode?: NumberMode;
	prefix?: string;
	suffix?: string;
	compact?: boolean;
	stepper?: boolean;
	placeholder?: string;
	step?: number;
	max?: number;
	min?: number;
	hint?: string | null;
	info?: ReactNode;
	warn?: boolean;
}

const NumberField = ({
	label,
	hideLabel = false,
	value,
	onChange,
	mode = "decimal",
	prefix,
	suffix,
	compact = false,
	stepper = false,
	placeholder = "0",
	step = 1,
	max,
	min,
	hint = null,
	info = null,
	warn = false,
}: NumberFieldProps) => {
	const hintId = useId();
	const inputId = useId();

	// parent value is the source of truth
	const [draft, setDraft] = useState<string | null>(null);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		if (raw.length > MAX_LENGTH[mode]) return;

		const sanitized = sanitizeDecimalInput(raw);
		const parsed = parseFormattedNumber(sanitized);
		if (max !== undefined && parsed > max) {
			// there is nothing past the ceiling to type, so the field shows the ceiling itself
			setDraft(null);
			onChange(max);
			return;
		}
		setDraft(mode === "currency" ? formatDraft(sanitized) : sanitized);
		onChange(parsed);
	};

	// a floor can't be enforced per keystroke (typing 15 passes through 1), so it settles on blur
	const handleBlur = () => {
		setDraft(null);
		if (min !== undefined && value > 0 && value < min) onChange(min);
	};

	const applyStep = (direction: 1 | -1) => {
		setDraft(null);
		// rounding keeps 7.55 + 1 from showing as 8.549999999999999
		const next = Math.max(0, Math.round((value + step * direction) * 100) / 100);
		onChange(max === undefined ? next : Math.min(next, max));
	};

	// the repeat timers outlive a render, so they call through a ref to always step from the latest value
	const applyStepRef = useRef(applyStep);
	useEffect(() => {
		applyStepRef.current = applyStep;
	});

	const repeatTimers = useRef<{ delay?: number; interval?: number }>({});
	const stopRepeat = () => {
		window.clearTimeout(repeatTimers.current.delay);
		window.clearInterval(repeatTimers.current.interval);
	};
	const startRepeat = (direction: 1 | -1) => {
		applyStepRef.current(direction);
		repeatTimers.current.delay = window.setTimeout(() => {
			repeatTimers.current.interval = window.setInterval(
				() => applyStepRef.current(direction),
				70,
			);
		}, 400);
	};
	useEffect(() => stopRepeat, []);

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
		e.preventDefault();
		applyStep(e.key === "ArrowUp" ? 1 : -1);
	};

	return (
		<div className="min-w-0">
			{/* the label wraps only its text, so the info button is never mistaken for the control it labels */}
			<div
				className={
					hideLabel ? "sr-only" : "mb-1.5 flex items-center gap-0.5 whitespace-nowrap"
				}
			>
				<label htmlFor={inputId}>
					<FieldLabel>{label}</FieldLabel>
				</label>
				{info && !hideLabel && (
					<InfoTip label={`About ${label}`}>{info}</InfoTip>
				)}
			</div>
			<div>
				<span className="group/field relative flex items-center">
					{prefix && (
						<span
							aria-hidden
							className="pointer-events-none absolute left-3 text-muted"
						>
							{prefix}
						</span>
					)}
					<input
						id={inputId}
						type="text"
						inputMode="decimal"
						autoComplete="off"
						className={`h-10 w-full rounded-lg border border-field-line bg-field font-medium text-fg tabular-nums placeholder:text-muted/60 focus-visible:border-brand focus-visible:outline-offset-0 ${compact ? "px-2 text-center" : "px-3"} ${prefix ? "pl-7" : ""} ${suffix ? "pr-10" : ""} ${stepper && !suffix ? "pointer-fine:pr-8" : ""}`}
						placeholder={placeholder}
						value={draft ?? formatValue(value, mode)}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						onBlur={handleBlur}
						aria-describedby={hint ? hintId : undefined}
					/>
					{suffix && (
						<span
							aria-hidden
							className={`pointer-events-none absolute right-3 text-sm text-muted ${stepper ? "transition-opacity group-focus-within/field:pointer-fine:opacity-0 group-hover/field:pointer-fine:opacity-0 motion-reduce:transition-none" : ""}`}
						>
							{suffix}
						</span>
					)}
					{stepper && (
						// keyboard users step with the arrow keys and touch screens use the numeric keypad, so this is pointer-only
						<span
							aria-hidden
							className="absolute inset-y-1 right-1 hidden w-6 flex-col rounded-md bg-field opacity-0 transition-opacity group-focus-within/field:opacity-100 group-hover/field:opacity-100 pointer-fine:flex motion-reduce:transition-none"
						>
							{([1, -1] as const).map((direction) => (
								<button
									key={direction}
									type="button"
									tabIndex={-1}
									className="grid flex-1 place-items-center rounded text-muted hover:bg-sunken hover:text-fg"
									onMouseDown={(e) => e.preventDefault()}
									onPointerDown={() => startRepeat(direction)}
									onPointerUp={stopRepeat}
									onPointerLeave={stopRepeat}
									onPointerCancel={stopRepeat}
								>
									{direction === 1 ? (
										<ChevronUp className="size-3" />
									) : (
										<ChevronDown className="size-3" />
									)}
								</button>
							))}
						</span>
					)}
				</span>
			</div>
			{hint && (
				<FieldHint id={hintId} warn={warn}>
					{hint}
				</FieldHint>
			)}
		</div>
	);
};

export default NumberField;