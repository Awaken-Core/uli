"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Utensils,
  CheckCircle2,
  Flame,
  Droplets,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/lib/auth-client";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function HealthChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am your Uli Health & Habit Assistant. I can analyze your daily calorie balance, suggest high-protein meals, review your scheduled tasks, and guide your routine. How can I help you today?",
      timestamp: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const starterPrompts = [
    { label: "Analyze my macros for today", icon: Utensils },
    { label: "High-protein snack under 200 kcal", icon: Flame },
    { label: "Plan my top priority tasks for tomorrow", icon: CheckCircle2 },
    { label: "Hydration tip for afternoon fatigue", icon: Droplets },
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: text.trim(),
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    // Contextual AI simulation response
    setTimeout(() => {
      let responseText =
        "Great question! Based on your target goals, maintaining a consistent balance of lean proteins and complex carbohydrates will keep your energy stable. Let me know if you want to log any specific foods or adjust your schedule.";

      const lower = text.toLowerCase();
      if (lower.includes("macro") || lower.includes("nutrition")) {
        responseText =
          "Looking at your profile: A standard split of 30% Protein, 45% Carbohydrates, and 25% Healthy Fats matches your energy demand. For a 2,000 kcal target, aim for 150g Protein, 225g Carbs, and 55g Fat. You can track this in real-time under Nutrition & Diet!";
      } else if (lower.includes("snack") || lower.includes("protein")) {
        responseText =
          "Here are 3 quick high-protein snacks under 200 kcal:\n1. 150g Non-fat Greek Yogurt with blueberries (130 kcal, 17g Protein)\n2. 2 Hard-boiled Eggs with sea salt & pepper (140 kcal, 12g Protein)\n3. 1 scoop Whey Protein with unsweetened almond milk (140 kcal, 24g Protein)";
      } else if (lower.includes("task") || lower.includes("schedule") || lower.includes("priority")) {
        responseText =
          "To optimize productivity: Focus on your 1-2 'Urgent' or 'High' tasks first during your morning peak focus window (9am-12pm). Schedule 30-minute blocks with explicit estimates, which you can set directly in your Tasks & Planner tab!";
      } else if (lower.includes("water") || lower.includes("hydration")) {
        responseText =
          "Aim for at least 2,500ml daily. Afternoon fatigue is frequently caused by mild dehydration. Drink a 500ml glass now with electrolytes or a pinch of mineral salt for immediate alertness!";
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: responseText,
        timestamp: "Just now",
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="AI Health & Habit Assistant" />

      <div className="flex-1 flex flex-col p-4 md:p-8 pt-4 max-w-5xl mx-auto w-full min-h-0">
        {/* Top Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Bot className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                <span>Uli Assistant</span>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  GPT-4o Ready
                </Badge>
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Personalized dietary, lifestyle, and task optimization guidance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            <span>Health as a Service (HaaS)</span>
          </div>
        </div>

        {/* Chat History Box */}
        <Card className="flex-1 flex flex-col min-h-0 border-border/80 bg-card overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="size-7 shrink-0">
                  {msg.sender === "user" ? (
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                      {session?.user?.name?.slice(0, 1).toUpperCase() || "U"}
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-muted text-foreground text-[10px]">
                      <Bot className="size-3.5 text-primary" />
                    </AvatarFallback>
                  )}
                </Avatar>

                <div
                  className={`rounded-xl p-3.5 max-w-[85%] sm:max-w-[75%] space-y-1 ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted/40 border border-border/70 text-foreground rounded-tl-none whitespace-pre-line"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span
                    className={`text-[9px] block text-right font-mono ${
                      msg.sender === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 text-xs">
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback className="bg-muted text-foreground text-[10px]">
                    <Bot className="size-3.5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted/40 border border-border/70 rounded-xl rounded-tl-none p-3 text-muted-foreground flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Quick Prompts & Input Area */}
          <div className="border-t p-3 bg-muted/20 space-y-3 shrink-0">
            {/* Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt.label}
                  type="button"
                  onClick={() => handleSendMessage(prompt.label)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-border bg-background hover:bg-muted text-foreground transition-colors shrink-0"
                >
                  <prompt.icon className="size-3 text-primary" />
                  <span>{prompt.label}</span>
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask about meal planning, macro balance, or task routines..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" className="h-9 px-3 shrink-0 gap-1">
                <Send className="size-3.5" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}