// NiceShoot renderer — panel toggle + crosshair settings (real-time)
// 12 pro-level crosshair variants, Position X/Y, Thickness, Outline, Reset

// ---------------------------------------------------------------------------
// Default settings (used for Reset and initial fallback)
// ---------------------------------------------------------------------------

const DEFAULT_SETTINGS = {
  size: 24,
  color: '#00FF00',
  opacity: 1,
  styleIndex: 0,
  xOffset: 0,
  yOffset: 0,
  thickness: 2,
  fillEnabled: true,
  outlineEnabled: true,
  outlineColor: '#000000',
  outlineThickness: 1,
  glowEnabled: false,
  glowColor: '#00FF00',
  glowIntensity: 8
};

// ---------------------------------------------------------------------------
// Crosshair SVG templates (use {{SW}} for stroke-width injection)
// viewBox 0 0 100 100; center at 50,50; stroke/fill use currentColor
// ---------------------------------------------------------------------------

const VIEWBOX_SCALE = 100 / 48; // scale stroke from old 48x48 to 100x100 for consistent thickness

const CROSSHAIR_STYLES = [
  // 1: Dot (Classic)
  `<svg class="crosshair-active" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="8.3" fill="currentColor"/></svg>`,
  // 2: Cross (Standard)
  `<svg class="crosshair-active" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="12.5" x2="50" y2="87.5" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><line x1="12.5" y1="50" x2="87.5" y2="50" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/></svg>`,
  // 3: Hollow Circle
  `<svg class="crosshair-active" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="33.3" stroke="currentColor" stroke-width="{{SW}}"/></svg>`,
  // 4: Circle with Dot
  `<svg class="crosshair-active" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="33.3" stroke="currentColor" stroke-width="{{SW}}"/><circle cx="50" cy="50" r="6.25" fill="currentColor"/></svg>`,
  // 5: T-Shape (CS:GO style)
  `<svg class="crosshair-active" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="12.5" x2="50" y2="58.3" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><line x1="20.8" y1="50" x2="79.2" y2="50" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/></svg>`,
  // 6: Chevron (^)
  `<svg class="crosshair-active" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 25 L33.3 62.5 L66.7 62.5 Z" stroke="currentColor" stroke-width="{{SW}}" stroke-linejoin="round" fill="none"/></svg>`,
  // 7: Sniper Cross (reticle with gap)
  `<svg class="crosshair-active" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="8.3" x2="50" y2="37.5" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><line x1="50" y1="62.5" x2="50" y2="91.7" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><line x1="8.3" y1="50" x2="37.5" y2="50" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><line x1="62.5" y1="50" x2="91.7" y2="50" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><rect x="41.7" y="41.7" width="16.7" height="16.7" rx="2.1" stroke="currentColor" stroke-width="{{SW}}" fill="none"/></svg>`,
  // 8: Double Circle
  `<svg class="crosshair-active" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="37.5" stroke="currentColor" stroke-width="{{SW}}"/><circle cx="50" cy="50" r="20.8" stroke="currentColor" stroke-width="{{SW}}"/></svg>`,
  // 9: Square with Dot
  `<svg class="crosshair-active" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="29.2" y="29.2" width="41.6" height="41.6" rx="4.2" stroke="currentColor" stroke-width="{{SW}}"/><circle cx="50" cy="50" r="6.25" fill="currentColor"/></svg>`,
  // 10: X-Shape
  `<svg class="crosshair-active" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="25" y1="25" x2="75" y2="75" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><line x1="75" y1="25" x2="25" y2="75" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/></svg>`,
  // 11: Triple Dot (Predator style)
  `<svg class="crosshair-active" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="29.2" r="6.25" fill="currentColor"/><circle cx="50" cy="50" r="6.25" fill="currentColor"/><circle cx="50" cy="70.8" r="6.25" fill="currentColor"/></svg>`,
  // 12: Star/Sparkle
  `<svg class="crosshair-active" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="12.5" x2="50" y2="29.2" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><line x1="50" y1="70.8" x2="50" y2="87.5" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><line x1="12.5" y1="50" x2="29.2" y2="50" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><line x1="70.8" y1="50" x2="87.5" y2="50" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><line x1="20.8" y1="20.8" x2="33.3" y2="33.3" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><line x1="66.7" y1="66.7" x2="79.2" y2="79.2" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><line x1="66.7" y1="20.8" x2="79.2" y2="33.3" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><line x1="20.8" y1="66.7" x2="33.3" y2="79.2" stroke="currentColor" stroke-width="{{SW}}" stroke-linecap="round"/><circle cx="50" cy="50" r="6.25" fill="currentColor"/></svg>`
];

