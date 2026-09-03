import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Clock, LogIn, Bell, QrCode, X, Coins, Ticket, History, Gamepad2 } from 'lucide-react';
import { MenuItem, CartItem, Category, Order, PaymentMethod, Voucher, MyVoucher } from './types';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import MenuCard from './components/MenuCard';
import CartModal from './components/CartModal';
import PaymentModal from './components/PaymentModal';
import Receipt from './components/Receipt';
import WelcomeScreen from './components/WelcomeScreen';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import PointsModal from './components/PointsModal';
import OrderHistoryModal from './components/OrderHistoryModal';
import ProfileModal from './components/ProfileModal';
import GameScreen from './components/GameScreen';
import VoucherRedeemModal from './components/VoucherRedeemModal';
import BottomNavigation, { TabType } from './components/BottomNavigation';
import { motion, AnimatePresence } from 'motion/react';
import { submitScanTracking } from './services/orderService';
import { Html5Qrcode } from 'html5-qrcode';
import { getRecommendations, earnCoins, getUserVouchers, useVoucher, validateVoucher } from './services/tangolabService';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('meja') || localStorage.getItem('maslahat_auth') === 'true';
  });
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'guest') return true;
    if (params.has('meja') && !params.has('role')) return false;
    return localStorage.getItem('maslahat_role') === 'guest';
  });
  const [authView, setAuthView] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [tableNumber, setTableNumber] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const meja = params.get('meja');
    if (meja) return decodeURIComponent(meja);
    const savedTable = localStorage.getItem('maslahat_table');
    if (savedTable) return savedTable;
    return 'Belum Scan';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('Semua');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedItemForNote, setSelectedItemForNote] = useState<MenuItem | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isNewOrder, setIsNewOrder] = useState<boolean>(false);
  const [showStatus, setShowStatus] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('maslahat_points');
    return saved ? parseInt(saved) : 1000;
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('maslahat_user') || 'null');
    } catch (e) {
      return null;
    }
  });
  const [myVouchers, setMyVouchers] = useState<MyVoucher[]>(() => {
    const dummyVouchers = Array.from({ length: 12 }).map((_, i) => ({
      id: `test-scroll-${i}`,
      voucher_code: `NGOLAB${i + 1}K`,
      name: `Voucher Diskon Spesial ${i + 1}`,
      description: `Potongan ekstra untuk menu favorit Anda. Berlaku kelipatan dengan syarat dan ketentuan yang berlaku pada semua outlet Ngolab.`,
      discount_price: (i + 1) * 2000,
      used: false,
      icon: '🎫'
    }));

    try {
      const saved = localStorage.getItem('maslahat_my_vouchers');
      if (!saved) return dummyVouchers;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((v: any) => !v.used);
        // Gabungkan voucher asli yang belum dipakai dengan dummy
        return [...cleaned, ...dummyVouchers];
      }
      return dummyVouchers;
    } catch {
      return dummyVouchers;
    }
  });
  const [appliedVoucher, setAppliedVoucher] = useState<MyVoucher | null>(null);
  const [promos, setPromos] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const [voucherCatalog, setVoucherCatalog] = useState<Voucher[]>([]);
  const [pointSettings, setPointSettings] = useState({ earningRate: 1000, minPurchase: 10000 });

  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);

  const [zoneName, setZoneName] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const zona = params.get('zona') || params.get('zone');
    if (zona) return decodeURIComponent(zona);
    const savedZone = localStorage.getItem('maslahat_zone');
    if (savedZone) return savedZone;
    return '';
  });

  // STATE BARU UNTUK MENU DARI DATABASE KASIR
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);

  // STATE RIWAYAT PESANAN
  const [orderHistory, setOrderHistory] = useState<Order[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('maslahat_order_history') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrderHistory((prev) => {
      const next = prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
      localStorage.setItem('maslahat_order_history', JSON.stringify(next));
      return next;
    });
    if (completedOrder && completedOrder.id === updatedOrder.id) {
      setCompletedOrder(updatedOrder);
    }
  };

  useEffect(() => {
    // Fungsi untuk narik data LANGSUNG dari MySQL Kasir via Localtunnel
    const fetchMenu = async () => {
      setIsLoadingMenu(true);
      setMenuError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 detik di frontend

      try {
        const response = await fetch(`${API_BASE_URL}/api/menu`, { signal: controller.signal });
        clearTimeout(timeoutId);

        let result;
        const text = await response.text();
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.warn("Respon bukan JSON:", text.substring(0, 50));
          throw new Error("Respon server tidak valid (Bukan JSON). Pastikan Localtunnel sudah aktif.");
        }

        if (!response.ok) {
          throw new Error(result.message || `Error ${response.status}`);
        }

        console.log("Data Berhasil di-load:", result);
        const rawItems = Array.isArray(result) ? result : (result.data || result.items || []);

        // Tampilkan semua menu, termasuk yang dinonaktifkan (displayed = 0) tetapi dengan status Habis
        const activeItems = rawItems;

        if (activeItems.length === 0) {
          setMenuError("Data menu di database admin masih kosong.");
        }

        const mappedMenu = activeItems.map((item: any) => {
          // Normalisasi Kategori agar cocok dengan Tab UI
          let category = item.category || 'Bakso & Mie';

          // Mapping sederhana jika kategori di database berbeda bahasa atau singkatan
          const cat = category.toString().toLowerCase();
          if (cat.includes('mie') || cat.includes('bakso')) category = 'Bakso & Mie';
          else if (cat.includes('nasi')) category = 'Aneka Nasi';
          else if (cat.includes('goreng')) category = 'Gorengan';
          else if (cat.includes('ice') || cat.includes('es')) category = 'Ice Cream';
          else if (cat.includes('minum')) category = 'Minuman';

          return {
            id: String(item.id || Math.random()),
            name: item.name || 'Produk Tanpa Nama',
            price: Number(item.price || 0),
            category,
            image: item.image_url
              ? (item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000/${item.image_url.replace(/^\//, '')}`)
              : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400',
            // Dinonaktifkan jika displayed === 0, false, atau '0'. Jika ditampilkan, gunakan check status/stok.
            inStock: item.displayed !== 0 && item.displayed !== false && item.displayed !== '0' && (item.status === 'Tersedia' || Number(item.stock) > 0),
            stock: Number(item.stock || 0),
            description: item.description || '',
            isPromo: false,
            discountPrice: undefined
          };
        });

        setMenuData(mappedMenu);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error("Gagal load menu:", error);
        if (error instanceof Error && error.name === 'AbortError') {
          setMenuError("Koneksi sangat lambat (Timeout 20 detik). Coba refresh?");
        } else {
          setMenuError(error instanceof Error ? error.message : "Gagal terhubung ke Kasir Admin.");
        }
      } finally {
        setIsLoadingMenu(false);
      }
    };

    const fetchPromos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/promos`);
        if (response.ok) {
          const data = await response.json();
          setPromos(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Gagal load promos:", error);
      }
    };

    const fetchPointSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/point-settings`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.earningRate !== undefined) {
            setPointSettings({
              earningRate: Number(data.earningRate) || 1000,
              minPurchase: Number(data.minPurchase) || 10000
            });
          }
        }
      } catch (error) {
        console.error("Gagal load point settings:", error);
      }
    };

    const fetchPointRewards = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/point-rewards`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const mapped = data.map((item: any) => {
              const points = Number(item.points);
              let discount = 'GRATIS';
              let icon = '🎁';
              let color = 'from-emerald-400 to-teal-500';

              const nameLower = (item.name || '').toLowerCase();
              if (nameLower.includes('voucher')) {
                const match = nameLower.match(/rp\s*([\d.]+)/i);
                discount = match ? `Rp ${match[1]}` : '💸';
                icon = '🎫';
                color = points >= 100 ? 'from-[#FF6B00] to-yellow-500' : 'from-orange-400 to-red-400';
              } else if (nameLower.includes('teh')) {
                icon = '🥤';
                color = 'from-amber-400 to-orange-500';
              } else if (nameLower.includes('bakso')) {
                icon = '🍲';
                color = 'from-red-400 to-rose-500';
              } else if (nameLower.includes('es') || nameLower.includes('ice')) {
                icon = '🍨';
                color = 'from-cyan-400 to-blue-500';
              }

              return {
                id: `reward-${item.id}`,
                title: item.name,
                description: item.description || `Tukarkan ${points} poin untuk mendapatkan ${item.name}`,
                cost: points,
                discount: discount,
                expiry: '30 Hari',
                color: color,
                icon: icon
              };
            });
            setVoucherCatalog(mapped);
          }
        }
      } catch (error) {
        console.error("Gagal load point rewards:", error);
      }
    };

    fetchPromos();
    fetchPointSettings();
    fetchPointRewards();
    fetchMenu();
  }, []);

  // Load Tangolab recommendations and user vouchers when logged in
  useEffect(() => {
    if (currentUser && currentUser.id) {
      getRecommendations(currentUser.id).then(data => {
        if (data) {
          if (data.user) {
            // Merge with local state
            const updatedUser = { ...currentUser, ...data.user };
            setCurrentUser(updatedUser);
            localStorage.setItem('maslahat_user', JSON.stringify(updatedUser));
            if (data.user.coin_balance !== undefined) {
              setPoints(data.user.coin_balance);
              localStorage.setItem('maslahat_points', data.user.coin_balance.toString());
            }
          }
          if (Array.isArray(data.recommendations)) {
            setRecommendations(data.recommendations);
          }
        }
      });

      refreshVouchers(currentUser.id);
    } else {
      setRecommendations([]);
    }
  }, [currentUser?.id]);

  // Helper to refresh vouchers from backend
  const refreshVouchers = async (userId?: string) => {
    const uid = userId || currentUser?.id;
    if (!uid) return;
    const vouchers = await getUserVouchers(uid);
    if (Array.isArray(vouchers)) {
      const mapped = vouchers.map((v: any) => ({
        ...v,
        id: v.id || `vcr-${v.voucher_code || Math.random()}`,
        title: v.title || v.name || 'Voucher Diskon',
        description: v.description || 'Voucher potongan belanja',
        cost: Number(v.cost || 0),
        discount: v.discount || (v.discount_price ? `Rp ${Number(v.discount_price).toLocaleString('id-ID')}` : 'Diskon'),
        expiry: v.expiry || '30 hari',
        color: v.color || 'from-indigo-500 to-purple-600',
        icon: v.icon || '🎫',
        claimedAt: v.claimedAt || new Date().toLocaleString('id-ID'),
        code: v.voucher_code || v.code || '',
        used: v.used === 1 || v.used === true,
      }));
      setMyVouchers(mapped);
      localStorage.setItem('maslahat_my_vouchers', JSON.stringify(mapped));
    }
  };


  const handleAuth = (type: 'guest' | 'login' | 'table_scan', userData?: any) => {
    if (type === 'login' || type === 'table_scan') {
      setIsAuthenticated(true);
      setIsGuest(false);
      localStorage.setItem('maslahat_auth', 'true');
      localStorage.setItem('maslahat_role', type === 'table_scan' ? 'table' : 'user');
      localStorage.removeItem('maslahat_table');
      setTableNumber('Belum Scan');
      if (userData) {
        setCurrentUser(userData);
        localStorage.setItem('maslahat_user', JSON.stringify(userData));
        const initialPoints = userData.points ?? userData.coin_balance ?? 0;
        setPoints(initialPoints);
        localStorage.setItem('maslahat_points', initialPoints.toString());
      }
    } else {
      setIsAuthenticated(true);
      setIsGuest(true);
      setTableNumber('Mode Tamu');
      localStorage.setItem('maslahat_auth', 'true');
      localStorage.setItem('maslahat_role', 'guest');
      localStorage.removeItem('maslahat_table');
      setCurrentUser(null);
      localStorage.removeItem('maslahat_user');
      setPoints(0);
      localStorage.setItem('maslahat_points', '0');
    }
    setAuthView('welcome');
    setActiveTab('dashboard');
  };

  const handleClaimPoints = async (amount: number, source: string = 'Aktivitas Game/Simulasi') => {
    if (!isGuest && currentUser?.id) {
      try {
        const res = await earnCoins(currentUser.id, amount, source);
        if (res) {
          setPoints(res.new_balance);
          localStorage.setItem('maslahat_points', res.new_balance.toString());
          setCurrentUser((prev: any) => {
            if (prev && prev.id === currentUser.id) {
              const updated = { ...prev, points: res.new_balance };
              localStorage.setItem('maslahat_user', JSON.stringify(updated));
              return updated;
            }
            return prev;
          });
        } else {
          // Fallback
          const newPoints = points + amount;
          setPoints(newPoints);
          localStorage.setItem('maslahat_points', newPoints.toString());
        }
      } catch (err) {
        console.error("Gagal update poin di backend:", err);
        // Fallback
        const newPoints = points + amount;
        setPoints(newPoints);
        localStorage.setItem('maslahat_points', newPoints.toString());
      }
    } else {
      const newPoints = points + amount;
      setPoints(newPoints);
      localStorage.setItem('maslahat_points', newPoints.toString());
    }
  };

  // Sinkronisasi poin berkala saat user terdeteksi login
  useEffect(() => {
    if (currentUser && currentUser.id && !isGuest) {
      const syncPoints = async () => {
        try {
          const res = await getRecommendations(currentUser.id);
          if (res && res.user && res.user.coin_balance !== undefined) {
            setPoints(res.user.coin_balance);
            localStorage.setItem('maslahat_points', res.user.coin_balance.toString());
            
            setCurrentUser((prev: any) => {
              if (prev && prev.id === currentUser.id) {
                const updated = { ...prev, points: res.user.coin_balance };
                localStorage.setItem('maslahat_user', JSON.stringify(updated));
                return updated;
              }
              return prev;
            });
          }
        } catch (error) {
          console.error("Gagal sinkronisasi poin di awal:", error);
        }
      };
      syncPoints();
    }
  }, [currentUser?.id, isGuest]);

  // Load order history dari backend saat user terdeteksi login
  useEffect(() => {
    if (currentUser && currentUser.id && !isGuest) {
      const fetchOrderHistory = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users/${currentUser.id}/orders`);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              setOrderHistory(data);
              localStorage.setItem('maslahat_order_history', JSON.stringify(data));
            }
          }
        } catch (error) {
          console.error("Gagal load riwayat pesanan dari backend:", error);
        }
      };
      fetchOrderHistory();
    } else if (isGuest) {
      const saved = localStorage.getItem('maslahat_order_history');
      setOrderHistory(saved ? JSON.parse(saved) : []);
    } else {
      setOrderHistory([]);
    }
  }, [currentUser?.id, isGuest]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const meja = params.get('meja');
    const role = params.get('role');
    const zona = params.get('zona') || params.get('zone');
    if (meja) {
      setTableNumber(meja);
      submitScanTracking(meja);
      localStorage.setItem('maslahat_table', meja);

      const parsedZone = zona ? decodeURIComponent(zona) : '';
      if (parsedZone) {
        setZoneName(parsedZone);
        localStorage.setItem('maslahat_zone', parsedZone);
      } else {
        // Fallback: ambil data zone dari database smart_tags
        fetch(`${API_BASE_URL}/api/smart-tags`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              const matched = data.find((t: any) => t.number === meja);
              if (matched && matched.zone) {
                setZoneName(matched.zone);
                localStorage.setItem('maslahat_zone', matched.zone);
              } else {
                setZoneName('');
                localStorage.removeItem('maslahat_zone');
              }
            }
          })
          .catch(err => {
            console.warn("Gagal mengambil fallback zone:", err);
            setZoneName('');
            localStorage.removeItem('maslahat_zone');
          });
      }

      if (role === 'guest') {
        setIsGuest(true);
        setIsAuthenticated(true);
        localStorage.setItem('maslahat_auth', 'true');
        localStorage.setItem('maslahat_role', 'guest');
      } else {
        handleAuth('table_scan');
      }
    } else {
      const savedRole = localStorage.getItem('maslahat_role');
      if (savedRole === 'guest') {
        setIsGuest(true);
        const savedTable = localStorage.getItem('maslahat_table');
        setTableNumber(savedTable || 'Mode Tamu');
        setZoneName(localStorage.getItem('maslahat_zone') || '');
      } else {
        const savedTable = localStorage.getItem('maslahat_table');
        setTableNumber(savedTable || 'Belum Scan');
        setZoneName(localStorage.getItem('maslahat_zone') || '');
      }
    }
  }, []);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (showScanner) {
      html5QrCode = new Html5Qrcode("qr-reader");

      const startScanner = async () => {
        try {
          await html5QrCode?.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText: string) => {
              setScanResult(decodedText);

              // Handle result
              if (decodedText.includes('meja=')) {
                const url = new URL(decodedText.startsWith('http') ? decodedText : `http://dummy.com/${decodedText}`);
                const meja = url.searchParams.get('meja');
                const zona = url.searchParams.get('zona') || url.searchParams.get('zone');
                if (meja) {
                  const zoneQuery = zona ? `&zona=${encodeURIComponent(zona)}` : '';
                  window.location.href = `/?meja=${meja}&role=guest${zoneQuery}`;
                  return;
                }
              } else if (/^\d+$/.test(decodedText.trim())) {
                // If it is just a number, let's treat it as the table number
                window.location.href = `/?meja=${decodedText.trim()}&role=guest`;
                return;
              }

              // If not a table URL/number, stop after a delay
              setTimeout(() => {
                setShowScanner(false);
              }, 3000);
            },
            (errorMessage: string) => {
              // silence typical errors like "no QR code found"
            }
          );
        } catch (err) {
          console.error("Gagal start scanner:", err);
          setScannerError("Gagal mengakses kamera. Pastikan izin kamera diberikan dan web diakses via HTTPS.");
        }
      };

      startScanner();
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Gagal stop scanner:", err));
      }
    };
  }, [showScanner]);

  const filteredMenu = useMemo(() => {
    return menuData.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, menuData]);

  const recommendedMenuItems = useMemo(() => {
    if (!recommendations || !recommendations.length) return [];
    return menuData.filter(item => 
      recommendations.some((rec: any) => 
        String(rec?.id || '') === String(item.id) || 
        (rec?.name && rec.name.toLowerCase() === item.name.toLowerCase())
      )
    );
  }, [recommendations, menuData]);


  const addToCartWithNote = (item: MenuItem, note: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id && c.note === note);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id && c.note === note ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1, note }];
    });
    setSelectedItemForNote(null);
  };

  const updateQuantity = (id: string, note: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id && item.note === note ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleReorder = (order: Order) => {
    setCart((prev) => {
      let newCart = [...prev];
      order.items.forEach((orderItem) => {
        const existingIndex = newCart.findIndex(
          (c) => c.id === orderItem.id && (c.note || '') === (orderItem.note || '')
        );
        if (existingIndex > -1) {
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: newCart[existingIndex].quantity + orderItem.quantity
          };
        } else {
          newCart.push({
            ...orderItem,
            note: orderItem.note || ''
          });
        }
      });
      return newCart;
    });
    setIsCartOpen(true);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsPaymentOpen(true);
  };

  const handlePlayGame = () => {
    setIsCartOpen(false);
    setActiveTab('game');
  };

  const handleGameComplete = async (pointsEarned: number) => {
    if (!isGuest && currentUser && currentUser.id) {
      try {
        const res = await earnCoins(currentUser.id, pointsEarned, 'Menang Spin Wheel');
        if (res) {
          setPoints(res.new_balance);
          localStorage.setItem('maslahat_points', res.new_balance.toString());
          alert(`Selamat! Anda mendapatkan ${pointsEarned} koin dari permainan!`);
        } else {
          // Fallback if API fails
          const newPoints = points + pointsEarned;
          setPoints(newPoints);
          localStorage.setItem('maslahat_points', newPoints.toString());
          alert(`Selamat! Anda mendapatkan ${pointsEarned} koin dari permainan!`);
        }
      } catch (err) {
        console.error('Failed to award coins:', err);
        // Fallback
        const newPoints = points + pointsEarned;
        setPoints(newPoints);
        localStorage.setItem('maslahat_points', newPoints.toString());
        alert(`Selamat! Anda mendapatkan ${pointsEarned} koin dari permainan!`);
      }
    } else {
      alert(`Anda mendapatkan ${pointsEarned} koin! Silakan login untuk menyimpan koin Anda di lain waktu.`);
    }
  };


  const handleConfirmPayment = async (method: PaymentMethod, customerName: string) => {
    const finalCustomerName = customerName || "Pelanggan App";

    // HITUNG DISKON VOUCHER
    let discountAmount = 0;
    if (appliedVoucher && appliedVoucher.discount !== 'GRATIS') {
      if (appliedVoucher.discount.includes('%')) {
        const pct = parseInt(appliedVoucher.discount.replace(/[^0-9]/g, ''), 10) || 0;
        discountAmount = Math.round((cartTotal * pct) / 100);
      } else {
        discountAmount = parseInt(appliedVoucher.discount.replace(/[^0-9]/g, ''), 10) || 0;
      }
    }
    const finalTotal = Math.max(0, cartTotal - discountAmount);

    const pointsEarned = isGuest 
      ? 0 
      : (finalTotal >= pointSettings.minPurchase ? Math.floor(finalTotal / pointSettings.earningRate) : 0);

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [...cart],
      total: finalTotal,
      tableNumber,
      paymentMethod: method,
      timestamp: new Date().toLocaleString('id-ID'),
      status: 'PENDING',
      customerName: finalCustomerName,
      pointsEarned: pointsEarned,
    };

    // FORMAT DATA KERANJANG AGAR SESUAI DENGAN PERMINTAAN MYSQL ADMIN
    const orderDataKasir = {
      id: newOrder.id,
      table: (() => {
        const base = /^\d+$/.test(tableNumber) ? `Meja ${tableNumber}` : tableNumber;
        return zoneName && zoneName !== 'Area Meja' ? `${base} (${zoneName})` : base;
      })(),
      customer: finalCustomerName,
      type: "Dine In",
      paymentMethod: method,
      amountPaid: finalTotal,
      change: 0,
      total: finalTotal,
      promoCode: appliedVoucher ? appliedVoucher.code : null,
      userId: isGuest ? null : (currentUser?.id || null),
      items: cart.map(item => ({
        id: item.id, // ID Asli dari MySQL
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        note: item.note || ""
      }))
    };

    try {
      // Tembak Data Pesanan LANGSUNG ke Sistem Admin via Localtunnel
      await fetch(`${API_BASE_URL}/api/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderDataKasir)
      });

      if (!isGuest && currentUser?.id) {
        // Fetch updated points from backend
        try {
          const ptsRes = await fetch(`${API_BASE_URL}/api/users/${currentUser.id}/points`);
          if (ptsRes.ok) {
            const ptsData = await ptsRes.json();
            if (ptsData && ptsData.points !== undefined) {
              setPoints(ptsData.points);
              localStorage.setItem('maslahat_points', ptsData.points.toString());
              // Update user points in currentUser too
              setCurrentUser((prev: any) => {
                if (prev && prev.id === currentUser.id) {
                  const updated = { ...prev, points: ptsData.points };
                  localStorage.setItem('maslahat_user', JSON.stringify(updated));
                  return updated;
                }
                return prev;
              });
            }
          }
        } catch (ptsErr) {
          console.error("Gagal sinkronisasi poin setelah order:", ptsErr);
        }
      }

      setCompletedOrder(newOrder);
      setIsNewOrder(true);
      setOrderHistory((prev) => {
        const next = [newOrder, ...prev];
        localStorage.setItem('maslahat_order_history', JSON.stringify(next));
        return next;
      });
      setShowStatus(true);
      setCart([]);
      setIsPaymentOpen(false);

    } catch (error) {
      console.error("Gagal checkout:", error);
      alert("Gagal mengirim pesanan ke Dapur/Kasir!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsGuest(false);
    setAuthView('welcome');
    setActiveTab('dashboard');
    localStorage.removeItem('maslahat_auth');
    localStorage.removeItem('maslahat_role');
    localStorage.removeItem('maslahat_table');
    localStorage.removeItem('maslahat_zone');
    localStorage.removeItem('maslahat_user');
    localStorage.removeItem('maslahat_order_history');
    setCurrentUser(null);
    setZoneName('');
    setOrderHistory([]);
  };

  // POLLING STATUS PESANAN & FITUR DERING
  useEffect(() => {
    if (!completedOrder || !isNewOrder) return;

    // Jika status pesanan sudah final, tidak perlu polling lagi
    const statusUpper = (completedOrder.status || '').toUpperCase();
    const isFinalStatus = statusUpper === 'SELESAI' ||
      statusUpper === 'SIAP DISAJIKAN' ||
      statusUpper === 'DIBATALKAN';
    if (isFinalStatus) return;

    // Professional notification chime using Web Audio API
    const playProfessionalChime = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playTone = (freq: number, startTime: number, duration: number, volume: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
          gain.gain.setValueAtTime(0, audioCtx.currentTime + startTime);
          gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);
          osc.start(audioCtx.currentTime + startTime);
          osc.stop(audioCtx.currentTime + startTime + duration);
        };
        // Professional ascending chime: C6 → E6 → G6 (clean, elegant)
        playTone(1047, 0, 0.3, 0.15);
        playTone(1319, 0.15, 0.3, 0.15);
        playTone(1568, 0.3, 0.5, 0.12);
        // Repeat after 2 seconds
        setTimeout(() => {
          playTone(1047, 0, 0.3, 0.12);
          playTone(1319, 0.15, 0.3, 0.12);
          playTone(1568, 0.3, 0.5, 0.10);
        }, 2000);
      } catch (e) {
        console.log('Audio not supported:', e);
      }
    };

    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/order/${completedOrder.id}`);
        if (response.ok) {
          const data = await response.json();
          const newStatus = data.status || data.order_status || completedOrder.status;

          const isFinished = newStatus === 'Siap Disajikan' || newStatus === 'Selesai' || newStatus.toLowerCase().includes('antar') || newStatus === 'SELESAI';

          if (isFinished && completedOrder.status !== newStatus) {
            setIsRinging(true);
            playProfessionalChime();

            // Auto stop ringing setelah 15 detik
            setTimeout(() => setIsRinging(false), 15000);

            // Nonaktifkan isNewOrder agar polling berhenti karena status telah selesai
            setIsNewOrder(false);
          }

          if (newStatus !== completedOrder.status) {
            const updated = { ...completedOrder, status: newStatus as any };
            setCompletedOrder(updated);

            // Perbarui juga data di riwayat pesanan (localStorage) agar sinkron
            setOrderHistory((prev) => {
              const next = prev.map((o) => (o.id === updated.id ? updated : o));
              localStorage.setItem('maslahat_order_history', JSON.stringify(next));
              return next;
            });
          }
        }
      } catch (err) {
        console.warn("Gagal cek status pesanan:", err);
      }
    };

    const interval = setInterval(checkStatus, 3000); // Cek tiap 3 detik agar cepat responsif
    return () => {
      clearInterval(interval);
    };
  }, [completedOrder?.id, completedOrder?.status, isNewOrder]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-32">
      <AnimatePresence>
        {!isAuthenticated && (
          <>
            {authView === 'welcome' && (
              <WelcomeScreen
                onLogin={() => setAuthView('login')}
                onRegister={() => setAuthView('register')}
                onGuest={() => handleAuth('guest')}
                onNfcLogin={(user) => handleAuth('login', user)}
              />
            )}
            {authView === 'login' && (
              <LoginView
                onBack={() => setAuthView('welcome')}
                onSuccess={(user) => {
                  handleAuth('login', user);
                }}
              />
            )}
            {authView === 'register' && (
              <RegisterView
                onBack={() => setAuthView('welcome')}
                onSuccess={() => setAuthView('login')}
              />
            )}
          </>
        )}
      </AnimatePresence>

      {/* Professional Notification Overlay */}

      <Header
        tableNumber={tableNumber}
        isGuest={isGuest}
        zoneName={zoneName}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        points={points}
        onPointsClick={() => {
          setActiveTab('profile');
          setIsPointsModalOpen(true);
        }}
        onLogout={handleLogout}
        onProfileClick={() => setActiveTab('profile')}
        activeTab={activeTab}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />

      <PointsModal
        isOpen={isPointsModalOpen}
        onClose={() => setIsPointsModalOpen(false)}
        points={points}
        userId={currentUser?.id}
        onRefreshPoints={() => {
          // Point refresh logic will be triggered by useEffect
        }}
        onClaim={handleClaimPoints}
      />
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={cartTotal}
        onConfirm={async (method, customerName) => {
          // Call use-voucher API to mark voucher as used on the backend
          if (appliedVoucher && currentUser?.id) {
            const vCode = appliedVoucher.voucher_code || appliedVoucher.code;
            if (vCode) {
              await useVoucher(currentUser.id, vCode);
            }
            setAppliedVoucher(null);
            refreshVouchers();
          }
          handleConfirmPayment(method, customerName);
        }}
        myVouchers={myVouchers}
        appliedVoucher={appliedVoucher}
        setAppliedVoucher={setAppliedVoucher}
        userId={currentUser?.id}
        cartItems={cart}
      />

      {/* Floating Order Status Tracker */}
      <AnimatePresence>
        {completedOrder && !showStatus && (
          <motion.button
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            onClick={() => setShowStatus(true)}
            className="fixed top-24 right-4 z-40 bg-white shadow-2xl border border-slate-100 rounded-2xl p-3 flex items-center gap-3 active:scale-95 transition-all"
          >
            <div className="bg-orange-100 p-2 rounded-xl text-[#FF6B00]">
              <Clock size={20} className="animate-spin-slow" />
            </div>
            <div className="text-left pr-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Pesanan</p>
              <p className="text-xs font-bold text-slate-700">{(completedOrder.status === 'PENDING' || completedOrder.status === 'Menunggu') ? 'Menunggu Verifikasi' : completedOrder.status}</p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <motion.main 
        className="max-w-4xl mx-auto px-4 space-y-8 relative z-40"
        animate={{ 
          marginTop: activeTab === 'dashboard' ? -64 : 0 
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
            {!isGuest && (
              <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-2 relative z-40">
                <button 
                  onClick={() => setIsPointsModalOpen(true)}
                  className="bg-white border border-border-light rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-start gap-2 hover:shadow-md transition-all active:scale-95 shadow-sm"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 rounded-full flex items-center justify-center text-primary shadow-sm border border-orange-100">
                    <Coins size={20} />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-text-dark text-center leading-tight">Poin<br/><span className="text-primary">{points.toLocaleString('id-ID')}</span></span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('voucher')}
                  className="bg-white border border-border-light rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-start gap-2 hover:shadow-md transition-all active:scale-95 shadow-sm"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-sm border border-red-100">
                    <Ticket size={20} />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-text-dark text-center leading-tight">Katalog<br/>Promo</span>
                </button>
                
                <button 
                  onClick={() => setIsPointsModalOpen(true)}
                  className="bg-white border border-border-light rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-start gap-2 hover:shadow-md transition-all active:scale-95 shadow-sm"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
                    <History size={20} />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-text-dark text-center leading-tight">Riwayat<br/>Koin</span>
                </button>

                <button 
                  onClick={() => setActiveTab('game')}
                  className="bg-white border border-border-light rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-start gap-2 hover:shadow-md transition-all active:scale-95 shadow-sm"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-500 shadow-sm border border-purple-100">
                    <Gamepad2 size={20} />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-text-dark text-center leading-tight">Main<br/>Game</span>
                </button>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-border-light rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`text-white p-3.5 rounded-2xl shadow-sm ${tableNumber === 'Belum Scan' || tableNumber === 'Mode Tamu' ? 'bg-slate-300' : 'bg-primary'}`}>
                  <QrCode size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-black text-text-dark text-base">
                    {tableNumber === 'Belum Scan' || tableNumber === 'Mode Tamu' ? 'Belum Terhubung ke Meja' : (
                      (() => {
                        const base = /^\d+$/.test(tableNumber) ? `Meja ${tableNumber}` : tableNumber;
                        return zoneName && zoneName !== 'Area Meja' ? `Terhubung ke ${base} (${zoneName})` : `Terhubung ke ${base}`;
                      })()
                    )}
                  </h3>
                  <p className="text-text-light text-xs font-semibold mt-0.5">
                    {tableNumber === 'Belum Scan' || tableNumber === 'Mode Tamu'
                      ? 'Scan QR di meja Anda untuk mulai memesan.'
                      : `Pesanan akan diantar ke ${/^\d+$/.test(tableNumber) ? 'meja' : 'lokasi'} ini.`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setScanResult(null);
                  setScannerError(null);
                  setShowScanner(true);
                }}
                className={`${tableNumber === 'Belum Scan' || tableNumber === 'Mode Tamu' ? 'bg-text-dark hover:bg-slate-700' : 'bg-primary hover:bg-primary-hover'} text-white font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-sm active:scale-95 transition-all self-start sm:self-center flex items-center gap-2 cursor-pointer`}
              >
                <QrCode size={16} />
                {tableNumber === 'Belum Scan' || tableNumber === 'Mode Tamu' ? 'Scan Sekarang' : 'Scan Ulang'}
              </button>
            </motion.div>

                {recommendedMenuItems.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between pl-1">
                      <div>
                        <h3 className="text-lg font-black text-text-dark tracking-tight">Rekomendasi Spesial Untukmu</h3>
                        <p className="text-[10px] font-bold text-text-light">Pilihan hidangan terbaik berdasarkan profil Tangolab Anda</p>
                      </div>
                      <span className="bg-slate-50 border border-border-light text-primary text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                        Personalized
                      </span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                      {recommendedMenuItems.map((item) => (
                        <div key={`rec-${item.id}`} className="w-[170px] sm:w-[190px] shrink-0">
                          <MenuCard item={item} onAdd={(item) => addToCartWithNote(item, '')} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <CategoryFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredMenu.map((item) => (
                    <MenuCard key={item.id} item={item} onAdd={(item) => addToCartWithNote(item, '')} />
                  ))}
                </div>

                {isLoadingMenu && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-orange-200 border-t-[#FF6B00] rounded-full animate-spin mb-4" />
                    <p className="font-bold text-slate-400">Menghubungkan ke Kasir...</p>
                  </div>
                )}

                {!isLoadingMenu && filteredMenu.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 grayscale opacity-40">
                    <ShoppingBag size={64} />
                    <p className="mt-4 font-bold text-slate-400">
                      {menuData.length === 0 ? (menuError || "Menu tidak ditemukan di database") : "Menu tidak ditemukan"}
                    </p>
                    {menuData.length === 0 && (
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-4 text-[#FF6B00] font-bold underline"
                      >
                        Coba Lagi
                      </button>
                    )}
                  </div>
                )}
            </motion.div>
          )}
        {activeTab === 'orders' && (
          <motion.div 
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <OrderHistoryModal
            isOpen={true}
            onClose={() => setActiveTab('dashboard')}
            orders={orderHistory}
            onViewReceipt={(order) => {
              setCompletedOrder(order);
              setIsNewOrder(false);
              setShowStatus(true);
            }}
            isInline={true}
            onReorder={handleReorder}
            onStartOrdering={() => setActiveTab('dashboard')}
            />
          </motion.div>
        )}

        {activeTab === 'game' && (
          <motion.div 
            key="game"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <GameScreen
            onClose={() => setActiveTab('dashboard')}
            onGameComplete={handleGameComplete}
            userId={currentUser?.id || (isGuest ? 'GUEST' : null)}
            isInline={true}
            />
          </motion.div>
        )}

        {activeTab === 'voucher' && (
          <motion.div 
            key="voucher"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <VoucherRedeemModal
            isOpen={true}
            onClose={() => setActiveTab('dashboard')}
            userId={currentUser?.id}
            myVouchers={myVouchers}
            onRefreshVouchers={() => refreshVouchers()}
            isInline={true}
            />
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ProfileModal
            isOpen={true}
            onClose={() => setActiveTab('dashboard')}
            user={currentUser}
            points={points}
            onPointsClick={() => setIsPointsModalOpen(true)}
            onHistoryClick={() => setActiveTab('orders')}
            onLogout={handleLogout}
            onRedeemVoucherClick={() => setActiveTab('voucher')}
            isInline={true}
            />
          </motion.div>
        )}
        </AnimatePresence>
      </motion.main>



      <CartModal
        isOpen={isCartOpen}
        onClose={() => { setIsCartOpen(false); setSelectedItemForNote(null); }}
        cart={cart}
        updateQuantity={updateQuantity}
        onCheckout={handleCheckout}
        selectedItemForNote={selectedItemForNote}
        setSelectedItemForNote={setSelectedItemForNote}
        addToCartWithNote={addToCartWithNote}
        onPlayGame={handlePlayGame}
      />

      <AnimatePresence>
        {showLoginPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginPrompt(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 relative z-10 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
                <LogIn size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800">Login Diperlukan</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Maaf, fitur pemesanan hanya tersedia untuk pengguna terdaftar. Silakan login untuk melanjutkan pesanan Anda.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsAuthenticated(false);
                    setIsGuest(false);
                    setShowLoginPrompt(false);
                    localStorage.removeItem('maslahat_auth');
                  }}
                  className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-orange-100"
                >
                  HALAMAN LOGIN
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-sm"
                >
                  KEMBALI KE MENU
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Scanner Overlay */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScanner(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-[40px] p-8 space-y-6 overflow-hidden relative z-10"
            >
              <button
                onClick={() => setShowScanner(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-2 pt-4">
                <h2 className="text-2xl font-black text-slate-800">Scan QR Meja</h2>
                <p className="text-slate-400 text-sm font-medium">Arahkan kamera ke kode QR di meja Anda</p>
              </div>

              <div id="qr-reader" className="rounded-3xl overflow-hidden shadow-inner bg-slate-50 border-2 border-slate-100" />

              {scannerError && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-center">
                  <p className="text-red-500 font-bold text-sm">{scannerError}</p>
                </div>
              )}

              {scanResult && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-green-50 border border-green-100 p-4 rounded-2xl text-center"
                >
                  <p className="text-green-600 font-black text-sm">Terdeteksi:</p>
                  <p className="text-green-800 font-bold break-all">{scanResult}</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {completedOrder && showStatus && (
        <Receipt
          order={completedOrder}
          onClose={() => setShowStatus(false)}
          onUpdateOrder={handleUpdateOrder}
        />
      )}

      {/* Professional Order Ready Notification */}
      <AnimatePresence>
        {isRinging && completedOrder && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsRinging(false); setShowStatus(true); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden relative z-10 shadow-2xl"
            >
              {/* Top accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-[#FF6B00] via-orange-500 to-amber-500" />
              
              <div className="p-8 text-center">
                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                  className="mx-auto w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 relative"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="w-16 h-16 bg-gradient-to-br from-[#FF6B00] to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-200"
                  >
                    <Bell size={28} className="text-white" />
                  </motion.div>
                  {/* Subtle pulse ring */}
                  <motion.div
                    animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
                    className="absolute inset-0 border-2 border-[#FF6B00] rounded-full"
                  />
                </motion.div>

                {/* Status badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-[#FF6B00] text-[10px] font-bold uppercase tracking-widest mb-4">
                  <span className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full animate-pulse" />
                  Pesanan Siap
                </div>

                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">Pesananmu Sudah Siap</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Pesanan <span className="font-bold text-slate-700">#{completedOrder.id}</span> telah selesai disiapkan dan siap disajikan ke meja Anda.
                </p>
              </div>

              <div className="px-8 pb-8 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsRinging(false);
                    setShowStatus(true);
                  }}
                  className="w-full bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-[#e66000] hover:to-amber-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
                >
                  Lihat Detail Pesanan
                </button>
                <button
                  onClick={() => setIsRinging(false)}
                  className="w-full text-slate-400 hover:text-slate-600 py-2 font-semibold text-sm transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isAuthenticated && (
        <BottomNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          onScanClick={() => {
            setScanResult(null);
            setScannerError(null);
            setShowScanner(true);
          }}
        />
      )}
    </div>
  );
}