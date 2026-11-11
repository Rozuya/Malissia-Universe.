
import * as THREE from 'three'
import './style.css'

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

      <button id="start-button">
        Commencer le voyage
      </button>

      <p class="signature">
        Un univers imaginé spécialement pour toi, par Yanis.
      </p>
    </div>
  </main>
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

camera.position.set(0, 0, 30)

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
})

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.domElement.className = 'space-canvas'

app.prepend(renderer.domElement)

// ÉTOILES
const starCount = 5000
const positions = new Float32Array(starCount * 3)

for (let i = 0; i < starCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 180
  positions[i * 3 + 1] = (Math.random() - 0.5) * 100
  positions[i * 3 + 2] = (Math.random() - 0.5) * 180
}

const starGeometry = new THREE.BufferGeometry()

starGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
)

const starMaterial = new THREE.PointsMaterial({
  color: '#d8eaff',
  size: 0.12,
  transparent: true,
  opacity: 0.85,
  sizeAttenuation: true
})

const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars)

// LUMIÈRE
const ambientLight = new THREE.AmbientLight('#9bbcff', 1.2)
scene.add(ambientLight)

// ANIMATION
function animate() {
  requestAnimationFrame(animate)

  stars.rotation.y += 0.00015
  stars.rotation.x += 0.00004

  renderer.render(scene, camera)
}

animate()

// BOUTON DE DÉMARRAGE
document.querySelector('#start-button').addEventListener('click', () => {
  document.querySelector('.welcome-content').style.opacity = '0'
  document.querySelector('.welcome-content').style.transition = 'opacity 1s ease'
})

// ADAPTATION AUX ÉCRANS
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
