import * as THREE from 'three';
import type { MachineId } from './catalog';
import { makePartGeometry as makeR760 } from './geometry';

const M = {
  steel: surf('#b3bdc6',.8,.34),
  silver: surf('#d5dce0',.72,.28),
  polished: surf('#e2e6e6',.83,.24),
  darkSteel: surf('#52606a',.66,.5),
  graphite: surf('#283038',.55,.6),
  charcoal: surf('#171f26',.34,.66),
  black: surf('#11171d',.25,.7),
  blackGloss: surf('#202933',.48,.33),
  pcb: surf('#166544',.12,.72),
  brightPcb: surf('#187655',.14,.66),
  emerald: surf('#0b4838',.16,.72),
  dimm: surf('#267e48',.17,.68),
  inkGreen: surf('#153f30',.18,.7),
  copper: surf('#bd8452',.8,.33),
  copperLight: surf('#e8b987',.78,.24),
  gold: surf('#c8af7d',.78,.34),
  beige: surf('#d5c7ac',.7,.34),
  silicon: surf('#333b3a',.29,.55),
  blue: surf('#2b719a',.36,.48),
  blue2: surf('#1d527b',.42,.45),
  orange: surf('#ed8b28',.22,.54),
  greenLed: surf('#64ef99',.22,.33,'#21b657'),
  blueLed: surf('#8fdbf7',.12,.25,'#3b8ab3'),
  white: surf('#eaece9',.24,.64),
  red: surf('#b64d43',.35,.46),
  coolant: surf('#287ea2',.48,.35),
  coolant2: surf('#b04c3d',.4,.4),
};
function surf(color:string,metalness:number,roughness:number,emissive?:string) {
  return new THREE.MeshStandardMaterial({color,metalness,roughness, ...(emissive?{emissive,emissiveIntensity:.48}:{})});
}
const edgeMaterial=new THREE.LineBasicMaterial({color:'#46535a',transparent:true,opacity:.38});
function part(g:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material,outline=false) {
  const geo=new THREE.BoxGeometry(w,h,d);
  const obj=new THREE.Mesh(geo,m);
  obj.position.set(x,y,z); g.add(obj);
  if(outline) {
    const e=new THREE.LineSegments(new THREE.EdgesGeometry(geo),edgeMaterial);
    e.position.copy(obj.position);g.add(e);
  }
  return obj;
}
function cyl(g:THREE.Group,r:number,h:number,x:number,y:number,z:number,m:THREE.Material,n=16,axis:'x'|'y'|'z'='y') {
  const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,n),m);
  o.position.set(x,y,z);
  if(axis==='z')o.rotation.x=Math.PI/2;
  if(axis==='x')o.rotation.z=Math.PI/2;
  g.add(o);return o;
}
function torus(g:THREE.Group,r:number,t:number,x:number,y:number,z:number,m:THREE.Material,axis:'y'|'z'='z') {
  const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,6,24),m);
  if(axis==='y')o.rotation.x=Math.PI/2;
  o.position.set(x,y,z);g.add(o);
}
function cable(g:THREE.Group,pts:number[][],radius:number,m:THREE.Material,steps=26) {
  const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2])));
  const pipe=new THREE.Mesh(new THREE.TubeGeometry(curve,steps,radius,6,false),m);
  g.add(pipe);return pipe;
}
const textures=new Map<string,THREE.CanvasTexture>();
function legend(g:THREE.Group,text:string,x:number,y:number,z:number,w:number,h:number,orientation:'up'|'front'='up',dark=true) {
  const key=(dark?'D':'L')+text;
  let tex=textures.get(key);
  if(!tex){
    const c=document.createElement('canvas');c.width=512;c.height=128;
    const ctx=c.getContext('2d')!;
    if(dark){ctx.fillStyle='#222830';ctx.fillRect(0,0,512,128);}
    ctx.font='bold 39px Arial, sans-serif';ctx.fillStyle=dark?'#ebeeee':'#22343a';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,65,490);
    tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;textures.set(key,tex);
  }
  const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,transparent:true,depthWrite:false}));
  if(orientation==='up')o.rotation.x=-Math.PI/2;
  o.position.set(x,y,z);g.add(o);
}
function bolt(g:THREE.Group,x:number,y:number,z:number){
  cyl(g,2.4,2,x,y,z,M.darkSteel,10);part(g,1.6,.5,2,x,y+1.1,z,M.black);
}
function ventilation(g:THREE.Group,w:number,x:number,y:number,z:number,count:number,material:THREE.Material,mode:'top'|'front'='top') {
  for(let n=0;n<count;n++){
    const xx=x-w/2+(n+.5)*w/count;
    if(mode==='top')part(g,5,1.8,11,xx,y,z,material);
    else part(g,5,11,1.8,xx,y,z,material);
  }
}
function fins(g:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,n=24,m:THREE.Material=M.silver) {
  part(g,w+4,4,d+4,x,y-h/2,z,M.copper,true);
  for(let i=0;i<n;i++)part(g,1.6,h,d,x-w/2+(i+.5)*w/n,y,z,m);
  for(let k of [-1,1])for(let kk of [-1,1])bolt(g,x+k*w*.47,y+h/2+2,z+kk*d*.45);
}
function fan(g:THREE.Group,x:number,y:number,z:number,sz:number,face:'up'|'front'='front',handle=false){
  const dep=face==='front'?sz*.5:sz;
  part(g,sz,sz,dep,x,y,z,M.charcoal,true);
  // axial hub and circular frames
  const f=face==='front'?z+dep/2+1:z;
  if(face==='front')torus(g,sz*.35,2.3,x,y,f,M.steel,'z');
  else torus(g,sz*.35,2.1,x,y+sz*.51,z,M.darkSteel,'y');
  for(let i=0;i<7;i++){
    const a=i*Math.PI*2/7;
    const r=sz*.19;
    if(face==='front') {
      const blade=part(g,sz*.25,sz*.11,2.4,x+Math.cos(a)*r,y+Math.sin(a)*r,f,M.blackGloss);
      blade.rotation.z=a+.5;
    }else {
      const blade=part(g,sz*.23,2,sz*.12,x+Math.cos(a)*r,y+sz*.51,z+Math.sin(a)*r,M.blackGloss);
      blade.rotation.y=a+.5;
    }
  }
  if(face==='front')cyl(g,sz*.115,3,x,y,f+2,M.graphite,18,'z');
  else cyl(g,sz*.115,3,x,y+sz*.52,z,M.graphite,18);
  if(handle)part(g,sz*.22,sz*.09,sz*.24,x,y+sz*.53,z,M.orange,true);
}
function dimms(g:THREE.Group,cx:number,cz:number,num=16,spread=175,face='up'){
  for(let i=0;i<num;i++){
    const side=i<Math.ceil(num/2)?-1:1;
    const at=i%Math.ceil(num/2);
    const x=cx+side*(59+at*12.6);
    const z=cz+(i%2?32:-32);
    part(g,3.7,57,140,x,0,z,M.dimm,true);
    part(g,4,4,136,x,-27,z,M.gold);
    for(let k=0;k<8;k++){
      part(g,4.9,21,10,x,1,z-54+k*15.4,M.inkGreen);
      part(g,5.3,1.4,7,x,27,z-53+k*15.4,M.polished);
    }
    part(g,7,8,7,x,32,z-67,M.white);
    part(g,7,8,7,x,32,z+67,M.white);
  }
  void spread;void face;
}
function motherboard(g:THREE.Group,w:number,d:number,cpuZ:number,hostX=86) {
  part(g,w,6,d,0,0,0,M.pcb,true);
  for(let i=0;i<100;i++){
    const x=-w/2+10+(i*71)%(w-20);
    const z=-d/2+10+(i*151)%(d-20);
    part(g,(i%4===0?32:13),.35,.65,x,3.5,z,i%3?M.gold:M.copper);
  }
  for(const x of [-hostX,hostX]){
    part(g,91,3,105,x,4.2,cpuZ,M.charcoal,true);
    part(g,83,2,94,x,7,cpuZ,M.silver,true);
    for(let xx=-2;xx<=2;xx++)part(g,8,12,9,x+xx*17,10,cpuZ+66,M.graphite);
  }
  for(let n=0;n<10;n++){
    const x=-w/2+20+(n*43)%(w-30);
    const z=-d/2+45+(n*67)%(d-60);
    part(g,17,5,17,x,5,z,M.silicon,true);
  }
  for(let i=0;i<8;i++)part(g,45,12,5,-w/2+36+i*51,7,-d/2+16,M.charcoal,true);
  for(const x of [-w/2+12,w/2-12])for(const z of [-d/2+12,d/2-12])bolt(g,x,4,z);
}
function cpuHeatsinks(g:THREE.Group,xs=[-86,86],zs=[0,0],w=83,d=108,h=48){
  xs.forEach((x,i)=>{
    const z=zs[i]??0;
    part(g,w+4,4,d+4,x,-h/2-2,z,M.copper,true);
    fins(g,w,h,d,x,0,z,25,M.polished);
    for(const k of [-1,1])for(const q of [-1,1])bolt(g,x+k*w*.5,h/2+4,z+q*d*.45);
  });
}
function psuBox(g:THREE.Group,x:number,y:number,z:number,w:number,h:number,d:number,frontDirection:'front'|'rear'='rear'){
  part(g,w,h,d,x,y,z,M.silver,true);
  part(g,w-5,h-5,d-5,x,y,z,M.graphite);
  const f=z+(frontDirection==='front'?d/2:-d/2);
  part(g,w-7,h-8,3,x,y,f,M.darkSteel,true);
  torus(g,Math.min(w,h)*.28,2,x,y,f+(frontDirection==='front'?3:-3),M.black,'z');
  for(let i=0;i<6;i++)part(g,w*.14,3,3,x-w*.38+i*w*.15,y-h*.2,f+(frontDirection==='front'?4:-4),M.black);
  part(g,7,5,2,x+w*.32,y+h*.31,f+(frontDirection==='front'?4:-4),M.greenLed);
  part(g,10,4,8,x-w*.38,y+h*.30,f,M.orange);
}
function gpuSxm(g:THREE.Group,x:number,z:number,w=173,d=59,kind:'h200'|'b200'='h200'){
  part(g,w,12,d,x,-28,z,M.charcoal,true);
  part(g,w-11,3,d-8,x,-20,z,M.pcb,true);
  part(g,w-14,7,d-10,x,-14,z,M.copperLight,true);
  if(kind==='h200'){
    part(g,w-17,18,d-11,x,0,z,M.beige,true);
    part(g,w-25,2,d-18,x,10,z,M.gold);
    legend(g,'NVIDIA H200',x,11.5,z,Math.min(w-30,120),17,'up',false);
    for(let q=0;q<7;q++){
      part(g,1.5,20,d-7,x-w*.4+q*w*.13,18,z,M.polished);
    }
  }else{
    part(g,w-7,5,d-3,x,-1,z,M.copper,true);
    for(let q=0;q<23;q++){
      part(g,2.4,76,d-8,x-w*.43+q*(w*.86/22),40,z,M.charcoal);
      if(q%3===0)part(g,1.2,73,d-10,x-w*.43+q*(w*.86/22)+1.2,40,z,M.darkSteel);
    }
    part(g,w-8,3,d-8,x,81,z,M.graphite,true);
    legend(g,'BLACKWELL',x,83,z,Math.min(w*.78,128),15);
    for(const xx of [-w*.43,w*.43])for(const zz of [-d*.43,d*.43])bolt(g,x+xx,84,z+zz);
  }
  for(const sx of [-1,1])for(const sz of [-1,1])bolt(g,x+sx*w*.46,13,z+sz*d*.48);
}

