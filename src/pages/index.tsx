import React, { useEffect, createRef } from 'react'
import { Link } from 'gatsby'
import * as THREE from 'three'
// import Stats from 'three/examples/libs/stats.module'
import helvetiker from '../fonts/helvetiker_bold.typeface.json'
import Page from '../components/Page'
import Container from '../components/Container'
import IndexLayout from '../layouts'

const IndexPage = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    const renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    // const stats = new Stats()

    if (mount.current) {
      mount.current.appendChild(renderer.domElement)
      // mount.current.appendChild(stats.dom)
    }
    const font = new THREE.FontLoader().parse(helvetiker)
    const uniforms = {
      amplitude: { value: 5.0 },
      opacity: { value: 0.3 },
      color: { value: new THREE.Color(0xffffff) }
    }
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms,
      // vertexShader: document.getElementById('vertexshader').textContent,
      // fragmentShader: document.getElementById('fragmentshader').textContent,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true
    })

    const geometry = new THREE.TextBufferGeometry('three.js', {
      font,
      size: 10,
      height: 3,
      curveSegments: 10,

      bevelThickness: 5,
      bevelSize: 1.5,
      bevelEnabled: true,
      bevelSegments: 10
    })
    geometry.center()

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
    const line = new THREE.Line(geometry, shaderMaterial)
    line.rotation.x = 0.2
    scene.add(line)
    camera.position.z = 100

    const animate = () => {
      requestAnimationFrame(animate)
      const time = Date.now() * 0.001
      line.rotation.y = 0.25 * time
      renderer.render(scene, camera)
    }
    animate()
  }, [])
  return (
    <IndexLayout>
      <div ref={mount}>{/* <div id="vertexshader" />
        <div id="fragmentshader" /> */}</div>
      <Page>
        <Container>
          <h1>Hi people</h1>
          <p>Welcome to your new Gatsby site.</p>
          <p>Now go build something great.</p>
          <Link to="/page-2/">Go to page 2</Link>
        </Container>
      </Page>
    </IndexLayout>
  )
}

export default IndexPage
