import {
  createOptimizedPicture,
  lookupPages,
  toClassName,
} from '../../scripts/scripts.js';

export default async function decorate(block) {
  const pages = await lookupPages();
  const sponsors = pages.filter((e) => e.path.startsWith('/sponsors/'));

  sponsors.forEach((sponsor) => {
    const card = document.createElement('div');
    card.className = 'sponsors-sponsor';
    const wrapper = document.createElement('div');
    const front = document.createElement('div');
    front.className = 'sponsors-sponsor-front';
    front.innerHTML = `${createOptimizedPicture(sponsor.image, sponsor.title, false, [{ width: '300' }]).outerHTML}`;
    const back = document.createElement('div');
    back.className = `sponsors-sponsor-back sponsor-${toClassName(sponsor.title)}`;
    back.innerHTML = `<h2>${sponsor.title}</h2>
      <p>${sponsor.description}</p>
      <p class="button-container"><a class="button" href="${sponsor.link}">${sponsor.title.replace(' ', '')}.com</a></p>`;
    wrapper.append(front, back);
    card.append(wrapper);
    block.append(card);
  });
}
