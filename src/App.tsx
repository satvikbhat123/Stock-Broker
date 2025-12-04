// @ts-ignore
declare var __initial_auth_token: any;
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  LogOut, 
  Zap, 
  Activity, 
  Wallet, 
  Search, 
  ArrowRight,
  User as UserIcon,
  Shield,
  Clock,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  updateDoc,
  getDoc
} from "firebase/firestore";

// --- CONFIGURATION ---
const AVAILABLE_STOCKS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA', 'BTC', 'ETH'];

// --- FIREBASE SETUP ---
const getFirebaseConfig = () => {
  // We prioritize your local keys since you are running this in VS Code
  return {
    apiKey: "AIzaSyAi3R4zTGKTy67_5BDVPK_x3eYmbgOsW8s",
    authDomain: "stock-bf7b7.firebaseapp.com",
    projectId: "stock-bf7b7",
    storageBucket: "stock-bf7b7.firebasestorage.app",
    messagingSenderId: "185295200936",
    appId: "1:185295200936:web:92570b786446765aa5589d",
    measurementId: "G-Y9Z978YZ51"
  };
};

const app = initializeApp(getFirebaseConfig());
const auth = getAuth(app);
const db = getFirestore(app);
// Use a fixed ID for local dev so all tabs share data
const appId = 'local-stock-broker-v1'; 

// --- COMPONENTS ---

