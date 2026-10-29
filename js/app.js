import {entries,db,mediaUrl,escapeHTML as esc,safeUrl,formatDate,labels,statuses} from './data.js';
import {donutMarkup,mountDonut} from './hero.js?v=2';
import {mountMotion,revealCollection} from './motion.js?v=2';
import {markdown} from './markdown.js';
import {config} from './config.js';
const main=document.querySelector('main'),nav=document.querySelector('nav'),menu=document.querySelector('.menu-toggle'),lightbox=document.querySelector('#lightbox');
let version=0,disposeDonut=()=>{},cleanupMotion=()=>{},cleanupPage=()=>{},lastRoute=location.pathname+location.search+location.hash;
const descriptions={projects:'Software, experiments, and ideas made real.',writing:'Thinking out loud, one piece at a time.','3d':'Experiments in shape, light, and material.',recognition:'Milestones along the way.'};
function tags(row){return row.tags?.length?`<ul class="tags">${row.tags.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:'';}
function empty(kind,filtered=false){return `<div class="empty-state" role="status"><p>${filtered?'No entries match. Try a different search or clear the filters.':`No ${kind==='3d'?'renders':labels[kind].toLowerCase()} published yet.`}</p></div>`;}
function errorMarkup(){return '<div class="collection-state error" role="alert"><p>The collection could not be loaded. Please check your connection and try again.</p><button class="text-link" data-retry>Reload collection</button></div>';}
function loading(kind){return `<p class="collection-state" role="status">Loading ${esc(labels[kind].toLowerCase())}…</p>`;}
function image(row,extra=''){return `<img data-media="${esc(row.image_path||'')}" alt="${esc(row.title)}" loading="lazy" ${extra}>`;}
function cards(kind,rows){
  if(!rows.length)return empty(kind);
  if(kind==='projects')return `<div class="project-list">${rows.map(r=>`<a class="project-card" href="/projects/${esc(r.slug)}"><div class="project-image">${image(r)}</div><div class="project-copy"><span class="entry-date">${esc(r.date_label)}</span><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p>${tags(r)}<span class="status-label">${esc(statuses[r.status])}</span><span class="text-link" style="display:flex">Read the project <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span></div></a>`).join('')}</div>`;
  if(kind==='writing')return `<div class="writing-list">${rows.map(r=>`<a class="writing-row" href="${esc(safeUrl(r.link))}" target="_blank" rel="noopener noreferrer"><time datetime="${esc(r.date)}">${formatDate(r.date)}</time><div><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p>${tags(r)}</div><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i><span class="sr-only"> (opens in a new tab)</span></a>`).join('')}</div>`;
  if(kind==='3d')return `<div class="art-grid">${rows.map(r=>`<button class="art-card" data-lightbox="${r.id}" aria-label="View ${esc(r.title)}"><div class="art-image">${image(r)}</div><div class="art-caption"><h3>${esc(r.title)}</h3><span>${r.original?'Original work':'Tutorial study'}</span></div></button>`).join('')}</div>`;
  return `<div class="recognition-list">${rows.map(r=>`<button class="recognition-row" data-lightbox="${r.id}"><time datetime="${esc(r.date)}">${formatDate(r.date)}</time><div><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p>${tags(r)}</div><i class="fa-solid fa-expand" aria-hidden="true"></i><span class="sr-only">View certificate</span></button>`).join('')}</div>`;
}
async function hydrate(root,rows){
  root.querySelectorAll('[data-media]').forEach(async img=>{try{const url=await mediaUrl(img.dataset.media);if(!url)throw Error('No image');img.src=url;img.addEventListener('error',()=>{img.outerHTML='<div class="image-failed">Image unavailable</div>';},{once:true});}catch{if(img.isConnected)img.outerHTML='<div class="image-failed">Image unavailable</div>';}});
  root.querySelectorAll('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>openLightbox(rows.find(x=>x.id===button.dataset.lightbox))));
}
let lightboxVersion=0;
async function openLightbox(row){
  const token=++lightboxVersion;
  lightbox.querySelector('h2').textContent=row.title;lightbox.querySelector('p').textContent=row.description;
  const media=lightbox.querySelector('.lightbox-media');media.innerHTML='<p class="collection-state" role="status">Loading image…</p>';lightbox.showModal();
  try{const url=await mediaUrl(row.image_path);if(token!==lightboxVersion||!lightbox.open)return;const img=new Image();img.alt=row.title;img.src=url;img.onload=()=>{if(token===lightboxVersion)media.replaceChildren(img);};img.onerror=()=>{media.innerHTML='<p class="collection-state" role="alert">This image could not be loaded. Close and try again.</p>';};}catch{media.innerHTML='<p class="collection-state" role="alert">This image could not be loaded. Close and try again.</p>';}
}
lightbox.querySelector('.lightbox-close').addEventListener('click',()=>lightbox.close());
lightbox.addEventListener('click',e=>{if(e.target===lightbox){const r=lightbox.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)lightbox.close();}});
lightbox.addEventListener('close',()=>{lightboxVersion++;lightbox.querySelector('.lightbox-media').replaceChildren();});
async function home(token){
  main.innerHTML=`
    <section class="hero" id="top">
      <div class="hero-stage">
        <div class="hero-note"><p>I build software, <br>write, and make <br>3D things.</p></div>
        <div class="hero-art">${donutMarkup()}</div>
      </div>
      <h1 class="hero-title"><span>Rishit</span> <span>Choudhary</span></h1>
      <div class="hero-bottom"><p>Software, writing & 3D.</p><a class="hero-action" href="#selected-work"><span>View work</span><span class="action-disc"><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></span></a></div>
    </section>
    <section class="studio-index" id="selected-work"><h2>Things<br>I’ve made.</h2><p>Software, writing, and scenes from Blender. Some finished, some still taking shape.</p></section>
    ${Object.keys(labels).map(kind=>`<section class="collection-section section-${kind}" id="home-${kind}"><div class="section-heading"><div><h2><a href="/${kind}">${labels[kind]}</a></h2><p>${descriptions[kind]}</p></div><a class="text-link" href="/${kind}">All ${labels[kind].toLowerCase()}</a></div><div data-section="${kind}" aria-live="polite">${loading(kind)}</div></section>`).join('')}`;
  cleanupMotion=mountMotion(main);
  const figure=main.querySelector('.donut-figure');mountDonut(figure).then(dispose=>{if(token===version)disposeDonut=dispose;else dispose();});
  async function load(){try{const all=await entries();if(token!==version)return;Object.keys(labels).forEach(kind=>{const rows=all.filter(r=>r.kind===kind);const featured=rows.filter(r=>r.featured);const selected=(featured.length?featured:rows).slice(0,kind==='writing'?3:2);const root=main.querySelector(`[data-section="${kind}"]`);root.closest('section').classList.toggle('is-empty',!selected.length);root.innerHTML=cards(kind,selected);hydrate(root,selected);revealCollection(root);});window.ScrollTrigger?.refresh();}catch{if(token!==version)return;main.querySelectorAll('[data-section]').forEach(root=>{root.innerHTML=errorMarkup();root.querySelector('[data-retry]').onclick=load;});}}
  await load();
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
    main.innerHTML=`<div class="article-back"><a class="text-link" href="${preview?'/admin':'/projects'}"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> ${preview?'Back to studio':'All projects'}</a>${preview?'<p class="notice">Private preview. Only your account can view this draft.</p>':''}</div><article><header class="article-banner">${row.image_path?image(row,'fetchpriority="high"'):''}<div class="article-banner-content"><h1>${esc(row.title)}</h1><p>${esc(row.description)}</p>${tags(row)}</div></header><div class="article-body"><p class="entry-date">${esc(row.date_label)}${row.date_label?' · ':''}${esc(statuses[row.status])}</p><div class="article-links">${safeUrl(row.link)?`<a class="button" href="${esc(safeUrl(row.link))}" target="_blank" rel="noopener noreferrer">Open live project <span class="sr-only">(new tab)</span></a>`:''}${safeUrl(row.github_url)?`<a class="button secondary" href="${esc(safeUrl(row.github_url))}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i> View source <span class="sr-only">(new tab)</span></a>`:''}</div><div class="markdown">${row.markdown?markdown(row.markdown):'<p>The project write-up is still taking shape.</p>'}</div></div></article>`;
    hydrate(main,[row]);
  }await load();
}
async function notFound(token){document.title='Signal lost · Rishit Choudhary';main.innerHTML=`<section class="not-found"><div><h1>404</h1><h2>Signal lost.</h2><p>This path doesn’t resolve. Neither does this donut, apparently.</p><a class="button" href="/">Back home</a></div>${donutMarkup({broken:true})}</section>`;mountDonut(main.querySelector('figure'),{broken:true}).then(dispose=>{if(token===version)disposeDonut=dispose;else dispose();});}
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
      const {mountAdmin}=await import('./admin.js?v=2');
      if(token===version)cleanupPage=await mountAdmin(main);
    } else await notFound(token);
  } catch(error) {
    if(token!==version)return;
    main.innerHTML=`<div class="collection-page">${errorMarkup()}</div>`;
    main.querySelector('[data-retry]').onclick=()=>navigate();
    console.error(error);
  }
  if(token===version){if(focus)main.focus({preventScroll:true});if(location.hash)requestAnimationFrame(()=>{try{document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();}catch{}});}
}
function closeMenu(){nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menu.focus();}});
document.addEventListener('click',async e=>{const a=e.target.closest('a');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('download'))return;const url=new URL(a.href,location.href);if(url.origin!==location.origin)return;if(url.pathname===location.pathname&&url.hash){closeMenu();return;}e.preventDefault();if(cleanupPage.canLeave&&!await cleanupPage.canLeave())return;lastRoute=url.pathname+url.search+url.hash;history.pushState({},'',lastRoute);window.scrollTo(0,0);navigate({focus:true});});
window.addEventListener('popstate',async()=>{if(cleanupPage.canLeave&&!await cleanupPage.canLeave()){history.pushState({},'',lastRoute);return;}lastRoute=location.pathname+location.search+location.hash;navigate({focus:true});});
document.querySelector('#back-top').addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});document.querySelector('.wordmark').focus({preventScroll:true});});
let previousScroll=0;window.addEventListener('scroll',()=>{const current=window.scrollY,header=document.querySelector('.site-header');if(!nav.classList.contains('is-open')&&!header.contains(document.activeElement))header.classList.toggle('is-hidden',current>previousScroll&&current>180);previousScroll=current;},{passive:true});
document.querySelector('.site-header').addEventListener('focusin',()=>document.querySelector('.site-header').classList.remove('is-hidden'));
navigate();
