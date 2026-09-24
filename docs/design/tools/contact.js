// node contact.js <shotsdir> <out.jpg>
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const [dir,out]=process.argv.slice(2);const d=path.resolve(dir);
const order=['morning','delve','map','record','cut','complete','camp','satchel','daybook'];
const imgs=order.filter(s=>fs.existsSync(d+'/'+s+'.jpg')).map(s=>`<figure style="margin:3px;color:#aaa;font:12px sans-serif"><img src="${s}.jpg" style="width:230px;display:block"><figcaption>${s}</figcaption></figure>`).join('');
const html=d+'/_contact.html';fs.writeFileSync(html,`<body style="margin:0;background:#111;display:flex;flex-wrap:wrap;width:${5*236}px">${imgs}</body>`);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:5*236,height:1000}});await p.goto('file://'+html);await p.waitForTimeout(600);
await p.screenshot({path:out,type:'jpeg',quality:85,fullPage:true});await b.close();fs.unlinkSync(html);})();
