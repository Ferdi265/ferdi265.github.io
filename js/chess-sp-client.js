(function polyfill() {
	Array.prototype.find = Array.prototype.find || function(predicate) {
		if (!this) {
			throw new TypeError('Array.prototype.find called on falsy value');
		}
		if (typeof predicate !== 'function') {
			throw new TypeError('predicate must be a function');
		}
		var list = Object(this),
			length = list.length >>> 0,
			thisArg = arguments[1],
			value;
		for (var i = 0; i < length; i++) {
			value = list[i];
			if (predicate.call(thisArg, value, i, list)) {
				return value;
			}
		}
		return undefined;
	  };
})();
var transpose = function (rows) {
		return Object.keys(rows[0]).map(function (column) {
			return rows.map(function (row) {
				return row[column];
			});
		});
	},
	to2dArray = function (board) {
		var arr = [];
		for (var i = 1; i <= 8; ++i) {
			var file = board[Board.file(i)],
				ranks = [];
			for (var j = 1; j <= 8; ++j) {
				ranks.push(file[j]);
			}
			arr.push(ranks);
		}
		return arr;
	},
	display = function (board) {
		var rankNr = 8,
			selected,
			html = '<table><tbody>' + transpose(to2dArray(board)).reduceRight(function (html, rank) {
			return html + '<tr><td>' + (rankNr--) + '</td>' + rank.map(function (piece, file) {
				return '<td class="piece" data-rank="' + (rankNr + 1) + '" data-file="' + board.file(file + 1) + '">' + (piece ? figurines[piece.player][piece.type] : '&nbsp;') + '</td>';
			}, '').join('') + '</tr>';
		}, '') + '<tr>' + ' abcdefgh'.split('').reduce(function (html, file) {
			return html + '<td>' + file.replace(' ', '&nbsp;') + '</td>';
		}, '') + '</tr></tbody></table>';
		$('.ch-container').html(html);
		$('.ch-container').append('<div><span>To Move: </span>' + (board.toMove === 'w' ? 'White' : 'Black') + '</div>');
		if (board.mate) {
			if (board.check.contains('w') || board.check.contains('b')) {
				$('.ch-container').append('<div><span>Checkmate</span></div>');
			} else {
				$('.ch-container').append('<div><span>Stalemate</span></div>');
			}
		} else {
			$('.ch-container').append('<div><span>Check: </span>' + (board.check === '' ? 'No' : board.check === 'wb' ? 'Both (invalid)' : board.check === 'w' ? 'White' : 'Black') + '</div>');
		}
		if (board.outcome) {
			$('.ch-container').append('<div><span>Outcome: </span>' + (board.outcome === 'wb' ? 'Draw' : board.outcome === 'w' ? 'White wins' : 'Black wins') + '</div>');
		}
		if (!board.valid) {
			$('.ch-container').append('<div><span>Invalid position</span></div>');
		}
		$('.piece').on('click', function () {
			var $el = $(this);
			if (selected) {
				if ($el.data('file') === selected.file && $el.data('rank') === selected.rank) {
					selected = undefined;
					$el.removeClass('selected');
					$('.piece').removeClass('moveable');
					$('.piece').removeClass('error');
				} else if ($el.hasClass('moveable')) {
					var move = selected.moves().find(function (move) {
						return move.to.file === $el.data('file') && move.to.rank === $el.data('rank');
					});
					if (move) {
						var copy = move.valid();
						if (copy && copy.recursiveValid().valid) {
							move.execute();
							setTimeout(function () {
								display(board);
							}, 0);
						} else {
							$el.removeClass('moveable');
							$el.addClass('error');
						}
					}
				}
			} else {
				if (board[$el.data('file')][$el.data('rank')]) {
					selected = board[$el.data('file')][$el.data('rank')];
					$el.addClass('selected');
					selected.moves().forEach(function (move) {
						$('.piece[data-file="' + move.to.file + '"][data-rank="' + move.to.rank + '"]').addClass('moveable');
					});
				}
			}
		});
	},
	figurines = {
		w: {
			k: "&#9812;",
			q: "&#9813;",
			b: "&#9815;",
			n: "&#9816;",
			r: "&#9814;",
			p: "&#9817;"
		},
		b: {
			k: "&#9818;",
			q: "&#9819;",
			b: "&#9821;",
			n: "&#9822;",
			r: "&#9820;",
			p: "&#9823;"
		}
	};
$(function () {
	window.b = chess.create();
	display(b);
	$('head').append('<link rel="stylesheet" href="/css/chess.css">');
});