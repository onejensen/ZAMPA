import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGN9c69y7LtaQ3Ej7JQiEe2-FUcR3zjiQ",
  authDomain: "eatout-70b8b.firebaseapp.com",
  projectId: "eatout-70b8b",
  storageBucket: "eatout-70b8b.firebasestorage.app"
};

const FUNCTIONS_BASE = "https://us-central1-eatout-70b8b.cloudfunctions.net";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const loginCard = document.getElementById("loginCard");
const workspace = document.getElementById("workspace");
const loginBtn = document.getElementById("loginBtn");
const googleBtn = document.createElement("button");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");
const workspaceMessage = document.getElementById("workspaceMessage");
const cards = document.getElementById("cards");
const loading = document.getElementById("loading");
const empty = document.getElementById("empty");
const sessionLabel = document.getElementById("sessionLabel");
const detailModal = document.getElementById("detailModal");
const detailTitle = document.getElementById("detailTitle");
const detailSubtitle = document.getElementById("detailSubtitle");
const detailContent = document.getElementById("detailContent");
const closeDetailBtn = document.getElementById("closeDetailBtn");

const verificationsPane = document.getElementById("verificationsPane");
const plansPane = document.getElementById("plansPane");
const plansSearch = document.getElementById("plansSearch");
const plansResults = document.getElementById("plansResults");
const plansLoading = document.getElementById("plansLoading");
const plansEmpty = document.getElementById("plansEmpty");
const plansMessage = document.getElementById("plansMessage");
const statsPane = document.getElementById("statsPane");
const statsMessage = document.getElementById("statsMessage");
const statsSearch = document.getElementById("statsSearch");
const statsPickerLoading = document.getElementById("statsPickerLoading");
const statsPicker = document.getElementById("statsPicker");
const statsDetail = document.getElementById("statsDetail");
const statsMerchantName = document.getElementById("statsMerchantName");
const statsMerchantIdEl = document.getElementById("statsMerchantId");
const statsClearBtn = document.getElementById("statsClearBtn");
const statsLoading = document.getElementById("statsLoading");
const statsContent = document.getElementById("statsContent");
const statsChart = document.getElementById("statsChart");
const kpiImpressions = document.getElementById("kpiImpressions");
const kpiImpressionsRange = document.getElementById("kpiImpressionsRange");
const kpiCalls = document.getElementById("kpiCalls");
const kpiUniqueCalls = document.getElementById("kpiUniqueCalls");
const kpiDirections = document.getElementById("kpiDirections");
const kpiUniqueDirections = document.getElementById("kpiUniqueDirections");
const kpiShares = document.getElementById("kpiShares");
const kpiFavoritesCurrent = document.getElementById("kpiFavoritesCurrent");
const kpiFavoritesNet = document.getElementById("kpiFavoritesNet");
const postsPane = document.getElementById("postsPane");
const postsMessage = document.getElementById("postsMessage");
const postsSearch = document.getElementById("postsSearch");
const postsPickerLoading = document.getElementById("postsPickerLoading");
const postsPicker = document.getElementById("postsPicker");
const postsDetail = document.getElementById("postsDetail");
const postsMerchantName = document.getElementById("postsMerchantName");
const postsMerchantIdEl = document.getElementById("postsMerchantId");
const postsClearBtn = document.getElementById("postsClearBtn");
const postsIncludeExpired = document.getElementById("postsIncludeExpired");
const postsLoading = document.getElementById("postsLoading");
const postsEmpty = document.getElementById("postsEmpty");
const postsList = document.getElementById("postsList");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabTitle = document.getElementById("tabTitle");
const tabEyebrow = document.getElementById("tabEyebrow");

let allItems = [];
let activeFilter = new URLSearchParams(window.location.search).get("status") || "pending";
let searchTerm = (new URLSearchParams(window.location.search).get("q") || "").trim().toLowerCase();
let activeView = new URLSearchParams(window.location.search).get("view") || localStorage.getItem("adminView") || "cards";
if (!["cards", "list"].includes(activeView)) activeView = "cards";

const allowedTabs = ["verifications", "plans", "stats", "posts"];
let activeTab = new URLSearchParams(window.location.search).get("tab") || "verifications";
if (!allowedTabs.includes(activeTab)) activeTab = "verifications";
let plansLoaded = false;
let plansSearchDebounce = null;
let statsSearchDebounce = null;
let statsSelectedMerchant = null;
let statsDays = 30;
let postsSearchDebounce = null;
let postsSelectedMerchant = null;

// Cache compartida del endpoint adminSearchMerchants. Plans/Stats/Posts
// golpean exactamente el mismo endpoint con la misma query, así que el
// mismo término de búsqueda en cualquier tab se sirve desde memoria
// mientras esté fresco. Invalidar tras mutaciones que cambian el listado
// (extender plan, aprobar/rechazar verificación).
const MERCHANT_CACHE_TTL_MS = 30000;
const merchantSearchCache = new Map();
let merchantSearchAbort = null;

function hasFreshMerchantCache(q) {
  const hit = merchantSearchCache.get(q);
  return !!(hit && Date.now() - hit.ts < MERCHANT_CACHE_TTL_MS);
}

function invalidateMerchantSearchCache() {
  merchantSearchCache.clear();
}

async function fetchMerchantSearch(q) {
  const hit = merchantSearchCache.get(q);
  if (hit && Date.now() - hit.ts < MERCHANT_CACHE_TTL_MS) {
    return hit.items;
  }
  // Cancela la búsqueda anterior en vuelo si el usuario sigue tecleando.
  if (merchantSearchAbort) merchantSearchAbort.abort();
  const ctrl = new AbortController();
  merchantSearchAbort = ctrl;
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  const { items = [] } = await authedFetch(`adminSearchMerchants${qs}`, { signal: ctrl.signal });
  if (merchantSearchAbort === ctrl) merchantSearchAbort = null;
  merchantSearchCache.set(q, { items, ts: Date.now() });
  return items;
}

