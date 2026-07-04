import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/conductor/'],
    },
    sitemap: 'https://jeffben.org/sitemap.xml',
  }
}
