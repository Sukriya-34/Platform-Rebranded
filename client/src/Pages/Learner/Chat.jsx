import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, Send, User, Shield, BookOpen, Loader2 } from "lucide-react";
import { Card } from "../../components/DisplayComponents";

export default function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // 1. Load current user and initial contacts list
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) {
      navigate("/login");
      return;
    }
    setCurrentUser(user);

    const fetchContacts = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/chat/contacts/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setContacts(data);
          
          // Pre-select contact if passed via router state (e.g. from instructor portfolio)
          const routeState = location.state;
          if (routeState && routeState.selectContactId) {
            const preselected = data.find(c => c.id === routeState.selectContactId);
            if (preselected) {
              setSelectedContact(preselected);
            } else {
              // If not found in dynamic messages list, fetch details of this specific creator
              const creatorRes = await fetch(`http://localhost:5000/api/profile/${routeState.selectContactId}`);
              if (creatorRes.ok) {
                const creator = await creatorRes.json();
                setContacts(prev => [creator, ...prev]);
                setSelectedContact(creator);
              }
            }
          } else if (data.length > 0) {
            setSelectedContact(data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load contacts:", err);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchContacts();
  }, [location, navigate]);

  // 2. Fetch messages and poll for updates
  useEffect(() => {
    if (!currentUser || !selectedContact) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/chat/history/${currentUser.id}/${selectedContact.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [currentUser, selectedContact]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedContact || !currentUser) return;

    const payload = {
      senderId: currentUser.id,
      receiverId: selectedContact.id,
      message: typedMessage.trim()
    };

    try {
      const res = await fetch("http://localhost:5000/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages(prev => [...prev, newMessage]);
        setTypedMessage("");
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  if (loadingContacts) {
    return <div className="p-20 text-center animate-pulse text-lavender-grey">Loading Messenger...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-poppins text-ink-black min-h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-1 rounded-3xl border border-soft-linen bg-white overflow-hidden shadow-sm min-h-[550px]">
        
        {/* Left Side: Contact List */}
        <div className="w-80 border-r border-soft-linen flex flex-col bg-porcelain/10">
          <div className="p-6 border-b border-soft-linen bg-white">
            <h2 className="text-xl font-bold font-playfair flex items-center gap-2">
              <MessageSquare className="text-soft-periwinkle" size={20} /> Messages
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-soft-linen/50">
            {contacts.map((c) => {
              const isSelected = selectedContact?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  className={`w-full text-left p-4 flex items-center gap-4 transition-all ${
                    isSelected ? "bg-soft-periwinkle/5 border-l-4 border-soft-periwinkle" : "hover:bg-porcelain/50 border-l-4 border-transparent"
                  }`}
                >
                  <img
                    src={c.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150"}
                    alt={c.fullName}
                    className="w-11 h-11 rounded-full object-cover border border-soft-linen"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isSelected ? "text-soft-periwinkle" : "text-ink-black"}`}>{c.fullName}</p>
                    <span className="text-[10px] uppercase font-bold text-lavender-grey tracking-wider flex items-center gap-1 mt-0.5">
                      {c.role === "Admin" ? <Shield size={10} /> : <BookOpen size={10} />} {c.role}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Conversation Area */}
        {selectedContact ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Active Contact Header */}
            <div className="p-6 border-b border-soft-linen flex items-center gap-4 shadow-sm z-10">
              <img
                src={selectedContact.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150"}
                alt={selectedContact.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-sm leading-tight">{selectedContact.fullName}</p>
                <p className="text-[9px] uppercase tracking-wider font-bold text-lavender-grey">{selectedContact.role}</p>
              </div>
            </div>

            {/* Messages Log */}
            <div className="flex-1 overflow-y-auto p-6 bg-porcelain/10 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <MessageSquare size={36} className="text-lavender-grey mb-2" />
                  <p className="text-sm font-bold">Say hello to {selectedContact.fullName}!</p>
                  <p className="text-xs text-lavender-grey">Start the conversation below.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === currentUser.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fadeIn`}>
                      <div
                        className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? "bg-soft-periwinkle text-white rounded-tr-none"
                            : "bg-white text-ink-black rounded-tl-none border border-soft-linen"
                        }`}
                      >
                        <p>{m.message}</p>
                        <p className={`text-[8px] uppercase font-bold text-right mt-1.5 ${isMe ? "text-white/70" : "text-lavender-grey"}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-soft-linen bg-white flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.01)]">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder={`Write message to ${selectedContact.fullName}...`}
                className="flex-1 px-4 py-3 border border-soft-linen rounded-xl focus:outline-none focus:ring-2 focus:ring-soft-periwinkle/30 focus:border-soft-periwinkle text-sm"
              />
              <button
                type="submit"
                disabled={!typedMessage.trim()}
                className="bg-ink-black hover:bg-gray-800 disabled:opacity-50 text-white p-3.5 rounded-xl transition-all shadow-md shadow-black/10 flex items-center justify-center shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-porcelain/10 text-center text-lavender-grey p-8">
            <MessageSquare size={48} className="opacity-20 mb-3" />
            <p className="text-lg font-bold text-ink-black">Select a Chat</p>
            <p className="text-xs">Pick a contact from the left list to begin messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
}
