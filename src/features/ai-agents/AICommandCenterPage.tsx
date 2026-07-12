import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, BrainCircuit, CheckCircle2, FileSearch, Lightbulb, ShieldAlert } from "lucide-react";
import AIRecommendationCard from "../../components/ai/AIRecommendationCard";
import FileUploadMock from "../../components/ai/FileUploadMock";
import PageHeader from "../../components/ui/PageHeader";
import { apiClient } from "../../lib/api/client";
import { useToastStore } from "../../lib/ui/toast";

const agents = [
  ["Import Document Extraction Agent", FileSearch],
  ["Landed Cost Calculation Agent", BrainCircuit],
  ["Inventory Risk Agent", ShieldAlert],
  ["Sales CRM Agent", Lightbulb],
  ["Collection Risk Agent", ShieldAlert],
  ["Finance Reconciliation Agent", CheckCircle2],
  ["Management Insight Agent", Bot],
  ["Notification Agent", Bot]
];

export default function AICommandCenterPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const query = useQuery({
    queryKey: ["ai-recommendations"],
    queryFn: async () => (await apiClient.aiRecommendations()).data
  });
  const mutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "approve" | "reject" }) => (await apiClient.aiAction(id, action)).data,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ai-recommendations"] });
      pushToast({ kind: "success", title: `AI recommendation ${variables.action}d`, message: "Human approval control was recorded." });
    }
  });

  return (
    <>
      <PageHeader
        eyebrow="AI Agents"
        title="AI Command Center"
        subtitle="Mock LangChain/LangGraph-ready interfaces. AI assists, validates, alerts and recommends, but never auto-posts final transactions."
        actions={<span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">Human approval required</span>}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {agents.map(([label, Icon]) => (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={label as string}>
            <Icon className="h-6 w-6 text-teal-700" />
            <h2 className="mt-3 font-bold text-slate-950">{label as string}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Mock interface ready for API replacement.</p>
          </div>
        ))}
      </div>
      <FileUploadMock onExtract={() => pushToast({ kind: "info", title: "Document extracted", message: "PI/PO/LC fields were auto-filled in mock mode." })} />
      <section className="grid gap-4 xl:grid-cols-2">
        {(query.data ?? []).map((recommendation) => (
          <AIRecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onApprove={(id) => mutation.mutate({ id, action: "approve" })}
            onReject={(id) => mutation.mutate({ id, action: "reject" })}
          />
        ))}
      </section>
    </>
  );
}
