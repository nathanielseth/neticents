import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface InfoTipProps {
	label: string;
	children: ReactNode;
	warn?: boolean;
}

const InfoTip = ({ label, children, warn = false }: InfoTipProps) => {
	const id = useId();
	const rootRef = useRef<HTMLSpanElement>(null);
	const bubbleRef = useRef<HTMLSpanElement>(null);
	const [hovered, setHovered] = useState(false);
	const [focused, setFocused] = useState(false);
	const [pinned, setPinned] = useState(false);
	const open = hovered || focused || pinned;

	useLayoutEffect(() => {
		const bubble = bubbleRef.current;
		if (!bubble || !open) return;
		bubble.style.transform = "";
		const { left, right } = bubble.getBoundingClientRect();
		const margin = 8;
		const maxRight = document.documentElement.clientWidth - margin;
		let shift = 0;
		if (right > maxRight) shift = maxRight - right;
		if (left + shift < margin) shift = margin - left;
		if (shift !== 0) bubble.style.transform = `translateX(${shift}px)`;
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setHovered(false);
				setPinned(false);
			}
		};
		const onPointerDown = (e: PointerEvent) => {
			if (!rootRef.current?.contains(e.target as Node)) setPinned(false);
		};
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("pointerdown", onPointerDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("pointerdown", onPointerDown);
		};
	}, [open]);

	return (
		<span
			ref={rootRef}
			className="relative inline-flex"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<button
				type="button"
				aria-label={label}
				aria-describedby={open ? id : undefined}
				aria-expanded={open}
				className={`group/tip grid size-5 place-items-center rounded-full ${warn ? "text-warn" : "text-muted"}`}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					setPinned((p) => !p);
				}}
				onFocus={(e) => setFocused(e.currentTarget.matches(":focus-visible"))}
				onBlur={() => setFocused(false)}
			>
				<span
					aria-hidden
					className="grid size-4 place-items-center rounded-full bg-sunken text-[10px] leading-none font-semibold transition-colors group-hover/tip:bg-fg group-hover/tip:text-page group-aria-expanded/tip:bg-fg group-aria-expanded/tip:text-page motion-reduce:transition-none"
				>
					i
				</span>
			</button>
			<span
				ref={bubbleRef}
				id={id}
				role="tooltip"
				className={`absolute top-full z-20 mt-1.5 w-60 max-w-[calc(100vw-2rem)] whitespace-normal rounded-lg border border-line bg-raised px-3 py-2 text-xs leading-relaxed font-normal text-pretty shadow-md left-0 ${warn ? "text-warn" : "text-fg"} ${open ? "visible opacity-100" : "invisible opacity-0"} transition-opacity motion-reduce:transition-none`}
			>
				{children}
			</span>
		</span>
	);
};

export default InfoTip;