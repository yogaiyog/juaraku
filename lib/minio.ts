import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

export const minio = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET = process.env.MINIO_BUCKET!;

export async function getFile(key: string): Promise<Uint8Array | null> {
  try {
    const res = await minio.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key })
    );
    if (!res.Body) return null;
    return new Uint8Array(await res.Body.transformToByteArray());
  } catch {
    return null;
  }
}

export async function getFileText(key: string): Promise<string | null> {
  const buf = await getFile(key);
  return buf ? new TextDecoder().decode(buf) : null;
}

export async function listFiles(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;
  do {
    const res = await minio.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );
    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);
  return keys;
}

export async function fileExists(key: string): Promise<boolean> {
  try {
    await minio.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  contentType?: string
): Promise<void> {
  await minio.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export function getMimeType(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const mimeMap: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    sb3: "application/octet-stream",
    md: "text/markdown",
    yml: "text/yaml",
    yaml: "text/yaml",
    txt: "text/plain",
  };
  return mimeMap[ext] ?? "application/octet-stream";
}
