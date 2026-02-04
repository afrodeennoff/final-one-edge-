"use client";

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Paperclip, 
  Image, 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Hash
} from 'lucide-react'
import { useI18n } from '@/locales/client'

type PostType = 'discussion' | 'analysis' | 'question' | 'news'

interface CreatePostProps {
  onSubmit: (content: string, type: PostType) => void
  onCancel: () => void
}

export default function CreatePost({ onSubmit, onCancel }: CreatePostProps) {
  const t = useI18n()
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState<PostType>('discussion')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    
    setIsSubmitting(true)
    try {
      onSubmit(content, postType)
      setContent('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const postTypes: { value: PostType; label: string; icon: React.ComponentType<{className?: string}> }[] = [
    { value: 'discussion', label: 'Discussion', icon: Hash },
    { value: 'analysis', label: 'Analysis', icon: BarChart3 },
    { value: 'question', label: 'Question', icon: TrendingUp },
    { value: 'news', label: 'News', icon: TrendingDown },
  ]

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-card">
      <div className="flex flex-wrap gap-2">
        {postTypes.map((type) => {
          const Icon = type.icon
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => setPostType(type.value)}
              className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-1.5 transition-colors ${
                postType === type.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {type.label}
            </button>
          )
        })}
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-content">Share your thoughts</Label>
        <Textarea
          id="post-content"
          placeholder="What's on your mind? Share market insights, ask questions, or discuss trading strategies..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px]"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Paperclip className="h-4 w-4" />
            <span className="hidden sm:inline">Attachment</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Image</span>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!content.trim() || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Posting...
              </>
            ) : (
              'Post'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}