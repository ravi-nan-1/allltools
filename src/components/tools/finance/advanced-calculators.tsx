'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Calculator, Play, Pause, RotateCcw, Shuffle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const money = (n: number, currency = 'USD') => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number.isFinite(n) ? n : 0);
const num = (v: string) => Math.max(0, Number.parseFloat(v) || 0);
const pct = (n: number) => `${Number.isFinite(n) ? n.toFixed(2) : '0.00'}%`;
const yearsToMonths = (years: number) => Math.max(1, Math.round(years * 12));

const configs: Record<string, { title: string; description: string }> = {
  'retirement-calculator': { title: 'Retirement Calculator', description: 'Estimate your retirement savings, future portfolio value, and the monthly amount you may need to invest.' },
  'pension-calculator': { title: 'Pension Calculator', description: 'Estimate a pension using salary, service years, accrual rate, and retirement assumptions.' },
  'sip-calculator': { title: 'SIP Calculator', description: 'Estimate the future value of recurring monthly investments and separate contributions from growth.' },
  'fd-calculator': { title: 'FD Calculator', description: 'Estimate fixed-deposit maturity value and interest using principal, rate, tenure, and compounding frequency.' },
  'ppf-calculator': { title: 'PPF Calculator', description: 'Estimate PPF growth using annual deposits, an assumed interest rate, and the investment period.' },
  'nps-calculator': { title: 'NPS Calculator', description: 'Estimate an NPS corpus, annuity allocation, and indicative pension from recurring contributions.' },
  '401k-calculator': { title: '401(k) Calculator', description: 'Estimate retirement growth from employee contributions, employer matching, investment return, and time.' },
  'social-security-calculator': { title: 'Social Security Calculator', description: 'Estimate future Social Security income from a benefit amount, retirement timing, and an optional annual adjustment.' },
  'income-tax-calculator': { title: 'Income Tax Calculator', description: 'Estimate income tax and after-tax income using country, annual income, and an effective tax rate.' },
  'take-home-pay-calculator': { title: 'Take-Home Pay Calculator', description: 'Estimate net pay after income tax, payroll deductions, retirement contributions, and other deductions.' },
  'salary-calculator': { title: 'Salary Calculator', description: 'Convert hourly, weekly, biweekly, monthly, and annual pay using your work schedule.' },
  'gst-calculator': { title: 'GST Calculator', description: 'Calculate GST amount, pre-tax price, and total price for Indian GST-inclusive or GST-exclusive pricing.' },
  'sales-tax-calculator': { title: 'Sales Tax Calculator', description: 'Calculate sales tax and total purchase cost from a price and sales-tax rate.' },
  'percentage-calculator': { title: 'Percentage Calculator', description: 'Solve common percentage questions including percentage of a number, change, difference, and reverse percentage.' },
  'age-calculator': { title: 'Age Calculator', description: 'Calculate exact age in years, months, and days from a birth date and target date.' },
  'date-calculator': { title: 'Date Calculator', description: 'Add or subtract days from a date and calculate the number of days between two dates.' },
  'bmi-calculator': { title: 'BMI Calculator', description: 'Calculate body mass index from height and weight using metric or US customary units.' },
  'calorie-calculator': { title: 'Calorie Calculator', description: 'Estimate daily calorie needs from age, sex, height, weight, and activity level.' },
  'mortgage-payment-calculator': { title: 'Mortgage Payment Calculator', description: 'Estimate principal and interest payments and see total repayment for a mortgage.' },
  'auto-loan-calculator': { title: 'Auto Loan Calculator', description: 'Estimate vehicle loan payments, interest, and total cost from price, down payment, rate, and term.' },
  'discount-calculator': { title: 'Discount Calculator', description: 'Calculate sale price, discount amount, and final price for one or multiple discounts.' },
  'tip-calculator': { title: 'Tip Calculator', description: 'Calculate tip amount, total bill, and per-person split for restaurants and services.' },
  'profit-margin-calculator': { title: 'Profit Margin Calculator', description: 'Calculate gross profit, markup, and profit margin from cost and selling price.' },
  'break-even-calculator': { title: 'Break-Even Calculator', description: 'Find the sales volume and revenue needed to cover fixed and variable costs.' },
  'currency-converter': { title: 'Currency Converter', description: 'Convert between major currencies using a user-supplied exchange rate or a fetched reference rate.' },
  'time-zone-converter': { title: 'Time Zone Converter', description: 'Convert a local date and time between major global time zones using your browser.' },
  'scientific-calculator': { title: 'Scientific Calculator', description: 'Perform common scientific calculations including trigonometry, powers, roots, logarithms, and constants.' },
  'random-number-generator': { title: 'Random Number Generator', description: 'Generate secure browser-random integers within a custom minimum and maximum range.' },
};

