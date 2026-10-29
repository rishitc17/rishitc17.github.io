/* A small projected torus keeps the entry sequence useful before WebGL arrives.
   Projection and normal lighting follow Andy Sloane's explanation of donut.c:
   https://www.a1k0n.net/2011/07/20/donut-math.html */
(()=>{
  const screen=document.querySelector('#boot-screen');
  if(!screen)return;
  const main=document.querySelector('main'),header=document.querySelector('.site-header');
  if(main)main.inert=true;if(header)header.inert=true;
  const output=screen.querySelector('pre'),status=screen.querySelector('[data-boot-status]');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let frame=0,last=0,complete=false;
  function draw(now){
    if(complete)return;
    if(now-last>65||!last){
      last=now;const width=60,height=24,pixels=Array(width*height).fill(' '),depth=new Float32Array(width*height);
      const a=reduced?.7:now*.00055,b=reduced?.3:now*.00024,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
      for(let u=0;u<Math.PI*2;u+=.045)for(let v=0;v<Math.PI*2;v+=.09){
        const cu=Math.cos(u),su=Math.sin(u),cv=Math.cos(v),sv=Math.sin(v),ring=1.6+.65*cv;
        const x=ring*cu,y=ring*su,z=.65*sv,yr=y*ca-z*sa,zr=y*sa+z*ca;
        const xx=x*cb-yr*sb,yy=x*sb+yr*cb,inv=1/(zr+5.4);
        const nx=cv*cu,ny=cv*su*ca-sv*sa,nz=cv*su*sa+sv*ca;
        const light=Math.max(0,-(nx*sb+ny*cb)*.45-nz*.8);
        const col=Math.round(width/2+xx*inv*48),row=Math.round(height/2+yy*inv*23),index=col+row*width;
        if(col>=0&&col<width&&row>=0&&row<height&&inv>depth[index]){depth[index]=inv;pixels[index]='.,-~:;=!*#$@'[Math.min(10,Math.floor(light*11))];}
      }
      output.textContent=Array.from({length:height},(_,row)=>pixels.slice(row*width,(row+1)*width).join('')).join('\n');
    }
    if(!reduced)frame=requestAnimationFrame(draw);
  }
  draw(1);
  const timeout=setTimeout(()=>{
    status.textContent='This is taking longer than expected. You can reload to try again.';
    screen.querySelector('button').hidden=false;
  },24000);
  screen.querySelector('button').onclick=()=>location.reload();
  window.portfolioBoot={
    status(message){if(!complete)status.textContent=message;},
    ready(task){screen.querySelector(`[data-task="${task}"]`)?.classList.add('is-ready');},
    finish(){if(complete)return;complete=true;clearTimeout(timeout);cancelAnimationFrame(frame);screen.classList.add('is-complete');document.body.removeAttribute('data-booting');if(main)main.inert=false;if(header)header.inert=false;setTimeout(()=>screen.remove(),reduced?0:550);}
  };
  document.fonts.ready.then(()=>window.portfolioBoot.ready('fonts'));
})();
