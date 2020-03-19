import React, { useEffect, createRef } from 'react'
import { css, CSSObject } from '@emotion/core'
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { newTable } from './periodic/tables'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 3000
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new CSS3DRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const createTableForm = (table: (string | number)[], scene: THREE.Scene) => {
  const objects = []
  const tables = []
  for (let i = 0; i < table.length; i += 5) {
    const element = document.createElement('div')
    element.className = 'element'
    element.style.backgroundColor = `rgba(0,127,127,${Math.random() * 0.5 + 0.25})`

    const number = document.createElement('div')
    number.className = 'number'
    number.textContent = (i / 5 + 1).toString()
    element.appendChild(number)

    const symbol = document.createElement('div')
    symbol.className = 'symbol'
    symbol.textContent = table[i].toString()
    element.appendChild(symbol)

    const details = document.createElement('div')
    details.className = 'details'
    details.innerHTML = `${table[i + 1]}<br>${table[i + 2]}`
    element.appendChild(details)

    const cssObject = new CSS3DObject(element)
    cssObject.position.x = Math.random() * 4000 - 2000
    cssObject.position.y = Math.random() * 4000 - 2000
    cssObject.position.z = Math.random() * 4000 - 2000
    scene.add(cssObject)

    objects.push(cssObject)

    //

    const object3D = new THREE.Object3D()
    object3D.position.x = Number(table[i + 3]) * 140 - 1330
    object3D.position.y = -(Number(table[i + 4]) * 180) + 990

    tables.push(object3D)
  }
  return { objects, tables }
}

const createSphereForm = (objects: CSS3DObject[]) => {
  const spheres = []
  const vector = new THREE.Vector3()

  for (let i = 0, l = objects.length; i < l; i++) {
    const phi = Math.acos(-1 + (2 * i) / l)
    const theta = Math.sqrt(l * Math.PI) * phi

    const object = new THREE.Object3D()

    object.position.setFromSphericalCoords(800, phi, theta)

    vector.copy(object.position).multiplyScalar(2)

    object.lookAt(vector)

    spheres.push(object)
  }
  return spheres
}

const createHelixForm = (objects: CSS3DObject[]) => {
  const helixs = []
  const vector = new THREE.Vector3()

  for (let i = 0, l = objects.length; i < l; i++) {
    const theta = i * 0.175 + Math.PI
    const y = -(i * 8) + 450

    const object = new THREE.Object3D()

    object.position.setFromCylindricalCoords(900, theta, y)

    vector.x = object.position.x * 2
    vector.y = object.position.y
    vector.z = object.position.z * 2

    object.lookAt(vector)

    helixs.push(object)
  }
  return helixs
}

const createGridForm = (objects: CSS3DObject[]) => {
  const grids = []
  for (let i = 0; i < objects.length; i++) {
    const object = new THREE.Object3D()

    object.position.x = (i % 5) * 400 - 800
    object.position.y = -(Math.floor(i / 5) % 5) * 400 + 800
    object.position.z = Math.floor(i / 25) * 1000 - 2000

    grids.push(object)
  }
  return grids
}

const transform = (targets: THREE.Object3D[], duration: number, render: any, objects: CSS3DObject[]) => {
  TWEEN.removeAll()
  for (let i = 0; i < objects.length; i++) {
    const object = objects[i]
    const target = targets[i]

    new TWEEN.Tween(object.position)
      .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start()

    new TWEEN.Tween(object.rotation)
      .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start()
  }

  new TWEEN.Tween(this)
    .to({}, duration * 2)
    .onUpdate(render)
    .start()
}

const createTrackballControls = (camera: THREE.PerspectiveCamera, renderer: CSS3DRenderer, render: any) => {
  const controls = new TrackballControls(camera, renderer.domElement)
  controls.minDistance = 500
  controls.maxDistance = 6000
  controls.addEventListener('change', render)
  return controls
}

const PeriodicTableScene = () => {
  const mount = createRef<HTMLInputElement>()
  const table = createRef<HTMLInputElement>()
  const sphere = createRef<HTMLInputElement>()
  const helix = createRef<HTMLInputElement>()
  const grid = createRef<HTMLInputElement>()
  useEffect(() => {
    // scene
    const scene = new THREE.Scene()

    // camera
    const camera = createDefaultCamera()

    // renderer
    const renderer = createDefaultRenderer(mount)

    // controls
    const render = () => renderer.render(scene, camera)
    const controls = createTrackballControls(camera, renderer, render)

    // object
    const periodicTables = newTable()
    const { objects, tables } = createTableForm(periodicTables, scene)
    const spheres = createSphereForm(objects)
    const helixs = createHelixForm(objects)
    const grids = createGridForm(objects)

    // click event listener
    table.current!.addEventListener('click', () => transform(tables, 2000, render, objects), false)
    sphere.current!.addEventListener('click', () => transform(spheres, 2000, render, objects), false)
    helix.current!.addEventListener('click', () => transform(helixs, 2000, render, objects), false)
    grid.current!.addEventListener('click', () => transform(grids, 2000, render, objects), false)

    transform(tables, 2000, render, objects)
    const animate = () => {
      requestAnimationFrame(animate)
      TWEEN.update()
      controls.update()
    }
    animate()
  }, [])

  return (
    <div
      css={css`
        background: linear-gradient(to bottom, #11e8bb 0%, #8200c9 100%);
        .element {
          width: 120px;
          height: 160px;
          box-shadow: 0px 0px 12px rgba(0, 255, 255, 0.5);
          border: 1px solid rgba(127, 255, 255, 0.25);
          font-family: Helvetica, sans-serif;
          text-align: center;
          line-height: normal;
          cursor: default;
        }
        .element:hover {
          box-shadow: 0px 0px 12px rgba(0, 255, 255, 0.75);
          border: 1px solid rgba(127, 255, 255, 0.75);
        }
        .element .number {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 12px;
          color: rgba(127, 255, 255, 0.75);
        }
        .element .symbol {
          position: absolute;
          top: 40px;
          left: 0px;
          right: 0px;
          font-size: 60px;
          font-weight: bold;
          color: rgba(255, 255, 255, 0.75);
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.95);
        }

        .element .details {
          position: absolute;
          bottom: 15px;
          left: 0px;
          right: 0px;
          font-size: 12px;
          color: rgba(127, 255, 255, 0.75);
        }
        .button {
          color: rgba(127, 255, 255, 0.75);
          background: transparent;
          outline: 1px solid rgba(127, 255, 255, 0.75);
          border: 0px;
          padding: 5px 10px;
          cursor: pointer;
        }

        .button:hover {
          background-color: rgba(0, 255, 255, 0.5);
        }

        .button:active {
          color: #000000;
          background-color: rgba(0, 255, 255, 0.75);
        }
      `}
    >
      <div ref={mount} />
      <div className="button" id="table" ref={table}>
        TABLE
      </div>
      <div className="button" id="sphere" ref={sphere}>
        SPHERE
      </div>
      <div className="button" id="helix" ref={helix}>
        HELIX
      </div>
      <div className="button" id="grid" ref={grid}>
        GRID
      </div>
    </div>
  )
}

export default PeriodicTableScene
