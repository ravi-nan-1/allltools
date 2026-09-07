'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlarmClock, CalendarDays, Check, Clock3, Dices, Flag, Gauge,
  GraduationCap, Group, Hourglass, Pause, Play, RotateCcw, Shuffle,
  Sparkles, TimerReset, Trophy, Users, Maximize2, Volume2
} from 'lucide-react';

const MODES = [
  { id: 'stopwatch', label: 'Stopwatch', icon: Clock3 },
  { id: 'race', label: 'Race Timers', icon: Trophy },
  { id: 'classroom', label: 'Classroom Timers', icon: GraduationCap },
  { id: 'holiday', label: 'Holiday Timers', icon: CalendarDays },
  { id: 'names', label: 'Random Name Pickers', icon: Users },
  { id: 'numbers', label: 'Random Number Generators', icon: Dices },
  { id: 'sensory', label: 'Sensory Timers', icon: Sparkles },
  { id: 'dates', label: 'Dates', icon: CalendarDays },
  { id: 'clock', label: 'World Clocks', icon: Clock3 },
  { id: 'exam', label: 'Exam Timers', icon: GraduationCap },
  { id: 'chance', label: 'Chance Games', icon: Dices },
  { id: 'groups', label: 'Group Generators', icon: Group },
  { id: 'presentation', label: 'Presentation Timers', icon: Gauge },
] as const;

type ModeId = (typeof MODES)[number]['id'];
type Lap = { id: number; lap: number; split: number; total: number };
type RaceLane = { id: number; name: string; elapsed: number; running: boolean };

