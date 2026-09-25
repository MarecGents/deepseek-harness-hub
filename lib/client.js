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
			group: "mg-card-group",
			groupTitle: "mg-card-group-title",
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
		const STYLE_TEXT$2 = `
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
/* Collapsible group: a fold header (title + chevron) with a bordered body
   block, matching the card's own chrome (2026-08-30). */
.${css$2.group} { margin: 10px 0 0; }
.${css$2.groupTitle} {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0;
  padding: 6px 2px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${css$2.groupTitle}:focus-visible { outline: 2px auto var(--dsw-alias-brand-primary, #3964fe); }
.${css$2.group} > .${css$2.section} { padding-top: 2px; }
.${css$2.group}[hidden] { display: none; }
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
			style.textContent = STYLE_TEXT$2;
			document.head.appendChild(style);
		}
		/**
		* Long-history rendering aid: browser-level `content-visibility` on the chat
		* flow rows. dsh renders every loaded message node (no virtualizer); after
		* paging through a long session the DOM grows to thousands of rows and
		* scrolling/reflow slows. `content-visibility: auto` makes the browser skip
		* layout/paint for off-screen rows; `contain-intrinsic-size` reserves an
		* estimated row height so the scrollbar does not jump. Anchored on the
		* official stable `data-chat-flow` column (direct children = message nodes).
		* No dsh source change; injection only.
		*/
		function injectChatVisibilityStyle() {
			const id = "dsh-hub-chat-visibility";
			if (document.getElementById(id) !== null) return;
			const style = document.createElement("style");
			style.id = id;
			style.textContent = ["[data-chat-flow] > *{content-visibility:auto;contain-intrinsic-size:auto 220px;}"].join("\n");
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
		const HEX6 = /^#?([0-9a-f]{6})$/i;
		function rgbOf(color) {
			const m = color.match(HEX6);
			if (m === null) throw new Error(`unsupported color: ${color}`);
			const n = parseInt(m[1], 16);
			return [
				n >> 16 & 255,
				n >> 8 & 255,
				n & 255
			];
		}
		function hexOf(rgb) {
			return `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;
		}
		function mix(a, b, t) {
			const [ar, ag, ab] = rgbOf(a);
			const [br, bg, bb] = rgbOf(b);
			return hexOf([
				ar + (br - ar) * t,
				ag + (bg - ag) * t,
				ab + (bb - ab) * t
			]);
		}
		/** Composite an `rgba()` color over an opaque base — dsw tokens want hex. */
		function over(color, base) {
			const m = color.match(/rgba?\(([^)]+)\)/);
			if (m === null) return color;
			const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
			const [r, g, b] = parts;
			const a = parts[3] ?? 1;
			const [br, bg, bb] = rgbOf(base);
			return hexOf([
				r * a + br * (1 - a),
				g * a + bg * (1 - a),
				b * a + bb * (1 - a)
			]);
		}
		/**
		* Derivation rule: Reasonix core palette → dsw token set.
		*
		* The main roles map 1:1 (bg/fg/accent/border/code). Everything Reasonix does
		* not name — the third border step, the dimmed label, the accent washes used
		* for selected rows and bubbles — is derived with the fixed coefficients
		* below, so all seven Reasonix skins stay internally consistent. `dimmed`
		* lands ~72% of the way to bg (Reasonix's own `--fg-faint` is already the
		* 3.5:1 floor, so this stays legible).
		*/
		function reasonixPalette(p) {
			const border = p.border.startsWith("rgba") ? over(p.border, p.bg) : p.border;
			const borderSoft = p.borderSoft.startsWith("rgba") ? over(p.borderSoft, p.bg) : p.borderSoft;
			return {
				alias: {
					"bg-base": p.bg,
					"bg-layer-1": p.bgSoft,
					"bg-layer-2": p.bgElev,
					"bg-layer-3": p.bgElev2,
					"bg-overlay": p.bgElev,
					"label-primary": p.fg,
					"label-secondary": p.fgDim,
					"label-tertiary": p.fgFaint,
					"label-dimmed": mix(p.fgFaint, p.bg, .28),
					"border-l1": borderSoft,
					"border-l2": border,
					"border-l3": mix(border, p.fgFaint, .35),
					"brand-primary": p.accent,
					"brand-primary-invert": p.accentFg,
					"brand-text": p.accentFg,
					"button-primary-fill": p.accent,
					"button-primary-hover": p.accentStrong,
					"button-primary-dimmed": over(p.accentSoft, p.bgElev2),
					"interactive-bg-hover": p.sidebarHover,
					"interactive-bg-active": over(p.accentSoft, p.bg),
					"markdown-code-block": p.code,
					"markdown-inline-code": p.bgElev2,
					"scrollbar-bg-l1": border,
					"scrollbar-hover-l1": mix(border, p.fgFaint, .4),
					"bg-module-platform": p.bgElev2,
					"tooltip-bg": p.bgElev2,
					"toast-bg": p.bgElev2
				},
				specific: {
					"sidebar-fill": p.sidebar,
					"sidebar-nav-item-active-accent": p.accent,
					"sidebar-nav-item-active": over(p.accentSoft, p.bgElev),
					"sidebar-nav-item-hover": p.sidebarHover,
					menu: p.bgElev,
					bubble: over(p.accentSoft, p.bgElev),
					"bubble-highlight": over(p.accentSoft, p.bgElev2)
				}
			};
		}
		function reasonixSkin(id, name, description, light, dark) {
			const l = reasonixPalette(light);
			const d = reasonixPalette(dark);
			return {
				id,
				name,
				description,
				light: l.alias,
				dark: d.alias,
				specific: {
					light: l.specific,
					dark: d.specific
				}
			};
		}
		/**
		* The built-in skins. Palettes are original compositions over the dsw alias
		* token set; adjust freely. The `rx-*` group is the Reasonix-native set — see
		* `reasonixSkin` for the mapping rule.
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
			reasonixSkin("rx-core", "Reasonix 默认", "Reasonix 原生默认——墨黑底 + 铜橙强调", {
				bg: "#f7f8fb",
				bgSoft: "#eef2f7",
				bgElev: "#ffffff",
				bgElev2: "#f2f5f9",
				sidebar: "#f9f9f9",
				sidebarHover: "#e8edf4",
				border: "#d8dee8",
				borderSoft: "#e7ebf2",
				fg: "#111827",
				fgDim: "#4b5563",
				fgFaint: "#8a94a6",
				accent: "#2f5fa8",
				accentFg: "#ffffff",
				accentSoft: "rgba(47,95,168,0.12)",
				accentStrong: "#244f91",
				code: "#f2f5f9"
			}, {
				bg: "#090a0c",
				bgSoft: "#111319",
				bgElev: "#191b22",
				bgElev2: "#222631",
				sidebar: "#0c0e12",
				sidebarHover: "#181c24",
				border: "#343945",
				borderSoft: "#252a34",
				fg: "#f4f5f7",
				fgDim: "#c0c4cc",
				fgFaint: "#858b96",
				accent: "#d97757",
				accentFg: "#1a0f0a",
				accentSoft: "rgba(217,119,87,0.14)",
				accentStrong: "#e58a6b",
				code: "#111319"
			}),
			reasonixSkin("rx-graphite", "石墨", "Reasonix 方向 Graphite——冷灰墨底 + 朱橙强调", {
				bg: "#f4f3ef",
				bgSoft: "#f0efe9",
				bgElev: "#ffffff",
				bgElev2: "#f7f6f2",
				sidebar: "#f7f6f2",
				sidebarHover: "#eae8e1",
				border: "#dedbd3",
				borderSoft: "#eae7e0",
				fg: "#1a1a18",
				fgDim: "#57564f",
				fgFaint: "#8a887e",
				accent: "#d94f22",
				accentFg: "#ffffff",
				accentSoft: "rgba(217,79,34,0.12)",
				accentStrong: "#bd4319",
				code: "#f0efe9"
			}, {
				bg: "#0c0d10",
				bgSoft: "#101115",
				bgElev: "#15161a",
				bgElev2: "#1c1d22",
				sidebar: "#0a0b0e",
				sidebarHover: "#1a1c21",
				border: "rgba(255,255,255,0.1)",
				borderSoft: "rgba(255,255,255,0.055)",
				fg: "#f1f1ef",
				fgDim: "#a7a8ad",
				fgFaint: "#74757a",
				accent: "#ff6a3d",
				accentFg: "#1a0a05",
				accentSoft: "rgba(255,106,61,0.14)",
				accentStrong: "#ff8158",
				code: "#101115"
			}),
			reasonixSkin("rx-aurora", "极光", "Reasonix 方向 Aurora——深紫夜底 + 薰衣草强调", {
				bg: "#f6f3fb",
				bgSoft: "#efeaf8",
				bgElev: "#fdfcff",
				bgElev2: "#f4f0fb",
				sidebar: "#f9f6fd",
				sidebarHover: "#e9e2f6",
				border: "#ddd4ee",
				borderSoft: "#ebe5f7",
				fg: "#1c1630",
				fgDim: "#584f76",
				fgFaint: "#8b82a8",
				accent: "#6b4ee6",
				accentFg: "#ffffff",
				accentSoft: "rgba(107,78,230,0.12)",
				accentStrong: "#5739cc",
				code: "#efeaf8"
			}, {
				bg: "#0e0d18",
				bgSoft: "#121120",
				bgElev: "#17162a",
				bgElev2: "#1f1d36",
				sidebar: "#0c0b15",
				sidebarHover: "#1c1a30",
				border: "rgba(255,255,255,0.07)",
				borderSoft: "rgba(255,255,255,0.045)",
				fg: "#ecebf7",
				fgDim: "#a9a4c6",
				fgFaint: "#736e91",
				accent: "#8b7cff",
				accentFg: "#0f0b22",
				accentSoft: "rgba(139,124,255,0.15)",
				accentStrong: "#a094ff",
				code: "#121120"
			}),
			reasonixSkin("rx-slate", "岩板", "Reasonix 方向 Slate——炭蓝底 + 天青强调", {
				bg: "#f5f6f9",
				bgSoft: "#eef0f4",
				bgElev: "#ffffff",
				bgElev2: "#f2f4f8",
				sidebar: "#f8f9fb",
				sidebarHover: "#e7ebf1",
				border: "#d9dee7",
				borderSoft: "#e8ecf2",
				fg: "#131820",
				fgDim: "#4d5665",
				fgFaint: "#868f9e",
				accent: "#2f6fd8",
				accentFg: "#ffffff",
				accentSoft: "rgba(47,111,216,0.12)",
				accentStrong: "#2559b8",
				code: "#eef0f4"
			}, {
				bg: "#0d0f12",
				bgSoft: "#0f1216",
				bgElev: "#15181d",
				bgElev2: "#1d2128",
				sidebar: "#0b0d10",
				sidebarHover: "#1a1e24",
				border: "rgba(255,255,255,0.08)",
				borderSoft: "rgba(255,255,255,0.05)",
				fg: "#e7eaf0",
				fgDim: "#9aa2b1",
				fgFaint: "#6b7381",
				accent: "#4d8df6",
				accentFg: "#08111f",
				accentSoft: "rgba(77,141,246,0.15)",
				accentStrong: "#6ba0f8",
				code: "#0f1216"
			}),
			reasonixSkin("rx-carbon", "碳素", "Reasonix 方向 Carbon——暖炭底 + 青绿强调", {
				bg: "#f6f4f0",
				bgSoft: "#efece6",
				bgElev: "#ffffff",
				bgElev2: "#f4f1ec",
				sidebar: "#f9f7f4",
				sidebarHover: "#e9e5dd",
				border: "#ded9d0",
				borderSoft: "#eae6df",
				fg: "#1c1a16",
				fgDim: "#57534a",
				fgFaint: "#8a857a",
				accent: "#12897a",
				accentFg: "#ffffff",
				accentSoft: "rgba(18,137,122,0.12)",
				accentStrong: "#0d6d61",
				code: "#efece6"
			}, {
				bg: "#0e0d0c",
				bgSoft: "#100f0e",
				bgElev: "#171614",
				bgElev2: "#1f1e1b",
				sidebar: "#0c0b0a",
				sidebarHover: "#1c1b18",
				border: "rgba(255,250,240,0.08)",
				borderSoft: "rgba(255,250,240,0.05)",
				fg: "#ede9e3",
				fgDim: "#a59f95",
				fgFaint: "#766f65",
				accent: "#2dd4bf",
				accentFg: "#04211d",
				accentSoft: "rgba(45,212,191,0.14)",
				accentStrong: "#5ce0cf",
				code: "#100f0e"
			}),
			reasonixSkin("rx-nocturne", "夜曲", "Reasonix 方向 Nocturne——深靛底 + 靛蓝强调", {
				bg: "#f6f5fb",
				bgSoft: "#efedf7",
				bgElev: "#fdfcff",
				bgElev2: "#f4f2fa",
				sidebar: "#f9f8fc",
				sidebarHover: "#e9e6f3",
				border: "#dcd8ec",
				borderSoft: "#eae8f5",
				fg: "#191733",
				fgDim: "#544f75",
				fgFaint: "#87819f",
				accent: "#5b62e8",
				accentFg: "#ffffff",
				accentSoft: "rgba(91,98,232,0.12)",
				accentStrong: "#474ecf",
				code: "#efedf7"
			}, {
				bg: "#101019",
				bgSoft: "#13131e",
				bgElev: "#191a27",
				bgElev2: "#212231",
				sidebar: "#0e0e16",
				sidebarHover: "#1e1f2c",
				border: "rgba(255,255,255,0.08)",
				borderSoft: "rgba(255,255,255,0.05)",
				fg: "#eceaf3",
				fgDim: "#a6a2bd",
				fgFaint: "#726e8b",
				accent: "#818cf8",
				accentFg: "#0d0f24",
				accentSoft: "rgba(129,140,248,0.15)",
				accentStrong: "#9aa3fa",
				code: "#13131e"
			}),
			reasonixSkin("rx-amber", "琥珀", "Reasonix 方向 Amber——默认底 + 琥珀强调", {
				bg: "#f7f8fb",
				bgSoft: "#eef2f7",
				bgElev: "#ffffff",
				bgElev2: "#f2f5f9",
				sidebar: "#f9f9f9",
				sidebarHover: "#e8edf4",
				border: "#d8dee8",
				borderSoft: "#e7ebf2",
				fg: "#111827",
				fgDim: "#4b5563",
				fgFaint: "#8a94a6",
				accent: "#dd5b28",
				accentFg: "#ffffff",
				accentSoft: "rgba(221,91,40,0.12)",
				accentStrong: "#c24a1b",
				code: "#f2f5f9"
			}, {
				bg: "#090a0c",
				bgSoft: "#111319",
				bgElev: "#191b22",
				bgElev2: "#222631",
				sidebar: "#0c0e12",
				sidebarHover: "#181c24",
				border: "#343945",
				borderSoft: "#252a34",
				fg: "#f4f5f7",
				fgDim: "#c0c4cc",
				fgFaint: "#858b96",
				accent: "#d4632f",
				accentFg: "#1a0e07",
				accentSoft: "rgba(212,99,47,0.14)",
				accentStrong: "#e07744",
				code: "#111319"
			}),
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
			"skin.name.rx-core": "Reasonix 默认",
			"skin.name.rx-graphite": "石墨",
			"skin.name.rx-aurora": "极光",
			"skin.name.rx-slate": "岩板",
			"skin.name.rx-carbon": "碳素",
			"skin.name.rx-nocturne": "夜曲",
			"skin.name.rx-amber": "琥珀",
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
			"skin.desc.rx-core": "Reasonix 原生默认——墨黑底 + 铜橙强调",
			"skin.desc.rx-graphite": "Reasonix 方向 Graphite——冷灰墨底 + 朱橙强调",
			"skin.desc.rx-aurora": "Reasonix 方向 Aurora——深紫夜底 + 薰衣草强调",
			"skin.desc.rx-slate": "Reasonix 方向 Slate——炭蓝底 + 天青强调",
			"skin.desc.rx-carbon": "Reasonix 方向 Carbon——暖炭底 + 青绿强调",
			"skin.desc.rx-nocturne": "Reasonix 方向 Nocturne——深靛底 + 靛蓝强调",
			"skin.desc.rx-amber": "Reasonix 方向 Amber——默认底 + 琥珀强调",
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
			"settings.resolutionSection": "分辨率",
			"settings.resolutionDesc": "窗口宽度与高度",
			"settings.generalSection": "常规设置",
			"settings.generalDesc": "托盘、通知、声音与多实例行为",
			"settings.appearanceSection": "外观设置",
			"settings.appearanceDesc": "主题、皮肤、背景图与桌面图标",
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
			"menu.copy": "复制",
			"menu.cut": "剪切",
			"menu.paste": "粘贴",
			"menu.undo": "撤销",
			"menu.redo": "重做",
			"menu.delete": "删除",
			"menu.selectAll": "全选",
			"menu.openInBrowser": "在浏览器中打开",
			"menu.copyLink": "复制链接地址",
			"menu.addToTask": "添加到当前任务",
			"menu.askInNewSession": "在辅助对话中提问",
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
			"skin.name.rx-core": "Reasonix Default",
			"skin.name.rx-graphite": "Graphite",
			"skin.name.rx-aurora": "Aurora",
			"skin.name.rx-slate": "Slate",
			"skin.name.rx-carbon": "Carbon",
			"skin.name.rx-nocturne": "Nocturne",
			"skin.name.rx-amber": "Amber",
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
			"skin.desc.rx-core": "Reasonix native default — ink black base + copper accent",
			"skin.desc.rx-graphite": "Reasonix direction Graphite — cool graphite base + vermilion accent",
			"skin.desc.rx-aurora": "Reasonix direction Aurora — deep violet base + lavender accent",
			"skin.desc.rx-slate": "Reasonix direction Slate — charcoal blue base + azure accent",
			"skin.desc.rx-carbon": "Reasonix direction Carbon — warm charcoal base + teal accent",
			"skin.desc.rx-nocturne": "Reasonix direction Nocturne — deep indigo base + indigo accent",
			"skin.desc.rx-amber": "Reasonix direction Amber — default base + amber accent",
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
			"settings.resolutionSection": "Resolution",
			"settings.resolutionDesc": "Window width and height",
			"settings.generalSection": "General",
			"settings.generalDesc": "Tray, notifications, sound and multi-instance",
			"settings.appearanceSection": "Appearance",
			"settings.appearanceDesc": "Theme, skin, background and desktop icon",
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
			"menu.copy": "Copy",
			"menu.cut": "Cut",
			"menu.paste": "Paste",
			"menu.undo": "Undo",
			"menu.redo": "Redo",
			"menu.delete": "Delete",
			"menu.selectAll": "Select All",
			"menu.openInBrowser": "Open in Browser",
			"menu.copyLink": "Copy Link Address",
			"menu.addToTask": "Add to Current Task",
			"menu.askInNewSession": "Ask in Auxiliary Conversation",
			"ws.newTask": "New task",
			"ws.openWorkspace": "Open workspace"
		};
		/** Current locale id, cached from `<html lang>` (falls back to zh). */
		function detectLang() {
			return document.documentElement.lang?.toLowerCase().startsWith("en") ? "en" : "zh";
		}
		let lang = detectLang();
		const listeners$1 = /* @__PURE__ */ new Set();
		function notify() {
			for (const cb of listeners$1) cb();
		}
		/** Translate a key in the active language; `{name}` placeholders are filled from params. */
		function t$1(key, params) {
			let text = (lang === "en" ? en$1 : zh$1)[key] ?? zh$1[key] ?? key;
			if (params !== void 0) for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v));
			return text;
		}
		/** Subscribe to locale changes; returns an unsubscribe function. */
		function subscribeLocale(cb) {
			listeners$1.add(cb);
			return () => {
				listeners$1.delete(cb);
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
		//#region src/client/api-auth.ts
		/**
		* Plugin API auth — shared Bearer-token helpers for client fetches against
		* `/api/dsh-hub/*` routes that mutate state (config POST, pins PUT, PTY
		* routes). The host injects the per-process token as the `__DSH_HUB_TOKEN__`
		* global (see src/server/token.ts `injectTokenToHtml`); guarded server routes
		* verify it with a constant-time comparison (audit 2026-09-02 P1-5: every
		* state-changing route now requires it, so all mutating client calls must
		* carry the header).
		*
		* Module category: Helper (client half — pure resolution, no side effects).
		*
		* @module dsh-hub/client/api-auth
		*/
		/** Cached token — read once from the injected global (page-lifetime value). */
		let cachedToken = null;
		/**
		* Resolve the auth token from the `__DSH_HUB_TOKEN__` global injected by the
		* host; cached at module level after first read. Empty string when absent
		* (plain browser / dev-server detached from the shell).
		* @returns the token, or '' when unavailable.
		*/
		function pluginToken() {
			if (cachedToken === null) cachedToken = globalThis.__DSH_HUB_TOKEN__ ?? "";
			return cachedToken;
		}
		/**
		* Headers for a plugin API call: always JSON content-type when a body is
		* sent, plus the Bearer token when present.
		* @param json - true when the request carries a JSON body.
		* @returns the header record to spread into `fetch` options.
		*/
		function authHeaders(json = true) {
			const headers = {};
			if (json) headers["content-type"] = "application/json";
			const token = pluginToken();
			if (token !== "") headers["Authorization"] = "Bearer " + token;
			return headers;
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
		* invisible. The frame is the only SECOND-level `#root` grandchild carrying an inline
		* `grid-template-columns` (stable structure, no CSS-module hash — see
		* docs/关键踩坑记录.md #32). The selector is deliberately the child-combinator
		* chain `#root > div > div[...]`: a bare `#root div[...]` also matches every
		* in-page grid that carries inline columns (e.g. the usage-stats tables),
		* which got the user's background image painted over them (踩坑 #96).
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
			style.textContent = `#root > div > div[style*="grid-template-columns"]{background-image:linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)),url("${background.url}") !important;background-size:cover,cover !important;background-position:center !important;background-repeat:no-repeat !important;background-attachment:fixed !important;}#root > div > div[style*="grid-template-columns"] > div:first-child{background-color:transparent !important;}#root > div > div[style*="grid-template-columns"] [data-slot="sidebar"] > div{background-color:color-mix(in srgb, var(--dsw-specific-sidebar-fill) 90%, transparent) !important;}#root > div > div[style*="grid-template-columns"] [data-slot="conversation"] > div{background-color:color-mix(in srgb, var(--dsw-alias-bg-base) 75%, transparent) !important;}#root > div > div[style*="grid-template-columns"] [data-slot="conversation"] [data-conversation-composer-overlay]{background-color:color-mix(in srgb, var(--dsw-alias-bg-base) 75%, transparent) !important;}#root > div > div[style*="grid-template-columns"] [data-slot="details"] > div{background-color:color-mix(in srgb, var(--dsw-alias-bg-base) 90%, transparent) !important;}`;
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
		const STYLE_TEXT$1 = `
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
			style.textContent = STYLE_TEXT$1;
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
				const frame = document.querySelector("#root > div > div[style*=\"grid-template-columns\"]");
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
					headers: authHeaders(),
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
			const [loading, setLoading] = (0, react.useState)(true);
			const [config, setConfig] = (0, react.useState)(null);
			const [draft, setDraft] = (0, react.useState)(null);
			const [saving, setSaving] = (0, react.useState)(false);
			const [failed, setFailed] = (0, react.useState)(false);
			const [saved, setSaved] = (0, react.useState)(false);
			const [skinId, setSkinId] = (0, react.useState)(DEFAULT_SKIN_ID);
			const [skinFailed, setSkinFailed] = (0, react.useState)(false);
			const [skinMenuOpen, setSkinMenuOpen] = (0, react.useState)(false);
			const [groupOpen, setGroupOpen] = (0, react.useState)({
				resolution: false,
				general: false,
				appearance: false
			});
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
				resolutionSection: t$1("settings.resolutionSection"),
				generalSection: t$1("settings.generalSection"),
				appearanceSection: t$1("settings.appearanceSection"),
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
			const groupCard = (key, title, description, body) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: clsx(CARD_CSS_CLASSES.card, groupOpen[key] && CARD_CSS_CLASSES.cardOpen),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: CARD_CSS_CLASSES.header,
					"aria-expanded": groupOpen[key],
					"aria-label": `${groupOpen[key] ? "收起" : "展开"}: ${title}`,
					onClick: () => setGroupOpen((g) => ({
						...g,
						[key]: !g[key]
					})),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: CARD_CSS_CLASSES.headText,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: CARD_CSS_CLASSES.name,
								children: title
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: CARD_CSS_CLASSES.description,
								children: description
							})]
						}),
						dirty ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: CARD_CSS_CLASSES.pending,
							children: COPY.unsaved
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: clsx(CARD_CSS_CLASSES.chevron, groupOpen[key] && CARD_CSS_CLASSES.chevronOpen) })
					]
				}), groupOpen[key] ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: CARD_CSS_CLASSES.body,
					children: body
				}) : null]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: 10
				},
				children: [loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: CARD_CSS_CLASSES.loading,
					role: "status",
					"aria-label": "读取配置…"
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					draft !== null && groupCard("resolution", COPY.resolutionSection, t$1("settings.resolutionDesc"), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: CARD_CSS_CLASSES.section,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
						})]
					})),
					draft !== null && groupCard("general", COPY.generalSection, t$1("settings.generalDesc"), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: CARD_CSS_CLASSES.section,
						children: [
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
					})),
					draft !== null && groupCard("appearance", COPY.appearanceSection, t$1("settings.appearanceDesc"), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: CARD_CSS_CLASSES.section,
						children: [
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
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})
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
							}) : null,
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
										children: [backgroundId === "none" ? COPY.backgroundDefaultName : BACKGROUNDS.find((background) => background.id === backgroundId)?.name ?? backgroundId, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})]
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
							}) : null,
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
					}))
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
			});
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
		* 挂载为 body portal 浮层；关闭条件（2026-09-19 收紧，见 openSessionMenu）：
		* 菜单外 pointerdown、Esc、以及「锚定行所在容器的滚动」；窗口 resize 改为重新
		* 贴边而不是关闭，窗口 blur 不再关闭。disposer 移除。
		* 本模块是纯动作库（open/close），事件接线在 pin-conversations.ts（官方行
		* 右键 + 官方 ⋯ 菜单截获 + 置顶项右键）。
		*
		* @module dsh-hub/client/session-menu
		*/
		/** Copy text to the clipboard with a legacy fallback for non-secure contexts. */
		function copyText$1(text) {
			if (navigator.clipboard !== void 0 && window.isSecureContext) return navigator.clipboard.writeText(text).then(() => true, () => copyFallback$1(text));
			return Promise.resolve(copyFallback$1(text));
		}
		/** execCommand fallback — document.execCommand is deprecated but universal. */
		function copyFallback$1(text) {
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
			const { pinned, onTogglePin, onRename, anchor } = params;
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
					runtime.workspaces?.archiveSession?.(params.id)?.catch((error) => {
						console.warn("[dsh-hub] session archive failed:", error);
					});
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
						copyText$1(workspacePath);
					}
				});
			}
			entries.push({
				label: t$1("menu.copyLogPath"),
				run: () => {
					fetchJson(`/api/dsh-hub/session-paths/paths?${new URLSearchParams({ id: params.id })}`).then((d) => {
						if (d?.found === true && typeof d.logPath === "string") copyText$1(d.logPath);
					});
				}
			});
			entries.push({
				label: t$1("menu.copySessionId"),
				run: () => {
					copyText$1(params.id);
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
			const place = () => {
				const rect = menu.getBoundingClientRect();
				const left = Math.min(params.x, window.innerWidth - rect.width - 8);
				const top = Math.min(params.y, window.innerHeight - rect.height - 8);
				menu.style.left = `${Math.max(8, left)}px`;
				menu.style.top = `${Math.max(8, top)}px`;
			};
			place();
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
			const onScroll = (event) => {
				const target = event.target;
				if (anchor !== void 0 && anchor.isConnected) {
					if (target instanceof Node && (target === document || target.contains(anchor))) closeSessionMenu();
					return;
				}
				if (target === document) closeSessionMenu();
			};
			const onResize = () => place();
			window.addEventListener("pointerdown", onOutside, true);
			window.addEventListener("keydown", onKey, true);
			window.addEventListener("resize", onResize);
			window.addEventListener("scroll", onScroll, true);
			activeDisposer = () => {
				menu.remove();
				window.removeEventListener("pointerdown", onOutside, true);
				window.removeEventListener("keydown", onKey, true);
				window.removeEventListener("resize", onResize);
				window.removeEventListener("scroll", onScroll, true);
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
		let activeCleanup$1;
		/** Close the workspace menu if open. */
		function closeWorkspaceMenu() {
			activeCleanup$1?.();
			activeCleanup$1 = void 0;
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
			const { anchor } = params;
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
			const place = () => {
				const rect = menu.getBoundingClientRect();
				menu.style.left = `${Math.max(4, Math.min(params.x, window.innerWidth - rect.width - 4))}px`;
				menu.style.top = `${Math.max(4, Math.min(params.y, window.innerHeight - rect.height - 4))}px`;
			};
			place();
			const onOutside = (event) => {
				if (event.target instanceof Node && menu.contains(event.target)) return;
				closeWorkspaceMenu();
			};
			const onKey = (event) => {
				if (event.key === "Escape") closeWorkspaceMenu();
			};
			const onScroll = (event) => {
				const target = event.target;
				if (anchor !== void 0 && anchor.isConnected) {
					if (target instanceof Node && (target === document || target.contains(anchor))) closeWorkspaceMenu();
					return;
				}
				if (target === document) closeWorkspaceMenu();
			};
			const onResize = () => place();
			window.addEventListener("pointerdown", onOutside, true);
			window.addEventListener("keydown", onKey, true);
			window.addEventListener("resize", onResize);
			window.addEventListener("scroll", onScroll, true);
			activeCleanup$1 = () => {
				window.removeEventListener("pointerdown", onOutside, true);
				window.removeEventListener("keydown", onKey, true);
				window.removeEventListener("resize", onResize);
				window.removeEventListener("scroll", onScroll, true);
				menu.remove();
			};
		}
		//#endregion
		//#region src/client/workspace-drag-guard.ts
		/**
		* Workspace-row drag guard — 官方左侧栏"工作区行拖拽排序"兜底层。
		*
		* 主根因（2026-08-29 定案，docs/关键踩坑记录.md #94）：Tauri 默认
		* dragDropEnabled=true 时，wry 的 DragDropController 在 Windows 上对每个
		* WebView2 子 HWND 执行 RevokeDragDrop + RegisterDragDrop（只认文件 +
		* SetAllowExternalDrop(false)），页内 HTML5 DnD 事件全灭——官方工作区行
		* 拖拽在壳内根本无法发起（同一页面浏览器正常）。该根因已在 Rust 壳修复
		* （window.rs builder 加 `.disable_drag_drop_handler()`；文件拖放的导航
		* 兜底在 shell-init.js）。
		*
		* 本模块因此从"三合一拦截"精简为两个无侵入兜底：
		*
		*  B: watchdog——dragstart 记录源行；若上一次拖拽未正常结束（dragend 被
		*     吞），下一次 dragstart 时向旧源行合成派发 dragend（bubbles）→ 事件
		*     冒泡到 React root → 官方 onDragEnd 执行 → 清空 workspaceDrag，防止
		*     状态卡死跨拖拽持久化。已知副作用：官方 end() 在 over 非空时会按最后
		*     hover 位置补提交一次排序（用户上一次拖拽的意图位置，且只发生在新
		*     dragstart 语境下）——可再拖回，换来的是状态永不跨拖拽卡死。适用场
		*     景：官方 `listTopDropIndicator` 的 flip-OFF 会重建 `div.list`、被拖
		*     行 DOM 被替换，而脱离文档节点的 dragend 不冒泡到 React root（#94③）
		*     ——flip-ON 不重建、flip-OFF 至多丢一次 dragend 且 drop 提交不受影响，
		*     B 让下一次 dragstart 自愈。注意：合成 dragend 只对"源行仍连接"的场
		*     景可达 React（已脱离文档则只在孤立子树内冒泡，那是官方缺陷自身的死
		*     局，B 尽力而为）。
		*  G2: 拖拽期间给 body 加 `mg-drag-active`，CSS 收缩置顶区高度——消除
		*     "拖到顶部须横穿 40vh 无 drop 目标区"的放大因素。
		*
		* 撤销 C（document 捕获阶段拦截首组上半部 dragover）的原因：它会让"拖到
		* 最前"失去官方顶部插入指示线（视觉回退），且 stopPropagation 侵入官方
		* 事件流；而按定案结论它防的只是"每次拖拽至多一次 dragend 丢失"——B 已
		* 在下次 dragstart 自愈，drop 提交本就不受影响，拦截的收益不再值回代价。
		*
		* 结构锚点全部是框架契约（与 pin-conversations 同源），无 CSS-module 哈希。
		*
		* @module dsh-hub/client/workspace-drag-guard
		*/
		/** Body class toggled while a workspace-row drag is in flight（pin-conversations
		* 用它挂起拖拽中的 sync，见 sync() 入口短路）。 */
		const DRAG_ACTIVE_CLASS = "mg-drag-active";
		/** Real-workspace rows only: role=treeitem + aria-expanded + draggable="true"
		* （ungrouped 桶行无 drag props → 无 draggable，天然排除；搜索/扁平模式无此
		* 行 → 守卫自然失效）。 */
		const WORKSPACE_ROW_SELECTOR = "div[role=\"treeitem\"][aria-expanded][draggable=\"true\"]";
		/** G2 stylesheet（一次性注入）。 */
		let styleInjected = false;
		function ensureStyle() {
			if (styleInjected) return;
			styleInjected = true;
			const tag = document.createElement("style");
			tag.id = "dsh-hub-drag-guard";
			tag.textContent = [`.${DRAG_ACTIVE_CLASS} .mg-pin-section{max-height:96px!important;overflow-y:hidden!important;}`].join("\n");
			document.head.appendChild(tag);
		}
		/**
		* Install the workspace-row drag guard. Returns the disposer（HMR /
		* include.refresh 重新安装时清干净）。
		*/
		function installWorkspaceDragGuard() {
			ensureStyle();
			/** In-flight workspace-row drag source（未收到 dragend/drop 前保持）。 */
			let pendingSource = null;
			const finishDrag = () => {
				pendingSource = null;
				document.body.classList.remove(DRAG_ACTIVE_CLASS);
			};
			const onDragStart = (event) => {
				if (pendingSource !== null) {
					const stale = pendingSource;
					try {
						stale.dispatchEvent(new DragEvent("dragend", { bubbles: true }));
					} catch {}
					finishDrag();
				}
				const row = (event.target instanceof Element ? event.target : null)?.closest(WORKSPACE_ROW_SELECTOR) ?? null;
				pendingSource = row;
				if (row !== null) document.body.classList.add(DRAG_ACTIVE_CLASS);
			};
			const onDragEnd = () => {
				finishDrag();
			};
			const onDrop = () => {
				finishDrag();
			};
			document.addEventListener("dragstart", onDragStart, true);
			document.addEventListener("dragend", onDragEnd, true);
			document.addEventListener("drop", onDrop, true);
			return () => {
				document.removeEventListener("dragstart", onDragStart, true);
				document.removeEventListener("dragend", onDragEnd, true);
				document.removeEventListener("drop", onDrop, true);
				pendingSource = null;
				document.body.classList.remove(DRAG_ACTIVE_CLASS);
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
		*    `displayTitle` text appears inside it. Duplicate titles pick the most
		*    recently updated candidate (2026-08-29: several untitled sessions in one
		*    workspace share the cwd basename; skipping the whole group made the
		*    right-click / ⋯ menus vanish once a session started). Renamed sessions
		*    simply stop matching until the row re-renders with the new title — the
		*    pin itself survives (pins are keyed by session id);
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
						headers: authHeaders(),
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
			/** Official session rename RPC — the same channel the titlebar tab rename uses. */
			async function renameSession(id, title) {
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
			/**
			* In-menu rename micro-form after clicking 重命名任务 in the session context
			* menu. The official row ⋯ menu is UNUSABLE in this WebView2 environment
			* (real clicks cannot open it — measured), so its dialog cannot be reached;
			* instead we collect the new title here and call the SAME official
			* session.rename — data-layer identical, so the rename propagates to
			* tree/labels/details like the titlebar rename. Reuses .mg-ctxmenu chrome.
			*/
			function openRenameForm(id, title, x, y) {
				closeSessionMenu();
				injectSessionMenuStyle();
				const menu = document.createElement("div");
				menu.className = "mg-ctxmenu";
				menu.style.left = x + "px";
				menu.style.top = y + "px";
				const head = document.createElement("div");
				head.className = "mg-ctxmenu__head";
				head.textContent = "重命名会话";
				const input = document.createElement("input");
				input.value = title;
				input.spellcheck = false;
				input.setAttribute("aria-label", "重命名会话");
				input.style.cssText = "display:block;width:100%;box-sizing:border-box;margin:2px 0 6px;padding:5px 8px;border:1px solid var(--dsw-alias-border-l2,#333);border-radius:6px;background:var(--dsw-alias-bg-layer-3,#1f1f23);color:var(--dsw-alias-label-primary,#e6e6e6);font:inherit;font-size:13px;outline:none;";
				const status = document.createElement("div");
				status.className = "mg-ctxmenu__head";
				status.style.cssText = "color:var(--dsw-alias-state-error-primary,#e5484d);display:none;";
				const save = document.createElement("div");
				save.className = "mg-ctxmenu__item";
				save.textContent = "保存";
				const cancel = document.createElement("div");
				cancel.className = "mg-ctxmenu__item";
				cancel.textContent = "取消";
				let busy = false;
				const close = () => {
					window.removeEventListener("pointerdown", onOutside, true);
					window.removeEventListener("keydown", onKey, true);
					menu.remove();
				};
				const submit = () => {
					if (busy) return;
					const next = input.value.trim().replace(/\s+/g, " ");
					if (next === "") {
						input.focus();
						return;
					}
					busy = true;
					renameSession(id, next).then((accepted) => {
						if (accepted !== null) {
							close();
							return;
						}
						busy = false;
						status.style.display = "";
						status.textContent = "重命名失败，请重试";
					});
				};
				save.addEventListener("click", submit);
				cancel.addEventListener("click", close);
				input.addEventListener("keydown", (e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						submit();
					} else if (e.key === "Escape") {
						e.preventDefault();
						close();
					}
				});
				const onOutside = (e) => {
					if (e.target instanceof Node && menu.contains(e.target)) return;
					close();
				};
				const onKey = (e) => {
					if (e.key === "Escape") close();
				};
				menu.append(head, input, status, save, cancel);
				document.body.append(menu);
				const rect = menu.getBoundingClientRect();
				menu.style.left = Math.max(4, Math.min(x, window.innerWidth - rect.width - 4)) + "px";
				menu.style.top = Math.max(4, Math.min(y, window.innerHeight - rect.height - 4)) + "px";
				window.addEventListener("pointerdown", onOutside, true);
				window.addEventListener("keydown", onKey, true);
				queueMicrotask(() => {
					input.focus();
					input.select();
				});
			}
			/** Context-menu rename: in-menu rename form on rows; pinned form otherwise. */
			function renameViaMenu(id, row, x, y) {
				if (row === void 0) {
					beginRename(id);
					return;
				}
				const summary = sessionSnapshot()?.byId?.[id];
				openRenameForm(id, summary?.displayTitle !== void 0 ? summary.displayTitle : id, x ?? 0, y ?? 0);
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
			*
			* Performance (2026-09-01 audit P1-12): with hundreds of sessions the
			* un-cached scan calls getComputedStyle per leaf element (forced layout)
			* on every debounced sync. Rows are keyed by DOM identity with a cheap
			* text-fingerprint + child-count check, so unchanged rows skip the
			* getComputedStyle pass entirely; any text/childCount mutation (rename,
			* status dot swap, re-render) invalidates only that row.
			*/
			const rowMatchCache = /* @__PURE__ */ new WeakMap();
			function mapRowByContent(row) {
				let fp = "";
				let count = 0;
				for (const el of Array.from(row.querySelectorAll("span, div"))) {
					count++;
					const text = el.childElementCount === 0 ? el.textContent : void 0;
					if (text !== void 0 && text.trim() !== "") fp += text.trim() + "";
				}
				fp += "#" + count;
				const cached = rowMatchCache.get(row);
				if (cached !== void 0 && cached.fp === fp) return cached.result;
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
					let style = null;
					try {
						style = getComputedStyle(el);
					} catch {}
					if (style === null || style.position === "absolute") continue;
					const fontSize = parseFloat(style.fontSize);
					if (Number.isFinite(fontSize) && fontSize < 13) continue;
					const key = normalizeTitle(text);
					if (key === "") continue;
					const ids = titleToIds.get(key);
					if (ids === void 0 || ids.length === 0) continue;
					let chosen = ids[0];
					if (ids.length > 1) {
						let best = -1;
						for (const id of ids) {
							const at = byId[id]?.updatedAt ?? 0;
							if (at > best) {
								best = at;
								chosen = id;
							}
						}
					}
					if (!candidates.has(chosen)) candidates.set(chosen, {
						id: chosen,
						el,
						title: key
					});
				}
				const entries = [...candidates.values()];
				let result;
				if (entries.length === 1) {
					const entry = entries[0];
					if (!leafTexts.some((t) => t.length > entry.title.length && t.includes(entry.title) && titleToIds.has(t))) result = {
						id: entry.id,
						titleEl: entry.el
					};
				}
				rowMatchCache.set(row, {
					fp,
					result
				});
				return result;
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
							anchor: item,
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
				if (document.body.classList.contains("mg-drag-active")) return;
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
								anchor: wrow,
								ctx: runtime
							});
						} else {
							event.preventDefault();
							event.stopPropagation();
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
					anchor: row,
					pinned: pinnedSet.has(match.id),
					ctx: runtime,
					onTogglePin: () => togglePin(match.id),
					onRename: () => renameViaMenu(match.id, row, event.clientX, event.clientY)
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
					anchor: row,
					pinned: pinnedSet.has(match.id),
					ctx: runtime,
					onTogglePin: () => togglePin(match.id),
					onRename: () => renameViaMenu(match.id, row, event.clientX, event.clientY)
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
		* dsh-hub model selector — replaces the official composer model seat.
		*
		* Module category: client UI component.
		* Responsibility: render the composer model seat (`conversation.input.model`)
		* as TWO adjacent trigger buttons — left opens the provider -> model list,
		* right opens the thinking-effort list (PR #33 layout). Both share one
		* popup menu with three panes (providers / model / effort). The selector
		* uses the shared per-session model directory for every selection, so state
		* stays consistent with the /model command. When a custom model has no
		* reasoning metadata yet, the effort pane can declare the standard levels
		* through the official `llm-pi-ai` settings scope; the host then rebuilds
		* the catalog and the same pane shows the host-validated effort choices.
		*/
		const CSS = [
			"._dshnms_root{min-width:0;position:relative}",
			"._dshnms_triggerRow{display:flex;align-items:center;gap:2px}",
			"._dshnms_trigger{min-width:0;max-width:200px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}",
			"._dshnms_triggerEffort{min-width:0;max-width:120px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}",
			"._dshnms_trigger:hover:not(:disabled),._dshnms_triggerEffort:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			"._dshnms_trigger:focus-visible,._dshnms_triggerEffort:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}",
			"._dshnms_trigger:disabled,._dshnms_triggerEffort:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}",
			"._dshnms_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}",
			"._dshnms_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}",
			"._dshnms_chevronOpen{transform:rotate(180deg)}",
			"html body.mg-dshnms-open [data-composer-seat]{z-index:60}",
			"._dshnms_menu{z-index:2000;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);width:max-content;min-width:min(240px,100vw - 32px);max-height:min(420px,100vh - 96px);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:absolute;bottom:calc(100% + 8px);left:0;overflow:hidden}",
			"._dshnms_menuDual{}",
			"._dshnms_columns{min-height:0;flex:1 1 auto;display:flex;flex-direction:row}",
			"._dshnms_col{min-width:0;min-height:0;flex:0 0 auto;display:flex;flex-direction:column}",
			"._dshnms_colRight{min-width:0;min-height:0;flex:1 1 auto;display:flex;flex-direction:column;border-left:1px solid var(--dsw-alias-border-l2);animation:_dshnms_slideIn .12s ease-out}",
			"@keyframes _dshnms_slideIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}",
			"._dshnms_colActive{background:var(--dsw-alias-interactive-bg-hover)}",
			"._dshnms_chevronLeft{transform:rotate(180deg)}",
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
			"._dshnms_cell{width:100%;color:var(--dsw-alias-label-primary);background:0 0;border:none;border-radius:8px;outline:none;align-items:center;gap:8px;padding:7px 8px;font-size:13px;font-weight:500;line-height:20px;text-align:left;display:flex;cursor:pointer}",
			"._dshnms_cell:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			"._dshnms_cell:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}",
			"._dshnms_cellLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 auto}",
			"._dshnms_cellValue{color:var(--dsw-alias-label-caption);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:none;max-width:140px}",
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
			tag.textContent = CSS;
			document.head.appendChild(tag);
		}
		const c = {
			root: "_dshnms_root",
			triggerRow: "_dshnms_triggerRow",
			trigger: "_dshnms_trigger",
			triggerEffort: "_dshnms_triggerEffort",
			triggerLabel: "_dshnms_triggerLabel",
			chevron: "_dshnms_chevron",
			chevronOpen: "_dshnms_chevronOpen",
			chevronLeft: "_dshnms_chevronLeft",
			menu: "_dshnms_menu",
			menuDual: "_dshnms_menuDual",
			columns: "_dshnms_columns",
			col: "_dshnms_col",
			colRight: "_dshnms_colRight",
			colActive: "_dshnms_colActive",
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
		const zh = {
			"trigger.fallback": "选择模型",
			"trigger.selectAria": "选择模型",
			"trigger.aria": "选择模型：{model}",
			"trigger.ariaEffort": "选择模型：{model}，思考强度：{effort}",
			"menu.aria": "模型与思考强度",
			"menu.model": "模型",
			"menu.effort": "思考强度",
			"menu.back": "返回",
			"menu.providers": "供应商",
			"menu.models": "{name} · 选择模型",
			"effort.providerDefault": "默认",
			"status.loading": "正在刷新模型列表…",
			"error.action": "模型操作失败：{message}",
			"error.rejected": "选择被拒绝",
			"action.reload": "重新加载",
			"warning.groupLoad": "{name} 加载失败：{message}",
			"empty.providers": "没有可用的供应商。",
			"empty.models": "没有可用模型。",
			"empty.efforts": "当前模型未提供思考强度。",
			"config.efforts": "为此自定义模型启用标准思考强度",
			"config.busy": "正在启用…",
			"config.failed": "无法声明思考强度，请检查模型配置。"
		};
		const en = {
			"trigger.fallback": "Select model",
			"trigger.selectAria": "Select model",
			"trigger.aria": "Select model: {model}",
			"trigger.ariaEffort": "Select model: {model}, reasoning effort: {effort}",
			"menu.aria": "Model and reasoning effort",
			"menu.model": "Model",
			"menu.effort": "Reasoning effort",
			"menu.back": "Back",
			"menu.providers": "Providers",
			"menu.models": "{name} · Select model",
			"effort.providerDefault": "Default",
			"status.loading": "Refreshing model list…",
			"error.action": "Model action failed: {message}",
			"error.rejected": "Selection rejected",
			"action.reload": "Reload",
			"warning.groupLoad": "{name} failed to load: {message}",
			"empty.providers": "No providers available.",
			"empty.models": "No models available.",
			"empty.efforts": "This model does not provide reasoning efforts.",
			"config.efforts": "Enable standard efforts for this custom model",
			"config.busy": "Enabling…",
			"config.failed": "Unable to declare reasoning efforts; check the model configuration."
		};
		function t(key, params) {
			let value = ((document.documentElement.getAttribute("lang") || "").startsWith("zh") ? zh : en)[key] ?? key;
			if (params) value = value.replace(/\{([^}]+)\}/g, (_, k) => params[k] ?? "");
			return value;
		}
		/** Standard effort declarations used by the inline custom-model action. */
		const STANDARD_EFFORTS = {
			off: null,
			minimal: "minimal",
			low: "low",
			medium: "medium",
			high: "high",
			xhigh: "xhigh",
			max: "max"
		};
		/**
		* Crash-safe directory stub. If the inject factory throws (e.g.
		* directoryFor(subagentAddress) fails for a session), returning this
		* degraded face keeps the seat rendering instead of being abdicated by the
		* renderer's error boundary (which would hand the seat back to the official
		* component). The stable snapshot reference keeps useSyncExternalStore from
		* re-rendering forever.
		*/
		const STUB_DIRECTORY_SNAPSHOT = {
			current: null,
			groups: [],
			failures: [],
			status: "idle",
			error: null
		};
		const STUB_DIRECTORY = {
			subscribe: () => () => {},
			getSnapshot: () => STUB_DIRECTORY_SNAPSHOT
		};
		/** Diagnostic uplink to dsh.log. The desktop shell's Folder log target does
		* NOT capture browser console.log, so seat registration and lift events are
		* reported through the same diag_report channel pins/session-focus use —
		* this is the only page-side signal that lands in dsh.log. */
		function report(msg) {
			try {
				window.__TAURI_INTERNALS__?.invoke?.("diag_report", { msg }).catch?.(() => {});
			} catch {}
		}
		/** Error boundary that reports render crashes to dsh.log, then lets the
		* error propagate so the slot renderer's own boundary abdicates (official
		* seat takes over) — but now we know exactly why. */
		var ModelSelectErrorBoundary = class extends react.Component {
			state = { error: null };
			static getDerivedStateFromError(error) {
				return { error };
			}
			componentDidCatch(error) {
				try {
					window.__TAURI_INTERNALS__?.invoke?.("diag_report", { msg: "model-select:render-crash:" + String(error?.message ?? error) }).catch?.(() => {});
				} catch {}
			}
			render() {
				return this.props.children;
			}
		};
		function ModelSelectNested({ locked, available, directory, load, select, configureEfforts }) {
			const state = (0, react.useSyncExternalStore)((fn) => directory.subscribe(fn), () => directory.getSnapshot());
			const [open, setOpen] = (0, react.useState)(false);
			const [pane, setPane] = (0, react.useState)("providers");
			const [activeGroup, setActiveGroup] = (0, react.useState)(null);
			const [toast, setToast] = (0, react.useState)(null);
			const [configuring, setConfiguring] = (0, react.useState)(false);
			const [menuAlign, setMenuAlign] = (0, react.useState)(null);
			const menuRef = (0, react.useRef)(null);
			const toastSeq = (0, react.useRef)(0);
			const lastActionRef = (0, react.useRef)("load");
			const epochRef = (0, react.useRef)(0);
			const lastOpenedRef = (0, react.useRef)("providers");
			const rootRef = (0, react.useRef)(null);
			const modelTriggerRef = (0, react.useRef)(null);
			const effortTriggerRef = (0, react.useRef)(null);
			const leftItemRefs = (0, react.useRef)([]);
			const rightItemRefs = (0, react.useRef)([]);
			const providerRefs = (0, react.useRef)([]);
			const id = (0, react.useId)();
			const choices = (0, react.useMemo)(() => state.groups.flatMap((group) => group.models.map((model) => ({
				group,
				model,
				selection: {
					provider: group.id,
					model: model.id,
					...model.reasoning?.defaultEffort === void 0 ? {} : { reasoningEffort: model.reasoning.defaultEffort }
				}
			}))), [state.groups]);
			const currentChoice = choices[state.current === null ? -1 : choices.findIndex((choice) => choice.selection.provider === state.current?.provider && choice.selection.model === state.current.model)];
			const reasoning = currentChoice?.model.reasoning;
			const effectiveEffort = state.current?.reasoningEffort ?? reasoning?.defaultEffort;
			const effortLabel = effectiveEffort === void 0 ? t("effort.providerDefault") : reasoning?.efforts.find((level) => level.id === effectiveEffort)?.name ?? effectiveEffort;
			const effortChoices = (0, react.useMemo)(() => reasoning === void 0 ? [{
				key: "provider-default",
				effort: void 0,
				label: t("effort.providerDefault")
			}] : [...reasoning.defaultEffort === void 0 ? [{
				key: "provider-default",
				effort: void 0,
				label: t("effort.providerDefault")
			}] : [], ...reasoning.efforts.map((level) => ({
				key: `effort:${level.id}`,
				effort: level.id,
				label: level.name,
				...level.description === void 0 ? {} : { description: level.description }
			}))], [reasoning]);
			const busy = state.status === "selecting" || state.status === "loading" || configuring;
			const reload = (0, react.useCallback)(() => {
				lastActionRef.current = "load";
				load();
			}, [load]);
			(0, react.useEffect)(() => {
				const seat = document.querySelector("[data-composer-seat]");
				if (open) {
					document.body.classList.add("mg-dshnms-open");
					if (seat !== null) seat.style.zIndex = "60";
					report("model-select:seat-lift:on");
				} else {
					document.body.classList.remove("mg-dshnms-open");
					if (seat !== null) seat.style.zIndex = "";
					report("model-select:seat-lift:off");
				}
				if (!open) return;
				const closeOutside = (event) => {
					if (!rootRef.current?.contains(event.target)) setOpen(false);
				};
				document.addEventListener("mousedown", closeOutside);
				return () => {
					document.body.classList.remove("mg-dshnms-open");
					const seatCleanup = document.querySelector("[data-composer-seat]");
					if (seatCleanup !== null) seatCleanup.style.zIndex = "";
					document.removeEventListener("mousedown", closeOutside);
				};
			}, [open]);
			(0, react.useLayoutEffect)(() => {
				if (!open || menuAlign === null) return;
				const menu = menuRef.current;
				const root = rootRef.current;
				const trigger = (lastOpenedRef.current === "effort" ? effortTriggerRef : modelTriggerRef).current;
				if (menu === null || root === null || trigger === null) return;
				const menuW = menu.offsetWidth;
				const triggerCenter = trigger.offsetLeft + trigger.offsetWidth / 2;
				const idealRight = Math.round(root.offsetWidth - triggerCenter - menuW / 2);
				const clamped = Math.max(0, Math.min(idealRight, root.offsetWidth - menuW));
				setMenuAlign((prev) => {
					if (prev === null) return prev;
					return prev.right === clamped ? prev : { right: clamped };
				});
			}, [
				open,
				menuAlign,
				pane,
				activeGroup
			]);
			if (!available) return null;
			const showProviders = () => {
				epochRef.current += 1;
				lastOpenedRef.current = "providers";
				setPane("providers");
				setActiveGroup(null);
				setOpen(true);
				positionMenu();
				if (state.status !== "loading") reload();
			};
			const showEffort = () => {
				epochRef.current += 1;
				lastOpenedRef.current = "effort";
				setPane("effort");
				setOpen(true);
				positionMenu();
				if (state.status !== "loading") reload();
			};
			const positionMenu = () => {
				const root = rootRef.current;
				const trigger = (lastOpenedRef.current === "effort" ? effortTriggerRef : modelTriggerRef).current;
				if (root === null || trigger === null) return;
				const right = Math.max(0, root.offsetWidth - (trigger.offsetLeft + trigger.offsetWidth));
				setMenuAlign({ right });
			};
			const close = (restoreFocus = false) => {
				epochRef.current += 1;
				setOpen(false);
				setPane("providers");
				setActiveGroup(null);
				setMenuAlign(null);
				if (restoreFocus) queueMicrotask(() => {
					(lastOpenedRef.current === "effort" ? effortTriggerRef : modelTriggerRef).current?.focus();
				});
			};
			const goBack = () => {
				if (pane === "model") {
					collapseModels();
					return;
				}
				if (pane === "effort") {
					setPane("providers");
					return;
				}
				if (pane === "providers") close(true);
			};
			const moveFocus = (offset, refs) => {
				const items = refs.filter((item) => item !== null);
				if (items.length === 0) return;
				const active = items.findIndex((item) => item === document.activeElement);
				items[(Math.max(active, 0) + offset + items.length) % items.length]?.focus();
			};
			const onRootKeyDown = (event) => {
				if (!open) return;
				if (event.key === "Escape") {
					event.preventDefault();
					goBack();
					return;
				}
				if (event.key === "ArrowDown" || event.key === "ArrowUp") {
					event.preventDefault();
					const inRight = pane === "model" && rightItemRefs.current.some((item) => item === document.activeElement);
					moveFocus(event.key === "ArrowDown" ? 1 : -1, inRight ? rightItemRefs.current : leftItemRefs.current);
					return;
				}
				if (event.key === "ArrowRight") {
					event.preventDefault();
					if (pane === "providers") {
						const hit = providerRefs.current.find((p) => p.node === document.activeElement);
						if (hit !== void 0) openModels(hit.groupId);
					} else if (pane === "model") rightItemRefs.current[0]?.focus();
					return;
				}
				if (event.key === "ArrowLeft") {
					event.preventDefault();
					if (pane === "model") collapseModels();
					else if (pane === "providers") close(true);
				}
			};
			const onBlur = (event) => {
				if (event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget)) return;
				close();
			};
			const settleSelection = (accepted) => {
				if (accepted) {
					if (rootRef.current !== null) close(true);
					return;
				}
				toastSeq.current += 1;
				setToast({
					seq: toastSeq.current,
					text: t("error.action", { message: directory.getSnapshot().error ?? t("error.rejected") })
				});
			};
			const choose = (selection) => {
				if (state.current?.provider === selection.provider && state.current.model === selection.model) {
					close(true);
					return;
				}
				const epoch = epochRef.current;
				lastActionRef.current = "select";
				select(selection).then((ok) => {
					if (epochRef.current === epoch) settleSelection(ok);
				}, () => {
					if (epochRef.current === epoch) settleSelection(false);
				});
			};
			const chooseEffort = (effort) => {
				if (state.current === null || effectiveEffort === effort) {
					close(true);
					return;
				}
				const epoch = epochRef.current;
				lastActionRef.current = "select";
				select({
					provider: state.current.provider,
					model: state.current.model,
					...effort === void 0 ? {} : { reasoningEffort: effort }
				}).then((ok) => {
					if (epochRef.current === epoch) settleSelection(ok);
				}, () => {
					if (epochRef.current === epoch) settleSelection(false);
				});
			};
			const configure = () => {
				if (!configureEfforts || state.current === null || configuring) return;
				const epoch = epochRef.current;
				setConfiguring(true);
				configureEfforts({
					provider: state.current.provider,
					model: state.current.model
				}).then((ok) => {
					if (epochRef.current !== epoch) return;
					if (ok === true) {
						load();
						return;
					}
					if (ok === false) {
						toastSeq.current += 1;
						setToast({
							seq: toastSeq.current,
							text: t("config.failed")
						});
					}
				}, () => {
					if (epochRef.current !== epoch) return;
					toastSeq.current += 1;
					setToast({
						seq: toastSeq.current,
						text: t("config.failed")
					});
				}).finally(() => {
					if (epochRef.current === epoch) setConfiguring(false);
				});
			};
			const modelLabel = currentChoice ? currentChoice.model.name : t("trigger.fallback");
			leftItemRefs.current = [];
			rightItemRefs.current = [];
			providerRefs.current = [];
			let leftIndex = 0;
			let rightIndex = 0;
			const leftRef = () => {
				const at = leftIndex++;
				return (node) => {
					leftItemRefs.current[at] = node;
				};
			};
			const rightRef = () => {
				const at = rightIndex++;
				return (node) => {
					rightItemRefs.current[at] = node;
				};
			};
			const providerCellRef = (groupId) => {
				const at = leftIndex++;
				return (node) => {
					leftItemRefs.current[at] = node;
					if (node !== null) providerRefs.current.push({
						node,
						groupId
					});
				};
			};
			const activeGroupObj = activeGroup === null ? void 0 : state.groups.find((g) => g.id === activeGroup);
			const openModels = (groupId) => {
				setActiveGroup(groupId);
				setPane("model");
				queueMicrotask(() => {
					rightItemRefs.current[0]?.focus();
				});
			};
			const switchGroup = (groupId) => {
				setActiveGroup(groupId);
				queueMicrotask(() => {
					rightItemRefs.current[0]?.focus();
				});
			};
			const collapseModels = () => {
				const g = activeGroup;
				setPane("providers");
				setActiveGroup(null);
				if (g !== null) queueMicrotask(() => {
					providerRefs.current.find((p) => p.groupId === g)?.node.focus();
				});
			};
			const statusBlock = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				state.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: c.status,
					children: t("status.loading")
				}),
				state.error !== null && lastActionRef.current === "load" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
				})
			] });
			const providersPane = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [statusBlock, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: clsx(c.groups, "scrollable"),
				children: state.groups.map((group) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					ref: providerCellRef(group.id),
					type: "button",
					role: "menuitem",
					className: c.cell,
					onClick: () => openModels(group.id),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: c.cellLabel,
						children: group.name
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { className: c.cellChevron })]
				}, group.id))
			})] });
			const modelPane = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: c.columns,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: c.col,
					role: "group",
					"aria-label": t("menu.providers"),
					children: [statusBlock, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: clsx(c.groups, "scrollable"),
						children: state.groups.map((group) => {
							const active = activeGroup === group.id;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								ref: providerCellRef(group.id),
								type: "button",
								role: "menuitem",
								"aria-expanded": active,
								className: clsx(c.cell, active && c.colActive),
								onClick: () => {
									if (active) {
										collapseModels();
										return;
									}
									if (pane === "model") {
										switchGroup(group.id);
										return;
									}
									openModels(group.id);
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: c.cellLabel,
									children: group.name
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { className: clsx(c.cellChevron, active && c.chevronLeft) })]
							}, group.id);
						})
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: clsx(c.col, c.colRight),
					role: "group",
					"aria-label": t("menu.model"),
					children: [
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
								const selected = state.current?.provider === activeGroupObj.id && state.current.model === model.id;
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									ref: rightRef(),
									type: "button",
									role: "menuitemradio",
									"aria-checked": selected,
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
										children: selected ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {}) : null
									})]
								}, model.id);
							})
						}),
						activeGroupObj !== void 0 && activeGroupObj.models.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: c.empty,
							children: t("empty.models")
						})
					]
				})]
			});
			const effortPane = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				reasoning === void 0 && configureEfforts !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					ref: leftRef(),
					type: "button",
					role: "menuitem",
					className: c.cell,
					disabled: busy,
					onClick: configure,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: c.cellLabel,
						children: configuring ? t("config.busy") : t("config.efforts")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { className: c.cellChevron })]
				}),
				reasoning !== void 0 && state.error !== null && lastActionRef.current === "load" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: c.error,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("error.action", { message: state.error }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: c.retry,
						onClick: reload,
						children: t("action.reload")
					})]
				}),
				effortChoices.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: c.empty,
					children: t("empty.efforts")
				}) : effortChoices.map((level) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					ref: leftRef(),
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
						children: effectiveEffort === level.effort ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {}) : null
					})]
				}, level.key))
			] });
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
							"aria-expanded": open && (pane === "providers" || pane === "model"),
							"aria-controls": open ? `${id}-menu` : void 0,
							title: modelLabel,
							disabled: locked,
							onClick: () => {
								if (open && (pane === "providers" || pane === "model")) close();
								else showProviders();
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: c.triggerLabel,
								children: modelLabel
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: clsx(c.chevron, open && (pane === "providers" || pane === "model") && c.chevronOpen) })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							ref: effortTriggerRef,
							type: "button",
							className: c.triggerEffort,
							"aria-label": t("menu.effort"),
							"aria-haspopup": "menu",
							"aria-expanded": open && pane === "effort",
							"aria-controls": open ? `${id}-menu` : void 0,
							title: effortLabel,
							disabled: locked,
							onClick: () => {
								if (open && pane === "effort") close();
								else showEffort();
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: c.triggerLabel,
								children: effortLabel
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: clsx(c.chevron, open && pane === "effort" && c.chevronOpen) })]
						})]
					}),
					open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						ref: menuRef,
						id: `${id}-menu`,
						className: clsx(c.menu, pane === "model" && c.menuDual),
						role: "menu",
						"aria-label": t("menu.aria"),
						"aria-busy": state.status === "loading" || busy,
						style: menuAlign === null ? void 0 : {
							left: "auto",
							right: menuAlign.right
						},
						children: [
							pane === "providers" && providersPane,
							pane === "model" && modelPane,
							pane === "effort" && effortPane
						]
					}),
					toast !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
						text: toast.text,
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
						anchor: rootRef.current?.closest("[data-composer-card]") ?? null,
						onDone: () => setToast(null)
					}, toast.seq)
				]
			});
		}
		/**
		* Declare the standard effort levels for a custom model through the official
		* llm-pi-ai settings namespace. The snapshot value is the schema-resolved
		* section: an absent `models` key materializes as `[]`, so the whole-array
		* write covers both pure-catalog routes and already-declared routes.
		* modelOverrides is NEVER written — the official resolveRouteModels refuses
		* it for any model the installed catalog does not describe, which is exactly
		* the custom-model case this action exists for. Success is judged by reading
		* the declared value back (mutate never throws on rejection; it recovers and
		* resolves, so the read-back is the only reliable failure signal).
		* @returns true = declared; false = write failed; undefined = not applicable
		* (scope unavailable / not writable / catalog-served route with no declared
		* models — the caller stays silent instead of showing a failure toast).
		*/
		async function declareStandardEfforts(scope, selection) {
			if (scope === void 0) return void 0;
			const before = scope.getSnapshot();
			if (before.status !== "ready" || before.revision === void 0) return void 0;
			if (before.writable !== true) return void 0;
			const provider = before.value?.providers?.[selection.provider];
			if (provider === void 0) return void 0;
			const models = Array.isArray(provider.models) ? provider.models : [];
			if (models.length === 0) return void 0;
			const efforts = { ...STANDARD_EFFORTS };
			const ops = [{
				op: "set",
				path: [
					"providers",
					selection.provider,
					"models"
				],
				value: models.map((model) => model.id === selection.model ? {
					...model,
					reasoningEfforts: efforts
				} : model)
			}];
			await scope.mutate(ops, before.revision);
			const after = scope.getSnapshot();
			if (after.status !== "ready") return false;
			const p = after.value?.providers?.[selection.provider];
			return (Array.isArray(p?.models) ? p.models.find((m) => m.id === selection.model)?.reasoningEfforts : void 0) !== void 0;
		}
		/** Register the model selector in the official composer seat. */
		function installModelSelect(ctx) {
			const sessions = ctx.get("sessions");
			if (sessions === void 0) {
				console.warn("[dsh-hub] model-select skipped: sessions service unavailable");
				report("model-select:skipped:sessions");
				return;
			}
			ctx.inject(["slots", "modelDirectories"], (scope) => {
				const slots = scope.get("slots");
				const models = scope.get("modelDirectories");
				if (slots === void 0 || models === void 0) {
					console.warn("[dsh-hub] model-select skipped: slots/modelDirectories unavailable");
					report("model-select:skipped:slots-or-modelDirectories");
					return;
				}
				let effortsScope;
				let binderFetched = false;
				const obtainEffortsScope = () => {
					if (binderFetched) return effortsScope;
					binderFetched = true;
					const binder = scope.get("settingsScope");
					if (binder !== void 0) effortsScope = binder.bind({ namespace: "llm-pi-ai" });
					return effortsScope;
				};
				slots.inject("conversation.input.model", () => slots.register({
					name: "conversation.input.model",
					priority: -1,
					inject: (sessionId) => {
						let directory = STUB_DIRECTORY;
						let available = true;
						try {
							directory = models.directoryFor(sessionId).store;
							available = sessions.subagentAddress(sessionId) === void 0;
						} catch (error) {
							try {
								window.__TAURI_INTERNALS__?.invoke?.("diag_report", { msg: "model-select:inject-crash:" + String(error instanceof Error ? error.message : error) }).catch?.(() => {});
							} catch {}
						}
						return {
							available,
							directory,
							load: () => {
								if (available) try {
									models.directoryFor(sessionId).load().catch(() => {});
								} catch {}
							},
							select: (selection) => available ? models.directoryFor(sessionId).select(selection).then(() => true, () => false) : Promise.resolve(false),
							configureEfforts: (selection) => declareStandardEfforts(obtainEffortsScope(), selection)
						};
					}
				}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelSelectErrorBoundary, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelSelectNested, { ...props }) })));
				console.log("[dsh-hub] model-select override installed");
				report("model-select:installed");
			});
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
			WebkitAppRegion: "drag"
		};
		const TAB = {
			display: "inline-flex",
			alignItems: "center",
			gap: 5,
			padding: "0 8px",
			borderRadius: 6,
			cursor: "pointer",
			background: "color-mix(in srgb, var(--dsw-alias-bg-layer-3, #2a2f3a) 30%, transparent)",
			border: "none",
			color: "var(--dsw-alias-label-tertiary, #9aa7bd)",
			whiteSpace: "nowrap",
			WebkitAppRegion: "no-drag",
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
			background: "color-mix(in srgb, var(--dsw-alias-brand-primary, #3964fe) 22%, var(--dsw-alias-bg-layer-3, #e6e8eb))",
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
			height: "100%",
			WebkitAppRegion: "no-drag"
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
			boxSizing: "border-box",
			WebkitAppRegion: "no-drag"
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
				const tabEl = e.currentTarget;
				openSessionMenu({
					x: e.clientX,
					y: e.clientY,
					id,
					title: byId[id]?.displayTitle ?? byId[id]?.title ?? id,
					anchor: tabEl,
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
		//#region src/client/context-menu.ts
		/**
		* Reusable context menu builder — shared DOM-based right-click menus for
		* the dsh-hub shell. Uses `.mg-ctxmenu` style classes from session-menu-style.ts
		* for visual consistency with session/workspace menus.
		*
		* Module category: Client (pure DOM helper, no side effects on import).
		*
		* @module dsh-hub/client/context-menu
		*/
		let activeCleanup = null;
		/** Close the context menu if open. */
		function closeContextMenu() {
			activeCleanup?.();
			activeCleanup = null;
		}
		/**
		* Show a context menu at the given viewport coordinates.
		* Closes any open session/workspace/context menu first (mutual exclusion).
		* Returns a close function; the menu also closes on outside click, Escape,
		* or scroll.
		*
		* @param x - viewport X coordinate.
		* @param y - viewport Y coordinate.
		* @param slots - array of menu entries and separators.
		* @returns close function to programmatically dismiss the menu.
		*/
		function showContextMenu(x, y, slots) {
			injectSessionMenuStyle();
			closeSessionMenu();
			closeWorkspaceMenu();
			closeContextMenu();
			const el = document.createElement("div");
			el.className = "mg-ctxmenu";
			el.setAttribute("role", "menu");
			for (const slot of slots) {
				if (slot === "|") {
					const sep = document.createElement("div");
					sep.className = "mg-ctxmenu__sep";
					el.appendChild(sep);
					continue;
				}
				const btn = document.createElement("button");
				btn.className = "mg-ctxmenu__item";
				if (slot.danger) btn.classList.add("mg-ctxmenu__danger");
				btn.setAttribute("role", "menuitem");
				if (slot.action === void 0) btn.setAttribute("disabled", "");
				const labelSpan = document.createElement("span");
				labelSpan.textContent = slot.label;
				btn.appendChild(labelSpan);
				if (slot.shortcut !== void 0 && slot.shortcut !== "") {
					const shortcutSpan = document.createElement("span");
					shortcutSpan.style.cssText = "margin-left:auto;opacity:.5;font-size:11px";
					shortcutSpan.textContent = slot.shortcut;
					btn.appendChild(shortcutSpan);
				}
				if (slot.action !== void 0) btn.addEventListener("click", () => {
					closeContextMenu();
					slot.action();
				});
				el.appendChild(btn);
			}
			document.body.appendChild(el);
			const rect = el.getBoundingClientRect();
			el.style.left = Math.max(4, Math.min(x, window.innerWidth - rect.width - 4)) + "px";
			el.style.top = Math.max(4, Math.min(y, window.innerHeight - rect.height - 4)) + "px";
			el.addEventListener("mousedown", (e) => {
				e.preventDefault();
			});
			const onOutside = (e) => {
				if (el.contains(e.target)) return;
				closeContextMenu();
			};
			const onKey = (e) => {
				if (e.key === "Escape") closeContextMenu();
			};
			const onDismiss = () => {
				closeContextMenu();
			};
			window.addEventListener("pointerdown", onOutside, true);
			window.addEventListener("keydown", onKey, true);
			window.addEventListener("scroll", onDismiss, true);
			window.addEventListener("resize", onDismiss);
			activeCleanup = () => {
				window.removeEventListener("pointerdown", onOutside, true);
				window.removeEventListener("keydown", onKey, true);
				window.removeEventListener("scroll", onDismiss, true);
				window.removeEventListener("resize", onDismiss);
				el.remove();
			};
			return closeContextMenu;
		}
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
		/** Build a "copy selected text" context menu for conversation text selection. */
		function buildSelectionMenu(selectedText) {
			return [
				{
					label: t$1("menu.copy"),
					action: () => {
						copyText(selectedText);
					}
				},
				"|",
				{
					label: t$1("menu.addToTask"),
					action: () => {
						copyText(selectedText);
					}
				},
				{
					label: t$1("menu.askInNewSession"),
					action: () => {
						copyText(selectedText);
					}
				}
			];
		}
		/** Build a standard text-edit context menu for input/textarea/contenteditable. */
		function buildEditMenu(target) {
			const exec = (cmd) => {
				document.execCommand(cmd);
			};
			const readClipboard = async () => {
				try {
					const text = await navigator.clipboard.readText();
					document.execCommand("insertText", false, text);
				} catch {}
			};
			return [
				{
					label: t$1("menu.undo"),
					shortcut: "Ctrl+Z",
					action: () => exec("undo")
				},
				{
					label: t$1("menu.redo"),
					shortcut: "Ctrl+Y",
					action: () => exec("redo")
				},
				"|",
				{
					label: t$1("menu.cut"),
					shortcut: "Ctrl+X",
					action: () => exec("cut")
				},
				{
					label: t$1("menu.copy"),
					shortcut: "Ctrl+C",
					action: () => exec("copy")
				},
				{
					label: t$1("menu.paste"),
					shortcut: "Ctrl+V",
					action: () => {
						readClipboard();
					}
				},
				{
					label: t$1("menu.delete"),
					shortcut: "Del",
					action: () => exec("delete")
				},
				"|",
				{
					label: t$1("menu.selectAll"),
					shortcut: "Ctrl+A",
					action: () => exec("selectAll")
				}
			];
		}
		/** Build a link context menu for <a> elements with http(s) href. */
		function buildLinkMenu(href) {
			return [{
				label: t$1("menu.openInBrowser"),
				action: () => {
					try {
						window.__TAURI_INTERNALS__?.invoke?.("open_url", { url: href }).catch?.(() => {});
					} catch {}
				}
			}, {
				label: t$1("menu.copyLink"),
				action: () => {
					copyText(href);
				}
			}];
		}
		//#endregion
		//#region src/client/link-handler.ts
		/**
		* External link click handler — intercepts clicks on <a> elements with
		* http(s) href and opens them in the default browser via the Tauri
		* `open_url` command, preventing WebView2 navigation.
		*
		* Module category: Client (event handler, installed via ctx.effect).
		*
		* @module dsh-hub/client/link-handler
		*/
		/** Tauri IPC bridge shorthand. */
		function tauriInvoke(command, args) {
			try {
				window.__TAURI_INTERNALS__?.invoke?.(command, args).catch?.(() => {});
			} catch {}
		}
		/** Check if an element is inside a context menu (should not intercept). */
		function isInsideMenu(el) {
			return el.closest(".mg-ctxmenu") !== null;
		}
		/**
		* Handle a click event: if the target is an <a> with an http(s) href,
		* open it in the default browser and prevent WebView2 navigation.
		*/
		function onClick(event) {
			const target = event.target;
			if (!(target instanceof Element)) return;
			const anchor = target.closest("a[href]");
			if (anchor === null) return;
			if (isInsideMenu(anchor)) return;
			const href = anchor.getAttribute("href") ?? "";
			if (!href.startsWith("http://") && !href.startsWith("https://")) return;
			event.preventDefault();
			event.stopPropagation();
			tauriInvoke("open_url", { url: href });
		}
		/**
		* Install the link click handler on the document.
		* Returns an uninstall function for cleanup.
		*/
		function installLinkHandler() {
			document.addEventListener("click", onClick, true);
			return () => {
				document.removeEventListener("click", onClick, true);
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
		* dsh-pet): declare the slot shapes, then register the current settings
		* section contribution and composer model seat through `slots.inject`.
		*
		* @module dsh-hub/client
		*/
		window.__mgShellReady = true;
		/**
		* Required services: slots (card), workspaces + sessions (tray + sidebar data),
		* modelDirectories (composer model-seat override), remote + remote.session
		* (the model directory's wire face — ModelDirectoryResolver reads
		* `this.ctx.remote.session` when directoryFor() runs, and cordis binds that
		* read to the CALLER fiber's context, resolving through the parent chain;
		* the official ui-model-selection declares the same pair at top level).
		* modelDirectories is provided by ui-model-selection, an unconditional
		* web-app bundle row (web-app/cordis.patch.yml:282), so the web profile
		* always has it; the top-level declaration guarantees installModelSelect
		* runs only after the service is live (cordis PENDING-until-provided +
		* notify-on-activate). The scoped ctx.inject inside installModelSelect stays
		* as the fault-isolation layer: a child fiber pending never trips the boot
		* audit (boot.ts assertEntriesActive only inspects entry fibers).
		*/
		const inject = [
			"slots",
			"workspaces",
			"sessions",
			"modelDirectories",
			"remote",
			"remote.session"
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
			injectChatVisibilityStyle();
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
				slots.inject("settings.section", function* () {
					yield slots.register({
						name: "settings.section",
						id: "dsh-hub",
						order: 25,
						label: () => t$1("settings.title"),
						inject: () => ({})
					}, (props) => DesktopSettingsCard(props));
				});
			} catch (error) {
				console.warn("[dsh-hub] settings section injection failed:", error);
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
				ctx.effect(() => {
					const onContext = (event) => {
						const target = event.target;
						if (!(target instanceof Element)) return;
						if (target.closest("div[role=\"treeitem\"]")) return;
						if (target.closest("textarea, input, select, [contenteditable=\"true\"]")) {
							event.preventDefault();
							event.stopPropagation();
							showContextMenu(event.clientX, event.clientY, buildEditMenu(target));
							return;
						}
						const anchor = target.closest("a[href]");
						if (anchor !== null) {
							const href = anchor.getAttribute("href") ?? "";
							if (href.startsWith("http://") || href.startsWith("https://")) {
								event.preventDefault();
								event.stopPropagation();
								showContextMenu(event.clientX, event.clientY, buildLinkMenu(href));
								return;
							}
						}
						const selection = window.getSelection();
						if (selection !== null && selection.type !== "Collapsed" && selection.toString().trim() !== "") {
							event.preventDefault();
							event.stopPropagation();
							showContextMenu(event.clientX, event.clientY, buildSelectionMenu(selection.toString()));
							return;
						}
						event.preventDefault();
						closeContextMenu();
						showContextMenu(event.clientX, event.clientY, [{
							label: t$1("menu.refresh"),
							action: () => {
								location.reload();
							}
						}]);
					};
					document.addEventListener("contextmenu", onContext);
					return () => {
						document.removeEventListener("contextmenu", onContext);
						closeContextMenu();
					};
				}, "dsh-hub: context menu");
			} catch (error) {
				console.warn("[dsh-hub] context menu install failed:", error);
			}
			try {
				ctx.effect(() => {
					return installLinkHandler();
				}, "dsh-hub: link handler");
			} catch (error) {
				console.warn("[dsh-hub] link handler install failed:", error);
			}
			try {
				ctx.effect(() => installWorkspaceDragGuard(), "dsh-hub: workspace drag guard");
			} catch (error) {
				console.warn("[dsh-hub] workspace drag guard install failed:", error);
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