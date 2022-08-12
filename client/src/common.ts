import { Object3D, Vector3 } from "three";

export const TRANSPARENT_RENDER_ORDER = 100000;
export const OPAQUE_RENDER_ORDER = 100;

export const TRANSPARENT_SORT = (object: Object3D) => (a: any, b: any) => {
  // Custom chunk sorting logic, to ensure that the closest objects are rendered last.
  if (
    a.object &&
    a.object.isMesh &&
    a.object.userData.isChunk &&
    b.object &&
    b.object.isMesh &&
    b.object.userData.isChunk
  ) {
    const aPos = new Vector3();
    const bPos = new Vector3();

    const { object: aObj } = a;
    const { object: bObj } = b;

    const { geometry: aGeo } = aObj;
    const { geometry: bGeo } = bObj;

    if (aGeo && aGeo.boundingBox) {
      aGeo.boundingBox.getCenter(aPos);
    } else {
      aObj.getWorldPosition(aPos);
    }

    if (bGeo && bGeo.boundingBox) {
      bGeo.boundingBox.getCenter(bPos);
    } else {
      bObj.getWorldPosition(bPos);
    }

    return (
      bPos.distanceToSquared(object.position) -
      aPos.distanceToSquared(object.position)
    );
  }

  // https://github.com/mrdoob/three.js/blob/d0af538927/src/renderers/webgl/WebGLRenderLists.js
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder;
  } else if (a.renderOrder !== b.renderOrder) {
    return a.renderOrder - b.renderOrder;
  } else if (a.z !== b.z) {
    return b.z - a.z;
  } else {
    return a.id - b.id;
  }
};
