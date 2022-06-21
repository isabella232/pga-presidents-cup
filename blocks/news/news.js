import { readBlockConfig } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const videoPrefix = 'https://pga-tour-res.cloudinary.com/image/upload/c_fill,f_auto,g_face,h_311,q_auto,w_425/v1/';
  const damPrefix = 'https://www.pgatour.com';
  const config = readBlockConfig(block);
  const newsURL = config.source;
  const limit = config.limit || 12;
  block.textContent = '';
  /* add CORS header, to be replaced with direct API */
  const directURL = `${newsURL}/lang=LANG_NOT_DEFINED&path=/content&tags=PGATOUR:Tournaments/2018/r011+PGATOUR:Tournaments/2020/r011+PGATOUR:Tournaments/2019/r011+PGATOUR:Tournaments/2021/r011+PGATOUR:Tournaments/2022/r011&size=${limit}`;
  const resp = await fetch(`https://little-forest-58aa.david8603.workers.dev/?url=${encodeURIComponent(directURL)}`);
  const json = await resp.json();
  const ul = document.createElement('ul');
  json.items.forEach((item) => {
    const prefix = item.image.startsWith('brightcove') ? videoPrefix : damPrefix;
    const li = document.createElement('li');
    li.className = 'news-item';
    const video = item.videoId ? '<div class="news-item-play"></div>' : '';
    li.innerHTML = `
      <div class="news-item-image"><img src="${prefix}${item.image}"></div>
      <div class="news-item-body"><a href="${item.link}">${item.title}</a></div>
      ${video}
    `;
    ul.append(li);
  });
  block.append(ul);
}
