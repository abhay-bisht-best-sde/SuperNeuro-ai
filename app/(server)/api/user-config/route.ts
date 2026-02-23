import { prisma } from "@/core/prisma"
import { logger } from "@/core/logger"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const log = logger.withTag("api/user-config")

export async function POST(req: Request) {
  try {
    const [user, body] = await Promise.all([auth(), req.json()])
    const { purpose, companyName, teamSize, industry, useCases } = body
    const userId = user.userId

    if (!userId) {
      log.warn("POST rejected: no userId")
      return new NextResponse("Unauthorized", { status: 401 })
    }

    log.debug("Saving user config", { userId, purpose })

    const existingUserConfig = await prisma.userConfig.findUnique({
      where: { userId },
    })

    if (existingUserConfig) {
      log.warn("User config already exists", { userId })
      return new NextResponse("User Config already exists", { status: 400 })
    }

    await prisma.userConfig.create({
      data: {
        userId,
        purpose,
        companyName: companyName ?? "",
        teamSize: teamSize ?? "",
        industry: industry ?? "",
        useCases: useCases ?? [],
        onboardingCompleted: true,
      },
    })

    log.success("User config created", { userId })
    return new NextResponse("User Config created successfully", { status: 201 })
  } catch (error) {
    log.error("User config create failed", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET(){
    try {
        const user = await auth()
        const userId = user.userId
        if (!userId) {
            log.warn("GET rejected: no userId")
            return new NextResponse("Unauthorized", {status: 401})
        }
        const userConfig = await prisma.userConfig.findUnique({
            where: {
                userId,
            }
        })
        if (!userConfig) {
            return NextResponse.json(null)
        }
        return NextResponse.json(userConfig)
    }
    catch (error) {
    log.error("User config create failed", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}