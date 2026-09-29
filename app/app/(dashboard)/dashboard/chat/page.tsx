"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bot, CheckCircle2, Droplets, Flame, Loader2, MessageSquare, PanelLeftOpen, Plus, Send, Sparkles, Utensils } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/lib/auth-client";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatPayload {
  conversations: ConversationSummary[];
  conversation: ConversationSummary | null;
  messages: { id: string; role: "user" | "agent" | "system"; message: string; createdAt: string }[];
}

function toChatMessage(message: ChatPayload["messages"][number]): ChatMessage {
  return {
    id: message.id,
    sender: message.role === "user" ? "user" : "ai",
    text: message.message,
    timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

function conversationDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function HealthChatPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [error, setError] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optimisticIdRef = useRef(0);

  const activeConversation = conversations.find(({ id }) => id === conversationId);

  const loadConversation = useCallback(async (id?: string) => {
    setIsLoadingConversation(true);
    setError(undefined);
    try {
      const query = id ? `?conversationId=${encodeURIComponent(id)}` : "";
      const response = await fetch(`/api/chat${query}`);
      const data = await response.json() as ChatPayload & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to load conversation");
      setConversations(data.conversations);
      setConversationId(data.conversation?.id);
      setMessages(data.messages.map(toChatMessage));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load conversation");
    } finally {
      setIsLoadingConversation(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/chat")
      .then(async (response) => {
        const data = await response.json() as ChatPayload & { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Unable to load conversation");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setConversations(data.conversations);
        setConversationId(data.conversation?.id);
        setMessages(data.messages.map(toChatMessage));
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Unable to load conversation");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingConversation(false);
      });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const startNewChat = () => {
    if (isTyping) return;
    setConversationId(undefined);
    setMessages([]);
    setInputText("");
    setError(undefined);
    setHistoryOpen(false);
  };

  const selectConversation = async (id: string) => {
    if (isTyping || id === conversationId) {
      setHistoryOpen(false);
      return;
    }
    setHistoryOpen(false);
    await loadConversation(id);
  };

  const starterPrompts = [
    { label: "Analyze my macros for today", icon: Utensils },
    { label: "High-protein snack under 200 kcal", icon: Flame },
    { label: "Plan my top priority tasks for tomorrow", icon: CheckCircle2 },
    { label: "Hydration tip for afternoon fatigue", icon: Droplets },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    optimisticIdRef.current += 1;
    const optimisticId = `optimistic-${optimisticIdRef.current}`;
    setMessages((current) => [...current, { id: optimisticId, sender: "user", text: text.trim(), timestamp: "Just now" }]);
    if (!textToSend) setInputText("");
    setIsTyping(true);
    setError(undefined);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text.trim(), conversationId }),
      });
      const data = await response.json() as {
        error?: string;
        conversation?: ConversationSummary;
        messages?: ChatPayload["messages"];
      };
      if (!response.ok) throw new Error(data.error ?? "Unable to send message");

      if (data.conversation) {
        setConversationId(data.conversation.id);
        setConversations((current) => [data.conversation!, ...current.filter(({ id }) => id !== data.conversation!.id)]);
      }

      const savedUser = data.messages?.find(({ role }) => role === "user");
      const savedAgent = data.messages?.find(({ role }) => role === "agent");
      setMessages((current) => {
        const reconciled = current.map((message) => message.id === optimisticId && savedUser ? toChatMessage(savedUser) : message);
        return savedAgent ? [...reconciled, toChatMessage(savedAgent)] : reconciled;
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send message");
    } finally {
      setIsTyping(false);
    }
  };

  const conversationList = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b p-3">
        <Button type="button" variant="outline" className="h-9 w-full justify-start gap-2" onClick={startNewChat} disabled={isTyping} data-testid="new-chat">
          <Plus className="size-4" /> New chat
        </Button>
      </div>
      <div className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Conversations</div>
      <ScrollArea className="min-h-0 flex-1 px-2 pb-3">
        <div className="space-y-1">
          {conversations.length === 0 && <p className="px-2 py-6 text-center text-xs text-muted-foreground">Your conversations will appear here.</p>}
          {conversations.map((item) => {
            const active = item.id === conversationId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => void selectConversation(item.id)}
                disabled={isTyping}
                data-conversation-id={item.id}
                className={`group flex w-full items-start gap-2 rounded-lg px-2.5 py-2.5 text-left transition-colors ${active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"}`}
              >
                <MessageSquare className={`mt-0.5 size-3.5 shrink-0 ${active ? "text-primary" : ""}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{item.title}</span>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">{conversationDate(item.updatedAt)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="AI Health & Habit Assistant" />
      <div className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 p-3 md:p-5">
        <div className="flex min-h-[620px] flex-1 overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <aside className="hidden w-64 shrink-0 border-r bg-muted/15 md:block">{conversationList}</aside>

          <section className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b px-3 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                  <SheetTrigger asChild>
                    <Button type="button" variant="outline" size="icon-lg" className="md:hidden" aria-label="Open conversations"><PanelLeftOpen /></Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[19rem] p-0" showCloseButton={false}>
                    <SheetHeader className="sr-only"><SheetTitle>Conversations</SheetTitle></SheetHeader>
                    {conversationList}
                  </SheetContent>
                </Sheet>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Bot className="size-4" /></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-semibold">{activeConversation?.title ?? "New conversation"}</h2>
                    <Badge variant="secondary" className="hidden text-[9px] font-mono sm:inline-flex">Uli AI</Badge>
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">Personalized nutrition, lifestyle, and task guidance</p>
                </div>
              </div>
              <div className="hidden items-center gap-1 text-xs text-muted-foreground lg:flex"><Sparkles className="size-3.5 text-primary" /><span>Health as a Service</span></div>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div className="mx-auto w-full max-w-4xl space-y-5 p-4 sm:p-6">
                {isLoadingConversation && <div className="flex min-h-64 items-center justify-center text-muted-foreground"><Loader2 className="size-5 animate-spin" /></div>}
                {!isLoadingConversation && messages.length === 0 && (
                  <div className="mx-auto flex min-h-72 max-w-lg flex-col items-center justify-center text-center">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Sparkles className="size-5" /></div>
                    <h3 className="text-lg font-semibold">How can I help today?</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Ask about nutrition, log a meal, or turn an idea into a task.</p>
                  </div>
                )}

                {!isLoadingConversation && messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 text-xs ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <Avatar className="size-7 shrink-0">
                      <AvatarFallback className={message.sender === "user" ? "bg-primary text-primary-foreground text-[10px]" : "bg-muted text-foreground text-[10px]"}>
                        {message.sender === "user" ? session?.user?.name?.slice(0, 1).toUpperCase() || "U" : <Bot className="size-3.5 text-primary" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[85%] space-y-1 rounded-xl p-3.5 sm:max-w-[75%] ${message.sender === "user" ? "rounded-tr-none bg-primary text-primary-foreground" : "rounded-tl-none border border-border/70 bg-muted/40 text-foreground whitespace-pre-line"}`}>
                      <p className="leading-relaxed">{message.text}</p>
                      <span className={`block text-right font-mono text-[9px] ${message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{message.timestamp}</span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 text-xs">
                    <Avatar className="size-7 shrink-0"><AvatarFallback className="bg-muted text-foreground text-[10px]"><Bot className="size-3.5 text-primary" /></AvatarFallback></Avatar>
                    <div className="flex items-center gap-2 rounded-xl rounded-tl-none border border-border/70 bg-muted/40 p-3 text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /><span>Thinking...</span></div>
                  </div>
                )}
                {error && <p className="text-center text-xs text-destructive">{error}</p>}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t bg-muted/15 p-3 sm:px-5">
              <div className="mx-auto max-w-4xl space-y-3">
                {messages.length === 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    {starterPrompts.map((prompt) => (
                      <button key={prompt.label} type="button" onClick={() => void handleSendMessage(prompt.label)} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-foreground transition-colors hover:bg-muted">
                        <prompt.icon className="size-3 text-primary" /><span>{prompt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                <form onSubmit={(event) => { event.preventDefault(); void handleSendMessage(); }} className="flex gap-2">
                  <Input placeholder="Message Uli..." value={inputText} onChange={(event) => setInputText(event.target.value)} disabled={isLoadingConversation} className="h-10 text-xs" />
                  <Button disabled={isTyping || isLoadingConversation} type="submit" size="lg" className="h-10 shrink-0 gap-1.5 px-4"><Send className="size-3.5" /><span className="hidden sm:inline">Send</span></Button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
