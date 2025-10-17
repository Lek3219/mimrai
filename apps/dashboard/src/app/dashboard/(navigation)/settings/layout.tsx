import { SettingsSidebar } from "./sidebar";

type Props = {
	children: React.ReactNode;
};

export default function Page({ children }: Props) {
	return (
		<div className="relative grid w-full flex-1 grid-cols-[250px_1fr] gap-8 px-12 py-10">
			<SettingsSidebar />
			<main className="flex w-full">
				<div className="w-full">{children}</div>
			</main>
		</div>
	);
}
