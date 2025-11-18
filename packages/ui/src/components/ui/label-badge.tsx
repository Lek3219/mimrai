import { getContrast } from "@mimir/utils/random";
import { Badge } from "./badge";

export const LabelBadge = ({
	color,
	name,
	variant = "secondary",
}: {
	color: string;
	name: string;
	variant?: "default" | "secondary" | "outline";
}) => {
	return (
		<Badge
			// style={{ backgroundColor: color, color: getContrast(color) }}
			className="flex justify-start rounded-xs text-start"
			variant={variant}
		>
			<div
				className="size-3 rounded-full"
				style={{ backgroundColor: color, color: getContrast(color) }}
			/>
			{name}
		</Badge>
	);
};
