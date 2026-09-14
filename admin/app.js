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
const ingestPane = document.getElementById("ingestPane");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabTitle = document.getElementById("tabTitle");
const tabEyebrow = document.getElementById("tabEyebrow");

let allItems = [];
let activeFilter = new URLSearchParams(window.location.search).get("status") || "pending";
let searchTerm = (new URLSearchParams(window.location.search).get("q") || "").trim().toLowerCase();
let activeView = new URLSearchParams(window.location.search).get("view") || localStorage.getItem("adminView") || "cards";
if (!["cards", "list"].includes(activeView)) activeView = "cards";

const allowedTabs = ["verifications", "plans", "stats", "posts", "ingest"];
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
  // Dentro de su pestaña: colgada de la barra superior se veía en todas.
  verificationsPane.prepend(controlStrip);

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
      const candidateCount = placeholderCandidates(item).length;
      if (candidateCount) {
        const candidatesBtn = document.createElement("button");
        candidatesBtn.className = "link-btn";
        candidatesBtn.textContent = `Ya detectado (${candidateCount})`;
        candidatesBtn.addEventListener("click", () => openDetail(item));
        row.querySelector(".list-actions").append(candidatesBtn);
      }
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
    article.append(detailGrid);
    if (placeholderCandidates(item).length) article.append(buildCandidatesBlock(item));
    article.append(stack);
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
  if (placeholderCandidates(item).length) {
    detailContent.querySelector(".modal-grid > .stack:last-child").append(buildCandidatesBlock(item));
  }
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

// ── Menús detectados tab ──────────────────────────────────────────────────────────
// Menús leídos de fuentes oficiales (web, PDF, Facebook, Instagram) y los
// restaurantes no registrados que se dan de alta para publicarlos. Las reglas
// de verdad (qué publica, qué exige revisión) viven en el backend: aquí sólo
// se enseñan y se piden las acciones.

const SOURCE_TYPE_LABELS = {
  official_web: "Web oficial",
  official_pdf: "PDF en su web",
  official_facebook: "Facebook oficial",
  official_instagram: "Instagram oficial",
};

const SOURCE_TYPE_SHORT = {
  official_web: "Web",
  official_pdf: "PDF",
  official_facebook: "Facebook",
  official_instagram: "Instagram",
};

const SOCIAL_SOURCE_TYPES = new Set(["official_facebook", "official_instagram"]);

const DEFAULT_PARSER_BY_TYPE = {
  official_web: "generic_html",
  official_pdf: "generic_pdf",
  official_facebook: "manual",
  official_instagram: "manual",
};

const OBSERVATION_STATUS_LABELS = {
  pending_review: "Pendiente",
  detected: "Descartada",
  published: "Publicada",
  rejected: "Rechazada",
  stale: "Caducada",
};

const VERIFICATION_LABELS = {
  official_domain_link: "Enlazada desde su web",
  manual_verified: "Verificada a mano",
  business_claimed: "Reclamada por el restaurante",
};

const EXTRACTED_FROM_LABELS = {
  image_ocr: "Leído de imagen",
  pdf: "Leído de PDF",
  mixed: "Texto e imagen",
};

// Por qué la regla no deja publicar (`shouldPublishObservation`).
const PUBLISH_REASON_LABELS = {
  not_approved: "primero hay que aprobarla",
  missing_observation: "la observación ya no existe",
  source_not_official: "la fuente no es de un tipo oficial",
  observation_rejected: "está rechazada",
  social_source_not_verified: "la cuenta social no tiene verificación",
  missing_publication_url: "falta el enlace a la publicación",
  social_post_not_current: "el post no tiene señales de ser de hoy",
  menu_date_not_today: "el menú no es de hoy",
  no_daily_menu_signal: "el texto no parece un menú del día",
  no_price: "no se ha encontrado el precio",
  duplicate_active_offer: "el comercio ya tiene una oferta activa hoy",
  source_disabled: "la fuente está desactivada",
  social_requires_review: "una fuente social siempre pasa por revisión",
  manual_review_required: "la fuente pide revisión humana",
  generic_parser_needs_review: "la lectura de página entera siempre pasa por revisión",
  low_confidence: "la confianza de la lectura es baja",
  auto_publish_disabled: "la fuente no publica sola",
};

const CLAIM_REASON_LABELS = {
  placeholder_not_found: "el restaurante detectado ya no existe",
  merchant_not_found: "el comercio ya no existe",
  same_document: "son la misma ficha",
  already_claimed: "ese restaurante detectado ya lo reclamó otro comercio",
  not_a_placeholder: "esa ficha no es un restaurante detectado",
  merchant_is_placeholder: "el comercio también es un restaurante detectado",
  merchant_not_verified: "primero hay que aprobar al comercio",
};

const CANDIDATE_SIGNAL_LABELS = {
  place_id: "Mismo sitio de Google",
  name_and_distance: "Mismo nombre y a poca distancia",
  name_and_city: "Mismo nombre y misma ciudad",
  fuzzy_name_and_distance: "Nombre parecido y a poca distancia",
};

const CLAIM_FIELD_LABELS = {
  website: "web",
  shortDescription: "descripción",
};

