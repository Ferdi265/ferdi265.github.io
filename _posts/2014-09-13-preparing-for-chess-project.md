---
layout: post
title:  "Preparing for chess project"
date:   2014-09-13 10:03:01
categories: project chess
---

Hi again!
I'm currently preparing for a chess project in node.js.

The project will consist of a self-made chess engine in js, and an HTML5 UI for playing chess.
The system will work like this:

1. You connect to a chess server (type in the ip/domain into the connect box).

2. You play chess with others on the server.

3. ???

4. Profit!

For now I'll add a test connection box on the bottom of this post (to see if it really works).
The goal is to embed a JavaScript file that communicates with a chess server (will probably only be mine) via socket.io and displays a nice HTML5 UI.

<div class="sio-container">
	Server adress: <input type="text" class="connect-box"><input type="button" class="connect-submit" value="Connect">
	<script src="http://code.jquery.com/jquery-2.1.1.min.js"></script>
	<script src="https://cdn.socket.io/socket.io-1.1.0.js"></script>
	<script>
		$(function () {
			$('.connect-submit').click(function () {
				var socket = io.connect($('.connect-box').val());
				socket.on('established', function () {
					socket.emit('version');
				});
				socket.on('version', function (ver) {
					socket.disconnect();
					$('.sio-container').html('Server detected. Running version ' + ver);
				});
			});
		})
	</script>
</div>