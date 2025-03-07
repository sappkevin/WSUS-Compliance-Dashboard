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

export default function Computers() {
  const { data: computers, isLoading } = useQuery({
    queryKey: ["/api/computers"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Computers</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Computer Name</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>OS Version</TableHead>
            <TableHead>Updates</TableHead>
            <TableHead>Last Sync</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {computers?.map((computer: any) => (
            <TableRow key={computer.id}>
              <TableCell>{computer.computerName}</TableCell>
              <TableCell>{computer.ipAddress}</TableCell>
              <TableCell>{computer.osVersion}</TableCell>
              <TableCell>
                <div className="space-x-2">
                  <Badge variant="default">{computer.installedCount} installed</Badge>
                  <Badge variant="destructive">{computer.failedCount} failed</Badge>
                  <Badge variant="secondary">{computer.neededCount} needed</Badge>
                </div>
              </TableCell>
              <TableCell>
                {new Date(computer.lastSyncTime).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge variant={computer.isOnline ? "success" : "destructive"}>
                  {computer.isOnline ? "Online" : "Offline"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