googleBtn.className = "btn-secondary";
googleBtn.textContent = "Entrar con Google";
loginBtn.parentElement.appendChild(googleBtn);

function humanizeAuthError(error) {
  const code = error?.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-login-credentials":
      return "Email o contraseña incorrectos.";
    case "auth/operation-not-allowed":
      return "El acceso por email/contraseña no está habilitado en Firebase Auth.";
    case "auth/popup-blocked":
      return "El navegador ha bloqueado la ventana de Google. Permite popups e inténtalo otra vez.";
    case "auth/popup-closed-by-user":
      return "Se cerró la ventana de Google antes de completar el acceso.";
    case "auth/unauthorized-domain":
      return "El dominio getzampa.com no está autorizado en Firebase Auth. Hay que añadirlo en Authentication > Settings > Authorized domains.";
    case "auth/account-exists-with-different-credential":
      return "Esta cuenta ya existe con otro método de acceso.";
    default:
      return error?.message || "No se pudo iniciar sesión.";
  }
}

function showMessage(target, text, kind = "error") {
  target.textContent = text;
  target.className = `message ${kind}`;
  target.hidden = false;
}

function hideMessage(target) {
  target.hidden = true;
  target.textContent = "";
}

function esc(str) {
  if (str == null || str === "") return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(ms) {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(ms));
}

function normalizeStatus(status) {
  return ["pending", "approved", "rejected"].includes(status) ? status : "pending";
}

function statusText(status) {
  switch (normalizeStatus(status)) {
    case "approved": return "Aprobado";
    case "rejected": return "Rechazado";
    default: return "Pendiente";
  }
}

function matchesSearch(item, term) {
  if (!term) return true;
  const haystack = [
    item.name,
    item.taxId,
    item.phone,
    item.addressText,
    item.merchantId
  ].join(" ").toLowerCase();
  return haystack.includes(term);
}

function syncUrlState() {
  const params = new URLSearchParams(window.location.search);
  if (activeFilter && activeFilter !== "pending") params.set("status", activeFilter);
  else params.delete("status");
  if (searchTerm) params.set("q", searchTerm);
  else params.delete("q");
  if (activeView === "list") params.set("view", activeView);
  else params.delete("view");
  if (activeTab && activeTab !== "verifications") params.set("tab", activeTab);
  else params.delete("tab");
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState({}, "", nextUrl);
}

