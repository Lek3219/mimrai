import { Suspense } from "react";
import { SchedulesList } from "./schedules-list";

export default function Page() {
	return (
		<Suspense>
			<SchedulesList />
		</Suspense>
	);
}
