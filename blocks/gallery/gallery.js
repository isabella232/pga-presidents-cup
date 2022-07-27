import { readBlockConfig } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const damPrefix = 'https://www.pgatour.com';
  const config = readBlockConfig(block);
  const galleryURL = config.source;
  const limit = config.limit || 12;
  const buttons = document.createElement('div');
  buttons.className = 'gallery-buttons';
  block.textContent = '';
  // populate news content
  /* TODO: add CORS header, to be replaced with direct API */
  const directURL = `${galleryURL}&size=${limit}`;
  const resp = await fetch(`https://little-forest-58aa.david8603.workers.dev/?url=${encodeURIComponent(directURL)}`);
  const json = await resp.json();

  json.items.forEach((photo, i) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="gallery-image"><picture><img src="${damPrefix}${photo.image}" alt="${photo.description}"/ ></picture></div>
      <div class="gallery-text">
        <p class="gallery-text-title">Photo Gallery${config.title ? `: ${config.title}` : ''}</p>
        ${photo.description ? `<p class="gallery-text-desc">${photo.description}</p>` : ''}
        ${photo.credit ? `<p class="gallery-text-credit">Photo by <strong>${photo.credit}</strong></p>` : ''}
      </div>
    `;
    /* buttons */
    const button = document.createElement('button');
    if (!i) button.classList.add('selected');
    button.addEventListener('click', () => {
      block.scrollTo({ top: 0, left: div.offsetLeft - div.parentNode.offsetLeft, behavior: 'smooth' });
      [...buttons.children].forEach((btn) => btn.classList.remove('selected'));
      button.classList.add('selected');
    });
    buttons.append(button);
    block.append(div);
  });
  if (buttons.hasChildNodes()) block.parentElement.prepend(buttons);
}
