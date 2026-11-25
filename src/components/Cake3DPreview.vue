<template>
  <div class="relative w-full h-[360px] sm:h-[400px] rounded-2xl overflow-hidden border border-[#B88D91]/40 bg-gradient-to-b from-[#FFF9F5] via-[#F8F0E9] to-[#F2DFE4] shadow-inner select-none">
    <div ref="containerRef" class="w-full h-full cursor-grab active:cursor-grabbing"></div>

    <!-- Badges e botão topo (sem sobreposição) -->
    <div class="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-2 pointer-events-none">
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/90 text-[#8E5365] border border-[#B88D91]/40 shadow-xs whitespace-nowrap">
        {{ currentSize }} • {{ currentLine === 'premium' ? 'Premium' : 'Tradicional' }}
      </span>
      <button
        type="button"
        @click="toggleCutaway"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-xs font-semibold transition-all shadow-sm border whitespace-nowrap"
        :class="isCutawayOpen
          ? 'bg-[#8E5365] text-white border-[#8E5365]'
          : 'bg-white/95 text-[#6D4A4A] border-[#C98291]/60 hover:bg-[#C98291] hover:text-white'"
      >
        <span>{{ isCutawayOpen ? 'Fechar' : 'Ver dentro' }}</span>
      </button>
    </div>

    <!-- Legenda inferior -->
    <div class="absolute bottom-3 inset-x-3 z-10 flex items-center justify-center pointer-events-none">
      <span class="px-3 py-1 rounded-full text-[11px] font-medium text-[#6D4A4A] bg-white/90 border border-[#B88D91]/40 shadow-xs">
        Arraste 360° • 3 discos de massa + 2 camadas de recheio
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import {
  CAKE_SIZE_SCALES,
  CAKE_BATTERS,
  CAKE_FILLINGS,
  CAKE_FROSTINGS,
  resolveColorByName,
} from '@/config/cakeBuilderConfig'

const props = defineProps({
  size: { type: String, default: '' },
  tamanho: { type: String, default: '' },
  line: { type: String, default: '' },
  linha: { type: String, default: '' },
  batter: { type: Object, default: null },
  massa: { type: [Object, String], default: null },
  fillings: { type: Array, default: null },
  recheios: { type: Array, default: null },
  frosting: { type: Object, default: null },
  cobertura: { type: [Object, String], default: null },
  topperText: { type: String, default: '' },
  fraseTopo: { type: String, default: '' }
})

const currentSize = computed(() => props.size || props.tamanho || 'M')
const currentLine = computed(() => {
  const val = (props.line || props.linha || 'tradicional').toLowerCase()
  return val.includes('premium') ? 'premium' : 'tradicional'
})

const currentBatter = computed(() => {
  const b = props.batter || props.massa
  if (b && typeof b === 'object' && b.color) return b
  const name = (typeof b === 'string' ? b : b?.name || '').toLowerCase()
  const match = CAKE_BATTERS.find((bat) => bat.name.toLowerCase().includes(name) || bat.id === name)
  return match || CAKE_BATTERS[0]
})

const currentFrosting = computed(() => {
  const f = props.frosting || props.cobertura
  if (f && typeof f === 'object' && f.color) return f
  const name = (typeof f === 'string' ? f : f?.name || '').toLowerCase()
  const match = CAKE_FROSTINGS.find((fr) => fr.name.toLowerCase().includes(name) || fr.id === name)
  return match || CAKE_FROSTINGS[0]
})

const currentFillings = computed(() => {
  const list = (props.fillings || props.recheios || []).filter(Boolean)
  return list.map((item) => {
    if (typeof item === 'object' && item.color) return item
    const name = (typeof item === 'string' ? item : item?.name || '').toLowerCase()
    const match = CAKE_FILLINGS.find((fil) => fil.name.toLowerCase().includes(name) || fil.id === name)
    return match || CAKE_FILLINGS[0]
  })
})

const currentTopper = computed(() => props.topperText || props.fraseTopo || '')

const containerRef = ref(null)
const isCutawayOpen = ref(true)

let scene, camera, renderer, controls, resizeObserver, animationFrameId
let cakeRoot, frostingMesh, dripGroup, topperMesh
let batterMeshes = []
let fillingMeshes = []
let rosetteMeshes = []

function makeSpongeTextures(hexColor = '#F2D29B') {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = hexColor
  ctx.fillRect(0, 0, 256, 256)

  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * 256
    const y = Math.random() * 256
    const rx = 1 + Math.random() * 2.2
    const ry = 0.8 + Math.random() * 1.6
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fillStyle = i % 2 === 0 ? 'rgba(55, 30, 15, 0.18)' : 'rgba(255, 255, 255, 0.18)'
    ctx.fill()
  }

  const map = new THREE.CanvasTexture(canvas)
  map.wrapS = THREE.RepeatWrapping
  map.wrapT = THREE.RepeatWrapping
  map.repeat.set(3, 1)

  const bumpMap = new THREE.CanvasTexture(canvas)
  bumpMap.wrapS = THREE.RepeatWrapping
  bumpMap.wrapT = THREE.RepeatWrapping
  bumpMap.repeat.set(3, 1)

  return { map, bumpMap }
}

