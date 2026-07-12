import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { Bot, Maximize2, Send, Sparkles, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import { apiClient } from "../../lib/api/client";
import { useEffectiveRole } from "../../lib/auth/session";
import type { AiChatMessage } from "../../types";

const rolePrompts = {
  "Super Admin": ["What does the latest Mipro workbook show?", "Summarize permissions", "Show audit/security risks"],
  "Managing Director": ["Show sales and profit summary", "Explain landed cost for PO-2026-001", "What needs management attention?"],
  Accounts: ["Summarize receivables and payables", "Show bank position", "Explain voucher status"],
  "Import Officer": ["Explain landed cost for PO-2026-001", "What shipment/customs data is visible?", "Which import documents matter?"],
  "Warehouse Manager": ["What inventory needs attention?", "Show FEFO recommendation", "Summarize GRN and batches"],
  "Sales Manager": ["Show team sales and collections", "Who needs follow-up?", "Can I approve discounts?"],
  "Sales Executive": ["Show my sales summary", "Which customers can I see?", "What collections need follow-up?"]
};

function createMessage(sender: AiChatMessage["sender"], content: string, sources?: string[]): AiChatMessage {
  return {
    id: `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender,
    content,
    sources,
    createdAt: new Date().toISOString()
  };
}

export default function FloatingAIChat() {
  const role = useEffectiveRole();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([
    createMessage(
      "assistant",
      `Hi. I am the Mipro ERP assistant. I answer using the latest proposal, Mipro workbook seed data and your current ${role} permissions.`
    )
  ]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => (await apiClient.aiChat(message, role)).data,
    onSuccess: (response) => {
      setMessages((items) => [...items, createMessage("assistant", response.answer, response.sources)]);
    },
    onError: (error) => {
      setMessages((items) => [
        ...items,
        createMessage("assistant", error instanceof Error ? error.message : "AI chat failed. Please try again.")
      ]);
    }
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = (event?: FormEvent) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || chatMutation.isPending) {
      return;
    }
    setInput("");
    setMessages((items) => [...items, createMessage("user", text)]);
    chatMutation.mutate(text);
  };

  const promptList = rolePrompts[role];

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      {open ? (
        <section
          className={clsx(
            "flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl",
            expanded ? "h-[min(760px,calc(100vh-32px))] w-[min(720px,calc(100vw-32px))]" : "h-[min(640px,calc(100vh-32px))] w-[min(430px,calc(100vw-32px))]"
          )}
          aria-label="Mipro AI Assistant"
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-950 px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold">Mipro AI Assistant</h2>
                  <p className="text-xs text-slate-300">Role-aware / {role}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="rounded-lg p-2 text-slate-300 hover:bg-white/10" type="button" onClick={() => setExpanded((value) => !value)} aria-label="Resize chat">
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button className="rounded-lg p-2 text-slate-300 hover:bg-white/10" type="button" onClick={() => setOpen(false)} aria-label="Close chat">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50 p-4">
              <div className="grid gap-3">
                {messages.map((message) => (
                  <div className={clsx("max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6", message.sender === "user" ? "ml-auto bg-teal-700 text-white" : "bg-white text-slate-700 shadow-sm")} key={message.id}>
                    <p>{message.content}</p>
                    {message.sources?.length ? (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {message.sources.map((source) => (
                          <span className="rounded-full bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-700" key={source}>
                            {source}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
                {chatMutation.isPending ? (
                  <div className="max-w-[92%] rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    Thinking with role permissions...
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white p-3">
              <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                {promptList.map((prompt) => (
                  <button
                    className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      setTimeout(() => {
                        setMessages((items) => [...items, createMessage("user", prompt)]);
                        chatMutation.mutate(prompt);
                        setInput("");
                      }, 0);
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form className="flex gap-2" onSubmit={send}>
                <input
                  className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about sales, stock, landed cost, dues, permissions..."
                />
                <Button type="submit" variant="primary" icon={<Send className="h-4 w-4" />} disabled={chatMutation.isPending}>
                  Send
                </Button>
              </form>
            </div>
          </div>
        </section>
      ) : (
        <button
          className="group relative grid h-14 w-14 place-items-center rounded-full bg-slate-950 text-white shadow-2xl transition hover:-translate-y-0.5 hover:bg-teal-800 sm:h-16 sm:w-16"
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant"
        >
          <span className="relative grid h-11 w-11 place-items-center rounded-full bg-teal-500">
            <Sparkles className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
          </span>
          <span className="pointer-events-none absolute bottom-full right-0 mb-3 hidden w-max rounded-xl bg-slate-950 px-3 py-2 text-left shadow-xl group-hover:block">
            <strong className="block text-sm">Ask Mipro AI</strong>
            <small className="block text-xs text-slate-300">{role} context</small>
          </span>
        </button>
      )}
    </div>
  );
}
