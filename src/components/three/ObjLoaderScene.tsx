import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { OBJLoader2 } from 'three/examples/jsm/loaders/OBJLoader2.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import { OBJLoader } from './loader/OBJLoader'

const createDefaultCamera = () => {
  const fov = 45
  const aspect = 2 // the canvas default
  const near = 0.1
  const far = 100
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.set(0, 10, 20)
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

const ObjLoaderScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    const controls = new OrbitControls(camera, mount.current!)
    controls.target.set(0, 5, 0)
    controls.update()
    const ambientLight = new THREE.AmbientLight(0x404040)
    const directionalLight1 = new THREE.DirectionalLight(0xc0c090)
    const directionalLight2 = new THREE.DirectionalLight(0xc0c090)
    directionalLight1.position.set(-100, -50, 100)
    directionalLight2.position.set(100, 50, -100)
    scene.add(ambientLight)
    scene.add(directionalLight1)
    scene.add(directionalLight2)
    const helper = new THREE.GridHelper(1200, 60, 0xff4444, 0x404040)
    scene.add(helper)

    const objLoader = new OBJLoader2()
    objLoader.load('https://threejsfundamentals.org/threejs/resources/models/windmill/windmill.obj', root => {
      scene.add(root)
    })
    const renderer = createDefaultRenderer(mount)
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default ObjLoaderScene