const ingestMessage = document.getElementById("ingestMessage");
const ingestViewButtons = document.querySelectorAll("[data-ingest-view]");
const ingestStatusFilters = document.getElementById("ingestStatusFilters");
const ingestStatusButtons = document.querySelectorAll("[data-ingest-status]");
const ingestHint = document.getElementById("ingestHint");
const ingestQueue = document.getElementById("ingestQueue");
const ingestQueueLoading = document.getElementById("ingestQueueLoading");
const ingestQueueEmpty = document.getElementById("ingestQueueEmpty");
const ingestQueueList = document.getElementById("ingestQueueList");
const ingestQueueMore = document.getElementById("ingestQueueMore");
const ingestSources = document.getElementById("ingestSources");
const ingestSourcesLoading = document.getElementById("ingestSourcesLoading");
const ingestSourcesEmpty = document.getElementById("ingestSourcesEmpty");
const ingestSourcesList = document.getElementById("ingestSourcesList");
const ingestSourcesMore = document.getElementById("ingestSourcesMore");
const ingestNewSourceBtn = document.getElementById("ingestNewSourceBtn");
const sourceForm = document.getElementById("sourceForm");
const sourceFormTitle = document.getElementById("sourceFormTitle");
const sourceTypeInput = document.getElementById("sourceTypeInput");
const sourceParserInput = document.getElementById("sourceParserInput");
const sourceUrlInput = document.getElementById("sourceUrlInput");
const sourceBusinessModeInputs = document.querySelectorAll("input[name='sourceBusinessMode']");
const sourceBusinessExisting = document.getElementById("sourceBusinessExisting");
const sourceBusinessSearch = document.getElementById("sourceBusinessSearch");
const sourceBusinessPicker = document.getElementById("sourceBusinessPicker");
const sourceBusinessSelected = document.getElementById("sourceBusinessSelected");
const sourceBusinessNew = document.getElementById("sourceBusinessNew");
const bizNameInput = document.getElementById("bizNameInput");
const bizAddressInput = document.getElementById("bizAddressInput");
const bizLatInput = document.getElementById("bizLatInput");
const bizLngInput = document.getElementById("bizLngInput");
const bizPhoneInput = document.getElementById("bizPhoneInput");
const bizWebsiteInput = document.getElementById("bizWebsiteInput");
const sourceSocialFieldset = document.getElementById("sourceSocialFieldset");
const sourceVerificationInput = document.getElementById("sourceVerificationInput");
const sourceUsernameInput = document.getElementById("sourceUsernameInput");
const sourceAccountIdInput = document.getElementById("sourceAccountIdInput");
const sourcePollingInput = document.getElementById("sourcePollingInput");
const sourceEnabledInput = document.getElementById("sourceEnabledInput");
const sourceAutoPublishInput = document.getElementById("sourceAutoPublishInput");
const sourceManualReviewInput = document.getElementById("sourceManualReviewInput");
const sourceSocialLockHint = document.getElementById("sourceSocialLockHint");
const sourceCancelBtn = document.getElementById("sourceCancelBtn");

let ingestView = "queue";
let ingestStatus = "pending_review";
let ingestLoaded = false;
let ingestQueueCursor = null;
let ingestSourcesCursor = null;
// Un cambio de filtro mientras carga la página anterior no puede pintar
// resultados viejos debajo de los nuevos.
let ingestQueueRequest = 0;
let ingestSourcesRequest = 0;
let sourceFormOriginal = null;
let sourceFormBusiness = null;
let sourceBusinessSearchDebounce = null;
const businessNames = new Map();

/** Sólo enlaces http(s): lo que llega de una fuente externa no se pinta como href a ciegas. */
function safeHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch (_) {
    return null;
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
}

function formatYmd(ymd) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || "");
  if (!match) return ymd || "—";
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(date);
}

function formatDistance(meters) {
  return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

function businessLabel(businessId) {
  return businessNames.get(businessId) || businessId || "(sin comercio)";
}

/**
 * Los listados traen `businessId`, no el nombre. Una búsqueda sin filtro cubre
 * a todos mientras haya pocos comercios; lo que no salga ahí se busca por id.
 * Si falla, se enseña el id: no merece bloquear la revisión.
 */
async function resolveBusinessNames(ids) {
  const missing = [...new Set(ids.filter(Boolean))].filter((id) => !businessNames.has(id));
  if (!missing.length) return;
  try {
    const { items = [] } = await authedFetch("adminSearchMerchants");
    items.forEach((it) => { if (it.name) businessNames.set(it.merchantId, it.name); });
    const stillMissing = missing.filter((id) => !businessNames.has(id));
    await Promise.all(stillMissing.map(async (id) => {
      const { items: found = [] } = await authedFetch(`adminSearchMerchants?q=${encodeURIComponent(id)}`);
      const hit = found.find((it) => it.merchantId === id);
      if (hit && hit.name) businessNames.set(id, hit.name);
    }));
  } catch (_) {
    // Se queda el id.
  }
}

function createButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.dataset.actionBtn = "true";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function createExternalLink(label, href) {
  const link = document.createElement("a");
  link.className = "btn-secondary";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.href = href;
  link.textContent = label;
  return link;
}

function setIngestView(view) {
  ingestView = view === "sources" ? "sources" : "queue";
  ingestViewButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.ingestView === ingestView));
  ingestQueue.hidden = ingestView !== "queue";
  ingestStatusFilters.hidden = ingestView !== "queue";
  ingestSources.hidden = ingestView !== "sources";
  ingestHint.innerHTML = ingestView === "queue"
    ? "Menús leídos de fuentes oficiales. <strong>Aprobar no publica</strong>: aprueba, revisa y luego pulsa <strong>Publicar</strong>. Una fuente de Facebook o Instagram nunca publica sola."
    : "Cada fuente es la página de <strong>un</strong> restaurante, escrita por él. <strong>Inspeccionar</strong> la lee ahora y deja la lectura en la cola de revisión.";
  hideMessage(ingestMessage);
  loadIngestView();
}

function loadIngestView() {
  if (ingestView === "sources") loadIngestSources();
  else loadIngestQueue();
}

// ── Cola de revisión ──

