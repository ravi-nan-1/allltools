"use client";

import { useMemo, useState } from 'react';
import { Calculator, DollarSign, Percent, CalendarDays, TrendingUp, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
