/* @ds-bundle: {"format":3,"namespace":"AIMDesignSystem_e594fb","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"Fab","sourcePath":"components/buttons/Fab.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"AlertBanner","sourcePath":"components/feedback/AlertBanner.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Chip","sourcePath":"components/feedback/Chip.jsx"},{"name":"Skeleton","sourcePath":"components/feedback/Skeleton.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"OTPInput","sourcePath":"components/forms/OTPInput.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"AIFeedbackBubble","sourcePath":"components/learning/AIFeedbackBubble.jsx"},{"name":"AnswerOption","sourcePath":"components/learning/AnswerOption.jsx"},{"name":"Card","sourcePath":"components/learning/Card.jsx"},{"name":"CircularProgress","sourcePath":"components/learning/CircularProgress.jsx"},{"name":"ProgressBar","sourcePath":"components/learning/ProgressBar.jsx"},{"name":"RecordButton","sourcePath":"components/learning/RecordButton.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"SegmentedControl","sourcePath":"components/navigation/SegmentedControl.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"TopAppBar","sourcePath":"components/navigation/TopAppBar.jsx"}],"sourceHashes":{"components/_util/useScopedStyles.js":"f32df61e5e28","components/buttons/Button.jsx":"3a3ba3c530fc","components/buttons/Fab.jsx":"0485258d5ec9","components/buttons/IconButton.jsx":"bdde8ca682b1","components/feedback/AlertBanner.jsx":"0d5221855f43","components/feedback/Badge.jsx":"12286f154091","components/feedback/Chip.jsx":"8a37d90c6905","components/feedback/Skeleton.jsx":"e27473c51da2","components/forms/Checkbox.jsx":"9917d3d93961","components/forms/Input.jsx":"b37b4d6e6819","components/forms/OTPInput.jsx":"5e02f93e10e8","components/forms/Radio.jsx":"3180fd4eaecc","components/forms/Select.jsx":"4443edcc64bf","components/forms/Switch.jsx":"866f76d8b5b3","components/forms/Textarea.jsx":"cd5232865eb7","components/learning/AIFeedbackBubble.jsx":"fbb8762a8d7b","components/learning/AnswerOption.jsx":"56d1c8e2533f","components/learning/Card.jsx":"d32a266cffcc","components/learning/CircularProgress.jsx":"8bfc6fb09e6b","components/learning/ProgressBar.jsx":"a4a3990d1108","components/learning/RecordButton.jsx":"63ce393bda5c","components/navigation/BottomNav.jsx":"6826106f2937","components/navigation/SegmentedControl.jsx":"c6ac3729ca99","components/navigation/Tabs.jsx":"15befaf250dc","components/navigation/TopAppBar.jsx":"ce28eb4d80b2"},"inlinedExternals":[],"unexposedExports":[{"name":"useScopedStyles","sourcePath":"components/_util/useScopedStyles.js"}]} */

