import {ifcToGLTF} from './src/index.js';

import * as Cesium from '@cesium/engine';
import "@cesium/engine/Source/Widget/CesiumWidget.css";

window.CESIUM_BASE_URL = '/';

const {glb, coordinationMatrix, metadata} = await ifcToGLTF({
  element: document.getElementById('threeJSContainer')!,
  url: "https://thatopen.github.io/engine_components/resources/small.ifc",
})

console.log('Got GLTF for ', metadata, 'at', coordinationMatrix);

function download(file: File) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}

const blob = new Blob([glb]);
// const exportedFile = new File([blob], "example.glb");
// download(exportedFile);


const modelOrigin = [6.137499506, 46.192506022, 425.999];
const modelOrientation = [90, 0, 0]

// Your access token can be found at: https://ion.cesium.com/tokens.
// Replace `your_access_token` with your Cesium ion access token.


// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Cesium.CesiumWidget('cesiumContainer', {
    terrain: Cesium.Terrain.fromWorldTerrain(),
});

viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(...modelOrigin),
    duration: 0,
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-15.0),
    }
});


const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator(
  "north",
  "west"
);

const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
  Cesium.Cartesian3.fromDegrees(6.137499506, 46.192506022, 925.999),
  new Cesium.HeadingPitchRoll(...modelOrientation.map(Cesium.Math.toRadians)),
  Cesium.Ellipsoid.WGS84,
  fixedFrameTransform
);

const blobURL = URL.createObjectURL(blob);  // FIXME: when is this released?
console.log(blobURL)
const csModel = await Cesium.Model.fromGltfAsync({
  modelMatrix: modelMatrix,
  scene: viewer.scene,
  url: blobURL,
  silhouetteColor: Cesium.Color.WHITE.withAlpha(0.5),
  silhouetteSize: 2.0,
  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
});
URL.revokeObjectURL(blobURL);

viewer.scene.primitives.add(csModel);

