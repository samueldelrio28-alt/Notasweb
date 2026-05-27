// Protección de ruta
const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) window.location.href = '/login.html';

// Referencias DOM
const appContent     = document.getElementById('app-content');
const pageTitle      = document.getElementById('pageTitle');
const pageDesc       = document.getElementById('pageDescription');
const pageStats      = document.getElementById('pageStats');
const statsBar       = document.getElementById('statsBar');
const overlay        = document.getElementById('overlay');
const modal          = document.getElementById('modal');
const noteForm       = document.getElementById('noteForm');
const inputTitle     = document.getElementById('inputTitle');
const inputContent   = document.getElementById('inputContent');
const colorDots      = document.querySelectorAll('.color');
const btnNuevaNota   = document.getElementById('btnNuevaNota');
const btnCancelar    = document.getElementById('cancelNote');
const btnGuardar     = document.getElementById('btnGuardar');

// Estado
let colorActivo = '#ff4d4d';
let paginaActiva = '';

// Nombre en sidebar
document.getElementById('nombre-usuario').textContent = usuario.nombreUser;

// NAVEGACIÓN
function navegarA(pagina) {
  if (paginaActiva === pagina) return;
  paginaActiva = pagina;

  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.page === pagina)
  );

  btnNuevaNota.style.display = pagina === 'notas' ? 'flex' : 'none';
  statsBar.style.display     = pagina === 'notas' ? 'flex' : 'none';

  if (pagina === 'notas')  renderNotas();
  if (pagina === 'perfil') renderPerfil();
}

// PÁGINA: NOTAS
async function renderNotas() {
  pageTitle.textContent = 'Mis notas';
  pageDesc.textContent  = 'Crea, edita y organiza tus ideas.';
  pageStats.textContent = '…';
  appContent.innerHTML  = '<div class="empty-state"><i class="bi bi-hourglass-split"></i><p>Cargando notas…</p></div>';

  try {
    const res   = await fetch(`/api/notas?id_usuario=${usuario.id_usuarios}`);
    const notas = await res.json();

    pageStats.textContent = notas.length;
    appContent.innerHTML  = '';

    if (!notas.length) {
      appContent.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-journal-plus"></i>
          <p>No tienes notas todavía.<br>Crea tu primera nota.</p>
        </div>`;
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'notes-grid';
    notas.forEach((n, i) => {
      const card = crearTarjeta(n);
      card.style.animationDelay = `${i * 40}ms`;
      grid.appendChild(card);
    });
    appContent.appendChild(grid);

  } catch {
    appContent.innerHTML = '<div class="empty-state"><i class="bi bi-wifi-off"></i><p>No se pudo conectar con el servidor.</p></div>';
  }
}

// TARJETA DE NOTA
function crearTarjeta(nota) {
  const fecha = new Date(nota.fecha_creacion).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const card = document.createElement('div');
  card.className = 'card-note';
  card.style.background = nota.color || '#e8f4ff';

  card.innerHTML = `
    <h5>${escapeHtml(nota.titulo)}</h5>
    <p>${escapeHtml(nota.contenido || '')}</p>
    <div class="note-date">${fecha}</div>
    <div class="note-actions">
      <button class="btn btn-sm btn-dark btn-archive">
        <i class="bi bi-archive"></i> Archivar
      </button>
    </div>
  `;

  card.querySelector('.btn-archive').onclick = async () => {
    await fetch(`/api/notas/${nota.id_nota}/archivar`, { method: 'PATCH' });
    toast('Nota archivada', 'success');
    renderNotas();
  };

  return card;
}

// PÁGINA: PERFIL
function renderPerfil() {
  pageTitle.textContent = 'Mi perfil';
  pageDesc.textContent  = 'Información de tu cuenta.';

  appContent.innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar"><i class="bi bi-person-fill"></i></div>
      <div class="profile-name">${escapeHtml(usuario.nombreUser)}</div>
      <div class="profile-email">${escapeHtml(usuario.emailUser)}</div>
      <div class="profile-id">ID de usuario &nbsp;#${usuario.id_usuarios}</div>
    </div>
  `;
}

// MODAL
function abrirModal() {
  overlay.classList.add('show');
  modal.classList.add('show');
  inputTitle.focus();
}

function cerrarModal() {
  overlay.classList.remove('show');
  modal.classList.remove('show');
  noteForm.reset();
  elegirColor('#ff4d4d');
}

function elegirColor(color) {
  colorActivo = color;
  colorDots.forEach(d => d.classList.toggle('selected', d.dataset.color === color));
}

noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const titulo    = inputTitle.value.trim();
  const contenido = inputContent.value.trim();

  if (!titulo || !contenido) {
    toast('Título y contenido son obligatorios', 'warning');
    return;
  }

  btnGuardar.disabled = true;
  try {
    const res = await fetch('/api/notas', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: usuario.id_usuarios,
        titulo,
        contenido,
        color: colorActivo
      })
    });

    if (!res.ok) throw new Error();
    cerrarModal();
    toast('Nota guardada', 'success');
    renderNotas();
  } catch {
    toast('Error al guardar la nota', 'danger');
  } finally {
    btnGuardar.disabled = false;
  }
});

// CERRAR SESIÓN
function cerrarSesion() {
  localStorage.removeItem('usuario');
  window.location.href = '/login.html';
}

// TOAST
const iconoToast = { success: 'bi-check-circle-fill', warning: 'bi-exclamation-triangle-fill', danger: 'bi-x-circle-fill' };

function toast(msg, tipo = 'success') {
  const el = document.createElement('div');
  el.className = `toast-msg toast-${tipo}`;
  el.innerHTML = `<i class="bi ${iconoToast[tipo] || 'bi-info-circle'}"></i> ${msg}`;
  document.getElementById('toast').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// UTILIDADES
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// EVENTOS
btnNuevaNota.addEventListener('click', abrirModal);
btnCancelar.addEventListener('click', cerrarModal);
overlay.addEventListener('click', cerrarModal);

colorDots.forEach(d => d.addEventListener('click', () => elegirColor(d.dataset.color)));

document.querySelectorAll('.nav-btn[data-page]').forEach(btn =>
  btn.addEventListener('click', () => navegarA(btn.dataset.page))
);

navegarA('notas');