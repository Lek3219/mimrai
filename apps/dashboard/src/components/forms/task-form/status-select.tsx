import { DataSelectInput } from "@mimir/ui/data-select-input";
import { FormControl, FormField, FormItem } from "@mimir/ui/form";
import { useFormContext } from "react-hook-form";
import { StatusIcon } from "@/components/status-icon";
import { trpc } from "@/utils/trpc";
import type { TaskFormValues } from "./form-type";

export const StatusSelect = () => {
	const form = useFormContext<TaskFormValues>();

	return (
		<FormField
			name="statusId"
			control={form.control}
			render={({ field }) => (
				<FormItem>
					<FormControl>
						<DataSelectInput
							size="sm"
							className="h-6! text-xs"
							queryOptions={trpc.statuses.get.queryOptions(
								{},
								{
									select: (data) => data.data,
								},
							)}
							value={field.value || null}
							onChange={(value) => field.onChange(value || undefined)}
							getLabel={(item) => item?.name ?? ""}
							getValue={(item) => item?.id ?? ""}
							renderValue={(item) => (
								<span className="flex items-center gap-2">
									<StatusIcon className="size-3.5" type={item.type} />
									{item.name}
								</span>
							)}
							renderItem={(item) => (
								<span className="flex items-center gap-2">
									<StatusIcon type={item.type} />
									{item.name}
								</span>
							)}
							variant={"secondary"}
						/>
					</FormControl>
				</FormItem>
			)}
		/>
	);
};
