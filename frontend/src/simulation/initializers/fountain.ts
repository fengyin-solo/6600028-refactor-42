import { ParticleInitializerBase } from './base'

export class FountainInitializer extends ParticleInitializerBase {
  readonly name = 'fountain'

  generate(count: number, width: number, height: number) {
    const particles: ReturnType<typeof this.createParticle>[] = []
    const cx = width / 2

    for (let i = 0; i < count; i++) {
      const spread = 30
      const p = this.createParticle(
        cx + (Math.random() - 0.5) * spread,
        height - 20 - Math.random() * 30
      )
      p.vy = -80 - Math.random() * 60
      p.vx = (Math.random() - 0.5) * 40
      particles.push(p)
    }

    return particles
  }
}
