import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.y = 150
  camera.position.z = 500
  return camera
}

const newRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  return renderer
}

const newScene = () => {
  const scene = new THREE.Scene()
  return scene
}

const newLignt = () => {
  const light = new THREE.PointLight(0xffffff)
  light.position.set(500, 500, 500)
  return light
}

const EffectsAsciiScene = () => {
  const mount = createRef<HTMLInputElement>()
  const start = Date.now()
  useEffect(() => {
    const scene = newScene()
    const camera = newCamera()
    const renderer = newRenderer(mount)

    const light1 = newLignt()
    scene.add(light1)

    const light = new THREE.PointLight(0xffffff, 0.25)
    light.position.set(-500, -500, -500)
    scene.add(light)

    const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(200, 20, 10), new THREE.MeshPhongMaterial({ flatShading: true }))
    scene.add(sphere)

    const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(400, 400), new THREE.MeshBasicMaterial({ color: 0xe0e0e0 }))
    plane.position.y = -200
    plane.rotation.x = -Math.PI / 2
    scene.add(plane)

    const effect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: true })
    effect.setSize(window.innerWidth, window.innerHeight)
    effect.domElement.style.color = 'white'
    effect.domElement.style.backgroundColor = 'black'
    mount.current!.appendChild(effect.domElement)
    const controls = new TrackballControls(camera, effect.domElement)

    const render = () => {
      const timer = Date.now() - start
      sphere.position.y = Math.abs(Math.sin(timer * 0.002)) * 150
      sphere.rotation.x = timer * 0.0003
      sphere.rotation.z = timer * 0.0002
      controls.update()
      effect.render(scene, camera)
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default EffectsAsciiScene
