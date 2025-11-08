import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for scroll-triggered animations
 * Elements will animate when they come into viewport
 * 
 * @param {Object} options - Intersection Observer options
 * @param {string} options.threshold - Percentage of element visibility to trigger (default: 0.1)
 * @param {string} options.rootMargin - Margin around root (default: '0px')
 * @param {boolean} options.triggerOnce - Whether animation should only happen once (default: true)
 * @returns {Object} - { ref, isVisible }
 */
export const useScrollAnimation = (options = {}) => {
    const {
        threshold = 0.1,
        rootMargin = '0px',
        triggerOnce = true
    } = options;

    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const hasTriggered = useRef(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Check if element is already in viewport on mount
        const checkInitialVisibility = () => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const isInViewport = rect.top < windowHeight && rect.bottom > 0;
            if (isInViewport && !hasTriggered.current) {
                setIsVisible(true);
                hasTriggered.current = true;
            }
        };
        
        // Check immediately
        checkInitialVisibility();

        const observer = new IntersectionObserver(
            ([entry]) => {
                // If element is intersecting (visible in viewport)
                if (entry.isIntersecting && !hasTriggered.current) {
                    setIsVisible(true);
                    hasTriggered.current = true;
                    // If triggerOnce is true, stop observing after first trigger
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce && !entry.isIntersecting) {
                    // If triggerOnce is false, allow re-triggering
                    setIsVisible(false);
                    hasTriggered.current = false;
                }
            },
            { threshold, rootMargin }
        );

        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
            if (element) {
                observer.observe(element);
            }
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isVisible };
};

export default useScrollAnimation;
