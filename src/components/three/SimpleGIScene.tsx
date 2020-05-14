import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

THREE.Mesh.prototype.clone = function () {
  const newMaterial = this.material.isMaterial ? this.material.clone() : this.material.slice()
  return new this.constructor(this.geometry.clone(), newMaterial).copy(this)
}

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 4
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

const SimpleGI = (renderer, scene) => {
  const SIZE = 32
  const SIZE2 = SIZE * SIZE

  const camera = new THREE.PerspectiveCamera(90, 1, 0.01, 100)

  scene.updateMatrixWorld(true)

  let clone = scene.clone()
  clone.autoUpdate = false

  const rt = new THREE.WebGLRenderTarget(SIZE, SIZE, {
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    stencilBuffer: false,
    depthBuffer: true
  })

  const normalMatrix = new THREE.Matrix3()

  const position = new THREE.Vector3()
  const normal = new THREE.Vector3()

  let bounces = 0
  let currentVertex = 0

  const color = new Float32Array(3)
  const buffer = new Uint8Array(SIZE2 * 4)

  function compute() {
    if (bounces === 3) return

    const object = scene.children[0]
    const { geometry } = object

    const { attributes } = geometry
    const positions = attributes.position.array
    const normals = attributes.normal.array

    if (attributes.color === undefined) {
      const colors = new Float32Array(positions.length)
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage))
    }

    const colors = attributes.color.array

    const startVertex = currentVertex
    const totalVertex = positions.length / 3

    for (let i = 0; i < 32; i++) {
      if (currentVertex >= totalVertex) break

      position.fromArray(positions, currentVertex * 3)
      position.applyMatrix4(object.matrixWorld)

      normal.fromArray(normals, currentVertex * 3)
      normal.applyMatrix3(normalMatrix.getNormalMatrix(object.matrixWorld)).normalize()

      camera.position.copy(position)
      camera.lookAt(position.add(normal))

      renderer.setRenderTarget(rt)
      renderer.render(clone, camera)

      renderer.readRenderTargetPixels(rt, 0, 0, SIZE, SIZE, buffer)

      color[0] = 0
      color[1] = 0
      color[2] = 0

      for (let k = 0, kl = buffer.length; k < kl; k += 4) {
        color[0] += buffer[k + 0]
        color[1] += buffer[k + 1]
        color[2] += buffer[k + 2]
      }

      colors[currentVertex * 3 + 0] = color[0] / (SIZE2 * 255)
      colors[currentVertex * 3 + 1] = color[1] / (SIZE2 * 255)
      colors[currentVertex * 3 + 2] = color[2] / (SIZE2 * 255)

      currentVertex++
    }

    attributes.color.updateRange.offset = startVertex * 3
    attributes.color.updateRange.count = (currentVertex - startVertex) * 3
    attributes.color.needsUpdate = true

    if (currentVertex >= totalVertex) {
      clone = scene.clone()
      clone.autoUpdate = false

      bounces++
      currentVertex = 0
    }

    requestAnimationFrame(compute)
  }
  requestAnimationFrame(compute)
}

const SimpleGIScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = newScene()
    const camera = newCamera()
    const renderer = newRenderer(mount)

    const geometry = new THREE.TorusKnotBufferGeometry(0.75, 0.3, 128, 32, 1)
    const material = new THREE.MeshBasicMaterial({ vertexColors: true })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // room
    const materials = []
    for (let i = 0; i < 8; i++) {
      materials.push(new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, side: THREE.BackSide }))
    }
    const roomGeometry = new THREE.BoxBufferGeometry(3, 3, 3)
    const roomMesh = new THREE.Mesh(roomGeometry, materials)
    scene.add(roomMesh)

    SimpleGI(renderer, scene)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.minDistance = 1
    controls.maxDistance = 10

    const render = () => {
      renderer.render(scene, camera)
    }
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.setRenderTarget(null)
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default SimpleGIScene
