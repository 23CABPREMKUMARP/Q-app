import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/conductor/'], // keep internal apps out of search results
    },
    sitemap: 'https://jeffben.org/sitemap.xml',
  };
}