// 0. CONFIG ERROR VIEW 
const ConfigErrorView = ({ error }) => {
  const isAuthConfigError = error?.code === 'auth/configuration-not-found';
  const isOpNotAllowed = error?.code === 'auth/operation-not-allowed';
  
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 text-white font-mono">
      <div className="max-w-xl w-full bg-[#111] border border-red-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-500">Connection Error</h2>
            <p className="text-gray-500 text-sm">Could not connect to Firebase</p>
          </div>
        </div>
        
        <div className="space-y-4 text-sm text-gray-400">
          <p>
            {(isAuthConfigError || isOpNotAllowed) 
              ? "The Authentication service is disabled in your Firebase Console."
              : "The API key is configured, but we encountered an error connecting."}
          </p>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 break-words font-mono text-xs">
             {error?.code ? `Error Code: ${error.code}` : ''} <br/>
             {error?.message || "Unknown error occurred"}
          </div>
          <p className="font-bold text-white mt-4">Required Actions:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-300">
            {(isAuthConfigError || isOpNotAllowed) ? (
              <li>
                 Go to <strong>Build &gt; Authentication</strong> in Firebase Console.
                 <br/>Click "Get Started" and ensure the <strong>Anonymous</strong> provider is enabled.
              </li>
            ) : (
              <>
                <li>Enable <strong>Anonymous Auth</strong> in Firebase Console (Build &gt; Authentication).</li>
                <li>Create <strong>Firestore Database</strong> in Test Mode (Build &gt; Firestore).</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

// 1. LOGIN COMPONENT
const LoginView = ({ onLogin, loading }) => {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1a1a1a] border border-[#333] rounded-2xl mb-4 shadow-[0_0_30px_rgba(204,255,0,0.1)]">
            <Zap className="w-8 h-8 text-[#ccff00]" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            STOCK<span className="text-[#ccff00]">BROKER</span>
          </h1>
          <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">
            Next Gen Trading Protocol
          </p>
        </div>

        <div className="bg-[#111] border border-[#333] p-2 rounded-3xl shadow-2xl backdrop-blur-xl">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Identity</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-[#0a0a0a] text-white px-6 py-4 rounded-xl border border-[#333] focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] outline-none transition-all font-mono placeholder:text-gray-700"
                onKeyDown={(e) => e.key === 'Enter' && email && onLogin(email)}
              />
            </div>

            <button 
              onClick={() => onLogin(email)}
              disabled={!email || loading}
              className="w-full group relative overflow-hidden bg-[#ccff00] hover:bg-[#b3e600] disabled:bg-[#333] disabled:text-gray-600 text-black font-black py-4 rounded-xl transition-all active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? 'CONNECTING...' : 'ENTER DASHBOARD'}
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </div>
          
          <div className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onLogin('user1@gmail.com')}
                className="text-xs font-mono text-gray-500 bg-[#1a1a1a] hover:bg-[#222] py-2 rounded-lg transition-colors border border-transparent hover:border-[#333]"
              >
                user1@gmail.com
              </button>
              <button 
                onClick={() => onLogin('user2@gmail.com')}
                className="text-xs font-mono text-gray-500 bg-[#1a1a1a] hover:bg-[#222] py-2 rounded-lg transition-colors border border-transparent hover:border-[#333]"
              >
                user2@gmail.com
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. DASHBOARD COMPONENT
const DashboardView = ({ currentUser, stocks, subscriptions, onSubscribe, onUnsubscribe, onLogout }) => {
  const [activeTab, setActiveTab] = useState('portfolio');

  const portfolioStats = useMemo(() => {
    const activeStocks = subscriptions.map(sub => stocks[sub]).filter(Boolean);
    const totalValue = activeStocks.reduce((sum, stock) => sum + stock.price, 0);
    const avgChange = activeStocks.length > 0
      ? activeStocks.reduce((sum, stock) => sum + stock.change, 0) / activeStocks.length
      : 0;
    return { totalValue, avgChange, count: activeStocks.length };
  }, [stocks, subscriptions]);

  const StockCard = ({ ticker, stock, isSubscribed }) => {
    const isPositive = stock?.change >= 0;
    
    return (
      <div className="group relative bg-[#111] hover:bg-[#161616] border border-[#222] hover:border-[#333] rounded-2xl p-5 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
              isPositive ? 'bg-[#ccff00]/10 text-[#ccff00]' : 'bg-pink-500/10 text-pink-500'
            }`}>
              {ticker[0]}
            </div>
            <div>
              <h3 className="font-bold text-white tracking-tight">{ticker}</h3>
              <p className="text-xs text-gray-500 font-mono">US EQUITY</p>
            </div>
          </div>
          <button 
            onClick={() => isSubscribed ? onUnsubscribe(ticker) : onSubscribe(ticker)}
            className={`p-2 rounded-lg transition-all ${
              isSubscribed 
                ? 'bg-[#222] text-gray-400 hover:text-red-400 hover:bg-red-400/10' 
                : 'bg-[#ccff00] text-black hover:bg-[#b3e600] hover:scale-110'
            }`}
          >
            {isSubscribed ? <Activity className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-mono font-bold text-white">
            ${stock?.price?.toFixed(2)}
          </div>
          <div className={`flex items-center gap-1 text-xs font-mono font-bold ${
            isPositive ? 'text-[#ccff00]' : 'text-pink-500'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {stock?.change > 0 ? '+' : ''}{stock?.change?.toFixed(2)}%
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl opacity-50">
           <div className={`w-full h-full ${isPositive ? 'bg-[#ccff00]' : 'bg-pink-500'}`} style={{ width: `${Math.random() * 50 + 50}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 md:pb-0">
      <nav className="fixed md:left-0 md:top-0 md:bottom-0 md:w-20 w-full bottom-0 bg-[#0a0a0a] border-t md:border-t-0 md:border-r border-[#222] z-50 flex md:flex-col items-center justify-between p-4 md:py-8">
        <div className="hidden md:flex w-10 h-10 bg-[#ccff00] rounded-xl items-center justify-center text-black font-black">
          S
        </div>
        
        <div className="flex md:flex-col gap-8 md:gap-8 w-full md:w-auto justify-around md:justify-start">
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'portfolio' ? 'bg-[#222] text-[#ccff00]' : 'text-gray-500 hover:text-white'}`}
          >
            <Wallet className="w-6 h-6" />
          </button>
          <button 
             onClick={() => setActiveTab('market')}
             className={`p-3 rounded-xl transition-all ${activeTab === 'market' ? 'bg-[#222] text-[#ccff00]' : 'text-gray-500 hover:text-white'}`}
          >
            <Search className="w-6 h-6" />
          </button>
        </div>

        <button 
          onClick={onLogout}
          className="hidden md:flex p-3 text-gray-500 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </nav>

      <main className="md:pl-20 p-6 md:p-10 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">
              {activeTab === 'portfolio' ? 'MY ASSETS' : 'MARKET EXPLORER'}
            </h2>
            <div className="flex items-center gap-2 text-gray-500 text-sm font-mono">
              <span className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse" />
              LIVE FEED CONNECTED
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-xs text-gray-500 font-mono uppercase">Current User</span>
                <span className="font-bold text-[#ccff00]">{currentUser}</span>
             </div>
             <div className="w-12 h-12 bg-[#1a1a1a] rounded-full border border-[#333] flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-400" />
             </div>
             <button onClick={onLogout} className="md:hidden p-2 text-gray-500">
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </header>

        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#111] rounded-3xl p-6 border border-[#222] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Wallet className="w-16 h-16 text-white" />
               </div>
               <p className="text-gray-500 font-mono text-xs uppercase mb-2">Net Worth</p>
               <h3 className="text-4xl font-black font-mono tracking-tighter">
                 ${portfolioStats.totalValue.toFixed(2)}
               </h3>
               <div className="mt-4 flex items-center gap-2 text-sm text-[#ccff00] font-mono">
                 <Shield className="w-4 h-4" /> SECURED
               </div>
            </div>

            <div className="bg-[#111] rounded-3xl p-6 border border-[#222] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity className="w-16 h-16 text-white" />
               </div>
               <p className="text-gray-500 font-mono text-xs uppercase mb-2">Daily P&L</p>
               <h3 className={`text-4xl font-black font-mono tracking-tighter ${portfolioStats.avgChange >= 0 ? 'text-[#ccff00]' : 'text-pink-500'}`}>
                 {portfolioStats.avgChange > 0 ? '+' : ''}{portfolioStats.avgChange.toFixed(2)}%
               </h3>
               <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 font-mono">
                 <Clock className="w-4 h-4" /> 24H CHANGE
               </div>
            </div>
            
            <div className="bg-[#ccff00] rounded-3xl p-6 border border-[#ccff00] relative overflow-hidden text-black flex flex-col justify-between">
               <div>
                 <p className="font-mono text-xs uppercase mb-1 opacity-60 font-bold">Active Subscriptions</p>
                 <h3 className="text-4xl font-black font-mono tracking-tighter">
                   {portfolioStats.count} <span className="text-xl opacity-50">/ {AVAILABLE_STOCKS.length}</span>
                 </h3>
               </div>
               <button 
                  onClick={() => setActiveTab('market')}
                  className="bg-black/10 hover:bg-black/20 text-black font-bold py-3 px-4 rounded-xl text-sm transition-colors flex items-center justify-between"
               >
                 Add More <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeTab === 'portfolio' ? (
             subscriptions.length === 0 ? (
               <div className="col-span-full py-20 text-center border-2 border-dashed border-[#222] rounded-3xl">
                 <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
                   <Search className="w-8 h-8 text-gray-600" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">No Assets Found</h3>
                 <p className="text-gray-500 mb-6 max-w-sm mx-auto">Your portfolio is looking empty. Head to the market to start watching stocks.</p>
                 <button 
                    onClick={() => setActiveTab('market')}
                    className="bg-white text-black font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition-colors"
                 >
                   Explore Market
                 </button>
               </div>
             ) : (
                subscriptions.map(ticker => (
                  <StockCard 
                    key={ticker} 
                    ticker={ticker} 
                    stock={stocks[ticker]} 
                    isSubscribed={true} 
                  />
                ))
             )
          ) : (
            AVAILABLE_STOCKS.map(ticker => (
              <StockCard 
                key={ticker} 
                ticker={ticker} 
                stock={stocks[ticker]} 
                isSubscribed={subscriptions.includes(ticker)} 
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

// --- MAIN APP LOGIC ---
const App = () => {
  const [user, setUser] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [stockPrices, setStockPrices] = useState({});
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState(null);

  // 1. AUTHENTICATION
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error:", err);
        // Updated to catch specific auth errors
        if (err.message === "PLACEHOLDER_KEY" || err.code?.includes("auth/") || err.code?.includes("api-key")) {
           setConfigError(err);
           setIsLoading(false);
        }
      }
    };
    initAuth();

    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
  }, []);

  // 2. STOCK MARKET SIMULATION
  useEffect(() => {
    if (!user) return;

    const marketCollection = collection(db, 'artifacts', appId, 'public', 'data', 'market_data');
    const pricesDocRef = doc(marketCollection, 'prices');

    const unsubscribe = onSnapshot(pricesDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setStockPrices(data);
        
        // Leader Election (Simple)
        const lastUpdate = data._lastUpdated || 0;
        if (Date.now() - lastUpdate > 1200) {
          updateMarketPrices(data, pricesDocRef);
        }
      } else {
        const initialData = {};
        AVAILABLE_STOCKS.forEach(t => {
          initialData[t] = { price: Math.random() * 1000 + 100, change: 0 };
        });
        updateMarketPrices(initialData, pricesDocRef);
      }
    }, (error) => {
      console.error("Market stream error:", error);
    });

    const interval = setInterval(() => {
      getDoc(pricesDocRef).then(snap => {
        if (snap.exists()) {
           const data = snap.data();
           if (Date.now() - (data._lastUpdated || 0) > 2000) {
             updateMarketPrices(data, pricesDocRef);
           }
        }
      });
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user]);

  const updateMarketPrices = async (currentPrices, docRef) => {
    const newPrices = { ...currentPrices };
    AVAILABLE_STOCKS.forEach(ticker => {
      const prev = currentPrices[ticker] || { price: 500, change: 0 };
      const changePercent = (Math.random() - 0.5) * 3;
      const newPrice = Math.max(1, prev.price * (1 + changePercent / 100));
      
      newPrices[ticker] = {
        price: newPrice,
        change: changePercent
      };
    });
    newPrices._lastUpdated = Date.now();
    try { await setDoc(docRef, newPrices); } catch (e) {}
  };

  // 3. USER SUBSCRIPTIONS
  useEffect(() => {
    if (!user || !currentUserEmail) return;

    const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUserEmail);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setSubscriptions(docSnap.data().subscriptions || []);
      } else {
        setDoc(userDocRef, { subscriptions: [] });
        setSubscriptions([]);
      }
    }, (err) => console.error("User profile error", err));

    return () => unsubscribe();
  }, [user, currentUserEmail]);

  // --- ACTIONS ---
  const handleLogin = (email) => setCurrentUserEmail(email);
  const handleLogout = () => { setCurrentUserEmail(null); setSubscriptions([]); };
  const toggleSubscription = async (ticker) => {
    if (!currentUserEmail) return;
    const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUserEmail);
    const newSubs = subscriptions.includes(ticker)
      ? subscriptions.filter(t => t !== ticker)
      : [...subscriptions, ticker];
    setSubscriptions(newSubs); 
    await updateDoc(userDocRef, { subscriptions: newSubs });
  };

  if (configError) return <ConfigErrorView error={configError} />;
  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#ccff00] font-mono animate-pulse">INITIALIZING PROTOCOL...</div>;
  if (!currentUserEmail) return <LoginView onLogin={handleLogin} loading={!user} />;

  return (
    <DashboardView 
      currentUser={currentUserEmail}
      stocks={stockPrices}
      subscriptions={subscriptions}
      onSubscribe={toggleSubscription}
      onUnsubscribe={toggleSubscription}
      onLogout={handleLogout}
    />
  );
};

export default App;