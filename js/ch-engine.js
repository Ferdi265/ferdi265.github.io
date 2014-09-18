(function enhancePrototypes() {
	String.prototype.contains = String.prototype.contains || function () {
		return String.prototype.indexOf.apply(this, arguments) !== -1;
	};
})();
var	//Functions
	extend = function (target) {
		var sources = Array.prototype.slice.call(arguments, 1);
		target = target || {};
		return sources.forEach(function (source) {
			if (typeof source !== 'object') return;
			Object.keys(source).forEach(function (key) {
				target[key] = source[key];
			});
		}), target;
	},
	proto = function (Proto) {
		var oProto = Object.create(Proto) || {},
			sources = Array.prototype.slice.call(arguments, 1);
		if (sources.length === 0) {
			sources.push(Proto);
			oProto = {};
		}
		return extend.apply(undefined, [oProto].concat(sources));
	},
	inst = function (Proto) {
		var args = Array.prototype.slice.call(arguments, 1),
			instance = Object.create(Proto) || {};
		if (instance.init instanceof Function) {
			instance.init.apply(instance, args);
		}
		return instance;
	},
	//Protos
	Player = {
		enemy: function (player) {
			return player === 'w' ? 'b' : 'w';
		}
	},
	Piece = {
		init: function (board, player, file, rank) {
			this.board = board;
			this.player = player;
			this.file = file;
			this.rank = rank;
			return this;
		},
		copy: function (board) {
			return inst(Board.pieces[this.type], board || this.board, this.player, this.file, this.rank, this.meta);
		},
		deserialize: function (serialized, board, file, rank) {
			return inst(Board.pieces[serialized.charAt(0)], board, serialized.charAt(1), file, rank, serialized.charAt(2) === '1' );
		},
		toJSON: function () {
			var jsonValue = this.type + this.player;
			if (this.meta) {
				jsonValue += this.meta ? '1' : '';
			}
			return jsonValue;
		}
	},
	Move = {
		init: function (board, from, to) {
			this.board = board;
			this.from = from;
			this.to = to;
			return this;
		},
		valid: function () {
			var boardCopy,
				moves,
				self = this;
			if (!this.board.valid || this.board[this.from.file][this.from.rank].player !== this.board.toMove || this.board.outcome) {
				return false;
			}
			moves = this.board[this.from.file][this.from.rank].moves();
			if (!moves.some(function (move) {
				return move.to.file === self.to.file && move.to.rank === self.to.rank;
			})) {
				return false;
			}
			boardCopy = this.board.copy();
			boardCopy.pastMoves.push(this);
			boardCopy.halfmoves++;
			this.apply(boardCopy);
			boardCopy.toMove = Player.enemy(boardCopy.toMove);
			boardCopy.updateCheck();
			boardCopy.updateValid();
			if (!boardCopy.valid) {
				return false;
			}
			return boardCopy;
		},
		apply: function (board) {
			var moving = board[this.from.file][this.from.rank];
			board.forEach(function (piece) {
				if (piece.type === 'p') {
					piece.meta = false;
				}
			});
			if (board.castle.contains(moving.player) || board.castle.contains(moving.player.toUpperCase())) {
				if (moving.type === 'k') {
					board.castle = board.castle.replace(moving.player, '').replace(moving.player.toUpperCase(), '');
				}
				if (this.from.file === 'a' && this.from.rank === (moving.player === 'w' ? 1 : 8)) {
					board.castle = board.castle.replace(moving.player.toUpperCase(), '');
				} else if (this.from.file === 'h' && this.from.rank === (moving.player === 'w' ? 1 : 8)) {
					board.castle = board.castle.replace(moving.player, '');
				}
			}
			if (board.castle.contains(Player.enemy(moving.player)) || board.castle.contains(Player.enemy(moving.player).toUpperCase())) {
				if (this.to.file === 'a' && this.to.rank === (Player.enemy(moving.player) === 'w' ? 1 : 8)) {
					board.castle = board.castle.replace(Player.enemy(moving.player).toUpperCase(), '');
				} else if (this.from.file === 'h' && this.from.rank === (Player.enemy(moving.player) === 'w' ? 1 : 8)) {
					board.castle = board.castle.replace(Player.enemy(moving.player), '');
				}
			}
			if (board[this.to.file][this.to.rank] || moving.type === 'p') {
				board.halfmoves = 0;
			} else {
				board.halfmoves++;
			}
			moving.file = this.to.file;
			moving.rank = this.to.rank;
			delete board[this.from.file][this.from.rank];
			board[this.to.file][this.to.rank] = moving;
			return this;
		},
		execute: function () {
			this.board.pastMoves.push(this.copy(this.board.copy()));
			this.board.halfmoves++;
			this.apply(this.board);
			this.board.toMove = Player.enemy(this.board.toMove);
			this.board.updateCheck();
			this.board.updateMate();
			this.board.recursiveValid();
			return this;
		},
		longAlgebraic: function () {
			var moving = this.board[this.from.file][this.from.rank],
				alg = moving.type.toUpperCase() + this.from.file + this.from.rank,
				boardCopy = this.valid();
			alg += this.board[this.to.file][this.to.rank] ? 'x' : '-';
			alg += this.to.file + this.to.rank;
			if (boardCopy) {
				boardCopy.updateMate();
				if (boardCopy.checkMate(Player.enemy(boardCopy.toMove))) {
					alg += '#';
				} else if (boardCopy.check.contains(boardCopy.toMove)) {
					alg += '+';
				}
			}
			return alg;
		},
		copy: function (board) {
			return inst(Board.moves[this.type], board || this.board, extend({}, this.from), extend({}, this.to), this.meta);
		},
		deserialize: function (serialized, board, toMove) {
			var type,
				from,
				to;
			if (serialized.contains('0-0-0')) {
				return inst(Board.moves.c, board, {
					file: 'e',
					rank: toMove === 'w' ? 1 : 8
				}, {
					file: 'c',
					rank: toMove === 'w' ? 1 : 8
				});
			} else if (serialized.contains('0-0')) {
				return inst(Board.moves.c, board, {
					file: 'e',
					rank: toMove === 'w' ? 1 : 8
				}, {
					file: 'g',
					rank: toMove === 'w' ? 1 : 8
				});
			}
			type = serialized.charAt(0).toLowerCase();
			from = {
				file: serialized.charAt(1),
				rank: serialized.charAt(2)
			};
			to = {
				file: serialized.charAt(4),
				rank: serialized.charAt(5)
			};
			if (serialized.contains('e.p.')) {
				return inst(Board.moves.e, board, from, to);
			} else if (serialized.contains('=')) {
				return inst(Board.moves.p, board, from, to, serialized.charAt(7).toLowerCase());
			} else if (type === 'p' && from.rank === 4.5 - 2.5 * (toMove === 'w' ? 1 : -1) && from.rank === 4.5 - 0.5 * (toMove === 'w' ? 1 : -1)) {
				return inst(Board.moves.d, board, from, to);
			} else {
				return inst(Board.moves.s, board, from, to);
			}
		}
	},
	Board = {
		init: function (board) {
			var deepCopy = function (obj) {
				var copy = obj instanceof Array ? [] : {};
				Object.keys(obj).forEach(function (k) {
					if (typeof obj[k] === 'object') {
						copy[k] = deepCopy(obj[k]);
					} else {
						copy[k] = obj[k];
					}
				});
				return copy;
			};
			if (board) {
				if (board.copy) {
					board.copy(this);
				} else {
					Board.deserialize(board).copy(this);
				}
			} else {
				extend(this, deepCopy(Board.bare));
			}
			return this;
		},
		updateCheck: function () {
			var self = this,
				check = '';
			this.some(function (piece) {
				if (piece.moves().some(function (move) {
					var target = self[move.to.file][move.to.rank];
					return target && target.type === 'k' && target.player !== piece.player;
				})) {
					if (!check.contains(Player.enemy(piece.player))) {
						check += Player.enemy(piece.player);
					}
					return check.contains('w') && check.contains('b');
				}
			});
			this.check = check;
			return this;
		},
		updateMate: function () {
			var self = this;
			this.mate = !this.some(function (piece) {
				if (piece.player === self.toMove && piece.moves().some(function (move) {
					return move.valid();
				})) {
					return true;
				}
			});
			if (this.check.contains(this.toMove) && this.mate) {
				this.outcome = Player.enemy(this.toMove);
			} else if (this.mate || this.repetition(5) || this.halfmoves >= 150) {
				this.outcome = 'wb';
			}
			return this;
		},
		updateValid: function () {
			if(!this.check.contains(Player.enemy(this.toMove))) {
				this.valid = true;
			} else {
				this.valid = false;
			}
			return this;
		},
		recursiveValid: function () {
			this.updateValid();
			if (this.valid) {
				if (this.pastMoves[this.pastMoves.length - 1]) {
					var move = this.pastMoves[this.pastMoves.length - 1];
					this.valid = Boolean(move.valid());
				} else {
					this.valid = true;
				}
			}
			return this;
		},
		draw: function () {
			this.outcome = 'wb';
			return this;
		},
		resign: function (player) {
			this.outcome = Player.enemy(player);
			return this;
		},
		checkMate: function (player) {
			return this.check.contains(Player.enemy(player)) && this.mate;
		},
		staleMate: function () {
			return !this.check && this.mate;
		},
		repetition: function (n) {
			var positions = {};
			positions[JSON.stringify(this.toHistory())] = 1;
			if (n === 1) return true;
			return this.pastMoves.some(function (move) {
				var position = JSON.stringify(move.board.toHistory());
				if (!positions[position]) {
					positions[position] = 1;
				} else {
					positions[position]++;
				}
				if (positions[position] >= n) {
					return true;
				} else {
					return false;
				}
			});
		},
		file: function (number) {
			return typeof number === 'number' ? String.fromCharCode(96 + number) : number.length > 1 ? '' : number.charCodeAt(0) - 96;
		},
		forEach: function (cb) {
			var self = this;
			Object.keys(this).forEach(function (key) {
				var file = Board.file(key);
				if (file >= 1 && file <= 8) {
					var ranks = self[key];
					for (var k = Object.keys(ranks).sort(), i = 0, c = k.length; i < c; ++i) {
						cb(ranks[k[i]], key, parseInt(k[i], 10));
					}
				}
			});
			return this;
		},
		some: function (cb) {
			var self = this;
			return Object.keys(this).some(function (key) {
				var file = Board.file(key);
				if (file >= 1 && file <= 8) {
					var ranks = self[key];
					for (var k = Object.keys(ranks).sort(), i = 0, c = k.length; i < c; ++i) {
						if (cb(ranks[k[i]], key, parseInt(k[i], 10))) {
							return true;
						}
					}
				}
				return false;
			});
		},
		every: function (cb) {
			var self = this;
			return Object.keys(this).every(function (key) {
				var file = Board.file(key);
				if (file >= 1 && file <= 8) {
					var ranks = self[key];
					for (var k = Object.keys(ranks).sort(), i = 0, c = k.length; i < c; ++i) {
						if (!cb(ranks[k[i]], key, parseInt(k[i], 10))) {
							return false;
						}
					}
				}
				return true;
			});
		},
		copy: function (target) {
			var copy = target || inst(Board),
				self = this;
			Object.keys(self).forEach(function (key) {
				var file = Board.file(key);
				if (file >= 1 && file <= 8) {
					var ranks = self[key];
					copy[key] = {};
					for (var k = Object.keys(ranks).sort(), i = 0, c = k.length; i < c; ++i) {
						copy[key][k[i]] = ranks[k[i]].copy(copy);
					}
				} else if (key === 'pastMoves') {
					copy.pastMoves = [];
					self.pastMoves.forEach(function (move, index) {
						copy.pastMoves[index] = move.copy();
					});
				} else {
					copy[key] = self[key];
				}
			});
			return copy;
		},
		rewind: function (n) {
			if (this.pastMoves.length >= n) {
				this.pastMoves[this.pastMoves.length - n].board.copy(this);
			}
		},
		deserialize: function (serialized) {
			var deserialized = inst(Board),
				historyChain = [],
				deepCopy = function (obj, copy) {
					Object.keys(obj).forEach(function (k) {
						if (typeof obj[k] === 'object') {
							copy[k] = obj[k] instanceof Array ? [] : {};
							deepCopy(obj[k], copy[k]);
						} else {
							copy[k] = obj[k];
						}
					});
					return copy;
				},
				constructMove = function (move, board, index) {
					var constructedBoard = Board.copy.call(board),
						constructedMove;
					constructedBoard.pastMoves = [];
					historyChain.forEach(function (historyMove, index) {
						constructedBoard.pastMoves[index] = historyMove.copy();
					});
					constructedMove = Move.deserialize(move, constructedBoard, index % 2 ? 'b': 'w');
					historyChain.push(constructedMove);
					return constructedMove;
				};
			deepCopy(serialized, deserialized);
			Board.forEach.call(serialized, function (piece, file, rank) {
				deserialized[file][rank] = Piece.deserialize(piece, deserialized, file, rank);
			});
			deserialized.pastBoards.forEach(function (board, index) {
				Board.forEach.call(board, function (piece, file, rank) {
					board[file][rank] = Piece.deserialize(piece, board, file, rank);
				});
			});
			deserialized.pastMoves.forEach(function (move, index) {
				deserialized.pastMoves[index] = constructMove(move, deserialized.pastBoards[index], index);
			});
			delete deserialized.pastBoards;
			return deserialized;
		},
		toHistory: function () {
			var history = this.copy();
			delete history.pastMoves;
			delete history.halfmoves;
			delete history.outcome;
			return history;
		},
		toJSON: function () {
			var copy = this.copy();
			if (copy.pastMoves) {
				copy.pastBoards = [];
				copy.pastMoves.forEach(function (move, index) {
					copy.pastMoves[index] = move.longAlgebraic();
					copy.pastBoards[index] = move.board.toHistory();
					copy.pastBoards[index].halfmoves = move.board.halfmoves;
					copy.pastBoards[index].outcome = move.board.outcome;
				});
			}
			copy.pastBoards.forEach(function (board) {
				delete board.pastMoves;
				console.log('no pastMoves', board);
			});
			return copy;
		},
		bare: {
			a: {},
			b: {},
			c: {},
			d: {},
			e: {},
			f: {},
			g: {},
			h: {},
			pastMoves: [],
			halfmoves: 0,
			check: '', //'', 'w', 'b'
			mate: false, //false, true, (!check && mate === stalemate)
			valid: false,
			outcome: '', //'', 'w', 'b', 'wb'
			castle: 'WwBb', //left & right respectively
			toMove: 'w'
		},
		initial: {
			a: {1: 'rw', 2: 'pw', 7: 'pb', 8: 'rb'},
			b: {1: 'nw', 2: 'pw', 7: 'pb', 8: 'nb'},
			c: {1: 'bw', 2: 'pw', 7: 'pb', 8: 'bb'},
			d: {1: 'qw', 2: 'pw', 7: 'pb', 8: 'qb'},
			e: {1: 'kw', 2: 'pw', 7: 'pb', 8: 'kb'},
			f: {1: 'bw', 2: 'pw', 7: 'pb', 8: 'bb'},
			g: {1: 'nw', 2: 'pw', 7: 'pb', 8: 'nb'},
			h: {1: 'rw', 2: 'pw', 7: 'pb', 8: 'rb'},
			pastMoves: [],
			pastBoards: [],
			halfmoves: 0,
			check: '',
			mate: false,
			valid: true,
			outcome: '',
			toMove: 'w'
		},
		pieces: {
			k: proto(Piece, {
				type: 'k',
				moves: function () {
					var jump = function (file, rank) {
							if (Board.file(self.file) + file >= 1 && Board.file(self.file) + file <= 8 && self.rank + rank >= 1 && self.rank + rank <= 8) {
								if (!self.board[Board.file(Board.file(self.file) + file)][self.rank + rank] || self.board[Board.file(Board.file(self.file) + file)][self.rank + rank].player !== self.player) {
									moves.push(inst(Board.moves.s, self.board, {
										file: self.file,
										rank: self.rank
									}, {
										file: Board.file(Board.file(self.file) + file),
										rank: self.rank + rank
									}));
								}
							}
						},
						self = this,
						moves = [];
					jump(1, 0);
					jump(1, 1);
					jump(0, 1);
					jump(-1, 1);
					jump(-1, 0);
					jump(-1, -1);
					jump(0, -1);
					jump(1, -1);
					if (!this.board.check.contains(this.player)) {
						if (this.board.castle.contains(this.player.toUpperCase()) && !this.board.d[this.rank] && !this.board.c[this.rank] && !this.board.b[this.rank]) {
								moves.push(inst(Board.moves.c, this.board, {
									file: this.file,
									rank: this.rank
								}, {
									file: 'c',
									rank: this.rank
								}));
						}
						if (this.board.castle.contains(this.player) && !this.board.f[this.rank] && !this.board.g[this.rank]) {
							moves.push(inst(Board.moves.c, this.board, {
								file: this.file,
								rank: this.rank
							}, {
								file: 'g',
								rank: this.rank
							}));
						}
					}
					return moves;
				}
			}),
			q: proto(Piece, {
				type: 'q',
				moves: function () {
					var traverse = function (file, rank, dir) {
							var next;
							if (Board.file(file) + dir.file >= 1 && Board.file(file) + dir.file <= 8 && rank + dir.rank >= 1 && rank + dir.rank <= 8) {
								next = {
									file: Board.file(Board.file(file) + dir.file),
									rank: rank + dir.rank
								};
								if (!self.board[next.file][next.rank] || self.board[next.file][next.rank].player !== self.player) {
									moves.push(inst(Board.moves.s, self.board, {
										file: self.file,
										rank: self.rank
									}, next));
									if (!self.board[next.file][next.rank]) {
										traverse(next.file, next.rank, dir);
									}
								}
							}
						},
						self = this,
						moves = [];
					traverse(this.file, this.rank, {
						file: 1,
						rank: 1
					});
					traverse(this.file, this.rank, {
						file: 1,
						rank: -1
					});
					traverse(this.file, this.rank, {
						file: -1,
						rank: 1
					});
					traverse(this.file, this.rank, {
						file: -1,
						rank: -1
					});
					traverse(this.file, this.rank, {
						file: 1,
						rank: 0
					});
					traverse(this.file, this.rank, {
						file: 0,
						rank: 1
					});
					traverse(this.file, this.rank, {
						file: -1,
						rank: 0
					});
					traverse(this.file, this.rank, {
						file: 0,
						rank: -1
					});
					return moves;
				}
			}),
			b: proto(Piece, {
				type: 'b',
				moves: function () {
					var traverse = function (file, rank, dir) {
							var next;
							if (Board.file(file) + dir.file >= 1 && Board.file(file) + dir.file <= 8 && rank + dir.rank >= 1 && rank + dir.rank <= 8) {
								next = {
									file: Board.file(Board.file(file) + dir.file),
									rank: rank + dir.rank
								};
								if (!self.board[next.file][next.rank] || self.board[next.file][next.rank].player !== self.player) {
									moves.push(inst(Board.moves.s, self.board, {
										file: self.file,
										rank: self.rank
									}, next));
									if (!self.board[next.file][next.rank]) {
										traverse(next.file, next.rank, dir);
									}
								}
							}
						},
						self = this,
						moves = [];
					traverse(this.file, this.rank, {
						file: 1,
						rank: 1
					});
					traverse(this.file, this.rank, {
						file: 1,
						rank: -1
					});
					traverse(this.file, this.rank, {
						file: -1,
						rank: 1
					});
					traverse(this.file, this.rank, {
						file: -1,
						rank: -1
					});
					return moves;
				}
			}),
			n: proto(Piece, {
				type: 'n',
				moves: function () {
					var jump = function (file, rank) {
							if (Board.file(self.file) + file >= 1 && Board.file(self.file) + file <= 8 && self.rank + rank >= 1 && self.rank + rank <= 8) {
								if (!self.board[Board.file(Board.file(self.file) + file)][self.rank + rank] || self.board[Board.file(Board.file(self.file) + file)][self.rank + rank].player !== self.player) {
									moves.push(inst(Board.moves.s, self.board, {
										file: self.file,
										rank: self.rank
									}, {
										file: Board.file(Board.file(self.file) + file),
										rank: self.rank + rank
									}));
								}
							}
						},
						self = this,
						moves = [];
						jump(1, 2);
						jump(-1, 2);
						jump(1, -2);
						jump(-1, -2);
						jump(2, 1);
						jump(-2, 1);
						jump(2, -1);
						jump(-2, -1);
					return moves;
				}
			}),
			r: proto(Piece, {
				type: 'r',
				moves: function () {
					var traverse = function (file, rank, dir) {
							var next;
							if (Board.file(file) + dir.file >= 1 && Board.file(file) + dir.file <= 8 && rank + dir.rank >= 1 && rank + dir.rank <= 8) {
								next = {
									file: Board.file(Board.file(file) + dir.file),
									rank: rank + dir.rank
								};
								if (!self.board[next.file][next.rank] || self.board[next.file][next.rank].player !== self.player) {
									moves.push(inst(Board.moves.s, self.board, {
										file: self.file,
										rank: self.rank
									}, next));
									if (!self.board[next.file][next.rank]) {
										traverse(next.file, next.rank, dir);
									}
								}
							}
						},
						self = this,
						moves = [];
					traverse(this.file, this.rank, {
						file: 1,
						rank: 0
					});
					traverse(this.file, this.rank, {
						file: 0,
						rank: 1
					});
					traverse(this.file, this.rank, {
						file: -1,
						rank: 0
					});
					traverse(this.file, this.rank, {
						file: 0,
						rank: -1
					});
					return moves;
				}
			}),
			p: proto(Piece, {
				type: 'p',
				init: function (board, player, file, rank, meta) {
					this.meta = meta;
					Piece.init.call(this, board, player, file, rank);
					return this;
				},
				moves: function () {
					var dir = this.player === 'w' ? 1 : -1,
						moves = [];
					if (this.rank !== 4.5 + 3.5 * dir) {
						if (!this.board[this.file][this.rank + dir]) {
							//forward, possible promote
							moves.push(inst(this.rank === 4.5 + 2.5 * dir ? Board.moves.p : Board.moves.s, this.board, {
								file: this.file,
								rank: this.rank
							}, {
								file: this.file,
								rank: this.rank + dir
							}));
							if (this.rank === 4.5 - 2.5 * dir && !this.board[this.file][this.rank + 2 * dir]) {
								//double move
								moves.push(inst(Board.moves.d, this.board, {
									file: this.file,
									rank: this.rank
								}, {
									file: this.file,
									rank: this.rank + 2 * dir
								}));
							}
						}
						if (!this.file.contains('a')) {
							//left
							if (this.board[Board.file(Board.file(this.file) - 1)][this.rank + dir]) {
								//regular capture, possible promote
								if (this.board[Board.file(Board.file(this.file) - 1)][this.rank + dir].player !== this.player) {
									moves.push(inst(this.rank === 4.5 + 2.5 * dir ? Board.moves.p : Board.moves.s, this.board, {
										file: this.file,
										rank: this.rank
									}, {
										file: Board.file(Board.file(this.file) - 1),
										rank: this.rank + dir
									}));
								}
							} else if (this.board[Board.file(Board.file(this.file) - 1)][this.rank] && this.board[Board.file(Board.file(this.file) - 1)][this.rank].meta && this.board[Board.file(Board.file(this.file) - 1)][this.rank].player !== this.player) {
								//e.p. capture
								moves.push(inst(Board.moves.e, this.board, {
									file: this.file,
									rank: this.rank
								}, {
									file: Board.file(Board.file(this.file) - 1),
									rank: this.rank + dir
								}));
							}
						}
						if (!this.file.contains('h')) {
							//right
							if (this.board[Board.file(Board.file(this.file) + 1)][this.rank + dir]) {
								//regular capture, possible promote
								if (this.board[Board.file(Board.file(this.file) + 1)][this.rank + dir].player !== this.player) {
									moves.push(inst(this.rank === 4.5 + 2.5 * dir ? Board.moves.p : Board.moves.s, this.board, {
										file: this.file,
										rank: this.rank
									}, {
										file: Board.file(Board.file(this.file) + 1),
										rank: this.rank + dir
									}));
								}
							} else if (this.board[Board.file(Board.file(this.file) + 1)][this.rank] && this.board[Board.file(Board.file(this.file) + 1)][this.rank].meta && this.board[Board.file(Board.file(this.file) + 1)][this.rank].player !== this.player) {
								//e.p. capture
								moves.push(inst(Board.moves.e, this.board, {
									file: this.file,
									rank: this.rank
								}, {
									file: Board.file(Board.file(this.file) + 1),
									rank: this.rank + dir
								}));
							}
						}
					}
					return moves;
				}
			}),
		},
		moves: {
			s: proto(Move, {
				type: 's'
			}),
			c: proto(Move, {
				type: 'c',
				valid: function () {
					var valid = Move.valid.call(this),
						moving = this.board[this.from.file][this.from.rank],
						rookTo = {
							file: this.to.file === 'c' ? 'd' : 'f',
							rank: this.from.rank
						};
					return valid && !this.board.some(function (piece) {
						return piece.player !== moving.player && piece.moves().some(function (move) {
							return move.to.file === rookTo.file && move.to.rank === rookTo.rank;
						});
					}) && valid;
				},
				apply: function (board) {
					var rookFrom = {
							file: this.to.file === 'c' ? 'a' : 'h',
							rank: this.from.rank
						},
						rookTo = {
							file: this.to.file === 'c' ? 'd' : 'f',
							rank: this.from.rank
						},
						rook = board[rookFrom.file][rookFrom.rank];
					rook.file = rookTo.file;
					rook.rank = rookTo.rank;
					delete board[rookFrom.file][rookFrom.rank];
					board[rookTo.file][rookTo.rank] = rook;
					Move.apply.call(this, board);
					return this;
				},
				longAlgebraic: function () {
					var alg = this.to.file === 'c' ? '0-0-0' : '0-0',
						boardCopy = this.valid();
					if (boardCopy) {
						boardCopy.updateMate();
						if (boardCopy.check.contains(boardCopy.toMove) && boardCopy.mate) {
							alg += '#';
						} else if (boardCopy.check.contains(boardCopy.toMove)) {
							alg += '+';
						}
					}
					return alg;
				}
			}),
			e: proto(Move, {
				type: 'e',
				apply: function (board) {
					delete board[this.to.file][this.from.rank];
					Move.apply.call(this, board);
					return this;
				},
				longAlgebraic: function () {
					var moving = this.board[this.from.file][this.from.rank],
						alg = 'P' + this.from.file + this.from.rank,
						boardCopy = this.valid();
					alg += this.board[this.to.file][this.to.rank] ? 'x' : '-';
					alg += this.to.file + this.to.rank + 'e.p.';
					if (boardCopy) {
						boardCopy.updateMate();
						if (boardCopy.check.contains(boardCopy.toMove) && boardCopy.mate) {
							alg += '#';
						} else if (boardCopy.check.contains(boardCopy.toMove)) {
							alg += '+';
						}
					}
					return alg;
				}
			}),
			d: proto(Move, {
				type: 'd',
				apply: function (board) {
					Move.apply.call(this, board);
					board[this.to.file][this.to.rank].meta = true;
					return this;
				}
			}),
			p: proto(Move, {
				type: 'p',
				init: function (board, from, to, meta) {
					this.board = board;
					this.meta = meta || 'q';
					Move.init.call(this, board, from, to);
					return this;
				},
				valid: function () {
					return 'qbnr'.contains(this.meta.charAt(0)) && Move.valid.call(this);
				},
				apply: function (board) {
					var piece = board[this.from.file][this.from.rank];
					board[this.from.file][this.from.rank] = inst(Board.pieces[this.meta], this.board, piece.player, piece.file, piece.rank);
					Move.apply.call(this, board);
					return this;
				},
				longAlgebraic: function () {
					var moving = this.board[this.from.file][this.from.rank],
						alg = 'P' + this.from.file + this.from.rank,
						boardCopy = this.valid();
					alg += this.board[this.to.file][this.to.rank] ? 'x' : '-';
					alg += this.to.file + this.to.rank + '=' + this.meta.toUpperCase();
					if (boardCopy) {
						boardCopy.updateMate();
						if (boardCopy.check.contains(boardCopy.toMove) && boardCopy.mate) {
							alg += '#';
						} else if (boardCopy.check.contains(boardCopy.toMove)) {
							alg += '+';
						}
					}
					return alg;
				}
			})
		}
	};

var module = {}, //browser compatibility
	chess;
module.exports = {
	create: function (arg) {
		return inst(Board, arg || Board.initial);
	},
	parse: function (serialized) {
		return Board.deserialize(JSON.parse(serialized));
	},
	stringify: function (board) {
		return JSON.stringify(board);
	}
};
chess = module.exports; //browser compatibility