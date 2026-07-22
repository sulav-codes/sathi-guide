import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/sathi_db',
  }),
});

async function main() {
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

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
