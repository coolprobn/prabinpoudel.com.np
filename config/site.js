module.exports = {
  // pathPrefix: '/', // Prefix for all links. If you deploy your site to example.com/portfolio your pathPrefix should be "portfolio"
  title: 'Prabin Poudel - Rails & Web App Developer | Freelancer', // Navigation and site title
  titleAlt: 'Prabin Poudel - Rails & Web App Developer | Freelancer', // Title for schema.org JSONLD
  description:
    'I create web apps to solve your business problems. Rails & Web App Developer with over 4 years of experience in freelancing',
  url: 'https://prabinpoudel.com.np', // Domain of your site. No trailing slash!
  siteLanguage: 'en', // Language Tag on <html> element
  image: {
    // Used for SEO, relative to /static/ folder
    src: '/images/blog-cover.png',
    width: 384,
    height: 384,
  },
  ogLanguage: 'en_US', // Facebook Language
  pingbackUrl: 'https://webmention.io/prabinpoudel.com.np/xmlrpc',
  webmentionUrl: 'https://webmention.io/prabinpoudel.com.np/webmention',
  micropubUrl: 'https://mm-micropub-to-github.herokuapp.com/micropub/main',
  coilUrl: '$coil.xrptipbot.com/AbwB-yidQNanSI2lYyTJJw',
  googleAnalyticsID: '',

  // JSONLD / Manifest
  favicon: '/images/blog-favicon.png', // Used for manifest favicon generation
  shortName: 'Prabin Poudel', // shortname for manifest. MUST be shorter than 12 characters
  author: {
    // Author for schema.org JSONLD
    name: 'Prabin Poudel',
    url: 'https://prabinpoudel.com.np',
  },
  themeColor: '#ffffff',
  backgroundColor: '#111111',

  twitter: '@coolprobn', // Twitter username
  twitterUrl: 'https://twitter.com/coolprobn',
  facebook: 'probn', // Facebook site name
  githubUrl: 'https://github.com/coolprobn',
  instagramUrl: 'https://www.instagram.com/coolprobn/',
  upworkUrl: 'https://www.upwork.com/freelancers/~0184b506a4486b8f86',
  // feedUrl: '/atom.xml',
};
