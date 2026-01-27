import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'

export interface Article {
  title: string
  content: string
  byline: string | null
  siteName: string | null
}

export interface ExtractResult {
  success: boolean
  article?: Article
  error?: string
}

/**
 * Extracts article content from raw HTML using Readability.
 * @param html - Raw HTML string
 * @param url - Original URL (used for resolving relative links)
 * @returns ExtractResult with article on success or error message on failure
 */
export const extractArticle = (html: string, url?: string): ExtractResult => {
  try {
    const dom = new JSDOM(html, { url })
    const reader = new Readability(dom.window.document)
    const article = reader.parse()

    if (!article) {
      return {
        success: false,
        error: 'Could not extract article content. The page may not contain a readable article.'
      }
    }

    return {
        success: true,
        article: {
            title: article.title || 'Untitled',
            content: article.content || '',
            byline: article.byline || null,
            siteName: article.siteName || null
        }
        }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse HTML'
    }
  }
}
