<template>
  <div class="relative w-full h-[340px] sm:h-[380px] rounded-2xl overflow-hidden border border-[#B88D91]/40 bg-gradient-to-b from-[#F8F0E9] via-[#FFFDFB] to-[#F3E5E8] shadow-inner select-none">
    <div ref="containerRef" class="w-full h-full cursor-grab active:cursor-grabbing"></div>
    <button
      type="button"
      @click="toggleCutaway"
      class="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm border"
      :class="isCutawayOpen ? 'bg-[#8E5365] text-white border-[#8E5365]' : 'bg-[#F8F0E9]/90 text-[#6D4A4A] border-[#C98291]/50 hover:bg-[#C98291] hover:text-white'"
    >
      <span>{{ isCutawayOpen ? '🎂 Fechar cobertura' : '👁️ Ver por dentro' }}</span>
    </button>
    <div class="absolute top-3 left-3 z-10 pointer-events-none">
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/80 text-[#8E5365] border border-[#B88D91]/30 backdrop-blur-sm">
        Tamanho {{ currentSize }} • {{ currentLine === 'premium' ? 'Linha Premium' : 'Linha Tradicional' }}
      </span>
    </div>
    <div class="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
      <span class="px-2.5 py-1 rounded-full text-[11px] text-[#6D4A4A] bg-white/80 border border-[#B88D91]/30 backdrop-blur-sm">
        Arraste 360° • 10cm (3 massas + 2 recheios)
      </span>
    </div>
  </div>
</template>

<script setup>
function init() {
  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#F8F0E9')

  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(0, 3.2, 6.5)
  camera.lookAt(0, 1.0, 0)

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
  controls.autoRotateSpeed = 1.2

  const hemi = new THREE.HemisphereLight(0xfff9f3, 0xd8c3b8, 0.85)
  scene.add(hemi)

  const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.8)
  keyLight.position.set(4, 7, 5)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  keyLight.shadow.bias = -0.0005
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0xf6c1cd, 0.75)
  rimLight.position.set(-5, 4, -4)
  scene.add(rimLight)

  const shadowGeo = new THREE.CircleGeometry(2.2, 32)
  const shadowMat = new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.18 })
  shadowMat.transparent = true
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
  shadowMesh.rotation.x = -Math.PI / 2
  shadowMesh.position.y = 0.01
  shadowMesh.receiveShadow = true
  scene.add(shadowMesh)

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
  const boleira = new THREE.Mesh(boleiraGeo, boleiraMat)
  boleira.position.y = 0
  boleira.castShadow = true
  boleira.receiveShadow = true
  scene.add(boleira)

  const fileteGeo = new THREE.TorusGeometry(1.62, 0.025, 16, 100)
  const fileteMat = new THREE.MeshPhysicalMaterial({ color: 0xc98291, metalness: 0.6, roughness: 0.25 })
  const filete = new THREE.Mesh(fileteGeo, fileteMat)
  filete.position.y = 0.02
  filete.rotation.x = Math.PI / 2
  filete.castShadow = true
  scene.add(filete)

  cakeRoot = new THREE.Group()
  cakeRoot.position.y = 0
  scene.add(cakeRoot)

  criarBolo()
  animate()
}

function limparBolo() {
  batterMeshes.forEach(m => cakeRoot.remove(m))
  fillingMeshes.forEach(m => cakeRoot.remove(m))
  rosetteMeshes.forEach(m => cakeRoot.remove(m))
  batterMeshes = []
  fillingMeshes = []
  rosetteMeshes = []

  if (frostingMesh) {
    cakeRoot.remove(frostingMesh)
    frostingMesh = null
  }
  if (dripGroup) {
    cakeRoot.remove(dripGroup)
    dripGroup = null
  }
  if (topperMesh) {
    cakeRoot.remove(topperMesh)
    topperMesh = null
  }
}

