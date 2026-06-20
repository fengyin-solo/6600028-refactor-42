import type { IParticleInitializer } from '../../types'
import { DamInitializer } from './dam'
import { DropInitializer } from './drop'
import { FountainInitializer } from './fountain'
import { WaveInitializer } from './wave'

const registry = new Map<string, IParticleInitializer>()

function register(initializer: IParticleInitializer) {
  registry.set(initializer.name, initializer)
}

register(new DamInitializer())
register(new DropInitializer())
register(new FountainInitializer())
register(new WaveInitializer())

export function getInitializer(name: string): IParticleInitializer {
  const initializer = registry.get(name)
  if (!initializer) {
    throw new Error(`Unknown particle initializer: ${name}`)
  }
  return initializer
}

export function registerInitializer(initializer: IParticleInitializer) {
  register(initializer)
}

export { registry as initializerRegistry }
