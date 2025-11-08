"use client";

import { getAppUrl } from "@mimir/utils/envs";
import { Badge } from "@ui/components/ui/badge";
import { Button } from "@ui/components/ui/button";
import { ChevronRight } from "lucide-react";
import { motion, useAnimationFrame } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { createRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { FakeMessage } from "../fakes/fake-message";
import { FakeTask } from "../fakes/fake-tasks";

export const MainHero = () => {
	const constraintsRef = useRef<HTMLDivElement>(null);

	return (
		<motion.div
			className="relative flex h-screen flex-col border"
			ref={constraintsRef}
		>
			<section className="flex h-full flex-col justify-between overflow-hidden px-8 pt-8 pb-8">
				<h1 className="font-runic text-6xl sm:text-8xl">
					MIMR
					<span className="text-muted-foreground">AI</span>
				</h1>
				<p className="max-w-sm text-base text-muted-foreground sm:text-lg">
					Stop over-configuring. Just write what needs to be done — MIMRAI turns
					messages into organized tasks automatically.
				</p>
			</section>

			<div className="-translate-y-1/2 pointer-events-none absolute inset-x-0 top-1/2">
				{/* <div className="mx-8 w-fit space-y-4">
					<FakeMessage
						variant="user"
						body="We need to fix the login bug before the release. Maybe implement OAuth?"
					/>
					<FakeTask
						constraintsRef={constraintsRef}
						title="Implement OAuth"
						labels={["Feature"]}
					/>
					<FakeMessage
						variant="assistant"
						body="The task [Implement OAuth] has been created."
					/>
				</div> */}
			</div>
			{/* <div className="-translate-y-1/2 absolute top-1/2 right-0 h-[80%] w-[50%] overflow-hidden rounded-l-none"> */}
			<div className="-z-1 absolute inset-0 invert">
				<Image
					src={"/images/cover2.png"}
					alt="Cover Image"
					className="size-full object-cover"
					width={1400}
					height={800}
				/>
			</div>
			<div className="pointer-events-none absolute inset-0">
				<Flow className="-translate-y-[10%] pointer-events-none top-[10%] opacity-30" />
				<Flow
					className="-translate-y-[60%] pointer-events-none top-[60%] opacity-30"
					delay={8}
				/>
				<Flow
					className="-translate-y-[100%] pointer-events-none top-[100%] opacity-30"
					delay={5}
				/>
			</div>
			<div className="mt-auto flex justify-between">
				<div className="flex items-center px-8 font-mono">{"10/28/2025"}</div>
				<div className="flex divide-x">
					<Link href={`${getAppUrl()}/sign-in`}>
						<Button type="button">
							Sign in
							<ChevronRight />
						</Button>
					</Link>
					<Link href={`${getAppUrl()}/sign-up`}>
						<Button type="button">
							Join
							<Badge variant={"secondary"} className="rounded-none">
								Beta
							</Badge>
						</Button>
					</Link>
				</div>
			</div>
		</motion.div>
	);
};

const Flow = ({
	className,
	delay = 0,
}: {
	className?: string;
	delay?: number;
}) => {
	const volume = 50;
	const points = useRef<Array<React.Ref<HTMLDivElement>>>(
		Array.from({ length: volume }, () => createRef()),
	);

	const fn = (x: number) => {
		return Math.sin(x / 100) * 30 + 50;
	};

	useAnimationFrame((latest) => {
		const margin = 10;
		// const size = 8;
		// const length = volume * (margin + size);
		const screenWidth = window.innerWidth;
		// const x = ((latest * 0.4) % (length * 2)) - length;
		const x = latest * 0.4 + delay * 100;
		points.current.forEach((pointRef, idx) => {
			if (!pointRef) return;
			const offsetX = (x + idx * margin) % screenWidth;
			const offsetY = fn(offsetX);
			const element = pointRef as { current: HTMLDivElement | null };
			if (element.current) {
				element.current.style.transform = `translateX(${offsetX}px) translateY(${offsetY}px)`;
			}
		});
	});

	return (
		<div
			className={cn(
				"-translate-y-1/2 absolute top-1/2 h-[200px] w-full overflow-hidden",
				className,
			)}
		>
			{points.current.map((ref, idx) => (
				<Point key={idx} ref={points.current[idx]} />
			))}
		</div>
	);
};

const Point = ({ ref }: { ref?: React.Ref<HTMLDivElement> }) => {
	return (
		<div
			className="absolute h-[1px] w-[5px] rounded-full bg-primary"
			ref={ref}
		/>
	);
};
