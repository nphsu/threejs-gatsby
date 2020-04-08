import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Water } from 'three/examples/jsm/objects/Water.js'
import { Sky } from 'three/examples/jsm/objects/Sky.js'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000)
  camera.position.set(30, 30, 100)
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

const SimpleScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)

    const light = new THREE.DirectionalLight(0xffffff, 0.8)
    scene.add(light)

    // water
    const waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000)
    const water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('./textures/waternormals.jpg', function (texture) {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
      }),
      alpha: 1.0,
      sunDirection: light.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    })
    water.rotation.x = -Math.PI / 2
    scene.add(water)

    // sky
    const sky = new Sky()

    const { uniforms } = sky.material

    uniforms.turbidity.value = 10
    uniforms.rayleigh.value = 2
    uniforms.luminance.value = 1
    uniforms.mieCoefficient.value = 0.005
    uniforms.mieDirectionalG.value = 0.8

    const parameters = {
      distance: 400,
      inclination: 0.49,
      azimuth: 0.205
    }

    const cubeCamera = new THREE.CubeCamera(0.1, 1, 512)
    cubeCamera.renderTarget.texture.generateMipmaps = true
    cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter

    // scene.background = cubeCamera.renderTarget
    scene.background = cubeCamera.renderTarget

    // sun
    function updateSun() {
      const theta = Math.PI * (parameters.inclination - 0.5)
      const phi = 2 * Math.PI * (parameters.azimuth - 0.5)

      light.position.x = parameters.distance * Math.cos(phi)
      light.position.y = parameters.distance * Math.sin(phi) * Math.sin(theta)
      light.position.z = parameters.distance * Math.sin(phi) * Math.cos(theta)

      sky.material.uniforms.sunPosition.value = light.position.copy(light.position)
      water.material.uniforms.sunDirection.value.copy(light.position).normalize()

      cubeCamera.update(renderer, sky)
    }

    updateSun()

    // sphere
    const geometry = new THREE.IcosahedronBufferGeometry(20, 1)
    const { count } = geometry.attributes.position

    const colors = []
    const color = new THREE.Color()

    for (let i = 0; i < count; i += 3) {
      color.setHex(Math.random() * 0xffffff)

      colors.push(color.r, color.g, color.b)
      colors.push(color.r, color.g, color.b)
      colors.push(color.r, color.g, color.b)
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.0,
      flatShading: true,
      envMap: cubeCamera.renderTarget.texture,
      side: THREE.DoubleSide
    })

    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.maxPolarAngle = Math.PI * 0.495
    controls.target.set(0, 10, 0)
    controls.minDistance = 40.0
    controls.maxDistance = 200.0
    controls.update()

    const render = () => {
      const time = performance.now() * 0.001
      sphere.position.y = Math.sin(time) * 20 + 5
      sphere.rotation.x = time * 0.5
      sphere.rotation.z = time * 0.51
      water.material.uniforms.time.value += 1.0 / 60.0
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
export default SimpleScene
