import { Suspense } from "react";
import { RecurringList } from "./recurring-list";

export default function Page() {
	return (
		<Suspense>
			<div className="h-full py-4">
				<RecurringList />
			</div>
		</Suspense>
	);
}
