import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const params = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0
}
const clock = new THREE.Clock()

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000)
  camera.position.set(20, 10, 50)
  return camera
}

const newScene = () => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe1bee7)
  return scene
}

const newRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.autoClear = true
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const newCylinder = () => {
  const geometry = new THREE.CylinderGeometry(2, 2, 0.5, 8)
  const material = new THREE.MeshBasicMaterial({ color: 0x303f9f, opacity: 0.9 })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

const trackballControll = (camera, renderer) => {
  const controls = new TrackballControls(camera, renderer.domElement)
  controls.rotateSpeed = 1.0
  controls.zoomSpeed = 1.2
  controls.panSpeed = 0.8
  controls.noZoom = false
  controls.noPan = false
  controls.staticMoving = true
  controls.dynamicDampingFactor = 0.3
  return controls
}

const newBloomPass = () => {
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
  bloomPass.threshold = params.bloomThreshold
  bloomPass.strength = params.bloomStrength
  bloomPass.radius = params.bloomRadius
  return bloomPass
}

const newParticles = () => {
  const particleNum = 1000
  const particles = new THREE.Object3D()
  for (let i = 0; i < particleNum; i++) {
    const position = new THREE.Vector3()
    position.x = Math.random() * 40 - 20
    position.y = Math.random() * 40 - 20
    position.z = Math.random() * 40 - 20
    const geometry = new THREE.SphereGeometry(0.1, 0.1, 0.1)
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(position.x, position.y, position.z)
    particles.add(mesh)
  }
  return particles
}

const moveUpDown = (object: THREE.Object3D, duration: number) => {
  new TWEEN.Tween(object.position)
    .to({ x: object.position.x, y: object.position.y + 2, z: object.position.z }, duration)
    .repeat(Infinity)
    .easing(TWEEN.Easing.Cubic.InOut)
    .yoyo(true)
    .start()
}

const newLine = (...points) => {
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff })
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const line = new THREE.Line(geometry, material)
  return line
}

const DiskFieldAnimation = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = newScene()
    const camera = newCamera()
    const renderer = newRenderer(mount)

    const controls = trackballControll(camera, renderer)

    scene.add(new THREE.AmbientLight(0x404040))
    const pointLight = new THREE.PointLight(0xffffff, 1)
    camera.add(pointLight)

    // effect composer
    const composer = new EffectComposer(renderer)
    const renderScene = new RenderPass(scene, camera)
    const bloomPass = newBloomPass()
    composer.addPass(renderScene)
    composer.addPass(bloomPass)

    const cylinder1 = newCylinder()
    const cylinder2 = newCylinder()
    const cylinder3 = newCylinder()
    const cylinder4 = newCylinder()
    const cylinder5 = newCylinder()
    cylinder1.position.set(-10, -1, -4)
    cylinder2.position.set(0, 0, 0)
    cylinder3.position.set(10, 3, 2)
    cylinder4.position.set(-20, -6, 8)
    cylinder5.position.set(20, 6, 18)
    moveUpDown(cylinder1, 2000)
    moveUpDown(cylinder2, 1500)
    moveUpDown(cylinder3, 2500)
    scene.add(cylinder1)
    scene.add(cylinder2)
    scene.add(cylinder3)
    scene.add(cylinder4)
    scene.add(cylinder5)

    const line = newLine(cylinder4.position, cylinder1.position, cylinder2.position, cylinder3.position, cylinder5.position)
    scene.add(line)

    const particles = newParticles()
    scene.add(particles)

    const render = () => {
      controls.update()
      renderer.render(scene, camera)
    }
    const animate = () => {
      requestAnimationFrame(animate)

      const time = Date.now() * 0.001
      particles.rotation.y = 0.25 * time
      render()
      TWEEN.update()
      // composer.render(delta)
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default DiskFieldAnimation
