import { defineStore } from 'pinia'
import { SPHEngine } from '../simulation/SPHEngine'
import { AnimationController } from '../simulation/AnimationController'
import { DEFAULT_PARAMS, PRESETS } from '../config/presets'
import type { SimParams, Preset, Particle } from '../types'

export const useFluidStore = defineStore('fluid', {
  state: () => ({
    engine: null as SPHEngine | null,
    animController: null as AnimationController | null,
    isRunning: false,
    particleCount: 800,
    currentPreset: PRESETS[0],
    params: { ...DEFAULT_PARAMS } as SimParams,
    fps: 0,
    frameCount: 0,
    canvasSize: { width: 800, height: 500 },
  }),
  getters: {
    particleArray: (state): Particle[] => state.engine?.particles ?? [],
    avgDensity: (state): number => {
      if (!state.engine || state.engine.particles.length === 0) return 0
      const sum = state.engine.particles.reduce((s, p) => s + p.density, 0)
      return sum / state.engine.particles.length
    },
    maxVelocity: (state): number => {
      if (!state.engine || state.engine.particles.length === 0) return 0
      return Math.max(...state.engine.particles.map(p => Math.sqrt(p.vx * p.vx + p.vy * p.vy)))
    },
  },
  actions: {
    initSimulation(preset?: Preset) {
      if (preset) {
        this.currentPreset = preset
        this.params = { ...DEFAULT_PARAMS, ...preset.params }
        this.particleCount = preset.particleCount
      }

      const { width, height } = this.canvasSize
      const initializerName = this.currentPreset.initializer

      this.engine = new SPHEngine(
        this.particleCount,
        width,
        height,
        this.params,
        initializerName
      )

      this.animController = new AnimationController({
        subSteps: 3,
        onFrame: () => {
          this.fps = this.animController?.fps ?? 0
          this.frameCount = this.animController?.frameCount ?? 0
        },
      })
      this.animController.setEngine(this.engine)

      this.frameCount = 0
      this.fps = 0
    },
    start() {
      if (this.isRunning || !this.animController) return
      this.animController.start()
      this.isRunning = true
    },
    stop() {
      this.animController?.stop()
      this.isRunning = false
    },
    reset() {
      this.stop()
      this.initSimulation(this.currentPreset)
    },
    stepOnce() {
      if (!this.animController || this.isRunning) return
      this.animController.stepOnce()
    },
    updateParam(key: keyof SimParams, value: number) {
      this.params[key] = value
      if (this.engine) {
        this.engine.params[key] = value
      }
    },
    applyImpulse(x: number, y: number, strength: number) {
      if (!this.engine) return
      this.engine.applyImpulse(x, y, strength)
    },
    setCanvasSize(width: number, height: number) {
      this.canvasSize = { width, height }
    },
  },
})
