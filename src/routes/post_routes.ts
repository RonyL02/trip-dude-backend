import express from 'express';
import { PostController } from '../controllers/post_controller';
import { authenticationMiddleware } from '../middlewares/authentication_middleware';

const postController = new PostController();
const PostRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - userId
 *         - imageUrl
 *         - description
 *         - likes
 *         - activityId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the post
 *         userId:
 *           type: string
 *           description: The ID of the user who created the post
 *         imageUrl:
 *           type: string
 *           description: URL of the image
 *         description:
 *           type: string
 *           description: Description of the post
 *         likes:
 *           type: number
 *           description: Number of likes the post received
 *         activityId:
 *           type: string
 *           description: Related activity ID
 *       example:
 *         _id: 234ab456bc78
 *         userId: user12345
 *         imageUrl: https://example.com/image.jpg
 *         description: "Beautiful view of the ocean"
 *         likes: 125
 *         activityId: activity9876
 */

PostRouter.use(authenticationMiddleware);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: The user token
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */
PostRouter.get('/', postController.find.bind(postController));

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: The user token
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       200:
 *         description: A single post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
PostRouter.get('/:id', postController.findById.bind(postController));

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
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
 *               userId:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               description:
 *                 type: string
 *               likes:
 *                 type: number
 *               activityId:
 *                 type: string
 *             required:
 *               - userId
 *               - imageUrl
 *               - description
 *               - likes
 *               - activityId
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
PostRouter.post('/', postController.create.bind(postController));

export { PostRouter };
