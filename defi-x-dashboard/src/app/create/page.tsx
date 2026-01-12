'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { ContentCreator } from '@/components/content-studio/content-creator';
import { ThreadBuilder } from '@/components/content-studio/thread-builder';
import { QTStudio } from '@/components/content-studio/qt-studio';
import { MarketContextPanel } from '@/components/dashboard/market-context';
import { PenSquare, MessageSquare, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ContentTab = 'post' | 'thread' | 'qt';

export default function CreatePage() {
  const [activeTab, setActiveTab] = React.useState<ContentTab>('post');

  const tabs = [
    { id: 'post', label: 'New Post', icon: <PenSquare className="h-4 w-4" /> },
    { id: 'thread', label: 'Thread Builder', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'qt', label: 'QT Studio', icon: <Share2 className="h-4 w-4" /> },
  ] as const;

  return (
    <AppLayout rightPanel={<MarketContextPanel />}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-primary">Content Studio</h1>
          <p className="text-tertiary mt-1">Create high-quality content with AI assistance</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-surface rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-elevated text-primary'
                  : 'text-tertiary hover:text-secondary'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'post' && <ContentCreator />}
        {activeTab === 'thread' && <ThreadBuilder />}
        {activeTab === 'qt' && <QTStudio />}
      </motion.div>
    </AppLayout>
  );
}
