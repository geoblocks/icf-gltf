import * as OBC from "@thatopen/components";
import type { FragmentsGroup } from "@thatopen/fragments";

import { GLTFExporter, GLTFExporterOptions } from 'three/examples/jsm/exporters/GLTFExporter.js';


export interface IfcToGLTFOptions {
  element: HTMLElement;
  url: string | ArrayBuffer;
  webIfcSettings?: OBC.IfcFragmentSettings;
}


export async function ifcToGLTF(options: IfcToGLTFOptions): Promise<{
  metadata: FragmentsGroup["ifcMetadata"];
  glb: ArrayBuffer;
  coordinationMatrix: number[];
}> {

  const components = new OBC.Components();
  const worlds = components.get(OBC.Worlds);

  const world = worlds.create<
    OBC.SimpleScene,
    OBC.SimpleCamera,
    OBC.SimpleRenderer
  >();

  world.scene = new OBC.SimpleScene(components);
  world.renderer = new OBC.SimpleRenderer(components, options.element);
  world.camera = new OBC.SimpleCamera(components);

  components.init();

  // FIXME: what's that?
  world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

  world.scene.setup();

  const grids = components.get(OBC.Grids);
  grids.create(world);

  world.scene.three.background = null;

  const fragments = components.get(OBC.FragmentsManager);
  const fragmentIfcLoader = components.get(OBC.IfcLoader);


  Object.assign(fragmentIfcLoader.settings, options.webIfcSettings);
  if (!fragmentIfcLoader.settings.wasm) {
    await fragmentIfcLoader.setup();
  }


  async function exportModel(model: FragmentsGroup): Promise<ArrayBuffer> {
    const exporter = new GLTFExporter();
    const opts: GLTFExporterOptions = {
      trs: true,
      binary: true,
      onlyVisible: false,
    };

    return (await exporter.parseAsync(model, opts)) as ArrayBuffer;
  }


  async function loadIfc() {
    let data: ArrayBuffer;
    if (typeof options.url === "string") {
      console.log('loading', options.url);
      const file = await fetch(options.url);
      data = await file.arrayBuffer();
    } else if (options.url instanceof ArrayBuffer) {
      data = options.url;
    } else {
      throw new Error("Unsupported url type");
    }

    const buffer = new Uint8Array(data);
    const model: FragmentsGroup = await fragmentIfcLoader.load(buffer);
    world.scene.three.add(model);
  }

  return new Promise((resolve, reject) => {
    loadIfc();
    fragments.onFragmentsLoaded.add(async (model) => {
      try {
        resolve({
          glb: await exportModel(model),
          metadata: model.ifcMetadata,
          coordinationMatrix: model.coordinationMatrix.toArray(),
      });
      } catch (error) {
        reject(error);
      } finally {
        fragments.dispose();
        worlds.delete(world);
      }
    });
    // FIXME: probably sometime it fails.
    // how to be notified?  
  });
}