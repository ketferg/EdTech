'use strict';
const services = [
  { id: 'web', name: 'Página web institucional', price: 2500, desc: 'Presencia web, dominio y diseño adaptado a móviles' },
  { id: 'gestion', name: 'Sistema de gestión académica', price: 8000, desc: 'Notas, inscripciones, kardex y roles para docentes' },
  { id: 'aulas', name: 'Plataforma de aulas virtuales', price: 5500, desc: 'Espacio digital para tareas, exámenes y materiales' },
  { id: 'automatizacion', name: 'Automatización de procesos', price: 3500, desc: 'Digitalización de trámites y solicitudes cero papel' },
  { id: 'asistencia', name: 'Control de asistencia', price: 3000, desc: 'Registro digital mediante código QR y reportes' },
  { id: 'soporte', name: 'Soporte y mantenimiento', price: 600, monthly: true, desc: 'Actualizaciones periódicas, copias de seguridad y soporte' }
];

const storageKey = 'edtech-cotizacion-v1';
let selected = new Set();
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) selected = new Set(saved.filter(id => services.some(service => service.id === id)));
} catch { /* La cotización funciona en memoria si el almacenamiento está bloqueado. */ }
const money = amount => 'Bs ' + new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 }).format(amount);
const dialog = document.querySelector('#quote-dialog');
const list = document.querySelector('#quote-items');
const sendLink = document.querySelector('#quote-send');
const clientNameInput = document.querySelector('#qm-client-name');
const clientInstInput = document.querySelector('#qm-client-inst');
const whatsappUrl = message => 'https://wa.me/59162143492?text=' + encodeURIComponent(message);
let toastTimer;
function notify(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
}

function buildWhatsAppMessage() {
  const chosen = services.filter(service => selected.has(service.id));
  const clientName = (document.querySelector('#qm-client-name')?.value || '').trim();
  const clientInst = (document.querySelector('#qm-client-inst')?.value || '').trim();

  let msg = '👋 ¡Hola Ketfer! ';
  if (clientName) {
    msg += `Mi nombre es *${clientName}*`;
    if (clientInst) {
      msg += ` de *${clientInst}*`;
    }
    msg += '.\n\n';
  } else if (clientInst) {
    msg += `Te escribo de parte de *${clientInst}*.\n\n`;
  } else {
    msg += 'Estuve revisando la web de EdTech y me gustaría cotizar una propuesta personalizada.\n\n';
  }

  if (chosen.length) {
    const initial = chosen.filter(s => !s.monthly).reduce((t, s) => t + s.price, 0);
    const monthly = chosen.filter(s => s.monthly).reduce((t, s) => t + s.price, 0);

    msg += '📋 *Servicios incluidos en mi cotización:*\n';
    chosen.forEach(s => {
      msg += `• ${s.name} (${money(s.price)}${s.monthly ? ' / mes' : ''})\n`;
    });

    msg += `\n💰 *Inversión referencial:* ${money(initial)}`;
    if (monthly) {
      msg += `\n⚙️ *Mantenimiento mensual opcional:* ${money(monthly)} / mes`;
    }
    msg += '\n\n¿Podríamos coordinar una breve llamada o reunión para conocer el alcance y los tiempos de entrega? ¡Muchas gracias!';
  } else {
    msg += 'Quiero conocer más sobre las soluciones y sistemas de EdTech. ¿Podríamos conversar sobre opciones y presupuestos?';
  }
  return msg;
}

function renderQuote() {
  try { localStorage.setItem(storageKey, JSON.stringify([...selected])); } catch { /* Sigue en memoria. */ }
  const qBtn = document.querySelector('.quote-button');
  const countEl = document.querySelector('#quote-count');
  const amountPill = document.querySelector('#quote-amount-pill');
  if (countEl) countEl.textContent = selected.size;
  const countBadgeEl = document.querySelector('#qm-count-badge');
  if (countBadgeEl) countBadgeEl.textContent = `${selected.size} servicio${selected.size === 1 ? '' : 's'}`;

  const chosen = services.filter(service => selected.has(service.id));
  const initial = chosen.filter(service => !service.monthly).reduce((total, service) => total + service.price, 0);
  const monthly = chosen.filter(service => service.monthly).reduce((total, service) => total + service.price, 0);

  if (qBtn) {
    qBtn.classList.toggle('has-items', selected.size > 0);
  }
  if (amountPill) {
    if (selected.size > 0 && initial > 0) {
      amountPill.textContent = money(initial);
      amountPill.style.display = 'inline-block';
    } else {
      amountPill.style.display = 'none';
    }
  }

  document.querySelectorAll('[data-service]').forEach(button => {
    const active = selected.has(button.dataset.service);
    button.setAttribute('aria-pressed', String(active));
    button.textContent = button.dataset.quoteFace === 'back'
      ? (active ? 'Seleccionado ✓' : 'Añadir +')
      : (active ? '✓' : '+');
  });

  if (list) {
    list.replaceChildren();
    if (!chosen.length) {
      const empty = document.createElement('div');
      empty.className = 'qm-empty-note';
      empty.textContent = 'Aún no has seleccionado servicios. Explora las soluciones en la página y presiona el botón «+» para agregarlos aquí.';
      list.append(empty);
    } else {
      chosen.forEach(service => {
        const item = document.createElement('li');
        const main = document.createElement('div');
        main.className = 'qm-item-main';
        
        const titleRow = document.createElement('div');
        titleRow.className = 'qm-item-title-row';
        const check = document.createElement('span');
        check.className = 'qm-item-check';
        check.textContent = '✓';
        const title = document.createElement('span');
        title.className = 'qm-item-title';
        title.textContent = service.name;
        titleRow.append(check, title);

        const desc = document.createElement('span');
        desc.className = 'qm-item-desc';
        desc.textContent = service.desc || '';
        main.append(titleRow, desc);

        const right = document.createElement('div');
        right.className = 'qm-item-right';
        const price = document.createElement('span');
        price.className = 'qm-item-price';
        price.textContent = `${money(service.price)}${service.monthly ? ' / mes' : ''}`;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'qm-remove-btn';
        removeBtn.textContent = 'Quitar';
        removeBtn.setAttribute('aria-label', 'Quitar ' + service.name);
        removeBtn.addEventListener('click', () => {
          selected.delete(service.id);
          renderQuote();
        });
        right.append(price, removeBtn);
        item.append(main, right);
        list.append(item);
      });
    }

    const totalEl = document.querySelector('#quote-summary-total');
    if (totalEl) totalEl.textContent = money(initial);

    const monthlyEl = document.querySelector('#quote-summary-monthly');
    if (monthlyEl) {
      if (monthly > 0) {
        monthlyEl.style.display = 'block';
        monthlyEl.textContent = `+ Mantenimiento opcional: ${money(monthly)} / mes`;
      } else {
        monthlyEl.style.display = 'none';
      }
    }
  }

  const sendBtn = document.querySelector('#quote-send');
  if (sendBtn) {
    sendBtn.href = whatsappUrl(buildWhatsAppMessage());
  }
}

