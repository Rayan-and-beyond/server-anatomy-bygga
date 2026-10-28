import * as THREE from 'three';
import type { ComponentId } from './data';

const MAT = {
  graphite: new THREE.MeshStandardMaterial({ color: '#222b32', metalness: 0.76, roughness: 0.42 }),
  black: new THREE.MeshStandardMaterial({ color: '#101a22', metalness: 0.64, roughness: 0.51 }),
  steel: new THREE.MeshStandardMaterial({ color: '#8d9aa1', metalness: 0.77, roughness: 0.27 }),
  silver: new THREE.MeshStandardMaterial({ color: '#c3cbcc', metalness: 0.78, roughness: 0.25 }),
  pcb: new THREE.MeshStandardMaterial({ color: '#174c48', metalness: 0.18, roughness: 0.68 }),
  pcbDark: new THREE.MeshStandardMaterial({ color: '#17372f', metalness: 0.2, roughness: 0.71 }),
  cyan: new THREE.MeshStandardMaterial({ color: '#78b6ac', metalness: 0.38, roughness: 0.39, emissive: '#0d3430', emissiveIntensity: 0.35 }),
  copper: new THREE.MeshStandardMaterial({ color: '#cf9d60', metalness: 0.76, roughness: 0.35 }),
  gold: new THREE.MeshStandardMaterial({ color: '#d4b276', metalness: 0.72, roughness: 0.36 }),
  ceramic: new THREE.MeshStandardMaterial({ color: '#c3b8a4', metalness: 0.20, roughness: 0.53 }),
  blue: new THREE.MeshStandardMaterial({ color: '#477e99', metalness: 0.55, roughness: 0.38 }),
  darkBlue: new THREE.MeshStandardMaterial({ color: '#2e4c67', metalness: 0.43, roughness: 0.5 }),
  copperDark: new THREE.MeshStandardMaterial({ color: '#9f6e43', metalness: 0.60, roughness: 0.50 }),
  greenLed: new THREE.MeshStandardMaterial({ color: '#9ae1aa', emissive: '#36c17d', emissiveIntensity: 0.75 }),
  orangeLed: new THREE.MeshStandardMaterial({ color: '#fac284', emissive: '#dc6b30', emissiveIntensity: 0.75 }),
};
type Material = THREE.Material;

const edging = new THREE.LineBasicMaterial({ color: '#29323b', transparent: true, opacity: 0.34 });

