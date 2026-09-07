import { HeartPulse, ShieldCheck, Users, AlertTriangle } from 'lucide-react';

const adultRows = [
  ['Severe thinness', '< 16'],
  ['Moderate thinness', '16–16.9'],
  ['Mild thinness', '17–18.4'],
  ['Healthy / normal range', '18.5–24.9'],
  ['Overweight', '25–29.9'],
  ['Obesity class I', '30–34.9'],
  ['Obesity class II', '35–39.9'],
  ['Obesity class III', '40+'],
];

export function BmiGuide() {
  return <article className="mx-auto w-full max-w-5xl space-y-12 px-4 pb-8 md:pb-14 text-base leading-7">
    <section className="rounded-3xl border bg-gradient-to-br from-primary/5 via-background to-emerald-50/60 p-6 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">BMI Calculator: What Your Number Means</h2>
      <p className="mt-4 text-muted-foreground md:text-lg">Body Mass Index (BMI) is a height-and-weight screening measure. Our calculator turns your measurements into a BMI score, places the score on a visual reference meter, and gives you useful companion numbers such as an estimated healthy-weight range, BMI Prime, and Ponderal Index.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-background/80 p-4"><HeartPulse className="h-6 w-6 text-rose-500"/><h3 className="mt-2 font-bold">Quick screening</h3><p className="mt-1 text-sm text-muted-foreground">A fast way to understand where your BMI sits within common adult reference bands.</p></div>
        <div className="rounded-2xl bg-background/80 p-4"><Users className="h-6 w-6 text-sky-600"/><h3 className="mt-2 font-bold">Adults & younger users</h3><p className="mt-1 text-sm text-muted-foreground">Adult BMI uses fixed reference bands; children and teens need age- and sex-specific interpretation.</p></div>
        <div className="rounded-2xl bg-background/80 p-4"><ShieldCheck className="h-6 w-6 text-emerald-600"/><h3 className="mt-2 font-bold">Privacy-friendly</h3><p className="mt-1 text-sm text-muted-foreground">Your calculation can be performed directly in the browser without creating an account.</p></div>
      </div>
    </section>

    <section>
      <h2 className="text-3xl font-bold">How BMI Is Calculated</h2>
      <p className="mt-4">The basic adult formula is simple: divide body weight in kilograms by height in metres squared. For US customary measurements, the equivalent calculation uses pounds and inches with the standard 703 conversion factor. The result is expressed in kilograms per square metre (kg/m²).</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-muted/30 p-5"><div className="text-sm font-semibold text-muted-foreground">Metric</div><div className="mt-2 font-mono text-lg">BMI = kg ÷ m²</div></div>
        <div className="rounded-2xl border bg-muted/30 p-5"><div className="text-sm font-semibold text-muted-foreground">US customary</div><div className="mt-2 font-mono text-lg">BMI = 703 × lb ÷ in²</div></div>
      </div>
    </section>

    <section>
      <h2 className="text-3xl font-bold">Adult BMI Categories</h2>
      <p className="mt-4">For adults, commonly used international reference bands place 18.5–24.9 in the normal range, 25–29.9 in the overweight range, and 30 or above in the obesity range. More detailed bands can help show where a result sits within those broad groups.</p>
      <div className="mt-5 overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[560px] text-left"><thead><tr className="border-b bg-muted/40"><th className="p-4">Classification</th><th className="p-4">BMI (kg/m²)</th></tr></thead><tbody>{adultRows.map(([name,range])=><tr key={name} className="border-b last:border-0"><td className="p-4 font-medium">{name}</td><td className="p-4">{range}</td></tr>)}</tbody></table>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Reference bands are screening categories. They should not be treated as a diagnosis or as a complete measure of body composition.</p>
    </section>

    <section>
      <h2 className="text-3xl font-bold">BMI for Children and Teens</h2>
      <p className="mt-4">A child's BMI is calculated from the same height-and-weight relationship, but the result should not be interpreted with adult cutoffs. Because children are growing, BMI is compared with other children of the same age and sex using BMI-for-age percentiles.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Underweight','Below the 5th percentile'],
          ['Healthy weight','5th to below the 85th percentile'],
          ['Overweight','85th to below the 95th percentile'],
          ['Obesity','95th percentile or higher'],
        ].map(([title,text])=><div key={title} className="rounded-2xl border p-4"><div className="font-bold">{title}</div><div className="mt-1 text-sm text-muted-foreground">{text}</div></div>)}
      </div>
      <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-950"><strong>Important:</strong> This page does not invent a child percentile from an adult cutoff. For ages 2–19, use an age- and sex-specific BMI-for-age calculator or growth chart such as the CDC reference.</div>
    </section>

    <section>
      <h2 className="text-3xl font-bold">What BMI Can and Cannot Tell You</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5"><h3 className="font-bold text-emerald-900">Useful for</h3><ul className="mt-3 list-disc space-y-2 pl-5"><li>Quick weight-for-height screening</li><li>Comparing a result with population reference bands</li><li>Starting a conversation about weight and health</li><li>Tracking a simple measurement over time</li></ul></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5"><h3 className="font-bold text-amber-900">Not a complete health assessment</h3><ul className="mt-3 list-disc space-y-2 pl-5"><li>Does not directly measure body fat</li><li>Can classify muscular people as overweight</li><li>Does not capture where body fat is distributed</li><li>Does not replace medical history, examination, or other health measures</li></ul></div>
      </div>
    </section>

    <section>
      <h2 className="text-3xl font-bold">BMI Prime and Ponderal Index</h2>
      <p className="mt-4">The calculator also shows two optional companion measures. BMI Prime compares a person's BMI with an upper reference value of 25, making it a unit-free ratio. The Ponderal Index uses height cubed rather than height squared and can be useful as an additional height-to-weight measure, particularly when comparing very tall or very short body types.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border p-5"><div className="font-bold">BMI Prime</div><div className="mt-2 font-mono">BMI ÷ 25</div><p className="mt-2 text-sm text-muted-foreground">A value around 1 means the BMI is near the upper end of the common adult normal range.</p></div><div className="rounded-2xl border p-5"><div className="font-bold">Ponderal Index</div><div className="mt-2 font-mono">kg ÷ m³</div><p className="mt-2 text-sm text-muted-foreground">A height-weight index that uses the cube of height instead of the square used by BMI.</p></div></div>
    </section>

    <section>
      <h2 className="text-3xl font-bold">Why Being Underweight or Overweight Can Matter</h2>
      <p className="mt-4">BMI is used because unusually low or high weight can be associated with health risks. Higher BMI levels are associated with conditions such as high blood pressure, type 2 diabetes, cardiovascular disease, sleep-related breathing problems, osteoarthritis and some cancers. Very low weight can be associated with inadequate nutrition, vitamin or mineral deficiencies, reduced bone strength and reduced immune function.</p>
      <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-600"/><p>Association does not mean that BMI alone proves a person has any of these conditions. If a result concerns you, use it as a reason to discuss your overall health with a qualified professional.</p></div>
    </section>

    <section>
      <h2 className="text-3xl font-bold">How to Get a More Useful BMI Result</h2>
      <ol className="mt-4 list-decimal space-y-3 pl-6"><li>Measure height without shoes and use a consistent unit.</li><li>Use a reliable scale and record weight under similar conditions when tracking changes.</li><li>Enter your age accurately, especially for children and teens.</li><li>For adults, compare the result with the reference bands and healthy-weight estimate shown above.</li><li>Consider BMI together with other information rather than using it as a stand-alone diagnosis.</li></ol>
    </section>

    <section className="rounded-3xl border bg-muted/30 p-6 md:p-8"><h2 className="text-2xl font-bold">Frequently Asked Questions</h2><div className="mt-5 space-y-5"><div><h3 className="font-bold">What is a healthy BMI?</h3><p className="mt-1 text-muted-foreground">For adults, 18.5–24.9 is a commonly used normal reference range. Individual circumstances can make BMI less informative.</p></div><div><h3 className="font-bold">Does BMI differ for men and women?</h3><p className="mt-1 text-muted-foreground">The standard adult BMI calculation itself does not change by sex. Body composition can differ, however, so BMI should be interpreted in context.</p></div><div><h3 className="font-bold">Can athletes have a high BMI?</h3><p className="mt-1 text-muted-foreground">Yes. BMI cannot distinguish muscle from fat, so a highly muscular person may have a higher BMI without having excess body fat.</p></div><div><h3 className="font-bold">What BMI should a child have?</h3><p className="mt-1 text-muted-foreground">There is no single adult-style target. Children and teens are assessed with BMI-for-age percentiles that depend on age and sex.</p></div><div><h3 className="font-bold">Is BMI a diagnosis?</h3><p className="mt-1 text-muted-foreground">No. It is a screening measure. A healthcare professional may consider additional measurements, medical history, physical findings and other factors.</p></div></div></section>

    <section className="text-sm text-muted-foreground"><p><strong>Reference note:</strong> The adult categories and child/teen interpretation described here are based on widely used WHO and CDC guidance. The calculator is for informational screening and education, not medical diagnosis or treatment.</p></section>
  </article>;
}
