// Comprehensive Analytics Tracking for Mosqit
// Tracks 90% of user interactions across the website

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Analytics Event Types
export const EventCategories = {
  NAVIGATION: 'navigation',
  ENGAGEMENT: 'engagement',
  CONVERSION: 'conversion',
  FEATURE: 'feature',
  ERROR: 'error',
  PERFORMANCE: 'performance',
  EXTENSION: 'extension',
  DOCUMENTATION: 'documentation',
  SOCIAL: 'social',
} as const;

// Track page views with custom dimensions
export const trackPageView = (page: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: page,
      page_title: title || document.title,
      page_location: window.location.href,
      page_referrer: document.referrer,
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
    });
  }
};

// Track user interactions
export const trackEvent = (
  action: string,
  category: keyof typeof EventCategories | string,
  label?: string,
  value?: number,
  customDimensions?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...customDimensions,
      timestamp: new Date().toISOString(),
    });
  }
};

// Track clicks on any element
export const trackClick = (
  elementId: string,
  elementType: string,
  label?: string,
  customData?: Record<string, unknown>
) => {
  trackEvent('click', EventCategories.ENGAGEMENT, label || elementId, undefined, {
    element_id: elementId,
    element_type: elementType,
    click_text: label,
    page_section: customData?.section,
    ...customData,
  });
};

// Track scroll depth
export const trackScrollDepth = (percentage: number) => {
  trackEvent('scroll', EventCategories.ENGAGEMENT, `${percentage}%`, percentage, {
    scroll_depth: percentage,
    page_height: document.documentElement.scrollHeight,
    viewport_height: window.innerHeight,
  });
};

// Track time on page
export const trackTimeOnPage = (seconds: number, page: string) => {
  trackEvent('time_on_page', EventCategories.ENGAGEMENT, page, seconds, {
    duration_seconds: seconds,
    duration_formatted: formatDuration(seconds),
  });
};

// Track form interactions
export const trackFormInteraction = (
  formName: string,
  action: 'start' | 'complete' | 'abandon' | 'field_interaction',
  fieldName?: string
) => {
  trackEvent(`form_${action}`, EventCategories.CONVERSION, formName, undefined, {
    form_name: formName,
    field_name: fieldName,
    form_fields_completed: action === 'complete' ? 'all' : 'partial',
  });
};

// Track extension-related events
export const trackExtensionEvent = (
  action: 'install_start' | 'install_complete' | 'install_error' | 'feature_use',
  feature?: string,
  success?: boolean
) => {
  trackEvent(action, EventCategories.EXTENSION, feature, success ? 1 : 0, {
    extension_feature: feature,
    success: success,
    browser: getBrowserInfo(),
  });
};

// Track documentation interactions
export const trackDocumentation = (
  action: 'view' | 'search' | 'copy_code' | 'expand_section',
  section: string,
  details?: string
) => {
  trackEvent(`docs_${action}`, EventCategories.DOCUMENTATION, section, undefined, {
    doc_section: section,
    doc_details: details,
  });
};

// Track feature usage
export const trackFeatureUsage = (
  feature: string,
  action: string,
  success?: boolean,
  metadata?: Record<string, unknown>
) => {
  trackEvent(`feature_${action}`, EventCategories.FEATURE, feature, success ? 1 : 0, {
    feature_name: feature,
    feature_success: success,
    ...metadata,
  });
};

// Track social interactions
export const trackSocial = (
  network: 'github' | 'twitter' | 'linkedin' | 'discord',
  action: 'share' | 'follow' | 'star' | 'visit'
) => {
  trackEvent(`social_${action}`, EventCategories.SOCIAL, network, undefined, {
    social_network: network,
    social_action: action,
  });
};

// Track errors
export const trackError = (
  errorMessage: string,
  errorType: 'javascript' | 'network' | 'permission' | 'browser_compatibility',
  fatal: boolean = false
) => {
  trackEvent('error', EventCategories.ERROR, errorType, fatal ? 1 : 0, {
    error_message: errorMessage,
    error_type: errorType,
    error_fatal: fatal,
    error_url: window.location.href,
    error_user_agent: navigator.userAgent,
  });
};

// Track performance metrics
export const trackPerformance = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
    const firstPaintTime = perfData.responseEnd - perfData.navigationStart;

    trackEvent('performance', EventCategories.PERFORMANCE, 'page_load', pageLoadTime, {
      page_load_time: pageLoadTime,
      dom_ready_time: domReadyTime,
      first_paint_time: firstPaintTime,
      dns_time: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcp_time: perfData.connectEnd - perfData.connectStart,
      request_time: perfData.responseEnd - perfData.requestStart,
    });
  }
};

