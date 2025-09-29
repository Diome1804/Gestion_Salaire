import app from "./App.js";
import { execSync } from 'child_process';

const PORT = process.env.PORT || 4000;

// Run database schema sync
try {
  console.log('Syncing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('Database schema synced successfully.');
} catch (error) {
  console.error('Schema sync failed:', error);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