// Live update WhatsApp message when typing name or institution
document.querySelector('#qm-client-name')?.addEventListener('input', () => {
  const sendBtn = document.querySelector('#quote-send');
  if (sendBtn) sendBtn.href = whatsappUrl(buildWhatsAppMessage());
});
document.querySelector('#qm-client-inst')?.addEventListener('input', () => {
  const sendBtn = document.querySelector('#quote-send');
  if (sendBtn) sendBtn.href = whatsappUrl(buildWhatsAppMessage());
});

document.querySelector('.service-grid')?.addEventListener('click', event => {
    const button = event.target.closest('[data-service]');
    if (!button) return;
    const id = button.dataset.service;
    const wasSelected = selected.has(id);
    if (wasSelected) {
      selected.delete(id);
      notify('Servicio retirado de tu cotización.');
    } else {
      selected.add(id);
      notify('Servicio añadido a tu cotización.');

      // Lively pop animation & mini notification badge on the nav button
      const qBtn = document.querySelector('.quote-button');
      if (qBtn) {
        qBtn.classList.remove('quote-pop');
        void qBtn.offsetWidth; // trigger reflow
        qBtn.classList.add('quote-pop');

        const existingToast = qBtn.querySelector('.quote-added-toast');
        if (existingToast) existingToast.remove();
        const toastEl = document.createElement('div');
        toastEl.className = 'quote-added-toast';
        const sName = services.find(s => s.id === id)?.name || 'Servicio';
        toastEl.innerHTML = `<span>✓</span> <span>¡${sName} agregado!</span>`;
        qBtn.appendChild(toastEl);
        setTimeout(() => { if (toastEl.parentNode) toastEl.remove(); }, 2000);
      }
    }
    renderQuote();
});

document.querySelector('[data-open-quote]')?.addEventListener('click', () => dialog?.showModal());
document.querySelector('#close-quote')?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) { closeMenu(); menuButton.focus(); }
});
document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const institution = form.elements.institution.value.trim();
  const message = form.elements.message.value.trim();
  if (!name || !message) { notify('Escribe tu nombre y una breve descripción de tu proyecto.'); return; }
  const text = 'Hola EdTech, soy ' + name + (institution ? ', de ' + institution : '') + '.\n\n' + message;
  window.open(whatsappUrl(text), '_blank', 'noopener,noreferrer');
});
renderQuote();

// Movimiento progresivo: el contenido sigue disponible sin animaciones.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const header = document.querySelector('.header');
const progressBar = document.querySelector('.reading-progress');
let scrollFrame = 0;
function updateScrollPresentation() {
  scrollFrame = 0;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  progressBar.style.transform = 'scaleX(' + progress + ')';
}
window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollPresentation);
}, { passive: true });
window.addEventListener('resize', updateScrollPresentation, { passive: true });
updateScrollPresentation();

let revealObserver;
const revealTargets = document.querySelectorAll('.section-heading, .service, .about-top, .values article, .team-heading, .team-grid article, .product-layout > div, .faq-layout > div, .contact-layout > div, #contact-form');
function configureReveals() {
  revealObserver?.disconnect();
  revealTargets.forEach(element => element.classList.remove('motion-pending'));
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('motion-pending');
      entry.target.classList.add('motion-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
  revealTargets.forEach(element => {
    if (element.classList.contains('motion-visible') || element.getBoundingClientRect().top < window.innerHeight) return;
    const siblings = [...element.parentElement.children];
    const index = siblings.indexOf(element);
    element.style.setProperty('--reveal-delay', Math.min(index % 3, 2) * 85 + 'ms');
    element.classList.add('motion-pending');
    revealObserver.observe(element);
  });
}
configureReveals();
reducedMotion.addEventListener('change', configureReveals);
// Une ancla o el teclado nunca deben dirigir a contenido oculto por una entrada.
function revealFocusedContent(target) {
  if (!(target instanceof Element)) return;
  let current = target;
  while (current) {
    if (current.classList.contains('motion-pending')) {
      current.classList.remove('motion-pending');
      current.classList.add('motion-visible');
      revealObserver?.unobserve(current);
    }
    current = current.parentElement;
  }
}
document.addEventListener('focusin', event => revealFocusedContent(event.target));
let anchorScrollFrame = 0;
let resetScrollBehavior = null;
function cancelAnchorScroll() {
  cancelAnimationFrame(anchorScrollFrame);
  anchorScrollFrame = 0;
  resetScrollBehavior?.();
  resetScrollBehavior = null;
}
window.addEventListener('wheel', cancelAnchorScroll, { passive: true });
window.addEventListener('touchstart', cancelAnchorScroll, { passive: true });
document.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key) && !event.target.closest('input,textarea')) cancelAnchorScroll();
});
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
  if (!target) return;
  event.preventDefault();
  cancelAnchorScroll();
  target.querySelectorAll('.motion-pending').forEach(element => {
    element.classList.remove('motion-pending'); element.classList.add('motion-visible'); revealObserver?.unobserve(element);
  });
  revealFocusedContent(target);
  const begin = window.scrollY;
  const offset = document.querySelector('.header').offsetHeight + 18;
  const end = Math.max(0, Math.min(begin + target.getBoundingClientRect().top - offset, document.documentElement.scrollHeight - window.innerHeight));
  const distance = end - begin;
  const duration = link.classList.contains('skip') ? 0 : Math.min(1000, Math.max(520, Math.abs(distance) * .28));
  const root = document.documentElement;
  const previous = root.style.getPropertyValue('scroll-behavior');
  const previousPriority = root.style.getPropertyPriority('scroll-behavior');
  root.style.setProperty('scroll-behavior', 'auto', 'important');
  resetScrollBehavior = () => {
    if (previous) root.style.setProperty('scroll-behavior', previous, previousPriority);
    else root.style.removeProperty('scroll-behavior');
  };
  link.classList.remove('anchor-travelling');
  requestAnimationFrame(() => link.classList.add('anchor-travelling'));
  setTimeout(() => link.classList.remove('anchor-travelling'), 800);
  let startTime;
  function arrive() {
    cancelAnchorScroll();
    try { if (location.hash !== link.hash) history.pushState(null, '', link.hash); } catch { /* El desplazamiento funciona también en archivos locales. */ }
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
    target.focus({ preventScroll: true });
    const heading = target.querySelector('h2,h3') || target;
    heading.animate?.([{ opacity: .55, transform: 'translateY(9px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
  }
  function step(time) {
    startTime ??= time;
    const progress = duration ? Math.min(1, (time - startTime) / duration) : 1;
    const eased = progress < .5 ? 4 * progress ** 3 : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    window.scrollTo(0, begin + distance * eased);
    if (progress < 1) anchorScrollFrame = requestAnimationFrame(step);
    else arrive();
  }
  anchorScrollFrame = requestAnimationFrame(step);
}));

