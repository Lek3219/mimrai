import { Suspense } from "react";
import { BacklogList } from "./backlog-list";

export default function Page() {
	return (
		<Suspense>
			<BacklogList />
		</Suspense>
	);
}
