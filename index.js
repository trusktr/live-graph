import {html} from 'nimble-html'
import {DopeElement} from './src/DopeElement.js'

// This could be optimized, we don't need the entire d3 library
import * as d3 from 'd3'

console.log(d3)

class LiveGraph extends DopeElement {
	connectedCallback() {
		// Wait for the template to be rendered before initializing the graph
		// Use multiple microtasks to ensure DOM is fully ready
		queueMicrotask(() => queueMicrotask(() => this.initializeGraph()))
	}

	// Load data from JSON file
	async loadData() {
		const response = await fetch('./src/data.json')
		return await response.json()
	}

	data = {
		nodes: [
			{id: 'Myriel', group: 1},
			{id: 'Napoleon', group: 1},
			{id: 'Mlle.Baptistine', group: 1},
			{id: 'Mme.Magloire', group: 1},
			{id: 'CountessdeLo', group: 1},
			{id: 'Geborand', group: 1},
			{id: 'Champtercier', group: 1},
			{id: 'Cravatte', group: 1},
			{id: 'Count', group: 1},
			{id: 'OldMan', group: 1},
			{id: 'Labarre', group: 2},
			{id: 'Valjean', group: 2},
			{id: 'Marguerite', group: 3},
			{id: 'Mme.deR', group: 2},
			{id: 'Isabeau', group: 2},
			{id: 'Gervais', group: 2},
			{id: 'Tholomyes', group: 3},
			{id: 'Listolier', group: 3},
			{id: 'Fameuil', group: 3},
			{id: 'Blacheville', group: 3},
			{id: 'Favourite', group: 3},
			{id: 'Dahlia', group: 3},
			{id: 'Zephine', group: 3},
			{id: 'Fantine', group: 3},
		],
		links: [
			{source: 'Napoleon', target: 'Myriel', value: 1},
			{source: 'Mlle.Baptistine', target: 'Myriel', value: 8},
			{source: 'Mme.Magloire', target: 'Myriel', value: 10},
			{source: 'Mme.Magloire', target: 'Mlle.Baptistine', value: 6},
			{source: 'CountessdeLo', target: 'Myriel', value: 1},
			{source: 'Geborand', target: 'Myriel', value: 1},
			{source: 'Champtercier', target: 'Myriel', value: 1},
			{source: 'Cravatte', target: 'Myriel', value: 1},
			{source: 'Count', target: 'Myriel', value: 2},
			{source: 'OldMan', target: 'Myriel', value: 1},
			{source: 'Valjean', target: 'Labarre', value: 1},
			{source: 'Valjean', target: 'Mme.Magloire', value: 3},
			{source: 'Valjean', target: 'Mlle.Baptistine', value: 3},
			{source: 'Valjean', target: 'Myriel', value: 5},
			{source: 'Marguerite', target: 'Valjean', value: 1},
			{source: 'Mme.deR', target: 'Valjean', value: 1},
			{source: 'Isabeau', target: 'Valjean', value: 1},
			{source: 'Gervais', target: 'Valjean', value: 1},
			{source: 'Listolier', target: 'Tholomyes', value: 4},
			{source: 'Fameuil', target: 'Tholomyes', value: 4},
			{source: 'Fameuil', target: 'Listolier', value: 4},
			{source: 'Blacheville', target: 'Tholomyes', value: 4},
			{source: 'Blacheville', target: 'Listolier', value: 4},
			{source: 'Blacheville', target: 'Fameuil', value: 4},
			{source: 'Favourite', target: 'Tholomyes', value: 3},
			{source: 'Favourite', target: 'Listolier', value: 3},
			{source: 'Favourite', target: 'Fameuil', value: 3},
			{source: 'Favourite', target: 'Blacheville', value: 4},
			{source: 'Dahlia', target: 'Tholomyes', value: 5},
			{source: 'Dahlia', target: 'Listolier', value: 4},
			{source: 'Dahlia', target: 'Fameuil', value: 4},
			{source: 'Dahlia', target: 'Blacheville', value: 4},
			{source: 'Dahlia', target: 'Favourite', value: 5},
			{source: 'Zephine', target: 'Tholomyes', value: 4},
			{source: 'Zephine', target: 'Listolier', value: 4},
			{source: 'Zephine', target: 'Fameuil', value: 4},
			{source: 'Zephine', target: 'Blacheville', value: 3},
			{source: 'Zephine', target: 'Favourite', value: 4},
			{source: 'Zephine', target: 'Dahlia', value: 4},
			{source: 'Fantine', target: 'Tholomyes', value: 3},
			{source: 'Fantine', target: 'Listolier', value: 3},
			{source: 'Fantine', target: 'Fameuil', value: 3},
			{source: 'Fantine', target: 'Blacheville', value: 1},
			{source: 'Fantine', target: 'Favourite', value: 3},
			{source: 'Fantine', target: 'Dahlia', value: 5},
			{source: 'Fantine', target: 'Zephine', value: 6},
		],
	}

	async initializeGraph() {
		// Get SVG and container elements from the declarative template
		const svgElement = this.shadowRoot?.querySelector('svg')
		if (!svgElement) {
			console.error('SVG element not found')
			return
		}

		// Load the actual dataset
		const graphData = await this.loadData()
		this.template()

		// Copy data to avoid mutation of original, and add x,y properties for D3 force simulation
		const links = graphData.links.map(d => ({...d}))
		const nodes = graphData.nodes.map(d => ({...d, x: Math.random() * 100 - 50, y: Math.random() * 100 - 50}))

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

		// Create and bind links
		const link = linkGroup
			.selectAll('line')
			.data(links)
			.enter()
			.append('line')
			.attr('stroke', '#999')
			.attr('stroke-opacity', 0.6)
			.attr('stroke-width', d => Math.sqrt(d.value))

		// Create and bind nodes
		const node = nodeGroup
			.selectAll('circle')
			.data(nodes)
			.enter()
			.append('circle')
			.attr('r', d => d.radius || 5)
			.attr('fill', d => (d.group === 'Citing Patents' ? '#1f77b4' : '#ff7f0e'))
			.attr('stroke', '#fff')
			.attr('stroke-width', 1.5)
			.call(/** @type {any} */ (d3.drag()).on('start', dragstarted).on('drag', dragged).on('end', dragended))

		// Add titles for tooltips
		node.append('title').text(d => d.id)

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

	template() {
		const html = String.raw

		const string = html`
			<svg width="928" height="680" viewBox="-92.8 -68 185.6 136">
				<g class="links"></g>
				<g class="nodes"></g>
			</svg>
			<style>
				:host {
					display: block;
					width: 100%;
					height: 100vh;
					background: #1f77b4;
				}

				svg {
					display: block;
					width: 100%;
					height: 100%;
					background: lightblue;
				}

				.nodes circle {
					fill: #1f77b4;
					stroke: #fff;
					stroke-width: 2;
					cursor: pointer;
				}

				.nodes circle[data-group='Cited Works'] {
					fill: #ff7f0e;
				}
				.nodes circle[data-group='Citing Patents'] {
					fill: #1f77b4;
				}

				.links line {
					stroke: #333;
					stroke-width: 2;
				}
			</style>
		`

		return () => {
			this.shadowRoot && (this.shadowRoot.innerHTML = string)
			return [new Text()]
		}
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
