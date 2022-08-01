import {
  readBlockConfig,
  decorateIcons,
  makeLinksRelative,
  lookupPages,
  createOptimizedPicture,
  wrapImgsInLinks,
  decorateLinkedPictures,
} from '../../scripts/scripts.js';

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */
function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

function displayNextPartner(proud) {
  const partners = [...proud.querySelectorAll('.nav-partner')];
  const appeared = partners.findIndex((e) => e.classList.contains('nav-partner-appear'));
  partners[appeared].classList.remove('nav-partner-appear');
  partners[(appeared + 1) % partners.length].classList.add('nav-partner-appear');
}

async function setupPartners(section) {
  const pages = await lookupPages();
  const sponsors = pages.filter((e) => e.path.startsWith('/sponsors/'));

  const partners = document.createElement('div');
  partners.className = 'nav-partners';
  partners.innerHTML = '<div class="nav-partners-title"><span>Proud Partners</span></div><div class="nav-partner-wrapper"></div>';
  sponsors.forEach((sponsor, i) => {
    const partner = document.createElement('div');
    partner.className = 'nav-partner';
    if (!i) partner.classList.add('nav-partner-appear');
    partner.append(createOptimizedPicture(sponsor.logoWhite, sponsor.title, false, [{ width: '300' }]));
    partners.querySelector('.nav-partner-wrapper').append(partner);
  });
  setInterval(() => {
    displayNextPartner(partners);
  }, 5000);
  section.append(partners);
}

function setupUser(section) {
  const icon = section.querySelector('.icon');
  const text = section.textContent.trim();
  section.innerHTML = `${icon.outerHTML}<span>${text}</span>`;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.textContent = '';

  // fetch nav content
  const navPath = config.nav || '/nav';
  const resp = await fetch(`${navPath}.plain.html`);
  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.innerHTML = html;
    makeLinksRelative(nav);

    const classes = ['brand', 'sections', 'social', 'tour', 'user'];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });

    const navSections = [...nav.children][1];
    if (navSections) {
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        if (navSection.querySelector('ul')) {
          navSection.classList.add('nav-drop');
          const ul = navSection.querySelector('ul');
          const title = navSection.innerHTML.split('<')[0].trim();
          navSection.innerHTML = `<span>${title}</span>${ul.outerHTML}`;
          navSection.setAttribute('aria-expanded', false);
          navSection.addEventListener('click', () => {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            collapseAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          });
        }
      });
    }

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
    hamburger.addEventListener('click', () => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      document.body.style.overflowY = expanded ? '' : 'hidden';
      nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');

    wrapImgsInLinks(nav);
    setupUser(nav.querySelector('.nav-user'));

    decorateIcons(nav);
    decorateLinkedPictures(nav);
    block.append(nav);

    // build status bar
    const statusBar = document.createElement('div');
    statusBar.className = 'status-bar';
    block.parentNode.append(statusBar);

    await setupPartners(nav.querySelector('.nav-brand'));
  }
}
