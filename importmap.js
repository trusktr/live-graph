{
	const html = String.raw

	document.write(html`
		<script type="importmap">
			{
				"imports": {
					"d3": "./src/d3-to-esm.js",
					"xd3": "https://cdn.jsdelivr.net/npm/d3@7.9.0/src/index.js",
					"lume": "https://cdn.jsdelivr.net/npm/lume@0.3.0-alpha.46/dist/index.js",
					"nimble-html": "https://cdn.jsdelivr.net/npm/nimble-html@0.1.0/html.js"
				},
				"scopes": {
					"https://cdn.jsdelivr.net/": {
						"@lume/autolayout": "https://cdn.jsdelivr.net/npm/@lume/autolayout@0.10.2/dist/AutoLayout.js",
						"@lume/custom-attributes/dist/index.js": "https://cdn.jsdelivr.net/npm/@lume/custom-attributes@0.2.4/dist/index.js",
						"@lume/element": "https://cdn.jsdelivr.net/npm/@lume/element@0.16.2/dist/index.js",
						"@lume/eventful": "https://cdn.jsdelivr.net/npm/@lume/eventful@0.3.3/dist/index.js",
						"@lume/kiwi": "https://cdn.jsdelivr.net/npm/@lume/kiwi@0.4.4/dist/kiwi.js",
						"@lume/three-projected-material/dist/ProjectedMaterial.js": "https://cdn.jsdelivr.net/npm/@lume/three-projected-material@0.3.1/dist/ProjectedMaterial.js",
						"classy-solid": "https://cdn.jsdelivr.net/npm/classy-solid@0.4.3/dist/index.js",
						"element-behaviors": "https://cdn.jsdelivr.net/npm/element-behaviors@5.0.5/dist/index.js",
						"james-bond": "https://cdn.jsdelivr.net/npm/james-bond@0.7.4/dist/index.js",
						"lowclass/dist/": "https://cdn.jsdelivr.net/npm/lowclass@8.0.2/dist/",
						"regexr": "https://cdn.jsdelivr.net/npm/regexr@2.0.4/dist/index.js",
						"solid-js": "https://cdn.jsdelivr.net/npm/solid-js@1.9.9/dist/solid.js",
						"solid-js/html": "https://cdn.jsdelivr.net/npm/solid-js@1.9.9/html/dist/html.js",
						"solid-js/store": "https://cdn.jsdelivr.net/npm/solid-js@1.9.9/store/dist/store.js",
						"solid-js/web": "https://cdn.jsdelivr.net/npm/solid-js@1.9.9/web/dist/web.js",
						"three": "https://cdn.jsdelivr.net/npm/three@0.180.0/src/Three.js",
						"three/": "https://cdn.jsdelivr.net/npm/three@0.180.0/",

						"d3-array": "https://cdn.jsdelivr.net/npm/d3-array@3.2.4/src/index.js",
						"d3-axis": "https://cdn.jsdelivr.net/npm/d3-axis@3.0.0/src/index.js",
						"d3-brush": "https://cdn.jsdelivr.net/npm/d3-brush@3.0.0/src/index.js",
						"d3-chord": "https://cdn.jsdelivr.net/npm/d3-chord@3.0.1/src/index.js",
						"d3-color": "https://cdn.jsdelivr.net/npm/d3-color@3.1.0/src/index.js",
						"d3-contour": "https://cdn.jsdelivr.net/npm/d3-contour@4.0.2/src/index.js",
						"d3-delaunay": "https://cdn.jsdelivr.net/npm/d3-delaunay@6.0.4/src/index.js",
						"d3-dispatch": "https://cdn.jsdelivr.net/npm/d3-dispatch@3.0.1/src/index.js",
						"d3-drag": "https://cdn.jsdelivr.net/npm/d3-drag@3.0.0/src/index.js",
						"d3-dsv": "https://cdn.jsdelivr.net/npm/d3-dsv@3.0.1/src/index.js",
						"d3-ease": "https://cdn.jsdelivr.net/npm/d3-ease@3.0.1/src/index.js",
						"d3-fetch": "https://cdn.jsdelivr.net/npm/d3-fetch@3.0.1/src/index.js",
						"d3-force": "https://cdn.jsdelivr.net/npm/d3-force@3.0.0/src/index.js",
						"d3-format": "https://cdn.jsdelivr.net/npm/d3-format@3.1.0/src/index.js",
						"d3-geo": "https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/src/index.js",
						"d3-hierarchy": "https://cdn.jsdelivr.net/npm/d3-hierarchy@3.1.2/src/index.js",
						"d3-interpolate": "https://cdn.jsdelivr.net/npm/d3-interpolate@3.0.1/src/index.js",
						"d3-path": "https://cdn.jsdelivr.net/npm/d3-path@3.1.0/src/index.js",
						"d3-polygon": "https://cdn.jsdelivr.net/npm/d3-polygon@3.0.1/src/index.js",
						"d3-quadtree": "https://cdn.jsdelivr.net/npm/d3-quadtree@3.0.1/src/index.js",
						"d3-random": "https://cdn.jsdelivr.net/npm/d3-random@3.0.1/src/index.js",
						"d3-scale": "https://cdn.jsdelivr.net/npm/d3-scale@4.0.2/src/index.js",
						"d3-scale-chromatic": "https://cdn.jsdelivr.net/npm/d3-scale-chromatic@3.1.0/src/index.js",
						"d3-selection": "https://cdn.jsdelivr.net/npm/d3-selection@3.0.0/src/index.js",
						"d3-shape": "https://cdn.jsdelivr.net/npm/d3-shape@3.2.0/src/index.js",
						"d3-time": "https://cdn.jsdelivr.net/npm/d3-time@3.1.0/src/index.js",
						"d3-time-format": "https://cdn.jsdelivr.net/npm/d3-time-format@4.1.0/src/index.js",
						"d3-timer": "https://cdn.jsdelivr.net/npm/d3-timer@3.0.1/src/index.js",
						"d3-transition": "https://cdn.jsdelivr.net/npm/d3-transition@3.0.1/src/index.js",
						"d3-zoom": "https://cdn.jsdelivr.net/npm/d3-zoom@3.0.0/src/index.js",
						"delaunator": "https://cdn.jsdelivr.net/npm/delaunator@5.0.1/index.js",
						"internmap": "https://cdn.jsdelivr.net/npm/internmap@2.0.3/src/index.js",
						"robust-predicates": "https://cdn.jsdelivr.net/npm/robust-predicates@3.0.2/index.js"
					}
				}
			}
		</script>
	`)
}