export function AdvancedCalculator({ slug }: { slug: string }) {
  if (slug === 'stopwatch') return <Stopwatch />;
  if (slug === 'scientific-calculator') return <ScientificCalculator />;
  if (slug === 'random-number-generator') return <RandomNumberGenerator />;
  if (slug === 'time-zone-converter') return <TimeZoneConverter />;
  if (slug === 'currency-converter') return <CurrencyConverter />;

  const cfg = configs[slug] ?? { title: 'Calculator', description: 'Calculate useful results instantly.' };
  return <GenericAdvancedCalculator slug={slug} cfg={cfg} />;
}

function Shell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <Card className="w-full overflow-hidden border-2 shadow-sm">
    <CardHeader className="bg-gradient-to-r from-primary/10 via-background to-primary/5 border-b">
      <CardTitle className="flex items-center gap-2 text-2xl"><Calculator className="h-6 w-6" />{title}</CardTitle>
      <p className="text-sm md:text-base text-muted-foreground max-w-3xl">{description}</p>
    </CardHeader>
    <CardContent className="p-5 md:p-7">{children}</CardContent>
  </Card>;
}

function GenericAdvancedCalculator({ slug, cfg }: { slug: string; cfg: { title: string; description: string } }) {
  const [currency, setCurrency] = useState(slug === 'gst-calculator' || slug === 'ppf-calculator' || slug === 'nps-calculator' || slug === 'sip-calculator' || slug === 'fd-calculator' ? 'INR' : 'USD');
  const [v, setV] = useState<Record<string, string>>({
    amount: '100000', rate: '7', years: '20', contribution: '10000', inflation: '3', currentAge: '35', retirementAge: '65', salary: '80000', service: '25', accrual: '1.5', annuity: '40', benefit: '2500', cola: '2', taxRate: '20', payroll: '7.65', retirementContribution: '5', deductions: '0', gross: '80000', hours: '40', weeks: '52', gstRate: '18', price: '100', percentage: '20', birth: '1990-01-01', target: new Date().toISOString().slice(0,10), days: '30', height: '170', weight: '70', sex: 'male', activity: '1.55', homePrice: '400000', down: '80000', monthly: '700', cardApr: '24', discount: '20', tip: '18', people: '2', cost: '60', selling: '100', fixed: '10000', variable: '20', unitPrice: '50', employerMatch: '50', matchLimit: '6', monthlyContribution: '500', frequency: '12', compounding: '12', initial: '10000', expectedReturn: '8', loan: '250000', term: '30', purchase: '30000', min: '1', max: '100', exchangeRate: '1' });
  const set = (k: string, x: string) => setV(p => ({ ...p, [k]: x }));
  
  const result = useMemo(() => calcAdvanced(slug, v, currency), [slug, v, currency]);
  const fields = fieldsFor(slug);

  return <Shell title={cfg.title} description={cfg.description}>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 rounded-2xl border bg-muted/20 p-4 md:p-5">
      {fields.map(f => f.key === 'currency' ? <div key={f.key}><Label>Currency</Label><Select value={currency} onValueChange={setCurrency}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="INR">INR (₹)</SelectItem><SelectItem value="EUR">EUR (€)</SelectItem><SelectItem value="GBP">GBP (£)</SelectItem></SelectContent></Select></div> : f.key === 'sex' ? <div key={f.key}><Label>Sex</Label><Select value={v.sex} onValueChange={x=>set('sex',x)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></div> : <div key={f.key}><Label>{f.label}</Label><Input className="mt-1" type={f.type ?? 'number'} value={v[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} /></div>)}
    </div>
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {result.map(x => <div key={x.label} className="rounded-2xl border bg-background p-5 shadow-sm"><div className="text-sm text-muted-foreground">{x.label}</div><div className="mt-1 text-2xl font-bold break-words">{x.value}</div></div>)}
    </div>
    <p className="mt-5 text-xs text-muted-foreground">Results are estimates for planning and education. Financial, tax, health, and currency outcomes can depend on laws, rates, fees, personal circumstances, and data sources.</p>
  </Shell>;
}

function fieldsFor(slug: string) {
  const f=(key:string,label:string,type?:string)=>({key,label,type});
  const map: Record<string, ReturnType<typeof f>[]> = {
    'retirement-calculator':[f('currentAge','Current Age'),f('retirementAge','Retirement Age'),f('amount','Current Savings'),f('contribution','Annual Contribution'),f('expectedReturn','Expected Annual Return (%)'),f('inflation','Inflation (%)'),f('currency','Currency','select')],
    'pension-calculator':[f('salary','Final Annual Salary'),f('service','Years of Service'),f('accrual','Accrual Rate (%)'),f('currency','Currency','select')],
    'sip-calculator':[f('monthlyContribution','Monthly SIP'),f('expectedReturn','Expected Annual Return (%)'),f('years','Investment Period (years)'),f('currency','Currency','select')],
    'fd-calculator':[f('amount','Deposit Amount'),f('rate','Interest Rate (%)'),f('years','Tenure (years)'),f('compounding','Compounds / Year'),f('currency','Currency','select')],
    'ppf-calculator':[f('contribution','Annual Contribution'),f('rate','Interest Rate (%)'),f('years','Investment Period (years)'),f('currency','Currency','select')],
    'nps-calculator':[f('monthlyContribution','Monthly Contribution'),f('expectedReturn','Expected Annual Return (%)'),f('years','Years to Retirement'),f('annuity','Annuity Allocation (%)'),f('currency','Currency','select')],
    '401k-calculator':[f('amount','Current 401(k) Balance'),f('contribution','Annual Employee Contribution'),f('salary','Annual Salary'),f('employerMatch','Employer Match (%)'),f('matchLimit','Match Limit (% of Salary)'),f('expectedReturn','Expected Annual Return (%)'),f('years','Years'),f('currency','Currency','select')],
    'social-security-calculator':[f('benefit','Current Monthly Benefit'),f('years','Years Until Claiming'),f('cola','Annual COLA (%)'),f('currency','Currency','select')],
    'income-tax-calculator':[f('gross','Annual Income'),f('taxRate','Effective Tax Rate (%)'),f('currency','Currency','select')],
    'take-home-pay-calculator':[f('gross','Annual Gross Pay'),f('taxRate','Income Tax (%)'),f('payroll','Payroll / Social Taxes (%)'),f('retirementContribution','Retirement Contribution (%)'),f('deductions','Other Annual Deductions'),f('currency','Currency','select')],
    'salary-calculator':[f('amount','Pay Amount'),f('hours','Hours per Week'),f('weeks','Paid Weeks per Year'),f('currency','Currency','select')],
    'gst-calculator':[f('price','Price Before GST'),f('gstRate','GST Rate (%)'),f('currency','Currency','select')],
    'sales-tax-calculator':[f('price','Price Before Tax'),f('taxRate','Sales Tax Rate (%)'),f('currency','Currency','select')],
    'percentage-calculator':[f('amount','Base Number'),f('percentage','Percentage (%)')],
    'age-calculator':[f('birth','Birth Date','date'),f('target','Target Date','date')],
    'date-calculator':[f('birth','Start Date','date'),f('target','End Date','date'),f('days','Days to Add / Subtract')],
    'bmi-calculator':[f('height','Height (cm)'),f('weight','Weight (kg)')],
    'calorie-calculator':[f('currentAge','Age'),f('weight','Weight (kg)'),f('height','Height (cm)'),f('sex','Sex','select'),f('activity','Activity Multiplier')],
    'mortgage-payment-calculator':[f('loan','Loan Amount'),f('rate','Interest Rate (%)'),f('term','Term (years)'),f('currency','Currency','select')],
    'auto-loan-calculator':[f('purchase','Vehicle Price'),f('down','Down Payment'),f('rate','Interest Rate (%)'),f('term','Loan Term (years)'),f('currency','Currency','select')],
    'discount-calculator':[f('price','Original Price'),f('discount','Discount (%)'),f('currency','Currency','select')],
    'tip-calculator':[f('price','Bill Amount'),f('tip','Tip (%)'),f('people','Number of People'),f('currency','Currency','select')],
    'profit-margin-calculator':[f('cost','Cost'),f('selling','Selling Price'),f('currency','Currency','select')],
    'break-even-calculator':[f('fixed','Fixed Costs'),f('variable','Variable Cost / Unit'),f('unitPrice','Selling Price / Unit'),f('currency','Currency','select')],
  };
  return map[slug] ?? [f('amount','Amount')];
}

type Result={label:string;value:string};
function loanPayment(p:number, rate:number, years:number){const n=yearsToMonths(years),r=rate/100/12;return r===0?p/n:p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)}
function calcAdvanced(slug:string,v:Record<string,string>,currency:string):Result[]{const n=(k:string)=>num(v[k]);const fmt=(x:number)=>money(x,currency);const r=n('rate')/100;const y=n('years');
  if(slug==='retirement-calculator'){const t=Math.max(0,n('retirementAge')-n('currentAge')),m=t*12,rm=n('expectedReturn')/100/12,pv=n('amount'),pm=n('contribution')/12;const fv=pv*Math.pow(1+rm,m)+(rm?pm*(Math.pow(1+rm,m)-1)/rm:pm*m);return [{label:'Estimated Retirement Balance',value:fmt(fv)},{label:'Total Contributions',value:fmt(n('amount')+n('contribution')*t)},{label:'Estimated Investment Growth',value:fmt(fv-(n('amount')+n('contribution')*t))}]}
  if(slug==='pension-calculator'){const annual=n('salary')*n('accrual')/100*n('service');return [{label:'Estimated Annual Pension',value:fmt(annual)},{label:'Estimated Monthly Pension',value:fmt(annual/12)},{label:'Replacement Rate',value:pct(n('accrual')*n('service'))}]}
  if(slug==='sip-calculator'){const m=n('monthlyContribution'),rm=n('expectedReturn')/100/12,months=y*12,fv=rm?m*(Math.pow(1+rm,months)-1)/rm:m*months;return [{label:'Estimated Future Value',value:fmt(fv)},{label:'Total Invested',value:fmt(m*months)},{label:'Estimated Gain',value:fmt(fv-m*months)}]}
  if(slug==='fd-calculator'){const P=n('amount'),freq=Math.max(1,n('compounding')),fv=P*Math.pow(1+r/freq,freq*y);return [{label:'Maturity Amount',value:fmt(fv)},{label:'Interest Earned',value:fmt(fv-P)},{label:'Principal',value:fmt(P)}]}
  if(slug==='ppf-calculator'){const P=n('contribution'),rate=r,annualRate=rate;let bal=0;for(let i=0;i<Math.max(1,y);i++)bal=(bal+P)*(1+annualRate);return [{label:'Estimated Maturity Value',value:fmt(bal)},{label:'Total Contributions',value:fmt(P*Math.max(1,y))},{label:'Estimated Interest',value:fmt(bal-P*Math.max(1,y))}]}
  if(slug==='nps-calculator'){const m=n('monthlyContribution'),rm=n('expectedReturn')/100/12,months=y*12,corpus=rm?m*(Math.pow(1+rm,months)-1)/rm:m*months,annuity=corpus*n('annuity')/100;return [{label:'Estimated Corpus',value:fmt(corpus)},{label:'Annuity Allocation',value:fmt(annuity)},{label:'Remaining Lump Sum',value:fmt(corpus-annuity)}]}
  if(slug==='401k-calculator'){const sal=n('salary'),emp=n('contribution'),match=Math.min(n('matchLimit'),n('employerMatch'))/100*sal,annual=emp+match,rm=n('expectedReturn')/100,months=y*12,r=rm/12,fv=n('amount')*Math.pow(1+r,months)+(r?annual/12*(Math.pow(1+r,months)-1)/r:annual*y);return [{label:'Estimated 401(k) Balance',value:fmt(fv)},{label:'Annual Employer Match',value:fmt(match)},{label:'Total Annual Contributions',value:fmt(annual)}]}
  if(slug==='social-security-calculator'){const monthly=n('benefit')*Math.pow(1+n('cola')/100,n('years'));return [{label:'Estimated Monthly Benefit',value:fmt(monthly)},{label:'Estimated Annual Benefit',value:fmt(monthly*12)},{label:'COLA Growth',value:pct((Math.pow(1+n('cola')/100,n('years'))-1)*100)}]}
  if(slug==='income-tax-calculator'){const gross=n('gross'),tax=gross*n('taxRate')/100;return [{label:'Estimated Tax',value:fmt(tax)},{label:'After-Tax Income',value:fmt(gross-tax)},{label:'Effective Tax Rate',value:pct(n('taxRate'))}]}
  if(slug==='take-home-pay-calculator'){const gross=n('gross'),tax=gross*n('taxRate')/100,payroll=gross*n('payroll')/100,ret=gross*n('retirementContribution')/100,net=gross-tax-payroll-ret-n('deductions');return [{label:'Estimated Annual Take-Home',value:fmt(Math.max(0,net))},{label:'Estimated Monthly Take-Home',value:fmt(Math.max(0,net)/12)},{label:'Total Deductions',value:fmt(tax+payroll+ret+n('deductions'))}]}
  if(slug==='salary-calculator'){const amount=n('amount'),hours=n('hours'),weeks=n('weeks'),annual=amount*weeks;return [{label:'Annual Pay',value:fmt(annual)},{label:'Monthly Equivalent',value:fmt(annual/12)},{label:'Hourly Equivalent',value:fmt(hours?annual/(hours*weeks):0)}]}
  if(slug==='gst-calculator'){const p=n('price'),tax=p*n('gstRate')/100;return [{label:'GST Amount',value:fmt(tax)},{label:'Total Including GST',value:fmt(p+tax)},{label:'Pre-GST Price',value:fmt(p)}]}
  if(slug==='sales-tax-calculator'){const p=n('price'),tax=p*n('taxRate')/100;return [{label:'Sales Tax',value:fmt(tax)},{label:'Total With Tax',value:fmt(p+tax)},{label:'Pre-Tax Price',value:fmt(p)}]}
  if(slug==='percentage-calculator'){const a=n('amount'),p=n('percentage');return [{label:`${p}% of ${a}`,value:(a*p/100).toFixed(2)},{label:'Percentage as Decimal',value:(p/100).toFixed(4)},{label:'Base Number',value:a.toFixed(2)}]}
  if(slug==='age-calculator'){const b=new Date(v.birth+'T00:00:00'),t=new Date(v.target+'T00:00:00');let age=t.getFullYear()-b.getFullYear();const before=t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate());if(before)age--;const days=Math.max(0,Math.floor((t.getTime()-b.getTime())/86400000));return [{label:'Age in Years',value:String(Math.max(0,age))},{label:'Age in Days',value:String(days)},{label:'Birth Date',value:v.birth}]}
  if(slug==='date-calculator'){const a=new Date(v.birth+'T00:00:00'),b=new Date(v.target+'T00:00:00'),diff=Math.round((b.getTime()-a.getTime())/86400000),add=Number.parseInt(v.days||'0',10)||0;const out=new Date(a);out.setDate(out.getDate()+add);return [{label:'Days Between Dates',value:String(Math.abs(diff))},{label:'Signed Difference',value:String(diff)},{label:'Date After Adding Days',value:out.toISOString().slice(0,10)}]}
  if(slug==='bmi-calculator'){const bmi=n('weight')/Math.pow(n('height')/100,2);const cat=bmi<18.5?'Underweight':bmi<25?'Healthy range':bmi<30?'Overweight':'Obesity range';return [{label:'BMI',value:bmi.toFixed(1)},{label:'Category',value:cat},{label:'Height / Weight',value:`${n('height')} cm / ${n('weight')} kg`}]}
  if(slug==='calorie-calculator'){const age=n('currentAge'),w=n('weight'),h=n('height'),sex=v.sex==='female'?-161:5,bmr=10*w+6.25*h-5*age+sex,tdee=bmr*n('activity');return [{label:'Estimated BMR',value:`${Math.round(bmr)} kcal/day`},{label:'Estimated Daily Calories',value:`${Math.round(tdee)} kcal/day`},{label:'Activity Multiplier',value:n('activity').toFixed(2)}]}
  if(slug==='mortgage-payment-calculator'){const m=loanPayment(n('loan'),n('rate'),n('term'));return [{label:'Monthly Principal & Interest',value:fmt(m)},{label:'Total Payments',value:fmt(m*n('term')*12)},{label:'Total Interest',value:fmt(m*n('term')*12-n('loan'))}]}
  if(slug==='auto-loan-calculator'){const loan=Math.max(0,n('purchase')-n('down')),m=loanPayment(loan,n('rate'),n('term'));return [{label:'Amount Financed',value:fmt(loan)},{label:'Monthly Payment',value:fmt(m)},{label:'Total Interest',value:fmt(m*n('term')*12-loan)}]}
  if(slug==='discount-calculator'){const p=n('price'),d=p*n('discount')/100;return [{label:'Discount Amount',value:fmt(d)},{label:'Sale Price',value:fmt(p-d)},{label:'You Save',value:fmt(d)}]}
  if(slug==='tip-calculator'){const p=n('price'),tip=p*n('tip')/100,total=p+tip,people=Math.max(1,n('people'));return [{label:'Tip Amount',value:fmt(tip)},{label:'Total Bill',value:fmt(total)},{label:'Per Person',value:fmt(total/people)}]}
  if(slug==='profit-margin-calculator'){const c=n('cost'),s=n('selling'),profit=s-c;return [{label:'Profit',value:fmt(profit)},{label:'Profit Margin',value:pct(s?profit/s*100:0)},{label:'Markup',value:pct(c?profit/c*100:0)}]}
  if(slug==='break-even-calculator'){const fixed=n('fixed'),variable=n('variable'),price=n('unitPrice'),q=price>variable?fixed/(price-variable):0;return [{label:'Break-Even Units',value:q.toFixed(2)},{label:'Break-Even Revenue',value:fmt(q*price)},{label:'Contribution Margin / Unit',value:fmt(price-variable)}]}
  return [{label:'Result',value:fmt(n('amount'))}];
}