const SW_PLACEHOLDER = '{{SW}}';

function getCrosshairSVGForLayer(styleIndex, strokeWidth, fillMode, fillStrokeWidth) {
  const sw = Math.max(0.5, strokeWidth) * VIEWBOX_SCALE;
  const fillSw = (fillStrokeWidth != null ? Math.max(0.5, fillStrokeWidth) : strokeWidth) * VIEWBOX_SCALE;
  let raw = CROSSHAIR_STYLES[Math.max(0, Math.min(styleIndex, CROSSHAIR_STYLES.length - 1))];
  if (fillMode === 'outline') {
    raw = raw.replace(/fill="currentColor"/g, `stroke="currentColor" stroke-width="${fillSw}" fill="none"`);
  }
  raw = raw.replace(new RegExp(SW_PLACEHOLDER.replace(/[{}]/g, '\\$&'), 'g'), String(sw));
  return raw;
}

// ---------------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------------

const crosshairContainer = document.getElementById('crosshairContainer');
const crosshairSizeInput = document.getElementById('crosshairSize');
const crosshairColorInput = document.getElementById('crosshairColor');
const crosshairOpacityInput = document.getElementById('crosshairOpacity');
const crosshairYOffsetInput = document.getElementById('crosshairYOffset');
const positionXInput = document.getElementById('positionX');
const crosshairThicknessInput = document.getElementById('crosshairThickness');
const fillToggleInput = document.getElementById('fillToggle');
const outlineToggleInput = document.getElementById('outlineToggle');
const outlineColorInput = document.getElementById('outlineColor');
const outlineThicknessInput = document.getElementById('outlineThickness');
const glowToggleInput = document.getElementById('glowToggle');
const glowColorInput = document.getElementById('glowColor');
const glowIntensityInput = document.getElementById('glowIntensity');
const sizeValueEl = document.getElementById('sizeValue');
const glowIntensityValueEl = document.getElementById('glowIntensityValue');
const opacityValueEl = document.getElementById('opacityValue');
const yOffsetValueEl = document.getElementById('yOffsetValue');
const positionXValueEl = document.getElementById('positionXValue');
const thicknessValueEl = document.getElementById('thicknessValue');
const outlineThicknessValueEl = document.getElementById('outlineThicknessValue');
const settingsPanel = document.querySelector('.settings-panel');
const settingsToggle = document.querySelector('.settings-toggle');

// Current state
let currentSize = Number(crosshairSizeInput?.value ?? DEFAULT_SETTINGS.size);
let currentColor = crosshairColorInput?.value ?? DEFAULT_SETTINGS.color;
let currentOpacity = Number(crosshairOpacityInput?.value ?? 100) / 100;
let currentXOffset = Number(positionXInput?.value ?? DEFAULT_SETTINGS.xOffset);
let currentYOffset = Number(crosshairYOffsetInput?.value ?? DEFAULT_SETTINGS.yOffset);
let currentThickness = Number(crosshairThicknessInput?.value ?? DEFAULT_SETTINGS.thickness);
let fillEnabled = fillToggleInput?.checked ?? DEFAULT_SETTINGS.fillEnabled;
let outlineEnabled = outlineToggleInput?.checked ?? DEFAULT_SETTINGS.outlineEnabled;
let currentOutlineColor = outlineColorInput?.value ?? DEFAULT_SETTINGS.outlineColor;
let outlineThickness = Number(outlineThicknessInput?.value ?? DEFAULT_SETTINGS.outlineThickness);
let glowEnabled = glowToggleInput?.checked ?? DEFAULT_SETTINGS.glowEnabled;
let glowColor = glowColorInput?.value ?? DEFAULT_SETTINGS.glowColor;
let glowIntensity = Number(glowIntensityInput?.value ?? DEFAULT_SETTINGS.glowIntensity);
let currentStyleIndex = DEFAULT_SETTINGS.styleIndex;

