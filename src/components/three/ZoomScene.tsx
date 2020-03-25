import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'

const createDefaultCamera = () => {
  const fov = 45
  const aspect = window.innerWidth / window.innerHeight
  const near = 0.1
  const far = 10000
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.set(0, 300, 3500)
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

const createTrackballControls = (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
  const trackballControls = new TrackballControls(camera, renderer.domElement)
  trackballControls.rotateSpeed = 1.0
  trackballControls.zoomSpeed = 1.0
  trackballControls.panSpeed = 1.0
  trackballControls.staticMoving = true
  return trackballControls
}

const onMouseDown = (event: MouseEvent, camera: THREE.Camera, scene: THREE.Scene) => {
  event.preventDefault()

  // mouse position
  const mouse = { x: 0, y: 0 }
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  // raycaster
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children)

  if (intersects.length > 0) {
    const objPosition = intersects[0].object.position
    const cameraPosition = camera.position
    const target = { x: objPosition.x + 200, y: objPosition.y + 200, z: objPosition.z + 200 }

    const tween = new TWEEN.Tween(cameraPosition).to(target, 2000)
    tween.easing(TWEEN.Easing.Sinusoidal.InOut)
    // tween.onUpdate(() => { })
    tween.start()
  } else {
    const tween = new TWEEN.Tween(camera.position).to({ x: 0, y: 300, z: 3500 }, 2000)
    tween.easing(TWEEN.Easing.Sinusoidal.InOut)
    // tween.onUpdate(() => { })
    tween.start()
  }
}

const ZoomScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)

    // Trackball Controls
    const controls = createTrackballControls(camera, renderer)

    // Clock
    const clock = new THREE.Clock()

    // obj1
    const materialA = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const geometryA = new THREE.BoxGeometry(100, 100, 100)
    const cubeA = new THREE.Mesh(geometryA, materialA)
    cubeA.position.set(0, 100, 0)
    scene.add(cubeA)

    // obj2
    const materialB = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const geometryB = new THREE.BoxGeometry(100, 100, 100)
    const cubeB = new THREE.Mesh(geometryB, materialB)
    cubeB.position.set(500, 100, 250)
    scene.add(cubeB)

    // listener
    // doesn't work when using trackballcontrols
    // mount.current!.addEventListener('mousemove', event => onMouseDown(event, camera, scene), false)
    mount.current!.addEventListener('mouseup', event => onMouseDown(event, camera, scene), false)

    const render = () => {
      controls.update()
      renderer.render(scene, camera)
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
      TWEEN.update()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default ZoomScene
