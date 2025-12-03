import { Suspense } from "react";
import { RecurringList } from "./recurring-list";

export default function Page() {
	return (
		<Suspense>
			<div className="h-full">
				<RecurringList />
			</div>
		</Suspense>
	);
}
