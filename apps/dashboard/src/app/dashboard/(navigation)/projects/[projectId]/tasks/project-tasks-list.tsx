"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@ui/components/ui/button";
import { AnimatePresence } from "motion/react";
import { useMemo } from "react";
import { TaskContextMenu } from "@/components/kanban/task-context-menu";
import Loader from "@/components/loader";
import { TaskItem } from "@/components/task-item";
import { trpc } from "@/utils/trpc";

export default function ProjectTasksList({ projectId }: { projectId: string }) {
	const {
		data: tasks,
		fetchNextPage,
		isLoading,
		hasNextPage,
	} = useInfiniteQuery(
		trpc.tasks.get.infiniteQueryOptions(
			{
				projectId: [projectId],
				pageSize: 20,
			},
			{
				getNextPageParam: (lastPage) => lastPage.meta.cursor,
			},
		),
	);

	const listData = useMemo(() => {
		return tasks?.pages.flatMap((page) => page.data) || [];
	}, [tasks]);

	return (
		<div>
			<AnimatePresence>
				<ul className="flex flex-col gap-2 py-4">
					{listData.map((task) => (
						<TaskContextMenu key={task.id} task={task}>
							<li>
								<TaskItem task={task} />
							</li>
						</TaskContextMenu>
					))}
				</ul>
			</AnimatePresence>
			{hasNextPage && (
				<div className="flex justify-center">
					<Button
						variant="outline"
						onClick={() => fetchNextPage()}
						disabled={!hasNextPage || isLoading}
					>
						{isLoading && <Loader />}
						Load more
					</Button>
				</div>
			)}
		</div>
	);
}
