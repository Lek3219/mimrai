import { cn } from "@/lib/utils";

export const TaskGrid = ({
	children,
	verticalLength,
	horizontalLength = 1,
}: {
	children?: React.ReactNode;
	verticalLength: number;
	horizontalLength?: number;
}) => {
	return (
		<div className="absolute h-full">
			{children}
			{new Array(verticalLength).fill(0).map((_, i) => (
				<div
					key={i}
					className={cn(
						"pointer-events-none absolute right-0 left-0 mt-14 h-32 w-screen border-t last:border-b",
					)}
					style={{
						top: `calc(var(--spacing)*32*${i})`,
						// *${i}+var(--spacing)*4*${i})
					}}
				/>
			))}
			{new Array(horizontalLength).fill(0).map((_, i) => (
				<div
					key={i}
					className="pointer-events-none absolute top-0 bottom-0 h-full w-86 border-l"
					style={{
						left: `calc(var(--spacing)*86*${i})`,
					}}
				/>
			))}
		</div>
	);
};
