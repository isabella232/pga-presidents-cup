import { readBlockConfig } from '../../scripts/scripts.js';

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

function getAdSize(position) {
  switch (position) {
    case 'topright':
      return { large: [[300, 250]] };
    case 'top':
      return { large: [[728, 90], [970, 90], [970, 250]] };
    case 'leftpromo clock':
    case 'leftpromo toggle':
      return { large: [[420, 90]], medium: [[380, 90]] };
    case 'right':
      return { large: [[300, 250], [300, 600]] };
    default:
      return {};
  }
}

function buildLeftPromoClockEl(block) {
  // setup clock
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
          transparency="true"
          src="/blocks/ads/rolex/rolex.frame.html?cities=rolexNCVHdBD">
      </iframe></div>
    </div>`;
  return block.querySelector('.ads-left-column');
}

function buildLeftPromoToggleEl(block) {
  block.innerHTML = `<div class="ads-columns">
      <div class="ads-left-column"></div>
      <div class="ads-right-column">
        <iframe
          id="rolexFrame1txbOyjg"
          class="rolex-frame rolex-frame-medium"
          data-src="/blocks/ads/rolex/rolex.frameToggle.html?eventcity=Ponte+Vedra+Beach&utc=-4&lang=en"
          style="width:450px;height:100px;border:0;margin:0;padding:0;overflow:hidden;scroll:none"
          scrolling="NO"
          frameborder="NO"
          transparency="true"
          src="/blocks/ads/rolex/rolex.frameToggle.html?eventcity=Ponte+Vedra+Beach&utc=-4&lang=en">
        </iframe>
        <iframe
          id="rolexFrame1txbOyjg"
          class="rolex-frame rolex-frame-small"
          data-src="/blocks/ads/rolex/rolex.frameToggleMobile.html?eventcity=Ponte+Vedra+Beach&utc=-4&lang=en"
          style="width:100%;height:58px;border:0px;margin:0px;padding:0px;overflow:hidden;background-color:rgb(0,96,57);"
          scrolling="NO"
          frameborder="NO"
          transparency="true"
          src="/blocks/ads/rolex/rolex.frameToggleMobile.html?eventcity=Ponte+Vedra+Beach&utc=-4&lang=en">
        </iframe>
      </div>
    </div>`;
  return block.querySelector('.ads-left-column');
}

export default function decorate(block) {
  const config = readBlockConfig(block);
  block.innerHTML = '';

  window.pgatour = window.pgatour || {};

  loadScript('/blocks/ads/jquery-3.6.0.min.js', () => {
    loadScript('/blocks/ads/react-cq.min.js', () => {
      loadScript('/blocks/ads/pgatour.min.js', () => {
        // setup ads
        window.pgatour.EngageTimer.setup();
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
        // setup ad wrapper
        let wrapper;
        let { position } = config;
        switch (position) {
          case 'leftpromo clock':
            wrapper = buildLeftPromoClockEl(block);
            position = 'leftpromo';
            break;
          case 'leftpromo toggle':
            wrapper = buildLeftPromoToggleEl(block);
            position = 'leftpromo';
            break;
          default:
            break;
        }
        // create new ad
        // eslint-disable-next-line no-new
        new window.pgatour.Ad(wrapper, {
          trackBrowserActivity: true,
          options: { pos: position },
          refreshOnResize: false,
          companionAd: false,
          justOnScroll: false,
          suspended: false,
          size: getAdSize(config.position),
        });
      });
    });
  });
}