async function authedFetch(path, options = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No hay sesión activa.");
  }

  // getIdToken() sin force: reusa el token cacheado y solo refresca
  // si está expirado. Antes pasábamos `true` y eso añadía un round-trip
  // contra el server de auth de Google en CADA fetch (notable al buscar).
  const token = await user.getIdToken();
  const response = await fetch(`${FUNCTIONS_BASE}/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

function createDetail(label, value) {
  const div = document.createElement("div");
  div.className = "detail";
  div.innerHTML = `<span>${label}</span><strong>${esc(value) || "—"}</strong>`;
  return div;
}

function ensureControls() {
  if (document.getElementById("searchInput")) return;

  const toolbar = workspace.querySelector(".toolbar");
  const controlStrip = document.createElement("div");
  controlStrip.className = "control-strip";
  controlStrip.innerHTML = `
    <div class="search-row">
      <input id="searchInput" class="search-input" type="search" placeholder="Buscar restaurante, CIF, teléfono, dirección o ID">
      <div class="summary" id="summary"></div>
    </div>
    <div class="filters" id="filters">
      <button class="filter-btn active" data-filter="pending">Pendientes</button>
      <button class="filter-btn" data-filter="approved">Aprobados</button>
      <button class="filter-btn" data-filter="rejected">Rechazados</button>
      <button class="filter-btn" data-filter="all">Todos</button>
    </div>
    <div class="control-footer">
      <span class="card-meta">Cambia a lista cuando necesites revisar muchos comercios rápido.</span>
      <div class="view-switch" id="viewSwitch" aria-label="Modo de visualización">
        <button class="view-btn" data-view="cards">Tarjetas</button>
        <button class="view-btn" data-view="list">Lista</button>
      </div>
    </div>
  `;
  toolbar.insertAdjacentElement("afterend", controlStrip);

  const searchInput = document.getElementById("searchInput");
  searchInput.value = searchTerm;
  searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    syncUrlState();
    renderItems();
  });

  document.getElementById("filters").querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === activeFilter);
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      syncUrlState();
      document.getElementById("filters").querySelectorAll("[data-filter]").forEach((btn) => {
        btn.classList.toggle("active", btn === button);
      });
      renderItems();
    });
  });

  document.getElementById("viewSwitch").querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === activeView);
    button.addEventListener("click", () => {
      activeView = button.dataset.view === "list" ? "list" : "cards";
      localStorage.setItem("adminView", activeView);
      syncUrlState();
      document.getElementById("viewSwitch").querySelectorAll("[data-view]").forEach((btn) => {
        btn.classList.toggle("active", btn === button);
      });
      renderItems();
    });
  });
}

function renderSummary(items) {
  const summary = document.getElementById("summary");
  if (!summary) return;
  const counts = {
    pending: 0,
    approved: 0,
    rejected: 0
  };
  items.forEach((item) => {
    counts[normalizeStatus(item.status)] += 1;
  });
  summary.innerHTML = `
    <span class="summary-pill">Pendientes ${counts.pending}</span>
    <span class="summary-pill">Aprobados ${counts.approved}</span>
    <span class="summary-pill">Rechazados ${counts.rejected}</span>
  `;
}

function createReviewButtons(item, status, getNotes = () => "") {
  const approveBtn = document.createElement("button");
  approveBtn.className = "btn-success";
  approveBtn.dataset.actionBtn = "true";
  approveBtn.dataset.locked = status === "approved" ? "true" : "false";
  approveBtn.textContent = status === "approved" ? "Aprobado" : "Aprobar";
  approveBtn.disabled = status === "approved";
  approveBtn.addEventListener("click", async () => {
    if (!confirm(`¿Aprobar a ${item.name || item.merchantId}?`)) return;
    await handleReview("adminApproveVerification", item.merchantId, getNotes(), `Comercio aprobado: ${item.name || item.merchantId}`);
  });

  const rejectBtn = document.createElement("button");
  rejectBtn.className = "btn-danger";
  rejectBtn.dataset.actionBtn = "true";
  rejectBtn.dataset.locked = status === "rejected" ? "true" : "false";
  rejectBtn.textContent = status === "rejected" ? "Rechazado" : "Rechazar";
  rejectBtn.disabled = status === "rejected";
  rejectBtn.addEventListener("click", async () => {
    if (!confirm(`¿Rechazar a ${item.name || item.merchantId}?`)) return;
    await handleReview("adminRejectVerification", item.merchantId, getNotes(), `Comercio rechazado: ${item.name || item.merchantId}`);
  });

  return [approveBtn, rejectBtn];
}

function renderItems() {
  cards.innerHTML = "";
  cards.className = `cards view-${activeView}`;
  empty.hidden = true;
  renderSummary(allItems);

  const filtered = allItems
    .filter((item) => activeFilter === "all" || normalizeStatus(item.status) === activeFilter)
    .filter((item) => matchesSearch(item, searchTerm));

  if (!filtered.length) {
    empty.hidden = false;
    empty.textContent = searchTerm || activeFilter !== "all"
      ? "No hay resultados para ese filtro."
      : "No hay comercios pendientes ahora mismo.";
    return;
  }

  filtered.forEach((item) => {
    const status = normalizeStatus(item.status);

    if (activeView === "list") {
      const row = document.createElement("article");
      row.className = `list-row status-${status}`;
      row.innerHTML = `
        <div class="list-main">
          <h3 class="list-title">${esc(item.name) || "Sin nombre"}</h3>
          <p class="list-sub">${esc(item.merchantId)}</p>
        </div>
        <div class="list-meta">
          <div class="status">${statusText(status)}</div>
          <p class="list-sub">${esc(item.phone) || "Sin teléfono"} · Alta ${formatDate(item.createdAt)}</p>
        </div>
        <p class="list-address">${esc(item.addressText) || "Sin dirección"} · ${esc(item.taxId) || "Sin CIF/NIF"}</p>
        <div class="list-actions">
          <button class="link-btn" data-open-detail="true">Detalle</button>
        </div>
      `;
      row.querySelector("[data-open-detail]").addEventListener("click", () => openDetail(item));
      row.querySelector(".list-actions").append(...createReviewButtons(item, status, () => item.verificationNotes || ""));
      cards.append(row);
      return;
    }

    const article = document.createElement("article");
    article.className = `card status-${status}`;
    article.innerHTML = `
      <div class="card-head">
        <div>
          <h3 class="card-title">${esc(item.name) || "Sin nombre"}</h3>
          <div class="card-id">ID ${esc(item.merchantId)}</div>
          <button class="link-btn" data-open-detail="true">Ver detalle</button>
        </div>
        <div class="status">${statusText(status)}</div>
      </div>
    `;
    article.querySelector("[data-open-detail]").addEventListener("click", () => openDetail(item));

    const detailGrid = document.createElement("div");
    detailGrid.className = "detail-grid";
    detailGrid.append(
      createDetail("Teléfono", item.phone),
      createDetail("CIF/NIF", item.taxId),
      createDetail("Dirección", item.addressText),
      createDetail("Alta", formatDate(item.createdAt)),
      createDetail("Revisado", formatDate(item.reviewedAt)),
      createDetail("Por", item.reviewedBy || (item.isVerified ? "Verificado" : "Pendiente"))
    );

    const stack = document.createElement("div");
    stack.className = "review-box";
    const notes = document.createElement("textarea");
    notes.placeholder = "Notas internas para aprobación o rechazo";
    notes.value = item.verificationNotes || "";
    const notesLabel = document.createElement("p");
    notesLabel.className = "review-label";
    notesLabel.textContent = "Notas de revisión";

    const actions = document.createElement("div");
    actions.className = "actions";

    actions.append(...createReviewButtons(item, status, () => notes.value));
    stack.append(notesLabel, notes, actions);
    article.append(detailGrid, stack);
    cards.append(article);
  });
}

function openDetail(item) {
  detailTitle.textContent = item.name || "Sin nombre";
  detailSubtitle.textContent = `${statusText(item.status)} · ${item.merchantId}`;
  const lat = item.address?.lat;
  const lng = item.address?.lng;
  const mapHtml = (typeof lat === "number" && typeof lng === "number")
    ? `<iframe class="map-frame" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed"></iframe>`
    : `<div class="detail"><span>Mapa</span><strong>Sin coordenadas verificadas</strong></div>`;

  const cuisine = (item.cuisineTypes || []).length
    ? `<div class="chips">${item.cuisineTypes.map((type) => `<span class="chip">${esc(type)}</span>`).join("")}</div>`
    : `<div class="detail"><span>Cocina</span><strong>Sin categorías</strong></div>`;

  const schedule = (item.schedule || []).length
    ? `<div class="schedule-list">${item.schedule.map((row) => `<div class="schedule-item"><strong>${esc(row.day) || "—"}</strong><span>${esc(row.open) || "—"} - ${esc(row.close) || "—"}</span></div>`).join("")}</div>`
    : `<div class="detail"><span>Horario</span><strong>Sin horario cargado</strong></div>`;

  const photos = (item.coverPhotoUrl || item.profilePhotoUrl)
    ? `<div class="thumbs">
        ${item.coverPhotoUrl ? `<div class="thumb"><img src="${esc(item.coverPhotoUrl)}" alt="Portada"></div>` : ""}
        ${item.profilePhotoUrl ? `<div class="thumb"><img src="${esc(item.profilePhotoUrl)}" alt="Perfil"></div>` : ""}
      </div>`
    : `<div class="detail"><span>Fotos</span><strong>Sin imágenes</strong></div>`;

  detailContent.innerHTML = `
    <div class="modal-grid">
      <div class="stack">
        ${photos}
        ${mapHtml}
      </div>
      <div class="stack">
        <div class="detail-grid">
          <div class="detail"><span>Teléfono</span><strong>${esc(item.phone) || "—"}</strong></div>
          <div class="detail"><span>CIF/NIF</span><strong>${esc(item.taxId) || "—"}</strong></div>
          <div class="detail"><span>Dirección</span><strong>${esc(item.addressText || item.address?.formatted) || "—"}</strong></div>
          <div class="detail"><span>Reservas</span><strong>${item.acceptsReservations ? "Sí" : "No"}</strong></div>
          <div class="detail"><span>Trial hasta</span><strong>${formatDate(item.trialEndsAt)}</strong></div>
          <div class="detail"><span>Suscripción</span><strong>${esc(item.subscriptionStatus) || "—"}</strong></div>
        </div>
        <div class="detail"><span>Descripción</span><strong>${esc(item.shortDescription) || "Sin descripción"}</strong></div>
        ${cuisine}
        ${schedule}
      </div>
    </div>
  `;
  detailModal.hidden = false;
}

