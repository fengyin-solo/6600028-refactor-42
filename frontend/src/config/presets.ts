import type { SimParams, Preset } from '../types'

export const DEFAULT_PARAMS: SimParams = {
  gravity: 9.8,
  viscosity: 1.0,
  restDensity: 1000,
  gasConstant: 2000,
  smoothingRadius: 16,
  particleMass: 2.5,
  dt: 0.004,
  damping: 0.5,
  boundaryStiffness: 10000,
}

export const PRESETS: Preset[] = [
  {
    name: 'dam',
    label: '溃坝模拟',
    description: '左侧水体突然释放，观察水流冲击和扩散',
    params: { gravity: 9.8, viscosity: 1.0, gasConstant: 2000, smoothingRadius: 16 },
    particleCount: 800,
    initializer: 'dam',
  },
  {
    name: 'drop',
    label: '水滴下落',
    description: '圆形水滴从高处自由落体，撞击底部表面',
    params: { gravity: 12.0, viscosity: 0.8, gasConstant: 1500, smoothingRadius: 14 },
    particleCount: 600,
    initializer: 'drop',
  },
  {
    name: 'fountain',
    label: '喷泉效果',
    description: '底部中心持续向上喷射粒子',
    params: { gravity: 8.0, viscosity: 1.2, gasConstant: 2500, smoothingRadius: 18 },
    particleCount: 1000,
    initializer: 'fountain',
  },
  {
    name: 'wave',
    label: '波浪运动',
    description: '正弦波初始分布，观察波浪传播和干涉',
    params: { gravity: 6.0, viscosity: 0.5, gasConstant: 1800, smoothingRadius: 15 },
    particleCount: 900,
    initializer: 'wave',
  },
]
