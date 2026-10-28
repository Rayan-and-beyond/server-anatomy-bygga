# PowerEdge R760 — Server Anatomy

An interactive, independent **Dell PowerEdge R760** educational reconstruction. This is not a Dell-authored application and does not include Dell CAD or service-certified geometry.

## Why this server

R760: 2U (86.8 mm high), 434 mm enclosure body, 482 mm ears, 700.7 mm nominal depth, up to two Intel Xeon Scalable CPUs, **32 DDR5 DIMM slots** (16 per socket), six high-pressure fans, configurable drive backplanes (this study illustrates the **16 x 2.5-inch bay** option), PCIe Gen5 riser cages and redundant rear AC PSUs. The illustration depicts an air-cooled configuration. Actual cards, memory population, drive choices and service-specific cable routes vary.

## Main interactions

- **Explore:** Rotate and zoom the server, click individual assemblies, and slide from an open working cutaway to an exploded view.
- **Step-by-step:** Thirteen stages presenting a coherent top-access teardown: exterior, cover, air shroud, PCIe risers, backplane cover, fan cage, PHM, DIMM positions, front drive carriers, backplane, controller, PSUs and system board. Separate service operations have their own prerequisites; this is a teaching sequence, **not** the official service order for every component.
- Buttons, mouse/touch interactions, keyboard arrows for guide navigation, component index and descriptive inspector.
- No AI, paid credits, API keys, tracking or backend.

## Primary references (accessed October 2026)

- [Dell official R760 inside-the-system component diagram](https://www.dell.com/support/manuals/en-us/poweredge-r760/per760_ism_pub/inside-the-system?guid=guid-043d9f52-a16e-4494-a65a-128c47fd4ea4&lang=en-us)
- [Dell R760 chassis dimensions](https://www.dell.com/support/manuals/en-us/oth-r760/per760_ism_pub/chassis-dimensions?guid=guid-04578793-7445-43f5-acc4-a0b11f85eb5f&lang=en-us)
- [Dell R760 official processor service 3D walkthrough](https://www.dell.com/support/resources/en-us/3dviewer/ic14000r760003901a/how-to-replace-the-processor-on-a-poweredge-r760)
- [Dell official cooling fan cage service procedure](https://www.dell.com/support/resources/en-gb/3dviewer/ic14000r760000905a/how-to-replace-the-cooling-fan-cage-assembly-on-a-poweredge-r760)
- [StorageReview R760 hands-on internal hardware photographs](https://www.storagereview.com/review/dell-poweredge-r760-review)

## Implementation

The original MIT-licensed Three.js Stage renderer, drawable materials and type interfaces are adapted from [Bygga](https://github.com/Nutlope/bygga), © 2026 Bygga contributors (see LICENSE). Unlike the original furniture/fastener geometry, src/server/geometry.ts procedurally generates server hardware while src/server/data.ts contains vendor-grounded component descriptions and illustrative educational disassembly stages. The model is not exact in PCB trace, heatsink pitch, port location, socket orientation, or manufacturer-specific assemblies.

```bash
npm install
npm run build
npm run dev
```

Mac M1 / Safari WebGL is supported in principle; performance should be verified on the target browser. No batteries or credentials required.
