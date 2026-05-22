import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function startOfTodayUTC(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

const today = startOfTodayUTC();

const QUESTS = [
  {
    title: 'Paint your mood as a single shape',
    description:
      "No skill required. Pick one shape, one color, one feeling. Fill an A5 page in under 10 minutes. Post it with the hashtag #todayssidequest — the imperfection is the point.",
    heroImageUrl: 'https://picsum.photos/seed/quest_paint_mood/800/600',
    difficulty: 'easy',
    estTimeMin: 15,
    materials: [
      { productId: 'im_acrylic_red_50', name: 'Acrylic Paint Red 50ml', qty: 1, optional: false },
      { productId: 'im_paintbrush_set', name: 'Paint Brush Set (6 pcs)', qty: 1, optional: false },
      { productId: 'im_sketchbook', name: 'A5 Sketchbook 80 pages', qty: 1, optional: false },
    ],
  },
  {
    title: 'Build a tiny clay creature',
    description:
      'Sculpt something that has never existed before. Big eyes encouraged. Air-dry overnight, name it tomorrow.',
    heroImageUrl: 'https://picsum.photos/seed/quest_clay_creature/800/600',
    difficulty: 'easy',
    estTimeMin: 30,
    materials: [
      { productId: 'im_air_dry_clay', name: 'Air-Dry Clay 500g', qty: 1, optional: false },
    ],
  },
  {
    title: 'Mix a virgin mojito for someone you love',
    description:
      'Muddle mint + lime + sugar. Top with soda. Hand it to a friend, sibling, or parent without explanation. Watch their face.',
    heroImageUrl: 'https://picsum.photos/seed/quest_mojito/800/600',
    difficulty: 'easy',
    estTimeMin: 10,
    materials: [
      { productId: 'im_lime', name: 'Limes 250g', qty: 1, optional: false },
      { productId: 'im_mint', name: 'Mint Leaves 50g', qty: 1, optional: false },
      { productId: 'im_soda', name: 'Club Soda 750ml', qty: 1, optional: false },
      { productId: 'im_sugar', name: 'Castor Sugar 500g', qty: 1, optional: true },
    ],
  },
  {
    title: 'Stage a water-gun ambush at golden hour',
    description:
      "Recruit 2+ friends. Meet on the terrace at 6pm. First splash gets the last laugh. Record the chaos in slow-mo.",
    heroImageUrl: 'https://picsum.photos/seed/quest_water_ambush/800/600',
    difficulty: 'spicy',
    estTimeMin: 25,
    materials: [
      { productId: 'im_water_gun', name: 'Water Gun Pistol (Medium)', qty: 2, optional: false },
      { productId: 'im_balloons', name: 'Water Balloons (100 pcs)', qty: 1, optional: true },
    ],
  },
  {
    title: 'Glow-jar your windowsill',
    description:
      'Drop fairy lights into a mason jar. Place where you write/read. Take a photo at night and post it — that\'s the whole quest.',
    heroImageUrl: 'https://picsum.photos/seed/quest_glow_jar/800/600',
    difficulty: 'easy',
    estTimeMin: 10,
    materials: [
      { productId: 'im_glass_jar', name: 'Glass Mason Jar 250ml', qty: 1, optional: false },
      { productId: 'im_fairy_lights', name: 'Warm LED Fairy Lights 5m', qty: 1, optional: false },
    ],
  },
];

async function main() {
  console.log(`Seeding ${QUESTS.length} quests for drop date ${today.toISOString().slice(0, 10)}`);

  // Wipe today's existing batch so reseeding is idempotent
  await prisma.quest.deleteMany({ where: { dropDate: today } });

  for (const q of QUESTS) {
    await prisma.quest.create({
      data: {
        dropDate: today,
        title: q.title,
        description: q.description,
        heroImageUrl: q.heroImageUrl,
        difficulty: q.difficulty,
        estTimeMin: q.estTimeMin,
        status: 'live',
        materials: {
          create: q.materials.map((m) => ({
            instamartProductId: m.productId,
            productName: m.name,
            qty: m.qty,
            optional: m.optional,
          })),
        },
      },
    });
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
