import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 1000
  return camera
}

const createScene = () => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)
  return scene
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

const rendererTarget = () => {
  const target = new THREE.WebGLRenderTarget(1, 1)
  return target
}

const createAmbientLight = () => {
  const light = new THREE.AmbientLight(0x555555)
  return light
}

const createSpotLight = () => {
  const light = new THREE.SpotLight(0xffffff, 1.5)
  light.position.set(0, 500, 2000)
  return light
}

const createPickingData = (geometriesDrawn: THREE.BufferGeometry[], geometriesPicking: THREE.BufferGeometry[]) => {
  const pickingData = []
  const matrix = new THREE.Matrix4()
  const quaternion = new THREE.Quaternion()
  const color = new THREE.Color()

  function applyVertexColors(geometry, color) {
    const { position } = geometry.attributes
    const colors = []

    for (let i = 0; i < position.count; i++) {
      colors.push(color.r, color.g, color.b)
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  }

  for (let i = 0; i < 5000; i++) {
    let geometry = new THREE.BoxBufferGeometry()

    const position = new THREE.Vector3()
    position.x = Math.random() * 10000 - 5000
    position.y = Math.random() * 6000 - 3000
    position.z = Math.random() * 8000 - 4000

    const rotation = new THREE.Euler()
    rotation.x = Math.random() * 2 * Math.PI
    rotation.y = Math.random() * 2 * Math.PI
    rotation.z = Math.random() * 2 * Math.PI

    const scale = new THREE.Vector3()
    scale.x = Math.random() * 200 + 100
    scale.y = Math.random() * 200 + 100
    scale.z = Math.random() * 200 + 100

    quaternion.setFromEuler(rotation)
    matrix.compose(
      position,
      quaternion,
      scale
    )

    geometry.applyMatrix4(matrix)

    // give the geometry's vertices a random color, to be displayed

    applyVertexColors(geometry, color.setHex(Math.random() * 0xffffff))

    geometriesDrawn.push(geometry)

    geometry = geometry.clone()

    // give the geometry's vertices a color corresponding to the "id"

    applyVertexColors(geometry, color.setHex(i))

    geometriesPicking.push(geometry)

    pickingData[i] = {
      position,
      rotation,
      scale
    }
  }
  return pickingData
}

class SceneBuilder {
  scene: THREE.Scene

  constructor() {
    this.scene = createScene()
  }

  add(object: THREE.Object3D) {
    this.scene.add(object)
    return this.scene
  }
}

// const trackballControll = (camera, renderer) => {
//   const controls = new TrackballControls(camera, renderer.domElement)
//   controls.rotateSpeed = 1.0
//   controls.zoomSpeed = 1.2
//   controls.panSpeed = 0.8
//   controls.noZoom = false
//   controls.noPan = false
//   controls.staticMoving = true
//   controls.dynamicDampingFactor = 0.3
// }

const InteractiveCubesScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const mouse = new THREE.Vector2()
    const offset = new THREE.Vector3(10, 10, 10)

    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)

    const pickingScene = createScene()
    const pickingTarget = rendererTarget()

    const ambientLight = createAmbientLight()
    const spotLight = createSpotLight()

    const pickingMaterial = new THREE.MeshBasicMaterial({ vertexColors: true })
    const defaultMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, vertexColors: true, shininess: 0 })

    const geometriesDrawn: THREE.BufferGeometry[] = []
    const geometriesPicking: THREE.BufferGeometry[] = []
    const pickingData = createPickingData(geometriesDrawn, geometriesPicking)

    const objects = new THREE.Mesh(BufferGeometryUtils.mergeBufferGeometries(geometriesDrawn), defaultMaterial)
    pickingScene.add(new THREE.Mesh(BufferGeometryUtils.mergeBufferGeometries(geometriesPicking), pickingMaterial))
    const highlightBox = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshLambertMaterial({ color: 0xffff00 }))
    const scene = new SceneBuilder()
      .add(ambientLight)
      .add(spotLight)
      .add(objects)
      .add(highlightBox)

    const controls = new TrackballControls(camera, renderer.domElement)
    controls.rotateSpeed = 1.0
    controls.zoomSpeed = 1.2
    controls.panSpeed = 0.8
    controls.noZoom = false
    controls.noPan = false
    controls.staticMoving = true
    controls.dynamicDampingFactor = 0.3

    const onMouseMove = e => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    mount.current!.addEventListener('mousemove', onMouseMove)

    const pick = () => {
      camera.setViewOffset(
        renderer.domElement.width,
        renderer.domElement.height,
        mouse.x * window.devicePixelRatio || 0,
        mouse.y * window.devicePixelRatio || 0,
        1,
        1
      )
      renderer.setRenderTarget(pickingTarget)
      renderer.render(pickingScene, camera)
      camera.clearViewOffset()
      const pixelBuffer = new Uint8Array(4)
      renderer.readRenderTargetPixels(pickingTarget, 0, 0, 1, 1, pixelBuffer)
      const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2]
      const data = pickingData[id]

      if (data) {
        if (data.position && data.rotation && data.scale) {
          highlightBox.position.copy(data.position)
          highlightBox.rotation.copy(data.rotation)
          highlightBox.scale.copy(data.scale).add(offset)
          highlightBox.visible = true
        }
      } else {
        highlightBox.visible = false
      }
    }
    const render = () => {
      controls.update()
      renderer.setRenderTarget(null)
      renderer.render(scene, camera)
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
      pick()
      // stats.update()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default InteractiveCubesScene
