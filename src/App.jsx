import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Pause, X, Check, AlertTriangle, Download, Upload } from 'lucide-react'
import pkg from '../package.json'
import { db } from './db'
import { supabase } from './supabaseClient'
import * as XLSX from 'xlsx'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import CashCalculator from './components/CashCalculator'
import KitchenDisplay from './components/KitchenDisplay'
import CustomerDisplay from './components/CustomerDisplay'
import Activation from './components/Activation'
import { checkIsConfigured } from './supabaseClient'
import './App.css'

//  Icon Components
const IconStore = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const IconBox = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>;
const IconSettings = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const IconHistory = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="9" /></svg>;
const IconUsers = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M17.31 7a4 4 0 0 0-4.34 0" /></svg>;
const IconMoon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>;
const IconSun = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>;
const IconPower = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>;
const IconPrinter = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>;
const IconTag = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>;
const IconCreditCard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
const IconAlert = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const IconQR = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><line x1="7" y1="7" x2="7.01" y2="7" /><line x1="17" y1="7" x2="17.01" y2="7" /><line x1="17" y1="17" x2="17.01" y2="17" /><line x1="7" y1="17" x2="7.01" y2="17" /></svg>;
const IconMenu = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
const IconEye = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconTrash = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const IconUpload = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const IconDashboard = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>;
const IconPause = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const IconCart = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;


