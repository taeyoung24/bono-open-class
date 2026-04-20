'use client';

import Loader from 'app/components/loaders/pencil';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface TransitionContextType {
  transitionTo: (href: string) => void;
  transitionBack: () => void;
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
  const [isAnimating, setIsAnimating] = useState(false);

  // 전역 스타일로 스크롤바 점유 공간을 고정하고 가로 스크롤을 원천 차단
  useEffect(() => {
    document.documentElement.style.scrollbarGutter = 'stable';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
  }, []);

  // 애니메이션 상태에 따른 스크롤 제어
  useEffect(() => {
    if (isPending || isAnimating) {
      document.body.style.overflowY = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflowY = 'auto';
      document.body.style.height = 'auto';
    }
  }, [isPending, isAnimating]);

  useEffect(() => {
    setIsPending(false);
    // 경로 도달 시에도 안전장치로 애니메이션 상태 해제 (100ms 뒤)
    const timer = setTimeout(() => setIsAnimating(false), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

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
      // Next.js router.back()은 비동기이므로 펜딩 상태를 수동으로 풀어줄 필요가 있을 수 있으나
      // 여기서는 pathname 변경 시 useEffect에서 처리됨
    }, 500);
  };

  return (
    <TransitionContext.Provider value={{ transitionTo, transitionBack, isPending }}>
      {/* 
          Container는 뷰포트에 고정되어 있으며, 
          내부에서 애니메이션이 일어나는 동안 스크롤을 절대 생성하지 않음 
      */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden'
      }}>
        <AnimatePresence mode="wait" onExitComplete={() => setIsAnimating(true)}>
          {!isPending ? (
            <motion.div
              key={pathname}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
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
          ) : (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
