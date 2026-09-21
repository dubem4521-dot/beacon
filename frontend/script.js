// ========================================
// CONFIG
// ========================================
const API_BASE = 'http://localhost:8000';

// Map list key → <ul> id
const listElementIds = {
  deployed: 'deployed-list',
  infrastructure: 'infra-list',
  portfolio: 'portfolio-list'
};

// Map list key → API category value
const listToCategory = {
  deployed: 'deployed-apps',
  infrastructure: 'infrastructure',
  portfolio: 'portfolio'
};

// Status → CSS class
const statusClassMap = {
  running: 'status-running',
  deploying: 'status-deploying',
  planned: 'status-planned',
  docs: 'status-docs'
};


// ========================================
// VIEW SWITCHING
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  const navButtons = document.querySelectorAll('.nav-btn');
  const views = document.querySelectorAll('.view');

  function switchView(viewId) {
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });
    views.forEach(view => {
      view.classList.toggle('active', view.id === `view-${viewId}`);
    });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const viewId = btn.dataset.view;
      if (viewId === 'logout') return;
      switchView(viewId);
    });
  });

  loadItems();
  setupAddItemModal();
  setupConfirmModal();
});


// ========================================
// LOAD + RENDER ITEMS FROM API
// ========================================
async function loadItems() {
  let items = [];
  try {
    const res = await fetch(`${API_BASE}/items`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    items = await res.json();
  } catch (err) {
    console.error('Failed to load items:', err);
    return;
  }

  const grouped = {
    deployed:       items.filter(i => i.category === 'deployed-apps'),
    infrastructure: items.filter(i => i.category === 'infrastructure'),
    portfolio:      items.filter(i => i.category === 'portfolio')
  };

  for (const [key, listItems] of Object.entries(grouped)) {
    renderList(key, listItems);
  }
}

function renderList(listKey, items) {
  const el = document.getElementById(listElementIds[listKey]);
  if (!el) return;

  el.innerHTML = items.map((item) => {
    const favicon = item.url
      ? `https://www.google.com/s2/favicons?domain=${safeHostname(item.url)}&sz=32`
      : '';

    const icon = favicon
      ? `<img class="item-icon" src="${favicon}" alt="">`
      : '';

    return `
      <li class="status-item">
        <button class="status-btn" data-name="${item.name}" data-url="${item.url || ''}">
          <span class="status-dot ${statusClassMap[item.status] || 'status-planned'}"></span>
          ${icon}
          ${item.name}
          <span class="status-label">${item.label}</span>
        </button>
        <button class="remove-btn" data-id="${item.id}">&times;</button>
      </li>
    `;
  }).join('');
}

function safeHostname(url) {
  try { return new URL(url).hostname; } catch { return ''; }
}


// ========================================
// CLICK HANDLERS (open link, remove)
// ========================================
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.status-btn');
  if (btn && btn.dataset.url) {
    window.open(btn.dataset.url, '_blank', 'noopener');
    return;
  }

  const removeBtn = e.target.closest('.remove-btn');
  if (removeBtn) {
    const id = Number(removeBtn.dataset.id);
    const itemName = removeBtn.closest('.status-item').querySelector('.status-btn').dataset.name;
    openConfirmModal(id, itemName);
  }
});


// ========================================
// ADD-ITEM MODAL
// ========================================
function setupAddItemModal() {
  const modal     = document.getElementById('add-item-modal');
  const nameInput = document.getElementById('new-item-name');
  const urlInput  = document.getElementById('new-item-url');
  const saveBtn   = document.getElementById('modal-save-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');

  let activeList = null;

  function openModal(listKey) {
    activeList = listKey;
    nameInput.value = '';
    urlInput.value = '';
    modal.style.display = 'flex';
    nameInput.focus();
  }

  function closeModal() {
    modal.style.display = 'none';
    activeList = null;
  }

  document.querySelectorAll('.add-item-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.list));
  });

  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  saveBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();

    if (!name || !activeList) return;

    if (url && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const payload = {
      name,
      url: url || null,
      category: listToCategory[activeList],
      status: 'running',
      label: 'RUNNING'
    };

    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      closeModal();
      await loadItems();
    } catch (err) {
      console.error('Failed to create item:', err);
      alert('Failed to add item. Check console.');
    }
  });
}


// ========================================
// CONFIRM-DELETE MODAL
// ========================================
let pendingDeleteId = null;

function setupConfirmModal() {
  const modal     = document.getElementById('confirm-modal');
  const message   = document.getElementById('confirm-message');
  const cancelBtn = document.getElementById('confirm-cancel-btn');
  const deleteBtn = document.getElementById('confirm-delete-btn');

  function closeModal() {
    modal.style.display = 'none';
    pendingDeleteId = null;
  }

  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  deleteBtn.addEventListener('click', async () => {
    if (!pendingDeleteId) return;

    try {
      const res = await fetch(`${API_BASE}/items/${pendingDeleteId}`, {
        method: 'DELETE'
      });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);

      closeModal();
      await loadItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to remove item. Check console.');
    }
  });

  window.openConfirmModal = (id, itemName) => {
    pendingDeleteId = id;
    message.textContent = `Remove "${itemName}" from the list?`;
    modal.style.display = 'flex';
  };
}