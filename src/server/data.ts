import type { Plan, PartType, PartItem, Vec3 } from '../lib/types';

export type ComponentId = 'chassis' | 'cover' | 'motherboard' | 'processors' | 'memory' | 'storage' | 'cooling' | 'power' | 'network';

export interface PartInfo {
  id: ComponentId;
  number: string;
  name: string;
  subtitle: string;
  description: string;
  function: string;
  detail: string;
  size: Vec3;
  position: Vec3;
  explode: Vec3;
  accent: string;
}

export const parts: PartInfo[] = [
  { id: 'chassis', number: '01', name: 'Chassis', subtitle: 'The structural backbone', description: 'A 2U rackmount enclosure organizes and protects every component while providing a rigid mechanical mounting frame.', function: 'Mechanical structure', detail: 'A typical 2U server occupies 88.9 mm of rack height. This is a conceptual cutaway, not a dimensionally accurate manufacturer design.', size: [630, 20, 690], position: [0, 9, 0], explode: [0, -115, 0], accent: '#617280' },
  { id: 'cover', number: '02', name: 'Top cover', subtitle: 'Access and protection', description: 'A removable sheet-metal lid shields internal components and guides airflow through the enclosure.', function: 'Enclosure / airflow', detail: 'Real servers often have tool-less latches and interlocks. Removing the cover is for authorized, powered-down maintenance.', size: [625, 4, 688], position: [0, 91, 0], explode: [0, 265, -25], accent: '#728293' },
  { id: 'motherboard', number: '03', name: 'Motherboard', subtitle: 'The system interconnect', description: 'The main circuit board connects CPU sockets, memory channels, PCIe expansion, controller chips, and I/O.', function: 'Connectivity and control', detail: 'The board carries traces for high-speed buses. Its illustrated layout is generalized for teaching.', size: [440, 7, 390], position: [-46, 22, -74], explode: [-32, 108, -48], accent: '#3b8274' },
  { id: 'processors', number: '04', name: 'Processors', subtitle: 'Compute and execution', description: 'Two CPU packages execute instructions. Heat sinks conduct thermal energy from the chips into the server’s airflow.', function: 'Instruction execution', detail: 'Each core fetches, decodes and executes instructions; real server CPUs also have multiple cache levels, memory controllers and complex interconnects.', size: [180, 44, 170], position: [-115, 49, -111], explode: [-192, 185, -18], accent: '#d7a35e' },
  { id: 'memory', number: '05', name: 'Memory modules', subtitle: 'Working data, close to the CPU', description: 'DIMM modules hold active application data and instructions for rapid access by the processor.', function: 'Volatile system memory', detail: 'Servers can use ECC memory to detect and correct certain bit errors. Module quantity and layout here are representative.', size: [148, 59, 226], position: [125, 53, -78], explode: [180, 168, -10], accent: '#4a997e' },
  { id: 'storage', number: '06', name: 'Storage array', subtitle: 'Persistent data', description: 'Six front-accessible drive carriers demonstrate a hot-swap storage bay arrangement.', function: 'Persistent data', detail: 'Storage retains data when power is off. Enterprise designs commonly use NVMe SSDs and redundant arrays, depending on workload.', size: [548, 72, 138], position: [0, 49, 264], explode: [0, 98, 212], accent: '#6b8bb2' },
  { id: 'cooling', number: '07', name: 'Cooling bank', subtitle: 'Directed airflow', description: 'A row of high-pressure fans forces cool air past storage, RAM, and heat sinks toward the exhaust.', function: 'Thermal regulation', detail: 'Fan speed is managed by the platform controller in response to temperatures. Our animated fans are a visual cue only.', size: [550, 70, 84], position: [0, 49, 126], explode: [0, 176, 92], accent: '#5f92ae' },
  { id: 'power', number: '08', name: 'Power supplies', subtitle: 'Redundant power', description: 'Two removable power modules convert AC power into regulated DC rails for the system.', function: 'Power conversion', detail: 'Dual PSUs can provide resilience when fed from independent power sources. Never open a power supply enclosure.', size: [126, 72, 246], position: [243, 49, -166], explode: [224, 122, -132], accent: '#ca8b58' },
  { id: 'network', number: '09', name: 'Network & I/O', subtitle: 'Outside-world connectivity', description: 'Rear interface ports connect the server to management networks, storage fabrics, and other machines.', function: 'Communication and management', detail: 'Network controllers exchange frames over links; out-of-band management ports often remain available independently of the host OS.', size: [210, 55, 46], position: [-52, 52, -315], explode: [-62, 136, -196], accent: '#9b7cae' },
];

export const partById: Record<ComponentId, PartInfo> = Object.fromEntries(parts.map(part => [part.id, part])) as Record<ComponentId, PartInfo>;

export function createServerPlan(): Plan {
  const definitions: PartType[] = parts.map((part, index) => ({
    id: part.id, label: String.fromCharCode(65 + index), name: part.name,
    qty: 1, shape: 'box', material: 'metal', size: part.size,
  }));
  const items: PartItem[] = parts.map(part => ({
    key: part.id, kind: 'part', ref: part.id, holes: [],
    final: { pos: part.position, rot: [0, 0, 0] },
    states: [{ step: 0, scene: 'main', pos: part.position, rot: [0, 0, 0], delay: 0 }],
  }));
  return {
    spec: {
      name: 'Conceptual 2U Rack Server', variant: 'Exploded learning model',
      category: 'computing', archetype: 'custom', size: { w: 63, h: 9, d: 69 },
      minutes: 1, people: 1, difficulty: 1, source: 'guess',
    },
    parts: definitions, hardware: [], items,
    steps: [{
      n: 0, title: 'Explore the server', detail: 'Every part has a role',
      tools: [], people: 1, scene: 'main', pose: '+y', warnings: [],
      kind: 'general', minutes: 1,
    }],
    tools: [],
  };
}
