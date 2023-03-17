# Redirector

This is a small Cloudflare Workers script that does two main things:

* Regularly, it polls the r/cybersecurity subreddit for the most recent Mentorship Monday post (checking the 25 newest posts), then stores that posts's URL in Cloudflare Workers KV. These posts are scheduled and AutoModerator will make a new thread at 00:00 every Monday, adding it to a collection.
* Whenever someone visits `https://redirect.cybersecurity.page/mentorship/`, it fetches the current Mentorship Monday post in KV, then 302s (Temporary Redirects) the visitor to that URL.

### Why is this necessary?

If you link people to a collection of posts on Reddit, they often won't know to sort/scroll to find the most recent, leading them to arrive at the oldest posts in the collection. This is a poor and confusing UX.

To solve this, we created a small site that we could script a little extra smartness into (where the only real cost is the domain registration fee), and place this link anywhere we want people to get to the *most recent* Mentorship Monday thread. This makes finding the right post simple, fast, and reliable.

### Tools Used

* Cloudflare Workers (using both `FetchEvent` and `Cron` features)
* Cloudflare Workers KV
