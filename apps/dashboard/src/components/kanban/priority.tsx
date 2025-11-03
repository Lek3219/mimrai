import { Badge } from "@mimir/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@mimir/ui/tooltip";
import {
	SignalHighIcon,
	SignalLow,
	SignalLowIcon,
	SignalMediumIcon,
} from "lucide-react";

const PriorityTooltip = ({
	value,
	children,
}: {
	value: "low" | "medium" | "high";
	children: React.ReactNode;
}) => {
	return (
		<Tooltip delayDuration={500}>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent className="capitalize">{value}</TooltipContent>
		</Tooltip>
	);
};

const PriorityIcon = {
	low: SignalLowIcon,
	medium: SignalMediumIcon,
	high: SignalHighIcon,
};

export const Priority = ({ value }: { value: "low" | "medium" | "high" }) => {
	const Icon = PriorityIcon[value];
	return (
		<PriorityTooltip value={value}>
			<div className="mb-1">
				<Icon />
			</div>
		</PriorityTooltip>
	);
};

export const PriorityBadge = ({
	value,
}: {
	value: "low" | "medium" | "high";
}) => {
	if (value === "low") {
		return <Badge variant="secondary">Low</Badge>;
	}

	if (value === "medium") {
		return <Badge variant="default">Medium</Badge>;
	}

	if (value === "high") {
		return <Badge variant="destructive">High</Badge>;
	}

	return null;
};
