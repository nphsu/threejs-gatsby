import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000)
  camera.position.z = 1750
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.outputEncoding = THREE.sRGBEncoding
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const DrawRangeScene = () => {
  const mount = createRef<HTMLInputElement>()
  const particlesData = []

  let positions
  let colors
  let particles
  let pointCloud
  let particlePositions
  let linesMesh

  const maxParticleCount = 1000
  const particleCount = 500
  const r = 800
  const rHalf = r / 2

  const effectController = {
    showDots: true,
    showLines: true,
    minDistance: 150,
    limitConnections: false,
    maxConnections: 20,
    particleCount: 500
  }

  // const initGUI = () => {
  //   const gui = new GUI()

  //   gui.add(effectController, 'showDots').onChange(function (value) {
  //     pointCloud.visible = value
  //   })
  //   gui.add(effectController, 'showLines').onChange(function (value) {
  //     linesMesh.visible = value
  //   })
  //   gui.add(effectController, 'minDistance', 10, 300)
  //   gui.add(effectController, 'limitConnections')
  //   gui.add(effectController, 'maxConnections', 0, 30, 1)
  //   gui.add(effectController, 'particleCount', 0, maxParticleCount, 1).onChange(function (value) {
  //     particleCount = parseInt(value)
  //     particles.setDrawRange(0, particleCount)
  //   })
  //   return gui
  // }
  useEffect(() => {
    // initGUI()
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    const controls = new OrbitControls(camera, mount.current!)
    const renderer = createDefaultRenderer(mount)
    const group = new THREE.Group()
    scene.add(group)
    const helper = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxBufferGeometry(r, r, r)))
    helper.material.color.setHex(0x101010)
    helper.material.blending = THREE.AdditiveBlending
    helper.material.transparent = true
    group.add(helper)

    const segments = maxParticleCount * maxParticleCount
    positions = new Float32Array(segments * 3)
    colors = new Float32Array(segments * 3)
    const pMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: false
    })
    particles = new THREE.BufferGeometry()
    particlePositions = new Float32Array(maxParticleCount * 3)
    for (let i = 0; i < maxParticleCount; i++) {
      const x = Math.random() * r - r / 2
      const y = Math.random() * r - r / 2
      const z = Math.random() * r - r / 2
      particlePositions[i * 3] = x
      particlePositions[i * 3 + 1] = y
      particlePositions[i * 3 + 2] = z
      particlesData.push({
        velocity: new THREE.Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2),
        numConnections: 0
      })
    }
    particles.setDrawRange(0, particleCount)
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage))
    pointCloud = new THREE.Points(particles, pMaterial)
    group.add(pointCloud)

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage))
    geometry.computeBoundingSphere()
    geometry.setDrawRange(0, 0)
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true
    })
    linesMesh = new THREE.LineSegments(geometry, material)
    group.add(linesMesh)

    const stats = Stats()
    mount.current!.appendChild(stats.dom)

    const render = () => {
      const time = Date.now() * 0.001

      group.rotation.y = time * 0.1
      renderer.render(scene, camera)
    }
    const animate = () => {
      let vertexpos = 0
      let colorpos = 0
      let numConnected = 0

      for (var i = 0; i < particleCount; i++) particlesData[i].numConnections = 0

      for (var i = 0; i < particleCount; i++) {
        // get the particle
        const particleData = particlesData[i]

        particlePositions[i * 3] += particleData.velocity.x
        particlePositions[i * 3 + 1] += particleData.velocity.y
        particlePositions[i * 3 + 2] += particleData.velocity.z

        if (particlePositions[i * 3 + 1] < -rHalf || particlePositions[i * 3 + 1] > rHalf)
          particleData.velocity.y = -particleData.velocity.y

        if (particlePositions[i * 3] < -rHalf || particlePositions[i * 3] > rHalf) particleData.velocity.x = -particleData.velocity.x

        if (particlePositions[i * 3 + 2] < -rHalf || particlePositions[i * 3 + 2] > rHalf)
          particleData.velocity.z = -particleData.velocity.z

        if (effectController.limitConnections && particleData.numConnections >= effectController.maxConnections) continue

        // Check collision
        for (let j = i + 1; j < particleCount; j++) {
          const particleDataB = particlesData[j]
          if (effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections) continue

          const dx = particlePositions[i * 3] - particlePositions[j * 3]
          const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1]
          const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2]
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (dist < effectController.minDistance) {
            particleData.numConnections++
            particleDataB.numConnections++

            const alpha = 1.0 - dist / effectController.minDistance

            positions[vertexpos++] = particlePositions[i * 3]
            positions[vertexpos++] = particlePositions[i * 3 + 1]
            positions[vertexpos++] = particlePositions[i * 3 + 2]

            positions[vertexpos++] = particlePositions[j * 3]
            positions[vertexpos++] = particlePositions[j * 3 + 1]
            positions[vertexpos++] = particlePositions[j * 3 + 2]

            colors[colorpos++] = alpha
            colors[colorpos++] = alpha
            colors[colorpos++] = alpha

            colors[colorpos++] = alpha
            colors[colorpos++] = alpha
            colors[colorpos++] = alpha

            numConnected++
          }
        }
      }

      linesMesh.geometry.setDrawRange(0, numConnected * 2)
      linesMesh.geometry.attributes.position.needsUpdate = true
      linesMesh.geometry.attributes.color.needsUpdate = true

      pointCloud.geometry.attributes.position.needsUpdate = true

      requestAnimationFrame(animate)

      stats.update()
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default DrawRangeScene
