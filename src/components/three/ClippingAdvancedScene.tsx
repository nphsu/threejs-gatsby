import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.25, 16)
  camera.position.set(0, 1.5, 3)
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.autoClear = true
  renderer.localClippingEnabled = true
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const createPlanes = n => {
  // creates an array of n uninitialized plane objects
  const result = new Array(n)
  for (let i = 0; i !== n; ++i) result[i] = new THREE.Plane()
  return result
}

const cylindricalPlanes = (n, innerRadius) => {
  const result = createPlanes(n)

  for (let i = 0; i !== n; ++i) {
    const plane = result[i]
    const angle = (i * Math.PI * 2) / n

    plane.normal.set(Math.cos(angle), 0, Math.sin(angle))

    plane.constant = innerRadius
  }

  return result
}

const planesFromMesh = (vertices, indices) => {
  // creates a clipping volume from a convex triangular mesh
  // specified by the arrays 'vertices' and 'indices'

  const n = indices.length / 3
  const result = new Array(n)

  for (let i = 0, j = 0; i < n; ++i, j += 3) {
    const a = vertices[indices[j]]
    const b = vertices[indices[j + 1]]
    const c = vertices[indices[j + 2]]

    result[i] = new THREE.Plane().setFromCoplanarPoints(a, b, c)
  }

  return result
}

