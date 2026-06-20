import type { Particle, IParticleInitializer } from '../../types'

export abstract class ParticleInitializerBase implements IParticleInitializer {
  abstract readonly name: string

  abstract generate(count: number, width: number, height: number): Particle[]

  protected createParticle(x: number, y: number, vx = 0, vy = 0): Particle {
    return { x, y, vx, vy, density: 0, pressure: 0, fx: 0, fy: 0 }
  }
}
