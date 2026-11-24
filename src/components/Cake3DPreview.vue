<template>
  <div class="cake3d-preview w-full h-[340px] sm:h-[380px] md:h-[420px] rounded-2xl overflow-hidden bg-brand-creme border border-brand-mauve/20 shadow-sm relative">
    <div ref="containerRef" class="w-full h-full"></div>
    <div class="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-white/85 backdrop-blur-md border border-brand-mauve/20 px-3 py-2 rounded-lg shadow-sm">
      <svg class="w-4 h-4 text-brand-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span class="text-[10px] text-brand-cacau font-medium">Arraste para girar 360° &bull; 3 discos de massa + 2 recheios</span>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  tamanho: { type: Object, default: () => ({ label: 'M', serve: 'até 15 pessoas', precoMultiplicador: 1.4 }) },
  massa: { type: String, default: 'baunilha' },
  recheios: { type: Array, default: () => [] },
  cobertura: { type: String, default: 'chantininho' },
  fraseTopo: { type: String, default: '' },
  linha: { type: String, default: 'tradicional' },
})

const containerRef = ref(null)
let scene, camera, renderer, controls
let boloGrupo, camadasMassa, camadasRecheio, coberturaMesh
let isDragging = false
let targetRotation = 0
let currentRotation = 0

const CORES = {
  massa: { baunilha: '#F3DFC1', chocolate: '#4E3229', redvelvet: '#8E354A' },
  recheio: { brigadeiro: '#3B231C', ninho: '#FFF8EB', morango: '#C95B72', doce_leite: '#C68B59', maracuja: '#E8B948', pistache: '#7A4426' },
  cobertura: { chantininho: '#F8F0E9', chantininho_rose: '#C98291', berry: '#8E5365', ganache: '#4A2E2B', naked: '#FFFFFF' },
}

