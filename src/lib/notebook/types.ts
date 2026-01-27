export interface NotebookCell {
  cell_type: 'markdown' | 'code'
  source: string[]
  metadata: Record<string, unknown>
}

export interface MarkdownCell extends NotebookCell {
  cell_type: 'markdown'
}

export interface CodeCell extends NotebookCell {
  cell_type: 'code'
  execution_count: null
  outputs: unknown[]
}

export interface NotebookMetadata {
  kernelspec: {
    display_name: string
    language: string
    name: string
  }
  language_info: {
    name: string
    version: string
  }
}

export interface Notebook {
  nbformat: number
  nbformat_minor: number
  metadata: NotebookMetadata
  cells: NotebookCell[]
}
