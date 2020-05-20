import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MD2Character } from 'three/examples/jsm/misc/MD2Character.js'

let gui
const playbackConfig = {
  speed: 1.0,
  wireframe: false
}
const clock = new THREE.Clock()

const newCamera = () => {
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(0, 150, 400)
  return camera
}

const newRenderer = (mount: React.RefObject<HTMLInputElement>) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.autoClear = true
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.shadowMap.enabled = true
  if (mount.current) {
    mount.current.appendChild(renderer.domElement)
  }
  return renderer
}

const newScene = () => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x050505)
  scene.fog = new THREE.Fog(0x050505, 400, 1000)
  return scene
}

const LoaderMd2Scene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = newScene()
    const camera = newCamera()
    const renderer = newRenderer(mount)
    scene.add(new THREE.AmbientLight(0x222222))

    const light1 = new THREE.SpotLight(0xffffff, 5, 1000)
    light1.position.set(200, 250, 500)
    light1.angle = 0.5
    light1.penumbra = 0.5
    light1.castShadow = true
    light1.shadow.mapSize.width = 1024
    light1.shadow.mapSize.height = 1024
    scene.add(light1)

    const light2 = new THREE.SpotLight(0xffffff, 5, 1000)
    light2.position.set(-100, 350, 350)
    light2.angle = 0.5
    light2.penumbra = 0.5
    light2.castShadow = true
    light2.shadow.mapSize.width = 1024
    light2.shadow.mapSize.height = 1024
    scene.add(light2)

    const gt = new THREE.TextureLoader().load('./textures/terrain/grasslight-big.jpg')
    const gg = new THREE.PlaneBufferGeometry(2000, 2000)
    const gm = new THREE.MeshPhongMaterial({ color: 0xffffff, map: gt })
    const ground = new THREE.Mesh(gg, gm)
    ground.rotation.x = -Math.PI / 2
    ground.material.map.repeat.set(8, 8)
    ground.material.map.wrapS = THREE.RepeatWrapping
    ground.material.map.wrapT = THREE.RepeatWrapping
    ground.material.map.encoding = THREE.sRGBEncoding
    ground.receiveShadow = true

    scene.add(ground)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 50, 0)
    controls.update()

    const config = {
      baseUrl: './models/md2/ratamahatta/',

      body: 'ratamahatta.md2',
      skins: ['ratamahatta.png', 'ctf_b.png', 'ctf_r.png', 'dead.png', 'gearwhore.png'],
      weapons: [
        ['weapon.md2', 'weapon.png'],
        ['w_bfg.md2', 'w_bfg.png'],
        ['w_blaster.md2', 'w_blaster.png'],
        ['w_chaingun.md2', 'w_chaingun.png'],
        ['w_glauncher.md2', 'w_glauncher.png'],
        ['w_hyperblaster.md2', 'w_hyperblaster.png'],
        ['w_machinegun.md2', 'w_machinegun.png'],
        ['w_railgun.md2', 'w_railgun.png'],
        ['w_rlauncher.md2', 'w_rlauncher.png'],
        ['w_shotgun.md2', 'w_shotgun.png'],
        ['w_sshotgun.md2', 'w_sshotgun.png']
      ]
    }

    const character = new MD2Character()
    character.scale = 3

    character.onLoadComplete = () => {
      //   setupSkinsGUI(character)
      //   setupWeaponsGUI(character)
      //   setupGUIAnimations(character)
      character.setAnimation(character.meshBody.geometry.animations[0].name)

      // TODO: cannot apply point cloud
      // const material = new THREE.PointsMaterial({ color: 0xfd3004, size: 0.25 })
      // const mesh = new THREE.Points(character.meshBody.geometry, material)
      // character.root = mesh
      // character.scale = 3
      // character.meshBody = mesh
      scene.add(character.root)
    }

    character.loadParts(config)

    const geometry = new THREE.TorusGeometry(100, 30, 160, 1000)
    const material = new THREE.PointsMaterial({ color: 0xfd1704, size: 0.25 })
    const mesh = new THREE.Points(geometry, material)
    mesh.rotateX(90)
    scene.add(mesh)

    const geometry2 = new THREE.TorusGeometry(100, 30, 160, 1000)
    const material2 = new THREE.PointsMaterial({ color: 0x0466fd, size: 0.25 })
    const mesh2 = new THREE.Points(geometry2, material2)
    mesh2.rotateX(90)
    scene.add(mesh2)

    const render = () => {
      const delta = clock.getDelta()
      mesh.rotation.z -= 0.05
      character.update(delta)
      renderer.render(scene, camera)
    }
    const animate = () => {
      requestAnimationFrame(animate)
      render()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default LoaderMd2Scene
