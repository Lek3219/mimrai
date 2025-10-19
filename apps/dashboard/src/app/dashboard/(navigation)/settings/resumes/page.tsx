import { ResumeActivityList } from "./resume-activity-list";
import { ResumeSettings } from "./resume-settings";

export default function Page() {
	return (
		<div className="space-y-4">
			<ResumeSettings />
			<ResumeActivityList />
		</div>
	);
}
