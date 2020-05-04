import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 2000)
  camera.position.set(46, 22, -21)
  return camera
}

const newRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.autoClear = true
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputEncoding = THREE.sRGBEncoding
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const newScene = () => {
  const scene = new THREE.Scene()
  return scene
}

const newSpotlight = color => {
  const newObj = new THREE.SpotLight(color, 2)
  newObj.castShadow = true
  newObj.angle = 0.3
  newObj.penumbra = 0.2
  newObj.decay = 2
  newObj.distance = 50
  return newObj
}

const SpotlightsScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = newScene()
    const camera = newCamera()
    const renderer = newRenderer(mount)
    const controls = new OrbitControls(camera, renderer.domElement)

    const matFloor = new THREE.MeshPhongMaterial()
    const matBox = new THREE.MeshPhongMaterial({ color: 0xaaaaaa })
    const geoFloor = new THREE.PlaneBufferGeometry(2000, 2000)
    const geoBox = new THREE.BoxBufferGeometry(3, 1, 2)
    const mshFloor = new THREE.Mesh(geoFloor, matFloor)
    mshFloor.rotation.x = -Math.PI * 0.5
    const mshBox = new THREE.Mesh(geoBox, matBox)
    matFloor.color.set(0x808080)
    mshFloor.receiveShadow = true
    mshFloor.position.set(0, -0.05, 0)
    mshBox.castShadow = true
    mshBox.receiveShadow = true
    mshBox.position.set(0, 5, 0)

    const ambient = new THREE.AmbientLight(0x111111)

    const spotLight1 = newSpotlight(0xff7f00)
    const spotLight2 = newSpotlight(0x00ff7f)
    const spotLight3 = newSpotlight(0x7f00ff)
    spotLight1.position.set(15, 40, 45)
    spotLight2.position.set(0, 40, 35)
    spotLight3.position.set(-15, 40, 45)
    const lightHelper1 = new THREE.SpotLightHelper(spotLight1)
    const lightHelper2 = new THREE.SpotLightHelper(spotLight2)
    const lightHelper3 = new THREE.SpotLightHelper(spotLight3)

    scene.add(mshFloor)
    scene.add(mshBox)
    scene.add(ambient)
    scene.add(spotLight1, spotLight2, spotLight3)
    scene.add(lightHelper1, lightHelper2, lightHelper3)

    controls.target.set(0, 7, 0)
    controls.maxPolarAngle = Math.PI / 2
    controls.update()

    const tween = light => {
      new TWEEN.Tween(light)
        .to(
          {
            angle: Math.random() * 0.7 + 0.1,
            penumbra: Math.random() + 1
          },
          Math.random() * 3000 + 2000
        )
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
      new TWEEN.Tween(light.position)
        .to(
          {
            x: Math.random() * 30 - 15,
            y: Math.random() * 10 + 15,
            z: Math.random() * 30 - 15
          },
          Math.random() * 3000 + 2000
        )
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
    }
    const render = () => {
      TWEEN.update()

      if (lightHelper1) lightHelper1.update()
      if (lightHelper2) lightHelper2.update()
      if (lightHelper3) lightHelper3.update()

      renderer.render(scene, camera)

      requestAnimationFrame(render)
    }
    const animate = () => {
      tween(spotLight1)
      tween(spotLight2)
      tween(spotLight3)
      setTimeout(animate, 2000)
    }
    render()
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default SpotlightsScene
