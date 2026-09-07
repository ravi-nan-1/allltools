'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlarmClock, CalendarDays, Check, Clock3, Dices, Flag,
  Gauge, GraduationCap, Group, Maximize2, Pause, Play, RotateCcw,
  Shuffle, Sparkles, Trophy, Users, Volume2
} from 'lucide-react';

const MODES = [
  { id: 'stopwatch', label: 'Stopwatch', icon: Clock3, tone: 'blue' },
  { id: 'race', label: 'Race Timers', icon: Trophy, tone: 'red' },
  { id: 'classroom', label: 'Classroom Timers', icon: GraduationCap, tone: 'green' },
  { id: 'holiday', label: 'Holiday Timers', icon: CalendarDays, tone: 'purple' },
  { id: 'names', label: 'Random Name Pickers', icon: Users, tone: 'orange' },
  { id: 'numbers', label: 'Random Number Generators', icon: Dices, tone: 'gray' },
  { id: 'sensory', label: 'Sensory Timers', icon: Sparkles, tone: 'pink' },
  { id: 'dates', label: 'Dates', icon: CalendarDays, tone: 'gold' },
  { id: 'clock', label: 'Clocks', icon: Clock3, tone: 'teal' },
  { id: 'exam', label: 'Exam Timers', icon: GraduationCap, tone: 'indigo' },
  { id: 'chance', label: 'Chance Games', icon: Dices, tone: 'lime' },
  { id: 'groups', label: 'Group Generators', icon: Group, tone: 'violet' },
  { id: 'presentation', label: 'Presentation Timers', icon: Gauge, tone: 'orange' },
] as const;

type ModeId = (typeof MODES)[number]['id'];
type Lap = { id: number; lap: number; split: number; total: number };
type RaceLane = { id: number; name: string; elapsed: number; running: boolean; finished: boolean };

