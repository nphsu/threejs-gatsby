import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js'

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.z = 400
  return camera
}

const newRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.autoClear = true
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const newScene = () => {
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x000000, 1, 1000)
  return scene
}

const newBox = () => {
  const geometry = new THREE.BoxBufferGeometry(150, 150, 150, 2, 2, 2)
  const material = new THREE.MeshNormalMaterial()
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

const AfterImageScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = newScene()
    const camera = newCamera()
    const renderer = newRenderer(mount)

    const mesh = newBox()
    mesh.position.setX(-150)
    scene.add(mesh)
    const mesh2 = newBox()
    mesh2.position.setX(150)
    scene.add(mesh2)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const afterimagePass = new AfterimagePass()
    composer.addPass(afterimagePass)

    const render = () => {
      mesh.rotation.x += 0.005
      mesh.rotation.y += 0.01
      mesh2.rotation.x += 0.05
      mesh2.rotation.y += 0.1
      composer.render()
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default AfterImageScene
