import React, { useEffect, createRef } from 'react'
import { css } from '@emotion/core'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Particle from './cloth/Particle'
import Cloth from './cloth/Cloth'

const createDefaultCamera = () => {
  const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.set(1000, 50, 1500)
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

const AnimationClothScene = () => {
  const mount = createRef<HTMLInputElement>()
  useEffect(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xcce0ff)
    scene.fog = new THREE.Fog(0xcce0ff, 500, 10000)
    const camera = createDefaultCamera()
    const renderer = createDefaultRenderer(mount)

    scene.add(new THREE.AmbientLight(0x666666))
    const light = new THREE.DirectionalLight(0xdfebff, 1)
    light.position.set(50, 200, 100)
    light.position.multiplyScalar(1.3)
    light.castShadow = true
    light.shadow.mapSize.width = 1024
    light.shadow.mapSize.height = 1024
    const d = 300
    light.shadow.camera.left = -d
    light.shadow.camera.right = d
    light.shadow.camera.top = d
    light.shadow.camera.bottom = -d
    light.shadow.camera.far = 1000
    scene.add(light)

    // cloth material

    const loader = new THREE.TextureLoader()
    const clothTexture = loader.load('./textures/circuit_pattern.png')
    clothTexture.anisotropy = 16

    const clothMaterial = new THREE.MeshLambertMaterial({
      map: clothTexture,
      side: THREE.DoubleSide,
      alphaTest: 0.5
    })

    // cloth geometry

    const DAMPING = 0.03
    const DRAG = 1 - DAMPING
    const MASS = 0.1
    const restDistance = 25

    const xSegs = 10
    const ySegs = 10

    const plane = (width: number, height: number) => {
      return (u: number, v: number, target) => {
        const x = (u - 0.5) * width
        const y = (v + 0.5) * height
        const z = 0
        target.set(x, y, z)
      }
    }
    const clothFunction = plane(restDistance * xSegs, restDistance * ySegs)
    const cloth = new Cloth(xSegs, ySegs, clothFunction)
    const clothGeometry = new THREE.ParametricBufferGeometry(clothFunction, cloth.w, cloth.h)

    // cloth mesh

    const object = new THREE.Mesh(clothGeometry, clothMaterial)
    object.position.set(0, 0, 0)
    object.castShadow = true
    scene.add(object)
    object.customDepthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      map: clothTexture,
      alphaTest: 0.5
    })

    // sphere

    const ballPosition = new THREE.Vector3(0, -45, 0)
    const ballSize = 60 // 40
    const ballGeo = new THREE.SphereBufferGeometry(ballSize, 32, 16)
    const ballMaterial = new THREE.MeshLambertMaterial()
    const sphere = new THREE.Mesh(ballGeo, ballMaterial)
    sphere.castShadow = true
    sphere.receiveShadow = true
    sphere.visible = false
    scene.add(sphere)

    // ground

    const groundTexture = loader.load('./textures/grasslight-big.jpg')
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping
    groundTexture.repeat.set(25, 25)
    groundTexture.anisotropy = 16
    groundTexture.encoding = THREE.sRGBEncoding
    const groundMaterial = new THREE.MeshLambertMaterial({ map: groundTexture })
    const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000), groundMaterial)
    mesh.position.y = -250
    mesh.rotation.x = -Math.PI / 2
    mesh.receiveShadow = true
    scene.add(mesh)

    // poles

    const poleGeo = new THREE.BoxBufferGeometry(5, 375, 5)
    const poleMat = new THREE.MeshLambertMaterial()
    const pole1 = new THREE.Mesh(poleGeo, poleMat)
    pole1.position.x = -125
    pole1.position.y = -62
    pole1.receiveShadow = true
    pole1.castShadow = true
    scene.add(pole1)

    const pole2 = new THREE.Mesh(poleGeo, poleMat)
    pole2.position.x = 125
    pole2.position.y = -62
    pole2.receiveShadow = true
    pole2.castShadow = true
    scene.add(pole2)

    const pole3 = new THREE.Mesh(new THREE.BoxBufferGeometry(255, 5, 5), poleMat)
    pole3.position.y = -250 + 750 / 2
    pole3.position.x = 0
    pole3.receiveShadow = true
    pole3.castShadow = true
    scene.add(pole3)

    const gg = new THREE.BoxBufferGeometry(10, 10, 10)
    const pole4 = new THREE.Mesh(gg, poleMat)
    pole4.position.y = -250
    pole4.position.x = 125
    pole4.receiveShadow = true
    pole4.castShadow = true
    scene.add(pole4)

    const pole5 = new THREE.Mesh(gg, poleMat)
    pole5.position.y = -250
    pole5.position.x = -125
    pole5.receiveShadow = true
    pole5.castShadow = true
    scene.add(pole5)

    /* testing cloth simulation */

    const pinsFormation = []
    let pins = [6]

    pinsFormation.push(pins)

    pins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    pinsFormation.push(pins)

    pins = [0]
    pinsFormation.push(pins)

    pins = [] // cut the rope ;)
    pinsFormation.push(pins)

    pins = [0, cloth.w] // classic 2 pins
    pinsFormation.push(pins)

    pins = pinsFormation[1]

    const togglePins = () => {
      pins = pinsFormation[~~(Math.random() * pinsFormation.length)]
    }

    const params = {
      enableWind: true,
      showBall: false,
      tooglePins: togglePins
    }

    const GRAVITY = 981 * 1.4
    const gravity = new THREE.Vector3(0, -GRAVITY, 0).multiplyScalar(MASS)

    const TIMESTEP = 18 / 1000
    const TIMESTEP_SQ = TIMESTEP * TIMESTEP

    const windForce = new THREE.Vector3(0, 0, 0)

    const tmpForce = new THREE.Vector3()

    let lastTime

    const diff = new THREE.Vector3()

    function satisfyConstraints(p1, p2, distance) {
      diff.subVectors(p2.position, p1.position)
      const currentDist = diff.length()
      if (currentDist === 0) return // prevents division by 0
      const correction = diff.multiplyScalar(1 - distance / currentDist)
      const correctionHalf = correction.multiplyScalar(0.5)
      p1.position.add(correctionHalf)
      p2.position.sub(correctionHalf)
    }

    const simulate = time => {
      if (!lastTime) {
        lastTime = time
      }
      let i
      let j
      let il
      let particles
      let particle
      let constraint
      // Aerodynamics forces
      if (params.enableWind) {
        let indx
        const normal = new THREE.Vector3()
        const indices = clothGeometry.index
        const normals = clothGeometry.attributes.normal
        particles = cloth.particles
        for (i = 0, il = indices.count; i < il; i += 3) {
          for (j = 0; j < 3; j++) {
            indx = indices.getX(i + j)
            normal.fromBufferAttribute(normals, indx)
            tmpForce
              .copy(normal)
              .normalize()
              .multiplyScalar(normal.dot(windForce))
            particles[indx].addForce(tmpForce)
          }
        }
      }
      for (particles = cloth.particles, i = 0, il = particles.length; i < il; i++) {
        particle = particles[i]
        particle.addForce(gravity)
        particle.integrate(TIMESTEP_SQ)
      }
      // Start Constraints
      const { constraints } = cloth
      il = constraints.length
      for (i = 0; i < il; i++) {
        constraint = constraints[i]
        satisfyConstraints(constraint[0], constraint[1], constraint[2])
      }
      // Ball Constraints
      ballPosition.z = -Math.sin(Date.now() / 600) * 90 // + 40;
      ballPosition.x = Math.cos(Date.now() / 400) * 70
      let pos
      if (params.showBall) {
        sphere.visible = true
        for (particles = cloth.particles, i = 0, il = particles.length; i < il; i++) {
          particle = particles[i]
          pos = particle.position
          diff.subVectors(pos, ballPosition)
          if (diff.length() < ballSize) {
            // collided
            diff.normalize().multiplyScalar(ballSize)
            pos.copy(ballPosition).add(diff)
          }
        }
      } else {
        sphere.visible = false
      }
      // Floor Constraints
      for (particles = cloth.particles, i = 0, il = particles.length; i < il; i++) {
        particle = particles[i]
        pos = particle.position
        if (pos.y < -250) {
          pos.y = -250
        }
      }
      // Pin Constraints
      for (i = 0, il = pins.length; i < il; i++) {
        const xy = pins[i]
        const p = particles[xy]
        p.position.copy(p.original)
        p.previous.copy(p.original)
      }
    }

    // controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.maxPolarAngle = Math.PI * 0.5
    controls.minDistance = 1000
    controls.maxDistance = 5000

    // performance monitor

    const stats = Stats()
    const render = () => {
      const p = cloth.particles

      for (let i = 0, il = p.length; i < il; i++) {
        const v = p[i].position

        clothGeometry.attributes.position.setXYZ(i, v.x, v.y, v.z)
      }

      clothGeometry.attributes.position.needsUpdate = true

      clothGeometry.computeVertexNormals()

      sphere.position.copy(ballPosition)

      renderer.render(scene, camera)
    }
    const animate = () => {
      requestAnimationFrame(animate)

      const time = Date.now()

      const windStrength = Math.cos(time / 7000) * 20 + 40

      windForce.set(Math.sin(time / 2000), Math.cos(time / 3000), Math.sin(time / 1000))
      windForce.normalize()
      windForce.multiplyScalar(windStrength)

      simulate(time)
      render()
      stats.update()
    }
    animate()
  }, [])
  return <div css={css``} ref={mount} />
}
export default AnimationClothScene
