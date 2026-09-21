document.addEventListener('DOMContentLoaded', () => {
  // VIEW SWITCHING

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
      if (viewId === 'logout') {
        return;
      }
      switchView(viewId);
    });
  });

  renderStatus();
  setupAddItemModal();
  setupConfirmModal(); 
});


// STATUS DATA

async function loadItems() {
  const res = await fetch('http://localhost:8000/items');
  const items = await res.json();
  
  // Group by category
  const deployed = items.filter(i => i.category === 'deployed-apps');
  const infra = items.filter(i => i.category === 'infrastructure');
  const portfolio = items.filter(i => i.category === 'portfolio');
  
  // Render each group
  renderList('deployed-list', deployed);
  renderList('infra-list', infra);
  renderList('portfolio-list', portfolio);
}

const statusClassMap = {
  running: 'status-running',
  deploying: 'status-deploying',
  planned: 'status-planned',
  docs: 'status-docs'
};

// map each list key to its <ul> id
const listElementIds = {
  deployed: 'deployed-list',
  infrastructure: 'infra-list',
  portfolio: 'portfolio-list'
};

function renderList(listKey) {
  const el = document.getElementById(listElementIds[listKey]);
  if (!el) return;

  el.innerHTML = statusData[listKey].map((item, index) => {
    const icon = item.icon
      ? `<img class="item-icon" src="${item.icon}" alt="">`
      : '';

    return `
      <li class="status-item">
        <button class="status-btn" data-name="${item.name}" data-url="${item.url || ''}">
          <span class="status-dot ${statusClassMap[item.status]}"></span>
          ${icon}
          ${item.name}
          <span class="status-label">${item.label}</span>
        </button>
        <button class="remove-btn" data-list="${listKey}" data-index="${index}">&times;</button>
      </li>
    `;
  }).join('');
}


document.addEventListener('click', (e) => {
  const btn = e.target.closest('.status-btn');
  if (btn && btn.dataset.url) {
    window.open(btn.dataset.url, '_blank', 'noopener');
  }

  //remove item button
  const removeBtn = e.target.closest('.remove-btn');
  if (removeBtn) {
    const listKey = removeBtn.dataset.list;
    const index = Number(removeBtn.dataset.index);
    const itemName = removeBtn.closest('.status-item').querySelector('.status-btn').dataset.name;
    openConfirmModal(listKey, index, itemName);
  }
});

function renderStatus() {
  renderList('deployed');
  renderList('infrastructure');
  renderList('portfolio');
}

// ADD ITEM MODAL

function setupAddItemModal() {
  const modal = document.getElementById('add-item-modal');
  const nameInput = document.getElementById('new-item-name');
  const urlInput = document.getElementById('new-item-url');
  const saveBtn = document.getElementById('modal-save-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');

  let activeList = null; // which list we're adding to

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

  // wire up all "+" buttons
  document.querySelectorAll('.add-item-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.list));
  });

  cancelBtn.addEventListener('click', closeModal);

  // close if clicking the dark overlay itself
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    if (!name || !activeList) return;

    // prepend https:// if the user forgot it
    if (url && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    let icon = '';
    if (url) {
      try {
        const domain = new URL(url).hostname;
        icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      } catch (e) {
        icon = '';
      }
    }

    statusData[activeList].push({
      name,
      url: url || null,
      icon,
      status: 'planned',
      label: 'planned'
    });

    renderList(activeList);
    closeModal();
  });
}

let pendingDelete = null; // { listKey, index }

function setupConfirmModal() {
  const modal = document.getElementById('confirm-modal');
  const message = document.getElementById('confirm-message');
  const cancelBtn = document.getElementById('confirm-cancel-btn');
  const deleteBtn = document.getElementById('confirm-delete-btn');

  function closeModal() {
    modal.style.display = 'none';
    pendingDelete = null;
  }

  cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  deleteBtn.addEventListener('click', () => {
    if (!pendingDelete) return;
    const { listKey, index } = pendingDelete;
    statusData[listKey].splice(index, 1);
    renderList(listKey);
    closeModal();
  });

  // expose a helper to open it from the main click listener below
  window.openConfirmModal = (listKey, index, itemName) => {
    pendingDelete = { listKey, index };
    message.textContent = `Remove "${itemName}" from the list?`;
    modal.style.display = 'flex';
  };
}