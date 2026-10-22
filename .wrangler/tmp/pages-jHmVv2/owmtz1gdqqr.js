// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: ["/api/*", "/sitemap.xml", "/robots.txt"],
  exclude: []
};

// ../node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "C:\\Users\\HomePC\\Desktop\\chuech studio\\cms\\.wrangler\\tmp\\pages-jHmVv2\\functionsWorker-0.8979755335636368.mjs";
import { isRoutingRuleMatch } from "C:\\Users\\HomePC\\Desktop\\chuech studio\\cms\\node_modules\\wrangler\\templates\\pages-dev-util.ts";
export * from "C:\\Users\\HomePC\\Desktop\\chuech studio\\cms\\.wrangler\\tmp\\pages-jHmVv2\\functionsWorker-0.8979755335636368.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=owmtz1gdqqr.js.map
