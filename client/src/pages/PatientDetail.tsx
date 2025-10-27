import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, User, Mail, Phone, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import ReviewTimeline from "@/components/ReviewTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { PatientWithChildren, AiInteractionWithDetails } from "@shared/schema";
import { format } from "date-fns";

export default function PatientDetail() {
  const [, params] = useRoute("/patients/:id");
  const patientId = params?.id;

  const { data: patient, isLoading: patientLoading } = useQuery<PatientWithChildren>({
    queryKey: ["/api", "patients", patientId],
    enabled: !!patientId,
  });

  const { data: interactions, isLoading: interactionsLoading } = useQuery<AiInteractionWithDetails[]>({
    queryKey: ["/api", "interactions", patientId],
    enabled: !!patientId,
  });

  if (!patientId) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link href="/patients">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Info - Left Panel */}
          <div className="lg:col-span-1 space-y-4">
            {patientLoading ? (
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            ) : patient ? (
              <>
                <Card>
                  <CardHeader className="border-b border-border">
                    <CardTitle className="text-lg font-semibold">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h2 className="text-base font-medium text-foreground" data-testid="text-patient-name">
                          {patient.name}
                        </h2>
                        <p className="text-xs text-muted-foreground">Parent/Guardian</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Email
                          </p>
                          <p className="text-sm text-foreground">{patient.email}</p>
                        </div>
                      </div>

                      {patient.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Phone
                            </p>
                            <p className="text-sm text-foreground">{patient.phone}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Registered
                          </p>
                          <p className="text-sm text-foreground">
                            {format(new Date(patient.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {patient.children && patient.children.length > 0 && (
                  <Card>
                    <CardHeader className="border-b border-border">
                      <CardTitle className="text-lg font-semibold">Children</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {patient.children.map((child) => (
                          <div key={child.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                            <p className="text-sm font-medium text-foreground mb-1">
                              {child.name}
                            </p>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                DOB: {format(new Date(child.dateOfBirth), "MMM d, yyyy")}
                              </p>
                              <p className="text-xs font-mono text-muted-foreground">
                                MRN: {child.medicalRecordNumber}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : null}
          </div>

          {/* Review Timeline - Center Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg font-semibold">Interaction History</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {interactionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : interactions ? (
                  <ReviewTimeline interactions={interactions} />
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