function criarBolo() {
  limparBolo()

  const escala = SIZE_SCALES[currentSize.value] || 1.0
  const raioBase = 1.12
  const discoAltura = 0.36
  const recheioAltura = 0.18

  const corMassa = CORES_MASSA[currentBatter.value.color] || '#F3DFC1'
  const corCobertura = CORES_COBERTURA[currentFrosting.value.color] || '#F8F0E9'
  const recheiosSelecionados = currentFillings.value || []

  const { map: texMap, bumpMap: texBump } = makeSpongeTextures(corMassa)
  const matMassa = new THREE.MeshStandardMaterial({
    map: texMap,
    bumpMap: texBump,
    bumpScale: 0.035,
    roughness: 0.88,
  })

  const texFrosting = makeSpatulaBumpMap()

  let y = discoAltura / 2
  for (let i = 0; i < 3; i++) {
    const disco = new THREE.Mesh(
      new THREE.CylinderGeometry(raioBase, raioBase, discoAltura, 48),
      matMassa
    )
    disco.position.y = y
    disco.castShadow = true
    disco.receiveShadow = true
    cakeRoot.add(disco)
    batterMeshes.push(disco)
    y += discoAltura

    if (i < 2) {
      const corRecheio = CORES_RECHEIO[recheiosSelecionados[i]?.color || recheiosSelecionados[i]] || '#FFF8EB'
      const recheioBorda = new THREE.Mesh(
        new THREE.TorusGeometry(1.06, 0.09, 16, 48),
        new THREE.MeshPhysicalMaterial({ color: corRecheio, roughness: 0.22, clearcoat: 0.45 })
      )
      recheioBorda.position.y = y + recheioAltura / 2
      recheioBorda.rotation.x = Math.PI / 2
      recheioBorda.castShadow = true
      cakeRoot.add(recheioBorda)
      fillingMeshes.push(recheioBorda)

      const recheioCentro = new THREE.Mesh(
        new THREE.CylinderGeometry(1.06, 1.06, recheioAltura, 32),
        new THREE.MeshPhysicalMaterial({ color: corRecheio, roughness: 0.22, clearcoat: 0.45 })
      )
      recheioCentro.position.y = y + recheioAltura / 2
      recheioCentro.castShadow = true
      cakeRoot.add(recheioCentro)
      fillingMeshes.push(recheioCentro)

      y += recheioAltura
    }
  }

  const topoGeo = new THREE.CylinderGeometry(raioBase * 1.06, raioBase * 1.06, 0.12, 48)
  const topoMat = new THREE.MeshPhysicalMaterial({ color: corCobertura, roughness: 0.42, clearcoat: 0.12 })
  const topo = new THREE.Mesh(topoGeo, topoMat)
  topo.position.y = y + 0.06

  const ehNaked = (currentFrosting.value.style || '') === 'naked' || currentFrosting.value.name?.toLowerCase().includes('naked')
  let lateral = null
  if (!ehNaked) {
    const alturaLateral = y + 0.12 - discoAltura / 2 + 0.12
    const lateralGeo = new THREE.CylinderGeometry(raioBase * 1.06, raioBase * 1.06, alturaLateral, 48)
    const lateralMat = new THREE.MeshPhysicalMaterial({
      map: texFrosting,
      bumpMap: texFrosting,
      bumpScale: 0.018,
      color: corCobertura,
      roughness: 0.42,
      clearcoat: 0.12,
    })
    lateral = new THREE.Mesh(lateralGeo, lateralMat)
    lateral.position.y = (alturaLateral / 2) - discoAltura / 2 + 0.06 + discoAltura / 2
    lateral.castShadow = true
  }

  frostingMesh = new THREE.Group()
  frostingMesh.add(topo)
  if (lateral) frostingMesh.add(lateral)
  frostingMesh.position.y = 0
  cakeRoot.add(frostingMesh)

  cakeRoot.scale.set(escala, escala, escala)

  animarMontagem()

  if (currentFrosting.value.color === '#4A2E2B' || currentFrosting.value.color === '#8E5365') {
    criarDrip(raioBase, y, corCobertura)
  }

  criarDecoroTopo(raioBase, y, corCobertura)

  criarTopper(raioBase, y, currentTopper.value)

  if (ehNaked) {
    isCutawayOpen.value = true
    aplicarCutaway(true)
  }
}

function makeSpongeTextures(hexColor = '#F3DFC1') {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = hexColor
  ctx.fillRect(0, 0, 256, 256)

  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * 256
    const y = Math.random() * 256
    const rx = 1 + Math.random() * 2.5
    const ry = 0.8 + Math.random() * 1.8
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fillStyle = i % 2 === 0 ? 'rgba(45, 25, 15, 0.16)' : 'rgba(255, 255, 255, 0.14)'
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

function makeSpatulaBumpMap() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, 512, 256)

  const stripes = 42
  const h = 256 / stripes
  for (let i = 0; i < stripes; i++) {
    const grad = ctx.createLinearGradient(0, i * h, 0, (i + 1) * h)
    grad.addColorStop(0, '#686868')
    grad.addColorStop(0.5, '#989898')
    grad.addColorStop(1, '#686868')
    ctx.fillStyle = grad
    ctx.fillRect(0, i * h, 512, h)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.repeat.set(4, 1)
  tex.bumpScale = 0.02
  return tex
}

