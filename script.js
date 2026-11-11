
import * as THREE from 'three'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/controls/OrbitControls.js'

const app = document.querySelector('#app')

// INTERFACE
app.innerHTML = `
  <canvas id="space"></canvas>

  <section class="welcome-screen" id="welcome">
    <div class="welcome-content">
      <p class="eyebrow">A UNIVERSE MADE JUST FOR YOU</p>
      <h1>MALISSIA</h1>
      <div class="gold-line"></div>
      <h2>Bienvenue Malissia</h2>

      <p class="welcome-message">
        Ce voyage est pour toi, Malissia.
        J'espère qu'il te fera autant plaisir
        que j'en ai eu à le créer.
      </p>

      <button id="start-button">Commencer le voyage</button>

      <p class="signature">
        Un univers imaginé spécialement pour toi, par Yanis.
      </p>
    </div>
  </section>

  <div class="galaxy-ui" id="galaxy-ui">
    <div class="top-message">
      <span class="eyebrow">MALISSIA'S UNIVERSE</span>
      <p>Explore la galaxie et découvre ses secrets.</p>
    </div>

    <div class="controls-help" id="controls-help">
      <strong>Comment explorer ?</strong>
      <span>Glisse pour regarder autour de toi · Molette ou pincement pour zoomer</span>
      <span>Clique sur une planète pour découvrir son histoire.</span>
      <button id="close-help" aria-label="Fermer">Compris</button>
    </div>

    <div class="message-panel" id="message-panel">
      <button class="close-panel" id="close-panel" aria-label="Fermer">×</button>
      <p class="eyebrow" id="message-category">DÉCOUVERTE</p>
      <h2 id="message-title"></h2>
      <p id="message-text"></p>
      <button id="message-next">Continuer l'exploration</button>
    </div>

    <div class="bottom-hint">
      <span>✦</span> Un univers imaginé spécialement pour toi
    </div>
  </div>
`

// SCÈNE
const scene = new THREE.Scene()
scene.background = new THREE.Color('#030817')
scene.fog = new THREE.FogExp2('#030817', 0.0018)

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1500
)

camera.position.set(0, 18, 48)

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#space'),
  antialias: true,
  powerPreference: 'high-performance'
})

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace

// DÉPLACEMENT LIBRE
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.045
controls.enablePan = true
controls.minDistance = 9
controls.maxDistance = 100
controls.maxPolarAngle = Math.PI * 0.48
controls.target.set(0, 0, 0)

// LUMIÈRES
scene.add(new THREE.AmbientLight('#a8c7ff', 1.2))

const centralLight = new THREE.PointLight('#7baaff', 180, 100)
centralLight.position.set(0, 0, 0)
scene.add(centralLight)

// GALAXIE SPIRALE
const galaxyCount = window.innerWidth < 700 ? 9000 : 18000
const galaxyPositions = new Float32Array(galaxyCount * 3)
const galaxyColors = new Float32Array(galaxyCount * 3)

const armCount = 4
const galaxyRadius = 29

for (let i = 0; i < galaxyCount; i++) {
  const radius = Math.random() * galaxyRadius
  const arm = i % armCount
  const spin = radius * 0.38
  const angle =
    arm * (Math.PI * 2 / armCount) +
    spin +
    (Math.random() - 0.5) * 0.7

  const spread = (1 - radius / galaxyRadius) * 1.5 + 0.3

  galaxyPositions[i * 3] =
    Math.cos(angle) * radius +
    (Math.random() - 0.5) * spread

  galaxyPositions[i * 3 + 1] =
    (Math.random() - 0.5) * spread * 0.7

  galaxyPositions[i * 3 + 2] =
    Math.sin(angle) * radius +
    (Math.random() - 0.5) * spread

  const mix = Math.random()

  galaxyColors[i * 3] = 0.35 + mix * 0.45
  galaxyColors[i * 3 + 1] = 0.45 + mix * 0.4
  galaxyColors[i * 3 + 2] = 0.85 + mix * 0.15
}

const galaxyGeometry = new THREE.BufferGeometry()
galaxyGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(galaxyPositions, 3)
)
galaxyGeometry.setAttribute(
  'color',
  new THREE.BufferAttribute(galaxyColors, 3)
)

const galaxyMaterial = new THREE.PointsMaterial({
  size: 0.16,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  sizeAttenuation: true,
  depthWrite: false
})

const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial)
scene.add(galaxy)

// ÉTOILES LOINTAINES
const distantCount = 4500
const distantPositions = new Float32Array(distantCount * 3)