function closeDetail() {
  detailModal.hidden = true;
  detailContent.innerHTML = "";
}

function setBusy(isBusy) {
  loginBtn.disabled = isBusy;
  googleBtn.disabled = isBusy;
  refreshBtn.disabled = isBusy;
  logoutBtn.disabled = isBusy;
  document.querySelectorAll("[data-action-btn]").forEach((btn) => {
    btn.disabled = isBusy || btn.dataset.locked === "true";
  });
}

async function loadPending() {
  hideMessage(workspaceMessage);
  ensureControls();
  cards.innerHTML = "";
  empty.hidden = true;
  loading.hidden = false;
  setBusy(true);

  try {
    const { items = [] } = await authedFetch("adminListPendingVerifications");
    loading.hidden = true;
    allItems = items;
    renderItems();
  } catch (error) {
    loading.hidden = true;
    showMessage(workspaceMessage, error.message || "No se pudieron cargar los pendientes.");
  } finally {
    setBusy(false);
  }
}

async function handleReview(endpoint, merchantId, notes, successMessage) {
  hideMessage(workspaceMessage);
  setBusy(true);
  try {
    const result = await authedFetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ merchantId, notes })
    });
    showMessage(workspaceMessage, `${successMessage}. Ofertas sincronizadas: ${result.updatedOffers || 0}.`, "ok");
    // isVerified cambia → invalidamos el cache compartido por si el
    // admin pasa a Stats/Posts/Planes inmediatamente después.
    invalidateMerchantSearchCache();
    await loadPending();
  } catch (error) {
    showMessage(workspaceMessage, error.message || "No se pudo completar la acción.");
  } finally {
    setBusy(false);
  }
}

// ── Plans tab ────────────────────────────────────────────────────────────

function computePlanState(item) {
  const now = Date.now();
  const trialEnd = item.trialEndsAt || 0;
  const subEnd = item.subscriptionActiveUntil || 0;
  const status = (item.subscriptionStatus || "").toLowerCase();

  const isActive = (status === "trial" && trialEnd > now) ||
                   (status === "active" && subEnd > now);

  let primaryEnd = 0;
  let primaryLabel = "Sin fecha";
  if (status === "active" && subEnd) {
    primaryEnd = subEnd;
    primaryLabel = `Suscrito hasta ${formatDate(subEnd)}`;
  } else if (trialEnd) {
    primaryEnd = trialEnd;
    primaryLabel = `Trial hasta ${formatDate(trialEnd)}`;
  } else if (status === "active" && !subEnd) {
    primaryLabel = "Suscripción (sin fecha)";
  }

  let daysLeft = null;
  if (primaryEnd > now) {
    daysLeft = Math.ceil((primaryEnd - now) / (24 * 60 * 60 * 1000));
  }

  return {
    isActive,
    primaryLabel,
    daysLeft,
    status: status || "(legacy)",
  };
}

function renderPlanResults(items) {
  plansResults.innerHTML = "";
  plansEmpty.hidden = items.length > 0;
  if (!items.length) {
    plansEmpty.textContent = plansSearch.value.trim()
      ? "Sin resultados para esa búsqueda."
      : "No hay comercios para mostrar.";
    return;
  }

  items.forEach((item) => {
    const state = computePlanState(item);
    const row = document.createElement("article");
    row.className = `plan-row ${state.isActive ? "plan-active" : "plan-expired"}`;
    row.innerHTML = `
      <div class="plan-main">
        <h3 class="plan-name">${esc(item.name) || "(sin nombre)"}</h3>
        <p class="plan-sub">${esc(item.merchantId)}</p>
        <p class="plan-sub">${esc(item.phone) || "Sin teléfono"} · ${esc(item.addressText) || "Sin dirección"}</p>
      </div>
      <div class="plan-state">
        <span class="badge-status ${state.isActive ? "ok" : "warn"}">${state.isActive ? "Activo" : "Expirado"}</span>
        <strong>${esc(state.primaryLabel)}</strong>
        <span>${state.daysLeft != null ? `${state.daysLeft} día${state.daysLeft === 1 ? "" : "s"} restantes` : "—"} · status="${esc(state.status)}"</span>
      </div>
      <div class="plan-actions">
        <button class="btn-secondary" data-action-btn="true" data-plan-days="7">+7d</button>
        <button class="btn-secondary" data-action-btn="true" data-plan-days="30">+30d</button>
        <button class="btn-secondary" data-action-btn="true" data-plan-days="60">+60d</button>
        <button class="btn-secondary" data-action-btn="true" data-plan-days="90">+90d</button>
        <button class="btn-secondary" data-plan-custom>Personalizar…</button>
        <button class="btn-danger" data-action-btn="true" data-plan-off>Caducar</button>
      </div>
      <div class="plan-custom">
        <div>
          <label>Días</label>
          <input type="number" min="1" max="3650" step="1" placeholder="Ej. 45" data-custom-days>
        </div>
        <div>
          <label>O fecha (YYYY-MM-DD)</label>
          <input type="date" data-custom-date>
        </div>
        <button class="btn-primary" data-action-btn="true" data-plan-apply>Aplicar</button>
      </div>
    `;

    row.querySelectorAll("[data-plan-days]").forEach((btn) => {
      btn.addEventListener("click", () => extendMerchant(item, { days: Number(btn.dataset.planDays) }, btn));
    });

    row.querySelector("[data-plan-off]").addEventListener("click", () => {
      if (!confirm(`¿Caducar el plan de ${item.name || item.merchantId} inmediatamente?`)) return;
      extendMerchant(item, { off: true }, row.querySelector("[data-plan-off]"));
    });

    const customBtn = row.querySelector("[data-plan-custom]");
    customBtn.addEventListener("click", () => {
      row.classList.toggle("expanded");
    });

    const applyBtn = row.querySelector("[data-plan-apply]");
    applyBtn.addEventListener("click", () => {
      const daysInput = row.querySelector("[data-custom-days]");
      const dateInput = row.querySelector("[data-custom-date]");
      const daysVal = daysInput.value.trim();
      const dateVal = dateInput.value.trim();
      if (dateVal) {
        const parsed = new Date(dateVal + "T23:59:59");
        if (isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
          showMessage(plansMessage, "La fecha debe ser futura.");
          return;
        }
        extendMerchant(item, { untilMs: parsed.getTime() }, applyBtn);
        return;
      }
      if (daysVal) {
        const n = Number(daysVal);
        if (!Number.isFinite(n) || n <= 0 || n > 3650) {
          showMessage(plansMessage, "Días debe ser un entero entre 1 y 3650.");
          return;
        }
        extendMerchant(item, { days: n }, applyBtn);
        return;
      }
      showMessage(plansMessage, "Indica días o una fecha.");
    });

    plansResults.append(row);
  });
}

