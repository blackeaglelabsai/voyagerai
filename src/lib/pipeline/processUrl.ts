import * as fs from 'fs/promises'
import * as path from 'path'
import { fetchUrl } from '../fetcher/index.js'
import { extractArticle } from '../extractor/index.js'
import { htmlToMarkdown } from '../converter/index.js'
import { processImages } from '../images/index.js'
import { parseMarkdown, generateNotebook } from '../notebook/index.js'

export interface PipelineResult {
  success: boolean
  notebookPath?: string
  title?: string
  error?: string
}

export type ProgressCallback = (message: string) => void

/**
 * Processes a URL through the full pipeline to generate a notebook.
 * @param url - URL to process
 * @param workspaceDir - Workspace directory for output
 * @param onProgress - Callback for progress updates
 * @returns PipelineResult with notebook path on success
 */
export const processUrl = async (
  url: string,
  workspaceDir: string,
  onProgress?: ProgressCallback
): Promise<PipelineResult> => {
  const progress = onProgress || (() => {})

  progress('📥 Fetching article...')
  const fetchResult = await fetchUrl(url)

  if (!fetchResult.success) {
    return { success: false, error: fetchResult.error }
  }

  progress('📄 Extracting content...')
  const extractResult = extractArticle(fetchResult.html!, url)

  if (!extractResult.success) {
    return { success: false, error: extractResult.error }
  }

  const article = extractResult.article!

  progress('✏️ Converting to Markdown...')
  const markdown = htmlToMarkdown(article.content)

  progress('🖼️ Downloading images...')
  const imagesDir = path.join(workspaceDir, '.voyager', 'images')
  const imageResult = await processImages(markdown, url, imagesDir)

  progress('📓 Generating notebook...')
  const chunks = parseMarkdown(imageResult.markdown)
  const notebook = generateNotebook(chunks, article.title)

  const sanitizedTitle = article.title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 50)

  const notebookPath = path.join(workspaceDir, '.voyager', `${sanitizedTitle}.ipynb`)

  await fs.mkdir(path.dirname(notebookPath), { recursive: true })
  await fs.writeFile(notebookPath, JSON.stringify(notebook, null, 2))

  progress('✅ Complete!')

  return {
    success: true,
    notebookPath,
    title: article.title
  }
}
