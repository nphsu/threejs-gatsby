import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000)
  camera.position.set(500, 350, 750)
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
const Element = (id, x, y, z, ry) => {
  const div = document.createElement('div')
  div.style.width = '480px'
  div.style.height = '360px'
  div.style.backgroundColor = '#000'
  const iframe = document.createElement('iframe')
  iframe.style.width = '480px'
  iframe.style.height = '360px'
  iframe.style.border = '0px'
  iframe.src = ['https://www.youtube.com/embed/', id, '?rel=0'].join('')
  div.appendChild(iframe)

  const object = new CSS3DObject(div)
  object.position.set(x, y, z)
  object.rotation.y = ry
  return object
}

const YouTubeScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)

    const group = new THREE.Group()
    group.add(Element('SJOz3qjfQXU', 0, 0, 240, 0))
    group.add(Element('Y2-xZ-1HE-Q', 240, 0, 0, Math.PI / 2))
    group.add(Element('IrydklNpcFI', 0, 0, -240, Math.PI))
    group.add(Element('WlkWTye4mfI', -240, 0, 0, -Math.PI / 2))
    scene.add(group)

    const controls = new TrackballControls(camera, renderer.domElement)
    controls.rotateSpeed = 4

    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default YouTubeScene
