import * as THREE from "three";
import { IfcViewerAPI } from "web-ifc-viewer";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { Vector3 } from "three";

const container = document.getElementById("viewer-container");
const viewer = new IfcViewerAPI({
  container,
  backgroundColor: new THREE.Color(0xddddff),
});
const gui = new GUI();
viewer.grid.setGrid();
viewer.axes.setAxes();
const scene = viewer.context.getScene();
console.log("Scene : ", scene);
let displacement = 0;
let mouseHelper;
let cones = [];
let selectedCones = [];
const params = {
  minScale: 10,
  maxScale: 20,
  rotate: true,
  clear: function () {
    removeCones();
  },
};
let gltfN = 0;
let ifcN = 0;

//Initial cone
const geometry1 = new THREE.ConeGeometry(0.05, 0.15, 16);
geometry1.translate(0, -0.075, 0);
const material1 = new THREE.MeshLambertMaterial({ color: 0xcccccc });

window.addEventListener("load", init);

function init() {
  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);

  line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
  scene.add(line);

  mouseHelper = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 3),
    new THREE.MeshNormalMaterial()
  );
  mouseHelper.visible = false;
  scene.add(mouseHelper);

  //show files
  for (let f of files) {
    if (f.type === "IFC") loadIfc(f.file, f.description, f.source);
    if (f.type === "GLTF") loadGltf(f.file, f.description, f.source);
  }

  //GUI controls
  gui.add(params, "clear");
  gui.open();
}

async function loadIfc(url, description, source) {
  await viewer.IFC.setWasmPath("./assets/wasm/");
  const model = await viewer.IFC.loadIfcUrl(url);
  // viewer.shadowDropper.renderShadow(model.modelID);
  // model.position.x = xposition;
  // xposition += 10;
  console.log("IFC Model ID = ", model.modelID);
  ifcN += 1;
  ifcFolder = gui.addFolder("IFC Model no. " + ifcN);
  ifcFolder.add(model, "visible");
  ifcFolder.add(model.position, "x").min(-3).max(3).step(0.01).name("X-axis");
  ifcFolder.add(model.position, "y").min(-3).max(3).step(0.01).name("Y-axis");
  ifcFolder.add(model.position, "z").min(-3).max(3).step(0.01).name("Z-axis");
  ifcFolder.close();
}

async function loadGltf(url, description, source) {
  const model = await viewer.GLTF.load(url);
  //if(url === './assets/gltf/nefertiti/scene.gltf') scale(model);
  gltfN += 1;
  displacement += 30;
  console.log("GLTF Model ID = ", model);
  model.position.z = displacement;
  gltfFolder = gui.addFolder("GLTF Model no. " + gltfN);
  gltfFolder.add(model, "visible");
  gltfFolder
    .add(model.position, "x")
    .min(-90)
    .max(90)
    .step(0.01)
    .name("X-axis");
  gltfFolder
    .add(model.position, "y")
    .min(-90)
    .max(90)
    .step(0.01)
    .name("Y-axis");
  gltfFolder
    .add(model.position, "z")
    .min(-90)
    .max(90)
    .step(0.01)
    .name("Z-axis");
  gltfFolder.close();
}

function checkIfcIntersection() {
  const clicPosition = viewer.context.castRayIfc();
  if (clicPosition) {
    console.log("IFC Intersection : ", clicPosition);
    const mesh = clicPosition.object.mesh;
    if (mesh) {
      const position = clicPosition.object.position;
      const p = clicPosition?.point;
      p.x = p.x - position.x;
      p.y = p.y - position.y;
      p.z = p.z - position.z;
      let n = new Vector3();
      n = clicPosition?.face?.normal.clone();
      const cone = new THREE.Mesh(geometry1, material1);
      mesh.add(cone);
      cone.position.copy(p);
      let quaternion = new THREE.Quaternion();
      //let up = new THREE.Vector3(0,-1,0);
      let up = clicPosition.object.up.clone();
      up.y = -up.y;
      quaternion.setFromUnitVectors(up, n);
      cone.setRotationFromQuaternion(quaternion);
      cones.push(cone);
      addLabel(clicPosition.point);
    } else {
        selectCone(clicPosition.object);
    }
  }
}

