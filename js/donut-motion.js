// Keep the glazed +Y face toward the camera while the donut turns about its own axis.
export const donutRotationOrder='ZXY';
export function donutPose(seconds){
  return [1.02+Math.sin(seconds*.68)*.17,seconds*.72,.12+Math.sin(seconds*.43)*.14];
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
