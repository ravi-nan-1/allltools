'use client';

import { useMemo, useState } from 'react';
import { Activity, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = [
  { max: 18.5, label: 'Underweight' },
  { max: 25, label: 'Healthy range' },
  { max: 30, label: 'Overweight' },
  { max: Infinity, label: 'Obesity range' },
];

export default function BmiCalculator() {
  const [unit, setUnit] = useState<'metric' | 'us'>('metric');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');

  const result = useMemo(() => {
    const h = Number.parseFloat(height);
    const w = Number.parseFloat(weight);
    if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) return null;

    const heightM = unit === 'metric' ? h / 100 : h * 0.0254;
    const weightKg = unit === 'metric' ? w : w * 0.45359237;
    if (heightM <= 0 || weightKg <= 0) return null;

    const bmi = weightKg / (heightM * heightM);
    const category = categories.find((item) => bmi < item.max)?.label ?? 'Obesity range';
    return { bmi, category, heightM, weightKg };
  }, [height, weight, unit]);

  const reset = () => {
    setUnit('metric');
    setHeight('170');
    setWeight('70');
  };

  return (
    <Card className="w-full overflow-hidden border-2 shadow-sm">
      <CardHeader className="border-b bg-gradient-to-br from-primary/15 via-background to-primary/5 p-5 md:p-7">
        <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-primary" /> Health Calculator
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">BMI Calculator</CardTitle>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
          Calculate body mass index from height and weight using metric or US customary units.
        </p>
      </CardHeader>

      <CardContent className="p-4 md:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-2xl border bg-muted/20 p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Your measurements</h2>
                <p className="text-xs text-muted-foreground">Use positive values for both measurements.</p>
              </div>
              <button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-background hover:text-foreground">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>

            <div className="mb-5">
              <Label>Unit system</Label>
              <Select value={unit} onValueChange={(value: 'metric' | 'us') => setUnit(value)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric — cm / kg</SelectItem>
                  <SelectItem value="us">US customary — in / lb</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="bmi-height">Height ({unit === 'metric' ? 'cm' : 'in'})</Label>
                <Input id="bmi-height" className="mt-1" type="number" inputMode="decimal" min="0.1" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="bmi-weight">Weight ({unit === 'metric' ? 'kg' : 'lb'})</Label>
                <Input id="bmi-weight" className="mt-1" type="number" inputMode="decimal" min="0.1" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-primary/25 bg-primary/[0.05] p-5 md:p-6">
            <div className="text-sm font-medium text-muted-foreground">Your BMI</div>
            {result ? (
              <>
                <div className="mt-2 text-5xl font-bold tracking-tight">{result.bmi.toFixed(1)}</div>
                <div className="mt-3 inline-flex rounded-full border bg-background px-3 py-1 text-sm font-semibold">{result.category}</div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div className="rounded-xl border bg-background/70 p-3"><div className="text-xs text-muted-foreground">Height</div><div className="font-semibold">{result.heightM.toFixed(2)} m</div></div>
                  <div className="rounded-xl border bg-background/70 p-3"><div className="text-xs text-muted-foreground">Weight</div><div className="font-semibold">{result.weightKg.toFixed(1)} kg</div></div>
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-xl border bg-background p-4 text-sm text-muted-foreground">
                Enter a height and weight greater than zero to calculate BMI.
              </div>
            )}
          </section>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          BMI is a screening measure, not a diagnosis. It does not directly measure body fat and can be misleading for people with high muscle mass, different body frames, or other individual factors. These adult BMI categories are general reference ranges and should be interpreted in context.
        </p>
      </CardContent>
    </Card>
  );
}
