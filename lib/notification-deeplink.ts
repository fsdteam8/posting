/**
 * Notification deep links are stored in the database verbatim. Older
 * notifications used `/marketplace/listings/<id>` (plural), but the actual
 * Next.js route is `/marketplace/listing/<id>` (singular). Rather than back-fill
 * the database, we normalize legacy paths at click time so old notifications
 * route correctly without a migration.
 *
 * Keep this list small and conservative — only fix known historical typos,
 * don't try to rewrite anything that looks vaguely off.
 */
export function normalizeDeepLink(deepLink: string): string {
  if (!deepLink) return deepLink;

  // Legacy plural → current singular for the marketplace listing detail route.
  // Matches exactly `/marketplace/listings/<id>` and any sub-path under it.
  return deepLink.replace(
    /^\/marketplace\/listings\//,
    "/marketplace/listing/",
  );
}
