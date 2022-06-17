export default function decorate(block) {
  const leaderboardURL = block.querySelector('a').href;
  console.log('leaderboard URL:', leaderboardURL);
  block.innerHTML = `<a href="${leaderboardURL}">Leaderboard</a>`;
}
