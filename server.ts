import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Application storage file (supports local dev and Vercel serverless /tmp)
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(__dirname, 'data');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface CandidateApplication {
  id: string;
  nick: string;
  cid: string;
  phone: string;
  discord: string;
  docs: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  source: string;
}

// Read applications from file
function getApplications(): CandidateApplication[] {
  try {
    if (!fs.existsSync(APPLICATIONS_FILE)) {
      // Seed with initial applications for demonstration
      const initial: CandidateApplication[] = [
        {
          id: 'APP-1001',
          nick: 'Denis_Radmir',
          cid: '312',
          phone: '321',
          discord: 'denis_apathy#4412',
          docs: 'https://imgur.com/gallery/radmir-pass-312',
          status: 'pending',
          submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          source: 'public_portal',
        },
      ];
      fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(APPLICATIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading applications file:', err);
    return [];
  }
}

// Save applications to file
function saveApplications(apps: CandidateApplication[]) {
  try {
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(apps, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving applications file:', err);
  }
}

// API Routes

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'apathy-public-portal',
    time: new Date().toISOString(),
    endpoints: {
      submitApplication: 'POST /api/applications',
      listApplications: 'GET /api/applications',
      updateStatus: 'PATCH /api/applications/:id',
      liveFeed: 'GET /api/apathy/live-feed',
    },
  });
});

// 2. Submit application (from public site ac2)
app.post('/api/applications', async (req: Request, res: Response) => {
  try {
    const { nick, cid, phone, discord, docs } = req.body;

    if (!nick || !cid || !phone || !discord || !docs) {
      return res.status(400).json({
        success: false,
        error: 'Все поля обязательны для заполнения (Ник, CID, Телефон, Discord, Ссылка на документы)',
      });
    }

    const apps = getApplications();
    const newId = `APP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApp: CandidateApplication = {
      id: newId,
      nick: String(nick).trim(),
      cid: String(cid).trim(),
      phone: String(phone).trim(),
      discord: String(discord).trim(),
      docs: String(docs).trim(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
      source: 'ac2_portal',
    };

    apps.unshift(newApp);
    saveApplications(apps);

    // Optional webhook forwarding to staff site or external server if env var is set
    const staffWebhookUrl = process.env.STAFF_WEBHOOK_URL;
    if (staffWebhookUrl) {
      try {
        await fetch(staffWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newApp),
        });
      } catch (webhookErr) {
        console.warn('Staff webhook forwarding warning:', webhookErr);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Заявка успешно зарегистрирована в базе данных APATHY CORP!',
      application: newApp,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при сохранении заявки',
    });
  }
});

// 3. List applications (for staff site ac or staff panel)
app.get('/api/applications', (req: Request, res: Response) => {
  const { status, search } = req.query;
  let apps = getApplications();

  if (status && typeof status === 'string' && status !== 'all') {
    apps = apps.filter((a) => a.status === status);
  }

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    apps = apps.filter(
      (a) =>
        a.nick.toLowerCase().includes(s) ||
        a.cid.toLowerCase().includes(s) ||
        a.discord.toLowerCase().includes(s) ||
        a.phone.toLowerCase().includes(s)
    );
  }

  res.json({
    success: true,
    count: apps.length,
    applications: apps,
  });
});

// 4. Update application status (HR/Staff review)
app.patch('/api/applications/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reviewerNotes } = req.body;

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Неверный статус заявки (pending, approved, rejected)',
    });
  }

  const apps = getApplications();
  const index = apps.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Заявка не найдена',
    });
  }

  apps[index].status = status;
  apps[index].reviewedAt = new Date().toISOString();
  if (reviewerNotes !== undefined) {
    apps[index].reviewerNotes = String(reviewerNotes);
  }

  saveApplications(apps);

  return res.json({
    success: true,
    application: apps[index],
  });
});

// 5. Live Corporation Feed (Used by staff site ac or public widgets)
app.get('/api/apathy/live-feed', (_req: Request, res: Response) => {
  const apps = getApplications();
  const pendingCount = apps.filter((a) => a.status === 'pending').length;

  res.json({
    updatedAt: new Date().toISOString(),
    status: 'online',
    corporation: {
      name: 'APATHY',
      server: 'Radmir GTA 5 RP · Сервер 1',
      radioFrequency: '104.45 MHz',
      treasuryBalance: 124500000,
      weeklyGain: 18400000,
      activeWorkersCount: 42,
      pendingApplicationsCount: pendingCount,
      resourcePrices: {
        rock: 5000,
        wood: 2500,
        redFlower: 1500,
        blueFlower: 1400,
        pinkFlower: 1500,
      },
      totalMined: 341250,
    },
    fleet: [
      {
        id: 'veh-01',
        modelName: 'Bravado Rumpo Custom (Чумаш)',
        plate: 'APATHY-1',
        trunkKg: 1500,
        rankRequired: 'Стажёр [1]',
        slot: 'Гараж 1',
        status: 'Готов к выезду',
        fuelPercent: 95,
      },
      {
        id: 'veh-02',
        modelName: 'Speedo Express Heavy',
        plate: 'APATHY-2',
        trunkKg: 2000,
        rankRequired: 'Добытчик [2]',
        slot: 'Гараж 2',
        status: 'Готов к выезду',
        fuelPercent: 88,
      },
      {
        id: 'veh-03',
        modelName: 'Mule Heavy Duty Transporter',
        plate: 'APATHY-3',
        trunkKg: 3500,
        rankRequired: 'Мастер цеха [3]',
        slot: 'Гараж 3',
        status: 'В рейсе',
        fuelPercent: 72,
      },
      {
        id: 'veh-04',
        modelName: 'Pfister Neon Corp Edition',
        plate: 'APATHY-4',
        trunkKg: 500,
        rankRequired: 'Руководство [5+]',
        slot: 'VIP Слот',
        status: 'Готов к выезду',
        fuelPercent: 100,
      },
    ],
    hallOfFame: [
      {
        place: 1,
        nickname: 'Akula Tankist',
        cid: '0001',
        rankTitle: 'Владелец [7]',
        totalMined: 48200,
        bonusReward: 1500000,
      },
      {
        place: 2,
        nickname: 'Sidakk Salvatore',
        cid: '0002',
        rankTitle: 'Совладелец [6]',
        totalMined: 39500,
        bonusReward: 1000000,
      },
      {
        place: 3,
        nickname: 'Sontana Terrokilla',
        cid: '0003',
        rankTitle: 'Зам. Владельца [5]',
        totalMined: 31200,
        bonusReward: 750000,
      },
    ],
  });
});

// Production static file serving or Vite middleware in dev
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
