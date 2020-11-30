---
title: Designing a side-by-side sign-in/sign-up screen
layout: post
image: designing-a-side-by-side-sign-in-sign-up-screen/header.jpg
tags: [design, ux]
---

If you have ever frequented <a href="https://dribbble.com/" target="_BLANK">Dribbble</a> over the last few years then you are probably familiar with the side-by-side authorization screen trend. The idea is that you place the sign-in form on one side of the screen and the sign-up on the other, usually separated by some form of a transitional overlay, such as a hero image.<!--more--> They are also popular when the sign-up action of your site or application has a binary switch, for example, a personal or business account.

![Sign-in/sign-up toggle]({{ site.url }}/assets/media/posts/designing-a-side-by-side-sign-in-sign-up-screen/signin-signup-toggle.gif)

In this instance,  I was building a quick authorization screen for Affinity, a dating start-up. Affinity's public landing pages relied heavily on large colorful marketing images focused around love and romance. Color played an integral role in the functionality of Affinity once a user was authorized, so before signing in, a monochromatic experience was important as to not mistrain users on what to expect from each color. There was a strong dichotomy between the saturated rainbow glistening header images and the minimalist black and white UI found on each of Affinity's screens that carried over to this design.

Code-wise it is quite simple. For Affinity, the form is actually moving over the top of the background image div. The background image is both the sign-in and sign-up image stitched together and the animated rainbow gradient is a child of the background image div. The form container is 50% width and positioned to the left or right respectively based on a class on the body that also hides the opposing form. After you set some transition properties with easing, it starts to look good. To take the animation further, you can animate the width to expand and shrink during the transition and animate the position past where you want it to end and then move back a bit, following the <a href="https://ohmy.disney.com/movies/2016/07/20/twelve-principles-animation-disney/" target="_BLANK">Disney principles</a>.

To manage the URL, I used an Apache rewrite rule to convert the /signin and /signup to a GET param. The parameter is added to the body which dictates the CSS transition. Finally, you trigger the body class change with JS listeners on clickables in each form and you can update the URL using History.pushState().

![Mobile version]({{ site.url }}/assets/media/posts/designing-a-side-by-side-sign-in-sign-up-screen/mobile-toggle.gif)

To make the screen mobile friendly, you can easily add a responsive breakpoint that hides the image div and sets the position of the form container to static. The JS already transitions the form within the container between sign-in and sign-up, so it should actually work with that little effort. You can always spice up the mobile version with additional animation, but for the minimalist Affinity screen, I found it unnecessary (especially considering I had already built a better mobile version in the fancy-schmancy app).

![Forgot password]({{ site.url }}/assets/media/posts/designing-a-side-by-side-sign-in-sign-up-screen/forgot-password.gif)

Finally, another important aspect of the design was that Affinity screens focused on minimalism and oneness. No screen was to contain more than it needed to, visual weights of form and UI elements were to be kept to a minimum, and modals or other popovers were almost always designed to be fullpage as to not overload the user. So a simple way that that translated to the side-by-side was that having the sign-in and sign-up screens as a single fluid experience was important to presenting oneness. In addition, actions like "forgot password reset" were designed to reuse the same elements on the same screens and not to take us to new ones, or be too flashy. When possible, transitioning the state of one form into another was always a priority. An important thing to consider when going that route is making sure that the switch is still clear and intentional to the user and that they are aware of any CTA change that took place.
