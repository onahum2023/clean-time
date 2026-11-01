// Private, offline inventory output. No network, analytics, logging, or remote PDF dependency.
(function(root){
 'use strict';
 const direction=(text,fallback)=>{
  const first=String(text).match(/\p{L}/u)?.[0];
  return first?(/[\p{Script=Hebrew}\p{Script=Arabic}]/u.test(first)?'rtl':'ltr'):fallback;
 };
 function printDocument(model){
  document.getElementById('inventoryPrint')?.remove();
  const host=document.createElement('article');host.id='inventoryPrint';host.lang=model.language;host.dir=model.direction;
  for(const block of model.blocks){
   const el=document.createElement(block.kind==='title'?'h1':block.kind==='statement'?'h2':'p');
   el.className='inventory-print-'+block.kind;el.dir=block.dir||model.direction;el.textContent=block.text;host.append(el);
  }
  document.body.append(host);
  const clean=()=>host.remove();window.addEventListener('afterprint',clean,{once:true});
  try{window.print();}catch(error){clean();throw error;}
 }
 // Rasterize with the browser's own bidi/font shaping, then package real A4 PDF
 // pages. This deliberately avoids reordering RTL text with a PDF font encoder.
 // The local PDF is readable/printable; its page text is raster, not selectable.
 async function pdfDocument(model){
  await document.fonts.ready;
  const width=794,height=1123,margin=52,scale=2,pages=[];
  let canvas,ctx,y;
  function page(){
   canvas=document.createElement('canvas');canvas.width=width*scale;canvas.height=height*scale;
   ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
   ctx.scale(scale,scale);ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);y=margin;pages.push(canvas);
  }
  page();
  const graphemes=text=>typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(model.language,{granularity:'grapheme'}).segment(text)].map(x=>x.segment):Array.from(text);
  function wrap(text){
   const lines=[];
   for(const paragraph of String(text).split('\n')){
    let line='';
    for(const word of paragraph.split(/\s+/u)){
     const next=line?line+' '+word:word;
     if(ctx.measureText(next).width<=width-2*margin){line=next;continue;}
     if(line){lines.push(line);line='';}
     if(ctx.measureText(word).width<=width-2*margin){line=word;continue;}
     for(const character of graphemes(word)){
      if(line&&ctx.measureText(line+character).width>width-2*margin){lines.push(line);line='';}
      line+=character;
     }
    }
    lines.push(line);
   }
   return lines;
  }
  for(let index=0;index<model.blocks.length;index++){
   const block=model.blocks[index];
   const title=block.kind==='title',bold=title||['statement','question','label'].includes(block.kind);
   const size=title?26:block.kind==='statement'?20:block.kind==='source'?14:18,lineHeight=Math.ceil(size*1.45);
   const font=`${bold?600:400} ${size}px Assistant, Arial, sans-serif`;
   ctx.font=font;
   const lines=wrap(block.text),dir=block.dir==='auto'?direction(block.text,model.direction):(block.dir||model.direction);
   let reserve=38;
   if(block.kind==='statement'){ctx.font='600 18px Assistant, Arial, sans-serif';reserve=wrap(model.blocks[index+1]?.text||'').length*27+48;ctx.font=font;}
   if(['statement','question','label'].includes(block.kind)&&y+lines.length*lineHeight+reserve>height-margin)page();
   for(const line of lines){
    if(y+lineHeight>height-margin)page();
    ctx.font=font;ctx.fillStyle='#17231f';ctx.direction=dir;ctx.textAlign=dir==='rtl'?'right':'left';ctx.textBaseline='top';
    ctx.fillText(line,dir==='rtl'?width-margin:margin,y);y+=lineHeight;
   }
   y+=block.kind==='answer'?16:10;
  }
  const images=[];
  for(let i=0;i<pages.length;i++){
   const c=pages[i],cctx=c.getContext('2d');cctx.font='14px Arial';cctx.direction='ltr';cctx.textAlign='center';cctx.fillStyle='#555';cctx.fillText(`${i+1} / ${pages.length}`,width/2,height-25);
   const blob=await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',0.94));if(!blob)throw Error('Image encoding failed');
   images.push(new Uint8Array(await blob.arrayBuffer()));c.width=0;c.height=0;
  }
  const enc=new TextEncoder(),parts=[],offsets=[0];let size=0;
  const append=value=>{const bytes=typeof value==='string'?enc.encode(value):value;parts.push(bytes);size+=bytes.length;};
  const object=(id,body)=>{offsets[id]=size;append(`${id} 0 obj\n`);append(body);append('\nendobj\n');};
  append('%PDF-1.4\n');
  object(1,'<< /Type /Catalog /Pages 2 0 R >>');
  object(2,`<< /Type /Pages /Count ${images.length} /Kids [${images.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] >>`);
  images.forEach((bytes,i)=>{
   const id=3+i*3,stream='q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n';
   object(id,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 ${id+1} 0 R >> >> /Contents ${id+2} 0 R >>`);
   offsets[id+1]=size;append(`${id+1} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width*scale} /Height ${height*scale} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`);append(bytes);append('\nendstream\nendobj\n');
   object(id+2,`<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}endstream`);
  });
  const start=size;append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  for(let i=1;i<offsets.length;i++)append(String(offsets[i]).padStart(10,'0')+' 00000 n \n');
  append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`);
  return new Blob(parts,{type:'application/pdf'});
 }
 async function download(model){
  const blob=await pdfDocument(model),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=`clean-time-inventory-${model.day}.pdf`;document.body.append(link);link.click();link.remove();
  // Give mobile browsers time to consume the download before releasing its URL.
  setTimeout(()=>URL.revokeObjectURL(url),60000);
 }
 root.CleanTimeInventoryOutput={print:printDocument,pdf:pdfDocument,download};
})(window);