async function loadPlans(force = false) {
  if (plansLoaded && !force) return;
  hideMessage(plansMessage);
  const q = plansSearch.value.trim();
  // Si hay cache fresca, evitamos el flicker del estado de "cargando".
  const cacheHit = hasFreshMerchantCache(q);
  plansResults.innerHTML = "";
  plansEmpty.hidden = true;
  plansLoading.hidden = cacheHit;
  setBusy(true);
  try {
    const items = await fetchMerchantSearch(q);
    plansLoading.hidden = true;
    renderPlanResults(items);
    plansLoaded = true;
  } catch (error) {
    if (error.name === "AbortError") return;
    plansLoading.hidden = true;
    showMessage(plansMessage, error.message || "No se pudieron cargar los comercios.");
  } finally {
    setBusy(false);
  }
}

async function extendMerchant(item, payload, triggerBtn) {
  hideMessage(plansMessage);
  const originalText = triggerBtn?.textContent;
  if (triggerBtn) { triggerBtn.disabled = true; triggerBtn.textContent = "..."; }
  setBusy(true);
  try {
    const result = await authedFetch("adminExtendMerchantPlan", {
      method: "POST",
      body: JSON.stringify({ merchantId: item.merchantId, ...payload }),
    });
    const what = payload.off
      ? "caducado"
      : payload.untilMs
        ? `fijado al ${formatDate(payload.untilMs)}`
        : `+${payload.days} días aplicados`;
    showMessage(plansMessage, `${item.name || item.merchantId}: ${what}. Nuevo final: ${formatDate(result.trialEndsAt)}.`, "ok");
    // El comercio que acabamos de tocar va a tener trialEndsAt distinto
    // → cache stale. Limpiar para que loadPlans(true) traiga fresco.
    invalidateMerchantSearchCache();
    await loadPlans(true);
  } catch (error) {
    showMessage(plansMessage, error.message || "No se pudo aplicar la acción.");
  } finally {
    if (triggerBtn) { triggerBtn.disabled = false; if (originalText) triggerBtn.textContent = originalText; }
    setBusy(false);
  }
}

// ── Stats tab ────────────────────────────────────────────────────────────

function renderStatsPicker(items) {
  statsPicker.innerHTML = "";
  if (!items.length) {
    statsPicker.hidden = false;
    statsPicker.innerHTML = `<div class="empty" style="margin:0">Sin resultados.</div>`;
    return;
  }
  statsPicker.hidden = false;
  items.slice(0, 30).forEach((it) => {
    const row = document.createElement("div");
    row.className = "pick-row";
    row.innerHTML = `
      <div>
        <strong>${esc(it.name) || "(sin nombre)"}</strong>
        <div class="pick-sub">${esc(it.phone) || "Sin teléfono"} · ${esc(it.addressText) || "Sin dirección"}</div>
        <div class="pick-id">${esc(it.merchantId)}</div>
      </div>
      <div class="pick-sub">${it.isVerified ? "Verificado" : "No verificado"}</div>
    `;
    row.addEventListener("click", () => selectMerchantForStats({
      merchantId: it.merchantId,
      name: it.name || "",
    }, row));
    statsPicker.appendChild(row);
  });
}

async function searchMerchantsForStats() {
  const q = statsSearch.value.trim();
  hideMessage(statsMessage);
  const cacheHit = hasFreshMerchantCache(q);
  statsPickerLoading.hidden = cacheHit;
  if (!cacheHit) statsPicker.hidden = true;
  try {
    const items = await fetchMerchantSearch(q);
    statsPickerLoading.hidden = true;
    renderStatsPicker(items);
  } catch (error) {
    if (error.name === "AbortError") return;
    statsPickerLoading.hidden = true;
    statsPicker.hidden = true;
    showMessage(statsMessage, error.message || "No se pudo buscar comercios.");
  }
}

function selectMerchantForStats(merchant, sourceRow) {
  const anchorTop = sourceRow ? sourceRow.getBoundingClientRect().top : null;
  statsSelectedMerchant = merchant;
  statsPicker.hidden = true;
  statsDetail.hidden = false;
  statsMerchantName.textContent = merchant.name || "(sin nombre)";
  statsMerchantIdEl.textContent = merchant.merchantId;
  updateStatsDayButtons();
  alignDetailToAnchor(statsDetail, anchorTop);
  loadMerchantStats();
}

