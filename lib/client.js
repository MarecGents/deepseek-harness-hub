window.__ModuleLoader__.load({
	id: "mg-dsh-desktop",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
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
		* The card mirrors the official PluginCard look (ui-settings-plugins): a
		* collapsible header (name + description + chevron), then the controls body
		* with a save/discard footer. Interactions: header hover/active background,
		* focus rings in the brand color with a soft halo, control hover borders,
		* disabled dimming, a pulse loading skeleton, and a save feedback state
		* machine (saving → saved fade → failed).
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
			control: "mg-card-control",
			input: "mg-card-input",
			select: "mg-card-select",
			checkboxRow: "mg-card-checkbox-row",
			hint: "mg-card-hint",
			footer: "mg-card-footer",
			discard: "mg-card-discard",
			save: "mg-card-save",
			saving: "mg-card-saving",
			failed: "mg-card-failed",
			saved: "mg-card-saved",
			loading: "mg-card-loading"
		};
		const css = CARD_CSS_CLASSES;
		/** The stylesheet text (brand token fallbacks mirror the SPA boot page). */
		const STYLE_TEXT = `
.${css.card} {
  list-style: none;
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-3, #ffffff);
  overflow: hidden;
}
.${css.header} {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.${css.header}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)); }
.${css.header}:active { background: var(--dsw-alias-interactive-bg-active, rgb(0 0 0 / 6%)); }
.${css.header}:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #3964fe); outline-offset: -2px; }
.${css.headText} { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.${css.name} {
  font-size: 14px; line-height: 20px; font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f1115);
  letter-spacing: -0.01em;
}
.${css.description} {
  font-size: 12px; line-height: 18px;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${css.pending} {
  flex: none; font-size: 11px; line-height: 16px;
  color: var(--dsw-alias-brand-primary, #3964fe);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #3964fe) 12%, transparent);
  border-radius: 999px; padding: 1px 8px;
}
.${css.chevron} {
  flex: none; color: var(--dsw-alias-label-tertiary, #81858c);
  transition: transform 0.15s ease, color 0.15s ease;
}
.${css.header}:hover .${css.chevron} { color: var(--dsw-alias-label-primary, #0f1115); }
.${css.chevronOpen} { transform: rotate(180deg); }
.${css.body} {
  border-top: 1px solid var(--dsw-alias-border-l1, rgb(0 0 0 / 6%));
  padding: 14px 16px 16px;
  display: flex; flex-direction: column; gap: 14px;
}
.${css.readOnly} {
  font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #81858c);
}
.${css.section} { display: flex; flex-direction: column; gap: 10px; }
.${css.sectionTitle} {
  font-size: 12px; line-height: 16px; font-weight: 600;
  color: var(--dsw-alias-label-secondary, #5b5f66);
  letter-spacing: 0.02em;
}
.${css.field} { display: flex; flex-direction: column; gap: 7px; }
.${css.fieldLabel} {
  font-size: 12px; line-height: 16px;
  color: var(--dsw-alias-label-secondary, #5b5f66);
}
.${css.control} {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; line-height: 18px;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${css.input}, .${css.select} {
  width: 100%; box-sizing: border-box;
  height: 28px; padding: 0 8px;
  font: inherit;
  color: var(--dsw-alias-label-primary, #0f1115);
  /* Transparent, not a literal fill: there is no --dsw-alias-bg-input
   * token, and a hardcoded white fallback breaks dark themes (white text
   * on a white field). The card body's bg-layer-3 shows through, so the
   * field is correct in both themes. */
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 6px;
}
.${css.input}:hover, .${css.select}:hover { border-color: var(--dsw-alias-border-l3, rgb(0 0 0 / 16%)); }
.${css.input}:focus, .${css.select}:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary, #3964fe);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary, #3964fe) 25%, transparent);
}
.${css.input}:disabled, .${css.select}:disabled { opacity: 0.5; cursor: not-allowed; }
/* The native dropdown list inherits the select's color but can paint a
 * light panel — under a dark theme that yields white-on-white options.
 * Pin both colors explicitly so the list reads correctly either way. */
.${css.select} option {
  color: var(--dsw-alias-label-primary, #0f1115);
  background: var(--dsw-alias-bg-layer-3, #ffffff);
}
.${css.checkboxRow} { display: flex; align-items: center; gap: 8px; }
.${css.checkboxRow} input[type='checkbox'] {
  width: 14px; height: 14px;
  /* Fixed DeepSeek blue: the brand token turns near-white under dark
   * themes, which would wash the tick out. */
  accent-color: #3964fe;
}
.${css.checkboxRow} input[type='checkbox']:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe); outline-offset: 2px;
}
.${css.checkboxRow} input[type='checkbox']:disabled { opacity: 0.5; }
.${css.hint} { font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary, #81858c); }
.${css.footer} { display: flex; justify-content: flex-end; gap: 8px; margin-top: 2px; }
.${css.discard}, .${css.save} {
  height: 28px; padding: 0 12px; border-radius: 6px;
  font: inherit; font-size: 12px; line-height: 18px; cursor: pointer;
}
.${css.discard} {
  color: var(--dsw-alias-label-primary, #0f1115);
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
.${css.discard}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)); }
.${css.discard}:disabled { opacity: 0.5; cursor: not-allowed; }
.${css.save} {
  /* Foreground follows the official primary-button contrast token: dark
   * themes turn the brand fill near-white, so the label must flip to a
   * dark ink instead of hardcoded white. */
  color: var(--dsw-alias-label-primary-foreground, #ffffff);
  background: var(--dsw-alias-brand-primary, #3964fe);
  border: 1px solid transparent;
}
.${css.save}:hover { filter: brightness(0.96); }
.${css.save}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe); outline-offset: 2px;
}
.${css.save}:disabled { opacity: 0.55; cursor: not-allowed; }
.${css.failed} { font-size: 12px; line-height: 18px; color: #dc2626; }
.${css.saved} {
  font-size: 12px; line-height: 18px; color: #16a34a;
  animation: mg-fade-out 2.2s ease forwards;
}
@keyframes mg-fade-out { from { opacity: 1; } to { opacity: 0; } }
.${css.loading} {
  height: 72px; border-radius: 6px;
  background: linear-gradient(90deg, transparent, var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)), transparent);
  background-size: 200% 100%;
  animation: mg-pulse 1.2s ease-in-out infinite;
}
@keyframes mg-pulse { from { background-position: 200% 0; } to { background-position: -200% 0; } }
`;
		/** Inject the card stylesheet once (idempotent; no-op when already present). */
		function injectCardStyle() {
			const id = "mg-dsh-desktop-style";
			if (document.getElementById(id) !== null) return;
			const style = document.createElement("style");
			style.id = id;
			style.textContent = STYLE_TEXT;
			document.head.appendChild(style);
		}
		//#endregion
		//#region src/client/settings-card.tsx
		/**
		* mg-dsh-desktop settings card — one card in the dsh settings → plugins
		* page, styled after the official PluginCard (collapsible header, themed
		* controls, save/discard footer). It edits the shell config (window size,
		* theme, tray behavior) through this plugin's own HTTP routes, and shows the
		* usage-stats ledger.
		*
		* The card renders only while the host serves the config API, which happens
		* only when the process was launched by this project (desktop shortcut /
		* `mg-dsh`); a plain command-line `dsh web` never mounts the bundle at all.
		*/
		/** Localized copy kept inline (the card is small; no locale plugin needed). */
		const COPY = {
			title: "Marec-DSH-Plugin",
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
			discard: "放弃",
			save: "保存",
			saving: "保存中…",
			saveFailed: "保存失败，请重试",
			saved: "已保存"
		};
		/** Read one shell config document (GET), or null on failure. */
		async function fetchConfig() {
			try {
				const res = await fetch("/api/mg-dsh-desktop/config");
				if (!res.ok) return null;
				const body = await res.json();
				return body.ok === true && body.value !== void 0 ? body.value : null;
			} catch {
				return null;
			}
		}
		/** Write the shell config document (POST); true when persisted. */
		async function saveConfig(patch) {
			try {
				const res = await fetch("/api/mg-dsh-desktop/config", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(patch)
				});
				const body = await res.json();
				return res.ok && body.ok === true;
			} catch {
				return false;
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
			(0, react.useEffect)(() => {
				let alive = true;
				fetchConfig().then((value) => {
					if (!alive) return;
					setConfig(value);
					setDraft(value === null ? null : {
						...value,
						width: window.innerWidth,
						height: window.innerHeight
					});
					setLoading(false);
				});
				return () => {
					alive = false;
				};
			}, []);
			const dirty = draft !== null && config !== null && (draft.width !== config.width || draft.height !== config.height || draft.theme !== config.theme || draft.minimizeToTray !== config.minimizeToTray || draft.closeToTray !== config.closeToTray);
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
				if (draft === null) return;
				setSaving(true);
				setFailed(false);
				setSaved(false);
				saveConfig({
					width: draft.width,
					height: draft.height,
					theme: draft.theme,
					minimizeToTray: draft.minimizeToTray,
					closeToTray: draft.closeToTray
				}).then((ok) => {
					setSaving(false);
					if (ok) {
						setConfig(draft);
						setSaved(true);
					} else setFailed(true);
				});
			};
			const onDiscard = () => {
				setDraft(config);
				setFailed(false);
				setSaved(false);
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
					children: [
						loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: CARD_CSS_CLASSES.loading,
							role: "status",
							"aria-label": "读取配置…"
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: draft !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
								})
							]
						}) }),
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
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: CARD_CSS_CLASSES.footer,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: CARD_CSS_CLASSES.discard,
								disabled: blocked,
								onClick: onDiscard,
								children: COPY.discard
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: CARD_CSS_CLASSES.save,
								disabled: blocked,
								onClick: onSave,
								children: COPY[saving ? "saving" : "save"]
							})]
						})
					]
				}) : null]
			});
		}
		//#endregion
		//#region src/client/index.ts
		window.__mgShellReady = true;
		/** Required services: slots (card registration) + workspaces (tray new-task). */
		const inject = ["slots", "workspaces"];
		/** Handle one tray command dispatched by the desktop shell. */
		function handleShellCommand(ctx, event) {
			const detail = event.detail;
			if (detail?.command !== "new-task") return;
			const workspaces = ctx.workspaces;
			if (workspaces === void 0 || workspaces.startSession === void 0) {
				console.warn("[mg-dsh-desktop] new-task ignored: workspaces service unavailable");
				return;
			}
			const known = detail.workspaceId !== void 0 && workspaces.list?.getSnapshot?.()?.items?.some((item) => item.workspaceId === detail.workspaceId) === true;
			console.log(`[mg-dsh-desktop] new-task${known ? ` in workspace ${detail.workspaceId}` : ""}`);
			workspaces.startSession(known ? detail.workspaceId : void 0);
		}
		/** Client plugin body. */
		function apply(ctx) {
			window.addEventListener("mg:shell-command", (event) => handleShellCommand(ctx, event));
			const slots = ctx.get("slots");
			if (slots === void 0) return;
			injectCardStyle();
			try {
				slots.inject("settings.plugin.item", function* () {
					yield slots.register({
						name: "settings.plugin.item",
						id: "mg-dsh-desktop",
						order: 30
					}, (props) => DesktopSettingsCard(props));
				});
			} catch (error) {
				console.warn("[mg-dsh-desktop] settings card injection failed:", error);
			}
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map