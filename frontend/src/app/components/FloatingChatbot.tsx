import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Stethoscope, Send, X, Lock, AlertCircle, HeadphonesIcon, Minus, Maximize2, Minimize2, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router';
import { sendChatMessage, checkAPIHealth, getAllMedicinesFromAPI } from '../services/chatbotAPI';
import type { ChatMessage, AllergyWarning } from '../types/chatbot';
import { useAuth } from '../context/AuthContext';
import { useMedicines } from '../context/MedicinesContext';
import { useCart } from '../context/CartContext';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

const socket_url = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface FloatingChatbotProps {
  isAuthenticated?: boolean;
}

const QUICK_REPLIES = [
  'Apa obat untuk demam?',
  'Bagaimana dosis anak pilek?',
  'Ada suplemen terbaik?',
  'Efek samping paracetamol?',
  'Obat mag yang aman?',
];

export default function FloatingChatbot({ isAuthenticated = false }: FloatingChatbotProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDisclaimerVisible, setIsDisclaimerVisible] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'ai' | 'admin'>('ai');
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [lastSentTime, setLastSentTime] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { medicines: contextMedicines } = useMedicines();
  const { addToCart } = useCart();
  const socketRef = useRef<Socket | null>(null);

  // Store quick suggestions from backend
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>(QUICK_REPLIES);

  // Allergy screening flow states
  const [allergiesConfirmed, setAllergiesConfirmed] = useState(false);
  const [userAllergies, setUserAllergies] = useState<string[]>([]);
  const [showAllergyPrompt, setShowAllergyPrompt] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'bot',
      message: 'Halo! Selamat datang di Apotek Sehat Delanggu 👋\n\nSaya siap membantu Anda menemukan obat yang sesuai secara aman. Ceritakan keluhan Anda, dan saya akan memberikan rekomendasi terbaik.\n\n⚠️ Catatan: Rekomendasi ini bukan pengganti konsultasi dokter atau apoteker.',
      timestamp: new Date()
    }
  ]);

  // Check API health on mount and when chat is opened
  useEffect(() => {
    const checkConnection = async () => {
      const isHealthy = await checkAPIHealth();
      setApiConnected(isHealthy);
    };
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isLoading]);

  // Socket.IO Connection for Live Chat
  useEffect(() => {
    if (chatMode === 'admin' && isAuthenticated && user) {
      if (!socketRef.current) {
        socketRef.current = io(socket_url, { transports: ['websocket', 'polling'] });
        
        socketRef.current.on('connect', () => {
          console.log('Connected to Live Chat server');
          socketRef.current?.emit('join_room', { room: String(user.id), role: 'user' });
        });

        socketRef.current.on('receive_message', (payload: any) => {
          if (payload.sender === 'admin') {
            setChatMessages(prev => [
              ...prev,
              {
                id: Date.now(),
                sender: 'bot',
                message: payload.message,
                timestamp: new Date(payload.timestamp || Date.now())
              }
            ]);
          }
        });
      }
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [chatMode, isAuthenticated, user]);

  const handleAllergyChoice = async (choice: 'no' | 'yes', customAllergen?: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setShowAllergyPrompt(false);
    setAllergiesConfirmed(true);

    let activeAllergies = userAllergies;

    if (choice === 'no') {
      const confirmMsg: ChatMessage = {
        id: Date.now(),
        sender: 'user',
        message: '❌ Tidak ada riwayat alergi obat',
        timestamp: new Date()
      };
      const botAck: ChatMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        message: 'Baik Kak, terima kasih konfirmasinya. Memproses rekomendasi obat yang aman untuk Anda...',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, confirmMsg, botAck]);
    } else {
      const allergenText = customAllergen || 'Alergi Obat';
      activeAllergies = Array.from(new Set([...userAllergies, allergenText.toLowerCase().replace(/^(saya|ada|alergi)\s+/, '').trim()]));
      setUserAllergies(activeAllergies);

      const confirmMsg: ChatMessage = {
        id: Date.now(),
        sender: 'user',
        message: `⚠️ Ada alergi: ${allergenText}`,
        timestamp: new Date()
      };
      const botAck: ChatMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        message: `Baik Kak, catatan alergi **"${allergenText}"** telah disimpan. Saya akan memilihkan rekomendasi obat yang aman dan bebas dari bahan tersebut.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, confirmMsg, botAck]);
    }

    // Now execute the pending query if exists
    const queryToExecute = pendingQuery || 'Rekomendasi obat yang aman';
    try {
      // Build history (last 4 messages)
      const recentHistory = chatMessages.slice(-4).map(m => ({
        role: m.sender === 'bot' ? 'assistant' : 'user',
        content: m.message
      }));
      
      const result = await sendChatMessage(queryToExecute, contextMedicines, activeAllergies, recentHistory);
      const botMessage: ChatMessage = {
        id: Date.now() + 2,
        sender: 'bot',
        message: result.response,
        timestamp: new Date(),
        recommendations: result.medicines || [],
        allergyWarnings: result.allergyWarnings,
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: Date.now() + 2,
        sender: 'bot',
        message: '⚠️ Maaf, terjadi kesalahan saat memproses rekomendasi. Silakan coba lagi.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setPendingQuery(null);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const now = Date.now();
    if (now - lastSentTime < 500) return;
    setLastSentTime(now);

    const userMsg = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    const newUserMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      message: userMsg,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newUserMessage]);

    try {
      if (chatMode === 'admin') {
        if (socketRef.current?.connected) {
          socketRef.current.emit('user_message', {
            room: String(user?.id),
            message: userMsg,
            sender: String(user?.name),
          });
          const botReply: ChatMessage = {
            id: Date.now() + 1,
            sender: 'bot',
            message: 'Pesan Anda telah dikirim ke Apoteker. Silakan tunggu balasan...',
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, botReply]);
        }
      } else {
        // Check if currently waiting for allergy response
        if (showAllergyPrompt) {
          const lower = userMsg.toLowerCase();
          if (lower.includes('tidak') || lower.includes('nggak') || lower.includes('gak') || lower.includes('bebas')) {
            await handleAllergyChoice('no');
            return;
          } else {
            await handleAllergyChoice('yes', userMsg);
            return;
          }
        }

        // Trigger allergy prompt on first consultation query
        const isGreetingOnly = ['halo', 'hai', 'pagi', 'siang', 'sore', 'malam', 'tes', 'test', 'permisi'].includes(userMsg.toLowerCase());
        if (!allergiesConfirmed && !isGreetingOnly && userAllergies.length === 0) {
          setPendingQuery(userMsg);
          setShowAllergyPrompt(true);
          const allergyPromptMsg: ChatMessage = {
            id: Date.now() + 1,
            sender: 'bot',
            message: 'Sebelum saya memberikan rekomendasi obat yang aman dan tepat, **apakah Kakak/Bapak/Ibu memiliki riwayat alergi obat tertentu?**',
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, allergyPromptMsg]);
          setIsLoading(false);
          return;
        }

        // Build history (last 4 messages)
        const recentHistory = chatMessages.slice(-4).map(m => ({
          role: m.sender === 'bot' ? 'assistant' : 'user',
          content: m.message
        }));

        // Direct AI Chat Call
        const result = await sendChatMessage(userMsg, contextMedicines, userAllergies, recentHistory);

        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          message: result.response,
          timestamp: new Date(),
          recommendations: result.medicines || [],
          allergyWarnings: result.allergyWarnings,
        };
        setChatMessages(prev => [...prev, botMessage]);

        if (result.apiError) {
          setApiConnected(false);
        }
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        message: '⚠️ Maaf, terjadi masalah. Silakan coba lagi nanti atau hubungi apoteker kami.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      setApiConnected(false);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleQuickReply = (text: string) => {
    setInputMessage(text);
  };

  const getWarningForMedicine = (medicineId: number, warnings?: AllergyWarning[]): AllergyWarning | undefined => {
    return warnings?.find(w => w.medicineId === medicineId);
  };

  if (!isOpen) {
    return (
      <button
        data-chatbot
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-300 hover:scale-110 transition-all z-50 group"
        title="Konsultasi Apotek Sehat"
      >
        <Stethoscope className="h-7 w-7" />
        <span className="absolute -top-1 -right-1 bg-emerald-400 border-2 border-white rounded-full h-3.5 w-3.5 animate-pulse" />
      </button>
    );
  }

  return (
    <div className={`fixed z-[100] transition-all ${
      isFullScreen 
        ? 'inset-0 p-4 bg-black/40 backdrop-blur-sm flex items-center justify-center'
        : isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-96'
    }`}>
      <Card className={`shadow-2xl border-2 border-emerald-200 overflow-hidden flex flex-col ${
        isFullScreen ? 'w-full max-w-3xl h-[90vh] mx-auto' : ''
      }`}>
        <CardHeader className={`${chatMode === 'ai' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'} text-white rounded-t-lg p-4 transition-colors shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                {chatMode === 'ai' ? <Stethoscope className="h-5 w-5" /> : <HeadphonesIcon className="h-5 w-5" />}
              </div>
              <div>
                <CardTitle className="text-base">{chatMode === 'ai' ? 'Asisten Apotek Sehat' : 'Live Chat Apoteker'}</CardTitle>
                <CardDescription className={`${chatMode === 'ai' ? 'text-emerald-50' : 'text-blue-50'} text-xs flex items-center gap-1`}>
                  {isAuthenticated ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 inline-block" />
                      Siap membantu Anda
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 inline-block" />
                      Siap membantu Anda
                    </>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {/* — Minimize */}
              <button
                onClick={() => { setIsMinimized(true); setIsFullScreen(false); }}
                aria-label="Minimize"
                className="h-8 w-8 flex items-center justify-center text-white hover:bg-white/20 rounded transition-colors"
              ><Minus className="h-4 w-4" /></button>
              {/* □ Fullscreen / Restore */}
              <button
                onClick={() => { setIsFullScreen(!isFullScreen); setIsMinimized(false); }}
                aria-label={isFullScreen ? 'Restore' : 'Fullscreen'}
                className="h-8 w-8 flex items-center justify-center text-white hover:bg-white/20 rounded transition-colors"
              >
                {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              {/* × Close */}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Tutup"
                className="h-8 w-8 flex items-center justify-center text-white hover:bg-white/20 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col flex-1 min-h-0">
            {/* Disclaimer bar */}
            {chatMode === 'ai' && isDisclaimerVisible && (
              <div className="flex items-start justify-between gap-2 px-3 py-2 text-xs border-b bg-amber-50 border-amber-100">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠️</span>
                  <span className="text-amber-800">
                    Rekomendasi ini <strong>bukan pengganti</strong> dokter/apoteker. Jika gejala berat, segera ke fasilitas medis.
                  </span>
                </div>
                <button onClick={() => setIsDisclaimerVisible(false)} className="text-amber-500 hover:text-amber-700 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className={`overflow-y-auto p-4 space-y-4 bg-gray-50 ${
              isFullScreen ? 'flex-1 max-h-none' : 'h-80'
            }`} ref={chatEndRef}>
              {/* Quick reply chips */}
              {chatMessages.length <= 2 && (
                <div className="flex flex-wrap gap-1.5">
                  {quickSuggestions.slice(0, 3).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReply(suggestion)}
                      className="text-xs bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-50 hover:border-emerald-300 transition-all font-medium shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {chatMessages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl p-3 ${msg.sender === 'user' ? (chatMode === 'admin' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white') : 'bg-white border border-gray-200 shadow-sm'}`}>
                      <p className="text-sm whitespace-pre-line">{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-emerald-100' : 'text-gray-400'}`}>
                        {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Allergy warning notice */}
                  {msg.allergyWarnings && msg.allergyWarnings.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-fade-down">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 font-medium">
                        ⚠️ Beberapa obat mengandung komponen yang Anda alergi. Silakan konsultasikan dengan apoteker untuk alternatif yang aman.
                      </p>
                    </div>
                  )}

                  {/* Medicine recommendations */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="space-y-2 ml-2">
                      {msg.recommendations.map((medicine) => {
                        const warning = getWarningForMedicine(medicine.id, msg.allergyWarnings);
                        return (
                          <div key={medicine.id}
                            onClick={() => navigate(`/medicine/${medicine.id}`)}
                            className={`bg-white rounded-xl p-3 hover:shadow-md transition-all cursor-pointer group border ${warning ? 'border-red-300 ring-2 ring-red-100' : 'border-emerald-100 hover:border-emerald-300'}`}>

                            {/* Allergy warning badge on card */}
                            {warning && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                <span className="text-[10px] text-red-700 font-bold truncate">{warning.matchedAllergen} — Anda alergi!</span>
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              {medicine.photo ? (
                                <img
                                  src={medicine.photo}
                                  alt={medicine.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-xl shrink-0">💊</div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-semibold text-sm truncate group-hover:underline ${warning ? 'text-red-700' : ''}`}>
                                  {medicine.name}
                                </h4>
                                <p className="text-xs text-gray-500 mb-1 line-clamp-1">{medicine.description}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-base font-bold text-emerald-600">Rp {medicine.price.toLocaleString('id-ID')}</p>
                                  <span className={`text-xs font-medium ${warning ? 'text-red-500' : 'text-gray-400'}`}>
                                    {warning ? '⚠️ Alergi!' : `Stok: ${medicine.stock}`}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                  <p className="text-[10px] text-emerald-600 font-semibold group-hover:underline">Lihat Detail →</p>
                                  <Button 
                                    size="sm" 
                                    className="h-6 px-2 text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isAuthenticated) {
                                        toast.info('Silakan login terlebih dahulu untuk menambahkan ke keranjang', {
                                          action: {
                                            label: 'Login',
                                            onClick: () => navigate('/login')
                                          }
                                        });
                                        return;
                                      }
                                      addToCart(medicine);
                                      toast.success(`${medicine.name} ditambahkan ke keranjang`);
                                    }}
                                  >
                                    <ShoppingCart className="h-3 w-3 mr-1" /> + Keranjang
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator / Skeleton loader */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-3 w-3/4 max-w-[250px] animate-pulse space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              )}

              {/* Invisible div for auto-scroll target */}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t bg-white rounded-b-lg shrink-0">
              <>
                {/* Allergy screening quick choices */}
                {showAllergyPrompt && !isLoading && (
                  <div className="flex flex-col gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl mb-2 animate-fade-down">
                    <p className="text-xs text-amber-900 font-semibold">Silakan pilih status alergi obat Anda:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleAllergyChoice('no')}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-1"
                      >
                        ❌ Tidak Ada Alergi
                      </button>
                      <button
                        onClick={() => {
                          const userAllergen = prompt('Sebutkan nama obat atau bahan alergi Anda (contoh: Paracetamol, Amoxicillin):');
                          if (userAllergen && userAllergen.trim()) {
                            handleAllergyChoice('yes', userAllergen.trim());
                          }
                        }}
                        className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-1"
                      >
                        ⚠️ Ada Alergi
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick replies when idle */}
                {!showAllergyPrompt && !isLoading && chatMessages.length <= 2 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {quickSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(suggestion)}
                        className="text-[10px] bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all font-medium"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ketik gejala Anda..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                    disabled={isLoading}
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-emerald-500 hover:bg-emerald-600"
                    size="icon"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