async function loadIngestQueue({ append = false } = {}) {
  const request = ++ingestQueueRequest;
  if (!append) {
    ingestQueueList.innerHTML = "";
    ingestQueueCursor = null;
  }
  ingestQueueEmpty.hidden = true;
  ingestQueueMore.hidden = true;
  ingestQueueLoading.hidden = false;
  setBusy(true);
  try {
    const params = new URLSearchParams({ limit: "30" });
    if (ingestStatus) params.set("status", ingestStatus);
    if (append && ingestQueueCursor != null) params.set("cursor", String(ingestQueueCursor));
    const { items = [], nextCursor = null } = await authedFetch(`adminListMenuObservations?${params.toString()}`);
    items.forEach((it) => { if (it.businessName && !businessNames.has(it.businessId)) businessNames.set(it.businessId, it.businessName); });
    await resolveBusinessNames(items.map((it) => it.businessId));
    if (request !== ingestQueueRequest) return;
    items.forEach((it) => ingestQueueList.appendChild(buildObservationRow(it)));
    ingestQueueCursor = nextCursor;
    ingestQueueMore.hidden = nextCursor == null;
    ingestQueueEmpty.hidden = ingestQueueList.children.length > 0;
  } catch (error) {
    if (request !== ingestQueueRequest) return;
    showMessage(ingestMessage, error.message || "No se pudieron cargar las observaciones.");
  } finally {
    if (request === ingestQueueRequest) ingestQueueLoading.hidden = true;
    setBusy(false);
  }
}

function observationStatusClass(status) {
  if (status === "published") return "active";
  if (status === "rejected") return "expired";
  if (status === "pending_review") return "warn";
  return "";
}

function buildObservationRow(item) {
  const row = document.createElement("article");
  row.className = "post-row ingest-row";

  const thumb = document.createElement("div");
  thumb.className = "post-thumb";
  const image = (item.mediaUrls || []).map(safeHttpUrl).find(Boolean);
  if (image) {
    const link = document.createElement("a");
    link.href = image;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = "Imagen de la publicación";
    img.referrerPolicy = "no-referrer";
    img.src = image;
    link.appendChild(img);
    thumb.appendChild(link);
  } else {
    thumb.textContent = SOURCE_TYPE_SHORT[item.sourceType] || "Fuente";
  }

  const status = item.status || "detected";
  const review = item.review || null;
  const approved = review?.decision === "approved";
  const confidence = typeof item.confidence === "number" ? `${Math.round(item.confidence * 100)} %` : "—";
  const lowConfidence = typeof item.confidence === "number" && item.confidence < 0.7;
  const sourceLabel = item.sourceLabel || SOURCE_TYPE_LABELS[item.sourceType] || item.sourceType || "Fuente";

  const main = document.createElement("div");
  main.className = "post-main";
  main.innerHTML = `
    <h4 class="post-title">${esc(businessLabel(item.businessId))}</h4>
    <p class="post-meta">${esc(sourceLabel)} · Menú del ${esc(formatYmd(item.menuDate))} · Leído ${esc(formatDate(item.retrievedAt))}</p>
    <div class="post-badges">
      <span class="post-badge ${observationStatusClass(status)}">${esc(OBSERVATION_STATUS_LABELS[status] || status)}</span>
      <span class="post-badge ${item.price != null ? "" : "warn"}">${item.price != null ? esc(formatPrice(item.price)) : "Sin precio"}</span>
      <span class="post-badge ${lowConfidence ? "warn" : ""}">Confianza ${esc(confidence)}</span>
      <span class="post-badge">${Number(item.dishCount) || 0} platos</span>
      ${item.hasDailyMenuSignal ? "" : `<span class="post-badge warn">Sin señal de menú del día</span>`}
      ${EXTRACTED_FROM_LABELS[item.extractedFrom] ? `<span class="post-badge">${esc(EXTRACTED_FROM_LABELS[item.extractedFrom])}</span>` : ""}
      ${review ? `<span class="post-badge ${approved ? "active" : "expired"}">${approved ? "Aprobada" : "Rechazada"} por ${esc(review.by) || "—"}</span>` : ""}
    </div>
    ${item.publicationCreatedAt ? `<p class="ingest-caption">Publicado en la fuente el ${esc(formatDate(item.publicationCreatedAt))}</p>` : ""}
    ${item.sourceCaption ? `<p class="ingest-caption">Texto del post: ${esc(item.sourceCaption)}</p>` : ""}
    <pre class="ingest-menu">${esc(item.menuText) || "(sin texto)"}</pre>
    ${review?.notes ? `<p class="ingest-caption">Nota de revisión: ${esc(review.notes)}</p>` : ""}
  `;

  const actions = document.createElement("div");
  actions.className = "post-actions";
  const publicationUrl = safeHttpUrl(item.publicationUrl) || safeHttpUrl(item.sourceUrl);
  if (publicationUrl) actions.appendChild(createExternalLink("Abrir publicación", publicationUrl));

  if (status === "published") {
    if (item.publishedOfferId) {
      actions.appendChild(createExternalLink("Ver oferta", `/o/${encodeURIComponent(item.publishedOfferId)}`));
    }
  } else {
    const notesBox = document.createElement("div");
    notesBox.className = "ingest-review";
    const notes = document.createElement("textarea");
    notes.placeholder = "Nota interna (opcional): por qué se aprueba o se rechaza";
    notesBox.appendChild(notes);
    main.appendChild(notesBox);

    if (approved) {
      actions.appendChild(createButton("Publicar", "btn-primary", () => publishObservation(item)));
    } else {
      actions.appendChild(createButton("Aprobar", "btn-success", () => reviewObservation(item, "approve", notes.value)));
    }
    if (status !== "rejected") {
      actions.appendChild(createButton("Rechazar", "btn-danger", () => reviewObservation(item, "reject", notes.value)));
    }
  }

  row.append(thumb, main, actions);
  return row;
}

async function reviewObservation(item, action, notes) {
  hideMessage(ingestMessage);
  const label = businessLabel(item.businessId);
  setBusy(true);
  try {
    await authedFetch("adminReviewMenuObservation", {
      method: "POST",
      body: JSON.stringify({ observationId: item.id, action, notes }),
    });
    await loadIngestQueue();
    showMessage(ingestMessage, action === "approve"
      ? `Aprobada la lectura de ${label}. Todavía no está publicada: búscala en Pendientes y pulsa Publicar.`
      : `Rechazada la lectura de ${label}.`, "ok");
  } catch (error) {
    showMessage(ingestMessage, error.message || "No se pudo guardar la revisión.");
  } finally {
    setBusy(false);
  }
}

