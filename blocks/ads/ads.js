import { readBlockConfig } from '../../scripts/scripts.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  console.log('ads config', config);
  block.textContent = 'Ads go here...';
}
