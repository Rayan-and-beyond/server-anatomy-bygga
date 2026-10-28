# Hardware Anatomy — Datacenter Machines and Mac mini

Interactive, browser-only 3D hardware studies of **five physically different computers**, including one compact Apple desktop:

1. **Apple Mac mini (M4 Pro, 2024)** — a 127 × 127 × 50 mm machined silver aluminum desktop with black circular vent foot, internal blower, copper Pro cooling, compact black logic board, unified memory, proprietary removable flash SSD, modular front USB-C and 3.5 mm audio board, rear Thunderbolt 5/HDMI/Ethernet, and an upper internal AC/DC power supply. Bottom-entry guided service path informed by Apple's official repair manual and iFixit teardown.
2. **Dell PowerEdge R760 — 2U**. Dual socket enterprise server with 32 DDR5 DIMM positions, 16 front drive carriers, 6 removable fans, PCIe risers and redundant PSUs.
3. **Dell PowerEdge XE9680 — 6U**. Air-cooled HGX H200 platform: eight SXM5 H200 GPU modules, dual-Xeon host board, 32 DDR5 slots, six mid-tray HPR fans, ten rear fans, six redundant PSUs.
4. **NVIDIA DGX B200 — 10U**. Eight B200 GPUs (1,440 GB HBM3e), two fifth-gen NVSwitch chips, dual Xeon 8570 CPUs, 32 DIMM positions, six 3.3-kW PSUs, NVMe cache and networking.
5. **NVIDIA DGX GB200 NVL72 — rack-scale**. Liquid-cooled 72-GPU/36-Grace-CPU cabinet with eighteen 1RU compute trays, nine NVLink switch trays, two top-of-rack switches, power shelves, rear copper cable cartridges and liquid manifolds.

## Interaction

Each machine has its own tab; the M4 Pro mini is featured on the landing screen. Orbit and zoom hardware, select assemblies, separate components with a slider, or follow a machine-specific guided walkthrough. Hide the sidebar for unobstructed viewing. Activate native browser fullscreen (requires browser support and iframe permission when embedded). No user accounts, metered credits, APIs, server or AI generation.

**Important**: These scenes are programmatically reconstructed educational models, not manufacturer CAD or certified service procedures. Real-world assembly/removal procedures can be significantly more complicated and require vendor-certified tools. Accelerator, drive, cable, fan and PSU options vary by configuration.

## Architecture

- src/server/catalog.ts: platform-specific inventory, dimensions, extraction vectors, descriptions and guided sequence.
- src/server/macMini.ts: M4 Pro parts, precise exterior size, bottom-opening guided walkthrough.
- src/server/macMini3d.ts: rounded aluminum extrusion, radial fan, copper cooling stack, Apple silicon, removable SSD, power board and realistic ports.
- src/server/hardware3d.ts: procedural GPU/CPU modules, metalwork, fans, PCBs, DIMMs, cables, liquid manifolds and dense rack trays.
- src/server/geometry.ts: original custom 2U geometry.
- src/server/Viewer.tsx: Three.js viewer via adapted MIT-licensed Bygga Stage, camera/picking/interpolation.
- src/App.tsx: machine tabs, collapsible inspector, fullscreen, exploder and guide.
- src/engine/*, src/lib/types.ts, src/lib/plan/math.ts: MIT-licensed Bygga code, copyright retained in LICENSE.

## Apple Mac mini M4 Pro reference and limitations

- [Apple Mac mini (2024) specifications](https://support.apple.com/en-am/121555) — 127 mm width/depth, 50 mm height, M4 Pro, front two USB-C + 3.5 mm audio, rear three Thunderbolt 5, HDMI and Ethernet.
- [Apple Mac mini (2024) repair manual](https://support.apple.com/en-gb/121508) — first steps, bottom cover, power button, battery, antenna plate, fan, speaker, front USB-C, SSD, audio board, logic board, power supply and enclosure.
- [iFixit 2024 Mac mini teardown](https://www.ifixit.com/News/104302/all-hail-the-return-of-upgradeable-storage-mac-mini-2024-teardown) — layer order, fan, copper Pro heatsink, black PCB, non-standard replaceable flash, power PCB under the aluminum roof.
- [iFixit SSD replacement guide](https://www.ifixit.com/Guide/How+to+Replace+the+SSD+in+your+Mac+mini+(2024)/180199) — M4 Pro module placement differs from baseline M4, modular NAND is not a typical NVMe M.2 drive.

The silver housing, logo and fine circuit detail are **original educational procedural meshes**, not extracted Apple CAD. Package, trace, fastener, port and wire positions are approximate. The simulated decomposition separates explanatory layers, not live power/thermal service instructions.

## Official hardware references

- Dell PowerEdge R760 inside-the-system: https://www.dell.com/support/manuals/en-us/poweredge-r760/per760_ism_pub/inside-the-system?guid=guid-043d9f52-a16e-4494-a65a-128c47fd4ea4&lang=en-us
- Dell PowerEdge XE9680 components: https://www.dell.com/support/manuals/en-jm/poweredge-xe9680/xe9680_ism_pub/dell-poweredge-xe9680-system-configurations-and-features?guid=guid-219a12b6-5232-49fe-9506-ac2aed25ac30&lang=en-us
- Dell XE9680 supported GPUs: https://www.dell.com/support/manuals/en-ai/poweredge-xe9680/xe9680_ism_pub/gpu-specifications?guid=guid-1f91b9fb-b8fd-492e-863f-45febc9355c6&lang=en-us
- NVIDIA DGX B200: https://docs.nvidia.com/dgx/dgxb200-user-guide/introduction-to-dgxb200.html
- NVIDIA DGX GB Rack Scale: https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html
- NVIDIA GB200 NVL72 overview: https://developer.nvidia.com/blog/nvidia-gb200-nvl72-delivers-trillion-parameter-llm-training-and-real-time-inference/

No actual vendor CAD or licensed source images are copied into the 3D models. Brand names remain their owners' trademarks.

## Local development

Node.js 22+. Run npm install, then npm run dev. Verify with npm run build. Browser requires WebGL2; runs on Mac M1 with recent Safari subject to available memory.
