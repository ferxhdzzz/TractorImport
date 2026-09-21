import { Router } from 'express';
import { validateAuthToken } from '../middlewares/validateAuthToken.js';
import profileController from '../controllers/profileController.js';

const router = Router();

// Middleware de autenticación para todas las rutas de perfil
router.use(validateAuthToken(['admin', 'customer']));

/**
 * @swagger
 * /api/profile/change-password:
 *   post:
 *     summary: Cambiar la contraseña del usuario autenticado
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual del usuario
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña (mínimo 6 caracteres)
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       400:
 *         description: Error en la solicitud (datos faltantes, contraseña inválida, etc.)
 *       401:
 *         description: No autorizado (token inválido o expirado)
 *       500:
 *         description: Error del servidor
 */
router.post('/change-password', profileController.changePassword);

export default router;
