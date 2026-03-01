import { PrismaClient, IntegrationType } from "@repo/database"

const prisma = new PrismaClient()

const ALL_INTEGRATION_TYPES: IntegrationType[] = [
  IntegrationType.GMAIL,
  IntegrationType.GOOGLE_CALENDAR,
  IntegrationType.GOOGLE_DRIVE,
  IntegrationType.GOOGLE_SHEETS,
  IntegrationType.NOTION,
  IntegrationType.SLACK,
  IntegrationType.GOOGLE_DOCS,
  IntegrationType.YOUTUBE,
  IntegrationType.REDDIT,
]

async function main() {
  await Promise.all(
    ALL_INTEGRATION_TYPES.map((name) =>
      prisma.integrations.upsert({
        where: { name },
        create: { name },
        update: {},
      })
    )
  )
  console.log(`Seeded ${ALL_INTEGRATION_TYPES.length} integrations`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