function makeTopperTexture(rawText) {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 384
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 768, 384)

  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.roundRect(36, 54, 696, 276, 84)
  ctx.fill()

  ctx.lineWidth = 12
  ctx.strokeStyle = '#C98291'
  ctx.stroke()

  const label = (rawText && rawText.trim()) ? rawText.trim() : 'Feito com carinho ♥'
  ctx.fillStyle = '#8E5365'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const fontSize = label.length > 30 ? 42 : label.length > 20 ? 54 : 60
  ctx.font = `italic bold ${fontSize}px "Playfair Display", Georgia, serif`
  ctx.fillText(label.slice(0, 44), 384, 192)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function buildCakeScene() {
  cakeRoot = new THREE.Group()
  scene.add(cakeRoot)

  // 1. BOLEIRA BRANCA PORCELANA COM FILETE ROSÉ (larga e elegante)
  const standMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.05
  })

  const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.82, 0.07, 48), standMat)
  baseMesh.position.y = 0.035
  cakeRoot.add(baseMesh)

  const stemMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.18, 32), standMat)
  stemMesh.position.y = 0.15
  cakeRoot.add(stemMesh)

  const plateMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.65, 0.06, 64), standMat)
  plateMesh.position.y = 0.27
  plateMesh.receiveShadow = true
  cakeRoot.add(plateMesh)

  const rimGeo = new THREE.TorusGeometry(1.73, 0.016, 12, 64)
  rimGeo.rotateX(Math.PI / 2)
  const rimMesh = new THREE.Mesh(rimGeo, new THREE.MeshStandardMaterial({ color: 0xc98291, roughness: 0.3 }))
  rimMesh.position.y = 0.30
  cakeRoot.add(rimMesh)

  // 2. MIOLO LARGO E PROPORCIONAL (3 DISCOS DE MASSA + 2 RECHEIOS = ALTURA 10 CM)
  const spongeTex = makeSpongeTextures(currentBatter.value.color)
  const spongeMat = new THREE.MeshStandardMaterial({
    map: spongeTex.map,
    bumpMap: spongeTex.bumpMap,
    bumpScale: 0.025,
    roughness: 0.85
  })

  const batterY = [0.43, 0.81, 1.19]
  batterMeshes = batterY.map((y) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.24, 1.24, 0.26, 48), spongeMat)
    mesh.position.y = y
    mesh.castShadow = true
    mesh.receiveShadow = true
    cakeRoot.add(mesh)
    return mesh
  })

  // Recheios: ocultar camadas quando não houver seleção
  fillingMeshes = []
  const fillingSpecs = [
    { y: 0.62, color: currentFillings.value[0]?.color || '#FFF5E1', active: currentFillings.value.length >= 1 },
    { y: 1.00, color: currentFillings.value[1]?.color || '#FFF5E1', active: currentFillings.value.length >= 2 },
  ]

  fillingSpecs.forEach((spec) => {
    const group = new THREE.Group()
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.color),
      roughness: 0.3
    })
    const core = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.12, 48), mat)
    const bulgeGeo = new THREE.TorusGeometry(1.21, 0.055, 16, 48)
    bulgeGeo.rotateX(Math.PI / 2)
    const bulge = new THREE.Mesh(bulgeGeo, mat)
    group.add(core, bulge)
    group.position.y = spec.y
    group.visible = spec.active
    cakeRoot.add(group)
    fillingMeshes.push({ group, mat, active: spec.active })
  })

  // 3. COBERTURA EXTERNA (TRANSLÚCIDA POR PADRÃO PARA MOSTRAR AS CAMADAS)
  const frostingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(currentFrosting.value.color),
    roughness: 0.5,
    transparent: true,
    opacity: isCutawayOpen.value ? 0.24 : 1.0,
    depthWrite: false
  })

  frostingMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.30, 1.30, 1.04, 64), frostingMat)
  frostingMesh.position.y = 0.82
  cakeRoot.add(frostingMesh)

  // 4. CALDA NO TOPO + DRIP CAKE (20 GOTAS)
  dripGroup = new THREE.Group()
  const dripColor = currentLine.value === 'premium' ? '#8E5365' : '#C98291'
  const dripMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(dripColor),
    roughness: 0.2
  })

  const topCap = new THREE.Mesh(new THREE.CylinderGeometry(1.305, 1.305, 0.025, 64), dripMat)
  topCap.position.y = 1.345
  dripGroup.add(topCap)

  for (let i = 0; i < 20; i++) {
    const theta = (i / 20) * Math.PI * 2
    const dropH = 0.14 + ((i * 7) % 4) * 0.06
    const x = Math.cos(theta) * 1.30
    const z = Math.sin(theta) * 1.30

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.024, dropH, 12), dripMat)
    stem.position.set(x, 1.34 - dropH / 2, z)
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), dripMat)
    tip.position.set(x, 1.34 - dropH, z)
    dripGroup.add(stem, tip)
  }
  cakeRoot.add(dripGroup)

  // 5. COROA DE 12 PITANGAS + 6 MORANGOS NO TOPO
  const rosetteMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(currentFrosting.value.color),
    roughness: 0.45
  })
  const berryMat = new THREE.MeshStandardMaterial({
    color: 0xc82341,
    roughness: 0.25
  })

  rosetteMeshes = []
  for (let i = 0; i < 12; i++) {
    const theta = (i / 12) * Math.PI * 2
    const rosette = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.15, 16), rosetteMat)
    rosette.position.set(Math.cos(theta) * 1.06, 1.42, Math.sin(theta) * 1.06)
    cakeRoot.add(rosette)
    rosetteMeshes.push(rosette)

    if (i % 2 === 0) {
      const berry = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.15, 16), berryMat)
      berry.rotation.x = Math.PI
      berry.position.set(Math.cos(theta) * 0.80, 1.41, Math.sin(theta) * 0.80)
      cakeRoot.add(berry)
    }
  }

  // 6. TOPPER ACRÍLICO PERSONALIZADO NO CENTRO
  const stick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.42, 8),
    new THREE.MeshStandardMaterial({ color: 0xc98291 })
  )
  stick.position.set(0, 1.52, 0)
  cakeRoot.add(stick)

  topperMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.18, 0.52),
    new THREE.MeshBasicMaterial({
      map: makeTopperTexture(currentTopper.value),
      transparent: true,
      side: THREE.DoubleSide
    })
  )
  topperMesh.position.set(0, 1.82, 0)
  cakeRoot.add(topperMesh)

  const s = CAKE_SIZE_SCALES[currentSize.value] || 1.0
  cakeRoot.scale.set(s, 1.0, s)
}