const ClippingAdvancedScene = () => {
  const mount = createRef<HTMLInputElement>()
  const Vertices = [
    new THREE.Vector3(+1, 0, +Math.SQRT1_2),
    new THREE.Vector3(-1, 0, +Math.SQRT1_2),
    new THREE.Vector3(0, +1, -Math.SQRT1_2),
    new THREE.Vector3(0, -1, -Math.SQRT1_2)
  ]
  const Indices = [0, 1, 2, 0, 2, 3, 0, 3, 1, 1, 3, 2]
  const Planes = planesFromMesh(Vertices, Indices)
  const Empty = Object.freeze([])

  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)
    renderer.clippingPlanes = Empty
    const GlobalClippingPlanes = cylindricalPlanes(5, 2.5)
    const globalClippingPlanes = createPlanes(GlobalClippingPlanes.length)

    // A regular tetrahedron for the clipping volume:
    const planeToMatrix = (function () {
      // creates a matrix that aligns X/Y to a given plane

      // temporaries:
      const xAxis = new THREE.Vector3()
      const yAxis = new THREE.Vector3()
      const trans = new THREE.Vector3()

      return plane => {
        const zAxis = plane.normal
        const matrix = new THREE.Matrix4()

        // Hughes & Moeller '99
        // "Building an Orthonormal Basis from a Unit Vector."

        if (Math.abs(zAxis.x) > Math.abs(zAxis.z)) {
          yAxis.set(-zAxis.y, zAxis.x, 0)
        } else {
          yAxis.set(0, -zAxis.z, zAxis.y)
        }

        xAxis.crossVectors(yAxis.normalize(), zAxis)

        plane.coplanarPoint(trans)
        return matrix.set(
          xAxis.x,
          yAxis.x,
          zAxis.x,
          trans.x,
          xAxis.y,
          yAxis.y,
          zAxis.y,
          trans.y,
          xAxis.z,
          yAxis.z,
          zAxis.z,
          trans.z,
          0,
          0,
          0,
          1
        )
      }
    })()

    const PlaneMatrices = Planes.map(planeToMatrix)

    // Lights

    scene.add(new THREE.AmbientLight(0xffffff, 0.3))

    const spotLight = new THREE.SpotLight(0xffffff, 0.5)
    spotLight.angle = Math.PI / 5
    spotLight.penumbra = 0.2
    spotLight.position.set(2, 3, 3)
    spotLight.castShadow = true
    spotLight.shadow.camera.near = 3
    spotLight.shadow.camera.far = 10
    spotLight.shadow.mapSize.width = 1024
    spotLight.shadow.mapSize.height = 1024
    scene.add(spotLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
    dirLight.position.set(0, 2, 0)
    dirLight.castShadow = true
    dirLight.shadow.camera.near = 1
    dirLight.shadow.camera.far = 10

    dirLight.shadow.camera.right = 1
    dirLight.shadow.camera.left = -1
    dirLight.shadow.camera.top = 1
    dirLight.shadow.camera.bottom = -1

    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    scene.add(dirLight)

    // Geometry

    const clipMaterial = new THREE.MeshPhongMaterial({
      color: 0xee0a10,
      shininess: 100,
      side: THREE.DoubleSide,
      // Clipping setup:
      clippingPlanes: createPlanes(Planes.length),
      clipShadows: true
    })
    const object = new THREE.Group()
    const geometry = new THREE.BoxBufferGeometry(0.18, 0.18, 0.18)
    for (let z = -2; z <= 2; ++z)
      for (let y = -2; y <= 2; ++y)
        for (let x = -2; x <= 2; ++x) {
          const mesh = new THREE.Mesh(geometry, clipMaterial)
          mesh.position.set(x / 5, y / 5, z / 5)
          mesh.castShadow = true
          object.add(mesh)
        }
    scene.add(object)
    const planeGeometry = new THREE.PlaneBufferGeometry(3, 3, 1, 1)
    const color = new THREE.Color()
    const volumeVisualization = new THREE.Group()
    volumeVisualization.visible = false

    for (var i = 0, n = Planes.length; i !== n; ++i) {
      const material = new THREE.MeshBasicMaterial({
        color: color.setHSL(i / n, 0.5, 0.5).getHex(),
        side: THREE.DoubleSide,

        opacity: 0.2,
        transparent: true,

        // clip to the others to show the volume (wildly
        // intersecting transparent planes look bad)
        clippingPlanes: clipMaterial.clippingPlanes.filter(function (_, j) {
          return j !== i
        })

        // no need to enable shadow clipping - the plane
        // visualization does not cast shadows
      })

      const mesh = new THREE.Mesh(planeGeometry, material)
      mesh.matrixAutoUpdate = false

      volumeVisualization.add(mesh)
    }

    scene.add(volumeVisualization)

    const ground = new THREE.Mesh(
      planeGeometry,
      new THREE.MeshPhongMaterial({
        color: 0xa0adaf,
        shininess: 10
      })
    )
    ground.rotation.x = -Math.PI / 2
    ground.scale.multiplyScalar(3)
    ground.receiveShadow = true
    scene.add(ground)

    // Controls

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.minDistance = 1
    controls.maxDistance = 8
    controls.target.set(0, 1, 0)
    controls.update()

    // Stats
    const stats = Stats()
    mount.current!.appendChild(stats.dom)

    function assignTransformedPlanes(planesOut, planesIn, matrix) {
      // sets an array of existing planes to transformed 'planesIn'

      for (let i = 0, n = planesIn.length; i !== n; ++i) planesOut[i].copy(planesIn[i]).applyMatrix4(matrix)
    }

    const setObjectWorldMatrix = (object, matrix) => {
      // set the orientation of an object based on a world matrix
      const { parent } = object
      scene.updateMatrixWorld()
      object.matrix.getInverse(parent.matrixWorld)
      object.applyMatrix4(matrix)
    }

    const startTime = Date.now()
    const animate = () => {
      const currentTime = Date.now()
      const time = (currentTime - startTime) / 1000
      requestAnimationFrame(animate)

      object.position.y = 1
      object.rotation.x = time * 0.5
      object.rotation.y = time * 0.2

      const transform = new THREE.Matrix4()
      const tmpMatrix = new THREE.Matrix4()

      object.updateMatrix()
      transform.copy(object.matrix)

      const bouncy = Math.cos(time * 0.5) * 0.5 + 0.7
      transform.multiply(tmpMatrix.makeScale(bouncy, bouncy, bouncy))

      assignTransformedPlanes(clipMaterial.clippingPlanes, Planes, transform)

      const planeMeshes = volumeVisualization.children

      for (let i = 0, n = planeMeshes.length; i !== n; ++i) {
        tmpMatrix.multiplyMatrices(transform, PlaneMatrices[i])
        setObjectWorldMatrix(planeMeshes[i], tmpMatrix)
      }

      transform.makeRotationY(time * 0.1)

      assignTransformedPlanes(globalClippingPlanes, GlobalClippingPlanes, transform)

      stats.begin()
      renderer.render(scene, camera)
      stats.end()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default ClippingAdvancedScene
