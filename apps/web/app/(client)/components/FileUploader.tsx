"use client";

import { useEffect, useRef, useState } from "react";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/dashboard";
import AwsS3Multipart from "@uppy/aws-s3";
import GoldenRetriever from "@uppy/golden-retriever";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_UPLOAD_TYPES,
  UPLOAD_CONCURRENCY,
  UPLOAD_RETRY_DELAYS,
} from "@/(client)/libs/constants";

interface FileUploaderProps {
  storeFileMetadata?: (data: {
    fileName: string;
    fileSize: number;
    key: string;
  }) => Promise<unknown>;
  onUploadComplete?: (file: { name: string; size: number; key: string }) => void;
  onError?: (error: Error) => void;
}

async function apiFetch<T>(
  url: string,
  body: unknown,
  signal?: AbortSignal
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }
  return res.json();
}

function createUppy(
  storeFileMetadata?: FileUploaderProps["storeFileMetadata"],
  onUploadComplete?: FileUploaderProps["onUploadComplete"],
  onError?: FileUploaderProps["onError"]
) {
  const uppy = new Uppy({
    id: "knowledge-base-uploader",
    autoProceed: true,
    allowMultipleUploadBatches: false,
    restrictions: {
      maxFileSize: MAX_FILE_SIZE_BYTES,
      allowedFileTypes: [...ALLOWED_UPLOAD_TYPES],
      maxNumberOfFiles: 1,
    },
  });

  uppy.use(AwsS3Multipart, {
    limit: UPLOAD_CONCURRENCY,
    retryDelays: [...UPLOAD_RETRY_DELAYS],
    shouldUseMultipart: () => true,
    uploadPartBytes: AwsS3Multipart.uploadPartBytes,
    getUploadParameters: async () => {
      throw new Error("Multipart upload only");
    },
    createMultipartUpload: async (file) => {
      const data = await apiFetch<{ uploadId: string; key: string }>(
        "/api/create-multipart-upload",
        { fileName: file.name, contentType: file.type || "application/pdf" }
      );
      return { uploadId: data.uploadId, key: data.key };
    },
    signPart: async (file, { uploadId, key, partNumber, signal }) => {
      const data = await apiFetch<{ signedUrl: string }>(
        "/api/sign-part",
        { key, uploadId, partNumber },
        signal
      );
      return { url: data.signedUrl, method: "PUT" as const };
    },
    completeMultipartUpload: async (file, { key, uploadId, parts, signal }) => {
      const data = await apiFetch<{ key?: string }>(
        "/api/complete-upload",
        {
          key,
          uploadId,
          parts: parts.map((p) => ({
            PartNumber: p.PartNumber ?? 0,
            ETag: p.ETag ?? "",
          })),
        },
        signal
      );
      const resolvedKey = data.key ?? key;
      return { location: resolvedKey, key: resolvedKey };
    },
    abortMultipartUpload: async (file, { key, uploadId }) => {
      await fetch("/api/abort-multipart-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, uploadId }),
      });
    },
    listParts: async (file, { key, uploadId, signal }) => {
      if (!uploadId) return [];
      const url = `/api/list-parts?key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}`;
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error("Failed to list parts");
      const parts = await res.json();
      return parts.map((p: { PartNumber: number; ETag: string }) => ({
        PartNumber: p.PartNumber,
        ETag: p.ETag,
      }));
    },
  });

  uppy.use(GoldenRetriever, { serviceWorker: false, indexedDB: {} });

  uppy.on("upload-success", (file, response) => {
    const res = response as {
      body?: { key?: string };
      key?: string;
      location?: string;
    };
    const key = res?.body?.key ?? res?.key ?? res?.location;
    if (key && file?.name != null && file?.size != null) {
      const size = file.size;
      const payload = { fileName: file.name, fileSize: size, key };
      void storeFileMetadata?.(payload)
        .then(() =>
          onUploadComplete?.({ name: file.name, size, key })
        )
        .catch((err) => {
          onError?.(err instanceof Error ? err : new Error(String(err)));
        });
    } else {
      const missingKey = !key;
      const errorMessage = missingKey
        ? "Upload completed but storage key was missing. File metadata could not be saved."
        : "Upload completed but file info was incomplete.";
      const err = new Error(errorMessage);
      if (missingKey) {
        console.error("[FileUploader] Missing key in upload response", {
          response: res,
          fileName: file?.name,
        });
      }
      onError?.(err);
    }
  });

  uppy.on("upload-error", (file, error) => {
    if (error?.name === "AbortError" || error?.message?.includes("aborted")) {
      return;
    }
    onError?.(error);
  });

  return uppy;
}

export function FileUploader({
  storeFileMetadata,
  onUploadComplete,
  onError,
}: FileUploaderProps) {
  const [uppy, setUppy] = useState<Uppy | null>(null);
  const storeRef = useRef(storeFileMetadata);
  const onCompleteRef = useRef(onUploadComplete);
  const onErrorRef = useRef(onError);
  storeRef.current = storeFileMetadata;
  onCompleteRef.current = onUploadComplete;
  onErrorRef.current = onError;

  useEffect(() => {
    const storeFn = (data: {
      fileName: string;
      fileSize: number;
      key: string;
    }) => {
      const fn = storeRef.current;
      if (fn) return fn(data);
      return apiFetch("/api/store-file-metadata", data);
    };
    const instance = createUppy(
      storeFn,
      (file) => onCompleteRef.current?.(file),
      (err) => onErrorRef.current?.(err)
    );
    setUppy(instance);
    return () => {
      instance.destroy();
      setUppy(null);
    };
  }, []);

  if (!uppy) return null;

  return (
    <div className="uppy-upload-container" data-uppy-theme="dark">
      <Dashboard
        uppy={uppy}
        proudlyDisplayPoweredByUppy={false}
        height={320}
        theme="dark"
        note="One PDF file, max 500MB"
        locale={{
          strings: {
            dropPasteImportBoth: "Drop a file here or %{browseFiles}",
            browseFiles: "browse",
          },
        }}
      />
    </div>
  );
}
