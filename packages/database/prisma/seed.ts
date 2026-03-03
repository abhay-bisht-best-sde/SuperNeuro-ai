import { PrismaClient, IntegrationType } from "@repo/database"

const prisma = new PrismaClient()

/** Order matches COMPOSIO_TOOLKIT_SLUGS (firecrawl → gmail) for consistency */
const ALL_INTEGRATION_TYPES: IntegrationType[] = [
  IntegrationType.FIRECRAWL,
  IntegrationType.TAVILY,
  IntegrationType.REDDIT,
  IntegrationType.YOUTUBE,
  IntegrationType.SLACK,
  IntegrationType.NOTION,
  IntegrationType.GOOGLEDOCS,
  IntegrationType.GOOGLESHEETS,
  IntegrationType.GOOGLEDRIVE,
  IntegrationType.GOOGLECALENDAR,
  IntegrationType.GMAIL,
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
