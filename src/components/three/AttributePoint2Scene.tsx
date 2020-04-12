import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'

const vert = `
attribute float size;
attribute vec3 ca;
varying vec3 vColor;

void main() {
  vColor = ca;
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
  vec4 color = vec4( color * vColor, 1.0 ) * texture2D( pointTexture, gl_PointCoord );
  gl_FragColor = color;
}
`

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 300
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

const AttributePoint2Scene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)
    const radius = 100
    const segments = 68
    const rings = 38
    const vertices1 = new THREE.SphereGeometry(radius, segments, rings).vertices
    const vertices2 = new THREE.BoxGeometry(0.8 * radius, 0.8 * radius, 0.8 * radius, 10, 10, 10).vertices
    const length1 = vertices1.length
    const vertices = vertices1.concat(vertices2)
    const positions = new Float32Array(vertices.length * 3)
    const colors = new Float32Array(vertices.length * 3)
    const sizes = new Float32Array(vertices.length)

    let vertex
    const color = new THREE.Color()
    for (let i = 0, l = vertices.length; i < l; i++) {
      vertex = vertices[i]
      vertex.toArray(positions, i * 3)

      if (i < length1) {
        color.setHSL(0.01 + 0.1 * (i / length1), 0.99, (vertex.y + radius) / (4 * radius))
      } else {
        color.setHSL(0.6, 0.75, 0.25 + vertex.y / (2 * radius))
      }

      color.toArray(colors, i * 3)

      sizes[i] = i < length1 ? 10 : 40
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('ca', new THREE.BufferAttribute(colors, 3))

    const texture = new THREE.TextureLoader().load('./textures/disc.png')
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        pointTexture: { value: texture }
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true
    })
    const sphere = new THREE.Points(geometry, material)
    scene.add(sphere)

    const sortPoints = () => {
      const vector = new THREE.Vector3()
      const matrix = new THREE.Matrix4()
      matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
      matrix.multiply(sphere.matrixWorld)
      const _geometry = sphere.geometry

      let index = _geometry.getIndex()
      const _positions = _geometry.getAttribute('position').array
      const length = _positions.length / 3
      if (index === null) {
        const array = new Uint16Array(length)

        for (var i = 0; i < length; i++) {
          array[i] = i
        }

        index = new THREE.BufferAttribute(array, 1)

        _geometry.setIndex(index)
      }
      const sortArray = []

      for (var i = 0; i < length; i++) {
        vector.fromArray(_positions, i * 3)
        vector.applyMatrix4(matrix)

        sortArray.push([vector.z, i])
      }
      const numericalSort = (a, b) => {
        return b[0] - a[0]
      }
      sortArray.sort(numericalSort)
      const indices = index.array

      for (var i = 0; i < length; i++) {
        indices[i] = sortArray[i][1]
      }
      _geometry.index.needsUpdate = true
    }

    const render = () => {
      const time = Date.now() * 0.005

      sphere.rotation.y = 0.02 * time
      sphere.rotation.z = 0.02 * time
      const _attributes = sphere.geometry.attributes

      for (let i = 0; i < _attributes.size.array.length; i++) {
        if (i < length1) {
          _attributes.size.array[i] = 16 + 12 * Math.sin(0.1 * i + time)
        }
      }

      _attributes.size.needsUpdate = true
      sortPoints()

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
export default AttributePoint2Scene
