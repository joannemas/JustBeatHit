export function isBotRequest(req: Request) {
    const botUserAgents = [
      "googlebot",
      "bingbot",
      "facebookexternalhit",
      "Twitterbot",
      "LinkedInBot",
      "Slackbot",
      "Discordbot",
      "vercel-og"
    ];
  
    const userAgent = req.headers.get("user-agent") || "";
    console.log('userAgent:', userAgent)
    return botUserAgents.some((bot) => userAgent.includes(bot));
}
  