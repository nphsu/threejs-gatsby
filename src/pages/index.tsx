import React, { useEffect, createRef } from 'react'
import { Link } from 'gatsby'
import * as THREE from 'three'

import Page from '../components/Page'
import Container from '../components/Container'
import IndexLayout from '../layouts'

const IndexPage = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    if (mount.current) {
      mount.current.appendChild(renderer.domElement)
    }
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)
    camera.position.z = 5
    const animate = () => {
      requestAnimationFrame(animate)
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01
      renderer.render(scene, camera)
    }
    animate()
  }, [])
  return (
    <IndexLayout>
      <div ref={mount} />
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
