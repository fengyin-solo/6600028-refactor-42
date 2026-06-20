import type { IInteractor } from '../../types'
import { ImpulseInteractor } from './impulse'

const registry = new Map<string, IInteractor>()

function register(interactor: IInteractor) {
  registry.set(interactor.name, interactor)
}

register(new ImpulseInteractor())

export function getInteractor(name: string): IInteractor {
  const interactor = registry.get(name)
  if (!interactor) {
    throw new Error(`Unknown interactor: ${name}`)
  }
  return interactor
}

export function registerInteractor(interactor: IInteractor) {
  register(interactor)
}

export { registry as interactorRegistry }
