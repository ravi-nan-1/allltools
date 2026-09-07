"use client";

import { useMemo, useState, type ReactNode } from 'react';
import { Calculator, Info, WalletCards, TrendingUp, CircleDollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const money = (n: number, currency = 'USD') => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number.isFinite(n) ? n : 0);
const pct = (n: number) => `${Number.isFinite(n) ? n.toFixed(2) : '0.00'}%`;
const num = (v: string) => Math.max(0, Number.parseFloat(v) || 0);

type Props = { slug: string };
type Result = { label: string; value: string }[];

export function FinanceCalculator({ slug }: Props) {
  const [values, setValues] = useState<Record<string, string>>({
    principal: '250000', rate: '6.5', years: '30', down: '50000', tax: '1.2', insurance: '1500', pmi: '0.5', extra: '0',
    balance: '5000', payment: '150', cardRate: '24', inflation: '3', currentValue: '100000', futureValue: '100000', initial: '10000', contribution: '500', contributionFrequency: '12', returnRate: '8', investmentYears: '20', cost: '10000', gain: '2500', time: '5', compounds: '12', simpleRate: '5',
  });
  const [currency, setCurrency] = useState('USD');
  const set = (k: string, v: string) => setValues(prev => ({ ...prev, [k]: v }));

  const result = useMemo(() => calculate(slug, values, currency), [slug, values, currency]);

  const config = getConfig(slug);
  if (slug === 'emi-calculator') return <EMICalculator />;
  if (slug === 'loan-calculator') return <LoanCalculator />;
  if (slug === 'personal-loan-calculator') return <PersonalLoanCalculator />;
  if (slug === 'car-loan-calculator') return <CarLoanCalculator />;
  if (slug === 'investment-return-calculator') return <InvestmentReturnCalculator />;
  if (slug === 'roi-calculator') return <ROICalculator />;
  if (slug === 'inflation-calculator') return <InflationCalculator />;
  if (slug === 'student-loan-calculator') return <StudentLoanCalculator />;
  if (slug === 'credit-card-payoff-calculator') return <CreditCardPayoffCalculator />;
  if (slug === 'home-loan-calculator') return <HomeLoanCalculator />;
  if (slug === 'interest-calculator') return <InterestCalculator />;
  if (slug === 'simple-interest-calculator') return <SimpleInterestCalculator />;
  if (slug === 'compound-interest-calculator') return <CompoundInterestCalculator />;
  if (slug === 'mortgage-calculator') return <HomeLoanCalculator />;
  return (
    <Card className="w-full overflow-hidden border-2 shadow-sm">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> {config.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-5 md:p-7">
        <div className="flex flex-wrap items-end gap-3 rounded-xl border p-4">
          <div className="min-w-[150px] flex-1"><Label>Currency</Label><Select value={currency} onValueChange={setCurrency}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="INR">INR (₹)</SelectItem></SelectContent></Select></div>
          {config.fields.map(f => <Field key={f.key} label={f.label} value={values[f.key] ?? ''} onChange={v => set(f.key, v)} suffix={f.suffix} />)}
        </div>
        <Button className="w-full" size="lg" onClick={() => setValues(v => ({ ...v }))}>Calculate</Button>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {result.map(item => <div key={item.label} className="rounded-xl border bg-background p-4"><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-1 text-xl font-bold break-words">{item.value}</p></div>)}
        </div>
        <p className="flex gap-2 text-xs text-muted-foreground"><Info className="h-4 w-4 shrink-0" /> Estimates are for planning and educational purposes. Actual rates, fees, taxes, lender terms, and investment results can differ.</p>
      </CardContent>
    </Card>
  );
}


function EMICalculator() {
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(10);
  const [extra, setExtra] = useState(0);

  const result = useMemo(() => {
    const months = Math.max(1, Math.round(years * 12));
    const monthlyRate = rate / 100 / 12;
    const emi = monthlyRate === 0
      ? principal / months
      : principal * monthlyRate * Math.pow(1 + monthlyRate, months) /
        (Math.pow(1 + monthlyRate, months) - 1);

    const scheduledTotal = emi * months;
    const scheduledInterest = Math.max(0, scheduledTotal - principal);
    const paymentWithExtra = emi + extra;
    let balance = principal;
    let totalInterest = 0;
    let totalPaid = 0;
    let actualMonths = 0;
    const schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];

    while (balance > 0.01 && actualMonths < 1200) {
      actualMonths += 1;
      const interest = monthlyRate === 0 ? 0 : balance * monthlyRate;
      const plannedPrincipal = Math.max(0, paymentWithExtra - interest);
      const principalPaid = Math.min(balance, plannedPrincipal);
      const actualPayment = principalPaid + interest;
      balance = Math.max(0, balance - principalPaid);
      totalInterest += interest;
      totalPaid += actualPayment;
      if (schedule.length < 12 || balance === 0) {
        schedule.push({ month: actualMonths, payment: actualPayment, principal: principalPaid, interest, balance });
      }
      if (principalPaid <= 0 && interest > 0) break;
    }

    const principalPct = totalPaid > 0 ? Math.min(100, principal / totalPaid * 100) : 100;
    const interestPct = Math.max(0, 100 - principalPct);
    const payoffLabel = actualMonths >= 12
      ? `${Math.floor(actualMonths / 12)} yr${actualMonths % 12 ? ` ${actualMonths % 12} mo` : ''}`
      : `${actualMonths} mo`;

    return {
      months,
      emi,
      scheduledTotal,
      scheduledInterest,
      totalInterest,
      totalPaid,
      actualMonths,
      principalPct,
      interestPct,
      payoffLabel,
      schedule,
      interestSaved: Math.max(0, scheduledInterest - totalInterest),
    };
  }, [principal, rate, years, extra]);

  const fmt = (n: number) => money(n, 'INR');
  const principalArc = result.principalPct.toFixed(2);

  return <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
    <CardContent className="p-0">
      <div className="border-b bg-gradient-to-r from-emerald-50 via-white to-indigo-50 px-5 py-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Online EMI Calculator</p>
            <h2 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">Calculate your monthly EMI</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Adjust the loan amount, interest rate and tenure to instantly see your EMI, total interest and repayment amount.</p>
          </div>
          <div className="rounded-2xl bg-emerald-600 px-5 py-3 text-right text-white shadow-sm">
            <div className="text-xs opacity-80">Monthly EMI</div>
            <div className="text-2xl font-black">{fmt(result.emi)}</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.08fr_.92fr]">
        <div className="space-y-6 p-5 sm:p-7 md:p-8">
          <EMISlider label="Loan amount" value={principal} min={10000} max={10000000} step={10000} prefix="₹" onChange={setPrincipal} />
          <EMISlider label="Interest rate (p.a.)" value={rate} min={0} max={30} step={0.1} suffix="%" onChange={setRate} />
          <EMISlider label="Loan tenure" value={years} min={1} max={40} step={1} suffix="yr" onChange={setYears} />
          <EMISlider label="Extra monthly payment" value={extra} min={0} max={200000} step={1000} prefix="₹" onChange={setExtra} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-sm text-slate-500">Monthly EMI</p>
              <p className="mt-1 text-2xl font-black text-emerald-600">{fmt(result.emi)}</p>
              <p className="mt-1 text-xs text-slate-500">Regular payment before extra payment</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
              <p className="text-sm text-slate-500">Estimated payoff</p>
              <p className="mt-1 text-2xl font-black text-indigo-600">{result.payoffLabel}</p>
              <p className="mt-1 text-xs text-slate-500">{extra > 0 ? 'With extra monthly payment' : 'At the selected tenure'}</p>
            </div>
          </div>
        </div>

        <div className="border-t bg-gradient-to-br from-slate-50 via-white to-indigo-50/70 p-5 sm:p-7 lg:border-l lg:border-t-0 md:p-8">
          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-sm font-semibold text-slate-700">EMI repayment meter</p><p className="text-xs text-slate-500">Principal compared with interest</p></div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{result.principalPct.toFixed(0)}% principal</span>
            </div>
            <div className="mx-auto my-7 flex h-56 w-56 items-center justify-center rounded-full" style={{ background: `conic-gradient(#5065f6 0 ${principalArc}%, #dfe5ff ${principalArc}% 100%)` }}>
              <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-xs font-medium text-slate-500">Total repayment</span>
                <strong className="mt-1 text-xl font-black text-slate-800">{fmt(result.totalPaid)}</strong>
                <span className="mt-1 text-xs text-indigo-600">{result.interestPct.toFixed(0)}% interest</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-5 text-xs text-slate-500">
              <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#5065f6]" /> Principal</span>
              <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#dfe5ff]" /> Interest</span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <LoanResult label="Principal amount" value={fmt(principal)} icon={<WalletCards className="h-4 w-4" />} />
            <LoanResult label="Total interest" value={fmt(result.totalInterest)} icon={<CircleDollarSign className="h-4 w-4" />} />
            <LoanResult label="Total amount payable" value={fmt(result.totalPaid)} icon={<TrendingUp className="h-4 w-4" />} strong />
            {extra > 0 && <LoanResult label="Estimated interest saved" value={fmt(result.interestSaved)} icon={<TrendingUp className="h-4 w-4" />} />}
          </div>
        </div>
      </div>

      <div className="border-t bg-white p-5 sm:p-7 md:p-8">
        <div className="mb-5"><h3 className="text-xl font-bold text-slate-800">First-year EMI schedule</h3><p className="mt-1 text-sm text-slate-500">See how the balance changes and how each monthly payment is split between principal and interest.</p></div>
        <div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Month</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Principal</th><th className="px-4 py-3">Interest</th><th className="px-4 py-3">Balance</th></tr></thead><tbody>{result.schedule.map(r => <tr key={r.month} className="border-t"><td className="px-4 py-3 font-semibold">{r.month}</td><td className="px-4 py-3">{fmt(r.payment)}</td><td className="px-4 py-3 text-emerald-600">{fmt(r.principal)}</td><td className="px-4 py-3">{fmt(r.interest)}</td><td className="px-4 py-3 font-semibold">{fmt(r.balance)}</td></tr>)}</tbody></table></div>
        <p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" />This EMI calculator provides an estimate for planning. Your lender may use different rates, fees, rounding, payment dates, taxes, insurance or repayment rules.</p>
      </div>
    </CardContent>
  </Card>;
}

function EMISlider({ label, value, min, max, step, prefix, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; prefix?: string; suffix?: string; onChange: (value: number) => void }) {
  const display = `${prefix ?? ''}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix ? ` ${suffix}` : ''}`;
  return <div>
    <div className="mb-2 flex items-center justify-between gap-3"><Label className="text-base font-medium text-slate-700">{label}</Label><div className="rounded-lg bg-emerald-50 px-3 py-2 text-lg font-semibold text-emerald-600">{display}</div></div>
    <Slider value={[value]} min={min} max={max} step={step} onValueChange={v => onChange(v[0] ?? value)} className="py-2" />
    <div className="mt-1 flex justify-between text-[11px] text-slate-400"><span>{prefix ?? ''}{min.toLocaleString()}</span><span>{prefix ?? ''}{max.toLocaleString()} {suffix ?? ''}</span></div>
  </div>;
}


function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(5);
  const [extra, setExtra] = useState(0);
  const currency = 'INR';

  const result = useMemo(() => {
    const months = Math.max(1, Math.round(years * 12));
    const monthlyRate = rate / 100 / 12;
    const basePayment = monthlyRate === 0
      ? loanAmount / months
      : loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    const payment = basePayment + extra;
    let balance = loanAmount;
    let totalInterest = 0;
    let totalPaid = 0;
    let actualMonths = 0;
    const rows: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];
    while (balance > 0.01 && actualMonths < 1200) {
      actualMonths += 1;
      const interest = monthlyRate === 0 ? 0 : balance * monthlyRate;
      const principal = Math.min(balance, Math.max(0, payment - interest));
      const actualPayment = principal + interest;
      balance = Math.max(0, balance - principal);
      totalInterest += interest;
      totalPaid += actualPayment;
      if (rows.length < 12 || balance === 0) rows.push({ month: actualMonths, payment: actualPayment, principal, interest, balance });
      if (principal <= 0 && interest > 0) break;
    }
    const principalShare = totalPaid > 0 ? loanAmount / totalPaid : 1;
    const interestShare = Math.max(0, Math.min(1, totalInterest / Math.max(totalPaid, 1)));
    return { months, basePayment, payment, totalInterest, totalPaid, actualMonths, principalShare, interestShare, rows };
  }, [loanAmount, rate, years, extra]);

  const fmt = (n: number) => money(n, currency);
  const yearsLabel = result.actualMonths >= 12 ? `${Math.floor(result.actualMonths / 12)}y ${result.actualMonths % 12}m` : `${result.actualMonths}m`;
  const donut = `${Math.max(0, Math.min(100, result.principalShare * 100))}%`;

  return (
    <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-5 sm:p-7 md:p-9">
            <div className="mb-7 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Online Loan Calculator</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">Calculate your loan payment</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Adjust the amount, interest rate and tenure to instantly see your monthly payment, total interest and repayment cost.</p>
              </div>
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 sm:flex"><Calculator className="h-5 w-5" /></div>
            </div>

            <LoanSlider label="Loan amount" value={loanAmount} min={10000} max={10000000} step={10000} onChange={setLoanAmount} />
            <LoanSlider label="Rate of interest (p.a.)" value={rate} min={0} max={25} step={0.1} onChange={setRate} />
            <LoanSlider label="Loan tenure" value={years} min={1} max={30} step={1} onChange={setYears} />
            <LoanSlider label="Extra monthly payment" value={extra} min={0} max={100000} step={1000} onChange={setExtra} />

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="text-sm text-slate-500">Monthly EMI</p><p className="mt-1 text-2xl font-bold text-emerald-600">{fmt(result.payment)}</p></div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-sm text-slate-500">Payoff time</p><p className="mt-1 text-2xl font-bold text-slate-800">{yearsLabel}</p></div>
            </div>
          </div>

          <div className="border-t bg-gradient-to-br from-slate-50 via-white to-emerald-50/60 p-5 sm:p-7 lg:border-l lg:border-t-0 md:p-9">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-700">Repayment breakdown</p><p className="text-xs text-slate-500">Principal vs total interest</p></div><TrendingUp className="h-5 w-5 text-emerald-500" /></div>
            <div className="mx-auto my-5 flex max-w-[300px] items-center justify-center">
              <div className="relative h-56 w-56 rounded-full" style={{ background: `conic-gradient(#5065f6 0 ${donut}, #e9edff ${donut} 100%)` }}>
                <div className="absolute inset-[28px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner"><span className="text-xs font-medium text-slate-500">Monthly EMI</span><strong className="mt-1 text-2xl font-bold text-slate-800">{fmt(result.payment)}</strong><span className="mt-1 text-xs text-emerald-600">{rate.toFixed(1)}% p.a.</span></div>
              </div>
            </div>
            <div className="flex justify-center gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#5065f6]" /> Principal amount</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#e9edff]" /> Interest amount</span></div>
            <div className="mt-8 space-y-4">
              <LoanResult label="Principal amount" value={fmt(loanAmount)} icon={<WalletCards className="h-4 w-4" />} />
              <LoanResult label="Total interest" value={fmt(result.totalInterest)} icon={<CircleDollarSign className="h-4 w-4" />} />
              <LoanResult label="Total amount payable" value={fmt(result.totalPaid)} icon={<TrendingUp className="h-4 w-4" />} strong />
            </div>
          </div>
        </div>

        <div className="border-t bg-white p-5 sm:p-7 md:p-9">
          <div className="mb-5"><h3 className="text-xl font-bold text-slate-800">First-year repayment schedule</h3><p className="mt-1 text-sm text-slate-500">See how each payment is divided between interest and principal.</p></div>
          <div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Month</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Principal</th><th className="px-4 py-3">Interest</th><th className="px-4 py-3">Balance</th></tr></thead><tbody>{result.rows.map(r => <tr key={r.month} className="border-t"><td className="px-4 py-3 font-medium">{r.month}</td><td className="px-4 py-3">{fmt(r.payment)}</td><td className="px-4 py-3 text-emerald-600">{fmt(r.principal)}</td><td className="px-4 py-3">{fmt(r.interest)}</td><td className="px-4 py-3">{fmt(r.balance)}</td></tr>)}</tbody></table></div>
          <p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" />This online loan calculator is an estimate. Actual EMI can differ because lenders may apply different rates, fees, insurance, taxes, rounding rules, payment dates or other loan conditions.</p>
        </div>
      </CardContent>
    </Card>
  );
}


