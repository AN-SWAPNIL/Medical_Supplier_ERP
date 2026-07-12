import { Bot, CheckCircle2, XCircle } from "lucide-react";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import type { AiRecommendation } from "../../types";

type AIRecommendationCardProps = {
  recommendation: AiRecommendation;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
};

export default function AIRecommendationCard({ recommendation, onApprove, onReject }: AIRecommendationCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
          <Bot className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">{recommendation.agent}</p>
            <StatusBadge status={recommendation.status} />
          </div>
          <h3 className="mt-1 text-base font-bold text-slate-950">{recommendation.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{recommendation.reason}</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
          <strong className="block text-lg text-slate-950">{recommendation.confidence}%</strong>
          <span className="text-xs font-semibold text-slate-500">Confidence</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Source Data</p>
          <p className="mt-1 text-sm text-slate-700">{recommendation.sourceData}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Recommended Action</p>
          <p className="mt-1 text-sm text-slate-700">{recommendation.recommendedAction}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button icon={<XCircle className="h-4 w-4" />} onClick={() => onReject?.(recommendation.id)}>
          Reject
        </Button>
        <Button variant="primary" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => onApprove?.(recommendation.id)}>
          Approve
        </Button>
      </div>
    </div>
  );
}
