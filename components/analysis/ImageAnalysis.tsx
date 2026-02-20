import { useState, useEffect } from 'react';
import { ImageIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import { useCurrentTab } from '../../hooks/useCurrentTab';
import { Button, Badge, EmptyState } from '../ui';
import type { ImageInfo } from '../../utils/types';

export function ImageAnalysis() {
  const tab = useCurrentTab();
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!tab?.id) return;
    setLoading(true);
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getPageAnalysis',
        type: 'images',
      });
      if (response.success) {
        setImages(response.data || []);
      }
    } catch {
      // Page might not be ready
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyze();
  }, [tab?.url]);

  const missingAlt = images.filter((img) => !img.alt).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[color:var(--m-text-secondary)]">
            {images.length} images
          </span>
          {missingAlt > 0 && (
            <Badge variant="warning">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {missingAlt} missing alt
            </Badge>
          )}
        </div>
        <Button size="sm" variant="ghost" icon onClick={analyze} loading={loading}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {images.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="w-8 h-8" />}
          title="No images found"
        />
      ) : (
        <div className="flex flex-col gap-1 max-h-[400px] overflow-auto">
          {images.map((img, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-2 py-1.5 rounded-[var(--m-radius-sm)] hover:bg-[var(--m-bg-hover)]"
            >
              <div className="w-10 h-10 rounded-[var(--m-radius-sm)] bg-[var(--m-bg-inset)] overflow-hidden shrink-0 flex items-center justify-center">
                {img.src ? (
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-4 h-4 text-[color:var(--m-text-tertiary)]" />
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm text-[color:var(--m-text-primary)] truncate">
                  {img.alt || (
                    <span className="text-[var(--m-warning-text)] italic">
                      No alt text
                    </span>
                  )}
                </span>
                <span className="text-xs text-[color:var(--m-text-tertiary)] truncate">
                  {img.src?.split('/').pop()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
