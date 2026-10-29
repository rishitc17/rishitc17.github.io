const collectionTweens=new Set();
export function mountMotion(root) {
  const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
  if(!gsap||!ScrollTrigger||matchMedia('(prefers-reduced-motion: reduce)').matches)return ()=>{};
  gsap.registerPlugin(ScrollTrigger);
  const context=gsap.context(()=>{
    const hero=root.querySelector('.hero');
    if(hero){
      const intro=gsap.timeline({defaults:{ease:'power3.out'}});
      intro.fromTo('.hero-title span',{y:28,opacity:0},{y:0,opacity:1,duration:.85,stagger:.08},0);
      intro.fromTo('.hero-note p',{x:-16,opacity:0},{x:0,opacity:1,duration:.7,stagger:.08},.12);
      intro.fromTo('.hero-art',{scale:.94,opacity:0},{scale:1,opacity:1,duration:1.05},0);
      intro.fromTo('.hero-action',{y:16,opacity:0},{y:0,opacity:1,duration:.65},.25);
      gsap.to('.hero-title',{scale:.965,y:-18,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.5}});
      gsap.to('.hero-art',{y:24,rotation:-3,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.5}});
    }
    root.querySelectorAll('.studio-index h2,.studio-index p,.section-heading h2,.section-heading .text-link').forEach((element,index)=>{
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
    const tween=gsap.fromTo(element,{y:20,opacity:0},{y:0,opacity:1,duration:.8,ease:'power3.out',scrollTrigger:{trigger:element,start:'top 94%',once:true}});
    collectionTweens.add(tween);
  });
}
