const LinkClickRepository = require('./LinkClickRepository');
const PostLinkRepository = require('./PostLinkRepository');
const errors = require('@tryghost/errors');

class LinkTrackingServiceWrapper {
    async init() {
        if (this.service) {
            // Already done
            return;
        }

        const linkRedirection = require('../link-redirection');
        if (!linkRedirection.service) {
            throw new errors.InternalServerError({message: 'LinkRedirectionService should be initialised before LinkTrackingService'});
        }

        // Wire up all the dependencies
        const models = require('../../models');
        const {MemberLinkClickEvent} = require('@tryghost/member-events');
        const DomainEvents = require('@tryghost/domain-events');

        const {LinkClickTrackingService} = require('@tryghost/link-tracking');

        const postLinkRepository = new PostLinkRepository({
            LinkRedirect: models.LinkRedirect,
            linkRedirectRepository: linkRedirection.linkRedirectRepository
        });

        this.linkClickRepository = new LinkClickRepository({
            MemberLinkClickEventModel: models.MemberLinkClickEvent,
            Member: models.Member,
            MemberLinkClickEvent: MemberLinkClickEvent,
            DomainEvents
        });

        // Expose the service
        this.service = new LinkClickTrackingService({
            linkRedirectService: linkRedirection.service,
            linkClickRepository: this.linkClickRepository,
            postLinkRepository,
            DomainEvents
        });

        await this.service.init();
    }
}

module.exports = new LinkTrackingServiceWrapper();
