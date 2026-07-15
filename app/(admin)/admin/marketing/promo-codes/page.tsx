import { prisma } from "../../_lib/prisma";
import PromoCodesClient from "./PromoCodesClient";

export const dynamic = "force-dynamic";

export default async function PromoCodesPage() {
  const promoCodes = await prisma.promoCode.findMany({
    include: { _count: { select: { usages: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="admin-page admin-promo-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-page-kicker">Marketing</span>
          <h1>Promo Codes</h1>
          <p>Erstelle und verwalte Rabattcodes für deine Kunden.</p>
        </div>
      </header>

      <PromoCodesClient
        promoCodes={promoCodes.map((promo) => ({
          id: promo.id,
          code: promo.code,
          discountPercent: promo.discountPercent,
          expiresAt: promo.expiresAt.toISOString(),
          isActive: promo.isActive,
          maxUses: promo.maxUses,
          maxUsesPerClient: promo.maxUsesPerClient,
          usageCount: promo._count.usages,
        }))}
      />
    </div>
  );
}
