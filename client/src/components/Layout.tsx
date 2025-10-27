import { Link, useLocation } from "wouter";
import { Home, Users, ClipboardList, BarChart3, MessageSquare, AlertTriangle, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  // Fetch badge counts
  const { data: badges } = useQuery<{
    reviewsPending: number;
    escalationsActive: number;
    messagesUnread: number;
  }>({
    queryKey: ["/api/stats/badges"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/patients", icon: Users, label: "Patients" },
    { path: "/reviews", icon: ClipboardList, label: "Reviews", badge: badges?.reviewsPending, color: "bg-yellow-500" },
    { path: "/escalations", icon: AlertTriangle, label: "Escalations", badge: badges?.escalationsActive, color: "bg-coral" },
    { path: "/messages", icon: MessageSquare, label: "Messages", badge: badges?.messagesUnread, color: "bg-teal-500" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Navigation - Vital Branding */}
      <aside className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 gap-6">
        {/* Dr. Chen Avatar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/" className="flex items-center justify-center" data-testid="dr-chen-avatar">
              <Avatar className="h-10 w-10 border-2 border-sidebar-primary">
                <AvatarFallback className="bg-sidebar-primary text-sidebar font-medium text-sm">
                  SC
                </AvatarFallback>
              </Avatar>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            Dr. Sarah Chen
          </TooltipContent>
        </Tooltip>
        
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
                      {item.badge && item.badge > 0 && (
                        <span className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full ${item.color || 'bg-red-500'}`}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
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
