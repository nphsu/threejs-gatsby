import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import fileGlb from '../../../public/bread.glb'

const params = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0
}
const clock = new THREE.Clock()

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100)
  camera.position.set(-5, 2.5, -3.5)
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.autoClear = true
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const createOrbitControls = (camera: THREE.Camera, renderer: THREE.WebGLRenderer) => {
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.maxPolarAngle = Math.PI * 0.5
  controls.minDistance = 1
  controls.maxDistance = 10
}

const GLTFScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)
    const controls = createOrbitControls(camera, renderer)

    scene.add(new THREE.AmbientLight(0x404040))
    const pointLight = new THREE.PointLight(0xffffff, 1)
    camera.add(pointLight)

    const renderScene = new RenderPass(scene, camera)

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
    bloomPass.threshold = params.bloomThreshold
    bloomPass.strength = params.bloomStrength
    bloomPass.radius = params.bloomRadius

    const composer = new EffectComposer(renderer)
    composer.addPass(renderScene)
    composer.addPass(bloomPass)

    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
    const material = new THREE.MeshNormalMaterial()
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    let mixer: THREE.AnimationMixer
    const stats = Stats()
    function animate() {
      requestAnimationFrame(animate)
      const delta = clock.getDelta()
      mixer.update(delta)
      stats.update()
      composer.render()
    }
    new GLTFLoader().load('./glTF/DamagedHelmet.gltf', function (gltf) {
      console.log(gltf)
      const model = gltf.scene

      scene.add(model)

      mixer = new THREE.AnimationMixer(model)
      const clip = gltf.animations[0]
      // mixer.clipAction(clip.optimize()).play()

      animate()
    })

    const gui = new GUI()

    gui.add(params, 'exposure', 0.1, 2).onChange(function (value) {
      renderer.toneMappingExposure = Math.pow(value, 4.0)
    })

    gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
      bloomPass.threshold = Number(value)
    })

    gui.add(params, 'bloomStrength', 0.0, 3.0).onChange(function (value) {
      bloomPass.strength = Number(value)
    })

    gui
      .add(params, 'bloomRadius', 0.0, 1.0)
      .step(0.01)
      .onChange(function (value) {
        bloomPass.radius = Number(value)
      })

    // renderer.render(scene, camera)
  }, [])
  return <div css={css``} ref={mount} />
  // return <div id="cesiumContainer" />
}
export default GLTFScene
