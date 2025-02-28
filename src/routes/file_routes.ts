import { Router } from 'express';
import { fileMiddleware } from '../middlewares/file_middleware';
import { upload } from '../controllers/file_controller';

const FileRouter = Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     tags:
 *     - Files
 *     summary: Upload a file
 *     description: Upload a file to the server
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: The file to upload
 *         required: true
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Bad request (invalid file)
 */
FileRouter.post('/', fileMiddleware.single('file'), upload);

export default FileRouter;
