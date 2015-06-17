---
layout: post
title:  "Three.JS Stuff"
date:   2014-10-11 17:48:39
categories: ThreeJS JavaScript 3D WebGL
---

I made a small ThreeJS demo that displays invisible edges as dashed lines.

It was quite a hassle to implement though, as normal Wireframe draws diagonals and the EdgesHelper did not allow me to easily set the material.

But I did it, so here's the demo:

<div class="centered">
	<h1>SeeThrough 3D in Three.js (r68 with fixes)</h1>
</div>
<div class="centered three"></div>
<div class="centered">
	<h2>Settings</h2>
	<ul>
		<li><input type="checkbox" id="axisIndicators" checked><label for="axisIndicators">Enable axis indicators</label></li>
	</ul>
</div>
<script src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
<script src="/js/three.min.js"></script>
<script src="/js/ThreeCSG.js"></script>
<script src="/js/dg-lines.js"></script>
<script>
	$('head').append('<link rel="stylesheet" href="/css/three-demo.css">');
</script>
