import { fetchAds, loadScript, updateExternalLinks, createOptimizedPicture } from '../../scripts/scripts.js';

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

function buildClock(block) {
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
  const clock = block.querySelector('.rolex-frame');
  clock.innerHTML = `<iframe
      id="rolexFrameNCVHdBD"
      data-src="/blocks/ads/rolex/rolex.frame.html?cities=rolexNCVHdBD"
      style="width:100%;height:90px;border:0;padding:0;overflow:hidden;scroll:none"
      scrolling="NO"
      frameborder="NO"
      transparency="true"
      src="/blocks/ads/rolex/rolex.frame.html?cities=rolexNCVHdBD">
    </iframe>`;
}

function buildToggle(block) {
  const toggle = block.querySelector('.rolex-frame');
  toggle.innerHTML = `<iframe
      id="rolexFrame1txbOyjg"
      class="rolex-frame-medium"
      data-src="/blocks/ads/rolex/rolex.frameToggle.html?eventcity=Ponte+Vedra+Beach&utc=-4&lang=en"
      style="width:450px;height:100px;border:0;margin:0;padding:0;overflow:hidden;scroll:none"
      scrolling="NO"
      frameborder="NO"
      transparency="true"
      src="/blocks/ads/rolex/rolex.frameToggle.html?eventcity=Ponte+Vedra+Beach&utc=-4&lang=en">
    </iframe>
    <iframe
      id="rolexFrame1txbOyjg"
      class="rolex-frame-small"
      data-src="/blocks/ads/rolex/rolex.frameToggleMobile.html?eventcity=Ponte+Vedra+Beach&utc=-4&lang=en"
      style="width:100%;height:58px;border:0px;margin:0px;padding:0px;overflow:hidden;background-color:rgb(0,96,57);"
      scrolling="NO"
      frameborder="NO"
      transparency="true"
      src="/blocks/ads/rolex/rolex.frameToggleMobile.html?eventcity=Ponte+Vedra+Beach&utc=-4&lang=en">
    </iframe>`;
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
}

async function insertFallbacks(ad) {
  const { fallbacks } = await fetchAds();
  if (fallbacks) {
    const iframe = ad.querySelector('div[id] iframe');
    if (!iframe) {
      const slot = ad.getAttribute('data-slot');
      const config = fallbacks.find((fb) => fb.slot === slot);
      if (config) {
        const placeholder = ad.querySelector('div[id] > div[id]');
        const fallback = `<a href="${config.link}" class="ad-fallback">
            ${createOptimizedPicture(config.image).outerHTML}
          </a>`;
        placeholder.innerHTML = fallback;
      }
    }
  }
  updateExternalLinks(ad);
}

export default function decorate(block) {
  block.innerHTML = '';

  const adPlaceholders = [...document.querySelectorAll('.ad')];
  adPlaceholders.forEach((ad) => {
    const position = [...ad.classList].pop().replace('ad-', '');
    if (position === 'leftpromo-toggle') {
      buildToggle(ad);
    } else if (position === 'leftpromo-clock') {
      buildClock(ad);
    }
  });

  window.tude = window.tude || { cmd: [] };
  loadScript('https://www.googletagservices.com/tag/js/gpt.js', () => {
    loadScript('https://dn0qt3r0xannq.cloudfront.net/pgatour-dOyvDOhyTp/players/prebid-load.js', () => {
    // loadScript('https://web.prebidwrapper.com/pgatour-dOyvDOhyTp/players/prebid-load.js', () => {
      window.tude.cmd.push(() => {
        window.tude.setPageTargeting({ // optional
          url_path: window.location.origin,
          s1: 'pgatour',
          s2: 'tournaments',
          s3: 'the-players',
          s4: 'landing',
          m_data: '0',
          m_safety: 'safe',
          m_catagories: 'moat_safe',
          m_mv: 'noHisData',
          m_gv: 'noHisData',
          ksg: '',
          kuid: '',
          aid: '20767395437692810572475817725693908164',
        });
        window.tude.setAdUnitPath('/9517547/pgat.phone/pgatour'); // or whatever you want to set the ad unit of all ads on the page to be
      });
      window.tude.cmd.push(() => {
        adPlaceholders.forEach((ad) => {
          const slot = ad.getAttribute('data-slot');
          const config = {
            divId: slot,
            baseDivId: slot,
          };
          if (slot.includes('home')) {
            config.targeting = { pos: 'leftpromo' };
          }
          window.tude.refreshAdsViaDivMappings([config]);
          const observer = new MutationObserver((mutations) => {
            if (mutations.some((mutation) => mutation.type === 'childList')) {
              observer.disconnect();
              insertFallbacks(ad);
            }
          });
          observer.observe(ad.querySelector('div[id]'), { childList: true });
        });
      });
    });
  });
}