function init() {
  const container = containerRef.value
  if (!container) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#F8F0E9')
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(0, 3, 6)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = false
  controls.enablePan = false
  controls.autoRotate = false
  controls.minPolarAngle = Math.PI / 3.5
  controls.maxPolarAngle = Math.PI / 2.1
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambient)
  const luz1 = new THREE.DirectionalLight(0xfff0e0, 0.8)
  luz1.position.set(3, 5, 3)
  scene.add(luz1)
  const luz2 = new THREE.DirectionalLight(0xffd6ba, 0.5)
  luz2.position.set(-3, 2, -3)
  scene.add(luz2)
  const luz3 = new THREE.PointLight(0xffedd8, 0.4)
  luz3.position.set(0, 8, 0)
  scene.add(luz3)
  const pratoGeo = new THREE.CylinderGeometry(2.6, 2.8, 0.3, 32)
  const pratoMat = new THREE.MeshStandardMaterial({ color: '#F8F0E9', roughness: 0.8 })
  const prato = new THREE.Mesh(pratoGeo, pratoMat)
  prato.position.y = 0
  scene.add(prato)
  const bordaGeo = new THREE.TorusGeometry(2.8, 0.06, 16, 100)
  const bordaMat = new THREE.MeshStandardMaterial({ color: '#C98291', roughness: 0.4 })
  const borda = new THREE.Mesh(bordaGeo, bordaMat)
  borda.position.y = 0.16
  borda.rotation.x = Math.PI / 2
  scene.add(borda)
  boloGrupo = new THREE.Group()
  boloGrupo.position.y = 0.16
  scene.add(boloGrupo)
  camadasMassa = []
  camadasRecheio = []
  coberturaMesh = new THREE.Group()
  boloGrupo.add(coberturaMesh)
  criarBolo()
  animate()
}
function criarBolo() {
  camadasMassa.forEach((m) => boloGrupo.remove(m))
  camadasRecheio.forEach((r) => boloGrupo.remove(r))
  camadasMassa = []
  camadasRecheio = []
  while (coberturaMesh.children.length > 0) {
    coberturaMesh.remove(coberturaMesh.children[0])
  }
  const escala = props.tamanho?.precoMultiplicador || 1.4
  const raioBase = 1.1 * Math.sqrt(escala)
  const discoAltura = 0.55
  const recheioAltura = 0.25
  const corMassa = CORES.massa[props.massa] || '#F3DFC1'
  const corCobertura = CORES.cobertura[props.cobertura] || '#F8F0E9'
  const recheiosSelecionados = props.recheios || []
  let y = discoAltura / 2
  for (let i = 0; i < 3; i++) {
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(raioBase, raioBase, discoAltura, 32), new THREE.MeshStandardMaterial({ color: corMassa, roughness: 0.9 }))
    disco.position.y = y
    boloGrupo.add(disco)
    camadasMassa.push(disco)
    y += discoAltura
    if (i < 2) {
      const corRecheio = CORES.recheio[recheiosSelecionados[i]] || '#FFF8EB'
      const recheio = new THREE.Mesh(new THREE.CylinderGeometry(raioBase * 0.9, raioBase * 0.9, recheioAltura, 32), new THREE.MeshStandardMaterial({ color: corRecheio, roughness: 0.8 }))
      recheio.position.y = y + recheioAltura / 2
      boloGrupo.add(recheio)
      camadasRecheio.push(recheio)
      y += recheioAltura
    }
  }
  const ehNaked = props.cobertura === 'naked'
  const ehFechado = !ehNaked
  const topoGeo = new THREE.CylinderGeometry(raioBase * 1.05, raioBase * 1.05, 0.15, 32)
  const topoMat = new THREE.MeshStandardMaterial({ color: corCobertura, roughness: 0.6 })
  const topo = new THREE.Mesh(topoGeo, topoMat)
  topo.position.y = y + 0.075
  coberturaMesh.add(topo)
  if (ehFechado) {
    const alturaLateral = y - discoAltura / 2 + 0.15
    const lateralGeo = new THREE.CylinderGeometry(raioBase * 1.05, raioBase * 1.05, alturaLateral, 32)
    const lateralMat = new THREE.MeshStandardMaterial({ color: corCobertura, roughness: 0.6 })
    const lateral = new THREE.Mesh(lateralGeo, lateralMat)
    lateral.position.y = alturaLateral / 2
    coberturaMesh.add(lateral)
  }
  coberturaMesh.position.y = 0.16
  if (props.fraseTopo) {
    const coracaoGeo = new THREE.SphereGeometry(0.08, 8, 8)
    const coracaoMat = new THREE.MeshStandardMaterial({ color: '#C98291' })
    for (let i = 0; i < 6; i++) {
      const c = new THREE.Mesh(coracaoGeo, coracaoMat)
      const ang = (i / 6) * Math.PI * 2
      c.position.set(Math.cos(ang) * raioBase * 0.9, y + 0.2, Math.sin(ang) * raioBase * 0.9)
      boloGrupo.add(c)
    }
  }
  animarMontagemCamadas(raioBase, discoAltura, recheioAltura, corMassa, corCobertura, recheiosSelecionados)
}
function animarMontagemCamadas(raioBase, discoAltura, recheioAltura, corMassa, corCobertura, recheiosSelecionados) {
  camadasMassa.forEach((disco, i) => {
    disco.scale.set(0, 0, 0)
    disco.rotation.x = 0.5
    gsap.to(disco.scale, { x: 1, y: 1, z: 1, duration: 0.6, delay: i * 0.15, ease: 'back.out(1.7)' })
    gsap.to(disco.rotation, { x: 0, duration: 0.6, delay: i * 0.15, ease: 'power2.out' })
    gsap.to(disco.material.color, {
      r: parseInt(corMassa.slice(1, 3), 16) / 255,
      g: parseInt(corMassa.slice(3, 5), 16) / 255,
      b: parseInt(corMassa.slice(5, 7), 16) / 255,
      duration: 0.8, delay: i * 0.15,
    })
  })
  camadasRecheio.forEach((recheio, i) => {
    recheio.scale.set(0, 0, 0)
    recheio.position.y = (i * 0.8) + 0.55 + recheioAltura / 2
    gsap.to(recheio.scale, { x: 1, y: 1, z: 1, duration: 0.5, delay: 0.4 + i * 0.15, ease: 'back.out(1.7)' })
    gsap.to(recheio.material.color, {
      r: parseInt((CORES.recheio[recheiosSelecionados[i]] || '#FFF8EB').slice(1, 3), 16) / 255,
      g: parseInt((CORES.recheio[recheiosSelecionados[i]] || '#FFF8EB').slice(3, 5), 16) / 255,
      b: parseInt((CORES.recheio[recheiosSelecionados[i]] || '#FFF8EB').slice(5, 7), 16) / 255,
      duration: 0.6, delay: 0.4 + i * 0.15,
    })
  })
  if (coberturaMesh) {
    coberturaMesh.scale.set(0, 0, 0)
    coberturaMesh.position.y = 0.16 - 2
    gsap.to(coberturaMesh.scale, { x: 1, y: 1, z: 1, duration: 0.8, delay: 0.8, ease: 'back.out(1.7)' })
    gsap.to(coberturaMesh.position, { y: 0.16, duration: 0.8, delay: 0.8, ease: 'power2.out' })
    gsap.to(coberturaMesh.children[0]?.material.color || new THREE.Color(corCobertura), {
      r: parseInt(corCobertura.slice(1, 3), 16) / 255,
      g: parseInt(corCobertura.slice(3, 5), 16) / 255,
      b: parseInt(corCobertura.slice(5, 7), 16) / 255,
      duration: 0.8, delay: 0.8,
    })
  }
  if (props.fraseTopo) {
    coracoesFlutuantes(raioBase)
  }
}

