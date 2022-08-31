import { readBlockConfig, toClassName } from '../../scripts/scripts.js';

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

function findNonFullWidthSection(main) {
  const FULL_WIDTH_BLOCKS = ['ad', 'carousel', 'carousel course', 'hero', 'news', 'player-feature', 'teaser', 'weather'];
  const sections = main.querySelectorAll('.section');
  const nonFullWidthSection = [...sections]
    .find((section) => ![...section.querySelectorAll('.block')] // check section
      .find((child) => FULL_WIDTH_BLOCKS.includes(child.className.replace('block', '').trim()))); // check blocks in section
  return nonFullWidthSection;
}

function calculateLocalOffset() {
  const date = new Date();
  const multiplier = (date.getTimezoneOffset() > 0) ? -1 : 1;
  const offset = Math.abs(date.getTimezoneOffset());
  const hours = Math.floor(offset / 60);
  const minutes = (offset % 60) / 60;
  return (hours + minutes) * multiplier;
}

function updateToggleTimes() {
  const eventOffset = -4;
  const offset = calculateLocalOffset() - eventOffset;
  if (offset !== 0) { // only update if offset between event and local time
    const offsetHours = Math.floor(offset);
    const offsetMinutes = (offset % 1) * 60;
    const times = document.querySelectorAll('.tee-times .tee-times-time');
    times.forEach((time) => {
      const defaultHour = parseInt(time.getAttribute('data-hours'), 10);
      const defaultMinute = parseInt(time.getAttribute('data-minutes'), 10);
      const teeHour = time.querySelector('.tee-times-hour');
      const teeMinute = time.querySelector('.tee-times-minute');
      const teeSuffix = time.querySelector('.tee-times-suffix');
      let newHour = defaultHour + offsetHours;
      let newMinute = defaultMinute + offsetMinutes;
      if (offset < 0) { // subtracting time
        if (newMinute < 0) {
          newMinute = 60 - Math.abs(newMinute);
          newHour -= 1;
        }
        if (newHour <= 0) {
          newHour = 24 - Math.abs(newHour);
        }
      } else if (offset > 0) { // adding time
        if (newMinute >= 60) {
          newMinute -= 60;
          newHour += 1;
        }
        if (newHour > 24) {
          newHour -= 24;
        }
      }
      teeHour.textContent = newHour > 12 ? newHour - 12 : newHour;
      teeMinute.textContent = newMinute.toString().padStart(2, '0');
      teeSuffix.textContent = newHour >= 12 ? 'pm' : 'am';
    });
  }
}

function resetToggleTimes() {
  const times = document.querySelectorAll('.tee-times .tee-times-time');
  times.forEach((time) => {
    const defaultHour = parseInt(time.getAttribute('data-hours'), 10);
    const defaultMinute = time.getAttribute('data-minutes');
    const teeHour = time.querySelector('.tee-times-hour');
    teeHour.textContent = defaultHour > 12 ? defaultHour - 12 : defaultHour;
    const teeMinute = time.querySelector('.tee-times-minute');
    teeMinute.textContent = defaultMinute.padStart(2, '0');
    const teeSuffix = time.querySelector('.tee-times-suffix');
    teeSuffix.textContent = defaultHour >= 12 ? 'pm' : 'am';
  });
}

function getAdSize(position) {
  switch (position) {
    case 'topright':
      return {
        large: [
          [300, 250],
        ],
      };
    case 'top':
      return {
        large: [
          [728, 90],
          [970, 90],
          [970, 250],
        ],
      };
    case 'leftpromo clock':
    case 'leftpromo toggle':
      return {
        large: [
          [420, 90],
        ],
        medium: [
          [380, 90],
        ],
      };
    case 'right':
      return {
        large: [
          [300, 250],
          [300, 600],
        ],
      };
    default:
      return {};
  }
}

function buildLeftPromoClockAd(position) {
  const sectionBefore = document.querySelector('.leaderboard-container, .tee-times-container');
  if (sectionBefore) {
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
    // build ad section
    const adSection = document.createElement('div');
    adSection.className = `section ad-container ad-container-${toClassName(position)}`;
    adSection.innerHTML = `<div class="ad block">
        <div class="ad-columns">
          <div class="ad-column-left"></div>
          <div class="ad-column-right">
            <iframe
              id="rolexFrameNCVHdBD"
              class="rolex-frame"
              data-src="/blocks/ads/rolex/rolex.frame.html?cities=rolexNCVHdBD"
              style="width:100%;height:90px;border:0;padding:0;overflow:hidden;scroll:none"
              scrolling="NO"
              frameborder="NO"
              transparency="true"
              src="/blocks/ads/rolex/rolex.frame.html?cities=rolexNCVHdBD">
            </iframe>
          </div>
        </div>
      </div>`;
    sectionBefore.parentNode.insertBefore(adSection, sectionBefore);
    return adSection.querySelector('.ad-column-left');
  }
  return null;
}

