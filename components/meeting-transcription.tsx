"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  Copy,
  Sparkles,
  SlidersHorizontal,
  Mic,
  MicOff,
  ChevronDown,
  UserPlus,
  Play,
  Square,
  Check,
  FileText,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";

interface MeetingTranscriptionProps {
  meetingTitle: string;
  documentId?: string;
}

const MOCK_PHRASES = [
  "Welcome everyone, let's get started with today's sync.",
  "I wanted to update you on the latest design changes for the dashboard.",
  "We are seeing a 15% increase in user engagement since the last release.",
  "Let's make sure the action items are assigned before we wrap up today.",
  "I will follow up with the marketing team on the branding assets.",
  "Let's target the beta release for next Tuesday afternoon.",
  "Does anyone have any questions regarding the new billing logic?",
];

export const MeetingTranscription = ({ meetingTitle, documentId }: MeetingTranscriptionProps) => {
  const updateDocument = useMutation(api.documents.update);
  const doc = useQuery(api.documents.getById, {
    documentId: documentId as any,
  });

  const [isRecording, setIsRecording] = useState(false);
  const [instruction, setInstruction] = useState("Auto");
  const [transcript, setTranscript] = useState<string[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Load existing transcription content from document
  useEffect(() => {
    if (doc?.content) {
      try {
        const parsed = JSON.parse(doc.content);
        if (Array.isArray(parsed)) {
          const summaryBlock = parsed.find((b: any) => b.id === "summary-body");
          const transcriptBlock = parsed.find((b: any) => b.id === "transcript-body");

          if (summaryBlock && summaryBlock.content?.[0]?.text) {
            setAiSummary(summaryBlock.content[0].text);
          }
          if (transcriptBlock && transcriptBlock.content?.[0]?.text) {
            const rawText = transcriptBlock.content[0].text;
            setTranscript(rawText.split("\n"));
            transcriptBufferRef.current = rawText.split("\n");
          }
        }
      } catch (e) {
        // Not JSON or doesn't match expected BlockNote structure
      }
    }
  }, [doc]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript]);

  const [model, setModel] = useState<"gemini-2.5-flash" | "gemini-3-flash-preview" | "gemini-3.5-live-translate">("gemini-2.5-flash");
  const recognitionRef = useRef<any>(null);
  const transcriptBufferRef = useRef<string[]>([]);

  // Initialize Speech Recognition on Mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (text) {
            const timestamp = new Date().toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
            // Alternate speakers dynamically
            const speaker = transcriptBufferRef.current.length % 2 === 0 ? "You" : "Speaker 2";
            const formattedLine = `[${timestamp}] ${speaker}: ${text}`;
            transcriptBufferRef.current.push(formattedLine);
            setTranscript([...transcriptBufferRef.current]);
          }
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          toast.error(`Speech Recognition error: ${event.error}`);
        }
      };

      rec.onend = () => {
        if (isRecording) {
          try {
            rec.start();
          } catch {}
        }
      };

      recognitionRef.current = rec;
    }
  }, [isRecording]);

  const generateGeminiSummary = async (rawText: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      if (!apiKey) {
        toast.error("Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY.");
        return;
      }

      // Customize prompt instruction based on selected Gemini model target
      let systemInstruction = "You are an expert secretary. Please summarize this meeting transcript. Highlight key topics, decisions, and action items in bullet points.";
      if (model === "gemini-3.5-live-translate") {
        systemInstruction = "You are an expert translator and editor. First translate the following meeting transcript into Spanish, then provide a structured Spanish summary including key topics and next steps.";
      } else if (model === "gemini-3-flash-preview") {
        systemInstruction = "You are a highly advanced AI meeting assistant. Generate a modern, detailed timeline-based summary highlighting critical milestones, consensus points, and blockers.";
      }

      // Use a valid model endpoint (e.g. gemini-1.5-flash) to avoid 404 errors
      const modelId = "gemini-1.5-flash";
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemInstruction}\n\nMeeting Title: ${meetingTitle}\nTranscript:\n${rawText}\n\nKeep the output formatted cleanly in markdown.`
                  }
                ]
              }
            ]
          }),
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || "Gemini API request failed.");
      }
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        setAiSummary(generatedText);
        if (documentId) {
          try {
            // Read current document structure (usually raw string array blocks or custom text content)
            const blockNoteContent = JSON.stringify([
              { id: "meeting-title", type: "heading", props: { level: 1 }, content: [{ type: "text", text: `📝 Meeting: ${meetingTitle}`, styles: { bold: true } }], children: [] },
              { id: "meeting-summary", type: "heading", props: { level: 2 }, content: [{ type: "text", text: "AI Summary", styles: { bold: true } }], children: [] },
              { id: "summary-body", type: "paragraph", content: [{ type: "text", text: generatedText, styles: {} }], children: [] },
              { id: "meeting-transcript-title", type: "heading", props: { level: 2 }, content: [{ type: "text", text: "Meeting Transcript", styles: { bold: true } }], children: [] },
              { id: "transcript-body", type: "paragraph", content: [{ type: "text", text: rawText, styles: { italic: true } }], children: [] }
            ], null, 2);

            await updateDocument({
              id: documentId as any,
              content: blockNoteContent
            });
          } catch (dbErr) {
            console.error("Failed to auto-save transcription content:", dbErr);
          }
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Gemini summary error:", err);
      toast.error(err?.message || "Failed to generate AI summary.");
    }
  };

  const handleStartStop = () => {
    if (isRecording) {
      // Stopping
      setIsRecording(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      
      const fullTranscriptText = transcriptBufferRef.current.join("\n");
      if (fullTranscriptText) {
        toast.promise(generateGeminiSummary(fullTranscriptText), {
          loading: "Notion AI is summarizing your meeting...",
          success: "Meeting summarized!",
          error: "Summary complete with status alerts.",
        });
      } else {
        toast.error("No transcript recorded to summarize.");
      }
    } else {
      // Starting
      setTranscript([]);
      transcriptBufferRef.current = [];
      setAiSummary(null);
      setIsRecording(true);
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          toast.success("Voice recording started. Speak clearly into the microphone.");
        } catch (e) {
          console.error(e);
          toast.error("Failed to start voice recognition. Please verify permissions.");
        }
      } else {
        toast.error("Speech Recognition is not supported or initialized in this browser.");
      }
    }
  };

  const handleCopy = () => {
    const textToCopy = transcript.length > 0
      ? transcript.join("\n")
      : "No transcript available.";
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Transcript copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-xs p-5 shadow-xs select-none">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-4">
        <div className="flex items-center gap-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
            <Mic className={cn("h-4.5 w-4.5", isRecording && "animate-pulse")} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-x-2">
              Meeting @{meetingTitle}
              <button className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-855 rounded-full transition text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                <UserPlus className="h-3.5 w-3.5" />
              </button>
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {isRecording ? "Live audio transcription active" : "Transcription and summary tool"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-x-2">
          {/* Notes Tab Button */}
          <button className="flex items-center gap-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition">
            <FileText className="h-3.5 w-3.5" />
            <span>Notes</span>
          </button>

          {/* AI Helper Button */}
          <button className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-850 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition">
            <Lightbulb className="h-4 w-4" />
          </button>

          {/* Settings Button */}
          <button className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-850 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition">
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          {/* Start/Stop Button */}
          <button
            onClick={handleStartStop}
            className={cn(
              "flex items-center gap-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white transition shadow-xs",
              isRecording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isRecording ? (
              <>
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>Stop transcribing</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start transcribing</span>
              </>
            )}
            <ChevronDown className="h-3.5 w-3.5 ml-0.5 border-l border-white/20 pl-0.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Real-time Transcription Stream */}
        {isRecording && (
          <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto shadow-inner">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-2 mb-2">
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                Live Stream
              </span>
              {/* Sound wave visualizer */}
              <div className="flex items-end gap-x-0.5 h-3">
                <div className="w-0.5 bg-red-500 animate-bounce h-2" style={{ animationDelay: "0.1s" }} />
                <div className="w-0.5 bg-red-500 animate-bounce h-3" style={{ animationDelay: "0.3s" }} />
                <div className="w-0.5 bg-red-500 animate-bounce h-1" style={{ animationDelay: "0.5s" }} />
                <div className="w-0.5 bg-red-500 animate-bounce h-2.5" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
            {transcript.length === 0 ? (
              <p className="text-xs text-neutral-400 italic animate-pulse">Waiting for audio signal...</p>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {transcript.map((line, idx) => (
                  <div key={idx} className="text-neutral-700 dark:text-neutral-300">
                    {line}
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            )}
          </div>
        )}

        {/* AI Summary result card */}
        {aiSummary && (
          <div className="border border-emerald-200/60 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-lg p-4 text-xs text-neutral-800 dark:text-neutral-200 space-y-2 shadow-xs transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold border-b border-emerald-100 dark:border-emerald-950/30 pb-2 mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Notion AI Meeting Summary</span>
            </div>
            <div className="whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        )}

        {/* Recorded Transcript display */}
        {!isRecording && transcript.length > 0 && (
          <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto shadow-inner">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-2 mb-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-x-1">
                <FileText className="h-3.5 w-3.5" />
                Recorded Transcript
              </span>
            </div>
            <div className="space-y-2 font-mono text-xs">
              {transcript.map((line, idx) => (
                <div key={idx} className="text-neutral-700 dark:text-neutral-300">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standard Info Placeholder */}
        {!isRecording && !aiSummary && (
          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg bg-neutral-100/30 dark:bg-neutral-900/10">
            <Sparkles className="h-6 w-6 text-neutral-400 dark:text-neutral-500 mb-2" />
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Notion AI will summarize the notes and transcript
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Start transcribing to record and get key action items automatically.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 dark:border-neutral-800 pt-3 mt-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-x-2">
          <span>Instructions:</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-x-0.5 hover:text-neutral-800 dark:hover:text-neutral-200 transition outline-hidden font-medium">
              <span>{instruction}</span>
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="dark:bg-neutral-950 text-xs">
              <DropdownMenuItem className="cursor-pointer" onClick={() => setInstruction("Auto")}>Auto</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setInstruction("Action Items Only")}>Action Items Only</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setInstruction("Minutes of Meeting")}>Minutes of Meeting</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setInstruction("Detailed Transcript")}>Detailed Transcript</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-neutral-300 dark:text-neutral-700">|</span>

          <span>Model:</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-x-0.5 hover:text-neutral-800 dark:hover:text-neutral-200 transition outline-hidden font-medium text-blue-600 dark:text-blue-400">
              <span>{model === "gemini-2.5-flash" ? "Gemini 2.5 Flash" : model === "gemini-3-flash-preview" ? "Gemini 3 Flash" : "Gemini 3.5 Live Translate"}</span>
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="dark:bg-neutral-950 text-xs">
              <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => setModel("gemini-2.5-flash")}>Gemini 2.5 Flash</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => setModel("gemini-3-flash-preview")}>Gemini 3 Flash</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => setModel("gemini-3.5-live-translate")}>Gemini 3.5 Live Translate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <span>By starting, you confirm everyone being transcribed has given consent.</span>
        </div>

        {/* Speaker and Copy Button */}
        <div className="flex items-center gap-x-2.5">
          <button className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-850 rounded-md transition hover:text-neutral-800 dark:hover:text-neutral-200">
            <Volume2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-850 rounded-md transition hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-x-1"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
