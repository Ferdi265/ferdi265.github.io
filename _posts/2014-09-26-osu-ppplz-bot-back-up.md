---
layout: post
title:  "osu!ppplz bot back up"
date:   2014-09-26 18:49:39
categories: project osu ppplz
---

I just started playing osu again after quite some time of not playing osu and I thought I could get the bot up again.
I also thought that this would be a good place to host the docs :D

## osu!ppplz Docs

### Gamemode names

These are the gamemode names recognized by my bot:

* `osu` and `osu`
* `Taiko` and `taiko`
* `CtB` and `ctb`
* `osu!mania` and `osumania`

### Bot commands

All private messages to [**theFerdi265**](https://osu.ppy.sh/u/theFerdi265) that begin with a "!" are handled as commands. Here is a list of valid commands:

#### **!ppplz** or **!pp**

Sends information about the latest play. For gamemodes other than osu!, add the gamemode name after the command.

If used multiple times, `!pp` also lists relative pp gain or rank changes.

Example:

`!ppplz osu`

Example Output:

```
Gained PP: 6.22, Total PP: 484.29, Relative Rank: -1479, Rank: 117149
New PB! Achieved rank A on Pomplamoose - Mister Sandman [Adorable]+HDDT
Raw PP: 25.40, Weighted PP: 16.85, Accuracy: 92.47%
```

#### **!watch** or **!w**

Sends pp related information after every play. Also sends information about changes in your PP rank or Total PP. For gamemodes other than osu!, add the gamemode name after the command.

`!watch` automatically stops if you don't play for 15 minutes.

If you also want to get messages on retries and fails, use `!watch tries <gamemode>`.
If you only want to be notified when you get a new personal best (the only kind of play that gives pp), use `!watch pbs <gamemode>`.

`!watch` can get pretty slow if many people use it. See EDIT notice below.

Example:

```!w osu```

Example Output:

```
Watching. Waiting for plays...
Gained PP: 0.96, Total PP: 2888.06, Relative Rank: -10, Rank: 7826
New PB! Achieved rank SH on Awake - Supernova [Kite's Insane]+HDHR
Raw PP: 123.76, Weighted PP: 25.24, Accuracy: 99.80%
```

#### **!watching**

Tells you how many people are currently using `!watch` right now.

Example:

`!watching`

Example Output:

```
3 people are using !watch right now.
```

#### **!unwatch** or **!uw**

Stops **!watch**. (All gamemodes).

Example:

`!uw`

Example Output:

```
Will stop watching....
Stopped watching.
```

#### **!status** or **!s**

Sends a short status message.

Example:

`!s`

Example Output:

```
I'm online, real theFerdi265 is too. Status: online: Debugging the Status feature
```

#### **!help** or **!h**

Sends a link to this thread.

Example:

`!help`

Example Output:

```
Need help? The official reddit thread of this bot is here. (this is actually linked in IRC)
```

### Errors

The bot may sometimes spit out error messages, as it's not completely finsihed:

#### bad http-response

May randomly happen on `!ppplz` and `!watch` messages. Errors on `!watch` automatically unwatch you, but most of the time it is safe to do `!ppplz` or `!watch` again. 

#### getaddrinfo ENOTFOUND

May happen if my Internet connection just derped for a moment. Most of the time this won't even reach you and the bot will be down for a while.

#### connect ETIMEDOUT

May happen if my Internet connection just went down. Most of the time this won't even reach you and the bot will be down for a while.

#### read ECONNRESET

May happen if my Internet connection just derped for a moment. Most of the time this won't even reach you and the bot will be down for a while.

### Uptime

The bot is hosted on my PC. That means, if my PC is turned off because I'm not at home for the weekend (happens rarely), then the bot won't be up.

### Beta Notice

This bot is not finished. I may update it (rarely).
If any of you fellow osu players are Node.js programmers and want to throw in their two cents, I'll add the project's GitHub repo [HERE](https://github.com/Ferdi265/ppplz-server/tree/master).

Have fun playing, theFerdi265