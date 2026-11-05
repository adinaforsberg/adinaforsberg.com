// Serves /audio/* from the R2 bucket (with Range support so the audio players
// can seek). Every other request is handled by the static assets in ./public
// and never reaches this script (see "run_worker_first" in wrangler.jsonc).

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/audio/")) {
      return env.ASSETS.fetch(request);
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    const key = decodeURIComponent(url.pathname.slice("/audio/".length));
    if (!key) return notFound(env, request);

    if (request.method === "HEAD") {
      const head = await env.AUDIO.head(key);
      if (!head) return notFound(env, request);
      return new Response(null, { headers: baseHeaders(head, head.size) });
    }

    let object;
    try {
      object = await env.AUDIO.get(key, { range: request.headers, onlyIf: request.headers });
    } catch {
      // R2 throws when the requested range can't be satisfied.
      const head = await env.AUDIO.head(key);
      if (!head) return notFound(env, request);
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${head.size}` } });
    }
    if (!object) return notFound(env, request);

    // Conditional request matched (If-None-Match etc.): R2 returns no body.
    if (!("body" in object)) {
      return new Response(null, { status: 304, headers: baseHeaders(object, object.size) });
    }

    if (request.headers.has("Range") && object.range) {
      const { offset, length } = resolveRange(object.range, object.size);
      const headers = baseHeaders(object, length);
      headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
      return new Response(object.body, { status: 206, headers });
    }

    return new Response(object.body, { headers: baseHeaders(object, object.size) });
  },
};

function baseHeaders(object, contentLength) {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "audio/mpeg");
  headers.set("ETag", object.httpEtag);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Length", String(contentLength));
  headers.set("Cache-Control", "public, max-age=86400");
  return headers;
}

function resolveRange(range, size) {
  // R2 always includes the "suffix" key, so check its value rather than its presence.
  if (range.suffix !== undefined) {
    const length = Math.min(range.suffix, size);
    return { offset: size - length, length };
  }
  const offset = range.offset ?? 0;
  const length = range.length ?? size - offset;
  return { offset, length };
}

async function notFound(env, request) {
  const page = await env.ASSETS.fetch(new Request(new URL("/404", request.url)));
  return new Response(page.body, { status: 404, headers: page.headers });
}
