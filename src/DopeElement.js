import {html} from 'nimble-html'

/**
 * A simple base class for custom elements that makes it simple to write custom
 * elements with declarative templates using the `html` template tag function.
 */
export class DopeElement extends HTMLElement {
	constructor() {
		super()

		this.attachShadow({mode: 'open'})
		queueMicrotask(() => this.shadowRoot?.append(...this.template()(this)))
	}

	/**
	 * Call this method to update the element's DOM based on its template.
	 */
	update() {
		this.template()(this)
	}

	/**
	 * Subclasses can override this to specify their own template.
	 * @returns {ReturnType<typeof html>}
	 */
	template() {
		return html`<slot></slot>`
	}
}
