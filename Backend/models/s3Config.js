import { S3Client } from "@aws-sdk/client-s3";


const s3Client = new S3Client({
    region: process.env.REACT_APP_AWS_S3_REGION_AREA,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    }
});

console.log("✅ AWS connected successfully");

export default s3Client;