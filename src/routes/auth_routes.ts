import { Router } from 'express';
import AuthController from '../controllers/auth_controller';

const AuthRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *       example:
 *         username: johnny
 *         email: john@tk.com
 *         password: 324vt23r4tr234t245tbv45by
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: username
 *               email:
 *                 type: string
 *                 description: user email
 *               password:
 *                 type: string
 *                 description: user password
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newId:
 *                   type: string
 *                   example: 45egdgd4546456gffhgf56r...
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
AuthRouter.post('/register', AuthController.register.bind(AuthController));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return tokens
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: user email
 *               password:
 *                 type: string
 *                 description: user password
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 userId:
 *                   type: string
 *                   example: 60d0fe4f5311236168a109ca
 *       400:
 *         description: Invalid credentials or request
 *       500:
 *         description: Server error
 */
AuthRouter.post('/login', AuthController.login.bind(AuthController));

/**
 * @swagger
 * /auth/google-login:
 *   post:
 *     summary: Login with Google OAuth
 *     tags: [Authentication]
 *     parameters:
 *       - in: header
 *         name: credential
 *         schema:
 *           type: string
 *         required: true
 *         description: Google OAuth credential token
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 userId:
 *                   type: string
 *                   example: 60d0fe4f5311236168a109ca
 *       400:
 *         description: Invalid credentials or request
 *       500:
 *         description: Server error
 */
AuthRouter.post(
  '/google-login',
  AuthController.loginWithGoogle.bind(AuthController)
);

/**
 * @swagger
 * /auth/refreshToken:
 *   post:
 *     summary: Refresh tokens
 *     description: Refresh access and refresh tokens using the provided refresh token
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: The user refresh token
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */
AuthRouter.post(
  '/refreshToken',
  AuthController.refreshToken.bind(AuthController)
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user and invalidate the refresh token
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: The user refresh token
 *     responses:
 *       200:
 *         description: Successful logout
 *       400:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */
AuthRouter.post('/logout', AuthController.logout.bind(AuthController));

export default AuthRouter;
