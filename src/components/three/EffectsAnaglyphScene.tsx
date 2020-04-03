import React, { useEffect, createRef } from 'react'
import * as THREE from 'three'
import { AnaglyphEffect } from 'three/examples/jsm/effects/AnaglyphEffect.js'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 100)
  camera.position.z = 3
  // camera.setFocalLength(3)
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const loadCubeTexture = () => {
  const path = './textures/pisa/'
  const format = '.png'
  const urls = [
    `${path}px${format}`,
    `${path}nx${format}`,
    `${path}py${format}`,
    `${path}ny${format}`,
    `${path}pz${format}`,
    `${path}nz${format}`
  ]
  const textureCube = new THREE.CubeTextureLoader().load(urls)
  return textureCube
}

const EffectsAnaglyphScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    // load
    const textureCube = loadCubeTexture()

    // scene
    const scene = new THREE.Scene()
    scene.background = textureCube

    // camera
    const camera = createDefaultCamera()

    // renderer
    const renderer = createDefaultRenderer(mount)

    // object
    const spheres = []

    const geometry = new THREE.SphereBufferGeometry(0.1, 32, 16)
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: textureCube })
    for (let i = 0; i < 500; i++) {
      const mesh = new THREE.Mesh(geometry, material)

      mesh.position.x = Math.random() * 10 - 5
      mesh.position.y = Math.random() * 10 - 5
      mesh.position.z = Math.random() * 10 - 5

      const scaleSize = Math.random() * 3 + 1
      mesh.scale.x = scaleSize
      mesh.scale.y = scaleSize
      mesh.scale.z = scaleSize

      scene.add(mesh)

      spheres.push(mesh)
    }

    // effect
    const width = window.innerWidth || 2
    const height = window.innerHeight || 2
    const effect = new AnaglyphEffect(renderer)
    effect.setSize(width, height)

    // mouse
    let mouseX = 0
    let mouseY = 0
    let windowHalfX = window.innerWidth / 2
    let windowHalfY = window.innerHeight / 2

    // listener
    const onDocumentMouseMove = event => {
      mouseX = (event.clientX - windowHalfX) / 100
      mouseY = (event.clientY - windowHalfY) / 100
    }
    mount.current!.addEventListener('mousemove', onDocumentMouseMove, false)

    // resize
    const onWindowResize = () => {
      windowHalfX = window.innerWidth / 2
      windowHalfY = window.innerHeight / 2
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      effect.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onWindowResize, false)

    // render
    const render = () => {
      const timer = 0.0001 * Date.now()
      camera.position.x += (mouseX - camera.position.x) * 0.05
      camera.position.y += (-mouseY - camera.position.y) * 0.05
      camera.lookAt(scene.position)
      for (let i = 0, il = spheres.length; i < il; i++) {
        const sphere = spheres[i]
        sphere.position.x = 5 * Math.cos(timer + i)
        sphere.position.y = 5 * Math.sin(timer + i * 1.1)
      }

      effect.render(scene, camera)
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
    }
    animate()
  }, [])
  return <div ref={mount} />
}

export default EffectsAnaglyphScene