function criarDrip(raioBase, yTopo, corCalda) {
  dripGroup = new THREE.Group()
  cakeRoot.add(dripGroup)

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
    cakeRoot.add(roseta)
    rosetteMeshes.push(roseta)
  }

  for (let i = 0; i < 6; i++) {
    const angulo = ((i / 6) * Math.PI * 2) + Math.PI / 6
    const eMorango = Math.random() > 0.5
    const docinho = new THREE.Mesh(
      new THREE.ConeGeometry(0.055, 0.16, 12),
      new THREE.MeshPhysicalMaterial({
        color: eMorango ? 0xb81d38 : new THREE.Color(corCobertura).getHex(),
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
    cakeRoot.add(docinho)
    rosetteMeshes.push(docinho)

    if (eMorango) {
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
  const hasteGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.5, 8)
  const hasteMat = new THREE.MeshPhysicalMaterial({ color: 0xc98291, metalness: 0.5, roughness: 0.3 })
  const haste = new THREE.Mesh(hasteGeo, hasteMat)
  haste.position.set(0, yTopo + 0.36 + 0.25, 0)
  haste.castShadow = true
  cakeRoot.add(haste)

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const texto = frase || 'Feito com carinho'

  ctx.fillStyle = '#F8F0E9'
  ctx.beginPath()
  ctx.ellipse(256, 128, 200, 70, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#C98291'
  ctx.lineWidth = 4
  ctx.stroke()

  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.ellipse(256, 128, 190, 60, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = '#8E5365'
  ctx.font = 'italic bold 26px "Playfair Display", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(texto, 256, 128)

  const placaTex = new THREE.CanvasTexture(canvas)
  const placaGeo = new THREE.PlaneGeometry(0.34, 0.16)
  const placaMat = new THREE.MeshStandardMaterial({ map: placaTex, transparent: true })
  const placa = new THREE.Mesh(placaGeo, placaMat)
  placa.position.set(0, yTopo + 0.36 + 0.52, 0)
  placa.rotation.x = -Math.PI / 6
  placa.castShadow = true
  cakeRoot.add(placa)

  topperMesh = new THREE.Group()
  topperMesh.add(haste)
  topperMesh.add(placa)
}

function animarMontagem() {
  cakeRoot.scale.set(0.01, 0.01, 0.01)
  const escala = SIZE_SCALES[currentSize.value] || 1.0
  gsap.to(cakeRoot.scale, {
    x: escala, y: escala, z: escala,
    duration: 1.2,
    ease: 'back.out(1.7)',
  })

  batterMeshes.forEach((disco, i) => {
    disco.scale.set(1, 0.01, 1)
    disco.rotation.x = 0.4
    gsap.to(disco.scale, { y: 1, duration: 0.5, delay: i * 0.18, ease: 'power2.out' })
    gsap.to(disco.rotation, { x: 0, duration: 0.6, delay: i * 0.18, ease: 'back.out(1.7)' })
  })
}

function aplicarCutaway(aberto) {
  if (!frostingMesh) return
  const alvo = aberto ? 0.15 : 1.0
  frostingMesh.traverse((child) => {
    if (child.isMesh) {
      gsap.to(child.material, {
        opacity: alvo,
        transparent: alvo < 1,
        duration: 0.8,
        ease: 'power2.inOut',
      })
    }
  })
}

function toggleCutaway() {
  if (cutawayTimeout) {
    clearTimeout(cutawayTimeout)
    cutawayTimeout = null
  }
  isCutawayOpen.value = !isCutawayOpen.value
  aplicarCutaway(isCutawayOpen.value)

  if (!isCutawayOpen.value) {
    cutawayTimeout = setTimeout(() => {
      isCutawayOpen.value = true
      aplicarCutaway(true)
    }, 4000)
  }
}

function animate() {
  animationFrameId = requestAnimationFrame(animate)

  if (controls) controls.update()
  if (renderer && scene && camera) renderer.render(scene, camera)
}

containerRef.value?.addEventListener('mousedown', () => {})
containerRef.value?.addEventListener('mouseup', () => {})

watch(() => currentSize.value, criarBolo)
watch(() => currentLine.value, criarBolo)
watch(() => currentBatter.value, criarBolo, { deep: true })
watch(() => currentFillings.value, criarBolo, { deep: true })
watch(() => currentFrosting.value, criarBolo, { deep: true })
watch(() => currentTopper.value, criarBolo)
watch(() => isCutawayOpen.value, (v) => aplicarCutaway(v))

onMounted(() => {
  init()
  window.addEventListener('resize', onResize)
  resizeObserver = new ResizeObserver(onResize)
  resizeObserver.observe(containerRef.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (resizeObserver) resizeObserver.disconnect()
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
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