if ('IntersectionObserver' in window) {
  const activeSections = new Map();
  const links = [...navigation.querySelectorAll('a')];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => activeSections.set(entry.target.id, entry.isIntersecting));
    const activeId = [...document.querySelectorAll('main section[id]')].find(section => activeSections.get(section.id))?.id;
    links.forEach(link => {
      if (link.hash === '#' + activeId) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-20% 0px -45% 0px', threshold: 0 });
  document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
}
document.querySelectorAll('.service').forEach(card => {
  let pointerFrame = 0;
  card.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches || pointerFrame) return;
    const x = event.clientX;
    const y = event.clientY;
    pointerFrame = requestAnimationFrame(() => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--pointer-x', x - bounds.left + 'px');
      card.style.setProperty('--pointer-y', y - bounds.top + 'px');
      pointerFrame = 0;
    });
  }, { passive: true });
});

const serviceDetails = {
  web: {
    description: 'Presenta tu institución con una web que ayude a las personas a encontrar información y dar el siguiente paso: consultar, conocer tu oferta o ponerse en contacto.',
    benefits: ['Organización de secciones, programas y novedades.', 'Diseño adaptable a celulares y computadoras.', 'Canales de consulta y contacto según tu proyecto.']
  },
  gestion: {
    description: 'Convierte información dispersa en un sistema de trabajo. Definimos contigo qué necesita gestionar cada área para reducir duplicaciones y facilitar el seguimiento académico.',
    benefits: ['Módulos para inscripciones, notas u horarios según el alcance.', 'Vistas y permisos definidos para cada tipo de usuario.', 'Consultas y reportes para apoyar la gestión institucional.']
  },
  aulas: {
    description: 'Acerca el aula a estudiantes y docentes con un espacio digital organizado. La propuesta se adapta a cómo enseña tu institución y a las actividades que necesita acompañar.',
    benefits: ['Organización de cursos, contenidos y materiales.', 'Actividades, entregas y evaluaciones según las necesidades.', 'Espacios de comunicación y seguimiento del aprendizaje.']
  },
  automatizacion: {
    description: 'Detectamos tareas repetitivas y diseñamos un recorrido digital más claro. Desde una solicitud hasta su respuesta, buscamos que cada paso tenga información y responsables definidos.',
    benefits: ['Revisión del proceso actual y sus puntos de demora.', 'Flujos de solicitudes, avisos y aprobaciones a medida.', 'Seguimiento de estados para evitar perder información.']
  },
  asistencia: {
    description: 'Organiza el registro de asistencia con una solución digital pensada para tu institución. Definimos cómo registrar, consultar y revisar la información de cada jornada.',
    benefits: ['Registro digital con QR según el escenario de uso.', 'Consulta de asistencia por grupo, fecha o actividad.', 'Reportes para acompañar la revisión administrativa.']
  },
  soporte: {
    description: 'Acompaña la continuidad de tu solución después de su entrega. Acordamos un plan de atención y mantenimiento según los sistemas, las prioridades y las necesidades de tu equipo.',
    benefits: ['Revisión de incidencias y acompañamiento técnico.', 'Actualizaciones y respaldos definidos en el plan.', 'Mejoras y recomendaciones para la evolución del sistema.']
  }
};
const serviceScenes = {
  web: '<div class="mini-browser"><div class="mini-toolbar"><i></i><i></i><i></i><span>Tu institución, en línea</span></div><div class="mini-site"><div class="mini-copy"><b></b><i></i><i></i><span></span></div><div class="mini-picture"><span>↗</span></div><div class="mini-tiles"><i></i><i></i><i></i></div></div><span class="mini-cursor">↖</span></div>',
  gestion: '<div class="mini-dashboard"><div class="mini-sidebar"><b>ET</b><i></i><i></i><i></i></div><div class="mini-chart"><span>Información conectada</span><div class="mini-bars"><i></i><i></i><i></i><i></i><i></i></div><div class="mini-chart-foot"><i></i><i></i></div></div></div>',
  aulas: '<div class="mini-class"><div class="mini-video"><span>▶</span><i></i></div><div class="mini-lessons"><b>Aprender, a tu ritmo</b><span><i>✓</i> Contenidos</span><span><i>✓</i> Actividades</span><span><i>✓</i> Seguimiento</span></div></div>',
  automatizacion: '<div class="mini-flow"><div class="flow-node"><span>▤</span><small>Solicitud</small></div><div class="flow-track"><i></i></div><div class="flow-node"><span>⇄</span><small>Proceso</small></div><div class="flow-track"><i></i></div><div class="flow-node"><span>✓</span><small>Respuesta</small></div></div><span class="mini-caption">Cada paso, mejor conectado.</span>',
  asistencia: '<div class="mini-checkin"><div class="mini-qr"><i></i><i></i><i></i><span class="qr-scan"></span></div><div class="mini-check-copy"><b>Un registro más simple.</b><span class="check-confirm">✓ Registro digital</span><small>Consulta y seguimiento</small></div></div>',
  soporte: '<div class="mini-support"><span class="support-orbit orbit-one"></span><span class="support-orbit orbit-two"></span><span class="support-core">⚙</span><span class="support-satellite">✓</span></div><span class="mini-caption">Tu tecnología, acompañada.</span>'
};
const serviceSceneLabels = { web: 'PRESENCIA DIGITAL', gestion: 'GESTIÓN EN UN SOLO LUGAR', aulas: 'APRENDIZAJE CONECTADO', automatizacion: 'MENOS TAREAS REPETITIVAS', asistencia: 'REGISTRO DIGITAL', soporte: 'CONTINUIDAD Y SOPORTE' };
document.querySelectorAll('.service').forEach(card => {
  const quoteButton = card.querySelector('[data-service]');
  const service = services.find(item => item.id === quoteButton?.dataset.service);
  const details = serviceDetails[service?.id];
  if (!details) return;
  card.classList.add('service-showcase');
  card.dataset.scene = service.id;
  const oldTop = card.querySelector('.service-top');
  const preview = document.createElement('div');
  preview.className = 'service-preview scene-' + service.id;
  preview.setAttribute('aria-hidden', 'true');
  // Plantillas visuales locales; no contienen entradas del usuario.
  preview.innerHTML = serviceScenes[service.id];

  // Demo interactiva: acceso directo desde la foto (cara frontal)
  const demoKey = service.id === 'gestion' ? 'gestion' : (service.id === 'web' ? 'esencial' : (service.id === 'asistencia' ? 'gestion' : null));
  if (demoKey) {
    preview.classList.add('has-interactive-demo');
    preview.dataset.openDemo = demoKey;
    preview.setAttribute('role', 'button');
    preview.setAttribute('tabindex', '0');
    preview.setAttribute('title', 'Haz clic para probar la demo interactiva');
    const demoBadge = document.createElement('span');
    demoBadge.className = 'preview-demo-tag';
    demoBadge.innerHTML = '<span>💻 Demo en Vivo</span> <span class="p-arrow">↗</span>';
    preview.appendChild(demoBadge);
  }

  oldTop.replaceWith(preview);
  const category = document.createElement('span');
  category.className = 'service-category'; category.textContent = serviceSceneLabels[service.id];
  card.insertBefore(category, card.querySelector('h3'));
  const rotor = document.createElement('div'); rotor.className = 'solution-rotor';
  const front = document.createElement('div'); front.className = 'solution-face solution-front';
  while (card.firstChild) front.append(card.firstChild);
  const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'service-explore'; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', 'detail-' + service.id);
  const label = document.createElement('span'); label.textContent = 'Explorar esta solución';
  const arrow = document.createElement('span'); arrow.className = 'explore-arrow'; arrow.textContent = '↺'; arrow.setAttribute('aria-hidden', 'true'); toggle.append(label, arrow);
  const bottom = front.querySelector('.service-bottom'); front.insertBefore(toggle, bottom);
  const back = document.createElement('div'); back.className = 'solution-face solution-back'; back.id = 'detail-' + service.id; back.inert = true; back.setAttribute('aria-hidden', 'true');
  const heading = document.createElement('div'); heading.className = 'solution-back-heading';
  const categoryLabel = document.createElement('span'); categoryLabel.textContent = 'DETALLES DE LA SOLUCIÓN';
  const close = document.createElement('button'); close.type = 'button'; close.className = 'solution-return'; close.textContent = '↶ Volver'; close.setAttribute('aria-label', 'Volver a ' + service.name); heading.append(categoryLabel, close);
  const title = document.createElement('h3'); title.textContent = front.querySelector('h3').textContent;
  const description = document.createElement('p'); description.className = 'solution-description'; description.textContent = details.description;
  const benefits = document.createElement('ul'); benefits.className = 'service-benefits';
  details.benefits.forEach((text, index) => { const item = document.createElement('li'); item.textContent = text; item.style.setProperty('--detail-delay', 320 + index * 90 + 'ms'); benefits.append(item); });
  const note = document.createElement('p'); note.className = 'solution-note'; note.textContent = 'Definimos el alcance contigo, según lo que necesite tu proyecto.';

  // Demo interactiva: acceso en la parte de atrás (al girar la tarjeta)
  if (demoKey) {
    const backDemoBtn = document.createElement('button');
    backDemoBtn.type = 'button';
    backDemoBtn.className = 'btn-card-back-demo';
    backDemoBtn.dataset.openDemo = demoKey;
    backDemoBtn.innerHTML = '<span>💻 Probar Demostración Interactiva en Vivo</span> <span aria-hidden="true">↗</span>';
    back.append(heading, title, description, benefits, backDemoBtn, note, bottom.cloneNode(true));
  } else {
    back.append(heading, title, description, benefits, note, bottom.cloneNode(true));
  }
  rotor.append(front, back); card.append(rotor); card.classList.add('solution-flip');
  function flipSolution(flipped) {
    const visible = flipped ? back : front;
    const hidden = flipped ? front : back;
    visible.inert = false; visible.removeAttribute('aria-hidden');
    (flipped ? close : toggle).focus({ preventScroll: true });
    hidden.inert = true; hidden.setAttribute('aria-hidden', 'true');
    card.classList.toggle('is-flipped', flipped);
    toggle.setAttribute('aria-expanded', String(flipped));
  }
  toggle.addEventListener('click', () => flipSolution(true));
  close.addEventListener('click', () => flipSolution(false));
  card.addEventListener('keydown', event => {
    if (event.key === 'Escape' && card.classList.contains('is-flipped')) { event.preventDefault(); flipSolution(false); }
  });
});
renderQuote();
const serviceGrid = document.querySelector('.service-grid');
serviceGrid.classList.add('service-motion');
if ('IntersectionObserver' in window) {
  const sceneVisibility = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('scene-offscreen', !entry.isIntersecting)), { rootMargin: '100px' });
  serviceGrid.querySelectorAll('.service').forEach(card => sceneVisibility.observe(card));
}

