import React, { useEffect, createRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js'
import { FocusShader } from 'three/examples/jsm/shaders/FocusShader.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'

const parent = new THREE.Object3D()
const clonemeshes = []
const clock = new THREE.Clock()

const createDefaultScene = () => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000104)
  scene.fog = new THREE.FogExp2(0x000104, 0.0000675)
  return scene
}

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 50000)
  camera.position.set(0, 700, 7000)
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.autoClear = false
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const createBufferGeometry = (positions: THREE.BufferAttribute) => {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', positions.clone())
  geometry.setAttribute('initialPosition', positions.clone())
  geometry.attributes.position.setUsage(THREE.DynamicDrawUsage)
  return geometry
}

function createMesh(positions, scale: number, x, y, z, color) {
  const geometry = createBufferGeometry(positions)
  const clones = [
    [6000, 0, -4000],
    [5000, 0, 0],
    [1000, 0, 5000],
    [1000, 0, -5000],
    [4000, 0, 2000],
    [-4000, 0, 1000],
    [-5000, 0, -5000],

    [0, 0, 0]
  ]
  let mesh
  for (let i = 0; i < clones.length; i++) {
    const c = i < clones.length - 1 ? 0x252525 : color

    mesh = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 30, color: c }))
    mesh.scale.x = scale
    mesh.scale.y = scale
    mesh.scale.z = scale

    mesh.position.x = x + clones[i][0]
    mesh.position.y = y + clones[i][1]
    mesh.position.z = z + clones[i][2]

    parent.add(mesh)

    clonemeshes.push({ mesh, speed: 0.5 + Math.random() })
  }
  return mesh
}

function combineBuffer(model: THREE.Group, bufferName: string) {
  let count = 0

  model.traverse(function (child) {
    if (child.isMesh) {
      const buffer = child.geometry.attributes[bufferName]

      count += buffer.array.length
    }
  })

  const combined = new Float32Array(count)
  console.log(count)

  let offset = 0
  model.traverse(function (child) {
    if (child.isMesh) {
      const buffer = child.geometry.attributes[bufferName]
      combined.set(buffer.array, offset)
      offset += buffer.array.length
    }
  })

  return new THREE.BufferAttribute(combined, 3)
}

const loadMaleObj = (loader: OBJLoader, meshes: any[]) => {
  loader.load('./brain.obj', object => {
    const positions = combineBuffer(object, 'position')
    const colors = [0xff7744, 0xff5522, 0xff9922, 0xff99ff]
    const localesZ = [600, 0, 1500, -1500]
    const localesX = [-500, 500, -250, -250]

    for (let i = 0; i < 4; i++) {
      const mesh = createMesh(positions, 4.05, localesX[i], -350, localesZ[i], colors[i])
      meshes.push({
        mesh,
        verticesDown: 0,
        verticesUp: 0,
        direction: 0,
        speed: 15,
        delay: Math.floor(200 + 200 * Math.random()),
        start: Math.floor(100 + 200 * Math.random())
      })
    }
  })
}

const loadFemaleObj = (loader: OBJLoader, meshes: any[]) => {
  loader.load('./female02.obj', object => {
    const positions = combineBuffer(object, 'position')
    const colors = [0xffdd44, 0xffffff, 0xff4422, 0xff9955, 0xff77dd]
    const localesZ = [0, 0, 400, 1500, 2500]
    const localesX = [-1000, 0, 1000, 250, 250]
    for (let i = 0; i < 5; i++) {
      const mesh = createMesh(positions, 4.05, localesX[i], -350, localesZ[i], colors[i])
      meshes.push({
        mesh,
        verticesDown: 0,
        verticesUp: 0,
        direction: 0,
        speed: 15,
        delay: Math.floor(200 + 200 * Math.random()),
        start: Math.floor(100 + 200 * Math.random())
      })
    }
  })
}

const loadBox = (loader: OBJLoader, meshes: any[]) => {
  const geometry = new THREE.BoxBufferGeometry(100, 100, 100, 10, 10, 10)
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })

  const cubeA = new THREE.Mesh(geometry, material)
  cubeA.position.set(100, 100, 0)

  const cubeB = new THREE.Mesh(geometry, material)
  cubeB.position.set(-100, -100, 0)

  const group = new THREE.Group()
  group.add(cubeA)
  group.add(cubeB)
  const positions = combineBuffer(group, 'position')
  const colors = [0xffdd44, 0xffffff, 0xff4422, 0xff9955, 0xff77dd]
  const localesZ = [0, 0, 400, 1500, 2500]
  const localesX = [-1000, 0, 1000, 250, 250]
  for (let i = 0; i < 5; i++) {
    const mesh = createMesh(positions, 4.05, localesX[i], -150, localesZ[i], colors[i])
    meshes.push({
      mesh,
      verticesDown: 0,
      verticesUp: 0,
      direction: 0,
      speed: 15,
      delay: Math.floor(200 + 200 * Math.random()),
      start: Math.floor(100 + 200 * Math.random())
    })
  }
}

const PointDynamicScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = createDefaultScene()
    const camera = createDefaultCamera()
    camera.lookAt(scene.position)

    const loader = new OBJLoader()

    const meshes: any = []
    loadMaleObj(loader, meshes)
    loadBox(loader, meshes)

    const renderer = createDefaultRenderer(mount)

    scene.add(parent)

    const grid = new THREE.Points(
      new THREE.PlaneBufferGeometry(15000, 15000, 64, 64),
      new THREE.PointsMaterial({ color: 0xff0000, size: 10 })
    )
    grid.position.y = -400
    grid.rotation.x = -Math.PI / 2
    parent.add(grid)

    // postprocessing

    const renderModel = new RenderPass(scene, camera)
    const effectBloom = new BloomPass(0.75)
    const effectFilm = new FilmPass(0.5, 0.5, 1448, false)
    const effectFocus = new ShaderPass(FocusShader)
    effectFocus.uniforms.screenWidth.value = window.innerWidth * window.devicePixelRatio
    effectFocus.uniforms.screenHeight.value = window.innerHeight * window.devicePixelRatio
    const composer = new EffectComposer(renderer)
    composer.addPass(renderModel)
    composer.addPass(effectBloom)
    composer.addPass(effectFilm)
    composer.addPass(effectFocus)

    const stats = Stats()
    mount.current!.appendChild(stats.dom)

    const render = () => {
      let delta = 10 * clock.getDelta()

      delta = delta < 2 ? delta : 2

      // rotate scene
      parent.rotation.y += -0.02 * delta

      for (let j = 0; j < clonemeshes.length; j++) {
        const cm = clonemeshes[j]
        // rotate objects
        cm.mesh.rotation.y += -0.1 * delta * cm.speed
      }
      for (let j = 0; j < meshes.length; j++) {
        const data = meshes[j]
        const positions = data.mesh.geometry.attributes.position
        const initialPositions = data.mesh.geometry.attributes.initialPosition

        const { count } = positions

        if (data.start > 0) {
          data.start -= 1
        } else if (data.direction === 0) {
          data.direction = -1
        }

        for (let i = 0; i < count; i++) {
          const px = positions.getX(i)
          const py = positions.getY(i)
          const pz = positions.getZ(i)

          // falling down
          if (data.direction < 0) {
            if (py > 0) {
              positions.setXYZ(
                i,
                px + 1.5 * (0.5 - Math.random()) * data.speed * delta,
                py + 3.0 * (0.25 - Math.random()) * data.speed * delta,
                pz + 1.5 * (0.5 - Math.random()) * data.speed * delta
              )
            } else {
              data.verticesDown += 1
            }
          }

          // rising up
          if (data.direction > 0) {
            const ix = initialPositions.getX(i)
            const iy = initialPositions.getY(i)
            const iz = initialPositions.getZ(i)

            const dx = Math.abs(px - ix)
            const dy = Math.abs(py - iy)
            const dz = Math.abs(pz - iz)

            const d = dx + dy + dx

            if (d > 1) {
              positions.setXYZ(
                i,
                px - ((px - ix) / dx) * data.speed * delta * (0.85 - Math.random()),
                py - ((py - iy) / dy) * data.speed * delta * (1 + Math.random()),
                pz - ((pz - iz) / dz) * data.speed * delta * (0.85 - Math.random())
              )
            } else {
              data.verticesUp += 1
            }
          }
        }

        // all vertices down
        if (data.verticesDown >= count) {
          if (data.delay <= 0) {
            data.direction = 1
            data.speed = 5
            data.verticesDown = 0
            data.delay = 320
          } else {
            data.delay -= 1
          }
        }

        // all vertices up
        if (data.verticesUp >= count) {
          if (data.delay <= 0) {
            data.direction = -1
            data.speed = 15
            data.verticesUp = 0
            data.delay = 120
          } else {
            data.delay -= 1
          }
        }

        positions.needsUpdate = true
      }
      composer.render(0.01)
    }

    const animate = () => {
      requestAnimationFrame(animate)
      render()
      stats.update()
    }
    animate()
  }, [])
  return <div ref={mount} />
}

export default PointDynamicScene
