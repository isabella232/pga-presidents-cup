export default function decorate(block) {
  block.querySelectorAll('img').forEach((img) => {
    img.closest('p').classList.add('columns-contains-image');
  });
}