function toggleCutaway() {
  isCutawayOpen.value = !isCutawayOpen.value
  if (!frostingMesh) return
  gsap.to(frostingMesh.material, {
    opacity: isCutawayOpen.value ? 0.24 : 1.0,
    duration: 0.4
  })
}

watch(currentSize, (newSize) => {
  if (!cakeRoot) return
  const s = CAKE_SIZE_SCALES[newSize] || 1.0
  gsap.to(cakeRoot.scale, { x: s, y: 1.0, z: s, duration: 0.55, ease: 'elastic.out(1, 0.7)' })
})

watch(currentBatter, (batter) => {
  if (!batterMeshes.length) return
  const tex = makeSpongeTextures(batter.color)
  batterMeshes.forEach((m) => {
    m.material.map = tex.map
    m.material.bumpMap = tex.bumpMap
    m.material.needsUpdate = true
  })
})

watch(currentFillings, ([c1, c2]) => {
  if (!fillingMeshes.length) return

  // Atualizar visibilidade das camadas de recheio
  const specs = [
    { active: currentFillings.value.length >= 1, color: c1?.color || '#FFF5E1' },
    { active: currentFillings.value.length >= 2, color: c2?.color || '#FFF5E1' },
  ]

  fillingMeshes.forEach((fm, i) => {
    fm.group.visible = specs[i].active
    if (specs[i].active) {
      gsap.to(fm.mat.color, { r: specs[i].color.r, g: specs[i].color.g, b: specs[i].color.b, duration: 0.35 })
    }
  })
})