// Lleva el header del detalle al top del viewport tras colapsar el
// picker. requestAnimationFrame asegura que el reflow ya esté hecho.
function alignDetailToAnchor(detailEl /* , anchorTop */) {
  requestAnimationFrame(() => {
    detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function clearStatsSelection() {
  statsSelectedMerchant = null;
  statsDetail.hidden = true;
  statsContent.hidden = true;
  statsPicker.hidden = !statsPicker.children.length;
}

function updateStatsDayButtons() {
  statsPane.querySelectorAll("[data-stats-days]").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.statsDays) === statsDays);
  });
}

async function loadMerchantStats() {
  if (!statsSelectedMerchant) return;
  hideMessage(statsMessage);
  statsContent.hidden = true;
  statsLoading.hidden = false;
  setBusy(true);
  try {
    const data = await authedFetch(
      `adminMerchantStats?merchantId=${encodeURIComponent(statsSelectedMerchant.merchantId)}&days=${statsDays}`
    );
    statsLoading.hidden = true;
    if (data.merchantName) {
      statsMerchantName.textContent = data.merchantName;
      statsSelectedMerchant.name = data.merchantName;
    }
    renderStatsContent(data);
    statsContent.hidden = false;
  } catch (error) {
    statsLoading.hidden = true;
    showMessage(statsMessage, error.message || "No se pudieron cargar las estadísticas.");
  } finally {
    setBusy(false);
  }
}

function renderStatsContent(data) {
  const t = data.totals || {};
  const clicks = t.clicks || {};
  const uniq = data.uniqueUsersFromHistory || {};

  kpiImpressions.textContent = formatNumber(t.impressions || 0);
  kpiImpressionsRange.textContent = `${data.fromDate} → ${data.toDate}`;
  kpiCalls.textContent = formatNumber(clicks.call || 0);
  kpiUniqueCalls.textContent = `${formatNumber(uniq.call || 0)} usuarios únicos (lifetime)`;
  kpiDirections.textContent = formatNumber(clicks.directions || 0);
  kpiUniqueDirections.textContent = `${formatNumber(uniq.directions || 0)} usuarios únicos (lifetime)`;
  kpiShares.textContent = formatNumber(clicks.share || 0);
  kpiFavoritesCurrent.textContent = formatNumber(data.favoritesCurrent || 0);
  const net = t.favoritesNet || 0;
  const sign = net > 0 ? "+" : "";
  kpiFavoritesNet.textContent = `${sign}${formatNumber(net)} netos en la ventana`;

  renderStatsChart(data.daily || []);
}

function renderStatsChart(daily) {
  statsChart.innerHTML = "";
  if (!daily.length) {
    statsChart.innerHTML = `<div class="card-meta">Sin datos en la ventana seleccionada.</div>`;
    return;
  }
  // Escala compartida: el máximo de cualquier métrica entre todos los días.
  let max = 1;
  daily.forEach((d) => {
    const c = d.clicks || {};
    max = Math.max(max, d.impressions || 0, c.call || 0, c.directions || 0, c.share || 0);
  });

  // Cantidad de etiquetas visibles bajo el eje X (límite ~10 para no apelotonar).
  const labelStride = Math.max(1, Math.ceil(daily.length / 10));

  daily.forEach((d, idx) => {
    const c = d.clicks || {};
    const col = document.createElement("div");
    col.className = "stats-day";
    col.title = [
      d.date,
      `Impresiones: ${d.impressions || 0}`,
      `Llamadas: ${c.call || 0}`,
      `Cómo llegar: ${c.directions || 0}`,
      `Compartir: ${c.share || 0}`,
      `Favoritos (neto): ${d.favoritesNet ?? 0}`,
    ].join("\n");

    const inner = document.createElement("div");
    inner.style.cssText = "display:flex; align-items:flex-end; gap:2px; width:100%; height:100%;";
    const bars = [
      { cls: "impressions", val: d.impressions || 0 },
      { cls: "calls", val: c.call || 0 },
      { cls: "directions", val: c.directions || 0 },
      { cls: "shares", val: c.share || 0 },
    ];
    bars.forEach((b) => {
      const bar = document.createElement("div");
      bar.className = `bar ${b.cls}`;
      const pct = max > 0 ? (b.val / max) * 100 : 0;
      bar.style.height = `${pct}%`;
      bar.style.flex = "1";
      inner.appendChild(bar);
    });
    col.appendChild(inner);

    if (idx % labelStride === 0 || idx === daily.length - 1) {
      const label = document.createElement("span");
      label.className = "day-label";
      // mostrar MM-DD para ahorrar espacio
      label.textContent = (d.date || "").slice(5);
      col.appendChild(label);
    }
    statsChart.appendChild(col);
  });
}

function formatNumber(n) {
  return new Intl.NumberFormat("es-ES").format(Math.trunc(n));
}

function renderPostsPicker(items) {
  postsPicker.innerHTML = "";
  if (!items.length) {
    postsPicker.hidden = false;
    postsPicker.innerHTML = `<div class="empty" style="margin:0">Sin resultados.</div>`;
    return;
  }
  postsPicker.hidden = false;
  items.slice(0, 30).forEach((it) => {
    const row = document.createElement("div");
    row.className = "pick-row";
    row.innerHTML = `
      <div>
        <strong>${esc(it.name) || "(sin nombre)"}</strong>
        <div class="pick-sub">${esc(it.phone) || "Sin teléfono"} · ${esc(it.addressText) || "Sin dirección"}</div>
        <div class="pick-id">${esc(it.merchantId)}</div>
      </div>
      <div class="pick-sub">${it.isVerified ? "Verificado" : "No verificado"}</div>
    `;
    row.addEventListener("click", () => selectMerchantForPosts({
      merchantId: it.merchantId,
      name: it.name || "",
    }, row));
    postsPicker.appendChild(row);
  });
}

