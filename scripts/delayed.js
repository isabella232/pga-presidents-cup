// eslint-disable-next-line import/no-cycle
import { sampleRUM, toCamelCase } from './scripts.js';

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
  console.log('already loaded');
  return head.querySelector(`script[src="${url}"]`);
}

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
window.pgatour = window.pgatour || {};
window.pgatour.tracking = {
  branch: {
    apiKey: 'key_live_nnTvCBCejtgfn40wtbQ6ckiprsemNktJ',
    isWebView: 'false',
  },
  krux: {
    id: '',
  },
  indexExchange: {
    status: false,
  },
};
window.pgatour.docWrite = document.write.bind(document);

loadScript('https://assets.adobedtm.com/d17bac9530d5/90b3c70cfef1/launch-1ca88359b76c.min.js');

/* setup user authentication */
function logUser(res) {
  return res.user || null;
}

function getUserInfo() {
  // eslint-disable-next-line no-undef
  return gigya.socialize.getUserInfo({ callback: logUser });
}

function showAccountMenu() {
// eslint-disable-next-line no-undef
  // gigya.accounts.showScreenSet({
  //   screenSet: 'Website-ManageProfile',
  //   startScreen: 'info-for-converted-users',
  // });
}

function showLoginMenu() {
// eslint-disable-next-line no-undef
  gigya.accounts.showScreenSet({
    screenSet: 'Website-RegistrationLogin',
    startScreen: 'gigya-long-login-screen',
    // eslint-disable-next-line no-use-before-define
    onAfterSubmit: updateUserButton,
  });
}

function updateUserButton(user) {
  // eslint-disable-next-line no-param-reassign
  if (!user) user = getUserInfo();
  // eslint-disable-next-line no-param-reassign
  if (user.eventName === 'afterSubmit') user = user.response.user;
  const button = document.getElementById('nav-user-button');
  if (user != null && user.isConnected) {
    // add button caret
    button.innerHTML = `${button.innerHTML}<span class="icon icon-caret"></span>`;
    // update button text
    const text = button.querySelector('span:not([class])');
    text.textContent = 'Manage Profile';
    // update button icon
    if (user.thumbnailURL.length > 0) {
      const icon = button.querySelector('span.icon');
      const img = document.createElement('img');
      img.src = user.thumbnailURL;
      img.alt = 'User Profile Thumbnail';
      icon.replaceWith(img);
    }
    // reset click to open manage account
    button.removeEventListener('click', showLoginMenu);
    button.addEventListener('click', showAccountMenu);
  }
}

function setupUserButton() {
  const button = document.getElementById('nav-user-button');
  if (button) {
    const user = getUserInfo();
    if (user && user != null && user.isConnected) {
      updateUserButton(user);
    } else {
      // set click to open login menu
      button.addEventListener('click', showLoginMenu);
    }
    button.setAttribute('data-status', 'initialized');
  }
}

function initGigya() {
  loadScript(
    'https://cdns.gigya.com/JS/socialize.js?apikey=3__4H034SWkmoUfkZ_ikv8tqNIaTA0UIwoX5rsEk96Ebk5vkojWtKRZixx60tZZdob',
    setupUserButton,
  );
}

initGigya();

/* status bar countdown and weather */
function parseCountdown(ms) {
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  let days = Math.floor(ms / dayMs);
  let hours = Math.floor((ms - days * dayMs) / hourMs);
  let minutes = Math.round((ms - days * dayMs - hours * hourMs) / 60000);
  if (minutes === 60) {
    hours += 1;
    minutes = 0;
  } else if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  if (hours === 24) {
    days += 1;
    hours = 0;
  } else if (hours < 10) {
    hours = `0${hours}`;
  }
  return { days, hours, minutes };
}

function findTimeBetween(date, now = new Date()) {
  return Math.abs(date - now);
}

function updateCountdown() {
  const days = document.getElementById('countdown-days');
  const hours = document.getElementById('countdown-hours');
  const minutes = document.getElementById('countdown-minutes');
  const countdownData = parseCountdown(findTimeBetween(window.countdown));
  days.textContent = countdownData.days;
  hours.textContent = countdownData.hours;
  minutes.textContent = countdownData.minutes;
}

async function populateStatusBar(statusBar) {
  if (statusBar) {
    const data = document.createElement('div');
    data.className = 'status-bar-data';
    // fetch status
    try {
      if (!window.statusData) {
        const resp = await fetch('/status-bar.json');
        const json = await resp.json();
        const statusData = {};
        json.data.forEach((d) => {
          statusData[toCamelCase(d.Key)] = d.Value;
        });
        window.statusData = statusData;
      }
      if (window.statusData.course) data.insertAdjacentHTML('beforeend', `<div class="status-bar-course"><p>${window.statusData.course}</p></div>`);
      if (window.statusData.dates) data.insertAdjacentHTML('beforeend', `<div class="status-bar-dates"><p>${window.statusData.dates}</p></div>`);
      // setup countdown
      if (window.statusData.countdown) {
        window.countdown = new Date(window.statusData.countdown);
        const countdownData = parseCountdown(findTimeBetween(window.countdown));
        const countdown = `<div class="status-bar-countdown">
          <p>
            <span id="countdown-days">${countdownData.days}</span> days : 
            <span id="countdown-hours">${countdownData.hours}</span> hours : 
            <span id="countdown-minutes">${countdownData.minutes}</span> minutes
          </p>
        </div>`;
        data.insertAdjacentHTML('beforeend', countdown);
        setInterval(updateCountdown, 60 * 1000); // update countdown every minute
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('failed to load status', error);
    }
    // fetch weather
    try {
      const resp = await fetch('https://www.pgatour.com/bin/data/feeds/weather.json/r011');
      const { current_observation: weatherData } = await resp.json();
      const location = weatherData.display_location.full;
      const icon = weatherData.icon_url.replace('.gif', '.png');
      const temp = weatherData.temp_f;
      const weather = document.createElement('div');
      weather.className = 'status-bar-weather';
      weather.innerHTML = `<p>
          <a href="/weather">
            <span>${location}</span>
            <img src="${icon}" alt="${weatherData.weather}"/ >
            <span class="status-bar-temp">${temp}</span>
          </a>
        </p>`;
      data.append(weather);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('failed to load weather', error);
    }
    if (data.hasChildNodes()) statusBar.append(data);
  }
}

populateStatusBar(document.querySelector('header > .status-bar'));

/* open external links in new tab */
function updateExternalLinks() {
  document.querySelectorAll('a[href]').forEach((a) => {
    try {
      const { origin } = new URL(a.href, window.location.href);
      if (origin && origin !== window.location.origin) {
        a.setAttribute('rel', 'noopener');
        a.setAttribute('target', '_blank');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`Invalid link: ${a.href}`);
    }
  });
}

updateExternalLinks();
