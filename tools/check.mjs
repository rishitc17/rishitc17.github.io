import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
for(const folder of ['js','tools'])for(const file of fs.readdirSync(folder).filter(f=>/\.(m?js)$/.test(f))){execFileSync(process.execPath,['--check',path.join(folder,file)],{stdio:'pipe'});}
for(const file of ['index.html','404.html','assets/models/donut.glb','assets/images/donut-poster.png','assets/PFP.png'])if(!fs.existsSync(file))throw Error(`Missing ${file}`);
for(const file of ['index.html',...fs.readdirSync('js').map(f=>'js/'+f)])if(fs.readFileSync(file,'utf8').includes('\u2014'))throw Error(`Em dash in ${file}`);
const sql=fs.readFileSync('supabase/schema.sql','utf8');if(!sql.includes('enable row level security')||!sql.includes('with check'))throw Error('Missing row policies');
for(const entry of JSON.parse(fs.readFileSync('VENDOR.json','utf8')).files){if(crypto.createHash('sha256').update(fs.readFileSync(entry.file)).digest('hex')!==entry.sha256)throw Error(`Vendor file changed: ${entry.file}`);}
execFileSync(process.execPath,['tools/check_donut.mjs'],{stdio:'pipe'});
execFileSync(process.execPath,['tools/check_donut_motion.mjs'],{stdio:'pipe'});
console.log('PASS: JavaScript syntax, required assets, sprinkle geometry/palette, donut rotation/resume, copy punctuation, and policy source.');
