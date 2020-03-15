import React, { useEffect, createRef } from 'react'
import * as THREE from 'three'
import helvetiker from '../../fonts/helvetiker_bold.typeface.json'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 100
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const createDefaultMaterial = () => {
  const uniforms = {
    amplitude: { value: 5.0 },
    opacity: { value: 0.3 },
    color: { value: new THREE.Color(0xffffff) }
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  })
  return material
}

const createDefaultGeometry = () => {
  const font = new THREE.FontLoader().parse(helvetiker)
  const geometry = new THREE.TextBufferGeometry('three.js', {
    font,
    size: 10,
    height: 3,
    curveSegments: 10,
    bevelThickness: 5,
    bevelSize: 1.5,
    bevelEnabled: true,
    bevelSegments: 10
  })
  geometry.center()
  return geometry
}

const addLine = (scene: THREE.Scene, geometry: THREE.BufferGeometry | THREE.Geometry, material: THREE.Material) => {
  // mesh
  const line = new THREE.Line(geometry, material)
  scene.add(line)
  return line
}

const defaultAminatin = (object: THREE.Object3D, scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) => {
  const animate = () => {
    requestAnimationFrame(animate)
    const time = Date.now() * 0.001
    object.rotation.y = 0.25 * time
    renderer.render(scene, camera)
  }
  animate()
}

const BaseThreeScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    // scene
    const scene = new THREE.Scene()

    // camera
    const camera = createDefaultCamera()

    // renderer
    const renderer = createDefaultRenderer(mount)

    // object
    const geometry = createDefaultGeometry()
    const material = createDefaultMaterial()
    const line = addLine(scene, geometry, material)

    // animation
    defaultAminatin(line, scene, camera, renderer)
  }, [])
  return <div ref={mount} />
}

export default BaseThreeScene