function Stopwatch(){const [running,setRunning]=useState(false),[elapsed,setElapsed]=useState(0);useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setElapsed(e=>e+10),10);return()=>window.clearInterval(id)},[running]);const h=Math.floor(elapsed/3600000),m=Math.floor(elapsed/60000)%60,s=Math.floor(elapsed/1000)%60,ms=Math.floor(elapsed/10)%100;return <Shell title="Online Stopwatch" description="A precise browser stopwatch with start, pause, reset, and hundredth-second display. It runs locally in your browser and works on desktop and mobile."><div className="rounded-3xl border bg-muted/20 p-8 text-center"><div className="font-mono text-5xl md:text-7xl font-bold tracking-tight">{String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}<span className="text-primary">.{String(ms).padStart(2,'0')}</span></div><div className="mt-8 flex flex-wrap justify-center gap-3"><Button size="lg" onClick={()=>setRunning(x=>!x)}>{running?<><Pause/>Pause</>:<><Play/>Start</>}</Button><Button size="lg" variant="outline" onClick={()=>{setRunning(false);setElapsed(0)}}><RotateCcw/>Reset</Button></div></div></Shell>}

function ScientificCalculator(){const [display,setDisplay]=useState('0');const press=(x:string)=>setDisplay(d=>d==='0'?x:d+x);const clear=()=>setDisplay('0');const evaluate=()=>{try{const safe=display.replace(/×/g,'*').replace(/÷/g,'/').replace(/[^0-9+\-*/().\s]/g,'');setDisplay(String(Function(`"use strict";return (${safe})`)()))}catch{setDisplay('Error')}};const fn=(name:string)=>{const x=Number(display);if(!Number.isFinite(x))return;const map:Record<string,number>={sin:Math.sin(x),cos:Math.cos(x),tan:Math.tan(x),sqrt:Math.sqrt(x),ln:Math.log(x),log:Math.log10(x)};setDisplay(String(map[name]));};return <Shell title="Scientific Calculator" description="A responsive scientific calculator for arithmetic, powers, roots, logarithms, and trigonometric functions."><div className="mx-auto max-w-xl rounded-3xl border p-4"><Input readOnly value={display} className="h-16 text-right text-2xl font-mono mb-4"/><div className="grid grid-cols-4 gap-2">{['sin','cos','tan','sqrt','ln','log','(',')','7','8','9','÷','4','5','6','×','1','2','3','-','0','.','+','^'].map(k=><Button key={k} variant="outline" onClick={()=>['sin','cos','tan','sqrt','ln','log'].includes(k)?fn(k):press(k==='^'?'**':k)}>{k}</Button>)}<Button variant="destructive" onClick={clear}>C</Button><Button className="col-span-3" onClick={evaluate}>= Calculate</Button></div></div></Shell>}

