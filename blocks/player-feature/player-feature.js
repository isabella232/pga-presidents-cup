function transformBackgroundImage(section) {
  const picture = section.querySelector('picture');
  picture.classList.add('player-feature-background');
  return picture;
}

function wrapCredits(section) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('player-feature-credits');
  const credits = section.textContent.split(';');
  credits.forEach((credit, i) => {
    const p = document.createElement('p');
    p.textContent = credit;
    wrapper.append(p);
    if (i > 0) wrapper.classList.add('player-feature-credits-multi');
  });
  return wrapper;
}

export default function decorate(block) {
  const sections = ['background', 'status', 'name', 'credits'];
  [...block.children].forEach((child, i) => {
    if (sections[i]) child.classList.add(`player-feature-${sections[i]}`);
  });

  const background = block.querySelector('.player-feature-background');
  const status = block.querySelector('.player-feature-status');
  const name = block.querySelector('.player-feature-name');
  const credits = block.querySelector('.player-feature-credits');
  const bio = credits.nextElementSibling;
  const button = block.querySelector('.button-container');
  const video = block.querySelector('.embed, .video');

  // transform content
  const backgroundImg = transformBackgroundImage(background);
  const wrappedCredits = wrapCredits(credits);

  // wrap content
  const wrapper = document.createElement('div');
  wrapper.classList.add('player-feature-content');
  wrapper.append(status, name, wrappedCredits, bio, button, video);

  block.innerHTML = '';
  block.append(wrapper);
  block.parentNode.prepend(backgroundImg);
}
