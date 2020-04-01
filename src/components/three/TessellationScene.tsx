import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { TessellateModifier } from 'three/examples/jsm/modifiers/TessellateModifier.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import helvetiker from '../../fonts/helvetiker_bold.typeface.json'

const vert = `
uniform float amplitude;

attribute vec3 customColor;
attribute vec3 displacement;

varying vec3 vNormal;
varying vec3 vColor;

void main() {

  vNormal = normal;
  vColor = customColor;

  vec3 newPosition = position + normal * amplitude * displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}
`

const frag = `
varying vec3 vNormal;
varying vec3 vColor;

void main() {

  const float ambient = 0.4;

  vec3 light = vec3( 1.0 );
  light = normalize( light );

  float directional = max( dot( vNormal, light ), 0.0 );

  gl_FragColor = vec4( ( directional + ambient ) * vColor, 1.0 );

}
`

const createDefaultCamera = () => {
  const WIDTH = window.innerWidth
  const HEIGHT = window.innerHeight
  const camera = new THREE.PerspectiveCamera(40, WIDTH / HEIGHT, 1, 10000)
  camera.position.set(-100, 100, 200)
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

const TessellationScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x101010)

    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)
    const controls = new TrackballControls(camera, renderer.domElement)

    const font = new THREE.FontLoader().parse(helvetiker)
    const geometry = new THREE.TextGeometry('SHUMPEI', {
      font,

      size: 40,
      height: 5,
      curveSegments: 3,

      bevelThickness: 2,
      bevelSize: 1,
      bevelEnabled: true
    })
    geometry.center()
    const tessellateModifier = new TessellateModifier(8)

    for (let i = 0; i < 6; i++) {
      tessellateModifier.modify(geometry)
    }
    const bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry)

    const numFaces = bufferGeometry.attributes.position.count / 3

    const colors = new Float32Array(numFaces * 3 * 3)
    const displacement = new Float32Array(numFaces * 3 * 3)

    const color = new THREE.Color()

    for (let f = 0; f < numFaces; f++) {
      const index = 9 * f

      const h = 0.2 * Math.random()
      const s = 0.5 + 0.5 * Math.random()
      const l = 0.5 + 0.5 * Math.random()

      color.setHSL(h, s, l)

      const d = 10 * (0.5 - Math.random())

      for (let i = 0; i < 3; i++) {
        colors[index + 3 * i] = color.r
        colors[index + 3 * i + 1] = color.g
        colors[index + 3 * i + 2] = color.b

        displacement[index + 3 * i] = d
        displacement[index + 3 * i + 1] = d
        displacement[index + 3 * i + 2] = d
      }
    }

    bufferGeometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3))
    bufferGeometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 3))

    const uniforms = {
      amplitude: { value: 0.0 }
    }

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag
    })

    const mesh = new THREE.Mesh(bufferGeometry, shaderMaterial)

    scene.add(mesh)
    const render = () => {
      const time = Date.now() * 0.001

      uniforms.amplitude.value = 1.0 + Math.sin(time * 0.5)

      controls.update()

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
export default TessellationScene
