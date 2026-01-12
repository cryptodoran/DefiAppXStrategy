'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, MessageSquare, FileText, Target, Lightbulb, Search } from 'lucide-react';

const actions = [
  {
    name: 'Create Viral Post',
    description: 'AI-powered post generator',
    href: '/create/viral',
    icon: Flame,
    color: 'from-orange-500 to-red-500',
  },
  {
    name: 'Build Thread',
    description: 'Multi-tweet thread creator',
    href: '/create/thread',
    icon: MessageSquare,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'View Suggestions',
    description: 'Daily content recommendations',
    href: '/suggestions/daily',
    icon: Lightbulb,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    name: 'Research Mode',
    description: 'CT intelligence & analysis',
    href: '/research',
    icon: Search,
    color: 'from-purple-500 to-pink-500',
  },
];

export function QuickActions() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.name} href={action.href}>
                <div className="group rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900">
                  <div
                    className={`mb-3 inline-flex rounded-lg bg-gradient-to-r p-2 ${action.color}`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-medium text-white group-hover:text-white">
                    {action.name}
                  </h4>
                  <p className="mt-1 text-xs text-zinc-500">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
