'use strict';
const Controller = require('../core/controller.js');

const Repo = class extends Controller {
    async getTree() {
        const repo = await this.getRepoAndEnsureReadable();
        const { folderPath, recursive } = this.getParams();
        const result = await this.service.git.getFolderFiles(
            repo.path,
            folderPath,
            recursive
        );
        return this.success(result);
    }

    async download() {
        const repo = await this.getRepoAndEnsureReadable();
        const { ref } = this.getParams();
        const result = await this.service.git.downloadRepo(repo.path, ref);
        return this.success(result);
    }

    async getFileInfo() {
        const repo = await this.getRepoAndEnsureReadable();
        const { filePath, commitId } = this.getParams();
        const result = await this.service.git.getFileInfo(
            repo.path,
            filePath,
            commitId
        );
        return this.success(result);
    }

    async getFileRaw() {
        const repo = await this.getRepoAndEnsureReadable();
        const { filePath, commitId } = this.getParams();
        const result = await this.service.git.getFileRaw(
            repo.path,
            filePath,
            commitId
        );
        return this.success(result);
    }

    async getFileHistory() {
        const repo = await this.getRepoAndEnsureWritable();
        const { filePath, commitId } = this.getParams();
        const result = await this.service.git.getFileHistory(
            repo.path,
            filePath,
            commitId
        );
        return this.success(result);
    }

    async upsertFile() {
        const repo = await this.getRepoAndEnsureWritable();
        const { filePath, content } = this.getParams();
        const committer = this.getUser().username;
        const result = await this.service.git.upsertFile(
            repo.path,
            filePath,
            content,
            committer
        );
        return this.success(result);
    }

    async deleteFile() {
        const repo = await this.getRepoAndEnsureWritable();
        const { filePath } = this.getParams();
        const committer = this.getUser().username;
        const result = await this.service.git.deleteFile(
            repo.path,
            filePath,
            committer
        );
        return this.success(result);
    }

    async renameFile() {
        const { ctx, service } = this;
        const repo = await this.getRepoAndEnsureWritable();
        const { filePath, newFilePath } = this.getParams();
        if (!newFilePath) ctx.throw('invalid new file path', 400);
        const committer = this.getUser().username;
        const result = await service.git.moveFile(
            repo.path,
            filePath,
            newFilePath,
            committer
        );
        return this.success(result);
    }

    async createFolder() {
        const repo = await this.getRepoAndEnsureWritable();
        const { folderPath } = this.getParams();
        const committer = this.getUser().username;
        const result = await this.service.git.createFolder(
            repo.path,
            folderPath,
            committer
        );
        return this.success(result);
    }

    async deleteFolder() {
        const repo = await this.getRepoAndEnsureWritable();
        const { folderPath } = this.getParams();
        const committer = this.getUser().username;
        const result = await this.service.git.deleteFolder(
            repo.path,
            folderPath,
            committer
        );
        return this.success(result);
    }

    async renameFolder() {
        const { ctx, service } = this;
        const repo = await this.getRepoAndEnsureWritable();
        const { folderPath, newFolderPath } = this.getParams();
        if (!newFolderPath) ctx.throw('invalid new folder path', 400);
        const committer = this.getUser().username;
        const result = await service.git.moveFolder(
            repo.path,
            folderPath,
            newFolderPath,
            committer
        );
        return this.success(result);
    }

    async getRepoAndEnsureReadable() {
        this.authenticated();
        const { ctx, service } = this;
        const { repoPath } = this.getParams();
        const repo = await ctx.model.Repo.findOne({
            where: { path: repoPath },
        });
        if (!repo) ctx.throw(`invalid repo ${repoPath}`, 404);
        const canRead = await service.repo.canReadByUser(
            repo,
            this.getUser().userId
        );
        if (!canRead) ctx.throw('no permission to view the repo data', 403);
        return repo;
    }

    async getRepoAndEnsureWritable() {
        this.authenticated();
        const { ctx, service } = this;
        const { repoPath } = this.getParams();
        const repo = await ctx.model.Repo.findOne({
            where: { path: repoPath },
        });
        if (!repo) ctx.throw(`invalid repo ${repoPath}`, 404);
        const canWrite = await service.repo.canWriteByUser(
            repo,
            this.getUser().userId
        );
        if (!canWrite) ctx.throw('no permission to edit the repo', 403);
        return repo;
    }
};

module.exports = Repo;
