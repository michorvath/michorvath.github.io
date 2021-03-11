---
title: Sacrilege&#58; switching from PC to Mac
layout: post
tags: [general]
---

Fair warning: this post is going to be brief and opinionated. It's the new year and my blog has been pretty quiet since I started my new position at <a href="https://ciswired.com/" target="_BLANK">Cornerstone Information Systems</a>. I have plenty of unfinished design and technical posts in the backlog, but for now, I wanted to do a quick write-up about something that happened by accident to me recently: I joined the Apple cult and bought a Macbook Air. 😱<!--more-->

Can you believe it? I'm actually using it right now to write this post! To a lot of developers, especially those with a focus on design, Apple is the standard. However, I have been part of the PC ride-or-die crowd since I was a child. I'm not much for consumerism, so showing off my shiny new toys with their embellished corporate logos isn't quite my style. I also prefer having extremely powerful machines (usually in the portable spectrum aka laptops) and I don't want to break the bank any more than I have to, which goes against everything Mac stands for, or at least I thought it did.

Over the years, my development needs have evolved. Most recently I have been developing a lot of React Native apps that require Xcode running on a Mac to build a production-ready iOS app. I rented a cloud-based Mac that I could <a href="https://en.wikipedia.org/wiki/Remote_Desktop_Protocol" target="_BLANK">RDP</a> into from <a href="https://www.macincloud.com/" target="_BLANK">MacInCloud</a> for almost a year before deciding to take the plunge on a new 2021 M1-enabled Macbook Air. In an effort to keep this post readable and short, I'm going to bullet the pros and cons of both using MacInCloud and adopting an M1 Mac workflow:

### MacInCloud
#### Pros
- Always up-to-date, both hardware and software
- Cancel any time
- Can dip your toes in without spending much 💵💵💵
- Support usually resolves any problems with 24 hours, even on the cheaper plans (at least from my experience)
- Can work from any machine with no environment set up, can even connect and work from a browser on any device

#### Cons
- No sound
- No remote device debugging
- Need an internet connection to do any development work
- If you are paying out-of-pocket for the service for an extended period of time, it gets costly
- Lags a lot, even with the additional RAM options
- 4k support costs extra 😞
- If the metro bundler process stays open when you disconnect or the server restarts, the process gets stuck and you can't build an app until you contact support and they kill the <a href="https://www.chriswrites.com/how-to-view-and-kill-processes-using-the-terminal-in-mac-os-x/#:~:text=Each%20application%20on%20your%20Mac,a%20PID%20number%20of%2014649." target="_BLANK">PID</a>
- Unless you go with the more expensive dedicated plans, you have to message support for every tiny change to the system
- You can't put stickers on the back (how will anyone know that I use Git?!)

### M1 Macbook Air
#### Pros
- This thing is fast
- The lightest laptop on the market making it the most convenient if you are a developer who takes portability seriously
- The battery life is exactly as advertised, which is fantastic
- <a href="{{ site.url }}/assets/media/posts/sacrilege-switching-from-pc-to-mac/spongebob-two-marshmallows.gif" target="_BLANK">Two Thunderbolt 3 ports</a>
- Under $1000 for a business level development capable machine (I got mine on sale at BestBuy for $850)
- The UI really is cleaner than Windows
- Runs Android Studio more efficiently than most PCs
- At the moment, most purchases come with 1 year of Apple Arcade and Apple TV for free!

#### Cons
- The M1 chip is not well supported at the time of writing and you will have to do a lot of workarounds to get apps running, Ruby, Jekyll, etc. (it is doable, just not ready out-of-the-box just yet)
- The M1 does not support dual monitor displays yet even when using the Apple recommended dock (CalDigit TS3 Plus)
- Not all advertised benchmarks are accurate, do your homework ahead of time
- You won't be playing any games on it other than the mobile-y stuff on Apple Arcade

With its extremely light total weight and small dimensions, I find myself grabbing my Macbook more and more whenever I need a machine on-the-go. I use it for development unrelated to Xcode now in addition to general web browsing. I currently have 6 machines in my day-to-day arsenal, the most powerful being my Asus Zenbook Pro Duo with dual 4k touchscreen displays. While that machine is incredible and offers a lot of specialized features that allow me to do my job efficiently or keep my Minecraft Dynmap open while playing the game, it's become way more obvious to me how overkill it is just for checking my emails. The small UI differences between macOS and Windows really start to shine through the more I use it, for instance, the process of installing a program is so much more user-friendly on my Macbook. It's all about those details!

TLDR: Even though the M1 chip has limited support as of the writing of this post (March 2021), my verdict is: **if you haven't jumped on the Apple bandwagon yet for your development needs, you should reassess.**