for (let i = 0; i < distantCount; i++) {
  distantPositions[i * 3] = (Math.random() - 0.5) * 350
  distantPositions[i * 3 + 1] = (Math.random() - 0.5) * 220
  distantPositions[i * 3 + 2] = (Math.random() - 0.5) * 350
}

const distantGeometry = new THREE.BufferGeometry()
distantGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(distantPositions, 3)
)

const distantStars = new THREE.Points(
  distantGeometry,
  new THREE.PointsMaterial({
    color: '#dceaff',
    size: 0.13,
    transparent: true,
    opacity: 0.8
  })
)

scene.add(distantStars)

// PLANÈTES
const clickablePlanets = []

function createPlanet({
  name,
  color,
  size,
  position,
  message,
  category,
  ring = false
}) {
  const geometry = new THREE.SphereGeometry(size, 48, 48)

  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.75,
    metalness: 0.08,
    emissive: color,
    emissiveIntensity: 0.12
  })

  const planet = new THREE.Mesh(geometry, material)
  planet.position.set(...position)
  planet.userData = { name, message, category }
  scene.add(planet)

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(size * 1.22, 32, 32),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.09,
      side: THREE.BackSide
    })
  )

  planet.add(glow)

  if (ring) {
    const ringGeometry = new THREE.TorusGeometry(
      size * 1.55,
      size * 0.045,
      3,
      100
    )

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: '#e8c879',
      transparent: true,
      opacity: 0.8
    })

    const planetRing = new THREE.Mesh(ringGeometry, ringMaterial)
    planetRing.rotation.x = Math.PI / 2.5
    planet.add(planetRing)
  }

  clickablePlanets.push(planet)
  return planet
}

createPlanet({
  name: 'Les belles qualités',
  color: '#527fda',
  size: 2.2,
  position: [-13, 1, -7],
  category: 'SA PREMIÈRE DÉCOUVERTE',
  message:
    'Il y a des choses chez toi qui ne se voient pas forcément au premier regard. Ta gentillesse, ton attention et cette belle personnalité qui font de toi une personne unique. Ne doute jamais de la valeur que tu as.'
})

createPlanet({
  name: 'Quelques mots pour toi',
  color: '#8d75d8',
  size: 1.8,
  position: [12, -1, -12],
  category: 'UN MESSAGE POUR TOI',
  message:
    'Je voulais créer quelque chose qui ne ressemble à rien de ce que tu as déjà reçu. Un endroit rien qu’à toi, avec du temps, de l’imagination et beaucoup de sincérité derrière chaque détail.'
})

createPlanet({
  name: 'STEFAN',
  color: '#e6b94f',
  size: 2.8,
  position: [5, 2, 13],
  category: 'LA PLANÈTE DE STEFAN',
  ring: true,
  message:
    'Stefan est un petit garçon magnifique, tellement mignon. J’espère qu’il grandira en sachant à quel point sa maman est fière de lui, et qu’il lui donnera encore mille raisons de l’être.'
})

const finalPlanet = createPlanet({
  name: 'La dernière étoile',
  color: '#b8d9ff',
  size: 1.6,
  position: [-19, -2, 12],
  category: 'LA DERNIÈRE DÉCOUVERTE',
  message:
    'Merci d’être simplement toi. N’oublie jamais la belle personne que tu es.'
})

// ASTÉROÏDES LUMINEUX AUTOUR DES PLANÈTES
const asteroidGeometry = new THREE.SphereGeometry(0.07, 8, 8)
const asteroidMaterial = new THREE.MeshBasicMaterial({ color: '#d8c18b' })

const asteroids = []

for (let i = 0; i < 90; i++) {
  const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial)

  const angle = Math.random() * Math.PI * 2
  const radius = 8 + Math.random() * 25

  asteroid.position.set(
    Math.cos(angle) * radius,
    (Math.random() - 0.5) * 3,
    Math.sin(angle) * radius
  )

  scene.add(asteroid)
  asteroids.push(asteroid)
}

// ÉTOILES FILANTES
const shootingStars = []

function createShootingStar() {
  const start = new THREE.Vector3(
    (Math.random() - 0.5) * 90,
    15 + Math.random() * 20,
    -30 - Math.random() * 40
  )

  const end = start.clone().add(
    new THREE.Vector3(-10, -8, 0)
  )

  const geometry = new THREE.BufferGeometry().setFromPoints([start, end])

  const material = new THREE.LineBasicMaterial({
    color: '#c7e2ff',
    transparent: true,
    opacity: 0.9
  })

  const line = new THREE.Line(geometry, material)
  scene.add(line)

  shootingStars.push({
    line,
    start,
    end,
    progress: 0,
    speed: 0.012 + Math.random() * 0.012
  })
}