// XE9680: +Z = front 8-drive bank, -Z = GPU/rear I/O side.
function xeChassis(g:THREE.Group) {
  part(g,465,7,856,0,3,0,M.silver,true);
  part(g,453,3,846,0,8,0,M.steel);
  for(const x of [-232,232]){
    part(g,6,259,853,x,134,0,M.steel,true);
    part(g,22,7,820,x-Math.sign(x)*12,260,0,M.silver);
    for(let z=-385;z<400;z+=28)part(g,3,5,12,x-Math.sign(x)*2,159,z,M.graphite);
  }
  for(const z of [-425,425]){
    part(g,466,7,5,0,258,z,M.silver);
    part(g,467,16,7,0,10,z,M.darkSteel);
  }
  for(const x of [-248,248]){
    part(g,35,262,20,x,132,420,M.darkSteel,true);
    for(const y of [24,126,226])part(g,10,10,4,x,y,433,M.black);
  }
  // Front vent deck above drive bank
  part(g,420,78,9,0,193,429,M.graphite);
  for(let i=0;i<24;i++)part(g,12,40,3,-191+i*16.6,191,434,M.black);
  for(const z of [-360,0,276])for(const x of [-207,207])part(g,17,6,30,x,36,z,M.steel);
  legend(g,'PowerEdge XE9680',0,242,425,219,24,'front',true);
}
function xeCover(g:THREE.Group) {
  part(g,459,7,858,0,0,0,M.steel,true);
  for(let row=0;row<6;row++)ventilation(g,400,0,4,-370+row*25,30,M.graphite);
  for(const x of [-220,220])part(g,7,22,840,x,-9,0,M.steel);
  legend(g,'POWEREDGE XE9680',0,4.5,-296,220,20);
}
function xeDrives(g:THREE.Group) {
  for(let i=0;i<8;i++){
    const x=(i-3.5)*50.3;
    part(g,46,71,103,x,0,0,M.graphite,true);
    part(g,44,65,6,x,0,52,M.black,true);
    part(g,6,53,5,x-17,0,55,M.steel);
    part(g,19,4,3,x+5,-19,56,M.silver);
    part(g,7,4,3,x+15,23,56,M.greenLed);
    part(g,22,3,3,x+4,7,56,M.darkSteel);
    legend(g,String(i+1),x,-39,54,17,10,'front',true);
  }
}
function xeMidFans(g:THREE.Group) {
  part(g,433,7,106,0,-77,0,M.steel,true);
  for(let i=0;i<6;i++){
    const x=(i-2.5)*70.6;
    part(g,68,150,91,x,1,0,M.graphite,true);
    for(const y of [-38,38])fan(g,x,y,47,61,'front',true);
    part(g,32,8,11,x,81,0,M.orange,true);
    part(g,14,8,19,x,90,-15,M.blue);
  }
  for(const x of [-218,218])part(g,10,180,110,x,2,0,M.silver);
}
function xeRearFans(g:THREE.Group) {
  part(g,432,5,82,0,-79,0,M.darkSteel);
  for(let i=0;i<10;i++){
    const x=(i%5-2)*84;
    const y=(i<5?-38:39);
    fan(g,x,y,0,70,'front',false);
  }
}
function xeBoard(g:THREE.Group){motherboard(g,415,311,0,86);}
function xeCpu(g:THREE.Group){cpuHeatsinks(g,[-89,89],[0,0],95,130,64);}
function xeRam(g:THREE.Group){for(const dx of [-97,97])dimms(g,dx,0,16);}
function xeHgc(g:THREE.Group) {
  part(g,418,10,294,0,0,0,M.pcb,true);
  for(let i=0;i<150;i++){
    const x=-203+(i*43)%407,z=-141+(i*79)%275;
    part(g,12,.8,.65,x,5.7,z,i%3?M.gold:M.copper);
  }
  for(const x of [-100,100])for(const z of [-111,-37,37,111]){
    part(g,170,7,67,x,9,z,M.charcoal,true);
    for(const xx of [-67,67])for(const zz of [-25,25])bolt(g,x+xx,14,z+zz);
  }
  for(let q=-3;q<=3;q++)part(g,385,3,4,0,7,q*34,M.gold);
}
function xeGpus(g:THREE.Group) {
  for(const x of [-103,103])for(const z of [-110,-36,38,112])gpuSxm(g,x,z,187,63,'h200');
}
function xeNvlink(g:THREE.Group) {
  part(g,309,7,215,0,0,0,M.emerald,true);
  for(const x of [-84,0,84])for(const z of [-53,53]){
    part(g,62,9,61,x,10,z,M.charcoal,true);
    part(g,56,4,54,x,17,z,M.copper);
    fins(g,51,16,50,x,31,z,18,M.polished);
  }
  for(let i=0;i<100;i++){
    part(g,(i%3?23:9),.6,1,-145+(i*57)%290,4,-102+(i*67)%207,M.gold);
  }
}
function xeRisers(g:THREE.Group) {
  for(let k=0;k<4;k++){
    const x=-133+k*88;
    part(g,79,82,120,x,0,0,M.silver,true);
    part(g,68,3,113,x,44,0,M.graphite);
    for(let i=0;i<9;i++)part(g,4,2,61,x-27+i*6.8,47,-12,M.black);
    part(g,72,55,3,x,-10,42,M.pcb,true);
    part(g,25,15,9,x,-1,-61,M.charcoal);
    part(g,18,5,10,x,-38,20,M.gold);
    legend(g,'PCIe 5',x,46,-27,63,14);
    for(const dx of [-30,30])bolt(g,x+dx,47,47);
  }
}
function xePower(g:THREE.Group) {
  for(let i=0;i<6;i++){
    const x=-173+(i%3)*173;
    const y=(i<3?-27:31);
    psuBox(g,x,y,0,127,46,104,'rear');
    part(g,15,7,9,x+42,y+19,-54,M.orange);
  }
}