async function publishObservation(item) {
  const label = businessLabel(item.businessId);
  const sourceLabel = item.sourceLabel || "Fuente oficial";
  if (!confirm(`¿Publicar hoy el menú de ${label} en Zampa?\n\nSaldrá en el feed con la etiqueta «${sourceLabel}».`)) return;
  hideMessage(ingestMessage);
  setBusy(true);
  try {
    const result = await authedFetch("adminPublishMenuObservation", {
      method: "POST",
      body: JSON.stringify({ observationId: item.id }),
    });
    await loadIngestQueue();
    if (result.published) {
      showMessage(ingestMessage, `Publicado el menú de ${label}. Oferta ${result.offerId}.${result.createdBusiness ? " Es su primer menú: el restaurante ya aparece en la app." : ""}`, "ok");
    } else {
      showMessage(ingestMessage, `No se ha publicado el menú de ${label}: ${PUBLISH_REASON_LABELS[result.reason] || result.reason}.`);
    }
  } catch (error) {
    showMessage(ingestMessage, error.message || "No se pudo publicar.");
  } finally {
    setBusy(false);
  }
}

// ── Fuentes ──

async function loadIngestSources({ append = false } = {}) {
  const request = ++ingestSourcesRequest;
  if (!append) {
    ingestSourcesList.innerHTML = "";
    ingestSourcesCursor = null;
  }
  ingestSourcesEmpty.hidden = true;
  ingestSourcesMore.hidden = true;
  ingestSourcesLoading.hidden = false;
  setBusy(true);
  try {
    const params = new URLSearchParams({ limit: "50" });
    if (append && ingestSourcesCursor != null) params.set("cursor", String(ingestSourcesCursor));
    const { items = [], nextCursor = null } = await authedFetch(`adminListMenuSources?${params.toString()}`);
    // Un restaurante sin ficha todavía sólo tiene nombre en el alta guardada en su fuente.
    items.forEach((it) => { if (it.businessDraft?.name && !businessNames.has(it.businessId)) businessNames.set(it.businessId, it.businessDraft.name); });
    await resolveBusinessNames(items.map((it) => it.businessId));
    if (request !== ingestSourcesRequest) return;
    items.forEach((it) => ingestSourcesList.appendChild(buildSourceRow(it)));
    ingestSourcesCursor = nextCursor;
    ingestSourcesMore.hidden = nextCursor == null;
    ingestSourcesEmpty.hidden = ingestSourcesList.children.length > 0;
  } catch (error) {
    if (request !== ingestSourcesRequest) return;
    showMessage(ingestMessage, error.message || "No se pudieron cargar las fuentes.");
  } finally {
    if (request === ingestSourcesRequest) ingestSourcesLoading.hidden = true;
    setBusy(false);
  }
}

function buildSourceRow(source) {
  const row = document.createElement("article");
  row.className = "post-row ingest-row";

  const thumb = document.createElement("div");
  thumb.className = "post-thumb";
  thumb.textContent = SOURCE_TYPE_SHORT[source.type] || "Fuente";

  const enabled = source.enabled !== false;
  const url = safeHttpUrl(source.url);
  const main = document.createElement("div");
  main.className = "post-main";
  main.innerHTML = `
    <h4 class="post-title">${esc(businessLabel(source.businessId))}</h4>
    <p class="post-meta">${esc(SOURCE_TYPE_LABELS[source.type] || source.type)} · lectura ${esc(source.parserType) || "—"}</p>
    <p class="post-meta">${esc(source.url)}</p>
    <div class="post-badges">
      <span class="post-badge ${enabled ? "active" : "expired"}">${enabled ? "Activa" : "Desactivada"}</span>
      ${source.businessDraft ? `<span class="post-badge warn">Aún no está en la app</span>` : ""}
      <span class="post-badge ${source.autoPublishEnabled ? "warn" : ""}">${source.autoPublishEnabled ? "Publica sola" : "No publica sola"}</span>
      ${source.verificationMethod ? `<span class="post-badge">${esc(VERIFICATION_LABELS[source.verificationMethod] || source.verificationMethod)}</span>` : ""}
      ${source.platformUsername ? `<span class="post-badge">@${esc(source.platformUsername)}</span>` : ""}
      <span class="post-badge">${source.lastCheckedAt ? `Leída ${esc(formatDate(source.lastCheckedAt))}` : "Nunca leída"}</span>
    </div>
    ${source.lastError ? `<p class="ingest-caption" style="color:var(--danger)">Último error: ${esc(source.lastError)}</p>` : ""}
  `;

  const actions = document.createElement("div");
  actions.className = "post-actions";
  if (url) actions.appendChild(createExternalLink("Abrir", url));
  if (enabled) {
    actions.appendChild(createButton("Inspeccionar", "btn-primary", () => toggleInspectPanel(row, source)));
  }
  actions.appendChild(createButton("Editar", "btn-secondary", () => openSourceForm(source)));
  if (enabled) {
    actions.appendChild(createButton("Desactivar", "btn-danger", () => disableSource(source)));
  }

  row.append(thumb, main, actions);
  return row;
}

// La captura se manda como la foto de una pizarra desde la app: JPEG de 1280 px
// como mucho. El backend rechaza más de 2 MB.
const PHOTO_MAX_SIDE = 1280;
const PHOTO_MAX_BYTES = 2 * 1024 * 1024;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo abrir la imagen."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("El archivo no es una imagen que el navegador sepa abrir."));
    img.src = src;
  });
}

async function imageToJpegBase64(file) {
  const img = await loadImage(await fileToDataUrl(file));
  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.85, 0.7, 0.55]) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
    if ((base64.length * 3) / 4 <= PHOTO_MAX_BYTES) return { base64, dataUrl };
  }
  throw new Error("La imagen pesa demasiado incluso comprimida.");
}

