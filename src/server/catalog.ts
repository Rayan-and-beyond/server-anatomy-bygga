import type { Vec3 } from '../lib/types';
import { COMPONENTS, WALKTHROUGH } from './data';

export type MachineId = 'r760' | 'xe9680' | 'dgxb200' | 'gb200rack';
export interface Assembly {
  id: string;
  label: string;
  summary: string;
  detail: string;
  position: Vec3;
  size: Vec3;
  extract: Vec3;
  geometry: string;
  absentAtRest?: boolean;
}
export interface GuideStep {
  title: string;
  text: string;
  focus: string;
  removed: string[];
  safety?: string;
}
export interface Machine {
  id: MachineId;
  name: string;
  sub: string;
  kicker: string;
  units: string;
  gpuCount: string;
  dimensions: [number,number,number];
  reference: string;
  description: string;
  assemblies: Assembly[];
  guide: GuideStep[];
  view: { az:number;el:number;distance:number };
  scale: number;
}

const r760Assemblies:Assembly[]=COMPONENTS.map(c=>({
  id:c.id,label:c.name,summary:c.role,detail:c.description,
  position:c.position,size:c.size,extract:c.extraction,
  geometry:'r760:'+c.id,
  absentAtRest:['cover','shroud','backplaneCover'].includes(c.id)
}));
const r760Guide:GuideStep[]=WALKTHROUGH.map(s=>({
  title:s.title,text:s.description,focus:s.target,removed:s.remove,safety:s.note
}));

