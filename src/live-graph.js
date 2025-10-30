import {html, svg} from 'nimble-html'
// TODO we don't need the whole Lume and D3 libs. Upgrade to a tree-shaken bundle later as optimization.
import * as d3 from 'd3'
import 'lume'
import {DopeElement} from './DopeElement.js'
/** @import { Element3D } from 'lume' */

// preload data (for simplicity)
const response = await fetch('./src/data.json')
const graphData = await response.json()

const svgMode = false

const nodeDiamsSecondary = [20, 30, 40]
const nodeDiamPrimary = 80

const perspective = 300
const maxNodeDepth = 100

const limeGreenish = '#41f28b'
const darkGray = '#333333'

/**
 * @type {boolean} - Whether to enable the exclusion zone (empty space) in the center of the view.
 */
const exclusionZoneEnabled = true

export class LiveGraph extends DopeElement {
	data = graphData

	initializeGraph() {
		if (!this.isConnected) return

		// Get SVG and container elements from the declarative template
		const svgElement = this.shadowRoot?.querySelector('svg')
		if (!svgElement) {
			console.error('SVG element not found')
			return
		}

		// Copy data to avoid mutation of original, and add x,y,z properties for D3 force simulation
		const links = this.data.links.map(d => ({...d}))
		const nodes = this.data.nodes.map(d => {
			// Static nodes keep their fixed positions, others get random positions
			if (d.group === 'static') {
				return {...d, z: 0} // Static nodes at z=0
			} else {
				// Pre-calculate Z depth: secondary nodes get random depth, primary nodes stay at z=0
				const z = d.group === 'secondary' ? (Math.random() * -maxNodeDepth) | 0 : 0
				return {...d, x: Math.random() * 400 - 200, y: Math.random() * 400 - 200, z}
			}
		})

		// Create the force simulation with D3.
		const simulation = d3
			.forceSimulation(nodes)
			.force(
				'link',
				d3
					.forceLink(links)
					.id(d => /** @type {any} */ (d).id)
					.distance(80), // Increase link distance from default ~30 to 80
			)
			// Repulsion of static nodes to create a central exclusion zone
			.force(
				'charge',
				d3.forceManyBody().strength(d => {
					const node = /** @type {any} */ (d)
					if (node.group === 'static') {
						// Reduced repulsion for smaller static island
						if (node.id === 'static_center') {
							return -400 - node.radius * 6 // Center node: moderate repulsion to clear stragglers
						} else if (node.id === 'static_top' || node.id === 'static_bottom') {
							return -120 - node.radius * 3 // Weaker vertical repulsion
						} else if (node.id === 'static_left' || node.id === 'static_right') {
							return -300 - node.radius * 5 // Reduced horizontal repulsion
						} else {
							return -200 - node.radius * 4 // Diagonal nodes: reduced repulsion
						}
					}
					return -250
				}),
			)
			.force('x', d3.forceX(0).strength(0.1)) // Horizontal centering
			.force('y', d3.forceY(0).strength(0.05))
			// Adjust alpha and velocity decay for continuous subtle motion
			.alphaTarget(1)
			.alphaDecay(0)
			.velocityDecay(0.6)

		// Select the declaratively created link and node groups
		const linksElement = this.shadowRoot?.querySelector('.links')
		const nodesElement = this.shadowRoot?.querySelector('.nodes')
		const lumeContainerEl = this.shadowRoot?.querySelector('#lume-container')

		if (!linksElement || !nodesElement) throw new Error('Link or node groups not found')
		if (!lumeContainerEl) throw new Error('Lume container not found')

		const linkGroup = d3.select(linksElement)
		const nodeGroup = d3.select(nodesElement)
		const lumeContainer = d3.select(lumeContainerEl)

		// Bind to existing declaratively created SVG elements
		const link = linkGroup.selectAll('.svgLink').data(links)
		const node = nodeGroup
			.selectAll('.svgNode')
			.data(nodes)
			.call(/** @type {any} */ (d3.drag()).on('start', dragstarted).on('drag', dragged).on('end', dragended))

		// Bind to existing declaratively created Lume elements
		const lumeLink = lumeContainer.selectAll('.lumeLink').data(links)
		const lumeNode = lumeContainer
			.selectAll('.lumeNode')
			.data(nodes)
			.call(/** @type {any} */ (d3.drag()).on('start', dragstarted).on('drag', dragged).on('end', dragended))

		// Set the position attributes on each tick of the simulation
		simulation.on('tick', () => {
			link
				.attr('x1', d => /** @type {any} */ (d.source).x)
				.attr('y1', d => /** @type {any} */ (d.source).y)
				.attr('x2', d => /** @type {any} */ (d.target).x)
				.attr('y2', d => /** @type {any} */ (d.target).y)

			node.attr('cx', d => d.x).attr('cy', d => d.y)

			// Use pre-calculated Z depth for both nodes and their connecting links
			lumeLink.attr(
				'points',
				d => `${d.source.x} ${d.source.y} ${d.source.z} ${d.target.x} ${d.target.y} ${d.target.z}`,
			)

			lumeNode.attr('position', d => `${d.x} ${d.y} ${d.z}`)
		})

		// Drag functions
		function dragstarted(/** @type {any} */ event) {
			if (!event.active) simulation.alphaTarget(0.3).restart()
			event.subject.fx = event.subject.x
			event.subject.fy = event.subject.y
		}

		function dragged(/** @type {any} */ event) {
			event.subject.fx = event.x
			event.subject.fy = event.y
		}

		function dragended(/** @type {any} */ event) {
			if (!event.active) simulation.alphaTarget(0)
			event.subject.fx = null
			event.subject.fy = null
		}

		const light = this.shadowRoot?.querySelector('lume-point-light')
		if (!light) throw new Error('Lume point light not found')

		light.position = (x, y, z, t, dt) => [400 * Math.sin(t * 0.001), 400 * Math.cos(t * 0.001), z]

		// Update template on window resize to maintain consistent scale
		window.addEventListener('resize', () => this.update(), {signal: this.disconnectSignal})

		// Move proximityTarget nodes closer to the current pointer position on X/Y based on a sine wave of the distance.
		document.addEventListener(
			'pointermove',
			e => {
				const nodes = /** @type {NodeListOf<Element3D>} */ (this.shadowRoot?.querySelectorAll('.lumeNode'))

				for (const node of nodes) {
					if (node.dataset.group !== 'primary') continue // only affect primary nodes

					const proximityTarget = /** @type {Element3D} */ (node.querySelector('.pointerProximityTarget'))

					// The distance at which the node starts reacting to pointer proximity.
					const threshold = 400
					// The smaller, the less the node moves toward the pointer once the pointer is within threshold.
					const attraction = 0.25

					// Node positions are from the center of the screen, while pointer events are from top-left.
					const distanceX = node.position.x + window.innerWidth / 2 - e.clientX
					const distanceY = node.position.y + window.innerHeight / 2 - e.clientY
					const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

					// if (i === 0) console.log('---', e.clientX, node.position.x, distanceX)

					if (distance < threshold) {
						// When the pointer gets within threshold, the proximityTarget
						// element moves towards the pointer on the first half
						// of the threshold distance, then moves back to center
						// on the second half, limited by the actual distance
						// (or less depending on attraction).
						const sineWaveX = ((threshold - distance) / threshold) * Math.PI
						const offset = Math.sin(sineWaveX) * distance * attraction
						const offsetX = (distanceX / distance) * offset
						const offsetY = (distanceY / distance) * offset
						proximityTarget.position = [-offsetX, -offsetY, 0]
					} else {
						// Reset to original depth
						proximityTarget.position = [0, 0, 0]
					}
				}
			},
			{signal: this.disconnectSignal},
		)

		const proximityNodes = /** @type {NodeListOf<Element3D>} */ (this.shadowRoot?.querySelectorAll('.proximityNode'))
		const proximityTargets = /** @type {NodeListOf<Element3D>} */ (
			this.shadowRoot?.querySelectorAll('.pointerProximityTarget')
		)

		requestAnimationFrame(function animate(time) {
			for (const [i, proximityNode] of proximityNodes.entries()) {
				const proximityTarget = proximityTargets[i]

				// lerp towards the respective proximity target
				proximityNode.position = [
					proximityNode.position.x + (proximityTarget.position.x - proximityNode.position.x) * 0.02,
					proximityNode.position.y + (proximityTarget.position.y - proximityNode.position.y) * 0.02,
					proximityNode.position.z + (proximityTarget.position.z - proximityNode.position.z) * 0.02,
				]
			}

			requestAnimationFrame(animate)
		})
	}

