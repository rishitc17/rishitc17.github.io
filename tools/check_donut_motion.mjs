import assert from 'node:assert/strict';
import {Euler,Vector3} from '../assets/vendor/three.module.js';
import {donutPose,donutRotationOrder,createRenderLoop} from '../js/donut-motion.js';

for(let seconds=0;seconds<=120;seconds+=.25){
  const normal=new Vector3(0,1,0).applyEuler(new Euler(...donutPose(seconds),donutRotationOrder));
  assert(normal.z>.7,'Rotation presents the unglazed underside to the viewer');
}

let visible=true,nextId=0,draws=0;
const pending=new Map();
const loop=createRenderLoop(()=>{draws++;return true;},()=>visible,{
  request:callback=>{pending.set(++nextId,callback);return nextId;},
  cancel:id=>pending.delete(id)
});
function runFrame(){const [id,callback]=pending.entries().next().value;pending.delete(id);callback(id*16);}
loop.wake();loop.wake();assert.equal(pending.size,1,'Duplicate animation loops');
runFrame();assert.equal(draws,1);
visible=false;loop.stop();assert.equal(pending.size,0,'Hidden frame was not cancelled');
loop.wake();assert.equal(pending.size,0,'Animation starts while hidden');
visible=true;loop.wake();assert.equal(pending.size,1,'Tab resume requires pointer input');
runFrame();assert.equal(draws,2,'Animation did not resume');
loop.stop();assert.equal(pending.size,0,'Animation survives disposal');
console.log('PASS: glaze stays camera-facing; hidden/offscreen frames cancel and resume without pointer input.');