const brandIntro = document.querySelector('#brand-intro');
const introKey = 'edtech-presentacion-amanecer-v3';
const introChapters = [
  { at: 0, title: 'Cada idea es un', accent: 'nuevo amanecer.', message: 'Hoy damos el primer paso. El futuro lo construimos juntos.', label: '01 / IMAGINAMOS' },
  { at: 2450, title: 'El siguiente paso,', accent: 'lo damos juntos.', message: 'Conectamos personas, conocimiento y tecnología para avanzar.', label: '02 / CONECTAMOS' },
  { at: 4900, title: 'Ideas de hoy.', accent: 'Oportunidades de mañana.', message: 'EdTech. Tecnología que nos impulsa hacia adelante.', label: '03 / AVANZAMOS' }
];
let introTimer;
let introClosing = false;
let introPaused = false;
let introElapsed = 0;
let introLastTick = 0;
let introChapter = -1;
function setIntroChapter(index) {
  if (introChapter === index) return;
  introChapter = index;
  const chapter = introChapters[index];
  const title = document.querySelector('#intro-title');
  const accent = document.createElement('span'); accent.textContent = chapter.accent;
  title.classList.remove('is-changing');
  title.replaceChildren(document.createTextNode(chapter.title), document.createElement('br'), accent);
  const message = document.querySelector('#intro-message');
  message.classList.remove('is-changing'); message.textContent = chapter.message;
  document.querySelector('#intro-chapter').textContent = chapter.label;
  requestAnimationFrame(() => { title.classList.add('is-changing'); message.classList.add('is-changing'); });
}
function finishIntro() {
  if (!brandIntro.open || introClosing) return;
  introClosing = true;
  clearInterval(introTimer);
  try { sessionStorage.setItem(introKey, 'seen'); } catch { /* No requiere almacenamiento. */ }
  brandIntro.classList.add('is-leaving');
  setTimeout(() => {
    brandIntro.close();
    brandIntro.classList.remove('is-leaving');
    introClosing = false;
    playHeroEntrance();
  }, introPaused ? 260 : 860);
}
function playIntro() {
  if (brandIntro.open || document.querySelector('dialog[open]')) return;
  introClosing = false;
  introPaused = false;
  introElapsed = 0;
  introChapter = -1;
  brandIntro.classList.remove('is-leaving', 'sp-paused');
  brandIntro.classList.add('sp-motion');
  setIntroChapter(0);
  const animated = brandIntro.querySelectorAll('.sp-bubble, .sp-particle, .sp-ring, .sp-logo-wrap, .sp-sun, .sp-sun-halo, .sp-progress-bar');
  animated.forEach(element => element.style.setProperty('animation', 'none', 'important'));
  brandIntro.showModal();
  // Reinicia también las animaciones terminadas cuando se pulsa Repetir.
  void brandIntro.offsetWidth;
  animated.forEach(element => element.style.removeProperty('animation'));
  introLastTick = performance.now();
  introTimer = setInterval(() => {
    const now = performance.now();
    if (!introPaused) introElapsed += now - introLastTick;
    introLastTick = now;
    if (introElapsed >= 7600) { finishIntro(); return; }
    if (!introPaused) setIntroChapter(introElapsed >= 4900 ? 2 : introElapsed >= 2450 ? 1 : 0);
  }, 80);
}
document.querySelector('#skip-intro').addEventListener('click', finishIntro);
brandIntro.addEventListener('cancel', event => { event.preventDefault(); finishIntro(); });
document.querySelector('[data-replay-intro]').addEventListener('click', playIntro);
let introSeen = false;
try { introSeen = sessionStorage.getItem(introKey) === 'seen'; } catch { /* Funciona también sin almacenamiento. */ }
if (!introSeen) playIntro();
else requestAnimationFrame(() => playHeroEntrance());

