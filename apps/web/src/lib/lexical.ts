type LexicalNode = {
  type?: string
  text?: string
  format?: number
  tag?: string
  listType?: 'bullet' | 'number'
  fields?: { url?: string; newTab?: boolean }
  children?: LexicalNode[]
}
type LexicalRoot = { root?: LexicalNode }

// ── Plain text extractor (for meta description, previews, whitespace-pre) ──
const BLOCK_TYPES = new Set(['paragraph', 'listitem', 'heading', 'quote'])

export function lexicalToPlainText(input: unknown): string {
  const root = (input as LexicalRoot | null | undefined)?.root
  if (!root) return ''

  const parts: string[] = []
  const walk = (node: LexicalNode) => {
    if (node.text) parts.push(node.text)
    if (node.children) node.children.forEach(walk)
    if (node.type && BLOCK_TYPES.has(node.type)) parts.push('\n\n')
  }
  walk(root)
  return parts.join('').replace(/\n{3,}/g, '\n\n').trim()
}

// ── HTML renderer for CMS-authored rich text ──────────────────────────────
// Format bitflags: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const wrapFormat = (text: string, format = 0): string => {
  let out = text
  if (format & 1) out = `<strong>${out}</strong>`
  if (format & 2) out = `<em>${out}</em>`
  if (format & 4) out = `<s>${out}</s>`
  if (format & 8) out = `<u>${out}</u>`
  if (format & 16) out = `<code>${out}</code>`
  return out
}

const renderNode = (node: LexicalNode): string => {
  if (node.type === 'text') return wrapFormat(escapeHtml(node.text ?? ''), node.format)
  if (node.type === 'linebreak') return '<br>'

  const inner = (node.children ?? []).map(renderNode).join('')

  switch (node.type) {
    case 'paragraph':
      return `<p>${inner}</p>`
    case 'heading': {
      const tag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag ?? '') ? node.tag : 'h2'
      return `<${tag}>${inner}</${tag}>`
    }
    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${tag}>${inner}</${tag}>`
    }
    case 'listitem':
      return `<li>${inner}</li>`
    case 'link': {
      const url = node.fields?.url ?? '#'
      const target = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${escapeHtml(url)}"${target}>${inner}</a>`
    }
    case 'quote':
      return `<blockquote>${inner}</blockquote>`
    default:
      return inner
  }
}

export function lexicalToHtml(input: unknown): string {
  const root = (input as LexicalRoot | null | undefined)?.root
  if (!root?.children) return ''
  return root.children.map(renderNode).join('')
}
