export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: Function,
) => {
  console.log({ file });
  if (!file) return cb(new Error('No file provided'), false);

  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['jpeg', 'jpg', 'png', 'gif'];
  if (validExtensions.includes(fileExtension)) {
    return cb(null, true);
  }

  cb(null, true);
};