function toggleInspectPanel(row, source) {
  const existing = row.querySelector(".ingest-inspect");
  if (existing) {
    existing.remove();
    return;
  }
  const readsUrl = source.parserType === "generic_html" || source.parserType === "generic_pdf";
  const isSocial = SOCIAL_SOURCE_TYPES.has(source.type);
  const panel = document.createElement("div");
  panel.className = "ingest-inspect";
  panel.innerHTML = `
    <label>Texto del menú</label>
    <textarea placeholder="Pega aquí el menú tal como aparece en la fuente"></textarea>
    <div class="photo-read">
      <input type="file" accept="image/*" data-photo-input hidden>
      <span class="form-hint" data-photo-status>O lee una captura del post: con el botón, o pegándola aquí con ⌘V.</span>
      <img class="photo-preview" data-photo-preview alt="Captura leída" hidden>
    </div>
    <p class="form-hint">${readsUrl
      ? "Esta fuente se lee sola desde su URL: déjalo vacío. Si pegas texto, el lector de la URL manda igualmente."
      : "Esta fuente no tiene lector automático: pega el texto del menú o léelo desde una captura. Es obligatorio."}</p>
    ${isSocial ? `
      <div class="form-grid">
        <div class="span-2">
          <label>Enlace al post</label>
          <input type="url" inputmode="url" data-publication-url placeholder="${source.type === "official_instagram" ? "https://www.instagram.com/p/…" : "https://www.facebook.com/…/posts/…"}">
        </div>
        <label class="check-row span-2"><input type="checkbox" data-published-today> <span>El post es de hoy</span></label>
        <p class="form-hint span-2">Sin el enlace al post y la fecha de hoy, una lectura de redes no se puede publicar.</p>
      </div>` : ""}
    <div class="actions"></div>
  `;
  const textarea = panel.querySelector("textarea");
  const photoInput = panel.querySelector("[data-photo-input]");
  const photoStatus = panel.querySelector("[data-photo-status]");
  const photoPreview = panel.querySelector("[data-photo-preview]");
  // De dónde sale el texto: se marca al leer una foto y va con la observación.
  let reading = { extractedFrom: null, evidenceHash: null };

  const photoBtn = createButton("Leer desde foto", "btn-secondary", () => photoInput.click());
  async function readPhoto(file) {
    if (!file) return;
    photoBtn.disabled = true;
    photoStatus.textContent = "Leyendo la foto…";
    try {
      const { base64, dataUrl } = await imageToJpegBase64(file);
      photoPreview.src = dataUrl;
      photoPreview.hidden = false;
      const result = await authedFetch("adminReadMenuImage", {
        method: "POST",
        body: JSON.stringify({ image: base64 }),
      });
      textarea.value = result.text || "";
      reading = { extractedFrom: "image_ocr", evidenceHash: result.evidenceHash || null };
      photoStatus.textContent = `Leído desde la foto: ${(result.lines || []).length} líneas. Revisa el texto antes de pulsar «Leer ahora».`;
    } catch (error) {
      photoStatus.textContent = `No se pudo leer la foto: ${error.message || "error desconocido"}.`;
    } finally {
      photoBtn.disabled = false;
      photoInput.value = "";
    }
  }
  photoInput.addEventListener("change", () => readPhoto(photoInput.files && photoInput.files[0]));
  panel.addEventListener("paste", (event) => {
    const item = [...(event.clipboardData?.items || [])].find((it) => it.type.startsWith("image/"));
    if (!item) return; // texto: se pega normal en el cuadro
    event.preventDefault();
    readPhoto(item.getAsFile());
  });
  photoStatus.before(photoBtn);

  panel.querySelector(".actions").append(
    createButton("Leer ahora", "btn-primary", () => inspectSource(source, {
      text: textarea.value,
      publicationUrl: panel.querySelector("[data-publication-url]")?.value || "",
      publishedToday: panel.querySelector("[data-published-today]")?.checked === true,
      ...reading,
    })),
    createButton("Cancelar", "btn-secondary", () => panel.remove()),
  );
  row.appendChild(panel);
  textarea.focus();
}

async function inspectSource(source, { text = "", publicationUrl = "", publishedToday = false, extractedFrom = null, evidenceHash = null } = {}) {
  hideMessage(ingestMessage);
  const label = businessLabel(source.businessId);
  const isSocial = SOCIAL_SOURCE_TYPES.has(source.type);
  const body = { sourceId: source.id };
  if (text.trim()) body.extractedText = text;
  if (publicationUrl.trim()) body.publicationUrl = publicationUrl.trim();
  if (publishedToday) body.publicationCreatedAt = Date.now();
  if (extractedFrom) body.extractedFrom = extractedFrom;
  if (evidenceHash) body.evidenceHash = evidenceHash;
  setBusy(true);
  try {
    const result = await authedFetch("adminInspectMenuSource", {
      method: "POST",
      body: JSON.stringify(body),
    });
    await loadIngestSources();
    const statusLabel = OBSERVATION_STATUS_LABELS[result.status] || result.status;
    // Una lectura social sin enlace o sin fecha se guarda, pero no llegará a publicarse.
    const socialWarning = isSocial && (!body.publicationUrl || !body.publicationCreatedAt)
      ? " Ojo: sin el enlace al post y la fecha de hoy no se podrá publicar."
      : "";
    if (result.unchanged) {
      showMessage(ingestMessage, `${label}: el mismo menú que ya se leyó hoy. No se ha creado nada nuevo (estado: ${statusLabel}).${socialWarning}`, "ok");
    } else if (result.published) {
      showMessage(ingestMessage, `${label}: leído y publicado solo. Oferta ${result.offerId}.`, "ok");
    } else {
      const why = PUBLISH_REASON_LABELS[result.reason];
      const next = result.status === "pending_review" ? " Revísalo en la cola." : "";
      showMessage(ingestMessage, `${label}: leído, queda en «${statusLabel}»${why ? ` porque ${why}` : ""}.${next}${socialWarning}`, "ok");
    }
  } catch (error) {
    // Un fallo de lectura queda anotado en la fuente: se recarga para verlo.
    await loadIngestSources();
    showMessage(ingestMessage, `${label}: ${error.message || "no se pudo leer la fuente."}`);
  } finally {
    setBusy(false);
  }
}

