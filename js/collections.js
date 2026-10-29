import {escapeHTML as esc,safeUrl,formatDate,statuses} from './data.js';

export function tags(row){
  return row.tags?.length?`<ul class="tags" aria-label="Tags">${row.tags.map(tag=>`<li>${esc(tag)}</li>`).join('')}</ul>`:'';
}

function date(row){
  const value=row.date_label||(row.date?formatDate(row.date):'');
  if(!value)return '';
  const label=row.date?`<time datetime="${esc(row.date)}">${esc(value)}</time>`:`<span>${esc(value)}</span>`;
  return `<div class="entry-date"><i class="fa-solid fa-calendar" aria-hidden="true"></i>${label}</div>`;
}

export function cards(kind,rows,{home=false}={}){
  const layout=home?'home-cards card-grid':kind==='3d'?'art-masonry':kind==='recognition'?'certificate-gallery card-grid':'card-grid';
  const list=kind==='projects'?'project-list':kind==='writing'?'writing-list':kind==='3d'?'art-grid':'recognition-list';
  return `<div class="${list} ${layout}">${rows.map(row=>{
    const media=`<div class="card-media ${kind==='3d'?'art-image':kind==='projects'?'project-image':'certificate-image'}"><img data-media="${esc(row.image_path||'')}" alt="${esc(row.title)}" loading="lazy"></div>`;
    if(kind==='projects')return `<a class="entry-card project-card" href="/projects/${esc(row.slug)}">${media}<div class="card-copy project-copy"><h3>${esc(row.title)}</h3><div class="card-meta">${date(row)}<span class="status-label">${esc(statuses[row.status]||row.status)}</span></div><p>${esc(row.description)}</p>${tags(row)}<span class="card-action">Read the project <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span></div></a>`;
    if(kind==='writing')return `<a class="entry-card writing-row" href="${esc(safeUrl(row.link))}" target="_blank" rel="noopener noreferrer"><div class="card-copy">${date(row)}<h3>${esc(row.title)}</h3><p>${esc(row.description)}</p>${tags(row)}<span class="card-action">Read the piece <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i><span class="sr-only"> (opens in a new tab)</span></span></div></a>`;
    if(kind==='3d')return `<article class="entry-card art-card">${media}<div class="card-copy art-caption"><h3>${esc(row.title)}</h3><div class="card-meta">${date(row)}<span class="work-type">${row.original?'Original work':'Tutorial study'}</span></div>${row.description?`<p>${esc(row.description)}</p>`:''}${tags(row)}<span class="card-action" aria-hidden="true">View render <i class="fa-solid fa-expand"></i></span></div><button class="card-open" data-lightbox="${esc(row.id)}" aria-label="View ${esc(row.title)}"></button></article>`;
    return `<article class="entry-card recognition-row">${media}<div class="card-copy">${date(row)}<h3>${esc(row.title)}</h3><p>${esc(row.description)}</p>${tags(row)}<span class="card-action" aria-hidden="true">View certificate <i class="fa-solid fa-expand"></i></span></div><button class="card-open" data-lightbox="${esc(row.id)}" aria-label="View certificate: ${esc(row.title)}"></button></article>`;
  }).join('')}</div>`;
}
