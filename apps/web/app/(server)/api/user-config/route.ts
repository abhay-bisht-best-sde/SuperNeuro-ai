import { NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { logger } from "@/core/logger";
import {
  requireAuth,
  INTERNAL_ERROR,
} from "@/(server)/lib/api";

const log = logger.withTag("api/user-config");

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const userConfig = await prisma.userConfig.findUnique({
      where: { userId: authResult },
    });
    return NextResponse.json(userConfig);
  } catch (err) {
    log.error("User config fetch failed", err);
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const body = await req.json();
    const { purpose, companyName, teamSize, industry, useCases } = body as {
      purpose?: string;
      companyName?: string;
      teamSize?: string;
      industry?: string;
      useCases?: string[];
    };

    const existing = await prisma.userConfig.findUnique({
      where: { userId },
    });
    if (existing) {
      log.warn("User config already exists", { userId });
      return NextResponse.json(
        { error: "User Config already exists" },
        { status: 400 }
      );
    }

    await prisma.userConfig.create({
      data: {
        userId,
        purpose: purpose ?? "",
        companyName: companyName ?? "",
        teamSize: teamSize ?? "",
        industry: industry ?? "",
        useCases: useCases ?? [],
        onboardingCompleted: true,
      },
    });

    log.success("User config created", { userId });
    return NextResponse.json(
      { message: "User Config created successfully" },
      { status: 201 }
    );
  } catch (err) {
    log.error("User config create failed", err);
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 });
  }
}
