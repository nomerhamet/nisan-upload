import { google } from "googleapis";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) return new Response(JSON.stringify({ error: "Dosya yok" }), { status: 400 });

  const key = JSON.parse(process.env.GOOGLE_SERVICE_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.create({
    requestBody: { name: file.name, parents: ["1Kr19HSQ1xYQNKAKQoN2ZaPENETvX5KUZ"] },
    media: { mimeType: file.type, body: file.stream() },
  });

  return new Response(JSON.stringify({ fileId: res.data.id }), { status: 200 });
}