async function disableSource(source) {
  const label = businessLabel(source.businessId);
  if (!confirm(`¿Desactivar la fuente de ${label}?\n\nDeja de leerse y de publicar. No se borra nada.`)) return;
  hideMessage(ingestMessage);
  setBusy(true);
  try {
    await authedFetch("adminDisableMenuSource", {
      method: "POST",
      body: JSON.stringify({ sourceId: source.id }),
    });
    await loadIngestSources();
    showMessage(ingestMessage, `Fuente de ${label} desactivada.`, "ok");
  } catch (error) {
    showMessage(ingestMessage, error.message || "No se pudo desactivar la fuente.");
  } finally {
    setBusy(false);
  }
}

// ── Formulario de fuente ──

function sourceBusinessMode() {
  return [...sourceBusinessModeInputs].find((input) => input.checked)?.value || "existing";
}

function applySourceBusinessMode() {
  const mode = sourceBusinessMode();
  sourceBusinessExisting.hidden = mode !== "existing";
  sourceBusinessNew.hidden = mode !== "new";
}

/** Una fuente social siempre pasa por revisión y nunca publica sola: el formulario lo enseña así. */
function applySourceTypeRules() {
  const isSocial = SOCIAL_SOURCE_TYPES.has(sourceTypeInput.value);
  sourceSocialFieldset.hidden = !isSocial;
  sourceSocialLockHint.hidden = !isSocial;
  sourceAutoPublishInput.disabled = isSocial;
  sourceManualReviewInput.disabled = isSocial;
  if (isSocial) {
    sourceAutoPublishInput.checked = false;
    sourceManualReviewInput.checked = true;
  }
}

function setSourceFormBusiness(business) {
  sourceFormBusiness = business;
  sourceBusinessSelected.hidden = !business;
  sourceBusinessSelected.textContent = business ? `${business.name || "(sin nombre)"} · ${business.merchantId}` : "";
}

function openSourceForm(source = null) {
  sourceFormOriginal = source;
  sourceForm.reset();
  sourceFormTitle.textContent = source ? `Editar fuente de ${businessLabel(source.businessId)}` : "Nueva fuente";
  sourceTypeInput.value = source?.type && SOURCE_TYPE_LABELS[source.type] ? source.type : "official_web";
  sourceParserInput.value = source?.parserType || DEFAULT_PARSER_BY_TYPE[sourceTypeInput.value];
  sourceUrlInput.value = source?.url || "";
  sourceVerificationInput.value = source?.verificationMethod || "";
  sourceUsernameInput.value = source?.platformUsername || "";
  sourceAccountIdInput.value = source?.platformAccountId || "";
  sourcePollingInput.value = source?.pollingStrategy || "";
  sourceEnabledInput.checked = source ? source.enabled !== false : true;
  sourceAutoPublishInput.checked = source?.autoPublishEnabled === true;
  sourceManualReviewInput.checked = source?.requiresManualReview === true;

  // Al editar, el comercio no cambia: una fuente de otro comercio es otra fuente.
  sourceBusinessModeInputs.forEach((input) => {
    input.checked = input.value === "existing";
    input.disabled = !!source;
  });
  sourceBusinessSearch.hidden = !!source;
  sourceBusinessPicker.hidden = true;
  sourceBusinessPicker.innerHTML = "";
  setSourceFormBusiness(source ? { merchantId: source.businessId, name: businessNames.get(source.businessId) || "" } : null);
  applySourceBusinessMode();
  applySourceTypeRules();

  sourceForm.hidden = false;
  sourceForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeSourceForm() {
  sourceForm.hidden = true;
  sourceFormOriginal = null;
  setSourceFormBusiness(null);
}

async function searchBusinessesForSource() {
  const q = sourceBusinessSearch.value.trim();
  try {
    const items = await fetchMerchantSearch(q);
    sourceBusinessPicker.innerHTML = "";
    sourceBusinessPicker.hidden = false;
    if (!items.length) {
      sourceBusinessPicker.innerHTML = `<div class="empty" style="margin:0">Sin resultados. Si el restaurante no está en Zampa, dalo de alta.</div>`;
      return;
    }
    items.slice(0, 20).forEach((it) => {
      const row = document.createElement("div");
      row.className = "pick-row";
      row.innerHTML = `
        <div>
          <strong>${esc(it.name) || "(sin nombre)"}</strong>
          <div class="pick-sub">${esc(it.addressText) || "Sin dirección"}</div>
          <div class="pick-id">${esc(it.merchantId)}</div>
        </div>
      `;
      row.addEventListener("click", () => {
        setSourceFormBusiness({ merchantId: it.merchantId, name: it.name || "" });
        sourceBusinessPicker.hidden = true;
      });
      sourceBusinessPicker.appendChild(row);
    });
  } catch (error) {
    if (error.name === "AbortError") return;
    showMessage(ingestMessage, error.message || "No se pudo buscar comercios.");
  }
}

function parseCoordinate(value, min, max) {
  const text = value.trim().replace(",", ".");
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) && number >= min && number <= max ? number : NaN;
}

