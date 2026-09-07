from pathlib import Path
p=Path('/mnt/data/compound_work/src/components/tools/finance/finance-calculator.tsx')
s=p.read_text()
s=s.replace("if (slug === 'simple-interest-calculator') return <SimpleInterestCalculator />;", "if (slug === 'simple-interest-calculator') return <SimpleInterestCalculator />;\n  if (slug === 'compound-interest-calculator') return <CompoundInterestCalculator />;")
marker='function SimpleInterestCalculator() {'
fn=r'''function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(10);
  const [frequency, setFrequency] = useState(12);
  const [contribution, setContribution] = useState(0);
  const [contributionFrequency, setContributionFrequency] = useState(12);
  const [currency, setCurrency] = useState('USD');

  const result = useMemo(() => {
    const p = Math.max(0, principal);
    const annualRate = Math.max(0, rate) / 100;
    const t = Math.max(0, years);
    const n = Math.max(1, Math.round(frequency));
    const periods = Math.max(0, Math.round(t * n));
    const periodicRate = annualRate / n;
    const baseFuture = p * Math.pow(1 + periodicRate, periods);

    const cf = Math.max(1, Math.round(contributionFrequency));
    const contributionPeriods = Math.max(0, Math.round(t * cf));
    const contributionRate = annualRate / cf;
    const contributionFuture = contribution > 0
      ? contributionRate === 0
        ? contribution * contributionPeriods
        : contribution * ((Math.pow(1 + contributionRate, contributionPeriods) - 1) / contributionRate)
      : 0;

    const totalContributions = contribution * contributionPeriods;
    const totalInvested = p + totalContributions;
    const total = baseFuture + contributionFuture;
    const growth = Math.max(0, total - totalInvested);
    const growthShare = total > 0 ? growth / total * 100 : 0;
    const multiplier = p > 0 ? total / p : 0;
    const simpleEquivalent = p * (1 + annualRate * t) + totalContributions;

    const yearly = Array.from({ length: Math.min(40, Math.max(1, Math.ceil(t))) }, (_, index) => {
      const year = index + 1;
      const elapsed = Math.min(year, t);
      const basePeriods = Math.round(elapsed * n);
      const cPeriods = Math.round(elapsed * cf);
      const baseAtYear = p * Math.pow(1 + periodicRate, basePeriods);
      const cAtYear = contribution > 0
        ? contributionRate === 0
          ? contribution * cPeriods
          : contribution * ((Math.pow(1 + contributionRate, cPeriods) - 1) / contributionRate)
        : 0;
      const invested = p + contribution * cPeriods;
      const amount = baseAtYear + cAtYear;
      return { year, invested, interest: Math.max(0, amount - invested), amount };
    });

    return { total, growth, totalInvested, growthShare, multiplier, simpleEquivalent, baseFuture, contributionFuture, totalContributions, yearly };
  }, [principal, rate, years, frequency, contribution, contributionFrequency]);

  const fmt = (n: number) => money(n, currency);
  const growthArc = Math.min(100, Math.max(0, result.growthShare)).toFixed(2);
  const frequencyLabel = frequency === 1 ? 'Annually' : frequency === 2 ? 'Semi-annually' : frequency === 4 ? 'Quarterly' : frequency === 12 ? 'Monthly' : frequency === 365 ? 'Daily' : `${frequency} times/year`;
  const contributionLabel = contributionFrequency === 1 ? 'Annual' : contributionFrequency === 4 ? 'Quarterly' : contributionFrequency === 12 ? 'Monthly' : contributionFrequency === 26 ? 'Biweekly' : contributionFrequency === 52 ? 'Weekly' : `${contributionFrequency} times/year`;

  return <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
    <CardContent className="p-0">
      <div className="border-b bg-gradient-to-r from-violet-50 via-white to-emerald-50 px-5 py-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Advanced Compound Interest Calculator</p>
            <h2 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">See how your money can grow with compounding</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Model compound growth from an initial amount, recurring contributions, annual rate, time horizon and compounding frequency.</p>
          </div>
          <div className="rounded-2xl bg-violet-600 px-5 py-3 text-right text-white shadow-sm"><div className="text-xs opacity-80">Projected future value</div><div className="text-2xl font-black">{fmt(result.total)}</div></div>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1.08fr_.92fr]">
        <div className="space-y-5 p-5 sm:p-7 md:p-8">
          <div className="flex items-end gap-3 rounded-2xl border bg-slate-50/70 p-4"><div className="flex-1"><Label>Currency</Label><Select value={currency} onValueChange={setCurrency}><SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="INR">INR (₹)</SelectItem></SelectContent></Select></div><div className="hidden rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-500 sm:block">Compound growth</div></div>
          <LoanSlider label="Initial principal" value={principal} min={100} max={10000000} step={100} prefix={currency === 'INR' ? '₹' : '$'} onChange={setPrincipal} />
          <LoanSlider label="Annual interest / return rate" value={rate} min={0} max={50} step={0.1} suffix="%" onChange={setRate} />
          <LoanSlider label="Investment period" value={years} min={0.25} max={40} step={0.25} suffix="yr" onChange={setYears} />
          <div className="grid gap-4 rounded-2xl border bg-slate-50/80 p-4 sm:grid-cols-2">
            <div><Label>Compounding frequency</Label><Select value={String(frequency)} onValueChange={v=>setFrequency(Number(v))}><SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Annually</SelectItem><SelectItem value="2">Semi-annually</SelectItem><SelectItem value="4">Quarterly</SelectItem><SelectItem value="12">Monthly</SelectItem><SelectItem value="365">Daily</SelectItem></SelectContent></Select></div>
            <div><Label>Recurring contribution</Label><Input className="mt-1 bg-white" type="number" min="0" step="50" value={contribution} onChange={e=>setContribution(num(e.target.value))}/></div>
            <div className="sm:col-span-2"><Label>Contribution frequency</Label><Select value={String(contributionFrequency)} onValueChange={v=>setContributionFrequency(Number(v))}><SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Annually</SelectItem><SelectItem value="4">Quarterly</SelectItem><SelectItem value="12">Monthly</SelectItem><SelectItem value="26">Every 2 weeks</SelectItem><SelectItem value="52">Weekly</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4"><p className="text-sm text-slate-500">Compound growth</p><p className="mt-1 text-2xl font-black text-violet-600">{fmt(result.growth)}</p><p className="mt-1 text-xs text-slate-500">Projected value above your total contributions</p></div><div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="text-sm text-slate-500">Total invested</p><p className="mt-1 text-2xl font-black text-emerald-600">{fmt(result.totalInvested)}</p><p className="mt-1 text-xs text-slate-500">Starting amount plus recurring contributions</p></div></div>
        </div>
        <div className="border-t bg-gradient-to-br from-slate-50 via-white to-violet-50/70 p-5 sm:p-7 lg:border-l lg:border-t-0 md:p-8">
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-700">Growth contribution</p><p className="text-xs text-slate-500">Growth compared with invested money</p></div><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">{result.growthShare.toFixed(1)}% growth</span></div>
            <div className="mx-auto my-7 flex h-56 w-56 items-center justify-center rounded-full" style={{background:`conic-gradient(#7c3aed 0 ${growthArc}%, #ede9fe ${growthArc}% 100%)`}}><div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white text-center shadow-inner"><span className="text-xs text-slate-400">Future value</span><strong className="mt-1 text-2xl font-black text-slate-800">{fmt(result.total)}</strong><span className="mt-1 text-xs text-violet-600">{rate.toFixed(1)}% p.a.</span></div></div>
            <div className="flex justify-center gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-violet-600"/> Growth</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-violet-100"/> Contributions</span></div>
          </div>
          <div className="mt-5 space-y-3"><LoanResult label="Starting principal" value={fmt(principal)} icon={<WalletCards className="h-4 w-4"/>}/><LoanResult label="Compounding" value={frequencyLabel} icon={<CircleDollarSign className="h-4 w-4"/>}/><LoanResult label="Return multiple" value={`${result.multiplier.toFixed(2)}×`} icon={<TrendingUp className="h-4 w-4"/>} strong/></div>
        </div>
      </div>
      <div className="border-t bg-white p-5 sm:p-7 md:p-9">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-xl font-black text-slate-800">Compound interest growth schedule</h3><p className="mt-1 text-sm text-slate-500">Track how the invested amount and estimated growth can build over time.</p></div><div className="rounded-xl bg-violet-50 px-4 py-2 text-xs text-violet-700">{frequencyLabel} · {contributionLabel} contributions</div></div>
        <div className="mt-5 overflow-x-auto rounded-2xl border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Year</th><th className="px-4 py-3">Total invested</th><th className="px-4 py-3">Growth</th><th className="px-4 py-3">Projected value</th></tr></thead><tbody>{result.yearly.map(r=><tr key={r.year} className="border-t"><td className="px-4 py-3 font-semibold">{r.year}</td><td className="px-4 py-3">{fmt(r.invested)}</td><td className="px-4 py-3 text-violet-600">{fmt(r.interest)}</td><td className="px-4 py-3 font-semibold">{fmt(r.amount)}</td></tr>)}</tbody></table></div>
        <div className="mt-6 grid gap-3 md:grid-cols-3"><div className="rounded-2xl border bg-violet-50/60 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Core formula</p><p className="mt-2 text-sm font-semibold text-slate-700">A = P(1 + r/n)^(nt)</p><p className="mt-1 text-xs text-slate-500">P is principal, r is annual rate, n is compounding frequency and t is time in years.</p></div><div className="rounded-2xl border bg-emerald-50/60 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Compounding effect</p><p className="mt-2 text-sm font-semibold text-slate-700">Returns can earn further returns</p><p className="mt-1 text-xs text-slate-500">As the balance grows, future interest is calculated on a larger base.</p></div><div className="rounded-2xl border bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Scenario check</p><p className="mt-2 text-sm font-semibold text-slate-700">Time and rate drive the projection</p><p className="mt-1 text-xs text-slate-500">A higher assumed return or longer horizon can materially change the mathematical result.</p></div></div>
        <p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0"/>This is a mathematical projection, not a guaranteed investment return. Actual accounts may use different compounding rules, fees, taxes, contribution timing or variable rates.</p>
      </div>
    </CardContent>
  </Card>;
}

'''
s=s.replace(marker,fn+marker)
p.write_text(s)

