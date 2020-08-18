// This class outputs a sortable table given a base element and data

function SortableTable($element, headers, data, sortCallback) {
  const $el = $element;
  var data = data;
  var headers = headers;
  const keyMap = []; // An array of the keys to reference by index
  const self = this;

  // Push keys into key map
  for (const key in data[0]) {
    if (data[0].hasOwnProperty(key)) {
      keyMap.push(key);
    }
  }

  // Sort the data by the provided key name, ascending or descending
  self.sortAndDisplayData = function (sortColumn, asc) {
    $el.html('');

    // Sort data by the given column
    if (asc) {
      data.sort((a, b) =>
        a[sortColumn] > b[sortColumn] ? 1 : b[sortColumn] > a[sortColumn] ? -1 : 0
      );
    } else {
      data.sort((a, b) =>
        a[sortColumn] > b[sortColumn] ? -1 : b[sortColumn] > a[sortColumn] ? 1 : 0
      );
    }

    // Add headers
    let $row = $('<tr></tr>');

    for (let i = 0; i < headers.length; i++) {
      const $cell = $(
        `
					<td class="label">
						<span>${headers[i]}</span>
					</td>
				`
      );

      // Give this header a CSS class if it's the one currently being sorted
      if (i === keyMap.indexOf(sortColumn)) {
        if (asc) {
          $cell.addClass('asc');
        } else {
          $cell.addClass('desc');
        }
      }

      $row.append($cell);
    }

    $el.append($row);

    // Add data
    for (let i = 0; i < data.length; i++) {
      $row = $('<tr></tr>');

      for (const key in data[i]) {
        if (data[i].hasOwnProperty(key)) {
          const val = data[i][key];

          let $cell = $(`<td>${val}</td>`);

          if (key === 'type') {
            $cell = $(
              `
								<td>
									<span class="type ${val}">${val}</span>
								</td>
							`
            );
          }

          $row.append($cell);
        }
      }

      $el.append($row);
    }

    // Event listeners
    $el.find('.label').click(sortClick);
  };

  // Sort table on headings click
  function sortClick(e) {
    const index = $el.find('.label').index($(e.target));
    let asc = false;

    if (!$(e.target).hasClass('asc') && !$(e.target).hasClass('desc')) {
      // Default name to ascending, all others to descending
      if (keyMap[index] === 'name' || keyMap[index] === 'type') {
        asc = true;
      }
    } else {
      asc = !$(e.target).hasClass('asc');
    }

    self.sortAndDisplayData(keyMap[index], asc);

    sortCallback();
  }
}
