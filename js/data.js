import {config} from './config.js';
export const db=window.supabase.createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false},global:{fetch:(url,options={})=>fetch(url,{...options,signal:options.signal?AbortSignal.any([options.signal,AbortSignal.timeout(20000)]):AbortSignal.timeout(20000)})}});
const mediaCache=new Map();
export async function mediaUrl(path){
  if(!path)return '';
  const cached=mediaCache.get(path); if(cached&&cached.until>Date.now())return cached.url;
  const {data,error}=await db.storage.from(config.bucket).createSignedUrl(path,300);
  if(error)throw error;
  mediaCache.set(path,{url:data.signedUrl,until:Date.now()+240000});return data.signedUrl;
}
export async function entries(kind,{admin=false}={}){
  let query=db.from('entries').select('*');
  if(kind)query=query.eq('kind',kind);
  if(!admin)query=query.eq('published',true);
  const {data,error}=await query.order('position',{ascending:true}).order('created_at',{ascending:false});
  if(error)throw error;
  return data.sort((a,b)=>a.kind!==b.kind?a.kind.localeCompare(b.kind):['writing','recognition'].includes(a.kind)?String(b.date).localeCompare(String(a.date)):a.position-b.position);
}
export function escapeHTML(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function safeUrl(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
export function formatDate(value){return value?new Intl.DateTimeFormat('en',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T00:00:00Z')):'';}
export const labels={projects:'Projects',writing:'Writing','3d':'3D',recognition:'Recognition'};
export const statuses={shipped:'Shipped',building:'In the making',concept:'On the drawing board',ready:'Ready to launch'};
