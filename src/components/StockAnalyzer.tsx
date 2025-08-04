import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calculator } from "lucide-react";

interface AnalysisResult {
  totalInvested: number;
  totalSellAmount: number;
  profitLoss: number;
  profitLossPercentage: number;
  mtfBuyingPower?: number;
  requiredMargin?: number;
  mtfProfitLoss?: number;
  mtfProfitLossPercentage?: number;
  interestCost?: number;
  breakEvenPrice?: number;
  stopLossAmount?: number;
  stopLossPercentage?: number;
}

const StockAnalyzer = () => {
  const [stockName, setStockName] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [shares, setShares] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [sellPricePercent, setSellPricePercent] = useState("");
  const [mtfEnabled, setMtfEnabled] = useState(false);
  const [marginMultiplier, setMarginMultiplier] = useState("2.5");
  const [mtfTargetPrice, setMtfTargetPrice] = useState("");
  const [mtfTargetPercent, setMtfTargetPercent] = useState("");
  const [holdingPeriodDays, setHoldingPeriodDays] = useState("7");
  const [brokerInterestRate, setBrokerInterestRate] = useState("12");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const syncSellPriceAndPercent = (field: "price" | "percent", value: string) => {
    if (!buyPrice) return;
    const bp = Number(buyPrice);
    if (field === "price") {
      setSellPrice(value);
      const sp = Number(value);
      if (bp > 0) {
        const percent = ((sp - bp) / bp) * 100;
        setSellPricePercent(percent.toFixed(2));
      }
    } else {
      setSellPricePercent(value);
      const percent = Number(value);
      const sp = bp * (1 + percent / 100);
      setSellPrice(sp.toFixed(2));
    }
  };

  const syncMtfPriceAndPercent = (field: "price" | "percent", value: string) => {
    if (!buyPrice) return;
    const bp = Number(buyPrice);
    if (field === "price") {
      setMtfTargetPrice(value);
      const mp = Number(value);
      if (bp > 0) {
        const percent = ((mp - bp) / bp) * 100;
        setMtfTargetPercent(percent.toFixed(2));
      }
    } else {
      setMtfTargetPercent(value);
      const percent = Number(value);
      const mp = bp * (1 + percent / 100);
      setMtfTargetPrice(mp.toFixed(2));
    }
  };

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};
    if (!stockName.trim()) newErrors.stockName = "Stock name is required";
    if (!buyPrice || isNaN(Number(buyPrice)) || Number(buyPrice) <= 0) newErrors.buyPrice = "Valid buy price is required";
    if (!shares || isNaN(Number(shares)) || Number(shares) <= 0) newErrors.shares = "Valid shares required";
    if (!sellPrice || isNaN(Number(sellPrice)) || Number(sellPrice) <= 0) newErrors.sellPrice = "Valid sell price is required";
    if (mtfEnabled) {
      if (!marginMultiplier || isNaN(Number(marginMultiplier)) || Number(marginMultiplier) <= 1) newErrors.marginMultiplier = "Margin > 1";
      if (!mtfTargetPrice || isNaN(Number(mtfTargetPrice)) || Number(mtfTargetPrice) <= 0) newErrors.mtfTargetPrice = "MTF price required";
      if (!holdingPeriodDays || isNaN(Number(holdingPeriodDays)) || Number(holdingPeriodDays) < 1) newErrors.holdingPeriodDays = "Valid days";
      if (!brokerInterestRate || isNaN(Number(brokerInterestRate)) || Number(brokerInterestRate) <= 0) newErrors.brokerInterestRate = "Valid rate";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAnalysis = () => {
    if (!validateInputs()) return;
    const bp = Number(buyPrice);
    const sp = Number(sellPrice);
    const sharesNum = Number(shares);
    const totalInvested = bp * sharesNum;
    const totalSellAmount = sp * sharesNum;
    const profitLoss = totalSellAmount - totalInvested;
    const profitLossPercentage = (profitLoss / totalInvested) * 100;

    const analysisResult: AnalysisResult = {
      totalInvested,
      totalSellAmount,
      profitLoss,
      profitLossPercentage,
    };

    if (mtfEnabled) {
      const marginMult = Number(marginMultiplier);
      const mtfTarget = Number(mtfTargetPrice);
      const mtfBuyingPower = totalInvested * marginMult;
      const requiredMargin = mtfBuyingPower / marginMult;
      const mtfShares = mtfBuyingPower / bp;
      const mtfSellAmount = mtfShares * mtfTarget;
      const mtfProfitLoss = mtfSellAmount - mtfBuyingPower;
      const borrowed = mtfBuyingPower - requiredMargin;
      const interestCost = borrowed * (Number(brokerInterestRate) / 100) * (Number(holdingPeriodDays) / 365);
      const netProfit = mtfProfitLoss - interestCost;
      const mtfProfitLossPercentage = (netProfit / requiredMargin) * 100;
      const breakEvenPrice = bp + interestCost / mtfShares;
      analysisResult.mtfBuyingPower = mtfBuyingPower;
      analysisResult.requiredMargin = requiredMargin;
      analysisResult.mtfProfitLoss = netProfit;
      analysisResult.mtfProfitLossPercentage = mtfProfitLossPercentage;
      analysisResult.interestCost = interestCost;
      analysisResult.breakEvenPrice = breakEvenPrice;
    }

    if (stopLossPrice) {
      const sl = Number(stopLossPrice);
      analysisResult.stopLossAmount = (sl - bp) * sharesNum;
      analysisResult.stopLossPercentage = ((sl - bp) / bp) * 100;
    }

    setResult(analysisResult);
  };

  const currency = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);
  const percent = (p: number) => `${p.toFixed(2)}%`;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6 bg-white/5 backdrop-blur border border-white/10">
          <CardHeader><CardTitle>Stock Inputs</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div><Label>Stock</Label><Input value={stockName} onChange={e => setStockName(e.target.value)} /></div>
            <div><Label>Buy Price</Label><Input value={buyPrice} onChange={e => setBuyPrice(e.target.value)} /></div>
            <div><Label>Shares</Label><Input value={shares} onChange={e => setShares(e.target.value)} /></div>
            <div><Label>Sell Price</Label><Input value={sellPrice} onChange={e => syncSellPriceAndPercent("price", e.target.value)} /></div>
            <div><Label>Sell %</Label><Input value={sellPricePercent} onChange={e => syncSellPriceAndPercent("percent", e.target.value)} /></div>
            <div><Label>Stop Loss</Label><Input value={stopLossPrice} onChange={e => setStopLossPrice(e.target.value)} /></div>
            <div className="col-span-2">
              <Checkbox checked={mtfEnabled} onCheckedChange={v => setMtfEnabled(v as boolean)} /> Enable MTF
            </div>
            {mtfEnabled && (
              <>
                <div><Label>Margin</Label><Input value={marginMultiplier} onChange={e => setMarginMultiplier(e.target.value)} /></div>
                <div><Label>MTF Target</Label><Input value={mtfTargetPrice} onChange={e => syncMtfPriceAndPercent("price", e.target.value)} /></div>
                <div><Label>MTF %</Label><Input value={mtfTargetPercent} onChange={e => syncMtfPriceAndPercent("percent", e.target.value)} /></div>
                <div><Label>Holding Days</Label><Input value={holdingPeriodDays} onChange={e => setHoldingPeriodDays(e.target.value)} /></div>
                <div><Label>Interest Rate %</Label><Input value={brokerInterestRate} onChange={e => setBrokerInterestRate(e.target.value)} /></div>
              </>
            )}
          </CardContent>
          <Button onClick={calculateAnalysis}>Analyze</Button>
        </Card>
        {result && (
          <Card className="p-6 bg-white/5 backdrop-blur border border-white/10">
            <CardHeader><CardTitle>₹ Results for {stockName}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div>Total Invested: {currency(result.totalInvested)}</div>
              <div>Total Sell: {currency(result.totalSellAmount)}</div>
              <div>Profit/Loss: {currency(result.profitLoss)} ({percent(result.profitLossPercentage)})</div>
              {result.stopLossAmount && (
                <div>Stop Loss Impact: {currency(result.stopLossAmount)} ({percent(result.stopLossPercentage!)})</div>
              )}
              {mtfEnabled && (
                <>
                  <div>Required Margin: {currency(result.requiredMargin!)}</div>
                  <div>Buying Power: {currency(result.mtfBuyingPower!)}</div>
                  <div>Interest Cost: {currency(result.interestCost!)}</div>
                  <div>MTF Net Profit: {currency(result.mtfProfitLoss!)} ({percent(result.mtfProfitLossPercentage!)})</div>
                  <div>Break Even: {result.breakEvenPrice!.toFixed(2)}</div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StockAnalyzer;