function enforceVisibility() {
  if (!fillEnabled && !outlineEnabled) {
    outlineEnabled = true;
    if (outlineToggleInput) outlineToggleInput.checked = true;
  }
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

function debounce(fn, delayMs) {
  let timeoutId = null;
  return function (...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn.apply(this, args);
    }, delayMs);
  };
}

function buildSettingsPayload() {
  return {
    size: currentSize,
    color: currentColor,
    opacity: Math.round(currentOpacity * 100),
    styleIndex: currentStyleIndex,
    xOffset: currentXOffset,
    yOffset: currentYOffset,
    thickness: currentThickness,
    fillEnabled,
    outlineEnabled,
    outlineColor: currentOutlineColor,
    outlineThickness,
    glowEnabled,
    glowColor,
    glowIntensity
  };
}

function persistSettings() {
  if (window.niceshoot?.saveSettings) window.niceshoot.saveSettings(buildSettingsPayload());
}

const debouncedSave = debounce(persistSettings, 500);

// ---------------------------------------------------------------------------
// Crosshair rendering (Multi-Layer pipeline)
// ---------------------------------------------------------------------------

function buildGlowFilter() {
  if (!glowEnabled || glowIntensity <= 0) return 'none';
  return `drop-shadow(0 0 ${glowIntensity}px ${glowColor || currentColor})`;
}

function applyCrosshairStyle() {
  enforceVisibility();
  if (!crosshairContainer) return;
  /* Size = Zoom: control container dimensions; SVG viewBox stays fixed */
  crosshairContainer.style.width = `${currentSize}px`;
  crosshairContainer.style.height = `${currentSize}px`;
  crosshairContainer.style.setProperty('--crosshair-opacity', String(currentOpacity));

  const stack = crosshairContainer.querySelector('.crosshair-stack');
  if (!stack) return;

  const glowLayer = stack.querySelector('.crosshair-layer-glow');
  const outlineLayer = stack.querySelector('.crosshair-layer-outline');
  const fillLayer = stack.querySelector('.crosshair-layer-fill');

  if (glowLayer) {
    glowLayer.classList.toggle('crosshair-layer--hidden', !glowEnabled);
    glowLayer.style.color = glowColor || currentColor;
    glowLayer.style.filter = buildGlowFilter();
  }
  if (outlineLayer) {
    outlineLayer.classList.toggle('crosshair-layer--hidden', !outlineEnabled);
    outlineLayer.style.color = currentOutlineColor || '#000000';
  }
  if (fillLayer) {
    fillLayer.classList.toggle('crosshair-layer--hidden', !fillEnabled);
    fillLayer.style.color = currentColor;
  }
}

function applyContainerStyle() {
  if (!crosshairContainer) return;
  crosshairContainer.style.setProperty('--crosshair-x-offset', currentXOffset + 'px');
  crosshairContainer.style.setProperty('--crosshair-y-offset', currentYOffset + 'px');
}

function renderCrosshairSVG() {
  enforceVisibility();
  if (!crosshairContainer) return;

  const outlineStrokeWidth = currentThickness + (outlineThickness * 2);
  const outlineFillStrokeWidth = Math.max(outlineThickness * 2, 2); // for fill-only shapes (dots) in outline mode
  const glowSvg = getCrosshairSVGForLayer(currentStyleIndex, currentThickness, 'fill');
  const outlineSvg = getCrosshairSVGForLayer(currentStyleIndex, outlineStrokeWidth, 'outline', outlineFillStrokeWidth);
  const fillSvg = getCrosshairSVGForLayer(currentStyleIndex, currentThickness, 'fill');

  const glowHidden = glowEnabled ? '' : ' crosshair-layer--hidden';
  const outlineHidden = outlineEnabled ? '' : ' crosshair-layer--hidden';
  const fillHidden = fillEnabled ? '' : ' crosshair-layer--hidden';

  crosshairContainer.innerHTML = `
    <div class="crosshair-stack">
      <div class="crosshair-layer crosshair-layer-glow${glowHidden}" style="color:${glowColor || currentColor};filter:${buildGlowFilter()};">
        ${glowSvg}
      </div>
      <div class="crosshair-layer crosshair-layer-outline${outlineHidden}" style="color:${currentOutlineColor || '#000000'};">
        ${outlineSvg}
      </div>
      <div class="crosshair-layer crosshair-layer-fill${fillHidden}" style="color:${currentColor};">
        ${fillSvg}
      </div>
    </div>
  `;
  applyCrosshairStyle();
}

