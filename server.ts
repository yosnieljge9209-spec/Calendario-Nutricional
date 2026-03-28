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

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const APP_URL = process.env.APP_URL || 'http://localhost:3000';

  const getOAuth2Client = (req: express.Request) => {
    const config = req.session?.config || {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    };

    return new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      `${APP_URL}/auth/google/callback`
    );
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV, appUrl: APP_URL });
  });

  app.post("/api/auth/config", (req, res) => {
    const { clientId, clientSecret } = req.body;
    if (!clientId || !clientSecret) return res.status(400).json({ error: "Faltan credenciales" });
    req.session!.config = { clientId, clientSecret };
    res.json({ success: true });
  });

  app.get("/api/auth/url", (req, res) => {
    const oauth2Client = getOAuth2Client(req);
    
    if (!oauth2Client._clientId || !oauth2Client._clientSecret) {
      return res.status(400).json({ error: "Credenciales no configuradas" });
    }
    const scopes = [
      'https://www.googleapis.com/auth/drive.appdata',
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
    const oauth2Client = getOAuth2Client(req);
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
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      // Find existing sync file in appDataFolder
      const listRes = await drive.files.list({
        q: "name = 'nutriplan_backup.json' and trashed = false",
        fields: 'files(id)',
        spaces: 'appDataFolder'
      });

      const fileMetadata = {
        name: 'nutriplan_backup.json',
        mimeType: 'application/json',
        parents: ['appDataFolder']
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
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      const listRes = await drive.files.list({
        q: "name = 'nutriplan_backup.json' and trashed = false",
        fields: 'files(id)',
        spaces: 'appDataFolder'
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
    console.log(`App URL: ${APP_URL}`);
  });
}

startServer().catch(err => {
  console.error("CRITICAL: Failed to start server:", err);
});
