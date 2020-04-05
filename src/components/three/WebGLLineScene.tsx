import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils.js'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 1000
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

const WebGLLineScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    let mouseX = 0
    let mouseY = 0
    const windowHalfX = window.innerWidth / 2
    const windowHalfY = window.innerHeight / 2
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)

    const hilbertPoints = GeometryUtils.hilbert3D(new THREE.Vector3(0, 0, 0), 200.0, 1, 0, 1, 2, 3, 4, 5, 6, 7)

    const geometry1 = new THREE.BufferGeometry()
    const geometry2 = new THREE.BufferGeometry()
    const geometry3 = new THREE.BufferGeometry()
    const subdivisions = 6

    let vertices = []
    let colors1 = []
    let colors2 = []
    let colors3 = []

    const point = new THREE.Vector3()
    const color = new THREE.Color()
    const spline = new THREE.CatmullRomCurve3(hilbertPoints)
    for (let i = 0; i < hilbertPoints.length * subdivisions; i++) {
      const t = i / (hilbertPoints.length * subdivisions)
      spline.getPoint(t, point)

      vertices.push(point.x, point.y, point.z)

      color.setHSL(0.6, 1.0, Math.max(0, -point.x / 200) + 0.5)
      colors1.push(color.r, color.g, color.b)

      color.setHSL(0.9, 1.0, Math.max(0, -point.y / 200) + 0.5)
      colors2.push(color.r, color.g, color.b)

      color.setHSL(i / (hilbertPoints.length * subdivisions), 1.0, 0.5)
      colors3.push(color.r, color.g, color.b)
    }
    geometry1.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry2.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry3.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

    geometry1.setAttribute('color', new THREE.Float32BufferAttribute(colors1, 3))
    geometry2.setAttribute('color', new THREE.Float32BufferAttribute(colors2, 3))
    geometry3.setAttribute('color', new THREE.Float32BufferAttribute(colors3, 3))

    const geometry4 = new THREE.BufferGeometry()
    const geometry5 = new THREE.BufferGeometry()
    const geometry6 = new THREE.BufferGeometry()

    vertices = []
    colors1 = []
    colors2 = []
    colors3 = []

    for (let i = 0; i < hilbertPoints.length; i++) {
      const p = hilbertPoints[i]

      vertices.push(p.x, p.y, p.z)

      color.setHSL(0.6, 1.0, Math.max(0, (200 - hilbertPoints[i].x) / 400) * 0.5 + 0.5)
      colors1.push(color.r, color.g, color.b)

      color.setHSL(0.3, 1.0, Math.max(0, (200 + hilbertPoints[i].x) / 400) * 0.5)
      colors2.push(color.r, color.g, color.b)

      color.setHSL(i / hilbertPoints.length, 1.0, 0.5)
      colors3.push(color.r, color.g, color.b)
    }

    geometry4.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry5.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry6.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

    geometry4.setAttribute('color', new THREE.Float32BufferAttribute(colors1, 3))
    geometry5.setAttribute('color', new THREE.Float32BufferAttribute(colors2, 3))
    geometry6.setAttribute('color', new THREE.Float32BufferAttribute(colors3, 3))

    const material = new THREE.LineBasicMaterial({ color: 0xffffff, vertexColors: true })

    let p
    const scale = 0.3
    const d = 225

    const parameters = [
      [material, scale * 1.5, [-d, -d / 2, 0], geometry1],
      [material, scale * 1.5, [0, -d / 2, 0], geometry2],
      [material, scale * 1.5, [d, -d / 2, 0], geometry3],
      [material, scale * 1.5, [-d, d / 2, 0], geometry4],
      [material, scale * 1.5, [0, d / 2, 0], geometry5],
      [material, scale * 1.5, [d, d / 2, 0], geometry6]
    ]

    for (let i = 0; i < parameters.length; i++) {
      p = parameters[i]
      const line = new THREE.Line(p[3], p[0])
      line.scale.x = p[1]
      line.scale.y = p[1]
      line.scale.z = p[1]
      line.position.x = p[2][0]
      line.position.y = p[2][1]
      line.position.z = p[2][2]
      scene.add(line)
    }

    // listener

    const onDocumentMouseMove = event => {
      mouseX = event.clientX - windowHalfX
      mouseY = event.clientY - windowHalfY
    }
    mount.current!.addEventListener('mousemove', onDocumentMouseMove, false)

    const render = () => {
      camera.position.x += (mouseX - camera.position.x) * 0.05
      camera.position.y += (-mouseY + 200 - camera.position.y) * 0.05

      camera.lookAt(scene.position)

      const time = Date.now() * 0.0005

      for (let i = 0; i < scene.children.length; i++) {
        const object = scene.children[i]

        if (object.isLine) {
          object.rotation.y = time * (i % 2 ? 1 : -1)
        }
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
export default WebGLLineScene
