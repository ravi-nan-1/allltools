import type { Metadata } from 'next';
import Link from 'next/link';

const guides: Record<string, { title: string; paragraphs: string[] }> = {
  "pdf-compression": { title: "How to Compress a PDF Without Losing More Quality Than Necessary", paragraphs: ["PDF compression is about reducing the amount of data stored in a document while keeping the pages usable. The best setting depends on whether the PDF contains scanned images, photographs, vector graphics, or mostly text.", "Start by deciding the target: email attachment size, website delivery, cloud storage, or a submission portal. A document intended for reading on a phone can usually tolerate more image compression than a PDF that will be printed.", "Before uploading a document, remove unnecessary pages and oversized images when possible. After compression, check several representative pages, especially photographs, small text, charts, and signatures. A smaller file is not automatically a better file if important details become unreadable.", "Use the All2ools PDF/file compression workflow when you need a quick browser-based result. Compare the original and compressed sizes, then keep the original when the document may need to be edited or reproduced at full quality.", "PDF compression can help page speed and storage, but it should be one part of an optimization workflow. For public documents, also check accessibility, selectable text, metadata, and whether fonts and links still work after processing."] },
  "image-compression": { title: "Image Compression Guide: JPG, PNG, WebP and Quality Settings", paragraphs: ["Image compression works best when the format matches the image. Photographs usually compress efficiently as JPEG or WebP, while screenshots, diagrams, logos, and images with transparency may be better suited to PNG or another lossless workflow.", "For websites, resize an image before aggressive compression. Sending a 4000-pixel photograph to a 600-pixel content slot wastes bandwidth even if the file has already been compressed.", "Quality is a trade-off rather than a single correct number. Reduce quality gradually and inspect edges, text, gradients, and faces. A file that is only slightly smaller may not justify visible artifacts, while a large reduction can be worthwhile for thumbnails or previews.", "All2ools image compression can be used as a quick browser workflow for preparing images for websites, email, documents, and sharing. Keep an original copy when you may need to re-edit the image later.", "After optimization, check the real destination. A web image should look correct at its displayed size, load efficiently, and retain useful dimensions. Compression should improve the overall experience rather than simply chase the smallest possible file."] },
  "calculator-guide": { title: "How to Choose the Right Online Calculator", paragraphs: ["Different calculators answer different questions even when their inputs look similar. An EMI calculator focuses on a scheduled loan payment, while a simple-interest calculator models interest without compounding. Choosing the right model is more important than entering numbers quickly.", "For borrowing, use a loan, mortgage, auto-loan, personal-loan, student-loan, or credit-card payoff calculator according to the repayment structure. Compare the payment and total interest rather than looking only at the monthly number.", "For investing and retirement planning, calculators such as SIP, FD, PPF, NPS, 401(k), retirement, and investment-return tools depend heavily on assumptions. Expected returns are estimates, not guarantees, and changing the contribution period can materially change the projection.", "For everyday calculations, percentage, discount, tip, profit-margin, break-even, age, date, BMI, calorie, currency, and time-zone tools solve narrower problems. Use the narrowest calculator that matches your question so the result is easier to interpret.", "All2ools calculators are intended as planning aids. For taxes, regulated benefits, health decisions, or contractual financial decisions, verify important results with official information because rules, rates, eligibility, and personal circumstances can change."] },
};

export function generateStaticParams() { return Object.keys(guides).map(slug => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const guide = guides[slug];
  if (!guide) return {};
  return { title: `${guide.title} | All2ools`, description: guide.paragraphs[0], alternates: { canonical: `https://all2ools.com/guides/${slug}` } };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const guide = guides[slug];
  if (!guide) return null;
  return <main className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
    <Link href="/guides" className="text-sm text-primary">← All guides</Link>
    <article className="mt-6">
      <h1 className="text-4xl font-bold leading-tight">{guide.title}</h1>
      <div className="mt-8 space-y-6 text-base leading-8 text-muted-foreground">
        {guide.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </article>
  </main>;
}