const pad = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0');
const formatStopwatch = (ms: number) => {
  const total = Math.max(0, ms);
  const hours = Math.floor(total / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const millis = Math.floor(total % 1000);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${String(millis).padStart(3, '0')}`;
};
const formatShort = (ms: number) => {
  const total = Math.max(0, ms);
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const centis = Math.floor((total % 1000) / 10);
  return `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
};
const formatCountdown = (seconds: number) => {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${pad(Math.floor(safe / 3600))}:${pad(Math.floor((safe % 3600) / 60))}:${pad(safe % 60)}`;
};

function useTicker(active: boolean, onTick: () => void, delay = 50) {
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(onTick, delay);
    return () => window.clearInterval(id);
  }, [active, onTick, delay]);
}

function FeatureList({ items, tone = 'green' }: { items: string[]; tone?: 'green' | 'red' }) {
  return (
    <div className={`rounded-2xl p-4 ${tone === 'green' ? 'bg-emerald-50' : 'bg-red-50'}`}>
      <ul className="space-y-2 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <Check className={`h-4 w-4 shrink-0 ${tone === 'green' ? 'text-emerald-600' : 'text-red-600'}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StopwatchCard() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const startedAt = useRef(0);
  const base = useRef(0);

  const tick = () => {
    if (running) setElapsed(base.current + (performance.now() - startedAt.current));
  };
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
  const reset = () => {
    setRunning(false); setElapsed(0); base.current = 0; setLaps([]);
  };
  const lap = () => {
    const now = running ? base.current + (performance.now() - startedAt.current) : elapsed;
    const lastTotal = laps[0]?.total ?? 0;
    setLaps((current) => [
      { id: Date.now(), lap: current.length + 1, split: now - lastTotal, total: now },
      ...current,
    ]);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-5 sm:p-7">
      <div className="absolute -left-5 top-8 text-8xl font-black text-emerald-100/70 select-none">◷</div>
      <div className="relative">
        <div className="text-center">
          <h2 className="text-4xl font-black text-emerald-700 sm:text-5xl">Stopwatch</h2>
          <p className="mt-1 text-sm text-slate-600">Start, pause, record laps and measure elapsed time precisely.</p>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_250px] md:items-center">
          <div className="flex justify-center">
            <div className="flex h-44 w-44 items-center justify-center rounded-full border-[10px] border-emerald-200 bg-white shadow-inner">
              <div className="text-center">
                <Clock3 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{running ? 'Running' : 'Ready'}</div>
              </div>
            </div>
          </div>
          <FeatureList items={['Millisecond display', 'Unlimited lap records', 'Split and total times', 'Runs entirely in your browser']} />
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button onClick={running ? pause : start} className="inline-flex min-h-12 min-w-36 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 font-bold text-white shadow-sm hover:bg-emerald-700">
            {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />} {running ? 'Pause' : 'Start'}
          </button>
          <button onClick={lap} disabled={!elapsed} className="inline-flex min-h-12 min-w-36 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-bold text-white disabled:opacity-40">
            <Flag className="h-5 w-5" /> Lap
          </button>
          <button onClick={reset} className="inline-flex min-h-12 min-w-36 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 font-bold text-white hover:bg-red-700">
            <RotateCcw className="h-5 w-5" /> Reset
          </button>
        </div>
      </div>
      {laps.length > 0 && (
        <div className="relative mt-5 overflow-hidden rounded-2xl border border-emerald-100 bg-white">
          <div className="grid grid-cols-3 bg-emerald-700 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white">
            <span>Lap</span><span>Split</span><span>Total</span>
          </div>
          {laps.slice(0, 12).map((item) => (
            <div key={item.id} className="grid grid-cols-3 border-t px-4 py-2.5 text-sm tabular-nums text-slate-700">
              <span className="font-semibold">#{item.lap}</span><span>{formatShort(item.split)}</span><span>{formatShort(item.total)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CountdownCard({ title = 'Countdown', defaultSeconds = 300 }: { title?: string; defaultSeconds?: number }) {
  const [hours, setHours] = useState(Math.floor(defaultSeconds / 3600));
  const [minutes, setMinutes] = useState(Math.floor((defaultSeconds % 3600) / 60));
  const [secs, setSecs] = useState(defaultSeconds % 60);
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false);
          if (sound) {
            try { new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=').play(); } catch {}
          }
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, sound]);

  const apply = () => {
    const h = Math.min(99, Math.max(0, Number(hours) || 0));
    const m = Math.min(59, Math.max(0, Number(minutes) || 0));
    const s = Math.min(59, Math.max(0, Number(secs) || 0));
    setHours(h); setMinutes(m); setSecs(s); setRemaining(h * 3600 + m * 60 + s); setRunning(false);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-rose-50 p-5 sm:p-7">
      <div className="absolute -right-5 top-7 text-8xl text-red-100/80 select-none">⌛</div>
      <div className="relative">
        <div className="text-center">
          <h2 className="text-4xl font-black text-red-600 sm:text-5xl">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">Set a duration and count down to zero for focused sessions.</p>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_250px] md:items-center">
          <div className="flex justify-center">
            <div className="flex h-44 w-44 items-center justify-center rounded-full border-[10px] border-red-200 bg-white shadow-inner">
              <Hourglass className="h-20 w-20 text-red-500" />
            </div>
          </div>
          <FeatureList tone="red" items={['Hours, minutes and seconds', 'Pause and resume anytime', 'Optional completion alert', 'Great for study, cooking and workouts']} />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            ['Hours', hours, setHours, 99],
            ['Minutes', minutes, setMinutes, 59],
            ['Seconds', secs, setSecs, 59],
          ].map(([label, value, setter, max]) => (
            <label key={label as string} className="text-xs font-semibold text-slate-600">
              {label as string}
              <input type="number" min={0} max={max as number} value={value as number} onChange={(e) => (setter as (n: number) => void)(Number(e.target.value))} className="mt-1 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-center text-lg font-bold tabular-nums outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button onClick={() => { if (remaining > 0) setRunning((v) => !v); }} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-bold text-white">
            {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />} {running ? 'Pause' : 'Start'}
          </button>
          <button onClick={apply} className="min-h-12 flex-1 rounded-xl bg-blue-600 px-4 font-bold text-white">Set Timer</button>
          <button onClick={() => { setRunning(false); setRemaining(0); }} className="min-h-12 flex-1 rounded-xl bg-red-600 px-4 font-bold text-white">Reset</button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-3 text-sm text-slate-600">
          <button type="button" onClick={() => setSound((v) => !v)} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-semibold">
            <Volume2 className="h-4 w-4" /> Sound {sound ? 'On' : 'Off'}
          </button>
          <span className="font-bold tabular-nums">{formatCountdown(remaining)}</span>
        </div>
      </div>
    </section>
  );
}

function RaceMode() {
  const [lanes, setLanes] = useState<RaceLane[]>([1, 2, 3, 4].map((id) => ({ id, name: `Runner ${id}`, elapsed: 0, running: false })));
  const last = useRef(performance.now());
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = performance.now(); const delta = now - last.current; last.current = now;
      setLanes((items) => items.map((lane) => lane.running ? { ...lane, elapsed: lane.elapsed + delta } : lane));
    }, 50);
    return () => window.clearInterval(id);
  }, []);
  const reset = () => setLanes((items) => items.map((l) => ({ ...l, elapsed: 0, running: false })));
  return <div className="space-y-4"><div className="flex gap-2"><button onClick={() => setLanes((x) => x.map((l) => ({ ...l, running: true })))} className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white">Start All</button><button onClick={reset} className="rounded-xl border px-4 py-2 font-bold">Reset Race</button></div><div className="grid gap-3 sm:grid-cols-2">{lanes.map((lane, i) => <div key={lane.id} className="rounded-2xl border bg-white p-4"><div className="flex items-center justify-between"><input value={lane.name} onChange={(e) => setLanes((x) => x.map((l) => l.id === lane.id ? { ...l, name: e.target.value } : l))} className="w-36 font-bold outline-none"/><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">Lane {i + 1}</span></div><div className="my-3 text-4xl font-black tabular-nums">{formatShort(lane.elapsed)}</div><button onClick={() => setLanes((x) => x.map((l) => l.id === lane.id ? { ...l, running: !l.running } : l))} className="w-full rounded-xl bg-blue-600 px-4 py-2 font-bold text-white">{lane.running ? 'Stop Runner' : 'Start Runner'}</button></div>)}</div></div>;
}

