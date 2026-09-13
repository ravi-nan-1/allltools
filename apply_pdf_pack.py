import re, json
from pathlib import Path

root=Path('/mnt/data/pdf_upgrade')
md=Path('/mnt/data/Pasted markdown(6).md').read_text()
ts_path=root/'src/lib/seo-tool-content.ts'
ts=ts_path.read_text()

slug_map={
'PDF to Word Converter':'pdf-to-word-converter','Word to PDF Converter':'word-to-pdf-converter','PDF to JPG':'pdf-to-jpg','JPG to PDF':'jpg-to-pdf','PDF to Excel':'pdf-to-excel','Excel to PDF':'excel-to-pdf','PDF to PowerPoint':'pdf-to-ppt','PowerPoint to PDF':'ppt-to-pdf','HTML to PDF':'html-to-pdf','Merge PDF':'merge-pdf','Split PDF':'split-pdf','Extract Pages':'extract-pdf-pages','Delete Pages':'delete-pdf-pages','Reorder PDF Pages':'reorder-pdf-pages','Rotate PDF Pages':'rotate-pdf-pages','Add Watermark':'add-watermark-to-pdf','Add Page Numbers':'add-page-numbers-to-pdf','Protect PDF (Password Lock)':'protect-pdf','Unlock PDF (Remove Password)':'unlock-pdf','Repair PDF':'repair-pdf','Convert to PDF/A':'pdf-to-pdfa','OCR PDF (Scan to Editable Text)':'ocr-pdf','Edit PDF':'edit-pdf','Compress PDF':'compress-pdf'}

# Parse the supplied content pack.
sections={}
chunks=re.split(r'(?m)^## \d+\. ', md)
for ch in chunks[1:]:
    lines=ch.strip().splitlines()
    title=lines[0].strip()
    body='\n'.join(lines[1:])
    def grab(label, next_labels):
        pat=r'(?ms)^\*\*'+re.escape(label)+r'\*\*\s*\n(.*?)(?=^\*\*(?:'+ '|'.join(map(re.escape,next_labels)) +r')\*\*\s*$|\Z)'
        m=re.search(pat, body)
        return m.group(1).strip() if m else ''
    how=grab('How it works',['Use cases','FAQ','Limitations'])
    use=grab('Use cases',['FAQ','Limitations'])
    faq=grab('FAQ',['Limitations'])
    lim=grab('Limitations',[])
    sections[title]=(how,use,faq,lim)

# Markdown bullet lists -> tool schema strings / FAQ objects.
def bullets(text):
    return [re.sub(r'^-\s*','',x).strip() for x in text.splitlines() if re.match(r'^-\s+',x.strip())]

def parse_faq(text):
    out=[]
    for line in bullets(text):
        m=re.match(r'^\*(.*?)\*\s*(.*)$',line)
        if m:
            q=m.group(1).strip(); a=m.group(2).strip()
            out.append({'question':q,'answer':a})
    return out

def js_obj(data):
    return json.dumps(data,ensure_ascii=False,indent=2)

for title,slug in slug_map.items():
    if title not in sections:
        raise SystemExit(f'Missing pack section: {title}')
    how,use,faq,lim=sections[title]
    # Convert supplied use-case bullets to the existing audience:value format.
    use_lines=bullets(use)
    use_value='\\n'.join(use_lines)
    faqs=parse_faq(faq)
    # Locate exact top-level entry by slug and replace its object using balanced braces.
    marker='  '+json.dumps(slug)+': {'
    start=ts.find(marker)
    if start<0:
        # TS keys are quoted exactly, but tolerate single quote if ever changed.
        marker="  '"+slug+"': {"; start=ts.find(marker)
    if start<0:
        print('SKIP missing slug',slug); continue
    brace=ts.find('{',start)
    depth=0; end=None; in_str=False; esc=False; quote=''
    for i in range(brace,len(ts)):
        c=ts[i]
        if in_str:
            if esc: esc=False
            elif c=='\\': esc=True
            elif c==quote: in_str=False
        else:
            if c in ('"',"'"): in_str=True; quote=c
            elif c=='{': depth+=1
            elif c=='}':
                depth-=1
                if depth==0:
                    end=i+1; break
    if end is None: raise SystemExit('Unbalanced object '+slug)
    old=ts[start:end]
    # Preserve existing fields except replace the four supplied content areas.
    # Extract old object through a lightweight JSON-ish conversion is risky; instead regex fields.
    def field_text(name):
        m=re.search(r'(?ms)    "'+re.escape(name)+r'":\s*"((?:\\.|[^"\\])*)"\s*,?',old)
        return m.group(1) if m else ''
    # Build a complete entry by taking old values for features/steps/why/compare/conclusion.
    # Since old is valid TS-ish JSON in this project, normalize only what JSON parser needs.
    try:
        old_json=json.loads(old[old.find('{'):])
    except Exception:
        # Strip trailing commas and parse again.
        cleaned=re.sub(r',\s*}', '}', old[old.find('{'):])
        old_json=json.loads(cleaned)
    old_json['how']=how
    old_json['use']=use_value
    old_json['faqs']=faqs
    old_json['limitations']=lim
    # Keep steps useful but make them reflect the supplied workflow without inventing technical behavior.
    old_json['steps']=[
        'Open the tool and add the source document or files required for this PDF task.',
        'Choose the available options for the pages, output, or document settings you need.',
        'Run the PDF operation and wait for processing to finish.',
        'Download the result and review the document before sharing or using it officially.'
    ]
    new='  '+json.dumps(slug)+': '+js_obj(old_json)
    ts=ts[:start]+new+ts[end:]

ts_path.write_text(ts)

# Extend the interface with limitations.
p=root/'src/lib/seo-tool-content.ts'
s=p.read_text()
if 'limitations: string;' not in s:
    s=s.replace('  conclusion: string;\n', '  conclusion: string;\n  limitations: string;\n')
# Ensure every non-PDF entry has limitations so typing remains valid.
# Existing object literals may not have it; make the field optional instead if required would break all entries.
s=s.replace('  limitations: string;\n', '  limitations?: string;\n')
p.write_text(s)

# Add a styled Limitations section to the content renderer when supplied.
p=root/'src/components/tool-page/seo-content.tsx'
s=p.read_text()
needle='          <section className="border-t p-6 md:p-10">'
insert='''          {content.limitations && (\n            <section className="border-t bg-amber-50/40 p-6 md:p-10">\n              <div className="mb-5 flex items-start gap-4">\n                <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-700"><ShieldCheck className="h-6 w-6" /></div>\n                <div><h2 className="text-2xl font-bold md:text-3xl">Limitations to Keep in Mind</h2><p className="mt-1 text-muted-foreground">A quick check before you rely on the output.</p></div>\n              </div>\n              <p className="max-w-4xl text-base leading-8 text-muted-foreground md:text-lg">{content.limitations}</p>\n            </section>\n          )}\n\n'''
if 'Limitations to Keep in Mind' not in s:
    s=s.replace(needle,insert+needle,1)
p.write_text(s)

print('Updated',len(slug_map),'PDF tool pages')
