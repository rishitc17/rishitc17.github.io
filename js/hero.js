import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export function donutMarkup({broken=false}={}){
  return `<figure class="donut-figure${broken?' donut-broken':''}"><div class="donut-stage" tabindex="0" role="img" aria-label="${broken?'A fractured ASCII donut':'Rishit’s rotating 3D donut. Keyboard focus holds the rotation'}"><img class="donut-poster" src="/assets/images/donut-poster.png" alt="" width="960" height="800"><span class="donut-loading" role="status">Loading model…</span></div></figure>`;
}

export async function mountDonut(figure,{broken=false}={}){
  const stage=figure.querySelector('.donut-stage'),loading=stage.querySelector('.donut-loading');
  const abort=new AbortController(),signal=abort.signal;
  let renderer,model,frame=0,disposed=false,visible=true,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,allAscii=broken;
  let angle=0,last=0,active=0,targetActive=0,dirty=true,pointerPresent=false,focused=false;
  const raycaster=new THREE.Raycaster(),pointerNDC=new THREE.Vector2(2,2);
  const pointer=new THREE.Vector2(-1000,-1000),targetPointer=pointer.clone();
  const resources=[];
  const dispose=()=>{disposed=true;cancelAnimationFrame(frame);abort.abort();observer?.disconnect();resizeObserver?.disconnect();themeObserver?.disconnect();renderer?.dispose();resources.forEach(x=>x.dispose());model?.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of [].concat(o.material)){Object.values(m).forEach(v=>{if(v?.isTexture)v.dispose();});m.dispose();}}});};
  let observer,resizeObserver,themeObserver;
  try{
    renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
    stage.append(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.01,100);
    camera.position.set(0,0,4.6);
    scene.add(new THREE.HemisphereLight(0xffffff,0x786955,2.5));
    const key=new THREE.DirectionalLight(0xfff3df,4.2);key.position.set(-3,5,6);scene.add(key);
    const fill=new THREE.DirectionalLight(0xf1f5ff,2.2);fill.position.set(4,1,3);scene.add(fill);
    const rim=new THREE.DirectionalLight(0xfd3456,4);rim.position.set(1,3,-4);scene.add(rim);
    const gltf=await new GLTFLoader().loadAsync('/assets/models/donut.glb');
    if(disposed){gltf.scene.traverse(o=>o.geometry?.dispose());return dispose;}
    model=gltf.scene;
    const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
    model.position.sub(center);const holder=new THREE.Group();holder.add(model);holder.scale.setScalar(2.85/Math.max(size.x,size.y,size.z));scene.add(holder);
    // Both representations sample this exact render target, including its silhouette.
    const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});target.samples=Math.min(4,renderer.capabilities.maxSamples);resources.push(target);
    const atlas=document.createElement('canvas');atlas.width=16*32;atlas.height=48;
    const ctx=atlas.getContext('2d');ctx.font='bold 34px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';
    const glyphs=' .,-~:;=!*#$@MW&';
    [...glyphs].forEach((c,i)=>ctx.fillText(c,i*32+16,24));
    const glyphTexture=new THREE.CanvasTexture(atlas);glyphTexture.minFilter=THREE.LinearFilter;glyphTexture.magFilter=THREE.LinearFilter;resources.push(glyphTexture);
    const uniforms={image:{value:target.texture},atlas:{value:glyphTexture},resolution:{value:new THREE.Vector2()},pointer:{value:pointer},pointerPower:{value:0},radius:{value:45},fullAscii:{value:allAscii?1:0},ink:{value:new THREE.Color()},ground:{value:new THREE.Color()},broken:{value:broken?1:0},time:{value:0}};
    const material=new THREE.ShaderMaterial({uniforms,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`
      uniform sampler2D image,atlas;uniform vec2 resolution,pointer;uniform float pointerPower,radius,fullAscii,broken,time;uniform vec3 ink,ground;varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 pixel=vUv*resolution;vec2 cellSize=vec2(6.,10.);vec2 cell=floor(pixel/cellSize);vec2 center=(cell+.5)*cellSize;
        vec2 sampleUV=center/resolution;
        float tear=0.;float missing=0.;
        if(broken>.5){float band=floor(vUv.y*19.);float noise=hash(vec2(band,floor(time*1.3)));tear=(noise-.5)*.22*step(.58,noise);sampleUV.x+=tear;sampleUV.y+=step(.91,noise)*.05;missing=step(.91,hash(vec2(band,8.)));}
        vec4 source=texture2D(image,vUv);vec4 sampleColor=texture2D(image,sampleUV);
        float brightness=dot(toneMapping(sampleColor.rgb),vec3(.2126,.7152,.0722));
        float index=clamp(floor(pow(max(brightness,0.),.38)*14.),1.,14.);
        vec2 local=fract(pixel/cellSize);float glyph=texture2D(atlas,vec2((index+local.x)/16.,local.y)).a;
        float distanceToMouse=length(center-pointer);
        float proximity=1.-smoothstep(radius*.22,radius,distanceToMouse);
        float conversion=0.;
        if(pointerPower>.001&&proximity>.001){float amount=proximity*pointerPower;conversion=smoothstep(hash(cell)*.7,hash(cell)*.7+.24,amount)*smoothstep(.02,.16,amount);}
        conversion=max(conversion,fullAscii);
        vec3 realistic=mix(ground,toneMapping(source.rgb),source.a);
        vec3 glyphInk=mix(ink,vec3(.98,.06,.13),step(.02,abs(tear)));
        vec3 ascii=mix(ground,glyphInk,glyph*step(.3,sampleColor.a)*(1.-missing));
        gl_FragColor=vec4(mix(realistic,ascii,conversion),1.);
        #include <colorspace_fragment>
      }`});resources.push(material);
    const postScene=new THREE.Scene();const geometry=new THREE.PlaneGeometry(2,2);resources.push(geometry);postScene.add(new THREE.Mesh(geometry,material));
    const postCamera=new THREE.Camera();
    function theme(){const style=getComputedStyle(stage);uniforms.ground.value.set(style.getPropertyValue('--ground').trim());uniforms.ink.value.set(style.getPropertyValue('--ink').trim());dirty=true;wake();}
    function resize(){const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);target.setSize(Math.ceil(width*renderer.getPixelRatio()),Math.ceil(height*renderer.getPixelRatio()));uniforms.resolution.value.set(width,height);uniforms.radius.value=Math.min(52,Math.max(32,width*.075));camera.aspect=width/height;camera.updateProjectionMatrix();dirty=true;wake();}
    function render(now){
      frame=0;if(disposed||!visible||document.hidden)return;
      const dt=last?Math.min((now-last)/1000,.04):0;last=now;
      if(!paused&&!focused)angle+=dt*.95;
      holder.rotation.set(.95+angle,angle*.24,.16+angle*.5);
      holder.updateMatrixWorld(true);
      pointer.copy(targetPointer);
      pointerNDC.set(pointer.x/uniforms.resolution.value.x*2-1,pointer.y/uniforms.resolution.value.y*2-1);
      raycaster.setFromCamera(pointerNDC,camera);
      const hit=(pointerPresent||focused)&&raycaster.intersectObject(holder,true).length>0;
      targetActive=hit?1:0;active=hit?Math.min(1,active+dt*9):0;
      uniforms.pointerPower.value=active;uniforms.fullAscii.value+=(Number(allAscii)-uniforms.fullAscii.value)*.14;uniforms.time.value=now/1000;
      if(!paused||dirty||Math.abs(active-targetActive)>.001||Math.abs(uniforms.fullAscii.value-Number(allAscii))>.001){
        if(!broken&&!hit){renderer.setRenderTarget(null);renderer.setClearColor(uniforms.ground.value,1);renderer.render(scene,camera);}
        else{renderer.setRenderTarget(target);renderer.setClearColor(0,0);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(postScene,postCamera);}
        dirty=false;
      }
      if((!paused&&!focused)||Math.abs(active-targetActive)>.001||Math.abs(uniforms.fullAscii.value-Number(allAscii))>.001)frame=requestAnimationFrame(render);
    }
    function wake(){if(!frame&&!disposed&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
    function move(e){const rect=stage.getBoundingClientRect();targetPointer.set(e.clientX-rect.left,rect.height-(e.clientY-rect.top));pointerPresent=true;focused=false;dirty=true;wake();}
    stage.addEventListener('pointermove',move,{signal});stage.addEventListener('pointerdown',move,{signal});
    stage.addEventListener('pointerleave',()=>{pointerPresent=false;active=0;dirty=true;wake();},{signal});
    stage.addEventListener('pointercancel',()=>{pointerPresent=false;active=0;dirty=true;wake();},{signal});
    stage.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse'){pointerPresent=false;active=0;dirty=true;wake();}},{signal});
    stage.addEventListener('focus',()=>{if(pointerPresent)return;focused=true;targetPointer.set(uniforms.resolution.value.x*.675,uniforms.resolution.value.y*.59);dirty=true;wake();},{signal});
    stage.addEventListener('blur',()=>{focused=false;pointerPresent=false;active=0;last=0;dirty=true;wake();},{signal});
    document.addEventListener('visibilitychange',()=>{last=0;pointerPresent=false;active=0;wake();},{signal});
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{paused=e.matches;dirty=true;wake();},{signal});
    observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;last=0;wake();});observer.observe(stage);
    resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);
    themeObserver=new MutationObserver(theme);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    stage.classList.add('is-ready');loading.textContent='';theme();resize();wake();
  }catch(error){
    renderer?.dispose();renderer?.domElement.remove();
    loading.textContent='Interactive view unavailable. Original render shown.';
    stage.classList.add('is-fallback');
    console.warn('Donut view:',error.message);
  }
  return dispose;
}
