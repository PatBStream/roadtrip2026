const toggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
}

for (const button of document.querySelectorAll('[data-copy-link]')) {
  button.addEventListener('click', async () => {
    const value = button.getAttribute('data-copy-link');
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      button.textContent = 'Copied';
      setTimeout(() => {
        button.textContent = 'Copy link';
      }, 1500);
    } catch {
      button.textContent = 'Copy failed';
    }
  });
}
