window.__ModuleLoader__.load({
	id: "@marecgents/dsh-hub",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_dom_client = require("react-dom/client");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
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
			loading: "mg-card-loading"
		};
		const css$1 = CARD_CSS_CLASSES;
		/** The stylesheet text (brand token fallbacks mirror the SPA boot page). */
		const STYLE_TEXT$2 = `
.${css$1.card} {
  list-style: none;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-3, #ffffff);
  transition: border-color 0.16s, background 0.16s;
}
.${css$1.card}:hover { border-color: var(--dsw-alias-label-dimmed, rgb(0 0 0 / 20%)); }
.${css$1.cardOpen} {
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  border-color: var(--dsw-alias-label-dimmed, rgb(0 0 0 / 20%));
}
.${css$1.header} {
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
.${css$1.header}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: -2px;
}
.${css$1.headText} {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.${css$1.name} {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${css$1.description} {
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${css$1.pending} {
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
.${css$1.chevron} {
  flex: none;
  color: var(--dsw-alias-label-tertiary, #81858c);
  transition: transform 0.16s;
}
.${css$1.chevronOpen} { transform: rotate(180deg); }
.${css$1.body} {
  border-top: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  margin: 0 16px;
  padding-bottom: 8px;
}
.${css$1.readOnly} {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${css$1.section} { display: flex; flex-direction: column; }
.${css$1.sectionTitle} {
  margin: 0;
  padding: 8px 0 4px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${css$1.field} {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
}
.${css$1.field} + .${css$1.field} { border-top: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%)); }
/* Horizontal field row (official Setting-Cell style): label left, control right. */
.${css$1.fieldRow} {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
}
.${css$1.fieldRow} + .${css$1.field} { border-top: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%)); }
.${css$1.fieldLabel} {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary, #0f1115);
}
/* Selector pill for popup-menu fields (mirrors the theme select look, auto width). */
.${css$1.selectPill} {
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
.${css$1.selectPill}:focus-visible {
  outline: none;
  border-color: var(--dsw-alias-brand-primary, #3964fe);
}
.${css$1.control} {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${css$1.input}, .${css$1.select} {
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
.${css$1.input}:focus-visible, .${css$1.select}:focus-visible {
  outline: none;
  border-color: var(--dsw-alias-brand-primary, #3964fe);
}
.${css$1.input}:disabled, .${css$1.select}:disabled {
  color: var(--dsw-alias-label-tertiary, #81858c);
  cursor: default;
}
/* The native dropdown list inherits the select's color but can paint a
 * light panel — under a dark theme that yields white-on-white options.
 * Pin both colors explicitly so the list reads correctly either way. */
.${css$1.select} option {
  color: var(--dsw-alias-label-primary, #0f1115);
  background: var(--dsw-alias-bg-layer-3, #ffffff);
}
.${css$1.checkboxRow} {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary, #0f1115);
  cursor: pointer;
}
.${css$1.checkboxRow} input[type='checkbox'] {
  width: 16px;
  height: 16px;
  /* DeepSeek business blue stays legible in both themes. */
  accent-color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${css$1.checkboxRow} input[type='checkbox']:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: 2px;
}
.${css$1.checkboxRow} input[type='checkbox']:disabled { opacity: 0.4; }
.${css$1.hint} {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
/* Red risk warning under the "allow multiple instances" opt-in. */
.${css$1.dangerHint} {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-state-error-primary, #ec1919);
  font-weight: 500;
}
.${css$1.checkboxRow} + .${css$1.hint},
.${css$1.checkboxRow} + .${css$1.dangerHint} { margin-top: -8px; }
.${css$1.footer} {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 0 4px;
  border-top: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
.${css$1.discard}, .${css$1.save} {
  appearance: none;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 5px 14px;
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  cursor: pointer;
}
.${css$1.discard} {
  border-color: var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: none;
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${css$1.discard}:hover:not(:disabled) {
  color: var(--dsw-alias-label-primary, #0f1115);
  border-color: var(--dsw-alias-label-dimmed, rgb(0 0 0 / 20%));
}
.${css$1.save} {
  background: var(--dsw-alias-label-primary, #0f1115);
  color: var(--dsw-alias-bg-layer-3, #ffffff);
}
.${css$1.discard}:disabled, .${css$1.save}:disabled { opacity: 0.4; cursor: default; }
.${css$1.discard}:focus-visible, .${css$1.save}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: 1px;
}
.${css$1.failed} {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-state-error-primary, #dc2626);
}
.${css$1.saved} {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-state-success-primary, #16a34a);
  animation: mg-fade-out 2.2s ease forwards;
}
@keyframes mg-fade-out { from { opacity: 1; } to { opacity: 0; } }
.${css$1.loading} {
  height: 72px;
  border-radius: 8px;
  background: linear-gradient(90deg, transparent, var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)), transparent);
  background-size: 200% 100%;
  animation: mg-pulse 1.2s ease-in-out infinite;
}
@keyframes mg-pulse { from { background-position: 200% 0; } to { background-position: -200% 0; } }
`;
		/** Inject the card stylesheet once (idempotent; no-op when already present). */
		function injectCardStyle() {
			const id = "dsh-hub-style";
			if (document.getElementById(id) !== null) return;
			const style = document.createElement("style");
			style.id = id;
			style.textContent = STYLE_TEXT$2;
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
			}
		];
		/** Sentinel id meaning "no override / native look". */
		const DEFAULT_SKIN_ID = "default";
		/** Find a skin by id (undefined for unknown or `default`). */
		function findSkin(id) {
			if (id === "default") return void 0;
			return SKINS.find((skin) => skin.id === id);
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
			style.textContent = skin === void 0 ? "" : buildCss(skin);
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
		//#region src/client/backgrounds.ts
		/** Sentinel id meaning "no background image / native look". */
		const DEFAULT_BACKGROUND_ID = "none";
		/** The built-in background images. Add new entries here + assets/backgrounds. */
		const BACKGROUNDS = [{
			id: "boat",
			name: "远航",
			description: "蓝天碧海，卡通远航",
			url: "/api/dsh-hub/backgrounds/boat.jpg"
		}];
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
		* paints an opaque `var(--dsw-alias-bg-base)` over the whole viewport, so a
		* body-level image is invisible. The frame is the only `#root` descendant
		* carrying an inline `grid-template-columns` (stable structure, no CSS-module
		* hash — see docs/关键踩坑记录.md #32). The overlay is a second background
		* layer (`linear-gradient` + image) so it sits under the content with zero
		* stacking-context risk; the frame's token background-color stays as the
		* loading/fallback color.
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
			style.textContent = `#root div[style*="grid-template-columns"]{background-image:linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)),url("${background.url}") !important;background-size:cover,cover !important;background-position:center !important;background-repeat:no-repeat !important;background-attachment:fixed !important;}`;
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
		/** Localized copy kept inline (the card is small; no locale plugin needed). */
		const COPY = {
			title: "DSH HUB 设置",
			description: "桌面壳配置：窗口尺寸、主题与托盘行为",
			unsaved: "未保存",
			readOnly: "当前文档只读，无法保存",
			windowSection: "窗口设置",
			widthLabel: "宽度 (px)",
			heightLabel: "高度 (px)",
			themeLabel: "主题",
			themeOptions: {
				system: "跟随 dsh 主题",
				light: "浅色",
				dark: "深色"
			},
			themeHint: "跟随 dsh 主题：dsh 设为深色窗口即深色，设为浅色窗口即浅色",
			minimizeLabel: "最小化到托盘",
			minimizeHint: "最小化时隐藏到系统托盘，任务栏入口消失",
			closeLabel: "关闭到托盘",
			closeHint: "点 X 关闭窗口时保持进程与托盘存活（不勾选则完全退出）",
			notifyLabel: "会话完成通知",
			notifyHint: "任务回合完成时弹出系统通知，点击回到窗口",
			soundLabel: "提示音",
			soundHint: "用户提问、任务完成、AI 请求批准或任务出错时播放提示音（与系统通知互相独立）",
			multiInstanceLabel: "允许同时运行多个 dsh 实例",
			multiInstanceDanger: "⚠ 危险：多个 dsh 实例共享同一份会话数据（$DSH_HOME），若同时在同一个会话中操作，会导致会话日志损坏（seq 冲突），可能丢失对话内容且需要手工修复。强烈不建议开启。",
			multiInstanceHint: "不勾选时，若检测到已有 dsh 在运行，桌面壳将拒绝启动以保护数据",
			skinSection: "界面皮肤",
			skinLabel: "界面皮肤",
			skinHint: "点击即应用并保存；「默认」恢复原生外观。深色模式下的皮肤跟随 dsh 主题设置",
			skinDefaultName: "默认",
			skinDefaultDesc: "官方原生外观",
			skinApplyFailed: "皮肤切换失败，请重试",
			backgroundSection: "背景图",
			backgroundLabel: "背景图",
			backgroundHint: "点击即应用并保存；「无」关闭背景图，恢复原生/皮肤背景",
			backgroundDefaultName: "无",
			backgroundDefaultDesc: "不显示背景图",
			backgroundApplyFailed: "背景切换失败，请重试",
			discard: "放弃",
			save: "保存",
			saving: "保存中…",
			saveFailed: "保存失败，请重试",
			saved: "已保存"
		};
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
						setDraft({
							...saved,
							...patch
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
				markSkinUserPicked();
				setSkinFailed(false);
				setSkinId(id);
				applySkin(id);
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
						applySkin(DEFAULT_SKIN_ID);
						setSkinId(DEFAULT_SKIN_ID);
						setSkinFailed(true);
						setSaving(false);
					}
				});
			};
			/** Apply a background immediately: persist, then restyle the page live. */
			const onPickBackground = (id) => {
				if (id === backgroundId) return;
				markBackgroundUserPicked();
				setBackgroundFailed(false);
				setBackgroundId(id);
				applyBackground(id);
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
						applyBackground(DEFAULT_BACKGROUND_ID);
						setBackgroundId(DEFAULT_BACKGROUND_ID);
						setBackgroundFailed(true);
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
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: CARD_CSS_CLASSES.sectionTitle,
									children: COPY.skinSection
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: CARD_CSS_CLASSES.fieldRow,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: CARD_CSS_CLASSES.fieldLabel,
										children: COPY.skinLabel
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
										open: skinMenuOpen,
										onClose: () => {
											setSkinMenuOpen(false);
										},
										items: [{
											id: "default",
											label: COPY.skinDefaultName
										}, ...SKINS.map((skin) => ({
											id: skin.id,
											label: skin.name
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
											children: [skinId === "default" ? COPY.skinDefaultName : SKINS.find((skin) => skin.id === skinId)?.name ?? skinId, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, {})]
										})
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: CARD_CSS_CLASSES.hint,
									children: [
										skinId === "default" ? COPY.skinDefaultDesc : SKINS.find((skin) => skin.id === skinId)?.description ?? "",
										" — ",
										COPY.skinHint
									]
								}),
								skinFailed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: CARD_CSS_CLASSES.failed,
									role: "status",
									children: COPY.skinApplyFailed
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
		const c = RIGHT_SIDEBAR_CSS_CLASSES;
		const STYLE_TEXT$1 = `
.${c.root} {
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
.${c.header} {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 8px 0 0;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: transparent;
}
.${c.headerTop} {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
}
.${c.title} {
  font-size: 14px;
  line-height: 22px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c.toggle} {
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
.${c.toggle}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
.${c.toggle}:active { background: var(--dsw-alias-interactive-bg-active, rgb(0 0 0 / 10%)); }
.${c.toggle}:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #3964fe); outline-offset: 1px; }
.${c.toggleIcon} { transform: scaleX(-1); }
.${c.body} {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
/* Tabs mirror the center column's conversation/trajectory tab group
   (ui-conversation ConversationRoot.module.css): 36px gap, 13/16/500 text,
   tertiary ink, and a 2px business-blue active bar on the selected tab. */
.${c.tabs} {
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
.${c.tab} {
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
.${c.tab}::after {
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
.${c.tabActive} {
  color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${c.tabActive}::after {
  background: var(--dsw-alias-state-business-primary, #3964fe);
}
.${c.tab}:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #3964fe);
  outline-offset: 2px;
  border-radius: 2px;
  color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${c.content} {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
}
.${c.content}::-webkit-scrollbar { width: 8px; }
.${c.content}::-webkit-scrollbar-thumb {
  background: var(--dsw-alias-scrollbar-bg-l2, rgb(0 0 0 / 12%));
  border-radius: 4px;
}
.${c.content}::-webkit-scrollbar-track { background: transparent; }
.${c.section} { margin-bottom: 16px; }
.${c.sectionTitle} {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f1115);
  margin-bottom: 8px;
}
.${c.refresh} {
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
.${c.refresh}:hover {
  color: var(--dsw-alias-label-primary, #0f1115);
  border-color: var(--dsw-alias-label-dimmed, rgb(0 0 0 / 20%));
  background: var(--dsw-alias-button-floating-hover, #f1f3f5);
}
.${c.chartWrap} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
/* Reasonix-style rounded card framing a group of info, using dsh tokens. */
.${c.card} {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-1, #ffffff);
}
.${c.chart} {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, var(--dsw-alias-state-business-primary, #3964fe) 0%, var(--dsw-alias-border-l2, #d4d4d8) 100%);
}
.${c.chartCenter} {
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
.${c.legend} { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.${c.legendRow} {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c.legendDot} { width: 10px; height: 10px; border-radius: 50%; flex: none; }
.${c.statGrid} { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
/* Reasonix-style stat card: small icon + caption label above a bold value. */
.${c.statCard} {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-1, #ffffff);
}
.${c.statHead} {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.${c.statIcon} { flex: none; color: var(--dsw-alias-state-business-primary, #3964fe); }
.${c.statLabel} {
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-tertiary, #81858c);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${c.statValue} {
  font-size: 15px;
  line-height: 22px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f1115);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${c.tree} { list-style: none; margin: 0; padding: 0; }
.${c.treeRow} {
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
.${c.treeRow}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
.${c.treeIcon} { flex: none; color: var(--dsw-alias-label-secondary, #61666b); }
.${c.treeName} { overflow: hidden; text-overflow: ellipsis; }
.${c.treeChildren} { list-style: none; margin: 0; padding-left: 16px; }
.${c.gitBranchCard} {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
.${c.gitBranchIcon} { flex: none; color: var(--dsw-alias-state-business-primary, #3964fe); }
.${c.gitBranchName} {
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary, #0f1115);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${c.gitBranchHead} {
  margin-left: auto;
  flex: none;
  font-size: 12px;
  line-height: 18px;
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${c.gitGroupHead} {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c.gitGroupBadge} {
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
.${c.gitChanges} { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.${c.gitChange} {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 20px;
}
.${c.gitChange}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
.${c.gitStatus} {
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
.${c.gitStatus}-added {
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 14%, transparent);
  color: var(--dsw-alias-state-success-primary, #22c55e);
}
.${c.gitStatus}-modified {
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f59e0b) 14%, transparent);
  color: var(--dsw-alias-state-warn-primary, #f59e0b);
}
.${c.gitStatus}-deleted {
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #ec1919) 12%, transparent);
  color: var(--dsw-alias-state-error-primary, #ec1919);
}
.${c.gitStatus}-renamed {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3964fe) 14%, transparent);
  color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${c.gitStatus}-untracked {
  background: var(--dsw-alias-bg-module-platform, #f5f6f7);
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${c.empty} { padding: 12px 0; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-tertiary, #81858c); }
.${c.collapsed} {
  width: 56px;
  overflow: visible;
}
.${c.rail} {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  padding: 18px 10px 6px;
  height: 100%;
  box-sizing: border-box;
}
.${c.railItems} {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
}
.${c.railPlaceholder} {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px dashed var(--dsw-alias-border-l2, rgb(0 0 0 / 12%));
  background: var(--dsw-alias-bg-layer-3, rgb(0 0 0 / 2%));
}
.${c.railItem} {
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
.${c.railItem}:hover {
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
.${c.toggle},
.${c.railItem} {
  position: relative;
}
.${c.toggle}::after,
.${c.railItem}::after {
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
.${c.toggle}:hover::after,
.${c.railItem}:hover::after {
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
		//#region src/client/right-sidebar.tsx
		/**
		* RightSidebar — the dsh-hub right sidebar mounted as a body portal
		* (like dsh-better-sidebar), independent of the official details column so it
		* also works in blank/new conversations where the details column is forced
		* to 0. It mirrors the left sidebar's collapse/rail behavior and provides
		* three tabs:
		*  - Overview: context-token usage rendered as a fan/donut chart.
		*  - Files: current workspace file/folder tree, strictly synced to the
		*    current session's workspace.
		*  - Git: whether the workspace is a git repo, branch, and working-tree changes.
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
		/** One expandable directory/file row. */
		function TreeNode({ entry, depth }) {
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
					depth: depth + 1
				}, child.path))
			})] });
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: clsx(RIGHT_SIDEBAR_CSS_CLASSES.root, !open && RIGHT_SIDEBAR_CSS_CLASSES.collapsed),
				style: { width: open ? 360 : 56 },
				children: open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
										depth: 0
									}, entry.path))
								})]
							}),
							tab === "git" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GitTab, {
								git,
								loading: workspaceLoading
							})
						]
					})
				})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
				})
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
		* @module dsh-hub/client/pin-conversations
		*/
		/** Route prefix of the host pins API (mirrors services/pins-api.ts). */
		const PINS_API = "/api/dsh-hub/pins";
		/** localStorage fallback key (used only when the host API is unreachable). */
		const LS_KEY = "dsh-hub:pins";
		/** Mirror of the host-side cap (services/pins-api.ts MAX_PINS). */
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
			const debouncedSync = debounce(() => {
				if (alive) sync();
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
				if (leafTexts.some((t) => t.length > entry.title.length && t.includes(entry.title))) return void 0;
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
				const sig = `${inSearch ? ":search" : ""}|${live.length === 0 ? ":empty" : ""}|${live.map((id) => byId[id]?.displayTitle ?? id).join("")}`;
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
					itemTitle.title = title;
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
				if (slot === null || tree === null) return;
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
				}
			});
			bootObserver.observe(document.body, {
				childList: true,
				subtree: true
			});
			setTimeout(() => {
				if (findSlot() === null && alive) bootObserver.disconnect();
			}, 1e4);
			return () => {
				alive = false;
				slotObserver.disconnect();
				bootObserver.disconnect();
				unsubSessions();
				unsubWorkspaces();
				window.removeEventListener("storage", onStorage);
				for (const el of Array.from(document.querySelectorAll(`[data-mg-pin], [data-mg-pin-item], .${PIN_CSS_CLASSES.section}`))) el.remove();
				for (const el of Array.from(document.querySelectorAll(`[data-mg-pinned]`))) {
					el.classList.remove(PIN_CSS_CLASSES.rowPinned);
					delete el.dataset.mgPinned;
				}
			};
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
		/** Required services: slots (card), workspaces + sessions (tray + sidebar data). */
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
			if (event.detail?.command !== "new-task") return;
			const workspaces = ctx.workspaces;
			if (workspaces === void 0 || workspaces.startSession === void 0) {
				console.warn("[dsh-hub] new-task ignored: workspaces service unavailable");
				return;
			}
			console.log("[dsh-hub] new-task (current session workspace)");
			workspaces.startSession();
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
			injectCardStyle();
			injectRightSidebarStyle();
			fetchStoredSkin().then((skinId) => {
				if (hasUserPickedSkin()) return;
				applySkin(skinId);
			});
			fetchStoredBackground().then((backgroundId) => {
				if (hasUserPickedBackground()) return;
				applyBackground(backgroundId);
			});
			try {
				slots.inject("settings.plugin.item", function* () {
					yield slots.register({
						name: "settings.plugin.item",
						id: "dsh-hub",
						order: 30
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
				ctx.effect(() => installPinnedConversations(ctx), "dsh-hub: pinned conversations");
			} catch (error) {
				console.warn("[dsh-hub] pinned conversations install failed:", error);
			}
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map