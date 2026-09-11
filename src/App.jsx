import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight, CircleDot, Cpu, Flame, Gauge, Music, Palette, Plus, Sparkles, Target, Zap } from 'lucide-react';

const STORAGE_KEY = 'sidequest-items';
const STATUS_ORDER = ['Not Started', 'In Progress', 'Completed'];

const CATEGORIES = [
  { id: 'Work & Tech', name: 'Work & Tech', eyebrow: 'INTELLIGENCE', description: 'Sharpen the mind. Build the next thing.', icon: Cpu, accent: 'cyan', glyph: '01' },
  { id: 'Guitar', name: 'Guitar', eyebrow: 'RESONANCE', description: 'Turn repetition into instinct.', icon: Music, accent: 'gold', glyph: '02' },
  { id: 'Procreate Art', name: 'Procreate Art', eyebrow: 'CREATION', description: 'Give the impossible a shape.', icon: Palette, accent: 'violet', glyph: '03' }
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
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const addItem = (category, title) => setItems((currentItems) => [...currentItems, { id: crypto.randomUUID(), title, category, status: 'Not Started', updated_at: new Date().toISOString() }]);
  const toggleStatus = (itemId) => setItems((currentItems) => currentItems.map((item) => {
    if (item.id !== itemId) return item;
    const next = item.status === 'Not Started' ? 'In Progress' : item.status === 'In Progress' ? 'Completed' : 'Not Started';
    return { ...item, status: next, updated_at: new Date().toISOString() };
  }));

  const totalCompleted = items.filter((item) => item.status === 'Completed').length;
  const totalProgress = items.length ? Math.round((totalCompleted / items.length) * 100) : 0;

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="grid-overlay" />
      <main className="app-frame">
        <header className="topbar">
          <div className="brand-lockup"><div className="brand-mark"><Zap size={17} fill="currentColor" /></div><div><p className="brand-name">SIDE<span>QUEST</span></p><p className="brand-subtitle">PERSONAL EVOLUTION SYSTEM</p></div></div>
          <div className="system-status"><span className="status-dot" /> SYSTEM ONLINE</div>
        </header>

        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div key="dashboard" className="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <section className="hero-panel">
                <div className="hero-copy"><p className="kicker"><Sparkles size={14} /> DAILY PROTOCOL</p><h1>Become the <em>strongest</em><br />version of you.</h1><p className="hero-description">Small quests. Real momentum. Your progress is stored safely on this device.</p><div className="hero-actions"><span className="sync-label"><span className="pulse-dot" /> AUTO-SAVE ACTIVE</span><span className="hero-divider" /><span className="hero-date">{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}</span></div></div>
                <div className="hero-orbit" aria-hidden="true"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="hero-core"><span>LVL</span><strong>{Math.max(1, totalCompleted + 1).toString().padStart(2, '0')}</strong></div><div className="orbit-spark spark-one" /><div className="orbit-spark spark-two" /></div>
              </section>
              <section className="stats-strip"><Stat icon={Gauge} label="TOTAL PROGRESS" value={`${totalProgress}%`} accent="cyan" /><Stat icon={Target} label="QUESTS CLEARED" value={String(totalCompleted).padStart(2, '0')} accent="gold" /><Stat icon={Flame} label="CURRENT STREAK" value="01 DAY" accent="violet" /></section>
              <div className="section-heading"><div><p className="kicker">CHOOSE YOUR PATH</p><h2>Active domains</h2></div><span className="domain-count">{CATEGORIES.length} DOMAINS UNLOCKED</span></div>
              <section className="category-grid">{CATEGORIES.map((category, index) => { const categoryItems = items.filter((item) => item.category === category.id); const completed = categoryItems.filter((item) => item.status === 'Completed').length; const percentage = categoryItems.length ? Math.round((completed / categoryItems.length) * 100) : 0; return <CategoryCard key={category.id} category={category} index={index} count={categoryItems.length} completed={completed} percentage={percentage} onClick={() => setSelectedCategory(category)} />; })}</section>
            </motion.div>
          ) : <CategoryDetailView key="detail" category={selectedCategory} items={items.filter((item) => item.category === selectedCategory.id)} onBack={() => setSelectedCategory(null)} onAdd={addItem} onToggleStatus={toggleStatus} />}
        </AnimatePresence>
        <footer className="app-footer"><span>© SIDEQUEST SYSTEM</span><span>LOCAL STORAGE // PRIVATE BY DEFAULT</span></footer>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }) { return <div className={`stat-cell accent-${accent}`}><Icon size={17} /><div><span>{label}</span><strong>{value}</strong></div></div>; }

