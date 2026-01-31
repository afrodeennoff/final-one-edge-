import React, { HTMLAttributes, ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  widths?: number[]
  sizes?: string
  priority?: boolean
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | number
  cover?: boolean
}

const defaultSizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'

export function ResponsiveImage({
  src,
  alt,
  widths = [320, 640, 768, 1024, 1280, 1536, 1920],
  sizes = defaultSizes,
  priority = false,
  aspectRatio,
  cover = false,
  className,
  ...props
}: ResponsiveImageProps) {
  const aspectRatioStyles: Record<string, string> = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[16/9]',
  }

  const getAspectRatioClass = () => {
    if (!aspectRatio) return ''
    if (typeof aspectRatio === 'number') return ''
    return aspectRatioStyles[aspectRatio] || ''
  }

  const getAspectRatioStyle = () => {
    if (!aspectRatio) return {}
    if (typeof aspectRatio === 'number') {
      return { aspectRatio: aspectRatio.toString() }
    }
    return {}
  }

  const generateSrcSet = () => {
    return widths
      .map(width => `${src}?w=${width} ${width}w`)
      .join(', ')
  }

  return (
    <img
      src={src}
      alt={alt}
      srcSet={generateSrcSet()}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      className={cn(
        getAspectRatioClass(),
        cover && 'object-cover',
        className
      )}
      style={getAspectRatioStyle()}
      {...props}
    />
  )
}

interface PictureProps {
  children: React.ReactNode
  className?: string
}

export function Picture({ children, className }: PictureProps) {
  return (
    <picture className={cn('block', className)}>
      {children}
    </picture>
  )
}

interface SourceProps {
  srcSet: string
  type?: string
  media?: string
  sizes?: string
}

export function Source({ srcSet, type, media, sizes }: SourceProps) {
  return (
    <source
      srcSet={srcSet}
      type={type}
      media={media}
      sizes={sizes}
    />
  )
}

interface NextGenImageProps extends ResponsiveImageProps {
  avifSrc?: string
  webpSrc?: string
}

export function NextGenImage({
  src,
  avifSrc,
  webpSrc,
  alt,
  className,
  ...props
}: NextGenImageProps) {
  return (
    <Picture className={className}>
      {avifSrc && (
        <Source
          srcSet={`${avifSrc} 1x, ${avifSrc}?dpr=2 2x`}
          type="image/avif"
        />
      )}
      {webpSrc && (
        <Source
          srcSet={`${webpSrc} 1x, ${webpSrc}?dpr=2 2x`}
          type="image/webp"
        />
      )}
      <ResponsiveImage
        src={src}
        alt={alt}
        {...props}
      />
    </Picture>
  )
}