// DGX B200: GPU tray above the host CPU and network shelves, large 10U enclosure.
function dgxFrame(g:THREE.Group) {
  part(g,465,9,891,0,3,0,M.darkSteel,true);
  for(const x of [-231,231]){
    part(g,7,434,897,x,222,0,M.silver,true);
    part(g,19,7,882,x-Math.sign(x)*10,439,0,M.steel);
    for(let i=0;i<11;i++)part(g,4,8,41,x,25+i*39,-280+(i%3)*100,M.charcoal);
  }
  for(const z of [-446,446]){
    part(g,465,9,9,0,440,z,M.silver);
    part(g,464,10,9,0,8,z,M.steel);
  }
  for(const x of [-247,247]){
    part(g,33,430,19,x,219,444,M.charcoal,true);
    for(const y of [32,125,236,332,411])part(g,12,13,6,x,y,454,M.black);
  }
  for(const y of [12,198,438])part(g,447,7,860,0,y,0,M.darkSteel,true);
  // Face of full DGX unit: perforated metal and service partitions.
  part(g,428,55,11,0,39,442,M.graphite);
  part(g,428,29,11,0,244,442,M.charcoal);
  for(let k=0;k<36;k++)part(g,8,4,2,-202+k*11.4,242,449,M.silver);
  for(let k=0;k<31;k++)part(g,8,5,2,-191+k*12.7,49,449,M.black);
  legend(g,'NVIDIA DGX B200',0,377,449,243,30,'front',true);
}
function dgxCover(g:THREE.Group) {
  part(g,460,8,892,0,0,0,M.silver,true);
  for(let row=0;row<8;row++)ventilation(g,385,0,4,-350+row*48,27,M.charcoal);
  for(const x of [-226,226])part(g,6,19,881,x,-10,0,M.darkSteel);
}
function dgxGPUTray(g:THREE.Group) {
  part(g,425,15,518,0,0,0,M.blackGloss,true);
  part(g,409,8,490,0,12,0,M.emerald);
  for(const x of [-198,198])part(g,13,18,504,x,17,0,M.steel);
  for(const z of [-249,249])part(g,417,23,7,0,19,z,M.silver);
  for(const x of [-108,108])for(const z of [-167,-56,56,167]){
    part(g,181,5,98,x,18,z,M.graphite,true);
    for(const xx of [-85,85])for(const zz of [-45,45])bolt(g,x+xx,23,z+zz);
  }
  for(let i=0;i<96;i++){
    const x=-187+(i*77)%372,z=-225+(i*113)%445;
    part(g,(i%3?22:38),.9,1.4,x,16,z,M.gold);
  }
}
function dgxGPUs(g:THREE.Group){
  for(const x of [-109,109])for(const z of [-171,-58,58,171]){
    gpuSxm(g,x,z,183,100,'b200');
    for(let dx of [-89,89])part(g,5,102,103,x+dx,38,z,M.darkSteel);
  }
}
function dgxSwitch(g:THREE.Group){
  part(g,182,8,255,0,0,0,M.pcb,true);
  for(const z of [-65,65]){
    part(g,147,17,98,0,17,z,M.copper,true);
    fins(g,132,28,88,0,38,z,25,M.silver);
    legend(g,'NVSWITCH',0,55,z,112,17);
  }
  for(let i=0;i<40;i++){
    const x=-83+(i*17)%166,z=-124+(i*41)%248;
    part(g,8,6,4,x,9,z,M.charcoal);
  }
}
function dgxCPUTray(g:THREE.Group){
  motherboard(g,417,348,0,92);
  for(const x of [-205,205]){
    part(g,6,24,352,x,13,0,M.steel);
  }
  for(const z of [-170,170])part(g,408,5,6,0,18,z,M.steel);
}
function dgxCPU(g:THREE.Group){cpuHeatsinks(g,[-105,105],[0,0],91,125,82);}
function dgxMem(g:THREE.Group){for(const cx of [-96,96])dimms(g,cx,0,16);}
function dgxFans(g:THREE.Group){
  part(g,417,7,95,0,-90,0,M.silver);
  // Twenty high-pressure cartridges arranged in two service rows.
  for(let row=0;row<2;row++){
    for(let i=0;i<10;i++){
      const x=(i-4.5)*40.2,y=(row-.5)*99;
      part(g,38,87,87,x,y,0,M.graphite,true);
      fan(g,x,y,44,35,'front');
      part(g,15,4,12,x,y+44,0,M.orange);
    }
  }
  for(const x of [-210,210])part(g,6,185,94,x,0,0,M.steel);
}
function dgxStorage(g:THREE.Group){
  for(let i=0;i<8;i++){
    const x=(i-3.5)*51;
    part(g,47,62,94,x,0,0,M.darkSteel,true);
    part(g,43,55,5,x,0,49,M.charcoal,true);
    part(g,32,5,3,x,23,53,M.silver);
    part(g,7,6,3,x+18,18,53,M.greenLed);
    part(g,8,36,5,x-18,0,52,M.steel);
  }
}
function dgxNetwork(g:THREE.Group){
  part(g,397,9,135,0,-38,0,M.steel);
  for(let i=0;i<8;i++){
    const x=-166+i*47;
    part(g,42,71,103,x,0,0,M.graphite,true);
    part(g,32,38,9,x,8,-54,M.black,true);
    part(g,26,13,8,x,22,-59,M.silver);
    for(let j=0;j<2;j++)part(g,7,5,5,x-9+j*17,-13,-58,M.greenLed);
    part(g,31,30,3,x,-17,50,M.pcb);
    for(let k=0;k<5;k++)part(g,2,25,12,x-12+k*6,24,17,M.steel);
  }
  for(let i=0;i<2;i++){
    const x=-145+i*260;
    part(g,89,6,19,x,43,-50,M.blue2,true);
    legend(g,'BLUEFIELD 3',x,47,-50,82,12);
  }
}
function dgxPower(g:THREE.Group){
  for(let i=0;i<6;i++){
    const x=-140+(i%3)*140;
    const y=i<3?-28:28;
    psuBox(g,x,y,0,129,48,100,'rear');
    part(g,10,6,12,x-54,y+18,-53,M.greenLed);
  }
}
// RACK GB200 NVL72. All repeated trays are modeled within shared group objects.
const ru=45;
function rackFrame(g:THREE.Group){
  // 42U class enclosure, exposed front; visible black structural rails and side mesh.
  part(g,700,24,1187,0,12,0,M.black,true);
  part(g,700,22,1187,0,2112,0,M.graphite,true);
  for(const x of [-344,344])for(const z of [-575,575]){
    part(g,24,2100,24,x,1060,z,M.darkSteel,true);
    for(let y=120;y<2040;y+=ru)part(g,15,6,6,x-Math.sign(x)*8,y,z+Math.sign(z)*2,M.silver);
  }
  // Upper rack housing and front-side rails.
  for(const x of [-334,334]) {
    part(g,16,2000,12,x,1070,582,M.graphite);
    part(g,26,2000,7,x,1070,-583,M.graphite);
  }
  for(const y of [58,2018]){
    part(g,680,13,20,0,y,571,M.steel);
    part(g,680,13,20,0,y,-572,M.steel);
  }
  // Shelf mounting points and ventilation perforations.
  for(let y=160;y<1930;y+=ru){
    for(const x of [-340,340]){
      part(g,14,4,13,x,y,563,M.steel);
      part(g,14,4,13,x,y,-563,M.steel);
    }
  }
  for(const x of [-352,352]){
    part(g,4,2000,1120,x,1075,0,M.darkSteel);
    for(let i=0;i<28;i++)part(g,5,12,33,x,180+i*64,-190+(i%3)*178,M.black);
  }
  // vertical rear power bar
  part(g,53,1880,29,260,1060,-557,M.copper,true);
  for(let y=210;y<1960;y+=83)part(g,34,16,15,260,y,-541,M.gold);
  legend(g,'NVIDIA DGX GB200',0,2081,584,315,24,'front',true);
}
function rackDoor(g:THREE.Group) {
  part(g,690,2045,33,0,0,0,M.darkSteel,true);
  for(let y=-970;y<970;y+=31){
    for(let x=-314;x<316;x+=30){
      part(g,17,14,2,x,y,18,M.black);
    }
  }
  for(const x of [-335,335])part(g,9,2015,27,x,0,0,M.steel);
  for(const y of [-1002,1002])part(g,674,9,29,0,y,0,M.steel);
  part(g,8,170,16,314,0,19,M.steel);
  legend(g,'NVIDIA GB200 NVL72',0,760,19,302,35,'front',true);
}
function computeTray(g:THREE.Group,y:number,n:number){
  const z=0;
  part(g,619,38,705,0,y,z,M.darkSteel,true);
  part(g,614,5,702,0,y-17,z,M.steel);
  part(g,607,4,699,0,y+18,z,M.graphite);
  // Front 1U extraction handle and ventilation grille.
  part(g,615,39,8,0,y,357,M.blackGloss,true);
  for(let i=0;i<40;i++)part(g,7,13,2,-290+i*15,y,364,M.black);
  for(const x of [-292,292])part(g,19,22,9,x,y,362,M.greenLed);
  // Two Grace CPU coldplates and four Blackwell GPU coldplates on motherboard.
  for(const cx of [-150,150]){
    part(g,269,2,340,cx,y+20,-80,M.pcb);
    part(g,68,6,66,cx,y+26,-180,M.copperLight,true);
    part(g,60,4,57,cx,y+32,-180,M.steel);
    for(const dz of [-40,77]){
      part(g,98,7,87,cx,y+25,dz,M.copper,true);
      part(g,88,3,79,cx,y+31,dz,M.steel);
    }
    // Fine copper liquid channel bridges cold plates.
    cable(g,[[cx-70,y+30,-195],[cx-60,y+33,-140],[cx-60,y+34,65],[cx-10,y+35,150]],3.3,M.copper,18);
  }
  for(const x of [-255,255])part(g,13,20,610,x,y,2,M.black);
  // Rear blind-mate interfaces and port LEDs.
  for(let i=0;i<12;i++){
    const x=-266+i*48;
    part(g,31,20,9,x,y,-358,M.steel);
    part(g,24,15,10,x,y,-363,M.charcoal);
    part(g,4,3,3,x+10,y+12,-365,n%2===0?M.greenLed:M.blueLed);
  }
  // Light model identity on tray rim.
  if(n%4===0)legend(g,'COMPUTE · '+String(n+1).padStart(2,'0'),-204,y+22,240,154,14);
}
function rackComputes(g:THREE.Group){
  // 10 upper compute trays and 8 lower. The 9 switch units sit in the middle.
  for(let i=0;i<8;i++)computeTray(g,-607+i*ru,i);
  for(let i=0;i<10;i++)computeTray(g,195+i*ru,i+8);
}
function switchTray(g:THREE.Group,y:number,n:number){
  part(g,618,38,693,0,y,0,M.graphite,true);
  part(g,615,6,690,0,y-17,0,M.steel);
  part(g,612,34,8,0,y,351,M.darkSteel);
  for(let i=0;i<36;i++){
    const x=-290+i*16;
    part(g,10,13,3,x,y+3,357,M.black);
    if(i%3===0)part(g,3,3,2,x,y+12,359,M.blueLed);
  }
  for(const x of [-165,165]){
    part(g,130,4,200,x,y+21,-70,M.pcb,true);
    part(g,91,7,107,x,y+28,-75,M.copper);
    part(g,80,6,90,x,y+37,-75,M.silver);
    // thermal interface & coolant cold-plate mounting bolts
    for(const xx of [-50,50])for(const zz of [-45,45])cyl(g,3.6,2,x+xx,y+41,-75+zz,M.gold,10);
  }
  // Each tray has two large NVSwitch ASICs; rear cable connectors.
  for(let i=0;i<18;i++){
    const x=-286+i*33.6;
    part(g,25,20,14,x,y,-349,M.charcoal);
    part(g,22,12,3,x,y,-358,M.copper);
  }
  if(n%3===0)legend(g,'NVLINK SWITCH',0,y+21,182,170,14);
}
function rackSwitches(g:THREE.Group) {
  // Local vertical middle section, nine 1RU trays.
  for(let i=0;i<9;i++)switchTray(g,-200+i*ru,i);
}
function rackTor(g:THREE.Group) {
  for(const y of [-28,28]){
    part(g,615,44,668,0,y,0,M.graphite,true);
    part(g,606,41,9,0,y,335,M.blackGloss,true);
    for(let i=0;i<48;i++){
      const x=-280+i*12;
      part(g,8,12,5,x,y+5,343,M.darkSteel);
      if(i%4===0)part(g,3,3,2,x,y+16,347,M.greenLed);
    }
    for(const x of [-295,295])part(g,14,28,13,x,y,341,M.blue,true);
  }
}
function rackPower(g:THREE.Group) {
  for(let shelf=0;shelf<4;shelf++){
    const y=-154+shelf*103;
    part(g,620,91,672,0,y,0,M.graphite,true);
    part(g,615,82,12,0,y,343,M.darkSteel);
    for(let p=0;p<6;p++){
      const x=-249+p*99;
      part(g,91,76,620,x,y,-2,M.steel,true);
      part(g,83,71,14,x,y,349,M.charcoal);
      for(let q=0;q<6;q++)part(g,8,32,4,x-28+q*11,y,357,M.black);
      part(g,6,6,4,x+27,y+24,358,M.greenLed);
      part(g,10,11,11,x-27,y+22,358,M.orange);
    }
    if(shelf===0)legend(g,'POWER SHELF',-160,y+46,0,170,16);
  }
  // Continuous busbars on rear face with insulating holders.
  for(const x of [-283,283]){
    part(g,23,386,21,x,0,-354,M.copper,true);
    for(let j=0;j<8;j++)part(g,28,8,31,x,-145+j*43,-354,M.black);
  }
}
function rackLiquid(g:THREE.Group){
  // Supply/return vertical coolant manifolds, quick-disconnect couplings every tray pitch.
  for(const x of [-51,51]){
    cyl(g,16,1810,x,0,0,x>0?M.coolant:M.coolant2,20);
    cyl(g,23,31,x,898,0,M.steel,20);
    cyl(g,23,31,x,-898,0,M.steel,20);
    for(let i=0;i<30;i++){
      const y=-848+i*58.5;
      cyl(g,21,6,x,y,0,M.copper,16);
      const seg=[[x,y,0],[x+(x>0?25:-25),y,12],[x+(x>0?38:-38),y,53],[x+(x>0?55:-55),y,88]];
      cable(g,seg,4.4,x>0?M.coolant:M.coolant2,12);
      part(g,11,13,20,x+(x>0?55:-55),y,92,M.steel,true);
    }
  }
  for(const y of [-895,895]){
    for(const x of [-51,51]){
      part(g,75,7,37,x,y,0,M.steel,true);
      part(g,13,27,14,x+21,y+7,0,M.orange);
    }
  }
}
function rackBackplane(g:THREE.Group){
  part(g,590,1403,24,0,0,0,M.darkSteel,true);
  for(let group=0;group<18;group++){
    const y=-645+group*75.8;
    for(let col=0;col<10;col++){
      const x=-265+col*59;
      part(g,42,42,26,x,y,1,M.graphite,true);
      part(g,36,35,4,x,y,-16,M.copper,true);
      for(let k=0;k<4;k++)part(g,5,28,2,x-15+k*10,y,-19,M.gold);
    }
    for(let i=0;i<7;i++){
      const x=-220+i*70;
      cable(g,[[x,y-24,-22],[x+12,y-14,-45],[x+15,y+25,-45],[x+29,y+38,-22]],2.5,M.copper,10);
    }
  }
}
function rackDetail(g:THREE.Group){
  part(g,520,10,558,0,-16,0,M.steel,true);
  part(g,505,5,535,0,-8,0,M.pcb,true);
  for(const x of [-116,116]){
    part(g,115,12,98,x,3,-145,M.copper,true);
    part(g,105,8,88,x,12,-145,M.polished,true);
    legend(g,'GRACE CPU',x,17,-145,89,18);
    for(const z of [-12,124]){
      part(g,139,9,112,x,7,z,M.copper,true);
      part(g,127,6,102,x,16,z,M.polished,true);
      legend(g,'BLACKWELL',x,20,z,110,17);
    }
    cable(g,[[x-86,16,-178],[x-80,40,-120],[x-78,41,92],[x-28,30,200]],6,M.coolant,20);
    cable(g,[[x+83,17,-178],[x+89,40,-120],[x+81,43,92],[x+29,31,200]],6,M.coolant2,20);
  }
  for(let i=0;i<8;i++){
    const x=-226+i*64;
    part(g,42,19,18,x,16,-262,M.charcoal,true);
    part(g,28,15,4,x,15,-272,M.gold);
  }
}
function rackCooling(g:THREE.Group){
  for(const x of [-45,45]){
    cyl(g,28,760,x,0,0,x>0?M.coolant:M.coolant2,22);
    for(let k=0;k<6;k++){
      const y=-300+k*117;
      cyl(g,35,11,x,y,0,M.steel,18);
      part(g,26,10,21,x+34,y,0,M.orange,true);
      cable(g,[[x,y+16,0],[x+55,y+15,30],[x+81,y+6,85]],6,x>0?M.coolant:M.coolant2,18);
      part(g,29,21,10,x+85,y+5,90,M.silver,true);
    }
  }
  part(g,150,108,82,0,-370,0,M.darkSteel,true);
  legend(g,'CDU INTERFACE',0,-314,0,116,17);
}
const XE:Record<string,(g:THREE.Group)=>void>={
  chassis:xeChassis,lid:xeCover,drives:xeDrives,midfans:xeMidFans,rearFans:xeRearFans,
  board:xeBoard,cpu:xeCpu,ram:xeRam,hgc:xeHgc,gpus:xeGpus,nvlink:xeNvlink,risers:xeRisers,psus:xePower,
};
const DGX:Record<string,(g:THREE.Group)=>void>={
  frame:dgxFrame,cover:dgxCover,gpuTray:dgxGPUTray,gpus:dgxGPUs,nvs:dgxSwitch,cpuTray:dgxCPUTray,
  cpus:dgxCPU,memory:dgxMem,fans:dgxFans,storage:dgxStorage,network:dgxNetwork,psus:dgxPower,
};
const RACK:Record<string,(g:THREE.Group)=>void>={
  cabinet:rackFrame,door:rackDoor,computes:rackComputes,switches:rackSwitches,tor:rackTor,
  powers:rackPower,liquid:rackLiquid,backplane:rackBackplane,modules:rackDetail,cooling:rackCooling,
};
export function makeGeometry(machine:MachineId,id:string):THREE.Group{
  if(machine==='r760')return makeR760(id.replace(/^r760:/,'') as Parameters<typeof makeR760>[0]);
  const g=new THREE.Group();g.name=id;
  const fn=(machine==='xe9680'?XE:machine==='dgxb200'?DGX:RACK)[id];
  if(!fn)throw new Error('Unknown '+machine+' assembly '+id);
  fn(g);
  g.traverse(obj=>{if(obj instanceof THREE.Mesh||obj instanceof THREE.LineSegments)obj.userData.partId=id;});
  return g;
}
