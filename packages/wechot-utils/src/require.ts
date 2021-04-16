import path from 'path';

export const safeRequire = (id: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(id);
  } catch (e) {
    return null;
  }
};

export const requireDefault = (id: string) => {
  const module = safeRequire(id);
  return module?.__esModule ? module.default : module;
};

export const requireConfigFile = () => {
  try {
    const configFilePath = path.resolve(process.cwd(), 'wechot.config.js');
    return requireDefault(configFilePath);
  } catch {
    return {};
  }
};