function InvestmentReturnCalculator() {
  const [initial, setInitial] = useState(10000);
  const [contribution, setContribution] = useState(500);
  const [returnRate, setReturnRate] = useState(8);
  const [years, setYears] = useState(20);
  const [frequency, setFrequency] = useState(12);
  const [currency, setCurrency] = useState('USD');

  const result = useMemo(() => {
    const periods = Math.max(1, Math.round(years * frequency));
    const ratePerPeriod = returnRate / 100 / frequency;
    const growthFactor = Math.pow(1 + ratePerPeriod, periods);
    const initialGrowth = initial * growthFactor;
    const contributionGrowth = ratePerPeriod === 0
      ? contribution * periods
      : contribution * ((growthFactor - 1) / ratePerPeriod);
    const invested = initial + contribution * periods;
    const futureValue = Math.max(0, initialGrowth + contributionGrowth);
    const gain = Math.max(0, futureValue - invested);
    const growthShare = futureValue > 0 ? Math.min(100, gain / futureValue * 100) : 0;
    const schedule: { year: number; invested: number; growth: number; value: number }[] = [];
    for (let year = 1; year <= Math.min(years, 30); year++) {
      const p = Math.max(1, Math.round(year * frequency));
      const gf = Math.pow(1 + ratePerPeriod, p);
      const iv = initial * gf;
      const cv = ratePerPeriod === 0 ? contribution * p : contribution * ((gf - 1) / ratePerPeriod);
      const value = Math.max(0, iv + cv);
      const contributed = initial + contribution * p;
      schedule.push({ year, invested: contributed, growth: Math.max(0, value - contributed), value });
    }
    return { periods, invested, futureValue, gain, growthShare, schedule };
  }, [initial, contribution, returnRate, years, frequency]);

  const fmt = (n: number) => money(n, currency);
  const frequencyLabel = frequency === 1 ? 'year' : frequency === 4 ? 'quarter' : frequency === 12 ? 'month' : frequency === 26 ? '2 weeks' : frequency === 52 ? 'week' : `${frequency} times/year`;

  return <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
    <CardContent className="p-0">
      <div className="grid lg:grid-cols-[1.15fr_.85fr]">
        <div className="p-5 sm:p-7 md:p-9">
          <div className="mb-7 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Online Investment Return Calculator</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">Estimate your investment growth</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Project a potential future value from your starting investment, regular contributions, expected return and time horizon.</p>
            </div>
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 sm:flex"><TrendingUp className="h-5 w-5" /></div>
          </div>
          <div className="mb-5 flex items-center gap-3 rounded-2xl border bg-slate-50/80 p-3">
            <Label className="shrink-0">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}><SelectTrigger className="w-32 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="INR">INR (₹)</SelectItem></SelectContent></Select>
          </div>
          <LoanSlider label="Initial investment" value={initial} min={0} max={5000000} step={1000} prefix={currency === 'INR' ? '₹' : '$'} onChange={setInitial} />
          <LoanSlider label="Regular contribution" value={contribution} min={0} max={500000} step={100} prefix={currency === 'INR' ? '₹' : '$'} onChange={setContribution} />
          <LoanSlider label="Expected annual return" value={returnRate} min={0} max={30} step={0.1} suffix="%" onChange={setReturnRate} />
          <LoanSlider label="Investment period" value={years} min={1} max={50} step={1} suffix="yr" onChange={setYears} />
          <div className="mt-5 rounded-2xl border bg-slate-50/80 p-4">
            <Label>Contribution frequency</Label>
            <Select value={String(frequency)} onValueChange={v => setFrequency(Number(v))}><SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Annually</SelectItem><SelectItem value="4">Quarterly</SelectItem><SelectItem value="12">Monthly</SelectItem><SelectItem value="26">Every 2 weeks</SelectItem><SelectItem value="52">Weekly</SelectItem></SelectContent></Select>
            <p className="mt-2 text-xs text-slate-500">Recurring contribution is assumed at the selected frequency for the projection.</p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="text-sm text-slate-500">Estimated future value</p><p className="mt-1 text-2xl font-bold text-emerald-600">{fmt(result.futureValue)}</p></div><div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4"><p className="text-sm text-slate-500">Estimated investment gain</p><p className="mt-1 text-2xl font-bold text-indigo-600">{fmt(result.gain)}</p></div></div>
        </div>
        <div className="border-t bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-5 sm:p-7 lg:border-l lg:border-t-0 md:p-9">
          <div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-700">Investment growth meter</p><p className="text-xs text-slate-500">Your contributions compared with projected growth</p></div><TrendingUp className="h-5 w-5 text-emerald-500" /></div>
          <div className="mx-auto my-5 flex max-w-[300px] items-center justify-center"><div className="relative h-56 w-56 rounded-full" style={{ background: `conic-gradient(#5065f6 0 ${Math.max(0, Math.min(100, 100 - result.growthShare)).toFixed(2)}%, #dfe5ff ${Math.max(0, Math.min(100, 100 - result.growthShare)).toFixed(2)}% 100%)` }}><div className="absolute inset-[28px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner"><span className="text-xs font-medium text-slate-500">Future value</span><strong className="mt-1 text-2xl font-bold text-slate-800">{fmt(result.futureValue)}</strong><span className="mt-1 text-xs text-emerald-600">{returnRate.toFixed(1)}% assumed return</span></div></div></div>
          <div className="flex justify-center gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#5065f6]" /> Contributions</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#dfe5ff]" /> Growth</span></div>
          <div className="mt-8 space-y-4"><LoanResult label="Total invested" value={fmt(result.invested)} icon={<WalletCards className="h-4 w-4" />} /><LoanResult label="Projected growth" value={fmt(result.gain)} icon={<CircleDollarSign className="h-4 w-4" />} /><LoanResult label="Projected future value" value={fmt(result.futureValue)} icon={<TrendingUp className="h-4 w-4" />} strong /><LoanResult label="Contribution schedule" value={frequencyLabel} icon={<Calculator className="h-4 w-4" />} /></div>
        </div>
      </div>
      <div className="border-t bg-white p-5 sm:p-7 md:p-9"><div className="mb-5"><h3 className="text-xl font-bold text-slate-800">Investment growth projection</h3><p className="mt-1 text-sm text-slate-500">See how your estimated balance could develop over the selected time horizon.</p></div><div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Year</th><th className="px-4 py-3">Total invested</th><th className="px-4 py-3">Growth</th><th className="px-4 py-3">Estimated value</th></tr></thead><tbody>{result.schedule.map(r => <tr key={r.year} className="border-t"><td className="px-4 py-3 font-medium">{r.year}</td><td className="px-4 py-3">{fmt(r.invested)}</td><td className="px-4 py-3 text-emerald-600">{fmt(r.growth)}</td><td className="px-4 py-3 font-semibold">{fmt(r.value)}</td></tr>)}</tbody></table></div><p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" />This is a mathematical projection based on the return assumption you enter. Investment returns are not guaranteed, and actual results can vary because of market performance, fees, taxes, inflation and timing.</p></div>
    </CardContent>
  </Card>;
}

