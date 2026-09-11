import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Music, Palette, Plus, ArrowLeft } from 'lucide-react';

// PASTE YOUR SUPABASE KEYS HERE
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

const CATEGORIES = [
  { id: 'Work & Tech', name: 'Work & Tech', icon: Cpu, gradient: 'from-blue-600 to-cyan-400', border: 'border-blue-500/30' },
  { id: 'Guitar', name: 'Guitar', icon: Music, gradient: 'from-amber-500 to-yellow-400', border: 'border-amber-500/30' },
  { id: 'Procreate Art', name: 'Procreate Art', icon: Palette, gradient: 'from-purple-600 to-pink-500', border: 'border-purple-500/30' }
];

export default function App() {
  const [session, setSession] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchItems();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchItems();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from('hobby_items').select('*').order('updated_at', { ascending: false });
    if (data) setItems(data);
  };

  if (!session) return <AuthScreen />;

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12">
      <div className="max-w-md mx-auto px-4 pt-12">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">SideQuest</h1>
            <p className="text-gray-400 text-sm mt-1">Level up your hobbies. Skip the doom scroll.</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="text-xs text-gray-500 hover:text-gray-300 border border-white/10 px-3 py-1.5 rounded-full">
            Sign Out
          </button>
        </header>

        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {CATEGORIES.map((cat) => {
                const catItems = items.filter(i => i.category === cat.id);
                const completed = catItems.filter(i => i.status === 'Completed').length;
                const percentage = catItems.length > 0 ? (completed / catItems.length) * 100 : 0;

                return (
                  <motion.div key={cat.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedCategory(cat)} className={`p-5 rounded-3xl bg-neutral-900/60 backdrop-blur-xl border ${cat.border} cursor-pointer shadow-2xl overflow-hidden`}>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">{cat.name}</h2>
                      <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                        <cat.icon className="w-5 h-5 text-white/90" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{completed} of {catItems.length} done</span>
                        <span className="font-bold text-white">{Math.round(percentage)}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div className={`h-full bg-gradient-to-r ${cat.gradient}`} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <CategoryDetailView category={selectedCategory} items={items.filter(i => i.category === selectedCategory.id)} onBack={() => setSelectedCategory(null)} onRefresh={fetchItems} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CategoryDetailView({ category, items, onBack, onRefresh }) {
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const addItem = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('hobby_items').insert([{ title, category: category.id, status: 'Not Started', user_id: user.id }]);
    setTitle('');
    setAdding(false);
    onRefresh();
  };

  const toggleStatus = async (item) => {
    const next = item.status === 'Not Started' ? 'In Progress' : item.status === 'In Progress' ? 'Completed' : 'Not Started';
    await supabase.from('hobby_items').update({ status: next }).eq('id', item.id);
    onRefresh();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <button onClick={onBack} className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /><span>Back</span></button>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{category.name}</h2>
        <button onClick={() => setAdding(!adding)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><Plus className="w-5 h-5" /></button>
      </div>
      
      {adding && (
        <form onSubmit={addItem} className="flex gap-2">
          <input type="text" placeholder="Add quest or task..." value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 bg-neutral-900 border border-white/20 rounded-xl px-4 py-2 text-sm focus:outline-none" autoFocus />
          <button type="submit" className="bg-white text-black font-medium px-4 py-2 rounded-xl text-sm">Add</button>
        </form>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} onClick={() => toggleStatus(item)} className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 flex items-center justify-between cursor-pointer">
            <span className={`text-sm ${item.status === 'Completed' ? 'line-through text-gray-500' : 'text-white'}`}>{item.title}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${item.status === 'Completed' ? 'bg-green-500/20 text-green-400' : item.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-400'}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AuthScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    await supabase.auth.signInWithOtp({ email });
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center px-6 max-w-sm mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">SideQuest.</h1>
        <p className="text-gray-400 text-sm mt-2">Sign in to sync your progress across devices.</p>
      </div>
      {sent ? (
        <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 text-center text-sm">Check your email for the login link!</div>
      ) : (
        <form onSubmit={login} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-neutral-900 border border-white/20 rounded-2xl px-4 py-3 text-sm focus:outline-none" />
          <button type="submit" className="w-full bg-white text-black font-semibold rounded-2xl py-3 text-sm">Send Magic Link</button>
        </form>
      )}
    </div>
  );
}
