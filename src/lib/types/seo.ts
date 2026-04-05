/**
 * Shared SEO data shape. Module 13 lessons 13.3 and 13.5 build on this.
 * Every page's load() function can return `{ seo: SEOData }` and the root
 * layout reads `page.data.seo` to drive the <SEO> component.
 */
export interface SEOData {
	title: string;
	description: string;
	canonical?: string;
	ogImage?: string;
	ogType?: 'website' | 'article';
	twitterCard?: 'summary' | 'summary_large_image';
	noindex?: boolean;
}