/** Devuelve el cuerpo de `adminUpsertMenuSource` o lanza con un motivo para el admin. */
function buildSourceRequestBody() {
  const original = sourceFormOriginal;
  const type = sourceTypeInput.value;
  const isSocial = SOCIAL_SOURCE_TYPES.has(type);
  const url = sourceUrlInput.value.trim();
  if (!url) throw new Error("Falta la URL de la fuente.");
  if (!/^https:\/\//i.test(url)) throw new Error("La URL tiene que empezar por https://");

  const body = { type, url, parserType: sourceParserInput.value };
  if (original) body.sourceId = original.id;

  if (original) {
    body.businessId = original.businessId;
  } else if (sourceBusinessMode() === "existing") {
    if (!sourceFormBusiness) throw new Error("Elige el comercio de la fuente, o dalo de alta.");
    body.businessId = sourceFormBusiness.merchantId;
  } else {
    const name = bizNameInput.value.trim();
    if (!name) throw new Error("Falta el nombre del restaurante.");
    const addressText = bizAddressInput.value.trim();
    const lat = parseCoordinate(bizLatInput.value, -90, 90);
    const lng = parseCoordinate(bizLngInput.value, -180, 180);
    if (Number.isNaN(lat) || Number.isNaN(lng)) throw new Error("Latitud o longitud no válidas.");
    if ((lat == null) !== (lng == null)) throw new Error("Pon latitud y longitud, o ninguna.");
    body.business = {
      name,
      addressText,
      phone: bizPhoneInput.value.trim(),
      website: bizWebsiteInput.value.trim(),
    };
    if (lat != null) body.business.address = { formatted: addressText, lat, lng };
  }

  if (isSocial && !sourceVerificationInput.value) {
    throw new Error("Elige cómo sabemos que la cuenta es del restaurante.");
  }
  if (sourceVerificationInput.value) body.verificationMethod = sourceVerificationInput.value;
  body.platformUsername = sourceUsernameInput.value.trim().replace(/^@/, "");
  body.platformAccountId = sourceAccountIdInput.value.trim();
  if (sourcePollingInput.value) body.pollingStrategy = sourcePollingInput.value;

  // El backend recalcula `requiresManualReview` en cada guardado: se manda siempre.
  body.requiresManualReview = sourceManualReviewInput.checked;
  // Los interruptores, al editar, sólo viajan si el admin los ha cambiado: una
  // edición no puede reencender por accidente una fuente que apagó una fusión.
  const enabled = sourceEnabledInput.checked;
  const autoPublish = sourceAutoPublishInput.checked;
  if (!original || enabled !== (original.enabled !== false)) body.enabled = enabled;
  if (!original || autoPublish !== (original.autoPublishEnabled === true)) body.autoPublishEnabled = autoPublish;
  return body;
}

async function saveSource(event) {
  event.preventDefault();
  hideMessage(ingestMessage);
  let body;
  try {
    body = buildSourceRequestBody();
  } catch (error) {
    showMessage(ingestMessage, error.message);
    ingestMessage.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (body.enabled === true && sourceFormOriginal && sourceFormOriginal.enabled === false
    && !confirm("Vas a reactivar una fuente desactivada. Si se desactivó al fusionar el restaurante, volvería a leer y publicar a nombre del comercio real. ¿Seguir?")) {
    return;
  }

  setBusy(true);
  try {
    const result = await authedFetch("adminUpsertMenuSource", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (result.businessPending && body.business) {
      businessNames.set(result.businessId, body.business.name);
      invalidateMerchantSearchCache();
    }
    const label = businessLabel(result.businessId);
    closeSourceForm();
    await loadIngestSources();
    const parts = [result.created ? `Fuente creada para ${label}.` : `Fuente de ${label} actualizada.`];
    if (result.businessPending) parts.push("El restaurante aparecerá en la app cuando se publique su primer menú.");
    if (result.created) parts.push("Pulsa Inspeccionar para leerla por primera vez.");
    showMessage(ingestMessage, parts.join(" "), "ok");
  } catch (error) {
    showMessage(ingestMessage, error.message || "No se pudo guardar la fuente.");
  } finally {
    setBusy(false);
  }
  ingestMessage.scrollIntoView({ behavior: "smooth", block: "center" });
}

ingestViewButtons.forEach((btn) => {
  btn.addEventListener("click", () => setIngestView(btn.dataset.ingestView));
});

ingestStatusButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    ingestStatus = btn.dataset.ingestStatus;
    ingestStatusButtons.forEach((other) => other.classList.toggle("active", other === btn));
    hideMessage(ingestMessage);
    loadIngestQueue();
  });
});

ingestQueueMore.addEventListener("click", () => loadIngestQueue({ append: true }));
ingestSourcesMore.addEventListener("click", () => loadIngestSources({ append: true }));
ingestNewSourceBtn.addEventListener("click", () => openSourceForm());
sourceCancelBtn.addEventListener("click", closeSourceForm);
sourceForm.addEventListener("submit", saveSource);
sourceBusinessModeInputs.forEach((input) => input.addEventListener("change", applySourceBusinessMode));
sourceTypeInput.addEventListener("change", () => {
  sourceParserInput.value = DEFAULT_PARSER_BY_TYPE[sourceTypeInput.value];
  // Al salir de social se sueltan los dos interruptores que el tipo forzaba.
  if (sourceAutoPublishInput.disabled && !SOCIAL_SOURCE_TYPES.has(sourceTypeInput.value)) {
    sourceManualReviewInput.checked = false;
  }
  applySourceTypeRules();
});
sourceBusinessSearch.addEventListener("input", () => {
  if (sourceBusinessSearchDebounce) clearTimeout(sourceBusinessSearchDebounce);
  sourceBusinessSearchDebounce = setTimeout(searchBusinessesForSource, 180);
});

// ── Fusión de un restaurante detectado (desde Verificaciones) ──

function placeholderCandidates(item) {
  return Array.isArray(item.placeholderCandidates) ? item.placeholderCandidates.filter((c) => c && c.placeholderId) : [];
}

function buildCandidatesBlock(item) {
  const candidates = placeholderCandidates(item);
  const box = document.createElement("div");
  box.className = "candidates";
  const title = document.createElement("p");
  title.className = "review-label";
  title.textContent = candidates.length === 1
    ? "Puede ser un restaurante que Zampa ya había detectado"
    : `Puede ser uno de estos ${candidates.length} restaurantes que Zampa ya había detectado`;
  box.appendChild(title);

  candidates.forEach((candidate) => {
    const row = document.createElement("div");
    row.className = "candidate";
    const score = typeof candidate.score === "number" ? ` · coincidencia ${Math.round(candidate.score * 100)} %` : "";
    const distance = typeof candidate.distanceMeters === "number" ? ` · a ${formatDistance(candidate.distanceMeters)}` : "";
    const info = document.createElement("div");
    info.innerHTML = `
      <strong>${esc(candidate.name) || "(sin nombre)"}</strong>
      <div class="card-meta">${esc(candidate.addressText) || "Sin dirección"}</div>
      <div class="card-meta">${esc(CANDIDATE_SIGNAL_LABELS[candidate.signal] || candidate.signal || "")}${score}${esc(distance)}</div>
    `;
    const actions = document.createElement("div");
    actions.className = "actions";
    const preview = document.createElement("div");
    preview.className = "claim-preview";
    preview.hidden = true;
    actions.appendChild(createButton("Ver qué pasaría al fusionar", "btn-secondary", () => previewClaim(item, candidate, preview)));
    row.append(info, actions, preview);
    box.appendChild(row);
  });
  return box;
}

