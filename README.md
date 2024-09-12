# IFC-GlTF

## The library

This is a (basic) library to convert IFC files to glTF.
See https://technical.buildingsmart.org/standards/ifc/ifc-formats/

It runs entirely on the client side:
- IFC files are parsed by web-ifc, which uses a C++ library converted as WebAssembly;
- the models are loaded in Three.js;
- then exported with the ThreeJS GlTF exporter.

At that point you can load the resulting glTF in any 3D library.
You can look at the provided demo to see how to do that with CesiumJS.

## Status

This is alpha software.

## Alternative

The main alternative is to do the conversion in a backend.

Ideally, it should be possible to directly transform from IFC to glTF, without using ThreeJS.
Such library does not exist (to our knowledge).
