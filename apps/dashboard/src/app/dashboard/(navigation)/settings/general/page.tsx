import { Suspense } from "react";
import { TeamSettings } from "./team-settings";

export default function Page() {
	return (
		<div>
			<Suspense>
				<TeamSettings />
			</Suspense>
		</div>
	);
}
