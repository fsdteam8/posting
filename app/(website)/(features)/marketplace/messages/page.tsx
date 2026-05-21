/**
 * /marketplace/messages — server entry point.
 *
 * The layout owns auth + the persistent conv list and an empty-state when no
 * conversation is selected. Nothing needs to render in `children` here, so we
 * just return a hidden placeholder that lets Next satisfy the page contract.
 */

export default function MarketplaceMessagesIndexPage() {
  return null;
}
