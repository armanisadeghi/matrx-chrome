// Content Script — Runs on all web pages
// Handles HTML extraction, page analysis, and browser automation
export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',

  main() {
    console.log('[Matrx] Content script loaded');

    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      const handler = messageHandlers[request.action];
      if (handler) {
        handler(request)
          .then((result) => sendResponse(result))
          .catch((err) =>
            sendResponse({ success: false, error: err.message }),
          );
        return true; // Keep channel open for async
      }
      return false;
    });
  },
});

// ============================================
// Message Handlers
// ============================================

type Handler = (request: Record<string, unknown>) => Promise<unknown>;

const messageHandlers: Record<string, Handler> = {
  ping: async () => ({ success: true, message: 'Content script ready' }),
  copyFullHTML: handleFullHTML,
  copySmartHTML: handleSmartHTML,
  copyCustomSmartHTML: handleCustomSmartHTML,
  extractCustomRange: handleCustomRange,
  testHtmlMarker: handleTestMarker,
  getPageAnalysis: handlePageAnalysis,
  executeAction: handleBrowserAction,
  extractHTML: handleExtractAndSave,
};

// ============================================
// HTML Extraction
// ============================================

async function handleFullHTML(): Promise<unknown> {
  const html = document.documentElement.outerHTML;
  return { success: true, html, size: html.length };
}

async function handleSmartHTML(): Promise<unknown> {
  const html = extractSmartHTML();
  return { success: true, html, size: html.length };
}

async function handleCustomSmartHTML(): Promise<unknown> {
  const html = extractCustomSmartHTML();
  return { success: true, html, size: html.length };
}

async function handleCustomRange(
  request: Record<string, unknown>,
): Promise<unknown> {
  const startMarker = request.startMarker as string;
  const endMarker = request.endMarker as string;

  const pageHtml = document.documentElement.outerHTML;
  const startPos = pageHtml.indexOf(startMarker);
  if (startPos === -1)
    return { success: false, error: `Start marker not found: "${startMarker.substring(0, 50)}"` };

  const endPos = pageHtml.indexOf(endMarker, startPos + startMarker.length);
  if (endPos === -1)
    return { success: false, error: `End marker not found after start marker` };

  const extracted = pageHtml.substring(startPos, endPos + endMarker.length);
  const content = wrapInDocument(extracted);

  return { success: true, content, size: content.length, startPosition: startPos, endPosition: endPos };
}

async function handleTestMarker(
  request: Record<string, unknown>,
): Promise<unknown> {
  const marker = request.marker as string;
  const type = request.type as string;
  const pageHtml = document.documentElement.outerHTML;

  const positions: number[] = [];
  let pos = 0;
  while ((pos = pageHtml.indexOf(marker, pos)) !== -1) {
    positions.push(pos);
    pos++;
  }

  if (positions.length === 0) {
    return { success: false, error: `${type === 'start' ? 'Start' : 'End'} marker not found` };
  }

  return { success: true, count: positions.length, positions, marker, type };
}

async function handleExtractAndSave(
  request: Record<string, unknown>,
): Promise<unknown> {
  const htmlContent = document.documentElement.outerHTML;
  const pageTitle = document.title;
  const metaDescription =
    document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const metaKeywords =
    document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';

  return {
    success: true,
    size: htmlContent.length,
    title: pageTitle,
    html: htmlContent,
    meta: { description: metaDescription, keywords: metaKeywords },
    savedToDatabase: false,
  };
}

// ============================================
// Smart HTML Extraction (preserved from legacy)
// ============================================

