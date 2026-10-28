import * as THREE from 'three';
import type { ComponentId } from './data';

// Vendor-grounded procedural study meshes, not recovered OEM CAD geometry.
// Millimetres, +Z = front drive side, -Z = rear panel, Y = vertical.
const M = {
  chassis: mat('#b5bec6', .83, .34),
  raw: mat('#d3dade', .76, .28),
  rails: mat('#8c999f', .83, .35),
  graphite: mat('#323b42', .51, .58),
  panel: mat('#202930', .45, .68),
  dark: mat('#131b22', .2, .72),
  socket: mat('#101b1c', .14, .74),
  plastic: mat('#26313c', .2, .7),
  pcb: mat('#176d47', .11, .7),
  pcb2: mat('#0e5136', .14, .66),
  pcbEdge: mat('#12513b', .14, .55),
  dimm: mat('#186b37', .11, .69),
  greenChip: mat('#153b2f', .12, .56),
  chip: mat('#1c2528', .2, .56),
  chipFace: mat('#313b40', .17, .66),
  copper: mat('#b97c44', .85, .27),
  gold: mat('#e5b96e', .76, .25),
  aluminum: mat('#e0e6e8', .83, .20),
  steel: mat('#a4b2b9', .8, .25),
  blackSteel: mat('#363f46', .58, .45),
  navy: mat('#36566c', .48, .42),
  blue: mat('#2878a8', .39, .49),
  orange: mat('#f08c2b', .19, .56),
  amber: mat('#f5ae39', .16, .43, '#ad5507'),
  led: mat('#74e5ac', .15, .4, '#32af66'),
  white: mat('#f7f5ed', .12, .63),
  whiteSocket: mat('#d2d8d0', .25, .58),
  rubber: mat('#374044', .27, .79),
};
function mat(color: string, metalness = 0.4, roughness = 0.6, emissive?: string) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness, ...(emissive ? { emissive, emissiveIntensity: .55 } : {}) });
}
const lineMat = new THREE.LineBasicMaterial({ color: '#515f65', transparent: true, opacity: .45 });
function block(g: THREE.Group, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material, edge = false) {
  const geometry = new THREE.BoxGeometry(w,h,d);
  const obj = new THREE.Mesh(geometry,m);
  obj.position.set(x,y,z);
  g.add(obj);
  if(edge) {
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), lineMat);
    edges.position.copy(obj.position);
    g.add(edges);
  }
  return obj;
}
function cylinder(g: THREE.Group, radius: number, depth: number, x: number, y: number, z: number, m: THREE.Material, seg=16, axis:'x'|'y'|'z'='y') {
  const o=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,depth,seg),m);
  o.position.set(x,y,z);
  if(axis==='z') o.rotation.x=Math.PI/2;
  if(axis==='x') o.rotation.z=Math.PI/2;
  g.add(o);
  return o;
}
function ring(g: THREE.Group, r: number, t: number, x:number,y:number,z:number,m:THREE.Material,axis:'x'|'y'|'z'='y') {
  const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,7,32),m);
  if(axis==='y')o.rotation.x=Math.PI/2;
  if(axis==='x')o.rotation.y=Math.PI/2;
  o.position.set(x,y,z);g.add(o);
}
function screw(g:THREE.Group,x:number,y:number,z:number,axis:'y'|'z'='y'){
  cylinder(g,2.2,1.3,x,y,z,M.raw,10,axis);
  if(axis==='y') {block(g,2.1,.5,.5,x,y+.8,z,M.blackSteel);block(g,.5,.5,2.1,x,y+.8,z,M.blackSteel);}
}
const texCache=new Map<string,THREE.CanvasTexture>();
function label(g:THREE.Group,text:string,x:number,y:number,z:number,w:number,h:number,opts:{face?:'top'|'front'|'rear';dark?:boolean;size?:number}={}) {
  const key=text+':'+(opts.dark?'D':'L')+':'+(opts.size||28);
  let tx=texCache.get(key);
  if(!tx){
    const c=document.createElement('canvas');c.width=512;c.height=128;
    const ctx=c.getContext('2d')!;
    if(opts.dark){ctx.fillStyle='rgba(21,26,29,.94)';ctx.fillRect(0,0,512,128);}
    ctx.fillStyle=opts.dark?'#f5f5ef':'#303d42';
    ctx.font='bold '+(opts.size||34)+'px Arial, sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(text,256,64,490);
    tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;texCache.set(key,tx);
  }
  const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  if((opts.face||'top')==='top')p.rotation.x=-Math.PI/2;
  if(opts.face==='rear')p.rotation.y=Math.PI;
  p.position.set(x,y,z);g.add(p);
}
function wire(g:THREE.Group,points:THREE.Vector3[],radius:number,m:THREE.Material){
  const path=new THREE.CatmullRomCurve3(points);
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,Math.max(12,points.length*7),radius,6,false),m);
  g.add(mesh);
}
function ventilation(g:THREE.Group,centerX:number,centerY:number,centerZ:number,n:number,dx:number,width:number,material:THREE.Material,axis:'top'|'rear'='top') {
  for(let i=0;i<n;i++){
    const x=centerX+(i-(n-1)/2)*dx;
    if(axis==='top')block(g,width,1,3,x,centerY,centerZ,material);
    else block(g,width,3,1,x,centerY,centerZ,material);
  }
}
function floorChassis(g:THREE.Group) {
  // 434mm enclosure width, 701mm deep, 86.8mm high, with 482mm total rack ears.
  block(g,434,2.7,699,0,1.6,0,M.chassis,true);
  block(g,426,1.1,691,0,3.4,0,M.raw);
  for(const x of [-214,214]){
    block(g,3.1,82.5,698,x,43.6,0,M.chassis,true);
    block(g,12,3.5,686,x-Math.sign(x)*5.8,82.8,0,M.raw);
    block(g,8.5,5,590,x-Math.sign(x)*7,15,-12,M.rails);
    for(let z=-305;z<305;z+=31)block(g,2.8,4.7,11,x-Math.sign(x)*2,53,z,M.blackSteel);
  }
  // Physical rack-ear overhangs and mounting holes.
  for(const x of [-231,231]){
    block(g,30,84,5,x,43,345,M.raw,true);
    for(const y of [15,44,73]){
      const hole=block(g,9,7,1.5,x,y,348,M.dark);
      hole.material=M.dark;
    }
    block(g,27,4,23,x,15,337,M.rails);
  }
  // Front and rear structural cross-members.
  for(const z of [-349,349]){
    block(g,429,6,3,0,5,z,M.steel);
    block(g,429,5,5,0,81,z,M.raw);
  }
  // Front drive aperture: two rows x eight carriers, with divider rails.
  for(const y of [5,42,81])block(g,421,3.4,40,0,y,331,M.blackSteel);
  for(let i=0;i<=8;i++)block(g,2.8,73,46,-210+i*52.5,43,329,M.graphite);
  for(let i=0;i<16;i++) {
    const x=-184 + (i%8)*52.5;
    const y=23+Math.floor(i/8)*37;
    block(g,49,32,66,x,y,310,M.panel);
    block(g,44,29,7,x,y,348,M.dark);
  }
  // Rear shell and air exhaust grille (gaps between port assemblies).
  block(g,429,6,3,0,82,-349,M.raw);
  for(let x=-202;x<205;x+=11)block(g,6.5,44,1.5,x,45,-350,M.dark);
  for(let x=-190;x<190;x+=46){screw(g,x,5,-342);screw(g,x,81,-342);}
  // Stamped inner structural ribs and board standoffs.
  for(const x of [-197,197]){
    block(g,9,11,390,x,13,-91,M.rails);
    for(let z=-258;z<90;z+=55)cylinder(g,4,8,x,19,z,M.raw);
  }
  for(let z=-230;z<200;z+=64)block(g,400,2,2,0,6,z,M.rails);
  label(g,'POWEREDGE R760',0,81.9,336,125,19,{dark:true,size:29});
}
function lid(g:THREE.Group) {
  block(g,430,2.8,696,0,0,0,M.raw,true);
  for(const x of [-208,208])block(g,4.5,11,695,x,-5,0,M.rails);
  for(let row=0;row<5;row++)for(let col=0;col<19;col++){
    block(g,7,1.2,2.3,-160+col*17.8,2.1,-224+row*18,M.graphite);
  }
  block(g,85,4,28,0,3.7,292,M.rails);
  block(g,54,5,12,0,6,304,M.panel,true);
  label(g,'R760 / SYSTEM COVER',0,2.5,-284,206,26,{dark:true});
  for(const x of [-199,199])for(const z of [-326,326])screw(g,x,2.4,z);
}
function duct(g:THREE.Group) {
  // Two separate shaped black airflow channels in a molded shared shroud.
  block(g,395,5,311,0,0,0,M.panel,true);
  for(const x of [-187,-97,0,97,187])block(g,5,30,309,x,-14,0,M.graphite);
  for(const x of [-105,105]) {
    block(g,171,3,128,x,-4,0,M.dark);
    for(let i=0;i<6;i++)block(g,4.5,2,47,x-54+i*20,3,95,M.blackSteel);
    block(g,134,5,11,x,5,142,M.graphite);
    label(g,'CPU AIR DUCT',x,3.8,-102,133,20,{dark:true,size:31});
  }
  for(const x of [-195,195])block(g,10,13,30,x,8,135,M.blue,true);
}
function backplaneLid(g:THREE.Group) {
  block(g,407,3.1,100,0,0,0,M.rails,true);
  block(g,397,2,94,0,1.8,0,M.raw);
  label(g,'DRIVE BACKPLANE',0,3,0,158,23,{size:31});
  for(const x of [-179,179])block(g,20,6,19,x,4,-27,M.blue);
  for(let x=-164;x<169;x+=17)block(g,6,.8,2,x,3.1,34,M.graphite);
}
function driveBank(g:THREE.Group) {
  for(let slot=0;slot<16;slot++){
    const column=slot%8;
    const row=Math.floor(slot/8);
    const x=(column-3.5)*52.5;
    const y=row*37-18.5;
    // Rear of caddy to front latch: actual storage is mostly within the bay.
    block(g,47.4,32,113,x,y,0,M.blackSteel,true);
    block(g,43.6,27,102,x,y,0,M.rails);
    block(g,43.8,30.7,4,x,y,58.8,M.dark,true);
    // Vertical finger pull and metal handle.
    block(g,4,26,4,x-19,y,62,M.raw);
    block(g,19,4,4,x+6,y-10,62,M.rails);
    block(g,32,12,4,x+5,y+8,62,M.graphite);
    block(g,6,3.5,2,x+17,y+10,65,M.led);
    block(g,4,3,2,x+10,y+10,65,M.amber);
    block(g,24,2,2,x+5,y+0,64,M.blackSteel);
    // Small sled rail and leading silver edge.
    block(g,46,2,110,x,y-15.2,0,M.chassis);
    if(column===0||column===7)block(g,1.7,28,108,x-24,y,0,M.steel);
  }
}
function backplane(g:THREE.Group) {
  block(g,417,71,5,0,0,0,M.pcb,true);
  for(let i=0;i<16;i++){
    const x=(i%8-3.5)*52.5, y=(i<8?-18.5:18.5);
    block(g,29,16,7,x,y,4,M.socket,true);
    block(g,19,2,8,x,y,8,M.gold);
    for(let k=-1;k<=1;k++)block(g,2,10,2,x+k*7,y,8,M.rails);
    block(g,20,8,2,x,y,-4,M.dark);
  }
  for(let x=-192;x<200;x+=17){
    block(g,.7,34,1,x,0,-3.2,M.gold);
    for(let y of [-25,25])block(g,3,1,2,x,y,-3.4,M.steel);
  }
  // Two distinct host connectors and their latch tabs.
  for(const x of [-166,166]) {
    block(g,36,12,14,x,2,-10,M.socket,true);
    block(g,34,4,4,x,2,-18,M.blue);
  }
}
function fanHousing(g:THREE.Group,x:number) {
  block(g,65.5,68,65.5,x,0,0,M.panel,true);
  block(g,59,64,59,x,0,-1,M.dark);
  for(const front of [-33,33]){
    ring(g,26.8,2.2,x,0,front,M.rails,'z');
    for(let a=0;a<7;a++){
      const theta=a*Math.PI*2/7;
      const blade=block(g,23,10,1.5,x+Math.cos(theta)*13,Math.sin(theta)*13,front+(front<0?1.5:-1.5),M.graphite);
      blade.rotation.z=theta+.43;
    }
    cylinder(g,9.6,3,x,0,front+(front<0?2:-2),M.plastic,18,'z');
  }
  // Vented roof, orange hot-swap release and blue fan-cage latch.
  block(g,63,4,67,x,36,0,M.graphite,true);
  for(let row=0;row<3;row++)for(let i=0;i<5;i++) {
    block(g,6,1,20,x-21+i*11,38.2,-18+row*18,M.dark);
  }
  block(g,17,8,16,x,43.5,1,M.orange,true);
  block(g,11,2,2,x,47.8,3,M.blackSteel);
}
function fanCage(g:THREE.Group) {
  block(g,415,7,70,0,-37,0,M.rails,true);
  for(const x of [-208,208])block(g,4,73,73,x,0,0,M.raw);
  for(let k=0;k<=6;k++)block(g,3.2,74,75,-205+k*68.35,0,0,M.rails);
  for(let i=0;i<6;i++)fanHousing(g,(i-2.5)*68.5);
  // Distinct blue release levers against black/orange fan modules.
  for(const x of [-208,208]){
    block(g,8,21,11,x,49,0,M.blue,true);
    block(g,21,4,16,x,61,0,M.blue);
  }
  block(g,416,3,73,0,39,0,M.rails);
}
function sockets(g:THREE.Group) {
  // PCB traces distributed on substrate, populated chiplets & regulator banks.
  block(g,414,5,416,0,0,0,M.pcb,true);
  for(let i=0;i<110;i++){
    const x=-200+((i*59)%397);
    const z=-202+((i*113)%394);
    block(g,i%3?18:42,.3,.55,x,3.05,z,M.gold);
  }
  for(let i=0;i<56;i++){
    const x=-190+((i*71)%380);
    const z=-189+((i*47)%359);
    block(g,(i%4?9:14),.8,(i%3?5:8),x,3.2,z,M.graphite);
  }
  for(const x of [-106,106]) {
    block(g,93,3.9,110,x,4.8,0,M.socket,true);
    block(g,86,1.5,100,x,7.6,0,M.raw,true);
    block(g,72,2,89,x,9.0,0,M.graphite);
    for(const sx of [-1,1]) for(const sz of [-1,1]){
      cylinder(g,5.5,4,x+sx*42,11.4,sz*50,M.rails,10);
      screw(g,x+sx*42,14,sz*50);
    }
  }
  // DDR5 DIMM channel sockets, 32 in two CPU zones.
  for(const side of [-1,1]){
    const cx=side*106;
    for(const bankSide of [-1,1]){
      for(let group=0;group<2;group++){
        for(let slot=0;slot<4;slot++){
          const x=cx+bankSide*(58+slot*10.3);
          const z=group===0?-102:95;
          block(g,7.8,3.5,126,x,5,z,M.socket);
          block(g,8,7,7,x,9,z-66,M.whiteSocket);
          block(g,8,7,7,x,9,z+66,M.whiteSocket);
          for(let n=0;n<12;n++){
            const vz=z-54+n*9.8;
            block(g,1.4,.8,4.2,x,7.1,vz,M.gold);
          }
        }
      }
    }
  }
  // VRMs, inductors, PCIe 5.0 edge slots and board ID labels.
  for(const cx of [-106,106]){
    for(let n=0;n<7;n++){
      block(g,10,10,11,cx-32+n*11,10,69,M.graphite);
      block(g,5,7,5,cx-32+n*11,16,85,M.copper);
    }
  }
  for(let i=0;i<6;i++)block(g,67,8,4,-169+i*65,7,-192,M.socket);
  for(const x of [-195,195])for(const z of [-191,191])screw(g,x,3.6,z);
  label(g,'POWEREDGE R760',0,3.5,173,128,17,{dark:true,size:32});
}
function processorModule(g:THREE.Group,x:number) {
  block(g,88,3,99,x,-27,0,M.pcbEdge,true);
  block(g,76,4.5,85,x,-23,0,M.gold,true);
  block(g,80,5,90,x,-18,0,M.copper,true);
  block(g,81,6,93,x,-12,0,M.steel);
  // Heatsink is a tall array of genuine thin aluminum fins and copper heatpipes.
  block(g,91,4,111,x,-8,0,M.aluminum,true);
  for(let i=0;i<28;i++){
    const finX=x-42+i*3.1;
    block(g,1.65,46,104,finX,17,0,M.aluminum);
    for(let zz of [-41,41])block(g,1.9,2.6,6,finX,40,zz,M.steel);
  }
  for(const z of [-29,0,29]){
    const pipe=cylinder(g,3.2,89,x,16,z,M.copper,11,'x');pipe.visible=true;
  }
  for(const xx of [-42,42])for(const zz of [-50,50]){
    cylinder(g,5.5,8,x+xx,7,zz,M.rails,10);
    cylinder(g,3,10,x+xx,14,zz,M.copper,10);
    screw(g,x+xx,19.6,zz);
  }
  label(g,'PHM · Xeon',x,41,0,73,15,{dark:true,size:34});
}
function processors(g:THREE.Group) {
  for(const x of [-106,106])processorModule(g,x);
}
function memory(g:THREE.Group) {
  for(const side of [-1,1]){
    const cx=side*106;
    for(const bankSide of [-1,1])for(let group=0;group<2;group++)for(let slot=0;slot<4;slot++){
      const x=cx+bankSide*(58+slot*10.3);
      const z=group===0?-102:95;
      // White slot tabs from system-board sockets remain below the DIMMs.
      block(g,2.7,32,124,x,0,z,M.dimm,true);
      block(g,3,4,122,x,-17,z,M.gold);
      for(let n=0;n<8;n++){
        const zz=z-52+n*14.4;
        block(g,4.8,15,9,x,0,zz,M.greenChip,true);
      }
      block(g,3.8,3,114,x,17.5,z,M.pcb);
      for(let n=0;n<6;n++){
        block(g,4.1,1.4,1.5,x,13,z-44+n*17.2,M.gold);
      }
    }
  }
}
function risers(g:THREE.Group) {
  const cfg=[
    {x:-127,w:112,name:'RISER 4'},
    {x:-2,w:114,name:'RISER 3'},
    {x:119,w:108,name:'RISER 1'},
  ];
  for(const q of cfg){
    // open metal bracket enclosure with realistic ribs and dark upper face.
    block(g,q.w,3,122,q.x,-30,0,M.rails,true);
    for(const sx of [-1,1]){
      block(g,3,72,118,q.x+sx*(q.w/2-3),3,0,M.raw,true);
      block(g,5,9,126,q.x+sx*(q.w/2-1),37,0,M.rails);
    }
    block(g,q.w-10,2.8,112,q.x,40,0,M.raw,true);
    block(g,q.w-20,2,67,q.x,42,-13,M.panel);
    label(g,q.name,q.x,43.1,-13,q.w-29,32,{dark:true,size:39});
    // PCB riser card and PCIe fingers underneath.
    block(g,q.w-21,26,4,q.x,-10,19,M.pcb,true);
    block(g,q.w-30,5,4,q.x,-23,19,M.gold);
    block(g,4,22,84,q.x-18,-15,-10,M.chip);
    block(g,4,31,64,q.x+19,-12,-10,M.pcbEdge);
    // Ventilation cuts in the silver cover.
    for(let i=0;i<7;i++)block(g,7,1,3,q.x-37+i*12,42,39,M.graphite);
    for(const sx of [-1,1])block(g,13,8,15,q.x+sx*(q.w/2-6),39,50,M.blue,true);
    screw(g,q.x-42,43,50);screw(g,q.x+42,43,-49);
  }
}
function raidController(g:THREE.Group) {
  block(g,78,3.5,81,0,-8,0,M.pcb,true);
  block(g,64,6,55,0,-2,4,M.steel);
  for(let i=0;i<11;i++)block(g,2.1,14,48,-28+i*5.7,7,4,M.aluminum);
  block(g,28,5,12,-18,-3,34,M.socket);
  block(g,24,4,11,19,-3,34,M.socket);
  block(g,22,12,22,-25,0,-28,M.chip,true);
  for(let i=0;i<8;i++)block(g,4,5,4,17+(i%4)*10,0,-27+(i<4?0:10),M.blackSteel);
  label(g,'PERC',0,15,4,52,15,{dark:true});
}
function psuModule(g:THREE.Group,x:number) {
  block(g,61,72,174,x,0,0,M.graphite,true);
  for(const y of [-29,29])block(g,59,4,170,x,y,0,M.raw);
  for(const xx of [-30,30])block(g,2.8,66,169,x+xx,0,0,M.rails);
  block(g,58,66,5,x,0,-86,M.raw,true);
  ring(g,22,2.5,x,4,-89,M.blackSteel,'z');
  for(let k=0;k<9;k++){
    const a=2*Math.PI*k/9;
    const blade=block(g,28,4,1,x+Math.cos(a)*11,4+Math.sin(a)*11,-89,M.dark);
    blade.rotation.z=a;
  }
  block(g,23,15,5,x,-18,-90,M.dark,true);
  block(g,16,8,4,x,-17,-93,M.blackSteel);
  block(g,8,4,2,x+22,25,-90,M.led);
  block(g,8,6,6,x-21,26,-87,M.orange);
  for(let i=0;i<12;i++){
    block(g,2.3,2,38,x-22+(i%6)*9,37, -49+Math.floor(i/6)*64,M.dark);
  }
  label(g,'PSU',x,38,16,42,15,{dark:true,size:35});
}
function power(g:THREE.Group) {
  // Both modules at rear outer edges, leaving the central riser assemblies.
  for(const x of [-182,182])psuModule(g,x);
}
function ioCard(g:THREE.Group) {
  block(g,142,49,10,0,0,0,M.graphite,true);
  block(g,122,4,18,0,-25,2,M.pcb);
  for(let i=0;i<4;i++){
    const x=-47+i*31;
    block(g,25,22,5,x,7,-8,M.rails,true);
    block(g,19,15,2,x,6,-11,M.dark);
    for(let j=0;j<5;j++)block(g,2,1.2,2,x-7+j*3.8,0,-12.6,M.gold);
    block(g,4,3,3,x+10,16,-11,M.led);
  }
  block(g,14,12,4,-61,-17,-9,M.blue);
  block(g,18,8,3,54,-17,-10,M.dark);
}
function boss(g:THREE.Group) {
  block(g,93,49,29,0,0,0,M.raw,true);
  block(g,84,41,3,0,0,-17,M.graphite,true);
  for(const x of [-21,21]){
    block(g,33,10,5,x,0,-20,M.panel,true);
    block(g,4,3,2,x+12,15,-19,M.led);
  }
  block(g,85,3,25,0,25,0,M.rails);
  label(g,'BOSS-N1',0,27,0,76,16,{size:32});
}
export function makePartGeometry(id:ComponentId):THREE.Group {
  const group = new THREE.Group();
  group.name=id;
  const methods:Record<ComponentId,(g:THREE.Group)=>void>={
    chassis:floorChassis,cover:lid,shroud:duct,backplaneCover:backplaneLid,
    drives:driveBank,backplane, fans:fanCage,board:sockets,
    cpus:processors,dimms:memory,risers,perc:raidController,
    psus:power,network:ioCard,boss,
  };
  methods[id](group);
  group.traverse(obj=>{
    if(obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) obj.userData.partId=id;
  });
  return group;
}
