---
layout: post
title:  "Raspberry Pi outages"
date:   2014-11-16 23:23:23
categories: raspberry pi raspberrypi linux raspbian ssh LAN network
---

I did it! I managed to crash my pi!

## But how???

Well, I installed sane in order to get network scanning to work, restarted saned, tried to scan and BAM, the pi stopped responding.

Step 1: Power-cycle the thing

Result 1: the pi booted, registered an IP from DHCP, and didn't respond to pings. After a few seconds, it went off again.

Step 2: Check out what the hell is wrong with my Raspbian image

Result 2: The boot partition had the dirty bit set.

Solution: fsck the thing, boot it up again and uninstalled sane. Stuff works now :D

~~I hope I can get this thing working again T_T~~

Running again :D

