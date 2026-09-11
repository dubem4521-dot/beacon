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
});

// STATUS DATA

const statusData = {
  deployed: [
    { name: 'tjpork', status: 'running', label: 'running' },
    { name: 'beacon-api', status: 'deploying', label: 'deploying' },
    { name: 'beacon-cluster', status: 'planned', label: 'planned' }
  ],
  infrastructure: [
    { name: 'Pi-hole (DNS)', status: 'running', label: 'running' },
    { name: 'k3s server (node1)', status: 'running', label: 'running' },
    { name: 'k3s agent (node2)', status: 'deploying', label: 'joining' }
  ],
  portfolio: [
    { name: 'my-NAS', status: 'docs', label: 'docs ready' },
    { name: 'beacon (you are here)', status: 'running', label: 'active' }
  ]
};

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

  el.innerHTML = statusData[listKey].map(item => {
    const icon = item.icon
      ? `<img class="item-icon" src="${item.icon}" alt="">`
      : '';
    const nameContent = item.url
      ? `<a href="${item.url}" target="_blank" rel="noopener">${item.name}</a>`
      : item.name;

    return `
      <li class="status-item"><button class="status-btn" data-name="${item.name}">
        <span class="status-dot ${statusClassMap[item.status]}"></span>
        ${icon}
        ${nameContent}
        <span class="status-label">${item.label}</span>
      </button></li>
    `;
  }).join('');
}

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