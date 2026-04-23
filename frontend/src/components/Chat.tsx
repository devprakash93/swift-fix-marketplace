import { useEffect, useRef, useState } from "react";
import { Send, User as UserIcon } from "lucide-react";
import { socket } from "@/services/socket";
import { useApp } from "@/context/AppContext";
import { BookingService } from "@/services/api";

export function Chat({ jobId }: { jobId: string }) {
  const { user } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load historical messages
    const fetchMessages = async () => {
      try {
        const data = await BookingService.getMessages(jobId);
        setMessages(data);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };
    fetchMessages();

    // Listen for new messages
    const handleNewMessage = (msg: any) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [jobId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    socket.emit("sendMessage", {
      jobId,
      senderId: user.id,
      content: input,
    });
    
    // Optimistic UI update
    const newMsg = {
      _id: Date.now().toString(),
      content: input,
      sender: { _id: user.id, name: user.name, avatar: (user as any).avatar },
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div className="flex flex-col h-[500px] rounded-[2.5rem] border border-border glass overflow-hidden shadow-[var(--shadow-card)]">
      <div className="p-6 border-b border-border/50 bg-card/50">
        <h3 className="font-black text-lg">Job Messages</h3>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">End-to-End Encrypted</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground animate-in fade-in">
            <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-bold">No messages yet.</p>
            <p className="text-xs">Start the conversation below.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender?._id === user?.id || msg.sender === user?.id;
            return (
              <div 
                key={msg._id || i} 
                className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                <img 
                  src={msg.sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.name || 'User'}`} 
                  className="w-8 h-8 rounded-full bg-secondary shrink-0 mt-auto"
                />
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div className={`px-5 py-3 rounded-2xl text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-foreground rounded-bl-sm'}`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-card/50 border-t border-border/50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-2xl border-none bg-secondary/50 px-5 py-4 text-sm outline-none transition-colors focus:bg-secondary"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

// Simple icon for empty state
function MessageCircle(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}
