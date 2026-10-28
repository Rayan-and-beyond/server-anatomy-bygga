import type { Plan, PartType, PartItem, Vec3 } from '../lib/types';

export type ComponentId =
  | 'chassis' | 'cover' | 'shroud' | 'backplaneCover' | 'drives' | 'backplane'
  | 'fans' | 'board' | 'cpus' | 'dimms' | 'risers' | 'perc'
  | 'psus' | 'network' | 'boss';

export interface Component {
  id: ComponentId;
  name: string;
  role: string;
  description: string;
  hardware: string;
  position: Vec3;
  size: Vec3;
  extraction: Vec3;
  order: number;
}

export const COMPONENTS: Component[] = [
  { id: 'chassis', name: '2U chassis', role: 'Mechanical structure', description: 'The 86.8 mm-high stamped-steel enclosure houses the complete system and connects to sliding datacenter rack rails. The mounting ears span approximately 482 mm; the chassis body is approximately 434 mm wide.', hardware: 'R760 chassis, front 16×2.5-inch drive cage, rack ears, side rails', position: [0, 0, 0], size: [482, 86.8, 701], extraction: [0, -110, 0], order: 15 },
  { id: 'cover', name: 'System cover', role: 'Shielding and physical access', description: 'A metal lid secured by a release latch. Dell’s documented procedure unlocks the latch, slides the cover rearward, then lifts it away. It must be removed for most internal servicing.', hardware: 'Steel lid, slide rails, release latch, safety labeling', position: [0, 85, 0], size: [433, 3, 699], extraction: [-30, 255, -65], order: 1 },
  { id: 'shroud', name: 'Air shroud', role: 'Guided airflow', description: 'Black molded-plastic ducting seals the route between the six fan modules and the CPU heatsinks and memory. It is not a heatsink itself: the plastic maintains sufficient airflow through the intended channels.', hardware: 'Removable dual-CPU airflow duct, snap tabs, ducts', position: [0, 68, -75], size: [398, 36, 310], extraction: [-65, 245, -60], order: 2 },
  { id: 'backplaneCover', name: 'Drive backplane cover', role: 'Cable and backplane protection', description: 'A removable metal/plastic cover protects the front drive backplane connections. Dell instructs sliding the cover toward the rear before lifting it free for access.', hardware: 'Backplane cable cover and locating tabs', position: [0, 77, 246], size: [415, 13, 105], extraction: [0, 205, 145], order: 4 },
  { id: 'drives', name: '16 drive carriers', role: 'Persistent storage', description: 'Sixteen 2.5-inch hot-plug positions form two dense rows across the front. Each carrier has a handle, release mechanism, status LED and a storage-device connection at the backplane. Populated drives are a configuration choice.', hardware: '16×2.5-inch front-accessible carriers, SAS/SATA/NVMe depending on backplane configuration', position: [0, 41, 288], size: [423, 77, 122], extraction: [0, 20, 290], order: 9 },
  { id: 'backplane', name: 'Drive backplane', role: 'Storage data and power', description: 'A tall PCB behind the drive bays mates carrier connectors with the host cabling. Different R760 backplanes support different drive and NVMe configurations.', hardware: '16-bay connector PCB, high-speed sockets and cabling', position: [0, 40, 223], size: [418, 72, 7], extraction: [-5, 195, 225], order: 10 },
  { id: 'fans', name: 'Six-fan cage', role: 'High-pressure cooling', description: 'Six hot-plug, high-performance fan modules sit as a solid wall behind the drive bank. Their black housings and orange finger-release points are characteristic of the R760. Blue cage-release levers unlock the assembly.', hardware: '6 independent fan cartridges; removable cage and blue release levers', position: [0, 42, 147], size: [417, 76, 75], extraction: [10, 205, 95], order: 5 },
  { id: 'board', name: 'System board', role: 'Platform interconnect', description: 'The green multilayer PCB carries dual processor sockets, up to 32 DDR5 RDIMM sockets, PCIe Gen5 connectivity, management electronics, voltage regulators, and connectors to front/backplane subsystems.', hardware: 'Dual-socket motherboard; voltage regulators, capacitors, DDR5 and PCIe connectors', position: [0, 12, -87], size: [418, 6, 420], extraction: [0, 105, -95], order: 14 },
  { id: 'cpus', name: 'Dual Xeon PHMs', role: 'Compute and thermal transfer', description: 'Two Intel Xeon Scalable processors are installed in sockets under large passive aluminum heatsinks. A Processor and Heatsink Module (PHM) is serviced as a combined assembly using anti-tilt wires and captive Torx screws.', hardware: '2 CPU sockets + PHMs with copper bases, silver fin arrays and T30 captive screws', position: [0, 43, -86], size: [274, 64, 115], extraction: [0, 193, -48], order: 6 },
  { id: 'dimms', name: 'DDR5 memory', role: 'Fast working memory', description: 'The R760 supports up to 32 registered DIMM slots: 16 per CPU, across eight memory channels per processor. The sockets flank the processor areas, creating dense, parallel banks of green memory cards.', hardware: '32 registered DDR5 DIMM positions, white or black socket latches, ECC support', position: [0, 44, -76], size: [412, 55, 275], extraction: [0, 182, -5], order: 7 },
  { id: 'risers', name: 'PCIe riser cages', role: 'Expansion and acceleration', description: 'Silver metal rear riser cages turn high-speed motherboard connections into full expansion-card slots. Server configurations can add NICs, HBAs, GPUs or other accelerators in selected risers.', hardware: 'Riser 1, 2, 3/4 variants; metallic shields; black riser covers; PCIe cards', position: [-8, 49, -283], size: [339, 73, 131], extraction: [75, 225, -140], order: 3 },
  { id: 'perc', name: 'PERC controller', role: 'Storage management', description: 'The PowerEdge RAID Controller is installed near the drive connection path and coordinates supported SAS/SATA devices. Depending on the configuration, NVMe drives may use other direct paths.', hardware: 'PERC controller PCB, small silver heatsink and cabled links to backplane', position: [169, 29, 36], size: [78, 32, 81], extraction: [90, 151, 70], order: 11 },
  { id: 'psus', name: 'Redundant power', role: 'Reliable DC distribution', description: 'Two hot-swappable power supply units occupy rear-accessible bays, with separate AC connectors and status indicators. Independent power feeds allow a redundant configuration to tolerate one source or PSU failure.', hardware: '2 removable AC power supplies with metal enclosures and rear fan/IEC inlet', position: [0, 43, -263], size: [418, 77, 170], extraction: [0, 150, -210], order: 12 },
  { id: 'network', name: 'Network & iDRAC', role: 'Data and out-of-band management', description: 'An optional OCP NIC provides network ports while dedicated management enables remote out-of-band maintenance through iDRAC. The rear I/O exposes Ethernet, USB and video depending on configuration.', hardware: 'OCP 3.0 NIC, rear RJ45 cages, management interface, USB and video', position: [-35, 41, -342], size: [147, 53, 21], extraction: [-95, 128, -155], order: 13 },
  { id: 'boss', name: 'BOSS-N1 boot module', role: 'Independent operating-system boot', description: 'An optional rear-facing BOSS-N1 module accepts M.2 NVMe media for operating-system boot, keeping the front data-drive bays free for workload storage.', hardware: 'Rear BOSS-N1 module with M.2 boot SSDs and rear-accessible carrier', position: [82, 41, -342], size: [94, 50, 28], extraction: [135, 140, -160], order: 13 },
];