// ---------------------------------------------------------------------------
// Settings panel toggle (F2 / buttons)
// ---------------------------------------------------------------------------

function isPanelOpen() {
  return document.body.classList.contains('panel-open');
}

function openPanel() {
  if (isPanelOpen()) return;
  document.body.classList.add('panel-open');
  if (window.niceshoot) window.niceshoot.setPanelOpen(true);
}

function closePanel() {
  if (!isPanelOpen()) return;
  document.body.classList.remove('panel-open');
  if (window.niceshoot) {
    window.niceshoot.setPanelOpen(false);
    window.niceshoot.setIgnoreMouse(true);
  }
}

function togglePanel() {
  if (isPanelOpen()) closePanel();
  else openPanel();
}

function isOverInteractiveUI(element) {
  return (settingsPanel?.contains(element)) || (settingsToggle?.contains(element));
}

function handleInteractiveEnter() {
  if (window.niceshoot?.setIgnoreMouse) window.niceshoot.setIgnoreMouse(false);
}

function handleInteractiveLeave(e) {
  const related = e.relatedTarget;
  if (related && isOverInteractiveUI(related)) return;
  if (window.niceshoot?.setIgnoreMouse) window.niceshoot.setIgnoreMouse(true);
}

// ---------------------------------------------------------------------------
// Load saved settings
// ---------------------------------------------------------------------------

function syncUIFromState() {
  if (crosshairSizeInput) {
    crosshairSizeInput.value = currentSize;
    sizeValueEl.textContent = currentSize;
  }
  if (crosshairColorInput) crosshairColorInput.value = currentColor;
  if (crosshairOpacityInput) {
    crosshairOpacityInput.value = Math.round(currentOpacity * 100);
    opacityValueEl.textContent = Math.round(currentOpacity * 100) + '%';
  }
  if (positionXInput) {
    positionXInput.value = currentXOffset;
    positionXValueEl.textContent = currentXOffset;
  }
  if (crosshairYOffsetInput) {
    crosshairYOffsetInput.value = currentYOffset;
    yOffsetValueEl.textContent = currentYOffset;
  }
  if (crosshairThicknessInput) {
    crosshairThicknessInput.value = currentThickness;
    thicknessValueEl.textContent = currentThickness;
  }
  if (fillToggleInput) fillToggleInput.checked = fillEnabled;
  if (outlineToggleInput) outlineToggleInput.checked = outlineEnabled;
  if (outlineColorInput) outlineColorInput.value = currentOutlineColor;
  if (outlineThicknessInput) {
    outlineThicknessInput.value = outlineThickness;
    outlineThicknessValueEl.textContent = outlineThickness;
  }
  if (glowToggleInput) glowToggleInput.checked = glowEnabled;
  if (glowColorInput) glowColorInput.value = glowColor;
  if (glowIntensityInput) {
    glowIntensityInput.value = glowIntensity;
    if (glowIntensityValueEl) glowIntensityValueEl.textContent = glowIntensity;
  }
  document.querySelectorAll('.crosshair-option').forEach((b) => {
    const active = parseInt(b.getAttribute('data-style'), 10) - 1 === currentStyleIndex;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', active);
  });
}

