import { requireAuth } from "@/(server)/lib/auth"
import { validateBodySize, validateUserKey } from "@/(server)/lib/validation"
import { getR2FilesBucket } from "@/(server)/lib/r2"
import {
  MAX_BODY_SIZE_KB,
  MAX_BODY_SIZE_MB,
  ALLOWED_CONTENT_TYPES,
  SIGNED_URL_EXPIRES_SEC,
  MAX_PART_NUMBER,
} from "@/(server)/core/constants"

export { requireAuth, validateBodySize, validateUserKey, getR2FilesBucket }
export {
  MAX_BODY_SIZE_KB,
  MAX_BODY_SIZE_MB,
  ALLOWED_CONTENT_TYPES,
  SIGNED_URL_EXPIRES_SEC,
  MAX_PART_NUMBER,
}
