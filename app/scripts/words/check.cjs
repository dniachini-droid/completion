/* Check a file returned by the writer against the current lines (WRITING_PROCESS.md, step 4).
   Usage (from app/): node scripts/words/check.cjs <returned.md> <current.json> [out.json]
   Reports missing or extra keys, unchanged lines, word counts, and any line whose numbers, CAPITALS, [brackets],
   carved-mark words, italics or quotes changed, and identical lines that no longer match. Prints keys only, never text. */
const fs=require('fs');const path=require('path');const a=require(path.resolve(process.argv[3]||'lines.json'));
const raw=fs.readFileSync(process.argv[2],'utf8').replace(/\r/g,'').split('\n');
const got={};let k=null,buf=[],ctx=false;const flush=()=>{if(k)got[k]=buf.join('\n').trim()};
for(const l of raw){if(/^# STORY TEXT/.test(l)){flush();k=null;continue}const m=l.match(/^#{1,4}\s+(\S+)\s*$/);if(m&&/^(beat|seal|record|find|camp|passage|teaser|learned|sofar|question)\./.test(m[1])){flush();k=m[1];buf=[];ctx=true;continue}
 if(!k)continue; if(ctx){if(/^_.*_\s*$/.test(l.trim())){ctx=false;continue} if(!l.trim())continue; ctx=false} buf.push(l)}
flush();
const orig=Object.fromEntries(a.map(x=>[x.key,x.text]));
const missing=a.filter(x=>!(x.key in got)).map(x=>x.key),extra=Object.keys(got).filter(k=>!(k in orig));
const nums=s=>(s.match(/\d+(\.\d+)?/g)||[]).sort().join(','),caps=s=>(s.match(/\b[A-Z]{2,}\b/g)||[]).sort().join(','),br=s=>(s.match(/\[[^\]]*\]/g)||[]).join('|');
const norm=s=>s.replace(/[’‘]/g,"'").replace(/[“”]/g,'"');
const marks=["hook closed on a dot","a hook, open","hook and the drop","hook-and-drop","bar with a tick","bar-with-a-drop","bar with a drop","two drops parted","hook with a tail","hook closed on a drop","bar-and-tick"];
const flags=[];let o=0,n=0,same=0;
for(const x of a){const t=got[x.key];if(t==null)continue;o+=x.text.split(/\s+/).length;n+=t.split(/\s+/).length;if(t===x.text){same++;continue}
 const w=[];
 if(br(t)!==br(x.text))w.push('brackets');
 if(!nums(t).split(',').filter(Boolean).every(()=>true)||nums(x.text).split(',').filter(Boolean).some(v=>!nums(t).split(',').includes(v)))w.push('nums-missing');
 if(caps(x.text).split(',').filter(Boolean).some(v=>!caps(t).split(',').includes(v)))w.push('caps-missing');
 for(const m of marks)if(norm(x.text).includes(m)&&!norm(t).includes(m))w.push('mark:'+m);
 for(const sp of (x.text.match(/\*[^*]+\*/g)||[]))if(!norm(t).includes(norm(sp.slice(1,-1))))w.push('italic');
 for(const q of (x.text.match(/:\s[^.]*?…[^.]*|“[^”]+”/g)||[]))if(!norm(t).includes(norm(q.trim().replace(/^:\s*/,''))))w.push('quote');
 if(w.length)flags.push(x.key+' '+[...new Set(w)].join(' '));}
// identical-originals stay identical
const byText={};for(const x of a)(byText[x.text]=byText[x.text]||[]).push(x.key);
const dupDiff=Object.values(byText).filter(ks=>ks.length>1&&new Set(ks.map(k=>got[k])).size>1);
console.log('items',Object.keys(got).length,'missing',missing.length,JSON.stringify(missing.slice(0,8)),'extra',extra.length,'unchanged',same);
console.log('words',o,'->',n);console.log('flags',flags.length);console.log(flags.join('\n'));console.log('dup groups diverged',JSON.stringify(dupDiff));
fs.writeFileSync(path.resolve(process.argv[4]||'returned.json'),JSON.stringify(got));
