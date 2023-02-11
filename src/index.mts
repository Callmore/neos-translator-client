import { Router } from "express";
import { absolutePath } from "./pathUtils.mjs";

export function createTranslatorRouter(rootPath: string) {
    const router = Router();

    const staticPaths: Readonly<Record<string, string>> = {
        "/translator": "translatorPage/index.html",
        "/styles.css": "translatorPage/styles.css",
        "/index.js": "translatorPage/index.js",
        "/res/chrome.png": "translatorPage/res/chrome.png",
        "/res/edge.png": "translatorPage/res/edge.png",

        "/translator/howto": "howto/index.html",
        "/translator/res/new-project.png": "howto/res/new-project.png",
        "/translator/res/blank-project.png": "howto/res/blank-project.png",
        "/translator/res/deploy-project.png": "howto/res/deploy-project.png",
        "/translator/res/deploy-type.png": "howto/res/deploy-type.png",
        "/translator/res/deploy-config.png": "howto/res/deploy-config.png",
    };

    router.use("/", (req, res, next) => {
        if (Object.hasOwn(staticPaths, req.path)) {
            res.sendFile(staticPaths[req.path], { root: rootPath });
            return;
        }

        next();
    });

    return router;
}
