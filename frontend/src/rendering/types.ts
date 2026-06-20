import type { Particle } from '../types'

export interface RenderStats {
  fps: number
  frameCount: number
}

export interface IParticleRenderer {
  readonly name: string
  render(ctx: CanvasRenderingContext2D, particles: Particle[], stats: RenderStats): void
}
