import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js'
import fileGlb from '../../../public/bread.glb'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000)
  camera.position.z = 5
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

const GLTFScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
    const material = new THREE.MeshNormalMaterial()
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const loader = new GLTFLoader()

    // LODING GLB FILE FROM SRC FOLDER
    loader.load(
      fileGlb,
      gltf => {
        // ADD MODEL TO THE SCENE
        scene.add(gltf.scene)
      },
      undefined,

      error => {
        console.log(error)
      }
    )
    // const loader = new GLTFLoader().setPath('static/glTF/')
    // console.log(loader)
    // loader.load('DamagedHelmet.gltf', function (gltf) {
    //   console.log(gltf)
    // })

    const renderer = createDefaultRenderer(mount)
    renderer.render(scene, camera)
  }, [])
  return <div css={css``} ref={mount} />
  // return <div id="cesiumContainer" />
}
export default GLTFScene
