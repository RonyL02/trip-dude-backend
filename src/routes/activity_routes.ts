import { Router } from 'express';
import {
  getMatchingActivities,
  getPlaceNames
} from '../controllers/activity_controller';

const ActivityRouter = Router();

ActivityRouter.get('/', getMatchingActivities);
ActivityRouter.get('/location', getPlaceNames);

export default ActivityRouter;
