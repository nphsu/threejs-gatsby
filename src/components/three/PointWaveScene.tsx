import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const SEPARATION = 100
const AMOUNTX = 50
const AMOUNTY = 50
const numParticles = AMOUNTX * AMOUNTY

const vert = `
attribute float scale;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = scale * ( 300.0 / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}
`

const frag = `
uniform vec3 color;
void main() {
  if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
  gl_FragColor = vec4( color, 1.0 );
}
`

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 1000
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const PointWaveScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    // scene
    const scene = new THREE.Scene()
    scene.add(new THREE.AmbientLight(0x111122))

    // camera
    const camera = createDefaultCamera()

    const renderer = createDefaultRenderer(mount)

    let mouseX = 0
    let mouseY = 0
    let count = 0
    const windowHalfX = window.innerWidth / 2
    const windowHalfY = window.innerHeight / 2
    const onMouseMove = e => {
      mouseX = e.clientX - windowHalfX
      mouseY = e.clientY - windowHalfY
    }

    const positions = new Float32Array(numParticles * 3)
    const scales = new Float32Array(numParticles)
    let i = 0
    let j = 0

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2 // x
        positions[i + 1] = 0 // y
        positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2 // z

        scales[j] = 1

        i += 3
        j++
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) }
      },
      vertexShader: vert,
      fragmentShader: frag
    })
    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // control
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 10, 0)
    controls.update()

    // listener
    mount.current!.addEventListener('mousemove', onMouseMove, false)

    const render = () => {
      camera.position.x += (mouseX - camera.position.x) * 0.05
      camera.position.y += (-mouseY - camera.position.y) * 0.05
      camera.lookAt(scene.position)
      const pos = particles.geometry.attributes.position.array
      const sca = particles.geometry.attributes.scale.array

      let ii = 0
      let jj = 0
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          pos[ii + 1] = Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50

          sca[jj] = (Math.sin((ix + count) * 0.3) + 1) * 8 + (Math.sin((iy + count) * 0.5) + 1) * 8

          ii += 3
          jj++
        }
      }

      particles.geometry.attributes.position.needsUpdate = true
      particles.geometry.attributes.scale.needsUpdate = true

      renderer.render(scene, camera)

      count += 0.1
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default PointWaveScene
