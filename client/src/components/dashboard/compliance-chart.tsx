import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#10B981", "#EF4444"];

interface ComplianceChartProps {
  data: {
    compliant: number;
    noncompliant: number;
    total: number;
  } | undefined;
  loading: boolean;
}

export default function ComplianceChart({ data, loading }: ComplianceChartProps) {
  if (loading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: "Compliant", value: data.compliant },
    { name: "Non-compliant", value: data.noncompliant },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
