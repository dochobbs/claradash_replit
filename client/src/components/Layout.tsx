import { Link, useLocation } from "wouter";
import { Home, Users, ClipboardList, BarChart3, MessageSquare } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/patients", icon: Users, label: "Patients" },
    { path: "/reviews", icon: ClipboardList, label: "Reviews" },
    { path: "/escalations", icon: MessageSquare, label: "Escalations" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Navigation - Vital Branding */}
      <aside className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 gap-6">
        {/* Vital Logo - Authentic check mark */}
        <Link href="/" className="flex items-center justify-center px-2" data-testid="vital-logo">
          <svg
            width="40"
            height="24"
            viewBox="0 0 120 60"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="text-sidebar-foreground dark:text-sidebar-primary"
            aria-label="Vital"
          >
            <path
              d="M 10 25 Q 15 18, 25 18 Q 35 18, 45 35 L 60 55 L 75 20 Q 85 10, 95 10 Q 105 10, 110 18 Q 105 25, 95 25 Q 85 25, 75 35 L 60 15 L 45 50 Q 35 60, 25 60 Q 15 60, 10 50 Z"
              fillRule="evenodd"
            />
          </svg>
        </Link>
        
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
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar
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