async function previewClaim(item, candidate, container) {
  container.hidden = false;
  container.textContent = "Calculando la fusión...";
  try {
    const params = new URLSearchParams({ placeholderId: candidate.placeholderId, merchantId: item.merchantId });
    const result = await authedFetch(`adminPreviewClaimPlan?${params.toString()}`);
    renderClaimPreview(container, item, candidate, result);
  } catch (error) {
    container.textContent = error.message || "No se pudo calcular la fusión.";
  }
}

function renderClaimPreview(container, item, candidate, result) {
  container.innerHTML = "";
  const merchantName = item.name || item.merchantId;
  const placeholderName = candidate.name || candidate.placeholderId;

  if (result.reason === "already_claimed_by_this_merchant") {
    const pending = Number(result.favoritesPending) || 0;
    container.innerHTML = `<p style="margin:0">Ya está fusionado con ${esc(merchantName)}.${pending
      ? ` Quedan <strong>${pending}</strong> clientes que le seguían por mover de una fusión anterior que no terminó.`
      : ""}</p>`;
    if (pending) {
      const actions = document.createElement("div");
      actions.className = "actions";
      actions.appendChild(createButton("Terminar de mover los favoritos", "btn-primary", () => claimPlaceholder(item, candidate, container)));
      container.appendChild(actions);
    }
    return;
  }
  if (!result.ok || !result.plan) {
    container.innerHTML = `<p style="margin:0;color:var(--danger)">No se puede fusionar: ${esc(CLAIM_REASON_LABELS[result.reason] || result.reason || "motivo desconocido")}.</p>`;
    return;
  }

  const plan = result.plan;
  const copied = Object.keys(plan.businessPatch || {}).map((field) => CLAIM_FIELD_LABELS[field] || field);
  const oldOffers = Array.isArray(plan.skipped?.offers) ? plan.skipped.offers.length : 0;
  container.innerHTML = `
    <p style="margin:0">Al fusionar <strong>${esc(placeholderName)}</strong> con <strong>${esc(merchantName)}</strong>:</p>
    <ul>
      <li>${copied.length ? `Se copia a su ficha, porque la tiene vacía: ${esc(copied.join(", "))}.` : "No se copia nada a su ficha."}</li>
      <li>Ofertas de hoy que pasan a su nombre: <strong>${(plan.offersToRepoint || []).length}</strong>.</li>
      <li>Lecturas de hoy que pasan a su nombre: <strong>${(plan.observationsToRepoint || []).length}</strong>.</li>
      <li>Fuentes que se desactivan: <strong>${(plan.sourcesToDisable || []).length}</strong>.</li>
      <li>Clientes que le seguían y pasan a seguir a ${esc(merchantName)}: <strong>${(plan.favoritesToRepoint || []).length}</strong>.</li>
      <li>No se migra el histórico${oldOffers ? ` (${oldOffers} ofertas antiguas, métricas e historial)` : " (métricas e historial)"}: falsearía sus estadísticas.</li>
    </ul>
  `;
  const actions = document.createElement("div");
  actions.className = "actions";
  actions.appendChild(createButton("Fusionar", "btn-primary", () => claimPlaceholder(item, candidate, container)));
  container.appendChild(actions);
}

async function claimPlaceholder(item, candidate, container) {
  const merchantName = item.name || item.merchantId;
  const placeholderName = candidate.name || candidate.placeholderId;
  if (!confirm(`¿Fusionar «${placeholderName}» con «${merchantName}»?\n\nNo se puede deshacer desde la consola.`)) return;
  hideMessage(workspaceMessage);
  setBusy(true);
  try {
    const result = await authedFetch("adminClaimPlaceholderBusiness", {
      method: "POST",
      body: JSON.stringify({ placeholderId: candidate.placeholderId, merchantId: item.merchantId }),
    });
    if (result.claimed) {
      const offers = result.plan ? (result.plan.offersToRepoint || []).length : 0;
      const text = `Fusionado «${placeholderName}» con «${merchantName}». Ofertas de hoy repuntadas: ${offers}. Favoritos movidos: ${Number(result.favoritesRepointed) || 0}.`;
      container.innerHTML = `<p style="margin:0;color:var(--success)">${esc(text)}</p>`;
      showMessage(workspaceMessage, text, "ok");
      invalidateMerchantSearchCache();
    } else {
      container.innerHTML = `<p style="margin:0;color:var(--danger)">No se ha fusionado: ${esc(CLAIM_REASON_LABELS[result.reason] || result.reason || "motivo desconocido")}.</p>`;
    }
  } catch (error) {
    container.innerHTML = `<p style="margin:0;color:var(--danger)">${esc(error.message || "No se pudo fusionar.")}</p>`;
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
  ingestPane.hidden = tab !== "ingest";
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
  } else if (tab === "ingest") {
    tabEyebrow.textContent = "Fuentes oficiales";
    tabTitle.textContent = "Menús detectados";
    if (!ingestLoaded) {
      ingestLoaded = true;
      loadIngestView();
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
  } else if (activeTab === "ingest") {
    businessNames.clear();
    hideMessage(ingestMessage);
    loadIngestView();
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
  hideMessage(ingestMessage);

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
    ingestLoaded = false;
    ingestQueueList.innerHTML = "";
    ingestSourcesList.innerHTML = "";
    businessNames.clear();
    closeSourceForm();
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
