import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const params = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0
}
const clock = new THREE.Clock()

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(25, 25, 25)
  camera.lookAt(0, 0, 0)
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

const InstancingScatterScene = () => {
  const mount = createRef<HTMLInputElement>()

  const api = {
    count: 2000,
    distribution: 'random',
    // resample,
    surfaceColor: 0xfff784,
    backgroundColor: 0xe39469
  }
  let sampler
  const { count } = api
  const ages = new Float32Array(count)
  const scales = new Float32Array(count)
  const dummy = new THREE.Object3D()

  const _position = new THREE.Vector3()
  const _normal = new THREE.Vector3()
  const _scale = new THREE.Vector3()

  // var surfaceGeometry = new THREE.BoxBufferGeometry( 10, 10, 10 ).toNonIndexed();
  const surfaceGeometry = new THREE.TorusKnotBufferGeometry(10, 3, 100, 16).toNonIndexed()
  const surfaceMaterial = new THREE.MeshLambertMaterial({ color: api.surfaceColor, wireframe: false })
  const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial)

  // Source: https://gist.github.com/gre/1650294
  const easeOutCubic = function (t) {
    return --t * t * t + 1
  }

  // Scaling curve causes particles to grow quickly, ease gradually into full scale, then
  // disappear quickly. More of the particle's lifetime is spent around full scale.
  const scaleCurve = function (t) {
    return Math.abs(easeOutCubic((t > 0.5 ? 1 - t : t) * 2))
  }

  useEffect(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(api.backgroundColor)
    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)

    // light
    const pointLight = new THREE.PointLight(0xaa8899, 0.75)
    pointLight.position.set(50, -25, 75)
    scene.add(pointLight)
    scene.add(new THREE.HemisphereLight())

    new GLTFLoader().load('./gltf/Flower.glb', gltf => {
      const _stemMesh = gltf.scene.getObjectByName('Stem')
      const _blossomMesh = gltf.scene.getObjectByName('Blossom')
      const stemGeometry = new THREE.InstancedBufferGeometry()
      const blossomGeometry = new THREE.InstancedBufferGeometry()
      THREE.BufferGeometry.prototype.copy.call(stemGeometry, _stemMesh.geometry)
      THREE.BufferGeometry.prototype.copy.call(blossomGeometry, _blossomMesh.geometry)
      const defaultTransform = new THREE.Matrix4().makeRotationX(Math.PI).multiply(new THREE.Matrix4().makeScale(7, 7, 7))
      stemGeometry.applyMatrix4(defaultTransform)
      blossomGeometry.applyMatrix4(defaultTransform)
      const stemMaterial = _stemMesh.material
      const blossomMaterial = _blossomMesh.material
      const _color = new THREE.Color()
      const color = new Float32Array(count * 3)
      const blossomPalette = [0xf20587, 0xf2d479, 0xf2c879, 0xf2b077, 0xf24405]

      for (let i = 0; i < count; i++) {
        _color.setHex(blossomPalette[Math.floor(Math.random() * blossomPalette.length)])
        _color.toArray(color, i * 3)
      }

      blossomGeometry.setAttribute('color', new THREE.InstancedBufferAttribute(color, 3))
      blossomMaterial.vertexColors = true

      const stemMesh = new THREE.InstancedMesh(stemGeometry, stemMaterial, count)
      const blossomMesh = new THREE.InstancedMesh(blossomGeometry, blossomMaterial, count)
      stemMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      blossomMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      scene.add(stemMesh)
      scene.add(blossomMesh)
      scene.add(surface)

      const resampleParticle = i => {
        sampler.sample(_position, _normal)
        _normal.add(_position)

        dummy.position.copy(_position)
        dummy.scale.set(scales[i], scales[i], scales[i])
        dummy.lookAt(_normal)
        dummy.updateMatrix()

        stemMesh.setMatrixAt(i, dummy.matrix)
        blossomMesh.setMatrixAt(i, dummy.matrix)
      }

      function resample() {
        const vertexCount = surface.geometry.getAttribute('position').count

        console.info(`Sampling ${count} points from a surface with ${vertexCount} vertices...`)

        //

        console.time('.build()')

        sampler = new MeshSurfaceSampler(surface).setWeightAttribute(api.distribution === 'weighted' ? 'uv' : null).build()

        console.timeEnd('.build()')

        //

        console.time('.sample()')

        for (let i = 0; i < count; i++) {
          ages[i] = Math.random()
          scales[i] = scaleCurve(ages[i])

          resampleParticle(i)
        }

        console.timeEnd('.sample()')

        stemMesh.instanceMatrix.needsUpdate = true
        blossomMesh.instanceMatrix.needsUpdate = true
      }
      resample()

      const updateParticle = i => {
        ages[i] += 0.005
        if (ages[i] >= 1) {
          ages[i] = 0.001
          scales[i] = scaleCurve(ages[i])

          resampleParticle(i)
        }
        const prevScale = scales[i]
        scales[i] = scaleCurve(ages[i])
        _scale.set(scales[i] / prevScale, scales[i] / prevScale, scales[i] / prevScale)

        // Update transform.

        stemMesh.getMatrixAt(i, dummy.matrix)
        dummy.matrix.scale(_scale)
        stemMesh.setMatrixAt(i, dummy.matrix)
        blossomMesh.setMatrixAt(i, dummy.matrix)
      }

      const render = () => {
        if (stemMesh && blossomMesh) {
          const time = Date.now() * 0.001

          scene.rotation.x = Math.sin(time / 4)
          scene.rotation.y = Math.sin(time / 2)

          for (let i = 0; i < api.count; i++) {
            updateParticle(i)
          }

          stemMesh.instanceMatrix.needsUpdate = true
          blossomMesh.instanceMatrix.needsUpdate = true
        }
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
  // return <div id="cesiumContainer" />
}
export default InstancingScatterScene
