function loadScript(url, callback, type) {
  const head = document.querySelector('head');
  if (!head.querySelector(`script[src="${url}"]`)) {
    const script = document.createElement('script');
    script.src = url;
    if (type) script.setAttribute('type', type);
    head.append(script);
    script.onload = callback;
    return script;
  }
  return head.querySelector(`script[src="${url}"]`);
}

function buildFormEmbed(url) {
  return `<div class="embed-form-wrapper">
    <iframe src='${url}' allow="encrypted-media" allowfullscreen></iframe>
  </div>`;
}

function buildTwitterEmbed(url) {
  loadScript('https://platform.twitter.com/widgets.js');
  return `<blockquote class="twitter-tweet embed-twitter-wrapper"><a href="${url}"></a></blockquote>`;
}

function buildInstagramEmbed(url) {
  const endingSlash = url.pathname.endsWith('/') ? '' : '/';
  const location = window.location.href.endsWith('.html') ? window.location.href : `${window.location.href}.html`;
  const src = `${url.origin}${url.pathname}${endingSlash}embed/?cr=1&amp;v=13&amp;wp=1316&amp;rd=${location}`;
  return `<div class="embed-instagram-wrapper">
    <iframe src="${src}" allowtransparency="true" allowfullscreen="true" frameborder="0" loading="lazy">
    </iframe>
  </div>`;
}

function buildDefaultEmbed(url) {
  return `<div class="embed-iframe-wrapper">
    <iframe src='${url}' allow="encrypted-media" allowfullscreen></iframe>
  </div>`;
}

function loadEmbed(block) {
  const a = block.querySelector('a');
  if (a) {
    const url = new URL(a.href);
    const { hostname } = url;

    if (hostname.includes('pages08')) {
      a.outerHTML = buildFormEmbed(url);
    } else if (hostname.includes('twitter')) {
      a.outerHTML = buildTwitterEmbed(url);
    } else if (hostname.includes('instagram')) {
      a.outerHTML = buildInstagramEmbed(url);
    } else {
      a.outerHTML = buildDefaultEmbed(url);
    }
  }
}

export default function decorate(block) {
  const observer = new IntersectionObserver(async (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      loadEmbed(block);
    }
  }, { threshold: 0 });

  observer.observe(block);
}
