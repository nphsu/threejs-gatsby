import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 15000)
  camera.position.z = 3200
  return camera
}

const createScene = () => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)
  return scene
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

const createSphere = () => {
  const geometry = new THREE.SphereBufferGeometry(100, 20, 20)
  const material = new THREE.MeshNormalMaterial()
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

const createCylinder = () => {
  const geometry = new THREE.CylinderBufferGeometry(0, 10, 100, 12)
  geometry.rotateX(Math.PI / 2)
  const material = new THREE.MeshNormalMaterial()
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = Math.random() * 4000 - 2000
  mesh.position.y = Math.random() * 4000 - 2000
  mesh.position.z = Math.random() * 4000 - 2000
  mesh.scale.x = Math.random() * 4 + 2
  mesh.scale.y = Math.random() * 4 + 2
  mesh.scale.z = Math.random() * 4 + 2
  return mesh
}

const resizeListener = (camera: THREE.PerspectiveCamera, renderer: THREE.Renderer) => {
  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onWindowResize, false)
}

const MiscLookAtScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    // base components
    const scene = createScene()
    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)

    // mesh
    const sphere = createSphere()
    scene.add(sphere)
    for (let i = 0; i < 1000; i++) {
      const mesh = createCylinder()
      scene.add(mesh)
    }

    // listener
    resizeListener(camera, renderer)
    let mouseX = 0
    let mouseY = 0
    const onDocumentMouseMove = event => {
      mouseX = (event.clientX - window.innerWidth / 2) * 10
      mouseY = (event.clientY - window.innerHeight / 2) * 10
    }
    mount.current!.addEventListener('mousemove', onDocumentMouseMove, false)

    // render
    const render = () => {
      const time = Date.now() * 0.0005
      sphere.position.x = Math.sin(time * 0.7) * 2000
      sphere.position.y = Math.cos(time * 0.5) * 2000
      sphere.position.z = Math.cos(time * 0.3) * 2000
      for (let i = 1, l = scene.children.length; i < l; i++) {
        scene.children[i].lookAt(sphere.position)
      }
      camera.position.x += (mouseX - camera.position.x) * 0.05
      camera.position.y += (-mouseY - camera.position.y) * 0.05
      camera.lookAt(scene.position)
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
export default MiscLookAtScene
