import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 200
  return camera
}

const newScene = () => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)
  return scene
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

const newImage = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')
  context!.fillStyle = `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`
  context!.fillRect(0, 0, 256, 256)

  return canvas
}

const TestMemoryScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = newScene()
    const camera = newCamera()
    const renderer = newRenderer(mount)

    const render = () => {
      const geometry = new THREE.SphereBufferGeometry(50, Math.random() * 64, Math.random() * 32)
      const texture = new THREE.CanvasTexture(newImage())
      const material = new THREE.MeshBasicMaterial({ map: texture, wireframe: true })

      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)
      renderer.render(scene, camera)

      scene.remove(mesh)

      // clean up

      geometry.dispose()
      material.dispose()
      texture.dispose()
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default TestMemoryScene
