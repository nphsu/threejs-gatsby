import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

const params = {
  color: 0xffffff,
  transparency: 0.9,
  envMapIntensity: 1,
  lightIntensity: 1,
  exposure: 1
}

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 2000)
  camera.position.set(0, 0, 120)
  return camera
}

const newRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = params.exposure
  renderer.outputEncoding = THREE.sRGBEncoding
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

const generateTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 2
  canvas.height = 2

  const context = canvas.getContext('2d')
  context!.fillStyle = 'white'
  context!.fillRect(0, 1, 2, 1)

  return canvas
}

const PhysicalTransparencyScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const init = hdrTexture => {
      const scene = newScene()
      scene.background = hdrTexture.type

      const camera = newCamera()
      const renderer = newRenderer(mount)

      const pmremGenerator = new THREE.PMREMGenerator(renderer)
      const hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrTexture)
      hdrTexture.dispose()
      pmremGenerator.dispose()

      scene.background = hdrCubeRenderTarget.texture

      const geometry = new THREE.SphereBufferGeometry(20, 64, 32)

      const texture = new THREE.CanvasTexture(generateTexture())
      texture.magFilter = THREE.NearestFilter
      texture.wrapT = THREE.RepeatWrapping
      texture.wrapS = THREE.RepeatWrapping
      texture.repeat.set(1, 3.5)

      const material = new THREE.MeshPhysicalMaterial({
        color: params.color,
        metalness: 0,
        roughness: 0,
        alphaMap: texture,
        alphaTest: 0.5,
        envMap: hdrCubeRenderTarget.texture,
        envMapIntensity: params.envMapIntensity,
        depthWrite: false,
        transparency: params.transparency, // use material.transparency for glass materials
        opacity: 1, // set material.opacity to 1 when material.transparency is non-zero
        transparent: true
      })
      const material1 = new THREE.MeshPhysicalMaterial().copy(material)

      const material1b = new THREE.MeshPhysicalMaterial().copy(material)
      material1b.side = THREE.BackSide

      const material2 = new THREE.MeshPhysicalMaterial().copy(material)
      material2.premultipliedAlpha = true

      const material2b = new THREE.MeshPhysicalMaterial().copy(material)
      material2b.premultipliedAlpha = true
      material2b.side = THREE.BackSide

      const mesh1 = new THREE.Mesh(geometry, material1)
      mesh1.position.x = -30.0
      scene.add(mesh1)

      let mesh = new THREE.Mesh(geometry, material1b)
      mesh.renderOrder = -1
      mesh1.add(mesh)

      const mesh2 = new THREE.Mesh(geometry, material2)
      mesh2.position.x = 30.0
      scene.add(mesh2)

      mesh = new THREE.Mesh(geometry, material2b)
      mesh.renderOrder = -1
      mesh2.add(mesh)

      const spotLight1 = new THREE.SpotLight(0xffffff, params.lightIntensity)
      spotLight1.position.set(100, 200, 100)
      spotLight1.angle = Math.PI / 6
      scene.add(spotLight1)

      const spotLight2 = new THREE.SpotLight(0xffffff, params.lightIntensity)
      spotLight2.position.set(-100, -200, -100)
      spotLight2.angle = Math.PI / 6
      scene.add(spotLight2)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.minDistance = 10
      controls.maxDistance = 150

      const render = () => {
        renderer.render(scene, camera)
      }
      const animate = () => {
        requestAnimationFrame(animate)
        const t = performance.now()

        mesh1.rotation.x = t * 0.0002
        mesh2.rotation.x = t * 0.0002
        mesh1.rotation.z = -t * 0.0002
        mesh2.rotation.z = -t * 0.0002
        render()
      }
      animate()
    }
    const hdrEquirect = new RGBELoader()
      .setDataType(THREE.UnsignedByteType)
      // .setPath('')
      .load('./textures/royal_esplanade_1k.hdr', function (texture) {
        init(texture)
      })
  }, [])
  return <div css={css``} ref={mount} />
}
export default PhysicalTransparencyScene
