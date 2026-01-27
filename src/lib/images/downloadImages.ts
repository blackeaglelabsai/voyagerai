import axios from 'axios'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as crypto from 'crypto'

export interface ImageResult {
  success: boolean
  markdown: string
  downloadedCount: number
  errors: string[]
}

/**
 * Extracts image URLs from Markdown content.
 * @param markdown - Markdown string
 * @returns Array of image URLs
 */
const extractImageUrls = (markdown: string): string[] => {
  const pattern = /!\[[^\]]*\]\(([^)]+)\)/g
  const urls: string[] = []
  let match: RegExpExecArray | null

  while ((match = pattern.exec(markdown)) !== null) {
    urls.push(match[1])
  }

  return urls
}

/**
 * Generates a unique filename for an image.
 * @param url - Image URL
 * @returns Hashed filename with extension
 */
const generateFilename = (url: string): string => {
  const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 12)
  const ext = path.extname(new URL(url).pathname) || '.png'
  return `${hash}${ext}`
}

/**
 * Resolves a potentially relative URL to absolute.
 * @param imageUrl - Image URL (relative or absolute)
 * @param baseUrl - Base URL of the article
 * @returns Absolute URL
 */
const resolveUrl = (imageUrl: string, baseUrl: string): string => {
  if (imageUrl.startsWith('data:')) {
    return imageUrl
  }

  try {
    return new URL(imageUrl, baseUrl).href
  } catch {
    return imageUrl
  }
}

/**
 * Downloads an image and saves it locally.
 * @param url - Image URL
 * @param outputPath - Local file path
 * @returns True if successful
 */
const downloadImage = async (url: string, outputPath: string): Promise<boolean> => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000
    })

    await fs.writeFile(outputPath, response.data)
    return true
  } catch {
    return false
  }
}

/**
 * Processes images in Markdown: downloads them and rewrites paths.
 * @param markdown - Original Markdown content
 * @param baseUrl - Base URL for resolving relative paths
 * @param outputDir - Directory to save images
 * @returns ImageResult with updated Markdown
 */
export const processImages = async (
  markdown: string,
  baseUrl: string,
  outputDir: string
): Promise<ImageResult> => {
  const imageUrls = extractImageUrls(markdown)
  const errors: string[] = []
  let downloadedCount = 0
  let updatedMarkdown = markdown

  await fs.mkdir(outputDir, { recursive: true })

  for (const originalUrl of imageUrls) {
    if (originalUrl.startsWith('data:')) {
      continue
    }

    const absoluteUrl = resolveUrl(originalUrl, baseUrl)
    const filename = generateFilename(absoluteUrl)
    const localPath = path.join(outputDir, filename)

    const success = await downloadImage(absoluteUrl, localPath)

    if (success) {
      //updatedMarkdown = updatedMarkdown.replace(originalUrl, `.voyager/images/${filename}`)
      updatedMarkdown = updatedMarkdown.replace(originalUrl, `./images/${filename}`)

      downloadedCount++
    } else {
      errors.push(`Failed to download: ${absoluteUrl}`)
    }
  }

  return {
    success: true,
    markdown: updatedMarkdown,
    downloadedCount,
    errors
  }
}
