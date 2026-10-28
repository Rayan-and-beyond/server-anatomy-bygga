# Datacenter Anatomy

Interactive, browser-only 3D hardware studies of **four different datacenter machines**:

1. **Dell PowerEdge R760 — 2U**. Dual socket enterprise server with 32 DDR5 DIMM positions, 16 front drive carriers, 6 removable fans, PCIe risers and redundant PSUs.
2. **Dell PowerEdge XE9680 — 6U**. Air-cooled HGX H200 platform: eight SXM5 H200 GPU modules, dual-Xeon host board, 32 DDR5 slots, six mid-tray HPR fans, ten rear fans, six redundant PSUs.
3. **NVIDIA DGX B200 — 10U**. Eight B200 GPUs (1,440 GB HBM3e), two fifth-gen NVSwitch chips, dual Xeon 8570 CPUs, 32 DIMM positions, six 3.3-kW PSUs, NVMe cache and networking.
4. **NVIDIA DGX GB200 NVL72 — rack-scale**. Liquid-cooled 72-GPU/36-Grace-CPU cabinet with eighteen 1RU compute trays, nine NVLink switch trays, two top-of-rack switches, power shelves, rear copper cable cartridges and liquid manifolds.

## Interaction

Each machine has its own tab. Orbit and zoom hardware, select assemblies, separate components with a slider, or follow a machine-specific guided walkthrough. Hide the sidebar for unobstructed viewing. Activate native browser fullscreen (requires browser support and iframe permission when embedded). No user accounts, metered credits, APIs, server or AI generation.

**Important**: These scenes are programmatically reconstructed educational models, not manufacturer CAD or certified service procedures. Real-world assembly/removal procedures can be significantly more complicated and require vendor-certified tools. Accelerator, drive, cable, fan and PSU options vary by configuration.

## Architecture

- src/server/catalog.ts: platform-specific inventory, dimensions, extraction vectors, descriptions and guided sequence.
- src/server/hardware3d.ts: procedural GPU/CPU modules, metalwork, fans, PCBs, DIMMs, cables, liquid manifolds and dense rack trays.
- src/server/geometry.ts: original custom 2U geometry.
- src/server/Viewer.tsx: Three.js viewer via adapted MIT-licensed Bygga Stage, camera/picking/interpolation.
- src/App.tsx: machine tabs, collapsible inspector, fullscreen, exploder and guide.
- src/engine/*, src/lib/types.ts, src/lib/plan/math.ts: MIT-licensed Bygga code, copyright retained in LICENSE.

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
