'use strict';
const Controller = require('../core/controller.js');
const mime = require('mime');
const _path = require('path');

const Repo = class extends Controller {
    async getTree() {
        const repo = await this.getRepoAndEnsureReadable();
        const { folderPath, recursive, commitId, ref } = this.getParams();
        const result = await this.service.repo.getFolderFiles(
            repo.path,
            folderPath,
            recursive,
            commitId,
            ref
        );
        return this.success(result);
    }

    async download() {
        const repo = await this.getRepoAndEnsureReadable();
        const { ref } = this.getParams();
        const result = await this.service.repo.downloadRepo(repo.path, ref);
        return this.success(result);
    }

    async getCommitInfo() {
        const repo = await this.getRepoAndEnsureReadable();
        const { commitId, ref } = this.getParams();
        const result = await this.service.repo.getCommitInfo(
            repo.path,
            commitId,
            ref
        );
        return this.success(result);
    }

    async getFileInfo() {
        const repo = await this.getRepoAndEnsureReadable();
        const { filePath, commitId } = this.getParams();
        const result = await this.service.repo.getFileInfo(
            repo.path,
            filePath,
            commitId
        );
        return this.success(result);
    }

    async getFileData() {
        const repo = await this.getRepoAndEnsureReadable();
        const { filePath, commitId } = this.getParams();
        const result = await this.service.repo.getFileData(
            repo.path,
            filePath,
            commitId
        );
        return this.success(result);
    }

    async getFileRaw() {
        const { ctx } = this;
        const repo = await this.getRepoAndEnsureReadable();
        const { filePath, commitId } = this.getParams();
        const result = await this.service.repo.getFileRaw(
            repo.path,
            filePath,
            commitId
        );
        const filename = _path.basename(filePath);
        const mimeType = mime.getType(filename);
        ctx.set('Content-Disposition', `attachment; filename=${filename}`);
        ctx.set('Content-Description', 'File Transfer');
        ctx.set('Content-Transfer-Encoding', 'binary');
        ctx.set('Content-Type', 'application/octet-stream');
        if (mimeType) {
            ctx.set('Content-Type', mimeType);
            if (mimeType.match('image') || mimeType.match('text')) {
                ctx.set('Content-Disposition', `inline; filename=${filename}`);
            }
        }
        return this.success(result);
    }

    async getFileHistory() {
        const repo = await this.getRepoAndEnsureWritable();
        const { filePath, commitId } = this.getParams();
        const result = await this.service.repo.getFileHistory(
            repo.path,
            filePath,
            commitId
        );
        return this.success(result);
    }

    async upsertBinaryFile() {
        const repo = await this.getRepoAndEnsureWritable();
        const { ctx } = this;
        const { filePath, encoding } = this.getParams();
        const committer = this.getUser().username;
        if (ctx.header['content-type'] === 'application/octet-stream') {
            const streamData = ctx.req;
            const result = await ctx.service.repo.upsertBinaryFile(streamData, {
                repo,
                filePath,
                encoding,
                committer,
            });
            return this.success(result);
        }
        ctx.throw('Content type must be application/octet-stream');
    }

    async createFile() {
        const repo = await this.getRepoAndEnsureWritable();
        const { filePath, content, encoding } = this.getParams();
        const committer = this.getUser().username;
        const result = await this.service.repo.createFile(
            repo,
            filePath,
            content,
            encoding,
            committer
        );
        return this.success(result);
    }

    async updateFile() {
        const repo = await this.getRepoAndEnsureWritable();
        const { filePath, content, encoding } = this.getParams();
        const committer = this.getUser().username;
        const result = await this.service.repo.updateFile(
            repo,
            filePath,
            content,
            encoding,
            committer
        );
        return this.success(result);
    }

    async deleteFile() {
        const repo = await this.getRepoAndEnsureWritable();
        const { filePath } = this.getParams();
        const committer = this.getUser().username;
        const result = await this.service.repo.deleteFile(
            repo,
            filePath,
            committer
        );
        return this.success(result);
    }

    async renameFile() {
        const repo = await this.getRepoAndEnsureWritable();
        const { filePath, newFilePath } = this.getParams();
        const committer = this.getUser().username;
        const result = await this.service.repo.moveFile(
            repo,
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
        const result = await this.service.repo.createFolder(
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
        const result = await this.service.repo.deleteFolder(
            repo,
            folderPath,
            committer
        );
        return this.success(result);
    }

    async renameFolder() {
        const repo = await this.getRepoAndEnsureWritable();
        const { folderPath, newFolderPath } = this.getParams();
        const committer = this.getUser().username;
        const result = await this.service.repo.moveFolder(
            repo,
            folderPath,
            newFolderPath,
            committer
        );
        return this.success(result);
    }

    async getRepoAndEnsureReadable() {
        const { ctx, service } = this;
        const { repoPath } = this.getParams();
        const repo = await ctx.model.Repo.findOne({
            where: { path: repoPath },
        });
        if (!repo) ctx.throw(`invalid repo ${repoPath}`, 404);
        if (this.getAdmin().userId) return repo; // admin can do anything
        const canRead = await service.repo.canReadByUser(
            repo,
            this.getUser().userId
        );
        if (!canRead) ctx.throw('no permission to view the repo data', 403);
        return repo;
    }

    async getRepoAndEnsureWritable() {
        const { ctx, service } = this;
        const { repoPath } = this.getParams();
        const repo = await ctx.model.Repo.findOne({
            where: { path: repoPath },
        });
        if (!repo) ctx.throw(`invalid repo ${repoPath}`, 404);
        if (this.getAdmin().userId) return repo; // admin can do anything
        const canWrite = await service.repo.canWriteByUser(
            repo,
            this.getUser().userId
        );
        if (!canWrite) ctx.throw('no permission to edit the repo', 403);
        return repo;
    }
};

module.exports = Repo;
