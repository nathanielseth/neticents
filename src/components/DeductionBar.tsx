import { DEDUCTION_META } from "../utils/deductionMeta";
import type { DeductionKey } from "../utils/deductionMeta";

export interface DeductionLine {
	key: DeductionKey;
	value: number;
}

interface DeductionBarProps {
	lines: readonly DeductionLine[];
	highlightedKey: DeductionKey | null;
}

const DeductionBar = ({ lines, highlightedKey }: DeductionBarProps) => {
	const segments = lines.filter((line) => line.value > 0);
	const total = segments.reduce((sum, line) => sum + line.value, 0);

	return (
		<div
			role="img"
			aria-label="Share of each deduction"
			className="mt-6 flex h-2 overflow-hidden rounded-full bg-sunken"
		>
			{segments.map(({ key, value }) => (
				<div
					key={key}
					className={`basis-0 transition-[flex-grow,opacity] duration-300 ease-out motion-reduce:transition-none ${DEDUCTION_META[key].colorClass} ${
						highlightedKey !== null && highlightedKey !== key
							? "opacity-30"
							: ""
					}`}
					style={{ flexGrow: value }}
					title={`${DEDUCTION_META[key].label} (${((value / total) * 100).toFixed(2)}%)`}
				/>
			))}
		</div>
	);
};

export default DeductionBar;