// Track video interactions
export const trackVideo = (
  videoId: string,
  action: 'play' | 'pause' | 'complete' | 'progress',
  progress?: number
) => {
  trackEvent(`video_${action}`, EventCategories.ENGAGEMENT, videoId, progress, {
    video_id: videoId,
    video_progress: progress,
    video_duration: document.querySelector<HTMLVideoElement>(`#${videoId}`)?.duration,
  });
};

// Track downloads
export const trackDownload = (fileName: string, fileType: string, fileSize?: number) => {
  trackEvent('download', EventCategories.CONVERSION, fileName, fileSize, {
    file_name: fileName,
    file_type: fileType,
    file_size_kb: fileSize ? Math.round(fileSize / 1024) : undefined,
  });
};

// Track search
export const trackSearch = (query: string, resultsCount?: number, searchType?: string) => {
  trackEvent('search', EventCategories.ENGAGEMENT, searchType || 'site_search', resultsCount, {
    search_query: query,
    search_results: resultsCount,
    search_type: searchType,
  });
};

// Track user preferences
export const trackPreference = (
  preference: string,
  value: string | boolean | number,
  category?: string
) => {
  trackEvent('preference_change', EventCategories.ENGAGEMENT, preference, undefined, {
    preference_name: preference,
    preference_value: value,
    preference_category: category,
  });
};

// Track A/B testing
export const trackExperiment = (
  experimentName: string,
  variant: string,
  action?: string
) => {
  trackEvent('experiment', EventCategories.ENGAGEMENT, experimentName, undefined, {
    experiment_name: experimentName,
    experiment_variant: variant,
    experiment_action: action,
  });
};

// Utility functions
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const getBrowserInfo = (): string => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  return 'Other';
};

// Auto-track common events on initialization
export const initializeAnalytics = () => {
  if (typeof window === 'undefined') return;

  // Track page load performance
  window.addEventListener('load', () => {
    setTimeout(trackPerformance, 0);
  });

  // Track scroll depth
  let maxScroll = 0;
  const scrollDepths = [25, 50, 75, 90, 100];
  const trackedDepths = new Set<number>();

  window.addEventListener('scroll', () => {
    const scrollPercentage = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    if (scrollPercentage > maxScroll) {
      maxScroll = scrollPercentage;
      scrollDepths.forEach(depth => {
        if (scrollPercentage >= depth && !trackedDepths.has(depth)) {
          trackedDepths.add(depth);
          trackScrollDepth(depth);
        }
      });
    }
  });

  // Track time on page
  const startTime = Date.now();
  let timeTracked = false;

  const trackTime = () => {
    if (!timeTracked) {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      trackTimeOnPage(timeOnPage, window.location.pathname);
      timeTracked = true;
    }
  };

  window.addEventListener('beforeunload', trackTime);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) trackTime();
  });

  // Track external link clicks
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');

    if (link?.href && !link.href.startsWith(window.location.origin)) {
      trackEvent('external_link', EventCategories.NAVIGATION, link.href, undefined, {
        link_text: link.textContent,
        link_target: link.target,
      });
    }
  });

  // Track print events
  window.addEventListener('beforeprint', () => {
    trackEvent('print', EventCategories.ENGAGEMENT, window.location.pathname);
  });

  // Track copy events
  document.addEventListener('copy', () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      trackEvent('copy_text', EventCategories.ENGAGEMENT, 'content', selection.length, {
        copied_length: selection.length,
        copied_preview: selection.substring(0, 50),
      });
    }
  });

  // Track errors
  window.addEventListener('error', (e) => {
    trackError(e.message, 'javascript', false);
  });

  window.addEventListener('unhandledrejection', (e) => {
    trackError(e.reason?.message || e.reason, 'javascript', false);
  });
};

// Export for extension use
export const extensionAnalytics = {
  trackPanelOpen: () => trackExtensionEvent('feature_use', 'panel_open', true),
  trackBugCapture: () => trackExtensionEvent('feature_use', 'bug_capture', true),
  trackGitHubSubmit: (success: boolean) => trackExtensionEvent('feature_use', 'github_submit', success),
  trackAIAnalysis: () => trackExtensionEvent('feature_use', 'ai_analysis', true),
  trackCopyIssue: () => trackExtensionEvent('feature_use', 'copy_issue', true),
  trackLogCapture: (count: number) => trackFeatureUsage('log_capture', 'capture', true, { log_count: count }),
  trackPatternDetection: (patternType: string) => trackFeatureUsage('pattern_detection', 'detect', true, { pattern: patternType }),
  trackErrorAnalysis: (errorType: string) => trackFeatureUsage('error_analysis', 'analyze', true, { error_type: errorType }),
};