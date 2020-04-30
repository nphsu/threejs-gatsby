/* eslint-disable no-underscore-dangle */
import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { Object3D } from 'three'
import TWEEN from '@tweenjs/tween.js'

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(-25, 5, 40)
  // camera.rotation.set(0, 0, 0)
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
  return scene
}

const newCube = () => {
  const geometry = new THREE.BoxGeometry(2, 2, 2)
  const material = new THREE.MeshNormalMaterial({ opacity: 0.5, transparent: true })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

const newCubeLine = () => {
  const group = new Object3D()
  const cube1 = newCube()
  const cube2 = newCube()
  const cube3 = newCube()
  cube1.position.set(0, 0, 0)
  cube2.position.set(0, 2, 0)
  cube3.position.set(0, -2, 0)
  group.add(cube1)
  group.add(cube2)
  group.add(cube3)
  return group
}

const newCubePlane = (z1, z2, z3) => {
  const group = new Object3D()
  const line1 = newCubeLine()
  const line2 = newCubeLine()
  const line3 = newCubeLine()
  line1.position.set(0, 0, z1)
  line2.position.set(2, 0, z2)
  line3.position.set(-2, 0, z3)
  group.add(line1)
  group.add(line2)
  group.add(line3)
  return group
}

const animationPlane1 = (plane1: THREE.Object3D) => {
  const _target1 = plane1.children[1].children[0].position
  const _target2 = plane1.children[1].children[1].position
  const _target3 = plane1.children[1].children[2].position
  const _target4 = plane1.children[0].children[0].position
  const _target5 = plane1.children[0].children[1].position
  const _target6 = plane1.children[0].children[2].position
  const _target7 = plane1.children[2].children[0].position
  const _target8 = plane1.children[2].children[1].position
  const _target9 = plane1.children[2].children[2].position

  const target1 = plane1.children[1].children[0].position
  const target2 = plane1.children[1].children[1].position
  const target3 = plane1.children[1].children[2].position
  const target4 = plane1.children[0].children[0].position
  const target5 = plane1.children[0].children[1].position
  const target6 = plane1.children[0].children[2].position
  const target7 = plane1.children[2].children[0].position
  const target8 = plane1.children[2].children[1].position
  const target9 = plane1.children[2].children[2].position

  const openTarget2 = new TWEEN.Tween(target2).to({ x: +3, y: +3, z: 6 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget3 = new TWEEN.Tween(target3).to({ x: +3, y: -3, z: 6 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget4 = new TWEEN.Tween(target4).to({ z: 6 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget5 = new TWEEN.Tween(target5).to({ y: +3, z: 6 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget6 = new TWEEN.Tween(target6).to({ y: -3, z: 6 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget7 = new TWEEN.Tween(target7).to({ x: -3, z: 6 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget8 = new TWEEN.Tween(target8).to({ x: -3, y: +3, z: 6 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget9 = new TWEEN.Tween(target9).to({ x: -3, y: -3, z: 6 }, 500).easing(TWEEN.Easing.Cubic.InOut)

  const rotateTarget1 = new TWEEN.Tween(plane1.rotation).to({ z: `-${2 * Math.PI}` }, 500).easing(TWEEN.Easing.Cubic.InOut)

  const closeTarget1 = new TWEEN.Tween(target1).to({ x: _target1.x, y: _target1.y, z: _target1.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget2 = new TWEEN.Tween(target2).to({ x: _target2.x, y: _target2.y, z: _target2.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget3 = new TWEEN.Tween(target3).to({ x: _target3.x, y: _target3.y, z: _target3.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget4 = new TWEEN.Tween(target4).to({ x: _target4.x, y: _target4.y, z: _target4.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget5 = new TWEEN.Tween(target5).to({ x: _target5.x, y: _target5.y, z: _target5.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget6 = new TWEEN.Tween(target6).to({ x: _target6.x, y: _target6.y, z: _target6.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget7 = new TWEEN.Tween(target7).to({ x: _target7.x, y: _target7.y, z: _target7.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget8 = new TWEEN.Tween(target8).to({ x: _target8.x, y: _target8.y, z: _target8.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget9 = new TWEEN.Tween(target9).to({ x: _target9.x, y: _target9.y, z: _target9.z }, 500).easing(TWEEN.Easing.Cubic.InOut)

  const openTarget = new TWEEN.Tween(target1)
    .to({ x: +3, z: 6 }, 500)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onStart(() => {
      openTarget2.start()
      openTarget3.start()
      openTarget4.start()
      openTarget5.start()
      openTarget6.start()
      openTarget7.start()
      openTarget8.start()
      openTarget9.start()
    })

  const rotateTarget = rotateTarget1
  const closeTarget = closeTarget1.onStart(() => {
    closeTarget2.start()
    closeTarget3.start()
    closeTarget4.start()
    closeTarget5.start()
    closeTarget6.start()
    closeTarget7.start()
    closeTarget8.start()
    closeTarget9.start()
  })

  openTarget.chain(rotateTarget)
  rotateTarget.chain(closeTarget)
  closeTarget.chain(openTarget)
  openTarget.start()
}

const animationPlane2 = (plane1: THREE.Object3D) => {
  const _target1 = plane1.children[1].children[0].position
  const _target2 = plane1.children[1].children[1].position
  const _target3 = plane1.children[1].children[2].position
  const _target4 = plane1.children[0].children[0].position
  const _target5 = plane1.children[0].children[1].position
  const _target6 = plane1.children[0].children[2].position
  const _target7 = plane1.children[2].children[0].position
  const _target8 = plane1.children[2].children[1].position
  const _target9 = plane1.children[2].children[2].position

  const target1 = plane1.children[1].children[0].position
  const target2 = plane1.children[1].children[1].position
  const target3 = plane1.children[1].children[2].position
  const target4 = plane1.children[0].children[0].position
  const target5 = plane1.children[0].children[1].position
  const target6 = plane1.children[0].children[2].position
  const target7 = plane1.children[2].children[0].position
  const target8 = plane1.children[2].children[1].position
  const target9 = plane1.children[2].children[2].position

  const openTarget2 = new TWEEN.Tween(target2).to({ x: +3, y: +3 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget3 = new TWEEN.Tween(target3).to({ x: +3, y: -3 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget4 = new TWEEN.Tween(target4).to({}, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget5 = new TWEEN.Tween(target5).to({ y: +3 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget6 = new TWEEN.Tween(target6).to({ y: -3 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget7 = new TWEEN.Tween(target7).to({ x: -3 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget8 = new TWEEN.Tween(target8).to({ x: -3, y: +3 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget9 = new TWEEN.Tween(target9).to({ x: -3, y: -3 }, 500).easing(TWEEN.Easing.Cubic.InOut)

  const rotateTarget1 = new TWEEN.Tween(plane1.rotation).to({ z: `-${2 * Math.PI}` }, 500).easing(TWEEN.Easing.Cubic.InOut)

  const closeTarget1 = new TWEEN.Tween(target1).to({ x: _target1.x, y: _target1.y, z: _target1.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget2 = new TWEEN.Tween(target2).to({ x: _target2.x, y: _target2.y, z: _target2.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget3 = new TWEEN.Tween(target3).to({ x: _target3.x, y: _target3.y, z: _target3.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget4 = new TWEEN.Tween(target4).to({ x: _target4.x, y: _target4.y, z: _target4.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget5 = new TWEEN.Tween(target5).to({ x: _target5.x, y: _target5.y, z: _target5.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget6 = new TWEEN.Tween(target6).to({ x: _target6.x, y: _target6.y, z: _target6.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget7 = new TWEEN.Tween(target7).to({ x: _target7.x, y: _target7.y, z: _target7.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget8 = new TWEEN.Tween(target8).to({ x: _target8.x, y: _target8.y, z: _target8.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget9 = new TWEEN.Tween(target9).to({ x: _target9.x, y: _target9.y, z: _target9.z }, 500).easing(TWEEN.Easing.Cubic.InOut)

  const openTarget = new TWEEN.Tween(target1)
    .to({ x: +3 }, 500)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onStart(() => {
      openTarget2.start()
      openTarget3.start()
      openTarget4.start()
      openTarget5.start()
      openTarget6.start()
      openTarget7.start()
      openTarget8.start()
      openTarget9.start()
    })

  const rotateTarget = rotateTarget1
  const closeTarget = closeTarget1.onStart(() => {
    closeTarget2.start()
    closeTarget3.start()
    closeTarget4.start()
    closeTarget5.start()
    closeTarget6.start()
    closeTarget7.start()
    closeTarget8.start()
    closeTarget9.start()
  })

  openTarget.chain(rotateTarget)
  rotateTarget.chain(closeTarget)
  closeTarget.chain(openTarget)
  openTarget.start()
}

const animationPlane3 = (plane1: THREE.Object3D) => {
  const _target1 = plane1.children[1].children[0].position
  const _target2 = plane1.children[1].children[1].position
  const _target3 = plane1.children[1].children[2].position
  const _target4 = plane1.children[0].children[0].position
  const _target5 = plane1.children[0].children[1].position
  const _target6 = plane1.children[0].children[2].position
  const _target7 = plane1.children[2].children[0].position
  const _target8 = plane1.children[2].children[1].position
  const _target9 = plane1.children[2].children[2].position

  const target1 = plane1.children[1].children[0].position
  const target2 = plane1.children[1].children[1].position
  const target3 = plane1.children[1].children[2].position
  const target4 = plane1.children[0].children[0].position
  const target5 = plane1.children[0].children[1].position
  const target6 = plane1.children[0].children[2].position
  const target7 = plane1.children[2].children[0].position
  const target8 = plane1.children[2].children[1].position
  const target9 = plane1.children[2].children[2].position

  const openTarget2 = new TWEEN.Tween(target2).to({ x: +3, y: +3, z: +3 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget3 = new TWEEN.Tween(target3).to({ x: +3, y: -3, z: +3 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget4 = new TWEEN.Tween(target4).to({ z: +3 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget5 = new TWEEN.Tween(target5).to({ y: +3, z: +3 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget6 = new TWEEN.Tween(target6).to({ y: -3, z: +3 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget7 = new TWEEN.Tween(target7).to({ x: -3, z: +3 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget8 = new TWEEN.Tween(target8).to({ x: -3, y: +3, z: +3 }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const openTarget9 = new TWEEN.Tween(target9).to({ x: -3, y: -3, z: +3 }, 500).easing(TWEEN.Easing.Cubic.InOut)

  const rotateTarget1 = new TWEEN.Tween(plane1.rotation).to({ z: `-${2 * Math.PI}` }, 500).easing(TWEEN.Easing.Cubic.InOut)

  const closeTarget1 = new TWEEN.Tween(target1).to({ x: _target1.x, y: _target1.y, z: _target1.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget2 = new TWEEN.Tween(target2).to({ x: _target2.x, y: _target2.y, z: _target2.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget3 = new TWEEN.Tween(target3).to({ x: _target3.x, y: _target3.y, z: _target3.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget4 = new TWEEN.Tween(target4).to({ x: _target4.x, y: _target4.y, z: _target4.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget5 = new TWEEN.Tween(target5).to({ x: _target5.x, y: _target5.y, z: _target5.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget6 = new TWEEN.Tween(target6).to({ x: _target6.x, y: _target6.y, z: _target6.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget7 = new TWEEN.Tween(target7).to({ x: _target7.x, y: _target7.y, z: _target7.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget8 = new TWEEN.Tween(target8).to({ x: _target8.x, y: _target8.y, z: _target8.z }, 500).easing(TWEEN.Easing.Cubic.InOut)
  const closeTarget9 = new TWEEN.Tween(target9).to({ x: _target9.x, y: _target9.y, z: _target9.z }, 500).easing(TWEEN.Easing.Cubic.InOut)

  const openTarget = new TWEEN.Tween(target1)
    .to({ x: +3 }, 500)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onStart(() => {
      openTarget2.start()
      openTarget3.start()
      openTarget4.start()
      openTarget5.start()
      openTarget6.start()
      openTarget7.start()
      openTarget8.start()
      openTarget9.start()
    })

  const rotateTarget = rotateTarget1
  const closeTarget = closeTarget1.onStart(() => {
    closeTarget2.start()
    closeTarget3.start()
    closeTarget4.start()
    closeTarget5.start()
    closeTarget6.start()
    closeTarget7.start()
    closeTarget8.start()
    closeTarget9.start()
  })

  openTarget.chain(rotateTarget)
  rotateTarget.chain(closeTarget)
  closeTarget.chain(openTarget)
  openTarget.start()
}

const AnimationRubiksCubeScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = newScene()
    const camera = newCamera()
    const renderer = newRenderer(mount)

    const plane1 = newCubePlane(0, 0, 0)
    const plane2 = newCubePlane(2, 2, 2)
    const plane3 = newCubePlane(-2, -2, -2)
    scene.add(plane1)
    scene.add(plane2)
    scene.add(plane3)

    animationPlane3(plane1)
    animationPlane1(plane2)
    animationPlane2(plane3)

    const render = () => {
      renderer.render(scene, camera)
      camera.lookAt(scene.position)
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
      TWEEN.update()
      // camera.rotation.x += 0.5
      scene.rotation.x += 0.05
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default AnimationRubiksCubeScene
