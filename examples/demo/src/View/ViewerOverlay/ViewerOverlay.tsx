import React, { useEffect } from 'react';
import { angular } from '../Player/angular';
import { ClicksManager } from '../test/ClicksManager';

var clicksManager = new ClicksManager();

var f;
var g;
var h;

export const ViewerOverlay = ({ width, height, scale, ...other }) => {
    const setCursorPosition = a => {
        a && h.css({ left: a.left, top: a.top });
    };

    useEffect(() => {
        f = angular.element('.click-elements-overlay');
        g = angular.element('.drawing-container');
        h = angular.element('.cursor');
        console.log(f, g, h);

        setCursorPosition({ left: 100, top: 200 });
    }, []);

    return (
        <div
            id="viewer-overlay"
            class="viewer-overlay"
            style="overflow: hidden;"
            ng-style="{'width': width + 'px', 'height': height + 'px'}"
            style="width: 1623px;height: 426px;"
        >
            <div class="viewer-overlay" ng-hide="shouldShowOfflineOverlay">
                <div class="cursor">
                    <img
                        class="cursor-arrow"
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAZdJREFUeNqslTtLxEAUhTNmxSeKiqL4KLRQsLDcFP4Ae7XRn2RvEVfyA8QuqS222k2xjYHY6IKkkW0EERTdeA7c0fG1GTdeOORmMny592Qmo/I8dxTCkcg58A+hRAMiQrvCL/UCDRwG5znLskPkQxwzu+g3CFrIJZrN5h7uRyGX3bDwfsQYgdYI9TyPl24cx6XhjgDWxdN3eNnKNXhDg014mcp/BFPVarVU5b+Cy9rSE2xW/ldbCsH9wq3Api2tVmuXG4qbyBbcNSFmpV+FZ1NQpVfV38CEpWl6ySvva7VaO4qiM+Tc7jvQFjQDDVqDdYVhGJ77vn9jWoB8m/O4/aGxIp/NnafbPID2mWtLgiC4SpLkCPms/AKsPh4nrgqUrXpUvV4/RVxrezqdzgXyuSILTDD/bvPQJiuXVlfYulm1vHhJ5luBXbFjGpqQpTRJP1H1ibao0WgcY2zZFmyeIMpYtxVZUovSPsfuoFvoHnopOmGUfs4Tg5Pl5FBS2bh0w3iEHqAnscWxAn8a/IC7IsaryOo8fBNgAOgV7fqnrxxaAAAAAElFTkSuQmCC"
                    />
                    <div class="cursor-highlighter"></div>
                </div>
            </div>
            {/* <div ng-hide="shouldShowOfflineOverlay" class="viewer-overlay click-elements-overlay"></div>
            <div
                class="user-offline-container player-loader-container"
                layout="column"
                layout-align="center center"
                ng-show="shouldShowOfflineOverlay"
            >
                <div layout="column" layout-align="center center">
                    <img src="images/offline-user.svg" />
                    <h3 class="offline-overlay-message">The user is now offline.</h3>
                    <h3 ng-click="playRecordedSession()" class="offline-overlay-message offline-link no-outline">
                        Watch the latest recorded session for this user
                    </h3>
                </div>
            </div>
            <div ng-show="shouldShowVisibilityOverlay">
                <div class="visibility-overlay"></div>
                <div class="visibility-overlay-info" layout="column" layout-align="center center">
                    <i class="icon ion-ios-albums-outline ion-icon visibility-overlay-icon"></i>
                    <div layout="column" layout-align="center center" ng-show="visibilityState === 'prerender'">
                        <h3 class="visibility-overlay-message">
                            The page is prerendered by the browser. It's still not visible to the user.
                        </h3>
                        <span class="visibility-overlay-details">document.visibilityState: prerender</span>
                    </div>
                    <div layout="column" layout-align="center center" ng-show="visibilityState === 'hidden'">
                        <h3 class="visibility-overlay-message">
                            The user is browsing in a different tab or the browser is minimized.
                        </h3>
                        <span class="visibility-overlay-details">document.visibilityState: hidden</span>
                    </div>
                </div>
            </div>
            <div class="player-loader-container" ng-show="shouldShowRenderingOverlay">
                <div class="player-loader">
                    <div class="player-loader-background">
                        <div class="player-loader-filler" ng-style="{width: renderingProgressPercentage + '%'}"></div>
                    </div>
                    <span class="loader-footer">Rendering</span>
                    <span class="loader-footer align-right"></span>
                </div>
            </div>
            <div class="player-loader-container" ng-show="shouldShowBufferingOverlay">
                <div class="player-loader">
                    <div class="loader"></div>
                    <div class="loader-footer">Loading</div>
                </div>
            </div> */}
            {/* <div class="viewer-overlay drawing-container" ng-style="{'width': overlayWidth, 'height': overlayHeight}">
                <drawing-overlay
                    api="drawingApi"
                    scale="scale"
                    update-last-typing-time="updateLastTypingTime"
                    get-frame-offset="getFrameOffset"
                    focus-element="focusElement"
                    get-element="getElement"
                    get-scrollable-element="getScrollableElement"
                    is-created="drawingOverlayIsCreated"
                ></drawing-overlay>
            </div> */}
        </div>
    );
};

export default ViewerOverlay;