(() => {

const __ds_ns = (window.AIMDesignSystem_e594fb = window.AIMDesignSystem_e594fb || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/_util/useScopedStyles.js
try { (() => {
/**
 * Injects a component's CSS once per document. Safe to call on every render.
 * Keeps components self-contained while still supporting :hover / :active /
 * :focus-visible states that inline styles can't express.
 */
function useScopedStyles(id, css) {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;
  const el = document.createElement('style');
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
Object.assign(__ds_scope, { useScopedStyles });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/_util/useScopedStyles.js", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-btn{
  --_h: var(--size-btn-md);
  display:inline-flex; align-items:center; justify-content:center;
  gap: var(--space-8);
  height: var(--_h); min-height: var(--_h);
  padding-inline: var(--space-20);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  font: var(--type-button); font-family: var(--font-sans);
  letter-spacing: var(--type-button-tracking);
  cursor: pointer; user-select:none; white-space:nowrap;
  text-decoration:none; box-sizing:border-box;
  transition: background var(--duration-fast) var(--ease-standard),
              border-color var(--duration-fast) var(--ease-standard),
              box-shadow var(--duration-fast) var(--ease-standard),
              transform var(--duration-fast) var(--ease-standard),
              color var(--duration-fast) var(--ease-standard);
}
.aim-btn:active{ transform: scale(0.97); }
.aim-btn:focus-visible{ outline:none; box-shadow: var(--shadow-focus); }
.aim-btn[disabled], .aim-btn[aria-disabled="true"]{
  cursor:not-allowed; transform:none; box-shadow:none;
  background: var(--disabled-bg) !important; color: var(--disabled-fg) !important;
  border-color: var(--disabled-border) !important;
}
.aim-btn--sm{ --_h: var(--size-btn-sm); padding-inline: var(--space-16); border-radius: var(--radius-sm); font-size: var(--type-body-sm-size); }
.aim-btn--lg{ --_h: var(--size-btn-lg); padding-inline: var(--space-24); font-size: var(--type-body-md-size); }
.aim-btn--block{ display:flex; width:100%; }

.aim-btn--primary{ background: var(--color-primary-500); color: var(--text-on-primary); }
.aim-btn--primary:hover{ background: var(--color-primary-600); }
.aim-btn--primary:active{ background: var(--color-primary-700); }

.aim-btn--secondary{ background: var(--color-secondary-500); color:#fff; }
.aim-btn--secondary:hover{ background: var(--color-secondary-600); }
.aim-btn--secondary:active{ background: var(--color-secondary-700); }

.aim-btn--outline{ background: transparent; color: var(--color-primary-600); border-color: var(--border-strong); }
.aim-btn--outline:hover{ background: var(--color-primary-50); border-color: var(--color-primary-300); }
.aim-btn--outline:active{ background: var(--color-primary-100); }

.aim-btn--ghost{ background: transparent; color: var(--color-primary-600); }
.aim-btn--ghost:hover{ background: var(--color-primary-50); }
.aim-btn--ghost:active{ background: var(--color-primary-100); }

.aim-btn--destructive{ background: var(--color-error-500); color:#fff; }
.aim-btn--destructive:hover{ background: var(--color-error-600); }
.aim-btn--destructive:active{ background: var(--color-error-700); }

.aim-btn__spinner{ width:1em; height:1em; border-radius:50%;
  border:2px solid currentColor; border-top-color:transparent;
  animation: aim-spin 0.7s linear infinite; }
.aim-btn--loading .aim-btn__label, .aim-btn--loading .aim-btn__icon{ visibility:hidden; }
.aim-btn--loading{ position:relative; }
.aim-btn--loading .aim-btn__spinner{ position:absolute; }
@keyframes aim-spin{ to{ transform:rotate(360deg); } }
`;

/**
 * AIM primary button primitive. Supports 5 variants, 3 sizes, icons,
 * loading and disabled states. Direction-agnostic (works in RTL).
 */
function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-btn-styles', CSS);
  const cls = ['aim-btn', `aim-btn--${variant}`, size !== 'md' ? `aim-btn--${size}` : '', fullWidth ? 'aim-btn--block' : '', loading ? 'aim-btn--loading' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    disabled: disabled || loading
  }, rest), loading && /*#__PURE__*/React.createElement("span", {
    className: "aim-btn__spinner",
    "aria-hidden": "true"
  }), leftIcon && /*#__PURE__*/React.createElement("span", {
    className: "aim-btn__icon",
    "aria-hidden": "true"
  }, leftIcon), /*#__PURE__*/React.createElement("span", {
    className: "aim-btn__label"
  }, children), rightIcon && /*#__PURE__*/React.createElement("span", {
    className: "aim-btn__icon",
    "aria-hidden": "true"
  }, rightIcon));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Fab.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-fab{
  display:inline-flex; align-items:center; justify-content:center;
  gap: var(--space-8);
  height: var(--size-fab); min-width: var(--size-fab);
  padding-inline: 0;
  border:none; border-radius: var(--radius-pill);
  background: var(--gradient-ai); color:#fff;
  box-shadow: var(--shadow-fab); cursor:pointer; box-sizing:border-box;
  font: var(--type-button); font-family: var(--font-sans);
  transition: transform var(--duration-fast) var(--ease-standard),
              filter var(--duration-fast) var(--ease-standard);
}
.aim-fab:hover{ filter: brightness(1.05); transform: translateY(-1px); }
.aim-fab:active{ transform: scale(0.96); }
.aim-fab:focus-visible{ outline:none; box-shadow: var(--shadow-fab), var(--shadow-focus); }
.aim-fab--extended{ padding-inline: var(--space-20); }
.aim-fab--solid{ background: var(--color-primary-500); }
`;

/**
 * Floating action button — circular by default, or extended with a label.
 * Uses the AI gradient by default to signal an adaptive / AI action.
 */
function Fab({
  extended = false,
  gradient = true,
  ariaLabel,
  icon = null,
  className = '',
  children,
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-fab-styles', CSS);
  const cls = ['aim-fab', extended ? 'aim-fab--extended' : '', gradient ? '' : 'aim-fab--solid', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls,
    "aria-label": ariaLabel
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: 'inline-flex'
    }
  }, icon), extended && children && /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { Fab });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Fab.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-iconbtn{
  --_s: var(--size-icon-btn);
  display:inline-flex; align-items:center; justify-content:center;
  width:var(--_s); height:var(--_s); padding:0;
  border-radius: var(--radius-md); border:1px solid transparent;
  background:transparent; color: var(--text-secondary);
  cursor:pointer; box-sizing:border-box;
  transition: background var(--duration-fast) var(--ease-standard),
              color var(--duration-fast) var(--ease-standard),
              border-color var(--duration-fast) var(--ease-standard),
              transform var(--duration-fast) var(--ease-standard);
}
.aim-iconbtn:active{ transform: scale(0.92); }
.aim-iconbtn:focus-visible{ outline:none; box-shadow: var(--shadow-focus); }
.aim-iconbtn[disabled]{ cursor:not-allowed; color:var(--disabled-fg) !important; background:transparent !important; }
.aim-iconbtn--sm{ --_s: var(--size-btn-sm); border-radius: var(--radius-sm); }
.aim-iconbtn--lg{ --_s: var(--size-btn-lg); }
.aim-iconbtn--round{ border-radius: var(--radius-pill); }

.aim-iconbtn--ghost:hover{ background: var(--surface-sunken); color: var(--text-primary); }
.aim-iconbtn--solid{ background: var(--color-primary-500); color:#fff; }
.aim-iconbtn--solid:hover{ background: var(--color-primary-600); }
.aim-iconbtn--soft{ background: var(--primary-soft); color: var(--primary-soft-fg); }
.aim-iconbtn--soft:hover{ background: var(--color-primary-100); }
.aim-iconbtn--outline{ border-color: var(--border-strong); color: var(--text-secondary); }
.aim-iconbtn--outline:hover{ background: var(--surface-sunken); color: var(--text-primary); }
`;

/**
 * Square/round icon-only button. Provide an accessible label via `ariaLabel`.
 */
function IconButton({
  variant = 'ghost',
  size = 'md',
  round = false,
  disabled = false,
  ariaLabel,
  className = '',
  children,
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-iconbtn-styles', CSS);
  const cls = ['aim-iconbtn', `aim-iconbtn--${variant}`, size !== 'md' ? `aim-iconbtn--${size}` : '', round ? 'aim-iconbtn--round' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls,
    disabled: disabled,
    "aria-label": ariaLabel
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/AlertBanner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-alert{
  display:flex; gap: var(--space-12); align-items:flex-start;
  padding: var(--space-12) var(--space-16);
  border-radius: var(--radius-md); border:1px solid transparent;
  font-family: var(--font-sans);
}
.aim-alert__icon{ flex-shrink:0; display:inline-flex; margin-top:1px; }
.aim-alert__body{ flex:1; min-width:0; }
.aim-alert__title{ font: var(--type-title); font-size: var(--type-body-md-size); margin:0 0 2px; }
.aim-alert__msg{ font: var(--type-body-sm); margin:0; color: inherit; opacity:.92; }
.aim-alert__close{ flex-shrink:0; border:none; background:transparent; cursor:pointer; color:inherit; opacity:.6; padding:0; display:inline-flex; }
.aim-alert__close:hover{ opacity:1; }
.aim-alert--info{ background:var(--info-soft); color:var(--info-soft-fg); border-color: color-mix(in srgb, var(--color-info-500) 18%, transparent); }
.aim-alert--success{ background:var(--success-soft); color:var(--success-soft-fg); border-color: color-mix(in srgb, var(--color-success-500) 18%, transparent); }
.aim-alert--warning{ background:var(--warning-soft); color:var(--warning-soft-fg); border-color: color-mix(in srgb, var(--color-warning-500) 22%, transparent); }
.aim-alert--error{ background:var(--error-soft); color:var(--error-soft-fg); border-color: color-mix(in srgb, var(--color-error-500) 18%, transparent); }
`;
const ICONS = {
  info: /*#__PURE__*/React.createElement("path", {
    d: "M12 16v-5M12 8h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"
  }),
  success: /*#__PURE__*/React.createElement("path", {
    d: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 12l3 3 5-6"
  }),
  warning: /*#__PURE__*/React.createElement("path", {
    d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"
  }),
  error: /*#__PURE__*/React.createElement("path", {
    d: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM15 9l-6 6M9 9l6 6"
  })
};

/** Inline alert / banner for contextual messages. */
function AlertBanner({
  tone = 'info',
  title,
  dismissible = false,
  onDismiss,
  action = null,
  className = '',
  children,
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-alert-styles', CSS);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['aim-alert', `aim-alert--${tone}`, className].filter(Boolean).join(' '),
    role: "alert"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "aim-alert__icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, ICONS[tone])), /*#__PURE__*/React.createElement("div", {
    className: "aim-alert__body"
  }, title && /*#__PURE__*/React.createElement("p", {
    className: "aim-alert__title"
  }, title), children && /*#__PURE__*/React.createElement("p", {
    className: "aim-alert__msg"
  }, children), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-8)'
    }
  }, action)), dismissible && /*#__PURE__*/React.createElement("button", {
    className: "aim-alert__close",
    type: "button",
    "aria-label": "Dismiss",
    onClick: onDismiss
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6L6 18"
  }))));
}
Object.assign(__ds_scope, { AlertBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/AlertBanner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-badge{
  display:inline-flex; align-items:center; gap: var(--space-4);
  font: var(--type-caption); font-family: var(--font-sans); font-weight:600;
  padding: 3px var(--space-8); border-radius: var(--radius-sm);
  border:1px solid transparent; white-space:nowrap; line-height:1.4;
}
.aim-badge--pill{ border-radius: var(--radius-pill); padding-inline: var(--space-12); }
.aim-badge__dot{ width:6px; height:6px; border-radius:50%; background: currentColor; flex-shrink:0; }
/* soft (default) */
.aim-badge--soft.aim-badge--primary{ background:var(--primary-soft); color:var(--primary-soft-fg); }
.aim-badge--soft.aim-badge--secondary{ background:var(--secondary-soft); color:var(--secondary-soft-fg); }
.aim-badge--soft.aim-badge--accent{ background:var(--accent-soft); color:var(--accent-soft-fg); }
.aim-badge--soft.aim-badge--success{ background:var(--success-soft); color:var(--success-soft-fg); }
.aim-badge--soft.aim-badge--warning{ background:var(--warning-soft); color:var(--warning-soft-fg); }
.aim-badge--soft.aim-badge--error{ background:var(--error-soft); color:var(--error-soft-fg); }
.aim-badge--soft.aim-badge--info{ background:var(--info-soft); color:var(--info-soft-fg); }
.aim-badge--soft.aim-badge--neutral{ background:var(--surface-sunken); color:var(--text-secondary); }
/* solid */
.aim-badge--solid{ color:#fff; }
.aim-badge--solid.aim-badge--primary{ background:var(--color-primary-500); }
.aim-badge--solid.aim-badge--secondary{ background:var(--color-secondary-500); }
.aim-badge--solid.aim-badge--accent{ background:var(--color-accent-600); }
.aim-badge--solid.aim-badge--success{ background:var(--color-success-500); }
.aim-badge--solid.aim-badge--warning{ background:var(--color-warning-500); }
.aim-badge--solid.aim-badge--error{ background:var(--color-error-500); }
.aim-badge--solid.aim-badge--info{ background:var(--color-info-500); }
.aim-badge--solid.aim-badge--neutral{ background:var(--color-neutral-600); }
/* outline */
.aim-badge--outline{ background:transparent; }
.aim-badge--outline.aim-badge--primary{ color:var(--color-primary-600); border-color:var(--color-primary-200); }
.aim-badge--outline.aim-badge--success{ color:var(--success-soft-fg); border-color:var(--color-success-100); }
.aim-badge--outline.aim-badge--warning{ color:var(--warning-soft-fg); border-color:var(--color-warning-100); }
.aim-badge--outline.aim-badge--error{ color:var(--error-soft-fg); border-color:var(--color-error-100); }
.aim-badge--outline.aim-badge--neutral{ color:var(--text-secondary); border-color:var(--border-strong); }
`;

/**
 * Status badge / pill. Use `tone` for semantic meaning and `variant` for
 * weight. Covers AIM statuses: completed, in-progress, locked, new, etc.
 */
function Badge({
  tone = 'neutral',
  variant = 'soft',
  pill = false,
  dot = false,
  icon = null,
  className = '',
  children,
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-badge-styles', CSS);
  const cls = ['aim-badge', `aim-badge--${variant}`, `aim-badge--${tone}`, pill ? 'aim-badge--pill' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "aim-badge__dot",
    "aria-hidden": "true"
  }), icon && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: 'inline-flex'
    }
  }, icon), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-chip{
  display:inline-flex; align-items:center; gap: var(--space-8);
  height:34px; padding-inline: var(--space-16);
  font: var(--type-body-sm); font-family: var(--font-sans); font-weight:500;
  background: var(--surface); color: var(--text-secondary);
  border:1px solid var(--border); border-radius: var(--radius-pill);
  cursor:pointer; user-select:none; box-sizing:border-box;
  transition: background var(--duration-fast) var(--ease-standard),
              border-color var(--duration-fast) var(--ease-standard),
              color var(--duration-fast) var(--ease-standard);
}
.aim-chip:hover{ background: var(--surface-sunken); }
.aim-chip:focus-visible{ outline:none; box-shadow: var(--shadow-focus); }
.aim-chip--selected{ background: var(--primary-soft); color: var(--primary-soft-fg); border-color: var(--color-primary-200); }
.aim-chip--selected:hover{ background: var(--color-primary-100); }
.aim-chip--static{ cursor:default; }
.aim-chip[aria-disabled="true"]{ cursor:not-allowed; color: var(--disabled-fg); background: var(--disabled-bg); border-color: var(--disabled-border); }
.aim-chip__x{ display:inline-flex; margin-inline-end:-4px; border-radius:50%; padding:1px; }
.aim-chip__x:hover{ background: color-mix(in srgb, currentColor 16%, transparent); }
.aim-chip__icon{ display:inline-flex; }
`;

/**
 * Chip / tag — selectable (filter), removable, or static. For filter rows,
 * reminder chips, and tags.
 */
function Chip({
  selected = false,
  removable = false,
  disabled = false,
  icon = null,
  onRemove,
  onClick,
  className = '',
  children,
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-chip-styles', CSS);
  const interactive = !!onClick || selected || removable;
  const cls = ['aim-chip', selected ? 'aim-chip--selected' : '', interactive ? '' : 'aim-chip--static', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    role: onClick ? 'button' : undefined,
    tabIndex: onClick && !disabled ? 0 : undefined,
    "aria-pressed": onClick ? selected : undefined,
    "aria-disabled": disabled || undefined,
    onClick: disabled ? undefined : onClick
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    className: "aim-chip__icon",
    "aria-hidden": "true"
  }, icon), children, removable && /*#__PURE__*/React.createElement("span", {
    className: "aim-chip__x",
    role: "button",
    "aria-label": "Remove",
    onClick: e => {
      e.stopPropagation();
      onRemove && onRemove();
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6L6 18"
  }))));
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Chip.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Skeleton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-skel{ display:block; background:
  linear-gradient(90deg, var(--surface-sunken) 0%, var(--color-neutral-100) 50%, var(--surface-sunken) 100%);
  background-size: 200% 100%; animation: aim-shimmer 1.3s ease-in-out infinite; }
.aim-skel--text{ border-radius: var(--radius-xs); }
.aim-skel--rect{ border-radius: var(--radius-md); }
.aim-skel--circle{ border-radius: 50%; }
@keyframes aim-shimmer{ 0%{ background-position: 200% 0; } 100%{ background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce){ .aim-skel{ animation:none; } }
`;

/** Loading placeholder. Use shape + explicit width/height. */
function Skeleton({
  shape = 'text',
  width,
  height,
  lines = 1,
  className = '',
  style = {},
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-skel-styles', CSS);
  if (shape === 'text' && lines > 1) {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-8)'
      }
    }, rest), Array.from({
      length: lines
    }).map((_, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "aim-skel aim-skel--text",
      style: {
        height: height || 12,
        width: i === lines - 1 ? '60%' : '100%'
      }
    })));
  }
  const defaults = shape === 'circle' ? {
    width: width || 40,
    height: height || 40
  } : shape === 'rect' ? {
    width: width || '100%',
    height: height || 80
  } : {
    width: width || '100%',
    height: height || 12
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['aim-skel', `aim-skel--${shape}`, className].filter(Boolean).join(' '),
    style: {
      ...defaults,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-check{ display:inline-flex; align-items:center; gap: var(--space-12); cursor:pointer; font-family: var(--font-sans); }
.aim-check input{ position:absolute; opacity:0; width:0; height:0; }
.aim-check__box{
  width:20px; height:20px; flex-shrink:0; border-radius: var(--radius-xs);
  border:1.5px solid var(--border-strong); background: var(--surface);
  display:inline-flex; align-items:center; justify-content:center; color:#fff;
  transition: background var(--duration-fast) var(--ease-standard),
              border-color var(--duration-fast) var(--ease-standard);
}
.aim-check__box svg{ opacity:0; transform: scale(0.6); transition: all var(--duration-fast) var(--ease-emphasis); }
.aim-check:hover input:not(:disabled) ~ .aim-check__box{ border-color: var(--color-primary-400); }
.aim-check input:checked ~ .aim-check__box{ background: var(--color-primary-500); border-color: var(--color-primary-500); }
.aim-check input:checked ~ .aim-check__box svg{ opacity:1; transform: scale(1); }
.aim-check input:focus-visible ~ .aim-check__box{ box-shadow: var(--shadow-focus); }
.aim-check input:disabled ~ .aim-check__box{ background: var(--disabled-bg); border-color: var(--disabled-border); }
.aim-check input:disabled ~ .aim-check__label{ color: var(--disabled-fg); }
.aim-check--disabled{ cursor:not-allowed; }
.aim-check__label{ font: var(--type-body-md); color: var(--text-primary); }
`;

/** Checkbox with label. Supports indeterminate state. */
function Checkbox({
  label,
  checked,
  indeterminate = false,
  disabled = false,
  id,
  className = '',
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-check-styles', CSS);
  const ref = React.useRef(null);
  const fieldId = id || React.useId();
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return /*#__PURE__*/React.createElement("label", {
    className: ['aim-check', disabled ? 'aim-check--disabled' : '', className].filter(Boolean).join(' '),
    htmlFor: fieldId
  }, /*#__PURE__*/React.createElement("input", _extends({
    ref: ref,
    id: fieldId,
    type: "checkbox",
    checked: checked,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "aim-check__box",
    "aria-hidden": "true"
  }, indeterminate ? /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 12h12"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12l5 5L20 7"
  }))), label && /*#__PURE__*/React.createElement("span", {
    className: "aim-check__label"
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-field{ display:flex; flex-direction:column; gap: var(--space-8); font-family: var(--font-sans); }
.aim-field__label{ font: var(--type-label); color: var(--text-secondary); }
.aim-field__req{ color: var(--color-error-500); margin-inline-start: 2px; }
.aim-input{
  display:flex; align-items:center; gap: var(--space-8);
  height: var(--size-input); padding-inline: var(--space-16);
  background: var(--surface); border:1px solid var(--border);
  border-radius: var(--radius-sm); box-sizing:border-box;
  transition: border-color var(--duration-fast) var(--ease-standard),
              box-shadow var(--duration-fast) var(--ease-standard);
}
.aim-input:hover{ border-color: var(--border-strong); }
.aim-input:focus-within{ border-color: var(--color-primary-500); box-shadow: var(--shadow-focus); }
.aim-input__control{
  flex:1; min-width:0; border:none; outline:none; background:transparent;
  font: var(--type-body-md); font-family: var(--font-sans); color: var(--text-primary);
}
.aim-input__control::placeholder{ color: var(--text-muted); }
.aim-input__icon{ display:inline-flex; color: var(--text-muted); flex-shrink:0; }
.aim-input__btn{ display:inline-flex; border:none; background:transparent; padding:0; cursor:pointer; color: var(--text-muted); }
.aim-input__btn:hover{ color: var(--text-secondary); }
.aim-input--sm{ height: var(--size-input-sm); }
.aim-field--error .aim-input{ border-color: var(--color-error-500); }
.aim-field--error .aim-input:focus-within{ box-shadow: 0 0 0 3px var(--error-soft); }
.aim-input--disabled{ background: var(--disabled-bg); border-color: var(--disabled-border); }
.aim-input--disabled .aim-input__control{ color: var(--disabled-fg); }
.aim-field__helper{ font: var(--type-helper); color: var(--text-muted); }
.aim-field--error .aim-field__helper{ color: var(--color-error-600); }
`;

/**
 * Text field with label, helper/error text, optional icons, and a built-in
 * show/hide toggle when type="password". Direction-agnostic.
 */
function Input({
  label,
  type = 'text',
  size = 'md',
  value,
  placeholder,
  helper,
  error,
  required = false,
  disabled = false,
  leftIcon = null,
  id,
  className = '',
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-input-styles', CSS);
  const [show, setShow] = React.useState(false);
  const fieldId = id || React.useId();
  const isPassword = type === 'password';
  const effType = isPassword ? show ? 'text' : 'password' : type;
  return /*#__PURE__*/React.createElement("div", {
    className: ['aim-field', error ? 'aim-field--error' : '', className].filter(Boolean).join(' ')
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "aim-field__label",
    htmlFor: fieldId
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "aim-field__req"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: ['aim-input', size === 'sm' ? 'aim-input--sm' : '', disabled ? 'aim-input--disabled' : ''].filter(Boolean).join(' ')
  }, leftIcon && /*#__PURE__*/React.createElement("span", {
    className: "aim-input__icon",
    "aria-hidden": "true"
  }, leftIcon), /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    className: "aim-input__control",
    type: effType,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    "aria-invalid": !!error
  }, rest)), isPassword && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "aim-input__btn",
    onClick: () => setShow(s => !s),
    "aria-label": show ? 'Hide password' : 'Show password'
  }, show ? EyeOff : Eye)), (error || helper) && /*#__PURE__*/React.createElement("span", {
    className: "aim-field__helper"
  }, error || helper));
}
const Eye = /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "3"
}));
const EyeOff = /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 4.9A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a18 18 0 0 1-3.1 3.9M6.1 6.1A18 18 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 2.6-.3"
}));
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/OTPInput.jsx
try { (() => {
const CSS = `
.aim-otp{ display:flex; gap: var(--space-12); direction:ltr; }
.aim-otp__cell{
  width:48px; height:56px; text-align:center;
  font: var(--type-h2); font-family: var(--font-sans); color: var(--text-primary);
  background: var(--surface); border:1.5px solid var(--border);
  border-radius: var(--radius-md); box-sizing:border-box;
  transition: border-color var(--duration-fast) var(--ease-standard),
              box-shadow var(--duration-fast) var(--ease-standard);
}
.aim-otp__cell:focus{ outline:none; border-color: var(--color-primary-500); box-shadow: var(--shadow-focus); }
.aim-otp__cell--filled{ border-color: var(--color-primary-300); }
.aim-otp--error .aim-otp__cell{ border-color: var(--color-error-500); }
`;

/**
 * One-time-code input — `length` separate cells with auto-advance,
 * backspace and paste handling. Calls onChange(code) and onComplete(code).
 */
function OTPInput({
  length = 4,
  value = '',
  onChange,
  onComplete,
  error = false,
  className = ''
}) {
  __ds_scope.useScopedStyles('aim-otp-styles', CSS);
  const refs = React.useRef([]);
  const chars = value.padEnd(length, ' ').slice(0, length).split('');
  const setAt = (i, ch) => {
    const next = chars.map((c, idx) => idx === i ? ch : c).join('').replace(/ /g, '');
    onChange && onChange(next);
    if (next.length === length) onComplete && onComplete(next);
  };
  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, '');
    if (!v) {
      setAt(i, ' ');
      return;
    }
    const digit = v[v.length - 1];
    setAt(i, digit);
    if (i < length - 1) refs.current[i + 1]?.focus();
  };
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && (chars[i] === ' ' || !chars[i]) && i > 0) refs.current[i - 1]?.focus();
  };
  const handlePaste = e => {
    const data = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, length);
    if (!data) return;
    e.preventDefault();
    onChange && onChange(data);
    if (data.length === length) {
      onComplete && onComplete(data);
      refs.current[length - 1]?.focus();
    } else refs.current[data.length]?.focus();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: ['aim-otp', error ? 'aim-otp--error' : '', className].filter(Boolean).join(' '),
    onPaste: handlePaste
  }, Array.from({
    length
  }).map((_, i) => /*#__PURE__*/React.createElement("input", {
    key: i,
    ref: el => refs.current[i] = el,
    className: ['aim-otp__cell', chars[i] && chars[i] !== ' ' ? 'aim-otp__cell--filled' : ''].filter(Boolean).join(' '),
    inputMode: "numeric",
    maxLength: 1,
    value: chars[i] === ' ' ? '' : chars[i],
    onChange: e => handleChange(i, e),
    onKeyDown: e => handleKey(i, e),
    "aria-label": `Digit ${i + 1}`
  })));
}
Object.assign(__ds_scope, { OTPInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/OTPInput.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-radio{ display:inline-flex; align-items:center; gap: var(--space-12); cursor:pointer; font-family: var(--font-sans); }
.aim-radio input{ position:absolute; opacity:0; width:0; height:0; }
.aim-radio__dot{
  width:20px; height:20px; flex-shrink:0; border-radius:50%;
  border:1.5px solid var(--border-strong); background: var(--surface);
  display:inline-flex; align-items:center; justify-content:center;
  transition: border-color var(--duration-fast) var(--ease-standard);
}
.aim-radio__dot::after{ content:''; width:10px; height:10px; border-radius:50%; background: var(--color-primary-500); transform: scale(0); transition: transform var(--duration-fast) var(--ease-emphasis); }
.aim-radio:hover input:not(:disabled) ~ .aim-radio__dot{ border-color: var(--color-primary-400); }
.aim-radio input:checked ~ .aim-radio__dot{ border-color: var(--color-primary-500); }
.aim-radio input:checked ~ .aim-radio__dot::after{ transform: scale(1); }
.aim-radio input:focus-visible ~ .aim-radio__dot{ box-shadow: var(--shadow-focus); }
.aim-radio input:disabled ~ .aim-radio__dot{ background: var(--disabled-bg); border-color: var(--disabled-border); }
.aim-radio input:disabled ~ .aim-radio__dot::after{ background: var(--disabled-fg); }
.aim-radio--disabled{ cursor:not-allowed; }
.aim-radio__label{ font: var(--type-body-md); color: var(--text-primary); }
`;

/** Single radio button with label. Group several with the same `name`. */
function Radio({
  label,
  checked,
  disabled = false,
  name,
  value,
  id,
  className = '',
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-radio-styles', CSS);
  const fieldId = id || React.useId();
  return /*#__PURE__*/React.createElement("label", {
    className: ['aim-radio', disabled ? 'aim-radio--disabled' : '', className].filter(Boolean).join(' '),
    htmlFor: fieldId
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: "radio",
    checked: checked,
    disabled: disabled,
    name: name,
    value: value
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "aim-radio__dot",
    "aria-hidden": "true"
  }), label && /*#__PURE__*/React.createElement("span", {
    className: "aim-radio__label"
  }, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-sel-wrap{ display:flex; flex-direction:column; gap: var(--space-8); font-family: var(--font-sans); }
.aim-sel-label{ font: var(--type-label); color: var(--text-secondary); }
.aim-sel{ position:relative; display:flex; align-items:center; }
.aim-sel select{
  appearance:none; -webkit-appearance:none; width:100%;
  height: var(--size-input); padding-inline: var(--space-16) var(--space-40);
  background: var(--surface); border:1px solid var(--border);
  border-radius: var(--radius-sm); box-sizing:border-box;
  font: var(--type-body-md); font-family: var(--font-sans); color: var(--text-primary);
  cursor:pointer;
  transition: border-color var(--duration-fast) var(--ease-standard),
              box-shadow var(--duration-fast) var(--ease-standard);
}
.aim-sel select:hover{ border-color: var(--border-strong); }
.aim-sel select:focus{ outline:none; border-color: var(--color-primary-500); box-shadow: var(--shadow-focus); }
.aim-sel select:disabled{ background: var(--disabled-bg); color: var(--disabled-fg); cursor:not-allowed; }
.aim-sel__chev{ position:absolute; inset-inline-end: var(--space-12); pointer-events:none; color: var(--text-muted); display:flex; }
.aim-sel--error select{ border-color: var(--color-error-500); }
.aim-sel-helper{ font: var(--type-helper); color: var(--text-muted); }
.aim-sel-helper--error{ color: var(--color-error-600); }
`;

/** Native select dropdown styled to match AIM inputs. */
function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  helper,
  error,
  disabled = false,
  id,
  className = '',
  children,
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-sel-styles', CSS);
  const fieldId = id || React.useId();
  return /*#__PURE__*/React.createElement("div", {
    className: ['aim-sel-wrap', className].filter(Boolean).join(' ')
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "aim-sel-label",
    htmlFor: fieldId
  }, label), /*#__PURE__*/React.createElement("div", {
    className: ['aim-sel', error ? 'aim-sel--error' : ''].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    value: value,
    onChange: onChange,
    disabled: disabled,
    "aria-invalid": !!error
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => typeof o === 'string' ? /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o) : /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label)), children), /*#__PURE__*/React.createElement("span", {
    className: "aim-sel__chev",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6 6-6"
  })))), (error || helper) && /*#__PURE__*/React.createElement("span", {
    className: ['aim-sel-helper', error ? 'aim-sel-helper--error' : ''].filter(Boolean).join(' ')
  }, error || helper));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-switch{ display:inline-flex; align-items:center; gap: var(--space-12); cursor:pointer; font-family: var(--font-sans); }
.aim-switch input{ position:absolute; opacity:0; width:0; height:0; }
.aim-switch__track{
  width:44px; height:26px; flex-shrink:0; border-radius: var(--radius-pill);
  background: var(--color-neutral-300); padding:3px; box-sizing:border-box;
  transition: background var(--duration-base) var(--ease-standard);
}
.aim-switch__thumb{
  width:20px; height:20px; border-radius:50%; background:#fff;
  box-shadow: 0 1px 3px rgba(24,28,38,.3);
  transition: transform var(--duration-base) var(--ease-emphasis);
}
.aim-switch input:checked ~ .aim-switch__track{ background: var(--color-primary-500); }
.aim-switch input:checked ~ .aim-switch__track .aim-switch__thumb{ transform: translateX(18px); }
[dir="rtl"] .aim-switch input:checked ~ .aim-switch__track .aim-switch__thumb{ transform: translateX(-18px); }
.aim-switch input:focus-visible ~ .aim-switch__track{ box-shadow: var(--shadow-focus); }
.aim-switch input:disabled ~ .aim-switch__track{ background: var(--disabled-bg); }
.aim-switch--disabled{ cursor:not-allowed; }
.aim-switch__label{ font: var(--type-body-md); color: var(--text-primary); }
`;

/** Toggle switch for on/off settings. */
function Switch({
  label,
  checked,
  disabled = false,
  id,
  className = '',
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-switch-styles', CSS);
  const fieldId = id || React.useId();
  return /*#__PURE__*/React.createElement("label", {
    className: ['aim-switch', disabled ? 'aim-switch--disabled' : '', className].filter(Boolean).join(' '),
    htmlFor: fieldId
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: "checkbox",
    role: "switch",
    checked: checked,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "aim-switch__track",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "aim-switch__thumb"
  })), label && /*#__PURE__*/React.createElement("span", {
    className: "aim-switch__label"
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-ta-wrap{ display:flex; flex-direction:column; gap: var(--space-8); font-family: var(--font-sans); }
.aim-ta-label{ font: var(--type-label); color: var(--text-secondary); }
.aim-ta{
  width:100%; box-sizing:border-box; resize:vertical; min-height:96px;
  padding: var(--space-12) var(--space-16);
  background: var(--surface); border:1px solid var(--border);
  border-radius: var(--radius-sm);
  font: var(--type-body-md); font-family: var(--font-sans); color: var(--text-primary);
  transition: border-color var(--duration-fast) var(--ease-standard),
              box-shadow var(--duration-fast) var(--ease-standard);
}
.aim-ta::placeholder{ color: var(--text-muted); }
.aim-ta:hover{ border-color: var(--border-strong); }
.aim-ta:focus{ outline:none; border-color: var(--color-primary-500); box-shadow: var(--shadow-focus); }
.aim-ta:disabled{ background: var(--disabled-bg); color: var(--disabled-fg); }
.aim-ta--error{ border-color: var(--color-error-500); }
.aim-ta-helper{ font: var(--type-helper); color: var(--text-muted); display:flex; justify-content:space-between; gap: var(--space-8); }
.aim-ta-helper--error{ color: var(--color-error-600); }
`;

/** Multi-line text input with optional character count. */
function Textarea({
  label,
  value,
  placeholder,
  helper,
  error,
  disabled = false,
  rows = 4,
  maxLength,
  id,
  className = '',
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-ta-styles', CSS);
  const fieldId = id || React.useId();
  const count = typeof value === 'string' ? value.length : 0;
  return /*#__PURE__*/React.createElement("div", {
    className: ['aim-ta-wrap', className].filter(Boolean).join(' ')
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "aim-ta-label",
    htmlFor: fieldId
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: fieldId,
    className: ['aim-ta', error ? 'aim-ta--error' : ''].filter(Boolean).join(' '),
    value: value,
    placeholder: placeholder,
    rows: rows,
    disabled: disabled,
    maxLength: maxLength,
    "aria-invalid": !!error
  }, rest)), (error || helper || maxLength) && /*#__PURE__*/React.createElement("div", {
    className: ['aim-ta-helper', error ? 'aim-ta-helper--error' : ''].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("span", null, error || helper), maxLength && /*#__PURE__*/React.createElement("span", null, count, "/", maxLength)));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/learning/AIFeedbackBubble.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-aifb{ display:flex; gap: var(--space-12); align-items:flex-start; font-family: var(--font-sans); }
.aim-aifb__avatar{
  flex-shrink:0; width:36px; height:36px; border-radius: var(--radius-pill);
  background: var(--gradient-ai); color:#fff;
  display:flex; align-items:center; justify-content:center;
  box-shadow: var(--shadow-fab);
}
.aim-aifb__bubble{
  flex:1; min-width:0; position:relative;
  background: var(--surface); border:1px solid var(--border);
  border-radius: var(--radius-lg); border-start-start-radius: var(--radius-xs);
  padding: var(--space-12) var(--space-16); box-shadow: var(--shadow-card);
}
.aim-aifb__name{ font: var(--type-label); color: var(--secondary-soft-fg); margin:0 0 4px; display:flex; align-items:center; gap: var(--space-8); }
.aim-aifb__msg{ font: var(--type-body-md); color: var(--text-primary); margin:0; }
.aim-aifb__msg :where(b,strong){ color: var(--color-primary-700); font-weight:600; }
.aim-aifb--tone-praise .aim-aifb__bubble{ border-color: var(--color-success-200, var(--color-success-100)); background: var(--success-soft); }
.aim-aifb--tone-correction .aim-aifb__bubble{ border-color: var(--color-warning-100); background: var(--warning-soft); }
/* typing indicator */
.aim-aifb__dots{ display:inline-flex; gap:4px; padding:4px 2px; }
.aim-aifb__dots span{ width:7px; height:7px; border-radius:50%; background: var(--text-muted); animation: aim-typing 1.2s infinite ease-in-out; }
.aim-aifb__dots span:nth-child(2){ animation-delay:.15s; }
.aim-aifb__dots span:nth-child(3){ animation-delay:.3s; }
@keyframes aim-typing{ 0%,60%,100%{ transform: translateY(0); opacity:.5; } 30%{ transform: translateY(-4px); opacity:1; } }
@media (prefers-reduced-motion: reduce){ .aim-aifb__dots span{ animation:none; } }
`;
const Spark = /*#__PURE__*/React.createElement("svg", {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "currentColor"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 2l1.7 4.9L18.6 8.6 13.7 10.3 12 15.2l-1.7-4.9L5.4 8.6l4.9-1.7z"
}));

/**
 * AI tutor feedback message — a chat bubble with the AIM gradient avatar.
 * Set `typing` to show the animated typing indicator. `tone` tints the
 * bubble (neutral / praise / correction).
 */
function AIFeedbackBubble({
  name = 'AI Tutor',
  tone = 'neutral',
  typing = false,
  className = '',
  children,
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-aifb-styles', CSS);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['aim-aifb', `aim-aifb--tone-${tone}`, className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "aim-aifb__avatar",
    "aria-hidden": "true"
  }, Spark), /*#__PURE__*/React.createElement("div", {
    className: "aim-aifb__bubble"
  }, /*#__PURE__*/React.createElement("p", {
    className: "aim-aifb__name"
  }, name), typing ? /*#__PURE__*/React.createElement("div", {
    className: "aim-aifb__dots",
    "aria-label": "AI is typing"
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null)) : /*#__PURE__*/React.createElement("div", {
    className: "aim-aifb__msg"
  }, children)));
}
Object.assign(__ds_scope, { AIFeedbackBubble });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/learning/AIFeedbackBubble.jsx", error: String((e && e.message) || e) }); }

// components/learning/AnswerOption.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-answer{
  display:flex; align-items:center; gap: var(--space-12); width:100%;
  padding: var(--space-16); text-align:start; box-sizing:border-box;
  background: var(--surface); border:1.5px solid var(--border);
  border-radius: var(--radius-md); cursor:pointer;
  font: var(--type-body-md); font-family: var(--font-sans); color: var(--text-primary);
  transition: border-color var(--duration-fast) var(--ease-standard),
              background var(--duration-fast) var(--ease-standard),
              transform var(--duration-fast) var(--ease-standard);
}
.aim-answer:hover:not(:disabled){ border-color: var(--color-primary-300); background: var(--color-primary-50); }
.aim-answer:active:not(:disabled){ transform: scale(0.99); }
.aim-answer:focus-visible{ outline:none; box-shadow: var(--shadow-focus); }
.aim-answer:disabled{ cursor:default; }
.aim-answer__key{
  flex-shrink:0; width:28px; height:28px; border-radius: var(--radius-sm);
  display:inline-flex; align-items:center; justify-content:center;
  background: var(--surface-sunken); color: var(--text-secondary);
  font: var(--type-label); font-weight:700;
  transition: background var(--duration-fast), color var(--duration-fast);
}
.aim-answer__text{ flex:1; min-width:0; }
.aim-answer__mark{ flex-shrink:0; display:inline-flex; }

/* selected (before grading) */
.aim-answer--selected{ border-color: var(--color-primary-500); background: var(--color-primary-50); }
.aim-answer--selected .aim-answer__key{ background: var(--color-primary-500); color:#fff; }

/* correct */
.aim-answer--correct{ border-color: var(--color-success-500); background: var(--success-soft); }
.aim-answer--correct .aim-answer__key{ background: var(--color-success-500); color:#fff; }
.aim-answer--correct .aim-answer__mark{ color: var(--color-success-600); }

/* incorrect */
.aim-answer--incorrect{ border-color: var(--color-error-500); background: var(--error-soft); }
.aim-answer--incorrect .aim-answer__key{ background: var(--color-error-500); color:#fff; }
.aim-answer--incorrect .aim-answer__mark{ color: var(--color-error-600); }

/* the correct answer revealed when user chose wrong */
.aim-answer--reveal{ border-color: var(--color-success-500); border-style:dashed; background: var(--surface); }
.aim-answer--reveal .aim-answer__mark{ color: var(--color-success-600); }
`;
const Check = /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.4",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M5 12l5 5L20 7"
}));
const Cross = /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.4",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M6 6l12 12M18 6L6 18"
}));

/**
 * Quiz answer choice. `state` drives the look:
 * default · selected · correct · incorrect · reveal (the right answer
 * highlighted after a wrong pick). `optionKey` shows A/B/C/D.
 */
function AnswerOption({
  state = 'default',
  optionKey,
  disabled,
  className = '',
  children,
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-answer-styles', CSS);
  const cls = ['aim-answer', state !== 'default' ? `aim-answer--${state}` : '', className].filter(Boolean).join(' ');
  const mark = state === 'correct' || state === 'reveal' ? Check : state === 'incorrect' ? Cross : null;
  const graded = ['correct', 'incorrect', 'reveal'].includes(state);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls,
    disabled: disabled || graded,
    "aria-pressed": state === 'selected'
  }, rest), optionKey && /*#__PURE__*/React.createElement("span", {
    className: "aim-answer__key",
    "aria-hidden": "true"
  }, optionKey), /*#__PURE__*/React.createElement("span", {
    className: "aim-answer__text"
  }, children), mark && /*#__PURE__*/React.createElement("span", {
    className: "aim-answer__mark",
    "aria-hidden": "true"
  }, mark));
}
Object.assign(__ds_scope, { AnswerOption });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/learning/AnswerOption.jsx", error: String((e && e.message) || e) }); }

// components/learning/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-card{
  background: var(--surface); border:1px solid var(--border);
  border-radius: var(--radius-lg); box-sizing:border-box;
  font-family: var(--font-sans); color: var(--text-primary);
  display:flex; flex-direction:column;
  transition: box-shadow var(--duration-base) var(--ease-standard),
              transform var(--duration-base) var(--ease-standard),
              border-color var(--duration-base) var(--ease-standard);
}
.aim-card--pad{ padding: var(--card-padding-lg); }
.aim-card--elevated{ border-color:transparent; box-shadow: var(--shadow-card); }
.aim-card--interactive{ cursor:pointer; }
.aim-card--interactive:hover{ box-shadow: var(--shadow-card-hover); transform: translateY(-2px); border-color: var(--color-primary-200); }
.aim-card--interactive:active{ transform: translateY(0); }
.aim-card--interactive:focus-visible{ outline:none; box-shadow: var(--shadow-focus); }
.aim-card--ai{ border-color: transparent; background:
  linear-gradient(var(--surface), var(--surface)) padding-box,
  var(--gradient-ai) border-box; border:1.5px solid transparent; }
.aim-card--gradient{ background: var(--gradient-ai); color:#fff; border-color:transparent; }
`;

/**
 * Surface container. Variants: default (outlined), elevated (shadow),
 * ai (gradient ring — for AI-generated content), gradient (full AI fill).
 */
function Card({
  variant = 'default',
  padded = true,
  interactive = false,
  as = 'div',
  className = '',
  children,
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-card-styles', CSS);
  const Tag = as;
  const cls = ['aim-card', padded ? 'aim-card--pad' : '', variant === 'elevated' ? 'aim-card--elevated' : '', variant === 'ai' ? 'aim-card--ai' : '', variant === 'gradient' ? 'aim-card--gradient' : '', interactive ? 'aim-card--interactive' : '', className].filter(Boolean).join(' ');
  const interactiveProps = interactive ? {
    tabIndex: 0,
    role: rest.onClick ? 'button' : undefined
  } : {};
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls
  }, interactiveProps, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/learning/Card.jsx", error: String((e && e.message) || e) }); }

// components/learning/CircularProgress.jsx
try { (() => {
const CSS = `
.aim-ring{ display:inline-flex; align-items:center; justify-content:center; position:relative; font-family: var(--font-sans); }
.aim-ring svg{ transform: rotate(-90deg); }
.aim-ring__track{ stroke: var(--surface-sunken); }
.aim-ring__fill{ stroke: var(--color-primary-500); stroke-linecap: round; transition: stroke-dashoffset var(--duration-slow) var(--ease-standard); }
.aim-ring--gradient .aim-ring__fill{ stroke: url(#aimRingGrad); }
.aim-ring--success .aim-ring__fill{ stroke: var(--color-success-500); }
.aim-ring__label{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.aim-ring__value{ font: var(--type-h2); font-variant-numeric: tabular-nums; color: var(--text-primary); }
.aim-ring__cap{ font: var(--type-caption); color: var(--text-muted); margin-top:1px; }
`;

/** Circular progress ring. Good for daily-goal and quiz-score dials. */
function CircularProgress({
  value = 0,
  max = 100,
  size = 96,
  thickness = 9,
  tone = 'primary',
  label,
  caption,
  showValue = true,
  className = ''
}) {
  __ds_scope.useScopedStyles('aim-ring-styles', CSS);
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const toneCls = tone === 'gradient' ? 'aim-ring--gradient' : tone === 'success' ? 'aim-ring--success' : '';
  return /*#__PURE__*/React.createElement("div", {
    className: ['aim-ring', toneCls, className].filter(Boolean).join(' '),
    style: {
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemin": 0,
    "aria-valuemax": max
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "aimRingGrad",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "var(--color-accent-500)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "var(--color-primary-500)"
  }))), /*#__PURE__*/React.createElement("circle", {
    className: "aim-ring__track",
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    strokeWidth: thickness
  }), /*#__PURE__*/React.createElement("circle", {
    className: "aim-ring__fill",
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    strokeWidth: thickness,
    strokeDasharray: c,
    strokeDashoffset: c - pct / 100 * c
  })), (showValue || label || caption) && /*#__PURE__*/React.createElement("div", {
    className: "aim-ring__label"
  }, label != null ? label : showValue && /*#__PURE__*/React.createElement("span", {
    className: "aim-ring__value"
  }, Math.round(pct), "%"), caption && /*#__PURE__*/React.createElement("span", {
    className: "aim-ring__cap"
  }, caption)));
}
Object.assign(__ds_scope, { CircularProgress });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/learning/CircularProgress.jsx", error: String((e && e.message) || e) }); }

// components/learning/ProgressBar.jsx
try { (() => {
const CSS = `
.aim-progress{ font-family: var(--font-sans); }
.aim-progress__head{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom: var(--space-8); gap: var(--space-8); }
.aim-progress__label{ font: var(--type-label); color: var(--text-secondary); }
.aim-progress__value{ font: var(--type-label); color: var(--text-primary); font-variant-numeric: tabular-nums; }
.aim-progress__track{
  height: var(--_h, 8px); border-radius: var(--radius-pill);
  background: var(--surface-sunken); overflow:hidden;
}
.aim-progress__fill{
  height:100%; border-radius: var(--radius-pill); min-width: 0;
  background: var(--_fill, var(--color-primary-500));
  transition: width var(--duration-slow) var(--ease-standard);
}
.aim-progress--gradient .aim-progress__fill{ background: var(--gradient-growth); }
.aim-progress--success .aim-progress__fill{ background: var(--color-success-500); }
.aim-progress--warning .aim-progress__fill{ background: var(--color-warning-500); }
`;

/** Linear progress / XP bar (0–100). Optional label + value readout. */
function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  tone = 'primary',
  size = 'md',
  valueFormat,
  className = ''
}) {
  __ds_scope.useScopedStyles('aim-progress-styles', CSS);
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const h = size === 'lg' ? 12 : size === 'sm' ? 5 : 8;
  const toneCls = tone === 'gradient' ? 'aim-progress--gradient' : tone === 'success' ? 'aim-progress--success' : tone === 'warning' ? 'aim-progress--warning' : '';
  return /*#__PURE__*/React.createElement("div", {
    className: ['aim-progress', toneCls, className].filter(Boolean).join(' ')
  }, (label || showValue) && /*#__PURE__*/React.createElement("div", {
    className: "aim-progress__head"
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "aim-progress__label"
  }, label), showValue && /*#__PURE__*/React.createElement("span", {
    className: "aim-progress__value"
  }, valueFormat ? valueFormat(value, max) : `${Math.round(pct)}%`)), /*#__PURE__*/React.createElement("div", {
    className: "aim-progress__track",
    style: {
      '--_h': `${h}px`
    },
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemin": 0,
    "aria-valuemax": max
  }, /*#__PURE__*/React.createElement("div", {
    className: "aim-progress__fill",
    style: {
      width: `${pct}%`
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/learning/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/learning/RecordButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.aim-rec{ display:inline-flex; flex-direction:column; align-items:center; gap: var(--space-8); font-family: var(--font-sans); }
.aim-rec__btn{
  position:relative; width:72px; height:72px; border-radius: var(--radius-pill);
  border:none; cursor:pointer; color:#fff;
  background: var(--gradient-ai); box-shadow: var(--shadow-fab);
  display:flex; align-items:center; justify-content:center;
  transition: transform var(--duration-fast) var(--ease-standard), filter var(--duration-fast);
}
.aim-rec__btn:hover{ filter: brightness(1.05); }
.aim-rec__btn:active{ transform: scale(0.95); }
.aim-rec__btn:focus-visible{ outline:none; box-shadow: var(--shadow-fab), var(--shadow-focus); }
.aim-rec__btn:disabled{ background: var(--disabled-bg); color: var(--disabled-fg); box-shadow:none; cursor:not-allowed; }
.aim-rec--recording .aim-rec__btn{ background: var(--color-error-500); box-shadow: 0 4px 10px rgba(229,72,77,.3); }
/* pulsing rings while recording */
.aim-rec__pulse{ position:absolute; inset:0; border-radius:50%; border:2px solid var(--color-error-500); opacity:0; }
.aim-rec--recording .aim-rec__pulse{ animation: aim-pulse 1.6s ease-out infinite; }
.aim-rec--recording .aim-rec__pulse:nth-child(2){ animation-delay:.5s; }
@keyframes aim-pulse{ 0%{ transform: scale(1); opacity:.6; } 100%{ transform: scale(1.7); opacity:0; } }
@media (prefers-reduced-motion: reduce){ .aim-rec__pulse{ animation:none !important; } }
.aim-rec__caption{ font: var(--type-caption); color: var(--text-secondary); font-variant-numeric: tabular-nums; }
.aim-rec--recording .aim-rec__caption{ color: var(--color-error-600); font-weight:600; }
`;
const Mic = /*#__PURE__*/React.createElement("svg", {
  width: "30",
  height: "30",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("rect", {
  x: "9",
  y: "2",
  width: "6",
  height: "12",
  rx: "3"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 10a7 7 0 0 0 14 0M12 17v4"
}));
const Stop = /*#__PURE__*/React.createElement("svg", {
  width: "26",
  height: "26",
  viewBox: "0 0 24 24",
  fill: "currentColor"
}, /*#__PURE__*/React.createElement("rect", {
  x: "6",
  y: "6",
  width: "12",
  height: "12",
  rx: "3"
}));

/**
 * Speaking-practice record button. Pulses while recording. Provide
 * `recording`, optional `caption` (e.g. a timer), and `onToggle`.
 */
function RecordButton({
  recording = false,
  caption,
  disabled = false,
  onToggle,
  className = '',
  ...rest
}) {
  __ds_scope.useScopedStyles('aim-rec-styles', CSS);
  const defaultCaption = recording ? 'Tap to stop' : 'Tap to speak';
  return /*#__PURE__*/React.createElement("div", {
    className: ['aim-rec', recording ? 'aim-rec--recording' : '', className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: "aim-rec__btn",
    "aria-pressed": recording,
    "aria-label": recording ? 'Stop recording' : 'Start recording',
    disabled: disabled,
    onClick: onToggle
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "aim-rec__pulse",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "aim-rec__pulse",
    "aria-hidden": "true"
  }), recording ? Stop : Mic), /*#__PURE__*/React.createElement("span", {
    className: "aim-rec__caption"
  }, caption != null ? caption : defaultCaption));
}
Object.assign(__ds_scope, { RecordButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/learning/RecordButton.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
const CSS = `
.aim-bottomnav{
  display:flex; align-items:stretch; justify-content:space-around;
  height: var(--bottom-nav-height); background: var(--surface);
  border-top:1px solid var(--border); box-shadow: var(--shadow-sheet);
  font-family: var(--font-sans); padding-bottom: env(safe-area-inset-bottom, 0);
}
.aim-bottomnav__item{
  flex:1; appearance:none; border:none; background:transparent; cursor:pointer;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px;
  color: var(--text-muted); position:relative; min-width:0;
  transition: color var(--duration-fast) var(--ease-standard);
}
.aim-bottomnav__item:hover{ color: var(--text-secondary); }
.aim-bottomnav__item--active{ color: var(--color-primary-600); }
.aim-bottomnav__icon{ display:inline-flex; position:relative; }
.aim-bottomnav__label{ font: var(--type-caption); font-weight:600; }
.aim-bottomnav__badge{
  position:absolute; top:-4px; inset-inline-end:-7px; min-width:16px; height:16px; padding:0 4px;
  background: var(--color-error-500); color:#fff; border-radius: var(--radius-pill);
  font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center;
  border:2px solid var(--surface); box-sizing:content-box;
}
.aim-bottomnav__item:focus-visible{ outline:none; box-shadow: inset 0 0 0 2px var(--focus-ring); border-radius: var(--radius-sm); }
`;

/** Mobile bottom navigation bar. `items` are {value,label,icon,activeIcon?,badge?}. */
function BottomNav({
  items = [],
  value,
  onChange,
  className = ''
}) {
  __ds_scope.useScopedStyles('aim-bottomnav-styles', CSS);
  return /*#__PURE__*/React.createElement("nav", {
    className: ['aim-bottomnav', className].filter(Boolean).join(' ')
  }, items.map(it => {
    const active = value === it.value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.value,
      className: ['aim-bottomnav__item', active ? 'aim-bottomnav__item--active' : ''].filter(Boolean).join(' '),
      "aria-current": active ? 'page' : undefined,
      onClick: () => onChange && onChange(it.value)
    }, /*#__PURE__*/React.createElement("span", {
      className: "aim-bottomnav__icon",
      "aria-hidden": "true"
    }, active && it.activeIcon ? it.activeIcon : it.icon, it.badge != null && /*#__PURE__*/React.createElement("span", {
      className: "aim-bottomnav__badge"
    }, it.badge)), /*#__PURE__*/React.createElement("span", {
      className: "aim-bottomnav__label"
    }, it.label));
  }));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SegmentedControl.jsx
try { (() => {
const CSS = `
.aim-seg{
  display:inline-flex; position:relative; padding:3px; gap:0;
  background: var(--surface-sunken); border-radius: var(--radius-md);
  font-family: var(--font-sans);
}
.aim-seg--block{ display:flex; width:100%; }
.aim-seg__thumb{
  position:absolute; top:3px; bottom:3px; border-radius: calc(var(--radius-md) - 3px);
  background: var(--surface); box-shadow: var(--shadow-card);
  transition: left var(--duration-base) var(--ease-emphasis), width var(--duration-base) var(--ease-emphasis);
}
.aim-seg__btn{
  position:relative; z-index:1; flex:1; appearance:none; border:none; background:transparent;
  cursor:pointer; padding: var(--space-8) var(--space-16); white-space:nowrap;
  font: var(--type-button); font-family: var(--font-sans); color: var(--text-secondary);
  display:inline-flex; align-items:center; justify-content:center; gap: var(--space-8);
  transition: color var(--duration-base) var(--ease-standard);
}
.aim-seg__btn--active{ color: var(--color-primary-600); }
.aim-seg__btn:focus-visible{ outline:none; box-shadow: var(--shadow-focus); border-radius: var(--radius-sm); }
`;

/** Segmented control — single-select among 2–4 short options. */
function SegmentedControl({
  items = [],
  value,
  onChange,
  fullWidth = false,
  className = ''
}) {
  __ds_scope.useScopedStyles('aim-seg-styles', CSS);
  const ref = React.useRef(null);
  const [thumb, setThumb] = React.useState({
    left: 3,
    width: 0
  });
  const norm = items.map(it => typeof it === 'string' ? {
    value: it,
    label: it
  } : it);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const active = el.querySelector('.aim-seg__btn--active');
    if (active) setThumb({
      left: active.offsetLeft,
      width: active.offsetWidth
    });
  }, [value, items, fullWidth]);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: ['aim-seg', fullWidth ? 'aim-seg--block' : '', className].filter(Boolean).join(' '),
    role: "tablist"
  }, /*#__PURE__*/React.createElement("span", {
    className: "aim-seg__thumb",
    style: {
      left: thumb.left,
      width: thumb.width
    }
  }), norm.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.value,
    role: "tab",
    "aria-selected": value === it.value,
    className: ['aim-seg__btn', value === it.value ? 'aim-seg__btn--active' : ''].filter(Boolean).join(' '),
    onClick: () => onChange && onChange(it.value)
  }, it.icon && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: 'inline-flex'
    }
  }, it.icon), it.label)));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
const CSS = `
.aim-tabs{ font-family: var(--font-sans); }
.aim-tabs__list{ display:flex; gap: var(--space-4); border-bottom:1px solid var(--border); position:relative; }
.aim-tab{
  appearance:none; border:none; background:transparent; cursor:pointer;
  padding: var(--space-12) var(--space-16); position:relative;
  font: var(--type-button); font-family: var(--font-sans); color: var(--text-secondary);
  display:inline-flex; align-items:center; gap: var(--space-8);
  transition: color var(--duration-fast) var(--ease-standard);
}
.aim-tab:hover{ color: var(--text-primary); }
.aim-tab:focus-visible{ outline:none; box-shadow: var(--shadow-focus); border-radius: var(--radius-sm); }
.aim-tab--active{ color: var(--color-primary-600); }
.aim-tab__underline{
  position:absolute; bottom:-1px; height:2.5px; border-radius: var(--radius-pill);
  background: var(--color-primary-500);
  transition: left var(--duration-base) var(--ease-standard), width var(--duration-base) var(--ease-standard);
}
.aim-tab__count{ font-size: var(--type-caption-size); background: var(--surface-sunken); color: var(--text-secondary); border-radius: var(--radius-pill); padding: 0 7px; }
.aim-tab--active .aim-tab__count{ background: var(--primary-soft); color: var(--primary-soft-fg); }
`;

/**
 * Underlined tab bar with an animated active indicator. Controlled via
 * `value` + `onChange`. `items` are {value,label,count?,icon?}.
 */
function Tabs({
  items = [],
  value,
  onChange,
  className = ''
}) {
  __ds_scope.useScopedStyles('aim-tabs-styles', CSS);
  const listRef = React.useRef(null);
  const [ind, setInd] = React.useState({
    left: 0,
    width: 0
  });
  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector('.aim-tab--active');
    if (active) setInd({
      left: active.offsetLeft,
      width: active.offsetWidth
    });
  }, [value, items]);
  return /*#__PURE__*/React.createElement("div", {
    className: ['aim-tabs', className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("div", {
    className: "aim-tabs__list",
    role: "tablist",
    ref: listRef
  }, items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.value,
    role: "tab",
    "aria-selected": value === it.value,
    className: ['aim-tab', value === it.value ? 'aim-tab--active' : ''].filter(Boolean).join(' '),
    onClick: () => onChange && onChange(it.value)
  }, it.icon && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: 'inline-flex'
    }
  }, it.icon), it.label, it.count != null && /*#__PURE__*/React.createElement("span", {
    className: "aim-tab__count"
  }, it.count))), /*#__PURE__*/React.createElement("span", {
    className: "aim-tab__underline",
    style: {
      left: ind.left,
      width: ind.width
    }
  })));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopAppBar.jsx
try { (() => {
const CSS = `
.aim-appbar{
  display:flex; align-items:center; gap: var(--space-8);
  height: var(--top-bar-height); padding-inline: var(--space-8);
  background: var(--surface); border-bottom:1px solid var(--border);
  font-family: var(--font-sans);
}
.aim-appbar--transparent{ background:transparent; border-bottom-color:transparent; }
.aim-appbar__lead{ display:flex; align-items:center; }
.aim-appbar__title{
  flex:1; min-width:0; font: var(--type-h3); color: var(--text-primary);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  padding-inline: var(--space-8);
}
.aim-appbar--center .aim-appbar__title{ text-align:center; }
.aim-appbar__actions{ display:flex; align-items:center; gap: var(--space-4); }
.aim-appbar__btn{
  width: var(--size-icon-btn); height: var(--size-icon-btn);
  display:inline-flex; align-items:center; justify-content:center;
  border:none; background:transparent; color: var(--text-primary);
  border-radius: var(--radius-md); cursor:pointer;
  transition: background var(--duration-fast) var(--ease-standard);
}
.aim-appbar__btn:hover{ background: var(--surface-sunken); }
.aim-appbar__btn:focus-visible{ outline:none; box-shadow: var(--shadow-focus); }
[dir="rtl"] .aim-appbar__back{ transform: scaleX(-1); }
`;
const BackIcon = /*#__PURE__*/React.createElement("svg", {
  className: "aim-appbar__back",
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M15 18l-6-6 6-6"
}));

/** Top app bar with optional back button, title, and trailing actions. */
function TopAppBar({
  title,
  onBack,
  leading = null,
  actions = null,
  centerTitle = false,
  transparent = false,
  className = ''
}) {
  __ds_scope.useScopedStyles('aim-appbar-styles', CSS);
  const cls = ['aim-appbar', centerTitle ? 'aim-appbar--center' : '', transparent ? 'aim-appbar--transparent' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("header", {
    className: cls
  }, /*#__PURE__*/React.createElement("div", {
    className: "aim-appbar__lead"
  }, leading, onBack && /*#__PURE__*/React.createElement("button", {
    className: "aim-appbar__btn",
    type: "button",
    "aria-label": "Back",
    onClick: onBack
  }, BackIcon)), /*#__PURE__*/React.createElement("h1", {
    className: "aim-appbar__title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "aim-appbar__actions"
  }, actions));
}
Object.assign(__ds_scope, { TopAppBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopAppBar.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Fab = __ds_scope.Fab;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.AlertBanner = __ds_scope.AlertBanner;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.OTPInput = __ds_scope.OTPInput;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.AIFeedbackBubble = __ds_scope.AIFeedbackBubble;

__ds_ns.AnswerOption = __ds_scope.AnswerOption;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CircularProgress = __ds_scope.CircularProgress;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.RecordButton = __ds_scope.RecordButton;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.TopAppBar = __ds_scope.TopAppBar;

})();
