import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { startServer, projectRoot } from './serve.mjs';

const args = process.argv.slice(2);
function option(name, fallback) {const i=args.indexOf(name); return i<0 ? fallback : args[i+1];}
const input = path.resolve(option('--input', path.join(projectRoot,'examples/brief.json')));
const output = path.resolve(option('--output', path.join(projectRoot,'artifacts')));
const brief = JSON.parse(await fs.readFile(input,'utf8'));
if (typeof brief.title !== 'string' || !brief.title.trim() || typeof brief.subtitle !== 'string' || !brief.subtitle.trim()) throw new Error('主标题和副标题不能为空');
if (!Array.isArray(brief.materials) || !brief.materials.length || brief.materials.length>20) throw new Error('需要 1–20 个物料规格');
if (typeof brief.visualAssetId !== 'string') throw new Error('需要 visualAssetId');
const ids = new Set();
for (const m of brief.materials) {
  if (!/^[a-zA-Z0-9_-]{1,60}$/.test(m.id || '') || ids.has(m.id)) throw new Error('物料 id 需要唯一，且只包含字母、数字、短横线或下划线');
  ids.add(m.id);
  if (![m.w,m.h].every(n=>typeof n==='number' && Number.isFinite(n) && n>=20 && n<=3000) || Math.max(m.w/m.h,m.h/m.w)>10) throw new Error('尺寸使用毫米，范围 20–3000，长宽比不能大于 10');
  if (!['S','M','L','XL'].includes(m.template)) throw new Error('模板需要为 S/M/L/XL');
  if (m.brandPillar && !['horizontal','vertical'].includes(m.brandPillar)) throw new Error('brandPillar 需要为 horizontal 或 vertical');
}
const candidates = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean);
let chrome;
for (const candidate of candidates) {try {await fs.access(candidate); chrome=candidate; break;}catch{}}
if (!chrome) throw new Error('未找到 Chrome/Chromium；请安装或通过 CHROME_PATH 指定浏览器路径');

const token = crypto.randomBytes(24).toString('hex');
let resolveResult;
const received = new Promise(resolve=>{resolveResult=resolve;});
let submitted = false;
const {server,origin} = await startServer({handle:async(req,res,url)=>{
  if (url.pathname !== '/__job/'+token) return false;
  if (req.method==='GET') {res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify(brief)); return true;}
  if (req.method !== 'POST' || submitted) {res.writeHead(405).end(); return true;}
  let size=0; const chunks=[];
  for await (const chunk of req) {size+=chunk.length; if(size>80*1024*1024){res.writeHead(413).end(); resolveResult({ok:false,error:'结果超过 80 MB'}); return true;} chunks.push(chunk);}
  try {const result=JSON.parse(Buffer.concat(chunks)); submitted=true; res.writeHead(200).end('ok'); resolveResult(result);}
  catch {res.writeHead(400).end('Invalid JSON'); resolveResult({ok:false,error:'出图结果格式错误'});}
  return true;
}});
const profile = await fs.mkdtemp(path.join(os.tmpdir(),'didi-rules-chrome-'));
const flags = ['--headless=new','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking','--disable-gpu','--hide-scrollbars',`--user-data-dir=${profile}`];
if (process.env.CI && process.platform==='linux') flags.push('--no-sandbox','--disable-dev-shm-usage');
const child = spawn(chrome,[...flags,`${origin}/render.html?token=${token}`],{stdio:['ignore','ignore','pipe']});
let browserLog=''; child.stderr.on('data',chunk=>{browserLog=(browserLog+chunk).slice(-2500);});
child.on('error',error=>resolveResult({ok:false,error:error.message}));
child.on('exit',code=>{if(!submitted)resolveResult({ok:false,error:`浏览器提前退出（${code}）：${browserLog}`});});
let timer;
try {
  const result = await Promise.race([received,new Promise(resolve=>{timer=setTimeout(()=>resolve({ok:false,error:'出图超时（120 秒）'}),120000);})]);
  await fs.mkdir(output,{recursive:true});
  const {images=[],...report}=result;
  await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  if (!report.ok) throw new Error(report.error || '版面检查未通过，已保存 report.json，未输出图片');
  const allowed = new Set(brief.materials.map(m=>m.id));
  if (images.length!==allowed.size || images.some(image=>!allowed.has(image.id))) throw new Error('图片结果与输入规格不一致');
  for (const image of images) await fs.writeFile(path.join(output,image.id+'.png'),Buffer.from(image.png,'base64'));
  console.log(`已使用规则 ${report.ruleVersion} 和实际品牌字体生成 ${images.length} 张 PNG：${output}`);
} finally {
  clearTimeout(timer); child.kill('SIGTERM'); server.close();
  await new Promise(resolve=>{if(child.exitCode!==null || child.signalCode!==null)resolve(); else {child.once('exit',resolve); setTimeout(()=>{child.kill('SIGKILL');resolve();},3000).unref();}});
  await fs.rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:200}).catch(()=>{});
}
