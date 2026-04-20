'use client';

import Loader from 'app/components/loaders/pencil';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface TransitionContextType {
  transitionTo: (href: string) => void;
  transitionBack: () => void;
  setPageReady: (ready: boolean) => void;
  isPending: boolean;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export const useTransitionNav = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransitionNav must be used within a TransitionProvider');
  }
  return context;
};

export const TransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);
  const [isPageReady, setIsPageReady] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // 전역 스타일로 스크롤바 점유 공간을 고정하고 가로 스크롤을 원천 차단
  useEffect(() => {
    document.documentElement.style.scrollbarGutter = 'stable';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);

  // 경로가 변경될 때 자식 페이지가 마운트되기 직전에 준비 상태를 리셋
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsPageReady(true);
  }

  // 애니메이션 상태에 따른 스크롤 제어
  const shouldWait = isPending || !isPageReady;

  useEffect(() => {
    if (shouldWait || isAnimating) {
      document.body.style.overflowY = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflowY = 'auto';
      document.body.style.height = 'auto';
    }
  }, [shouldWait, isAnimating]);

  useEffect(() => {
    // 실제 경로가 변경되었을 때 펜딩 해제
    setIsPending(false);
  }, [pathname]);

  useEffect(() => {
    // 경로 도달 + 페이지 준비 완료 두 조건이 모두 충족되었을 때만 로더 닫기
    if (!shouldWait) {
      const timer = setTimeout(() => setIsAnimating(false), 100);
      return () => clearTimeout(timer);
    }
  }, [shouldWait]);


  const transitionTo = (href: string) => {
    if (href === pathname) return;
    setIsPending(true);
    setIsAnimating(true);

    setTimeout(() => {
      router.push(href);
    }, 500);
  };

  const transitionBack = () => {
    setIsPending(true);
    setIsAnimating(true);

    setTimeout(() => {
      router.back();
    }, 500);
  };

  const setPageReady = useCallback((ready: boolean) => {
    setIsPageReady(ready);
  }, []);

  return (
    <TransitionContext.Provider value={{ transitionTo, transitionBack, setPageReady, isPending: shouldWait }}>
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden'
      }}>
        <AnimatePresence mode="wait" onExitComplete={() => setIsAnimating(true)}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: shouldWait ? 0 : 1, scale: shouldWait ? 1.05 : 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onAnimationStart={() => setIsAnimating(true)}
            onAnimationComplete={() => setIsAnimating(false)}
            style={{
              width: '100%',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {shouldWait && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-center min-h-screen"
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 999,
                background: 'var(--bg-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Loader />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TransitionContext.Provider>
  );
};
