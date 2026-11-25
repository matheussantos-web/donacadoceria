p = '/c/Projetos/Freelance/catalogo_donacadoceria/src/components/Cake3DPreview.vue'

conteudo = '''<template>
  <div class="cake3d-preview w-full h-[400px] sm:h-[480px] md:h-[520px] rounded-2xl overflow-hidden bg-brand-creme border border-brand-mauve/20 shadow-xl relative">
    <div ref="containerRef" class="w-full h-full"></div>

    <!-- Botão Ver por dentro -->
    <button
      v-if="!raioX"
      @click="ativarRaioX"
      class="absolute top-4 right-4 z-20 px-3 py-1.5 bg-white/90 backdrop-blur-md border border-brand-mauve/30 text-[10px] font-bold text-brand-cacau rounded-full shadow-lg hover:bg-brand-rose hover:text-white transition-all duration-300 flex items-center gap-1.5"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7h9.543c0 2.89 2.333 5.224 5.333 5.733zM20 13l.001-.001-.001-.001-.001-.001-.001-.001-.001-.001-.001-.001-.001-.001-.001-.001l.001.001.001.001.001.001.001.001.001.001.001.001zM15 15c-2.361 0-4.376-1.376-5.192-3.472a4 4 0 011.568-2.032L9.948 10.56c-.393-.393-.393-1.029 0-1.422l1.422-1.422a1.002 1.002 0 011.414 0l1.414 1.414c.393.393.393 1.029 0 1.422L15 13.586l-1.422 1.422a1 1 0 01-1.414-1.414z" />
      </svg>
      <span class="text-[10px] font-medium">Ver por dentro</span>
    </button>
    <button
      v-else
      @click="desativarRaioX"
      class="absolute top-4 right-4 z-20 px-3 py-1.5 bg-brand-rose/90 backdrop-blur-md border border-brand-rose/50 text-[10px] font-bold text-white rounded-full shadow-lg hover:bg-brand-rose transition-all duration-300 flex items-center gap-1.5"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7H13c0 4.714 3.734 8.571 8 8.571s8-3.857 8-8.571S18.478 4.5 14 4.5c-4.477 0-8.268 2.943-9.542 7H2.458z" />
      </svg>
      <span class="text-[10px] font-medium">Fechar vista interna</span>
    </button>

    <!-- Etiqueta inferior -->
    <div class="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-brand-mauve/30 px-3 py-2 rounded-lg shadow-lg">
      <svg class="w-3 h-3 text-brand-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7h9.543c0 2.89 2.333 5.224 5.333 5.733z" />
      </svg>
      <span class="text-[10px] text-brand-cacau font-medium">3 discos de massa &bull; 2 camadas de recheio &bull; 10 cm</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const props = defineProps({
  tamanho: { type: Object, default: () => ({ label: 'M', serve: 'até 15 pessoas', precoMultiplicador: 1.0 }) },
  massa: { type: String, default: 'baunilha' },
  recheios: { type: Array, default: () => [] },
  cobertura: { type: String, default: 'chantininho' },
  fraseTopo: { type: String, default: '' },
  linha: { type: String, default: 'tradicional' },
})

const containerRef = ref(null)
const raioX = ref(false)

let scene, camera, renderer, pmremGenerator, controls
let cakeGroup, prato, coberturaMesh
let cameraTargetRotation = 0
let cameraCurrentRotation = 0
let isDragging = false

const ESCALAS_TAMANHO = { P: 0.82, M: 1.0, G: 1.18, GG: 1.34 }

const CORES = {
  massa: { baunilha: '#F3DFC1', chocolate: '#4E3229', redvelvet: '#8E354A' },
  recheio: { brigadeiro: '#3B231C', ninho: '#FFF8EB', morango: '#C95B72', doce_leite: '#C68B59', maracuja: '#E8B948', pistache: '#7A4426' },
  cobertura: { chantininho: '#F8F0E9', chantininho_rose: '#C98291', berry: '#8E5365', ganache: '#4A2E2B', naked: '#FFFFFF' },
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return new THREE.Color(r, g, b)
}

function createSpongeTexture(hexColor) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  const base = hexToRgb(hexColor)
  ctx.fillStyle = `rgb(${Math.round(base.r * 255)},${Math.round(base.g * 255)},${Math.round(base.b * 255)})`
  ctx.fillRect(0, 0, 256, 256)

  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * 256
    const y = Math.random() * 256
    const r = 2 + Math.random() * 6
    const maisEscuro = Math.random() < 0.5
    const fator = maisEscuro ? 0.75 : 1.25
    const corR = Math.max(0, Math.min(255, Math.round(base.r * 255 * fator)))
    const corG = Math.max(0, Math.min(255, Math.round(base.g * 255 * fator)))
    const corB = Math.max(0, Math.min(255, Math.round(base.b * 255 * fator)))
    ctx.fillStyle = `rgba(${corR},${corG},${corB},${0.15 + Math.random() * 0.3})`
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * 0.6, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.bumpScale = 0.035
  return { map: texture, bumpMap: texture }
}

function createFrostingBumpTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, 512, 256)

  for (let i = 0; i < 45; i++) {
    const y = (i / 45) * 256
    const grad = ctx.createLinearGradient(0, y, 0, y + 12)
    grad.addColorStop(0, '#686868')
    grad.addColorStop(0.5, '#989898')
    grad.addColorStop(1, '#686868')
    ctx.fillStyle = grad
    ctx.fillRect(0, y, 512, 6)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.bumpScale = 0.018
  return texture
}

function createTopperTexture(text) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  const frase = text || 'Feito com carinho'

  // Placa oval/nuvem
  ctx.fillStyle = '#F8F0E9'
  ctx.beginPath()
  ctx.ellipse(256, 128, 200, 70, 0, 0, Math.PI * 2)
  ctx.fill()

  // Borda dupla rosé
  ctx.strokeStyle = '#C98291'
  ctx.lineWidth = 4
  ctx.stroke()

  ctx.lineWidth = 1.5
  ctx.strokeStyle = '#C98291'
  ctx.beginPath()
  ctx.ellipse(256, 128, 190, 60, 0, 0, Math.PI * 2)
  ctx.stroke()

  // Texto centralizado
  ctx.fillStyle = '#8E5365'
  ctx.font = 'italic bold 26px "Playfair Display", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(frase, 256, 128)

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

function init() {
  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#F8F0E9')

  camera = new THREE.PerspectiveCamera(34, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(0, 3.4, 6.2)
  camera.lookAt(0, 1.1, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08
  container.appendChild(renderer.domElement)

  pmremGenerator = new THREE.PMREMGenerator(renderer)
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.enableZoom = false
  controls.enablePan = false
  controls.minPolarAngle = Math.PI / 5
  controls.maxPolarAngle = Math.PI / 2.15
  controls.autoRotate = true
  controls.autoRotateSpeed = 1.4

  // Luz ambiente de estúdio
  const hemi = new THREE.HemisphereLight(0xfff9f3, 0xd8c3b8, 0.85)
  scene.add(hemi)

  // Key Light
  const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.8)
  keyLight.position.set(4, 7, 5)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  keyLight.shadow.bias = -0.0005
  scene.add(keyLight)

  // Rim Light rosada
  const rimLight = new THREE.DirectionalLight(0xf6c1cd, 0.75)
  rimLight.position.set(-5, 4, -4)
  scene.add(rimLight)

  // Sombra no chão
  const shadowGeo = new THREE.CircleGeometry(2.2, 32)
  const shadowMat = new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.18 })
  shadowMat.transparent = true
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
  shadowMesh.rotation.x = -Math.PI / 2
  shadowMesh.position.y = 0.01
  shadowMesh.receiveShadow = true
  scene.add(shadowMesh)

  // Boleira de porcelana com pé
  const perfilBoleira = [
    new THREE.Vector2(1.65, 0),
    new THREE.Vector2(1.55, 0.05),
    new THREE.Vector2(1.45, 0.12),
    new THREE.Vector2(0.55, 0.12),
    new THREE.Vector2(0.50, 0.45),
    new THREE.Vector2(0.30, 0.75),
    new THREE.Vector2(0.30, 1.10),
    new THREE.Vector2(0.50, 1.40),
    new THREE.Vector2(0.55, 1.55),
    new THREE.Vector2(1.65, 1.55),
  ]
  const boleiraGeo = new THREE.LatheGeometry(perfilBoleira, 32)
  const boleiraMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8f0e9,
    roughness: 0.18,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
  })
  prato = new THREE.Mesh(boleiraGeo, boleiraMat)
  prato.position.y = 0
  prato.castShadow = true
  prato.receiveShadow = true
  scene.add(prato)

  // Filete dourado/rosé na borda do prato
  const fileteGeo = new THREE.TorusGeometry(1.62, 0.025, 16, 100)
  const fileteMat = new THREE.MeshPhysicalMaterial({ color: 0xc98291, metalness: 0.6, roughness: 0.25 })
  const filete = new THREE.Mesh(fileteGeo, fileteMat)
  filete.position.y = 0.02
  filete.rotation.x = Math.PI / 2
  filete.castShadow = true
  scene.add(filete)

  cakeGroup = new THREE.Group()
  cakeGroup.position.y = 0
  scene.add(cakeGroup)

  coberturaMesh = new THREE.Group()
  cakeGroup.add(coberturaMesh)

  criarBolo()
  animate()
}

function criarBolo() {
  while (cakeGroup.children.length > 0) {
    cakeGroup.remove(cakeGroup.children[0])
  }
  while (coberturaMesh.children.length > 0) {
    coberturaMesh.remove(coberturaMesh.children[0])
  }

  cakeGroup.add(coberturaMesh)

  const escala = ESCALAS_TAMANHO[props.tamanho?.label] || 1.0
  const raioBase = 1.12
  const discoAltura = 0.36
  const recheioAltura = 0.18

  const corMassa = CORES.massa[props.massa] || '#F3DFC1'
  const corCobertura = CORES.cobertura[props.cobertura] || '#F8F0E9'
  const recheiosSelecionados = props.recheios || []

  const texMassa = createSpongeTexture(corMassa)
  const matMassa = new THREE.MeshStandardMaterial({
    map: texMassa.map,
    bumpMap: texMassa.bumpMap,
    bumpScale: 0.035,
    roughness: 0.88,
  })

  const texFrosting = createFrostingBumpTexture()

  let y = discoAltura / 2
  for (let i = 0; i < 3; i++) {
    const disco = new THREE.Mesh(
      new THREE.CylinderGeometry(raioBase, raioBase, discoAltura, 48),
      matMassa
    )
    disco.position.y = y
    disco.castShadow = true
    disco.receiveShadow = true
    cakeGroup.add(disco)
    y += discoAltura

    if (i < 2) {
      const corRecheio = CORES.recheio[recheiosSelecionados[i]] || '#FFF8EB'
      // Borda abaulada do recheio (TorusGeometry) para parecer creme espremido
      const recheioBorda = new THREE.Mesh(
        new THREE.TorusGeometry(1.06, 0.09, 16, 48),
        new THREE.MeshPhysicalMaterial({ color: corRecheio, roughness: 0.22, clearcoat: 0.45 })
      )
      recheioBorda.position.y = y + recheioAltura / 2
      recheioBorda.rotation.x = Math.PI / 2
      recheioBorda.castShadow = true
      cakeGroup.add(recheioBorda)

      // Preenchimento interno do recheio
      const recheioCentro = new THREE.Mesh(
        new THREE.CylinderGeometry(1.06, 1.06, recheioAltura, 32),
        new THREE.MeshPhysicalMaterial({ color: corRecheio, roughness: 0.22, clearcoat: 0.45 })
      )
      recheioCentro.position.y = y + recheioAltura / 2
      recheioCentro.castShadow = true
      cakeGroup.add(recheioCentro)

      y += recheioAltura
    }
  }

  // Topo da cobertura
  const topoGeo = new THREE.CylinderGeometry(raioBase * 1.06, raioBase * 1.06, 0.12, 48)
  const topoMat = new THREE.MeshPhysicalMaterial({ color: corCobertura, roughness: 0.42, clearcoat: 0.12 })
  const topo = new THREE.Mesh(topoGeo, topoMat)
  topo.position.y = y + 0.06
  coberturaMesh.add(topo)

  // Lateral da cobertura (casca externa)
  const ehNaked = props.cobertura === 'naked'
  if (!ehNaked) {
    const alturaLateral = y + 0.12 - discoAltura / 2 + 0.12
    const lateralGeo = new THREE.CylinderGeometry(raioBase * 1.06, raioBase * 1.06, alturaLateral, 48)
    lateralGeo.applyTextureCoordinate(texFrosting)
    const lateralMat = new THREE.MeshPhysicalMaterial({
      map: texFrosting,
      bumpMap: texFrosting,
      bumpScale: 0.018,
      color: corCobertura,
      roughness: 0.42,
      clearcoat: 0.12,
    })
    const lateral = new THREE.Mesh(lateralGeo, lateralMat)
    lateral.position.y = (alturaLateral / 2) - discoAltura / 2 + 0.06 + discoAltura / 2
    lateral.castShadow = true
    coberturaMesh.add(lateral)
  }

  coberturaMesh.position.y = 0

  // Ajuste de escala do bolo inteiro
  cakeGroup.scale.set(escala, escala, escala)

  // Animação GSAP de montagem
  animarMontagem()

  // Drip cake se ganache ou cobertura com calda
  if (props.cobertura === 'ganache' || props.cobertura === 'berry') {
    criarDrip(raioBase, y, corCobertura)
  }

  // Rosetas e decorações no topo
  criarDecoroTopo(raioBase, y, corCobertura)

  // Topper personalizado
  criarTopper(raioBase, y, props.fraseTopo)

  // Modo raio-x inicial se naked
  if (ehNaked) {
    raioX.value = true
    aplicarRaioX(true)
  }
}

function criarDrip(raioBase, yTopo, corCalda) {
  const dripGroup = new THREE.Group()
  coberturaMesh.add(dripGroup)

  const numGotas = 24
  for (let i = 0; i < numGotas; i++) {
    const angulo = (i / numGotas) * Math.PI * 2
    const alturaGota = 0.18 + Math.random() * 0.37
    const gotaGeo = new THREE.CylinderGeometry(0.04, 0.015, alturaGota, 12)
    const gotaMat = new THREE.MeshPhysicalMaterial({ color: corCalda, roughness: 0.1, clearcoat: 1.0 })
    const gota = new THREE.Mesh(gotaGeo, gotaMat)
    gota.position.set(
      Math.cos(angulo) * raioBase * 1.085,
      yTopo + 0.06 + alturaGota / 2,
      Math.sin(angulo) * raioBase * 1.085
    )
    gota.rotation.z = Math.random() * 0.4
    gota.castShadow = true
    dripGroup.add(gota)

    // Ponta esférica da gota
    const pontaGeo = new THREE.SphereGeometry(0.045, 10, 10)
    const ponta = new THREE.Mesh(pontaGeo, gotaMat)
    ponta.position.set(0, -alturaGota / 2 - 0.02, 0)
    gota.add(ponta)
  }
}

function criarDecoroTopo(raioBase, yTopo, corCobertura) {
  const numRosetas = 12
  for (let i = 0; i < numRosetas; i++) {
    const angulo = (i / numRosetas) * Math.PI * 2
    const roseta = new THREE.Mesh(
      new THREE.ConeGeometry(0.07, 0.14, 8),
      new THREE.MeshPhysicalMaterial({ color: corCobertura, roughness: 0.45 })
    )
    roseta.position.set(
      Math.cos(angulo) * raioBase * 0.83,
      yTopo + 0.14 + 0.07,
      Math.sin(angulo) * raioBase * 0.83
    )
    roseta.rotation.x = Math.PI / 2 + Math.random() * 0.3
    roseta.rotation.z = angulo
    roseta.castShadow = true
    coberturaMesh.add(roseta)
  }

  // Morangos / brigadeiros intercalados
  for (let i = 0; i < 6; i++) {
    const angulo = ((i / 6) * Math.PI * 2) + Math.PI / 6
    const eMorango = Math.random() > 0.5
    const docinho = new THREE.Mesh(
      new THREE.ConeGeometry(0.055, 0.16, 12),
      new THREE.MeshPhysicalMaterial({
        color: eMorango ? 0xb81d38 : corCobertura,
        roughness: 0.25,
        clearcoat: 0.3,
      })
    )
    docinho.position.set(
      Math.cos(angulo) * raioBase * 0.95,
      yTopo + 0.16 + 0.08,
      Math.sin(angulo) * raioBase * 0.95
    )
    docinho.rotation.z = angulo
    docinho.castShadow = true
    coberturaMesh.add(docinho)

    if (eMorango) {
      // Folhinha verde
      const folha = new THREE.Mesh(
        new THREE.ConeGeometry(0.025, 0.05, 4),
        new THREE.MeshPhysicalMaterial({ color: 0x3d6b35, roughness: 0.6 })
      )
      folha.position.set(0, 0.16, 0)
      folha.rotation.x = -Math.PI / 4
      docinho.add(folha)
    }
  }
}

function criarTopper(raioBase, yTopo, frase) {
  // Haste fina
  const hasteGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.5, 8)
  const hasteMat = new THREE.MeshPhysicalMaterial({ color: 0xc98291, metalness: 0.5, roughness: 0.3 })
  const haste = new THREE.Mesh(hasteGeo, hasteMat)
  haste.position.set(0, yTopo + 0.36 + 0.25, 0)
  haste.castShadow = true
  coberturaMesh.add(haste)

  // Placa
  const placaGeo = new THREE.PlaneGeometry(0.34, 0.16)
  const placaTex = createTopperTexture(frase)
  const placaMat = new THREE.MeshStandardMaterial({ map: placaTex, transparent: true })
  const placa = new THREE.Mesh(placaGeo, placaMat)
  placa.position.set(0, yTopo + 0.36 + 0.52, 0)
  placa.rotation.x = -Math.PI / 6
  placa.castShadow = true
  coberturaMesh.add(placa)
}

function animarMontagem() {
  // Scale do bolo cresce suavemente
  cakeGroup.scale.set(0.01, 0.01, 0.01)
  gsap.to(cakeGroup.scale, {
    x: ESCALAS_TAMANHO[props.tamanho?.label] || 1.0,
    y: ESCALAS_TAMANHO[props.tamanho?.label] || 1.0,
    z: ESCALAS_TAMANHO[props.tamanho?.label] || 1.0,
    duration: 1.2,
    ease: 'back.out(1.7)',
  })

  // Cada disco de massa sobe e gira levemente
  const discos = cakeGroup.children.filter((c) => c.geometry && c.geometry.type === 'CylinderGeometry' && c.material.roughness === 0.88)
  discos.forEach((disco, i) => {
    disco.scale.set(1, 0.01, 1)
    disco.rotation.x = 0.4
    gsap.to(disco.scale, { y: 1, duration: 0.5, delay: i * 0.18, ease: 'power2.out' })
    gsap.to(disco.rotation, { x: 0, duration: 0.6, delay: i * 0.18, ease: 'back.out(1.7)' })
  })
}

function aplicarRaioX(ativo) {
  if (!coberturaMesh) return
  coberturaMesh.traverse((child) => {
    if (child.isMesh) {
      gsap.to(child.material, {
        opacity: ativo ? 0.18 : 1.0,
        transparent: ativo,
        duration: 0.8,
        ease: 'power2.inOut',
      })
    }
  })
}

function ativarRaioX() {
  raioX.value = true
  aplicarRaioX(true)
}

function desativarRaioX() {
  raioX.value = false
  aplicarRaioX(false)
}

function animate() {
  requestAnimationFrame(animate)

  if (!isDragging) {
    cameraCurrentRotation += (cameraTargetRotation - cameraCurrentRotation) * 0.05
    cameraTargetRotation += 0.0014
  }

  if (controls) controls.update()
  if (renderer && scene && camera) renderer.render(scene, camera)
}

containerRef.value?.addEventListener('mousedown', () => { isDragging = true })
containerRef.value?.addEventListener('mouseup', () => { isDragging = false })
containerRef.value?.addEventListener('mousemove', (e) => {
  if (isDragging) cameraTargetRotation += e.movementX * 0.005
})

watch(() => props.tamanho, criarBolo, { deep: true })
watch(() => props.massa, criarBolo)
watch(() => props.recheios, criarBolo)
watch(() => props.cobertura, criarBolo)
watch(() => props.fraseTopo, criarBolo)
watch(() => raioX.value, (v) => aplicarRaioX(v))

onMounted(() => {
  init()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (renderer) renderer.dispose()
  if (pmremGenerator) pmremGenerator.dispose()
  if (gsap) gsap.killTweensOf([])
})

function onResize() {
  const container = containerRef.value
  if (!container || !camera || !renderer) return
  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
}
</script>
'''

with open(p, 'w', encoding='utf-8') as f:
    f.write(conteudo)
print('Cake3DPreview.vue escrito com sucesso')