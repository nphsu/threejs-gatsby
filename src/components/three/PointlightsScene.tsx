import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'

const clock = new THREE.Clock()

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 300)
  camera.position.set(0, 15, 150)
  camera.lookAt(0, 0, 0)
  return camera
}

const newRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.autoClear = true
  renderer.outputEncoding = THREE.sRGBEncoding
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const newScene = () => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x040306)
  scene.fog = new THREE.Fog(0x040306, 10, 300)
  return scene
}

const newTexture = () => {
  const textureLoader = new THREE.TextureLoader()
  const texture = textureLoader.load('./textures/disturb.jpg')
  texture.repeat.set(20, 10)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.encoding = THREE.sRGBEncoding
  return texture
}

const PointlightsScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = newScene()
    const camera = newCamera()
    const renderer = newRenderer(mount)

    const texture = newTexture()
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, map: texture })
    const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(800, 400, 2, 2), groundMaterial)
    mesh.position.y = -5
    mesh.rotation.x = -Math.PI / 2
    scene.add(mesh)

    const objectMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 1.0 })
    const objectGeometry = new THREE.TorusBufferGeometry(1.5, 0.4, 8, 16)
    for (let i = 0; i < 5000; i++) {
      const object = new THREE.Mesh(objectGeometry, objectMaterial)
      object.position.x = 400 * (0.5 - Math.random())
      object.position.y = 50 * (0.5 - Math.random()) + 25
      object.position.z = 200 * (0.5 - Math.random())
      object.rotation.y = 3.14 * (0.5 - Math.random())
      object.rotation.x = 3.14 * (0.5 - Math.random())
      object.matrixAutoUpdate = false
      object.updateMatrix()
      scene.add(object)
    }

    const intensity = 2.5
    const distance = 100
    const decay = 2.0

    const c1 = 0xff0040
    const c2 = 0x0040ff
    const c3 = 0x80ff80
    const c4 = 0xffaa00
    const c5 = 0x00ffaa
    const c6 = 0xff1100

    const sphere = new THREE.SphereBufferGeometry(0.25, 16, 8)

    const light1 = new THREE.PointLight(c1, intensity, distance, decay)
    light1.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: c1 })))
    scene.add(light1)

    const light2 = new THREE.PointLight(c2, intensity, distance, decay)
    light2.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: c2 })))
    scene.add(light2)

    const light3 = new THREE.PointLight(c3, intensity, distance, decay)
    light3.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: c3 })))
    scene.add(light3)

    const light4 = new THREE.PointLight(c4, intensity, distance, decay)
    light4.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: c4 })))
    scene.add(light4)

    const light5 = new THREE.PointLight(c5, intensity, distance, decay)
    light5.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: c5 })))
    scene.add(light5)

    const light6 = new THREE.PointLight(c6, intensity, distance, decay)
    light6.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: c6 })))
    scene.add(light6)

    const dlight = new THREE.DirectionalLight(0xffffff, 0.05)
    dlight.position.set(0.5, 1, 0).normalize()
    scene.add(dlight)

    const controls = new TrackballControls(camera, renderer.domElement)
    controls.rotateSpeed = 1.0
    controls.zoomSpeed = 1.2
    controls.panSpeed = 0.8
    controls.dynamicDampingFactor = 0.15
    controls.keys = [65, 83, 68]

    const render = () => {
      const time = Date.now() * 0.00025
      const d = 150

      light1.position.x = Math.sin(time * 0.7) * d
      light1.position.z = Math.cos(time * 0.3) * d

      light2.position.x = Math.cos(time * 0.3) * d
      light2.position.z = Math.sin(time * 0.7) * d

      light3.position.x = Math.sin(time * 0.7) * d
      light3.position.z = Math.sin(time * 0.5) * d

      light4.position.x = Math.sin(time * 0.3) * d
      light4.position.z = Math.sin(time * 0.5) * d

      light5.position.x = Math.cos(time * 0.3) * d
      light5.position.z = Math.sin(time * 0.5) * d

      light6.position.x = Math.cos(time * 0.7) * d
      light6.position.z = Math.cos(time * 0.5) * d

      // controls.update(clock.getDelta())
      controls.update()
      renderer.render(scene, camera)
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default PointlightsScene
