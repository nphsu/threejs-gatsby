import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(400, 200, 0)
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

const SimpleScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    // scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xcccccc)
    scene.fog = new THREE.FogExp2(0xcccccc, 0.002)

    // camera
    const camera = createDefaultCamera()

    const renderer = createDefaultRenderer(mount)

    // control
    const controls = new MapControls(camera, mount.current!)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.minDistance = 100
    controls.maxDistance = 500
    controls.maxPolarAngle = Math.PI / 2

    // geometry
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1)
    geometry.translate(0, 0.5, 0)
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true })

    for (let i = 0; i < 500; i++) {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.x = Math.random() * 1600 - 800
      mesh.position.y = 0
      mesh.position.z = Math.random() * 1600 - 800
      mesh.scale.x = 20
      mesh.scale.y = Math.random() * 80 + 10
      mesh.scale.z = 20
      mesh.updateMatrix()
      mesh.matrixAutoUpdate = false
      scene.add(mesh)
    }

    // light
    const light1 = new THREE.DirectionalLight(0xffffff)
    light1.position.set(1, 1, 1)
    scene.add(light1)

    const light2 = new THREE.DirectionalLight(0x002288)
    light2.position.set(-1, -1, -1)
    scene.add(light2)

    const light3 = new THREE.AmbientLight(0x222222)
    scene.add(light3)

    const render = () => {
      renderer.render(scene, camera)
    }
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default SimpleScene