function updateShootingStars() {
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const star = shootingStars[i]
    star.progress += star.speed

    star.line.position.lerpVectors(
      star.start,
      star.end,
      star.progress
    )

    if (star.progress >= 1) {
      scene.remove(star.line)
      star.line.geometry.dispose()
      star.line.material.dispose()
      shootingStars.splice(i, 1)
    }
  }
}

// INTERACTIONS
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

let pointerStart = null

renderer.domElement.addEventListener('pointerdown', event => {
  pointerStart = {
    x: event.clientX,
    y: event.clientY
  }
})

renderer.domElement.addEventListener('pointerup', event => {
  if (!pointerStart) return

  const distance = Math.hypot(
    event.clientX - pointerStart.x,
    event.clientY - pointerStart.y
  )

  pointerStart = null

  // Évite de confondre un mouvement de caméra avec un clic.
  if (distance > 8) return

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(pointer, camera)

  const hits = raycaster.intersectObjects(clickablePlanets, true)

  if (hits.length > 0) {
    let selected = hits[0].object

    while (selected && !selected.userData.name) {
      selected = selected.parent
    }

    if (selected && selected.userData.name) {
      openMessage(selected.userData)
    }
  }
})

// PANNEAU DES MESSAGES
const messagePanel = document.querySelector('#message-panel')

function openMessage(data) {
  document.querySelector('#message-category').textContent = data.category
  document.querySelector('#message-title').textContent = data.name
  document.querySelector('#message-text').textContent = data.message

  messagePanel.classList.add('visible')

  if (data.name === finalPlanet.userData.name) {
    revealConstellation()
  }
}

function closeMessage() {
  messagePanel.classList.remove('visible')
}

document.querySelector('#close-panel').addEventListener('click', closeMessage)
document.querySelector('#message-next').addEventListener('click', closeMessage)

// INDICATIONS
document.querySelector('#close-help').addEventListener('click', () => {
  document.querySelector('#controls-help').classList.add('hidden')
})

// DÉMARRAGE
document.querySelector('#start-button').addEventListener('click', () => {
  document.querySelector('#welcome').classList.add('welcome-hidden')
  document.querySelector('#galaxy-ui').classList.add('active')

  setTimeout(() => {
    document.querySelector('#welcome').remove()
  }, 1500)
})

// CONSTELLATION FINALE
let constellationCreated = false

function revealConstellation() {
  if (constellationCreated) return
  constellationCreated = true

  const points = [
    [-3, 3, 0],
    [-1, 5, 0],
    [1, 3.5, 0],
    [3, 5, 0],
    [5, 2, 0],
    [2, 0, 0],
    [-1, 1, 0]
  ]

  const group = new THREE.Group()

  const pointMaterial = new THREE.PointsMaterial({
    color: '#ffe5a0',
    size: 0.55,
    transparent: true,
    opacity: 1
  })

  const pointGeometry = new THREE.BufferGeometry()
  pointGeometry.setFromPoints(
    points.map(point => new THREE.Vector3(...point))
  )

  group.add(new THREE.Points(pointGeometry, pointMaterial))

  const connections = [
    [0, 1], [1, 2], [2, 3],
    [3, 4], [4, 5], [5, 6], [6, 0]
  ]

  connections.forEach(([a, b]) => {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...points[a]),
      new THREE.Vector3(...points[b])
    ])

    const line = new THREE.Line(
      lineGeometry,
      new THREE.LineBasicMaterial({
        color: '#e8c879',
        transparent: true,
        opacity: 0.8
      })
    )

    group.add(line)
  })

  group.position.set(-19, 4, 12)
  scene.add(group)
}

// ANIMATION
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)

  const elapsed = clock.getElapsedTime()

  galaxy.rotation.y = elapsed * 0.012
  distantStars.rotation.y = elapsed * 0.002

  asteroids.forEach((asteroid, index) => {
    asteroid.position.y += Math.sin(elapsed + index) * 0.0008
  })

  clickablePlanets.forEach((planet, index) => {
    planet.rotation.y += 0.0015 + index * 0.0003
  })

  if (Math.random() < 0.009 && shootingStars.length < 3) {
    createShootingStar()
  }

  updateShootingStars()
  controls.update()
  renderer.render(scene, camera)
}

animate()

// ADAPTATION AUX ÉCRANS
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7))
})
