import Particle from './Particle'

const MASS = 0.1

export default class Cloth {
  w: number

  h: number

  particles: any

  constraints: any

  restDistance: number

  constructor(w, h, clothFunction) {
    this.restDistance = 25
    this.w = w || 10
    this.h = h || 10
    const particles = []
    const constraints = []

    let u
    let v

    // Create particles
    for (v = 0; v <= h; v++) {
      for (u = 0; u <= w; u++) {
        particles.push(new Particle(u / w, v / h, 0, MASS, clothFunction))
      }
    }

    // Structural

    for (v = 0; v < h; v++) {
      for (u = 0; u < w; u++) {
        constraints.push([particles[this.index(u, v)], particles[this.index(u, v + 1)], this.restDistance])

        constraints.push([particles[this.index(u, v)], particles[this.index(u + 1, v)], this.restDistance])
      }
    }
    for (u = w, v = 0; v < h; v++) {
      constraints.push([particles[this.index(u, v)], particles[this.index(u, v + 1)], this.restDistance])
    }

    for (v = h, u = 0; u < w; u++) {
      constraints.push([particles[this.index(u, v)], particles[this.index(u + 1, v)], this.restDistance])
    }
    this.particles = particles
    this.constraints = constraints
  }

  index(u, v): number {
    return u + v * (this.w + 1)
  }
}
