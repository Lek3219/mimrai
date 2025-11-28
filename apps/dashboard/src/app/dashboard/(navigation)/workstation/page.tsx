import { Alert, AlertDescription } from "@ui/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Suspense } from "react";
import { WorkstationList } from "./workstation-list";

export default function Page() {
	return (
		<Suspense>
			<Alert className="mb-4">
				<InfoIcon />
				<AlertDescription>
					This is a beta version of the workstation. It's under active
					development. Some features may be missing or incomplete.
				</AlertDescription>
			</Alert>
			<WorkstationList />
		</Suspense>
	);
}
