interface GitOptions {
    cwd: string;
    repo: string;
    branch: string;
    token: string;
}
interface FileCopierOptions {
    srcDir: string;
    destDir: string;
}
interface DeployOptions {
    token: string;
    branch: string;
    workingDir: string;
    targetRepo: string;
    srcDir: string;
    destDir: string;
}
interface DeployContext {
    patterns: string[];
    ignore: string[];
    commitMessage: string;
}
interface RunOptions {
    repo: string;
    branch: string;
    token: string;
    baseDir: string;
    targetDir: string;
    files: string[];
    commitMessage: string;
}

declare class GitClient {
    private options;
    constructor(options: GitOptions);
    private get repoUrl();
    private execGit;
    clone(): Promise<void>;
    setup(): Promise<void>;
    wipe(): Promise<void>;
    checkout(): Promise<void>;
    commit(message: string): Promise<void>;
    add(pattern: string): Promise<void>;
    push(): Promise<void>;
    hasChanges(): Promise<boolean>;
    private branchExists;
}

declare class FileResolver {
    private baseDir;
    constructor(baseDir: string);
    private normalize;
    resolve(patterns: string[], ignore: string[]): Promise<string[]>;
}

declare class FileCopier {
    private options;
    constructor(options: FileCopierOptions);
    copy(files: string[]): Promise<void>;
}

declare class ArtifactDeployer {
    private git;
    private resolver;
    private copier;
    constructor(git: GitClient, resolver: FileResolver, copier: FileCopier);
    run(ctx: DeployContext): Promise<void>;
}

declare function createArtifactDeployer(options: DeployOptions): Promise<ArtifactDeployer>;

declare const DEFAULT_IGNORE: string[];

declare function runArtifactDeploy(options: RunOptions): Promise<void>;

declare function safeJoin(base: string, target: string): string;

export { ArtifactDeployer, DEFAULT_IGNORE, type DeployContext, type DeployOptions, FileCopier, type FileCopierOptions, FileResolver, GitClient, type GitOptions, type RunOptions, createArtifactDeployer, runArtifactDeploy, safeJoin };
