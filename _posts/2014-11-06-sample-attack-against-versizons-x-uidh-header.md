---
layout: post
title:  "Sample Attack against Verizon's X-UIDH Header"
date:   2014-11-06 17:40:42
categories: HTTP attack X-UIDH Verizon Header Little-Brother Cory-Doctorow
---

Around a week or so ago (could be more), Verizon started to inject a special header into unencrypted HTTP connections sent over Verizon connections in order to track their users and gather information to send targeted ads: the X-UIDH header.

I recently re-read Cory Doctorow's novel ["Little Brother"](http://en.wikipedia.org/wiki/Little_Brother_%28Doctorow_novel%29) *(go read it, [it's free](http://craphound.com/littlebrother/download/)!)*, and today, when reading yet another tweet about Verizon's X-UIDH tracking header, I had an idea about how to tackle that problem: A jamming attack

##X-UIDH - The Facts

###What do we know about the X-UIDH tracking header?

- It is inserted into every HTTP (not HTTPS) request made over a Verizon connection
- It is stored in a HTTP header field called "X-UIDH"
- It is unique for every Verizon user
- It is not overwritable by the Client side when using a Verizon connection

###How is it used?

- Websites can read the X-UIDH header and use that to uniquely identify visitors from Verizon
- Ad Websites can gather information about Verizon users and send ads that are selected for the user even when using features like the "pivate mode" in modern browsers
- Verizon can make money by selling information about X-UIDH tracked users to ad companies

##The attack in the novel

In "Little Brother", M1k3y and his fellow X-Netters (X-Net: a Internet subnetwork accessed by X-Boxes running Linux) find out that Homeland Security had started to put RFID-Chips into almost everything. From Car Fast Passes for the Highways to Library books and Underground tickets. To track everybody, Homeland Security also set up RFID Readers at almost every second corner.

So the X-Net users started to Re-flash the RFID-Chips in order to make the tracking useless.

The Result: Complete Chaos in the tracking records.

##The attack in real life

Sadly, we cannot change the X-UIDH header for the people that are tracked by it, but we can at least make the results gathered by this less meaningful:

###Step by step guide (for non Verizon users)

1. Get a list of X-UIDH identifiers from volunteering Verizon users
2. Now, when doing an HTTP request, set the X-UIDH header to a random entry from the list
3. Surf the web

###Step by step guide (for Verizon users)

1. Give your X-UIDH identifier to other people and/or use a VPN
  - if you use a VPN, you can also use the above Instructions to help jam Verizons tracking
2. Do stuff

###What does this do?

At first, the impact will be insignificant, but if enough people use randomized X-UIDH tracking headers in their requests, the tracking results will be basically meaningless, as they'll contain completely unrelated entries by other users.

###Will this also work when other ISPs introduce similar systems?

If they use the same X-UIDH header, then yes, this will work. But that would also mean that there would be less people that are able to actually jam them, as more users wouldn't be able to change their X-UIDH headers.

If, however, they use other header names to track users, it will be possible to jam ISP B even when you are tracked by ISP A (assuming ISP A doesn't wipe ISP B's header), but that would make your internet connection look suspicious, containing headers from both ISP A and B.

Happy Jamming everybody!

```sh
exit 0
#ferdi265
```