// Continúa la presentación con una entrada secuencial de la portada.
const heroScene = document.querySelector('.hero');
let heroEffectsEnabled = true;
let heroEntranceAnimations = [];
let heroStarted = false;
let heroTagTimer;
let heroPointerFrame = 0;
let heroEntranceFallback;
function syncHeroEffects() {
  heroScene.classList.toggle('live-motion', heroStarted);
  heroScene.classList.toggle('effects-paused', !heroEffectsEnabled);
  if (!heroEffectsEnabled) heroEntranceAnimations.forEach(animation => animation.finish());
}
function playHeroEntrance() {
  heroStarted = true;
  clearTimeout(heroEntranceFallback);
  heroEntranceAnimations.forEach(animation => animation.cancel());
  heroEntranceAnimations = [];
  const animate = (element, frames, duration, delay) => {
    if (!element?.animate || !heroEffectsEnabled) return;
    heroEntranceAnimations.push(element.animate(frames, { duration, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }));
  };
  animate(heroScene.querySelector('.hero-copy > .eyebrow'), [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], 900, 50);
  heroScene.querySelectorAll('.hero-line > span').forEach((line, index) => {
    animate(line, [{ opacity: .1, transform: 'translateY(110%) rotate(2deg)' }, { opacity: 1, transform: 'translateY(0) rotate(0)' }], 1250, 120 + index * 140);
  });
  ['.hero-description', '.hero-tags', '.actions', '.hero-footnote'].forEach((selector, index) => {
    animate(heroScene.querySelector(selector), [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], 1000, 500 + index * 110);
  });
  animate(heroScene.querySelector('.hero-photo-plane'), [{ opacity: .35 }, { opacity: 1 }], 1800, 0);
  animate(heroScene.querySelector('.scene-message'), [{ opacity: 0, transform: 'translateY(15px)' }, { opacity: 1, transform: 'none' }], 1100, 850);
  animate(heroScene.querySelector('.hero-bottom'), [{ opacity: 0 }, { opacity: 1 }], 1000, 1000);
  syncHeroEffects();
  // El contenido queda visible aunque el navegador suspenda su reloj de animación.
  heroEntranceFallback = setTimeout(() => {
    heroEntranceAnimations.forEach(animation => {
      if (animation.playState !== 'idle') animation.finish();
    });
  }, 2300);
  updateScrollPresentation();
}
heroScene.addEventListener('pointermove', event => {
  if (!heroEffectsEnabled || !finePointer.matches || heroPointerFrame) return;
  const clientX = event.clientX;
  const clientY = event.clientY;
  heroPointerFrame = requestAnimationFrame(() => {
    const bounds = heroScene.getBoundingClientRect();
    const x = (clientX - bounds.left) / bounds.width;
    const y = (clientY - bounds.top) / bounds.height;
    heroScene.style.setProperty('--scene-x', (x - .5) * -12 + 'px');
    heroScene.style.setProperty('--scene-y', (y - .5) * -8 + 'px');
    heroScene.style.setProperty('--light-x', Math.round(x * 100) + '%');
    heroScene.style.setProperty('--light-y', Math.round(y * 100) + '%');
    heroPointerFrame = 0;
  });
}, { passive: true });
heroScene.addEventListener('pointerleave', () => {
  heroScene.style.setProperty('--scene-x', '0px');
  heroScene.style.setProperty('--scene-y', '0px');
});
const specialtyLinks = [...heroScene.querySelectorAll('.hero-tags > a')];
let specialtyIndex = -1;
heroTagTimer = setInterval(() => {
  if (!heroEffectsEnabled || !heroStarted || document.hidden || heroScene.getBoundingClientRect().bottom < 0) return;
  specialtyLinks.forEach(link => link.classList.remove('is-lit'));
  specialtyIndex = (specialtyIndex + 1) % specialtyLinks.length;
  specialtyLinks[specialtyIndex]?.classList.add('is-lit');
}, 2800);

