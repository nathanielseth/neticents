import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface DisclosureProps {
	title: string;
	defaultOpen: boolean;
	children: ReactNode;
}

const Disclosure = ({ title, defaultOpen, children }: DisclosureProps) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<details
			className="group border-t border-line pt-4"
			open={isOpen}
			onToggle={(e) => setIsOpen(e.currentTarget.open)}
		>
			<summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-fg select-none [&::-webkit-details-marker]:hidden">
				{title}
				<ChevronDown
					aria-hidden
					className="size-4 text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
				/>
			</summary>
			<div className="mt-4 space-y-6">{children}</div>
		</details>
	);
};

export default Disclosure;