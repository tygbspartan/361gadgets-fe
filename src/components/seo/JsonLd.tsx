/*
 * Structured data (schema.org JSON-LD) for search engines. "<" is escaped so
 * text from the admin (FAQ answers, descriptions) can never close the script
 * tag early.
 */
export default function JsonLd({ data }: { data: object | null | undefined }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}
