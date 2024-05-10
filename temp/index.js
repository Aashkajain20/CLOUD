const AWS = require('aws-sdk');
const zlib = require('zlib');

exports.handler = async (event) => {
  try {
    const s3 = new AWS.S3();
    const { Records } = event; // Assuming S3 event trigger

    for (const record of Records) {
      const { s3: { bucket: { name }, object: { key } } } = record;

      // Download the original image
      const originalBuffer = await s3.getObject({ Bucket: name, Key: key }).promise();

      // Compress the image using zlib (limited compression)
      const compressedBuffer = zlib.gzipSync(originalBuffer.Body);

      // Upload the compressed image with a new key (e.g., adding "_compressed")
      const compressedKey = key.replace(/\.(jpg|jpeg|png)$/, '_compressed.$1');
      await s3.putObject({ Bucket: name, Key: compressedKey, Body: compressedBuffer }).promise();

      // Optional: Delete the original image if desired
      // await s3.deleteObject({ Bucket: name, Key: key }).promise();
    }

    return { statusCode: 200, body: 'Images compressed (basic compression)' };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Error compressing images' };
  }
};
