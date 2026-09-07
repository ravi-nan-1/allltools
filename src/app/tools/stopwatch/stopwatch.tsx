'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlarmClock,
  CalendarDays,
  Check,
  Clock3,
  Dices,
  Flag,
  Gauge,
  GraduationCap,
  Group,
  Hourglass,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  Sparkles,
  TimerReset,
  Trophy,
  Users,
} from 'lucide-react';

const MODES = [
  { id: 'stopwatch', label: 'Online Stopwatch', icon: Clock3 },
  { id: 'race', label: 'Online Race Timer', icon: Trophy },
  { id: 'classroom', label: 'Online Classroom Timer', icon: GraduationCap },
  { id: 'holiday', label: 'Online Holiday Timer', icon: CalendarDays },
  { id: 'names', label: 'Online Random Name Picker', icon: Users },
  { id: 'numbers', label: 'Online Random Number Generator', icon: Dices },
  { id: 'sensory', label: 'Online Sensory Timer', icon: Sparkles },
  { id: 'dates', label: 'Online Date Calculator', icon: CalendarDays },
  { id: 'clock', label: 'Online World Clock', icon: Clock3 },
  { id: 'exam', label: 'Online Exam Timer', icon: GraduationCap },
  { id: 'chance', label: 'Online Chance Games', icon: Dices },
  { id: 'groups', label: 'Online Group Generator', icon: Group },
  { id: 'presentation', label: 'Online Presentation Timer', icon: Gauge },
] as const;

type ModeId = (typeof MODES)[number]['id'];

type Lap = { id: number; lap: number; split: number; total: number };

type RaceLane = { id: number; name: string; elapsed: number; running: boolean };