watch(currentFrosting, (f) => {
  if (!frostingMesh) return
  const col = new THREE.Color(f.color)
  gsap.to(frostingMesh.material.color, { r: col.r, g: col.g, b: col.b, duration: 0.35 })
  rosetteMeshes.forEach((r) => {
    gsap.to(r.material.color, { r: col.r, g: col.g, b: col.b, duration: 0.35 })
  })
})

watch(currentLine, (line) => {
  if (!dripGroup) return
  const col = new THREE.Color(line === 'premium' ? '#8E5365' : '#C98291')
  dripGroup.children.forEach((child) => {
    if (child.material) gsap.to(child.material.color, { r: col.r, g: col.g, b: col.b, duration: 0.35 })
  })
})

watch(currentTopper, (txt) => {
  if (!topperMesh) return
  if (topperMesh.material.map) topperMesh.material.map.dispose()
  topperMesh.material.map = makeTopperTexture(txt)
  topperMesh.material.needsUpdate = true
})

onMounted(() => {
  const container = containerRef.value
  if (!container) return

  const width = container.clientWidth || 340
  const height = container.clientHeight || 380

  scene = new THREE.Scene()

  // Câmera afastada para enquadrar o bolo inteiro + topper
  camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50)
  camera.position.set(0, 4.1, 8.6)
  camera.lookAt(0, 0.95, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  container.appendChild(renderer.domElement)

  // Iluminação clara e quente de vitrine
  scene.add(new THREE.AmbientLight(0xfffaf5, 1.35))

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.45)
  keyLight.position.set(5, 8, 7)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0xffe6ec, 0.75)
  fillLight.position.set(-5, 4, 4)
  scene.add(fillLight)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = false
  controls.enablePan = false
  controls.minPolarAngle = 0.45
  controls.maxPolarAngle = 1.42
  controls.autoRotate = true
  controls.autoRotateSpeed = 1.3
  controls.target.set(0, 0.95, 0)

  buildCakeScene()

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const w = entry.contentRect.width
      const h = entry.contentRect.height
      if (w > 0 && h > 0) {
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
    }
  })
  resizeObserver.observe(container)
})

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (resizeObserver) resizeObserver.disconnect()
  if (controls) controls.dispose()
  if (renderer) renderer.dispose()
})
</script>
