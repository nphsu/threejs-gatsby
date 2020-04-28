import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'

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

const newObjects = () => {
  const group = new THREE.Object3D()
  const geometry = new THREE.SphereBufferGeometry(1, 4, 4)
  for (let i = 0; i < 100; i++) {
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random(), flatShading: true })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
    mesh.position.multiplyScalar(Math.random() * 400)
    mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
    mesh.scale.x = Math.random() * 50
    mesh.scale.y = Math.random() * 50
    mesh.scale.z = Math.random() * 50
    group.add(mesh)
  }
  return group
}

const newAmbientLight = () => {
  const light = new THREE.AmbientLight(0x222222)
  return light
}

const newDirectionalLight = () => {
  const light = new THREE.DirectionalLight(0xffffff)
  light.position.set(1, 1, 1)
  return light
}

const PostprocessingGlitchSceme = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = newScene()
    const camera = newCamera()
    const renderer = newRenderer(mount)

    const objects = newObjects()
    scene.add(objects)

    const ambientLight = newAmbientLight()
    scene.add(ambientLight)

    const directionalLight = newDirectionalLight()
    scene.add(directionalLight)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const glitchPass = new GlitchPass()
    composer.addPass(glitchPass)

    const render = () => {
      composer.render()
    }
    const animate = () => {
      requestAnimationFrame(animate)
      objects.rotation.x += 0.005
      objects.rotation.y += 0.01
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default PostprocessingGlitchSceme