function ROICalculator() {
  const [initial, setInitial] = useState(10000);
  const [finalValue, setFinalValue] = useState(12500);
  const [additionalCosts, setAdditionalCosts] = useState(0);
  const [years, setYears] = useState(1);
  const [currency, setCurrency] = useState('USD');

  const result = useMemo(() => {
    const totalInvested = Math.max(0, initial) + Math.max(0, additionalCosts);
    const endingValue = Math.max(0, finalValue);
    const profit = endingValue - totalInvested;
    const roi = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
    const multiple = totalInvested > 0 ? endingValue / totalInvested : 0;
    const annualized = totalInvested > 0 && endingValue > 0 && years > 0
      ? (Math.pow(endingValue / totalInvested, 1 / years) - 1) * 100
      : 0;
    const growthShare = endingValue > 0 ? Math.max(0, Math.min(100, profit / endingValue * 100)) : 0;
    const projection: { year: number; value: number; profit: number }[] = [];
    for (let year = 1; year <= Math.min(30, Math.max(1, Math.round(years))); year++) {
      const value = totalInvested > 0 && endingValue > 0
        ? totalInvested * Math.pow(endingValue / totalInvested, year / years)
        : totalInvested;
      projection.push({ year, value, profit: value - totalInvested });
    }
    return { totalInvested, endingValue, profit, roi, multiple, annualized, growthShare, projection };
  }, [initial, finalValue, additionalCosts, years]);

  const fmt = (n: number) => money(n, currency);
  const positive = result.profit >= 0;
  const investedShare = result.endingValue > 0 ? Math.max(0, Math.min(100, 100 - result.growthShare)) : 100;
  const roiColor = positive ? 'text-emerald-600' : 'text-rose-600';
  const ringColor = positive ? '#5065f6' : '#ef4444';

  return <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
    <CardContent className="p-0">
      <div className="grid lg:grid-cols-[1.15fr_.85fr]">
        <div className="p-5 sm:p-7 md:p-9">
          <div className="mb-7 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Online ROI Calculator</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">Measure your return on investment</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Compare what you put into an investment with what it is worth now. Include extra costs to get a more realistic ROI, profit or loss and annualized return.</p>
            </div>
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 sm:flex"><TrendingUp className="h-5 w-5" /></div>
          </div>
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border bg-slate-50/80 p-3">
            <div><Label>Currency</Label><p className="mt-0.5 text-xs text-slate-500">Used for money results</p></div>
            <Select value={currency} onValueChange={setCurrency}><SelectTrigger className="w-32 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="INR">INR (₹)</SelectItem></SelectContent></Select>
          </div>
          <LoanSlider label="Initial investment" value={initial} min={0} max={5000000} step={1000} prefix={currency === 'INR' ? '₹' : '$'} onChange={setInitial} />
          <LoanSlider label="Current / final value" value={finalValue} min={0} max={10000000} step={1000} prefix={currency === 'INR' ? '₹' : '$'} onChange={setFinalValue} />
          <LoanSlider label="Additional costs" value={additionalCosts} min={0} max={1000000} step={1000} prefix={currency === 'INR' ? '₹' : '$'} onChange={setAdditionalCosts} />
          <LoanSlider label="Holding period" value={years} min={1} max={30} step={1} suffix="yr" onChange={setYears} />
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className={`rounded-2xl border p-4 ${positive ? 'border-emerald-100 bg-emerald-50/70' : 'border-rose-100 bg-rose-50/70'}`}><p className="text-sm text-slate-500">ROI</p><p className={`mt-1 text-2xl font-bold ${roiColor}`}>{pct(result.roi)}</p></div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4"><p className="text-sm text-slate-500">Profit / loss</p><p className={`mt-1 text-2xl font-bold ${positive ? 'text-indigo-600' : 'text-rose-600'}`}>{fmt(result.profit)}</p></div>
          </div>
        </div>
        <div className="border-t bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-5 sm:p-7 lg:border-l lg:border-t-0 md:p-9">
          <div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-700">ROI performance meter</p><p className="text-xs text-slate-500">Investment base compared with the ending value</p></div><TrendingUp className={`h-5 w-5 ${positive ? 'text-emerald-500' : 'text-rose-500'}`} /></div>
          <div className="mx-auto my-5 flex max-w-[300px] items-center justify-center"><div className="relative h-56 w-56 rounded-full" style={{ background: `conic-gradient(${ringColor} 0 ${investedShare.toFixed(2)}%, #e9edff ${investedShare.toFixed(2)}% 100%)` }}><div className="absolute inset-[28px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner"><span className="text-xs font-medium text-slate-500">Return on investment</span><strong className={`mt-1 text-3xl font-bold ${roiColor}`}>{pct(result.roi)}</strong><span className="mt-1 text-xs text-slate-500">{result.multiple.toFixed(2)}× return multiple</span></div></div></div>
          <div className="flex justify-center gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#5065f6]" /> Investment base</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#e9edff]" /> Value change</span></div>
          <div className="mt-8 space-y-4"><LoanResult label="Total invested" value={fmt(result.totalInvested)} icon={<WalletCards className="h-4 w-4" />} /><LoanResult label="Ending value" value={fmt(result.endingValue)} icon={<CircleDollarSign className="h-4 w-4" />} strong /><LoanResult label="Net profit / loss" value={fmt(result.profit)} icon={<TrendingUp className="h-4 w-4" />} /><LoanResult label="Annualized return" value={pct(result.annualized)} icon={<Calculator className="h-4 w-4" />} /></div>
        </div>
      </div>
      <div className="border-t bg-white p-5 sm:p-7 md:p-9">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-xl font-bold text-slate-800">ROI growth projection</h3><p className="mt-1 text-sm text-slate-500">A smooth annual path implied by the selected beginning value, ending value and holding period.</p></div><div className="rounded-xl bg-slate-50 px-4 py-2 text-xs text-slate-500">Return multiple: <strong className="text-slate-800">{result.multiple.toFixed(2)}×</strong></div></div>
        <div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[600px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Year</th><th className="px-4 py-3">Estimated value</th><th className="px-4 py-3">Profit / loss</th><th className="px-4 py-3">Implied ROI</th></tr></thead><tbody>{result.projection.map(r => <tr key={r.year} className="border-t"><td className="px-4 py-3 font-medium">{r.year}</td><td className="px-4 py-3 font-semibold">{fmt(r.value)}</td><td className={`px-4 py-3 ${r.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(r.profit)}</td><td className={`px-4 py-3 font-semibold ${r.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{pct(result.totalInvested > 0 ? r.profit / result.totalInvested * 100 : 0)}</td></tr>)}</tbody></table></div>
        <div className="mt-5 grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ROI formula</p><p className="mt-2 text-sm leading-6 text-slate-700">(Ending value − total invested) ÷ total invested × 100</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Return multiple</p><p className="mt-2 text-sm leading-6 text-slate-700">Ending value ÷ total invested. A 1.50× result means the ending value is 150% of the investment base.</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Important</p><p className="mt-2 text-sm leading-6 text-amber-900">ROI does not automatically account for taxes, inflation, financing costs, risk or cash-flow timing.</p></div></div>
        <p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" />This calculator provides a mathematical comparison, not an investment recommendation. Actual outcomes can differ because values, fees, taxes and timing change over time.</p>
      </div>
    </CardContent>
  </Card>;
}

function CarLoanCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState(2500000);
  const [downPayment, setDownPayment] = useState(500000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(5);
  const [extra, setExtra] = useState(0);
  const [tradeIn, setTradeIn] = useState(0);
  const [fees, setFees] = useState(0);
  const currency = 'INR';

  const result = useMemo(() => {
    const financed = Math.max(0, vehiclePrice - downPayment - tradeIn + fees);
    const months = Math.max(1, Math.round(years * 12));
    const monthlyRate = rate / 100 / 12;
    const basePayment = monthlyRate === 0 ? financed / months : financed * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    const payment = basePayment + Math.max(0, extra);
    let balance = financed, totalInterest = 0, totalPaid = 0, actualMonths = 0;
    const rows: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];
    while (balance > 0.01 && actualMonths < 1200) {
      actualMonths += 1;
      const interest = monthlyRate === 0 ? 0 : balance * monthlyRate;
      const principal = Math.min(balance, Math.max(0, payment - interest));
      const actualPayment = principal + interest;
      balance = Math.max(0, balance - principal);
      totalInterest += interest;
      totalPaid += actualPayment;
      if (rows.length < 12 || balance === 0) rows.push({ month: actualMonths, payment: actualPayment, principal, interest, balance });
      if (principal <= 0 && interest > 0) break;
    }
    const regularInterest = Math.max(0, basePayment * months - financed);
    const principalShare = totalPaid > 0 ? financed / totalPaid : 1;
    const payoffLabel = actualMonths >= 12 ? `${Math.floor(actualMonths / 12)}y ${actualMonths % 12 ? `${actualMonths % 12}m` : ''}`.trim() : `${actualMonths}m`;
    const cashUpfront = Math.max(0, downPayment + tradeIn);
    const totalVehicleCost = cashUpfront + fees + totalPaid;
    const loanCostShare = totalPaid > 0 ? totalInterest / totalPaid * 100 : 0;
    const schedule: { year: number; interest: number; principal: number; balance: number }[] = [];
    let b = financed;
    for (let year = 1; year <= Math.min(years, 10); year++) {
      let yi = 0, yp = 0;
      for (let m = 0; m < 12 && b > 0.01; m++) {
        const i = monthlyRate === 0 ? 0 : b * monthlyRate;
        const pr = Math.min(b, Math.max(0, payment - i));
        yi += i; yp += pr; b = Math.max(0, b - pr);
      }
      schedule.push({ year, interest: yi, principal: yp, balance: b });
    }
    return { financed, basePayment, payment, totalInterest, totalPaid, actualMonths, principalShare, rows, payoffLabel, regularInterest, interestSaved: Math.max(0, regularInterest - totalInterest), cashUpfront, totalVehicleCost, loanCostShare, schedule };
  }, [vehiclePrice, downPayment, rate, years, extra, tradeIn, fees]);

  const fmt = (n: number) => money(n, currency);
  const principalPct = Math.max(0, Math.min(100, result.principalShare * 100));
  const downPct = vehiclePrice > 0 ? Math.min(100, (downPayment + tradeIn) / vehiclePrice * 100) : 0;

  return <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
    <CardContent className="p-0">
      <div className="grid lg:grid-cols-[1.15fr_.85fr]">
        <div className="p-5 sm:p-7 md:p-9">
          <div className="mb-7 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Advanced Car Loan Calculator</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">Estimate your car payment and financing cost</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Adjust the vehicle price, upfront payment, interest rate, term and extra payment to see what you may pay each month and over the life of the auto loan.</p>
            </div>
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 sm:flex"><CircleDollarSign className="h-5 w-5" /></div>
          </div>
          <div className="mb-5 rounded-2xl border bg-slate-50/80 p-4">
            <div className="flex items-center justify-between gap-3"><div><Label>Vehicle price</Label><p className="mt-0.5 text-xs text-slate-500">Use the negotiated purchase price before financing.</p></div><span className="rounded-xl bg-white px-3 py-2 text-lg font-bold text-slate-800">{fmt(vehiclePrice)}</span></div>
          </div>
          <LoanSlider label="Vehicle price" value={vehiclePrice} min={100000} max={10000000} step={10000} prefix="₹" onChange={setVehiclePrice} />
          <LoanSlider label="Down payment" value={downPayment} min={0} max={Math.max(100000, vehiclePrice)} step={10000} prefix="₹" onChange={v => setDownPayment(Math.min(v, vehiclePrice))} />
          <LoanSlider label="Interest rate" value={rate} min={0} max={25} step={0.1} suffix="%" onChange={setRate} />
          <LoanSlider label="Loan term" value={years} min={1} max={10} step={1} suffix="yr" onChange={setYears} />
          <LoanSlider label="Extra monthly payment" value={extra} min={0} max={100000} step={500} prefix="₹" onChange={setExtra} />
          <div className="mt-4 grid gap-4 rounded-2xl border bg-slate-50/80 p-4 sm:grid-cols-2">
            <div><Label>Trade-in value</Label><Input className="mt-1 bg-white" type="number" min="0" value={tradeIn} onChange={e => setTradeIn(Math.max(0, Number(e.target.value) || 0))} /><p className="mt-1 text-xs text-slate-500">Applied as an upfront credit toward the vehicle.</p></div>
            <div><Label>Loan fees added to financing</Label><Input className="mt-1 bg-white" type="number" min="0" value={fees} onChange={e => setFees(Math.max(0, Number(e.target.value) || 0))} /><p className="mt-1 text-xs text-slate-500">Examples: lender or documentation fees you choose to finance.</p></div>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="text-sm text-slate-500">Monthly car payment</p><p className="mt-1 text-2xl font-bold text-emerald-600">{fmt(result.payment)}</p></div><div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4"><p className="text-sm text-slate-500">Amount financed</p><p className="mt-1 text-2xl font-bold text-indigo-600">{fmt(result.financed)}</p></div></div>
        </div>
        <div className="border-t bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-5 sm:p-7 lg:border-l lg:border-t-0 md:p-9">
          <div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-700">Auto loan cost meter</p><p className="text-xs text-slate-500">Principal versus interest across scheduled payments</p></div><WalletCards className="h-5 w-5 text-emerald-500" /></div>
          <div className="mx-auto my-5 flex max-w-[300px] items-center justify-center"><div className="relative h-56 w-56 rounded-full" style={{ background: `conic-gradient(#5065f6 0 ${principalPct.toFixed(2)}%, #dfe5ff ${principalPct.toFixed(2)}% 100%)` }}><div className="absolute inset-[28px] flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner"><span className="text-xs font-medium text-slate-500">Monthly payment</span><strong className="mt-1 text-2xl font-bold text-slate-800">{fmt(result.payment)}</strong><span className="mt-1 text-xs text-emerald-600">{rate.toFixed(1)}% APR assumption</span></div></div></div>
          <div className="flex justify-center gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#5065f6]" /> Principal</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#dfe5ff]" /> Interest</span></div>
          <div className="mt-8 space-y-3"><LoanResult label="Total interest" value={fmt(result.totalInterest)} icon={<TrendingUp className="h-4 w-4" />} /><LoanResult label="Total loan payments" value={fmt(result.totalPaid)} icon={<WalletCards className="h-4 w-4" />} strong /><LoanResult label="Cash upfront" value={fmt(result.cashUpfront)} icon={<CircleDollarSign className="h-4 w-4" />} /><LoanResult label="Estimated payoff" value={result.payoffLabel} icon={<Calculator className="h-4 w-4" />} /><LoanResult label="Estimated interest saved" value={fmt(result.interestSaved)} icon={<TrendingUp className="h-4 w-4" />} /></div>
          <div className="mt-4 rounded-2xl bg-white p-4 text-xs leading-5 text-slate-500 shadow-sm"><strong className="text-slate-700">Down payment + trade-in:</strong> {downPct.toFixed(0)}% of vehicle price. A larger upfront contribution can reduce the amount financed and future interest.</div>
        </div>
      </div>
      <div className="border-t bg-white p-5 sm:p-7 md:p-9">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-xl font-bold text-slate-800">Car loan amortization schedule</h3><p className="mt-1 text-sm text-slate-500">See how the balance changes as payments are split between principal and interest.</p></div><div className="rounded-xl bg-slate-50 px-4 py-2 text-xs text-slate-500">Vehicle cost including financing: <strong className="text-slate-800">{fmt(result.totalVehicleCost)}</strong></div></div>
        <div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Year</th><th className="px-4 py-3">Interest</th><th className="px-4 py-3">Principal</th><th className="px-4 py-3">Ending balance</th></tr></thead><tbody>{result.schedule.map(r => <tr key={r.year} className="border-t"><td className="px-4 py-3 font-medium">{r.year}</td><td className="px-4 py-3">{fmt(r.interest)}</td><td className="px-4 py-3 text-emerald-600">{fmt(r.principal)}</td><td className="px-4 py-3 font-semibold">{fmt(r.balance)}</td></tr>)}</tbody></table></div>
        <div className="mt-5 grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Financed amount</p><p className="mt-2 text-sm leading-6 text-slate-700">Vehicle price minus down payment and trade-in, plus any fees you choose to finance.</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment trade-off</p><p className="mt-2 text-sm leading-6 text-slate-700">A longer term can lower the monthly payment but usually increases the total interest paid.</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Ownership costs</p><p className="mt-2 text-sm leading-6 text-amber-900">Fuel, insurance, registration, maintenance and depreciation are not included in the financing result.</p></div></div>
        <p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" />This car-loan calculator is an estimate for planning. Actual APR, taxes, lender fees, payment timing, insurance requirements and approved terms can change the final payment and total cost.</p>
      </div>
    </CardContent>
  </Card>;
}

function PersonalLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(5);
  const [extra, setExtra] = useState(0);
  const currency = 'INR';

  const result = useMemo(() => {
    const months = Math.max(1, Math.round(years * 12));
    const monthlyRate = rate / 100 / 12;
    const basePayment = monthlyRate === 0 ? loanAmount / months : loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    const payment = basePayment + extra;
    let balance = loanAmount, totalInterest = 0, totalPaid = 0, actualMonths = 0;
    const rows: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];
    while (balance > 0.01 && actualMonths < 1200) {
      actualMonths += 1;
      const interest = monthlyRate === 0 ? 0 : balance * monthlyRate;
      const principal = Math.min(balance, Math.max(0, payment - interest));
      const actualPayment = principal + interest;
      balance = Math.max(0, balance - principal);
      totalInterest += interest; totalPaid += actualPayment;
      if (rows.length < 12 || balance === 0) rows.push({ month: actualMonths, payment: actualPayment, principal, interest, balance });
      if (principal <= 0 && interest > 0) break;
    }
    const principalShare = totalPaid > 0 ? loanAmount / totalPaid : 1;
    const payoffLabel = actualMonths >= 12 ? `${Math.floor(actualMonths / 12)}y ${actualMonths % 12 ? `${actualMonths % 12}m` : ''}`.trim() : `${actualMonths}m`;
    const regularInterest = Math.max(0, basePayment * months - loanAmount);
    return { payment, totalInterest, totalPaid, actualMonths, principalShare, rows, payoffLabel, interestSaved: Math.max(0, regularInterest - totalInterest) };
  }, [loanAmount, rate, years, extra]);

  const fmt = (n: number) => money(n, currency);
  const donut = `${Math.max(0, Math.min(100, result.principalShare * 100))}%`;
  return (
    <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-5 sm:p-7 md:p-9">
            <div className="mb-7 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Online Personal Loan Calculator</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">Estimate your personal loan payment</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Adjust the amount, interest rate and repayment period to compare your monthly payment, borrowing cost and the effect of paying extra.</p></div><div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 sm:flex"><Calculator className="h-5 w-5" /></div></div>
            <LoanSlider label="Personal loan amount" value={loanAmount} min={10000} max={5000000} step={10000} onChange={setLoanAmount} />
            <LoanSlider label="Interest rate (p.a.)" value={rate} min={0} max={36} step={0.1} onChange={setRate} />
            <LoanSlider label="Repayment tenure" value={years} min={1} max={10} step={1} onChange={setYears} />
            <LoanSlider label="Extra monthly payment" value={extra} min={0} max={100000} step={1000} onChange={setExtra} />
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="text-sm text-slate-500">Monthly payment</p><p className="mt-1 text-2xl font-bold text-emerald-600">{fmt(result.payment)}</p></div><div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4"><p className="text-sm text-slate-500">Estimated payoff</p><p className="mt-1 text-2xl font-bold text-indigo-600">{result.payoffLabel}</p></div></div>
          </div>
          <div className="border-t bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-5 sm:p-7 lg:border-l lg:border-t-0 md:p-9">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-700">Personal loan cost meter</p><p className="text-xs text-slate-500">Principal compared with interest</p></div><TrendingUp className="h-5 w-5 text-emerald-500" /></div>
            <div className="mx-auto my-5 flex max-w-[300px] items-center justify-center"><div className="relative h-56 w-56 rounded-full" style={{ background: `conic-gradient(#5065f6 0 ${donut}, #e9edff ${donut} 100%)` }}><div className="absolute inset-[28px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner"><span className="text-xs font-medium text-slate-500">Monthly payment</span><strong className="mt-1 text-2xl font-bold text-slate-800">{fmt(result.payment)}</strong><span className="mt-1 text-xs text-emerald-600">{rate.toFixed(1)}% p.a.</span></div></div></div>
            <div className="flex justify-center gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#5065f6]" /> Principal</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#e9edff]" /> Interest</span></div>
            <div className="mt-8 space-y-4"><LoanResult label="Principal borrowed" value={fmt(loanAmount)} icon={<WalletCards className="h-4 w-4" />} /><LoanResult label="Total interest" value={fmt(result.totalInterest)} icon={<CircleDollarSign className="h-4 w-4" />} /><LoanResult label="Total amount paid" value={fmt(result.totalPaid)} icon={<TrendingUp className="h-4 w-4" />} strong />{extra > 0 && <LoanResult label="Estimated interest saved" value={fmt(result.interestSaved)} icon={<TrendingUp className="h-4 w-4" />} />}</div>
          </div>
        </div>
        <div className="border-t bg-white p-5 sm:p-7 md:p-9"><div className="mb-5"><h3 className="text-xl font-bold text-slate-800">Personal loan repayment schedule</h3><p className="mt-1 text-sm text-slate-500">Review the first 12 payments and see how interest, principal and balance change over time.</p></div><div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Month</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Principal</th><th className="px-4 py-3">Interest</th><th className="px-4 py-3">Balance</th></tr></thead><tbody>{result.rows.map(r => <tr key={r.month} className="border-t"><td className="px-4 py-3 font-medium">{r.month}</td><td className="px-4 py-3">{fmt(r.payment)}</td><td className="px-4 py-3 text-emerald-600">{fmt(r.principal)}</td><td className="px-4 py-3">{fmt(r.interest)}</td><td className="px-4 py-3">{fmt(r.balance)}</td></tr>)}</tbody></table></div><p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" />This estimate is for planning and comparison. Actual lender payments can differ because of APRs, fees, payment dates, rounding and other loan terms.</p></div>
      </CardContent>
    </Card>
  );
}


