import './style.css'
import * as THREE from 'three'
import LocomotiveScroll from 'locomotive-scroll'
import gsap from 'gsap'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

const locomotiveScroll = new LocomotiveScroll({
  el: document.querySelector('[data-scroll-container]'),
  smooth: true,
  lerp: 0.07
})

const scene = new THREE.Scene()

const distance = 60
let fov = 2 * Math.atan((window.innerHeight / 2) / distance) * (180 / Math.PI)

const camera = new THREE.PerspectiveCamera(
  fov,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)

camera.position.z = distance

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
  alpha: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

const targetMouse = new THREE.Vector2(0.5, 0.5)
const currentMouse = new THREE.Vector2(0.5, 0.5)

const images = document.querySelectorAll('img')
const planes = []

images.forEach((img) => {
  const bounds = img.getBoundingClientRect()
  const texture = new THREE.TextureLoader().load(img.src)

  const geometry = new THREE.PlaneGeometry(bounds.width, bounds.height)

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 }
    },
    vertexShader,
    fragmentShader
  })

  const plane = new THREE.Mesh(geometry, material)

  plane.position.set(
    bounds.left + bounds.width / 2 - window.innerWidth / 2,
    -(bounds.top + bounds.height / 2 - window.innerHeight / 2),
    0
  )

  planes.push(plane)
  scene.add(plane)
})

function updatePlanesPosition() {
  planes.forEach((plane, index) => {
    const bounds = images[index].getBoundingClientRect()
    plane.position.set(
      bounds.left + bounds.width / 2 - window.innerWidth / 2,
      -(bounds.top + bounds.height / 2 - window.innerHeight / 2),
      0
    )
  })
}

window.addEventListener('mousemove', (event) => {

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(planes)

  planes.forEach(plane => {
    gsap.to(plane.material.uniforms.uHover, {
      value: 0,
      duration: 0.3,
      ease: "power3.out"
    })
  })

  if (intersects.length > 0) {
    const uv = intersects[0].uv

    targetMouse.set(uv.x, uv.y)

    gsap.to(intersects[0].object.material.uniforms.uHover, {
      value: 1,
      duration: 0.3,
      ease: "power3.out"
    })
  }
})

function animate() {

  currentMouse.lerp(targetMouse, 0.08)

  planes.forEach(plane => {
    plane.material.uniforms.uMouse.value.copy(currentMouse)
  })

  updatePlanesPosition()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

animate()

window.addEventListener('resize', () => {

  fov = 2 * Math.atan((window.innerHeight / 2) / distance) * (180 / Math.PI)

  camera.fov = fov
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)

  updatePlanesPosition()
})


// Loader
const isMobile = window.innerWidth < 768;

  const desktopLoader = document.querySelector(".loader-desktop");
  const mobileLoader = document.querySelector(".loader-mobile");

  // Remove the unused version
  if (isMobile) {
    desktopLoader.remove();
  } else {
    mobileLoader.remove();
  }

  // Animate loader content
  const content = isMobile 
    ? document.querySelector(".loader-mobile h1")
    : document.querySelector(".loader-desktop img");

  gsap.from(content, {
    y: 100,
    opacity: 0,
    duration: 1,
    ease: "power3.out"
  });

  // Animate timer
  let counter = { value: 0 };

  gsap.to(counter, {
    value: 100,
    duration: 2.5,
    ease: "power1.out",
    onUpdate: () => {
      document.getElementById("loader-timer-number").textContent = 
        Math.floor(counter.value);
    },
    onComplete: () => {
      gsap.to("#loader", {
        y: "-100%",
        duration: 1,
        ease: "power4.inOut"
      });
    }
  });