function checkGltfIntersection() {
  const clicPosition = viewer.GLTF.castRay();
  if (clicPosition) {
    console.log("Intersection : ", clicPosition);
    // const mesh = clicPosition.object.mesh;
    // const position = clicPosition.object.position;
    // const p = clicPosition?.point;
    // p.x = p.x - position.x;
    // p.y = p.y - position.y;
    // p.z = p.z - position.z;
    // let n = new Vector3();
    // n = clicPosition?.face?.normal.clone();
    // const cone = new THREE.Mesh( geometry1, material1 );
    // mesh.add( cone );
    // cone.position.copy(p);
    // let quaternion = new THREE.Quaternion();
    // let up = new THREE.Vector3(0,-1,0);
    // quaternion.setFromUnitVectors(up, n);
    // cone.setRotationFromQuaternion(quaternion);
    // cones.push(cone);
  }
}



const files = [
  {
    file: "./assets/ifc/test.ifc",
    type: "IFC",
    description: "Example file 0",
    source: "IFC.JS",
  },
  {
    file: "./assets/gltf/nefertiti/scene.gltf",
    type: "GLTF",
    description: "Example file 1",
    source: "Sketchfab",
  },
  {
    file: "./assets/gltf/nhm_london/scene.gltf",
    type: "GLTF",
    description: "Example file 2",
    source: "Sketchfab",
  },
  {
    file: "./assets/gltf/sailing_ship/scene.gltf",
    type: "GLTF",
    description: "Example file 3",
    source: "Sketchfab",
  },
  {
    file: "./assets/gltf/the_great_drawing_room/scene.gltf",
    type: "GLTF",
    description: "Example file 4",
    source: "Sketchfab",
  },
];

//Catch events
let moved = false;

addEventListener("change", () => {
  moved = true;
});
addEventListener("pointerdown", () => {
  moved = false;
});
addEventListener("dblclick", () => {
  if (moved === false) {
    checkIfcIntersection();
    //checkGltfIntersection();
  }
});

addEventListener("click", () => {
  if (moved === false) {
    checkCone();
  }
});

addEventListener("pointermove", (event) => {
  if (event.isPrimary) {
    //do something
  }
});

addEventListener("keyup", (event) => {
    if (event.key === "d") {
        removeSelectedCones();
    }
})


/**
 * Annotations
 */

function removeCones() {
  cones.forEach((cone) => {
    //scene.remove( cone );
    cone.removeFromParent();
    cone.geometry.dispose();
    cone.material.dispose();
    cone.geometry = null;
    cone.material = null;
  });

  cones = [];
}

function selectCone(annotation) {
  const cone = cones.find((cone) => cone.uuid === annotation.uuid);
  if(cone){
    coneChangeColor(cone, 0xff0000);
    selectedCones.push(cone);
    const index = cones.indexOf(cone);
    if (index > -1) cones.splice(index, 1);
  } else {
    const cone = selectedCones.find((cone) => cone.uuid === annotation.uuid);
    if(cone){
        coneChangeColor(cone, 0xffff00);
        cones.push(cone);
        const index = selectedCones.indexOf(cone);
        if (index > -1) selectedCones.splice(index, 1);
    }
  }
}

function coneChangeColor(cone, color) {
    const material = cone.material.clone();
    material.color.setHex(color);
    cone.material = material;
}

function removeSelectedCones() {
    selectedCones.forEach((cone) => {
        cone.removeFromParent();
        cone.geometry.dispose();
        cone.material.dispose();
        cone.geometry = null;
        cone.material = null;
    });

    selectedCones = [];
}

function checkCone() {
    //do something
}

/**
 * Tentative de labels sur IFC
 */
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.pointerEvents = 'none';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild( labelRenderer.domElement );

function addLabel(location) {
    const result = window.prompt("Annotation:");

    const base = document.createElement( 'div' );
    base.className = 'base-label';

    const deleteButton = document.createElement( 'button' );
    deleteButton.textContent = 'X';
    deleteButton.className = 'delete-button hidden';
    base.appendChild(deleteButton);

    base.onmouseenter = () => deleteButton.classList.remove('hidden');
    base.onmouseleave = () => deleteButton.classList.add('hidden');

    const postit = document.createElement( 'div' );
    postit.className = 'label';
    postit.textContent = result;
    base.appendChild(postit);

    const ifcJsTitle = new CSS2DObject( base );
    ifcJsTitle.position.copy(location);
    scene.add(ifcJsTitle);

    deleteButton.onclick = () => {
        base.remove();
        ifcJsTitle.element = null;
        ifcJsTitle.removeFromParent();
    }
}