const pad = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0');
const formatShort = (ms: number) => {
  const total = Math.max(0, ms);
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const centis = Math.floor((total % 1000) / 10);
  return `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
};
const formatLong = (ms: number) => {
  const total = Math.max(0, ms);
  const hours = Math.floor(total / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const millis = Math.floor(total % 1000);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${String(millis).padStart(3, '0')}`;
};
const formatCountdown = (seconds: number) => {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${pad(Math.floor(safe / 3600))}:${pad(Math.floor((safe % 3600) / 60))}:${pad(safe % 60)}`;
};

function useTicker(active: boolean, onTick: () => void, delay = 50) {
  const callback = useRef(onTick);
  useEffect(() => { callback.current = onTick; }, [onTick]);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => callback.current(), delay);
    return () => window.clearInterval(id);
  }, [active, delay]);
}

function StopwatchCard({ compact = false }: { compact?: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const startedAt = useRef(0);
  const base = useRef(0);
  const tick = () => { if (running) setElapsed(base.current + (performance.now() - startedAt.current)); };
  useTicker(running, tick);

  const start = () => {
    if (running) return;
    startedAt.current = performance.now();
    base.current = elapsed;
    setRunning(true);
  };
  const pause = () => {
    if (!running) return;
    const now = base.current + (performance.now() - startedAt.current);
    base.current = now;
    setElapsed(now);
    setRunning(false);
  };
  const reset = () => { setRunning(false); setElapsed(0); base.current = 0; setLaps([]); };
  const lap = () => {
    const now = running ? base.current + (performance.now() - startedAt.current) : elapsed;
    setLaps((current) => {
      const lastTotal = current[0]?.total ?? 0;
      return [{ id: Date.now(), lap: current.length + 1, split: now - lastTotal, total: now }, ...current];
    });
  };

  return (
    <section className={`relative overflow-hidden border-0 bg-white ${compact ? 'p-5 sm:p-7' : 'p-6 sm:p-8'}`}>
      <div className="relative">
        <div className="text-center">
          <h2 className="text-4xl font-normal tracking-tight text-black sm:text-5xl">Stopwatch</h2>
          {!compact && <p className="mt-1 text-sm text-slate-500">A precise browser stopwatch with lap and split timing.</p>}
        </div>
        <div className="mt-5 flex flex-col items-center">
          <div className="relative flex h-44 w-44 items-center justify-center sm:h-56 sm:w-56" aria-hidden="true">
            <div className="absolute h-40 w-28 bg-gradient-to-r from-emerald-300 via-emerald-400 to-green-400 sm:h-52 sm:w-36" style={{ clipPath: 'polygon(50% 0, 100% 30%, 76% 30%, 76% 100%, 24% 100%, 24% 30%, 0 30%)' }} />
            <div className="relative z-10 mt-1 text-xs font-black uppercase tracking-widest text-emerald-950">{running ? 'Running' : 'Ready'}</div>
          </div>
          <div className="mt-2 w-full rounded-none bg-[#07389b] px-3 py-4 text-center font-mono text-3xl font-black tracking-wider text-white sm:text-5xl">{formatLong(elapsed)}</div>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={running ? pause : start} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 font-bold text-white hover:bg-emerald-700">{running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}{running ? 'Pause' : 'Start'}</button>
          <button type="button" onClick={lap} disabled={!elapsed} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><Flag className="h-5 w-5" />Lap</button>
          <button type="button" onClick={reset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 font-bold text-white hover:bg-red-700"><RotateCcw className="h-5 w-5" />Reset</button>
        </div>
      </div>
      {laps.length > 0 && (
        <div className="mt-4 overflow-hidden border border-slate-200 bg-white">
          <div className="grid grid-cols-3 bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"><span>Lap</span><span>Split</span><span>Total</span></div>
          {laps.slice(0, 20).map((item) => <div key={item.id} className="grid grid-cols-3 border-t px-4 py-2.5 text-sm tabular-nums text-slate-700"><span className="font-semibold">#{item.lap}</span><span>{formatShort(item.split)}</span><span>{formatShort(item.total)}</span></div>)}
        </div>
      )}
    </section>
  );
}

function CountdownCard({ title = 'Countdown', defaultSeconds = 300, accent = 'red' }: { title?: string; defaultSeconds?: number; accent?: 'red' | 'green' | 'purple' }) {
  const [hours, setHours] = useState(Math.floor(defaultSeconds / 3600));
  const [minutes, setMinutes] = useState(Math.floor((defaultSeconds % 3600) / 60));
  const [secs, setSecs] = useState(defaultSeconds % 60);
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const palette = accent === 'red' ? { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-600', button: 'bg-red-600' } : accent === 'green' ? { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-600', button: 'bg-emerald-600' } : { border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-600', button: 'bg-purple-600' };
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false);
          if (sound) { try { void new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=').play(); } catch {} }
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, sound]);
  const apply = () => {
    const h = Math.min(99, Math.max(0, Number(hours) || 0)); const m = Math.min(59, Math.max(0, Number(minutes) || 0)); const s = Math.min(59, Math.max(0, Number(secs) || 0));
    setHours(h); setMinutes(m); setSecs(s); setRemaining(h * 3600 + m * 60 + s); setRunning(false);
  };
  const reset = () => { setRunning(false); setRemaining(0); };
  return (
    <section className={`relative overflow-hidden border-0 ${palette.bg} p-6 sm:p-8`}>
      <div className="text-center"><h2 className="text-4xl font-normal tracking-tight text-black sm:text-5xl">{title}</h2><p className="mt-1 text-sm text-slate-500">Set a duration and count down accurately to zero.</p></div>
      <div className="mt-5 flex flex-col items-center"><div className="relative flex h-44 w-44 items-center justify-center sm:h-56 sm:w-56" aria-hidden="true"><div className="absolute h-40 w-28 bg-gradient-to-r from-red-500 via-red-500 to-red-300 sm:h-52 sm:w-36" style={{ clipPath: 'polygon(24% 0, 76% 0, 76% 54%, 100% 54%, 50% 100%, 0 54%, 24% 54%)' }} /><div className="relative z-10 mt-1 text-xs font-black uppercase tracking-widest text-red-950">{running ? 'Running' : 'Ready'}</div></div><div className="mt-2 w-full rounded-none bg-[#07389b] px-3 py-4 text-center font-mono text-4xl font-black tracking-wider text-white sm:text-5xl">{formatCountdown(remaining)}</div></div>
      <div className="mt-5 grid grid-cols-3 gap-2">{[['Hours', hours, setHours, 99], ['Minutes', minutes, setMinutes, 59], ['Seconds', secs, setSecs, 59]].map(([label, value, setter, max]) => <label key={label as string} className="text-xs font-bold text-slate-600">{label as string}<input type="number" min={0} max={max as number} value={value as number} onChange={(e) => (setter as (n: number) => void)(Number(e.target.value))} className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-2 text-center text-lg font-bold tabular-nums outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>)}</div>
      <div className="mt-4 flex flex-wrap justify-center gap-2"><button type="button" onClick={() => { if (remaining > 0) setRunning((v) => !v); }} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-bold text-white">{running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}{running ? 'Pause' : 'Start'}</button><button type="button" onClick={apply} className="min-h-11 flex-1 rounded-xl bg-blue-600 px-4 font-bold text-white">Set Timer</button><button type="button" onClick={reset} className={`min-h-11 flex-1 rounded-xl ${palette.button} px-4 font-bold text-white`}>Reset</button></div>
      <div className="mt-4 flex items-center justify-center gap-3 text-sm text-slate-600"><button type="button" onClick={() => setSound((v) => !v)} className="inline-flex min-h-10 items-center gap-1 rounded-full border bg-white px-3 font-semibold"><Volume2 className="h-4 w-4" />Sound {sound ? 'On' : 'Off'}</button>{remaining === 0 && <span className="font-bold text-red-600">Time is up</span>}</div>
    </section>
  );
}

function RaceMode() {
  const [lanes, setLanes] = useState<RaceLane[]>([1, 2, 3, 4].map((id) => ({ id, name: `Runner ${id}`, elapsed: 0, running: false, finished: false })));
  const last = useRef(performance.now());
  useEffect(() => { const id = window.setInterval(() => { const now = performance.now(); const delta = now - last.current; last.current = now; setLanes((items) => items.map((lane) => lane.running ? { ...lane, elapsed: lane.elapsed + delta } : lane)); }, 50); return () => window.clearInterval(id); }, []);
  const reset = () => setLanes((items) => items.map((l) => ({ ...l, elapsed: 0, running: false, finished: false })));
  const toggle = (id: number) => setLanes((items) => items.map((l) => l.id === id ? { ...l, running: !l.running, finished: l.running ? true : false } : l));
  return <div className="space-y-4"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setLanes((x) => x.map((l) => ({ ...l, running: true, finished: false })))} className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white">Start All</button><button type="button" onClick={reset} className="rounded-xl border px-4 py-2 font-bold">Reset Race</button></div><div className="grid gap-3 sm:grid-cols-2">{lanes.map((lane, i) => <div key={lane.id} className="rounded-2xl border bg-white p-4"><div className="flex items-center justify-between gap-2"><input value={lane.name} onChange={(e) => setLanes((x) => x.map((l) => l.id === lane.id ? { ...l, name: e.target.value } : l))} className="min-w-0 flex-1 font-bold outline-none"/><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">Lane {i + 1}</span></div><div className="my-3 text-4xl font-black tabular-nums">{formatShort(lane.elapsed)}</div><button type="button" onClick={() => toggle(lane.id)} className={`w-full rounded-xl px-4 py-2 font-bold text-white ${lane.running ? 'bg-red-600' : 'bg-blue-600'}`}>{lane.running ? 'Finish Runner' : lane.finished ? 'Restart Runner' : 'Start Runner'}</button></div>)}</div></div>;
}

function HolidayMode() {
  const [target, setTarget] = useState(() => `${new Date().getFullYear()}-12-25T00:00`); const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);
  const remaining = Math.max(0, (new Date(target).getTime() - now) / 1000);
  return <div className="rounded-3xl border bg-white p-6 text-center"><div className="text-sm font-bold text-slate-500">Countdown to your holiday or event</div><div className="my-4 text-5xl font-black tabular-nums text-purple-700 sm:text-6xl">{formatCountdown(remaining)}</div><label className="mx-auto block max-w-sm text-left text-sm font-bold">Holiday or event date<input type="datetime-local" value={target} onChange={(e) => setTarget(e.target.value)} className="mt-2 h-12 w-full rounded-xl border p-3" /></label></div>;
}

function NamesMode() {
  const [text, setText] = useState('Alice\nBob\nCharlie\nDiana'); const [picked, setPicked] = useState(''); const [remaining, setRemaining] = useState<string[]>([]);
  const pick = () => { const list = text.split(/\n|,/).map((x) => x.trim()).filter(Boolean); if (!list.length) { setPicked('Add names'); return; } const pool = remaining.length ? remaining : list; const winner = pool[Math.floor(Math.random() * pool.length)]; setPicked(winner); setRemaining(pool.filter((x) => x !== winner)); };
  const reset = () => { setPicked(''); setRemaining([]); };
  return <div className="grid gap-5 md:grid-cols-2"><div><label className="text-sm font-bold">Names<textarea value={text} onChange={(e) => { setText(e.target.value); setRemaining([]); }} rows={8} className="mt-1 w-full rounded-2xl border p-4" /></label><button type="button" onClick={reset} className="mt-3 rounded-xl border px-4 py-2 font-bold">Reset picks</button></div><div className="rounded-2xl border bg-amber-50 p-6 text-center"><div className="text-sm font-bold text-slate-500">Random selection</div><div className="my-8 min-h-14 break-words text-4xl font-black text-amber-700">{picked || 'Ready'}</div><button type="button" onClick={pick} className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-white"><Shuffle className="mr-2 inline h-4 w-4" />Pick Name</button></div></div>;
}

function NumbersMode() {
  const [min, setMin] = useState(1); const [max, setMax] = useState(100); const [count, setCount] = useState(1); const [result, setResult] = useState<number[]>([]);
  const generate = () => { const lo = Math.min(min, max); const hi = Math.max(min, max); const amount = Math.min(20, Math.max(1, count)); const values = Array.from({ length: amount }, () => Math.floor(Math.random() * (hi - lo + 1)) + lo); setResult(values); };
  return <div className="mx-auto max-w-xl rounded-3xl border bg-white p-6"><div className="grid gap-3 sm:grid-cols-3"><label className="text-sm font-bold">Minimum<input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className="mt-1 h-11 w-full rounded-xl border p-3" /></label><label className="text-sm font-bold">Maximum<input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="mt-1 h-11 w-full rounded-xl border p-3" /></label><label className="text-sm font-bold">How many<input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value) || 1)))} className="mt-1 h-11 w-full rounded-xl border p-3" /></label></div><div className="my-8 flex min-h-20 flex-wrap items-center justify-center gap-3">{result.length ? result.map((n, i) => <span key={`${n}-${i}`} className="rounded-2xl bg-blue-50 px-5 py-3 text-4xl font-black tabular-nums text-blue-700">{n}</span>) : <span className="text-6xl font-black text-slate-300">—</span>}</div><button type="button" onClick={generate} className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Generate Number{count > 1 ? 's' : ''}</button></div>;
}

function DatesMode() {
  const [a, setA] = useState(''); const [b, setB] = useState('');
  const days = a && b ? Math.round(Math.abs(new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime()) / 86400000) : null;
  return <div className="mx-auto max-w-xl rounded-3xl border bg-white p-6"><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Start date<input type="date" value={a} onChange={(e) => setA(e.target.value)} className="mt-1 h-12 w-full rounded-xl border p-3" /></label><label className="text-sm font-bold">End date<input type="date" value={b} onChange={(e) => setB(e.target.value)} className="mt-1 h-12 w-full rounded-xl border p-3" /></label></div><div className="mt-8 text-center"><div className="text-6xl font-black text-blue-700">{days ?? '—'}</div><div className="text-sm text-slate-500">days between dates</div></div></div>;
}

function ClockMode() {
  const zones = [['New York', 'America/New_York'], ['London', 'Europe/London'], ['Dubai', 'Asia/Dubai'], ['New Delhi', 'Asia/Kolkata'], ['Singapore', 'Asia/Singapore'], ['Tokyo', 'Asia/Tokyo']]; const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{zones.map(([city, zone]) => <div key={zone} className="rounded-2xl border bg-white p-5"><div className="font-bold">{city}</div><div className="mt-2 text-3xl font-black tabular-nums text-blue-700">{new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(now)}</div><div className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat('en-US', { timeZone: zone, dateStyle: 'medium' }).format(now)}</div></div>)}</div>;
}

function ChanceMode() {
  const [coin, setCoin] = useState(''); const [dice, setDice] = useState<number[]>([]); const [diceCount, setDiceCount] = useState(2);
  return <div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border bg-yellow-50 p-6 text-center"><div className="font-bold">Coin Flip</div><div className="my-8 text-5xl font-black text-yellow-700">{coin || '—'}</div><button type="button" onClick={() => setCoin(Math.random() < .5 ? 'Heads' : 'Tails')} className="rounded-xl bg-yellow-500 px-5 py-3 font-bold text-white">Flip Coin</button></div><div className="rounded-2xl border bg-blue-50 p-6 text-center"><div className="font-bold">Dice Roller</div><select value={diceCount} onChange={(e) => setDiceCount(Math.min(6, Math.max(1, Number(e.target.value))))} className="mt-3 rounded-xl border p-2"><option value={1}>1 die</option><option value={2}>2 dice</option><option value={3}>3 dice</option><option value={4}>4 dice</option><option value={5}>5 dice</option><option value={6}>6 dice</option></select><div className="my-6 flex min-h-14 flex-wrap justify-center gap-2 text-4xl font-black">{dice.length ? dice.map((n, i) => <span key={i} className="rounded-xl border bg-white px-4 py-2">{n}</span>) : '—'}</div><button type="button" onClick={() => setDice(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1))} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Roll Dice</button></div></div>;
}

function GroupsMode() {
  const [people, setPeople] = useState('Alice\nBob\nCharlie\nDiana\nEvan\nFatima'); const [size, setSize] = useState(2); const [groups, setGroups] = useState<string[][]>([]);
  const generate = () => { const list = people.split(/\n|,/).map((x) => x.trim()).filter(Boolean).sort(() => Math.random() - .5); const out: string[][] = []; const groupSize = Math.max(1, size); for (let i = 0; i < list.length; i += groupSize) out.push(list.slice(i, i + groupSize)); setGroups(out); };
  return <div className="grid gap-5 md:grid-cols-2"><div><textarea value={people} onChange={(e) => setPeople(e.target.value)} rows={9} className="w-full rounded-2xl border p-4" /><label className="mt-3 block text-sm font-bold">People per group<input type="number" min={1} value={size} onChange={(e) => setSize(Math.max(1, Number(e.target.value) || 1))} className="mt-1 h-11 w-full rounded-xl border p-3" /></label><button type="button" onClick={generate} className="mt-3 w-full rounded-xl bg-purple-600 px-5 py-3 font-bold text-white">Generate Groups</button></div><div className="space-y-3">{groups.map((g, i) => <div key={i} className="rounded-2xl border bg-white p-4"><div className="font-bold text-purple-700">Group {i + 1}</div>{g.map((p) => <div key={p} className="mt-1 flex gap-2 text-sm"><Check className="h-4 w-4 text-emerald-600" />{p}</div>)}</div>)}</div></div>;
}

function ClassroomMode() {
  const presets = [{ label: 'Focus', seconds: 25 * 60 }, { label: 'Break', seconds: 5 * 60 }, { label: 'Quick activity', seconds: 60 }];
  const [selected, setSelected] = useState(presets[0]);
  return <div className="space-y-4"><div className="flex flex-wrap gap-2">{presets.map((p) => <button type="button" key={p.label} onClick={() => setSelected(p)} className={`rounded-full px-4 py-2 text-sm font-bold ${selected.label === p.label ? 'bg-emerald-600 text-white' : 'border bg-white'}`}>{p.label}</button>)}</div><CountdownCard title="Classroom Timer" defaultSeconds={selected.seconds} accent="green" /></div>;
}

function SensoryMode() {
  const [seconds, setSeconds] = useState(60); return <div className="space-y-4"><div className="rounded-2xl border border-pink-200 bg-pink-50 p-4 text-sm text-pink-900">Use a calm, predictable countdown for transitions, sensory breaks, routines and short activities.</div><div className="grid gap-2 sm:grid-cols-4">{[30, 60, 120, 300].map((n) => <button type="button" key={n} onClick={() => setSeconds(n)} className={`rounded-xl border px-4 py-3 font-bold ${seconds === n ? 'bg-pink-600 text-white' : 'bg-white'}`}>{n < 60 ? `${n}s` : `${n / 60} min`}</button>)}</div><CountdownCard title="Sensory Timer" defaultSeconds={seconds} accent="purple" /></div>;
}

function ExamMode() {
  const [minutes, setMinutes] = useState(60); return <div className="space-y-4"><div className="grid gap-2 sm:grid-cols-4">{[30, 60, 90, 120].map((n) => <button type="button" key={n} onClick={() => setMinutes(n)} className={`rounded-xl border px-4 py-3 font-bold ${minutes === n ? 'bg-indigo-600 text-white' : 'bg-white'}`}>{n} min</button>)}</div><CountdownCard title="Exam Timer" defaultSeconds={minutes * 60} accent="purple" /></div>;
}

function PresentationMode() {
  const [minutes, setMinutes] = useState(10); return <div className="space-y-4"><div className="flex flex-wrap gap-2">{[5, 10, 15, 20].map((n) => <button type="button" key={n} onClick={() => setMinutes(n)} className={`rounded-full px-4 py-2 font-bold ${minutes === n ? 'bg-orange-500 text-white' : 'border bg-white'}`}>{n} min</button>)}</div><CountdownCard title="Presentation Timer" defaultSeconds={minutes * 60} accent="red" /></div>;
}

function ModeContent({ mode }: { mode: ModeId }) {
  switch (mode) {
    case 'stopwatch': return <StopwatchCard />;
    case 'race': return <RaceMode />;
    case 'classroom': return <ClassroomMode />;
    case 'holiday': return <HolidayMode />;
    case 'names': return <NamesMode />;
    case 'numbers': return <NumbersMode />;
    case 'sensory': return <SensoryMode />;
    case 'dates': return <DatesMode />;
    case 'clock': return <ClockMode />;
    case 'exam': return <ExamMode />;
    case 'chance': return <ChanceMode />;
    case 'groups': return <GroupsMode />;
    case 'presentation': return <PresentationMode />;
  }
}

export default function Stopwatch() {
  const [mode, setMode] = useState<ModeId>('stopwatch');
  const activeLabel = useMemo(() => MODES.find((item) => item.id === mode)?.label ?? 'Stopwatch', [mode]);

  const fullscreen = () => { try { void document.documentElement.requestFullscreen?.(); } catch {} };

  return (
    <div className="space-y-6">
      <header className="mx-auto w-full max-w-[1120px] text-center">
        <div className="mb-2 text-sm text-slate-500">Home <span className="mx-1">›</span> Timers <span className="mx-1">›</span> Stopwatch</div>
      </header>

      <div className="mx-auto grid w-full max-w-[1120px] overflow-hidden border border-slate-200 shadow-sm lg:grid-cols-2">
        <div className="bg-white"><StopwatchCard compact /></div>
        <div className="bg-emerald-50/70"><CountdownCard title="Countdown" defaultSeconds={300} accent="red" /></div>
      </div>

      <div className="mx-auto w-full max-w-[1120px] bg-[#07389b] px-4 py-3 text-center text-white"><div className="font-mono text-4xl font-black tracking-wider sm:text-6xl">00:00:00.000</div></div>

      <div className="mx-auto flex w-full max-w-[1120px] flex-wrap justify-center gap-2">
        <button type="button" className="inline-flex min-h-11 items-center rounded-full border-2 border-slate-800 bg-lime-500 px-5 font-bold text-white shadow-sm">★ Add to My Page!</button>
        <button type="button" onClick={fullscreen} className="inline-flex min-h-11 items-center rounded-full border-2 border-slate-800 bg-blue-700 px-5 font-bold text-white shadow-sm"><Maximize2 className="mr-1 h-4 w-4" />Go Fullscreen!</button>
        <button type="button" className="inline-flex min-h-11 items-center rounded-full border-2 border-slate-800 bg-red-600 px-5 font-bold text-white shadow-sm">⊘ Go Ad Free!</button>
      </div>

      <nav aria-label="Timer tools" className="overflow-x-auto border-y-8 border-sky-800 bg-sky-600 p-2">
        <div className="flex min-w-max flex-wrap justify-center gap-1.5">
          {MODES.map((item) => { const Icon = item.icon; const active = mode === item.id; return <button type="button" key={item.id} onClick={() => setMode(item.id)} aria-current={active ? 'page' : undefined} className={`inline-flex min-h-12 items-center gap-2 border-2 border-slate-800 px-3 py-2 text-sm font-bold text-white transition hover:brightness-110 ${active ? 'bg-slate-900' : item.tone === 'red' ? 'bg-red-600' : item.tone === 'green' ? 'bg-lime-600' : item.tone === 'purple' ? 'bg-purple-600' : item.tone === 'orange' ? 'bg-orange-500' : item.tone === 'gray' ? 'bg-slate-500' : item.tone === 'pink' ? 'bg-pink-700' : item.tone === 'gold' ? 'bg-yellow-700' : item.tone === 'teal' ? 'bg-teal-500' : item.tone === 'indigo' ? 'bg-indigo-700' : item.tone === 'lime' ? 'bg-lime-500' : item.tone === 'violet' ? 'bg-fuchsia-600' : 'bg-blue-700'}`}><Icon className="h-5 w-5" />{item.label}</button>; })}
        </div>
      </nav>

      <section className="border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><AlarmClock className="h-6 w-6 text-blue-600" /><h2 className="text-2xl font-black text-slate-900 sm:text-3xl">{activeLabel}</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Free browser tool</span></div>
        <ModeContent mode={mode} />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><div className="text-lg font-black text-emerald-800">Accurate timing</div><p className="mt-1 text-sm text-slate-600">Use a high-resolution browser stopwatch for elapsed time, laps and practical timing tasks.</p></article>
        <article className="rounded-2xl border border-blue-100 bg-blue-50 p-5"><div className="text-lg font-black text-blue-800">Many tools in one place</div><p className="mt-1 text-sm text-slate-600">Switch between race timers, countdowns, random pickers, clocks, dates, exam tools and group generators.</p></article>
        <article className="rounded-2xl border border-purple-100 bg-purple-50 p-5"><div className="text-lg font-black text-purple-800">Works on phones</div><p className="mt-1 text-sm text-slate-600">Responsive controls make the timer suite useful on desktop, tablet and mobile browsers.</p></article>
      </section>

      <section className="prose prose-slate max-w-none">
        <h2>Free Online Stopwatch, Countdown &amp; Timer Tools</h2>
        <p>All2ools combines a precise online stopwatch with a practical collection of countdown, classroom, race, exam, presentation, holiday and random-selection utilities. The stopwatch measures upward from zero, while countdown tools work toward a chosen end time.</p>
        <h3>Stopwatch features</h3>
        <p>Start, pause and reset the stopwatch whenever you need. Use Lap to record split and cumulative times. The display uses browser high-resolution timing rather than relying on visible screen refreshes alone, making it suitable for everyday workouts, study sessions, sports drills, cooking and task tracking.</p>
        <h3>Countdown timer features</h3>
        <p>Set hours, minutes and seconds, then start, pause or reset the countdown. Optional sound can signal completion. Preset-based classroom, sensory, exam and presentation timers make common fixed-duration activities faster to set up.</p>
        <h3>Extra timer-suite tools</h3>
        <p>Race Timers provide separate lanes for multiple runners. Holiday Timers count down to an event date. Random Name Pickers select from a list without repeating a selected name until the pool is exhausted. Random Number Generators create one or more values inside a chosen range. Dates calculate the days between two calendar dates, while World Clocks show current times in several major cities.</p>
        <h3>Chance, groups and presentations</h3>
        <p>Chance Games include coin flips and configurable dice rolls. Group Generators shuffle a participant list into groups. Presentation Timers provide common duration presets, while Exam Timers make longer timed sessions easy to launch.</p>
        <h3>Important timing note</h3>
        <p>Browser timing is intended for ordinary activities and planning. Do not rely on an online timer for certified measurements, legal timing, medical dosing, industrial safety or other situations where a certified timing device is required.</p>
        <h3>Frequently asked questions</h3>
        <h4>Is the online stopwatch free?</h4><p>Yes. The stopwatch and timer-suite tools run in the browser without requiring an app installation.</p>
        <h4>Can I record lap times?</h4><p>Yes. Start the stopwatch and use Lap to save both split and cumulative elapsed times.</p>
        <h4>Can the countdown play a sound?</h4><p>Yes. Sound can be switched on or off in the countdown control.</p>
        <h4>Can I use it on a phone?</h4><p>Yes. The controls are responsive and designed for touch screens as well as desktop browsers.</p>
        <h4>Does the stopwatch keep running if I change tabs?</h4><p>The stopwatch calculates elapsed time from a high-resolution start reference, but browser scheduling can vary when a page is backgrounded. For critical timing, use a dedicated timing device.</p>
      </section>
    </div>
  );
}
