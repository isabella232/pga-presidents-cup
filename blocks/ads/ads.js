// import { readBlockConfig } from '../../scripts/scripts.js';

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

export default function decorate(block) {
  // const config = readBlockConfig(block);
  // console.log(config);
  window.rolexNCVHdBD = [{
    city: 'Ponte Vedra Beach',
    local: 'Your Time',
    cdtext: 'Change countdown values',
    startDate: '20170605',
    endDate: '20240611',
    cdyear: '2020',
    cdmonth: '06',
    cdday: '11',
    cdhour: '08',
    cdmin: '0',
    offset: -4,
    dst: '0',
  }];

  block.innerHTML = `<div class="ads-columns">
      <div class="ads-left-column"></div>
      <div class="ads-right-column">
        <iframe 
        id="rolexFrameNCVHdBD" 
        class="rolex-frame" 
        data-src="/blocks/ads/rolex/rolex.frame.html?cities=rolexNCVHdBD" 
        style="width:100%;height:90px;border:0;padding:0;overflow:hidden;scroll:none" 
        scrolling="NO" 
        frameborder="NO" 
        allowtrasnparecy="true" 
        src="/blocks/ads/rolex/rolex.frame.html?cities=rolexNCVHdBD">
      </iframe></div>
    </div>`;
  const inner = block.querySelector('.ads-left-column');
  window.pgatour = window.pgatour || {};

  loadScript('/blocks/ads/jquery-3.6.0.min.js', () => {
    loadScript('/blocks/ads/react-cq.min.js', () => {
      loadScript('/blocks/ads/pgatour.min.js', () => {
        window.pgatour.Ad.setup({
          site: 'pgat',
          refreshDisabled: false,
          trackBrowserActivity: true,
          justInTime: true,
          refreshOnScroll: 'none',
          useEngageTime: true,
          options: {
            s1: 'pgatour',
            s2: 'tournaments',
            s3: 'the-players',
            s4: 'landing',
          },
          enableSingleRequest: true,
          networkCode: '9517547',
          refreshInterval: 20,
        });
        // eslint-disable-next-line no-new
        new window.pgatour.Ad(inner, {
          trackBrowserActivity: true,
          options: { pos: 'leftpromo' },
          refreshOnResize: false,
          companionAd: false,
          justOnScroll: false,
          suspended: false,
          size: {
            large: [[420, 90]],
            medium: [[380, 90]],
          },
        });
      });
    });
  });
}
