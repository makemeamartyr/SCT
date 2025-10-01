"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionContext } from "@supabase/auth-helpers-react";

interface Attachment {
  id: string;
  file_name: string;
  mime_type: string;
  created_at: string;
  signed_url?: string;
}

interface AttachmentManagerProps {
  shipmentId: string;
}

export function AttachmentManager({ shipmentId }: AttachmentManagerProps) {
  const { supabaseClient } = useSessionContext();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const queryKey = useMemo(() => ["shipments", shipmentId, "attachments"], [shipmentId]);

  const attachmentsQuery = useQuery({
    queryKey,
    queryFn: async (): Promise<Attachment[]> => {
      const { data, error } = await supabaseClient
        .from("shipment_attachments")
        .select("id, file_name, mime_type, created_at");

      if (error) {
        throw error;
      }

      const signed = await Promise.all(
        (data ?? []).map(async (attachment) => {
          const { data: signedUrl } = await supabaseClient.storage
            .from("shipment-files")
            .createSignedUrl(`${shipmentId}/${attachment.file_name}`, 60);

          return {
            ...attachment,
            signed_url: signedUrl?.signedUrl,
          };
        }),
      );

      return signed;
    },
  });

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      setUploading(true);
      try {
        const { error: uploadError } = await supabaseClient.storage
          .from("shipment-files")
          .upload(`${shipmentId}/${file.name}`, file, { upsert: true });
        if (uploadError) {
          throw uploadError;
        }

        const { error: insertError } = await supabaseClient
          .from("shipment_attachments")
          .insert({ shipment_id: shipmentId, file_name: file.name, mime_type: file.type });
        if (insertError) {
          throw insertError;
        }

        await queryClient.invalidateQueries({ queryKey });
      } catch (error) {
        console.error(error);
      } finally {
        setUploading(false);
        event.target.value = "";
      }
    },
    [queryClient, queryKey, shipmentId, supabaseClient],
  );

  if (attachmentsQuery.status === "pending") {
    return <p style={{ color: "#64748b" }}>Loading attachments…</p>;
  }

  if (attachmentsQuery.status === "error") {
    return <p style={{ color: "#b91c1c" }}>{attachmentsQuery.error.message}</p>;
  }

  return (
    <section
      style={{
        display: "grid",
        gap: "1rem",
        background: "white",
        padding: "1.5rem",
        borderRadius: "1rem",
        boxShadow: "0 18px 45px -36px rgba(15, 23, 42, 0.45)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Attachments</h2>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1rem",
            background: uploading ? "#94a3b8" : "#2563eb",
            color: "white",
            borderRadius: "0.75rem",
            fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          Upload file
          <input
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "0.75rem" }}>
        {attachmentsQuery.data?.map((attachment) => (
          <li
            key={attachment.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.85rem 1rem",
              borderRadius: "0.75rem",
              background: "#f1f5f9",
            }}
          >
            <div>
              <strong style={{ display: "block" }}>{attachment.file_name}</strong>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                {attachment.mime_type} • {new Date(attachment.created_at).toLocaleString()}
              </span>
            </div>
            {attachment.signed_url ? (
              <a
                href={attachment.signed_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#2563eb", fontWeight: 600 }}
              >
                Open
              </a>
            ) : null}
          </li>
        ))}
        {attachmentsQuery.data?.length === 0 ? (
          <li style={{ color: "#64748b" }}>No attachments uploaded yet.</li>
        ) : null}
      </ul>
    </section>
  );
}
