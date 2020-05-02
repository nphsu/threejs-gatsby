import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
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

const CubemapScene = () => {
  let lon = 0
  let lat = 0
  let phi = 0
  let theta = 0
  let count = 0
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load('./textures/hut.jpg', function (texture) {
      texture.mapping = THREE.UVMapping

      const scene = newScene()
      const camera = newCamera()
      const renderer = newRenderer(mount)

      const options = {
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter
      }
      scene.background = new THREE.WebGLCubeRenderTarget(1024, options).fromEquirectangularTexture(renderer, texture)

      // const cubeCamera1 = new THREE.CubeCamera(1, 1000, 256)
      // cubeCamera1.renderTarget.texture.generateMipmaps = true
      // cubeCamera1.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter
      // scene.add(cubeCamera1)

      const cubeCamera2 = new THREE.CubeCamera(1, 1000, 256)
      cubeCamera2.renderTarget.texture.generateMipmaps = true
      cubeCamera2.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter
      scene.add(cubeCamera2)

      const material = new THREE.MeshBasicMaterial({
        envMap: cubeCamera2.renderTarget.texture
      })

      const sphere = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(20, 3), material)
      scene.add(sphere)

      const cube = new THREE.Mesh(new THREE.BoxBufferGeometry(20, 20, 20), material)
      scene.add(cube)

      const torus = new THREE.Mesh(new THREE.TorusKnotBufferGeometry(10, 5, 100, 25), material)
      scene.add(torus)

      const render = () => {
        const time = Date.now()

        lon += 0.15

        lat = Math.max(-85, Math.min(85, lat))
        phi = THREE.MathUtils.degToRad(90 - lat)
        theta = THREE.MathUtils.degToRad(lon)

        cube.position.x = Math.cos(time * 0.001) * 30
        cube.position.y = Math.sin(time * 0.001) * 30
        cube.position.z = Math.sin(time * 0.001) * 30

        cube.rotation.x += 0.02
        cube.rotation.y += 0.03

        torus.position.x = Math.cos(time * 0.001 + 10) * 30
        torus.position.y = Math.sin(time * 0.001 + 10) * 30
        torus.position.z = Math.sin(time * 0.001 + 10) * 30

        torus.rotation.x += 0.02
        torus.rotation.y += 0.03

        camera.position.x = 100 * Math.sin(phi) * Math.cos(theta)
        camera.position.y = 100 * Math.cos(phi)
        camera.position.z = 100 * Math.sin(phi) * Math.sin(theta)
        camera.lookAt(scene.position)

        if (count % 2 === 0) {
          // cubeCamera1.update(renderer, scene)
          // material.envMap = cubeCamera1.renderTarget.texture
          console.log('cubeCamera1')
        } else {
          cubeCamera2.update(renderer, scene)
          material.envMap = cubeCamera2.renderTarget.texture
          console.log('cubeCamera2')
        }
        count++
        renderer.render(scene, camera)
      }
      const animate = () => {
        requestAnimationFrame(animate)
        render()
      }
      animate()
    })
  }, [])
  return <div css={css``} ref={mount} />
}
export default CubemapScene
