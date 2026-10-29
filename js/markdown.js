import {marked} from '/assets/vendor/marked.js';
import DOMPurify from '/assets/vendor/purify.js';
export function markdown(source){
  const clean=DOMPurify.sanitize(marked.parse(source||'',{gfm:true,breaks:false}),{FORBID_TAGS:['style','form','input','iframe','video','audio'],FORBID_ATTR:['style']});
  const node=document.createElement('div');node.innerHTML=clean;
  node.querySelectorAll('h1').forEach(heading=>{const replacement=document.createElement('h2');replacement.append(...heading.childNodes);heading.replaceWith(replacement);});
  node.querySelectorAll('a').forEach(a=>{if(/^https?:/.test(a.href)){a.target='_blank';a.rel='noopener noreferrer';}});
  node.querySelectorAll('img').forEach(img=>{img.loading='lazy';img.referrerPolicy='no-referrer';});
  return node.innerHTML;
}
