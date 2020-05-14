import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js'
import { MaskPass, ClearMaskPass } from 'three/examples/jsm/postprocessing/MaskPass.js'
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass.js'

import { BleachBypassShader } from 'three/examples/jsm/shaders/BleachBypassShader.js'
import { ColorifyShader } from 'three/examples/jsm/shaders/ColorifyShader.js'
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js'
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js'
import { SepiaShader } from 'three/examples/jsm/shaders/SepiaShader.js'
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 900
  return camera
}

const newOrthoCamera = () => {
  const cameraOrtho = new THREE.OrthographicCamera(
    -window.innerWidth / 2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    -window.innerHeight / 2,
    -10000,
    10000
  )
  cameraOrtho.position.z = 100
  return cameraOrtho
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

const newDirectionalLight = () => {
  const directionalLight = new THREE.DirectionalLight(0xffffff)
  directionalLight.position.set(0, -0.1, 1).normalize()
  return directionalLight
}

const createMesh = (geometry, scene, scale) => {
  const diffuseMap = new THREE.TextureLoader().load('./textures/Map-COL.jpg')
  diffuseMap.encoding = THREE.sRGBEncoding
  const mat2 = new THREE.MeshPhongMaterial({
    color: 0x999999,
    specular: 0x080808,
    shininess: 20,
    map: diffuseMap,
    normalMap: new THREE.TextureLoader().load('./textures/Infinite-Level_02_Disp_NoSmoothUV-4096.jpg'),
    normalScale: new THREE.Vector2(0.75, 0.75)
  })
  const mesh = new THREE.Mesh(geometry, mat2)
  mesh.position.set(0, -50, 0)
  mesh.scale.set(scale, scale, scale)
  scene.add(mesh)
  return mesh
}

const PostprocessingAdvancedScene = () => {
  const mount = createRef<HTMLInputElement>()
  const delta = 0.01
  useEffect(() => {
    const rtParameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      stencilBuffer: true
    }
    const rtWidth = window.innerWidth / 2
    const rtHeight = window.innerHeight / 2

    const renderer = newRenderer(mount)

    const perspectiveCamera = newCamera()
    const orthoCamera = newOrthoCamera()
    const sceneModel = newScene()
    const sceneBG = newScene()

    const directionalLight = newDirectionalLight()
    sceneModel.add(directionalLight)

    const loader = new GLTFLoader()
    let mesh: THREE.Mesh
    loader.load('./gltf/LeePerrySmith.glb', function (gltf) {
      mesh = createMesh(gltf.scene.children[0].geometry, sceneModel, 100)
    })

    const diffuseMap = new THREE.TextureLoader().load('./textures/pz.jpg')
    diffuseMap.encoding = THREE.sRGBEncoding

    const materialColor = new THREE.MeshBasicMaterial({
      map: diffuseMap,
      depthTest: false
    })

    const quadBG = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), materialColor)
    quadBG.position.z = -500
    quadBG.scale.set(window.innerWidth, window.innerHeight, 1)
    sceneBG.add(quadBG)

    const sceneMask = new THREE.Scene()
    const quadMask = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffaa00 }))
    quadMask.position.z = -300
    quadMask.scale.set(window.innerWidth / 2, window.innerHeight / 2, 1)
    sceneMask.add(quadMask)

    const shaderBleach = BleachBypassShader
    const shaderSepia = SepiaShader
    const shaderVignette = VignetteShader
    const effectBleach = new ShaderPass(shaderBleach)
    const effectSepia = new ShaderPass(shaderSepia)
    const effectVignette = new ShaderPass(shaderVignette)
    const gammaCorrection = new ShaderPass(GammaCorrectionShader)

    const effectBloom = new BloomPass(0.5)
    const effectFilm = new FilmPass(0.35, 0.025, 648, 0)
    const effectFilmBW = new FilmPass(0.35, 0.5, 2048, 1)
    const effectDotScreen = new DotScreenPass(new THREE.Vector2(0, 0), 0.5, 0.8)
    effectBleach.uniforms.opacity.value = 0.95

    effectSepia.uniforms.amount.value = 0.9

    effectVignette.uniforms.offset.value = 0.95
    effectVignette.uniforms.darkness.value = 1.6

    const effectHBlur = new ShaderPass(HorizontalBlurShader)
    const effectVBlur = new ShaderPass(VerticalBlurShader)
    effectHBlur.uniforms.h.value = 2 / (window.innerWidth / 2)
    effectVBlur.uniforms.v.value = 2 / (window.innerHeight / 2)

    const effectColorify1 = new ShaderPass(ColorifyShader)
    const effectColorify2 = new ShaderPass(ColorifyShader)
    effectColorify1.uniforms.color = new THREE.Uniform(new THREE.Color(1, 0.8, 0.8))
    effectColorify2.uniforms.color = new THREE.Uniform(new THREE.Color(1, 0.75, 0.5))

    const clearMask = new ClearMaskPass()
    const renderMask = new MaskPass(sceneModel, perspectiveCamera)
    const renderMaskInverse = new MaskPass(sceneModel, perspectiveCamera)

    renderMaskInverse.inverse = true

    const renderBackground = new RenderPass(sceneBG, orthoCamera)
    const renderModel = new RenderPass(sceneModel, perspectiveCamera)
    const composerScene = new EffectComposer(renderer, new THREE.WebGLRenderTarget(rtWidth * 2, rtHeight * 2, rtParameters))

    composerScene.addPass(renderBackground)
    composerScene.addPass(renderModel)
    composerScene.addPass(renderMaskInverse)
    composerScene.addPass(effectHBlur)
    composerScene.addPass(effectVBlur)
    composerScene.addPass(clearMask)

    const renderScene = new TexturePass(composerScene.renderTarget2.texture)
    const composer1 = new EffectComposer(renderer, new THREE.WebGLRenderTarget(rtWidth, rtHeight, rtParameters))
    composer1.addPass(renderScene)
    composer1.addPass(gammaCorrection)
    composer1.addPass(effectFilmBW)
    composer1.addPass(effectVignette)

    const composer2 = new EffectComposer(renderer, new THREE.WebGLRenderTarget(rtWidth, rtHeight, rtParameters))
    composer2.addPass(renderScene)
    composer2.addPass(gammaCorrection)
    composer2.addPass(effectDotScreen)
    composer2.addPass(renderMask)
    composer2.addPass(effectColorify1)
    composer2.addPass(clearMask)
    composer2.addPass(renderMaskInverse)
    composer2.addPass(effectColorify2)
    composer2.addPass(clearMask)
    composer2.addPass(effectVignette)
    const composer3 = new EffectComposer(renderer, new THREE.WebGLRenderTarget(rtWidth, rtHeight, rtParameters))
    composer3.addPass(renderScene)
    composer3.addPass(gammaCorrection)
    // composer3.addPass( renderMask );
    composer3.addPass(effectSepia)
    composer3.addPass(effectFilm)
    // composer3.addPass( clearMask );
    composer3.addPass(effectVignette)
    const composer4 = new EffectComposer(renderer, new THREE.WebGLRenderTarget(rtWidth, rtHeight, rtParameters))

    const render = () => {
      const time = Date.now() * 0.0004

      if (mesh) mesh.rotation.y = -time
      renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight / 2)
      composer1.render(delta)

      renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight / 2)
      composer2.render(delta)

      renderer.setViewport(0, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2)
      composer3.render(delta)

      renderer.setViewport(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2)
      composer4.render(delta)
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default PostprocessingAdvancedScene