function applySavedSettings(s) {
  if (!s || typeof s !== 'object') return;
  currentSize = Math.min(96, Math.max(8, Number(s.size) ?? DEFAULT_SETTINGS.size));
  currentColor = typeof s.color === 'string' ? s.color : DEFAULT_SETTINGS.color;
  currentOpacity = typeof s.opacity === 'number' ? Math.min(1, Math.max(0, s.opacity / 100)) : 1;
  currentStyleIndex = Math.min(11, Math.max(0, Math.floor(Number(s.styleIndex) ?? DEFAULT_SETTINGS.styleIndex)));
  currentXOffset = Math.min(100, Math.max(-100, Number(s.xOffset) ?? DEFAULT_SETTINGS.xOffset));
  currentYOffset = Math.min(100, Math.max(-100, Number(s.yOffset) ?? DEFAULT_SETTINGS.yOffset));
  currentThickness = Math.min(10, Math.max(1, Number(s.thickness) ?? DEFAULT_SETTINGS.thickness));
  fillEnabled = typeof s.fillEnabled === 'boolean' ? s.fillEnabled : DEFAULT_SETTINGS.fillEnabled;
  outlineEnabled = Boolean(s.outlineEnabled);
  currentOutlineColor = typeof s.outlineColor === 'string' ? s.outlineColor : DEFAULT_SETTINGS.outlineColor;
  outlineThickness = Math.min(5, Math.max(0, Number(s.outlineThickness) ?? DEFAULT_SETTINGS.outlineThickness));
  glowEnabled = Boolean(s.glowEnabled);
  glowColor = typeof s.glowColor === 'string' ? s.glowColor : DEFAULT_SETTINGS.glowColor;
  glowIntensity = Math.min(20, Math.max(0, Number(s.glowIntensity) ?? DEFAULT_SETTINGS.glowIntensity));

  enforceVisibility();
  syncUIFromState();
  renderCrosshairSVG();
  applyContainerStyle();
  applyCrosshairStyle();
  setColor(currentColor);
}

function resetToDefaults() {
  currentSize = DEFAULT_SETTINGS.size;
  currentColor = DEFAULT_SETTINGS.color;
  currentOpacity = DEFAULT_SETTINGS.opacity;
  currentStyleIndex = DEFAULT_SETTINGS.styleIndex;
  currentXOffset = DEFAULT_SETTINGS.xOffset;
  currentYOffset = DEFAULT_SETTINGS.yOffset;
  currentThickness = DEFAULT_SETTINGS.thickness;
  fillEnabled = DEFAULT_SETTINGS.fillEnabled;
  outlineEnabled = DEFAULT_SETTINGS.outlineEnabled;
  currentOutlineColor = DEFAULT_SETTINGS.outlineColor;
  outlineThickness = DEFAULT_SETTINGS.outlineThickness;
  glowEnabled = DEFAULT_SETTINGS.glowEnabled;
  glowColor = DEFAULT_SETTINGS.glowColor;
  glowIntensity = DEFAULT_SETTINGS.glowIntensity;

  syncUIFromState();
  renderCrosshairSVG();
  applyContainerStyle();
  applyCrosshairStyle();
  setColor(currentColor);
  persistSettings();
}

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------

document.getElementById('settingsToggle')?.addEventListener('click', () => togglePanel());
document.getElementById('panelClose')?.addEventListener('click', closePanel);

const quitBtn = document.getElementById('quitBtn');
if (quitBtn && window.niceshoot?.quitApp) {
  quitBtn.addEventListener('click', () => window.niceshoot.quitApp());
}

if (settingsPanel) {
  settingsPanel.addEventListener('mouseenter', handleInteractiveEnter);
  settingsPanel.addEventListener('mouseleave', handleInteractiveLeave);
}
if (settingsToggle) {
  settingsToggle.addEventListener('mouseenter', handleInteractiveEnter);
  settingsToggle.addEventListener('mouseleave', handleInteractiveLeave);
}
if (window.niceshoot?.onToggleSettings) {
  window.niceshoot.onToggleSettings(togglePanel);
}

// Size
crosshairSizeInput?.addEventListener('input', () => {
  currentSize = Number(crosshairSizeInput.value);
  sizeValueEl.textContent = currentSize;
  applyCrosshairStyle();
  debouncedSave();
});

// Color
function setColor(hex) {
  currentColor = hex;
  if (crosshairColorInput) crosshairColorInput.value = hex;
  document.querySelectorAll('.color-preset').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-color')?.toLowerCase() === hex?.toLowerCase());
  });
  applyCrosshairStyle();
  debouncedSave();
}
crosshairColorInput?.addEventListener('input', () => setColor(crosshairColorInput.value));
document.querySelectorAll('.color-preset').forEach((btn) => {
  btn.addEventListener('click', () => setColor(btn.getAttribute('data-color')));
});

// Opacity
crosshairOpacityInput?.addEventListener('input', () => {
  currentOpacity = Number(crosshairOpacityInput.value) / 100;
  opacityValueEl.textContent = Math.round(currentOpacity * 100) + '%';
  applyCrosshairStyle();
  debouncedSave();
});

