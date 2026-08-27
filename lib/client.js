window.__ModuleLoader__.load({
	id: "@marecgents/dsh-hub",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
		//#endregion
		let react = require("react");
		let react_dom_client = require("react-dom/client");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react_dom = require("react-dom");
		//#region node_modules/clsx/dist/clsx.mjs
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region src/client/style.ts
		/**
		* Card styles — a fixed-classname stylesheet injected into the page by
		* {@link injectCardStyle}. Styling is deliberately NOT a CSS module: tsdown
		* extracts `.css` into a separate file the dsh client loader never fetches,
		* so the styles live as a string here, use the official `--dsw-alias-*`
		* design tokens, and carry a stable `mg-*` class prefix.
		*
		* The card mirrors the official PluginCard look (ui-settings-plugins) and
		* its field styles (fields.module.css): a collapsible header (name +
		* description + chevron), then the controls body with a save/discard footer.
		* Typography and geometry intentionally match the upstream DeepSeek Harness
		* plugin page rather than inventing a second visual system.
		*/
		/** Card class names — the single source the components and the stylesheet share. */
		const CARD_CSS_CLASSES = {
			card: "mg-card",
			cardOpen: "mg-card-open",
			header: "mg-card-header",
			headText: "mg-card-head-text",
			name: "mg-card-name",
			description: "mg-card-description",
			pending: "mg-card-pending",
			chevron: "mg-card-chevron",
			chevronOpen: "mg-card-chevron-open",
			body: "mg-card-body",
			readOnly: "mg-card-readonly",
			section: "mg-card-section",
			sectionTitle: "mg-card-section-title",
			field: "mg-card-field",
			fieldLabel: "mg-card-field-label",
			fieldRow: "mg-card-field-row",
			control: "mg-card-control",
			input: "mg-card-input",
			select: "mg-card-select",
			selectPill: "mg-card-select-pill",
			checkboxRow: "mg-card-checkbox-row",
			hint: "mg-card-hint",
			dangerHint: "mg-card-danger-hint",
			footer: "mg-card-footer",
			discard: "mg-card-discard",
			save: "mg-card-save",
			saving: "mg-card-saving",
			failed: "mg-card-failed",
			saved: "mg-card-saved",
			loading: "mg-card-loading",
			iconGrid: "mg-card-icon-grid",
			iconCell: "mg-card-icon-cell",
			iconSelected: "mg-card-icon-selected",
			iconPreview: "mg-card-icon-preview",
			iconName: "mg-card-icon-name",
			swatchDot: "mg-card-swatch-dot"
		};
		const css$2 = CARD_CSS_CLASSES;
		/** The stylesheet text (brand token fallbacks mirror the SPA boot page). */
		const STYLE_TEXT$3 = `
.${css$2.card} {
  list-style: none;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-3, #ffffff);
  transition: border-color 0.16s, background 0.16s;
}
.${css$2.card}:hover { border-color: var(--dsw-alias-label-dimmed, rgb(0 0 0 / 20%)); }
.${css$2.cardOpen} {
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  border-color: var(--dsw-alias-label-dimmed, rgb(0 0 0 / 20%));
}
.${css$2.header} {
  width: 100%;
  appearance: none;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
}
.${css$2.header}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: -2px;
}
.${css$2.headText} {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.${css$2.name} {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${css$2.description} {
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${css$2.pending} {
  flex: none;
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 11px;
  line-height: 17px;
  font-weight: 500;
  white-space: nowrap;
  background: var(--dsw-alias-bg-module-platform, #f5f6f7);
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${css$2.chevron} {
  flex: none;
  color: var(--dsw-alias-label-tertiary, #81858c);
  transition: transform 0.16s;
}
.${css$2.chevronOpen} { transform: rotate(180deg); }
.${css$2.body} {
  border-top: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  margin: 0 16px;
  padding-bottom: 8px;
}
.${css$2.readOnly} {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${css$2.section} { display: flex; flex-direction: column; }
.${css$2.sectionTitle} {
  margin: 0;
  padding: 8px 0 4px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${css$2.field} {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
}
.${css$2.field} + .${css$2.field} { border-top: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%)); }
/* Horizontal field row (official Setting-Cell style): label left, control right. */
.${css$2.fieldRow} {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
}
.${css$2.fieldRow} + .${css$2.field} { border-top: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%)); }
.${css$2.fieldLabel} {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary, #0f1115);
}
/* Selector pill for popup-menu fields (mirrors the theme select look, auto width). */
.${css$2.selectPill} {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: auto;
  min-width: 140px;
  box-sizing: border-box;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-3, #ffffff);
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary, #0f1115);
  cursor: pointer;
}
.${css$2.selectPill}:focus-visible {
  outline: none;
  border-color: var(--dsw-alias-brand-primary, #3964fe);
}
.${css$2.control} {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${css$2.input}, .${css$2.select} {
  width: 100%;
  box-sizing: border-box;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-3, #ffffff);
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${css$2.input}:focus-visible, .${css$2.select}:focus-visible {
  outline: none;
  border-color: var(--dsw-alias-brand-primary, #3964fe);
}
.${css$2.input}:disabled, .${css$2.select}:disabled {
  color: var(--dsw-alias-label-tertiary, #81858c);
  cursor: default;
}
/* The native dropdown list inherits the select's color but can paint a
 * light panel — under a dark theme that yields white-on-white options.
 * Pin both colors explicitly so the list reads correctly either way. */
.${css$2.select} option {
  color: var(--dsw-alias-label-primary, #0f1115);
  background: var(--dsw-alias-bg-layer-3, #ffffff);
}
.${css$2.checkboxRow} {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary, #0f1115);
  cursor: pointer;
}
.${css$2.checkboxRow} input[type='checkbox'] {
  width: 16px;
  height: 16px;
  /* DeepSeek business blue stays legible in both themes. */
  accent-color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${css$2.checkboxRow} input[type='checkbox']:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: 2px;
}
.${css$2.checkboxRow} input[type='checkbox']:disabled { opacity: 0.4; }
.${css$2.hint} {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
/* Red risk warning under the "allow multiple instances" opt-in. */
.${css$2.dangerHint} {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-state-error-primary, #ec1919);
  font-weight: 500;
}
.${css$2.checkboxRow} + .${css$2.hint},
.${css$2.checkboxRow} + .${css$2.dangerHint} { margin-top: -8px; }
.${css$2.footer} {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 0 4px;
  border-top: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
.${css$2.discard}, .${css$2.save} {
  appearance: none;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 5px 14px;
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  cursor: pointer;
}
.${css$2.discard} {
  border-color: var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: none;
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${css$2.discard}:hover:not(:disabled) {
  color: var(--dsw-alias-label-primary, #0f1115);
  border-color: var(--dsw-alias-label-dimmed, rgb(0 0 0 / 20%));
}
.${css$2.save} {
  background: var(--dsw-alias-label-primary, #0f1115);
  color: var(--dsw-alias-bg-layer-3, #ffffff);
}
.${css$2.discard}:disabled, .${css$2.save}:disabled { opacity: 0.4; cursor: default; }
.${css$2.discard}:focus-visible, .${css$2.save}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: 1px;
}
.${css$2.failed} {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-state-error-primary, #dc2626);
}
.${css$2.saved} {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-state-success-primary, #16a34a);
  animation: mg-fade-out 2.2s ease forwards;
}
@keyframes mg-fade-out { from { opacity: 1; } to { opacity: 0; } }
.${css$2.loading} {
  height: 72px;
  border-radius: 8px;
  background: linear-gradient(90deg, transparent, var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)), transparent);
  background-size: 200% 100%;
  animation: mg-pulse 1.2s ease-in-out infinite;
}
@keyframes mg-pulse { from { background-position: 200% 0; } to { background-position: -200% 0; } }
/* Desktop-icon picker grid (S6): preview thumbnails + selected ring. */
.${css$2.iconGrid} {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 8px;
  margin: 8px 0 2px;
}
.${css$2.iconCell} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 6px 6px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 10px;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: border-color 0.16s, background 0.16s;
}
.${css$2.iconCell}:hover {
  border-color: var(--dsw-alias-label-dimmed, rgb(0 0 0 / 20%));
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%));
}
.${css$2.iconCell}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: -1px;
}
.${css$2.iconSelected} {
  border-color: var(--dsw-alias-state-business-primary, #3964fe);
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3964fe) 8%, transparent);
}
.${css$2.iconPreview} {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  background: var(--dsw-alias-bg-module-platform, #f5f6f7);
}
.${css$2.iconName} {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 11px;
  line-height: 1.4;
  color: var(--dsw-alias-label-secondary, #61666b);
}
/* Skin picker dot: 12px circle, split light|dark content bg via inline style,
 * border follows the active theme's brand token. Used in the official Menu
 * row icon slot and inside the select pill — no new layout introduced. */
.${css$2.swatchDot} {
  display: inline-block;
  flex: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid var(--dsw-alias-brand-primary, #3964fe);
  box-sizing: border-box;
  vertical-align: middle;
}
.${css$2.selectPill} .${css$2.swatchDot} { margin-right: 6px; }
`;
		/** Inject the card stylesheet once (idempotent; no-op when already present). */
		function injectCardStyle() {
			const id = "dsh-hub-style";
			if (document.getElementById(id) !== null) return;
			const style = document.createElement("style");
			style.id = id;
			style.textContent = STYLE_TEXT$3;
			document.head.appendChild(style);
		}
		//#endregion
		//#region src/client/skins.ts
		/** Serialize one selector block: alias tokens plus optional specific tokens. */
		function block(selector, palette, specific) {
			return `${selector}{${Object.entries(palette).map(([token, value]) => `--dsw-alias-${token}:${value};`).join("")}${specific === void 0 ? "" : Object.entries(specific).map(([token, value]) => `--dsw-specific-${token}:${value};`).join("")}}`;
		}
		function buildCss(skin) {
			return `${block("body", skin.light, skin.specific.light)}${block("body[data-ds-dark-theme]", skin.dark, skin.specific.dark)}`;
		}
		/**
		* The built-in skins. Palettes are original compositions over the dsw alias
		* token set; adjust freely.
		*/
		const SKINS = [
			{
				id: "midnight",
				name: "午夜蓝",
				description: "深海蓝调，冷静专注",
				light: {
					"bg-base": "#eef1f8",
					"bg-layer-1": "#e4e9f4",
					"bg-layer-2": "#dbe2f0",
					"bg-layer-3": "#d3dcec",
					"bg-overlay": "#f4f7fd",
					"label-primary": "#1c2333",
					"label-secondary": "#3f4a63",
					"label-tertiary": "#5b6884",
					"label-dimmed": "#7c8aa8",
					"border-l1": "#d5dceb",
					"border-l2": "#c4cfe2",
					"border-l3": "#b3c0d8",
					"brand-primary": "#3b6fe0",
					"brand-primary-invert": "#ffffff",
					"brand-text": "#ffffff",
					"button-primary-fill": "#3b6fe0",
					"button-primary-hover": "#2f5cc4",
					"button-primary-dimmed": "#dbe4fa",
					"interactive-bg-hover": "#dce4f2",
					"interactive-bg-active": "#cfd9ec",
					"markdown-code-block": "#e2e8f4",
					"markdown-inline-code": "#dde5f2",
					"scrollbar-bg-l1": "#d5dceb",
					"scrollbar-hover-l1": "#c0cbe0",
					"bg-module-platform": "#d3dcec",
					"tooltip-bg": "#1c2333",
					"toast-bg": "#1c2333"
				},
				dark: {
					"bg-base": "#0a1222",
					"bg-layer-1": "#0f1a30",
					"bg-layer-2": "#14223c",
					"bg-layer-3": "#192a48",
					"bg-overlay": "#0c1528",
					"label-primary": "#dbe6ff",
					"label-secondary": "#9fb3d9",
					"label-tertiary": "#7f93bb",
					"label-dimmed": "#617297",
					"border-l1": "#1c2b4a",
					"border-l2": "#24365a",
					"border-l3": "#2d4169",
					"brand-primary": "#5b8cff",
					"brand-primary-invert": "#0a1222",
					"brand-text": "#0a1222",
					"button-primary-fill": "#3b6fe0",
					"button-primary-hover": "#4c7ceb",
					"button-primary-dimmed": "#1d3050",
					"interactive-bg-hover": "#182742",
					"interactive-bg-active": "#1f3150",
					"markdown-code-block": "#0d1830",
					"markdown-inline-code": "#14223c",
					"scrollbar-bg-l1": "#1c2b4a",
					"scrollbar-hover-l1": "#2b4068",
					"tooltip-bg": "#1c2333",
					"toast-bg": "#1c2333",
					"bg-module-platform": "#192a48"
				},
				specific: {
					light: {
						"sidebar-fill": "#e4e9f4",
						"sidebar-nav-item-active-accent": "#3b6fe0",
						"sidebar-nav-item-active": "#dbe4fa",
						"sidebar-nav-item-hover": "#dce4f2",
						menu: "#d3dcec",
						bubble: "#e8edf8",
						"bubble-highlight": "#dbe4fa"
					},
					dark: {
						"sidebar-fill": "#0f1a30",
						"sidebar-nav-item-active-accent": "#5b8cff",
						"sidebar-nav-item-active": "#1d3050",
						"sidebar-nav-item-hover": "#182742",
						menu: "#192a48",
						bubble: "#14223c",
						"bubble-highlight": "#1d3050"
					}
				}
			},
			{
				id: "paper",
				name: "旧纸张",
				description: "暖黄米色，护眼复古",
				light: {
					"bg-base": "#f4eee1",
					"bg-layer-1": "#ede4d2",
					"bg-layer-2": "#e7dcc6",
					"bg-layer-3": "#e0d3ba",
					"bg-overlay": "#f8f2e7",
					"label-primary": "#3d3527",
					"label-secondary": "#5c513d",
					"label-tertiary": "#7a6d54",
					"label-dimmed": "#98896c",
					"border-l1": "#d9cbaa",
					"border-l2": "#cdbb94",
					"border-l3": "#c0ab7f",
					"brand-primary": "#7a5c2e",
					"brand-primary-invert": "#f8f2e7",
					"brand-text": "#f8f2e7",
					"button-primary-fill": "#7a5c2e",
					"button-primary-hover": "#664c26",
					"button-primary-dimmed": "#e9dfc8",
					"interactive-bg-hover": "#e8ddc6",
					"interactive-bg-active": "#e0d3b8",
					"markdown-code-block": "#e9dfc8",
					"markdown-inline-code": "#e6dac0",
					"scrollbar-bg-l1": "#d9cbaa",
					"scrollbar-hover-l1": "#c8b688",
					"bg-module-platform": "#e0d3ba",
					"tooltip-bg": "#3d3527",
					"toast-bg": "#3d3527"
				},
				dark: {
					"bg-base": "#211d15",
					"bg-layer-1": "#2a2419",
					"bg-layer-2": "#332b1d",
					"bg-layer-3": "#3c3222",
					"bg-overlay": "#252016",
					"label-primary": "#e8dcc0",
					"label-secondary": "#b3a483",
					"label-tertiary": "#93855f",
					"label-dimmed": "#75684a",
					"border-l1": "#3a3122",
					"border-l2": "#463b29",
					"border-l3": "#524430",
					"brand-primary": "#c9a45c",
					"brand-primary-invert": "#211d15",
					"brand-text": "#211d15",
					"button-primary-fill": "#8a6a33",
					"button-primary-hover": "#9d7a3e",
					"button-primary-dimmed": "#37301f",
					"interactive-bg-hover": "#322a1c",
					"interactive-bg-active": "#3a3120",
					"markdown-code-block": "#262015",
					"markdown-inline-code": "#2e281b",
					"scrollbar-bg-l1": "#3a3122",
					"scrollbar-hover-l1": "#4a3f2b",
					"tooltip-bg": "#3d3527",
					"toast-bg": "#3d3527",
					"bg-module-platform": "#3c3222"
				},
				specific: {
					light: {
						"sidebar-fill": "#ede4d2",
						"sidebar-nav-item-active-accent": "#7a5c2e",
						"sidebar-nav-item-active": "#e9dfc8",
						"sidebar-nav-item-hover": "#e8ddc6",
						menu: "#e0d3ba",
						bubble: "#f0e9d8",
						"bubble-highlight": "#e9dfc8"
					},
					dark: {
						"sidebar-fill": "#2a2419",
						"sidebar-nav-item-active-accent": "#c9a45c",
						"sidebar-nav-item-active": "#37301f",
						"sidebar-nav-item-hover": "#322a1c",
						menu: "#3c3222",
						bubble: "#332b1d",
						"bubble-highlight": "#37301f"
					}
				}
			},
			{
				id: "terminal",
				name: "终端绿",
				description: "磷光绿，命令行质感",
				light: {
					"bg-base": "#eef5ec",
					"bg-layer-1": "#e2efe0",
					"bg-layer-2": "#d7e9d4",
					"bg-layer-3": "#cce3c9",
					"bg-overlay": "#f2f8f0",
					"label-primary": "#1d301c",
					"label-secondary": "#3a5436",
					"label-tertiary": "#55774f",
					"label-dimmed": "#74996d",
					"border-l1": "#cfe3cc",
					"border-l2": "#bfd8bb",
					"border-l3": "#aecda9",
					"brand-primary": "#2e7d32",
					"brand-primary-invert": "#f2f8f0",
					"brand-text": "#f2f8f0",
					"button-primary-fill": "#2e7d32",
					"button-primary-hover": "#266a2a",
					"button-primary-dimmed": "#d8ecd5",
					"interactive-bg-hover": "#dcebda",
					"interactive-bg-active": "#d0e4ce",
					"markdown-code-block": "#dfeede",
					"markdown-inline-code": "#d8ead6",
					"scrollbar-bg-l1": "#cfe3cc",
					"scrollbar-hover-l1": "#b9d6b4",
					"bg-module-platform": "#cce3c9",
					"tooltip-bg": "#1d301c",
					"toast-bg": "#1d301c"
				},
				dark: {
					"bg-base": "#0a130b",
					"bg-layer-1": "#0e1c10",
					"bg-layer-2": "#132614",
					"bg-layer-3": "#17301a",
					"bg-overlay": "#0b150d",
					"label-primary": "#a9f0a9",
					"label-secondary": "#6fae6f",
					"label-tertiary": "#558d55",
					"label-dimmed": "#3f6e3f",
					"border-l1": "#1c3a20",
					"border-l2": "#244928",
					"border-l3": "#2c5831",
					"brand-primary": "#33ff88",
					"brand-primary-invert": "#0a130b",
					"brand-text": "#0a130b",
					"button-primary-fill": "#1f6e3a",
					"button-primary-hover": "#278346",
					"button-primary-dimmed": "#14301c",
					"interactive-bg-hover": "#11241a",
					"interactive-bg-active": "#162b1e",
					"markdown-code-block": "#0c180e",
					"markdown-inline-code": "#102215",
					"scrollbar-bg-l1": "#1c3a20",
					"scrollbar-hover-l1": "#2a5230",
					"tooltip-bg": "#0e1c10",
					"toast-bg": "#0e1c10",
					"bg-module-platform": "#17301a"
				},
				specific: {
					light: {
						"sidebar-fill": "#e2efe0",
						"sidebar-nav-item-active-accent": "#2e7d32",
						"sidebar-nav-item-active": "#d8ecd5",
						"sidebar-nav-item-hover": "#dcebda",
						menu: "#cce3c9",
						bubble: "#e8f3e6",
						"bubble-highlight": "#d8ecd5"
					},
					dark: {
						"sidebar-fill": "#0e1c10",
						"sidebar-nav-item-active-accent": "#33ff88",
						"sidebar-nav-item-active": "#14301c",
						"sidebar-nav-item-hover": "#11241a",
						menu: "#17301a",
						bubble: "#132614",
						"bubble-highlight": "#14301c"
					}
				}
			},
			{
				id: "zcode",
				name: "ZCode",
				description: "智谱 ZCode IDE 实测色板（浅色/深色）",
				light: {
					"bg-base": "#ffffff",
					"bg-layer-1": "#ececee",
					"bg-layer-2": "#ececee",
					"bg-layer-3": "#f8f8f8",
					"bg-overlay": "#f8f8f8",
					"label-primary": "#262626",
					"label-secondary": "#55565a",
					"label-tertiary": "#8a8a8d",
					"label-dimmed": "#b0b0b2",
					"border-l1": "#e3e3e5",
					"border-l2": "#d9d9db",
					"border-l3": "#c9c9cb",
					"brand-primary": "#0095df",
					"brand-primary-invert": "#ffffff",
					"brand-text": "#ffffff",
					"button-primary-fill": "#0095df",
					"button-primary-hover": "#007fbf",
					"button-primary-dimmed": "#d9edf9",
					"interactive-bg-hover": "#e0e0e2",
					"interactive-bg-active": "#d3d3d5",
					"markdown-code-block": "#f4f4f6",
					"markdown-inline-code": "#ececee",
					"scrollbar-bg-l1": "#c8c8ca99",
					"scrollbar-hover-l1": "#a8a8aa",
					"bg-module-platform": "#f8f8f8",
					"tooltip-bg": "#262626",
					"toast-bg": "#262626",
					"state-success-primary": "#2da44e",
					"state-error-primary": "#cf222e",
					"state-warn-primary": "#bf8700",
					"state-business-primary": "#0095df"
				},
				dark: {
					"bg-base": "#2b2b2b",
					"bg-layer-1": "#2b2b2b",
					"bg-layer-2": "#363636",
					"bg-layer-3": "#161616",
					"bg-overlay": "#1f1f1f",
					"label-primary": "#dcdcdc",
					"label-secondary": "#a0a0a0",
					"label-tertiary": "#888888",
					"label-dimmed": "#6b6b6b",
					"border-l1": "#3c3c3c",
					"border-l2": "#545454",
					"border-l3": "#626262",
					"brand-primary": "#0096e0",
					"brand-primary-invert": "#161616",
					"brand-text": "#161616",
					"button-primary-fill": "#0096e0",
					"button-primary-hover": "#1ba5e8",
					"button-primary-dimmed": "#1d3a47",
					"interactive-bg-hover": "#3a3a3a",
					"interactive-bg-active": "#414141",
					"markdown-code-block": "#232323",
					"markdown-inline-code": "#363636",
					"scrollbar-bg-l1": "#54545499",
					"scrollbar-hover-l1": "#6e6e6e",
					"tooltip-bg": "#161616",
					"toast-bg": "#161616",
					"state-success-primary": "#3fb950",
					"state-error-primary": "#f85149",
					"state-warn-primary": "#d29922",
					"state-business-primary": "#0096e0",
					"bg-module-platform": "#161616"
				},
				specific: {
					light: {
						"sidebar-fill": "#ececee",
						"sidebar-nav-item-active-accent": "#0095df",
						"sidebar-nav-item-active": "#d9edf9",
						"sidebar-nav-item-hover": "#e0e0e2",
						menu: "#f8f8f8",
						bubble: "#f4f4f6",
						"bubble-highlight": "#d9edf9"
					},
					dark: {
						"sidebar-fill": "#363636",
						"sidebar-nav-item-active-accent": "#0096e0",
						"sidebar-nav-item-active": "#1d3a47",
						"sidebar-nav-item-hover": "#3a3a3a",
						menu: "#161616",
						bubble: "#363636",
						"bubble-highlight": "#1d3a47"
					}
				}
			},
			{
				id: "aurora",
				name: "极光紫",
				description: "紫罗兰辉光，梦幻渐变",
				light: {
					"bg-base": "#f1eefb",
					"bg-layer-1": "#e8e4f7",
					"bg-layer-2": "#e0daf4",
					"bg-layer-3": "#d8d0f0",
					"bg-overlay": "#f5f2fd",
					"label-primary": "#241f3d",
					"label-secondary": "#453d6b",
					"label-tertiary": "#645a94",
					"label-dimmed": "#8377b8",
					"border-l1": "#d6cdf0",
					"border-l2": "#c7bce8",
					"border-l3": "#b7a9df",
					"brand-primary": "#7c5cff",
					"brand-primary-invert": "#f5f2fd",
					"brand-text": "#f5f2fd",
					"button-primary-fill": "#7c5cff",
					"button-primary-hover": "#6a4ae8",
					"button-primary-dimmed": "#e0d8fb",
					"interactive-bg-hover": "#e6e0f8",
					"interactive-bg-active": "#dcd3f4",
					"markdown-code-block": "#e4def7",
					"markdown-inline-code": "#ded6f4",
					"scrollbar-bg-l1": "#d6cdf0",
					"scrollbar-hover-l1": "#c3b6e6",
					"bg-module-platform": "#d8d0f0",
					"tooltip-bg": "#241f3d",
					"toast-bg": "#241f3d"
				},
				dark: {
					"bg-base": "#0e0d1d",
					"bg-layer-1": "#151331",
					"bg-layer-2": "#1c1a40",
					"bg-layer-3": "#24214e",
					"bg-overlay": "#100f21",
					"label-primary": "#e2dcff",
					"label-secondary": "#a79fe0",
					"label-tertiary": "#877dc4",
					"label-dimmed": "#665ca6",
					"border-l1": "#2b2760",
					"border-l2": "#35306f",
					"border-l3": "#3f397e",
					"brand-primary": "#9f7cff",
					"brand-primary-invert": "#0e0d1d",
					"brand-text": "#0e0d1d",
					"button-primary-fill": "#6a45e8",
					"button-primary-hover": "#7a57f0",
					"button-primary-dimmed": "#241f4d",
					"interactive-bg-hover": "#1c1940",
					"interactive-bg-active": "#24214b",
					"markdown-code-block": "#121026",
					"markdown-inline-code": "#191632",
					"scrollbar-bg-l1": "#2b2760",
					"scrollbar-hover-l1": "#3a3480",
					"tooltip-bg": "#151331",
					"toast-bg": "#151331",
					"bg-module-platform": "#24214e"
				},
				specific: {
					light: {
						"sidebar-fill": "#e8e4f7",
						"sidebar-nav-item-active-accent": "#7c5cff",
						"sidebar-nav-item-active": "#e0d8fb",
						"sidebar-nav-item-hover": "#e6e0f8",
						menu: "#d8d0f0",
						bubble: "#ece7fa",
						"bubble-highlight": "#e0d8fb"
					},
					dark: {
						"sidebar-fill": "#151331",
						"sidebar-nav-item-active-accent": "#9f7cff",
						"sidebar-nav-item-active": "#241f4d",
						"sidebar-nav-item-hover": "#1c1940",
						menu: "#24214e",
						bubble: "#1c1a40",
						"bubble-highlight": "#241f4d"
					}
				}
			},
			{
				id: "rx-noir-gold",
				name: "黑金（Noir Gold）",
				description: "Reasonix 官方 Noir Gold——暖纸金与墨黑鎏金",
				light: {
					"bg-base": "#FDFAF2",
					"bg-layer-1": "#F6F0DF",
					"bg-layer-2": "#F7F1E1",
					"bg-layer-3": "#FEFBF4",
					"bg-overlay": "#FEFBF4",
					"label-primary": "#2A241B",
					"label-secondary": "#5C5340",
					"label-tertiary": "#7B715A",
					"label-dimmed": "#8F856C",
					"border-l1": "#EFE8D2",
					"border-l2": "#DFD5B6",
					"border-l3": "#CCBE94",
					"brand-primary": "#7A5A16",
					"brand-primary-invert": "#FCF8EE",
					"brand-text": "#FCF8EE",
					"button-primary-fill": "#6B4F13",
					"button-primary-hover": "#5F4611",
					"button-primary-dimmed": "#EFE8D8",
					"interactive-bg-hover": "#F6F0DE",
					"interactive-bg-active": "#F5EFDE",
					"markdown-code-block": "#FAF5E8",
					"markdown-inline-code": "#F6F0DF",
					"scrollbar-bg-l1": "#E6DEC2",
					"scrollbar-hover-l1": "#CCBE94",
					"bg-module-platform": "#F7F1E1",
					"tooltip-bg": "#2A241B",
					"toast-bg": "#2A241B"
				},
				dark: {
					"bg-base": "#131009",
					"bg-layer-1": "#15120E",
					"bg-layer-2": "#171410",
					"bg-layer-3": "#1D1913",
					"bg-overlay": "#14110D",
					"label-primary": "#F8F1DF",
					"label-secondary": "#D6CBAE",
					"label-tertiary": "#B6AC8E",
					"label-dimmed": "#968C6E",
					"border-l1": "#2A2418",
					"border-l2": "#372E1F",
					"border-l3": "#463B27",
					"brand-primary": "#D9B45B",
					"brand-primary-invert": "#1D1503",
					"brand-text": "#1D1503",
					"button-primary-fill": "#D9B45B",
					"button-primary-hover": "#DEBD6F",
					"button-primary-dimmed": "#3F3213",
					"interactive-bg-hover": "#15120E",
					"interactive-bg-active": "#14110D",
					"markdown-code-block": "#14110C",
					"markdown-inline-code": "#15120E",
					"scrollbar-bg-l1": "#312A1C",
					"scrollbar-hover-l1": "#463B27",
					"bg-module-platform": "#171410",
					"tooltip-bg": "#241F16",
					"toast-bg": "#241F16"
				},
				specific: {
					light: {
						"sidebar-fill": "#F5EFDD",
						"sidebar-nav-item-active-accent": "#7A5A16",
						"sidebar-nav-item-active": "#EFE8D8",
						"sidebar-nav-item-hover": "#F6F0DE",
						menu: "#FEFBF4",
						bubble: "#FAF5E8",
						"bubble-highlight": "#EFE8D8"
					},
					dark: {
						"sidebar-fill": "#14110D",
						"sidebar-nav-item-active-accent": "#D9B45B",
						"sidebar-nav-item-active": "#3F3213",
						"sidebar-nav-item-hover": "#15120E",
						menu: "#1D1913",
						bubble: "#18140E",
						"bubble-highlight": "#392D10"
					}
				}
			},
			{
				id: "rx-crimson-horizon",
				name: "绯红地平线（Crimson Horizon）",
				description: "Reasonix 官方 Crimson Horizon——炽红地线，张力十足",
				light: {
					"bg-base": "#FFFBFA",
					"bg-layer-1": "#F9EEEC",
					"bg-layer-2": "#FBF1EF",
					"bg-layer-3": "#FFFFFF",
					"bg-overlay": "#FFFFFF",
					"label-primary": "#301D1D",
					"label-secondary": "#6B4644",
					"label-tertiary": "#8A6360",
					"label-dimmed": "#9D7774",
					"border-l1": "#F6E4E2",
					"border-l2": "#ECCECA",
					"border-l3": "#DFB3AD",
					"brand-primary": "#B92B38",
					"brand-primary-invert": "#FFF8F7",
					"brand-text": "#FFF8F7",
					"button-primary-fill": "#A32631",
					"button-primary-hover": "#90222C",
					"button-primary-dimmed": "#F8E4E4",
					"interactive-bg-hover": "#F9EDEB",
					"interactive-bg-active": "#F9EDEB",
					"markdown-code-block": "#FCF4F3",
					"markdown-inline-code": "#F9EEEC",
					"scrollbar-bg-l1": "#F0D8D5",
					"scrollbar-hover-l1": "#DFB3AD",
					"bg-module-platform": "#FBF1EF",
					"tooltip-bg": "#301D1D",
					"toast-bg": "#301D1D"
				},
				dark: {
					"bg-base": "#201116",
					"bg-layer-1": "#221318",
					"bg-layer-2": "#25141A",
					"bg-layer-3": "#2B181E",
					"bg-overlay": "#14110D",
					"label-primary": "#FFF1F2",
					"label-secondary": "#DFB3B6",
					"label-tertiary": "#C6989D",
					"label-dimmed": "#AC7E84",
					"border-l1": "#361B24",
					"border-l2": "#45242F",
					"border-l3": "#582F3C",
					"brand-primary": "#FF6772",
					"brand-primary-invert": "#2A0E12",
					"brand-text": "#2A0E12",
					"button-primary-fill": "#FF6772",
					"button-primary-hover": "#FF7983",
					"button-primary-dimmed": "#501E23",
					"interactive-bg-hover": "#221318",
					"interactive-bg-active": "#211218",
					"markdown-code-block": "#211217",
					"markdown-inline-code": "#221318",
					"scrollbar-bg-l1": "#3E202A",
					"scrollbar-hover-l1": "#582F3C",
					"bg-module-platform": "#25141A",
					"tooltip-bg": "#241F16",
					"toast-bg": "#241F16"
				},
				specific: {
					light: {
						"sidebar-fill": "#F9ECEA",
						"sidebar-nav-item-active-accent": "#B92B38",
						"sidebar-nav-item-active": "#F8E4E4",
						"sidebar-nav-item-hover": "#F9EDEB",
						"menu": "#FFFFFF",
						"bubble": "#FCF4F3",
						"bubble-highlight": "#F8E4E4"
					},
					dark: {
						"sidebar-fill": "#211218",
						"sidebar-nav-item-active-accent": "#FF6772",
						"sidebar-nav-item-active": "#501E23",
						"sidebar-nav-item-hover": "#221318",
						"menu": "#2B181E",
						"bubble": "#26141A",
						"bubble-highlight": "#4A1B20"
					}
				}
			},
			{
				id: "rx-cyan-stage",
				name: "青蓝舞台（Cyan Stage）",
				description: "Reasonix 官方 Cyan Stage——冰川青蓝，冷静清晰",
				light: {
					"bg-base": "#F6FDFE",
					"bg-layer-1": "#E4F5F7",
					"bg-layer-2": "#E8F6F8",
					"bg-layer-3": "#FAFEFE",
					"bg-overlay": "#FAFEFE",
					"label-primary": "#173238",
					"label-secondary": "#43606A",
					"label-tertiary": "#5A7A84",
					"label-dimmed": "#698992",
					"border-l1": "#DAEDF0",
					"border-l2": "#BEE0E5",
					"border-l3": "#9CCFD7",
					"brand-primary": "#007C92",
					"brand-primary-invert": "#F1FCFD",
					"brand-text": "#F1FCFD",
					"button-primary-fill": "#006D80",
					"button-primary-hover": "#006172",
					"button-primary-dimmed": "#D9EFF2",
					"interactive-bg-hover": "#E4F5F7",
					"interactive-bg-active": "#E3F4F6",
					"markdown-code-block": "#EDF9FA",
					"markdown-inline-code": "#E4F5F7",
					"scrollbar-bg-l1": "#CAE6EA",
					"scrollbar-hover-l1": "#9CCFD7",
					"bg-module-platform": "#E8F6F8",
					"tooltip-bg": "#173238",
					"toast-bg": "#173238"
				},
				dark: {
					"bg-base": "#0A2027",
					"bg-layer-1": "#0C2229",
					"bg-layer-2": "#0E252D",
					"bg-layer-3": "#112C34",
					"bg-overlay": "#14110D",
					"label-primary": "#E9FCFF",
					"label-secondary": "#AEDBE2",
					"label-tertiary": "#8EC0C8",
					"label-dimmed": "#6FA5AF",
					"border-l1": "#16333C",
					"border-l2": "#1A3B45",
					"border-l3": "#1F4550",
					"brand-primary": "#37D7E4",
					"brand-primary-invert": "#04222a",
					"brand-text": "#04222a",
					"button-primary-fill": "#37D7E4",
					"button-primary-hover": "#4FDCE7",
					"button-primary-dimmed": "#0D434B",
					"interactive-bg-hover": "#0C2229",
					"interactive-bg-active": "#0B2128",
					"markdown-code-block": "#0B2128",
					"markdown-inline-code": "#0C2229",
					"scrollbar-bg-l1": "#183841",
					"scrollbar-hover-l1": "#1F4550",
					"bg-module-platform": "#0E252D",
					"tooltip-bg": "#241F16",
					"toast-bg": "#241F16"
				},
				specific: {
					light: {
						"sidebar-fill": "#E3F4F6",
						"sidebar-nav-item-active-accent": "#007C92",
						"sidebar-nav-item-active": "#D9EFF2",
						"sidebar-nav-item-hover": "#E4F5F7",
						"menu": "#FAFEFE",
						"bubble": "#EDF9FA",
						"bubble-highlight": "#D9EFF2"
					},
					dark: {
						"sidebar-fill": "#0B2128",
						"sidebar-nav-item-active-accent": "#37D7E4",
						"sidebar-nav-item-active": "#0D434B",
						"sidebar-nav-item-hover": "#0C2229",
						"menu": "#112C34",
						"bubble": "#0E262E",
						"bubble-highlight": "#0C3D46"
					}
				}
			},
			{
				id: "rx-fortune-forge",
				name: "熔炉金红（Fortune Forge）",
				description: "Reasonix 官方 Fortune Forge——锻炉金红，炽热专注",
				light: {
					"bg-base": "#FFFBF1",
					"bg-layer-1": "#F9EFD5",
					"bg-layer-2": "#FAF1DC",
					"bg-layer-3": "#FFFDF6",
					"bg-overlay": "#FFFDF6",
					"label-primary": "#382116",
					"label-secondary": "#6E4E35",
					"label-tertiary": "#8C6C4E",
					"label-dimmed": "#9D8061",
					"border-l1": "#F2E7CD",
					"border-l2": "#E5D2A9",
					"border-l3": "#D6B87E",
					"brand-primary": "#A92D22",
					"brand-primary-invert": "#FFF8E8",
					"brand-text": "#FFF8E8",
					"button-primary-fill": "#95281E",
					"button-primary-hover": "#84231B",
					"button-primary-dimmed": "#F6E4D4",
					"interactive-bg-hover": "#F9EED4",
					"interactive-bg-active": "#F8EED4",
					"markdown-code-block": "#FCF5E3",
					"markdown-inline-code": "#F9EFD5",
					"scrollbar-bg-l1": "#EBDBB9",
					"scrollbar-hover-l1": "#D6B87E",
					"bg-module-platform": "#FAF1DC",
					"tooltip-bg": "#382116",
					"toast-bg": "#382116"
				},
				dark: {
					"bg-base": "#231A11",
					"bg-layer-1": "#271C12",
					"bg-layer-2": "#291E13",
					"bg-layer-3": "#302417",
					"bg-overlay": "#14110D",
					"label-primary": "#FFF2D1",
					"label-secondary": "#DDC49C",
					"label-tertiary": "#C3AB84",
					"label-dimmed": "#A9926B",
					"border-l1": "#3B2C1A",
					"border-l2": "#43321E",
					"border-l3": "#4D3A22",
					"brand-primary": "#E8AD38",
					"brand-primary-invert": "#241606",
					"brand-text": "#241606",
					"button-primary-fill": "#E8AD38",
					"button-primary-hover": "#EBB750",
					"button-primary-dimmed": "#47310F",
					"interactive-bg-hover": "#261C12",
					"interactive-bg-active": "#261B11",
					"markdown-code-block": "#251B12",
					"markdown-inline-code": "#271C12",
					"scrollbar-bg-l1": "#40301C",
					"scrollbar-hover-l1": "#4D3A22",
					"bg-module-platform": "#291E13",
					"tooltip-bg": "#241F16",
					"toast-bg": "#241F16"
				},
				specific: {
					light: {
						"sidebar-fill": "#F8EDD3",
						"sidebar-nav-item-active-accent": "#A92D22",
						"sidebar-nav-item-active": "#F6E4D4",
						"sidebar-nav-item-hover": "#F9EED4",
						"menu": "#FFFDF6",
						"bubble": "#FCF5E3",
						"bubble-highlight": "#F6E4D4"
					},
					dark: {
						"sidebar-fill": "#251B11",
						"sidebar-nav-item-active-accent": "#E8AD38",
						"sidebar-nav-item-active": "#47310F",
						"sidebar-nav-item-hover": "#261C12",
						"menu": "#302417",
						"bubble": "#2A1F14",
						"bubble-highlight": "#412D0E"
					}
				}
			},
			{
				id: "rx-rose-dawn",
				name: "玫瑰晨光（Rose Dawn）",
				description: "Reasonix 官方 Rose Dawn——玫瑰晨雾，柔和温暖",
				light: {
					"bg-base": "#FFFCFC",
					"bg-layer-1": "#FBEFF1",
					"bg-layer-2": "#FDF3F4",
					"bg-layer-3": "#FFFFFF",
					"bg-overlay": "#FFFFFF",
					"label-primary": "#3A252C",
					"label-secondary": "#6D4A55",
					"label-tertiary": "#8B626E",
					"label-dimmed": "#A97B87",
					"border-l1": "#F5E3E7",
					"border-l2": "#ECD1D8",
					"border-l3": "#E2BCC6",
					"brand-primary": "#B43F65",
					"brand-primary-invert": "#FFF7F8",
					"brand-text": "#FFF7F8",
					"button-primary-fill": "#9E3759",
					"button-primary-hover": "#8C314F",
					"button-primary-dimmed": "#F8E5E9",
					"interactive-bg-hover": "#FBEEF0",
					"interactive-bg-active": "#FBEDF0",
					"markdown-code-block": "#FDF6F6",
					"markdown-inline-code": "#FBEFF1",
					"scrollbar-bg-l1": "#F0D9DF",
					"scrollbar-hover-l1": "#E2BCC6",
					"bg-module-platform": "#FDF3F4",
					"tooltip-bg": "#3A252C",
					"toast-bg": "#3A252C"
				},
				dark: {
					"bg-base": "#231820",
					"bg-layer-1": "#281B21",
					"bg-layer-2": "#2A1D24",
					"bg-layer-3": "#312329",
					"bg-overlay": "#14110D",
					"label-primary": "#FFF3F6",
					"label-secondary": "#D9B3C0",
					"label-tertiary": "#C098A6",
					"label-dimmed": "#A87C8C",
					"border-l1": "#3A2832",
					"border-l2": "#422D38",
					"border-l3": "#4C3440",
					"brand-primary": "#E26D91",
					"brand-primary-invert": "#2A121D",
					"brand-text": "#2A121D",
					"button-primary-fill": "#E26D91",
					"button-primary-hover": "#E57F9E",
					"button-primary-dimmed": "#4B2232",
					"interactive-bg-hover": "#271A21",
					"interactive-bg-active": "#261A22",
					"markdown-code-block": "#261A20",
					"markdown-inline-code": "#281B21",
					"scrollbar-bg-l1": "#3E2B36",
					"scrollbar-hover-l1": "#4C3440",
					"bg-module-platform": "#2A1D24",
					"tooltip-bg": "#241F16",
					"toast-bg": "#241F16"
				},
				specific: {
					light: {
						"sidebar-fill": "#FBECEF",
						"sidebar-nav-item-active-accent": "#B43F65",
						"sidebar-nav-item-active": "#F8E5E9",
						"sidebar-nav-item-hover": "#FBEEF0",
						"menu": "#FFFFFF",
						"bubble": "#FDF6F6",
						"bubble-highlight": "#F8E5E9"
					},
					dark: {
						"sidebar-fill": "#251922",
						"sidebar-nav-item-active-accent": "#E26D91",
						"sidebar-nav-item-active": "#4B2232",
						"sidebar-nav-item-hover": "#271A21",
						"menu": "#312329",
						"bubble": "#2A1E24",
						"bubble-highlight": "#46202E"
					}
				}
			},
			{
				id: "rx-sage-breeze",
				name: "鼠尾草微风（Sage Breeze）",
				description: "Reasonix 官方 Sage Breeze——鼠尾草绿，自然清新",
				light: {
					"bg-base": "#FAFAF4",
					"bg-layer-1": "#EFEFE2",
					"bg-layer-2": "#F1F1E5",
					"bg-layer-3": "#FCFCF6",
					"bg-overlay": "#FCFCF6",
					"label-primary": "#26332D",
					"label-secondary": "#4E6157",
					"label-tertiary": "#65786D",
					"label-dimmed": "#73857A",
					"border-l1": "#E8E8D8",
					"border-l2": "#D6D6BA",
					"border-l3": "#BFC095",
					"brand-primary": "#47735F",
					"brand-primary-invert": "#F7F7EF",
					"brand-text": "#F7F7EF",
					"button-primary-fill": "#3E6554",
					"button-primary-hover": "#375A4A",
					"button-primary-dimmed": "#E5EAE1",
					"interactive-bg-hover": "#EFEFE1",
					"interactive-bg-active": "#EEEEE1",
					"markdown-code-block": "#F4F4EB",
					"markdown-inline-code": "#EFEFE2",
					"scrollbar-bg-l1": "#DEDEC7",
					"scrollbar-hover-l1": "#BFC095",
					"bg-module-platform": "#F1F1E5",
					"tooltip-bg": "#26332D",
					"toast-bg": "#26332D"
				},
				dark: {
					"bg-base": "#151E19",
					"bg-layer-1": "#17211C",
					"bg-layer-2": "#19231D",
					"bg-layer-3": "#1E2922",
					"bg-overlay": "#14110D",
					"label-primary": "#EEF6F0",
					"label-secondary": "#B7CDBF",
					"label-tertiary": "#9AB2A4",
					"label-dimmed": "#7E968A",
					"border-l1": "#25322B",
					"border-l2": "#2B3A32",
					"border-l3": "#32443A",
					"brand-primary": "#84CBA7",
					"brand-primary-invert": "#0E1A13",
					"brand-text": "#0E1A13",
					"button-primary-fill": "#84CBA7",
					"button-primary-hover": "#93D1B2",
					"button-primary-dimmed": "#233A2E",
					"interactive-bg-hover": "#17201B",
					"interactive-bg-active": "#16201B",
					"markdown-code-block": "#16201A",
					"markdown-inline-code": "#17211C",
					"scrollbar-bg-l1": "#28362F",
					"scrollbar-hover-l1": "#32443A",
					"bg-module-platform": "#19231D",
					"tooltip-bg": "#241F16",
					"toast-bg": "#241F16"
				},
				specific: {
					light: {
						"sidebar-fill": "#EEEEE0",
						"sidebar-nav-item-active-accent": "#47735F",
						"sidebar-nav-item-active": "#E5EAE1",
						"sidebar-nav-item-hover": "#EFEFE1",
						"menu": "#FCFCF6",
						"bubble": "#F4F4EB",
						"bubble-highlight": "#E5EAE1"
					},
					dark: {
						"sidebar-fill": "#161F1A",
						"sidebar-nav-item-active-accent": "#84CBA7",
						"sidebar-nav-item-active": "#233A2E",
						"sidebar-nav-item-hover": "#17201B",
						"menu": "#1E2922",
						"bubble": "#1A241E",
						"bubble-highlight": "#203529"
					}
				}
			},
			{
				id: "rx-spark-notebook",
				name: "火花笔记（Spark Notebook）",
				description: "Reasonix 官方 Spark Notebook——青瓷墨黑，专注书写",
				light: {
					"bg-base": "#FFFCF4",
					"bg-layer-1": "#F9F1DE",
					"bg-layer-2": "#FAF3E2",
					"bg-layer-3": "#FFFDF7",
					"bg-overlay": "#FFFDF7",
					"label-primary": "#2B2F35",
					"label-secondary": "#565D66",
					"label-tertiary": "#6D757F",
					"label-dimmed": "#7B838D",
					"border-l1": "#F2E9D4",
					"border-l2": "#E4D5B4",
					"border-l3": "#D2BC8E",
					"brand-primary": "#007B78",
					"brand-primary-invert": "#F3FBFA",
					"brand-text": "#F3FBFA",
					"button-primary-fill": "#006C6A",
					"button-primary-hover": "#00605E",
					"button-primary-dimmed": "#DBEEED",
					"interactive-bg-hover": "#F9F1DD",
					"interactive-bg-active": "#F8F0DD",
					"markdown-code-block": "#FCF6E9",
					"markdown-inline-code": "#F9F1DE",
					"scrollbar-bg-l1": "#EADEC2",
					"scrollbar-hover-l1": "#D2BC8E",
					"bg-module-platform": "#FAF3E2",
					"tooltip-bg": "#2B2F35",
					"toast-bg": "#2B2F35"
				},
				dark: {
					"bg-base": "#191D21",
					"bg-layer-1": "#1B1F23",
					"bg-layer-2": "#1D2226",
					"bg-layer-3": "#23282D",
					"bg-overlay": "#14110D",
					"label-primary": "#F8F5E9",
					"label-secondary": "#C9CCBF",
					"label-tertiary": "#AAAEA4",
					"label-dimmed": "#8B918A",
					"border-l1": "#2A3138",
					"border-l2": "#303840",
					"border-l3": "#38404A",
					"brand-primary": "#42D1C6",
					"brand-primary-invert": "#08201E",
					"brand-text": "#08201E",
					"button-primary-fill": "#42D1C6",
					"button-primary-hover": "#59D7CD",
					"button-primary-dimmed": "#12403C",
					"interactive-bg-hover": "#1B1F23",
					"interactive-bg-active": "#1A1E22",
					"markdown-code-block": "#1A1E22",
					"markdown-inline-code": "#1B1F23",
					"scrollbar-bg-l1": "#2E353C",
					"scrollbar-hover-l1": "#38404A",
					"bg-module-platform": "#1D2226",
					"tooltip-bg": "#241F16",
					"toast-bg": "#241F16"
				},
				specific: {
					light: {
						"sidebar-fill": "#F8F0DC",
						"sidebar-nav-item-active-accent": "#007B78",
						"sidebar-nav-item-active": "#DBEEED",
						"sidebar-nav-item-hover": "#F9F1DD",
						"menu": "#FFFDF7",
						"bubble": "#FCF6E9",
						"bubble-highlight": "#DBEEED"
					},
					dark: {
						"sidebar-fill": "#1A1E22",
						"sidebar-nav-item-active-accent": "#42D1C6",
						"sidebar-nav-item-active": "#12403C",
						"sidebar-nav-item-hover": "#1B1F23",
						"menu": "#23282D",
						"bubble": "#1E2227",
						"bubble-highlight": "#113B37"
					}
				}
			},
			{
				id: "rx-violet-starlight",
				name: "紫罗兰星光（Violet Starlight）",
				description: "Reasonix 官方 Violet Starlight——星辉紫韵，沉静深邃",
				light: {
					"bg-base": "#FAF8FF",
					"bg-layer-1": "#EFEBFB",
					"bg-layer-2": "#F1EDFB",
					"bg-layer-3": "#FCFAFF",
					"bg-overlay": "#FCFAFF",
					"label-primary": "#251F3C",
					"label-secondary": "#544B74",
					"label-tertiary": "#726A94",
					"label-dimmed": "#877EA6",
					"border-l1": "#E8E3F7",
					"border-l2": "#DAD2F2",
					"border-l3": "#CABDEC",
					"brand-primary": "#6242C7",
					"brand-primary-invert": "#F7F4FF",
					"brand-text": "#F7F4FF",
					"button-primary-fill": "#563AAF",
					"button-primary-hover": "#4C339B",
					"button-primary-dimmed": "#E8E2F9",
					"interactive-bg-hover": "#EFEAFB",
					"interactive-bg-active": "#EEEAFA",
					"markdown-code-block": "#F4F2FD",
					"markdown-inline-code": "#EFEBFB",
					"scrollbar-bg-l1": "#E0DAF4",
					"scrollbar-hover-l1": "#CABDEC",
					"bg-module-platform": "#F1EDFB",
					"tooltip-bg": "#251F3C",
					"toast-bg": "#251F3C"
				},
				dark: {
					"bg-base": "#111630",
					"bg-layer-1": "#131834",
					"bg-layer-2": "#151B36",
					"bg-layer-3": "#1A2140",
					"bg-overlay": "#14110D",
					"label-primary": "#F4F2FF",
					"label-secondary": "#C2BDE8",
					"label-tertiary": "#A49ED0",
					"label-dimmed": "#8580B8",
					"border-l1": "#222B4E",
					"border-l2": "#273259",
					"border-l3": "#2E3A66",
					"brand-primary": "#9B86FF",
					"brand-primary-invert": "#14102E",
					"brand-text": "#14102E",
					"button-primary-fill": "#9B86FF",
					"button-primary-hover": "#A795FF",
					"button-primary-dimmed": "#2C2554",
					"interactive-bg-hover": "#131833",
					"interactive-bg-active": "#121733",
					"markdown-code-block": "#121732",
					"markdown-inline-code": "#131834",
					"scrollbar-bg-l1": "#252F54",
					"scrollbar-hover-l1": "#2E3A66",
					"bg-module-platform": "#151B36",
					"tooltip-bg": "#241F16",
					"toast-bg": "#241F16"
				},
				specific: {
					light: {
						"sidebar-fill": "#EEE9FA",
						"sidebar-nav-item-active-accent": "#6242C7",
						"sidebar-nav-item-active": "#E8E2F9",
						"sidebar-nav-item-hover": "#EFEAFB",
						"menu": "#FCFAFF",
						"bubble": "#F4F2FD",
						"bubble-highlight": "#E8E2F9"
					},
					dark: {
						"sidebar-fill": "#121732",
						"sidebar-nav-item-active-accent": "#9B86FF",
						"sidebar-nav-item-active": "#2C2554",
						"sidebar-nav-item-hover": "#131833",
						"menu": "#1A2140",
						"bubble": "#161C38",
						"bubble-highlight": "#28224D"
					}
				}
			},
			{
				id: "oc-classic",
				name: "opencode 经典（opencode Classic）",
				description: "opencode 官方配方——近黑/近白中性底 + 鲜橙强调（#FF8C00 系）",
				light: {
					"bg-base": "#FCFCFD",
					"bg-layer-1": "#F6F6F7",
					"bg-layer-2": "#F6F6F7",
					"bg-layer-3": "#EFEFF0",
					"bg-overlay": "#EFEFF0",
					"label-primary": "#141517",
					"label-secondary": "#55595F",
					"label-tertiary": "#70747A",
					"label-dimmed": "#81868B",
					"border-l1": "#E7E7E9",
					"border-l2": "#DADADD",
					"border-l3": "#C9CBCF",
					"brand-primary": "#C25E02",
					"brand-primary-invert": "#FFF7ED",
					"brand-text": "#FFF7ED",
					"button-primary-fill": "#AB5302",
					"button-primary-hover": "#974902",
					"button-primary-dimmed": "#F9E8D6",
					"interactive-bg-hover": "#F4F4F5",
					"interactive-bg-active": "#F3F3F4",
					"markdown-code-block": "#F9F9FA",
					"markdown-inline-code": "#F6F6F7",
					"scrollbar-bg-l1": "#E0E0E2",
					"scrollbar-hover-l1": "#C9CBCF",
					"bg-module-platform": "#EFEFF0",
					"tooltip-bg": "#141517",
					"toast-bg": "#141517"
				},
				dark: {
					"bg-base": "#0B0C0E",
					"bg-layer-1": "#131518",
					"bg-layer-2": "#191C1F",
					"bg-layer-3": "#212529",
					"bg-overlay": "#131518",
					"label-primary": "#F0F2F5",
					"label-secondary": "#A8AEB5",
					"label-tertiary": "#8B9198",
					"label-dimmed": "#6E747B",
					"border-l1": "#24272B",
					"border-l2": "#2E3237",
					"border-l3": "#3A4046",
					"brand-primary": "#FF8C00",
					"brand-primary-invert": "#1A0F02",
					"brand-text": "#1A0F02",
					"button-primary-fill": "#FF8C00",
					"button-primary-hover": "#FF9A1F",
					"button-primary-dimmed": "#432602",
					"interactive-bg-hover": "#121416",
					"interactive-bg-active": "#111315",
					"markdown-code-block": "#0F1013",
					"markdown-inline-code": "#131518",
					"scrollbar-bg-l1": "#2A2D32",
					"scrollbar-hover-l1": "#3A4046",
					"bg-module-platform": "#191C1F",
					"tooltip-bg": "#212529",
					"toast-bg": "#212529"
				},
				specific: {
					light: {
						"sidebar-fill": "#F1F1F2",
						"sidebar-nav-item-active-accent": "#C25E02",
						"sidebar-nav-item-active": "#F9E8D6",
						"sidebar-nav-item-hover": "#F4F4F5",
						"menu": "#EFEFF0",
						"bubble": "#F9F9FA",
						"bubble-highlight": "#F9E8D6"
					},
					dark: {
						"sidebar-fill": "#0F1113",
						"sidebar-nav-item-active-accent": "#FF8C00",
						"sidebar-nav-item-active": "#432602",
						"sidebar-nav-item-hover": "#121416",
						"menu": "#212529",
						"bubble": "#16181C",
						"bubble-highlight": "#3C2202"
					}
				}
			},
			{
				id: "oc-graphite",
				name: "opencode 石墨（opencode Graphite）",
				description: "opencode 石墨变体——暖灰中性底 + 炽橙强调（#E8590C 系）",
				light: {
					"bg-base": "#F8F8F6",
					"bg-layer-1": "#F1F1EE",
					"bg-layer-2": "#F1F1EE",
					"bg-layer-3": "#EAEAE6",
					"bg-overlay": "#EAEAE6",
					"label-primary": "#1B1B1A",
					"label-secondary": "#5D5D5A",
					"label-tertiary": "#767673",
					"label-dimmed": "#868682",
					"border-l1": "#E2E2DE",
					"border-l2": "#D4D4D0",
					"border-l3": "#C4C4C0",
					"brand-primary": "#C24E02",
					"brand-primary-invert": "#FFF6EC",
					"brand-text": "#FFF6EC",
					"button-primary-fill": "#AB4502",
					"button-primary-hover": "#973D02",
					"button-primary-dimmed": "#F9E5D5",
					"interactive-bg-hover": "#EFEFEC",
					"interactive-bg-active": "#EEEEEA",
					"markdown-code-block": "#F4F4F2",
					"markdown-inline-code": "#F1F1EE",
					"scrollbar-bg-l1": "#DADAD6",
					"scrollbar-hover-l1": "#C4C4C0",
					"bg-module-platform": "#EAEAE6",
					"tooltip-bg": "#1B1B1A",
					"toast-bg": "#1B1B1A"
				},
				dark: {
					"bg-base": "#101214",
					"bg-layer-1": "#17191C",
					"bg-layer-2": "#1D2023",
					"bg-layer-3": "#25282C",
					"bg-overlay": "#17191C",
					"label-primary": "#E9ECEF",
					"label-secondary": "#9AA0A6",
					"label-tertiary": "#7E848A",
					"label-dimmed": "#5C6166",
					"border-l1": "#26292D",
					"border-l2": "#303439",
					"border-l3": "#3D4147",
					"brand-primary": "#E8590C",
					"brand-primary-invert": "#160A02",
					"brand-text": "#160A02",
					"button-primary-fill": "#E8590C",
					"button-primary-hover": "#EB6D29",
					"button-primary-dimmed": "#3C1804",
					"interactive-bg-hover": "#15171A",
					"interactive-bg-active": "#141618",
					"markdown-code-block": "#141618",
					"markdown-inline-code": "#17191C",
					"scrollbar-bg-l1": "#2C2F34",
					"scrollbar-hover-l1": "#3D4147",
					"bg-module-platform": "#1D2023",
					"tooltip-bg": "#25282C",
					"toast-bg": "#25282C"
				},
				specific: {
					light: {
						"sidebar-fill": "#ECECE8",
						"sidebar-nav-item-active-accent": "#C24E02",
						"sidebar-nav-item-active": "#F9E5D5",
						"sidebar-nav-item-hover": "#EFEFEC",
						"menu": "#EAEAE6",
						"bubble": "#F4F4F2",
						"bubble-highlight": "#F9E5D5"
					},
					dark: {
						"sidebar-fill": "#121416",
						"sidebar-nav-item-active-accent": "#E8590C",
						"sidebar-nav-item-active": "#3C1804",
						"sidebar-nav-item-hover": "#15171A",
						"menu": "#25282C",
						"bubble": "#1A1D20",
						"bubble-highlight": "#361604"
					}
				}
			}
		];
		/** Sentinel id meaning "no override / native look". */
		const DEFAULT_SKIN_ID = "default";
		/** Find a skin by id (undefined for unknown or `default`). */
		function findSkin(id) {
			if (id === "default") return void 0;
			return SKINS.find((skin) => skin.id === id);
		}
		/** Class toggled briefly around a skin swap so token-driven surfaces animate. */
		const SKIN_SWITCH_CLASS = "mg-skin-switching";
		/**
		* One-shot global color transition while a skin swap settles (~150ms). Injected
		* with the stylesheet so BOTH skin→skin and →default swaps animate the
		* token-driven surfaces without enumerating elements; stationary afterwards
		* (the rules only apply while the class is present).
		*/
		const SKIN_SWITCH_CSS = `body.${SKIN_SWITCH_CLASS},body.${SKIN_SWITCH_CLASS} *{transition:background-color .15s ease,color .15s ease,border-color .15s ease,fill .15s ease!important}`;
		/** Add the switch class, remove it once the transition has settled. */
		function flashSkinSwitch() {
			document.body.classList.add(SKIN_SWITCH_CLASS);
			window.setTimeout(() => document.body.classList.remove(SKIN_SWITCH_CLASS), 180);
		}
		/**
		* Apply (or clear) a skin by injecting/updating one `<style id="mg-dsh-skin">`
		* element in the document head. Removing is a no-op when nothing was injected.
		*/
		function applySkin(skinId) {
			let style = document.getElementById("mg-dsh-skin");
			if (style === null) {
				style = document.createElement("style");
				style.id = "mg-dsh-skin";
				document.head.appendChild(style);
			}
			const skin = findSkin(skinId);
			style.textContent = SKIN_SWITCH_CSS + (skin === void 0 ? "" : buildCss(skin));
			flashSkinSwitch();
		}
		/** True once the user explicitly picked a skin in this page lifetime. The
		* boot skin restore must not clobber a user pick that raced it (B8). */
		let userPickedSkin = false;
		/** Mark that the user explicitly picked a skin (settings card onPickSkin). */
		function markSkinUserPicked() {
			userPickedSkin = true;
		}
		/** Whether the user already picked a skin in this page lifetime. */
		function hasUserPickedSkin() {
			return userPickedSkin;
		}
		/** Read the persisted skin id through the plugin's config API. */
		async function fetchStoredSkin() {
			try {
				const res = await fetch("/api/dsh-hub/config");
				if (!res.ok) return DEFAULT_SKIN_ID;
				const body = await res.json();
				const skin = body.ok === true ? body.value?.skin : void 0;
				return typeof skin === "string" && skin !== "" ? skin : DEFAULT_SKIN_ID;
			} catch {
				return DEFAULT_SKIN_ID;
			}
		}
		//#endregion
		//#region src/client/locale.ts
		/**
		* dsh-hub client dictionary + locale plumbing.
		*
		* Language source: the official dsh locale plugin writes the active locale to
		* `document.documentElement.lang` — the same settings surface (Settings →
		* General → Language) drives every consumer, including the standalone
		* usage-stats plugin (which reuses this key convention with its own
		* dictionaries). Copy flows through `t()` so a locale switch hands every
		* consumer the active language; React consumers re-render via
		* `useLocaleLang()`, native-DOM modules resolve `t()` at open time.
		*
		* @module dsh-hub/client/locale
		*/
		/** Simplified Chinese dictionary — the key-set source of truth. */
		const zh$1 = {
			"skin.name.midnight": "午夜蓝",
			"skin.name.paper": "旧纸张",
			"skin.name.terminal": "终端绿",
			"skin.name.zcode": "ZCode",
			"skin.name.aurora": "极光紫",
			"skin.name.rx-noir-gold": "黑金",
			"skin.name.rx-crimson-horizon": "绯红地平线",
			"skin.name.rx-cyan-stage": "青蓝舞台",
			"skin.name.rx-fortune-forge": "熔炉金红",
			"skin.name.rx-rose-dawn": "玫瑰晨光",
			"skin.name.rx-sage-breeze": "鼠尾草微风",
			"skin.name.rx-spark-notebook": "火花笔记",
			"skin.name.rx-violet-starlight": "紫罗兰星光",
			"skin.name.oc-classic": "opencode 经典",
			"skin.name.oc-graphite": "opencode 石墨",
			"skin.desc.midnight": "深海蓝调，冷静专注",
			"skin.desc.paper": "暖黄米色，护眼复古",
			"skin.desc.terminal": "磷光绿，命令行质感",
			"skin.desc.zcode": "智谱 ZCode IDE 实测色板（浅色/深色）",
			"skin.desc.aurora": "紫罗兰辉光，梦幻渐变",
			"skin.desc.rx-noir-gold": "Reasonix 官方 Noir Gold——暖纸金与墨黑鎏金",
			"skin.desc.rx-crimson-horizon": "Reasonix 官方 Crimson Horizon——炽红地线，张力十足",
			"skin.desc.rx-cyan-stage": "Reasonix 官方 Cyan Stage——冰川青蓝，冷静清晰",
			"skin.desc.rx-fortune-forge": "Reasonix 官方 Fortune Forge——锻炉金红，炽热专注",
			"skin.desc.rx-rose-dawn": "Reasonix 官方 Rose Dawn——玫瑰晨雾，柔和温暖",
			"skin.desc.rx-sage-breeze": "Reasonix 官方 Sage Breeze——鼠尾草绿，自然清新",
			"skin.desc.rx-spark-notebook": "Reasonix 官方 Spark Notebook——青瓷墨黑，专注书写",
			"skin.desc.rx-violet-starlight": "Reasonix 官方 Violet Starlight——星辉紫韵，沉静深邃",
			"skin.desc.oc-classic": "opencode 官方配方——近黑/近白中性底 + 鲜橙强调（#FF8C00 系）",
			"skin.desc.oc-graphite": "opencode 石墨变体——暖灰中性底 + 炽橙强调（#E8590C 系）",
			"settings.skinSection": "界面皮肤",
			"settings.skinLabel": "界面皮肤",
			"settings.skinHint": "点击即应用并保存；「默认」恢复原生外观。深色模式下的皮肤跟随 dsh 主题设置",
			"settings.skinDefaultName": "默认",
			"settings.skinDefaultDesc": "官方原生外观",
			"settings.skinApplyFailed": "皮肤切换失败，请重试",
			"settings.title": "DSH HUB 设置",
			"settings.description": "桌面壳配置：窗口尺寸、主题与托盘行为",
			"settings.unsaved": "未保存",
			"settings.readOnly": "当前文档只读，无法保存",
			"settings.windowSection": "窗口设置",
			"settings.widthLabel": "宽度 (px)",
			"settings.heightLabel": "高度 (px)",
			"settings.themeLabel": "主题",
			"settings.themeSystem": "跟随 dsh 主题",
			"settings.themeLight": "浅色",
			"settings.themeDark": "深色",
			"settings.themeHint": "跟随 dsh 主题：dsh 设为深色窗口即深色，设为浅色窗口即浅色",
			"settings.minimizeLabel": "最小化到托盘",
			"settings.minimizeHint": "最小化时隐藏到系统托盘，任务栏入口消失",
			"settings.closeLabel": "关闭到托盘",
			"settings.closeHint": "点 X 关闭窗口时保持进程与托盘存活（不勾选则完全退出）",
			"settings.notifyLabel": "会话完成通知",
			"settings.notifyHint": "任务回合完成时弹出系统通知",
			"settings.soundLabel": "提示音",
			"settings.soundHint": "用户提问、任务完成、AI 请求批准或任务出错时播放提示音（与系统通知互相独立）",
			"settings.multiInstanceLabel": "允许同时运行多个 dsh 实例",
			"settings.multiInstanceDanger": "⚠ 危险：多个 dsh 实例共享同一份会话数据（$DSH_HOME），若同时在同一个会话中操作，会导致会话日志损坏（seq 冲突），可能丢失对话内容且需要手工修复。强烈不建议开启。",
			"settings.multiInstanceHint": "不勾选时，若检测到已有 dsh 在运行，桌面壳将拒绝启动以保护数据",
			"settings.backgroundSection": "背景图",
			"settings.backgroundLabel": "背景图",
			"settings.backgroundHint": "点击即应用并保存；「无」关闭背景图，恢复原生/皮肤背景",
			"settings.backgroundDefaultName": "无",
			"settings.backgroundDefaultDesc": "不显示背景图",
			"settings.backgroundApplyFailed": "背景切换失败，请重试",
			"settings.desktopIconSection": "桌面图标",
			"settings.desktopIconHint": "点击即保存并应用到窗口标题栏与任务栏图标；「深鲸原版」为官方鲸鱼（跟随明暗主题）",
			"settings.desktopIconApplyFailed": "图标切换失败，请重试",
			"settings.discard": "放弃",
			"settings.save": "保存",
			"settings.saving": "保存中…",
			"settings.saveFailed": "保存失败，请重试",
			"settings.saved": "已保存",
			"menu.openSession": "打开会话",
			"menu.pin": "置顶",
			"menu.unpin": "取消置顶",
			"menu.rename": "重命名",
			"menu.fork": "分叉",
			"menu.archive": "归档",
			"menu.openInExplorer": "在资源管理器中打开",
			"menu.copyPath": "复制路径",
			"menu.pinTask": "置顶任务",
			"menu.unpinTask": "取消置顶",
			"menu.renameTask": "重命名任务",
			"menu.forkSession": "分叉会话",
			"menu.archiveSession": "归档会话",
			"menu.copyWorkspacePath": "复制工作区路径",
			"menu.copyLogPath": "复制日志路径",
			"menu.copySessionId": "复制会话 ID",
			"menu.gotoConfig": "前往配置",
			"menu.refresh": "刷新",
			"ws.newTask": "新建任务",
			"ws.openWorkspace": "打开工作区"
		};
		/** English dictionary — checked complete against the zh key set. */
		const en$1 = {
			"skin.name.midnight": "Midnight Blue",
			"skin.name.paper": "Old Paper",
			"skin.name.terminal": "Terminal Green",
			"skin.name.zcode": "ZCode",
			"skin.name.aurora": "Aurora",
			"skin.name.rx-noir-gold": "Noir Gold",
			"skin.name.rx-crimson-horizon": "Crimson Horizon",
			"skin.name.rx-cyan-stage": "Cyan Stage",
			"skin.name.rx-fortune-forge": "Fortune Forge",
			"skin.name.rx-rose-dawn": "Rose Dawn",
			"skin.name.rx-sage-breeze": "Sage Breeze",
			"skin.name.rx-spark-notebook": "Spark Notebook",
			"skin.name.rx-violet-starlight": "Violet Starlight",
			"skin.name.oc-classic": "opencode Classic",
			"skin.name.oc-graphite": "opencode Graphite",
			"skin.desc.midnight": "Deep-sea blue, calm and focused",
			"skin.desc.paper": "Warm ivory, vintage paper",
			"skin.desc.terminal": "Phosphor green, command-line feel",
			"skin.desc.zcode": "ZhiPu ZCode IDE measured palette (light/dark)",
			"skin.desc.aurora": "Violet glow, dreamy gradient",
			"skin.desc.rx-noir-gold": "Reasonix official Noir Gold — warm paper gold & ink black",
			"skin.desc.rx-crimson-horizon": "Reasonix official Crimson Horizon — vivid red, high tension",
			"skin.desc.rx-cyan-stage": "Reasonix official Cyan Stage — glacier cyan, calm & clear",
			"skin.desc.rx-fortune-forge": "Reasonix official Fortune Forge — forge gold-red, blazing focus",
			"skin.desc.rx-rose-dawn": "Reasonix official Rose Dawn — rose mist, soft & warm",
			"skin.desc.rx-sage-breeze": "Reasonix official Sage Breeze — sage green, natural & fresh",
			"skin.desc.rx-spark-notebook": "Reasonix official Spark Notebook — celadon ink, focused writing",
			"skin.desc.rx-violet-starlight": "Reasonix official Violet Starlight — starlit violet, deep & quiet",
			"skin.desc.oc-classic": "opencode official recipe — near-black/white neutral base + vivid orange (#FF8C00 family)",
			"skin.desc.oc-graphite": "opencode graphite variant — warm gray base + ember orange (#E8590C family)",
			"settings.skinSection": "Interface skin",
			"settings.skinLabel": "Interface skin",
			"settings.skinHint": "Click to apply and save; \"Default\" restores the native look. Dark mode skins follow the dsh theme setting",
			"settings.skinDefaultName": "Default",
			"settings.skinDefaultDesc": "Official native look",
			"settings.skinApplyFailed": "Failed to switch skin, please retry",
			"settings.title": "DSH HUB settings",
			"settings.description": "Desktop shell: window size, theme and tray behavior",
			"settings.unsaved": "Unsaved",
			"settings.readOnly": "Current document is read-only, cannot save",
			"settings.windowSection": "Window settings",
			"settings.widthLabel": "Width (px)",
			"settings.heightLabel": "Height (px)",
			"settings.themeLabel": "Theme",
			"settings.themeSystem": "Follow dsh theme",
			"settings.themeLight": "Light",
			"settings.themeDark": "Dark",
			"settings.themeHint": "Follow dsh theme: the window follows the dsh light/dark setting",
			"settings.minimizeLabel": "Minimize to tray",
			"settings.minimizeHint": "Hide to the system tray on minimize; the taskbar entry disappears",
			"settings.closeLabel": "Close to tray",
			"settings.closeHint": "Keep the process and tray alive when the window is closed (unchecked exits fully)",
			"settings.notifyLabel": "Session completion notification",
			"settings.notifyHint": "Show a system notification when a task round completes",
			"settings.soundLabel": "Sounds",
			"settings.soundHint": "Play sounds on questions, completion, approval requests and errors (independent of notifications)",
			"settings.multiInstanceLabel": "Allow multiple dsh instances",
			"settings.multiInstanceDanger": "⚠ Danger: multiple dsh instances share the same session data ($DSH_HOME); operating on the same session concurrently can corrupt the session log (seq conflict), possibly losing conversation content and requiring manual repair. Strongly not recommended.",
			"settings.multiInstanceHint": "When unchecked, the shell refuses to start if another dsh is already running, protecting your data",
			"settings.backgroundSection": "Background image",
			"settings.backgroundLabel": "Background image",
			"settings.backgroundHint": "Click to apply and save; \"None\" disables the background image",
			"settings.backgroundDefaultName": "None",
			"settings.backgroundDefaultDesc": "No background image",
			"settings.backgroundApplyFailed": "Failed to switch background, please retry",
			"settings.desktopIconSection": "Desktop icon",
			"settings.desktopIconHint": "Click to save and apply to the titlebar and taskbar icon; \"Deep Whale\" is the official whale (follows the light/dark theme)",
			"settings.desktopIconApplyFailed": "Failed to switch icon, please retry",
			"settings.discard": "Discard",
			"settings.save": "Save",
			"settings.saving": "Saving…",
			"settings.saveFailed": "Save failed, please retry",
			"settings.saved": "Saved",
			"menu.openSession": "Open session",
			"menu.pin": "Pin",
			"menu.unpin": "Unpin",
			"menu.rename": "Rename",
			"menu.fork": "Fork",
			"menu.archive": "Archive",
			"menu.openInExplorer": "Reveal in Explorer",
			"menu.copyPath": "Copy path",
			"menu.pinTask": "Pin task",
			"menu.unpinTask": "Unpin",
			"menu.renameTask": "Rename task",
			"menu.forkSession": "Fork session",
			"menu.archiveSession": "Archive session",
			"menu.copyWorkspacePath": "Copy workspace path",
			"menu.copyLogPath": "Copy log path",
			"menu.copySessionId": "Copy session ID",
			"menu.gotoConfig": "Go to configuration",
			"menu.refresh": "Refresh",
			"ws.newTask": "New task",
			"ws.openWorkspace": "Open workspace"
		};
		/** Current locale id, cached from `<html lang>` (falls back to zh). */
		function detectLang() {
			return document.documentElement.lang?.toLowerCase().startsWith("en") ? "en" : "zh";
		}
		let lang = detectLang();
		const listeners$3 = /* @__PURE__ */ new Set();
		function notify() {
			for (const cb of listeners$3) cb();
		}
		/** Translate a key in the active language; `{name}` placeholders are filled from params. */
		function t$1(key, params) {
			let text = (lang === "en" ? en$1 : zh$1)[key] ?? zh$1[key] ?? key;
			if (params !== void 0) for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v));
			return text;
		}
		/** Subscribe to locale changes; returns an unsubscribe function. */
		function subscribeLocale(cb) {
			listeners$3.add(cb);
			return () => {
				listeners$3.delete(cb);
			};
		}
		/** Re-sync the cached locale from `<html lang>`. */
		function getLocaleLang() {
			return lang;
		}
		new MutationObserver(() => {
			const next = detectLang();
			if (next !== lang) {
				lang = next;
				notify();
			}
		}).observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["lang"]
		});
		/** React hook: the current locale lang (re-renders on switch). */
		function useLocaleLang() {
			(0, react.useSyncExternalStore)(subscribeLocale, getLocaleLang, getLocaleLang);
			return lang;
		}
		//#endregion
		//#region src/client/backgrounds.ts
		/** Sentinel id meaning "no background image / native look". */
		const DEFAULT_BACKGROUND_ID = "none";
		/** The built-in background images. Add new entries here + assets/backgrounds. */
		const BACKGROUNDS = [
			{
				id: "boat",
				name: "远航",
				description: "蓝天碧海，卡通远航",
				url: "/api/dsh-hub/backgrounds/boat.jpg"
			},
			{
				id: "yandere-home",
				name: "病娇·归家",
				description: "蓝发女仆鲸鱼娘「你终于回家了」——病娇向",
				url: "/api/dsh-hub/backgrounds/yandere-home.jpg"
			},
			{
				id: "ds-vs-gpt",
				name: "DS vs GPT",
				description: "DeepSeek API 与 GPT API 萌系小摊对决",
				url: "/api/dsh-hub/backgrounds/ds-vs-gpt.jpg"
			}
		];
		/** Find a background by id (undefined for unknown or `none`). */
		function findBackground(id) {
			if (id === "none") return void 0;
			return BACKGROUNDS.find((background) => background.id === id);
		}
		/**
		* Apply (or clear) a background by injecting/updating one
		* `<style id="mg-dsh-background">` element in the document head.
		*
		* The image must land on the app FRAME layer, not `body`: dsh's AppFrame
		* paints an opaque base over the whole viewport, so a body-level image is
		* invisible. The frame is the only `#root` descendant carrying an inline
		* `grid-template-columns` (stable structure, no CSS-module hash — see
		* docs/关键踩坑记录.md #32).
		*
		* The frame's columns then cover the image with opaque surfaces, so the
		* injected rules ALSO give each column's surface a translucent base color:
		* left bar = `--dsw-specific-sidebar-fill`, center/details content roots
		* (`[data-slot="conversation"|"details"] > div`, official slot contracts) =
		* `--dsw-alias-bg-base` — each at 75% opacity (color-mix), letting the frame
		* background image show through ~25% (user-specified 20-30%) across ALL three
		* columns while keeping the surfaces readable. The overlay is a second
		* background layer (`linear-gradient` + image) so it sits under the content
		* with zero stacking-context risk; the frame's token background-color stays
		* as the loading/fallback color.
		*/
		function applyBackground(backgroundId) {
			let style = document.getElementById("mg-dsh-background");
			if (style === null) {
				style = document.createElement("style");
				style.id = "mg-dsh-background";
				document.head.appendChild(style);
			}
			const background = findBackground(backgroundId);
			if (background === void 0) {
				style.textContent = "";
				return;
			}
			style.textContent = `#root div[style*="grid-template-columns"]{background-image:linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)),url("${background.url}") !important;background-size:cover,cover !important;background-position:center !important;background-repeat:no-repeat !important;background-attachment:fixed !important;}#root div[style*="grid-template-columns"] > div:first-child{background-color:transparent !important;}#root div[style*="grid-template-columns"] [data-slot="sidebar"] > div{background-color:color-mix(in srgb, var(--dsw-specific-sidebar-fill) 90%, transparent) !important;}#root div[style*="grid-template-columns"] [data-slot="conversation"] > div{background-color:color-mix(in srgb, var(--dsw-alias-bg-base) 75%, transparent) !important;}#root div[style*="grid-template-columns"] [data-slot="conversation"] [data-conversation-composer-overlay]{background-color:color-mix(in srgb, var(--dsw-alias-bg-base) 75%, transparent) !important;}#root div[style*="grid-template-columns"] [data-slot="details"] > div{background-color:color-mix(in srgb, var(--dsw-alias-bg-base) 90%, transparent) !important;}#dsh-hub-right-sidebar-root .mg-rs-root{background-image:linear-gradient(color-mix(in srgb, var(--dsw-specific-sidebar-fill) 90%, transparent), color-mix(in srgb, var(--dsw-specific-sidebar-fill) 90%, transparent)),linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)),url("${background.url}") !important;background-size:cover,cover,cover !important;background-position:center !important;background-repeat:no-repeat !important;background-attachment:fixed !important;}#dsh-hub-right-sidebar-root .mg-rs-root [class*="mg-rs-"]:not(.mg-rs-menu){background-color:transparent !important;}`;
		}
		/** True once the user explicitly picked a background in this page lifetime.
		* The boot background restore must not clobber a user pick that raced it. */
		let userPickedBackground = false;
		/** Mark that the user explicitly picked a background (settings card). */
		function markBackgroundUserPicked() {
			userPickedBackground = true;
		}
		/** Whether the user already picked a background in this page lifetime. */
		function hasUserPickedBackground() {
			return userPickedBackground;
		}
		/** Read the persisted background id through the plugin's config API. */
		async function fetchStoredBackground() {
			try {
				const res = await fetch("/api/dsh-hub/config");
				if (!res.ok) return DEFAULT_BACKGROUND_ID;
				const body = await res.json();
				const background = body.ok === true ? body.value?.background : void 0;
				return typeof background === "string" && background !== "" ? background : DEFAULT_BACKGROUND_ID;
			} catch {
				return DEFAULT_BACKGROUND_ID;
			}
		}
		//#endregion
		//#region src/client/conversation-rail-style.ts
		/**
		* Conversation-rail styles — a fixed-position left gutter over the
		* conversation column. One short horizontal bar per conversation segment
		* (turn), clickable to jump to that segment. Uses official dsw design tokens
		* with literal fallbacks and a stable `mg-cr-*` class prefix.
		*
		* Contrast model: tick colors come from `--mg-rail-*` custom properties that
		* conversation-rail.ts derives at runtime from the EFFECTIVE backdrop (skin
		* surface color blended with the background image under the rail) — a fixed
		* 12%-alpha border token vanished on translucent background-image surfaces.
		* The token fallbacks keep the native look when no palette was computed.
		* Every tick also carries a 1px contrast rim (`--mg-rail-ring`) so it stays
		* readable even where the sampled average misrepresents a local patch.
		*
		* @module dsh-hub/client/conversation-rail-style
		*/
		/** Conversation-rail class names — shared by the component and stylesheet. */
		const RAIL_CSS_CLASSES = {
			root: "mg-cr-root",
			tick: "mg-cr-tick",
			tickActive: "mg-cr-tick--active"
		};
		const css$1 = RAIL_CSS_CLASSES;
		const STYLE_TEXT$2 = `
.${css$1.root} {
  position: fixed;
  z-index: 1000;
  width: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  box-sizing: border-box;
  pointer-events: none;
  opacity: 0.8;
  transition: opacity 0.12s ease;
}
.${css$1.root}:hover { opacity: 1; }
.${css$1.root}[hidden] { display: none; }
.${css$1.tick} {
  pointer-events: auto;
  width: 16px;
  height: 4px;
  flex: none;
  border: 0;
  border-radius: 2px;
  padding: 0;
  background: var(--mg-rail-tick, var(--dsw-alias-border-l2, rgb(0 0 0 / 12%)));
  box-shadow: 0 0 0 1px var(--mg-rail-ring, transparent);
  cursor: pointer;
  transition: background 0.12s ease;
}
.${css$1.tick}:hover {
  background: var(--mg-rail-tick-hover, var(--dsw-alias-label-secondary, #61666b));
}
.${css$1.tickActive} {
  width: 20px;
  background: var(--mg-rail-tick-active, var(--dsw-alias-brand-primary, #3964fe));
  box-shadow:
    0 0 0 1px var(--mg-rail-ring, transparent),
    var(--dsw-shadow-lv1, 0 1px 3px rgb(0 0 0 / 20%));
}
@media (prefers-reduced-motion: reduce) {
  .${css$1.root}, .${css$1.tick} { transition: none; }
}
`;
		/** Inject the conversation-rail stylesheet once (idempotent). */
		function injectConversationRailStyle() {
			if (document.getElementById("mg-dsh-conversation-rail-style") !== null) return;
			const style = document.createElement("style");
			style.id = "mg-dsh-conversation-rail-style";
			style.textContent = STYLE_TEXT$2;
			document.head.appendChild(style);
		}
		//#endregion
		//#region src/client/conversation-rail.ts
		/**
		* Conversation rail (对话定位条) — a fixed-position left gutter over the
		* conversation column. It renders one short horizontal bar per conversation
		* segment (turn) and lets the user click a bar to jump to that segment.
		*
		* This is intentionally a lightweight minimap: positions are approximated by
		* segment index over the scrollable range, not by exact DOM message anchors
		* (the official message DOM has no stable CSS-module contract we may depend
		* on). The data source is the official session ConversationSnapshot
		* (`turnTimings`), so the bar count tracks the real turn list. Read-only —
		* the rail never writes to the session.
		*
		* Body-portal overlay: the rail is appended to `document.body` (never inside
		* an official slot), anchored to the `data-slot="conversation"` column via
		* `getBoundingClientRect()`. The disposer removes it, so HMR /
		* include.refresh rebuild cleanly.
		*
		* @module dsh-hub/client/conversation-rail
		*/
		/**
		* Palette refresh hook set by the live rail installer. The settings card and
		* the boot restore call `refreshConversationRailPalette()` after switching
		* skins/backgrounds so the rail re-derives its adaptive colors; a no-op when
		* the rail is not mounted.
		*/
		let requestPaletteRefresh = null;
		/** Ask the mounted conversation rail to re-derive its adaptive palette. */
		function refreshConversationRailPalette() {
			requestPaletteRefresh?.();
		}
		/**
		* Stable anchor for the conversation column.
		* The official slot wrapper `[data-slot="conversation"]` is rendered with
		* `display: contents` (dsh ui-renderer scoped-slots ANCHOR_STYLE) — it has NO
		* box, `getBoundingClientRect()` returns all-zero geometry, so the rail's
		* zero-size guard would keep it hidden forever (verified 0.1.1 shipped
		* client.js). Use the wrapper's child (`ConversationRoot`), the same pattern
		* backgrounds.ts already relies on. `[data-conversation-scroll]` (0.1.x scroll
		* container) is the fallback when the slot system is absent.
		*/
		const CONVERSATION_SLOT_SELECTOR = "[data-slot=\"conversation\"] > div, [data-conversation-scroll]";
		/** Install the conversation rail; returns the disposer. */
		function installConversationRail(ctx) {
			const runtime = ctx;
			let alive = true;
			let currentSessionId;
			let segmentCount = 0;
			let previews = [];
			let tooltip = null;
			let rail = null;
			let scrollContainer = null;
			let slot = null;
			let unsubSessions = () => {};
			let unsubCurrentSession = () => {};
			function parseCssColor(value) {
				const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/.exec(value);
				if (m === null) return null;
				const alpha = m[4] === void 0 ? 1 : Number(m[4]);
				if (!Number.isFinite(alpha) || alpha <= .001) return null;
				return {
					rgb: {
						r: Number(m[1]),
						g: Number(m[2]),
						b: Number(m[3])
					},
					alpha
				};
			}
			function relLum(c) {
				const f = (v) => {
					const x = v / 255;
					return x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4;
				};
				return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b);
			}
			function contrastRatio(a, b) {
				const l1 = relLum(a);
				const l2 = relLum(b);
				return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
			}
			function rgbToHsl(c) {
				const r = c.r / 255, g = c.g / 255, b = c.b / 255;
				const max = Math.max(r, g, b), min = Math.min(r, g, b);
				const l = (max + min) / 2;
				if (max === min) return {
					h: 0,
					s: 0,
					l
				};
				const d = max - min;
				const s = l > .5 ? d / (2 - max - min) : d / (max + min);
				let h;
				if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				else if (max === g) h = ((b - r) / d + 2) / 6;
				else h = ((r - g) / d + 4) / 6;
				return {
					h,
					s,
					l
				};
			}
			function hslToRgb(h, s, l) {
				const hue = (p, q, tIn) => {
					let t = tIn;
					if (t < 0) t += 1;
					if (t > 1) t -= 1;
					if (t < 1 / 6) return p + (q - p) * 6 * t;
					if (t < 1 / 2) return q;
					if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
					return p;
				};
				if (s === 0) {
					const v = Math.round(l * 255);
					return {
						r: v,
						g: v,
						b: v
					};
				}
				const q = l < .5 ? l * (1 + s) : l + s - l * s;
				const p = 2 * l - q;
				return {
					r: Math.round(hue(p, q, h + 1 / 3) * 255),
					g: Math.round(hue(p, q, h) * 255),
					b: Math.round(hue(p, q, h - 1 / 3) * 255)
				};
			}
			function loadImage(src) {
				return new Promise((resolve, reject) => {
					const img = new Image();
					img.onload = () => resolve(img);
					img.onerror = () => reject(/* @__PURE__ */ new Error("image load failed"));
					img.src = src;
				});
			}
			/**
			* Effective backdrop color under the rail: the conversation surface
			* (computed style resolves skin tokens and the color-mix translucency)
			* composited over the background-image strip under the rail, replicating
			* the CSS `cover` + center math used by backgrounds.ts (the image itself is
			* pre-tinted by a 25% black gradient layer there).
			*/
			async function sampleBackdrop() {
				const root = rail;
				const slotEl = findSlot();
				if (root === null || slotEl === null) return null;
				const surface = parseCssColor(getComputedStyle(slotEl).backgroundColor);
				const frame = document.querySelector("#root div[style*=\"grid-template-columns\"]");
				const bgCss = frame === null ? "" : getComputedStyle(frame).backgroundImage;
				const urlMatch = /url\("([^"]+)"\)/.exec(bgCss);
				if (surface === null && urlMatch === null) return null;
				if (urlMatch === null) return surface === null ? null : surface.rgb;
				try {
					const img = await loadImage(urlMatch[1]);
					const vw = window.innerWidth;
					const vh = window.innerHeight;
					const scale = Math.max(vw / img.naturalWidth, vh / img.naturalHeight);
					const offX = (vw - img.naturalWidth * scale) / 2;
					const rect = root.getBoundingClientRect();
					const centerX = rect.left + rect.width / 2;
					const sourceX = Math.min(Math.max((centerX - offX) / scale, 0), Math.max(img.naturalWidth - 1, 1));
					const sourceW = Math.max(24 / scale, 1);
					const canvas = document.createElement("canvas");
					canvas.width = 12;
					canvas.height = 48;
					const ctx2d = canvas.getContext("2d", { willReadFrequently: true });
					if (ctx2d === null) return surface === null ? null : surface.rgb;
					ctx2d.drawImage(img, sourceX, 0, sourceW, img.naturalHeight, 0, 0, 12, 48);
					const data = ctx2d.getImageData(0, 0, 12, 48).data;
					let r = 0, g = 0, b = 0, n = 0;
					for (let i = 0; i < data.length; i += 4) {
						r += data[i];
						g += data[i + 1];
						b += data[i + 2];
						n += 1;
					}
					const pixel = {
						r: r / n,
						g: g / n,
						b: b / n
					};
					const tinted = {
						r: pixel.r * .75,
						g: pixel.g * .75,
						b: pixel.b * .75
					};
					const alpha = surface?.alpha ?? 1;
					const s = surface?.rgb ?? {
						r: 255,
						g: 255,
						b: 255
					};
					const mix = (k, top, under) => k * top + (1 - k) * under;
					return {
						r: Math.round(mix(alpha, s.r, tinted.r)),
						g: Math.round(mix(alpha, s.g, tinted.g)),
						b: Math.round(mix(alpha, s.b, tinted.b))
					};
				} catch {
					return surface === null ? null : surface.rgb;
				}
			}
			/** Derive and apply the adaptive palette onto the rail root element. */
			function applyPalette() {
				const root = rail;
				if (root === null || !alive) return;
				sampleBackdrop().then((effective) => {
					if (!alive || root === null || effective === null) return;
					const { h, s } = rgbToHsl(effective);
					const deep = hslToRgb(h, Math.min(1, s * .6), .16);
					const light = hslToRgb(h, s * .3, .93);
					const useLight = contrastRatio(effective, light) > contrastRatio(effective, deep);
					const tone = useLight ? light : deep;
					const hover = hslToRgb(h, Math.min(1, s * .6 + .1), useLight ? 1 : .1);
					const sat = Math.max(.62, s);
					const activeA = hslToRgb(h, sat, .36);
					const activeB = hslToRgb(h, sat, .68);
					const active = contrastRatio(effective, activeA) >= contrastRatio(effective, activeB) ? activeA : activeB;
					root.style.setProperty("--mg-rail-tick", `rgb(${tone.r} ${tone.g} ${tone.b})`);
					root.style.setProperty("--mg-rail-tick-hover", `rgb(${hover.r} ${hover.g} ${hover.b})`);
					root.style.setProperty("--mg-rail-tick-active", `rgb(${active.r} ${active.g} ${active.b})`);
					root.style.setProperty("--mg-rail-ring", useLight ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.35)");
				});
			}
			let paletteTimer = 0;
			function schedulePaletteRefresh(delay = 120) {
				window.clearTimeout(paletteTimer);
				paletteTimer = window.setTimeout(() => {
					if (alive) applyPalette();
				}, delay);
			}
			requestPaletteRefresh = schedulePaletteRefresh;
			function findSlot() {
				return document.querySelector(CONVERSATION_SLOT_SELECTOR);
			}
			function findScrollContainer(from) {
				const explicit = from.querySelector("[data-conversation-scroll]");
				if (explicit !== null && explicit.scrollHeight > explicit.clientHeight + 1) return explicit;
				const candidates = [from, ...Array.from(from.querySelectorAll("*"))];
				for (const el of candidates) if (el.scrollHeight > el.clientHeight + 1) {
					const overflowY = getComputedStyle(el).overflowY;
					if (overflowY === "auto" || overflowY === "scroll") return el;
				}
				return null;
			}
			function ensureRail() {
				if (rail !== null && rail.isConnected) return rail;
				if (!alive) return null;
				injectConversationRailStyle();
				rail = document.createElement("div");
				rail.id = "dsh-hub-conversation-rail";
				rail.className = RAIL_CSS_CLASSES.root;
				rail.setAttribute("data-dsh-hub-conversation-rail", "");
				rail.hidden = true;
				document.body.appendChild(rail);
				return rail;
			}
			function extractNodeText(node) {
				if (node === void 0) return "";
				if (node.kind === "assistant") return (node.blocks ?? []).filter((b) => b.kind === "text" && typeof b.text === "string").map((b) => b.text ?? "").join(" ");
				if (node.kind === "user" || node.kind === "steering" || node.kind === "context") return (node.content ?? []).map((blk) => typeof blk.text === "string" ? blk.text : "").join(" ");
				if (node.kind === "command") return `/${node.name ?? ""} ${node.args ?? ""}`.trim();
				if (node.kind === "compaction") return node.summary ?? "";
				return "";
			}
			function extractTurnSummaries(snapshot) {
				const count = deriveSegmentCount(snapshot);
				if (count <= 0) return [];
				const nodes = snapshot?.nodes ?? [];
				const entries = snapshot?.turnTimings ? Array.from(snapshot.turnTimings.entries()) : [];
				const out = [];
				for (let t = 0; t < count; t += 1) {
					const range = entries[t]?.[1];
					const lo = range?.startTime ?? -Infinity;
					const hi = range?.endTime ?? Infinity;
					let userText = "";
					let fallback = "";
					for (const node of nodes) {
						if (node === void 0) continue;
						if (node.kind === "assistant") {
							if (node.turn === t) fallback += extractNodeText(node) + " ";
							continue;
						}
						if (node.time === void 0) continue;
						if (node.time >= lo && node.time < hi) {
							const txt = extractNodeText(node);
							if (node.kind === "user" || node.kind === "steering") userText += txt + " ";
							else fallback += txt + " ";
						}
					}
					out.push((userText || fallback).trim());
				}
				return out;
			}
			function ensureTooltip() {
				if (tooltip !== null && tooltip.isConnected) return tooltip;
				const tip = document.createElement("div");
				tip.id = "dsh-hub-conversation-rail-tip";
				tip.style.cssText = "position:fixed;z-index:2147483000;display:none;pointer-events:none;max-width:260px;padding:6px 10px;border-radius:6px;font-size:12px;line-height:1.5;background:var(--dsw-alias-tooltip-bg, #1f1f23);color:#e8e8ea;border:1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.25));box-shadow:var(--dsw-shadow-lv2, 0 4px 12px rgba(0,0,0,.25))";
				document.body.appendChild(tip);
				tooltip = tip;
				return tip;
			}
			function showTooltip(i, anchor) {
				const tip = ensureTooltip();
				if (tip === null) return;
				tip.textContent = previews[i] ? `第 ${i + 1} 段 · ${previews[i]}` : `第 ${i + 1} 段对话`;
				const a = anchor.getBoundingClientRect();
				tip.style.display = "block";
				tip.style.left = `${Math.max(4, a.right + 8)}px`;
				tip.style.top = `${Math.max(4, a.top - 6)}px`;
			}
			function hideTooltip() {
				if (tooltip !== null) tooltip.style.display = "none";
			}
			function deriveSegmentCount(snapshot) {
				const turns = snapshot?.turnTimings?.size ?? 0;
				if (turns > 0) return turns;
				return (snapshot?.nodes ?? []).filter((node) => node.kind === "user").length;
			}
			/** Lazily (re)resolve the conversation scroll container. The first
			* findScrollContainer call can run before the chat content overflows — leaving
			* scrollContainer null forever meant clicks and the active-tick highlight both
			* silently no-oped (Bug: rail unusable + current segment never highlighted).
			* Resolving on demand fixes both, because by click/scroll time the scroller
			* actually overflows. */
			function ensureScrollContainer() {
				if (scrollContainer === null || !scrollContainer.isConnected) {
					const slotEl = findSlot();
					scrollContainer = slotEl === null ? null : findScrollContainer(slotEl);
				}
				return scrollContainer;
			}
			function scrollToSegment(index) {
				const sc = ensureScrollContainer();
				if (sc === null || segmentCount <= 1) {
					sc?.scrollTo({ top: 0 });
					return;
				}
				const max = sc.scrollHeight - sc.clientHeight;
				sc.scrollTop = index / (segmentCount - 1) * max;
				updateActiveTick();
			}
			function renderTicks() {
				const root = ensureRail();
				if (root === null) return;
				if (segmentCount < 1) {
					root.hidden = true;
					return;
				}
				if (root.querySelectorAll(`[data-mg-cr-index]`).length === segmentCount) {
					root.hidden = false;
					updateActiveTick();
					return;
				}
				root.replaceChildren();
				for (let i = 0; i < segmentCount; i += 1) {
					const tick = document.createElement("button");
					tick.type = "button";
					tick.className = RAIL_CSS_CLASSES.tick;
					tick.dataset.mgCrIndex = String(i);
					tick.setAttribute("aria-label", `跳转到第 ${i + 1} 段对话`);
					tick.addEventListener("click", () => scrollToSegment(i));
					tick.addEventListener("mouseenter", () => showTooltip(i, tick));
					tick.addEventListener("mouseleave", hideTooltip);
					root.appendChild(tick);
				}
				root.hidden = false;
				updateActiveTick();
			}
			function updateActiveTick() {
				const root = rail;
				if (root === null || root.hidden || segmentCount < 1) return;
				const sc = ensureScrollContainer();
				if (sc === null) return;
				const max = sc.scrollHeight - sc.clientHeight;
				const ratio = max > 0 ? sc.scrollTop / max : 0;
				const activeIndex = Math.min(segmentCount - 1, Math.max(0, Math.round(ratio * (segmentCount - 1))));
				for (const el of Array.from(root.querySelectorAll(`[data-mg-cr-index]`))) {
					const index = Number(el.dataset.mgCrIndex);
					el.classList.toggle(RAIL_CSS_CLASSES.tickActive, index === activeIndex);
				}
			}
			function syncGeometry() {
				const root = ensureRail();
				if (root === null || !alive) return;
				slot = findSlot();
				if (slot === null) {
					root.hidden = true;
					return;
				}
				const rect = slot.getBoundingClientRect();
				if (rect.width === 0 || rect.height === 0) {
					root.hidden = true;
					return;
				}
				root.style.left = `${Math.max(0, rect.left + 2)}px`;
				root.style.top = `${rect.top + 8}px`;
				root.style.height = `${Math.max(0, rect.height - 16)}px`;
				scrollContainer = findScrollContainer(slot);
				root.hidden = false;
				renderTicks();
				schedulePaletteRefresh();
			}
			function refreshCurrentSession() {
				const next = (runtime.sessions?.list?.getSnapshot?.())?.current;
				if (next === currentSessionId) return;
				currentSessionId = next;
				unsubCurrentSession();
				unsubCurrentSession = () => {};
				if (currentSessionId === void 0) {
					segmentCount = 0;
					renderTicks();
					return;
				}
				const session = runtime.sessions?.binding?.(currentSessionId)?.session;
				if (session === void 0) return;
				unsubCurrentSession = session.subscribe?.(() => {
					const snap = session.getSnapshot?.();
					segmentCount = deriveSegmentCount(snap);
					previews = extractTurnSummaries(snap);
					syncGeometry();
				}) ?? (() => {});
				const snap = session.getSnapshot?.();
				segmentCount = deriveSegmentCount(snap);
				previews = extractTurnSummaries(snap);
				syncGeometry();
			}
			function onScroll() {
				updateActiveTick();
			}
			injectConversationRailStyle();
			ensureRail();
			refreshCurrentSession();
			unsubSessions = runtime.sessions?.list?.subscribe?.(() => refreshCurrentSession()) ?? (() => {});
			const bootObserver = new MutationObserver(() => {
				if (findSlot() !== null) {
					syncGeometry();
					bootObserver.disconnect();
				}
			});
			bootObserver.observe(document.body, {
				childList: true,
				subtree: true
			});
			const themeObserver = new MutationObserver(() => schedulePaletteRefresh(220));
			themeObserver.observe(document.body, {
				attributes: true,
				attributeFilter: [
					"class",
					"data-ds-dark-theme",
					"style"
				]
			});
			window.addEventListener("resize", syncGeometry);
			document.addEventListener("scroll", onScroll, true);
			setTimeout(() => {
				if (alive) syncGeometry();
			}, 500);
			return () => {
				alive = false;
				requestPaletteRefresh = null;
				window.clearTimeout(paletteTimer);
				unsubSessions();
				unsubCurrentSession();
				bootObserver.disconnect();
				themeObserver.disconnect();
				window.removeEventListener("resize", syncGeometry);
				document.removeEventListener("scroll", onScroll, true);
				rail?.remove();
				rail = null;
				tooltip?.remove();
				tooltip = null;
			};
		}
		//#endregion
		//#region src/client/desktop-icons.ts
		/** Sentinel id = the theme-aware DeepSeek whale (白鲸/黑鲸跟随明暗主题). */
		const DEFAULT_DESKTOP_ICON_ID = "default";
		/** The built-in desktop icons. Add entries here + assets/icons/*.png
		* (and the matching `include_bytes!` in src-tauri/src/helpers/theme.rs). */
		const DESKTOP_ICONS = [
			{
				id: "default",
				name: "深鲸原版",
				description: "DeepSeek 鲸鱼（白鲸/黑鲸跟随明暗主题）",
				url: "/api/dsh-hub/icons/default.png"
			},
			{
				id: "whale-girl-sad",
				name: "鲸鱼娘·微光",
				description: "蓝色鲸鱼娘，安静伤感",
				url: "/api/dsh-hub/icons/whale-girl-sad.png"
			},
			{
				id: "whale-girl-happy",
				name: "鲸鱼娘·干饭",
				description: "蓝发鲸鱼娘开心干饭",
				url: "/api/dsh-hub/icons/whale-girl-happy.png"
			},
			{
				id: "whale-girl-duo",
				name: "鲸鱼娘·伴鲸",
				description: "鲸鱼娘与蓝色鲸鱼",
				url: "/api/dsh-hub/icons/whale-girl-duo.png"
			},
			{
				id: "whale-girl-maid",
				name: "鲸鱼娘·女仆",
				description: "女仆装鲸鱼娘立绘",
				url: "/api/dsh-hub/icons/whale-girl-maid.png"
			},
			{
				id: "whale-girl-blue",
				name: "鲸鱼娘·碧波",
				description: "蓝发少女与鲸鱼",
				url: "/api/dsh-hub/icons/whale-girl-blue.png"
			}
		];
		//#endregion
		//#region src/client/settings-card.tsx
		/**
		* dsh-hub settings card — one card in the dsh settings → plugins
		* page, styled after the official PluginCard (collapsible header, themed
		* controls, save/discard footer). It edits the shell config (window size,
		* theme, tray behavior) through this plugin's own HTTP routes, and shows the
		* usage-stats ledger.
		*
		* The card renders only while the host serves the config API, which happens
		* only when the process was launched by this project (desktop shortcut /
		* `dsh-hub`); a plain command-line `dsh web` never mounts the bundle at all.
		*/
		/** Read one shell config document (GET), or null on failure. */
		async function fetchConfig() {
			try {
				const res = await fetch("/api/dsh-hub/config");
				if (!res.ok) return null;
				const body = await res.json();
				return body.ok === true && body.value !== void 0 ? body.value : null;
			} catch {
				return null;
			}
		}
		/** Write the shell config document (POST); returns the persisted value. */
		async function saveConfig(patch) {
			try {
				const res = await fetch("/api/dsh-hub/config", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(patch)
				});
				const body = await res.json();
				return res.ok && body.ok === true && body.value !== void 0 ? body.value : null;
			} catch {
				return null;
			}
		}
		/**
		* Fire the Tauri `set_desktop_icon` invoke down-link from the page
		* (D-2 channel: page → Rust via `__TAURI_INTERNALS__`, gated by the
		* `allow-set-desktop-icon` ACL entry; the host config onChange re-applies
		* through the DSH_CMD up-link as a fallback). Best-effort: when the bridge is
		* absent (plain browser / dev-server detached from the shell) the icon still
		* applies on next startup from the persisted config.
		*/
		function invokeDesktopIcon(iconId) {
			try {
				window.__TAURI_INTERNALS__?.invoke?.("set_desktop_icon", { iconId }).catch?.(() => {});
			} catch {}
		}
		/**
		* Tiny skin preview for the official Menu row "icon" slot: a 12px dot split
		* left|right into the skin's light|dark content backgrounds, with a border in
		* the active theme's brand color. Empty for the native look. Sits entirely
		* inside the official Setting-Cell / Menu structure — no new layout.
		*/
		function SkinDot({ skin }) {
			if (skin === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: CARD_CSS_CLASSES.swatchDot,
				style: { background: "var(--dsw-alias-bg-module-platform, #f5f6f7)" },
				"aria-hidden": "true"
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: CARD_CSS_CLASSES.swatchDot,
				style: { background: `linear-gradient(90deg, ${skin.light["bg-base"]} 0 50%, ${skin.dark["bg-base"]} 50% 100%)` },
				"aria-hidden": "true"
			});
		}
		/** Render the desktop-shell settings card. */
		function DesktopSettingsCard(_props) {
			const [open, setOpen] = (0, react.useState)(false);
			const [loading, setLoading] = (0, react.useState)(true);
			const [config, setConfig] = (0, react.useState)(null);
			const [draft, setDraft] = (0, react.useState)(null);
			const [saving, setSaving] = (0, react.useState)(false);
			const [failed, setFailed] = (0, react.useState)(false);
			const [saved, setSaved] = (0, react.useState)(false);
			const [skinId, setSkinId] = (0, react.useState)(DEFAULT_SKIN_ID);
			const [skinFailed, setSkinFailed] = (0, react.useState)(false);
			const [skinMenuOpen, setSkinMenuOpen] = (0, react.useState)(false);
			const [backgroundId, setBackgroundId] = (0, react.useState)(DEFAULT_BACKGROUND_ID);
			const [backgroundFailed, setBackgroundFailed] = (0, react.useState)(false);
			const [backgroundMenuOpen, setBackgroundMenuOpen] = (0, react.useState)(false);
			const [desktopIconId, setDesktopIconId] = (0, react.useState)(DEFAULT_DESKTOP_ICON_ID);
			const [desktopIconFailed, setDesktopIconFailed] = (0, react.useState)(false);
			useLocaleLang();
			const COPY = {
				title: t$1("settings.title"),
				description: t$1("settings.description"),
				unsaved: t$1("settings.unsaved"),
				readOnly: t$1("settings.readOnly"),
				windowSection: t$1("settings.windowSection"),
				widthLabel: t$1("settings.widthLabel"),
				heightLabel: t$1("settings.heightLabel"),
				themeLabel: t$1("settings.themeLabel"),
				themeOptions: {
					system: t$1("settings.themeSystem"),
					light: t$1("settings.themeLight"),
					dark: t$1("settings.themeDark")
				},
				themeHint: t$1("settings.themeHint"),
				minimizeLabel: t$1("settings.minimizeLabel"),
				minimizeHint: t$1("settings.minimizeHint"),
				closeLabel: t$1("settings.closeLabel"),
				closeHint: t$1("settings.closeHint"),
				notifyLabel: t$1("settings.notifyLabel"),
				notifyHint: t$1("settings.notifyHint"),
				soundLabel: t$1("settings.soundLabel"),
				soundHint: t$1("settings.soundHint"),
				multiInstanceLabel: t$1("settings.multiInstanceLabel"),
				multiInstanceDanger: t$1("settings.multiInstanceDanger"),
				multiInstanceHint: t$1("settings.multiInstanceHint"),
				backgroundSection: t$1("settings.backgroundSection"),
				backgroundLabel: t$1("settings.backgroundLabel"),
				backgroundHint: t$1("settings.backgroundHint"),
				backgroundDefaultName: t$1("settings.backgroundDefaultName"),
				backgroundDefaultDesc: t$1("settings.backgroundDefaultDesc"),
				backgroundApplyFailed: t$1("settings.backgroundApplyFailed"),
				desktopIconSection: t$1("settings.desktopIconSection"),
				desktopIconHint: t$1("settings.desktopIconHint"),
				desktopIconApplyFailed: t$1("settings.desktopIconApplyFailed"),
				discard: t$1("settings.discard"),
				save: t$1("settings.save"),
				saving: t$1("settings.saving"),
				saveFailed: t$1("settings.saveFailed"),
				saved: t$1("settings.saved")
			};
			/** Dictionary key for a skin's display name (keys exist for all 15 skins). */
			const skinName = (id) => t$1(`skin.name.${id}`) ?? SKINS.find((s) => s.id === id)?.name ?? id;
			/** Dictionary key for a skin's description (falls back to the static copy). */
			const skinDesc = (id) => t$1(`skin.desc.${id}`) ?? SKINS.find((s) => s.id === id)?.description ?? id;
			const saveSeq = (0, react.useRef)(0);
			(0, react.useEffect)(() => {
				let alive = true;
				fetchConfig().then((value) => {
					if (!alive) return;
					const initial = value === null ? null : {
						...value,
						width: window.innerWidth,
						height: window.innerHeight
					};
					setConfig(initial);
					setDraft(initial);
					setSkinId(initial === null ? DEFAULT_SKIN_ID : initial.skin);
					setBackgroundId(initial === null ? DEFAULT_BACKGROUND_ID : initial.background);
					setDesktopIconId(initial === null || typeof initial.desktopIcon !== "string" ? DEFAULT_DESKTOP_ICON_ID : initial.desktopIcon);
					setLoading(false);
				});
				return () => {
					alive = false;
				};
			}, []);
			const dirty = draft !== null && config !== null && (draft.width !== config.width || draft.height !== config.height || draft.theme !== config.theme || draft.minimizeToTray !== config.minimizeToTray || draft.closeToTray !== config.closeToTray || draft.notifyOnTaskComplete !== config.notifyOnTaskComplete || draft.soundEnabled !== config.soundEnabled || draft.allowMultipleInstances !== config.allowMultipleInstances);
			const blocked = !dirty || saving || draft === null;
			const patchDraft = (patch) => {
				setFailed(false);
				setSaved(false);
				setDraft((prev) => prev === null ? prev : {
					...prev,
					...patch
				});
			};
			const onSave = () => {
				if (draft === null || config === null) return;
				const patch = {};
				if (draft.width !== config.width) patch.width = draft.width;
				if (draft.height !== config.height) patch.height = draft.height;
				if (draft.theme !== config.theme) patch.theme = draft.theme;
				if (draft.minimizeToTray !== config.minimizeToTray) patch.minimizeToTray = draft.minimizeToTray;
				if (draft.closeToTray !== config.closeToTray) patch.closeToTray = draft.closeToTray;
				if (draft.notifyOnTaskComplete !== config.notifyOnTaskComplete) patch.notifyOnTaskComplete = draft.notifyOnTaskComplete;
				if (draft.soundEnabled !== config.soundEnabled) patch.soundEnabled = draft.soundEnabled;
				if (draft.allowMultipleInstances !== config.allowMultipleInstances) patch.allowMultipleInstances = draft.allowMultipleInstances;
				if (Object.keys(patch).length === 0) return;
				const seq = ++saveSeq.current;
				setSaving(true);
				setFailed(false);
				setSaved(false);
				saveConfig(patch).then((saved) => {
					if (seq !== saveSeq.current) return;
					setSaving(false);
					if (saved !== null) {
						setConfig(saved);
						const replay = { ...patch };
						if (typeof replay.width === "number") replay.width = Math.floor(Math.min(Math.max(replay.width, 480), 7680));
						if (typeof replay.height === "number") replay.height = Math.floor(Math.min(Math.max(replay.height, 360), 4320));
						setDraft({
							...saved,
							...replay
						});
						setSaved(true);
					} else setFailed(true);
				});
			};
			const onDiscard = () => {
				setDraft(config);
				setFailed(false);
				setSaved(false);
			};
			/** Apply a skin immediately: persist, then restyle the page live. */
			const onPickSkin = (id) => {
				if (id === skinId) return;
				const previous = skinId;
				markSkinUserPicked();
				setSkinFailed(false);
				setSkinId(id);
				applySkin(id);
				refreshConversationRailPalette();
				const seq = ++saveSeq.current;
				saveConfig({ skin: id }).then((value) => {
					if (seq !== saveSeq.current) return;
					if (value !== null) {
						setConfig((prev) => prev === null ? prev : {
							...prev,
							skin: id
						});
						setDraft((prev) => prev === null ? prev : {
							...prev,
							skin: id
						});
						setSaving(false);
					} else {
						applySkin(previous);
						refreshConversationRailPalette();
						setSkinId(previous);
						setSkinFailed(true);
						setSaving(false);
					}
				});
			};
			/** Apply a background immediately: persist, then restyle the page live. */
			const onPickBackground = (id) => {
				if (id === backgroundId) return;
				const previous = backgroundId;
				markBackgroundUserPicked();
				setBackgroundFailed(false);
				setBackgroundId(id);
				applyBackground(id);
				refreshConversationRailPalette();
				const seq = ++saveSeq.current;
				setSaving(true);
				saveConfig({ background: id }).then((value) => {
					if (seq !== saveSeq.current) return;
					if (value !== null) {
						setConfig((prev) => prev === null ? prev : {
							...prev,
							background: id
						});
						setDraft((prev) => prev === null ? prev : {
							...prev,
							background: id
						});
						setSaving(false);
					} else {
						applyBackground(previous);
						refreshConversationRailPalette();
						setBackgroundId(previous);
						setBackgroundFailed(true);
						setSaving(false);
					}
				});
			};
			/** Apply a desktop icon immediately: invoke the shell + persist the id.
			* The window/taskbar glyph is re-applied live; unknown ids fall back to the
			* white whale on the Rust side. */
			const onPickDesktopIcon = (id) => {
				if (id === desktopIconId) return;
				const previous = desktopIconId;
				setDesktopIconFailed(false);
				setDesktopIconId(id);
				invokeDesktopIcon(id);
				const seq = ++saveSeq.current;
				setSaving(true);
				saveConfig({ desktopIcon: id }).then((value) => {
					if (seq !== saveSeq.current) return;
					if (value !== null) {
						setConfig((prev) => prev === null ? prev : {
							...prev,
							desktopIcon: id
						});
						setDraft((prev) => prev === null ? prev : {
							...prev,
							desktopIcon: id
						});
						setSaving(false);
					} else {
						setDesktopIconId(previous);
						setDesktopIconFailed(true);
						setSaving(false);
					}
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: clsx(CARD_CSS_CLASSES.card, open && CARD_CSS_CLASSES.cardOpen),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: CARD_CSS_CLASSES.header,
					"aria-expanded": open,
					"aria-label": `${open ? "收起" : "展开"}: ${COPY.title}`,
					onClick: () => {
						setOpen(!open);
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: CARD_CSS_CLASSES.headText,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: CARD_CSS_CLASSES.name,
								children: COPY.title
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: CARD_CSS_CLASSES.description,
								children: COPY.description
							})]
						}),
						dirty ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: CARD_CSS_CLASSES.pending,
							children: COPY.unsaved
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: clsx(CARD_CSS_CLASSES.chevron, open && CARD_CSS_CLASSES.chevronOpen) })
					]
				}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: CARD_CSS_CLASSES.body,
					children: [loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: CARD_CSS_CLASSES.loading,
						role: "status",
						"aria-label": "读取配置…"
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						draft !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: CARD_CSS_CLASSES.section,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: CARD_CSS_CLASSES.sectionTitle,
									children: COPY.windowSection
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: CARD_CSS_CLASSES.field,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: CARD_CSS_CLASSES.fieldLabel,
										children: COPY.widthLabel
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										className: CARD_CSS_CLASSES.input,
										type: "number",
										min: 480,
										max: Math.floor(window.screen.width),
										"aria-label": COPY.widthLabel,
										value: draft.width,
										onChange: (event) => {
											const width = Number(event.target.value);
											patchDraft({ width: Number.isFinite(width) ? Math.floor(width) : draft.width });
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: CARD_CSS_CLASSES.field,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: CARD_CSS_CLASSES.fieldLabel,
										children: COPY.heightLabel
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										className: CARD_CSS_CLASSES.input,
										type: "number",
										min: 360,
										max: Math.floor(window.screen.height),
										"aria-label": COPY.heightLabel,
										value: draft.height,
										onChange: (event) => {
											const height = Number(event.target.value);
											patchDraft({ height: Number.isFinite(height) ? Math.floor(height) : draft.height });
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: CARD_CSS_CLASSES.field,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: CARD_CSS_CLASSES.fieldLabel,
											children: COPY.themeLabel
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
											className: CARD_CSS_CLASSES.select,
											"aria-label": COPY.themeLabel,
											value: draft.theme,
											onChange: (event) => {
												const theme = event.target.value;
												if (theme === "system" || theme === "light" || theme === "dark") patchDraft({ theme });
											},
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
													value: "system",
													children: COPY.themeOptions.system
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
													value: "light",
													children: COPY.themeOptions.light
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
													value: "dark",
													children: COPY.themeOptions.dark
												})
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: CARD_CSS_CLASSES.hint,
											children: COPY.themeHint
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: CARD_CSS_CLASSES.checkboxRow,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: draft.minimizeToTray,
										onChange: (event) => patchDraft({ minimizeToTray: event.target.checked })
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: COPY.minimizeLabel })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: CARD_CSS_CLASSES.hint,
									children: COPY.minimizeHint
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: CARD_CSS_CLASSES.checkboxRow,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: draft.closeToTray,
										onChange: (event) => patchDraft({ closeToTray: event.target.checked })
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: COPY.closeLabel })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: CARD_CSS_CLASSES.hint,
									children: COPY.closeHint
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: CARD_CSS_CLASSES.checkboxRow,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: draft.notifyOnTaskComplete,
										onChange: (event) => patchDraft({ notifyOnTaskComplete: event.target.checked })
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: COPY.notifyLabel })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: CARD_CSS_CLASSES.hint,
									children: COPY.notifyHint
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: CARD_CSS_CLASSES.checkboxRow,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: draft.soundEnabled,
										onChange: (event) => patchDraft({ soundEnabled: event.target.checked })
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: COPY.soundLabel })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: CARD_CSS_CLASSES.hint,
									children: COPY.soundHint
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: CARD_CSS_CLASSES.checkboxRow,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: draft.allowMultipleInstances,
										onChange: (event) => patchDraft({ allowMultipleInstances: event.target.checked })
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: COPY.multiInstanceLabel })]
								}),
								draft.allowMultipleInstances ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: CARD_CSS_CLASSES.dangerHint,
									role: "alert",
									children: COPY.multiInstanceDanger
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: CARD_CSS_CLASSES.hint,
									children: COPY.multiInstanceHint
								})
							]
						}),
						draft !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: CARD_CSS_CLASSES.section,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: CARD_CSS_CLASSES.fieldRow,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: CARD_CSS_CLASSES.fieldLabel,
										children: t$1("settings.skinLabel")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
										open: skinMenuOpen,
										onClose: () => {
											setSkinMenuOpen(false);
										},
										items: [{
											id: "default",
											label: t$1("settings.skinDefaultName"),
											icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkinDot, { skin: void 0 })
										}, ...SKINS.map((skin) => ({
											id: skin.id,
											label: skinName(skin.id),
											icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkinDot, { skin })
										}))],
										selectedId: skinId,
										onSelect: (id) => {
											onPickSkin(id);
											setSkinMenuOpen(false);
										},
										align: "end",
										portal: true,
										anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: CARD_CSS_CLASSES.selectPill,
											"aria-haspopup": "menu",
											"aria-expanded": skinMenuOpen,
											onClick: () => {
												setSkinMenuOpen((v) => !v);
											},
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkinDot, { skin: SKINS.find((skin) => skin.id === skinId) }),
												skinId === "default" ? t$1("settings.skinDefaultName") : skinName(skinId),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, {})
											]
										})
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: CARD_CSS_CLASSES.hint,
									children: [
										skinId === "default" ? t$1("settings.skinDefaultDesc") : skinDesc(skinId),
										" — ",
										t$1("settings.skinHint")
									]
								}),
								skinFailed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: CARD_CSS_CLASSES.failed,
									role: "status",
									children: t$1("settings.skinApplyFailed")
								}) : null
							]
						}),
						draft !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: CARD_CSS_CLASSES.section,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: CARD_CSS_CLASSES.sectionTitle,
									children: COPY.backgroundSection
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: CARD_CSS_CLASSES.fieldRow,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: CARD_CSS_CLASSES.fieldLabel,
										children: COPY.backgroundLabel
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
										open: backgroundMenuOpen,
										onClose: () => {
											setBackgroundMenuOpen(false);
										},
										items: [{
											id: "none",
											label: COPY.backgroundDefaultName
										}, ...BACKGROUNDS.map((background) => ({
											id: background.id,
											label: background.name
										}))],
										selectedId: backgroundId,
										onSelect: (id) => {
											onPickBackground(id);
											setBackgroundMenuOpen(false);
										},
										align: "end",
										portal: true,
										anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: CARD_CSS_CLASSES.selectPill,
											"aria-haspopup": "menu",
											"aria-expanded": backgroundMenuOpen,
											onClick: () => {
												setBackgroundMenuOpen((v) => !v);
											},
											children: [backgroundId === "none" ? COPY.backgroundDefaultName : BACKGROUNDS.find((background) => background.id === backgroundId)?.name ?? backgroundId, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, {})]
										})
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: CARD_CSS_CLASSES.hint,
									children: [
										backgroundId === "none" ? COPY.backgroundDefaultDesc : BACKGROUNDS.find((background) => background.id === backgroundId)?.description ?? "",
										" — ",
										COPY.backgroundHint
									]
								}),
								backgroundFailed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: CARD_CSS_CLASSES.failed,
									role: "status",
									children: COPY.backgroundApplyFailed
								}) : null
							]
						}),
						draft !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: CARD_CSS_CLASSES.section,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: CARD_CSS_CLASSES.sectionTitle,
									children: COPY.desktopIconSection
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: CARD_CSS_CLASSES.hint,
									children: COPY.desktopIconHint
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: CARD_CSS_CLASSES.iconGrid,
									role: "radiogroup",
									"aria-label": COPY.desktopIconSection,
									children: DESKTOP_ICONS.map((icon) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										role: "radio",
										"aria-checked": desktopIconId === icon.id,
										className: clsx(CARD_CSS_CLASSES.iconCell, desktopIconId === icon.id && CARD_CSS_CLASSES.iconSelected),
										onClick: () => {
											onPickDesktopIcon(icon.id);
										},
										title: `${icon.name} — ${icon.description}`,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
											className: CARD_CSS_CLASSES.iconPreview,
											src: icon.url,
											alt: icon.name,
											width: 56,
											height: 56,
											draggable: false
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: CARD_CSS_CLASSES.iconName,
											children: icon.name
										})]
									}, icon.id))
								}),
								desktopIconFailed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: CARD_CSS_CLASSES.failed,
									role: "status",
									children: COPY.desktopIconApplyFailed
								}) : null
							]
						})
					] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: CARD_CSS_CLASSES.footer,
						children: [
							failed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: CARD_CSS_CLASSES.failed,
								role: "status",
								children: COPY.saveFailed
							}) : null,
							saved ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: CARD_CSS_CLASSES.saved,
								role: "status",
								children: COPY.saved
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: CARD_CSS_CLASSES.discard,
								disabled: blocked,
								onClick: onDiscard,
								children: COPY.discard
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: CARD_CSS_CLASSES.save,
								disabled: blocked,
								onClick: onSave,
								children: COPY[saving ? "saving" : "save"]
							})
						]
					})]
				}) : null]
			});
		}
		//#endregion
		//#region src/client/right-sidebar-style.ts
		/**
		* Right-sidebar styles — injected as a string (same rationale as the card
		* stylesheet: tsdown extracts .css files the dsh client loader never fetches).
		* Uses official `--dsw-alias-*` / `--dsw-specific-*` tokens and the upstream
		* sidebar geometry (ui-sidebar/SidebarRoot.module.css): round icon buttons,
		* 13–14px type scale, and the settings-page tab underline.
		*/
		/** Right-sidebar class names shared by the component and the stylesheet. */
		const RIGHT_SIDEBAR_CSS_CLASSES = {
			root: "mg-rs-root",
			collapsed: "mg-rs-collapsed",
			header: "mg-rs-header",
			headerTop: "mg-rs-header-top",
			title: "mg-rs-title",
			toggle: "mg-rs-toggle",
			toggleIcon: "mg-rs-toggle-icon",
			body: "mg-rs-body",
			rail: "mg-rs-rail",
			railItems: "mg-rs-rail-items",
			railPlaceholder: "mg-rs-rail-placeholder",
			railItem: "mg-rs-rail-item",
			tabs: "mg-rs-tabs",
			tab: "mg-rs-tab",
			tabActive: "mg-rs-tab-active",
			content: "mg-rs-content",
			section: "mg-rs-section",
			sectionTitle: "mg-rs-section-title",
			refresh: "mg-rs-refresh",
			topRow: "mg-rs-top-row",
			topBtn: "mg-rs-top-btn",
			chartWrap: "mg-rs-chart-wrap",
			chart: "mg-rs-chart",
			chartCenter: "mg-rs-chart-center",
			legend: "mg-rs-legend",
			legendRow: "mg-rs-legend-row",
			legendDot: "mg-rs-legend-dot",
			card: "mg-rs-card",
			statGrid: "mg-rs-stat-grid",
			statCard: "mg-rs-stat-card",
			statHead: "mg-rs-stat-head",
			statIcon: "mg-rs-stat-icon",
			statLabel: "mg-rs-stat-label",
			statValue: "mg-rs-stat-value",
			tree: "mg-rs-tree",
			treeRow: "mg-rs-tree-row",
			treeIcon: "mg-rs-tree-icon",
			treeName: "mg-rs-tree-name",
			treeChildren: "mg-rs-tree-children",
			menu: "mg-rs-menu",
			menuItem: "mg-rs-menu-item",
			menuIcon: "mg-rs-menu-icon",
			menuLabel: "mg-rs-menu-label",
			gitBranchCard: "mg-rs-git-branch-card",
			gitBranchIcon: "mg-rs-git-branch-icon",
			gitBranchName: "mg-rs-git-branch-name",
			gitBranchHead: "mg-rs-git-branch-head",
			gitGroupHead: "mg-rs-git-group-head",
			gitGroupBadge: "mg-rs-git-group-badge",
			gitChanges: "mg-rs-git-changes",
			gitChange: "mg-rs-git-change",
			gitStatus: "mg-rs-git-status",
			empty: "mg-rs-empty"
		};
		const c$1 = RIGHT_SIDEBAR_CSS_CLASSES;
		const STYLE_TEXT$1 = `
.${c$1.root} {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-layer-2, #ffffff));
  color: var(--dsw-alias-label-primary, #0f1115);
  font-family: var(--dsw-font-family);
  font-size: 14px;
  border-left: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  overflow: hidden;
  pointer-events: auto;
  transition: width var(--ds-transition-duration-slow) var(--ds-ease-in-out);
}
.${c$1.header} {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 8px 0 0;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: transparent;
}
.${c$1.headerTop} {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
}
.${c$1.title} {
  font-size: 14px;
  line-height: 22px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c$1.toggle} {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  margin-left: auto;
  margin-right: 6px;
  margin-bottom: 6px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #61666b);
  cursor: pointer;
}
.${c$1.toggle}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
.${c$1.toggle}:active { background: var(--dsw-alias-interactive-bg-active, rgb(0 0 0 / 10%)); }
.${c$1.toggle}:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #3964fe); outline-offset: 1px; }
.${c$1.toggleIcon} { transform: scaleX(-1); }
.${c$1.body} {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
/* Tabs mirror the center column's conversation/trajectory tab group
   (ui-conversation ConversationRoot.module.css): 36px gap, 13/16/500 text,
   tertiary ink, and a 2px business-blue active bar on the selected tab. */
.${c$1.tabs} {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  gap: 36px;
  margin-top: 4px;
  padding-left: 8px;
  min-width: 0;
  overflow: visible;
}
.${c$1.tab} {
  position: relative;
  flex: none;
  padding: 0 0 11px;
  border: none;
  background: transparent;
  font-size: 13px;
  line-height: 16px;
  font-weight: 500;
  color: var(--dsw-alias-label-tertiary, #81858c);
  cursor: pointer;
}
.${c$1.tab}::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 1px;
  left: 0;
  height: 2px;
  border-radius: 2px;
  background: transparent;
}
/* Selected tab is blue, not ink — same as the official conversation tabs. */
.${c$1.tabActive} {
  color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${c$1.tabActive}::after {
  background: var(--dsw-alias-state-business-primary, #3964fe);
}
.${c$1.tab}:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #3964fe);
  outline-offset: 2px;
  border-radius: 2px;
  color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${c$1.content} {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
}
.${c$1.content}::-webkit-scrollbar { width: 8px; }
.${c$1.content}::-webkit-scrollbar-thumb {
  background: var(--dsw-alias-scrollbar-bg-l2, rgb(0 0 0 / 12%));
  border-radius: 4px;
}
.${c$1.content}::-webkit-scrollbar-track { background: transparent; }
.${c$1.section} { margin-bottom: 16px; }
.${c$1.sectionTitle} {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f1115);
  margin-bottom: 8px;
}
.${c$1.refresh} {
  margin-left: auto;
  padding: 5px 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-3, #ffffff);
  color: var(--dsw-alias-label-secondary, #61666b);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  cursor: pointer;
}
.${c$1.refresh}:hover {
  color: var(--dsw-alias-label-primary, #0f1115);
  border-color: var(--dsw-alias-label-dimmed, rgb(0 0 0 / 20%));
  background: var(--dsw-alias-button-floating-hover, #f1f3f5);
}
/* Top action row (open workspace folder / terminal) above the tabs. */
.${c$1.topRow} {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 6px;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
.${c$1.topBtn} {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border: 1px solid var(--dsw-alias-state-business-primary, #3964fe);
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-state-business-primary, #3964fe);
  font: inherit;
  font-size: 12px;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
}
.${c$1.topBtn}:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%));
}
.${c$1.topBtn}:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #3964fe);
  outline-offset: 1px;
}
.${c$1.chartWrap} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
/* Reasonix-style rounded card framing a group of info, using dsh tokens. */
.${c$1.card} {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-1, #ffffff);
}
.${c$1.chart} {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, var(--dsw-alias-state-business-primary, #3964fe) 0%, var(--dsw-alias-border-l2, #d4d4d8) 100%);
}
.${c$1.chartCenter} {
  position: absolute;
  inset: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-primary, #0f1115);
  background: var(--dsw-alias-bg-layer-3, #ffffff);
}
.${c$1.legend} { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.${c$1.legendRow} {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c$1.legendDot} { width: 10px; height: 10px; border-radius: 50%; flex: none; }
.${c$1.statGrid} { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
/* Reasonix-style stat card: small icon + caption label above a bold value. */
.${c$1.statCard} {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-1, #ffffff);
}
.${c$1.statHead} {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.${c$1.statIcon} { flex: none; color: var(--dsw-alias-state-business-primary, #3964fe); }
.${c$1.statLabel} {
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-tertiary, #81858c);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${c$1.statValue} {
  font-size: 15px;
  line-height: 22px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f1115);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${c$1.tree} { list-style: none; margin: 0; padding: 0; }
.${c$1.treeRow} {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: default;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
}
.${c$1.treeRow}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
.${c$1.treeIcon} { flex: none; color: var(--dsw-alias-label-secondary, #61666b); }
.${c$1.treeName} { overflow: hidden; text-overflow: ellipsis; }
.${c$1.treeChildren} { list-style: none; margin: 0; padding-left: 16px; }
/* Tree-node context menu (right-click): fixed plate pinned to the cursor,
   token-colored like the official menu surfaces. */
.${c$1.menu} {
  position: fixed;
  z-index: 1000;
  min-width: 180px;
  padding: 4px;
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 8px;
  box-shadow: var(--dsw-shadow-lv2, 0 6px 24px rgb(0 0 0 / 20%));
  font-family: var(--dsw-font-family);
  font-size: 13px;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c$1.menuItem} {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  cursor: pointer;
}
.${c$1.menuItem}:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%));
}
.${c$1.menuItem}:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #3964fe);
  outline-offset: 1px;
}
.${c$1.menuIcon} {
  flex: none;
  display: inline-flex;
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${c$1.menuLabel} {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${c$1.gitBranchCard} {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
.${c$1.gitBranchIcon} { flex: none; color: var(--dsw-alias-state-business-primary, #3964fe); }
.${c$1.gitBranchName} {
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary, #0f1115);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${c$1.gitBranchHead} {
  margin-left: auto;
  flex: none;
  font-size: 12px;
  line-height: 18px;
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${c$1.gitGroupHead} {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c$1.gitGroupBadge} {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--dsw-alias-bg-module-platform, #f5f6f7);
  color: var(--dsw-alias-label-secondary, #61666b);
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.${c$1.gitChanges} { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.${c$1.gitChange} {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 20px;
}
.${c$1.gitChange}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
.${c$1.gitStatus} {
  flex: none;
  min-width: 22px;
  text-align: center;
  padding: 1px 5px;
  border-radius: 6px;
  font-size: 11px;
  line-height: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
/* Semantic git-status badges, mirroring Reasonix's per-status coloring but
   driven by dsh state tokens. */
.${c$1.gitStatus}-added {
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 14%, transparent);
  color: var(--dsw-alias-state-success-primary, #22c55e);
}
.${c$1.gitStatus}-modified {
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f59e0b) 14%, transparent);
  color: var(--dsw-alias-state-warn-primary, #f59e0b);
}
.${c$1.gitStatus}-deleted {
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #ec1919) 12%, transparent);
  color: var(--dsw-alias-state-error-primary, #ec1919);
}
.${c$1.gitStatus}-renamed {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3964fe) 14%, transparent);
  color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${c$1.gitStatus}-untracked {
  background: var(--dsw-alias-bg-module-platform, #f5f6f7);
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${c$1.empty} { padding: 12px 0; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-tertiary, #81858c); }
.${c$1.collapsed} {
  width: 56px;
  overflow: visible;
}
.${c$1.rail} {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  padding: 18px 10px 6px;
  height: 100%;
  box-sizing: border-box;
}
.${c$1.railItems} {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
}
.${c$1.railPlaceholder} {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px dashed var(--dsw-alias-border-l2, rgb(0 0 0 / 12%));
  background: var(--dsw-alias-bg-layer-3, rgb(0 0 0 / 2%));
}
.${c$1.railItem} {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--dsw-alias-label-primary, #0f1115);
  cursor: pointer;
}
.${c$1.railItem}:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%));
  color: var(--dsw-alias-label-primary, #0f1115);
}
/* Left-side tooltip: the visual spec mirrors the official Tooltip bubble
   (ui-primitives Tooltip.module.css) — dark tooltip-bg plate, white
   bluish-00 text, 13/20 type, 3px 7px padding, 8px radius, z-index 100 —
   while staying a CSS ::after (the official component only places right/
   bottom/top, and these rail buttons must pop left). Hover logic matches
   the left sidebar's delayMs=500: 500ms delay before the 150ms fade-in,
   immediate hide on leave. */
.${c$1.toggle},
.${c$1.railItem} {
  position: relative;
}
.${c$1.toggle}::after,
.${c$1.railItem}::after {
  content: attr(data-tip);
  position: absolute;
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  width: max-content;
  max-width: 50vw;
  white-space: pre-line;
  overflow-wrap: break-word;
  background: var(--dsw-alias-tooltip-bg, #2c2c2e);
  color: var(--dsw-static-neutral-bluish-00, #ffffff);
  font-size: 13px;
  line-height: 20px;
  padding: 3px 7px;
  border-radius: 8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0s ease 0s;
  z-index: 100;
}
.${c$1.toggle}:hover::after,
.${c$1.railItem}:hover::after {
  opacity: 1;
  transition: opacity 150ms var(--ds-ease-in-out, ease) 500ms;
}
/* Reserve the sidebar width in the official AppFrame layout: --mg-sidebar-width
   is 360px while open and 56px while collapsed. The center column gives up
   exactly that width, combined with better-sidebar's own var so both plugins
   can coexist. */
body #root {
  margin-right: calc(var(--dsh-sidebar-width, 0px) + var(--mg-sidebar-width, 0px));
  transition: margin-right var(--ds-transition-duration-slow) var(--ds-ease-in-out);
}
@media (prefers-reduced-motion: reduce) {
  #root { transition: none; }
}
`;
		/** Inject the right-sidebar stylesheet once (idempotent). */
		function injectRightSidebarStyle() {
			const id = "mg-right-sidebar-style";
			if (document.getElementById(id) !== null) return;
			const style = document.createElement("style");
			style.id = id;
			style.textContent = STYLE_TEXT$1;
			document.head.appendChild(style);
		}
		//#endregion
		//#region src/client/terminal-prefs.ts
		/**
		* Terminal preferences — font size, color theme and default shell for the PTY
		* dock, persisted to localStorage under `dsh-hub:terminal-prefs`. Survives
		* reloads; lives in its own module so the dock and any future settings surface
		* share one store.
		*
		* Client plugin module (settings store). Public API:
		*   subscribePrefs / getPrefs / usePrefs — external-store access
		*   setFontSize(n)  — clamp 9..24, persist, notify
		*   toggleTheme()   — flip dark/light, persist, notify
		*   setShell(id)    — default shell for new PTY tabs, persist, notify
		*/
		const KEY$1 = "dsh-hub:terminal-prefs";
		/** Legacy dot-separated key — migrated to KEY once (idempotent). */
		const LEGACY_KEY$1 = "dsh-hub.terminal.prefs";
		const listeners$2 = /* @__PURE__ */ new Set();
		/** Read the persisted prefs, migrating the legacy key on first load. */
		function readStored$1() {
			try {
				const current = localStorage.getItem(KEY$1);
				if (current !== null) return current;
				const legacy = localStorage.getItem(LEGACY_KEY$1);
				if (legacy === null) return null;
				try {
					localStorage.setItem(KEY$1, legacy);
					localStorage.removeItem(LEGACY_KEY$1);
				} catch {}
				return legacy;
			} catch {
				return null;
			}
		}
		/** Load persisted prefs; corrupt or unreadable storage falls back to defaults. */
		function load$1() {
			const raw = readStored$1();
			if (raw === null) return {
				fontSize: 13,
				dark: true,
				shell: "powershell"
			};
			try {
				const p = JSON.parse(raw);
				return {
					fontSize: p.fontSize ?? 13,
					dark: p.dark ?? true,
					shell: p.shell ?? "powershell"
				};
			} catch {}
			return {
				fontSize: 13,
				dark: true,
				shell: "powershell"
			};
		}
		let prefs = load$1();
		function emit$2() {
			for (const l of listeners$2) l();
		}
		function save$1() {
			try {
				localStorage.setItem(KEY$1, JSON.stringify(prefs));
			} catch {}
			const token = globalThis.__DSH_HUB_TOKEN__ ?? "";
			if (token === "") return;
			fetch("/api/dsh-hub/pty/prefs", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					Authorization: "Bearer " + token
				},
				body: JSON.stringify(prefs)
			}).catch(() => {});
		}
		/**
		* Load persisted prefs from the HOST (survives the random per-launch origin).
		* Called once at assembly; the host value wins over the (possibly stale)
		* localStorage copy, then the dock re-renders.
		*/
		async function syncHostPrefs() {
			const token = globalThis.__DSH_HUB_TOKEN__ ?? "";
			if (token === "") return;
			try {
				const res = await fetch("/api/dsh-hub/pty/prefs", { headers: { Authorization: "Bearer " + token } });
				if (!res.ok) return;
				const body = await res.json();
				if (body.ok !== true || body.prefs === void 0) return;
				const p = body.prefs;
				const next = {
					fontSize: typeof p.fontSize === "number" ? p.fontSize : prefs.fontSize,
					dark: typeof p.dark === "boolean" ? p.dark : prefs.dark,
					shell: p.shell ?? prefs.shell
				};
				if (next.fontSize !== prefs.fontSize || next.dark !== prefs.dark || next.shell !== prefs.shell) {
					prefs = next;
					emit$2();
				}
			} catch {}
		}
		/**
		* Subscribe to preference changes.
		* @returns an unsubscribe function.
		*/
		function subscribePrefs(cb) {
			listeners$2.add(cb);
			return () => {
				listeners$2.delete(cb);
			};
		}
		/** Current preference snapshot. */
		function getPrefs() {
			return prefs;
		}
		/** React hook: subscribe to the current preferences. */
		function usePrefs() {
			return (0, react.useSyncExternalStore)(subscribePrefs, () => prefs);
		}
		/**
		* Set the terminal font size, clamped to the 9..24 range, and persist it.
		* @param n - requested font size (px).
		*/
		function setFontSize(n) {
			prefs = {
				...prefs,
				fontSize: Math.max(9, Math.min(24, n))
			};
			save$1();
			emit$2();
		}
		/** Toggle the terminal color theme (dark/light) and persist it. */
		function toggleTheme() {
			prefs = {
				...prefs,
				dark: !prefs.dark
			};
			save$1();
			emit$2();
		}
		/**
		* Set the default shell for NEW PTY tabs and persist it. The host validates
		* availability on create; the caller (dock settings) only offers shells the
		* availability probe reported.
		* @param id - one of the detected shell ids.
		*/
		function setShell(id) {
			if (prefs.shell === id) return;
			prefs = {
				...prefs,
				shell: id
			};
			save$1();
			emit$2();
		}
		//#endregion
		//#region src/client/pty-store.ts
		/**
		* PTY client store — one real interactive shell session per tab, streamed
		* from the host over SSE. Shared by the bottom-docked terminal panel
		* (terminal-dock.tsx) and the sidebar/button openers.
		*
		* Client plugin module (Manager-style store). Public API:
		*   bindPtyRuntime(ctx)   — plug the dsh client runtime for entry-cwd resolution
		*   subscribePty / usePty — external-store subscription over the panel state
		*   ptyOpen / ptyToggle   — open the panel (+ a tab) / toggle it
		*   createTab / closeTab  — tab lifecycle (close is server-confirmed)
		*   setActiveTab / ptyClosePanel
		*   ptySendRaw / ptyResizeClient — input + size reporting
		*   ptySubscribeData      — raw output chunks (replays the ring buffer)
		*   ptyRetarget           — follow a workspace switch with Set-Location
		*   resolveEntryCwd       — unified entry working directory for new tabs
		*
		* Transport contract (M4.2 host): POST /api/dsh-hub/pty/{create,close,write,resize}
		* and GET /api/dsh-hub/pty/stream?token=...&id=... (SSE). Every SSE frame is a
		* JSON envelope: `data: JSON.stringify(chunk)` where chunk is either a plain
		* output string or `{ data?: string, error?: string }`. Auth: the host injects
		* the token via the dsh `webserver/index-inject` event as a global
		* `__DSH_HUB_TOKEN__`; it is sent as `Authorization: Bearer` on fetch and as
		* `?token=` on the EventSource.
		*
		* Review fixes vs PR #40: JSON-decoded SSE envelope (heartbeats/comments
		* ignored), token auth, reconnect-kept on error (output reset before replay),
		* 512 KB per-tab output ring, per-tab serialized write queue with flush
		* batching, server-confirmed close, always-create on ptyOpen, unified entry
		* cwd, and dead helpers from the PR removed.
		*/
		/** Write-flush batching window (ms): keystrokes collected, then one POST. */
		const WRITE_FLUSH_MS = 40;
		let state = {
			visible: false,
			tabs: [],
			activeId: null,
			outputs: {},
			shells: [],
			notice: null
		};
		const listeners$1 = /* @__PURE__ */ new Set();
		const streams = /* @__PURE__ */ new Map();
		const dataSubs = /* @__PURE__ */ new Map();
		/** Session-list snapshot accessor, plugged by {@link bindPtyRuntime}. */
		let sessionsSnapshot = null;
		/** dsh-hub auth token, read once from the injected global and cached. */
		let cachedToken = null;
		function emit$1() {
			for (const l of listeners$1) l();
		}
		function set(patch) {
			state = {
				...state,
				...patch
			};
			emit$1();
		}
		/**
		* Resolve the auth token from the `__DSH_HUB_TOKEN__` global injected by the
		* host (`webserver/index-inject`); cached at module level after first read.
		*/
		function getToken() {
			if (cachedToken === null) cachedToken = globalThis.__DSH_HUB_TOKEN__ ?? "";
			return cachedToken;
		}
		/** Append a chunk to a tab's output ring buffer (last {@link RING_LIMIT}). */
		function appendOutput(tabId, chunk) {
			const prev = state.outputs[tabId] ?? "";
			set({ outputs: {
				...state.outputs,
				[tabId]: (prev + chunk).slice(-524288)
			} });
			const subs = dataSubs.get(tabId);
			if (subs !== void 0) for (const cb of Array.from(subs)) try {
				cb(chunk);
			} catch {}
		}
		/**
		* Subscribe to store changes.
		* @returns an unsubscribe function.
		*/
		function subscribePty(cb) {
			listeners$1.add(cb);
			return () => {
				listeners$1.delete(cb);
			};
		}
		/**
		* React hook: select a slice of the PTY panel state.
		* @param sel - selector over the store state.
		*/
		function usePty(sel) {
			return (0, react.useSyncExternalStore)(subscribePty, () => sel(state));
		}
		/** POST JSON to a plugin route, carrying the Bearer token when present. */
		async function httpPost(path, body) {
			try {
				const token = getToken();
				const headers = { "content-type": "application/json" };
				if (token !== "") headers["Authorization"] = "Bearer " + token;
				return await (await fetch(path, {
					method: "POST",
					headers,
					body: JSON.stringify(body)
				})).json();
			} catch {
				return { ok: false };
			}
		}
		/** GET JSON from a plugin route, carrying the Bearer token when present. */
		async function httpGet(path) {
			try {
				const token = getToken();
				const headers = {};
				if (token !== "") headers["Authorization"] = "Bearer " + token;
				return await (await fetch(path, {
					method: "GET",
					headers
				})).json();
			} catch {
				return { ok: false };
			}
		}
		/**
		* Fetch the shells available on this machine and reconcile the persisted
		* default against them (an unavailable default falls back to the first
		* available shell). Idempotent; called once at assembly.
		*/
		async function fetchShells() {
			const res = await httpGet("/api/dsh-hub/pty/shells");
			const shells = Array.isArray(res.shells) ? res.shells.filter((s) => typeof s?.id === "string") : [];
			if (shells.length === 0) return;
			set({ shells });
			const pref = getPrefs().shell;
			if (!shells.some((s) => s.id === pref && s.available)) {
				const first = shells.find((s) => s.available);
				if (first !== void 0 && first.id !== pref) setShell(first.id);
			}
		}
		/**
		* Open one SSE stream per tab and feed {@link appendOutput} / dataSubs.
		* Non-fatal connection errors keep the EventSource auto-reconnect; only a
		* stream that never opened (404/401 — non-transient) is closed for good.
		*/
		function subscribeStream(tabId) {
			if (streams.has(tabId)) return;
			const token = getToken();
			const url = "/api/dsh-hub/pty/stream?id=" + encodeURIComponent(tabId) + (token === "" ? "" : "&token=" + encodeURIComponent(token));
			const es = new EventSource(url);
			streams.set(tabId, es);
			let opened = false;
			es.onopen = () => {
				opened = true;
			};
			es.onmessage = (e) => {
				let payload;
				try {
					payload = JSON.parse(String(e.data ?? ""));
				} catch {
					return;
				}
				if (typeof payload === "string") {
					appendOutput(tabId, payload);
					return;
				}
				if (payload !== null && typeof payload === "object") {
					const frame = payload;
					if (typeof frame.error === "string") {
						es.close();
						streams.delete(tabId);
						set({ notice: frame.error });
						return;
					}
					if (typeof frame.data === "string") appendOutput(tabId, frame.data);
				}
			};
			es.onerror = () => {
				if (!opened) {
					es.close();
					streams.delete(tabId);
					set({ notice: "终端连接失败，请重试" });
					return;
				}
				set({ outputs: {
					...state.outputs,
					[tabId]: ""
				} });
			};
		}
		const writeQueues = /* @__PURE__ */ new Map();
		/** Queue one input chunk; flushes run on a 40 ms batching window. */
		function pushWrite(tabId, data) {
			if (data === "") return;
			const q = writeQueues.get(tabId) ?? {
				chain: Promise.resolve(),
				pending: "",
				timer: null
			};
			q.pending += data;
			writeQueues.set(tabId, q);
			if (q.timer === null) q.timer = setTimeout(() => {
				flushWrites(tabId);
			}, WRITE_FLUSH_MS);
		}
		/** Flush a tab's pending input as one POST, serialized per tab. */
		function flushWrites(tabId) {
			const q = writeQueues.get(tabId);
			if (q === void 0) return;
			if (q.timer !== null) {
				clearTimeout(q.timer);
				q.timer = null;
			}
			const data = q.pending;
			q.pending = "";
			if (data === "") return;
			q.chain = q.chain.then(() => httpPost("/api/dsh-hub/pty/write", {
				id: tabId,
				data
			}));
		}
		/**
		* Bind the dsh client runtime so entry-cwd resolution can read the current
		* session's summary cwd (richest source). Call once from the assembly with
		* the client context; without it, resolution degrades to the page-global
		* `__mgGetCurrentWorkspace()` getter.
		*/
		function bindPtyRuntime(ctx) {
			const getSnapshot = ctx?.sessions?.list?.getSnapshot;
			sessionsSnapshot = typeof getSnapshot === "function" ? () => getSnapshot() : null;
		}
		/**
		* Resolve the entry working directory for a new PTY tab: the current
		* session's summary cwd, then `__mgGetCurrentWorkspace()`, then '' (the host
		* picks its default). Used by the footer / Ctrl+J / "+" entry points.
		*/
		function resolveEntryCwd() {
			try {
				const snap = sessionsSnapshot?.();
				const id = snap?.current;
				const cwd = id === void 0 || id === null ? void 0 : snap?.byId?.[id]?.cwd;
				if (typeof cwd === "string" && cwd !== "") return cwd;
			} catch {}
			const get = window.__mgGetCurrentWorkspace;
			try {
				const path = get?.();
				if (typeof path === "string" && path !== "") return path;
			} catch {}
			return "";
		}
		/**
		* Open the terminal panel and always create a fresh tab in the entry cwd —
		* "open terminal here" (right-click) must work even while the panel is open,
		* so there is deliberately no no-op guard here.
		* @param cwd - explicit working directory; defaults to {@link resolveEntryCwd}.
		*/
		async function ptyOpen(cwd) {
			set({
				visible: true,
				notice: null
			});
			await createTab(cwd);
		}
		/**
		* Create one PTY tab on the host and subscribe to its SSE stream.
		* @param cwd - explicit working directory; defaults to {@link resolveEntryCwd}.
		*/
		async function createTab(cwd) {
			const res = await httpPost("/api/dsh-hub/pty/create", {
				cwd: cwd ?? resolveEntryCwd(),
				shell: getPrefs().shell
			});
			if (res.ok === true && res.tab !== void 0) {
				set({
					tabs: [...state.tabs, res.tab],
					activeId: res.tab.id,
					outputs: {
						...state.outputs,
						[res.tab.id]: ""
					},
					notice: null
				});
				subscribeStream(res.tab.id);
				return;
			}
			set({ notice: res.error === "shell-unavailable" ? "所选终端不可用" : "创建终端失败" });
		}
		/**
		* Close a PTY tab. The local tab is removed only after the host confirms
		* (`res.ok`); on failure the tab is kept and a hint is shown.
		*/
		async function closeTab(id) {
			if ((await httpPost("/api/dsh-hub/pty/close", { id })).ok !== true) {
				set({ notice: "关闭终端失败，请重试" });
				return;
			}
			streams.get(id)?.close();
			streams.delete(id);
			dataSubs.delete(id);
			const q = writeQueues.get(id);
			if (q !== void 0) {
				if (q.timer !== null) clearTimeout(q.timer);
				writeQueues.delete(id);
			}
			const outputs = { ...state.outputs };
			delete outputs[id];
			const tabs = state.tabs.filter((t) => t.id !== id);
			set({
				tabs,
				activeId: state.activeId === id ? tabs[0]?.id ?? null : state.activeId,
				outputs,
				notice: null
			});
			if (tabs.length === 0) set({ visible: false });
		}
		/** Activate a tab. */
		function setActiveTab(id) {
			set({ activeId: id });
		}
		/** Close the terminal panel (tabs stay alive in the background). */
		function ptyClosePanel() {
			set({
				visible: false,
				notice: null
			});
		}
		/**
		* Toggle the terminal panel (Ctrl+J). Opening creates a new tab.
		* @param cwd - explicit working directory; defaults to {@link resolveEntryCwd}.
		*/
		async function ptyToggle(cwd) {
			if (state.visible) {
				ptyClosePanel();
				return;
			}
			await ptyOpen(cwd);
		}
		/**
		* Send raw terminal input (keystrokes) to the PTY via the per-tab write
		* queue; the queue coalesces 40 ms of input into one POST.
		*/
		function ptySendRaw(id, data) {
			pushWrite(id, data);
		}
		/** Resize a PTY session (cols/rows). */
		async function ptyResizeClient(id, cols, rows) {
			await httpPost("/api/dsh-hub/pty/resize", {
				id,
				cols,
				rows
			});
		}
		/**
		* Subscribe to raw output chunks for one tab. Immediately replays the current
		* buffered output (ring buffer), then pushes live chunks.
		* @returns an unsubscribe function.
		*/
		function ptySubscribeData(id, cb) {
			let set = dataSubs.get(id);
			if (!set) {
				set = /* @__PURE__ */ new Set();
				dataSubs.set(id, set);
			}
			set.add(cb);
			const initial = state.outputs[id] ?? "";
			if (initial !== "") cb(initial);
			return () => {
				set.delete(cb);
			};
		}
		/**
		* Retarget the active tab's working directory when the workspace switches:
		* update the tab label and run the shell-appropriate cd command in the live
		* session (each shell has its own syntax: PowerShell Set-Location, cmd /d,
		* bash plain cd — all handle the Windows path).
		*/
		async function ptyRetarget(cwd) {
			const id = state.activeId;
			if (id === null || cwd === "") return;
			const tab = state.tabs.find((t) => t.id === id);
			set({ tabs: state.tabs.map((t) => t.id === id ? {
				...t,
				cwd
			} : t) });
			const escaped = cwd.replace(/'/g, "''");
			pushWrite(id, tab?.shellId === "cmd" ? "cd /d \"" + cwd.replace(/"/g, "\"\"") + "\"\r" : tab?.shellId === "bash" ? "cd '" + escaped + "'\r" : "Set-Location -LiteralPath '" + escaped + "'\r");
		}
		//#endregion
		//#region src/client/right-sidebar.tsx
		/**
		* RightSidebar — the dsh-hub right sidebar mounted as a body portal
		* (like dsh-better-sidebar), independent of the official details column so it
		* also works in blank/new conversations where the details column is forced
		* to 0. It mirrors the left sidebar's collapse/rail behavior and provides
		* three tabs:
		*  - Overview: context-token usage rendered as a fan/donut chart.
		*  - Files: current workspace file/folder tree, strictly synced to the
		*    current session's workspace. Tree nodes expose a right-click context
		*    menu (open in OS / path reference / copy / open terminal here).
		*  - Git: whether the workspace is a git repo, branch, and working-tree changes.
		*
		* A top action row offers "打开工作区文件夹" (native folder picker → new
		* workspace, PR #40's openFolderAsWorkspace) and a terminal opener.
		*/
		/** Subscribe to the current session's ConversationSnapshot from a body-portal context. */
		function useSessionSnapshot(ctx, sessionId) {
			const sessions = ctx.sessions;
			return (0, react.useSyncExternalStore)((0, react.useCallback)((onStoreChange) => {
				if (sessionId === void 0) return () => {};
				return sessions?.binding?.(sessionId)?.session?.subscribe?.(onStoreChange) ?? (() => {});
			}, [sessions, sessionId]), (0, react.useCallback)(() => {
				if (sessionId === void 0) return void 0;
				return sessions?.binding?.(sessionId)?.session?.getSnapshot?.();
			}, [sessions, sessionId]));
		}
		/** Subscribe to one session projection value from a body-portal context. */
		function useProjectionValue(ctx, sessionId, key) {
			const sessions = ctx.sessions;
			return (0, react.useSyncExternalStore)((0, react.useCallback)((onStoreChange) => {
				if (sessionId === void 0) return () => {};
				return sessions?.binding?.(sessionId)?.session?.projections?.faceOf?.(key)?.subscribe?.(onStoreChange) ?? (() => {});
			}, [
				sessions,
				sessionId,
				key
			]), (0, react.useCallback)(() => {
				if (sessionId === void 0) return void 0;
				return sessions?.binding?.(sessionId)?.session?.projections?.faceOf?.(key)?.getSnapshot?.();
			}, [
				sessions,
				sessionId,
				key
			]));
		}
		/** Subscribe to the sessions list from a body-portal (non-slot) context. */
		function useSessionsValue(ctx) {
			const sessions = ctx.sessions;
			return (0, react.useSyncExternalStore)((0, react.useCallback)((onStoreChange) => sessions?.list?.subscribe?.(onStoreChange) ?? (() => {}), [sessions]), (0, react.useCallback)(() => sessions?.list?.getSnapshot?.(), [sessions]));
		}
		/** Subscribe to the workspaces list from a body-portal (non-slot) context. */
		function useWorkspacesValue(ctx) {
			const workspaces = ctx.workspaces;
			return (0, react.useSyncExternalStore)((0, react.useCallback)((onStoreChange) => workspaces?.list?.subscribe?.(onStoreChange) ?? (() => {}), [workspaces]), (0, react.useCallback)(() => workspaces?.list?.getSnapshot?.(), [workspaces]));
		}
		/** Compact token formatting: 517 / 12.2K / 517K / 1.2M. */
		function formatTokens(n) {
			if (n < 1e3) return String(n);
			if (n < 1e6) return `${Math.round(n / 1e3)}K`;
			return `${Math.round(n / 1e6)}M`;
		}
		/** Compact duration: 45.2s under a minute, 2m42s from there on. */
		function formatDuration(ms) {
			const s = ms / 1e3;
			if (s < 60) return `${Math.round(s * 10) / 10}s`;
			const whole = Math.round(s);
			return `${Math.floor(whole / 60)}m${whole % 60}s`;
		}
		/** Decode-throughput figure: whole tokens from ten up, one decimal below. */
		function formatTokensPerSecond(tps) {
			const clamped = Math.max(0, tps);
			return clamped >= 10 ? String(Math.round(clamped)) : String(Math.round(clamped * 10) / 10);
		}
		/** Sum the three disjoint prompt-side billing buckets. */
		function billedInputTokens(usage) {
			return (usage.uncachedInputTokens ?? 0) + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0);
		}
		/** Cache-hit share of prompt-side input over the whole durable log. */
		function cacheHitPercent(usage) {
			const denominator = billedInputTokens(usage);
			return denominator === 0 ? null : Math.round((usage.cacheReadTokens ?? 0) / denominator * 100);
		}
		async function fetchDir(path) {
			try {
				const body = await (await fetch(`/api/dsh-hub/workspace/list?${new URLSearchParams({ path })}`)).json();
				return body.ok === true ? body.entries ?? [] : [];
			} catch {
				return [];
			}
		}
		async function fetchGit(path) {
			try {
				const body = await (await fetch(`/api/dsh-hub/workspace/git?${new URLSearchParams({ path })}`)).json();
				return body.ok === true ? body : null;
			} catch {
				return null;
			}
		}
		/** Posix-style relative path of `path` against workspace root `root`. */
		function relativePath(path, root) {
			const p = path.replace(/\\/g, "/");
			const r = root.replace(/\\/g, "/").replace(/\/+$/, "");
			if (r === "" || r === ".") return p;
			if (p === r) return ".";
			if (p.startsWith(r + "/")) return p.slice(r.length + 1);
			return p;
		}
		/** Parent directory of an absolute path. */
		function parentDir(path) {
			const norm = path.replace(/\\/g, "/").replace(/\/+$/, "");
			const idx = norm.lastIndexOf("/");
			return idx > 0 ? norm.slice(0, idx) : norm;
		}
		/** Copy text to the clipboard (best-effort). */
		function copyText$1(text) {
			navigator.clipboard.writeText(text).catch(() => {});
		}
		/**
		* Open a path with the OS default handler via the token-guarded host route
		* (`/api/dsh-hub/workspace/open`). The Bearer token is read from the
		* `__DSH_HUB_TOKEN__` global injected by the host; without a token the
		* request is skipped entirely rather than failing (the route rejects 401).
		*/
		async function openInOs(path, reveal = false) {
			const token = globalThis.__DSH_HUB_TOKEN__ ?? "";
			if (token === "") return;
			try {
				await fetch("/api/dsh-hub/workspace/open", {
					method: "POST",
					headers: {
						"content-type": "application/json",
						Authorization: "Bearer " + token
					},
					body: JSON.stringify({
						path,
						reveal
					})
				});
			} catch {}
		}
		/**
		* "在资源管理器中打开" for a file-tree row: a FOLDER opens itself in the OS
		* file manager; a FILE is revealed in its parent folder (Explorer /select,
		* Finder -R — see the host open route). Bug-3: the context menu previously
		* had no reveal entry, so files could only be opened with their default app.
		*/
		function openInExplorer$2(entry) {
			if (entry.isDirectory) openInOs(entry.path);
			else openInOs(entry.path, true);
		}
		/**
		* Open a folder in the OS file manager. Bug-A: the top-row button must simply
		* open the workspace folder the sidebar is showing — no directory picker, no
		* workspace-create (that is dsh's own "添加工作区" flow). The path comes from
		* the sidebar's own three-tier resolution (`effectivePath`), NOT the
		* page-global getter which can be empty while the sidebar has a path.
		*/
		function openFolderInOs(path) {
			if (path !== "") openInOs(path);
		}
		/**
		* Insert a file/folder reference into the composer's draft. The dsh client
		* runtime in this assembly exposes no `conversation.input.shell().setDraft`
		* service, so this writes through the DOM (PR #40's fallback): focus the
		* composer textarea inside `[data-composer-seat]` ONLY (a page-wide textarea
		* fallback can hit a hidden/other textarea and render white-on-white — Bug-2),
		* append the reference, and dispatch an `input` event so the React draft state
		* synchronizes. When no composer textarea exists, degrade to the clipboard.
		*/
		function insertReferenceIntoComposer(text) {
			if (insertReferenceIntoComposerDom(text)) return;
			copyText$1(text);
		}
		function insertReferenceIntoComposerDom(text) {
			try {
				const ta = document.querySelector("[data-composer-seat]")?.querySelector("textarea") ?? null;
				if (ta === null) return false;
				ta.focus();
				const cur = ta.value;
				const next = cur.trim() === "" ? text : cur + " " + text;
				const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
				if (setter === void 0) return false;
				setter.call(ta, next);
				ta.dispatchEvent(new InputEvent("input", {
					bubbles: true,
					inputType: "insertText",
					data: text
				}));
				return true;
			} catch {
				return false;
			}
		}
		/** One expandable directory/file row. */
		function TreeNode({ entry, depth, onContext }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [children, setChildren] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				if (!open || children !== null) return;
				let alive = true;
				fetchDir(entry.path).then((rows) => {
					if (alive) setChildren(rows);
				});
				return () => {
					alive = false;
				};
			}, [
				open,
				children,
				entry.path
			]);
			const expandable = entry.isDirectory;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: RIGHT_SIDEBAR_CSS_CLASSES.treeRow,
				style: { paddingLeft: `${depth * 12 + 4}px` },
				onClick: () => {
					if (expandable) setOpen(!open);
				},
				onContextMenu: (event) => {
					event.preventDefault();
					event.stopPropagation();
					onContext(entry, event);
				},
				"data-row-path": entry.path,
				"data-row-dir": expandable ? "1" : "0",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: RIGHT_SIDEBAR_CSS_CLASSES.treeIcon,
					children: expandable ? open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpen16, { size: 16 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderClose16, { size: 16 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutline16, { size: 16 })
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: RIGHT_SIDEBAR_CSS_CLASSES.treeName,
					children: entry.name
				})]
			}), open && children !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: RIGHT_SIDEBAR_CSS_CLASSES.treeChildren,
				children: children.map((child) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TreeNode, {
					entry: child,
					depth: depth + 1,
					onContext
				}, child.path))
			})] });
		}
		/**
		* Context menu for a tree node (right-click). Directory rows offer expand/
		* collapse, path reference, copy-directory and open-terminal-here; file rows
		* offer OS-open, path reference, copy-folder-directory, copy-file-path and
		* open-terminal-here. Positioned fixed at the cursor; closed by the parent on
		* outside mousedown / Escape / item click.
		*/
		function ContextMenu({ x, y, entry, root, onClose }) {
			const items = [];
			const rel = relativePath(entry.path, root);
			const reference = "[" + entry.name + "](" + rel + ")";
			const toggleDir = () => {
				try {
					document.querySelector("[data-row-path=\"" + CSS.escape(entry.path) + "\"]")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
				} catch {}
			};
			if (entry.isDirectory) {
				items.push({
					label: "打开（展开/折叠）",
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpen16, { size: 14 }),
					run: toggleDir
				});
				items.push({
					label: "在资源管理器中打开",
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpen16, { size: 14 }),
					run: () => {
						openInExplorer$2(entry);
					}
				});
				items.push({
					label: "路径引用",
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLinkOutline16, { size: 14 }),
					run: () => {
						insertReferenceIntoComposer(reference);
					}
				});
				items.push({
					label: "复制目录",
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCopyOutline16, { size: 14 }),
					run: () => {
						copyText$1(entry.path);
					}
				});
				items.push({
					label: "在此打开终端",
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutline16, { size: 14 }),
					run: () => {
						ptyOpen(entry.path);
					}
				});
			} else {
				items.push({
					label: "打开",
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutline16, { size: 14 }),
					run: () => {
						openInOs(entry.path);
					}
				});
				items.push({
					label: "在资源管理器中打开",
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpen16, { size: 14 }),
					run: () => {
						openInExplorer$2(entry);
					}
				});
				items.push({
					label: "路径引用",
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLinkOutline16, { size: 14 }),
					run: () => {
						insertReferenceIntoComposer(reference);
					}
				});
				items.push({
					label: "复制文件夹目录",
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCopyOutline16, { size: 14 }),
					run: () => {
						copyText$1(parentDir(entry.path));
					}
				});
				items.push({
					label: "复制文件路径",
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCopyOutline16, { size: 14 }),
					run: () => {
						copyText$1(entry.path);
					}
				});
				items.push({
					label: "在此打开终端",
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutline16, { size: 14 }),
					run: () => {
						ptyOpen(parentDir(entry.path));
					}
				});
			}
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: RIGHT_SIDEBAR_CSS_CLASSES.menu,
				"data-rs-menu": true,
				role: "menu",
				style: {
					left: x,
					top: y
				},
				children: items.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "menuitem",
					className: RIGHT_SIDEBAR_CSS_CLASSES.menuItem,
					onClick: () => {
						item.run();
						onClose();
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.menuIcon,
						children: item.icon
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.menuLabel,
						children: item.label
					})]
				}, item.label))
			});
		}
		function RightSidebar({ ctx }) {
			const [open, setOpen] = (0, react.useState)(true);
			const [tab, setTab] = (0, react.useState)("overview");
			(0, react.useEffect)(() => {
				document.documentElement.style.setProperty("--mg-sidebar-width", open ? "360px" : "56px");
				return () => {
					document.documentElement.style.removeProperty("--mg-sidebar-width");
				};
			}, [open]);
			const sessions = useSessionsValue(ctx);
			const workspaces = useWorkspacesValue(ctx);
			const currentSessionId = sessions?.current;
			const sessionCwd = currentSessionId === void 0 ? void 0 : sessions?.byId?.[currentSessionId]?.cwd;
			const items = workspaces?.items ?? [];
			const workspacePath = (currentSessionId === void 0 ? void 0 : items.find((w) => w.sessionIds?.includes(currentSessionId)))?.path ?? (workspaces?.recentWorkspaceId !== void 0 ? items.find((w) => w.workspaceId === workspaces.recentWorkspaceId)?.path : void 0) ?? "";
			const [fallbackPath, setFallbackPath] = (0, react.useState)("");
			(0, react.useEffect)(() => {
				const get = window.__mgGetCurrentWorkspace;
				const path = get?.();
				if (path !== null && path !== void 0 && path !== "") setFallbackPath(path);
			}, []);
			const effectivePath = workspacePath || sessionCwd || fallbackPath;
			const [rootEntries, setRootEntries] = (0, react.useState)([]);
			const [git, setGit] = (0, react.useState)(null);
			const [workspaceLoading, setWorkspaceLoading] = (0, react.useState)(false);
			const [menu, setMenu] = (0, react.useState)(null);
			const closeMenu = () => setMenu(null);
			const onRowContext = (entry, event) => {
				event.preventDefault();
				event.stopPropagation();
				setMenu({
					x: event.clientX,
					y: event.clientY,
					entry
				});
			};
			(0, react.useEffect)(() => {
				if (menu === null) return;
				const onPointerDown = (event) => {
					const target = event.target;
					if (target !== null && target.closest && target.closest("[data-rs-menu]") !== null) return;
					setMenu(null);
				};
				const onKey = (event) => {
					if (event.key === "Escape") setMenu(null);
				};
				document.addEventListener("mousedown", onPointerDown);
				document.addEventListener("keydown", onKey);
				return () => {
					document.removeEventListener("mousedown", onPointerDown);
					document.removeEventListener("keydown", onKey);
				};
			}, [menu]);
			(0, react.useEffect)(() => {
				if (effectivePath === "") {
					setRootEntries([]);
					setGit(null);
					return;
				}
				let alive = true;
				setWorkspaceLoading(true);
				Promise.all([fetchDir(effectivePath), fetchGit(effectivePath)]).then(([rows, info]) => {
					if (!alive) return;
					setRootEntries(rows);
					setGit(info);
					setWorkspaceLoading(false);
				});
				return () => {
					alive = false;
				};
			}, [effectivePath]);
			(0, react.useEffect)(() => {
				if (effectivePath !== "") ptyRetarget(effectivePath);
			}, [effectivePath]);
			const refreshWorkspace = () => {
				if (effectivePath === "") return;
				setWorkspaceLoading(true);
				Promise.all([fetchDir(effectivePath), fetchGit(effectivePath)]).then(([rows, info]) => {
					setRootEntries(rows);
					setGit(info);
					setWorkspaceLoading(false);
				});
			};
			const sessionSnapshot = useSessionSnapshot(ctx, currentSessionId);
			const stats = useProjectionValue(ctx, currentSessionId, "sessionStats");
			const usage = useProjectionValue(ctx, currentSessionId, "tokenUsage");
			const turnOrder = sessionSnapshot?.chat?.timeline?.turnOrder ?? [];
			const currentTurn = Array.isArray(turnOrder) && turnOrder.length > 0 ? turnOrder[turnOrder.length - 1] : void 0;
			const [turnBaseline, setTurnBaseline] = (0, react.useState)(null);
			const turnKeyRef = (0, react.useRef)(null);
			const turnSessionRef = (0, react.useRef)(null);
			const prevUsageRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				const sessionChanged = turnSessionRef.current !== currentSessionId;
				turnSessionRef.current = currentSessionId ?? null;
				const key = `${currentSessionId ?? ""}:${currentTurn ?? ""}`;
				if (!sessionChanged && turnKeyRef.current === key) return;
				turnKeyRef.current = key;
				const baseline = sessionChanged || prevUsageRef.current === null ? usage === void 0 ? {
					uncachedInputTokens: 0,
					cacheReadTokens: 0,
					cacheWriteTokens: 0,
					outputTokens: 0
				} : {
					uncachedInputTokens: usage.uncachedInputTokens ?? 0,
					cacheReadTokens: usage.cacheReadTokens ?? 0,
					cacheWriteTokens: usage.cacheWriteTokens ?? 0,
					outputTokens: usage.outputTokens ?? 0
				} : prevUsageRef.current;
				setTurnBaseline(baseline);
			}, [
				currentSessionId,
				currentTurn,
				usage
			]);
			(0, react.useEffect)(() => {
				prevUsageRef.current = usage === void 0 ? null : {
					uncachedInputTokens: usage.uncachedInputTokens ?? 0,
					cacheReadTokens: usage.cacheReadTokens ?? 0,
					cacheWriteTokens: usage.cacheWriteTokens ?? 0,
					outputTokens: usage.outputTokens ?? 0
				};
			}, [usage]);
			const turnTokens = usage !== void 0 && turnBaseline !== null ? {
				uncachedInputTokens: Math.max(0, (usage.uncachedInputTokens ?? 0) - turnBaseline.uncachedInputTokens),
				cacheReadTokens: Math.max(0, (usage.cacheReadTokens ?? 0) - turnBaseline.cacheReadTokens),
				cacheWriteTokens: Math.max(0, (usage.cacheWriteTokens ?? 0) - turnBaseline.cacheWriteTokens),
				outputTokens: Math.max(0, (usage.outputTokens ?? 0) - turnBaseline.outputTokens)
			} : void 0;
			const totalInputTokens = usage === void 0 ? void 0 : billedInputTokens(usage);
			const totalOutputTokens = usage?.outputTokens;
			const totalTokens = totalInputTokens !== void 0 && totalOutputTokens !== void 0 ? totalInputTokens + totalOutputTokens : void 0;
			const chartGradient = totalTokens !== void 0 && totalTokens > 0 ? `conic-gradient(var(--dsw-alias-state-business-primary, #3964fe) 0deg ${totalInputTokens / totalTokens * 360}deg, var(--dsw-alias-state-success-primary, #16a34a) ${totalInputTokens / totalTokens * 360}deg 360deg)` : "";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: clsx(RIGHT_SIDEBAR_CSS_CLASSES.root, !open && RIGHT_SIDEBAR_CSS_CLASSES.collapsed),
				style: { width: open ? 360 : 56 },
				children: [open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.topRow,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: RIGHT_SIDEBAR_CSS_CLASSES.topBtn,
							onClick: () => {
								openFolderInOs(effectivePath);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpen16, { size: 14 }), " 打开工作区文件夹"]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: RIGHT_SIDEBAR_CSS_CLASSES.topBtn,
							onClick: () => {
								ptyOpen(effectivePath || void 0);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutline16, { size: 14 }), " 终端"]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.header,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: RIGHT_SIDEBAR_CSS_CLASSES.tabs,
							role: "tablist",
							"aria-label": "右侧栏视图",
							children: [
								"overview",
								"files",
								"git"
							].map((key) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								role: "tab",
								"aria-selected": tab === key,
								className: clsx(RIGHT_SIDEBAR_CSS_CLASSES.tab, tab === key && RIGHT_SIDEBAR_CSS_CLASSES.tabActive),
								onClick: () => {
									setTab(key);
								},
								children: key === "overview" ? "概览" : key === "files" ? "文件" : "Git"
							}, key))
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: RIGHT_SIDEBAR_CSS_CLASSES.toggle,
							"data-tip": "收起侧边栏",
							"aria-label": "收起右侧栏",
							onClick: () => {
								setOpen(false);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPanelLeftOutline16, {
								className: RIGHT_SIDEBAR_CSS_CLASSES.toggleIcon,
								size: 16
							})
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.body,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: RIGHT_SIDEBAR_CSS_CLASSES.content,
							children: [
								tab === "overview" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Overview, {
									totalInputTokens,
									totalOutputTokens,
									totalTokens,
									chartGradient,
									stats,
									usage,
									turnTokens,
									fileCount: rootEntries.filter((e) => e.isFile).length,
									dirCount: rootEntries.filter((e) => e.isDirectory).length,
									git,
									loading: workspaceLoading
								}),
								tab === "files" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: RIGHT_SIDEBAR_CSS_CLASSES.section,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: RIGHT_SIDEBAR_CSS_CLASSES.sectionTitle,
										children: ["工作区文件", effectivePath !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: RIGHT_SIDEBAR_CSS_CLASSES.refresh,
											onClick: () => {
												refreshWorkspace();
											},
											children: "刷新"
										})]
									}), effectivePath === "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: RIGHT_SIDEBAR_CSS_CLASSES.empty,
										children: "当前会话没有关联工作区"
									}) : workspaceLoading && rootEntries.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: RIGHT_SIDEBAR_CSS_CLASSES.empty,
										children: "加载中…"
									}) : rootEntries.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: RIGHT_SIDEBAR_CSS_CLASSES.empty,
										children: "工作区为空"
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: RIGHT_SIDEBAR_CSS_CLASSES.tree,
										children: rootEntries.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TreeNode, {
											entry,
											depth: 0,
											onContext: onRowContext
										}, entry.path))
									})]
								}),
								tab === "git" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GitTab, {
									git,
									loading: workspaceLoading
								})
							]
						})
					})
				] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: RIGHT_SIDEBAR_CSS_CLASSES.rail,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: RIGHT_SIDEBAR_CSS_CLASSES.toggle,
						"data-tip": "展开侧边栏",
						"aria-label": "展开右侧栏",
						onClick: () => {
							setOpen(true);
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPanelLeftOutline16, {
							className: RIGHT_SIDEBAR_CSS_CLASSES.toggleIcon,
							size: 18
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.railItems,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: RIGHT_SIDEBAR_CSS_CLASSES.railItem,
								"data-tip": "概览",
								"aria-label": "概览",
								onClick: () => {
									setTab("overview");
									setOpen(true);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, { size: 18 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: RIGHT_SIDEBAR_CSS_CLASSES.railItem,
								"data-tip": "文件",
								"aria-label": "文件",
								onClick: () => {
									setTab("files");
									setOpen(true);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpen16, { size: 18 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: RIGHT_SIDEBAR_CSS_CLASSES.railItem,
								"data-tip": "Git",
								"aria-label": "Git",
								onClick: () => {
									setTab("git");
									setOpen(true);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBranchOutline16, { size: 18 })
							})
						]
					})]
				}), menu !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ContextMenu, {
					x: menu.x,
					y: menu.y,
					entry: menu.entry,
					root: effectivePath,
					onClose: closeMenu
				})]
			});
		}
		/** One Reasonix-style stat card: small icon + caption label above a bold value. */
		function StatCard({ icon: Icon, label, value }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: RIGHT_SIDEBAR_CSS_CLASSES.statCard,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: RIGHT_SIDEBAR_CSS_CLASSES.statHead,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Icon, {
						className: RIGHT_SIDEBAR_CSS_CLASSES.statIcon,
						size: 14
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.statLabel,
						children: label
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: RIGHT_SIDEBAR_CSS_CLASSES.statValue,
					children: value
				})]
			});
		}
		/** Map a git porcelain status to a semantic badge kind (Reasonix-style). */
		function gitStatusKind(status) {
			const s = status.trim();
			if (s === "??") return "untracked";
			if (s.startsWith("A")) return "added";
			if (s.startsWith("D")) return "deleted";
			if (s.startsWith("R") || s.startsWith("C")) return "renamed";
			return "modified";
		}
		/** Short display text for a git porcelain status: ' M' → 'M', '??' → '?'. */
		function gitStatusText(status) {
			const s = status.trim();
			if (s === "??") return "?";
			return s[0] ?? "?";
		}
		function Overview(props) {
			const { totalInputTokens, totalOutputTokens, totalTokens, chartGradient, stats, usage, turnTokens, fileCount, dirCount, git, loading } = props;
			const ttftAvg = stats?.ttftSteps !== void 0 && stats.ttftSteps > 0 && stats.ttftMs !== void 0 ? stats.ttftMs / stats.ttftSteps : void 0;
			const tps = stats?.decodeMs !== void 0 && stats.decodeMs > 0 && stats.decodeTokens !== void 0 ? stats.decodeTokens / (stats.decodeMs / 1e3) : void 0;
			const cacheHit = usage === void 0 ? void 0 : cacheHitPercent(usage);
			const inputTokens = usage === void 0 ? void 0 : billedInputTokens(usage);
			const outputTokens = usage?.outputTokens;
			const zeroBuckets = {
				uncachedInputTokens: 0,
				cacheReadTokens: 0,
				cacheWriteTokens: 0,
				outputTokens: 0
			};
			const chartTotal = totalTokens ?? 0;
			const chartInput = totalInputTokens ?? 0;
			const chartOutput = totalOutputTokens ?? 0;
			const turn = turnTokens ?? zeroBuckets;
			const turnCache = turnTokens === void 0 ? 0 : cacheHitPercent(turnTokens) ?? 0;
			const turnTotalValue = turnTokens === void 0 ? 0 : billedInputTokens(turnTokens) + turnTokens.outputTokens;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: RIGHT_SIDEBAR_CSS_CLASSES.section,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.sectionTitle,
						children: "总上下文 TOKEN"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.card,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: RIGHT_SIDEBAR_CSS_CLASSES.chartWrap,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: RIGHT_SIDEBAR_CSS_CLASSES.chart,
								style: chartGradient ? { background: chartGradient } : void 0,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: RIGHT_SIDEBAR_CSS_CLASSES.chartCenter,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: formatTokens(chartTotal) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: "Tokens" })] })
								})
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: RIGHT_SIDEBAR_CSS_CLASSES.legend,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: RIGHT_SIDEBAR_CSS_CLASSES.legendRow,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
											className: RIGHT_SIDEBAR_CSS_CLASSES.legendDot,
											style: { background: "var(--dsw-alias-state-business-primary)" }
										}),
										"总输入 ",
										formatTokens(chartInput)
									]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: RIGHT_SIDEBAR_CSS_CLASSES.legendRow,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
											className: RIGHT_SIDEBAR_CSS_CLASSES.legendDot,
											style: { background: "var(--dsw-alias-state-success-primary)" }
										}),
										"总输出 ",
										formatTokens(chartOutput)
									]
								})]
							})]
						})
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: RIGHT_SIDEBAR_CSS_CLASSES.section,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.sectionTitle,
						children: "会话统计"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.statGrid,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconDataOutline16,
								label: "轮次 / 步数",
								value: `${stats?.turns ?? 0} 轮 · ${stats?.steps ?? 0} 步`
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconThinkOutline16,
								label: "LLM 耗时",
								value: formatDuration(stats?.llmMs ?? 0)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconCodeOutline16,
								label: "工具调用",
								value: formatDuration(stats?.toolMs ?? 0)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconPlayOutline16,
								label: "首 token 平均",
								value: formatDuration(ttftAvg ?? 0)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconRightUpOutline16,
								label: "速度",
								value: `${formatTokensPerSecond(tps ?? 0)} tok/s`
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16,
								label: "缓存命中",
								value: `${cacheHit ?? 0}%`
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconDownloadOutline16,
								label: "输入 Tokens",
								value: `${formatTokens(inputTokens ?? 0)} tok`
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconSendOutline16,
								label: "输出 Tokens",
								value: `${formatTokens(outputTokens ?? 0)} tok`
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: RIGHT_SIDEBAR_CSS_CLASSES.section,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.sectionTitle,
						children: "本轮对话 Token"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.statGrid,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconDownloadOutline16,
								label: "本轮输入",
								value: `${formatTokens(billedInputTokens(turn))} tok`
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconSendOutline16,
								label: "本轮输出",
								value: `${formatTokens(turn.outputTokens)} tok`
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16,
								label: "本轮缓存命中",
								value: `${turnCache}%`
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconDataOutline16,
								label: "本轮总计",
								value: `${formatTokens(turnTotalValue)} tok`
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: RIGHT_SIDEBAR_CSS_CLASSES.section,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.sectionTitle,
						children: "工作区"
					}), loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.empty,
						children: "加载中…"
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.statGrid,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconFolderOpen16,
								label: "文件",
								value: String(fileCount)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconFolderClose16,
								label: "文件夹",
								value: String(dirCount)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconBranchOutline16,
								label: "Git",
								value: git?.isGit ? git.branch || "仓库" : "非 Git"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: _deepseek_ai_dsh_client_ui_primitives.IconEditOutline16,
								label: "变更",
								value: String(git?.changes.length ?? 0)
							})
						]
					})]
				})
			] });
		}
		function GitTab({ git, loading }) {
			if (loading && git === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: RIGHT_SIDEBAR_CSS_CLASSES.empty,
				children: "检测中…"
			});
			if (git === null || !git.isGit) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: RIGHT_SIDEBAR_CSS_CLASSES.empty,
				children: "当前工作区不是 Git 仓库"
			});
			const staged = git.changes.filter((change) => change.status !== "??" && change.status[0] !== " ");
			const unstaged = git.changes.filter((change) => change.status !== "??" && change.status[1] !== " ");
			const untracked = git.changes.filter((change) => change.status === "??");
			const renderList = (items, label) => {
				if (items.length === 0) return null;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: RIGHT_SIDEBAR_CSS_CLASSES.section,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.gitGroupHead,
						children: [label, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: RIGHT_SIDEBAR_CSS_CLASSES.gitGroupBadge,
							children: items.length
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: RIGHT_SIDEBAR_CSS_CLASSES.gitChanges,
						children: items.map((change, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
							className: RIGHT_SIDEBAR_CSS_CLASSES.gitChange,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `${RIGHT_SIDEBAR_CSS_CLASSES.gitStatus} ${RIGHT_SIDEBAR_CSS_CLASSES.gitStatus}-${gitStatusKind(change.status)}`,
								children: gitStatusText(change.status)
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: RIGHT_SIDEBAR_CSS_CLASSES.treeName,
								children: change.path
							})]
						}, `${label}-${change.path}-${index}`))
					})]
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: RIGHT_SIDEBAR_CSS_CLASSES.section,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: RIGHT_SIDEBAR_CSS_CLASSES.gitBranchCard,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBranchOutline16, {
							className: RIGHT_SIDEBAR_CSS_CLASSES.gitBranchIcon,
							size: 16
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: RIGHT_SIDEBAR_CSS_CLASSES.gitBranchName,
							children: git.branch || "HEAD"
						}),
						git.head !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: RIGHT_SIDEBAR_CSS_CLASSES.gitBranchHead,
							children: git.head.slice(0, 7)
						})
					]
				})
			}), git.changes.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: RIGHT_SIDEBAR_CSS_CLASSES.empty,
				children: "工作区无变更"
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				renderList(staged, "已暂存"),
				renderList(unstaged, "未暂存"),
				renderList(untracked, "未跟踪")
			] })] });
		}
		//#endregion
		//#region src/client/pin-conversations-style.ts
		/**
		* Pinned-conversations styles — a fixed-classname stylesheet injected into the
		* page by {@link injectPinStyle}. Same engineering as the settings card and
		* right sidebar: no CSS module (tsdown never fetches a sidecar), official
		* `--dsw-alias-*` / `--dsw-specific-*` design tokens with literal fallbacks,
		* and a stable `mg-pin-*` class prefix.
		*
		* Layout contract (see docs/PR4-置顶会话重构方案-2026-08-16.md §2.7):
		*  - the pinned section is a flow sibling of the official `role="tree"` inside
		*    the sidebar slot container: flex:none, an independent scroll block
		*    (max-height 40vh), and a `.list`-matching box model so rows align;
		*  - row pin buttons use a zero-width expand trick so they are keyboard
		*    reachable (width:0 is focusable, display:none is not) and non-hover rows
		*    keep zero layout shift; the pinned state stays visible;
		*  - pinned-section items are sibling buttons (open + unpin), never nested.
		*/
		/** Pin class names — the single source components and stylesheet share. */
		const PIN_CSS_CLASSES = {
			section: "mg-pin-section",
			head: "mg-pin-head",
			headLabel: "mg-pin-head-label",
			headCount: "mg-pin-head-count",
			list: "mg-pin-list",
			item: "mg-pin-item",
			itemOpen: "mg-pin-item-open",
			itemTitle: "mg-pin-item-title",
			itemIcon: "mg-pin-item-icon",
			itemUnpin: "mg-pin-item-unpin",
			itemEdit: "mg-pin-item-edit",
			itemEditInput: "mg-pin-item-edit-input",
			itemEditSave: "mg-pin-item-edit-save",
			itemEditCancel: "mg-pin-item-edit-cancel",
			pinBtn: "mg-pin-btn",
			pinBtnOn: "mg-pin-btn--on",
			rowPinned: "mg-pin-row-pinned",
			pinSvg: "mg-pin-svg"
		};
		const css = PIN_CSS_CLASSES;
		/** The stylesheet text (token fallbacks mirror the SPA boot palette). */
		const STYLE_TEXT = `
/* Pinned section — flow sibling of role="tree" inside the sidebar slot.
   Box model mirrors the official .list (ui-workspace/WorkspaceBrowser):
   left bleed via -4px/4px, right side = scrollbar-offset margin + padding
   (edge-inset − scrollbar-width − scrollbar-offset), driven by the official
   session-list tokens with hardcoded fallbacks in case dsh renames them. */
.${css.section} {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  margin-left: -4px;                 /* mirror .list left bleed */
  margin-right: var(--dsh-session-list-scrollbar-offset, 2px);
  padding-left: 4px;
  padding-right: calc(
    var(--dsh-session-list-edge-inset, var(--dsh-sidebar-inline-padding, 12px))
    - var(--dsh-session-list-scrollbar-width, 8px)
    - var(--dsh-session-list-scrollbar-offset, 2px)
  );
  max-height: 40vh;                  /* never squeeze the session tree */
  overflow-y: auto;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
/* flex overrides the UA [hidden] rule, so pin it explicitly. */
.${css.section}[hidden] { display: none; }
.${css.head} {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px 4px;
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${css.headCount} {
  border-radius: 999px;
  padding: 0 6px;
  font-size: 11px;
  line-height: 16px;
  background: var(--dsw-alias-bg-module-platform, #f5f6f7);
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${css.list} { display: flex; flex-direction: column; gap: 1px; padding-bottom: 4px; }

/* Item: sibling buttons (open row + absolute unpin), never nested buttons. */
.${css.item} {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;                      /* official session row height */
  padding-inline-start: 8px;         /* text aligns with the row left edge */
  border-radius: 8px;
  font-size: 14px;
  line-height: 20px;
  color: var(--dsw-alias-label-primary, #0f1115);
  cursor: pointer;
  user-select: none;
}
.${css.item}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
.${css.itemOpen} {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  text-align: left;
  background: transparent;
  border: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
.${css.itemOpen}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: -2px;
  border-radius: 8px;
}
.${css.itemIcon} {
  flex: none;
  width: 14px;
  height: 14px;
  color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${css.itemTitle} {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${css.itemUnpin} {
  position: absolute;
  right: 8px;
  top: 50%;
  translate: 0 -50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #61666b);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s var(--ds-ease-in-out, ease), background 0.12s;
}
.${css.item}:hover .${css.itemUnpin},
.${css.itemUnpin}:focus-visible { opacity: 1; }
.${css.itemUnpin}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
.${css.itemUnpin}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: -1px;
}

/* Inline rename form replaces the open/unpin row while editing. */
.${css.itemEdit} {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.${css.itemEditInput} {
  flex: 1;
  min-width: 0;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 12%));
  border-radius: 6px;
  background: var(--dsw-alias-bg-base, #ffffff);
  color: var(--dsw-alias-label-primary, #0f1115);
  font: inherit;
  font-size: 13px;
  line-height: 28px;
  outline: none;
}
.${css.itemEditInput}:focus {
  border-color: var(--dsw-alias-brand-primary, #3964fe);
  box-shadow: 0 0 0 1px var(--dsw-alias-brand-primary, #3964fe);
}
.${css.itemEditSave},
.${css.itemEditCancel} {
  flex: none;
  height: 26px;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%));
  color: var(--dsw-alias-label-primary, #0f1115);
  font-size: 12px;
  line-height: 26px;
  cursor: pointer;
}
.${css.itemEditSave}:hover,
.${css.itemEditCancel}:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 10%));
}
.${css.itemEditSave} {
  background: var(--dsw-alias-brand-primary, #3964fe);
  color: var(--dsw-alias-brand-primary-invert, #ffffff);
}
.${css.itemEditSave}:hover {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #3964fe) 88%, #000000);
}

/* Row pin button: zero-width expand (keyboard-reachable, zero layout shift). */
.${css.pinBtn} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 0;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #61666b);
  cursor: pointer;
  overflow: hidden;
  opacity: 0;
  transition: width 0.12s var(--ds-ease-in-out, ease), opacity 0.12s,
    color 0.12s, background 0.12s;
}
[role='treeitem']:hover .${css.pinBtn},
.${css.pinBtn}:focus-visible,
.${css.pinBtnOn} { width: 24px; opacity: 1; }
.${css.pinBtn}:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%));
  color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${css.pinBtnOn} { color: var(--dsw-alias-state-business-primary, #3964fe); }
.${css.pinSvg} { display: block; width: 14px; height: 14px; }
/* Pinned row marker (soft tint; classList-driven, no official class touched). */
.${css.rowPinned} {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3964fe) 6%, transparent);
}
@media (prefers-reduced-motion: reduce) {
  .${css.pinBtn}, .${css.itemUnpin} { transition: none; }
}
`;
		/** Inject the pin stylesheet once (idempotent). */
		function injectPinStyle() {
			if (document.getElementById("mg-dsh-pin-style") !== null) return;
			const style = document.createElement("style");
			style.id = "mg-dsh-pin-style";
			style.textContent = STYLE_TEXT;
			document.head.appendChild(style);
		}
		//#endregion
		//#region src/client/session-menu-style.ts
		/**
		* Session context menu styles (任务右键菜单样式).
		*
		* CSS 字符串注入（`mg-ctxmenu-*` 前缀），颜色/圆角/阴影全部使用官方
		* `--dsw-*` token（参照 ui-primitives/Tooltip.module.css 与官方 Menu 的
		* 浮层观感），不硬编码色值。注入幂等：以 `mg-session-menu-style` 守卫。
		*
		* @module dsh-hub/client/session-menu-style
		*/
		/** Style tag guard id — one injection per document. */
		const STYLE_ID = "mg-session-menu-style";
		/**
		* Inject the context-menu stylesheet once.
		*
		* @returns nothing; appends a <style> to <head> on first call only.
		*/
		function injectSessionMenuStyle() {
			if (document.getElementById(STYLE_ID) !== null) return;
			const tag = document.createElement("style");
			tag.id = STYLE_ID;
			tag.textContent = `
/* z-index above the titlebar (99999) and splash (100000) — never hidden. */
.mg-ctxmenu{position:fixed;z-index:100001;min-width:180px;max-width:280px;
  background:var(--dsw-specific-menu,var(--dsw-alias-bg-layer-2,#fff));
  color:var(--dsw-alias-label-primary);
  border:1px solid var(--dsw-alias-border-l2);
  border-radius:10px;
  box-shadow:var(--dsw-shadow-lv2,0 8px 24px rgba(0,0,0,.16));
  padding:4px;font:13px/1.5 var(--dsw-static-font-family,inherit);
  user-select:none}
.mg-ctxmenu__item{display:flex;align-items:center;gap:8px;width:100%;
  border:0;background:transparent;color:inherit;font:inherit;text-align:left;
  padding:6px 10px;border-radius:6px;cursor:pointer;white-space:nowrap}
.mg-ctxmenu__item:hover:not([disabled]),
.mg-ctxmenu__item:focus-visible:not([disabled]){
  background:var(--dsw-specific-sidebar-nav-item-hover,var(--dsw-alias-interactive-bg-hover));
  outline:none}
.mg-ctxmenu__item[disabled]{opacity:.45;cursor:not-allowed}
.mg-ctxmenu__head{padding:6px 10px 5px;margin:-2px -2px 4px;
  color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;
  border-bottom:1px solid var(--dsw-alias-border-l1);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mg-ctxmenu__sep{height:1px;margin:4px 6px;
  background:var(--dsw-alias-border-l1);border:0}
.mg-ctxmenu__danger{color:var(--dsw-alias-state-error-primary)}
`;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region src/client/session-menu.ts
		/**
		* Session context menu (任务右键菜单) — the browser half of the full-action
		* menu for session rows, pinned or not.
		*
		* 目标形态（对齐参考设计）：置顶/取消置顶、重命名、分叉、归档、在资源管理器中
		* 打开、复制工作区路径 / 日志路径 / 会话 ID、前往配置目录。仅当官方接口或宿主
		* 路由确实支撑时才渲染对应项（宁缺毋错）：
		*
		*  - 打开 / 重命名 / 分叉 / 归档：官方 client 接口
		*    （sessions.open / binding(id).session.rename / sessions.fork /
		*    workspaces.archiveSession —— 与官方 ui-workspace 行内菜单同源）；
		*  - 在资源管理器中打开：client 侧 invoke `open_workspace_path`（Tauri 壳
		*    平台命令，src/client/index.ts 的 open-workspace 分支同路径），不经宿主；
		*  - 复制日志路径 / 前往配置：宿主路由
		*    `/api/dsh-hub/session-paths/paths?id=...`（server/session-paths-api.ts）；
		*  - 工作区路径优先取 sessions.byId[id].cwd，缺省回退 workspaces items 的 path。
		*
		* 挂载为 body portal 浮层；点击外部 / Esc / 滚动 / 失焦即关闭；disposer 移除。
		* 本模块是纯动作库（open/close），事件接线在 pin-conversations.ts（官方行
		* 右键 + 官方 ⋯ 菜单截获 + 置顶项右键）。
		*
		* @module dsh-hub/client/session-menu
		*/
		/** Copy text to the clipboard with a legacy fallback for non-secure contexts. */
		function copyText(text) {
			if (navigator.clipboard !== void 0 && window.isSecureContext) return navigator.clipboard.writeText(text).then(() => true, () => copyFallback(text));
			return Promise.resolve(copyFallback(text));
		}
		/** execCommand fallback — document.execCommand is deprecated but universal. */
		function copyFallback(text) {
			try {
				const area = document.createElement("textarea");
				area.value = text;
				area.style.position = "fixed";
				area.style.opacity = "0";
				document.body.appendChild(area);
				area.select();
				const ok = document.execCommand("copy");
				area.remove();
				return ok;
			} catch {
				return false;
			}
		}
		/** Resolve the session's workspace directory from official snapshots. */
		function resolveWorkspacePath(ctx, id) {
			const runtime = ctx;
			const cwd = runtime.sessions?.list?.getSnapshot?.()?.byId?.[id]?.cwd;
			if (cwd !== void 0 && cwd !== "") return cwd;
			return (runtime.workspaces?.list?.getSnapshot?.()?.items ?? []).find((w) => w.sessionIds?.includes(id))?.path;
		}
		/**
		* Open a directory in the OS file manager via the Tauri shell's platform
		* command. dev-v2 打开文件夹只走这一条通道（client invoke）——已删除的
		* WebView2 explorer helper 不引；host 侧不再有 explorer 路由，无双写。
		*/
		function openInExplorer$1(path) {
			try {
				const internals = window.__TAURI_INTERNALS__;
				if (internals?.invoke === void 0) return;
				internals.invoke("open_workspace_path", { path }).catch(() => {});
			} catch {}
		}
		/**
		* Fetch one JSON document; null on any failure. The response shape is
		* open-ended (host route contract `{ ok, found, ... }`), so it is read as a
		* plain record and narrowed field-by-field at the call sites.
		*/
		async function fetchJson(url, init) {
			try {
				return await (await fetch(url, init)).json();
			} catch {
				return null;
			}
		}
		/**
		* Open the session context menu at the given position.
		*
		* @param params - target session + callbacks + plugin runtime (see {@link SessionMenuParams}).
		* @returns nothing; the menu removes itself on close.
		*/
		function openSessionMenu(params) {
			injectSessionMenuStyle();
			closeSessionMenu();
			const runtime = params.ctx;
			const workspacePath = resolveWorkspacePath(params.ctx, params.id);
			const entries = [{
				label: t$1("menu.openSession"),
				run: () => runtime.sessions?.open?.(params.id)
			}];
			const { pinned, onTogglePin, onRename } = params;
			if (onTogglePin !== void 0) entries.push({
				label: pinned ? t$1("menu.unpinTask") : t$1("menu.pinTask"),
				run: () => onTogglePin()
			});
			if (onRename !== void 0) entries.push({
				label: t$1("menu.renameTask"),
				run: () => onRename()
			});
			entries.push("sep");
			entries.push({
				label: t$1("menu.forkSession"),
				run: () => {
					runtime.sessions?.fork?.({
						sessionId: params.id,
						increaseTitle: true
					})?.then((childId) => {
						runtime.sessions?.open?.(childId);
					}).catch(() => {});
				}
			});
			entries.push({
				label: t$1("menu.archiveSession"),
				danger: true,
				run: () => {
					runtime.workspaces?.archiveSession?.(params.id)?.catch(() => {});
				}
			});
			entries.push("sep");
			if (workspacePath !== void 0) {
				entries.push({
					label: t$1("menu.openInExplorer"),
					run: () => {
						openInExplorer$1(workspacePath);
					}
				});
				entries.push({
					label: t$1("menu.copyWorkspacePath"),
					run: () => {
						copyText(workspacePath);
					}
				});
			}
			entries.push({
				label: t$1("menu.copyLogPath"),
				run: () => {
					fetchJson(`/api/dsh-hub/session-paths/paths?${new URLSearchParams({ id: params.id })}`).then((d) => {
						if (d?.found === true && typeof d.logPath === "string") copyText(d.logPath);
					});
				}
			});
			entries.push({
				label: t$1("menu.copySessionId"),
				run: () => {
					copyText(params.id);
				}
			});
			entries.push("sep");
			entries.push({
				label: t$1("menu.gotoConfig"),
				run: () => {
					fetchJson(`/api/dsh-hub/session-paths/paths?${new URLSearchParams({ id: params.id })}`).then((d) => {
						const dir = typeof d?.homeDir === "string" ? d.homeDir : void 0;
						if (dir === void 0) return;
						openInExplorer$1(dir);
					});
				}
			});
			const menu = document.createElement("div");
			menu.className = "mg-ctxmenu";
			menu.setAttribute("role", "menu");
			menu.setAttribute("aria-label", `会话菜单：${params.title}`);
			menu.dataset.mgCtxmenu = params.id;
			const head = document.createElement("div");
			head.className = "mg-ctxmenu__head";
			head.textContent = params.title;
			menu.appendChild(head);
			let firstItem;
			for (const entry of entries) {
				if (entry === "sep") {
					const sep = document.createElement("div");
					sep.className = "mg-ctxmenu__sep";
					menu.appendChild(sep);
					continue;
				}
				const item = document.createElement("button");
				item.type = "button";
				item.className = "mg-ctxmenu__item";
				item.setAttribute("role", "menuitem");
				if (entry.danger === true) item.classList.add("mg-ctxmenu__danger");
				item.textContent = entry.label;
				item.addEventListener("click", () => {
					closeSessionMenu();
					entry.run();
				});
				menu.appendChild(item);
				firstItem = firstItem ?? item;
			}
			document.body.appendChild(menu);
			const rect = menu.getBoundingClientRect();
			const left = Math.min(params.x, window.innerWidth - rect.width - 8);
			const top = Math.min(params.y, window.innerHeight - rect.height - 8);
			menu.style.left = `${Math.max(8, left)}px`;
			menu.style.top = `${Math.max(8, top)}px`;
			firstItem?.focus({ preventScroll: true });
			const onOutside = (event) => {
				if (event.target instanceof Node && menu.contains(event.target)) return;
				closeSessionMenu();
			};
			const onKey = (event) => {
				if (event.key === "Escape") {
					event.stopPropagation();
					closeSessionMenu();
				}
			};
			const onClose = () => closeSessionMenu();
			window.addEventListener("pointerdown", onOutside, true);
			window.addEventListener("keydown", onKey, true);
			window.addEventListener("resize", onClose);
			window.addEventListener("blur", onClose);
			window.addEventListener("scroll", onClose, true);
			activeDisposer = () => {
				menu.remove();
				window.removeEventListener("pointerdown", onOutside, true);
				window.removeEventListener("keydown", onKey, true);
				window.removeEventListener("resize", onClose);
				window.removeEventListener("blur", onClose);
				window.removeEventListener("scroll", onClose, true);
			};
		}
		/** Disposer of the currently open menu (undefined when closed). */
		let activeDisposer;
		/**
		* Close the currently open session menu, if any.
		*
		* @returns nothing; safe to call when no menu is open.
		*/
		function closeSessionMenu() {
			activeDisposer?.();
			activeDisposer = void 0;
		}
		//#endregion
		//#region src/client/workspace-menu.ts
		/**
		* Workspace row context menu — right-clicking a workspace (project) row in
		* the left sidebar opens a small workspace menu (new task / open folder)
		* instead of the native WebView2 refresh menu. Rendered with the same
		* `.mg-ctxmenu` scaffold as session-menu.ts (official-token styling), no new
		* layout; plain DOM enhancement like pin-conversations.
		*
		* @module dsh-hub/client/workspace-menu
		*/
		/** Cleanup of the open menu (undefined while closed). */
		let activeCleanup;
		/** Close the workspace menu if open. */
		function closeWorkspaceMenu() {
			activeCleanup?.();
			activeCleanup = void 0;
		}
		/** Run `open_workspace_path` through the Tauri shell bridge (folder in Explorer). */
		function openInExplorer(path) {
			try {
				const internals = window.__TAURI_INTERNALS__;
				if (internals?.invoke === void 0) return;
				internals.invoke("open_workspace_path", { path }).catch(() => {});
			} catch {}
		}
		/**
		* Open the workspace row menu at the given client coordinates. Closes any
		* session menu first (only one floating menu at a time). The menu scaffold and
		* close semantics mirror session-menu.ts.
		*/
		function openWorkspaceMenu(params) {
			injectSessionMenuStyle();
			closeSessionMenu();
			closeWorkspaceMenu();
			const ctx = params.ctx;
			const menu = document.createElement("div");
			menu.className = "mg-ctxmenu";
			menu.setAttribute("role", "menu");
			menu.style.left = `${params.x}px`;
			menu.style.top = `${params.y}px`;
			const title = params.workspace.title?.trim() || "";
			if (title !== "") {
				const head = document.createElement("div");
				head.className = "mg-ctxmenu__head";
				head.textContent = title;
				menu.append(head);
			}
			const addItem = (label, run) => {
				const item = document.createElement("div");
				item.className = "mg-ctxmenu__item";
				item.setAttribute("role", "menuitem");
				item.textContent = label;
				item.addEventListener("click", () => {
					closeWorkspaceMenu();
					run();
				});
				menu.append(item);
			};
			addItem(t$1("ws.newTask"), () => {
				ctx.workspaces?.startSession?.(params.workspace.workspaceId);
			});
			const path = params.workspace.path;
			if (path !== void 0 && path !== "") {
				const sep = document.createElement("div");
				sep.className = "mg-ctxmenu__sep";
				menu.append(sep);
				addItem(t$1("ws.openWorkspace"), () => {
					openInExplorer(path);
				});
			}
			document.body.append(menu);
			const rect = menu.getBoundingClientRect();
			menu.style.left = `${Math.max(4, Math.min(params.x, window.innerWidth - rect.width - 4))}px`;
			menu.style.top = `${Math.max(4, Math.min(params.y, window.innerHeight - rect.height - 4))}px`;
			const onOutside = (event) => {
				if (event.target instanceof Node && menu.contains(event.target)) return;
				closeWorkspaceMenu();
			};
			const onKey = (event) => {
				if (event.key === "Escape") closeWorkspaceMenu();
			};
			const onClose = () => {
				closeWorkspaceMenu();
			};
			window.addEventListener("pointerdown", onOutside, true);
			window.addEventListener("keydown", onKey, true);
			window.addEventListener("resize", onClose);
			window.addEventListener("blur", onClose);
			window.addEventListener("scroll", onClose, true);
			activeCleanup = () => {
				window.removeEventListener("pointerdown", onOutside, true);
				window.removeEventListener("keydown", onKey, true);
				window.removeEventListener("resize", onClose);
				window.removeEventListener("blur", onClose);
				window.removeEventListener("scroll", onClose, true);
				menu.remove();
			};
		}
		//#endregion
		//#region src/client/pin-conversations.ts
		/**
		* Pinned conversations (置顶会话) — the browser half of the conversation
		* pinning feature, reimplemented on rc.10 (see docs/PR4-置顶会话重构方案).
		*
		* The official session list (ui-workspace's WorkspaceBrowser inside the
		* `sidebar.workspaces` single slot) has no plugin seat for per-session
		* actions, so this module augments the rendered list with **stable anchors
		* only** — no CSS-module hashes:
		*
		*  - anchors: `div[data-slot="sidebar.workspaces"]` (slot renderer seam),
		*    `role="tree"`, `div[role="treeitem"]` (session rows; project rows carry
		*    `aria-expanded`, search-result rows are `<button>` and are excluded);
		*  - row → session mapping is **content-based**: a row is the session whose
		*    `displayTitle` text appears inside it. Duplicate titles → the whole
		*    title group is skipped (never mislabeled). Renamed sessions simply stop
		*    matching until the row re-renders with the new title — the pin itself
		*    survives (pins are keyed by session id);
		*  - the pinned section is injected as a **sibling of `role="tree"`** inside
		*    the slot container (`role="group" aria-label="置顶会话"`), so the tree's
		*    aria structure is untouched; an independent scroll block (40vh);
		*  - persistence: host GET/PUT `/api/dsh-hub/pins` (`pins.json`), with a
		*    localStorage fallback when the API is unreachable.
		*
		* Correctness state machine (report §2.6): write paths are gated on a landed
		* `ready` baseline so an empty mid-boot session list can never wipe pins;
		* boot results merge with the user's in-flight delta (`dirtyDelta`), and
		* pruning only removes pins after two consecutive ready snapshots miss the id
		* (or an explicit unpin).
		*
		* Full-action context menu: right-clicking any session row (official tree rows
		* and pinned items alike) opens the hub session menu (session-menu.ts), and
		* the official ⋯ row-actions trigger is intercepted so it opens the same
		* menu. The pinned section's inline rename form (editingId state) is entered
		* through the menu's 重命名任务 item; while editing, the debounced sync is
		* paused so typing never flushes the draft, and a failed rename keeps the
		* editor open for retry.
		*
		* @module dsh-hub/client/pin-conversations
		*/
		/** Route prefix of the host pins API (mirrors server/pins-api.ts). */
		const PINS_API = "/api/dsh-hub/pins";
		/** localStorage fallback key (used only when the host API is unreachable). */
		const LS_KEY = "dsh-hub:pins";
		/** Mirror of the host-side cap (server/pins-api.ts MAX_PINS). */
		const MAX_PINS = 200;
		/** Stable anchors (framework contracts, not CSS-module hashes). */
		const SLOT_SELECTOR = "div[data-slot=\"sidebar.workspaces\"]";
		const TREE_SELECTOR = "[role=\"tree\"]";
		/** Session rows only: div rows, excluding project rows (aria-expanded) and
		* search-result rows (`<button role="treeitem">`). */
		const SESSION_ROW_SELECTOR = "div[role=\"treeitem\"]:not([aria-expanded])";
		/** 24-viewBox pin glyph (Material push_pin grid), pre-expanded fill path. */
		const PIN_PATH = "M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z";
		const PIN_FILLED_SVG = `<svg class="${PIN_CSS_CLASSES.pinSvg}" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${PIN_PATH}"/></svg>`;
		const PIN_OUTLINE_SVG = `<svg class="${PIN_CSS_CLASSES.pinSvg}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="${PIN_PATH}"/></svg>`;
		/** Collapse whitespace + trim — row text and displayTitle must agree. */
		function normalizeTitle(value) {
			return value.replace(/\s+/g, " ").trim();
		}
		/** Debounce helper. */
		function debounce(fn, ms) {
			let timer;
			return () => {
				if (timer !== void 0) clearTimeout(timer);
				timer = setTimeout(fn, ms);
			};
		}
		/** 诊断上报（进 dsh.log：E2E 断言 + 置顶会话失效排查链路证据）。 */
		function reportDiag(msg) {
			try {
				window.__TAURI_INTERNALS__?.invoke?.("diag_report", { msg: `pin:${msg}` }).catch?.(() => {});
			} catch {}
		}
		/** Pinned-conversations controller; install() returns the disposer. */
		function installPinnedConversations(ctx) {
			const runtime = ctx;
			let pinned = [];
			const pinnedSet = /* @__PURE__ */ new Set();
			/** In-flight user delta during boot (boot results merge, never overwrite). */
			const dirtyDelta = {
				added: /* @__PURE__ */ new Set(),
				removed: /* @__PURE__ */ new Set()
			};
			/** First phase==='ready' snapshot has landed (write-path gate). */
			let readyBaselineLanded = false;
			/** Consecutive ready snapshots missing each pinned id (prune counter). */
			const missingStreak = /* @__PURE__ */ new Map();
			let alive = true;
			let inSearch = false;
			/** 锚点缺失诊断只报一次（MutationObserver 高频触发防刷屏）。 */
			let anchorMissingReported = false;
			/** Pinned item currently in inline rename mode (session id), or null. */
			let editingId = null;
			const debouncedSync = debounce(() => {
				if (alive && editingId === null) sync();
			}, 250);
			async function apiGetPins() {
				try {
					const body = await (await fetch(PINS_API)).json();
					if (body.ok === true && Array.isArray(body.ids)) return body.ids.filter((id) => typeof id === "string" && id !== "");
					return null;
				} catch {
					return null;
				}
			}
			/** Serialized PUTs: concurrent fetches can hit different connections and
			* arrive out of order (a slow old PUT would clobber a newer state), so the
			* write path is a promise chain — the last queued state wins. */
			let writeQueue = Promise.resolve();
			function apiPutPins(ids) {
				writeQueue = writeQueue.then(async () => {
					await fetch(PINS_API, {
						method: "PUT",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ ids })
					});
				}).catch(() => {});
			}
			/** Parse a stored pins JSON string into ids; null/corrupt → nothing. */
			function parseIds(raw) {
				if (raw === null) return [];
				try {
					const parsed = JSON.parse(raw);
					return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string" && id !== "") : [];
				} catch {
					return [];
				}
			}
			function lsRead() {
				try {
					return parseIds(localStorage.getItem(LS_KEY));
				} catch {
					return [];
				}
			}
			function lsWrite(ids) {
				try {
					localStorage.setItem(LS_KEY, JSON.stringify(ids));
				} catch {}
			}
			function setPinned(ids) {
				pinned = ids.slice(0, MAX_PINS);
				pinnedSet.clear();
				for (const id of pinned) pinnedSet.add(id);
			}
			function persist(ids) {
				setPinned(ids);
				lsWrite(ids);
				apiPutPins(ids);
			}
			function togglePin(id) {
				if (!alive) return;
				const wasPinned = pinnedSet.has(id);
				if (wasPinned) dirtyDelta.removed.add(id);
				else dirtyDelta.added.add(id);
				missingStreak.delete(id);
				persist(wasPinned ? pinned.filter((value) => value !== id) : [...pinned, id].slice(0, MAX_PINS));
				sync();
			}
			/** Ask the official session binding to rename a pinned session. */
			async function renamePinnedSession(id, title) {
				const session = runtime.sessions?.binding?.(id)?.session;
				if (session?.rename === void 0) return null;
				try {
					const result = await session.rename(title);
					if (result.ok !== true || typeof result.value?.title !== "string") return null;
					return result.value.title;
				} catch {
					return null;
				}
			}
			/** Open inline rename for one pinned item. */
			function beginRename(id) {
				if (!alive) return;
				editingId = id;
				sync();
			}
			/** Close inline rename (cancel or after a successful save). */
			function endRename() {
				if (editingId === null) return;
				editingId = null;
				sync();
			}
			function sessionSnapshot() {
				return runtime.sessions?.list?.getSnapshot?.();
			}
			function workspaceSnapshot() {
				return runtime.workspaces?.list?.getSnapshot?.();
			}
			/**
			* Content-based row → id mapping. A row is the session whose displayTitle
			* text appears inside it; duplicate titles make the whole title group
			* ambiguous and are skipped entirely (never mislabeled). Returns the title
			* element as well, so the pin button can be inserted right after it.
			*/
			function mapRowByContent(row) {
				const byId = sessionSnapshot()?.byId ?? {};
				const titleToIds = /* @__PURE__ */ new Map();
				for (const summary of Object.values(byId)) {
					if (summary?.blank === true) continue;
					const title = summary.displayTitle;
					if (title === void 0) continue;
					const key = normalizeTitle(title);
					if (key === "") continue;
					const list = titleToIds.get(key);
					if (list === void 0) titleToIds.set(key, [summary.id ?? ""]);
					else list.push(summary.id ?? "");
				}
				const leafTexts = [];
				const candidates = /* @__PURE__ */ new Map();
				for (const el of Array.from(row.querySelectorAll("span, div"))) {
					const text = el.childElementCount === 0 ? el.textContent : void 0;
					if (text === void 0 || text === "") continue;
					const raw = text.trim();
					if (raw !== "") leafTexts.push(normalizeTitle(raw));
					const style = getComputedStyle(el);
					if (style.position === "absolute") continue;
					const fontSize = parseFloat(style.fontSize);
					if (Number.isFinite(fontSize) && fontSize < 13) continue;
					const key = normalizeTitle(text);
					if (key === "") continue;
					const ids = titleToIds.get(key);
					if (ids === void 0 || ids.length !== 1) continue;
					if (!candidates.has(ids[0])) candidates.set(ids[0], {
						id: ids[0],
						el,
						title: key
					});
				}
				const entries = [...candidates.values()];
				if (entries.length !== 1) return void 0;
				const entry = entries[0];
				if (leafTexts.some((t) => t.length > entry.title.length && t.includes(entry.title) && titleToIds.has(t))) return void 0;
				return entry === void 0 ? void 0 : {
					id: entry.id,
					titleEl: entry.el
				};
			}
			/** The slot container, or null. */
			function findSlot() {
				return document.querySelector(SLOT_SELECTOR);
			}
			/** The main session tree inside the slot, or null. */
			function findTree() {
				const slot = findSlot();
				if (slot === null) return null;
				return slot.querySelector(TREE_SELECTOR);
			}
			/** True while the visible tree is the search tree. A non-empty search tree
			* has button rows only; an EMPTY search tree has zero rows but an active
			* search input with a query — the wide-mode input is always rendered
			* (opacity-hidden), so visibility must be judged by its value, never by
			* geometry. */
			function detectSearch(tree, slot) {
				const rows = tree.querySelectorAll("[role=\"treeitem\"]");
				if (rows.length > 0) return Array.from(rows).every((row) => row.tagName === "BUTTON");
				const input = slot.querySelector("input");
				return input !== null && input.value.trim() !== "";
			}
			/** Ensure one pin-toggle button on a row (after the matched title element). */
			function ensurePinButton(row, id, titleEl) {
				let button = Array.from(row.querySelectorAll("[data-mg-pin]")).find((el) => el.dataset.mgPin === id);
				if (button === void 0) {
					button = document.createElement("button");
					button.type = "button";
					button.className = PIN_CSS_CLASSES.pinBtn;
					button.dataset.mgPin = id;
					button.draggable = false;
					button.addEventListener("click", (event) => {
						event.preventDefault();
						event.stopPropagation();
						togglePin(id);
					});
					row.insertBefore(button, titleEl.nextSibling);
				}
				return button;
			}
			/** Apply the pinned state to one row (button icon, marker, aria). */
			function applyRowState(row, id, titleEl) {
				const isPinned = pinnedSet.has(id);
				row.classList.toggle(PIN_CSS_CLASSES.rowPinned, isPinned);
				row.dataset.mgPinned = isPinned ? "true" : "";
				const button = ensurePinButton(row, id, titleEl);
				button.classList.toggle(PIN_CSS_CLASSES.pinBtnOn, isPinned);
				const label = isPinned ? "取消置顶" : "置顶会话";
				if (button.getAttribute("aria-label") !== label) button.setAttribute("aria-label", label);
				if (button.title !== label) button.title = label;
				const svg = isPinned ? PIN_FILLED_SVG : PIN_OUTLINE_SVG;
				if (button.innerHTML !== svg) button.innerHTML = svg;
			}
			/** Remove stale pin buttons whose id no longer matches the row. */
			function pruneStaleButtons(row, id) {
				for (const button of Array.from(row.querySelectorAll("[data-mg-pin]"))) {
					if (button.dataset.mgPin === id) continue;
					button.remove();
				}
				if (id === void 0) {
					row.classList.remove(PIN_CSS_CLASSES.rowPinned);
					delete row.dataset.mgPinned;
				}
			}
			/** Rebuild the pinned section as the tree's sibling (outside the scroll
			* container: the tree element IS the scroll container, and its parent —
			* the browser body — is where the section lives, so it stays visible
			* while the list scrolls). */
			function syncPinnedSection(tree) {
				const slot = findSlot();
				const treeParent = tree.parentNode;
				if (slot === null || treeParent === null) return;
				const byId = sessionSnapshot()?.byId ?? {};
				const archived = new Set(workspaceSnapshot()?.archivedSessionIds ?? []);
				const live = pinned.filter((id) => {
					const summary = byId[id];
					return summary !== void 0 && summary.blank !== true && !archived.has(id);
				});
				let section = Array.from(treeParent.children).find((el) => el.classList.contains(PIN_CSS_CLASSES.section));
				if (section === void 0) {
					section = document.createElement("div");
					section.className = PIN_CSS_CLASSES.section;
					section.setAttribute("role", "group");
					section.setAttribute("aria-label", "置顶会话");
				}
				if (section.parentNode !== treeParent || section.nextSibling !== tree) treeParent.insertBefore(section, tree);
				const sig = `${inSearch ? ":search" : ""}|${live.length === 0 ? ":empty" : ""}|edit:${editingId ?? ""}|${live.map((id) => byId[id]?.displayTitle ?? id).join("")}`;
				if (section.dataset.sig === sig) {
					section.hidden = inSearch || live.length === 0;
					return;
				}
				section.dataset.sig = sig;
				const header = document.createElement("div");
				header.className = PIN_CSS_CLASSES.head;
				const label = document.createElement("span");
				label.className = PIN_CSS_CLASSES.headLabel;
				label.textContent = "置顶";
				const count = document.createElement("span");
				count.className = PIN_CSS_CLASSES.headCount;
				count.textContent = String(live.length);
				header.append(label, count);
				const list = document.createElement("div");
				list.className = PIN_CSS_CLASSES.list;
				for (const id of live) {
					const summary = byId[id];
					const title = summary?.displayTitle !== void 0 ? summary.displayTitle : id;
					const item = document.createElement("div");
					item.className = PIN_CSS_CLASSES.item;
					item.dataset.mgPinItem = id;
					if (editingId === id) {
						const edit = document.createElement("div");
						edit.className = PIN_CSS_CLASSES.itemEdit;
						const input = document.createElement("input");
						input.className = PIN_CSS_CLASSES.itemEditInput;
						input.value = title;
						input.spellcheck = false;
						input.setAttribute("aria-label", `重命名会话：${title}`);
						const save = document.createElement("button");
						save.type = "button";
						save.className = PIN_CSS_CLASSES.itemEditSave;
						save.textContent = "保存";
						const cancel = document.createElement("button");
						cancel.type = "button";
						cancel.className = PIN_CSS_CLASSES.itemEditCancel;
						cancel.textContent = "取消";
						const submit = () => {
							const next = input.value.trim().replace(/\s+/g, " ");
							if (next === "") {
								input.focus();
								return;
							}
							renamePinnedSession(id, next).then((accepted) => {
								if (!alive) return;
								if (accepted !== null) endRename();
							});
						};
						save.addEventListener("click", submit);
						cancel.addEventListener("click", () => endRename());
						input.addEventListener("keydown", (event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								submit();
							} else if (event.key === "Escape") {
								event.preventDefault();
								endRename();
							}
						});
						edit.append(input, save, cancel);
						item.append(edit);
						queueMicrotask(() => {
							if (alive && editingId === id) input.focus();
						});
					} else {
						const open = document.createElement("button");
						open.type = "button";
						open.className = PIN_CSS_CLASSES.itemOpen;
						open.addEventListener("click", () => {
							runtime.sessions?.open?.(id);
						});
						const icon = document.createElement("span");
						icon.className = PIN_CSS_CLASSES.itemIcon;
						icon.innerHTML = PIN_FILLED_SVG;
						const itemTitle = document.createElement("span");
						itemTitle.className = PIN_CSS_CLASSES.itemTitle;
						itemTitle.textContent = title;
						itemTitle.title = `${title}（悬停可重命名）`;
						open.append(icon, itemTitle);
						const unpin = document.createElement("button");
						unpin.type = "button";
						unpin.className = PIN_CSS_CLASSES.itemUnpin;
						unpin.dataset.mgPinUnpin = id;
						unpin.setAttribute("aria-label", `取消置顶：${title}`);
						unpin.title = "取消置顶";
						unpin.innerHTML = PIN_FILLED_SVG;
						unpin.addEventListener("click", () => {
							togglePin(id);
							(item.nextElementSibling?.querySelector(`.${PIN_CSS_CLASSES.itemOpen}`) ?? item.previousElementSibling?.querySelector(`.${PIN_CSS_CLASSES.itemOpen}`) ?? tree.querySelector(`.${PIN_CSS_CLASSES.pinBtn}`))?.focus({ preventScroll: true });
						});
						item.append(open, unpin);
					}
					item.addEventListener("contextmenu", (event) => {
						event.preventDefault();
						event.stopPropagation();
						openSessionMenu({
							x: event.clientX,
							y: event.clientY,
							id,
							title,
							pinned: true,
							ctx: runtime,
							onTogglePin: () => togglePin(id),
							onRename: () => beginRename(id)
						});
					});
					list.appendChild(item);
				}
				section.replaceChildren(header, list);
				section.hidden = inSearch || live.length === 0;
			}
			/** Full idempotent pass over the current list DOM. */
			function sync() {
				if (!alive) return;
				const slot = findSlot();
				const tree = findTree();
				if (slot === null || tree === null) {
					if (!anchorMissingReported) {
						anchorMissingReported = true;
						reportDiag(`sync: slot=${slot !== null} tree=${tree !== null}`);
					}
					return;
				}
				inSearch = detectSearch(tree, slot);
				try {
					syncPinnedSection(tree);
				} catch {}
				if (inSearch) return;
				for (const el of Array.from(tree.querySelectorAll(SESSION_ROW_SELECTOR))) {
					const match = mapRowByContent(el);
					if (match !== void 0) {
						pruneStaleButtons(el, match.id);
						applyRowState(el, match.id, match.titleEl);
					} else pruneStaleButtons(el, void 0);
				}
			}
			/** Fold one ready snapshot: count consecutive misses, prune confirmed-gone.
			* Empty/blank snapshots never prune — an all-blank mid-boot (or
			* fully-deleted) list must never wipe pins; the baseline lands only on the
			* first NON-empty ready snapshot, so pre-data snapshots can't gate writes. */
			function foldReadySnapshot() {
				const snapshot = sessionSnapshot();
				const byId = snapshot?.byId ?? {};
				if (snapshot === void 0 || Object.values(byId).every((s) => s?.blank === true)) return;
				if (!readyBaselineLanded) {
					readyBaselineLanded = true;
					return;
				}
				let changed = false;
				const next = pinned.filter((id) => {
					if (byId[id] !== void 0 && byId[id]?.blank !== true) {
						missingStreak.delete(id);
						return true;
					}
					const streak = (missingStreak.get(id) ?? 0) + 1;
					missingStreak.set(id, streak);
					if (streak >= 2) {
						changed = true;
						return false;
					}
					return true;
				});
				if (changed) persist(next);
			}
			const slotObserver = new MutationObserver(() => debouncedSync());
			const unsubSessions = runtime.sessions?.list?.subscribe?.(() => {
				if (sessionSnapshot()?.phase !== "ready") return;
				foldReadySnapshot();
				debouncedSync();
			}) ?? (() => {});
			const unsubWorkspaces = runtime.workspaces?.list?.subscribe?.(() => {
				debouncedSync();
			}) ?? (() => {});
			const onStorage = (event) => {
				if (event.key !== LS_KEY || !alive) return;
				const raw = event.newValue;
				if (raw === null) return;
				const incoming = parseIds(raw);
				if (incoming.length === pinned.length && incoming.every((id, i) => id === pinned[i])) return;
				setPinned(incoming);
				sync();
				apiPutPins(incoming);
			};
			window.addEventListener("storage", onStorage);
			injectPinStyle();
			const matchWorkspaceByContent = (row) => {
				const text = (row.textContent ?? "").trim();
				if (text === "") return void 0;
				return (runtime.workspaces?.list?.getSnapshot?.()?.items ?? []).find((w) => (w.title ?? "").trim() === text);
			};
			const onRowContextMenu = (event) => {
				if (!alive) return;
				if (event.target instanceof Element && event.target.closest("[data-mg-pin-item]")) return;
				const row = event.target instanceof Element ? event.target.closest("div[role=\"treeitem\"]:not([aria-expanded])") : null;
				if (row === null) {
					const wrow = event.target instanceof Element ? event.target.closest("div[role=\"treeitem\"][aria-expanded]") : null;
					if (wrow !== null) {
						const ws = matchWorkspaceByContent(wrow);
						if (ws !== void 0) {
							event.preventDefault();
							event.stopPropagation();
							openWorkspaceMenu({
								x: event.clientX,
								y: event.clientY,
								workspace: ws,
								ctx: runtime
							});
						}
					}
					return;
				}
				const match = mapRowByContent(row);
				if (match === void 0) return;
				const summary = sessionSnapshot()?.byId?.[match.id];
				if (summary === void 0 || summary.blank === true) return;
				event.preventDefault();
				event.stopPropagation();
				openSessionMenu({
					x: event.clientX,
					y: event.clientY,
					id: match.id,
					title: summary.displayTitle ?? match.id,
					pinned: pinnedSet.has(match.id),
					ctx: runtime,
					onTogglePin: () => togglePin(match.id),
					onRename: () => beginRename(match.id)
				});
			};
			document.addEventListener("contextmenu", onRowContextMenu);
			const onRowActionsClick = (event) => {
				if (!alive) return;
				if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
				const target = event.target instanceof Element ? event.target : null;
				if (target === null) return;
				if (target.closest("[data-mg-pin-item]")) return;
				const row = target.closest("div[role=\"treeitem\"]:not([aria-expanded])");
				if (row === null) return;
				const actions = row.lastElementChild;
				if (actions === null || !actions.contains(target)) return;
				const match = mapRowByContent(row);
				if (match === void 0) return;
				const summary = sessionSnapshot()?.byId?.[match.id];
				if (summary === void 0 || summary.blank === true) return;
				event.preventDefault();
				event.stopPropagation();
				const rect = target.getBoundingClientRect();
				openSessionMenu({
					x: rect.left,
					y: rect.bottom + 4,
					id: match.id,
					title: summary.displayTitle ?? match.id,
					pinned: pinnedSet.has(match.id),
					ctx: runtime,
					onTogglePin: () => togglePin(match.id),
					onRename: () => beginRename(match.id)
				});
			};
			document.addEventListener("click", onRowActionsClick, true);
			setPinned(lsRead());
			sync();
			apiGetPins().then((ids) => {
				if (!alive || ids === null) return;
				const bootPinned = ids;
				const merged = [
					...bootPinned.filter((id) => !dirtyDelta.removed.has(id)),
					...Array.from(dirtyDelta.added).filter((id) => !dirtyDelta.removed.has(id)),
					...pinned.filter((id) => !bootPinned.includes(id) && !dirtyDelta.removed.has(id))
				];
				dirtyDelta.added.clear();
				dirtyDelta.removed.clear();
				const seen = /* @__PURE__ */ new Set();
				const next = [];
				for (const id of merged) {
					if (id === "" || seen.has(id)) continue;
					seen.add(id);
					next.push(id);
					if (next.length >= MAX_PINS) break;
				}
				setPinned(next);
				lsWrite(next);
				apiPutPins(next);
				sync();
			});
			const installObserver = () => {
				const slot = findSlot();
				if (slot === null) return;
				slotObserver.observe(slot, {
					childList: true,
					subtree: true
				});
			};
			installObserver();
			const bootObserver = new MutationObserver(() => {
				if (findSlot() !== null && slotObserver.takeRecords().length === 0) {
					bootObserver.disconnect();
					installObserver();
					sync();
					const tree = findTree();
					const rows = tree === null ? 0 : tree.querySelectorAll(SESSION_ROW_SELECTOR).length;
					const sessions = Object.values(sessionSnapshot()?.byId ?? {}).filter((s) => s?.blank !== true).length;
					reportDiag(`boot: slot=ok tree=${tree !== null} rows=${rows} sessions=${sessions}`);
				}
			});
			bootObserver.observe(document.body, {
				childList: true,
				subtree: true
			});
			setTimeout(() => {
				if (findSlot() === null && alive) {
					bootObserver.disconnect();
					reportDiag("boot: slot-missing-timeout (layout mismatch?)");
				}
			}, 1e4);
			return () => {
				alive = false;
				slotObserver.disconnect();
				bootObserver.disconnect();
				unsubSessions();
				unsubWorkspaces();
				window.removeEventListener("storage", onStorage);
				document.removeEventListener("contextmenu", onRowContextMenu);
				document.removeEventListener("click", onRowActionsClick, true);
				closeSessionMenu();
				for (const el of Array.from(document.querySelectorAll(`[data-mg-pin], [data-mg-pin-item], .${PIN_CSS_CLASSES.section}`))) el.remove();
				for (const el of Array.from(document.querySelectorAll(`[data-mg-pinned]`))) {
					el.classList.remove(PIN_CSS_CLASSES.rowPinned);
					delete el.dataset.mgPinned;
				}
			};
		}
		//#endregion
		//#region src/client/model-select.tsx
		/**
		* dsh-hub model-select override — replaces the built-in composer model seat
		* (`conversation.input.model`) with a nested provider -> model menu.
		*
		* The built-in ui-model-selection registers the seat at priority 0; this
		* entry registers at priority -1 so it shadows the built-in (lowest priority
		* wins per the slot registry). It reuses the built-in `modelDirectories`
		* service for the shared per-session model directory, so selection state and
		* the /model command stay consistent.
		*
		* Layout: two adjacent trigger buttons — left opens the supplier list, right
		* opens the thinking-effort list (only "default" when the model has none).
		*/
		/** Themed CSS (mirrors the built-in model seat look). */
		const CSS$1 = [
			"._dshnms_root{min-width:0;position:relative}",
			"._dshnms_trigger{min-width:0;max-width:220px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}",
			"._dshnms_trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			"._dshnms_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}",
			"._dshnms_trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}",
			"._dshnms_triggerRow{display:flex;align-items:center;gap:2px}",
			"._dshnms_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}",
			"._dshnms_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}",
			"._dshnms_chevronOpen{transform:rotate(180deg)}",
			"._dshnms_menu{z-index:20;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);width:min(240px,100vw - 32px);max-height:min(400px,100vh - 96px);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:absolute;bottom:calc(100% + 8px);right:0;overflow:hidden}",
			"._dshnms_status,._dshnms_empty{color:var(--dsw-alias-label-tertiary);padding:10px;font-size:13px;line-height:20px}",
			"._dshnms_error,._dshnms_warning{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}",
			"._dshnms_warning{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-state-warn-label)}",
			"._dshnms_retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0;font-weight:600}",
			"._dshnms_groups{min-height:0;overflow-y:auto;overscroll-behavior:contain}",
			"._dshnms_option{width:100%;color:var(--dsw-alias-label-primary);background:0 0;border:none;border-radius:8px;outline:none;justify-content:space-between;align-items:center;gap:8px;padding:6px 8px;font-size:13px;font-weight:500;line-height:20px;text-align:left;display:flex;cursor:pointer}",
			"._dshnms_option:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			"._dshnms_option:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}",
			"._dshnms_option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}",
			"._dshnms_selected{background:0 0}",
			"._dshnms_optionCopy{min-width:0;flex-direction:column;gap:1px;display:flex}",
			"._dshnms_modelName{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}",
			"._dshnms_description{color:var(--dsw-alias-label-caption);text-overflow:ellipsis;white-space:nowrap;overflow:hidden;font-size:11px;line-height:16px;font-weight:400}",
			"._dshnms_check{color:var(--dsw-alias-label-primary);flex:0 0 18px;place-items:center;display:grid}",
			"._dshnms_cell{width:100%;color:var(--dsw-alias-label-primary);background:0 0;border:none;border-radius:8px;outline:none;align-items:center;gap:8px;padding:6px 8px;font-size:13px;font-weight:500;line-height:20px;text-align:left;display:flex;cursor:pointer}",
			"._dshnms_cell:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			"._dshnms_cell:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}",
			"._dshnms_cellLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 auto}",
			"._dshnms_cellValue{color:var(--dsw-alias-label-caption);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:none;max-width:120px}",
			"._dshnms_cellChevron{color:var(--dsw-alias-label-caption);flex:none;display:flex}",
			"._dshnms_back{color:var(--dsw-alias-label-caption);flex:none;display:flex;margin-right:2px}",
			"._dshnms_header{width:100%;align-items:center;gap:4px;padding:4px 4px 6px;font-size:12px;font-weight:600;line-height:18px;color:var(--dsw-alias-label-secondary);border-bottom:1px solid var(--dsw-alias-border-l2);margin-bottom:4px;display:flex}",
			"._dshnms_headerName{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
		].join("");
		const CSS_TAG = "@marecgents/dsh-hub/model-select.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(CSS_TAG) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@marecgents/dsh-hub";
			tag.dataset.pluginCss = CSS_TAG;
			tag.textContent = CSS$1;
			document.head.appendChild(tag);
		}
		const c = {
			root: "_dshnms_root",
			trigger: "_dshnms_trigger",
			triggerRow: "_dshnms_triggerRow",
			triggerLabel: "_dshnms_triggerLabel",
			chevron: "_dshnms_chevron",
			chevronOpen: "_dshnms_chevronOpen",
			menu: "_dshnms_menu",
			status: "_dshnms_status",
			empty: "_dshnms_empty",
			error: "_dshnms_error",
			warning: "_dshnms_warning",
			retry: "_dshnms_retry",
			groups: "_dshnms_groups",
			option: "_dshnms_option",
			optionCopy: "_dshnms_optionCopy",
			modelName: "_dshnms_modelName",
			description: "_dshnms_description",
			selected: "_dshnms_selected",
			check: "_dshnms_check",
			cell: "_dshnms_cell",
			cellLabel: "_dshnms_cellLabel",
			cellValue: "_dshnms_cellValue",
			cellChevron: "_dshnms_cellChevron",
			back: "_dshnms_back",
			header: "_dshnms_header",
			headerName: "_dshnms_headerName"
		};
		/** Minimal locale binder (the hub keeps its own copy; no locale plugin dep). */
		function t(key, params) {
			const dict = zh[key] ?? en[key] ?? key;
			if (params === void 0) return dict;
			return dict.replace(/\{([^}]+)\}/g, (_, k) => params[k] ?? "");
		}
		const zh = {
			"trigger.fallback": "选择模型",
			"trigger.selectAria": "选择模型",
			"menu.aria": "模型与思考强度",
			"menu.effort": "思考强度",
			"menu.back": "返回",
			"menu.models": "{name} · 选择模型",
			"effort.providerDefault": "默认",
			"status.loading": "正在刷新模型列表…",
			"error.action": "模型操作失败：{message}",
			"action.reload": "重新加载",
			"warning.groupLoad": "{name} 加载失败：{message}",
			"empty.providers": "没有可用的供应商。",
			"empty.efforts": "当前模型未提供思考强度。"
		};
		const en = {
			"trigger.fallback": "Select model",
			"trigger.selectAria": "Select model",
			"menu.aria": "Model and thinking effort",
			"menu.effort": "Thinking effort",
			"menu.back": "Back",
			"menu.models": "{name} · Select model",
			"effort.providerDefault": "Default",
			"status.loading": "Refreshing model list…",
			"error.action": "Model load failed: {message}",
			"action.reload": "Reload",
			"warning.groupLoad": "{name} failed to load: {message}",
			"empty.providers": "No providers available.",
			"empty.efforts": "This model provides no thinking effort levels."
		};
		function ModelSelectNested({ locked, available, directory, load, select }) {
			const state = (0, react.useSyncExternalStore)((fn) => directory.subscribe(fn), () => directory.getSnapshot());
			const [open, setOpen] = (0, react.useState)(false);
			const [pane, setPane] = (0, react.useState)("providers");
			const [activeGroup, setActiveGroup] = (0, react.useState)(null);
			const [toast, setToast] = (0, react.useState)(null);
			const toastSeq = (0, react.useRef)(0);
			const rootRef = (0, react.useRef)(null);
			const modelTriggerRef = (0, react.useRef)(null);
			const effortTriggerRef = (0, react.useRef)(null);
			const itemRefs = (0, react.useRef)([]);
			const id = (0, react.useId)();
			const choices = (0, react.useMemo)(() => state.groups.flatMap((group) => group.models.map((model) => ({
				group,
				model,
				selection: {
					provider: group.id,
					model: model.id,
					...model.reasoning && model.reasoning.defaultEffort !== void 0 ? { reasoningEffort: model.reasoning.defaultEffort } : {}
				}
			}))), [state.groups]);
			const currentChoice = choices[state.current === null ? -1 : choices.findIndex((c) => c.selection.provider === state.current.provider && c.selection.model === state.current.model)];
			const reasoning = currentChoice && currentChoice.model.reasoning;
			const effectiveEffort = state.current && state.current.reasoningEffort !== void 0 ? state.current.reasoningEffort : reasoning && reasoning.defaultEffort;
			const effortLabel = effectiveEffort === void 0 ? t("effort.providerDefault") : (reasoning && reasoning.efforts.find((l) => l.id === effectiveEffort) || {}).name || effectiveEffort;
			const effortChoices = (0, react.useMemo)(() => reasoning === void 0 ? [{
				key: "provider-default",
				effort: void 0,
				label: t("effort.providerDefault")
			}] : [...reasoning.defaultEffort === void 0 ? [{
				key: "provider-default",
				effort: void 0,
				label: t("effort.providerDefault")
			}] : [], ...reasoning.efforts.map((effort) => ({
				key: "effort:" + effort.id,
				effort: effort.id,
				label: effort.name,
				...effort.description === void 0 ? {} : { description: effort.description }
			}))], [reasoning, t]);
			const busy = state.status === "selecting";
			const reload = () => {
				load();
			};
			(0, react.useEffect)(() => {
				if (available) load();
			}, [available, load]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const closeOutside = (event) => {
					if (!rootRef.current || !rootRef.current.contains(event.target)) setOpen(false);
				};
				document.addEventListener("mousedown", closeOutside);
				return () => document.removeEventListener("mousedown", closeOutside);
			}, [open]);
			if (!available) return null;
			const showProviders = () => {
				setPane("providers");
				setActiveGroup(null);
				setOpen(true);
				reload();
			};
			const showEffort = () => {
				setPane("effort");
				setOpen(true);
				reload();
			};
			const close = (restoreFocus = false) => {
				setOpen(false);
				setPane("providers");
				setActiveGroup(null);
				if (restoreFocus) queueMicrotask(() => {
					modelTriggerRef.current?.focus();
				});
			};
			const goBack = () => {
				if (pane === "model" || pane === "effort") {
					setPane("providers");
					return;
				}
				if (pane === "providers") close(true);
			};
			const moveFocus = (offset) => {
				const items = itemRefs.current.filter((item) => item !== null);
				if (items.length === 0) return;
				const active = items.findIndex((item) => item === document.activeElement);
				items[(Math.max(active, 0) + offset + items.length) % items.length]?.focus();
			};
			const onRootKeyDown = (event) => {
				if (event.key === "Escape" && open) {
					event.preventDefault();
					goBack();
					return;
				}
				if (!open) return;
				if (event.key === "ArrowDown" || event.key === "ArrowUp") {
					event.preventDefault();
					moveFocus(event.key === "ArrowDown" ? 1 : -1);
				}
			};
			const onBlur = (event) => {
				if (event.relatedTarget instanceof Node && rootRef.current && rootRef.current.contains(event.relatedTarget)) return;
				close();
			};
			const settleSelection = (accepted) => {
				if (accepted) {
					if (rootRef.current !== null) close(true);
					return;
				}
				const message = directory.getSnapshot().error;
				if (message !== null) {
					toastSeq.current += 1;
					setToast({
						seq: toastSeq.current,
						text: t("error.action", { message })
					});
				}
			};
			const choose = (selection) => {
				if (state.current && state.current.provider === selection.provider && state.current.model === selection.model) {
					close(true);
					return;
				}
				select(selection).then(settleSelection);
			};
			const chooseEffort = (effort) => {
				if (state.current === null) return;
				if (effectiveEffort === effort) {
					close(true);
					return;
				}
				select({
					provider: state.current.provider,
					model: state.current.model,
					...effort === void 0 ? {} : { reasoningEffort: effort }
				}).then(settleSelection);
			};
			const modelLabel = currentChoice ? currentChoice.model.name : t("trigger.fallback");
			itemRefs.current = [];
			let itemIndex = 0;
			const itemRef = () => {
				const at = itemIndex++;
				return (node) => {
					itemRefs.current[at] = node;
				};
			};
			const activeGroupObj = activeGroup === null ? void 0 : state.groups.find((g) => g.id === activeGroup);
			const backCell = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				ref: itemRef(),
				type: "button",
				role: "menuitem",
				className: c.cell,
				onClick: goBack,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutline14, { className: c.back }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: c.cellLabel,
					children: t("menu.back")
				})]
			});
			const providersPane = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				backCell,
				reasoning !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					ref: itemRef(),
					type: "button",
					role: "menuitem",
					className: c.cell,
					onClick: () => setPane("effort"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: c.cellLabel,
							children: t("menu.effort")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: c.cellValue,
							children: effortLabel
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { className: c.cellChevron })
					]
				}),
				state.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: c.status,
					children: t("status.loading")
				}),
				state.error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: c.error,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("error.action", { message: state.error }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: c.retry,
						onClick: reload,
						children: t("action.reload")
					})]
				}),
				state.failures.map((failure) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: c.warning,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("warning.groupLoad", {
						name: failure.name,
						message: failure.message
					}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: c.retry,
						onClick: reload,
						children: t("action.reload")
					})]
				}, failure.id)),
				state.groups.length === 0 && state.status === "ready" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: c.empty,
					children: t("empty.providers")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: clsx(c.groups, "scrollable"),
					children: state.groups.map((group) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						ref: itemRef(),
						type: "button",
						role: "menuitem",
						className: c.cell,
						onClick: () => {
							setActiveGroup(group.id);
							setPane("model");
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: c.cellLabel,
							children: group.name
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { className: c.cellChevron })]
					}, group.id))
				})
			] });
			const modelPane = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				backCell,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: c.header,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: c.headerName,
						children: activeGroupObj ? t("menu.models", { name: activeGroupObj.name }) : ""
					})
				}),
				activeGroupObj && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: clsx(c.groups, "scrollable"),
					children: activeGroupObj.models.map((model) => {
						const selected = state.current && state.current.provider === activeGroupObj.id && state.current.model === model.id;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							ref: itemRef(),
							type: "button",
							role: "menuitemradio",
							"aria-checked": !!selected,
							className: clsx(c.option, selected && c.selected),
							title: model.name,
							disabled: busy,
							onClick: () => choose({
								provider: activeGroupObj.id,
								model: model.id
							}),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: c.optionCopy,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: c.modelName,
									children: model.name
								}), model.description !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: c.description,
									children: model.description
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: c.check,
								children: selected ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {}) : null
							})]
						}, model.id);
					})
				})
			] });
			const effortPane = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [backCell, effortChoices.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: c.empty,
				children: t("empty.efforts")
			}) : effortChoices.map((level) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				ref: itemRef(),
				type: "button",
				role: "menuitemradio",
				"aria-checked": effectiveEffort === level.effort,
				className: clsx(c.option, effectiveEffort === level.effort && c.selected),
				disabled: busy,
				onClick: () => chooseEffort(level.effort),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: c.optionCopy,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: c.modelName,
						children: level.label
					}), level.description !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: c.description,
						children: level.description
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: c.check,
					children: effectiveEffort === level.effort ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {}) : null
				})]
			}, level.key))] });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: c.root,
				onKeyDown: onRootKeyDown,
				onBlur,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: c.triggerRow,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							ref: modelTriggerRef,
							type: "button",
							className: c.trigger,
							"aria-label": t("trigger.selectAria"),
							"aria-haspopup": "menu",
							"aria-expanded": open && pane === "providers",
							"aria-controls": open ? id + "-menu" : void 0,
							title: modelLabel,
							disabled: locked,
							onClick: () => {
								if (open && pane === "providers") close();
								else showProviders();
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: c.triggerLabel,
								children: modelLabel
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: clsx(c.chevron, open && pane === "providers" && c.chevronOpen) })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							ref: effortTriggerRef,
							type: "button",
							className: c.trigger,
							"aria-label": t("menu.effort"),
							"aria-haspopup": "menu",
							"aria-expanded": open && pane === "effort",
							"aria-controls": open ? id + "-menu" : void 0,
							title: effortLabel,
							disabled: locked,
							onClick: () => {
								if (open && pane === "effort") close();
								else showEffort();
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: c.triggerLabel,
								children: effortLabel
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: clsx(c.chevron, open && pane === "effort" && c.chevronOpen) })]
						})]
					}),
					open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						id: id + "-menu",
						className: c.menu,
						role: "menu",
						"aria-label": t("menu.aria"),
						"aria-busy": state.status === "loading" || busy,
						children: [
							pane === "providers" && providersPane,
							pane === "model" && modelPane,
							pane === "effort" && effortPane
						]
					}),
					toast !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
						text: toast.text,
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, {}),
						anchor: rootRef.current ? rootRef.current.closest("[data-composer-card]") : null,
						onDone: () => setToast(null)
					})
				]
			});
		}
		/** Register the model-select override into the composer model seat. */
		function installModelSelect(ctx) {
			const slots = ctx.get("slots");
			const models = ctx.get("modelDirectories");
			const sessions = ctx.get("sessions");
			if (slots === void 0 || models === void 0 || sessions === void 0) return;
			ctx.effect(() => {
				return slots.inject("conversation.input.model", () => slots.register({
					name: "conversation.input.model",
					priority: -1,
					inject: (sessionId) => {
						const directory = models.directoryFor(sessionId);
						const available = sessions.subagentAddress(sessionId) === void 0;
						return {
							available,
							directory: directory.store,
							load: () => {
								if (available) directory.load().catch(() => {});
							},
							select: (selection) => available ? directory.select(selection).then(() => true, () => false) : Promise.resolve(false)
						};
					}
				}, (props) => ModelSelectNested(props)));
			}, "dsh-hub: model-select override");
		}
		//#endregion
		//#region src/client/session-tabs.ts
		/**
		* Session tabs store — ordered list of open session 'tabs' (browser-like),
		* persisted to localStorage. Rendering/placement lives in SessionTabs.
		*/
		const KEY = "dsh-hub:session-tabs";
		/** Legacy dot-separated key — migrated to KEY once (idempotent). */
		const LEGACY_KEY = "dsh-hub.session-tabs";
		const listeners = /* @__PURE__ */ new Set();
		/** Read the persisted tabs, migrating the legacy key on first load. */
		function readStored() {
			try {
				const current = localStorage.getItem(KEY);
				if (current !== null) return current;
				const legacy = localStorage.getItem(LEGACY_KEY);
				if (legacy === null) return null;
				try {
					localStorage.setItem(KEY, legacy);
					localStorage.removeItem(LEGACY_KEY);
				} catch {}
				return legacy;
			} catch {
				return null;
			}
		}
		function load() {
			const raw = readStored();
			if (raw === null) return [];
			try {
				const arr = JSON.parse(raw);
				return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
			} catch {}
			return [];
		}
		let tabs = load();
		function emit() {
			for (const l of listeners) l();
		}
		function save() {
			try {
				localStorage.setItem(KEY, JSON.stringify(tabs));
			} catch {}
		}
		function subscribeTabs(cb) {
			listeners.add(cb);
			return () => {
				listeners.delete(cb);
			};
		}
		function getTabs() {
			return tabs;
		}
		function useTabs() {
			return (0, react.useSyncExternalStore)(subscribeTabs, () => tabs);
		}
		function tabAdd(id) {
			if (id !== "" && !tabs.includes(id)) {
				tabs = [...tabs, id];
				save();
				emit();
			}
		}
		function tabRemove(id) {
			tabs = tabs.filter((x) => x !== id);
			save();
			emit();
		}
		function tabReplaceOrder(ids) {
			tabs = ids.filter((x) => typeof x === "string");
			save();
			emit();
		}
		//#endregion
		//#region src/client/SessionTabs.tsx
		/**
		* SessionTabs — browser-style session tabs rendered INTO the shell titlebar
		* via createPortal (inside #dsh-hub-titlebar .tb-title). Each tab is an open
		* session; click to switch, + to start, x to remove.
		*
		* Functional surface (Cherry Studio-style):
		*  - live status dot: amber = waiting (pendingInteraction), green = done in
		*    background, blue = running;
		*  - right-click context menu (reuses session-menu: fork / archive / copy /
		*    open-in-explorer) plus inline rename;
		*  - drag to reorder (persisted in the tab store);
		*  - auto-scroll the active tab into view when it changes.
		*/
		function useSessionsSnap(ctx) {
			const list = ctx?.sessions?.list;
			const [snap, setSnap] = (0, react.useState)(() => list?.getSnapshot?.() ?? {});
			(0, react.useEffect)(() => {
				if (!list?.subscribe) return;
				const cb = () => setSnap(list.getSnapshot?.() ?? {});
				const off = list.subscribe(cb);
				return () => off?.();
			}, [list]);
			return snap;
		}
		function useWorkspacesSnap(ctx) {
			const list = ctx?.workspaces?.list;
			const [snap, setSnap] = (0, react.useState)(() => list?.getSnapshot?.() ?? {});
			(0, react.useEffect)(() => {
				if (!list?.subscribe) return;
				const cb = () => setSnap(list.getSnapshot?.() ?? {});
				const off = list.subscribe(cb);
				return () => off?.();
			}, [list]);
			return snap;
		}
		const ROOT = {
			display: "flex",
			alignItems: "center",
			gap: 2,
			flex: "1",
			minWidth: 0,
			overflow: "hidden",
			height: "100%",
			boxSizing: "border-box",
			paddingLeft: 6,
			fontFamily: "var(--dsw-font-family, system-ui)",
			fontSize: 12,
			WebkitAppRegion: "no-drag"
		};
		const TAB = {
			display: "inline-flex",
			alignItems: "center",
			gap: 5,
			padding: "0 8px",
			borderRadius: 6,
			cursor: "pointer",
			background: "transparent",
			border: "none",
			color: "var(--dsw-alias-label-tertiary, #9aa7bd)",
			whiteSpace: "nowrap",
			borderBottom: "2px solid transparent",
			flex: "0 1 180px",
			minWidth: 60,
			height: "100%",
			boxSizing: "border-box",
			fontSize: 13,
			transition: "background .12s ease, color .12s ease",
			userSelect: "none"
		};
		const TAB_ACTIVE = {
			...TAB,
			background: "var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.16))",
			color: "var(--dsw-alias-label-primary, #fff)",
			borderBottom: "2px solid var(--dsw-alias-brand-primary, #3964fe)"
		};
		const TAB_DRAGGING = {
			...TAB,
			opacity: .4
		};
		const PLUS = {
			border: "none",
			background: "transparent",
			color: "inherit",
			cursor: "pointer",
			fontSize: 15,
			padding: "0 7px",
			borderRadius: 6,
			flex: "none",
			height: "100%"
		};
		const INLINE_INPUT = {
			border: "1px solid var(--dsw-alias-brand-primary, #3964fe)",
			background: "transparent",
			color: "inherit",
			fontSize: 12,
			padding: "1px 4px",
			borderRadius: 4,
			outline: "none",
			minWidth: 60,
			boxSizing: "border-box"
		};
		function SessionTabs({ ctx }) {
			const tabs = useTabs();
			const snap = useSessionsSnap(ctx);
			const ws = useWorkspacesSnap(ctx);
			const current = snap.current;
			const byId = snap.byId ?? {};
			const archivedIds = ws.archivedSessionIds ?? [];
			const validTabs = tabs.filter((id) => {
				const s = byId[id];
				return s !== void 0 && (s.blank !== true || id === current) && !archivedIds.includes(id);
			});
			const [editingId, setEditingId] = (0, react.useState)(null);
			const [draft, setDraft] = (0, react.useState)("");
			const [dragId, setDragId] = (0, react.useState)(null);
			const barRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (current) tabAdd(current);
			}, [current]);
			(0, react.useEffect)(() => {
				if (Object.keys(byId).length === 0) return;
				const stale = tabs.filter((id) => {
					const s = byId[id];
					return s === void 0 || s.blank === true && id !== current || archivedIds.includes(id);
				});
				if (stale.length === 0) return;
				if (current !== void 0 && stale.includes(current)) {
					const idx = tabs.indexOf(current);
					const next = tabs[idx - 1] ?? tabs[idx + 1];
					if (next !== void 0 && !stale.includes(next)) try {
						ctx?.sessions?.open?.(next);
					} catch {}
				}
				for (const id of stale) tabRemove(id);
			}, [
				tabs,
				byId,
				archivedIds,
				current
			]);
			(0, react.useEffect)(() => {
				if (!current) return;
				(barRef.current?.querySelector(`[data-tab-id="${current}"]`))?.scrollIntoView?.({
					block: "nearest",
					inline: "nearest"
				});
			}, [current, validTabs.length]);
			(0, react.useEffect)(() => {
				if (document.getElementById("mg-tab-status-pulse")) return;
				const tag = document.createElement("style");
				tag.id = "mg-tab-status-pulse";
				tag.textContent = "@keyframes mgTabStatusPulse{0%,100%{opacity:1}50%{opacity:.25}}";
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, []);
			(0, react.useEffect)(() => {
				const clear = () => setDragId(null);
				window.addEventListener("blur", clear);
				return () => window.removeEventListener("blur", clear);
			}, []);
			const [titleEl, setTitleEl] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				let timer = 0;
				const find = () => {
					const el = document.querySelector("#dsh-hub-titlebar .tb-title");
					if (el) {
						setTitleEl(el);
						window.clearInterval(timer);
					}
				};
				find();
				timer = window.setInterval(find, 300);
				return () => window.clearInterval(timer);
			}, []);
			if (!current && validTabs.length === 0) return null;
			if (titleEl === null) return null;
			const titleOf = (id) => {
				const s = byId[id];
				if (s?.blank === true) return "新会话";
				return (s?.displayTitle || s?.title || id).slice(0, 20);
			};
			const open = (id) => {
				if (byId[id] === void 0) return;
				try {
					ctx?.sessions?.open?.(id);
				} catch {}
			};
			const start = () => {
				try {
					ctx?.workspaces?.startSession?.();
				} catch {}
			};
			const beginRename = (id) => {
				setDraft(titleOf(id));
				setEditingId(id);
			};
			const commitRename = (id) => {
				const t = draft.trim();
				setEditingId(null);
				if (t === "" || t === titleOf(id)) return;
				try {
					(ctx?.sessions?.binding?.(id))?.session?.rename?.(t).catch?.(() => {});
				} catch {}
			};
			const cancelRename = () => setEditingId(null);
			const onContextMenu = (id, e) => {
				e.preventDefault();
				e.stopPropagation();
				openSessionMenu({
					x: e.clientX,
					y: e.clientY,
					id,
					title: byId[id]?.displayTitle ?? byId[id]?.title ?? id,
					ctx,
					onRename: () => beginRename(id)
				});
			};
			const onDragStart = (id) => (e) => {
				setDragId(id);
				try {
					e.dataTransfer.setData("text/plain", id);
					e.dataTransfer.effectAllowed = "move";
				} catch {}
			};
			const onDragOver = (id) => (e) => {
				e.preventDefault();
				const from = dragId;
				if (from === null || from === id) return;
				const cur = getTabs();
				const fi = cur.indexOf(from);
				const ti = cur.indexOf(id);
				if (fi === -1 || ti === -1 || fi === ti) return;
				const next = [...cur];
				next.splice(fi, 1);
				next.splice(ti, 0, from);
				tabReplaceOrder(next);
			};
			const onDrop = (e) => {
				e.preventDefault();
				setDragId(null);
			};
			const onDragEnd = () => setDragId(null);
			const statusOf = (s) => {
				if (s?.pendingInteraction) return {
					color: "var(--dsw-alias-state-warn-primary, #f5a623)",
					title: "等待处理/审批"
				};
				if (s?.completed) return {
					color: "var(--dsw-alias-state-success-primary, #2ecc71)",
					title: "后台已完成"
				};
				if (s?.running) return {
					color: "var(--dsw-alias-state-business-primary, #3b82f6)",
					title: "运行中",
					pulse: true
				};
				return null;
			};
			const close = (id) => {
				if (id === current) {
					const idx = validTabs.indexOf(id);
					const next = validTabs[idx - 1] ?? validTabs[idx + 1];
					if (next) open(next);
				}
				tabRemove(id);
			};
			const content = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: barRef,
				style: ROOT,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					style: PLUS,
					title: "新建会话",
					onClick: start,
					children: "+"
				}), validTabs.map((id) => {
					const s = byId[id];
					const active = id === current;
					const st = statusOf(s);
					const editing = editingId === id;
					const tabStyle = dragId === id ? TAB_DRAGGING : active ? TAB_ACTIVE : TAB;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-tab-id": id,
						role: "tab",
						"aria-selected": active,
						draggable: true,
						title: s?.title ?? id,
						style: tabStyle,
						onClick: () => {
							if (!editing) open(id);
						},
						onContextMenu: (e) => onContextMenu(id, e),
						onDragStart: onDragStart(id),
						onDragOver: onDragOver(id),
						onDrop,
						onDragEnd,
						children: [
							st !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: {
									width: 7,
									height: 7,
									borderRadius: "50%",
									background: st.color,
									flex: "none",
									display: "inline-block",
									...st.pulse ? { animation: "mgTabStatusPulse 1.1s ease-in-out infinite" } : {}
								},
								title: st.title
							}),
							editing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								autoFocus: true,
								value: draft,
								onChange: (e) => setDraft(e.target.value),
								onBlur: () => commitRename(id),
								onKeyDown: (e) => {
									if (e.nativeEvent.isComposing) return;
									if (e.key === "Enter") commitRename(id);
									else if (e.key === "Escape") cancelRename();
								},
								onClick: (e) => e.stopPropagation(),
								style: {
									...INLINE_INPUT,
									width: Math.max(80, draft.length * (draft.length && /[\u4e00-\u9fff]/.test(draft) ? 12 : 7) + 22)
								}
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: {
									flex: "1",
									textAlign: "center",
									overflow: "hidden",
									textOverflow: "ellipsis",
									minWidth: 0
								},
								children: titleOf(id)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								role: "button",
								"aria-label": "关闭标签",
								title: "关闭标签",
								style: {
									color: "var(--dsw-alias-label-tertiary, #888)",
									padding: "0 3px",
									borderRadius: 4,
									cursor: "pointer",
									lineHeight: "14px",
									flex: "none"
								},
								onClick: (e) => {
									e.stopPropagation();
									close(id);
								},
								children: "×"
							})
						]
					}, id);
				})]
			});
			return (0, react_dom.createPortal)(content, titleEl);
		}
		//#endregion
		//#region src/client/xterm-css.ts
		var import_xterm = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
			(function(e, t) {
				if ("object" == typeof exports && "object" == typeof module) module.exports = t();
				else if ("function" == typeof define && define.amd) define([], t);
				else {
					var i = t();
					for (var s in i) ("object" == typeof exports ? exports : e)[s] = i[s];
				}
			})(globalThis, (() => (() => {
				"use strict";
				var e = {
					2840: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.AccessibilityManager = void 0;
						const n = i(7721), o = i(4292), a = i(7150), l = i(7098), h = i(6501), c = i(7093);
						let d = class extends a.Disposable {
							constructor(e, t, i, s) {
								super(), this._terminal = e, this._coreBrowserService = i, this._renderService = s, this._rowColumns = /* @__PURE__ */ new WeakMap(), this._liveRegionLineCount = 0, this._charsToConsume = [], this._charsToAnnounce = "";
								const r = this._coreBrowserService.mainDocument;
								this._accessibilityContainer = r.createElement("div"), this._accessibilityContainer.classList.add("xterm-accessibility"), this._rowContainer = r.createElement("div"), this._rowContainer.setAttribute("role", "list"), this._rowContainer.classList.add("xterm-accessibility-tree"), this._rowElements = [];
								for (let e = 0; e < this._terminal.rows; e++) this._rowElements[e] = this._createAccessibilityTreeNode(), this._rowContainer.appendChild(this._rowElements[e]);
								if (this._topBoundaryFocusListener = (e) => this._handleBoundaryFocus(e, 0), this._bottomBoundaryFocusListener = (e) => this._handleBoundaryFocus(e, 1), this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener), this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._accessibilityContainer.appendChild(this._rowContainer), this._liveRegion = r.createElement("div"), this._liveRegion.classList.add("live-region"), this._liveRegion.setAttribute("aria-live", "assertive"), this._accessibilityContainer.appendChild(this._liveRegion), this._liveRegionDebouncer = this._register(new o.TimeBasedDebouncer(this._renderRows.bind(this))), !this._terminal.element) throw new Error("Cannot enable accessibility before Terminal.open");
								this._terminal.element.insertAdjacentElement("afterbegin", this._accessibilityContainer), this._register(this._terminal.onResize(((e) => this._handleResize(e.rows)))), this._register(this._terminal.onRender(((e) => this._refreshRows(e.start, e.end)))), this._register(this._terminal.onScroll((() => this._refreshRows()))), this._register(this._terminal.onA11yChar(((e) => this._handleChar(e)))), this._register(this._terminal.onLineFeed((() => this._handleChar("\n")))), this._register(this._terminal.onA11yTab(((e) => this._handleTab(e)))), this._register(this._terminal.onKey(((e) => this._handleKey(e.key)))), this._register(this._terminal.onBlur((() => this._clearLiveRegion()))), this._register(this._renderService.onDimensionsChange((() => this._refreshRowsDimensions()))), this._register((0, c.addDisposableListener)(r, "selectionchange", (() => this._handleSelectionChange()))), this._register(this._coreBrowserService.onDprChange((() => this._refreshRowsDimensions()))), this._refreshRowsDimensions(), this._refreshRows(), this._register((0, a.toDisposable)((() => {
									this._accessibilityContainer.remove(), this._rowElements.length = 0;
								})));
							}
							_handleTab(e) {
								for (let t = 0; t < e; t++) this._handleChar(" ");
							}
							_handleChar(e) {
								this._liveRegionLineCount < 21 && (this._charsToConsume.length > 0 ? this._charsToConsume.shift() !== e && (this._charsToAnnounce += e) : this._charsToAnnounce += e, "\n" === e && (this._liveRegionLineCount++, 21 === this._liveRegionLineCount && (this._liveRegion.textContent += n.tooMuchOutput.get())));
							}
							_clearLiveRegion() {
								this._liveRegion.textContent = "", this._liveRegionLineCount = 0;
							}
							_handleKey(e) {
								this._clearLiveRegion(), /\p{Control}/u.test(e) || this._charsToConsume.push(e);
							}
							_refreshRows(e, t) {
								this._liveRegionDebouncer.refresh(e, t, this._terminal.rows);
							}
							_renderRows(e, t) {
								const i = this._terminal.buffer, s = i.lines.length.toString();
								for (let r = e; r <= t; r++) {
									const e = i.lines.get(i.ydisp + r), t = [], n = e?.translateToString(!0, void 0, void 0, t) || "", o = (i.ydisp + r + 1).toString(), a = this._rowElements[r];
									a && (0 === n.length ? (a.textContent = "\xA0", this._rowColumns.set(a, [0, 1])) : (a.textContent = n, this._rowColumns.set(a, t)), a.setAttribute("aria-posinset", o), a.setAttribute("aria-setsize", s), this._alignRowWidth(a));
								}
								this._announceCharacters();
							}
							_announceCharacters() {
								0 !== this._charsToAnnounce.length && (this._liveRegion.textContent += this._charsToAnnounce, this._charsToAnnounce = "");
							}
							_handleBoundaryFocus(e, t) {
								const i = e.target, s = this._rowElements[0 === t ? 1 : this._rowElements.length - 2];
								if (i.getAttribute("aria-posinset") === (0 === t ? "1" : `${this._terminal.buffer.lines.length}`)) return;
								if (e.relatedTarget !== s) return;
								let r, n;
								if (0 === t ? (r = i, n = this._rowElements.pop(), this._rowContainer.removeChild(n)) : (r = this._rowElements.shift(), n = i, this._rowContainer.removeChild(r)), r.removeEventListener("focus", this._topBoundaryFocusListener), n.removeEventListener("focus", this._bottomBoundaryFocusListener), 0 === t) {
									const e = this._createAccessibilityTreeNode();
									this._rowElements.unshift(e), this._rowContainer.insertAdjacentElement("afterbegin", e);
								} else {
									const e = this._createAccessibilityTreeNode();
									this._rowElements.push(e), this._rowContainer.appendChild(e);
								}
								this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener), this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._terminal.scrollLines(0 === t ? -1 : 1), this._rowElements[0 === t ? 1 : this._rowElements.length - 2].focus(), e.preventDefault(), e.stopImmediatePropagation();
							}
							_handleSelectionChange() {
								if (0 === this._rowElements.length) return;
								const e = this._coreBrowserService.mainDocument.getSelection();
								if (!e) return;
								if (e.isCollapsed) return void (this._rowContainer.contains(e.anchorNode) && this._terminal.clearSelection());
								if (!e.anchorNode || !e.focusNode) return void console.error("anchorNode and/or focusNode are null");
								let t = {
									node: e.anchorNode,
									offset: e.anchorOffset
								}, i = {
									node: e.focusNode,
									offset: e.focusOffset
								};
								if ((t.node.compareDocumentPosition(i.node) & Node.DOCUMENT_POSITION_PRECEDING || t.node === i.node && t.offset > i.offset) && ([t, i] = [i, t]), t.node.compareDocumentPosition(this._rowElements[0]) & (Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING) && (t = {
									node: this._rowElements[0].childNodes[0],
									offset: 0
								}), !this._rowContainer.contains(t.node)) return;
								const s = this._rowElements.slice(-1)[0];
								if (i.node.compareDocumentPosition(s) & (Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_PRECEDING) && (i = {
									node: s,
									offset: s.textContent?.length ?? 0
								}), !this._rowContainer.contains(i.node)) return;
								const r = ({ node: e, offset: t }) => {
									const i = e instanceof Text ? e.parentNode : e;
									let s = parseInt(i?.getAttribute("aria-posinset"), 10) - 1;
									if (isNaN(s)) return console.warn("row is invalid. Race condition?"), null;
									const r = this._rowColumns.get(i);
									if (!r) return console.warn("columns is null. Race condition?"), null;
									let n = t < r.length ? r[t] : r.slice(-1)[0] + 1;
									return n >= this._terminal.cols && (++s, n = 0), {
										row: s,
										column: n
									};
								}, n = r(t), o = r(i);
								if (n && o) {
									if (n.row > o.row || n.row === o.row && n.column >= o.column) throw new Error("invalid range");
									this._terminal.select(n.column, n.row, (o.row - n.row) * this._terminal.cols - n.column + o.column);
								}
							}
							_handleResize(e) {
								this._rowElements[this._rowElements.length - 1].removeEventListener("focus", this._bottomBoundaryFocusListener);
								for (let e = this._rowContainer.children.length; e < this._terminal.rows; e++) this._rowElements[e] = this._createAccessibilityTreeNode(), this._rowContainer.appendChild(this._rowElements[e]);
								for (; this._rowElements.length > e;) this._rowContainer.removeChild(this._rowElements.pop());
								this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._refreshRowsDimensions();
							}
							_createAccessibilityTreeNode() {
								const e = this._coreBrowserService.mainDocument.createElement("div");
								return e.setAttribute("role", "listitem"), e.tabIndex = -1, this._refreshRowDimensions(e), e;
							}
							_refreshRowsDimensions() {
								if (this._renderService.dimensions.css.cell.height) {
									Object.assign(this._accessibilityContainer.style, {
										width: `${this._renderService.dimensions.css.canvas.width}px`,
										fontSize: `${this._terminal.options.fontSize}px`
									}), this._rowElements.length !== this._terminal.rows && this._handleResize(this._terminal.rows);
									for (let e = 0; e < this._terminal.rows; e++) this._refreshRowDimensions(this._rowElements[e]), this._alignRowWidth(this._rowElements[e]);
								}
							}
							_refreshRowDimensions(e) {
								e.style.height = `${this._renderService.dimensions.css.cell.height}px`;
							}
							_alignRowWidth(e) {
								e.style.transform = "";
								const t = e.getBoundingClientRect().width, i = this._rowColumns.get(e)?.slice(-1)?.[0];
								if (!i) return;
								const s = i * this._renderService.dimensions.css.cell.width;
								e.style.transform = `scaleX(${s / t})`;
							}
						};
						t.AccessibilityManager = d, t.AccessibilityManager = d = s([
							r(1, h.IInstantiationService),
							r(2, l.ICoreBrowserService),
							r(3, l.IRenderService)
						], d);
					},
					7861: (e, t) => {
						function i(e) {
							return e.replace(/\r?\n/g, "\r");
						}
						function s(e, t) {
							return t ? "\x1B[200~" + e + "\x1B[201~" : e;
						}
						function r(e, t, r, n) {
							e = s(e = i(e), r.decPrivateModes.bracketedPasteMode && !0 !== n.rawOptions.ignoreBracketedPasteMode), r.triggerDataEvent(e, !0), t.value = "";
						}
						function n(e, t, i) {
							const s = i.getBoundingClientRect(), r = e.clientX - s.left - 10, n = e.clientY - s.top - 10;
							t.style.width = "20px", t.style.height = "20px", t.style.left = `${r}px`, t.style.top = `${n}px`, t.style.zIndex = "1000", t.focus();
						}
						Object.defineProperty(t, "__esModule", { value: !0 }), t.prepareTextForTerminal = i, t.bracketTextForPaste = s, t.copyHandler = function(e, t) {
							e.clipboardData && e.clipboardData.setData("text/plain", t.selectionText), e.preventDefault();
						}, t.handlePasteEvent = function(e, t, i, s) {
							e.stopPropagation(), e.clipboardData && r(e.clipboardData.getData("text/plain"), t, i, s);
						}, t.paste = r, t.moveTextAreaUnderMouseCursor = n, t.rightClickHandler = function(e, t, i, s, r) {
							n(e, t, i), r && s.rightClickSelect(e), t.value = s.selectionText, t.select();
						};
					},
					7174: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.ColorContrastCache = void 0;
						const s = i(7710);
						t.ColorContrastCache = class {
							constructor() {
								this._color = new s.TwoKeyMap(), this._css = new s.TwoKeyMap();
							}
							setCss(e, t, i) {
								this._css.set(e, t, i);
							}
							getCss(e, t) {
								return this._css.get(e, t);
							}
							setColor(e, t, i) {
								this._color.set(e, t, i);
							}
							getColor(e, t) {
								return this._color.get(e, t);
							}
							clear() {
								this._color.clear(), this._css.clear();
							}
						};
					},
					1718: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.CoreBrowserTerminal = void 0;
						const s = i(7861), r = i(7721), n = i(3285), o = i(4017), a = i(4196), l = i(9925), h = i(3618), c = i(3955), d = i(4792), u = i(945), _ = i(9574), f = i(9820), p = i(9784), g = i(5783), m = i(2079), v = i(7098), S = i(9078), b = i(4103), C = i(5777), y = i(701), w = i(6107), E = i(3534), D = i(706), L = i(8693), R = i(4720), A = i(6501), T = i(2486), k = i(2840), M = i(8906), O = i(802), I = i(7093), P = i(7150);
						class x extends C.CoreTerminal {
							get linkifier() {
								return this._linkifier.value;
							}
							get onFocus() {
								return this._onFocus.event;
							}
							get onBlur() {
								return this._onBlur.event;
							}
							get onA11yChar() {
								return this._onA11yCharEmitter.event;
							}
							get onA11yTab() {
								return this._onA11yTabEmitter.event;
							}
							get onWillOpen() {
								return this._onWillOpen.event;
							}
							constructor(e = {}) {
								super(e), this._linkifier = this._register(new P.MutableDisposable()), this.browser = y, this._keyDownHandled = !1, this._keyDownSeen = !1, this._keyPressHandled = !1, this._unprocessedDeadKey = !1, this._accessibilityManager = this._register(new P.MutableDisposable()), this._onCursorMove = this._register(new O.Emitter()), this.onCursorMove = this._onCursorMove.event, this._onKey = this._register(new O.Emitter()), this.onKey = this._onKey.event, this._onRender = this._register(new O.Emitter()), this.onRender = this._onRender.event, this._onSelectionChange = this._register(new O.Emitter()), this.onSelectionChange = this._onSelectionChange.event, this._onTitleChange = this._register(new O.Emitter()), this.onTitleChange = this._onTitleChange.event, this._onBell = this._register(new O.Emitter()), this.onBell = this._onBell.event, this._onFocus = this._register(new O.Emitter()), this._onBlur = this._register(new O.Emitter()), this._onA11yCharEmitter = this._register(new O.Emitter()), this._onA11yTabEmitter = this._register(new O.Emitter()), this._onWillOpen = this._register(new O.Emitter()), this._setup(), this._decorationService = this._instantiationService.createInstance(R.DecorationService), this._instantiationService.setService(A.IDecorationService, this._decorationService), this._linkProviderService = this._instantiationService.createInstance(f.LinkProviderService), this._instantiationService.setService(v.ILinkProviderService, this._linkProviderService), this._linkProviderService.registerLinkProvider(this._instantiationService.createInstance(n.OscLinkProvider)), this._register(this._inputHandler.onRequestBell((() => this._onBell.fire()))), this._register(this._inputHandler.onRequestRefreshRows(((e) => this.refresh(e?.start ?? 0, e?.end ?? this.rows - 1)))), this._register(this._inputHandler.onRequestSendFocus((() => this._reportFocus()))), this._register(this._inputHandler.onRequestReset((() => this.reset()))), this._register(this._inputHandler.onRequestWindowsOptionsReport(((e) => this._reportWindowsOptions(e)))), this._register(this._inputHandler.onColor(((e) => this._handleColorEvent(e)))), this._register(O.Event.forward(this._inputHandler.onCursorMove, this._onCursorMove)), this._register(O.Event.forward(this._inputHandler.onTitleChange, this._onTitleChange)), this._register(O.Event.forward(this._inputHandler.onA11yChar, this._onA11yCharEmitter)), this._register(O.Event.forward(this._inputHandler.onA11yTab, this._onA11yTabEmitter)), this._register(this._bufferService.onResize(((e) => this._afterResize(e.cols, e.rows)))), this._register((0, P.toDisposable)((() => {
									this._customKeyEventHandler = void 0, this.element?.parentNode?.removeChild(this.element);
								})));
							}
							_handleColorEvent(e) {
								if (this._themeService) for (const t of e) {
									let e, i = "";
									switch (t.index) {
										case 256:
											e = "foreground", i = "10";
											break;
										case 257:
											e = "background", i = "11";
											break;
										case 258:
											e = "cursor", i = "12";
											break;
										default: e = "ansi", i = "4;" + t.index;
									}
									switch (t.type) {
										case 0:
											const s = b.color.toColorRGB("ansi" === e ? this._themeService.colors.ansi[t.index] : this._themeService.colors[e]);
											this.coreService.triggerDataEvent(`${E.C0.ESC}]${i};${(0, L.toRgbString)(s)}${E.C1_ESCAPED.ST}`);
											break;
										case 1:
											if ("ansi" === e) this._themeService.modifyColors(((e) => e.ansi[t.index] = b.channels.toColor(...t.color)));
											else {
												const i = e;
												this._themeService.modifyColors(((e) => e[i] = b.channels.toColor(...t.color)));
											}
											break;
										case 2: this._themeService.restoreColor(t.index);
									}
								}
							}
							_setup() {
								super._setup(), this._customKeyEventHandler = void 0;
							}
							get buffer() {
								return this.buffers.active;
							}
							focus() {
								this.textarea && this.textarea.focus({ preventScroll: !0 });
							}
							_handleScreenReaderModeOptionChange(e) {
								e ? !this._accessibilityManager.value && this._renderService && (this._accessibilityManager.value = this._instantiationService.createInstance(k.AccessibilityManager, this)) : this._accessibilityManager.clear();
							}
							_handleTextAreaFocus(e) {
								this.coreService.decPrivateModes.sendFocus && this.coreService.triggerDataEvent(E.C0.ESC + "[I"), this.element.classList.add("focus"), this._showCursor(), this._onFocus.fire();
							}
							blur() {
								return this.textarea?.blur();
							}
							_handleTextAreaBlur() {
								this.textarea.value = "", this.refresh(this.buffer.y, this.buffer.y), this.coreService.decPrivateModes.sendFocus && this.coreService.triggerDataEvent(E.C0.ESC + "[O"), this.element.classList.remove("focus"), this._onBlur.fire();
							}
							_syncTextArea() {
								if (!this.textarea || !this.buffer.isCursorInViewport || this._compositionHelper.isComposing || !this._renderService) return;
								const e = this.buffer.ybase + this.buffer.y, t = this.buffer.lines.get(e);
								if (!t) return;
								const i = Math.min(this.buffer.x, this.cols - 1), s = this._renderService.dimensions.css.cell.height, r = t.getWidth(i), n = this._renderService.dimensions.css.cell.width * r, o = this.buffer.y * this._renderService.dimensions.css.cell.height, a = i * this._renderService.dimensions.css.cell.width;
								this.textarea.style.left = a + "px", this.textarea.style.top = o + "px", this.textarea.style.width = n + "px", this.textarea.style.height = s + "px", this.textarea.style.lineHeight = s + "px", this.textarea.style.zIndex = "-5";
							}
							_initGlobal() {
								this._bindKeys(), this._register((0, I.addDisposableListener)(this.element, "copy", ((e) => {
									this.hasSelection() && (0, s.copyHandler)(e, this._selectionService);
								})));
								const e = (e) => (0, s.handlePasteEvent)(e, this.textarea, this.coreService, this.optionsService);
								this._register((0, I.addDisposableListener)(this.textarea, "paste", e)), this._register((0, I.addDisposableListener)(this.element, "paste", e)), y.isFirefox ? this._register((0, I.addDisposableListener)(this.element, "mousedown", ((e) => {
									2 === e.button && (0, s.rightClickHandler)(e, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
								}))) : this._register((0, I.addDisposableListener)(this.element, "contextmenu", ((e) => {
									(0, s.rightClickHandler)(e, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
								}))), y.isLinux && this._register((0, I.addDisposableListener)(this.element, "auxclick", ((e) => {
									1 === e.button && (0, s.moveTextAreaUnderMouseCursor)(e, this.textarea, this.screenElement);
								})));
							}
							_bindKeys() {
								this._register((0, I.addDisposableListener)(this.textarea, "keyup", ((e) => this._keyUp(e)), !0)), this._register((0, I.addDisposableListener)(this.textarea, "keydown", ((e) => this._keyDown(e)), !0)), this._register((0, I.addDisposableListener)(this.textarea, "keypress", ((e) => this._keyPress(e)), !0)), this._register((0, I.addDisposableListener)(this.textarea, "compositionstart", (() => this._compositionHelper.compositionstart()))), this._register((0, I.addDisposableListener)(this.textarea, "compositionupdate", ((e) => this._compositionHelper.compositionupdate(e)))), this._register((0, I.addDisposableListener)(this.textarea, "compositionend", (() => this._compositionHelper.compositionend()))), this._register((0, I.addDisposableListener)(this.textarea, "input", ((e) => this._inputEvent(e)), !0)), this._register(this.onRender((() => this._compositionHelper.updateCompositionElements())));
							}
							open(e) {
								if (!e) throw new Error("Terminal requires a parent element.");
								if (e.isConnected || this._logService.debug("Terminal.open was called on an element that was not attached to the DOM"), this.element?.ownerDocument.defaultView && this._coreBrowserService) return void (this.element.ownerDocument.defaultView !== this._coreBrowserService.window && (this._coreBrowserService.window = this.element.ownerDocument.defaultView));
								this._document = e.ownerDocument, this.options.documentOverride && this.options.documentOverride instanceof Document && (this._document = this.optionsService.rawOptions.documentOverride), this.element = this._document.createElement("div"), this.element.dir = "ltr", this.element.classList.add("terminal"), this.element.classList.add("xterm"), e.appendChild(this.element);
								const t = this._document.createDocumentFragment();
								this._viewportElement = this._document.createElement("div"), this._viewportElement.classList.add("xterm-viewport"), t.appendChild(this._viewportElement), this.screenElement = this._document.createElement("div"), this.screenElement.classList.add("xterm-screen"), this._register((0, I.addDisposableListener)(this.screenElement, "mousemove", ((e) => this.updateCursorStyle(e)))), this._helperContainer = this._document.createElement("div"), this._helperContainer.classList.add("xterm-helpers"), this.screenElement.appendChild(this._helperContainer), t.appendChild(this.screenElement);
								const i = this.textarea = this._document.createElement("textarea");
								this.textarea.classList.add("xterm-helper-textarea"), this.textarea.setAttribute("aria-label", r.promptLabel.get()), y.isChromeOS || this.textarea.setAttribute("aria-multiline", "false"), this.textarea.setAttribute("autocorrect", "off"), this.textarea.setAttribute("autocapitalize", "off"), this.textarea.setAttribute("spellcheck", "false"), this.textarea.tabIndex = 0, this._register(this.optionsService.onSpecificOptionChange("disableStdin", (() => i.readOnly = this.optionsService.rawOptions.disableStdin))), this.textarea.readOnly = this.optionsService.rawOptions.disableStdin, this._coreBrowserService = this._register(this._instantiationService.createInstance(_.CoreBrowserService, this.textarea, e.ownerDocument.defaultView ?? window, this._document ?? "undefined" != typeof window ? window.document : null)), this._instantiationService.setService(v.ICoreBrowserService, this._coreBrowserService), this._register((0, I.addDisposableListener)(this.textarea, "focus", ((e) => this._handleTextAreaFocus(e)))), this._register((0, I.addDisposableListener)(this.textarea, "blur", (() => this._handleTextAreaBlur()))), this._helperContainer.appendChild(this.textarea), this._charSizeService = this._instantiationService.createInstance(d.CharSizeService, this._document, this._helperContainer), this._instantiationService.setService(v.ICharSizeService, this._charSizeService), this._themeService = this._instantiationService.createInstance(S.ThemeService), this._instantiationService.setService(v.IThemeService, this._themeService), this._characterJoinerService = this._instantiationService.createInstance(u.CharacterJoinerService), this._instantiationService.setService(v.ICharacterJoinerService, this._characterJoinerService), this._renderService = this._register(this._instantiationService.createInstance(g.RenderService, this.rows, this.screenElement)), this._instantiationService.setService(v.IRenderService, this._renderService), this._register(this._renderService.onRenderedViewportChange(((e) => this._onRender.fire(e)))), this.onResize(((e) => this._renderService.resize(e.cols, e.rows))), this._compositionView = this._document.createElement("div"), this._compositionView.classList.add("composition-view"), this._compositionHelper = this._instantiationService.createInstance(h.CompositionHelper, this.textarea, this._compositionView), this._helperContainer.appendChild(this._compositionView), this._mouseService = this._instantiationService.createInstance(p.MouseService), this._instantiationService.setService(v.IMouseService, this._mouseService);
								const s = this._linkifier.value = this._register(this._instantiationService.createInstance(M.Linkifier, this.screenElement));
								this.element.appendChild(t);
								try {
									this._onWillOpen.fire(this.element);
								} catch {}
								this._renderService.hasRenderer() || this._renderService.setRenderer(this._createRenderer()), this._register(this.onCursorMove((() => {
									this._renderService.handleCursorMove(), this._syncTextArea();
								}))), this._register(this.onResize((() => this._renderService.handleResize(this.cols, this.rows)))), this._register(this.onBlur((() => this._renderService.handleBlur()))), this._register(this.onFocus((() => this._renderService.handleFocus()))), this._viewport = this._register(this._instantiationService.createInstance(o.Viewport, this.element, this.screenElement)), this._register(this._viewport.onRequestScrollLines(((e) => {
									super.scrollLines(e, !1), this.refresh(0, this.rows - 1);
								}))), this._selectionService = this._register(this._instantiationService.createInstance(m.SelectionService, this.element, this.screenElement, s)), this._instantiationService.setService(v.ISelectionService, this._selectionService), this._register(this._selectionService.onRequestScrollLines(((e) => this.scrollLines(e.amount, e.suppressScrollEvent)))), this._register(this._selectionService.onSelectionChange((() => this._onSelectionChange.fire()))), this._register(this._selectionService.onRequestRedraw(((e) => this._renderService.handleSelectionChanged(e.start, e.end, e.columnSelectMode)))), this._register(this._selectionService.onLinuxMouseSelection(((e) => {
									this.textarea.value = e, this.textarea.focus(), this.textarea.select();
								}))), this._register(O.Event.any(this._onScroll.event, this._inputHandler.onScroll)((() => {
									this._selectionService.refresh(), this._viewport?.queueSync();
								}))), this._register(this._instantiationService.createInstance(a.BufferDecorationRenderer, this.screenElement)), this._register((0, I.addDisposableListener)(this.element, "mousedown", ((e) => this._selectionService.handleMouseDown(e)))), this.coreMouseService.areMouseEventsActive ? (this._selectionService.disable(), this.element.classList.add("enable-mouse-events")) : this._selectionService.enable(), this.options.screenReaderMode && (this._accessibilityManager.value = this._instantiationService.createInstance(k.AccessibilityManager, this)), this._register(this.optionsService.onSpecificOptionChange("screenReaderMode", ((e) => this._handleScreenReaderModeOptionChange(e)))), this.options.overviewRuler.width && (this._overviewRulerRenderer = this._register(this._instantiationService.createInstance(l.OverviewRulerRenderer, this._viewportElement, this.screenElement))), this.optionsService.onSpecificOptionChange("overviewRuler", ((e) => {
									!this._overviewRulerRenderer && e && this._viewportElement && this.screenElement && (this._overviewRulerRenderer = this._register(this._instantiationService.createInstance(l.OverviewRulerRenderer, this._viewportElement, this.screenElement)));
								})), this._charSizeService.measure(), this.refresh(0, this.rows - 1), this._initGlobal(), this.bindMouse();
							}
							_createRenderer() {
								return this._instantiationService.createInstance(c.DomRenderer, this, this._document, this.element, this.screenElement, this._viewportElement, this._helperContainer, this.linkifier);
							}
							bindMouse() {
								const e = this, t = this.element;
								function i(t) {
									const i = e._mouseService.getMouseReportCoords(t, e.screenElement);
									if (!i) return !1;
									let s, r;
									switch (t.overrideType || t.type) {
										case "mousemove":
											r = 32, void 0 === t.buttons ? (s = 3, void 0 !== t.button && (s = t.button < 3 ? t.button : 3)) : s = 1 & t.buttons ? 0 : 4 & t.buttons ? 1 : 2 & t.buttons ? 2 : 3;
											break;
										case "mouseup":
											r = 0, s = t.button < 3 ? t.button : 3;
											break;
										case "mousedown":
											r = 1, s = t.button < 3 ? t.button : 3;
											break;
										case "wheel":
											if (e._customWheelEventHandler && !1 === e._customWheelEventHandler(t)) return !1;
											const i = t.deltaY;
											if (0 === i) return !1;
											if (0 === e.coreMouseService.consumeWheelEvent(t, e._renderService?.dimensions?.device?.cell?.height, e._coreBrowserService?.dpr)) return !1;
											r = i < 0 ? 0 : 1, s = 4;
											break;
										default: return !1;
									}
									return !(void 0 === r || void 0 === s || s > 4) && e.coreMouseService.triggerMouseEvent({
										col: i.col,
										row: i.row,
										x: i.x,
										y: i.y,
										button: s,
										action: r,
										ctrl: t.ctrlKey,
										alt: t.altKey,
										shift: t.shiftKey
									});
								}
								const s = {
									mouseup: null,
									wheel: null,
									mousedrag: null,
									mousemove: null
								}, r = {
									mouseup: (e) => (i(e), e.buttons || (this._document.removeEventListener("mouseup", s.mouseup), s.mousedrag && this._document.removeEventListener("mousemove", s.mousedrag)), this.cancel(e)),
									wheel: (e) => (i(e), this.cancel(e, !0)),
									mousedrag: (e) => {
										e.buttons && i(e);
									},
									mousemove: (e) => {
										e.buttons || i(e);
									}
								};
								this._register(this.coreMouseService.onProtocolChange(((e) => {
									e ? ("debug" === this.optionsService.rawOptions.logLevel && this._logService.debug("Binding to mouse events:", this.coreMouseService.explainEvents(e)), this.element.classList.add("enable-mouse-events"), this._selectionService.disable()) : (this._logService.debug("Unbinding from mouse events."), this.element.classList.remove("enable-mouse-events"), this._selectionService.enable()), 8 & e ? s.mousemove || (t.addEventListener("mousemove", r.mousemove), s.mousemove = r.mousemove) : (t.removeEventListener("mousemove", s.mousemove), s.mousemove = null), 16 & e ? s.wheel || (t.addEventListener("wheel", r.wheel, { passive: !1 }), s.wheel = r.wheel) : (t.removeEventListener("wheel", s.wheel), s.wheel = null), 2 & e ? s.mouseup || (s.mouseup = r.mouseup) : (this._document.removeEventListener("mouseup", s.mouseup), s.mouseup = null), 4 & e ? s.mousedrag || (s.mousedrag = r.mousedrag) : (this._document.removeEventListener("mousemove", s.mousedrag), s.mousedrag = null);
								}))), this.coreMouseService.activeProtocol = this.coreMouseService.activeProtocol, this._register((0, I.addDisposableListener)(t, "mousedown", ((e) => {
									if (e.preventDefault(), this.focus(), this.coreMouseService.areMouseEventsActive && !this._selectionService.shouldForceSelection(e)) return i(e), s.mouseup && this._document.addEventListener("mouseup", s.mouseup), s.mousedrag && this._document.addEventListener("mousemove", s.mousedrag), this.cancel(e);
								}))), this._register((0, I.addDisposableListener)(t, "wheel", ((t) => {
									if (!s.wheel) {
										if (this._customWheelEventHandler && !1 === this._customWheelEventHandler(t)) return !1;
										if (!this.buffer.hasScrollback) {
											if (0 === t.deltaY) return !1;
											if (0 === e.coreMouseService.consumeWheelEvent(t, e._renderService?.dimensions?.device?.cell?.height, e._coreBrowserService?.dpr)) return this.cancel(t, !0);
											const i = E.C0.ESC + (this.coreService.decPrivateModes.applicationCursorKeys ? "O" : "[") + (t.deltaY < 0 ? "A" : "B");
											return this.coreService.triggerDataEvent(i, !0), this.cancel(t, !0);
										}
									}
								}), { passive: !1 }));
							}
							refresh(e, t) {
								this._renderService?.refreshRows(e, t);
							}
							updateCursorStyle(e) {
								this._selectionService?.shouldColumnSelect(e) ? this.element.classList.add("column-select") : this.element.classList.remove("column-select");
							}
							_showCursor() {
								this.coreService.isCursorInitialized || (this.coreService.isCursorInitialized = !0, this.refresh(this.buffer.y, this.buffer.y));
							}
							scrollLines(e, t) {
								this._viewport ? this._viewport.scrollLines(e) : super.scrollLines(e, t), this.refresh(0, this.rows - 1);
							}
							scrollPages(e) {
								this.scrollLines(e * (this.rows - 1));
							}
							scrollToTop() {
								this.scrollLines(-this._bufferService.buffer.ydisp);
							}
							scrollToBottom(e) {
								e && this._viewport ? this._viewport.scrollToLine(this.buffer.ybase, !0) : this.scrollLines(this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
							}
							scrollToLine(e) {
								const t = e - this._bufferService.buffer.ydisp;
								0 !== t && this.scrollLines(t);
							}
							paste(e) {
								(0, s.paste)(e, this.textarea, this.coreService, this.optionsService);
							}
							attachCustomKeyEventHandler(e) {
								this._customKeyEventHandler = e;
							}
							attachCustomWheelEventHandler(e) {
								this._customWheelEventHandler = e;
							}
							registerLinkProvider(e) {
								return this._linkProviderService.registerLinkProvider(e);
							}
							registerCharacterJoiner(e) {
								if (!this._characterJoinerService) throw new Error("Terminal must be opened first");
								const t = this._characterJoinerService.register(e);
								return this.refresh(0, this.rows - 1), t;
							}
							deregisterCharacterJoiner(e) {
								if (!this._characterJoinerService) throw new Error("Terminal must be opened first");
								this._characterJoinerService.deregister(e) && this.refresh(0, this.rows - 1);
							}
							get markers() {
								return this.buffer.markers;
							}
							registerMarker(e) {
								return this.buffer.addMarker(this.buffer.ybase + this.buffer.y + e);
							}
							registerDecoration(e) {
								return this._decorationService.registerDecoration(e);
							}
							hasSelection() {
								return !!this._selectionService && this._selectionService.hasSelection;
							}
							select(e, t, i) {
								this._selectionService.setSelection(e, t, i);
							}
							getSelection() {
								return this._selectionService ? this._selectionService.selectionText : "";
							}
							getSelectionPosition() {
								if (this._selectionService && this._selectionService.hasSelection) return {
									start: {
										x: this._selectionService.selectionStart[0],
										y: this._selectionService.selectionStart[1]
									},
									end: {
										x: this._selectionService.selectionEnd[0],
										y: this._selectionService.selectionEnd[1]
									}
								};
							}
							clearSelection() {
								this._selectionService?.clearSelection();
							}
							selectAll() {
								this._selectionService?.selectAll();
							}
							selectLines(e, t) {
								this._selectionService?.selectLines(e, t);
							}
							_keyDown(e) {
								if (this._keyDownHandled = !1, this._keyDownSeen = !0, this._customKeyEventHandler && !1 === this._customKeyEventHandler(e)) return !1;
								const t = this.browser.isMac && this.options.macOptionIsMeta && e.altKey;
								if (!t && !this._compositionHelper.keydown(e)) return this.options.scrollOnUserInput && this.buffer.ybase !== this.buffer.ydisp && this.scrollToBottom(!0), !1;
								t || "Dead" !== e.key && "AltGraph" !== e.key || (this._unprocessedDeadKey = !0);
								const i = (0, D.evaluateKeyboardEvent)(e, this.coreService.decPrivateModes.applicationCursorKeys, this.browser.isMac, this.options.macOptionIsMeta);
								if (this.updateCursorStyle(e), 3 === i.type || 2 === i.type) {
									const t = this.rows - 1;
									return this.scrollLines(2 === i.type ? -t : t), this.cancel(e, !0);
								}
								return 1 === i.type && this.selectAll(), !!this._isThirdLevelShift(this.browser, e) || (i.cancel && this.cancel(e, !0), !i.key || !!(e.key && !e.ctrlKey && !e.altKey && !e.metaKey && 1 === e.key.length && e.key.charCodeAt(0) >= 65 && e.key.charCodeAt(0) <= 90) || (this._unprocessedDeadKey ? (this._unprocessedDeadKey = !1, !0) : (i.key !== E.C0.ETX && i.key !== E.C0.CR || (this.textarea.value = ""), this._onKey.fire({
									key: i.key,
									domEvent: e
								}), this._showCursor(), this.coreService.triggerDataEvent(i.key, !0), !this.optionsService.rawOptions.screenReaderMode || e.altKey || e.ctrlKey ? this.cancel(e, !0) : void (this._keyDownHandled = !0))));
							}
							_isThirdLevelShift(e, t) {
								const i = e.isMac && !this.options.macOptionIsMeta && t.altKey && !t.ctrlKey && !t.metaKey || e.isWindows && t.altKey && t.ctrlKey && !t.metaKey || e.isWindows && t.getModifierState("AltGraph");
								return "keypress" === t.type ? i : i && (!t.keyCode || t.keyCode > 47);
							}
							_keyUp(e) {
								this._keyDownSeen = !1, this._customKeyEventHandler && !1 === this._customKeyEventHandler(e) || (function(e) {
									return 16 === e.keyCode || 17 === e.keyCode || 18 === e.keyCode;
								}(e) || this.focus(), this.updateCursorStyle(e), this._keyPressHandled = !1);
							}
							_keyPress(e) {
								let t;
								if (this._keyPressHandled = !1, this._keyDownHandled) return !1;
								if (this._customKeyEventHandler && !1 === this._customKeyEventHandler(e)) return !1;
								if (this.cancel(e), e.charCode) t = e.charCode;
								else if (null === e.which || void 0 === e.which) t = e.keyCode;
								else {
									if (0 === e.which || 0 === e.charCode) return !1;
									t = e.which;
								}
								return !(!t || (e.altKey || e.ctrlKey || e.metaKey) && !this._isThirdLevelShift(this.browser, e) || (t = String.fromCharCode(t), this._onKey.fire({
									key: t,
									domEvent: e
								}), this._showCursor(), this.coreService.triggerDataEvent(t, !0), this._keyPressHandled = !0, this._unprocessedDeadKey = !1, 0));
							}
							_inputEvent(e) {
								if (e.data && "insertText" === e.inputType && (!e.composed || !this._keyDownSeen) && !this.optionsService.rawOptions.screenReaderMode) {
									if (this._keyPressHandled) return !1;
									this._unprocessedDeadKey = !1;
									const t = e.data;
									return this.coreService.triggerDataEvent(t, !0), this.cancel(e), !0;
								}
								return !1;
							}
							resize(e, t) {
								e !== this.cols || t !== this.rows ? super.resize(e, t) : this._charSizeService && !this._charSizeService.hasValidSize && this._charSizeService.measure();
							}
							_afterResize(e, t) {
								this._charSizeService?.measure();
							}
							clear() {
								if (0 !== this.buffer.ybase || 0 !== this.buffer.y) {
									this.buffer.clearAllMarkers(), this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y)), this.buffer.lines.length = 1, this.buffer.ydisp = 0, this.buffer.ybase = 0, this.buffer.y = 0;
									for (let e = 1; e < this.rows; e++) this.buffer.lines.push(this.buffer.getBlankLine(w.DEFAULT_ATTR_DATA));
									this._onScroll.fire({ position: this.buffer.ydisp }), this.refresh(0, this.rows - 1);
								}
							}
							reset() {
								this.options.rows = this.rows, this.options.cols = this.cols;
								const e = this._customKeyEventHandler;
								this._setup(), super.reset(), this._selectionService?.reset(), this._decorationService.reset(), this._customKeyEventHandler = e, this.refresh(0, this.rows - 1);
							}
							clearTextureAtlas() {
								this._renderService?.clearTextureAtlas();
							}
							_reportFocus() {
								this.element?.classList.contains("focus") ? this.coreService.triggerDataEvent(E.C0.ESC + "[I") : this.coreService.triggerDataEvent(E.C0.ESC + "[O");
							}
							_reportWindowsOptions(e) {
								if (this._renderService) switch (e) {
									case T.WindowsOptionsReportType.GET_WIN_SIZE_PIXELS:
										const e = this._renderService.dimensions.css.canvas.width.toFixed(0), t = this._renderService.dimensions.css.canvas.height.toFixed(0);
										this.coreService.triggerDataEvent(`${E.C0.ESC}[4;${t};${e}t`);
										break;
									case T.WindowsOptionsReportType.GET_CELL_SIZE_PIXELS:
										const i = this._renderService.dimensions.css.cell.width.toFixed(0), s = this._renderService.dimensions.css.cell.height.toFixed(0);
										this.coreService.triggerDataEvent(`${E.C0.ESC}[6;${s};${i}t`);
								}
							}
							cancel(e, t) {
								if (this.options.cancelEvents || t) return e.preventDefault(), e.stopPropagation(), !1;
							}
						}
						t.CoreBrowserTerminal = x;
					},
					8906: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.Linkifier = void 0;
						const n = i(7150), o = i(6501), a = i(7098), l = i(802), h = i(7093);
						let c = class extends n.Disposable {
							get currentLink() {
								return this._currentLink;
							}
							constructor(e, t, i, s, r) {
								super(), this._element = e, this._mouseService = t, this._renderService = i, this._bufferService = s, this._linkProviderService = r, this._linkCacheDisposables = [], this._isMouseOut = !0, this._wasResized = !1, this._activeLine = -1, this._onShowLinkUnderline = this._register(new l.Emitter()), this.onShowLinkUnderline = this._onShowLinkUnderline.event, this._onHideLinkUnderline = this._register(new l.Emitter()), this.onHideLinkUnderline = this._onHideLinkUnderline.event, this._register((0, n.toDisposable)((() => {
									(0, n.dispose)(this._linkCacheDisposables), this._linkCacheDisposables.length = 0, this._lastMouseEvent = void 0, this._activeProviderReplies?.clear();
								}))), this._register(this._bufferService.onResize((() => {
									this._clearCurrentLink(), this._wasResized = !0;
								}))), this._register((0, h.addDisposableListener)(this._element, "mouseleave", (() => {
									this._isMouseOut = !0, this._clearCurrentLink();
								}))), this._register((0, h.addDisposableListener)(this._element, "mousemove", this._handleMouseMove.bind(this))), this._register((0, h.addDisposableListener)(this._element, "mousedown", this._handleMouseDown.bind(this))), this._register((0, h.addDisposableListener)(this._element, "mouseup", this._handleMouseUp.bind(this)));
							}
							_handleMouseMove(e) {
								this._lastMouseEvent = e;
								const t = this._positionFromMouseEvent(e, this._element, this._mouseService);
								if (!t) return;
								this._isMouseOut = !1;
								const i = e.composedPath();
								for (let e = 0; e < i.length; e++) {
									const t = i[e];
									if (t.classList.contains("xterm")) break;
									if (t.classList.contains("xterm-hover")) return;
								}
								this._lastBufferCell && t.x === this._lastBufferCell.x && t.y === this._lastBufferCell.y || (this._handleHover(t), this._lastBufferCell = t);
							}
							_handleHover(e) {
								if (this._activeLine !== e.y || this._wasResized) return this._clearCurrentLink(), this._askForLink(e, !1), void (this._wasResized = !1);
								this._currentLink && this._linkAtPosition(this._currentLink.link, e) || (this._clearCurrentLink(), this._askForLink(e, !0));
							}
							_askForLink(e, t) {
								this._activeProviderReplies && t || (this._activeProviderReplies?.forEach(((e) => {
									e?.forEach(((e) => {
										e.link.dispose && e.link.dispose();
									}));
								})), this._activeProviderReplies = /* @__PURE__ */ new Map(), this._activeLine = e.y);
								let i = !1;
								for (const [s, r] of this._linkProviderService.linkProviders.entries()) if (t) this._activeProviderReplies?.get(s) && (i = this._checkLinkProviderResult(s, e, i));
								else r.provideLinks(e.y, ((t) => {
									if (this._isMouseOut) return;
									const r = t?.map(((e) => ({ link: e })));
									this._activeProviderReplies?.set(s, r), i = this._checkLinkProviderResult(s, e, i), this._activeProviderReplies?.size === this._linkProviderService.linkProviders.length && this._removeIntersectingLinks(e.y, this._activeProviderReplies);
								}));
							}
							_removeIntersectingLinks(e, t) {
								const i = /* @__PURE__ */ new Set();
								for (let s = 0; s < t.size; s++) {
									const r = t.get(s);
									if (r) for (let t = 0; t < r.length; t++) {
										const s = r[t], n = s.link.range.start.y < e ? 0 : s.link.range.start.x, o = s.link.range.end.y > e ? this._bufferService.cols : s.link.range.end.x;
										for (let e = n; e <= o; e++) {
											if (i.has(e)) {
												r.splice(t--, 1);
												break;
											}
											i.add(e);
										}
									}
								}
							}
							_checkLinkProviderResult(e, t, i) {
								if (!this._activeProviderReplies) return i;
								const s = this._activeProviderReplies.get(e);
								let r = !1;
								for (let t = 0; t < e; t++) this._activeProviderReplies.has(t) && !this._activeProviderReplies.get(t) || (r = !0);
								if (!r && s) {
									const e = s.find(((e) => this._linkAtPosition(e.link, t)));
									e && (i = !0, this._handleNewLink(e));
								}
								if (this._activeProviderReplies.size === this._linkProviderService.linkProviders.length && !i) for (let e = 0; e < this._activeProviderReplies.size; e++) {
									const s = this._activeProviderReplies.get(e)?.find(((e) => this._linkAtPosition(e.link, t)));
									if (s) {
										i = !0, this._handleNewLink(s);
										break;
									}
								}
								return i;
							}
							_handleMouseDown() {
								this._mouseDownLink = this._currentLink;
							}
							_handleMouseUp(e) {
								if (!this._currentLink) return;
								const t = this._positionFromMouseEvent(e, this._element, this._mouseService);
								var i, s;
								t && this._mouseDownLink && (i = this._mouseDownLink.link, s = this._currentLink.link, i.text === s.text && i.range.start.x === s.range.start.x && i.range.start.y === s.range.start.y && i.range.end.x === s.range.end.x && i.range.end.y === s.range.end.y) && this._linkAtPosition(this._currentLink.link, t) && this._currentLink.link.activate(e, this._currentLink.link.text);
							}
							_clearCurrentLink(e, t) {
								this._currentLink && this._lastMouseEvent && (!e || !t || this._currentLink.link.range.start.y >= e && this._currentLink.link.range.end.y <= t) && (this._linkLeave(this._element, this._currentLink.link, this._lastMouseEvent), this._currentLink = void 0, (0, n.dispose)(this._linkCacheDisposables), this._linkCacheDisposables.length = 0);
							}
							_handleNewLink(e) {
								if (!this._lastMouseEvent) return;
								const t = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
								t && this._linkAtPosition(e.link, t) && (this._currentLink = e, this._currentLink.state = {
									decorations: {
										underline: void 0 === e.link.decorations || e.link.decorations.underline,
										pointerCursor: void 0 === e.link.decorations || e.link.decorations.pointerCursor
									},
									isHovered: !0
								}, this._linkHover(this._element, e.link, this._lastMouseEvent), e.link.decorations = {}, Object.defineProperties(e.link.decorations, {
									pointerCursor: {
										get: () => this._currentLink?.state?.decorations.pointerCursor,
										set: (e) => {
											this._currentLink?.state && this._currentLink.state.decorations.pointerCursor !== e && (this._currentLink.state.decorations.pointerCursor = e, this._currentLink.state.isHovered && this._element.classList.toggle("xterm-cursor-pointer", e));
										}
									},
									underline: {
										get: () => this._currentLink?.state?.decorations.underline,
										set: (t) => {
											this._currentLink?.state && this._currentLink?.state?.decorations.underline !== t && (this._currentLink.state.decorations.underline = t, this._currentLink.state.isHovered && this._fireUnderlineEvent(e.link, t));
										}
									}
								}), this._linkCacheDisposables.push(this._renderService.onRenderedViewportChange(((e) => {
									if (!this._currentLink) return;
									const t = 0 === e.start ? 0 : e.start + 1 + this._bufferService.buffer.ydisp, i = this._bufferService.buffer.ydisp + 1 + e.end;
									if (this._currentLink.link.range.start.y >= t && this._currentLink.link.range.end.y <= i && (this._clearCurrentLink(t, i), this._lastMouseEvent)) {
										const e = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
										e && this._askForLink(e, !1);
									}
								}))));
							}
							_linkHover(e, t, i) {
								this._currentLink?.state && (this._currentLink.state.isHovered = !0, this._currentLink.state.decorations.underline && this._fireUnderlineEvent(t, !0), this._currentLink.state.decorations.pointerCursor && e.classList.add("xterm-cursor-pointer")), t.hover && t.hover(i, t.text);
							}
							_fireUnderlineEvent(e, t) {
								const i = e.range, s = this._bufferService.buffer.ydisp, r = this._createLinkUnderlineEvent(i.start.x - 1, i.start.y - s - 1, i.end.x, i.end.y - s - 1, void 0);
								(t ? this._onShowLinkUnderline : this._onHideLinkUnderline).fire(r);
							}
							_linkLeave(e, t, i) {
								this._currentLink?.state && (this._currentLink.state.isHovered = !1, this._currentLink.state.decorations.underline && this._fireUnderlineEvent(t, !1), this._currentLink.state.decorations.pointerCursor && e.classList.remove("xterm-cursor-pointer")), t.leave && t.leave(i, t.text);
							}
							_linkAtPosition(e, t) {
								const i = e.range.start.y * this._bufferService.cols + e.range.start.x, s = e.range.end.y * this._bufferService.cols + e.range.end.x, r = t.y * this._bufferService.cols + t.x;
								return i <= r && r <= s;
							}
							_positionFromMouseEvent(e, t, i) {
								const s = i.getCoords(e, t, this._bufferService.cols, this._bufferService.rows);
								if (s) return {
									x: s[0],
									y: s[1] + this._bufferService.buffer.ydisp
								};
							}
							_createLinkUnderlineEvent(e, t, i, s, r) {
								return {
									x1: e,
									y1: t,
									x2: i,
									y2: s,
									cols: this._bufferService.cols,
									fg: r
								};
							}
						};
						t.Linkifier = c, t.Linkifier = c = s([
							r(1, a.IMouseService),
							r(2, a.IRenderService),
							r(3, o.IBufferService),
							r(4, a.ILinkProviderService)
						], c);
					},
					7721: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.tooMuchOutput = t.promptLabel = void 0;
						let i = "Terminal input";
						t.promptLabel = {
							get: () => i,
							set: (e) => i = e
						};
						let r = "Too much output to announce, navigate to rows manually to read";
						t.tooMuchOutput = {
							get: () => r,
							set: (e) => r = e
						};
					},
					3285: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.OscLinkProvider = void 0;
						const n = i(3055), o = i(6501);
						let a = class {
							constructor(e, t, i) {
								this._bufferService = e, this._optionsService = t, this._oscLinkService = i;
							}
							provideLinks(e, t) {
								const i = this._bufferService.buffer.lines.get(e - 1);
								if (!i) return void t(void 0);
								const s = [], r = this._optionsService.rawOptions.linkHandler, o = new n.CellData(), a = i.getTrimmedLength();
								let h = -1, c = -1, d = !1;
								for (let t = 0; t < a; t++) if (-1 !== c || i.hasContent(t)) {
									if (i.loadCell(t, o), o.hasExtendedAttrs() && o.extended.urlId) {
										if (-1 === c) {
											c = t, h = o.extended.urlId;
											continue;
										}
										d = o.extended.urlId !== h;
									} else -1 !== c && (d = !0);
									if (d || -1 !== c && t === a - 1) {
										const i = this._oscLinkService.getLinkData(h)?.uri;
										if (i) {
											const n = {
												start: {
													x: c + 1,
													y: e
												},
												end: {
													x: t + (d || t !== a - 1 ? 0 : 1),
													y: e
												}
											};
											let o = !1;
											if (!r?.allowNonHttpProtocols) try {
												const e = new URL(i);
												["http:", "https:"].includes(e.protocol) || (o = !0);
											} catch (e) {
												o = !0;
											}
											o || s.push({
												text: i,
												range: n,
												activate: (e, t) => r ? r.activate(e, t, n) : l(0, t),
												hover: (e, t) => r?.hover?.(e, t, n),
												leave: (e, t) => r?.leave?.(e, t, n)
											});
										}
										d = !1, o.hasExtendedAttrs() && o.extended.urlId ? (c = t, h = o.extended.urlId) : (c = -1, h = -1);
									}
								}
								t(s);
							}
						};
						function l(e, t) {
							if (confirm(`Do you want to navigate to ${t}?\n\nWARNING: This link could potentially be dangerous`)) {
								const e = window.open();
								if (e) {
									try {
										e.opener = null;
									} catch {}
									e.location.href = t;
								} else console.warn("Opening link blocked as opener could not be cleared");
							}
						}
						t.OscLinkProvider = a, t.OscLinkProvider = a = s([
							r(0, o.IBufferService),
							r(1, o.IOptionsService),
							r(2, o.IOscLinkService)
						], a);
					},
					4852: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.RenderDebouncer = void 0, t.RenderDebouncer = class {
							constructor(e, t) {
								this._renderCallback = e, this._coreBrowserService = t, this._refreshCallbacks = [];
							}
							dispose() {
								this._animationFrame && (this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame), this._animationFrame = void 0);
							}
							addRefreshCallback(e) {
								return this._refreshCallbacks.push(e), this._animationFrame || (this._animationFrame = this._coreBrowserService.window.requestAnimationFrame((() => this._innerRefresh()))), this._animationFrame;
							}
							refresh(e, t, i) {
								this._rowCount = i, e = void 0 !== e ? e : 0, t = void 0 !== t ? t : this._rowCount - 1, this._rowStart = void 0 !== this._rowStart ? Math.min(this._rowStart, e) : e, this._rowEnd = void 0 !== this._rowEnd ? Math.max(this._rowEnd, t) : t, this._animationFrame || (this._animationFrame = this._coreBrowserService.window.requestAnimationFrame((() => this._innerRefresh())));
							}
							_innerRefresh() {
								if (this._animationFrame = void 0, void 0 === this._rowStart || void 0 === this._rowEnd || void 0 === this._rowCount) return void this._runRefreshCallbacks();
								const e = Math.max(this._rowStart, 0), t = Math.min(this._rowEnd, this._rowCount - 1);
								this._rowStart = void 0, this._rowEnd = void 0, this._renderCallback(e, t), this._runRefreshCallbacks();
							}
							_runRefreshCallbacks() {
								for (const e of this._refreshCallbacks) e(0);
								this._refreshCallbacks = [];
							}
						};
					},
					4292: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.TimeBasedDebouncer = void 0, t.TimeBasedDebouncer = class {
							constructor(e, t = 1e3) {
								this._renderCallback = e, this._debounceThresholdMS = t, this._lastRefreshMs = 0, this._additionalRefreshRequested = !1;
							}
							dispose() {
								this._refreshTimeoutID && clearTimeout(this._refreshTimeoutID);
							}
							refresh(e, t, i) {
								this._rowCount = i, e = void 0 !== e ? e : 0, t = void 0 !== t ? t : this._rowCount - 1, this._rowStart = void 0 !== this._rowStart ? Math.min(this._rowStart, e) : e, this._rowEnd = void 0 !== this._rowEnd ? Math.max(this._rowEnd, t) : t;
								const s = performance.now();
								if (s - this._lastRefreshMs >= this._debounceThresholdMS) this._lastRefreshMs = s, this._innerRefresh();
								else if (!this._additionalRefreshRequested) {
									const e = s - this._lastRefreshMs, t = this._debounceThresholdMS - e;
									this._additionalRefreshRequested = !0, this._refreshTimeoutID = window.setTimeout((() => {
										this._lastRefreshMs = performance.now(), this._innerRefresh(), this._additionalRefreshRequested = !1, this._refreshTimeoutID = void 0;
									}), t);
								}
							}
							_innerRefresh() {
								if (void 0 === this._rowStart || void 0 === this._rowEnd || void 0 === this._rowCount) return;
								const e = Math.max(this._rowStart, 0), t = Math.min(this._rowEnd, this._rowCount - 1);
								this._rowStart = void 0, this._rowEnd = void 0, this._renderCallback(e, t);
							}
						};
					},
					9302: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.DEFAULT_ANSI_COLORS = void 0;
						const s = i(4103);
						t.DEFAULT_ANSI_COLORS = Object.freeze((() => {
							const e = [
								s.css.toColor("#2e3436"),
								s.css.toColor("#cc0000"),
								s.css.toColor("#4e9a06"),
								s.css.toColor("#c4a000"),
								s.css.toColor("#3465a4"),
								s.css.toColor("#75507b"),
								s.css.toColor("#06989a"),
								s.css.toColor("#d3d7cf"),
								s.css.toColor("#555753"),
								s.css.toColor("#ef2929"),
								s.css.toColor("#8ae234"),
								s.css.toColor("#fce94f"),
								s.css.toColor("#729fcf"),
								s.css.toColor("#ad7fa8"),
								s.css.toColor("#34e2e2"),
								s.css.toColor("#eeeeec")
							], t = [
								0,
								95,
								135,
								175,
								215,
								255
							];
							for (let i = 0; i < 216; i++) {
								const r = t[i / 36 % 6 | 0], n = t[i / 6 % 6 | 0], o = t[i % 6];
								e.push({
									css: s.channels.toCss(r, n, o),
									rgba: s.channels.toRgba(r, n, o)
								});
							}
							for (let t = 0; t < 24; t++) {
								const i = 8 + 10 * t;
								e.push({
									css: s.channels.toCss(i, i, i),
									rgba: s.channels.toRgba(i, i, i)
								});
							}
							return e;
						})());
					},
					4017: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.Viewport = void 0;
						const n = i(7098), o = i(7150), a = i(6501), l = i(7093), h = i(8234), c = i(802), d = i(9881);
						let u = class extends o.Disposable {
							constructor(e, t, i, s, r, n, a, u) {
								super(), this._bufferService = i, this._optionsService = a, this._renderService = u, this._onRequestScrollLines = this._register(new c.Emitter()), this.onRequestScrollLines = this._onRequestScrollLines.event, this._isSyncing = !1, this._isHandlingScroll = !1, this._suppressOnScrollHandler = !1;
								const _ = this._register(new d.Scrollable({
									forceIntegerValues: !1,
									smoothScrollDuration: this._optionsService.rawOptions.smoothScrollDuration,
									scheduleAtNextAnimationFrame: (e) => (0, l.scheduleAtNextAnimationFrame)(s.window, e)
								}));
								this._register(this._optionsService.onSpecificOptionChange("smoothScrollDuration", (() => {
									_.setSmoothScrollDuration(this._optionsService.rawOptions.smoothScrollDuration);
								}))), this._scrollableElement = this._register(new h.SmoothScrollableElement(t, {
									vertical: 1,
									horizontal: 2,
									useShadows: !1,
									mouseWheelSmoothScroll: !0,
									...this._getChangeOptions()
								}, _)), this._register(this._optionsService.onMultipleOptionChange([
									"scrollSensitivity",
									"fastScrollSensitivity",
									"overviewRuler"
								], (() => this._scrollableElement.updateOptions(this._getChangeOptions())))), this._register(r.onProtocolChange(((e) => {
									this._scrollableElement.updateOptions({ handleMouseWheel: !(16 & e) });
								}))), this._scrollableElement.setScrollDimensions({
									height: 0,
									scrollHeight: 0
								}), this._register(c.Event.runAndSubscribe(n.onChangeColors, (() => {
									this._scrollableElement.getDomNode().style.backgroundColor = n.colors.background.css;
								}))), e.appendChild(this._scrollableElement.getDomNode()), this._register((0, o.toDisposable)((() => this._scrollableElement.getDomNode().remove()))), this._styleElement = s.mainDocument.createElement("style"), t.appendChild(this._styleElement), this._register((0, o.toDisposable)((() => this._styleElement.remove()))), this._register(c.Event.runAndSubscribe(n.onChangeColors, (() => {
									this._styleElement.textContent = [
										".xterm .xterm-scrollable-element > .scrollbar > .slider {",
										`  background: ${n.colors.scrollbarSliderBackground.css};`,
										"}",
										".xterm .xterm-scrollable-element > .scrollbar > .slider:hover {",
										`  background: ${n.colors.scrollbarSliderHoverBackground.css};`,
										"}",
										".xterm .xterm-scrollable-element > .scrollbar > .slider.active {",
										`  background: ${n.colors.scrollbarSliderActiveBackground.css};`,
										"}"
									].join("\n");
								}))), this._register(this._bufferService.onResize((() => this.queueSync()))), this._register(this._bufferService.buffers.onBufferActivate((() => {
									this._latestYDisp = void 0, this.queueSync();
								}))), this._register(this._bufferService.onScroll((() => this._sync()))), this._register(this._scrollableElement.onScroll(((e) => this._handleScroll(e))));
							}
							scrollLines(e) {
								const t = this._scrollableElement.getScrollPosition();
								this._scrollableElement.setScrollPosition({
									reuseAnimation: !0,
									scrollTop: t.scrollTop + e * this._renderService.dimensions.css.cell.height
								});
							}
							scrollToLine(e, t) {
								t && (this._latestYDisp = e), this._scrollableElement.setScrollPosition({
									reuseAnimation: !t,
									scrollTop: e * this._renderService.dimensions.css.cell.height
								});
							}
							_getChangeOptions() {
								return {
									mouseWheelScrollSensitivity: this._optionsService.rawOptions.scrollSensitivity,
									fastScrollSensitivity: this._optionsService.rawOptions.fastScrollSensitivity,
									verticalScrollbarSize: this._optionsService.rawOptions.overviewRuler?.width || 14
								};
							}
							queueSync(e) {
								void 0 !== e && (this._latestYDisp = e), void 0 === this._queuedAnimationFrame && (this._queuedAnimationFrame = this._renderService.addRefreshCallback((() => {
									this._queuedAnimationFrame = void 0, this._sync(this._latestYDisp);
								})));
							}
							_sync(e = this._bufferService.buffer.ydisp) {
								this._renderService && !this._isSyncing && (this._isSyncing = !0, this._suppressOnScrollHandler = !0, this._scrollableElement.setScrollDimensions({
									height: this._renderService.dimensions.css.canvas.height,
									scrollHeight: this._renderService.dimensions.css.cell.height * this._bufferService.buffer.lines.length
								}), this._suppressOnScrollHandler = !1, e !== this._latestYDisp && this._scrollableElement.setScrollPosition({ scrollTop: e * this._renderService.dimensions.css.cell.height }), this._isSyncing = !1);
							}
							_handleScroll(e) {
								if (!this._renderService) return;
								if (this._isHandlingScroll || this._suppressOnScrollHandler) return;
								this._isHandlingScroll = !0;
								const t = Math.round(e.scrollTop / this._renderService.dimensions.css.cell.height), i = t - this._bufferService.buffer.ydisp;
								0 !== i && (this._latestYDisp = t, this._onRequestScrollLines.fire(i)), this._isHandlingScroll = !1;
							}
						};
						t.Viewport = u, t.Viewport = u = s([
							r(2, a.IBufferService),
							r(3, n.ICoreBrowserService),
							r(4, a.ICoreMouseService),
							r(5, n.IThemeService),
							r(6, a.IOptionsService),
							r(7, n.IRenderService)
						], u);
					},
					4196: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.BufferDecorationRenderer = void 0;
						const n = i(7098), o = i(7150), a = i(6501);
						let l = class extends o.Disposable {
							constructor(e, t, i, s, r) {
								super(), this._screenElement = e, this._bufferService = t, this._coreBrowserService = i, this._decorationService = s, this._renderService = r, this._decorationElements = /* @__PURE__ */ new Map(), this._altBufferIsActive = !1, this._dimensionsChanged = !1, this._container = document.createElement("div"), this._container.classList.add("xterm-decoration-container"), this._screenElement.appendChild(this._container), this._register(this._renderService.onRenderedViewportChange((() => this._doRefreshDecorations()))), this._register(this._renderService.onDimensionsChange((() => {
									this._dimensionsChanged = !0, this._queueRefresh();
								}))), this._register(this._coreBrowserService.onDprChange((() => this._queueRefresh()))), this._register(this._bufferService.buffers.onBufferActivate((() => {
									this._altBufferIsActive = this._bufferService.buffer === this._bufferService.buffers.alt;
								}))), this._register(this._decorationService.onDecorationRegistered((() => this._queueRefresh()))), this._register(this._decorationService.onDecorationRemoved(((e) => this._removeDecoration(e)))), this._register((0, o.toDisposable)((() => {
									this._container.remove(), this._decorationElements.clear();
								})));
							}
							_queueRefresh() {
								void 0 === this._animationFrame && (this._animationFrame = this._renderService.addRefreshCallback((() => {
									this._doRefreshDecorations(), this._animationFrame = void 0;
								})));
							}
							_doRefreshDecorations() {
								for (const e of this._decorationService.decorations) this._renderDecoration(e);
								this._dimensionsChanged = !1;
							}
							_renderDecoration(e) {
								this._refreshStyle(e), this._dimensionsChanged && this._refreshXPosition(e);
							}
							_createElement(e) {
								const t = this._coreBrowserService.mainDocument.createElement("div");
								t.classList.add("xterm-decoration"), t.classList.toggle("xterm-decoration-top-layer", "top" === e?.options?.layer), t.style.width = `${Math.round((e.options.width || 1) * this._renderService.dimensions.css.cell.width)}px`, t.style.height = (e.options.height || 1) * this._renderService.dimensions.css.cell.height + "px", t.style.top = (e.marker.line - this._bufferService.buffers.active.ydisp) * this._renderService.dimensions.css.cell.height + "px", t.style.lineHeight = `${this._renderService.dimensions.css.cell.height}px`;
								const i = e.options.x ?? 0;
								return i && i > this._bufferService.cols && (t.style.display = "none"), this._refreshXPosition(e, t), t;
							}
							_refreshStyle(e) {
								const t = e.marker.line - this._bufferService.buffers.active.ydisp;
								if (t < 0 || t >= this._bufferService.rows) e.element && (e.element.style.display = "none", e.onRenderEmitter.fire(e.element));
								else {
									let i = this._decorationElements.get(e);
									i || (i = this._createElement(e), e.element = i, this._decorationElements.set(e, i), this._container.appendChild(i), e.onDispose((() => {
										this._decorationElements.delete(e), i.remove();
									}))), i.style.display = this._altBufferIsActive ? "none" : "block", this._altBufferIsActive || (i.style.width = `${Math.round((e.options.width || 1) * this._renderService.dimensions.css.cell.width)}px`, i.style.height = (e.options.height || 1) * this._renderService.dimensions.css.cell.height + "px", i.style.top = t * this._renderService.dimensions.css.cell.height + "px", i.style.lineHeight = `${this._renderService.dimensions.css.cell.height}px`), e.onRenderEmitter.fire(i);
								}
							}
							_refreshXPosition(e, t = e.element) {
								if (!t) return;
								const i = e.options.x ?? 0;
								"right" === (e.options.anchor || "left") ? t.style.right = i ? i * this._renderService.dimensions.css.cell.width + "px" : "" : t.style.left = i ? i * this._renderService.dimensions.css.cell.width + "px" : "";
							}
							_removeDecoration(e) {
								this._decorationElements.get(e)?.remove(), this._decorationElements.delete(e), e.dispose();
							}
						};
						t.BufferDecorationRenderer = l, t.BufferDecorationRenderer = l = s([
							r(1, a.IBufferService),
							r(2, n.ICoreBrowserService),
							r(3, a.IDecorationService),
							r(4, n.IRenderService)
						], l);
					},
					957: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.ColorZoneStore = void 0, t.ColorZoneStore = class {
							constructor() {
								this._zones = [], this._zonePool = [], this._zonePoolIndex = 0, this._linePadding = {
									full: 0,
									left: 0,
									center: 0,
									right: 0
								};
							}
							get zones() {
								return this._zonePool.length = Math.min(this._zonePool.length, this._zones.length), this._zones;
							}
							clear() {
								this._zones.length = 0, this._zonePoolIndex = 0;
							}
							addDecoration(e) {
								if (e.options.overviewRulerOptions) {
									for (const t of this._zones) if (t.color === e.options.overviewRulerOptions.color && t.position === e.options.overviewRulerOptions.position) {
										if (this._lineIntersectsZone(t, e.marker.line)) return;
										if (this._lineAdjacentToZone(t, e.marker.line, e.options.overviewRulerOptions.position)) return void this._addLineToZone(t, e.marker.line);
									}
									if (this._zonePoolIndex < this._zonePool.length) return this._zonePool[this._zonePoolIndex].color = e.options.overviewRulerOptions.color, this._zonePool[this._zonePoolIndex].position = e.options.overviewRulerOptions.position, this._zonePool[this._zonePoolIndex].startBufferLine = e.marker.line, this._zonePool[this._zonePoolIndex].endBufferLine = e.marker.line, void this._zones.push(this._zonePool[this._zonePoolIndex++]);
									this._zones.push({
										color: e.options.overviewRulerOptions.color,
										position: e.options.overviewRulerOptions.position,
										startBufferLine: e.marker.line,
										endBufferLine: e.marker.line
									}), this._zonePool.push(this._zones[this._zones.length - 1]), this._zonePoolIndex++;
								}
							}
							setPadding(e) {
								this._linePadding = e;
							}
							_lineIntersectsZone(e, t) {
								return t >= e.startBufferLine && t <= e.endBufferLine;
							}
							_lineAdjacentToZone(e, t, i) {
								return t >= e.startBufferLine - this._linePadding[i || "full"] && t <= e.endBufferLine + this._linePadding[i || "full"];
							}
							_addLineToZone(e, t) {
								e.startBufferLine = Math.min(e.startBufferLine, t), e.endBufferLine = Math.max(e.endBufferLine, t);
							}
						};
					},
					9925: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.OverviewRulerRenderer = void 0;
						const n = i(957), o = i(7098), a = i(7150), l = i(6501), h = {
							full: 0,
							left: 0,
							center: 0,
							right: 0
						}, c = {
							full: 0,
							left: 0,
							center: 0,
							right: 0
						}, d = {
							full: 0,
							left: 0,
							center: 0,
							right: 0
						};
						let u = class extends a.Disposable {
							get _width() {
								return this._optionsService.options.overviewRuler?.width || 0;
							}
							constructor(e, t, i, s, r, o, l, h) {
								super(), this._viewportElement = e, this._screenElement = t, this._bufferService = i, this._decorationService = s, this._renderService = r, this._optionsService = o, this._themeService = l, this._coreBrowserService = h, this._colorZoneStore = new n.ColorZoneStore(), this._shouldUpdateDimensions = !0, this._shouldUpdateAnchor = !0, this._lastKnownBufferLength = 0, this._canvas = this._coreBrowserService.mainDocument.createElement("canvas"), this._canvas.classList.add("xterm-decoration-overview-ruler"), this._refreshCanvasDimensions(), this._viewportElement.parentElement?.insertBefore(this._canvas, this._viewportElement), this._register((0, a.toDisposable)((() => this._canvas?.remove())));
								const c = this._canvas.getContext("2d");
								if (!c) throw new Error("Ctx cannot be null");
								this._ctx = c, this._register(this._decorationService.onDecorationRegistered((() => this._queueRefresh(void 0, !0)))), this._register(this._decorationService.onDecorationRemoved((() => this._queueRefresh(void 0, !0)))), this._register(this._renderService.onRenderedViewportChange((() => this._queueRefresh()))), this._register(this._bufferService.buffers.onBufferActivate((() => {
									this._canvas.style.display = this._bufferService.buffer === this._bufferService.buffers.alt ? "none" : "block";
								}))), this._register(this._bufferService.onScroll((() => {
									this._lastKnownBufferLength !== this._bufferService.buffers.normal.lines.length && (this._refreshDrawHeightConstants(), this._refreshColorZonePadding());
								}))), this._register(this._renderService.onRender((() => {
									this._containerHeight && this._containerHeight === this._screenElement.clientHeight || (this._queueRefresh(!0), this._containerHeight = this._screenElement.clientHeight);
								}))), this._register(this._coreBrowserService.onDprChange((() => this._queueRefresh(!0)))), this._register(this._optionsService.onSpecificOptionChange("overviewRuler", (() => this._queueRefresh(!0)))), this._register(this._themeService.onChangeColors((() => this._queueRefresh()))), this._queueRefresh(!0);
							}
							_refreshDrawConstants() {
								const e = Math.floor((this._canvas.width - 1) / 3), t = Math.ceil((this._canvas.width - 1) / 3);
								c.full = this._canvas.width, c.left = e, c.center = t, c.right = e, this._refreshDrawHeightConstants(), d.full = 1, d.left = 1, d.center = 1 + c.left, d.right = 1 + c.left + c.center;
							}
							_refreshDrawHeightConstants() {
								h.full = Math.round(2 * this._coreBrowserService.dpr);
								const e = this._canvas.height / this._bufferService.buffer.lines.length, t = Math.round(Math.max(Math.min(e, 12), 6) * this._coreBrowserService.dpr);
								h.left = t, h.center = t, h.right = t;
							}
							_refreshColorZonePadding() {
								this._colorZoneStore.setPadding({
									full: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * h.full),
									left: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * h.left),
									center: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * h.center),
									right: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * h.right)
								}), this._lastKnownBufferLength = this._bufferService.buffers.normal.lines.length;
							}
							_refreshCanvasDimensions() {
								this._canvas.style.width = `${this._width}px`, this._canvas.width = Math.round(this._width * this._coreBrowserService.dpr), this._canvas.style.height = `${this._screenElement.clientHeight}px`, this._canvas.height = Math.round(this._screenElement.clientHeight * this._coreBrowserService.dpr), this._refreshDrawConstants(), this._refreshColorZonePadding();
							}
							_refreshDecorations() {
								this._shouldUpdateDimensions && this._refreshCanvasDimensions(), this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height), this._colorZoneStore.clear();
								for (const e of this._decorationService.decorations) this._colorZoneStore.addDecoration(e);
								this._ctx.lineWidth = 1, this._renderRulerOutline();
								const e = this._colorZoneStore.zones;
								for (const t of e) "full" !== t.position && this._renderColorZone(t);
								for (const t of e) "full" === t.position && this._renderColorZone(t);
								this._shouldUpdateDimensions = !1, this._shouldUpdateAnchor = !1;
							}
							_renderRulerOutline() {
								this._ctx.fillStyle = this._themeService.colors.overviewRulerBorder.css, this._ctx.fillRect(0, 0, 1, this._canvas.height), this._optionsService.rawOptions.overviewRuler.showTopBorder && this._ctx.fillRect(1, 0, this._canvas.width - 1, 1), this._optionsService.rawOptions.overviewRuler.showBottomBorder && this._ctx.fillRect(1, this._canvas.height - 1, this._canvas.width - 1, this._canvas.height);
							}
							_renderColorZone(e) {
								this._ctx.fillStyle = e.color, this._ctx.fillRect(d[e.position || "full"], Math.round((this._canvas.height - 1) * (e.startBufferLine / this._bufferService.buffers.active.lines.length) - h[e.position || "full"] / 2), c[e.position || "full"], Math.round((this._canvas.height - 1) * ((e.endBufferLine - e.startBufferLine) / this._bufferService.buffers.active.lines.length) + h[e.position || "full"]));
							}
							_queueRefresh(e, t) {
								this._shouldUpdateDimensions = e || this._shouldUpdateDimensions, this._shouldUpdateAnchor = t || this._shouldUpdateAnchor, void 0 === this._animationFrame && (this._animationFrame = this._coreBrowserService.window.requestAnimationFrame((() => {
									this._refreshDecorations(), this._animationFrame = void 0;
								})));
							}
						};
						t.OverviewRulerRenderer = u, t.OverviewRulerRenderer = u = s([
							r(2, l.IBufferService),
							r(3, l.IDecorationService),
							r(4, o.IRenderService),
							r(5, l.IOptionsService),
							r(6, o.IThemeService),
							r(7, o.ICoreBrowserService)
						], u);
					},
					3618: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.CompositionHelper = void 0;
						const n = i(7098), o = i(6501), a = i(3534);
						let l = class {
							get isComposing() {
								return this._isComposing;
							}
							constructor(e, t, i, s, r, n) {
								this._textarea = e, this._compositionView = t, this._bufferService = i, this._optionsService = s, this._coreService = r, this._renderService = n, this._isComposing = !1, this._isSendingComposition = !1, this._compositionPosition = {
									start: 0,
									end: 0
								}, this._dataAlreadySent = "";
							}
							compositionstart() {
								this._isComposing = !0, this._compositionPosition.start = this._textarea.value.length, this._compositionView.textContent = "", this._dataAlreadySent = "", this._compositionView.classList.add("active");
							}
							compositionupdate(e) {
								this._compositionView.textContent = e.data, this.updateCompositionElements(), setTimeout((() => {
									this._compositionPosition.end = this._textarea.value.length;
								}), 0);
							}
							compositionend() {
								this._finalizeComposition(!0);
							}
							keydown(e) {
								if (this._isComposing || this._isSendingComposition) {
									if (20 === e.keyCode || 229 === e.keyCode) return !1;
									if (16 === e.keyCode || 17 === e.keyCode || 18 === e.keyCode) return !1;
									this._finalizeComposition(!1);
								}
								return 229 !== e.keyCode || (this._handleAnyTextareaChanges(), !1);
							}
							_finalizeComposition(e) {
								if (this._compositionView.classList.remove("active"), this._isComposing = !1, e) {
									const e = {
										start: this._compositionPosition.start,
										end: this._compositionPosition.end
									};
									this._isSendingComposition = !0, setTimeout((() => {
										if (this._isSendingComposition) {
											let t;
											this._isSendingComposition = !1, e.start += this._dataAlreadySent.length, t = this._isComposing ? this._textarea.value.substring(e.start, this._compositionPosition.start) : this._textarea.value.substring(e.start), t.length > 0 && this._coreService.triggerDataEvent(t, !0);
										}
									}), 0);
								} else {
									this._isSendingComposition = !1;
									const e = this._textarea.value.substring(this._compositionPosition.start, this._compositionPosition.end);
									this._coreService.triggerDataEvent(e, !0);
								}
							}
							_handleAnyTextareaChanges() {
								const e = this._textarea.value;
								setTimeout((() => {
									if (!this._isComposing) {
										const t = this._textarea.value, i = t.replace(e, "");
										this._dataAlreadySent = i, t.length > e.length ? this._coreService.triggerDataEvent(i, !0) : t.length < e.length ? this._coreService.triggerDataEvent(`${a.C0.DEL}`, !0) : t.length === e.length && t !== e && this._coreService.triggerDataEvent(t, !0);
									}
								}), 0);
							}
							updateCompositionElements(e) {
								if (this._isComposing) {
									if (this._bufferService.buffer.isCursorInViewport) {
										const e = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1), t = this._renderService.dimensions.css.cell.height, i = this._bufferService.buffer.y * this._renderService.dimensions.css.cell.height, s = e * this._renderService.dimensions.css.cell.width;
										this._compositionView.style.left = s + "px", this._compositionView.style.top = i + "px", this._compositionView.style.height = t + "px", this._compositionView.style.lineHeight = t + "px", this._compositionView.style.fontFamily = this._optionsService.rawOptions.fontFamily, this._compositionView.style.fontSize = this._optionsService.rawOptions.fontSize + "px";
										const r = this._compositionView.getBoundingClientRect();
										this._textarea.style.left = s + "px", this._textarea.style.top = i + "px", this._textarea.style.width = Math.max(r.width, 1) + "px", this._textarea.style.height = Math.max(r.height, 1) + "px", this._textarea.style.lineHeight = r.height + "px";
									}
									e || setTimeout((() => this.updateCompositionElements(!0)), 0);
								}
							}
						};
						t.CompositionHelper = l, t.CompositionHelper = l = s([
							r(2, o.IBufferService),
							r(3, o.IOptionsService),
							r(4, o.ICoreService),
							r(5, n.IRenderService)
						], l);
					},
					5251: (e, t) => {
						function i(e, t, i) {
							const s = i.getBoundingClientRect(), r = e.getComputedStyle(i), n = parseInt(r.getPropertyValue("padding-left")), o = parseInt(r.getPropertyValue("padding-top"));
							return [t.clientX - s.left - n, t.clientY - s.top - o];
						}
						Object.defineProperty(t, "__esModule", { value: !0 }), t.getCoordsRelativeToElement = i, t.getCoords = function(e, t, s, r, n, o, a, l, h) {
							if (!o) return;
							const c = i(e, t, s);
							return c ? (c[0] = Math.ceil((c[0] + (h ? a / 2 : 0)) / a), c[1] = Math.ceil(c[1] / l), c[0] = Math.min(Math.max(c[0], 1), r + (h ? 1 : 0)), c[1] = Math.min(Math.max(c[1], 1), n), c) : void 0;
						};
					},
					9686: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.moveToCellSequence = function(e, t, i, s) {
							const o = i.buffer.x, c = i.buffer.y;
							if (!i.buffer.hasScrollback) return function(e, t, i, s, o, c) {
								return 0 === r(t, s, o, c).length ? "" : h(a(e, t, e, t - n(t, o), !1, o).length, l("D", c));
							}(o, c, 0, t, i, s) + r(c, t, i, s) + function(e, t, i, s, o, c) {
								let d;
								d = r(t, s, o, c).length > 0 ? s - n(s, o) : t;
								const u = s, _ = function(e, t, i, s, o, a) {
									let l;
									return l = r(i, s, o, a).length > 0 ? s - n(s, o) : t, e < i && l <= s || e >= i && l < s ? "C" : "D";
								}(e, t, i, s, o, c);
								return h(a(e, d, i, u, "C" === _, o).length, l(_, c));
							}(o, c, e, t, i, s);
							let d;
							if (c === t) return d = o > e ? "D" : "C", h(Math.abs(o - e), l(d, s));
							d = c > t ? "D" : "C";
							const u = Math.abs(c - t);
							return h(function(e, t) {
								return t.cols - e;
							}(c > t ? e : o, i) + (u - 1) * i.cols + 1 + ((c > t ? o : e) - 1), l(d, s));
						};
						const s = i(3534);
						function r(e, t, i, s) {
							const r = e - n(e, i), a = t - n(t, i);
							return h(Math.abs(r - a) - function(e, t, i) {
								let s = 0;
								const r = e - n(e, i), a = t - n(t, i);
								for (let n = 0; n < Math.abs(r - a); n++) {
									const a = "A" === o(e, t) ? -1 : 1;
									i.buffer.lines.get(r + a * n)?.isWrapped && s++;
								}
								return s;
							}(e, t, i), l(o(e, t), s));
						}
						function n(e, t) {
							let i = 0, s = t.buffer.lines.get(e), r = s?.isWrapped;
							for (; r && e >= 0 && e < t.rows;) i++, s = t.buffer.lines.get(--e), r = s?.isWrapped;
							return i;
						}
						function o(e, t) {
							return e > t ? "A" : "B";
						}
						function a(e, t, i, s, r, n) {
							let o = e, a = t, l = "";
							for (; (o !== i || a !== s) && a >= 0 && a < n.buffer.lines.length;) o += r ? 1 : -1, r && o > n.cols - 1 ? (l += n.buffer.translateBufferLineToString(a, !1, e, o), o = 0, e = 0, a++) : !r && o < 0 && (l += n.buffer.translateBufferLineToString(a, !1, 0, e + 1), o = n.cols - 1, e = o, a--);
							return l + n.buffer.translateBufferLineToString(a, !1, e, o);
						}
						function l(e, t) {
							const i = t ? "O" : "[";
							return s.C0.ESC + i + e;
						}
						function h(e, t) {
							e = Math.floor(e);
							let i = "";
							for (let s = 0; s < e; s++) i += t;
							return i;
						}
					},
					3955: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.DomRenderer = void 0;
						const n = i(1433), o = i(2744), a = i(9176), l = i(6181), h = i(2274), c = i(7098), d = i(4103), u = i(7150), _ = i(6501), f = i(802), p = "xterm-dom-renderer-owner-", g = "xterm-rows", m = "xterm-fg-", v = "xterm-bg-", S = "xterm-focus", b = "xterm-selection";
						let C = 1, y = class extends u.Disposable {
							constructor(e, t, i, s, r, a, c, d, _, m, v, S, y, w) {
								super(), this._terminal = e, this._document = t, this._element = i, this._screenElement = s, this._viewportElement = r, this._helperContainer = a, this._linkifier2 = c, this._charSizeService = _, this._optionsService = m, this._bufferService = v, this._coreService = S, this._coreBrowserService = y, this._themeService = w, this._terminalClass = C++, this._rowElements = [], this._selectionRenderModel = (0, h.createSelectionRenderModel)(), this.onRequestRedraw = this._register(new f.Emitter()).event, this._rowContainer = this._document.createElement("div"), this._rowContainer.classList.add(g), this._rowContainer.style.lineHeight = "normal", this._rowContainer.setAttribute("aria-hidden", "true"), this._refreshRowElements(this._bufferService.cols, this._bufferService.rows), this._selectionContainer = this._document.createElement("div"), this._selectionContainer.classList.add(b), this._selectionContainer.setAttribute("aria-hidden", "true"), this.dimensions = (0, l.createRenderDimensions)(), this._updateDimensions(), this._register(this._optionsService.onOptionChange((() => this._handleOptionsChanged()))), this._register(this._themeService.onChangeColors(((e) => this._injectCss(e)))), this._injectCss(this._themeService.colors), this._rowFactory = d.createInstance(n.DomRendererRowFactory, document), this._element.classList.add(p + this._terminalClass), this._screenElement.appendChild(this._rowContainer), this._screenElement.appendChild(this._selectionContainer), this._register(this._linkifier2.onShowLinkUnderline(((e) => this._handleLinkHover(e)))), this._register(this._linkifier2.onHideLinkUnderline(((e) => this._handleLinkLeave(e)))), this._register((0, u.toDisposable)((() => {
									this._element.classList.remove(p + this._terminalClass), this._rowContainer.remove(), this._selectionContainer.remove(), this._widthCache.dispose(), this._themeStyleElement.remove(), this._dimensionsStyleElement.remove();
								}))), this._widthCache = new o.WidthCache(this._document, this._helperContainer), this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold), this._setDefaultSpacing();
							}
							_updateDimensions() {
								const e = this._coreBrowserService.dpr;
								this.dimensions.device.char.width = this._charSizeService.width * e, this.dimensions.device.char.height = Math.ceil(this._charSizeService.height * e), this.dimensions.device.cell.width = this.dimensions.device.char.width + Math.round(this._optionsService.rawOptions.letterSpacing), this.dimensions.device.cell.height = Math.floor(this.dimensions.device.char.height * this._optionsService.rawOptions.lineHeight), this.dimensions.device.char.left = 0, this.dimensions.device.char.top = 0, this.dimensions.device.canvas.width = this.dimensions.device.cell.width * this._bufferService.cols, this.dimensions.device.canvas.height = this.dimensions.device.cell.height * this._bufferService.rows, this.dimensions.css.canvas.width = Math.round(this.dimensions.device.canvas.width / e), this.dimensions.css.canvas.height = Math.round(this.dimensions.device.canvas.height / e), this.dimensions.css.cell.width = this.dimensions.css.canvas.width / this._bufferService.cols, this.dimensions.css.cell.height = this.dimensions.css.canvas.height / this._bufferService.rows;
								for (const e of this._rowElements) e.style.width = `${this.dimensions.css.canvas.width}px`, e.style.height = `${this.dimensions.css.cell.height}px`, e.style.lineHeight = `${this.dimensions.css.cell.height}px`, e.style.overflow = "hidden";
								this._dimensionsStyleElement || (this._dimensionsStyleElement = this._document.createElement("style"), this._screenElement.appendChild(this._dimensionsStyleElement));
								const t = `${this._terminalSelector} .${g} span { display: inline-block; height: 100%; vertical-align: top;}`;
								this._dimensionsStyleElement.textContent = t, this._selectionContainer.style.height = this._viewportElement.style.height, this._screenElement.style.width = `${this.dimensions.css.canvas.width}px`, this._screenElement.style.height = `${this.dimensions.css.canvas.height}px`;
							}
							_injectCss(e) {
								this._themeStyleElement || (this._themeStyleElement = this._document.createElement("style"), this._screenElement.appendChild(this._themeStyleElement));
								let t = `${this._terminalSelector} .${g} { pointer-events: none; color: ${e.foreground.css}; font-family: ${this._optionsService.rawOptions.fontFamily}; font-size: ${this._optionsService.rawOptions.fontSize}px; font-kerning: none; white-space: pre}`;
								t += `${this._terminalSelector} .${g} .xterm-dim { color: ${d.color.multiplyOpacity(e.foreground, .5).css};}`, t += `${this._terminalSelector} span:not(.xterm-bold) { font-weight: ${this._optionsService.rawOptions.fontWeight};}${this._terminalSelector} span.xterm-bold { font-weight: ${this._optionsService.rawOptions.fontWeightBold};}${this._terminalSelector} span.xterm-italic { font-style: italic;}`;
								const i = `blink_underline_${this._terminalClass}`, s = `blink_bar_${this._terminalClass}`, r = `blink_block_${this._terminalClass}`;
								t += `@keyframes ${i} { 50% {  border-bottom-style: hidden; }}`, t += `@keyframes ${s} { 50% {  box-shadow: none; }}`, t += `@keyframes ${r} { 0% {  background-color: ${e.cursor.css};  color: ${e.cursorAccent.css}; } 50% {  background-color: inherit;  color: ${e.cursor.css}; }}`, t += `${this._terminalSelector} .${g}.${S} .xterm-cursor.xterm-cursor-blink.xterm-cursor-underline { animation: ${i} 1s step-end infinite;}${this._terminalSelector} .${g}.${S} .xterm-cursor.xterm-cursor-blink.xterm-cursor-bar { animation: ${s} 1s step-end infinite;}${this._terminalSelector} .${g}.${S} .xterm-cursor.xterm-cursor-blink.xterm-cursor-block { animation: ${r} 1s step-end infinite;}${this._terminalSelector} .${g} .xterm-cursor.xterm-cursor-block { background-color: ${e.cursor.css}; color: ${e.cursorAccent.css};}${this._terminalSelector} .${g} .xterm-cursor.xterm-cursor-block:not(.xterm-cursor-blink) { background-color: ${e.cursor.css} !important; color: ${e.cursorAccent.css} !important;}${this._terminalSelector} .${g} .xterm-cursor.xterm-cursor-outline { outline: 1px solid ${e.cursor.css}; outline-offset: -1px;}${this._terminalSelector} .${g} .xterm-cursor.xterm-cursor-bar { box-shadow: ${this._optionsService.rawOptions.cursorWidth}px 0 0 ${e.cursor.css} inset;}${this._terminalSelector} .${g} .xterm-cursor.xterm-cursor-underline { border-bottom: 1px ${e.cursor.css}; border-bottom-style: solid; height: calc(100% - 1px);}`, t += `${this._terminalSelector} .${b} { position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none;}${this._terminalSelector}.focus .${b} div { position: absolute; background-color: ${e.selectionBackgroundOpaque.css};}${this._terminalSelector} .${b} div { position: absolute; background-color: ${e.selectionInactiveBackgroundOpaque.css};}`;
								for (const [i, s] of e.ansi.entries()) t += `${this._terminalSelector} .${m}${i} { color: ${s.css}; }${this._terminalSelector} .${m}${i}.xterm-dim { color: ${d.color.multiplyOpacity(s, .5).css}; }${this._terminalSelector} .${v}${i} { background-color: ${s.css}; }`;
								t += `${this._terminalSelector} .${m}${a.INVERTED_DEFAULT_COLOR} { color: ${d.color.opaque(e.background).css}; }${this._terminalSelector} .${m}${a.INVERTED_DEFAULT_COLOR}.xterm-dim { color: ${d.color.multiplyOpacity(d.color.opaque(e.background), .5).css}; }${this._terminalSelector} .${v}${a.INVERTED_DEFAULT_COLOR} { background-color: ${e.foreground.css}; }`, this._themeStyleElement.textContent = t;
							}
							_setDefaultSpacing() {
								const e = this.dimensions.css.cell.width - this._widthCache.get("W", !1, !1);
								this._rowContainer.style.letterSpacing = `${e}px`, this._rowFactory.defaultSpacing = e;
							}
							handleDevicePixelRatioChange() {
								this._updateDimensions(), this._widthCache.clear(), this._setDefaultSpacing();
							}
							_refreshRowElements(e, t) {
								for (let e = this._rowElements.length; e <= t; e++) {
									const e = this._document.createElement("div");
									this._rowContainer.appendChild(e), this._rowElements.push(e);
								}
								for (; this._rowElements.length > t;) this._rowContainer.removeChild(this._rowElements.pop());
							}
							handleResize(e, t) {
								this._refreshRowElements(e, t), this._updateDimensions(), this.handleSelectionChanged(this._selectionRenderModel.selectionStart, this._selectionRenderModel.selectionEnd, this._selectionRenderModel.columnSelectMode);
							}
							handleCharSizeChanged() {
								this._updateDimensions(), this._widthCache.clear(), this._setDefaultSpacing();
							}
							handleBlur() {
								this._rowContainer.classList.remove(S), this.renderRows(0, this._bufferService.rows - 1);
							}
							handleFocus() {
								this._rowContainer.classList.add(S), this.renderRows(this._bufferService.buffer.y, this._bufferService.buffer.y);
							}
							handleSelectionChanged(e, t, i) {
								if (this._selectionContainer.replaceChildren(), this._rowFactory.handleSelectionChanged(e, t, i), this.renderRows(0, this._bufferService.rows - 1), !e || !t) return;
								if (this._selectionRenderModel.update(this._terminal, e, t, i), !this._selectionRenderModel.hasSelection) return;
								const s = this._selectionRenderModel.viewportStartRow, r = this._selectionRenderModel.viewportEndRow, n = this._selectionRenderModel.viewportCappedStartRow, o = this._selectionRenderModel.viewportCappedEndRow, a = this._document.createDocumentFragment();
								if (i) {
									const i = e[0] > t[0];
									a.appendChild(this._createSelectionElement(n, i ? t[0] : e[0], i ? e[0] : t[0], o - n + 1));
								} else {
									const i = s === n ? e[0] : 0, l = n === r ? t[0] : this._bufferService.cols;
									a.appendChild(this._createSelectionElement(n, i, l));
									const h = o - n - 1;
									if (a.appendChild(this._createSelectionElement(n + 1, 0, this._bufferService.cols, h)), n !== o) {
										const e = r === o ? t[0] : this._bufferService.cols;
										a.appendChild(this._createSelectionElement(o, 0, e));
									}
								}
								this._selectionContainer.appendChild(a);
							}
							_createSelectionElement(e, t, i, s = 1) {
								const r = this._document.createElement("div"), n = t * this.dimensions.css.cell.width;
								let o = this.dimensions.css.cell.width * (i - t);
								return n + o > this.dimensions.css.canvas.width && (o = this.dimensions.css.canvas.width - n), r.style.height = s * this.dimensions.css.cell.height + "px", r.style.top = e * this.dimensions.css.cell.height + "px", r.style.left = `${n}px`, r.style.width = `${o}px`, r;
							}
							handleCursorMove() {}
							_handleOptionsChanged() {
								this._updateDimensions(), this._injectCss(this._themeService.colors), this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold), this._setDefaultSpacing();
							}
							clear() {
								for (const e of this._rowElements) e.replaceChildren();
							}
							renderRows(e, t) {
								const i = this._bufferService.buffer, s = i.ybase + i.y, r = Math.min(i.x, this._bufferService.cols - 1), n = this._coreService.decPrivateModes.cursorBlink ?? this._optionsService.rawOptions.cursorBlink, o = this._coreService.decPrivateModes.cursorStyle ?? this._optionsService.rawOptions.cursorStyle, a = this._optionsService.rawOptions.cursorInactiveStyle;
								for (let l = e; l <= t; l++) {
									const e = l + i.ydisp, t = this._rowElements[l], h = i.lines.get(e);
									if (!t || !h) break;
									t.replaceChildren(...this._rowFactory.createRow(h, e, e === s, o, a, r, n, this.dimensions.css.cell.width, this._widthCache, -1, -1));
								}
							}
							get _terminalSelector() {
								return `.${p}${this._terminalClass}`;
							}
							_handleLinkHover(e) {
								this._setCellUnderline(e.x1, e.x2, e.y1, e.y2, e.cols, !0);
							}
							_handleLinkLeave(e) {
								this._setCellUnderline(e.x1, e.x2, e.y1, e.y2, e.cols, !1);
							}
							_setCellUnderline(e, t, i, s, r, n) {
								i < 0 && (e = 0), s < 0 && (t = 0);
								const o = this._bufferService.rows - 1;
								i = Math.max(Math.min(i, o), 0), s = Math.max(Math.min(s, o), 0), r = Math.min(r, this._bufferService.cols);
								const a = this._bufferService.buffer, l = a.ybase + a.y, h = Math.min(a.x, r - 1), c = this._optionsService.rawOptions.cursorBlink, d = this._optionsService.rawOptions.cursorStyle, u = this._optionsService.rawOptions.cursorInactiveStyle;
								for (let o = i; o <= s; ++o) {
									const _ = o + a.ydisp, f = this._rowElements[o], p = a.lines.get(_);
									if (!f || !p) break;
									f.replaceChildren(...this._rowFactory.createRow(p, _, _ === l, d, u, h, c, this.dimensions.css.cell.width, this._widthCache, n ? o === i ? e : 0 : -1, n ? (o === s ? t : r) - 1 : -1));
								}
							}
						};
						t.DomRenderer = y, t.DomRenderer = y = s([
							r(7, _.IInstantiationService),
							r(8, c.ICharSizeService),
							r(9, _.IOptionsService),
							r(10, _.IBufferService),
							r(11, _.ICoreService),
							r(12, c.ICoreBrowserService),
							r(13, c.IThemeService)
						], y);
					},
					1433: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.DomRendererRowFactory = void 0;
						const n = i(9176), o = i(8938), a = i(3055), l = i(6501), h = i(4103), c = i(7098), d = i(945), u = i(6181), _ = i(5451);
						let f = class {
							constructor(e, t, i, s, r, n, o) {
								this._document = e, this._characterJoinerService = t, this._optionsService = i, this._coreBrowserService = s, this._coreService = r, this._decorationService = n, this._themeService = o, this._workCell = new a.CellData(), this._columnSelectMode = !1, this.defaultSpacing = 0;
							}
							handleSelectionChanged(e, t, i) {
								this._selectionStart = e, this._selectionEnd = t, this._columnSelectMode = i;
							}
							createRow(e, t, i, s, r, a, l, c, u, f, g) {
								const m = [], v = this._characterJoinerService.getJoinedCharacters(t), S = this._themeService.colors;
								let b, C = e.getNoBgTrimmedLength();
								i && C < a + 1 && (C = a + 1);
								let y = 0, w = "", E = 0, D = 0, L = 0, R = 0, A = !1, T = 0, k = !1, M = 0, O = 0;
								const I = [], P = -1 !== f && -1 !== g;
								for (let x = 0; x < C; x++) {
									e.loadCell(x, this._workCell);
									let C = this._workCell.getWidth();
									if (0 === C) continue;
									let B = !1, N = x >= O, U = x, F = this._workCell;
									if (v.length > 0 && x === v[0][0] && N) {
										const s = v.shift(), r = this._isCellInSelection(s[0], t);
										for (E = s[0] + 1; E < s[1]; E++) N &&= r === this._isCellInSelection(E, t);
										N &&= !i || a < s[0] || a >= s[1], N ? (B = !0, F = new d.JoinedCellData(this._workCell, e.translateToString(!0, s[0], s[1]), s[1] - s[0]), U = s[1] - 1, C = F.getWidth()) : O = s[1];
									}
									const W = this._isCellInSelection(x, t), H = i && x === a, K = P && x >= f && x <= g;
									let z = !1;
									this._decorationService.forEachDecorationAtCell(x, t, void 0, ((e) => {
										z = !0;
									}));
									let j = F.getChars() || o.WHITESPACE_CELL_CHAR;
									if (" " === j && (F.isUnderline() || F.isOverline()) && (j = "\xA0"), M = C * c - u.get(j, F.isBold(), F.isItalic()), b) {
										if (y && (W && k || !W && !k && F.bg === D) && (W && k && S.selectionForeground || F.fg === L) && F.extended.ext === R && K === A && M === T && !H && !B && !z && N) {
											F.isInvisible() ? w += o.WHITESPACE_CELL_CHAR : w += j, y++;
											continue;
										}
										y && (b.textContent = w), b = this._document.createElement("span"), y = 0, w = "";
									} else b = this._document.createElement("span");
									if (D = F.bg, L = F.fg, R = F.extended.ext, A = K, T = M, k = W, B && a >= x && a <= U && (a = x), !this._coreService.isCursorHidden && H && this._coreService.isCursorInitialized) {
										if (I.push("xterm-cursor"), this._coreBrowserService.isFocused) l && I.push("xterm-cursor-blink"), I.push("bar" === s ? "xterm-cursor-bar" : "underline" === s ? "xterm-cursor-underline" : "xterm-cursor-block");
										else if (r) switch (r) {
											case "outline":
												I.push("xterm-cursor-outline");
												break;
											case "block":
												I.push("xterm-cursor-block");
												break;
											case "bar":
												I.push("xterm-cursor-bar");
												break;
											case "underline": I.push("xterm-cursor-underline");
										}
									}
									if (F.isBold() && I.push("xterm-bold"), F.isItalic() && I.push("xterm-italic"), F.isDim() && I.push("xterm-dim"), w = F.isInvisible() ? o.WHITESPACE_CELL_CHAR : F.getChars() || o.WHITESPACE_CELL_CHAR, F.isUnderline() && (I.push(`xterm-underline-${F.extended.underlineStyle}`), " " === w && (w = "\xA0"), !F.isUnderlineColorDefault())) if (F.isUnderlineColorRGB()) b.style.textDecorationColor = `rgb(${_.AttributeData.toColorRGB(F.getUnderlineColor()).join(",")})`;
									else {
										let e = F.getUnderlineColor();
										this._optionsService.rawOptions.drawBoldTextInBrightColors && F.isBold() && e < 8 && (e += 8), b.style.textDecorationColor = S.ansi[e].css;
									}
									F.isOverline() && (I.push("xterm-overline"), " " === w && (w = "\xA0")), F.isStrikethrough() && I.push("xterm-strikethrough"), K && (b.style.textDecoration = "underline");
									let $ = F.getFgColor(), V = F.getFgColorMode(), G = F.getBgColor(), q = F.getBgColorMode();
									const X = !!F.isInverse();
									if (X) {
										const e = $;
										$ = G, G = e;
										const t = V;
										V = q, q = t;
									}
									let Y, Z, J, Q = !1;
									switch (this._decorationService.forEachDecorationAtCell(x, t, void 0, ((e) => {
										"top" !== e.options.layer && Q || (e.backgroundColorRGB && (q = 50331648, G = e.backgroundColorRGB.rgba >> 8 & 16777215, Y = e.backgroundColorRGB), e.foregroundColorRGB && (V = 50331648, $ = e.foregroundColorRGB.rgba >> 8 & 16777215, Z = e.foregroundColorRGB), Q = "top" === e.options.layer);
									})), !Q && W && (Y = this._coreBrowserService.isFocused ? S.selectionBackgroundOpaque : S.selectionInactiveBackgroundOpaque, G = Y.rgba >> 8 & 16777215, q = 50331648, Q = !0, S.selectionForeground && (V = 50331648, $ = S.selectionForeground.rgba >> 8 & 16777215, Z = S.selectionForeground)), Q && I.push("xterm-decoration-top"), q) {
										case 16777216:
										case 33554432:
											J = S.ansi[G], I.push(`xterm-bg-${G}`);
											break;
										case 50331648:
											J = h.channels.toColor(G >> 16, G >> 8 & 255, 255 & G), this._addStyle(b, `background-color:#${p((G >>> 0).toString(16), "0", 6)}`);
											break;
										default: X ? (J = S.foreground, I.push(`xterm-bg-${n.INVERTED_DEFAULT_COLOR}`)) : J = S.background;
									}
									switch (Y || F.isDim() && (Y = h.color.multiplyOpacity(J, .5)), V) {
										case 16777216:
										case 33554432:
											F.isBold() && $ < 8 && this._optionsService.rawOptions.drawBoldTextInBrightColors && ($ += 8), this._applyMinimumContrast(b, J, S.ansi[$], F, Y, void 0) || I.push(`xterm-fg-${$}`);
											break;
										case 50331648:
											const e = h.channels.toColor($ >> 16 & 255, $ >> 8 & 255, 255 & $);
											this._applyMinimumContrast(b, J, e, F, Y, Z) || this._addStyle(b, `color:#${p($.toString(16), "0", 6)}`);
											break;
										default: this._applyMinimumContrast(b, J, S.foreground, F, Y, Z) || X && I.push(`xterm-fg-${n.INVERTED_DEFAULT_COLOR}`);
									}
									I.length && (b.className = I.join(" "), I.length = 0), H || B || z || !N ? b.textContent = w : y++, M !== this.defaultSpacing && (b.style.letterSpacing = `${M}px`), m.push(b), x = U;
								}
								return b && y && (b.textContent = w), m;
							}
							_applyMinimumContrast(e, t, i, s, r, n) {
								if (1 === this._optionsService.rawOptions.minimumContrastRatio || (0, u.treatGlyphAsBackgroundColor)(s.getCode())) return !1;
								const o = this._getContrastCache(s);
								let a;
								if (r || n || (a = o.getColor(t.rgba, i.rgba)), void 0 === a) {
									const e = this._optionsService.rawOptions.minimumContrastRatio / (s.isDim() ? 2 : 1);
									a = h.color.ensureContrastRatio(r || t, n || i, e), o.setColor((r || t).rgba, (n || i).rgba, a ?? null);
								}
								return !!a && (this._addStyle(e, `color:${a.css}`), !0);
							}
							_getContrastCache(e) {
								return e.isDim() ? this._themeService.colors.halfContrastCache : this._themeService.colors.contrastCache;
							}
							_addStyle(e, t) {
								e.setAttribute("style", `${e.getAttribute("style") || ""}${t};`);
							}
							_isCellInSelection(e, t) {
								const i = this._selectionStart, s = this._selectionEnd;
								return !(!i || !s) && (this._columnSelectMode ? i[0] <= s[0] ? e >= i[0] && t >= i[1] && e < s[0] && t <= s[1] : e < i[0] && t >= i[1] && e >= s[0] && t <= s[1] : t > i[1] && t < s[1] || i[1] === s[1] && t === i[1] && e >= i[0] && e < s[0] || i[1] < s[1] && t === s[1] && e < s[0] || i[1] < s[1] && t === i[1] && e >= i[0]);
							}
						};
						function p(e, t, i) {
							for (; e.length < i;) e = t + e;
							return e;
						}
						t.DomRendererRowFactory = f, t.DomRendererRowFactory = f = s([
							r(1, c.ICharacterJoinerService),
							r(2, l.IOptionsService),
							r(3, c.ICoreBrowserService),
							r(4, l.ICoreService),
							r(5, l.IDecorationService),
							r(6, c.IThemeService)
						], f);
					},
					2744: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.WidthCache = void 0, t.WidthCache = class {
							constructor(e, t) {
								this._flat = /* @__PURE__ */ new Float32Array(256), this._font = "", this._fontSize = 0, this._weight = "normal", this._weightBold = "bold", this._measureElements = [], this._container = e.createElement("div"), this._container.classList.add("xterm-width-cache-measure-container"), this._container.setAttribute("aria-hidden", "true"), this._container.style.whiteSpace = "pre", this._container.style.fontKerning = "none";
								const i = e.createElement("span");
								i.classList.add("xterm-char-measure-element");
								const s = e.createElement("span");
								s.classList.add("xterm-char-measure-element"), s.style.fontWeight = "bold";
								const r = e.createElement("span");
								r.classList.add("xterm-char-measure-element"), r.style.fontStyle = "italic";
								const n = e.createElement("span");
								n.classList.add("xterm-char-measure-element"), n.style.fontWeight = "bold", n.style.fontStyle = "italic", this._measureElements = [
									i,
									s,
									r,
									n
								], this._container.appendChild(i), this._container.appendChild(s), this._container.appendChild(r), this._container.appendChild(n), t.appendChild(this._container), this.clear();
							}
							dispose() {
								this._container.remove(), this._measureElements.length = 0, this._holey = void 0;
							}
							clear() {
								this._flat.fill(-9999), this._holey = /* @__PURE__ */ new Map();
							}
							setFont(e, t, i, s) {
								e === this._font && t === this._fontSize && i === this._weight && s === this._weightBold || (this._font = e, this._fontSize = t, this._weight = i, this._weightBold = s, this._container.style.fontFamily = this._font, this._container.style.fontSize = `${this._fontSize}px`, this._measureElements[0].style.fontWeight = `${i}`, this._measureElements[1].style.fontWeight = `${s}`, this._measureElements[2].style.fontWeight = `${i}`, this._measureElements[3].style.fontWeight = `${s}`, this.clear());
							}
							get(e, t, i) {
								let s = 0;
								if (!t && !i && 1 === e.length && (s = e.charCodeAt(0)) < 256) {
									if (-9999 !== this._flat[s]) return this._flat[s];
									const t = this._measure(e, 0);
									return t > 0 && (this._flat[s] = t), t;
								}
								let r = e;
								t && (r += "B"), i && (r += "I");
								let n = this._holey.get(r);
								if (void 0 === n) {
									let s = 0;
									t && (s |= 1), i && (s |= 2), n = this._measure(e, s), n > 0 && this._holey.set(r, n);
								}
								return n;
							}
							_measure(e, t) {
								const i = this._measureElements[t];
								return i.textContent = e.repeat(32), i.offsetWidth / 32;
							}
						};
					},
					9176: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.INVERTED_DEFAULT_COLOR = void 0, t.INVERTED_DEFAULT_COLOR = 257;
					},
					6181: (e, t) => {
						function i(e) {
							return 57508 <= e && e <= 57558;
						}
						function s(e) {
							return e >= 128512 && e <= 128591 || e >= 127744 && e <= 128511 || e >= 128640 && e <= 128767 || e >= 9728 && e <= 9983 || e >= 9984 && e <= 10175 || e >= 65024 && e <= 65039 || e >= 129280 && e <= 129535 || e >= 127462 && e <= 127487;
						}
						Object.defineProperty(t, "__esModule", { value: !0 }), t.throwIfFalsy = function(e) {
							if (!e) throw new Error("value must not be falsy");
							return e;
						}, t.isPowerlineGlyph = i, t.isRestrictedPowerlineGlyph = function(e) {
							return 57520 <= e && e <= 57527;
						}, t.isEmoji = s, t.allowRescaling = function(e, t, r, n) {
							return 1 === t && r > Math.ceil(1.5 * n) && void 0 !== e && e > 255 && !s(e) && !i(e) && !function(e) {
								return 57344 <= e && e <= 63743;
							}(e);
						}, t.treatGlyphAsBackgroundColor = function(e) {
							return i(e) || function(e) {
								return 9472 <= e && e <= 9631;
							}(e);
						}, t.createRenderDimensions = function() {
							return {
								css: {
									canvas: {
										width: 0,
										height: 0
									},
									cell: {
										width: 0,
										height: 0
									}
								},
								device: {
									canvas: {
										width: 0,
										height: 0
									},
									cell: {
										width: 0,
										height: 0
									},
									char: {
										width: 0,
										height: 0,
										left: 0,
										top: 0
									}
								}
							};
						}, t.computeNextVariantOffset = function(e, t, i = 0) {
							return (e - (2 * Math.round(t) - i)) % (2 * Math.round(t));
						};
					},
					2274: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.createSelectionRenderModel = function() {
							return new i();
						};
						class i {
							constructor() {
								this.clear();
							}
							clear() {
								this.hasSelection = !1, this.columnSelectMode = !1, this.viewportStartRow = 0, this.viewportEndRow = 0, this.viewportCappedStartRow = 0, this.viewportCappedEndRow = 0, this.startCol = 0, this.endCol = 0, this.selectionStart = void 0, this.selectionEnd = void 0;
							}
							update(e, t, i, s = !1) {
								if (this.selectionStart = t, this.selectionEnd = i, !t || !i || t[0] === i[0] && t[1] === i[1]) return void this.clear();
								const r = e.buffers.active.ydisp, n = t[1] - r, o = i[1] - r, a = Math.max(n, 0), l = Math.min(o, e.rows - 1);
								a >= e.rows || l < 0 ? this.clear() : (this.hasSelection = !0, this.columnSelectMode = s, this.viewportStartRow = n, this.viewportEndRow = o, this.viewportCappedStartRow = a, this.viewportCappedEndRow = l, this.startCol = t[0], this.endCol = i[0]);
							}
							isCellSelected(e, t, i) {
								return !!this.hasSelection && (i -= e.buffer.active.viewportY, this.columnSelectMode ? this.startCol <= this.endCol ? t >= this.startCol && i >= this.viewportCappedStartRow && t < this.endCol && i <= this.viewportCappedEndRow : t < this.startCol && i >= this.viewportCappedStartRow && t >= this.endCol && i <= this.viewportCappedEndRow : i > this.viewportStartRow && i < this.viewportEndRow || this.viewportStartRow === this.viewportEndRow && i === this.viewportStartRow && t >= this.startCol && t < this.endCol || this.viewportStartRow < this.viewportEndRow && i === this.viewportEndRow && t < this.endCol || this.viewportStartRow < this.viewportEndRow && i === this.viewportStartRow && t >= this.startCol);
							}
						}
					},
					5959: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.SelectionModel = void 0, t.SelectionModel = class {
							constructor(e) {
								this._bufferService = e, this.isSelectAllActive = !1, this.selectionStartLength = 0;
							}
							clearSelection() {
								this.selectionStart = void 0, this.selectionEnd = void 0, this.isSelectAllActive = !1, this.selectionStartLength = 0;
							}
							get finalSelectionStart() {
								return this.isSelectAllActive ? [0, 0] : this.selectionEnd && this.selectionStart && this.areSelectionValuesReversed() ? this.selectionEnd : this.selectionStart;
							}
							get finalSelectionEnd() {
								if (this.isSelectAllActive) return [this._bufferService.cols, this._bufferService.buffer.ybase + this._bufferService.rows - 1];
								if (this.selectionStart) {
									if (!this.selectionEnd || this.areSelectionValuesReversed()) {
										const e = this.selectionStart[0] + this.selectionStartLength;
										return e > this._bufferService.cols ? e % this._bufferService.cols == 0 ? [this._bufferService.cols, this.selectionStart[1] + Math.floor(e / this._bufferService.cols) - 1] : [e % this._bufferService.cols, this.selectionStart[1] + Math.floor(e / this._bufferService.cols)] : [e, this.selectionStart[1]];
									}
									if (this.selectionStartLength && this.selectionEnd[1] === this.selectionStart[1]) {
										const e = this.selectionStart[0] + this.selectionStartLength;
										return e > this._bufferService.cols ? [e % this._bufferService.cols, this.selectionStart[1] + Math.floor(e / this._bufferService.cols)] : [Math.max(e, this.selectionEnd[0]), this.selectionEnd[1]];
									}
									return this.selectionEnd;
								}
							}
							areSelectionValuesReversed() {
								const e = this.selectionStart, t = this.selectionEnd;
								return !(!e || !t) && (e[1] > t[1] || e[1] === t[1] && e[0] > t[0]);
							}
							handleTrim(e) {
								return this.selectionStart && (this.selectionStart[1] -= e), this.selectionEnd && (this.selectionEnd[1] -= e), this.selectionEnd && this.selectionEnd[1] < 0 ? (this.clearSelection(), !0) : (this.selectionStart && this.selectionStart[1] < 0 && (this.selectionStart[1] = 0), !1);
							}
						};
					},
					4792: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.CharSizeService = void 0;
						const n = i(6501), o = i(7150), a = i(802);
						let l = class extends o.Disposable {
							get hasValidSize() {
								return this.width > 0 && this.height > 0;
							}
							constructor(e, t, i) {
								super(), this._optionsService = i, this.width = 0, this.height = 0, this._onCharSizeChange = this._register(new a.Emitter()), this.onCharSizeChange = this._onCharSizeChange.event;
								try {
									this._measureStrategy = this._register(new d(this._optionsService));
								} catch {
									this._measureStrategy = this._register(new c(e, t, this._optionsService));
								}
								this._register(this._optionsService.onMultipleOptionChange(["fontFamily", "fontSize"], (() => this.measure())));
							}
							measure() {
								const e = this._measureStrategy.measure();
								e.width === this.width && e.height === this.height || (this.width = e.width, this.height = e.height, this._onCharSizeChange.fire());
							}
						};
						t.CharSizeService = l, t.CharSizeService = l = s([r(2, n.IOptionsService)], l);
						class h extends o.Disposable {
							constructor() {
								super(...arguments), this._result = {
									width: 0,
									height: 0
								};
							}
							_validateAndSet(e, t) {
								void 0 !== e && e > 0 && void 0 !== t && t > 0 && (this._result.width = e, this._result.height = t);
							}
						}
						class c extends h {
							constructor(e, t, i) {
								super(), this._document = e, this._parentElement = t, this._optionsService = i, this._measureElement = this._document.createElement("span"), this._measureElement.classList.add("xterm-char-measure-element"), this._measureElement.textContent = "W".repeat(32), this._measureElement.setAttribute("aria-hidden", "true"), this._measureElement.style.whiteSpace = "pre", this._measureElement.style.fontKerning = "none", this._parentElement.appendChild(this._measureElement);
							}
							measure() {
								return this._measureElement.style.fontFamily = this._optionsService.rawOptions.fontFamily, this._measureElement.style.fontSize = `${this._optionsService.rawOptions.fontSize}px`, this._validateAndSet(Number(this._measureElement.offsetWidth) / 32, Number(this._measureElement.offsetHeight)), this._result;
							}
						}
						class d extends h {
							constructor(e) {
								super(), this._optionsService = e, this._canvas = new OffscreenCanvas(100, 100), this._ctx = this._canvas.getContext("2d");
								const t = this._ctx.measureText("W");
								if (!("width" in t && "fontBoundingBoxAscent" in t && "fontBoundingBoxDescent" in t)) throw new Error("Required font metrics not supported");
							}
							measure() {
								this._ctx.font = `${this._optionsService.rawOptions.fontSize}px ${this._optionsService.rawOptions.fontFamily}`;
								const e = this._ctx.measureText("W");
								return this._validateAndSet(e.width, e.fontBoundingBoxAscent + e.fontBoundingBoxDescent), this._result;
							}
						}
					},
					945: function(e, t, i) {
						var s, r = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, n = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.CharacterJoinerService = t.JoinedCellData = void 0;
						const o = i(5451), a = i(8938), l = i(3055), h = i(6501);
						class c extends o.AttributeData {
							constructor(e, t, i) {
								super(), this.content = 0, this.combinedData = "", this.fg = e.fg, this.bg = e.bg, this.combinedData = t, this._width = i;
							}
							isCombined() {
								return 2097152;
							}
							getWidth() {
								return this._width;
							}
							getChars() {
								return this.combinedData;
							}
							getCode() {
								return 2097151;
							}
							setFromCharData(e) {
								throw new Error("not implemented");
							}
							getAsCharData() {
								return [
									this.fg,
									this.getChars(),
									this.getWidth(),
									this.getCode()
								];
							}
						}
						t.JoinedCellData = c;
						let d = s = class {
							constructor(e) {
								this._bufferService = e, this._characterJoiners = [], this._nextCharacterJoinerId = 0, this._workCell = new l.CellData();
							}
							register(e) {
								const t = {
									id: this._nextCharacterJoinerId++,
									handler: e
								};
								return this._characterJoiners.push(t), t.id;
							}
							deregister(e) {
								for (let t = 0; t < this._characterJoiners.length; t++) if (this._characterJoiners[t].id === e) return this._characterJoiners.splice(t, 1), !0;
								return !1;
							}
							getJoinedCharacters(e) {
								if (0 === this._characterJoiners.length) return [];
								const t = this._bufferService.buffer.lines.get(e);
								if (!t || 0 === t.length) return [];
								const i = [], s = t.translateToString(!0);
								let r = 0, n = 0, o = 0, l = t.getFg(0), h = t.getBg(0);
								for (let e = 0; e < t.getTrimmedLength(); e++) if (t.loadCell(e, this._workCell), 0 !== this._workCell.getWidth()) {
									if (this._workCell.fg !== l || this._workCell.bg !== h) {
										if (e - r > 1) {
											const e = this._getJoinedRanges(s, o, n, t, r);
											for (let t = 0; t < e.length; t++) i.push(e[t]);
										}
										r = e, o = n, l = this._workCell.fg, h = this._workCell.bg;
									}
									n += this._workCell.getChars().length || a.WHITESPACE_CELL_CHAR.length;
								}
								if (this._bufferService.cols - r > 1) {
									const e = this._getJoinedRanges(s, o, n, t, r);
									for (let t = 0; t < e.length; t++) i.push(e[t]);
								}
								return i;
							}
							_getJoinedRanges(e, t, i, r, n) {
								const o = e.substring(t, i);
								let a = [];
								try {
									a = this._characterJoiners[0].handler(o);
								} catch (e) {
									console.error(e);
								}
								for (let e = 1; e < this._characterJoiners.length; e++) try {
									const t = this._characterJoiners[e].handler(o);
									for (let e = 0; e < t.length; e++) s._mergeRanges(a, t[e]);
								} catch (e) {
									console.error(e);
								}
								return this._stringRangesToCellRanges(a, r, n), a;
							}
							_stringRangesToCellRanges(e, t, i) {
								let s = 0, r = !1, n = 0, o = e[s];
								if (o) {
									for (let l = i; l < this._bufferService.cols; l++) {
										const i = t.getWidth(l), h = t.getString(l).length || a.WHITESPACE_CELL_CHAR.length;
										if (0 !== i) {
											if (!r && o[0] <= n && (o[0] = l, r = !0), o[1] <= n) {
												if (o[1] = l, o = e[++s], !o) break;
												o[0] <= n ? (o[0] = l, r = !0) : r = !1;
											}
											n += h;
										}
									}
									o && (o[1] = this._bufferService.cols);
								}
							}
							static _mergeRanges(e, t) {
								let i = !1;
								for (let s = 0; s < e.length; s++) {
									const r = e[s];
									if (i) {
										if (t[1] <= r[0]) return e[s - 1][1] = t[1], e;
										if (t[1] <= r[1]) return e[s - 1][1] = Math.max(t[1], r[1]), e.splice(s, 1), e;
										e.splice(s, 1), s--;
									} else {
										if (t[1] <= r[0]) return e.splice(s, 0, t), e;
										if (t[1] <= r[1]) return r[0] = Math.min(t[0], r[0]), e;
										t[0] < r[1] && (r[0] = Math.min(t[0], r[0]), i = !0);
									}
								}
								return i ? e[e.length - 1][1] = t[1] : e.push(t), e;
							}
						};
						t.CharacterJoinerService = d, t.CharacterJoinerService = d = s = r([n(0, h.IBufferService)], d);
					},
					9574: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.CoreBrowserService = void 0;
						const s = i(802), r = i(7093), n = i(7150);
						class o extends n.Disposable {
							constructor(e, t, i) {
								super(), this._textarea = e, this._window = t, this.mainDocument = i, this._isFocused = !1, this._cachedIsFocused = void 0, this._screenDprMonitor = this._register(new a(this._window)), this._onDprChange = this._register(new s.Emitter()), this.onDprChange = this._onDprChange.event, this._onWindowChange = this._register(new s.Emitter()), this.onWindowChange = this._onWindowChange.event, this._register(this.onWindowChange(((e) => this._screenDprMonitor.setWindow(e)))), this._register(s.Event.forward(this._screenDprMonitor.onDprChange, this._onDprChange)), this._register((0, r.addDisposableListener)(this._textarea, "focus", (() => this._isFocused = !0))), this._register((0, r.addDisposableListener)(this._textarea, "blur", (() => this._isFocused = !1)));
							}
							get window() {
								return this._window;
							}
							set window(e) {
								this._window !== e && (this._window = e, this._onWindowChange.fire(this._window));
							}
							get dpr() {
								return this.window.devicePixelRatio;
							}
							get isFocused() {
								return void 0 === this._cachedIsFocused && (this._cachedIsFocused = this._isFocused && this._textarea.ownerDocument.hasFocus(), queueMicrotask((() => this._cachedIsFocused = void 0))), this._cachedIsFocused;
							}
						}
						t.CoreBrowserService = o;
						class a extends n.Disposable {
							constructor(e) {
								super(), this._parentWindow = e, this._windowResizeListener = this._register(new n.MutableDisposable()), this._onDprChange = this._register(new s.Emitter()), this.onDprChange = this._onDprChange.event, this._outerListener = () => this._setDprAndFireIfDiffers(), this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio, this._updateDpr(), this._setWindowResizeListener(), this._register((0, n.toDisposable)((() => this.clearListener())));
							}
							setWindow(e) {
								this._parentWindow = e, this._setWindowResizeListener(), this._setDprAndFireIfDiffers();
							}
							_setWindowResizeListener() {
								this._windowResizeListener.value = (0, r.addDisposableListener)(this._parentWindow, "resize", (() => this._setDprAndFireIfDiffers()));
							}
							_setDprAndFireIfDiffers() {
								this._parentWindow.devicePixelRatio !== this._currentDevicePixelRatio && this._onDprChange.fire(this._parentWindow.devicePixelRatio), this._updateDpr();
							}
							_updateDpr() {
								this._outerListener && (this._resolutionMediaMatchList?.removeListener(this._outerListener), this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio, this._resolutionMediaMatchList = this._parentWindow.matchMedia(`screen and (resolution: ${this._parentWindow.devicePixelRatio}dppx)`), this._resolutionMediaMatchList.addListener(this._outerListener));
							}
							clearListener() {
								this._resolutionMediaMatchList && this._outerListener && (this._resolutionMediaMatchList.removeListener(this._outerListener), this._resolutionMediaMatchList = void 0, this._outerListener = void 0);
							}
						}
					},
					9820: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.LinkProviderService = void 0;
						const s = i(7150);
						class r extends s.Disposable {
							constructor() {
								super(), this.linkProviders = [], this._register((0, s.toDisposable)((() => this.linkProviders.length = 0)));
							}
							registerLinkProvider(e) {
								return this.linkProviders.push(e), { dispose: () => {
									const t = this.linkProviders.indexOf(e);
									-1 !== t && this.linkProviders.splice(t, 1);
								} };
							}
						}
						t.LinkProviderService = r;
					},
					9784: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.MouseService = void 0;
						const n = i(7098), o = i(5251);
						let a = class {
							constructor(e, t) {
								this._renderService = e, this._charSizeService = t;
							}
							getCoords(e, t, i, s, r) {
								return (0, o.getCoords)(window, e, t, i, s, this._charSizeService.hasValidSize, this._renderService.dimensions.css.cell.width, this._renderService.dimensions.css.cell.height, r);
							}
							getMouseReportCoords(e, t) {
								const i = (0, o.getCoordsRelativeToElement)(window, e, t);
								if (this._charSizeService.hasValidSize) return i[0] = Math.min(Math.max(i[0], 0), this._renderService.dimensions.css.canvas.width - 1), i[1] = Math.min(Math.max(i[1], 0), this._renderService.dimensions.css.canvas.height - 1), {
									col: Math.floor(i[0] / this._renderService.dimensions.css.cell.width),
									row: Math.floor(i[1] / this._renderService.dimensions.css.cell.height),
									x: Math.floor(i[0]),
									y: Math.floor(i[1])
								};
							}
						};
						t.MouseService = a, t.MouseService = a = s([r(0, n.IRenderService), r(1, n.ICharSizeService)], a);
					},
					5783: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.RenderService = void 0;
						const n = i(4852), o = i(7098), a = i(7150), l = i(6168), h = i(6501), c = i(802);
						let d = class extends a.Disposable {
							get dimensions() {
								return this._renderer.value.dimensions;
							}
							constructor(e, t, i, s, r, o, h, d, _) {
								super(), this._rowCount = e, this._optionsService = i, this._charSizeService = s, this._coreService = r, this._coreBrowserService = d, this._renderer = this._register(new a.MutableDisposable()), this._pausedResizeTask = new l.DebouncedIdleTask(), this._observerDisposable = this._register(new a.MutableDisposable()), this._isPaused = !1, this._needsFullRefresh = !1, this._isNextRenderRedrawOnly = !0, this._needsSelectionRefresh = !1, this._canvasWidth = 0, this._canvasHeight = 0, this._selectionState = {
									start: void 0,
									end: void 0,
									columnSelectMode: !1
								}, this._onDimensionsChange = this._register(new c.Emitter()), this.onDimensionsChange = this._onDimensionsChange.event, this._onRenderedViewportChange = this._register(new c.Emitter()), this.onRenderedViewportChange = this._onRenderedViewportChange.event, this._onRender = this._register(new c.Emitter()), this.onRender = this._onRender.event, this._onRefreshRequest = this._register(new c.Emitter()), this.onRefreshRequest = this._onRefreshRequest.event, this._renderDebouncer = new n.RenderDebouncer(((e, t) => this._renderRows(e, t)), this._coreBrowserService), this._register(this._renderDebouncer), this._syncOutputHandler = new u(this._coreBrowserService, this._coreService, (() => this._fullRefresh())), this._register((0, a.toDisposable)((() => this._syncOutputHandler.dispose()))), this._register(this._coreBrowserService.onDprChange((() => this.handleDevicePixelRatioChange()))), this._register(h.onResize((() => this._fullRefresh()))), this._register(h.buffers.onBufferActivate((() => this._renderer.value?.clear()))), this._register(this._optionsService.onOptionChange((() => this._handleOptionsChanged()))), this._register(this._charSizeService.onCharSizeChange((() => this.handleCharSizeChanged()))), this._register(o.onDecorationRegistered((() => this._fullRefresh()))), this._register(o.onDecorationRemoved((() => this._fullRefresh()))), this._register(this._optionsService.onMultipleOptionChange([
									"customGlyphs",
									"drawBoldTextInBrightColors",
									"letterSpacing",
									"lineHeight",
									"fontFamily",
									"fontSize",
									"fontWeight",
									"fontWeightBold",
									"minimumContrastRatio",
									"rescaleOverlappingGlyphs"
								], (() => {
									this.clear(), this.handleResize(h.cols, h.rows), this._fullRefresh();
								}))), this._register(this._optionsService.onMultipleOptionChange(["cursorBlink", "cursorStyle"], (() => this.refreshRows(h.buffer.y, h.buffer.y, !0)))), this._register(_.onChangeColors((() => this._fullRefresh()))), this._registerIntersectionObserver(this._coreBrowserService.window, t), this._register(this._coreBrowserService.onWindowChange(((e) => this._registerIntersectionObserver(e, t))));
							}
							_registerIntersectionObserver(e, t) {
								if ("IntersectionObserver" in e) {
									const i = new e.IntersectionObserver(((e) => this._handleIntersectionChange(e[e.length - 1])), { threshold: 0 });
									i.observe(t), this._observerDisposable.value = (0, a.toDisposable)((() => i.disconnect()));
								}
							}
							_handleIntersectionChange(e) {
								this._isPaused = void 0 === e.isIntersecting ? 0 === e.intersectionRatio : !e.isIntersecting, this._isPaused || this._charSizeService.hasValidSize || this._charSizeService.measure(), !this._isPaused && this._needsFullRefresh && (this._pausedResizeTask.flush(), this.refreshRows(0, this._rowCount - 1), this._needsFullRefresh = !1);
							}
							refreshRows(e, t, i = !1) {
								if (this._isPaused) return void (this._needsFullRefresh = !0);
								if (this._coreService.decPrivateModes.synchronizedOutput) return void this._syncOutputHandler.bufferRows(e, t);
								const s = this._syncOutputHandler.flush();
								s && (e = Math.min(e, s.start), t = Math.max(t, s.end)), i || (this._isNextRenderRedrawOnly = !1), this._renderDebouncer.refresh(e, t, this._rowCount);
							}
							_renderRows(e, t) {
								this._renderer.value && (this._coreService.decPrivateModes.synchronizedOutput ? this._syncOutputHandler.bufferRows(e, t) : (e = Math.min(e, this._rowCount - 1), t = Math.min(t, this._rowCount - 1), this._renderer.value.renderRows(e, t), this._needsSelectionRefresh && (this._renderer.value.handleSelectionChanged(this._selectionState.start, this._selectionState.end, this._selectionState.columnSelectMode), this._needsSelectionRefresh = !1), this._isNextRenderRedrawOnly || this._onRenderedViewportChange.fire({
									start: e,
									end: t
								}), this._onRender.fire({
									start: e,
									end: t
								}), this._isNextRenderRedrawOnly = !0));
							}
							resize(e, t) {
								this._rowCount = t, this._fireOnCanvasResize();
							}
							_handleOptionsChanged() {
								this._renderer.value && (this.refreshRows(0, this._rowCount - 1), this._fireOnCanvasResize());
							}
							_fireOnCanvasResize() {
								this._renderer.value && (this._renderer.value.dimensions.css.canvas.width === this._canvasWidth && this._renderer.value.dimensions.css.canvas.height === this._canvasHeight || this._onDimensionsChange.fire(this._renderer.value.dimensions));
							}
							hasRenderer() {
								return !!this._renderer.value;
							}
							setRenderer(e) {
								this._renderer.value = e, this._renderer.value && (this._renderer.value.onRequestRedraw(((e) => this.refreshRows(e.start, e.end, !0))), this._needsSelectionRefresh = !0, this._fullRefresh());
							}
							addRefreshCallback(e) {
								return this._renderDebouncer.addRefreshCallback(e);
							}
							_fullRefresh() {
								this._isPaused ? this._needsFullRefresh = !0 : this.refreshRows(0, this._rowCount - 1);
							}
							clearTextureAtlas() {
								this._renderer.value && (this._renderer.value.clearTextureAtlas?.(), this._fullRefresh());
							}
							handleDevicePixelRatioChange() {
								this._charSizeService.measure(), this._renderer.value && (this._renderer.value.handleDevicePixelRatioChange(), this.refreshRows(0, this._rowCount - 1));
							}
							handleResize(e, t) {
								this._renderer.value && (this._isPaused ? this._pausedResizeTask.set((() => this._renderer.value?.handleResize(e, t))) : this._renderer.value.handleResize(e, t), this._fullRefresh());
							}
							handleCharSizeChanged() {
								this._renderer.value?.handleCharSizeChanged();
							}
							handleBlur() {
								this._renderer.value?.handleBlur();
							}
							handleFocus() {
								this._renderer.value?.handleFocus();
							}
							handleSelectionChanged(e, t, i) {
								this._selectionState.start = e, this._selectionState.end = t, this._selectionState.columnSelectMode = i, this._renderer.value?.handleSelectionChanged(e, t, i);
							}
							handleCursorMove() {
								this._renderer.value?.handleCursorMove();
							}
							clear() {
								this._renderer.value?.clear();
							}
						};
						t.RenderService = d, t.RenderService = d = s([
							r(2, h.IOptionsService),
							r(3, o.ICharSizeService),
							r(4, h.ICoreService),
							r(5, h.IDecorationService),
							r(6, h.IBufferService),
							r(7, o.ICoreBrowserService),
							r(8, o.IThemeService)
						], d);
						class u {
							constructor(e, t, i) {
								this._coreBrowserService = e, this._coreService = t, this._onTimeout = i, this._start = 0, this._end = 0, this._isBuffering = !1;
							}
							bufferRows(e, t) {
								this._isBuffering ? (this._start = Math.min(this._start, e), this._end = Math.max(this._end, t)) : (this._start = e, this._end = t, this._isBuffering = !0), void 0 === this._timeout && (this._timeout = this._coreBrowserService.window.setTimeout((() => {
									this._timeout = void 0, this._coreService.decPrivateModes.synchronizedOutput = !1, this._onTimeout();
								}), 1e3));
							}
							flush() {
								if (void 0 !== this._timeout && (this._coreBrowserService.window.clearTimeout(this._timeout), this._timeout = void 0), !this._isBuffering) return;
								const e = {
									start: this._start,
									end: this._end
								};
								return this._isBuffering = !1, e;
							}
							dispose() {
								void 0 !== this._timeout && (this._coreBrowserService.window.clearTimeout(this._timeout), this._timeout = void 0);
							}
						}
					},
					2079: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.SelectionService = void 0;
						const n = i(5251), o = i(9686), a = i(5959), l = i(7098), h = i(7150), c = i(701), d = i(9384), u = i(3055), _ = i(6501), f = i(802), g = new RegExp(String.fromCharCode(160), "g");
						let m = class extends h.Disposable {
							constructor(e, t, i, s, r, n, o, l, c) {
								super(), this._element = e, this._screenElement = t, this._linkifier = i, this._bufferService = s, this._coreService = r, this._mouseService = n, this._optionsService = o, this._renderService = l, this._coreBrowserService = c, this._dragScrollAmount = 0, this._enabled = !0, this._workCell = new u.CellData(), this._mouseDownTimeStamp = 0, this._oldHasSelection = !1, this._oldSelectionStart = void 0, this._oldSelectionEnd = void 0, this._onLinuxMouseSelection = this._register(new f.Emitter()), this.onLinuxMouseSelection = this._onLinuxMouseSelection.event, this._onRedrawRequest = this._register(new f.Emitter()), this.onRequestRedraw = this._onRedrawRequest.event, this._onSelectionChange = this._register(new f.Emitter()), this.onSelectionChange = this._onSelectionChange.event, this._onRequestScrollLines = this._register(new f.Emitter()), this.onRequestScrollLines = this._onRequestScrollLines.event, this._mouseMoveListener = (e) => this._handleMouseMove(e), this._mouseUpListener = (e) => this._handleMouseUp(e), this._coreService.onUserInput((() => {
									this.hasSelection && this.clearSelection();
								})), this._trimListener = this._bufferService.buffer.lines.onTrim(((e) => this._handleTrim(e))), this._register(this._bufferService.buffers.onBufferActivate(((e) => this._handleBufferActivate(e)))), this.enable(), this._model = new a.SelectionModel(this._bufferService), this._activeSelectionMode = 0, this._register((0, h.toDisposable)((() => {
									this._removeMouseDownListeners();
								}))), this._register(this._bufferService.onResize(((e) => {
									e.rowsChanged && this.clearSelection();
								})));
							}
							reset() {
								this.clearSelection();
							}
							disable() {
								this.clearSelection(), this._enabled = !1;
							}
							enable() {
								this._enabled = !0;
							}
							get selectionStart() {
								return this._model.finalSelectionStart;
							}
							get selectionEnd() {
								return this._model.finalSelectionEnd;
							}
							get hasSelection() {
								const e = this._model.finalSelectionStart, t = this._model.finalSelectionEnd;
								return !(!e || !t || e[0] === t[0] && e[1] === t[1]);
							}
							get selectionText() {
								const e = this._model.finalSelectionStart, t = this._model.finalSelectionEnd;
								if (!e || !t) return "";
								const i = this._bufferService.buffer, s = [];
								if (3 === this._activeSelectionMode) {
									if (e[0] === t[0]) return "";
									const r = e[0] < t[0] ? e[0] : t[0], n = e[0] < t[0] ? t[0] : e[0];
									for (let o = e[1]; o <= t[1]; o++) {
										const e = i.translateBufferLineToString(o, !0, r, n);
										s.push(e);
									}
								} else {
									const r = e[1] === t[1] ? t[0] : void 0;
									s.push(i.translateBufferLineToString(e[1], !0, e[0], r));
									for (let r = e[1] + 1; r <= t[1] - 1; r++) {
										const e = i.lines.get(r), t = i.translateBufferLineToString(r, !0);
										e?.isWrapped ? s[s.length - 1] += t : s.push(t);
									}
									if (e[1] !== t[1]) {
										const e = i.lines.get(t[1]), r = i.translateBufferLineToString(t[1], !0, 0, t[0]);
										e && e.isWrapped ? s[s.length - 1] += r : s.push(r);
									}
								}
								return s.map(((e) => e.replace(g, " "))).join(c.isWindows ? "\r\n" : "\n");
							}
							clearSelection() {
								this._model.clearSelection(), this._removeMouseDownListeners(), this.refresh(), this._onSelectionChange.fire();
							}
							refresh(e) {
								this._refreshAnimationFrame || (this._refreshAnimationFrame = this._coreBrowserService.window.requestAnimationFrame((() => this._refresh()))), c.isLinux && e && this.selectionText.length && this._onLinuxMouseSelection.fire(this.selectionText);
							}
							_refresh() {
								this._refreshAnimationFrame = void 0, this._onRedrawRequest.fire({
									start: this._model.finalSelectionStart,
									end: this._model.finalSelectionEnd,
									columnSelectMode: 3 === this._activeSelectionMode
								});
							}
							_isClickInSelection(e) {
								const t = this._getMouseBufferCoords(e), i = this._model.finalSelectionStart, s = this._model.finalSelectionEnd;
								return !!(i && s && t) && this._areCoordsInSelection(t, i, s);
							}
							isCellInSelection(e, t) {
								const i = this._model.finalSelectionStart, s = this._model.finalSelectionEnd;
								return !(!i || !s) && this._areCoordsInSelection([e, t], i, s);
							}
							_areCoordsInSelection(e, t, i) {
								return e[1] > t[1] && e[1] < i[1] || t[1] === i[1] && e[1] === t[1] && e[0] >= t[0] && e[0] < i[0] || t[1] < i[1] && e[1] === i[1] && e[0] < i[0] || t[1] < i[1] && e[1] === t[1] && e[0] >= t[0];
							}
							_selectWordAtCursor(e, t) {
								const i = this._linkifier.currentLink?.link?.range;
								if (i) return this._model.selectionStart = [i.start.x - 1, i.start.y - 1], this._model.selectionStartLength = (0, d.getRangeLength)(i, this._bufferService.cols), this._model.selectionEnd = void 0, !0;
								const s = this._getMouseBufferCoords(e);
								return !!s && (this._selectWordAt(s, t), this._model.selectionEnd = void 0, !0);
							}
							selectAll() {
								this._model.isSelectAllActive = !0, this.refresh(), this._onSelectionChange.fire();
							}
							selectLines(e, t) {
								this._model.clearSelection(), e = Math.max(e, 0), t = Math.min(t, this._bufferService.buffer.lines.length - 1), this._model.selectionStart = [0, e], this._model.selectionEnd = [this._bufferService.cols, t], this.refresh(), this._onSelectionChange.fire();
							}
							_handleTrim(e) {
								this._model.handleTrim(e) && this.refresh();
							}
							_getMouseBufferCoords(e) {
								const t = this._mouseService.getCoords(e, this._screenElement, this._bufferService.cols, this._bufferService.rows, !0);
								if (t) return t[0]--, t[1]--, t[1] += this._bufferService.buffer.ydisp, t;
							}
							_getMouseEventScrollAmount(e) {
								let t = (0, n.getCoordsRelativeToElement)(this._coreBrowserService.window, e, this._screenElement)[1];
								const i = this._renderService.dimensions.css.canvas.height;
								return t >= 0 && t <= i ? 0 : (t > i && (t -= i), t = Math.min(Math.max(t, -50), 50), t /= 50, t / Math.abs(t) + Math.round(14 * t));
							}
							shouldForceSelection(e) {
								return c.isMac ? e.altKey && this._optionsService.rawOptions.macOptionClickForcesSelection : e.shiftKey;
							}
							handleMouseDown(e) {
								if (this._mouseDownTimeStamp = e.timeStamp, (2 !== e.button || !this.hasSelection) && 0 === e.button) {
									if (!this._enabled) {
										if (!this.shouldForceSelection(e)) return;
										e.stopPropagation();
									}
									e.preventDefault(), this._dragScrollAmount = 0, this._enabled && e.shiftKey ? this._handleIncrementalClick(e) : 1 === e.detail ? this._handleSingleClick(e) : 2 === e.detail ? this._handleDoubleClick(e) : 3 === e.detail && this._handleTripleClick(e), this._addMouseDownListeners(), this.refresh(!0);
								}
							}
							_addMouseDownListeners() {
								this._screenElement.ownerDocument && (this._screenElement.ownerDocument.addEventListener("mousemove", this._mouseMoveListener), this._screenElement.ownerDocument.addEventListener("mouseup", this._mouseUpListener)), this._dragScrollIntervalTimer = this._coreBrowserService.window.setInterval((() => this._dragScroll()), 50);
							}
							_removeMouseDownListeners() {
								this._screenElement.ownerDocument && (this._screenElement.ownerDocument.removeEventListener("mousemove", this._mouseMoveListener), this._screenElement.ownerDocument.removeEventListener("mouseup", this._mouseUpListener)), this._coreBrowserService.window.clearInterval(this._dragScrollIntervalTimer), this._dragScrollIntervalTimer = void 0;
							}
							_handleIncrementalClick(e) {
								this._model.selectionStart && (this._model.selectionEnd = this._getMouseBufferCoords(e));
							}
							_handleSingleClick(e) {
								if (this._model.selectionStartLength = 0, this._model.isSelectAllActive = !1, this._activeSelectionMode = this.shouldColumnSelect(e) ? 3 : 0, this._model.selectionStart = this._getMouseBufferCoords(e), !this._model.selectionStart) return;
								this._model.selectionEnd = void 0;
								const t = this._bufferService.buffer.lines.get(this._model.selectionStart[1]);
								t && t.length !== this._model.selectionStart[0] && 0 === t.hasWidth(this._model.selectionStart[0]) && this._model.selectionStart[0]++;
							}
							_handleDoubleClick(e) {
								this._selectWordAtCursor(e, !0) && (this._activeSelectionMode = 1);
							}
							_handleTripleClick(e) {
								const t = this._getMouseBufferCoords(e);
								t && (this._activeSelectionMode = 2, this._selectLineAt(t[1]));
							}
							shouldColumnSelect(e) {
								return e.altKey && !(c.isMac && this._optionsService.rawOptions.macOptionClickForcesSelection);
							}
							_handleMouseMove(e) {
								if (e.stopImmediatePropagation(), !this._model.selectionStart) return;
								const t = this._model.selectionEnd ? [this._model.selectionEnd[0], this._model.selectionEnd[1]] : null;
								if (this._model.selectionEnd = this._getMouseBufferCoords(e), !this._model.selectionEnd) return void this.refresh(!0);
								2 === this._activeSelectionMode ? this._model.selectionEnd[1] < this._model.selectionStart[1] ? this._model.selectionEnd[0] = 0 : this._model.selectionEnd[0] = this._bufferService.cols : 1 === this._activeSelectionMode && this._selectToWordAt(this._model.selectionEnd), this._dragScrollAmount = this._getMouseEventScrollAmount(e), 3 !== this._activeSelectionMode && (this._dragScrollAmount > 0 ? this._model.selectionEnd[0] = this._bufferService.cols : this._dragScrollAmount < 0 && (this._model.selectionEnd[0] = 0));
								const i = this._bufferService.buffer;
								if (this._model.selectionEnd[1] < i.lines.length) {
									const e = i.lines.get(this._model.selectionEnd[1]);
									e && 0 === e.hasWidth(this._model.selectionEnd[0]) && this._model.selectionEnd[0] < this._bufferService.cols && this._model.selectionEnd[0]++;
								}
								t && t[0] === this._model.selectionEnd[0] && t[1] === this._model.selectionEnd[1] || this.refresh(!0);
							}
							_dragScroll() {
								if (this._model.selectionEnd && this._model.selectionStart && this._dragScrollAmount) {
									this._onRequestScrollLines.fire({
										amount: this._dragScrollAmount,
										suppressScrollEvent: !1
									});
									const e = this._bufferService.buffer;
									this._dragScrollAmount > 0 ? (3 !== this._activeSelectionMode && (this._model.selectionEnd[0] = this._bufferService.cols), this._model.selectionEnd[1] = Math.min(e.ydisp + this._bufferService.rows, e.lines.length - 1)) : (3 !== this._activeSelectionMode && (this._model.selectionEnd[0] = 0), this._model.selectionEnd[1] = e.ydisp), this.refresh();
								}
							}
							_handleMouseUp(e) {
								const t = e.timeStamp - this._mouseDownTimeStamp;
								if (this._removeMouseDownListeners(), this.selectionText.length <= 1 && t < 500 && e.altKey && this._optionsService.rawOptions.altClickMovesCursor) {
									if (this._bufferService.buffer.ybase === this._bufferService.buffer.ydisp) {
										const t = this._mouseService.getCoords(e, this._element, this._bufferService.cols, this._bufferService.rows, !1);
										if (t && void 0 !== t[0] && void 0 !== t[1]) {
											const e = (0, o.moveToCellSequence)(t[0] - 1, t[1] - 1, this._bufferService, this._coreService.decPrivateModes.applicationCursorKeys);
											this._coreService.triggerDataEvent(e, !0);
										}
									}
								} else this._fireEventIfSelectionChanged();
							}
							_fireEventIfSelectionChanged() {
								const e = this._model.finalSelectionStart, t = this._model.finalSelectionEnd, i = !(!e || !t || e[0] === t[0] && e[1] === t[1]);
								i ? e && t && (this._oldSelectionStart && this._oldSelectionEnd && e[0] === this._oldSelectionStart[0] && e[1] === this._oldSelectionStart[1] && t[0] === this._oldSelectionEnd[0] && t[1] === this._oldSelectionEnd[1] || this._fireOnSelectionChange(e, t, i)) : this._oldHasSelection && this._fireOnSelectionChange(e, t, i);
							}
							_fireOnSelectionChange(e, t, i) {
								this._oldSelectionStart = e, this._oldSelectionEnd = t, this._oldHasSelection = i, this._onSelectionChange.fire();
							}
							_handleBufferActivate(e) {
								this.clearSelection(), this._trimListener.dispose(), this._trimListener = e.activeBuffer.lines.onTrim(((e) => this._handleTrim(e)));
							}
							_convertViewportColToCharacterIndex(e, t) {
								let i = t;
								for (let s = 0; t >= s; s++) {
									const r = e.loadCell(s, this._workCell).getChars().length;
									0 === this._workCell.getWidth() ? i-- : r > 1 && t !== s && (i += r - 1);
								}
								return i;
							}
							setSelection(e, t, i) {
								this._model.clearSelection(), this._removeMouseDownListeners(), this._model.selectionStart = [e, t], this._model.selectionStartLength = i, this.refresh(), this._fireEventIfSelectionChanged();
							}
							rightClickSelect(e) {
								this._isClickInSelection(e) || (this._selectWordAtCursor(e, !1) && this.refresh(!0), this._fireEventIfSelectionChanged());
							}
							_getWordAt(e, t, i = !0, s = !0) {
								if (e[0] >= this._bufferService.cols) return;
								const r = this._bufferService.buffer, n = r.lines.get(e[1]);
								if (!n) return;
								const o = r.translateBufferLineToString(e[1], !1);
								let a = this._convertViewportColToCharacterIndex(n, e[0]), l = a;
								const h = e[0] - a;
								let c = 0, d = 0, u = 0, _ = 0;
								if (" " === o.charAt(a)) {
									for (; a > 0 && " " === o.charAt(a - 1);) a--;
									for (; l < o.length && " " === o.charAt(l + 1);) l++;
								} else {
									let t = e[0], i = e[0];
									0 === n.getWidth(t) && (c++, t--), 2 === n.getWidth(i) && (d++, i++);
									const s = n.getString(i).length;
									for (s > 1 && (_ += s - 1, l += s - 1); t > 0 && a > 0 && !this._isCharWordSeparator(n.loadCell(t - 1, this._workCell));) {
										n.loadCell(t - 1, this._workCell);
										const e = this._workCell.getChars().length;
										0 === this._workCell.getWidth() ? (c++, t--) : e > 1 && (u += e - 1, a -= e - 1), a--, t--;
									}
									for (; i < n.length && l + 1 < o.length && !this._isCharWordSeparator(n.loadCell(i + 1, this._workCell));) {
										n.loadCell(i + 1, this._workCell);
										const e = this._workCell.getChars().length;
										2 === this._workCell.getWidth() ? (d++, i++) : e > 1 && (_ += e - 1, l += e - 1), l++, i++;
									}
								}
								l++;
								let f = a + h - c + u, p = Math.min(this._bufferService.cols, l - a + c + d - u - _);
								if (t || "" !== o.slice(a, l).trim()) {
									if (i && 0 === f && 32 !== n.getCodePoint(0)) {
										const t = r.lines.get(e[1] - 1);
										if (t && n.isWrapped && 32 !== t.getCodePoint(this._bufferService.cols - 1)) {
											const t = this._getWordAt([this._bufferService.cols - 1, e[1] - 1], !1, !0, !1);
											if (t) {
												const e = this._bufferService.cols - t.start;
												f -= e, p += e;
											}
										}
									}
									if (s && f + p === this._bufferService.cols && 32 !== n.getCodePoint(this._bufferService.cols - 1)) {
										const t = r.lines.get(e[1] + 1);
										if (t?.isWrapped && 32 !== t.getCodePoint(0)) {
											const t = this._getWordAt([0, e[1] + 1], !1, !1, !0);
											t && (p += t.length);
										}
									}
									return {
										start: f,
										length: p
									};
								}
							}
							_selectWordAt(e, t) {
								const i = this._getWordAt(e, t);
								if (i) {
									for (; i.start < 0;) i.start += this._bufferService.cols, e[1]--;
									this._model.selectionStart = [i.start, e[1]], this._model.selectionStartLength = i.length;
								}
							}
							_selectToWordAt(e) {
								const t = this._getWordAt(e, !0);
								if (t) {
									let i = e[1];
									for (; t.start < 0;) t.start += this._bufferService.cols, i--;
									if (!this._model.areSelectionValuesReversed()) for (; t.start + t.length > this._bufferService.cols;) t.length -= this._bufferService.cols, i++;
									this._model.selectionEnd = [this._model.areSelectionValuesReversed() ? t.start : t.start + t.length, i];
								}
							}
							_isCharWordSeparator(e) {
								return 0 !== e.getWidth() && this._optionsService.rawOptions.wordSeparator.indexOf(e.getChars()) >= 0;
							}
							_selectLineAt(e) {
								const t = this._bufferService.buffer.getWrappedRangeForLine(e), i = {
									start: {
										x: 0,
										y: t.first
									},
									end: {
										x: this._bufferService.cols - 1,
										y: t.last
									}
								};
								this._model.selectionStart = [0, t.first], this._model.selectionEnd = void 0, this._model.selectionStartLength = (0, d.getRangeLength)(i, this._bufferService.cols);
							}
						};
						t.SelectionService = m, t.SelectionService = m = s([
							r(3, _.IBufferService),
							r(4, _.ICoreService),
							r(5, l.IMouseService),
							r(6, _.IOptionsService),
							r(7, l.IRenderService),
							r(8, l.ICoreBrowserService)
						], m);
					},
					7098: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.ILinkProviderService = t.IThemeService = t.ICharacterJoinerService = t.ISelectionService = t.IRenderService = t.IMouseService = t.ICoreBrowserService = t.ICharSizeService = void 0;
						const s = i(6201);
						t.ICharSizeService = (0, s.createDecorator)("CharSizeService"), t.ICoreBrowserService = (0, s.createDecorator)("CoreBrowserService"), t.IMouseService = (0, s.createDecorator)("MouseService"), t.IRenderService = (0, s.createDecorator)("RenderService"), t.ISelectionService = (0, s.createDecorator)("SelectionService"), t.ICharacterJoinerService = (0, s.createDecorator)("CharacterJoinerService"), t.IThemeService = (0, s.createDecorator)("ThemeService"), t.ILinkProviderService = (0, s.createDecorator)("LinkProviderService");
					},
					9078: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.ThemeService = void 0;
						const n = i(7174), o = i(9302), a = i(4103), l = i(7150), h = i(6501), c = i(802), d = a.css.toColor("#ffffff"), u = a.css.toColor("#000000"), _ = a.css.toColor("#ffffff"), f = u, p = {
							css: "rgba(255, 255, 255, 0.3)",
							rgba: 4294967117
						}, g = d;
						let m = class extends l.Disposable {
							get colors() {
								return this._colors;
							}
							constructor(e) {
								super(), this._optionsService = e, this._contrastCache = new n.ColorContrastCache(), this._halfContrastCache = new n.ColorContrastCache(), this._onChangeColors = this._register(new c.Emitter()), this.onChangeColors = this._onChangeColors.event, this._colors = {
									foreground: d,
									background: u,
									cursor: _,
									cursorAccent: f,
									selectionForeground: void 0,
									selectionBackgroundTransparent: p,
									selectionBackgroundOpaque: a.color.blend(u, p),
									selectionInactiveBackgroundTransparent: p,
									selectionInactiveBackgroundOpaque: a.color.blend(u, p),
									scrollbarSliderBackground: a.color.opacity(d, .2),
									scrollbarSliderHoverBackground: a.color.opacity(d, .4),
									scrollbarSliderActiveBackground: a.color.opacity(d, .5),
									overviewRulerBorder: d,
									ansi: o.DEFAULT_ANSI_COLORS.slice(),
									contrastCache: this._contrastCache,
									halfContrastCache: this._halfContrastCache
								}, this._updateRestoreColors(), this._setTheme(this._optionsService.rawOptions.theme), this._register(this._optionsService.onSpecificOptionChange("minimumContrastRatio", (() => this._contrastCache.clear()))), this._register(this._optionsService.onSpecificOptionChange("theme", (() => this._setTheme(this._optionsService.rawOptions.theme))));
							}
							_setTheme(e = {}) {
								const t = this._colors;
								if (t.foreground = v(e.foreground, d), t.background = v(e.background, u), t.cursor = a.color.blend(t.background, v(e.cursor, _)), t.cursorAccent = a.color.blend(t.background, v(e.cursorAccent, f)), t.selectionBackgroundTransparent = v(e.selectionBackground, p), t.selectionBackgroundOpaque = a.color.blend(t.background, t.selectionBackgroundTransparent), t.selectionInactiveBackgroundTransparent = v(e.selectionInactiveBackground, t.selectionBackgroundTransparent), t.selectionInactiveBackgroundOpaque = a.color.blend(t.background, t.selectionInactiveBackgroundTransparent), t.selectionForeground = e.selectionForeground ? v(e.selectionForeground, a.NULL_COLOR) : void 0, t.selectionForeground === a.NULL_COLOR && (t.selectionForeground = void 0), a.color.isOpaque(t.selectionBackgroundTransparent)) t.selectionBackgroundTransparent = a.color.opacity(t.selectionBackgroundTransparent, .3);
								if (a.color.isOpaque(t.selectionInactiveBackgroundTransparent)) t.selectionInactiveBackgroundTransparent = a.color.opacity(t.selectionInactiveBackgroundTransparent, .3);
								if (t.scrollbarSliderBackground = v(e.scrollbarSliderBackground, a.color.opacity(t.foreground, .2)), t.scrollbarSliderHoverBackground = v(e.scrollbarSliderHoverBackground, a.color.opacity(t.foreground, .4)), t.scrollbarSliderActiveBackground = v(e.scrollbarSliderActiveBackground, a.color.opacity(t.foreground, .5)), t.overviewRulerBorder = v(e.overviewRulerBorder, g), t.ansi = o.DEFAULT_ANSI_COLORS.slice(), t.ansi[0] = v(e.black, o.DEFAULT_ANSI_COLORS[0]), t.ansi[1] = v(e.red, o.DEFAULT_ANSI_COLORS[1]), t.ansi[2] = v(e.green, o.DEFAULT_ANSI_COLORS[2]), t.ansi[3] = v(e.yellow, o.DEFAULT_ANSI_COLORS[3]), t.ansi[4] = v(e.blue, o.DEFAULT_ANSI_COLORS[4]), t.ansi[5] = v(e.magenta, o.DEFAULT_ANSI_COLORS[5]), t.ansi[6] = v(e.cyan, o.DEFAULT_ANSI_COLORS[6]), t.ansi[7] = v(e.white, o.DEFAULT_ANSI_COLORS[7]), t.ansi[8] = v(e.brightBlack, o.DEFAULT_ANSI_COLORS[8]), t.ansi[9] = v(e.brightRed, o.DEFAULT_ANSI_COLORS[9]), t.ansi[10] = v(e.brightGreen, o.DEFAULT_ANSI_COLORS[10]), t.ansi[11] = v(e.brightYellow, o.DEFAULT_ANSI_COLORS[11]), t.ansi[12] = v(e.brightBlue, o.DEFAULT_ANSI_COLORS[12]), t.ansi[13] = v(e.brightMagenta, o.DEFAULT_ANSI_COLORS[13]), t.ansi[14] = v(e.brightCyan, o.DEFAULT_ANSI_COLORS[14]), t.ansi[15] = v(e.brightWhite, o.DEFAULT_ANSI_COLORS[15]), e.extendedAnsi) {
									const i = Math.min(t.ansi.length - 16, e.extendedAnsi.length);
									for (let s = 0; s < i; s++) t.ansi[s + 16] = v(e.extendedAnsi[s], o.DEFAULT_ANSI_COLORS[s + 16]);
								}
								this._contrastCache.clear(), this._halfContrastCache.clear(), this._updateRestoreColors(), this._onChangeColors.fire(this.colors);
							}
							restoreColor(e) {
								this._restoreColor(e), this._onChangeColors.fire(this.colors);
							}
							_restoreColor(e) {
								if (void 0 !== e) switch (e) {
									case 256:
										this._colors.foreground = this._restoreColors.foreground;
										break;
									case 257:
										this._colors.background = this._restoreColors.background;
										break;
									case 258:
										this._colors.cursor = this._restoreColors.cursor;
										break;
									default: this._colors.ansi[e] = this._restoreColors.ansi[e];
								}
								else for (let e = 0; e < this._restoreColors.ansi.length; ++e) this._colors.ansi[e] = this._restoreColors.ansi[e];
							}
							modifyColors(e) {
								e(this._colors), this._onChangeColors.fire(this.colors);
							}
							_updateRestoreColors() {
								this._restoreColors = {
									foreground: this._colors.foreground,
									background: this._colors.background,
									cursor: this._colors.cursor,
									ansi: this._colors.ansi.slice()
								};
							}
						};
						function v(e, t) {
							if (void 0 !== e) try {
								return a.css.toColor(e);
							} catch {}
							return t;
						}
						t.ThemeService = m, t.ThemeService = m = s([r(0, h.IOptionsService)], m);
					},
					5639: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.CircularList = void 0;
						const s = i(7150), r = i(802);
						class n extends s.Disposable {
							constructor(e) {
								super(), this._maxLength = e, this.onDeleteEmitter = this._register(new r.Emitter()), this.onDelete = this.onDeleteEmitter.event, this.onInsertEmitter = this._register(new r.Emitter()), this.onInsert = this.onInsertEmitter.event, this.onTrimEmitter = this._register(new r.Emitter()), this.onTrim = this.onTrimEmitter.event, this._array = new Array(this._maxLength), this._startIndex = 0, this._length = 0;
							}
							get maxLength() {
								return this._maxLength;
							}
							set maxLength(e) {
								if (this._maxLength === e) return;
								const t = new Array(e);
								for (let i = 0; i < Math.min(e, this.length); i++) t[i] = this._array[this._getCyclicIndex(i)];
								this._array = t, this._maxLength = e, this._startIndex = 0;
							}
							get length() {
								return this._length;
							}
							set length(e) {
								if (e > this._length) for (let t = this._length; t < e; t++) this._array[t] = void 0;
								this._length = e;
							}
							get(e) {
								return this._array[this._getCyclicIndex(e)];
							}
							set(e, t) {
								this._array[this._getCyclicIndex(e)] = t;
							}
							push(e) {
								this._array[this._getCyclicIndex(this._length)] = e, this._length === this._maxLength ? (this._startIndex = ++this._startIndex % this._maxLength, this.onTrimEmitter.fire(1)) : this._length++;
							}
							recycle() {
								if (this._length !== this._maxLength) throw new Error("Can only recycle when the buffer is full");
								return this._startIndex = ++this._startIndex % this._maxLength, this.onTrimEmitter.fire(1), this._array[this._getCyclicIndex(this._length - 1)];
							}
							get isFull() {
								return this._length === this._maxLength;
							}
							pop() {
								return this._array[this._getCyclicIndex(this._length-- - 1)];
							}
							splice(e, t, ...i) {
								if (t) {
									for (let i = e; i < this._length - t; i++) this._array[this._getCyclicIndex(i)] = this._array[this._getCyclicIndex(i + t)];
									this._length -= t, this.onDeleteEmitter.fire({
										index: e,
										amount: t
									});
								}
								for (let t = this._length - 1; t >= e; t--) this._array[this._getCyclicIndex(t + i.length)] = this._array[this._getCyclicIndex(t)];
								for (let t = 0; t < i.length; t++) this._array[this._getCyclicIndex(e + t)] = i[t];
								if (i.length && this.onInsertEmitter.fire({
									index: e,
									amount: i.length
								}), this._length + i.length > this._maxLength) {
									const e = this._length + i.length - this._maxLength;
									this._startIndex += e, this._length = this._maxLength, this.onTrimEmitter.fire(e);
								} else this._length += i.length;
							}
							trimStart(e) {
								e > this._length && (e = this._length), this._startIndex += e, this._length -= e, this.onTrimEmitter.fire(e);
							}
							shiftElements(e, t, i) {
								if (!(t <= 0)) {
									if (e < 0 || e >= this._length) throw new Error("start argument out of range");
									if (e + i < 0) throw new Error("Cannot shift elements in list beyond index 0");
									if (i > 0) {
										for (let s = t - 1; s >= 0; s--) this.set(e + s + i, this.get(e + s));
										const s = e + t + i - this._length;
										if (s > 0) for (this._length += s; this._length > this._maxLength;) this._length--, this._startIndex++, this.onTrimEmitter.fire(1);
									} else for (let s = 0; s < t; s++) this.set(e + s + i, this.get(e + s));
								}
							}
							_getCyclicIndex(e) {
								return (this._startIndex + e) % this._maxLength;
							}
						}
						t.CircularList = n;
					},
					7453: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.clone = function e(t, i = 5) {
							if ("object" != typeof t) return t;
							const s = Array.isArray(t) ? [] : {};
							for (const r in t) s[r] = i <= 1 ? t[r] : t[r] && e(t[r], i - 1);
							return s;
						};
					},
					4103: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.rgba = t.rgb = t.css = t.color = t.channels = t.NULL_COLOR = void 0, t.toPaddedHex = d, t.contrastRatio = u;
						let i = 0, s = 0, r = 0, n = 0;
						var o, a, l, h, c;
						function d(e) {
							const t = e.toString(16);
							return t.length < 2 ? "0" + t : t;
						}
						function u(e, t) {
							return e < t ? (t + .05) / (e + .05) : (e + .05) / (t + .05);
						}
						t.NULL_COLOR = {
							css: "#00000000",
							rgba: 0
						}, function(e) {
							e.toCss = function(e, t, i, s) {
								return void 0 !== s ? `#${d(e)}${d(t)}${d(i)}${d(s)}` : `#${d(e)}${d(t)}${d(i)}`;
							}, e.toRgba = function(e, t, i, s = 255) {
								return (e << 24 | t << 16 | i << 8 | s) >>> 0;
							}, e.toColor = function(t, i, s, r) {
								return {
									css: e.toCss(t, i, s, r),
									rgba: e.toRgba(t, i, s, r)
								};
							};
						}(o || (t.channels = o = {})), function(e) {
							function t(e, t) {
								return n = Math.round(255 * t), [i, s, r] = c.toChannels(e.rgba), {
									css: o.toCss(i, s, r, n),
									rgba: o.toRgba(i, s, r, n)
								};
							}
							e.blend = function(e, t) {
								if (n = (255 & t.rgba) / 255, 1 === n) return {
									css: t.css,
									rgba: t.rgba
								};
								const a = t.rgba >> 24 & 255, l = t.rgba >> 16 & 255, h = t.rgba >> 8 & 255, c = e.rgba >> 24 & 255, d = e.rgba >> 16 & 255, u = e.rgba >> 8 & 255;
								return i = c + Math.round((a - c) * n), s = d + Math.round((l - d) * n), r = u + Math.round((h - u) * n), {
									css: o.toCss(i, s, r),
									rgba: o.toRgba(i, s, r)
								};
							}, e.isOpaque = function(e) {
								return !(255 & ~e.rgba);
							}, e.ensureContrastRatio = function(e, t, i) {
								const s = c.ensureContrastRatio(e.rgba, t.rgba, i);
								if (s) return o.toColor(s >> 24 & 255, s >> 16 & 255, s >> 8 & 255);
							}, e.opaque = function(e) {
								const t = (255 | e.rgba) >>> 0;
								return [i, s, r] = c.toChannels(t), {
									css: o.toCss(i, s, r),
									rgba: t
								};
							}, e.opacity = t, e.multiplyOpacity = function(e, i) {
								return n = 255 & e.rgba, t(e, n * i / 255);
							}, e.toColorRGB = function(e) {
								return [
									e.rgba >> 24 & 255,
									e.rgba >> 16 & 255,
									e.rgba >> 8 & 255
								];
							};
						}(a || (t.color = a = {})), function(e) {
							let t, a;
							try {
								const e = document.createElement("canvas");
								e.width = 1, e.height = 1;
								const i = e.getContext("2d", { willReadFrequently: !0 });
								i && (t = i, t.globalCompositeOperation = "copy", a = t.createLinearGradient(0, 0, 1, 1));
							} catch {}
							e.toColor = function(e) {
								if (e.match(/#[\da-f]{3,8}/i)) switch (e.length) {
									case 4: return i = parseInt(e.slice(1, 2).repeat(2), 16), s = parseInt(e.slice(2, 3).repeat(2), 16), r = parseInt(e.slice(3, 4).repeat(2), 16), o.toColor(i, s, r);
									case 5: return i = parseInt(e.slice(1, 2).repeat(2), 16), s = parseInt(e.slice(2, 3).repeat(2), 16), r = parseInt(e.slice(3, 4).repeat(2), 16), n = parseInt(e.slice(4, 5).repeat(2), 16), o.toColor(i, s, r, n);
									case 7: return {
										css: e,
										rgba: (parseInt(e.slice(1), 16) << 8 | 255) >>> 0
									};
									case 9: return {
										css: e,
										rgba: parseInt(e.slice(1), 16) >>> 0
									};
								}
								const l = e.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(0|1|\d?\.(\d+))\s*)?\)/);
								if (l) return i = parseInt(l[1]), s = parseInt(l[2]), r = parseInt(l[3]), n = Math.round(255 * (void 0 === l[5] ? 1 : parseFloat(l[5]))), o.toColor(i, s, r, n);
								if (!t || !a) throw new Error("css.toColor: Unsupported css format");
								if (t.fillStyle = a, t.fillStyle = e, "string" != typeof t.fillStyle) throw new Error("css.toColor: Unsupported css format");
								if (t.fillRect(0, 0, 1, 1), [i, s, r, n] = t.getImageData(0, 0, 1, 1).data, 255 !== n) throw new Error("css.toColor: Unsupported css format");
								return {
									rgba: o.toRgba(i, s, r, n),
									css: e
								};
							};
						}(l || (t.css = l = {})), function(e) {
							function t(e, t, i) {
								const s = e / 255, r = t / 255, n = i / 255;
								return .2126 * (s <= .03928 ? s / 12.92 : Math.pow((s + .055) / 1.055, 2.4)) + .7152 * (r <= .03928 ? r / 12.92 : Math.pow((r + .055) / 1.055, 2.4)) + .0722 * (n <= .03928 ? n / 12.92 : Math.pow((n + .055) / 1.055, 2.4));
							}
							e.relativeLuminance = function(e) {
								return t(e >> 16 & 255, e >> 8 & 255, 255 & e);
							}, e.relativeLuminance2 = t;
						}(h || (t.rgb = h = {})), function(e) {
							function t(e, t, i) {
								const s = e >> 24 & 255, r = e >> 16 & 255, n = e >> 8 & 255;
								let o = t >> 24 & 255, a = t >> 16 & 255, l = t >> 8 & 255, c = u(h.relativeLuminance2(o, a, l), h.relativeLuminance2(s, r, n));
								for (; c < i && (o > 0 || a > 0 || l > 0);) o -= Math.max(0, Math.ceil(.1 * o)), a -= Math.max(0, Math.ceil(.1 * a)), l -= Math.max(0, Math.ceil(.1 * l)), c = u(h.relativeLuminance2(o, a, l), h.relativeLuminance2(s, r, n));
								return (o << 24 | a << 16 | l << 8 | 255) >>> 0;
							}
							function a(e, t, i) {
								const s = e >> 24 & 255, r = e >> 16 & 255, n = e >> 8 & 255;
								let o = t >> 24 & 255, a = t >> 16 & 255, l = t >> 8 & 255, c = u(h.relativeLuminance2(o, a, l), h.relativeLuminance2(s, r, n));
								for (; c < i && (o < 255 || a < 255 || l < 255);) o = Math.min(255, o + Math.ceil(.1 * (255 - o))), a = Math.min(255, a + Math.ceil(.1 * (255 - a))), l = Math.min(255, l + Math.ceil(.1 * (255 - l))), c = u(h.relativeLuminance2(o, a, l), h.relativeLuminance2(s, r, n));
								return (o << 24 | a << 16 | l << 8 | 255) >>> 0;
							}
							e.blend = function(e, t) {
								if (n = (255 & t) / 255, 1 === n) return t;
								const a = t >> 24 & 255, l = t >> 16 & 255, h = t >> 8 & 255, c = e >> 24 & 255, d = e >> 16 & 255, u = e >> 8 & 255;
								return i = c + Math.round((a - c) * n), s = d + Math.round((l - d) * n), r = u + Math.round((h - u) * n), o.toRgba(i, s, r);
							}, e.ensureContrastRatio = function(e, i, s) {
								const r = h.relativeLuminance(e >> 8), n = h.relativeLuminance(i >> 8);
								if (u(r, n) < s) {
									if (n < r) {
										const n = t(e, i, s), o = u(r, h.relativeLuminance(n >> 8));
										if (o < s) {
											const t = a(e, i, s);
											return o > u(r, h.relativeLuminance(t >> 8)) ? n : t;
										}
										return n;
									}
									const o = a(e, i, s), l = u(r, h.relativeLuminance(o >> 8));
									if (l < s) {
										const n = t(e, i, s);
										return l > u(r, h.relativeLuminance(n >> 8)) ? o : n;
									}
									return o;
								}
							}, e.reduceLuminance = t, e.increaseLuminance = a, e.toChannels = function(e) {
								return [
									e >> 24 & 255,
									e >> 16 & 255,
									e >> 8 & 255,
									255 & e
								];
							};
						}(c || (t.rgba = c = {}));
					},
					5777: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.CoreTerminal = void 0;
						const s = i(6501), r = i(6025), n = i(7276), o = i(9640), a = i(56), l = i(4071), h = i(7792), c = i(6415), d = i(5746), u = i(5882), _ = i(2486), f = i(3562), p = i(8811), g = i(802), m = i(7150);
						let v = !1;
						class S extends m.Disposable {
							get onScroll() {
								return this._onScrollApi || (this._onScrollApi = this._register(new g.Emitter()), this._onScroll.event(((e) => {
									this._onScrollApi?.fire(e.position);
								}))), this._onScrollApi.event;
							}
							get cols() {
								return this._bufferService.cols;
							}
							get rows() {
								return this._bufferService.rows;
							}
							get buffers() {
								return this._bufferService.buffers;
							}
							get options() {
								return this.optionsService.options;
							}
							set options(e) {
								for (const t in e) this.optionsService.options[t] = e[t];
							}
							constructor(e) {
								super(), this._windowsWrappingHeuristics = this._register(new m.MutableDisposable()), this._onBinary = this._register(new g.Emitter()), this.onBinary = this._onBinary.event, this._onData = this._register(new g.Emitter()), this.onData = this._onData.event, this._onLineFeed = this._register(new g.Emitter()), this.onLineFeed = this._onLineFeed.event, this._onResize = this._register(new g.Emitter()), this.onResize = this._onResize.event, this._onWriteParsed = this._register(new g.Emitter()), this.onWriteParsed = this._onWriteParsed.event, this._onScroll = this._register(new g.Emitter()), this._instantiationService = new r.InstantiationService(), this.optionsService = this._register(new a.OptionsService(e)), this._instantiationService.setService(s.IOptionsService, this.optionsService), this._bufferService = this._register(this._instantiationService.createInstance(o.BufferService)), this._instantiationService.setService(s.IBufferService, this._bufferService), this._logService = this._register(this._instantiationService.createInstance(n.LogService)), this._instantiationService.setService(s.ILogService, this._logService), this.coreService = this._register(this._instantiationService.createInstance(l.CoreService)), this._instantiationService.setService(s.ICoreService, this.coreService), this.coreMouseService = this._register(this._instantiationService.createInstance(h.CoreMouseService)), this._instantiationService.setService(s.ICoreMouseService, this.coreMouseService), this.unicodeService = this._register(this._instantiationService.createInstance(c.UnicodeService)), this._instantiationService.setService(s.IUnicodeService, this.unicodeService), this._charsetService = this._instantiationService.createInstance(d.CharsetService), this._instantiationService.setService(s.ICharsetService, this._charsetService), this._oscLinkService = this._instantiationService.createInstance(p.OscLinkService), this._instantiationService.setService(s.IOscLinkService, this._oscLinkService), this._inputHandler = this._register(new _.InputHandler(this._bufferService, this._charsetService, this.coreService, this._logService, this.optionsService, this._oscLinkService, this.coreMouseService, this.unicodeService)), this._register(g.Event.forward(this._inputHandler.onLineFeed, this._onLineFeed)), this._register(this._inputHandler), this._register(g.Event.forward(this._bufferService.onResize, this._onResize)), this._register(g.Event.forward(this.coreService.onData, this._onData)), this._register(g.Event.forward(this.coreService.onBinary, this._onBinary)), this._register(this.coreService.onRequestScrollToBottom((() => this.scrollToBottom(!0)))), this._register(this.coreService.onUserInput((() => this._writeBuffer.handleUserInput()))), this._register(this.optionsService.onMultipleOptionChange(["windowsMode", "windowsPty"], (() => this._handleWindowsPtyOptionChange()))), this._register(this._bufferService.onScroll((() => {
									this._onScroll.fire({ position: this._bufferService.buffer.ydisp }), this._inputHandler.markRangeDirty(this._bufferService.buffer.scrollTop, this._bufferService.buffer.scrollBottom);
								}))), this._writeBuffer = this._register(new f.WriteBuffer(((e, t) => this._inputHandler.parse(e, t)))), this._register(g.Event.forward(this._writeBuffer.onWriteParsed, this._onWriteParsed));
							}
							write(e, t) {
								this._writeBuffer.write(e, t);
							}
							writeSync(e, t) {
								this._logService.logLevel <= s.LogLevelEnum.WARN && !v && (this._logService.warn("writeSync is unreliable and will be removed soon."), v = !0), this._writeBuffer.writeSync(e, t);
							}
							input(e, t = !0) {
								this.coreService.triggerDataEvent(e, t);
							}
							resize(e, t) {
								isNaN(e) || isNaN(t) || (e = Math.max(e, o.MINIMUM_COLS), t = Math.max(t, o.MINIMUM_ROWS), this._bufferService.resize(e, t));
							}
							scroll(e, t = !1) {
								this._bufferService.scroll(e, t);
							}
							scrollLines(e, t) {
								this._bufferService.scrollLines(e, t);
							}
							scrollPages(e) {
								this.scrollLines(e * (this.rows - 1));
							}
							scrollToTop() {
								this.scrollLines(-this._bufferService.buffer.ydisp);
							}
							scrollToBottom(e) {
								this.scrollLines(this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
							}
							scrollToLine(e) {
								const t = e - this._bufferService.buffer.ydisp;
								0 !== t && this.scrollLines(t);
							}
							registerEscHandler(e, t) {
								return this._inputHandler.registerEscHandler(e, t);
							}
							registerDcsHandler(e, t) {
								return this._inputHandler.registerDcsHandler(e, t);
							}
							registerCsiHandler(e, t) {
								return this._inputHandler.registerCsiHandler(e, t);
							}
							registerOscHandler(e, t) {
								return this._inputHandler.registerOscHandler(e, t);
							}
							_setup() {
								this._handleWindowsPtyOptionChange();
							}
							reset() {
								this._inputHandler.reset(), this._bufferService.reset(), this._charsetService.reset(), this.coreService.reset(), this.coreMouseService.reset();
							}
							_handleWindowsPtyOptionChange() {
								let e = !1;
								const t = this.optionsService.rawOptions.windowsPty;
								t && void 0 !== t.buildNumber && void 0 !== t.buildNumber ? e = !!("conpty" === t.backend && t.buildNumber < 21376) : this.optionsService.rawOptions.windowsMode && (e = !0), e ? this._enableWindowsWrappingHeuristics() : this._windowsWrappingHeuristics.clear();
							}
							_enableWindowsWrappingHeuristics() {
								if (!this._windowsWrappingHeuristics.value) {
									const e = [];
									e.push(this.onLineFeed(u.updateWindowsModeWrappedState.bind(null, this._bufferService))), e.push(this.registerCsiHandler({ final: "H" }, (() => ((0, u.updateWindowsModeWrappedState)(this._bufferService), !1)))), this._windowsWrappingHeuristics.value = (0, m.toDisposable)((() => {
										for (const t of e) t.dispose();
									}));
								}
							}
						}
						t.CoreTerminal = S;
					},
					2486: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.InputHandler = t.WindowsOptionsReportType = void 0, t.isValidColorIndex = R;
						const n = i(3534), o = i(6760), a = i(6717), l = i(7150), h = i(726), c = i(6107), d = i(8938), u = i(3055), _ = i(5451), f = i(6501), p = i(6415), g = i(1346), m = i(9823), v = i(8693), S = i(802), b = {
							"(": 0,
							")": 1,
							"*": 2,
							"+": 3,
							"-": 1,
							".": 2
						}, C = 131072;
						function y(e, t) {
							if (e > 24) return t.setWinLines || !1;
							switch (e) {
								case 1: return !!t.restoreWin;
								case 2: return !!t.minimizeWin;
								case 3: return !!t.setWinPosition;
								case 4: return !!t.setWinSizePixels;
								case 5: return !!t.raiseWin;
								case 6: return !!t.lowerWin;
								case 7: return !!t.refreshWin;
								case 8: return !!t.setWinSizeChars;
								case 9: return !!t.maximizeWin;
								case 10: return !!t.fullscreenWin;
								case 11: return !!t.getWinState;
								case 13: return !!t.getWinPosition;
								case 14: return !!t.getWinSizePixels;
								case 15: return !!t.getScreenSizePixels;
								case 16: return !!t.getCellSizePixels;
								case 18: return !!t.getWinSizeChars;
								case 19: return !!t.getScreenSizeChars;
								case 20: return !!t.getIconTitle;
								case 21: return !!t.getWinTitle;
								case 22: return !!t.pushTitle;
								case 23: return !!t.popTitle;
								case 24: return !!t.setWinLines;
							}
							return !1;
						}
						var w;
						(function(e) {
							e[e.GET_WIN_SIZE_PIXELS = 0] = "GET_WIN_SIZE_PIXELS", e[e.GET_CELL_SIZE_PIXELS = 1] = "GET_CELL_SIZE_PIXELS";
						})(w || (t.WindowsOptionsReportType = w = {}));
						let E = 0;
						class D extends l.Disposable {
							getAttrData() {
								return this._curAttrData;
							}
							constructor(e, t, i, s, r, l, d, u, _ = new a.EscapeSequenceParser()) {
								super(), this._bufferService = e, this._charsetService = t, this._coreService = i, this._logService = s, this._optionsService = r, this._oscLinkService = l, this._coreMouseService = d, this._unicodeService = u, this._parser = _, this._parseBuffer = /* @__PURE__ */ new Uint32Array(4096), this._stringDecoder = new h.StringToUtf32(), this._utf8Decoder = new h.Utf8ToUtf32(), this._windowTitle = "", this._iconName = "", this._windowTitleStack = [], this._iconNameStack = [], this._curAttrData = c.DEFAULT_ATTR_DATA.clone(), this._eraseAttrDataInternal = c.DEFAULT_ATTR_DATA.clone(), this._onRequestBell = this._register(new S.Emitter()), this.onRequestBell = this._onRequestBell.event, this._onRequestRefreshRows = this._register(new S.Emitter()), this.onRequestRefreshRows = this._onRequestRefreshRows.event, this._onRequestReset = this._register(new S.Emitter()), this.onRequestReset = this._onRequestReset.event, this._onRequestSendFocus = this._register(new S.Emitter()), this.onRequestSendFocus = this._onRequestSendFocus.event, this._onRequestSyncScrollBar = this._register(new S.Emitter()), this.onRequestSyncScrollBar = this._onRequestSyncScrollBar.event, this._onRequestWindowsOptionsReport = this._register(new S.Emitter()), this.onRequestWindowsOptionsReport = this._onRequestWindowsOptionsReport.event, this._onA11yChar = this._register(new S.Emitter()), this.onA11yChar = this._onA11yChar.event, this._onA11yTab = this._register(new S.Emitter()), this.onA11yTab = this._onA11yTab.event, this._onCursorMove = this._register(new S.Emitter()), this.onCursorMove = this._onCursorMove.event, this._onLineFeed = this._register(new S.Emitter()), this.onLineFeed = this._onLineFeed.event, this._onScroll = this._register(new S.Emitter()), this.onScroll = this._onScroll.event, this._onTitleChange = this._register(new S.Emitter()), this.onTitleChange = this._onTitleChange.event, this._onColor = this._register(new S.Emitter()), this.onColor = this._onColor.event, this._parseStack = {
									paused: !1,
									cursorStartX: 0,
									cursorStartY: 0,
									decodedLength: 0,
									position: 0
								}, this._specialColors = [
									256,
									257,
									258
								], this._register(this._parser), this._dirtyRowTracker = new L(this._bufferService), this._activeBuffer = this._bufferService.buffer, this._register(this._bufferService.buffers.onBufferActivate(((e) => this._activeBuffer = e.activeBuffer))), this._parser.setCsiHandlerFallback(((e, t) => {
									this._logService.debug("Unknown CSI code: ", {
										identifier: this._parser.identToString(e),
										params: t.toArray()
									});
								})), this._parser.setEscHandlerFallback(((e) => {
									this._logService.debug("Unknown ESC code: ", { identifier: this._parser.identToString(e) });
								})), this._parser.setExecuteHandlerFallback(((e) => {
									this._logService.debug("Unknown EXECUTE code: ", { code: e });
								})), this._parser.setOscHandlerFallback(((e, t, i) => {
									this._logService.debug("Unknown OSC code: ", {
										identifier: e,
										action: t,
										data: i
									});
								})), this._parser.setDcsHandlerFallback(((e, t, i) => {
									"HOOK" === t && (i = i.toArray()), this._logService.debug("Unknown DCS code: ", {
										identifier: this._parser.identToString(e),
										action: t,
										payload: i
									});
								})), this._parser.setPrintHandler(((e, t, i) => this.print(e, t, i))), this._parser.registerCsiHandler({ final: "@" }, ((e) => this.insertChars(e))), this._parser.registerCsiHandler({
									intermediates: " ",
									final: "@"
								}, ((e) => this.scrollLeft(e))), this._parser.registerCsiHandler({ final: "A" }, ((e) => this.cursorUp(e))), this._parser.registerCsiHandler({
									intermediates: " ",
									final: "A"
								}, ((e) => this.scrollRight(e))), this._parser.registerCsiHandler({ final: "B" }, ((e) => this.cursorDown(e))), this._parser.registerCsiHandler({ final: "C" }, ((e) => this.cursorForward(e))), this._parser.registerCsiHandler({ final: "D" }, ((e) => this.cursorBackward(e))), this._parser.registerCsiHandler({ final: "E" }, ((e) => this.cursorNextLine(e))), this._parser.registerCsiHandler({ final: "F" }, ((e) => this.cursorPrecedingLine(e))), this._parser.registerCsiHandler({ final: "G" }, ((e) => this.cursorCharAbsolute(e))), this._parser.registerCsiHandler({ final: "H" }, ((e) => this.cursorPosition(e))), this._parser.registerCsiHandler({ final: "I" }, ((e) => this.cursorForwardTab(e))), this._parser.registerCsiHandler({ final: "J" }, ((e) => this.eraseInDisplay(e, !1))), this._parser.registerCsiHandler({
									prefix: "?",
									final: "J"
								}, ((e) => this.eraseInDisplay(e, !0))), this._parser.registerCsiHandler({ final: "K" }, ((e) => this.eraseInLine(e, !1))), this._parser.registerCsiHandler({
									prefix: "?",
									final: "K"
								}, ((e) => this.eraseInLine(e, !0))), this._parser.registerCsiHandler({ final: "L" }, ((e) => this.insertLines(e))), this._parser.registerCsiHandler({ final: "M" }, ((e) => this.deleteLines(e))), this._parser.registerCsiHandler({ final: "P" }, ((e) => this.deleteChars(e))), this._parser.registerCsiHandler({ final: "S" }, ((e) => this.scrollUp(e))), this._parser.registerCsiHandler({ final: "T" }, ((e) => this.scrollDown(e))), this._parser.registerCsiHandler({ final: "X" }, ((e) => this.eraseChars(e))), this._parser.registerCsiHandler({ final: "Z" }, ((e) => this.cursorBackwardTab(e))), this._parser.registerCsiHandler({ final: "`" }, ((e) => this.charPosAbsolute(e))), this._parser.registerCsiHandler({ final: "a" }, ((e) => this.hPositionRelative(e))), this._parser.registerCsiHandler({ final: "b" }, ((e) => this.repeatPrecedingCharacter(e))), this._parser.registerCsiHandler({ final: "c" }, ((e) => this.sendDeviceAttributesPrimary(e))), this._parser.registerCsiHandler({
									prefix: ">",
									final: "c"
								}, ((e) => this.sendDeviceAttributesSecondary(e))), this._parser.registerCsiHandler({ final: "d" }, ((e) => this.linePosAbsolute(e))), this._parser.registerCsiHandler({ final: "e" }, ((e) => this.vPositionRelative(e))), this._parser.registerCsiHandler({ final: "f" }, ((e) => this.hVPosition(e))), this._parser.registerCsiHandler({ final: "g" }, ((e) => this.tabClear(e))), this._parser.registerCsiHandler({ final: "h" }, ((e) => this.setMode(e))), this._parser.registerCsiHandler({
									prefix: "?",
									final: "h"
								}, ((e) => this.setModePrivate(e))), this._parser.registerCsiHandler({ final: "l" }, ((e) => this.resetMode(e))), this._parser.registerCsiHandler({
									prefix: "?",
									final: "l"
								}, ((e) => this.resetModePrivate(e))), this._parser.registerCsiHandler({ final: "m" }, ((e) => this.charAttributes(e))), this._parser.registerCsiHandler({ final: "n" }, ((e) => this.deviceStatus(e))), this._parser.registerCsiHandler({
									prefix: "?",
									final: "n"
								}, ((e) => this.deviceStatusPrivate(e))), this._parser.registerCsiHandler({
									intermediates: "!",
									final: "p"
								}, ((e) => this.softReset(e))), this._parser.registerCsiHandler({
									intermediates: " ",
									final: "q"
								}, ((e) => this.setCursorStyle(e))), this._parser.registerCsiHandler({ final: "r" }, ((e) => this.setScrollRegion(e))), this._parser.registerCsiHandler({ final: "s" }, ((e) => this.saveCursor(e))), this._parser.registerCsiHandler({ final: "t" }, ((e) => this.windowOptions(e))), this._parser.registerCsiHandler({ final: "u" }, ((e) => this.restoreCursor(e))), this._parser.registerCsiHandler({
									intermediates: "'",
									final: "}"
								}, ((e) => this.insertColumns(e))), this._parser.registerCsiHandler({
									intermediates: "'",
									final: "~"
								}, ((e) => this.deleteColumns(e))), this._parser.registerCsiHandler({
									intermediates: "\"",
									final: "q"
								}, ((e) => this.selectProtected(e))), this._parser.registerCsiHandler({
									intermediates: "$",
									final: "p"
								}, ((e) => this.requestMode(e, !0))), this._parser.registerCsiHandler({
									prefix: "?",
									intermediates: "$",
									final: "p"
								}, ((e) => this.requestMode(e, !1))), this._parser.setExecuteHandler(n.C0.BEL, (() => this.bell())), this._parser.setExecuteHandler(n.C0.LF, (() => this.lineFeed())), this._parser.setExecuteHandler(n.C0.VT, (() => this.lineFeed())), this._parser.setExecuteHandler(n.C0.FF, (() => this.lineFeed())), this._parser.setExecuteHandler(n.C0.CR, (() => this.carriageReturn())), this._parser.setExecuteHandler(n.C0.BS, (() => this.backspace())), this._parser.setExecuteHandler(n.C0.HT, (() => this.tab())), this._parser.setExecuteHandler(n.C0.SO, (() => this.shiftOut())), this._parser.setExecuteHandler(n.C0.SI, (() => this.shiftIn())), this._parser.setExecuteHandler(n.C1.IND, (() => this.index())), this._parser.setExecuteHandler(n.C1.NEL, (() => this.nextLine())), this._parser.setExecuteHandler(n.C1.HTS, (() => this.tabSet())), this._parser.registerOscHandler(0, new g.OscHandler(((e) => (this.setTitle(e), this.setIconName(e), !0)))), this._parser.registerOscHandler(1, new g.OscHandler(((e) => this.setIconName(e)))), this._parser.registerOscHandler(2, new g.OscHandler(((e) => this.setTitle(e)))), this._parser.registerOscHandler(4, new g.OscHandler(((e) => this.setOrReportIndexedColor(e)))), this._parser.registerOscHandler(8, new g.OscHandler(((e) => this.setHyperlink(e)))), this._parser.registerOscHandler(10, new g.OscHandler(((e) => this.setOrReportFgColor(e)))), this._parser.registerOscHandler(11, new g.OscHandler(((e) => this.setOrReportBgColor(e)))), this._parser.registerOscHandler(12, new g.OscHandler(((e) => this.setOrReportCursorColor(e)))), this._parser.registerOscHandler(104, new g.OscHandler(((e) => this.restoreIndexedColor(e)))), this._parser.registerOscHandler(110, new g.OscHandler(((e) => this.restoreFgColor(e)))), this._parser.registerOscHandler(111, new g.OscHandler(((e) => this.restoreBgColor(e)))), this._parser.registerOscHandler(112, new g.OscHandler(((e) => this.restoreCursorColor(e)))), this._parser.registerEscHandler({ final: "7" }, (() => this.saveCursor())), this._parser.registerEscHandler({ final: "8" }, (() => this.restoreCursor())), this._parser.registerEscHandler({ final: "D" }, (() => this.index())), this._parser.registerEscHandler({ final: "E" }, (() => this.nextLine())), this._parser.registerEscHandler({ final: "H" }, (() => this.tabSet())), this._parser.registerEscHandler({ final: "M" }, (() => this.reverseIndex())), this._parser.registerEscHandler({ final: "=" }, (() => this.keypadApplicationMode())), this._parser.registerEscHandler({ final: ">" }, (() => this.keypadNumericMode())), this._parser.registerEscHandler({ final: "c" }, (() => this.fullReset())), this._parser.registerEscHandler({ final: "n" }, (() => this.setgLevel(2))), this._parser.registerEscHandler({ final: "o" }, (() => this.setgLevel(3))), this._parser.registerEscHandler({ final: "|" }, (() => this.setgLevel(3))), this._parser.registerEscHandler({ final: "}" }, (() => this.setgLevel(2))), this._parser.registerEscHandler({ final: "~" }, (() => this.setgLevel(1))), this._parser.registerEscHandler({
									intermediates: "%",
									final: "@"
								}, (() => this.selectDefaultCharset())), this._parser.registerEscHandler({
									intermediates: "%",
									final: "G"
								}, (() => this.selectDefaultCharset()));
								for (const e in o.CHARSETS) this._parser.registerEscHandler({
									intermediates: "(",
									final: e
								}, (() => this.selectCharset("(" + e))), this._parser.registerEscHandler({
									intermediates: ")",
									final: e
								}, (() => this.selectCharset(")" + e))), this._parser.registerEscHandler({
									intermediates: "*",
									final: e
								}, (() => this.selectCharset("*" + e))), this._parser.registerEscHandler({
									intermediates: "+",
									final: e
								}, (() => this.selectCharset("+" + e))), this._parser.registerEscHandler({
									intermediates: "-",
									final: e
								}, (() => this.selectCharset("-" + e))), this._parser.registerEscHandler({
									intermediates: ".",
									final: e
								}, (() => this.selectCharset("." + e))), this._parser.registerEscHandler({
									intermediates: "/",
									final: e
								}, (() => this.selectCharset("/" + e)));
								this._parser.registerEscHandler({
									intermediates: "#",
									final: "8"
								}, (() => this.screenAlignmentPattern())), this._parser.setErrorHandler(((e) => (this._logService.error("Parsing error: ", e), e))), this._parser.registerDcsHandler({
									intermediates: "$",
									final: "q"
								}, new m.DcsHandler(((e, t) => this.requestStatusString(e, t))));
							}
							_preserveStack(e, t, i, s) {
								this._parseStack.paused = !0, this._parseStack.cursorStartX = e, this._parseStack.cursorStartY = t, this._parseStack.decodedLength = i, this._parseStack.position = s;
							}
							_logSlowResolvingAsync(e) {
								this._logService.logLevel <= f.LogLevelEnum.WARN && Promise.race([e, new Promise(((e, t) => setTimeout((() => t("#SLOW_TIMEOUT")), 5e3)))]).catch(((e) => {
									if ("#SLOW_TIMEOUT" !== e) throw e;
									console.warn("async parser handler taking longer than 5000 ms");
								}));
							}
							_getCurrentLinkId() {
								return this._curAttrData.extended.urlId;
							}
							parse(e, t) {
								let i, s = this._activeBuffer.x, r = this._activeBuffer.y, n = 0;
								const o = this._parseStack.paused;
								if (o) {
									if (i = this._parser.parse(this._parseBuffer, this._parseStack.decodedLength, t)) return this._logSlowResolvingAsync(i), i;
									s = this._parseStack.cursorStartX, r = this._parseStack.cursorStartY, this._parseStack.paused = !1, e.length > C && (n = this._parseStack.position + C);
								}
								if (this._logService.logLevel <= f.LogLevelEnum.DEBUG && this._logService.debug("parsing data " + ("string" == typeof e ? ` "${e}"` : ` "${Array.prototype.map.call(e, ((e) => String.fromCharCode(e))).join("")}"`)), this._logService.logLevel === f.LogLevelEnum.TRACE && this._logService.trace("parsing data (codes)", "string" == typeof e ? e.split("").map(((e) => e.charCodeAt(0))) : e), this._parseBuffer.length < e.length && this._parseBuffer.length < C && (this._parseBuffer = new Uint32Array(Math.min(e.length, C))), o || this._dirtyRowTracker.clearRange(), e.length > C) for (let t = n; t < e.length; t += C) {
									const n = t + C < e.length ? t + C : e.length, o = "string" == typeof e ? this._stringDecoder.decode(e.substring(t, n), this._parseBuffer) : this._utf8Decoder.decode(e.subarray(t, n), this._parseBuffer);
									if (i = this._parser.parse(this._parseBuffer, o)) return this._preserveStack(s, r, o, t), this._logSlowResolvingAsync(i), i;
								}
								else if (!o) {
									const t = "string" == typeof e ? this._stringDecoder.decode(e, this._parseBuffer) : this._utf8Decoder.decode(e, this._parseBuffer);
									if (i = this._parser.parse(this._parseBuffer, t)) return this._preserveStack(s, r, t, 0), this._logSlowResolvingAsync(i), i;
								}
								this._activeBuffer.x === s && this._activeBuffer.y === r || this._onCursorMove.fire();
								const a = this._dirtyRowTracker.end + (this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp), l = this._dirtyRowTracker.start + (this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
								l < this._bufferService.rows && this._onRequestRefreshRows.fire({
									start: Math.min(l, this._bufferService.rows - 1),
									end: Math.min(a, this._bufferService.rows - 1)
								});
							}
							print(e, t, i) {
								let s, r;
								const n = this._charsetService.charset, o = this._optionsService.rawOptions.screenReaderMode, a = this._bufferService.cols, l = this._coreService.decPrivateModes.wraparound, u = this._coreService.modes.insertMode, _ = this._curAttrData;
								let f = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
								this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._activeBuffer.x && i - t > 0 && 2 === f.getWidth(this._activeBuffer.x - 1) && f.setCellFromCodepoint(this._activeBuffer.x - 1, 0, 1, _);
								let g = this._parser.precedingJoinState;
								for (let m = t; m < i; ++m) {
									if (s = e[m], s < 127 && n) {
										const e = n[String.fromCharCode(s)];
										e && (s = e.charCodeAt(0));
									}
									const t = this._unicodeService.charProperties(s, g);
									r = p.UnicodeService.extractWidth(t);
									const i = p.UnicodeService.extractShouldJoin(t), v = i ? p.UnicodeService.extractWidth(g) : 0;
									if (g = t, o && this._onA11yChar.fire((0, h.stringFromCodePoint)(s)), this._getCurrentLinkId() && this._oscLinkService.addLineToLink(this._getCurrentLinkId(), this._activeBuffer.ybase + this._activeBuffer.y), this._activeBuffer.x + r - v > a) {
										if (l) {
											const e = f;
											let t = this._activeBuffer.x - v;
											for (this._activeBuffer.x = v, this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData(), !0)) : (this._activeBuffer.y >= this._bufferService.rows && (this._activeBuffer.y = this._bufferService.rows - 1), this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = !0), f = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y), v > 0 && f instanceof c.BufferLine && f.copyCellsFrom(e, t, 0, v, !1); t < a;) e.setCellFromCodepoint(t++, 0, 1, _);
										} else if (this._activeBuffer.x = a - 1, 2 === r) continue;
									}
									if (i && this._activeBuffer.x) {
										const e = f.getWidth(this._activeBuffer.x - 1) ? 1 : 2;
										f.addCodepointToCell(this._activeBuffer.x - e, s, r);
										for (let e = r - v; --e >= 0;) f.setCellFromCodepoint(this._activeBuffer.x++, 0, 0, _);
									} else if (u && (f.insertCells(this._activeBuffer.x, r - v, this._activeBuffer.getNullCell(_)), 2 === f.getWidth(a - 1) && f.setCellFromCodepoint(a - 1, d.NULL_CELL_CODE, d.NULL_CELL_WIDTH, _)), f.setCellFromCodepoint(this._activeBuffer.x++, s, r, _), r > 0) for (; --r;) f.setCellFromCodepoint(this._activeBuffer.x++, 0, 0, _);
								}
								this._parser.precedingJoinState = g, this._activeBuffer.x < a && i - t > 0 && 0 === f.getWidth(this._activeBuffer.x) && !f.hasContent(this._activeBuffer.x) && f.setCellFromCodepoint(this._activeBuffer.x, 0, 1, _), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
							}
							registerCsiHandler(e, t) {
								return "t" !== e.final || e.prefix || e.intermediates ? this._parser.registerCsiHandler(e, t) : this._parser.registerCsiHandler(e, ((e) => !y(e.params[0], this._optionsService.rawOptions.windowOptions) || t(e)));
							}
							registerDcsHandler(e, t) {
								return this._parser.registerDcsHandler(e, new m.DcsHandler(t));
							}
							registerEscHandler(e, t) {
								return this._parser.registerEscHandler(e, t);
							}
							registerOscHandler(e, t) {
								return this._parser.registerOscHandler(e, new g.OscHandler(t));
							}
							bell() {
								return this._onRequestBell.fire(), !0;
							}
							lineFeed() {
								return this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._optionsService.rawOptions.convertEol && (this._activeBuffer.x = 0), this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData())) : this._activeBuffer.y >= this._bufferService.rows ? this._activeBuffer.y = this._bufferService.rows - 1 : this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = !1, this._activeBuffer.x >= this._bufferService.cols && this._activeBuffer.x--, this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._onLineFeed.fire(), !0;
							}
							carriageReturn() {
								return this._activeBuffer.x = 0, !0;
							}
							backspace() {
								if (!this._coreService.decPrivateModes.reverseWraparound) return this._restrictCursor(), this._activeBuffer.x > 0 && this._activeBuffer.x--, !0;
								if (this._restrictCursor(this._bufferService.cols), this._activeBuffer.x > 0) this._activeBuffer.x--;
								else if (0 === this._activeBuffer.x && this._activeBuffer.y > this._activeBuffer.scrollTop && this._activeBuffer.y <= this._activeBuffer.scrollBottom && this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y)?.isWrapped) {
									this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = !1, this._activeBuffer.y--, this._activeBuffer.x = this._bufferService.cols - 1;
									const e = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
									e.hasWidth(this._activeBuffer.x) && !e.hasContent(this._activeBuffer.x) && this._activeBuffer.x--;
								}
								return this._restrictCursor(), !0;
							}
							tab() {
								if (this._activeBuffer.x >= this._bufferService.cols) return !0;
								const e = this._activeBuffer.x;
								return this._activeBuffer.x = this._activeBuffer.nextStop(), this._optionsService.rawOptions.screenReaderMode && this._onA11yTab.fire(this._activeBuffer.x - e), !0;
							}
							shiftOut() {
								return this._charsetService.setgLevel(1), !0;
							}
							shiftIn() {
								return this._charsetService.setgLevel(0), !0;
							}
							_restrictCursor(e = this._bufferService.cols - 1) {
								this._activeBuffer.x = Math.min(e, Math.max(0, this._activeBuffer.x)), this._activeBuffer.y = this._coreService.decPrivateModes.origin ? Math.min(this._activeBuffer.scrollBottom, Math.max(this._activeBuffer.scrollTop, this._activeBuffer.y)) : Math.min(this._bufferService.rows - 1, Math.max(0, this._activeBuffer.y)), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
							}
							_setCursor(e, t) {
								this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._coreService.decPrivateModes.origin ? (this._activeBuffer.x = e, this._activeBuffer.y = this._activeBuffer.scrollTop + t) : (this._activeBuffer.x = e, this._activeBuffer.y = t), this._restrictCursor(), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
							}
							_moveCursor(e, t) {
								this._restrictCursor(), this._setCursor(this._activeBuffer.x + e, this._activeBuffer.y + t);
							}
							cursorUp(e) {
								const t = this._activeBuffer.y - this._activeBuffer.scrollTop;
								return t >= 0 ? this._moveCursor(0, -Math.min(t, e.params[0] || 1)) : this._moveCursor(0, -(e.params[0] || 1)), !0;
							}
							cursorDown(e) {
								const t = this._activeBuffer.scrollBottom - this._activeBuffer.y;
								return t >= 0 ? this._moveCursor(0, Math.min(t, e.params[0] || 1)) : this._moveCursor(0, e.params[0] || 1), !0;
							}
							cursorForward(e) {
								return this._moveCursor(e.params[0] || 1, 0), !0;
							}
							cursorBackward(e) {
								return this._moveCursor(-(e.params[0] || 1), 0), !0;
							}
							cursorNextLine(e) {
								return this.cursorDown(e), this._activeBuffer.x = 0, !0;
							}
							cursorPrecedingLine(e) {
								return this.cursorUp(e), this._activeBuffer.x = 0, !0;
							}
							cursorCharAbsolute(e) {
								return this._setCursor((e.params[0] || 1) - 1, this._activeBuffer.y), !0;
							}
							cursorPosition(e) {
								return this._setCursor(e.length >= 2 ? (e.params[1] || 1) - 1 : 0, (e.params[0] || 1) - 1), !0;
							}
							charPosAbsolute(e) {
								return this._setCursor((e.params[0] || 1) - 1, this._activeBuffer.y), !0;
							}
							hPositionRelative(e) {
								return this._moveCursor(e.params[0] || 1, 0), !0;
							}
							linePosAbsolute(e) {
								return this._setCursor(this._activeBuffer.x, (e.params[0] || 1) - 1), !0;
							}
							vPositionRelative(e) {
								return this._moveCursor(0, e.params[0] || 1), !0;
							}
							hVPosition(e) {
								return this.cursorPosition(e), !0;
							}
							tabClear(e) {
								const t = e.params[0];
								return 0 === t ? delete this._activeBuffer.tabs[this._activeBuffer.x] : 3 === t && (this._activeBuffer.tabs = {}), !0;
							}
							cursorForwardTab(e) {
								if (this._activeBuffer.x >= this._bufferService.cols) return !0;
								let t = e.params[0] || 1;
								for (; t--;) this._activeBuffer.x = this._activeBuffer.nextStop();
								return !0;
							}
							cursorBackwardTab(e) {
								if (this._activeBuffer.x >= this._bufferService.cols) return !0;
								let t = e.params[0] || 1;
								for (; t--;) this._activeBuffer.x = this._activeBuffer.prevStop();
								return !0;
							}
							selectProtected(e) {
								const t = e.params[0];
								return 1 === t && (this._curAttrData.bg |= 536870912), 2 !== t && 0 !== t || (this._curAttrData.bg &= -536870913), !0;
							}
							_eraseInBufferLine(e, t, i, s = !1, r = !1) {
								const n = this._activeBuffer.lines.get(this._activeBuffer.ybase + e);
								n.replaceCells(t, i, this._activeBuffer.getNullCell(this._eraseAttrData()), r), s && (n.isWrapped = !1);
							}
							_resetBufferLine(e, t = !1) {
								const i = this._activeBuffer.lines.get(this._activeBuffer.ybase + e);
								i && (i.fill(this._activeBuffer.getNullCell(this._eraseAttrData()), t), this._bufferService.buffer.clearMarkers(this._activeBuffer.ybase + e), i.isWrapped = !1);
							}
							eraseInDisplay(e, t = !1) {
								let i;
								switch (this._restrictCursor(this._bufferService.cols), e.params[0]) {
									case 0:
										for (i = this._activeBuffer.y, this._dirtyRowTracker.markDirty(i), this._eraseInBufferLine(i++, this._activeBuffer.x, this._bufferService.cols, 0 === this._activeBuffer.x, t); i < this._bufferService.rows; i++) this._resetBufferLine(i, t);
										this._dirtyRowTracker.markDirty(i);
										break;
									case 1:
										for (i = this._activeBuffer.y, this._dirtyRowTracker.markDirty(i), this._eraseInBufferLine(i, 0, this._activeBuffer.x + 1, !0, t), this._activeBuffer.x + 1 >= this._bufferService.cols && (this._activeBuffer.lines.get(i + 1).isWrapped = !1); i--;) this._resetBufferLine(i, t);
										this._dirtyRowTracker.markDirty(0);
										break;
									case 2:
										if (this._optionsService.rawOptions.scrollOnEraseInDisplay) {
											for (i = this._bufferService.rows, this._dirtyRowTracker.markRangeDirty(0, i - 1); i--;) if (this._activeBuffer.lines.get(this._activeBuffer.ybase + i)?.getTrimmedLength()) break;
											for (; i >= 0; i--) this._bufferService.scroll(this._eraseAttrData());
										} else {
											for (i = this._bufferService.rows, this._dirtyRowTracker.markDirty(i - 1); i--;) this._resetBufferLine(i, t);
											this._dirtyRowTracker.markDirty(0);
										}
										break;
									case 3:
										const e = this._activeBuffer.lines.length - this._bufferService.rows;
										e > 0 && (this._activeBuffer.lines.trimStart(e), this._activeBuffer.ybase = Math.max(this._activeBuffer.ybase - e, 0), this._activeBuffer.ydisp = Math.max(this._activeBuffer.ydisp - e, 0), this._onScroll.fire(0));
								}
								return !0;
							}
							eraseInLine(e, t = !1) {
								switch (this._restrictCursor(this._bufferService.cols), e.params[0]) {
									case 0:
										this._eraseInBufferLine(this._activeBuffer.y, this._activeBuffer.x, this._bufferService.cols, 0 === this._activeBuffer.x, t);
										break;
									case 1:
										this._eraseInBufferLine(this._activeBuffer.y, 0, this._activeBuffer.x + 1, !1, t);
										break;
									case 2: this._eraseInBufferLine(this._activeBuffer.y, 0, this._bufferService.cols, !0, t);
								}
								return this._dirtyRowTracker.markDirty(this._activeBuffer.y), !0;
							}
							insertLines(e) {
								this._restrictCursor();
								let t = e.params[0] || 1;
								if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return !0;
								const i = this._activeBuffer.ybase + this._activeBuffer.y, s = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom, r = this._bufferService.rows - 1 + this._activeBuffer.ybase - s + 1;
								for (; t--;) this._activeBuffer.lines.splice(r - 1, 1), this._activeBuffer.lines.splice(i, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
								return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom), this._activeBuffer.x = 0, !0;
							}
							deleteLines(e) {
								this._restrictCursor();
								let t = e.params[0] || 1;
								if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return !0;
								const i = this._activeBuffer.ybase + this._activeBuffer.y;
								let s;
								for (s = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom, s = this._bufferService.rows - 1 + this._activeBuffer.ybase - s; t--;) this._activeBuffer.lines.splice(i, 1), this._activeBuffer.lines.splice(s, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
								return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom), this._activeBuffer.x = 0, !0;
							}
							insertChars(e) {
								this._restrictCursor();
								const t = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
								return t && (t.insertCells(this._activeBuffer.x, e.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData())), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), !0;
							}
							deleteChars(e) {
								this._restrictCursor();
								const t = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
								return t && (t.deleteCells(this._activeBuffer.x, e.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData())), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), !0;
							}
							scrollUp(e) {
								let t = e.params[0] || 1;
								for (; t--;) this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 1), this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
								return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), !0;
							}
							scrollDown(e) {
								let t = e.params[0] || 1;
								for (; t--;) this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 1), this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 0, this._activeBuffer.getBlankLine(c.DEFAULT_ATTR_DATA));
								return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), !0;
							}
							scrollLeft(e) {
								if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return !0;
								const t = e.params[0] || 1;
								for (let e = this._activeBuffer.scrollTop; e <= this._activeBuffer.scrollBottom; ++e) {
									const i = this._activeBuffer.lines.get(this._activeBuffer.ybase + e);
									i.deleteCells(0, t, this._activeBuffer.getNullCell(this._eraseAttrData())), i.isWrapped = !1;
								}
								return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), !0;
							}
							scrollRight(e) {
								if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return !0;
								const t = e.params[0] || 1;
								for (let e = this._activeBuffer.scrollTop; e <= this._activeBuffer.scrollBottom; ++e) {
									const i = this._activeBuffer.lines.get(this._activeBuffer.ybase + e);
									i.insertCells(0, t, this._activeBuffer.getNullCell(this._eraseAttrData())), i.isWrapped = !1;
								}
								return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), !0;
							}
							insertColumns(e) {
								if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return !0;
								const t = e.params[0] || 1;
								for (let e = this._activeBuffer.scrollTop; e <= this._activeBuffer.scrollBottom; ++e) {
									const i = this._activeBuffer.lines.get(this._activeBuffer.ybase + e);
									i.insertCells(this._activeBuffer.x, t, this._activeBuffer.getNullCell(this._eraseAttrData())), i.isWrapped = !1;
								}
								return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), !0;
							}
							deleteColumns(e) {
								if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return !0;
								const t = e.params[0] || 1;
								for (let e = this._activeBuffer.scrollTop; e <= this._activeBuffer.scrollBottom; ++e) {
									const i = this._activeBuffer.lines.get(this._activeBuffer.ybase + e);
									i.deleteCells(this._activeBuffer.x, t, this._activeBuffer.getNullCell(this._eraseAttrData())), i.isWrapped = !1;
								}
								return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), !0;
							}
							eraseChars(e) {
								this._restrictCursor();
								const t = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
								return t && (t.replaceCells(this._activeBuffer.x, this._activeBuffer.x + (e.params[0] || 1), this._activeBuffer.getNullCell(this._eraseAttrData())), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), !0;
							}
							repeatPrecedingCharacter(e) {
								const t = this._parser.precedingJoinState;
								if (!t) return !0;
								const i = e.params[0] || 1, s = p.UnicodeService.extractWidth(t), r = this._activeBuffer.x - s, n = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).getString(r), o = new Uint32Array(n.length * i);
								let a = 0;
								for (let e = 0; e < n.length;) {
									const t = n.codePointAt(e) || 0;
									o[a++] = t, e += t > 65535 ? 2 : 1;
								}
								let l = a;
								for (let e = 1; e < i; ++e) o.copyWithin(l, 0, a), l += a;
								return this.print(o, 0, l), !0;
							}
							sendDeviceAttributesPrimary(e) {
								return e.params[0] > 0 || (this._is("xterm") || this._is("rxvt-unicode") || this._is("screen") ? this._coreService.triggerDataEvent(n.C0.ESC + "[?1;2c") : this._is("linux") && this._coreService.triggerDataEvent(n.C0.ESC + "[?6c")), !0;
							}
							sendDeviceAttributesSecondary(e) {
								return e.params[0] > 0 || (this._is("xterm") ? this._coreService.triggerDataEvent(n.C0.ESC + "[>0;276;0c") : this._is("rxvt-unicode") ? this._coreService.triggerDataEvent(n.C0.ESC + "[>85;95;0c") : this._is("linux") ? this._coreService.triggerDataEvent(e.params[0] + "c") : this._is("screen") && this._coreService.triggerDataEvent(n.C0.ESC + "[>83;40003;0c")), !0;
							}
							_is(e) {
								return 0 === (this._optionsService.rawOptions.termName + "").indexOf(e);
							}
							setMode(e) {
								for (let t = 0; t < e.length; t++) switch (e.params[t]) {
									case 4:
										this._coreService.modes.insertMode = !0;
										break;
									case 20: this._optionsService.options.convertEol = !0;
								}
								return !0;
							}
							setModePrivate(e) {
								for (let t = 0; t < e.length; t++) switch (e.params[t]) {
									case 1:
										this._coreService.decPrivateModes.applicationCursorKeys = !0;
										break;
									case 2:
										this._charsetService.setgCharset(0, o.DEFAULT_CHARSET), this._charsetService.setgCharset(1, o.DEFAULT_CHARSET), this._charsetService.setgCharset(2, o.DEFAULT_CHARSET), this._charsetService.setgCharset(3, o.DEFAULT_CHARSET);
										break;
									case 3:
										this._optionsService.rawOptions.windowOptions.setWinLines && (this._bufferService.resize(132, this._bufferService.rows), this._onRequestReset.fire());
										break;
									case 6:
										this._coreService.decPrivateModes.origin = !0, this._setCursor(0, 0);
										break;
									case 7:
										this._coreService.decPrivateModes.wraparound = !0;
										break;
									case 12:
										this._optionsService.options.cursorBlink = !0;
										break;
									case 45:
										this._coreService.decPrivateModes.reverseWraparound = !0;
										break;
									case 66:
										this._logService.debug("Serial port requested application keypad."), this._coreService.decPrivateModes.applicationKeypad = !0, this._onRequestSyncScrollBar.fire();
										break;
									case 9:
										this._coreMouseService.activeProtocol = "X10";
										break;
									case 1e3:
										this._coreMouseService.activeProtocol = "VT200";
										break;
									case 1002:
										this._coreMouseService.activeProtocol = "DRAG";
										break;
									case 1003:
										this._coreMouseService.activeProtocol = "ANY";
										break;
									case 1004:
										this._coreService.decPrivateModes.sendFocus = !0, this._onRequestSendFocus.fire();
										break;
									case 1005:
										this._logService.debug("DECSET 1005 not supported (see #2507)");
										break;
									case 1006:
										this._coreMouseService.activeEncoding = "SGR";
										break;
									case 1015:
										this._logService.debug("DECSET 1015 not supported (see #2507)");
										break;
									case 1016:
										this._coreMouseService.activeEncoding = "SGR_PIXELS";
										break;
									case 25:
										this._coreService.isCursorHidden = !1;
										break;
									case 1048:
										this.saveCursor();
										break;
									case 1049: this.saveCursor();
									case 47:
									case 1047:
										this._bufferService.buffers.activateAltBuffer(this._eraseAttrData()), this._coreService.isCursorInitialized = !0, this._onRequestRefreshRows.fire(void 0), this._onRequestSyncScrollBar.fire();
										break;
									case 2004:
										this._coreService.decPrivateModes.bracketedPasteMode = !0;
										break;
									case 2026: this._coreService.decPrivateModes.synchronizedOutput = !0;
								}
								return !0;
							}
							resetMode(e) {
								for (let t = 0; t < e.length; t++) switch (e.params[t]) {
									case 4:
										this._coreService.modes.insertMode = !1;
										break;
									case 20: this._optionsService.options.convertEol = !1;
								}
								return !0;
							}
							resetModePrivate(e) {
								for (let t = 0; t < e.length; t++) switch (e.params[t]) {
									case 1:
										this._coreService.decPrivateModes.applicationCursorKeys = !1;
										break;
									case 3:
										this._optionsService.rawOptions.windowOptions.setWinLines && (this._bufferService.resize(80, this._bufferService.rows), this._onRequestReset.fire());
										break;
									case 6:
										this._coreService.decPrivateModes.origin = !1, this._setCursor(0, 0);
										break;
									case 7:
										this._coreService.decPrivateModes.wraparound = !1;
										break;
									case 12:
										this._optionsService.options.cursorBlink = !1;
										break;
									case 45:
										this._coreService.decPrivateModes.reverseWraparound = !1;
										break;
									case 66:
										this._logService.debug("Switching back to normal keypad."), this._coreService.decPrivateModes.applicationKeypad = !1, this._onRequestSyncScrollBar.fire();
										break;
									case 9:
									case 1e3:
									case 1002:
									case 1003:
										this._coreMouseService.activeProtocol = "NONE";
										break;
									case 1004:
										this._coreService.decPrivateModes.sendFocus = !1;
										break;
									case 1005:
										this._logService.debug("DECRST 1005 not supported (see #2507)");
										break;
									case 1006:
									case 1016:
										this._coreMouseService.activeEncoding = "DEFAULT";
										break;
									case 1015:
										this._logService.debug("DECRST 1015 not supported (see #2507)");
										break;
									case 25:
										this._coreService.isCursorHidden = !0;
										break;
									case 1048:
										this.restoreCursor();
										break;
									case 1049:
									case 47:
									case 1047:
										this._bufferService.buffers.activateNormalBuffer(), 1049 === e.params[t] && this.restoreCursor(), this._coreService.isCursorInitialized = !0, this._onRequestRefreshRows.fire(void 0), this._onRequestSyncScrollBar.fire();
										break;
									case 2004:
										this._coreService.decPrivateModes.bracketedPasteMode = !1;
										break;
									case 2026: this._coreService.decPrivateModes.synchronizedOutput = !1, this._onRequestRefreshRows.fire(void 0);
								}
								return !0;
							}
							requestMode(e, t) {
								const i = this._coreService.decPrivateModes, { activeProtocol: s, activeEncoding: r } = this._coreMouseService, o = this._coreService, { buffers: a, cols: l } = this._bufferService, { active: h, alt: c } = a, d = this._optionsService.rawOptions, u = (e) => e ? 1 : 2, _ = e.params[0];
								return f = _, p = t ? 2 === _ ? 4 : 4 === _ ? u(o.modes.insertMode) : 12 === _ ? 3 : 20 === _ ? u(d.convertEol) : 0 : 1 === _ ? u(i.applicationCursorKeys) : 3 === _ ? d.windowOptions.setWinLines ? 80 === l ? 2 : 132 === l ? 1 : 0 : 0 : 6 === _ ? u(i.origin) : 7 === _ ? u(i.wraparound) : 8 === _ ? 3 : 9 === _ ? u("X10" === s) : 12 === _ ? u(d.cursorBlink) : 25 === _ ? u(!o.isCursorHidden) : 45 === _ ? u(i.reverseWraparound) : 66 === _ ? u(i.applicationKeypad) : 67 === _ ? 4 : 1e3 === _ ? u("VT200" === s) : 1002 === _ ? u("DRAG" === s) : 1003 === _ ? u("ANY" === s) : 1004 === _ ? u(i.sendFocus) : 1005 === _ ? 4 : 1006 === _ ? u("SGR" === r) : 1015 === _ ? 4 : 1016 === _ ? u("SGR_PIXELS" === r) : 1048 === _ ? 1 : 47 === _ || 1047 === _ || 1049 === _ ? u(h === c) : 2004 === _ ? u(i.bracketedPasteMode) : 2026 === _ ? u(i.synchronizedOutput) : 0, o.triggerDataEvent(`${n.C0.ESC}[${t ? "" : "?"}${f};${p}$y`), !0;
								var f, p;
							}
							_updateAttrColor(e, t, i, s, r) {
								return 2 === t ? (e |= 50331648, e &= -16777216, e |= _.AttributeData.fromColorRGB([
									i,
									s,
									r
								])) : 5 === t && (e &= -50331904, e |= 33554432 | 255 & i), e;
							}
							_extractColor(e, t, i) {
								const s = [
									0,
									0,
									-1,
									0,
									0,
									0
								];
								let r = 0, n = 0;
								do {
									if (s[n + r] = e.params[t + n], e.hasSubParams(t + n)) {
										const i = e.getSubParams(t + n);
										let o = 0;
										do
											5 === s[1] && (r = 1), s[n + o + 1 + r] = i[o];
										while (++o < i.length && o + n + 1 + r < s.length);
										break;
									}
									if (5 === s[1] && n + r >= 2 || 2 === s[1] && n + r >= 5) break;
									s[1] && (r = 1);
								} while (++n + t < e.length && n + r < s.length);
								for (let e = 2; e < s.length; ++e) -1 === s[e] && (s[e] = 0);
								switch (s[0]) {
									case 38:
										i.fg = this._updateAttrColor(i.fg, s[1], s[3], s[4], s[5]);
										break;
									case 48:
										i.bg = this._updateAttrColor(i.bg, s[1], s[3], s[4], s[5]);
										break;
									case 58: i.extended = i.extended.clone(), i.extended.underlineColor = this._updateAttrColor(i.extended.underlineColor, s[1], s[3], s[4], s[5]);
								}
								return n;
							}
							_processUnderline(e, t) {
								t.extended = t.extended.clone(), (!~e || e > 5) && (e = 1), t.extended.underlineStyle = e, t.fg |= 268435456, 0 === e && (t.fg &= -268435457), t.updateExtended();
							}
							_processSGR0(e) {
								e.fg = c.DEFAULT_ATTR_DATA.fg, e.bg = c.DEFAULT_ATTR_DATA.bg, e.extended = e.extended.clone(), e.extended.underlineStyle = 0, e.extended.underlineColor &= -67108864, e.updateExtended();
							}
							charAttributes(e) {
								if (1 === e.length && 0 === e.params[0]) return this._processSGR0(this._curAttrData), !0;
								const t = e.length;
								let i;
								const s = this._curAttrData;
								for (let r = 0; r < t; r++) i = e.params[r], i >= 30 && i <= 37 ? (s.fg &= -50331904, s.fg |= 16777216 | i - 30) : i >= 40 && i <= 47 ? (s.bg &= -50331904, s.bg |= 16777216 | i - 40) : i >= 90 && i <= 97 ? (s.fg &= -50331904, s.fg |= 16777224 | i - 90) : i >= 100 && i <= 107 ? (s.bg &= -50331904, s.bg |= 16777224 | i - 100) : 0 === i ? this._processSGR0(s) : 1 === i ? s.fg |= 134217728 : 3 === i ? s.bg |= 67108864 : 4 === i ? (s.fg |= 268435456, this._processUnderline(e.hasSubParams(r) ? e.getSubParams(r)[0] : 1, s)) : 5 === i ? s.fg |= 536870912 : 7 === i ? s.fg |= 67108864 : 8 === i ? s.fg |= 1073741824 : 9 === i ? s.fg |= 2147483648 : 2 === i ? s.bg |= 134217728 : 21 === i ? this._processUnderline(2, s) : 22 === i ? (s.fg &= -134217729, s.bg &= -134217729) : 23 === i ? s.bg &= -67108865 : 24 === i ? (s.fg &= -268435457, this._processUnderline(0, s)) : 25 === i ? s.fg &= -536870913 : 27 === i ? s.fg &= -67108865 : 28 === i ? s.fg &= -1073741825 : 29 === i ? s.fg &= 2147483647 : 39 === i ? (s.fg &= -67108864, s.fg |= 16777215 & c.DEFAULT_ATTR_DATA.fg) : 49 === i ? (s.bg &= -67108864, s.bg |= 16777215 & c.DEFAULT_ATTR_DATA.bg) : 38 === i || 48 === i || 58 === i ? r += this._extractColor(e, r, s) : 53 === i ? s.bg |= 1073741824 : 55 === i ? s.bg &= -1073741825 : 59 === i ? (s.extended = s.extended.clone(), s.extended.underlineColor = -1, s.updateExtended()) : 100 === i ? (s.fg &= -67108864, s.fg |= 16777215 & c.DEFAULT_ATTR_DATA.fg, s.bg &= -67108864, s.bg |= 16777215 & c.DEFAULT_ATTR_DATA.bg) : this._logService.debug("Unknown SGR attribute: %d.", i);
								return !0;
							}
							deviceStatus(e) {
								switch (e.params[0]) {
									case 5:
										this._coreService.triggerDataEvent(`${n.C0.ESC}[0n`);
										break;
									case 6:
										const e = this._activeBuffer.y + 1, t = this._activeBuffer.x + 1;
										this._coreService.triggerDataEvent(`${n.C0.ESC}[${e};${t}R`);
								}
								return !0;
							}
							deviceStatusPrivate(e) {
								if (6 === e.params[0]) {
									const e = this._activeBuffer.y + 1, t = this._activeBuffer.x + 1;
									this._coreService.triggerDataEvent(`${n.C0.ESC}[?${e};${t}R`);
								}
								return !0;
							}
							softReset(e) {
								return this._coreService.isCursorHidden = !1, this._onRequestSyncScrollBar.fire(), this._activeBuffer.scrollTop = 0, this._activeBuffer.scrollBottom = this._bufferService.rows - 1, this._curAttrData = c.DEFAULT_ATTR_DATA.clone(), this._coreService.reset(), this._charsetService.reset(), this._activeBuffer.savedX = 0, this._activeBuffer.savedY = this._activeBuffer.ybase, this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg, this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg, this._activeBuffer.savedCharset = this._charsetService.charset, this._coreService.decPrivateModes.origin = !1, !0;
							}
							setCursorStyle(e) {
								const t = 0 === e.length ? 1 : e.params[0];
								if (0 === t) this._coreService.decPrivateModes.cursorStyle = void 0, this._coreService.decPrivateModes.cursorBlink = void 0;
								else {
									switch (t) {
										case 1:
										case 2:
											this._coreService.decPrivateModes.cursorStyle = "block";
											break;
										case 3:
										case 4:
											this._coreService.decPrivateModes.cursorStyle = "underline";
											break;
										case 5:
										case 6: this._coreService.decPrivateModes.cursorStyle = "bar";
									}
									const e = t % 2 == 1;
									this._coreService.decPrivateModes.cursorBlink = e;
								}
								return !0;
							}
							setScrollRegion(e) {
								const t = e.params[0] || 1;
								let i;
								return (e.length < 2 || (i = e.params[1]) > this._bufferService.rows || 0 === i) && (i = this._bufferService.rows), i > t && (this._activeBuffer.scrollTop = t - 1, this._activeBuffer.scrollBottom = i - 1, this._setCursor(0, 0)), !0;
							}
							windowOptions(e) {
								if (!y(e.params[0], this._optionsService.rawOptions.windowOptions)) return !0;
								const t = e.length > 1 ? e.params[1] : 0;
								switch (e.params[0]) {
									case 14:
										2 !== t && this._onRequestWindowsOptionsReport.fire(w.GET_WIN_SIZE_PIXELS);
										break;
									case 16:
										this._onRequestWindowsOptionsReport.fire(w.GET_CELL_SIZE_PIXELS);
										break;
									case 18:
										this._bufferService && this._coreService.triggerDataEvent(`${n.C0.ESC}[8;${this._bufferService.rows};${this._bufferService.cols}t`);
										break;
									case 22:
										0 !== t && 2 !== t || (this._windowTitleStack.push(this._windowTitle), this._windowTitleStack.length > 10 && this._windowTitleStack.shift()), 0 !== t && 1 !== t || (this._iconNameStack.push(this._iconName), this._iconNameStack.length > 10 && this._iconNameStack.shift());
										break;
									case 23: 0 !== t && 2 !== t || this._windowTitleStack.length && this.setTitle(this._windowTitleStack.pop()), 0 !== t && 1 !== t || this._iconNameStack.length && this.setIconName(this._iconNameStack.pop());
								}
								return !0;
							}
							saveCursor(e) {
								return this._activeBuffer.savedX = this._activeBuffer.x, this._activeBuffer.savedY = this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg, this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg, this._activeBuffer.savedCharset = this._charsetService.charset, !0;
							}
							restoreCursor(e) {
								return this._activeBuffer.x = this._activeBuffer.savedX || 0, this._activeBuffer.y = Math.max(this._activeBuffer.savedY - this._activeBuffer.ybase, 0), this._curAttrData.fg = this._activeBuffer.savedCurAttrData.fg, this._curAttrData.bg = this._activeBuffer.savedCurAttrData.bg, this._charsetService.charset = this._savedCharset, this._activeBuffer.savedCharset && (this._charsetService.charset = this._activeBuffer.savedCharset), this._restrictCursor(), !0;
							}
							setTitle(e) {
								return this._windowTitle = e, this._onTitleChange.fire(e), !0;
							}
							setIconName(e) {
								return this._iconName = e, !0;
							}
							setOrReportIndexedColor(e) {
								const t = [], i = e.split(";");
								for (; i.length > 1;) {
									const e = i.shift(), s = i.shift();
									if (/^\d+$/.exec(e)) {
										const i = parseInt(e);
										if (R(i)) if ("?" === s) t.push({
											type: 0,
											index: i
										});
										else {
											const e = (0, v.parseColor)(s);
											e && t.push({
												type: 1,
												index: i,
												color: e
											});
										}
									}
								}
								return t.length && this._onColor.fire(t), !0;
							}
							setHyperlink(e) {
								const t = e.indexOf(";");
								if (-1 === t) return !0;
								const i = e.slice(0, t).trim(), s = e.slice(t + 1);
								return s ? this._createHyperlink(i, s) : !i.trim() && this._finishHyperlink();
							}
							_createHyperlink(e, t) {
								this._getCurrentLinkId() && this._finishHyperlink();
								const i = e.split(":");
								let s;
								const r = i.findIndex(((e) => e.startsWith("id=")));
								return -1 !== r && (s = i[r].slice(3) || void 0), this._curAttrData.extended = this._curAttrData.extended.clone(), this._curAttrData.extended.urlId = this._oscLinkService.registerLink({
									id: s,
									uri: t
								}), this._curAttrData.updateExtended(), !0;
							}
							_finishHyperlink() {
								return this._curAttrData.extended = this._curAttrData.extended.clone(), this._curAttrData.extended.urlId = 0, this._curAttrData.updateExtended(), !0;
							}
							_setOrReportSpecialColor(e, t) {
								const i = e.split(";");
								for (let e = 0; e < i.length && !(t >= this._specialColors.length); ++e, ++t) if ("?" === i[e]) this._onColor.fire([{
									type: 0,
									index: this._specialColors[t]
								}]);
								else {
									const s = (0, v.parseColor)(i[e]);
									s && this._onColor.fire([{
										type: 1,
										index: this._specialColors[t],
										color: s
									}]);
								}
								return !0;
							}
							setOrReportFgColor(e) {
								return this._setOrReportSpecialColor(e, 0);
							}
							setOrReportBgColor(e) {
								return this._setOrReportSpecialColor(e, 1);
							}
							setOrReportCursorColor(e) {
								return this._setOrReportSpecialColor(e, 2);
							}
							restoreIndexedColor(e) {
								if (!e) return this._onColor.fire([{ type: 2 }]), !0;
								const t = [], i = e.split(";");
								for (let e = 0; e < i.length; ++e) if (/^\d+$/.exec(i[e])) {
									const s = parseInt(i[e]);
									R(s) && t.push({
										type: 2,
										index: s
									});
								}
								return t.length && this._onColor.fire(t), !0;
							}
							restoreFgColor(e) {
								return this._onColor.fire([{
									type: 2,
									index: 256
								}]), !0;
							}
							restoreBgColor(e) {
								return this._onColor.fire([{
									type: 2,
									index: 257
								}]), !0;
							}
							restoreCursorColor(e) {
								return this._onColor.fire([{
									type: 2,
									index: 258
								}]), !0;
							}
							nextLine() {
								return this._activeBuffer.x = 0, this.index(), !0;
							}
							keypadApplicationMode() {
								return this._logService.debug("Serial port requested application keypad."), this._coreService.decPrivateModes.applicationKeypad = !0, this._onRequestSyncScrollBar.fire(), !0;
							}
							keypadNumericMode() {
								return this._logService.debug("Switching back to normal keypad."), this._coreService.decPrivateModes.applicationKeypad = !1, this._onRequestSyncScrollBar.fire(), !0;
							}
							selectDefaultCharset() {
								return this._charsetService.setgLevel(0), this._charsetService.setgCharset(0, o.DEFAULT_CHARSET), !0;
							}
							selectCharset(e) {
								return 2 !== e.length ? (this.selectDefaultCharset(), !0) : ("/" === e[0] || this._charsetService.setgCharset(b[e[0]], o.CHARSETS[e[1]] || o.DEFAULT_CHARSET), !0);
							}
							index() {
								return this._restrictCursor(), this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData())) : this._activeBuffer.y >= this._bufferService.rows && (this._activeBuffer.y = this._bufferService.rows - 1), this._restrictCursor(), !0;
							}
							tabSet() {
								return this._activeBuffer.tabs[this._activeBuffer.x] = !0, !0;
							}
							reverseIndex() {
								if (this._restrictCursor(), this._activeBuffer.y === this._activeBuffer.scrollTop) {
									const e = this._activeBuffer.scrollBottom - this._activeBuffer.scrollTop;
									this._activeBuffer.lines.shiftElements(this._activeBuffer.ybase + this._activeBuffer.y, e, 1), this._activeBuffer.lines.set(this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.getBlankLine(this._eraseAttrData())), this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
								} else this._activeBuffer.y--, this._restrictCursor();
								return !0;
							}
							fullReset() {
								return this._parser.reset(), this._onRequestReset.fire(), !0;
							}
							reset() {
								this._curAttrData = c.DEFAULT_ATTR_DATA.clone(), this._eraseAttrDataInternal = c.DEFAULT_ATTR_DATA.clone();
							}
							_eraseAttrData() {
								return this._eraseAttrDataInternal.bg &= -67108864, this._eraseAttrDataInternal.bg |= 67108863 & this._curAttrData.bg, this._eraseAttrDataInternal;
							}
							setgLevel(e) {
								return this._charsetService.setgLevel(e), !0;
							}
							screenAlignmentPattern() {
								const e = new u.CellData();
								e.content = 1 << 22 | "E".charCodeAt(0), e.fg = this._curAttrData.fg, e.bg = this._curAttrData.bg, this._setCursor(0, 0);
								for (let t = 0; t < this._bufferService.rows; ++t) {
									const i = this._activeBuffer.ybase + this._activeBuffer.y + t, s = this._activeBuffer.lines.get(i);
									s && (s.fill(e), s.isWrapped = !1);
								}
								return this._dirtyRowTracker.markAllDirty(), this._setCursor(0, 0), !0;
							}
							requestStatusString(e, t) {
								const i = this._bufferService.buffer, s = this._optionsService.rawOptions;
								return ((e) => (this._coreService.triggerDataEvent(`${n.C0.ESC}${e}${n.C0.ESC}\\`), !0))("\"q" === e ? `P1$r${this._curAttrData.isProtected() ? 1 : 0}"q` : "\"p" === e ? "P1$r61;1\"p" : "r" === e ? `P1$r${i.scrollTop + 1};${i.scrollBottom + 1}r` : "m" === e ? "P1$r0m" : " q" === e ? `P1$r${{
									block: 2,
									underline: 4,
									bar: 6
								}[s.cursorStyle] - (s.cursorBlink ? 1 : 0)} q` : "P0$r");
							}
							markRangeDirty(e, t) {
								this._dirtyRowTracker.markRangeDirty(e, t);
							}
						}
						t.InputHandler = D;
						let L = class {
							constructor(e) {
								this._bufferService = e, this.clearRange();
							}
							clearRange() {
								this.start = this._bufferService.buffer.y, this.end = this._bufferService.buffer.y;
							}
							markDirty(e) {
								e < this.start ? this.start = e : e > this.end && (this.end = e);
							}
							markRangeDirty(e, t) {
								e > t && (E = e, e = t, t = E), e < this.start && (this.start = e), t > this.end && (this.end = t);
							}
							markAllDirty() {
								this.markRangeDirty(0, this._bufferService.rows - 1);
							}
						};
						function R(e) {
							return 0 <= e && e < 256;
						}
						L = s([r(0, f.IBufferService)], L);
					},
					7710: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.FourKeyMap = t.TwoKeyMap = void 0;
						class i {
							constructor() {
								this._data = {};
							}
							set(e, t, i) {
								this._data[e] || (this._data[e] = {}), this._data[e][t] = i;
							}
							get(e, t) {
								return this._data[e] ? this._data[e][t] : void 0;
							}
							clear() {
								this._data = {};
							}
						}
						t.TwoKeyMap = i, t.FourKeyMap = class {
							constructor() {
								this._data = new i();
							}
							set(e, t, s, r, n) {
								this._data.get(e, t) || this._data.set(e, t, new i()), this._data.get(e, t).set(s, r, n);
							}
							get(e, t, i, s) {
								return this._data.get(e, t)?.get(i, s);
							}
							clear() {
								this._data.clear();
							}
						};
					},
					701: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.isChromeOS = t.isLinux = t.isWindows = t.isIphone = t.isIpad = t.isMac = t.isSafari = t.isLegacyEdge = t.isFirefox = t.isNode = void 0, t.getSafariVersion = function() {
							if (!t.isSafari) return 0;
							const e = i.match(/Version\/(\d+)/);
							return null === e || e.length < 2 ? 0 : parseInt(e[1]);
						}, t.isNode = "undefined" != typeof process && "title" in process;
						const i = t.isNode ? "node" : navigator.userAgent, s = t.isNode ? "node" : navigator.platform;
						t.isFirefox = i.includes("Firefox"), t.isLegacyEdge = i.includes("Edge"), t.isSafari = /^((?!chrome|android).)*safari/i.test(i), t.isMac = [
							"Macintosh",
							"MacIntel",
							"MacPPC",
							"Mac68K"
						].includes(s), t.isIpad = "iPad" === s, t.isIphone = "iPhone" === s, t.isWindows = [
							"Windows",
							"Win16",
							"Win32",
							"WinCE"
						].includes(s), t.isLinux = s.indexOf("Linux") >= 0, t.isChromeOS = /\bCrOS\b/.test(i);
					},
					3087: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.SortedList = void 0;
						const s = i(6168);
						let r = 0;
						t.SortedList = class {
							constructor(e) {
								this._getKey = e, this._array = [], this._insertedValues = [], this._flushInsertedTask = new s.IdleTaskQueue(), this._isFlushingInserted = !1, this._deletedIndices = [], this._flushDeletedTask = new s.IdleTaskQueue(), this._isFlushingDeleted = !1;
							}
							clear() {
								this._array.length = 0, this._insertedValues.length = 0, this._flushInsertedTask.clear(), this._isFlushingInserted = !1, this._deletedIndices.length = 0, this._flushDeletedTask.clear(), this._isFlushingDeleted = !1;
							}
							insert(e) {
								this._flushCleanupDeleted(), 0 === this._insertedValues.length && this._flushInsertedTask.enqueue((() => this._flushInserted())), this._insertedValues.push(e);
							}
							_flushInserted() {
								const e = this._insertedValues.sort(((e, t) => this._getKey(e) - this._getKey(t)));
								let t = 0, i = 0;
								const s = new Array(this._array.length + this._insertedValues.length);
								for (let r = 0; r < s.length; r++) i >= this._array.length || this._getKey(e[t]) <= this._getKey(this._array[i]) ? (s[r] = e[t], t++) : s[r] = this._array[i++];
								this._array = s, this._insertedValues.length = 0;
							}
							_flushCleanupInserted() {
								!this._isFlushingInserted && this._insertedValues.length > 0 && this._flushInsertedTask.flush();
							}
							delete(e) {
								if (this._flushCleanupInserted(), 0 === this._array.length) return !1;
								const t = this._getKey(e);
								if (void 0 === t) return !1;
								if (r = this._search(t), -1 === r) return !1;
								if (this._getKey(this._array[r]) !== t) return !1;
								do
									if (this._array[r] === e) return 0 === this._deletedIndices.length && this._flushDeletedTask.enqueue((() => this._flushDeleted())), this._deletedIndices.push(r), !0;
								while (++r < this._array.length && this._getKey(this._array[r]) === t);
								return !1;
							}
							_flushDeleted() {
								this._isFlushingDeleted = !0;
								const e = this._deletedIndices.sort(((e, t) => e - t));
								let t = 0;
								const i = new Array(this._array.length - e.length);
								let s = 0;
								for (let r = 0; r < this._array.length; r++) e[t] === r ? t++ : i[s++] = this._array[r];
								this._array = i, this._deletedIndices.length = 0, this._isFlushingDeleted = !1;
							}
							_flushCleanupDeleted() {
								!this._isFlushingDeleted && this._deletedIndices.length > 0 && this._flushDeletedTask.flush();
							}
							*getKeyIterator(e) {
								if (this._flushCleanupInserted(), this._flushCleanupDeleted(), 0 !== this._array.length && (r = this._search(e), !(r < 0 || r >= this._array.length) && this._getKey(this._array[r]) === e)) do
									yield this._array[r];
								while (++r < this._array.length && this._getKey(this._array[r]) === e);
							}
							forEachByKey(e, t) {
								if (this._flushCleanupInserted(), this._flushCleanupDeleted(), 0 !== this._array.length && (r = this._search(e), !(r < 0 || r >= this._array.length) && this._getKey(this._array[r]) === e)) do
									t(this._array[r]);
								while (++r < this._array.length && this._getKey(this._array[r]) === e);
							}
							values() {
								return this._flushCleanupInserted(), this._flushCleanupDeleted(), [...this._array].values();
							}
							_search(e) {
								let t = 0, i = this._array.length - 1;
								for (; i >= t;) {
									let s = t + i >> 1;
									const r = this._getKey(this._array[s]);
									if (r > e) i = s - 1;
									else {
										if (!(r < e)) {
											for (; s > 0 && this._getKey(this._array[s - 1]) === e;) s--;
											return s;
										}
										t = s + 1;
									}
								}
								return t;
							}
						};
					},
					6168: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.DebouncedIdleTask = t.IdleTaskQueue = t.PriorityTaskQueue = void 0;
						const s = i(701);
						class r {
							constructor() {
								this._tasks = [], this._i = 0;
							}
							enqueue(e) {
								this._tasks.push(e), this._start();
							}
							flush() {
								for (; this._i < this._tasks.length;) this._tasks[this._i]() || this._i++;
								this.clear();
							}
							clear() {
								this._idleCallback && (this._cancelCallback(this._idleCallback), this._idleCallback = void 0), this._i = 0, this._tasks.length = 0;
							}
							_start() {
								this._idleCallback || (this._idleCallback = this._requestCallback(this._process.bind(this)));
							}
							_process(e) {
								this._idleCallback = void 0;
								let t = 0, i = 0, s = e.timeRemaining(), r = 0;
								for (; this._i < this._tasks.length;) {
									if (t = performance.now(), this._tasks[this._i]() || this._i++, t = Math.max(1, performance.now() - t), i = Math.max(t, i), r = e.timeRemaining(), 1.5 * i > r) return s - t < -20 && console.warn(`task queue exceeded allotted deadline by ${Math.abs(Math.round(s - t))}ms`), void this._start();
									s = r;
								}
								this.clear();
							}
						}
						class n extends r {
							_requestCallback(e) {
								return setTimeout((() => e(this._createDeadline(16))));
							}
							_cancelCallback(e) {
								clearTimeout(e);
							}
							_createDeadline(e) {
								const t = performance.now() + e;
								return { timeRemaining: () => Math.max(0, t - performance.now()) };
							}
						}
						t.PriorityTaskQueue = n, t.IdleTaskQueue = !s.isNode && "requestIdleCallback" in window ? class extends r {
							_requestCallback(e) {
								return requestIdleCallback(e);
							}
							_cancelCallback(e) {
								cancelIdleCallback(e);
							}
						} : n, t.DebouncedIdleTask = class {
							constructor() {
								this._queue = new t.IdleTaskQueue();
							}
							set(e) {
								this._queue.clear(), this._queue.enqueue(e);
							}
							flush() {
								this._queue.flush();
							}
						};
					},
					5882: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.updateWindowsModeWrappedState = function(e) {
							const i = e.buffer.lines.get(e.buffer.ybase + e.buffer.y - 1)?.get(e.cols - 1), r = e.buffer.lines.get(e.buffer.ybase + e.buffer.y);
							r && i && (r.isWrapped = i[s.CHAR_DATA_CODE_INDEX] !== s.NULL_CELL_CODE && i[s.CHAR_DATA_CODE_INDEX] !== s.WHITESPACE_CELL_CODE);
						};
						const s = i(8938);
					},
					5451: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.ExtendedAttrs = t.AttributeData = void 0;
						class i {
							constructor() {
								this.fg = 0, this.bg = 0, this.extended = new s();
							}
							static toColorRGB(e) {
								return [
									e >>> 16 & 255,
									e >>> 8 & 255,
									255 & e
								];
							}
							static fromColorRGB(e) {
								return (255 & e[0]) << 16 | (255 & e[1]) << 8 | 255 & e[2];
							}
							clone() {
								const e = new i();
								return e.fg = this.fg, e.bg = this.bg, e.extended = this.extended.clone(), e;
							}
							isInverse() {
								return 67108864 & this.fg;
							}
							isBold() {
								return 134217728 & this.fg;
							}
							isUnderline() {
								return this.hasExtendedAttrs() && 0 !== this.extended.underlineStyle ? 1 : 268435456 & this.fg;
							}
							isBlink() {
								return 536870912 & this.fg;
							}
							isInvisible() {
								return 1073741824 & this.fg;
							}
							isItalic() {
								return 67108864 & this.bg;
							}
							isDim() {
								return 134217728 & this.bg;
							}
							isStrikethrough() {
								return 2147483648 & this.fg;
							}
							isProtected() {
								return 536870912 & this.bg;
							}
							isOverline() {
								return 1073741824 & this.bg;
							}
							getFgColorMode() {
								return 50331648 & this.fg;
							}
							getBgColorMode() {
								return 50331648 & this.bg;
							}
							isFgRGB() {
								return !(50331648 & ~this.fg);
							}
							isBgRGB() {
								return !(50331648 & ~this.bg);
							}
							isFgPalette() {
								return 16777216 == (50331648 & this.fg) || 33554432 == (50331648 & this.fg);
							}
							isBgPalette() {
								return 16777216 == (50331648 & this.bg) || 33554432 == (50331648 & this.bg);
							}
							isFgDefault() {
								return !(50331648 & this.fg);
							}
							isBgDefault() {
								return !(50331648 & this.bg);
							}
							isAttributeDefault() {
								return 0 === this.fg && 0 === this.bg;
							}
							getFgColor() {
								switch (50331648 & this.fg) {
									case 16777216:
									case 33554432: return 255 & this.fg;
									case 50331648: return 16777215 & this.fg;
									default: return -1;
								}
							}
							getBgColor() {
								switch (50331648 & this.bg) {
									case 16777216:
									case 33554432: return 255 & this.bg;
									case 50331648: return 16777215 & this.bg;
									default: return -1;
								}
							}
							hasExtendedAttrs() {
								return 268435456 & this.bg;
							}
							updateExtended() {
								this.extended.isEmpty() ? this.bg &= -268435457 : this.bg |= 268435456;
							}
							getUnderlineColor() {
								if (268435456 & this.bg && ~this.extended.underlineColor) switch (50331648 & this.extended.underlineColor) {
									case 16777216:
									case 33554432: return 255 & this.extended.underlineColor;
									case 50331648: return 16777215 & this.extended.underlineColor;
									default: return this.getFgColor();
								}
								return this.getFgColor();
							}
							getUnderlineColorMode() {
								return 268435456 & this.bg && ~this.extended.underlineColor ? 50331648 & this.extended.underlineColor : this.getFgColorMode();
							}
							isUnderlineColorRGB() {
								return 268435456 & this.bg && ~this.extended.underlineColor ? !(50331648 & ~this.extended.underlineColor) : this.isFgRGB();
							}
							isUnderlineColorPalette() {
								return 268435456 & this.bg && ~this.extended.underlineColor ? 16777216 == (50331648 & this.extended.underlineColor) || 33554432 == (50331648 & this.extended.underlineColor) : this.isFgPalette();
							}
							isUnderlineColorDefault() {
								return 268435456 & this.bg && ~this.extended.underlineColor ? !(50331648 & this.extended.underlineColor) : this.isFgDefault();
							}
							getUnderlineStyle() {
								return 268435456 & this.fg ? 268435456 & this.bg ? this.extended.underlineStyle : 1 : 0;
							}
							getUnderlineVariantOffset() {
								return this.extended.underlineVariantOffset;
							}
						}
						t.AttributeData = i;
						class s {
							get ext() {
								return this._urlId ? -469762049 & this._ext | this.underlineStyle << 26 : this._ext;
							}
							set ext(e) {
								this._ext = e;
							}
							get underlineStyle() {
								return this._urlId ? 5 : (469762048 & this._ext) >> 26;
							}
							set underlineStyle(e) {
								this._ext &= -469762049, this._ext |= e << 26 & 469762048;
							}
							get underlineColor() {
								return 67108863 & this._ext;
							}
							set underlineColor(e) {
								this._ext &= -67108864, this._ext |= 67108863 & e;
							}
							get urlId() {
								return this._urlId;
							}
							set urlId(e) {
								this._urlId = e;
							}
							get underlineVariantOffset() {
								const e = (3758096384 & this._ext) >> 29;
								return e < 0 ? 4294967288 ^ e : e;
							}
							set underlineVariantOffset(e) {
								this._ext &= 536870911, this._ext |= e << 29 & 3758096384;
							}
							constructor(e = 0, t = 0) {
								this._ext = 0, this._urlId = 0, this._ext = e, this._urlId = t;
							}
							clone() {
								return new s(this._ext, this._urlId);
							}
							isEmpty() {
								return 0 === this.underlineStyle && 0 === this._urlId;
							}
						}
						t.ExtendedAttrs = s;
					},
					1073: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.Buffer = t.MAX_BUFFER_SIZE = void 0;
						const s = i(5639), r = i(6168), n = i(5451), o = i(6107), a = i(732), l = i(3055), h = i(8938), c = i(8158), d = i(6760);
						t.MAX_BUFFER_SIZE = 4294967295, t.Buffer = class {
							constructor(e, t, i) {
								this._hasScrollback = e, this._optionsService = t, this._bufferService = i, this.ydisp = 0, this.ybase = 0, this.y = 0, this.x = 0, this.tabs = {}, this.savedY = 0, this.savedX = 0, this.savedCurAttrData = o.DEFAULT_ATTR_DATA.clone(), this.savedCharset = d.DEFAULT_CHARSET, this.markers = [], this._nullCell = l.CellData.fromCharData([
									0,
									h.NULL_CELL_CHAR,
									h.NULL_CELL_WIDTH,
									h.NULL_CELL_CODE
								]), this._whitespaceCell = l.CellData.fromCharData([
									0,
									h.WHITESPACE_CELL_CHAR,
									h.WHITESPACE_CELL_WIDTH,
									h.WHITESPACE_CELL_CODE
								]), this._isClearing = !1, this._memoryCleanupQueue = new r.IdleTaskQueue(), this._memoryCleanupPosition = 0, this._cols = this._bufferService.cols, this._rows = this._bufferService.rows, this.lines = new s.CircularList(this._getCorrectBufferLength(this._rows)), this.scrollTop = 0, this.scrollBottom = this._rows - 1, this.setupTabStops();
							}
							getNullCell(e) {
								return e ? (this._nullCell.fg = e.fg, this._nullCell.bg = e.bg, this._nullCell.extended = e.extended) : (this._nullCell.fg = 0, this._nullCell.bg = 0, this._nullCell.extended = new n.ExtendedAttrs()), this._nullCell;
							}
							getWhitespaceCell(e) {
								return e ? (this._whitespaceCell.fg = e.fg, this._whitespaceCell.bg = e.bg, this._whitespaceCell.extended = e.extended) : (this._whitespaceCell.fg = 0, this._whitespaceCell.bg = 0, this._whitespaceCell.extended = new n.ExtendedAttrs()), this._whitespaceCell;
							}
							getBlankLine(e, t) {
								return new o.BufferLine(this._bufferService.cols, this.getNullCell(e), t);
							}
							get hasScrollback() {
								return this._hasScrollback && this.lines.maxLength > this._rows;
							}
							get isCursorInViewport() {
								const e = this.ybase + this.y - this.ydisp;
								return e >= 0 && e < this._rows;
							}
							_getCorrectBufferLength(e) {
								if (!this._hasScrollback) return e;
								const i = e + this._optionsService.rawOptions.scrollback;
								return i > t.MAX_BUFFER_SIZE ? t.MAX_BUFFER_SIZE : i;
							}
							fillViewportRows(e) {
								if (0 === this.lines.length) {
									void 0 === e && (e = o.DEFAULT_ATTR_DATA);
									let t = this._rows;
									for (; t--;) this.lines.push(this.getBlankLine(e));
								}
							}
							clear() {
								this.ydisp = 0, this.ybase = 0, this.y = 0, this.x = 0, this.lines = new s.CircularList(this._getCorrectBufferLength(this._rows)), this.scrollTop = 0, this.scrollBottom = this._rows - 1, this.setupTabStops();
							}
							resize(e, t) {
								const i = this.getNullCell(o.DEFAULT_ATTR_DATA);
								let s = 0;
								const r = this._getCorrectBufferLength(t);
								if (r > this.lines.maxLength && (this.lines.maxLength = r), this.lines.length > 0) {
									if (this._cols < e) for (let t = 0; t < this.lines.length; t++) s += +this.lines.get(t).resize(e, i);
									let n = 0;
									if (this._rows < t) for (let s = this._rows; s < t; s++) this.lines.length < t + this.ybase && (this._optionsService.rawOptions.windowsMode || void 0 !== this._optionsService.rawOptions.windowsPty.backend || void 0 !== this._optionsService.rawOptions.windowsPty.buildNumber ? this.lines.push(new o.BufferLine(e, i)) : this.ybase > 0 && this.lines.length <= this.ybase + this.y + n + 1 ? (this.ybase--, n++, this.ydisp > 0 && this.ydisp--) : this.lines.push(new o.BufferLine(e, i)));
									else for (let e = this._rows; e > t; e--) this.lines.length > t + this.ybase && (this.lines.length > this.ybase + this.y + 1 ? this.lines.pop() : (this.ybase++, this.ydisp++));
									if (r < this.lines.maxLength) {
										const e = this.lines.length - r;
										e > 0 && (this.lines.trimStart(e), this.ybase = Math.max(this.ybase - e, 0), this.ydisp = Math.max(this.ydisp - e, 0), this.savedY = Math.max(this.savedY - e, 0)), this.lines.maxLength = r;
									}
									this.x = Math.min(this.x, e - 1), this.y = Math.min(this.y, t - 1), n && (this.y += n), this.savedX = Math.min(this.savedX, e - 1), this.scrollTop = 0;
								}
								if (this.scrollBottom = t - 1, this._isReflowEnabled && (this._reflow(e, t), this._cols > e)) for (let t = 0; t < this.lines.length; t++) s += +this.lines.get(t).resize(e, i);
								this._cols = e, this._rows = t, this._memoryCleanupQueue.clear(), s > .1 * this.lines.length && (this._memoryCleanupPosition = 0, this._memoryCleanupQueue.enqueue((() => this._batchedMemoryCleanup())));
							}
							_batchedMemoryCleanup() {
								let e = !0;
								this._memoryCleanupPosition >= this.lines.length && (this._memoryCleanupPosition = 0, e = !1);
								let t = 0;
								for (; this._memoryCleanupPosition < this.lines.length;) if (t += this.lines.get(this._memoryCleanupPosition++).cleanupMemory(), t > 100) return !0;
								return e;
							}
							get _isReflowEnabled() {
								const e = this._optionsService.rawOptions.windowsPty;
								return e && e.buildNumber ? this._hasScrollback && "conpty" === e.backend && e.buildNumber >= 21376 : this._hasScrollback && !this._optionsService.rawOptions.windowsMode;
							}
							_reflow(e, t) {
								this._cols !== e && (e > this._cols ? this._reflowLarger(e, t) : this._reflowSmaller(e, t));
							}
							_reflowLarger(e, t) {
								const i = this._optionsService.rawOptions.reflowCursorLine, s = (0, a.reflowLargerGetLinesToRemove)(this.lines, this._cols, e, this.ybase + this.y, this.getNullCell(o.DEFAULT_ATTR_DATA), i);
								if (s.length > 0) {
									const i = (0, a.reflowLargerCreateNewLayout)(this.lines, s);
									(0, a.reflowLargerApplyNewLayout)(this.lines, i.layout), this._reflowLargerAdjustViewport(e, t, i.countRemoved);
								}
							}
							_reflowLargerAdjustViewport(e, t, i) {
								const s = this.getNullCell(o.DEFAULT_ATTR_DATA);
								let r = i;
								for (; r-- > 0;) 0 === this.ybase ? (this.y > 0 && this.y--, this.lines.length < t && this.lines.push(new o.BufferLine(e, s))) : (this.ydisp === this.ybase && this.ydisp--, this.ybase--);
								this.savedY = Math.max(this.savedY - i, 0);
							}
							_reflowSmaller(e, t) {
								const i = this._optionsService.rawOptions.reflowCursorLine, s = this.getNullCell(o.DEFAULT_ATTR_DATA), r = [];
								let n = 0;
								for (let l = this.lines.length - 1; l >= 0; l--) {
									let h = this.lines.get(l);
									if (!h || !h.isWrapped && h.getTrimmedLength() <= e) continue;
									const c = [h];
									for (; h.isWrapped && l > 0;) h = this.lines.get(--l), c.unshift(h);
									if (!i) {
										const e = this.ybase + this.y;
										if (e >= l && e < l + c.length) continue;
									}
									const d = c[c.length - 1].getTrimmedLength(), u = (0, a.reflowSmallerGetNewLineLengths)(c, this._cols, e), _ = u.length - c.length;
									let f;
									f = 0 === this.ybase && this.y !== this.lines.length - 1 ? Math.max(0, this.y - this.lines.maxLength + _) : Math.max(0, this.lines.length - this.lines.maxLength + _);
									const p = [];
									for (let e = 0; e < _; e++) {
										const e = this.getBlankLine(o.DEFAULT_ATTR_DATA, !0);
										p.push(e);
									}
									p.length > 0 && (r.push({
										start: l + c.length + n,
										newLines: p
									}), n += p.length), c.push(...p);
									let g = u.length - 1, m = u[g];
									0 === m && (g--, m = u[g]);
									let v = c.length - _ - 1, S = d;
									for (; v >= 0;) {
										const e = Math.min(S, m);
										if (void 0 === c[g]) break;
										if (c[g].copyCellsFrom(c[v], S - e, m - e, e, !0), m -= e, 0 === m && (g--, m = u[g]), S -= e, 0 === S) {
											v--;
											const e = Math.max(v, 0);
											S = (0, a.getWrappedLineTrimmedLength)(c, e, this._cols);
										}
									}
									for (let t = 0; t < c.length; t++) u[t] < e && c[t].setCell(u[t], s);
									let b = _ - f;
									for (; b-- > 0;) 0 === this.ybase ? this.y < t - 1 ? (this.y++, this.lines.pop()) : (this.ybase++, this.ydisp++) : this.ybase < Math.min(this.lines.maxLength, this.lines.length + n) - t && (this.ybase === this.ydisp && this.ydisp++, this.ybase++);
									this.savedY = Math.min(this.savedY + _, this.ybase + t - 1);
								}
								if (r.length > 0) {
									const e = [], t = [];
									for (let e = 0; e < this.lines.length; e++) t.push(this.lines.get(e));
									const i = this.lines.length;
									let s = i - 1, o = 0, a = r[o];
									this.lines.length = Math.min(this.lines.maxLength, this.lines.length + n);
									let l = 0;
									for (let h = Math.min(this.lines.maxLength - 1, i + n - 1); h >= 0; h--) if (a && a.start > s + l) {
										for (let e = a.newLines.length - 1; e >= 0; e--) this.lines.set(h--, a.newLines[e]);
										h++, e.push({
											index: s + 1,
											amount: a.newLines.length
										}), l += a.newLines.length, a = r[++o];
									} else this.lines.set(h, t[s--]);
									let h = 0;
									for (let t = e.length - 1; t >= 0; t--) e[t].index += h, this.lines.onInsertEmitter.fire(e[t]), h += e[t].amount;
									const c = Math.max(0, i + n - this.lines.maxLength);
									c > 0 && this.lines.onTrimEmitter.fire(c);
								}
							}
							translateBufferLineToString(e, t, i = 0, s) {
								const r = this.lines.get(e);
								return r ? r.translateToString(t, i, s) : "";
							}
							getWrappedRangeForLine(e) {
								let t = e, i = e;
								for (; t > 0 && this.lines.get(t).isWrapped;) t--;
								for (; i + 1 < this.lines.length && this.lines.get(i + 1).isWrapped;) i++;
								return {
									first: t,
									last: i
								};
							}
							setupTabStops(e) {
								for (null != e ? this.tabs[e] || (e = this.prevStop(e)) : (this.tabs = {}, e = 0); e < this._cols; e += this._optionsService.rawOptions.tabStopWidth) this.tabs[e] = !0;
							}
							prevStop(e) {
								for (e ??= this.x; !this.tabs[--e] && e > 0;);
								return e >= this._cols ? this._cols - 1 : e < 0 ? 0 : e;
							}
							nextStop(e) {
								for (e ??= this.x; !this.tabs[++e] && e < this._cols;);
								return e >= this._cols ? this._cols - 1 : e < 0 ? 0 : e;
							}
							clearMarkers(e) {
								this._isClearing = !0;
								for (let t = 0; t < this.markers.length; t++) this.markers[t].line === e && (this.markers[t].dispose(), this.markers.splice(t--, 1));
								this._isClearing = !1;
							}
							clearAllMarkers() {
								this._isClearing = !0;
								for (let e = 0; e < this.markers.length; e++) this.markers[e].dispose();
								this.markers.length = 0, this._isClearing = !1;
							}
							addMarker(e) {
								const t = new c.Marker(e);
								return this.markers.push(t), t.register(this.lines.onTrim(((e) => {
									t.line -= e, t.line < 0 && t.dispose();
								}))), t.register(this.lines.onInsert(((e) => {
									t.line >= e.index && (t.line += e.amount);
								}))), t.register(this.lines.onDelete(((e) => {
									t.line >= e.index && t.line < e.index + e.amount && t.dispose(), t.line > e.index && (t.line -= e.amount);
								}))), t.register(t.onDispose((() => this._removeMarker(t)))), t;
							}
							_removeMarker(e) {
								this._isClearing || this.markers.splice(this.markers.indexOf(e), 1);
							}
						};
					},
					6107: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.BufferLine = t.DEFAULT_ATTR_DATA = void 0;
						const s = i(5451), r = i(3055), n = i(8938), o = i(726);
						t.DEFAULT_ATTR_DATA = Object.freeze(new s.AttributeData());
						let a = 0;
						class l {
							constructor(e, t, i = !1) {
								this.isWrapped = i, this._combined = {}, this._extendedAttrs = {}, this._data = new Uint32Array(3 * e);
								const s = t || r.CellData.fromCharData([
									0,
									n.NULL_CELL_CHAR,
									n.NULL_CELL_WIDTH,
									n.NULL_CELL_CODE
								]);
								for (let t = 0; t < e; ++t) this.setCell(t, s);
								this.length = e;
							}
							get(e) {
								const t = this._data[3 * e + 0], i = 2097151 & t;
								return [
									this._data[3 * e + 1],
									2097152 & t ? this._combined[e] : i ? (0, o.stringFromCodePoint)(i) : "",
									t >> 22,
									2097152 & t ? this._combined[e].charCodeAt(this._combined[e].length - 1) : i
								];
							}
							set(e, t) {
								this._data[3 * e + 1] = t[n.CHAR_DATA_ATTR_INDEX], t[n.CHAR_DATA_CHAR_INDEX].length > 1 ? (this._combined[e] = t[1], this._data[3 * e + 0] = 2097152 | e | t[n.CHAR_DATA_WIDTH_INDEX] << 22) : this._data[3 * e + 0] = t[n.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | t[n.CHAR_DATA_WIDTH_INDEX] << 22;
							}
							getWidth(e) {
								return this._data[3 * e + 0] >> 22;
							}
							hasWidth(e) {
								return 12582912 & this._data[3 * e + 0];
							}
							getFg(e) {
								return this._data[3 * e + 1];
							}
							getBg(e) {
								return this._data[3 * e + 2];
							}
							hasContent(e) {
								return 4194303 & this._data[3 * e + 0];
							}
							getCodePoint(e) {
								const t = this._data[3 * e + 0];
								return 2097152 & t ? this._combined[e].charCodeAt(this._combined[e].length - 1) : 2097151 & t;
							}
							isCombined(e) {
								return 2097152 & this._data[3 * e + 0];
							}
							getString(e) {
								const t = this._data[3 * e + 0];
								return 2097152 & t ? this._combined[e] : 2097151 & t ? (0, o.stringFromCodePoint)(2097151 & t) : "";
							}
							isProtected(e) {
								return 536870912 & this._data[3 * e + 2];
							}
							loadCell(e, t) {
								return a = 3 * e, t.content = this._data[a + 0], t.fg = this._data[a + 1], t.bg = this._data[a + 2], 2097152 & t.content && (t.combinedData = this._combined[e]), 268435456 & t.bg && (t.extended = this._extendedAttrs[e]), t;
							}
							setCell(e, t) {
								2097152 & t.content && (this._combined[e] = t.combinedData), 268435456 & t.bg && (this._extendedAttrs[e] = t.extended), this._data[3 * e + 0] = t.content, this._data[3 * e + 1] = t.fg, this._data[3 * e + 2] = t.bg;
							}
							setCellFromCodepoint(e, t, i, s) {
								268435456 & s.bg && (this._extendedAttrs[e] = s.extended), this._data[3 * e + 0] = t | i << 22, this._data[3 * e + 1] = s.fg, this._data[3 * e + 2] = s.bg;
							}
							addCodepointToCell(e, t, i) {
								let s = this._data[3 * e + 0];
								2097152 & s ? this._combined[e] += (0, o.stringFromCodePoint)(t) : 2097151 & s ? (this._combined[e] = (0, o.stringFromCodePoint)(2097151 & s) + (0, o.stringFromCodePoint)(t), s &= -2097152, s |= 2097152) : s = t | 1 << 22, i && (s &= -12582913, s |= i << 22), this._data[3 * e + 0] = s;
							}
							insertCells(e, t, i) {
								if ((e %= this.length) && 2 === this.getWidth(e - 1) && this.setCellFromCodepoint(e - 1, 0, 1, i), t < this.length - e) {
									const s = new r.CellData();
									for (let i = this.length - e - t - 1; i >= 0; --i) this.setCell(e + t + i, this.loadCell(e + i, s));
									for (let s = 0; s < t; ++s) this.setCell(e + s, i);
								} else for (let t = e; t < this.length; ++t) this.setCell(t, i);
								2 === this.getWidth(this.length - 1) && this.setCellFromCodepoint(this.length - 1, 0, 1, i);
							}
							deleteCells(e, t, i) {
								if (e %= this.length, t < this.length - e) {
									const s = new r.CellData();
									for (let i = 0; i < this.length - e - t; ++i) this.setCell(e + i, this.loadCell(e + t + i, s));
									for (let e = this.length - t; e < this.length; ++e) this.setCell(e, i);
								} else for (let t = e; t < this.length; ++t) this.setCell(t, i);
								e && 2 === this.getWidth(e - 1) && this.setCellFromCodepoint(e - 1, 0, 1, i), 0 !== this.getWidth(e) || this.hasContent(e) || this.setCellFromCodepoint(e, 0, 1, i);
							}
							replaceCells(e, t, i, s = !1) {
								if (s) for (e && 2 === this.getWidth(e - 1) && !this.isProtected(e - 1) && this.setCellFromCodepoint(e - 1, 0, 1, i), t < this.length && 2 === this.getWidth(t - 1) && !this.isProtected(t) && this.setCellFromCodepoint(t, 0, 1, i); e < t && e < this.length;) this.isProtected(e) || this.setCell(e, i), e++;
								else for (e && 2 === this.getWidth(e - 1) && this.setCellFromCodepoint(e - 1, 0, 1, i), t < this.length && 2 === this.getWidth(t - 1) && this.setCellFromCodepoint(t, 0, 1, i); e < t && e < this.length;) this.setCell(e++, i);
							}
							resize(e, t) {
								if (e === this.length) return 4 * this._data.length * 2 < this._data.buffer.byteLength;
								const i = 3 * e;
								if (e > this.length) {
									if (this._data.buffer.byteLength >= 4 * i) this._data = new Uint32Array(this._data.buffer, 0, i);
									else {
										const e = new Uint32Array(i);
										e.set(this._data), this._data = e;
									}
									for (let i = this.length; i < e; ++i) this.setCell(i, t);
								} else {
									this._data = this._data.subarray(0, i);
									const t = Object.keys(this._combined);
									for (let i = 0; i < t.length; i++) {
										const s = parseInt(t[i], 10);
										s >= e && delete this._combined[s];
									}
									const s = Object.keys(this._extendedAttrs);
									for (let t = 0; t < s.length; t++) {
										const i = parseInt(s[t], 10);
										i >= e && delete this._extendedAttrs[i];
									}
								}
								return this.length = e, 4 * i * 2 < this._data.buffer.byteLength;
							}
							cleanupMemory() {
								if (4 * this._data.length * 2 < this._data.buffer.byteLength) {
									const e = new Uint32Array(this._data.length);
									return e.set(this._data), this._data = e, 1;
								}
								return 0;
							}
							fill(e, t = !1) {
								if (t) for (let t = 0; t < this.length; ++t) this.isProtected(t) || this.setCell(t, e);
								else {
									this._combined = {}, this._extendedAttrs = {};
									for (let t = 0; t < this.length; ++t) this.setCell(t, e);
								}
							}
							copyFrom(e) {
								this.length !== e.length ? this._data = new Uint32Array(e._data) : this._data.set(e._data), this.length = e.length, this._combined = {};
								for (const t in e._combined) this._combined[t] = e._combined[t];
								this._extendedAttrs = {};
								for (const t in e._extendedAttrs) this._extendedAttrs[t] = e._extendedAttrs[t];
								this.isWrapped = e.isWrapped;
							}
							clone() {
								const e = new l(0);
								e._data = new Uint32Array(this._data), e.length = this.length;
								for (const t in this._combined) e._combined[t] = this._combined[t];
								for (const t in this._extendedAttrs) e._extendedAttrs[t] = this._extendedAttrs[t];
								return e.isWrapped = this.isWrapped, e;
							}
							getTrimmedLength() {
								for (let e = this.length - 1; e >= 0; --e) if (4194303 & this._data[3 * e + 0]) return e + (this._data[3 * e + 0] >> 22);
								return 0;
							}
							getNoBgTrimmedLength() {
								for (let e = this.length - 1; e >= 0; --e) if (4194303 & this._data[3 * e + 0] || 50331648 & this._data[3 * e + 2]) return e + (this._data[3 * e + 0] >> 22);
								return 0;
							}
							copyCellsFrom(e, t, i, s, r) {
								const n = e._data;
								if (r) for (let r = s - 1; r >= 0; r--) {
									for (let e = 0; e < 3; e++) this._data[3 * (i + r) + e] = n[3 * (t + r) + e];
									268435456 & n[3 * (t + r) + 2] && (this._extendedAttrs[i + r] = e._extendedAttrs[t + r]);
								}
								else for (let r = 0; r < s; r++) {
									for (let e = 0; e < 3; e++) this._data[3 * (i + r) + e] = n[3 * (t + r) + e];
									268435456 & n[3 * (t + r) + 2] && (this._extendedAttrs[i + r] = e._extendedAttrs[t + r]);
								}
								const o = Object.keys(e._combined);
								for (let s = 0; s < o.length; s++) {
									const r = parseInt(o[s], 10);
									r >= t && (this._combined[r - t + i] = e._combined[r]);
								}
							}
							translateToString(e, t, i, s) {
								t = t ?? 0, i = i ?? this.length, e && (i = Math.min(i, this.getTrimmedLength())), s && (s.length = 0);
								let r = "";
								for (; t < i;) {
									const e = this._data[3 * t + 0], i = 2097151 & e, a = 2097152 & e ? this._combined[t] : i ? (0, o.stringFromCodePoint)(i) : n.WHITESPACE_CELL_CHAR;
									if (r += a, s) for (let e = 0; e < a.length; ++e) s.push(t);
									t += e >> 22 || 1;
								}
								return s && s.push(t), r;
							}
						}
						t.BufferLine = l;
					},
					9384: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.getRangeLength = function(e, t) {
							if (e.start.y > e.end.y) throw new Error(`Buffer range end (${e.end.x}, ${e.end.y}) cannot be before start (${e.start.x}, ${e.start.y})`);
							return t * (e.end.y - e.start.y) + (e.end.x - e.start.x + 1);
						};
					},
					732: (e, t) => {
						function i(e, t, i) {
							if (t === e.length - 1) return e[t].getTrimmedLength();
							const s = !e[t].hasContent(i - 1) && 1 === e[t].getWidth(i - 1), r = 2 === e[t + 1].getWidth(0);
							return s && r ? i - 1 : i;
						}
						Object.defineProperty(t, "__esModule", { value: !0 }), t.reflowLargerGetLinesToRemove = function(e, t, s, r, n, o) {
							const a = [];
							for (let l = 0; l < e.length - 1; l++) {
								let h = l, c = e.get(++h);
								if (!c.isWrapped) continue;
								const d = [e.get(l)];
								for (; h < e.length && c.isWrapped;) d.push(c), c = e.get(++h);
								if (!o && r >= l && r < h) {
									l += d.length - 1;
									continue;
								}
								let u = 0, _ = i(d, u, t), f = 1, p = 0;
								for (; f < d.length;) {
									const e = i(d, f, t), r = e - p, o = s - _, a = Math.min(r, o);
									d[u].copyCellsFrom(d[f], p, _, a, !1), _ += a, _ === s && (u++, _ = 0), p += a, p === e && (f++, p = 0), 0 === _ && 0 !== u && 2 === d[u - 1].getWidth(s - 1) && (d[u].copyCellsFrom(d[u - 1], s - 1, _++, 1, !1), d[u - 1].setCell(s - 1, n));
								}
								d[u].replaceCells(_, s, n);
								let g = 0;
								for (let e = d.length - 1; e > 0 && (e > u || 0 === d[e].getTrimmedLength()); e--) g++;
								g > 0 && (a.push(l + d.length - g), a.push(g)), l += d.length - 1;
							}
							return a;
						}, t.reflowLargerCreateNewLayout = function(e, t) {
							const i = [];
							let s = 0, r = t[s], n = 0;
							for (let o = 0; o < e.length; o++) if (r === o) {
								const i = t[++s];
								e.onDeleteEmitter.fire({
									index: o - n,
									amount: i
								}), o += i - 1, n += i, r = t[++s];
							} else i.push(o);
							return {
								layout: i,
								countRemoved: n
							};
						}, t.reflowLargerApplyNewLayout = function(e, t) {
							const i = [];
							for (let s = 0; s < t.length; s++) i.push(e.get(t[s]));
							for (let t = 0; t < i.length; t++) e.set(t, i[t]);
							e.length = t.length;
						}, t.reflowSmallerGetNewLineLengths = function(e, t, s) {
							const r = [], n = e.map(((s, r) => i(e, r, t))).reduce(((e, t) => e + t));
							let o = 0, a = 0, l = 0;
							for (; l < n;) {
								if (n - l < s) {
									r.push(n - l);
									break;
								}
								o += s;
								const h = i(e, a, t);
								o > h && (o -= h, a++);
								const c = 2 === e[a].getWidth(o - 1);
								c && o--;
								const d = c ? s - 1 : s;
								r.push(d), l += d;
							}
							return r;
						}, t.getWrappedLineTrimmedLength = i;
					},
					4097: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.BufferSet = void 0;
						const s = i(7150), r = i(1073), n = i(802);
						class o extends s.Disposable {
							constructor(e, t) {
								super(), this._optionsService = e, this._bufferService = t, this._onBufferActivate = this._register(new n.Emitter()), this.onBufferActivate = this._onBufferActivate.event, this.reset(), this._register(this._optionsService.onSpecificOptionChange("scrollback", (() => this.resize(this._bufferService.cols, this._bufferService.rows)))), this._register(this._optionsService.onSpecificOptionChange("tabStopWidth", (() => this.setupTabStops())));
							}
							reset() {
								this._normal = new r.Buffer(!0, this._optionsService, this._bufferService), this._normal.fillViewportRows(), this._alt = new r.Buffer(!1, this._optionsService, this._bufferService), this._activeBuffer = this._normal, this._onBufferActivate.fire({
									activeBuffer: this._normal,
									inactiveBuffer: this._alt
								}), this.setupTabStops();
							}
							get alt() {
								return this._alt;
							}
							get active() {
								return this._activeBuffer;
							}
							get normal() {
								return this._normal;
							}
							activateNormalBuffer() {
								this._activeBuffer !== this._normal && (this._normal.x = this._alt.x, this._normal.y = this._alt.y, this._alt.clearAllMarkers(), this._alt.clear(), this._activeBuffer = this._normal, this._onBufferActivate.fire({
									activeBuffer: this._normal,
									inactiveBuffer: this._alt
								}));
							}
							activateAltBuffer(e) {
								this._activeBuffer !== this._alt && (this._alt.fillViewportRows(e), this._alt.x = this._normal.x, this._alt.y = this._normal.y, this._activeBuffer = this._alt, this._onBufferActivate.fire({
									activeBuffer: this._alt,
									inactiveBuffer: this._normal
								}));
							}
							resize(e, t) {
								this._normal.resize(e, t), this._alt.resize(e, t), this.setupTabStops(e);
							}
							setupTabStops(e) {
								this._normal.setupTabStops(e), this._alt.setupTabStops(e);
							}
						}
						t.BufferSet = o;
					},
					3055: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.CellData = void 0;
						const s = i(726), r = i(8938), n = i(5451);
						class o extends n.AttributeData {
							constructor() {
								super(...arguments), this.content = 0, this.fg = 0, this.bg = 0, this.extended = new n.ExtendedAttrs(), this.combinedData = "";
							}
							static fromCharData(e) {
								const t = new o();
								return t.setFromCharData(e), t;
							}
							isCombined() {
								return 2097152 & this.content;
							}
							getWidth() {
								return this.content >> 22;
							}
							getChars() {
								return 2097152 & this.content ? this.combinedData : 2097151 & this.content ? (0, s.stringFromCodePoint)(2097151 & this.content) : "";
							}
							getCode() {
								return this.isCombined() ? this.combinedData.charCodeAt(this.combinedData.length - 1) : 2097151 & this.content;
							}
							setFromCharData(e) {
								this.fg = e[r.CHAR_DATA_ATTR_INDEX], this.bg = 0;
								let t = !1;
								if (e[r.CHAR_DATA_CHAR_INDEX].length > 2) t = !0;
								else if (2 === e[r.CHAR_DATA_CHAR_INDEX].length) {
									const i = e[r.CHAR_DATA_CHAR_INDEX].charCodeAt(0);
									if (55296 <= i && i <= 56319) {
										const s = e[r.CHAR_DATA_CHAR_INDEX].charCodeAt(1);
										56320 <= s && s <= 57343 ? this.content = 1024 * (i - 55296) + s - 56320 + 65536 | e[r.CHAR_DATA_WIDTH_INDEX] << 22 : t = !0;
									} else t = !0;
								} else this.content = e[r.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | e[r.CHAR_DATA_WIDTH_INDEX] << 22;
								t && (this.combinedData = e[r.CHAR_DATA_CHAR_INDEX], this.content = 2097152 | e[r.CHAR_DATA_WIDTH_INDEX] << 22);
							}
							getAsCharData() {
								return [
									this.fg,
									this.getChars(),
									this.getWidth(),
									this.getCode()
								];
							}
						}
						t.CellData = o;
					},
					8938: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.WHITESPACE_CELL_CODE = t.WHITESPACE_CELL_WIDTH = t.WHITESPACE_CELL_CHAR = t.NULL_CELL_CODE = t.NULL_CELL_WIDTH = t.NULL_CELL_CHAR = t.CHAR_DATA_CODE_INDEX = t.CHAR_DATA_WIDTH_INDEX = t.CHAR_DATA_CHAR_INDEX = t.CHAR_DATA_ATTR_INDEX = t.DEFAULT_EXT = t.DEFAULT_ATTR = t.DEFAULT_COLOR = void 0, t.DEFAULT_COLOR = 0, t.DEFAULT_ATTR = t.DEFAULT_COLOR << 9 | 256, t.DEFAULT_EXT = 0, t.CHAR_DATA_ATTR_INDEX = 0, t.CHAR_DATA_CHAR_INDEX = 1, t.CHAR_DATA_WIDTH_INDEX = 2, t.CHAR_DATA_CODE_INDEX = 3, t.NULL_CELL_CHAR = "", t.NULL_CELL_WIDTH = 1, t.NULL_CELL_CODE = 0, t.WHITESPACE_CELL_CHAR = " ", t.WHITESPACE_CELL_WIDTH = 1, t.WHITESPACE_CELL_CODE = 32;
					},
					8158: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.Marker = void 0;
						const s = i(802), r = i(7150);
						class n {
							get id() {
								return this._id;
							}
							constructor(e) {
								this.line = e, this.isDisposed = !1, this._disposables = [], this._id = n._nextId++, this._onDispose = this.register(new s.Emitter()), this.onDispose = this._onDispose.event;
							}
							dispose() {
								this.isDisposed || (this.isDisposed = !0, this.line = -1, this._onDispose.fire(), (0, r.dispose)(this._disposables), this._disposables.length = 0);
							}
							register(e) {
								return this._disposables.push(e), e;
							}
						}
						t.Marker = n, n._nextId = 1;
					},
					6760: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.DEFAULT_CHARSET = t.CHARSETS = void 0, t.CHARSETS = {}, t.DEFAULT_CHARSET = t.CHARSETS.B, t.CHARSETS[0] = {
							"`": "◆",
							a: "▒",
							b: "␉",
							c: "␌",
							d: "␍",
							e: "␊",
							f: "°",
							g: "±",
							h: "␤",
							i: "␋",
							j: "┘",
							k: "┐",
							l: "┌",
							m: "└",
							n: "┼",
							o: "⎺",
							p: "⎻",
							q: "─",
							r: "⎼",
							s: "⎽",
							t: "├",
							u: "┤",
							v: "┴",
							w: "┬",
							x: "│",
							y: "≤",
							z: "≥",
							"{": "π",
							"|": "≠",
							"}": "£",
							"~": "·"
						}, t.CHARSETS.A = { "#": "£" }, t.CHARSETS.B = void 0, t.CHARSETS[4] = {
							"#": "£",
							"@": "¾",
							"[": "ij",
							"\\": "½",
							"]": "|",
							"{": "¨",
							"|": "f",
							"}": "¼",
							"~": "´"
						}, t.CHARSETS.C = t.CHARSETS[5] = {
							"[": "Ä",
							"\\": "Ö",
							"]": "Å",
							"^": "Ü",
							"`": "é",
							"{": "ä",
							"|": "ö",
							"}": "å",
							"~": "ü"
						}, t.CHARSETS.R = {
							"#": "£",
							"@": "à",
							"[": "°",
							"\\": "ç",
							"]": "§",
							"{": "é",
							"|": "ù",
							"}": "è",
							"~": "¨"
						}, t.CHARSETS.Q = {
							"@": "à",
							"[": "â",
							"\\": "ç",
							"]": "ê",
							"^": "î",
							"`": "ô",
							"{": "é",
							"|": "ù",
							"}": "è",
							"~": "û"
						}, t.CHARSETS.K = {
							"@": "§",
							"[": "Ä",
							"\\": "Ö",
							"]": "Ü",
							"{": "ä",
							"|": "ö",
							"}": "ü",
							"~": "ß"
						}, t.CHARSETS.Y = {
							"#": "£",
							"@": "§",
							"[": "°",
							"\\": "ç",
							"]": "é",
							"`": "ù",
							"{": "à",
							"|": "ò",
							"}": "è",
							"~": "ì"
						}, t.CHARSETS.E = t.CHARSETS[6] = {
							"@": "Ä",
							"[": "Æ",
							"\\": "Ø",
							"]": "Å",
							"^": "Ü",
							"`": "ä",
							"{": "æ",
							"|": "ø",
							"}": "å",
							"~": "ü"
						}, t.CHARSETS.Z = {
							"#": "£",
							"@": "§",
							"[": "¡",
							"\\": "Ñ",
							"]": "¿",
							"{": "°",
							"|": "ñ",
							"}": "ç"
						}, t.CHARSETS.H = t.CHARSETS[7] = {
							"@": "É",
							"[": "Ä",
							"\\": "Ö",
							"]": "Å",
							"^": "Ü",
							"`": "é",
							"{": "ä",
							"|": "ö",
							"}": "å",
							"~": "ü"
						}, t.CHARSETS["="] = {
							"#": "ù",
							"@": "à",
							"[": "é",
							"\\": "ç",
							"]": "ê",
							"^": "î",
							_: "è",
							"`": "ô",
							"{": "ä",
							"|": "ö",
							"}": "ü",
							"~": "û"
						};
					},
					3534: (e, t) => {
						var i, s, r;
						Object.defineProperty(t, "__esModule", { value: !0 }), t.C1_ESCAPED = t.C1 = t.C0 = void 0, function(e) {
							e.NUL = "\0", e.SOH = "", e.STX = "", e.ETX = "", e.EOT = "", e.ENQ = "", e.ACK = "", e.BEL = "\x07", e.BS = "\b", e.HT = "	", e.LF = "\n", e.VT = "\v", e.FF = "\f", e.CR = "\r", e.SO = "", e.SI = "", e.DLE = "", e.DC1 = "", e.DC2 = "", e.DC3 = "", e.DC4 = "", e.NAK = "", e.SYN = "", e.ETB = "", e.CAN = "", e.EM = "", e.SUB = "", e.ESC = "\x1B", e.FS = "", e.GS = "", e.RS = "", e.US = "", e.SP = " ", e.DEL = "";
						}(i || (t.C0 = i = {})), function(e) {
							e.PAD = "", e.HOP = "", e.BPH = "", e.NBH = "", e.IND = "", e.NEL = "", e.SSA = "", e.ESA = "", e.HTS = "", e.HTJ = "", e.VTS = "", e.PLD = "", e.PLU = "", e.RI = "", e.SS2 = "", e.SS3 = "", e.DCS = "", e.PU1 = "", e.PU2 = "", e.STS = "", e.CCH = "", e.MW = "", e.SPA = "", e.EPA = "", e.SOS = "", e.SGCI = "", e.SCI = "", e.CSI = "", e.ST = "", e.OSC = "", e.PM = "", e.APC = "";
						}(s || (t.C1 = s = {})), function(e) {
							e.ST = `${i.ESC}\\`;
						}(r || (t.C1_ESCAPED = r = {}));
					},
					706: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.evaluateKeyboardEvent = function(e, t, i, n) {
							const o = {
								type: 0,
								cancel: !1,
								key: void 0
							}, a = (e.shiftKey ? 1 : 0) | (e.altKey ? 2 : 0) | (e.ctrlKey ? 4 : 0) | (e.metaKey ? 8 : 0);
							switch (e.keyCode) {
								case 0:
									"UIKeyInputUpArrow" === e.key ? o.key = t ? s.C0.ESC + "OA" : s.C0.ESC + "[A" : "UIKeyInputLeftArrow" === e.key ? o.key = t ? s.C0.ESC + "OD" : s.C0.ESC + "[D" : "UIKeyInputRightArrow" === e.key ? o.key = t ? s.C0.ESC + "OC" : s.C0.ESC + "[C" : "UIKeyInputDownArrow" === e.key && (o.key = t ? s.C0.ESC + "OB" : s.C0.ESC + "[B");
									break;
								case 8:
									o.key = e.ctrlKey ? "\b" : s.C0.DEL, e.altKey && (o.key = s.C0.ESC + o.key);
									break;
								case 9:
									if (e.shiftKey) {
										o.key = s.C0.ESC + "[Z";
										break;
									}
									o.key = s.C0.HT, o.cancel = !0;
									break;
								case 13:
									o.key = e.altKey ? s.C0.ESC + s.C0.CR : s.C0.CR, o.cancel = !0;
									break;
								case 27:
									o.key = s.C0.ESC, e.altKey && (o.key = s.C0.ESC + s.C0.ESC), o.cancel = !0;
									break;
								case 37:
									if (e.metaKey) break;
									o.key = a ? s.C0.ESC + "[1;" + (a + 1) + "D" : t ? s.C0.ESC + "OD" : s.C0.ESC + "[D";
									break;
								case 39:
									if (e.metaKey) break;
									o.key = a ? s.C0.ESC + "[1;" + (a + 1) + "C" : t ? s.C0.ESC + "OC" : s.C0.ESC + "[C";
									break;
								case 38:
									if (e.metaKey) break;
									o.key = a ? s.C0.ESC + "[1;" + (a + 1) + "A" : t ? s.C0.ESC + "OA" : s.C0.ESC + "[A";
									break;
								case 40:
									if (e.metaKey) break;
									o.key = a ? s.C0.ESC + "[1;" + (a + 1) + "B" : t ? s.C0.ESC + "OB" : s.C0.ESC + "[B";
									break;
								case 45:
									e.shiftKey || e.ctrlKey || (o.key = s.C0.ESC + "[2~");
									break;
								case 46:
									o.key = a ? s.C0.ESC + "[3;" + (a + 1) + "~" : s.C0.ESC + "[3~";
									break;
								case 36:
									o.key = a ? s.C0.ESC + "[1;" + (a + 1) + "H" : t ? s.C0.ESC + "OH" : s.C0.ESC + "[H";
									break;
								case 35:
									o.key = a ? s.C0.ESC + "[1;" + (a + 1) + "F" : t ? s.C0.ESC + "OF" : s.C0.ESC + "[F";
									break;
								case 33:
									e.shiftKey ? o.type = 2 : e.ctrlKey ? o.key = s.C0.ESC + "[5;" + (a + 1) + "~" : o.key = s.C0.ESC + "[5~";
									break;
								case 34:
									e.shiftKey ? o.type = 3 : e.ctrlKey ? o.key = s.C0.ESC + "[6;" + (a + 1) + "~" : o.key = s.C0.ESC + "[6~";
									break;
								case 112:
									o.key = a ? s.C0.ESC + "[1;" + (a + 1) + "P" : s.C0.ESC + "OP";
									break;
								case 113:
									o.key = a ? s.C0.ESC + "[1;" + (a + 1) + "Q" : s.C0.ESC + "OQ";
									break;
								case 114:
									o.key = a ? s.C0.ESC + "[1;" + (a + 1) + "R" : s.C0.ESC + "OR";
									break;
								case 115:
									o.key = a ? s.C0.ESC + "[1;" + (a + 1) + "S" : s.C0.ESC + "OS";
									break;
								case 116:
									o.key = a ? s.C0.ESC + "[15;" + (a + 1) + "~" : s.C0.ESC + "[15~";
									break;
								case 117:
									o.key = a ? s.C0.ESC + "[17;" + (a + 1) + "~" : s.C0.ESC + "[17~";
									break;
								case 118:
									o.key = a ? s.C0.ESC + "[18;" + (a + 1) + "~" : s.C0.ESC + "[18~";
									break;
								case 119:
									o.key = a ? s.C0.ESC + "[19;" + (a + 1) + "~" : s.C0.ESC + "[19~";
									break;
								case 120:
									o.key = a ? s.C0.ESC + "[20;" + (a + 1) + "~" : s.C0.ESC + "[20~";
									break;
								case 121:
									o.key = a ? s.C0.ESC + "[21;" + (a + 1) + "~" : s.C0.ESC + "[21~";
									break;
								case 122:
									o.key = a ? s.C0.ESC + "[23;" + (a + 1) + "~" : s.C0.ESC + "[23~";
									break;
								case 123:
									o.key = a ? s.C0.ESC + "[24;" + (a + 1) + "~" : s.C0.ESC + "[24~";
									break;
								default: if (!e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) if (i && !n || !e.altKey || e.metaKey) !i || e.altKey || e.ctrlKey || e.shiftKey || !e.metaKey ? e.key && !e.ctrlKey && !e.altKey && !e.metaKey && e.keyCode >= 48 && 1 === e.key.length ? o.key = e.key : e.key && e.ctrlKey && ("_" === e.key && (o.key = s.C0.US), "@" === e.key && (o.key = s.C0.NUL)) : 65 === e.keyCode && (o.type = 1);
								else {
									const i = r[e.keyCode]?.[e.shiftKey ? 1 : 0];
									if (i) o.key = s.C0.ESC + i;
									else if (e.keyCode >= 65 && e.keyCode <= 90) {
										const t = e.ctrlKey ? e.keyCode - 64 : e.keyCode + 32;
										let i = String.fromCharCode(t);
										e.shiftKey && (i = i.toUpperCase()), o.key = s.C0.ESC + i;
									} else if (32 === e.keyCode) o.key = s.C0.ESC + (e.ctrlKey ? s.C0.NUL : " ");
									else if ("Dead" === e.key && e.code.startsWith("Key")) {
										let t = e.code.slice(3, 4);
										e.shiftKey || (t = t.toLowerCase()), o.key = s.C0.ESC + t, o.cancel = !0;
									}
								}
								else e.keyCode >= 65 && e.keyCode <= 90 ? o.key = String.fromCharCode(e.keyCode - 64) : 32 === e.keyCode ? o.key = s.C0.NUL : e.keyCode >= 51 && e.keyCode <= 55 ? o.key = String.fromCharCode(e.keyCode - 51 + 27) : 56 === e.keyCode ? o.key = s.C0.DEL : 219 === e.keyCode ? o.key = s.C0.ESC : 220 === e.keyCode ? o.key = s.C0.FS : 221 === e.keyCode && (o.key = s.C0.GS);
							}
							return o;
						};
						const s = i(3534), r = {
							48: ["0", ")"],
							49: ["1", "!"],
							50: ["2", "@"],
							51: ["3", "#"],
							52: ["4", "$"],
							53: ["5", "%"],
							54: ["6", "^"],
							55: ["7", "&"],
							56: ["8", "*"],
							57: ["9", "("],
							186: [";", ":"],
							187: ["=", "+"],
							188: [",", "<"],
							189: ["-", "_"],
							190: [".", ">"],
							191: ["/", "?"],
							192: ["`", "~"],
							219: ["[", "{"],
							220: ["\\", "|"],
							221: ["]", "}"],
							222: ["'", "\""]
						};
					},
					726: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.Utf8ToUtf32 = t.StringToUtf32 = void 0, t.stringFromCodePoint = function(e) {
							return e > 65535 ? (e -= 65536, String.fromCharCode(55296 + (e >> 10)) + String.fromCharCode(e % 1024 + 56320)) : String.fromCharCode(e);
						}, t.utf32ToString = function(e, t = 0, i = e.length) {
							let s = "";
							for (let r = t; r < i; ++r) {
								let t = e[r];
								t > 65535 ? (t -= 65536, s += String.fromCharCode(55296 + (t >> 10)) + String.fromCharCode(t % 1024 + 56320)) : s += String.fromCharCode(t);
							}
							return s;
						}, t.StringToUtf32 = class {
							constructor() {
								this._interim = 0;
							}
							clear() {
								this._interim = 0;
							}
							decode(e, t) {
								const i = e.length;
								if (!i) return 0;
								let s = 0, r = 0;
								if (this._interim) {
									const i = e.charCodeAt(r++);
									56320 <= i && i <= 57343 ? t[s++] = 1024 * (this._interim - 55296) + i - 56320 + 65536 : (t[s++] = this._interim, t[s++] = i), this._interim = 0;
								}
								for (let n = r; n < i; ++n) {
									const r = e.charCodeAt(n);
									if (55296 <= r && r <= 56319) {
										if (++n >= i) return this._interim = r, s;
										const o = e.charCodeAt(n);
										56320 <= o && o <= 57343 ? t[s++] = 1024 * (r - 55296) + o - 56320 + 65536 : (t[s++] = r, t[s++] = o);
									} else 65279 !== r && (t[s++] = r);
								}
								return s;
							}
						}, t.Utf8ToUtf32 = class {
							constructor() {
								this.interim = /* @__PURE__ */ new Uint8Array(3);
							}
							clear() {
								this.interim.fill(0);
							}
							decode(e, t) {
								const i = e.length;
								if (!i) return 0;
								let s, r, n, o, a = 0, l = 0, h = 0;
								if (this.interim[0]) {
									let s = !1, r = this.interim[0];
									r &= 192 == (224 & r) ? 31 : 224 == (240 & r) ? 15 : 7;
									let n, o = 0;
									for (; (n = 63 & this.interim[++o]) && o < 4;) r <<= 6, r |= n;
									const l = 192 == (224 & this.interim[0]) ? 2 : 224 == (240 & this.interim[0]) ? 3 : 4, c = l - o;
									for (; h < c;) {
										if (h >= i) return 0;
										if (n = e[h++], 128 != (192 & n)) {
											h--, s = !0;
											break;
										}
										this.interim[o++] = n, r <<= 6, r |= 63 & n;
									}
									s || (2 === l ? r < 128 ? h-- : t[a++] = r : 3 === l ? r < 2048 || r >= 55296 && r <= 57343 || 65279 === r || (t[a++] = r) : r < 65536 || r > 1114111 || (t[a++] = r)), this.interim.fill(0);
								}
								const c = i - 4;
								let d = h;
								for (; d < i;) {
									for (; !(!(d < c) || 128 & (s = e[d]) || 128 & (r = e[d + 1]) || 128 & (n = e[d + 2]) || 128 & (o = e[d + 3]));) t[a++] = s, t[a++] = r, t[a++] = n, t[a++] = o, d += 4;
									if (s = e[d++], s < 128) t[a++] = s;
									else if (192 == (224 & s)) {
										if (d >= i) return this.interim[0] = s, a;
										if (r = e[d++], 128 != (192 & r)) {
											d--;
											continue;
										}
										if (l = (31 & s) << 6 | 63 & r, l < 128) {
											d--;
											continue;
										}
										t[a++] = l;
									} else if (224 == (240 & s)) {
										if (d >= i) return this.interim[0] = s, a;
										if (r = e[d++], 128 != (192 & r)) {
											d--;
											continue;
										}
										if (d >= i) return this.interim[0] = s, this.interim[1] = r, a;
										if (n = e[d++], 128 != (192 & n)) {
											d--;
											continue;
										}
										if (l = (15 & s) << 12 | (63 & r) << 6 | 63 & n, l < 2048 || l >= 55296 && l <= 57343 || 65279 === l) continue;
										t[a++] = l;
									} else if (240 == (248 & s)) {
										if (d >= i) return this.interim[0] = s, a;
										if (r = e[d++], 128 != (192 & r)) {
											d--;
											continue;
										}
										if (d >= i) return this.interim[0] = s, this.interim[1] = r, a;
										if (n = e[d++], 128 != (192 & n)) {
											d--;
											continue;
										}
										if (d >= i) return this.interim[0] = s, this.interim[1] = r, this.interim[2] = n, a;
										if (o = e[d++], 128 != (192 & o)) {
											d--;
											continue;
										}
										if (l = (7 & s) << 18 | (63 & r) << 12 | (63 & n) << 6 | 63 & o, l < 65536 || l > 1114111) continue;
										t[a++] = l;
									}
								}
								return a;
							}
						};
					},
					7428: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.UnicodeV6 = void 0;
						const s = i(6415), r = [
							[768, 879],
							[1155, 1158],
							[1160, 1161],
							[1425, 1469],
							[1471, 1471],
							[1473, 1474],
							[1476, 1477],
							[1479, 1479],
							[1536, 1539],
							[1552, 1557],
							[1611, 1630],
							[1648, 1648],
							[1750, 1764],
							[1767, 1768],
							[1770, 1773],
							[1807, 1807],
							[1809, 1809],
							[1840, 1866],
							[1958, 1968],
							[2027, 2035],
							[2305, 2306],
							[2364, 2364],
							[2369, 2376],
							[2381, 2381],
							[2385, 2388],
							[2402, 2403],
							[2433, 2433],
							[2492, 2492],
							[2497, 2500],
							[2509, 2509],
							[2530, 2531],
							[2561, 2562],
							[2620, 2620],
							[2625, 2626],
							[2631, 2632],
							[2635, 2637],
							[2672, 2673],
							[2689, 2690],
							[2748, 2748],
							[2753, 2757],
							[2759, 2760],
							[2765, 2765],
							[2786, 2787],
							[2817, 2817],
							[2876, 2876],
							[2879, 2879],
							[2881, 2883],
							[2893, 2893],
							[2902, 2902],
							[2946, 2946],
							[3008, 3008],
							[3021, 3021],
							[3134, 3136],
							[3142, 3144],
							[3146, 3149],
							[3157, 3158],
							[3260, 3260],
							[3263, 3263],
							[3270, 3270],
							[3276, 3277],
							[3298, 3299],
							[3393, 3395],
							[3405, 3405],
							[3530, 3530],
							[3538, 3540],
							[3542, 3542],
							[3633, 3633],
							[3636, 3642],
							[3655, 3662],
							[3761, 3761],
							[3764, 3769],
							[3771, 3772],
							[3784, 3789],
							[3864, 3865],
							[3893, 3893],
							[3895, 3895],
							[3897, 3897],
							[3953, 3966],
							[3968, 3972],
							[3974, 3975],
							[3984, 3991],
							[3993, 4028],
							[4038, 4038],
							[4141, 4144],
							[4146, 4146],
							[4150, 4151],
							[4153, 4153],
							[4184, 4185],
							[4448, 4607],
							[4959, 4959],
							[5906, 5908],
							[5938, 5940],
							[5970, 5971],
							[6002, 6003],
							[6068, 6069],
							[6071, 6077],
							[6086, 6086],
							[6089, 6099],
							[6109, 6109],
							[6155, 6157],
							[6313, 6313],
							[6432, 6434],
							[6439, 6440],
							[6450, 6450],
							[6457, 6459],
							[6679, 6680],
							[6912, 6915],
							[6964, 6964],
							[6966, 6970],
							[6972, 6972],
							[6978, 6978],
							[7019, 7027],
							[7616, 7626],
							[7678, 7679],
							[8203, 8207],
							[8234, 8238],
							[8288, 8291],
							[8298, 8303],
							[8400, 8431],
							[12330, 12335],
							[12441, 12442],
							[43014, 43014],
							[43019, 43019],
							[43045, 43046],
							[64286, 64286],
							[65024, 65039],
							[65056, 65059],
							[65279, 65279],
							[65529, 65531]
						], n = [
							[68097, 68099],
							[68101, 68102],
							[68108, 68111],
							[68152, 68154],
							[68159, 68159],
							[119143, 119145],
							[119155, 119170],
							[119173, 119179],
							[119210, 119213],
							[119362, 119364],
							[917505, 917505],
							[917536, 917631],
							[917760, 917999]
						];
						let o;
						t.UnicodeV6 = class {
							constructor() {
								if (this.version = "6", !o) {
									o = /* @__PURE__ */ new Uint8Array(65536), o.fill(1), o[0] = 0, o.fill(0, 1, 32), o.fill(0, 127, 160), o.fill(2, 4352, 4448), o[9001] = 2, o[9002] = 2, o.fill(2, 11904, 42192), o[12351] = 1, o.fill(2, 44032, 55204), o.fill(2, 63744, 64256), o.fill(2, 65040, 65050), o.fill(2, 65072, 65136), o.fill(2, 65280, 65377), o.fill(2, 65504, 65511);
									for (let e = 0; e < r.length; ++e) o.fill(0, r[e][0], r[e][1] + 1);
								}
							}
							wcwidth(e) {
								return e < 32 ? 0 : e < 127 ? 1 : e < 65536 ? o[e] : function(e, t) {
									let i, s = 0, r = t.length - 1;
									if (e < t[0][0] || e > t[r][1]) return !1;
									for (; r >= s;) if (i = s + r >> 1, e > t[i][1]) s = i + 1;
									else {
										if (!(e < t[i][0])) return !0;
										r = i - 1;
									}
									return !1;
								}(e, n) ? 0 : e >= 131072 && e <= 196605 || e >= 196608 && e <= 262141 ? 2 : 1;
							}
							charProperties(e, t) {
								let i = this.wcwidth(e), r = 0 === i && 0 !== t;
								if (r) {
									const e = s.UnicodeService.extractWidth(t);
									0 === e ? r = !1 : e > i && (i = e);
								}
								return s.UnicodeService.createPropertyValue(0, i, r);
							}
						};
					},
					3562: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.WriteBuffer = void 0;
						const s = i(7150), r = i(802);
						class n extends s.Disposable {
							constructor(e) {
								super(), this._action = e, this._writeBuffer = [], this._callbacks = [], this._pendingData = 0, this._bufferOffset = 0, this._isSyncWriting = !1, this._syncCalls = 0, this._didUserInput = !1, this._onWriteParsed = this._register(new r.Emitter()), this.onWriteParsed = this._onWriteParsed.event;
							}
							handleUserInput() {
								this._didUserInput = !0;
							}
							writeSync(e, t) {
								if (void 0 !== t && this._syncCalls > t) return void (this._syncCalls = 0);
								if (this._pendingData += e.length, this._writeBuffer.push(e), this._callbacks.push(void 0), this._syncCalls++, this._isSyncWriting) return;
								let i;
								for (this._isSyncWriting = !0; i = this._writeBuffer.shift();) {
									this._action(i);
									const e = this._callbacks.shift();
									e && e();
								}
								this._pendingData = 0, this._bufferOffset = 2147483647, this._isSyncWriting = !1, this._syncCalls = 0;
							}
							write(e, t) {
								if (this._pendingData > 5e7) throw new Error("write data discarded, use flow control to avoid losing data");
								if (!this._writeBuffer.length) {
									if (this._bufferOffset = 0, this._didUserInput) return this._didUserInput = !1, this._pendingData += e.length, this._writeBuffer.push(e), this._callbacks.push(t), void this._innerWrite();
									setTimeout((() => this._innerWrite()));
								}
								this._pendingData += e.length, this._writeBuffer.push(e), this._callbacks.push(t);
							}
							_innerWrite(e = 0, t = !0) {
								const i = e || performance.now();
								for (; this._writeBuffer.length > this._bufferOffset;) {
									const e = this._writeBuffer[this._bufferOffset], s = this._action(e, t);
									if (s) {
										const e = (e) => performance.now() - i >= 12 ? setTimeout((() => this._innerWrite(0, e))) : this._innerWrite(i, e);
										s.catch(((e) => (queueMicrotask((() => {
											throw e;
										})), Promise.resolve(!1)))).then(e);
										return;
									}
									const r = this._callbacks[this._bufferOffset];
									if (r && r(), this._bufferOffset++, this._pendingData -= e.length, performance.now() - i >= 12) break;
								}
								this._writeBuffer.length > this._bufferOffset ? (this._bufferOffset > 50 && (this._writeBuffer = this._writeBuffer.slice(this._bufferOffset), this._callbacks = this._callbacks.slice(this._bufferOffset), this._bufferOffset = 0), setTimeout((() => this._innerWrite()))) : (this._writeBuffer.length = 0, this._callbacks.length = 0, this._pendingData = 0, this._bufferOffset = 0), this._onWriteParsed.fire();
							}
						}
						t.WriteBuffer = n;
					},
					8693: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.parseColor = function(e) {
							if (!e) return;
							let t = e.toLowerCase();
							if (0 === t.indexOf("rgb:")) {
								t = t.slice(4);
								const e = i.exec(t);
								if (e) {
									const t = e[1] ? 15 : e[4] ? 255 : e[7] ? 4095 : 65535;
									return [
										Math.round(parseInt(e[1] || e[4] || e[7] || e[10], 16) / t * 255),
										Math.round(parseInt(e[2] || e[5] || e[8] || e[11], 16) / t * 255),
										Math.round(parseInt(e[3] || e[6] || e[9] || e[12], 16) / t * 255)
									];
								}
							} else if (0 === t.indexOf("#") && (t = t.slice(1), s.exec(t) && [
								3,
								6,
								9,
								12
							].includes(t.length))) {
								const e = t.length / 3, i = [
									0,
									0,
									0
								];
								for (let s = 0; s < 3; ++s) {
									const r = parseInt(t.slice(e * s, e * s + e), 16);
									i[s] = 1 === e ? r << 4 : 2 === e ? r : 3 === e ? r >> 4 : r >> 8;
								}
								return i;
							}
						}, t.toRgbString = function(e, t = 16) {
							const [i, s, n] = e;
							return `rgb:${r(i, t)}/${r(s, t)}/${r(n, t)}`;
						};
						const i = /^([\da-f])\/([\da-f])\/([\da-f])$|^([\da-f]{2})\/([\da-f]{2})\/([\da-f]{2})$|^([\da-f]{3})\/([\da-f]{3})\/([\da-f]{3})$|^([\da-f]{4})\/([\da-f]{4})\/([\da-f]{4})$/, s = /^[\da-f]+$/;
						function r(e, t) {
							const i = e.toString(16), s = i.length < 2 ? "0" + i : i;
							switch (t) {
								case 4: return i[0];
								case 8: return s;
								case 12: return (s + s).slice(0, 3);
								default: return s + s;
							}
						}
					},
					1263: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.PAYLOAD_LIMIT = void 0, t.PAYLOAD_LIMIT = 1e7;
					},
					9823: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.DcsHandler = t.DcsParser = void 0;
						const s = i(726), r = i(7262), n = i(1263), o = [];
						t.DcsParser = class {
							constructor() {
								this._handlers = Object.create(null), this._active = o, this._ident = 0, this._handlerFb = () => {}, this._stack = {
									paused: !1,
									loopPosition: 0,
									fallThrough: !1
								};
							}
							dispose() {
								this._handlers = Object.create(null), this._handlerFb = () => {}, this._active = o;
							}
							registerHandler(e, t) {
								void 0 === this._handlers[e] && (this._handlers[e] = []);
								const i = this._handlers[e];
								return i.push(t), { dispose: () => {
									const e = i.indexOf(t);
									-1 !== e && i.splice(e, 1);
								} };
							}
							clearHandler(e) {
								this._handlers[e] && delete this._handlers[e];
							}
							setHandlerFallback(e) {
								this._handlerFb = e;
							}
							reset() {
								if (this._active.length) for (let e = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; e >= 0; --e) this._active[e].unhook(!1);
								this._stack.paused = !1, this._active = o, this._ident = 0;
							}
							hook(e, t) {
								if (this.reset(), this._ident = e, this._active = this._handlers[e] || o, this._active.length) for (let e = this._active.length - 1; e >= 0; e--) this._active[e].hook(t);
								else this._handlerFb(this._ident, "HOOK", t);
							}
							put(e, t, i) {
								if (this._active.length) for (let s = this._active.length - 1; s >= 0; s--) this._active[s].put(e, t, i);
								else this._handlerFb(this._ident, "PUT", (0, s.utf32ToString)(e, t, i));
							}
							unhook(e, t = !0) {
								if (this._active.length) {
									let i = !1, s = this._active.length - 1, r = !1;
									if (this._stack.paused && (s = this._stack.loopPosition - 1, i = t, r = this._stack.fallThrough, this._stack.paused = !1), !r && !1 === i) {
										for (; s >= 0 && (i = this._active[s].unhook(e), !0 !== i); s--) if (i instanceof Promise) return this._stack.paused = !0, this._stack.loopPosition = s, this._stack.fallThrough = !1, i;
										s--;
									}
									for (; s >= 0; s--) if (i = this._active[s].unhook(!1), i instanceof Promise) return this._stack.paused = !0, this._stack.loopPosition = s, this._stack.fallThrough = !0, i;
								} else this._handlerFb(this._ident, "UNHOOK", e);
								this._active = o, this._ident = 0;
							}
						};
						const a = new r.Params();
						a.addParam(0), t.DcsHandler = class {
							constructor(e) {
								this._handler = e, this._data = "", this._params = a, this._hitLimit = !1;
							}
							hook(e) {
								this._params = e.length > 1 || e.params[0] ? e.clone() : a, this._data = "", this._hitLimit = !1;
							}
							put(e, t, i) {
								this._hitLimit || (this._data += (0, s.utf32ToString)(e, t, i), this._data.length > n.PAYLOAD_LIMIT && (this._data = "", this._hitLimit = !0));
							}
							unhook(e) {
								let t = !1;
								if (this._hitLimit) t = !1;
								else if (e && (t = this._handler(this._data, this._params), t instanceof Promise)) return t.then(((e) => (this._params = a, this._data = "", this._hitLimit = !1, e)));
								return this._params = a, this._data = "", this._hitLimit = !1, t;
							}
						};
					},
					6717: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.EscapeSequenceParser = t.VT500_TRANSITION_TABLE = t.TransitionTable = void 0;
						const s = i(7150), r = i(7262), n = i(1346), o = i(9823);
						class a {
							constructor(e) {
								this.table = new Uint8Array(e);
							}
							setDefault(e, t) {
								this.table.fill(e << 4 | t);
							}
							add(e, t, i, s) {
								this.table[t << 8 | e] = i << 4 | s;
							}
							addMany(e, t, i, s) {
								for (let r = 0; r < e.length; r++) this.table[t << 8 | e[r]] = i << 4 | s;
							}
						}
						t.TransitionTable = a;
						const l = 160;
						t.VT500_TRANSITION_TABLE = function() {
							const e = new a(4095), t = Array.apply(null, Array(256)).map(((e, t) => t)), i = (e, i) => t.slice(e, i), s = i(32, 127), r = i(0, 24);
							r.push(25), r.push.apply(r, i(28, 32));
							const n = i(0, 14);
							let o;
							for (o in e.setDefault(1, 0), e.addMany(s, 0, 2, 0), n) e.addMany([
								24,
								26,
								153,
								154
							], o, 3, 0), e.addMany(i(128, 144), o, 3, 0), e.addMany(i(144, 152), o, 3, 0), e.add(156, o, 0, 0), e.add(27, o, 11, 1), e.add(157, o, 4, 8), e.addMany([
								152,
								158,
								159
							], o, 0, 7), e.add(155, o, 11, 3), e.add(144, o, 11, 9);
							return e.addMany(r, 0, 3, 0), e.addMany(r, 1, 3, 1), e.add(127, 1, 0, 1), e.addMany(r, 8, 0, 8), e.addMany(r, 3, 3, 3), e.add(127, 3, 0, 3), e.addMany(r, 4, 3, 4), e.add(127, 4, 0, 4), e.addMany(r, 6, 3, 6), e.addMany(r, 5, 3, 5), e.add(127, 5, 0, 5), e.addMany(r, 2, 3, 2), e.add(127, 2, 0, 2), e.add(93, 1, 4, 8), e.addMany(s, 8, 5, 8), e.add(127, 8, 5, 8), e.addMany([
								156,
								27,
								24,
								26,
								7
							], 8, 6, 0), e.addMany(i(28, 32), 8, 0, 8), e.addMany([
								88,
								94,
								95
							], 1, 0, 7), e.addMany(s, 7, 0, 7), e.addMany(r, 7, 0, 7), e.add(156, 7, 0, 0), e.add(127, 7, 0, 7), e.add(91, 1, 11, 3), e.addMany(i(64, 127), 3, 7, 0), e.addMany(i(48, 60), 3, 8, 4), e.addMany([
								60,
								61,
								62,
								63
							], 3, 9, 4), e.addMany(i(48, 60), 4, 8, 4), e.addMany(i(64, 127), 4, 7, 0), e.addMany([
								60,
								61,
								62,
								63
							], 4, 0, 6), e.addMany(i(32, 64), 6, 0, 6), e.add(127, 6, 0, 6), e.addMany(i(64, 127), 6, 0, 0), e.addMany(i(32, 48), 3, 9, 5), e.addMany(i(32, 48), 5, 9, 5), e.addMany(i(48, 64), 5, 0, 6), e.addMany(i(64, 127), 5, 7, 0), e.addMany(i(32, 48), 4, 9, 5), e.addMany(i(32, 48), 1, 9, 2), e.addMany(i(32, 48), 2, 9, 2), e.addMany(i(48, 127), 2, 10, 0), e.addMany(i(48, 80), 1, 10, 0), e.addMany(i(81, 88), 1, 10, 0), e.addMany([
								89,
								90,
								92
							], 1, 10, 0), e.addMany(i(96, 127), 1, 10, 0), e.add(80, 1, 11, 9), e.addMany(r, 9, 0, 9), e.add(127, 9, 0, 9), e.addMany(i(28, 32), 9, 0, 9), e.addMany(i(32, 48), 9, 9, 12), e.addMany(i(48, 60), 9, 8, 10), e.addMany([
								60,
								61,
								62,
								63
							], 9, 9, 10), e.addMany(r, 11, 0, 11), e.addMany(i(32, 128), 11, 0, 11), e.addMany(i(28, 32), 11, 0, 11), e.addMany(r, 10, 0, 10), e.add(127, 10, 0, 10), e.addMany(i(28, 32), 10, 0, 10), e.addMany(i(48, 60), 10, 8, 10), e.addMany([
								60,
								61,
								62,
								63
							], 10, 0, 11), e.addMany(i(32, 48), 10, 9, 12), e.addMany(r, 12, 0, 12), e.add(127, 12, 0, 12), e.addMany(i(28, 32), 12, 0, 12), e.addMany(i(32, 48), 12, 9, 12), e.addMany(i(48, 64), 12, 0, 11), e.addMany(i(64, 127), 12, 12, 13), e.addMany(i(64, 127), 10, 12, 13), e.addMany(i(64, 127), 9, 12, 13), e.addMany(r, 13, 13, 13), e.addMany(s, 13, 13, 13), e.add(127, 13, 0, 13), e.addMany([
								27,
								156,
								24,
								26
							], 13, 14, 0), e.add(l, 0, 2, 0), e.add(l, 8, 5, 8), e.add(l, 6, 0, 6), e.add(l, 11, 0, 11), e.add(l, 13, 13, 13), e;
						}();
						class h extends s.Disposable {
							constructor(e = t.VT500_TRANSITION_TABLE) {
								super(), this._transitions = e, this._parseStack = {
									state: 0,
									handlers: [],
									handlerPos: 0,
									transition: 0,
									chunkPos: 0
								}, this.initialState = 0, this.currentState = this.initialState, this._params = new r.Params(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0, this._printHandlerFb = (e, t, i) => {}, this._executeHandlerFb = (e) => {}, this._csiHandlerFb = (e, t) => {}, this._escHandlerFb = (e) => {}, this._errorHandlerFb = (e) => e, this._printHandler = this._printHandlerFb, this._executeHandlers = Object.create(null), this._csiHandlers = Object.create(null), this._escHandlers = Object.create(null), this._register((0, s.toDisposable)((() => {
									this._csiHandlers = Object.create(null), this._executeHandlers = Object.create(null), this._escHandlers = Object.create(null);
								}))), this._oscParser = this._register(new n.OscParser()), this._dcsParser = this._register(new o.DcsParser()), this._errorHandler = this._errorHandlerFb, this.registerEscHandler({ final: "\\" }, (() => !0));
							}
							_identifier(e, t = [64, 126]) {
								let i = 0;
								if (e.prefix) {
									if (e.prefix.length > 1) throw new Error("only one byte as prefix supported");
									if (i = e.prefix.charCodeAt(0), i && 60 > i || i > 63) throw new Error("prefix must be in range 0x3c .. 0x3f");
								}
								if (e.intermediates) {
									if (e.intermediates.length > 2) throw new Error("only two bytes as intermediates are supported");
									for (let t = 0; t < e.intermediates.length; ++t) {
										const s = e.intermediates.charCodeAt(t);
										if (32 > s || s > 47) throw new Error("intermediate must be in range 0x20 .. 0x2f");
										i <<= 8, i |= s;
									}
								}
								if (1 !== e.final.length) throw new Error("final must be a single byte");
								const s = e.final.charCodeAt(0);
								if (t[0] > s || s > t[1]) throw new Error(`final must be in range ${t[0]} .. ${t[1]}`);
								return i <<= 8, i |= s, i;
							}
							identToString(e) {
								const t = [];
								for (; e;) t.push(String.fromCharCode(255 & e)), e >>= 8;
								return t.reverse().join("");
							}
							setPrintHandler(e) {
								this._printHandler = e;
							}
							clearPrintHandler() {
								this._printHandler = this._printHandlerFb;
							}
							registerEscHandler(e, t) {
								const i = this._identifier(e, [48, 126]);
								void 0 === this._escHandlers[i] && (this._escHandlers[i] = []);
								const s = this._escHandlers[i];
								return s.push(t), { dispose: () => {
									const e = s.indexOf(t);
									-1 !== e && s.splice(e, 1);
								} };
							}
							clearEscHandler(e) {
								this._escHandlers[this._identifier(e, [48, 126])] && delete this._escHandlers[this._identifier(e, [48, 126])];
							}
							setEscHandlerFallback(e) {
								this._escHandlerFb = e;
							}
							setExecuteHandler(e, t) {
								this._executeHandlers[e.charCodeAt(0)] = t;
							}
							clearExecuteHandler(e) {
								this._executeHandlers[e.charCodeAt(0)] && delete this._executeHandlers[e.charCodeAt(0)];
							}
							setExecuteHandlerFallback(e) {
								this._executeHandlerFb = e;
							}
							registerCsiHandler(e, t) {
								const i = this._identifier(e);
								void 0 === this._csiHandlers[i] && (this._csiHandlers[i] = []);
								const s = this._csiHandlers[i];
								return s.push(t), { dispose: () => {
									const e = s.indexOf(t);
									-1 !== e && s.splice(e, 1);
								} };
							}
							clearCsiHandler(e) {
								this._csiHandlers[this._identifier(e)] && delete this._csiHandlers[this._identifier(e)];
							}
							setCsiHandlerFallback(e) {
								this._csiHandlerFb = e;
							}
							registerDcsHandler(e, t) {
								return this._dcsParser.registerHandler(this._identifier(e), t);
							}
							clearDcsHandler(e) {
								this._dcsParser.clearHandler(this._identifier(e));
							}
							setDcsHandlerFallback(e) {
								this._dcsParser.setHandlerFallback(e);
							}
							registerOscHandler(e, t) {
								return this._oscParser.registerHandler(e, t);
							}
							clearOscHandler(e) {
								this._oscParser.clearHandler(e);
							}
							setOscHandlerFallback(e) {
								this._oscParser.setHandlerFallback(e);
							}
							setErrorHandler(e) {
								this._errorHandler = e;
							}
							clearErrorHandler() {
								this._errorHandler = this._errorHandlerFb;
							}
							reset() {
								this.currentState = this.initialState, this._oscParser.reset(), this._dcsParser.reset(), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0, 0 !== this._parseStack.state && (this._parseStack.state = 2, this._parseStack.handlers = []);
							}
							_preserveStack(e, t, i, s, r) {
								this._parseStack.state = e, this._parseStack.handlers = t, this._parseStack.handlerPos = i, this._parseStack.transition = s, this._parseStack.chunkPos = r;
							}
							parse(e, t, i) {
								let s, r = 0, n = 0, o = 0;
								if (this._parseStack.state) if (2 === this._parseStack.state) this._parseStack.state = 0, o = this._parseStack.chunkPos + 1;
								else {
									if (void 0 === i || 1 === this._parseStack.state) throw this._parseStack.state = 1, /* @__PURE__ */ new Error("improper continuation due to previous async handler, giving up parsing");
									const t = this._parseStack.handlers;
									let n = this._parseStack.handlerPos - 1;
									switch (this._parseStack.state) {
										case 3:
											if (!1 === i && n > -1) {
												for (; n >= 0 && (s = t[n](this._params), !0 !== s); n--) if (s instanceof Promise) return this._parseStack.handlerPos = n, s;
											}
											this._parseStack.handlers = [];
											break;
										case 4:
											if (!1 === i && n > -1) {
												for (; n >= 0 && (s = t[n](), !0 !== s); n--) if (s instanceof Promise) return this._parseStack.handlerPos = n, s;
											}
											this._parseStack.handlers = [];
											break;
										case 6:
											if (r = e[this._parseStack.chunkPos], s = this._dcsParser.unhook(24 !== r && 26 !== r, i), s) return s;
											27 === r && (this._parseStack.transition |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0;
											break;
										case 5:
											if (r = e[this._parseStack.chunkPos], s = this._oscParser.end(24 !== r && 26 !== r, i), s) return s;
											27 === r && (this._parseStack.transition |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0;
									}
									this._parseStack.state = 0, o = this._parseStack.chunkPos + 1, this.precedingJoinState = 0, this.currentState = 15 & this._parseStack.transition;
								}
								for (let i = o; i < t; ++i) {
									switch (r = e[i], n = this._transitions.table[this.currentState << 8 | (r < 160 ? r : l)], n >> 4) {
										case 2:
											for (let s = i + 1;; ++s) {
												if (s >= t || (r = e[s]) < 32 || r > 126 && r < l) {
													this._printHandler(e, i, s), i = s - 1;
													break;
												}
												if (++s >= t || (r = e[s]) < 32 || r > 126 && r < l) {
													this._printHandler(e, i, s), i = s - 1;
													break;
												}
												if (++s >= t || (r = e[s]) < 32 || r > 126 && r < l) {
													this._printHandler(e, i, s), i = s - 1;
													break;
												}
												if (++s >= t || (r = e[s]) < 32 || r > 126 && r < l) {
													this._printHandler(e, i, s), i = s - 1;
													break;
												}
											}
											break;
										case 3:
											this._executeHandlers[r] ? this._executeHandlers[r]() : this._executeHandlerFb(r), this.precedingJoinState = 0;
											break;
										case 0: break;
										case 1:
											if (this._errorHandler({
												position: i,
												code: r,
												currentState: this.currentState,
												collect: this._collect,
												params: this._params,
												abort: !1
											}).abort) return;
											break;
										case 7:
											const o = this._csiHandlers[this._collect << 8 | r];
											let a = o ? o.length - 1 : -1;
											for (; a >= 0 && (s = o[a](this._params), !0 !== s); a--) if (s instanceof Promise) return this._preserveStack(3, o, a, n, i), s;
											a < 0 && this._csiHandlerFb(this._collect << 8 | r, this._params), this.precedingJoinState = 0;
											break;
										case 8:
											do
												switch (r) {
													case 59:
														this._params.addParam(0);
														break;
													case 58:
														this._params.addSubParam(-1);
														break;
													default: this._params.addDigit(r - 48);
												}
											while (++i < t && (r = e[i]) > 47 && r < 60);
											i--;
											break;
										case 9:
											this._collect <<= 8, this._collect |= r;
											break;
										case 10:
											const h = this._escHandlers[this._collect << 8 | r];
											let c = h ? h.length - 1 : -1;
											for (; c >= 0 && (s = h[c](), !0 !== s); c--) if (s instanceof Promise) return this._preserveStack(4, h, c, n, i), s;
											c < 0 && this._escHandlerFb(this._collect << 8 | r), this.precedingJoinState = 0;
											break;
										case 11:
											this._params.reset(), this._params.addParam(0), this._collect = 0;
											break;
										case 12:
											this._dcsParser.hook(this._collect << 8 | r, this._params);
											break;
										case 13:
											for (let s = i + 1;; ++s) if (s >= t || 24 === (r = e[s]) || 26 === r || 27 === r || r > 127 && r < l) {
												this._dcsParser.put(e, i, s), i = s - 1;
												break;
											}
											break;
										case 14:
											if (s = this._dcsParser.unhook(24 !== r && 26 !== r), s) return this._preserveStack(6, [], 0, n, i), s;
											27 === r && (n |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0;
											break;
										case 4:
											this._oscParser.start();
											break;
										case 5:
											for (let s = i + 1;; s++) if (s >= t || (r = e[s]) < 32 || r > 127 && r < l) {
												this._oscParser.put(e, i, s), i = s - 1;
												break;
											}
											break;
										case 6:
											if (s = this._oscParser.end(24 !== r && 26 !== r), s) return this._preserveStack(5, [], 0, n, i), s;
											27 === r && (n |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0;
									}
									this.currentState = 15 & n;
								}
							}
						}
						t.EscapeSequenceParser = h;
					},
					1346: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.OscHandler = t.OscParser = void 0;
						const s = i(1263), r = i(726), n = [];
						t.OscParser = class {
							constructor() {
								this._state = 0, this._active = n, this._id = -1, this._handlers = Object.create(null), this._handlerFb = () => {}, this._stack = {
									paused: !1,
									loopPosition: 0,
									fallThrough: !1
								};
							}
							registerHandler(e, t) {
								void 0 === this._handlers[e] && (this._handlers[e] = []);
								const i = this._handlers[e];
								return i.push(t), { dispose: () => {
									const e = i.indexOf(t);
									-1 !== e && i.splice(e, 1);
								} };
							}
							clearHandler(e) {
								this._handlers[e] && delete this._handlers[e];
							}
							setHandlerFallback(e) {
								this._handlerFb = e;
							}
							dispose() {
								this._handlers = Object.create(null), this._handlerFb = () => {}, this._active = n;
							}
							reset() {
								if (2 === this._state) for (let e = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; e >= 0; --e) this._active[e].end(!1);
								this._stack.paused = !1, this._active = n, this._id = -1, this._state = 0;
							}
							_start() {
								if (this._active = this._handlers[this._id] || n, this._active.length) for (let e = this._active.length - 1; e >= 0; e--) this._active[e].start();
								else this._handlerFb(this._id, "START");
							}
							_put(e, t, i) {
								if (this._active.length) for (let s = this._active.length - 1; s >= 0; s--) this._active[s].put(e, t, i);
								else this._handlerFb(this._id, "PUT", (0, r.utf32ToString)(e, t, i));
							}
							start() {
								this.reset(), this._state = 1;
							}
							put(e, t, i) {
								if (3 !== this._state) {
									if (1 === this._state) for (; t < i;) {
										const i = e[t++];
										if (59 === i) {
											this._state = 2, this._start();
											break;
										}
										if (i < 48 || 57 < i) return void (this._state = 3);
										-1 === this._id && (this._id = 0), this._id = 10 * this._id + i - 48;
									}
									2 === this._state && i - t > 0 && this._put(e, t, i);
								}
							}
							end(e, t = !0) {
								if (0 !== this._state) {
									if (3 !== this._state) if (1 === this._state && this._start(), this._active.length) {
										let i = !1, s = this._active.length - 1, r = !1;
										if (this._stack.paused && (s = this._stack.loopPosition - 1, i = t, r = this._stack.fallThrough, this._stack.paused = !1), !r && !1 === i) {
											for (; s >= 0 && (i = this._active[s].end(e), !0 !== i); s--) if (i instanceof Promise) return this._stack.paused = !0, this._stack.loopPosition = s, this._stack.fallThrough = !1, i;
											s--;
										}
										for (; s >= 0; s--) if (i = this._active[s].end(!1), i instanceof Promise) return this._stack.paused = !0, this._stack.loopPosition = s, this._stack.fallThrough = !0, i;
									} else this._handlerFb(this._id, "END", e);
									this._active = n, this._id = -1, this._state = 0;
								}
							}
						}, t.OscHandler = class {
							constructor(e) {
								this._handler = e, this._data = "", this._hitLimit = !1;
							}
							start() {
								this._data = "", this._hitLimit = !1;
							}
							put(e, t, i) {
								this._hitLimit || (this._data += (0, r.utf32ToString)(e, t, i), this._data.length > s.PAYLOAD_LIMIT && (this._data = "", this._hitLimit = !0));
							}
							end(e) {
								let t = !1;
								if (this._hitLimit) t = !1;
								else if (e && (t = this._handler(this._data), t instanceof Promise)) return t.then(((e) => (this._data = "", this._hitLimit = !1, e)));
								return this._data = "", this._hitLimit = !1, t;
							}
						};
					},
					7262: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.Params = void 0;
						const i = 2147483647;
						class s {
							static fromArray(e) {
								const t = new s();
								if (!e.length) return t;
								for (let i = Array.isArray(e[0]) ? 1 : 0; i < e.length; ++i) {
									const s = e[i];
									if (Array.isArray(s)) for (let e = 0; e < s.length; ++e) t.addSubParam(s[e]);
									else t.addParam(s);
								}
								return t;
							}
							constructor(e = 32, t = 32) {
								if (this.maxLength = e, this.maxSubParamsLength = t, t > 256) throw new Error("maxSubParamsLength must not be greater than 256");
								this.params = new Int32Array(e), this.length = 0, this._subParams = new Int32Array(t), this._subParamsLength = 0, this._subParamsIdx = new Uint16Array(e), this._rejectDigits = !1, this._rejectSubDigits = !1, this._digitIsSub = !1;
							}
							clone() {
								const e = new s(this.maxLength, this.maxSubParamsLength);
								return e.params.set(this.params), e.length = this.length, e._subParams.set(this._subParams), e._subParamsLength = this._subParamsLength, e._subParamsIdx.set(this._subParamsIdx), e._rejectDigits = this._rejectDigits, e._rejectSubDigits = this._rejectSubDigits, e._digitIsSub = this._digitIsSub, e;
							}
							toArray() {
								const e = [];
								for (let t = 0; t < this.length; ++t) {
									e.push(this.params[t]);
									const i = this._subParamsIdx[t] >> 8, s = 255 & this._subParamsIdx[t];
									s - i > 0 && e.push(Array.prototype.slice.call(this._subParams, i, s));
								}
								return e;
							}
							reset() {
								this.length = 0, this._subParamsLength = 0, this._rejectDigits = !1, this._rejectSubDigits = !1, this._digitIsSub = !1;
							}
							addParam(e) {
								if (this._digitIsSub = !1, this.length >= this.maxLength) this._rejectDigits = !0;
								else {
									if (e < -1) throw new Error("values lesser than -1 are not allowed");
									this._subParamsIdx[this.length] = this._subParamsLength << 8 | this._subParamsLength, this.params[this.length++] = e > i ? i : e;
								}
							}
							addSubParam(e) {
								if (this._digitIsSub = !0, this.length) if (this._rejectDigits || this._subParamsLength >= this.maxSubParamsLength) this._rejectSubDigits = !0;
								else {
									if (e < -1) throw new Error("values lesser than -1 are not allowed");
									this._subParams[this._subParamsLength++] = e > i ? i : e, this._subParamsIdx[this.length - 1]++;
								}
							}
							hasSubParams(e) {
								return (255 & this._subParamsIdx[e]) - (this._subParamsIdx[e] >> 8) > 0;
							}
							getSubParams(e) {
								const t = this._subParamsIdx[e] >> 8, i = 255 & this._subParamsIdx[e];
								return i - t > 0 ? this._subParams.subarray(t, i) : null;
							}
							getSubParamsAll() {
								const e = {};
								for (let t = 0; t < this.length; ++t) {
									const i = this._subParamsIdx[t] >> 8, s = 255 & this._subParamsIdx[t];
									s - i > 0 && (e[t] = this._subParams.slice(i, s));
								}
								return e;
							}
							addDigit(e) {
								let t;
								if (this._rejectDigits || !(t = this._digitIsSub ? this._subParamsLength : this.length) || this._digitIsSub && this._rejectSubDigits) return;
								const s = this._digitIsSub ? this._subParams : this.params, r = s[t - 1];
								s[t - 1] = ~r ? Math.min(10 * r + e, i) : e;
							}
						}
						t.Params = s;
					},
					3027: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.AddonManager = void 0, t.AddonManager = class {
							constructor() {
								this._addons = [];
							}
							dispose() {
								for (let e = this._addons.length - 1; e >= 0; e--) this._addons[e].instance.dispose();
							}
							loadAddon(e, t) {
								const i = {
									instance: t,
									dispose: t.dispose,
									isDisposed: !1
								};
								this._addons.push(i), t.dispose = () => this._wrappedAddonDispose(i), t.activate(e);
							}
							_wrappedAddonDispose(e) {
								if (e.isDisposed) return;
								let t = -1;
								for (let i = 0; i < this._addons.length; i++) if (this._addons[i] === e) {
									t = i;
									break;
								}
								if (-1 === t) throw new Error("Could not dispose an addon that has not been loaded");
								e.isDisposed = !0, e.dispose.apply(e.instance), this._addons.splice(t, 1);
							}
						};
					},
					3235: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.BufferApiView = void 0;
						const s = i(793), r = i(3055);
						t.BufferApiView = class {
							constructor(e, t) {
								this._buffer = e, this.type = t;
							}
							init(e) {
								return this._buffer = e, this;
							}
							get cursorY() {
								return this._buffer.y;
							}
							get cursorX() {
								return this._buffer.x;
							}
							get viewportY() {
								return this._buffer.ydisp;
							}
							get baseY() {
								return this._buffer.ybase;
							}
							get length() {
								return this._buffer.lines.length;
							}
							getLine(e) {
								const t = this._buffer.lines.get(e);
								if (t) return new s.BufferLineApiView(t);
							}
							getNullCell() {
								return new r.CellData();
							}
						};
					},
					793: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.BufferLineApiView = void 0;
						const s = i(3055);
						t.BufferLineApiView = class {
							constructor(e) {
								this._line = e;
							}
							get isWrapped() {
								return this._line.isWrapped;
							}
							get length() {
								return this._line.length;
							}
							getCell(e, t) {
								if (!(e < 0 || e >= this._line.length)) return t ? (this._line.loadCell(e, t), t) : this._line.loadCell(e, new s.CellData());
							}
							translateToString(e, t, i) {
								return this._line.translateToString(e, t, i);
							}
						};
					},
					5101: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.BufferNamespaceApi = void 0;
						const s = i(3235), r = i(7150), n = i(802);
						class o extends r.Disposable {
							constructor(e) {
								super(), this._core = e, this._onBufferChange = this._register(new n.Emitter()), this.onBufferChange = this._onBufferChange.event, this._normal = new s.BufferApiView(this._core.buffers.normal, "normal"), this._alternate = new s.BufferApiView(this._core.buffers.alt, "alternate"), this._core.buffers.onBufferActivate((() => this._onBufferChange.fire(this.active)));
							}
							get active() {
								if (this._core.buffers.active === this._core.buffers.normal) return this.normal;
								if (this._core.buffers.active === this._core.buffers.alt) return this.alternate;
								throw new Error("Active buffer is neither normal nor alternate");
							}
							get normal() {
								return this._normal.init(this._core.buffers.normal);
							}
							get alternate() {
								return this._alternate.init(this._core.buffers.alt);
							}
						}
						t.BufferNamespaceApi = o;
					},
					6097: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.ParserApi = void 0, t.ParserApi = class {
							constructor(e) {
								this._core = e;
							}
							registerCsiHandler(e, t) {
								return this._core.registerCsiHandler(e, ((e) => t(e.toArray())));
							}
							addCsiHandler(e, t) {
								return this.registerCsiHandler(e, t);
							}
							registerDcsHandler(e, t) {
								return this._core.registerDcsHandler(e, ((e, i) => t(e, i.toArray())));
							}
							addDcsHandler(e, t) {
								return this.registerDcsHandler(e, t);
							}
							registerEscHandler(e, t) {
								return this._core.registerEscHandler(e, t);
							}
							addEscHandler(e, t) {
								return this.registerEscHandler(e, t);
							}
							registerOscHandler(e, t) {
								return this._core.registerOscHandler(e, t);
							}
							addOscHandler(e, t) {
								return this.registerOscHandler(e, t);
							}
						};
					},
					4335: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.UnicodeApi = void 0, t.UnicodeApi = class {
							constructor(e) {
								this._core = e;
							}
							register(e) {
								this._core.unicodeService.register(e);
							}
							get versions() {
								return this._core.unicodeService.versions;
							}
							get activeVersion() {
								return this._core.unicodeService.activeVersion;
							}
							set activeVersion(e) {
								this._core.unicodeService.activeVersion = e;
							}
						};
					},
					9640: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.BufferService = t.MINIMUM_ROWS = t.MINIMUM_COLS = void 0;
						const n = i(7150), o = i(4097), a = i(6501), l = i(802);
						t.MINIMUM_COLS = 2, t.MINIMUM_ROWS = 1;
						let h = class extends n.Disposable {
							get buffer() {
								return this.buffers.active;
							}
							constructor(e) {
								super(), this.isUserScrolling = !1, this._onResize = this._register(new l.Emitter()), this.onResize = this._onResize.event, this._onScroll = this._register(new l.Emitter()), this.onScroll = this._onScroll.event, this.cols = Math.max(e.rawOptions.cols || 0, t.MINIMUM_COLS), this.rows = Math.max(e.rawOptions.rows || 0, t.MINIMUM_ROWS), this.buffers = this._register(new o.BufferSet(e, this)), this._register(this.buffers.onBufferActivate(((e) => {
									this._onScroll.fire(e.activeBuffer.ydisp);
								})));
							}
							resize(e, t) {
								const i = this.cols !== e, s = this.rows !== t;
								this.cols = e, this.rows = t, this.buffers.resize(e, t), this._onResize.fire({
									cols: e,
									rows: t,
									colsChanged: i,
									rowsChanged: s
								});
							}
							reset() {
								this.buffers.reset(), this.isUserScrolling = !1;
							}
							scroll(e, t = !1) {
								const i = this.buffer;
								let s;
								s = this._cachedBlankLine, s && s.length === this.cols && s.getFg(0) === e.fg && s.getBg(0) === e.bg || (s = i.getBlankLine(e, t), this._cachedBlankLine = s), s.isWrapped = t;
								const r = i.ybase + i.scrollTop, n = i.ybase + i.scrollBottom;
								if (0 === i.scrollTop) {
									const e = i.lines.isFull;
									n === i.lines.length - 1 ? e ? i.lines.recycle().copyFrom(s) : i.lines.push(s.clone()) : i.lines.splice(n + 1, 0, s.clone()), e ? this.isUserScrolling && (i.ydisp = Math.max(i.ydisp - 1, 0)) : (i.ybase++, this.isUserScrolling || i.ydisp++);
								} else {
									const e = n - r + 1;
									i.lines.shiftElements(r + 1, e - 1, -1), i.lines.set(n, s.clone());
								}
								this.isUserScrolling || (i.ydisp = i.ybase), this._onScroll.fire(i.ydisp);
							}
							scrollLines(e, t) {
								const i = this.buffer;
								if (e < 0) {
									if (0 === i.ydisp) return;
									this.isUserScrolling = !0;
								} else e + i.ydisp >= i.ybase && (this.isUserScrolling = !1);
								const s = i.ydisp;
								i.ydisp = Math.max(Math.min(i.ydisp + e, i.ybase), 0), s !== i.ydisp && (t || this._onScroll.fire(i.ydisp));
							}
						};
						t.BufferService = h, t.BufferService = h = s([r(0, a.IOptionsService)], h);
					},
					5746: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.CharsetService = void 0, t.CharsetService = class {
							constructor() {
								this.glevel = 0, this._charsets = [];
							}
							reset() {
								this.charset = void 0, this._charsets = [], this.glevel = 0;
							}
							setgLevel(e) {
								this.glevel = e, this.charset = this._charsets[e];
							}
							setgCharset(e, t) {
								this._charsets[e] = t, this.glevel === e && (this.charset = t);
							}
						};
					},
					7792: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.CoreMouseService = void 0;
						const n = i(6501), o = i(7150), a = i(802), l = {
							NONE: {
								events: 0,
								restrict: () => !1
							},
							X10: {
								events: 1,
								restrict: (e) => 4 !== e.button && 1 === e.action && (e.ctrl = !1, e.alt = !1, e.shift = !1, !0)
							},
							VT200: {
								events: 19,
								restrict: (e) => 32 !== e.action
							},
							DRAG: {
								events: 23,
								restrict: (e) => 32 !== e.action || 3 !== e.button
							},
							ANY: {
								events: 31,
								restrict: (e) => !0
							}
						};
						function h(e, t) {
							let i = (e.ctrl ? 16 : 0) | (e.shift ? 4 : 0) | (e.alt ? 8 : 0);
							return 4 === e.button ? (i |= 64, i |= e.action) : (i |= 3 & e.button, 4 & e.button && (i |= 64), 8 & e.button && (i |= 128), 32 === e.action ? i |= 32 : 0 !== e.action || t || (i |= 3)), i;
						}
						const c = String.fromCharCode, d = {
							DEFAULT: (e) => {
								const t = [
									h(e, !1) + 32,
									e.col + 32,
									e.row + 32
								];
								return t[0] > 255 || t[1] > 255 || t[2] > 255 ? "" : `[M${c(t[0])}${c(t[1])}${c(t[2])}`;
							},
							SGR: (e) => {
								const t = 0 === e.action && 4 !== e.button ? "m" : "M";
								return `[<${h(e, !0)};${e.col};${e.row}${t}`;
							},
							SGR_PIXELS: (e) => {
								const t = 0 === e.action && 4 !== e.button ? "m" : "M";
								return `[<${h(e, !0)};${e.x};${e.y}${t}`;
							}
						};
						let u = class extends o.Disposable {
							constructor(e, t, i) {
								super(), this._bufferService = e, this._coreService = t, this._optionsService = i, this._protocols = {}, this._encodings = {}, this._activeProtocol = "", this._activeEncoding = "", this._lastEvent = null, this._wheelPartialScroll = 0, this._onProtocolChange = this._register(new a.Emitter()), this.onProtocolChange = this._onProtocolChange.event;
								for (const e of Object.keys(l)) this.addProtocol(e, l[e]);
								for (const e of Object.keys(d)) this.addEncoding(e, d[e]);
								this.reset();
							}
							addProtocol(e, t) {
								this._protocols[e] = t;
							}
							addEncoding(e, t) {
								this._encodings[e] = t;
							}
							get activeProtocol() {
								return this._activeProtocol;
							}
							get areMouseEventsActive() {
								return 0 !== this._protocols[this._activeProtocol].events;
							}
							set activeProtocol(e) {
								if (!this._protocols[e]) throw new Error(`unknown protocol "${e}"`);
								this._activeProtocol = e, this._onProtocolChange.fire(this._protocols[e].events);
							}
							get activeEncoding() {
								return this._activeEncoding;
							}
							set activeEncoding(e) {
								if (!this._encodings[e]) throw new Error(`unknown encoding "${e}"`);
								this._activeEncoding = e;
							}
							reset() {
								this.activeProtocol = "NONE", this.activeEncoding = "DEFAULT", this._lastEvent = null, this._wheelPartialScroll = 0;
							}
							consumeWheelEvent(e, t, i) {
								if (0 === e.deltaY || e.shiftKey) return 0;
								if (void 0 === t || void 0 === i) return 0;
								const s = t / i;
								let r = this._applyScrollModifier(e.deltaY, e);
								return e.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? (r /= s + 0, Math.abs(e.deltaY) < 50 && (r *= .3), this._wheelPartialScroll += r, r = Math.floor(Math.abs(this._wheelPartialScroll)) * (this._wheelPartialScroll > 0 ? 1 : -1), this._wheelPartialScroll %= 1) : e.deltaMode === WheelEvent.DOM_DELTA_PAGE && (r *= this._bufferService.rows), r;
							}
							_applyScrollModifier(e, t) {
								return t.altKey || t.ctrlKey || t.shiftKey ? e * this._optionsService.rawOptions.fastScrollSensitivity * this._optionsService.rawOptions.scrollSensitivity : e * this._optionsService.rawOptions.scrollSensitivity;
							}
							triggerMouseEvent(e) {
								if (e.col < 0 || e.col >= this._bufferService.cols || e.row < 0 || e.row >= this._bufferService.rows) return !1;
								if (4 === e.button && 32 === e.action) return !1;
								if (3 === e.button && 32 !== e.action) return !1;
								if (4 !== e.button && (2 === e.action || 3 === e.action)) return !1;
								if (e.col++, e.row++, 32 === e.action && this._lastEvent && this._equalEvents(this._lastEvent, e, "SGR_PIXELS" === this._activeEncoding)) return !1;
								if (!this._protocols[this._activeProtocol].restrict(e)) return !1;
								const t = this._encodings[this._activeEncoding](e);
								return t && ("DEFAULT" === this._activeEncoding ? this._coreService.triggerBinaryEvent(t) : this._coreService.triggerDataEvent(t, !0)), this._lastEvent = e, !0;
							}
							explainEvents(e) {
								return {
									down: !!(1 & e),
									up: !!(2 & e),
									drag: !!(4 & e),
									move: !!(8 & e),
									wheel: !!(16 & e)
								};
							}
							_equalEvents(e, t, i) {
								if (i) {
									if (e.x !== t.x) return !1;
									if (e.y !== t.y) return !1;
								} else {
									if (e.col !== t.col) return !1;
									if (e.row !== t.row) return !1;
								}
								return e.button === t.button && e.action === t.action && e.ctrl === t.ctrl && e.alt === t.alt && e.shift === t.shift;
							}
						};
						t.CoreMouseService = u, t.CoreMouseService = u = s([
							r(0, n.IBufferService),
							r(1, n.ICoreService),
							r(2, n.IOptionsService)
						], u);
					},
					4071: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.CoreService = void 0;
						const n = i(7453), o = i(7150), a = i(6501), l = i(802), h = Object.freeze({ insertMode: !1 }), c = Object.freeze({
							applicationCursorKeys: !1,
							applicationKeypad: !1,
							bracketedPasteMode: !1,
							cursorBlink: void 0,
							cursorStyle: void 0,
							origin: !1,
							reverseWraparound: !1,
							sendFocus: !1,
							synchronizedOutput: !1,
							wraparound: !0
						});
						let d = class extends o.Disposable {
							constructor(e, t, i) {
								super(), this._bufferService = e, this._logService = t, this._optionsService = i, this.isCursorInitialized = !1, this.isCursorHidden = !1, this._onData = this._register(new l.Emitter()), this.onData = this._onData.event, this._onUserInput = this._register(new l.Emitter()), this.onUserInput = this._onUserInput.event, this._onBinary = this._register(new l.Emitter()), this.onBinary = this._onBinary.event, this._onRequestScrollToBottom = this._register(new l.Emitter()), this.onRequestScrollToBottom = this._onRequestScrollToBottom.event, this.modes = (0, n.clone)(h), this.decPrivateModes = (0, n.clone)(c);
							}
							reset() {
								this.modes = (0, n.clone)(h), this.decPrivateModes = (0, n.clone)(c);
							}
							triggerDataEvent(e, t = !1) {
								if (this._optionsService.rawOptions.disableStdin) return;
								const i = this._bufferService.buffer;
								t && this._optionsService.rawOptions.scrollOnUserInput && i.ybase !== i.ydisp && this._onRequestScrollToBottom.fire(), t && this._onUserInput.fire(), this._logService.debug(`sending data "${e}"`), this._logService.trace("sending data (codes)", (() => e.split("").map(((e) => e.charCodeAt(0))))), this._onData.fire(e);
							}
							triggerBinaryEvent(e) {
								this._optionsService.rawOptions.disableStdin || (this._logService.debug(`sending binary "${e}"`), this._logService.trace("sending binary (codes)", (() => e.split("").map(((e) => e.charCodeAt(0))))), this._onBinary.fire(e));
							}
						};
						t.CoreService = d, t.CoreService = d = s([
							r(0, a.IBufferService),
							r(1, a.ILogService),
							r(2, a.IOptionsService)
						], d);
					},
					4720: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.DecorationService = void 0;
						const s = i(4103), r = i(7150), n = i(3087), o = i(802);
						let a = 0, l = 0;
						class h extends r.Disposable {
							get decorations() {
								return this._decorations.values();
							}
							constructor() {
								super(), this._decorations = new n.SortedList(((e) => e?.marker.line)), this._onDecorationRegistered = this._register(new o.Emitter()), this.onDecorationRegistered = this._onDecorationRegistered.event, this._onDecorationRemoved = this._register(new o.Emitter()), this.onDecorationRemoved = this._onDecorationRemoved.event, this._register((0, r.toDisposable)((() => this.reset())));
							}
							registerDecoration(e) {
								if (e.marker.isDisposed) return;
								const t = new c(e);
								if (t) {
									const e = t.marker.onDispose((() => t.dispose())), i = t.onDispose((() => {
										i.dispose(), t && (this._decorations.delete(t) && this._onDecorationRemoved.fire(t), e.dispose());
									}));
									this._decorations.insert(t), this._onDecorationRegistered.fire(t);
								}
								return t;
							}
							reset() {
								for (const e of this._decorations.values()) e.dispose();
								this._decorations.clear();
							}
							*getDecorationsAtCell(e, t, i) {
								let s = 0, r = 0;
								for (const n of this._decorations.getKeyIterator(t)) s = n.options.x ?? 0, r = s + (n.options.width ?? 1), e >= s && e < r && (!i || (n.options.layer ?? "bottom") === i) && (yield n);
							}
							forEachDecorationAtCell(e, t, i, s) {
								this._decorations.forEachByKey(t, ((t) => {
									a = t.options.x ?? 0, l = a + (t.options.width ?? 1), e >= a && e < l && (!i || (t.options.layer ?? "bottom") === i) && s(t);
								}));
							}
						}
						t.DecorationService = h;
						class c extends r.DisposableStore {
							get backgroundColorRGB() {
								return null === this._cachedBg && (this.options.backgroundColor ? this._cachedBg = s.css.toColor(this.options.backgroundColor) : this._cachedBg = void 0), this._cachedBg;
							}
							get foregroundColorRGB() {
								return null === this._cachedFg && (this.options.foregroundColor ? this._cachedFg = s.css.toColor(this.options.foregroundColor) : this._cachedFg = void 0), this._cachedFg;
							}
							constructor(e) {
								super(), this.options = e, this.onRenderEmitter = this.add(new o.Emitter()), this.onRender = this.onRenderEmitter.event, this._onDispose = this.add(new o.Emitter()), this.onDispose = this._onDispose.event, this._cachedBg = null, this._cachedFg = null, this.marker = e.marker, this.options.overviewRulerOptions && !this.options.overviewRulerOptions.position && (this.options.overviewRulerOptions.position = "full");
							}
							dispose() {
								this._onDispose.fire(), super.dispose();
							}
						}
					},
					6025: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.InstantiationService = t.ServiceCollection = void 0;
						const s = i(6501), r = i(6201);
						class n {
							constructor(...e) {
								this._entries = /* @__PURE__ */ new Map();
								for (const [t, i] of e) this.set(t, i);
							}
							set(e, t) {
								const i = this._entries.get(e);
								return this._entries.set(e, t), i;
							}
							forEach(e) {
								for (const [t, i] of this._entries.entries()) e(t, i);
							}
							has(e) {
								return this._entries.has(e);
							}
							get(e) {
								return this._entries.get(e);
							}
						}
						t.ServiceCollection = n, t.InstantiationService = class {
							constructor() {
								this._services = new n(), this._services.set(s.IInstantiationService, this);
							}
							setService(e, t) {
								this._services.set(e, t);
							}
							getService(e) {
								return this._services.get(e);
							}
							createInstance(e, ...t) {
								const i = (0, r.getServiceDependencies)(e).sort(((e, t) => e.index - t.index)), s = [];
								for (const t of i) {
									const i = this._services.get(t.id);
									if (!i) throw new Error(`[createInstance] ${e.name} depends on UNKNOWN service ${t.id._id}.`);
									s.push(i);
								}
								const n = i.length > 0 ? i[0].index : t.length;
								if (t.length !== n) throw new Error(`[createInstance] First service dependency of ${e.name} at position ${n + 1} conflicts with ${t.length} static arguments`);
								return new e(...[...t, ...s]);
							}
						};
					},
					7276: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.LogService = void 0, t.setTraceLogger = function(e) {
							l = e;
						}, t.traceCall = function(e, t, i) {
							if ("function" != typeof i.value) throw new Error("not supported");
							const s = i.value;
							i.value = function(...e) {
								if (l.logLevel !== o.LogLevelEnum.TRACE) return s.apply(this, e);
								l.trace(`GlyphRenderer#${s.name}(${e.map(((e) => JSON.stringify(e))).join(", ")})`);
								const t = s.apply(this, e);
								return l.trace(`GlyphRenderer#${s.name} return`, t), t;
							};
						};
						const n = i(7150), o = i(6501), a = {
							trace: o.LogLevelEnum.TRACE,
							debug: o.LogLevelEnum.DEBUG,
							info: o.LogLevelEnum.INFO,
							warn: o.LogLevelEnum.WARN,
							error: o.LogLevelEnum.ERROR,
							off: o.LogLevelEnum.OFF
						};
						let l, h = class extends n.Disposable {
							get logLevel() {
								return this._logLevel;
							}
							constructor(e) {
								super(), this._optionsService = e, this._logLevel = o.LogLevelEnum.OFF, this._updateLogLevel(), this._register(this._optionsService.onSpecificOptionChange("logLevel", (() => this._updateLogLevel()))), l = this;
							}
							_updateLogLevel() {
								this._logLevel = a[this._optionsService.rawOptions.logLevel];
							}
							_evalLazyOptionalParams(e) {
								for (let t = 0; t < e.length; t++) "function" == typeof e[t] && (e[t] = e[t]());
							}
							_log(e, t, i) {
								this._evalLazyOptionalParams(i), e.call(console, (this._optionsService.options.logger ? "" : "xterm.js: ") + t, ...i);
							}
							trace(e, ...t) {
								this._logLevel <= o.LogLevelEnum.TRACE && this._log(this._optionsService.options.logger?.trace.bind(this._optionsService.options.logger) ?? console.log, e, t);
							}
							debug(e, ...t) {
								this._logLevel <= o.LogLevelEnum.DEBUG && this._log(this._optionsService.options.logger?.debug.bind(this._optionsService.options.logger) ?? console.log, e, t);
							}
							info(e, ...t) {
								this._logLevel <= o.LogLevelEnum.INFO && this._log(this._optionsService.options.logger?.info.bind(this._optionsService.options.logger) ?? console.info, e, t);
							}
							warn(e, ...t) {
								this._logLevel <= o.LogLevelEnum.WARN && this._log(this._optionsService.options.logger?.warn.bind(this._optionsService.options.logger) ?? console.warn, e, t);
							}
							error(e, ...t) {
								this._logLevel <= o.LogLevelEnum.ERROR && this._log(this._optionsService.options.logger?.error.bind(this._optionsService.options.logger) ?? console.error, e, t);
							}
						};
						t.LogService = h, t.LogService = h = s([r(0, o.IOptionsService)], h);
					},
					56: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.OptionsService = t.DEFAULT_OPTIONS = void 0;
						const s = i(7150), r = i(701), n = i(802);
						t.DEFAULT_OPTIONS = {
							cols: 80,
							rows: 24,
							cursorBlink: !1,
							cursorStyle: "block",
							cursorWidth: 1,
							cursorInactiveStyle: "outline",
							customGlyphs: !0,
							drawBoldTextInBrightColors: !0,
							documentOverride: null,
							fastScrollModifier: "alt",
							fastScrollSensitivity: 5,
							fontFamily: "monospace",
							fontSize: 15,
							fontWeight: "normal",
							fontWeightBold: "bold",
							ignoreBracketedPasteMode: !1,
							lineHeight: 1,
							letterSpacing: 0,
							linkHandler: null,
							logLevel: "info",
							logger: null,
							scrollback: 1e3,
							scrollOnEraseInDisplay: !1,
							scrollOnUserInput: !0,
							scrollSensitivity: 1,
							screenReaderMode: !1,
							smoothScrollDuration: 0,
							macOptionIsMeta: !1,
							macOptionClickForcesSelection: !1,
							minimumContrastRatio: 1,
							disableStdin: !1,
							allowProposedApi: !1,
							allowTransparency: !1,
							tabStopWidth: 8,
							theme: {},
							reflowCursorLine: !1,
							rescaleOverlappingGlyphs: !1,
							rightClickSelectsWord: r.isMac,
							windowOptions: {},
							windowsMode: !1,
							windowsPty: {},
							wordSeparator: " ()[]{}',\"`",
							altClickMovesCursor: !0,
							convertEol: !1,
							termName: "xterm",
							cancelEvents: !1,
							overviewRuler: {}
						};
						const o = [
							"normal",
							"bold",
							"100",
							"200",
							"300",
							"400",
							"500",
							"600",
							"700",
							"800",
							"900"
						];
						class a extends s.Disposable {
							constructor(e) {
								super(), this._onOptionChange = this._register(new n.Emitter()), this.onOptionChange = this._onOptionChange.event;
								const i = { ...t.DEFAULT_OPTIONS };
								for (const t in e) if (t in i) try {
									const s = e[t];
									i[t] = this._sanitizeAndValidateOption(t, s);
								} catch (e) {
									console.error(e);
								}
								this.rawOptions = i, this.options = { ...i }, this._setupOptions(), this._register((0, s.toDisposable)((() => {
									this.rawOptions.linkHandler = null, this.rawOptions.documentOverride = null;
								})));
							}
							onSpecificOptionChange(e, t) {
								return this.onOptionChange(((i) => {
									i === e && t(this.rawOptions[e]);
								}));
							}
							onMultipleOptionChange(e, t) {
								return this.onOptionChange(((i) => {
									-1 !== e.indexOf(i) && t();
								}));
							}
							_setupOptions() {
								const e = (e) => {
									if (!(e in t.DEFAULT_OPTIONS)) throw new Error(`No option with key "${e}"`);
									return this.rawOptions[e];
								}, i = (e, i) => {
									if (!(e in t.DEFAULT_OPTIONS)) throw new Error(`No option with key "${e}"`);
									i = this._sanitizeAndValidateOption(e, i), this.rawOptions[e] !== i && (this.rawOptions[e] = i, this._onOptionChange.fire(e));
								};
								for (const t in this.rawOptions) {
									const s = {
										get: e.bind(this, t),
										set: i.bind(this, t)
									};
									Object.defineProperty(this.options, t, s);
								}
							}
							_sanitizeAndValidateOption(e, i) {
								switch (e) {
									case "cursorStyle":
										if (i || (i = t.DEFAULT_OPTIONS[e]), !function(e) {
											return "block" === e || "underline" === e || "bar" === e;
										}(i)) throw new Error(`"${i}" is not a valid value for ${e}`);
										break;
									case "wordSeparator":
										i || (i = t.DEFAULT_OPTIONS[e]);
										break;
									case "fontWeight":
									case "fontWeightBold":
										if ("number" == typeof i && 1 <= i && i <= 1e3) break;
										i = o.includes(i) ? i : t.DEFAULT_OPTIONS[e];
										break;
									case "cursorWidth": i = Math.floor(i);
									case "lineHeight":
									case "tabStopWidth":
										if (i < 1) throw new Error(`${e} cannot be less than 1, value: ${i}`);
										break;
									case "minimumContrastRatio":
										i = Math.max(1, Math.min(21, Math.round(10 * i) / 10));
										break;
									case "scrollback":
										if ((i = Math.min(i, 4294967295)) < 0) throw new Error(`${e} cannot be less than 0, value: ${i}`);
										break;
									case "fastScrollSensitivity":
									case "scrollSensitivity":
										if (i <= 0) throw new Error(`${e} cannot be less than or equal to 0, value: ${i}`);
										break;
									case "rows":
									case "cols":
										if (!i && 0 !== i) throw new Error(`${e} must be numeric, value: ${i}`);
										break;
									case "windowsPty": i = i ?? {};
								}
								return i;
							}
						}
						t.OptionsService = a;
					},
					8811: function(e, t, i) {
						var s = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, r = this && this.__param || function(e, t) {
							return function(i, s) {
								t(i, s, e);
							};
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.OscLinkService = void 0;
						const n = i(6501);
						let o = class {
							constructor(e) {
								this._bufferService = e, this._nextId = 1, this._entriesWithId = /* @__PURE__ */ new Map(), this._dataByLinkId = /* @__PURE__ */ new Map();
							}
							registerLink(e) {
								const t = this._bufferService.buffer;
								if (void 0 === e.id) {
									const i = t.addMarker(t.ybase + t.y), s = {
										data: e,
										id: this._nextId++,
										lines: [i]
									};
									return i.onDispose((() => this._removeMarkerFromLink(s, i))), this._dataByLinkId.set(s.id, s), s.id;
								}
								const i = e, s = this._getEntryIdKey(i), r = this._entriesWithId.get(s);
								if (r) return this.addLineToLink(r.id, t.ybase + t.y), r.id;
								const n = t.addMarker(t.ybase + t.y), o = {
									id: this._nextId++,
									key: this._getEntryIdKey(i),
									data: i,
									lines: [n]
								};
								return n.onDispose((() => this._removeMarkerFromLink(o, n))), this._entriesWithId.set(o.key, o), this._dataByLinkId.set(o.id, o), o.id;
							}
							addLineToLink(e, t) {
								const i = this._dataByLinkId.get(e);
								if (i && i.lines.every(((e) => e.line !== t))) {
									const e = this._bufferService.buffer.addMarker(t);
									i.lines.push(e), e.onDispose((() => this._removeMarkerFromLink(i, e)));
								}
							}
							getLinkData(e) {
								return this._dataByLinkId.get(e)?.data;
							}
							_getEntryIdKey(e) {
								return `${e.id};;${e.uri}`;
							}
							_removeMarkerFromLink(e, t) {
								const i = e.lines.indexOf(t);
								-1 !== i && (e.lines.splice(i, 1), 0 === e.lines.length && (void 0 !== e.data.id && this._entriesWithId.delete(e.key), this._dataByLinkId.delete(e.id)));
							}
						};
						t.OscLinkService = o, t.OscLinkService = o = s([r(0, n.IBufferService)], o);
					},
					6201: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.serviceRegistry = void 0, t.getServiceDependencies = function(e) {
							return e[s] || [];
						}, t.createDecorator = function(e) {
							if (t.serviceRegistry.has(e)) return t.serviceRegistry.get(e);
							const r = function(e, t, n) {
								if (3 !== arguments.length) throw new Error("@IServiceName-decorator can only be used to decorate a parameter");
								(function(e, t, r) {
									t[i] === t ? t[s].push({
										id: e,
										index: r
									}) : (t[s] = [{
										id: e,
										index: r
									}], t[i] = t);
								})(r, e, n);
							};
							return r._id = e, t.serviceRegistry.set(e, r), r;
						};
						const i = "di$target", s = "di$dependencies";
						t.serviceRegistry = /* @__PURE__ */ new Map();
					},
					6501: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.IDecorationService = t.IUnicodeService = t.IOscLinkService = t.IOptionsService = t.ILogService = t.LogLevelEnum = t.IInstantiationService = t.ICharsetService = t.ICoreService = t.ICoreMouseService = t.IBufferService = void 0;
						const s = i(6201);
						var r;
						t.IBufferService = (0, s.createDecorator)("BufferService"), t.ICoreMouseService = (0, s.createDecorator)("CoreMouseService"), t.ICoreService = (0, s.createDecorator)("CoreService"), t.ICharsetService = (0, s.createDecorator)("CharsetService"), t.IInstantiationService = (0, s.createDecorator)("InstantiationService"), function(e) {
							e[e.TRACE = 0] = "TRACE", e[e.DEBUG = 1] = "DEBUG", e[e.INFO = 2] = "INFO", e[e.WARN = 3] = "WARN", e[e.ERROR = 4] = "ERROR", e[e.OFF = 5] = "OFF";
						}(r || (t.LogLevelEnum = r = {})), t.ILogService = (0, s.createDecorator)("LogService"), t.IOptionsService = (0, s.createDecorator)("OptionsService"), t.IOscLinkService = (0, s.createDecorator)("OscLinkService"), t.IUnicodeService = (0, s.createDecorator)("UnicodeService"), t.IDecorationService = (0, s.createDecorator)("DecorationService");
					},
					6415: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.UnicodeService = void 0;
						const s = i(7428), r = i(802);
						class n {
							static extractShouldJoin(e) {
								return !!(1 & e);
							}
							static extractWidth(e) {
								return e >> 1 & 3;
							}
							static extractCharKind(e) {
								return e >> 3;
							}
							static createPropertyValue(e, t, i = !1) {
								return (16777215 & e) << 3 | (3 & t) << 1 | (i ? 1 : 0);
							}
							constructor() {
								this._providers = Object.create(null), this._active = "", this._onChange = new r.Emitter(), this.onChange = this._onChange.event;
								const e = new s.UnicodeV6();
								this.register(e), this._active = e.version, this._activeProvider = e;
							}
							dispose() {
								this._onChange.dispose();
							}
							get versions() {
								return Object.keys(this._providers);
							}
							get activeVersion() {
								return this._active;
							}
							set activeVersion(e) {
								if (!this._providers[e]) throw new Error(`unknown Unicode version "${e}"`);
								this._active = e, this._activeProvider = this._providers[e], this._onChange.fire(e);
							}
							register(e) {
								this._providers[e.version] = e;
							}
							wcwidth(e) {
								return this._activeProvider.wcwidth(e);
							}
							getStringCellWidth(e) {
								let t = 0, i = 0;
								const s = e.length;
								for (let r = 0; r < s; ++r) {
									let o = e.charCodeAt(r);
									if (55296 <= o && o <= 56319) {
										if (++r >= s) return t + this.wcwidth(o);
										const i = e.charCodeAt(r);
										56320 <= i && i <= 57343 ? o = 1024 * (o - 55296) + i - 56320 + 65536 : t += this.wcwidth(i);
									}
									const a = this.charProperties(o, i);
									let l = n.extractWidth(a);
									n.extractShouldJoin(a) && (l -= n.extractWidth(i)), t += l, i = a;
								}
								return t;
							}
							charProperties(e, t) {
								return this._activeProvider.charProperties(e, t);
							}
						}
						t.UnicodeService = n;
					},
					4333: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.isAndroid = t.isElectron = t.isWebkitWebView = t.isSafari = t.isChrome = t.isWebKit = t.isFirefox = t.onDidChangeFullscreen = t.onDidChangeZoomLevel = void 0, t.addMatchMediaChangeListener = o, t.setZoomLevel = function(e, t) {
							n.INSTANCE.setZoomLevel(e, t);
						}, t.getZoomLevel = function(e) {
							return n.INSTANCE.getZoomLevel(e);
						}, t.getZoomFactor = function(e) {
							return n.INSTANCE.getZoomFactor(e);
						}, t.setZoomFactor = function(e, t) {
							n.INSTANCE.setZoomFactor(e, t);
						}, t.setFullscreen = function(e, t) {
							n.INSTANCE.setFullscreen(e, t);
						}, t.isFullscreen = function(e) {
							return n.INSTANCE.isFullscreen(e);
						}, t.isStandalone = function() {
							return l;
						}, t.isWCOEnabled = function() {
							return navigator?.windowControlsOverlay?.visible;
						}, t.getWCOBoundingRect = function() {
							return navigator?.windowControlsOverlay?.getTitlebarAreaRect();
						};
						const s = i(4693), r = i(802);
						class n {
							constructor() {
								this.mapWindowIdToZoomLevel = /* @__PURE__ */ new Map(), this._onDidChangeZoomLevel = new r.Emitter(), this.onDidChangeZoomLevel = this._onDidChangeZoomLevel.event, this.mapWindowIdToZoomFactor = /* @__PURE__ */ new Map(), this._onDidChangeFullscreen = new r.Emitter(), this.onDidChangeFullscreen = this._onDidChangeFullscreen.event, this.mapWindowIdToFullScreen = /* @__PURE__ */ new Map();
							}
							static {
								this.INSTANCE = new n();
							}
							getZoomLevel(e) {
								return this.mapWindowIdToZoomLevel.get(this.getWindowId(e)) ?? 0;
							}
							setZoomLevel(e, t) {
								if (this.getZoomLevel(t) === e) return;
								const i = this.getWindowId(t);
								this.mapWindowIdToZoomLevel.set(i, e), this._onDidChangeZoomLevel.fire(i);
							}
							getZoomFactor(e) {
								return this.mapWindowIdToZoomFactor.get(this.getWindowId(e)) ?? 1;
							}
							setZoomFactor(e, t) {
								this.mapWindowIdToZoomFactor.set(this.getWindowId(t), e);
							}
							setFullscreen(e, t) {
								if (this.isFullscreen(t) === e) return;
								const i = this.getWindowId(t);
								this.mapWindowIdToFullScreen.set(i, e), this._onDidChangeFullscreen.fire(i);
							}
							isFullscreen(e) {
								return !!this.mapWindowIdToFullScreen.get(this.getWindowId(e));
							}
							getWindowId(e) {
								return e.vscodeWindowId;
							}
						}
						function o(e, t, i) {
							"string" == typeof t && (t = e.matchMedia(t)), t.addEventListener("change", i);
						}
						t.onDidChangeZoomLevel = n.INSTANCE.onDidChangeZoomLevel, t.onDidChangeFullscreen = n.INSTANCE.onDidChangeFullscreen;
						const a = "object" == typeof navigator ? navigator.userAgent : "";
						t.isFirefox = a.indexOf("Firefox") >= 0, t.isWebKit = a.indexOf("AppleWebKit") >= 0, t.isChrome = a.indexOf("Chrome") >= 0, t.isSafari = !t.isChrome && a.indexOf("Safari") >= 0, t.isWebkitWebView = !t.isChrome && !t.isSafari && t.isWebKit, t.isElectron = a.indexOf("Electron/") >= 0, t.isAndroid = a.indexOf("Android") >= 0;
						let l = !1;
						if ("function" == typeof s.mainWindow.matchMedia) {
							const e = s.mainWindow.matchMedia("(display-mode: standalone) or (display-mode: window-controls-overlay)"), t = s.mainWindow.matchMedia("(display-mode: fullscreen)");
							l = e.matches, o(s.mainWindow, e, (({ matches: e }) => {
								l && t.matches || (l = e);
							}));
						}
					},
					7745: function(e, t, i) {
						var s = this && this.__createBinding || (Object.create ? function(e, t, i, s) {
							void 0 === s && (s = i);
							var r = Object.getOwnPropertyDescriptor(t, i);
							r && !("get" in r ? !t.__esModule : r.writable || r.configurable) || (r = {
								enumerable: !0,
								get: function() {
									return t[i];
								}
							}), Object.defineProperty(e, s, r);
						} : function(e, t, i, s) {
							void 0 === s && (s = i), e[s] = t[i];
						}), r = this && this.__setModuleDefault || (Object.create ? function(e, t) {
							Object.defineProperty(e, "default", {
								enumerable: !0,
								value: t
							});
						} : function(e, t) {
							e.default = t;
						}), n = this && this.__importStar || function(e) {
							if (e && e.__esModule) return e;
							var t = {};
							if (null != e) for (var i in e) "default" !== i && Object.prototype.hasOwnProperty.call(e, i) && s(t, e, i);
							return r(t, e), t;
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.BrowserFeatures = t.KeyboardSupport = void 0;
						const o = n(i(4333)), a = i(4693), l = n(i(8163));
						var h;
						(function(e) {
							e[e.Always = 0] = "Always", e[e.FullScreen = 1] = "FullScreen", e[e.None = 2] = "None";
						})(h || (t.KeyboardSupport = h = {}));
						const c = "object" == typeof navigator ? navigator : {};
						t.BrowserFeatures = {
							clipboard: {
								writeText: l.isNative || document.queryCommandSupported && document.queryCommandSupported("copy") || !!(c && c.clipboard && c.clipboard.writeText),
								readText: l.isNative || !!(c && c.clipboard && c.clipboard.readText)
							},
							keyboard: l.isNative || o.isStandalone() ? h.Always : c.keyboard || o.isSafari ? h.FullScreen : h.None,
							touch: "ontouchstart" in a.mainWindow || c.maxTouchPoints > 0,
							pointerEvents: a.mainWindow.PointerEvent && ("ontouchstart" in a.mainWindow || navigator.maxTouchPoints > 0)
						};
					},
					7093: function(e, t, i) {
						var s, r = this && this.__createBinding || (Object.create ? function(e, t, i, s) {
							void 0 === s && (s = i);
							var r = Object.getOwnPropertyDescriptor(t, i);
							r && !("get" in r ? !t.__esModule : r.writable || r.configurable) || (r = {
								enumerable: !0,
								get: function() {
									return t[i];
								}
							}), Object.defineProperty(e, s, r);
						} : function(e, t, i, s) {
							void 0 === s && (s = i), e[s] = t[i];
						}), n = this && this.__setModuleDefault || (Object.create ? function(e, t) {
							Object.defineProperty(e, "default", {
								enumerable: !0,
								value: t
							});
						} : function(e, t) {
							e.default = t;
						}), o = this && this.__importStar || function(e) {
							if (e && e.__esModule) return e;
							var t = {};
							if (null != e) for (var i in e) "default" !== i && Object.prototype.hasOwnProperty.call(e, i) && r(t, e, i);
							return n(t, e), t;
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.SafeTriangle = t.DragAndDropObserver = t.ModifierKeyEmitter = t.DetectedFullscreenMode = t.Namespace = t.EventHelper = t.EventType = t.sharedMutationObserver = t.Dimension = t.WindowIntervalTimer = t.scheduleAtNextAnimationFrame = t.runAtThisOrScheduleAtNextAnimationFrame = t.WindowIdleValue = t.addStandardDisposableGenericMouseUpListener = t.addStandardDisposableGenericMouseDownListener = t.addStandardDisposableListener = t.onDidUnregisterWindow = t.onWillUnregisterWindow = t.onDidRegisterWindow = t.hasWindow = t.getWindowById = t.getWindowId = t.getWindowsCount = t.getWindows = t.getDocument = t.getWindow = t.registerWindow = void 0, t.clearNode = function(e) {
							for (; e.firstChild;) e.firstChild.remove();
						}, t.clearNodeRecursively = function e(t) {
							for (; t.firstChild;) {
								const i = t.firstChild;
								i.remove(), e(i);
							}
						}, t.addDisposableListener = C, t.addDisposableGenericMouseDownListener = w, t.addDisposableGenericMouseMoveListener = function(e, i, s) {
							return C(e, g.isIOS && l.BrowserFeatures.pointerEvents ? t.EventType.POINTER_MOVE : t.EventType.MOUSE_MOVE, i, s);
						}, t.addDisposableGenericMouseUpListener = E, t.runWhenWindowIdle = function(e, t, i) {
							return (0, d._runWhenIdle)(e, t, i);
						}, t.disposableWindowInterval = function(e, t, i, s) {
							let r = 0;
							const n = e.setInterval((() => {
								r++, ("number" == typeof s && r >= s || !0 === t()) && o.dispose();
							}), i), o = (0, p.toDisposable)((() => {
								e.clearInterval(n);
							}));
							return o;
						}, t.measure = function(e, i) {
							return (0, t.scheduleAtNextAnimationFrame)(e, i, 1e4);
						}, t.modify = function(e, i) {
							return (0, t.scheduleAtNextAnimationFrame)(e, i, -1e4);
						}, t.addDisposableThrottledListener = function(e, t, i, s, r) {
							return new T(e, t, i, s, r);
						}, t.getComputedStyle = k, t.getClientArea = function e(i, s) {
							const r = (0, t.getWindow)(i), n = r.document;
							if (i !== n.body) return new O(i.clientWidth, i.clientHeight);
							if (g.isIOS && r?.visualViewport) return new O(r.visualViewport.width, r.visualViewport.height);
							if (r?.innerWidth && r.innerHeight) return new O(r.innerWidth, r.innerHeight);
							if (n.body && n.body.clientWidth && n.body.clientHeight) return new O(n.body.clientWidth, n.body.clientHeight);
							if (n.documentElement && n.documentElement.clientWidth && n.documentElement.clientHeight) return new O(n.documentElement.clientWidth, n.documentElement.clientHeight);
							if (s) return e(s);
							throw new Error("Unable to figure out browser width and height");
						}, t.getTopLeftOffset = I, t.size = function(e, t, i) {
							"number" == typeof t && (e.style.width = `${t}px`), "number" == typeof i && (e.style.height = `${i}px`);
						}, t.position = function(e, t, i, s, r, n = "absolute") {
							"number" == typeof t && (e.style.top = `${t}px`), "number" == typeof i && (e.style.right = `${i}px`), "number" == typeof s && (e.style.bottom = `${s}px`), "number" == typeof r && (e.style.left = `${r}px`), e.style.position = n;
						}, t.getDomNodePagePosition = function(e) {
							const i = e.getBoundingClientRect(), s = (0, t.getWindow)(e);
							return {
								left: i.left + s.scrollX,
								top: i.top + s.scrollY,
								width: i.width,
								height: i.height
							};
						}, t.getDomNodeZoomLevel = function(e) {
							let t = e, i = 1;
							do {
								const e = k(t).zoom;
								null != e && "1" !== e && (i *= e), t = t.parentElement;
							} while (null !== t && t !== t.ownerDocument.documentElement);
							return i;
						}, t.getTotalWidth = P, t.getContentWidth = function(e) {
							const t = M.getBorderLeftWidth(e) + M.getBorderRightWidth(e), i = M.getPaddingLeft(e) + M.getPaddingRight(e);
							return e.offsetWidth - t - i;
						}, t.getTotalScrollWidth = x, t.getContentHeight = function(e) {
							const t = M.getBorderTopWidth(e) + M.getBorderBottomWidth(e), i = M.getPaddingTop(e) + M.getPaddingBottom(e);
							return e.offsetHeight - t - i;
						}, t.getTotalHeight = function(e) {
							const t = M.getMarginTop(e) + M.getMarginBottom(e);
							return e.offsetHeight + t;
						}, t.getLargestChildWidth = function(e, t) {
							const i = t.map(((t) => Math.max(x(t), P(t)) + function(e, t) {
								if (null === e) return 0;
								const i = I(e), s = I(t);
								return i.left - s.left;
							}(t, e) || 0));
							return Math.max(...i);
						}, t.isAncestor = B, t.setParentFlowTo = function(e, t) {
							e.dataset[N] = t.id;
						}, t.isAncestorUsingFlowTo = function(e, t) {
							let i = e;
							for (; i;) {
								if (i === t) return !0;
								if (Q(i)) {
									const e = U(i);
									if (e) {
										i = e;
										continue;
									}
								}
								i = i.parentNode;
							}
							return !1;
						}, t.findParentWithClass = F, t.hasParentWithClass = function(e, t, i) {
							return !!F(e, t, i);
						}, t.isShadowRoot = W, t.isInShadowDOM = function(e) {
							return !!H(e);
						}, t.getShadowRoot = H, t.getActiveElement = K, t.isActiveElement = function(e) {
							return K() === e;
						}, t.isAncestorOfActiveElement = function(e) {
							return B(K(), e);
						}, t.isActiveDocument = function(e) {
							return e.ownerDocument === z();
						}, t.getActiveDocument = z, t.getActiveWindow = function() {
							return z().defaultView?.window ?? v.mainWindow;
						}, t.isGlobalStylesheet = function(e) {
							return j.has(e);
						}, t.createStyleSheet2 = function() {
							return new $();
						}, t.createStyleSheet = V, t.cloneGlobalStylesheets = function(e) {
							const t = new p.DisposableStore();
							for (const [i, s] of j) t.add(G(i, s, e));
							return t;
						}, t.createMetaElement = function(e = v.mainWindow.document.head) {
							return q("meta", e);
						}, t.createLinkElement = function(e = v.mainWindow.document.head) {
							return q("link", e);
						}, t.createCSSRule = function e(t, i, s = Y()) {
							if (s && i) {
								s.sheet?.insertRule(`${t} {${i}}`, 0);
								for (const r of j.get(s) ?? []) e(t, i, r);
							}
						}, t.removeCSSRulesContainingSelector = function e(t, i = Y()) {
							if (!i) return;
							const s = Z(i), r = [];
							for (let e = 0; e < s.length; e++) {
								const i = s[e];
								J(i) && -1 !== i.selectorText.indexOf(t) && r.push(e);
							}
							for (let e = r.length - 1; e >= 0; e--) i.sheet?.deleteRule(r[e]);
							for (const s of j.get(i) ?? []) e(t, s);
						}, t.isHTMLElement = Q, t.isHTMLAnchorElement = function(e) {
							return e instanceof HTMLAnchorElement || e instanceof (0, t.getWindow)(e).HTMLAnchorElement;
						}, t.isHTMLSpanElement = function(e) {
							return e instanceof HTMLSpanElement || e instanceof (0, t.getWindow)(e).HTMLSpanElement;
						}, t.isHTMLTextAreaElement = function(e) {
							return e instanceof HTMLTextAreaElement || e instanceof (0, t.getWindow)(e).HTMLTextAreaElement;
						}, t.isHTMLInputElement = function(e) {
							return e instanceof HTMLInputElement || e instanceof (0, t.getWindow)(e).HTMLInputElement;
						}, t.isHTMLButtonElement = function(e) {
							return e instanceof HTMLButtonElement || e instanceof (0, t.getWindow)(e).HTMLButtonElement;
						}, t.isHTMLDivElement = function(e) {
							return e instanceof HTMLDivElement || e instanceof (0, t.getWindow)(e).HTMLDivElement;
						}, t.isSVGElement = function(e) {
							return e instanceof SVGElement || e instanceof (0, t.getWindow)(e).SVGElement;
						}, t.isMouseEvent = function(e) {
							return e instanceof MouseEvent || e instanceof (0, t.getWindow)(e).MouseEvent;
						}, t.isKeyboardEvent = function(e) {
							return e instanceof KeyboardEvent || e instanceof (0, t.getWindow)(e).KeyboardEvent;
						}, t.isPointerEvent = function(e) {
							return e instanceof PointerEvent || e instanceof (0, t.getWindow)(e).PointerEvent;
						}, t.isDragEvent = function(e) {
							return e instanceof DragEvent || e instanceof (0, t.getWindow)(e).DragEvent;
						}, t.isEventLike = function(e) {
							const t = e;
							return !(!t || "function" != typeof t.preventDefault || "function" != typeof t.stopPropagation);
						}, t.saveParentsScrollTop = function(e) {
							const t = [];
							for (let i = 0; e && e.nodeType === e.ELEMENT_NODE; i++) t[i] = e.scrollTop, e = e.parentNode;
							return t;
						}, t.restoreParentsScrollTop = function(e, t) {
							for (let i = 0; e && e.nodeType === e.ELEMENT_NODE; i++) e.scrollTop !== t[i] && (e.scrollTop = t[i]), e = e.parentNode;
						}, t.trackFocus = function(e) {
							return new ee(e);
						}, t.after = function(e, t) {
							return e.after(t), t;
						}, t.append = te, t.prepend = function(e, t) {
							return e.insertBefore(t, e.firstChild), t;
						}, t.reset = function(e, ...t) {
							e.innerText = "", te(e, ...t);
						}, t.$ = ne, t.join = function(e, t) {
							const i = [];
							return e.forEach(((e, s) => {
								s > 0 && (t instanceof Node ? i.push(t.cloneNode()) : i.push(document.createTextNode(t))), i.push(e);
							})), i;
						}, t.setVisibility = function(e, ...t) {
							e ? oe(...t) : ae(...t);
						}, t.show = oe, t.hide = ae, t.removeTabIndexAndUpdateFocus = function(e) {
							if (e && e.hasAttribute("tabIndex")) {
								if (e.ownerDocument.activeElement === e) (function(e) {
									for (; e && e.nodeType === e.ELEMENT_NODE;) {
										if (Q(e) && e.hasAttribute("tabIndex")) return e;
										e = e.parentNode;
									}
									return null;
								})(e.parentElement)?.focus();
								e.removeAttribute("tabindex");
							}
						}, t.finalHandler = function(e) {
							return (t) => {
								t.preventDefault(), t.stopPropagation(), e(t);
							};
						}, t.domContentLoaded = function(e) {
							return new Promise(((t) => {
								if ("complete" === e.document.readyState || e.document && null !== e.document.body) t(void 0);
								else {
									const i = () => {
										e.window.removeEventListener("DOMContentLoaded", i, !1), t();
									};
									e.window.addEventListener("DOMContentLoaded", i, !1);
								}
							}));
						}, t.computeScreenAwareSize = function(e, t) {
							const i = e.devicePixelRatio * t;
							return Math.max(1, Math.floor(i)) / e.devicePixelRatio;
						}, t.windowOpenNoOpener = function(e) {
							v.mainWindow.open(e, "_blank", "noopener");
						}, t.windowOpenPopup = function(e) {
							const t = Math.floor(v.mainWindow.screenLeft + v.mainWindow.innerWidth / 2 - le / 2), i = Math.floor(v.mainWindow.screenTop + v.mainWindow.innerHeight / 2 - he / 2);
							v.mainWindow.open(e, "_blank", `width=${le},height=${he},top=${i},left=${t}`);
						}, t.windowOpenWithSuccess = function(e, t = !0) {
							const i = v.mainWindow.open();
							return !!i && (t && (i.opener = null), i.location.href = e, !0);
						}, t.animate = function(e, i) {
							const s = () => {
								i(), r = (0, t.scheduleAtNextAnimationFrame)(e, s);
							};
							let r = (0, t.scheduleAtNextAnimationFrame)(e, s);
							return (0, p.toDisposable)((() => r.dispose()));
						}, t.asCSSPropertyValue = function(e) {
							return `'${e.replace(/'/g, "%27")}'`;
						}, t.asCssValueWithDefault = function e(t, i) {
							if (void 0 !== t) {
								const s = t.match(/^\s*var\((.+)\)$/);
								if (s) {
									const t = s[1].split(",", 2);
									return 2 === t.length && (i = e(t[1].trim(), i)), `var(${t[0]}, ${i})`;
								}
								return t;
							}
							return i;
						}, t.detectFullscreen = function(e) {
							return e.document.fullscreenElement || e.document.webkitFullscreenElement || e.document.webkitIsFullScreen ? {
								mode: ce.DOCUMENT,
								guess: !1
							} : e.innerHeight === e.screen.height ? {
								mode: ce.BROWSER,
								guess: !1
							} : (g.isMacintosh || g.isLinux) && e.outerHeight === e.screen.height && e.outerWidth === e.screen.width ? {
								mode: ce.BROWSER,
								guess: !0
							} : null;
						}, t.multibyteAwareBtoa = function(e) {
							return btoa(function(e) {
								const t = new Uint16Array(e.length);
								for (let i = 0; i < t.length; i++) t[i] = e.charCodeAt(i);
								let i = "";
								const s = new Uint8Array(t.buffer);
								for (let e = 0; e < s.length; e++) i += String.fromCharCode(s[e]);
								return i;
							}(e));
						}, t.getCookieValue = function(e) {
							const t = document.cookie.match("(^|[^;]+)\\s*" + e + "\\s*=\\s*([^;]+)");
							return t ? t.pop() : void 0;
						}, t.h = function(e, ...t) {
							let i, s;
							Array.isArray(t[0]) ? (i = {}, s = t[0]) : (i = t[0] || {}, s = t[1]);
							const r = _e.exec(e);
							if (!r || !r.groups) throw new Error("Bad use of h");
							const n = r.groups.tag || "div", o = document.createElement(n);
							r.groups.id && (o.id = r.groups.id);
							const a = [];
							if (r.groups.class) for (const e of r.groups.class.split(".")) "" !== e && a.push(e);
							if (void 0 !== i.className) for (const e of i.className.split(".")) "" !== e && a.push(e);
							a.length > 0 && (o.className = a.join(" "));
							const l = {};
							if (r.groups.name && (l[r.groups.name] = o), s) for (const e of s) Q(e) ? o.appendChild(e) : "string" == typeof e ? o.append(e) : "root" in e && (Object.assign(l, e), o.appendChild(e.root));
							for (const [e, t] of Object.entries(i)) if ("className" !== e) if ("style" === e) for (const [e, i] of Object.entries(t)) o.style.setProperty(fe(e), "number" == typeof i ? i + "px" : "" + i);
							else "tabIndex" === e ? o.tabIndex = t : o.setAttribute(fe(e), t.toString());
							return l.root = o, l;
						}, t.svgElem = function(e, ...t) {
							let i, s;
							Array.isArray(t[0]) ? (i = {}, s = t[0]) : (i = t[0] || {}, s = t[1]);
							const r = _e.exec(e);
							if (!r || !r.groups) throw new Error("Bad use of h");
							const n = r.groups.tag || "div", o = document.createElementNS("http://www.w3.org/2000/svg", n);
							r.groups.id && (o.id = r.groups.id);
							const a = [];
							if (r.groups.class) for (const e of r.groups.class.split(".")) "" !== e && a.push(e);
							if (void 0 !== i.className) for (const e of i.className.split(".")) "" !== e && a.push(e);
							a.length > 0 && (o.className = a.join(" "));
							const l = {};
							if (r.groups.name && (l[r.groups.name] = o), s) for (const e of s) Q(e) ? o.appendChild(e) : "string" == typeof e ? o.append(e) : "root" in e && (Object.assign(l, e), o.appendChild(e.root));
							for (const [e, t] of Object.entries(i)) if ("className" !== e) if ("style" === e) for (const [e, i] of Object.entries(t)) o.style.setProperty(fe(e), "number" == typeof i ? i + "px" : "" + i);
							else "tabIndex" === e ? o.tabIndex = t : o.setAttribute(fe(e), t.toString());
							return l.root = o, l;
						}, t.copyAttributes = pe, t.trackAttributes = function(e, i, s) {
							pe(e, i, s);
							const r = new p.DisposableStore();
							return r.add(t.sharedMutationObserver.observe(e, r, {
								attributes: !0,
								attributeFilter: s
							})(((t) => {
								for (const s of t) "attributes" === s.type && s.attributeName && ge(e, i, s.attributeName);
							}))), r;
						};
						const a = o(i(4333)), l = i(7745), h = i(5394), c = i(5964), d = i(1758), u = i(9807), _ = o(i(802)), f = i(7883), p = i(7150), g = o(i(8163)), m = i(6304), v = i(4693), S = i(7704);
						s = function() {
							const e = /* @__PURE__ */ new Map();
							(0, v.ensureCodeWindow)(v.mainWindow, 1);
							const i = {
								window: v.mainWindow,
								disposables: new p.DisposableStore()
							};
							e.set(v.mainWindow.vscodeWindowId, i);
							const s = new _.Emitter(), r = new _.Emitter(), n = new _.Emitter();
							return {
								onDidRegisterWindow: s.event,
								onWillUnregisterWindow: n.event,
								onDidUnregisterWindow: r.event,
								registerWindow(i) {
									if (e.has(i.vscodeWindowId)) return p.Disposable.None;
									const o = new p.DisposableStore(), a = {
										window: i,
										disposables: o.add(new p.DisposableStore())
									};
									return e.set(i.vscodeWindowId, a), o.add((0, p.toDisposable)((() => {
										e.delete(i.vscodeWindowId), r.fire(i);
									}))), o.add(C(i, t.EventType.BEFORE_UNLOAD, (() => {
										n.fire(i);
									}))), s.fire(a), o;
								},
								getWindows: () => e.values(),
								getWindowsCount: () => e.size,
								getWindowId: (e) => e.vscodeWindowId,
								hasWindow: (t) => e.has(t),
								getWindowById: function(t, s) {
									return ("number" == typeof t ? e.get(t) : void 0) ?? (s ? i : void 0);
								},
								getWindow(e) {
									const t = e;
									if (t?.ownerDocument?.defaultView) return t.ownerDocument.defaultView.window;
									const i = e;
									return i?.view ? i.view.window : v.mainWindow;
								},
								getDocument(e) {
									const i = e;
									return (0, t.getWindow)(i).document;
								}
							};
						}(), t.registerWindow = s.registerWindow, t.getWindow = s.getWindow, t.getDocument = s.getDocument, t.getWindows = s.getWindows, t.getWindowsCount = s.getWindowsCount, t.getWindowId = s.getWindowId, t.getWindowById = s.getWindowById, t.hasWindow = s.hasWindow, t.onDidRegisterWindow = s.onDidRegisterWindow, t.onWillUnregisterWindow = s.onWillUnregisterWindow, t.onDidUnregisterWindow = s.onDidUnregisterWindow;
						class b {
							constructor(e, t, i, s) {
								this._node = e, this._type = t, this._handler = i, this._options = s || !1, this._node.addEventListener(this._type, this._handler, this._options);
							}
							dispose() {
								this._handler && (this._node.removeEventListener(this._type, this._handler, this._options), this._node = null, this._handler = null);
							}
						}
						function C(e, t, i, s) {
							return new b(e, t, i, s);
						}
						function y(e, t) {
							return function(i) {
								return t(new c.StandardMouseEvent(e, i));
							};
						}
						function w(e, i, s) {
							return C(e, g.isIOS && l.BrowserFeatures.pointerEvents ? t.EventType.POINTER_DOWN : t.EventType.MOUSE_DOWN, i, s);
						}
						function E(e, i, s) {
							return C(e, g.isIOS && l.BrowserFeatures.pointerEvents ? t.EventType.POINTER_UP : t.EventType.MOUSE_UP, i, s);
						}
						t.addStandardDisposableListener = function(e, i, s, r) {
							let n = s;
							return "click" === i || "mousedown" === i || "contextmenu" === i ? n = y((0, t.getWindow)(e), s) : "keydown" !== i && "keypress" !== i && "keyup" !== i || (n = function(e) {
								return function(t) {
									return e(new h.StandardKeyboardEvent(t));
								};
							}(s)), C(e, i, n, r);
						}, t.addStandardDisposableGenericMouseDownListener = function(e, i, s) {
							return w(e, y((0, t.getWindow)(e), i), s);
						}, t.addStandardDisposableGenericMouseUpListener = function(e, i, s) {
							return E(e, y((0, t.getWindow)(e), i), s);
						};
						class D extends d.AbstractIdleValue {
							constructor(e, t) {
								super(e, t);
							}
						}
						t.WindowIdleValue = D;
						class L extends d.IntervalTimer {
							constructor(e) {
								super(), this.defaultTarget = e && (0, t.getWindow)(e);
							}
							cancelAndSet(e, t, i) {
								return super.cancelAndSet(e, t, i ?? this.defaultTarget);
							}
						}
						t.WindowIntervalTimer = L;
						class R {
							constructor(e, t = 0) {
								this._runner = e, this.priority = t, this._canceled = !1;
							}
							dispose() {
								this._canceled = !0;
							}
							execute() {
								if (!this._canceled) try {
									this._runner();
								} catch (e) {
									(0, u.onUnexpectedError)(e);
								}
							}
							static sort(e, t) {
								return t.priority - e.priority;
							}
						}
						(function() {
							const e = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
							t.scheduleAtNextAnimationFrame = (n, o, a = 0) => {
								const l = (0, t.getWindowId)(n), h = new R(o, a);
								let c = e.get(l);
								return c || (c = [], e.set(l, c)), c.push(h), s.get(l) || (s.set(l, !0), n.requestAnimationFrame((() => ((t) => {
									s.set(t, !1);
									const n = e.get(t) ?? [];
									for (i.set(t, n), e.set(t, []), r.set(t, !0); n.length > 0;) n.sort(R.sort), n.shift().execute();
									r.set(t, !1);
								})(l)))), h;
							}, t.runAtThisOrScheduleAtNextAnimationFrame = (e, s, n) => {
								const o = (0, t.getWindowId)(e);
								if (r.get(o)) {
									const e = new R(s, n);
									let t = i.get(o);
									return t || (t = [], i.set(o, t)), t.push(e), e;
								}
								return (0, t.scheduleAtNextAnimationFrame)(e, s, n);
							};
						})();
						const A = function(e, t) {
							return t;
						};
						class T extends p.Disposable {
							constructor(e, t, i, s = A, r = 8) {
								super();
								let n = null, o = 0;
								const a = this._register(new d.TimeoutTimer()), l = () => {
									o = (/* @__PURE__ */ new Date()).getTime(), i(n), n = null;
								};
								this._register(C(e, t, ((e) => {
									n = s(n, e);
									const t = (/* @__PURE__ */ new Date()).getTime() - o;
									t >= r ? (a.cancel(), l()) : a.setIfNotSet(l, r - t);
								})));
							}
						}
						function k(e) {
							return (0, t.getWindow)(e).getComputedStyle(e, null);
						}
						class M {
							static convertToPixels(e, t) {
								return parseFloat(t) || 0;
							}
							static getDimension(e, t, i) {
								const s = k(e), r = s ? s.getPropertyValue(t) : "0";
								return M.convertToPixels(e, r);
							}
							static getBorderLeftWidth(e) {
								return M.getDimension(e, "border-left-width", "borderLeftWidth");
							}
							static getBorderRightWidth(e) {
								return M.getDimension(e, "border-right-width", "borderRightWidth");
							}
							static getBorderTopWidth(e) {
								return M.getDimension(e, "border-top-width", "borderTopWidth");
							}
							static getBorderBottomWidth(e) {
								return M.getDimension(e, "border-bottom-width", "borderBottomWidth");
							}
							static getPaddingLeft(e) {
								return M.getDimension(e, "padding-left", "paddingLeft");
							}
							static getPaddingRight(e) {
								return M.getDimension(e, "padding-right", "paddingRight");
							}
							static getPaddingTop(e) {
								return M.getDimension(e, "padding-top", "paddingTop");
							}
							static getPaddingBottom(e) {
								return M.getDimension(e, "padding-bottom", "paddingBottom");
							}
							static getMarginLeft(e) {
								return M.getDimension(e, "margin-left", "marginLeft");
							}
							static getMarginTop(e) {
								return M.getDimension(e, "margin-top", "marginTop");
							}
							static getMarginRight(e) {
								return M.getDimension(e, "margin-right", "marginRight");
							}
							static getMarginBottom(e) {
								return M.getDimension(e, "margin-bottom", "marginBottom");
							}
						}
						class O {
							static {
								this.None = new O(0, 0);
							}
							constructor(e, t) {
								this.width = e, this.height = t;
							}
							with(e = this.width, t = this.height) {
								return e !== this.width || t !== this.height ? new O(e, t) : this;
							}
							static is(e) {
								return "object" == typeof e && "number" == typeof e.height && "number" == typeof e.width;
							}
							static lift(e) {
								return e instanceof O ? e : new O(e.width, e.height);
							}
							static equals(e, t) {
								return e === t || !(!e || !t) && e.width === t.width && e.height === t.height;
							}
						}
						function I(e) {
							let t = e.offsetParent, i = e.offsetTop, s = e.offsetLeft;
							for (; null !== (e = e.parentNode) && e !== e.ownerDocument.body && e !== e.ownerDocument.documentElement;) {
								i -= e.scrollTop;
								const r = W(e) ? null : k(e);
								r && (s -= "rtl" !== r.direction ? e.scrollLeft : -e.scrollLeft), e === t && (s += M.getBorderLeftWidth(e), i += M.getBorderTopWidth(e), i += e.offsetTop, s += e.offsetLeft, t = e.offsetParent);
							}
							return {
								left: s,
								top: i
							};
						}
						function P(e) {
							const t = M.getMarginLeft(e) + M.getMarginRight(e);
							return e.offsetWidth + t;
						}
						function x(e) {
							const t = M.getMarginLeft(e) + M.getMarginRight(e);
							return e.scrollWidth + t;
						}
						function B(e, t) {
							return Boolean(t?.contains(e));
						}
						t.Dimension = O;
						const N = "parentFlowToElementId";
						function U(e) {
							const t = e.dataset[N];
							return "string" == typeof t ? e.ownerDocument.getElementById(t) : null;
						}
						function F(e, t, i) {
							for (; e && e.nodeType === e.ELEMENT_NODE;) {
								if (e.classList.contains(t)) return e;
								if (i) {
									if ("string" == typeof i) {
										if (e.classList.contains(i)) return null;
									} else if (e === i) return null;
								}
								e = e.parentNode;
							}
							return null;
						}
						function W(e) {
							return e && !!e.host && !!e.mode;
						}
						function H(e) {
							for (; e.parentNode;) {
								if (e === e.ownerDocument?.body) return null;
								e = e.parentNode;
							}
							return W(e) ? e : null;
						}
						function K() {
							let e = z().activeElement;
							for (; e?.shadowRoot;) e = e.shadowRoot.activeElement;
							return e;
						}
						function z() {
							return (0, t.getWindowsCount)() <= 1 ? v.mainWindow.document : Array.from((0, t.getWindows)()).map((({ window: e }) => e.document)).find(((e) => e.hasFocus())) ?? v.mainWindow.document;
						}
						const j = /* @__PURE__ */ new Map();
						class $ {
							constructor() {
								this._currentCssStyle = "", this._styleSheet = void 0;
							}
							setStyle(e) {
								e !== this._currentCssStyle && (this._currentCssStyle = e, this._styleSheet ? this._styleSheet.innerText = e : this._styleSheet = V(v.mainWindow.document.head, ((t) => t.innerText = e)));
							}
							dispose() {
								this._styleSheet && (this._styleSheet.remove(), this._styleSheet = void 0);
							}
						}
						function V(e = v.mainWindow.document.head, i, s) {
							const r = document.createElement("style");
							if (r.type = "text/css", r.media = "screen", i?.(r), e.appendChild(r), s && s.add((0, p.toDisposable)((() => r.remove()))), e === v.mainWindow.document.head) {
								const e = /* @__PURE__ */ new Set();
								j.set(r, e);
								for (const { window: i, disposables: n } of (0, t.getWindows)()) {
									if (i === v.mainWindow) continue;
									const t = n.add(G(r, e, i));
									s?.add(t);
								}
							}
							return r;
						}
						function G(e, i, s) {
							const r = new p.DisposableStore(), n = e.cloneNode(!0);
							s.document.head.appendChild(n), r.add((0, p.toDisposable)((() => n.remove())));
							for (const t of Z(e)) n.sheet?.insertRule(t.cssText, n.sheet?.cssRules.length);
							return r.add(t.sharedMutationObserver.observe(e, r, { childList: !0 })((() => {
								n.textContent = e.textContent;
							}))), i.add(n), r.add((0, p.toDisposable)((() => i.delete(n)))), r;
						}
						function q(e, t = v.mainWindow.document.head) {
							const i = document.createElement(e);
							return t.appendChild(i), i;
						}
						t.sharedMutationObserver = new class {
							constructor() {
								this.mutationObservers = /* @__PURE__ */ new Map();
							}
							observe(e, t, i) {
								let s = this.mutationObservers.get(e);
								s || (s = /* @__PURE__ */ new Map(), this.mutationObservers.set(e, s));
								const r = (0, m.hash)(i);
								let n = s.get(r);
								if (n) n.users += 1;
								else {
									const o = new _.Emitter(), a = new MutationObserver(((e) => o.fire(e)));
									a.observe(e, i);
									const l = n = {
										users: 1,
										observer: a,
										onDidMutate: o.event
									};
									t.add((0, p.toDisposable)((() => {
										l.users -= 1, 0 === l.users && (o.dispose(), a.disconnect(), s?.delete(r), 0 === s?.size && this.mutationObservers.delete(e));
									}))), s.set(r, n);
								}
								return n.onDidMutate;
							}
						}();
						let X = null;
						function Y() {
							return X || (X = V()), X;
						}
						function Z(e) {
							return e?.sheet?.rules ? e.sheet.rules : e?.sheet?.cssRules ? e.sheet.cssRules : [];
						}
						function J(e) {
							return "string" == typeof e.selectorText;
						}
						function Q(e) {
							return e instanceof HTMLElement || e instanceof (0, t.getWindow)(e).HTMLElement;
						}
						t.EventType = {
							CLICK: "click",
							AUXCLICK: "auxclick",
							DBLCLICK: "dblclick",
							MOUSE_UP: "mouseup",
							MOUSE_DOWN: "mousedown",
							MOUSE_OVER: "mouseover",
							MOUSE_MOVE: "mousemove",
							MOUSE_OUT: "mouseout",
							MOUSE_ENTER: "mouseenter",
							MOUSE_LEAVE: "mouseleave",
							MOUSE_WHEEL: "wheel",
							POINTER_UP: "pointerup",
							POINTER_DOWN: "pointerdown",
							POINTER_MOVE: "pointermove",
							POINTER_LEAVE: "pointerleave",
							CONTEXT_MENU: "contextmenu",
							WHEEL: "wheel",
							KEY_DOWN: "keydown",
							KEY_PRESS: "keypress",
							KEY_UP: "keyup",
							LOAD: "load",
							BEFORE_UNLOAD: "beforeunload",
							UNLOAD: "unload",
							PAGE_SHOW: "pageshow",
							PAGE_HIDE: "pagehide",
							PASTE: "paste",
							ABORT: "abort",
							ERROR: "error",
							RESIZE: "resize",
							SCROLL: "scroll",
							FULLSCREEN_CHANGE: "fullscreenchange",
							WK_FULLSCREEN_CHANGE: "webkitfullscreenchange",
							SELECT: "select",
							CHANGE: "change",
							SUBMIT: "submit",
							RESET: "reset",
							FOCUS: "focus",
							FOCUS_IN: "focusin",
							FOCUS_OUT: "focusout",
							BLUR: "blur",
							INPUT: "input",
							STORAGE: "storage",
							DRAG_START: "dragstart",
							DRAG: "drag",
							DRAG_ENTER: "dragenter",
							DRAG_LEAVE: "dragleave",
							DRAG_OVER: "dragover",
							DROP: "drop",
							DRAG_END: "dragend",
							ANIMATION_START: a.isWebKit ? "webkitAnimationStart" : "animationstart",
							ANIMATION_END: a.isWebKit ? "webkitAnimationEnd" : "animationend",
							ANIMATION_ITERATION: a.isWebKit ? "webkitAnimationIteration" : "animationiteration"
						}, t.EventHelper = { stop: (e, t) => (e.preventDefault(), t && e.stopPropagation(), e) };
						class ee extends p.Disposable {
							static hasFocusWithin(e) {
								if (Q(e)) {
									const t = H(e);
									return B(t ? t.activeElement : e.ownerDocument.activeElement, e);
								}
								{
									const t = e;
									return B(t.document.activeElement, t.document);
								}
							}
							constructor(e) {
								super(), this._onDidFocus = this._register(new _.Emitter()), this.onDidFocus = this._onDidFocus.event, this._onDidBlur = this._register(new _.Emitter()), this.onDidBlur = this._onDidBlur.event;
								let i = ee.hasFocusWithin(e), s = !1;
								const r = () => {
									s = !1, i || (i = !0, this._onDidFocus.fire());
								}, n = () => {
									i && (s = !0, (Q(e) ? (0, t.getWindow)(e) : e).setTimeout((() => {
										s && (s = !1, i = !1, this._onDidBlur.fire());
									}), 0));
								};
								this._refreshStateHandler = () => {
									ee.hasFocusWithin(e) !== i && (i ? n() : r());
								}, this._register(C(e, t.EventType.FOCUS, r, !0)), this._register(C(e, t.EventType.BLUR, n, !0)), Q(e) && (this._register(C(e, t.EventType.FOCUS_IN, (() => this._refreshStateHandler()))), this._register(C(e, t.EventType.FOCUS_OUT, (() => this._refreshStateHandler()))));
							}
							refreshState() {
								this._refreshStateHandler();
							}
						}
						function te(e, ...t) {
							if (e.append(...t), 1 === t.length && "string" != typeof t[0]) return t[0];
						}
						const ie = /([\w\-]+)?(#([\w\-]+))?((\.([\w\-]+))*)/;
						var se;
						function re(e, t, i, ...s) {
							const r = ie.exec(t);
							if (!r) throw new Error("Bad use of emmet");
							const n = r[1] || "div";
							let o;
							return o = e !== se.HTML ? document.createElementNS(e, n) : document.createElement(n), r[3] && (o.id = r[3]), r[4] && (o.className = r[4].replace(/\./g, " ").trim()), i && Object.entries(i).forEach((([e, t]) => {
								void 0 !== t && (/^on\w+$/.test(e) ? o[e] = t : "selected" === e ? t && o.setAttribute(e, "true") : o.setAttribute(e, t));
							})), o.append(...s), o;
						}
						function ne(e, t, ...i) {
							return re(se.HTML, e, t, ...i);
						}
						function oe(...e) {
							for (const t of e) t.style.display = "", t.removeAttribute("aria-hidden");
						}
						function ae(...e) {
							for (const t of e) t.style.display = "none", t.setAttribute("aria-hidden", "true");
						}
						(function(e) {
							e.HTML = "http://www.w3.org/1999/xhtml", e.SVG = "http://www.w3.org/2000/svg";
						})(se || (t.Namespace = se = {})), ne.SVG = function(e, t, ...i) {
							return re(se.SVG, e, t, ...i);
						};
						const le = 780, he = 640;
						var ce;
						(function(e) {
							e[e.DOCUMENT = 1] = "DOCUMENT", e[e.BROWSER = 2] = "BROWSER";
						})(ce || (t.DetectedFullscreenMode = ce = {}));
						class de extends _.Emitter {
							constructor() {
								super(), this._subscriptions = new p.DisposableStore(), this._keyStatus = {
									altKey: !1,
									shiftKey: !1,
									ctrlKey: !1,
									metaKey: !1
								}, this._subscriptions.add(_.Event.runAndSubscribe(t.onDidRegisterWindow, (({ window: e, disposables: t }) => this.registerListeners(e, t)), {
									window: v.mainWindow,
									disposables: this._subscriptions
								}));
							}
							registerListeners(e, t) {
								t.add(C(e, "keydown", ((e) => {
									if (e.defaultPrevented) return;
									const t = new h.StandardKeyboardEvent(e);
									if (t.keyCode !== f.KeyCode.Alt || !e.repeat) {
										if (e.altKey && !this._keyStatus.altKey) this._keyStatus.lastKeyPressed = "alt";
										else if (e.ctrlKey && !this._keyStatus.ctrlKey) this._keyStatus.lastKeyPressed = "ctrl";
										else if (e.metaKey && !this._keyStatus.metaKey) this._keyStatus.lastKeyPressed = "meta";
										else if (e.shiftKey && !this._keyStatus.shiftKey) this._keyStatus.lastKeyPressed = "shift";
										else {
											if (t.keyCode === f.KeyCode.Alt) return;
											this._keyStatus.lastKeyPressed = void 0;
										}
										this._keyStatus.altKey = e.altKey, this._keyStatus.ctrlKey = e.ctrlKey, this._keyStatus.metaKey = e.metaKey, this._keyStatus.shiftKey = e.shiftKey, this._keyStatus.lastKeyPressed && (this._keyStatus.event = e, this.fire(this._keyStatus));
									}
								}), !0)), t.add(C(e, "keyup", ((e) => {
									e.defaultPrevented || (!e.altKey && this._keyStatus.altKey ? this._keyStatus.lastKeyReleased = "alt" : !e.ctrlKey && this._keyStatus.ctrlKey ? this._keyStatus.lastKeyReleased = "ctrl" : !e.metaKey && this._keyStatus.metaKey ? this._keyStatus.lastKeyReleased = "meta" : !e.shiftKey && this._keyStatus.shiftKey ? this._keyStatus.lastKeyReleased = "shift" : this._keyStatus.lastKeyReleased = void 0, this._keyStatus.lastKeyPressed !== this._keyStatus.lastKeyReleased && (this._keyStatus.lastKeyPressed = void 0), this._keyStatus.altKey = e.altKey, this._keyStatus.ctrlKey = e.ctrlKey, this._keyStatus.metaKey = e.metaKey, this._keyStatus.shiftKey = e.shiftKey, this._keyStatus.lastKeyReleased && (this._keyStatus.event = e, this.fire(this._keyStatus)));
								}), !0)), t.add(C(e.document.body, "mousedown", (() => {
									this._keyStatus.lastKeyPressed = void 0;
								}), !0)), t.add(C(e.document.body, "mouseup", (() => {
									this._keyStatus.lastKeyPressed = void 0;
								}), !0)), t.add(C(e.document.body, "mousemove", ((e) => {
									e.buttons && (this._keyStatus.lastKeyPressed = void 0);
								}), !0)), t.add(C(e, "blur", (() => {
									this.resetKeyStatus();
								})));
							}
							get keyStatus() {
								return this._keyStatus;
							}
							get isModifierPressed() {
								return this._keyStatus.altKey || this._keyStatus.ctrlKey || this._keyStatus.metaKey || this._keyStatus.shiftKey;
							}
							resetKeyStatus() {
								this.doResetKeyStatus(), this.fire(this._keyStatus);
							}
							doResetKeyStatus() {
								this._keyStatus = {
									altKey: !1,
									shiftKey: !1,
									ctrlKey: !1,
									metaKey: !1
								};
							}
							static getInstance() {
								return de.instance || (de.instance = new de()), de.instance;
							}
							dispose() {
								super.dispose(), this._subscriptions.dispose();
							}
						}
						t.ModifierKeyEmitter = de;
						class ue extends p.Disposable {
							constructor(e, t) {
								super(), this.element = e, this.callbacks = t, this.counter = 0, this.dragStartTime = 0, this.registerListeners();
							}
							registerListeners() {
								this.callbacks.onDragStart && this._register(C(this.element, t.EventType.DRAG_START, ((e) => {
									this.callbacks.onDragStart?.(e);
								}))), this.callbacks.onDrag && this._register(C(this.element, t.EventType.DRAG, ((e) => {
									this.callbacks.onDrag?.(e);
								}))), this._register(C(this.element, t.EventType.DRAG_ENTER, ((e) => {
									this.counter++, this.dragStartTime = e.timeStamp, this.callbacks.onDragEnter?.(e);
								}))), this._register(C(this.element, t.EventType.DRAG_OVER, ((e) => {
									e.preventDefault(), this.callbacks.onDragOver?.(e, e.timeStamp - this.dragStartTime);
								}))), this._register(C(this.element, t.EventType.DRAG_LEAVE, ((e) => {
									this.counter--, 0 === this.counter && (this.dragStartTime = 0, this.callbacks.onDragLeave?.(e));
								}))), this._register(C(this.element, t.EventType.DRAG_END, ((e) => {
									this.counter = 0, this.dragStartTime = 0, this.callbacks.onDragEnd?.(e);
								}))), this._register(C(this.element, t.EventType.DROP, ((e) => {
									this.counter = 0, this.dragStartTime = 0, this.callbacks.onDrop?.(e);
								})));
							}
						}
						t.DragAndDropObserver = ue;
						const _e = /(?<tag>[\w\-]+)?(?:#(?<id>[\w\-]+))?(?<class>(?:\.(?:[\w\-]+))*)(?:@(?<name>(?:[\w\_])+))?/;
						function fe(e) {
							return e.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
						}
						function pe(e, t, i) {
							for (const { name: s, value: r } of e.attributes) i && !i.includes(s) || t.setAttribute(s, r);
						}
						function ge(e, t, i) {
							const s = e.getAttribute(i);
							s ? t.setAttribute(i, s) : t.removeAttribute(i);
						}
						t.SafeTriangle = class {
							constructor(e, t, i) {
								this.originX = e, this.originY = t, this.triangles = [];
								const { top: s, left: r, right: n, bottom: o } = i.getBoundingClientRect(), a = this.triangles;
								let l = 0;
								a[l++] = r, a[l++] = s, a[l++] = n, a[l++] = s, a[l++] = r, a[l++] = s, a[l++] = r, a[l++] = o, a[l++] = n, a[l++] = s, a[l++] = n, a[l++] = o, a[l++] = r, a[l++] = o, a[l++] = n, a[l++] = o;
							}
							contains(e, t) {
								const { triangles: i, originX: s, originY: r } = this;
								for (let n = 0; n < 4; n++) if ((0, S.isPointWithinTriangle)(e, t, s, r, i[2 * n], i[2 * n + 1], i[2 * n + 2], i[2 * n + 3])) return !0;
								return !1;
							}
						};
					},
					9675: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.FastDomNode = void 0, t.createFastDomNode = function(e) {
							return new i(e);
						};
						class i {
							constructor(e) {
								this.domNode = e, this._maxWidth = "", this._width = "", this._height = "", this._top = "", this._left = "", this._bottom = "", this._right = "", this._paddingTop = "", this._paddingLeft = "", this._paddingBottom = "", this._paddingRight = "", this._fontFamily = "", this._fontWeight = "", this._fontSize = "", this._fontStyle = "", this._fontFeatureSettings = "", this._fontVariationSettings = "", this._textDecoration = "", this._lineHeight = "", this._letterSpacing = "", this._className = "", this._display = "", this._position = "", this._visibility = "", this._color = "", this._backgroundColor = "", this._layerHint = !1, this._contain = "none", this._boxShadow = "";
							}
							setMaxWidth(e) {
								const t = s(e);
								this._maxWidth !== t && (this._maxWidth = t, this.domNode.style.maxWidth = this._maxWidth);
							}
							setWidth(e) {
								const t = s(e);
								this._width !== t && (this._width = t, this.domNode.style.width = this._width);
							}
							setHeight(e) {
								const t = s(e);
								this._height !== t && (this._height = t, this.domNode.style.height = this._height);
							}
							setTop(e) {
								const t = s(e);
								this._top !== t && (this._top = t, this.domNode.style.top = this._top);
							}
							setLeft(e) {
								const t = s(e);
								this._left !== t && (this._left = t, this.domNode.style.left = this._left);
							}
							setBottom(e) {
								const t = s(e);
								this._bottom !== t && (this._bottom = t, this.domNode.style.bottom = this._bottom);
							}
							setRight(e) {
								const t = s(e);
								this._right !== t && (this._right = t, this.domNode.style.right = this._right);
							}
							setPaddingTop(e) {
								const t = s(e);
								this._paddingTop !== t && (this._paddingTop = t, this.domNode.style.paddingTop = this._paddingTop);
							}
							setPaddingLeft(e) {
								const t = s(e);
								this._paddingLeft !== t && (this._paddingLeft = t, this.domNode.style.paddingLeft = this._paddingLeft);
							}
							setPaddingBottom(e) {
								const t = s(e);
								this._paddingBottom !== t && (this._paddingBottom = t, this.domNode.style.paddingBottom = this._paddingBottom);
							}
							setPaddingRight(e) {
								const t = s(e);
								this._paddingRight !== t && (this._paddingRight = t, this.domNode.style.paddingRight = this._paddingRight);
							}
							setFontFamily(e) {
								this._fontFamily !== e && (this._fontFamily = e, this.domNode.style.fontFamily = this._fontFamily);
							}
							setFontWeight(e) {
								this._fontWeight !== e && (this._fontWeight = e, this.domNode.style.fontWeight = this._fontWeight);
							}
							setFontSize(e) {
								const t = s(e);
								this._fontSize !== t && (this._fontSize = t, this.domNode.style.fontSize = this._fontSize);
							}
							setFontStyle(e) {
								this._fontStyle !== e && (this._fontStyle = e, this.domNode.style.fontStyle = this._fontStyle);
							}
							setFontFeatureSettings(e) {
								this._fontFeatureSettings !== e && (this._fontFeatureSettings = e, this.domNode.style.fontFeatureSettings = this._fontFeatureSettings);
							}
							setFontVariationSettings(e) {
								this._fontVariationSettings !== e && (this._fontVariationSettings = e, this.domNode.style.fontVariationSettings = this._fontVariationSettings);
							}
							setTextDecoration(e) {
								this._textDecoration !== e && (this._textDecoration = e, this.domNode.style.textDecoration = this._textDecoration);
							}
							setLineHeight(e) {
								const t = s(e);
								this._lineHeight !== t && (this._lineHeight = t, this.domNode.style.lineHeight = this._lineHeight);
							}
							setLetterSpacing(e) {
								const t = s(e);
								this._letterSpacing !== t && (this._letterSpacing = t, this.domNode.style.letterSpacing = this._letterSpacing);
							}
							setClassName(e) {
								this._className !== e && (this._className = e, this.domNode.className = this._className);
							}
							toggleClassName(e, t) {
								this.domNode.classList.toggle(e, t), this._className = this.domNode.className;
							}
							setDisplay(e) {
								this._display !== e && (this._display = e, this.domNode.style.display = this._display);
							}
							setPosition(e) {
								this._position !== e && (this._position = e, this.domNode.style.position = this._position);
							}
							setVisibility(e) {
								this._visibility !== e && (this._visibility = e, this.domNode.style.visibility = this._visibility);
							}
							setColor(e) {
								this._color !== e && (this._color = e, this.domNode.style.color = this._color);
							}
							setBackgroundColor(e) {
								this._backgroundColor !== e && (this._backgroundColor = e, this.domNode.style.backgroundColor = this._backgroundColor);
							}
							setLayerHinting(e) {
								this._layerHint !== e && (this._layerHint = e, this.domNode.style.transform = this._layerHint ? "translate3d(0px, 0px, 0px)" : "");
							}
							setBoxShadow(e) {
								this._boxShadow !== e && (this._boxShadow = e, this.domNode.style.boxShadow = e);
							}
							setContain(e) {
								this._contain !== e && (this._contain = e, this.domNode.style.contain = this._contain);
							}
							setAttribute(e, t) {
								this.domNode.setAttribute(e, t);
							}
							removeAttribute(e) {
								this.domNode.removeAttribute(e);
							}
							appendChild(e) {
								this.domNode.appendChild(e.domNode);
							}
							removeChild(e) {
								this.domNode.removeChild(e.domNode);
							}
						}
						function s(e) {
							return "number" == typeof e ? `${e}px` : e;
						}
						t.FastDomNode = i;
					},
					8328: function(e, t, i) {
						var s = this && this.__createBinding || (Object.create ? function(e, t, i, s) {
							void 0 === s && (s = i);
							var r = Object.getOwnPropertyDescriptor(t, i);
							r && !("get" in r ? !t.__esModule : r.writable || r.configurable) || (r = {
								enumerable: !0,
								get: function() {
									return t[i];
								}
							}), Object.defineProperty(e, s, r);
						} : function(e, t, i, s) {
							void 0 === s && (s = i), e[s] = t[i];
						}), r = this && this.__setModuleDefault || (Object.create ? function(e, t) {
							Object.defineProperty(e, "default", {
								enumerable: !0,
								value: t
							});
						} : function(e, t) {
							e.default = t;
						}), n = this && this.__importStar || function(e) {
							if (e && e.__esModule) return e;
							var t = {};
							if (null != e) for (var i in e) "default" !== i && Object.prototype.hasOwnProperty.call(e, i) && s(t, e, i);
							return r(t, e), t;
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.GlobalPointerMoveMonitor = void 0;
						const o = n(i(7093)), a = i(7150);
						t.GlobalPointerMoveMonitor = class {
							constructor() {
								this._hooks = new a.DisposableStore(), this._pointerMoveCallback = null, this._onStopCallback = null;
							}
							dispose() {
								this.stopMonitoring(!1), this._hooks.dispose();
							}
							stopMonitoring(e, t) {
								if (!this.isMonitoring()) return;
								this._hooks.clear(), this._pointerMoveCallback = null;
								const i = this._onStopCallback;
								this._onStopCallback = null, e && i && i(t);
							}
							isMonitoring() {
								return !!this._pointerMoveCallback;
							}
							startMonitoring(e, t, i, s, r) {
								this.isMonitoring() && this.stopMonitoring(!1), this._pointerMoveCallback = s, this._onStopCallback = r;
								let n = e;
								try {
									e.setPointerCapture(t), this._hooks.add((0, a.toDisposable)((() => {
										try {
											e.releasePointerCapture(t);
										} catch (e) {}
									})));
								} catch (t) {
									n = o.getWindow(e);
								}
								this._hooks.add(o.addDisposableListener(n, o.EventType.POINTER_MOVE, ((e) => {
									e.buttons === i ? (e.preventDefault(), this._pointerMoveCallback(e)) : this.stopMonitoring(!0);
								}))), this._hooks.add(o.addDisposableListener(n, o.EventType.POINTER_UP, ((e) => this.stopMonitoring(!0))));
							}
						};
					},
					6609: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.IframeUtils = void 0, t.parentOriginHash = async function(e, t) {
							if (!crypto.subtle) throw new Error("'crypto.subtle' is not available so webviews will not work. This is likely because the editor is not running in a secure context (https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts).");
							const i = JSON.stringify({
								parentOrigin: e,
								salt: t
							}), s = new TextEncoder().encode(i);
							return function(e) {
								const t = Array.from(new Uint8Array(e)).map(((e) => e.toString(16).padStart(2, "0"))).join("");
								return BigInt(`0x${t}`).toString(32).padStart(52, "0");
							}(await crypto.subtle.digest("sha-256", s));
						};
						const i = /* @__PURE__ */ new WeakMap();
						function s(e) {
							if (!e.parent || e.parent === e) return null;
							try {
								const t = e.location, i = e.parent.location;
								if ("null" !== t.origin && "null" !== i.origin && t.origin !== i.origin) return null;
							} catch (e) {
								return null;
							}
							return e.parent;
						}
						t.IframeUtils = class {
							static getSameOriginWindowChain(e) {
								let t = i.get(e);
								if (!t) {
									t = [], i.set(e, t);
									let r, n = e;
									do
										r = s(n), r ? t.push({
											window: new WeakRef(n),
											iframeElement: n.frameElement || null
										}) : t.push({
											window: new WeakRef(n),
											iframeElement: null
										}), n = r;
									while (n);
								}
								return t.slice(0);
							}
							static getPositionOfChildWindowRelativeToAncestorWindow(e, t) {
								if (!t || e === t) return {
									top: 0,
									left: 0
								};
								let i = 0, s = 0;
								const r = this.getSameOriginWindowChain(e);
								for (const e of r) {
									const r = e.window.deref();
									if (i += r?.scrollY ?? 0, s += r?.scrollX ?? 0, r === t) break;
									if (!e.iframeElement) break;
									const n = e.iframeElement.getBoundingClientRect();
									i += n.top, s += n.left;
								}
								return {
									top: i,
									left: s
								};
							}
						};
					},
					5394: function(e, t, i) {
						var s = this && this.__createBinding || (Object.create ? function(e, t, i, s) {
							void 0 === s && (s = i);
							var r = Object.getOwnPropertyDescriptor(t, i);
							r && !("get" in r ? !t.__esModule : r.writable || r.configurable) || (r = {
								enumerable: !0,
								get: function() {
									return t[i];
								}
							}), Object.defineProperty(e, s, r);
						} : function(e, t, i, s) {
							void 0 === s && (s = i), e[s] = t[i];
						}), r = this && this.__setModuleDefault || (Object.create ? function(e, t) {
							Object.defineProperty(e, "default", {
								enumerable: !0,
								value: t
							});
						} : function(e, t) {
							e.default = t;
						}), n = this && this.__importStar || function(e) {
							if (e && e.__esModule) return e;
							var t = {};
							if (null != e) for (var i in e) "default" !== i && Object.prototype.hasOwnProperty.call(e, i) && s(t, e, i);
							return r(t, e), t;
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.StandardKeyboardEvent = void 0, t.printKeyboardEvent = function(e) {
							const t = [];
							return e.ctrlKey && t.push("ctrl"), e.shiftKey && t.push("shift"), e.altKey && t.push("alt"), e.metaKey && t.push("meta"), `modifiers: [${t.join(",")}], code: ${e.code}, keyCode: ${e.keyCode}, key: ${e.key}`;
						}, t.printStandardKeyboardEvent = function(e) {
							const t = [];
							return e.ctrlKey && t.push("ctrl"), e.shiftKey && t.push("shift"), e.altKey && t.push("alt"), e.metaKey && t.push("meta"), `modifiers: [${t.join(",")}], code: ${e.code}, keyCode: ${e.keyCode} ('${a.KeyCodeUtils.toString(e.keyCode)}')`;
						};
						const o = n(i(4333)), a = i(7883), l = i(2811), h = n(i(8163)), c = h.isMacintosh ? a.KeyMod.WinCtrl : a.KeyMod.CtrlCmd, d = a.KeyMod.Alt, u = a.KeyMod.Shift, _ = h.isMacintosh ? a.KeyMod.CtrlCmd : a.KeyMod.WinCtrl;
						t.StandardKeyboardEvent = class {
							constructor(e) {
								this._standardKeyboardEventBrand = !0;
								const t = e;
								this.browserEvent = t, this.target = t.target, this.ctrlKey = t.ctrlKey, this.shiftKey = t.shiftKey, this.altKey = t.altKey, this.metaKey = t.metaKey, this.altGraphKey = t.getModifierState?.("AltGraph"), this.keyCode = function(e) {
									if (e.charCode) {
										const t = String.fromCharCode(e.charCode).toUpperCase();
										return a.KeyCodeUtils.fromString(t);
									}
									const t = e.keyCode;
									if (3 === t) return a.KeyCode.PauseBreak;
									if (o.isFirefox) switch (t) {
										case 59: return a.KeyCode.Semicolon;
										case 60:
											if (h.isLinux) return a.KeyCode.IntlBackslash;
											break;
										case 61: return a.KeyCode.Equal;
										case 107: return a.KeyCode.NumpadAdd;
										case 109: return a.KeyCode.NumpadSubtract;
										case 173: return a.KeyCode.Minus;
										case 224: if (h.isMacintosh) return a.KeyCode.Meta;
									}
									else if (o.isWebKit) {
										if (h.isMacintosh && 93 === t) return a.KeyCode.Meta;
										if (!h.isMacintosh && 92 === t) return a.KeyCode.Meta;
									}
									return a.EVENT_KEY_CODE_MAP[t] || a.KeyCode.Unknown;
								}(t), this.code = t.code, this.ctrlKey = this.ctrlKey || this.keyCode === a.KeyCode.Ctrl, this.altKey = this.altKey || this.keyCode === a.KeyCode.Alt, this.shiftKey = this.shiftKey || this.keyCode === a.KeyCode.Shift, this.metaKey = this.metaKey || this.keyCode === a.KeyCode.Meta, this._asKeybinding = this._computeKeybinding(), this._asKeyCodeChord = this._computeKeyCodeChord();
							}
							preventDefault() {
								this.browserEvent && this.browserEvent.preventDefault && this.browserEvent.preventDefault();
							}
							stopPropagation() {
								this.browserEvent && this.browserEvent.stopPropagation && this.browserEvent.stopPropagation();
							}
							toKeyCodeChord() {
								return this._asKeyCodeChord;
							}
							equals(e) {
								return this._asKeybinding === e;
							}
							_computeKeybinding() {
								let e = a.KeyCode.Unknown;
								this.keyCode !== a.KeyCode.Ctrl && this.keyCode !== a.KeyCode.Shift && this.keyCode !== a.KeyCode.Alt && this.keyCode !== a.KeyCode.Meta && (e = this.keyCode);
								let t = 0;
								return this.ctrlKey && (t |= c), this.altKey && (t |= d), this.shiftKey && (t |= u), this.metaKey && (t |= _), t |= e, t;
							}
							_computeKeyCodeChord() {
								let e = a.KeyCode.Unknown;
								return this.keyCode !== a.KeyCode.Ctrl && this.keyCode !== a.KeyCode.Shift && this.keyCode !== a.KeyCode.Alt && this.keyCode !== a.KeyCode.Meta && (e = this.keyCode), new l.KeyCodeChord(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, e);
							}
						};
					},
					5964: function(e, t, i) {
						var s = this && this.__createBinding || (Object.create ? function(e, t, i, s) {
							void 0 === s && (s = i);
							var r = Object.getOwnPropertyDescriptor(t, i);
							r && !("get" in r ? !t.__esModule : r.writable || r.configurable) || (r = {
								enumerable: !0,
								get: function() {
									return t[i];
								}
							}), Object.defineProperty(e, s, r);
						} : function(e, t, i, s) {
							void 0 === s && (s = i), e[s] = t[i];
						}), r = this && this.__setModuleDefault || (Object.create ? function(e, t) {
							Object.defineProperty(e, "default", {
								enumerable: !0,
								value: t
							});
						} : function(e, t) {
							e.default = t;
						}), n = this && this.__importStar || function(e) {
							if (e && e.__esModule) return e;
							var t = {};
							if (null != e) for (var i in e) "default" !== i && Object.prototype.hasOwnProperty.call(e, i) && s(t, e, i);
							return r(t, e), t;
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.StandardWheelEvent = t.DragMouseEvent = t.StandardMouseEvent = void 0;
						const o = n(i(4333)), a = i(6609), l = n(i(8163));
						class h {
							constructor(e, t) {
								this.timestamp = Date.now(), this.browserEvent = t, this.leftButton = 0 === t.button, this.middleButton = 1 === t.button, this.rightButton = 2 === t.button, this.buttons = t.buttons, this.target = t.target, this.detail = t.detail || 1, "dblclick" === t.type && (this.detail = 2), this.ctrlKey = t.ctrlKey, this.shiftKey = t.shiftKey, this.altKey = t.altKey, this.metaKey = t.metaKey, "number" == typeof t.pageX ? (this.posx = t.pageX, this.posy = t.pageY) : (this.posx = t.clientX + this.target.ownerDocument.body.scrollLeft + this.target.ownerDocument.documentElement.scrollLeft, this.posy = t.clientY + this.target.ownerDocument.body.scrollTop + this.target.ownerDocument.documentElement.scrollTop);
								const i = a.IframeUtils.getPositionOfChildWindowRelativeToAncestorWindow(e, t.view);
								this.posx -= i.left, this.posy -= i.top;
							}
							preventDefault() {
								this.browserEvent.preventDefault();
							}
							stopPropagation() {
								this.browserEvent.stopPropagation();
							}
						}
						t.StandardMouseEvent = h, t.DragMouseEvent = class extends h {
							constructor(e, t) {
								super(e, t), this.dataTransfer = t.dataTransfer;
							}
						}, t.StandardWheelEvent = class {
							constructor(e, t = 0, i = 0) {
								this.browserEvent = e || null, this.target = e ? e.target || e.targetNode || e.srcElement : null, this.deltaY = i, this.deltaX = t;
								let s = !1;
								if (o.isChrome) {
									const e = navigator.userAgent.match(/Chrome\/(\d+)/);
									s = (e ? parseInt(e[1]) : 123) <= 122;
								}
								if (e) {
									const t = e, i = e, r = e.view?.devicePixelRatio || 1;
									if (void 0 !== t.wheelDeltaY) this.deltaY = s ? t.wheelDeltaY / (120 * r) : t.wheelDeltaY / 120;
									else if (void 0 !== i.VERTICAL_AXIS && i.axis === i.VERTICAL_AXIS) this.deltaY = -i.detail / 3;
									else if ("wheel" === e.type) {
										const t = e;
										t.deltaMode === t.DOM_DELTA_LINE ? o.isFirefox && !l.isMacintosh ? this.deltaY = -e.deltaY / 3 : this.deltaY = -e.deltaY : this.deltaY = -e.deltaY / 40;
									}
									if (void 0 !== t.wheelDeltaX) o.isSafari && l.isWindows ? this.deltaX = -t.wheelDeltaX / 120 : this.deltaX = s ? t.wheelDeltaX / (120 * r) : t.wheelDeltaX / 120;
									else if (void 0 !== i.HORIZONTAL_AXIS && i.axis === i.HORIZONTAL_AXIS) this.deltaX = -e.detail / 3;
									else if ("wheel" === e.type) {
										const t = e;
										t.deltaMode === t.DOM_DELTA_LINE ? o.isFirefox && !l.isMacintosh ? this.deltaX = -e.deltaX / 3 : this.deltaX = -e.deltaX : this.deltaX = -e.deltaX / 40;
									}
									0 === this.deltaY && 0 === this.deltaX && e.wheelDelta && (this.deltaY = s ? e.wheelDelta / (120 * r) : e.wheelDelta / 120);
								}
							}
							preventDefault() {
								this.browserEvent?.preventDefault();
							}
							stopPropagation() {
								this.browserEvent?.stopPropagation();
							}
						};
					},
					8594: function(e, t, i) {
						var s = this && this.__createBinding || (Object.create ? function(e, t, i, s) {
							void 0 === s && (s = i);
							var r = Object.getOwnPropertyDescriptor(t, i);
							r && !("get" in r ? !t.__esModule : r.writable || r.configurable) || (r = {
								enumerable: !0,
								get: function() {
									return t[i];
								}
							}), Object.defineProperty(e, s, r);
						} : function(e, t, i, s) {
							void 0 === s && (s = i), e[s] = t[i];
						}), r = this && this.__setModuleDefault || (Object.create ? function(e, t) {
							Object.defineProperty(e, "default", {
								enumerable: !0,
								value: t
							});
						} : function(e, t) {
							e.default = t;
						}), n = this && this.__decorate || function(e, t, i, s) {
							var r, n = arguments.length, o = n < 3 ? t : null === s ? s = Object.getOwnPropertyDescriptor(t, i) : s;
							if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o = Reflect.decorate(e, t, i, s);
							else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (o = (n < 3 ? r(o) : n > 3 ? r(t, i, o) : r(t, i)) || o);
							return n > 3 && o && Object.defineProperty(t, i, o), o;
						}, o = this && this.__importStar || function(e) {
							if (e && e.__esModule) return e;
							var t = {};
							if (null != e) for (var i in e) "default" !== i && Object.prototype.hasOwnProperty.call(e, i) && s(t, e, i);
							return r(t, e), t;
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.Gesture = t.EventType = void 0;
						const a = o(i(7093)), l = i(4693), h = o(i(3058)), c = i(4838), d = i(802), u = i(7150), _ = i(6317);
						var f;
						(function(e) {
							e.Tap = "-xterm-gesturetap", e.Change = "-xterm-gesturechange", e.Start = "-xterm-gesturestart", e.End = "-xterm-gesturesend", e.Contextmenu = "-xterm-gesturecontextmenu";
						})(f || (t.EventType = f = {}));
						class p extends u.Disposable {
							static {
								this.SCROLL_FRICTION = -.005;
							}
							static {
								this.HOLD_DELAY = 700;
							}
							static {
								this.CLEAR_TAP_COUNT_TIME = 400;
							}
							constructor() {
								super(), this.dispatched = !1, this.targets = new _.LinkedList(), this.ignoreTargets = new _.LinkedList(), this.activeTouches = {}, this.handle = null, this._lastSetTapCountTime = 0, this._register(d.Event.runAndSubscribe(a.onDidRegisterWindow, (({ window: e, disposables: t }) => {
									t.add(a.addDisposableListener(e.document, "touchstart", ((e) => this.onTouchStart(e)), { passive: !1 })), t.add(a.addDisposableListener(e.document, "touchend", ((t) => this.onTouchEnd(e, t)))), t.add(a.addDisposableListener(e.document, "touchmove", ((e) => this.onTouchMove(e)), { passive: !1 }));
								}), {
									window: l.mainWindow,
									disposables: this._store
								}));
							}
							static addTarget(e) {
								if (!p.isTouchDevice()) return u.Disposable.None;
								p.INSTANCE || (p.INSTANCE = (0, u.markAsSingleton)(new p()));
								const t = p.INSTANCE.targets.push(e);
								return (0, u.toDisposable)(t);
							}
							static ignoreTarget(e) {
								if (!p.isTouchDevice()) return u.Disposable.None;
								p.INSTANCE || (p.INSTANCE = (0, u.markAsSingleton)(new p()));
								const t = p.INSTANCE.ignoreTargets.push(e);
								return (0, u.toDisposable)(t);
							}
							static isTouchDevice() {
								return "ontouchstart" in l.mainWindow || navigator.maxTouchPoints > 0;
							}
							dispose() {
								this.handle && (this.handle.dispose(), this.handle = null), super.dispose();
							}
							onTouchStart(e) {
								const t = Date.now();
								this.handle && (this.handle.dispose(), this.handle = null);
								for (let i = 0, s = e.targetTouches.length; i < s; i++) {
									const s = e.targetTouches.item(i);
									this.activeTouches[s.identifier] = {
										id: s.identifier,
										initialTarget: s.target,
										initialTimeStamp: t,
										initialPageX: s.pageX,
										initialPageY: s.pageY,
										rollingTimestamps: [t],
										rollingPageX: [s.pageX],
										rollingPageY: [s.pageY]
									};
									const r = this.newGestureEvent(f.Start, s.target);
									r.pageX = s.pageX, r.pageY = s.pageY, this.dispatchEvent(r);
								}
								this.dispatched && (e.preventDefault(), e.stopPropagation(), this.dispatched = !1);
							}
							onTouchEnd(e, t) {
								const i = Date.now(), s = Object.keys(this.activeTouches).length;
								for (let r = 0, n = t.changedTouches.length; r < n; r++) {
									const n = t.changedTouches.item(r);
									if (!this.activeTouches.hasOwnProperty(String(n.identifier))) {
										console.warn("move of an UNKNOWN touch", n);
										continue;
									}
									const o = this.activeTouches[n.identifier], a = Date.now() - o.initialTimeStamp;
									if (a < p.HOLD_DELAY && Math.abs(o.initialPageX - h.tail(o.rollingPageX)) < 30 && Math.abs(o.initialPageY - h.tail(o.rollingPageY)) < 30) {
										const e = this.newGestureEvent(f.Tap, o.initialTarget);
										e.pageX = h.tail(o.rollingPageX), e.pageY = h.tail(o.rollingPageY), this.dispatchEvent(e);
									} else if (a >= p.HOLD_DELAY && Math.abs(o.initialPageX - h.tail(o.rollingPageX)) < 30 && Math.abs(o.initialPageY - h.tail(o.rollingPageY)) < 30) {
										const e = this.newGestureEvent(f.Contextmenu, o.initialTarget);
										e.pageX = h.tail(o.rollingPageX), e.pageY = h.tail(o.rollingPageY), this.dispatchEvent(e);
									} else if (1 === s) {
										const t = h.tail(o.rollingPageX), s = h.tail(o.rollingPageY), r = h.tail(o.rollingTimestamps) - o.rollingTimestamps[0], n = t - o.rollingPageX[0], a = s - o.rollingPageY[0], l = [...this.targets].filter(((e) => o.initialTarget instanceof Node && e.contains(o.initialTarget)));
										this.inertia(e, l, i, Math.abs(n) / r, n > 0 ? 1 : -1, t, Math.abs(a) / r, a > 0 ? 1 : -1, s);
									}
									this.dispatchEvent(this.newGestureEvent(f.End, o.initialTarget)), delete this.activeTouches[n.identifier];
								}
								this.dispatched && (t.preventDefault(), t.stopPropagation(), this.dispatched = !1);
							}
							newGestureEvent(e, t) {
								const i = document.createEvent("CustomEvent");
								return i.initEvent(e, !1, !0), i.initialTarget = t, i.tapCount = 0, i;
							}
							dispatchEvent(e) {
								if (e.type === f.Tap) {
									const t = (/* @__PURE__ */ new Date()).getTime();
									let i = 0;
									i = t - this._lastSetTapCountTime > p.CLEAR_TAP_COUNT_TIME ? 1 : 2, this._lastSetTapCountTime = t, e.tapCount = i;
								} else e.type !== f.Change && e.type !== f.Contextmenu || (this._lastSetTapCountTime = 0);
								if (e.initialTarget instanceof Node) {
									for (const t of this.ignoreTargets) if (t.contains(e.initialTarget)) return;
									const t = [];
									for (const i of this.targets) if (i.contains(e.initialTarget)) {
										let s = 0, r = e.initialTarget;
										for (; r && r !== i;) s++, r = r.parentElement;
										t.push([s, i]);
									}
									t.sort(((e, t) => e[0] - t[0]));
									for (const [i, s] of t) s.dispatchEvent(e), this.dispatched = !0;
								}
							}
							inertia(e, t, i, s, r, n, o, l, h) {
								this.handle = a.scheduleAtNextAnimationFrame(e, (() => {
									const a = Date.now(), c = a - i;
									let d = 0, u = 0, _ = !0;
									s += p.SCROLL_FRICTION * c, o += p.SCROLL_FRICTION * c, s > 0 && (_ = !1, d = r * s * c), o > 0 && (_ = !1, u = l * o * c);
									const g = this.newGestureEvent(f.Change);
									g.translationX = d, g.translationY = u, t.forEach(((e) => e.dispatchEvent(g))), _ || this.inertia(e, t, a, s, r, n + d, o, l, h + u);
								}));
							}
							onTouchMove(e) {
								const t = Date.now();
								for (let i = 0, s = e.changedTouches.length; i < s; i++) {
									const s = e.changedTouches.item(i);
									if (!this.activeTouches.hasOwnProperty(String(s.identifier))) {
										console.warn("end of an UNKNOWN touch", s);
										continue;
									}
									const r = this.activeTouches[s.identifier], n = this.newGestureEvent(f.Change, r.initialTarget);
									n.translationX = s.pageX - h.tail(r.rollingPageX), n.translationY = s.pageY - h.tail(r.rollingPageY), n.pageX = s.pageX, n.pageY = s.pageY, this.dispatchEvent(n), r.rollingPageX.length > 3 && (r.rollingPageX.shift(), r.rollingPageY.shift(), r.rollingTimestamps.shift()), r.rollingPageX.push(s.pageX), r.rollingPageY.push(s.pageY), r.rollingTimestamps.push(t);
								}
								this.dispatched && (e.preventDefault(), e.stopPropagation(), this.dispatched = !1);
							}
						}
						t.Gesture = p, n([c.memoize], p, "isTouchDevice", null);
					},
					8801: function(e, t, i) {
						var s = this && this.__createBinding || (Object.create ? function(e, t, i, s) {
							void 0 === s && (s = i);
							var r = Object.getOwnPropertyDescriptor(t, i);
							r && !("get" in r ? !t.__esModule : r.writable || r.configurable) || (r = {
								enumerable: !0,
								get: function() {
									return t[i];
								}
							}), Object.defineProperty(e, s, r);
						} : function(e, t, i, s) {
							void 0 === s && (s = i), e[s] = t[i];
						}), r = this && this.__setModuleDefault || (Object.create ? function(e, t) {
							Object.defineProperty(e, "default", {
								enumerable: !0,
								value: t
							});
						} : function(e, t) {
							e.default = t;
						}), n = this && this.__importStar || function(e) {
							if (e && e.__esModule) return e;
							var t = {};
							if (null != e) for (var i in e) "default" !== i && Object.prototype.hasOwnProperty.call(e, i) && s(t, e, i);
							return r(t, e), t;
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.AbstractScrollbar = void 0;
						const o = n(i(7093)), a = i(9675), l = i(8328), h = i(8974), c = i(79), d = i(8286), u = n(i(8163));
						class _ extends d.Widget {
							constructor(e) {
								super(), this._lazyRender = e.lazyRender, this._host = e.host, this._scrollable = e.scrollable, this._scrollByPage = e.scrollByPage, this._scrollbarState = e.scrollbarState, this._visibilityController = this._register(new c.ScrollbarVisibilityController(e.visibility, "visible scrollbar " + e.extraScrollbarClassName, "invisible scrollbar " + e.extraScrollbarClassName)), this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()), this._pointerMoveMonitor = this._register(new l.GlobalPointerMoveMonitor()), this._shouldRender = !0, this.domNode = (0, a.createFastDomNode)(document.createElement("div")), this.domNode.setAttribute("role", "presentation"), this.domNode.setAttribute("aria-hidden", "true"), this._visibilityController.setDomNode(this.domNode), this.domNode.setPosition("absolute"), this._register(o.addDisposableListener(this.domNode.domNode, o.EventType.POINTER_DOWN, ((e) => this._domNodePointerDown(e))));
							}
							_createArrow(e) {
								const t = this._register(new h.ScrollbarArrow(e));
								this.domNode.domNode.appendChild(t.bgDomNode), this.domNode.domNode.appendChild(t.domNode);
							}
							_createSlider(e, t, i, s) {
								this.slider = (0, a.createFastDomNode)(document.createElement("div")), this.slider.setClassName("slider"), this.slider.setPosition("absolute"), this.slider.setTop(e), this.slider.setLeft(t), "number" == typeof i && this.slider.setWidth(i), "number" == typeof s && this.slider.setHeight(s), this.slider.setLayerHinting(!0), this.slider.setContain("strict"), this.domNode.domNode.appendChild(this.slider.domNode), this._register(o.addDisposableListener(this.slider.domNode, o.EventType.POINTER_DOWN, ((e) => {
									0 === e.button && (e.preventDefault(), this._sliderPointerDown(e));
								}))), this.onclick(this.slider.domNode, ((e) => {
									e.leftButton && e.stopPropagation();
								}));
							}
							_onElementSize(e) {
								return this._scrollbarState.setVisibleSize(e) && (this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()), this._shouldRender = !0, this._lazyRender || this.render()), this._shouldRender;
							}
							_onElementScrollSize(e) {
								return this._scrollbarState.setScrollSize(e) && (this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()), this._shouldRender = !0, this._lazyRender || this.render()), this._shouldRender;
							}
							_onElementScrollPosition(e) {
								return this._scrollbarState.setScrollPosition(e) && (this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded()), this._shouldRender = !0, this._lazyRender || this.render()), this._shouldRender;
							}
							beginReveal() {
								this._visibilityController.setShouldBeVisible(!0);
							}
							beginHide() {
								this._visibilityController.setShouldBeVisible(!1);
							}
							render() {
								this._shouldRender && (this._shouldRender = !1, this._renderDomNode(this._scrollbarState.getRectangleLargeSize(), this._scrollbarState.getRectangleSmallSize()), this._updateSlider(this._scrollbarState.getSliderSize(), this._scrollbarState.getArrowSize() + this._scrollbarState.getSliderPosition()));
							}
							_domNodePointerDown(e) {
								e.target === this.domNode.domNode && this._onPointerDown(e);
							}
							delegatePointerDown(e) {
								const t = this.domNode.domNode.getClientRects()[0].top, i = t + this._scrollbarState.getSliderPosition(), s = t + this._scrollbarState.getSliderPosition() + this._scrollbarState.getSliderSize(), r = this._sliderPointerPosition(e);
								i <= r && r <= s ? 0 === e.button && (e.preventDefault(), this._sliderPointerDown(e)) : this._onPointerDown(e);
							}
							_onPointerDown(e) {
								let t, i;
								if (e.target === this.domNode.domNode && "number" == typeof e.offsetX && "number" == typeof e.offsetY) t = e.offsetX, i = e.offsetY;
								else {
									const s = o.getDomNodePagePosition(this.domNode.domNode);
									t = e.pageX - s.left, i = e.pageY - s.top;
								}
								const s = this._pointerDownRelativePosition(t, i);
								this._setDesiredScrollPositionNow(this._scrollByPage ? this._scrollbarState.getDesiredScrollPositionFromOffsetPaged(s) : this._scrollbarState.getDesiredScrollPositionFromOffset(s)), 0 === e.button && (e.preventDefault(), this._sliderPointerDown(e));
							}
							_sliderPointerDown(e) {
								if (!(e.target && e.target instanceof Element)) return;
								const t = this._sliderPointerPosition(e), i = this._sliderOrthogonalPointerPosition(e), s = this._scrollbarState.clone();
								this.slider.toggleClassName("active", !0), this._pointerMoveMonitor.startMonitoring(e.target, e.pointerId, e.buttons, ((e) => {
									const r = this._sliderOrthogonalPointerPosition(e), n = Math.abs(r - i);
									if (u.isWindows && n > 140) return void this._setDesiredScrollPositionNow(s.getScrollPosition());
									const o = this._sliderPointerPosition(e) - t;
									this._setDesiredScrollPositionNow(s.getDesiredScrollPositionFromDelta(o));
								}), (() => {
									this.slider.toggleClassName("active", !1), this._host.onDragEnd();
								})), this._host.onDragStart();
							}
							_setDesiredScrollPositionNow(e) {
								const t = {};
								this.writeScrollPosition(t, e), this._scrollable.setScrollPositionNow(t);
							}
							updateScrollbarSize(e) {
								this._updateScrollbarSize(e), this._scrollbarState.setScrollbarSize(e), this._shouldRender = !0, this._lazyRender || this.render();
							}
							isNeeded() {
								return this._scrollbarState.isNeeded();
							}
						}
						t.AbstractScrollbar = _;
					},
					151: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.HorizontalScrollbar = void 0;
						const s = i(8801), r = i(8245), n = i(9881);
						class o extends s.AbstractScrollbar {
							constructor(e, t, i) {
								const s = e.getScrollDimensions(), o = e.getCurrentScrollPosition();
								if (super({
									lazyRender: t.lazyRender,
									host: i,
									scrollbarState: new r.ScrollbarState(t.horizontalHasArrows ? t.arrowSize : 0, t.horizontal === n.ScrollbarVisibility.Hidden ? 0 : t.horizontalScrollbarSize, t.vertical === n.ScrollbarVisibility.Hidden ? 0 : t.verticalScrollbarSize, s.width, s.scrollWidth, o.scrollLeft),
									visibility: t.horizontal,
									extraScrollbarClassName: "horizontal",
									scrollable: e,
									scrollByPage: t.scrollByPage
								}), t.horizontalHasArrows) throw new Error("horizontalHasArrows is not supported in xterm.js");
								this._createSlider(Math.floor((t.horizontalScrollbarSize - t.horizontalSliderSize) / 2), 0, void 0, t.horizontalSliderSize);
							}
							_updateSlider(e, t) {
								this.slider.setWidth(e), this.slider.setLeft(t);
							}
							_renderDomNode(e, t) {
								this.domNode.setWidth(e), this.domNode.setHeight(t), this.domNode.setLeft(0), this.domNode.setBottom(0);
							}
							onDidScroll(e) {
								return this._shouldRender = this._onElementScrollSize(e.scrollWidth) || this._shouldRender, this._shouldRender = this._onElementScrollPosition(e.scrollLeft) || this._shouldRender, this._shouldRender = this._onElementSize(e.width) || this._shouldRender, this._shouldRender;
							}
							_pointerDownRelativePosition(e, t) {
								return e;
							}
							_sliderPointerPosition(e) {
								return e.pageX;
							}
							_sliderOrthogonalPointerPosition(e) {
								return e.pageY;
							}
							_updateScrollbarSize(e) {
								this.slider.setHeight(e);
							}
							writeScrollPosition(e, t) {
								e.scrollLeft = t;
							}
							updateOptions(e) {
								this.updateScrollbarSize(e.horizontal === n.ScrollbarVisibility.Hidden ? 0 : e.horizontalScrollbarSize), this._scrollbarState.setOppositeScrollbarSize(e.vertical === n.ScrollbarVisibility.Hidden ? 0 : e.verticalScrollbarSize), this._visibilityController.setVisibility(e.horizontal), this._scrollByPage = e.scrollByPage;
							}
						}
						t.HorizontalScrollbar = o;
					},
					8234: function(e, t, i) {
						var s = this && this.__createBinding || (Object.create ? function(e, t, i, s) {
							void 0 === s && (s = i);
							var r = Object.getOwnPropertyDescriptor(t, i);
							r && !("get" in r ? !t.__esModule : r.writable || r.configurable) || (r = {
								enumerable: !0,
								get: function() {
									return t[i];
								}
							}), Object.defineProperty(e, s, r);
						} : function(e, t, i, s) {
							void 0 === s && (s = i), e[s] = t[i];
						}), r = this && this.__setModuleDefault || (Object.create ? function(e, t) {
							Object.defineProperty(e, "default", {
								enumerable: !0,
								value: t
							});
						} : function(e, t) {
							e.default = t;
						}), n = this && this.__importStar || function(e) {
							if (e && e.__esModule) return e;
							var t = {};
							if (null != e) for (var i in e) "default" !== i && Object.prototype.hasOwnProperty.call(e, i) && s(t, e, i);
							return r(t, e), t;
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.DomScrollableElement = t.SmoothScrollableElement = t.ScrollableElement = t.AbstractScrollableElement = t.MouseWheelClassifier = void 0;
						const o = i(4333), a = n(i(7093)), l = i(9675), h = i(5964), c = i(151), d = i(5473), u = i(8286), _ = i(1758), f = i(802), p = i(7150), g = n(i(8163)), m = i(9881);
						class v {
							constructor(e, t, i) {
								this.timestamp = e, this.deltaX = t, this.deltaY = i, this.score = 0;
							}
						}
						class S {
							static {
								this.INSTANCE = new S();
							}
							constructor() {
								this._capacity = 5, this._memory = [], this._front = -1, this._rear = -1;
							}
							isPhysicalMouseWheel() {
								if (-1 === this._front && -1 === this._rear) return !1;
								let e = 1, t = 0, i = 1, s = this._rear;
								for (;;) {
									const r = s === this._front ? e : Math.pow(2, -i);
									if (e -= r, t += this._memory[s].score * r, s === this._front) break;
									s = (this._capacity + s - 1) % this._capacity, i++;
								}
								return t <= .5;
							}
							acceptStandardWheelEvent(e) {
								if (o.isChrome) {
									const t = a.getWindow(e.browserEvent), i = (0, o.getZoomFactor)(t);
									this.accept(Date.now(), e.deltaX * i, e.deltaY * i);
								} else this.accept(Date.now(), e.deltaX, e.deltaY);
							}
							accept(e, t, i) {
								let s = null;
								const r = new v(e, t, i);
								-1 === this._front && -1 === this._rear ? (this._memory[0] = r, this._front = 0, this._rear = 0) : (s = this._memory[this._rear], this._rear = (this._rear + 1) % this._capacity, this._rear === this._front && (this._front = (this._front + 1) % this._capacity), this._memory[this._rear] = r), r.score = this._computeScore(r, s);
							}
							_computeScore(e, t) {
								if (Math.abs(e.deltaX) > 0 && Math.abs(e.deltaY) > 0) return 1;
								let i = .5;
								if (this._isAlmostInt(e.deltaX) && this._isAlmostInt(e.deltaY) || (i += .25), t) {
									const s = Math.abs(e.deltaX), r = Math.abs(e.deltaY), n = Math.abs(t.deltaX), o = Math.abs(t.deltaY), a = Math.max(Math.min(s, n), 1), l = Math.max(Math.min(r, o), 1), h = Math.max(s, n), c = Math.max(r, o);
									h % a == 0 && c % l == 0 && (i -= .5);
								}
								return Math.min(Math.max(i, 0), 1);
							}
							_isAlmostInt(e) {
								return Math.abs(Math.round(e) - e) < .01;
							}
						}
						t.MouseWheelClassifier = S;
						class b extends u.Widget {
							get options() {
								return this._options;
							}
							constructor(e, t, i) {
								super(), this._onScroll = this._register(new f.Emitter()), this.onScroll = this._onScroll.event, this._onWillScroll = this._register(new f.Emitter()), this.onWillScroll = this._onWillScroll.event, this._options = function(e) {
									const t = {
										lazyRender: void 0 !== e.lazyRender && e.lazyRender,
										className: void 0 !== e.className ? e.className : "",
										useShadows: void 0 === e.useShadows || e.useShadows,
										handleMouseWheel: void 0 === e.handleMouseWheel || e.handleMouseWheel,
										flipAxes: void 0 !== e.flipAxes && e.flipAxes,
										consumeMouseWheelIfScrollbarIsNeeded: void 0 !== e.consumeMouseWheelIfScrollbarIsNeeded && e.consumeMouseWheelIfScrollbarIsNeeded,
										alwaysConsumeMouseWheel: void 0 !== e.alwaysConsumeMouseWheel && e.alwaysConsumeMouseWheel,
										scrollYToX: void 0 !== e.scrollYToX && e.scrollYToX,
										mouseWheelScrollSensitivity: void 0 !== e.mouseWheelScrollSensitivity ? e.mouseWheelScrollSensitivity : 1,
										fastScrollSensitivity: void 0 !== e.fastScrollSensitivity ? e.fastScrollSensitivity : 5,
										scrollPredominantAxis: void 0 === e.scrollPredominantAxis || e.scrollPredominantAxis,
										mouseWheelSmoothScroll: void 0 === e.mouseWheelSmoothScroll || e.mouseWheelSmoothScroll,
										arrowSize: void 0 !== e.arrowSize ? e.arrowSize : 11,
										listenOnDomNode: void 0 !== e.listenOnDomNode ? e.listenOnDomNode : null,
										horizontal: void 0 !== e.horizontal ? e.horizontal : m.ScrollbarVisibility.Auto,
										horizontalScrollbarSize: void 0 !== e.horizontalScrollbarSize ? e.horizontalScrollbarSize : 10,
										horizontalSliderSize: void 0 !== e.horizontalSliderSize ? e.horizontalSliderSize : 0,
										horizontalHasArrows: void 0 !== e.horizontalHasArrows && e.horizontalHasArrows,
										vertical: void 0 !== e.vertical ? e.vertical : m.ScrollbarVisibility.Auto,
										verticalScrollbarSize: void 0 !== e.verticalScrollbarSize ? e.verticalScrollbarSize : 10,
										verticalHasArrows: void 0 !== e.verticalHasArrows && e.verticalHasArrows,
										verticalSliderSize: void 0 !== e.verticalSliderSize ? e.verticalSliderSize : 0,
										scrollByPage: void 0 !== e.scrollByPage && e.scrollByPage
									};
									return t.horizontalSliderSize = void 0 !== e.horizontalSliderSize ? e.horizontalSliderSize : t.horizontalScrollbarSize, t.verticalSliderSize = void 0 !== e.verticalSliderSize ? e.verticalSliderSize : t.verticalScrollbarSize, g.isMacintosh && (t.className += " mac"), t;
								}(t), this._scrollable = i, this._register(this._scrollable.onScroll(((e) => {
									this._onWillScroll.fire(e), this._onDidScroll(e), this._onScroll.fire(e);
								})));
								const s = {
									onMouseWheel: (e) => this._onMouseWheel(e),
									onDragStart: () => this._onDragStart(),
									onDragEnd: () => this._onDragEnd()
								};
								this._verticalScrollbar = this._register(new d.VerticalScrollbar(this._scrollable, this._options, s)), this._horizontalScrollbar = this._register(new c.HorizontalScrollbar(this._scrollable, this._options, s)), this._domNode = document.createElement("div"), this._domNode.className = "xterm-scrollable-element " + this._options.className, this._domNode.setAttribute("role", "presentation"), this._domNode.style.position = "relative", this._domNode.appendChild(e), this._domNode.appendChild(this._horizontalScrollbar.domNode.domNode), this._domNode.appendChild(this._verticalScrollbar.domNode.domNode), this._options.useShadows ? (this._leftShadowDomNode = (0, l.createFastDomNode)(document.createElement("div")), this._leftShadowDomNode.setClassName("shadow"), this._domNode.appendChild(this._leftShadowDomNode.domNode), this._topShadowDomNode = (0, l.createFastDomNode)(document.createElement("div")), this._topShadowDomNode.setClassName("shadow"), this._domNode.appendChild(this._topShadowDomNode.domNode), this._topLeftShadowDomNode = (0, l.createFastDomNode)(document.createElement("div")), this._topLeftShadowDomNode.setClassName("shadow"), this._domNode.appendChild(this._topLeftShadowDomNode.domNode)) : (this._leftShadowDomNode = null, this._topShadowDomNode = null, this._topLeftShadowDomNode = null), this._listenOnDomNode = this._options.listenOnDomNode || this._domNode, this._mouseWheelToDispose = [], this._setListeningToMouseWheel(this._options.handleMouseWheel), this.onmouseover(this._listenOnDomNode, ((e) => this._onMouseOver(e))), this.onmouseleave(this._listenOnDomNode, ((e) => this._onMouseLeave(e))), this._hideTimeout = this._register(new _.TimeoutTimer()), this._isDragging = !1, this._mouseIsOver = !1, this._shouldRender = !0, this._revealOnScroll = !0;
							}
							dispose() {
								this._mouseWheelToDispose = (0, p.dispose)(this._mouseWheelToDispose), super.dispose();
							}
							getDomNode() {
								return this._domNode;
							}
							getOverviewRulerLayoutInfo() {
								return {
									parent: this._domNode,
									insertBefore: this._verticalScrollbar.domNode.domNode
								};
							}
							delegateVerticalScrollbarPointerDown(e) {
								this._verticalScrollbar.delegatePointerDown(e);
							}
							getScrollDimensions() {
								return this._scrollable.getScrollDimensions();
							}
							setScrollDimensions(e) {
								this._scrollable.setScrollDimensions(e, !1);
							}
							updateClassName(e) {
								this._options.className = e, g.isMacintosh && (this._options.className += " mac"), this._domNode.className = "xterm-scrollable-element " + this._options.className;
							}
							updateOptions(e) {
								void 0 !== e.handleMouseWheel && (this._options.handleMouseWheel = e.handleMouseWheel, this._setListeningToMouseWheel(this._options.handleMouseWheel)), void 0 !== e.mouseWheelScrollSensitivity && (this._options.mouseWheelScrollSensitivity = e.mouseWheelScrollSensitivity), void 0 !== e.fastScrollSensitivity && (this._options.fastScrollSensitivity = e.fastScrollSensitivity), void 0 !== e.scrollPredominantAxis && (this._options.scrollPredominantAxis = e.scrollPredominantAxis), void 0 !== e.horizontal && (this._options.horizontal = e.horizontal), void 0 !== e.vertical && (this._options.vertical = e.vertical), void 0 !== e.horizontalScrollbarSize && (this._options.horizontalScrollbarSize = e.horizontalScrollbarSize), void 0 !== e.verticalScrollbarSize && (this._options.verticalScrollbarSize = e.verticalScrollbarSize), void 0 !== e.scrollByPage && (this._options.scrollByPage = e.scrollByPage), this._horizontalScrollbar.updateOptions(this._options), this._verticalScrollbar.updateOptions(this._options), this._options.lazyRender || this._render();
							}
							setRevealOnScroll(e) {
								this._revealOnScroll = e;
							}
							delegateScrollFromMouseWheelEvent(e) {
								this._onMouseWheel(new h.StandardWheelEvent(e));
							}
							_setListeningToMouseWheel(e) {
								if (this._mouseWheelToDispose.length > 0 !== e && (this._mouseWheelToDispose = (0, p.dispose)(this._mouseWheelToDispose), e)) {
									const e = (e) => {
										this._onMouseWheel(new h.StandardWheelEvent(e));
									};
									this._mouseWheelToDispose.push(a.addDisposableListener(this._listenOnDomNode, a.EventType.MOUSE_WHEEL, e, { passive: !1 }));
								}
							}
							_onMouseWheel(e) {
								if (e.browserEvent?.defaultPrevented) return;
								const t = S.INSTANCE;
								t.acceptStandardWheelEvent(e);
								let i = !1;
								if (e.deltaY || e.deltaX) {
									let s = e.deltaY * this._options.mouseWheelScrollSensitivity, r = e.deltaX * this._options.mouseWheelScrollSensitivity;
									this._options.scrollPredominantAxis && (this._options.scrollYToX && r + s === 0 ? r = s = 0 : Math.abs(s) >= Math.abs(r) ? r = 0 : s = 0), this._options.flipAxes && ([s, r] = [r, s]);
									const n = !g.isMacintosh && e.browserEvent && e.browserEvent.shiftKey;
									!this._options.scrollYToX && !n || r || (r = s, s = 0), e.browserEvent && e.browserEvent.altKey && (r *= this._options.fastScrollSensitivity, s *= this._options.fastScrollSensitivity);
									const o = this._scrollable.getFutureScrollPosition();
									let a = {};
									if (s) {
										const e = 50 * s, t = o.scrollTop - (e < 0 ? Math.floor(e) : Math.ceil(e));
										this._verticalScrollbar.writeScrollPosition(a, t);
									}
									if (r) {
										const e = 50 * r, t = o.scrollLeft - (e < 0 ? Math.floor(e) : Math.ceil(e));
										this._horizontalScrollbar.writeScrollPosition(a, t);
									}
									a = this._scrollable.validateScrollPosition(a), (o.scrollLeft !== a.scrollLeft || o.scrollTop !== a.scrollTop) && (this._options.mouseWheelSmoothScroll && t.isPhysicalMouseWheel() ? this._scrollable.setScrollPositionSmooth(a) : this._scrollable.setScrollPositionNow(a), i = !0);
								}
								let s = i;
								!s && this._options.alwaysConsumeMouseWheel && (s = !0), !s && this._options.consumeMouseWheelIfScrollbarIsNeeded && (this._verticalScrollbar.isNeeded() || this._horizontalScrollbar.isNeeded()) && (s = !0), s && (e.preventDefault(), e.stopPropagation());
							}
							_onDidScroll(e) {
								this._shouldRender = this._horizontalScrollbar.onDidScroll(e) || this._shouldRender, this._shouldRender = this._verticalScrollbar.onDidScroll(e) || this._shouldRender, this._options.useShadows && (this._shouldRender = !0), this._revealOnScroll && this._reveal(), this._options.lazyRender || this._render();
							}
							renderNow() {
								if (!this._options.lazyRender) throw new Error("Please use `lazyRender` together with `renderNow`!");
								this._render();
							}
							_render() {
								if (this._shouldRender && (this._shouldRender = !1, this._horizontalScrollbar.render(), this._verticalScrollbar.render(), this._options.useShadows)) {
									const e = this._scrollable.getCurrentScrollPosition(), t = e.scrollTop > 0, i = e.scrollLeft > 0, s = i ? " left" : "", r = t ? " top" : "", n = i || t ? " top-left-corner" : "";
									this._leftShadowDomNode.setClassName(`shadow${s}`), this._topShadowDomNode.setClassName(`shadow${r}`), this._topLeftShadowDomNode.setClassName(`shadow${n}${r}${s}`);
								}
							}
							_onDragStart() {
								this._isDragging = !0, this._reveal();
							}
							_onDragEnd() {
								this._isDragging = !1, this._hide();
							}
							_onMouseLeave(e) {
								this._mouseIsOver = !1, this._hide();
							}
							_onMouseOver(e) {
								this._mouseIsOver = !0, this._reveal();
							}
							_reveal() {
								this._verticalScrollbar.beginReveal(), this._horizontalScrollbar.beginReveal(), this._scheduleHide();
							}
							_hide() {
								this._mouseIsOver || this._isDragging || (this._verticalScrollbar.beginHide(), this._horizontalScrollbar.beginHide());
							}
							_scheduleHide() {
								this._mouseIsOver || this._isDragging || this._hideTimeout.cancelAndSet((() => this._hide()), 500);
							}
						}
						t.AbstractScrollableElement = b, t.ScrollableElement = class extends b {
							constructor(e, t) {
								(t = t || {}).mouseWheelSmoothScroll = !1;
								const i = new m.Scrollable({
									forceIntegerValues: !0,
									smoothScrollDuration: 0,
									scheduleAtNextAnimationFrame: (t) => a.scheduleAtNextAnimationFrame(a.getWindow(e), t)
								});
								super(e, t, i), this._register(i);
							}
							setScrollPosition(e) {
								this._scrollable.setScrollPositionNow(e);
							}
							getScrollPosition() {
								return this._scrollable.getCurrentScrollPosition();
							}
						}, t.SmoothScrollableElement = class extends b {
							constructor(e, t, i) {
								super(e, t, i);
							}
							setScrollPosition(e) {
								e.reuseAnimation ? this._scrollable.setScrollPositionSmooth(e, e.reuseAnimation) : this._scrollable.setScrollPositionNow(e);
							}
							getScrollPosition() {
								return this._scrollable.getCurrentScrollPosition();
							}
						}, t.DomScrollableElement = class extends b {
							constructor(e, t) {
								(t = t || {}).mouseWheelSmoothScroll = !1;
								const i = new m.Scrollable({
									forceIntegerValues: !1,
									smoothScrollDuration: 0,
									scheduleAtNextAnimationFrame: (t) => a.scheduleAtNextAnimationFrame(a.getWindow(e), t)
								});
								super(e, t, i), this._register(i), this._element = e, this._register(this.onScroll(((e) => {
									e.scrollTopChanged && (this._element.scrollTop = e.scrollTop), e.scrollLeftChanged && (this._element.scrollLeft = e.scrollLeft);
								}))), this.scanDomNode();
							}
							setScrollPosition(e) {
								this._scrollable.setScrollPositionNow(e);
							}
							getScrollPosition() {
								return this._scrollable.getCurrentScrollPosition();
							}
							scanDomNode() {
								this.setScrollDimensions({
									width: this._element.clientWidth,
									scrollWidth: this._element.scrollWidth,
									height: this._element.clientHeight,
									scrollHeight: this._element.scrollHeight
								}), this.setScrollPosition({
									scrollLeft: this._element.scrollLeft,
									scrollTop: this._element.scrollTop
								});
							}
						};
					},
					8974: function(e, t, i) {
						var s = this && this.__createBinding || (Object.create ? function(e, t, i, s) {
							void 0 === s && (s = i);
							var r = Object.getOwnPropertyDescriptor(t, i);
							r && !("get" in r ? !t.__esModule : r.writable || r.configurable) || (r = {
								enumerable: !0,
								get: function() {
									return t[i];
								}
							}), Object.defineProperty(e, s, r);
						} : function(e, t, i, s) {
							void 0 === s && (s = i), e[s] = t[i];
						}), r = this && this.__setModuleDefault || (Object.create ? function(e, t) {
							Object.defineProperty(e, "default", {
								enumerable: !0,
								value: t
							});
						} : function(e, t) {
							e.default = t;
						}), n = this && this.__importStar || function(e) {
							if (e && e.__esModule) return e;
							var t = {};
							if (null != e) for (var i in e) "default" !== i && Object.prototype.hasOwnProperty.call(e, i) && s(t, e, i);
							return r(t, e), t;
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.ScrollbarArrow = t.ARROW_IMG_SIZE = void 0;
						const o = i(8328), a = i(8286), l = i(1758), h = n(i(7093));
						t.ARROW_IMG_SIZE = 11;
						class c extends a.Widget {
							constructor(e) {
								super(), this._onActivate = e.onActivate, this.bgDomNode = document.createElement("div"), this.bgDomNode.className = "arrow-background", this.bgDomNode.style.position = "absolute", this.bgDomNode.style.width = e.bgWidth + "px", this.bgDomNode.style.height = e.bgHeight + "px", void 0 !== e.top && (this.bgDomNode.style.top = "0px"), void 0 !== e.left && (this.bgDomNode.style.left = "0px"), void 0 !== e.bottom && (this.bgDomNode.style.bottom = "0px"), void 0 !== e.right && (this.bgDomNode.style.right = "0px"), this.domNode = document.createElement("div"), this.domNode.className = e.className, this.domNode.style.position = "absolute", this.domNode.style.width = t.ARROW_IMG_SIZE + "px", this.domNode.style.height = t.ARROW_IMG_SIZE + "px", void 0 !== e.top && (this.domNode.style.top = e.top + "px"), void 0 !== e.left && (this.domNode.style.left = e.left + "px"), void 0 !== e.bottom && (this.domNode.style.bottom = e.bottom + "px"), void 0 !== e.right && (this.domNode.style.right = e.right + "px"), this._pointerMoveMonitor = this._register(new o.GlobalPointerMoveMonitor()), this._register(h.addStandardDisposableListener(this.bgDomNode, h.EventType.POINTER_DOWN, ((e) => this._arrowPointerDown(e)))), this._register(h.addStandardDisposableListener(this.domNode, h.EventType.POINTER_DOWN, ((e) => this._arrowPointerDown(e)))), this._pointerdownRepeatTimer = this._register(new h.WindowIntervalTimer()), this._pointerdownScheduleRepeatTimer = this._register(new l.TimeoutTimer());
							}
							_arrowPointerDown(e) {
								e.target && e.target instanceof Element && (this._onActivate(), this._pointerdownRepeatTimer.cancel(), this._pointerdownScheduleRepeatTimer.cancelAndSet((() => {
									this._pointerdownRepeatTimer.cancelAndSet((() => this._onActivate()), 1e3 / 24, h.getWindow(e));
								}), 200), this._pointerMoveMonitor.startMonitoring(e.target, e.pointerId, e.buttons, ((e) => {}), (() => {
									this._pointerdownRepeatTimer.cancel(), this._pointerdownScheduleRepeatTimer.cancel();
								})), e.preventDefault());
							}
						}
						t.ScrollbarArrow = c;
					},
					8245: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.ScrollbarState = void 0;
						class i {
							constructor(e, t, i, s, r, n) {
								this._scrollbarSize = Math.round(t), this._oppositeScrollbarSize = Math.round(i), this._arrowSize = Math.round(e), this._visibleSize = s, this._scrollSize = r, this._scrollPosition = n, this._computedAvailableSize = 0, this._computedIsNeeded = !1, this._computedSliderSize = 0, this._computedSliderRatio = 0, this._computedSliderPosition = 0, this._refreshComputedValues();
							}
							clone() {
								return new i(this._arrowSize, this._scrollbarSize, this._oppositeScrollbarSize, this._visibleSize, this._scrollSize, this._scrollPosition);
							}
							setVisibleSize(e) {
								const t = Math.round(e);
								return this._visibleSize !== t && (this._visibleSize = t, this._refreshComputedValues(), !0);
							}
							setScrollSize(e) {
								const t = Math.round(e);
								return this._scrollSize !== t && (this._scrollSize = t, this._refreshComputedValues(), !0);
							}
							setScrollPosition(e) {
								const t = Math.round(e);
								return this._scrollPosition !== t && (this._scrollPosition = t, this._refreshComputedValues(), !0);
							}
							setScrollbarSize(e) {
								this._scrollbarSize = Math.round(e);
							}
							setOppositeScrollbarSize(e) {
								this._oppositeScrollbarSize = Math.round(e);
							}
							static _computeValues(e, t, i, s, r) {
								const n = Math.max(0, i - e), o = Math.max(0, n - 2 * t), a = s > 0 && s > i;
								if (!a) return {
									computedAvailableSize: Math.round(n),
									computedIsNeeded: a,
									computedSliderSize: Math.round(o),
									computedSliderRatio: 0,
									computedSliderPosition: 0
								};
								const l = Math.round(Math.max(20, Math.floor(i * o / s))), h = (o - l) / (s - i), c = r * h;
								return {
									computedAvailableSize: Math.round(n),
									computedIsNeeded: a,
									computedSliderSize: Math.round(l),
									computedSliderRatio: h,
									computedSliderPosition: Math.round(c)
								};
							}
							_refreshComputedValues() {
								const e = i._computeValues(this._oppositeScrollbarSize, this._arrowSize, this._visibleSize, this._scrollSize, this._scrollPosition);
								this._computedAvailableSize = e.computedAvailableSize, this._computedIsNeeded = e.computedIsNeeded, this._computedSliderSize = e.computedSliderSize, this._computedSliderRatio = e.computedSliderRatio, this._computedSliderPosition = e.computedSliderPosition;
							}
							getArrowSize() {
								return this._arrowSize;
							}
							getScrollPosition() {
								return this._scrollPosition;
							}
							getRectangleLargeSize() {
								return this._computedAvailableSize;
							}
							getRectangleSmallSize() {
								return this._scrollbarSize;
							}
							isNeeded() {
								return this._computedIsNeeded;
							}
							getSliderSize() {
								return this._computedSliderSize;
							}
							getSliderPosition() {
								return this._computedSliderPosition;
							}
							getDesiredScrollPositionFromOffset(e) {
								if (!this._computedIsNeeded) return 0;
								const t = e - this._arrowSize - this._computedSliderSize / 2;
								return Math.round(t / this._computedSliderRatio);
							}
							getDesiredScrollPositionFromOffsetPaged(e) {
								if (!this._computedIsNeeded) return 0;
								const t = e - this._arrowSize;
								let i = this._scrollPosition;
								return t < this._computedSliderPosition ? i -= this._visibleSize : i += this._visibleSize, i;
							}
							getDesiredScrollPositionFromDelta(e) {
								if (!this._computedIsNeeded) return 0;
								const t = this._computedSliderPosition + e;
								return Math.round(t / this._computedSliderRatio);
							}
						}
						t.ScrollbarState = i;
					},
					79: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.ScrollbarVisibilityController = void 0;
						const s = i(1758), r = i(7150), n = i(9881);
						class o extends r.Disposable {
							constructor(e, t, i) {
								super(), this._visibility = e, this._visibleClassName = t, this._invisibleClassName = i, this._domNode = null, this._isVisible = !1, this._isNeeded = !1, this._rawShouldBeVisible = !1, this._shouldBeVisible = !1, this._revealTimer = this._register(new s.TimeoutTimer());
							}
							setVisibility(e) {
								this._visibility !== e && (this._visibility = e, this._updateShouldBeVisible());
							}
							setShouldBeVisible(e) {
								this._rawShouldBeVisible = e, this._updateShouldBeVisible();
							}
							_applyVisibilitySetting() {
								return this._visibility !== n.ScrollbarVisibility.Hidden && (this._visibility === n.ScrollbarVisibility.Visible || this._rawShouldBeVisible);
							}
							_updateShouldBeVisible() {
								const e = this._applyVisibilitySetting();
								this._shouldBeVisible !== e && (this._shouldBeVisible = e, this.ensureVisibility());
							}
							setIsNeeded(e) {
								this._isNeeded !== e && (this._isNeeded = e, this.ensureVisibility());
							}
							setDomNode(e) {
								this._domNode = e, this._domNode.setClassName(this._invisibleClassName), this.setShouldBeVisible(!1);
							}
							ensureVisibility() {
								this._isNeeded ? this._shouldBeVisible ? this._reveal() : this._hide(!0) : this._hide(!1);
							}
							_reveal() {
								this._isVisible || (this._isVisible = !0, this._revealTimer.setIfNotSet((() => {
									this._domNode?.setClassName(this._visibleClassName);
								}), 0));
							}
							_hide(e) {
								this._revealTimer.cancel(), this._isVisible && (this._isVisible = !1, this._domNode?.setClassName(this._invisibleClassName + (e ? " fade" : "")));
							}
						}
						t.ScrollbarVisibilityController = o;
					},
					5473: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.VerticalScrollbar = void 0;
						const s = i(8801), r = i(8245), n = i(9881);
						class o extends s.AbstractScrollbar {
							constructor(e, t, i) {
								const s = e.getScrollDimensions(), o = e.getCurrentScrollPosition();
								if (super({
									lazyRender: t.lazyRender,
									host: i,
									scrollbarState: new r.ScrollbarState(t.verticalHasArrows ? t.arrowSize : 0, t.vertical === n.ScrollbarVisibility.Hidden ? 0 : t.verticalScrollbarSize, 0, s.height, s.scrollHeight, o.scrollTop),
									visibility: t.vertical,
									extraScrollbarClassName: "vertical",
									scrollable: e,
									scrollByPage: t.scrollByPage
								}), t.verticalHasArrows) throw new Error("horizontalHasArrows is not supported in xterm.js");
								this._createSlider(0, Math.floor((t.verticalScrollbarSize - t.verticalSliderSize) / 2), t.verticalSliderSize, void 0);
							}
							_updateSlider(e, t) {
								this.slider.setHeight(e), this.slider.setTop(t);
							}
							_renderDomNode(e, t) {
								this.domNode.setWidth(t), this.domNode.setHeight(e), this.domNode.setRight(0), this.domNode.setTop(0);
							}
							onDidScroll(e) {
								return this._shouldRender = this._onElementScrollSize(e.scrollHeight) || this._shouldRender, this._shouldRender = this._onElementScrollPosition(e.scrollTop) || this._shouldRender, this._shouldRender = this._onElementSize(e.height) || this._shouldRender, this._shouldRender;
							}
							_pointerDownRelativePosition(e, t) {
								return t;
							}
							_sliderPointerPosition(e) {
								return e.pageY;
							}
							_sliderOrthogonalPointerPosition(e) {
								return e.pageX;
							}
							_updateScrollbarSize(e) {
								this.slider.setWidth(e);
							}
							writeScrollPosition(e, t) {
								e.scrollTop = t;
							}
							updateOptions(e) {
								this.updateScrollbarSize(e.vertical === n.ScrollbarVisibility.Hidden ? 0 : e.verticalScrollbarSize), this._scrollbarState.setOppositeScrollbarSize(0), this._visibilityController.setVisibility(e.vertical), this._scrollByPage = e.scrollByPage;
							}
						}
						t.VerticalScrollbar = o;
					},
					8286: function(e, t, i) {
						var s = this && this.__createBinding || (Object.create ? function(e, t, i, s) {
							void 0 === s && (s = i);
							var r = Object.getOwnPropertyDescriptor(t, i);
							r && !("get" in r ? !t.__esModule : r.writable || r.configurable) || (r = {
								enumerable: !0,
								get: function() {
									return t[i];
								}
							}), Object.defineProperty(e, s, r);
						} : function(e, t, i, s) {
							void 0 === s && (s = i), e[s] = t[i];
						}), r = this && this.__setModuleDefault || (Object.create ? function(e, t) {
							Object.defineProperty(e, "default", {
								enumerable: !0,
								value: t
							});
						} : function(e, t) {
							e.default = t;
						}), n = this && this.__importStar || function(e) {
							if (e && e.__esModule) return e;
							var t = {};
							if (null != e) for (var i in e) "default" !== i && Object.prototype.hasOwnProperty.call(e, i) && s(t, e, i);
							return r(t, e), t;
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.Widget = void 0;
						const o = n(i(7093)), a = i(5394), l = i(5964), h = i(8594), c = i(7150);
						class d extends c.Disposable {
							onclick(e, t) {
								this._register(o.addDisposableListener(e, o.EventType.CLICK, ((i) => t(new l.StandardMouseEvent(o.getWindow(e), i)))));
							}
							onmousedown(e, t) {
								this._register(o.addDisposableListener(e, o.EventType.MOUSE_DOWN, ((i) => t(new l.StandardMouseEvent(o.getWindow(e), i)))));
							}
							onmouseover(e, t) {
								this._register(o.addDisposableListener(e, o.EventType.MOUSE_OVER, ((i) => t(new l.StandardMouseEvent(o.getWindow(e), i)))));
							}
							onmouseleave(e, t) {
								this._register(o.addDisposableListener(e, o.EventType.MOUSE_LEAVE, ((i) => t(new l.StandardMouseEvent(o.getWindow(e), i)))));
							}
							onkeydown(e, t) {
								this._register(o.addDisposableListener(e, o.EventType.KEY_DOWN, ((e) => t(new a.StandardKeyboardEvent(e)))));
							}
							onkeyup(e, t) {
								this._register(o.addDisposableListener(e, o.EventType.KEY_UP, ((e) => t(new a.StandardKeyboardEvent(e)))));
							}
							oninput(e, t) {
								this._register(o.addDisposableListener(e, o.EventType.INPUT, t));
							}
							onblur(e, t) {
								this._register(o.addDisposableListener(e, o.EventType.BLUR, t));
							}
							onfocus(e, t) {
								this._register(o.addDisposableListener(e, o.EventType.FOCUS, t));
							}
							onchange(e, t) {
								this._register(o.addDisposableListener(e, o.EventType.CHANGE, t));
							}
							ignoreGesture(e) {
								return h.Gesture.ignoreTarget(e);
							}
						}
						t.Widget = d;
					},
					4693: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.mainWindow = void 0, t.ensureCodeWindow = function(e, t) {}, t.mainWindow = "object" == typeof window ? window : globalThis;
					},
					3058: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.Permutation = t.CallbackIterable = t.ArrayQueue = t.booleanComparator = t.numberComparator = t.CompareResult = void 0, t.tail = function(e, t = 0) {
							return e[e.length - (1 + t)];
						}, t.tail2 = function(e) {
							if (0 === e.length) throw new Error("Invalid tail call");
							return [e.slice(0, e.length - 1), e[e.length - 1]];
						}, t.equals = function(e, t, i = (e, t) => e === t) {
							if (e === t) return !0;
							if (!e || !t) return !1;
							if (e.length !== t.length) return !1;
							for (let s = 0, r = e.length; s < r; s++) if (!i(e[s], t[s])) return !1;
							return !0;
						}, t.removeFastWithoutKeepingOrder = function(e, t) {
							const i = e.length - 1;
							t < i && (e[t] = e[i]), e.pop();
						}, t.binarySearch = function(e, t, i) {
							return n(e.length, ((s) => i(e[s], t)));
						}, t.binarySearch2 = n, t.quickSelect = function e(t, i, s) {
							if ((t |= 0) >= i.length) throw new TypeError("invalid index");
							const r = i[Math.floor(i.length * Math.random())], n = [], o = [], a = [];
							for (const e of i) {
								const t = s(e, r);
								t < 0 ? n.push(e) : t > 0 ? o.push(e) : a.push(e);
							}
							return t < n.length ? e(t, n, s) : t < n.length + a.length ? a[0] : e(t - (n.length + a.length), o, s);
						}, t.groupBy = function(e, t) {
							const i = [];
							let s;
							for (const r of e.slice(0).sort(t)) s && 0 === t(s[0], r) ? s.push(r) : (s = [r], i.push(s));
							return i;
						}, t.groupAdjacentBy = function* (e, t) {
							let i, s;
							for (const r of e) void 0 !== s && t(s, r) ? i.push(r) : (i && (yield i), i = [r]), s = r;
							i && (yield i);
						}, t.forEachAdjacent = function(e, t) {
							for (let i = 0; i <= e.length; i++) t(0 === i ? void 0 : e[i - 1], i === e.length ? void 0 : e[i]);
						}, t.forEachWithNeighbors = function(e, t) {
							for (let i = 0; i < e.length; i++) t(0 === i ? void 0 : e[i - 1], e[i], i + 1 === e.length ? void 0 : e[i + 1]);
						}, t.sortedDiff = o, t.delta = function(e, t, i) {
							const s = o(e, t, i), r = [], n = [];
							for (const t of s) r.push(...e.slice(t.start, t.start + t.deleteCount)), n.push(...t.toInsert);
							return {
								removed: r,
								added: n
							};
						}, t.top = function(e, t, i) {
							if (0 === i) return [];
							const s = e.slice(0, i).sort(t);
							return a(e, t, s, i, e.length), s;
						}, t.topAsync = function(e, t, i, r, n) {
							return 0 === i ? Promise.resolve([]) : new Promise(((o, l) => {
								(async () => {
									const o = e.length, l = e.slice(0, i).sort(t);
									for (let h = i, c = Math.min(i + r, o); h < o; h = c, c = Math.min(c + r, o)) {
										if (h > i && await new Promise(((e) => setTimeout(e))), n && n.isCancellationRequested) throw new s.CancellationError();
										a(e, t, l, h, c);
									}
									return l;
								})().then(o, l);
							}));
						}, t.coalesce = function(e) {
							return e.filter(((e) => !!e));
						}, t.coalesceInPlace = function(e) {
							let t = 0;
							for (let i = 0; i < e.length; i++) e[i] && (e[t] = e[i], t += 1);
							e.length = t;
						}, t.move = function(e, t, i) {
							e.splice(i, 0, e.splice(t, 1)[0]);
						}, t.isFalsyOrEmpty = function(e) {
							return !Array.isArray(e) || 0 === e.length;
						}, t.isNonEmptyArray = function(e) {
							return Array.isArray(e) && e.length > 0;
						}, t.distinct = function(e, t = (e) => e) {
							const i = /* @__PURE__ */ new Set();
							return e.filter(((e) => {
								const s = t(e);
								return !i.has(s) && (i.add(s), !0);
							}));
						}, t.uniqueFilter = function(e) {
							const t = /* @__PURE__ */ new Set();
							return (i) => {
								const s = e(i);
								return !t.has(s) && (t.add(s), !0);
							};
						}, t.firstOrDefault = function(e, t) {
							return e.length > 0 ? e[0] : t;
						}, t.lastOrDefault = function(e, t) {
							return e.length > 0 ? e[e.length - 1] : t;
						}, t.commonPrefixLength = function(e, t, i = (e, t) => e === t) {
							let s = 0;
							for (let r = 0, n = Math.min(e.length, t.length); r < n && i(e[r], t[r]); r++) s++;
							return s;
						}, t.range = function(e, t) {
							let i = "number" == typeof t ? e : 0;
							"number" == typeof t ? i = e : (i = 0, t = e);
							const s = [];
							if (i <= t) for (let e = i; e < t; e++) s.push(e);
							else for (let e = i; e > t; e--) s.push(e);
							return s;
						}, t.index = function(e, t, i) {
							return e.reduce(((e, s) => (e[t(s)] = i ? i(s) : s, e)), Object.create(null));
						}, t.insert = function(e, t) {
							return e.push(t), () => l(e, t);
						}, t.remove = l, t.arrayInsert = function(e, t, i) {
							const s = e.slice(0, t), r = e.slice(t);
							return s.concat(i, r);
						}, t.shuffle = function(e, t) {
							let i;
							if ("number" == typeof t) {
								let e = t;
								i = () => {
									const t = 179426549 * Math.sin(e++);
									return t - Math.floor(t);
								};
							} else i = Math.random;
							for (let t = e.length - 1; t > 0; t -= 1) {
								const s = Math.floor(i() * (t + 1)), r = e[t];
								e[t] = e[s], e[s] = r;
							}
						}, t.pushToStart = function(e, t) {
							const i = e.indexOf(t);
							i > -1 && (e.splice(i, 1), e.unshift(t));
						}, t.pushToEnd = function(e, t) {
							const i = e.indexOf(t);
							i > -1 && (e.splice(i, 1), e.push(t));
						}, t.pushMany = function(e, t) {
							for (const i of t) e.push(i);
						}, t.mapArrayOrNot = function(e, t) {
							return Array.isArray(e) ? e.map(t) : t(e);
						}, t.asArray = function(e) {
							return Array.isArray(e) ? e : [e];
						}, t.getRandomElement = function(e) {
							return e[Math.floor(Math.random() * e.length)];
						}, t.insertInto = h, t.splice = function(e, t, i, s) {
							const r = c(e, t);
							let n = e.splice(r, i);
							return void 0 === n && (n = []), h(e, r, s), n;
						}, t.compareBy = function(e, t) {
							return (i, s) => t(e(i), e(s));
						}, t.tieBreakComparators = function(...e) {
							return (t, i) => {
								for (const s of e) {
									const e = s(t, i);
									if (!d.isNeitherLessOrGreaterThan(e)) return e;
								}
								return d.neitherLessOrGreaterThan;
							};
						}, t.reverseOrder = function(e) {
							return (t, i) => -e(t, i);
						};
						const s = i(9807), r = i(8297);
						function n(e, t) {
							let i = 0, s = e - 1;
							for (; i <= s;) {
								const e = (i + s) / 2 | 0, r = t(e);
								if (r < 0) i = e + 1;
								else {
									if (!(r > 0)) return e;
									s = e - 1;
								}
							}
							return -(i + 1);
						}
						function o(e, t, i) {
							const s = [];
							function r(e, t, i) {
								if (0 === t && 0 === i.length) return;
								const r = s[s.length - 1];
								r && r.start + r.deleteCount === e ? (r.deleteCount += t, r.toInsert.push(...i)) : s.push({
									start: e,
									deleteCount: t,
									toInsert: i
								});
							}
							let n = 0, o = 0;
							for (;;) {
								if (n === e.length) {
									r(n, 0, t.slice(o));
									break;
								}
								if (o === t.length) {
									r(n, e.length - n, []);
									break;
								}
								const s = e[n], a = t[o], l = i(s, a);
								0 === l ? (n += 1, o += 1) : l < 0 ? (r(n, 1, []), n += 1) : l > 0 && (r(n, 0, [a]), o += 1);
							}
							return s;
						}
						function a(e, t, i, s, n) {
							for (const o = i.length; s < n; s++) {
								const n = e[s];
								if (t(n, i[o - 1]) < 0) {
									i.pop();
									const e = (0, r.findFirstIdxMonotonousOrArrLen)(i, ((e) => t(n, e) < 0));
									i.splice(e, 0, n);
								}
							}
						}
						function l(e, t) {
							const i = e.indexOf(t);
							if (i > -1) return e.splice(i, 1), t;
						}
						function h(e, t, i) {
							const s = c(e, t), r = e.length, n = i.length;
							e.length = r + n;
							for (let t = r - 1; t >= s; t--) e[t + n] = e[t];
							for (let t = 0; t < n; t++) e[t + s] = i[t];
						}
						function c(e, t) {
							return t < 0 ? Math.max(t + e.length, 0) : Math.min(t, e.length);
						}
						var d;
						(function(e) {
							e.isLessThan = function(e) {
								return e < 0;
							}, e.isLessThanOrEqual = function(e) {
								return e <= 0;
							}, e.isGreaterThan = function(e) {
								return e > 0;
							}, e.isNeitherLessOrGreaterThan = function(e) {
								return 0 === e;
							}, e.greaterThan = 1, e.lessThan = -1, e.neitherLessOrGreaterThan = 0;
						})(d || (t.CompareResult = d = {})), t.numberComparator = (e, t) => e - t, t.booleanComparator = (e, i) => (0, t.numberComparator)(e ? 1 : 0, i ? 1 : 0), t.ArrayQueue = class {
							constructor(e) {
								this.items = e, this.firstIdx = 0, this.lastIdx = this.items.length - 1;
							}
							get length() {
								return this.lastIdx - this.firstIdx + 1;
							}
							takeWhile(e) {
								let t = this.firstIdx;
								for (; t < this.items.length && e(this.items[t]);) t++;
								const i = t === this.firstIdx ? null : this.items.slice(this.firstIdx, t);
								return this.firstIdx = t, i;
							}
							takeFromEndWhile(e) {
								let t = this.lastIdx;
								for (; t >= 0 && e(this.items[t]);) t--;
								const i = t === this.lastIdx ? null : this.items.slice(t + 1, this.lastIdx + 1);
								return this.lastIdx = t, i;
							}
							peek() {
								if (0 !== this.length) return this.items[this.firstIdx];
							}
							peekLast() {
								if (0 !== this.length) return this.items[this.lastIdx];
							}
							dequeue() {
								const e = this.items[this.firstIdx];
								return this.firstIdx++, e;
							}
							removeLast() {
								const e = this.items[this.lastIdx];
								return this.lastIdx--, e;
							}
							takeCount(e) {
								const t = this.items.slice(this.firstIdx, this.firstIdx + e);
								return this.firstIdx += e, t;
							}
						};
						class u {
							static {
								this.empty = new u(((e) => {}));
							}
							constructor(e) {
								this.iterate = e;
							}
							forEach(e) {
								this.iterate(((t) => (e(t), !0)));
							}
							toArray() {
								const e = [];
								return this.iterate(((t) => (e.push(t), !0))), e;
							}
							filter(e) {
								return new u(((t) => this.iterate(((i) => !e(i) || t(i)))));
							}
							map(e) {
								return new u(((t) => this.iterate(((i) => t(e(i))))));
							}
							some(e) {
								let t = !1;
								return this.iterate(((i) => (t = e(i), !t))), t;
							}
							findFirst(e) {
								let t;
								return this.iterate(((i) => !e(i) || (t = i, !1))), t;
							}
							findLast(e) {
								let t;
								return this.iterate(((i) => (e(i) && (t = i), !0))), t;
							}
							findLastMaxBy(e) {
								let t, i = !0;
								return this.iterate(((s) => ((i || d.isGreaterThan(e(s, t))) && (i = !1, t = s), !0))), t;
							}
						}
						t.CallbackIterable = u;
						class _ {
							constructor(e) {
								this._indexMap = e;
							}
							static createSortPermutation(e, t) {
								const i = Array.from(e.keys()).sort(((i, s) => t(e[i], e[s])));
								return new _(i);
							}
							apply(e) {
								return e.map(((t, i) => e[this._indexMap[i]]));
							}
							inverse() {
								const e = this._indexMap.slice();
								for (let t = 0; t < this._indexMap.length; t++) e[this._indexMap[t]] = t;
								return new _(e);
							}
						}
						t.Permutation = _;
					},
					8297: (e, t) => {
						function i(e, t, i = e.length - 1) {
							for (let s = i; s >= 0; s--) if (t(e[s])) return s;
							return -1;
						}
						function s(e, t, i = 0, s = e.length) {
							let r = i, n = s;
							for (; r < n;) {
								const i = Math.floor((r + n) / 2);
								t(e[i]) ? r = i + 1 : n = i;
							}
							return r - 1;
						}
						function r(e, t, i = 0, s = e.length) {
							let r = i, n = s;
							for (; r < n;) {
								const i = Math.floor((r + n) / 2);
								t(e[i]) ? n = i : r = i + 1;
							}
							return r;
						}
						Object.defineProperty(t, "__esModule", { value: !0 }), t.MonotonousArray = void 0, t.findLast = function(e, t) {
							const s = i(e, t);
							if (-1 !== s) return e[s];
						}, t.findLastIdx = i, t.findLastMonotonous = function(e, t) {
							const i = s(e, t);
							return -1 === i ? void 0 : e[i];
						}, t.findLastIdxMonotonous = s, t.findFirstMonotonous = function(e, t) {
							const i = r(e, t);
							return i === e.length ? void 0 : e[i];
						}, t.findFirstIdxMonotonousOrArrLen = r, t.findFirstIdxMonotonous = function(e, t, i = 0, s = e.length) {
							const n = r(e, t, i, s);
							return n === e.length ? -1 : n;
						}, t.findFirstMax = o, t.findLastMax = function(e, t) {
							if (0 === e.length) return;
							let i = e[0];
							for (let s = 1; s < e.length; s++) {
								const r = e[s];
								t(r, i) >= 0 && (i = r);
							}
							return i;
						}, t.findFirstMin = function(e, t) {
							return o(e, ((e, i) => -t(e, i)));
						}, t.findMaxIdx = function(e, t) {
							if (0 === e.length) return -1;
							let i = 0;
							for (let s = 1; s < e.length; s++) t(e[s], e[i]) > 0 && (i = s);
							return i;
						}, t.mapFindFirst = function(e, t) {
							for (const i of e) {
								const e = t(i);
								if (void 0 !== e) return e;
							}
						};
						class n {
							static {
								this.assertInvariants = !1;
							}
							constructor(e) {
								this._array = e, this._findLastMonotonousLastIdx = 0;
							}
							findLastMonotonous(e) {
								if (n.assertInvariants) {
									if (this._prevFindLastPredicate) {
										for (const t of this._array) if (this._prevFindLastPredicate(t) && !e(t)) throw new Error("MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.");
									}
									this._prevFindLastPredicate = e;
								}
								const t = s(this._array, e, this._findLastMonotonousLastIdx);
								return this._findLastMonotonousLastIdx = t + 1, -1 === t ? void 0 : this._array[t];
							}
						}
						function o(e, t) {
							if (0 === e.length) return;
							let i = e[0];
							for (let s = 1; s < e.length; s++) {
								const r = e[s];
								t(r, i) > 0 && (i = r);
							}
							return i;
						}
						t.MonotonousArray = n;
					},
					1758: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.AsyncIterableSource = t.CancelableAsyncIterableObject = t.AsyncIterableObject = t.LazyStatefulPromise = t.StatefulPromise = t.Promises = t.DeferredPromise = t.IntervalCounter = t.TaskSequentializer = t.GlobalIdleValue = t.AbstractIdleValue = t._runWhenIdle = t.runWhenGlobalIdle = t.ThrottledWorker = t.RunOnceWorker = t.ProcessTimeRunOnceScheduler = t.RunOnceScheduler = t.IntervalTimer = t.TimeoutTimer = t.LimitedQueue = t.Queue = t.Limiter = t.AutoOpenBarrier = t.Barrier = t.ThrottledDelayer = t.Delayer = t.SequencerByKey = t.Sequencer = t.Throttler = void 0, t.isThenable = c, t.createCancelablePromise = d, t.raceCancellation = function(e, t, i) {
							return new Promise(((s, r) => {
								const n = t.onCancellationRequested((() => {
									n.dispose(), s(i);
								}));
								e.then(s, r).finally((() => n.dispose()));
							}));
						}, t.raceCancellationError = function(e, t) {
							return new Promise(((i, s) => {
								const n = t.onCancellationRequested((() => {
									n.dispose(), s(new r.CancellationError());
								}));
								e.then(i, s).finally((() => n.dispose()));
							}));
						}, t.raceCancellablePromises = async function(e) {
							let t = -1;
							const i = e.map(((e, i) => e.then(((e) => (t = i, e)))));
							try {
								return await Promise.race(i);
							} finally {
								e.forEach(((e, i) => {
									i !== t && e.cancel();
								}));
							}
						}, t.raceTimeout = function(e, t, i) {
							let s;
							const r = setTimeout((() => {
								s?.(void 0), i?.();
							}), t);
							return Promise.race([e.finally((() => clearTimeout(r))), new Promise(((e) => s = e))]);
						}, t.asPromise = function(e) {
							return new Promise(((t, i) => {
								const s = e();
								c(s) ? s.then(t, i) : t(s);
							}));
						}, t.promiseWithResolvers = u, t.timeout = g, t.disposableTimeout = function(e, t = 0, i) {
							const s = setTimeout((() => {
								e(), i && r.dispose();
							}), t), r = (0, o.toDisposable)((() => {
								clearTimeout(s), i?.deleteAndLeak(r);
							}));
							return i?.add(r), r;
						}, t.sequence = function(e) {
							const t = [];
							let i = 0;
							const s = e.length;
							return Promise.resolve(null).then((function r(n) {
								null != n && t.push(n);
								const o = i < s ? e[i++]() : null;
								return o ? o.then(r) : Promise.resolve(t);
							}));
						}, t.first = function(e, t = (e) => !!e, i = null) {
							let s = 0;
							const r = e.length, n = () => {
								if (s >= r) return Promise.resolve(i);
								const o = e[s++];
								return Promise.resolve(o()).then(((e) => t(e) ? Promise.resolve(e) : n()));
							};
							return n();
						}, t.firstParallel = function(e, t = (e) => !!e, i = null) {
							if (0 === e.length) return Promise.resolve(i);
							let s = e.length;
							const r = () => {
								s = -1;
								for (const t of e) t.cancel?.();
							};
							return new Promise(((n, o) => {
								for (const a of e) a.then(((e) => {
									--s >= 0 && t(e) ? (r(), n(e)) : 0 === s && n(i);
								})).catch(((e) => {
									--s >= 0 && (r(), o(e));
								}));
							}));
						}, t.retry = async function(e, t, i) {
							let s;
							for (let r = 0; r < i; r++) try {
								return await e();
							} catch (e) {
								s = e, await g(t);
							}
							throw s;
						}, t.createCancelableAsyncIterable = function(e) {
							const t = new s.CancellationTokenSource(), i = e(t.token);
							return new A(t, (async (e) => {
								const s = t.token.onCancellationRequested((() => {
									s.dispose(), t.dispose(), e.reject(new r.CancellationError());
								}));
								try {
									for await (const s of i) {
										if (t.token.isCancellationRequested) return;
										e.emitOne(s);
									}
									s.dispose(), t.dispose();
								} catch (i) {
									s.dispose(), t.dispose(), e.reject(i);
								}
							}));
						};
						const s = i(8447), r = i(9807), n = i(802), o = i(7150), a = i(8163), l = i(5015), h = i(626);
						function c(e) {
							return !!e && "function" == typeof e.then;
						}
						function d(e) {
							const t = new s.CancellationTokenSource(), i = e(t.token), n = new Promise(((e, s) => {
								const n = t.token.onCancellationRequested((() => {
									n.dispose(), s(new r.CancellationError());
								}));
								Promise.resolve(i).then(((i) => {
									n.dispose(), t.dispose(), e(i);
								}), ((e) => {
									n.dispose(), t.dispose(), s(e);
								}));
							}));
							return new class {
								cancel() {
									t.cancel(), t.dispose();
								}
								then(e, t) {
									return n.then(e, t);
								}
								catch(e) {
									return this.then(void 0, e);
								}
								finally(e) {
									return n.finally(e);
								}
							}();
						}
						function u() {
							let e, t;
							return {
								promise: new Promise(((i, s) => {
									e = i, t = s;
								})),
								resolve: e,
								reject: t
							};
						}
						class _ {
							constructor() {
								this.isDisposed = !1, this.activePromise = null, this.queuedPromise = null, this.queuedPromiseFactory = null;
							}
							queue(e) {
								if (this.isDisposed) return Promise.reject(/* @__PURE__ */ new Error("Throttler is disposed"));
								if (this.activePromise) {
									if (this.queuedPromiseFactory = e, !this.queuedPromise) {
										const e = () => {
											if (this.queuedPromise = null, this.isDisposed) return;
											const e = this.queue(this.queuedPromiseFactory);
											return this.queuedPromiseFactory = null, e;
										};
										this.queuedPromise = new Promise(((t) => {
											this.activePromise.then(e, e).then(t);
										}));
									}
									return new Promise(((e, t) => {
										this.queuedPromise.then(e, t);
									}));
								}
								return this.activePromise = e(), new Promise(((e, t) => {
									this.activePromise.then(((t) => {
										this.activePromise = null, e(t);
									}), ((e) => {
										this.activePromise = null, t(e);
									}));
								}));
							}
							dispose() {
								this.isDisposed = !0;
							}
						}
						t.Throttler = _, t.Sequencer = class {
							constructor() {
								this.current = Promise.resolve(null);
							}
							queue(e) {
								return this.current = this.current.then((() => e()), (() => e()));
							}
						}, t.SequencerByKey = class {
							constructor() {
								this.promiseMap = /* @__PURE__ */ new Map();
							}
							queue(e, t) {
								const i = (this.promiseMap.get(e) ?? Promise.resolve()).catch((() => {})).then(t).finally((() => {
									this.promiseMap.get(e) === i && this.promiseMap.delete(e);
								}));
								return this.promiseMap.set(e, i), i;
							}
						};
						class f {
							constructor(e) {
								this.defaultDelay = e, this.deferred = null, this.completionPromise = null, this.doResolve = null, this.doReject = null, this.task = null;
							}
							trigger(e, t = this.defaultDelay) {
								this.task = e, this.cancelTimeout(), this.completionPromise || (this.completionPromise = new Promise(((e, t) => {
									this.doResolve = e, this.doReject = t;
								})).then((() => {
									if (this.completionPromise = null, this.doResolve = null, this.task) {
										const e = this.task;
										return this.task = null, e();
									}
								})));
								const i = () => {
									this.deferred = null, this.doResolve?.(null);
								};
								return this.deferred = t === l.MicrotaskDelay ? ((e) => {
									let t = !0;
									return queueMicrotask((() => {
										t && (t = !1, e());
									})), {
										isTriggered: () => t,
										dispose: () => {
											t = !1;
										}
									};
								})(i) : ((e, t) => {
									let i = !0;
									const s = setTimeout((() => {
										i = !1, t();
									}), e);
									return {
										isTriggered: () => i,
										dispose: () => {
											clearTimeout(s), i = !1;
										}
									};
								})(t, i), this.completionPromise;
							}
							isTriggered() {
								return !!this.deferred?.isTriggered();
							}
							cancel() {
								this.cancelTimeout(), this.completionPromise && (this.doReject?.(new r.CancellationError()), this.completionPromise = null);
							}
							cancelTimeout() {
								this.deferred?.dispose(), this.deferred = null;
							}
							dispose() {
								this.cancel();
							}
						}
						t.Delayer = f, t.ThrottledDelayer = class {
							constructor(e) {
								this.delayer = new f(e), this.throttler = new _();
							}
							trigger(e, t) {
								return this.delayer.trigger((() => this.throttler.queue(e)), t);
							}
							isTriggered() {
								return this.delayer.isTriggered();
							}
							cancel() {
								this.delayer.cancel();
							}
							dispose() {
								this.delayer.dispose(), this.throttler.dispose();
							}
						};
						class p {
							constructor() {
								this._isOpen = !1, this._promise = new Promise(((e, t) => {
									this._completePromise = e;
								}));
							}
							isOpen() {
								return this._isOpen;
							}
							open() {
								this._isOpen = !0, this._completePromise(!0);
							}
							wait() {
								return this._promise;
							}
						}
						function g(e, t) {
							return t ? new Promise(((i, s) => {
								const n = setTimeout((() => {
									o.dispose(), i();
								}), e), o = t.onCancellationRequested((() => {
									clearTimeout(n), o.dispose(), s(new r.CancellationError());
								}));
							})) : d(((t) => g(e, t)));
						}
						t.Barrier = p, t.AutoOpenBarrier = class extends p {
							constructor(e) {
								super(), this._timeout = setTimeout((() => this.open()), e);
							}
							open() {
								clearTimeout(this._timeout), super.open();
							}
						};
						class m {
							constructor(e) {
								this._size = 0, this._isDisposed = !1, this.maxDegreeOfParalellism = e, this.outstandingPromises = [], this.runningPromises = 0, this._onDrained = new n.Emitter();
							}
							whenIdle() {
								return this.size > 0 ? n.Event.toPromise(this.onDrained) : Promise.resolve();
							}
							get onDrained() {
								return this._onDrained.event;
							}
							get size() {
								return this._size;
							}
							queue(e) {
								if (this._isDisposed) throw new Error("Object has been disposed");
								return this._size++, new Promise(((t, i) => {
									this.outstandingPromises.push({
										factory: e,
										c: t,
										e: i
									}), this.consume();
								}));
							}
							consume() {
								for (; this.outstandingPromises.length && this.runningPromises < this.maxDegreeOfParalellism;) {
									const e = this.outstandingPromises.shift();
									this.runningPromises++;
									const t = e.factory();
									t.then(e.c, e.e), t.then((() => this.consumed()), (() => this.consumed()));
								}
							}
							consumed() {
								this._isDisposed || (this.runningPromises--, 0 == --this._size && this._onDrained.fire(), this.outstandingPromises.length > 0 && this.consume());
							}
							clear() {
								if (this._isDisposed) throw new Error("Object has been disposed");
								this.outstandingPromises.length = 0, this._size = this.runningPromises;
							}
							dispose() {
								this._isDisposed = !0, this.outstandingPromises.length = 0, this._size = 0, this._onDrained.dispose();
							}
						}
						t.Limiter = m, t.Queue = class extends m {
							constructor() {
								super(1);
							}
						}, t.LimitedQueue = class {
							constructor() {
								this.sequentializer = new C(), this.tasks = 0;
							}
							queue(e) {
								return this.sequentializer.isRunning() ? this.sequentializer.queue((() => this.sequentializer.run(this.tasks++, e()))) : this.sequentializer.run(this.tasks++, e());
							}
						}, t.TimeoutTimer = class {
							constructor(e, t) {
								this._isDisposed = !1, this._token = -1, "function" == typeof e && "number" == typeof t && this.setIfNotSet(e, t);
							}
							dispose() {
								this.cancel(), this._isDisposed = !0;
							}
							cancel() {
								-1 !== this._token && (clearTimeout(this._token), this._token = -1);
							}
							cancelAndSet(e, t) {
								if (this._isDisposed) throw new r.BugIndicatingError("Calling 'cancelAndSet' on a disposed TimeoutTimer");
								this.cancel(), this._token = setTimeout((() => {
									this._token = -1, e();
								}), t);
							}
							setIfNotSet(e, t) {
								if (this._isDisposed) throw new r.BugIndicatingError("Calling 'setIfNotSet' on a disposed TimeoutTimer");
								-1 === this._token && (this._token = setTimeout((() => {
									this._token = -1, e();
								}), t));
							}
						}, t.IntervalTimer = class {
							constructor() {
								this.disposable = void 0, this.isDisposed = !1;
							}
							cancel() {
								this.disposable?.dispose(), this.disposable = void 0;
							}
							cancelAndSet(e, t, i = globalThis) {
								if (this.isDisposed) throw new r.BugIndicatingError("Calling 'cancelAndSet' on a disposed IntervalTimer");
								this.cancel();
								const s = i.setInterval((() => {
									e();
								}), t);
								this.disposable = (0, o.toDisposable)((() => {
									i.clearInterval(s), this.disposable = void 0;
								}));
							}
							dispose() {
								this.cancel(), this.isDisposed = !0;
							}
						};
						class v {
							constructor(e, t) {
								this.timeoutToken = -1, this.runner = e, this.timeout = t, this.timeoutHandler = this.onTimeout.bind(this);
							}
							dispose() {
								this.cancel(), this.runner = null;
							}
							cancel() {
								this.isScheduled() && (clearTimeout(this.timeoutToken), this.timeoutToken = -1);
							}
							schedule(e = this.timeout) {
								this.cancel(), this.timeoutToken = setTimeout(this.timeoutHandler, e);
							}
							get delay() {
								return this.timeout;
							}
							set delay(e) {
								this.timeout = e;
							}
							isScheduled() {
								return -1 !== this.timeoutToken;
							}
							flush() {
								this.isScheduled() && (this.cancel(), this.doRun());
							}
							onTimeout() {
								this.timeoutToken = -1, this.runner && this.doRun();
							}
							doRun() {
								this.runner?.();
							}
						}
						t.RunOnceScheduler = v, t.ProcessTimeRunOnceScheduler = class {
							constructor(e, t) {
								t % 1e3 != 0 && console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${t}ms is not a multiple of 1000ms.`), this.runner = e, this.timeout = t, this.counter = 0, this.intervalToken = -1, this.intervalHandler = this.onInterval.bind(this);
							}
							dispose() {
								this.cancel(), this.runner = null;
							}
							cancel() {
								this.isScheduled() && (clearInterval(this.intervalToken), this.intervalToken = -1);
							}
							schedule(e = this.timeout) {
								e % 1e3 != 0 && console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${e}ms is not a multiple of 1000ms.`), this.cancel(), this.counter = Math.ceil(e / 1e3), this.intervalToken = setInterval(this.intervalHandler, 1e3);
							}
							isScheduled() {
								return -1 !== this.intervalToken;
							}
							onInterval() {
								this.counter--, this.counter > 0 || (clearInterval(this.intervalToken), this.intervalToken = -1, this.runner?.());
							}
						}, t.RunOnceWorker = class extends v {
							constructor(e, t) {
								super(e, t), this.units = [];
							}
							work(e) {
								this.units.push(e), this.isScheduled() || this.schedule();
							}
							doRun() {
								const e = this.units;
								this.units = [], this.runner?.(e);
							}
							dispose() {
								this.units = [], super.dispose();
							}
						};
						class S extends o.Disposable {
							constructor(e, t) {
								super(), this.options = e, this.handler = t, this.pendingWork = [], this.throttler = this._register(new o.MutableDisposable()), this.disposed = !1;
							}
							get pending() {
								return this.pendingWork.length;
							}
							work(e) {
								if (this.disposed) return !1;
								if ("number" == typeof this.options.maxBufferedWork) {
									if (this.throttler.value) {
										if (this.pending + e.length > this.options.maxBufferedWork) return !1;
									} else if (this.pending + e.length - this.options.maxWorkChunkSize > this.options.maxBufferedWork) return !1;
								}
								for (const t of e) this.pendingWork.push(t);
								return this.throttler.value || this.doWork(), !0;
							}
							doWork() {
								this.handler(this.pendingWork.splice(0, this.options.maxWorkChunkSize)), this.pendingWork.length > 0 && (this.throttler.value = new v((() => {
									this.throttler.clear(), this.doWork();
								}), this.options.throttleDelay), this.throttler.value.schedule());
							}
							dispose() {
								super.dispose(), this.disposed = !0;
							}
						}
						t.ThrottledWorker = S, "function" != typeof globalThis.requestIdleCallback || "function" != typeof globalThis.cancelIdleCallback ? t._runWhenIdle = (e, t) => {
							(0, a.setTimeout0)((() => {
								if (i) return;
								const e = Date.now() + 15;
								t(Object.freeze({
									didTimeout: !0,
									timeRemaining: () => Math.max(0, e - Date.now())
								}));
							}));
							let i = !1;
							return { dispose() {
								i || (i = !0);
							} };
						} : t._runWhenIdle = (e, t, i) => {
							const s = e.requestIdleCallback(t, "number" == typeof i ? { timeout: i } : void 0);
							let r = !1;
							return { dispose() {
								r || (r = !0, e.cancelIdleCallback(s));
							} };
						}, t.runWhenGlobalIdle = (e) => (0, t._runWhenIdle)(globalThis, e);
						class b {
							constructor(e, i) {
								this._didRun = !1, this._executor = () => {
									try {
										this._value = i();
									} catch (e) {
										this._error = e;
									} finally {
										this._didRun = !0;
									}
								}, this._handle = (0, t._runWhenIdle)(e, (() => this._executor()));
							}
							dispose() {
								this._handle.dispose();
							}
							get value() {
								if (this._didRun || (this._handle.dispose(), this._executor()), this._error) throw this._error;
								return this._value;
							}
							get isInitialized() {
								return this._didRun;
							}
						}
						t.AbstractIdleValue = b, t.GlobalIdleValue = class extends b {
							constructor(e) {
								super(globalThis, e);
							}
						};
						class C {
							isRunning(e) {
								return "number" == typeof e ? this._running?.taskId === e : !!this._running;
							}
							get running() {
								return this._running?.promise;
							}
							cancelRunning() {
								this._running?.cancel();
							}
							run(e, t, i) {
								return this._running = {
									taskId: e,
									cancel: () => i?.(),
									promise: t
								}, t.then((() => this.doneRunning(e)), (() => this.doneRunning(e))), t;
							}
							doneRunning(e) {
								this._running && e === this._running.taskId && (this._running = void 0, this.runQueued());
							}
							runQueued() {
								if (this._queued) {
									const e = this._queued;
									this._queued = void 0, e.run().then(e.promiseResolve, e.promiseReject);
								}
							}
							queue(e) {
								if (this._queued) this._queued.run = e;
								else {
									const { promise: t, resolve: i, reject: s } = u();
									this._queued = {
										run: e,
										promise: t,
										promiseResolve: i,
										promiseReject: s
									};
								}
								return this._queued.promise;
							}
							hasQueued() {
								return !!this._queued;
							}
							async join() {
								return this._queued?.promise ?? this._running?.promise;
							}
						}
						var y, w, E;
						t.TaskSequentializer = C, t.IntervalCounter = class {
							constructor(e, t = () => Date.now()) {
								this.interval = e, this.nowFn = t, this.lastIncrementTime = 0, this.value = 0;
							}
							increment() {
								const e = this.nowFn();
								return e - this.lastIncrementTime > this.interval && (this.lastIncrementTime = e, this.value = 0), this.value++, this.value;
							}
						}, function(e) {
							e[e.Resolved = 0] = "Resolved", e[e.Rejected = 1] = "Rejected";
						}(y || (y = {}));
						class D {
							get isRejected() {
								return this.outcome?.outcome === y.Rejected;
							}
							get isResolved() {
								return this.outcome?.outcome === y.Resolved;
							}
							get isSettled() {
								return !!this.outcome;
							}
							get value() {
								return this.outcome?.outcome === y.Resolved ? this.outcome?.value : void 0;
							}
							constructor() {
								this.p = new Promise(((e, t) => {
									this.completeCallback = e, this.errorCallback = t;
								}));
							}
							complete(e) {
								return new Promise(((t) => {
									this.completeCallback(e), this.outcome = {
										outcome: y.Resolved,
										value: e
									}, t();
								}));
							}
							error(e) {
								return new Promise(((t) => {
									this.errorCallback(e), this.outcome = {
										outcome: y.Rejected,
										value: e
									}, t();
								}));
							}
							cancel() {
								return this.error(new r.CancellationError());
							}
						}
						t.DeferredPromise = D, function(e) {
							e.settled = async function(e) {
								let t;
								const i = await Promise.all(e.map(((e) => e.then(((e) => e), ((e) => {
									t || (t = e);
								})))));
								if (void 0 !== t) throw t;
								return i;
							}, e.withAsyncBody = function(e) {
								return new Promise((async (t, i) => {
									try {
										await e(t, i);
									} catch (e) {
										i(e);
									}
								}));
							};
						}(w || (t.Promises = w = {}));
						class L {
							get value() {
								return this._value;
							}
							get error() {
								return this._error;
							}
							get isResolved() {
								return this._isResolved;
							}
							constructor(e) {
								this._value = void 0, this._error = void 0, this._isResolved = !1, this.promise = e.then(((e) => (this._value = e, this._isResolved = !0, e)), ((e) => {
									throw this._error = e, this._isResolved = !0, e;
								}));
							}
							requireValue() {
								if (!this._isResolved) throw new r.BugIndicatingError("Promise is not resolved yet");
								if (this._error) throw this._error;
								return this._value;
							}
						}
						t.StatefulPromise = L, t.LazyStatefulPromise = class {
							constructor(e) {
								this._compute = e, this._promise = new h.Lazy((() => new L(this._compute())));
							}
							requireValue() {
								return this._promise.value.requireValue();
							}
							getPromise() {
								return this._promise.value.promise;
							}
							get currentValue() {
								return this._promise.rawValue?.value;
							}
						}, function(e) {
							e[e.Initial = 0] = "Initial", e[e.DoneOK = 1] = "DoneOK", e[e.DoneError = 2] = "DoneError";
						}(E || (E = {}));
						class R {
							static fromArray(e) {
								return new R(((t) => {
									t.emitMany(e);
								}));
							}
							static fromPromise(e) {
								return new R((async (t) => {
									t.emitMany(await e);
								}));
							}
							static fromPromises(e) {
								return new R((async (t) => {
									await Promise.all(e.map((async (e) => t.emitOne(await e))));
								}));
							}
							static merge(e) {
								return new R((async (t) => {
									await Promise.all(e.map((async (e) => {
										for await (const i of e) t.emitOne(i);
									})));
								}));
							}
							static {
								this.EMPTY = R.fromArray([]);
							}
							constructor(e, t) {
								this._state = E.Initial, this._results = [], this._error = null, this._onReturn = t, this._onStateChanged = new n.Emitter(), queueMicrotask((async () => {
									const t = {
										emitOne: (e) => this.emitOne(e),
										emitMany: (e) => this.emitMany(e),
										reject: (e) => this.reject(e)
									};
									try {
										await Promise.resolve(e(t)), this.resolve();
									} catch (e) {
										this.reject(e);
									} finally {
										t.emitOne = void 0, t.emitMany = void 0, t.reject = void 0;
									}
								}));
							}
							[Symbol.asyncIterator]() {
								let e = 0;
								return {
									next: async () => {
										for (;;) {
											if (this._state === E.DoneError) throw this._error;
											if (e < this._results.length) return {
												done: !1,
												value: this._results[e++]
											};
											if (this._state === E.DoneOK) return {
												done: !0,
												value: void 0
											};
											await n.Event.toPromise(this._onStateChanged.event);
										}
									},
									return: async () => (this._onReturn?.(), {
										done: !0,
										value: void 0
									})
								};
							}
							static map(e, t) {
								return new R((async (i) => {
									for await (const s of e) i.emitOne(t(s));
								}));
							}
							map(e) {
								return R.map(this, e);
							}
							static filter(e, t) {
								return new R((async (i) => {
									for await (const s of e) t(s) && i.emitOne(s);
								}));
							}
							filter(e) {
								return R.filter(this, e);
							}
							static coalesce(e) {
								return R.filter(e, ((e) => !!e));
							}
							coalesce() {
								return R.coalesce(this);
							}
							static async toPromise(e) {
								const t = [];
								for await (const i of e) t.push(i);
								return t;
							}
							toPromise() {
								return R.toPromise(this);
							}
							emitOne(e) {
								this._state === E.Initial && (this._results.push(e), this._onStateChanged.fire());
							}
							emitMany(e) {
								this._state === E.Initial && (this._results = this._results.concat(e), this._onStateChanged.fire());
							}
							resolve() {
								this._state === E.Initial && (this._state = E.DoneOK, this._onStateChanged.fire());
							}
							reject(e) {
								this._state === E.Initial && (this._state = E.DoneError, this._error = e, this._onStateChanged.fire());
							}
						}
						t.AsyncIterableObject = R;
						class A extends R {
							constructor(e, t) {
								super(t), this._source = e;
							}
							cancel() {
								this._source.cancel();
							}
						}
						t.CancelableAsyncIterableObject = A, t.AsyncIterableSource = class {
							constructor(e) {
								let t, i;
								this._deferred = new D(), this._asyncIterable = new R(((e) => {
									if (!t) return i && e.emitMany(i), this._errorFn = (t) => e.reject(t), this._emitFn = (t) => e.emitOne(t), this._deferred.p;
									e.reject(t);
								}), e), this._emitFn = (e) => {
									i || (i = []), i.push(e);
								}, this._errorFn = (e) => {
									t || (t = e);
								};
							}
							get asyncIterable() {
								return this._asyncIterable;
							}
							resolve() {
								this._deferred.complete();
							}
							reject(e) {
								this._errorFn(e), this._deferred.complete();
							}
							emitOne(e) {
								this._emitFn(e);
							}
						};
					},
					8447: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.CancellationTokenSource = t.CancellationToken = void 0, t.cancelOnDispose = function(e) {
							const t = new a();
							return e.add({ dispose() {
								t.cancel();
							} }), t.token;
						};
						const s = i(802), r = Object.freeze((function(e, t) {
							const i = setTimeout(e.bind(t), 0);
							return { dispose() {
								clearTimeout(i);
							} };
						}));
						var n;
						(function(e) {
							e.isCancellationToken = function(t) {
								return t === e.None || t === e.Cancelled || t instanceof o || !(!t || "object" != typeof t) && "boolean" == typeof t.isCancellationRequested && "function" == typeof t.onCancellationRequested;
							}, e.None = Object.freeze({
								isCancellationRequested: !1,
								onCancellationRequested: s.Event.None
							}), e.Cancelled = Object.freeze({
								isCancellationRequested: !0,
								onCancellationRequested: r
							});
						})(n || (t.CancellationToken = n = {}));
						class o {
							constructor() {
								this._isCancelled = !1, this._emitter = null;
							}
							cancel() {
								this._isCancelled || (this._isCancelled = !0, this._emitter && (this._emitter.fire(void 0), this.dispose()));
							}
							get isCancellationRequested() {
								return this._isCancelled;
							}
							get onCancellationRequested() {
								return this._isCancelled ? r : (this._emitter || (this._emitter = new s.Emitter()), this._emitter.event);
							}
							dispose() {
								this._emitter && (this._emitter.dispose(), this._emitter = null);
							}
						}
						class a {
							constructor(e) {
								this._token = void 0, this._parentListener = void 0, this._parentListener = e && e.onCancellationRequested(this.cancel, this);
							}
							get token() {
								return this._token || (this._token = new o()), this._token;
							}
							cancel() {
								this._token ? this._token instanceof o && this._token.cancel() : this._token = n.Cancelled;
							}
							dispose(e = !1) {
								e && this.cancel(), this._parentListener?.dispose(), this._token ? this._token instanceof o && this._token.dispose() : this._token = n.None;
							}
						}
						t.CancellationTokenSource = a;
					},
					4869: (e, t) => {
						var i;
						Object.defineProperty(t, "__esModule", { value: !0 }), t.CharCode = void 0, function(e) {
							e[e.Null = 0] = "Null", e[e.Backspace = 8] = "Backspace", e[e.Tab = 9] = "Tab", e[e.LineFeed = 10] = "LineFeed", e[e.CarriageReturn = 13] = "CarriageReturn", e[e.Space = 32] = "Space", e[e.ExclamationMark = 33] = "ExclamationMark", e[e.DoubleQuote = 34] = "DoubleQuote", e[e.Hash = 35] = "Hash", e[e.DollarSign = 36] = "DollarSign", e[e.PercentSign = 37] = "PercentSign", e[e.Ampersand = 38] = "Ampersand", e[e.SingleQuote = 39] = "SingleQuote", e[e.OpenParen = 40] = "OpenParen", e[e.CloseParen = 41] = "CloseParen", e[e.Asterisk = 42] = "Asterisk", e[e.Plus = 43] = "Plus", e[e.Comma = 44] = "Comma", e[e.Dash = 45] = "Dash", e[e.Period = 46] = "Period", e[e.Slash = 47] = "Slash", e[e.Digit0 = 48] = "Digit0", e[e.Digit1 = 49] = "Digit1", e[e.Digit2 = 50] = "Digit2", e[e.Digit3 = 51] = "Digit3", e[e.Digit4 = 52] = "Digit4", e[e.Digit5 = 53] = "Digit5", e[e.Digit6 = 54] = "Digit6", e[e.Digit7 = 55] = "Digit7", e[e.Digit8 = 56] = "Digit8", e[e.Digit9 = 57] = "Digit9", e[e.Colon = 58] = "Colon", e[e.Semicolon = 59] = "Semicolon", e[e.LessThan = 60] = "LessThan", e[e.Equals = 61] = "Equals", e[e.GreaterThan = 62] = "GreaterThan", e[e.QuestionMark = 63] = "QuestionMark", e[e.AtSign = 64] = "AtSign", e[e.A = 65] = "A", e[e.B = 66] = "B", e[e.C = 67] = "C", e[e.D = 68] = "D", e[e.E = 69] = "E", e[e.F = 70] = "F", e[e.G = 71] = "G", e[e.H = 72] = "H", e[e.I = 73] = "I", e[e.J = 74] = "J", e[e.K = 75] = "K", e[e.L = 76] = "L", e[e.M = 77] = "M", e[e.N = 78] = "N", e[e.O = 79] = "O", e[e.P = 80] = "P", e[e.Q = 81] = "Q", e[e.R = 82] = "R", e[e.S = 83] = "S", e[e.T = 84] = "T", e[e.U = 85] = "U", e[e.V = 86] = "V", e[e.W = 87] = "W", e[e.X = 88] = "X", e[e.Y = 89] = "Y", e[e.Z = 90] = "Z", e[e.OpenSquareBracket = 91] = "OpenSquareBracket", e[e.Backslash = 92] = "Backslash", e[e.CloseSquareBracket = 93] = "CloseSquareBracket", e[e.Caret = 94] = "Caret", e[e.Underline = 95] = "Underline", e[e.BackTick = 96] = "BackTick", e[e.a = 97] = "a", e[e.b = 98] = "b", e[e.c = 99] = "c", e[e.d = 100] = "d", e[e.e = 101] = "e", e[e.f = 102] = "f", e[e.g = 103] = "g", e[e.h = 104] = "h", e[e.i = 105] = "i", e[e.j = 106] = "j", e[e.k = 107] = "k", e[e.l = 108] = "l", e[e.m = 109] = "m", e[e.n = 110] = "n", e[e.o = 111] = "o", e[e.p = 112] = "p", e[e.q = 113] = "q", e[e.r = 114] = "r", e[e.s = 115] = "s", e[e.t = 116] = "t", e[e.u = 117] = "u", e[e.v = 118] = "v", e[e.w = 119] = "w", e[e.x = 120] = "x", e[e.y = 121] = "y", e[e.z = 122] = "z", e[e.OpenCurlyBrace = 123] = "OpenCurlyBrace", e[e.Pipe = 124] = "Pipe", e[e.CloseCurlyBrace = 125] = "CloseCurlyBrace", e[e.Tilde = 126] = "Tilde", e[e.NoBreakSpace = 160] = "NoBreakSpace", e[e.U_Combining_Grave_Accent = 768] = "U_Combining_Grave_Accent", e[e.U_Combining_Acute_Accent = 769] = "U_Combining_Acute_Accent", e[e.U_Combining_Circumflex_Accent = 770] = "U_Combining_Circumflex_Accent", e[e.U_Combining_Tilde = 771] = "U_Combining_Tilde", e[e.U_Combining_Macron = 772] = "U_Combining_Macron", e[e.U_Combining_Overline = 773] = "U_Combining_Overline", e[e.U_Combining_Breve = 774] = "U_Combining_Breve", e[e.U_Combining_Dot_Above = 775] = "U_Combining_Dot_Above", e[e.U_Combining_Diaeresis = 776] = "U_Combining_Diaeresis", e[e.U_Combining_Hook_Above = 777] = "U_Combining_Hook_Above", e[e.U_Combining_Ring_Above = 778] = "U_Combining_Ring_Above", e[e.U_Combining_Double_Acute_Accent = 779] = "U_Combining_Double_Acute_Accent", e[e.U_Combining_Caron = 780] = "U_Combining_Caron", e[e.U_Combining_Vertical_Line_Above = 781] = "U_Combining_Vertical_Line_Above", e[e.U_Combining_Double_Vertical_Line_Above = 782] = "U_Combining_Double_Vertical_Line_Above", e[e.U_Combining_Double_Grave_Accent = 783] = "U_Combining_Double_Grave_Accent", e[e.U_Combining_Candrabindu = 784] = "U_Combining_Candrabindu", e[e.U_Combining_Inverted_Breve = 785] = "U_Combining_Inverted_Breve", e[e.U_Combining_Turned_Comma_Above = 786] = "U_Combining_Turned_Comma_Above", e[e.U_Combining_Comma_Above = 787] = "U_Combining_Comma_Above", e[e.U_Combining_Reversed_Comma_Above = 788] = "U_Combining_Reversed_Comma_Above", e[e.U_Combining_Comma_Above_Right = 789] = "U_Combining_Comma_Above_Right", e[e.U_Combining_Grave_Accent_Below = 790] = "U_Combining_Grave_Accent_Below", e[e.U_Combining_Acute_Accent_Below = 791] = "U_Combining_Acute_Accent_Below", e[e.U_Combining_Left_Tack_Below = 792] = "U_Combining_Left_Tack_Below", e[e.U_Combining_Right_Tack_Below = 793] = "U_Combining_Right_Tack_Below", e[e.U_Combining_Left_Angle_Above = 794] = "U_Combining_Left_Angle_Above", e[e.U_Combining_Horn = 795] = "U_Combining_Horn", e[e.U_Combining_Left_Half_Ring_Below = 796] = "U_Combining_Left_Half_Ring_Below", e[e.U_Combining_Up_Tack_Below = 797] = "U_Combining_Up_Tack_Below", e[e.U_Combining_Down_Tack_Below = 798] = "U_Combining_Down_Tack_Below", e[e.U_Combining_Plus_Sign_Below = 799] = "U_Combining_Plus_Sign_Below", e[e.U_Combining_Minus_Sign_Below = 800] = "U_Combining_Minus_Sign_Below", e[e.U_Combining_Palatalized_Hook_Below = 801] = "U_Combining_Palatalized_Hook_Below", e[e.U_Combining_Retroflex_Hook_Below = 802] = "U_Combining_Retroflex_Hook_Below", e[e.U_Combining_Dot_Below = 803] = "U_Combining_Dot_Below", e[e.U_Combining_Diaeresis_Below = 804] = "U_Combining_Diaeresis_Below", e[e.U_Combining_Ring_Below = 805] = "U_Combining_Ring_Below", e[e.U_Combining_Comma_Below = 806] = "U_Combining_Comma_Below", e[e.U_Combining_Cedilla = 807] = "U_Combining_Cedilla", e[e.U_Combining_Ogonek = 808] = "U_Combining_Ogonek", e[e.U_Combining_Vertical_Line_Below = 809] = "U_Combining_Vertical_Line_Below", e[e.U_Combining_Bridge_Below = 810] = "U_Combining_Bridge_Below", e[e.U_Combining_Inverted_Double_Arch_Below = 811] = "U_Combining_Inverted_Double_Arch_Below", e[e.U_Combining_Caron_Below = 812] = "U_Combining_Caron_Below", e[e.U_Combining_Circumflex_Accent_Below = 813] = "U_Combining_Circumflex_Accent_Below", e[e.U_Combining_Breve_Below = 814] = "U_Combining_Breve_Below", e[e.U_Combining_Inverted_Breve_Below = 815] = "U_Combining_Inverted_Breve_Below", e[e.U_Combining_Tilde_Below = 816] = "U_Combining_Tilde_Below", e[e.U_Combining_Macron_Below = 817] = "U_Combining_Macron_Below", e[e.U_Combining_Low_Line = 818] = "U_Combining_Low_Line", e[e.U_Combining_Double_Low_Line = 819] = "U_Combining_Double_Low_Line", e[e.U_Combining_Tilde_Overlay = 820] = "U_Combining_Tilde_Overlay", e[e.U_Combining_Short_Stroke_Overlay = 821] = "U_Combining_Short_Stroke_Overlay", e[e.U_Combining_Long_Stroke_Overlay = 822] = "U_Combining_Long_Stroke_Overlay", e[e.U_Combining_Short_Solidus_Overlay = 823] = "U_Combining_Short_Solidus_Overlay", e[e.U_Combining_Long_Solidus_Overlay = 824] = "U_Combining_Long_Solidus_Overlay", e[e.U_Combining_Right_Half_Ring_Below = 825] = "U_Combining_Right_Half_Ring_Below", e[e.U_Combining_Inverted_Bridge_Below = 826] = "U_Combining_Inverted_Bridge_Below", e[e.U_Combining_Square_Below = 827] = "U_Combining_Square_Below", e[e.U_Combining_Seagull_Below = 828] = "U_Combining_Seagull_Below", e[e.U_Combining_X_Above = 829] = "U_Combining_X_Above", e[e.U_Combining_Vertical_Tilde = 830] = "U_Combining_Vertical_Tilde", e[e.U_Combining_Double_Overline = 831] = "U_Combining_Double_Overline", e[e.U_Combining_Grave_Tone_Mark = 832] = "U_Combining_Grave_Tone_Mark", e[e.U_Combining_Acute_Tone_Mark = 833] = "U_Combining_Acute_Tone_Mark", e[e.U_Combining_Greek_Perispomeni = 834] = "U_Combining_Greek_Perispomeni", e[e.U_Combining_Greek_Koronis = 835] = "U_Combining_Greek_Koronis", e[e.U_Combining_Greek_Dialytika_Tonos = 836] = "U_Combining_Greek_Dialytika_Tonos", e[e.U_Combining_Greek_Ypogegrammeni = 837] = "U_Combining_Greek_Ypogegrammeni", e[e.U_Combining_Bridge_Above = 838] = "U_Combining_Bridge_Above", e[e.U_Combining_Equals_Sign_Below = 839] = "U_Combining_Equals_Sign_Below", e[e.U_Combining_Double_Vertical_Line_Below = 840] = "U_Combining_Double_Vertical_Line_Below", e[e.U_Combining_Left_Angle_Below = 841] = "U_Combining_Left_Angle_Below", e[e.U_Combining_Not_Tilde_Above = 842] = "U_Combining_Not_Tilde_Above", e[e.U_Combining_Homothetic_Above = 843] = "U_Combining_Homothetic_Above", e[e.U_Combining_Almost_Equal_To_Above = 844] = "U_Combining_Almost_Equal_To_Above", e[e.U_Combining_Left_Right_Arrow_Below = 845] = "U_Combining_Left_Right_Arrow_Below", e[e.U_Combining_Upwards_Arrow_Below = 846] = "U_Combining_Upwards_Arrow_Below", e[e.U_Combining_Grapheme_Joiner = 847] = "U_Combining_Grapheme_Joiner", e[e.U_Combining_Right_Arrowhead_Above = 848] = "U_Combining_Right_Arrowhead_Above", e[e.U_Combining_Left_Half_Ring_Above = 849] = "U_Combining_Left_Half_Ring_Above", e[e.U_Combining_Fermata = 850] = "U_Combining_Fermata", e[e.U_Combining_X_Below = 851] = "U_Combining_X_Below", e[e.U_Combining_Left_Arrowhead_Below = 852] = "U_Combining_Left_Arrowhead_Below", e[e.U_Combining_Right_Arrowhead_Below = 853] = "U_Combining_Right_Arrowhead_Below", e[e.U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below = 854] = "U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below", e[e.U_Combining_Right_Half_Ring_Above = 855] = "U_Combining_Right_Half_Ring_Above", e[e.U_Combining_Dot_Above_Right = 856] = "U_Combining_Dot_Above_Right", e[e.U_Combining_Asterisk_Below = 857] = "U_Combining_Asterisk_Below", e[e.U_Combining_Double_Ring_Below = 858] = "U_Combining_Double_Ring_Below", e[e.U_Combining_Zigzag_Above = 859] = "U_Combining_Zigzag_Above", e[e.U_Combining_Double_Breve_Below = 860] = "U_Combining_Double_Breve_Below", e[e.U_Combining_Double_Breve = 861] = "U_Combining_Double_Breve", e[e.U_Combining_Double_Macron = 862] = "U_Combining_Double_Macron", e[e.U_Combining_Double_Macron_Below = 863] = "U_Combining_Double_Macron_Below", e[e.U_Combining_Double_Tilde = 864] = "U_Combining_Double_Tilde", e[e.U_Combining_Double_Inverted_Breve = 865] = "U_Combining_Double_Inverted_Breve", e[e.U_Combining_Double_Rightwards_Arrow_Below = 866] = "U_Combining_Double_Rightwards_Arrow_Below", e[e.U_Combining_Latin_Small_Letter_A = 867] = "U_Combining_Latin_Small_Letter_A", e[e.U_Combining_Latin_Small_Letter_E = 868] = "U_Combining_Latin_Small_Letter_E", e[e.U_Combining_Latin_Small_Letter_I = 869] = "U_Combining_Latin_Small_Letter_I", e[e.U_Combining_Latin_Small_Letter_O = 870] = "U_Combining_Latin_Small_Letter_O", e[e.U_Combining_Latin_Small_Letter_U = 871] = "U_Combining_Latin_Small_Letter_U", e[e.U_Combining_Latin_Small_Letter_C = 872] = "U_Combining_Latin_Small_Letter_C", e[e.U_Combining_Latin_Small_Letter_D = 873] = "U_Combining_Latin_Small_Letter_D", e[e.U_Combining_Latin_Small_Letter_H = 874] = "U_Combining_Latin_Small_Letter_H", e[e.U_Combining_Latin_Small_Letter_M = 875] = "U_Combining_Latin_Small_Letter_M", e[e.U_Combining_Latin_Small_Letter_R = 876] = "U_Combining_Latin_Small_Letter_R", e[e.U_Combining_Latin_Small_Letter_T = 877] = "U_Combining_Latin_Small_Letter_T", e[e.U_Combining_Latin_Small_Letter_V = 878] = "U_Combining_Latin_Small_Letter_V", e[e.U_Combining_Latin_Small_Letter_X = 879] = "U_Combining_Latin_Small_Letter_X", e[e.LINE_SEPARATOR = 8232] = "LINE_SEPARATOR", e[e.PARAGRAPH_SEPARATOR = 8233] = "PARAGRAPH_SEPARATOR", e[e.NEXT_LINE = 133] = "NEXT_LINE", e[e.U_CIRCUMFLEX = 94] = "U_CIRCUMFLEX", e[e.U_GRAVE_ACCENT = 96] = "U_GRAVE_ACCENT", e[e.U_DIAERESIS = 168] = "U_DIAERESIS", e[e.U_MACRON = 175] = "U_MACRON", e[e.U_ACUTE_ACCENT = 180] = "U_ACUTE_ACCENT", e[e.U_CEDILLA = 184] = "U_CEDILLA", e[e.U_MODIFIER_LETTER_LEFT_ARROWHEAD = 706] = "U_MODIFIER_LETTER_LEFT_ARROWHEAD", e[e.U_MODIFIER_LETTER_RIGHT_ARROWHEAD = 707] = "U_MODIFIER_LETTER_RIGHT_ARROWHEAD", e[e.U_MODIFIER_LETTER_UP_ARROWHEAD = 708] = "U_MODIFIER_LETTER_UP_ARROWHEAD", e[e.U_MODIFIER_LETTER_DOWN_ARROWHEAD = 709] = "U_MODIFIER_LETTER_DOWN_ARROWHEAD", e[e.U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING = 722] = "U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING", e[e.U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING = 723] = "U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING", e[e.U_MODIFIER_LETTER_UP_TACK = 724] = "U_MODIFIER_LETTER_UP_TACK", e[e.U_MODIFIER_LETTER_DOWN_TACK = 725] = "U_MODIFIER_LETTER_DOWN_TACK", e[e.U_MODIFIER_LETTER_PLUS_SIGN = 726] = "U_MODIFIER_LETTER_PLUS_SIGN", e[e.U_MODIFIER_LETTER_MINUS_SIGN = 727] = "U_MODIFIER_LETTER_MINUS_SIGN", e[e.U_BREVE = 728] = "U_BREVE", e[e.U_DOT_ABOVE = 729] = "U_DOT_ABOVE", e[e.U_RING_ABOVE = 730] = "U_RING_ABOVE", e[e.U_OGONEK = 731] = "U_OGONEK", e[e.U_SMALL_TILDE = 732] = "U_SMALL_TILDE", e[e.U_DOUBLE_ACUTE_ACCENT = 733] = "U_DOUBLE_ACUTE_ACCENT", e[e.U_MODIFIER_LETTER_RHOTIC_HOOK = 734] = "U_MODIFIER_LETTER_RHOTIC_HOOK", e[e.U_MODIFIER_LETTER_CROSS_ACCENT = 735] = "U_MODIFIER_LETTER_CROSS_ACCENT", e[e.U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR = 741] = "U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR", e[e.U_MODIFIER_LETTER_HIGH_TONE_BAR = 742] = "U_MODIFIER_LETTER_HIGH_TONE_BAR", e[e.U_MODIFIER_LETTER_MID_TONE_BAR = 743] = "U_MODIFIER_LETTER_MID_TONE_BAR", e[e.U_MODIFIER_LETTER_LOW_TONE_BAR = 744] = "U_MODIFIER_LETTER_LOW_TONE_BAR", e[e.U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR = 745] = "U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR", e[e.U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK = 746] = "U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK", e[e.U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK = 747] = "U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK", e[e.U_MODIFIER_LETTER_UNASPIRATED = 749] = "U_MODIFIER_LETTER_UNASPIRATED", e[e.U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD = 751] = "U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD", e[e.U_MODIFIER_LETTER_LOW_UP_ARROWHEAD = 752] = "U_MODIFIER_LETTER_LOW_UP_ARROWHEAD", e[e.U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD = 753] = "U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD", e[e.U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD = 754] = "U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD", e[e.U_MODIFIER_LETTER_LOW_RING = 755] = "U_MODIFIER_LETTER_LOW_RING", e[e.U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT = 756] = "U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT", e[e.U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT = 757] = "U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT", e[e.U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT = 758] = "U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT", e[e.U_MODIFIER_LETTER_LOW_TILDE = 759] = "U_MODIFIER_LETTER_LOW_TILDE", e[e.U_MODIFIER_LETTER_RAISED_COLON = 760] = "U_MODIFIER_LETTER_RAISED_COLON", e[e.U_MODIFIER_LETTER_BEGIN_HIGH_TONE = 761] = "U_MODIFIER_LETTER_BEGIN_HIGH_TONE", e[e.U_MODIFIER_LETTER_END_HIGH_TONE = 762] = "U_MODIFIER_LETTER_END_HIGH_TONE", e[e.U_MODIFIER_LETTER_BEGIN_LOW_TONE = 763] = "U_MODIFIER_LETTER_BEGIN_LOW_TONE", e[e.U_MODIFIER_LETTER_END_LOW_TONE = 764] = "U_MODIFIER_LETTER_END_LOW_TONE", e[e.U_MODIFIER_LETTER_SHELF = 765] = "U_MODIFIER_LETTER_SHELF", e[e.U_MODIFIER_LETTER_OPEN_SHELF = 766] = "U_MODIFIER_LETTER_OPEN_SHELF", e[e.U_MODIFIER_LETTER_LOW_LEFT_ARROW = 767] = "U_MODIFIER_LETTER_LOW_LEFT_ARROW", e[e.U_GREEK_LOWER_NUMERAL_SIGN = 885] = "U_GREEK_LOWER_NUMERAL_SIGN", e[e.U_GREEK_TONOS = 900] = "U_GREEK_TONOS", e[e.U_GREEK_DIALYTIKA_TONOS = 901] = "U_GREEK_DIALYTIKA_TONOS", e[e.U_GREEK_KORONIS = 8125] = "U_GREEK_KORONIS", e[e.U_GREEK_PSILI = 8127] = "U_GREEK_PSILI", e[e.U_GREEK_PERISPOMENI = 8128] = "U_GREEK_PERISPOMENI", e[e.U_GREEK_DIALYTIKA_AND_PERISPOMENI = 8129] = "U_GREEK_DIALYTIKA_AND_PERISPOMENI", e[e.U_GREEK_PSILI_AND_VARIA = 8141] = "U_GREEK_PSILI_AND_VARIA", e[e.U_GREEK_PSILI_AND_OXIA = 8142] = "U_GREEK_PSILI_AND_OXIA", e[e.U_GREEK_PSILI_AND_PERISPOMENI = 8143] = "U_GREEK_PSILI_AND_PERISPOMENI", e[e.U_GREEK_DASIA_AND_VARIA = 8157] = "U_GREEK_DASIA_AND_VARIA", e[e.U_GREEK_DASIA_AND_OXIA = 8158] = "U_GREEK_DASIA_AND_OXIA", e[e.U_GREEK_DASIA_AND_PERISPOMENI = 8159] = "U_GREEK_DASIA_AND_PERISPOMENI", e[e.U_GREEK_DIALYTIKA_AND_VARIA = 8173] = "U_GREEK_DIALYTIKA_AND_VARIA", e[e.U_GREEK_DIALYTIKA_AND_OXIA = 8174] = "U_GREEK_DIALYTIKA_AND_OXIA", e[e.U_GREEK_VARIA = 8175] = "U_GREEK_VARIA", e[e.U_GREEK_OXIA = 8189] = "U_GREEK_OXIA", e[e.U_GREEK_DASIA = 8190] = "U_GREEK_DASIA", e[e.U_IDEOGRAPHIC_FULL_STOP = 12290] = "U_IDEOGRAPHIC_FULL_STOP", e[e.U_LEFT_CORNER_BRACKET = 12300] = "U_LEFT_CORNER_BRACKET", e[e.U_RIGHT_CORNER_BRACKET = 12301] = "U_RIGHT_CORNER_BRACKET", e[e.U_LEFT_BLACK_LENTICULAR_BRACKET = 12304] = "U_LEFT_BLACK_LENTICULAR_BRACKET", e[e.U_RIGHT_BLACK_LENTICULAR_BRACKET = 12305] = "U_RIGHT_BLACK_LENTICULAR_BRACKET", e[e.U_OVERLINE = 8254] = "U_OVERLINE", e[e.UTF8_BOM = 65279] = "UTF8_BOM", e[e.U_FULLWIDTH_SEMICOLON = 65307] = "U_FULLWIDTH_SEMICOLON", e[e.U_FULLWIDTH_COMMA = 65292] = "U_FULLWIDTH_COMMA";
						}(i || (t.CharCode = i = {}));
					},
					9087: (e, t) => {
						var i;
						Object.defineProperty(t, "__esModule", { value: !0 }), t.SetWithKey = void 0, t.groupBy = function(e, t) {
							const i = Object.create(null);
							for (const s of e) {
								const e = t(s);
								let r = i[e];
								r || (r = i[e] = []), r.push(s);
							}
							return i;
						}, t.diffSets = function(e, t) {
							const i = [], s = [];
							for (const s of e) t.has(s) || i.push(s);
							for (const i of t) e.has(i) || s.push(i);
							return {
								removed: i,
								added: s
							};
						}, t.diffMaps = function(e, t) {
							const i = [], s = [];
							for (const [s, r] of e) t.has(s) || i.push(r);
							for (const [i, r] of t) e.has(i) || s.push(r);
							return {
								removed: i,
								added: s
							};
						}, t.intersection = function(e, t) {
							const i = /* @__PURE__ */ new Set();
							for (const s of t) e.has(s) && i.add(s);
							return i;
						};
						class s {
							static {
								i = Symbol.toStringTag;
							}
							constructor(e, t) {
								this.toKey = t, this._map = /* @__PURE__ */ new Map(), this[i] = "SetWithKey";
								for (const t of e) this.add(t);
							}
							get size() {
								return this._map.size;
							}
							add(e) {
								const t = this.toKey(e);
								return this._map.set(t, e), this;
							}
							delete(e) {
								return this._map.delete(this.toKey(e));
							}
							has(e) {
								return this._map.has(this.toKey(e));
							}
							*entries() {
								for (const e of this._map.values()) yield [e, e];
							}
							keys() {
								return this.values();
							}
							*values() {
								for (const e of this._map.values()) yield e;
							}
							clear() {
								this._map.clear();
							}
							forEach(e, t) {
								this._map.forEach(((i) => e.call(t, i, i, this)));
							}
							[Symbol.iterator]() {
								return this.values();
							}
						}
						t.SetWithKey = s;
					},
					4838: (e, t) => {
						function i(e) {
							return (t, i, s) => {
								let r = null, n = null;
								if ("function" == typeof s.value ? (r = "value", n = s.value) : "function" == typeof s.get && (r = "get", n = s.get), !n) throw new Error("not supported");
								s[r] = e(n, i);
							};
						}
						Object.defineProperty(t, "__esModule", { value: !0 }), t.memoize = function(e, t, i) {
							let s = null, r = null;
							if ("function" == typeof i.value ? (s = "value", r = i.value, 0 !== r.length && console.warn("Memoize should only be used in functions with zero parameters")) : "function" == typeof i.get && (s = "get", r = i.get), !r) throw new Error("not supported");
							const n = `$memoize$${t}`;
							i[s] = function(...e) {
								return this.hasOwnProperty(n) || Object.defineProperty(this, n, {
									configurable: !1,
									enumerable: !1,
									writable: !1,
									value: r.apply(this, e)
								}), this[n];
							};
						}, t.debounce = function(e, t, s) {
							return i(((i, r) => {
								const n = `$debounce$${r}`, o = `$debounce$result$${r}`;
								return function(...r) {
									this[o] || (this[o] = s ? s() : void 0), clearTimeout(this[n]), t && (this[o] = t(this[o], ...r), r = [this[o]]), this[n] = setTimeout((() => {
										i.apply(this, r), this[o] = s ? s() : void 0;
									}), e);
								};
							}));
						}, t.throttle = function(e, t, s) {
							return i(((i, r) => {
								const n = `$throttle$timer$${r}`, o = `$throttle$result$${r}`, a = `$throttle$lastRun$${r}`, l = `$throttle$pending$${r}`;
								return function(...r) {
									if (this[o] || (this[o] = s ? s() : void 0), null !== this[a] && void 0 !== this[a] || (this[a] = -Number.MAX_VALUE), t && (this[o] = t(this[o], ...r)), this[l]) return;
									const h = this[a] + e;
									h <= Date.now() ? (this[a] = Date.now(), i.apply(this, [this[o]]), this[o] = s ? s() : void 0) : (this[l] = !0, this[n] = setTimeout((() => {
										this[l] = !1, this[a] = Date.now(), i.apply(this, [this[o]]), this[o] = s ? s() : void 0;
									}), h - Date.now()));
								};
							}));
						};
					},
					9807: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.BugIndicatingError = t.ErrorNoTelemetry = t.ExpectedError = t.NotSupportedError = t.NotImplementedError = t.ReadonlyError = t.CancellationError = t.errorHandler = t.ErrorHandler = void 0, t.setUnexpectedErrorHandler = function(e) {
							t.errorHandler.setUnexpectedErrorHandler(e);
						}, t.isSigPipeError = function(e) {
							if (!e || "object" != typeof e) return !1;
							const t = e;
							return "EPIPE" === t.code && "WRITE" === t.syscall?.toUpperCase();
						}, t.onUnexpectedError = function(e) {
							r(e) || t.errorHandler.onUnexpectedError(e);
						}, t.onUnexpectedExternalError = function(e) {
							r(e) || t.errorHandler.onUnexpectedExternalError(e);
						}, t.transformErrorForSerialization = function(e) {
							if (e instanceof Error) {
								const { name: t, message: i } = e;
								return {
									$isError: !0,
									name: t,
									message: i,
									stack: e.stacktrace || e.stack,
									noTelemetry: c.isErrorNoTelemetry(e)
								};
							}
							return e;
						}, t.transformErrorFromSerialization = function(e) {
							let t;
							return e.noTelemetry ? t = new c() : (t = /* @__PURE__ */ new Error(), t.name = e.name), t.message = e.message, t.stack = e.stack, t;
						}, t.isCancellationError = r, t.canceled = function() {
							const e = new Error(s);
							return e.name = e.message, e;
						}, t.illegalArgument = function(e) {
							return e ? /* @__PURE__ */ new Error(`Illegal argument: ${e}`) : /* @__PURE__ */ new Error("Illegal argument");
						}, t.illegalState = function(e) {
							return e ? /* @__PURE__ */ new Error(`Illegal state: ${e}`) : /* @__PURE__ */ new Error("Illegal state");
						}, t.getErrorMessage = function(e) {
							return e ? e.message ? e.message : e.stack ? e.stack.split("\n")[0] : String(e) : "Error";
						};
						class i {
							constructor() {
								this.listeners = [], this.unexpectedErrorHandler = function(e) {
									setTimeout((() => {
										if (e.stack) {
											if (c.isErrorNoTelemetry(e)) throw new c(e.message + "\n\n" + e.stack);
											throw new Error(e.message + "\n\n" + e.stack);
										}
										throw e;
									}), 0);
								};
							}
							addListener(e) {
								return this.listeners.push(e), () => {
									this._removeListener(e);
								};
							}
							emit(e) {
								this.listeners.forEach(((t) => {
									t(e);
								}));
							}
							_removeListener(e) {
								this.listeners.splice(this.listeners.indexOf(e), 1);
							}
							setUnexpectedErrorHandler(e) {
								this.unexpectedErrorHandler = e;
							}
							getUnexpectedErrorHandler() {
								return this.unexpectedErrorHandler;
							}
							onUnexpectedError(e) {
								this.unexpectedErrorHandler(e), this.emit(e);
							}
							onUnexpectedExternalError(e) {
								this.unexpectedErrorHandler(e);
							}
						}
						t.ErrorHandler = i, t.errorHandler = new i();
						const s = "Canceled";
						function r(e) {
							return e instanceof n || e instanceof Error && e.name === s && e.message === s;
						}
						class n extends Error {
							constructor() {
								super(s), this.name = this.message;
							}
						}
						t.CancellationError = n;
						class o extends TypeError {
							constructor(e) {
								super(e ? `${e} is read-only and cannot be changed` : "Cannot change read-only property");
							}
						}
						t.ReadonlyError = o;
						class a extends Error {
							constructor(e) {
								super("NotImplemented"), e && (this.message = e);
							}
						}
						t.NotImplementedError = a;
						class l extends Error {
							constructor(e) {
								super("NotSupported"), e && (this.message = e);
							}
						}
						t.NotSupportedError = l;
						class h extends Error {
							constructor() {
								super(...arguments), this.isExpected = !0;
							}
						}
						t.ExpectedError = h;
						class c extends Error {
							constructor(e) {
								super(e), this.name = "CodeExpectedError";
							}
							static fromError(e) {
								if (e instanceof c) return e;
								const t = new c();
								return t.message = e.message, t.stack = e.stack, t;
							}
							static isErrorNoTelemetry(e) {
								return "CodeExpectedError" === e.name;
							}
						}
						t.ErrorNoTelemetry = c;
						class d extends Error {
							constructor(e) {
								super(e || "An unexpected bug occurred."), Object.setPrototypeOf(this, d.prototype);
							}
						}
						t.BugIndicatingError = d;
					},
					802: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.ValueWithChangeEvent = t.Relay = t.EventBufferer = t.DynamicListEventMultiplexer = t.EventMultiplexer = t.MicrotaskEmitter = t.DebounceEmitter = t.PauseableEmitter = t.AsyncEmitter = t.createEventDeliveryQueue = t.Emitter = t.ListenerRefusalError = t.ListenerLeakError = t.EventProfiling = t.Event = void 0, t.setGlobalLeakWarningThreshold = function(e) {
							const t = c;
							return c = e, { dispose() {
								c = t;
							} };
						};
						const s = i(9807), r = i(8841), n = i(7150), o = i(6317), a = i(9725);
						var l;
						(function(e) {
							function t(e) {
								return (t, i = null, s) => {
									let r, n = !1;
									return r = e(((e) => {
										if (!n) return r ? r.dispose() : n = !0, t.call(i, e);
									}), null, s), n && r.dispose(), r;
								};
							}
							function i(e, t, i) {
								return r(((i, s = null, r) => e(((e) => i.call(s, t(e))), null, r)), i);
							}
							function s(e, t, i) {
								return r(((i, s = null, r) => e(((e) => t(e) && i.call(s, e)), null, r)), i);
							}
							function r(e, t) {
								let i;
								const s = new m({
									onWillAddFirstListener() {
										i = e(s.fire, s);
									},
									onDidRemoveLastListener() {
										i?.dispose();
									}
								});
								return t?.add(s), s.event;
							}
							function o(e, t, i = 100, s = !1, r = !1, n, o) {
								let a, l, h, c, d = 0;
								const u = new m({
									leakWarningThreshold: n,
									onWillAddFirstListener() {
										a = e(((e) => {
											d++, l = t(l, e), s && !h && (u.fire(l), l = void 0), c = () => {
												const e = l;
												l = void 0, h = void 0, (!s || d > 1) && u.fire(e), d = 0;
											}, "number" == typeof i ? (clearTimeout(h), h = setTimeout(c, i)) : void 0 === h && (h = 0, queueMicrotask(c));
										}));
									},
									onWillRemoveListener() {
										r && d > 0 && c?.();
									},
									onDidRemoveLastListener() {
										c = void 0, a.dispose();
									}
								});
								return o?.add(u), u.event;
							}
							e.None = () => n.Disposable.None, e.defer = function(e, t) {
								return o(e, (() => {}), 0, void 0, !0, void 0, t);
							}, e.once = t, e.map = i, e.forEach = function(e, t, i) {
								return r(((i, s = null, r) => e(((e) => {
									t(e), i.call(s, e);
								}), null, r)), i);
							}, e.filter = s, e.signal = function(e) {
								return e;
							}, e.any = function(...e) {
								return (t, i = null, s) => {
									return r = (0, n.combinedDisposable)(...e.map(((e) => e(((e) => t.call(i, e)))))), (o = s) instanceof Array ? o.push(r) : o && o.add(r), r;
									var r, o;
								};
							}, e.reduce = function(e, t, s, r) {
								let n = s;
								return i(e, ((e) => (n = t(n, e), n)), r);
							}, e.debounce = o, e.accumulate = function(t, i = 0, s) {
								return e.debounce(t, ((e, t) => e ? (e.push(t), e) : [t]), i, void 0, !0, void 0, s);
							}, e.latch = function(e, t = (e, t) => e === t, i) {
								let r, n = !0;
								return s(e, ((e) => {
									const i = n || !t(e, r);
									return n = !1, r = e, i;
								}), i);
							}, e.split = function(t, i, s) {
								return [e.filter(t, i, s), e.filter(t, ((e) => !i(e)), s)];
							}, e.buffer = function(e, t = !1, i = [], s) {
								let r = i.slice(), n = e(((e) => {
									r ? r.push(e) : a.fire(e);
								}));
								s && s.add(n);
								const o = () => {
									r?.forEach(((e) => a.fire(e))), r = null;
								}, a = new m({
									onWillAddFirstListener() {
										n || (n = e(((e) => a.fire(e))), s && s.add(n));
									},
									onDidAddFirstListener() {
										r && (t ? setTimeout(o) : o());
									},
									onDidRemoveLastListener() {
										n && n.dispose(), n = null;
									}
								});
								return s && s.add(a), a.event;
							}, e.chain = function(e, t) {
								return (i, s, r) => {
									const n = t(new l());
									return e((function(e) {
										const t = n.evaluate(e);
										t !== a && i.call(s, t);
									}), void 0, r);
								};
							};
							const a = Symbol("HaltChainable");
							class l {
								constructor() {
									this.steps = [];
								}
								map(e) {
									return this.steps.push(e), this;
								}
								forEach(e) {
									return this.steps.push(((t) => (e(t), t))), this;
								}
								filter(e) {
									return this.steps.push(((t) => e(t) ? t : a)), this;
								}
								reduce(e, t) {
									let i = t;
									return this.steps.push(((t) => (i = e(i, t), i))), this;
								}
								latch(e = (e, t) => e === t) {
									let t, i = !0;
									return this.steps.push(((s) => {
										const r = i || !e(s, t);
										return i = !1, t = s, r ? s : a;
									})), this;
								}
								evaluate(e) {
									for (const t of this.steps) if ((e = t(e)) === a) break;
									return e;
								}
							}
							e.fromNodeEventEmitter = function(e, t, i = (e) => e) {
								const s = (...e) => r.fire(i(...e)), r = new m({
									onWillAddFirstListener: () => e.on(t, s),
									onDidRemoveLastListener: () => e.removeListener(t, s)
								});
								return r.event;
							}, e.fromDOMEventEmitter = function(e, t, i = (e) => e) {
								const s = (...e) => r.fire(i(...e)), r = new m({
									onWillAddFirstListener: () => e.addEventListener(t, s),
									onDidRemoveLastListener: () => e.removeEventListener(t, s)
								});
								return r.event;
							}, e.toPromise = function(e) {
								return new Promise(((i) => t(e)(i)));
							}, e.fromPromise = function(e) {
								const t = new m();
								return e.then(((e) => {
									t.fire(e);
								}), (() => {
									t.fire(void 0);
								})).finally((() => {
									t.dispose();
								})), t.event;
							}, e.forward = function(e, t) {
								return e(((e) => t.fire(e)));
							}, e.runAndSubscribe = function(e, t, i) {
								return t(i), e(((e) => t(e)));
							};
							class h {
								constructor(e, t) {
									this._observable = e, this._counter = 0, this._hasChanged = !1;
									const i = {
										onWillAddFirstListener: () => {
											e.addObserver(this);
										},
										onDidRemoveLastListener: () => {
											e.removeObserver(this);
										}
									};
									this.emitter = new m(i), t && t.add(this.emitter);
								}
								beginUpdate(e) {
									this._counter++;
								}
								handlePossibleChange(e) {}
								handleChange(e, t) {
									this._hasChanged = !0;
								}
								endUpdate(e) {
									this._counter--, 0 === this._counter && (this._observable.reportChanges(), this._hasChanged && (this._hasChanged = !1, this.emitter.fire(this._observable.get())));
								}
							}
							e.fromObservable = function(e, t) {
								return new h(e, t).emitter.event;
							}, e.fromObservableLight = function(e) {
								return (t, i, s) => {
									let r = 0, o = !1;
									const a = {
										beginUpdate() {
											r++;
										},
										endUpdate() {
											r--, 0 === r && (e.reportChanges(), o && (o = !1, t.call(i)));
										},
										handlePossibleChange() {},
										handleChange() {
											o = !0;
										}
									};
									e.addObserver(a), e.reportChanges();
									const l = { dispose() {
										e.removeObserver(a);
									} };
									return s instanceof n.DisposableStore ? s.add(l) : Array.isArray(s) && s.push(l), l;
								};
							};
						})(l || (t.Event = l = {}));
						class h {
							static {
								this.all = /* @__PURE__ */ new Set();
							}
							static {
								this._idPool = 0;
							}
							constructor(e) {
								this.listenerCount = 0, this.invocationCount = 0, this.elapsedOverall = 0, this.durations = [], this.name = `${e}_${h._idPool++}`, h.all.add(this);
							}
							start(e) {
								this._stopWatch = new a.StopWatch(), this.listenerCount = e;
							}
							stop() {
								if (this._stopWatch) {
									const e = this._stopWatch.elapsed();
									this.durations.push(e), this.elapsedOverall += e, this.invocationCount += 1, this._stopWatch = void 0;
								}
							}
						}
						t.EventProfiling = h;
						let c = -1;
						class d {
							static {
								this._idPool = 1;
							}
							constructor(e, t, i = (d._idPool++).toString(16).padStart(3, "0")) {
								this._errorHandler = e, this.threshold = t, this.name = i, this._warnCountdown = 0;
							}
							dispose() {
								this._stacks?.clear();
							}
							check(e, t) {
								const i = this.threshold;
								if (i <= 0 || t < i) return;
								this._stacks || (this._stacks = /* @__PURE__ */ new Map());
								const s = this._stacks.get(e.value) || 0;
								if (this._stacks.set(e.value, s + 1), this._warnCountdown -= 1, this._warnCountdown <= 0) {
									this._warnCountdown = .5 * i;
									const [e, s] = this.getMostFrequentStack(), r = `[${this.name}] potential listener LEAK detected, having ${t} listeners already. MOST frequent listener (${s}):`;
									console.warn(r), console.warn(e);
									const n = new _(r, e);
									this._errorHandler(n);
								}
								return () => {
									const t = this._stacks.get(e.value) || 0;
									this._stacks.set(e.value, t - 1);
								};
							}
							getMostFrequentStack() {
								if (!this._stacks) return;
								let e, t = 0;
								for (const [i, s] of this._stacks) (!e || t < s) && (e = [i, s], t = s);
								return e;
							}
						}
						class u {
							static create() {
								return new u((/* @__PURE__ */ new Error()).stack ?? "");
							}
							constructor(e) {
								this.value = e;
							}
							print() {
								console.warn(this.value.split("\n").slice(2).join("\n"));
							}
						}
						class _ extends Error {
							constructor(e, t) {
								super(e), this.name = "ListenerLeakError", this.stack = t;
							}
						}
						t.ListenerLeakError = _;
						class f extends Error {
							constructor(e, t) {
								super(e), this.name = "ListenerRefusalError", this.stack = t;
							}
						}
						t.ListenerRefusalError = f;
						let p = 0;
						class g {
							constructor(e) {
								this.value = e, this.id = p++;
							}
						}
						class m {
							constructor(e) {
								this._size = 0, this._options = e, this._leakageMon = c > 0 || this._options?.leakWarningThreshold ? new d(e?.onListenerError ?? s.onUnexpectedError, this._options?.leakWarningThreshold ?? c) : void 0, this._perfMon = this._options?._profName ? new h(this._options._profName) : void 0, this._deliveryQueue = this._options?.deliveryQueue;
							}
							dispose() {
								this._disposed || (this._disposed = !0, this._deliveryQueue?.current === this && this._deliveryQueue.reset(), this._listeners && (this._listeners = void 0, this._size = 0), this._options?.onDidRemoveLastListener?.(), this._leakageMon?.dispose());
							}
							get event() {
								return this._event ??= (e, t, i) => {
									if (this._leakageMon && this._size > this._leakageMon.threshold ** 2) {
										const e = `[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far (${this._size} vs ${this._leakageMon.threshold})`;
										console.warn(e);
										const t = this._leakageMon.getMostFrequentStack() ?? ["UNKNOWN stack", -1], i = new f(`${e}. HINT: Stack shows most frequent listener (${t[1]}-times)`, t[0]);
										return (this._options?.onListenerError || s.onUnexpectedError)(i), n.Disposable.None;
									}
									if (this._disposed) return n.Disposable.None;
									t && (e = e.bind(t));
									const r = new g(e);
									let o;
									this._leakageMon && this._size >= Math.ceil(.2 * this._leakageMon.threshold) && (r.stack = u.create(), o = this._leakageMon.check(r.stack, this._size + 1)), this._listeners ? this._listeners instanceof g ? (this._deliveryQueue ??= new v(), this._listeners = [this._listeners, r]) : this._listeners.push(r) : (this._options?.onWillAddFirstListener?.(this), this._listeners = r, this._options?.onDidAddFirstListener?.(this)), this._size++;
									const a = (0, n.toDisposable)((() => {
										o?.(), this._removeListener(r);
									}));
									return i instanceof n.DisposableStore ? i.add(a) : Array.isArray(i) && i.push(a), a;
								}, this._event;
							}
							_removeListener(e) {
								if (this._options?.onWillRemoveListener?.(this), !this._listeners) return;
								if (1 === this._size) return this._listeners = void 0, this._options?.onDidRemoveLastListener?.(this), void (this._size = 0);
								const t = this._listeners, i = t.indexOf(e);
								if (-1 === i) throw console.log("disposed?", this._disposed), console.log("size?", this._size), console.log("arr?", JSON.stringify(this._listeners)), /* @__PURE__ */ new Error("Attempted to dispose unknown listener");
								this._size--, t[i] = void 0;
								const s = this._deliveryQueue.current === this;
								if (2 * this._size <= t.length) {
									let e = 0;
									for (let i = 0; i < t.length; i++) t[i] ? t[e++] = t[i] : s && (this._deliveryQueue.end--, e < this._deliveryQueue.i && this._deliveryQueue.i--);
									t.length = e;
								}
							}
							_deliver(e, t) {
								if (!e) return;
								const i = this._options?.onListenerError || s.onUnexpectedError;
								if (i) try {
									e.value(t);
								} catch (e) {
									i(e);
								}
								else e.value(t);
							}
							_deliverQueue(e) {
								const t = e.current._listeners;
								for (; e.i < e.end;) this._deliver(t[e.i++], e.value);
								e.reset();
							}
							fire(e) {
								if (this._deliveryQueue?.current && (this._deliverQueue(this._deliveryQueue), this._perfMon?.stop()), this._perfMon?.start(this._size), this._listeners) if (this._listeners instanceof g) this._deliver(this._listeners, e);
								else {
									const t = this._deliveryQueue;
									t.enqueue(this, e, this._listeners.length), this._deliverQueue(t);
								}
								this._perfMon?.stop();
							}
							hasListeners() {
								return this._size > 0;
							}
						}
						t.Emitter = m, t.createEventDeliveryQueue = () => new v();
						class v {
							constructor() {
								this.i = -1, this.end = 0;
							}
							enqueue(e, t, i) {
								this.i = 0, this.end = i, this.current = e, this.value = t;
							}
							reset() {
								this.i = this.end, this.current = void 0, this.value = void 0;
							}
						}
						t.AsyncEmitter = class extends m {
							async fireAsync(e, t, i) {
								if (this._listeners) for (this._asyncDeliveryQueue || (this._asyncDeliveryQueue = new o.LinkedList()), ((e, t) => {
									if (e instanceof g) t(e);
									else for (let i = 0; i < e.length; i++) {
										const s = e[i];
										s && t(s);
									}
								})(this._listeners, ((t) => this._asyncDeliveryQueue.push([t.value, e]))); this._asyncDeliveryQueue.size > 0 && !t.isCancellationRequested;) {
									const [e, r] = this._asyncDeliveryQueue.shift(), n = [], o = {
										...r,
										token: t,
										waitUntil: (t) => {
											if (Object.isFrozen(n)) throw new Error("waitUntil can NOT be called asynchronous");
											i && (t = i(t, e)), n.push(t);
										}
									};
									try {
										e(o);
									} catch (e) {
										(0, s.onUnexpectedError)(e);
										continue;
									}
									Object.freeze(n), await Promise.allSettled(n).then(((e) => {
										for (const t of e) "rejected" === t.status && (0, s.onUnexpectedError)(t.reason);
									}));
								}
							}
						};
						class S extends m {
							get isPaused() {
								return 0 !== this._isPaused;
							}
							constructor(e) {
								super(e), this._isPaused = 0, this._eventQueue = new o.LinkedList(), this._mergeFn = e?.merge;
							}
							pause() {
								this._isPaused++;
							}
							resume() {
								if (0 !== this._isPaused && 0 == --this._isPaused) if (this._mergeFn) {
									if (this._eventQueue.size > 0) {
										const e = Array.from(this._eventQueue);
										this._eventQueue.clear(), super.fire(this._mergeFn(e));
									}
								} else for (; !this._isPaused && 0 !== this._eventQueue.size;) super.fire(this._eventQueue.shift());
							}
							fire(e) {
								this._size && (0 !== this._isPaused ? this._eventQueue.push(e) : super.fire(e));
							}
						}
						t.PauseableEmitter = S, t.DebounceEmitter = class extends S {
							constructor(e) {
								super(e), this._delay = e.delay ?? 100;
							}
							fire(e) {
								this._handle || (this.pause(), this._handle = setTimeout((() => {
									this._handle = void 0, this.resume();
								}), this._delay)), super.fire(e);
							}
						}, t.MicrotaskEmitter = class extends m {
							constructor(e) {
								super(e), this._queuedEvents = [], this._mergeFn = e?.merge;
							}
							fire(e) {
								this.hasListeners() && (this._queuedEvents.push(e), 1 === this._queuedEvents.length && queueMicrotask((() => {
									this._mergeFn ? super.fire(this._mergeFn(this._queuedEvents)) : this._queuedEvents.forEach(((e) => super.fire(e))), this._queuedEvents = [];
								})));
							}
						};
						class b {
							constructor() {
								this.hasListeners = !1, this.events = [], this.emitter = new m({
									onWillAddFirstListener: () => this.onFirstListenerAdd(),
									onDidRemoveLastListener: () => this.onLastListenerRemove()
								});
							}
							get event() {
								return this.emitter.event;
							}
							add(e) {
								const t = {
									event: e,
									listener: null
								};
								return this.events.push(t), this.hasListeners && this.hook(t), (0, n.toDisposable)((0, r.createSingleCallFunction)((() => {
									this.hasListeners && this.unhook(t);
									const e = this.events.indexOf(t);
									this.events.splice(e, 1);
								})));
							}
							onFirstListenerAdd() {
								this.hasListeners = !0, this.events.forEach(((e) => this.hook(e)));
							}
							onLastListenerRemove() {
								this.hasListeners = !1, this.events.forEach(((e) => this.unhook(e)));
							}
							hook(e) {
								e.listener = e.event(((e) => this.emitter.fire(e)));
							}
							unhook(e) {
								e.listener?.dispose(), e.listener = null;
							}
							dispose() {
								this.emitter.dispose();
								for (const e of this.events) e.listener?.dispose();
								this.events = [];
							}
						}
						t.EventMultiplexer = b, t.DynamicListEventMultiplexer = class {
							constructor(e, t, i, s) {
								this._store = new n.DisposableStore();
								const r = this._store.add(new b()), o = this._store.add(new n.DisposableMap());
								function a(e) {
									o.set(e, r.add(s(e)));
								}
								for (const t of e) a(t);
								this._store.add(t(((e) => {
									a(e);
								}))), this._store.add(i(((e) => {
									o.deleteAndDispose(e);
								}))), this.event = r.event;
							}
							dispose() {
								this._store.dispose();
							}
						}, t.EventBufferer = class {
							constructor() {
								this.data = [];
							}
							wrapEvent(e, t, i) {
								return (s, r, n) => e(((e) => {
									const n = this.data[this.data.length - 1];
									if (!t) return void (n ? n.buffers.push((() => s.call(r, e))) : s.call(r, e));
									const o = n;
									o ? (o.items ??= [], o.items.push(e), 0 === o.buffers.length && n.buffers.push((() => {
										o.reducedResult ??= i ? o.items.reduce(t, i) : o.items.reduce(t), s.call(r, o.reducedResult);
									}))) : s.call(r, t(i, e));
								}), void 0, n);
							}
							bufferEvents(e) {
								const t = { buffers: new Array() };
								this.data.push(t);
								const i = e();
								return this.data.pop(), t.buffers.forEach(((e) => e())), i;
							}
						}, t.Relay = class {
							constructor() {
								this.listening = !1, this.inputEvent = l.None, this.inputEventListener = n.Disposable.None, this.emitter = new m({
									onDidAddFirstListener: () => {
										this.listening = !0, this.inputEventListener = this.inputEvent(this.emitter.fire, this.emitter);
									},
									onDidRemoveLastListener: () => {
										this.listening = !1, this.inputEventListener.dispose();
									}
								}), this.event = this.emitter.event;
							}
							set input(e) {
								this.inputEvent = e, this.listening && (this.inputEventListener.dispose(), this.inputEventListener = e(this.emitter.fire, this.emitter));
							}
							dispose() {
								this.inputEventListener.dispose(), this.emitter.dispose();
							}
						}, t.ValueWithChangeEvent = class {
							static const(e) {
								return new C(e);
							}
							constructor(e) {
								this._value = e, this._onDidChange = new m(), this.onDidChange = this._onDidChange.event;
							}
							get value() {
								return this._value;
							}
							set value(e) {
								e !== this._value && (this._value = e, this._onDidChange.fire(void 0));
							}
						};
						class C {
							constructor(e) {
								this.value = e, this.onDidChange = l.None;
							}
						}
					},
					8841: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.createSingleCallFunction = function(e, t) {
							const i = this;
							let s, r = !1;
							return function() {
								if (r) return s;
								if (r = !0, t) try {
									s = e.apply(i, arguments);
								} finally {
									t();
								}
								else s = e.apply(i, arguments);
								return s;
							};
						};
					},
					6304: function(e, t, i) {
						var s = this && this.__createBinding || (Object.create ? function(e, t, i, s) {
							void 0 === s && (s = i);
							var r = Object.getOwnPropertyDescriptor(t, i);
							r && !("get" in r ? !t.__esModule : r.writable || r.configurable) || (r = {
								enumerable: !0,
								get: function() {
									return t[i];
								}
							}), Object.defineProperty(e, s, r);
						} : function(e, t, i, s) {
							void 0 === s && (s = i), e[s] = t[i];
						}), r = this && this.__setModuleDefault || (Object.create ? function(e, t) {
							Object.defineProperty(e, "default", {
								enumerable: !0,
								value: t
							});
						} : function(e, t) {
							e.default = t;
						}), n = this && this.__importStar || function(e) {
							if (e && e.__esModule) return e;
							var t = {};
							if (null != e) for (var i in e) "default" !== i && Object.prototype.hasOwnProperty.call(e, i) && s(t, e, i);
							return r(t, e), t;
						};
						Object.defineProperty(t, "__esModule", { value: !0 }), t.StringSHA1 = t.Hasher = void 0, t.hash = function(e) {
							return a(e, 0);
						}, t.doHash = a, t.numberHash = l, t.stringHash = h, t.toHexString = _;
						const o = n(i(1316));
						function a(e, t) {
							switch (typeof e) {
								case "object": return null === e ? l(349, t) : Array.isArray(e) ? (i = e, s = l(104579, s = t), i.reduce(((e, t) => a(t, e)), s)) : function(e, t) {
									return t = l(181387, t), Object.keys(e).sort().reduce(((t, i) => (t = h(i, t), a(e[i], t))), t);
								}(e, t);
								case "string": return h(e, t);
								case "boolean": return function(e, t) {
									return l(e ? 433 : 863, t);
								}(e, t);
								case "number": return l(e, t);
								case "undefined": return l(937, t);
								default: return l(617, t);
							}
							var i, s;
						}
						function l(e, t) {
							return (t << 5) - t + e | 0;
						}
						function h(e, t) {
							t = l(149417, t);
							for (let i = 0, s = e.length; i < s; i++) t = l(e.charCodeAt(i), t);
							return t;
						}
						var c;
						function d(e, t, i = 32) {
							const s = i - t;
							return (e << t | (~((1 << s) - 1) & e) >>> s) >>> 0;
						}
						function u(e, t = 0, i = e.byteLength, s = 0) {
							for (let r = 0; r < i; r++) e[t + r] = s;
						}
						function _(e, t = 32) {
							return e instanceof ArrayBuffer ? Array.from(new Uint8Array(e)).map(((e) => e.toString(16).padStart(2, "0"))).join("") : function(e, t, i = "0") {
								for (; e.length < t;) e = i + e;
								return e;
							}((e >>> 0).toString(16), t / 4);
						}
						t.Hasher = class {
							constructor() {
								this._value = 0;
							}
							get value() {
								return this._value;
							}
							hash(e) {
								return this._value = a(e, this._value), this._value;
							}
						}, function(e) {
							e[e.BLOCK_SIZE = 64] = "BLOCK_SIZE", e[e.UNICODE_REPLACEMENT = 65533] = "UNICODE_REPLACEMENT";
						}(c || (c = {}));
						class f {
							static {
								this._bigBlock32 = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(320));
							}
							constructor() {
								this._h0 = 1732584193, this._h1 = 4023233417, this._h2 = 2562383102, this._h3 = 271733878, this._h4 = 3285377520, this._buff = new Uint8Array(c.BLOCK_SIZE + 3), this._buffDV = new DataView(this._buff.buffer), this._buffLen = 0, this._totalLen = 0, this._leftoverHighSurrogate = 0, this._finished = !1;
							}
							update(e) {
								const t = e.length;
								if (0 === t) return;
								const i = this._buff;
								let s, r, n = this._buffLen, a = this._leftoverHighSurrogate;
								for (0 !== a ? (s = a, r = -1, a = 0) : (s = e.charCodeAt(0), r = 0);;) {
									let l = s;
									if (o.isHighSurrogate(s)) {
										if (!(r + 1 < t)) {
											a = s;
											break;
										}
										{
											const t = e.charCodeAt(r + 1);
											o.isLowSurrogate(t) ? (r++, l = o.computeCodePoint(s, t)) : l = c.UNICODE_REPLACEMENT;
										}
									} else o.isLowSurrogate(s) && (l = c.UNICODE_REPLACEMENT);
									if (n = this._push(i, n, l), r++, !(r < t)) break;
									s = e.charCodeAt(r);
								}
								this._buffLen = n, this._leftoverHighSurrogate = a;
							}
							_push(e, t, i) {
								return i < 128 ? e[t++] = i : i < 2048 ? (e[t++] = 192 | (1984 & i) >>> 6, e[t++] = 128 | (63 & i) >>> 0) : i < 65536 ? (e[t++] = 224 | (61440 & i) >>> 12, e[t++] = 128 | (4032 & i) >>> 6, e[t++] = 128 | (63 & i) >>> 0) : (e[t++] = 240 | (1835008 & i) >>> 18, e[t++] = 128 | (258048 & i) >>> 12, e[t++] = 128 | (4032 & i) >>> 6, e[t++] = 128 | (63 & i) >>> 0), t >= c.BLOCK_SIZE && (this._step(), t -= c.BLOCK_SIZE, this._totalLen += c.BLOCK_SIZE, e[0] = e[c.BLOCK_SIZE + 0], e[1] = e[c.BLOCK_SIZE + 1], e[2] = e[c.BLOCK_SIZE + 2]), t;
							}
							digest() {
								return this._finished || (this._finished = !0, this._leftoverHighSurrogate && (this._leftoverHighSurrogate = 0, this._buffLen = this._push(this._buff, this._buffLen, c.UNICODE_REPLACEMENT)), this._totalLen += this._buffLen, this._wrapUp()), _(this._h0) + _(this._h1) + _(this._h2) + _(this._h3) + _(this._h4);
							}
							_wrapUp() {
								this._buff[this._buffLen++] = 128, u(this._buff, this._buffLen), this._buffLen > 56 && (this._step(), u(this._buff));
								const e = 8 * this._totalLen;
								this._buffDV.setUint32(56, Math.floor(e / 4294967296), !1), this._buffDV.setUint32(60, e % 4294967296, !1), this._step();
							}
							_step() {
								const e = f._bigBlock32, t = this._buffDV;
								for (let i = 0; i < 64; i += 4) e.setUint32(i, t.getUint32(i, !1), !1);
								for (let t = 64; t < 320; t += 4) e.setUint32(t, d(e.getUint32(t - 12, !1) ^ e.getUint32(t - 32, !1) ^ e.getUint32(t - 56, !1) ^ e.getUint32(t - 64, !1), 1), !1);
								let i, s, r, n = this._h0, o = this._h1, a = this._h2, l = this._h3, h = this._h4;
								for (let t = 0; t < 80; t++) t < 20 ? (i = o & a | ~o & l, s = 1518500249) : t < 40 ? (i = o ^ a ^ l, s = 1859775393) : t < 60 ? (i = o & a | o & l | a & l, s = 2400959708) : (i = o ^ a ^ l, s = 3395469782), r = d(n, 5) + i + h + s + e.getUint32(4 * t, !1) & 4294967295, h = l, l = a, a = d(o, 30), o = n, n = r;
								this._h0 = this._h0 + n & 4294967295, this._h1 = this._h1 + o & 4294967295, this._h2 = this._h2 + a & 4294967295, this._h3 = this._h3 + l & 4294967295, this._h4 = this._h4 + h & 4294967295;
							}
						}
						t.StringSHA1 = f;
					},
					4218: (e, t) => {
						var i;
						Object.defineProperty(t, "__esModule", { value: !0 }), t.Iterable = void 0, function(e) {
							function t(e) {
								return e && "object" == typeof e && "function" == typeof e[Symbol.iterator];
							}
							e.is = t;
							const i = Object.freeze([]);
							function* s(e) {
								yield e;
							}
							e.empty = function() {
								return i;
							}, e.single = s, e.wrap = function(e) {
								return t(e) ? e : s(e);
							}, e.from = function(e) {
								return e || i;
							}, e.reverse = function* (e) {
								for (let t = e.length - 1; t >= 0; t--) yield e[t];
							}, e.isEmpty = function(e) {
								return !e || !0 === e[Symbol.iterator]().next().done;
							}, e.first = function(e) {
								return e[Symbol.iterator]().next().value;
							}, e.some = function(e, t) {
								let i = 0;
								for (const s of e) if (t(s, i++)) return !0;
								return !1;
							}, e.find = function(e, t) {
								for (const i of e) if (t(i)) return i;
							}, e.filter = function* (e, t) {
								for (const i of e) t(i) && (yield i);
							}, e.map = function* (e, t) {
								let i = 0;
								for (const s of e) yield t(s, i++);
							}, e.flatMap = function* (e, t) {
								let i = 0;
								for (const s of e) yield* t(s, i++);
							}, e.concat = function* (...e) {
								for (const t of e) yield* t;
							}, e.reduce = function(e, t, i) {
								let s = i;
								for (const i of e) s = t(s, i);
								return s;
							}, e.slice = function* (e, t, i = e.length) {
								for (t < 0 && (t += e.length), i < 0 ? i += e.length : i > e.length && (i = e.length); t < i; t++) yield e[t];
							}, e.consume = function(t, i = Number.POSITIVE_INFINITY) {
								const s = [];
								if (0 === i) return [s, t];
								const r = t[Symbol.iterator]();
								for (let t = 0; t < i; t++) {
									const t = r.next();
									if (t.done) return [s, e.empty()];
									s.push(t.value);
								}
								return [s, { [Symbol.iterator]: () => r }];
							}, e.asyncToArray = async function(e) {
								const t = [];
								for await (const i of e) t.push(i);
								return Promise.resolve(t);
							};
						}(i || (t.Iterable = i = {}));
					},
					7883: (e, t) => {
						var i, s;
						Object.defineProperty(t, "__esModule", { value: !0 }), t.KeyMod = t.KeyCodeUtils = t.ScanCodeUtils = t.NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE = t.EVENT_KEY_CODE_MAP = t.ScanCode = t.KeyCode = void 0, t.KeyChord = function(e, t) {
							return (e | (65535 & t) << 16 >>> 0) >>> 0;
						}, function(e) {
							e[e.DependsOnKbLayout = -1] = "DependsOnKbLayout", e[e.Unknown = 0] = "Unknown", e[e.Backspace = 1] = "Backspace", e[e.Tab = 2] = "Tab", e[e.Enter = 3] = "Enter", e[e.Shift = 4] = "Shift", e[e.Ctrl = 5] = "Ctrl", e[e.Alt = 6] = "Alt", e[e.PauseBreak = 7] = "PauseBreak", e[e.CapsLock = 8] = "CapsLock", e[e.Escape = 9] = "Escape", e[e.Space = 10] = "Space", e[e.PageUp = 11] = "PageUp", e[e.PageDown = 12] = "PageDown", e[e.End = 13] = "End", e[e.Home = 14] = "Home", e[e.LeftArrow = 15] = "LeftArrow", e[e.UpArrow = 16] = "UpArrow", e[e.RightArrow = 17] = "RightArrow", e[e.DownArrow = 18] = "DownArrow", e[e.Insert = 19] = "Insert", e[e.Delete = 20] = "Delete", e[e.Digit0 = 21] = "Digit0", e[e.Digit1 = 22] = "Digit1", e[e.Digit2 = 23] = "Digit2", e[e.Digit3 = 24] = "Digit3", e[e.Digit4 = 25] = "Digit4", e[e.Digit5 = 26] = "Digit5", e[e.Digit6 = 27] = "Digit6", e[e.Digit7 = 28] = "Digit7", e[e.Digit8 = 29] = "Digit8", e[e.Digit9 = 30] = "Digit9", e[e.KeyA = 31] = "KeyA", e[e.KeyB = 32] = "KeyB", e[e.KeyC = 33] = "KeyC", e[e.KeyD = 34] = "KeyD", e[e.KeyE = 35] = "KeyE", e[e.KeyF = 36] = "KeyF", e[e.KeyG = 37] = "KeyG", e[e.KeyH = 38] = "KeyH", e[e.KeyI = 39] = "KeyI", e[e.KeyJ = 40] = "KeyJ", e[e.KeyK = 41] = "KeyK", e[e.KeyL = 42] = "KeyL", e[e.KeyM = 43] = "KeyM", e[e.KeyN = 44] = "KeyN", e[e.KeyO = 45] = "KeyO", e[e.KeyP = 46] = "KeyP", e[e.KeyQ = 47] = "KeyQ", e[e.KeyR = 48] = "KeyR", e[e.KeyS = 49] = "KeyS", e[e.KeyT = 50] = "KeyT", e[e.KeyU = 51] = "KeyU", e[e.KeyV = 52] = "KeyV", e[e.KeyW = 53] = "KeyW", e[e.KeyX = 54] = "KeyX", e[e.KeyY = 55] = "KeyY", e[e.KeyZ = 56] = "KeyZ", e[e.Meta = 57] = "Meta", e[e.ContextMenu = 58] = "ContextMenu", e[e.F1 = 59] = "F1", e[e.F2 = 60] = "F2", e[e.F3 = 61] = "F3", e[e.F4 = 62] = "F4", e[e.F5 = 63] = "F5", e[e.F6 = 64] = "F6", e[e.F7 = 65] = "F7", e[e.F8 = 66] = "F8", e[e.F9 = 67] = "F9", e[e.F10 = 68] = "F10", e[e.F11 = 69] = "F11", e[e.F12 = 70] = "F12", e[e.F13 = 71] = "F13", e[e.F14 = 72] = "F14", e[e.F15 = 73] = "F15", e[e.F16 = 74] = "F16", e[e.F17 = 75] = "F17", e[e.F18 = 76] = "F18", e[e.F19 = 77] = "F19", e[e.F20 = 78] = "F20", e[e.F21 = 79] = "F21", e[e.F22 = 80] = "F22", e[e.F23 = 81] = "F23", e[e.F24 = 82] = "F24", e[e.NumLock = 83] = "NumLock", e[e.ScrollLock = 84] = "ScrollLock", e[e.Semicolon = 85] = "Semicolon", e[e.Equal = 86] = "Equal", e[e.Comma = 87] = "Comma", e[e.Minus = 88] = "Minus", e[e.Period = 89] = "Period", e[e.Slash = 90] = "Slash", e[e.Backquote = 91] = "Backquote", e[e.BracketLeft = 92] = "BracketLeft", e[e.Backslash = 93] = "Backslash", e[e.BracketRight = 94] = "BracketRight", e[e.Quote = 95] = "Quote", e[e.OEM_8 = 96] = "OEM_8", e[e.IntlBackslash = 97] = "IntlBackslash", e[e.Numpad0 = 98] = "Numpad0", e[e.Numpad1 = 99] = "Numpad1", e[e.Numpad2 = 100] = "Numpad2", e[e.Numpad3 = 101] = "Numpad3", e[e.Numpad4 = 102] = "Numpad4", e[e.Numpad5 = 103] = "Numpad5", e[e.Numpad6 = 104] = "Numpad6", e[e.Numpad7 = 105] = "Numpad7", e[e.Numpad8 = 106] = "Numpad8", e[e.Numpad9 = 107] = "Numpad9", e[e.NumpadMultiply = 108] = "NumpadMultiply", e[e.NumpadAdd = 109] = "NumpadAdd", e[e.NUMPAD_SEPARATOR = 110] = "NUMPAD_SEPARATOR", e[e.NumpadSubtract = 111] = "NumpadSubtract", e[e.NumpadDecimal = 112] = "NumpadDecimal", e[e.NumpadDivide = 113] = "NumpadDivide", e[e.KEY_IN_COMPOSITION = 114] = "KEY_IN_COMPOSITION", e[e.ABNT_C1 = 115] = "ABNT_C1", e[e.ABNT_C2 = 116] = "ABNT_C2", e[e.AudioVolumeMute = 117] = "AudioVolumeMute", e[e.AudioVolumeUp = 118] = "AudioVolumeUp", e[e.AudioVolumeDown = 119] = "AudioVolumeDown", e[e.BrowserSearch = 120] = "BrowserSearch", e[e.BrowserHome = 121] = "BrowserHome", e[e.BrowserBack = 122] = "BrowserBack", e[e.BrowserForward = 123] = "BrowserForward", e[e.MediaTrackNext = 124] = "MediaTrackNext", e[e.MediaTrackPrevious = 125] = "MediaTrackPrevious", e[e.MediaStop = 126] = "MediaStop", e[e.MediaPlayPause = 127] = "MediaPlayPause", e[e.LaunchMediaPlayer = 128] = "LaunchMediaPlayer", e[e.LaunchMail = 129] = "LaunchMail", e[e.LaunchApp2 = 130] = "LaunchApp2", e[e.Clear = 131] = "Clear", e[e.MAX_VALUE = 132] = "MAX_VALUE";
						}(i || (t.KeyCode = i = {})), function(e) {
							e[e.DependsOnKbLayout = -1] = "DependsOnKbLayout", e[e.None = 0] = "None", e[e.Hyper = 1] = "Hyper", e[e.Super = 2] = "Super", e[e.Fn = 3] = "Fn", e[e.FnLock = 4] = "FnLock", e[e.Suspend = 5] = "Suspend", e[e.Resume = 6] = "Resume", e[e.Turbo = 7] = "Turbo", e[e.Sleep = 8] = "Sleep", e[e.WakeUp = 9] = "WakeUp", e[e.KeyA = 10] = "KeyA", e[e.KeyB = 11] = "KeyB", e[e.KeyC = 12] = "KeyC", e[e.KeyD = 13] = "KeyD", e[e.KeyE = 14] = "KeyE", e[e.KeyF = 15] = "KeyF", e[e.KeyG = 16] = "KeyG", e[e.KeyH = 17] = "KeyH", e[e.KeyI = 18] = "KeyI", e[e.KeyJ = 19] = "KeyJ", e[e.KeyK = 20] = "KeyK", e[e.KeyL = 21] = "KeyL", e[e.KeyM = 22] = "KeyM", e[e.KeyN = 23] = "KeyN", e[e.KeyO = 24] = "KeyO", e[e.KeyP = 25] = "KeyP", e[e.KeyQ = 26] = "KeyQ", e[e.KeyR = 27] = "KeyR", e[e.KeyS = 28] = "KeyS", e[e.KeyT = 29] = "KeyT", e[e.KeyU = 30] = "KeyU", e[e.KeyV = 31] = "KeyV", e[e.KeyW = 32] = "KeyW", e[e.KeyX = 33] = "KeyX", e[e.KeyY = 34] = "KeyY", e[e.KeyZ = 35] = "KeyZ", e[e.Digit1 = 36] = "Digit1", e[e.Digit2 = 37] = "Digit2", e[e.Digit3 = 38] = "Digit3", e[e.Digit4 = 39] = "Digit4", e[e.Digit5 = 40] = "Digit5", e[e.Digit6 = 41] = "Digit6", e[e.Digit7 = 42] = "Digit7", e[e.Digit8 = 43] = "Digit8", e[e.Digit9 = 44] = "Digit9", e[e.Digit0 = 45] = "Digit0", e[e.Enter = 46] = "Enter", e[e.Escape = 47] = "Escape", e[e.Backspace = 48] = "Backspace", e[e.Tab = 49] = "Tab", e[e.Space = 50] = "Space", e[e.Minus = 51] = "Minus", e[e.Equal = 52] = "Equal", e[e.BracketLeft = 53] = "BracketLeft", e[e.BracketRight = 54] = "BracketRight", e[e.Backslash = 55] = "Backslash", e[e.IntlHash = 56] = "IntlHash", e[e.Semicolon = 57] = "Semicolon", e[e.Quote = 58] = "Quote", e[e.Backquote = 59] = "Backquote", e[e.Comma = 60] = "Comma", e[e.Period = 61] = "Period", e[e.Slash = 62] = "Slash", e[e.CapsLock = 63] = "CapsLock", e[e.F1 = 64] = "F1", e[e.F2 = 65] = "F2", e[e.F3 = 66] = "F3", e[e.F4 = 67] = "F4", e[e.F5 = 68] = "F5", e[e.F6 = 69] = "F6", e[e.F7 = 70] = "F7", e[e.F8 = 71] = "F8", e[e.F9 = 72] = "F9", e[e.F10 = 73] = "F10", e[e.F11 = 74] = "F11", e[e.F12 = 75] = "F12", e[e.PrintScreen = 76] = "PrintScreen", e[e.ScrollLock = 77] = "ScrollLock", e[e.Pause = 78] = "Pause", e[e.Insert = 79] = "Insert", e[e.Home = 80] = "Home", e[e.PageUp = 81] = "PageUp", e[e.Delete = 82] = "Delete", e[e.End = 83] = "End", e[e.PageDown = 84] = "PageDown", e[e.ArrowRight = 85] = "ArrowRight", e[e.ArrowLeft = 86] = "ArrowLeft", e[e.ArrowDown = 87] = "ArrowDown", e[e.ArrowUp = 88] = "ArrowUp", e[e.NumLock = 89] = "NumLock", e[e.NumpadDivide = 90] = "NumpadDivide", e[e.NumpadMultiply = 91] = "NumpadMultiply", e[e.NumpadSubtract = 92] = "NumpadSubtract", e[e.NumpadAdd = 93] = "NumpadAdd", e[e.NumpadEnter = 94] = "NumpadEnter", e[e.Numpad1 = 95] = "Numpad1", e[e.Numpad2 = 96] = "Numpad2", e[e.Numpad3 = 97] = "Numpad3", e[e.Numpad4 = 98] = "Numpad4", e[e.Numpad5 = 99] = "Numpad5", e[e.Numpad6 = 100] = "Numpad6", e[e.Numpad7 = 101] = "Numpad7", e[e.Numpad8 = 102] = "Numpad8", e[e.Numpad9 = 103] = "Numpad9", e[e.Numpad0 = 104] = "Numpad0", e[e.NumpadDecimal = 105] = "NumpadDecimal", e[e.IntlBackslash = 106] = "IntlBackslash", e[e.ContextMenu = 107] = "ContextMenu", e[e.Power = 108] = "Power", e[e.NumpadEqual = 109] = "NumpadEqual", e[e.F13 = 110] = "F13", e[e.F14 = 111] = "F14", e[e.F15 = 112] = "F15", e[e.F16 = 113] = "F16", e[e.F17 = 114] = "F17", e[e.F18 = 115] = "F18", e[e.F19 = 116] = "F19", e[e.F20 = 117] = "F20", e[e.F21 = 118] = "F21", e[e.F22 = 119] = "F22", e[e.F23 = 120] = "F23", e[e.F24 = 121] = "F24", e[e.Open = 122] = "Open", e[e.Help = 123] = "Help", e[e.Select = 124] = "Select", e[e.Again = 125] = "Again", e[e.Undo = 126] = "Undo", e[e.Cut = 127] = "Cut", e[e.Copy = 128] = "Copy", e[e.Paste = 129] = "Paste", e[e.Find = 130] = "Find", e[e.AudioVolumeMute = 131] = "AudioVolumeMute", e[e.AudioVolumeUp = 132] = "AudioVolumeUp", e[e.AudioVolumeDown = 133] = "AudioVolumeDown", e[e.NumpadComma = 134] = "NumpadComma", e[e.IntlRo = 135] = "IntlRo", e[e.KanaMode = 136] = "KanaMode", e[e.IntlYen = 137] = "IntlYen", e[e.Convert = 138] = "Convert", e[e.NonConvert = 139] = "NonConvert", e[e.Lang1 = 140] = "Lang1", e[e.Lang2 = 141] = "Lang2", e[e.Lang3 = 142] = "Lang3", e[e.Lang4 = 143] = "Lang4", e[e.Lang5 = 144] = "Lang5", e[e.Abort = 145] = "Abort", e[e.Props = 146] = "Props", e[e.NumpadParenLeft = 147] = "NumpadParenLeft", e[e.NumpadParenRight = 148] = "NumpadParenRight", e[e.NumpadBackspace = 149] = "NumpadBackspace", e[e.NumpadMemoryStore = 150] = "NumpadMemoryStore", e[e.NumpadMemoryRecall = 151] = "NumpadMemoryRecall", e[e.NumpadMemoryClear = 152] = "NumpadMemoryClear", e[e.NumpadMemoryAdd = 153] = "NumpadMemoryAdd", e[e.NumpadMemorySubtract = 154] = "NumpadMemorySubtract", e[e.NumpadClear = 155] = "NumpadClear", e[e.NumpadClearEntry = 156] = "NumpadClearEntry", e[e.ControlLeft = 157] = "ControlLeft", e[e.ShiftLeft = 158] = "ShiftLeft", e[e.AltLeft = 159] = "AltLeft", e[e.MetaLeft = 160] = "MetaLeft", e[e.ControlRight = 161] = "ControlRight", e[e.ShiftRight = 162] = "ShiftRight", e[e.AltRight = 163] = "AltRight", e[e.MetaRight = 164] = "MetaRight", e[e.BrightnessUp = 165] = "BrightnessUp", e[e.BrightnessDown = 166] = "BrightnessDown", e[e.MediaPlay = 167] = "MediaPlay", e[e.MediaRecord = 168] = "MediaRecord", e[e.MediaFastForward = 169] = "MediaFastForward", e[e.MediaRewind = 170] = "MediaRewind", e[e.MediaTrackNext = 171] = "MediaTrackNext", e[e.MediaTrackPrevious = 172] = "MediaTrackPrevious", e[e.MediaStop = 173] = "MediaStop", e[e.Eject = 174] = "Eject", e[e.MediaPlayPause = 175] = "MediaPlayPause", e[e.MediaSelect = 176] = "MediaSelect", e[e.LaunchMail = 177] = "LaunchMail", e[e.LaunchApp2 = 178] = "LaunchApp2", e[e.LaunchApp1 = 179] = "LaunchApp1", e[e.SelectTask = 180] = "SelectTask", e[e.LaunchScreenSaver = 181] = "LaunchScreenSaver", e[e.BrowserSearch = 182] = "BrowserSearch", e[e.BrowserHome = 183] = "BrowserHome", e[e.BrowserBack = 184] = "BrowserBack", e[e.BrowserForward = 185] = "BrowserForward", e[e.BrowserStop = 186] = "BrowserStop", e[e.BrowserRefresh = 187] = "BrowserRefresh", e[e.BrowserFavorites = 188] = "BrowserFavorites", e[e.ZoomToggle = 189] = "ZoomToggle", e[e.MailReply = 190] = "MailReply", e[e.MailForward = 191] = "MailForward", e[e.MailSend = 192] = "MailSend", e[e.MAX_VALUE = 193] = "MAX_VALUE";
						}(s || (t.ScanCode = s = {}));
						class r {
							constructor() {
								this._keyCodeToStr = [], this._strToKeyCode = Object.create(null);
							}
							define(e, t) {
								this._keyCodeToStr[e] = t, this._strToKeyCode[t.toLowerCase()] = e;
							}
							keyCodeToStr(e) {
								return this._keyCodeToStr[e];
							}
							strToKeyCode(e) {
								return this._strToKeyCode[e.toLowerCase()] || i.Unknown;
							}
						}
						const n = new r(), o = new r(), a = new r();
						t.EVENT_KEY_CODE_MAP = new Array(230), t.NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE = {};
						const l = [], h = Object.create(null), c = Object.create(null);
						var d, u;
						t.ScanCodeUtils = {
							lowerCaseToEnum: (e) => c[e] || s.None,
							toEnum: (e) => h[e] || s.None,
							toString: (e) => l[e] || "None"
						}, function(e) {
							e.toString = function(e) {
								return n.keyCodeToStr(e);
							}, e.fromString = function(e) {
								return n.strToKeyCode(e);
							}, e.toUserSettingsUS = function(e) {
								return o.keyCodeToStr(e);
							}, e.toUserSettingsGeneral = function(e) {
								return a.keyCodeToStr(e);
							}, e.fromUserSettings = function(e) {
								return o.strToKeyCode(e) || a.strToKeyCode(e);
							}, e.toElectronAccelerator = function(e) {
								if (e >= i.Numpad0 && e <= i.NumpadDivide) return null;
								switch (e) {
									case i.UpArrow: return "Up";
									case i.DownArrow: return "Down";
									case i.LeftArrow: return "Left";
									case i.RightArrow: return "Right";
								}
								return n.keyCodeToStr(e);
							};
						}(d || (t.KeyCodeUtils = d = {})), function(e) {
							e[e.CtrlCmd = 2048] = "CtrlCmd", e[e.Shift = 1024] = "Shift", e[e.Alt = 512] = "Alt", e[e.WinCtrl = 256] = "WinCtrl";
						}(u || (t.KeyMod = u = {}));
					},
					2811: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.ResolvedKeybinding = t.ResolvedChord = t.Keybinding = t.ScanCodeChord = t.KeyCodeChord = void 0, t.decodeKeybinding = function(e, t) {
							if ("number" == typeof e) {
								if (0 === e) return null;
								const i = (65535 & e) >>> 0, s = (4294901760 & e) >>> 16;
								return new c(0 !== s ? [a(i, t), a(s, t)] : [a(i, t)]);
							}
							{
								const i = [];
								for (let s = 0; s < e.length; s++) i.push(a(e[s], t));
								return new c(i);
							}
						}, t.createSimpleKeybinding = a;
						const s = i(9807), r = i(7883), n = i(8163);
						var o;
						function a(e, t) {
							const i = !!(e & o.CtrlCmd), s = !!(e & o.WinCtrl), r = t === n.OperatingSystem.Macintosh ? s : i, a = !!(e & o.Shift), h = !!(e & o.Alt), c = t === n.OperatingSystem.Macintosh ? i : s, d = e & o.KeyCode;
							return new l(r, a, h, c, d);
						}
						(function(e) {
							e[e.CtrlCmd = 2048] = "CtrlCmd", e[e.Shift = 1024] = "Shift", e[e.Alt = 512] = "Alt", e[e.WinCtrl = 256] = "WinCtrl", e[e.KeyCode = 255] = "KeyCode";
						})(o || (o = {}));
						class l {
							constructor(e, t, i, s, r) {
								this.ctrlKey = e, this.shiftKey = t, this.altKey = i, this.metaKey = s, this.keyCode = r;
							}
							equals(e) {
								return e instanceof l && this.ctrlKey === e.ctrlKey && this.shiftKey === e.shiftKey && this.altKey === e.altKey && this.metaKey === e.metaKey && this.keyCode === e.keyCode;
							}
							getHashCode() {
								return `K${this.ctrlKey ? "1" : "0"}${this.shiftKey ? "1" : "0"}${this.altKey ? "1" : "0"}${this.metaKey ? "1" : "0"}${this.keyCode}`;
							}
							isModifierKey() {
								return this.keyCode === r.KeyCode.Unknown || this.keyCode === r.KeyCode.Ctrl || this.keyCode === r.KeyCode.Meta || this.keyCode === r.KeyCode.Alt || this.keyCode === r.KeyCode.Shift;
							}
							toKeybinding() {
								return new c([this]);
							}
							isDuplicateModifierCase() {
								return this.ctrlKey && this.keyCode === r.KeyCode.Ctrl || this.shiftKey && this.keyCode === r.KeyCode.Shift || this.altKey && this.keyCode === r.KeyCode.Alt || this.metaKey && this.keyCode === r.KeyCode.Meta;
							}
						}
						t.KeyCodeChord = l;
						class h {
							constructor(e, t, i, s, r) {
								this.ctrlKey = e, this.shiftKey = t, this.altKey = i, this.metaKey = s, this.scanCode = r;
							}
							equals(e) {
								return e instanceof h && this.ctrlKey === e.ctrlKey && this.shiftKey === e.shiftKey && this.altKey === e.altKey && this.metaKey === e.metaKey && this.scanCode === e.scanCode;
							}
							getHashCode() {
								return `S${this.ctrlKey ? "1" : "0"}${this.shiftKey ? "1" : "0"}${this.altKey ? "1" : "0"}${this.metaKey ? "1" : "0"}${this.scanCode}`;
							}
							isDuplicateModifierCase() {
								return this.ctrlKey && (this.scanCode === r.ScanCode.ControlLeft || this.scanCode === r.ScanCode.ControlRight) || this.shiftKey && (this.scanCode === r.ScanCode.ShiftLeft || this.scanCode === r.ScanCode.ShiftRight) || this.altKey && (this.scanCode === r.ScanCode.AltLeft || this.scanCode === r.ScanCode.AltRight) || this.metaKey && (this.scanCode === r.ScanCode.MetaLeft || this.scanCode === r.ScanCode.MetaRight);
							}
						}
						t.ScanCodeChord = h;
						class c {
							constructor(e) {
								if (0 === e.length) throw (0, s.illegalArgument)("chords");
								this.chords = e;
							}
							getHashCode() {
								let e = "";
								for (let t = 0, i = this.chords.length; t < i; t++) 0 !== t && (e += ";"), e += this.chords[t].getHashCode();
								return e;
							}
							equals(e) {
								if (null === e) return !1;
								if (this.chords.length !== e.chords.length) return !1;
								for (let t = 0; t < this.chords.length; t++) if (!this.chords[t].equals(e.chords[t])) return !1;
								return !0;
							}
						}
						t.Keybinding = c, t.ResolvedChord = class {
							constructor(e, t, i, s, r, n) {
								this.ctrlKey = e, this.shiftKey = t, this.altKey = i, this.metaKey = s, this.keyLabel = r, this.keyAriaLabel = n;
							}
						}, t.ResolvedKeybinding = class {};
					},
					626: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.Lazy = void 0, t.Lazy = class {
							constructor(e) {
								this.executor = e, this._didRun = !1;
							}
							get hasValue() {
								return this._didRun;
							}
							get value() {
								if (!this._didRun) try {
									this._value = this.executor();
								} catch (e) {
									this._error = e;
								} finally {
									this._didRun = !0;
								}
								if (this._error) throw this._error;
								return this._value;
							}
							get rawValue() {
								return this._value;
							}
						};
					},
					7150: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.DisposableMap = t.ImmortalReference = t.AsyncReferenceCollection = t.ReferenceCollection = t.SafeDisposable = t.RefCountedDisposable = t.MandatoryMutableDisposable = t.MutableDisposable = t.Disposable = t.DisposableStore = t.DisposableTracker = void 0, t.setDisposableTracker = function(e) {
							l = e;
						}, t.trackDisposable = c, t.markAsDisposed = d, t.markAsSingleton = function(e) {
							return l?.markAsSingleton(e), e;
						}, t.isDisposable = _, t.dispose = f, t.disposeIfDisposable = function(e) {
							for (const t of e) _(t) && t.dispose();
							return [];
						}, t.combinedDisposable = function(...e) {
							const t = p((() => f(e)));
							return function(e, t) {
								if (l) for (const i of e) l.setParent(i, t);
							}(e, t), t;
						}, t.toDisposable = p, t.disposeOnReturn = function(e) {
							const t = new g();
							try {
								e(t);
							} finally {
								t.dispose();
							}
						};
						const s = i(3058), r = i(9087), n = i(2608), o = i(8841), a = i(4218);
						let l = null;
						class h {
							constructor() {
								this.livingDisposables = /* @__PURE__ */ new Map();
							}
							static {
								this.idx = 0;
							}
							getDisposableData(e) {
								let t = this.livingDisposables.get(e);
								return t || (t = {
									parent: null,
									source: null,
									isSingleton: !1,
									value: e,
									idx: h.idx++
								}, this.livingDisposables.set(e, t)), t;
							}
							trackDisposable(e) {
								const t = this.getDisposableData(e);
								t.source || (t.source = (/* @__PURE__ */ new Error()).stack);
							}
							setParent(e, t) {
								this.getDisposableData(e).parent = t;
							}
							markAsDisposed(e) {
								this.livingDisposables.delete(e);
							}
							markAsSingleton(e) {
								this.getDisposableData(e).isSingleton = !0;
							}
							getRootParent(e, t) {
								const i = t.get(e);
								if (i) return i;
								const s = e.parent ? this.getRootParent(this.getDisposableData(e.parent), t) : e;
								return t.set(e, s), s;
							}
							getTrackedDisposables() {
								const e = /* @__PURE__ */ new Map();
								return [...this.livingDisposables.entries()].filter((([, t]) => null !== t.source && !this.getRootParent(t, e).isSingleton)).flatMap((([e]) => e));
							}
							computeLeakingDisposables(e = 10, t) {
								let i;
								if (t) i = t;
								else {
									const e = /* @__PURE__ */ new Map(), t = [...this.livingDisposables.values()].filter(((t) => null !== t.source && !this.getRootParent(t, e).isSingleton));
									if (0 === t.length) return;
									const s = new Set(t.map(((e) => e.value)));
									if (i = t.filter(((e) => !(e.parent && s.has(e.parent)))), 0 === i.length) throw new Error("There are cyclic diposable chains!");
								}
								if (!i) return;
								function o(e) {
									const t = e.source.split("\n").map(((e) => e.trim().replace("at ", ""))).filter(((e) => "" !== e));
									return function(e, t) {
										for (; e.length > 0 && t.some(((t) => "string" == typeof t ? t === e[0] : e[0].match(t)));) e.shift();
									}(t, [
										"Error",
										/^trackDisposable \(.*\)$/,
										/^DisposableTracker.trackDisposable \(.*\)$/
									]), t.reverse();
								}
								const a = new n.SetMap();
								for (const e of i) {
									const t = o(e);
									for (let i = 0; i <= t.length; i++) a.add(t.slice(0, i).join("\n"), e);
								}
								i.sort((0, s.compareBy)(((e) => e.idx), s.numberComparator));
								let l = "", h = 0;
								for (const t of i.slice(0, e)) {
									h++;
									const e = o(t), s = [];
									for (let t = 0; t < e.length; t++) {
										let n = e[t];
										n = `(shared with ${a.get(e.slice(0, t + 1).join("\n")).size}/${i.length} leaks) at ${n}`;
										const l = a.get(e.slice(0, t).join("\n")), h = (0, r.groupBy)([...l].map(((e) => o(e)[t])), ((e) => e));
										delete h[e[t]];
										for (const [e, t] of Object.entries(h)) s.unshift(`    - stacktraces of ${t.length} other leaks continue with ${e}`);
										s.unshift(n);
									}
									l += `\n\n\n==================== Leaking disposable ${h}/${i.length}: ${t.value.constructor.name} ====================\n${s.join("\n")}\n============================================================\n\n`;
								}
								return i.length > e && (l += `\n\n\n... and ${i.length - e} more leaking disposables\n\n`), {
									leaks: i,
									details: l
								};
							}
						}
						function c(e) {
							return l?.trackDisposable(e), e;
						}
						function d(e) {
							l?.markAsDisposed(e);
						}
						function u(e, t) {
							l?.setParent(e, t);
						}
						function _(e) {
							return "object" == typeof e && null !== e && "function" == typeof e.dispose && 0 === e.dispose.length;
						}
						function f(e) {
							if (a.Iterable.is(e)) {
								const t = [];
								for (const i of e) if (i) try {
									i.dispose();
								} catch (e) {
									t.push(e);
								}
								if (1 === t.length) throw t[0];
								if (t.length > 1) throw new AggregateError(t, "Encountered errors while disposing of store");
								return Array.isArray(e) ? [] : e;
							}
							if (e) return e.dispose(), e;
						}
						function p(e) {
							const t = c({ dispose: (0, o.createSingleCallFunction)((() => {
								d(t), e();
							})) });
							return t;
						}
						t.DisposableTracker = h;
						class g {
							static {
								this.DISABLE_DISPOSED_WARNING = !1;
							}
							constructor() {
								this._toDispose = /* @__PURE__ */ new Set(), this._isDisposed = !1, c(this);
							}
							dispose() {
								this._isDisposed || (d(this), this._isDisposed = !0, this.clear());
							}
							get isDisposed() {
								return this._isDisposed;
							}
							clear() {
								if (0 !== this._toDispose.size) try {
									f(this._toDispose);
								} finally {
									this._toDispose.clear();
								}
							}
							add(e) {
								if (!e) return e;
								if (e === this) throw new Error("Cannot register a disposable on itself!");
								return u(e, this), this._isDisposed ? g.DISABLE_DISPOSED_WARNING || console.warn((/* @__PURE__ */ new Error("Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!")).stack) : this._toDispose.add(e), e;
							}
							delete(e) {
								if (e) {
									if (e === this) throw new Error("Cannot dispose a disposable on itself!");
									this._toDispose.delete(e), e.dispose();
								}
							}
							deleteAndLeak(e) {
								e && this._toDispose.has(e) && (this._toDispose.delete(e), u(e, null));
							}
						}
						t.DisposableStore = g;
						class m {
							static {
								this.None = Object.freeze({ dispose() {} });
							}
							constructor() {
								this._store = new g(), c(this), u(this._store, this);
							}
							dispose() {
								d(this), this._store.dispose();
							}
							_register(e) {
								if (e === this) throw new Error("Cannot register a disposable on itself!");
								return this._store.add(e);
							}
						}
						t.Disposable = m;
						class v {
							constructor() {
								this._isDisposed = !1, c(this);
							}
							get value() {
								return this._isDisposed ? void 0 : this._value;
							}
							set value(e) {
								this._isDisposed || e === this._value || (this._value?.dispose(), e && u(e, this), this._value = e);
							}
							clear() {
								this.value = void 0;
							}
							dispose() {
								this._isDisposed = !0, d(this), this._value?.dispose(), this._value = void 0;
							}
							clearAndLeak() {
								const e = this._value;
								return this._value = void 0, e && u(e, null), e;
							}
						}
						t.MutableDisposable = v, t.MandatoryMutableDisposable = class {
							constructor(e) {
								this._disposable = new v(), this._isDisposed = !1, this._disposable.value = e;
							}
							get value() {
								return this._disposable.value;
							}
							set value(e) {
								this._isDisposed || e === this._disposable.value || (this._disposable.value = e);
							}
							dispose() {
								this._isDisposed = !0, this._disposable.dispose();
							}
						}, t.RefCountedDisposable = class {
							constructor(e) {
								this._disposable = e, this._counter = 1;
							}
							acquire() {
								return this._counter++, this;
							}
							release() {
								return 0 == --this._counter && this._disposable.dispose(), this;
							}
						}, t.SafeDisposable = class {
							constructor() {
								this.dispose = () => {}, this.unset = () => {}, this.isset = () => !1, c(this);
							}
							set(e) {
								let t = e;
								return this.unset = () => t = void 0, this.isset = () => void 0 !== t, this.dispose = () => {
									t && (t(), t = void 0, d(this));
								}, this;
							}
						}, t.ReferenceCollection = class {
							constructor() {
								this.references = /* @__PURE__ */ new Map();
							}
							acquire(e, ...t) {
								let i = this.references.get(e);
								i || (i = {
									counter: 0,
									object: this.createReferencedObject(e, ...t)
								}, this.references.set(e, i));
								const { object: s } = i, r = (0, o.createSingleCallFunction)((() => {
									0 == --i.counter && (this.destroyReferencedObject(e, i.object), this.references.delete(e));
								}));
								return i.counter++, {
									object: s,
									dispose: r
								};
							}
						}, t.AsyncReferenceCollection = class {
							constructor(e) {
								this.referenceCollection = e;
							}
							async acquire(e, ...t) {
								const i = this.referenceCollection.acquire(e, ...t);
								try {
									return {
										object: await i.object,
										dispose: () => i.dispose()
									};
								} catch (e) {
									throw i.dispose(), e;
								}
							}
						}, t.ImmortalReference = class {
							constructor(e) {
								this.object = e;
							}
							dispose() {}
						};
						class S {
							constructor() {
								this._store = /* @__PURE__ */ new Map(), this._isDisposed = !1, c(this);
							}
							dispose() {
								d(this), this._isDisposed = !0, this.clearAndDisposeAll();
							}
							clearAndDisposeAll() {
								if (this._store.size) try {
									f(this._store.values());
								} finally {
									this._store.clear();
								}
							}
							has(e) {
								return this._store.has(e);
							}
							get size() {
								return this._store.size;
							}
							get(e) {
								return this._store.get(e);
							}
							set(e, t, i = !1) {
								this._isDisposed && console.warn((/* @__PURE__ */ new Error("Trying to add a disposable to a DisposableMap that has already been disposed of. The added object will be leaked!")).stack), i || this._store.get(e)?.dispose(), this._store.set(e, t);
							}
							deleteAndDispose(e) {
								this._store.get(e)?.dispose(), this._store.delete(e);
							}
							deleteAndLeak(e) {
								const t = this._store.get(e);
								return this._store.delete(e), t;
							}
							keys() {
								return this._store.keys();
							}
							values() {
								return this._store.values();
							}
							[Symbol.iterator]() {
								return this._store[Symbol.iterator]();
							}
						}
						t.DisposableMap = S;
					},
					6317: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.LinkedList = void 0;
						class i {
							static {
								this.Undefined = new i(void 0);
							}
							constructor(e) {
								this.element = e, this.next = i.Undefined, this.prev = i.Undefined;
							}
						}
						class s {
							constructor() {
								this._first = i.Undefined, this._last = i.Undefined, this._size = 0;
							}
							get size() {
								return this._size;
							}
							isEmpty() {
								return this._first === i.Undefined;
							}
							clear() {
								let e = this._first;
								for (; e !== i.Undefined;) {
									const t = e.next;
									e.prev = i.Undefined, e.next = i.Undefined, e = t;
								}
								this._first = i.Undefined, this._last = i.Undefined, this._size = 0;
							}
							unshift(e) {
								return this._insert(e, !1);
							}
							push(e) {
								return this._insert(e, !0);
							}
							_insert(e, t) {
								const s = new i(e);
								if (this._first === i.Undefined) this._first = s, this._last = s;
								else if (t) {
									const e = this._last;
									this._last = s, s.prev = e, e.next = s;
								} else {
									const e = this._first;
									this._first = s, s.next = e, e.prev = s;
								}
								this._size += 1;
								let r = !1;
								return () => {
									r || (r = !0, this._remove(s));
								};
							}
							shift() {
								if (this._first !== i.Undefined) {
									const e = this._first.element;
									return this._remove(this._first), e;
								}
							}
							pop() {
								if (this._last !== i.Undefined) {
									const e = this._last.element;
									return this._remove(this._last), e;
								}
							}
							_remove(e) {
								if (e.prev !== i.Undefined && e.next !== i.Undefined) {
									const t = e.prev;
									t.next = e.next, e.next.prev = t;
								} else e.prev === i.Undefined && e.next === i.Undefined ? (this._first = i.Undefined, this._last = i.Undefined) : e.next === i.Undefined ? (this._last = this._last.prev, this._last.next = i.Undefined) : e.prev === i.Undefined && (this._first = this._first.next, this._first.prev = i.Undefined);
								this._size -= 1;
							}
							*[Symbol.iterator]() {
								let e = this._first;
								for (; e !== i.Undefined;) yield e.element, e = e.next;
							}
						}
						t.LinkedList = s;
					},
					2608: (e, t) => {
						var i;
						Object.defineProperty(t, "__esModule", { value: !0 }), t.SetMap = t.BidirectionalMap = t.CounterSet = t.Touch = void 0, t.getOrSet = function(e, t, i) {
							let s = e.get(t);
							return void 0 === s && (s = i, e.set(t, s)), s;
						}, t.mapToString = function(e) {
							const t = [];
							return e.forEach(((e, i) => {
								t.push(`${i} => ${e}`);
							})), `Map(${e.size}) {${t.join(", ")}}`;
						}, t.setToString = function(e) {
							const t = [];
							return e.forEach(((e) => {
								t.push(e);
							})), `Set(${e.size}) {${t.join(", ")}}`;
						}, t.mapsStrictEqualIgnoreOrder = function(e, t) {
							if (e === t) return !0;
							if (e.size !== t.size) return !1;
							for (const [i, s] of e) if (!t.has(i) || t.get(i) !== s) return !1;
							for (const [i] of t) if (!e.has(i)) return !1;
							return !0;
						}, function(e) {
							e[e.None = 0] = "None", e[e.AsOld = 1] = "AsOld", e[e.AsNew = 2] = "AsNew";
						}(i || (t.Touch = i = {})), t.CounterSet = class {
							constructor() {
								this.map = /* @__PURE__ */ new Map();
							}
							add(e) {
								return this.map.set(e, (this.map.get(e) || 0) + 1), this;
							}
							delete(e) {
								let t = this.map.get(e) || 0;
								return 0 !== t && (t--, 0 === t ? this.map.delete(e) : this.map.set(e, t), !0);
							}
							has(e) {
								return this.map.has(e);
							}
						}, t.BidirectionalMap = class {
							constructor(e) {
								if (this._m1 = /* @__PURE__ */ new Map(), this._m2 = /* @__PURE__ */ new Map(), e) for (const [t, i] of e) this.set(t, i);
							}
							clear() {
								this._m1.clear(), this._m2.clear();
							}
							set(e, t) {
								this._m1.set(e, t), this._m2.set(t, e);
							}
							get(e) {
								return this._m1.get(e);
							}
							getKey(e) {
								return this._m2.get(e);
							}
							delete(e) {
								const t = this._m1.get(e);
								return void 0 !== t && (this._m1.delete(e), this._m2.delete(t), !0);
							}
							forEach(e, t) {
								this._m1.forEach(((i, s) => {
									e.call(t, i, s, this);
								}));
							}
							keys() {
								return this._m1.keys();
							}
							values() {
								return this._m1.values();
							}
						}, t.SetMap = class {
							constructor() {
								this.map = /* @__PURE__ */ new Map();
							}
							add(e, t) {
								let i = this.map.get(e);
								i || (i = /* @__PURE__ */ new Set(), this.map.set(e, i)), i.add(t);
							}
							delete(e, t) {
								const i = this.map.get(e);
								i && (i.delete(t), 0 === i.size && this.map.delete(e));
							}
							forEach(e, t) {
								const i = this.map.get(e);
								i && i.forEach(t);
							}
							get(e) {
								return this.map.get(e) || /* @__PURE__ */ new Set();
							}
						};
					},
					7704: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.SlidingWindowAverage = t.MovingAverage = t.Counter = void 0, t.clamp = function(e, t, i) {
							return Math.min(Math.max(e, t), i);
						}, t.rot = function(e, t) {
							return (t + e % t) % t;
						}, t.isPointWithinTriangle = function(e, t, i, s, r, n, o, a) {
							const l = o - i, h = a - s, c = r - i, d = n - s, u = e - i, _ = t - s, f = l * l + h * h, p = l * c + h * d, g = l * u + h * _, m = c * c + d * d, v = c * u + d * _, S = 1 / (f * m - p * p), b = (m * g - p * v) * S, C = (f * v - p * g) * S;
							return b >= 0 && C >= 0 && b + C < 1;
						}, t.Counter = class {
							constructor() {
								this._next = 0;
							}
							getNext() {
								return this._next++;
							}
						}, t.MovingAverage = class {
							constructor() {
								this._n = 1, this._val = 0;
							}
							update(e) {
								return this._val = this._val + (e - this._val) / this._n, this._n += 1, this._val;
							}
							get value() {
								return this._val;
							}
						}, t.SlidingWindowAverage = class {
							constructor(e) {
								this._n = 0, this._val = 0, this._values = [], this._index = 0, this._sum = 0, this._values = new Array(e), this._values.fill(0, 0, e);
							}
							update(e) {
								const t = this._values[this._index];
								return this._values[this._index] = e, this._index = (this._index + 1) % this._values.length, this._sum -= t, this._sum += e, this._n < this._values.length && (this._n += 1), this._val = this._sum / this._n, this._val;
							}
							get value() {
								return this._val;
							}
						};
					},
					8163: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.isAndroid = t.isEdge = t.isSafari = t.isFirefox = t.isChrome = t.OS = t.OperatingSystem = t.setTimeout0 = t.setTimeout0IsFaster = t.translationsConfigFile = t.platformLocale = t.locale = t.Language = t.language = t.userAgent = t.platform = t.isCI = t.isMobile = t.isIOS = t.webWorkerOrigin = t.isWebWorker = t.isWeb = t.isElectron = t.isNative = t.isLinuxSnap = t.isLinux = t.isMacintosh = t.isWindows = t.Platform = t.LANGUAGE_DEFAULT = void 0, t.PlatformToString = function(e) {
							switch (e) {
								case C.Web: return "Web";
								case C.Mac: return "Mac";
								case C.Linux: return "Linux";
								case C.Windows: return "Windows";
							}
						}, t.isLittleEndian = function() {
							if (!L) {
								L = !0;
								const e = /* @__PURE__ */ new Uint8Array(2);
								e[0] = 1, e[1] = 2;
								D = 513 === new Uint16Array(e.buffer)[0];
							}
							return D;
						}, t.isBigSurOrNewer = function(e) {
							return parseFloat(e) >= 20;
						}, t.LANGUAGE_DEFAULT = "en";
						let i, s, r, n = !1, o = !1, a = !1, l = !1, h = !1, c = !1, d = !1, u = !1, _ = !1, f = !1, p = t.LANGUAGE_DEFAULT, g = t.LANGUAGE_DEFAULT;
						const m = globalThis;
						let v;
						void 0 !== m.vscode && void 0 !== m.vscode.process ? v = m.vscode.process : "undefined" != typeof process && "string" == typeof process?.versions?.node && (v = process);
						const S = "string" == typeof v?.versions?.electron, b = S && "renderer" === v?.type;
						if ("object" == typeof v) {
							n = "win32" === v.platform, o = "darwin" === v.platform, a = "linux" === v.platform, l = a && !!v.env.SNAP && !!v.env.SNAP_REVISION, d = S, _ = !!v.env.CI || !!v.env.BUILD_ARTIFACTSTAGINGDIRECTORY, i = t.LANGUAGE_DEFAULT, p = t.LANGUAGE_DEFAULT;
							const e = v.env.VSCODE_NLS_CONFIG;
							if (e) try {
								const r = JSON.parse(e);
								i = r.userLocale, g = r.osLocale, p = r.resolvedLanguage || t.LANGUAGE_DEFAULT, s = r.languagePack?.translationsConfigFile;
							} catch (e) {}
							h = !0;
						} else "object" != typeof navigator || b ? console.error("Unable to resolve platform.") : (r = navigator.userAgent, n = r.indexOf("Windows") >= 0, o = r.indexOf("Macintosh") >= 0, u = (r.indexOf("Macintosh") >= 0 || r.indexOf("iPad") >= 0 || r.indexOf("iPhone") >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0, a = r.indexOf("Linux") >= 0, f = r?.indexOf("Mobi") >= 0, c = !0, p = globalThis._VSCODE_NLS_LANGUAGE || t.LANGUAGE_DEFAULT, i = navigator.language.toLowerCase(), g = i);
						var C;
						(function(e) {
							e[e.Web = 0] = "Web", e[e.Mac = 1] = "Mac", e[e.Linux = 2] = "Linux", e[e.Windows = 3] = "Windows";
						})(C || (t.Platform = C = {}));
						let y = C.Web;
						var w, E;
						o ? y = C.Mac : n ? y = C.Windows : a && (y = C.Linux), t.isWindows = n, t.isMacintosh = o, t.isLinux = a, t.isLinuxSnap = l, t.isNative = h, t.isElectron = d, t.isWeb = c, t.isWebWorker = c && "function" == typeof m.importScripts, t.webWorkerOrigin = t.isWebWorker ? m.origin : void 0, t.isIOS = u, t.isMobile = f, t.isCI = _, t.platform = y, t.userAgent = r, t.language = p, function(e) {
							e.value = function() {
								return t.language;
							}, e.isDefaultVariant = function() {
								return 2 === t.language.length ? "en" === t.language : t.language.length >= 3 && "e" === t.language[0] && "n" === t.language[1] && "-" === t.language[2];
							}, e.isDefault = function() {
								return "en" === t.language;
							};
						}(w || (t.Language = w = {})), t.locale = i, t.platformLocale = g, t.translationsConfigFile = s, t.setTimeout0IsFaster = "function" == typeof m.postMessage && !m.importScripts, t.setTimeout0 = (() => {
							if (t.setTimeout0IsFaster) {
								const e = [];
								m.addEventListener("message", ((t) => {
									if (t.data && t.data.vscodeScheduleAsyncWork) for (let i = 0, s = e.length; i < s; i++) {
										const s = e[i];
										if (s.id === t.data.vscodeScheduleAsyncWork) return e.splice(i, 1), void s.callback();
									}
								}));
								let t = 0;
								return (i) => {
									const s = ++t;
									e.push({
										id: s,
										callback: i
									}), m.postMessage({ vscodeScheduleAsyncWork: s }, "*");
								};
							}
							return (e) => setTimeout(e);
						})(), function(e) {
							e[e.Windows = 1] = "Windows", e[e.Macintosh = 2] = "Macintosh", e[e.Linux = 3] = "Linux";
						}(E || (t.OperatingSystem = E = {})), t.OS = o || u ? E.Macintosh : n ? E.Windows : E.Linux;
						let D = !0, L = !1;
						t.isChrome = !!(t.userAgent && t.userAgent.indexOf("Chrome") >= 0), t.isFirefox = !!(t.userAgent && t.userAgent.indexOf("Firefox") >= 0), t.isSafari = !!(!t.isChrome && t.userAgent && t.userAgent.indexOf("Safari") >= 0), t.isEdge = !!(t.userAgent && t.userAgent.indexOf("Edg/") >= 0), t.isAndroid = !!(t.userAgent && t.userAgent.indexOf("Android") >= 0);
					},
					9881: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.SmoothScrollingOperation = t.SmoothScrollingUpdate = t.Scrollable = t.ScrollState = t.ScrollbarVisibility = void 0;
						const s = i(802), r = i(7150);
						var n;
						(function(e) {
							e[e.Auto = 1] = "Auto", e[e.Hidden = 2] = "Hidden", e[e.Visible = 3] = "Visible";
						})(n || (t.ScrollbarVisibility = n = {}));
						class o {
							constructor(e, t, i, s, r, n, o) {
								this._forceIntegerValues = e, this._scrollStateBrand = void 0, this._forceIntegerValues && (t |= 0, i |= 0, s |= 0, r |= 0, n |= 0, o |= 0), this.rawScrollLeft = s, this.rawScrollTop = o, t < 0 && (t = 0), s + t > i && (s = i - t), s < 0 && (s = 0), r < 0 && (r = 0), o + r > n && (o = n - r), o < 0 && (o = 0), this.width = t, this.scrollWidth = i, this.scrollLeft = s, this.height = r, this.scrollHeight = n, this.scrollTop = o;
							}
							equals(e) {
								return this.rawScrollLeft === e.rawScrollLeft && this.rawScrollTop === e.rawScrollTop && this.width === e.width && this.scrollWidth === e.scrollWidth && this.scrollLeft === e.scrollLeft && this.height === e.height && this.scrollHeight === e.scrollHeight && this.scrollTop === e.scrollTop;
							}
							withScrollDimensions(e, t) {
								return new o(this._forceIntegerValues, void 0 !== e.width ? e.width : this.width, void 0 !== e.scrollWidth ? e.scrollWidth : this.scrollWidth, t ? this.rawScrollLeft : this.scrollLeft, void 0 !== e.height ? e.height : this.height, void 0 !== e.scrollHeight ? e.scrollHeight : this.scrollHeight, t ? this.rawScrollTop : this.scrollTop);
							}
							withScrollPosition(e) {
								return new o(this._forceIntegerValues, this.width, this.scrollWidth, void 0 !== e.scrollLeft ? e.scrollLeft : this.rawScrollLeft, this.height, this.scrollHeight, void 0 !== e.scrollTop ? e.scrollTop : this.rawScrollTop);
							}
							createScrollEvent(e, t) {
								const i = this.width !== e.width, s = this.scrollWidth !== e.scrollWidth, r = this.scrollLeft !== e.scrollLeft, n = this.height !== e.height, o = this.scrollHeight !== e.scrollHeight, a = this.scrollTop !== e.scrollTop;
								return {
									inSmoothScrolling: t,
									oldWidth: e.width,
									oldScrollWidth: e.scrollWidth,
									oldScrollLeft: e.scrollLeft,
									width: this.width,
									scrollWidth: this.scrollWidth,
									scrollLeft: this.scrollLeft,
									oldHeight: e.height,
									oldScrollHeight: e.scrollHeight,
									oldScrollTop: e.scrollTop,
									height: this.height,
									scrollHeight: this.scrollHeight,
									scrollTop: this.scrollTop,
									widthChanged: i,
									scrollWidthChanged: s,
									scrollLeftChanged: r,
									heightChanged: n,
									scrollHeightChanged: o,
									scrollTopChanged: a
								};
							}
						}
						t.ScrollState = o;
						class a extends r.Disposable {
							constructor(e) {
								super(), this._scrollableBrand = void 0, this._onScroll = this._register(new s.Emitter()), this.onScroll = this._onScroll.event, this._smoothScrollDuration = e.smoothScrollDuration, this._scheduleAtNextAnimationFrame = e.scheduleAtNextAnimationFrame, this._state = new o(e.forceIntegerValues, 0, 0, 0, 0, 0, 0), this._smoothScrolling = null;
							}
							dispose() {
								this._smoothScrolling && (this._smoothScrolling.dispose(), this._smoothScrolling = null), super.dispose();
							}
							setSmoothScrollDuration(e) {
								this._smoothScrollDuration = e;
							}
							validateScrollPosition(e) {
								return this._state.withScrollPosition(e);
							}
							getScrollDimensions() {
								return this._state;
							}
							setScrollDimensions(e, t) {
								const i = this._state.withScrollDimensions(e, t);
								this._setState(i, Boolean(this._smoothScrolling)), this._smoothScrolling?.acceptScrollDimensions(this._state);
							}
							getFutureScrollPosition() {
								return this._smoothScrolling ? this._smoothScrolling.to : this._state;
							}
							getCurrentScrollPosition() {
								return this._state;
							}
							setScrollPositionNow(e) {
								const t = this._state.withScrollPosition(e);
								this._smoothScrolling && (this._smoothScrolling.dispose(), this._smoothScrolling = null), this._setState(t, !1);
							}
							setScrollPositionSmooth(e, t) {
								if (0 === this._smoothScrollDuration) return this.setScrollPositionNow(e);
								if (this._smoothScrolling) {
									e = {
										scrollLeft: void 0 === e.scrollLeft ? this._smoothScrolling.to.scrollLeft : e.scrollLeft,
										scrollTop: void 0 === e.scrollTop ? this._smoothScrolling.to.scrollTop : e.scrollTop
									};
									const i = this._state.withScrollPosition(e);
									if (this._smoothScrolling.to.scrollLeft === i.scrollLeft && this._smoothScrolling.to.scrollTop === i.scrollTop) return;
									let s;
									s = t ? new c(this._smoothScrolling.from, i, this._smoothScrolling.startTime, this._smoothScrolling.duration) : this._smoothScrolling.combine(this._state, i, this._smoothScrollDuration), this._smoothScrolling.dispose(), this._smoothScrolling = s;
								} else {
									const t = this._state.withScrollPosition(e);
									this._smoothScrolling = c.start(this._state, t, this._smoothScrollDuration);
								}
								this._smoothScrolling.animationFrameDisposable = this._scheduleAtNextAnimationFrame((() => {
									this._smoothScrolling && (this._smoothScrolling.animationFrameDisposable = null, this._performSmoothScrolling());
								}));
							}
							hasPendingScrollAnimation() {
								return Boolean(this._smoothScrolling);
							}
							_performSmoothScrolling() {
								if (!this._smoothScrolling) return;
								const e = this._smoothScrolling.tick(), t = this._state.withScrollPosition(e);
								this._setState(t, !0), this._smoothScrolling && (e.isDone ? (this._smoothScrolling.dispose(), this._smoothScrolling = null) : this._smoothScrolling.animationFrameDisposable = this._scheduleAtNextAnimationFrame((() => {
									this._smoothScrolling && (this._smoothScrolling.animationFrameDisposable = null, this._performSmoothScrolling());
								})));
							}
							_setState(e, t) {
								const i = this._state;
								i.equals(e) || (this._state = e, this._onScroll.fire(this._state.createScrollEvent(i, t)));
							}
						}
						t.Scrollable = a;
						class l {
							constructor(e, t, i) {
								this.scrollLeft = e, this.scrollTop = t, this.isDone = i;
							}
						}
						function h(e, t) {
							const i = t - e;
							return function(t) {
								return e + i * (1 - (s = 1 - t, Math.pow(s, 3)));
								var s;
							};
						}
						t.SmoothScrollingUpdate = l;
						class c {
							constructor(e, t, i, s) {
								this.from = e, this.to = t, this.duration = s, this.startTime = i, this.animationFrameDisposable = null, this._initAnimations();
							}
							_initAnimations() {
								this.scrollLeft = this._initAnimation(this.from.scrollLeft, this.to.scrollLeft, this.to.width), this.scrollTop = this._initAnimation(this.from.scrollTop, this.to.scrollTop, this.to.height);
							}
							_initAnimation(e, t, i) {
								if (Math.abs(e - t) > 2.5 * i) {
									let o, a;
									return e < t ? (o = e + .75 * i, a = t - .75 * i) : (o = e - .75 * i, a = t + .75 * i), s = h(e, o), r = h(a, t), n = .33, function(e) {
										return e < n ? s(e / n) : r((e - n) / (1 - n));
									};
								}
								var s, r, n;
								return h(e, t);
							}
							dispose() {
								null !== this.animationFrameDisposable && (this.animationFrameDisposable.dispose(), this.animationFrameDisposable = null);
							}
							acceptScrollDimensions(e) {
								this.to = e.withScrollPosition(this.to), this._initAnimations();
							}
							tick() {
								return this._tick(Date.now());
							}
							_tick(e) {
								const t = (e - this.startTime) / this.duration;
								if (t < 1) {
									const e = this.scrollLeft(t), i = this.scrollTop(t);
									return new l(e, i, !1);
								}
								return new l(this.to.scrollLeft, this.to.scrollTop, !0);
							}
							combine(e, t, i) {
								return c.start(e, t, i);
							}
							static start(e, t, i) {
								i += 10;
								const s = Date.now() - 10;
								return new c(e, t, s, i);
							}
						}
						t.SmoothScrollingOperation = c;
					},
					9725: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.StopWatch = void 0;
						const i = globalThis.performance && "function" == typeof globalThis.performance.now;
						class s {
							static create(e) {
								return new s(e);
							}
							constructor(e) {
								this._now = i && !1 === e ? Date.now : globalThis.performance.now.bind(globalThis.performance), this._startTime = this._now(), this._stopTime = -1;
							}
							stop() {
								this._stopTime = this._now();
							}
							reset() {
								this._startTime = this._now(), this._stopTime = -1;
							}
							elapsed() {
								return -1 !== this._stopTime ? this._stopTime - this._startTime : this._now() - this._startTime;
							}
						}
						t.StopWatch = s;
					},
					1316: (e, t, i) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.noBreakWhitespace = t.CodePointIterator = void 0, t.isFalsyOrWhitespace = function(e) {
							return !e || "string" != typeof e || 0 === e.trim().length;
						}, t.format = function(e, ...t) {
							return 0 === t.length ? e : e.replace(n, (function(e, i) {
								const s = parseInt(i, 10);
								return isNaN(s) || s < 0 || s >= t.length ? e : t[s];
							}));
						}, t.format2 = function(e, t) {
							return 0 === Object.keys(t).length ? e : e.replace(o, ((e, i) => t[i] ?? e));
						}, t.htmlAttributeEncodeValue = function(e) {
							return e.replace(/[<>"'&]/g, ((e) => {
								switch (e) {
									case "<": return "&lt;";
									case ">": return "&gt;";
									case "\"": return "&quot;";
									case "'": return "&apos;";
									case "&": return "&amp;";
								}
								return e;
							}));
						}, t.escape = function(e) {
							return e.replace(/[<>&]/g, (function(e) {
								switch (e) {
									case "<": return "&lt;";
									case ">": return "&gt;";
									case "&": return "&amp;";
									default: return e;
								}
							}));
						}, t.escapeRegExpCharacters = a, t.count = function(e, t) {
							let i = 0, s = e.indexOf(t);
							for (; -1 !== s;) i++, s = e.indexOf(t, s + t.length);
							return i;
						}, t.truncate = function(e, t, i = "…") {
							return e.length <= t ? e : `${e.substr(0, t)}${i}`;
						}, t.truncateMiddle = function(e, t, i = "…") {
							if (e.length <= t) return e;
							const s = Math.ceil(t / 2) - i.length / 2, r = Math.floor(t / 2) - i.length / 2;
							return `${e.substr(0, s)}${i}${e.substr(e.length - r)}`;
						}, t.trim = function(e, t = " ") {
							return h(l(e, t), t);
						}, t.ltrim = l, t.rtrim = h, t.convertSimple2RegExpPattern = function(e) {
							return e.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, "\\$&").replace(/[\*]/g, ".*");
						}, t.stripWildcards = function(e) {
							return e.replace(/\*/g, "");
						}, t.createRegExp = function(e, t, i = {}) {
							if (!e) throw new Error("Cannot create regex from empty string");
							t || (e = a(e)), i.wholeWord && (/\B/.test(e.charAt(0)) || (e = "\\b" + e), /\B/.test(e.charAt(e.length - 1)) || (e += "\\b"));
							let s = "";
							return i.global && (s += "g"), i.matchCase || (s += "i"), i.multiline && (s += "m"), i.unicode && (s += "u"), new RegExp(e, s);
						}, t.regExpLeadsToEndlessLoop = function(e) {
							return "^" !== e.source && "^$" !== e.source && "$" !== e.source && "^\\s*$" !== e.source && !(!e.exec("") || 0 !== e.lastIndex);
						}, t.splitLines = function(e) {
							return e.split(/\r\n|\r|\n/);
						}, t.splitLinesIncludeSeparators = function(e) {
							const t = [], i = e.split(/(\r\n|\r|\n)/);
							for (let e = 0; e < Math.ceil(i.length / 2); e++) t.push(i[2 * e] + (i[2 * e + 1] ?? ""));
							return t;
						}, t.firstNonWhitespaceIndex = function(e) {
							for (let t = 0, i = e.length; t < i; t++) {
								const i = e.charCodeAt(t);
								if (i !== s.CharCode.Space && i !== s.CharCode.Tab) return t;
							}
							return -1;
						}, t.getLeadingWhitespace = function(e, t = 0, i = e.length) {
							for (let r = t; r < i; r++) {
								const i = e.charCodeAt(r);
								if (i !== s.CharCode.Space && i !== s.CharCode.Tab) return e.substring(t, r);
							}
							return e.substring(t, i);
						}, t.lastNonWhitespaceIndex = function(e, t = e.length - 1) {
							for (let i = t; i >= 0; i--) {
								const t = e.charCodeAt(i);
								if (t !== s.CharCode.Space && t !== s.CharCode.Tab) return i;
							}
							return -1;
						}, t.replaceAsync = function(e, t, i) {
							const s = [];
							let r = 0;
							for (const n of e.matchAll(t)) {
								if (s.push(e.slice(r, n.index)), void 0 === n.index) throw new Error("match.index should be defined");
								r = n.index + n[0].length, s.push(i(n[0], ...n.slice(1), n.index, e, n.groups));
							}
							return s.push(e.slice(r)), Promise.all(s).then(((e) => e.join("")));
						}, t.compare = function(e, t) {
							return e < t ? -1 : e > t ? 1 : 0;
						}, t.compareSubstring = c, t.compareIgnoreCase = function(e, t) {
							return d(e, t, 0, e.length, 0, t.length);
						}, t.compareSubstringIgnoreCase = d, t.isAsciiDigit = function(e) {
							return e >= s.CharCode.Digit0 && e <= s.CharCode.Digit9;
						}, t.isLowerAsciiLetter = u, t.isUpperAsciiLetter = function(e) {
							return e >= s.CharCode.A && e <= s.CharCode.Z;
						}, t.equalsIgnoreCase = function(e, t) {
							return e.length === t.length && 0 === d(e, t);
						}, t.startsWithIgnoreCase = function(e, t) {
							const i = t.length;
							return !(t.length > e.length) && 0 === d(e, t, 0, i);
						}, t.commonPrefixLength = function(e, t) {
							const i = Math.min(e.length, t.length);
							let s;
							for (s = 0; s < i; s++) if (e.charCodeAt(s) !== t.charCodeAt(s)) return s;
							return i;
						}, t.commonSuffixLength = function(e, t) {
							const i = Math.min(e.length, t.length);
							let s;
							const r = e.length - 1, n = t.length - 1;
							for (s = 0; s < i; s++) if (e.charCodeAt(r - s) !== t.charCodeAt(n - s)) return s;
							return i;
						}, t.isHighSurrogate = _, t.isLowSurrogate = f, t.computeCodePoint = p, t.getNextCodePoint = g;
						const s = i(4869), r = i(8960), n = /{(\d+)}/g, o = /{([^}]+)}/g;
						function a(e) {
							return e.replace(/[\\\{\}\*\+\?\|\^\$\.\[\]\(\)]/g, "\\$&");
						}
						function l(e, t) {
							if (!e || !t) return e;
							const i = t.length;
							if (0 === i || 0 === e.length) return e;
							let s = 0;
							for (; e.indexOf(t, s) === s;) s += i;
							return e.substring(s);
						}
						function h(e, t) {
							if (!e || !t) return e;
							const i = t.length, s = e.length;
							if (0 === i || 0 === s) return e;
							let r = s, n = -1;
							for (; n = e.lastIndexOf(t, r - 1), -1 !== n && n + i === r;) {
								if (0 === n) return "";
								r = n;
							}
							return e.substring(0, r);
						}
						function c(e, t, i = 0, s = e.length, r = 0, n = t.length) {
							for (; i < s && r < n; i++, r++) {
								const s = e.charCodeAt(i), n = t.charCodeAt(r);
								if (s < n) return -1;
								if (s > n) return 1;
							}
							const o = s - i, a = n - r;
							return o < a ? -1 : o > a ? 1 : 0;
						}
						function d(e, t, i = 0, s = e.length, r = 0, n = t.length) {
							for (; i < s && r < n; i++, r++) {
								let o = e.charCodeAt(i), a = t.charCodeAt(r);
								if (o === a) continue;
								if (o >= 128 || a >= 128) return c(e.toLowerCase(), t.toLowerCase(), i, s, r, n);
								u(o) && (o -= 32), u(a) && (a -= 32);
								const l = o - a;
								if (0 !== l) return l;
							}
							const o = s - i, a = n - r;
							return o < a ? -1 : o > a ? 1 : 0;
						}
						function u(e) {
							return e >= s.CharCode.a && e <= s.CharCode.z;
						}
						function _(e) {
							return 55296 <= e && e <= 56319;
						}
						function f(e) {
							return 56320 <= e && e <= 57343;
						}
						function p(e, t) {
							return t - 56320 + (e - 55296 << 10) + 65536;
						}
						function g(e, t, i) {
							const s = e.charCodeAt(i);
							if (_(s) && i + 1 < t) {
								const t = e.charCodeAt(i + 1);
								if (f(t)) return p(s, t);
							}
							return s;
						}
						t.CodePointIterator = class {
							get offset() {
								return this._offset;
							}
							constructor(e, t = 0) {
								this._str = e, this._len = e.length, this._offset = t;
							}
							setOffset(e) {
								this._offset = e;
							}
							prevCodePoint() {
								const e = function(e, t) {
									const i = e.charCodeAt(t - 1);
									if (f(i) && t > 1) {
										const s = e.charCodeAt(t - 2);
										if (_(s)) return p(s, i);
									}
									return i;
								}(this._str, this._offset);
								return this._offset -= e >= r.Constants.UNICODE_SUPPLEMENTARY_PLANE_BEGIN ? 2 : 1, e;
							}
							nextCodePoint() {
								const e = g(this._str, this._len, this._offset);
								return this._offset += e >= r.Constants.UNICODE_SUPPLEMENTARY_PLANE_BEGIN ? 2 : 1, e;
							}
							eol() {
								return this._offset >= this._len;
							}
						}, t.noBreakWhitespace = "\xA0";
					},
					5015: (e, t) => {
						Object.defineProperty(t, "__esModule", { value: !0 }), t.MicrotaskDelay = void 0, t.MicrotaskDelay = Symbol("MicrotaskDelay");
					},
					8960: (e, t) => {
						var i;
						Object.defineProperty(t, "__esModule", { value: !0 }), t.Constants = void 0, t.toUint8 = function(e) {
							return e < 0 ? 0 : e > i.MAX_UINT_8 ? i.MAX_UINT_8 : 0 | e;
						}, t.toUint32 = function(e) {
							return e < 0 ? 0 : e > i.MAX_UINT_32 ? i.MAX_UINT_32 : 0 | e;
						}, function(e) {
							e[e.MAX_SAFE_SMALL_INTEGER = 1073741824] = "MAX_SAFE_SMALL_INTEGER", e[e.MIN_SAFE_SMALL_INTEGER = -1073741824] = "MIN_SAFE_SMALL_INTEGER", e[e.MAX_UINT_8 = 255] = "MAX_UINT_8", e[e.MAX_UINT_16 = 65535] = "MAX_UINT_16", e[e.MAX_UINT_32 = 4294967295] = "MAX_UINT_32", e[e.UNICODE_SUPPLEMENTARY_PLANE_BEGIN = 65536] = "UNICODE_SUPPLEMENTARY_PLANE_BEGIN";
						}(i || (t.Constants = i = {}));
					}
				}, t = {};
				function i(s) {
					var r = t[s];
					if (void 0 !== r) return r.exports;
					var n = t[s] = { exports: {} };
					return e[s].call(n.exports, n, n.exports, i), n.exports;
				}
				var s = {};
				return (() => {
					var e = s;
					Object.defineProperty(e, "__esModule", { value: !0 }), e.Terminal = void 0;
					const t = i(7721), r = i(1718), n = i(7150), o = i(3027), a = i(5101), l = i(6097), h = i(4335), c = ["cols", "rows"];
					let d = 0;
					class u extends n.Disposable {
						constructor(e) {
							super(), this._core = this._register(new r.CoreBrowserTerminal(e)), this._addonManager = this._register(new o.AddonManager()), this._publicOptions = { ...this._core.options };
							const t = (e) => this._core.options[e], i = (e, t) => {
								this._checkReadonlyOptions(e), this._core.options[e] = t;
							};
							for (const e in this._core.options) {
								const s = {
									get: t.bind(this, e),
									set: i.bind(this, e)
								};
								Object.defineProperty(this._publicOptions, e, s);
							}
						}
						_checkReadonlyOptions(e) {
							if (c.includes(e)) throw new Error(`Option "${e}" can only be set in the constructor`);
						}
						_checkProposedApi() {
							if (!this._core.optionsService.rawOptions.allowProposedApi) throw new Error("You must set the allowProposedApi option to true to use proposed API");
						}
						get onBell() {
							return this._core.onBell;
						}
						get onBinary() {
							return this._core.onBinary;
						}
						get onCursorMove() {
							return this._core.onCursorMove;
						}
						get onData() {
							return this._core.onData;
						}
						get onKey() {
							return this._core.onKey;
						}
						get onLineFeed() {
							return this._core.onLineFeed;
						}
						get onRender() {
							return this._core.onRender;
						}
						get onResize() {
							return this._core.onResize;
						}
						get onScroll() {
							return this._core.onScroll;
						}
						get onSelectionChange() {
							return this._core.onSelectionChange;
						}
						get onTitleChange() {
							return this._core.onTitleChange;
						}
						get onWriteParsed() {
							return this._core.onWriteParsed;
						}
						get element() {
							return this._core.element;
						}
						get parser() {
							return this._parser || (this._parser = new l.ParserApi(this._core)), this._parser;
						}
						get unicode() {
							return this._checkProposedApi(), new h.UnicodeApi(this._core);
						}
						get textarea() {
							return this._core.textarea;
						}
						get rows() {
							return this._core.rows;
						}
						get cols() {
							return this._core.cols;
						}
						get buffer() {
							return this._buffer || (this._buffer = this._register(new a.BufferNamespaceApi(this._core))), this._buffer;
						}
						get markers() {
							return this._checkProposedApi(), this._core.markers;
						}
						get modes() {
							const e = this._core.coreService.decPrivateModes;
							let t = "none";
							switch (this._core.coreMouseService.activeProtocol) {
								case "X10":
									t = "x10";
									break;
								case "VT200":
									t = "vt200";
									break;
								case "DRAG":
									t = "drag";
									break;
								case "ANY": t = "any";
							}
							return {
								applicationCursorKeysMode: e.applicationCursorKeys,
								applicationKeypadMode: e.applicationKeypad,
								bracketedPasteMode: e.bracketedPasteMode,
								insertMode: this._core.coreService.modes.insertMode,
								mouseTrackingMode: t,
								originMode: e.origin,
								reverseWraparoundMode: e.reverseWraparound,
								sendFocusMode: e.sendFocus,
								synchronizedOutputMode: e.synchronizedOutput,
								wraparoundMode: e.wraparound
							};
						}
						get options() {
							return this._publicOptions;
						}
						set options(e) {
							for (const t in e) this._publicOptions[t] = e[t];
						}
						blur() {
							this._core.blur();
						}
						focus() {
							this._core.focus();
						}
						input(e, t = !0) {
							this._core.input(e, t);
						}
						resize(e, t) {
							this._verifyIntegers(e, t), this._core.resize(e, t);
						}
						open(e) {
							this._core.open(e);
						}
						attachCustomKeyEventHandler(e) {
							this._core.attachCustomKeyEventHandler(e);
						}
						attachCustomWheelEventHandler(e) {
							this._core.attachCustomWheelEventHandler(e);
						}
						registerLinkProvider(e) {
							return this._core.registerLinkProvider(e);
						}
						registerCharacterJoiner(e) {
							return this._checkProposedApi(), this._core.registerCharacterJoiner(e);
						}
						deregisterCharacterJoiner(e) {
							this._checkProposedApi(), this._core.deregisterCharacterJoiner(e);
						}
						registerMarker(e = 0) {
							return this._verifyIntegers(e), this._core.registerMarker(e);
						}
						registerDecoration(e) {
							return this._checkProposedApi(), this._verifyPositiveIntegers(e.x ?? 0, e.width ?? 0, e.height ?? 0), this._core.registerDecoration(e);
						}
						hasSelection() {
							return this._core.hasSelection();
						}
						select(e, t, i) {
							this._verifyIntegers(e, t, i), this._core.select(e, t, i);
						}
						getSelection() {
							return this._core.getSelection();
						}
						getSelectionPosition() {
							return this._core.getSelectionPosition();
						}
						clearSelection() {
							this._core.clearSelection();
						}
						selectAll() {
							this._core.selectAll();
						}
						selectLines(e, t) {
							this._verifyIntegers(e, t), this._core.selectLines(e, t);
						}
						dispose() {
							super.dispose();
						}
						scrollLines(e) {
							this._verifyIntegers(e), this._core.scrollLines(e);
						}
						scrollPages(e) {
							this._verifyIntegers(e), this._core.scrollPages(e);
						}
						scrollToTop() {
							this._core.scrollToTop();
						}
						scrollToBottom() {
							this._core.scrollToBottom();
						}
						scrollToLine(e) {
							this._verifyIntegers(e), this._core.scrollToLine(e);
						}
						clear() {
							this._core.clear();
						}
						write(e, t) {
							this._core.write(e, t);
						}
						writeln(e, t) {
							this._core.write(e), this._core.write("\r\n", t);
						}
						paste(e) {
							this._core.paste(e);
						}
						refresh(e, t) {
							this._verifyIntegers(e, t), this._core.refresh(e, t);
						}
						reset() {
							this._core.reset();
						}
						clearTextureAtlas() {
							this._core.clearTextureAtlas();
						}
						loadAddon(e) {
							this._addonManager.loadAddon(this, e);
						}
						static get strings() {
							return {
								get promptLabel() {
									return t.promptLabel.get();
								},
								set promptLabel(e) {
									t.promptLabel.set(e);
								},
								get tooMuchOutput() {
									return t.tooMuchOutput.get();
								},
								set tooMuchOutput(e) {
									t.tooMuchOutput.set(e);
								}
							};
						}
						_verifyIntegers(...e) {
							for (d of e) if (d === 1 / 0 || isNaN(d) || d % 1 != 0) throw new Error("This API only accepts integers");
						}
						_verifyPositiveIntegers(...e) {
							for (d of e) if (d && (d === 1 / 0 || isNaN(d) || d % 1 != 0 || d < 0)) throw new Error("This API only accepts positive integers");
						}
					}
					e.Terminal = u;
				})(), s;
			})()));
		})))();
		const XTERM_CSS = "/**\n * Copyright (c) 2014 The xterm.js authors. All rights reserved.\n * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)\n * https://github.com/chjj/term.js\n * @license MIT\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n *\n * Originally forked from (with the author's permission):\n *   Fabrice Bellard's javascript vt100 for jslinux:\n *   http://bellard.org/jslinux/\n *   Copyright (c) 2011 Fabrice Bellard\n *   The original design remains. The terminal itself\n *   has been extended to include xterm CSI codes, among\n *   other features.\n */\n\n/**\n *  Default styles for xterm.js\n */\n\n.xterm {\n    cursor: text;\n    position: relative;\n    user-select: none;\n    -ms-user-select: none;\n    -webkit-user-select: none;\n}\n\n.xterm.focus,\n.xterm:focus {\n    outline: none;\n}\n\n.xterm .xterm-helpers {\n    position: absolute;\n    top: 0;\n    /**\n     * The z-index of the helpers must be higher than the canvases in order for\n     * IMEs to appear on top.\n     */\n    z-index: 5;\n}\n\n.xterm .xterm-helper-textarea {\n    padding: 0;\n    border: 0;\n    margin: 0;\n    /* Move textarea out of the screen to the far left, so that the cursor is not visible */\n    position: absolute;\n    opacity: 0;\n    left: -9999em;\n    top: 0;\n    width: 0;\n    height: 0;\n    z-index: -5;\n    /** Prevent wrapping so the IME appears against the textarea at the correct position */\n    white-space: nowrap;\n    overflow: hidden;\n    resize: none;\n}\n\n.xterm .composition-view {\n    /* TODO: Composition position got messed up somewhere */\n    background: #000;\n    color: #FFF;\n    display: none;\n    position: absolute;\n    white-space: nowrap;\n    z-index: 1;\n}\n\n.xterm .composition-view.active {\n    display: block;\n}\n\n.xterm .xterm-viewport {\n    /* On OS X this is required in order for the scroll bar to appear fully opaque */\n    background-color: #000;\n    overflow-y: scroll;\n    cursor: default;\n    position: absolute;\n    right: 0;\n    left: 0;\n    top: 0;\n    bottom: 0;\n}\n\n.xterm .xterm-screen {\n    position: relative;\n}\n\n.xterm .xterm-screen canvas {\n    position: absolute;\n    left: 0;\n    top: 0;\n}\n\n.xterm-char-measure-element {\n    display: inline-block;\n    visibility: hidden;\n    position: absolute;\n    top: 0;\n    left: -9999em;\n    line-height: normal;\n}\n\n.xterm.enable-mouse-events {\n    /* When mouse events are enabled (eg. tmux), revert to the standard pointer cursor */\n    cursor: default;\n}\n\n.xterm.xterm-cursor-pointer,\n.xterm .xterm-cursor-pointer {\n    cursor: pointer;\n}\n\n.xterm.column-select.focus {\n    /* Column selection mode */\n    cursor: crosshair;\n}\n\n.xterm .xterm-accessibility:not(.debug),\n.xterm .xterm-message {\n    position: absolute;\n    left: 0;\n    top: 0;\n    bottom: 0;\n    right: 0;\n    z-index: 10;\n    color: transparent;\n    pointer-events: none;\n}\n\n.xterm .xterm-accessibility-tree:not(.debug) *::selection {\n  color: transparent;\n}\n\n.xterm .xterm-accessibility-tree {\n  font-family: monospace;\n  user-select: text;\n  white-space: pre;\n}\n\n.xterm .xterm-accessibility-tree > div {\n  transform-origin: left;\n  width: fit-content;\n}\n\n.xterm .live-region {\n    position: absolute;\n    left: -9999px;\n    width: 1px;\n    height: 1px;\n    overflow: hidden;\n}\n\n.xterm-dim {\n    /* Dim should not apply to background, so the opacity of the foreground color is applied\n     * explicitly in the generated class and reset to 1 here */\n    opacity: 1 !important;\n}\n\n.xterm-underline-1 { text-decoration: underline; }\n.xterm-underline-2 { text-decoration: double underline; }\n.xterm-underline-3 { text-decoration: wavy underline; }\n.xterm-underline-4 { text-decoration: dotted underline; }\n.xterm-underline-5 { text-decoration: dashed underline; }\n\n.xterm-overline {\n    text-decoration: overline;\n}\n\n.xterm-overline.xterm-underline-1 { text-decoration: overline underline; }\n.xterm-overline.xterm-underline-2 { text-decoration: overline double underline; }\n.xterm-overline.xterm-underline-3 { text-decoration: overline wavy underline; }\n.xterm-overline.xterm-underline-4 { text-decoration: overline dotted underline; }\n.xterm-overline.xterm-underline-5 { text-decoration: overline dashed underline; }\n\n.xterm-strikethrough {\n    text-decoration: line-through;\n}\n\n.xterm-screen .xterm-decoration-container .xterm-decoration {\n	z-index: 6;\n	position: absolute;\n}\n\n.xterm-screen .xterm-decoration-container .xterm-decoration.xterm-decoration-top-layer {\n	z-index: 7;\n}\n\n.xterm-decoration-overview-ruler {\n    z-index: 8;\n    position: absolute;\n    top: 0;\n    right: 0;\n    pointer-events: none;\n}\n\n.xterm-decoration-top {\n    z-index: 2;\n    position: relative;\n}\n\n\n\n/* Derived from vs/base/browser/ui/scrollbar/media/scrollbar.css */\n\n/* xterm.js customization: Override xterm's cursor style */\n.xterm .xterm-scrollable-element > .scrollbar {\n    cursor: default;\n}\n\n/* Arrows */\n.xterm .xterm-scrollable-element > .scrollbar > .scra {\n	cursor: pointer;\n	font-size: 11px !important;\n}\n\n.xterm .xterm-scrollable-element > .visible {\n	opacity: 1;\n\n	/* Background rule added for IE9 - to allow clicks on dom node */\n	background:rgba(0,0,0,0);\n\n	transition: opacity 100ms linear;\n	/* In front of peek view */\n	z-index: 11;\n}\n.xterm .xterm-scrollable-element > .invisible {\n	opacity: 0;\n	pointer-events: none;\n}\n.xterm .xterm-scrollable-element > .invisible.fade {\n	transition: opacity 800ms linear;\n}\n\n/* Scrollable Content Inset Shadow */\n.xterm .xterm-scrollable-element > .shadow {\n	position: absolute;\n	display: none;\n}\n.xterm .xterm-scrollable-element > .shadow.top {\n	display: block;\n	top: 0;\n	left: 3px;\n	height: 3px;\n	width: 100%;\n	box-shadow: var(--vscode-scrollbar-shadow, #000) 0 6px 6px -6px inset;\n}\n.xterm .xterm-scrollable-element > .shadow.left {\n	display: block;\n	top: 3px;\n	left: 0;\n	height: 100%;\n	width: 3px;\n	box-shadow: var(--vscode-scrollbar-shadow, #000) 6px 0 6px -6px inset;\n}\n.xterm .xterm-scrollable-element > .shadow.top-left-corner {\n	display: block;\n	top: 0;\n	left: 0;\n	height: 3px;\n	width: 3px;\n}\n.xterm .xterm-scrollable-element > .shadow.top.left {\n	box-shadow: var(--vscode-scrollbar-shadow, #000) 6px 0 6px -6px inset;\n}\n";
		//#endregion
		//#region src/client/terminal-dock.tsx
		/**
		* TerminalPage — bottom-docked, tabbed, real interactive shell terminal
		* rendered with xterm.js. Each tab is a live host PTY session streamed over
		* SSE (pty-store.ts); the dock renders only the active tab's xterm instance
		* (lazy mount — switching tabs remounts and replays the store ring buffer).
		*
		* Client plugin module (UI component). Public API:
		*   TerminalPage — the dock; assemble it from index.ts (footer / Ctrl+J /
		*   right-click "在此打开终端" all funnel through pty-store's ptyOpen/createTab,
		*   so the dock itself only needs the panel store).
		*
		* Review fixes vs PR #40: lazy single-tab mounting, measured-cell fit (no
		* addon-fit dependency — probe span + 9x19 px fallback), single-fire resize
		* (onResize reports to the host; fit never POSTs twice), pointer-capture
		* drag (pointerup can no longer be lost), explicit compression target (the
		* composer column), token-sampled xterm theme (canvas-safe hex), official
		* Icon*Outline16 glyphs instead of emoji, idempotent style injection.
		*
		* The Ctrl+J shortcut guard ("do not intercept keys while the xterm textarea
		* is focused") lives in the index.ts assembly, not here.
		*/
		if (typeof document !== "undefined" && document.getElementById("dsh-xterm-style") === null) {
			const style = document.createElement("style");
			style.id = "dsh-xterm-style";
			style.textContent = XTERM_CSS;
			document.head.appendChild(style);
		}
		const DOCK_MIN_HEIGHT = 140;
		const DOCK_MAX_RATIO = .5;
		const DOCK = {
			position: "fixed",
			left: "var(--dsh-sidebar-width, 0px)",
			right: "var(--mg-sidebar-width, 0px)",
			bottom: 0,
			height: 320,
			zIndex: 1e3,
			display: "flex",
			flexDirection: "column",
			background: "var(--dsw-alias-bg-layer-2, #0b0b0d)",
			color: "var(--dsw-alias-label-primary, #e6e6e6)",
			fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
			fontSize: 13,
			lineHeight: 1.5,
			border: "1px solid var(--dsw-alias-border-l2, #26262a)",
			borderBottom: "none",
			borderRadius: "12px 12px 0 0",
			boxShadow: "var(--dsw-shadow-lv2, 0 -10px 40px rgb(0 0 0 / 35%))",
			boxSizing: "border-box",
			overflow: "hidden"
		};
		const TABBAR = {
			display: "flex",
			alignItems: "center",
			gap: 4,
			padding: "6px 8px",
			flexShrink: 0,
			background: "var(--dsw-alias-bg-layer-1, #151517)",
			borderBottom: "1px solid var(--dsw-alias-border-l1, #222226)"
		};
		const TABBASE = {
			display: "inline-flex",
			alignItems: "center",
			gap: 6,
			padding: "4px 10px",
			background: "transparent",
			border: "none",
			borderRadius: 7,
			cursor: "pointer",
			color: "var(--dsw-alias-label-tertiary, #9aa0a6)",
			fontSize: 12,
			whiteSpace: "nowrap",
			transition: "background .12s ease",
			maxWidth: 220,
			minWidth: 0
		};
		const TABACTIVE = {
			...TABBASE,
			background: "var(--dsw-alias-bg-layer-3, #1e1e21)",
			color: "var(--dsw-alias-label-primary, #fff)"
		};
		const OUTER = {
			position: "relative",
			flex: 1,
			minHeight: 0
		};
		const TABBODY = {
			position: "absolute",
			inset: 0,
			padding: "8px 6px"
		};
		const BTN = {
			border: "1px solid var(--dsw-alias-border-l2, #333)",
			background: "transparent",
			color: "var(--dsw-alias-label-secondary, #aaa)",
			borderRadius: 7,
			padding: "3px 10px",
			cursor: "pointer",
			fontSize: 12,
			whiteSpace: "nowrap"
		};
		const STATUS = {
			display: "flex",
			alignItems: "center",
			gap: 12,
			padding: "3px 12px",
			flexShrink: 0,
			background: "var(--dsw-alias-bg-layer-1, #0d0d10)",
			borderTop: "1px solid var(--dsw-alias-border-l1, #222226)",
			color: "var(--dsw-alias-label-tertiary, #8a8a8a)",
			fontSize: 11,
			overflow: "hidden",
			whiteSpace: "nowrap",
			textOverflow: "ellipsis"
		};
		const SETTINGS = {
			position: "absolute",
			right: 8,
			top: 38,
			zIndex: 20,
			background: "var(--dsw-alias-bg-layer-3, #1a1a1e)",
			border: "1px solid var(--dsw-alias-border-l2, #2c2c31)",
			borderRadius: 10,
			padding: "10px 12px",
			boxShadow: "var(--dsw-shadow-lv2, 0 8px 24px rgb(0 0 0 / 40%))",
			display: "flex",
			flexDirection: "column",
			gap: 8,
			minWidth: 200
		};
		/**
		* Convert a computed `rgb(r, g, b)` / `rgba(r, g, b, a)` color to #rrggbb.
		* @returns the hex string, or null when the input is not an rgb()/rgba() color.
		*/
		function cssColorToHex(cssColor) {
			const m = cssColor.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
			if (m === null) return null;
			const to2 = (v) => Math.max(0, Math.min(255, Math.round(Number(v)))).toString(16).padStart(2, "0");
			return "#" + to2(m[1]) + to2(m[2]) + to2(m[3]);
		}
		/**
		* Resolve a dsw design token to a concrete hex color. The xterm canvas
		* renderer cannot take var()/color-mix, so a hidden probe element resolves
		* the custom property (skins' color-mix included) into a computed color.
		* The literal hex is a fallback for missing tokens / unavailable DOM.
		*/
		function resolveTokenHex(token, fallback) {
			try {
				const probe = document.createElement("span");
				probe.setAttribute("aria-hidden", "true");
				probe.style.cssText = "position:absolute;visibility:hidden;left:-9999px;top:0;color:" + token + ";";
				document.body.appendChild(probe);
				const computed = getComputedStyle(probe).color;
				probe.remove();
				return cssColorToHex(computed) ?? fallback;
			} catch {
				return fallback;
			}
		}
		/**
		* Build the xterm theme from dsw tokens (sampled per call so skin/theme
		* switches apply), with the VS Code classic light/dark terminal palettes as
		* the ANSI colors — proven readable on both backgrounds, so PowerShell's
		* token-colored input stays legible in light mode (Bug: input text was
		* white/yellow on light backgrounds).
		*/
		function resolveTerminalTheme(dark) {
			if (dark) return {
				background: resolveTokenHex("var(--dsw-alias-bg-layer-2)", "#0b0b0d"),
				foreground: resolveTokenHex("var(--dsw-alias-label-primary)", "#e6e6e6"),
				cursor: resolveTokenHex("var(--dsw-alias-state-success-primary)", "#22c55e"),
				cursorAccent: resolveTokenHex("var(--dsw-alias-bg-layer-2)", "#0b0b0d"),
				black: "#000000",
				red: "#cd3131",
				green: "#0dbc79",
				yellow: "#e5e510",
				blue: "#2472c8",
				magenta: "#bc3fbc",
				cyan: "#11a8cd",
				white: "#e5e5e5",
				brightBlack: "#666666",
				brightRed: "#f14c4c",
				brightGreen: "#23d18b",
				brightYellow: "#f5f543",
				brightBlue: "#3b8eea",
				brightMagenta: "#d670d6",
				brightCyan: "#29b8db",
				brightWhite: "#ffffff"
			};
			return {
				background: resolveTokenHex("var(--dsw-alias-bg-layer-2)", "#ffffff"),
				foreground: resolveTokenHex("var(--dsw-alias-label-primary)", "#1f1f1f"),
				cursor: resolveTokenHex("var(--dsw-alias-label-primary)", "#0b0b0d"),
				cursorAccent: resolveTokenHex("var(--dsw-alias-bg-layer-2)", "#ffffff"),
				black: "#000000",
				red: "#cd3131",
				green: "#107c10",
				yellow: "#795e26",
				blue: "#0451a5",
				magenta: "#bc05bc",
				cyan: "#0598bc",
				white: "#555555",
				brightBlack: "#666666",
				brightRed: "#cd3131",
				brightGreen: "#14ce14",
				brightYellow: "#b5ba00",
				brightBlue: "#0451a5",
				brightMagenta: "#bc05bc",
				brightCyan: "#0598bc",
				brightWhite: "#a5a5a5"
			};
		}
		/**
		* Measure the real cell size for fit with a probe span using the terminal's
		* font settings (font family / size / line-height).
		*/
		function measureCell(el, term) {
			const probe = document.createElement("span");
			probe.setAttribute("aria-hidden", "true");
			probe.style.cssText = [
				"position:absolute",
				"visibility:hidden",
				"left:-9999px",
				"top:0",
				"white-space:pre",
				"font-family:" + (term.options.fontFamily ?? "ui-monospace, SFMono-Regular, Consolas, monospace"),
				"font-size:" + (term.options.fontSize ?? 13) + "px",
				"line-height:" + (term.options.lineHeight ?? 1.2) + "em",
				"pointer-events:none"
			].join(";");
			probe.textContent = "W".repeat(9);
			el.appendChild(probe);
			const rect = probe.getBoundingClientRect();
			el.removeChild(probe);
			return {
				cw: rect.width / 9,
				ch: rect.height
			};
		}
		/** One xterm instance bound to a PTY tab (mounted only while active). */
		function TabTerminal({ tabId }) {
			const ref = (0, react.useRef)(null);
			const termRef = (0, react.useRef)(null);
			const fitRef = (0, react.useRef)(() => {});
			const prefs = usePrefs();
			(0, react.useEffect)(() => {
				const el = ref.current;
				if (el === null) return;
				const term = new import_xterm.Terminal({
					convertEol: true,
					fontSize: prefs.fontSize,
					fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
					scrollback: 5e3,
					theme: resolveTerminalTheme(prefs.dark)
				});
				termRef.current = term;
				term.open(el);
				const off = ptySubscribeData(tabId, (chunk) => {
					try {
						term.write(chunk);
					} catch {}
				});
				const disp = term.onData((data) => {
					ptySendRaw(tabId, data);
				});
				const resizeDisp = term.onResize(({ cols, rows }) => {
					ptyResizeClient(tabId, cols, rows);
				});
				const fit = () => {
					const w = el.clientWidth;
					const h = el.clientHeight;
					if (w <= 0 || h <= 0) return;
					const { cw, ch } = measureCell(el, term);
					const cols = Math.max(2, Math.floor(w / (cw > 0 ? cw : 9)));
					const rows = Math.max(1, Math.floor(h / (ch > 0 ? ch : 19)));
					term.resize(cols, rows);
				};
				fitRef.current = fit;
				const ro = new ResizeObserver(fit);
				ro.observe(el);
				fit();
				return () => {
					ro.disconnect();
					disp.dispose();
					resizeDisp.dispose();
					off();
					term.dispose();
					termRef.current = null;
				};
			}, [tabId]);
			(0, react.useEffect)(() => {
				const t = termRef.current;
				if (t === null) return;
				t.options.fontSize = prefs.fontSize;
				t.options.theme = resolveTerminalTheme(prefs.dark);
				fitRef.current();
			}, [prefs]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref,
				style: {
					width: "100%",
					height: "100%"
				}
			});
		}
		const TERMINAL_STYLE_TEXT = `
.mg-term-tab-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
  padding: 0 2px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--dsw-alias-label-tertiary, #777);
}
.mg-term-tab-close:hover {
  color: var(--dsw-alias-label-primary, #e6e6e6);
  background: var(--dsw-alias-interactive-bg-hover, rgb(128 128 128 / 16%));
}
@keyframes mg-term-notice-in {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
		/** Inject the dock stylesheet once (idempotent; no-op when already present). */
		function injectTerminalStyle() {
			if (typeof document === "undefined") return;
			const id = "dsh-hub-terminal-style";
			if (document.getElementById(id) !== null) return;
			const style = document.createElement("style");
			style.id = id;
			style.textContent = TERMINAL_STYLE_TEXT;
			document.head.appendChild(style);
		}
		injectTerminalStyle();
		function TerminalPage() {
			const visible = usePty((s) => s.visible);
			const tabs = usePty((s) => s.tabs);
			const activeId = usePty((s) => s.activeId);
			const notice = usePty((s) => s.notice);
			const shells = usePty((s) => s.shells);
			const active = tabs.find((t) => t.id === activeId);
			const prefs = usePrefs();
			const [settingsOpen, setSettingsOpen] = (0, react.useState)(false);
			const [maximized, setMaximized] = (0, react.useState)(false);
			const [height, setHeight] = (0, react.useState)(() => Math.max(DOCK_MIN_HEIGHT, Math.round(window.innerHeight * .3)));
			const onHandleDown = (e) => {
				e.preventDefault();
				const handle = e.currentTarget;
				handle.setPointerCapture(e.pointerId);
				const move = (ev) => {
					const h = window.innerHeight - ev.clientY;
					setHeight(Math.max(DOCK_MIN_HEIGHT, Math.min(Math.round(window.innerHeight * DOCK_MAX_RATIO), h)));
				};
				const stop = (ev) => {
					if (handle.hasPointerCapture(ev.pointerId)) handle.releasePointerCapture(ev.pointerId);
					handle.removeEventListener("pointermove", move);
					handle.removeEventListener("pointerup", stop);
					handle.removeEventListener("pointercancel", stop);
				};
				handle.addEventListener("pointermove", move);
				handle.addEventListener("pointerup", stop);
				handle.addEventListener("pointercancel", stop);
			};
			const dockRef = (0, react.useRef)(null);
			const compressElRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				const dock = dockRef.current;
				if (dock === null) return;
				const apply = () => {
					const seat = document.querySelector("[data-composer-seat]");
					if (seat !== null) {
						const rect = seat.getBoundingClientRect();
						if (rect.width > 0) {
							dock.style.left = Math.max(0, rect.left) + "px";
							dock.style.right = Math.max(0, window.innerWidth - rect.right) + "px";
						}
					}
					let target = null;
					if (seat !== null) {
						const scroll = document.querySelector("[data-conversation-scroll]");
						if (scroll !== null && scroll.contains(seat)) target = scroll;
						else {
							let el = seat.parentElement;
							while (el !== null && el !== document.body) {
								const cs = getComputedStyle(el);
								if (cs.display === "flex" && cs.flexDirection === "column" && el.getBoundingClientRect().width > 200) {
									target = el;
									break;
								}
								el = el.parentElement;
							}
						}
					}
					if (compressElRef.current !== null && compressElRef.current !== target) compressElRef.current.style.marginBottom = "";
					compressElRef.current = target;
					if (target !== null) target.style.marginBottom = visible ? height + 6 + "px" : "";
				};
				apply();
				window.addEventListener("resize", apply);
				return () => {
					window.removeEventListener("resize", apply);
					if (compressElRef.current !== null) {
						compressElRef.current.style.marginBottom = "";
						compressElRef.current = null;
					}
				};
			}, [visible, height]);
			if (!visible) return null;
			const dockTop = maximized ? 42 : void 0;
			const dockBottom = maximized ? void 0 : 0;
			const dockHeight = maximized ? "calc(100vh - 42px)" : height + "px";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: dockRef,
				style: {
					...DOCK,
					top: dockTop,
					bottom: dockBottom,
					height: dockHeight,
					borderRadius: maximized ? 0 : "12px 12px 0 0"
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						onPointerDown: onHandleDown,
						title: "拖拽调整高度",
						style: {
							height: 6,
							cursor: "ns-resize",
							touchAction: "none",
							flexShrink: 0,
							background: "transparent",
							position: "relative",
							zIndex: 5
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: TABBAR,
						children: [
							tabs.map((t) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								style: t.id === activeId ? TABACTIVE : TABBASE,
								onClick: () => setActiveTab(t.id),
								title: t.cwd,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: {
											display: "inline-flex",
											flex: "none",
											color: "var(--dsw-alias-state-success-primary, #22c55e)"
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTriangleRightFill14, { size: 10 })
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: {
											overflow: "hidden",
											textOverflow: "ellipsis",
											minWidth: 0
										},
										children: t.title
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "mg-term-tab-close",
										role: "button",
										"aria-label": "关闭终端",
										tabIndex: 0,
										onClick: (e) => {
											e.stopPropagation();
											closeTab(t.id);
										},
										onKeyDown: (e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.stopPropagation();
												closeTab(t.id);
											}
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 12 })
									})
								]
							}, t.id)),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: TABBASE,
								onClick: () => void createTab(),
								title: "新建终端",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, { size: 14 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: TABBASE,
								onClick: () => setSettingsOpen(!settingsOpen),
								title: "设置",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutline16, { size: 14 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: TABBASE,
								onClick: () => setMaximized(!maximized),
								title: maximized ? "还原" : "最大化",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFullscreenOutline16, { size: 14 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: { flex: 1 } }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: BTN,
								onClick: () => {
									ptyClosePanel();
								},
								children: "关闭"
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: OUTER,
						children: active !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: TABBODY,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TabTerminal, { tabId: active.id })
						}, active.id) : null
					}),
					settingsOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: SETTINGS,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: {
									fontSize: 12,
									color: "var(--dsw-alias-label-secondary, #bbb)"
								},
								children: "终端设置"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: 8
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: {
											fontSize: 12,
											color: "var(--dsw-alias-label-tertiary, #999)"
										},
										children: "字体大小"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										style: BTN,
										onClick: () => setFontSize(prefs.fontSize - 1),
										children: "−"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: {
											fontSize: 12,
											minWidth: 22,
											textAlign: "center"
										},
										children: prefs.fontSize
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										style: BTN,
										onClick: () => setFontSize(prefs.fontSize + 1),
										children: "+"
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: BTN,
								onClick: toggleTheme,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									style: {
										display: "inline-flex",
										alignItems: "center",
										gap: 6
									},
									children: [prefs.dark ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLightOutline16, { size: 14 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDarkOutline16, { size: 14 }), prefs.dark ? "浅色主题" : "深色主题"]
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									flexDirection: "column",
									gap: 4
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: {
											fontSize: 12,
											color: "var(--dsw-alias-label-tertiary, #999)"
										},
										children: "默认终端"
									}),
									shells.filter((s) => s.available).map((s) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										style: {
											...BTN,
											justifyContent: "flex-start",
											textAlign: "left",
											...s.id === prefs.shell ? { borderColor: "var(--dsw-alias-state-business-primary, #3964fe)" } : {}
										},
										onClick: () => setShell(s.id),
										children: [s.id === prefs.shell ? "✓ " : "", s.name]
									}, s.id)),
									shells.filter((s) => s.available).length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: {
											fontSize: 11,
											color: "var(--dsw-alias-label-tertiary, #999)"
										},
										children: "未检测到可用终端"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: STATUS,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: active?.shell ?? "Shell" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: {
									flex: 1,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap"
								},
								children: active?.cwd || "未设置工作目录"
							}),
							notice !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								role: "status",
								style: {
									color: "var(--dsw-alias-state-error-primary, #dc2626)",
									animation: "mg-term-notice-in .18s ease"
								},
								children: notice
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [tabs.length, " 会话"] })
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/index.ts
		/**
		* dsh-hub browser half — registers a settings card into the dsh
		* settings → plugins page and bridges tray commands from the desktop shell.
		*
		* The card reads/writes the shell config through this plugin's own HTTP
		* routes, so it works without dsh's settings namespace allowlist (which does
		* not expose third-party namespaces yet). The card renders only while the
		* host serves the config API, which happens only when the process was
		* launched by this project (desktop shortcut / `dsh-hub`); a plain
		* command-line `dsh web` never mounts the bundle at all.
		*
		* The tray bridge: the desktop shell dispatches tray commands into the page
		* as custom window events; `__mgShellReady` lets the host retry until
		* this listener is mounted, so a tray click during the SPA boot is not lost.
		*
		* Registration follows the official client-plugin contract (see dsh-web-ui's
		* dsh-pet): declare the slot shape, then `slots.inject('settings.plugin.item',
		* ...)`.
		*
		* @module dsh-hub/client
		*/
		window.__mgShellReady = true;
		/**
		* Required services: slots (card), workspaces + sessions (tray + sidebar data).
		* NOTE: modelDirectories is deliberately NOT injected — the model-seat override
		* (model-select.tsx) resolves it via ctx.get() with a guard, so a missing
		* service degrades to "built-in seat" instead of PENDING the whole plugin.
		*/
		const inject = [
			"slots",
			"workspaces",
			"sessions"
		];
		/** Resolve the current session's workspace from the client runtime. */
		function currentWorkspace(ctx) {
			const client = ctx;
			const sessions = client.sessions;
			const workspaces = client.workspaces;
			if (sessions === void 0 || workspaces === void 0) return null;
			const sessionSnapshot = sessions.list?.getSnapshot?.();
			const current = sessionSnapshot?.current;
			const sessionCwd = current === void 0 ? void 0 : sessionSnapshot?.byId?.[current]?.cwd;
			if (sessionCwd !== void 0 && sessionCwd !== "") return {
				path: sessionCwd,
				id: current
			};
			const snapshot = workspaces.list?.getSnapshot?.();
			const items = snapshot?.items ?? [];
			if (current !== void 0) {
				const ws = items.find((item) => item.sessionIds?.includes(current));
				if (ws !== void 0) return {
					path: ws.path,
					id: ws.workspaceId
				};
			}
			const recentId = snapshot?.recentWorkspaceId;
			const recent = items.find((item) => item.workspaceId === recentId);
			if (recent !== void 0) return {
				path: recent.path,
				id: recent.workspaceId
			};
			return null;
		}
		/** Send the current workspace path to the desktop host over IPC. */
		function sendCurrentWorkspace(ctx) {
			const path = currentWorkspace(ctx)?.path;
			try {
				window.ipc?.postMessage(`mg:workspace-path:${path === void 0 ? "" : encodeURIComponent(path)}`);
			} catch {}
		}
		/** Handle one tray command dispatched by the desktop shell. */
		function handleShellCommand(ctx, event) {
			const detail = event.detail;
			const report = (msg) => {
				try {
					window.__TAURI_INTERNALS__?.invoke?.("diag_report", { msg }).catch?.(() => {});
				} catch {}
			};
			report("client-shell-command:" + (detail?.command ?? "?"));
			if (detail?.command === "new-task") {
				const workspaces = ctx.workspaces;
				if (workspaces === void 0 || workspaces.startSession === void 0) {
					console.warn("[dsh-hub] new-task ignored: workspaces service unavailable");
					report("client-new-task:workspaces-unavailable");
					return;
				}
				console.log("[dsh-hub] new-task (current session workspace)");
				report("client-new-task:startSession");
				workspaces.startSession();
				return;
			}
			if (detail?.command === "open-workspace") {
				const path = currentWorkspace(ctx)?.path;
				try {
					const internals = window.__TAURI_INTERNALS__;
					if (internals?.invoke) {
						internals.invoke("open_workspace_path", { path: path ?? "" }).catch(() => {});
						report("client-open-workspace:invoke:" + (path ?? ""));
					} else window.ipc?.postMessage(`mg:workspace-path:${path === void 0 ? "" : encodeURIComponent(path)}`);
				} catch {}
			}
			if (detail?.command === "focus-session") {
				const sessionId = detail.sessionId;
				const sessions = ctx.sessions;
				if (sessions?.open !== void 0 && sessionId !== void 0 && sessionId !== "") {
					console.log("[dsh-hub] focus-session: " + sessionId);
					sessions.open(sessionId);
				}
			}
		}
		/** Client plugin body. */
		function apply(ctx) {
			try {
				ctx.effect(() => {
					const listener = (event) => handleShellCommand(ctx, event);
					window.addEventListener("mg:shell-command", listener);
					return () => window.removeEventListener("mg:shell-command", listener);
				}, "dsh-hub: tray shell-command bridge");
			} catch (error) {
				console.warn("[dsh-hub] shell-command effect failed, using unmanaged listener:", error);
				window.addEventListener("mg:shell-command", (event) => handleShellCommand(ctx, event));
			}
			window.__mgSendCurrentWorkspace = () => sendCurrentWorkspace(ctx);
			window.__mgGetCurrentWorkspace = () => currentWorkspace(ctx)?.path ?? null;
			let lastSentFocus;
			const reportFocus = () => {
				try {
					const current = ctx.sessions?.list?.getSnapshot?.()?.current;
					if (current === lastSentFocus) return;
					lastSentFocus = current;
					window.ipc?.postMessage(`mg:session-focus:${current === void 0 ? "" : encodeURIComponent(current)}`);
				} catch {}
			};
			reportFocus();
			try {
				const unsubscribe = (ctx.sessions?.list)?.subscribe?.(reportFocus);
				ctx.effect(() => () => unsubscribe?.(), "dsh-hub: session focus reporter");
			} catch (error) {
				console.warn("[dsh-hub] session focus reporter failed:", error);
			}
			const slots = ctx.get("slots");
			if (slots === void 0) return;
			try {
				installModelSelect(ctx);
			} catch (error) {
				console.warn("[dsh-hub] model-select install failed:", error);
			}
			injectCardStyle();
			injectRightSidebarStyle();
			fetchStoredSkin().then((skinId) => {
				if (hasUserPickedSkin()) return;
				applySkin(skinId);
			});
			fetchStoredBackground().then((backgroundId) => {
				if (hasUserPickedBackground()) return;
				applyBackground(backgroundId);
				refreshConversationRailPalette();
			});
			try {
				slots.inject("settings.plugin.item", function* () {
					yield slots.register({
						name: "settings.plugin.item",
						key: "dsh-hub",
						priority: 30
					}, (props) => DesktopSettingsCard(props));
				});
			} catch (error) {
				console.warn("[dsh-hub] settings card injection failed:", error);
			}
			try {
				ctx.effect(() => {
					const host = document.createElement("div");
					host.id = "dsh-hub-right-sidebar-root";
					host.setAttribute("data-dsh-hub-right-sidebar", "");
					document.body.appendChild(host);
					const root = (0, react_dom_client.createRoot)(host);
					root.render((0, react.createElement)(RightSidebar, { ctx }));
					return () => {
						root.unmount();
						host.remove();
					};
				}, "dsh-hub: right sidebar mount");
			} catch (error) {
				console.warn("[dsh-hub] right sidebar mount failed:", error);
			}
			try {
				ctx.effect(() => {
					const host = document.createElement("div");
					host.id = "dsh-hub-session-tabs";
					document.body.appendChild(host);
					const root = (0, react_dom_client.createRoot)(host);
					root.render((0, react.createElement)(SessionTabs, { ctx }));
					return () => {
						root.unmount();
						host.remove();
					};
				}, "dsh-hub: session tabs mount");
			} catch (error) {
				console.warn("[dsh-hub] session tabs mount failed:", error);
			}
			try {
				bindPtyRuntime(ctx);
			} catch (error) {
				console.warn("[dsh-hub] pty runtime bind failed:", error);
			}
			try {
				fetchShells();
			} catch (error) {
				console.warn("[dsh-hub] pty shells fetch failed:", error);
			}
			try {
				syncHostPrefs();
			} catch (error) {
				console.warn("[dsh-hub] pty prefs sync failed:", error);
			}
			const onTerminalKey = (event) => {
				if (!((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "j")) return;
				if (event.target?.closest("[data-dsh-hub-terminal]") !== null) return;
				event.preventDefault();
				ptyToggle();
			};
			try {
				ctx.effect(() => {
					window.addEventListener("keydown", onTerminalKey);
					const host = document.createElement("div");
					host.id = "dsh-hub-terminal-dock";
					document.body.appendChild(host);
					const root = (0, react_dom_client.createRoot)(host);
					root.render((0, react.createElement)(TerminalPage));
					return () => {
						window.removeEventListener("keydown", onTerminalKey);
						root.unmount();
						host.remove();
					};
				}, "dsh-hub: terminal dock mount");
			} catch (error) {
				console.warn("[dsh-hub] terminal dock mount failed:", error);
			}
			try {
				ctx.effect(() => {
					let menuEl = null;
					const closeMenu = () => {
						if (menuEl === null) return;
						menuEl.remove();
						menuEl = null;
						window.removeEventListener("mousedown", onOutside);
						window.removeEventListener("keydown", onKey);
						window.removeEventListener("scroll", closeMenu, true);
					};
					const onKey = (event) => {
						if (event.key === "Escape") closeMenu();
					};
					const onOutside = (event) => {
						if (menuEl !== null && !menuEl.contains(event.target)) closeMenu();
					};
					const onContext = (event) => {
						const target = event.target;
						if (target instanceof Element) {
							if (target.closest("div[data-slot=\"sidebar.workspaces\"], [role=\"tree\"], div[role=\"treeitem\"]")) return;
							if (target.closest("textarea, input, select, button, a, [contenteditable=\"true\"], [role=\"button\"]")) return;
						}
						event.preventDefault();
						closeMenu();
						const el = document.createElement("div");
						el.setAttribute("role", "menu");
						el.style.cssText = [
							"position:fixed",
							"z-index:2147483646",
							"min-width:120px",
							"padding:4px",
							"background:var(--dsw-alias-bg-layer-3,#1f1f23)",
							"border:1px solid var(--dsw-alias-border-l2,#333)",
							"border-radius:8px",
							"box-shadow:0 6px 24px rgb(0 0 0 / 25%)",
							"font-family:var(--dsw-font-family,system-ui)",
							"font-size:13px",
							"color:var(--dsw-alias-label-primary,#e6e6e6)"
						].join(";");
						el.style.left = Math.min(event.clientX, window.innerWidth - 140) + "px";
						el.style.top = Math.min(event.clientY, window.innerHeight - 44) + "px";
						const item = document.createElement("button");
						item.setAttribute("role", "menuitem");
						item.textContent = t$1("menu.refresh");
						item.style.cssText = [
							"display:block",
							"width:100%",
							"padding:6px 10px",
							"border:none",
							"border-radius:6px",
							"background:transparent",
							"color:inherit",
							"font:inherit",
							"text-align:left",
							"cursor:pointer"
						].join(";");
						item.addEventListener("mouseenter", () => {
							item.style.background = "var(--dsw-alias-interactive-bg-hover, rgb(128 128 128 / 16%))";
						});
						item.addEventListener("mouseleave", () => {
							item.style.background = "transparent";
						});
						item.addEventListener("click", () => {
							closeMenu();
							location.reload();
						});
						el.appendChild(item);
						document.body.appendChild(el);
						menuEl = el;
						window.addEventListener("mousedown", onOutside);
						window.addEventListener("keydown", onKey);
						window.addEventListener("scroll", closeMenu, true);
					};
					document.addEventListener("contextmenu", onContext);
					return () => {
						document.removeEventListener("contextmenu", onContext);
						closeMenu();
					};
				}, "dsh-hub: context menu (refresh-only)");
			} catch (error) {
				console.warn("[dsh-hub] context menu install failed:", error);
			}
			try {
				ctx.effect(() => installPinnedConversations(ctx), "dsh-hub: pinned conversations");
			} catch (error) {
				console.warn("[dsh-hub] pinned conversations install failed:", error);
			}
			try {
				ctx.effect(() => installConversationRail(ctx), "dsh-hub: conversation rail");
			} catch (error) {
				console.warn("[dsh-hub] conversation rail install failed:", error);
			}
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map