import { useState } from 'react';
import {
  BarChart2,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  FileText,
  Link2,
  ImageIcon,
  Heading1,
} from 'lucide-react';
import { useCurrentTab } from '../../hooks/useCurrentTab';
import { Button, Badge } from '../ui';

interface SeoIssue {
  severity: 'error' | 'warning' | 'pass';
  category: string;
  message: string;
}

interface SeoReport {
  title: string;
  url: string;
  issues: SeoIssue[];
  meta: {
    title: string;
    titleLength: number;
    description: string;
    descriptionLength: number;
    hasCanonical: boolean;
    hasViewport: boolean;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
  };
  headings: { tag: string; text: string; level: number }[];
  links: { total: number; internal: number; external: number; broken: number };
  images: { total: number; withAlt: number; withoutAlt: number; oversized: number };
  text: { wordCount: number };
}

export function SeoPanel() {
  const tab = useCurrentTab();
  const [report, setReport] = useState<SeoReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const runAnalysis = async () => {
    if (!tab?.id) return;
    setAnalyzing(true);
    setError('');
    setReport(null);

    try {
      // Run all analyses in parallel via content script
      const [headersRes, linksRes, imagesRes, textRes, metaRes] = await Promise.all([
        chrome.tabs.sendMessage(tab.id, { action: 'getPageAnalysis', type: 'headers' }),
        chrome.tabs.sendMessage(tab.id, { action: 'getPageAnalysis', type: 'links' }),
        chrome.tabs.sendMessage(tab.id, { action: 'getPageAnalysis', type: 'images' }),
        chrome.tabs.sendMessage(tab.id, { action: 'getPageAnalysis', type: 'text' }),
        chrome.tabs.sendMessage(tab.id, { action: 'extractHTML' }),
      ]);

      const headers = headersRes.data || [];
      const links = linksRes.data || [];
      const images = imagesRes.data || [];
      const text = textRes.data || { wordCount: 0 };
      const meta = metaRes.meta || {};

      // Parse meta from the extracted page data
      const titleText = metaRes.title || '';
      const description = meta.description || '';

      // Build SEO issues
      const issues: SeoIssue[] = [];

      // Title checks
      if (!titleText) {
        issues.push({ severity: 'error', category: 'Title', message: 'Page is missing a title tag' });
      } else if (titleText.length < 30) {
        issues.push({ severity: 'warning', category: 'Title', message: `Title is too short (${titleText.length} chars, recommended 30-60)` });
      } else if (titleText.length > 60) {
        issues.push({ severity: 'warning', category: 'Title', message: `Title is too long (${titleText.length} chars, recommended 30-60)` });
      } else {
        issues.push({ severity: 'pass', category: 'Title', message: `Title length is good (${titleText.length} chars)` });
      }

      // Meta description checks
      if (!description) {
        issues.push({ severity: 'error', category: 'Meta', message: 'Missing meta description' });
      } else if (description.length < 120) {
        issues.push({ severity: 'warning', category: 'Meta', message: `Meta description is short (${description.length} chars, recommended 120-160)` });
      } else if (description.length > 160) {
        issues.push({ severity: 'warning', category: 'Meta', message: `Meta description is too long (${description.length} chars, recommended 120-160)` });
      } else {
        issues.push({ severity: 'pass', category: 'Meta', message: `Meta description length is good (${description.length} chars)` });
      }

      // Heading checks
      const h1s = headers.filter((h: { level: number }) => h.level === 1);
      if (h1s.length === 0) {
        issues.push({ severity: 'error', category: 'Headings', message: 'No H1 tag found on the page' });
      } else if (h1s.length > 1) {
        issues.push({ severity: 'warning', category: 'Headings', message: `Multiple H1 tags found (${h1s.length})` });
      } else {
        issues.push({ severity: 'pass', category: 'Headings', message: 'Single H1 tag present' });
      }

      // Check heading hierarchy
      const levels = headers.map((h: { level: number }) => h.level);
      let hierarchyOk = true;
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > levels[i - 1] + 1) {
          hierarchyOk = false;
          break;
        }
      }
      if (!hierarchyOk) {
        issues.push({ severity: 'warning', category: 'Headings', message: 'Heading hierarchy has gaps (e.g., H2 → H4)' });
      } else if (headers.length > 0) {
        issues.push({ severity: 'pass', category: 'Headings', message: 'Heading hierarchy is well-structured' });
      }

      // Image checks
      const imgsWithoutAlt = images.filter((img: { alt: string }) => !img.alt);
      const oversized = images.filter((img: { naturalWidth: number }) => img.naturalWidth > 2000);
      if (imgsWithoutAlt.length > 0) {
        issues.push({ severity: 'warning', category: 'Images', message: `${imgsWithoutAlt.length} image(s) missing alt text` });
      } else if (images.length > 0) {
        issues.push({ severity: 'pass', category: 'Images', message: 'All images have alt text' });
      }
      if (oversized.length > 0) {
        issues.push({ severity: 'warning', category: 'Images', message: `${oversized.length} oversized image(s) (>2000px wide)` });
      }

      // Link checks
      const internalLinks = links.filter((l: { isExternal: boolean }) => !l.isExternal);
      const externalLinks = links.filter((l: { isExternal: boolean }) => l.isExternal);
      const brokenLinks = links.filter((l: { isValid: boolean }) => !l.isValid);
      if (brokenLinks.length > 0) {
        issues.push({ severity: 'warning', category: 'Links', message: `${brokenLinks.length} potentially broken link(s)` });
      }
      if (links.length === 0) {
        issues.push({ severity: 'warning', category: 'Links', message: 'No links found on the page' });
      }

      // Content length check
      if (text.wordCount < 300) {
        issues.push({ severity: 'warning', category: 'Content', message: `Thin content (${text.wordCount} words, recommended 300+)` });
      } else {
        issues.push({ severity: 'pass', category: 'Content', message: `Content length is good (${text.wordCount} words)` });
      }

      setReport({
        title: titleText,
        url: tab.url,
        issues,
        meta: {
          title: titleText,
          titleLength: titleText.length,
          description,
          descriptionLength: description.length,
          hasCanonical: false, // Would need to check via content script
          hasViewport: true,
          ogTitle: '',
          ogDescription: '',
          ogImage: '',
        },
        headings: headers,
        links: {
          total: links.length,
          internal: internalLinks.length,
          external: externalLinks.length,
          broken: brokenLinks.length,
        },
        images: {
          total: images.length,
          withAlt: images.length - imgsWithoutAlt.length,
          withoutAlt: imgsWithoutAlt.length,
          oversized: oversized.length,
        },
        text: { wordCount: text.wordCount },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed — content script may not be loaded');
    }
    setAnalyzing(false);
  };

  const severityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="w-3.5 h-3.5 text-[var(--m-error)] shrink-0" />;
      case 'warning': return <AlertTriangle className="w-3.5 h-3.5 text-[var(--m-warning-text)] shrink-0" />;
      case 'pass': return <CheckCircle className="w-3.5 h-3.5 text-[var(--m-success)] shrink-0" />;
      default: return null;
    }
  };

  const scoreColor = (errors: number, warnings: number) => {
    if (errors > 0) return 'text-[var(--m-error)]';
    if (warnings > 2) return 'text-[var(--m-warning-text)]';
    return 'text-[var(--m-success)]';
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-primary)]">
          SEO Analyzer
        </span>
        <Button
          size="sm"
          variant="primary"
          onClick={runAnalysis}
          disabled={analyzing || !tab?.id}
          loading={analyzing}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Analyze Page
        </Button>
      </div>

      {tab && (
        <div className="flex items-center gap-2 text-[var(--m-text-xs)] text-[var(--m-text-tertiary)]">
          <Globe className="w-3 h-3" />
          <span className="truncate">{tab.url}</span>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-[var(--m-error-subtle)] text-[var(--m-error)] text-[var(--m-text-xs)] rounded-[var(--m-radius-md)]">
          {error}
        </div>
      )}

      {report && (
        <div className="flex flex-col gap-3">
          {/* Score summary */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: <Heading1 className="w-4 h-4" />, label: 'Headings', value: report.headings.length },
              { icon: <Link2 className="w-4 h-4" />, label: 'Links', value: report.links.total },
              { icon: <ImageIcon className="w-4 h-4" />, label: 'Images', value: report.images.total },
              { icon: <FileText className="w-4 h-4" />, label: 'Words', value: report.text.wordCount },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center p-2 bg-[var(--m-bg-card)] rounded-[var(--m-radius-md)] border border-[var(--m-border)]"
              >
                <span className="text-[var(--m-text-tertiary)]">{stat.icon}</span>
                <span className="text-[var(--m-text-lg)] font-semibold text-[var(--m-text-primary)]">
                  {stat.value}
                </span>
                <span className="text-[var(--m-text-xs)] text-[var(--m-text-tertiary)]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Overall score */}
          {(() => {
            const errors = report.issues.filter((i) => i.severity === 'error').length;
            const warnings = report.issues.filter((i) => i.severity === 'warning').length;
            const passes = report.issues.filter((i) => i.severity === 'pass').length;
            return (
              <div className="flex items-center gap-3 p-2.5 bg-[var(--m-bg-card)] rounded-[var(--m-radius-md)] border border-[var(--m-border)]">
                <span className={`text-[var(--m-text-xl)] font-bold ${scoreColor(errors, warnings)}`}>
                  {Math.round((passes / (passes + errors + warnings)) * 100)}%
                </span>
                <div className="flex gap-2">
                  <Badge variant="error">{errors} errors</Badge>
                  <Badge variant="warning">{warnings} warnings</Badge>
                  <Badge variant="success">{passes} passed</Badge>
                </div>
              </div>
            );
          })()}

          {/* Issues list */}
          <div>
            <span className="text-[var(--m-text-xs)] font-medium text-[var(--m-text-primary)] block mb-2">
              Issues
            </span>
            <div className="flex flex-col gap-1.5">
              {report.issues.map((issue, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 bg-[var(--m-bg-card)] rounded-[var(--m-radius-sm)] border border-[var(--m-border)]"
                >
                  {severityIcon(issue.severity)}
                  <div className="flex-1 min-w-0">
                    <span className="text-[var(--m-text-xs)] text-[var(--m-text-primary)]">
                      {issue.message}
                    </span>
                  </div>
                  <Badge variant="default">{issue.category}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Meta info */}
          <div>
            <span className="text-[var(--m-text-xs)] font-medium text-[var(--m-text-primary)] block mb-2">
              Page Meta
            </span>
            <div className="p-2.5 bg-[var(--m-bg-inset)] rounded-[var(--m-radius-md)] text-[var(--m-text-xs)] flex flex-col gap-1">
              <p>
                <span className="text-[var(--m-text-tertiary)]">Title:</span>{' '}
                <span className="text-[var(--m-text-primary)]">{report.meta.title || '(none)'}</span>
              </p>
              <p>
                <span className="text-[var(--m-text-tertiary)]">Description:</span>{' '}
                <span className="text-[var(--m-text-primary)]">
                  {report.meta.description ? report.meta.description.slice(0, 100) + (report.meta.description.length > 100 ? '...' : '') : '(none)'}
                </span>
              </p>
              <div className="flex gap-3">
                <span className="text-[var(--m-text-tertiary)]">
                  Links: {report.links.internal} internal / {report.links.external} external
                </span>
                <span className="text-[var(--m-text-tertiary)]">
                  Images: {report.images.withAlt} with alt / {report.images.withoutAlt} missing
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!report && !analyzing && !error && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BarChart2 className="w-10 h-10 text-[var(--m-text-tertiary)] mb-3" />
          <p className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-secondary)]">
            SEO Page Analyzer
          </p>
          <p className="text-[var(--m-text-xs)] text-[var(--m-text-tertiary)] mt-1">
            Click "Analyze Page" to check the current page for SEO issues including title, meta, headings, images, and content.
          </p>
        </div>
      )}
    </div>
  );
}
