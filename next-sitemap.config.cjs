/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://king-values.com",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ["/api/*", "/admin/*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/*", "/admin/*"],
      },
    ],
    additionalSitemaps: [
      "https://king-values.com/sitemap.xml",
    ],
  },
  outDir: "./public", // 👈 critical for Vercel
};
