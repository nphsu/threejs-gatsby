import React, { useEffect, createRef } from 'react'
import * as THREE from 'three'
import helvetiker from '../../fonts/helvetiker_bold.typeface.json'

const vert = `
uniform float amplitude;

attribute vec3 displacement;
attribute vec3 customColor;

varying vec3 vColor;

void main() {

  vec3 newPosition = position + amplitude * displacement;

  vColor = customColor;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}
`

const frag = `
uniform vec3 color;
uniform float opacity;

varying vec3 vColor;

void main() {

  gl_FragColor = vec4( vColor * color, opacity );

}
`

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 400
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const createDefaultGeometry = () => {
  const font = new THREE.FontLoader().parse(helvetiker)
  const geometry = new THREE.TextBufferGeometry('Shumpei', {
    font,
    size: 50,
    height: 15,
    curveSegments: 10,

    bevelThickness: 5,
    bevelSize: 1.5,
    bevelEnabled: true,
    bevelSegments: 10
  })
  geometry.center()
  return geometry
}

const addLine = (scene: THREE.Scene, geometry: THREE.BufferGeometry | THREE.Geometry, material: THREE.Material) => {
  // mesh
  const line = new THREE.Line(geometry, material)
  scene.add(line)
  return line
}

const AttributeLineScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    // scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050505)

    // camera
    const camera = createDefaultCamera()

    // renderer
    const renderer = createDefaultRenderer(mount)

    const uniforms = {
      amplitude: { value: 5.0 },
      opacity: { value: 0.3 },
      color: { value: new THREE.Color(0xffffff) }
    }
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true
    })

    // object
    const geometry = createDefaultGeometry()
    const { count } = geometry.attributes.position
    const displacement = new THREE.Float32BufferAttribute(count * 3, 3)
    geometry.setAttribute('displacement', displacement)
    const customColor = new THREE.Float32BufferAttribute(count * 3, 3)
    geometry.setAttribute('customColor', customColor)

    const color = new THREE.Color(0xffffff)
    for (let i = 0, l = customColor.count; i < l; i++) {
      color.setHSL(i / l, 0.5, 0.5)
      color.toArray(customColor.array, i * customColor.itemSize)
    }
    const line = addLine(scene, geometry, material)

    // render
    const render = () => {
      const time = Date.now() * 0.001

      line.rotation.y = 0.25 * time

      uniforms.amplitude.value = Math.sin(0.5 * time)
      uniforms.color.value.offsetHSL(0.0005, 0, 0)

      const { attributes } = line.geometry
      const { array } = attributes.displacement

      for (let i = 0, l = array.length; i < l; i += 3) {
        array[i] += 0.3 * (0.5 - Math.random())
        array[i + 1] += 0.3 * (0.5 - Math.random())
        array[i + 2] += 0.3 * (0.5 - Math.random())
      }
      attributes.displacement.needsUpdate = true

      renderer.render(scene, camera)
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
    }
    animate()
  }, [])
  return <div ref={mount} />
}

export default AttributeLineScene
