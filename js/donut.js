import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export function donutMarkup({broken=false}={}){
  return `<figure class="donut-figure${broken?' donut-broken':''}"><div class="donut-stage" tabindex="0" role="img" aria-label="${broken?'A fractured interactive ASCII donut':'Rotating sprinkle donut. Keyboard focus holds the rotation.'}"><img class="donut-poster" src="/assets/images/donut-poster.png?v=3" alt="" width="960" height="800"><span class="donut-loading" role="status">Loading 3D model…</span></div></figure>`;
}

async function loadModel(onProgress,signal){
  const response=await fetch('/assets/models/donut.glb?v=3',{signal});
  if(!response.ok)throw Error('Model download failed');
  const reader=response.body.getReader(),chunks=[];let received=0,lastUpdate=0;
  while(true){
    const {done,value}=await reader.read();if(done)break;chunks.push(value);received+=value.byteLength;
    if(performance.now()-lastUpdate>250){onProgress?.(`Loading 3D model · ${(received/1048576).toFixed(1)} MB`);lastUpdate=performance.now();}
  }
  const buffer=new Uint8Array(received);let offset=0;
  for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.length;}
  onProgress?.('Preparing materials and geometry…');
  return new GLTFLoader().parseAsync(buffer.buffer,'/assets/models/');
}

