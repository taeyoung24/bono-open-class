export async function register() {
  // 서버 런타임(Node.js) 환경에서만 한 번 실행
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logger } = await import('src/utils/log');
    const { NODE_ENV } = await import('src/settings');
    
    await logger.ai(`Application started in ${NODE_ENV} mode`);
  }
}
