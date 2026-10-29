import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Box3,Matrix4,Vector3,Quaternion} from '../assets/vendor/three.module.js';
const file=fs.readFileSync('assets/models/donut.glb');
assert.equal(file.readUInt32LE(0),0x46546c67);
const gltf=JSON.parse(file.subarray(20,20+file.readUInt32LE(12)).toString());
const total=new Box3(),details=[];
function visit(index,parent=new Matrix4()){
 const node=gltf.nodes[index],local=node.matrix?new Matrix4().fromArray(node.matrix):new Matrix4().compose(new Vector3().fromArray(node.translation||[0,0,0]),new Quaternion().fromArray(node.rotation||[0,0,0,1]),new Vector3().fromArray(node.scale||[1,1,1]));
 const world=parent.clone().multiply(local);
 if(node.mesh!==undefined){const mesh=gltf.meshes[node.mesh],bounds=new Box3();let vertices=0;for(const primitive of mesh.primitives){const accessor=gltf.accessors[primitive.attributes.POSITION];vertices+=accessor.count;bounds.union(new Box3(new Vector3().fromArray(accessor.min),new Vector3().fromArray(accessor.max)).applyMatrix4(world));}total.union(bounds);details.push({name:node.name,vertices,size:bounds.getSize(new Vector3()).toArray(),min:bounds.min.toArray(),max:bounds.max.toArray()});}
 for(const child of node.children||[])visit(child,world);
}
for(const node of gltf.scenes[gltf.scene||0].nodes)visit(node);
assert(details.some(mesh=>mesh.name==='Web_Sprinkles'&&mesh.vertices>1000),'Sprinkle geometry missing');
assert(gltf.materials.filter(material=>material.name?.startsWith('Sprinkle_color')).length>=6,'Sprinkle palette missing');
console.log(JSON.stringify({bytes:file.length,meshes:details,bounds:total.getSize(new Vector3()).toArray()},null,2));