const xe9680Assemblies:Assembly[]=[
  {id:'chassis',label:'6U steel chassis',summary:'GPU-grade 6U enclosure',detail:'The XE9680 is a 6U, two-socket GPU server. Its deep stamped chassis separates front drive bays, a mid-tray cooling wall, CPU/memory and the rear 8-way HGX accelerator platform.',position:[0,0,0],size:[482,267,860],extract:[0,-130,0],geometry:'xe:chassis'},
  {id:'lid',label:'System cover',summary:'Top protective enclosure',detail:'Deep silver cover panels protect the CPU and HGX platforms; removed here to expose the accelerator shelf and air shrouds.',position:[0,268,0],size:[470,5,860],extract:[-85,250,-40],geometry:'xe:lid',absentAtRest:true},
  {id:'drives',label:'8 NVMe drive carriers',summary:'Front hot-swap data storage',detail:'The reference XE9680 supports up to eight 2.5-inch storage drives, and boot devices can be on a separate BOSS module. The illustrated carriers are NVMe.',position:[0,103,373],size:[400,78,112],extract:[0,50,280],geometry:'xe:drives'},
  {id:'midfans',label:'Six mid-tray HPR fans',summary:'Directed high-pressure airflow',detail:'A central row of six gold-grade high-performance fans moves air through the two processor/memory zones and the HGX assembly.',position:[0,129,244],size:[435,170,106],extract:[0,235,112],geometry:'xe:midfans'},
  {id:'rearFans',label:'Ten rear fans',summary:'Exhaust cooling for GPU subsystem',detail:'The standard XE9680 GPU system has ten high-performance rear cooling fans, with fan layouts varying between supported accelerator configurations.',position:[0,128,-377],size:[428,164,80],extract:[0,140,-240],geometry:'xe:rearFans'},
  {id:'board',label:'Dual-socket motherboard',summary:'Host CPU, PCIe and DDR5 fabric',detail:'A green motherboard hosts two Intel Xeon Scalable CPUs and up to 32 DDR5 DIMM slots, power-delivery phases, BMC and Gen5 connectors.',position:[0,21,100],size:[427,8,320],extract:[0,116,92],geometry:'xe:board'},
  {id:'cpu',label:'Two Xeon processors',summary:'Host orchestration and control',detail:'Two substantial metallic heatsinks sit over fourth/fifth-generation Intel Xeon processors, flanked by memory channels. These CPUs feed data into the eight-GPU HGX compute fabric.',position:[0,103,74],size:[235,94,185],extract:[0,223,90],geometry:'xe:cpu'},
  {id:'ram',label:'32 DDR5 slots',summary:'Host working memory',detail:'Up to 32 registered ECC DDR5 DIMMs across the two CPUs. The physical DIMM channels are tightly packed on both sides of the processors.',position:[0,85,79],size:[426,76,280],extract:[0,191,40],geometry:'xe:ram'},
  {id:'hgc',label:'HGX H200 GPU baseboard',summary:'8-way accelerated compute fabric',detail:'A wide HGX H200 accelerator board carries eight SXM5 GPU modules, linked through NVLink/NVSwitch. This is the central training/inference compute system, not eight individual PCIe cards.',position:[0,42,-198],size:[419,13,300],extract:[0,150,-90],geometry:'xe:hgc'},
  {id:'gpus',label:'8 NVIDIA H200 GPUs',summary:'SXM5 accelerator modules',detail:'Eight H200 141 GB HBM3e accelerators sit in two rows of four with metallic gold/beige package covers and black support structures. They are interconnected by the HGX NVLink fabric.',position:[0,116,-198],size:[416,112,294],extract:[0,275,-125],geometry:'xe:gpus'},
  {id:'nvlink',label:'NVSwitch & fabric',summary:'GPU-to-GPU communication',detail:'NVSwitch and multi-chip NVLink connectivity provide high-bandwidth exchange between the eight accelerators. The interconnect is a complex PCB/mezzanine assembly, not simple external Ethernet wiring.',position:[0,55,-202],size:[310,20,220],extract:[145,190,-95],geometry:'xe:nvlink'},
  {id:'risers',label:'PCIe Gen5 risers',summary:'Network and accelerator I/O',detail:'Up to ten PCIe Gen5 full-height half-length expansion slots, plus an OCP NIC option, support InfiniBand, Ethernet and host interfaces.',position:[0,115,-298],size:[355,91,129],extract:[185,213,-100],geometry:'xe:risers'},
  {id:'psus',label:'Six redundant PSUs',summary:'Electrical power',detail:'Six rear-serviceable high-output redundant power supply modules support the substantial power draw of eight GPU accelerators and dual host CPUs.',position:[0,75,-397],size:[428,111,105],extract:[0,180,-245],geometry:'xe:psus'},
];
const xeGuide:GuideStep[]=[
  ['Meet the 6U machine','Start with the complete XE9680, front NVMe array and a dense dual-zone GPU/CPU mechanical layout.','chassis',[]],
  ['Remove the metal cover','The top enclosure comes off to reveal the air handling system and HGX accelerator platform.','lid',[]],
  ['Expose the six mid-fans','A six-module central blower wall directs high-pressure air over the CPU and GPU cooling routes.','midfans',['lid']],
  ['Identify dual Xeon hosts','Inspect the processor heatsinks and their attached banks of DDR5 memory.','cpu',['lid','midfans']],
  ['Lift the DDR5 banks','Locate the two CPU memory zones, each with 16 DIMM slot positions.','ram',['lid','midfans','cpu']],
  ['Reveal the HGX baseboard','The HGX interposer/baseboard ties eight GPU packages together into one compute platform.','hgc',['lid','midfans','cpu','ram']],
  ['Inspect eight H200 modules','Two rows of four SXM5 H200 accelerators form the primary compute payload.','gpus',['lid','midfans','cpu','ram','hgc']],
  ['Follow the NVLink fabric','NVSwitch enables accelerator-to-accelerator communication; dense electrical routing sits under and around the GPU modules.','nvlink',['lid','midfans','cpu','ram','hgc','gpus']],
  ['Inspect PCIe and networking','Rear PCIe risers provide connection to external fabric NICs and services.','risers',['lid','midfans','cpu','ram','hgc','gpus','nvlink']],
  ['Rear cooling and power','Finish at the ten rear fan modules and six high-capacity power supplies.','psus',['lid','midfans','cpu','ram','hgc','gpus','nvlink','risers']],
].map(([title,text,focus,removed])=>({title:title as string,text:text as string,focus:focus as string,removed:removed as string[]}));

