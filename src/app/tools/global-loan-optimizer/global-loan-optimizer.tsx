"use client";

import { useMemo, useState } from 'react';
import { ArrowDownUp, Calculator, CircleDollarSign, Info, Landmark, Percent, ShieldCheck, WalletCards } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const money = (n: number, currency: string) => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0);
const pct = (n: number) => `${Number.isFinite(n) ? n.toFixed(2) : '0.00'}%`;

function SliderField({ label, value, min, max, step, prefix = '', suffix = '', onChange }: { label: string; value: number; min: number; max: number; step: number; prefix?: string; suffix?: string; onChange: (v: number) => void }) {
  return <div className="mb-7">
    <div className="mb-3 flex items-center justify-between gap-4"><Label className="text-base font-medium text-slate-700">{label}</Label><div className="h-10 min-w-32 rounded-md bg-emerald-50 px-3 py-2 text-right text-lg font-semibold text-emerald-600">{prefix}{value.toLocaleString(undefined, { maximumFractionDigits: 2 })}{suffix}</div></div>
    <Slider value={[value]} min={min} max={max} step={step} onValueChange={v => onChange(v[0] ?? value)} className="py-2" />
  </div>;
}

export function GlobalLoanOptimizer() {
  const [country, setCountry] = useState('US');
  const [amount, setAmount] = useState(50000);
  const [income, setIncome] = useState(80000);
  const [score, setScore] = useState(750);
  const [years, setYears] = useState(5);
  const [extra, setExtra] = useState(0);

  const currency = country === 'IN' ? 'INR' : 'USD';
  const banks = country === 'IN'
    ? [['HDFC Bank', 10.5], ['State Bank of India', 10.2], ['ICICI Bank', 10.8], ['Axis Bank', 11.0], ['Kotak Mahindra Bank', 10.7]]
    : [['Chase Bank', 7.2], ['Bank of America', 7.0], ['Wells Fargo', 7.5], ['Citibank', 7.3], ['U.S. Bank', 7.8]];

  const result = useMemo(() => {
    const creditAdjustment = ((score - 700) / 150) * (country === 'IN' ? 2 : 1.5);
    const incomeRatio = income / Math.max(amount, 1);
    const incomeAdjustment = incomeRatio > (country === 'IN' ? 4 : 3) ? -0.6 : incomeRatio < 2 ? 0.6 : 0;
    const offers = banks.map(([name, base]) => {
      const rate = Math.max(country === 'IN' ? 8.5 : 5, Math.min(country === 'IN' ? 18 : 15, Number(base) - creditAdjustment + incomeAdjustment));
      const r = rate / 100 / 12;
      const months = years * 12;
      const payment = r === 0 ? amount / months : amount * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
      const scheduled = payment * months;
      const actualPayment = payment + extra;
      let balance = amount, interest = 0, paid = 0, month = 0;
      while (balance > 0.01 && month < 1200) {
        month++;
        const i = balance * r;
        const p = Math.min(balance, Math.max(0, actualPayment - i));
        if (p <= 0) break;
        interest += i; paid += i + p; balance -= p;
      }
      return { name, rate, payment, scheduledInterest: Math.max(0, scheduled - amount), interest, paid, months: month };
    }).sort((a, b) => a.rate - b.rate);
    const best = offers[0];
    const averageRate = offers.reduce((s, o) => s + o.rate, 0) / offers.length;
    return { offers, best, averageRate };
  }, [amount, income, score, years, extra, country]);

  const best = result.best;
  const savingVsAverage = Math.max(0, amount * ((result.averageRate - best.rate) / 100) * years);

  return <Card className="w-full overflow-hidden border-2 shadow-sm">
    <CardContent className="p-0">
      <div className="border-b bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-7 text-white sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Global financing comparison</p><h2 className="text-2xl font-bold sm:text-3xl">Global Loan Optimizer</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Compare simulated lender scenarios using your borrowing amount, income, credit profile and repayment term.</p></div><div className="rounded-2xl border border-white/10 bg-white/10 p-3"><ArrowDownUp className="h-7 w-7 text-emerald-300" /></div></div>
      </div>
      <div className="grid gap-0 lg:grid-cols-[1.05fr_.95fr]">
        <div className="border-b p-5 sm:p-8 lg:border-b-0 lg:border-r">
          <div className="mb-6 flex items-center justify-between"><div><h3 className="text-xl font-bold text-slate-800">Your borrowing profile</h3><p className="mt-1 text-sm text-slate-500">Adjust the scenario to see how affordability factors change estimated rates.</p></div><Select value={country} onValueChange={setCountry}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="US">US · USD</SelectItem><SelectItem value="IN">India · INR</SelectItem></SelectContent></Select></div>
          <SliderField label="Loan amount" value={amount} min={country === 'IN' ? 50000 : 5000} max={country === 'IN' ? 10000000 : 500000} step={country === 'IN' ? 10000 : 1000} prefix={country === 'IN' ? '₹' : '$'} onChange={setAmount} />
          <SliderField label="Annual income" value={income} min={country === 'IN' ? 100000 : 20000} max={country === 'IN' ? 50000000 : 1000000} step={country === 'IN' ? 25000 : 5000} prefix={country === 'IN' ? '₹' : '$'} onChange={setIncome} />
          <SliderField label="Credit score" value={score} min={300} max={850} step={1} onChange={setScore} />
          <SliderField label="Repayment term" value={years} min={1} max={30} step={1} suffix=" years" onChange={setYears} />
          <SliderField label="Extra monthly payment" value={extra} min={0} max={5000} step={50} prefix={country === 'IN' ? '₹' : '$'} onChange={setExtra} />
          <div className="rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600"><ShieldCheck className="mr-2 inline h-4 w-4" />Calculations run in your browser. Lender rates below are simulated scenarios, not live loan offers.</div>
        </div>
        <div className="bg-slate-50/70 p-5 sm:p-8">
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Best simulated scenario</p><h3 className="mt-1 text-xl font-bold text-slate-800">{best.name}</h3></div><Landmark className="h-7 w-7 text-emerald-600" /></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs text-emerald-700">Estimated rate</p><p className="mt-1 text-3xl font-bold text-emerald-700">{pct(best.rate)}</p></div><div className="rounded-2xl bg-slate-100 p-4"><p className="text-xs text-slate-500">Monthly payment</p><p className="mt-1 text-2xl font-bold text-slate-800">{money(best.payment + extra, currency)}</p></div></div><div className="my-6 h-4 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(12, Math.min(100, 100 - best.rate * 5))}%` }} /></div><div className="space-y-3"><Metric label="Total interest with extra payments" value={money(best.interest, currency)} /><Metric label="Estimated payoff" value={`${Math.ceil(best.months / 12 * 10) / 10} years`} /><Metric label="Potential rate advantage" value={money(savingVsAverage, currency)} /></div></div>
        </div>
      </div>
      <div className="border-t bg-white p-5 sm:p-8"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-xl font-bold text-slate-800">Lender scenario comparison</h3><p className="mt-1 text-sm text-slate-500">Sorted by estimated annual interest rate.</p></div><div className="rounded-xl bg-slate-50 px-4 py-2 text-xs text-slate-500">Average rate: <strong className="text-slate-800">{pct(result.averageRate)}</strong></div></div><div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[680px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Lender</th><th className="px-4 py-3">Rate</th><th className="px-4 py-3">Monthly payment</th><th className="px-4 py-3">Scheduled interest</th><th className="px-4 py-3">Payoff</th></tr></thead><tbody>{result.offers.map((o, i) => <tr key={o.name} className="border-t"><td className="px-4 py-4 font-semibold">{i === 0 ? '★ ' : ''}{o.name}</td><td className="px-4 py-4 font-semibold text-emerald-600">{pct(o.rate)}</td><td className="px-4 py-4">{money(o.payment + extra, currency)}</td><td className="px-4 py-4">{money(o.scheduledInterest, currency)}</td><td className="px-4 py-4">{Math.ceil(o.months / 12 * 10) / 10} yrs</td></tr>)}</tbody></table></div><div className="mt-5 grid gap-3 md:grid-cols-3"><InfoCard icon={<Calculator />} title="Rate impact" text="Credit profile and income-to-loan ratio are used to adjust simulated base rates." /><InfoCard icon={<WalletCards />} title="Total cost" text="Compare interest and payoff duration instead of judging an offer only by monthly payment." /><InfoCard icon={<CircleDollarSign />} title="Scenario planning" text="Use extra payments to explore how faster repayment could reduce borrowing time and interest." /></div><p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" />This tool does not connect to banks or guarantee approval. Actual APRs, fees, taxes, eligibility, exchange rates and loan terms vary by lender and country.</p></div>
    </CardContent>
  </Card>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"><span className="text-sm text-slate-500">{label}</span><strong className="text-sm text-slate-800">{value}</strong></div>; }
function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="rounded-2xl bg-slate-50 p-4"><div className="mb-2 flex items-center gap-2 text-emerald-600">{icon}<span className="text-xs font-bold uppercase tracking-wide text-slate-600">{title}</span></div><p className="text-sm leading-6 text-slate-600">{text}</p></div>; }
