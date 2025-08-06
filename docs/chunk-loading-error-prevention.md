# Chunk Loading Error Prevention and Recovery

## Problem Overview

The competition detail page was experiencing frequent `ChunkLoadError` failures with error messages like:

```
ChunkLoadError: Loading chunk 809 failed.
(missing: https://www.radiancerewards.co.uk/_next/static/chunks/809-afe3d2852b01fe22.js)
```

## Root Causes

### 1. Heavy Client-Side Dependencies
The original `CompetitionDetail` component imported several large libraries synchronously:
- `react-markdown` + `remark-gfm` (markdown parsing)
- `swiper/react` + modules (carousel functionality)  
- Multiple UI components and contexts

### 2. Large Client Component Bundle
- The `CompetitionDetail.tsx` was 727 lines and marked as `"use client"`
- This created large JavaScript chunks that were prone to network loading failures
- No code splitting for heavy dependencies

### 3. Network/Caching Issues
- Old cached chunks conflicting with new deployments
- Network connectivity issues during chunk loading
- CDN/browser caching conflicts between deployments

### 4. No Retry Mechanism
- No error boundary or retry logic for chunk loading failures
- Users had to manually refresh the page

## Solution Implementation

### 1. Chunk Error Boundary (`src/shared/lib/utils/chunk-retry.tsx`)

Created a comprehensive error boundary that:

- **Detects chunk loading errors** by checking error messages and types
- **Automatic retry mechanism** with exponential backoff (max 3 attempts)
- **Manual retry option** as fallback (full page reload)
- **Graceful error handling** with user-friendly messaging

Key features:
```typescript
// Automatic detection of chunk errors
const isChunkError = error.name === 'ChunkLoadError' || 
                    error.message.includes('Loading chunk') ||
                    error.message.includes('Loading CSS chunk')

// Exponential backoff retry
const delay = RETRY_DELAY * (this.state.retryCount + 1)
```

### 2. Optimized Competition Detail Component

Created `CompetitionDetailOptimized.tsx` with:

#### Dynamic Imports with Loading States
```typescript
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-20 rounded"></div>,
  ssr: false
})

const CompetitionImageCarousel = dynamic(() => import('./CompetitionImageCarousel'), {
  loading: () => (
    <div className="w-full aspect-square rounded-2xl bg-gray-200 animate-pulse">
      <div className="text-gray-400">Loading images...</div>
    </div>
  ),
  ssr: false
})
```

#### Progressive Loading for Markdown
```typescript
function MarkdownLoader({ children }: { children: string }) {
  const [remarkGfmPlugin, setRemarkGfmPlugin] = useState<any>(null)

  useEffect(() => {
    import('remark-gfm').then(plugin => {
      setRemarkGfmPlugin(() => plugin.default)
    })
  }, [])
  // ...
}
```

### 3. Page-Level Error Boundaries and Suspense

Updated `src/app/(pages)/competitions/[id]/page.tsx` with:

- **Nested error boundaries** at multiple levels
- **Comprehensive loading skeletons** that match the actual UI structure  
- **Suspense boundaries** around dynamic components
- **Graceful degradation** with user-friendly error messages

### 4. Webpack Optimization

Enhanced `next.config.ts` with:

```typescript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          // Separate heavy libraries into their own chunks
          swiper: {
            name: 'swiper',
            test: /[\\/]node_modules[\\/]swiper[\\/]/,
            chunks: 'all',
            priority: 20,
          },
          markdown: {
            name: 'markdown', 
            test: /[\\/]node_modules[\\/](react-markdown|remark-gfm)[\\/]/,
            chunks: 'all',
            priority: 20,
          },
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 10,
            maxSize: 244000, // 244KB chunks
          },
        },
      },
    };
  }
  return config;
}
```

## Benefits

### 1. Improved Reliability
- **Automatic error recovery** reduces user friction
- **Graceful degradation** ensures the site remains functional
- **Retry mechanism** handles transient network issues

### 2. Better Performance
- **Code splitting** reduces initial bundle size
- **Dynamic imports** load heavy dependencies only when needed
- **Optimized chunks** prevent single points of failure

### 3. Enhanced UX
- **Loading states** provide visual feedback during dynamic imports
- **Error boundaries** show helpful error messages instead of white screens
- **Skeleton screens** maintain layout during loading

### 4. Better Monitoring
- **Error tracking** helps identify problematic chunks
- **Retry counters** provide insights into network issues
- **Console logging** aids in debugging

## Usage

### Apply Error Boundary to Any Component
```typescript
import { ChunkErrorBoundary } from '@/shared/lib/utils/chunk-retry'

export default function MyPage() {
  return (
    <ChunkErrorBoundary>
      <MyHeavyComponent />
    </ChunkErrorBoundary>
  )
}
```

### Use HOC for Automatic Protection
```typescript
import { withChunkErrorBoundary } from '@/shared/lib/utils/chunk-retry'

const ProtectedComponent = withChunkErrorBoundary(MyComponent, {
  maxRetries: 2,
  fallback: <CustomErrorUI />
})
```

### Hook for Manual Retry
```typescript
import { useChunkRetry } from '@/shared/lib/utils/chunk-retry'

function MyComponent() {
  const { retryChunk } = useChunkRetry()
  
  return (
    <button onClick={retryChunk}>
      Retry Loading
    </button>
  )
}
```

## Recommendations

### For Heavy Components
1. **Always use dynamic imports** for components that import large libraries
2. **Provide meaningful loading states** that match the component's final size
3. **Wrap in Suspense** with appropriate fallbacks
4. **Add error boundaries** at the component level

### For Critical Pages
1. **Multiple error boundary layers** (page, section, component)
2. **Progressive loading** for non-critical content
3. **Graceful degradation** for failed chunks
4. **User-friendly error messages** with retry options

### For Monitoring
1. **Track chunk loading failures** in analytics
2. **Monitor retry success rates** to identify network issues
3. **Log error patterns** to improve chunk strategies
4. **A/B test different chunking strategies**

## Testing

To test the error boundary:

1. **Simulate chunk failures** using browser dev tools:
   - Block specific chunk URLs in Network tab
   - Disable JavaScript temporarily
   - Simulate slow network conditions

2. **Test retry mechanism**:
   - Verify exponential backoff works
   - Check maximum retry limits
   - Ensure manual retry works

3. **Verify loading states**:
   - Check skeleton screens display correctly
   - Ensure loading states match final content
   - Test on slow connections

## Future Improvements

1. **Service Worker integration** for chunk caching strategies
2. **Preloading critical chunks** on route hover
3. **Analytics integration** for error tracking
4. **A/B testing** different chunk loading strategies
5. **Progressive Web App features** for offline support