import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Updates() {
  const { data: updates, isLoading } = useQuery({
    queryKey: ["/api/updates"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Updates</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Classification</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Release Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {updates?.map((update: any) => (
            <TableRow key={update.id}>
              <TableCell className="font-medium">{update.title}</TableCell>
              <TableCell>{update.classification}</TableCell>
              <TableCell>
                <Badge variant={update.severity === "Critical" ? "destructive" : "default"}>
                  {update.severity}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={update.isApproved ? "success" : "secondary"}>
                  {update.isApproved ? "Approved" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(update.releaseDate).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
