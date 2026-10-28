/**
 * ADMINLTE 4 - DECANATURA FACULTAD DE INGENIERÍA UPDS
 * Interactive Logic: 3-Stage Pipeline, Schedule Anti-Collision, Walk-ins, Users Directory & Academic Demand Statistics
 * EdTech S.R.L. - UPDS Santa Cruz
 */

(function () {
  'use strict';

  // State
  let currentActiveTab = 'tab-foro'; // 'tab-foro' | 'tab-evaluacion' | 'tab-habilitadas' | 'tab-usuarios' | 'tab-estadisticas'
  let currentUser = UPDS_DATA.usuarios.find(u => u.rol === 'Decano') || UPDS_DATA.usuarios[1];
  let searchFilter = '';
  let roleFilter = 'all';
  let showFinancials = false; // Oculto por defecto por temas de privacidad de ganancias

  // DOM Elements
  const lockscreen = document.getElementById('lockscreen');
  const lockscreenForm = document.getElementById('lockscreen-form');
  const lockscreenInput = document.getElementById('lockscreen-password');
  const currentUserNameEl = document.getElementById('lock-user-name');
  const currentUserRoleEl = document.getElementById('lock-user-role');
  const currentUserAvatarEl = document.getElementById('lock-user-avatar');

  // Main UI
  const headerUserName = document.getElementById('header-user-name');
  const headerUserAvatar = document.getElementById('header-user-avatar');
  const sidebarUserName = document.getElementById('sidebar-user-name');
  const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
  const sidebarUserRoleBadge = document.getElementById('sidebar-user-role-badge');
  const iconToggleFinances = document.getElementById('icon-toggle-finances');

  // KPI elements (Image 1 Projects layout)
  const kpiActiveProjects = document.getElementById('kpi-active-projects');
  const kpiOnTrack = document.getElementById('kpi-on-track');
  const kpiAtRisk = document.getElementById('kpi-at-risk');
  const kpiCompleted = document.getElementById('kpi-completed');

  // Badges count on tabs
  const badgeCountForo = document.getElementById('badge-count-foro');
  const badgeCountEval = document.getElementById('badge-count-eval');
  const badgeCountHab = document.getElementById('badge-count-hab');
  const pillSidebarForo = document.getElementById('pill-sidebar-foro');
  const pillSidebarEval = document.getElementById('pill-sidebar-eval');
  const pillSidebarHab = document.getElementById('pill-sidebar-hab');

  // Containers
  const viewDashboard = document.getElementById('view-dashboard');
  const viewUsuarios = document.getElementById('view-usuarios');
  const viewEstadisticas = document.getElementById('view-estadisticas');
  const viewEstudiantes = document.getElementById('view-estudiantes');
  const viewChat = document.getElementById('view-chat');
  const tbodyForo = document.getElementById('tbody-foro');
  const tbodyEvaluacion = document.getElementById('tbody-evaluacion');
  const tbodyHabilitadas = document.getElementById('tbody-habilitadas');
  const tbodyUsuarios = document.getElementById('tbody-usuarios');
  const tbodyEstudiantes = document.getElementById('tbody-estudiantes');

  // Modals
  const modalAsignar = document.getElementById('modal-asignar-docente');
  const modalAlumnos = document.getElementById('modal-ver-alumnos');
  const modalActa = document.getElementById('modal-acta-registro');
  const modalNuevoUsuario = document.getElementById('modal-nuevo-usuario');
  const modalPresencial = document.getElementById('modal-solicitud-presencial');
  const modalPerfilEstudiante = document.getElementById('modal-perfil-estudiante');
  const modalLlamada = document.getElementById('modal-llamada-chat');

  // Currently active subject for modal actions
  let activeSubjectId = null;

  /* ===================================================================
     1. LOCKSCREEN & USER SESSION
  =================================================================== */
  function updateLockscreenUser(user) {
    currentUser = user;
    if (currentUserNameEl) currentUserNameEl.textContent = user.nombre;
    if (currentUserRoleEl) currentUserRoleEl.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Rol: ${user.rol} (${user.cargo})`;
    if (currentUserAvatarEl) currentUserAvatarEl.src = user.avatar;

    // Update app header & sidebar
    if (headerUserName) headerUserName.textContent = user.nombre;
    if (headerUserAvatar) headerUserAvatar.src = user.avatar;
    if (sidebarUserName) sidebarUserName.textContent = user.nombre;
    if (sidebarUserAvatar) sidebarUserAvatar.src = user.avatar;
    if (sidebarUserRoleBadge) {
      sidebarUserRoleBadge.textContent = user.rol;
      sidebarUserRoleBadge.className = `sidebar-user-role-badge badge-role-${user.rolBadge || 'decano'}`;
    }
  }

  window.selectLockUser = function (userId) {
    const user = UPDS_DATA.usuarios.find(u => u.id === userId);
    if (user) {
      updateLockscreenUser(user);
      document.querySelectorAll('.role-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.userid === userId);
      });
      if (lockscreenInput) {
        lockscreenInput.focus();
        lockscreenInput.value = '';
      }
    }
  };

  if (lockscreenForm) {
    lockscreenForm.addEventListener('submit', function (e) {
      e.preventDefault();
      unlockDashboard();
    });
  }

  function unlockDashboard() {
    if (lockscreen) {
      lockscreen.classList.add('hidden');
    }
    renderAll();
  }

  window.lockDashboard = function () {
    if (lockscreen) {
      lockscreen.classList.remove('hidden');
      if (lockscreenInput) {
        lockscreenInput.value = '';
        lockscreenInput.focus();
      }
    }
  };

  /* ===================================================================
     2. PRIVACY TOGGLE: VISIBILIDAD DE GANANCIAS UNIVERSITARIAS
  =================================================================== */
  window.toggleFinancialsVisibility = function () {
    showFinancials = !showFinancials;

    // Update header toggle icon
    if (iconToggleFinances) {
      iconToggleFinances.className = showFinancials ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
    }

    // Update confidential card in statistics view
    const lockedBlock = document.getElementById('confidential-locked-block');
    const unlockedBlock = document.getElementById('confidential-unlocked-block');
    const badgePrivacy = document.getElementById('badge-privacy-status');
    const labelPrivacyStats = document.getElementById('label-privacy-stats');
    const iconPrivacyStats = document.getElementById('icon-privacy-stats');
    const btnPrivacyStats = document.getElementById('btn-privacy-stats-toggle');

    if (lockedBlock && unlockedBlock) {
      if (showFinancials) {
        lockedBlock.style.display = 'none';
        unlockedBlock.style.display = 'block';
        if (badgePrivacy) {
          badgePrivacy.className = 'badge-pill badge-ontrack';
          badgePrivacy.innerHTML = '<i class="fa-solid fa-unlock"></i> Desbloqueado';
        }
        if (labelPrivacyStats) labelPrivacyStats.textContent = 'Ocultar Ganancias';
        if (iconPrivacyStats) iconPrivacyStats.className = 'fa-solid fa-eye-slash';
        if (btnPrivacyStats) btnPrivacyStats.classList.add('active');
      } else {
        lockedBlock.style.display = 'block';
        unlockedBlock.style.display = 'none';
        if (badgePrivacy) {
          badgePrivacy.className = 'badge-pill badge-atrisk';
          badgePrivacy.innerHTML = '<i class="fa-solid fa-lock"></i> Oculto por Privacidad';
        }
        if (labelPrivacyStats) labelPrivacyStats.textContent = 'Ver Ganancias de la Universidad';
        if (iconPrivacyStats) iconPrivacyStats.className = 'fa-solid fa-eye';
        if (btnPrivacyStats) btnPrivacyStats.classList.remove('active');
      }
    }

    // Re-render views with updated privacy state
    renderAll();

    const toastMsg = showFinancials
      ? '🔓 Modo Financiero UPDS: Cifras de recaudación y ganancias reveladas.'
      : '🔒 Modo Académico Protegido: Ganancias institucionales ocultas.';
    showToast(toastMsg);
  };

  /* ===================================================================
     3. NAVIGATION & DASHBOARD VERSIONS (MATCHING SCREENSHOT)
  =================================================================== */
  window.toggleTree = function (treeId) {
    const el = document.getElementById(treeId);
    if (el) el.classList.toggle('open');
  };

  window.switchDashboardVersion = function (version) {
    // Update Sidebar sub-items
    const subV1 = document.getElementById('sub-dash-v1');
    const subV2 = document.getElementById('sub-dash-v2');
    const subV3 = document.getElementById('sub-dash-v3');
    if (subV1) subV1.classList.toggle('active', version === 'v1');
    if (subV2) subV2.classList.toggle('active', version === 'v2');
    if (subV3) subV3.classList.toggle('active', version === 'v3');

    // Update Header pills
    const pillV1 = document.getElementById('pill-v1');
    const pillV2 = document.getElementById('pill-v2');
    const pillV3 = document.getElementById('pill-v3');
    if (pillV1) pillV1.classList.toggle('active', version === 'v1');
    if (pillV2) pillV2.classList.toggle('active', version === 'v2');
    if (pillV3) pillV3.classList.toggle('active', version === 'v3');

    const pageTitle = document.getElementById('page-title');
    const breadcrumb = document.getElementById('breadcrumb-current');

    if (version === 'v1') {
      switchTab('tab-foro');
      if (pageTitle) pageTitle.innerHTML = '<span>Projects</span>';
      if (breadcrumb) breadcrumb.innerHTML = '<span>Projects</span>';
    } else if (version === 'v2') {
      switchTab('tab-estadisticas');
      if (pageTitle) pageTitle.innerHTML = '<span>Chart.js</span>';
      if (breadcrumb) breadcrumb.innerHTML = '<span>Chart.js</span>';
    } else if (version === 'v3') {
      switchTab('tab-estudiantes');
      if (pageTitle) pageTitle.innerHTML = '<span>Data Tables</span>';
      if (breadcrumb) breadcrumb.innerHTML = '<a href="javascript:void(0)">Tables</a> <span>/</span> <span>Data</span>';
    }
  };

  window.switchTab = function (tabId) {
    currentActiveTab = tabId;

    // Sync version badges
    let activeVer = null;
    if (tabId === 'tab-foro' || tabId === 'tab-evaluacion' || tabId === 'tab-habilitadas') activeVer = 'v1';
    else if (tabId === 'tab-estadisticas') activeVer = 'v2';
    else if (tabId === 'tab-estudiantes') activeVer = 'v3';

    ['v1', 'v2', 'v3'].forEach(v => {
      const sub = document.getElementById(`sub-dash-${v}`);
      const pill = document.getElementById(`pill-${v}`);
      if (sub) sub.classList.toggle('active', v === activeVer);
      if (pill) pill.classList.toggle('active', v === activeVer);
    });

    const pillChat = document.getElementById('pill-chat');
    if (pillChat) pillChat.classList.toggle('active', tabId === 'tab-chat');

    if (tabId === 'tab-usuarios') {
      viewDashboard.style.display = 'none';
      viewUsuarios.style.display = 'block';
      if (viewEstadisticas) viewEstadisticas.style.display = 'none';
      if (viewEstudiantes) viewEstudiantes.style.display = 'none';
      if (viewChat) viewChat.style.display = 'none';
      const b = document.getElementById('breadcrumb-current');
      const p = document.getElementById('page-title');
      if (b) b.innerHTML = '<span>Usuarios</span>';
      if (p) p.innerHTML = '<i class="fa-solid fa-id-card-clip" style="color:var(--bs-primary);"></i> <span>Directorio de Usuarios</span>';
    } else if (tabId === 'tab-estadisticas') {
      viewDashboard.style.display = 'none';
      viewUsuarios.style.display = 'none';
      if (viewEstadisticas) viewEstadisticas.style.display = 'block';
      if (viewEstudiantes) viewEstudiantes.style.display = 'none';
      if (viewChat) viewChat.style.display = 'none';
      const b = document.getElementById('breadcrumb-current');
      const p = document.getElementById('page-title');
      if (b) b.innerHTML = '<span>Chart.js</span>';
      if (p) p.innerHTML = '<span>Chart.js</span>';
      renderEstadisticas();
    } else if (tabId === 'tab-estudiantes') {
      viewDashboard.style.display = 'none';
      viewUsuarios.style.display = 'none';
      if (viewEstadisticas) viewEstadisticas.style.display = 'none';
      if (viewEstudiantes) viewEstudiantes.style.display = 'block';
      if (viewChat) viewChat.style.display = 'none';
      const b = document.getElementById('breadcrumb-current');
      const p = document.getElementById('page-title');
      if (b) b.innerHTML = '<a href="javascript:void(0)">Tables</a> <span>/</span> <span>Data</span>';
      if (p) p.innerHTML = '<span>Data Tables</span>';
      renderEstudiantesDataTable();
    } else if (tabId === 'tab-chat') {
      viewDashboard.style.display = 'none';
      viewUsuarios.style.display = 'none';
      if (viewEstadisticas) viewEstadisticas.style.display = 'none';
      if (viewEstudiantes) viewEstudiantes.style.display = 'none';
      if (viewChat) viewChat.style.display = 'block';
      const b = document.getElementById('breadcrumb-current');
      const p = document.getElementById('page-title');
      if (b) b.innerHTML = '<span>Chat</span>';
      if (p) p.innerHTML = '<span>Chat</span>';
      renderChat();
    } else {
      viewDashboard.style.display = 'block';
      viewUsuarios.style.display = 'none';
      if (viewEstadisticas) viewEstadisticas.style.display = 'none';
      if (viewEstudiantes) viewEstudiantes.style.display = 'none';
      if (viewChat) viewChat.style.display = 'none';
      const b = document.getElementById('breadcrumb-current');
      const p = document.getElementById('page-title');
      if (b) b.innerHTML = '<span>Projects</span>';
      if (p) p.innerHTML = '<span>Projects</span>';

      // Pipeline subtabs
      document.querySelectorAll('.pipeline-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
      });

      // Show/hide table sections
      document.getElementById('section-foro').style.display = tabId === 'tab-foro' ? 'block' : 'none';
      document.getElementById('section-evaluacion').style.display = tabId === 'tab-evaluacion' ? 'block' : 'none';
      document.getElementById('section-habilitadas').style.display = tabId === 'tab-habilitadas' ? 'block' : 'none';
    }

    // Update sidebar navigation active item
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.targetTab === tabId);
    });

    renderAll();
  };

  /* ===================================================================
     4. RENDER KPIS & COUNTERS
  =================================================================== */
  function renderKPIs() {
    const totalForo = UPDS_DATA.materiasForo.length;
    const totalEval = UPDS_DATA.materiasEvaluacion.length;
    const totalHab = UPDS_DATA.materiasHabilitadas.length;

    const viablesForo = UPDS_DATA.materiasForo.filter(m => m.interesados >= m.metaMinima).length;
    const pendientesForo = UPDS_DATA.materiasForo.filter(m => m.interesados < m.metaMinima).length;

    // Image 1 exact KPI summary cards
    const kpiActiveProjects = document.getElementById('kpi-active-projects');
    const kpiOnTrack = document.getElementById('kpi-on-track');
    const kpiAtRisk = document.getElementById('kpi-at-risk');
    const kpiCompleted = document.getElementById('kpi-completed');

    if (kpiActiveProjects) kpiActiveProjects.textContent = totalForo + totalEval; // 6
    if (kpiOnTrack) kpiOnTrack.textContent = viablesForo + 1; // 3
    if (kpiAtRisk) kpiAtRisk.textContent = pendientesForo; // 2
    if (kpiCompleted) kpiCompleted.textContent = totalHab; // 1

    if (badgeCountForo) badgeCountForo.textContent = totalForo;
    if (badgeCountEval) badgeCountEval.textContent = totalEval;
    if (badgeCountHab) badgeCountHab.textContent = totalHab;

    if (pillSidebarForo) pillSidebarForo.textContent = totalForo;
    if (pillSidebarEval) pillSidebarEval.textContent = totalEval;
    if (pillSidebarHab) pillSidebarHab.textContent = totalHab;
  }

  /* ===================================================================
     5. RENDER TAB 1: MATERIAS DEL FORO (PROJECTS VIEW - IMAGE 1)
  =================================================================== */
  window.filtrarMateriasForo = function () {
    const searchInput = document.getElementById('filter-foro-search');
    const statusSelect = document.getElementById('filter-foro-status');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const status = statusSelect ? statusSelect.value : 'all';
    renderMateriasForo(query, status);
  };

  function renderMateriasForo(query = '', statusFilter = 'all') {
    if (!tbodyForo) return;
    tbodyForo.innerHTML = '';

    const q = (query || searchFilter || '').toLowerCase().trim();
    let filtered = UPDS_DATA.materiasForo.filter(m =>
      m.nombre.toLowerCase().includes(q) ||
      m.codigo.toLowerCase().includes(q) ||
      m.carreraNombre.toLowerCase().includes(q)
    );

    if (statusFilter === 'ontrack') {
      filtered = filtered.filter(m => m.interesados >= m.metaMinima);
    } else if (statusFilter === 'atrisk') {
      filtered = filtered.filter(m => m.interesados >= 7 && m.interesados < m.metaMinima);
    } else if (statusFilter === 'delayed') {
      filtered = filtered.filter(m => m.interesados < 7);
    }

    if (filtered.length === 0) {
      tbodyForo.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#8b949e;">No hay proyectos que coincidan con la búsqueda.</td></tr>`;
      return;
    }

    filtered.forEach(m => {
      const isViable = m.interesados >= m.metaMinima;
      const pct = Math.min(100, Math.round((m.interesados / 20) * 100)); // Capacidad aula 20 alumnos

      // Status Badge (Exact Image 1)
      let statusBadge = '';
      if (m.interesados >= 10) {
        statusBadge = `<span class="badge-pill badge-ontrack">On track</span>`;
      } else if (m.interesados >= 7) {
        statusBadge = `<span class="badge-pill badge-atrisk">At risk</span>`;
      } else {
        statusBadge = `<span class="badge-pill badge-delayed">Delayed</span>`;
      }

      // Progress bar color matching Image 1
      let progressColor = '#0d6efd';
      if (m.interesados >= 10) progressColor = '#0d6efd';
      else if (m.interesados >= 7) progressColor = '#0dcaf0';
      else progressColor = '#eab308';

      // Stacked avatars preview (Team)
      let avatarStack = '<div class="avatar-group">';
      const previewCount = Math.min(3, m.alumnos.length);
      const colors = ['#0d6efd', '#6610f2', '#198754', '#d63384', '#fd7e14'];
      for (let i = 0; i < previewCount; i++) {
        const initials = m.alumnos[i].nombre.split(' ').map(n => n[0]).slice(0, 2).join('');
        const bg = colors[i % colors.length];
        avatarStack += `<div class="avatar-group-item" style="background:${bg}" title="${m.alumnos[i].nombre} (${m.alumnos[i].reg})">${initials}</div>`;
      }
      if (m.alumnos.length > previewCount) {
        avatarStack += `<div class="avatar-group-item avatar-count-bubble">+${m.alumnos.length - previewCount}</div>`;
      }
      avatarStack += '</div>';

      // Budget column (Confidential toggle)
      const budgetHtml = showFinancials
        ? `<span style="font-weight:600; color:#f0f6fc;">Bs ${(m.interesados * 640).toLocaleString('es-BO')}</span>`
        : `<span style="color:#8b949e; letter-spacing:1px;" title="Cifra confidencial UPDS (clic en ojo para revelar)">Bs ••••••</span>`;

      // Due column
      const dueHtml = `<span style="color:#c9d1d9; font-size:13px;">${m.turno}</span><div style="font-size:11px; color:#8b949e;">Módulo 2</div>`;

      // Priority column matching Image 1
      let priorityBadge = '';
      if (m.interesados >= 12) {
        priorityBadge = `<span class="badge-pill badge-delayed" style="font-size:11px; padding:2px 8px;">High</span>`;
      } else if (m.interesados >= 8) {
        priorityBadge = `<span class="badge-pill badge-info" style="font-size:11px; padding:2px 8px;">Medium</span>`;
      } else {
        priorityBadge = `<span class="badge-pill badge-completed" style="font-size:11px; padding:2px 8px;">Low</span>`;
      }

      // Actions column matching Image 1 (< > / ✎ / ⋮)
      const actionsHtml = `
        <div class="action-btn-group" style="justify-content: flex-end;">
          <button class="action-icon-btn" onclick="abrirAlumnosModal('${m.id}')" title="Ver Alumnos & Validar Prerrequisitos">
            <i class="fa-solid fa-code"></i>
          </button>
          <button class="action-icon-btn" onclick="abrirModalPresencial('${m.id}')" title="Registrar Alumno Presencial" style="color:var(--bs-edtech-orange);">
            <i class="fa-solid fa-pencil"></i>
          </button>
          <button class="action-icon-btn btn-approve" ${!isViable ? 'disabled style="opacity:0.35; cursor:not-allowed;"' : ''} onclick="pasarAEvaluacion('${m.id}')" title="${isViable ? 'Pasar a Mesa de Decisión y Viabilidad' : 'Requiere al menos 10 estudiantes'}">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
      `;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <a href="javascript:void(0)" onclick="abrirAlumnosModal('${m.id}')" class="subject-title" style="font-size:14px; font-weight:600; color:#58a6ff;">${m.nombre}</a>
          <div class="subject-meta" style="font-size:12px; color:#8b949e; margin-top:2px;">
            <span>${m.carreraNombre}</span> • <span class="badge-code" style="font-size:10px;">${m.codigo}</span>
          </div>
        </td>
        <td>${statusBadge}</td>
        <td>
          <div class="progress-container" style="display:flex; align-items:center; gap:8px;">
            <div class="progress-track" style="flex:1; height:6px; background:#30363d; border-radius:3px; overflow:hidden;">
              <div class="progress-fill" style="width: ${pct}%; background-color: ${progressColor}; height:100%;"></div>
            </div>
            <span class="progress-pct" style="font-size:12px; color:#8b949e; min-width:32px;">${pct}%</span>
          </div>
        </td>
        <td>
          <div style="cursor:pointer;" onclick="abrirAlumnosModal('${m.id}')" title="Clic para ver lista de ${m.alumnos.length} estudiantes">${avatarStack}</div>
        </td>
        <td>${budgetHtml}</td>
        <td>${dueHtml}</td>
        <td>${priorityBadge}</td>
        <td>${actionsHtml}</td>
      `;
      tbodyForo.appendChild(tr);
    });
  }

  /* ===================================================================
     6. RENDER TAB 2: EN EVALUACIÓN Y VIABILIDAD (STAGE 2)
  =================================================================== */
  function renderMateriasEvaluacion() {
    if (!tbodyEvaluacion) return;
    tbodyEvaluacion.innerHTML = '';

    const query = searchFilter.toLowerCase();
    const filtered = UPDS_DATA.materiasEvaluacion.filter(m =>
      m.nombre.toLowerCase().includes(query) ||
      m.codigo.toLowerCase().includes(query) ||
      m.carreraNombre.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      tbodyEvaluacion.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#8b949e;">No hay materias en evaluación actualmente. Pase materias viables desde el foro.</td></tr>`;
      return;
    }

    filtered.forEach(m => {
      const tieneDocente = !!m.docenteAsignadoId;
      const statusBadge = tieneDocente
        ? `<span class="badge-pill badge-ontrack"><i class="fa-solid fa-user-check"></i> Docente Asignado</span>`
        : `<span class="badge-pill badge-delayed"><i class="fa-solid fa-triangle-exclamation"></i> Requiere Docente</span>`;

      // Espacio name
      const espacioObj = UPDS_DATA.espacios.find(e => e.id === m.espacioAsignado);
      const espacioTexto = espacioObj ? `${espacioObj.nombre} (${espacioObj.capacidad} cap.)` : 'Por asignar';

      // Columna de Validación Académica
      const academicValidation = `
        <div style="font-weight:600; color:#38bdf8;">
          <i class="fa-solid fa-clipboard-check"></i> 100% Prerrequisitos OK
        </div>
        <div style="font-size:11px; color:#9ca3af; margin-top:2px;">
          ${m.auxiliarValidador || 'Auxiliar de Secretaría'}
        </div>
        ${showFinancials ? `<div style="font-size:11px; color:#4ade80; margin-top:3px; font-weight:700;">Margen UPDS: Bs ${m.utilidadInstitucional.toLocaleString('es-BO')}</div>` : ''}
      `;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <a href="javascript:void(0)" onclick="abrirAsignarModal('${m.id}')" class="subject-title">${m.nombre}</a>
          <div class="subject-meta">
            <span class="badge-code">${m.codigo}</span>
            <span>${m.carreraNombre}</span>
          </div>
        </td>
        <td>${statusBadge}</td>
        <td>
          <span class="badge-shift"><i class="fa-regular fa-clock"></i> ${m.turno} (${m.horario})</span>
          <div style="font-size:12px; color:#cbd5e1; margin-top:4px;">
            <i class="fa-solid fa-door-open"></i> ${espacioTexto}
          </div>
        </td>
        <td>
          <div style="font-weight:600; color:${tieneDocente ? '#fff' : '#f87171'};">
            ${tieneDocente ? `<i class="fa-solid fa-chalkboard-user"></i> ${m.docenteAsignadoNombre}` : '<i class="fa-solid fa-circle-exclamation"></i> Pendiente de Asignación'}
          </div>
        </td>
        <td>${academicValidation}</td>
        <td>
          <span class="badge-pill badge-completed">${m.alumnos.length} inscritos</span>
        </td>
        <td>
          <div class="action-btn-group">
            <button class="action-icon-btn" onclick="abrirAsignarModal('${m.id}')" title="Asignar Docente, Aula y Horario" style="color:var(--bs-primary);">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="action-icon-btn btn-approve" ${!tieneDocente ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''} onclick="confirmarHabilitacion('${m.id}')" title="${tieneDocente ? 'Aprobar Apertura Oficial y Emitir Acta para Registro' : 'Asigne docente primero para habilitar'}">
              <i class="fa-solid fa-file-signature"></i>
            </button>
          </div>
        </td>
      `;
      tbodyEvaluacion.appendChild(tr);
    });
  }

  /* ===================================================================
     7. RENDER TAB 3: MATERIAS HABILITADAS & ACTAS (STAGE 3)
  =================================================================== */
  function renderMateriasHabilitadas() {
    if (!tbodyHabilitadas) return;
    tbodyHabilitadas.innerHTML = '';

    const query = searchFilter.toLowerCase();
    const filtered = UPDS_DATA.materiasHabilitadas.filter(m =>
      m.nombre.toLowerCase().includes(query) ||
      m.codigo.toLowerCase().includes(query) ||
      m.numActa.toLowerCase().includes(query) ||
      m.docenteNombre.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      tbodyHabilitadas.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#8b949e;">No hay materias habilitadas con ese criterio.</td></tr>`;
      return;
    }

    filtered.forEach(m => {
      const financialSubtext = showFinancials
        ? `<div style="font-size:11px; color:#4ade80; margin-top:3px;"><i class="fa-solid fa-coins"></i> Superávit: Bs ${m.utilidadUPDS.toLocaleString('es-BO')}</div>`
        : `<div style="font-size:11px; color:#8b949e; margin-top:3px;">Paralelo oficial completo</div>`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <span style="font-family:monospace; font-weight:700; color:#60a5fa;">${m.numActa}</span>
          <div style="font-size:11px; color:#8b949e;">Aprobado el ${m.fechaAprobacion}</div>
        </td>
        <td>
          <span class="subject-title">${m.nombre}</span>
          <div class="subject-meta">
            <span class="badge-code">${m.codigo}</span>
            <span>${m.carreraNombre}</span>
          </div>
        </td>
        <td>
          <div style="font-weight:600; color:#fff;">${m.docenteNombre}</div>
          <small style="color:#8b949e;">${m.docenteEspecialidad}</small>
        </td>
        <td>
          <span class="badge-shift"><i class="fa-regular fa-clock"></i> ${m.turno} (${m.horario})</span>
          <div style="font-size:12px; color:#9aa0a6; margin-top:2px;">${m.aulaAsignada}</div>
        </td>
        <td>
          <span class="badge-pill badge-ontrack">${m.alumnosInscritos} Alumnos</span>
          ${financialSubtext}
        </td>
        <td>
          <span class="badge-pill badge-active"><i class="fa-solid fa-paper-plane"></i> Enviado a Registro</span>
        </td>
        <td>
          <button class="btn-primary-action" onclick="abrirActaModal('${m.id}')" style="padding:5px 12px; font-size:12px;">
            <i class="fa-solid fa-file-pdf"></i> Ver Acta Oficial
          </button>
        </td>
      `;
      tbodyHabilitadas.appendChild(tr);
    });
  }

  /* ===================================================================
     8. RENDER VIEW 3: ESTADÍSTICAS ACADÉMICAS & DEMANDA ESTUDIANTIL
  =================================================================== */
  function renderEstadisticas() {
    if (!viewEstadisticas) return;

    // Totales
    const solForo = UPDS_DATA.materiasForo.reduce((acc, m) => acc + m.interesados, 0);
    const solEval = UPDS_DATA.materiasEvaluacion.reduce((acc, m) => acc + m.alumnos.length, 0);
    const solHab = UPDS_DATA.materiasHabilitadas.reduce((acc, m) => acc + m.alumnosInscritos, 0);
    const totalSolicitudes = solForo + solEval + solHab;

    const totalMaterias = UPDS_DATA.materiasForo.length + UPDS_DATA.materiasEvaluacion.length + UPDS_DATA.materiasHabilitadas.length;
    const materiasViables = UPDS_DATA.materiasForo.filter(m => m.interesados >= m.metaMinima).length +
      UPDS_DATA.materiasEvaluacion.length +
      UPDS_DATA.materiasHabilitadas.length;

    const tasaViabilidad = totalMaterias > 0 ? Math.round((materiasViables / totalMaterias) * 100) : 0;
    const promedioHab = UPDS_DATA.materiasHabilitadas.length > 0
      ? Math.round(solHab / UPDS_DATA.materiasHabilitadas.length)
      : (solEval > 0 ? Math.round(solEval / UPDS_DATA.materiasEvaluacion.length) : 0);

    // Update Top 4 KPIs
    const elSol = document.getElementById('stat-kpi-solicitudes');
    const elMat = document.getElementById('stat-kpi-matriculados');
    const elProm = document.getElementById('stat-kpi-promedio');
    const elViab = document.getElementById('stat-kpi-viabilidad');

    if (elSol) elSol.textContent = totalSolicitudes;
    if (elMat) elMat.textContent = solHab;
    if (elProm) elProm.textContent = promedioHab;
    if (elViab) elViab.textContent = `${tasaViabilidad}%`;

    // 1. Ranking de Materias más Solicitadas en Foro
    const listRanking = document.getElementById('stat-ranking-materias');
    if (listRanking) {
      listRanking.innerHTML = '';
      const allForo = [...UPDS_DATA.materiasForo].sort((a, b) => b.interesados - a.interesados);
      allForo.forEach(m => {
        const pct = Math.min(100, Math.round((m.interesados / m.limite) * 100));
        const color = m.interesados >= 10 ? 'var(--bs-success)' : 'var(--bs-warning)';
        const item = document.createElement('div');
        item.className = 'stat-rank-item';
        item.innerHTML = `
          <div class="stat-rank-info">
            <span class="stat-rank-name">${m.nombre} <small style="color:#8b949e;">(${m.codigo} • ${m.carreraNombre})</small></span>
            <span class="stat-rank-badge" style="color:${color}; background:rgba(255,255,255,0.06);">${m.interesados} estudiantes (${pct}%)</span>
          </div>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" style="width:${pct}%; background-color:${color};"></div>
          </div>
        `;
        listRanking.appendChild(item);
      });
    }

    // 2. Demanda por Turno UPDS
    const listTurnos = document.getElementById('stat-demand-turnos');
    if (listTurnos) {
      listTurnos.innerHTML = '';
      const turnoCounts = { Mañana: 0, Mediodía: 0, Tarde: 0, Noche: 0 };
      
      // Conteo en foro
      UPDS_DATA.materiasForo.forEach(m => {
        if (turnoCounts[m.turno] !== undefined) turnoCounts[m.turno] += m.interesados;
      });
      // Conteo en evaluación
      UPDS_DATA.materiasEvaluacion.forEach(m => {
        if (turnoCounts[m.turno] !== undefined) turnoCounts[m.turno] += m.alumnos.length;
      });
      // Conteo en habilitadas
      UPDS_DATA.materiasHabilitadas.forEach(m => {
        if (turnoCounts[m.turno] !== undefined) turnoCounts[m.turno] += m.alumnosInscritos;
      });

      const maxTurno = Math.max(...Object.values(turnoCounts), 1);
      const coloresTurno = {
        Noche: '#38bdf8',
        Mañana: '#4ade80',
        Tarde: '#fbbf24',
        Mediodía: '#a855f7'
      };

      Object.entries(turnoCounts).forEach(([turno, cant]) => {
        const pct = Math.round((cant / totalSolicitudes) * 100) || 0;
        const barPct = Math.round((cant / maxTurno) * 100);
        const item = document.createElement('div');
        item.className = 'stat-rank-item';
        item.innerHTML = `
          <div class="stat-rank-info">
            <span class="stat-rank-name">Turno ${turno}</span>
            <span class="stat-rank-badge" style="color:${coloresTurno[turno]}; background:rgba(255,255,255,0.06);">${cant} alumnos (${pct}%)</span>
          </div>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" style="width:${barPct}%; background-color:${coloresTurno[turno]};"></div>
          </div>
        `;
        listTurnos.appendChild(item);
      });
    }

    // 3. Demanda por Carrera
    const listCarreras = document.getElementById('stat-demand-carreras');
    if (listCarreras) {
      listCarreras.innerHTML = '';
      const carreraCounts = {};
      UPDS_DATA.facultad.carreras.forEach(c => { carreraCounts[c.nombre] = 0; });

      const sumCarrera = (arr, countProp) => {
        arr.forEach(m => {
          if (carreraCounts[m.carreraNombre] !== undefined) {
            carreraCounts[m.carreraNombre] += m[countProp];
          } else {
            carreraCounts[m.carreraNombre] = m[countProp];
          }
        });
      };

      sumCarrera(UPDS_DATA.materiasForo, 'interesados');
      UPDS_DATA.materiasEvaluacion.forEach(m => { carreraCounts[m.carreraNombre] = (carreraCounts[m.carreraNombre] || 0) + m.alumnos.length; });
      sumCarrera(UPDS_DATA.materiasHabilitadas, 'alumnosInscritos');

      const maxCarrera = Math.max(...Object.values(carreraCounts), 1);
      const colMap = ['#0d6efd', '#22c55e', '#ff951c'];
      let idx = 0;

      Object.entries(carreraCounts).forEach(([carrera, cant]) => {
        const pct = Math.round((cant / totalSolicitudes) * 100) || 0;
        const barPct = Math.round((cant / maxCarrera) * 100);
        const col = colMap[idx % colMap.length];
        idx++;

        const item = document.createElement('div');
        item.className = 'stat-rank-item';
        item.innerHTML = `
          <div class="stat-rank-info">
            <span class="stat-rank-name">${carrera}</span>
            <span class="stat-rank-badge" style="color:${col}; background:rgba(255,255,255,0.06);">${cant} solicitudes (${pct}%)</span>
          </div>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" style="width:${barPct}%; background-color:${col};"></div>
          </div>
        `;
        listCarreras.appendChild(item);
      });
    }

    // 4. Desglose del Ciclo de Materias
    const listPipeline = document.getElementById('stat-pipeline-breakdown');
    if (listPipeline) {
      listPipeline.innerHTML = '';
      const etapas = [
        { label: 'Pestaña 1: Materias en Foro (Acumulando)', count: UPDS_DATA.materiasForo.length, col: '#ff951c' },
        { label: 'Pestaña 2: Mesa de Evaluación (Viables)', count: UPDS_DATA.materiasEvaluacion.length, col: '#0d6efd' },
        { label: 'Pestaña 3: Habilitadas con Acta Oficial', count: UPDS_DATA.materiasHabilitadas.length, col: '#198754' }
      ];

      etapas.forEach(e => {
        const pct = totalMaterias > 0 ? Math.round((e.count / totalMaterias) * 100) : 0;
        const item = document.createElement('div');
        item.className = 'stat-rank-item';
        item.innerHTML = `
          <div class="stat-rank-info">
            <span class="stat-rank-name">${e.label}</span>
            <span class="stat-rank-badge" style="color:${e.col}; background:rgba(255,255,255,0.06);">${e.count} materias (${pct}%)</span>
          </div>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" style="width:${pct}%; background-color:${e.col};"></div>
          </div>
        `;
        listPipeline.appendChild(item);
      });
    }

    // 5. Balance Económico Confidencial UPDS (Cifras Reales de Ganancias)
    const totalRecaudacionHab = UPDS_DATA.materiasHabilitadas.reduce((acc, m) => acc + (m.alumnosInscritos * 640), 0);
    const totalCostoDocentesHab = UPDS_DATA.materiasHabilitadas.length * 2500;
    const totalGananciaUPDS = totalRecaudacionHab - totalCostoDocentesHab;
    const margenPct = totalCostoDocentesHab > 0 ? Math.round((totalGananciaUPDS / totalCostoDocentesHab) * 100) : 0;

    const elRecaudacion = document.getElementById('stat-calc-recaudacion');
    const elDocentes = document.getElementById('stat-calc-docentes');
    const elGanancia = document.getElementById('stat-calc-ganancia');
    const elMargenPct = document.getElementById('stat-calc-margen-pct');

    if (elRecaudacion) elRecaudacion.textContent = `Bs ${totalRecaudacionHab.toLocaleString('es-BO')}`;
    if (elDocentes) elDocentes.textContent = `Bs ${totalCostoDocentesHab.toLocaleString('es-BO')}`;
    if (elGanancia) elGanancia.textContent = `Bs ${totalGananciaUPDS.toLocaleString('es-BO')}`;
    if (elMargenPct) elMargenPct.textContent = `+${margenPct}%`;

    // Inicializar y actualizar gráficos de Chart.js estilo AdminLTE 4
    initCharts();
  }

  /* ===================================================================
     8.1 CHART.JS CHARTS INITIALIZER (EXACTO ADMINLTE 4 SCREENSHOT)
  =================================================================== */
  let chartLine = null;
  let chartArea = null;
  let chartColumn = null;
  let chartDonut = null;

  function initCharts() {
    if (typeof Chart === 'undefined') return;

    // Configuración global tema oscuro para Chart.js
    Chart.defaults.color = '#9aa0a6';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
    Chart.defaults.font.family = "'Source Sans 3', sans-serif";

    // 1. Line Chart: Tendencia Modular (Jan - Dec)
    const canvasLine = document.getElementById('chart-line-solicitudes');
    if (canvasLine) {
      if (chartLine) chartLine.destroy();
      const ctx = canvasLine.getContext('2d');
      chartLine = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Alumnos Solicitantes',
            data: [31, 35, 32, 40, 42, 46, 44, 49, 53, 57, 61, 66],
            borderColor: '#0d6efd',
            backgroundColor: '#0d6efd',
            pointBackgroundColor: '#0d6efd',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.35,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#212529',
              borderColor: '#0d6efd',
              borderWidth: 1,
              titleColor: '#fff',
              bodyColor: '#cbd5e1',
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y} Estudiantes postulados`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: { color: 'rgba(255, 255, 255, 0.06)' },
              ticks: { stepSize: 10 }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

    // 2. Area Chart: Postulantes en Foro vs Habilitados
    const canvasArea = document.getElementById('chart-area-demanda');
    if (canvasArea) {
      if (chartArea) chartArea.destroy();
      const ctx = canvasArea.getContext('2d');

      const gradBlue = ctx.createLinearGradient(0, 0, 0, 220);
      gradBlue.addColorStop(0, 'rgba(13, 110, 253, 0.45)');
      gradBlue.addColorStop(1, 'rgba(13, 110, 253, 0.0)');

      const gradCyan = ctx.createLinearGradient(0, 0, 0, 220);
      gradCyan.addColorStop(0, 'rgba(13, 202, 240, 0.35)');
      gradCyan.addColorStop(1, 'rgba(13, 202, 240, 0.0)');

      chartArea = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan \'26', 'Feb \'26', 'Mar \'26', 'Apr \'26', 'May \'26', 'Jun \'26', 'Jul \'26'],
          datasets: [
            {
              label: 'Postulantes en Foro',
              data: [28, 32, 30, 38, 44, 42, 54],
              fill: true,
              borderColor: '#0d6efd',
              backgroundColor: gradBlue,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 5
            },
            {
              label: 'Habilitados Registro',
              data: [15, 18, 19, 23, 25, 28, 35],
              fill: true,
              borderColor: '#0dcaf0',
              backgroundColor: gradCyan,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                boxWidth: 12,
                usePointStyle: true,
                color: '#d1d5db',
                padding: 12
              }
            },
            tooltip: {
              backgroundColor: '#212529',
              borderColor: '#373b3e',
              borderWidth: 1
            }
          },
          scales: {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.06)' },
              ticks: { stepSize: 10 }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

    // 3. Column Chart: Demanda por Turno Académico
    const canvasColumn = document.getElementById('chart-column-turnos');
    if (canvasColumn) {
      if (chartColumn) chartColumn.destroy();
      const ctx = canvasColumn.getContext('2d');

      const turnoCounts = { Mañana: 0, Mediodía: 0, Tarde: 0, Noche: 0 };
      UPDS_DATA.materiasForo.forEach(m => { if (turnoCounts[m.turno] !== undefined) turnoCounts[m.turno] += m.interesados; });
      UPDS_DATA.materiasEvaluacion.forEach(m => { if (turnoCounts[m.turno] !== undefined) turnoCounts[m.turno] += m.alumnos.length; });
      UPDS_DATA.materiasHabilitadas.forEach(m => { if (turnoCounts[m.turno] !== undefined) turnoCounts[m.turno] += m.alumnosInscritos; });

      chartColumn = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Mañana', 'Mediodía', 'Tarde', 'Noche'],
          datasets: [{
            label: 'Estudiantes Interesados',
            data: [turnoCounts.Mañana, turnoCounts.Mediodía, turnoCounts.Tarde, turnoCounts.Noche],
            backgroundColor: '#8b5cf6',
            borderRadius: 6,
            barPercentage: 0.45
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#212529',
              borderColor: '#8b5cf6',
              borderWidth: 1,
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y} Estudiantes`
              }
            }
          },
          scales: {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.06)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

    // 4. Donut Chart: Distribución por Carrera de Ingeniería
    const canvasDonut = document.getElementById('chart-donut-carreras');
    if (canvasDonut) {
      if (chartDonut) chartDonut.destroy();
      const ctx = canvasDonut.getContext('2d');

      const carreraCounts = {
        'Ing. en Redes': 0,
        'Ing. de Sistemas': 0,
        'Ing. Industrial': 0
      };

      const mapName = (name) => {
        if (name.includes('Redes')) return 'Ing. en Redes';
        if (name.includes('Sistemas')) return 'Ing. de Sistemas';
        return 'Ing. Industrial';
      };

      UPDS_DATA.materiasForo.forEach(m => { carreraCounts[mapName(m.carreraNombre)] += m.interesados; });
      UPDS_DATA.materiasEvaluacion.forEach(m => { carreraCounts[mapName(m.carreraNombre)] += m.alumnos.length; });
      UPDS_DATA.materiasHabilitadas.forEach(m => { carreraCounts[mapName(m.carreraNombre)] += m.alumnosInscritos; });

      const totalIng = (carreraCounts['Ing. en Redes'] + carreraCounts['Ing. de Sistemas'] + carreraCounts['Ing. Industrial']) || 1;

      chartDonut = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Ing. Redes y Telecom', 'Ing. de Sistemas', 'Ing. Industrial'],
          datasets: [{
            data: [carreraCounts['Ing. en Redes'], carreraCounts['Ing. de Sistemas'], carreraCounts['Ing. Industrial']],
            backgroundColor: ['#0d6efd', '#8b5cf6', '#ec4899'],
            borderWidth: 3,
            borderColor: '#262a2f'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '58%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                usePointStyle: true,
                color: '#d1d5db',
                padding: 16
              }
            },
            tooltip: {
              backgroundColor: '#212529',
              borderColor: '#373b3e',
              borderWidth: 1,
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${ctx.parsed} alumnos (${Math.round((ctx.parsed / totalIng) * 100)}%)`
              }
            }
          }
        }
      });
    }
  }

  /* ===================================================================
     9. RENDER TAB USUARIOS (IMAGE 2)
  =================================================================== */
  function renderUsuarios() {
    if (!tbodyUsuarios) return;
    tbodyUsuarios.innerHTML = '';

    const query = searchFilter.toLowerCase();
    const filtered = UPDS_DATA.usuarios.filter(u => {
      const matchesSearch = u.nombre.toLowerCase().includes(query) || u.correo.toLowerCase().includes(query) || u.rol.toLowerCase().includes(query);
      const matchesRole = roleFilter === 'all' || u.rol.toLowerCase().includes(roleFilter.toLowerCase());
      return matchesSearch && matchesRole;
    });

    filtered.forEach(u => {
      const roleBadgeClass = u.rol === 'TI / SuperAdmin' ? 'badge-role-admin' :
        (u.rol === 'Decano' ? 'badge-role-decano' :
          (u.rol === 'Auxiliar' ? 'badge-role-auxiliar' : 'badge-role-temporal'));

      const statusBadgeClass = u.estado === 'Activo' ? 'badge-active' : (u.estado === 'Pendiente' ? 'badge-pending' : 'badge-suspended');

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="user-info-cell">
            <img src="${u.avatar}" alt="${u.nombre}" class="user-cell-avatar">
            <div>
              <div class="user-cell-name">${u.nombre}</div>
              <div class="user-cell-subtitle">${u.cargo || 'Funcionario UPDS'}</div>
            </div>
          </div>
        </td>
        <td><span style="color:#9aa0a6;">${u.correo}</span></td>
        <td><span class="badge-pill ${roleBadgeClass}">${u.rol}</span></td>
        <td><span class="badge-pill ${statusBadgeClass}">${u.estado}</span></td>
        <td><span style="color:#cbd5e1;">${u.fechaCreacion}</span></td>
        <td>
          <span style="font-size:12px; font-weight:600; color:${u.rol === 'Temporal' ? 'var(--bs-edtech-orange)' : '#8b949e'};">
            ${u.expiracion}
          </span>
        </td>
        <td>
          <div class="action-btn-group">
            <button class="action-icon-btn" title="Editar permisos"><i class="fa-solid fa-pencil"></i></button>
            <button class="action-icon-btn btn-delete" onclick="eliminarUsuario('${u.id}')" title="Dar de baja"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </td>
      `;
      tbodyUsuarios.appendChild(tr);
    });

    const countLabel = document.getElementById('users-count-label');
    if (countLabel) {
      countLabel.textContent = `Mostrando ${filtered.length} de ${UPDS_DATA.usuarios.length} usuarios registrados`;
    }
  }

  /* ===================================================================
     9.1 DATA TABLES: PADRÓN DE ESTUDIANTES & BÚSQUEDA (IMAGE SCREENSHOT)
  =================================================================== */
  let filterDtGlobal = '';
  let filterDtName = '';
  let filterDtReg = '';
  let filterDtCarrera = '';
  let filterDtEstado = '';

  window.filtrarEstudiantesGlobal = function (val) {
    filterDtGlobal = val.toLowerCase().trim();
    renderEstudiantesDataTable();
  };

  window.filtrarEstudiantesColumnas = function () {
    const inputName = document.getElementById('dt-col-name');
    const inputReg = document.getElementById('dt-col-reg');
    const inputCarrera = document.getElementById('dt-col-carrera');
    const inputEstado = document.getElementById('dt-col-estado');

    filterDtName = inputName ? inputName.value.toLowerCase().trim() : '';
    filterDtReg = inputReg ? inputReg.value.toLowerCase().trim() : '';
    filterDtCarrera = inputCarrera ? inputCarrera.value.toLowerCase().trim() : '';
    filterDtEstado = inputEstado ? inputEstado.value.toLowerCase().trim() : '';

    renderEstudiantesDataTable();
  };

  function getEstudiantesAgrupados() {
    const map = new Map();

    const addStudent = (st, materia, etapa) => {
      const reg = st.reg;
      if (!map.has(reg)) {
        map.set(reg, {
          reg: st.reg,
          nombre: st.nombre,
          telefono: st.telefono || '76000000',
          carrera: materia.carreraNombre,
          semestre: materia.semestre,
          requisitosOk: st.requisitosOk !== undefined ? st.requisitosOk : true,
          notaPrevia: st.notaPrevia || '82/100',
          materias: []
        });
      }
      const item = map.get(reg);
      item.materias.push({
        id: materia.id,
        codigo: materia.codigo,
        nombre: materia.nombre,
        turno: materia.turno,
        etapa: etapa,
        horario: materia.horario || 'Noche (19:00 - 22:30)',
        espacio: materia.espacioAsignado || materia.aulaAsignada || materia.tipoRequerido || 'Aula Teórica',
        docente: materia.docenteAsignadoNombre || materia.docenteNombre || 'Por asignar',
        interesados: materia.interesados || materia.alumnosInscritos || (materia.alumnos ? materia.alumnos.length : 10),
        numActa: materia.numActa || null
      });
    };

    UPDS_DATA.materiasForo.forEach(m => {
      if (m.alumnos) m.alumnos.forEach(a => addStudent(a, m, 'Foro'));
    });

    UPDS_DATA.materiasEvaluacion.forEach(m => {
      if (m.alumnos) m.alumnos.forEach(a => addStudent(a, m, 'Evaluación'));
    });

    UPDS_DATA.materiasHabilitadas.forEach(m => {
      if (m.alumnos) m.alumnos.forEach(a => addStudent(a, m, 'Habilitada'));
    });

    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  function renderEstudiantesDataTable() {
    if (!tbodyEstudiantes) return;
    tbodyEstudiantes.innerHTML = '';

    const allStudents = getEstudiantesAgrupados();

    const filtered = allStudents.filter(st => {
      const matchGlobal = !filterDtGlobal ||
        st.nombre.toLowerCase().includes(filterDtGlobal) ||
        st.reg.toLowerCase().includes(filterDtGlobal) ||
        st.carrera.toLowerCase().includes(filterDtGlobal) ||
        st.materias.some(m => m.nombre.toLowerCase().includes(filterDtGlobal) || m.codigo.toLowerCase().includes(filterDtGlobal));

      const matchName = !filterDtName || st.nombre.toLowerCase().includes(filterDtName);
      const matchReg = !filterDtReg || st.reg.toLowerCase().includes(filterDtReg);
      const matchCarrera = !filterDtCarrera || st.carrera.toLowerCase().includes(filterDtCarrera);

      let estadoStr = '';
      if (st.materias.some(m => m.etapa === 'Habilitada')) estadoStr = 'habilitado';
      else if (st.materias.some(m => m.etapa === 'Evaluación')) estadoStr = 'evaluación';
      else estadoStr = 'foro';

      const matchEstado = !filterDtEstado || estadoStr.includes(filterDtEstado);

      return matchGlobal && matchName && matchReg && matchCarrera && matchEstado;
    });

    if (filtered.length === 0) {
      tbodyEstudiantes.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#8b949e;">No se encontraron estudiantes que coincidan con los filtros.</td></tr>`;
      return;
    }

    filtered.forEach((st, idx) => {
      let statusBadge = '';
      if (st.materias.some(m => m.etapa === 'Habilitada')) {
        statusBadge = '<span class="badge-pill badge-active"><i class="fa-solid fa-circle-check"></i> Matriculado Oficial</span>';
      } else if (st.materias.some(m => m.etapa === 'Evaluación')) {
        statusBadge = '<span class="badge-pill badge-ontrack"><i class="fa-solid fa-scale-balanced"></i> En Evaluación</span>';
      } else {
        statusBadge = '<span class="badge-pill badge-atrisk"><i class="fa-solid fa-comments"></i> En Foro</span>';
      }

      const materiasBadges = st.materias.map(m => {
        const color = m.etapa === 'Habilitada' ? '#60a5fa' : (m.etapa === 'Evaluación' ? '#38bdf8' : '#cbd5e1');
        return `<span class="badge-code" style="color:${color}; display:inline-block; margin:2px;" title="${m.nombre} (${m.turno})">${m.codigo}</span>`;
      }).join(' ');

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color:#6c757d; font-weight:600;">${idx + 1}</td>
        <td>
          <div style="font-weight:600; color:#fff;">${st.nombre}</div>
          <small style="color:#8b949e;">Semestre ${st.semestre}º</small>
        </td>
        <td>
          <span style="font-family:monospace; color:#60a5fa; font-weight:700;">${st.reg}</span>
          <div style="font-size:11px; color:#8b949e;">${st.reg}@upds.net.bo</div>
        </td>
        <td>
          <div style="color:#d1d5db; font-size:13px;">${st.carrera}</div>
        </td>
        <td>${statusBadge}</td>
        <td>${materiasBadges}</td>
        <td style="text-align:center;">
          <button type="button" class="btn-primary-action" onclick="abrirPerfilEstudiante('${st.reg}')" style="padding:4px 10px; font-size:12px; margin:0 auto;">
            <i class="fa-solid fa-id-card"></i> Ver Perfil
          </button>
        </td>
      `;
      tbodyEstudiantes.appendChild(tr);
    });

    const countLabel = document.getElementById('dt-estudiantes-count-label');
    if (countLabel) {
      countLabel.textContent = `Mostrando ${filtered.length} de ${allStudents.length} estudiantes registrados en SOLICITA`;
    }
  }

  /* ===================================================================
     9.2 MODAL PERFIL DEL ESTUDIANTE (REVISIÓN DE MATERIAS Y GRUPOS)
  =================================================================== */
  window.abrirPerfilEstudiante = function (registro) {
    const allStudents = getEstudiantesAgrupados();
    const st = allStudents.find(s => s.reg === registro);
    if (!st) return;

    document.getElementById('perfil-est-nombre').textContent = st.nombre;
    document.getElementById('perfil-est-reg').textContent = st.reg;
    document.getElementById('perfil-est-carrera').textContent = st.carrera;
    document.getElementById('perfil-est-semestre').textContent = `Semestre ${st.semestre}º`;
    document.getElementById('perfil-est-telefono').textContent = `+591 ${st.telefono}`;

    const wpBtn = document.getElementById('perfil-est-whatsapp-btn');
    if (wpBtn) {
      wpBtn.href = `https://wa.me/591${st.telefono}?text=Hola%20${encodeURIComponent(st.nombre)}%2C%20le%20escribimos%20de%20la%20Decanatura%20de%20Ingenier%C3%ADa%20UPDS%20respecto%20a%20su%20solicitud%20en%20SOLICITA.`;
    }

    const containerMaterias = document.getElementById('perfil-est-materias-container');
    if (containerMaterias) {
      containerMaterias.innerHTML = '';
      st.materias.forEach(m => {
        let badgeFase = '';
        let descFase = '';

        if (m.etapa === 'Habilitada') {
          badgeFase = `<span class="badge-pill badge-active"><i class="fa-solid fa-circle-check"></i> Habilitada Oficial (${m.numActa || 'Acta Registrada'})</span>`;
          descFase = `Materia formalmente habilitada y despachada a Registro. Docente Asignado: <strong>${m.docente}</strong> • Turno: <strong>${m.turno}</strong> (${m.espacio}).`;
        } else if (m.etapa === 'Evaluación') {
          badgeFase = `<span class="badge-pill badge-ontrack"><i class="fa-solid fa-scale-balanced"></i> En Mesa de Evaluación</span>`;
          descFase = `Superó el cupo reglamentario de 10 alumnos. En proceso de asignación docente y emisión de acta en Decanato.`;
        } else {
          badgeFase = `<span class="badge-pill badge-atrisk"><i class="fa-solid fa-comments"></i> Activa en Foro (${m.interesados}/10 alumnos)</span>`;
          descFase = `Acumulando votos en la plataforma SOLICITA para alcanzar el umbral mínimo reglamentario.`;
        }

        const card = document.createElement('div');
        card.className = 'student-subject-card';
        card.innerHTML = `
          <div>
            <div style="font-weight:700; color:#fff; font-size:15px;">
              <span class="badge-code" style="color:#60a5fa; margin-right:6px;">${m.codigo}</span>
              ${m.nombre}
            </div>
            <div style="font-size:12px; color:#cbd5e1; margin-top:4px;">
              ${descFase}
            </div>
          </div>
          <div>${badgeFase}</div>
        `;
        containerMaterias.appendChild(card);
      });
    }

    const elPrerreq = document.getElementById('perfil-est-prerreq-nota');
    if (elPrerreq) {
      elPrerreq.innerHTML = `
        El estudiante cuenta con los requisitos curriculares aprobados en el sistema académico UPDS (Promedio previo: <strong>${st.notaPrevia}</strong>).
        No registra bloqueos administrativos ni deudas financieras. <strong>Condición: Apto para matriculación directa.</strong>
      `;
    }

    modalPerfilEstudiante.classList.add('show');
  };

  /* ===================================================================
     9.3 EXPORTACIÓN DE DATOS (CSV Y JSON)
  =================================================================== */
  window.exportarEstudiantesCSV = function () {
    const allStudents = getEstudiantesAgrupados();
    let csv = 'Numero,Registro,Nombre,Carrera,Semestre,Telefono,Materias_Solicitadas,Estado\n';

    allStudents.forEach((st, idx) => {
      const matNames = st.materias.map(m => `${m.codigo} (${m.etapa})`).join('; ');
      let est = st.materias.some(m => m.etapa === 'Habilitada') ? 'Habilitado' : (st.materias.some(m => m.etapa === 'Evaluacion') ? 'En Evaluacion' : 'En Foro');
      csv += `"${idx + 1}","${st.reg}","${st.nombre}","${st.carrera}","${st.semestre}","${st.telefono}","${matNames}","${est}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `padron_estudiantes_solicita_upds_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📄 Padrón de estudiantes exportado exitosamente en formato CSV.');
  };

  window.exportarEstudiantesJSON = function () {
    const allStudents = getEstudiantesAgrupados();
    const jsonStr = JSON.stringify(allStudents, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `padron_estudiantes_solicita_upds_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📊 Padrón de estudiantes exportado exitosamente en formato JSON.');
  };

  function renderAll() {
    renderKPIs();
    renderMateriasForo();
    renderMateriasEvaluacion();
    renderMateriasHabilitadas();
    renderUsuarios();
    renderEstudiantesDataTable();
    if (currentActiveTab === 'tab-estadisticas') {
      renderEstadisticas();
    }
  }

  /* ===================================================================
     10. TRANSICIONES DE ESTADO (ETAPAS SOLICITA)
  =================================================================== */

  // Mover de Pestaña 1 (Foro) a Pestaña 2 (Evaluación)
  window.pasarAEvaluacion = function (materiaId) {
    const idx = UPDS_DATA.materiasForo.findIndex(m => m.id === materiaId);
    if (idx === -1) return;

    const m = UPDS_DATA.materiasForo[idx];

    if (m.interesados < m.metaMinima) {
      alert(`⚠️ La materia "${m.nombre}" aún no alcanza el cupo mínimo requerido (Tiene ${m.interesados}/10 alumnos).`);
      return;
    }

    // Remover de foro
    UPDS_DATA.materiasForo.splice(idx, 1);

    // Default espacio acorde al tipo
    const defaultEspacio = m.tipoRequerido === 'Laboratorio' ? 'LAB-RED-1' : 'AULA-301';

    // Insertar en evaluación
    const evaluacionItem = {
      id: `EVAL-${Date.now().toString().slice(-4)}`,
      codigo: m.codigo,
      nombre: m.nombre,
      carreraId: m.carreraId,
      carreraNombre: m.carreraNombre,
      semestre: m.semestre,
      turno: m.turno,
      horario: UPDS_DATA.turnos.find(t => t.id === m.turno)?.horario || '19:00 a 22:30',
      tipo: m.tipoRequerido,
      espacioAsignado: defaultEspacio,
      docenteAsignadoId: null,
      docenteAsignadoNombre: null,
      interesados: m.interesados,
      metaMinima: 10,
      limite: m.limite,
      recaudacionEstimada: m.interesados * 640,
      honorarioDocente: 2500,
      utilidadInstitucional: (m.interesados * 640) - 2500,
      auxiliarValidador: `${currentUser.nombre} (${currentUser.rol})`,
      alumnos: m.alumnos.map(a => ({ ...a, notaPrevia: '82/100' }))
    };

    UPDS_DATA.materiasEvaluacion.push(evaluacionItem);

    renderAll();
    switchTab('tab-evaluacion');

    showToast(`✅ "${m.nombre}" fue trasladada exitosamente a la Mesa de Evaluación con ${m.interesados} alumnos validados.`);
  };

  // Mover de Pestaña 2 (Evaluación) a Pestaña 3 (Habilitadas)
  window.confirmarHabilitacion = function (materiaId) {
    const idx = UPDS_DATA.materiasEvaluacion.findIndex(m => m.id === materiaId);
    if (idx === -1) return;

    const m = UPDS_DATA.materiasEvaluacion[idx];

    if (!m.docenteAsignadoId) {
      alert('⚠️ Debe asignar un Docente antes de confirmar la habilitación oficial.');
      return;
    }

    const actaCorrelativo = (UPDS_DATA.materiasHabilitadas.length + 89).toString().padStart(3, '0');
    const numActa = `ACTA-DEC-2026-${actaCorrelativo}`;

    const espacioObj = UPDS_DATA.espacios.find(e => e.id === m.espacioAsignado);
    const espacioStr = espacioObj ? `${espacioObj.nombre} (${espacioObj.ubicacion})` : 'Aula por confirmar';

    const habilitadaItem = {
      id: `HAB-${Date.now().toString().slice(-4)}`,
      numActa: numActa,
      codigo: m.codigo,
      nombre: m.nombre,
      carreraId: m.carreraId,
      carreraNombre: m.carreraNombre,
      semestre: m.semestre,
      turno: m.turno,
      horario: m.horario,
      tipo: m.tipo,
      aulaAsignada: espacioStr,
      docenteId: m.docenteAsignadoId,
      docenteNombre: m.docenteAsignadoNombre,
      docenteEspecialidad: 'Docente Especialista Asignado',
      alumnosInscritos: m.alumnos.length,
      fechaAprobacion: new Date().toISOString().split('T')[0],
      aprobadoPor: `${currentUser.nombre} (${currentUser.cargo})`,
      recaudacionTotal: m.recaudacionEstimada,
      honorarioDocente: m.honorarioDocente,
      utilidadUPDS: m.utilidadInstitucional,
      estadoRegistro: 'Enviado a Registro / En proceso de Matriculación',
      alumnos: m.alumnos
    };

    // Actualizar asignación del docente
    const docenteObj = UPDS_DATA.docentes.find(d => d.id === m.docenteAsignadoId);
    if (docenteObj && !docenteObj.asignaciones.includes(m.turno)) {
      docenteObj.asignaciones.push(m.turno);
    }

    // Remover de evaluación y pasar a habilitadas
    UPDS_DATA.materiasEvaluacion.splice(idx, 1);
    UPDS_DATA.materiasHabilitadas.push(habilitadaItem);

    renderAll();
    switchTab('tab-habilitadas');

    showToast(`🎉 ¡Materia Habilitada Oficialmente! Se ha generado el acta ${numActa} y despachado a Registro Central.`);
  };

  /* ===================================================================
     11. MODAL ASIGNAR DOCENTE & ESPACIO (CON ANTI-CRUCE DE HORARIO)
  =================================================================== */
  window.abrirAsignarModal = function (materiaId) {
    activeSubjectId = materiaId;
    const m = UPDS_DATA.materiasEvaluacion.find(item => item.id === materiaId);
    if (!m) return;

    document.getElementById('modal-asig-titulo').textContent = `${m.nombre} (${m.codigo})`;
    document.getElementById('modal-asig-carrera').textContent = `${m.carreraNombre} • Semestre ${m.semestre} • ${m.alumnos.length} Alumnos confirmados`;

    // Populate turnos
    const selectTurno = document.getElementById('asig-turno');
    selectTurno.innerHTML = '';
    UPDS_DATA.turnos.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.id} (${t.horario})`;
      if (t.id === m.turno) opt.selected = true;
      selectTurno.appendChild(opt);
    });

    // Populate espacios
    const selectEspacio = document.getElementById('asig-espacio');
    selectEspacio.innerHTML = '';
    UPDS_DATA.espacios.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = `${e.nombre} - ${e.tipo} (Cap: ${e.capacidad} | ${e.ubicacion})`;
      if (e.id === m.espacioAsignado) opt.selected = true;
      selectEspacio.appendChild(opt);
    });

    // Populate docentes
    const selectDocente = document.getElementById('asig-docente');
    selectDocente.innerHTML = '<option value="">-- Seleccionar Docente Especialista --</option>';
    UPDS_DATA.docentes.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      const turnosOcupados = d.asignaciones.length > 0 ? `[Ocupado: ${d.asignaciones.join(', ')}]` : '[Sin materias asignadas]';
      opt.textContent = `${d.nombre} - ${d.especialidad} ${turnosOcupados}`;
      if (d.id === m.docenteAsignadoId) opt.selected = true;
      selectDocente.appendChild(opt);
    });

    // Resumen académico y de viabilidad
    const elAlumnos = document.getElementById('asig-calc-alumnos');
    const elCapacidad = document.getElementById('asig-calc-capacidad');
    const elMargen = document.getElementById('asig-calc-margen');

    if (elAlumnos) elAlumnos.textContent = `${m.alumnos.length} inscritos`;
    if (elCapacidad) {
      const esp = UPDS_DATA.espacios.find(e => e.id === m.espacioAsignado);
      elCapacidad.textContent = esp ? `${esp.capacidad} cupos (${esp.tipo})` : '30 cupos';
    }
    if (elMargen) {
      if (showFinancials) {
        elMargen.textContent = `Bs ${((m.alumnos.length * 640) - 2500).toLocaleString('es-BO')}`;
      } else {
        elMargen.textContent = '•••••• (Protegido)';
      }
    }

    verificarCruceHorario();
    modalAsignar.classList.add('show');
  };

  window.verificarCruceHorario = function () {
    const selectDocente = document.getElementById('asig-docente');
    const selectTurno = document.getElementById('asig-turno');
    const alertConflict = document.getElementById('asig-conflict-alert');
    const alertAvailable = document.getElementById('asig-available-alert');
    const btnGuardar = document.getElementById('btn-guardar-asignacion');

    const docenteId = selectDocente.value;
    const turnoSeleccionado = selectTurno.value;

    alertConflict.classList.remove('show');
    alertAvailable.classList.remove('show');
    btnGuardar.disabled = false;

    if (!docenteId) return;

    const docente = UPDS_DATA.docentes.find(d => d.id === docenteId);
    if (!docente) return;

    if (docente.asignaciones.includes(turnoSeleccionado)) {
      alertConflict.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation" style="font-size:18px; margin-top:2px;"></i>
        <div>
          <strong>¡Conflicto de Horario Detectado!</strong><br>
          El <strong>${docente.nombre}</strong> ya tiene asignada una materia en el turno <strong>${turnoSeleccionado}</strong>.
          Por normativa docente UPDS, no puede dictar dos materias simultáneas en el mismo turno.
        </div>
      `;
      alertConflict.classList.add('show');
      btnGuardar.disabled = true;
    } else {
      const otrosTurnos = docente.asignaciones.length > 0
        ? `Dicta otra materia en turno <strong>${docente.asignaciones.join(', ')}</strong>, lo cual está permitido por ser turno diferente.`
        : `El docente no tiene ninguna otra carga horaria este módulo.`;

      alertAvailable.innerHTML = `
        <i class="fa-solid fa-circle-check" style="font-size:18px; margin-top:2px;"></i>
        <div>
          <strong>Docente Habilitado para este Turno</strong><br>
          ${otrosTurnos}
        </div>
      `;
      alertAvailable.classList.add('show');
    }
  };

  window.guardarAsignacion = function () {
    if (!activeSubjectId) return;
    const m = UPDS_DATA.materiasEvaluacion.find(item => item.id === activeSubjectId);
    if (!m) return;

    const selectDocente = document.getElementById('asig-docente');
    const selectTurno = document.getElementById('asig-turno');
    const selectEspacio = document.getElementById('asig-espacio');

    if (!selectDocente.value) {
      alert('Por favor elija un docente para esta materia.');
      return;
    }

    const docente = UPDS_DATA.docentes.find(d => d.id === selectDocente.value);
    const turnoObj = UPDS_DATA.turnos.find(t => t.id === selectTurno.value);

    m.docenteAsignadoId = docente.id;
    m.docenteAsignadoNombre = docente.nombre;
    m.turno = selectTurno.value;
    m.horario = turnoObj ? turnoObj.horario : '19:00 a 22:30';
    m.espacioAsignado = selectEspacio.value;

    cerrarModales();
    renderAll();
    showToast(`Asignación guardada: ${docente.nombre} asignado a ${m.nombre}.`);
  };

  /* ===================================================================
     12. MODAL VER ALUMNOS & PRERREQUISITOS
  =================================================================== */
  window.abrirAlumnosModal = function (materiaId) {
    activeSubjectId = materiaId;
    let m = UPDS_DATA.materiasForo.find(item => item.id === materiaId) ||
      UPDS_DATA.materiasEvaluacion.find(item => item.id === materiaId) ||
      UPDS_DATA.materiasHabilitadas.find(item => item.id === materiaId);

    if (!m) return;

    document.getElementById('modal-alumnos-titulo').textContent = `Estudiantes Interesados - ${m.nombre}`;
    document.getElementById('modal-alumnos-sub').textContent = `${m.carreraNombre} • Semestre ${m.semestre} • Demanda: ${m.alumnos.length}/${m.metaMinima || 10} alumnos`;

    const tbody = document.getElementById('tbody-alumnos-modal');
    tbody.innerHTML = '';

    m.alumnos.forEach((al, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:700; color:#adb5bd;">#${i + 1}</td>
        <td style="font-family:monospace; color:#60a5fa;">${al.reg}</td>
        <td style="font-weight:600; color:#fff;">${al.nombre}</td>
        <td>
          <span class="badge-pill badge-active"><i class="fa-solid fa-check"></i> Prerrequisito Aprobado</span>
        </td>
        <td style="color:#9aa0a6;">${al.telefono || '76000000'}</td>
      `;
      tbody.appendChild(tr);
    });

    modalAlumnos.classList.add('show');
  };

  /* ===================================================================
     13. MODAL REGISTRO PRESENCIAL DE ESTUDIANTE (WALK-IN)
  =================================================================== */
  window.abrirModalPresencial = function (materiaId) {
    activeSubjectId = materiaId;
    const m = UPDS_DATA.materiasForo.find(item => item.id === materiaId);
    if (!m) return;

    document.getElementById('presencial-materia-nombre').textContent = `${m.nombre} (${m.codigo})`;
    document.getElementById('reg-nombre').value = '';
    document.getElementById('reg-registro').value = '';
    document.getElementById('reg-telefono').value = '';

    modalPresencial.classList.add('show');
  };

  window.guardarRegistroPresencial = function () {
    if (!activeSubjectId) return;
    const m = UPDS_DATA.materiasForo.find(item => item.id === activeSubjectId);
    if (!m) return;

    const nombre = document.getElementById('reg-nombre').value.trim();
    const registro = document.getElementById('reg-registro').value.trim();
    const telefono = document.getElementById('reg-telefono').value.trim();

    if (!nombre || !registro) {
      alert('Por favor complete el nombre y el número de registro del estudiante.');
      return;
    }

    m.alumnos.push({
      reg: registro,
      nombre: nombre,
      requisitosOk: true,
      telefono: telefono || '70000000'
    });
    m.interesados = m.alumnos.length;

    cerrarModales();
    renderAll();
    showToast(`✅ Estudiante ${nombre} registrado en ventanilla para "${m.nombre}". Ahora son ${m.interesados} estudiantes.`);
  };

  /* ===================================================================
     14. MODAL ACTA OFICIAL DE HABILITACIÓN PARA REGISTRO
  =================================================================== */
  window.abrirActaModal = function (materiaId) {
    const m = UPDS_DATA.materiasHabilitadas.find(item => item.id === materiaId);
    if (!m) return;

    document.getElementById('acta-view-num').textContent = m.numActa;
    document.getElementById('acta-view-fecha').textContent = m.fechaAprobacion;
    document.getElementById('acta-view-materia').textContent = m.nombre;
    document.getElementById('acta-view-codigo').textContent = m.codigo;
    document.getElementById('acta-view-carrera').textContent = m.carreraNombre;
    document.getElementById('acta-view-semestre').textContent = `${m.semestre}º Semestre`;
    document.getElementById('acta-view-turno').textContent = `${m.turno} (${m.horario})`;
    document.getElementById('acta-view-aula').textContent = m.aulaAsignada;
    document.getElementById('acta-view-docente').textContent = m.docenteNombre;
    document.getElementById('acta-view-firma-decano').textContent = m.aprobadoPor;

    const tbody = document.getElementById('acta-students-tbody');
    tbody.innerHTML = '';
    m.alumnos.forEach((al, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align:center;">${idx + 1}</td>
        <td style="font-family:monospace; font-weight:600;">${al.reg}</td>
        <td>${al.nombre}</td>
        <td>Habilitado para Inscripción Directa</td>
      `;
      tbody.appendChild(tr);
    });

    modalActa.classList.add('show');
  };

  window.imprimirActa = function () {
    window.print();
  };

  /* ===================================================================
     15. MODAL NUEVO USUARIO (CON VENCIMIENTO TEMPORAL)
  =================================================================== */
  window.abrirNuevoUsuarioModal = function () {
    document.getElementById('new-user-nombre').value = '';
    document.getElementById('new-user-email').value = '';
    document.getElementById('new-user-rol').value = 'Auxiliar';
    document.getElementById('new-user-cargo').value = '';
    toggleExpirationInput();
    modalNuevoUsuario.classList.add('show');
  };

  window.toggleExpirationInput = function () {
    const rol = document.getElementById('new-user-rol').value;
    const expGroup = document.getElementById('group-expiration-date');
    if (rol === 'Temporal') {
      expGroup.style.display = 'block';
    } else {
      expGroup.style.display = 'none';
    }
  };

  window.guardarNuevoUsuario = function () {
    const nombre = document.getElementById('new-user-nombre').value.trim();
    const email = document.getElementById('new-user-email').value.trim();
    const rol = document.getElementById('new-user-rol').value;
    const cargo = document.getElementById('new-user-cargo').value.trim();
    const expDate = document.getElementById('new-user-exp').value;

    if (!nombre || !email) {
      alert('Por favor complete el nombre y correo institucional.');
      return;
    }

    let expiracionTexto = 'Permanente';
    if (rol === 'Temporal') {
      expiracionTexto = expDate ? `Vence: ${expDate}` : 'Vence: Fin de Módulo (30 días)';
    }

    const roleBadgeMap = {
      'TI / SuperAdmin': 'ti',
      'Decano': 'decano',
      'Auxiliar': 'auxiliar',
      'Temporal': 'temporal'
    };

    const newUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      nombre: nombre,
      correo: email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      rol: rol,
      rolBadge: roleBadgeMap[rol] || 'auxiliar',
      estado: 'Activo',
      estadoBadge: 'active',
      fechaCreacion: new Date().toISOString().split('T')[0],
      expiracion: expiracionTexto,
      cargo: cargo || `${rol} en Decanatura`
    };

    UPDS_DATA.usuarios.push(newUser);
    cerrarModales();
    renderUsuarios();
    showToast(`Usuario ${nombre} creado con rol ${rol} (${expiracionTexto}).`);
  };

  window.eliminarUsuario = function (userId) {
    if (!confirm('¿Está seguro de revocar el acceso a este usuario institucional?')) return;
    const idx = UPDS_DATA.usuarios.findIndex(u => u.id === userId);
    if (idx !== -1) {
      UPDS_DATA.usuarios.splice(idx, 1);
      renderUsuarios();
      showToast('Acceso revocado correctamente.');
    }
  };

  /* ===================================================================
     16. UTILS, TOASTS & EVENT LISTENERS
  =================================================================== */
  window.cerrarModales = function () {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('show'));
  };

  function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #212529;
        border: 1px solid var(--bs-primary);
        color: #fff;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: transform 0.3s ease, opacity 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--bs-primary);"></i> <span>${message}</span>`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
    }, 4000);
  }

  // Global search input
  const globalSearchInput = document.getElementById('global-search-input');
  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', function (e) {
      searchFilter = e.target.value.trim();
      renderAll();
    });
  }

  const roleFilterSelect = document.getElementById('filter-users-role');
  if (roleFilterSelect) {
    roleFilterSelect.addEventListener('change', function (e) {
      roleFilter = e.target.value;
      renderUsuarios();
    });
  }

  // Sidebar toggle
  window.toggleSidebar = function () {
    const sidebar = document.querySelector('.app-sidebar');
    sidebar.classList.toggle('show-mobile');
  };

  /* ===================================================================
     12. CHAT ENTRE USUARIOS (EXACT ADMINLTE 4 SCREENSHOT & UPDS)
  =================================================================== */
  const UPDS_CHAT_DATA = {
    activeContactId: 'c-olivia',
    searchQuery: '',
    callTimerInterval: null,
    callSeconds: 0,
    isMuted: false,
    isCamOn: true,
    contacts: [
      {
        id: 'c-olivia',
        name: 'Olivia Bennett',
        initials: 'OB',
        color: '#0d6efd',
        status: 'Online',
        isTyping: true,
        time: '2m',
        lastSnippet: 'Approved — a few small notes...',
        unread: 2,
        role: 'Decanatura • Revisión de Proyectos',
        messages: [
          { from: 'me', text: 'Just finished going through it. Overall really solid — the new motion primitives are great.', time: '10:40 AM' },
          { from: 'contact', text: 'Glad you like them. Any concerns?', time: '10:40 AM' },
          { from: 'me', text: 'Two small things: the success state on form inputs feels light, and the focus ring is barely visible on dark theme.', time: '10:41 AM' },
          { from: 'contact', text: "Yeah, that focus ring issue has been bugging me too. I'll bump the contrast and ping you for another look.", time: '10:42 AM' },
          { from: 'me', text: 'Sounds good. Otherwise, ship it!', time: '10:42 AM' }
        ]
      },
      {
        id: 'c-marcus',
        name: 'Marcus Reyes',
        initials: 'MR',
        color: '#198754',
        status: 'Online',
        isTyping: false,
        time: '1h',
        lastSnippet: 'Lunch Thursday?',
        unread: 0,
        role: 'Coordinador Académico de Facultad',
        messages: [
          { from: 'contact', text: 'Ing. Roberto, ¿revisó la asignación de aulas para el Módulo 2?', time: '09:15 AM' },
          { from: 'me', text: 'Sí Marcus, el Laboratorio 2 ya está asignado para Telecomunicaciones en la noche.', time: '09:30 AM' },
          { from: 'contact', text: 'Excelente. Lunch Thursday?', time: '10:00 AM' }
        ]
      },
      {
        id: 'c-sara',
        name: 'Sara Khan',
        initials: 'SK',
        color: '#20c997',
        status: 'Offline',
        isTyping: false,
        time: '3h',
        lastSnippet: 'Customer interview notes are up.',
        unread: 0,
        role: 'Soporte y Atención al Estudiante',
        messages: [
          { from: 'contact', text: 'Customer interview notes are up.', time: '08:12 AM' },
          { from: 'me', text: 'Gracias Sara, las tomo en cuenta para la reunión de mesa de hoy.', time: '08:45 AM' }
        ]
      },
      {
        id: 'c-diego',
        name: 'Diego Smania',
        initials: 'DS',
        color: '#b45309',
        status: 'Online',
        isTyping: false,
        time: 'Yesterday',
        lastSnippet: 'PR is ready for review.',
        unread: 1,
        role: 'Administrador TI / Sistemas UPDS',
        messages: [
          { from: 'contact', text: 'Ingeniero, se aplicó el parche para la verificación de anti-cruces de horarios.', time: 'Yesterday' },
          { from: 'contact', text: 'PR is ready for review.', time: 'Yesterday' }
        ]
      },
      {
        id: 'c-emma',
        name: 'Emma Dawson',
        initials: 'ED',
        color: '#dc3545',
        status: 'Offline',
        isTyping: false,
        time: 'Yesterday',
        lastSnippet: 'Heading out, see you Mon.',
        unread: 0,
        role: 'Registro y Admisiones Central',
        messages: [
          { from: 'contact', text: 'Recibimos el Acta ACTA-DEC-2026-088. Apertura de paralelos completada en el sistema.', time: 'Yesterday' },
          { from: 'contact', text: 'Heading out, see you Mon.', time: 'Yesterday' }
        ]
      },
      {
        id: 'c-liam',
        name: 'Liam Carter',
        initials: 'LC',
        color: '#0284c7',
        status: 'Offline',
        isTyping: false,
        time: 'May 16',
        lastSnippet: 'Pushed the calendar fix.',
        unread: 0,
        role: 'Programador de Horarios',
        messages: [
          { from: 'contact', text: 'Pushed the calendar fix.', time: 'May 16' }
        ]
      },
      {
        id: 'c-ketfer',
        name: 'Ketfer Gianella Salazar',
        initials: 'KG',
        color: '#8b5cf6',
        status: 'Online',
        isTyping: false,
        time: 'Just now',
        lastSnippet: 'Ingeniero, ya somos 18 alumnos listos en el foro...',
        unread: 1,
        role: 'Estudiante Delegado • Ing. en Redes',
        messages: [
          { from: 'contact', text: 'Estimado Decano, le escribo en representación de los 18 estudiantes inscritos en el foro para Tecnologías Inalámbricas.', time: '11:00 AM' },
          { from: 'contact', text: 'Ya confirmamos que todos aprobamos Redes II. ¿Podría confirmarnos si se habilitará en el Turno Noche?', time: '11:01 AM' },
          { from: 'me', text: 'Hola Ketfer. Excelente iniciativa, revisamos la solicitud en Decanatura y el quórum es suficiente. En la Mesa de Decisión de hoy asignaremos al docente y aula.', time: '11:05 AM' },
          { from: 'contact', text: '¡Muchísimas gracias Ingeniero! Avisaré de inmediato a mis compañeros por el grupo de WhatsApp.', time: '11:08 AM' }
        ]
      },
      {
        id: 'c-andrea',
        name: 'Lic. Andrea Suárez',
        initials: 'AS',
        color: '#ec4899',
        status: 'Online',
        isTyping: false,
        time: '10m',
        lastSnippet: 'Actas de Sistemas Operativos listas para firma digital.',
        unread: 0,
        role: 'Auxiliar de Decanatura',
        messages: [
          { from: 'contact', text: 'Ing. Roberto, terminé de contrastar los prerrequisitos de los 14 alumnos de Investigación Operativa II.', time: '09:50 AM' },
          { from: 'contact', text: 'Todos cumplen con el 100% de la malla. Ya preparé el borrador del Acta Oficial.', time: '09:52 AM' },
          { from: 'me', text: 'Perfecto Andrea. Procede a adjuntar el número correlativo para enviarlo a Registro Central.', time: '09:55 AM' }
        ]
      }
    ]
  };

  function formatTimeNow() {
    const d = new Date();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  window.renderChat = function () {
    renderChatContacts();
    renderActiveChatConversation();
  };

  function renderChatContacts() {
    const contactsListEl = document.getElementById('chat-contacts-list');
    if (!contactsListEl) return;

    contactsListEl.innerHTML = '';
    const query = UPDS_CHAT_DATA.searchQuery.toLowerCase();

    const filtered = UPDS_CHAT_DATA.contacts.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.role.toLowerCase().includes(query) ||
      c.lastSnippet.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      contactsListEl.innerHTML = `<li style="padding:24px 16px; text-align:center; color:#8b949e; font-size:13px;">No se encontraron contactos.</li>`;
      return;
    }

    filtered.forEach(contact => {
      const isActive = contact.id === UPDS_CHAT_DATA.activeContactId;
      const li = document.createElement('li');
      li.className = `chat-contact-item ${isActive ? 'active' : ''}`;
      li.onclick = () => seleccionarContactoChat(contact.id);

      const unreadBadge = contact.unread > 0
        ? `<span class="chat-unread-badge">${contact.unread}</span>`
        : '';

      li.innerHTML = `
        <div class="chat-contact-avatar" style="background:${contact.color};">
          ${contact.initials}
        </div>
        <div class="chat-contact-info">
          <div class="chat-contact-header">
            <span class="chat-contact-name">${contact.name}</span>
            <span class="chat-contact-time">${contact.time}</span>
          </div>
          <div class="chat-contact-bottom">
            <span class="chat-contact-snippet">${contact.lastSnippet}</span>
            ${unreadBadge}
          </div>
        </div>
      `;
      contactsListEl.appendChild(li);
    });
  }

  function renderActiveChatConversation() {
    const activeContact = UPDS_CHAT_DATA.contacts.find(c => c.id === UPDS_CHAT_DATA.activeContactId);
    if (!activeContact) return;

    // Header info
    const avatarEl = document.getElementById('chat-active-avatar');
    const nameEl = document.getElementById('chat-active-name');
    const statusTextEl = document.getElementById('chat-active-status-text');
    const statusDotEl = document.querySelector('#chat-active-status .status-dot');

    if (avatarEl) {
      avatarEl.textContent = activeContact.initials;
      avatarEl.style.backgroundColor = activeContact.color;
    }
    if (nameEl) nameEl.textContent = activeContact.name;

    if (statusTextEl && statusDotEl) {
      if (activeContact.isTyping) {
        statusTextEl.textContent = 'Online · typing...';
        statusDotEl.className = 'status-dot online';
      } else if (activeContact.status === 'Online') {
        statusTextEl.textContent = 'Online';
        statusDotEl.className = 'status-dot online';
      } else {
        statusTextEl.textContent = 'Offline';
        statusDotEl.className = 'status-dot offline';
      }
    }

    // Messages body
    const bodyEl = document.getElementById('chat-messages-body');
    if (!bodyEl) return;

    bodyEl.innerHTML = '';

    activeContact.messages.forEach(msg => {
      const isOutgoing = msg.from === 'me';
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-msg ${isOutgoing ? 'outgoing' : 'incoming'}`;
      msgDiv.innerHTML = `
        <div class="chat-msg-bubble">${msg.text}</div>
        <div class="chat-msg-time">${msg.time}</div>
      `;
      bodyEl.appendChild(msgDiv);
    });

    // Typing bubble if active
    if (activeContact.isTyping) {
      const typingDiv = document.createElement('div');
      typingDiv.className = 'chat-typing-bubble';
      typingDiv.id = 'chat-typing-indicator';
      typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      `;
      bodyEl.appendChild(typingDiv);
    }

    // Scroll to bottom
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  window.seleccionarContactoChat = function (contactId) {
    UPDS_CHAT_DATA.activeContactId = contactId;
    const contact = UPDS_CHAT_DATA.contacts.find(c => c.id === contactId);
    if (contact) {
      contact.unread = 0;
    }
    renderChatContacts();
    renderActiveChatConversation();
  };

  window.filtrarContactosChat = function (query) {
    UPDS_CHAT_DATA.searchQuery = query;
    renderChatContacts();
  };

  window.handleChatInputKey = function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      enviarMensajeChat();
    }
  };

  window.enviarMensajeChat = function () {
    const input = document.getElementById('chat-text-input');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    const activeContact = UPDS_CHAT_DATA.contacts.find(c => c.id === UPDS_CHAT_DATA.activeContactId);
    if (!activeContact) return;

    const timeNow = formatTimeNow();

    // Add user message
    activeContact.messages.push({
      from: 'me',
      text: text,
      time: timeNow
    });

    activeContact.lastSnippet = text;
    activeContact.time = 'Just now';
    input.value = '';

    renderActiveChatConversation();
    renderChatContacts();

    // Trigger typing and contextual auto-reply
    setTimeout(() => {
      activeContact.isTyping = true;
      renderActiveChatConversation();

      setTimeout(() => {
        activeContact.isTyping = false;

        let autoReply = 'Entendido, procedemos de acuerdo a lo coordinado.';
        if (activeContact.id === 'c-olivia') {
          const replies = [
            "I'll update the PR with those contrast fixes right away. Thanks for the quick feedback!",
            "Great points! Just tested the high-contrast ring and it feels way cleaner now.",
            "Sounds good, shipping the update to staging in 5 mins."
          ];
          autoReply = replies[Math.floor(Math.random() * replies.length)];
        } else if (activeContact.id === 'c-ketfer') {
          autoReply = "¡Excelente noticia Ing. Roberto! Ya les avisé a todos los alumnos por el grupo de WhatsApp. Esperamos la confirmación del aula.";
        } else if (activeContact.id === 'c-andrea') {
          autoReply = "Recibido Decano. Ya incorporé la resolución en el acta oficial para que pase a firma digital.";
        } else if (activeContact.id === 'c-marcus') {
          autoReply = "Anotado en la agenda. Llevo la planilla de docentes para revisar la carga horaria.";
        } else if (activeContact.id === 'c-diego') {
          autoReply = "El servicio de base de datos se actualizó correctamente. Cualquier novedad le aviso de inmediato.";
        }

        const replyTime = formatTimeNow();
        activeContact.messages.push({
          from: 'contact',
          text: autoReply,
          time: replyTime
        });

        activeContact.lastSnippet = autoReply;
        activeContact.time = 'Just now';

        renderActiveChatConversation();
        renderChatContacts();
        showToast(`💬 Mensaje de ${activeContact.name}: "${autoReply.substring(0, 32)}..."`);
      }, 1600);

    }, 500);
  };

  // Call simulation
  window.iniciarLlamadaChat = function (tipo) {
    const activeContact = UPDS_CHAT_DATA.contacts.find(c => c.id === UPDS_CHAT_DATA.activeContactId);
    if (!activeContact) return;

    if (modalLlamada) modalLlamada.classList.add('show');

    const tipoEl = document.getElementById('modal-llamada-tipo');
    const avatarEl = document.getElementById('modal-llamada-avatar');
    const nombreEl = document.getElementById('modal-llamada-nombre');
    const subEl = document.getElementById('modal-llamada-sub');
    const timerEl = document.getElementById('modal-llamada-timer');

    if (tipoEl) tipoEl.textContent = tipo === 'video' ? 'Videollamada en Vivo' : 'Llamada de Voz';
    if (avatarEl) {
      avatarEl.textContent = activeContact.initials;
      avatarEl.style.backgroundColor = activeContact.color;
    }
    if (nombreEl) nombreEl.textContent = activeContact.name;
    if (subEl) subEl.textContent = activeContact.role;
    if (timerEl) timerEl.textContent = 'Conectando...';

    UPDS_CHAT_DATA.callSeconds = 0;
    clearInterval(UPDS_CHAT_DATA.callTimerInterval);

    setTimeout(() => {
      if (timerEl) timerEl.textContent = '00:00';
      UPDS_CHAT_DATA.callTimerInterval = setInterval(() => {
        UPDS_CHAT_DATA.callSeconds++;
        const mins = Math.floor(UPDS_CHAT_DATA.callSeconds / 60).toString().padStart(2, '0');
        const secs = (UPDS_CHAT_DATA.callSeconds % 60).toString().padStart(2, '0');
        if (timerEl) timerEl.textContent = `${mins}:${secs}`;
      }, 1000);
    }, 1500);
  };

  window.finalizarLlamadaChat = function () {
    clearInterval(UPDS_CHAT_DATA.callTimerInterval);
    if (modalLlamada) modalLlamada.classList.remove('show');
    showToast(`📞 Llamada finalizada (${UPDS_CHAT_DATA.callSeconds}s de duración)`);
  };

  window.toggleMuteLlamada = function () {
    UPDS_CHAT_DATA.isMuted = !UPDS_CHAT_DATA.isMuted;
    const btn = document.getElementById('btn-llamada-mute');
    if (btn) {
      btn.innerHTML = UPDS_CHAT_DATA.isMuted ? '<i class="fa-solid fa-microphone-slash"></i>' : '<i class="fa-solid fa-microphone"></i>';
      btn.style.background = UPDS_CHAT_DATA.isMuted ? '#dc3545' : '#2b3036';
    }
    showToast(UPDS_CHAT_DATA.isMuted ? 'Micrófono silenciado' : 'Micrófono activado');
  };

  window.toggleCamLlamada = function () {
    UPDS_CHAT_DATA.isCamOn = !UPDS_CHAT_DATA.isCamOn;
    const btn = document.getElementById('btn-llamada-cam');
    if (btn) {
      btn.innerHTML = UPDS_CHAT_DATA.isCamOn ? '<i class="fa-solid fa-video"></i>' : '<i class="fa-solid fa-video-slash"></i>';
      btn.style.background = UPDS_CHAT_DATA.isCamOn ? '#2b3036' : '#dc3545';
    }
    showToast(UPDS_CHAT_DATA.isCamOn ? 'Cámara activada' : 'Cámara desactivada');
  };

  window.adjuntarArchivoChat = function () {
    const activeContact = UPDS_CHAT_DATA.contacts.find(c => c.id === UPDS_CHAT_DATA.activeContactId);
    if (!activeContact) return;

    const timeNow = formatTimeNow();
    const docText = `📄 Documento adjunto: Acta_Previa_Resolucion_DEC_2026.pdf (1.8 MB)`;

    activeContact.messages.push({
      from: 'me',
      text: docText,
      time: timeNow
    });

    activeContact.lastSnippet = '📄 Documento adjunto';
    activeContact.time = 'Just now';

    renderActiveChatConversation();
    renderChatContacts();
    showToast('📎 Documento adjuntado y enviado al chat.');
  };

  window.insertarEmojiChat = function () {
    const input = document.getElementById('chat-text-input');
    if (input) {
      input.value += ' 👍 ';
      input.focus();
    }
  };

  window.mostrarOpcionesChat = function () {
    showToast('⚙️ Opciones de conversación: Exportar historial, Silenciar notificaciones, Ver perfil.');
  };

  // Close modals clicking outside
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', function (e) {
      if (e.target === this) {
        cerrarModales();
        finalizarLlamadaChat();
      }
    });
  });

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    updateLockscreenUser(currentUser);
    renderAll();
  });

})();
