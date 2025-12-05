"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui/components/ui/button";
import { Skeleton } from "@ui/components/ui/skeleton";
import { CalendarIcon } from "lucide-react";
import {
	EmptyState,
	EmptyStateAction,
	EmptyStateDescription,
	EmptyStateIcon,
	EmptyStateTitle,
} from "@/components/empty-state";
import { ProjectIcon } from "@/components/project-icon";
import { ProjectsTimeline } from "@/components/projects-timeline/projects-timeline";
import { useProjectParams } from "@/hooks/use-project-params";
import { trpc } from "@/utils/trpc";

export default function Page() {
	const { setParams } = useProjectParams();
	const queryClient = useQueryClient();
	const { data: projects, isLoading } = useQuery(
		trpc.projects.getForTimeline.queryOptions(),
	);

	const { mutate: updateProject } = useMutation(
		trpc.projects.update.mutationOptions(),
	);

	const handleProjectDateChange = (
		projectId: string,
		startDate: Date | null,
		endDate: Date | null,
	) => {
		updateProject({
			id: projectId,
			...(startDate && { startDate: startDate.toISOString() }),
			...(endDate && { endDate: endDate.toISOString() }),
		});

		queryClient.setQueryData(
			trpc.projects.getForTimeline.queryKey(),
			(oldProjects) => {
				if (!oldProjects) return oldProjects;
				return oldProjects.map((project) => {
					if (project.id === projectId) {
						return {
							...project,
							startDate: startDate
								? startDate.toISOString()
								: project.startDate,
							endDate: endDate ? endDate.toISOString() : project.endDate,
						};
					}
					return project;
				});
			},
		);
	};

	const handleProjectClick = (projectId: string) => {
		setParams({ projectId });
	};

	if (isLoading) {
		return (
			<div className="space-y-4 p-4">
				<Skeleton className="h-12 w-full" />
				{[...Array(5)].map((_, i) => (
					<Skeleton key={i} className="h-14 w-full" />
				))}
			</div>
		);
	}

	// Filter projects that have at least a startDate, endDate, or milestones with dueDates
	const projectsWithDates = (projects || []).filter(
		(project) =>
			project.startDate ||
			project.endDate ||
			project.milestones.some((m) => m.dueDate),
	);

	if (projectsWithDates.length === 0) {
		return (
			<EmptyState>
				<EmptyStateIcon>
					<CalendarIcon className="size-10" />
				</EmptyStateIcon>
				<EmptyStateTitle>No timeline data</EmptyStateTitle>
				<EmptyStateDescription>
					Projects need start and end dates or milestones with due dates to
					appear on the timeline.
				</EmptyStateDescription>
				<EmptyStateAction>
					<Button
						onClick={() => setParams({ createProject: true })}
						variant="default"
					>
						Create a project
					</Button>
				</EmptyStateAction>
			</EmptyState>
		);
	}

	return (
		<div className="grid h-full grid-cols-[300px_1fr]">
			<div className="space-y-2 border-r p-2 pt-13">
				{projects?.map((project) => (
					<button
						key={project.id}
						type="button"
						className="w-full rounded-sm px-4 py-2 text-sm hover:bg-card/40"
						onClick={() => setParams({ projectId: project.id })}
					>
						<div className="flex h-8 items-center gap-2">
							<ProjectIcon {...project} className="size-4" />
							{project.name}
						</div>
					</button>
				))}
			</div>
			<ProjectsTimeline
				projects={projectsWithDates}
				onProjectDateChange={handleProjectDateChange}
				onProjectClick={handleProjectClick}
			/>
		</div>
	);
}
