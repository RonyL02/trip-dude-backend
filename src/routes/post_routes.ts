import express from 'express';
import { PostController } from '../controllers/post_controller';
import { authenticationMiddleware } from '../middlewares/authentication_middleware';

const postController = new PostController();
const PostRouter = express.Router();

PostRouter.use(authenticationMiddleware);

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
 *               image:
 *                 type: string
 *                 description: Image URL of the post
 *               description:
 *                 type: string
 *                 description: Description of the post
 *             required:
 *               - image
 *               - description
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
PostRouter.post('/', postController.create.bind(postController));

/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: Like a post
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
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post liked successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
PostRouter.post('/:id/like', postController.like.bind(postController));

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get posts with optional filters
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: The user token
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter posts by user ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: The page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         required: false
 *         description: The number of posts per page
 *     responses:
 *       200:
 *         description: A list of posts
 *       500:
 *         description: Server error
 */
PostRouter.get('/', postController.find.bind(postController));

/**
 * @swagger
 * /posts/{id}:
 *   patch:
 *     summary: Update a post
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
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 description: Updated image URL
 *               description:
 *                 type: string
 *                 description: Updated description
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
PostRouter.patch('/:id', postController.updatePost.bind(postController));

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
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
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
PostRouter.delete('/:id', postController.delete.bind(postController));

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
 *         description: The post ID
 *     responses:
 *       200:
 *         description: A post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
PostRouter.get('/:id', postController.findById.bind(postController));

export default PostRouter;
