const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const ID = '';
const SECRET = '';
const BUCKET_NAME = '';

aws.config.update({
  secretAccessKey: SECRET,
  accessKeyId: ID,
  region: 'us-west-1',
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid mime type, only JPEG and PNG'), false);
  }
};

const upload = multer({
  fileFilter: fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

// Borrar is spanish for delete
/*const borrar = (file) => {
  s3.deleteObject({ Bucket: BUCKET_NAME, Key: file }, (err, data) => {
    console.error(err);
    console.log(data);
  });
};*/

module.exports = {
  upload,
  //borrar,
};