function coracoesFlutuantes(raioBase) {
  for (let i = 0; i < 6; i++) {
    const coracaoGeo = new THREE.SphereGeometry(0.08, 8, 8)
    const coracaoMat = new THREE.MeshStandardMaterial({ color: '#C98291' })
    const c = new THREE.Mesh(coracaoGeo, coracaoMat)
    const ang = (i / 6) * Math.PI * 2
    c.position.set(Math.cos(ang) * raioBase * 0.9, 2.5, Math.sin(ang) * raioBase * 0.9)
    c.scale.set(0, 0, 0)
    boloGrupo.add(c)
    gsap.to(c.scale, { x: 1, y: 1, z: 1, duration: 0.5, delay: 1.2 + i * 0.08, ease: 'back.out(1.7)' })
    gsap.to(c.position, { y: 2.9, duration: 2, delay: 1.2 + i * 0.08, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    gsap.to(c.rotation, { z: Math.PI * 2, duration: 3, delay: 1.2 + i * 0.08, ease: 'none', repeat: -1 })
  }
}
function animate() {
  requestAnimationFrame(animate)
  if (!isDragging) {
    currentRotation += (targetRotation - currentRotation) * 0.05
    if (boloGrupo) boloGrupo.rotation.y = currentRotation
    targetRotation += 0.0015
  }
  if (controls) controls.update()
  if (renderer && scene && camera) renderer.render(scene, camera)
}
containerRef.value?.addEventListener('mousedown', () => { isDragging = true })
containerRef.value?.addEventListener('mouseup', () => { isDragging = false })
containerRef.value?.addEventListener('mousemove', (e) => { if (isDragging) targetRotation += e.movementX * 0.005 })
watch(() => props.tamanho, criarBolo, { deep: true })
watch(() => props.massa, criarBolo)
watch(() => props.recheios, criarBolo)
watch(() => props.cobertura, criarBolo)
watch(() => props.fraseTopo, criarBolo)
onMounted(() => { init(); window.addEventListener('resize', onResize) })
onBeforeUnmount(() => { window.removeEventListener('resize', onResize); if (renderer) renderer.dispose(); if (gsap) gsap.killTweensOf([]) })
function onResize() {
  const container = containerRef.value
  if (!container || !camera || !renderer) return
  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
}
</script>
