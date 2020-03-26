import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
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

const createDefaultCamera = () => {
  const fov = 40
  const aspect = window.innerWidth / window.innerHeight
  const near = 0.1
  const far = 100
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
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

const createBloomPass = () => {
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
  bloomPass.threshold = params.bloomThreshold
  bloomPass.strength = params.bloomStrength
  bloomPass.radius = params.bloomRadius
  return bloomPass
}

const createBox = (x: number, y: number, z: number) => {
  const geometry = new THREE.BoxGeometry(x, y, z)
  const material = new THREE.MeshNormalMaterial()
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

const BoxAnimationScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)
    const controls = createOrbitControls(camera, renderer)

    // light
    scene.add(new THREE.AmbientLight(0x404040))
    const pointLight = new THREE.PointLight(0xffffff, 1)
    camera.add(pointLight)

    // effect composer
    const composer = new EffectComposer(renderer)
    const renderScene = new RenderPass(scene, camera)
    const bloomPass = createBloomPass()
    composer.addPass(renderScene)
    composer.addPass(bloomPass)

    // box
    const box1 = createBox(0.2, 0.2, 0.2)

    const box2 = createBox(0.2, 0.2, 0.2)
    box2.position.set(0, 0, 0.3)

    const box3 = createBox(0.2, 0.2, 0.2)
    box3.position.set(0, 0, 0.6)

    const box4 = createBox(0.2, 0.2, 0.2)
    box4.position.set(0, 0, 0.9)

    const boxGroup = new THREE.Group()
    boxGroup.add(box1)
    boxGroup.add(box2)
    boxGroup.add(box3)
    boxGroup.add(box4)
    boxGroup.position.set(0, 0, 0.3)
    scene.add(boxGroup)

    const newBox = createBox(0.2, 0.2, 0.2)
    newBox.position.set(0.6, 0.6, 1.2)

    // tween
    let newGroupPosition = boxGroup.position
    const moveBoxGroup = new TWEEN.Tween(newGroupPosition)
      .to({ z: '-0.3' }, 2000)
      .easing(TWEEN.Easing.Linear.None)
      .onComplete(obj => {
        boxGroup.position.set(0, 0, obj.z)
        newGroupPosition = obj
      })

    const fallNewBox = new TWEEN.Tween(newBox.position)
      .to({ x: 0, y: 0, z: 1.2 })
      .easing(TWEEN.Easing.Linear.None)
      .onStart(obj => {
        boxGroup.add(newBox)
      })
      .onComplete(obj => {
        // boxGroup.remove(boxGroup.children[0])
      })

    moveBoxGroup.chain(fallNewBox)
    fallNewBox.chain(moveBoxGroup)
    moveBoxGroup.start()

    // TODO: let mixer: THREE.AnimationMixer
    const stats = Stats()
    function animate() {
      requestAnimationFrame(animate)
      const delta = clock.getDelta()
      // TODO: mixer.update(delta)
      stats.update()
      composer.render(delta)
      TWEEN.update()
    }

    animate()

    // GUI
    const gui = new GUI()
    gui.add(params, 'exposure', 0.1, 2).onChange((value: number) => {
      renderer.toneMappingExposure = value ** 4.0
    })
    gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange((value: number) => {
      bloomPass.threshold = Number(value)
    })
    gui.add(params, 'bloomStrength', 0.0, 3.0).onChange((value: number) => {
      bloomPass.strength = Number(value)
    })
    gui
      .add(params, 'bloomRadius', 0.0, 1.0)
      .step(0.01)
      .onChange((value: number) => {
        bloomPass.radius = Number(value)
      })
  }, [])
  return <div css={css``} ref={mount} />
}
export default BoxAnimationScene
