import ProjectTasksList from "./project-tasks-list";

type Props = {
	params: Promise<{ projectId: string }>;
};

export default async function Page({ params }: Props) {
	const { projectId } = await params;

	return <ProjectTasksList projectId={projectId} />;
}
