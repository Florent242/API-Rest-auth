import cron from 'node-cron';
import { BlacklistService } from '#services/blacklist.service';
import { logger } from '#lib/logger';

/**
 * Job de nettoyage automatique
 * S'exécute tous les jours à 3h du matin
 */
export function startCleanupJobs() {
    // Nettoyage quotidien à 3h00
    cron.schedule('0 3 * * *', async () => {
        try {
            logger.info('Starting cleanup job...');
            
            const result = await runCleanup();
            
            logger.info('Cleanup job completed successfully', result);
        } catch (error) {
            logger.error({ error }, 'Cleanup job failed');
        }
    });
    
    logger.info('Cleanup jobs scheduled');
}

/**
 * Exécuter le nettoyage manuellement
 */
export async function runCleanupManually() {
    logger.info('Running manual cleanup...');
    return await runCleanup();
}

/**
 * Logique de nettoyage (utilisée par cron et manuel)
 */
async function runCleanup() {
    // Nettoyer les tokens blacklistés expirés
    const expiredTokens = await BlacklistService.cleanupExpiredTokens();
    logger.info(`Cleaned up ${expiredTokens} expired blacklisted tokens`);
    
    // Nettoyer l'historique de connexion ancien (> 90 jours)
    const oldHistory = await BlacklistService.cleanupOldLoginHistory();
    logger.info(`Cleaned up ${oldHistory} old login history entries`);
    
    return {
        expiredTokens,
        oldHistory
    };
}

/**
 * Arrêter tous les jobs (pour les tests)
 */
export function stopCleanupJobs() {
    cron.getTasks().forEach(task => task.stop());
}
