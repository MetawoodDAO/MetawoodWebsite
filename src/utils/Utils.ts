export function isError(err: any): err is Error {
    return err instanceof Error || err.message !== undefined;
}

export function mergeArrays<T>(arr1?: T[], arr2?: T[]): T[] {
    // Returns a new array, leaving the source arrays unmodified
    const ret: T[] = [];
    (arr1 ?? []).forEach(elem => { ret.push(elem); });
    (arr2 ?? []).forEach(elem => { ret.push(elem); });
    return ret;
}

/*
    Please direct all complaints about mixins to this:
    https://www.typescriptlang.org/docs/handbook/mixins.html

    This one is specifically TYPED
 */
// export type Constructor<T = {}> = new (...args: any[]) => T;
