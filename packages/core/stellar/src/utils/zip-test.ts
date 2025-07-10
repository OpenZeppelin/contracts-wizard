import type { JSZipObject } from 'jszip';
import type JSZip from 'jszip';
import type { ExecutionContext } from 'ava';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const getItemString =
  ({ files }: JSZip) =>
  async (key: string) => {
    const obj = files[key];
    if (obj === undefined) throw Error(`Item ${key} not found in zip`);
    return await asString(obj);
  };

export const asString = async (item: JSZipObject) => Buffer.from(await item.async('arraybuffer')).toString();

export const snapshotZipContents = async (test: ExecutionContext, zip: JSZip, contentsPathToAsserts: string[]) => {
  const itemStrings = await Promise.all(contentsPathToAsserts.map(getItemString(zip)));
  test.snapshot(itemStrings);
};

export const assertLayout = (test: ExecutionContext, zip: JSZip, expectedLayout: string[]) =>
  test.deepEqual(
    Object.values(zip.files)
      .map(f => f.name)
      .sort(),
    expectedLayout.sort(),
  );

export const expandPathsFromFilesPaths = (filePaths: string[]): string[] =>
  Array.from(
    new Set(
      filePaths.flatMap((filePath: string) => {
        const parts = filePath.split('/');

        if (parts.length === 1) return [filePath];

        const folders = parts.slice(0, -1).map((_, idx) => parts.slice(0, idx + 1).join('/') + '/');

        return [...folders, filePath];
      }),
    ),
  ).sort();

export const extractPackage = async (zip: JSZip, folderPath: string) => {
  const items = Object.values(Object.values(zip.files));

  for (const item of items) {
    if (item.dir) {
      await mkdir(join(folderPath, item.name));
    } else {
      await writeFile(join(folderPath, item.name), await asString(item));
    }
  }
};
