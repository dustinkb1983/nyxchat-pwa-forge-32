
import React from 'react';
import { motion } from 'framer-motion';
import { MemoryEntry } from '@/lib/indexedDB';
import { Brain, TrendingUp, Clock, Tag } from 'lucide-react';

interface MemoryInsightsProps {
  memories: MemoryEntry[];
}

export const MemoryInsights: React.FC<MemoryInsightsProps> = ({ memories }) => {
  const totalMemories = memories.length;
  const factCount = memories.filter(m => m.type === 'fact').length;
  const preferenceCount = memories.filter(m => m.type === 'preference').length;
  const goalCount = memories.filter(m => m.type === 'goal').length;
  
  const avgImportance = totalMemories > 0 
    ? memories.reduce((sum, m) => sum + m.importance, 0) / totalMemories 
    : 0;

  const recentCount = memories.filter(m => 
    Date.now() - m.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
  ).length;

  const insights = [
    {
      icon: Brain,
      label: 'Total Memories',
      value: totalMemories,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      icon: TrendingUp,
      label: 'Avg Importance',
      value: avgImportance.toFixed(1),
      color: 'text-green-400',
      bg: 'bg-green-400/10'
    },
    {
      icon: Clock,
      label: 'Added This Week',
      value: recentCount,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10'
    },
    {
      icon: Tag,
      label: 'Categories',
      value: `${factCount}F ${preferenceCount}P ${goalCount}G`,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {insights.map((insight, index) => (
        <motion.div
          key={insight.label}
          className={`p-3 rounded-lg ${insight.bg} border border-muted/20`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <insight.icon className={`h-4 w-4 ${insight.color}`} />
            <span className="text-xs text-muted-foreground">{insight.label}</span>
          </div>
          <div className={`text-lg font-bold ${insight.color}`}>
            {insight.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