function HolidayMode() {
  const [target, setTarget] = useState(() => `${new Date().getFullYear()}-12-25T00:00`);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);
  const remaining = Math.max(0, (new Date(target).getTime() - now) / 1000);
  return <div className="rounded-3xl border bg-white p-6 text-center"><div className="text-sm font-bold text-slate-500">Countdown to your event</div><div className="my-4 text-6xl font-black tabular-nums text-blue-700">{formatCountdown(remaining)}</div><label className="mx-auto block max-w-sm text-left text-sm font-bold">Holiday or event date<input type="datetime-local" value={target} onChange={(e) => setTarget(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label></div>;
}

function NamesMode() {
  const [text, setText] = useState('Alice\nBob\nCharlie\nDiana'); const [picked, setPicked] = useState('');
  return <div className="grid gap-5 md:grid-cols-2"><textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="rounded-2xl border p-4"/><div className="rounded-2xl border bg-amber-50 p-6 text-center"><div className="text-sm font-bold text-slate-500">Random selection</div><div className="my-8 min-h-14 break-words text-4xl font-black text-amber-700">{picked || 'Ready'}</div><button onClick={() => { const a = text.split(/\n|,/).map((x) => x.trim()).filter(Boolean); setPicked(a.length ? a[Math.floor(Math.random() * a.length)] : 'Add names'); }} className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-white"><Shuffle className="mr-2 inline h-4 w-4"/> Pick Name</button></div></div>;
}

function NumbersMode() {
  const [min, setMin] = useState(1); const [max, setMax] = useState(100); const [result, setResult] = useState<number | null>(null);
  return <div className="mx-auto max-w-xl rounded-3xl border bg-white p-6"><div className="grid grid-cols-2 gap-3"><label className="text-sm font-bold">Minimum<input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm font-bold">Maximum<input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="mt-1 w-full rounded-xl border p-3"/></label></div><div className="my-8 text-center text-7xl font-black tabular-nums text-blue-700">{result ?? '—'}</div><button onClick={() => { const lo = Math.min(min, max); const hi = Math.max(min, max); setResult(Math.floor(Math.random() * (hi - lo + 1)) + lo); }} className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Generate Number</button></div>;
}

function DatesMode() {
  const [a, setA] = useState(''); const [b, setB] = useState('');
  const days = a && b ? Math.round(Math.abs(new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime()) / 86400000) : null;
  return <div className="mx-auto max-w-xl rounded-3xl border bg-white p-6"><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Start date<input type="date" value={a} onChange={(e) => setA(e.target.value)} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm font-bold">End date<input type="date" value={b} onChange={(e) => setB(e.target.value)} className="mt-1 w-full rounded-xl border p-3"/></label></div><div className="mt-8 text-center"><div className="text-6xl font-black text-blue-700">{days ?? '—'}</div><div className="text-sm text-slate-500">days between dates</div></div></div>;
}

function ClockMode() {
  const zones = [['New York','America/New_York'],['London','Europe/London'],['Dubai','Asia/Dubai'],['New Delhi','Asia/Kolkata'],['Singapore','Asia/Singapore'],['Tokyo','Asia/Tokyo']];
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{zones.map(([city, zone]) => <div key={zone} className="rounded-2xl border bg-white p-5"><div className="font-bold">{city}</div><div className="mt-2 text-3xl font-black tabular-nums text-blue-700">{new Intl.DateTimeFormat('en-US',{timeZone:zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).format(now)}</div><div className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat('en-US',{timeZone:zone,dateStyle:'medium'}).format(now)}</div></div>)}</div>;
}

function ChanceMode() {
  const [coin, setCoin] = useState(''); const [dice, setDice] = useState<number[]>([]);
  return <div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border bg-yellow-50 p-6 text-center"><div className="font-bold">Coin Flip</div><div className="my-8 text-5xl font-black text-yellow-700">{coin || '—'}</div><button onClick={() => setCoin(Math.random() < .5 ? 'Heads' : 'Tails')} className="rounded-xl bg-yellow-500 px-5 py-3 font-bold text-white">Flip Coin</button></div><div className="rounded-2xl border bg-blue-50 p-6 text-center"><div className="font-bold">Dice Roller</div><div className="my-8 flex justify-center gap-2 text-4xl font-black">{dice.length ? dice.map((n,i)=><span key={i} className="rounded-xl border bg-white px-4 py-2">{n}</span>) : '—'}</div><button onClick={() => setDice([Math.floor(Math.random()*6)+1,Math.floor(Math.random()*6)+1])} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Roll 2 Dice</button></div></div>;
}

function GroupsMode() {
  const [people, setPeople] = useState('Alice\nBob\nCharlie\nDiana\nEvan\nFatima'); const [size, setSize] = useState(2); const [groups, setGroups] = useState<string[][]>([]);
  const generate = () => { const list = people.split(/\n|,/).map((x)=>x.trim()).filter(Boolean).sort(()=>Math.random()-.5); const out:string[][]=[]; for(let i=0;i<list.length;i+=Math.max(1,size)) out.push(list.slice(i,i+Math.max(1,size))); setGroups(out); };
  return <div className="grid gap-5 md:grid-cols-2"><div><textarea value={people} onChange={(e)=>setPeople(e.target.value)} rows={9} className="w-full rounded-2xl border p-4"/><label className="mt-3 block text-sm font-bold">People per group<input type="number" min={1} value={size} onChange={(e)=>setSize(Math.max(1,Number(e.target.value)||1))} className="mt-1 w-full rounded-xl border p-3"/></label><button onClick={generate} className="mt-3 w-full rounded-xl bg-purple-600 px-5 py-3 font-bold text-white">Generate Groups</button></div><div className="space-y-3">{groups.map((g,i)=><div key={i} className="rounded-2xl border bg-white p-4"><div className="font-bold text-purple-700">Group {i+1}</div>{g.map((p)=><div key={p} className="mt-1 flex gap-2 text-sm"><Check className="h-4 w-4 text-emerald-600"/>{p}</div>)}</div>)}</div></div>;
}

function AdvancedCountdown({ title, defaultSeconds }: { title: string; defaultSeconds: number }) {
  return <CountdownCard title={title} defaultSeconds={defaultSeconds} />;
}

export default function Stopwatch() {
  const [mode, setMode] = useState<ModeId>('stopwatch');

  const renderMode = () => {
    switch (mode) {
      case 'stopwatch': return <StopwatchCard />;
      case 'race': return <RaceMode />;
      case 'classroom': return <AdvancedCountdown title="Classroom Timer" defaultSeconds={300} />;
      case 'holiday': return <HolidayMode />;
      case 'names': return <NamesMode />;
      case 'numbers': return <NumbersMode />;
      case 'sensory': return <AdvancedCountdown title="Sensory Timer" defaultSeconds={60} />;
      case 'dates': return <DatesMode />;
      case 'clock': return <ClockMode />;
      case 'exam': return <AdvancedCountdown title="Exam Timer" defaultSeconds={3600} />;
      case 'chance': return <ChanceMode />;
      case 'groups': return <GroupsMode />;
      case 'presentation': return <AdvancedCountdown title="Presentation Timer" defaultSeconds={600} />;
    }
  };

  return (
    <div className="space-y-6">
      <header className="text-center">
        <div className="mb-2 text-sm text-slate-500">Home <span className="mx-1">›</span> Timers <span className="mx-1">›</span> Stopwatch</div>
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Stopwatch &amp; Countdown Timer</h1>
          <button type="button" className="hidden rounded-xl border bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm sm:inline-flex"><span className="mr-2 text-green-600">★</span>Add to My Page</button>
        </div>
        <p className="mx-auto mt-3 max-w-4xl text-base text-slate-600">A free online stopwatch and countdown timer for study, workouts, sports, cooking, presentations, classroom activities and everyday time tracking.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <StopwatchCard />
        <CountdownCard title="Countdown" defaultSeconds={300} />
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-blue-800 to-blue-600 px-4 py-4 text-center text-white shadow-sm">
        <div className="text-xs font-bold uppercase tracking-[0.25em] opacity-80">Stopwatch & countdown display</div>
        <div className="mt-1 font-mono text-4xl font-black tracking-wider sm:text-6xl">00:00:00.000</div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="rounded-full bg-emerald-600 px-5 py-2.5 font-bold text-white">★ Add to My Page</button>
        <button type="button" onClick={() => document.documentElement.requestFullscreen?.()} className="rounded-full bg-blue-600 px-5 py-2.5 font-bold text-white"><Maximize2 className="mr-1 inline h-4 w-4"/> Go Fullscreen</button>
        <button type="button" className="rounded-full bg-red-600 px-5 py-2.5 font-bold text-white">⊘ Go Ad Free</button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-sky-600 p-2">
        <div className="flex min-w-max gap-2">
          {MODES.map((item) => {
            const Icon = item.icon;
            const active = mode === item.id;
            return <button key={item.id} onClick={() => setMode(item.id)} className={`inline-flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-bold text-white ${active ? 'border-slate-900 bg-slate-900' : 'border-slate-700 bg-sky-700 hover:bg-sky-500'}`}><Icon className="h-5 w-5"/>{item.label}</button>;
          })}
        </div>
      </div>

      <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center gap-2"><AlarmClock className="h-6 w-6 text-blue-600"/><h2 className="text-2xl font-black text-slate-900 sm:text-3xl">{MODES.find((m)=>m.id===mode)?.label} — Free Online Tool</h2></div>
        {renderMode()}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><div className="text-lg font-black text-emerald-800">Accurate timing</div><p className="mt-1 text-sm text-slate-600">Use a browser-based stopwatch with a high-resolution timer for everyday timing and lap tracking.</p></article>
        <article className="rounded-2xl border border-blue-100 bg-blue-50 p-5"><div className="text-lg font-black text-blue-800">Works anywhere</div><p className="mt-1 text-sm text-slate-600">No app installation is required. Use the online timer on desktop, tablet or phone.</p></article>
        <article className="rounded-2xl border border-purple-100 bg-purple-50 p-5"><div className="text-lg font-black text-purple-800">Simple to use</div><p className="mt-1 text-sm text-slate-600">Clear controls make it easy to start, pause, reset, count down or switch to another utility.</p></article>
      </section>

      <section className="prose prose-slate max-w-none">
        <h2>Online Stopwatch &amp; Countdown Timer</h2>
        <p>All2ools provides a free online stopwatch and countdown timer designed for quick, reliable timing without installing an app. Start the stopwatch when an activity begins, pause it when needed, and record laps when you want split measurements. The countdown timer lets you set hours, minutes and seconds for a focused session.</p>
        <h3>What can you use this online timer for?</h3>
        <p>Use it for workouts, running and sports drills, cooking, study sessions, classroom activities, exams, presentations, meetings, games, experiments and everyday tasks. The timer suite also includes race timers, holiday countdowns, random pickers, date calculations, world clocks and team grouping tools.</p>
        <h3>Stopwatch vs. countdown timer</h3>
        <p>A stopwatch measures time upward from zero, which makes it useful when you do not know how long an activity will take. A countdown timer starts from a chosen duration and moves toward zero, making it useful when you have a fixed amount of time available.</p>
        <h3>Lap and split timing</h3>
        <p>Lap timing is useful for comparing repeated intervals. Each lap records the time for that interval as well as the cumulative elapsed time, so you can review performance without doing the calculations yourself.</p>
        <h3>Online timer tools in one place</h3>
        <p>Switch between the timer-suite functions above whenever your task changes. Everything is designed for browser use, with responsive controls for phones, tablets and computers. Timing results are estimates of elapsed browser time and should not be used where certified or safety-critical timing is required.</p>
        <h3>Frequently asked questions</h3>
        <h4>Is this stopwatch free?</h4>
        <p>Yes. The online stopwatch is available without a signup and runs directly in your browser.</p>
        <h4>Can I record laps?</h4>
        <p>Yes. Start the stopwatch and use Lap to save split and total times.</p>
        <h4>Can I use the countdown for an exam or presentation?</h4>
        <p>Yes. Choose Exam Timer or Presentation Timer from the tool menu and set the duration you need.</p>
        <h4>Does the timer work on mobile?</h4>
        <p>Yes. The controls and displays are responsive and designed for touch screens as well as desktop browsers.</p>
      </section>
    </div>
  );
}