const scenePhoto = heroScene.querySelector('.hero-background');
const sceneSun = heroScene.querySelector('.hero-sun-glow');
function positionSceneSun() {
  if (!scenePhoto.naturalWidth) return;
  const width = scenePhoto.clientWidth;
  const height = scenePhoto.clientHeight;
  const cover = Math.max(width / scenePhoto.naturalWidth, height / scenePhoto.naturalHeight);
  const rightAligned = window.matchMedia('(max-width: 760px)').matches;
  const offsetX = (width - scenePhoto.naturalWidth * cover) * (rightAligned ? 1 : .5);
  const offsetY = (height - scenePhoto.naturalHeight * cover) * .5;
  // Centro del sol en el archivo original de 1024 × 576, sin modificarlo.
  sceneSun.style.left = offsetX + 887 * cover + 'px';
  sceneSun.style.top = offsetY + 198 * cover + 'px';
  sceneSun.style.setProperty('--sun-core', 24 * cover + 'px');
}
scenePhoto.addEventListener('load', positionSceneSun);
window.addEventListener('resize', positionSceneSun, { passive: true });
positionSceneSun();


/* =========================================================
   HERO SUNSET PARTICLES ENGINE (Golden stardust & embers)
   Active on all devices, high-DPI, 60fps canvas
   ========================================================= */
function initHeroParticles() {
  const canvas = document.querySelector('#hero-particles-canvas');
  if (!canvas) return;
  const hero = canvas.closest('.hero') || canvas.parentElement;
  if (!hero) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let animationId = 0;
  const particles = [];
  const count = 38;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  const emberPalette = [
    { r: 255, g: 180, b: 65 },   // Warm amber
    { r: 255, g: 215, b: 110 },  // Twilight gold
    { r: 255, g: 152, b: 32 },   // EdTech sunset orange
    { r: 255, g: 245, b: 195 }   // Shimmering white-gold
  ];

  class HeroParticle {
    constructor(randomY = false) {
      this.reset(randomY);
    }
    reset(randomY = false) {
      // Confine particles to sunset sky and right city area (avoiding left text blockage)
      const startX = width > 768 ? width * 0.34 : 0;
      const spanX = width > 768 ? width * 0.66 : width;
      this.x = startX + Math.random() * spanX;
      // Focus particles in the sky above the city and students
      this.y = randomY ? Math.random() * height * 0.78 : height * 0.78 + Math.random() * 20;
      this.radius = Math.random() * 1.8 + 1.0;
      this.baseAlpha = Math.random() * 0.5 + 0.3;
      this.vy = -(Math.random() * 0.32 + 0.18); // gentle upward float
      this.vx = (Math.random() - 0.48) * 0.26;  // gentle drift
      this.pulseSpeed = Math.random() * 0.03 + 0.016;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.swayAmp = Math.random() * 0.35 + 0.15;
      this.color = emberPalette[Math.floor(Math.random() * emberPalette.length)];
    }
    update() {
      this.pulsePhase += this.pulseSpeed;
      this.x += Math.sin(this.pulsePhase) * this.swayAmp + this.vx;
      this.y += this.vy;

      // Mouse gentle breeze repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 120 && dist > 0) {
        const force = ((120 - dist) / 120) * 0.5;
        this.x += (dx / dist) * force;
        this.y += (dy / dist) * force;
      }

      if (this.y < -15 || this.x < -25 || this.x > width + 25) {
        this.reset(false);
      }
    }
    draw() {
      const alpha = Math.max(0.12, this.baseAlpha + Math.sin(this.pulsePhase) * 0.25);
      const c = this.color;
      const glowR = this.radius * 3.8;

      // Outer soft glowing aura
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowR);
      grad.addColorStop(0, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (alpha * 0.95) + ')');
      grad.addColorStop(0.35, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (alpha * 0.45) + ')');
      grad.addColorStop(1, 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Sharp incandescent core
      ctx.fillStyle = 'rgba(255, 255, 240, ' + Math.min(1, alpha * 1.35) + ')';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  resize();
  for (let i = 0; i < count; i++) {
    particles.push(new HeroParticle(true));
  }

  function loop() {
    if (document.hidden) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    animationId = requestAnimationFrame(loop);
  }

  loop();

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animationId);
    else loop();
  });

  hero.addEventListener('pointermove', e => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });

  hero.addEventListener('pointerleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });
}

/* =========================================================
   FLOATING HEXAGON CANVAS (Nahuel-inspired ambient background)
   ========================================================= */
