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
  const [brokerInterestRate, setBrokerInterestRate] = useState("12"); // Annual %
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};

    if (!stockName.trim()) newErrors.stockName = "Stock name is required";
    if (!buyPrice || isNaN(Number(buyPrice)) || Number(buyPrice) <= 0) {
      newErrors.buyPrice = "Valid buy price is required";
    }
    if (!shares || isNaN(Number(shares)) || Number(shares) <= 0) {
      newErrors.shares = "Valid number of shares is required";
    }
    if (!sellPrice || isNaN(Number(sellPrice)) || Number(sellPrice) <= 0) {
      newErrors.sellPrice = "Valid sell price is required";
    }

    if (mtfEnabled) {
      if (!marginMultiplier || isNaN(Number(marginMultiplier)) || Number(marginMultiplier) <= 1) {
        newErrors.marginMultiplier = "Margin multiplier must be greater than 1";
      }
      if (!mtfTargetPrice || isNaN(Number(mtfTargetPrice)) || Number(mtfTargetPrice) <= 0) {
        newErrors.mtfTargetPrice = "Valid MTF target price is required";
      }
      if (!holdingPeriodDays || isNaN(Number(holdingPeriodDays)) || Number(holdingPeriodDays) < 1) {
        newErrors.holdingPeriodDays = "Valid holding period is required";
      }
      if (!brokerInterestRate || isNaN(Number(brokerInterestRate)) || Number(brokerInterestRate) <= 0) {
        newErrors.brokerInterestRate = "Valid broker interest rate is required";
      }
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

      // Interest cost
      const borrowedAmount = mtfBuyingPower - requiredMargin;
      const annualRate = Number(brokerInterestRate) / 100;
      const days = Number(holdingPeriodDays);
      const interestCost = borrowedAmount * annualRate * (days / 365);

      const netProfit = mtfProfitLoss - interestCost;
      const mtfProfitLossPercentage = (netProfit / requiredMargin) * 100;

      const breakEvenPrice = bp + (interestCost / mtfShares);

      analysisResult.mtfBuyingPower = mtfBuyingPower;
      analysisResult.requiredMargin = requiredMargin;
      analysisResult.mtfProfitLoss = netProfit;
      analysisResult.mtfProfitLossPercentage = mtfProfitLossPercentage;
      analysisResult.interestCost = interestCost;
      analysisResult.breakEvenPrice = breakEvenPrice;
    }

    // Stop Loss calculation
    if (stopLossPrice) {
      const sl = Number(stopLossPrice);
      const stopLossAmount = (sl - bp) * sharesNum;
      const stopLossPercentage = ((sl - bp) / bp) * 100;
      analysisResult.stopLossAmount = stopLossAmount;
      analysisResult.stopLossPercentage = stopLossPercentage;
    }

    setResult(analysisResult);
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  const formatPercentage = (p: number) => `${p.toFixed(2)}%`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-4 md:p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-bold">Stock Price Analyzer</h1>
          </div>
          <p className="text-gray-300 text-lg">Analyze your stock investments with MTF insights</p>
        </div>

        <Card className="shadow-lg bg-white/5 backdrop-blur-lg border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" /> Investment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stock details */}
              {/* Buy Price, Shares, Desired Sell Price + % */}
              {/* Stop Loss */}
              {/* MTF Block */}
              {/* MTF extra fields: target %, interest, period */}
              {/* Calculate */}
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card className="shadow-lg bg-white/5 backdrop-blur-lg border border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="h-5 w-5 font-bold">₹</span> Analysis Results for {stockName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Regular, MTF, Stop Loss results */}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StockAnalyzer;
