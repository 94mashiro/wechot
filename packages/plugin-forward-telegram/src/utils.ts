import { IForwardType } from './index';

export const findTargetForward = (forwardSet: IForwardType[], filter: Partial<IForwardType>): IForwardType | null => {
  try {
    forwardSet.forEach((item) => {
      const { wechat, telegram } = item;
      const { telegram: searchTelegram, wechat: searchWechat } = filter;
      if (searchTelegram && searchWechat && wechat === searchWechat && telegram === searchTelegram) {
        throw item;
      }
      if (searchWechat && searchWechat === wechat) {
        throw item;
      }
      if (searchTelegram && searchTelegram === telegram) {
        throw item;
      }
    });
    return null;
  } catch (forward) {
    return forward;
  }
};
