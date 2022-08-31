import { readBlockConfig } from '../../scripts/scripts.js';

function buildCell(col, rowNum) {
  const cell = rowNum > 0 ? document.createElement('td') : document.createElement('th');
  cell.innerHTML = typeof col === 'object' ? col.innerHTML : col;
  if (rowNum) {
    // eslint-disable-next-line eqeqeq
    if (cell.textContent == parseInt(cell.textContent, 10)) {
      // if cell contents are only numerical
      cell.classList.add('table-cell-num');
    }
  }
  return cell;
}

async function buildDataTable(table, head, body, src) {
  const resp = await fetch(src);
  if (resp.ok) {
    const json = await resp.json();
    if (json.years && json.years[0] && json.years[0].tours && json.years[0].tours[0]) {
      const { tournaments } = json.years[0].tours[0];
      if (tournaments) {
        const headRow = document.createElement('tr');
        const headings = ['Year', 'Winner', 'Score', 'Runner Up', 'Score'];
        headings.forEach((heading) => {
          headRow.append(buildCell(heading));
        });
        head.append(headRow);
        tournaments.forEach((tournament, i) => {
          // console.log('trn:', tournament);
          const tr = document.createElement('tr');
          const rowData = [
            tournament.trnYear,
            tournament.winner ? tournament.winner[0].name : '-',
            tournament.winner ? tournament.winner[0].score : '-',
            tournament.runnerup ? tournament.runnerup[0].name : '-',
            tournament.runnerup ? tournament.runnerup[0].score : '-',
          ];
          rowData.forEach((d) => tr.append(buildCell(d, i + 1)));
          body.append(tr);
          // build a row for each additional runner up
          if (tournament.runnerup && tournament.runnerup.length > 1) {
            tournament.runnerup.forEach((runnerup, j) => {
              if (j) {
                const runnerRow = document.createElement('tr');
                const runnerRowData = [
                  '', '', '', runnerup.name, runnerup.score,
                ];
                runnerRowData.forEach((d) => runnerRow.append(buildCell(d, j)));
                body.append(runnerRow);
              }
            });
          }
        });
        table.append(head, body);
      }
    }
  }
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const head = document.createElement('thead');
  const body = document.createElement('tbody');
  if (block.className.includes('feed')) {
    const config = readBlockConfig(block);
    block.innerHTML = '';
    if (config.source) {
      await buildDataTable(table, head, body, config.source);
    }
  } else {
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
  }
  block.innerHTML = table.outerHTML;
}
