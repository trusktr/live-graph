{
	const html = String.raw

	document.write(html`
		<script type="importmap">
			{
				"imports": {
					"d3": "./src/d3-to-esm.js",
					"nimble-html": "https://cdn.jsdelivr.net/npm/nimble-html@0.1.0/html.js"
				}
			}
		</script>
	`)
}
