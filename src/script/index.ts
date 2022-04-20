class ProfitMaximiser {
	
	log = (x: number) => {
		return Math.log(x) / Math.log(10);
	};

	calculateTax (traderPrice: number, askingPrice: number, traderCoefficient: number, quantity: number = 1, intelCenter: number = 1, hideoutManagement: number = 0) {
		const basePrice = traderPrice / traderCoefficient;
		const baseHigher = basePrice > askingPrice;
		let tax = (
			( basePrice * quantity * 0.09 * Math.pow(4, Math.pow((this.log((quantity * basePrice) / (quantity * askingPrice))), (baseHigher ? 1.08 : 1.00))) * quantity )
				+ 
			( askingPrice * quantity * 0.05 * Math.pow(4, Math.pow((this.log((quantity * askingPrice) / (quantity * basePrice))), (baseHigher ? 1.00 : 1.08))) * quantity )
		);
		return Math.ceil(tax * (1 - (intelCenter === 3 ? (0.3 + 0.003*hideoutManagement) : 0)));
	}

	async calculateMaxProfit(traderPrice: number, traderCoefficient: number, quantity: number = 1, intelCenter: number = 1, hideoutManagement: number = 0, maxPrice: number = 1000000) {
		const profits: number[][] = [];
		const res = await new Promise<number[]>(resolve => {
			for(let x = 1; x < maxPrice + 1; x++) {
				const fee = this.calculateTax(traderPrice, x, traderCoefficient, quantity, intelCenter, hideoutManagement);
				const profit = (quantity * x) - fee;
				if(profit > 0) {
					if(!profits[x-1]) {
						profits.push([profit, x]);
						continue;
					}
					if(profit >= profits[x-1][0]) {
						profits.push([profit, x]);
					} else {
						break;
					}
				}
			}
			const onlyProfitables = profits.filter(p => p[0] > 0);
			const profitableProfits = onlyProfitables.map(p => {
				return p[0];
			});
			const mostProfit = profitableProfits.reduce((a, b) => {
				return Math.max(a, b);
			});

			const index = profits.findIndex(p => p[0] === mostProfit);
			const bestFee = profits[index][1];

			resolve([mostProfit, bestFee]);
		});
		return res;
	}

}

const profitMaximiser = new ProfitMaximiser();