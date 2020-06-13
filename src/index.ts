import { remove, isEqual, find } from 'lodash-es';

const last = (arr: any[]) => arr[arr.length - 1];

export type AsyncSingletonOption = {
  trailing?: boolean,
  slice?: [number, number],
};

type Queue = { resolve: (val: any) => any, args: any[] }[];

export default function singletonAsync<T extends (...args: any[]) => Promise<any>>(func: T, { trailing, slice }: AsyncSingletonOption = {}): T {
  if (typeof func !== 'function') throw new Error('argument is not function.');
  const contexts: { args: any[], queue: Queue }[] = [];
  const slicer: (args: any[]) => any[] = slice ? v => v.slice(slice[0], slice[1]) : v => v;
  return function (this: any, ...args: any[]) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      // コンテキストを用意
      let context = find(contexts, v => isEqual(slicer(args), slicer(v.args)));
      const running = context !== undefined;
      if (context === undefined) {
        context = { args, queue: [] };
        contexts.push(context);
      }

      if (running) return context.queue.push({ resolve, args });
      let result = await func.call(this, ...args);
      resolve(result);
      if (context.queue.length > 0) {
        if (trailing) {
          const { args } = last(context.queue);
          result = await func.call(this, ...args);
        }
        context.queue.forEach(({ resolve }) => resolve(result));
        context.queue = [];
      }

      // コンテキストを削除
      remove(contexts, v => isEqual(slicer(args), slicer(v.args)));
    });
  } as T;
}
