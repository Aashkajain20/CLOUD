require("dotenv").config();

const express = require("express");
const AWS = require("aws-sdk");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const bucketName = process.env.BUCKET_NAME;
const s3 = new AWS.S3();

// Set up multer storage engine
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Handle file upload
app.post("/register", upload.single("photo"), (req, res) => {
    const { name, email, password } = req.body;
    // console.log("req====> ", req);
    // console.log("req.body====> ", req.body);
    // console.log("req.file====> ", req.file);

    // Upload file to S3
    const params = {
        Bucket: bucketName,
        Key: req.file.originalname,
        ContentType: req.file.mimetype,
        Body: req.file.buffer,
    };
    s3.upload(params, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error uploading file");
        } else {
            console.log("File uploaded successfully");
            // Send form data to server
        }
    });
});

// Start server
app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
});