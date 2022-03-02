---
title: The case for polymorphic case in your codebase
layout: post
tags: [general, rants]
---

I don't post here much these days as I maintain this blog solely because it is expected of me when job hunting, and I am currently happily employed. However, I thought I could start adding smaller "bite-sized" content pieces to give the illusion I am an intelligent and witty developer with strong focused opinions.<!--more--> Here goes:

So you've decided to finally make the effort to switch all of the code in your codebase to [INSERT YOUR PREFERRED CASE HERE]... great. Look how unified and consistent it is now; fascists everywhere would be proud. No more seeing all those different case variations in your files, well, that is unless you chose to go with camel case (as most do) and you are adding a class name to your CSS file. Or maybe you chose snake case since a study you read about proved it is easier for the human brain to read, but now you find yourself in a JSX file, and you are confronted with a sea of pascal case components and camel case methods.

#### How can we restore order?

I suggest a simple rule: ***adapt your case to that which is the primary of your current file, language, or context***.

It's not even my rule, it has been mentioned many times before although it is oft-overlooked. In doing so, you overcome programmer bias, there is no room for developers on your team to argue over their preference and why it should be the consensus among your codebase. Just make your syntax like a chameleon and adapt to your surroundings.

If you find yourself working in a CSS file, use kebab case:
<pre><code>
.page-title {
    font-size: 2rem;
    font-weight: bold;
}
</code></pre>

See how that is consistent in it's file? But wait, what about when I use that class in my HTML or JSX?
<pre><code>
const Header = ({
    props,
}) => {
const { pageTitle } = props;

    return (
        &lt;header>
            &lt;p className="page-title">{ pageTitle }&lt;/p>
            { ... }
        &lt;/header>
    );
}
</code></pre>

Oh no, it is hideous! Or is it? Since the context of the class name is "CSS", it is still consistent, while not technically being isomorphic to all your other named things. Think of it in a taxonomical sense, even when your class name is in HTML or JS, it is still a part of the CSS classification.

In JS, use camel case.

In PHP and Python, use snake case.

When working with constants or enumerables, generally lean towards upper case.

You get the idea...

Sometimes it won't be as immediately obvious which to use, and that is when I recommend you use a special case.  😉

The concept here is not about being overly strict about it, it's about doing what feels right and doesn't take you much time to think about. When you match your "surroundings", it looks and feels right, even though files will contain multiple case styles. Consistent =/= uniform.
