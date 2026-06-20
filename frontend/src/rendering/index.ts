import type { IParticleRenderer, RenderStats } from './types'
import { DefaultParticleRenderer } from './DefaultParticleRenderer'

const registry = new Map<string, IParticleRenderer>()

function register(renderer: IParticleRenderer) {
  registry.set(renderer.name, renderer)
}

export function createRenderer(name: string, width: number, height: number): IParticleRenderer {
  if (name === 'default') {
    return new DefaultParticleRenderer(width, height)
  }
  const renderer = registry.get(name)
  if (!renderer) {
    throw new Error(`Unknown renderer: ${name}`)
  }
  return renderer
}

export function registerRenderer(renderer: IParticleRenderer) {
  register(renderer)
}

export type { IParticleRenderer, RenderStats } from './types'
