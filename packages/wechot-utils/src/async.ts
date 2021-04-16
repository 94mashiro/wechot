// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export async function runAsyncFns(fns: Array<(...args: any[]) => Promise<any> | void>, ...args: any[]) {
  return fns.reduce((promise, fn) => promise.then(() => fn(...args)), Promise.resolve());
}
