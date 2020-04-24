import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'

const vert = `
attribute float size;
attribute vec3 customColor;

varying vec3 vColor;
void main() {
  vColor = customColor;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = size * ( 300.0 / -mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}
`

const frag = `
uniform vec3 color;
uniform sampler2D pointTexture;
varying vec3 vColor;

void main() {
  gl_FragColor = vec4( color * vColor, 1.0 );
  gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
  if ( gl_FragColor.a < ALPHATEST ) discard;
}
`

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 250
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

const InteractivePointScene = () => {
  const PARTICLE_SIZE = 20
  let INTERSECTED
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)

    const { vertices } = new THREE.BoxGeometry(200, 200, 200, 16, 16, 16)

    const positions = new Float32Array(vertices.length * 3)
    const colors = new Float32Array(vertices.length * 3)
    const sizes = new Float32Array(vertices.length)

    let vertex
    const color = new THREE.Color()

    for (let i = 0, l = vertices.length; i < l; i++) {
      vertex = vertices[i]
      vertex.toArray(positions, i * 3)

      color.setHSL(0.01 + 0.1 * (i / l), 1.0, 0.5)
      color.toArray(colors, i * 3)

      sizes[i] = PARTICLE_SIZE * 0.5
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        pointTexture: { value: new THREE.TextureLoader().load('./textures/disc.png') }
      },
      vertexShader: vert,
      fragmentShader: frag,

      alphaTest: 0.9
    })

    //

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    function onDocumentMouseMove(event) {
      event.preventDefault()

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }
    mount.current!.addEventListener('mousemove', onDocumentMouseMove, false)

    const render = () => {
      particles.rotation.x += 0.0005
      particles.rotation.y += 0.001

      const { attributes } = particles.geometry

      raycaster.setFromCamera(mouse, camera)

      const intersects = raycaster.intersectObject(particles)
      if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].index) {
          attributes.size.array[INTERSECTED] = PARTICLE_SIZE

          INTERSECTED = intersects[0].index

          attributes.size.array[INTERSECTED] = PARTICLE_SIZE * 1.25
          attributes.size.needsUpdate = true
        }
      } else if (INTERSECTED !== null) {
        attributes.size.array[INTERSECTED] = PARTICLE_SIZE
        attributes.size.needsUpdate = true
        INTERSECTED = null
      }
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
export default InteractivePointScene
