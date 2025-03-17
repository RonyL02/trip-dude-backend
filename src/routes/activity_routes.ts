import { Router } from 'express';
import ActivityController from '../controllers/activity_controller';
import { authenticationMiddleware } from '../middlewares/authentication_middleware';

const ActivityRouter = Router();

ActivityRouter.use(authenticationMiddleware);

/**
 * @swagger
 * /activities/location:
 *   get:
 *     summary: Get place names by query
 *     tags:
 *       - Activities
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the place
 *     responses:
 *       200:
 *         description: A list of matching place names
 */
ActivityRouter.get(
  '/location',
  ActivityController.getPlaceNames.bind(ActivityController)
);

/**
 * @swagger
 * /activities:
 *   get:
 *     summary: Get matching activities based on location and description
 *     tags:
 *       - Activities
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         required: true
 *         description: The location of the activity
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         required: true
 *         description: A description of the desired activity
 *     responses:
 *       200:
 *         description: A list of matching activities
 */
ActivityRouter.get(
  '/',
  ActivityController.getMatchingActivities.bind(ActivityController)
);

/**
 * @swagger
 * /activities/saved:
 *   get:
 *     summary: Get all activities saved by a user
 *     tags:
 *       - Activities
 *     responses:
 *       200:
 *         description: List of saved activities
 */
ActivityRouter.get('/saved', ActivityController.find.bind(ActivityController));

/**
 * @swagger
 * /activities/{id}:
 *   get:
 *     summary: Get activity by ID
 *     tags:
 *       - Activities
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the activity
 *     responses:
 *       200:
 *         description: Activity details
 */
ActivityRouter.get(
  '/:id',
  ActivityController.findById.bind(ActivityController)
);

/**
 * @swagger
 * /activities:
 *   post:
 *     summary: Create a new activity
 *     tags:
 *       - Activities
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               description:
 *                 type: string
 *               geoCode:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *               rating:
 *                 type: string
 *               price:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: string
 *                   currencyCode:
 *                     type: string
 *               pictures:
 *                 type: array
 *                 items:
 *                   type: string
 *               bookingLink:
 *                 type: string
 *               minimumDuration:
 *                 type: string
 *     responses:
 *       201:
 *         description: Activity created successfully
 */
ActivityRouter.post('/', ActivityController.create.bind(ActivityController));

/**
 * @swagger
 * /activities/{id}:
 *   delete:
 *     summary: Delete a Activity by ID
 *     description: Delete a single Activity by its ID
 *     tags:
 *       - Activities
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
 *         description: The ID of the Activity
 *     responses:
 *       200:
 *         description: Activity deleted successfully
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
ActivityRouter.delete(
  '/:id',
  ActivityController.delete.bind(ActivityController)
);

export default ActivityRouter;
