import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Cpu, Music, Palette, Plus } from 'lucide-react';

const STORAGE_KEY = 'sidequest-items';

const CATEGORIES = [
  { id: 'Work & Tech', name: 'Work & Tech', icon: Cpu, gradient: 'from-blue-600 to-cyan-400', border: 'border-blue-500/30' },
  { id: 'Guitar', name: 'Guitar', icon: Music, gradient: 'from-amber-500 to-yellow-400', border: 'border-amber-500/30' },
  { id: 'Procreate Art', name: 'Procreate Art', icon: Palette, gradient: 'from-purple-600 to-pink-500', border: 'border-purple-500/30' }
];

export default function App() {
  const [items, setItems] = useState(() => {
    try {
      const savedItems = window.localStorage.getItem(STORAGE_KEY);
      return savedItems ? JSON.parse(savedItems) : [];
    } catch {
      return [];
    }
  });
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (category, title) => {
    setItems((currentItems) => [
      ...currentItems,
      {
        id: crypto.randomUUID(),
        title,
        category,
        status: 'Not Started',
        updated_at: new Date().toISOString()
      }
    ]);
  };

  const toggleStatus = (itemId) => {
    setItems((currentItems) => currentItems.map((item) => {
      if (item.id !== itemId) return item;
      const next = item.status === 'Not Started' ? 'In Progress' : item.status === 'In Progress' ? 'Completed' : 'Not Started';
      return { ...item, status: next, updated_at: new Date().toISOString() };
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-12">
      <div className="max-w-md mx-auto px-4 pt-12">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">SideQuest</h1>
          <p className="text-gray-400 text-sm mt-1">Level up your hobbies. Skip the doom scroll.</p>
        </header>

        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {CATEGORIES.map((category) => {
                const categoryItems = items.filter((item) => item.category === category.id);
                const completed = categoryItems.filter((item) => item.status === 'Completed').length;
                const percentage = categoryItems.length > 0 ? (completed / categoryItems.length) * 100 : 0;

                return (
                  <motion.div key={category.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedCategory(category)} className={`p-5 rounded-3xl bg-neutral-900/60 backdrop-blur-xl border ${category.border} cursor-pointer shadow-2xl overflow-hidden`}>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">{category.name}</h2>
                      <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                        <category.icon className="w-5 h-5 text-white/90" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{completed} of {categoryItems.length} done</span>
                        <span className="font-bold text-white">{Math.round(percentage)}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div className={`h-full bg-gradient-to-r ${category.gradient}`} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <CategoryDetailView
              category={selectedCategory}
              items={items.filter((item) => item.category === selectedCategory.id)}
              onBack={() => setSelectedCategory(null)}
              onAdd={addItem}
              onToggleStatus={toggleStatus}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CategoryDetailView({ category, items, onBack, onAdd, onToggleStatus }) {
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const addItem = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    onAdd(category.id, title.trim());
    setTitle('');
    setAdding(false);
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
          <input type="text" placeholder="Add quest or task..." value={title} onChange={(event) => setTitle(event.target.value)} className="flex-1 bg-neutral-900 border border-white/20 rounded-xl px-4 py-2 text-sm focus:outline-none" autoFocus />
          <button type="submit" className="bg-white text-black font-medium px-4 py-2 rounded-xl text-sm">Add</button>
        </form>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} onClick={() => onToggleStatus(item.id)} className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 flex items-center justify-between cursor-pointer">
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