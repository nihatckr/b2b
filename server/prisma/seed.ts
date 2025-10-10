import { PrismaClient, Prisma } from '../src/data/generated/prisma'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Admin User',
    email: 'admin@company.com',
    password: '$2a$10$TLtC603wy85MM./ot/pvEec0w2au6sjPaOmLpLQFbxPdpJH9fDwwS', // myPassword42
    role: 'ADMIN',
    posts: {
      create: [
        {
          title: 'Admin Announcement',
          content: 'Welcome to our platform!',
          published: true,
        },
      ],
    },
  },
  {
    name: 'Manufacturer Corp',
    email: 'manufacturer@corp.com',
    password: '$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi', // random42
    role: 'MANUFACTURE',
    posts: {
      create: [
        {
          title: 'New Product Line',
          content: 'Check out our latest products',
          published: true,
          viewCount: 42,
        },
      ],
    },
  },
  {
    name: 'John Customer',
    email: 'customer@example.com',
    password: '$2a$10$lTlNdIBQvCho0BoQg21KWu/VVKwlYsGwAa5r7ctOV41EKXRQ31ING', // iLikeTurtles42
    role: 'CUSTOMER',
    posts: {
      create: [
        {
          title: 'Product Review',
          content: 'Great quality products!',
          published: true,
          viewCount: 128,
        },
        {
          title: 'Support Question',
          content: 'How do I return an item?',
        },
      ],
    },
  },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
