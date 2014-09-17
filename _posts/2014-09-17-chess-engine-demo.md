---
layout: post
title:  "Chess engine demo"
date:   2014-09-17 22:44:45
categories: project chess demo
---

Here's the first demo of the chess engine. It should work, but it might wreak havoc and devour your JavaScript engine.

So, you have been warned. Here's the demo:

# Controls

- Click on a piece to see its possible moves.
- Click again to unselect.
- Click a possible move to move.

# Styling

- Invalid moves turn red when clicked (e.g. not protect king in check)
- Selected piece has a grey background
- Possible moves have a light gray background

<div class="ch-container">
	<script src="http://code.jquery.com/jquery-2.1.1.min.js"></script>
	<script src="/js/ch-engine.js"></script>
	<script src="/js/chess-sp-client.js"></script>
</div>