function StudentLoanCalculator() {
  const [balance, setBalance] = useState(250000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(10);
  const [extra, setExtra] = useState(0);
  const [graceInterest, setGraceInterest] = useState(0);
  const currency = 'USD';

  const result = useMemo(() => {
    const startingBalance = Math.max(0, balance + Math.max(0, graceInterest));
    const months = Math.max(1, Math.round(years * 12));
    const r = rate / 100 / 12;
    const basePayment = r === 0 ? startingBalance / months : startingBalance * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    const payment = basePayment + Math.max(0, extra);
    let b = startingBalance, totalInterest = 0, totalPaid = 0, actualMonths = 0;
    const rows: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];
    const annual: { year: number; interest: number; principal: number; balance: number }[] = [];
    let yi = 0, yp = 0;
    while (b > 0.01 && actualMonths < 1200) {
      actualMonths += 1;
      const interest = r === 0 ? 0 : b * r;
      const principal = Math.min(b, Math.max(0, payment - interest));
      const actualPayment = principal + interest;
      b = Math.max(0, b - principal);
      totalInterest += interest; totalPaid += actualPayment;
      yi += interest; yp += principal;
      if (rows.length < 12 || b === 0) rows.push({ month: actualMonths, payment: actualPayment, principal, interest, balance: b });
      if (actualMonths % 12 === 0 || b === 0) { annual.push({ year: Math.ceil(actualMonths / 12), interest: yi, principal: yp, balance: b }); yi = 0; yp = 0; }
      if (principal <= 0 && interest > 0) break;
    }
    const regularInterest = Math.max(0, basePayment * months - startingBalance);
    const principalShare = totalPaid > 0 ? startingBalance / totalPaid : 1;
    const payoffLabel = actualMonths >= 12 ? `${Math.floor(actualMonths / 12)}y ${actualMonths % 12 ? `${actualMonths % 12}m` : ''}`.trim() : `${actualMonths}m`;
    return { startingBalance, basePayment, payment, totalInterest, totalPaid, actualMonths, rows, annual, regularInterest, interestSaved: Math.max(0, regularInterest - totalInterest), principalShare, payoffLabel };
  }, [balance, rate, years, extra, graceInterest]);

  const fmt = (n: number) => money(n, currency);
  const principalPct = Math.max(0, Math.min(100, result.principalShare * 100));
  const interestPct = 100 - principalPct;

  return <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
    <CardContent className="p-0">
      <div className="border-b bg-gradient-to-r from-sky-50 via-white to-indigo-50 px-5 py-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Advanced Student Loan Calculator</p><h2 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">Plan your student loan repayment</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Estimate your monthly payment, total interest and payoff time, then test how an extra monthly payment could change the cost of education debt.</p></div>
          <div className="rounded-2xl bg-indigo-600 px-5 py-3 text-right text-white shadow-sm"><div className="text-xs opacity-80">Estimated monthly payment</div><div className="text-2xl font-black">{fmt(result.payment)}</div></div>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1.08fr_.92fr]">
        <div className="space-y-5 p-5 sm:p-7 md:p-8">
          <LoanSlider label="Current student loan balance" value={balance} min={1000} max={500000} step={1000} prefix="$" onChange={setBalance} />
          <LoanSlider label="Interest rate" value={rate} min={0} max={20} step={0.1} suffix="%" onChange={setRate} />
          <LoanSlider label="Repayment term" value={years} min={1} max={30} step={1} suffix="yr" onChange={setYears} />
          <LoanSlider label="Extra monthly payment" value={extra} min={0} max={5000} step={25} prefix="$" onChange={setExtra} />
          <div className="rounded-2xl border bg-slate-50/80 p-4"><Label>Interest already added to the balance</Label><Input className="mt-1 bg-white" type="number" min="0" step="100" value={graceInterest} onChange={e=>setGraceInterest(num(e.target.value))}/><p className="mt-2 text-xs leading-5 text-slate-500">Use this for accrued interest that has already been capitalized. Leave it at zero when your entered balance already includes that interest.</p></div>
          <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4"><p className="text-sm text-slate-500">Monthly payment</p><p className="mt-1 text-2xl font-bold text-indigo-600">{fmt(result.payment)}</p></div><div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="text-sm text-slate-500">Estimated payoff</p><p className="mt-1 text-2xl font-bold text-emerald-600">{result.payoffLabel}</p></div></div>
        </div>
        <div className="border-t bg-gradient-to-br from-slate-50 via-white to-indigo-50/70 p-5 sm:p-7 lg:border-l lg:border-t-0 md:p-8">
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-500">Repayment cost meter</p><p className="text-xs text-slate-400">Principal compared with interest</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">{interestPct.toFixed(0)}% interest</span></div>
            <div className="mx-auto my-7 flex h-56 w-56 items-center justify-center rounded-full" style={{background:`conic-gradient(#5065f6 0 ${principalPct}%, #e9edff ${principalPct}% 100%)`}}><div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white text-center shadow-inner"><span className="text-xs text-slate-400">Monthly payment</span><strong className="mt-1 text-2xl font-black text-slate-800">{fmt(result.payment)}</strong><span className="mt-1 text-xs text-indigo-600">{rate.toFixed(1)}% rate</span></div></div>
            <div className="flex justify-center gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#5065f6]"/> Principal</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#e9edff]"/> Interest</span></div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1"><LoanResult label="Balance being repaid" value={fmt(result.startingBalance)} icon={<WalletCards className="h-4 w-4"/>}/><LoanResult label="Total interest" value={fmt(result.totalInterest)} icon={<CircleDollarSign className="h-4 w-4"/>}/><LoanResult label="Total amount paid" value={fmt(result.totalPaid)} icon={<TrendingUp className="h-4 w-4"/>} strong/>{extra > 0 && <LoanResult label="Estimated interest saved" value={fmt(result.interestSaved)} icon={<TrendingUp className="h-4 w-4"/>}/>}</div>
        </div>
      </div>
      <div className="border-t bg-white p-5 sm:p-7 md:p-9"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-xl font-bold text-slate-800">Student loan repayment schedule</h3><p className="mt-1 text-sm text-slate-500">See the first 12 payments and how your balance changes as principal is repaid.</p></div><div className="rounded-xl bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700">{years} years · {rate.toFixed(1)}% annual rate</div></div>
        <div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Month</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Principal</th><th className="px-4 py-3">Interest</th><th className="px-4 py-3">Balance</th></tr></thead><tbody>{result.rows.map(r=><tr key={r.month} className="border-t"><td className="px-4 py-3 font-medium">{r.month}</td><td className="px-4 py-3">{fmt(r.payment)}</td><td className="px-4 py-3 text-indigo-600">{fmt(r.principal)}</td><td className="px-4 py-3">{fmt(r.interest)}</td><td className="px-4 py-3">{fmt(r.balance)}</td></tr>)}</tbody></table></div>
        <div className="mt-6 overflow-x-auto rounded-2xl border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-indigo-50 text-left text-indigo-900"><tr><th className="px-4 py-3">Year</th><th className="px-4 py-3">Principal repaid</th><th className="px-4 py-3">Interest paid</th><th className="px-4 py-3">Ending balance</th></tr></thead><tbody>{result.annual.slice(0,10).map(r=><tr key={r.year} className="border-t"><td className="px-4 py-3 font-semibold">{r.year}</td><td className="px-4 py-3">{fmt(r.principal)}</td><td className="px-4 py-3">{fmt(r.interest)}</td><td className="px-4 py-3">{fmt(r.balance)}</td></tr>)}</tbody></table></div>
        <div className="mt-6 grid gap-3 md:grid-cols-3"><div className="rounded-2xl border bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Payment formula</p><p className="mt-2 text-sm font-semibold text-slate-700">Payment = principal × monthly rate adjusted for the number of payments.</p></div><div className="rounded-2xl border bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Extra payments</p><p className="mt-2 text-sm font-semibold text-slate-700">Paying additional principal may reduce the payoff time and future interest.</p></div><div className="rounded-2xl border bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Program rules</p><p className="mt-2 text-sm font-semibold text-slate-700">Federal and private loans can have different repayment, deferment and forgiveness rules.</p></div></div>
        <p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0"/>This is a general amortization estimate. It does not calculate income-driven payments, forgiveness, subsidies, deferment, capitalization rules or other program-specific benefits. Confirm your actual payment with your loan servicer.</p>
      </div>
    </CardContent>
  </Card>;
}


