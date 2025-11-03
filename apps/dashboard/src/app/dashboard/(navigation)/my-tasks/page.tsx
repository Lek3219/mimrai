import { Suspense } from "react";
import { TasksList } from "./tasks-list";

export default function Page() {
	return (
		<Suspense>
			<TasksList />
		</Suspense>
	);
}
