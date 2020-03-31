import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'

const vert = `
precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix; // optional
uniform mat4 projectionMatrix; // optional

attribute vec3 position;
attribute vec4 color;

varying vec3 vPosition;
varying vec4 vColor;

void main()	{

  vPosition = position;
  vColor = color;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
`

const frag = `
precision mediump float;
precision mediump int;

uniform float time;

varying vec3 vPosition;
varying vec4 vColor;

void main()	{

  vec4 color = vec4( vColor );
  color.r += sin( vPosition.x * 10.0 + time ) * 0.5;

  gl_FragColor = color;

}
`

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10)
  camera.position.z = 2
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

const GLSLScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x101010)

    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)

    // geometry
    // nr of triangles with 3 vertices per triangle
    const vertexCount = 200 * 3

    const geometry = new THREE.BufferGeometry()

    const positions = []
    const colors = []

    for (let i = 0; i < vertexCount; i++) {
      // adding x,y,z
      positions.push(Math.random() - 0.5)
      positions.push(Math.random() - 0.5)
      positions.push(Math.random() - 0.5)

      // adding r,g,b,a
      colors.push(Math.random() * 255)
      colors.push(Math.random() * 255)
      colors.push(Math.random() * 255)
      colors.push(Math.random() * 255)
    }

    const positionAttribute = new THREE.Float32BufferAttribute(positions, 3)
    const colorAttribute = new THREE.Uint8BufferAttribute(colors, 4)
    colorAttribute.normalized = true
    geometry.setAttribute('position', positionAttribute)
    geometry.setAttribute('color', colorAttribute)

    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: { value: 1.0 }
      },
      vertexShader: vert,
      fragmentShader: frag,
      side: THREE.DoubleSide,
      transparent: true
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const render = () => {
      const time = performance.now()
      const object = scene.children[0]

      object.rotation.y = time * 0.0005
      object.material.uniforms.time.value = time * 0.005

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
export default GLSLScene