function CreditCardPayoffCalculator() {
  const [balance, setBalance] = useState(5000);
  const [apr, setApr] = useState(24);
  const [payment, setPayment] = useState(200);
  const [extra, setExtra] = useState(0);
  const [currency, setCurrency] = useState('USD');

  const result = useMemo(() => {
    const start = Math.max(0, balance);
    const monthlyRate = Math.max(0, apr) / 100 / 12;
    const scheduledPayment = Math.max(1, payment);
    const actualPayment = scheduledPayment + Math.max(0, extra);
    let b = start, interest = 0, months = 0;
    const rows: { month:number; payment:number; interest:number; principal:number; balance:number }[] = [];
    const annual: {year:number; interest:number; principal:number; balance:number}[] = [];
    let yearInterest=0, yearPrincipal=0;
    while (b > 0.01 && months < 1200) {
      months++;
      const i = b * monthlyRate;
      if (actualPayment <= i && monthlyRate > 0) break;
      const principalPaid = Math.min(b, Math.max(0, actualPayment - i));
      const paid = principalPaid + i;
      b = Math.max(0, b - principalPaid);
      interest += i; yearInterest += i; yearPrincipal += principalPaid;
      if (rows.length < 12 || b === 0) rows.push({month:months,payment:paid,interest:i,principal:principalPaid,balance:b});
      if (months % 12 === 0 || b === 0) { annual.push({year:Math.ceil(months/12),interest:yearInterest,principal:yearPrincipal,balance:b}); yearInterest=0; yearPrincipal=0; }
    }
    const impossible = b > 0.01;
    const minPayment = start * monthlyRate;
    const payoff = months >= 12 ? `${Math.floor(months/12)} yr${months%12?' '+months%12+' mo':''}` : `${months} mo`;
    const principalShare = start + interest > 0 ? start/(start+interest)*100 : 100;
    const base = Math.max(1, scheduledPayment);
    let bb=start, bi=0, bm=0;
    while(bb>0.01 && bm<1200){ bm++; const ii=bb*monthlyRate; if(base<=ii&&monthlyRate>0) break; const pp=Math.min(bb,Math.max(0,base-ii)); bb=Math.max(0,bb-pp); bi+=ii; }
    return {start, interest, total:start+interest, months, payoff, rows, annual, impossible, minPayment, principalShare, interestShare:100-principalShare, baselineInterest:bi, baselineMonths:bm, interestSaved:Math.max(0,bi-interest)};
  }, [balance, apr, payment, extra]);

  const fmt=(n:number)=>money(n,currency);
  const arc=Math.min(100,Math.max(0,result.principalShare)).toFixed(2);
  return <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm"><CardContent className="p-0">
    <div className="border-b bg-gradient-to-r from-rose-50 via-white to-indigo-50 px-5 py-5 md:px-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-600">Advanced Credit Card Payoff Calculator</p><h2 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">Build a faster credit card payoff plan</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">See how your balance, APR and monthly payment interact, then test extra payments to estimate payoff time and interest.</p></div><div className="rounded-2xl bg-rose-600 px-5 py-3 text-right text-white shadow-sm"><div className="text-xs opacity-80">Estimated payoff</div><div className="text-2xl font-black">{result.impossible?'No payoff':result.payoff}</div></div></div></div>
    <div className="grid lg:grid-cols-[1.08fr_.92fr]"><div className="space-y-5 p-5 sm:p-7 md:p-8">
      <div className="rounded-2xl border bg-slate-50/70 p-4"><Label>Currency</Label><Select value={currency} onValueChange={setCurrency}><SelectTrigger className="mt-1 bg-white"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="INR">INR (₹)</SelectItem></SelectContent></Select></div>
      <LoanSlider label="Current card balance" value={balance} min={100} max={1000000} step={100} prefix={currency==='INR'?'₹':'$'} onChange={setBalance}/>
      <LoanSlider label="Card APR" value={apr} min={0} max={60} step={0.1} suffix="%" onChange={setApr}/>
      <LoanSlider label="Monthly payment" value={payment} min={25} max={100000} step={25} prefix={currency==='INR'?'₹':'$'} onChange={setPayment}/>
      <LoanSlider label="Extra monthly payment" value={extra} min={0} max={50000} step={25} prefix={currency==='INR'?'₹':'$'} onChange={setExtra}/>
      <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4"><p className="text-sm text-slate-500">Total interest</p><p className="mt-1 text-2xl font-black text-rose-600">{fmt(result.interest)}</p></div><div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="text-sm text-slate-500">Interest saved</p><p className="mt-1 text-2xl font-black text-emerald-600">{fmt(result.interestSaved)}</p></div></div>
    </div><div className="border-t bg-gradient-to-br from-slate-50 via-white to-indigo-50/70 p-5 sm:p-7 lg:border-l lg:border-t-0 md:p-8">
      <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-700">Payoff cost meter</p><p className="text-xs text-slate-500">Starting principal vs estimated interest</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">{result.interestShare.toFixed(0)}% interest</span></div><div className="mx-auto my-7 flex h-56 w-56 items-center justify-center rounded-full" style={{background:`conic-gradient(#5065f6 0 ${arc}%, #e9edff ${arc}% 100%)`}}><div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white text-center shadow-inner"><span className="text-xs text-slate-400">Monthly payment</span><strong className="mt-1 text-2xl font-black text-slate-800">{fmt(actualPayment)}</strong><span className="mt-1 text-xs text-rose-600">{apr.toFixed(1)}% APR</span></div></div><div className="flex justify-center gap-5 text-xs text-slate-500"><span>● Principal</span><span>● Interest</span></div></div>
      <div className="mt-5 space-y-3"><LoanResult label="Starting balance" value={fmt(result.start)} icon={<WalletCards className="h-4 w-4"/>}/><LoanResult label="Total amount paid" value={fmt(result.total)} icon={<CircleDollarSign className="h-4 w-4"/>} strong/><LoanResult label="Minimum interest-only amount" value={fmt(result.minPayment)} icon={<Info className="h-4 w-4"/>}/></div>
    </div></div>
    <div className="border-t bg-white p-5 sm:p-7 md:p-9"><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-xl font-black text-slate-800">Credit card payoff schedule</h3><p className="mt-1 text-sm text-slate-500">Review the first payments and annual progress under the selected payment plan.</p></div><div className="rounded-xl bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700">{payment.toLocaleString()} + {extra.toLocaleString()} extra / month</div></div>
      {result.impossible ? <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800"><strong>Payment is too low to pay off the balance.</strong> Your planned payment does not exceed the first month&apos;s interest. Increase the monthly payment before relying on a payoff date.</div> : <><div className="mt-5 overflow-x-auto rounded-2xl border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Month</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Principal</th><th className="px-4 py-3">Interest</th><th className="px-4 py-3">Balance</th></tr></thead><tbody>{result.rows.map(r=><tr key={r.month} className="border-t"><td className="px-4 py-3 font-semibold">{r.month}</td><td className="px-4 py-3">{fmt(r.payment)}</td><td className="px-4 py-3 text-indigo-600">{fmt(r.principal)}</td><td className="px-4 py-3">{fmt(r.interest)}</td><td className="px-4 py-3">{fmt(r.balance)}</td></tr>)}</tbody></table></div><div className="mt-6 overflow-x-auto rounded-2xl border"><table className="w-full min-w-[600px] text-sm"><thead className="bg-indigo-50 text-left text-indigo-900"><tr><th className="px-4 py-3">Year</th><th className="px-4 py-3">Principal repaid</th><th className="px-4 py-3">Interest</th><th className="px-4 py-3">Ending balance</th></tr></thead><tbody>{result.annual.slice(0,10).map(r=><tr key={r.year} className="border-t"><td className="px-4 py-3 font-semibold">{r.year}</td><td className="px-4 py-3">{fmt(r.principal)}</td><td className="px-4 py-3 text-rose-600">{fmt(r.interest)}</td><td className="px-4 py-3">{fmt(r.balance)}</td></tr>)}</tbody></table></div></>}
      <div className="mt-6 grid gap-3 md:grid-cols-3"><div className="rounded-2xl border bg-rose-50/60 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-rose-700">APR effect</p><p className="mt-2 text-sm font-semibold text-slate-700">Higher APR increases periodic interest</p><p className="mt-1 text-xs text-slate-500">The estimate applies the APR as a monthly rate to the modeled balance.</p></div><div className="rounded-2xl border bg-emerald-50/60 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Extra payments</p><p className="mt-2 text-sm font-semibold text-slate-700">More principal can disappear sooner</p><p className="mt-1 text-xs text-slate-500">Testing an affordable extra amount shows the potential change in payoff time and interest.</p></div><div className="rounded-2xl border bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Real-world check</p><p className="mt-2 text-sm font-semibold text-slate-700">Cards can behave differently</p><p className="mt-1 text-xs text-slate-500">New purchases, fees, promotional APRs, daily interest and issuer payment rules can change actual results.</p></div></div>
      <p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0"/>This calculator is a planning estimate. It assumes no new purchases and a stable APR and payment. Your card issuer&apos;s disclosures and statements are the source of truth.</p>
    </div>
  </CardContent></Card>;
}