	connectedCallback() {
		super.connectedCallback()

		// Wait for the template to be rendered before initializing the graph.
		queueMicrotask(() => this.initializeGraph())
	}

	template() {
		// Calculate viewBox to match window dimensions at consistent scale
		const width = window.innerWidth
		const height = window.innerHeight
		const viewX = -width / 2
		const viewY = -height / 2

		return html`
			<div style="width: 100%; height: 100%;">
				<svg width="${width}" height="${height}" viewBox="${viewX} ${viewY} ${width} ${height}">
					<g class="links">
						${this.data
							? this.data.links.map(
									link => svg`
										<line
											class="svgLink"
											data-value="${link.value}"
											stroke="#999"
											stroke-opacity="0.6"
											stroke-width="${Math.sqrt(link.value)}"
										></line>
									`,
								)
							: ''}
					</g>

					<g class="nodes">
						${this.data
							? this.data.nodes.map(node => {
									const radius =
										String(node.group) === 'static'
											? node.radius
											: String(node.group) === 'secondary'
												? nodeDiamsSecondary[(Math.random() * nodeDiamsSecondary.length) | 0] / 2
												: nodeDiamPrimary / 2
									const color =
										String(node.group) === 'static'
											? '#333333'
											: String(node.group) === 'secondary'
												? '#1f77b4'
												: '#ff7f0e'
									const stroke = String(node.group) === 'static' ? '#000000' : '#fff'
									const strokeWidth = String(node.group) === 'static' ? '3' : '1.5'

									return svg`
										<circle
											class="svgNode"
											r=${radius}
											data-id="${node.id}"
											data-group="${node.group}"
											fill="${color}"
											stroke="${stroke}"
											stroke-width="${strokeWidth}"
										>
											<title>${node.id}</title>
										</circle>
									`
								})
							: ''}
					</g>
				</svg>
			</div>

			<div id="lume-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
				<lume-scene
					perspective=${perspective}
					webgl
					fog-mode="linear"
					fog-color="white"
					fog-near=${perspective - maxNodeDepth * 0.1}
					fog-far=${perspective + maxNodeDepth * 1.2}
				>
					<lume-ambient-light intensity="0.5"></lume-ambient-light>

					<lume-element3d
						.visible=${svgMode ? false : true}
						align-point="0.5 0.5"
						size-mode="proportional proportional"
						size="1 1"
					>
						<!-- Any lume content in here with position="0 0 0" (the default) is in the center of the screen. -->

						<lume-camera-rig
							min-vertical-angle="0"
							max-vertical-angle="0"
							min-horizontal-angle="0"
							max-horizontal-angle="0"
						></lume-camera-rig>

						<lume-point-light position="0 0 200" intensity="2000" color="royalblue">
							<lume-sphere
								visible="false"
								size="30 30 30"
								mount-point="0.5 0.5 0.5"
								cast-shadow="false"
								has="basic-material"
								color="yellow"
							></lume-sphere>
						</lume-point-light>

						<!-- For each link in the graph, create a lume-line to
						connect the two nodes. Every three numbers in the points
						attribute represent a point in 3D space. With the force
						graph we only set X and Y values.
						-->
						${this.data
							? this.data.links.map(
									link => html`
										<lume-line
											class="lumeLink"
											data-value="${link.value}"
											color="black"
											opacity="0"
											points="0 0 0 50 50 0"
										></lume-line>
									`,
								)
							: ''}

						<!-- for each node in the graph, create a lume-rounded-rectangle -->
						${this.data
							? this.data.nodes.map((node, i) => {
									const randomSizePick = (Math.random() * nodeDiamsSecondary.length) | 0
									const diameter =
										String(node.group) === 'static'
											? node.radius * 2
											: String(node.group) === 'secondary'
												? nodeDiamsSecondary[randomSizePick]
												: nodeDiamPrimary

									const color =
										String(node.group) === 'static'
											? darkGray
											: // String(node.group) === 'secondary'
												// 	? '#1f77b4'
												// 	: '#ff7f0e'
												limeGreenish

									return html`
										<lume-rounded-rectangle
											class="lumeNode"
											has="basic-material"
											mount-point="0.5 0.5"
											.size="${[diameter, diameter]}"
											.cornerRadius="${diameter / 2}"
											thickness="0.1"
											quadratic-corners="false"
											data-id="${node.id}"
											data-group="${node.group}"
											.color="${color}"
											xcolor="white"
											receive-shadow="false"
											xopacity="${String(node.group) === 'static' ? '0' : '1'}"
											opacity="0"
										>
											<lume-rounded-rectangle
												class="proximityNode"
												has="basic-material"
												mount-point="0.5 0.5"
												align-point="0.5 0.5"
												.size="${Array(2).fill(diameter * 0.6)}"
												.cornerRadius="${(diameter * 0.6) / 2}"
												thickness="0.1"
												quadratic-corners="false"
												color="cornflowerblue"
												receive-shadow="false"
												opacity="${String(node.group) === 'static' ? '0' : '1'}"
											></lume-rounded-rectangle>

											<lume-element3d class="pointerProximityTarget" align-point="0.5 0.5"></lume-element3d>
										</lume-rounded-rectangle>
									`
								})
							: ''}
					</lume-element3d>
				</lume-scene>
			</div>

			<h1>Hello</h1>

			<style>
				:host {
					display: block;
					width: 100%;
					height: 100vh;
					background: white;
				}

				h1 {
					margin: 0;
					position: absolute;
					transform: translate(-50%, -50%);
					top: 50%;
					left: 50%;
					/* A good cross-platform sans-serif default: */
					font-family:
					/* macOS 10.11+ */
						-apple-system,
						BlinkMacSystemFont,
						/* Windows */ 'Segoe UI',
						/* Android */ Roboto,
						/* Linux */ Oxygen,
						Ubuntu,
						Cantarell,
						/* Generic */ 'Open Sans',
						'Helvetica Neue',
						sans-serif;
					/* pink */
					color: #ff73b9;
					font-size: 60px;
				}

				svg {
					display: block;
					display: ${svgMode ? 'block' : 'none'};
					width: 100%;
					height: 100%;
				}

				.nodes circle {
					cursor: pointer;
				}

				#lume-container,
				#lume-container * {
					pointer-events: ${svgMode ? 'none' : 'auto'};
				}
			</style>
		`
	}
}

customElements.define('live-graph', LiveGraph)