const pad = (n: number) => String(n).padStart(2, '0');
const formatStopwatch = (ms: number) => {
  const total = Math.max(0, ms);
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const centis = Math.floor((total % 1000) / 10);
  return `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
};
const formatCountdown = (seconds: number) => {
  const safe = Math.max(0, Math.ceil(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
};

function useTicker(active: boolean, onTick: () => void) {
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(onTick, 50);
    return () => window.clearInterval(id);
  }, [active, onTick]);
}

function ModeHeader({ mode }: { mode: ModeId }) {
  const item = MODES.find((m) => m.id === mode) ?? MODES[0];
  const Icon = item.icon;
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Free • No signup • Works online
        </div>
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Icon className="h-7 w-7 text-primary" />
          {item.label}
        </h2>
      </div>
    </div>
  );
}

function StopwatchMode() {
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
    setRunning(false);
    setElapsed(0);
    base.current = 0;
    setLaps([]);
  };
  const lap = () => {
    const now = running ? base.current + (performance.now() - startedAt.current) : elapsed;
    const previous = laps[0]?.total ?? 0;
    setLaps((current) => [
      { id: Date.now(), lap: current.length + 1, split: now - previous, total: now },
      ...current,
    ]);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-5 shadow-sm sm:p-8">
        <div className="mx-auto max-w-4xl rounded-3xl border bg-background/90 p-5 shadow-inner sm:p-8">
          <div className="text-center text-6xl font-black tabular-nums tracking-tight sm:text-8xl">
            {formatStopwatch(elapsed)}
          </div>
          <div className="mt-3 text-center text-sm text-muted-foreground">Hundredth-second precision • Laps & split times</div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button onClick={running ? pause : start} className="inline-flex min-w-36 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-lg transition hover:scale-[1.02]">
              {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {running ? 'Pause' : 'Start'}
            </button>
            <button onClick={lap} disabled={!elapsed} className="inline-flex min-w-36 items-center justify-center gap-2 rounded-2xl border bg-background px-6 py-3 text-base font-bold shadow-sm disabled:cursor-not-allowed disabled:opacity-40">
              <Flag className="h-5 w-5" /> Lap
            </button>
            <button onClick={reset} className="inline-flex min-w-36 items-center justify-center gap-2 rounded-2xl border px-6 py-3 text-base font-bold hover:bg-muted">
              <RotateCcw className="h-5 w-5" /> Reset
            </button>
          </div>
        </div>
      </div>
      {laps.length > 0 && (
        <div className="overflow-hidden rounded-2xl border">
          <div className="grid grid-cols-3 bg-muted/60 px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <span>Lap</span><span>Split</span><span>Total</span>
          </div>
          {laps.map((item) => (
            <div key={item.id} className="grid grid-cols-3 border-t px-4 py-3 text-sm tabular-nums">
              <span className="font-semibold">#{item.lap}</span><span>{formatStopwatch(item.split)}</span><span>{formatStopwatch(item.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RaceMode() {
  const [lanes, setLanes] = useState<RaceLane[]>([
    { id: 1, name: 'Runner 1', elapsed: 0, running: false },
    { id: 2, name: 'Runner 2', elapsed: 0, running: false },
    { id: 3, name: 'Runner 3', elapsed: 0, running: false },
    { id: 4, name: 'Runner 4', elapsed: 0, running: false },
  ]);
  const last = useRef<number | null>(null);
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = performance.now();
      setLanes((items) => items.map((lane) => lane.running ? { ...lane, elapsed: lane.elapsed + (last.current ? now - last.current : 0) } : lane));
      last.current = now;
    }, 50);
    return () => window.clearInterval(id);
  }, []);
  const toggle = (id: number) => setLanes((items) => items.map((l) => l.id === id ? { ...l, running: !l.running } : l));
  const reset = () => setLanes((items) => items.map((l) => ({ ...l, elapsed: 0, running: false })));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2"><button onClick={() => setLanes((x) => x.map((l) => ({ ...l, running: true })))} className="rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground">Start all</button><button onClick={reset} className="rounded-xl border px-4 py-2 font-semibold">Reset race</button></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {lanes.map((lane, index) => <div key={lane.id} className="rounded-2xl border p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><input value={lane.name} onChange={(e) => setLanes((x) => x.map((l) => l.id === lane.id ? { ...l, name: e.target.value } : l))} className="w-36 bg-transparent font-bold outline-none"/><span className="rounded-full bg-muted px-2 py-1 text-xs">Lane {index + 1}</span></div><div className="text-4xl font-black tabular-nums">{formatStopwatch(lane.elapsed)}</div><button onClick={() => toggle(lane.id)} className="mt-4 w-full rounded-xl border px-4 py-2 font-semibold">{lane.running ? 'Stop runner' : 'Start runner'}</button></div>)}
      </div>
    </div>
  );
}

function CountdownMode({ title, defaultSeconds, accent = 'standard' }: { title: string; defaultSeconds: number; accent?: string }) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const [minutes, setMinutes] = useState(Math.floor(defaultSeconds / 60));
  const [secs, setSecs] = useState(defaultSeconds % 60);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((value) => {
      if (value <= 1) { setRunning(false); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  const apply = (m = minutes, s = secs) => { setSeconds(Math.max(0, m * 60 + s)); setRunning(false); };
  return <div className="rounded-3xl border bg-gradient-to-br from-primary/10 to-background p-6 text-center sm:p-8"><div className="mb-5 text-sm font-semibold text-muted-foreground">{title}</div><div className="text-6xl font-black tabular-nums sm:text-8xl">{formatCountdown(seconds)}</div><div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3"><label className="text-left text-sm font-semibold">Minutes<input type="number" min="0" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="mt-1 w-full rounded-xl border bg-background p-3"/></label><label className="text-left text-sm font-semibold">Seconds<input type="number" min="0" max="59" value={secs} onChange={(e) => setSecs(Number(e.target.value))} className="mt-1 w-full rounded-xl border bg-background p-3"/></label></div><div className="mt-5 flex flex-wrap justify-center gap-2"><button onClick={() => setRunning((v) => !v)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">{running ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}{running ? 'Pause' : 'Start'} online timer</button><button onClick={() => apply()} className="rounded-xl border px-5 py-3 font-bold">Set timer</button><button onClick={() => { setSeconds(0); setRunning(false); }} className="rounded-xl border px-5 py-3"><TimerReset className="inline h-4 w-4"/> Reset</button></div>{accent && <div className="mt-4 text-xs text-muted-foreground">Runs entirely in your browser.</div>}</div>;
}

function HolidayMode() {
  const [target, setTarget] = useState(() => `${new Date().getFullYear()}-12-25T00:00`);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);
  const remaining = Math.max(0, (new Date(target).getTime() - now) / 1000);
  return <div className="space-y-5"><div className="rounded-3xl border p-6 text-center"><div className="text-sm font-semibold text-muted-foreground">Countdown to your date</div><div className="mt-3 text-5xl font-black tabular-nums sm:text-7xl">{formatCountdown(remaining)}</div><label className="mx-auto mt-6 block max-w-sm text-left text-sm font-semibold">Holiday / event date<input type="datetime-local" value={target} onChange={(e) => setTarget(e.target.value)} className="mt-1 w-full rounded-xl border bg-background p-3"/></label></div></div>;
}

function NamesMode() {
  const [text, setText] = useState('Alice\nBob\nCharlie\nDiana');
  const [picked, setPicked] = useState('');
  const names = useMemo(() => text.split(/\n|,/).map((x) => x.trim()).filter(Boolean), [text]);
  return <div className="grid gap-5 md:grid-cols-2"><textarea value={text} onChange={(e) => setText(e.target.value)} rows={9} placeholder="One name per line" className="rounded-2xl border bg-background p-4 outline-none focus:ring-2 focus:ring-primary"/><div className="rounded-2xl border p-6 text-center"><div className="text-sm text-muted-foreground">Selected online</div><div className="my-8 min-h-16 break-words text-4xl font-black">{picked || '—'}</div><button onClick={() => setPicked(names.length ? names[Math.floor(Math.random() * names.length)] : '')} className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground"><Shuffle className="mr-2 inline h-4 w-4"/> Pick a name</button></div></div>;
}

function NumbersMode() {
  const [min, setMin] = useState(1); const [max, setMax] = useState(100); const [result, setResult] = useState<number | null>(null);
  return <div className="mx-auto max-w-xl rounded-3xl border p-6"><div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Minimum<input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm font-semibold">Maximum<input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="mt-1 w-full rounded-xl border p-3"/></label></div><div className="my-8 text-center text-7xl font-black tabular-nums">{result ?? '—'}</div><button onClick={() => setResult(Math.floor(Math.random() * (Math.max(min, max) - Math.min(min, max) + 1)) + Math.min(min, max))} className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Generate online</button></div>;
}

function SensoryMode() { return <CountdownMode title="Large, distraction-free visual timer" defaultSeconds={60} accent="sensory"/>; }
function ExamMode() { return <CountdownMode title="Exam countdown with simple controls" defaultSeconds={3600} accent="exam"/>; }
function PresentationMode() { return <CountdownMode title="Presentation countdown — keep your talk on time" defaultSeconds={600} accent="presentation"/>; }

function DatesMode() {
  const [a, setA] = useState(''); const [b, setB] = useState('');
  const days = a && b ? Math.round(Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 86400000) : null;
  return <div className="mx-auto max-w-xl rounded-3xl border p-6"><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Start date<input type="date" value={a} onChange={(e) => setA(e.target.value)} className="mt-1 w-full rounded-xl border p-3"/></label><label className="text-sm font-semibold">End date<input type="date" value={b} onChange={(e) => setB(e.target.value)} className="mt-1 w-full rounded-xl border p-3"/></label></div><div className="mt-8 text-center"><div className="text-6xl font-black">{days ?? '—'}</div><div className="text-sm text-muted-foreground">days between dates</div></div></div>;
}

function ClockMode() {
  const zones = [
    ['New York', 'America/New_York'], ['London', 'Europe/London'], ['Dubai', 'Asia/Dubai'], ['New Delhi', 'Asia/Kolkata'], ['Singapore', 'Asia/Singapore'], ['Tokyo', 'Asia/Tokyo'],
  ];
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{zones.map(([city, zone]) => <div key={zone} className="rounded-2xl border p-5"><div className="font-bold">{city}</div><div className="mt-2 text-3xl font-black tabular-nums">{new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(now)}</div><div className="mt-1 text-xs text-muted-foreground">{new Intl.DateTimeFormat('en-US', { timeZone: zone, dateStyle: 'medium' }).format(now)}</div></div>)}</div>;
}

function ChanceMode() {
  const [coin, setCoin] = useState(''); const [dice, setDice] = useState<number[]>([]);
  return <div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border p-6 text-center"><div className="text-sm font-semibold text-muted-foreground">Coin flip</div><div className="my-8 text-5xl font-black">{coin || '—'}</div><button onClick={() => setCoin(Math.random() < 0.5 ? 'Heads' : 'Tails')} className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Flip online</button></div><div className="rounded-2xl border p-6 text-center"><div className="text-sm font-semibold text-muted-foreground">Dice roller</div><div className="my-8 flex min-h-14 justify-center gap-2 text-4xl font-black">{dice.length ? dice.map((n, i) => <span key={i} className="rounded-xl border px-4 py-2">{n}</span>) : '—'}</div><button onClick={() => setDice([1, 2].map(() => Math.floor(Math.random() * 6) + 1))} className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Roll 2 dice online</button></div></div>;
}

function GroupsMode() {
  const [people, setPeople] = useState('Alice\nBob\nCharlie\nDiana\nEvan\nFatima'); const [size, setSize] = useState(2); const [groups, setGroups] = useState<string[][]>([]);
  const generate = () => { const list = people.split(/\n|,/).map((x) => x.trim()).filter(Boolean).sort(() => Math.random() - 0.5); const out: string[][] = []; for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size)); setGroups(out); };
  return <div className="grid gap-5 md:grid-cols-2"><div><textarea value={people} onChange={(e) => setPeople(e.target.value)} rows={10} className="w-full rounded-2xl border bg-background p-4"/><label className="mt-3 block text-sm font-semibold">People per group<input type="number" min="1" value={size} onChange={(e) => setSize(Math.max(1, Number(e.target.value)))} className="mt-1 w-full rounded-xl border p-3"/></label><button onClick={generate} className="mt-3 w-full rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Generate groups online</button></div><div className="space-y-3">{groups.map((group, i) => <div key={i} className="rounded-2xl border p-4"><div className="font-bold">Group {i + 1}</div><div className="mt-2 space-y-1 text-sm">{group.map((person) => <div key={person} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary"/>{person}</div>)}</div></div>)}</div></div>;
}

export default function Stopwatch() {
  const [mode, setMode] = useState<ModeId>('stopwatch');
  const renderMode = () => {
    switch (mode) {
      case 'stopwatch': return <StopwatchMode />;
      case 'race': return <RaceMode />;
      case 'classroom': return <CountdownMode title="Classroom countdown with quick setup" defaultSeconds={300} />;
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
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">All2ools Timer Suite</div><h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Online Stopwatch & Timer Tools</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">A modern collection of free online timing, clock, date, randomizer, race, classroom, exam, and presentation utilities — all in one browser tool.</p></div>
          <div className="hidden rounded-2xl border bg-background/80 p-3 text-right sm:block"><div className="text-xs text-muted-foreground">13 online functions</div><div className="font-bold">Instant • Private • Free</div></div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-background p-2 shadow-sm">
        <div className="flex min-w-max gap-2">
          {MODES.map((item) => { const Icon = item.icon; const active = mode === item.id; return <button key={item.id} onClick={() => setMode(item.id)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted'}`}><Icon className="h-4 w-4"/>{item.label}</button>; })}
        </div>
      </div>

      <div className="rounded-3xl border bg-background p-4 shadow-sm sm:p-7">
        <ModeHeader mode={mode} />
        {renderMode()}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border p-4"><AlarmClock className="mb-2 h-5 w-5 text-primary"/><div className="font-bold">Works online</div><div className="text-sm text-muted-foreground">Use the tools directly in your browser.</div></div>
        <div className="rounded-2xl border p-4"><Hourglass className="mb-2 h-5 w-5 text-primary"/><div className="font-bold">Fast & responsive</div><div className="text-sm text-muted-foreground">Designed for desktop, tablet, and mobile.</div></div>
        <div className="rounded-2xl border p-4"><TimerReset className="mb-2 h-5 w-5 text-primary"/><div className="font-bold">Simple controls</div><div className="text-sm text-muted-foreground">Start, pause, reset, calculate, pick, or generate.</div></div>
      </div>
    </div>
  );
}
