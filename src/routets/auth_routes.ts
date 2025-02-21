import { Router } from 'express';
import AuthController from '../controllers/auth_controller';

const AuthRouter = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid credentials
 *       409:
 *         description: User already exists
 */
AuthRouter.post('/register', AuthController.register.bind(AuthController));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful, returns tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/AuthResponse'
 *       400:
 *         description: Invalid credentials or password mismatch
 *       500:
 *         description: Internal server error
 */
AuthRouter.post('/login', AuthController.login.bind(AuthController));

/**
 * @swagger
 * /auth/refreshToken:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns new access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/AuthResponse'
 *       400:
 *         description: Missing refresh token
 *       403:
 *         description: Invalid token
 */
AuthRouter.post(
  '/refreshToken',
  AuthController.refreshToken.bind(AuthController)
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and invalidate refresh token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       400:
 *         description: Missing refresh token
 *       403:
 *         description: Invalid token
 */
AuthRouter.post('/logout', AuthController.logout.bind(AuthController));

export default AuthRouter;
