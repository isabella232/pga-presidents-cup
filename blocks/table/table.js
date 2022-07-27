function buildCell(col, rowNum) {
  const cell = rowNum > 0 ? document.createElement('td') : document.createElement('th');
  cell.innerHTML = col.innerHTML;
  if (rowNum) {
    // eslint-disable-next-line eqeqeq
    if (cell.textContent == parseInt(cell.textContent, 10)) {
      // if cell contents are only numerical
      cell.classList.add('table-cell-num');
    }
  }
  return cell;
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const head = document.createElement('thead');
  const body = document.createElement('tbody');
  // build rows
  block.querySelectorAll(':scope > div').forEach((row, i) => {
    const tr = document.createElement('tr');
    // build cells
    row.querySelectorAll('div').forEach((col) => {
      tr.append(buildCell(col, i));
    });
    if (i > 0) body.append(tr);
    else head.append(tr);
  });
  // populate table
  table.append(head, body);
  block.innerHTML = table.outerHTML;
}
