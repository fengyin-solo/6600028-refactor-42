import type { Particle, SimParams, IParticleInitializer, IInteractor } from '../types'
import { DEFAULT_PARAMS } from '../config/presets'
import { getInitializer } from './initializers'
import { getInteractor } from './interactors'

const PI = Math.PI

function poly6(r: number, h: number): number {
  if (r >= h) return 0
  const h2 = h * h
  const r2 = r * r
  const coeff = 315 / (64 * PI * Math.pow(h, 9))
  return coeff * Math.pow(h2 - r2, 3)
}

function spikyGrad(r: number, h: number): number {
  if (r >= h || r < 1e-6) return 0
  const coeff = -45 / (PI * Math.pow(h, 6))
  return coeff * Math.pow(h - r, 2)
}

function viscosityLaplacian(r: number, h: number): number {
  if (r >= h) return 0
  const coeff = 45 / (PI * Math.pow(h, 6))
  return coeff * (h - r)
}

export class SPHEngine {
  particles: Particle[] = []
  params: SimParams
  width: number
  height: number
  private grid: Map<number, number[]> = new Map()
  private cellSize: number = 0
  private initializer: IParticleInitializer
  private interactor: IInteractor

  constructor(
    count: number,
    width: number,
    height: number,
    params?: Partial<SimParams>,
    initializerName?: string,
    interactorName?: string
  ) {
    this.width = width
    this.height = height
    this.params = { ...DEFAULT_PARAMS, ...params }
    this.cellSize = this.params.smoothingRadius
    this.initializer = getInitializer(initializerName || 'dam')
    this.interactor = getInteractor(interactorName || 'impulse')
    this.initParticles(count)
  }

  setInitializer(name: string) {
    this.initializer = getInitializer(name)
  }

  setInteractor(name: string) {
    this.interactor = getInteractor(name)
  }

  initParticles(count?: number) {
    const n = count ?? (this.particles.length || 800)
    this.particles = this.initializer.generate(n, this.width, this.height)
  }

  private buildGrid() {
    this.grid.clear()
    this.cellSize = this.params.smoothingRadius
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]
      const cx = Math.floor(p.x / this.cellSize)
      const cy = Math.floor(p.y / this.cellSize)
      const key = cx * 10000 + cy
      const cell = this.grid.get(key)
      if (cell) {
        cell.push(i)
      } else {
        this.grid.set(key, [i])
      }
    }
  }

  private getNeighbors(px: number, py: number): number[] {
    const result: number[] = []
    const cx = Math.floor(px / this.cellSize)
    const cy = Math.floor(py / this.cellSize)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = (cx + dx) * 10000 + (cy + dy)
        const cell = this.grid.get(key)
        if (cell) {
          for (const idx of cell) {
            result.push(idx)
          }
        }
      }
    }
    return result
  }

  step() {
    const { gravity, viscosity, restDensity, gasConstant, smoothingRadius, particleMass, dt, damping } = this.params
    const h = smoothingRadius
    const m = particleMass
    const n = this.particles.length

    this.buildGrid()

    for (let i = 0; i < n; i++) {
      const pi = this.particles[i]
      let density = 0
      const neighbors = this.getNeighbors(pi.x, pi.y)
      for (const j of neighbors) {
        const pj = this.particles[j]
        const dx = pi.x - pj.x
        const dy = pi.y - pj.y
        const r = Math.sqrt(dx * dx + dy * dy)
        density += m * poly6(r, h)
      }
      pi.density = Math.max(density, restDensity * 0.1)
      pi.pressure = gasConstant * (pi.density - restDensity)
    }

    for (let i = 0; i < n; i++) {
      const pi = this.particles[i]
      let fpx = 0, fpy = 0
      let fvx = 0, fvy = 0

      const neighbors = this.getNeighbors(pi.x, pi.y)
      for (const j of neighbors) {
        if (i === j) continue
        const pj = this.particles[j]
        const dx = pi.x - pj.x
        const dy = pi.y - pj.y
        const r = Math.sqrt(dx * dx + dy * dy)
        if (r < 1e-6 || r >= h) continue

        const nx = dx / r
        const ny = dy / r

        const pressureForce = -m * (pi.pressure + pj.pressure) / (2 * pj.density) * spikyGrad(r, h)
        fpx += pressureForce * nx
        fpy += pressureForce * ny

        const viscForce = viscosity * m / pj.density * viscosityLaplacian(r, h)
        fvx += viscForce * (pj.vx - pi.vx)
        fvy += viscForce * (pj.vy - pi.vy)
      }

      pi.fx = fpx + fvx
      pi.fy = fpy + fvy + pi.density * gravity * 10
    }

    for (let i = 0; i < n; i++) {
      const p = this.particles[i]
      const ax = p.fx / p.density
      const ay = p.fy / p.density
      p.vx += ax * dt
      p.vy += ay * dt
      p.x += p.vx * dt
      p.y += p.vy * dt

      const margin = 5
      if (p.x < margin) {
        p.x = margin
        p.vx = Math.abs(p.vx) * damping
      }
      if (p.x > this.width - margin) {
        p.x = this.width - margin
        p.vx = -Math.abs(p.vx) * damping
      }
      if (p.y < margin) {
        p.y = margin
        p.vy = Math.abs(p.vy) * damping
      }
      if (p.y > this.height - margin) {
        p.y = this.height - margin
        p.vy = -Math.abs(p.vy) * damping
      }
    }
  }

  applyInteraction(x: number, y: number) {
    this.interactor.apply(this.particles, x, y, this.params)
  }

  applyImpulse(x: number, y: number, strength: number) {
    const radius = 80
    for (const p of this.particles) {
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