function RandomNumberGenerator(){const [min,setMin]=useState('1'),[max,setMax]=useState('100'),[count,setCount]=useState('1'),[out,setOut]=useState<number[]>([]);const generate=()=>{const a=num(min),b=Math.max(a,num(max)),c=Math.min(100,Math.max(1,Math.round(num(count))));const arr=Array.from({length:c},()=>a+Math.floor(Math.random()*(b-a+1)));setOut(arr)};return <Shell title="Random Number Generator" description="Generate one or many random integers between a minimum and maximum value. Results are generated in your browser."><div className="grid gap-4 md:grid-cols-3"><div><Label>Minimum</Label><Input value={min} onChange={e=>setMin(e.target.value)} type="number"/></div><div><Label>Maximum</Label><Input value={max} onChange={e=>setMax(e.target.value)} type="number"/></div><div><Label>How Many</Label><Input value={count} onChange={e=>setCount(e.target.value)} type="number" min="1" max="100"/></div></div><Button className="mt-5 w-full" size="lg" onClick={generate}><Shuffle/>Generate Numbers</Button>{out.length>0&&<div className="mt-5 rounded-2xl border p-5 text-2xl font-mono break-words">{out.join(', ')}</div>}</Shell>}

function TimeZoneConverter(){
  const [date,setDate]=useState(new Date().toISOString().slice(0,16)),[from,setFrom]=useState('America/New_York'),[to,setTo]=useState('Asia/Kolkata');
  const zones=['America/New_York','America/Los_Angeles','America/Chicago','America/Denver','Europe/London','Europe/Berlin','Asia/Kolkata','Asia/Dubai','Asia/Singapore','Asia/Tokyo','Australia/Sydney'];
  const output=useMemo(()=>{
    try{
      const parts=date.split(/[-T:]/).map(Number);
      const [Y,M,D,h,m]=parts;
      const approx=Date.UTC(Y,M-1,D,h,m);
      const sourceParts=new Intl.DateTimeFormat('en-US',{timeZone:from,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(approx));
      const get=(type:string)=>Number(sourceParts.find(p=>p.type===type)?.value||0);
      const correction=Date.UTC(Y,M-1,D,h,m)-Date.UTC(get('year'),get('month')-1,get('day'),get('hour'),get('minute'));
      const instant=new Date(approx+correction);
      return new Intl.DateTimeFormat(undefined,{timeZone:to,dateStyle:'full',timeStyle:'long'}).format(instant);
    }catch{return 'Invalid date'}
  },[date,from,to]);
  return <Shell title="Time Zone Converter" description="Convert a local date and time between major US, European, Asian, and Australian time zones using the browser's timezone database.">
    <div className="grid gap-4 md:grid-cols-3">
      <div><Label>Date & Time</Label><Input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)}/></div>
      <div><Label>From Time Zone</Label><Select value={from} onValueChange={setFrom}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{zones.map(z=><SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>To Time Zone</Label><Select value={to} onValueChange={setTo}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{zones.map(z=><SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent></Select></div>
    </div>
    <div className="mt-5 rounded-2xl border bg-muted/20 p-6"><div className="text-sm text-muted-foreground">Converted time</div><div className="mt-2 text-2xl font-bold">{output}</div></div>
  </Shell>
}

function CurrencyConverter(){
  const [amount,setAmount]=useState('100'),[from,setFrom]=useState('USD'),[to,setTo]=useState('INR'),[rate,setRate]=useState(''),[loading,setLoading]=useState(false),[source,setSource]=useState('Enter a rate or fetch a reference rate');
  useEffect(()=>{let cancelled=false; if(from===to){setRate('1');setSource('Same currency');return;} setLoading(true);fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`).then(r=>r.ok?r.json():Promise.reject(new Error('Rate unavailable'))).then(data=>{if(cancelled)return;const next=data?.rates?.[to];if(typeof next==='number'){setRate(String(next));setSource(`Reference rate from Frankfurter/ECB data (${data.date})`)}else throw new Error('Rate unavailable')}).catch(()=>{if(!cancelled)setSource('Live reference unavailable — enter the exchange rate manually')}).finally(()=>{if(!cancelled)setLoading(false)});return()=>{cancelled=true}},[from,to]);
  const result=num(amount)*num(rate);
  return <Shell title="Currency Converter" description="Convert between major currencies with a reference exchange rate and a transparent calculation. Rates can change, so verify the quote before a transaction.">
    <div className="grid gap-4 md:grid-cols-4">
      <div><Label>Amount</Label><Input value={amount} onChange={e=>setAmount(e.target.value)} type="number" min="0"/></div>
      <div><Label>From</Label><Select value={from} onValueChange={setFrom}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['USD','INR','EUR','GBP','CAD','AUD','JPY'].map(x=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>To</Label><Select value={to} onValueChange={setTo}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['USD','INR','EUR','GBP','CAD','AUD','JPY'].map(x=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Exchange Rate (1 {from} =)</Label><Input value={rate} onChange={e=>{setRate(e.target.value);setSource('Manual rate')}} type="number" min="0" step="any"/></div>
    </div>
    <div className="mt-5 rounded-2xl border p-6 text-center"><div className="text-sm text-muted-foreground">Converted amount</div><div className="mt-1 text-4xl font-bold">{result.toLocaleString(undefined,{maximumFractionDigits:2})} {to}</div><div className="mt-2 text-xs text-muted-foreground">{loading?'Fetching reference rate…':source}</div></div>
  </Shell>
}
