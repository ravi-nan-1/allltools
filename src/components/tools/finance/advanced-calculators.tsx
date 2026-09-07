'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Calculator, Play, Pause, RotateCcw, Shuffle, Gauge, Info, Ruler, Scale, HeartPulse, TrendingUp, WalletCards, CircleDollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StopwatchTool from '@/app/tools/stopwatch/stopwatch';
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
  if (slug === 'stopwatch') return <StopwatchTool />;
  if (slug === 'scientific-calculator') return <ScientificCalculator />;
  if (slug === 'random-number-generator') return <RandomNumberGenerator />;
  if (slug === 'bmi-calculator') return <BmiCalculator />;
  if (slug === 'sip-calculator') return <SipCalculator />;
  if (slug === 'time-zone-converter') return <TimeZoneConverter />;
  if (slug === 'currency-converter') return <CurrencyConverter />;
  if (slug === 'roi-calculator') return <RoiCalculator />;

  const cfg = configs[slug] ?? { title: 'Calculator', description: 'Calculate useful results instantly.' };
  return <GenericAdvancedCalculator slug={slug} cfg={cfg} />;
}

function Shell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <Card className="w-full overflow-hidden border-2 shadow-sm transition-shadow hover:shadow-md">
    <CardHeader className="relative overflow-hidden border-b bg-gradient-to-br from-primary/15 via-background to-primary/5 p-5 md:p-7">
      <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Calculator className="h-3.5 w-3.5 text-primary" /> Advanced Tool
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">{title}</CardTitle>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
        </div>
        <div className="hidden rounded-xl border bg-background/70 px-3 py-2 text-xs text-muted-foreground sm:block">Live calculation</div>
      </div>
    </CardHeader>
    <CardContent className="p-4 md:p-7">{children}</CardContent>
  </Card>;
}

