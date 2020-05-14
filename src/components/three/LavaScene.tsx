import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js'

const frag = `
uniform float time;

uniform float fogDensity;
uniform vec3 fogColor;

uniform sampler2D texture1;
uniform sampler2D texture2;

varying vec2 vUv;

void main( void ) {

  vec2 position = - 1.0 + 2.0 * vUv;

  vec4 noise = texture2D( texture1, vUv );
  vec2 T1 = vUv + vec2( 1.5, - 1.5 ) * time * 0.02;
  vec2 T2 = vUv + vec2( - 0.5, 2.0 ) * time * 0.01;

  T1.x += noise.x * 2.0;
  T1.y += noise.y * 2.0;
  T2.x -= noise.y * 0.2;
  T2.y += noise.z * 0.2;

  float p = texture2D( texture1, T1 * 2.0 ).a;

  vec4 color = texture2D( texture2, T2 * 2.0 );
  vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );

  if( temp.r > 1.0 ) { temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }
  if( temp.g > 1.0 ) { temp.rb += temp.g - 1.0; }
  if( temp.b > 1.0 ) { temp.rg += temp.b - 1.0; }

  gl_FragColor = temp;

  float depth = gl_FragCoord.z / gl_FragCoord.w;
  const float LOG2 = 1.442695;
  float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
  fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );

  gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );

}
`

const vert = `
uniform vec2 uvScale;
varying vec2 vUv;

void main()
{

  vUv = uvScale * uv;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;

}
`

const clock = new THREE.Clock()

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 3000)
  camera.position.z = 4
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  return camera
}

const newRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.autoClear = false
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const newScene = () => {
  const scene = new THREE.Scene()
  return scene
}

const LavaScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = newScene()
    const camera = newCamera()
    const renderer = newRenderer(mount)

    const textureLoader = new THREE.TextureLoader()
    const uniforms = {
      fogDensity: { value: 0.45 },
      fogColor: { value: new THREE.Vector3(0, 0, 0) },
      time: { value: 1.0 },
      uvScale: { value: new THREE.Vector2(3.0, 1.0) },
      texture1: { value: textureLoader.load('textures/lava/cloud.png') },
      texture2: { value: textureLoader.load('textures/lava/lavatile.jpg') }
    }

    uniforms.texture1.value.wrapS = THREE.RepeatWrapping
    uniforms.texture1.value.wrapT = THREE.RepeatWrapping
    uniforms.texture2.value.wrapS = THREE.RepeatWrapping
    uniforms.texture2.value.wrapT = THREE.RepeatWrapping

    const size = 0.65

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag
    })
    const mesh = new THREE.Mesh(new THREE.TorusBufferGeometry(size, 0.3, 30, 30), material)
    mesh.rotation.x = 0.3
    scene.add(mesh)

    const renderModel = new RenderPass(scene, camera)
    const effectBloom = new BloomPass(1.25)
    const effectFilm = new FilmPass(0.35, 0.95, 2048, false)

    const composer = new EffectComposer(renderer)

    composer.addPass(renderModel)
    composer.addPass(effectBloom)
    composer.addPass(effectFilm)

    const render = () => {
      const delta = 5 * clock.getDelta()

      uniforms.time.value += 0.2 * delta

      mesh.rotation.y += 0.0125 * delta
      mesh.rotation.x += 0.05 * delta

      renderer.clear()
      composer.render(0.01)
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default LavaScene
