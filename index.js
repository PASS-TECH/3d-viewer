import * as THREE from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { Vector3 } from 'three';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new THREE.Color(0xddddff) });
viewer.grid.setGrid();
viewer.axes.setAxes();
const scene = viewer.context.getScene();
let xposition = 0;
let mouseHelper;
let cones=[];
const params = {
    minScale: 10,
    maxScale: 20,
    rotate: true,
    clear: function () {
        removeCones();
    }
};

//Initial cone
const geometry1 = new THREE.ConeGeometry( 0.05, 0.15, 8);
geometry1.translate(0,-0.075,0);
const material1 = new THREE.MeshLambertMaterial( {color: 0xff0000} );

window.addEventListener( 'load', init );

function init() {

    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints( [ new THREE.Vector3(), new THREE.Vector3() ] );

    line = new THREE.Line( geometry, new THREE.LineBasicMaterial() );
    scene.add( line );

    mouseHelper = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 3 ), new THREE.MeshNormalMaterial() );
    mouseHelper.visible = false;
    scene.add( mouseHelper );


    //show files
    for (let f of files) {
        if (f.type === "IFC") loadIfc(f.file);
        if (f.type === "GLTF") loadGltf(f.file);
    } 

    const gui = new GUI();

    gui.add( params, 'minScale', 1, 30 );
    gui.add( params, 'maxScale', 1, 30 );
    gui.add( params, 'rotate' );
    gui.add( params, 'clear' );
    gui.open();


}

async function loadIfc(url) {
    await viewer.IFC.setWasmPath("./assets/wasm/");
    const model = await viewer.IFC.loadIfcUrl(url);
    // viewer.shadowDropper.renderShadow(model.modelID);   
    model.position.x = xposition;
    xposition += 10;
}

async function loadGltf(url) {
    const model = await viewer.GLTF.load(url);
    model.position.z = xposition;
    xposition += 20;
}

function checkIntersection(){
    const clicPosition = viewer.context.castRayIfc();
    console.log('Intersection : ', clicPosition);
    const p = clicPosition?.point;
    let n = new Vector3();
    n = clicPosition?.face?.normal.clone();
    const cone = new THREE.Mesh( geometry1, material1 );
    scene.add( cone );
    cone.position.copy(p);
    let quaternion = new THREE.Quaternion();
    let up = new THREE.Vector3(0,-1,0);
    quaternion.setFromUnitVectors(up, n);
    cone.setRotationFromQuaternion(quaternion);
    cones.push(cone);
}

const files = [
    {
        "file" : './assets/ifc/test.ifc',
        "type" : "IFC",
        "description" : "Example file",
        "source" : "IFC.JS"
    },
    {
        "file" : './assets/gltf/nefertiti/scene.gltf',
        "type" : "GLTF",
        "description" : "Example file",
        "source" : "Sketchfab"
    },
    {
        "file" : './assets/gltf/nhm_london/scene.gltf',
        "type" : "GLTF",
        "description" : "Example file",
        "source" : "Sketchfab"
    },
    {
        "file" : './assets/gltf/sailing_ship/scene.gltf',
        "type" : "GLTF",
        "description" : "Example file",
        "source" : "Sketchfab"
    },
    {
        "file" : './assets/gltf/the_great_drawing_room/scene.gltf',
        "type" : "GLTF",
        "description" : "Example file",
        "source" : "Sketchfab"
    }
];

//Catch events
let moved = false;

addEventListener( 'change', () => {moved = true;});
addEventListener( 'pointerdown', () => {moved = false;});
addEventListener('dblclick', () => { 
    if ( moved === false ) {
        checkIntersection(); 
    }
});

addEventListener( 'pointermove', (event) => {
    if ( event.isPrimary ) {
        //do something
    }
});

function removeCones() {
    cones.forEach((cone) => {
        //scene.remove( cone );
        cone.removeFromParent();
        cone.geometry.dispose();
        cone.material.dispose();
        cone.geometry = null;
        cone.material = null;
    });

    //cones.length = 0;
    cones = [];
}