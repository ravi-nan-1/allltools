"use client";

import { useMemo, useState, type ReactNode } from 'react';
import { Calculator, Info, WalletCards, TrendingUp, CircleDollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Slider from '@/components/ui/slider';
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
  if (slug === 'loan-calculator') return <LoanCalculator />;
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

            <LoanSlider label="Loan amount" value={loanAmount} min={10000} max={10000000} step={10000} display={fmt(loanAmount)} onChange={setLoanAmount} />
            <LoanSlider label="Rate of interest (p.a.)" value={rate} min={0} max={25} step={0.1} display={`${rate.toFixed(1)} %`} onChange={setRate} />
            <LoanSlider label="Loan tenure" value={years} min={1} max={30} step={1} display={`${years} Yr`} onChange={setYears} />
            <LoanSlider label="Extra monthly payment" value={extra} min={0} max={100000} step={1000} display={fmt(extra)} onChange={setExtra} />

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

function LoanSlider({ label, value, min, max, step, display, onChange }: { label: string; value: number; min: number; max: number; step: number; display: string; onChange: (value: number) => void }) {
  return <div className="mb-7"><div className="mb-3 flex items-center justify-between gap-4"><Label className="text-base font-medium text-slate-700">{label}</Label><Input type="number" min={min} max={max} step={step} value={value} onChange={e => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))} className="h-10 w-32 border-0 bg-emerald-50 text-right text-lg font-semibold text-emerald-600 shadow-none focus-visible:ring-1 focus-visible:ring-emerald-400" aria-label={label} /></div><Slider value={[value]} min={min} max={max} step={step} onValueChange={v => onChange(v[0] ?? value)} className="py-2" /></div>;
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
