"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CertificateModal from "./CertificateModal";

export default function FooterCertificate() {
  const pathname = usePathname();
  const match = pathname.match(/^\/([^/]+)$/);
  if (!match) return null;

  return <CertificateFetcher slug={match[1]} />;
}

function CertificateFetcher({ slug }: { slug: string }) {
  const [certHtml, setCertHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/projects/${slug}/certificate`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setCertHtml(data?.html ?? null);
      })
      .catch(() => {
        if (!cancelled) setCertHtml(null);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!certHtml) return null;

  return <CertificateModal html={certHtml} />;
}
