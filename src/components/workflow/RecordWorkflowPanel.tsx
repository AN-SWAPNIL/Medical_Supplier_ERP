import { CheckCircle2, Clock3, FileArchive, FileText, LockKeyhole, Send, XCircle } from "lucide-react";
import { useMemo } from "react";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import { isFinalizedRecord } from "../../lib/permissions/dataVisibility";
import type { EntityRecord } from "../../types";

type WorkflowAction = "submit" | "approve" | "reject" | "post" | "cancel";

type RecordWorkflowPanelProps = {
  record: EntityRecord;
  entityName: string;
  canApprove: boolean;
  canPost: boolean;
  canSubmit: boolean;
  canPrint: boolean;
  onAction: (action: WorkflowAction) => void;
  onPrint?: () => void;
};

function timelineForRecord(record: EntityRecord) {
  if (Array.isArray(record.approvalTimeline)) {
    return record.approvalTimeline.map(String);
  }

  const status = String(record.status ?? "Draft");
  const steps = ["Created in draft"];
  if (["Pending Approval", "Approved", "Posted", "Delivered", "Rejected"].includes(status)) {
    steps.push("Submitted for approval");
  }
  if (["Approved", "Posted", "Delivered"].includes(status)) {
    steps.push("Approved by authorized user");
  }
  if (["Posted", "Delivered"].includes(status)) {
    steps.push("Posted to operational ledger");
  }
  if (status === "Rejected") {
    steps.push("Rejected and returned for correction");
  }
  return steps;
}

export default function RecordWorkflowPanel({ record, entityName, canApprove, canPost, canSubmit, canPrint, onAction, onPrint }: RecordWorkflowPanelProps) {
  const locked = isFinalizedRecord(record);
  const timeline = useMemo(() => timelineForRecord(record), [record]);
  const status = String(record.status ?? "Draft");

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Approval Workflow</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-950">{entityName} Control</h2>
            <StatusBadge status={status} />
            {locked ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                <LockKeyhole className="h-3.5 w-3.5" />
                Finalized lock
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            AI and users may prepare or recommend changes, but final approval/posting remains controlled by authorized roles.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canSubmit && !locked && !["Pending Approval", "Approved", "Posted"].includes(status) ? (
            <Button icon={<Send className="h-4 w-4" />} onClick={() => onAction("submit")}>
              Submit
            </Button>
          ) : null}
          {canApprove && status !== "Posted" ? (
            <>
              <Button icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => onAction("approve")}>
                Approve
              </Button>
              <Button icon={<XCircle className="h-4 w-4" />} onClick={() => onAction("reject")}>
                Reject
              </Button>
            </>
          ) : null}
          {canPost && status !== "Posted" ? (
            <Button variant="primary" icon={<Send className="h-4 w-4" />} onClick={() => onAction("post")}>
              Post
            </Button>
          ) : null}
          {canPrint ? (
            <Button icon={<FileText className="h-4 w-4" />} onClick={onPrint}>
              Print View
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {timeline.map((step, index) => (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={`${step}-${index}`}>
            <div className="flex items-center gap-2">
              {index + 1 === timeline.length && !locked ? <Clock3 className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-teal-700" />}
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Step {index + 1}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-800">{step}</p>
          </div>
        ))}
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
          <div className="flex items-center gap-2">
            <FileArchive className="h-4 w-4 text-teal-700" />
            <span className="text-xs font-bold uppercase tracking-wide text-teal-700">Audit Ready</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-teal-900">Every status change is recorded for the production audit trail.</p>
        </div>
      </div>
    </section>
  );
}
