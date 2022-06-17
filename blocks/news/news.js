export default function decorate(block) {
  const newsURL = block.querySelector('a').href;
  console.log('news URL:', newsURL);
  block.innerHTML = `<a href="${newsURL}">News from ${newsURL}</a>`;
}
