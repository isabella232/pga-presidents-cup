/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

// eslint-disable-next-line no-unused-vars
const cleanupName = (name) => {
  let n = name;
  const firstChar = n.charAt(0);
  const lastChar = n.charAt(n.length - 1);
  if (!/[A-Za-z0-9]/.test(firstChar)) {
    n = n.substring(1);
  }
  if (!/[A-Za-z0-9]/.test(lastChar)) {
    n = n.slice(0, -1);
  }
  return n;
};

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  const img = document.querySelector('[property="og:image"]');
  if (img) {
    const el = document.createElement('img');
    el.src = img.content;
    meta.Image = el;
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

const createEmbeds = (main, document) => {
  main.querySelectorAll('iframe').forEach((embed) => {
    let src = embed.getAttribute('src');
    src = src && src.startsWith('//') ? `https:${src}` : src;
    if (src) {
      embed.replaceWith(WebImporter.DOMUtils.createTable([
        ['Embed'],
        [`<a href="${src}">${src}</a>`],
      ], document));
    }
  });
};

const createCalloutAndQuoteBlocks = (main, document) => {
  main.querySelectorAll('.blogPostContent__ctaContainer, .blogPostContent__quoteContainer').forEach((callout) => {
    const rows = [];
    let blockName = 'Callout';

    if (callout.classList.contains('blogPostContent__quoteContainer')) {
      blockName = 'Quote';
    }

    if (callout.classList.contains('blogPostContent__ctaContainer--right') || callout.classList.contains('blogPostContent__quoteContainer--right')) {
      blockName += ' (right)';
    } else if (callout.classList.contains('blogPostContent__ctaContainer--left') || callout.classList.contains('blogPostContent__quoteContainer--left')) {
      blockName += ' (left)';
    }

    rows.push([blockName]);

    const container = document.createElement('div');

    const firstText = callout.querySelector('.blogPostContent__ctaText');
    if (firstText) {
      const h = document.createElement('h3');
      h.innerHTML = firstText.textContent;
      container.append(h);
    }

    const sub = callout.querySelector('.blogPostContent__ctaSubheading') || callout.querySelector('.blogPostContent__quote');
    if (sub) {
      const p = document.createElement('p');
      p.innerHTML = sub.innerHTML;
      container.append(p);
    }

    rows.push([container]);

    const cta = callout.querySelector('a');
    if (cta) {
      rows.push([cta]);
    }
    callout.replaceWith(WebImporter.DOMUtils.createTable(rows, document));
  });
};

const createImageBlocks = (main, document) => {
  main.querySelectorAll('img.alignleft, img.alignright').forEach((img) => {
    const rows = [];
    let blockName = 'Image';

    if (img.classList.contains('alignright')) {
      blockName += ' (right)';
    } else if (img.classList.contains('alignleft')) {
      blockName += ' (left)';
    }

    rows.push([blockName]);
    rows.push([img]);

    img.parentNode.replaceWith(WebImporter.DOMUtils.createTable(rows, document));
  });

  main.querySelectorAll('.blogPostContent__imgContainer').forEach((div) => {
    const img = div.querySelector('img');
    if (img) {
      const rows = [];
      let blockName = 'Image';

      if (div.classList.contains('blogPostContent__imgContainer--right')) {
        blockName += ' (right)';
      } else if (div.classList.contains('blogPostContent__imgContainer--left')) {
        blockName += ' (left)';
      }

      rows.push([blockName]);
      rows.push([img]);

      div.replaceWith(WebImporter.DOMUtils.createTable(rows, document));
    }
  });
};

const createTOC = (main, document) => {
  const toc = main.querySelector('.blogPostContentToc');
  if (toc) {
    toc.replaceWith(WebImporter.DOMUtils.createTable([['TOC']], document));
  }
};

const createRelatedStoriesBlock = (main, document) => {
  const related = document.querySelectorAll('.relatedStories .thumb');
  if (related) {
    const cells = [];
    cells.push(['Related Stories']);
    const p = document.createElement('p');
    related.forEach((r) => {
      // eslint-disable-next-line no-param-reassign
      let ref = r.getAttribute('href');
      if (!ref) {
        ref = r.getAttribute('data-video-link');
      }
      const a = document.createElement('a');
      a.href = ref;
      a.innerHTML = ref;
      p.append(a);
      p.append(document.createElement('br'));
    });
    cells.push([p]);
    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
  }
};

const cleanupHeadings = (main) => {
  main.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    // eslint-disable-next-line no-param-reassign
    h.innerHTML = h.textContent;
  });
};

const makeAbsoluteLinks = (main) => {
  main.querySelectorAll('a').forEach((a) => {
    if (a.href.startsWith('/')) {
      const ori = a.href;
      const u = new URL(a.href, 'https://www.bamboohr.com/');
      a.href = u.toString();

      if (a.textContent === ori) {
        a.textContent = a.href;
      }
    }
  });
};

const makeProxySrcs = (main, host) => {
  main.querySelectorAll('img').forEach((img) => {
    console.log('ori img.src', img.src)
    if (img.src.startsWith('/')) {
      // make absolute
      const cu = new URL(host);
      img.src = `${cu.origin}${img.src}`;
    }
    try {
      const u = new URL(img.src);
      u.searchParams.append('host', u.origin);
      img.src = `http://localhost:3001${u.pathname}${u.search}`;
    } catch (error) {
      console.warn(`Unable to make proxy src for ${img.src}: ${error.message}`);
    }
    console.log('computed img.src', img.src)
  });
};

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transformDOM: ({ document, url }) => {
    const main = document.querySelector('.page');

    // need to reconstruct page

    const articleBodyText = document.querySelector('.articleBodyText');
    if (articleBodyText) {
      main.prepend(articleBodyText);
    }

    const heroLegend = document.querySelector('.image-autor');
    if (heroLegend) {
      const p = document.createElement('p');
      const em = document.createElement('em');
      em.innerHTML = heroLegend.innerHTML;
      p.append(em);
      main.prepend(p);
      heroLegend.remove();
    }
    
    const hero = document.querySelector('.main-image');
    if (hero) {
      main.prepend(hero);
    }

    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
      main.prepend(subtitle);
    }

    const h1 = document.querySelector('h1');
    if (h1 && h1.textContent.trim() !== '') {
      main.prepend(h1);
    }

    createRelatedStoriesBlock(main, document);
    createMetadata(main, document);

    WebImporter.DOMUtils.remove(main, [
      '.hero-module',
      '.relatedStories',
      '.parsys',
      '.article-body-text',
      '.articleBody',
    ]);

    makeProxySrcs(main, 'https://www.theplayers.com');

    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  // eslint-disable-next-line arrow-body-style
  generateDocumentPath: ({ url }) => {
    return new URL(url).pathname.replace(/\.html$/, '');
  },
};