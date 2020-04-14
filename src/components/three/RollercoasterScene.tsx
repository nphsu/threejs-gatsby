import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import {
  RollerCoasterGeometry,
  RollerCoasterShadowGeometry,
  RollerCoasterLiftersGeometry,
  TreesGeometry,
  SkyGeometry
} from 'three/examples/jsm/misc/RollerCoaster.js'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000)
  camera.position.z = 5
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.xr.enabled = true
  renderer.autoClear = true
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const RollercoasterScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f0ff)
    const renderer = createDefaultRenderer(mount)
    document.body.appendChild(VRButton.createButton(renderer, { referenceSpaceType: 'local' }))

    const light = new THREE.HemisphereLight(0xfff0f0, 0x606066)
    light.position.set(1, 1, 1)
    scene.add(light)

    const train = new THREE.Object3D()
    scene.add(train)

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500)
    train.add(camera)

    const geometry = new THREE.PlaneBufferGeometry(500, 500, 15, 15)
    geometry.rotateX(-Math.PI / 2)

    const positions = geometry.attributes.position.array
    const vertex = new THREE.Vector3()

    for (let i = 0; i < positions.length; i += 3) {
      vertex.fromArray(positions, i)

      vertex.x += Math.random() * 10 - 5
      vertex.z += Math.random() * 10 - 5

      const distance = vertex.distanceTo(scene.position) / 5 - 25
      vertex.y = Math.random() * Math.max(0, distance)

      vertex.toArray(positions, i)
    }
    geometry.computeVertexNormals()
    const material = new THREE.MeshLambertMaterial({
      color: 0x407000
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const geometry2 = new TreesGeometry(mesh)
    const material2 = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      vertexColors: true
    })
    const mesh2 = new THREE.Mesh(geometry2, material2)
    scene.add(mesh2)

    const geometry3 = new SkyGeometry()
    const material3 = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const mesh3 = new THREE.Mesh(geometry3, material3)
    scene.add(mesh3)

    const PI2 = Math.PI * 2
    const curve = (() => {
      const vector = new THREE.Vector3()
      const vector2 = new THREE.Vector3()
      return {
        getPointAt(t) {
          t *= PI2
          const x = Math.sin(t * 3) * Math.cos(t * 4) * 50
          const y = Math.sin(t * 10) * 2 + Math.cos(t * 17) * 2 + 5
          const z = Math.sin(t) * Math.sin(t * 4) * 50
          return vector.set(x, y, z).multiplyScalar(2)
        },
        getTangentAt(t) {
          const delta = 0.0001
          const t1 = Math.max(0, t - delta)
          const t2 = Math.min(1, t + delta)

          return vector2
            .copy(this.getPointAt(t2))
            .sub(this.getPointAt(t1))
            .normalize()
        }
      }
    })()

    const geometry4 = new RollerCoasterGeometry(curve, 1500)
    const material4 = new THREE.MeshPhongMaterial({
      vertexColors: true
    })
    const mesh4 = new THREE.Mesh(geometry4, material4)
    scene.add(mesh4)

    const geometry5 = new RollerCoasterLiftersGeometry(curve, 100)
    const material5 = new THREE.MeshPhongMaterial()
    const mesh5 = new THREE.Mesh(geometry5, material5)
    mesh5.position.y = 0.1
    scene.add(mesh5)

    const geometry6 = new RollerCoasterShadowGeometry(curve, 500)
    const material6 = new THREE.MeshBasicMaterial({
      color: 0x305000,
      depthWrite: false,
      transparent: true
    })
    const mesh6 = new THREE.Mesh(geometry6, material6)
    mesh6.position.y = 0.1
    scene.add(mesh6)

    const funfairs = []

    const geometry7 = new THREE.CylinderBufferGeometry(10, 10, 5, 15)
    const material7 = new THREE.MeshLambertMaterial({
      color: 0xff8080
      // flatShading: true // Lambert does not support flat shading
    })
    const mesh7 = new THREE.Mesh(geometry7, material7)
    mesh7.position.set(-80, 10, -70)
    mesh7.rotation.x = Math.PI / 2
    scene.add(mesh7)

    funfairs.push(mesh7)

    const geometry8 = new THREE.CylinderBufferGeometry(5, 6, 4, 10)
    const material8 = new THREE.MeshLambertMaterial({
      color: 0x8080ff
      // flatShading: true // Lambert does not support flat shading
    })
    const mesh8 = new THREE.Mesh(geometry8, material8)
    mesh8.position.set(50, 2, 30)
    scene.add(mesh8)

    funfairs.push(mesh8)

    const position = new THREE.Vector3()
    const tangent = new THREE.Vector3()
    const lookAt = new THREE.Vector3()
    let velocity = 0
    let progress = 0

    let prevTime = performance.now()

    const render = () => {
      const time = performance.now()
      const delta = time - prevTime

      for (let i = 0; i < funfairs.length; i++) {
        funfairs[i].rotation.y = time * 0.0004
      }

      progress += velocity
      progress %= 1

      position.copy(curve.getPointAt(progress))
      position.y += 0.3

      train.position.copy(position)
      tangent.copy(curve.getTangentAt(progress))
      velocity -= tangent.y * 0.0000001 * delta
      velocity = Math.max(0.00004, Math.min(0.0002, velocity))

      train.lookAt(lookAt.copy(position).sub(tangent))
      renderer.render(scene, camera)

      prevTime = time
    }
    renderer.setAnimationLoop(render)
  }, [])
  return <div css={css``} ref={mount} />
}
export default RollercoasterScene
