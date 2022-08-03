function buildFormEmbed(url) {
  return `<div class="embed-form-wrapper">
    <iframe src='${url}' allow="encrypted-media" allowfullscreen></iframe>
  </div>`;
}

function buildDefaultEmbed(url) {
  return `<div class="embed-iframe-wrapper">
    <iframe src='${url}' allow="encrypted-media" allowfullscreen></iframe>
  </div>`;
}

function loadEmbed(block) {
  const status = block.getAttribute('data-embed-status');
  // eslint-disable-next-line no-useless-return
  if (status === 'loaded') return;

  const a = block.querySelector('a');
  if (a) {
    const url = new URL(a.href);
    const { hostname } = url;

    if (hostname.includes('pages08')) {
      a.outerHTML = buildFormEmbed(url);
    } else {
      a.outerHTML = buildDefaultEmbed(url);
    }

    block.setAttribute('data-embed-status', 'loaded');
  }
}

function intersectHandler(entries) {
  const entry = entries[0];
  if (entry.isIntersecting) {
    const block = entry.target;
    loadEmbed(block);
  }
}

export default function decorate(block) {
  const observer = new IntersectionObserver(intersectHandler, { threshold: 0 });
  observer.observe(block);
}
