// Favor the glazed face, with one relaxed turnover per cycle to reveal the pastry underneath.
export const donutRotationOrder='ZXY';
export function donutPose(seconds){
  const progress=Math.max(0,Math.min(1,((seconds%24)-8)/8));
  const turnover=progress*progress*progress*(progress*(progress*6-15)+10)*Math.PI*2;
  return [1.02+Math.sin(seconds*.68)*.17+turnover,seconds*.72,.12+Math.sin(seconds*.43)*.14];
}

export function createRenderLoop(draw,canRun,{request=requestAnimationFrame,cancel=cancelAnimationFrame}={}){
  let pending=0;
  function tick(now){
    pending=0;
    if(canRun()&&draw(now))wake();
  }
  function wake(){if(!pending&&canRun())pending=request(tick);}
  // Hidden tabs may retain a scheduled callback without running it. Clear its id
  // as well as cancelling it so returning to the page can schedule a fresh frame.
  function stop(){if(pending)cancel(pending);pending=0;}
  return {wake,stop};
}
