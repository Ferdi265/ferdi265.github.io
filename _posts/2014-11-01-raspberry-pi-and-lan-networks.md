---
layout: post
title:  "Raspberry Pi and LAN networks"
date:   2014-11-01 23:23:23
categories: raspberry pi raspberrypi linux raspbian ssh LAN network
---

Sry that I haven't posted anything for quite a while, so here's a quick summary of stuff that happened.

##Raspberry SD cards
### *(mhhhh, berries)*

So I recently bought a Raspberry Pi B+, a power cable, a 32gb Micro SD, and an acryl casing for it.

My first five minutes with it went like this:

- Yes yes yes **RASPBERRY PI**!
- \**Builds case*\* Oh that's cool
-  \**power cable doesn't fit into micro USB socket*\* ... damn
- screw that, I'll just use it without casing.

After that, I decided I'd use Raspbian as the os for my pi. So I put the Micro SD into the SD adapter and stuck it into the SD reader in my... damn it! I don't have an SD reader in my PC -.-

After I finally got the Raspbian image onto my SD I put it in the pi, plugged it in, and connected the ethernet cable.

## Network problems
### *(aka "f\*ck you too router")*

The first thing I did after plugging in the pi was check my router network list via the ```http://10.0.0.138``` web interface. I wasn't intelligent enough to do ```nmap -sP 10.0.0.0/24``` yet, but it was something.

Okay, the router said my raspi was 10.0.0.3, so I ssh'ed to 10.0.0.3 only to get this little message here:

```
ssh: connect to host 10.0.0.13 port 22: No route to host
```

After sitting there for ten minutes without finding a solution I bypassed the problem by setting up a port forward from external:23 to raspberrypi:22 and connected to it via ```ssh -p 23 $(external-ip)``` and it worked. *(at least for a while)*

But when I tried to set up a samba network share on the pi things started getting weird:

- my PC (running Ubuntu) couldn't ping/connect to the pi
- my pi couldn't ping/connect to the PC
- both could ping my sister's laptop
- my sister's laptop couldn't ping either of them

In the end it got somewhat better after I changed my PC and pi to use DHCP instead of the static adresses 10.0.0.1 and 10.0.0.3. *(the router somehow didn't tell the other hosts on the LAN that they existed, event though they were shown in the network host list)*

- my PC (running Ubuntu) couldn't ping/connect to the pi
- my pi couldn't ping/connect to the PC
- both could ping my sister's laptop
- my sister's laptop couldn't ping them both

After hourlong searches and trying to get it to work by rebooting router, pi, and my PC countless times, trying out random shell snippets from ask ubuntu and superuser, ~~and summoning the mighty \*nix demon~~, I finally found out that all I had to do was run ```nmap -sP 10.0.0.0/24``` to update the local arp cache.

##osu!ppplz on the pi!

In other news, I moved the ppplz-server over to my pi so my PC doesn't have to run 24/7.
I also changed the IRC part of osu-ppplz to use the SIC command line irc utility as that works ~300 times smoother than any node-based irc client I've found.

But in order to get ppplz to run on Raspbian, I had to recompile node v0.8.8, as the request package needs a node version of at least v0.8.x, which took about 2 hours, but when it finally finished, all I had to do was run ```make install``` and I was done! ...or at least I though so

##init.d, rc.local and crontab @reboot entries

I was still not done. I had to get forever to autstart on reboot so it would actually survive outages and reboots, but that proved to be easier said than done.

###Method 1 - Init.d scripts

I was never comfortable with runlevels and init.d scripts, especially not with not knowing what actually was in the ```$PATH``` variable and what wasn't. So I quickly abandoned this idea to go to...

###Method 2 - rc.local

That kind of worked, but not as great as I wanted it to work. Additionally, running ```forever list``` after boot would list nothing, which was not good, so I looked around some more, until I found...

###Method 3 - crontab @reboot entries

After tinkering with crontabs a bit, I got it to work and I even managed to start the forever script as the user I usually log in as. And it runs!

##Lessons learned

1. Get an SD reader, you don't want to depend on your sister's laptop for getting your raspi's os to work
2. Don't mess with routing, especially not the badly hacked-together thing that my ISP calls "Router configuration page" *(I wish I could just SSH into there and change the configs myself)*
3. Init.d is weird, let others write your init scripts, use crontabs instead

```js
process.exit(0);
```