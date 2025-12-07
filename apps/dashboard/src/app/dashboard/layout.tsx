import { Suspense } from "react";
import { GlobalSheets } from "@/components/sheets/global-sheets";

type Props = {
	children: React.ReactNode;
};

export default function Layout({ children }: Props) {
	return (
		<>
			{children}
			<Suspense>
				<GlobalSheets />
			</Suspense>
		</>
	);
}
