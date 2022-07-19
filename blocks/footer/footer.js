import {
  readBlockConfig,
  decorateIcons,
  decorateLinkedPictures,
  buildBlock,
  decorateBlock,
  loadBlock,
  makeLinksRelative,
} from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.textContent = '';

  // fetch footer content
  const footerPath = config.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  if (resp.ok) {
    const html = await resp.text();

    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = html;
    makeLinksRelative(footer);

    const classes = ['partners', 'nav', 'legal', 'links', 'social', 'copyright'];
    classes.forEach((c, i) => {
      const section = footer.children[i];
      if (section) section.classList.add(`footer-${c}`);
    });

    decorateIcons(footer);
    decorateLinkedPictures(footer);
    block.append(footer);

    const partners = block.querySelector('.footer-partners');
    const partnersBlock = buildBlock('partners', '');
    partners.append(partnersBlock);
    decorateBlock(partnersBlock);
    await loadBlock(partnersBlock);
  }
}
