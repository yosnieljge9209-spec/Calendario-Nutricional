import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import cookieSession from "cookie-session";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'nutriplan-secret-key'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true,
    sameSite: 'none'
  }));

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL || 'http://localhost:3000'}/auth/google/callback`
  );

  // API Routes
  app.get("/api/auth/url", (req, res) => {
    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({ url });
  });

  app.get("/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      req.session!.tokens = tokens;
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Autenticación exitosa. Esta ventana se cerrará automáticamente.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error exchanging code for tokens:", error);
      res.status(500).send("Error de autenticación");
    }
  });

  app.get("/api/auth/status", (req, res) => {
    res.json({ isAuthenticated: !!req.session?.tokens });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session = null;
    res.json({ success: true });
  });

  // Google Drive Sync Endpoints
  app.post("/api/sync/upload", async (req, res) => {
    if (!req.session?.tokens) return res.status(401).json({ error: "No autenticado" });
    
    const tokens = req.session.tokens;
    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      // Find existing sync file
      const listRes = await drive.files.list({
        q: "name = 'nutriplan_backup.json' and trashed = false",
        fields: 'files(id)',
        spaces: 'drive'
      });

      const fileMetadata = {
        name: 'nutriplan_backup.json',
        mimeType: 'application/json'
      };
      const media = {
        mimeType: 'application/json',
        body: JSON.stringify(req.body.data)
      };

      if (listRes.data.files && listRes.data.files.length > 0) {
        // Update existing file
        const fileId = listRes.data.files[0].id!;
        await drive.files.update({
          fileId: fileId,
          media: media
        });
      } else {
        // Create new file
        await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id'
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error uploading to Drive:", error);
      res.status(500).json({ error: "Error al subir a Google Drive" });
    }
  });

  app.get("/api/sync/download", async (req, res) => {
    if (!req.session?.tokens) return res.status(401).json({ error: "No autenticado" });
    
    const tokens = req.session.tokens;
    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      const listRes = await drive.files.list({
        q: "name = 'nutriplan_backup.json' and trashed = false",
        fields: 'files(id)',
        spaces: 'drive'
      });

      if (!listRes.data.files || listRes.data.files.length === 0) {
        return res.status(404).json({ error: "No se encontró respaldo" });
      }

      const fileId = listRes.data.files[0].id!;
      const fileRes = await drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      res.json({ data: fileRes.data });
    } catch (error) {
      console.error("Error downloading from Drive:", error);
      res.status(500).json({ error: "Error al descargar de Google Drive" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
