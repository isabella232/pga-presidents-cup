function buildDefaultEmbed(url) {
  return `<div class="embed-iframe-wrapper">
    <iframe src='${url}' allow="encrypted-media" allowfullscreen></iframe>
  </div>`;
}

export default function decorate(block) {
  const status = block.getAttribute('data-embed-status');
  // eslint-disable-next-line no-useless-return
  if (status === 'loaded') return;

  const a = block.querySelector('a');
  if (a) {
    const url = new URL(a.href);

    a.outerHTML = buildDefaultEmbed(url);
    block.setAttribute('data-embed-status', 'loaded');
  }
}
