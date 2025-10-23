import { TasksCompletedByDay } from "@/components/widgets/tasks-completed-by-day";

export default function Page() {
	return (
		<div className="p-8">
			<div className="w-full">
				<TasksCompletedByDay />
			</div>
		</div>
	);
}
