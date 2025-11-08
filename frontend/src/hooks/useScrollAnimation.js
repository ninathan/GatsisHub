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

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // If element is intersecting (visible in viewport)
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // If triggerOnce is true, stop observing after first trigger
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    // If triggerOnce is false, allow re-triggering
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        // Check if element is already in viewport on mount
        // This fixes blank sections that load in viewport
        const checkInitialVisibility = () => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const isInViewport = rect.top < windowHeight && rect.bottom > 0;
            if (isInViewport) {
                setIsVisible(true);
            }
        };
        
        // Use setTimeout to ensure DOM is ready
        setTimeout(checkInitialVisibility, 0);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isVisible };
};

export default useScrollAnimation;
