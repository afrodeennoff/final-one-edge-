# Quick Start: Supabase Setup

## 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project named "qunt-edge"
3. Save your database password

## 2. Get Credentials
From Supabase Dashboard → Settings → API:
- Copy **Project URL**
- Copy **anon public key**
- Copy **service_role secret**

## 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
```

## 4. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

## 5. Test Setup
```bash
npm run test:supabase
```

## 6. Start Development
```bash
npm run dev
```

Visit: http://localhost:3000/authentication

## Need Help?
Check `SUPABASE_SETUP.md` for detailed instructions