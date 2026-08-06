import { PrismaClient, Role } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import { ARGON2_OPTIONS } from '../src/common/constants/auth.constants';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function seedAdmin() {
  console.log('Seeding admin user...');

  const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL ?? 'admin@sathiguide.com';
  const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD ?? 'Admin@123456';

  const passwordHash = await argon2.hash(ADMIN_PASSWORD, ARGON2_OPTIONS);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      passwordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  // Create AdminProfile if it doesn't exist
  await prisma.adminProfile.upsert({
    where: { userId: admin.id },
    update: {
      fullName: 'Super Admin',
      department: 'Platform',
      isSuperAdmin: true,
      permissions: ['verify_guides', 'manage_reports', 'view_analytics'],
    },
    create: {
      userId: admin.id,
      fullName: 'Super Admin',
      department: 'Platform',
      isSuperAdmin: true,
      permissions: ['verify_guides', 'manage_reports', 'view_analytics'],
    },
  });

  console.log(`✅ Admin seeded: ${ADMIN_EMAIL} (password: ${ADMIN_PASSWORD})`);
  console.log('⚠️  Change the admin password after first login!');
}

async function seedCategories() {
  console.log('Seeding categories...');

  const categories = [
    {
      name: 'Culture',
      slug: 'culture',
      description: 'Culture and Heritage',
      iconKey: 'building.columns.fill',
      color: '#EF4444',
    },
    {
      name: 'Hiking',
      slug: 'hiking',
      description: 'Trekking and Hiking',
      iconKey: 'figure.walk',
      color: '#2DBE6C',
    },
    {
      name: 'Food',
      slug: 'food',
      description: 'Food and Culinary',
      iconKey: 'fork.knife',
      color: '#F5820A',
    },
    {
      name: 'Nature',
      slug: 'nature',
      description: 'Nature and Wildlife',
      iconKey: 'photo.on.rectangle.angled.fill',
      color: '#10B981',
    },
    {
      name: 'Adventure',
      slug: 'adventure',
      description: 'Adventure Sports',
      iconKey: 'figure.outdoor.cycle.circle.fill',
      color: '#1A73E8',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        iconKey: category.iconKey,
        color: category.color,
      },
      create: category,
    });
  }

  console.log('✅ Categories seeded.');
}

async function main() {
  await seedCategories();
  await seedAdmin();

  console.log('\nSeeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
