// import React, { useEffect, createRef } from 'react'
// import { css } from '@emotion/core'
// import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import { NodeMaterialLoader } from 'three/examples/jsm/loaders/NodeMaterialLoader.js'
// import { TeapotBufferGeometry } from 'three/examples/jsm/geometries/TeapotBufferGeometry.js'
// import { NodeFrame } from 'three/examples/jsm/nodes/core/NodeFrame.js'
// import { NodeMaterial } from 'three/examples/jsm/nodes/materials/NodeMaterial.js'

// const fov = 50

// const newCamera = () => {
//   const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 1000)
//   camera.position.x = 50
//   camera.position.z = -50
//   camera.position.y = 30
//   camera.target = new THREE.Vector3()
//   return camera
// }

// const newRenderer = (mount: React.RefObject<HTMLInputElement>) => {
//   const renderer = new THREE.WebGLRenderer({ antialias: true })
//   renderer.setPixelRatio(window.devicePixelRatio)
//   renderer.setSize(window.innerWidth, window.innerHeight)
//   renderer.autoClear = true
//   if (mount.current) {
//     mount.current.appendChild(renderer.domElement)
//   }
//   return renderer
// }

// const newScene = () => {
//   const scene = new THREE.Scene()
//   return scene
// }

// const LoaderNodeScene = () => {
//   const mount = createRef<HTMLInputElement>()
//   const clock = new THREE.Clock()
//   const frame = new NodeFrame()
//   const param = { load: 'caustic' }
//   let gui
//   useEffect(() => {
//     const scene = newScene()
//     const camera = newCamera()
//     const renderer = newRenderer(mount)

//     const cloud = new THREE.TextureLoader().load('./textures/lava/cloud.png')
//     cloud.wrapS = THREE.RepeatWrapping
//     cloud.wrapT = THREE.RepeatWrapping

//     const controls = new OrbitControls(camera, renderer.domElement)
//     controls.minDistance = 50
//     controls.maxDistance = 200

//     scene.add(new THREE.AmbientLight(0x464646))
//     const light1 = new THREE.DirectionalLight(0xffddcc, 1)
//     light1.position.set(1, 0.75, 0.5)
//     scene.add(light1)

//     const light2 = new THREE.DirectionalLight(0xccccff, 1)
//     light2.position.set(-1, 0.75, -0.5)
//     scene.add(light2)

//     const teapot = new TeapotBufferGeometry(15, 18)
//     const mesh = new THREE.Mesh(teapot)
//     scene.add(mesh)

//     const clearGui = () => {
//       if (gui) gui.destroy()

//       gui = new GUI()

//       gui
//         .add(param, 'load', {
//           caustic: 'caustic',
//           displace: 'displace',
//           wave: 'wave',
//           xray: 'xray'
//         })
//         .onFinishChange(function () {
//           // updateMaterial()
//         })

//       gui.open()
//     }

//     const addGui = (name, value, callback, isColor, min, max) => {
//       let node
//       param[name] = value

//       if (isColor) {
//         node = gui.addColor(param, name).onChange(function () {
//           callback(param[name])
//         })
//       } else if (typeof value === 'object') {
//         node = gui.add(param, name, value).onChange(function () {
//           callback(param[name])
//         })
//       } else {
//         node = gui.add(param, name, min, max).onChange(function () {
//           callback(param[name])
//         })
//       }
//       return node
//     }

//     const updateMaterial = () => {
//       if (mesh.material) mesh.material.dispose()

//       clearGui()

//       const url = `./nodes/${param.load}.json`

//       const library = {
//         cloud
//       }

//       const loader = new NodeMaterialLoader(undefined, library).load(url, function () {
//         const time = loader.getObjectByName('time')

//         if (time) {
//           // enable time scale

//           time.timeScale = true

//           // gui

//           addGui(
//             'timeScale',
//             time.scale,
//             function (val) {
//               time.scale = val
//             },
//             false,
//             -2,
//             2
//           )
//         }

//         // set material
//         mesh.material = loader.material
//       })
//     }

//     updateMaterial()

//     const render = () => {
//       renderer.render(scene, camera)
//     }
//     const animate = () => {
//       const delta = clock.getDelta()

//       // update material animation and/or gpu calcs (pre-renderer)
//       if (mesh.material instanceof NodeMaterial) frame.update(delta).updateNode(mesh.material)

//       requestAnimationFrame(animate)
//       render()
//     }
//     animate()
//   }, [])
//   return <div css={css``} ref={mount} />
// }
// export default LoaderNodeScene
