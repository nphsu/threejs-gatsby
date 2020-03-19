// TODO
// https://www.contentful.com/blog/2018/06/13/journey-cutting-edge-static-sites-gatsbyjs-v2/
import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 50
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.autoClear = false
  renderer.setClearColor(0x000000, 0.0)
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

// circle corner
// https://teratail.com/questions/136910
const PlaneLayerScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    // scene
    const scene = new THREE.Scene()

    // camera
    const camera = createDefaultCamera()

    // renderer
    const renderer = createDefaultRenderer(mount)

    // const boxGeometry = new THREE.BoxBufferGeometry(5, 0.2, 5)
    //   .rotateX(1)
    //   .rotateY(1)
    //   .rotateZ(1)

    const edges = new THREE.EdgesGeometry(boxGeometry)
    const lineBox = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xff55dd }))
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    // const plane = new THREE.Mesh(lineBox, material)
    scene.add(lineBox)

    // light

    renderer.render(scene, camera)
  }, [])
  return (
    <div
      css={css`
        background: linear-gradient(to bottom, #11e8bb 0%, #8200c9 100%);
      `}
    >
      <div ref={mount} />
    </div>
  )
}

export default PlaneLayerScene
