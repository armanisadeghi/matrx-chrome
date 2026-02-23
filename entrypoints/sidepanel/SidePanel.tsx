import { useState } from 'react';
import {
  Heading1,
  FileText,
  Link2,
  ImageIcon,
  Target,
  MessageSquare,
  Globe,
  Scan,
  BarChart2,
  Download,
  ClipboardList,
  BookOpen,
  Wrench,
  Settings,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useCurrentTab } from '../../hooks/useCurrentTab';
import { Tabs, TabPanel } from '../../components/ui/Tabs';
import { HeaderAnalysis } from '../../components/analysis/HeaderAnalysis';
import { LinkAnalysis } from '../../components/analysis/LinkAnalysis';
import { ImageAnalysis } from '../../components/analysis/ImageAnalysis';
import { TextContent } from '../../components/analysis/TextContent';
import { ExtractionPanel } from '../../components/extraction/ExtractionPanel';
import { CustomRangePanel } from '../../components/extraction/CustomRangePanel';
import { ChatPanel } from '../../components/chat/ChatPanel';
import { BrowserControlPanel } from '../../components/browser-control/BrowserControlPanel';
import { QuickScrapePanel } from '../../components/scraper/QuickScrapePanel';
import { ScrapeQueuePanel } from '../../components/scraper/ScrapeQueuePanel';
import { ResearchPanel } from '../../components/research/ResearchPanel';
import { ToolBrowserPanel } from '../../components/tools/ToolBrowserPanel';
import { SeoPanel } from '../../components/seo/SeoPanel';
import { SettingsPanel } from '../../components/settings/SettingsPanel';
import { Badge } from '../../components/ui/Badge';

const tabDefs = [
  { id: 'chat', label: 'AI Chat', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { id: 'scrape', label: 'Scrape', icon: <Download className="w-3.5 h-3.5" /> },
  { id: 'queue', label: 'Queue', icon: <ClipboardList className="w-3.5 h-3.5" /> },
  { id: 'research', label: 'Research', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'extract', label: 'Extract', icon: <Scan className="w-3.5 h-3.5" /> },
  { id: 'range', label: 'Range', icon: <Target className="w-3.5 h-3.5" /> },
  { id: 'headers', label: 'Headers', icon: <Heading1 className="w-3.5 h-3.5" /> },
  { id: 'text', label: 'Text', icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 'links', label: 'Links', icon: <Link2 className="w-3.5 h-3.5" /> },
  { id: 'images', label: 'Images', icon: <ImageIcon className="w-3.5 h-3.5" /> },
  { id: 'browser', label: 'Browser', icon: <Globe className="w-3.5 h-3.5" /> },
  { id: 'tools', label: 'Tools', icon: <Wrench className="w-3.5 h-3.5" /> },
  { id: 'seo', label: 'SEO', icon: <BarChart2 className="w-3.5 h-3.5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
];

export function SidePanel() {
  useTheme();
  const tab = useCurrentTab();
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-[var(--m-bg-card)] border-b border-[var(--m-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[var(--m-radius-sm)] bg-[var(--m-brand)] flex items-center justify-center shrink-0">
            <span className="text-white font-bold" style={{ fontSize: '11px' }}>M</span>
          </div>
          <span className="font-semibold text-[color:var(--m-text-primary)]" style={{ fontSize: '14px' }}>
            Matrx
          </span>
          <Badge>v2.0</Badge>
        </div>
      </header>

      {/* Page Info Bar */}
      {tab && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[var(--m-bg-inset)] border-b border-[var(--m-border)]">
          {tab.favIconUrl && (
            <img src={tab.favIconUrl} className="w-3.5 h-3.5 rounded-sm" alt="" />
          )}
          <span className="text-[color:var(--m-text-secondary)] truncate" style={{ fontSize: '11px' }}>
            {tab.domain}
          </span>
          <span className="text-[color:var(--m-text-tertiary)] mx-0.5">&middot;</span>
          <span className="text-[color:var(--m-text-tertiary)] truncate flex-1" style={{ fontSize: '11px' }}>
            {tab.title}
          </span>
        </div>
      )}

      {/* Tab Navigation */}
      <Tabs tabs={tabDefs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        <TabPanel active={activeTab === 'chat'} className="!p-0 h-full">
          <ChatPanel />
        </TabPanel>

        <TabPanel active={activeTab === 'scrape'} className="!p-0">
          <QuickScrapePanel />
        </TabPanel>

        <TabPanel active={activeTab === 'queue'} className="!p-0">
          <ScrapeQueuePanel />
        </TabPanel>

        <TabPanel active={activeTab === 'research'} className="!p-0 h-full">
          <ResearchPanel />
        </TabPanel>

        <TabPanel active={activeTab === 'extract'}>
          <ExtractionPanel />
        </TabPanel>

        <TabPanel active={activeTab === 'range'}>
          <CustomRangePanel />
        </TabPanel>

        <TabPanel active={activeTab === 'headers'}>
          <HeaderAnalysis />
        </TabPanel>

        <TabPanel active={activeTab === 'text'}>
          <TextContent />
        </TabPanel>

        <TabPanel active={activeTab === 'links'}>
          <LinkAnalysis />
        </TabPanel>

        <TabPanel active={activeTab === 'images'}>
          <ImageAnalysis />
        </TabPanel>

        <TabPanel active={activeTab === 'browser'}>
          <BrowserControlPanel />
        </TabPanel>

        <TabPanel active={activeTab === 'tools'} className="!p-0 h-full">
          <ToolBrowserPanel />
        </TabPanel>

        <TabPanel active={activeTab === 'seo'}>
          <SeoPanel />
        </TabPanel>

        <TabPanel active={activeTab === 'settings'}>
          <SettingsPanel />
        </TabPanel>
      </div>
    </div>
  );
}
