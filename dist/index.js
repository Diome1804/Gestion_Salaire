import app from "./App.js";
import { execSync } from 'child_process';
const PORT = process.env.PORT || 4000;
// Run database migrations
try {
    console.log('Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migrations completed successfully.');
}
catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map