import { Suspense } from "react";
import { ColumnsList } from "./columns-list";

export default function Page() {
	return (
		<div>
			<Suspense>
				<ColumnsList />
			</Suspense>
		</div>
	);
}