// Position X
positionXInput?.addEventListener('input', () => {
  currentXOffset = Number(positionXInput.value);
  positionXValueEl.textContent = currentXOffset;
  applyContainerStyle();
  debouncedSave();
});

// Position Y
crosshairYOffsetInput?.addEventListener('input', () => {
  currentYOffset = Number(crosshairYOffsetInput.value);
  yOffsetValueEl.textContent = currentYOffset;
  applyContainerStyle();
  debouncedSave();
});

// Thickness
crosshairThicknessInput?.addEventListener('input', () => {
  currentThickness = Number(crosshairThicknessInput.value);
  thicknessValueEl.textContent = currentThickness;
  renderCrosshairSVG();
  debouncedSave();
});

// Fill toggle
fillToggleInput?.addEventListener('change', () => {
  fillEnabled = fillToggleInput.checked;
  fillToggleInput.setAttribute('aria-checked', fillEnabled);
  enforceVisibility();
  syncUIFromState();
  applyCrosshairStyle();
  debouncedSave();
});

// Outline toggle
outlineToggleInput?.addEventListener('change', () => {
  outlineEnabled = outlineToggleInput.checked;
  outlineToggleInput.setAttribute('aria-checked', outlineEnabled);
  enforceVisibility();
  syncUIFromState();
  applyCrosshairStyle();
  debouncedSave();
});

// Outline color
outlineColorInput?.addEventListener('input', () => {
  currentOutlineColor = outlineColorInput.value;
  applyCrosshairStyle();
  debouncedSave();
});

// Outline thickness
outlineThicknessInput?.addEventListener('input', () => {
  outlineThickness = Number(outlineThicknessInput.value);
  outlineThicknessValueEl.textContent = outlineThickness;
  renderCrosshairSVG();
  debouncedSave();
});

// Glow toggle
glowToggleInput?.addEventListener('change', () => {
  glowEnabled = glowToggleInput.checked;
  glowToggleInput.setAttribute('aria-checked', glowEnabled);
  applyCrosshairStyle();
  debouncedSave();
});

// Glow color
glowColorInput?.addEventListener('input', () => {
  glowColor = glowColorInput.value;
  applyCrosshairStyle();
  debouncedSave();
});

// Glow intensity
glowIntensityInput?.addEventListener('input', () => {
  glowIntensity = Number(glowIntensityInput.value);
  if (glowIntensityValueEl) glowIntensityValueEl.textContent = glowIntensity;
  applyCrosshairStyle();
  debouncedSave();
});

// Center button
document.getElementById('centerBtn')?.addEventListener('click', () => {
  currentXOffset = 0;
  currentYOffset = 0;
  if (positionXInput) {
    positionXInput.value = 0;
    positionXValueEl.textContent = '0';
  }
  if (crosshairYOffsetInput) {
    crosshairYOffsetInput.value = 0;
    yOffsetValueEl.textContent = '0';
  }
  applyContainerStyle();
  debouncedSave();
});

// Reset to default
document.getElementById('resetBtn')?.addEventListener('click', resetToDefaults);

// Style selector
document.querySelectorAll('.crosshair-option').forEach((btn) => {
  btn.addEventListener('click', () => {
    const styleIndex = parseInt(btn.getAttribute('data-style'), 10) - 1;
    if (styleIndex < 0 || styleIndex >= CROSSHAIR_STYLES.length) return;
    currentStyleIndex = styleIndex;
    renderCrosshairSVG();
    document.querySelectorAll('.crosshair-option').forEach((b) => {
      const active = parseInt(b.getAttribute('data-style'), 10) - 1 === styleIndex;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active);
    });
    debouncedSave();
  });
});

// ---------------------------------------------------------------------------
// Initialize
// ---------------------------------------------------------------------------

function initFromSettings() {
  const applyAndShow = () => {
    renderCrosshairSVG();
    applyContainerStyle();
    setColor(currentColor);
  };
  if (window.niceshoot?.getSettings) {
    window.niceshoot.getSettings()
      .then((s) => { if (s && typeof s === 'object') applySavedSettings(s); })
      .catch(() => {})
      .finally(applyAndShow);
  } else {
    applyAndShow();
  }
}

initFromSettings();
