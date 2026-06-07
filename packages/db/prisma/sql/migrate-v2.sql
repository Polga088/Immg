-- Remove legacy demo user without password (blocks nothing but clutters admin view)
DELETE FROM "User" WHERE email = 'demo@immg.local' AND "passwordHash" IS NULL;
