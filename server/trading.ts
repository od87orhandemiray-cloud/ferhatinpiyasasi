import { Router, Response } from "express";
import { requireDb } from "./db";
import { AuthedRequest, requireAuth } from "./auth";

// server.ts bu fonksiyonları gerçek fiyat kaynaklarına bağlayacak.
// Böylece trading.ts, hisse mi fon mu geldiğini bilmeden çalışabilir.
export type PriceLookup = (symbol: string) => number | null;

export function createTradingRouter(getStockPrice: PriceLookup, getFundPrice: PriceLookup) {
  const router = Router();

  function getPrice(instrumentType: "stock" | "fund", symbol: string): number | null {
    return instrumentType === "stock" ? getStockPrice(symbol) : getFundPrice(symbol);
  }

  // Cüzdan bakiyesi + portföy (elde tutulan hisse/fonlar, güncel değerleriyle)
  router.get("/api/portfolio", requireAuth, async (req: AuthedRequest, res: Response) => {
    const db = requireDb();
    const walletResult = await db.query("SELECT balance FROM wallets WHERE user_id = $1", [req.userId]);
    const holdingsResult = await db.query(
      "SELECT instrument_type, symbol, quantity, avg_cost FROM holdings WHERE user_id = $1 AND quantity > 0",
      [req.userId]
    );

    const holdings = holdingsResult.rows.map((h) => {
      const currentPrice = getPrice(h.instrument_type, h.symbol) ?? Number(h.avg_cost);
      const quantity = Number(h.quantity);
      const avgCost = Number(h.avg_cost);
      const marketValue = quantity * currentPrice;
      const costBasis = quantity * avgCost;
      return {
        instrumentType: h.instrument_type,
        symbol: h.symbol,
        quantity,
        avgCost,
        currentPrice,
        marketValue: Number(marketValue.toFixed(2)),
        pnl: Number((marketValue - costBasis).toFixed(2)),
        pnlPercent: costBasis > 0 ? Number((((marketValue - costBasis) / costBasis) * 100).toFixed(2)) : 0,
      };
    });

    const balance = Number(walletResult.rows[0]?.balance ?? 0);
    const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

    res.json({
      status: "ok",
      balance,
      totalEquity: Number((balance + totalHoldingsValue).toFixed(2)),
      holdings,
    });
  });

  // İşlem geçmişi
  router.get("/api/transactions", requireAuth, async (req: AuthedRequest, res: Response) => {
    const db = requireDb();
    const result = await db.query(
      "SELECT instrument_type, symbol, side, quantity, price, total, created_at FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200",
      [req.userId]
    );
    res.json({ status: "ok", transactions: result.rows });
  });

  // Alım / satım emri (anlık, sanal fiyatla gerçekleşir)
  router.post("/api/trade", requireAuth, async (req: AuthedRequest, res: Response) => {
    const { instrumentType, symbol, side, quantity } = req.body as {
      instrumentType: "stock" | "fund";
      symbol: string;
      side: "buy" | "sell";
      quantity: number;
    };

    if (!instrumentType || !symbol || !side || !quantity || quantity <= 0) {
      return res.status(400).json({ status: "error", message: "Eksik veya geçersiz emir bilgisi." });
    }
    if (instrumentType !== "stock" && instrumentType !== "fund") {
      return res.status(400).json({ status: "error", message: "Geçersiz enstrüman tipi." });
    }
    if (side !== "buy" && side !== "sell") {
      return res.status(400).json({ status: "error", message: "Geçersiz emir yönü." });
    }

    const price = getPrice(instrumentType, symbol.toUpperCase());
    if (price === null || price <= 0) {
      return res.status(404).json({ status: "error", message: `Fiyat bulunamadı: ${symbol}` });
    }

    const db = requireDb();
    const client = await db.connect();
    const total = Number((price * quantity).toFixed(2));

    try {
      await client.query("BEGIN");

      const walletRes = await client.query(
        "SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE",
        [req.userId]
      );
      const balance = Number(walletRes.rows[0]?.balance ?? 0);

      const holdingRes = await client.query(
        "SELECT quantity, avg_cost FROM holdings WHERE user_id = $1 AND instrument_type = $2 AND symbol = $3 FOR UPDATE",
        [req.userId, instrumentType, symbol.toUpperCase()]
      );
      const existingQty = Number(holdingRes.rows[0]?.quantity ?? 0);
      const existingAvgCost = Number(holdingRes.rows[0]?.avg_cost ?? 0);

      if (side === "buy") {
        if (total > balance) {
          await client.query("ROLLBACK");
          return res.status(400).json({ status: "error", message: "Yetersiz sanal bakiye." });
        }
        const newQty = existingQty + quantity;
        const newAvgCost = (existingQty * existingAvgCost + quantity * price) / newQty;

        await client.query("UPDATE wallets SET balance = balance - $1, updated_at = now() WHERE user_id = $2", [
          total,
          req.userId,
        ]);
        await client.query(
          `INSERT INTO holdings (user_id, instrument_type, symbol, quantity, avg_cost)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (user_id, instrument_type, symbol)
           DO UPDATE SET quantity = $4, avg_cost = $5`,
          [req.userId, instrumentType, symbol.toUpperCase(), newQty, newAvgCost]
        );
      } else {
        if (quantity > existingQty) {
          await client.query("ROLLBACK");
          return res.status(400).json({ status: "error", message: "Elinizde bu kadar yok." });
        }
        const newQty = existingQty - quantity;

        await client.query("UPDATE wallets SET balance = balance + $1, updated_at = now() WHERE user_id = $2", [
          total,
          req.userId,
        ]);
        await client.query(
          `UPDATE holdings SET quantity = $1 WHERE user_id = $2 AND instrument_type = $3 AND symbol = $4`,
          [newQty, req.userId, instrumentType, symbol.toUpperCase()]
        );
      }

      await client.query(
        `INSERT INTO transactions (user_id, instrument_type, symbol, side, quantity, price, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [req.userId, instrumentType, symbol.toUpperCase(), side, quantity, price, total]
      );

      await client.query("COMMIT");
      res.json({ status: "ok", message: "İşlem gerçekleşti.", price, total });
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error("Trade error:", err);
      res.status(500).json({ status: "error", message: "İşlem sırasında hata oluştu." });
    } finally {
      client.release();
    }
  });

  return router;
}
