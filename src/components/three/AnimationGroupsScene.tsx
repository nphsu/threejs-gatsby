import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(50, 50, 100)
  return camera
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

const AnimationGroupsScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    camera.lookAt(scene.position)
    const renderer = createDefaultRenderer(mount)

    const animationGroup = new THREE.AnimationObjectGroup()
    const geometry = new THREE.BoxBufferGeometry(5, 5, 5)
    const material = new THREE.MeshBasicMaterial({ transparent: true })
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const mesh = new THREE.Mesh(geometry, material)

        mesh.position.x = 32 - 16 * i
        mesh.position.y = 0
        mesh.position.z = 32 - 16 * j

        scene.add(mesh)
        animationGroup.add(mesh)
      }
    }

    const xAxis = new THREE.Vector3(1, 0, 0)
    const qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, 0)
    const qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI)
    const quaternionKF = new THREE.QuaternionKeyframeTrack(
      '.quaternion',
      [0, 1, 2],
      [
        qInitial.x,
        qInitial.y,
        qInitial.z,
        qInitial.w,
        qFinal.x,
        qFinal.y,
        qFinal.z,
        qFinal.w,
        qInitial.x,
        qInitial.y,
        qInitial.z,
        qInitial.w
      ]
    )

    const colorKF = new THREE.ColorKeyframeTrack('.material.color', [0, 1, 2], [1, 0, 0, 0, 1, 0, 0, 0, 1], THREE.InterpolateDiscrete)
    const opacityKF = new THREE.NumberKeyframeTrack('.material.opacity', [0, 1, 2], [1, 0, 1])

    // create clip
    const clip = new THREE.AnimationClip('default', 3, [quaternionKF, colorKF, opacityKF])

    // apply the animation group to the mixer as the root object
    const mixer = new THREE.AnimationMixer(animationGroup)
    const clipAction = mixer.clipAction(clip)
    clipAction.play()

    const clock = new THREE.Clock()

    const render = () => {
      const delta = clock.getDelta()
      if (mixer) {
        mixer.update(delta)
      }
      renderer.render(scene, camera)
      // stats.update()
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default AnimationGroupsScene
