import { Suspense } from "react";
import { RecurringList } from "./recurring-list";

export default function Page() {
	return (
		<Suspense>
			<RecurringList />
		</Suspense>
	);
}
