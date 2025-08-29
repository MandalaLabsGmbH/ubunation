'use client';

import { useState, useEffect } from 'react';

// An object containing Tailwind's default breakpoints for reference.
const breakpoints = {
 sm: 640,
  md: 768,
  lg: 1024,
};

/**
 * A custom hook to check if the screen size matches a media query.
 * This is particularly useful for conditionally rendering components based on screen size (e.g., mobile vs. desktop).
 *
 * @param query The Tailwind breakpoint key (e.g., 'md'). The hook will check if the screen is SMALLER than this breakpoint.
 * @returns {boolean} - True if the screen width is less than the specified breakpoint width.
 */
export const useMediaQuery = (query: keyof typeof breakpoints) => {
  // We initialize the state to false, assuming a desktop-first approach.
  // It will be correctly updated on the client-side.
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // This check ensures the code only runs on the client, where `window` is available.
    if (typeof window !== 'undefined') {
      // Create a media query object that listens for screen size changes. The fix: Added index signature to breakpoints.
      const mediaQuery = window.matchMedia(`(max-width: ${breakpoints[query as keyof typeof breakpoints] - 1}px)`);

      // A function to update our state based on whether the media query matches.
      const updateMatches = () => {
        setMatches(mediaQuery.matches);
      };

      // Set the initial state when the component mounts.
      updateMatches();

      // We add an event listener to update the state whenever the screen size changes.
      mediaQuery.addEventListener('change', updateMatches);

      // This is a cleanup function that removes the event listener when the component unmounts
      // to prevent memory leaks.
      return () => {
        mediaQuery.removeEventListener('change', updateMatches);
      };
    }
  }, [query]);

  return matches;
};