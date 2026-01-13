'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { ContentCreator } from '@/components/content-studio/content-creator';
import { ThreadBuilder } from '@/components/content-studio/thread-builder';
import { QTStudio } from '@/components/content-studio/qt-studio';
import { MarketContextPanel } from '@/components/dashboard/market-context';
import { PenSquare, MessageSquare, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ContentTab = 'post' | 'thread' | 'qt';

function CreatePageContent() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get('topic');
  const tabParam = searchParams.get('tab');
  const urlParam = searchParams.get('url');
  const [activeTab, setActiveTab] = React.useState<ContentTab>('post');
  const [initialContent, setInitialContent] = React.useState<string | undefined>(undefined);
  const [initialThreadPosts, setInitialThreadPosts] = React.useState<string[] | undefined>(undefined);
  const [qtUrl, setQtUrl] = React.useState<string | undefined>(undefined);

  // Check for edit content from dashboard "Ready to Post" section
  React.useEffect(() => {
    // Check for thread posts first
    const threadPostsJson = sessionStorage.getItem('editThreadPosts');
    if (threadPostsJson) {
      try {
        const posts = JSON.parse(threadPostsJson);
        setInitialThreadPosts(posts);
        setActiveTab('thread');
        sessionStorage.removeItem('editThreadPosts');
      } catch (e) {
        console.error('Failed to parse thread posts:', e);
      }
    }

    // Check for single tweet content
    const editContent = sessionStorage.getItem('editTweetContent');
    if (editContent) {
      setInitialContent(editContent);
      sessionStorage.removeItem('editTweetContent');
      sessionStorage.removeItem('editTweetImagePrompt');
    }

    // Handle tab query param
    if (tabParam === 'thread') {
      setActiveTab('thread');
    } else if (tabParam === 'qt') {
      setActiveTab('qt');
      // Pass URL to QT studio if provided
      if (urlParam) {
        setQtUrl(urlParam);
      }
    }
  }, [tabParam, urlParam]);

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
        {activeTab === 'post' && <ContentCreator initialTopic={topicParam || undefined} initialContent={initialContent} />}
        {activeTab === 'thread' && <ThreadBuilder initialTopic={topicParam || undefined} initialPosts={initialThreadPosts} />}
        {activeTab === 'qt' && <QTStudio initialUrl={qtUrl} />}
      </motion.div>
    </AppLayout>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />
        </div>
      </AppLayout>
    }>
      <CreatePageContent />
    </Suspense>
  );
}
