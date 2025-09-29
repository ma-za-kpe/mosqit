'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  initializeAnalytics,
  trackPageView,
  trackClick,
  trackEvent,
  trackTimeOnPage,
  trackFormInteraction,
  trackExtensionEvent,
  trackDocumentation,
  trackFeatureUsage,
  trackSocial,
  trackSearch,
  trackPreference,
  EventCategories,
} from '@/lib/analytics';

export const useAnalytics = () => {
  const pathname = usePathname();
  const pageStartTime = useRef<number>(Date.now());
  const isInitialized = useRef(false);

  // Initialize analytics on mount
  useEffect(() => {
    if (!isInitialized.current) {
      initializeAnalytics();
      isInitialized.current = true;
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    trackPageView(pathname);
    pageStartTime.current = Date.now();

    // Track page-specific events
    switch (pathname) {
      case '/':
        trackEvent('home_page_view', EventCategories.NAVIGATION, 'home');
        break;
      case '/tutorial':
        trackEvent('tutorial_page_view', EventCategories.DOCUMENTATION, 'tutorial');
        break;
      case '/test/test-logger.html':
        trackEvent('test_page_view', EventCategories.FEATURE, 'test_logger');
        break;
    }

    return () => {
      // Track time on page when leaving
      const timeOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
      trackTimeOnPage(timeOnPage, pathname);
    };
  }, [pathname]);

  // Track button clicks
  const trackButtonClick = useCallback((buttonName: string, metadata?: Record<string, unknown>) => {
    trackClick(buttonName, 'button', buttonName, metadata);
  }, []);

  // Track link clicks
  const trackLinkClick = useCallback((linkName: string, href: string, isExternal?: boolean) => {
    trackClick(linkName, isExternal ? 'external_link' : 'internal_link', linkName, {
      link_href: href,
      link_external: isExternal,
    });
  }, []);

  // Track feature interactions
  const trackFeature = useCallback((feature: string, action: string, success?: boolean) => {
    trackFeatureUsage(feature, action, success);
  }, []);

  // Track documentation events
  const trackDocs = useCallback((action: string, section: string, details?: string) => {
    trackDocumentation(
      action as 'view' | 'search' | 'copy_code' | 'expand_section',
      section,
      details
    );
  }, []);

  // Track form events
  const trackForm = useCallback((formName: string, action: string, fieldName?: string) => {
    trackFormInteraction(
      formName,
      action as 'start' | 'complete' | 'abandon' | 'field_interaction',
      fieldName
    );
  }, []);

  // Track extension events
  const trackExtension = useCallback((action: string, feature?: string, success?: boolean) => {
    trackExtensionEvent(
      action as 'install_start' | 'install_complete' | 'install_error' | 'feature_use',
      feature,
      success
    );
  }, []);

  // Track social interactions
  const trackSocialClick = useCallback((network: string, action: string) => {
    trackSocial(
      network as 'github' | 'twitter' | 'linkedin' | 'discord',
      action as 'share' | 'follow' | 'star' | 'visit'
    );
  }, []);

  // Track search
  const trackSearchEvent = useCallback((query: string, resultsCount?: number) => {
    trackSearch(query, resultsCount);
  }, []);

  // Track user preferences
  const trackUserPreference = useCallback((preference: string, value: string | number | boolean) => {
    trackPreference(preference, value);
  }, []);

  return {
    trackButtonClick,
    trackLinkClick,
    trackFeature,
    trackDocs,
    trackForm,
    trackExtension,
    trackSocialClick,
    trackSearchEvent,
    trackUserPreference,
    trackEvent,
  };
};

// HOC for tracking component visibility
export const withAnalytics = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  const WrappedComponent = (props: P) => {
    useEffect(() => {
      trackEvent('component_view', EventCategories.ENGAGEMENT, componentName);
    }, []);

    return <Component {...props} />;
  };
  WrappedComponent.displayName = `withAnalytics(${componentName})`;
  return WrappedComponent;
};

// Custom hook for tracking element visibility
export const useTrackVisibility = (elementId: string, threshold = 0.5) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const hasBeenVisible = useRef(false);

  useEffect(() => {
    if (!elementRef.current) return;

    const currentElement = elementRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenVisible.current) {
            hasBeenVisible.current = true;
            trackEvent('element_visible', EventCategories.ENGAGEMENT, elementId, undefined, {
              element_id: elementId,
              visibility_threshold: threshold,
            });
          }
        });
      },
      { threshold }
    );

    observer.observe(currentElement);

    return () => {
      observer.unobserve(currentElement);
    };
  }, [elementId, threshold]);

  return elementRef;
};

// Hook for tracking hover events
export const useTrackHover = (elementId: string) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const hoverStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const handleMouseEnter = () => {
      hoverStartTime.current = Date.now();
    };

    const handleMouseLeave = () => {
      if (hoverStartTime.current) {
        const hoverDuration = Date.now() - hoverStartTime.current;
        trackEvent('element_hover', EventCategories.ENGAGEMENT, elementId, hoverDuration, {
          element_id: elementId,
          hover_duration_ms: hoverDuration,
        });
        hoverStartTime.current = null;
      }
    };

    const element = elementRef.current;
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [elementId]);

  return elementRef;
};

// Track form field interactions
export const useTrackFormField = (formName: string, fieldName: string) => {
  const handleFocus = useCallback(() => {
    trackFormInteraction(formName, 'field_interaction', fieldName);
  }, [formName, fieldName]);

  const handleBlur = useCallback((value: string) => {
    trackEvent('form_field_complete', EventCategories.CONVERSION, fieldName, undefined, {
      form_name: formName,
      field_name: fieldName,
      field_filled: value.length > 0,
    });
  }, [formName, fieldName]);

  return { handleFocus, handleBlur };
};