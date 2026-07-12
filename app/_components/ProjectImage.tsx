import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function resolveImageSrc(projectId: string, src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `/api/assets/${projectId}/${src}`;
}

export default function ProjectImage({ src, alt, className }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      className={`my-4 rounded-lg ${className ?? ""}`}
      unoptimized
    />
  );
}
