// api/imgur-proxy.ts
export default async function handler(req: any, res: any) {
  const target = (req.query?.url || req.query?.u) as string;
  if (!target) return res.status(400).send("Missing ?url");

  let u: URL;
  try { u = new URL(target); } catch { return res.status(400).send("Bad url"); }

  const allowed = new Set(["i.imgur.com","imgur.com","m.imgur.com","i.stack.imgur.com"]);
  if (!allowed.has(u.hostname)) return res.status(403).send("Host not allowed");

  try {
    const r = await fetch(u.toString(), {
      headers: {
        "User-Agent": "Imgur-Proxy/1.0",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://vercel.app/"
      }
    });

    // Ustaw status i nagłówki
    res.status(r.status);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Content-Type", r.headers.get("content-type") || "image/jpeg");

    // Wyślij body
    const buf = Buffer.from(await r.arrayBuffer());
    res.send(buf);
  } catch (e: any) {
    res.status(502).send("Fetch failed: " + e.message);
  }
}

