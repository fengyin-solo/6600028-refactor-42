import { ParticleInitializerBase } from './base'

export class DamInitializer extends ParticleInitializerBase {
  readonly name = 'dam'

  generate(count: number, width: number, height: number) {
    const particles: ReturnType<typeof this.createParticle>[] = []
    const spacing = 8
    const cols = Math.floor(width / 3 / spacing)
    const rows = Math.floor(height / spacing) - 2
    let placed = 0

    for (let j = 0; j < rows && placed < count; j++) {
      for (let i = 0; i < cols && placed < count; i++) {
        particles.push(this.createParticle(
          20 + i * spacing + (Math.random() - 0.5) * 2,
          10 + j * spacing + (Math.random() - 0.5) * 2
        ))
        placed++
      }
    }

    return particles
  }
}
