import React from 'react';
import { Bookmark, Calendar, MapPin, Sparkles, Lock, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { cn } from '../utils';

export interface ResourceCardProps {
  id: string;
  type: 'academic' | 'event' | 'service';
  title: string;
  description: string;
  category: string;
  provider: string;
  meta: string;
  isSensitive?: boolean;
  matchScore?: number; // e.g. 0.94 (computed obliviously)
  onBookmark?: (id: string) => void;
  onSelect?: (id: string) => void;
  className?: string;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  id,
  type,
  title,
  description,
  category,
  provider,
  meta,
  isSensitive = false,
  matchScore,
  onBookmark,
  onSelect,
  className,
}) => {
  const typeConfig = {
    academic: {
      label: 'Academic Resource',
      icon: <Sparkles className="h-3 w-3 text-brand-400" />,
      badgeVariant: 'neutral' as const,
    },
    event: {
      label: 'University Event',
      icon: <Calendar className="h-3 w-3 text-cyan-400" />,
      badgeVariant: 'shield' as const,
    },
    service: {
      label: 'Campus Service',
      icon: <Lock className="h-3 w-3 text-purple-400" />,
      badgeVariant: 'confidential' as const,
    },
  };

  const currentType = typeConfig[type];

  return (
    <Card
      interactive
      glow={type === 'service' ? 'shield' : 'brand'}
      className={cn('flex flex-col justify-between text-left group', className)}
      onClick={() => onSelect?.(id)}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-sm bg-void-elevated border border-border-default">
              {currentType.icon}
            </span>
            <span className="font-mono text-[11px] text-slate-400">{category}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {isSensitive && (
              <Badge variant="confidential" size="sm" hasDot pulseDot>
                FERPA CONFIDENTIAL
              </Badge>
            )}
            {matchScore && (
              <Badge variant="verified" size="sm" hasDot>
                {Math.round(matchScore * 100)}% MATCH
              </Badge>
            )}
          </div>
        </div>

        <CardTitle className="group-hover:text-brand-300 transition-colors line-clamp-1">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {description}
        </p>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-border-subtle">
          <span className="truncate max-w-[140px] text-slate-300">{provider}</span>
          <span className="flex items-center gap-1 text-slate-400">
            <MapPin className="h-3 w-3 text-slate-400" />
            {meta}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-slate-400 hover:text-slate-100 p-0 h-auto"
          onClick={(e) => {
            e.stopPropagation();
            onBookmark?.(id);
          }}
          leftIcon={<Bookmark className="h-3.5 w-3.5" />}
        >
          Bookmark
        </Button>

        <Button
          variant={type === 'service' ? 'shield' : 'outline'}
          size="sm"
          className="text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(id);
          }}
          rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
        >
          {type === 'service' ? 'Confidential Access' : 'View Details'}
        </Button>
      </CardFooter>
    </Card>
  );
};

