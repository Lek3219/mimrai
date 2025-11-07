import { TasksCompletedByDayWidget } from "@/components/widgets/tasks-completed-by-day-widget";
import { TasksSummaryByMemberWidget } from "@/components/widgets/tasks-summary-by-member-widget";
import { TasksTodoWidget } from "@/components/widgets/tasks-todo-widget";

export default function Page() {
	return (
		<div className="flex flex-col gap-8">
			<div className="w-full">
				<TasksCompletedByDayWidget />
			</div>
			<div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
				<TasksSummaryByMemberWidget />
				<div className="md:col-span-2">
					<TasksTodoWidget />
				</div>
			</div>
		</div>
	);
}
