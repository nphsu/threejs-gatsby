import * as THREE from 'three'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const generateGeometry = (objectType, numObjects) => {
  const applyVertexColors = (geometry, color) => {
    const { position } = geometry.attributes
    const colors = []

    for (let i = 0; i < position.count; i++) {
      colors.push(color.r, color.g, color.b)
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  }
  const geometries = []

  const matrix = new THREE.Matrix4()
  const position = new THREE.Vector3()
  const rotation = new THREE.Euler()
  const quaternion = new THREE.Quaternion()
  const scale = new THREE.Vector3()
  const color = new THREE.Color()

  for (let i = 0; i < numObjects; i++) {
    position.x = Math.random() * 10000 - 5000
    position.y = Math.random() * 6000 - 3000
    position.z = Math.random() * 8000 - 4000

    rotation.x = Math.random() * 2 * Math.PI
    rotation.y = Math.random() * 2 * Math.PI
    rotation.z = Math.random() * 2 * Math.PI
    quaternion.setFromEuler(rotation)

    scale.x = Math.random() * 200 + 100

    let geometry

    if (objectType === 'cube') {
      geometry = new THREE.BoxBufferGeometry(1, 1, 1)
      geometry = geometry.toNonIndexed() // merging needs consistent buffer geometries
      scale.y = Math.random() * 200 + 100
      scale.z = Math.random() * 200 + 100
      color.setRGB(0, 0, 0.1 + 0.9 * Math.random())
    } else if (objectType === 'sphere') {
      geometry = new THREE.IcosahedronBufferGeometry(1, 1)
      scale.y = scale.z = scale.x
      color.setRGB(0.1 + 0.9 * Math.random(), 0, 0)
    }

    // give the geom's vertices a random color, to be displayed
    applyVertexColors(geometry, color)

    matrix.compose(
      position,
      quaternion,
      scale
    )
    geometry.applyMatrix4(matrix)

    geometries.push(geometry)
  }
  return BufferGeometryUtils.mergeBufferGeometries(geometries)
}

export default class FXScene {
  camera: any

  scene: any

  rotationSpeed: any

  mesh: any

  fbo: any

  clearColor: any

  constructor(type, numObjects, cameraZ, fov, rotationSpeed, clearColor) {
    this.clearColor = clearColor

    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 10000)
    this.camera.position.z = cameraZ

    // Setup scene
    this.scene = new THREE.Scene()
    this.scene.add(new THREE.AmbientLight(0x555555))

    const light = new THREE.SpotLight(0xffffff, 1.5)
    light.position.set(0, 500, 2000)
    this.scene.add(light)

    this.rotationSpeed = rotationSpeed

    const defaultMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, vertexColors: true })
    this.mesh = new THREE.Mesh(generateGeometry(type, numObjects), defaultMaterial)
    this.scene.add(this.mesh)

    const renderTargetParameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      stencilBuffer: false
    }
    this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters)
  }

  render = (delta, rtt, renderer: THREE.WebGLRenderer) => {
    this.mesh.rotation.x += delta * this.rotationSpeed.x
    this.mesh.rotation.y += delta * this.rotationSpeed.y
    this.mesh.rotation.z += delta * this.rotationSpeed.z

    console.log(renderer)
    renderer.setClearColor(this.clearColor)

    if (rtt) {
      renderer.setRenderTarget(this.fbo)
      renderer.clear()
      renderer.render(this.scene, this.camera)
    } else {
      renderer.setRenderTarget(null)
      renderer.render(this.scene, this.camera)
    }
  }
}
