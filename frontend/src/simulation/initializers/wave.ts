import { ParticleInitializerBase } from './base'

const PI = Math.PI

export class WaveInitializer extends ParticleInitializerBase {
  readonly name = 'wave'

  generate(count: number, width: number, height: number) {
    const particles: ReturnType<typeof this.createParticle>[] = []
    const spacing = 7
    const cols = Math.floor(width * 0.8 / spacing)
    const rows = Math.floor(count / cols)
    let placed = 0

    for (let i = 0; i < cols && placed < count; i++) {
      const waveHeight = 40 * Math.sin((i / cols) * 2 * PI)
      for (let j = 0; j < rows + 5 && placed < count; j++) {
        const x = width * 0.1 + i * spacing
        const y = height * 0.5 + waveHeight + j * spacing
        if (y < height - 5) {
          particles.push(this.createParticle(x, y))
          placed++
        }
      }
    }

    while (particles.length < count) {
      particles.push(this.createParticle(
        Math.random() * width * 0.8 + width * 0.1,
        Math.random() * height * 0.4 + height * 0.3
      ))
    }

    return particles
  }
}
