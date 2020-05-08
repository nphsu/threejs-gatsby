import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'

const vert = `
precision highp float;

uniform float sineTime;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 offset;
attribute vec4 color;
attribute vec4 orientationStart;
attribute vec4 orientationEnd;

varying vec3 vPosition;
varying vec4 vColor;

void main(){

  vPosition = offset * max( abs( sineTime * 2.0 + 1.0 ), 0.5 ) + position;
  vec4 orientation = normalize( mix( orientationStart, orientationEnd, sineTime ) );
  vec3 vcV = cross( orientation.xyz, vPosition );
  vPosition = vcV * ( 2.0 * orientation.w ) + ( cross( orientation.xyz, vcV ) * 2.0 + vPosition );

  vColor = color;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );

}
`

const frag = `
precision highp float;

uniform float time;

varying vec3 vPosition;
varying vec4 vColor;

void main() {

  vec4 color = vec4( vColor );
  color.r += sin( vPosition.x * 10.0 + time ) * 0.5;

  gl_FragColor = color;

}
`

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10)
  camera.position.z = 2
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

const BuffergeometryInstancingScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = newScene()
    const camera = newCamera()
    const renderer = newRenderer(mount)

    const vector = new THREE.Vector4()
    const instances = 50000
    const positions = []
    const offsets = []
    const colors = []
    const orientationsStart = []
    const orientationsEnd = []

    positions.push(0.025, -0.025, 0)
    positions.push(-0.025, 0.025, 0)
    positions.push(0, 0, 0.025)

    for (let i = 0; i < instances; i++) {
      // offsets
      offsets.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)

      // colors
      colors.push(Math.random(), Math.random(), Math.random(), Math.random())

      // orientation start
      vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
      vector.normalize()
      orientationsStart.push(vector.x, vector.y, vector.z, vector.w)

      // orientation end
      vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
      vector.normalize()
      orientationsEnd.push(vector.x, vector.y, vector.z, vector.w)
    }

    const geometry = new THREE.InstancedBufferGeometry()
    geometry.maxInstancedCount = instances // set so its initalized for dat.GUI, will be set in first draw otherwise
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3))
    geometry.setAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(colors), 4))
    geometry.setAttribute('orientationStart', new THREE.InstancedBufferAttribute(new Float32Array(orientationsStart), 4))
    geometry.setAttribute('orientationEnd', new THREE.InstancedBufferAttribute(new Float32Array(orientationsEnd), 4))

    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        sineTime: { value: 1.0 }
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
      object.material.uniforms.sineTime.value = Math.sin(object.material.uniforms.time.value * 0.05)
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
export default BuffergeometryInstancingScene