function App() {
  const isConfigured = checkIsConfigured();
  
  const [settings, setSettings] = useState({
    storeName: 'Kaze POS',
    storeAddress: 'Store Address',
    taxRate: 11,
    memberDiscount: 5,
    themeColor: '#6366f1',
    isCustomerDisplayOn: true,
    welcomeText: 'Selamat Datang / Welcome' ,
    qrisImage: '',
    displayTemplate: 'classic',
    points_enabled: false,
    points_per_rupiah: 1000,   // Setiap 1000 rupiah = 1 poin
    points_value: 500          // 1 poin = Rp 500 saat redeem
  });

  const [products, setProducts] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'pos');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isInitializing, setIsInitializing] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showQRISModal, setShowQRISModal] = useState(false);
  const [activeTransactionId, setActiveTransactionId] = useState(null);
  const [qrisData, setQrisData] = useState(''); 
  // Untuk menyimpan string/URL QRIS asli
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [customerViewMode, setCustomerViewMode] = useState('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('available'); // available, downloading, ready
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [heldOrders, setHeldOrders] = useState([]);
  const [showCashCalc, setShowCashCalc] = useState(false);
  const [transactionNotes, setTransactionNotes] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', category: '', variants: '', image: '' });
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [historySearch, setHistorySearch] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState('all');
  const [activeCashier, setActiveCashier] = useState(localStorage.getItem('activeCashier') || '');
  const [activeCaptain, setActiveCaptain] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('activeCashier'));
  const [dialog, setDialog] = useState(null); // { title, message, onConfirm, onCancel, type: 'alert' | 'confirm' | 'prompt', requiredText? }
  const [promptValue, setPromptValue] = useState('');

  const [activeShift, setActiveShift] = useState(() => {
    try { return JSON.parse(localStorage.getItem('activeShift')) || null; } catch { return null; }
  });
  const [shiftStartCash, setShiftStartCash] = useState('');
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);
  const [shiftActualCash, setShiftActualCash] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToSelectVariant, setProductToSelectVariant] = useState(null);
  const [checkoutKey, setCheckoutKey] = useState(0);
  const [memberFormData, setMemberFormData] = useState({ name: '', phone: '' });
  const [customerName, setCustomerName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [activeMember, setActiveMember] = useState(null);
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const isRgbUserChange = useRef(false);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 99, g: 102, b: 241 };
  };
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => Math.min(255, Math.max(0, parseInt(v) || 0)).toString(16).padStart(2, '0')).join('');
  const [rgb, setRgb] = useState(() => hexToRgb(localStorage.getItem('themeColor') || '#6366f1'));

  // --- POS Calculations ---
  const categories = ['Semua', ...new Set(products.flatMap(p => (p.category || 'Lainnya').split(',').map(c => c.trim())))];
  const currentTaxRate = parseInt(settings.taxRate || settings.tax_rate) || 0;
  const currentMemberDiscount = parseInt(settings.memberDiscount || settings.member_discount) || 0;
  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const taxAmount = subtotal * (currentTaxRate / 100);
  const discount = activeMember ? subtotal * (currentMemberDiscount / 100) : 0;
  const isPointsEnabled = settings.points_enabled === true;
  const pointsPerRupiah = parseInt(settings.points_per_rupiah) || 1000;
  const pointsValue = parseInt(settings.points_value) || 500;
  const maxRedeemable = activeMember ? (parseInt(activeMember.points) || 0) : 0;
  const pointsDiscount = (usePoints && isPointsEnabled && activeMember) ? (pointsToRedeem * pointsValue) : 0;
  const earnedPoints = isPointsEnabled ? Math.floor(subtotal / pointsPerRupiah) : 0;
  const total = subtotal + taxAmount - discount - pointsDiscount;

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    // Only attempt to use electron if we're in the electron environment
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      
      ipcRenderer.on('update_available', () => {
        setIsCheckingUpdate(false);
        setUpdateInfo({ version: pkg.version });
        setUpdateStatus('available');
      });

      ipcRenderer.on('update_not_available', () => {
        setIsCheckingUpdate(false);
        setUpdateMessage('Aplikasi sudah versi terbaru.');
        setTimeout(() => setUpdateMessage(''), 3000);
      });

      ipcRenderer.on('update_downloaded', () => {
        setUpdateStatus('ready');
      });

      ipcRenderer.on('update_error', () => {
        setIsCheckingUpdate(false);
      });

      return () => {
        ipcRenderer.removeAllListeners('update_available');
        ipcRenderer.removeAllListeners('update_not_available');
        ipcRenderer.removeAllListeners('update_downloaded');
        ipcRenderer.removeAllListeners('update_error');
      };
    }
  }, []);

  const startUpdateDownload = () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('start_download');
      setUpdateStatus('downloading');
    }
  };

  const restartAndInstall = () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('restart_app');
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*').single();
      if (!error && data) {
        setSettings(prev => ({
          ...prev,
          storeName: data.store_name,
          storeAddress: data.store_address,
          taxRate: data.tax_rate,
          memberDiscount: data.member_discount,
          themeColor: data.primary_color || '#6366f1',
          isCustomerDisplayOn: data.is_customer_display_on,
          welcomeText: data.welcome_text,
          qrisImage: data.qris_image,
          points_enabled: data.points_enabled || false,
          points_per_rupiah: data.points_per_rupiah || 1000,
          points_value: data.points_value || 500,
          displayTemplate: data.display_template || 'classic'
        }));
        
        if (data.primary_color) {
          document.documentElement.style.setProperty('--primary', data.primary_color);
          document.documentElement.style.setProperty('--primary-soft', data.primary_color + '26');
        }
      }
    } catch (e) {
      // Fail silently
    } finally {
      setTimeout(() => setIsInitializing(false), 2000);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    if (key === 'primary_color') {
      document.documentElement.style.setProperty('--primary', value);
      document.documentElement.style.setProperty('--primary-soft', value + '26');
    }
    let settingsId = settings?.id;
    if (!settingsId) {
       const { data } = await supabase.from('settings').select('id').single();
       settingsId = data?.id;
    }
    if (settingsId) {
      await supabase.from('settings').update({ [key]: value }).eq('id', settingsId);
    }
    const bc = new BroadcastChannel('customer_display');
    bc.postMessage({ [key]: value });
    bc.close();
  };

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (!error) setProducts(data);
  }, []);

  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase.from('members').select('*').order('name');
    if (!error) setMembers(data);
  }, []);

  const fetchTransactions = useCallback(async () => {
    const { data, error } = await supabase.from('transactions').select('*').order('timestamp', { ascending: false });
    if (!error) setTransactions(data);
  }, []);

  const customConfirm = (title, message, onConfirm) => {
    setDialog({ title, message, onConfirm, type: 'confirm' });
  };

  const customPrompt = (title, message, requiredText, onConfirm) => {
    setPromptValue('');
    setDialog({ title, message, requiredText, onConfirm, type: 'prompt' });
  };

  const customAlert = (title, message) => {
    setDialog({ title, message, type: 'alert' });
  };

  const handleLogin = (name) => {
    setActiveCashier(name);
    setIsLoggedIn(true);
    localStorage.setItem('activeCashier', name);
  };

  const handleLogout = () => {
    if (activeShift) {
      setShowEndShiftModal(true);
    } else {
      customConfirm('Ganti Kasir', 'Apakah Anda yakin ingin mengganti kasir (Log Out)?', () => {
        setIsLoggedIn(false);
        setActiveCashier('');
        localStorage.removeItem('activeCashier');
      });
    }
  };

  const forceLogout = () => {
    setIsLoggedIn(false);
    setActiveCashier('');
    localStorage.removeItem('activeCashier');
  };

  const getShiftSummary = () => {
    if (!activeShift) return null;
    const shiftTx = transactions.filter(t => 
      t.cashier_name === activeShift.cashierName && 
      new Date(t.timestamp) >= new Date(activeShift.startTime)
    );
    const totalCash = shiftTx.filter(t => t.payment_method === 'Cash').reduce((sum, t) => sum + t.total, 0);
    const totalQRIS = shiftTx.filter(t => t.payment_method === 'QRIS').reduce((sum, t) => sum + t.total, 0);
    const totalDebit = shiftTx.filter(t => t.payment_method === 'Debit').reduce((sum, t) => sum + t.total, 0);
    const expectedCash = activeShift.startingCash + totalCash;
    
    return { totalCash, totalQRIS, totalDebit, expectedCash, transactionCount: shiftTx.length };
  };



  useEffect(() => {
    const root = document.documentElement;
    const color = rgbToHex(rgb.r, rgb.g, rgb.b);
    root.style.setProperty('--primary', color);
    root.style.setProperty('--primary-soft', `${color}15`);
  }, [rgb]);

  useEffect(() => {
    if (isDark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    const init = async () => {
      await fetchSettings();
      await fetchProducts();
      await fetchTransactions();
      await fetchMembers();
    };
    init();
  }, [fetchProducts, fetchTransactions, fetchMembers]);

  const handleEndShift = async () => {
    const summary = getShiftSummary();
    if (!summary) return;
    const actual = parseInt(shiftActualCash) || 0;
    const shiftRecord = {
      ...activeShift,
      endTime: new Date().toISOString(),
      expectedCash: summary.expectedCash,
      actualCash: actual,
      totalCash: summary.totalCash,
      totalQRIS: summary.totalQRIS,
      totalDebit: summary.totalDebit,
      difference: actual - summary.expectedCash,
      notes: shiftNotes
    };
    try { await db.shifts.add(shiftRecord); } catch (e) {}
    try {
      await supabase.from('shifts').insert({
        cashier_name: shiftRecord.cashierName,
        start_time: shiftRecord.startTime,
        end_time: shiftRecord.endTime,
        starting_cash: shiftRecord.startingCash,
        expected_cash: shiftRecord.expectedCash,
        actual_cash: shiftRecord.actualCash,
        difference: shiftRecord.difference,
        notes: shiftRecord.notes
      });
    } catch (e) {}
    setActiveShift(null);
    setShowEndShiftModal(false);
    setShiftActualCash('');
    setShiftNotes('');
    forceLogout();
    showToast('Shift diakhiri. Silakan login kembali.');
  };

  const addToCart = useCallback((product, variant = null) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedVariant === variant);
      if (existing) return prev.map(item => (item.id === product.id && item.selectedVariant === variant) ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1, selectedVariant: variant }];
    });
    setProductToSelectVariant(null);
  }, []);

  const updateQty = useCallback((id, variant, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedVariant === variant) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(i => i.qty > 0));
  }, []);

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    const { error } = await supabase.from('products').update({
      name: editingProduct.name,
      price: parseInt(editingProduct.price),
      stock: parseInt(editingProduct.stock),
      category: editingProduct.category,
      variants: editingProduct.variants,
      image: editingProduct.image
    }).eq('id', editingProduct.id);
    
    if (!error) {
      setEditingProduct(null);
      fetchProducts();
      showToast('Produk berhasil diperbarui!');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) return;
    const { error } = await supabase.from('products').insert({
      name: formData.name, price: parseInt(formData.price), stock: parseInt(formData.stock),
      category: formData.category || 'Umum', variants: formData.variants || '', image: formData.image || ''
    });
    if (!error) {
      setFormData({ name: '', price: '', stock: '', category: '', variants: '', image: '' });
      setShowAddProduct(false);
      fetchProducts();
      showToast('Produk baru berhasil ditambahkan!');
    }
  };

  const exportMenu = () => {
    if (products.length === 0) { customAlert('Export', 'Tidak ada produk untuk diekspor.'); return; }
    const exportData = products.map(({ name, price, stock, category, variants, image }) => ({ name, price, stock, category, variants, image }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `menu_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${exportData.length} produk berhasil diekspor!`);
  };

  const importMenu = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error('Format tidak valid');
        customConfirm(
          'Import Menu',
          `Akan mengimpor ${data.length} produk. Pilih mode: OK untuk Tambah.`,
          async () => {
            const inserts = data.map(p => ({
              name: p.name, price: parseInt(p.price) || 0, stock: parseInt(p.stock) || 0,
              category: p.category || 'Umum', variants: p.variants || '', image: p.image || ''
            }));
            const { error } = await supabase.from('products').insert(inserts);
            if (!error) { fetchProducts(); showToast(`${inserts.length} produk berhasil diimport!`); }
            else { customAlert('Import Gagal', error.message); }
          }
        );
      } catch (err) {
        customAlert('Import Gagal', `File tidak valid: ${err.message}`);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const holdCurrentOrder = useCallback(() => {
    if (cart.length === 0) return;
    setHeldOrders(prev => [...prev, { id: Date.now(), timestamp: new Date().toISOString(), customerName: customerName || 'Umum', items: [...cart], total: cart.reduce((a,i) => a + i.price*i.qty, 0), notes: transactionNotes }]);
    setCart([]); setCustomerName(''); setTransactionNotes(''); setMemberPhone(''); setActiveMember(null);
    showToast('Pesanan berhasil ditahan!');
  }, [cart, customerName, transactionNotes, showToast]);

  const resumeOrder = useCallback((heldId) => {
    const order = heldOrders.find(h => h.id === heldId);
    if (!order) return;
    setCart(order.items); setCustomerName(order.customerName); setTransactionNotes(order.notes || '');
    setHeldOrders(prev => prev.filter(h => h.id !== heldId));
    showToast('Pesanan dilanjutkan!');
  }, [heldOrders, showToast]);

  const removeHeldOrder = useCallback((heldId) => {
    setHeldOrders(prev => prev.filter(h => h.id !== heldId));
    showToast('Pesanan yang ditahan dihapus.');
  }, [showToast]);

  const handleCheckout = useCallback(async () => {
    if (cart.length === 0 || isProcessing) return;
    setIsProcessing(true);
    
    if (paymentMethod === 'Cash' && !showCashCalc && !showQRISModal) {
      setShowCashCalc(true);
      setIsProcessing(false);
      return;
    }

    if (paymentMethod === 'QRIS' && !showQRISModal) {
      setShowQRISModal(true);
      setIsProcessing(false);
      return;
    }

    try {
      const transaction = {
        timestamp: new Date().toISOString(),
        total: total,
        subtotal: subtotal,
        tax: taxAmount,
        discount: discount,
        points_redeemed: usePoints ? pointsToRedeem : 0,
        points_discount: pointsDiscount,
        points_earned: earnedPoints,
        customerName: customerName || `Cust ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
        member_phone: activeMember ? activeMember.phone : null,
        payment_method: paymentMethod,
        items: cart.map(item => ({ name: item.name, price: item.price, qty: item.qty, selectedVariant: item.selectedVariant })),
        notes: transactionNotes,
        status: 'preparing',
        cashier_name: activeCashier || 'Admin',
        captain_name: activeCaptain || 'Self'
      };

      const { data, error } = await supabase.from('transactions').insert(transaction).select();
      if (error) throw error;
      const savedTransaction = data[0];
      
      if (activeMember) {
        const newPoints = (parseInt(activeMember.points) || 0) - pointsToRedeem + earnedPoints;
        await supabase.from('members').update({ points: Math.max(0, newPoints) }).eq('id', activeMember.id);
      }

      for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          await supabase.from('products').update({ stock: product.stock - item.qty }).eq('id', item.id);
        }
      }
      
      setLastTransaction(savedTransaction);
      setShowReceipt(true);

      setTimeout(() => {
        setCart([]);
        setCustomerName('');
        setMemberPhone('');
        setActiveMember(null);
        setShowQRISModal(false);
        setIsProcessing(false);
        setShowCashCalc(false);
        setTransactionNotes('');
        setUsePoints(false);
        setPointsToRedeem(0);
        fetchProducts(); fetchTransactions(); fetchMembers();
      }, 500);
      
    } catch (err) {
      customAlert('Error', `Gagal memproses transaksi: ${err?.message || 'Unknown error'}`);
      setIsProcessing(false);
    }
  }, [cart, customerName, activeMember, paymentMethod, transactionNotes, discount, activeCashier, total, showCashCalc, showQRISModal, isProcessing]);

  const sendToKitchen = async () => {
    if (cart.length === 0) return;
    try {
      const transaction = {
        timestamp: new Date().toISOString(),
        total: total,
        customerName: customerName || 'Umum',
        payment_method: 'Dapur (Pending)',
        items: cart.map(item => ({ name: item.name, price: item.price, qty: item.qty, selectedVariant: item.selectedVariant })),
        notes: transactionNotes,
        status: 'preparing',
        cashier_name: activeCashier || 'Admin'
      };
      const { data, error } = await supabase.from('transactions').insert(transaction).select();
      if (!error) {
        const bc = new BroadcastChannel('kitchen_display');
        bc.postMessage({ type: 'NEW_ORDER', order: data[0] });
        bc.close();
        showToast('Pesanan dikirim ke Dapur!');
        setCart([]);
      }
    } catch (err) {}
  };

  const exportToExcel = () => {
    if (transactions.length === 0) return;
    const dataArr = transactions.map(t => ({ 'Waktu': new Date(t.timestamp).toLocaleString(), 'ID': t.id, 'Pelanggan': t.customerName, 'Total': t.total }));
    const worksheet = XLSX.utils.json_to_sheet(dataArr);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    XLSX.writeFile(workbook, `Laporan_${new Date().toISOString().split('T')[0]}.xlsx`);
  };



  useEffect(() => {
    const channel = new BroadcastChannel('customer_display');
    channel.postMessage({ 
      cart, subtotal, taxAmount, discount, pointsDiscount, total, 
      storeName: settings.storeName, welcomeText: settings.welcomeText,
      customerName, isDark, themeColor: settings.themeColor,
      isCustomerDisplayOn: settings.isCustomerDisplayOn,
      customerViewMode, products, displayTemplate: settings.displayTemplate,
      showReceipt, showQRIS: showQRISModal, qrisData: settings.qrisImage,
      lastTransaction, storeAddress: settings.storeAddress, cashierName: activeCashier
    });
    return () => channel.close();
  }, [cart, settings, customerName, isDark, customerViewMode, products, showReceipt, lastTransaction, showQRISModal, activeCashier, subtotal, taxAmount, discount, pointsDiscount, total]);

  useEffect(() => {
    const findMember = async () => {
      if (memberPhone.length >= 10) {
        const { data } = await supabase.from('members').select('*').eq('phone', memberPhone).maybeSingle();
        setActiveMember(data || null);
      } else setActiveMember(null);
      setUsePoints(false); setPointsToRedeem(0);
    };
    findMember();
  }, [memberPhone]);

  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); document.querySelector('.search-box')?.focus(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h' && activeTab === 'pos') { e.preventDefault(); holdCurrentOrder(); }
      if (e.key === 'Enter') {
        if (dialog) { dialog.onConfirm?.(); setDialog(null); return; }
        if (activeTab === 'pos' && cart.length > 0 && !isProcessing && !showReceipt && !showCashCalc && !showQRISModal) handleCheckout();
      }
      if (e.key === 'Escape') { setDialog(null); setShowCashCalc(false); setShowQRISModal(false); setEditingProduct(null); setProductToSelectVariant(null); setShowReceipt(false); }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [activeTab, cart.length, isProcessing, showReceipt, showCashCalc, total, holdCurrentOrder, handleCheckout, dialog]);

  const handleExit = () => {
    customConfirm('Keluar', 'Apakah Anda yakin ingin keluar dari aplikasi?', () => {
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('quit-app');
      } else {
        window.close();
      }
    });
  };

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    updateSetting('is_dark', newMode);
  };

  if (isInitializing) {
    return (
      <div style={{height: '100vh', width: '100vw', background: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: '120px', height: '120px', marginBottom: '2.5rem'}}>
          <div className="splash-ring" style={{position: 'absolute', inset: 0, border: '4px solid var(--primary)', borderRadius: '40px', opacity: 0.1}}></div>
          <div className="splash-ring-inner" style={{position: 'absolute', inset: '10px', border: '4px solid var(--primary)', borderRadius: '32px', opacity: 0.2}}></div>
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'}}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
        </div>
        <h1 style={{color: 'white', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.5rem'}}>KAZE POS</h1>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.8rem'}}>
          <div className="splash-loader"></div> INITIALIZING SYSTEM
        </div>
        <style>{`
          @keyframes splash-spin { to { transform: rotate(360deg); } }
          .splash-loader { width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: splash-spin 0.8s linear infinite; }
          .splash-ring { animation: pulse 2s infinite ease-in-out; }
          .splash-ring-inner { animation: pulse 2s infinite ease-in-out 0.5s; }
          @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.1; } 50% { transform: scale(1.1); opacity: 0.3; } }
        `}</style>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={{
        height: '100vh', width: '100vw', background: 'var(--bg-app)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '2rem'
      }}>
        <div style={{
          background: 'var(--bg-card)', padding: '3rem', borderRadius: '32px',
          boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
          width: '90%', maxWidth: '400px', textAlign: 'center', animation: 'fadeIn 0.5s ease-out'
        }}>
          <div style={{
            width: '80px', height: '80px', background: 'var(--primary-soft)',
            color: 'var(--primary)', borderRadius: '24px', margin: '0 auto 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <IconStore />
          </div>
          <h1 style={{fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem'}}>Kaze POS</h1>
          <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>Silakan masukkan nama kasir yang bertugas</p>
          
          <input 
            type="text" 
            placeholder="Nama Kasir" 
            autoFocus
            style={{
              width: '100%', padding: '1.2rem', fontSize: '1.1rem', 
              borderRadius: '16px', border: '2px solid var(--border)',
              background: 'var(--bg-app)', color: 'var(--text-main)',
              textAlign: 'center', fontWeight: 700, marginBottom: '1.5rem'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value) handleLogin(e.target.value);
            }}
          />
          
          <button 
            onClick={() => {
              const input = document.querySelector('input[placeholder="Nama Kasir"]');
              if (input.value) handleLogin(input.value);
            }}
            className="btn btn-primary"
            style={{width: '100%', padding: '1.2rem', borderRadius: '16px', fontWeight: 800}}
          >
            MASUK KE SISTEM
          </button>
        </div>
      </div>
    );
  }

  if (isLoggedIn && !activeShift) {
    return (
      <div style={{
        height: '100vh', width: '100vw', background: 'var(--bg-app)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '2rem'
      }}>
        <div style={{
          background: 'var(--bg-card)', padding: '3rem', borderRadius: '32px',
          boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
          width: '90%', maxWidth: '400px', textAlign: 'center', animation: 'fadeIn 0.5s ease-out'
        }}>
          <h2 style={{fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-main)'}}>Mulai Shift</h2>
          <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>Kasir: <span style={{fontWeight: 800, color: 'var(--primary)'}}>{activeCashier}</span></p>
          
          <div style={{textAlign: 'left', marginBottom: '2rem'}}>
            <label style={{display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem'}}>Saldo Awal Laci (Rp)</label>
            <input 
              type="number"
              value={shiftStartCash}
              onChange={e => setShiftStartCash(e.target.value)}
              placeholder="0"
              style={{
                width: '100%', padding: '1rem', fontSize: '1.5rem', fontWeight: 800,
                borderRadius: '16px', border: '2px solid var(--primary)', background: 'var(--bg-app)',
                color: 'var(--text-main)', textAlign: 'center'
              }}
              autoFocus
            />
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <button 
              onClick={forceLogout} 
              style={{flex: 1, padding: '1.2rem', borderRadius: '16px', background: 'var(--bg-app)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer'}}
            >
              Kembali
            </button>
            <button 
              onClick={() => {
                const shift = {
                  id: Date.now(),
                  cashierName: activeCashier,
                  startTime: new Date().toISOString(),
                  startingCash: parseInt(shiftStartCash) || 0
                };
                setActiveShift(shift);
                setShiftStartCash('');
                showToast('Shift berhasil dimulai!');
              }}
              style={{flex: 2, padding: '1.2rem', borderRadius: '16px', background: 'var(--primary)', border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px -5px var(--primary-soft)'}}
            >
              Mulai Shift
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pos-layout">
      {/* Sidebar -  Branding */}
      <aside className="app-sidebar">
        <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} title="Dashboard">
          <IconDashboard />
        </button>
        <button className={`nav-link ${activeTab === 'pos' ? 'active' : ''}`} onClick={() => setActiveTab('pos')} title="Kasir" style={{position: 'relative'}}>
          <IconStore />
          {heldOrders.length > 0 && <div style={{position:'absolute',top:'-4px',right:'-4px',width:'18px',height:'18px',borderRadius:'50%',background:'var(--warning)',color:'white',fontSize:'0.65rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{heldOrders.length}</div>}
        </button>
        <button className={`nav-link ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')} title="Stok">
          <IconBox />
        </button>
        <button className={`nav-link ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')} title="Member">
          <IconUsers />
        </button>
        <button className={`nav-link ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')} title="Histori">
          <IconHistory />
        </button>
        <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', width: '100%'}}>
          <button 
            className={`nav-link ${customerViewMode === 'menu' ? 'active' : ''}`} 
            onClick={() => setCustomerViewMode(prev => prev === 'cart' ? 'menu' : 'cart')} 
            title={customerViewMode === 'cart' ? 'Tampilkan Menu di Layar Pelanggan' : 'Tampilkan Keranjang di Layar Pelanggan'}
            style={{background: customerViewMode === 'menu' ? 'var(--primary)' : 'var(--primary-soft)', color: customerViewMode === 'menu' ? 'white' : 'var(--primary)'}}
          >
            <IconMenu />
          </button>
          <button className="nav-link" onClick={toggleDarkMode} style={{background: 'var(--primary-soft)', color: 'var(--primary)'}}>
            {isDark ? <IconSun /> : <IconMoon />}
          </button>
          <button className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} title="Pengaturan">
            <IconSettings />
          </button>
          
          <div style={{width: '70%', height: '1px', background: 'var(--border)', margin: '0.5rem 0'}}></div>

          <button className="nav-link" onClick={handleLogout} title="Ganti Kasir (Shift Change)" style={{color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)'}}>
            <IconUsers />
          </button>
          <button className="nav-link" onClick={handleExit} title="Keluar Aplikasi" style={{color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)'}}>
            <IconPower />
          </button>

          <div style={{marginTop: '1rem', padding: '0.8rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', width: 'calc(100% - 1rem)', textAlign: 'center'}}>
            <div style={{fontWeight: 800, fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)'}}>{activeCashier}</div>
            <div style={{fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 700}}>Kaze POS</div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard settings={settings} />}

        {activeTab === 'pos' && (
          <>
            <header className="header-minimal">
              <div>
                <h1>{settings.store_name}</h1>
                <p style={{color: 'var(--text-muted)'}}>{settings.storeAddress}</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                <input 
                  type="text" 
                  placeholder="Cari produk... (Ctrl+K)" 
                  className="search-box"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </header>
            {heldOrders.length > 0 && (
              <div className="held-orders-bar">
                {heldOrders.map(h => (
                  <div key={h.id} className="held-order-chip" onClick={() => resumeOrder(h.id)}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}><Pause size={14} /> {h.customerName}</span>
                    <span style={{opacity:0.7}}>Rp {h.total.toLocaleString()}</span>
                    <button onClick={e => {e.stopPropagation();removeHeldOrder(h.id)}} style={{background:'transparent',border:'none',color:'var(--danger)',fontWeight:800,cursor:'pointer',padding:'0 4px',display:'flex',alignItems:'center'}}><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}

              <div style={{display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem'}} className="hide-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '0.8rem 1.5rem',
                      borderRadius: '12px',
                      whiteSpace: 'nowrap',
                      fontWeight: 700,
                      background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                      color: selectedCategory === cat ? 'white' : 'var(--text-main)',
                      border: '1px solid var(--border)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="product-showcase">
                {(() => {
                  const filtered = products
                    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
                    .filter(p => selectedCategory === 'Semua' || (p.category && p.category.split(',').map(c => c.trim()).includes(selectedCategory)));

                  if (filtered.length === 0) {
                    return (
                      <div style={{
                        gridColumn: '1 / -1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8rem 2rem',
                        background: 'var(--bg-card)',
                        borderRadius: '32px',
                        border: '2px dashed var(--border)',
                        textAlign: 'center',
                        gap: '1.5rem'
                      }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          background: 'var(--primary-soft)',
                          color: 'var(--primary)',
                          borderRadius: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: 'scale(1.5)'
                        }}>
                          <IconBox />
                        </div>
                        <div>
                          <h3 style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem'}}>
                            {products.length === 0 ? 'Belum Ada Produk' : 'Produk Tidak Ditemukan'}
                          </h3>
                          <p style={{color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '300px', margin: '0 auto'}}>
                            {products.length === 0 
                              ? 'Silahkan tambahkan produk baru di menu Stok untuk mulai berjualan.' 
                              : `Tidak ada hasil untuk "${search}" di kategori ini.`}
                          </p>
                        </div>
                        {products.length === 0 && (
                          <button 
                            onClick={() => setActiveTab('stock')}
                            style={{
                              marginTop: '1rem',
                              padding: '0.8rem 2rem',
                              background: 'var(--primary)',
                              color: 'white',
                              borderRadius: '12px',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Buka Menu Stok
                          </button>
                        )}
                      </div>
                    );
                  }

                  return filtered.map(p => (
                    <div key={p.id} className="product-card" onClick={() => {
                      if (p.variants && p.variants.trim() !== '') {
                        setProductToSelectVariant(p);
                      } else {
                        addToCart(p);
                      }
                    }}>
                      <div className="p-avatar" style={{background: p.stock < 10 ? '#ef4444' : 'var(--primary-soft)', color: p.stock < 10 ? 'white' : 'var(--primary)', overflow: 'hidden'}}>
                        {p.stock < 10 ? <IconAlert /> : (p.image ? <img src={p.image} alt={p.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : p.name.charAt(0))}
                      </div>
                      <div className="p-info">
                        <span className="p-title">{p.name}</span>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem'}}>
                          <IconTag />
                          <span style={{fontSize: '0.8rem', opacity: 0.6}}>{p.category || 'Tanpa Kategori'}</span>
                        </div>
                        <span className="p-val">Rp {p.price.toLocaleString()}</span>
                        <span style={{fontSize: '0.8rem', color: p.stock < 10 ? '#ef4444' : 'var(--text-muted)', fontWeight: p.stock < 10 ? 700 : 400}}>
                          Stok: {p.stock} {p.stock < 10 ? '(Menipis!)' : ''}
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div style={{background: 'var(--bg-card)', padding: '3rem', borderRadius: '32px', flex: 1, boxShadow: 'var(--shadow-main)', overflowY: 'auto'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h2 style={{fontSize: '2rem'}}>Histori Penjualan</h2>
                <button 
                  onClick={exportToExcel}
                  style={{background: 'var(--primary-soft)', color: 'var(--primary)', padding: '0.8rem 1.5rem', fontWeight: 700, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                >
                  <Download size={18} /> Ekspor ke Excel (.xlsx)
                </button>
              </div>
              <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', minWidth: '600px'}}>
                <thead>
                  <tr style={{textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase'}}>
                    <th style={{padding: '0 1.5rem'}}>Waktu & Metode</th>
                    <th>ID Pesanan</th>
                    <th>Pelanggan</th>
                    <th>Total Bayar</th>
                    <th style={{textAlign: 'right', paddingRight: '1.5rem'}}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} style={{background: 'var(--bg-app)'}}>
                      <td style={{padding: '1.5rem', borderRadius: '16px 0 0 16px'}}>
                        <div style={{fontWeight: 600}}>{new Date(t.timestamp).toLocaleString()}</div>
                        <div style={{fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700}}>{t.payment_method || 'Cash'}</div>
                      </td>
                    <td style={{fontFamily: 'monospace'}}>#transaction-{t.id}</td>
                    <td style={{fontWeight: 600}}>{t.customerName} {t.memberId ? '(Member)' : ''}</td>
                    <td style={{fontWeight: 700, color: 'var(--primary)'}}>Rp {t.total.toLocaleString()}</td>
                    <td style={{textAlign: 'right', borderRadius: '0 16px 16px 0', paddingRight: '1.5rem'}}>
                      <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                        <button 
                          title="Lihat Struk"
                          style={{background: 'var(--primary-soft)', color: 'var(--primary)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'all 0.2s'}}
                          onClick={() => {
                            setLastTransaction(t);
                            setShowReceipt(true);
                          }}
                          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <IconEye />
                        </button>
                        <button className="btn-circle" style={{color: '#ef4444'}} onClick={() => {
                          customConfirm('Hapus Transaksi', 'Hapus transaksi ini?', async () => {
                            await supabase.from('transactions').delete().eq('id', t.id);
                            fetchTransactions();
                          });
                        }}>
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '4rem', color: 'var(--text-muted)'}}>Belum ada data transaksi.</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {activeTab === 'stock' && (
          <div style={{background: 'var(--bg-card)', padding: '3rem', borderRadius: '32px', flex: 1, boxShadow: 'var(--shadow-main)', overflowY: 'auto'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
              <h2 style={{fontSize: '2rem'}}>Manajemen Stok Barang</h2>
              <div style={{display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
                {products.some(p => p.stock < 10) && (
                  <div style={{background: '#fef2f2', color: '#ef4444', padding: '1rem 2rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #fee2e2'}}>
                    <IconAlert />
                    <span style={{fontWeight: 700}}>Peringatan: {products.filter(p => p.stock < 10).length} Produk Hampir Habis!</span>
                  </div>
                )}
                <button
                  onClick={exportMenu}
                  style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.8rem 1.5rem',background:'var(--primary-soft)',color:'var(--primary)',border:'1px solid var(--primary)',borderRadius:'14px',fontWeight:700,cursor:'pointer',fontSize:'0.9rem'}}
                >
                  <Download size={16} /> Export JSON
                </button>
                <label style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.8rem 1.5rem',background:'var(--success-soft,rgba(34,197,94,0.1))',color:'var(--success,#22c55e)',border:'1px solid var(--success,#22c55e)',borderRadius:'14px',fontWeight:700,cursor:'pointer',fontSize:'0.9rem'}}>
                  <Upload size={16} /> Import JSON
                  <input type="file" accept=".json" onChange={importMenu} style={{display:'none'}} />
                </label>
              </div>
            </div>
            <div style={{marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center'}}>
              <input 
                type="text" 
                placeholder="Cari produk di stok (Nama / Kategori)..." 
                value={stockSearch}
                onChange={e => setStockSearch(e.target.value)}
                style={{flex: 1, minWidth: '250px', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '1rem'}}
              />
              <button
                onClick={() => setShowAddProduct(true)}
                style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'1rem 2rem',background:'var(--primary)',color:'white',borderRadius:'16px',fontWeight:800,cursor:'pointer',fontSize:'1.1rem',border:'none',boxShadow:'var(--shadow-main)'}}
              >
                + Tambah Produk Baru
              </button>
              <button
                onClick={() => {
                  if (products.length === 0) return;
                  customPrompt('Hapus Semua Menu', 'Apakah Anda yakin ingin menghapus semua produk? Tindakan ini tidak dapat dibatalkan.', 'Hapus Semua Menu', async () => {
                    const { error } = await supabase.from('products').delete().not('id', 'is', null);
                    if (!error) {
                      fetchProducts();
                      showToast('Semua menu berhasil dihapus!');
                    } else {
                      showToast('Gagal menghapus menu.', 'error');
                    }
                  });
                }}
                style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'1rem 2rem',background:'var(--danger-soft, #fef2f2)',color:'var(--danger, #ef4444)',borderRadius:'16px',fontWeight:800,cursor:'pointer',fontSize:'1.1rem',border:'1px solid var(--danger, #ef4444)',boxShadow:'var(--shadow-main)'}}
              >
                <IconTrash /> Hapus Semua
              </button>
            </div>
            
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', minWidth: '600px'}}>
              <thead>
                <tr style={{textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase'}}>
                  <th style={{padding: '0 1.5rem'}}>Produk & Kategori</th>
                  <th>Nilai Jual</th>
                  <th>Stok Tersedia</th>
                  <th style={{textAlign: 'right', paddingRight: '1.5rem'}}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter(p => p.name.toLowerCase().includes(stockSearch.toLowerCase()) || (p.category && p.category.toLowerCase().includes(stockSearch.toLowerCase())))
                  .map(p => (
                  <tr key={p.id} style={{background: 'var(--bg-app)'}}>
                    <td style={{padding: '1.5rem', borderRadius: '16px 0 0 16px'}}>
                      <div style={{fontWeight: 700}}>{p.name}</div>
                      <div style={{fontSize: '0.8rem', opacity: 0.6}}>
                        {p.category || 'Tanpa Kategori'} 
                        {p.variants && <span style={{marginLeft: '0.5rem', color: 'var(--primary)', fontWeight: 700}}>• {p.variants}</span>}
                      </div>
                    </td>
                    <td style={{fontWeight: 700}}>Rp {p.price.toLocaleString()}</td>
                    <td style={{color: p.stock < 10 ? '#ef4444' : 'inherit'}}>{p.stock}</td>
                    <td style={{textAlign: 'right', borderRadius: '0 16px 16px 0', paddingRight: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center', height: '80px'}}>
                      <button 
                        style={{background: 'var(--primary-soft)', color: 'var(--primary)', padding: '0.5rem 1rem'}} 
                        onClick={() => setEditingProduct(p)}
                      >
                        Edit
                      </button>
                      <button style={{color: '#ef4444', background: '#fef2f2', padding: '0.5rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700}} onClick={() => {
                        customConfirm('Hapus Produk', 'Hapus produk ini?', async () => {
                          await supabase.from('products').delete().eq('id', p.id);
                          fetchProducts();
                        });
                      }}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div style={{background: 'var(--bg-card)', padding: '3rem', borderRadius: '32px', flex: 1, boxShadow: 'var(--shadow-main)', overflowY: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
              <h2 style={{fontSize: '2rem'}}>Manajemen Member</h2>
              <input 
                type="text" 
                placeholder="Cari nama atau nomor HP member..." 
                className="search-box"
                style={{width: '350px'}}
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
              />
            </div>
            
            <form className="responsive-form" style={{marginBottom: '4rem'}} onSubmit={async (e) => {
              e.preventDefault();
              const { error } = await supabase.from('members').insert({ ...memberFormData });
              if (!error) {
                setMemberFormData({ name: '', phone: '' }); 
                fetchMembers();
                showToast('Member baru berhasil didaftarkan!');
              } else {
                showToast('Gagal daftar member (Mungkin nomor HP sudah ada)', 'error');
              }
            }}>
              <input 
                style={{flex: 1, padding: '1.2rem', fontSize: '1.1rem', fontWeight: 600}} 
                placeholder="Nama Lengkap Member" 
                value={memberFormData.name} 
                onChange={e => setMemberFormData({...memberFormData, name: e.target.value})} 
                required
              />
              <input 
                style={{flex: 1, padding: '1.2rem', fontSize: '1.1rem'}} 
                placeholder="Nomor Telepon / WhatsApp" 
                value={memberFormData.phone} 
                onChange={e => setMemberFormData({...memberFormData, phone: e.target.value})} 
                required
              />
              <button 
                type="submit" 
                style={{background: 'var(--primary)', color: 'white', padding: '0 2.5rem', fontWeight: 700}}
              >
                DAFTAR MEMBER
              </button>
            </form>

            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', minWidth: '600px'}}>
              <thead>
                <tr style={{textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase'}}>
                  <th style={{padding: '0 1.5rem'}}>Nama Member</th>
                  <th>Nomor HP</th>
                  {isPointsEnabled && <th>Poin</th>}
                  <th style={{textAlign: 'right', paddingRight: '1.5rem'}}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {members.filter(m => 
                  m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
                  m.phone.includes(memberSearch)
                ).map(m => (
                  <tr key={m.id} style={{background: 'var(--bg-app)'}}>
                    <td style={{padding: '1.5rem', borderRadius: '16px 0 0 16px', fontWeight: 600}}>{m.name}</td>
                    <td style={{fontWeight: 700}}>{m.phone}</td>
                    {isPointsEnabled && (
                      <td>
                        <span style={{
                          background: 'var(--primary-soft)', color: 'var(--primary)',
                          padding: '4px 10px', borderRadius: '8px', fontWeight: 800, fontSize: '0.9rem'
                        }}>
                          ⭐ {parseInt(m.points) || 0}
                        </span>
                      </td>
                    )}
                    <td style={{textAlign: 'right', borderRadius: '0 16px 16px 0', paddingRight: '1.5rem'}}>
                      <button style={{color: '#ef4444', background: '#fef2f2', padding: '0.5rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700}} onClick={() => {
                        customConfirm('Hapus Member', 'Hapus member ini?', async () => {
                          await supabase.from('members').delete().eq('id', m.id);
                          fetchMembers();
                        });
                      }}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <Settings
            settings={settings}
            updateSetting={updateSetting}
            rgb={rgb}
            setRgb={setRgb}
            isRgbUserChange={isRgbUserChange}
            rgbToHex={rgbToHex}
            hexToRgb={hexToRgb}
            appVersion={pkg.version}
            isCheckingUpdate={isCheckingUpdate}
            setIsCheckingUpdate={setIsCheckingUpdate}
            updateMessage={updateMessage}
            setUpdateMessage={setUpdateMessage}
          />
        )}
      </main>

      {/* Checkout Sidebar  (Show only during POS) */}
      {activeTab === 'pos' && (
        <aside className="checkout-sidebar" key={checkoutKey}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 700}}>Detail Pesanan</h2>
          
          <div className="order-list">
            {cart.length === 0 ? (
              <div style={{textAlign: 'center', marginTop: '6rem', opacity: 0.2, animation: 'fadeIn 0.5s ease-out'}}>
                <div style={{marginBottom: '1.5rem', display: 'flex', justifyContent: 'center'}}>
                  <IconCart size={80} />
                </div>
                <p style={{fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)'}}>Keranjang masih kosong</p>
                <p style={{fontSize: '0.85rem', marginTop: '0.5rem'}}>Pilih produk di sebelah kiri untuk memulai</p>
              </div>
            ) : (
               cart.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="item-row">
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: 600}}>
                      {item.name}
                      {item.selectedVariant && <span style={{color: 'var(--primary)', marginLeft: '0.4rem'}}>({item.selectedVariant})</span>}
                    </div>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Rp {item.price.toLocaleString()}</div>
                  </div>
                  <div className="item-qty-pill">
                    <button className="btn-circle" onClick={() => updateQty(item.id, item.selectedVariant, -1)}>-</button>
                    <span style={{fontWeight: 700, minWidth: '20px', textAlign: 'center'}}>{item.qty}</span>
                    <button className="btn-circle" onClick={() => updateQty(item.id, item.selectedVariant, 1)}>+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
            <div>
              <p style={{fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)'}}>CASHIER</p>
              <input 
                type="text" 
                placeholder="Nama Kasir" 
                style={{width: '100%', padding: '0.7rem', fontSize: '0.9rem', borderRadius: '10px', }}
                value={activeCashier}
                onChange={e => setActiveCashier(e.target.value)}
                disabled
              />
            </div>
            <div>
              <p style={{fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)'}}>CAPTAIN</p>
              <input 
                type="text" 
                placeholder="Waiter / Cap" 
                style={{width: '100%', padding: '0.7rem', fontSize: '0.9rem', borderRadius: '10px'}}
                value={activeCaptain}
                onChange={e => setActiveCaptain(e.target.value)}
              />
            </div>
          </div>

          <div style={{marginBottom: '1rem'}}>
            <p style={{fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.6rem', color: 'var(--text-muted)'}}>NAMA PELANGGAN</p>
            <input 
              type="text" 
              placeholder="Nama Pelanggan " 
              style={{width: '100%', padding: '0.8rem', fontSize: '1rem', borderRadius: '12px'}}
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>

          <div style={{marginBottom: '1rem'}}>
            <p style={{fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.6rem', color: 'var(--text-muted)'}}>NOMOR MEMBER (HP)</p>
            <div style={{position: 'relative'}}>
              <input 
                type="text" 
                placeholder="Cari No. HP Member..." 
                style={{width: '100%', padding: '0.8rem', fontSize: '1rem', border: activeMember ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px'}}
                value={memberPhone}
                onChange={e => setMemberPhone(e.target.value)}
              />
              {activeMember && (
                <div style={{
                  position: 'absolute', 
                  right: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  background: 'var(--primary)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 10px var(--primary-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Check size={12} /> {activeMember.name}
                </div>
              )}
            </div>
          </div>

          <div style={{marginBottom: '1rem'}}>
            <p style={{fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.6rem', color: 'var(--text-muted)'}}>CATATAN PESANAN</p>
            <textarea
              placeholder="Tambahkan catatan..."
              style={{width:'100%',padding:'0.8rem',fontSize:'0.9rem',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-app)',color:'var(--text-main)',resize:'none',height:'60px',fontFamily:'inherit'}}
              value={transactionNotes}
              onChange={e => setTransactionNotes(e.target.value)}
            />
          </div>

          <div style={{marginBottom: '2rem'}}>
            <p style={{fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)'}}>METODE PEMBAYARAN</p>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem'}}>
              {[
                { name: 'Cash', icon: <IconStore /> },
                { name: 'QRIS', icon: <IconQR /> },
                { name: 'Debit', icon: <IconCreditCard /> }
              ].map(m => (
                <button
                  key={m.name}
                  onClick={() => {
                    setPaymentMethod(m.name);
                    if (m.name !== 'QRIS') setShowQRISModal(false);
                  }}
                  style={{
                    padding: '1rem 0',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: paymentMethod === m.name ? 'var(--primary-soft)' : 'var(--bg-app)',
                    border: paymentMethod === m.name ? '2px solid var(--primary)' : '1px solid var(--border)',
                    color: paymentMethod === m.name ? 'var(--primary)' : 'var(--text-main)',
                    transition: 'all 0.2s'
                  }}
                >
                  {m.icon}
                  <span style={{fontSize: '0.75rem', fontWeight: 700}}>{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bill-summary">
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem'}}>
              <span>Subtotal</span>
              <span style={{fontWeight: 600}}>Rp {subtotal.toLocaleString()}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem'}}>
              <span>Pajak ({currentTaxRate}%)</span>
              <span style={{fontWeight: 600}}>Rp {taxAmount.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div style={{display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontSize: '0.9rem'}}>
                <span>Diskon Member ({currentMemberDiscount}%)</span>
                <span>-Rp {discount.toLocaleString()}</span>
              </div>
            )}
            {/* Points Section */}
            {isPointsEnabled && activeMember && (
              <div style={{marginTop: '0.5rem', padding: '0.8rem', background: 'var(--primary-soft)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                  <span style={{fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)'}}>⭐ Poin Member: {maxRedeemable} poin</span>
                  <button
                    onClick={() => {
                      const newUse = !usePoints;
                      setUsePoints(newUse);
                      if (newUse) {
                        // Auto-set max redeemable (limited by total after discount)
                        const maxByTotal = Math.floor((subtotal + taxAmount - discount) / pointsValue);
                        setPointsToRedeem(Math.min(maxRedeemable, maxByTotal));
                      } else {
                        setPointsToRedeem(0);
                      }
                    }}
                    style={{
                      padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800,
                      background: usePoints ? 'var(--primary)' : 'var(--bg-card)',
                      color: usePoints ? 'white' : 'var(--primary)',
                      border: '1px solid var(--primary)', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {usePoints ? 'AKTIF ✓' : 'TUKAR POIN'}
                  </button>
                </div>
                {usePoints && maxRedeemable > 0 && (
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <input
                        type="range"
                        min={0}
                        max={Math.min(maxRedeemable, Math.floor((subtotal + taxAmount - discount) / pointsValue))}
                        value={pointsToRedeem}
                        onChange={e => setPointsToRedeem(parseInt(e.target.value) || 0)}
                        style={{flex: 1, accentColor: 'var(--primary)'}}
                      />
                      <span style={{fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', minWidth: '60px', textAlign: 'right'}}>
                        {pointsToRedeem} poin
                      </span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem'}}>
                      <span>Potongan</span>
                      <span style={{fontWeight: 700, color: 'var(--success)'}}>-Rp {pointsDiscount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                {earnedPoints > 0 && (
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem'}}>
                    ✨ Akan mendapat <strong style={{color: 'var(--primary)'}}>+{earnedPoints} poin</strong> dari transaksi ini
                  </div>
                )}
              </div>
            )}
            <div style={{marginTop: '1rem', marginBottom: '1.5rem'}}>
              <span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>Grand Total</span>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                 <span className="grand-total" style={{fontSize: '2.5rem'}}>Rp {total.toLocaleString()}</span>
              </div>
            </div>
            <button className="btn-checkout" onClick={handleCheckout} style={{
              height: '80px', 
              fontSize: '1.2rem',
              background: showQRISModal ? '#22c55e' : 'var(--primary)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.2rem'
            }}>
              {showQRISModal ? (
                <>
                  <span style={{fontSize: '1.4rem'}}>KONFIRMASI SUDAH BAYAR</span>
                  <span style={{fontSize: '0.8rem', opacity: 0.8}}>(Klik jika pelanggan sudah scan & bayar)</span>
                </>
              ) : (
                `BAYAR SEKARANG (${paymentMethod})`
              )}
            </button>
            {cart.length > 0 && (
              <div style={{marginTop: '0.75rem'}}>
                <button
                  onClick={holdCurrentOrder}
                  style={{padding:'0.8rem',width:'100%',background:'var(--warning-soft,rgba(245,158,11,0.1))',color:'var(--warning,#f59e0b)',fontWeight:700,border:'1px solid var(--warning,#f59e0b)',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem',cursor:'pointer'}}
                >
                  <Pause size={18} /> TAHAN (Ctrl+H)
                </button>
              </div>
            )}
            {showQRISModal && (
              <button 
                onClick={() => setShowQRISModal(false)}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '1rem',
                  background: 'transparent',
                  color: '#ef4444',
                  fontWeight: 700,
                  border: '1px solid #ef444433',
                  borderRadius: '16px'
                }}
              >
                BATALKAN QRIS
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Modal Cetak Struk */}
      {showReceipt && lastTransaction && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'}}>
          <div style={{background: 'white', color: 'black', width: '90%', maxWidth: '400px', padding: '3rem', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'center'}}>
            <div style={{fontFamily: 'monospace'}}>
              <h2 style={{fontSize: '1.5rem', fontWeight: 800}}>{settings.store_name}</h2>
              <p style={{fontSize: '0.8rem', marginBottom: '2rem'}}>{settings.store_address}</p>
              
              <div style={{textAlign: 'left', borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '1.5rem 0', margin: '1.5rem 0'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem'}}>
                  <span>ID Transaksi:</span>
                  <span>#transaction-{lastTransaction.id}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem'}}>
                  <span>Nama Customer:</span>
                  <span>{lastTransaction.customerName}<span style={{color: '#aaa', fontFamily: 'monospace'}}>#{lastTransaction.id?.slice(0,4).toUpperCase()}</span></span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.8rem'}}>
                  <span>Waktu:</span>
                  <span>{new Date(lastTransaction.timestamp).toLocaleString()}</span>
                </div>
                
                {lastTransaction.items?.map((item, idx) => (
                  <div key={idx} style={{marginBottom: '0.5rem'}}>
                    <div style={{fontWeight: 700}}>
                      {item.name}
                      {item.variant && <span style={{marginLeft: '0.3rem'}}>({item.variant})</span>}
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem'}}>
                      <span>{item.qty} x {item.price.toLocaleString()}</span>
                      <span>{(item.qty * item.price).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{textAlign: 'right', gap: '0.5rem', display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span>Total:</span>
                  <span style={{fontWeight: 800, fontSize: '1.2rem'}}>Rp {lastTransaction.total.toLocaleString()}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem'}}>
                  <span>Metode:</span>
                  <span>{lastTransaction.payment_method}</span>
                </div>
              </div>

              <div style={{marginTop: '3rem', fontSize: '0.8rem'}}>
                --- Terima Kasih ---
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem', marginTop: '3rem'}}>
              <button 
                onClick={() => window.print()} 
                style={{flex: 2, padding: '1.2rem', background: '#000', color: '#fff', borderRadius: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem'}}
              >
                <IconPrinter /> CETAK STRUK
              </button>
              <button 
                onClick={() => setShowReceipt(false)}
                style={{flex: 1, padding: '1.2rem', background: '#f3f4f6', color: '#000', borderRadius: '16px', fontWeight: 700}}
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{background: 'var(--bg-card)', width: '90%', maxWidth: '500px', padding: '3rem', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'}}>
            <h2 style={{fontSize: '2rem', marginBottom: '2rem'}}>Tambah Produk Baru</h2>
            <form onSubmit={handleAddProduct} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)'}}>NAMA PRODUK</label>
                <input 
                  style={{padding: '1.2rem'}}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)'}}>KATEGORI</label>
                <input 
                  style={{padding: '1.2rem'}}
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  required
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)'}}>HARGA JUAL</label>
                <input 
                  type="number"
                  style={{padding: '1.2rem'}}
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)'}}>STOK TERSEDIA</label>
                <input 
                  type="number"
                  style={{padding: '1.2rem'}}
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                  required
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)'}}>VARIAN (PISAHKAN DENGAN KOMA)</label>
                <input 
                  style={{padding: '1.2rem'}}
                  value={formData.variants}
                  onChange={e => setFormData({...formData, variants: e.target.value})}
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)'}}>URL GAMBAR (OPSIONAL)</label>
                <input 
                  style={{padding: '1.2rem'}}
                  value={formData.image || ''}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                />
              </div>
              <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                <button 
                  type="button" 
                  onClick={() => setShowAddProduct(false)}
                  style={{flex: 1, padding: '1.2rem', background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 700}}
                >
                  BATAL
                </button>
                <button 
                  type="submit" 
                  style={{flex: 2, padding: '1.2rem', background: 'var(--primary)', color: 'white', fontWeight: 700}}
                >
                  TAMBAH PRODUK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End Shift Modal */}
      {showEndShiftModal && activeShift && (() => {
        const summary = getShiftSummary();
        return (
          <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{background: 'var(--bg-card)', width: '90%', maxWidth: '500px', padding: '3rem', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'}}>
              <h2 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>Akhiri Shift</h2>
              <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>Kasir: <span style={{fontWeight: 800, color: 'var(--primary)'}}>{activeShift.cashierName}</span></p>
              
              <div style={{background: 'var(--bg-app)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                  <span style={{color: 'var(--text-muted)'}}>Saldo Awal:</span>
                  <span style={{fontWeight: 700}}>Rp {(activeShift.startingCash || 0).toLocaleString()}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                  <span style={{color: 'var(--text-muted)'}}>Pemasukan Tunai:</span>
                  <span style={{fontWeight: 700, color: 'var(--success)'}}>+ Rp {(summary?.totalCash || 0).toLocaleString()}</span>
                </div>
                <div style={{height: '1px', background: 'var(--border)', margin: '1rem 0'}}></div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{fontWeight: 700, fontSize: '1.1rem'}}>Saldo Akhir (Sistem):</span>
                  <span style={{fontWeight: 900, fontSize: '1.2rem', color: 'var(--primary)'}}>Rp {(summary?.expectedCash || 0).toLocaleString()}</span>
                </div>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem'}}>
                <label style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)'}}>UANG FISIK AKTUAL (DI LACI)</label>
                <input 
                  type="number"
                  style={{padding: '1.2rem', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', borderRadius: '12px', border: '2px solid var(--border)'}}
                  value={shiftActualCash}
                  onChange={e => setShiftActualCash(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem'}}>
                <label style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)'}}>CATATAN SHIFT (OPSIONAL)</label>
                <textarea 
                  style={{padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', resize: 'none', height: '80px', fontFamily: 'inherit'}}
                  value={shiftNotes}
                  onChange={e => setShiftNotes(e.target.value)}
                  placeholder="Misal: Uang receh kurang..."
                />
              </div>

              <div style={{display: 'flex', gap: '1rem'}}>
                <button 
                  onClick={() => setShowEndShiftModal(false)}
                  style={{flex: 1, padding: '1.2rem', background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 700, borderRadius: '16px', border: 'none', cursor: 'pointer'}}
                >
                  BATAL
                </button>
                <button 
                  onClick={handleEndShift}
                  style={{flex: 2, padding: '1.2rem', background: 'var(--danger)', color: 'white', fontWeight: 800, borderRadius: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(239,68,68,0.3)'}}
                >
                  AKHIRI & LOGOUT
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Modal  */}
      {editingProduct && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{background: 'var(--bg-card)', width: '90%', maxWidth: '500px', padding: '3rem', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'}}>
            <h2 style={{fontSize: '2rem', marginBottom: '2rem'}}>Edit Produk</h2>
            <form onSubmit={handleUpdateProduct} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)'}}>NAMA PRODUK</label>
                <input 
                  style={{padding: '1.2rem'}}
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  required
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)'}}>KATEGORI</label>
                <input 
                  style={{padding: '1.2rem'}}
                  value={editingProduct.category || ''}
                  onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)'}}>HARGA JUAL</label>
                <input 
                  type="number"
                  style={{padding: '1.2rem'}}
                  value={editingProduct.price}
                  onChange={e => setEditingProduct({...editingProduct, price: e.target.value})}
                  required
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)'}}>STOK TERSEDIA</label>
                <input 
                  type="number"
                  style={{padding: '1.2rem'}}
                  value={editingProduct.stock}
                  onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})}
                  required
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)'}}>VARIAN (PISAHKAN DENGAN KOMA)</label>
                <input 
                  style={{padding: '1.2rem'}}
                  value={editingProduct.variants || ''}
                  onChange={e => setEditingProduct({...editingProduct, variants: e.target.value})}
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)'}}>URL GAMBAR (OPSIONAL)</label>
                <input 
                  style={{padding: '1.2rem'}}
                  value={editingProduct.image || ''}
                  onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                />
              </div>
              <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)}
                  style={{flex: 1, padding: '1.2rem', background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 700}}
                >
                  BATAL
                </button>
                <button 
                  type="submit" 
                  style={{flex: 2, padding: '1.2rem', background: 'var(--primary)', color: 'white', fontWeight: 700}}
                >
                  SIMPAN PERUBAHAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Variant Selection Modal */}
      {productToSelectVariant && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{background: 'var(--bg-card)', width: '450px', padding: '3rem', borderRadius: '32px', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', border: '1px solid var(--border)'}}>
            <div style={{width: '60px', height: '60px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'}}>
               <IconTag />
            </div>
            <h2 style={{fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem'}}>Pilih Varian</h2>
            <p style={{color: 'var(--text-muted)', marginBottom: '2.5rem'}}>{productToSelectVariant.name}</p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {productToSelectVariant.variants.split(',').map(variant => (
                <button 
                  key={variant}
                  onClick={() => addToCart(productToSelectVariant, variant.trim())}
                  style={{
                    padding: '1.2rem',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                >
                  {variant.trim()}
                </button>
              ))}
              <button 
                onClick={() => setProductToSelectVariant(null)}
                style={{marginTop: '1rem', padding: '1rem', background: 'transparent', color: 'var(--text-muted)', border: 'none', fontWeight: 600, cursor: 'pointer'}}
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Update Notification Banner */}
      {updateInfo && (
        <div style={{
          position: 'fixed', bottom: '30px', left: '100px', zIndex: 9999,
          background: 'var(--bg-card)', color: 'var(--text-main)', padding: '1.5rem',
          borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          width: '90%', maxWidth: '400px', border: '2px solid var(--primary)',
          display: 'flex', gap: '1.5rem', alignItems: 'center',
          animation: 'slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{width: '60px', height: '60px', background: 'var(--primary)', color: 'white', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <IconPower />
          </div>
          <div style={{flex: 1}}>
            <div style={{fontWeight: 800, fontSize: '1.1rem'}}>
              {updateStatus === 'available' && `Update v${updateInfo.version || ''} Tersedia!`}
              {updateStatus === 'downloading' && 'Mengunduh Pembaruan...'}
              {updateStatus === 'ready' && 'Pembaruan Siap Dipasang!'}
            </div>
            <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem'}}>
              {updateStatus === 'available' && (updateInfo.changelog || 'Pembaruan sistem terbaru untuk performa yang lebih baik.')}
              {updateStatus === 'downloading' && 'Mohon tunggu sebentar, aplikasi sedang mengunduh versi terbaru.'}
              {updateStatus === 'ready' && 'Aplikasi perlu dimulai ulang untuk menerapkan pembaruan.'}
            </div>
            <div style={{display: 'flex', gap: '0.8rem'}}>
              {updateStatus === 'available' && (
                <button 
                  onClick={startUpdateDownload}
                  style={{flex: 1, padding: '0.6rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'}}
                >
                  Download & Install
                </button>
              )}
              {updateStatus === 'downloading' && (
                <button 
                  disabled
                  style={{flex: 1, padding: '0.6rem', background: 'var(--primary-soft)', color: 'var(--primary)', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', opacity: 0.7}}
                >
                  Downloading...
                </button>
              )}
              {updateStatus === 'ready' && (
                <button 
                  onClick={restartAndInstall}
                  style={{flex: 1, padding: '0.6rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'}}
                >
                  Restart & Update
                </button>
              )}
              <button 
                onClick={() => setUpdateInfo(null)}
                style={{padding: '0.6rem 1rem', background: 'var(--bg-app)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'}}
              >
                Nanti
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Cash Calculator Modal */}
      {showCashCalc && (
        <CashCalculator
          total={total}
          onConfirm={(cashAmount, change) => {
            setShowCashCalc(false);
            handleCheckout();
          }}
          onClose={() => { setShowCashCalc(false); setIsProcessing(false); }}
        />
      )}
      {/* Toast Notification  */}
      {toast && (
        <div style={{
          position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10000, background: 'var(--bg-card)', padding: '1rem 2rem',
          borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          border: `1px solid ${toast.type === 'success' ? '#22c55e' : '#ef4444'}`,
          display: 'flex', alignItems: 'center', gap: '1rem',
          animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: toast.type === 'success' ? '#22c55e' : '#ef4444',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {toast.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
          </div>
          <span style={{fontWeight: 700, color: 'var(--text-main)'}}>{toast.message}</span>
        </div>
      )}
      {/* Custom Dialog (Alert/Confirm) */}
      {dialog && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10001,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '32px',
            border: '1px solid var(--border)', boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
            width: '90%', maxWidth: '400px', textAlign: 'center', animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px', 
              background: dialog.type === 'confirm' ? 'var(--primary-soft)' : 'var(--danger-soft)',
              color: dialog.type === 'confirm' ? 'var(--primary)' : 'var(--danger)',
              margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {dialog.type === 'confirm' ? <Check size={32} /> : <AlertTriangle size={32} />}
            </div>
            <h3 style={{fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)'}}>{dialog.title}</h3>
            <p style={{color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.5}}>{dialog.message}</p>
            
            {dialog.type === 'prompt' && (
              <div style={{marginBottom: '2rem'}}>
                <input 
                  autoFocus
                  placeholder={`Ketik "${dialog.requiredText}"`}
                  value={promptValue}
                  onChange={e => setPromptValue(e.target.value)}
                  style={{width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center', fontSize: '1rem', fontWeight: 600, background: 'var(--bg-app)', color: 'var(--text-main)'}}
                />
              </div>
            )}

            <div style={{display: 'flex', gap: '1rem'}}>
              {(dialog.type === 'confirm' || dialog.type === 'prompt') && (
                <button 
                  onClick={() => setDialog(null)}
                  style={{flex: 1, padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer'}}
                >
                  BATAL
                </button>
              )}
              <button 
                disabled={dialog.type === 'prompt' && promptValue !== dialog.requiredText}
                onClick={() => {
                  if (dialog.type === 'prompt' && promptValue !== dialog.requiredText) return;
                  if (dialog.onConfirm) dialog.onConfirm();
                  setDialog(null);
                  // Auto-refocus search box to ensure inputs continue working
                  setTimeout(() => document.querySelector('.search-box')?.focus(), 100);
                }}
                style={{
                  flex: 1, padding: '1rem', borderRadius: '16px', border: 'none', 
                  background: (dialog.type === 'confirm' || dialog.type === 'prompt') ? 'var(--primary)' : 'var(--danger)', 
                  color: 'white', fontWeight: 800, cursor: (dialog.type === 'prompt' && promptValue !== dialog.requiredText) ? 'not-allowed' : 'pointer',
                  opacity: (dialog.type === 'prompt' && promptValue !== dialog.requiredText) ? 0.5 : 1,
                  boxShadow: (dialog.type === 'confirm' || dialog.type === 'prompt') ? '0 10px 20px -5px var(--primary-soft)' : '0 10px 20px -5px rgba(239,68,68,0.3)'
                }}
              >
                {(dialog.type === 'confirm' || dialog.type === 'prompt') ? 'YA, LANJUTKAN' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Main() {
  const isConfigured = checkIsConfigured();
  const [view, setView] = useState(window.location.hash);

  useEffect(() => {
    const handleHash = () => setView(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    // Jalankan pengecekan manual saat pertama kali mount
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (!isConfigured) {
    return <Activation />;
  }

  // Jika URL mengandung kata customer-view, tampilkan layar pelanggan
  if (view.includes('customer-view')) {
    return <CustomerDisplay />;
  }

  // Jika URL mengandung kata kitchen-view, tampilkan layar dapur
  if (view.includes('kitchen-view')) {
    return <KitchenDisplay />;
  }
  
  return <App />;
}

export default Main;





