function GenericAdvancedCalculator({ slug, cfg }: { slug: string; cfg: { title: string; description: string } }) {
  const [currency, setCurrency] = useState(slug === 'gst-calculator' || slug === 'ppf-calculator' || slug === 'nps-calculator' || slug === 'sip-calculator' || slug === 'fd-calculator' ? 'INR' : 'USD');
  const [v, setV] = useState<Record<string, string>>({
    amount: '100000', rate: '7', years: '20', contribution: '10000', inflation: '3', currentAge: '35', retirementAge: '65', salary: '80000', service: '25', accrual: '1.5', annuity: '40', benefit: '2500', cola: '2', taxRate: '20', payroll: '7.65', retirementContribution: '5', deductions: '0', gross: '80000', hours: '40', weeks: '52', gstRate: '18', price: '100', percentage: '20', birth: '1990-01-01', target: new Date().toISOString().slice(0,10), days: '30', height: '170', weight: '70', sex: 'male', activity: '1.55', homePrice: '400000', down: '80000', monthly: '700', cardApr: '24', discount: '20', tip: '18', people: '2', cost: '60', selling: '100', fixed: '10000', variable: '20', unitPrice: '50', employerMatch: '50', matchLimit: '6', monthlyContribution: '500', frequency: '12', compounding: '12', initial: '10000', expectedReturn: '8', loan: '250000', term: '30', purchase: '30000', min: '1', max: '100', exchangeRate: '1' });
  const set = (k: string, x: string) => setV(p => ({ ...p, [k]: x }));
  
  const result = useMemo(() => calcAdvanced(slug, v, currency), [slug, v, currency]);
  const fields = fieldsFor(slug);
  const disclaimer = slug === 'bmi-calculator'
    ? 'BMI is a general screening estimate. It does not account for muscle mass, frame size, age, sex, or overall health and is not a diagnosis.'
    : slug === 'calorie-calculator'
      ? 'Calorie results are estimates based on the Mifflin–St Jeor equation and an activity multiplier. Individual metabolism and energy needs vary, so this is not a medical or dietary prescription.'
      : 'Results are estimates for planning and education. Financial outcomes can depend on rates, fees, taxes, product terms, personal circumstances, and data sources.';

  return <Shell title={cfg.title} description={cfg.description}>
    <div className="rounded-2xl border bg-gradient-to-b from-muted/30 to-background p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div><div className="text-sm font-semibold">Calculator inputs</div><div className="text-xs text-muted-foreground">Update any value to recalculate instantly.</div></div>
        <Button type="button" size="sm" variant="ghost" onClick={()=>setV(p=>({ ...p }))}><RotateCcw className="mr-1.5 h-4 w-4" />Refresh</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {fields.map(f => f.key === 'currency' ? <div key={f.key}><Label>Currency</Label><Select value={currency} onValueChange={setCurrency}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="INR">INR (₹)</SelectItem><SelectItem value="EUR">EUR (€)</SelectItem><SelectItem value="GBP">GBP (£)</SelectItem></SelectContent></Select></div> : f.key === 'sex' ? <div key={f.key}><Label>Sex</Label><Select value={v.sex} onValueChange={x=>set('sex',x)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></div> : <div key={f.key}><Label>{f.label}</Label><Input className="mt-1" type={f.type ?? 'number'} value={v[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} /></div>)}
      </div>
    </div>
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between"><div><div className="text-sm font-semibold">Your results</div><div className="text-xs text-muted-foreground">Calculated from the values above.</div></div><div className="rounded-full border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">Instant</div></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.map((x,i) => <div key={x.label} className={`group rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${i===0?'bg-primary/[0.06] border-primary/30':''}`}><div className="text-sm text-muted-foreground">{x.label}</div><div className="mt-1 text-2xl font-bold tracking-tight break-words">{x.value}</div></div>)}
      </div>
    </div>
    <p className="mt-5 text-xs text-muted-foreground">{disclaimer}</p>
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
  if(slug==='calorie-calculator'){const age=n('currentAge'),w=n('weight'),h=n('height'),activity=n('activity');if(age<=0||w<=0||h<=0||activity<=0)return [{label:'Result',value:'Enter positive age, height, weight, and activity values'},{label:'Status',value:'Not calculated'}];const sex=v.sex==='female'?-161:5,bmr=10*w+6.25*h-5*age+sex,tdee=bmr*activity;return [{label:'Estimated BMR',value:`${Math.round(bmr)} kcal/day`},{label:'Estimated Daily Calories',value:`${Math.round(tdee)} kcal/day`},{label:'Activity Multiplier',value:activity.toFixed(2)}]}
  if(slug==='mortgage-payment-calculator'){const m=loanPayment(n('loan'),n('rate'),n('term'));return [{label:'Monthly Principal & Interest',value:fmt(m)},{label:'Total Payments',value:fmt(m*n('term')*12)},{label:'Total Interest',value:fmt(m*n('term')*12-n('loan'))}]}
  if(slug==='auto-loan-calculator'){const loan=Math.max(0,n('purchase')-n('down')),m=loanPayment(loan,n('rate'),n('term'));return [{label:'Amount Financed',value:fmt(loan)},{label:'Monthly Payment',value:fmt(m)},{label:'Total Interest',value:fmt(m*n('term')*12-loan)}]}
  if(slug==='discount-calculator'){const p=n('price'),d=p*n('discount')/100;return [{label:'Discount Amount',value:fmt(d)},{label:'Sale Price',value:fmt(p-d)},{label:'You Save',value:fmt(d)}]}
  if(slug==='tip-calculator'){const p=n('price'),tip=p*n('tip')/100,total=p+tip,people=Math.max(1,n('people'));return [{label:'Tip Amount',value:fmt(tip)},{label:'Total Bill',value:fmt(total)},{label:'Per Person',value:fmt(total/people)}]}
  if(slug==='profit-margin-calculator'){const c=n('cost'),s=n('selling'),profit=s-c;return [{label:'Profit',value:fmt(profit)},{label:'Profit Margin',value:pct(s?profit/s*100:0)},{label:'Markup',value:pct(c?profit/c*100:0)}]}
  if(slug==='break-even-calculator'){const fixed=n('fixed'),variable=n('variable'),price=n('unitPrice'),q=price>variable?fixed/(price-variable):0;return [{label:'Break-Even Units',value:q.toFixed(2)},{label:'Break-Even Revenue',value:fmt(q*price)},{label:'Contribution Margin / Unit',value:fmt(price-variable)}]}
  return [{label:'Result',value:fmt(n('amount'))}];
}

function RoiCalculator() {
  const [cost, setCost] = useState(100000);
  const [finalValue, setFinalValue] = useState(140000);
  const [additionalCosts, setAdditionalCosts] = useState(0);
  const [years, setYears] = useState(1);
  const [currency, setCurrency] = useState('INR');

  const result = useMemo(() => {
    const invested = Math.max(0, cost) + Math.max(0, additionalCosts);
    const netGain = finalValue - invested;
    const roi = invested > 0 ? (netGain / invested) * 100 : 0;
    const returnMultiple = invested > 0 ? finalValue / invested : 0;
    const annualized = invested > 0 && finalValue >= 0 && years > 0
      ? (Math.pow(finalValue / invested, 1 / years) - 1) * 100
      : 0;
    const gainShare = finalValue > 0 ? Math.max(0, Math.min(100, netGain / finalValue * 100)) : 0;
    const schedule: { year: number; invested: number; value: number; gain: number }[] = [];
    const horizon = Math.max(1, Math.min(30, Math.round(years)));
    const multiple = invested > 0 && finalValue >= 0 ? Math.pow(finalValue / invested, 1 / horizon) : 1;
    for (let year = 1; year <= horizon; year++) {
      const value = invested * Math.pow(multiple, year);
      schedule.push({ year, invested, value, gain: value - invested });
    }
    return { invested, netGain, roi, returnMultiple, annualized, gainShare, schedule };
  }, [cost, finalValue, additionalCosts, years]);

  const fmt = (n: number) => money(n, currency);
  const arc = `${Math.max(0, Math.min(100, result.gainShare)).toFixed(2)}%`;
  const positive = result.netGain >= 0;

  return (
    <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-5 sm:p-7 md:p-9">
            <div className="mb-7 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Online ROI Calculator</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">Calculate your return on investment</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Enter what you invested and what the investment is worth now to instantly calculate profit or loss, ROI percentage, return multiple and an optional annualized return.</p>
              </div>
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 sm:flex"><TrendingUp className="h-5 w-5" /></div>
            </div>

            <div className="mb-5 flex items-center gap-3 rounded-2xl border bg-slate-50/80 p-3">
              <Label className="shrink-0">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-32 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="INR">INR (₹)</SelectItem></SelectContent>
              </Select>
            </div>

            <RoiSlider label="Initial investment" value={cost} min={0} max={10000000} step={1000} prefix={currency === 'INR' ? '₹' : '$'} onChange={setCost} />
            <RoiSlider label="Current / final value" value={finalValue} min={0} max={20000000} step={1000} prefix={currency === 'INR' ? '₹' : '$'} onChange={setFinalValue} />
            <RoiSlider label="Additional costs" value={additionalCosts} min={0} max={2000000} step={1000} prefix={currency === 'INR' ? '₹' : '$'} onChange={setAdditionalCosts} />
            <RoiSlider label="Holding period" value={years} min={1} max={30} step={1} suffix="yr" onChange={setYears} />

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className={`rounded-2xl border p-4 ${positive ? 'border-emerald-100 bg-emerald-50/70' : 'border-rose-100 bg-rose-50/70'}`}>
                <p className="text-sm text-slate-500">Net profit / loss</p>
                <p className={`mt-1 text-2xl font-bold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(result.netGain)}</p>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                <p className="text-sm text-slate-500">ROI percentage</p>
                <p className="mt-1 text-2xl font-bold text-indigo-600">{pct(result.roi)}</p>
              </div>
            </div>
          </div>

          <div className="border-t bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-5 sm:p-7 lg:border-l lg:border-t-0 md:p-9">
            <div className="mb-4 flex items-center justify-between">
              <div><p className="text-sm font-semibold text-slate-700">ROI performance meter</p><p className="text-xs text-slate-500">Investment cost compared with the final value</p></div>
              <TrendingUp className={`h-5 w-5 ${positive ? 'text-emerald-500' : 'text-rose-500'}`} />
            </div>
            <div className="mx-auto my-5 flex max-w-[300px] items-center justify-center">
              <div className="relative h-56 w-56 rounded-full" style={{ background: `conic-gradient(#5065f6 0 ${arc}, #e9edff ${arc} 100%)` }}>
                <div className="absolute inset-[28px] flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
                  <span className="text-xs font-medium text-slate-500">ROI</span>
                  <strong className={`mt-1 text-3xl font-bold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>{pct(result.roi)}</strong>
                  <span className="mt-1 text-xs text-slate-500">{result.returnMultiple.toFixed(2)}× return</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#5065f6]" /> Net result</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#e9edff]" /> Original value</span></div>
            <div className="mt-8 space-y-4">
              <LoanLikeResult label="Total invested" value={fmt(result.invested)} icon={<WalletCards className="h-4 w-4" />} />
              <LoanLikeResult label="Profit / loss" value={fmt(result.netGain)} icon={<CircleDollarSign className="h-4 w-4" />} />
              <LoanLikeResult label="Ending value" value={fmt(finalValue)} icon={<TrendingUp className="h-4 w-4" />} strong />
              <LoanLikeResult label="Annualized return" value={pct(result.annualized)} icon={<Calculator className="h-4 w-4" />} />
            </div>
          </div>
        </div>

        <div className="border-t bg-white p-5 sm:p-7 md:p-9">
          <div className="mb-5"><h3 className="text-xl font-bold text-slate-800">ROI growth projection</h3><p className="mt-1 text-sm text-slate-500">The annualized view shows a mathematical path from the invested amount to the final value over the selected holding period.</p></div>
          <div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-4 py-3">Year</th><th className="px-4 py-3">Invested</th><th className="px-4 py-3">Gain / Loss</th><th className="px-4 py-3">Estimated value</th></tr></thead><tbody>{result.schedule.map(r => <tr key={r.year} className="border-t"><td className="px-4 py-3 font-medium">{r.year}</td><td className="px-4 py-3">{fmt(r.invested)}</td><td className={`px-4 py-3 ${r.gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(r.gain)}</td><td className="px-4 py-3 font-semibold">{fmt(r.value)}</td></tr>)}</tbody></table></div>
          <p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" />Basic ROI measures gain or loss against the total amount invested. It does not automatically account for taxes, inflation, financing costs, cash-flow timing or risk. Annualized return is an estimate based on the selected holding period and assumes a mathematically consistent path between the two values.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RoiSlider({ label, value, min, max, step, prefix, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; prefix?: string; suffix?: string; onChange: (value: number) => void }) {
  const display = `${prefix ?? ''}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix ? ` ${suffix}` : ''}`;
  return <div className="mb-5">
    <div className="mb-2 flex items-center justify-between gap-3"><Label className="text-base font-medium text-slate-700">{label}</Label><div className="rounded-lg bg-emerald-50 px-3 py-2 text-lg font-semibold text-emerald-600">{display}</div></div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-emerald-600" />
    <div className="mt-1 flex justify-between text-[11px] text-slate-400"><span>{prefix ?? ''}{min.toLocaleString()}</span><span>{prefix ?? ''}{max.toLocaleString()} {suffix ?? ''}</span></div>
  </div>;
}

function LoanLikeResult({ label, value, icon, strong }: { label: string; value: string; icon: ReactNode; strong?: boolean }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-indigo-500">{icon}</span><span className="text-sm text-slate-500">{label}</span></div><span className={strong ? 'text-base font-black text-slate-800' : 'text-base font-bold text-slate-700'}>{value}</span></div>;
}



function SipCalculator(){
  const [mode,setMode]=useState<'sip'|'lumpsum'>('sip');
  const [monthly,setMonthly]=useState('25000');
  const [lumpSum,setLumpSum]=useState('1000000');
  const [returnRate,setReturnRate]=useState('12');
  const [years,setYears]=useState('10');
  const [currency,setCurrency]=useState('INR');
  const moneyFmt=(n:number)=>money(n,currency);
  const values=useMemo(()=>{
    const principal=Math.max(0,Number.parseFloat(mode==='sip'?monthly:lumpSum)||0);
    const annual=Math.max(-99.9,Number.parseFloat(returnRate)||0)/100;
    const yrs=Math.max(1,Math.min(50,Number.parseFloat(years)||0));
    const months=Math.round(yrs*12);
    const monthlyRate=Math.pow(1+annual,1/12)-1;
    let future=0;
    if(mode==='sip') future=monthlyRate===0?principal*months:principal*((Math.pow(1+monthlyRate,months)-1)/monthlyRate)*(1+monthlyRate);
    else future=principal*Math.pow(1+annual,yrs);
    const invested=mode==='sip'?principal*months:principal;
    const gain=future-invested;
    const ratio=future>0?Math.min(100,Math.max(0,(Math.max(0,gain)/future)*100)):0;
    const yearly=Array.from({length:Math.min(10,Math.ceil(yrs))},(_,i)=>{
      const y=i+1; const m=Math.min(months,y*12);
      const value=mode==='sip'?(monthlyRate===0?principal*m:principal*((Math.pow(1+monthlyRate,m)-1)/monthlyRate)*(1+monthlyRate)):principal*Math.pow(1+annual,y);
      const contrib=mode==='sip'?principal*m:principal;
      return {year:y,value,invested:contrib,gain:value-contrib};
    });
    return {future,invested,gain,ratio,years:yrs,months,yearly};
  },[mode,monthly,lumpSum,returnRate,years]);
  const slider=(label:string,value:string,setter:(v:string)=>void,min:number,max:number,step:number,suffix='')=>(
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3"><Label className="text-sm font-semibold">{label}</Label><div className="flex items-center rounded-lg border bg-emerald-50 px-3 py-1.5 text-emerald-700"><span className="mr-1 text-sm font-semibold">{label.toLowerCase().includes('return')?'':currency==='INR'?'₹':currency==='USD'?'$':currency==='EUR'?'€':'£'}</span><Input aria-label={label} className="h-7 w-28 border-0 bg-transparent p-0 text-right text-base font-semibold shadow-none focus-visible:ring-0" value={value} onChange={e=>setter(e.target.value)} type="number" min={min} max={max} step={step}/>{suffix&&<span className="ml-1 text-sm font-semibold">{suffix}</span>}</div></div>
      <input aria-label={`${label} slider`} type="range" min={min} max={max} step={step} value={Number(value)||min} onChange={e=>setter(e.target.value)} className="h-2 w-full cursor-pointer accent-emerald-500" />
      <div className="flex justify-between text-[11px] text-muted-foreground"><span>{label.toLowerCase().includes('return')?`${min}%`:currency==='INR'?moneyFmt(min):min}</span><span>{label.toLowerCase().includes('return')?`${max}%`:currency==='INR'?moneyFmt(max):`${max}${suffix}`}</span></div>
    </div>
  );
  return <Shell title="Online SIP Calculator" description="Estimate how a regular investment or one-time lump sum could grow over time. Adjust the contribution, expected return, and tenure to compare scenarios instantly.">
    <div className="overflow-hidden rounded-3xl border bg-gradient-to-br from-emerald-50 via-background to-indigo-50 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-background/80 p-3 md:p-4"><div className="flex rounded-full bg-muted p-1"><button type="button" onClick={()=>setMode('sip')} className={`rounded-full px-5 py-2 text-sm font-bold transition ${mode==='sip'?'bg-emerald-500 text-white shadow':'text-muted-foreground hover:text-foreground'}`}>SIP</button><button type="button" onClick={()=>setMode('lumpsum')} className={`rounded-full px-5 py-2 text-sm font-bold transition ${mode==='lumpsum'?'bg-indigo-500 text-white shadow':'text-muted-foreground hover:text-foreground'}`}>Lumpsum</button></div><Select value={currency} onValueChange={setCurrency}><SelectTrigger className="w-[130px] bg-background"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="INR">INR (₹)</SelectItem><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="EUR">EUR (€)</SelectItem><SelectItem value="GBP">GBP (£)</SelectItem></SelectContent></Select></div>
      <div className="grid gap-8 p-5 md:p-8 xl:grid-cols-[1.05fr_.95fr]"><div className="space-y-8">{mode==='sip'?slider('Monthly investment',monthly,setMonthly,500,500000,500):slider('Lumpsum investment',lumpSum,setLumpSum,10000,10000000,10000)}{slider('Expected return rate (p.a.)',returnRate,setReturnRate,-10,30,0.1,'%')}{slider('Time period',years,setYears,1,50,1,' Yr')}<div className="rounded-2xl border bg-background/80 p-4"><div className="text-sm font-semibold">Quick scenario</div><p className="mt-1 text-xs leading-5 text-muted-foreground">Change any slider or value above and the projection updates immediately. The return is an assumption, not a guaranteed market outcome.</p></div></div>
        <div className="flex flex-col items-center justify-center rounded-3xl border bg-background/70 p-5 md:p-7"><div className="mb-4 flex w-full items-center justify-between text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-indigo-100"/>Invested amount</span><span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500"/>Estimated returns</span></div><div className="relative grid h-56 w-56 place-items-center rounded-full" style={{background:`conic-gradient(#536dfe 0deg ${values.ratio*3.6}deg, #e9edff ${values.ratio*3.6}deg 360deg)`}}><div className="grid h-36 w-36 place-items-center rounded-full bg-background text-center shadow-inner"><div><div className="text-xs text-muted-foreground">Total value</div><div className="mt-1 text-2xl font-black tracking-tight">{moneyFmt(values.future)}</div></div></div></div><div className="mt-6 w-full space-y-3"><div className="flex items-center justify-between gap-4"><span className="text-sm text-muted-foreground">Invested amount</span><strong>{moneyFmt(values.invested)}</strong></div><div className="flex items-center justify-between gap-4"><span className="text-sm text-muted-foreground">Estimated returns</span><strong className="text-indigo-600">{moneyFmt(values.gain)}</strong></div><div className="flex items-center justify-between gap-4 border-t pt-3"><span className="font-semibold">Total value</span><strong className="text-xl">{moneyFmt(values.future)}</strong></div></div></div></div>
    </div>
    <div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border bg-emerald-50 p-5"><div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Investment amount</div><div className="mt-2 text-2xl font-black">{mode==='sip'?moneyFmt(Number(monthly)||0):moneyFmt(Number(lumpSum)||0)}</div><p className="mt-1 text-xs text-muted-foreground">{mode==='sip'?'Regular contribution':'One-time investment'}</p></div><div className="rounded-2xl border bg-indigo-50 p-5"><div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Growth assumption</div><div className="mt-2 text-2xl font-black">{Number(returnRate||0).toFixed(1)}%</div><p className="mt-1 text-xs text-muted-foreground">Illustrative annual return</p></div><div className="rounded-2xl border bg-amber-50 p-5"><div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Investment horizon</div><div className="mt-2 text-2xl font-black">{values.years} years</div><p className="mt-1 text-xs text-muted-foreground">{values.months} monthly periods</p></div></div>
    <div className="mt-6 rounded-3xl border p-5 md:p-7"><div className="mb-4"><h3 className="text-xl font-bold">Projected growth by year</h3><p className="mt-1 text-sm text-muted-foreground">See how contributions and estimated growth can build throughout the selected horizon.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead><tr className="border-b text-left"><th className="p-3">Year</th><th className="p-3">Amount invested</th><th className="p-3">Estimated gain</th><th className="p-3">Projected value</th></tr></thead><tbody>{values.yearly.map(row=><tr key={row.year} className="border-b last:border-0"><td className="p-3 font-semibold">{row.year}</td><td className="p-3">{moneyFmt(row.invested)}</td><td className="p-3 text-indigo-600">{moneyFmt(row.gain)}</td><td className="p-3 font-bold">{moneyFmt(row.value)}</td></tr>)}</tbody></table></div></div>
    <div className="mt-6 rounded-2xl border bg-muted/30 p-4 text-xs leading-5 text-muted-foreground"><strong>Investment note:</strong> This calculator is a mathematical projection using the return assumption you enter. Mutual-fund and other market-linked investments can rise or fall, and actual results may differ because of market performance, expenses, taxes, timing, and product-specific terms.</div>
  </Shell>;
}

function BmiCalculator(){
  const [unit,setUnit]=useState<'metric'|'us'|'other'>('metric');
  const [age,setAge]=useState('25');
  const [sex,setSex]=useState<'male'|'female'>('male');
  const [heightCm,setHeightCm]=useState('178');
  const [heightFt,setHeightFt]=useState('5');
  const [heightIn,setHeightIn]=useState('10');
  const [weightKg,setWeightKg]=useState('72.6');
  const [weightLb,setWeightLb]=useState('160');
  const [stones,setStones]=useState('11');
  const [stoneLb,setStoneLb]=useState('6');
  const [showDetails,setShowDetails]=useState(true);

  const metrics=useMemo(()=>{
    const a=Math.max(0,Number.parseFloat(age)||0);
    let h=Number.parseFloat(heightCm)||0;
    let w=Number.parseFloat(weightKg)||0;
    if(unit==='us'){
      const ft=Math.max(0,Number.parseFloat(heightFt)||0), inches=Math.max(0,Number.parseFloat(heightIn)||0);
      h=(ft*12+inches)*2.54;
      w=(Math.max(0,Number.parseFloat(weightLb)||0))*0.45359237;
    } else if(unit==='other'){
      const st=Math.max(0,Number.parseFloat(stones)||0), lb=Math.max(0,Number.parseFloat(stoneLb)||0);
      w=(st*14+lb)*0.45359237;
    }
    const bmi=h>0&&w>0?w/Math.pow(h/100,2):0;
    const category=bmi<18.5?'Underweight':bmi<25?'Healthy range':bmi<30?'Overweight':bmi<35?'Obesity class I':bmi<40?'Obesity class II':'Obesity class III';
    const healthyMin=h>0?18.5*Math.pow(h/100,2):0;
    const healthyMax=h>0?24.9*Math.pow(h/100,2):0;
    const prime=bmi/25;
    const pi=h>0? (w/Math.pow(h/100,3)) : 0;
    return {age:a,height:h,weight:w,bmi,category,healthyMin,healthyMax,prime,pi};
  },[age,unit,heightCm,heightFt,heightIn,weightKg,weightLb,stones,stoneLb]);

  const gauge=Math.min(100,Math.max(0,((metrics.bmi-10)/(45-10))*100));
  const angle=-90+(gauge*180/100);
  const isAdult=metrics.age>=20;
  const colorClass=metrics.bmi<18.5?'text-sky-600':metrics.bmi<25?'text-emerald-600':metrics.bmi<30?'text-amber-600':'text-rose-600';
  const updateMetricWeight=(kg:string)=>setWeightKg(kg);

  return <Shell title="Online BMI Calculator" description="Calculate BMI instantly in metric or US units, see your result on a color-coded BMI meter, estimate a healthy weight range, and explore BMI Prime and Ponderal Index. Designed for adults and with clear guidance for children and teens.">
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
      <div className="rounded-3xl border bg-gradient-to-br from-sky-50 via-background to-emerald-50 p-4 md:p-6">
        <div className="mb-5 flex flex-wrap gap-2">
          {([['metric','Metric Units'],['us','US Units'],['other','Other Units']] as const).map(([key,label])=><Button key={key} type="button" variant={unit===key?'default':'outline'} onClick={()=>setUnit(key)}>{label}</Button>)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Age</Label><Input className="mt-1" type="number" min="2" max="120" value={age} onChange={e=>setAge(e.target.value)} /><p className="mt-1 text-xs text-muted-foreground">Use adult BMI categories from age 20.</p></div>
          <div><Label>Sex</Label><Select value={sex} onValueChange={v=>setSex(v as 'male'|'female')}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></div>
          {unit==='metric' && <><div><Label>Height (cm)</Label><Input className="mt-1" type="number" min="30" step="0.1" value={heightCm} onChange={e=>setHeightCm(e.target.value)} /></div><div><Label>Weight (kg)</Label><Input className="mt-1" type="number" min="1" step="0.1" value={weightKg} onChange={e=>updateMetricWeight(e.target.value)} /></div></>}
          {unit==='us' && <><div><Label>Height (feet)</Label><Input className="mt-1" type="number" min="1" value={heightFt} onChange={e=>setHeightFt(e.target.value)} /></div><div><Label>Height (inches)</Label><Input className="mt-1" type="number" min="0" max="11.99" step="0.1" value={heightIn} onChange={e=>setHeightIn(e.target.value)} /></div><div className="sm:col-span-2"><Label>Weight (lb)</Label><Input className="mt-1" type="number" min="1" step="0.1" value={weightLb} onChange={e=>setWeightLb(e.target.value)} /></div></>}
          {unit==='other' && <><div><Label>Height (cm)</Label><Input className="mt-1" type="number" min="30" step="0.1" value={heightCm} onChange={e=>setHeightCm(e.target.value)} /></div><div><Label>Weight (stones)</Label><Input className="mt-1" type="number" min="0" step="0.1" value={stones} onChange={e=>setStones(e.target.value)} /></div><div className="sm:col-span-2"><Label>Additional pounds</Label><Input className="mt-1" type="number" min="0" max="13.99" step="0.1" value={stoneLb} onChange={e=>setStoneLb(e.target.value)} /></div></>}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border bg-background/80 p-4"><Ruler className="mb-2 h-5 w-5 text-sky-600"/><div className="text-xs text-muted-foreground">Height</div><div className="text-lg font-bold">{metrics.height.toFixed(1)} cm</div></div>
          <div className="rounded-2xl border bg-background/80 p-4"><Scale className="mb-2 h-5 w-5 text-emerald-600"/><div className="text-xs text-muted-foreground">Weight</div><div className="text-lg font-bold">{metrics.weight.toFixed(1)} kg</div></div>
          <div className="rounded-2xl border bg-background/80 p-4"><HeartPulse className="mb-2 h-5 w-5 text-rose-500"/><div className="text-xs text-muted-foreground">Status</div><div className={`text-lg font-bold ${colorClass}`}>{metrics.category}</div></div>
        </div>
      </div>

      <div className="rounded-3xl border bg-background p-5 md:p-7 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><div className="text-sm font-semibold text-muted-foreground">Your BMI</div><div className={`mt-1 text-4xl font-black ${colorClass}`}>{metrics.bmi.toFixed(1)} <span className="text-base font-medium">kg/m²</span></div></div><div className="rounded-full bg-primary/10 p-3"><Gauge className="h-7 w-7 text-primary"/></div></div>
        <div className="relative mx-auto mt-7 h-44 max-w-[360px] overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[320px] w-[320px] -translate-x-1/2 rounded-full" style={{background:'conic-gradient(from 270deg at 50% 50%, #0284c7 0deg 44deg, #16a34a 44deg 77deg, #facc15 77deg 103deg, #fb923c 103deg 128deg, #dc2626 128deg 180deg, transparent 180deg 360deg)'}} />
          <div className="absolute left-1/2 top-8 h-[240px] w-[240px] -translate-x-1/2 rounded-full bg-background" />
          <div className="absolute bottom-5 left-1/2 h-1 w-[115px] origin-left rounded-full bg-foreground/80" style={{transform:`translateX(0) rotate(${angle}deg)`,transformOrigin:'left center'}} />
          <div className="absolute bottom-[13px] left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-foreground" />
          <div className="absolute bottom-1 left-0 text-xs font-medium">10</div><div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-medium">25</div><div className="absolute bottom-1 right-0 text-xs font-medium">45+</div>
        </div>
        <div className="text-center"><div className="text-2xl font-bold">{metrics.category}</div><div className="mt-1 text-sm text-muted-foreground">Adult reference bands use BMI 18.5–24.9 as the usual healthy range.</div></div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-muted/50 p-4"><div className="text-xs text-muted-foreground">Healthy weight range</div><div className="mt-1 font-bold">{metrics.healthyMin.toFixed(1)}–{metrics.healthyMax.toFixed(1)} kg</div></div>
          <div className="rounded-2xl bg-muted/50 p-4"><div className="text-xs text-muted-foreground">BMI Prime</div><div className="mt-1 font-bold">{metrics.prime.toFixed(2)}</div></div>
          <div className="col-span-2 rounded-2xl bg-muted/50 p-4"><div className="text-xs text-muted-foreground">Ponderal Index</div><div className="mt-1 font-bold">{metrics.pi.toFixed(1)} kg/m³</div></div>
        </div>
        {!isAdult && <div className="mt-4 flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><Info className="h-5 w-5 shrink-0"/><p>For ages 2–19, BMI should be interpreted with age- and sex-specific BMI-for-age percentiles rather than adult cutoffs. This tool shows the mathematical BMI and points you to the appropriate child/teen reference.</p></div>}
      </div>
    </div>

    <div className="mt-8 rounded-3xl border p-5 md:p-7">
      <button type="button" className="flex w-full items-center justify-between text-left" onClick={()=>setShowDetails(x=>!x)}><span className="text-xl font-bold">BMI categories & detailed results</span><span className="text-sm text-muted-foreground">{showDetails?'Hide':'Show'}</span></button>
      {showDetails && <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[600px] text-sm"><thead><tr className="border-b text-left"><th className="p-3">Classification</th><th className="p-3">BMI range</th><th className="p-3">BMI Prime</th></tr></thead><tbody>{[['Severe thinness','Below 16','Below 0.64'],['Moderate thinness','16–16.9','0.64–0.68'],['Mild thinness','17–18.4','0.68–0.74'],['Normal range','18.5–24.9','0.74–1.00'],['Overweight','25–29.9','1.00–1.20'],['Obesity class I','30–34.9','1.20–1.40'],['Obesity class II','35–39.9','1.40–1.60'],['Obesity class III','40+','Above 1.60']].map(row=><tr key={row[0]} className="border-b last:border-0"><td className="p-3 font-medium">{row[0]}</td><td className="p-3">{row[1]} kg/m²</td><td className="p-3">{row[2]}</td></tr>)}</tbody></table></div>}
    </div>

    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border bg-sky-50/60 p-5"><h3 className="font-bold">BMI formula</h3><p className="mt-2 text-sm text-muted-foreground">BMI = weight in kilograms ÷ height in metres squared.</p></div>
      <div className="rounded-2xl border bg-emerald-50/60 p-5"><h3 className="font-bold">What BMI can tell you</h3><p className="mt-2 text-sm text-muted-foreground">It is a quick screening measure that can help flag whether further assessment may be useful.</p></div>
      <div className="rounded-2xl border bg-amber-50/60 p-5"><h3 className="font-bold">What BMI cannot tell you</h3><p className="mt-2 text-sm text-muted-foreground">It does not directly measure body fat and can be misleading for some muscular people, older adults, and other body types.</p></div>
    </div>

    <div className="mt-6 rounded-2xl border bg-muted/30 p-4 text-xs leading-5 text-muted-foreground">
      <strong>Health note:</strong> BMI is a screening measure, not a diagnosis. Consider other health information and speak with a qualified healthcare professional before making medical or major nutrition decisions. For children and teens, use age- and sex-specific growth references.
    </div>
  </Shell>;
}

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
