import axios, { AxiosError } from 'axios'

export interface FetchResult {
  success: boolean
  html?: string
  error?: string
}

const DEFAULT_TIMEOUT_MS = 10000
const USER_AGENT = 'Voyager/0.1.0 (VS Code Extension)'

/**
 * Fetches HTML content from a URL.
 * @param url - The URL to fetch
 * @param timeoutMs - Request timeout in milliseconds
 * @returns FetchResult with html on success or error message on failure
 */
export const fetchUrl = async (
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<FetchResult> => {
  try {
    const response = await axios.get(url, {
      timeout: timeoutMs,
      maxRedirects: 5,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml'
      },
      responseType: 'text'
    })

    return {
      success: true,
      html: response.data
    }
  } catch (error) {
    return {
      success: false,
      error: formatError(error)
    }
  }
}

/**
 * Formats axios errors into user-friendly messages.
 * @param error - The caught error
 * @returns Formatted error string
 */
const formatError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out'
    }

    if (error.code === 'ENOTFOUND') {
      return 'Could not resolve URL'
    }

    if (error.response) {
      return `HTTP ${error.response.status}: ${error.response.statusText}`
    }

    return error.message
  }

  return 'Unknown error occurred'
}
