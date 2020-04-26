{% assign maxRelated = 4 %}
{% assign minCommonTags =  2 %}
{% assign maxRelatedCounter = 0 %}
{% assign relatedPosts = "" | split: ',' %}

{% for post in site.posts %}
    {% assign sameTagCount = 0 %}
    {% assign commonTags = '' %}

    {% for tag in post.tags %}
        {% if post.url != page.url %}
            {% if page.tags contains tag %}
                {% assign sameTagCount = sameTagCount | plus: 1 %}
                {% capture tagmarkup %} <span class="label label-default">{{ tag }}</span> {% endcapture %}
                {% assign commonTags = commonTags | append: tagmarkup %}
            {% endif %}
        {% endif %}
    {% endfor %}

    {% if sameTagCount >= minCommonTags %}
        {% assign relatedPosts = relatedPosts | push: post %}
    {% endif %}
{% endfor %}

{% if relatedPosts.size > 0  %}
<div class="related-posts">
    <h3>You May Also Enjoy</h3>

    <ul>
        {% assign sortedPosts = relatedPosts | sort_natural: 'title' %}
        {% for post in sortedPosts %}
            <li>
                <h5><a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></h5>
            </li>
            {% assign maxRelatedCounter = maxRelatedCounter | plus: 1 %}
            {% if maxRelatedCounter >= maxRelated %}
                {% break %}
            {% endif %}
        {% endfor %}
    </ul>
</div>
{% endif %}
