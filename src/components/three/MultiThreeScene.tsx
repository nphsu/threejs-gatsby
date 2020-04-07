import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const createDefaultCamera = (mount: React.RefObject<HTMLInputElement>) => {
  const camera = new THREE.PerspectiveCamera(35, mount.current!.clientWidth / mount.current!.clientHeight, 0.1, 10)
  camera.position.set(2, 4, 7)
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(mount.current!.clientWidth, mount.current!.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setScissorTest(true)
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const MultiThreeScene = () => {
  const mount = createRef<HTMLInputElement>()
  const slider = createRef<HTMLInputElement>()

  let sliderPos = window.innerWidth / 2
  let sliderMoved = false
  useEffect(() => {
    const sceneL = new THREE.Scene()
    sceneL.background = new THREE.Color(0xff00ff)
    const sceneR = new THREE.Scene()
    sceneR.background = new THREE.Color(0x8fbcd4)
    const camera = createDefaultCamera(mount)
    const controls = new OrbitControls(camera, mount.current!)
    const renderer = createDefaultRenderer(mount)

    // init mesh
    const geoB = new THREE.BoxBufferGeometry(2, 2, 2)
    const matB = new THREE.MeshStandardMaterial({ color: 0x0000ff })
    const meshB = new THREE.Mesh(geoB, matB)
    sceneL.add(meshB)

    const geoA = new THREE.IcosahedronBufferGeometry(1, 0)
    const matA = new THREE.MeshStandardMaterial({ color: 0xff0000 })
    const meshA = new THREE.Mesh(geoA, matA)
    sceneR.add(meshA)

    // init light
    const light1 = new THREE.DirectionalLight()
    light1.position.set(20, 20, 20)
    sceneL.add(light1)
    sceneR.add(light1.clone())

    const light2 = new THREE.DirectionalLight()
    light2.position.set(-20, 20, 20)
    sceneL.add(light2)
    sceneR.add(light2.clone())

    const render = () => {
      renderer.setScissor(0, 0, sliderPos, window.innerHeight)
      renderer.render(sceneL, camera)

      renderer.setScissor(sliderPos, 0, window.innerWidth, window.innerHeight)
      renderer.render(sceneR, camera)
    }
    renderer.setAnimationLoop(() => {
      render()
    })

    let clicked = false
    const slideReady = () => {
      clicked = true
      controls.enabled = false
    }
    const slideFinish = () => {
      clicked = false
      controls.enabled = true
    }
    const slideMove = e => {
      if (!clicked) return false

      sliderMoved = true
      sliderPos = e.pageX

      // prevent the slider from being positioned outside the window bounds
      if (sliderPos < 0) sliderPos = 0
      if (sliderPos > window.innerWidth) sliderPos = window.innerWidth

      slider.current!.style.left = `${sliderPos - slider.current!.offsetWidth / 2}px`
    }

    const onWindowResize = () => {
      camera.aspect = mount.current!.clientWidth / mount.current!.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.current!.clientWidth, mount.current!.clientHeight)
      if (!sliderMoved) sliderPos = window.innerWidth / 2
    }
    slider.current!.addEventListener('mousedown', slideReady)
    slider.current!.addEventListener('touchstart', slideReady)

    window.addEventListener('mouseup', slideFinish)
    window.addEventListener('touchend', slideFinish)

    window.addEventListener('mousemove', slideMove)
    window.addEventListener('touchmove', slideMove)

    window.addEventListener('resize', onWindowResize)
  }, [])
  return (
    <div
      css={css`
        position: absolute;
        width: 100%;
        height: 100%;
      `}
      ref={mount}
    >
      <div
        css={css`
          position: absolute;
          cursor: ew-resize;

          width: 40px;
          height: 40px;
          background-color: #2196f3;
          opacity: 0.7;
          border-radius: 50%;

          top: calc(50% - 20px);
          left: calc(50% - 20px);
        `}
        ref={slider}
      />
    </div>
  )
}
export default MultiThreeScene
