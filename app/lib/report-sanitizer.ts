import sanitizeHtml from 'sanitize-html';

const HTML_BLOCK_TAGS_REGEX = /<\/?(?:p|div|h[1-6]|table|thead|tbody|tfoot|tr|th|td|ul|ol|li|blockquote|figure|figcaption)\b/i;

/**
 * Deterministically discriminates between rich HTML reports and legacy plain-text/Markdown.
 * Only returns true if genuine structural HTML elements are present.
 */
export function isHtmlReport(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  return HTML_BLOCK_TAGS_REGEX.test(content);
}

/**
 * Cloudflare Workers and Node compatible strict HTML sanitizer.
 * Strips script tags, event handlers, iframe/object embeds, and unsafe URL schemes.
 * Enforces safe link attributes (rel="noopener noreferrer").
 */
export function sanitizeReportHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  return sanitizeHtml(rawHtml, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
      'img', 'a', 'span', 'div', 'figure', 'figcaption',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'title', 'class'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class'],
      table: ['class', 'style', 'width', 'border', 'cellpadding', 'cellspacing'],
      th: ['colspan', 'rowspan', 'align', 'valign', 'scope', 'class'],
      td: ['colspan', 'rowspan', 'align', 'valign', 'class'],
      span: ['class'],
      div: ['class'],
      p: ['class'],
      h1: ['class', 'id'],
      h2: ['class', 'id'],
      h3: ['class', 'id'],
      h4: ['class', 'id'],
      h5: ['class', 'id'],
      h6: ['class', 'id'],
      blockquote: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        target: '_blank',
        rel: 'noopener noreferrer',
      }),
    },
  });
}
