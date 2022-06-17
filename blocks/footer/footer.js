import {
  readBlockConfig,
  decorateIcons,
  decorateLinkedPictures,
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;
  decorateIcons(footer);
  decorateLinkedPictures(footer);
  block.append(footer);
  const styles = ['partners', 'nav', 'legal', 'links', 'social', 'copyright'];
  styles.forEach((style, i) => {
    if (footer.children[i]) footer.children[i].classList.add(`footer-${style}`);
  });
  const partners = block.querySelector('.footer-partners');
  const partnersBlock = buildBlock('partners', '');
  partners.append(partnersBlock);
  decorateBlock(partnersBlock);
  await loadBlock(partnersBlock);
}