function box(group: THREE.Group, width: number, height: number, depth: number, x: number, y: number, z: number, material: Material, edges = false) {
  const geo = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  group.add(mesh);
  if (edges) {
    const lines = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edging);
    lines.position.copy(mesh.position);
    group.add(lines);
  }
  return mesh;
}
function cyl(group: THREE.Group, radius: number, height: number, x: number, y: number, z: number, material: Material, segments = 24) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}
function bolt(group: THREE.Group, x: number, y: number, z: number) {
  cyl(group, 2.4, 0.9, x, y, z, MAT.steel, 8);
  box(group, 3.5, 1.05, 0.55, x, y + 0.5, z, MAT.graphite);
}
function frontDrive(group: THREE.Group, x: number, z: number, w = 78) {
  box(group, w, 50, 124, x, 0, z, MAT.graphite, true);
  box(group, w - 7, 41, 3, x, 0, z + 64, MAT.black, true);
  box(group, w - 19, 6, 4, x, -11, z + 67, MAT.silver);
  box(group, w - 28, 2.2, 3, x, 17, z + 67, MAT.darkBlue);
  box(group, 6, 5, 3, x - w / 2 + 10, 17, z + 67.5, MAT.greenLed);
  box(group, 6, 5, 3, x - w / 2 + 20, 17, z + 67.5, MAT.orangeLed);
  bolt(group, x + w / 2 - 8, 20, z + 66);
}
function heatsink(group: THREE.Group, x: number, z: number) {
  box(group, 67, 5, 75, x, -17, z, MAT.gold, true);
  box(group, 74, 6, 83, x, -12, z, MAT.steel, true);
  for (let i = 0; i < 19; i++) {
    box(group, 2.4, 22, 78, x - 34 + i * 3.78, 2.4, z, MAT.silver);
  }
  box(group, 76, 3.3, 78, x, 15, z, MAT.steel);
  for (const xx of [-32, 32]) for (const zz of [-36, 36]) bolt(group, x + xx, 16.8, z + zz);
}
function fan(group: THREE.Group, x: number, z: number) {
  box(group, 77, 55, 74, x, 0, z, MAT.graphite, true);
  const circle = new THREE.Mesh(new THREE.TorusGeometry(31, 2.7, 8, 40), MAT.steel);
  circle.rotation.x = -Math.PI / 2;
  circle.position.set(x, 29.2, z);
  group.add(circle);
  for (let i = 0; i < 7; i++) {
    const blade = box(group, 14, 2, 26, 0, 0, 0, MAT.darkBlue);
    const a = i / 7 * Math.PI * 2;
    blade.position.set(x + Math.sin(a) * 16, 28.4, z + Math.cos(a) * 16);
    blade.rotation.y = a + 0.62;
  }
  cyl(group, 10, 4, x, 30, z, MAT.ceramic);
  for (const xx of [-32, 32]) for (const zz of [-30, 30]) bolt(group, x + xx, 29.9, z + zz);
}
function chassis(group: THREE.Group) {
  box(group, 610, 5, 655, 0, -3, 0, MAT.steel, true);
  box(group, 610, 2, 655, 0, 0, 0, MAT.graphite);
  for (const x of [-307, 307]) {
    box(group, 5, 66, 664, x, 32, 0, MAT.graphite, true);
    box(group, 13, 5, 664, x, 64, 0, MAT.steel);
  }
  for (const z of [-327, 327]) {
    box(group, 611, 65, 5, 0, 32, z, MAT.graphite, true);
    for (let i = -6; i <= 6; i++) box(group, 23, 4, 3, i * 39, 43, z + (z > 0 ? 4 : -4), MAT.black);
  }
  for (const x of [-321, 321]) {
    box(group, 34, 64, 11, x, 31, 313, MAT.steel, true);
    for (const y of [5, 55]) cyl(group, 6.2, 3.5, x, y, 320, MAT.graphite, 14);
  }
  for (let i = 0; i < 10; i++) {
    box(group, 2.5, 2, 620, -280 + i * 60, 1, 0, MAT.silver);
  }
}
function cover(group: THREE.Group) {
  box(group, 621, 3.5, 660, 0, 0, 0, MAT.steel, true);
  box(group, 607, 1, 642, 0, 2, 0, MAT.graphite);
  for (let row = 0; row < 4; row++) for (let i = 0; i < 13; i++) {
    box(group, 20, 1.2, 3, -200 + i * 33, 2.8, -165 + row * 22, MAT.black);
  }
  for (let i = 0; i < 7; i++) {
    box(group, 50, 1.2, 3, -200 + i * 65, 2.8, 135, MAT.black);
  }
  box(group, 78, 4, 12, 0, 4.6, 266, MAT.darkBlue, true);
}
function motherboard(group: THREE.Group) {
  box(group, 438, 5, 390, 0, 0, 0, MAT.pcb, true);
  for (let i = 0; i < 22; i++) {
    box(group, 100 + (i % 3) * 19, 0.5, 0.65, -80 + (i % 4) * 23, 3.4, -170 + i * 14, MAT.gold);
  }
  for (let i = 0; i < 24; i++) {
    box(group, 0.6, 0.5, 56 + (i % 4) * 13, -185 + i * 14.5, 3.5, -34 + (i % 3) * 25, MAT.copperDark);
  }
  for (let i = 0; i < 10; i++) {
    box(group, 8, 6, 8, -192 + i * 32, 5, 147, MAT.graphite);
  }
  for (let i = 0; i < 6; i++) {
    box(group, 85, 5, 5, -168 + i * 60, 6, -179, MAT.black);
  }
  box(group, 88, 4, 70, 128, 5, -103, MAT.black, true);
  box(group, 38, 8, 33, 160, 9, 79, MAT.graphite, true);
  box(group, 55, 8, 42, -156, 8, 63, MAT.steel, true);
  for (const x of [-199, 199]) for (const z of [-170, 170]) bolt(group, x, 3.8, z);
}
function processors(group: THREE.Group) {
  for (const z of [-44, 44]) {
    heatsink(group, 0, z);
  }
}
function memory(group: THREE.Group) {
  for (let i = 0; i < 8; i++) {
    const x = -61 + i * 17.5;
    box(group, 5, 52, 210, x, 0, 0, MAT.pcbDark, true);
    box(group, 5.5, 5, 206, x, -20, 0, MAT.gold);
    for (let j = 0; j < 8; j++) {
      box(group, 6.2, 17, 18, x, 0, -86 + j * 24, MAT.graphite);
    }
    box(group, 8, 6, 8, x, 26, 0, MAT.steel);
  }
}
function storage(group: THREE.Group) {
  box(group, 545, 4, 130, 0, -32, 0, MAT.steel, true);
  box(group, 546, 60, 3, 0, -2, -67, MAT.graphite);
  for (let i = 0; i < 6; i++) {
    frontDrive(group, (i - 2.5) * 88, 0, 78);
  }
}
function cooling(group: THREE.Group) {
  box(group, 538, 8, 77, 0, -30, 0, MAT.graphite, true);
  for (let i = 0; i < 6; i++) fan(group, -221 + i * 88, 0);
}
function power(group: THREE.Group) {
  for (const x of [-32, 32]) {
    box(group, 56, 62, 244, x, 0, 0, MAT.graphite, true);
    box(group, 51, 54, 3.2, x, 0, -125, MAT.steel, true);
    for (let i = 0; i < 5; i++) box(group, 33, 3, 2, x, -19 + i * 9, -127, MAT.black);
    box(group, 20, 8, 3, x, 16, -127, MAT.black);
    box(group, 7, 4, 4, x + 20, 21, -127, MAT.greenLed);
    box(group, 49, 12, 5, x, -18, 123, MAT.darkBlue);
  }
}
function network(group: THREE.Group) {
  box(group, 207, 51, 8, 0, 0, 0, MAT.graphite, true);
  for (let i = 0; i < 4; i++) {
    const x = -66 + i * 45;
    box(group, 28, 21, 5, x, 4, -6, MAT.steel, true);
    box(group, 23, 15, 5.8, x, 4, -9.5, MAT.black);
    box(group, 3, 2, 2, x + 9, 16, -10, MAT.greenLed);
  }
  for (let i = 0; i < 3; i++) box(group, 22, 9, 6, -55 + i * 35, -18, -8, MAT.darkBlue, true);
  for (const x of [-96, 95]) bolt(group, x, 13, -7);
}

export function makePartGeometry(id: ComponentId): THREE.Group {
  const group = new THREE.Group();
  group.name = id;
  group.userData.partId = id;
  const generators: Record<ComponentId, (group: THREE.Group) => void> = {
    chassis, cover, motherboard, processors, memory, storage, cooling, power, network,
  };
  generators[id](group);
  group.traverse(object => { if (object instanceof THREE.Mesh) object.userData.partId = id; });
  return group;
}