function initHexagonParticles() {
  const canvas = document.querySelector('#edtech-hex-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let animationId = null;
  let mouse = { x: -9999, y: -9999 };

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Count adapted to screen width
  const count = Math.max(9, Math.min(18, Math.floor(window.innerWidth / 100)));
  const hexagons = [];

  // Nahuel portafolio: #1b1e34 dark semi-transparent polygons, radius 60-140px, no bright lines
  class Hexagon {
    constructor(initialRandom = true) {
      this.reset(initialRandom);
    }
    reset(initialRandom = false) {
      // Large geometric polygon size matching Nahuel (size 160)
      this.radius = 70 + Math.random() * 85; 
      this.x = Math.random() * (width || window.innerWidth);
      this.y = initialRandom ? Math.random() * (height || window.innerHeight) : (height || window.innerHeight) + this.radius + 40;
      this.speedX = (Math.random() - 0.5) * 0.28;
      this.speedY = -0.18 - Math.random() * 0.32; // calm, majestic upward drift
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.0016; // very slow, smooth rotation
      // Exact Nahuel opacity: 0.18 to 0.34 (semi-transparent dark)
      this.baseOpacity = 0.18 + Math.random() * 0.16;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.006 + Math.random() * 0.010;
      // Exact Nahuel color: #1b1e34 (rgb: 27, 30, 52) with subtle organic depth
      const r = 25 + Math.floor(Math.random() * 6);
      const g = 28 + Math.floor(Math.random() * 6);
      const b = 50 + Math.floor(Math.random() * 8);
      this.rgb = r + ', ' + g + ', ' + b;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotSpeed;
      this.pulsePhase += this.pulseSpeed;

      // Subtle mouse reaction
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 220 && dist > 0) {
        const force = ((220 - dist) / 220) * 0.3;
        this.x += (dx / dist) * force;
        this.y += (dy / dist) * force;
      }

      if (this.y < -this.radius - 80 || this.x < -this.radius - 80 || this.x > width + this.radius + 80) {
        this.reset(false);
      }
    }
    draw() {
      const currentOpacity = Math.max(0.12, this.baseOpacity + Math.sin(this.pulsePhase) * 0.05);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const hx = this.radius * Math.cos(angle);
        const hy = this.radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();

      // Exact Nahuel #1b1e34 semi-transparent fill
      ctx.fillStyle = 'rgba(' + this.rgb + ', ' + currentOpacity + ')';
      ctx.fill();

      // Soft polygon edge (subtle dark outline matching Nahuel's borderless look)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(' + this.rgb + ', ' + (currentOpacity * 1.35) + ')';
      ctx.stroke();

      ctx.restore();
    }
  }

  resize();
  for (let i = 0; i < count; i++) {
    hexagons.push(new Hexagon(true));
  }

  function loop() {
    if (document.hidden) return;
    ctx.clearRect(0, 0, width, height);

    // Draw each hexagon (clean, no bright web lines, exactly as Nahuel repo)
    for (let i = 0; i < hexagons.length; i++) {
      hexagons[i].update();
      hexagons[i].draw();
    }
    animationId = requestAnimationFrame(loop);
  }

  // Always running
  loop();

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      loop();
    }
  });

  window.addEventListener('pointermove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });
}

/* =========================================================
   CONTACT TYPEWRITER & INTERACTION (Nahuel style)
   ========================================================= */
function initContactTypewriter() {
  const target = document.querySelector('#c3d-typed-target');
  const cursor = document.querySelector('.c3d-cursor');
  if (!target) return;

  // Exact order of icons on screen:
  const channels = [
    { name: 'Gmail', color: '#ff3344' },
    { name: 'WhatsApp', color: '#25D366' },
    { name: 'Instagram', color: '#E1306C' },
    { name: 'Telegram', color: '#1DA1F2' },
    { name: 'Facebook', color: '#1877F2' },
    { name: 'TikTok', color: '#25F4EE' }
  ];

  let channelIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let isUserHovering = false;
  let typingTimer = null;

  function applyActiveColor(color, glowPx) {
    target.style.setProperty('color', color, 'important');
    target.style.setProperty('text-shadow', '0 0 ' + glowPx + ' ' + color, 'important');
    if (cursor) {
      cursor.style.setProperty('color', color, 'important');
      cursor.style.setProperty('text-shadow', '0 0 14px ' + color, 'important');
    }
  }

  function step() {
    if (isUserHovering) return; // Pauses when user touches or hovers an icon!

    const current = channels[channelIdx];
    const fullText = current.name;

    if (isDeleting) {
      charIdx--;
      target.textContent = fullText.substring(0, charIdx);
    } else {
      charIdx++;
      target.textContent = fullText.substring(0, charIdx);
    }

    applyActiveColor(current.color, '18px');

    // Slightly slower and smoother for optimal legibility
    let delay = isDeleting ? 65 : 125;

    // Finished typing full word -> pause before deleting
    if (!isDeleting && charIdx === fullText.length) {
      delay = 2500;
      isDeleting = true;
    }
    // Finished deleting -> advance to next channel in order
    else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      channelIdx = (channelIdx + 1) % channels.length;
      delay = 450;
    }

    typingTimer = setTimeout(step, delay);
  }

  // Start typewriter loop
  step();

  // If user touches or hovers an icon:
  document.querySelectorAll('.c3d-item').forEach(item => {
    const channelName = item.dataset.channel;
    const matched = channels.find(c => c.name.toLowerCase() === (channelName || '').toLowerCase());

    const onEnter = () => {
      isUserHovering = true;
      clearTimeout(typingTimer);
      if (matched) {
        target.textContent = matched.name;
        applyActiveColor(matched.color, '22px');
      }
    };

    const onLeave = () => {
      isUserHovering = false;
      clearTimeout(typingTimer);
      // Resume cycling from the next channel after a brief pause
      isDeleting = true;
      charIdx = target.textContent.length;
      typingTimer = setTimeout(step, 1000);
    };

    item.addEventListener('mouseenter', onEnter);
    item.addEventListener('focus', onEnter);
    item.addEventListener('mouseleave', onLeave);
    item.addEventListener('blur', onLeave);
    item.addEventListener('touchstart', onEnter, { passive: true });
  });
}

// Ensure execution when DOM is ready

/* =========================================================
   SHOWROOM & DEMO MODAL CONTROLLER ("Hacemos así")
   ========================================================= */
