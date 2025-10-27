import { useQuery } from "@tanstack/react-query";
import { Users as UsersIcon, Search } from "lucide-react";
import Layout from "@/components/Layout";
import PatientCard from "@/components/PatientCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useLocation } from "wouter";
import type { PatientWithChildren } from "@shared/schema";

interface PatientWithStats extends PatientWithChildren {
  interactionCount: number;
  lastReviewDate?: string;
  status: "active" | "review_pending" | "escalated";
}

export default function Patients() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: patients, isLoading } = useQuery<PatientWithStats[]>({
    queryKey: ["/api/patients"],
  });

  const filteredPatients = patients?.filter((patient) => {
    const query = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(query) ||
      patient.email.toLowerCase().includes(query) ||
      patient.children?.some((child) =>
        child.name.toLowerCase().includes(query) ||
        child.medicalRecordNumber.toLowerCase().includes(query)
      )
    );
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Patients</h1>
          <p className="text-sm text-muted-foreground">
            View and manage patient profiles and medical records
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="input-search-patients"
              placeholder="Search by name, email, or MRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Patient List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !filteredPatients || filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-patients">
            <UsersIcon className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              {searchQuery ? "No patients found" : "No patients yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Patient records will appear here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                interactionCount={patient.interactionCount}
                lastReviewDate={
                  patient.lastReviewDate ? new Date(patient.lastReviewDate) : undefined
                }
                status={patient.status}
                onClick={() => setLocation(`/patients/${patient.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
