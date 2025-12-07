import { motion } from "motion/react";
import { useMemo } from "react";
import type { ZenModeTask } from "./view";

export const ZenModeScrollSpy = ({
	task,
	contentRef,
}: {
	task: ZenModeTask;
	contentRef: React.RefObject<HTMLElement | null>;
}) => {
	const content = task.description;
	const elements = useMemo(() => {
		if (!content) return [];
		const headings =
			contentRef.current?.querySelectorAll("h1, h2, h3, h4, h5, h6") || [];
		return Array.from(headings).map((heading) => ({
			id: heading.id,
			element: heading,
			text: heading.textContent || "",
			level: Number.parseInt(heading.tagName.substring(1), 10),
		}));
	}, [content, contentRef?.current]);

	return (
		<nav className="-translate-y-1/2 fixed top-1/2 right-4 max-h-[70vh] w-16 overflow-y-auto p-4 text-sm">
			<ul>
				{elements.map((el, index) => (
					<li
						key={index}
						className={"flex items-center"}
						style={{
							paddingLeft: `${(el.level - 1) * 8}px`,
						}}
					>
						<motion.button
							type="button"
							className="block w-full py-2"
							variants={{
								initial: {
									opacity: 0.6,
								},
								hover: {
									opacity: 1,
								},
							}}
							initial={"initial"}
							whileHover="hover"
							transition={{ duration: 0.2 }}
							onClick={() => {
								const target = el.element;
								console.log("Scrolling to", target.className);
								if (target) {
									target.scrollIntoView({
										behavior: "smooth",
										block: "center",
									});
								}
							}}
						>
							<motion.div
								variants={{
									initial: { scaleY: 1 },
									hover: { scaleY: 2 },
								}}
								className="h-0.5 w-full bg-primary"
							/>
						</motion.button>
					</li>
				))}
			</ul>
		</nav>
	);
};