export const BY_ID = Object.fromEntries(COMPONENTS.map(c => [c.id, c])) as Record<ComponentId, Component>;

export interface WalkStep {
  title: string;
  description: string;
  target: ComponentId;
  remove: ComponentId[];
  note: string;
}

export const WALKTHROUGH: WalkStep[] = [
  { title: 'Meet the R760', target: 'chassis', remove: [], description: 'A genuine 2U datacenter server, seen with its complete enclosure. Sixteen front storage positions; two sockets; up to 32 DDR5 slots; six fan cartridges; rear expansion and redundant power.', note: 'This is an illustrated R760 configuration, not a service-certified CAD replica.' },
  { title: 'Unlock the top cover', target: 'cover', remove: [], description: 'Release the latch, slide the steel lid rearward, and lift it away. The protective cover is the first barrier to the full internal layout.', note: 'Power down and disconnect external power before internal service.' },
  { title: 'Lift the air shroud', target: 'shroud', remove: ['cover'], description: 'Lift the black ducting vertically by its edges. The two processor cooling zones and the rows of memory below now become visible.', note: 'The duct is functional: reinstall it before operating the system.' },
  { title: 'Remove PCIe risers', target: 'risers', remove: ['cover','shroud'], description: 'Release the blue latches or captive screws, then lift the metallic rear riser assemblies vertically off their board connectors.', note: 'Riser count and position depend on the exact R760 configuration.' },
  { title: 'Open the backplane area', target: 'backplaneCover', remove: ['cover','shroud','risers'], description: 'Slide the backplane cable cover toward the rear, then lift it clear to expose connectors and the front cable route.', note: 'This step is relevant when accessing the drive backplane and fan-cage path.' },
  { title: 'Release the six-fan cage', target: 'fans', remove: ['cover','shroud','risers','backplaneCover'], description: 'Swing the cage’s blue release levers and lift the six-fan assembly. The high-pressure fan wall normally drives air front-to-rear through the machine.', note: 'Dell documents the blue cage release levers and lift-out procedure.' },
  { title: 'Inspect the dual Xeons', target: 'cpus', remove: ['cover','shroud','risers','backplaneCover','fans'], description: 'Two processors sit beneath large finned heatsinks. The PHM is released using captive Torx screws and anti-tilt wires before it can be lifted.', note: 'Processor work requires the official instructions, correct tools and thermal material.' },
  { title: 'See all 32 DIMM positions', target: 'dimms', remove: ['cover','shroud','risers','backplaneCover','fans','cpus'], description: 'Eight memory channels per CPU feed sixteen DDR5 slots per socket. Some cards may be unpopulated depending on the configured capacity.', note: 'Memory installation order is channel-specific; this is a visual inspection, not slot-population advice.' },
  { title: 'Inspect drive carriers', target: 'drives', remove: ['cover','shroud','risers','backplaneCover','fans','cpus','dimms'], description: 'Slide the drive caddies forward out of the front cage. Each one mates with a connector on the front backplane, not directly with the motherboard.', note: 'Individual hot-plug drive removal is a separate procedure and may not require removing the top cover.' },
  { title: 'Expose the drive backplane', target: 'backplane', remove: ['cover','shroud','risers','backplaneCover','fans','cpus','dimms','drives'], description: 'With drives and protective components clear, the backplane, connectors, and routed host cables are visible.', note: 'Follow the specific backplane configuration guide before disconnecting cables.' },
  { title: 'Identify the storage controller', target: 'perc', remove: ['cover','shroud','risers','backplaneCover','fans','cpus','dimms','drives','backplane'], description: 'The PERC module manages supported SAS/SATA storage. Connector positions and exact cabling vary by controller and drive option.', note: 'This model shows one illustrative PERC arrangement.' },
  { title: 'Inspect redundant power', target: 'psus', remove: ['cover','shroud','risers','backplaneCover','fans','cpus','dimms','drives','backplane','perc'], description: 'Rear-accessible PSUs supply the server’s DC rails. Both have their own inlet, rear fan grille and release latch.', note: 'Never open a PSU enclosure; unplug external AC sources before deep internal work.' },
  { title: 'Reveal the board and I/O', target: 'board', remove: ['cover','shroud','risers','backplaneCover','fans','cpus','dimms','drives','backplane','perc','psus'], description: 'The green motherboard remains, with CPU sockets, DDR5 connectors, PCIe connectors, management circuitry and cabled links. The OCP NIC and optional BOSS boot module live near the rear I/O.', note: 'Board replacement is service-technician work with more prerequisites than this exploration illustrates.' },
];

