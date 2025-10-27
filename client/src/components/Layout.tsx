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
      {/* Sidebar Navigation - Vital Branding */}
      <aside className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 gap-6">
        {/* Vital Logo & Wordmark */}
        <div className="flex flex-col items-center gap-2" data-testid="vital-logo">
          {/* Vital wave mark */}
          <svg
            width="36"
            height="20"
            viewBox="0 0 36 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-sidebar-primary"
          >
            <path
              d="M2 18 C6 10, 10 2, 14 6 C18 10, 22 2, 26 6 C30 10, 32 18, 34 18"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          {/* Vital text */}
          <span className="text-[10px] font-bold tracking-wider text-sidebar-foreground">
            VITAL
          </span>
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