const dgxAssemblies:Assembly[]=[
{id:'frame',label:'10U DGX B200 chassis',summary:'Rackmount Blackwell platform',detail:'A 10U (444 mm) air-cooled AI system, approximately 482 mm wide and 897 mm deep, with a high-density GPU tray above CPU, storage and communications subsystems.',position:[0,0,0],size:[482,444,897],extract:[0,-190,0],geometry:'dgx:frame'},
{id:'cover',label:'GPU bay cover',summary:'Protective top panel',detail:'Large black-and-silver perforated covers shield high-voltage/thermal hardware and the internal GPU tray. Shown separately for illustration.',position:[0,446,0],size:[465,5,885],extract:[-125,255,0],geometry:'dgx:cover',absentAtRest:true},
{id:'gpuTray',label:'HGX B200 tray',summary:'Eight-GPU Blackwell compute fabric',detail:'The HGX tray contains eight NVIDIA B200 accelerators interconnected through fifth-generation NVLink and two NVSwitch chips.',position:[0,288,-80],size:[424,20,515],extract:[0,245,-115],geometry:'dgx:gpuTray'},
{id:'gpus',label:'Eight B200 GPUs',summary:'1,440 GB combined GPU memory',detail:'Eight B200 Tensor Core GPUs contribute 1,440 GB HBM3e GPU memory. Each is covered by a tall, black high-density heatsink assembly in the air-cooled DGX system.',position:[0,357,-82],size:[421,119,506],extract:[0,322,-135],geometry:'dgx:gpus'},
{id:'nvs',label:'Two NVSwitch chips',summary:'Fifth-generation NVLink fabric',detail:'Two fifth-generation NVLink switches connect the eight B200 GPUs with 14.4 TB/s aggregate NVLink bandwidth as documented in the DGX B200 guide.',position:[0,302,-79],size:[184,19,250],extract:[-180,196,-80],geometry:'dgx:nvs'},
{id:'cpuTray',label:'CPU/motherboard tray',summary:'Dual Intel Xeon host platform',detail:'Two 56-core Intel Xeon 8570 processors run the host software and interface with 32 system-memory DIMMs and PCIe network hardware.',position:[0,74,125],size:[419,10,350],extract:[0,145,195],geometry:'dgx:cpuTray'},
{id:'cpus',label:'Dual Xeon 8570',summary:'112 host CPU cores in total',detail:'Two Intel Xeon Platinum 8570 processors supply 56 cores each, beneath silver finned heatsinks. Host memory supports up to 4 TB by upgrading 32 DIMM slots.',position:[0,133,121],size:[240,100,225],extract:[-110,235,115],geometry:'dgx:cpus'},
{id:'memory',label:'32 host DIMMs',summary:'2 TB supplied, upgradable to 4 TB',detail:'Two processor memory domains feed 32 DDR5 DIMM positions. This memory is independent of the GPUs’ 1,440 GB HBM3e.',position:[0,111,130],size:[414,65,282],extract:[165,197,90],geometry:'dgx:memory'},
{id:'fans',label:'High-pressure fan wall',summary:'Air-cooled accelerator hardware',detail:'Dense fan banks and guided ducting force air through the GPU and CPU heatsinks; full-speed airflow and high ambient temperature support are major system design constraints.',position:[0,232,338],size:[414,195,96],extract:[0,200,215],geometry:'dgx:fans'},
{id:'storage',label:'NVMe cache drives',summary:'8×3.84 TB SSDs plus mirrored boot',detail:'The DGX B200 reference system has eight 3.84 TB U.2 data-cache NVMe SSDs and two mirrored 1.92 TB M.2 OS devices.',position:[0,75,373],size:[403,68,100],extract:[0,80,270],geometry:'dgx:storage'},
{id:'network',label:'ConnectX-7 and DPUs',summary:'Cluster networking and control',detail:'Eight ConnectX-7 400 Gb/s network connections and two BlueField-3 DPUs carry cluster and storage/management traffic.',position:[0,169,-359],size:[400,96,140],extract:[115,180,-230],geometry:'dgx:network'},
{id:'psus',label:'Six 3.3 kW power units',summary:'Redundant power',detail:'The 10U DGX B200 uses six 3.3-kW power supplies with a balanced load distribution and dedicated rear servicing.',position:[0,63,-408],size:[420,117,102],extract:[0,175,-250],geometry:'dgx:psus'},
];
const dgxGuide:GuideStep[]=[
 ['Exterior and 10U scale','Inspect the much taller DGX B200 enclosure and its dedicated airflow and power tiers.','frame',[]],
 ['Lift the top panel','A large top cover shields the accelerator tray and the cooling zones.','cover',[]],
 ['Follow the high-pressure fans','Air cooling moves substantial heat out of eight high-wattage Blackwell GPU heatsinks.','fans',['cover']],
 ['Examine the HGX GPU tray','The B200 GPU modules are mounted on a dedicated interconnected multi-GPU tray.','gpuTray',['cover','fans']],
 ['Separate eight B200 modules','Eight GPU packages provide 1,440 GB total HBM3e GPU memory.','gpus',['cover','fans','gpuTray']],
 ['Find NVSwitch','Two integrated switches connect the full eight-GPU fabric.','nvs',['cover','fans','gpuTray','gpus']],
 ['Locate the CPU motherboard','Below the GPU compute bay is a dual-socket server host platform.','cpuTray',['cover','fans','gpuTray','gpus','nvs']],
 ['Inspect Xeon processors','Dual Xeon 8570 host processors support data preparation and system management.','cpus',['cover','fans','gpuTray','gpus','nvs','cpuTray']],
 ['Inspect the 32 DIMMs','Host DDR5 memory sits around the dual Xeon processors, separate from GPU HBM.','memory',['cover','fans','gpuTray','gpus','nvs','cpuTray','cpus']],
 ['NVMe, cluster fabric and power','Front cache SSDs, rear 400G network controllers and six power supplies complete the system.','network',['cover','fans','gpuTray','gpus','nvs','cpuTray','cpus','memory']],
].map(([title,text,focus,removed])=>({title:title as string,text:text as string,focus:focus as string,removed:removed as string[]}));

