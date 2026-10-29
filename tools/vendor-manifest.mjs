import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const versions={three:'0.180.0',supabase:'2.57.4',marked:'16.3.0',dompurify:'3.2.7',fontawesome:'6.7.2',gsap:'3.13.0'};
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else files.push({file:file.replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')});}}
for(const dir of ['assets/vendor','assets/fonts','assets/webfonts'])walk(dir);
fs.writeFileSync('VENDOR.json',JSON.stringify({versions,source:'Versioned jsDelivr npm distributions; Google Fonts Archivo, Manrope and Chakra Petch distributions',files},null,2)+'\n');
console.log(`Recorded ${files.length} vendored file hashes.`);
