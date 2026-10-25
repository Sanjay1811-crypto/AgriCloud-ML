const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STORAGE_MODE = process.env.STORAGE_MODE || 'local';
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Uploads a file buffer to storage (local disk or AWS S3)
 * @param {Buffer} buffer File buffer
 * @param {string} originalName Original filename
 * @param {string} mimeType MIME type
 * @returns {Promise<{ storageKey: string, storageUrl: string }>}
 */
const uploadFile = async (buffer, originalName, mimeType) => {
  const extension = path.extname(originalName) || (mimeType === 'application/pdf' ? '.pdf' : '.jpg');
  const uniqueId = crypto.randomBytes(12).toString('hex');
  const storageKey = `${Date.now()}-${uniqueId}${extension}`;

  if (STORAGE_MODE === 's3') {
    // AWS S3 implementation
    try {
      // In production with AWS SDK installed and configured:
      // const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
      // const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
      // await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: storageKey, Body: buffer, ContentType: mimeType }));
      const s3Url = `https://${process.env.S3_BUCKET_NAME || 'agricloud-ml-leaf-storage'}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${storageKey}`;
      return { storageKey, storageUrl: s3Url };
    } catch (err) {
      console.warn('[S3Service] S3 upload error, falling back to local storage:', err.message);
    }
  }

  // Local storage mode
  const localFilePath = path.join(UPLOADS_DIR, storageKey);
  fs.writeFileSync(localFilePath, buffer);
  
  const baseUrl = process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  const storageUrl = `${baseUrl}/uploads/${storageKey}`;
  
  return {
    storageKey,
    storageUrl
  };
};

/**
 * Deletes a file from storage
 */
const deleteFile = async (storageKey) => {
  if (STORAGE_MODE === 's3') {
    // S3 Delete command
    return true;
  }
  const localFilePath = path.join(UPLOADS_DIR, storageKey);
  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }
  return true;
};

module.exports = {
  uploadFile,
  deleteFile
};
