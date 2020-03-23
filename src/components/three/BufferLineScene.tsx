import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { Camera, Scene } from './common/index'

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.autoClear = true
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const BufferLineScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = Scene()
    const camera = Camera(1000)
    const segments = 10000

    const geometry = new THREE.BufferGeometry()
    const material = new THREE.LineBasicMaterial({ vertexColors: true })

    const positions = []
    const colors = []

    const r = 800

    for (let i = 0; i < segments; i++) {
      const x = Math.random() * r - r / 2
      const y = Math.random() * r - r / 2
      const z = Math.random() * r - r / 2

      // positions

      positions.push(x / 2, y / 2, z / 2)

      // colors

      colors.push(x / r + 0.5)
      colors.push(y / r + 0.5)
      colors.push(z / r + 0.5)
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.computeBoundingSphere()

    const line = new THREE.Line(geometry, material)
    scene.add(line)
    const renderer = createDefaultRenderer(mount)
    const render = () => {
      const time = Date.now() * 0.001

      line.rotation.x = time * 0.25
      line.rotation.y = time * 0.5

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
export default BufferLineScene
