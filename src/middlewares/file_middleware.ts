import multer from 'multer';

const storage = multer.diskStorage({
  destination: (_request, _file, cb) => {
    cb(null, 'storage/');
  },
  filename: (_request, file, cb) => {
    const extension = file.originalname
      .split('.')
      .filter(Boolean)
      .slice(1)
      .join('.');
    cb(null, `${Date.now()}.${extension}`);
  }
});

export const fileMiddleware = multer({ storage });
