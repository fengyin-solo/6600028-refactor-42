export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  density: number;
  pressure: number;
  fx: number;
  fy: number;
}

export interface SimParams {
  gravity: number;
  viscosity: number;
  restDensity: number;
  gasConstant: number;
  smoothingRadius: number;
  particleMass: number;
  dt: number;
  damping: number;
  boundaryStiffness: number;
}

export interface IParticleInitializer {
  readonly name: string;
  generate(count: number, width: number, height: number): Particle[];
}

export interface IInteractor {
  readonly name: string;
  apply(particles: Particle[], x: number, y: number, params: SimParams): void;
}

export interface Preset {
  name: string;
  label: string;
  description: string;
  params: Partial<SimParams>;
  particleCount: number;
  initializer: string;
}
