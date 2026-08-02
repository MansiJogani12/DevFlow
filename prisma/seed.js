const { PrismaClient } = require('@prisma/client')
const path = require('path')

// Load static data from JSON copies in lib
const libPath = path.resolve(process.cwd(), 'lib')
const people = require(path.join(libPath, 'people.json'))
const projects = require(path.join(libPath, 'projects.json'))
const issues = require(path.join(libPath, 'issues.json'))

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database (JS)...')

  for (const p of people) {
    // stringify workingHours object if present
    const personData = Object.assign({}, p, { workingHours: p.workingHours ? JSON.stringify(p.workingHours) : null })
    await prisma.person.upsert({ where: { id: p.id }, update: personData, create: personData })
  }

  for (const pr of projects) {
    const createData = Object.assign({}, pr, {
      startDate: pr.startDate ? new Date(pr.startDate) : null,
      endDate: pr.endDate ? new Date(pr.endDate) : null,
    })
    await prisma.project.upsert({ where: { id: pr.id }, update: createData, create: createData })
  }

  for (const i of issues) {
    const createData = Object.assign({}, i, {
      storyPoints: i.storyPoints ?? null,
      createdAt: i.createdAt ? new Date(i.createdAt) : null,
      updatedAt: i.updatedAt ? new Date(i.updatedAt) : null,
    })
    await prisma.issue.upsert({ where: { id: i.id }, update: createData, create: createData })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