function extractSmartHTML(): string {
  const docClone = document.cloneNode(true) as Document;

  // Remove navigation, ads, etc.
  const removeSelectors = [
    'nav', 'header', 'footer', 'aside',
    '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]', '[role="complementary"]',
    '.nav', '.navigation', '.navbar', '.menu', '.header', '.footer', '.sidebar', '.aside',
    '#nav', '#navigation', '#navbar', '#menu', '#header', '#footer', '#sidebar', '#aside',
    '.site-header', '.site-footer', '.site-nav', '.main-nav', '.primary-nav',
    '.breadcrumb', '.breadcrumbs', '.pagination', '.pager',
    '.social', '.social-links', '.social-media', '.share', '.sharing',
    '.advertisement', '.ads', '.ad', '.banner-ad', '.sponsored',
    '.cookie-notice', '.cookie-banner', '.gdpr-notice',
    '.newsletter', '.subscription', '.signup', '.subscribe',
    'script', 'noscript', 'style', 'link[rel="stylesheet"]',
    'meta[name="viewport"]', 'meta[charset]', 'meta[http-equiv]',
    'meta[name="generator"]', 'meta[name="robots"]',
  ];

  removeSelectors.forEach((sel) => {
    try {
      docClone.querySelectorAll(sel).forEach((el) => el.remove());
    } catch { /* ignore */ }
  });

  removeComments(docClone);

  // Clean head
  const head = docClone.querySelector('head');
  if (head) {
    const essentialMeta = head.querySelectorAll(
      'meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name="twitter:"], meta[name="author"]',
    );
    const title = document.querySelector('title');
    head.innerHTML = '';
    if (title) {
      const t = docClone.createElement('title');
      t.textContent = title.textContent;
      head.appendChild(t);
    }
    essentialMeta.forEach((m) => head.appendChild(m.cloneNode(true)));
  }

  // Clean body
  const body = docClone.querySelector('body');
  if (body) cleanupElement(body);

  // Remove data attributes and event handlers
  docClone.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-') && !attr.name.startsWith('data-id') && !attr.name.startsWith('data-content') && !attr.name.startsWith('data-src')) {
        el.removeAttribute(attr.name);
      }
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
    if (el.getAttribute('class') === '') el.removeAttribute('class');
    if (el.getAttribute('id') === '') el.removeAttribute('id');
  });

  return docClone.documentElement.outerHTML;
}

function extractCustomSmartHTML(): string {
  const entryContent = document.querySelector('div.entry-content');
  if (!entryContent) return extractSmartHTML();

  const clone = entryContent.cloneNode(true) as HTMLElement;

  const related = clone.querySelector('div[id="related-content"]');
  if (related) {
    let el: ChildNode | null = related;
    while (el) {
      const next = el.nextSibling;
      el.parentNode?.removeChild(el);
      el = next;
    }
  }

  // Clean
  clone.querySelectorAll('script, noscript, style').forEach((el) => el.remove());
  removeComments(clone);
  cleanupElement(clone);

  return wrapInDocument(clone.outerHTML);
}

// ============================================
// Page Analysis
// ============================================

async function handlePageAnalysis(
  request: Record<string, unknown>,
): Promise<unknown> {
  const type = request.type as string;

  switch (type) {
    case 'headers':
      return {
        success: true,
        data: Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(
          (el) => ({
            tag: el.tagName,
            text: el.textContent?.trim() || '',
            level: parseInt(el.tagName[1]),
          }),
        ),
      };

    case 'links': {
      const pageHost = window.location.hostname;
      return {
        success: true,
        data: Array.from(document.querySelectorAll('a[href]')).map((el) => {
          const href = el.getAttribute('href') || '';
          let isExternal = false;
          try {
            const url = new URL(href, window.location.origin);
            isExternal = url.hostname !== pageHost;
          } catch { /* relative */ }
          return {
            href,
            text: el.textContent?.trim() || '',
            isExternal,
            isValid: href.startsWith('http') || href.startsWith('/'),
          };
        }),
      };
    }

    case 'images':
      return {
        success: true,
        data: Array.from(document.querySelectorAll('img')).map((el) => ({
          src: (el as HTMLImageElement).src,
          alt: (el as HTMLImageElement).alt,
          width: (el as HTMLImageElement).width,
          height: (el as HTMLImageElement).height,
          naturalWidth: (el as HTMLImageElement).naturalWidth,
          naturalHeight: (el as HTMLImageElement).naturalHeight,
        })),
      };

    case 'text': {
      const body = document.body;
      const clone = body.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('script, style, nav, header, footer, aside').forEach((el) => el.remove());
      const text = clone.innerText || clone.textContent || '';
      const words = text.trim().split(/\s+/).filter(Boolean);
      return {
        success: true,
        data: { text: text.trim(), wordCount: words.length },
      };
    }

    default:
      return { success: false, error: `Unknown analysis type: ${type}` };
  }
}

