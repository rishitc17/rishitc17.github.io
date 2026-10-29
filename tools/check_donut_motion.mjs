import assert from 'node:assert/strict';
import {Euler,Vector3,Quaternion} from '../assets/vendor/three.module.js';
import {donutPose,donutRotationOrder,createRenderLoop} from '../js/donut-motion.js';

let glazed=0,underside=0,samples=0;
for(let seconds=0;seconds<120;seconds+=.1){
  const normal=new Vector3(0,1,0).applyEuler(new Euler(...donutPose(seconds),donutRotationOrder));
  if(normal.z>.5)glazed++;
  if(normal.z<-.5)underside++;
  samples++;
}
assert(glazed/samples>.75,'Rotation spends too little time presenting the glaze');
assert(underside/samples>.04&&underside/samples<.18,'The base should be visible briefly, rather than hidden or dominant');
for(const boundary of [8,16,24,32,40,48]){
  const before=new Quaternion().setFromEuler(new Euler(...donutPose(boundary-.001),donutRotationOrder));
  const after=new Quaternion().setFromEuler(new Euler(...donutPose(boundary+.001),donutRotationOrder));
  assert(before.angleTo(after)<.01,'Turnover jumps at a transition or cycle boundary');
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
console.log('PASS: glaze dominates with occasional smooth base reveals; hidden/offscreen frames resume without pointer input.');
