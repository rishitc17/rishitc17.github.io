import {entries,db,mediaUrl,escapeHTML as esc,safeUrl,labels,statuses} from './data.js';
import {donutMarkup,mountDonut} from './donut.js?v=6';
import {mountMotion,revealCollection} from './motion.js?v=4';
import {cards,tags} from './collections.js?v=4';
import {markdown} from './markdown.js';
import {config} from './config.js';
const main=document.querySelector('main'),nav=document.querySelector('nav'),menu=document.querySelector('.menu-toggle'),lightbox=document.querySelector('#lightbox');
let version=0,disposeDonut=()=>{},cleanupMotion=()=>{},cleanupPage=()=>{},lastRoute=location.pathname+location.search+location.hash;
const descriptions={projects:'Software, experiments, and ideas made real.',writing:'Thinking out loud, one piece at a time.','3d':'Experiments in shape, light, and material.',recognition:'Milestones along the way.'};
function empty(kind,filtered=false){return `<div class="empty-state" role="status"><p>${filtered?'No entries match. Try a different search or clear the filters.':`No ${kind==='3d'?'renders':labels[kind].toLowerCase()} published yet.`}</p></div>`;}
function errorMarkup(){return '<div class="collection-state error" role="alert"><p>The collection could not be loaded. Please check your connection and try again.</p><button class="text-link" data-retry>Reload collection</button></div>';}
function loading(kind){const label=kind?labels[kind].toLowerCase():'collection';return `<div class="collection-skeleton"><p class="collection-state loading-state" role="status"><span class="loading-orbit" aria-hidden="true"></span>Loading ${esc(label)}…</p></div>`;}
function image(row,extra=''){return `<img data-media="${esc(row.image_path||'')}" alt="${esc(row.title)}" loading="lazy" ${extra}>`;}
async function hydrate(root,rows){
  root.querySelectorAll('[data-media]').forEach(async img=>{
    const frame=img.closest('.card-media');
    const status=document.createElement('span');status.className='media-loading';status.setAttribute('role','status');status.textContent='Loading image…';frame?.append(status);
    const fail=()=>{status.remove();if(img.isConnected)img.outerHTML='<div class="image-failed">Image unavailable. Reload the collection to try again.</div>';};
    img.addEventListener('load',()=>{status.remove();frame?.classList.add('media-ready');},{once:true});img.addEventListener('error',fail,{once:true});
    try{const url=await mediaUrl(img.dataset.media);if(!url)throw Error('No image');img.src=url;}catch{fail();}
  });
  root.querySelectorAll('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>openLightbox(rows.find(x=>x.id===button.dataset.lightbox))));
}
let lightboxVersion=0;
async function openLightbox(row){
  const token=++lightboxVersion;
  lightbox.querySelector('h2').textContent=row.title;lightbox.querySelector('p').textContent=row.description;
  if(row.date_label)lightbox.querySelector('p').textContent+=`${row.description?' · ':''}${row.date_label}`;
  const media=lightbox.querySelector('.lightbox-media');media.innerHTML='<p class="collection-state" role="status">Loading image…</p>';lightbox.showModal();
  try{const url=await mediaUrl(row.image_path);if(token!==lightboxVersion||!lightbox.open)return;const img=new Image();img.alt=row.title;img.src=url;img.onload=()=>{if(token===lightboxVersion)media.replaceChildren(img);};img.onerror=()=>{media.innerHTML='<p class="collection-state" role="alert">This image could not be loaded. Close and try again.</p>';};}catch{media.innerHTML='<p class="collection-state" role="alert">This image could not be loaded. Close and try again.</p>';}
}
lightbox.querySelector('.lightbox-close').addEventListener('click',()=>lightbox.close());
lightbox.addEventListener('click',e=>{if(e.target===lightbox){const r=lightbox.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)lightbox.close();}});
lightbox.addEventListener('close',()=>{lightboxVersion++;lightbox.querySelector('.lightbox-media').replaceChildren();});
async function home(token){
  main.innerHTML=`
    <section class="space-hero" id="top">
      <div class="space-copy"><h1><span>Rishit</span><span>Choudhary</span></h1><p>I build software, explore mathematics, write, and make things in Blender.</p><a class="space-action" href="#selected-work">View work <i class="fa-solid fa-arrow-down" aria-hidden="true"></i></a></div>
      <div class="space-art">${donutMarkup()}</div>
    </section>
    <section class="featured-space" id="selected-work"><div class="featured-heading"><h2>In the collection</h2><p>Things I’ve built, written, and made in three dimensions.</p></div><div data-featured aria-live="polite">${loading()}</div></section>`;
  const figure=main.querySelector('.donut-figure');
  const modelReady=mountDonut(figure,{onProgress:message=>window.portfolioBoot?.status(message)}).then(dispose=>{if(token===version)disposeDonut=dispose;else dispose();window.portfolioBoot?.ready('scene');});
  async function load(){
    const root=main.querySelector('[data-featured]');
    try{
      const all=await entries();if(token!==version)return;
      root.innerHTML=Object.keys(labels).map(kind=>{
        const rows=all.filter(r=>r.kind===kind),featured=rows.filter(r=>r.featured),selected=(featured.length?featured:rows).slice(0,kind==='writing'?3:2);
        if(!selected.length)return '';
        return `<section class="collection-section section-${kind}" id="home-${kind}"><div class="section-heading"><h2>${labels[kind]}</h2><a class="text-link" href="/${kind}">All ${labels[kind].toLowerCase()}</a></div>${cards(kind,selected,{home:true})}</section>`;
      }).join('')||'<p class="collection-state">There are no published pieces yet.</p>';
      hydrate(root,all);
    }catch{if(token!==version)return;root.innerHTML=errorMarkup();root.querySelector('[data-retry]').onclick=load;}
    finally{window.portfolioBoot?.ready('collection');}
  }
  await Promise.all([load(),modelReady,document.fonts.ready]);
  if(token===version){cleanupMotion=mountMotion(main);revealCollection(main);window.ScrollTrigger?.refresh();}
}
async function collection(kind,token){
  document.title=`${labels[kind]} · Rishit Choudhary`;
  main.innerHTML=`<header class="page-heading"><h1>${labels[kind]}<span style="color:var(--accent)">.</span></h1><p>${descriptions[kind]}</p></header><section class="collection-page" aria-label="${labels[kind]} collection"><div class="collection-tools" hidden><label class="search-label"><span class="sr-only">Search ${labels[kind]}</span><input type="search" placeholder="Search ${labels[kind].toLowerCase()}" aria-label="Search ${labels[kind]}"></label><select aria-label="Filter by tag"><option value="">All tags</option></select><span class="filter-count" role="status"></span></div><div id="collection-results" aria-live="polite">${loading(kind)}</div></section>`;
  const root=main.querySelector('#collection-results');
  async function load(){root.innerHTML=loading(kind);try{const rows=await entries(kind);if(token!==version)return;const tools=main.querySelector('.collection-tools'),search=tools.querySelector('input'),select=tools.querySelector('select');tools.hidden=!rows.length;
      const allTags=[...new Set(rows.flatMap(x=>x.tags||[]))].sort();select.innerHTML='<option value="">All tags</option>'+allTags.map(t=>`<option>${esc(t)}</option>`).join('');select.hidden=!allTags.length;
      function draw(){const query=search.value.toLowerCase().trim(),filtered=rows.filter(r=>(!query||[r.title,r.description,...r.tags].join(' ').toLowerCase().includes(query))&&(!select.value||r.tags.includes(select.value)));root.innerHTML=filtered.length?cards(kind,filtered):empty(kind,!!rows.length);tools.querySelector('.filter-count').textContent=rows.length?`${filtered.length} ${filtered.length===1?'entry':'entries'}`:'';hydrate(root,filtered);}
      search.oninput=draw;select.onchange=draw;draw();
    }catch{if(token===version){root.innerHTML=errorMarkup();root.querySelector('[data-retry]').onclick=load;}}}
  await load();
}
async function project(slug,token,preview=false){
  main.innerHTML='<div class="initial-loading" role="status">Loading project…</div>';
  async function load(){
    if(preview){const {data,error}=await db.auth.getUser();if(error||data.user?.id!==config.owner){main.innerHTML='<div class="page-heading"><h1>Private preview.</h1><p>Sign in to your studio to view this draft.</p><a class="button" href="/admin">Sign in to studio</a></div>';return;}}
    let query=db.from('entries').select('*').eq('kind','projects').eq(preview?'id':'slug',slug);if(!preview)query=query.eq('published',true);
    const {data:row,error}=await query.maybeSingle();if(token!==version)return;
    if(error){main.innerHTML=`<div class="collection-page">${errorMarkup()}</div>`;main.querySelector('[data-retry]').onclick=load;return;}
    if(!row){await notFound(token);return;}
    document.title=`${row.title} · Rishit Choudhary`;
    main.innerHTML=`<div class="article-back"><a class="text-link" href="${preview?'/admin':'/projects'}"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> ${preview?'Back to studio':'All projects'}</a>${preview?'<p class="notice">Private preview. Only your account can view this draft.</p>':''}</div><article><header class="article-banner">${row.image_path?image(row,'fetchpriority="high"'):''}<div class="article-banner-content"><h1>${esc(row.title)}</h1><p>${esc(row.description)}</p>${tags(row)}</div></header><div class="article-body"><div class="article-meta">${row.date_label?`<span class="entry-date"><i class="fa-solid fa-calendar" aria-hidden="true"></i>${esc(row.date_label)}</span>`:''}<span class="status-label">${esc(statuses[row.status])}</span></div><div class="article-links">${safeUrl(row.link)?`<a class="button" href="${esc(safeUrl(row.link))}" target="_blank" rel="noopener noreferrer">Open live project <span class="sr-only">(new tab)</span></a>`:''}${safeUrl(row.github_url)?`<a class="button secondary" href="${esc(safeUrl(row.github_url))}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i> View source <span class="sr-only">(new tab)</span></a>`:''}</div><div class="markdown">${row.markdown?markdown(row.markdown):'<p>The project write-up is still taking shape.</p>'}</div></div></article>`;
    hydrate(main,[row]);
  }await load();
}
async function notFound(token){document.title='Signal lost · Rishit Choudhary';main.innerHTML=`<section class="not-found"><div><h1>404</h1><h2>Signal lost.</h2><p>This path doesn’t resolve. Neither does this donut, apparently.</p><a class="button" href="/">Back home</a></div>${donutMarkup({broken:true})}</section>`;const dispose=await mountDonut(main.querySelector('figure'),{broken:true,onProgress:message=>window.portfolioBoot?.status(message)});if(token===version)disposeDonut=dispose;else dispose();}
export async function navigate({focus=false}={}){
  const token=++version;disposeDonut();disposeDonut=()=>{};cleanupMotion();cleanupMotion=()=>{};cleanupPage();cleanupPage=()=>{};if(lightbox.open)lightbox.close();closeMenu();
  let route=location.pathname.replace(/\/$/,'')||'/';
  nav.querySelectorAll('a').forEach(a=>{if(route.startsWith(a.getAttribute('href')))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  document.querySelector('.site-header').classList.remove('is-hidden');document.title='Rishit Choudhary · Software, writing & 3D';
  try {
    if(route==='/')await home(token);
    else if(labels[route.slice(1)])await collection(route.slice(1),token);
    else if(/^\/projects\/[^/]+$/.test(route))await project(decodeURIComponent(route.split('/')[2]),token);
    else if(/^\/admin\/preview\/[a-f0-9-]+$/.test(route))await project(route.split('/')[3],token,true);
    else if(route==='/admin') {
      document.title='Studio · Rishit Choudhary';
      const {mountAdmin}=await import('./admin.js?v=4');
      if(token===version)cleanupPage=await mountAdmin(main);
    } else await notFound(token);
  } catch(error) {
    if(token!==version)return;
    main.innerHTML=`<div class="collection-page">${errorMarkup()}</div>`;
    main.querySelector('[data-retry]').onclick=()=>navigate();
    console.error(error);
  }
  if(token===version){main.setAttribute('aria-busy','false');window.portfolioBoot?.finish();if(focus)main.focus({preventScroll:true});if(location.hash)requestAnimationFrame(()=>{try{document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();}catch{}});}
}
function closeMenu(){nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menu.focus();}});
document.addEventListener('click',async e=>{const a=e.target.closest('a');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('download'))return;const url=new URL(a.href,location.href);if(url.origin!==location.origin)return;if(url.pathname===location.pathname&&url.hash){closeMenu();return;}e.preventDefault();if(cleanupPage.canLeave&&!await cleanupPage.canLeave())return;lastRoute=url.pathname+url.search+url.hash;history.pushState({},'',lastRoute);window.scrollTo(0,0);navigate({focus:true});});
window.addEventListener('popstate',async()=>{const nextRoute=location.pathname+location.search+location.hash;if(nextRoute.split('#')[0]===lastRoute.split('#')[0]){lastRoute=nextRoute;return;}if(cleanupPage.canLeave&&!await cleanupPage.canLeave()){history.pushState({},'',lastRoute);return;}lastRoute=nextRoute;navigate({focus:true});});
document.querySelector('#back-top').addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});document.querySelector('.wordmark').focus({preventScroll:true});});
let previousScroll=0;window.addEventListener('scroll',()=>{const current=window.scrollY,header=document.querySelector('.site-header');if(!nav.classList.contains('is-open')&&!header.contains(document.activeElement))header.classList.toggle('is-hidden',current>previousScroll&&current>180);previousScroll=current;},{passive:true});
document.querySelector('.site-header').addEventListener('focusin',()=>document.querySelector('.site-header').classList.remove('is-hidden'));
navigate();
