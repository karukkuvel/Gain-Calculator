import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calculator, DollarSign } from "lucide-react";

interface AnalysisResult {
  totalInvested: number;
  totalSellAmount: number;
  profitLoss: number;
  profitLossPercentage: number;
  mtfBuyingPower?: number;
  mtfProfitLoss?: number;
  mtfProfitLossPercentage?: number;
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAnalysis = () => {
    if (!validateInputs()) return;

    const buyPriceNum = Number(buyPrice);
    const sharesNum = Number(shares);
    const sellPriceNum = Number(sellPrice);
    const totalInvested = buyPriceNum * sharesNum;
    const totalSellAmount = sellPriceNum * sharesNum;
    const profitLoss = totalSellAmount - totalInvested;
    const profitLossPercentage = (profitLoss / totalInvested) * 100;

    const analysisResult: AnalysisResult = {
      totalInvested,
      totalSellAmount,
      profitLoss,
      profitLossPercentage,
    };

    if (mtfEnabled) {
      const marginMultiplierNum = Number(marginMultiplier);
      const mtfTargetPriceNum = Number(mtfTargetPrice);
      const mtfBuyingPower = totalInvested * marginMultiplierNum;
      const mtfShares = mtfBuyingPower / buyPriceNum;
      const mtfSellAmount = mtfShares * mtfTargetPriceNum;
      const mtfProfitLoss = mtfSellAmount - mtfBuyingPower;
      const mtfProfitLossPercentage = (mtfProfitLoss / totalInvested) * 100;

      analysisResult.mtfBuyingPower = mtfBuyingPower;
      analysisResult.mtfProfitLoss = mtfProfitLoss;
      analysisResult.mtfProfitLossPercentage = mtfProfitLossPercentage;
    }

    setResult(analysisResult);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Stock Price Analyzer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Analyze your stock investments and explore margin trading opportunities
          </p>
        </div>

        {/* Main Input Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Investment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="stockName">Stock Name</Label>
                <Input
                  id="stockName"
                  placeholder="e.g., RELIANCE, TCS, INFY, HDFC"
                  value={stockName}
                  onChange={(e) => setStockName(e.target.value)}
                  className={errors.stockName ? "border-destructive" : ""}
                />
                {errors.stockName && (
                  <p className="text-sm text-destructive">{errors.stockName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyPrice">Buy Price (₹)</Label>
                <Input
                  id="buyPrice"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2500.00"
                  value={buyPrice}
                  onChange={(e) => {
                    setBuyPrice(e.target.value);
                    if (sellPricePercent) {
                      // Recalculate Sell Price if % exists
                      const bp = Number(e.target.value);
                      const percent = Number(sellPricePercent);
                      if (bp > 0 && percent) {
                        const sp = bp * (1 + percent / 100);
                        setSellPrice(sp.toFixed(2));
                      } else {
                        setSellPrice("");
                      }
                    }
                  }}
                  className={errors.buyPrice ? "border-destructive" : ""}
                />
                {errors.buyPrice && (
                  <p className="text-sm text-destructive">{errors.buyPrice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shares">Number of Shares</Label>
                <Input
                  id="shares"
                  type="number"
                  placeholder="e.g., 100"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  className={errors.shares ? "border-destructive" : ""}
                />
                {errors.shares && (
                  <p className="text-sm text-destructive">{errors.shares}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellPrice">Desired Sell Price (₹)</Label>
                <Input
                  id="sellPrice"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2800.00"
                  value={sellPrice}
                  onChange={(e) => {
                    const newSellPrice = e.target.value;
                    setSellPrice(newSellPrice);

                    const bp = Number(buyPrice);
                    const sp = Number(newSellPrice);

                    if (bp > 0 && sp > 0) {
                      const percent = ((sp - bp) / bp) * 100;
                      setSellPricePercent(percent.toFixed(2));
                    } else {
                      setSellPricePercent("");
                    }
                  }}
                  className={errors.sellPrice ? "border-destructive" : ""}
                />
                {errors.sellPrice && (
                  <p className="text-sm text-destructive">{errors.sellPrice}</p>
                )}

                <Label htmlFor="sellPricePercent" className="mt-2 block">
                  Expected % Change
                </Label>
                <Input
                  id="sellPricePercent"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2.5"
                  value={sellPricePercent}
                  onChange={(e) => {
                    const percent = e.target.value;
                    setSellPricePercent(percent);

                    const bp = Number(buyPrice);
                    if (bp > 0 && percent !== "") {
                      const newSP = bp * (1 + Number(percent) / 100);
                      setSellPrice(newSP.toFixed(2));
                    }
                  }}
                />
              </div>
            </div>

            {/* MTF Section */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="mtfEnabled"
                  checked={mtfEnabled}
                  onCheckedChange={(checked) => setMtfEnabled(checked as boolean)}
                />
                <Label htmlFor="mtfEnabled" className="font-medium">
                  Enable MTF (Margin Trading Facility)
                </Label>
              </div>

              {mtfEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="marginMultiplier">Broker's Margin Multiplier</Label>
                    <Input
                      id="marginMultiplier"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 2.5"
                      value={marginMultiplier}
                      onChange={(e) => setMarginMultiplier(e.target.value)}
                      className={errors.marginMultiplier ? "border-destructive" : ""}
                    />
                    {errors.marginMultiplier && (
                      <p className="text-sm text-destructive">{errors.marginMultiplier}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mtfTargetPrice">Expected Target Price with Margin (₹)</Label>
                    <Input
                      id="mtfTargetPrice"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 3000.00"
                      value={mtfTargetPrice}
                      onChange={(e) => setMtfTargetPrice(e.target.value)}
                      className={errors.mtfTargetPrice ? "border-destructive" : ""}
                    />
                    {errors.mtfTargetPrice && (
                      <p className="text-sm text-destructive">{errors.mtfTargetPrice}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={calculateAnalysis} className="w-full" size="lg">
              <Calculator className="mr-2 h-4 w-4" />
              Analyze Investment
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Analysis Results for {stockName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Regular Investment Results */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Regular Investment</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">Total Invested</span>
                      <span className="font-semibold">{formatCurrency(result.totalInvested)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">Total Sell Amount</span>
                      <span className="font-semibold">{formatCurrency(result.totalSellAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">Profit/Loss</span>
                      <div className="text-right">
                        <Badge
                          variant={result.profitLoss >= 0 ? "default" : "destructive"}
                          className={result.profitLoss >= 0 ? "bg-success text-success-foreground" : ""}
                        >
                          {formatCurrency(result.profitLoss)}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatPercentage(result.profitLossPercentage)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MTF Results */}
                {mtfEnabled && result.mtfBuyingPower && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">MTF Investment</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-muted-foreground">Total Buying Power</span>
                        <span className="font-semibold">{formatCurrency(result.mtfBuyingPower)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-muted-foreground">MTF Profit/Loss</span>
                        <div className="text-right">
                          <Badge
                            variant={result.mtfProfitLoss! >= 0 ? "default" : "destructive"}
                            className={result.mtfProfitLoss! >= 0 ? "bg-success text-success-foreground" : ""}
                          >
                            {formatCurrency(result.mtfProfitLoss!)}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatPercentage(result.mtfProfitLossPercentage!)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                        * MTF percentage is calculated on your initial investment amount
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StockAnalyzer;
