import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve('public');
const registry=JSON.parse(fs.readFileSync(path.join(root,'asset-registry.json'),'utf8'));
const config=JSON.parse(fs.readFileSync(path.join(root,'configs/ginkgo-split.json'),'utf8'));
const bindings=JSON.parse(fs.readFileSync(path.join(root,'component-bindings.json'),'utf8'));
const ids=new Set();
for(const a of registry.assets){
  if(ids.has(a.asset_id))throw new Error('Duplicate asset ID');ids.add(a.asset_id);
  const file=path.resolve(root,a.file);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file))throw new Error('Invalid asset path: '+a.file);
  const digest=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if(digest!==a.sha256)throw new Error('Asset content differs from registered version: '+a.asset_id);
}
for(const c of bindings.components){const r=c.asset_ref||c.font_ref;if(r&&!registry.assets.some(a=>a.asset_id===r.asset_id&&a.version===r.version))throw new Error('Unresolved component binding: '+c.component_id);}
if(config.id!=='didi-split-identification'||config.scope?.kind!=='identification-layouts'||config.scope?.sloganRole!=='identification')throw new Error('Only identification layouts may be built; primary/secondary slogan layouts are deferred.');
const entry=fs.readFileSync(path.join(root,'index.html'),'utf8');
if(!entry.includes('didi-split-layout.js')||entry.includes('src="didi-layout.js"'))throw new Error('Deferred full-bleed renderer cannot be an active entry point.');
if(config.status!=='draft')throw new Error('This prototype requires an explicitly draft rule set.');
fs.writeFileSync(path.join(root,'asset-registry.js'),'window.DIDI_ASSET_REGISTRY = '+JSON.stringify(registry)+';\n');
fs.writeFileSync(path.join(root,'configs/ginkgo-split.js'),'window.DIDI_LAYOUT_CONFIG = '+JSON.stringify(config)+';\n');
console.log(`Validated ${registry.assets.length} asset files, component bindings and generated runtime configuration.`);
