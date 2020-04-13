import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { CSS3DRenderer, CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000)
  camera.position.set(600, 400, 1500)
  camera.lookAt(0, 0, 0)
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new CSS3DRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const CSS3DSpriteScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)

    const particlesTotal = 512
    const positions = []
    const objects = []
    let current = 0

    const transition = () => {
      const offset = current * particlesTotal * 3
      const duration = 2000

      for (let i = 0, j = offset; i < particlesTotal; i++, j += 3) {
        const object = objects[i]

        new TWEEN.Tween(object.position)
          .to(
            {
              x: positions[j],
              y: positions[j + 1],
              z: positions[j + 2]
            },
            Math.random() * duration + duration
          )
          .easing(TWEEN.Easing.Exponential.InOut)
          .start()
      }

      new TWEEN.Tween()
        .to({}, duration * 3)
        .onComplete(transition)
        .start()

      current = (current + 1) % 4
    }

    const image = document.createElement('img')
    console.log('yyyy')
    image.addEventListener(
      'load',
      function () {
        for (let i = 0; i < particlesTotal; i++) {
          const object = new CSS3DSprite(image.cloneNode())
          object.position.x = Math.random() * 4000 - 2000
          object.position.y = Math.random() * 4000 - 2000
          object.position.z = Math.random() * 4000 - 2000
          scene.add(object)

          objects.push(object)
        }
        console.log('xxxxx')
        transition()
      },
      false
    )
    image.src = './textures/sprite.png'

    // Plane

    const amountX = 16
    const amountZ = 32
    let separation = 150
    const offsetX = ((amountX - 1) * separation) / 2
    const offsetZ = ((amountZ - 1) * separation) / 2

    for (let i = 0; i < particlesTotal; i++) {
      const x = (i % amountX) * separation
      const z = Math.floor(i / amountX) * separation
      const y = (Math.sin(x * 0.5) + Math.sin(z * 0.5)) * 200

      positions.push(x - offsetX, y, z - offsetZ)
    }

    // Cube

    const amount = 8
    separation = 150
    const offset = ((amount - 1) * separation) / 2

    for (let i = 0; i < particlesTotal; i++) {
      const x = (i % amount) * separation
      const y = Math.floor((i / amount) % amount) * separation
      const z = Math.floor(i / (amount * amount)) * separation

      positions.push(x - offset, y - offset, z - offset)
    }

    // Random

    for (let i = 0; i < particlesTotal; i++) {
      positions.push(Math.random() * 4000 - 2000, Math.random() * 4000 - 2000, Math.random() * 4000 - 2000)
    }

    // Sphere

    const radius = 750

    for (let i = 0; i < particlesTotal; i++) {
      const phi = Math.acos(-1 + (2 * i) / particlesTotal)
      const theta = Math.sqrt(particlesTotal * Math.PI) * phi

      positions.push(radius * Math.cos(theta) * Math.sin(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(phi))
    }

    const animate = () => {
      requestAnimationFrame(animate)
      TWEEN.update()
      const time = performance.now()

      for (let i = 0, l = objects.length; i < l; i++) {
        const object = objects[i]
        const scale = Math.sin((Math.floor(object.position.x) + time) * 0.002) * 0.3 + 1
        object.scale.set(scale, scale, scale)
      }

      renderer.render(scene, camera)
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default CSS3DSpriteScene
