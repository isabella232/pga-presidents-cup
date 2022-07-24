export default function decorate(block) {
  const blockClasses = [...block.classList];
  const buttons = document.createElement('div');
  buttons.className = 'carousel-buttons';
  if (blockClasses.includes('course')) buttons.classList.add('course-buttons');
  [...block.children].forEach((row, i) => {
    const classes = ['image', 'text'];
    classes.forEach((e, j) => {
      if (row.children[j]) row.children[j].classList.add(`carousel-${e}`);
    });
    /* course carousel */
    if (blockClasses.includes('course')) {
      const text = row.querySelector('.carousel-text');
      text.classList.add('course-text');
      // setup overview (title, img, desc)
      const overview = document.createElement('div');
      overview.classList.add('course-overview');
      overview.append(
        text.querySelector('h2'), // title
        text.querySelector('h2 + h3'), // par heading
        text.querySelector('h2 + h3 + p'), // course img
        text.querySelector('h2 + h3 + p + p'), // course desc
      );
      const holeImg = overview.querySelector('picture');
      if (holeImg) holeImg.classList.add('course-hole');
      // setup stats
      const stats = document.createElement('div');
      stats.classList.add('course-stats');
      stats.append(
        text.querySelector('h3'), // stats heading
        text.querySelector('h3 + ul'), // stats list
      );
      text.prepend(overview, stats);
      // setup photo credits
      const credits = text.querySelector('p > em');
      if (credits) credits.parentNode.classList.add('course-credits');
    }
    /* buttons */
    const button = document.createElement('button');
    if (!i) button.classList.add('selected');
    button.addEventListener('click', () => {
      block.scrollTo({ top: 0, left: row.offsetLeft - row.parentNode.offsetLeft, behavior: 'smooth' });
      [...buttons.children].forEach((r) => r.classList.remove('selected'));
      button.classList.add('selected');
    });
    buttons.append(button);
  });
  block.parentElement.prepend(buttons);
}
