import { useQuery } from "@tanstack/react-query";
import StatusCards from "@/components/dashboard/status-cards";
import ComplianceChart from "@/components/dashboard/compliance-chart";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Dashboard() {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/compliance"],
  });

  const { data: computers, isLoading: computersLoading } = useQuery({
    queryKey: ["/api/computers"],
  });

  const syncData = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const res = await apiRequest("POST", "/api/sync");
      const data = await res.json();

      queryClient.invalidateQueries();
      toast({
        title: "Sync Successful",
        description: `Successfully synced ${data.computers} computers and ${data.updates} updates.`
      });
    } catch (error: any) {
      let description = "Failed to sync WSUS data";

      // Parse the error response
      const errorData = await error.response?.json?.().catch(() => ({}));

      if (errorData?.message) {
        description = errorData.message;
      } else if (error.message?.includes("Missing required environment")) {
        description = "Please check your .env file and ensure the following variables are set:\n" +
          "• WSUS_SERVER\n" +
          "• WSUS_SERVICE_ACCOUNT\n" +
          "• WSUS_SERVICE_PASSWORD";
      } else if (error.message?.includes("timed out")) {
        description = "Connection to WSUS server timed out. Please verify:\n" +
          "• WSUS server address is correct\n" +
          "• Server is accessible from this network\n" +
          "• Port 8530 (or 8531 for SSL) is open";
      } else if (error.message?.includes("Could not connect")) {
        description = "Could not connect to WSUS server. Please verify:\n" +
          "• Service account has WSUS administrator rights\n" +
          "• Password is correct\n" +
          "• Server name matches your WSUS configuration";
      } else {
        console.error("Unexpected error during sync:", error);
        description = "An unexpected error occurred. Please check the server logs.";
      }

      toast({
        title: "Sync Failed",
        description,
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">WSUS Compliance Dashboard</h1>
        <Button onClick={syncData} disabled={isSyncing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync WSUS Data'}
        </Button>
      </div>

      <StatusCards stats={stats} loading={statsLoading} />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <ComplianceChart data={stats} loading={statsLoading} />

        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {computersLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {computers?.slice(0, 5).map((computer: any) => (
                <div key={computer.id} className="flex justify-between items-center">
                  <span>{computer.computerName}</span>
                  <span className="text-muted-foreground">
                    {new Date(computer.lastSyncTime).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}