function CompoundInterestCalculator() {
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

function InterestCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(10);
  const [frequency, setFrequency] = useState(12);
  const [contribution, setContribution] = useState(0);
  const [contributionFrequency, setContributionFrequency] = useState(12);
  const [currency, setCurrency] = useState('USD');

  const result = useMemo(() => {
    const p = Math.max(0, principal);
    const r = Math.max(0, rate) / 100;
    const t = Math.max(0, years);
    const n = Math.max(1, Math.round(frequency));
    const periods = Math.max(0, Math.round(t * n));
    const factor = Math.pow(1 + r / n, periods);
    const principalGrowth = p * factor;
    const baseInterest = Math.max(0, principalGrowth - p);
    const cf = Math.max(1, Math.round(contributionFrequency));
    const paymentPeriods = Math.max(0, Math.round(t * cf));
    const periodRate = Math.pow(1 + r / n, n / cf) - 1;
    const contributionGrowth = contribution > 0 && paymentPeriods > 0
      ? periodRate === 0
        ? contribution * paymentPeriods
        : contribution * ((Math.pow(1 + periodRate, paymentPeriods) - 1) / periodRate)
      : 0;
    const totalContributions = contribution * paymentPeriods;
    const total = principalGrowth + contributionGrowth;
    const totalInterest = Math.max(0, total - p - totalContributions);
    const interestShare = total > 0 ? Math.min(100, totalInterest / total * 100) : 0;
    const multiplier = p + totalContributions > 0 ? total / (p + totalContributions) : 1;
    const yearly = Array.from({ length: Math.min(30, Math.max(1, Math.ceil(t))) }, (_, index) => {
      const year = index + 1;
      const elapsed = Math.min(year, t);
      const base = p * Math.pow(1 + r / n, Math.round(elapsed * n));
      const cPeriods = Math.round(elapsed * cf);
      const cGrowth = contribution > 0 && cPeriods > 0
        ? periodRate === 0 ? contribution * cPeriods : contribution * ((Math.pow(1 + periodRate, cPeriods) - 1) / periodRate)
        : 0;
      const invested = p + contribution * cPeriods;
      return { year, invested, interest: Math.max(0, base + cGrowth - invested), amount: base + cGrowth };
    });
    return { principalGrowth, baseInterest, totalContributions, totalInterest, total, interestShare, multiplier, yearly };
  }, [principal, rate, years, frequency, contribution, contributionFrequency]);

  const fmt = (n: number) => money(n, currency);
  const interestArc = Math.min(100, Math.max(0, result.interestShare)).toFixed(2);
  const frequencyLabel = frequency === 1 ? 'Annually' : frequency === 2 ? 'Semi-annually' : frequency === 4 ? 'Quarterly' : frequency === 12 ? 'Monthly' : 'Daily';
  const contributionLabel = contributionFrequency === 1 ? 'Annual' : contributionFrequency === 4 ? 'Quarterly' : contributionFrequency === 12 ? 'Monthly' : contributionFrequency === 26 ? 'Biweekly' : 'Weekly';

  return (
    <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="border-b bg-gradient-to-r from-blue-50 via-white to-emerald-50 px-5 py-5 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Advanced Interest Calculator</p>
              <h2 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">Calculate interest, growth and final value</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Explore how principal, annual rate, time, compounding frequency and recurring contributions affect the mathematical value of money.</p>
            </div>
            <div className="rounded-2xl bg-blue-600 px-5 py-3 text-right text-white shadow-sm"><div className="text-xs opacity-80">Estimated final value</div><div className="text-2xl font-black">{fmt(result.total)}</div></div>
          </div>
        </div>
        <div className="grid lg:grid-cols-[1.08fr_.92fr]">
          <div className="space-y-5 p-5 sm:p-7 md:p-8">
            <div className="flex items-end gap-3 rounded-2xl border bg-slate-50/70 p-4"><div className="flex-1"><Label>Currency</Label><Select value={currency} onValueChange={setCurrency}><SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="INR">INR (₹)</SelectItem></SelectContent></Select></div><div className="hidden rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-500 sm:block">Compound growth model</div></div>
            <LoanSlider label="Principal amount" value={principal} min={100} max={10000000} step={100} prefix={currency === 'INR' ? '₹' : '$'} onChange={setPrincipal} />
            <LoanSlider label="Annual interest rate" value={rate} min={0} max={50} step={0.1} suffix="%" onChange={setRate} />
            <LoanSlider label="Time period" value={years} min={0.25} max={40} step={0.25} suffix="yr" onChange={setYears} />
            <div className="grid gap-4 rounded-2xl border bg-slate-50/80 p-4 sm:grid-cols-2">
              <div><Label>Compounding frequency</Label><Select value={String(frequency)} onValueChange={v=>setFrequency(Number(v))}><SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Annually</SelectItem><SelectItem value="2">Semi-annually</SelectItem><SelectItem value="4">Quarterly</SelectItem><SelectItem value="12">Monthly</SelectItem><SelectItem value="365">Daily</SelectItem></SelectContent></Select></div>
              <div><Label>Recurring contribution</Label><Input className="mt-1 bg-white" type="number" min="0" step="50" value={contribution} onChange={e=>setContribution(num(e.target.value))}/></div>
              <div className="sm:col-span-2"><Label>Contribution frequency</Label><Select value={String(contributionFrequency)} onValueChange={v=>setContributionFrequency(Number(v))}><SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Annually</SelectItem><SelectItem value="4">Quarterly</SelectItem><SelectItem value="12">Monthly</SelectItem><SelectItem value="26">Every 2 weeks</SelectItem><SelectItem value="52">Weekly</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4"><p className="text-sm text-slate-500">Interest earned</p><p className="mt-1 text-2xl font-black text-blue-600">{fmt(result.totalInterest)}</p><p className="mt-1 text-xs text-slate-500">Estimated growth beyond principal and contributions</p></div><div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="text-sm text-slate-500">Total invested</p><p className="mt-1 text-2xl font-black text-emerald-600">{fmt(principal + result.totalContributions)}</p><p className="mt-1 text-xs text-slate-500">Principal plus recurring contributions</p></div></div>
          </div>
          <div className="border-t bg-gradient-to-br from-slate-50 via-white to-blue-50/70 p-5 sm:p-7 lg:border-l lg:border-t-0 md:p-8">
            <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-700">Interest share</p><p className="text-xs text-slate-500">Interest compared with final value</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">{result.interestShare.toFixed(1)}% interest</span></div>
              <div className="mx-auto my-7 flex h-56 w-56 items-center justify-center rounded-full" style={{background:`conic-gradient(#2563eb 0 ${interestArc}%, #dbeafe ${interestArc}% 100%)`}}><div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white text-center shadow-inner"><span className="text-xs text-slate-400">Final value</span><strong className="mt-1 text-2xl font-black text-slate-800">{fmt(result.total)}</strong><span className="mt-1 text-xs text-blue-600">{rate.toFixed(1)}% p.a.</span></div></div>
              <div className="flex justify-center gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-blue-600"/> Interest</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-blue-100"/> Invested</span></div>
            </div>
            <div className="mt-5 space-y-3"><LoanResult label="Principal growth" value={fmt(result.principalGrowth)} icon={<WalletCards className="h-4 w-4"/>}/><LoanResult label="Compounding" value={frequencyLabel} icon={<CircleDollarSign className="h-4 w-4"/>}/><LoanResult label="Return multiple" value={`${result.multiplier.toFixed(2)}×`} icon={<TrendingUp className="h-4 w-4"/>} strong/></div>
          </div>
        </div>
        <div className="border-t bg-white p-5 sm:p-7 md:p-9">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-xl font-black text-slate-800">Interest growth schedule</h3><p className="mt-1 text-sm text-slate-500">See how invested money, estimated interest and final value can change year by year.</p></div><div className="rounded-xl bg-blue-50 px-4 py-2 text-xs text-blue-700">{frequencyLabel} · {contributionLabel} contributions</div></div>
          <div className="mt-5 overflow-x-auto rounded-2xl border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Year</th><th className="px-4 py-3">Total invested</th><th className="px-4 py-3">Interest</th><th className="px-4 py-3">Final value</th></tr></thead><tbody>{result.yearly.map(r=><tr key={r.year} className="border-t"><td className="px-4 py-3 font-semibold">{r.year}</td><td className="px-4 py-3">{fmt(r.invested)}</td><td className="px-4 py-3 text-blue-600">{fmt(r.interest)}</td><td className="px-4 py-3 font-semibold">{fmt(r.amount)}</td></tr>)}</tbody></table></div>
          <div className="mt-6 grid gap-3 md:grid-cols-3"><div className="rounded-2xl border bg-blue-50/60 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Core formula</p><p className="mt-2 text-sm font-semibold text-slate-700">A = P(1 + r/n)^(nt)</p><p className="mt-1 text-xs text-slate-500">P is principal, r is the annual rate as a decimal, n is periods per year and t is years.</p></div><div className="rounded-2xl border bg-emerald-50/60 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Compounding effect</p><p className="mt-2 text-sm font-semibold text-slate-700">Interest can earn further interest</p><p className="mt-1 text-xs text-slate-500">More frequent compounding can change the mathematical result when the nominal rate stays the same.</p></div><div className="rounded-2xl border bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Scenario planning</p><p className="mt-2 text-sm font-semibold text-slate-700">Test rate, time and contributions</p><p className="mt-1 text-xs text-slate-500">Use different assumptions to understand sensitivity instead of relying on one projection.</p></div></div>
          <p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0"/>This is a mathematical estimate. Actual loans, savings accounts and investments may use different day-count rules, fees, taxes, payment timing, variable rates or compounding conventions.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(5);
  const [currency, setCurrency] = useState('USD');

  const result = useMemo(() => {
    const p = Math.max(0, principal);
    const r = Math.max(0, rate) / 100;
    const t = Math.max(0, years);
    const interest = p * r * t;
    const total = p + interest;
    const interestShare = total > 0 ? interest / total * 100 : 0;
    const annualInterest = p * r;
    const yearly = Array.from({ length: Math.min(20, Math.max(1, Math.ceil(t))) }, (_, index) => {
      const year = index + 1;
      return { year, interest: annualInterest * Math.min(year, t), amount: p + annualInterest * Math.min(year, t) };
    });
    return { interest, total, interestShare, annualInterest, yearly };
  }, [principal, rate, years]);

  const fmt = (n: number) => money(n, currency);
  const interestArc = Math.min(100, Math.max(0, result.interestShare)).toFixed(2);
  return (
    <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="border-b bg-gradient-to-r from-amber-50 via-white to-emerald-50 px-5 py-5 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Advanced Simple Interest Calculator</p>
              <h2 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">Calculate simple interest and final amount</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Enter a principal, annual interest rate and time period to see the interest earned and the total amount using simple-interest mathematics.</p>
            </div>
            <div className="rounded-2xl bg-amber-500 px-5 py-3 text-right text-white shadow-sm"><div className="text-xs opacity-85">Total amount</div><div className="text-2xl font-black">{fmt(result.total)}</div></div>
          </div>
        </div>
        <div className="grid lg:grid-cols-[1.08fr_.92fr]">
          <div className="space-y-5 p-5 sm:p-7 md:p-8">
            <div className="flex items-end gap-3 rounded-2xl border bg-slate-50/70 p-4"><div className="flex-1"><Label>Currency</Label><Select value={currency} onValueChange={setCurrency}><SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="INR">INR (₹)</SelectItem></SelectContent></Select></div><div className="hidden rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-500 sm:block">Linear growth</div></div>
            <LoanSlider label="Principal amount" value={principal} min={100} max={10000000} step={100} prefix={currency === 'INR' ? '₹' : '$'} onChange={setPrincipal} />
            <LoanSlider label="Annual interest rate" value={rate} min={0} max={50} step={0.1} suffix="%" onChange={setRate} />
            <LoanSlider label="Time period" value={years} min={0.25} max={30} step={0.25} suffix="yr" onChange={setYears} />
            <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4"><p className="text-sm text-slate-500">Simple interest</p><p className="mt-1 text-2xl font-black text-amber-600">{fmt(result.interest)}</p><p className="mt-1 text-xs text-slate-500">Interest calculated only on the original principal</p></div><div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="text-sm text-slate-500">Final amount</p><p className="mt-1 text-2xl font-black text-emerald-600">{fmt(result.total)}</p><p className="mt-1 text-xs text-slate-500">Principal plus simple interest</p></div></div>
          </div>
          <div className="border-t bg-gradient-to-br from-slate-50 via-white to-amber-50/60 p-5 sm:p-7 lg:border-l lg:border-t-0 md:p-8">
            <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-700">Interest share</p><p className="text-xs text-slate-500">Interest compared with final amount</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{result.interestShare.toFixed(1)}% interest</span></div>
              <div className="mx-auto my-7 flex h-56 w-56 items-center justify-center rounded-full" style={{background:`conic-gradient(#f59e0b 0 ${interestArc}%, #fef3c7 ${interestArc}% 100%)`}}><div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white text-center shadow-inner"><span className="text-xs text-slate-400">Interest earned</span><strong className="mt-1 text-2xl font-black text-slate-800">{fmt(result.interest)}</strong><span className="mt-1 text-xs text-amber-600">{rate.toFixed(1)}% p.a.</span></div></div>
              <div className="flex justify-center gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-amber-500"/> Interest</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-amber-100"/> Principal</span></div>
            </div>
            <div className="mt-5 space-y-3"><LoanResult label="Original principal" value={fmt(principal)} icon={<WalletCards className="h-4 w-4"/>}/><LoanResult label="Interest per year" value={fmt(result.annualInterest)} icon={<CircleDollarSign className="h-4 w-4"/>}/><LoanResult label="Final amount" value={fmt(result.total)} icon={<TrendingUp className="h-4 w-4"/>} strong/></div>
          </div>
        </div>
        <div className="border-t bg-white p-5 sm:p-7 md:p-9"><div className="mb-5"><h3 className="text-xl font-bold text-slate-800">Simple interest growth schedule</h3><p className="mt-1 text-sm text-slate-500">Because simple interest does not compound, the interest added each full year stays constant when the rate and principal do not change.</p></div><div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[560px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Year</th><th className="px-4 py-3">Cumulative interest</th><th className="px-4 py-3">Amount</th></tr></thead><tbody>{result.yearly.map(r=><tr key={r.year} className="border-t"><td className="px-4 py-3 font-semibold">{r.year}</td><td className="px-4 py-3 text-amber-600">{fmt(r.interest)}</td><td className="px-4 py-3">{fmt(r.amount)}</td></tr>)}</tbody></table></div><div className="mt-6 grid gap-3 md:grid-cols-3"><div className="rounded-2xl border bg-amber-50/60 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Formula</p><p className="mt-2 text-sm font-semibold text-slate-700">I = P × r × t</p><p className="mt-1 text-xs text-slate-500">Rate is expressed as a decimal and time is measured in years.</p></div><div className="rounded-2xl border bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">No compounding</p><p className="mt-2 text-sm font-semibold text-slate-700">Interest is based on the original principal rather than prior interest.</p></div><div className="rounded-2xl border bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Compare carefully</p><p className="mt-2 text-sm font-semibold text-slate-700">Real products may use different payment, day-count, fee or rate conventions.</p></div></div><p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0"/>This calculator models pure simple interest. It is not a quote for a loan, deposit or investment product, and actual

function HomeLoanCalculator() {
  const [homePrice, setHomePrice] = useState(400000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.79);
  const [years, setYears] = useState(30);
  const [propertyTax, setPropertyTax] = useState(1.2);
  const [insurance, setInsurance] = useState(1500);
  const [pmiRate, setPmiRate] = useState(0.6);
  const [hoa, setHoa] = useState(0);
  const [otherCosts, setOtherCosts] = useState(4000);
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [includeCosts, setIncludeCosts] = useState(true);

  const result = useMemo(() => {
    const down = Math.min(homePrice, homePrice * downPct / 100);
    const loan = Math.max(0, homePrice - down);
    const months = Math.max(1, Math.round(years * 12));
    const r = rate / 100 / 12;
    const basePI = r === 0 ? loan / months : loan * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    const pmiMonthly = downPct < 20 ? loan * pmiRate / 100 / 12 : 0;
    const taxMonthly = homePrice * propertyTax / 100 / 12;
    const insuranceMonthly = insurance / 12;
    const hoaMonthly = hoa / 12;
    const otherMonthly = otherCosts / 12;
    const housingMonthly = basePI + (includeCosts ? taxMonthly + insuranceMonthly + pmiMonthly + hoaMonthly + otherMonthly : 0);

    let balance = loan;
    let totalInterest = 0;
    let totalPrincipal = 0;
    let totalPaid = 0;
    let actualMonths = 0;
    const annual: { year: number; interest: number; principal: number; balance: number }[] = [];
    let yearInterest = 0, yearPrincipal = 0;
    while (balance > 0.01 && actualMonths < 1200) {
      actualMonths++;
      const interest = r === 0 ? 0 : balance * r;
      const principal = Math.min(balance, Math.max(0, basePI + extraMonthly - interest));
      const payment = principal + interest;
      balance = Math.max(0, balance - principal);
      totalInterest += interest;
      totalPrincipal += principal;
      totalPaid += payment;
      yearInterest += interest;
      yearPrincipal += principal;
      if (actualMonths % 12 === 0 || balance === 0) {
        annual.push({ year: Math.ceil(actualMonths / 12), interest: yearInterest, principal: yearPrincipal, balance });
        yearInterest = 0; yearPrincipal = 0;
      }
      if (principal <= 0 && interest > 0) break;
    }
    const principalShare = totalPaid > 0 ? loan / totalPaid : 1;
    return { down, loan, basePI, pmiMonthly, taxMonthly, insuranceMonthly, hoaMonthly, otherMonthly, housingMonthly, totalInterest, totalPrincipal, totalPaid, actualMonths, annual, principalShare };
  }, [homePrice, downPct, rate, years, propertyTax, insurance, pmiRate, hoa, otherCosts, extraMonthly, includeCosts]);

  const fmt = (n: number) => money(n, 'INR');
  const totalWithCosts = result.totalPaid + (includeCosts ? (result.taxMonthly + result.insuranceMonthly + result.pmiMonthly + result.hoaMonthly + result.otherMonthly) * result.actualMonths : 0);
  const interestPct = Math.max(0, Math.min(100, result.totalInterest / Math.max(result.totalPaid, 1) * 100));
  const principalPct = Math.max(0, 100 - interestPct);
  const payoff = `${Math.floor(result.actualMonths / 12)} yr${result.actualMonths % 12 ? ` ${result.actualMonths % 12} mo` : ''}`;

  return <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
    <CardContent className="p-0">
      <div className="border-b bg-gradient-to-r from-sky-50 via-white to-emerald-50 px-5 py-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Online Home Loan Calculator</p><h2 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">Plan your home loan EMI and total cost</h2><p className="mt-1 text-sm text-slate-500">Compare home price, down payment, interest rate, tenure and extra EMI payments before choosing a loan.</p></div>
          <div className="rounded-2xl bg-emerald-600 px-5 py-3 text-right text-white shadow-sm"><div className="text-xs opacity-80">Monthly EMI</div><div className="text-2xl font-black">{fmt(result.basePI)}</div></div>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1.08fr_.92fr]">
        <div className="space-y-5 p-5 sm:p-7 md:p-8">
          <LoanSlider label="Property price" value={homePrice} min={500000} max={100000000} step={100000} prefix="₹" onChange={setHomePrice} />
          <LoanSlider label="Down payment" value={downPct} min={0} max={50} step={1} suffix="%" onChange={setDownPct} />
          <LoanSlider label="Interest rate" value={rate} min={0} max={20} step={0.01} suffix="%" onChange={setRate} />
          <LoanSlider label="Loan tenure" value={years} min={5} max={40} step={1} suffix="yr" onChange={setYears} />
          <div className="grid gap-4 rounded-2xl border bg-slate-50/80 p-4 sm:grid-cols-2">
            <div><Label>Annual property tax</Label><div className="mt-1 flex"><Input type="number" min="0" step="0.1" value={propertyTax} onChange={e=>setPropertyTax(num(e.target.value))} /><span className="flex items-center rounded-r-md border border-l-0 bg-white px-3 text-sm text-slate-500">%</span></div></div>
            <div><Label>Annual home insurance</Label><Input className="mt-1" type="number" min="0" value={insurance} onChange={e=>setInsurance(num(e.target.value))}/></div>
            <div><Label>Annual maintenance / HOA</Label><Input className="mt-1" type="number" min="0" value={hoa} onChange={e=>setHoa(num(e.target.value))}/></div>
            <div><Label>Other annual ownership costs</Label><Input className="mt-1" type="number" min="0" value={otherCosts} onChange={e=>setOtherCosts(num(e.target.value))}/></div>
            <div className="sm:col-span-2"><Label>Home-loan insurance rate</Label><Input className="mt-1" type="number" min="0" step="0.1" value={pmiRate} onChange={e=>setPmiRate(num(e.target.value))}/><p className="mt-1 text-xs text-slate-500">Estimated only when the down payment is below 20%.</p></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-semibold"><input type="checkbox" checked={includeCosts} onChange={e=>setIncludeCosts(e.target.checked)} className="h-4 w-4 accent-emerald-600"/> Include taxes & ownership costs</label>
            <div className="min-w-[210px] flex-1"><Label>Extra monthly payment</Label><Input className="mt-1" type="number" min="0" step="50" value={extraMonthly} onChange={e=>setExtraMonthly(num(e.target.value))}/></div>
          </div>
        </div>
        <div className="border-t bg-gradient-to-br from-slate-50 via-white to-indigo-50/70 p-5 sm:p-7 lg:border-l lg:border-t-0 md:p-8">
          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-500">Payment breakdown</p><p className="text-xs text-slate-400">Principal vs interest</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">{interestPct.toFixed(0)}% interest</span></div>
            <div className="mx-auto my-7 flex h-56 w-56 items-center justify-center rounded-full" style={{background:`conic-gradient(#4f63f5 0 ${principalPct}%, #e9edff ${principalPct}% 100%)`}}><div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white text-center shadow-inner"><span className="text-xs text-slate-400">Monthly P&I</span><strong className="mt-1 text-2xl font-black text-slate-800">{fmt(result.basePI)}</strong><span className="mt-1 text-xs text-emerald-600">{rate.toFixed(2)}% rate</span></div></div>
            <div className="flex justify-center gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#4f63f5]"/> Principal</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#e9edff]"/> Interest</span></div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <MortgageMetric label="Total monthly housing cost" value={fmt(result.housingMonthly)} highlight />
            <MortgageMetric label="Loan amount" value={fmt(result.loan)} />
            <MortgageMetric label="Down payment" value={fmt(result.down)} />
            <MortgageMetric label="Total interest" value={fmt(result.totalInterest)} />
            <MortgageMetric label="Total home-loan payments" value={fmt(result.totalPaid)} />
            <MortgageMetric label="Estimated payoff" value={payoff} />
          </div>
          <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">Taxes, insurance, Insurance, HOA and other costs vary by location and lender. They are estimates and are not part of the core principal-and-interest amortization.</div>
        </div>
      </div>
      <div className="border-t p-5 sm:p-7 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-xl font-black text-slate-800">Home-loan amortization schedule</h3><p className="mt-1 text-sm text-slate-500">See how interest falls and principal repayment grows over the life of the loan.</p></div><div className="rounded-xl bg-slate-50 px-4 py-2 text-xs text-slate-500">Estimated total with recurring costs: <strong className="text-slate-800">{fmt(totalWithCosts)}</strong></div></div>
        <div className="mt-5 overflow-x-auto rounded-2xl border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Year</th><th className="px-4 py-3">Interest</th><th className="px-4 py-3">Principal</th><th className="px-4 py-3">Ending balance</th></tr></thead><tbody>{result.annual.map(r=><tr key={r.year} className="border-t"><td className="px-4 py-3 font-semibold">{r.year}</td><td className="px-4 py-3">{fmt(r.interest)}</td><td className="px-4 py-3 text-emerald-600">{fmt(r.principal)}</td><td className="px-4 py-3 font-semibold">{fmt(r.balance)}</td></tr>)}</tbody></table></div>
        <p className="mt-5 text-xs leading-5 text-slate-500">This home-loan calculator is intended for planning. Actual home-loan payments may differ because of lender pricing, taxes, insurance, Insurance rules, fees, payment timing, rate changes and local regulations.</p>
      </div>
    </CardContent>
  </Card>;
}


function InflationCalculator() {
  const [currentValue, setCurrentValue] = useState(100000);
  const [inflationRate, setInflationRate] = useState(3);
  const [years, setYears] = useState(10);
  const [currency, setCurrency] = useState('USD');

  const result = useMemo(() => {
    const factor = Math.pow(1 + inflationRate / 100, years);
    const futureCost = currentValue * factor;
    const purchasingPower = factor > 0 ? currentValue / factor : currentValue;
    const lossPercent = factor > 0 ? (1 - 1 / factor) * 100 : 0;
    const extraCost = futureCost - currentValue;
    const annualRows = Array.from({ length: Math.min(years, 50) }, (_, index) => {
      const year = index + 1;
      const value = currentValue * Math.pow(1 + inflationRate / 100, year);
      return { year, value, purchasing: currentValue / Math.pow(1 + inflationRate / 100, year) };
    });
    return { factor, futureCost, purchasingPower, lossPercent, extraCost, annualRows };
  }, [currentValue, inflationRate, years]);

  const fmt = (n: number) => money(n, currency);
  const futurePercent = result.futureCost > 0 ? Math.min(100, (currentValue / result.futureCost) * 100) : 100;
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  return (
    <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-5 sm:p-7 md:p-9">
            <div className="mb-7 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Purchasing Power Planner</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">Calculate the impact of inflation</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">See how today’s money could change in value over time and estimate what a future purchase may cost under a constant inflation assumption.</p>
              </div>
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 sm:flex"><TrendingUp className="h-5 w-5" /></div>
            </div>

            <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Display currency</p><p className="mt-1 text-sm text-slate-600">Use the currency that matches your planning scenario.</p></div>
              <Select value={currency} onValueChange={setCurrency}><SelectTrigger className="w-28 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="INR">INR (₹)</SelectItem></SelectContent></Select>
            </div>

            <div className="space-y-7">
              <LoanSlider label="Current amount" value={currentValue} min={1000} max={5000000} step={1000} prefix={currencySymbol} onChange={setCurrentValue} />
              <LoanSlider label="Annual inflation rate" value={inflationRate} min={0} max={20} step={0.1} suffix="%" onChange={setInflationRate} />
              <LoanSlider label="Time horizon" value={years} min={1} max={50} step={1} suffix="yr" onChange={setYears} />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4"><p className="text-sm text-slate-500">Future cost equivalent</p><p className="mt-1 text-2xl font-bold text-amber-600">{fmt(result.futureCost)}</p></div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-sm text-slate-500">Purchasing power later</p><p className="mt-1 text-2xl font-bold text-slate-800">{fmt(result.purchasingPower)}</p></div>
            </div>
          </div>

          <div className="border-t bg-gradient-to-br from-slate-50 via-white to-amber-50/60 p-5 sm:p-7 lg:border-l lg:border-t-0 md:p-9">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-700">Inflation impact</p><p className="text-xs text-slate-500">Estimated change in the price level</p></div><CircleDollarSign className="h-5 w-5 text-amber-500" /></div>
            <div className="mx-auto my-5 flex max-w-[300px] items-center justify-center">
              <div className="relative h-56 w-56 rounded-full" style={{ background: `conic-gradient(#f59e0b 0 ${futurePercent}%, #fef3c7 ${futurePercent}% 100%)` }}>
                <div className="absolute inset-[28px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner"><span className="text-xs font-medium text-slate-500">Future equivalent</span><strong className="mt-1 text-2xl font-bold text-slate-800">{fmt(result.futureCost)}</strong><span className="mt-1 text-xs text-amber-600">{inflationRate.toFixed(1)}% annual inflation</span></div>
              </div>
            </div>
            <div className="flex justify-center gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" /> Current value share</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#fef3c7]" /> Inflation increase</span></div>
            <div className="mt-8 space-y-4">
              <LoanResult label="Current amount" value={fmt(currentValue)} icon={<WalletCards className="h-4 w-4" />} />
              <LoanResult label="Additional future cost" value={fmt(result.extraCost)} icon={<TrendingUp className="h-4 w-4" />} />
              <LoanResult label="Purchasing power reduction" value={pct(result.lossPercent)} icon={<CircleDollarSign className="h-4 w-4" />} strong />
            </div>
          </div>
        </div>

        <div className="border-t bg-white p-5 sm:p-7 md:p-9">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-xl font-bold text-slate-800">Year-by-year inflation projection</h3><p className="mt-1 text-sm text-slate-500">Track the estimated future cost of today’s amount under the selected constant rate.</p></div><div className="rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-800">{currency} · {inflationRate.toFixed(1)}% annual rate</div></div>
          <div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Year</th><th className="px-4 py-3">Future cost equivalent</th><th className="px-4 py-3">Purchasing power of today’s amount</th><th className="px-4 py-3">Price increase</th></tr></thead><tbody>{result.annualRows.map(row => <tr key={row.year} className="border-t"><td className="px-4 py-3 font-semibold">{row.year}</td><td className="px-4 py-3 font-semibold">{fmt(row.value)}</td><td className="px-4 py-3">{fmt(row.purchasing)}</td><td className="px-4 py-3 text-amber-600">{pct((row.value / currentValue - 1) * 100)}</td></tr>)}</tbody></table></div>
          <div className="mt-6 grid gap-3 md:grid-cols-3"><div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Formula</p><p className="mt-2 text-sm font-semibold text-slate-700">Future cost = current amount × (1 + rate)<sup>years</sup></p></div><div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Scenario</p><p className="mt-2 text-sm font-semibold text-slate-700">{years} years at {inflationRate.toFixed(1)}% inflation</p></div><div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Change</p><p className="mt-2 text-sm font-semibold text-slate-700">{fmt(result.extraCost)} additional amount in the model</p></div></div>
          <p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" />This calculator is a scenario model, not an inflation forecast. Actual inflation differs across years, countries, spending categories and households. Use official inflation data when you need a historical or current economic measure.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MortgageMetric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <div className={`flex items-center justify-between rounded-xl border p-3 ${highlight ? 'border-emerald-100 bg-emerald-50/70' : 'border-slate-100 bg-white'}`}><span className="text-sm text-slate-500">{label}</span><strong className={highlight ? 'text-lg text-emerald-600' : 'text-base text-slate-700'}>{value}</strong></div>;
}

function LoanSlider({ label, value, min, max, step, prefix, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; prefix?: string; suffix?: string; onChange: (value: number) => void }) {
  const display = `${prefix ?? ''}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix ? ` ${suffix}` : ''}`;
  return <div className="mb-7"><div className="mb-3 flex items-center justify-between gap-4"><Label className="text-base font-medium text-slate-700">{label}</Label><div className="h-10 w-32 rounded-md bg-emerald-50 px-3 py-2 text-right text-lg font-semibold text-emerald-600">{display}</div></div><Slider value={[value]} min={min} max={max} step={step} onValueChange={v => onChange(v[0] ?? value)} className="py-2" /></div>;
}

function LoanResult({ label, value, icon, strong = false }: { label: string; value: string; icon: ReactNode; strong?: boolean }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-3"><span className="flex items-center gap-2 text-sm text-slate-500">{icon}{label}</span><strong className={strong ? 'text-lg text-emerald-600' : 'text-base text-slate-700'}>{value}</strong></div>;
}

function Field({ label, value, onChange, suffix }: { label: string; value: string; onChange: (v: string) => void; suffix?: string }) {
  return <div className="min-w-[180px] flex-1"><Label>{label}</Label><div className="relative mt-1"><Input inputMode="decimal" type="number" min="0" value={value} onChange={e => onChange(e.target.value)} className={suffix ? 'pr-12' : ''} />{suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}</div></div>;
}

function getConfig(slug: string) {
  const f = (key: string, label: string, suffix?: string) => ({ key, label, suffix });
  const base = { title: 'Financial Calculator', fields: [f('principal', 'Loan / Principal Amount')] };
  const configs: Record<string, typeof base> = {
    'emi-calculator': { title: 'EMI Calculator', fields: [f('principal','Loan Amount'), f('rate','Interest Rate','%'), f('years','Loan Term','years'), f('extra','Extra Monthly Payment')] },
    'loan-calculator': { title: 'Loan Calculator', fields: [f('principal','Loan Amount'), f('rate','Interest Rate','%'), f('years','Loan Term','years'), f('extra','Extra Monthly Payment')] },
    'mortgage-calculator': { title: 'Mortgage Calculator', fields: [f('principal','Home Price'), f('down','Down Payment'), f('rate','Interest Rate','%'), f('years','Loan Term','years'), f('tax','Property Tax','%'), f('insurance','Annual Insurance'), f('pmi','PMI','%')] },
    'home-loan-calculator': { title: 'Home Loan Calculator', fields: [f('principal','Home Loan Amount'), f('rate','Interest Rate','%'), f('years','Loan Term','years'), f('extra','Extra Monthly Payment')] },
    'car-loan-calculator': { title: 'Car Loan Calculator', fields: [f('principal','Vehicle Price'), f('down','Down Payment'), f('rate','Interest Rate','%'), f('years','Loan Term','years')] },
    'personal-loan-calculator': { title: 'Personal Loan Calculator', fields: [f('principal','Loan Amount'), f('rate','Interest Rate','%'), f('years','Loan Term','years')] },
    'student-loan-calculator': { title: 'Student Loan Calculator', fields: [f('principal','Loan Balance'), f('rate','Interest Rate','%'), f('years','Repayment Term','years')] },
    'credit-card-payoff-calculator': { title: 'Credit Card Payoff Calculator', fields: [f('balance','Current Balance'), f('cardRate','APR','%'), f('payment','Monthly Payment')] },
    'interest-calculator': { title: 'Interest Calculator', fields: [f('principal','Principal'), f('rate','Interest Rate','%'), f('time','Time','years'), f('compounds','Compounds / Year')] },
    'simple-interest-calculator': { title: 'Simple Interest Calculator', fields: [f('principal','Principal'), f('simpleRate','Interest Rate','%'), f('time','Time','years')] },
    'compound-interest-calculator': { title: 'Compound Interest Calculator', fields: [f('principal','Initial Investment'), f('rate','Interest Rate','%'), f('years','Time','years'), f('compounds','Compounds / Year')] },
    'investment-return-calculator': { title: 'Investment Return Calculator', fields: [f('initial','Initial Investment'), f('contribution','Regular Contribution'), f('returnRate','Expected Annual Return','%'), f('investmentYears','Investment Period','years'), f('contributionFrequency','Contributions / Year')] },
    'roi-calculator': { title: 'ROI Calculator', fields: [f('cost','Investment Cost'), f('gain','Profit / Gain')] },
    'inflation-calculator': { title: 'Inflation Calculator', fields: [f('currentValue','Current Amount'), f('inflation','Annual Inflation','%'), f('years','Time','years')] },
  };
  return configs[slug] ?? base;
}

function loanPayment(principal: number, annualRate: number, years: number) {
  const n = Math.max(1, Math.round(years * 12)); const r = annualRate / 100 / 12;
  return r === 0 ? principal / n : principal * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1);
}
function calculate(slug: string, v: Record<string,string>, currency: string): Result {
  const P=num(v.principal), rate=num(v.rate), years=num(v.years), fmt=(n:number)=>money(n,currency);
  if (['emi-calculator','loan-calculator','home-loan-calculator','personal-loan-calculator','student-loan-calculator'].includes(slug)) { const m=loanPayment(P,rate,years); return [{label:'Monthly Payment',value:fmt(m)},{label:'Total Payments',value:fmt(m*years*12)},{label:'Total Interest',value:fmt(m*years*12-P)}]; }
  if (slug==='mortgage-calculator') { const down=num(v.down); const loan=Math.max(0,P-down); const m=loanPayment(loan,rate,years); const monthlyTax=P*num(v.tax)/100/12; const insurance=num(v.insurance)/12; const pmi=loan*num(v.pmi)/100/12; return [{label:'Loan Amount',value:fmt(loan)},{label:'Principal & Interest',value:fmt(m)},{label:'Estimated Monthly Housing Cost',value:fmt(m+monthlyTax+insurance+pmi)},{label:'Total Interest',value:fmt(m*years*12-loan)}]; }
  if (slug==='car-loan-calculator') { const loan=Math.max(0,P-num(v.down)); const m=loanPayment(loan,rate,years); return [{label:'Amount Financed',value:fmt(loan)},{label:'Monthly Payment',value:fmt(m)},{label:'Total Interest',value:fmt(m*years*12-loan)}]; }
  if (slug==='credit-card-payoff-calculator') { const bal=num(v.balance), apr=num(v.cardRate), pay=num(v.payment), r=apr/100/12; if(pay<=bal*r && r>0)return [{label:'Payoff Status',value:'Payment is too low'},{label:'First-Month Interest',value:fmt(bal*r)},{label:'Suggested Payment',value:fmt(bal*r+1)}]; let b=bal, months=0, interest=0; while(b>0 && months<1200){const i=b*r; const p=Math.min(pay,b+i); interest+=i;b=Math.max(0,b+i-p);months++;} return [{label:'Estimated Payoff Time',value:`${Math.floor(months/12)}y ${months%12}m`},{label:'Total Interest',value:fmt(interest)},{label:'Total Paid',value:fmt(bal+interest)}]; }
  if (slug==='simple-interest-calculator') { const i=P*num(v.simpleRate)/100*num(v.time); return [{label:'Simple Interest',value:fmt(i)},{label:'Final Amount',value:fmt(P+i)},{label:'Principal',value:fmt(P)}]; }
  if (['interest-calculator','compound-interest-calculator'].includes(slug)) { const r=rate/100, n=Math.max(1,Math.round(num(v.compounds))), t=years; const fv=P*Math.pow(1+r/n,n*t); return [{label:'Interest Earned',value:fmt(fv-P)},{label:'Final Amount',value:fmt(fv)},{label:'Principal',value:fmt(P)}]; }
  if (slug==='investment-return-calculator') { const initial=num(v.initial), c=num(v.contribution), rr=num(v.returnRate)/100, t=num(v.investmentYears), freq=Math.max(1,Math.round(num(v.contributionFrequency))); const r=rr/freq, periods=Math.round(t*freq); const fvInitial=initial*Math.pow(1+r,periods); const fvContrib=r===0?c*periods:c*(Math.pow(1+r,periods)-1)/r; const total=initial+c*periods; return [{label:'Estimated Future Value',value:fmt(fvInitial+fvContrib)},{label:'Total Contributions',value:fmt(total)},{label:'Estimated Gain',value:fmt(fvInitial+fvContrib-total)}]; }
  if (slug==='roi-calculator') { const cost=num(v.cost), gain=num(v.gain), roi=cost?gain/cost*100:0; return [{label:'ROI',value:pct(roi)},{label:'Profit / Gain',value:fmt(gain)},{label:'Ending Value',value:fmt(cost+gain)}]; }
  if (slug==='inflation-calculator') { const current=num(v.currentValue), i=num(v.inflation)/100, t=num(v.years); const future=current*Math.pow(1+i,t), purchasing=current/Math.pow(1+i,t); return [{label:'Future Cost Equivalent',value:fmt(future)},{label:'Current Amount Needed Later',value:fmt(future)},{label:'Purchasing Power of Current Amount',value:fmt(purchasing)}]; }
  return [{label:'Result',value:fmt(P)}];
}
