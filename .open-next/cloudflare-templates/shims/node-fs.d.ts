export declare const nodeFs: {
    existsSync: typeof existsSync;
    readFile: typeof readFile;
    readFileSync: typeof readFileSync;
    writeFile: typeof writeFile;
    mkdir: typeof mkdir;
    stat: typeof stat;
};
declare function existsSync(path: string): boolean;
declare function readFile(path: string, options: unknown): Promise<unknown>;
declare function readFileSync(path: string, options: unknown): unknown;
declare function writeFile(file: string, data: unknown): Promise<boolean>;
declare function mkdir(dir: string): Promise<void>;
declare function stat(file: string): Promise<{
    mtime: Date;
}>;
export {};
