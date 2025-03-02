import express from "express";
import { UserController } from "../controllers/user_controller";
import { authenticationMiddleware } from "../middlewares/authentication_middleware";
import { RequestWithUser } from "../types"; 

const userController = new UserController();
const UserRouter = express.Router();

UserRouter.use(authenticationMiddleware);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details (without password)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
UserRouter.get("/:id", userController.findById.bind(userController));

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get the logged-in user's profile
 *     tags:
 *       - Users
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: The user token
 *     responses:
 *       200:
 *         description: The logged-in user's profile
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
UserRouter.get("/profile", (req: RequestWithUser, res: express.Response) => {
    req.params.id = req.user!._id; 
    userController.findById(req, res);
});

/**
 * @swagger
 * /users:
 *   patch:
 *     summary: Update user profile
 *     tags:
 *       - Users
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: The user token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Updated username
 *               image:
 *                 type: string
 *                 description: Updated profile image URL
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
UserRouter.patch("/", userController.update.bind(userController));

export default UserRouter;
