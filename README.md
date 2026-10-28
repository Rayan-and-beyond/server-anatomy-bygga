# Server Anatomy — Bygga experiment

A free interactive exploded-view rack server teaching the physical roles of its hardware components. Built with the actual `Stage`, geometry (`drawable.ts`), materials and data types adapted from Hassan El Mghari's [Bygga](https://github.com/Nutlope/bygga) under the MIT license (see LICENSE).

The server is intentionally a conceptual, non-vendor-specific 2U platform, not a service procedure for a real product. No paid APIs, user data, backend or credentials.

Install: `npm install && npm run dev`; typecheck/build: `npm run build`.

Features: orbit / pinch zoom / wheel zoom, interactive component picking, animated exploded view, overview / assembly sections, in-context component guide and reset. The server-specific 3D hardware details live in `src/server/geometry.ts` while Bygga's `Stage` drives its camera, scene, and component placement.
