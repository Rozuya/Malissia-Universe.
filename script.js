
import * as THREE from 'three'

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="welcome-screen">
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
  </main>

  <div class="cinematic-message" id="cinematic-message">
    <p>Cet univers porte un nom.</p>
    <h2>MALISSIA</h2>
  </div>
`

// SCÈNE 3D
const scene = new THREE.Scene()
scene.background = new THREE.Color('#030817')

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
)

camera.position.set(0, 0, 35)

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
})

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.domElement.className = 'space-canvas'

app.prepend(renderer.domElement)

// ÉTOILES
const starCount = 5000
const positions = new Float32Array(starCount * 3)
const colors = new Float32Array(starCount * 3)

for (let i = 0; i < starCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 180
  positions[i * 3 + 1] = (Math.random() - 0.5) * 110
  positions[i * 3 + 2] = (Math.random() - 0.5) * 180

  const blue = Math.random()

  colors[i * 3] = 0.65 + blue * 0.3
  colors[i * 3 + 1] = 0.75 + blue * 0.2
  colors[i * 3 + 2] = 1
}

const starGeometry = new THREE.BufferGeometry()

starGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
)

starGeometry.setAttribute(
  'color',
  new THREE.BufferAttribute(colors, 3)
)

const starMaterial = new THREE.PointsMaterial({
  size: 0.16,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  sizeAttenuation: true
})

const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars)

// POUSSIÈRE COSMIQUE
const dustCount = 1800
const dustPositions = new Float32Array(dustCount * 3)

for (let i = 0; i < dustCount; i++) {
  dustPositions[i * 3] = (Math.random() - 0.5) * 90
  dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 65
  dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 90
}

const dustGeometry = new THREE.BufferGeometry()

dustGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(dustPositions, 3)
)

const dustMaterial = new THREE.PointsMaterial({
  color: '#7daeff',
  size: 0.09,
  transparent: true,
  opacity: 0.55
})

const dust = new THREE.Points(dustGeometry, dustMaterial)
scene.add(dust)

// NÉBULEUSES
function createNebula(color, x, y, z, size) {
  const geometry = new THREE.SphereGeometry(size, 32, 32)

  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.055,
    side: THREE.BackSide,
    depthWrite: false
  })

  const nebula = new THREE.Mesh(geometry, material)
  nebula.position.set(x, y, z)
  scene.add(nebula)

  return nebula
}

const nebulae = [
  createNebula('#1456bd', -28, 8, -35, 18),
  createNebula('#2754a8', 25, -12, -45, 22),
  createNebula('#4169ce', 0, 20, -65, 25)
]

// LUMIÈRES
scene.add(new THREE.AmbientLight('#9bbcff', 1.5))

// ÉTOILES FILANTES
const shootingStars = []

function createShootingStar() {
  const geometry = new THREE.BufferGeometry()

  const start = new THREE.Vector3(
    (Math.random() - 0.5) * 70,
    20 + Math.random() * 20,
    -20 - Math.random() * 40
  )

  const end = start.clone().add(
    new THREE.Vector3(-12, -9, 0)
  )

  geometry.setFromPoints([start, end])

  const material = new THREE.LineBasicMaterial({
    color: '#b9d9ff',
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

// INTRODUCTION
const welcome = document.querySelector('.welcome-content')
const startButton = document.querySelector('#start-button')
const cinematicMessage = document.querySelector('#cinematic-message')

let journeyStarted = false

startButton.addEventListener('click', () => {
  if (journeyStarted) return
  journeyStarted = true

  welcome.style.transition = 'opacity 1.5s ease, transform 1.5s ease'
  welcome.style.opacity = '0'
  welcome.style.transform = 'scale(1.15)'

  setTimeout(() => {
    welcome.style.display = 'none'
    cinematicMessage.classList.add('visible')

    camera.position.set(0, 0, 35)

    setTimeout(() => {
      cinematicMessage.classList.remove('visible')
    }, 5000)
  }, 1600)
})

// ANIMATION
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)

  const elapsed = clock.getElapsedTime()

  stars.rotation.y += 0.00012
  stars.rotation.x += 0.00003

  dust.rotation.y -= 0.0002
  dust.rotation.x += 0.0001

  nebulae.forEach((nebula, index) => {
    nebula.rotation.y += 0.0002 * (index + 1)
    nebula.rotation.x += 0.0001
  })

  if (Math.random() < 0.008 && shootingStars.length < 3) {
    createShootingStar()
  }

  updateShootingStars()

  if (journeyStarted) {
    camera.position.z = 35 - Math.min(elapsed * 0.15, 8)
  }

  renderer.render(scene, camera)
}

animate()

// ADAPTATION AUX ÉCRANS
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
})
