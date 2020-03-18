import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 400
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.autoClear = false
  renderer.setClearColor(0x000000, 0.0)
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const createOuterIcosahedron = () => {
  const geometry = new THREE.IcosahedronGeometry(7, 1)
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    wireframe: true,
    side: THREE.DoubleSide
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.scale.x = 16
  mesh.scale.y = 16
  mesh.scale.z = 16
  return mesh
}

const createIcosahedron = () => {
  const geometry = new THREE.IcosahedronGeometry(3, 1)
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    flatShading: true
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.scale.x = 16
  mesh.scale.y = 16
  mesh.scale.z = 16
  return mesh
}

const createParticles = () => {
  const particles = new THREE.Object3D()
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    flatShading: true
  })
  const geometry = new THREE.TetrahedronGeometry(2, 0)
  for (let i = 0; i < 1000; i++) {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
    mesh.position.multiplyScalar(90 + Math.random() * 700)
    mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
    particles.add(mesh)
  }
  return particles
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

const GradientScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    // scene
    const scene = new THREE.Scene()

    // camera
    const camera = createDefaultCamera()

    // renderer
    const renderer = createDefaultRenderer(mount)

    // object
    const outerIcosahedron = createOuterIcosahedron()
    scene.add(outerIcosahedron)
    const icosahedron = createIcosahedron()
    scene.add(icosahedron)
    const particles = createParticles()
    scene.add(particles)

    // ambient light
    const ambientLight = new THREE.AmbientLight(0x999999)
    scene.add(ambientLight)

    // lights
    const lights = []
    lights[0] = new THREE.DirectionalLight(0xffffff, 1)
    lights[0].position.set(1, 0, 0)
    lights[1] = new THREE.DirectionalLight(0x11e8bb, 1)
    lights[1].position.set(0.75, 1, 0.5)
    lights[2] = new THREE.DirectionalLight(0x8200c9, 1)
    lights[2].position.set(-0.75, -1, 0.5)
    scene.add(lights[0])
    scene.add(lights[1])
    scene.add(lights[2])

    // animation
    defaultAminatin(icosahedron, scene, camera, renderer)
    defaultAminatin(outerIcosahedron, scene, camera, renderer)
    defaultAminatin(particles, scene, camera, renderer)
  }, [])
  return (
    <div
      css={css`
        background: linear-gradient(to bottom, #11e8bb 0%, #8200c9 100%);
      `}
    >
      <div ref={mount} />
    </div>
  )
}

export default GradientScene
