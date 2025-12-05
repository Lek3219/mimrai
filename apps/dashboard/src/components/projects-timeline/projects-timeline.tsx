"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TimelineHeader } from "./timeline-header";
import { TimelineProjectRow } from "./timeline-project-row";
import {
	BUFFER_PX,
	getTimelineWidth,
	getVisibleContainerWidth,
	type TimelineProject,
	type VisibleRange,
} from "./types";
import {
	calculateTimelineRange,
	calculateVisibleRange,
	getPositionPixels,
} from "./utils";

interface ProjectsTimelineProps {
	projects: TimelineProject[];
	onProjectDateChange?: (
		projectId: string,
		startDate: Date | null,
		endDate: Date | null,
	) => void;
	onProjectClick?: (projectId: string) => void;
}

export function ProjectsTimeline({
	projects,
	onProjectDateChange,
	onProjectClick,
}: ProjectsTimelineProps) {
	const range = useMemo(() => calculateTimelineRange(projects), [projects]);
	const totalWidth = getTimelineWidth(range);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const [dragStartScrollPosition, setDragStartScrollPosition] = useState(0);
	const [containerWidth, setContainerWidth] = useState(800);
	// Virtual scroll position (not tied to actual DOM scroll)
	const [virtualScrollLeft, setVirtualScrollLeft] = useState(0);

	// Calculate visible range based on virtual scroll position
	const visibleRange: VisibleRange = useMemo(
		() =>
			calculateVisibleRange(
				virtualScrollLeft,
				containerWidth,
				range,
				BUFFER_PX,
			),
		[virtualScrollLeft, containerWidth, range],
	);

	const visibleContainerWidth = getVisibleContainerWidth(visibleRange);

	// Extended scroll range - allow scrolling 5 years before and after the calculated range
	// This ensures users can always scroll to reach project bars even if they're dragged far out
	const EXTENDED_SCROLL_YEARS = 5;
	const extendedScrollPx = EXTENDED_SCROLL_YEARS * 365 * 5; // 5 px per day

	// Clamp virtual scroll to extended range (allows scrolling beyond project dates)
	const clampScroll = useCallback(
		(scroll: number) => {
			// Allow scrolling from -extendedScrollPx to totalWidth + extendedScrollPx
			const minScroll = -extendedScrollPx;
			const maxScroll = Math.max(0, totalWidth - containerWidth) + extendedScrollPx;
			return Math.max(minScroll, Math.min(scroll, maxScroll));
		},
		[totalWidth, containerWidth, extendedScrollPx],
	);

	// Track if we've initialized the scroll position
	const hasInitializedScroll = useRef(false);

	// Initialize scroll position to today's date ONLY on first render
	useEffect(() => {
		if (containerRef.current && !hasInitializedScroll.current) {
			hasInitializedScroll.current = true;
			const today = new Date();
			const todayPosition = getPositionPixels(today, range);
			const centeredPosition = clampScroll(
				todayPosition - containerRef.current.clientWidth / 2,
			);
			setVirtualScrollLeft(centeredPosition);
			setContainerWidth(containerRef.current.clientWidth);
		}
	}, [range, clampScroll]);

	// Track container resize
	useEffect(() => {
		if (!containerRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setContainerWidth(entry.contentRect.width);
			}
		});

		resizeObserver.observe(containerRef.current);
		return () => resizeObserver.disconnect();
	}, []);

	// Handle wheel events for horizontal scrolling
	const handleWheel = useCallback(
		(e: React.WheelEvent) => {
			// Use deltaX for horizontal scroll, or deltaY if shift is held or if deltaX is 0
			const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
			setVirtualScrollLeft((prev) => clampScroll(prev + delta));
		},
		[clampScroll],
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (!containerRef.current) return;
			setIsDragging(true);
			setStartX(e.pageX);
			setDragStartScrollPosition(virtualScrollLeft);
			containerRef.current.style.cursor = "grabbing";
		},
		[virtualScrollLeft],
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
		if (containerRef.current) {
			containerRef.current.style.cursor = "grab";
		}
	}, []);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (!isDragging) return;
			e.preventDefault();
			const deltaX = startX - e.pageX;
			const walk = deltaX * 1.5; // Adjust scroll speed
			setVirtualScrollLeft(clampScroll(dragStartScrollPosition + walk));
		},
		[isDragging, startX, dragStartScrollPosition, clampScroll],
	);

	const handleMouseLeave = useCallback(() => {
		if (isDragging) {
			setIsDragging(false);
			if (containerRef.current) {
				containerRef.current.style.cursor = "grab";
			}
		}
	}, [isDragging]);

	if (projects.length === 0) {
		return null;
	}

	return (
		<div
			ref={containerRef}
			className="h-full w-full cursor-grab select-none overflow-hidden"
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			onWheel={handleWheel}
		>
			<div className="px-4" style={{ width: visibleContainerWidth + 32 }}>
				{/* Header with date markers */}
				<div className="flex">
					{/* Timeline header */}
					<div className="relative flex-1">
						<TimelineHeader range={range} visibleRange={visibleRange} />
					</div>
				</div>

				{/* Project rows */}
				<div className="">
					{projects.map((project) => (
						<TimelineProjectRow
							key={project.id}
							project={project}
							range={range}
							visibleRange={visibleRange}
							onDateChange={onProjectDateChange}
							onProjectClick={onProjectClick}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
