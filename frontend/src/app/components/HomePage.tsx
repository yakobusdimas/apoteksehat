import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Pill,
  ShoppingCart,
  Search,
  Bot,
  Send,
  User,
  LogOut,
  Heart,
  TrendingUp,
  Package,
  Menu
} from 'lucide-react';
import { toast } from 'sonner';

interface HomePageProps {
  onLogout: () => void;
}

interface Medicine {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
}

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

export default function HomePage({ onLogout }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'bot',
      message: 'Halo! Saya asisten kesehatan Apotek Sehat. Ceritakan gejala yang Anda alami, dan saya akan membantu merekomendasikan obat yang tepat.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);

  const medicines: Medicine[] = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      category: 'Pereda Nyeri',
      price: 15000,
      stock: 100,
      image: '💊',
      description: 'Untuk meredakan demam dan nyeri ringan hingga sedang'
    },
    {
      id: 2,
      name: 'Amoxicillin 500mg',
      category: 'Antibiotik',
      price: 25000,
      stock: 50,
      image: '💊',
      description: 'Antibiotik untuk infeksi bakteri'
    },
    {
      id: 3,
      name: 'OBH Combi',
      category: 'Obat Batuk',
      price: 18000,
      stock: 75,
      image: '🧴',
      description: 'Sirup obat batuk berdahak'
    },
    {
      id: 4,
      name: 'Mixagrip',
      category: 'Flu & Pilek',
      price: 12000,
      stock: 120,
      image: '💊',
      description: 'Meredakan gejala flu seperti demam, sakit kepala, bersin'
    },
    {
      id: 5,
      name: 'Antasida DOEN',
      category: 'Lambung',
      price: 8000,
      stock: 90,
      image: '💊',
      description: 'Untuk mengatasi sakit maag dan kembung'
    },
    {
      id: 6,
      name: 'Vitamin C 1000mg',
      category: 'Vitamin',
      price: 35000,
      stock: 60,
      image: '💊',
      description: 'Meningkatkan daya tahan tubuh'
    }
  ];

  const addToCart = (medicine: Medicine) => {
    setCartCount(cartCount + 1);
    toast.success(`${medicine.name} ditambahkan ke keranjang`);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      sender: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setChatMessages([...chatMessages, userMessage]);
    setInputMessage('');

    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: chatMessages.length + 2,
        sender: 'bot',
        message: generateBotResponse(inputMessage),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('demam') || input.includes('panas')) {
      return 'Berdasarkan gejala demam yang Anda alami, saya merekomendasikan Paracetamol 500mg. Obat ini efektif untuk menurunkan demam dan meredakan nyeri. Anda bisa menemukannya di katalog obat kami dengan harga Rp 15.000.';
    } else if (input.includes('batuk')) {
      return 'Untuk gejala batuk, saya merekomendasikan OBH Combi sirup. Obat ini membantu meredakan batuk berdahak. Tersedia dengan harga Rp 18.000.';
    } else if (input.includes('flu') || input.includes('pilek')) {
      return 'Untuk gejala flu dan pilek, Mixagrip bisa menjadi pilihan yang tepat. Obat ini meredakan demam, sakit kepala, dan bersin-bersin. Harga Rp 12.000.';
    } else if (input.includes('maag') || input.includes('lambung')) {
      return 'Untuk masalah maag atau lambung, Antasida DOEN dapat membantu menetralisir asam lambung. Harga Rp 8.000.';
    } else if (input.includes('vitamin') || input.includes('imun')) {
      return 'Untuk meningkatkan daya tahan tubuh, saya merekomendasikan Vitamin C 1000mg. Harga Rp 35.000 untuk 1 botol.';
    } else {
      return 'Terima kasih telah berbagi gejala Anda. Bisakah Anda memberikan detail lebih spesifik tentang gejala yang dialami? Misalnya: demam, batuk, flu, sakit kepala, dll.';
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-xl">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Apotek Sehat</h1>
                <p className="text-xs text-emerald-600">Digital Health Solutions</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari obat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-0"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={() => toast.info('Keranjang belanja')}
                aria-label="Keranjang belanja"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => toast.info('Profil pengguna')}
                aria-label="Profil"
              >
                <User className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                onClick={onLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Keluar
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Menu navigasi"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari obat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-0"
              />
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl p-6 mb-8 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Selamat Datang di Apotek Sehat!</h2>
                  <p className="text-emerald-50 mb-4">
                    Konsultasikan gejala Anda dengan AI Chatbot dan dapatkan rekomendasi obat yang tepat
                  </p>
                  <Button
                    onClick={() => setShowChatbot(!showChatbot)}
                    className="bg-white text-emerald-600 hover:bg-emerald-50"
                  >
                    <Bot className="h-5 w-5 mr-2" />
                    {showChatbot ? 'Tutup Chatbot' : 'Mulai Konsultasi'}
                  </Button>
                </div>
                <div className="hidden sm:block text-6xl">🏥</div>
              </div>
            </div>

            <Tabs defaultValue="all" className="mb-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="popular">Populer</TabsTrigger>
                <TabsTrigger value="vitamin">Vitamin</TabsTrigger>
                <TabsTrigger value="promo">Promo</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredMedicines.map((medicine) => (
                <Card key={medicine.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{medicine.image}</div>
                        <div>
                          <CardTitle className="text-lg">{medicine.name}</CardTitle>
                          <CardDescription>{medicine.category}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                        Stok: {medicine.stock}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{medicine.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Harga</p>
                        <p className="text-xl font-bold text-emerald-600">
                          Rp {medicine.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toast.success('Ditambahkan ke favorit')}
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={() => addToCart(medicine)}
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Tambah
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {showChatbot && (
              <Card className="sticky top-24">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Bot className="h-6 w-6" />
                    <div>
                      <CardTitle>AI Chatbot</CardTitle>
                      <CardDescription className="text-emerald-50">
                        Asisten Kesehatan Virtual
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${msg.sender === 'user'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white border border-gray-200'
                            }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-emerald-100' : 'text-gray-400'
                            }`}>
                            {msg.timestamp.toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t bg-white">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ketik gejala Anda..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Obat Terlaris
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {medicines.slice(0, 3).map((medicine, index) => (
                  <div key={medicine.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="bg-emerald-50 rounded-full w-8 h-8 flex items-center justify-center text-emerald-600 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{medicine.name}</p>
                      <p className="text-xs text-gray-500">{medicine.category}</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-600">
                      Rp {medicine.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-emerald-50 border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Promo Spesial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-4xl mb-2">🎉</p>
                  <h3 className="font-bold text-lg mb-2">Gratis Ongkir</h3>
                  <p className="text-sm text-gray-600">
                    Untuk pembelian minimal Rp 100.000
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
