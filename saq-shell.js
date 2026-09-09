(() => {
  const toggle = document.getElementById('sidebar-toggle');
  const sessionKey = 'saq.sur.session-ended';
  const loginScreen = document.getElementById('login-screen');
  const readStorage = (storage, key) => {
    try { return storage.getItem(key); } catch { return null; }
  };
  const writeStorage = (storage, key, value) => {
    try { storage.setItem(key, value); } catch { /* Demo remains usable without storage. */ }
  };
  const setCompact = (compact) => {
    document.body.classList.toggle('sidebar-compact', compact);
    toggle.textContent = compact ? '›' : '‹';
    toggle.setAttribute('aria-expanded', String(!compact));
    toggle.setAttribute('aria-label', compact ? 'Развернуть меню' : 'Свернуть меню');
  };
  setCompact(readStorage(localStorage, 'saq.sur.sidebar-compact') === 'true');
  toggle.addEventListener('click', () => {
    const compact = !document.body.classList.contains('sidebar-compact');
    setCompact(compact);
    writeStorage(localStorage, 'saq.sur.sidebar-compact', String(compact));
  });

  const updateHeading = () => {
    const activeScreen = document.querySelector('.screen.active');
    const heading = activeScreen?.querySelector('h1');
    document.getElementById('shell-page-title').textContent = heading?.textContent || 'Перечень объектов';
    document.getElementById('shell-subtitle').textContent = document.querySelector('.nav-module.active .nav-label')?.textContent || 'СУР';
    document.querySelectorAll('.sur-subnav .nav-item').forEach(item => {
      if (item.classList.contains('active')) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  };
  document.getElementById('sur-navigation').addEventListener('click', updateHeading);
  updateHeading();

  const setSessionEnded = (ended) => {
    document.body.classList.toggle('session-ended', ended);
    loginScreen.hidden = !ended;
  };
  let ended = readStorage(sessionStorage, sessionKey) === 'true';
  setSessionEnded(ended);
  if (ended) history.replaceState(null, '', '#/login');
  document.getElementById('logout-button').addEventListener('click', () => {
    ended = true;
    writeStorage(sessionStorage, sessionKey, 'true');
    setSessionEnded(true);
    history.replaceState(null, '', '#/login');
    document.getElementById('login-button').focus();
  });
  document.getElementById('login-button').addEventListener('click', () => {
    ended = false;
    writeStorage(sessionStorage, sessionKey, 'false');
    setSessionEnded(false);
    history.replaceState(null, '', '#/cases');
    document.getElementById('logout-button').focus();
  });
  // Back/forward navigation must not reopen a completed demo session.
  window.addEventListener('hashchange', () => {
    if (ended) history.replaceState(null, '', '#/login');
  });
})();
