import { Context, IPlugin, Message } from '@wechot/core';
import { got } from '@wechot/utils';

const WechotPluginCoin: IPlugin = {
  priority: 100,

  apply(context: Context) {
    const handleSearchCoinPrice = async (_message: Message, symbol: string) => {
      if (!symbol) {
        return null;
      }
      const searchSymbol = `${symbol.toUpperCase()}USDT`;
      try {
        const result = await got
          .get('https://api1.binance.com/api/v3/ticker/24hr', {
            searchParams: {
              symbol: searchSymbol,
            },
          })
          .json<any>();
        if (!result?.price) {
          return null;
        }
        const decimalLength = Math.max(2, 6 - result.price.toFixed(0).length);
        return `查询币种：${symbol.toUpperCase()}\n当前价格：$${Number(result.price).toFixed(
          decimalLength,
        )}\n24H涨幅：${Number(result.priceChangePercent).toFixed(2)}%\n`;
      } catch {
        return null;
      }
    };
    context.command.register('coin', handleSearchCoinPrice);
  },
};

export default WechotPluginCoin;
