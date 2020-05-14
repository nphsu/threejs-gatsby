import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20)
  camera.position.set(-1.8, 0.6, 2.7)
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.8
  renderer.outputEncoding = THREE.sRGBEncoding
  // renderer.autoClear = true
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const createOrbitControls = (camera: THREE.Camera, renderer: THREE.WebGLRenderer, render: any) => {
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change', render) // use if there is no animation loop
  controls.minDistance = 2
  controls.maxDistance = 10
  controls.target.set(0, 0, -0.2)
  controls.update()
}

const changeColor = (x, y, newMesh) => {
  const fromX = Math.abs(x) * 100
  const fromY = Math.abs(y) * 100
  const hex = `0x${fromX}${fromY}`
  console.log('hex', hex)
  newMesh.material.color.setHex(hex)
}

const GLTFScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)
    const render = () => {
      const time = Date.now() * 0.001
      scene.rotation.y = 0.25 * time
      renderer.render(scene, camera)
    }
    createOrbitControls(camera, renderer, render)

    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()

    // mouse
    let mouseX = 0
    let mouseY = 0
    const windowHalfX = window.innerWidth / 2
    const windowHalfY = window.innerHeight / 2

    new RGBELoader()
      .setDataType(THREE.UnsignedByteType)
      .setPath('./textures/equirectangular/')
      .load('royal_esplanade_1k.hdr', function (texture) {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture

        scene.background = envMap
        scene.environment = envMap

        texture.dispose()
        pmremGenerator.dispose()

        const roughnessMipmapper = new RoughnessMipmapper(renderer)
        const loader = new GLTFLoader().setPath('./gltf/DamagedHelmet/glTF/')
        loader.load('DamagedHelmet.gltf', function (gltf) {
          gltf.scene.traverse(function (child) {
            if (child.isMesh) {
              roughnessMipmapper.generateMipmaps(child.material)
            }
          })

          const newMesh = new THREE.Mesh(gltf.scene.children[0].geometry, gltf.scene.children[0].material)
          newMesh.rotation.x = 45
          scene.add(newMesh)

          mount.current!.addEventListener('click', () => changeColor(mouseX, mouseY, newMesh), true)

          roughnessMipmapper.dispose()

          render()
        })
      })

    scene.add(new THREE.AmbientLight(0x404040))
    const pointLight = new THREE.PointLight(0xffffff, 1)
    camera.add(pointLight)

    const onDocumentMouseMove = event => {
      mouseX = (event.clientX - windowHalfX) / 100
      mouseY = (event.clientY - windowHalfY) / 100
    }
    mount.current!.addEventListener('mousemove', onDocumentMouseMove, false)

    const animate = () => {
      requestAnimationFrame(animate)
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
  // return <div id="cesiumContainer" />
}
export default GLTFScene