async function searchMerchantsForPosts() {
  const q = postsSearch.value.trim();
  hideMessage(postsMessage);
  const cacheHit = hasFreshMerchantCache(q);
  postsPickerLoading.hidden = cacheHit;
  if (!cacheHit) postsPicker.hidden = true;
  try {
    const items = await fetchMerchantSearch(q);
    postsPickerLoading.hidden = true;
    renderPostsPicker(items);
  } catch (error) {
    if (error.name === "AbortError") return;
    postsPickerLoading.hidden = true;
    postsPicker.hidden = true;
    showMessage(postsMessage, error.message || "No se pudo buscar comercios.");
  }
}

function selectMerchantForPosts(merchant, sourceRow) {
  const anchorTop = sourceRow ? sourceRow.getBoundingClientRect().top : null;
  postsSelectedMerchant = merchant;
  postsPicker.hidden = true;
  postsDetail.hidden = false;
  postsMerchantName.textContent = merchant.name || "(sin nombre)";
  postsMerchantIdEl.textContent = merchant.merchantId;
  alignDetailToAnchor(postsDetail, anchorTop);
  loadMerchantPosts();
}

function clearPostsSelection() {
  postsSelectedMerchant = null;
  postsDetail.hidden = true;
  postsList.innerHTML = "";
  postsEmpty.hidden = true;
  postsPicker.hidden = !postsPicker.children.length;
}

async function loadMerchantPosts() {
  if (!postsSelectedMerchant) return;
  hideMessage(postsMessage);
  postsList.innerHTML = "";
  postsEmpty.hidden = true;
  postsLoading.hidden = false;
  setBusy(true);
  try {
    const params = new URLSearchParams({
      merchantId: postsSelectedMerchant.merchantId,
    });
    if (postsIncludeExpired.checked) params.set("includeExpired", "true");
    const data = await authedFetch(`adminListMerchantOffers?${params.toString()}`);
    postsLoading.hidden = true;
    if (data.merchantName) {
      postsMerchantName.textContent = data.merchantName;
      postsSelectedMerchant.name = data.merchantName;
    }
    renderPostsList(data.items || []);
  } catch (error) {
    postsLoading.hidden = true;
    showMessage(postsMessage, error.message || "No se pudieron cargar las publicaciones.");
  } finally {
    setBusy(false);
  }
}

function renderPostsList(items) {
  postsList.innerHTML = "";
  if (!items.length) {
    postsEmpty.hidden = false;
    return;
  }
  postsEmpty.hidden = true;
  items.forEach((it) => {
    postsList.appendChild(buildPostRow(it));
  });
}

function buildPostRow(item) {
  const row = document.createElement("div");
  row.className = "post-row";

  const thumb = document.createElement("div");
  thumb.className = "post-thumb";
  if (item.imageUrl) {
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = item.title || "Publicación";
    img.src = item.imageUrl;
    thumb.appendChild(img);
  } else {
    thumb.textContent = "Sin imagen";
  }

  const main = document.createElement("div");
  main.className = "post-main";
  const priceText = item.price != null && item.price !== ""
    ? `${item.price} ${esc(item.currency || "EUR")}`
    : "Sin precio";
  const created = item.createdAt ? formatDate(item.createdAt) : "—";
  // adminListMerchantOffers no serializa expiresAt: la caducidad se computa
  // en el backend y llega ya resuelta en isActive.
  const isActive = item.isActive === true;

  main.innerHTML = `
    <h4 class="post-title">${esc(item.title) || "(sin título)"}</h4>
    <p class="post-meta">${esc(priceText)} · Publicada ${esc(created)}</p>
    ${item.description ? `<p class="post-desc">${esc(item.description)}</p>` : ""}
    <div class="post-badges">
      <span class="post-badge ${isActive ? "active" : "expired"}">${isActive ? "Activa" : "Vencida"}</span>
      ${item.isPermanent ? `<span class="post-badge">Permanente</span>` : ""}
      ${item.offerType ? `<span class="post-badge">${esc(item.offerType)}</span>` : ""}
      <span class="post-badge">ID ${esc(item.offerId)}</span>
    </div>
  `;

  const actions = document.createElement("div");
  actions.className = "post-actions";

  const viewBtn = document.createElement("a");
  viewBtn.className = "btn-secondary";
  viewBtn.target = "_blank";
  viewBtn.rel = "noopener noreferrer";
  viewBtn.href = `/o/${encodeURIComponent(item.offerId)}`;
  viewBtn.textContent = "Ver";
  actions.appendChild(viewBtn);

  const delBtn = document.createElement("button");
  delBtn.className = "btn-danger";
  delBtn.dataset.actionBtn = "true";
  delBtn.textContent = "Eliminar";
  delBtn.addEventListener("click", () => deletePost(item, delBtn));
  actions.appendChild(delBtn);

  row.appendChild(thumb);
  row.appendChild(main);
  row.appendChild(actions);
  return row;
}

async function deletePost(item, triggerBtn) {
  if (!postsSelectedMerchant) return;
  const titleLabel = item.title || `oferta ${item.offerId}`;
  const reason = window.prompt(
    `Vas a eliminar la publicación "${titleLabel}".\n\nMotivo (queda registrado en logs):`,
    "Infringe política de Zampa",
  );
  if (reason === null) return;
  const trimmed = reason.trim();
  if (!trimmed) {
    showMessage(postsMessage, "Se requiere un motivo para eliminar la publicación.");
    return;
  }
  if (!window.confirm(`¿Confirmas eliminar "${titleLabel}"? Esta acción es definitiva.`)) return;

  hideMessage(postsMessage);
  const previousLabel = triggerBtn.textContent;
  triggerBtn.disabled = true;
  triggerBtn.textContent = "Eliminando...";
  setBusy(true);
  try {
    await authedFetch("adminDeleteMerchantOffer", {
      method: "POST",
      body: JSON.stringify({
        merchantId: postsSelectedMerchant.merchantId,
        offerId: item.offerId,
        reason: trimmed,
      }),
    });
    showMessage(postsMessage, `Publicación "${titleLabel}" eliminada.`, "ok");
    await loadMerchantPosts();
  } catch (error) {
    triggerBtn.disabled = false;
    triggerBtn.textContent = previousLabel;
    showMessage(postsMessage, error.message || "No se pudo eliminar la publicación.");
  } finally {
    setBusy(false);
  }
}

