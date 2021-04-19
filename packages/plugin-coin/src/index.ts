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
          .get('https://api1.binance.com/api/v3/ticker/price', {
            searchParams: {
              symbol: searchSymbol,
            },
          })
          .json<any>();
        if (!result?.price) {
          return null;
        }
        return `查询币种：${symbol.toUpperCase()}\n当前价格：${Number(result.price).toFixed(2)}`;
      } catch {
        return null;
      }
    };
    context.command.register('coin', handleSearchCoinPrice);
  },
};

export default WechotPluginCoin;
