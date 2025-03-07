import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, Computer } from "lucide-react";

interface StatusCardsProps {
  stats: {
    compliant: number;
    noncompliant: number;
    total: number;
  } | undefined;
  loading: boolean;
}

export default function StatusCards({ stats, loading }: StatusCardsProps) {
  if (loading || !stats) {
    return <div>Loading...</div>;
  }

  const cards = [
    {
      title: "Total Computers",
      value: stats.total,
      icon: Computer,
      description: "Managed computers",
    },
    {
      title: "Compliant",
      value: stats.compliant,
      icon: CheckCircle,
      description: "Up to date",
    },
    {
      title: "Non-compliant",
      value: stats.noncompliant,
      icon: XCircle,
      description: "Need attention",
    },
    {
      title: "Compliance Rate",
      value: stats.total === 0 ? "0%" : `${((stats.compliant / stats.total) * 100).toFixed(1)}%`,
      icon: AlertCircle,
      description: "Overall status",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}