function CategoryCard({ category, index, count, completed, percentage, onClick }) {
  const Icon = category.icon;
  return <motion.button className={`category-card accent-${category.accent}`} onClick={onClick} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}><div className="card-glow" /><div className="card-topline"><span className="card-index">DOMAIN / {category.glyph}</span><ChevronRight size={18} /></div><div className="category-icon"><Icon size={25} /></div><p className="card-eyebrow">{category.eyebrow}</p><h3>{category.name}</h3><p className="card-description">{category.description}</p><div className="card-progress-meta"><span>{completed} / {count} CLEARED</span><strong>{percentage}%</strong></div><div className="progress-track"><motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ delay: 0.35, duration: 0.8 }} /></div><div className="card-cta">ENTER DOMAIN <span>↗</span></div></motion.button>;
}

function CategoryDetailView({ category, items, onBack, onAdd, onToggleStatus }) {
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const Icon = category.icon;
  const completed = items.filter((item) => item.status === 'Completed').length;
  const percentage = items.length ? Math.round((completed / items.length) * 100) : 0;
  const addItem = (event) => { event.preventDefault(); if (!title.trim()) return; onAdd(category.id, title.trim()); setTitle(''); setAdding(false); };

  return <motion.div className="detail-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><button className="back-button" onClick={onBack}><ArrowLeft size={16} /> BACK TO DOMAINS</button><section className={`detail-hero accent-${category.accent}`}><div className="detail-icon"><Icon size={30} /></div><div><p className="kicker">DOMAIN / {category.glyph} · {category.eyebrow}</p><h1>{category.name}</h1><p>{category.description}</p></div><div className="detail-score"><strong>{percentage}%</strong><span>SYNC RATE</span></div></section><div className="detail-toolbar"><div><p className="kicker">YOUR QUEST LOG</p><h2>{items.length ? `${items.length} missions in queue` : 'No missions yet'}</h2></div><button className="add-button" onClick={() => setAdding(!adding)}><Plus size={18} /> NEW QUEST</button></div><AnimatePresence>{adding && <motion.form className="add-quest-form" onSubmit={addItem} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><div className="input-icon"><Sparkles size={17} /></div><input type="text" placeholder="Name your next quest..." value={title} onChange={(event) => setTitle(event.target.value)} autoFocus /><button type="submit">INITIALIZE <Zap size={15} /></button></motion.form>}</AnimatePresence>{items.length ? <div className="quest-list">{items.map((item, index) => <QuestCard key={item.id} item={item} index={index} onToggle={() => onToggleStatus(item.id)} />)}</div> : <EmptyState onAdd={() => setAdding(true)} />}<p className="tap-hint"><CircleDot size={13} /> TAP A QUEST TO ADVANCE ITS STATUS</p></motion.div>;
}

function QuestCard({ item, index, onToggle }) {
  const statusIndex = STATUS_ORDER.indexOf(item.status);
  return <motion.button className={`quest-card status-${item.status.toLowerCase().replace(' ', '-')}`} onClick={onToggle} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }} whileTap={{ scale: 0.985 }}><div className="quest-number">0{index + 1}</div><div className="quest-main"><div className="quest-title-row"><h3>{item.title}</h3><span className="quest-status">{item.status === 'Completed' && <Check size={12} />}{item.status}</span></div><div className="quest-meta"><span>MISSION OBJECTIVE</span><span className="status-steps">{STATUS_ORDER.map((status, step) => <i key={status} className={step <= statusIndex ? 'lit' : ''} />)}</span><span>UPDATED {new Date(item.updated_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }).toUpperCase()}</span></div></div><ChevronRight className="quest-arrow" size={19} /></motion.button>;
}

function EmptyState({ onAdd }) { return <motion.button className="empty-state" onClick={onAdd} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="empty-sigil"><Plus size={25} /></div><h3>Begin your first mission</h3><p>Every great run starts with a single quest.</p><span>INITIALIZE QUEST <Zap size={14} /></span></motion.button>; }