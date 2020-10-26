import { remove, isEqual, find } from 'lodash-es';

const last = (arr: any[]) => arr[arr.length - 1];

export type AsyncSingletonOption = {
  trailing?: boolean,
  slice?: [number, number],
};

type QueueItem = { resolve: (val: any) => any, reject: (val: any) => any, args: any[] }
type Queue = QueueItem[];

export default function singletonAsync<T extends (...args: any[]) => Promise<any>>(func: T, { trailing, slice }: AsyncSingletonOption = {}): T {
  if (typeof func !== 'function') throw new Error('argument is not function.');
  const contexts: { args: any[], queue: Queue }[] = [];
  const slicer: (args: any[]) => any[] = slice ? v => v.slice(slice[0], slice[1]) : v => v;
  return function (this: any, ...args: any[]) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      // コンテキストを用意
      let context = find(contexts, (v: any) => isEqual(slicer(args), slicer(v.args)));
      const running = context !== undefined;
      if (context === undefined) {
        context = { args, queue: [] };
        contexts.push(context);
      }

      if (running) return context.queue.push({ resolve, reject, args });
      let result: any
      let errorResult: any
      try {
        result = await func.call(this, ...args);
        resolve(result);
      } catch (e) {
        errorResult = e
        reject(errorResult)
      }
      if (context.queue.length > 0) {
        if (trailing) {
          const { args } = last(context.queue);
          try {
            result = await func.call(this, ...args);
          } catch (e) {
            errorResult = e
          }
        }
        context.queue.forEach(({ resolve, reject }: QueueItem) => {
          if (errorResult) return reject(errorResult)
          return resolve(result)
        });
        context.queue = [];
      }

      // コンテキストを削除
      remove(contexts, (v: any) => isEqual(slicer(args), slicer(v.args)));
    });
  } as T;
}
