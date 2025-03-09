import { Router } from 'express';
import ActivityController from '../controllers/activity_controller';
import { authenticationMiddleware } from '../middlewares/authentication_middleware';

const ActivityRouter = Router();

ActivityRouter.use(authenticationMiddleware);

ActivityRouter.get(
  '/',
  ActivityController.getMatchingActivities.bind(ActivityController)
);
ActivityRouter.get(
  '/location',
  ActivityController.getPlaceNames.bind(ActivityController)
);
ActivityRouter.post('/', ActivityController.create.bind(ActivityController));
ActivityRouter.get('/saved', ActivityController.find.bind(ActivityController));

export default ActivityRouter;
