import * as T from 'three';

// Mac mini M4 Pro (2024) — original, research-grounded procedural educational model.
// +Z = front connectors, −Z = rear Thunderbolt/network. Millimetres.
const mat=(color:string,metalness=.35,roughness=.55,emissive?:string)=>
  new T.MeshStandardMaterial({color,metalness,roughness,...(emissive?{emissive,emissiveIntensity:.35}:{})});
const M={
 aluminum:mat('#bec2c5',.87,.29),
 silver:mat('#e1e3e3',.82,.24),
 rim:mat('#9ea5aa',.83,.28),
 edge:mat('#dce0e0',.8,.25),
 black:mat('#141719',.33,.69),
 dark:mat('#24272c',.4,.65),
 plast:mat('#292b30',.2,.76),
 graphite:mat('#45484d',.51,.45),
 gray:mat('#71767d',.52,.4),
 pcb:mat('#191e22',.15,.78),
 trace:mat('#8e8e8d',.47,.48),
 copper:mat('#c47d49',.84,.28),
 copper2:mat('#e2a773',.82,.27),
 copperDark:mat('#926447',.79,.32),
 solder:mat('#d5d2c5',.68,.32),
 gold:mat('#d9b87d',.74,.31),
 chip:mat('#282d2f',.25,.5),
 dram:mat('#333a3e',.21,.43),
 blue:mat('#5a849e',.38,.43),
 white:mat('#e3e4dc',.23,.63),
 glow:mat('#a6e6d1',.11,.22,'#45af89'),
 antenna:mat('#949e9f',.61,.44),
 ferrite:mat('#48484a',.26,.68)
};
const edgeMat=new T.LineBasicMaterial({color:'#9fa6a9',transparent:true,opacity:.42});
function box(g:T.Group,w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material,ed=false){
  const geom=new T.BoxGeometry(w,h,d),o=new T.Mesh(geom,m);
  o.position.set(x,y,z);g.add(o);
  if(ed){const l=new T.LineSegments(new T.EdgesGeometry(geom),edgeMat);l.position.copy(o.position);g.add(l);}
  return o;
}
function cyl(g:T.Group,r:number,h:number,x:number,y:number,z:number,m:T.Material,n=32,axis:'y'|'z'='y'){
  const o=new T.Mesh(new T.CylinderGeometry(r,r,h,n),m);
  o.position.set(x,y,z);if(axis==='z')o.rotation.x=Math.PI/2;
  g.add(o);return o;
}
function ring(g:T.Group,r:number,minor:number,x:number,y:number,z:number,m:T.Material,axis:'y'|'z'='y'){
  const o=new T.Mesh(new T.TorusGeometry(r,minor,8,80),m);
  o.rotation.x=axis==='y'?-Math.PI/2:0;
  o.position.set(x,y,z);g.add(o);return o;
}
function wire(g:T.Group,points:number[][],thickness:number,m:T.Material){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...(p as [number,number,number]))));
  const mesh=new T.Mesh(new T.TubeGeometry(curve,Math.max(18,points.length*11),thickness,8,false),m);
  g.add(mesh);return mesh;
}
function screw(g:T.Group,x:number,y:number,z:number,size=1.25){
  cyl(g,size,.6,x,y,z,M.solder,9);
  box(g,size*1.1,.15,.3,x,y+.38,z,M.black);
}
function roundedShape(w:number,d:number,r:number){
  const s=new T.Shape(),x=-w/2,y=-d/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
  s.lineTo(x+w,y+d-r);s.quadraticCurveTo(x+w,y+d,x+w-r,y+d);
  s.lineTo(x+r,y+d);s.quadraticCurveTo(x,y+d,x,y+d-r);
  s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  s.closePath();return s;
}
function roundedBlock(g:T.Group,w:number,h:number,d:number,r:number,x:number,y:number,z:number,m:T.Material){
  const geometry=new T.ExtrudeGeometry(roundedShape(w,d,r),{
    depth:h,steps:1,bevelEnabled:true,bevelSize:.45,bevelThickness:.42,bevelSegments:2,curveSegments:9
  });
  geometry.rotateX(-Math.PI/2);geometry.translate(0,-h/2,0);
  const o=new T.Mesh(geometry,m);o.position.set(x,y,z);g.add(o);return o;
}
function roundedRing(g:T.Group,w:number,h:number,d:number,r:number,thick:number,x:number,y:number,z:number,m:T.Material) {
  const shape=roundedShape(w,d,r);
  const internal=roundedShape(w-thick*2,d-thick*2,Math.max(1,r-thick));
  const hole=new T.Path();
  const pts=internal.getPoints(52).reverse();
  hole.moveTo(pts[0].x,pts[0].y);
  for(let i=1;i<pts.length;i++)hole.lineTo(pts[i].x,pts[i].y);
  hole.closePath();shape.holes.push(hole);
  const geo=new T.ExtrudeGeometry(shape,{depth:h,steps:1,bevelEnabled:false,curveSegments:12});
  geo.rotateX(-Math.PI/2);geo.translate(0,-h/2,0);
  const mesh=new T.Mesh(geo,m);mesh.position.set(x,y,z);g.add(mesh);return mesh;
}
const labelCache=new Map<string,T.CanvasTexture>();
function label(g:T.Group,text:string,w:number,h:number,x:number,y:number,z:number,rotation='up',color='#d1d4d5'){
  const key=text+color;
  let texture=labelCache.get(key);
  if(!texture){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=100;
    const ctx=canvas.getContext('2d')!;
    ctx.clearRect(0,0,512,100);ctx.fillStyle=color;
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 31px Arial, sans-serif';
    ctx.fillText(text,256,52,497);texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    labelCache.set(key,texture);
  }
  const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,transparent:true,side:T.DoubleSide,depthWrite:false}));
  if(rotation==='up')mesh.rotation.x=-Math.PI/2;
  if(rotation==='rear')mesh.rotation.y=Math.PI;
  mesh.position.set(x,y,z);g.add(mesh);return mesh;
}
// Small silver logo intended to evoke the familiar top surface. This is not imported Apple CAD.
function appleMark(g:T.Group){
  const s=new T.Shape();
  s.moveTo(-3,8);
  s.bezierCurveTo(-8,13,-14,8,-14,1);
  s.bezierCurveTo(-16,-5,-8,-15,-3,-15);
  s.bezierCurveTo(0,-15,1,-12,4,-12);
  s.bezierCurveTo(7,-12,10,-16,12,-12);
  s.bezierCurveTo(14,-9,17,-6,16,-3);
  // right-side bite, a pair of dents
  s.bezierCurveTo(12,-3,10,0,12,3);
  s.bezierCurveTo(13,5,15,5,16,6);
  s.bezierCurveTo(12,13,6,14,2,9);
  s.bezierCurveTo(0,8,-2,8,-3,8);
  s.closePath();
  const logo=new T.Mesh(new T.ShapeGeometry(s,12),mat('#818689',.82,.3));
  logo.rotation.x=-Math.PI/2;logo.position.y=25.09;g.add(logo);
  const leaf=new T.Shape();
  leaf.moveTo(-1,11);leaf.bezierCurveTo(-1,17,2,20,8,20);
  leaf.bezierCurveTo(8,14,5,12,-1,11);
  const lf=new T.Mesh(new T.ShapeGeometry(leaf,12),mat('#818689',.82,.3));
  lf.rotation.x=-Math.PI/2;lf.position.y=25.09;g.add(lf);
}
function housing(g:T.Group){
  // Top-down: polished aluminum lid and a thin-walled hollow unibody.
  roundedRing(g,127,46.2,127,13,3.4,0,-1.15,0,M.aluminum);
  roundedBlock(g,127,3.7,127,13,0,23.05,0,M.silver);
  roundedRing(g,124,1.1,124,12,1.2,0,-23.0,0,M.rim);
  roundedRing(g,126.3,1.05,126.3,12.5,1.0,0,20.45,0,M.edge);
  appleMark(g);
  // Chamfered bottom and bright top edge.
  roundedRing(g,125,1.2,125,12,1.8,0,21.2,0,M.silver);
  // Front modular port openings, rendered recessed within the unibody edge.
  for(const x of [-31,-10]){
    roundedBlock(g,12,5.7,1.2,2.4,x,-1.5,63.85,M.rim);
    box(g,8.5,2.55,.6,x,-1.5,64.66,M.black);
    box(g,5.1,.5,.4,x,-1.5,65.02,M.gold);
  }
  cyl(g,3.45,1,27,-1.0,64.15,M.graphite,30,'z');
  cyl(g,2.2,1.4,27,-1.0,64.75,M.black,28,'z');
  cyl(g,.78,1.9,27,-1,65.4,M.gold,24,'z');
  // Tiny white power LED on the front.
  cyl(g,1.4,1.4,44,-1.2,64,M.glow,24,'z');
  // Rear cutouts: AC, Ethernet, HDMI, three Thunderbolt 5.
  const ports=[[-49,13.5,10],[-24,17,12],[-2,18,8],[22,11,7],[37,11,7],[52,11,7]];
  for(let i=0;i<ports.length;i++){
    const [x,w,h]=ports[i];
    roundedBlock(g,w,h,.9,Math.min(2.2,h*.25),x,-3,-63.8,M.rim);
    box(g,w-3,h-3,.55,x,-3,-64.65,M.black);
    if(i===1){
      for(let p=0;p<7;p++)box(g,1,.8,.6,x-6+p*2,-7,-65.0,M.gold);
    }
    if(i>=3)box(g,w-5,.55,.6,x,-3,-65.05,M.solder);
  }
}
function bottom(g:T.Group){
  roundedBlock(g,116,3.3,116,12,0,0,0,M.black);
  // 70 radial intake slots, shaped as slivers around the broad black circular foot.
  const count=76;
  for(let i=0;i<count;i++){
    const t=(i/count)*Math.PI*2;
    const radius=49.5;
    const sliver=box(g,1.35,.2,7.9,Math.cos(t)*radius,-2.02,Math.sin(t)*radius,M.graphite);
    sliver.rotation.y=-t;
  }
  ring(g,48,1.0,0,-1.95,0,M.rim);
  ring(g,39,1.0,0,-1.9,0,M.plast);
  cyl(g,40,.75,0,-2.1,0,M.plast,80);
  cyl(g,35,.3,0,-2.65,0,M.black,80);
  label(g,'Mac mini',57,11,0,-2.83,5,'up','#41474a');
  // Four clip points visible from inside, power button flex side.
  for(const x of [-48,48])for(const z of [-48,48]){
    box(g,5,2.5,5,x,2.7,z,M.graphite,true);
    screw(g,x,4.3,z,1.1);
  }
}
function antenna(g:T.Group){
  roundedRing(g,115,2.8,115,11.6,4.4,0,0,0,M.antenna);
  ring(g,47,2.6,0,1.2,0,M.dark);
  for(let i=0;i<66;i++){
    const t=i/66*Math.PI*2;
    const x=Math.cos(t)*45.0,z=Math.sin(t)*45.0;
    const fin=box(g,1.2,.3,5,x,1.9,z,M.black);
    fin.rotation.y=-t;
  }
  // Little black rectangular WLAN/Bluetooth antenna modules at the corners.
  for(const [x,z] of [[-43,-43],[43,-43],[43,43],[-43,43]]){
    box(g,17,3.5,10,x,2.2,z,M.plast,true);
    box(g,11,.9,6,x,4.5,z,M.gold);
    screw(g,x,4.9,z,1.3);
  }
  // RF coax routes from antennas to a connector on the logic board.
  wire(g,[[-44,3,-39],[-31,3,-27],[-15,3,23],[2,2.5,35]],.65,M.graphite);
  wire(g,[[44,3,-40],[31,3,-15],[33,3,25],[17,2.8,35]],.65,M.graphite);
}
function button(g:T.Group){
  box(g,13,3,12,0,0,0,M.black,true);
  cyl(g,4.7,2.6,0,-1.9,0,M.graphite,32);
  cyl(g,2.6,.45,0,-3.4,0,M.silver,24);
  box(g,2.8,.6,15,-5,1,7,M.gold);
  wire(g,[[-3,2,0],[-7,2,6],[-14,3,13],[-20,6,21]],1.1,M.copper);
}
function battery(g:T.Group){
  cyl(g,12.2,2.3,0,0,0,M.black,46);
  cyl(g,9.4,2.9,0,1.3,0,M.silver,56);
  ring(g,9.15,.6,0,3,0,M.rim);
  label(g,'CR2032',17,4,0,2.95,0,'up','#6b7274');
  for(const x of [-10.8,10.8])box(g,2,1.8,6,x,2.3,0,M.gold);
}
function blower(g:T.Group){
  // The signature large black centrifugal squirrel-cage blower.
  roundedBlock(g,108,6.5,107,14,0,-6.6,0,M.black);
  cyl(g,47.7,8.6,0,-1,0,M.plast,88);
  ring(g,48,1.9,0,4.0,0,M.graphite);
  // 72 closely packed radial vanes through the exposed side grille.
  for(let i=0;i<72;i++){
    const t=i*Math.PI*2/72;
    const r=35.8;
    const blade=box(g,1.5,7.4,15.5,Math.cos(t)*r,4,Math.sin(t)*r,M.graphite);
    blade.rotation.y=-(t+.38);
  }
  cyl(g,21,4.5,0,8.8,0,M.dark,64);
  cyl(g,12.5,1.4,0,11.5,0,M.black,64);
  ring(g,30,1.6,0,11.2,0,M.black);
  // Top fan cover is sculpted with 3 large arms and cutout slots.
  for(let k=0;k<3;k++){
    const a=k*2*Math.PI/3;
    const arm=box(g,58,1.7,9,Math.cos(a)*12,11.5,Math.sin(a)*12,M.black);
    arm.rotation.y=-a;
  }
  cyl(g,9,1.8,0,12.4,0,M.graphite,36);
  for(const [x,z] of [[-47,-47],[47,-47],[-47,47],[47,47]])screw(g,x,4.4,z);
  // Flat black ribbon and tiny connector tail.
  box(g,16,.8,6,37,4,44,M.dark);
  wire(g,[[37,4,43],[47,5,43],[52,7,29]],1.1,M.copper);
}
function heatsink(g:T.Group){
  // Copper M4 Pro heatsink has compact, high-density fins and curved heat pipes.
  box(g,84,2.8,77,0,-7,0,M.copperDark,true);
  box(g,70,3.6,65,-2,-3,0,M.copper,true);
  for(let i=0;i<40;i++){
    box(g,1.05,14,52,-33+i*1.7,5,-9,M.copper2);
  }
  for(let j=0;j<3;j++){
    const z=-22+j*17;
    wire(g,[[-36,0,z],[-18,10,z-4],[5,11,z-1],[28,4,z+6],[38,2,z+12]],2.35,M.copper,);
  }
  for(const [x,z] of [[-39,-33],[39,-33],[-39,33],[39,33]]){
    cyl(g,3.2,3.5,x,3,z,M.silver,12);screw(g,x,5.1,z);
  }
  label(g,'M4 PRO',35,7,0,12,17,'up','#8a532e');
}
function speaker(g:T.Group){
  roundedBlock(g,27,8,22,5,0,0,0,M.plast);
  cyl(g,8.3,2.5,0,5,0,M.graphite,32);
  ring(g,8.4,.85,0,6.3,0,M.black);
  cyl(g,3,1.4,0,7.5,0,M.black,24);
  for(const x of [-10,10])box(g,3,4,4,x,-2,0,M.gray);
  wire(g,[[10,-2,0],[19,-1,8],[21,1,13]],.85,M.copper);
}
function frontPorts(g:T.Group){
  box(g,96,3,12,0,-6,0,M.pcb,true);
  for(const x of [-31,-10]){
    roundedBlock(g,13,7,7,2,x,0,4,M.silver);
    box(g,9,3.1,2,x,0,8,M.black);
    box(g,6,.65,3,x,0,9,M.gold);
    for(const z of [-4,4])box(g,3,1,1,x,z/4,4,M.solder);
  }
  cyl(g,5.6,9,27,-.3,1,M.silver,24,'z');
  cyl(g,3,9.1,27,-.3,5,M.black,24,'z');
  cyl(g,1,9.3,44,-.3,5,M.white,16,'z');
  for(let i=0;i<12;i++){
    const x=-47+i*8.1;
    box(g,2,2.5,2,x,-3,-4,M.graphite);
  }
  wire(g,[[-38,-6,-5],[-26,-8,-14],[-15,-8,-19]],1,M.gold);
}
function rearPorts(g:T.Group){
  box(g,113,3,12,0,-7,0,M.pcb,true);
  const ports=[[-48,13,10],[-24,17,12],[-2,18,8],[22,11,7],[37,11,7],[52,11,7]];
  for(let i=0;i<ports.length;i++){
    const [x,w,h]=ports[i];
    roundedBlock(g,w,h,6,1.4,x,0,-2,M.silver);
    box(g,w-3,h-3,2,x,0,-5.7,M.black);
    if(i===1){
      for(let pin=0;pin<8;pin++)box(g,1,.55,1,x-7+pin*2,-3.1,-7,M.gold);
    }
    if(i>=3)box(g,w-5,1,2,x,0,-6.8,M.gold);
    if(i===2)box(g,w-5,2,2,x,0,-6.8,M.graphite);
  }
  for(let i=0;i<8;i++)box(g,4,4,4,-44+i*12,-2,5,M.graphite);
}
function solidLogicBoard(g:T.Group){
  roundedBlock(g,111,2.8,108,7,0,-2,0,M.pcb);
  // Two broad cutouts at the outer edge and gold perimeter plated contacts.
  for(let i=0;i<10;i++){
    const x=-50+(i*13)%101,z=-48+(i*19)%97;
    box(g,3,.4,7,x,0.1,z,M.solder);
  }
  for(let i=0;i<110;i++){
    const x=-52+(i*29)%103,z=-52+(i*53)%103;
    box(g,(i%4?5:12),.35,.44,x,2.05,z,i%4?M.trace:M.gold);
  }
  // processor substrate, adjacent unified memory and SRAM package region.
  box(g,43,1.6,39,-8,2.6,-5,M.solder,true);
  box(g,38,1.7,35,-8,3.8,-5,M.chip);
  // Board-level regulators, inductors, capacitors, connectors
  for(let i=0;i<25;i++){
    const x=-52+(i*11)%100,z=-49+(i*23)%97;
    if(Math.abs(x+8)<30 && Math.abs(z+5)<25)continue;
    box(g,3+(i%3)*2,3+(i%4),4+(i%5),x,4.5,z,i%3?M.chip:M.graphite);
  }
  for(let i=0;i<20;i++){
    const x=30+(i%4)*5,z=-41+Math.floor(i/4)*16;
    box(g,3,3.1,4,x,4.3,z,M.solder);
  }
  // M4 Pro SSD socket and IO connector.
  box(g,27,6.5,5,38,5,15,M.black,true);
  for(let i=0;i<15;i++)box(g,1,.4,3,26+i*1.6,9,15,M.gold);
  for(const x of [-49,49])for(const z of [-49,49])screw(g,x,1.2,z,1.35);
  label(g,'820-LOGIC',29,6,-33,2.1,33,'up','#848b8e');
}
function soc(g:T.Group){
  box(g,43,3.3,38,0,0,0,M.dark,true);
  box(g,35,2.6,31,0,2,0,M.solder,true);
  box(g,24,1,22,-5,3.8,0,M.gray);
  for(let i=0;i<12;i++){
    box(g,1.2,.25,1.4,-16+(i%6)*6,4.5,-13+Math.floor(i/6)*28,M.gold);
  }
  label(g,'M4 PRO',26,7,-4.3,4.5,0,'up','#363c3c');
}
function unified(g:T.Group){
  for(const x of [-7,8]){
    box(g,14,2.6,24,x,0,0,M.dram,true);
    box(g,10,.15,16,x,1.45,0,M.chip);
    label(g,'LPDDR5X',10,3,x,1.6,0,'up','#8c9499');
  }
}
function ssd(g:T.Group){
  // M4 Pro has its own longer proprietary blade, not a generic M.2 NVMe drive.
  roundedBlock(g,50,1.5,22,2,0,0,0,M.pcb);
  for(const x of [-13,8]){
    box(g,17,2.6,14,x,2,0,M.chip,true);
    label(g,'NAND',13,4,x,3.5,0,'up','#a5aaab');
  }
  box(g,13,.7,14,24,.7,0,M.gold);
  for(let i=0;i<11;i++)box(g,.75,.1,12,19+i*.85,1.1,0,M.solder);
  cyl(g,2.9,1.4,-24,2.3,0,M.silver,20);
  screw(g,-24,3.3,0,1.4);
}
function power(g:T.Group){
  // Open-layout high-voltage SMPS board beneath the lid; no PC-style PSU box.
  roundedBlock(g,111,2.8,108,7,0,-1,0,M.pcb);
  // Isolation zone and switching-section traces.
  for(let i=0;i<48;i++){
    const x=-53+(i*29)%103,z=-50+(i*39)%101;
    box(g,(i%4?6:15),.23,.5,x,2.4,z,M.gold);
  }
  for(const [x,z,r] of [[-35,-26,8],[-17,-27,8],[19,18,6],[38,24,6]]){
    cyl(g,r,15,x,10,z,M.black,38);
    cyl(g,r-1,.5,x,18,z,M.silver,38);
    for(let i=0;i<4;i++){
      const t=i*Math.PI/2;
      box(g,.4,.18,r*.72,x+Math.cos(t)*r*.42,18.4,z+Math.sin(t)*r*.42,M.black);
    }
  }
  for(const [x,z] of [[-20,18],[16,-25]]){
    cyl(g,10,6,x,6,z,M.ferrite,32);
    ring(g,9.3,1.8,x,9,z,M.copper, 'y');
    ring(g,6.2,1.9,x,9.6,z,M.copper2,'y');
  }
  for(const [x,z] of [[37,-21],[-39,22]]){
    box(g,23,14,23,x,9,z,M.graphite,true);
    box(g,21,2,20,x,17,z,M.black);
    for(let i=0;i<5;i++)box(g,2,1,16,x-8+i*4,17.8,z,M.solder);
  }
  // Tiny toroidal transformer with copper winding detail
  for(let i=0;i<3;i++){
    const x=-27+i*21;
    cyl(g,6,7,x,7,41,M.ferrite,26);
    ring(g,5.6,1.6,x,11,41,M.copper);
  }
  // AC input and board-to-board contacts.
  box(g,23,8,13,-43,6,-39,M.silver,true);
  box(g,18,5,12,-43,6,-46,M.black);
  box(g,19,7,9,47,5,-35,M.white);
  for(let i=0;i<12;i++)box(g,.85,2,4,39+i*1.3,10,-35,M.gold);
  for(let i=0;i<12;i++)box(g,2,2,3,-52+i*9,3,49,i%2?M.solder:M.graphite);
  label(g,'AC-DC 155W MAX',51,8,3,3.1,-40,'up','#c5c8c6');
}
const constructors:Record<string,(g:T.Group)=>void> = {
  housing,bottom,antenna,button,battery,blower,heatsink,speaker,
  frontIO:frontPorts,rearIO:rearPorts,ssd,logic:solidLogicBoard,
  soc,memory:unified,power
};
export function makeMacMiniPart(id:string):T.Group{
  const g=new T.Group();g.name='macmini:'+id;
  const build=constructors[id];
  if(!build)throw new Error('Unknown Mac mini assembly: '+id);
  build(g);
  // The M4 Pro power board is directly under the aluminum roof; components face inward.
  if(id==='power')g.rotation.z=Math.PI;
  g.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.LineSegments)o.userData.partId=id;});
  return g;
}
