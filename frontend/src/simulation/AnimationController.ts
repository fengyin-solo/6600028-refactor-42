import type { SPHEngine } from '../simulation/SPHEngine'

export interface AnimationControllerOptions {
  subSteps?: number
  onFrame?: (frameCount: number) => void
}

export class AnimationController {
  private engine: SPHEngine | null = null
  private isRunning = false
  private animId: number | null = null
  private lastTime = 0
  private fpsAccum = 0
  private fpsFrames = 0
  private _fps = 0
  private _frameCount = 0
  private subSteps: number
  private onFrame?: (frameCount: number) => void

  constructor(options: AnimationControllerOptions = {}) {
    this.subSteps = options.subSteps ?? 3
    this.onFrame = options.onFrame
  }

  setEngine(engine: SPHEngine) {
    this.engine = engine
  }

  setSubSteps(subSteps: number) {
    this.subSteps = subSteps
  }

  get fps() {
    return this._fps
  }

  get frameCount() {
    return this._frameCount
  }

  get running() {
    return this.isRunning
  }

  start() {
    if (this.isRunning || !this.engine) return
    this.isRunning = true
    this.lastTime = performance.now()
    this.fpsAccum = 0
    this.fpsFrames = 0

    const loop = (now: number) => {
      if (!this.isRunning || !this.engine) return
      const elapsed = now - this.lastTime
      this.lastTime = now
      this.fpsAccum += elapsed
      this.fpsFrames++
      if (this.fpsAccum >= 500) {
        this._fps = Math.round(this.fpsFrames / (this.fpsAccum / 1000))
        this.fpsAccum = 0
        this.fpsFrames = 0
      }
      for (let s = 0; s < this.subSteps; s++) {
        this.engine.step()
      }
      this._frameCount++
      this.onFrame?.(this._frameCount)
      this.animId = requestAnimationFrame(loop)
    }
    this.animId = requestAnimationFrame(loop)
  }

  stop() {
    this.isRunning = false
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId)
      this.animId = null
    }
  }

  stepOnce() {
    if (!this.engine || this.isRunning) return
    for (let s = 0; s < this.subSteps; s++) {
      this.engine.step()
    }
    this._frameCount++
    this.onFrame?.(this._frameCount)
  }

  reset() {
    this.stop()
    this._frameCount = 0
    this._fps = 0
  }

  dispose() {
    this.stop()
    this.engine = null
    this.onFrame = undefined
  }
}
