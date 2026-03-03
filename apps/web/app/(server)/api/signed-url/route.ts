import { NextResponse } from "next/server"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { requireAuth } from "@/(server)/lib/auth"
import { r2Client, getR2FilesBucket, getR2ImagesBucket } from "@/(server)/lib/r2"
import { validateUserKey } from "@/(server)/helpers"
import { SIGNED_URL_EXPIRES_SEC } from "@/(server)/core/constants"
import { logger } from "@/core/logger"

const log = logger.withTag("api/signed-url")

export async function GET(request: Request) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const userId = authResult

    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")
    const type = searchParams.get("type") ?? "pdf"

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "key is required" },
        { status: 400 }
      )
    }

    const keyError = validateUserKey(key, userId)
    if (keyError) return keyError

    const bucket =
      type === "image"
        ? getR2ImagesBucket()
        : getR2FilesBucket()

    if (bucket instanceof NextResponse) return bucket

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    const signedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: SIGNED_URL_EXPIRES_SEC,
    })

    log.debug("Signed URL generated", { key, type })
    return NextResponse.json({ url: signedUrl })
  } catch (err) {
    log.error("Signed URL failed", err)
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    )
  }
}
