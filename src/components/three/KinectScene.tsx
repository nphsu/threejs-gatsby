import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'

const vert = `
uniform sampler2D map;
uniform float width;
uniform float height;
uniform float nearClipping, farClipping;

uniform float pointSize;
uniform float zOffset;

varying vec2 vUv;
const float XtoZ = 1.11146; // tan( 1.0144686 / 2.0 ) * 2.0;
const float YtoZ = 0.83359; // tan( 0.7898090 / 2.0 ) * 2.0;
void main() {
  vUv = vec2( position.x / width, position.y / height );
  vec4 color = texture2D( map, vUv );
  float depth = ( color.r + color.g + color.b ) / 3.0;

  float z = ( 1.0 - depth ) * (farClipping - nearClipping) + nearClipping;
  vec4 pos = vec4(
    ( position.x / width - 0.5 ) * z * XtoZ,
    ( position.y / height - 0.5 ) * z * YtoZ,
    - z + zOffset,
    1.0);

  gl_PointSize = pointSize;
  gl_Position = projectionMatrix * modelViewMatrix * pos;
}
`

const frag = `
uniform sampler2D map;
varying vec2 vUv;
void main() {
  vec4 color = texture2D( map, vUv );
  gl_FragColor = vec4( color.r, color.g, color.b, 0.2 );
}
`

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.set(0, 0, 500)
  return camera
}

const newRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.autoClear = true
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const newScene = () => {
  const scene = new THREE.Scene()
  return scene
}

const KinectScene = () => {
  const mount = createRef<HTMLInputElement>()
  const video = createRef<HTMLVideoElement>()
  const center = new THREE.Vector3()
  center.z = -1000

  useEffect(() => {
    const scene = newScene()
    const camera = newCamera()
    const renderer = newRenderer(mount)

    video.current!.addEventListener(
      'loadedmetadata',
      function () {
        const texture = new THREE.VideoTexture(video.current!)
        texture.minFilter = THREE.NearestFilter
        const width = 640
        const height = 480
        const nearClipping = 850
        const farClipping = 4000

        const geometry = new THREE.BufferGeometry()

        const vertices = new Float32Array(width * height * 3)
        for (let i = 0, j = 0, l = vertices.length; i < l; i += 3, j++) {
          vertices[i] = j % width
          vertices[i + 1] = Math.floor(j / width)
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
        const material = new THREE.ShaderMaterial({
          uniforms: {
            map: { value: texture },
            width: { value: width },
            height: { value: height },
            nearClipping: { value: nearClipping },
            farClipping: { value: farClipping },

            pointSize: { value: 2 },
            zOffset: { value: 1000 }
          },
          vertexShader: vert,
          fragmentShader: frag,
          blending: THREE.AdditiveBlending,
          depthTest: false,
          depthWrite: false,
          transparent: true
        })
        const mesh = new THREE.Points(geometry, material)
        scene.add(mesh)
      },
      false
    )
    video.current!.play()

    const mouse = new THREE.Vector3(0, 0, 1)
    const onDocumentMouseMove = event => {
      mouse.x = (event.clientX - window.innerWidth / 2) * 10
      mouse.x = (event.clientY - window.innerHeight / 2) * 10
    }
    mount.current!.addEventListener('mousemove', onDocumentMouseMove, false)

    const render = () => {
      camera.position.x += (mouse.x - camera.position.x) * 0.05
      camera.position.y += (-mouse.y - camera.position.y) * 0.05
      camera.lookAt(center)
      renderer.render(scene, camera)
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
    }
    animate()
  }, [])
  return (
    <>
      <div css={css``} ref={mount} />
      <video ref={video} id="video" loop muted crossOrigin="anonymous" playsinline className="display:none">
        <source src="./textures/kinect/kinect.webm" />
        <source src="./textures/kinect/kinect.mp4" />
      </video>
    </>
  )
}
export default KinectScene
