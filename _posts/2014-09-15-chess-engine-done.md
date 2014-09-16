---
layout: post
title:  "Chess engine done"
date:   2014-09-15 22:45:36
categories: project chess
---

Phew, that was actually pretty exhausting, but I got the chess engine done! (hopefully)

The engine should correctly identify possible moves, the new fivefold repetition and 75-move-rule auto-draw, checkmate and stalemate.

It should be working for ever possible chess game, except that it crashes and raises an exception if you don't feed it the right arguments.

So with that done, I'll move to testing and  writing the server-side code. After that's done, I'll code a minimalistic client so you can try it out. :D

No demo today, but I'll see if I can get a little chess client working in a week or so.

```js
process.exit(0);

//Ferdi265
```
