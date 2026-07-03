import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NavigationContext = createContext();

export const useNavigation = () => useContext(NavigationContext);

const HISTORY_KEY = "planora_nav_history";
const TAB_STACKS_KEY = "planora_tab_stacks";
const SCROLL_POSITIONS_KEY = "planora_scroll_positions";

// Main tab paths that preserve their own navigation stacks
const TAB_ROOTS = ["/dashboard", "/education-hub", "/terminal", "/financial-reports"];

export function MobileStackManager({ children }) {
  const [globalHistory, setGlobalHistory] = useState(() => {
    const stored = sessionStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : ["/dashboard"];
  });

  const [tabStacks, setTabStacks] = useState(() => {
    const stored = sessionStorage.getItem(TAB_STACKS_KEY);
    return stored ? JSON.parse(stored) : {
      "/dashboard": ["/dashboard"],
      "/education-hub": ["/education-hub"],
      "/terminal": ["/terminal"],
      "/financial-reports": ["/financial-reports"]
    };
  });

  const [scrollPositions, setScrollPositions] = useState(() => {
    const stored = sessionStorage.getItem(SCROLL_POSITIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  const [direction, setDirection] = useState("forward");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use refs to avoid stale closures
  const globalHistoryRef = useRef(globalHistory);
  const tabStacksRef = useRef(tabStacks);
  const scrollPositionsRef = useRef(scrollPositions);
  const isNavigatingRef = useRef(false);
  const pendingScrollRestoreRef = useRef(null);

  useEffect(() => {
    globalHistoryRef.current = globalHistory;
  }, [globalHistory]);

  useEffect(() => {
    tabStacksRef.current = tabStacks;
  }, [tabStacks]);

  useEffect(() => {
    scrollPositionsRef.current = scrollPositions;
  }, [scrollPositions]);

  // Determine which tab root the current path belongs to
  const getCurrentTabRoot = useCallback((path) => {
    return TAB_ROOTS.find(root => path === root || path.startsWith(root + "/")) || null;
  }, []);

  // Save scroll position before navigation
  const saveScrollPosition = useCallback((path) => {
    const scrollY = window.scrollY;
    setScrollPositions(prev => {
      const updated = { ...prev, [path]: scrollY };
      scrollPositionsRef.current = updated;
      sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Restore scroll position after navigation
  const restoreScrollPosition = useCallback((path) => {
    const savedPosition = scrollPositionsRef.current[path] || 0;
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      window.scrollTo(0, savedPosition);
    });
  }, []);

  // Track location changes
  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = globalHistoryRef.current[globalHistoryRef.current.length - 1];

    // Skip if path hasn't changed
    if (currentPath === prevPath && !isNavigatingRef.current) return;

    // Save scroll position of previous page
    if (prevPath && prevPath !== currentPath) {
      saveScrollPosition(prevPath);
    }

    const currentHistory = globalHistoryRef.current;
    const pathIndexInHistory = currentHistory.indexOf(currentPath);
    const isBackNavigation = pathIndexInHistory !== -1 && pathIndexInHistory < currentHistory.length - 1;

    if (isBackNavigation) {
      // Back navigation - trim history
      setDirection("back");
      
      const newHistory = currentHistory.slice(0, pathIndexInHistory + 1);
      setGlobalHistory(newHistory);
      globalHistoryRef.current = newHistory;
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));

      // Update tab stack if within a tab
      const tabRoot = getCurrentTabRoot(currentPath);
      if (tabRoot) {
        setTabStacks(prev => {
          const stack = prev[tabRoot] || [tabRoot];
          const stackIndex = stack.indexOf(currentPath);
          const newStack = stackIndex !== -1 ? stack.slice(0, stackIndex + 1) : stack;
          const updated = { ...prev, [tabRoot]: newStack };
          tabStacksRef.current = updated;
          sessionStorage.setItem(TAB_STACKS_KEY, JSON.stringify(updated));
          return updated;
        });
      }

      // Restore scroll position
      restoreScrollPosition(currentPath);
    } else {
      // Forward navigation
      setDirection("forward");
      
      const newHistory = [...currentHistory, currentPath];
      setGlobalHistory(newHistory);
      globalHistoryRef.current = newHistory;
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));

      // Update tab stack if within a tab
      const tabRoot = getCurrentTabRoot(currentPath);
      if (tabRoot) {
        setTabStacks(prev => {
          const stack = prev[tabRoot] || [tabRoot];
          const isAlreadyInStack = stack.includes(currentPath);
          
          if (!isAlreadyInStack) {
            const newStack = [...stack, currentPath];
            const updated = { ...prev, [tabRoot]: newStack };
            tabStacksRef.current = updated;
            sessionStorage.setItem(TAB_STACKS_KEY, JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      }

      // Scroll to top for forward navigation
      window.scrollTo(0, 0);
    }

    isNavigatingRef.current = false;
  }, [location.pathname, getCurrentTabRoot, saveScrollPosition, restoreScrollPosition]);

  const goBack = useCallback(() => {
    const currentPath = location.pathname;
    const currentRoot = getCurrentTabRoot(currentPath);
    const currentStacks = tabStacksRef.current;

    isNavigatingRef.current = true;

    if (currentRoot && currentStacks[currentRoot]?.length > 1) {
      const stack = [...currentStacks[currentRoot]];
      const currentIndex = stack.indexOf(currentPath);
      
      if (currentIndex > 0) {
        const previousPath = stack[currentIndex - 1];
        navigate(previousPath);
      } else {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  }, [location.pathname, getCurrentTabRoot, navigate]);

  const navigateTo = useCallback((path) => {
    isNavigatingRef.current = true;
    navigate(path);
  }, [navigate]);

  const canGoBack = globalHistory.length > 1;

  return (
    <NavigationContext.Provider value={{ 
      goBack, 
      navigate: navigateTo, 
      canGoBack, 
      history: globalHistory, 
      tabStacks,
      direction,
      scrollPositions
    }}>
      {children}
    </NavigationContext.Provider>
  );
}