// ============================================
// Browser Actions
// ============================================

async function handleBrowserAction(
  request: Record<string, unknown>,
): Promise<unknown> {
  const action = request.browserAction as {
    type: string;
    selector?: string;
    value?: string;
    url?: string;
    delay?: number;
  };

  try {
    switch (action.type) {
      case 'navigate':
        if (action.url) window.location.href = action.url;
        return { success: true, result: 'Navigating...' };

      case 'click': {
        const clickEl = action.selector
          ? document.querySelector(action.selector)
          : null;
        if (!clickEl) return { success: false, error: `Element not found: ${action.selector}` };
        (clickEl as HTMLElement).click();
        return { success: true, result: 'Clicked' };
      }

      case 'type': {
        const typeEl = action.selector
          ? (document.querySelector(action.selector) as HTMLInputElement | null)
          : null;
        if (!typeEl) return { success: false, error: `Element not found: ${action.selector}` };
        typeEl.focus();
        typeEl.value = action.value || '';
        typeEl.dispatchEvent(new Event('input', { bubbles: true }));
        typeEl.dispatchEvent(new Event('change', { bubbles: true }));
        return { success: true, result: 'Typed' };
      }

      case 'scroll':
        if (action.selector) {
          const scrollEl = document.querySelector(action.selector);
          scrollEl?.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollBy({ top: 500, behavior: 'smooth' });
        }
        return { success: true, result: 'Scrolled' };

      case 'screenshot':
        return {
          success: true,
          result: 'Screenshot requires background script — use chrome.tabs.captureVisibleTab',
        };

      case 'extract': {
        const el = action.selector
          ? document.querySelector(action.selector)
          : document.body;
        return {
          success: true,
          result: el?.innerHTML?.substring(0, 5000) || 'No content',
        };
      }

      case 'wait':
        await new Promise((r) => setTimeout(r, action.delay || 1000));
        return { success: true, result: `Waited ${action.delay || 1000}ms` };

      default:
        return { success: false, error: `Unknown action: ${action.type}` };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Action failed',
    };
  }
}

// ============================================
// Helpers
// ============================================

function removeComments(node: Node) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_COMMENT);
  const comments: Comment[] = [];
  while (walker.nextNode()) {
    comments.push(walker.currentNode as Comment);
  }
  comments.forEach((c) => c.parentNode?.removeChild(c));
}

function cleanupElement(element: Element) {
  const selfClosing = new Set(['img', 'br', 'hr', 'input', 'meta', 'link']);
  Array.from(element.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() || '';
      if (!text) node.parentNode?.removeChild(node);
      else node.textContent = text;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      cleanupElement(el);
      if (
        !selfClosing.has(el.tagName.toLowerCase()) &&
        el.innerHTML.trim() === '' &&
        !el.hasAttributes()
      ) {
        el.remove();
      }
    }
  });
}

function wrapInDocument(content: string): string {
  const title = document.title || 'Extracted Content';
  const metaDesc =
    document.querySelector('meta[name="description"]')?.outerHTML || '';
  const metaKw =
    document.querySelector('meta[name="keywords"]')?.outerHTML || '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
${metaDesc}
${metaKw}
</head>
<body>
${content}
</body>
</html>`;
}
