import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export function donutMarkup({broken=false}={}){
  return `<figure class="donut-figure"><div class="donut-stage" role="img" aria-label="Rishit’s chocolate-iced donut, rotating between a realistic render and ASCII characters"><img class="donut-poster" src="/assets/images/donut-poster.png" alt="" width="960" height="800"><div class="donut-loading" role="status">Loading a little experiment…</div></div><figcaption class="donut-caption"><span>${broken?'Something got lost in translation.':'One donut. Two ways of seeing.'}<br>${broken?'Move or tap to scramble it.':'Move or touch to translate it.'}</span><div class="donut-controls"><button data-ascii aria-pressed="${broken}">${broken?'Repair donut':'ASCII view'}</button><button data-pause aria-pressed="false">Pause</button></div></figcaption></figure>`;
}

export async function mountDonut(figure,{broken=false}={}){
  const stage=figure.querySelector('.donut-stage'),loading=stage.querySelector('.donut-loading');
  const abort=new AbortController(),signal=abort.signal;
  let renderer,model,frame=0,disposed=false,visible=true,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,allAscii=broken;
  let angle=0,last=0,active=0,targetActive=0,dirty=true;
  const pointer=new THREE.Vector2(-1000,-1000),targetPointer=pointer.clone();
  const pauseButton=figure.querySelector('[data-pause]'),asciiButton=figure.querySelector('[data-ascii]');
  function updatePause(){pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.textContent=paused?'Play':'Pause';}
  updatePause();
  const resources=[];
  const dispose=()=>{disposed=true;cancelAnimationFrame(frame);abort.abort();observer?.disconnect();resizeObserver?.disconnect();themeObserver?.disconnect();renderer?.dispose();resources.forEach(x=>x.dispose());model?.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of [].concat(o.material)){Object.values(m).forEach(v=>{if(v?.isTexture)v.dispose();});m.dispose();}}});};
  let observer,resizeObserver,themeObserver;
  try{
    renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
    stage.append(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.01,100);
    camera.position.set(0,0,4.6);
    scene.add(new THREE.HemisphereLight(0xffffff,0x786955,2.5));
    const key=new THREE.DirectionalLight(0xfff3df,4.2);key.position.set(-3,5,6);scene.add(key);
    const fill=new THREE.DirectionalLight(0xf1f5ff,2.2);fill.position.set(4,1,3);scene.add(fill);
    const rim=new THREE.DirectionalLight(0xffffff,2);rim.position.set(1,3,-4);scene.add(rim);
    const gltf=await new GLTFLoader().loadAsync('/assets/models/donut.glb');
    if(disposed){gltf.scene.traverse(o=>o.geometry?.dispose());return dispose;}
    model=gltf.scene;
    const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
    model.position.sub(center);const holder=new THREE.Group();holder.add(model);holder.scale.setScalar(2.65/Math.max(size.x,size.y,size.z));scene.add(holder);
    // Both representations sample this exact render target, including its silhouette.
    const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});resources.push(target);
    const atlas=document.createElement('canvas');atlas.width=16*32;atlas.height=48;
    const ctx=atlas.getContext('2d');ctx.font='bold 34px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';
    const glyphs=' .,-~:;=!*#$@MW&';
    [...glyphs].forEach((c,i)=>ctx.fillText(c,i*32+16,24));
    const glyphTexture=new THREE.CanvasTexture(atlas);glyphTexture.minFilter=THREE.LinearFilter;glyphTexture.magFilter=THREE.LinearFilter;resources.push(glyphTexture);
    const uniforms={image:{value:target.texture},atlas:{value:glyphTexture},resolution:{value:new THREE.Vector2()},pointer:{value:pointer},pointerPower:{value:0},fullAscii:{value:allAscii?1:0},ink:{value:new THREE.Color()},ground:{value:new THREE.Color()},broken:{value:broken?1:0},time:{value:0}};
    const material=new THREE.ShaderMaterial({uniforms,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`
      uniform sampler2D image,atlas;uniform vec2 resolution,pointer;uniform float pointerPower,fullAscii,broken,time;uniform vec3 ink,ground;varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 pixel=vUv*resolution;vec2 cellSize=vec2(6.,10.);vec2 cell=floor(pixel/cellSize);vec2 center=(cell+.5)*cellSize;
        vec2 sampleUV=center/resolution;
        if(broken>.5){sampleUV.x+=sin(floor(sampleUV.y*30.)+floor(time*4.))*.009*pointerPower;}
        vec4 source=texture2D(image,vUv);vec4 sampleColor=texture2D(image,sampleUV);
        float brightness=dot(sampleColor.rgb,vec3(.2126,.7152,.0722));
        float index=clamp(floor(pow(max(brightness,0.),.38)*14.),1.,14.);
        vec2 local=fract(pixel/cellSize);float glyph=texture2D(atlas,vec2((index+local.x)/16.,local.y)).a;
        float distanceToMouse=length(center-pointer);
        float proximity=1.-smoothstep(25.,145.,distanceToMouse);
        float conversion=smoothstep(hash(cell)-.12,hash(cell)+.12,proximity*pointerPower)*smoothstep(.01,.09,proximity*pointerPower);
        conversion=max(conversion,fullAscii);
        vec3 realistic=mix(ground,source.rgb,source.a);
        vec3 ascii=mix(ground,ink,glyph*step(.12,sampleColor.a));
        gl_FragColor=vec4(mix(realistic,ascii,conversion),1.);
        #include <colorspace_fragment>
      }`});resources.push(material);
    const postScene=new THREE.Scene();const geometry=new THREE.PlaneGeometry(2,2);resources.push(geometry);postScene.add(new THREE.Mesh(geometry,material));
    const postCamera=new THREE.Camera();
    function theme(){const style=getComputedStyle(stage);uniforms.ground.value.set(style.getPropertyValue('--ground').trim());uniforms.ink.value.set(style.getPropertyValue('--ink').trim());dirty=true;wake();}
    function resize(){const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);target.setSize(Math.ceil(width*renderer.getPixelRatio()),Math.ceil(height*renderer.getPixelRatio()));uniforms.resolution.value.set(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();dirty=true;wake();}
    function render(now){
      frame=0;if(disposed||!visible||document.hidden)return;
      const dt=last?Math.min((now-last)/1000,.04):0;last=now;
      if(!paused)angle+=dt*.24;
      holder.rotation.set(.95+Math.sin(angle)*.5,angle*.55,.12+angle*.33);
      pointer.lerp(targetPointer,.18);active+=(targetActive-active)*.15;
      uniforms.pointerPower.value=active;uniforms.fullAscii.value+=(Number(allAscii)-uniforms.fullAscii.value)*.14;uniforms.time.value=now/1000;
      if(!paused||dirty||Math.abs(active-targetActive)>.001||Math.abs(uniforms.fullAscii.value-Number(allAscii))>.001){
        renderer.setRenderTarget(target);renderer.setClearColor(0,0);renderer.clear();renderer.render(scene,camera);
        renderer.setRenderTarget(null);renderer.render(postScene,postCamera);dirty=false;
      }
      if(!paused||Math.abs(active-targetActive)>.001||Math.abs(uniforms.fullAscii.value-Number(allAscii))>.001)frame=requestAnimationFrame(render);
    }
    function wake(){if(!frame&&!disposed&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
    function move(e){const rect=stage.getBoundingClientRect();targetPointer.set(e.clientX-rect.left,rect.height-(e.clientY-rect.top));targetActive=1;dirty=true;wake();}
    stage.addEventListener('pointermove',move,{signal});stage.addEventListener('pointerdown',move,{signal});
    stage.addEventListener('pointerleave',()=>{targetActive=0;wake();},{signal});
    stage.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')setTimeout(()=>{targetActive=0;wake();},900);},{signal});
    pauseButton.addEventListener('click',()=>{paused=!paused;last=0;dirty=true;updatePause();wake();},{signal});
    asciiButton.addEventListener('click',()=>{allAscii=!allAscii;asciiButton.setAttribute('aria-pressed',String(allAscii));if(broken){uniforms.broken.value=allAscii?1:0;asciiButton.textContent=allAscii?'Repair donut':'Scramble donut';}dirty=true;wake();},{signal});
    document.addEventListener('visibilitychange',()=>{last=0;wake();},{signal});
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{paused=e.matches;updatePause();wake();},{signal});
    observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;last=0;wake();});observer.observe(stage);
    resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);
    themeObserver=new MutationObserver(theme);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    stage.classList.add('is-ready');loading.textContent='';theme();resize();wake();
  }catch(error){
    renderer?.dispose();renderer?.domElement.remove();
    loading.textContent='Interactive view unavailable. Original render shown.';
    loading.style.alignContent='end';loading.style.paddingBottom='1rem';figure.querySelector('.donut-controls').hidden=true;
    console.warn('Donut view:',error.message);
  }
  return dispose;
}
