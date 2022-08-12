import { readBlockConfig } from '../../scripts/scripts.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  console.log('social config', config);
  block.textContent = 'Social tiles go here...';

  // https://api.massrelevance.com/brgyan07p/tournament_r011.json
}
