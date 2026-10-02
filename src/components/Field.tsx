import type { ReactNode } from "react";

interface FieldLabelProps {
	id?: string;
	children: ReactNode;
	className?: string;
}

export const FieldLabel = ({ id, children, className = "" }: FieldLabelProps) => (
	<span id={id} className={`text-sm font-medium text-fg ${className}`}>
		{children}
	</span>
);

interface FieldHintProps {
	id?: string;
	warn?: boolean;
	children: ReactNode;
}

export const FieldHint = ({ id, warn = false, children }: FieldHintProps) => (
	<p
		id={id}
		className={`mt-1.5 text-xs text-pretty ${warn ? "text-warn" : "text-muted"}`}
	>
		{children}
	</p>
);