export async function mountDonut(figure,{broken=false,onProgress}={}){
  const stage=figure.querySelector('.donut-stage'),loading=stage.querySelector('.donut-loading');
  const abort=new AbortController(),signal=abort.signal,resources=[];
  const motion=matchMedia('(prefers-reduced-motion:reduce)');
  let renderer,model,frame=0,disposed=false,visible=true,focused=false,pointerPresent=false;
  let angle=0,last=0,entryTime=0,active=0,dirty=true,observer,resizeObserver;
  const cursor=new THREE.Vector2(-1000,-1000),effectCursor=cursor.clone(),ndc=new THREE.Vector2(),raycaster=new THREE.Raycaster();
  const dispose=()=>{
    disposed=true;abort.abort();cancelAnimationFrame(frame);observer?.disconnect();resizeObserver?.disconnect();
    renderer?.dispose();resources.forEach(resource=>resource.dispose());
    model?.traverse(object=>{object.geometry?.dispose();for(const material of [].concat(object.material||[])){for(const value of Object.values(material))if(value?.isTexture)value.dispose();material.dispose();}});
  };
  try{
    renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;stage.append(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.01,100);camera.position.set(0,0,4.9);camera.updateMatrixWorld();
    scene.add(new THREE.HemisphereLight(0xfff7ee,0x535263,1.8));
    const key=new THREE.DirectionalLight(0xfff5e9,3.4);key.position.set(-3,5,6);scene.add(key);
    const fill=new THREE.DirectionalLight(0xffffff,1.5);fill.position.set(4,1,3);scene.add(fill);
    const rim=new THREE.DirectionalLight(0xffffff,2.8);rim.position.set(1,3,-4);scene.add(rim);
    const gltf=await loadModel(onProgress,AbortSignal.any([signal,AbortSignal.timeout(20000)]));model=gltf.scene;
    if(disposed){dispose();return dispose;}
    const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
    model.position.sub(center);const holder=new THREE.Group();holder.add(model);holder.scale.setScalar(3.35/Math.max(size.x,size.y,size.z));scene.add(holder);
    const surfaces=[];model.traverse(object=>{if(object.isMesh&&!object.name.includes('Sprinkle'))surfaces.push(object);});
    const materialTarget=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});materialTarget.samples=Math.min(4,renderer.capabilities.maxSamples);
    const normalTarget=new THREE.WebGLRenderTarget(1,1),normalMaterial=new THREE.MeshNormalMaterial();normalMaterial.toneMapped=false;
    normalTarget.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedShortType);
    resources.push(materialTarget,normalTarget,normalMaterial);
    const atlas=document.createElement('canvas');atlas.width=12*32;atlas.height=48;
    const ctx=atlas.getContext('2d');ctx.font='30px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';
    // The original donut.c illumination alphabet, rather than texture brightness.
    [...'.,-~:;=!*#$@'].forEach((char,index)=>ctx.fillText(char,index*32+16,24));
    const glyphTexture=new THREE.CanvasTexture(atlas);resources.push(glyphTexture);
    const ground=new THREE.Color(getComputedStyle(stage).getPropertyValue('--ground').trim());
    const uniforms={image:{value:materialTarget.texture},normals:{value:normalTarget.texture},depth:{value:normalTarget.depthTexture},projectionInverse:{value:camera.projectionMatrixInverse},surfacePointer:{value:new THREE.Vector3()},atlas:{value:glyphTexture},resolution:{value:new THREE.Vector2()},pointer:{value:effectCursor},power:{value:0},radius:{value:56},surfaceRadius:{value:.4},ground:{value:ground},broken:{value:broken?1:0},time:{value:0}};
    const material=new THREE.ShaderMaterial({uniforms,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`
      uniform sampler2D image,normals,depth,atlas;uniform mat4 projectionInverse;uniform vec2 resolution,pointer;uniform float power,radius,surfaceRadius,broken,time;uniform vec3 ground,surfacePointer;varying vec2 vUv;
      float hash(float p){return fract(sin(p*127.1)*43758.5453);}
      void main(){
        vec2 pixel=vUv*resolution;vec2 cellSize=vec2(6.,9.);vec2 cell=floor(pixel/cellSize);vec2 center=(cell+.5)*cellSize;
        float distanceToMouse=length(center-pointer);
        vec2 centerUV=center/resolution;
        float z=texture2D(depth,centerUV).r;
        vec4 projected=projectionInverse*vec4(centerUV*2.-1.,z*2.-1.,1.);
        vec3 surface=projected.xyz/projected.w;
        float surfaceDistance=length(surface-surfacePointer);
        float proximity=1.-smoothstep(surfaceRadius*.28,surfaceRadius,surfaceDistance);
        float morph=power*proximity;
        vec2 sampleUV=center/resolution;float tear=0.;float missing=0.;
        if(broken>.5){
          float band=floor(vUv.y*19.);float noise=hash(band+floor(time*1.2)*97.);
          tear=(noise-.5)*.28*step(.55,noise)+sin(time*3.+band)*power*proximity*.12;
          sampleUV.x+=tear;sampleUV.y+=step(.92,noise)*.055;missing=step(.91,hash(band+8.));morph=1.;
        }
        vec4 source=texture2D(image,vUv);vec4 normal=texture2D(normals,sampleUV);
        vec3 n=normalize(normal.rgb*2.-1.);
        float illumination=max(0.,dot(n,normalize(vec3(-.15,.65,1.))));
        float index=clamp(floor(illumination*11.),0.,10.);
        vec2 local=fract(pixel/cellSize);
        float glyph=texture2D(atlas,vec2((index+local.x)/12.,local.y)).a;
        float coverage=step(.4,normal.a)*(1.-missing);
        vec3 ink=mix(vec3(.92,.94,.96),vec3(.98,.05,.12),step(.018,abs(tear)));
        vec3 ascii=mix(ground,ink,glyph*coverage);
        vec3 realistic=mix(ground,toneMapping(source.rgb),source.a);
        gl_FragColor=vec4(mix(realistic,ascii,clamp(morph,0.,1.)),1.);
        #include <colorspace_fragment>
      }`});resources.push(material);
    const postScene=new THREE.Scene(),quad=new THREE.PlaneGeometry(2,2),postCamera=new THREE.Camera();resources.push(quad);postScene.add(new THREE.Mesh(quad,material));
    function resize(){
      const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;
      renderer.setSize(width,height,false);materialTarget.setSize(Math.ceil(width*renderer.getPixelRatio()),Math.ceil(height*renderer.getPixelRatio()));normalTarget.setSize(Math.ceil(width),Math.ceil(height));
      uniforms.resolution.value.set(width,height);uniforms.radius.value=Math.min(56,Math.max(42,width*.07));camera.aspect=width/height;camera.position.z=4.9/Math.min(camera.aspect,1);camera.updateProjectionMatrix();camera.updateMatrixWorld();dirty=true;wake();
    }
    function render(now){
      frame=0;if(disposed||!visible||document.hidden)return;
      const dt=last?Math.min((now-last)/1000,.04):.016;last=now;
      if(!document.body.hasAttribute('data-booting')&&!entryTime)entryTime=now;
      if(!motion.matches&&!focused&&entryTime&&now-entryTime>650)angle+=dt*.95;
      holder.rotation.set(.85+angle,angle*.23,.14+angle*.5);holder.updateMatrixWorld(true);
      let hit=false;
      if(pointerPresent||focused){
        ndc.set(cursor.x/uniforms.resolution.value.x*2-1,cursor.y/uniforms.resolution.value.y*2-1);raycaster.setFromCamera(ndc,camera);
        const intersection=raycaster.intersectObjects(surfaces,false)[0];hit=!!intersection;
        if(intersection){uniforms.surfacePointer.value.copy(intersection.point).applyMatrix4(camera.matrixWorldInverse);uniforms.surfaceRadius.value=uniforms.radius.value*2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*(-uniforms.surfacePointer.value.z)/uniforms.resolution.value.y;}
      }
      if(hit)effectCursor.copy(cursor);
      const previous=active,desired=hit?1:0;active+=(desired-active)*(1-Math.exp(-dt*12));if(active<.001)active=0;
      uniforms.power.value=active;uniforms.time.value=now/1000;
      if(!motion.matches||dirty||active!==previous){
        renderer.setClearColor(ground,1);
        if(!broken&&active===0){renderer.setRenderTarget(null);renderer.render(scene,camera);}
        else{
          renderer.setRenderTarget(materialTarget);renderer.setClearColor(0,0);renderer.render(scene,camera);
          scene.overrideMaterial=normalMaterial;renderer.setRenderTarget(normalTarget);renderer.render(scene,camera);scene.overrideMaterial=null;
          renderer.setRenderTarget(null);renderer.setClearColor(ground,1);renderer.render(postScene,postCamera);
        }
        dirty=false;
      }
      if((!motion.matches&&!focused)||Math.abs(active-desired)>.001)frame=requestAnimationFrame(render);
    }
    function wake(){if(!frame&&!disposed&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
    function move(event){const rect=stage.getBoundingClientRect();cursor.set(event.clientX-rect.left,rect.height-event.clientY+rect.top);pointerPresent=true;focused=false;dirty=true;wake();}
    function leave(){pointerPresent=false;dirty=true;wake();}
    stage.addEventListener('pointermove',move,{signal});stage.addEventListener('pointerdown',move,{signal});stage.addEventListener('pointerleave',leave,{signal});stage.addEventListener('pointercancel',leave,{signal});
    stage.addEventListener('pointerup',event=>{if(event.pointerType!=='mouse')leave();},{signal});
    stage.addEventListener('focus',()=>{if(pointerPresent)return;focused=true;cursor.set(uniforms.resolution.value.x*.62,uniforms.resolution.value.y*.56);dirty=true;wake();},{signal});
    stage.addEventListener('blur',()=>{focused=false;leave();last=0;},{signal});
    document.addEventListener('visibilitychange',()=>{last=0;leave();wake();},{signal});
    motion.addEventListener('change',()=>{dirty=true;wake();},{signal});
    observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;last=0;wake();});observer.observe(stage);
    resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);
    renderer.compile(scene,camera);scene.overrideMaterial=normalMaterial;renderer.compile(scene,camera);scene.overrideMaterial=null;renderer.compile(postScene,postCamera);
    resize();cancelAnimationFrame(frame);frame=0;render(performance.now());stage.classList.add('is-ready');loading.textContent='';
  }catch(error){
    renderer?.dispose();renderer?.domElement.remove();
    if(!disposed){loading.textContent='Original render shown. The interactive view could not load.';stage.classList.add('is-fallback');console.warn('Donut view:',error.message);}
  }
  return dispose;
}