function switchTab(tab) {
  if (!allowedTabs.includes(tab)) tab = "verifications";
  activeTab = tab;
  tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  verificationsPane.hidden = tab !== "verifications";
  plansPane.hidden = tab !== "plans";
  statsPane.hidden = tab !== "stats";
  postsPane.hidden = tab !== "posts";
  if (tab === "plans") {
    tabEyebrow.textContent = "Gestión de planes";
    tabTitle.textContent = "Extender plan gratuito";
    loadPlans();
  } else if (tab === "stats") {
    tabEyebrow.textContent = "Métricas de comercios";
    tabTitle.textContent = "Stats por comercio";
    // Si no hay merchant seleccionado y la lista está vacía, hacemos una búsqueda inicial.
    if (!statsSelectedMerchant && !statsPicker.children.length) {
      searchMerchantsForStats();
    }
  } else if (tab === "posts") {
    tabEyebrow.textContent = "Moderación de contenido";
    tabTitle.textContent = "Publicaciones de comercios";
    if (!postsSelectedMerchant && !postsPicker.children.length) {
      searchMerchantsForPosts();
    }
  } else {
    tabEyebrow.textContent = "Bandeja de revisión";
    tabTitle.textContent = "Verificaciones de comercios";
  }
  syncUrlState();
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

plansSearch.addEventListener("input", () => {
  if (plansSearchDebounce) clearTimeout(plansSearchDebounce);
  plansSearchDebounce = setTimeout(() => { loadPlans(true); }, 180);
});

statsSearch.addEventListener("input", () => {
  if (statsSearchDebounce) clearTimeout(statsSearchDebounce);
  statsSearchDebounce = setTimeout(() => { searchMerchantsForStats(); }, 180);
});

statsPane.querySelectorAll("[data-stats-days]").forEach((btn) => {
  btn.addEventListener("click", () => {
    statsDays = Number(btn.dataset.statsDays) || 30;
    updateStatsDayButtons();
    loadMerchantStats();
  });
});

// Vuelve del detalle a la lista de resultados del picker y scrollea
// al input de búsqueda para que el usuario vea de inmediato dónde está.
function returnToList(tab) {
  if (tab === "posts") {
    clearPostsSelection();
    if (!postsPicker.children.length) searchMerchantsForPosts();
    requestAnimationFrame(() => {
      postsSearch.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  } else if (tab === "stats") {
    clearStatsSelection();
    if (!statsPicker.children.length) searchMerchantsForStats();
    requestAnimationFrame(() => {
      statsSearch.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

statsClearBtn.addEventListener("click", () => returnToList("stats"));

postsSearch.addEventListener("input", () => {
  if (postsSearchDebounce) clearTimeout(postsSearchDebounce);
  postsSearchDebounce = setTimeout(() => { searchMerchantsForPosts(); }, 180);
});

postsClearBtn.addEventListener("click", () => returnToList("posts"));

postsIncludeExpired.addEventListener("change", () => {
  if (postsSelectedMerchant) loadMerchantPosts();
});

loginBtn.addEventListener("click", async () => {
  hideMessage(loginMessage);
  setBusy(true);
  try {
    await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
    passwordInput.value = "";
  } catch (error) {
    showMessage(loginMessage, humanizeAuthError(error));
  } finally {
    setBusy(false);
  }
});

googleBtn.addEventListener("click", async () => {
  hideMessage(loginMessage);
  setBusy(true);
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    showMessage(loginMessage, humanizeAuthError(error));
  } finally {
    setBusy(false);
  }
});

refreshBtn.addEventListener("click", () => {
  if (activeTab === "plans") {
    loadPlans(true);
  } else if (activeTab === "stats") {
    if (statsSelectedMerchant) loadMerchantStats();
    else searchMerchantsForStats();
  } else if (activeTab === "posts") {
    if (postsSelectedMerchant) loadMerchantPosts();
    else searchMerchantsForPosts();
  } else {
    loadPending();
  }
});

closeDetailBtn.addEventListener("click", closeDetail);
detailModal.addEventListener("click", (event) => {
  if (event.target === detailModal) closeDetail();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  // 1. Si está abierta la modal de detalle de verificación, ciérrala.
  if (!detailModal.hidden) {
    closeDetail();
    return;
  }
  // 2. Si el usuario está escribiendo en un input, solo le quitamos
  //    el foco — no queremos sacarlo del detalle por accidente.
  const tag = (event.target?.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea") {
    event.target.blur();
    return;
  }
  // 3. En Publicaciones o Stats, si hay un merchant seleccionado,
  //    Esc vuelve a la lista.
  if (activeTab === "posts" && postsSelectedMerchant) {
    returnToList("posts");
  } else if (activeTab === "stats" && statsSelectedMerchant) {
    returnToList("stats");
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
  hideMessage(loginMessage);
  hideMessage(workspaceMessage);
  hideMessage(plansMessage);
  hideMessage(statsMessage);
  hideMessage(postsMessage);

  if (!user) {
    loginCard.hidden = false;
    workspace.hidden = true;
    cards.innerHTML = "";
    plansResults.innerHTML = "";
    plansLoaded = false;
    statsPicker.innerHTML = "";
    statsPicker.hidden = true;
    clearStatsSelection();
    postsPicker.innerHTML = "";
    postsPicker.hidden = true;
    postsIncludeExpired.checked = false;
    clearPostsSelection();
    return;
  }

  loginCard.hidden = true;
  workspace.hidden = false;
  sessionLabel.textContent = `Sesión: ${user.email || user.uid}`;
  switchTab(activeTab);
  if (activeTab === "verifications") {
    await loadPending();
  }
});
