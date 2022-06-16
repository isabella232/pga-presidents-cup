import { readBlockConfig, decorateIcons, decorateLinkedPictures } from '../../scripts/scripts.js';

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
  await decorateIcons(footer);
  decorateLinkedPictures(footer);
  block.append(footer);
  const styles = ['logos', 'legal'];
  styles.forEach((style, i) => {
    if (block.children[i]) block.children[i].classList.add(`footer-${style}`);
  });
}
