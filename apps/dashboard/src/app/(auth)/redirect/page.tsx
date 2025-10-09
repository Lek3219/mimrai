import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";

export default async function Page() {
	const session = await getSession();

	if (!session?.user) {
		return redirect("/sign-in");
	}

	if ("teamId" in session.user && !session.user.teamId) {
		return redirect("/dashboard/onboarding");
	}

	return redirect("/dashboard");
}
