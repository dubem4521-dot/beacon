document.addEventListener('DOMContentLoaded', () => {
  // VIEW SWITCHING

  const navButtons = document.querySelectorAll('.nav-btn');
  const views = document.querySelectorAll('.view');

  console.log('Nav buttons found:', navButtons.length);
  console.log('Views found:', views.length);

  function switchView(viewId) {
    console.log('Switching to:', viewId);

    // Update nav buttons
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    // Update views
    views.forEach(view => {
      view.classList.toggle('active', view.id === `view-${viewId}`);
    });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const viewId = btn.dataset.view;
      console.log('Button clicked:', viewId);

      // Logout isn't a view — handle it separately
      if (viewId === 'logout') {
        console.log('Logout triggered');
        // handleLogout();
        return;
      }

      switchView(viewId);
    });
  });
});


// RENDER STATUS ITEMS WITH DOTS
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

function renderStatus() {
  // deployed-apps
  const deployedList = document.getElementById('deployed-list');
  if (deployedList) {
    deployedList.innerHTML = statusData.deployed.map(item => `
      <li class="status-item"><button class="status-btn" data-name="${item.name}">
        <span class="status-dot ${statusClassMap[item.status]}"></span>
        ${item.name}
        <span class="status-label">${item.label}</span>
      </li>
    `).join('');
  }

  // infrastructure
  const infraList = document.getElementById('infra-list');
  if (infraList) {
    infraList.innerHTML = statusData.infrastructure.map(item => `
      <li class="status-item"><button class="status-btn" data-name="${item.name}">
        <span class="status-dot ${statusClassMap[item.status]}"></span>
        ${item.name}
        <span class="status-label">${item.label}</span>
      </li>
    `).join('');
  }

  // portfolio
  const portfolioList = document.getElementById('portfolio-list');
  if (portfolioList) {
    portfolioList.innerHTML = statusData.portfolio.map(item => `
      <li class="status-item"><button class="status-btn" data-name="${item.name}">
        <span class="status-dot ${statusClassMap[item.status]}"></span>
        ${item.name}
        <span class="status-label">${item.label}</span>
      </li>
    `).join('');
  }
}

// RUN ON PAGE LOAD

document.addEventListener('DOMContentLoaded', () => {
  renderStatus();
});