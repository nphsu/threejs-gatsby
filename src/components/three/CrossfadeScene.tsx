import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
import FXScene from './crossfade/FxScene'

const clock = new THREE.Clock()
const transitionParams = {
  useTexture: true,
  transition: 0.5,
  transitionSpeed: 2.0,
  texture: 5,
  loopTexture: true,
  animateTransition: true,
  textureThreshold: 0.3
}

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000)
  camera.position.z = 5
  return camera
}

const createDefaultRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.autoClear = true
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

class Transition {
  scene: any

  cameraOrtho: any

  textures: any

  quadmaterial: any

  quad: any

  sceneA: any

  sceneB: any

  needChange: any

  constructor(sceneA, sceneB) {
    this.scene = new THREE.Scene()

    this.cameraOrtho = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      -10,
      10
    )

    this.textures = []

    const loader = new THREE.TextureLoader()

    for (let i = 0; i < 6; i++) this.textures[i] = loader.load(`./textures/transition/transition${i + 1}.png`)

    this.quadmaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse1: {
          value: null
        },
        tDiffuse2: {
          value: null
        },
        mixRatio: {
          value: 0.0
        },
        threshold: {
          value: 0.1
        },
        useTexture: {
          value: 1
        },
        tMixTexture: {
          value: this.textures[0]
        }
      },
      vertexShader: [
        'varying vec2 vUv;',

        'void main() {',

        'vUv = vec2( uv.x, uv.y );',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform float mixRatio;',

        'uniform sampler2D tDiffuse1;',
        'uniform sampler2D tDiffuse2;',
        'uniform sampler2D tMixTexture;',

        'uniform int useTexture;',
        'uniform float threshold;',

        'varying vec2 vUv;',

        'void main() {',

        '	vec4 texel1 = texture2D( tDiffuse1, vUv );',
        '	vec4 texel2 = texture2D( tDiffuse2, vUv );',

        '	if (useTexture==1) {',

        '		vec4 transitionTexel = texture2D( tMixTexture, vUv );',
        '		float r = mixRatio * (1.0 + threshold * 2.0) - threshold;',
        '		float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);',

        '		gl_FragColor = mix( texel1, texel2, mixf );',

        '	} else {',

        '		gl_FragColor = mix( texel2, texel1, mixRatio );',

        '	}',

        '}'
      ].join('\n')
    })

    const quadgeometry = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight)

    this.quad = new THREE.Mesh(quadgeometry, this.quadmaterial)
    this.scene.add(this.quad)

    // Link both scenes and their FBOs
    this.sceneA = sceneA
    this.sceneB = sceneB

    this.quadmaterial.uniforms.tDiffuse1.value = sceneA.fbo.texture
    this.quadmaterial.uniforms.tDiffuse2.value = sceneB.fbo.texture

    this.needChange = false
  }

  setTextureThreshold = function (value) {
    this.quadmaterial.uniforms.threshold.value = value
  }

  useTexture = function (value) {
    this.quadmaterial.uniforms.useTexture.value = value ? 1 : 0
  }

  setTexture = function (i) {
    this.quadmaterial.uniforms.tMixTexture.value = this.textures[i]
  }

  render = function (delta, renderer) {
    // Transition animation
    if (transitionParams.animateTransition) {
      const t = (1 + Math.sin((transitionParams.transitionSpeed * clock.getElapsedTime()) / Math.PI)) / 2
      transitionParams.transition = THREE.MathUtils.smoothstep(t, 0.3, 0.7)

      // Change the current alpha texture after each transition
      if (transitionParams.loopTexture && (transitionParams.transition == 0 || transitionParams.transition == 1)) {
        if (this.needChange) {
          transitionParams.texture = (transitionParams.texture + 1) % this.textures.length
          this.quadmaterial.uniforms.tMixTexture.value = this.textures[transitionParams.texture]
          this.needChange = false
        }
      } else this.needChange = true
    }

    this.quadmaterial.uniforms.mixRatio.value = transitionParams.transition

    // Prevent render both scenes when it's not necessary
    if (transitionParams.transition == 0) {
      this.sceneB.render(delta, false, renderer)
    } else if (transitionParams.transition == 1) {
      this.sceneA.render(delta, false, renderer)
    } else {
      // When 0<transition<1 render transition between two scenes

      this.sceneA.render(delta, true, renderer)
      this.sceneB.render(delta, true, renderer)
      renderer.setRenderTarget(null)
      renderer.clear()
      renderer.render(this.scene, this.cameraOrtho)
    }
  }
}

const CrossfadeScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const renderer = createDefaultRenderer(mount)

    const sceneA = new FXScene('cube', 5000, 1200, 120, new THREE.Vector3(0, -0.4, 0), 0xffffff)
    const sceneB = new FXScene('sphere', 500, 2000, 50, new THREE.Vector3(0, 0.2, 0.1), 0x000000)
    const transition = new Transition(sceneA, sceneB)

    const initGUI = () => {
      const gui = new GUI()

      gui.add(transitionParams, 'useTexture').onChange(function (value) {
        transition.useTexture(value)
      })

      gui.add(transitionParams, 'loopTexture')

      gui
        .add(transitionParams, 'texture', { Perlin: 0, Squares: 1, Cells: 2, Distort: 3, Gradient: 4, Radial: 5 })
        .onChange(function (value) {
          transition.setTexture(value)
        })
        .listen()

      gui.add(transitionParams, 'textureThreshold', 0, 1, 0.01).onChange(function (value) {
        transition.setTextureThreshold(value)
      })

      gui.add(transitionParams, 'animateTransition')
      gui.add(transitionParams, 'transition', 0, 1, 0.01).listen()
      gui.add(transitionParams, 'transitionSpeed', 0.5, 5, 0.01)
    }
    initGUI()

    const render = () => {
      transition.render(clock.getDelta(), renderer)
    }

    const animate = () => {
      requestAnimationFrame(animate)
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default CrossfadeScene
