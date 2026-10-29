const collectionTweens=new Set();
export function mountMotion(root) {
  const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
  if(!gsap||!ScrollTrigger||matchMedia('(prefers-reduced-motion: reduce)').matches)return ()=>{};
  gsap.registerPlugin(ScrollTrigger);
  const context=gsap.context(()=>{
    const hero=root.querySelector('.space-hero');
    if(hero){
      const intro=gsap.timeline({delay:document.querySelector('#boot-screen')?.35:0,defaults:{ease:'power3.out'}});
      intro.fromTo('.space-copy h1 span',{y:30,opacity:0},{y:0,opacity:1,duration:.85,stagger:.08},0);
      intro.fromTo('.space-copy>p',{x:-18,opacity:0},{x:0,opacity:1,duration:.7},.15);
      intro.fromTo('.space-art',{scale:.86,y:55,opacity:0},{scale:1,y:0,opacity:1,duration:1.2},0);
      intro.fromTo('.space-action',{y:16,opacity:0},{y:0,opacity:1,duration:.65},.3);
      intro.fromTo(document.querySelector('.wordmark img'),{scale:.65,rotation:-15},{scale:1,rotation:0,duration:.8},.3);
      gsap.to('.space-copy',{y:-35,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.6}});
      gsap.to('.space-art',{y:55,rotation:4,scale:1.05,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.6}});
    }
    root.querySelectorAll('.featured-heading h2,.featured-heading p,.section-heading h2,.section-heading .text-link').forEach((element,index)=>{
      gsap.fromTo(element,{x:index%2?-16:16,opacity:0},{x:0,opacity:1,duration:.75,ease:'power3.out',scrollTrigger:{trigger:element,start:'top 94%',once:true}});
    });
  },root);
  return ()=>{
    collectionTweens.forEach(tween=>{tween.scrollTrigger?.kill();tween.kill();});collectionTweens.clear();
    ScrollTrigger.getAll().filter(trigger=>root.contains(trigger.trigger)).forEach(trigger=>{trigger.animation?.kill();trigger.kill();});
    context.revert();
  };
}

export function revealCollection(root) {
  const gsap=window.gsap;
  if(!gsap||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const elements=root.querySelectorAll('.project-card,.writing-row,.art-card,.recognition-row');
  elements.forEach(element=>{
    const tween=gsap.fromTo(element,{y:20,opacity:.8},{y:0,opacity:1,duration:.8,ease:'power3.out',scrollTrigger:{trigger:element,start:'top 94%',once:true}});
    collectionTweens.add(tween);
  });
}
