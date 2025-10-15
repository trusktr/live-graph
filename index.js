import {html, svg} from 'nimble-html'
// TODO we don't need the whole Lume and D3 libs. Upgrade to a tree-shaken bundle later as optimization.
import 'lume'
import * as d3 from 'd3'
import {DopeElement} from './src/DopeElement.js'

const response = await fetch('./src/data.json')
const graphData = await response.json()

class LiveGraph extends DopeElement {
	resizeHandler = () => {
		if (this.data) {
			this.update()
		}
	}

	// Load data from JSON file
	async loadData() {
		const response = await fetch('./src/data.json')
		return await response.json()
	}

	data = graphData

	initializeGraph() {
		// Get SVG and container elements from the declarative template
		const svgElement = this.shadowRoot?.querySelector('svg')
		if (!svgElement) {
			console.error('SVG element not found')
			return
		}

		// Copy data to avoid mutation of original, and add x,y properties for D3 force simulation
		const links = this.data.links.map(d => ({...d}))
		const nodes = this.data.nodes.map(d => ({...d, x: Math.random() * 100 - 50, y: Math.random() * 100 - 50}))

		// Create the force simulation
		const simulation = d3
			.forceSimulation(nodes)
			.force(
				'link',
				d3.forceLink(links).id(d => /** @type {any} */ (d).id),
			)
			.force('charge', d3.forceManyBody())
			.force('x', d3.forceX())
			.force('y', d3.forceY())

		// Select the declaratively created link and node groups
		const linksElement = this.shadowRoot?.querySelector('.links')
		const nodesElement = this.shadowRoot?.querySelector('.nodes')

		if (!linksElement || !nodesElement) {
			console.error('Link or node groups not found')
			return
		}

		console.log('Found elements:', {
			links: linksElement.children.length,
			nodes: nodesElement.children.length,
		})

		const linkGroup = d3.select(linksElement)
		const nodeGroup = d3.select(nodesElement)

		// Bind to existing declaratively created elements
		const link = linkGroup.selectAll('line').data(links)
		const node = nodeGroup
			.selectAll('circle')
			.data(nodes)
			.call(/** @type {any} */ (d3.drag()).on('start', dragstarted).on('drag', dragged).on('end', dragended))

		console.log('Created elements:', {
			linkCount: link.size(),
			nodeCount: node.size(),
		})

		// Set the position attributes on each tick of the simulation
		simulation.on('tick', () => {
			link
				.attr('x1', d => /** @type {any} */ (d.source).x)
				.attr('y1', d => /** @type {any} */ (d.source).y)
				.attr('x2', d => /** @type {any} */ (d.target).x)
				.attr('y2', d => /** @type {any} */ (d.target).y)

			node.attr('cx', d => d.x).attr('cy', d => d.y)
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
	}

	connectedCallback() {
		// Wait for the template to be rendered before initializing the graph.
		queueMicrotask(() => this.initializeGraph())

		// Update template on window resize to maintain consistent scale
		window.addEventListener('resize', this.resizeHandler)
	}

	disconnectedCallback() {
		window.removeEventListener('resize', this.resizeHandler)
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
									link =>
										svg`<line
											data-value="${link.value}"
											stroke="#999"
											stroke-opacity="0.6"
											stroke-width="${Math.sqrt(link.value)}"
										></line>`,
								)
							: ''}
					</g>

					<g class="nodes">
						${this.data
							? this.data.nodes.map(
									node => svg`
										<circle
											r="5"
											data-id="${node.id}"
											data-group="${node.group}"
											fill="${String(node.group) === 'Citing Patents' ? '#1f77b4' : '#ff7f0e'}"
											stroke="#fff"
											stroke-width="1.5"
										>
											<title>${node.id}</title>
										</circle>
									`,
								)
							: ''}
					</g>
				</svg>
			</div>

			<style>
				:host {
					display: block;
					width: 100%;
					height: 100vh;
				}

				svg {
					display: block;
					width: 100%;
					height: 100%;
					background: lightblue;
				}

				.nodes circle {
					cursor: pointer;
				}
			</style>
		`
	}
}

customElements.define('live-graph', LiveGraph)

const topLevel = html`
	<style>
		html,
		body {
			margin: 0;
			height: 100%;
		}
	</style>

	<live-graph></live-graph>
`(Symbol())

document.body.append(...topLevel)
