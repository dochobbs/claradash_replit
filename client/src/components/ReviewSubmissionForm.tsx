import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProviderReviewSchema, type InsertProviderReview } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Check, MessageSquare, X, AlertTriangle } from "lucide-react";

interface ReviewSubmissionFormProps {
  interactionId: string;
  onSubmit: (data: InsertProviderReview) => void;
  isSubmitting?: boolean;
}

const decisionOptions = [
  {
    value: "agree" as const,
    label: "Agree",
    description: "AI response is appropriate and accurate",
    icon: Check,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    value: "agree_with_thoughts" as const,
    label: "Agree with Thoughts",
    description: "Generally good but with additional considerations",
    icon: MessageSquare,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "disagree" as const,
    label: "Disagree",
    description: "AI response needs correction or alternative approach",
    icon: X,
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    value: "needs_escalation" as const,
    label: "Needs Escalation",
    description: "Requires immediate medical attention or specialist review",
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
  },
];

export default function ReviewSubmissionForm({
  interactionId,
  onSubmit,
  isSubmitting = false,
}: ReviewSubmissionFormProps) {
  const form = useForm<InsertProviderReview>({
    resolver: zodResolver(insertProviderReviewSchema),
    defaultValues: {
      interactionId,
      providerName: "",
      reviewDecision: "agree",
      providerNotes: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="providerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Provider Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-testid="input-provider-name"
                  placeholder="Dr. Jane Smith"
                  className="text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reviewDecision"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Review Decision</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="space-y-3"
                >
                  {decisionOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <FormItem key={option.value}>
                        <FormControl>
                          <div className="flex items-start space-x-3">
                            <RadioGroupItem
                              value={option.value}
                              id={option.value}
                              data-testid={`radio-${option.value}`}
                              className="mt-1"
                            />
                            <label
                              htmlFor={option.value}
                              className="flex-1 cursor-pointer space-y-1"
                            >
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${option.color}`} />
                                <span className="text-sm font-medium text-foreground">
                                  {option.label}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {option.description}
                              </p>
                            </label>
                          </div>
                        </FormControl>
                      </FormItem>
                    );
                  })}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="providerNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">
                Provider Notes
                <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  data-testid="textarea-provider-notes"
                  placeholder="Add any additional clinical notes, recommendations, or context..."
                  className="min-h-32 resize-none text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          data-testid="button-submit-review"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? "Submitting Review..." : "Submit Review"}
        </Button>
      </form>
    </Form>
  );
}