function initPlansShowroom() {
  const modal = document.querySelector('#demo-modal');
  if (!modal) return;

  const urlDisplay = document.querySelector('#demo-url-display');
  const closeBtn = document.querySelector('#close-demo-modal');
  const tabBtns = document.querySelectorAll('.demo-tab-btn');
  const tabContents = document.querySelectorAll('.demo-tab-content');
  const demoViews = document.querySelectorAll('.demo-view');

  const acquireTitle = document.querySelector('#acquire-modal-title');
  const acquirePrice = document.querySelector('#acquire-price-val');
  const acquireBtn = document.querySelector('#btn-acquire-whatsapp');
  const acquireName = document.querySelector('#acquire-name');
  const acquireInst = document.querySelector('#acquire-institution');

  let currentPlan = 'gestion';

  const planData = {
    esencial: {
      name: 'Plan Esencial',
      price: 'Bs 2.500',
      url: 'https://edtech.bo/showroom/portal-institucional-web',
      viewClass: '.demo-view-esencial'
    },
    gestion: {
      name: 'Plan Gestión',
      price: 'Bs 8.000',
      url: 'https://edtech.bo/showroom/sistema-gestion-academica',
      viewClass: '.demo-view-gestion'
    },
    campus: {
      name: 'Campus 360°',
      price: 'Bs 13.500',
      url: 'https://edtech.bo/showroom/campus-virtual',
      viewClass: '.demo-view-campus'
    }
  };

  function selectTab(tabKey) {
    tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabKey));
    tabContents.forEach(content => content.classList.toggle('active', content.id === 'tab-' + tabKey));
  }

  function setPlanView(planKey) {
    currentPlan = planKey;
    const data = planData[planKey] || planData.gestion;

    if (urlDisplay) urlDisplay.textContent = data.url;
    if (acquireTitle) acquireTitle.textContent = 'Propuesta de Adquisición: ' + data.name;
    if (acquirePrice) acquirePrice.textContent = data.price;

    demoViews.forEach(view => view.classList.remove('active'));
    const targetView = document.querySelector(data.viewClass);
    if (targetView) targetView.classList.add('active');
  }

  function openShowroom(planKey, tabKey = 'preview') {
    setPlanView(planKey);
    selectTab(tabKey);
    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }
  }

  function closeShowroom() {
    if (typeof modal.close === 'function') {
      modal.close();
    } else {
      modal.removeAttribute('open');
    }
  }

  // Delegated click listeners so any button or photo with [data-open-demo] works dynamically
  document.addEventListener('click', e => {
    const demoTrigger = e.target.closest('[data-open-demo]');
    if (demoTrigger) {
      e.preventDefault();
      e.stopPropagation();
      openShowroom(demoTrigger.dataset.openDemo || 'gestion', 'preview');
      return;
    }
    const acqTrigger = e.target.closest('[data-open-acquire]');
    if (acqTrigger) {
      e.preventDefault();
      e.stopPropagation();
      openShowroom(acqTrigger.dataset.openAcquire || 'gestion', 'acquire');
      return;
    }
  });

  // Expose to window for direct calls
  window.openEdTechShowroom = openShowroom;

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => selectTab(btn.dataset.tab));
  });

  // Modal close handlers
  closeBtn?.addEventListener('click', closeShowroom);
  modal.addEventListener('click', e => {
    const rect = modal.getBoundingClientRect();
    if (e.target === modal && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) {
      closeShowroom();
    }
  });

  // QR SCANNER SIMULATOR INTERACTION
  const btnTriggerQr = document.querySelector('#btn-trigger-qr');
  const qrLaser = document.querySelector('#qr-laser-line');
  const qrSuccess = document.querySelector('#qr-success-badge');
  const qrLogEntry = document.querySelector('#qr-log-entry');
  const attendancePct = document.querySelector('#demo-attendance-pct');

  const mockStudents = [
    { name: 'Mateo Fernández Ramos', grade: '5to Secundaria B', time: '07:42 AM', stat: 'Puntual' },
    { name: 'Sofía Valverde Cortez', grade: '4to Secundaria A', time: '07:44 AM', stat: 'Puntual' },
    { name: 'Lucas Morales Justiniano', grade: '6to Secundaria C', time: '07:45 AM', stat: 'Puntual' },
    { name: 'Valentina Rojas Méndez', grade: '3ro Secundaria A', time: '07:46 AM', stat: 'Puntual' }
  ];
  let studentIdx = 0;

  btnTriggerQr?.addEventListener('click', () => {
    if (!qrLaser || !qrSuccess) return;

    btnTriggerQr.disabled = true;
    btnTriggerQr.style.opacity = '0.7';

    // Start laser animation
    qrLaser.classList.add('scanning');
    qrSuccess.classList.remove('show');

    setTimeout(() => {
      qrLaser.classList.remove('scanning');
      qrSuccess.classList.add('show');

      // Update student log
      studentIdx = (studentIdx + 1) % mockStudents.length;
      const s = mockStudents[studentIdx];
      if (qrLogEntry) {
        qrLogEntry.innerHTML = '<strong>' + s.name + '</strong> (' + s.grade + ')<br><small>Hora: ' + s.time + ' · Asistencia: <em>' + s.stat + '</em> · Notificación enviada ✓</small>';
      }
      if (attendancePct) {
        attendancePct.textContent = '95.' + (4 + studentIdx) + '%';
      }

      setTimeout(() => {
        qrSuccess.classList.remove('show');
        btnTriggerQr.disabled = false;
        btnTriggerQr.style.opacity = '1';
      }, 1600);
    }, 750);
  });

  // MOCK WEBSITE PRE-REGISTRATION
  const btnMockApply = document.querySelector('#btn-mock-apply');
  const mockApplySuccess = document.querySelector('#mock-apply-success');
  btnMockApply?.addEventListener('click', () => {
    if (mockApplySuccess) {
      mockApplySuccess.style.display = 'block';
      btnMockApply.textContent = '✓ Preinscripción Enviada';
      btnMockApply.disabled = true;
      btnMockApply.style.background = '#2ed573';
    }
  });

  // ACQUIRE VIA WHATSAPP HANDLER
  acquireBtn?.addEventListener('click', () => {
    const data = planData[currentPlan] || planData.gestion;
    const name = (acquireName?.value || '').trim() || 'un cliente interesado';
    const inst = (acquireInst?.value || '').trim();

    let text = 'Hola Ketfer Gianella (EdTech), soy ' + name + (inst ? ', de ' + inst : '') + '.\n\n';
    text += 'Estuve probando la demo en vivo de *' + data.name + '* (' + data.price + ') en su sitio web y me interesa iniciar el proceso de contratación formal para mi institución.';

    const phone = '59162143492';
    const url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initHeroParticles();
    initHexagonParticles();
    initContactTypewriter();
    initPlansShowroom();
  });
} else {
  initHeroParticles();
  initHexagonParticles();
  initContactTypewriter();
  initPlansShowroom();
}
