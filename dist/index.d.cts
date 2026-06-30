import { GitClient } from '@yukiakai/actions-git';

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
    workspaceDir: string;
    targetRepository: string;
}
interface DeployContext {
    patterns: string[];
    ignore: string[];
    commitMessage: string;
    srcDir: string;
    destDir: string;
    relativeTargetDir: string;
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

interface DeployServices {
    resolver: FileResolver;
    copier: FileCopier;
}
declare class DeployServiceFactory {
    constructor();
    create(ctx: DeployContext): DeployServices;
}

declare class ArtifactDeployer {
    private git;
    private services;
    constructor(git: GitClient, services: DeployServiceFactory);
    run(ctx: DeployContext): Promise<void>;
}

declare function createArtifactDeployer(options: DeployOptions): Promise<ArtifactDeployer>;

declare const DEFAULT_IGNORE: string[];

declare function runArtifactDeploy(options: RunOptions): Promise<void>;

export { ArtifactDeployer, DEFAULT_IGNORE, type DeployContext, type DeployOptions, DeployServiceFactory, type DeployServices, FileCopier, type FileCopierOptions, FileResolver, type GitOptions, type RunOptions, createArtifactDeployer, runArtifactDeploy };
