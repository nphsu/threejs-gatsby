import * as THREE from 'three'

export const Camera = (z?: number) => {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000)
  camera.position.z = z || 5
  return camera
}