function buildLeftPromoToggleAd(position) {
  const sectionBefore = document.querySelector('.leaderboard-container, .tee-times-container');
  if (sectionBefore) {
    // build ad section
    const adSection = document.createElement('div');
    adSection.className = `section ad-container ad-container-${toClassName(position)}`;
    adSection.innerHTML = `<div class="ad block">
      <div class="ad-columns">
        <div class="ad-column-left"></div>
        <div class="ad-column-right">
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
    window.addEventListener('message', (e) => {
      if (e.data && e.data.toString().includes('rolex')) {
        const rolexData = JSON.parse(e.data);
        if (rolexData.name === 'rolex-teetime-toggle') {
          const inEventTime = rolexData.value === 'On';
          const headerText = document.querySelector('.tee-times-header > p');
          if (inEventTime) {
            if (headerText) headerText.setAttribute('aria-hidden', false);
            resetToggleTimes();
          } else {
            if (headerText) headerText.setAttribute('aria-hidden', true);
            updateToggleTimes();
          }
        }
      }
    });
    sectionBefore.parentNode.insertBefore(adSection, sectionBefore);
    return adSection.querySelector('.ad-column-left');
  }
  return null;
}

function buildTopAd(position) {
  const heroSection = document.querySelector('.hero-container, .carousel-container');
  if (heroSection) {
    // build ad section
    const adSection = document.createElement('div');
    adSection.className = `section ad-container ad-container-${toClassName(position)}`;
    adSection.innerHTML = '<div class="ad block"><div></div></div>';
    heroSection.after(adSection);
    return adSection.querySelector('.ad > div');
  }
  return null;
}

function buildRightAd(position) {
  const firstNonFullWidthSection = findNonFullWidthSection(document.querySelector('main'));
  if (firstNonFullWidthSection) {
    // build ad section
    const adSection = document.createElement('div');
    adSection.className = `section ad-container ad-container-${toClassName(position)}`;
    adSection.innerHTML = '<div class="ad block"><div class="ad-sticky"></div></div>';
    firstNonFullWidthSection.classList.add('ad-cols');
    firstNonFullWidthSection.append(adSection);
    return adSection.querySelector('.ad-sticky');
  }
  return null;
}

export default function decorate(block) {
  const config = readBlockConfig(block);
  block.innerHTML = '';

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
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
            const positions = config.position.split(',').map((p) => p.trim());
            positions.forEach((position) => {
              // setup ad wrapper
              let wrapper;
              let pos = config.position;
              switch (position) {
                case 'leftpromo clock':
                  wrapper = buildLeftPromoClockAd(position);
                  pos = 'leftpromo';
                  break;
                case 'leftpromo toggle':
                  wrapper = buildLeftPromoToggleAd(position);
                  pos = 'leftpromo';
                  break;
                case 'top':
                  wrapper = buildTopAd(position);
                  break;
                case 'right':
                  wrapper = buildRightAd(position);
                  break;
                default:
                  break;
              }
              // create new ad
              if (wrapper) {
                // eslint-disable-next-line no-new
                new window.pgatour.Ad(wrapper, {
                  trackBrowserActivity: true,
                  options: { pos },
                  refreshOnResize: false,
                  companionAd: false,
                  justOnScroll: false,
                  suspended: false,
                  size: getAdSize(position),
                });
              }
            });
          });
        });
      });
    }
  }, { threshold: 0 });

  const triggerBlocks = {
    'leftpromo clock': '.leaderboard, .tee-times',
    'leftpromo toggle': '.leaderboard, .tee-times',
    top: '.carousel, .hero',
    right: '.carousel, .hero',
  };

  const positions = config.position.split(',').map((p) => p.trim());
  positions.forEach((position) => {
    const blocks = document.querySelectorAll(triggerBlocks[position]);
    blocks.forEach((trigger) => observer.observe(trigger));
  });
}
