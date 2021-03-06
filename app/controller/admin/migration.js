'use strict';

const Controller = require('../../core/controller.js');
const _path = require('path');

const Migration = class extends Controller {
    async fixAllBoardFiles() {
        this.adminAuthenticated();

        const { ctx, service } = this;
        const pace = 10;
        let step = 0;
        const total = await ctx.model.Site.count();

        while (step < total) {
            const sites = await ctx.model.Site.findAll({
                where: {
                    visibility: 0,
                },
                offset: step,
                limit: pace,
            });
            try {
                await Promise.all(
                    sites.map(site => {
                        return service.es.fixBoardAndSync(site);
                    })
                );
            } catch (e) {
                ctx.logger.error(e);
            }
            step = step + pace;
        }
        ctx.body = 'success';
    }

    async fixSiteBoardFiles() {
        this.adminAuthenticated();

        const { ctx, service } = this;
        const { siteId } = ctx.getParams();
        const site = await ctx.model.sites.findOne({ where: { id: siteId } });
        await service.es.fixBoardAndSync(site);
        ctx.body = 'success';
    }

    async fixWorldArchiveUrl() {
        this.adminAuthenticated();

        const { ctx, app } = this;
        const conf = app.config.self;
        const pace = 1000;
        let step = 0;
        const total = await ctx.model.World.count();
        while (step < total) {
            const worlds = await ctx.model.World.findAll({
                offset: step,
                limit: pace,
            });
            const transaction = await ctx.model.transaction();
            try {
                await Promise.all(
                    worlds.map(world => {
                        const fixArchive = async () => {
                            const repo = await ctx.model.repos.findOne({
                                where: {
                                    resourceType: 'World',
                                    resourceId: world.id,
                                },
                                transaction,
                            });
                            if (!repo) return;
                            let archiveUrl =
                                conf.origin +
                                _path.join(
                                    conf.baseUrl,
                                    'repos',
                                    encodeURIComponent(repo.path),
                                    'archive.zip'
                                );
                            if (world.commitId !== 'master') {
                                archiveUrl += `?ref=${world.commitId}`;
                            }
                            await ctx.model.worlds.update(
                                { archiveUrl },
                                {
                                    where: { id: world.id },
                                    silent: true,
                                    transaction,
                                }
                            );
                        };
                        return fixArchive();
                    })
                );
                await transaction.commit();
            } catch (e) {
                ctx.logger.error(e);
                await transaction.rollback();
            }
            step = step + pace;
        }
        ctx.body = 'success' + total;
    }
    async generateSiteRepo() {
        this.adminAuthenticated();

        const { ctx, service } = this;
        const pace = 1000;
        let step = 0;
        const total = await ctx.model.Site.count();
        while (step < total) {
            const sites = await ctx.model.Site.findAll({
                offset: step,
                limit: pace,
            });
            const transaction = await ctx.model.transaction();
            try {
                await Promise.all(
                    sites.map(site => {
                        return service.repo.generateFromSite(site, transaction);
                    })
                );
                await transaction.commit();
            } catch (e) {
                ctx.logger.error(e);
                await transaction.rollback();
            }
            step = step + pace;
        }
        ctx.body = 'success';
    }

    async generateWorldRepo() {
        this.adminAuthenticated();

        const { ctx, service } = this;
        const pace = 1000;
        let step = 0;
        const total = await ctx.model.World.count();
        while (step < total) {
            const worlds = await ctx.model.World.findAll({
                offset: step,
                limit: pace,
            });
            const transaction = await ctx.model.transaction();
            try {
                await Promise.all(
                    worlds.map(world => {
                        return service.repo.generateFromWorld(
                            world,
                            transaction
                        );
                    })
                );
                await transaction.commit();
            } catch (e) {
                ctx.logger.error(e);
                await transaction.rollback();
            }
            step = step + pace;
        }
        ctx.body = 'success';
    }

    async syncRepo() {
        this.adminAuthenticated();

        const { ctx, service } = this;
        const pace = 10;
        let step = 0;
        const total = await ctx.model.Repo.count({
            where: { synced: 0 },
        });
        ctx.logger.info('Begin to sync repos, total amount is ', total);
        while (step < total) {
            const repos = await ctx.model.Repo.findAll({
                where: {
                    synced: 0,
                },
                offset: step,
                limit: pace,
            });
            await Promise.all(
                repos.map(repo => {
                    return service.repo.syncIfExist(repo);
                })
            );
            step = step + pace;
        }
        ctx.logger.info('Finish to sync repos!');
        ctx.body = 'success' + total;
    }

    async esRebuildPage() {
        this.adminAuthenticated();

        const { ctx, service, app } = this;
        const pace = 10;
        let step = 0;
        const total = await ctx.model.Site.count();

        await app.api.es.clearIndexData({ index: 'page' });

        while (step < total) {
            const sites = await ctx.model.Site.findAll({
                where: {
                    visibility: 0,
                },
                offset: step,
                limit: pace,
            });
            try {
                await Promise.all(
                    sites.map(site => {
                        return service.es.syncSitePages(site);
                    })
                );
            } catch (e) {
                ctx.logger.error(e);
            }
            step = step + pace;
        }
        ctx.body = 'success';
    }

    async esRebuildUser() {
        this.adminAuthenticated();

        const { ctx, service, app } = this;
        const pace = 100;
        let step = 0;
        const total = await ctx.model.User.count();

        await app.api.es.clearIndexData({ index: 'user' });

        while (step < total) {
            const users = await ctx.model.User.findAll({
                offset: step,
                limit: pace,
            });
            try {
                await service.es.syncUsers(users);
            } catch (e) {
                ctx.logger.error(e);
            }
            step = step + pace;
        }
        ctx.body = 'success';
    }

    async esRebuildProject() {
        this.adminAuthenticated();

        const { ctx, app } = this;
        const pace = 100;
        let step = 0;
        const total = await ctx.model.Project.count();

        await app.api.es.clearIndexData({ index: 'project' });

        while (step < total) {
            const projects = await ctx.model.Project.findAll({
                offset: step,
                limit: pace,
            });
            try {
                await Promise.all(
                    projects.map(project => {
                        return app.api.es.upsertProject(project);
                    })
                );
            } catch (e) {
                ctx.logger.error(e);
            }
            step = step + pace;
        }
        ctx.body = 'success';
    }
};

module.exports = Migration;
