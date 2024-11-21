const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const app = express();

// Configuration
cloudinary.config({
    cloud_name: process.env.name,
    api_key: process.env.key,
    api_secret: process.env.secret,
    secure: true
});

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to handle image upload
app.post('/upload', upload.single('file'), async (req, res) => {
    // Check if file is uploaded
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    try {
        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
                if (error) {
                    return res.status(500).send(`An error occurred: ${error.message}`);
                }
                // Return the secure URL of the uploaded image
                return res.status(200).send(`${result.secure_url}`);
            }
        );

        // Pipe the file to Cloudinary upload stream
        uploadResult.end(req.file.buffer);

    } catch (error) {
        res.status(500).send(`An error occurred: ${error.message}`);
    }
});

function keepAppRunning() {
    setInterval(() => {
        https.get(`${process.env.RENDER_EXTERNAL_URL}/ping`, (resp) => {
            if (resp.statusCode === 200) {
                console.log('Ping successful');
            } else {
                console.error('Ping failed');
            }
        });
    }, 5 * 60 * 1000);
}

app.get('/ping', (req, res) => { res.status(200).json({ message: 'Ping successful' }); });

/* ---- PING ---- */

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
    keepAppRunning();
});
