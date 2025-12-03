import { AnimatePresence } from "motion/react";
import { TaskContextMenu } from "../kanban/task-context-menu";
import { TaskItem } from "./task-item";
import { useTasksViewContext } from "./tasks-view";

export const TasksList = () => {
	const { tasks } = useTasksViewContext();

	return (
		<AnimatePresence mode="popLayout">
			<ul className="flex flex-col gap-2 py-4">
				{tasks.map((task) => (
					<TaskContextMenu key={task.id} task={task}>
						<li>
							<TaskItem task={task} />
						</li>
					</TaskContextMenu>
				))}
			</ul>
		</AnimatePresence>
	);
};
