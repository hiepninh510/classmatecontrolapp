import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Accumulate } from "../../models/locationInterface";

interface CreditPieChartProps {
  creditsProps: Accumulate;
}

export function CreditPieChart({ creditsProps }: CreditPieChartProps) {
  const creditsIsPass = Number(creditsProps?.creditsIsPass ?? 0);
  const totalCredits = Number(creditsProps?.totalCredits ?? 0);
  const remainingCredits = totalCredits - creditsIsPass;

  const total = creditsIsPass + remainingCredits;
  if (total <= 0) return <div>Chưa có dữ liệu</div>;

  const data = [
    { name: "Đã tích lũy", value: creditsIsPass },
    { name: "Chưa tích lũy", value: remainingCredits },
  ];

  const COLORS = ["#0088FE", "#FF8042"];

  return (
    <div style={{ width: "100%", height: 400, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <ResponsiveContainer width="50%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={(entry) => `${entry.value}`}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => {
              const percent = ((value / total) * 100).toFixed(1);
              return [`${value} (${percent}%)`, "Giá trị"];
            }}
          />
          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
