import { google } from "googleapis";
import { IncomingForm } from "formidable-serverless";

export const POST = async (req) => {
  try {
    const form = new IncomingForm();
    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_KEY),
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    const fileMetadata = {
      name: data.files.file.originalFilename,
      parents: ["root"], // root yerine istersen özel klasör ID koyabilirsin
    };

    const media = {
      mimeType: data.files.file.mimetype,
      body: data.files.file.filepath
        ? require("fs").createReadStream(data.files.file.filepath)
        : null,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    return new Response(JSON.stringify({ fileId: response.data.id }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};
