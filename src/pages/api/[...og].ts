import { NextApiHandler } from "next";
import { getScreenshot } from "./_lib/chromium";
import { parseRequest } from "./_lib/parser";
import { getHtml } from "./_lib/template";

const isDev = !process.env.RAILWAY_STATIC_URL;
const isHtmlDebug = process.env.OG_HTML_DEBUG === "true";

const handler: NextApiHandler = async (req, res) => {
  try {
    const { config, layoutConfig } = parseRequest(req);
    console.log("\n\n---");
    console.log("CONFIG", config);
    console.log("LAYOUT CONFIG", layoutConfig);

    const html = getHtml(config, layoutConfig);
    if (isHtmlDebug) {
      res.setHeader("Content-Type", "text/html");
      res.end(html);
      return;
    }
    const { fileType } = config;
    const file = await getScreenshot(html, fileType, isDev);
    res.statusCode = 200;
    res.setHeader("Content-Type", `image/${fileType}`);
    res.setHeader(
      "Cache-Control",
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
    );
    res.end(file);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>Internal Error</h1><p>Sorry, there was a problem</p>");
    console.error(e);
  }
};

export default handler;