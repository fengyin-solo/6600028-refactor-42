import type { Particle, IParticleRenderer, RenderStats } from '../types'

function velocityToColor(speed: number): string {
  const maxSpeed = 200
  const t = Math.min(speed / maxSpeed, 1)
  const hue = (1 - t) * 240
  const sat = 80
  const light = 40 + t * 20
  return `hsl(${hue}, ${sat}%, ${light}%)`
}

export class DefaultParticleRenderer implements IParticleRenderer {
  readonly name = 'default'

  private width: number
  private height: number
  private showGrid: boolean
  private showHeatmap: boolean
  private particleRadius: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.showGrid = true
    this.showHeatmap = true
    this.particleRadius = 4
  }

  setSize(width: number, height: number) {
    this.width = width
    this.height = height
  }

  render(ctx: CanvasRenderingContext2D, particles: Particle[], stats: RenderStats) {
    this.clear(ctx)
    this.drawBoundary(ctx)
    if (this.showGrid) {
      this.drawGrid(ctx)
    }
    if (this.showHeatmap && particles.length > 0) {
      this.drawDensityHeatmap(ctx, particles)
    }
    this.drawParticles(ctx, particles)
    this.drawStats(ctx, stats)
  }

  private clear(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#0c1222'
    ctx.fillRect(0, 0, this.width, this.height)
  }

  private drawBoundary(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 3
    ctx.strokeRect(2, 2, this.width - 4, this.height - 4)
  }

  private drawGrid(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 0.3
    for (let x = 0; x < this.width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, this.height)
      ctx.stroke()
    }
    for (let y = 0; y < this.height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(this.width, y)
      ctx.stroke()
    }
  }

  private drawDensityHeatmap(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    const gridSize = 20
    const gw = Math.ceil(this.width / gridSize)
    const gh = Math.ceil(this.height / gridSize)
    const densityGrid = new Float32Array(gw * gh)

    for (const p of particles) {
      const gx = Math.floor(p.x / gridSize)
      const gy = Math.floor(p.y / gridSize)
      if (gx >= 0 && gx < gw && gy >= 0 && gy < gh) {
        densityGrid[gy * gw + gx] += p.density
      }
    }

    const maxDens = Math.max(...densityGrid, 1)
    for (let gy = 0; gy < gh; gy++) {
      for (let gx = 0; gx < gw; gx++) {
        const d = densityGrid[gy * gw + gx]
        if (d > 0) {
          const alpha = Math.min(d / maxDens * 0.15, 0.15)
          ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`
          ctx.fillRect(gx * gridSize, gy * gridSize, gridSize, gridSize)
        }
      }
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    for (const p of particles) {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      const color = velocityToColor(speed)
      const radius = this.particleRadius

      ctx.beginPath()
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    }
  }

  private drawStats(ctx: CanvasRenderingContext2D, stats: RenderStats) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(this.width - 80, 5, 75, 22)
    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 12px monospace'
    ctx.fillText(`FPS: ${stats.fps}`, this.width - 74, 20)

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(this.width - 120, 30, 115, 22)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '11px monospace'
    ctx.fillText(`Frame: ${stats.frameCount}`, this.width - 114, 44)
  }
}
