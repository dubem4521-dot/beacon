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


