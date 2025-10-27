import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import PatientDetail from "@/pages/PatientDetail";
import Reviews from "@/pages/Reviews";
import ReviewWorkbench from "@/pages/ReviewWorkbench";
import Escalations from "@/pages/Escalations";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/patients" component={Patients} />
      <Route path="/patients/:id" component={PatientDetail} />
      <Route path="/reviews" component={ReviewWorkbench} />
      <Route path="/review-workbench" component={ReviewWorkbench} />
      <Route path="/escalations" component={Escalations} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
