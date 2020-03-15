// TODO: solve the problem of moving the slider
import React, { useEffect, createRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { ClassNames } from '@emotion/core'
import helvetiker from '../../fonts/helvetiker_bold.typeface.json'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
  // camera.position.z = 100
  camera.position.set(2, 4, 7)
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setScissorTest(true)
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
    height: 10,
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

const defaultAminatin = (
  object: THREE.Object3D,
  sceneL: THREE.Scene,
  sceneR: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer
) => {
  const animate = () => {
    requestAnimationFrame(animate)
    const time = Date.now() * 0.001
    object.rotation.y = 0.25 * time
    // renderer.render(scene, camera)

    const sliderPos = window.innerWidth / 2
    renderer.setScissor(0, 0, sliderPos, window.innerHeight)
    renderer.render(sceneL, camera)

    renderer.setScissor(sliderPos, 0, window.innerWidth, window.innerHeight)
    renderer.render(sceneR, camera)
  }
  animate()
}

const MultiThreeScene = () => {
  const mount = createRef<HTMLInputElement>()
  const slider = createRef<HTMLInputElement>()
  // const container = createRef<HTMLElement>().current!
  // const container = document.getElementById<HTMLElement>('container')!
  // const slider = document.getElementById<HTMLElement>('slider')!
  console.log(slider)

  useEffect(() => {
    // scene
    const sceneL = new THREE.Scene()
    sceneL.background = new THREE.Color(0xff00ff)
    const sceneR = new THREE.Scene()
    sceneR.background = new THREE.Color(0x8fbcd4)

    // renderer
    const renderer = createDefaultRenderer(mount)

    // camera
    const camera = createDefaultCamera()
    const controls = new OrbitControls(camera, renderer.domElement)

    // object
    const geometry = createDefaultGeometry()
    const material = createDefaultMaterial()
    const line = addLine(sceneL, geometry, material)

    // animation
    defaultAminatin(line, sceneL, sceneR, camera, renderer)

    let sliderPos = window.innerWidth / 2
    let sliderMoved = false
    let clicked = false
    const slideReady = () => {
      clicked = true
      controls.enabled = false
    }

    function slideFinish() {
      clicked = false
      controls.enabled = true
    }
    function slideMove(e) {
      if (!clicked) return false

      sliderMoved = true

      sliderPos = e.pageX || e.touches[0].pageX

      // prevent the slider from being positioned outside the window bounds
      if (sliderPos < 0) sliderPos = 0
      if (sliderPos > window.innerWidth) sliderPos = window.innerWidth

      slider.current!.style.left = `${sliderPos - slider.current!.offsetWidth / 2}px`
      console.log(sliderPos)
      console.log(slider.current!.style.left)
      return true
    }
    slider.current!.addEventListener('mousedown', slideReady)
    slider.current!.addEventListener('touchstart', slideReady)

    window.addEventListener('mouseup', slideFinish)
    window.addEventListener('touchend', slideFinish)

    window.addEventListener('mousemove', slideMove)
    window.addEventListener('touchmove', slideMove)
  }, [])
  return (
    <ClassNames>
      {({ css, cx }) => (
        <div ref={mount} id="container">
          <div
            ref={slider}
            className={css`
              color: hotpink;
              position: absolute;
              cursor: ew-resize;
              width: 40px;
              height: 40px;
              background-color: #2196f3;
              opacity: 0.7;
              border-radius: 50%;
              top: calc(50% - 20px);
              left: calc(50% - 20px);
            `}
          />
        </div>
      )}
    </ClassNames>
  )
}

export default MultiThreeScene
