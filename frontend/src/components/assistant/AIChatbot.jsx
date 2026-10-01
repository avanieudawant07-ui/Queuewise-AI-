import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../api/client";
import { Bot, Send, X, Sparkles } from "lucide-react";

export function AIChatbot({ onOpenBookingModal }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `Hello! I am your QueueWise AI Assistant. How can I assist you with appointment bookings, changing your schedule, or priority waitlist updates today?`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
      const { data } = await apiClient.post("/ai-assistant/chat", {
        message: userMsg,
        role: user?.role || "PATIENT"
      });

      setMessages(prev => [...prev, { sender: "ai", text: data.reply }]);

      if (data.intent === "BOOK_APPOINTMENT" || data.intent === "RESCHEDULE_APPOINTMENT") {
        onOpenBookingModal?.();
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: "ai",
        text: "Sorry, I ran into an issue connecting to clinic services. Please try again or use the self-service buttons."
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-3.5 sm:p-4 rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-emerald-950 font-bold shadow-xl shadow-emerald-400/25 hover:scale-105 transition-all flex items-center space-x-3 border border-emerald-300"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-emerald-950" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-600 rounded-full border-2 border-white animate-ping" />
        </div>
        <div className="text-left font-bold text-xs pr-1 hidden sm:block">
          <div className="text-emerald-950">QueueWise AI Assistant</div>
          <div className="text-[10px] text-emerald-800 font-normal">Ask to book, reschedule, or query waitlist</div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] glass-panel border-[#E6DFD3] flex flex-col shadow-2xl overflow-hidden animate-pulse-subtle bg-white">
      
      {/* Chat Header */}
      <div className="p-4 bg-[#FFFDF9] border-b border-[#E6DFD3] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1">
              <span>QueueWise AI Assistant</span>
              <Sparkles className="w-3 h-3 text-emerald-600" />
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Communicative Clinic Operations</span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#FAF6EF] transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs bg-[#FAF6EF]">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl ${
                m.sender === "user"
                  ? "bg-emerald-400 text-emerald-950 font-medium rounded-tr-none shadow-sm"
                  : "bg-white text-slate-800 rounded-tl-none border border-[#E6DFD3] shadow-sm leading-relaxed"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-[#E6DFD3] text-slate-500 text-xs flex items-center space-x-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>QueueWise AI is processing...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-1.5 bg-[#FFFDF9] border-t border-[#EAE2D5] flex items-center space-x-1.5 overflow-x-auto text-[10px]">
        <button
          onClick={() => setInput("I'd like to book an appointment with Dr. Jenkins")}
          className="px-2.5 py-1 rounded-lg bg-[#FAF6EF] hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-[#E2DAD0] whitespace-nowrap"
        >
          Book Appointment
        </button>
        <button
          onClick={() => setInput("Can you reschedule my appointment to a later slot?")}
          className="px-2.5 py-1 rounded-lg bg-[#FAF6EF] hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-[#E2DAD0] whitespace-nowrap"
        >
          Reschedule Slot
        </button>
        <button
          onClick={() => setInput("What is my current priority waitlist score?")}
          className="px-2.5 py-1 rounded-lg bg-[#FAF6EF] hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-[#E2DAD0] whitespace-nowrap"
        >
          Check Waitlist
        </button>
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#E6DFD3] flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask to book, reschedule, or clinic questions..."
          className="flex-1 bg-[#FAF6EF] border border-[#DCD3C5] rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-emerald-950 font-bold border border-emerald-300 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