const rackAssemblies:Assembly[]=[
{id:'cabinet',label:'42U-class rack enclosure',summary:'A rack-scale computer',detail:'The GB200 NVL72 is a complete liquid-cooled rack-scale AI system, not one oversized server. A multi-meter enclosure mounts compute and switch trays, AC power shelves, power bus bars and coolant manifolds.',position:[0,0,0],size:[740,2170,1220],extract:[0,-180,0],geometry:'rack:cabinet'},
{id:'door',label:'Front cabinet door',summary:'Tool-access and airflow security',detail:'A perforated front access door can be removed or swung open to inspect the stacked compute trays. The demonstration opens by hiding it.',position:[0,1046,631],size:[688,2040,42],extract:[-870,0,125],geometry:'rack:door',absentAtRest:true},
{id:'computes',label:'18 compute trays',summary:'72 Blackwell GPUs; 36 Grace CPUs',detail:'The rack contains eighteen 1U liquid-cooled compute trays. Each tray carries two NVIDIA Grace CPUs and four Blackwell GPUs connected into the NVL72 high-speed fabric.',position:[0,1035,188],size:[630,1250,740],extract:[-95,90,385],geometry:'rack:computes'},
{id:'switches',label:'9 NVLink switch trays',summary:'NVL72 interconnect fabric',detail:'Nine separate 1U NVLink switch trays create the rack-level, 72-GPU NVLink domain. They mate through high-density rear passive copper cable cartridges.',position:[0,1055,188],size:[630,770,740],extract:[105,190,455],geometry:'rack:switches'},
{id:'tor',label:'Two top-of-rack switches',summary:'Management Ethernet',detail:'Two top-of-rack networking switches aggregate management/control connections, distinct from NVLink transport.',position:[0,2020,180],size:[630,110,670],extract:[-30,80,330],geometry:'rack:tor'},
{id:'powers',label:'Power shelves and bus bar',summary:'Rack power distribution',detail:'Power shelves at the bottom distribute converted DC to the compute and switch trays through a vertical rear bus bar.',position:[0,255,185],size:[634,420,730],extract:[0,-55,350],geometry:'rack:powers'},
{id:'liquid',label:'Coolant supply manifolds',summary:'Liquid-to-chip heat removal',detail:'Rack-height inlet/return manifolds carry coolant to and from cold plates on Grace CPUs, Blackwell GPUs, ConnectX controllers and NVSwitch ASICs. Other hardware remains air cooled.',position:[302,1110,-428],size:[140,1920,108],extract:[520,0,0],geometry:'rack:liquid'},
{id:'backplane',label:'Copper NVLink backplane',summary:'Passive high-density cable cartridges',detail:'Dense copper cable cartridges at the rear connect compute tray NVLink ports to the nine switch trays. They are not network cables to the internet.',position:[0,1080,-548],size:[598,1430,120],extract:[0,0,-500],geometry:'rack:backplane'},
{id:'modules',label:'Compute cold-plate detail',summary:'Grace–Blackwell superchips',detail:'One compute tray contains two Grace CPUs and four Blackwell GPUs with direct liquid cold plates. The illustrated pull-out is a teaching close-up of one representative tray, not a separate nineteenth compute unit.',position:[0,1560,165],size:[520,45,570],extract:[-120,245,570],geometry:'rack:modules'},
{id:'cooling',label:'Cooling distribution assembly',summary:'External facility heat exchange',detail:'Rear quick-disconnects and the rack manifolds connect to facility-side liquid cooling distribution. Flow and pressure engineering are fundamental to sustained rack power.',position:[-310,780,-470],size:[150,800,110],extract:[-480,50,-200],geometry:'rack:cooling'},
];
const rackGuide:GuideStep[]=[
['One rack, 72 GPUs','A rack-scale NVLink fabric connects 72 GPUs and 36 Grace CPUs, liquid cooled and densely arranged into a tall cabinet.','cabinet',[]],
['Open the cabinet','Remove the perforated access panel to see the stacked 1U trays.','door',[]],
['Count 18 compute trays','Every one of eighteen trays contains two Grace CPUs and four Blackwell GPUs.','computes',['door']],
['Explore a compute cold plate','A representative tray is drawn out to expose its CPU/GPU cold plates, not as an extra node.','modules',['door']],
['Inspect nine NVLink switches','Nine switch trays build the interconnect domain and are arranged between compute sections.','switches',['door','modules']],
['Trace rear copper cartridges','Dense passive copper cartridges join compute trays with NVSwitch trays.','backplane',['door','modules','switches']],
['Follow coolant manifolds','Vertical supply and return pipes connect each liquid-cooled compute and switch assembly.','liquid',['door','modules','switches','backplane']],
['Trace power distribution','Power shelves and bus bars deliver the enormous rack power requirements.','powers',['door','modules','switches','backplane','liquid']],
['Top-of-rack networking','Management switches occupy the upper rack region, alongside the compute fabric.','tor',['door','modules','switches','backplane','liquid','powers']],
].map(([title,text,focus,removed])=>({title:title as string,text:text as string,focus:focus as string,removed:removed as string[]}));

