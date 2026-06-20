import { ParticleInitializerBase } from './base'

const PI = Math.PI

export class DropInitializer extends ParticleInitializerBase {
  readonly name = 'drop'

  generate(count: number, width: number, height: number) {
    const particles: ReturnType<typeof this.createParticle>[] = []
    const cx = width / 2
    const cy = height * 0.25
    const radius = Math.sqrt(count) * 4
    let placed = 0

    for (let j = -radius; j < radius && placed < count; j += 6) {
      for (let i = -radius; i < radius && placed < count; i += 6) {
        if (i * i + j * j < radius * radius) {
          particles.push(this.createParticle(
            cx + i + (Math.random() - 0.5) * 2,
            cy + j + (Math.random() - 0.5) * 2
          ))
          placed++
        }
      }
    }

    while (particles.length < count) {
      const angle = Math.random() * 2 * PI
      const r = Math.sqrt(Math.random()) * radius
      particles.push(this.createParticle(
        cx + r * Math.cos(angle),
        cy + r * Math.sin(angle)
      ))
    }

    return particles
  }
}
