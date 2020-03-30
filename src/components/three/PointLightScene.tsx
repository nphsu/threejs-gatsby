import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(0, 10, 40)
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  // renderer.shadowMap.enabled = true
  // renderer.shadowMap.type = THREE.BasicShadowMap
  // renderer.autoClear = true
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const generateTexture = (mount: React.RefObject<HTMLInputElement>) => {
  const canvas = document.createElement('canvas')
  canvas.width = 2
  canvas.height = 2

  const context = canvas.getContext('2d')
  context!.fillStyle = 'white'
  context!.fillRect(0, 1, 2, 1)

  return canvas
}

const createLight = (color, mount: React.RefObject<HTMLInputElement>) => {
  const intensity = 1.5

  const pointLight = new THREE.PointLight(color, intensity, 20)
  pointLight.castShadow = true
  pointLight.shadow.camera.near = 1
  pointLight.shadow.camera.far = 60
  pointLight.shadow.bias = -0.005

  const geometry = new THREE.SphereBufferGeometry(0.3, 12, 6)
  const material = new THREE.MeshBasicMaterial({ color })
  material.color.multiplyScalar(intensity)
  const sphere = new THREE.Mesh(geometry, material)
  pointLight.add(sphere)

  const texture = new THREE.CanvasTexture(generateTexture(mount))
  texture.magFilter = THREE.NearestFilter
  texture.wrapT = THREE.RepeatWrapping
  texture.wrapS = THREE.RepeatWrapping
  texture.repeat.set(1, 4.5)

  const geometry2 = new THREE.SphereBufferGeometry(2, 32, 8)
  const material2 = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    alphaMap: texture,
    alphaTest: 0.5
  })

  const sphere2 = new THREE.Mesh(geometry2, material2)
  sphere2.castShadow = true
  sphere2.receiveShadow = true
  pointLight.add(sphere2)

  // custom distance material
  const distanceMaterial = new THREE.MeshDistanceMaterial({
    alphaMap: material.alphaMap,
    alphaTest: material.alphaTest
  })
  sphere2.customDistanceMaterial = distanceMaterial

  return pointLight
}

const PointLightScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    // scene
    const scene = new THREE.Scene()
    scene.add(new THREE.AmbientLight(0x111122))

    // camera
    const camera = createDefaultCamera()

    const renderer = createDefaultRenderer(mount)

    // control
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 10, 0)
    controls.update()

    // light
    const pointLight = createLight(0x0088ff, mount)
    scene.add(pointLight)

    const pointLight2 = createLight(0xff8888, mount)
    scene.add(pointLight2)

    // geometry
    const geometry = new THREE.BoxBufferGeometry(30, 30, 30)

    const material = new THREE.MeshPhongMaterial({
      color: 0xa0adaf,
      shininess: 10,
      specular: 0x111111,
      side: THREE.BackSide
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = 10
    mesh.receiveShadow = true
    scene.add(mesh)

    const render = () => {
      let time = performance.now() * 0.001

      pointLight.position.x = Math.sin(time * 0.6) * 9
      pointLight.position.y = Math.sin(time * 0.7) * 9 + 6
      pointLight.position.z = Math.sin(time * 0.8) * 9

      pointLight.rotation.x = time
      pointLight.rotation.z = time

      time += 10000

      pointLight2.position.x = Math.sin(time * 0.6) * 9
      pointLight2.position.y = Math.sin(time * 0.7) * 9 + 6
      pointLight2.position.z = Math.sin(time * 0.8) * 9

      pointLight2.rotation.x = time
      pointLight2.rotation.z = time

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
export default PointLightScene
