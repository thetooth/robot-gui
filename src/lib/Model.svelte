<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { dro, teachPath, controls } from './store'

	import * as THREE from 'three'
	import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

	let resized = true
	let id = null
	let canvas = null
	let renderer = null
	let camera = null
	let scene = null
	let model = null

	const sizes = {
		width: window.innerWidth,
		height: window.innerHeight
	}

	const loader = new GLTFLoader().setPath('models/')

	function createPointer() {
		const geometry = new THREE.SphereGeometry(15, 32, 16)
		const material = new THREE.MeshBasicMaterial({
			color: 0x42be65
		})
		const sphere = new THREE.Mesh(geometry, material)
		sphere.name = 'pointer'
		scene.add(sphere)
	}

	function createWaypoint() {
		const MAX_POINTS = 5000
		const geometry = new THREE.BufferGeometry()
		const positions = new Float32Array(MAX_POINTS * 3) // 3 vertices per point
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
		const material = new THREE.LineBasicMaterial({
			color: 0x0f62fe,
			linewidth: 8
		})
		const line = new THREE.Line(geometry, material)
		line.name = 'path'
		scene.add(line)
	}

	function loadModel() {
		loader.load(
			'bot.gltf',
			function (geometry) {
				console.log(geometry.scene.getObjectByName('Root'))
				model = geometry.scene.getObjectByName('Root').getObjectByName('scara_bot_rev4')
				model.scale.set(1000, 1000, 1000)
				model.translateZ(200)
				model.translateY(-100)
				model.rotateY((180 * Math.PI) / 180)
				scene.add(model)
				console.log(model)
			},

			function (xhr) {
				console.log('Model ' + (xhr.loaded / xhr.total) * 100 + '% loaded')
			},

			function (error) {
				console.log('An error happened ' + error)
			}
		)
	}

	function createLights() {
		const ambientLight = new THREE.AmbientLight(0xffffff, 1.5) // soft white light
		scene.add(ambientLight)
		// White directional light at half intensity shining from the top.
		const directionalLight = new THREE.DirectionalLight(0xffffcc, 1)
		//@ts-ignore
		directionalLight.position.set(1, 1, -1)
		scene.add(directionalLight)
		const hemisphereLight = new THREE.HemisphereLight(0x7444ff, 0x7444ff, 0.5)
		scene.add(hemisphereLight)
		const pointLight = new THREE.PointLight(0xedf5ff, 30000, 1000 * 1000)
		//@ts-ignore
		pointLight.position.set(0, -50, -600)
		scene.add(pointLight)
	}

	function createCamera() {
		camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
		camera.position.y = 600
		camera.position.z = -190
		scene.add(camera)
	}

	function setupRenderer() {
		// Renderer
		renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			alpha: true,
			antialias: true
		})
		// renderer.setSize(sizes.width, sizes.height);
		resize()
		window.addEventListener('resize', () => {
			resized = true
		})
		const controls = new OrbitControls(camera, canvas)
		controls.enableDamping = true
		controls.target = new THREE.Vector3(0, 0, -200)
		// controls.position0 = new THREE.Vector3(220, 600, -190)
		const clock = new THREE.Clock()
		let previousTime = 0
		const tick = () => {
			const elapsedTime = clock.getElapsedTime()
			const deltaTime = elapsedTime - previousTime
			previousTime = elapsedTime
			if (resized) {
				resize()
			}

			// Update controls
			controls.update()
			renderer.render(scene, camera)
			id = window.requestAnimationFrame(tick)
		}
		tick()
	}

	function resize() {
		resized = false
		var rect = renderer.domElement.parentNode.getBoundingClientRect()
		sizes.width = rect.width
		sizes.height = rect.height

		// Update camera
		camera.aspect = sizes.width / sizes.height
		camera.updateProjectionMatrix()

		// Update renderer
		renderer.setSize(sizes.width, sizes.height)
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	}

	let droUnsubscribe = null
	let teachPathUnsubscribe = null
	let controlsUnsubscribe = null

	onMount(async () => {
		console.log('Model is mounted')

		canvas = document.querySelector('canvas.webgl')
		scene = new THREE.Scene()

		loadModel()
		createPointer()
		createWaypoint()
		createLights()
		createCamera()
		setupRenderer()

		droUnsubscribe = dro.subscribe((dro) => {
			if (model != null) {
				let a1Name = 'A1^scara_bot_rev4-1'
				model.getObjectByName(a1Name).translateZ(0.2)
				model.getObjectByName(a1Name).rotation.y = ((dro.pose.alpha - 90) * Math.PI) / 180
				model.getObjectByName(a1Name).translateZ(-0.2)
				let a2Name = 'A2^scara_bot_rev4-1'
				model.getObjectByName(a2Name).translateZ(0.4)
				model.getObjectByName(a2Name).rotation.y = ((dro.pose.beta - 0) * Math.PI) / 180
				model.getObjectByName(a2Name).translateZ(-0.4)
				let gripperName = 'RSSY1616Shaft^scara_bot_rev4-1'
				model.getObjectByName(gripperName).position.y = -((dro.pose.z - 400) / 1000.0)
				model.getObjectByName(gripperName).rotation.z = ((dro.pose.phi - 7) * Math.PI) / 180
			}
		})

		controlsUnsubscribe = controls.subscribe((controls) => {
			let pointer = scene.getObjectByName('pointer')
			if (pointer) {
				pointer.position.set(controls.x, -controls.z, -controls.y)
			}
		})

		teachPathUnsubscribe = teachPath.subscribe((path) => {
			if (path.length > 0) {
				let line = scene.getObjectByName('path')
				let positionAttribute = line.geometry.getAttribute('position')
				path.forEach(function (pose, i) {
					positionAttribute.setXYZ(i, pose.x, -pose.z, -pose.y)
				})
				line.geometry.setDrawRange(0, path.length)
				line.geometry.computeBoundingBox()
				line.geometry.computeBoundingSphere()
				positionAttribute.needsUpdate = true
			}
		})
	})

	onDestroy(async () => {
		droUnsubscribe()
		teachPathUnsubscribe()
		controlsUnsubscribe()

		window.cancelAnimationFrame(id)
		scene.clear()
		scene = null
		renderer.dispose()
		renderer = null

		console.log('Model is destroyed')
	})
</script>

<div class="webgl-container">
	<canvas class="webgl"></canvas>
</div>

<style>
	.webgl-container {
		/* height: calc(100vh - 8rem); */
		margin-top: -3rem;
		margin-bottom: -3rem;
		margin-right: -2rem;
		width: auto;
		height: calc(100vh - 2rem);
		max-height: 100vh;
		overflow: hidden;
		background-color: #dbdbdb;
	}
</style>
