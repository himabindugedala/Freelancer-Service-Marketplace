import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Send,
  Paperclip,
  Smile,
  Search,
  MessageSquare,
  CheckCircle2,
  Clock,
  User as UserIcon,
  Circle,
} from 'lucide-react';
import { chatApi, uploadApi } from '../../services/api';
import type { Conversation, Message, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const location = useLocation();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  const loadConversations = async (targetId?: string) => {
    setIsLoadingConversations(true);
    try {
      const res = await chatApi.getConversations();
      if (res.success && res.data) {
        setConversations(res.data);

        // Select initial conversation
        if (targetId) {
          const matched = res.data.find((c) => c._id === targetId);
          if (matched) setActiveConversation(matched);
        } else if (res.data.length > 0 && !activeConversation) {
          setActiveConversation(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  useEffect(() => {
    const passedConvId = location.state?.conversationId;
    loadConversations(passedConvId);
  }, [location.state?.conversationId]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await chatApi.getMessages(activeConversation._id);
        if (res.success) {
          setMessages(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();

    // Join Socket conversation room
    if (socket) {
      socket.emit('join_conversation', activeConversation._id);
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', activeConversation._id);
      }
    };
  }, [activeConversation?._id, socket]);

  // Listen to incoming messages via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMsg: Message) => {
      if (activeConversation && newMsg.conversation === activeConversation._id) {
        setMessages((prev) => [...prev, newMsg]);
      }

      // Update last message preview in conversations list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === newMsg.conversation
            ? {
                ...c,
                lastMessage: newMsg.text || 'Sent an attachment',
                lastMessageAt: new Date().toISOString(),
              }
            : c
        )
      );
    };

    const handleUserTyping = ({ isTyping }: { isTyping: boolean }) => {
      setPartnerTyping(isTyping);
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, activeConversation?._id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || (!inputText.trim() && !isUploading)) return;

    const msgPayload = {
      conversationId: activeConversation._id,
      text: inputText.trim(),
    };

    if (socket && isConnected) {
      socket.emit('send_message', msgPayload, (response: any) => {
        if (response.success && response.message) {
          // Message dispatched through socket
        }
      });
      setInputText('');
    } else {
      // Fallback
      setInputText('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;

    setIsUploading(true);
    try {
      const res = await uploadApi.uploadSingle(file);
      if (res.success && res.data) {
        if (socket) {
          socket.emit('send_message', {
            conversationId: activeConversation._id,
            text: `Sent a file: ${res.data.originalName}`,
            attachments: [
              {
                name: res.data.originalName,
                url: res.data.url,
                size: res.data.size,
                fileType: res.data.mimetype || 'application/octet-stream',
              },
            ],
          });
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const otherUser = activeConversation?.otherParticipant;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden h-[75vh] flex">
        {/* Left Conversations Sidebar */}
        <aside className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-2">Direct Messages</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoadingConversations ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active conversations. Contact a freelancer or client to start chatting!
              </div>
            ) : (
              conversations.map((conv) => {
                const partner = conv.otherParticipant;
                const isSelected = activeConversation?._id === conv._id;

                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <img
                      src={
                        partner?.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          partner?.name || 'U'
                        )}`
                      }
                      alt={partner?.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {partner?.name || 'User'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{conv.lastMessage || 'Started conversation'}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Active Message Thread */}
        <div className="flex-1 flex flex-col bg-white">
          {activeConversation && otherUser ? (
            <>
              {/* Active Chat Header */}
              <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white z-10 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        otherUser.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          otherUser.name
                        )}`
                      }
                      alt={otherUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{otherUser.name}</h3>
                    <p className="text-[11px] text-slate-500 capitalize">{otherUser.role} Account</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                    Live Socket.IO Active
                  </span>
                </div>
              </div>

              {/* Message List Stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                {isLoadingMessages ? (
                  <LoadingSpinner message="Loading messages..." />
                ) : messages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-12">
                    Start the conversation! Messages are securely encrypted and delivered in real-time.
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender?._id === user?._id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex gap-3 max-w-lg ${isMine ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        <img
                          src={
                            msg.sender?.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              msg.sender?.name || 'U'
                            )}`
                          }
                          alt={msg.sender?.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 mt-1 flex-shrink-0"
                        />

                        <div className="space-y-1">
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isMine
                                ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                                : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none shadow-xs'
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.text}</p>

                            {/* Attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {msg.attachments.map((att, i) => (
                                  <a
                                    key={i}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 p-2 rounded-lg text-[11px] underline ${
                                      isMine ? 'text-indigo-100 hover:text-white' : 'text-indigo-600'
                                    }`}
                                  >
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span>{att.name}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>

                          <span
                            className={`text-[10px] text-slate-400 block px-1 ${
                              isMine ? 'text-right' : 'text-left'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                {partnerTyping && (
                  <p className="text-[11px] text-slate-400 italic animate-pulse">
                    {otherUser.name} is typing...
                  </p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
                <label className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
                  <Paperclip className="w-5 h-5" />
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>

                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <Button type="submit" variant="primary" disabled={!inputText.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <MessageSquare className="w-12 h-12 stroke-[1.2] mb-3 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">Select a conversation</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Pick a thread from the left or initiate a chat from any service or freelancer profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
