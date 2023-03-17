export default {
  async fetch(request, env) {
    try {
      const { pathname } = new URL(request.url);
      
      let targetURL = 'https://www.reddit.com/r/cybersecurity/'; // default

      if (pathname.startsWith("/mentorship")) {
        targetURL = await env.kv_redirector.get("mentorship");
      }

      const statusCode = 302; // temporary redirect
      console.log(`goto: ${targetURL}`);
      return Response.redirect(targetURL, statusCode);
    } catch(e) {
      return new Response(err.stack, { status: 500 })
    }
  },

  async scheduled(event, env, ctx) {
    const url = 'https://www.reddit.com/r/cybersecurity/new/.json';

    async function parseResponse(response) {
      const { headers } = response;
      const contentType = headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return (await response.json());
      }
      return response.text();
    }

    const init = {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    
    const response = await fetch(url, init);
    const results = await parseResponse(response);
    let updated = false;

    for (const [postIterable, postData] of Object.entries(results.data.children)) {
      let correctTitle = false;
      let correctAccount = false;
      let storedURL = '';
      
      for (const [postDataKey, postDataValue] of Object.entries(postData.data)) {
        if (postDataKey == "title") {
          if (postDataValue.startsWith("Mentor")) {
            correctTitle = true;
          }
        }

        if (postDataKey == "author") {
          if (postDataValue == "AutoModerator") {
            correctAccount = true;
          }
        }

        if (postDataKey == "url") {
          storedURL = postDataValue;
        }
      }

      if (correctTitle && correctAccount) {
        await env.kv_redirector.put('mentorship', storedURL);
        console.log(`cron: Updated Mentorship Monday thread URL: ${storedURL}`);
        updated = true;
      }
    }

    if (!updated) {
      console.log("cron: No Mentorship Monday thread found, nothing to do.");
    }
  }
}