export const MACHINES:Machine[]=[
{
id:'r760',name:'PowerEdge R760',sub:'Dell · 2U enterprise server',kicker:'ENTERPRISE COMPUTE',units:'2U',gpuCount:'2 Xeon',dimensions:[482,86.8,701],
description:'Dual-socket enterprise platform with configurable storage and dense DDR5 memory.',
reference:'https://www.dell.com/support/manuals/en-us/poweredge-r760/per760_ism_pub/inside-the-system?guid=guid-043d9f52-a16e-4494-a65a-128c47fd4ea4&lang=en-us',
assemblies:r760Assemblies,guide:r760Guide,view:{az:.56,el:.94,distance:1350},scale:560
},{
id:'xe9680',name:'PowerEdge XE9680',sub:'Dell · 6U HGX H200 platform',kicker:'GPU ACCELERATOR SERVER',units:'6U',gpuCount:'8 H200',dimensions:[482,267,860],
description:'An air-cooled HGX accelerator server carrying eight NVIDIA H200 SXM modules.',
reference:'https://www.dell.com/support/manuals/en-jm/poweredge-xe9680/xe9680_ism_pub/dell-poweredge-xe9680-system-configurations-and-features?guid=guid-219a12b6-5232-49fe-9506-ac2aed25ac30&lang=en-us',
assemblies:xe9680Assemblies,guide:xeGuide,view:{az:.57,el:.87,distance:1480},scale:680
},{
id:'dgxb200',name:'DGX B200',sub:'NVIDIA · 10U AI supercomputer',kicker:'BLACKWELL COMPUTE',units:'10U',gpuCount:'8 B200',dimensions:[482,444,897],
description:'Eight B200 GPU accelerators with six high-output PSUs and dual Xeon host CPUs.',
reference:'https://docs.nvidia.com/dgx/dgxb200-user-guide/introduction-to-dgxb200.html',
assemblies:dgxAssemblies,guide:dgxGuide,view:{az:.52,el:.74,distance:1520},scale:790
},{
id:'gb200rack',name:'GB200 NVL72',sub:'NVIDIA · full-scale liquid-cooled rack',kicker:'RACK-SCALE AI SYSTEM',units:'RACK',gpuCount:'72 GPUs',dimensions:[740,2170,1220],
description:'A 72-GPU, 36-Grace-CPU rack of eighteen compute trays and nine NVLink switches.',
reference:'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html',
assemblies:rackAssemblies,guide:rackGuide,view:{az:.48,el:.20,distance:3900},scale:1800
}];

export function getMachine(id:MachineId){return MACHINES.find(m=>m.id===id)!;}
