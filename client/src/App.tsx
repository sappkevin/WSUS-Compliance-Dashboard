import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Computers from "@/pages/computers";
import Updates from "@/pages/updates";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:pl-72">
        <Header />
        <main className="flex-1 p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/computers" component={Computers} />
            <Route path="/updates" component={Updates} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;