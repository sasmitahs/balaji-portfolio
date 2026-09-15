const navigationToggle = document.querySelector('#nav-toggle');
const navigation = document.querySelector('#primary-nav');
const citationTrigger = document.querySelector('#open-citation');
const citationDialog = document.querySelector('#citation-dialog');
const citationClose = document.querySelector('#close-citation');
const copyButton = document.querySelector('#copy-citation');
const copyStatus = document.querySelector('#copy-status');

document.documentElement.classList.add('js');
navigationToggle.hidden = false;
citationTrigger.hidden = false;

function setNavigationOpen(open, restoreFocus = false) {
  navigation.dataset.open = String(open);
  navigationToggle.setAttribute('aria-expanded', String(open));
  navigationToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigationToggle.querySelector('img').src = open ? 'assets/icons/x.svg' : 'assets/icons/menu.svg';
  if (restoreFocus) navigationToggle.focus();
}

navigationToggle.addEventListener('click', () => {
  setNavigationOpen(navigationToggle.getAttribute('aria-expanded') !== 'true');
});

navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) setNavigationOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.dataset.open === 'true') setNavigationOpen(false, true);
});

document.addEventListener('click', (event) => {
  if (!navigation.contains(event.target) && !navigationToggle.contains(event.target)) setNavigationOpen(false);
});

window.matchMedia('(min-width: 761px)').addEventListener('change', () => setNavigationOpen(false));

const sectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    for (const link of navigation.querySelectorAll('a')) {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
}, { rootMargin: '-12% 0px -60% 0px' });

document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));

citationTrigger.addEventListener('click', () => citationDialog.showModal());
citationClose.addEventListener('click', () => citationDialog.close());

citationDialog.addEventListener('click', (event) => {
  if (event.target !== citationDialog) return;
  const bounds = citationDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) citationDialog.close();
});

citationDialog.addEventListener('close', () => {
  copyStatus.textContent = '';
  citationTrigger.focus({ preventScroll: true });
});

copyButton.addEventListener('click', async () => {
  copyButton.disabled = true;
  try {
    await navigator.clipboard.writeText(document.querySelector('#citation-text').textContent.trim());
    copyStatus.textContent = 'Citation copied.';
  } catch {
    copyStatus.textContent = 'Copy unavailable. Download the BibTeX file instead.';
  } finally {
    copyButton.disabled = false;
  }
});