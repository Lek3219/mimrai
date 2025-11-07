"use client";
import { Card, CardContent } from "@mimir/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@mimir/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { format, sub } from "date-fns";
import { useState } from "react";
import { Area, AreaChart, XAxis } from "recharts";
import { trpc } from "@/utils/trpc";

const chartConfig = {
	taskCompletedCount: {
		label: "Tasks Completed",
		color: "var(--chart-2)",
	},
	checklistItemsCompletedCount: {
		label: "Checklist Items Completed",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

export const TasksCompletedByDayWidget = () => {
	const [dateRange, setDateRange] = useState<{
		startDate: Date;
		endDate: Date;
	}>({
		startDate: sub(new Date(), { days: 7 }),
		endDate: new Date(),
	});

	const { data } = useQuery(
		trpc.widgets.tasksCompletedByDay.queryOptions({
			...dateRange,
		}),
	);

	return (
		<Card className="border-0 py-0">
			<CardContent className="px-0">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full"
				>
					<AreaChart
						accessibilityLayer
						data={data || []}
						// margin={{
						// 	left: 12,
						// 	right: 12,
						// }}
					>
						{/* <CartesianGrid vertical={false} /> */}
						<XAxis
							dataKey={"date"}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => format(value, "MMM dd")}
						/>
						<defs>
							<linearGradient
								id="fillTaskCompletedCount"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="5%"
									stopColor="var(--chart-2)"
									stopOpacity={0.8}
								/>
								<stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
							</linearGradient>
							<linearGradient
								id="fillChecklistItemsCompletedCount"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="5%"
									stopColor="var(--chart-1)"
									stopOpacity={0.8}
								/>
								<stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
							</linearGradient>
						</defs>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Area
							dataKey={"taskCompletedCount"}
							type={"monotone"}
							fill="url(#fillTaskCompletedCount)"
							stroke="var(--chart-2)"
							stackId={"a"}
						/>
						<Area
							dataKey={"checklistItemsCompletedCount"}
							type={"monotone"}
							fill="url(#fillChecklistItemsCompletedCount)"
							stroke="var(--chart-1)"
							stackId={"a"}
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
};
