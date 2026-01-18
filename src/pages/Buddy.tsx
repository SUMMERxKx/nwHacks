/**
 * Buddy: chat UI. Messages from buddyChat callable (OpenRouter). Memory Snapshot from mockData for display.
 * contextDays 7|30; quick prompts when empty; typing indicator while waiting.
 */
import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { mockMemorySnapshot, ChatMessage } from "@/lib/mockData";
import { buddyChat } from "@/lib/aiApi";
import { 
  Send, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const quickPrompts = [
  "Reflect on today",
  "Help me plan tomorrow",
  "What pattern do you notice?"
];

export default function Buddy() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [memoryExpanded, setMemoryExpanded] = useState(false);
  const [contextDays, setContextDays] = useState<7 | 30>(30);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const { content: reply } = await buddyChat({ message: content.trim(), contextDays });
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply || "I'm having a moment — try again in a bit.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having a moment — try again in a bit. Your check-ins are saved.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      <PageHeader
        title="Buddy"
        subtitle={
          <Sheet>
            <SheetTrigger asChild>
              <button className="chip chip-primary text-xs cursor-pointer">
                <Brain className="w-3 h-3" />
                Using last {contextDays} days
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle className="font-serif">Context Window</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  How much history should Buddy use to personalize responses?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant={contextDays === 7 ? "default" : "outline"}
                    onClick={() => setContextDays(7)}
                    className="flex-1"
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant={contextDays === 30 ? "default" : "outline"}
                    onClick={() => setContextDays(30)}
                    className="flex-1"
                  >
                    Last 30 days
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        }
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <div className="flex flex-col h-[calc(100vh-180px)]">
        {/* Memory Snapshot */}
        <div className="card-elevated mb-4 overflow-hidden">
          <button
            onClick={() => setMemoryExpanded(!memoryExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Memory Snapshot</span>
            </div>
            {memoryExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          
          {memoryExpanded && (
            <div className="px-4 pb-4 space-y-3 animate-fade-in border-t border-border pt-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Common stressors</p>
                <div className="flex flex-wrap gap-1.5">
                  {mockMemorySnapshot.commonStressors.map((s, i) => (
                    <Chip key={i} variant="muted" size="sm">{s}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Restores energy</p>
                <div className="flex flex-wrap gap-1.5">
                  {mockMemorySnapshot.restoresEnergy.map((s, i) => (
                    <Chip key={i} variant="success" size="sm">{s}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Peak productivity</p>
                <p className="text-sm">{mockMemorySnapshot.peakProductivity}</p>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hey there!</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                I'm your Buddy. I'll learn from your check-ins to give you personalized insights.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex animate-fade-in",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-1.5 opacity-70",
                    message.role === 'user' ? "text-right" : "text-left"
                  )}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-gentle" />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-gentle" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-gentle" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pb-3">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="chip chip-muted hover:bg-muted/80 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 bg-muted/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(inputValue);
              }
            }}
          />
          <Button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