export function createPlan(): Plan {
  const definitions: PartType[] = COMPONENTS.map((c, i) => ({
    id: c.id, label: String.fromCharCode(65 + i), name: c.name,
    size: c.size, qty: 1, shape: 'box', material: 'metal',
  }));
  const items: PartItem[] = COMPONENTS.map(c => ({
    key: c.id, ref: c.id, kind: 'part', holes: [],
    final: { pos: c.position, rot: [0, 0, 0] },
    states: [{ step: 0, scene: 'main', pos: c.position, rot: [0, 0, 0], delay: 0 }],
  }));
  return {
    spec: {
      name: 'PowerEdge R760', variant: 'Air-cooled, 16 front bays',
      category: 'datacenter server', archetype: 'custom',
      size: { w: 48.2, h: 8.68, d: 70.07 },
      minutes: 1, people: 2, difficulty: 3, source: 'guess',
    },
    parts: definitions, hardware: [], items,
    steps: [{ n: 0, title: 'Server anatomy', kind: 'general', people: 2, pose: '+y', warnings: [], minutes: 1, tools: [], scene: 'main' }],
    tools: [],
  };
}

export const REFERENCE_URLS = {
  manual: 'https://www.dell.com/support/manuals/en-us/poweredge-r760/per760_ism_pub/inside-the-system?guid=guid-043d9f52-a16e-4494-a65a-128c47fd4ea4&lang=en-us',
  specs: 'https://www.dell.com/support/manuals/en-us/oth-r760/per760_ism_pub/chassis-dimensions?guid=guid-04578793-7445-43f5-acc4-a0b11f85eb5f&lang=en-us',
  walkthrough: 'https://www.dell.com/support/resources/en-us/3dviewer/ic14000r760003901a/how-to-replace-the-processor-on-a-poweredge-r760',
  photos: 'https://www.storagereview.com/review/dell-poweredge-r760-review',
};
