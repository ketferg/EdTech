/**
 * ADMINLTE 4 - DECANATURA FACULTAD DE INGENIERÍA UPDS
 * Interactive Logic: 3-Stage Pipeline, Schedule Anti-Collision, Walk-ins, & Users Directory
 * EdTech S.R.L. - UPDS Santa Cruz
 */

(function () {
  'use strict';

  // State
  let currentActiveTab = 'tab-foro'; // 'tab-foro' | 'tab-evaluacion' | 'tab-habilitadas' | 'tab-usuarios'
  let currentUser = UPDS_DATA.usuarios.find(u => u.rol === 'Decano') || UPDS_DATA.usuarios[1];
  let searchFilter = '';
  let roleFilter = 'all';

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

  // KPI elements
  const kpiTotalForo = document.getElementById('kpi-total-foro');
  const kpiTotalEval = document.getElementById('kpi-total-eval');
  const kpiTotalPendientes = document.getElementById('kpi-total-pendientes');
  const kpiTotalHabilitadas = document.getElementById('kpi-total-habilitadas');

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
  const tbodyForo = document.getElementById('tbody-foro');
  const tbodyEvaluacion = document.getElementById('tbody-evaluacion');
  const tbodyHabilitadas = document.getElementById('tbody-habilitadas');
  const tbodyUsuarios = document.getElementById('tbody-usuarios');

  // Modals
  const modalAsignar = document.getElementById('modal-asignar-docente');
  const modalAlumnos = document.getElementById('modal-ver-alumnos');
  const modalActa = document.getElementById('modal-acta-registro');
  const modalNuevoUsuario = document.getElementById('modal-nuevo-usuario');
  const modalPresencial = document.getElementById('modal-solicitud-presencial');

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
      // Unlock with any entered password/PIN (or default 1234)
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
     2. NAVIGATION & TABS
  =================================================================== */
  window.switchTab = function (tabId) {
    currentActiveTab = tabId;

    // Views toggle
    if (tabId === 'tab-usuarios') {
      viewDashboard.style.display = 'none';
      viewUsuarios.style.display = 'block';
      document.getElementById('breadcrumb-current').textContent = 'Directorio de Usuarios';
    } else {
      viewDashboard.style.display = 'block';
      viewUsuarios.style.display = 'none';
      document.getElementById('breadcrumb-current').textContent = 'Materias & Planificación Académica';

      // Pipeline subtabs
      document.querySelectorAll('.pipeline-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
      });

      // Show hide table sections
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
     3. RENDER KPIS & COUNTERS
  =================================================================== */
  function renderKPIs() {
    const totalForo = UPDS_DATA.materiasForo.length;
    const totalEval = UPDS_DATA.materiasEvaluacion.length;
    const totalHab = UPDS_DATA.materiasHabilitadas.length;

    const viablesForo = UPDS_DATA.materiasForo.filter(m => m.interesados >= m.metaMinima).length;
    const pendientesForo = UPDS_DATA.materiasForo.filter(m => m.interesados < m.metaMinima).length;

    if (kpiTotalForo) kpiTotalForo.textContent = totalForo;
    if (kpiTotalEval) kpiTotalEval.textContent = totalEval;
    if (kpiTotalPendientes) kpiTotalPendientes.textContent = pendientesForo;
    if (kpiTotalHabilitadas) kpiTotalHabilitadas.textContent = totalHab;

    if (badgeCountForo) badgeCountForo.textContent = totalForo;
    if (badgeCountEval) badgeCountEval.textContent = totalEval;
    if (badgeCountHab) badgeCountHab.textContent = totalHab;

    if (pillSidebarForo) pillSidebarForo.textContent = totalForo;
    if (pillSidebarEval) pillSidebarEval.textContent = totalEval;
    if (pillSidebarHab) pillSidebarHab.textContent = totalHab;
  }

  /* ===================================================================
     4. RENDER TAB 1: MATERIAS DEL FORO (STAGE 1)
  =================================================================== */
  function renderMateriasForo() {
    if (!tbodyForo) return;
    tbodyForo.innerHTML = '';

    const query = searchFilter.toLowerCase();
    const filtered = UPDS_DATA.materiasForo.filter(m =>
      m.nombre.toLowerCase().includes(query) ||
      m.codigo.toLowerCase().includes(query) ||
      m.carreraNombre.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      tbodyForo.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#8b949e;">No hay materias en el foro que coincidan con la búsqueda.</td></tr>`;
      return;
    }

    filtered.forEach(m => {
      const pct = Math.min(100, Math.round((m.interesados / m.metaMinima) * 100));
      const isViable = m.interesados >= m.metaMinima;
      const statusBadge = isViable
        ? `<span class="badge-pill badge-ontrack"><i class="fa-solid fa-check"></i> Meta Superada (${m.interesados}/10)</span>`
        : `<span class="badge-pill badge-atrisk"><i class="fa-solid fa-clock"></i> Faltan ${m.metaMinima - m.interesados} alumnos</span>`;

      const progressColor = isViable ? 'var(--bs-success)' : (pct >= 70 ? 'var(--bs-info)' : 'var(--bs-warning)');

      // Stacked avatars preview (first 4 + remainder)
      let avatarStack = '<div class="avatar-group">';
      const previewCount = Math.min(4, m.alumnos.length);
      for (let i = 0; i < previewCount; i++) {
        const initials = m.alumnos[i].nombre.split(' ').map(n => n[0]).slice(0, 2).join('');
        const colors = ['#0d6efd', '#6610f2', '#198754', '#d63384', '#fd7e14'];
        const bg = colors[i % colors.length];
        avatarStack += `<div class="avatar-group-item" style="background:${bg}" title="${m.alumnos[i].nombre} (${m.alumnos[i].reg})">${initials}</div>`;
      }
      if (m.alumnos.length > previewCount) {
        avatarStack += `<div class="avatar-group-item avatar-count-bubble">+${m.alumnos.length - previewCount}</div>`;
      }
      avatarStack += '</div>';

      const recaudacionPotencial = (m.interesados * 640).toLocaleString('es-BO');

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <a href="javascript:void(0)" onclick="abrirAlumnosModal('${m.id}')" class="subject-title">${m.nombre}</a>
          <div class="subject-meta">
            <span class="badge-code">${m.codigo}</span>
            <span>${m.carreraNombre}</span>
            <span>• Semestre ${m.semestre}</span>
          </div>
        </td>
        <td>${statusBadge}</td>
        <td>
          <div class="progress-container">
            <div class="progress-track">
              <div class="progress-fill" style="width: ${pct}%; background-color: ${progressColor};"></div>
            </div>
            <span class="progress-pct">${m.interesados}/${m.metaMinima}</span>
          </div>
        </td>
        <td>
          <div style="cursor:pointer;" onclick="abrirAlumnosModal('${m.id}')" title="Clic para ver lista de estudiantes">${avatarStack}</div>
        </td>
        <td>
          <div style="font-weight:600; color:#fff;">Bs ${recaudacionPotencial}</div>
          <small style="color:#8b949e;">(${m.interesados} x Bs 640)</small>
        </td>
        <td>
          <span class="badge-shift"><i class="fa-regular fa-clock"></i> ${m.turno}</span>
          <div style="font-size:11px; color:#8b949e; margin-top:2px;">${m.tipoRequerido}</div>
        </td>
        <td>
          <div class="action-btn-group">
            <button class="action-icon-btn" onclick="abrirAlumnosModal('${m.id}')" title="Ver alumnos y validar prerrequisitos">
              <i class="fa-solid fa-users"></i>
            </button>
            <button class="action-icon-btn" onclick="abrirModalPresencial('${m.id}')" title="Registrar alumno presencial en ventanilla" style="color:var(--bs-edtech-orange);">
              <i class="fa-solid fa-user-plus"></i>
            </button>
            <button class="action-icon-btn btn-approve" ${!isViable ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''} onclick="pasarAEvaluacion('${m.id}')" title="${isViable ? 'Pasar a Mesa de Evaluación y Viabilidad' : 'Requiere al menos 10 estudiantes'}">
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </td>
      `;
      tbodyForo.appendChild(tr);
    });
  }

  /* ===================================================================
     5. RENDER TAB 2: EN EVALUACIÓN Y VIABILIDAD (STAGE 2)
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
      tbodyEvaluacion.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#8b949e;">No hay materias en evaluación actualmente. Pase materias viables desde el foro.</td></tr>`;
      return;
    }

    filtered.forEach(m => {
      const tieneDocente = !!m.docenteAsignadoId;
      const statusBadge = tieneDocente
        ? `<span class="badge-pill badge-ontrack"><i class="fa-solid fa-user-check"></i> Docente Asignado</span>`
        : `<span class="badge-pill badge-delayed"><i class="fa-solid fa-triangle-exclamation"></i> Requiere Asignación</span>`;

      // Espacio name
      const espacioObj = UPDS_DATA.espacios.find(e => e.id === m.espacioAsignado);
      const espacioTexto = espacioObj ? `${espacioObj.nombre} (${espacioObj.capacidad} cap.)` : 'Por asignar';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <a href="javascript:void(0)" onclick="abrirAsignarModal('${m.id}')" class="subject-title">${m.nombre}</a>
          <div class="subject-meta">
            <span class="badge-code">${m.codigo}</span>
            <span>${m.carreraNombre}</span>
          </div>
          <div style="font-size:11px; color:#38bdf8; margin-top:2px;">
            <i class="fa-solid fa-clipboard-check"></i> Validado por Auxiliar (${m.alumnos.length} con requisitos OK)
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
            ${tieneDocente ? `<i class="fa-solid fa-chalkboard-user"></i> ${m.docenteAsignadoNombre}` : '<i class="fa-solid fa-circle-exclamation"></i> Pendiente de Docente'}
          </div>
        </td>
        <td>
          <div style="font-weight:700; color:#4ade80;">Bs ${m.utilidadInstitucional.toLocaleString('es-BO')} Margen</div>
          <small style="color:#9aa0a6;">Recaudo: Bs ${m.recaudacionEstimada.toLocaleString('es-BO')} | Sueldo: Bs ${m.honorarioDocente.toLocaleString('es-BO')}</small>
        </td>
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
     6. RENDER TAB 3: MATERIAS HABILITADAS & ACTAS (STAGE 3)
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
          <div style="font-size:11px; color:#4ade80; margin-top:3px;">Bs ${m.utilidadUPDS.toLocaleString('es-BO')} Superávit</div>
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
     7. RENDER TAB USUARIOS (IMAGE 2)
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

  function renderAll() {
    renderKPIs();
    renderMateriasForo();
    renderMateriasEvaluacion();
    renderMateriasHabilitadas();
    renderUsuarios();
  }

  /* ===================================================================
     8. TRANSICIONES DE ESTADO (ETAPAS SOLICITA)
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

    // Notificación elegante
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

    // Actualizar asignación del docente para que ahora tenga este turno ocupado
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
     9. MODAL ASIGNAR DOCENTE & ESPACIO (CON ANTI-CRUCE DE HORARIO)
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

    // Viability calculations
    document.getElementById('asig-calc-alumnos').textContent = `${m.alumnos.length} inscritos`;
    document.getElementById('asig-calc-ingreso').textContent = `Bs ${(m.alumnos.length * 640).toLocaleString('es-BO')}`;
    document.getElementById('asig-calc-margen').textContent = `Bs ${((m.alumnos.length * 640) - 2500).toLocaleString('es-BO')}`;

    // Run collision check immediately
    verificarCruceHorario();

    // Show modal
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

    if (!docenteId) {
      return;
    }

    const docente = UPDS_DATA.docentes.find(d => d.id === docenteId);
    if (!docente) return;

    // Verificar si el docente ya tiene clase en el MISMO turno
    if (docente.asignaciones.includes(turnoSeleccionado)) {
      alertConflict.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation" style="font-size:18px; margin-top:2px;"></i>
        <div>
          <strong>¡Conflicto de Horario Detectado!</strong><br>
          El <strong>${docente.nombre}</strong> ya tiene asignada una materia en el turno <strong>${turnoSeleccionado}</strong>.
          Por reglamento docente UPDS, un docente no puede dictar dos materias simultáneas en el mismo turno.
        </div>
      `;
      alertConflict.classList.add('show');
      btnGuardar.disabled = true;
    } else {
      const otrosTurnos = docente.asignaciones.length > 0
        ? `Dicta otra materia en turno <strong>${docente.asignaciones.join(', ')}</strong>, lo cual está 100% permitido por ser diferente turno.`
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
     10. MODAL VER ALUMNOS & PRERREQUISITOS
  =================================================================== */
  window.abrirAlumnosModal = function (materiaId) {
    activeSubjectId = materiaId;
    let m = UPDS_DATA.materiasForo.find(item => item.id === materiaId) ||
      UPDS_DATA.materiasEvaluacion.find(item => item.id === materiaId) ||
      UPDS_DATA.materiasHabilitadas.find(item => item.id === materiaId);

    if (!m) return;

    document.getElementById('modal-alumnos-titulo').textContent = `Estudiantes Interesados - ${m.nombre}`;
    document.getElementById('modal-alumnos-sub').textContent = `${m.carreraNombre} • Semestre ${m.semestre} • Meta: ${m.alumnos.length}/${m.metaMinima || 10} alumnos`;

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
     11. MODAL REGISTRO PRESENCIAL DE ESTUDIANTE (WALK-IN)
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

    // Agregar a la lista de estudiantes
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
     12. MODAL ACTA OFICIAL DE HABILITACIÓN PARA REGISTRO
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

    // Student roster in Acta
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
     13. MODAL NUEVO USUARIO (CON VENCIMIENTO TEMPORAL)
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
     14. UTILS, TOASTS & EVENT LISTENERS
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

  // Close modals clicking outside
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', function (e) {
      if (e.target === this) {
        cerrarModales();
      }
    });
  });

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    updateLockscreenUser(currentUser);
    renderAll();
  });

})();
