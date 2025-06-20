import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const workgroupNames = [
  "Workgroups y Guilds",
  "African Guild",
  "AI Ethics WG",
  "AI Sandbox/Think Tank",
  "Archives WG",
  "Education Guild",
  "Gamers' Guild",
  "GitHub PBL WG",
  "Governance WG",
  "Knowledge Base WG",
  "LatAm Guild",
  "Marketing Guild",
  "Moderators WG",
  "Onboarding WG",
  "Process Guild",
  "R&D Guild",
  "Strategy Guild",
  "Translators WG",
  "Treasury Automation WG",
  "Treasury Guild",
  "Video WG",
  "Writers WG",
]

async function main() {
  console.log("Starting to seed workgroups...")
  for (const name of workgroupNames) {
    try {
      const workgroup = await prisma.workgroup.upsert({
        where: { name },
        update: {},
        create: { name, description: `Official ${name}` },
      })
      console.log(`Upserted workgroup: ${workgroup.name} (ID: ${workgroup.id})`)
    } catch (error) {
      console.error(`Error upserting workgroup ${name}:`, error)
    }
  }
  console.log("Workgroup seeding finished.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
