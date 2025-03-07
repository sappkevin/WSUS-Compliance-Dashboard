import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Monitor, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Computers", href: "/computers", icon: Monitor },
  { name: "Updates", href: "/updates", icon: Package },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
      isCollapsed ? "lg:w-20" : "lg:w-72",
      "transition-all duration-300"
    )}>
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6">
        <div className="flex h-16 shrink-0 items-center justify-between">
          {!isCollapsed && <h1 className="text-xl font-bold">WSUS Dashboard</h1>}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <a
                        className={cn(
                          location === item.href
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        )}
                      >
                        <item.icon
                          className="h-6 w-6 shrink-0"
                          aria-hidden="true"
                        />
                        {!isCollapsed && item.name}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}