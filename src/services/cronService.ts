import cron from 'node-cron';
import { prisma } from 'src/lib/prisma';
import { Logger } from 'src/utils/log';

const logger = new Logger('cron-service');

export function initCronJobs() {
  // 매일 자정 (00:00)에 실행
  cron.schedule('0 0 * * *', async () => {
    logger.i('Starting midnight cleanup: Expired Verification Codes');
    
    try {
      const result = await prisma.verificationCode.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });
      
      if (result.count > 0) {
        logger.i(`Cleanup complete. Deleted ${result.count} expired records.`);
      } else {
        logger.i('Cleanup complete. No expired records found.');
      }
    } catch (error) {
      logger.e(`Error during verification code cleanup: ${error}`);
    }
  });

  logger.i('Cron jobs initialized.');
}
