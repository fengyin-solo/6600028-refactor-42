<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useFluidStore } from '../store/fluid'
import { DefaultParticleRenderer } from '../rendering/DefaultParticleRenderer'

const store = useFluidStore()
const canvas = ref<HTMLCanvasElement | null>(null)

const W = 800
const H = 500

let renderer: DefaultParticleRenderer | null = null
let raf: number | null = null

function draw() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx || !renderer || !store.engine) return

  renderer.render(ctx, store.engine.particles, {
    fps: store.fps,
    frameCount: store.frameCount,
  })
}

function animate() {
  draw()
  raf = requestAnimationFrame(animate)
}

function onClick(e: MouseEvent) {
  if (!store.engine || !canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  const scaleX = W / rect.width
  const scaleY = H / rect.height
  const x = (e.clientX - rect.left) * scaleX
  const y = (e.clientY - rect.top) * scaleY
  store.applyImpulse(x, y, 300)
}

onMounted(() => {
  renderer = new DefaultParticleRenderer(W, H)
  store.setCanvasSize(W, H)
  if (!store.engine) {
    store.initSimulation()
  }
  animate()
})

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  renderer = null
})
</script>

<template>
  <div class="relative">
    <canvas
      ref="canvas"
      :width="W"
      :height="H"
      class="rounded-lg border border-gray-700 cursor-crosshair w-full max-w-[800px]"
      @click="onClick"
    />
  </div>
</template>
