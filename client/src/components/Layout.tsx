import { Link, useLocation } from "wouter";
import { Home, Users, ClipboardList, BarChart3 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/patients", icon: Users, label: "Patients" },
    { path: "/reviews", icon: ClipboardList, label: "Reviews" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 gap-6">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <ClipboardList className="w-6 h-6 text-primary-foreground" />
        </div>
        
        <nav className="flex-1 flex flex-col gap-2 w-full">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Link href={item.path} asChild>
                    <button
                      data-testid={`nav-${item.label.toLowerCase()}`}
                      className={`
                        w-full h-12 flex items-center justify-center
                        transition-colors relative group
                        ${isActive 
                          ? 'text-sidebar-primary' 
                          : 'text-sidebar-foreground hover:text-sidebar-accent-foreground'
                        }
                      `}
                    >
                      {isActive && (
                        <div className="absolute left-0 w-1 h-8 bg-sidebar-primary rounded-r" />
                      )}
                      <Icon className="w-5 h-5" />
                    </button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
