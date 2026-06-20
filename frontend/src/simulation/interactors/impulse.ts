import type { Particle, IInteractor, SimParams } from '../../types'

export class ImpulseInteractor implements IInteractor {
  readonly name = 'impulse'

  private radius: number
  private strength: number

  constructor(radius = 80, strength = 300) {
    this.radius = radius
    this.strength = strength
  }

  apply(particles: Particle[], x: number, y: number, _params: SimParams) {
    const radius = this.radius
    const strength = this.strength

    for (const p of particles) {
      const dx = p.x - x
      const dy = p.y - y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < radius && dist > 0.1) {
        const factor = strength * (1 - dist / radius)
        p.vx += (dx / dist) * factor
        p.vy += (dy / dist) * factor
      }
    }
  }
}
