// eslint-disable-next-line import/no-cycle
import { sampleRUM, toCamelCase } from './scripts.js';

function loadScript(url, callback, type) {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (type) script.setAttribute('type', type);
  head.append(script);
  script.onload = callback;
  return script;
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
