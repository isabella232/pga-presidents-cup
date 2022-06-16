export default function decorate(block) {
  block.querySelectorAll('img').forEach((img) => {
    img.closest('div').classList.add('cards-contains-image');
  });
}