p=Path('/mnt/data/compound_work/src/app/tools/compound-interest-calculator/compound-interest-calculator.tsx')
p.write_text("'use client';\n\nimport { FinanceCalculator } from '@/components/tools/finance/finance-calculator';\n\nexport default function CompoundInterestCalculator() {\n  return <FinanceCalculator slug=\"compound-interest-calculator\" />;\n}\n")

p=Path('/mnt/data/compound_work/src/lib/seo-tool-content.ts')
s=p.read_text()
start=s.index('  "compound-interest-calculator": {')
end=s.index('  "investment-return-calculator": {', start)
block='''  "compound-interest-calculator": {\n    "how": "Compound interest estimates how an initial balance can grow when each compounding period applies the assumed rate to the balance, including previously earned interest. The calculator also supports recurring contributions so you can separate money added by you from growth produced by the rate assumption.",\n    "features": [\n      "Initial principal and annual rate controls",\n      "Annual, semi-annual, quarterly, monthly and daily compounding",\n      "Flexible investment horizon up to 40 years",\n      "Optional recurring contributions with weekly, biweekly, monthly, quarterly or annual schedules",\n      "Future value, total invested, estimated growth and return multiple",\n      "Year-by-year projection table for scenario planning"\n    ],\n    "use": "Use it for savings planning, investment education, deposit comparisons, long-term wealth scenarios, and learning how rate, time, contribution size and compounding frequency interact.",\n    "steps": [\n      "Enter the starting principal and choose your currency.",\n      "Set the annual interest or return assumption and investment period.",\n      "Choose how often the starting balance compounds.",\n      "Optionally add a recurring contribution and choose its frequency.",\n      "Review projected value, total invested, estimated compound growth and the yearly schedule.",\n      "Run alternative rate, time and contribution scenarios before making a financial decision."\n    ],\n    "why": "The calculator exposes the major drivers of compound growth instead of returning only one final number. Users can see how much money they put in, how much the assumed rate contributes, and how the balance changes year by year.",\n    "compare": [\n      ["Growth model", "Interest can earn further interest as the balance grows", "Simple interest stays tied to the original principal"],\n      ["Compounding", "Frequency can be annual, semi-annual, quarterly, monthly or daily", "No compounding in a pure simple-interest model"],\n      ["Recurring contributions", "Can be modeled separately from the starting principal", "Usually requires a different calculation model"],\n      ["Time effect", "Longer periods can create increasingly larger mathematical growth", "Growth is linear when principal and rate stay constant"],\n      ["Best use", "Savings and investment growth scenarios", "Straightforward simple-interest calculations"]\n    ],\n    "faqs": [\n      {"question":"What is compound interest?","answer":"Compound interest is interest calculated on a balance that can include previously earned interest. This allows the balance to grow on an expanding base over multiple periods."},\n      {"question":"What is the compound interest formula?","answer":"For a basic lump-sum model, A = P(1 + r/n)^(nt), where P is the starting principal, r is the annual rate as a decimal, n is the number of compounding periods per year, and t is time in years."},\n      {"question":"Does monthly compounding always produce more than annual compounding?","answer":"For the same positive nominal annual rate and time horizon, more frequent compounding generally produces a slightly higher mathematical result, although the difference depends on the rate and duration."},\n      {"question":"Can I add monthly investments to compound interest?","answer":"Yes. This calculator lets you enter a recurring contribution and select a contribution schedule. Those deposits are tracked separately from the original principal so you can see how much you contributed versus the projected growth."},\n      {"question":"How does time affect compound growth?","answer":"Time gives the assumed return more periods in which to compound. The effect can become increasingly significant over long horizons because each period builds on the previous balance."},\n      {"question":"What is the Rule of 72?","answer":"The Rule of 72 is a quick estimate for how long a balance may take to double: divide 72 by the assumed annual percentage rate. It is a rough shortcut, not a replacement for a full calculation."},\n      {"question":"Is compound interest guaranteed for investments?","answer":"No. A calculator uses the rate you enter as an assumption. Market investments can have variable returns, losses, fees and taxes, so a projection should not be treated as a guaranteed outcome."},\n      {"question":"Why can my bank or investment statement differ from this calculator?","answer":"Actual products may use daily balances, different compounding conventions, contribution timing, promotional rates, fees, taxes, minimum balances or changing rates. Always compare the calculator assumptions with the actual product terms."}\n    ],\n    "conclusion": "Compound interest is most powerful to understand as a relationship between starting money, rate, time, compounding and additional contributions. Use the projections to compare scenarios, but verify the actual rate, fees, taxes and account rules before relying on a financial product's expected result."\n  },\n'''
s=s[:start]+block+s[end:]
p.write_text(s)
