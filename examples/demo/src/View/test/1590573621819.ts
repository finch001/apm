'use strict';
angular
    .module('playerApp', [
        'ngResource',
        'ui.router',
        'ui.bootstrap',
        'angular-tour',
        'commonApp',
        'ngMaterial',
        'ngScrollbars',
    ])
    .config([
        'ScrollBarsProvider',
        function (a) {
            a.defaults = { scrollButtons: { enable: !1 }, axis: 'y' };
        },
    ])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        'BUILD_ENV',
        function (a, b, c) {
            b.when('', '/');
            var d = {
                url: '/',
                templateUrl: 'views/player.html',
                controller: 'PlayerController',
            };
            c.PLAYER_ONLINE_MODE && (d.url = '/sessions/:sessionId'),
                a.state('sessionPlayer', d).state('logPlayer', {
                    url: '/sessions/:sessionId/logs/:logId',
                    templateUrl: 'views/player.html',
                    controller: 'PlayerController',
                });
        },
    ])
    .config([
        '$httpProvider',
        function (a) {
            a.interceptors.push('authInterceptor', 'loadingInterceptor');
        },
    ])
    .run([
        'intercomManager',
        function (a) {
            a.boot();
        },
    ])
    .run([
        '$templateCache',
        function (a) {
            a.put(
                'tour/tour.tpl.html',
                '<div ng-hide="!ttContent" class="popover fade {{ ttPlacement }} in tour-popover"><div class="arrow arrow-{{ ttPlacement }}" ng-hide="centered"></div><div class="popover-title"><p ng-bind-html="ttContent"></p></div><div class="popover-content"><md-button ng-click="proceed()" ng-bind="ttNextLabel" class="md-primary md-raised dark-button"></a></div></div>'
            );
        },
    ]),
    angular
        .module('playerApp')
        .constant('USER_DETAILS_ANIMATION_TIME', 500)
        .constant('SUPPORT_TOOLS', {
            CURSOR: 'cursor',
            PEN: 'pen',
            CONTROL_TAKEOVER: 'control_takeover',
        })
        .constant('CONNECTION_STATUSES', { ONLINE: 'online', OFFLINE: 'offline' }),
    angular
        .module('playerApp')
        .constant('EVENT_TYPE', {
            DOM_MUTATION: 'dom_mutation',
            URL_CHANGE: 'url_change',
            DOM_ELEMENT_VALUE_CHANGE: 'dom_element_value_change',
            DOM_SNAPSHOT: 'dom_snapshot',
            MOUSE_MOVE: 'mouse_move',
            MOUSE_CLICK: 'mouse_click',
            MOUSE_OVER: 'mouse_over',
            MOUSE_OUT: 'mouse_out',
            SCROLL_POSITION_CHANGE: 'scroll_position_change',
            WINDOW_RESIZE: 'window_resize',
            RADIO_BUTTON_CHANGE: 'radio_button_change',
            CHECKBOX_CHANGE: 'checkbox_change',
            VISIBILITY_CHANGE: 'visibility_change',
            CSS_RULE_INSERT: 'css_rule_insert',
            CSS_RULE_DELETE: 'css_rule_delete',
            ADOPTED_STYLE_SHEET_CHANGE: 'adopted_style_sheet_change',
            FULL_SCREEN_ENTER: 'full_screen_enter',
            FULL_SCREEN_LEAVE: 'full_screen_leave',
            CONSOLE_ERROR: 'console_error',
            CONSOLE_DEBUG: 'console_debug',
            CONSOLE_WARN: 'console_warn',
            CONSOLE_LOG: 'console_log',
            NETWORK_REQUEST: 'network_request',
        })
        .constant('SESSIONSTACK_HOVER_CLASS', '_ss-hover')
        .constant('FULL_SCREEN_CLASS', '_ss-full-screen')
        .constant('PROCESS_HOVER_STYLES_CONFIG', { DELAY: 100, TIMES_TO_REPEAT: 0 })
        .constant('ERRORS', { SECURITY_ERROR: 'SecurityError' })
        .constant('VIEWER_MARGINS', { HORIZONTAL: 20, VERTICAL: 20 })
        .constant('SCROLL_POSITION_CHANGE', { MAX_RETRIES: 100, TIMEOUT: 50 })
        .constant('ELEMENTS', { HTML: 'html' })
        .constant(
            'CROSS_ORIGIN_FRAME_BACKGROUND',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAIAAACRuyQOAAAApElEQVRIib3Vyw2EMBADULNdTP+9JWVkL0gIFMh87Phs6cknH601ZGNm/vJvD9N7T0pRBrlNCSYj5ZiwlGZiUoUJSEXGK9UZl0Rh1hKLWUhE5kviMq8SnZlLCmYiiZinpGNukpS5JDVzShsYAMcYYwOD0GtUGDPzSkUGzk11xiVRmLXEYhYSkfmSuMyrRGfmkoKZSCLmKemYmyRlLknNnNIGBsAflNtr9IJvuy8AAAAASUVORK5CYII='
        ),
    angular
        .module('playerApp')
        .constant('LIVE_MODE_CONFIGS', {
            GO_LIVE_OFFSET_TIME: 1e3,
            MAX_ATTEMPTS: 3,
        })
        .constant('DEMO_USER_ROLE', 'demo')
        .constant('PLAN_EXPIRED', 'PLAN_EXPIRED')
        .controller('PlayerController', [
            '$scope',
            '$stateParams',
            'SessionDataClient',
            'player',
            'playerSettings',
            'auth',
            'analytics',
            'sessionstackManager',
            'pendoManager',
            'intercomManager',
            'utils',
            'navigation',
            'BrokerWebSocketClient',
            'BrokerClient',
            'InitialSettings',
            'LiveConnectionMonitor',
            'FRONTEND_URL',
            'SERVER_URL',
            'HTTP_STATUS',
            'DEMO_USER_ROLE',
            'LIVE_MODE_CONFIGS',
            'CONNECTION_STATUSES',
            'ANALYTICS_EVENT_TYPES',
            'PLAN_EXPIRED',
            function (a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x) {
                function y(b) {
                    J.loadActivitiesUntil(z, b).then(function (b) {
                        z(b), a.sessionPlayerApi.finishLoadingActivities();
                    }, B);
                }
                function z(b) {
                    b &&
                        0 !== b.length &&
                        ((H = H || b[0].timestamp),
                        A(b),
                        (O = b[b.length - 1].time),
                        a.sessionPlayerApi.addActivities(b));
                }
                function A(a) {
                    angular.forEach(a, function (a) {
                        a.time = a.timestamp - H;
                    });
                }
                function B(b) {
                    if (b)
                        switch (b.status) {
                            case s.FORBIDDEN:
                                F(b) || (window.location = q + '#/login');
                                break;
                            case s.UNAUTHORIZED:
                                window.location = q + '#/login';
                                break;
                            case s.BAD_REQUEST:
                                a.errors.invalidSessionId = !0;
                                break;
                            case s.NOT_FOUND:
                                a.errors.sessionNotFound = !0;
                        }
                }
                function C() {
                    var b,
                        c = G.getAccessToken(),
                        d = G.getSource();
                    f.loadCurrentUser()
                        .then(function (a) {
                            b = a.id;
                        })
                        ['finally'](function () {
                            g.trackSessionOpened(b, a.sessionId, c, d);
                        });
                }
                function D() {
                    f.loadCurrentUser().then(function (b) {
                        g.trackLiveSessionOpened(b.id, a.sessionId);
                    });
                }
                function E() {
                    f.loadCurrentUser().then(function (b) {
                        g.trackLiveSessionStopped(b.id, a.sessionId);
                    });
                }
                function F(a) {
                    return a.data && a.data.message === x;
                }
                if (((a.isBrowserNotSupported = k.isBrowserNotSupported()), !a.isBrowserNotSupported)) {
                    e.init(a),
                        (a.sessionId = b.sessionId),
                        (a.errors = {}),
                        (a.activities = []),
                        (a.playRecordedSession = function () {
                            var b = a.initialSettings.getSession();
                            l.openSessionInNewWindow(b.id, b.hasInaccessibleResources, 'player_offline_button');
                        });
                    var G,
                        H,
                        I = b.logId,
                        J = new c(a.sessionId, I, a.settings.general.playLive),
                        K = new n(m.createStreamingClient(a.sessionId)),
                        L = new n(m.createChatClient(a.sessionId)),
                        M = new p(K),
                        N = new p(L),
                        O = -1;
                    f.loadCurrentUser().then(function (b) {
                        (a.user = b), h.identify(b), i.initialize(b), b.role !== t && j.update(b);
                    }, B),
                        J.loadSession().then(function (b) {
                            (G = new o(
                                b.sessionData.session,
                                b.sessionData.log,
                                b.sessionData.askUserForStreamingPermission,
                                b.sessionData.customOrigin,
                                a.settings.general,
                                a.settings.analytics,
                                b.featureFlags
                            )),
                                (a.initialSettings = G),
                                C(),
                                G.shouldStartStreaming() && D();
                        }, B),
                        M.onStatusChange(function (b) {
                            var c = b === v.OFFLINE;
                            a.sessionPlayerApi.setUserHasGoneOffline(c),
                                c ? a.sessionPlayerApi.stopLiveStreaming() : a.sessionPlayerApi.startLiveStreaming();
                        }),
                        N.onStatusChange(function (b) {
                            var c = b === v.OFFLINE;
                            a.sessionPlayerApi.setUserHasGoneOffline(c),
                                c && (L.discardPendingRequests(), a.sessionPlayerApi.resetStreamingRequest(c));
                        }),
                        d.onUserPermissionRequestSend(a, function () {
                            N.start(),
                                L.onStreamingRequestDenied(function () {
                                    N.stop(), L.disconnect(), a.sessionPlayerApi.denyStreamingRequest();
                                }),
                                L.onStreamingRequestApproved(function () {
                                    N.stop(), L.disconnect(), a.sessionPlayerApi.approveStreamingRequest();
                                }),
                                L.onRecorderDisconnected(function () {
                                    N.stop(), L.disconnect(), a.sessionPlayerApi.interruptStreamingRequest();
                                }),
                                L.connect(function () {
                                    L.sendStreamingRequest();
                                });
                        }),
                        d.onUserPermissionRequestCanceled(a, function () {
                            N.stop(), L.sendStreamingRequestCanceled(), L.disconnect();
                        }),
                        d.onPlayerIsInitialized(a, function () {
                            if (
                                (a.sessionPlayerApi.setFeatureFlags(G.featureFlags),
                                a.sessionPlayerApi.setBrokerClient(K),
                                !G.shouldWaitUserConfirmation())
                            )
                                if (G.shouldStartStreaming()) a.sessionPlayerApi.startLiveStreaming();
                                else {
                                    var b = G.getSession();
                                    a.sessionPlayerApi.setSessionLength(b.length),
                                        a.sessionPlayerApi.startPlayback(),
                                        y(b.clientStartMilliseconds + b.length);
                                }
                        }),
                        d.onStartLiveStreaming(a, function (b, c) {
                            M.start(),
                                K.onAddData(function (b) {
                                    z(b), a.sessionPlayerApi.setSessionLength(O);
                                }),
                                K.connect(function () {
                                    c();
                                });
                        }),
                        d.onStopLiveStreaming(a, function () {
                            K.disconnect(), M.stop(), a.sessionPlayerApi.finishLoadingActivities(), E();
                        });
                }
            },
        ]),
    angular.module('playerApp').controller('SessionDetailsController', [
        '$scope',
        '$mdDialog',
        'sessionData',
        function (a, b, c) {
            (a.sessionData = c),
                (a.close = function () {
                    b.hide();
                });
        },
    ]),
    angular
        .module('playerApp')
        .constant('CONSOLE_CONSTANTS', {
            ANIMATION_TIME: 300,
            HEIGHT: 300,
            STEP_HEIGHT: 32,
        })
        .directive('console', [
            '$timeout',
            'player',
            'sessionstackManager',
            'utils',
            'lodash',
            'auth',
            'analytics',
            'CONSOLE_CONSTANTS',
            'EVENT_TYPE',
            'ANALYTICS_EVENT_TYPES',
            function (a, b, c, d, e, f, g, h, i, j) {
                return {
                    restrict: 'E',
                    replace: !0,
                    templateUrl: 'templates/console.html',
                    scope: {
                        openConsole: '=',
                        closeConsole: '=',
                        isExpanded: '=',
                        addNewLogs: '=',
                        addNewNetworkRequests: '=',
                        updateConsole: '=',
                        onSelectedLog: '=',
                        selectActivity: '=',
                    },
                    link: function (k, l, m) {
                        function n() {
                            v && (a.cancel(v), (v = null)),
                                (v = a(function () {
                                    c.log('Console search used');
                                }, 2e3));
                        }
                        function o(a) {
                            if (!x.is(':hover') && k.isExpanded) {
                                var b = e.findIndex(k.filteredLogs, ['activityIndex', a]);
                                if (!(b < 0)) {
                                    var c = q(a),
                                        d = 2 * h.STEP_HEIGHT,
                                        f = c - d;
                                    z.stop().animate({ scrollTop: f }, 300);
                                }
                            }
                        }
                        function p(a) {
                            if (!y.is(':hover') && k.isExpanded) {
                                var b = e.findIndex(k.filteredNetworkRequests, ['activityIndex', a]);
                                if (!(b < 0)) {
                                    var c = r(a),
                                        d = 2 * h.STEP_HEIGHT,
                                        f = c - d;
                                    A.stop().animate({ scrollTop: f }, 300);
                                }
                            }
                        }
                        function q(a) {
                            if (isNaN(a)) return 0;
                            var b = 0;
                            return (
                                k.filteredLogs.forEach(function (c) {
                                    if (c.activityIndex < a) {
                                        var d = w[c.activityIndex] || 0;
                                        b += d;
                                    }
                                }),
                                b
                            );
                        }
                        function r(a) {
                            if (isNaN(a)) return 0;
                            var b = 0;
                            return (
                                k.filteredNetworkRequests.forEach(function (c) {
                                    c.activityIndex < a && (b += h.STEP_HEIGHT);
                                }),
                                b
                            );
                        }
                        function s() {
                            l.animate({ height: 0 }, h.ANIMATION_TIME),
                                (k.isExpanded = !1),
                                a(function () {
                                    b.fireConsoleResize(k, 0);
                                }, h.ANIMATION_TIME);
                        }
                        function t() {
                            l.animate({ height: h.HEIGHT }, h.ANIMATION_TIME),
                                b.fireConsoleResize(k, h.HEIGHT),
                                (k.isExpanded = !0),
                                k.$broadcast('$md-resize'),
                                o(k.lastPlayedActivityIndex);
                        }
                        (k.EVENT_TYPE = i),
                            (k.TAB_INDEX = { CONSOLE: 0, NETWORK: 1 }),
                            (k.isExpanded = !1),
                            (k.selectedTab = 0),
                            (k.transformedLogs = []),
                            (k.logTypes = {}),
                            (k.logTypes[i.CONSOLE_LOG] = !0),
                            (k.logTypes[i.CONSOLE_DEBUG] = !0),
                            (k.logTypes[i.CONSOLE_WARN] = !0),
                            (k.logTypes[i.CONSOLE_ERROR] = !0),
                            (k.networkTypes = { xhr: !0 }),
                            (k.networkRequests = []),
                            k.networkRequestDetails,
                            (k.lastPlayedActivityIndex = 0),
                            (k.selectedLogIndex = null),
                            (k.areGeneralDetailsExpanded = !0),
                            (k.areResponseHeadersExpanded = !0),
                            (k.areRequestHeadersExpanded = !0);
                        var u,
                            v,
                            w = {},
                            x = l.find('.logs-container'),
                            y = l.find('.network-requests-container'),
                            z = x.children().eq(0),
                            A = y.children().eq(0);
                        (k.openConsole = function (a) {
                            k.isExpanded || t(), a && k.selectLog(a);
                        }),
                            (k.closeConsole = function () {
                                s();
                            }),
                            (k.selectTab = function (a) {
                                if (((k.selectedTab = a), a === k.TAB_INDEX.NETWORK)) {
                                    var b = f.getCurrentUser();
                                    g.trackEvent(b.id, j.NETWORK_TAB_OPENED);
                                }
                            }),
                            (k.toggleFilter = function (a) {
                                (k.logTypes[a] = !k.logTypes[a]), o(k.lastPlayedActivityIndex), n();
                            }),
                            (k.searchChanged = function () {
                                n();
                            }),
                            (k.addNewLogs = function (a) {
                                a.forEach(function (a) {
                                    if (
                                        (k.transformedLogs.length > 0 &&
                                            (u = k.transformedLogs[k.transformedLogs.length - 1]),
                                        d.isDifferentActivity(a, u))
                                    )
                                        k.transformedLogs.push(a);
                                    else {
                                        var b = k.transformedLogs[k.transformedLogs.length - 1];
                                        (b.activityIndex = a.activityIndex), b.count++;
                                    }
                                    w[a.activityIndex] = h.STEP_HEIGHT;
                                });
                            }),
                            (k.addNewNetworkRequests = function (a) {
                                d.forEach(a, function (a) {
                                    k.networkRequests.push(a);
                                });
                            }),
                            (k.updateConsole = function (a) {
                                (k.lastPlayedActivityIndex = a),
                                    k.selectedLogIndex || (o(a), p(a)),
                                    k.selectedLogIndex < a && (o(a), p(a)),
                                    a >= k.selectedLogIndex && (k.selectedLogIndex = null);
                            }),
                            (k.selectLog = function (a) {
                                (k.selectedLogIndex = a.activityIndex), k.onSelectedLog(a), o(a.activityIndex);
                            }),
                            (k.selectNetworkRequest = function (a) {
                                (k.selectedLogIndex = a.activityIndex), k.onSelectedLog(a), p(a.activityIndex);
                            }),
                            (k.selectActivity = function (a) {
                                (k.selectedLogIndex = a.activityIndex), o(a.activityIndex), p(a.activityIndex);
                            }),
                            (k.onLogToggle = function (a, b) {
                                (w[a] = w[a] || 0), (w[a] += b);
                            }),
                            (k.showNetworkRequestDetails = function (a) {
                                k.networkRequestDetails = a.details.request;
                            }),
                            (k.closeExpandedNetworkRequest = function () {
                                k.networkRequestDetails = null;
                            }),
                            (k.toggleGeneralDetails = function () {
                                k.areGeneralDetailsExpanded = !k.areGeneralDetailsExpanded;
                            }),
                            (k.toggleResponseHeaders = function () {
                                k.areResponseHeadersExpanded = !k.areResponseHeadersExpanded;
                            }),
                            (k.toggleRequestHeaders = function () {
                                k.areRequestHeadersExpanded = !k.areRequestHeadersExpanded;
                            });
                    },
                };
            },
        ]),
    angular
        .module('playerApp')
        .constant('JSON_INDENTATION', 4)
        .constant('NEW_LINE_EXPRESSION', /\r|\n/)
        .directive('consoleLog', [
            '$timeout',
            'player',
            'utils',
            'lodash',
            'JSON_INDENTATION',
            'NEW_LINE_EXPRESSION',
            function (a, b, c, d, e, f) {
                return {
                    restrict: 'E',
                    replace: !0,
                    templateUrl: 'templates/consoleLog.html',
                    scope: {
                        log: '=',
                        isExecuted: '=',
                        isSelected: '=',
                        onLogToggle: '=',
                        selectLog: '&',
                    },
                    link: function (b, g, h) {
                        function i() {
                            var d = j(b.log.details.message);
                            (b.log.details.formattedMessage = d.formattedMessage),
                                (b.log.isMultiLine = d.isMultiLine),
                                (b.log.details.stackFrames = k(b.log.details.stackFrames)),
                                (b.log.searchLabel = b.log.searchLabel || l(b.log.details)),
                                (b.log.isMultiLine ||
                                    (b.log.details.stackFrames && b.log.details.stackFrames.length > 0)) &&
                                    (b.log.isExpandable = !0),
                                a(function () {
                                    var a = g.find('.message-container .message');
                                    b.log.isExpandable = b.log.isExpandable || c.isEllipsisActive(a[0]);
                                }, 250);
                        }
                        function j(a) {
                            try {
                                var b = angular.fromJson(a);
                                return {
                                    isMultiLine: !0,
                                    formattedMessage: angular.toJson(b, e),
                                };
                            } catch (c) {
                                return { isMultiLine: f.exec(a), formattedMessage: a };
                            }
                        }
                        function k(a) {
                            if (a && 0 !== a.length)
                                return d.map(a, function (a) {
                                    if (a) return a.trim();
                                });
                        }
                        function l(a) {
                            var b = a.stackFrames ? a.stackFrames.join('') : '';
                            return a.message + b;
                        }
                        var m = g.find('.message-container');
                        (b.toggleMessage = function (c) {
                            if ('Range' !== c.view.getSelection().type) {
                                var d = m.outerHeight();
                                (b.log.isExpanded = !b.log.isExpanded),
                                    a(function () {
                                        var a = m.outerHeight(),
                                            c = a - d;
                                        b.onLogToggle(b.log.activityIndex, c);
                                    });
                            }
                        }),
                            b.$watch('log.activityIndex', i);
                    },
                };
            },
        ]),
    angular.module('playerApp').directive('draggable', function () {
        return {
            restrict: 'A',
            scope: { axis: '@', enableHandle: '=', disableHandle: '=' },
            link: function (a, b, c) {
                var d = $(b).draggable({
                    axis: a.axis,
                    containment: 'parent',
                    disabled: !0,
                });
                (a.enableHandle = function () {
                    d && d.draggable('enable');
                }),
                    (a.disableHandle = function () {
                        d && d.draggable('disable');
                    });
            },
        };
    }),
    angular
        .module('playerApp')
        .constant('DRAWING_OPTIONS', {
            STROKE_WIDTH: 4,
            FILL: 'none',
            STROKE: '#ff9f33',
            TIMEOUT: 3e3,
        })
        .directive('drawingOverlay', [
            '$timeout',
            '$stateParams',
            'player',
            'DrawingService',
            'utils',
            'DRAWING_OPTIONS',
            'SUPPORT_TOOLS',
            'DocumentNode',
            function (a, b, c, d, e, f, g, h) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/drawingOverlay.html',
                    replace: !0,
                    scope: {
                        scale: '=',
                        api: '=',
                        getElement: '=',
                        getScrollableElement: '=',
                        focusElement: '=',
                        updateLastTypingTime: '=',
                        getFrameOffset: '=',
                        isCreated: '=',
                    },
                    link: function (c, i, j) {
                        function k() {
                            i.off('mousedown'),
                                i.off('mousemove'),
                                i.off('mouseup'),
                                i.off('mouseleave'),
                                i.off('click'),
                                P && (angular.element(P.node).off('keyup'), angular.element(P.node).off('focusout'));
                        }
                        function l() {
                            i.on('mousedown', B), i.on('mousemove', C), i.on('mouseup', D), i.on('mouseleave', E);
                        }
                        function m() {
                            i.on('mousemove', w), i.on('click', r), i.on('wheel', z);
                        }
                        function n() {
                            i.on('mousemove', o), i.on('click', q);
                        }
                        function o(a) {
                            x(a, function (a) {
                                L.visualizeMouseMove(a.x, a.y);
                            });
                        }
                        function p() {
                            var a = document.createElement('div');
                            (a.style.position = 'absolute'),
                                (a.style.zIndex = 2147483647),
                                (a.style.top = 0),
                                (a.style.left = 0),
                                (a.style.width = '54px'),
                                (a.style.height = '54px');
                            var b = document.createElement('div');
                            return (
                                (b.style.content = ''),
                                (b.style.position = 'relative'),
                                (b.style.display = 'block'),
                                (b.style.width = self.CLICK_CIRCLE_SIZE + 'px'),
                                (b.style.height = self.CLICK_CIRCLE_SIZE + 'px'),
                                (b.style.display = 'block'),
                                (b.style.boxSizing = 'border-box'),
                                (b.style.borderRadius = '27px'),
                                (b.style.width = '54px'),
                                (b.style.height = '54px'),
                                (b.style.backgroundColor = '#ffa001'),
                                (b.style.animation = '_ss-pulse-ring 1s infinite'),
                                a.appendChild(b),
                                a
                            );
                        }
                        function q(a) {
                            t(a, function (a, b) {
                                L.visualizeClick(a, b);
                            });
                        }
                        function r(a) {
                            t(a, function (a, b, c, d) {
                                L.click(a, b, c, d);
                            });
                        }
                        function s(a) {
                            var b = e.matchesSelector(a.node, 'input, textarea');
                            if (b) {
                                P && (angular.element(P.node).off('keyup'), angular.element(P.node).off('focusout')),
                                    (P = a),
                                    c.focusElement(a.nodeId),
                                    L.sendFocus(P.nodeId, P.frameElementId, P.hostElementId);
                                var d = angular.element(P.node);
                                d.on('keyup', u), d.on('focusout', v);
                            }
                        }
                        function t(a, b) {
                            var d = F(a),
                                e = c.getElement(d.relativeX, d.relativeY);
                            s(e), b(d.x, d.y, e.nodeId, e.frameElementId);
                            var f = p();
                            (f.style.top = d.y - 27 + 'px'),
                                (f.style.left = d.x - 27 + 'px'),
                                i.append(f),
                                setTimeout(function () {
                                    angular.element(f).remove();
                                }, 3e3);
                        }
                        function u(a) {
                            var b = {
                                key: a.key,
                                keyCode: a.keyCode,
                                which: a.which,
                                ctrlKey: a.ctrlKey,
                                altKey: a.altKey,
                                shiftKey: a.shiftKey,
                            };
                            L.sendKeyStroke(a.target.value, P.nodeId, P.frameElementId, P.hostElementId, b),
                                c.updateLastTypingTime(Date.now());
                        }
                        function v(a) {
                            var b = a.relatedTarget;
                            if (b) {
                                var c = e.matchesSelector(b, 'input, textarea');
                                if (!c) {
                                    var d = angular.element(b);
                                    return void d.off('focusout').on('focusout', v);
                                }
                                var f = h.getNodePropertyObject(b),
                                    g = {
                                        nodeId: f.nodeId,
                                        frameElementId: f.nodeId,
                                        hostElementId: f.hostElementId,
                                        node: b,
                                    };
                                s(g);
                            }
                        }
                        function w(a) {
                            x(a, function (a) {
                                var b = c.getElement(a.relativeX, a.relativeY);
                                if (b) {
                                    (O && O.nodeId === b.nodeId) ||
                                        (L.hoverElement(b.nodeId, b.frameElementId, b.hostElementId), (O = b));
                                    var d = y(a.relativeClientX, a.relativeClientY, b.frameElementId);
                                    L.sendMouseMove(d, b.nodeId, b.frameElementId, b.hostElementId),
                                        L.visualizeMouseMove(a.x, a.y);
                                }
                            });
                        }
                        function x(a, b) {
                            var c = new Date(),
                                d = F(a),
                                e = N.x !== d.x || N.y !== d.y,
                                f = c - M > Q;
                            e && f && ((M = c), (N = d), b(N));
                        }
                        function y(a, b, d) {
                            var e = { clientX: a, clientY: b };
                            if (!d) return e;
                            var f = c.getFrameOffset(d);
                            return (e.clientX -= f.left), (e.clientY -= f.top), e;
                        }
                        function z(a) {
                            var b = c.getScrollableElement(
                                N.relativeX,
                                N.relativeY,
                                a.originalEvent.deltaX,
                                a.originalEvent.deltaY
                            );
                            b && A(b, a.originalEvent.deltaY, a.originalEvent.deltaX);
                        }
                        function A(a, b, c) {
                            L.scrollChange(c || 0, b || 0, a.nodeId, a.frameElementId, a.hostElementId);
                        }
                        function B(a) {
                            (K = document.createElementNS('http://www.w3.org/2000/svg', 'path')),
                                K.setAttribute('fill', f.FILL),
                                K.setAttribute('stroke', f.STROKE),
                                K.setAttribute('stroke-width', f.STROKE_WIDTH);
                            var b = F(a);
                            (I = 'M' + b.x + ' ' + b.y), K.setAttribute('d', I), J.append(K);
                        }
                        function C(a) {
                            if (K) {
                                var b = F(a);
                                G(b);
                            }
                        }
                        function D(a) {
                            K && (H(K), L.draw(I));
                        }
                        function E() {
                            K && H(K, !0);
                        }
                        function F(a) {
                            var b = i[0].getBoundingClientRect(),
                                d = i.parents('#viewer-overlay')[0].getBoundingClientRect();
                            return {
                                x: (a.pageX - b.left) / c.scale,
                                y: (a.pageY - b.top) / c.scale,
                                relativeX: (a.pageX - d.left) / c.scale,
                                relativeY: (a.pageY - d.top) / c.scale,
                                relativeClientX: (a.clientX - d.left) / c.scale,
                                relativeClientY: (a.clientY - d.top) / c.scale,
                            };
                        }
                        function G(a) {
                            (I += ' L' + a.x + ' ' + a.y), K.setAttribute('d', I);
                        }
                        function H(b, c) {
                            var d = c ? 0 : f.TIMEOUT;
                            a(function () {
                                angular.element(b).remove();
                            }, d),
                                (K = null);
                        }
                        var I,
                            J = i.find('svg'),
                            K = null,
                            L = new d(),
                            M = (b.sessionId, 0),
                            N = {},
                            O = null,
                            P = null,
                            Q = 100;
                        c.activeTool,
                            (c.SUPPORT_TOOLS = g),
                            (c.api = {
                                enableDrawing: function (a) {
                                    L.connect(a);
                                },
                                setToolIsActive: function (a, b) {
                                    a !== g.CURSOR || b || L.exitCursor(),
                                        a !== g.CONTROL_TAKEOVER || b || L.exitControlTakeOver(),
                                        (c.activeTool = b ? a : null),
                                        k(),
                                        c.activeTool === g.PEN
                                            ? l()
                                            : c.activeTool === g.CURSOR
                                            ? n()
                                            : c.activeTool === g.CONTROL_TAKEOVER && m();
                                },
                            }),
                            (c.isCreated = !0);
                    },
                };
            },
        ]),
    angular.module('playerApp').directive('fitWindow', [
        '$window',
        '$timeout',
        function (a, b) {
            return function (c, d) {
                function e() {
                    b(function () {
                        d.height(f.height()), d.width(f.width());
                    });
                }
                var f = angular.element(a);
                e(), f.on('resize', e);
            };
        },
    ]),
    angular
        .module('playerApp')
        .constant('INACCESSIBLE_RESOURCES_COOKIE_NAME_PREFIX', 'sessionstack-inaccessible-resource-detected-')
        .directive('inaccessibleResourcesWarning', [
            '$window',
            '$cookies',
            '$timeout',
            'CookieChangeListener',
            'INACCESSIBLE_RESOURCES_COOKIE_NAME_PREFIX',
            function (a, b, c, d, e) {
                return {
                    templateUrl: 'templates/inaccessibleResourcesWarning.html',
                    replace: !0,
                    scope: { sessionId: '=' },
                    link: function (f, g, h) {
                        function i() {
                            j || k || g.addClass('is-visible');
                        }
                        var j = !1,
                            k = 'http:' === a.location.protocol;
                        f.$watch('sessionId', function (a) {
                            if (a) {
                                var f = e + a,
                                    g = new d(f, function (a) {
                                        a &&
                                            (c(function () {
                                                i();
                                            }, 2e3),
                                            b.remove(f));
                                    });
                                g.listen();
                            }
                        }),
                            (f.closeWarning = function () {
                                (j = !0), g.removeClass('is-visible');
                            }),
                            (f.switchToHttp = function () {
                                a.location.protocol = 'http:';
                            });
                    },
                };
            },
        ]),
    angular.module('playerApp').directive('logDetails', [
        'player',
        'auth',
        'analytics',
        'sessionstackManager',
        'ANALYTICS_EVENT_TYPES',
        function (a, b, c, d, e) {
            return {
                restrict: 'E',
                templateUrl: 'templates/logDetails.html',
                replace: !0,
                scope: { log: '=' },
                link: function (f) {
                    function g() {
                        var a = b.getCurrentUser(),
                            f = { opened_from: 'step_details' };
                        c.trackEvent(a.id, e.CONSOLE_OPENED, f), d.log('Console opened from step details');
                    }
                    (f.message = ''),
                        f.$watch('log', function (a) {
                            f.message = (a && a.details.message) || '';
                        }),
                        (f.openConsole = function () {
                            g(), a.fireOpenConsole(f, f.log);
                        });
                },
            };
        },
    ]),
    angular.module('playerApp').directive('networkRequest', [
        function () {
            return {
                restrict: 'E',
                replace: !0,
                templateUrl: 'templates/networkRequest.html',
                scope: {
                    networkRequest: '=',
                    isSelected: '=',
                    isExecuted: '=',
                    isExpanded: '=',
                    selectNetworkRequest: '=',
                    showNetworkRequestDetails: '&',
                },
                link: function (a, b, c) {
                    a.selectRequest = function (b) {
                        b.stopPropagation(), a.selectNetworkRequest(a.networkRequest);
                    };
                },
            };
        },
    ]),
    angular
        .module('playerApp')
        .constant('MIN_ACTIVITY_BLOCK_WIDTH', 2)
        .directive('playerTimeline', [
            'MIN_ACTIVITY_BLOCK_WIDTH',
            'PLAYER_CONFIG',
            'lodash',
            '$timeout',
            function (a, b, c, d) {
                return {
                    templateUrl: 'templates/timeline.html',
                    replace: !0,
                    scope: {
                        value: '=',
                        selectedValue: '=',
                        valueSelectionInProgress: '=',
                        max: '=',
                        enable: '=',
                        disable: '=',
                        pauseActivity: '=',
                        isLive: '=',
                        refresh: '=',
                        isCreated: '=',
                    },
                    restrict: 'E',
                    link: function (a, b, d) {
                        function e() {
                            if (!a.isTimelineSelectionInProgress) {
                                var b = Math.min(a.value, a.loadedTime);
                                a.renderedTimePercentage = a.timelineValueToPercentage(b);
                            }
                        }
                        function f() {
                            return a.max - a.min;
                        }
                        function g(b) {
                            var c = j.offset(),
                                d = Math.max(b.pageX - c.left, a.min + 1);
                            return i(d);
                        }
                        function h(a) {
                            var b = [],
                                c = f() / j.width(),
                                d = { time: 0 },
                                e = 0;
                            return (
                                a.forEach(function (a) {
                                    if (a.isFirstLiveActivity) {
                                        var f = {
                                            unknown: !0,
                                            time: d.time,
                                            duration: a.time - d.time,
                                        };
                                        b.push(f);
                                    }
                                    a.time >= e && (b.push(a), (e = a.time + c)), (d = a);
                                }),
                                b
                            );
                        }
                        function i(b) {
                            var c = b / j.width();
                            return a.min + c * f();
                        }
                        var j = b.find('.timeline-track'),
                            k = b.find('.timeline-progress-handle'),
                            l = b.find('.timeline-pause-activity-wrapper'),
                            m = (b.find('.timeline-buffering-bar'), k.width(), !1);
                        (a.value = 0),
                            (a.min = 0),
                            (a.max = 0),
                            (a.pauseActivityOffset = -1),
                            (a.loadedTime = 0),
                            (a.handleOffset = 0),
                            (a.renderedTimePercentage = 0),
                            (a.loadedTimePercentage = 0),
                            (a.enable = function () {
                                (m = !0), a.enableTimelineHandle();
                            }),
                            (a.disable = function () {
                                (m = !1), a.disableTimelineHandle();
                            }),
                            (a.timelineValueToPercentage = function (a) {
                                return (a / f()) * 100;
                            }),
                            a.$watch('value', function () {
                                var b = (k.width() / j.width()) * 100,
                                    c = a.timelineValueToPercentage(a.value);
                                (a.handleOffset = c - b / 2), e();
                            }),
                            (a.activityWidthInPercents = function (a) {
                                var b = a.duration || 1;
                                return (b / f()) * 100;
                            }),
                            (a.refresh = function (b, d) {
                                var f = a.activityBlocks || [];
                                if (
                                    (d.forEach(function (a) {
                                        var b = { time: a.time };
                                        a.isFirstLiveActivity && (b.isFirstLiveActivity = !0), f.push(b);
                                    }),
                                    (a.activityBlocks = h(f)),
                                    b)
                                )
                                    a.loadedTime = a.max;
                                else if (d.length > 0) {
                                    var g = c.last(d);
                                    (a.max = Math.max(a.max, g.time)), (a.loadedTime = g.time);
                                }
                                (a.loadedTimePercentage = a.timelineValueToPercentage(a.loadedTime)),
                                    e(),
                                    a.pauseActivity
                                        ? (l.show(),
                                          (a.pauseActivityOffset = a.timelineValueToPercentage(
                                              Math.max(0, a.pauseActivity.time)
                                          )))
                                        : l.hide();
                            }),
                            k.on('dragstart', function (b) {
                                a.$apply(function () {
                                    (a.valueSelectionInProgress = !0), (a.draggedValue = null);
                                });
                            }),
                            k.on('drag', function (b) {
                                a.$apply(function () {
                                    var c = j.offset(),
                                        d = Math.max(b.pageX - c.left, a.min + 1);
                                    a.draggedValue = i(d);
                                });
                            }),
                            k.on('dragstop', function (b) {
                                a.$apply(function () {
                                    (a.valueSelectionInProgress = !1),
                                        (a.draggedValue = null),
                                        (a.value = g(b)),
                                        (a.selectedValue = a.value);
                                });
                            }),
                            j.on('click', function (b) {
                                if (m) {
                                    var c = angular.element(b.target),
                                        d = c.hasClass('timeline-unknown-activity');
                                    d ||
                                        a.$apply(function () {
                                            (a.value = g(b)), (a.selectedValue = a.value);
                                        });
                                }
                            }),
                            (a.isCreated = !0);
                    },
                };
            },
        ]),
    angular.module('playerApp').directive('requestUserAccessDialog', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/requestUserAccessDialog.html',
        };
    }),
    angular.module('playerApp').directive('resize', [
        '$window',
        '$timeout',
        function (a, b) {
            return {
                link: function (c, d, e) {
                    function f() {
                        b(function () {
                            (c.containerWidth = g.width()), (c.containerHeight = g.height());
                        });
                    }
                    var g = angular.element(d).parent();
                    f(), angular.element(a).on('resize', f);
                },
            };
        },
    ]),
    angular
        .module('playerApp')
        .constant('NOT_AVAILABLE', 'Not available')
        .directive('sessionDetails', [
            '$filter',
            'NOT_AVAILABLE',
            function (a, b) {
                return {
                    restrict: 'E',
                    templateUrl: function (a, b) {
                        var c = 'common/templates/sections.html';
                        return b.templateRoot ? b.templateRoot + c : c;
                    },
                    replace: !0,
                    scope: { sessionData: '=' },
                    link: function (c) {
                        function d(d) {
                            var e, f;
                            d.device.browserName &&
                                d.device.browserVersion &&
                                (e = d.device.browserName + ' ' + d.device.browserVersion),
                                angular.isDefined(d.screenWidth) &&
                                    angular.isDefined(d.screenHeight) &&
                                    (f = d.screenWidth + ' x ' + d.screenHeight),
                                (c.sections = [
                                    {
                                        name: 'Session',
                                        items: [
                                            { label: 'Length', value: a('lengthformat')(d.length) },
                                            {
                                                label: 'Start',
                                                value: a('detaileddateformat')(d.start),
                                            },
                                            {
                                                label: 'Last active',
                                                value: a('detaileddateformat')(d.lastActive),
                                            },
                                            {
                                                label: 'Start page',
                                                isLink: !!d.pageUrl,
                                                value: d.pageUrl || b,
                                            },
                                            {
                                                label: 'Referrer',
                                                isLink: !!d.referrer,
                                                value: d.referrer || b,
                                            },
                                        ],
                                    },
                                    {
                                        name: 'Device',
                                        items: [
                                            { label: 'Browser', value: e || b },
                                            {
                                                label: 'Layout engine',
                                                value: d.device.layoutName || b,
                                            },
                                            { label: 'OS', value: d.device.os || b },
                                            { label: 'Product', value: d.device.product || b },
                                            {
                                                label: 'Manufacturer',
                                                value: d.device.manufacturer || b,
                                            },
                                            { label: 'Screen', value: f || b },
                                        ],
                                    },
                                    {
                                        name: 'Location',
                                        items: [
                                            { label: 'IP', value: d.location.ip || b },
                                            { label: 'Country', value: d.location.country || b },
                                            { label: 'City', value: d.location.city || b },
                                        ],
                                    },
                                ]);
                        }
                        c.$watch('sessionData', function (a) {
                            a && d(a);
                        });
                    },
                };
            },
        ]),
    angular
        .module('playerApp')
        .constant('PLAYER_CONFIG', {
            MAX_INACTIVITY_TIME: 3e3,
            EVENTS_BATCH_SIZE: 250,
            EVENTS_BATCH_WAIT_TIME: 0,
            TAB_HIDDEN_MESSAGE_TIME: 1e3,
            GO_LIVE_DELAY_TIME: 1500,
            LAG_TIME: 500,
            MILLISECONDS_PER_FRAME: 33,
        })
        .constant('UI_MODE', { SIMPLE: 'simple' })
        .directive('sessionPlayer', [
            '$interval',
            '$timeout',
            'lodash',
            'sessionDetailsModal',
            'player',
            'sessionstackManager',
            'analytics',
            'auth',
            'utils',
            'Player',
            'Activity',
            'Activities',
            'PLAYER_CONFIG',
            'ANALYTICS_EVENT_TYPES',
            'BUILD_ENV',
            'EVENT_TYPE',
            'TAB_VISIBILITY',
            'UI_MODE',
            'SUPPORT_TOOLS',
            function (a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s) {
                return {
                    restrict: 'E',
                    replace: !0,
                    templateUrl: 'templates/player.html',
                    scope: {
                        session: '=',
                        initialSettings: '=',
                        isLive: '=',
                        isTimelineSelectionInProgress: '=?',
                        timelineValue: '=?',
                        startTime: '=',
                        pauseActivity: '=',
                        settings: '=',
                        errors: '=',
                        api: '=',
                        playRecordedSession: '=',
                    },
                    link: function (a, b, t) {
                        function u(b) {
                            a.$apply(function () {
                                a.timelineValue = b;
                            });
                        }
                        function v() {
                            window.ss_debug && console.log('show buffering'),
                                (a.arePlayerButtonsEnabled = !1),
                                a.disableStepsTimeline(),
                                e.fireHideViewerOverlay(a),
                                e.fireShowBuffering(a);
                        }
                        function w() {
                            window.ss_debug && console.log('show rendering'), e.fireDetach(a), v();
                        }
                        function x() {
                            window.ss_debug && console.log('hide overlays'),
                                (a.arePlayerButtonsEnabled = !0),
                                a.enableStepsTimeline(),
                                e.fireHideViewerOverlay(a),
                                e.fireHideBuffering(a),
                                e.fireAttach(a);
                        }
                        function y() {
                            window.ss_debug && console.log('paused'),
                                (a.hasFinished = !1),
                                (a.isPlaying = !1),
                                (a.arePlayerButtonsEnabled = !0),
                                a.enableStepsTimeline(),
                                e.fireHideViewerOverlay(a),
                                e.fireHideBuffering(a),
                                e.fireAttach(a);
                        }
                        function z() {
                            window.ss_debug && console.log('finished'),
                                (a.hasFinished = !0),
                                (a.isPlaying = !1),
                                (a.arePlayerButtonsEnabled = !0),
                                a.enableStepsTimeline(),
                                e.fireHideViewerOverlay(a),
                                e.fireHideBuffering(a),
                                e.fireAttach(a);
                        }
                        function A(a) {
                            return (
                                [p.CONSOLE_ERROR, p.CONSOLE_WARN, p.CONSOLE_DEBUG, p.CONSOLE_LOG].indexOf(a.type) > -1
                            );
                        }
                        function B(a) {
                            return a.type === p.NETWORK_REQUEST;
                        }
                        function C(a) {
                            if (!a.data) return !1;
                            var b = 0 === a.time && 0 === a.index && a.type === p.DOM_SNAPSHOT;
                            if (b) return !1;
                            var c = a.type === p.MOUSE_CLICK,
                                d = !!a.data.frameElementId,
                                e = !!a.data.hostElementId,
                                f = !d && !e,
                                g = f && U.indexOf(a.type) >= 0;
                            return (c && !e) || g;
                        }
                        function D(a) {
                            var b = {};
                            (b[p.CONSOLE_LOG] = 'info'),
                                (b[p.CONSOLE_ERROR] = 'error'),
                                (b[p.CONSOLE_WARN] = 'warn'),
                                (b[p.CONSOLE_DEBUG] = 'debug');
                            var c = { id: a.id, level: b[a.type] };
                            if ('exception' === a.data.type) {
                                var d = a.data.exception;
                                (c.message = d.type ? d.type + ': ' : ''),
                                    (c.message += d.message),
                                    (c.isMessageTrimmed = !1),
                                    (c.stackFrames = (d.stackFrames || []).map(function (a) {
                                        return a.source || '';
                                    }));
                            } else {
                                var e = a.data;
                                (c.message = e.message),
                                    (c.isMessageTrimmed = e.isMessageTrimmed),
                                    (c.stackFrames = null);
                            }
                            return c;
                        }
                        function E(a) {
                            var b = a.data;
                            switch (a.type) {
                                case p.CONSOLE_LOG:
                                    return D(a);
                                case p.CONSOLE_ERROR:
                                    return D(a);
                                case p.CONSOLE_WARN:
                                    return D(a);
                                case p.CONSOLE_DEBUG:
                                    return D(a);
                                case p.MOUSE_CLICK:
                                    return {
                                        top: b.y,
                                        left: b.x,
                                        absoluteTop: b.pageY,
                                        absoluteLeft: b.pageX,
                                        selector: b.selector,
                                    };
                                case p.DOM_SNAPSHOT:
                                    return { pageUrl: b.pageUrl };
                                case p.WINDOW_RESIZE:
                                    return { width: b.width, height: b.height };
                                case p.VISIBILITY_CHANGE:
                                    return { visibilityState: b.visibilityState };
                            }
                        }
                        function F(a) {
                            return {
                                message: a.data.message,
                                level: a.data.level,
                                request: a.data,
                            };
                        }
                        function G() {
                            a.isStreamingLive && ((a.isStreamingLive = !1), Q(), e.fireStopLiveStreaming(a));
                        }
                        function H() {
                            return a.viewerIsCreated && a.timelineIsCreated && a.stepsTimelineIsCreated && !!a.session;
                        }
                        function I(b) {
                            a.activities.push(b);
                            var c = [],
                                d = [],
                                e = [];
                            b.forEach(function (a) {
                                var b = {
                                    time: a.time,
                                    activityIndex: a.playerIndex,
                                    playerIndex: a.playerIndex,
                                    type: a.type,
                                    isLog: A(a),
                                };
                                C(a) && ((b.details = E(a)), c.push(b)),
                                    A(a) && ((b.details = D(a)), d.push(b)),
                                    B(a) && ((b.details = F(a)), e.push(b));
                            }),
                                a.addNewSteps(c),
                                a.addNewLogs(d),
                                a.addNewNetworkRequests(e);
                        }
                        function J(a) {
                            return 'about:blank' === a || a.indexOf('undefined') > -1;
                        }
                        function K() {
                            if (h.isCurrentUserLoaded()) {
                                var a = h.getCurrentUser(),
                                    b = { opened_from: 'timeline_controls' };
                                g.trackEvent(a.id, n.CONSOLE_OPENED, b),
                                    f.log('Console opened from time line controls');
                            }
                        }
                        function L(b, c) {
                            if (c && ((a.activeTool = b), h.isCurrentUserLoaded())) {
                                var d = h.getCurrentUser();
                                g.trackEvent(d.id, n.SUPPORT_TOOLKIT_ENABLED, {
                                    active_tool: b,
                                });
                            }
                            a.setToolIsActive(b, c);
                        }
                        function M() {
                            L(a.CURSOR, !1), L(a.PEN, !1), L(a.CONTROL_TAKEOVER, !1), (a.activeTool = null), (X = null);
                        }
                        function N() {
                            T.sendControlTakeOverRequest(),
                                (a.endUserPermissionAwaiting = !0),
                                (a.endUserDeniedControlTakeOver = !1);
                        }
                        function O(b) {
                            (a.isCollaborativeMode = b), a.setIsCollaborativeMode(a.isCollaborativeMode);
                        }
                        function P() {
                            if (S && S.isToolkitEnabled) {
                                a.enableToolkit(T),
                                    (a.isToolkitEnabled = !0),
                                    (a.isControlTakeoverEnabled = S.isControlTakeoverEnabled);
                                var b = R();
                                a.handleResize(b);
                            }
                        }
                        function Q() {
                            if (S && S.isToolkitEnabled) {
                                (a.isToolkitEnabled = !1), a.exitCollaborativeMode();
                                var b = R();
                                a.handleResize(-b);
                            }
                        }
                        function R() {
                            return b.find('.support-toolkit').height();
                        }
                        if (!i.isBrowserNotSupported()) {
                            var S,
                                T,
                                U = [p.DOM_SNAPSHOT, p.WINDOW_RESIZE, p.VISIBILITY_CHANGE, p.CONSOLE_ERROR];
                            (a.PLAYER_ONLINE_MODE = o.PLAYER_ONLINE_MODE),
                                (a.isPlaying = !1),
                                (a.timelineValue = 0),
                                (a.arePlayerButtonsEnabled = !0),
                                (a.renderingProgress = 0),
                                (a.url = null),
                                (a.speedOptions = [
                                    { label: '0.25x', value: 0.25 },
                                    { label: '0.5x', value: 0.5 },
                                    { label: 'Normal', value: 1 },
                                    { label: '2x', value: 2 },
                                    { label: '4x', value: 4 },
                                ]),
                                (a.steps = []);
                            var V = { playerIndex: -1, time: 0 },
                                W = {
                                    _onTabHiddenCallback: c.noop,
                                    isTabHidden: !1,
                                    lastRenderedActivity: V,
                                    reset: function () {
                                        (this.isTabHidden = !1), (this.lastRenderedActivity = V);
                                    },
                                    render: function (b, d) {
                                        var f = this;
                                        b.forEach(function (b) {
                                            window.ss_debug && console.log(d, b),
                                                A(b) || e.fireExecuteEvent(a, b),
                                                (k.isTabVisibilityChange(b) || (k.isTopLevel(b) && k.isSnapshot(b))) &&
                                                    (f.isTabHidden = b.data.visibilityState == q.HIDDEN);
                                        }),
                                            (f.lastRenderedActivity = c.last(b)),
                                            a.updateStepsTimeline(f.lastRenderedActivity.playerIndex),
                                            a.updateConsole(f.lastRenderedActivity.playerIndex),
                                            f.isTabHidden && setTimeout(f._onTabHiddenCallback, 0);
                                    },
                                    onTabHidden: function (a) {
                                        this._onTabHiddenCallback = a;
                                    },
                                };
                            W.onTabHidden(function () {
                                W.isTabHidden && a.player.skipToTabShown(a.timelineValue);
                            }),
                                (a.activities = new l()),
                                (a.player = new j(a.activities, W, m)),
                                a.player.onTimeChanged(u),
                                a.player.onBuffering(v),
                                a.player.onRendering(w),
                                a.player.onPlaying(x),
                                a.player.onPaused(y),
                                a.player.onFinished(z),
                                (a.detailsStep = 0),
                                (a.logStep = 0),
                                (a.isStreamingLive = !1),
                                (a.isSimpleUIMode = a.settings.general.uiMode === r.SIMPLE),
                                (a.shouldShowLoadingOverlay = !0),
                                (a.isUserOffline = !1);
                            var X;
                            a.activeTool,
                                (a.endUserPermissionAwaiting = !1),
                                (a.endUserDeniedControlTakeOver = !1),
                                (a.isCollaborativeMode = !1),
                                (a.isConfirmationVisible = !1),
                                (a.CURSOR = s.CURSOR),
                                (a.PEN = s.PEN),
                                (a.CONTROL_TAKEOVER = s.CONTROL_TAKEOVER),
                                (a.settings.playback.speedOption = function (b) {
                                    return arguments.length > 0
                                        ? (a.settings.playback.speed = b.value)
                                        : c.find(a.speedOptions, function (b) {
                                              return b.value === a.settings.playback.speed;
                                          });
                                }),
                                a.$watch('initialSettings', function (b) {
                                    b && a.api.loadSession(b);
                                }),
                                a.$watch(H, function (b) {
                                    b &&
                                        (e.firePlayerIsInitialized(a),
                                        a.hideUserDetailsMask(),
                                        a.hideStepsTimelineMask(),
                                        (a.shouldShowLoadingOverlay = !1),
                                        a.enableTimeline());
                                }),
                                a.$watch(
                                    function () {
                                        return a.viewerIsCreated && !!a.session;
                                    },
                                    function (b) {
                                        b &&
                                            (a.viewerApi.setSessionScreenWidth(a.session.screenWidth),
                                            a.viewerApi.setSessionScreenHeight(a.session.screenHeight),
                                            a.viewerApi.setInitialSettings(a.initialSettings),
                                            e.fireVisualizeClicks(a, a.settings.playback.shouldVisualizeClicks));
                                    }
                                ),
                                a.$watch('isTimelineSelectionInProgress', function (b) {
                                    H() && b && a.pause();
                                }),
                                a.$watch('timelineSelectedValue', function (b) {
                                    H() &&
                                        (window.ss_debug && console.log('jump to', b),
                                        a.player.jumpToTime(b),
                                        G(),
                                        (a.isPlaying = !0),
                                        (a.hasFinished = !1),
                                        a.api.setUserHasGoneOffline(!1));
                                }),
                                a.$watch('settings.playback.shouldSkipProlongedInactivity', function (b) {
                                    a.player.changeProlongedInactivitySetting(b, a.timelineValue);
                                }),
                                a.$watch('settings.playback.speed', function (b) {
                                    a.player.changeSpeedSetting(b, a.timelineValue);
                                }),
                                a.$watch('settings.playback.shouldPauseOnMarker', function (b) {
                                    b && a.pauseActivity
                                        ? a.player.changePauseMarker(a.pauseActivity.time, a.timelineValue)
                                        : a.player.changePauseMarker(null, a.timelineValue);
                                }),
                                a.$watch('settings.playback.shouldVisualizeClicks', function (b) {
                                    e.fireVisualizeClicks(a, b);
                                }),
                                (a.togglePlaying = function () {
                                    a.isPlaying ? a.pause() : a.play();
                                }),
                                (a.start = function () {
                                    window.ss_debug && console.log('firststart activities'),
                                        a.player.jumpToTime(a.startTime),
                                        (a.isStreamingLive = !1),
                                        (a.isPlaying = !0),
                                        (a.hasFinished = !1),
                                        (a.timelineValue = a.startTime),
                                        a.api.setUserHasGoneOffline(!1);
                                }),
                                (a.play = function () {
                                    window.ss_debug && console.log('play activities'),
                                        a.player.play(a.timelineValue),
                                        (a.isStreamingLive = !1),
                                        (a.isPlaying = !0),
                                        (a.hasFinished = !1);
                                }),
                                (a.pause = function () {
                                    window.ss_debug && console.log('pause activities');
                                    var b = a.isStreamingLive;
                                    a.player.pause(), G(), (a.isPlaying = !1), (a.hasFinished = b);
                                }),
                                (a.repeat = function () {
                                    a.start();
                                }),
                                (a.goLive = function () {
                                    window.ss_debug && console.log('go live'),
                                        a.activities.resetLoading(),
                                        a.player.goLive(a.timelineValue),
                                        (a.isStreamingLive = !0),
                                        (a.isPlaying = !0),
                                        (a.hasFinished = !1),
                                        (a.timelineValue = a.timelineMax),
                                        a.stepsTimelineLoaded(),
                                        e.fireStartLiveStreaming(a, c.noop),
                                        P();
                                }),
                                (a.showSessionDetails = function (b) {
                                    f.log("Clicked on 'Details'"), a.pause(), d.open(b);
                                }),
                                (a.onSelectedActivity = function (b) {
                                    window.ss_debug && console.log('selected activitiy', b),
                                        a.player.jumpToActivity(b),
                                        G(),
                                        (a.isPlaying = !1),
                                        (a.hasFinished = !1),
                                        (a.timelineValue = b.time),
                                        a.updateStepsTimeline(b.playerIndex, !0),
                                        a.selectActivity(b),
                                        a.api.setUserHasGoneOffline(!1);
                                }),
                                (a.userPermissionRequest = {
                                    ignore: !0,
                                    state: null,
                                    isApproved: function () {
                                        return this.ignore || 'approved' === this.state;
                                    },
                                    send: function () {
                                        'awaiting-response' != this.state &&
                                            ((this.state = 'awaiting-response'), e.fireUserPermissionRequestSend(a));
                                    },
                                    cancel: function () {
                                        'canceled' != this.state &&
                                            ((this.state = 'canceled'), e.fireUserPermissionRequestCanceled(a));
                                    },
                                    deny: function () {
                                        'denied-request' != this.state && (this.state = 'denied-request');
                                    },
                                    approve: function () {
                                        'approved' != this.state && (this.state = 'approved');
                                    },
                                    interrupt: function () {
                                        'interrupted-request' != this.state && (this.state = 'interrupted-request');
                                    },
                                    reset: function () {
                                        this.state && (this.state = null);
                                    },
                                }),
                                (a.getLiveState = function () {
                                    return a.showGoLiveButton
                                        ? a.isStreamingLive
                                            ? 'streaming'
                                            : a.isUserOffline
                                            ? 'offline'
                                            : 'online'
                                        : 'none';
                                }),
                                (a.playUserRecordedSession = function () {
                                    a.playRecordedSession();
                                }),
                                (a.api = {
                                    loadSession: function (b) {
                                        (a.userPermissionRequest.ignore = !b.shouldWaitUserConfirmation()),
                                            (a.session = b.getSession()),
                                            (a.isLive = b.isLive()),
                                            (a.showGoLiveButton = b.shouldShowGoLiveButton()),
                                            (a.startTime = b.getStartTime()),
                                            (a.pauseActivity = b.getPauseActivity()),
                                            (a.initialSettings = b),
                                            (a.sessionId = a.session.id),
                                            a.pauseActivity &&
                                                a.settings.playback.shouldPauseOnMarker &&
                                                a.player.changePauseMarker(a.pauseActivity.time);
                                    },
                                    setSessionLength: function (b) {
                                        (a.timelineMax = b), a.activities.setSessionLength(b);
                                    },
                                    finishLoadingActivities: function () {
                                        a.activities.finishLoading(),
                                            a.refreshTimeline(!0, []),
                                            a.stepsTimelineLoaded();
                                    },
                                    addActivities: function (b) {
                                        I(b), a.refreshTimeline(!1, b);
                                    },
                                    denyStreamingRequest: function () {
                                        a.userPermissionRequest.deny();
                                    },
                                    interruptStreamingRequest: function () {
                                        a.userPermissionRequest.interrupt();
                                    },
                                    resetStreamingRequest: function () {
                                        a.userPermissionRequest.reset();
                                    },
                                    approveStreamingRequest: function () {
                                        a.userPermissionRequest.approve(), this.startLiveStreaming();
                                    },
                                    startPlayback: function () {
                                        a.start();
                                    },
                                    startLiveStreaming: function () {
                                        a.isStreamingLive || a.goLive();
                                    },
                                    stopLiveStreaming: function () {
                                        a.isStreamingLive && a.pause();
                                    },
                                    setFeatureFlags: function (a) {
                                        S = a;
                                    },
                                    setBrokerClient: function (b) {
                                        (T = b),
                                            T.onControlTakeOverRequestApproved(function () {
                                                L(X, !0), O(!0), (a.endUserPermissionAwaiting = !1);
                                            }),
                                            T.onControlTakeOverRequestDenied(function () {
                                                (a.endUserPermissionAwaiting = !1),
                                                    (a.endUserDeniedControlTakeOver = !0);
                                            }),
                                            T.onControlTakeOverRequestStopped(function () {
                                                a.exitCollaborativeMode();
                                            });
                                    },
                                    setUserHasGoneOffline: function (b) {
                                        b && (a.isUserOffline = !0), a.setIsOffline(b);
                                    },
                                }),
                                e.onUserDetailsResize(a, function (b, c) {
                                    a.handleUserDetailsResize(c);
                                }),
                                e.onConsoleResize(a, function (b, c) {
                                    a.handleResize(c);
                                }),
                                e.onOpenConsole(a, function (b, c) {
                                    a.openConsole(c);
                                }),
                                (a.toggleConsole = function () {
                                    a.isConsoleExpanded ? a.closeConsole() : (K(), a.openConsole(null));
                                }),
                                (a.updateUrl = function (b) {
                                    J(b) || (a.url = b);
                                }),
                                (a.toggleTool = function (b) {
                                    if (
                                        b !== a.CONTROL_TAKEOVER ||
                                        X !== a.CONTROL_TAKEOVER ||
                                        !a.endUserPermissionAwaiting
                                    ) {
                                        if (a.isCollaborativeMode) {
                                            var c = b !== a.activeTool;
                                            if ((M(), !c)) return;
                                            b !== a.CONTROL_TAKEOVER
                                                ? (L(b, !0), (a.endUserPermissionAwaiting = !1))
                                                : ((X = b), N());
                                        } else
                                            (X = b), (a.isConfirmationVisible = !0), (a.endUserPermissionAwaiting = !1);
                                        a.endUserDeniedControlTakeOver = !1;
                                    }
                                }),
                                (a.exitCollaborativeMode = function () {
                                    M(), O(!1), (a.isConfirmationVisible = !1);
                                }),
                                (a.goToCollaborativeMode = function () {
                                    (a.isConfirmationVisible = !1), X !== a.CONTROL_TAKEOVER ? (L(X, !0), O(!0)) : N();
                                }),
                                (a.cancelCollaborativeConfirmation = function () {
                                    (a.isConfirmationVisible = !1), (X = null);
                                });
                        }
                    },
                };
            },
        ]),
    angular
        .module('playerApp')
        .constant('STYLESHEETS_SELECTOR', 'style, link[rel="stylesheet"]')
        .constant('KEYSTROKE_OPTIONS', { END_USER_TYPE_DELAY_SECONDS: 2 })
        .directive('sessionViewer', [
            '$timeout',
            '$interval',
            'player',
            'utils',
            'sessionstackManager',
            'DocumentNode',
            'AsyncWhile',
            'VIEWER_MARGINS',
            'SCROLL_POSITION_CHANGE',
            'EVENT_TYPE',
            'SESSIONSTACK_HOVER_CLASS',
            'STYLESHEETS_SELECTOR',
            'PROCESS_HOVER_STYLES_CONFIG',
            'ELEMENTS',
            'KEYSTROKE_OPTIONS',
            'FULL_SCREEN_CLASS',
            function (a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/viewer.html',
                    replace: !0,
                    scope: {
                        maxWidth: '=',
                        maxHeight: '=',
                        isCreated: '=',
                        renderingProgress: '=',
                        showLoadingAnimation: '=',
                        sessionId: '=',
                        handleResize: '=',
                        enableToolkit: '=',
                        setToolIsActive: '=',
                        setIsCollaborativeMode: '=',
                        setIsOffline: '=',
                        api: '=',
                        updateUrl: '=',
                        playUserRecordedSession: '=',
                    },
                    link: function (b, e, l) {
                        function m(a, b) {
                            var c = oa();
                            if (c) {
                                var d = c.elementFromPoint(a, b);
                                if (d) {
                                    for (var e = a, f = b; d.contentDocument || d.shadowRoot; ) {
                                        var g;
                                        if (d.contentDocument) {
                                            var h = d.getBoundingClientRect();
                                            (e -= h.left), (f -= h.top), (g = d.contentDocument.elementFromPoint(e, f));
                                        }
                                        if (
                                            (d.shadowRoot && (g = d.shadowRoot.elementFromPoint(e, f)),
                                            !g || ya.getNodeId(d) === ya.getNodeId(g))
                                        )
                                            break;
                                        d = g;
                                    }
                                    return d;
                                }
                            }
                        }
                        function q(a) {
                            b.sessionScreenWidth = a;
                            var c = e.parent().height();
                            u(b.maxWidth, c, a, b.sessionScreenWidth), ta || (ta = a);
                        }
                        function r(a) {
                            b.sessionScreenHeight = a;
                            var c = e.parent().height();
                            u(b.maxWidth, c, b.sessionScreenWidth, a), ua || (ua = a);
                        }
                        function s(a, b) {
                            Aa[a] = b;
                        }
                        function t(a) {
                            return Aa[a];
                        }
                        function u(a, c, d, e) {
                            var f = a - 2 * h.HORIZONTAL,
                                g = c - 2 * h.VERTICAL,
                                i = 1,
                                j = 1;
                            0 !== d && (i = d < f ? 1 : f / d),
                                0 !== e && (j = e < g ? 1 : g / e),
                                (b.scale = Math.min(i, j));
                            var k = d * b.scale,
                                l = e * b.scale;
                            f > k ? (b.marginLeft = (a - k) / 2) : (b.marginLeft = h.HORIZONTAL),
                                g > l ? (b.marginTop = (c - l) / 2) : (b.marginTop = h.VERTICAL),
                                xa.css({ width: d, height: e });
                        }
                        function v() {
                            ya.isAttached && (va && va.cancel(), ya.detach());
                        }
                        function w() {
                            if (ja()) {
                                var a = wa.contents().find('#glassboard-splash-screen');
                                a.length > 0 && a.attr('style', 'z-index:-10');
                            }
                        }
                        function x(a, b) {
                            ya.isAttached ||
                                ya.attach(function () {
                                    w(), y(), z(), ca(), da(), angular.isFunction(b) && b();
                                });
                        }
                        function y() {
                            C({ top: Fa.top, left: Fa.left }),
                                angular.forEach(Ea, function (a, b) {
                                    var c = t(b);
                                    c(a);
                                }),
                                angular.forEach(Object.keys(Ga), function (a) {
                                    C(Ga[a]);
                                });
                        }
                        function z() {
                            ya.isAttached &&
                                ya.traverseDocuments(za, function (a) {
                                    D(a.documentElement);
                                });
                        }
                        function A(b) {
                            var c = Ca[b.id],
                                d = angular.element(E(b.id));
                            c && (c.cancel(), delete Ca[b.id]);
                            var e = function () {
                                    return d.scrollLeft() !== b.left || d.scrollTop() !== b.top;
                                },
                                f = function () {
                                    a(function () {
                                        d.scrollTop(b.top), d.scrollLeft(b.left);
                                    });
                                },
                                h = { maxIterations: i.MAX_RETRIES, waitTime: i.TIMEOUT };
                            (Ca[b.id] = new g(e, f, h)), Ca[b.id].start();
                        }
                        function B(b) {
                            var c = Ba[b.id],
                                d = angular.element(ya.getNode(b.id));
                            if (d && !d.is(n.HTML)) {
                                c && (c.cancel(), delete Ba[b.id]);
                                var e = function () {
                                        return d.scrollTop() !== b.top || d.scrollLeft() !== b.left;
                                    },
                                    f = function () {
                                        a(function () {
                                            d.scrollTop(b.top), d.scrollLeft(b.left);
                                        });
                                    },
                                    h = { maxIterations: i.MAX_RETRIES, waitTime: i.TIMEOUT };
                                (Ba[b.id] = new g(e, f, h)), Ba[b.id].start();
                            }
                        }
                        function C(a) {
                            var b = t(j.SCROLL_POSITION_CHANGE);
                            b(a);
                        }
                        function D(a) {
                            ya.traverseNode(a, function (a) {
                                var b = ya.getNodePropertyObject(a);
                                if (b.top || b.left) {
                                    var c = { id: b.nodeId, top: b.top, left: b.left };
                                    Ga[c.id] || C(c);
                                }
                            });
                        }
                        function E(a) {
                            var b = F(a);
                            return b && b.shadowRoot ? b : ((b && b.contentWindow) || (b = F()), b.contentWindow);
                        }
                        function F(a) {
                            return angular.isDefined(a) ? ya.getNode(a) : wa[0];
                        }
                        function G(a, c, d) {
                            var e = { id: d, top: a, left: c, windowScroll: !0 };
                            ya.isAttached &&
                                (A(e),
                                angular.isUndefined(d) && b.viewerOverlay && b.viewerOverlay.setScrollPosition(a, c)),
                                angular.isUndefined(d) ? (Fa = { top: a || 0, left: c || 0 }) : (Ga[d] = e);
                        }
                        function H(a, b) {
                            M(b);
                        }
                        function I(a, b) {
                            var c = b.type,
                                d = b.data,
                                e = t(c);
                            e && d && e(d);
                        }
                        function J(a) {
                            b.viewerOverlay &&
                                ('prerender' === a || 'hidden' === a
                                    ? b.viewerOverlay.showVisibilityOverlay(a)
                                    : b.viewerOverlay.hideVisibilityOverlay(),
                                (b.visibilityState = a));
                        }
                        function K(a) {
                            M(a);
                        }
                        function L(a) {
                            b.updateUrl(a.url);
                        }
                        function M(c) {
                            if (ya && c) {
                                var e = !c.hostElementId && !c.frameElementId;
                                if (e) {
                                    b.updateUrl(c.pageUrl),
                                        (Ea = {}),
                                        (Ga = {}),
                                        (Fa = { top: c.top, left: c.left }),
                                        d.isDefined(c.visibilityState) &&
                                            b.visibilityState !== c.visibilityState &&
                                            J(c.visibilityState),
                                        c.nestedSnapshots &&
                                            c.nestedSnapshots.forEach(function (a) {
                                                M(a);
                                            });
                                    var f = c.screenWidth || ta,
                                        g = c.screenHeight || ua;
                                    ya.isAttached
                                        ? (q(f),
                                          r(g),
                                          b.viewerOverlay && b.viewerOverlay.setScrollPosition(Fa.top, Fa.left))
                                        : (Ea[j.WINDOW_RESIZE] = { width: f, height: g });
                                }
                                var h = b.initialSettings.getCustomOrigin();
                                ya.write(c, h, b.sessionId),
                                    w(),
                                    G(c.top, c.left, c.hostElementId || c.frameElementId),
                                    c.nodesScrollPositions &&
                                        angular.forEach(c.nodesScrollPositions, function (a, b) {
                                            Ga[b] = { id: b, top: a.top, left: a.left };
                                        }),
                                    a(z),
                                    ea(c.frameElementId, c.hostElementId);
                            }
                        }
                        function N(a) {
                            if (!Da) return !1;
                            var b = Date.now() - Da,
                                c = d.millisecondsToSeconds(b);
                            return Math.floor(c) <= a;
                        }
                        function O(a) {
                            if (!N(o.END_USER_TYPE_DELAY_SECONDS)) {
                                var b = angular.element(ya.getNode(a.id));
                                b.val(a.value);
                            }
                        }
                        function P(a) {
                            if (ya.isAttached && b.viewerOverlay) {
                                var c = b.getFrameElementOffset(a.frameElementId),
                                    d = a.y + c.top,
                                    e = a.x + c.left;
                                b.viewerOverlay.setCursorPosition({ top: d, left: e });
                            } else Ea[j.MOUSE_MOVE] = a;
                        }
                        function Q(a) {
                            if ((P(a), ya.isAttached && b.viewerOverlay)) {
                                var c = b.getFrameElementOffset(a.frameElementId),
                                    d = Fa.top + a.y + c.top,
                                    e = Fa.left + a.x + c.left;
                                b.viewerOverlay.registerClick(d, e);
                            }
                        }
                        function R(a) {
                            var b = angular.element(ya.getNode(a.id));
                            b && (b.addClass(k), b.parents().addClass(k));
                        }
                        function S(a) {
                            var b = angular.element(ya.getNode(a.id));
                            b && (b.removeClass(k), b.parents().removeClass(k));
                        }
                        function T(a) {
                            a.id ? (Ga[a.id] = a) : (Fa = { top: a.top || 0, left: a.left || 0 }),
                                ya.isAttached &&
                                    (a.id ? (a.windowScroll ? G(a.top, a.left, a.id) : B(a)) : G(a.top, a.left));
                        }
                        function U(a) {
                            ya.isAttached
                                ? (q(a.width),
                                  r(a.height),
                                  b.viewerOverlay && b.viewerOverlay.setScrollPosition(Fa.top, Fa.left))
                                : (Ea[j.WINDOW_RESIZE] = a);
                        }
                        function V(a) {
                            var b = angular.element(ya.getNode(a.id));
                            b.prop('checked', a.state);
                        }
                        function W(a) {
                            var b = angular.element(ya.getNode(a.id));
                            b.prop('checked', a.state);
                        }
                        function X(a) {
                            ha(a.addedOrMoved), la(a.removed), na(a.characterData), ma(a.attributes);
                        }
                        function Y(a) {
                            J(a.visibilityState);
                        }
                        function Z(a) {
                            var b;
                            (b = void 0 === a.nodeId ? ya.documentContainer.contentDocument : ya.getNode(a.nodeId)),
                                (ya.adoptedStyleSheetNodes[a.nodeId] = b);
                            var c = ya.getNodePropertyObject(b);
                            (c.adoptedStyleSheets = a.styles), ya.isAttached && d.addAdoptedStyleSheets(b, a.styles);
                        }
                        function $(a) {
                            var b = ya.getNode(a.nodeId),
                                c = ya.getNodePropertyObject(b);
                            if (
                                ((ya.styleRuleNodes[a.nodeId] = b),
                                (c.styleRules = c.styleRules || []),
                                isNaN(a.index) ? c.styleRules.push(a.rule) : c.styleRules.splice(a.index, 0, a.rule),
                                ya.isAttached)
                            )
                                try {
                                    var d = isNaN(a.index) ? b.sheet.cssRules.length : a.index;
                                    b.sheet.insertRule(a.rule, d);
                                } catch (e) {}
                        }
                        function _(a) {
                            var b = ya.getNode(a.nodeId),
                                c = ya.getNodePropertyObject(b);
                            if (
                                ((ya.styleRuleNodes[a.nodeId] = b),
                                (c.styleRules = c.styleRules || []),
                                c.styleRules.length > a.index && c.styleRules.splice(a.index, 1),
                                ya.isAttached)
                            )
                                try {
                                    b.sheet.deleteRule(a.index);
                                } catch (d) {}
                        }
                        function aa(a) {
                            var b = angular.element(ya.getNode(a.nodeId));
                            b.addClass(p), ya.addFullScreenNode(a.nodeId);
                        }
                        function ba(a) {
                            ya.traverseFullScreenNodes(function (a) {
                                angular.element(a).removeClass(p);
                            });
                        }
                        function ca() {
                            d.forEach(ya.styleRuleNodes, fa);
                        }
                        function da() {
                            d.forEach(ya.adoptedStyleSheetNodes, function (a) {
                                var b = ya.getNodePropertyObject(a);
                                d.addAdoptedStyleSheets(a, b.adoptedStyleSheets);
                            });
                        }
                        function ea(a, b) {
                            d.forEach(ya.styleRuleNodes, function (c) {
                                var d = ya.getNodePropertyObject(c);
                                d.frameElementId === a && d.hostElementId === b && fa(c);
                            });
                        }
                        function fa(a) {
                            if (a && a.sheet) {
                                var b = ya.getNodePropertyObject(a);
                                b.styleRules &&
                                    (ga(a),
                                    b.styleRules.forEach(function (b, c) {
                                        try {
                                            b.indexOf('inset:') >= 0 && (b = d.replaceInsetStyleRule(b)),
                                                a.sheet.insertRule(b, c);
                                        } catch (e) {}
                                    }));
                            }
                        }
                        function ga(a) {
                            for (; a.sheet.cssRules.length > 0; ) a.sheet.deleteRule(0);
                        }
                        function ha(a) {
                            a &&
                                angular.forEach(a, function (a) {
                                    var b;
                                    if (a.node) {
                                        var c = ia(a),
                                            d = c ? c.hostElementId : null,
                                            e = c ? c.frameElementId : null;
                                        b = ya.createElement(a.node, d, e);
                                    } else b = ya.getNode(a.id);
                                    if (a.frameElementId)
                                        a.node && a.node.nodeType !== Node.ELEMENT_NODE
                                            ? a.node.nodeType === Node.DOCUMENT_TYPE_NODE &&
                                              ya.replaceDocType(a.node.docTypeString, a.frameElementId)
                                            : ya.replaceDocumentElement(b, a.frameElementId);
                                    else if (a.previousSiblingId) {
                                        var f = ya.getNode(a.previousSiblingId);
                                        ya.insertAfter(f, b), D(b);
                                    } else if (a.parentId) {
                                        var g = ya.getNode(a.parentId);
                                        g && (ya.prepend(g, b), D(b), ka(g, b) && fa(g));
                                    }
                                    a.node && 'STYLE' === a.node.tagName && a.node.styleRules && fa(b);
                                });
                        }
                        function ia(a) {
                            var b;
                            if (
                                (a.parentId
                                    ? (b = ya.getNode(a.parentId))
                                    : a.previousSiblingId && (b = ya.getNode(a.previousSiblingId)),
                                b)
                            )
                                return ya.getNodePropertyObject(b);
                        }
                        function ja() {
                            return b.initialSettings && b.initialSettings.isAssureCoWorkaroundEnabled();
                        }
                        function ka(a, b) {
                            return (
                                'STYLE' === a.tagName &&
                                d.isWhitespaceString(a.textContent) &&
                                b.nodeType === Node.TEXT_NODE &&
                                d.isWhitespaceString(b.textContent)
                            );
                        }
                        function la(a) {
                            a &&
                                angular.forEach(a, function (a) {
                                    var b = ya.getNode(a.id);
                                    ya.removeNode(b);
                                });
                        }
                        function ma(a) {
                            a &&
                                angular.forEach(a, function (a) {
                                    var b = ya.getNode(a.id);
                                    ya.setAttribute(b, a.name, a.value);
                                });
                        }
                        function na(a) {
                            a &&
                                angular.forEach(a, function (a) {
                                    var b = ya.getNode(a.id);
                                    b && (b.textContent = a.value);
                                });
                        }
                        function oa() {
                            if (wa[0]) return wa[0].contentDocument;
                        }
                        function pa() {
                            return ra().height;
                        }
                        function qa() {
                            return ra().width;
                        }
                        function ra() {
                            var a = oa();
                            return a && a.documentElement
                                ? {
                                      width: a.documentElement.scrollWidth,
                                      height: a.documentElement.scrollHeight,
                                  }
                                : { width: 0, height: 0 };
                        }
                        function sa(a) {
                            (b.initialSettings = a), ya.setSettings(a);
                        }
                        var ta,
                            ua,
                            va,
                            wa = angular.element('#viewer'),
                            xa = angular.element('#viewer-container'),
                            ya = new f(wa[0]),
                            za = void 0,
                            Aa = {},
                            Ba = {},
                            Ca = {},
                            Da = null,
                            Ea = {},
                            Fa = { top: 0, left: 0 },
                            Ga = {};
                        (b.scale = 1),
                            (b.marginLeft = h.HORIZONTAL),
                            (b.marginTop = h.VERTICAL),
                            (b.sessionScreenWidth = 0),
                            (b.sessionScreenHeight = 0),
                            s(j.DOM_ELEMENT_VALUE_CHANGE, O),
                            s(j.DOM_SNAPSHOT, K),
                            s(j.URL_CHANGE, L),
                            s(j.MOUSE_MOVE, P),
                            s(j.MOUSE_CLICK, Q),
                            s(j.MOUSE_OVER, R),
                            s(j.MOUSE_OUT, S),
                            s(j.SCROLL_POSITION_CHANGE, T),
                            s(j.WINDOW_RESIZE, U),
                            s(j.RADIO_BUTTON_CHANGE, V),
                            s(j.CHECKBOX_CHANGE, W),
                            s(j.DOM_MUTATION, X),
                            s(j.VISIBILITY_CHANGE, Y),
                            s(j.CSS_RULE_INSERT, $),
                            s(j.CSS_RULE_DELETE, _),
                            s(j.ADOPTED_STYLE_SHEET_CHANGE, Z),
                            s(j.FULL_SCREEN_ENTER, aa),
                            s(j.FULL_SCREEN_LEAVE, ba),
                            b.$watch('maxWidth', function (a) {
                                a && u(a, b.maxHeight, b.sessionScreenWidth, b.sessionScreenHeight);
                            }),
                            b.$watch('maxHeight', function (a) {
                                a && u(b.maxWidth, a, b.sessionScreenWidth, b.sessionScreenHeight);
                            }),
                            b.$watch('renderingProgress', function (a) {
                                b.viewerOverlay && b.viewerOverlay.setRenderingProgress(a);
                            }),
                            b.$watch('showLoadingAnimation', function (a) {
                                b.viewerOverlay && b.viewerOverlay.showLoadingAnimation(a);
                            }),
                            c.onExecuteEvent(b, I),
                            c.onClear(b, H),
                            c.onPlayerSpeedChange(b, function (a, c) {
                                b.viewerOverlay && b.viewerOverlay.setPlayerSpeed(c);
                            }),
                            c.onVisualizeClicks(b, function (a, c) {
                                b.viewerOverlay && b.viewerOverlay.setShouldVisualizeClicks(c);
                            }),
                            c.onPlayerStarted(b, function (a) {
                                b.viewerOverlay && b.viewerOverlay.startClicksAnimation();
                            }),
                            c.onPlayerStopped(b, function (a) {
                                b.viewerOverlay && b.viewerOverlay.stopClicksAnimation();
                            }),
                            c.onAttach(b, x),
                            c.onDetach(b, v),
                            c.onShowViewerOverlay(b, function () {
                                b.viewerOverlay && b.viewerOverlay.showRenderingOverlay();
                            }),
                            c.onHideViewerOverlay(b, function () {
                                b.viewerOverlay && b.viewerOverlay.hideRenderingOverlay();
                            }),
                            c.onShowBuffering(b, function () {
                                b.viewerOverlay && b.viewerOverlay.showBufferingOverlay();
                            }),
                            c.onHideBuffering(b, function () {
                                b.viewerOverlay && b.viewerOverlay.hideBufferingOverlay();
                            }),
                            c.onHideHiddenTabOverlay(b, function () {
                                b.viewerOverlay && b.viewerOverlay.hideVisibilityOverlay();
                            }),
                            (b.api = {
                                setSessionScreenWidth: q,
                                setSessionScreenHeight: r,
                                setInitialSettings: sa,
                            }),
                            (b.playRecordedSession = function () {
                                b.playUserRecordedSession();
                            }),
                            (b.focusNodeByNodeId = function (a) {
                                var b = ya.getNode(a);
                                b && b.focus();
                            }),
                            (b.getNodeFromPoint = function (a, b) {
                                var c = m(a, b);
                                if (c) {
                                    var d = ya.getNodePropertyObject(c);
                                    return {
                                        nodeId: d.nodeId,
                                        frameElementId: d.frameElementId,
                                        hostElementId: d.hostElementId,
                                        node: c,
                                    };
                                }
                            }),
                            (b.getScrollableNodeFromPoint = function (a, b, c, e) {
                                for (var f = m(a, b); ; ) {
                                    var g = angular.element(f),
                                        h = g.scrollTop(),
                                        i = g.scrollLeft(),
                                        j = Math.floor(h + e),
                                        k = Math.floor(i + c);
                                    g.scrollTop(j), g.scrollLeft(k);
                                    var l = Math.floor(g.scrollTop()) === j,
                                        n = Math.floor(g.scrollLeft()) === k;
                                    if ((g.scrollTop(h), g.scrollLeft(i), l && n)) break;
                                    if (((f = d.getParentElement(f)), f === g[0] || f === wa[0])) break;
                                }
                                var o = ya.getNodePropertyObject(f);
                                return {
                                    nodeId: o.nodeId,
                                    frameElementId: o.frameElementId,
                                    hostElementId: o.hostElementId,
                                };
                            }),
                            (b.getOwnerFrameElementId = function (a) {
                                var b = ya.getNode(a),
                                    c = b.ownerDocument.defaultView.frameElement;
                                return ya.getNodePropertyObject(c).nodeId;
                            }),
                            (b.updateLastTypingTime = function (a) {
                                Da = a;
                            }),
                            (b.getFrameElementOffset = function (a) {
                                var b;
                                return angular.isDefined(a) && (b = ya.getNode(a)), ya.getNodeOffset(b);
                            }),
                            (b.handleResize = function (a) {
                                var c = e.parent().height(),
                                    d = c - a;
                                u(b.maxWidth, d, b.sessionScreenWidth, b.sessionScreenHeight);
                            }),
                            (b.setToolIsActive = function (a, c) {
                                b.viewerOverlay.setToolIsActive(a, c);
                            }),
                            (b.enableToolkit = function (a) {
                                b.viewerOverlay.enableDrawing(a);
                            }),
                            (b.setIsCollaborativeMode = function (a) {
                                b.isCollaborativeMode = a;
                            }),
                            (b.setIsOffline = function (a) {
                                a ? b.viewerOverlay.showOfflineOverlay() : b.viewerOverlay.hideOfflineOverlay();
                            }),
                            b.$watch(pa, function (a) {
                                b.viewerOverlay && b.viewerOverlay.setOverlayHeight(a);
                            }),
                            b.$watch(qa, function (a) {
                                b.viewerOverlay && b.viewerOverlay.setOverlayWidth(a);
                            }),
                            b.$watch('viewerOverlayIsCreated', function (a) {
                                b.isCreated = a;
                            });
                    },
                };
            },
        ]),
    angular.module('playerApp').directive('step', [
        function () {
            return {
                restrict: 'E',
                replace: !0,
                templateUrl: 'templates/step.html',
                scope: {
                    data: '=',
                    isSelected: '=',
                    isExecuted: '=',
                    isExpanded: '=',
                    onStepExpand: '&',
                    selectStep: '&',
                },
                link: function (a, b, c) {
                    a.$watch('data', function (b) {
                        b && ((a.data = b), (a.modalSize = b.modalSize), (a.stepStyle = b.stepStyle));
                    }),
                        a.$watch('updateHorizontalScrollbar', function () {
                            a.updateHorizontalScrollbar && a.updateHorizontalScrollbar('scrollTo', 0);
                        }),
                        (a.showDetails = function () {
                            b
                                .find('.step-details')
                                .slideToggle()
                                .closest('.step')
                                .toggleClass('is-open')
                                .siblings()
                                .removeClass('is-open')
                                .find('.step-details')
                                .slideUp(),
                                a.onStepExpand();
                        });
                },
            };
        },
    ]),
    angular.module('playerApp').directive('stepsTimeline', [
        '$timeout',
        'player',
        'playerSettings',
        'utils',
        'sessionstackManager',
        'lodash',
        'EVENT_TYPE',
        'USER_DETAILS_ANIMATION_TIME',
        function (a, b, c, d, e, f, g, h) {
            return {
                restrict: 'E',
                replace: !0,
                templateUrl: 'templates/stepsTimeline.html',
                scope: {
                    addNewSteps: '=',
                    updateStepsTimeline: '=',
                    onSelectedStep: '=',
                    selectNextStep: '=',
                    disable: '=',
                    enable: '=',
                    isCreated: '=',
                    handleUserDetailsResize: '=',
                    hideMask: '=',
                    loaded: '=',
                },
                link: function (b, i, j) {
                    function k(a, c) {
                        if (((A = a), c || b.isEnabled)) {
                            for (var d, e = 0; e < b.filteredSteps.length && b.filteredSteps[e].activityIndex < A; )
                                e++;
                            (d = b.selectedStep !== e), d && ((b.selectedStep = e), l());
                        }
                    }
                    function l() {
                        if (!v.is(':hover')) {
                            var a = i.find('.steps-section .step').outerHeight();
                            if (a) {
                                var c = b.selectedStep * a,
                                    d = (v.height() - v.offset().top + w.height()) / 3;
                                v.stop().animate({ scrollTop: c - d }, 300);
                            }
                        }
                    }
                    function m(a, c) {
                        d.forEach(a, function (a, d) {
                            b.activityTypeStatuses[a] = c;
                        });
                    }
                    function n(a, c) {
                        c = c || 0;
                        var d = w.outerHeight();
                        void 0 === a && (a = y.outerHeight());
                        var e = b.containerHeight - d - a;
                        x.stop().animate({ height: e }, c), l(), b.$broadcast('$md-resize');
                    }
                    function o(a) {
                        switch (a) {
                            case g.MOUSE_CLICK:
                            case g.WINDOW_RESIZE:
                            case g.VISIBILITY_CHANGE:
                                return 'sm';
                            default:
                                return 'lg';
                        }
                    }
                    function p(a) {
                        var b = o(a.type),
                            c = q(a.type, a.details, a.isLog);
                        c.summary = r(a.type, a.details);
                        var d = c.title + ' ' + (c.summary || '');
                        return (a.modalSize = b), (a.stepStyle = c), (a.searchLabel = d), (a.count = 1), a;
                    }
                    function q(a, b, c) {
                        switch (a) {
                            case g.MOUSE_CLICK:
                                return s('Click', 'ion-mouse', 'black', c);
                            case g.DOM_SNAPSHOT:
                                return s('Visit', 'ion-navigate', 'black', c);
                            case g.WINDOW_RESIZE:
                                return s('Resize', 'ion-arrow-expand', 'black', c);
                            case g.CONSOLE_LOG:
                                return s('Info', 'ion-information-circled', '#2a6ce7', c);
                            case g.CONSOLE_ERROR:
                                return s('Error', 'ion-android-alert', '#ff0944', c);
                            case g.CONSOLE_WARN:
                                return s('Warn', 'ion-alert-circled', '#f0ad4e', c);
                            case g.CONSOLE_DEBUG:
                                return s('Debug', 'ion-bug', '#2a6ce7', c);
                            case g.VISIBILITY_CHANGE:
                                return 'visible' === b.visibilityState
                                    ? s('Tab displayed', 'ion-ios-albums', 'black', c)
                                    : s('Tab hidden', 'ion-ios-albums-outline', 'black', c);
                        }
                    }
                    function r(a, b) {
                        switch (a) {
                            case g.MOUSE_CLICK:
                                return t(b.selector);
                            case g.WINDOW_RESIZE:
                                return b.width + ' x ' + b.height;
                            case g.DOM_SNAPSHOT:
                                return b.pageUrl;
                            case g.CONSOLE_LOG:
                                return b.message;
                            case g.CONSOLE_ERROR:
                                return b.message;
                            case g.CONSOLE_WARN:
                                return b.message;
                            case g.CONSOLE_DEBUG:
                                return b.message;
                            case g.VISIBILITY_CHANGE:
                                return '';
                        }
                    }
                    function s(a, b, c, d) {
                        return { title: a, showTitle: !d, icon: b, color: c };
                    }
                    function t(a) {
                        var b = '';
                        return (
                            d.isArray(a) &&
                                d.forEach(d.reverse(a), function (a, c) {
                                    if ((c > 0 && (b += ' '), a.id)) b += '#' + a.id;
                                    else {
                                        if (!a.tagName)
                                            return void e.warn(
                                                'Element node does not have a tag name. Element index: ' + c
                                            );
                                        (b += a.tagName.toLowerCase()),
                                            a.classes && a.classes.length > 0 && (b += '.' + d.join(a.classes, '.'));
                                    }
                                }),
                            b
                        );
                    }
                    function u() {
                        b.hideFilters(), m(C, !0);
                    }
                    var v = i.find('.md-virtual-repeat-container').children().eq(0),
                        w = i.find('.filter-sections'),
                        x = i.find('.steps-section'),
                        y = i.parent().find('user-identity-details');
                    n(),
                        (b.isEnabled = !0),
                        (b.isLoaded = !1),
                        (b.shouldShowMask = !0),
                        (b.transformedSteps = []),
                        (b.filteredSteps = []),
                        (b.activityTypeStatuses = {}),
                        (b.EVENT_TYPE = g),
                        (b.expandedStepIndex = null),
                        (b.scrollbarConfig = {
                            autoHideScrollbar: !1,
                            theme: 'light',
                            advanced: { updateOnContentResize: !0 },
                            callbacks: {
                                onBeforeUpdate: function () {
                                    $('.step.is-open').is(':nth-last-of-type(-n+4)') &&
                                        b.updateScrollbar('scrollTo', 'bottom');
                                },
                            },
                            mouseWheel: { scrollAmount: 100 },
                            setHeight: 200,
                            scrollInertia: 0,
                        });
                    var z = (function (a, b) {
                            function c(a) {
                                return !i[a.activityIndex];
                            }
                            function e(a) {
                                if (a.isLog) {
                                    var b = g(a),
                                        c = j[b] || [];
                                    c.push(a), (j[b] = c);
                                }
                                i[a.activityIndex] = !0;
                            }
                            function g(a) {
                                return Math.floor(d.millisecondsToSeconds(a.time));
                            }
                            function h(a) {
                                if (a.isLog) {
                                    var b = g(a),
                                        c = j[b] || [];
                                    return f.find(c, function (b) {
                                        return (
                                            b.details.message === a.details.message &&
                                            b.details.level === a.details.level &&
                                            b.details.stackFrames === a.details.stackFrames
                                        );
                                    });
                                }
                            }
                            var i = {},
                                j = {},
                                k = a;
                            return {
                                addNewStep: function (a) {
                                    if (a && c(a)) {
                                        var d = h(a);
                                        if (d) (d.activityIndex = a.activityIndex), d.count++;
                                        else {
                                            var f = b(a);
                                            k.push(f);
                                        }
                                        e(a);
                                    }
                                },
                            };
                        })(b.transformedSteps, p),
                        A = -1,
                        B = [g.MOUSE_CLICK, g.WINDOW_RESIZE, g.DOM_SNAPSHOT, g.VISIBILITY_CHANGE, g.CONSOLE_ERROR],
                        C = c.getActivitiesFilterFromUrl();
                    (b.updateStepsTimeline = function (a, b) {
                        k(a, b);
                    }),
                        (b.setLastPlayedActivity = function (a) {
                            k(a);
                        }),
                        (b.addNewSteps = function (a) {
                            d.isArray(a) && f.forEach(a, z.addNewStep);
                        }),
                        (b.updateSelectedStep = function () {
                            a(function () {
                                k(A);
                            }, 0);
                        }),
                        (b.selectStep = function (a) {
                            if (!(b.selectedStep === a || a < 0 || a >= b.filteredSteps.length)) {
                                var c = b.filteredSteps[a];
                                b.onSelectedStep(c), (b.selectedStep = a), l();
                            }
                        }),
                        (b.selectNextStep = function () {
                            b.selectStep(b.selectedStep + 1);
                        }),
                        (b.enable = function () {
                            b.isEnabled = !0;
                        }),
                        (b.disable = function () {
                            b.isEnabled = !1;
                        }),
                        (b.loaded = function () {
                            b.isLoaded = !0;
                        }),
                        (b.hasInactiveFilters = function () {
                            var a = !1;
                            return (
                                d.forEach(b.activityTypeStatuses, function (b, c) {
                                    b || (a = !0);
                                }),
                                a
                            );
                        }),
                        (b.toggleFilter = function (a) {
                            (b.activityTypeStatuses[a] = !b.activityTypeStatuses[a]), b.updateSelectedStep();
                        }),
                        (b.showFilters = function () {
                            m(B, !0), b.updateSelectedStep();
                        }),
                        (b.hideFilters = function () {
                            m(B, !1), b.updateSelectedStep();
                        }),
                        b.$watch('containerHeight', function (a) {
                            a && n();
                        }),
                        (b.handleUserDetailsResize = function (a) {
                            n(a, h);
                        }),
                        (b.onStepExpand = function (a) {
                            b.expandedStepIndex === a ? (b.expandedStepIndex = null) : (b.expandedStepIndex = a);
                        }),
                        (b.hideMask = function () {
                            b.shouldShowMask = !1;
                        }),
                        u(),
                        (b.isCreated = !0);
                },
            };
        },
    ]),
    angular.module('playerApp').directive('userIdentityDetails', [
        'player',
        'userIdentityService',
        'NOT_AVAILABLE',
        'USER_DETAILS_ANIMATION_TIME',
        function (a, b, c, d) {
            return {
                restrict: 'E',
                templateUrl: 'templates/userIdentityDetails.html',
                scope: { userIdentityData: '=', hideMask: '=' },
                link: function (e, f, g) {
                    function h(a) {
                        a = a || {};
                        var d = b.formatCustomFields(a.customFields);
                        d.unshift({ label: 'User ID', value: a.identifier || c }),
                            (e.displayName = a.displayName || c),
                            (e.email = a.email),
                            (e.expandableItems = d);
                    }
                    function i() {
                        var b = n.height();
                        k();
                        var c = n.height(),
                            d = o.outerHeight();
                        l(b), a.fireUserDetailsResize(e, d), m(c);
                    }
                    function j() {
                        var b = o.height() - n.height();
                        n.animate({ height: 0 }, d),
                            a.fireUserDetailsResize(e, b),
                            setTimeout(function () {
                                n.addClass('collapsed');
                            }, d);
                    }
                    function k() {
                        n.css('height', 'auto'), n.removeClass('collapsed');
                    }
                    function l(a) {
                        n.height(a), n.addClass('collapsed');
                    }
                    function m(a) {
                        setTimeout(function () {
                            n.animate({ height: a }, d), n.removeClass('collapsed');
                        });
                    }
                    (e.isExpanded = !1), (e.shouldShowMask = !0);
                    var n = f.find('.expandable-user-details'),
                        o = n.parent();
                    e.$watch('userIdentityData', function (a) {
                        h(a);
                    }),
                        (e.scrollbarConfig = {
                            autoHideScrollbar: !1,
                            theme: 'light',
                            mouseWheel: { scrollAmount: 50 },
                            scrollInertia: 0,
                        }),
                        (e.toggleUserDetails = function (a) {
                            'Range' !== a.view.getSelection().type &&
                                (e.isExpanded ? j() : i(), (e.isExpanded = !e.isExpanded));
                        }),
                        (e.hideMask = function () {
                            e.shouldShowMask = !1;
                        });
                },
            };
        },
    ]),
    angular.module('playerApp').directive('viewerOverlay', [
        'ClicksManager',
        function (a) {
            return {
                restrict: 'E',
                templateUrl: 'templates/viewerOverlay.html',
                replace: !0,
                scope: {
                    width: '=',
                    height: '=',
                    scale: '=',
                    api: '=',
                    getNode: '=',
                    getScrollableNode: '=',
                    focusNode: '=',
                    updateLastTyping: '=',
                    getFrameElementOffset: '=',
                    isCreated: '=',
                    playRecordedSession: '&',
                },
                link: function (b, c, d) {
                    var e = new a(),
                        f = angular.element('.click-elements-overlay'),
                        g = angular.element('.drawing-container'),
                        h = angular.element('.cursor');
                    (b.getElement = function (a, c) {
                        return b.getNode(a, c);
                    }),
                        (b.getScrollableElement = function (a, c, d, e) {
                            return b.getScrollableNode(a, c, d, e);
                        }),
                        (b.getFrameOffset = function (a) {
                            return b.getFrameElementOffset(a);
                        }),
                        (b.updateLastTypingTime = function (a) {
                            return b.updateLastTyping(a);
                        }),
                        (b.focusElement = function (a) {
                            return b.focusNode(a);
                        }),
                        (b.api = {
                            setCursorPosition: function (a) {
                                a && h.css({ left: a.left, top: a.top });
                            },
                            registerClick: function (a, b) {
                                var c = e.registerClick(a, b);
                                c && f.append(c);
                            },
                            setScrollPosition: function (a, b) {
                                f.css({ top: -a, left: -b }), g.css({ top: -a, left: -b });
                            },
                            setRenderingProgress: function (a) {
                                if (a) {
                                    var c = (a.current / a.total) * 100;
                                    b.renderingProgressPercentage = Math.round(c);
                                }
                            },
                            showRenderingOverlay: function () {
                                b.shouldShowRenderingOverlay = !0;
                            },
                            hideRenderingOverlay: function () {
                                b.shouldShowRenderingOverlay = !1;
                            },
                            setPlayerSpeed: function (a) {
                                e.setPlayerSpeed(a);
                            },
                            setShouldVisualizeClicks: function (a) {
                                e.setShouldVisualizeClicks(a);
                            },
                            startClicksAnimation: function () {
                                e.startClicksAnimation();
                            },
                            stopClicksAnimation: function () {
                                e.stopClicksAnimation();
                            },
                            showVisibilityOverlay: function (a) {
                                (b.visibilityState = a), (b.shouldShowVisibilityOverlay = !0);
                            },
                            hideVisibilityOverlay: function () {
                                b.shouldShowVisibilityOverlay = !1;
                            },
                            showBufferingOverlay: function () {
                                b.shouldShowBufferingOverlay = !0;
                            },
                            hideBufferingOverlay: function () {
                                b.shouldShowBufferingOverlay = !1;
                            },
                            enableDrawing: function (a) {
                                b.drawingApi.enableDrawing(a);
                            },
                            setToolIsActive: function (a, c) {
                                b.drawingApi.setToolIsActive(a, c);
                            },
                            setOverlayHeight: function (a) {
                                b.overlayHeight = a;
                            },
                            setOverlayWidth: function (a) {
                                b.overlayWidth = a;
                            },
                            showOfflineOverlay: function () {
                                (b.shouldShowBufferingOverlay = !1), (b.shouldShowOfflineOverlay = !0);
                            },
                            hideOfflineOverlay: function () {
                                b.shouldShowOfflineOverlay = !1;
                            },
                        }),
                        b.$watch('drawingOverlayIsCreated', function (a) {
                            b.isCreated = a;
                        });
                },
            };
        },
    ]),
    angular.module('playerApp').filter('activityTypesFilter', [
        'utils',
        function (a) {
            return function (b, c) {
                if (!c) return b;
                var d = [];
                return (
                    a.forEach(b, function (a) {
                        c[a.type] && d.push(a);
                    }),
                    d
                );
            };
        },
    ]),
    angular
        .module('playerApp')
        .constant('TAB_VISIBILITY', { VISIBLE: 'visible', HIDDEN: 'hidden' })
        .factory('Activities', [
            'lodash',
            'AsyncSliceIterator',
            'Activity',
            function (a, b, c) {
                function d() {
                    this._snapshots = [];
                }
                function e(a, b) {
                    (this._iterator = a), (this._predicate = b), (this._done = !1);
                }
                function f() {
                    (this._activities = []),
                        (this._asyncIterator = new b(this._activities, 0, -1)),
                        (this._snapshots = new d());
                }
                return (
                    (d.prototype = {
                        add: function (a) {
                            this._snapshots.push(a);
                        },
                        findBetween: function (b, c) {
                            return a.findLast(this._snapshots, function (a) {
                                return a.playerIndex >= b && a.time < c;
                            });
                        },
                        findBetweenActivities: function (b, c) {
                            return a.findLast(this._snapshots, function (a) {
                                return a.playerIndex >= b && a.playerIndex < c;
                            });
                        },
                        findBefore: function (b) {
                            return a.findLast(this._snapshots, function (a) {
                                return a.time < b;
                            });
                        },
                        findBeforeAcivity: function (b) {
                            return a.findLast(this._snapshots, function (a) {
                                return a.playerIndex < b;
                            });
                        },
                    }),
                    (e.prototype = {
                        onPending: function (a) {
                            this._iterator.onPending(a);
                        },
                        next: function (a) {
                            var b = this;
                            return b._done
                                ? a({ done: !0 })
                                : void b.peek(function (c) {
                                      return c.done
                                          ? a({ done: !0 })
                                          : void b._iterator.next(function (b) {
                                                a(c);
                                            });
                                  });
                        },
                        peek: function (a) {
                            var b = this;
                            return b._done
                                ? a({ done: !0 })
                                : void b._iterator.peek(function (c) {
                                      return c.done
                                          ? a({ done: !0 })
                                          : b._predicate(c.value)
                                          ? void a({ done: !1, value: c.value })
                                          : ((b._done = !0), a({ done: !0 }));
                                  });
                        },
                    }),
                    (f.prototype = {
                        getSessionLength: function () {
                            return this._sessionLength;
                        },
                        setSessionLength: function (a) {
                            this._sessionLength = a;
                        },
                        push: function (b) {
                            var d = this;
                            if (
                                (b.forEach(function (a) {
                                    (a.playerIndex = d._activities.length),
                                        d._asyncIterator.push(a),
                                        c.isTopLevel(a) && c.isSnapshot(a) && d._snapshots.add(a);
                                }),
                                b.length > 0)
                            ) {
                                var e = Math.max(d.getSessionLength(), a.last(b).time);
                                d.setSessionLength(e);
                            }
                        },
                        isLastActivity: function (a) {
                            return !!this._asyncIterator.isFinished() && a === this._asyncIterator.peekLast();
                        },
                        finishLoading: function () {
                            this._asyncIterator.finish();
                        },
                        resetLoading: function () {
                            this._asyncIterator.unfinish();
                        },
                        getIteratorFromStart: function () {
                            return this._asyncIterator.rewind(0), this._asyncIterator;
                        },
                        getIteratorFromClosestSnapshotToTime: function (a) {
                            var b = this._snapshots.findBefore(a),
                                c = b ? b.playerIndex : 0;
                            return (
                                this._asyncIterator.rewind(c),
                                new e(this._asyncIterator, function (b) {
                                    return b.time < a;
                                })
                            );
                        },
                        getIteratorFromClosestSnapshotToActivity: function (a) {
                            var b = this._snapshots.findBeforeAcivity(a.playerIndex),
                                c = b ? b.playerIndex : 0;
                            return (
                                this._asyncIterator.rewind(c),
                                new e(this._asyncIterator, function (b) {
                                    return b.playerIndex < a.playerIndex;
                                })
                            );
                        },
                        getIteratorAfter: function (a) {
                            return this._asyncIterator.rewind(a.playerIndex + 1), this._asyncIterator;
                        },
                        getIteratorAfterEnd: function () {
                            var a = this._asyncIterator.peekLast(),
                                b = a ? a.playerIndex : -1;
                            return this._asyncIterator.rewind(b + 1), this._asyncIterator;
                        },
                        getIteratorBetween: function (a, b) {
                            return (
                                this._asyncIterator.rewind(a.playerIndex + 1),
                                new e(this._asyncIterator, function (a) {
                                    return a.time < b;
                                })
                            );
                        },
                        getIteratorFromClosestSnapshotBetween: function (a, b) {
                            var c = a.playerIndex + 1,
                                d = this._snapshots.findBetween(c, b),
                                f = d ? d.playerIndex : c;
                            return (
                                this._asyncIterator.rewind(f),
                                new e(this._asyncIterator, function (a) {
                                    return a.time < b;
                                })
                            );
                        },
                        getIteratorFromClosestSnapshotBetweenActivities: function (a, b) {
                            var c = a.playerIndex + 1,
                                d = this._snapshots.findBetweenActivities(c, b.playerIndex),
                                f = d ? d.playerIndex : c;
                            return (
                                this._asyncIterator.rewind(f),
                                new e(this._asyncIterator, function (a) {
                                    return a.playerIndex < b.playerIndex;
                                })
                            );
                        },
                        getIteratorFromClosestSnapshotToFirstTabShown: function (a, b) {
                            var d = a.playerIndex + 1,
                                f = this._snapshots.findBetween(d, b);
                            f ? f.playerIndex : d;
                            this._asyncIterator.rewind(a.playerIndex + 1);
                            var g = !1;
                            return new e(this._asyncIterator, function (a) {
                                return (
                                    !g &&
                                    ((g = c.isTabVisible(a) || (c.isTopLevel(a) && c.isVisibleSnapshot(a))), a.time < b)
                                );
                            });
                        },
                    }),
                    f
                );
            },
        ]),
    angular
        .module('playerApp')
        .constant('TAB_VISIBILITY', { VISIBLE: 'visible', HIDDEN: 'hidden' })
        .factory('Activity', [
            'EVENT_TYPE',
            'TAB_VISIBILITY',
            function (a, b) {
                return {
                    isTopLevel: function (a) {
                        return a.data && !a.data.frameElementId && !a.data.hostElementId;
                    },
                    isSnapshot: function (b) {
                        return b.type === a.DOM_SNAPSHOT;
                    },
                    isVisibleSnapshot: function (a) {
                        return this.isSnapshot(a) && a.data.visibilityState === b.VISIBLE;
                    },
                    isTabVisible: function (c) {
                        return c.type === a.VISIBILITY_CHANGE && c.data.visibilityState === b.VISIBLE;
                    },
                    isTabVisibilityChange: function (b) {
                        return b.type === a.VISIBILITY_CHANGE;
                    },
                };
            },
        ]),
    angular.module('playerApp').factory('AsyncSliceIterator', [
        'lodash',
        'SliceIterator',
        function (a, b) {
            function c(c, d, e) {
                (this._syncSlice = new b(c, d, e)),
                    (this._finished = !1),
                    (this._pendingOperations = []),
                    (this._onPending = a.noop);
            }
            return (
                (c.prototype = {
                    next: function (a) {
                        this._isPending() ? this._scheduleOperation('next', a) : a(this._syncSlice.next());
                    },
                    peek: function (a) {
                        this._isPending() ? this._scheduleOperation('peek', a) : a(this._syncSlice.peek());
                    },
                    peekLast: function () {
                        return this._syncSlice.peekLast();
                    },
                    push: function (a) {
                        this._syncSlice.array.push(a), this._retryPendingOperations();
                    },
                    finish: function () {
                        (this._finished = !0), this._retryPendingOperations();
                    },
                    unfinish: function () {
                        (this._finished = !1), this._retryPendingOperations();
                    },
                    isFinished: function () {
                        return this._finished;
                    },
                    rewind: function (a) {
                        (this._pendingOperations = []), this._syncSlice.rewind(a);
                    },
                    onPending: function (a) {
                        this._onPending = a;
                    },
                    _isPending: function () {
                        var a = this._syncSlice.peek();
                        return !this._finished && void 0 === a.value;
                    },
                    _scheduleOperation: function (a, b) {
                        this._pendingOperations.push({ type: a, callback: b }),
                            1 === this._pendingOperations.length && this._onPending();
                    },
                    _retryPendingOperations: function () {
                        var a = this,
                            b = a._pendingOperations;
                        (a._pendingOperations = []),
                            b.forEach(function (b) {
                                'next' === b.type ? a.next(b.callback) : 'peek' === b.type && a.peek(b.callback);
                            });
                    },
                }),
                c
            );
        },
    ]),
    angular.module('playerApp').factory('AsyncWhile', [
        function () {
            function a(b, c) {
                var d = this;
                if (!(d.config.maxIterations && b >= d.config.maxIterations)) {
                    if (!d.condition()) return void (angular.isFunction(c) && c());
                    d.body(),
                        (d.queuedLoop = setTimeout(function () {
                            a.call(d, b + 1, c);
                        }, d.config.waitTime));
                }
            }
            var b = function (a, b, c) {
                (this.condition = a), (this.body = b), (this.config = c);
            };
            return (
                (b.prototype.start = function (b) {
                    a.call(this, 0, b);
                }),
                (b.prototype.cancel = function () {
                    return clearTimeout(this.queuedLoop);
                }),
                b
            );
        },
    ]),
    angular.module('playerApp').factory('BrokerClient', [
        'lodash',
        'EVENT_TYPE',
        function (a, b) {
            function c() {
                (this.firstSnapshotAdded = !1), (this.bufferedData = []), (this.onAddDataListeners = []);
            }
            function d(a) {
                var b = this;
                (b.websocketClient = a),
                    (b.dataConsumer = new c()),
                    (b.streamingRequestDeniedListeners = []),
                    (b.streamingRequestApprovedListeners = []),
                    (b.recorderDisconnectedListeners = []),
                    (b.controlTakeOverRequestApprovedListeners = []),
                    (b.controlTakeOverRequestDeniedListeners = []),
                    (b.controlTakeOverStoppedListeners = []),
                    b.websocketClient.addEventListener('message', function (a) {
                        var c = JSON.parse(a.data);
                        switch (c.type) {
                            case d.EVENTS.ADD_DATA:
                                b.dataConsumer.addData(c.data);
                                break;
                            case d.EVENTS.STREAMING_REQUEST_DENIED:
                                b.streamingRequestDeniedListeners.forEach(function (a) {
                                    a.call(b);
                                });
                                break;
                            case d.EVENTS.STREAMING_REQUEST_APPROVED:
                                b.streamingRequestApprovedListeners.forEach(function (a) {
                                    a.call(b);
                                });
                                break;
                            case d.EVENTS.RECORDER_DISCONNECTED:
                                b.recorderDisconnectedListeners.forEach(function (a) {
                                    a.call(b);
                                });
                                break;
                            case d.EVENTS.CONTROL_TAKE_OVER_APPROVED:
                                b.controlTakeOverRequestApprovedListeners.forEach(function (a) {
                                    a.call(b);
                                });
                                break;
                            case d.EVENTS.CONTROL_TAKE_OVER_DENIED:
                                b.controlTakeOverRequestDeniedListeners.forEach(function (a) {
                                    a.call(b);
                                });
                                break;
                            case d.EVENTS.CONTROL_TAKE_OVER_STOPPED:
                                b.controlTakeOverStoppedListeners.forEach(function (a) {
                                    a.call(b);
                                });
                        }
                    });
            }
            return (
                (c.prototype = {
                    reset: function () {
                        (this.firstSnapshotAdded = !1), (this.onAddDataListeners = []), (this.bufferedData = []);
                    },
                    addData: function (a) {
                        var b = this;
                        a.forEach(function (a) {
                            b.consume(a);
                        }),
                            b.onAddDataListeners.forEach(function (a) {
                                a(b.bufferedData);
                            }),
                            (b.bufferedData = []);
                    },
                    consume: function (a) {
                        this.firstSnapshotAdded ||
                            a.type !== b.DOM_SNAPSHOT ||
                            ((this.firstSnapshotAdded = !0), (a.isFirstLiveActivity = !0)),
                            this.firstSnapshotAdded && this.bufferedData.push(a);
                    },
                    onAddData: function (a) {
                        this.onAddDataListeners.push(a);
                    },
                }),
                (d.EVENTS = {
                    PATH: 'path',
                    HOVER: 'hover',
                    MOUSE_MOVE: 'mouseMove',
                    SCROLL_CHANGE: 'scrollChange',
                    CLICK: 'click',
                    VISUALIZE_CLICK: 'visualizeClick',
                    VISUALIZE_MOUSE_MOVE: 'visualizeMouseMove',
                    EXIT_CURSOR: 'exitCursor',
                    EXIT_CONTROL_TAKE_OVER: 'exitControlTakeOver',
                    ADD_DATA: 'addData',
                    STREAMING_REQUEST: 'streamingRequest',
                    STREAMING_REQUEST_DENIED: 'streamingRequestDenied',
                    STREAMING_REQUEST_APPROVED: 'streamingRequestApproved',
                    STREAMING_REQUEST_CANCELED: 'streamingRequestCanceled',
                    CONTROL_TAKE_OVER_REQUEST: 'controlTakeOverRequest',
                    CONTROL_TAKE_OVER_APPROVED: 'controlTakeOverApproved',
                    CONTROL_TAKE_OVER_DENIED: 'controlTakeOverDenied',
                    CONTROL_TAKE_OVER_STOPPED: 'controlTakeOverStopped',
                    RECORDER_DISCONNECTED: 'recorderDisconnected',
                    KEY_STROKE: 'keyStroke',
                    FOCUS_ELEMENT: 'focusElement',
                }),
                (d.prototype = {
                    connect: function (a) {
                        this.websocketClient.connect(a);
                    },
                    disconnect: function () {
                        (this.streamingRequestDeniedListeners = []),
                            (this.streamingRequestApprovedListeners = []),
                            (this.recorderDisconnectedListeners = []),
                            this.dataConsumer.reset(),
                            this.websocketClient.disconnect();
                    },
                    isConnected: function () {
                        return this.websocketClient.isOpen();
                    },
                    discardPendingRequests: function () {
                        this.websocketClient.discardPendingRequests();
                    },
                    onAddData: function (a) {
                        this.dataConsumer.onAddData(a);
                    },
                    onStreamingRequestDenied: function (a) {
                        this.streamingRequestDeniedListeners.push(a);
                    },
                    onStreamingRequestApproved: function (a) {
                        this.streamingRequestApprovedListeners.push(a);
                    },
                    onControlTakeOverRequestApproved: function (a) {
                        this.controlTakeOverRequestApprovedListeners.push(a);
                    },
                    onControlTakeOverRequestDenied: function (a) {
                        this.controlTakeOverRequestDeniedListeners.push(a);
                    },
                    onControlTakeOverRequestStopped: function (a) {
                        this.controlTakeOverStoppedListeners.push(a);
                    },
                    onRecorderDisconnected: function (a) {
                        this.recorderDisconnectedListeners.push(a);
                    },
                    sendJSON: function (a) {
                        this.websocketClient.send(JSON.stringify(a));
                    },
                    sendStreamingRequest: function () {
                        this.sendJSON({ type: d.EVENTS.STREAMING_REQUEST });
                    },
                    sendStreamingRequestCanceled: function () {
                        this.sendJSON({ type: d.EVENTS.STREAMING_REQUEST_CANCELED });
                    },
                    sendControlTakeOverRequest: function () {
                        this.sendJSON({ type: d.EVENTS.CONTROL_TAKE_OVER_REQUEST });
                    },
                    sendPath: function (a) {
                        this.sendJSON({ type: d.EVENTS.PATH, path: a });
                    },
                    sendHover: function (a, b, c) {
                        this.sendJSON({
                            type: d.EVENTS.HOVER,
                            nodeId: a,
                            frameElementId: b,
                            hostElementId: c,
                        });
                    },
                    sendMouseMove: function (a, b, c, e) {
                        this.sendJSON({
                            type: d.EVENTS.MOUSE_MOVE,
                            x: a.clientX,
                            y: a.clientY,
                            nodeId: b,
                            frameElementId: c,
                            hostElementId: e,
                        });
                    },
                    sendScrollChange: function (a, b, c, e, f) {
                        this.sendJSON({
                            type: d.EVENTS.SCROLL_CHANGE,
                            deltaX: a,
                            deltaY: b,
                            nodeId: c,
                            frameElementId: e,
                            hostElementId: f,
                        });
                    },
                    sendClick: function (a, b, c, e) {
                        this.sendJSON({
                            type: d.EVENTS.CLICK,
                            x: a,
                            y: b,
                            elementId: c,
                            frameElementId: e,
                        });
                    },
                    sendVisualizeClick: function (a, b) {
                        this.sendJSON({ type: d.EVENTS.VISUALIZE_CLICK, x: a, y: b });
                    },
                    sendVisualizeMouseMove: function (a, b) {
                        this.sendJSON({ type: d.EVENTS.VISUALIZE_MOUSE_MOVE, x: a, y: b });
                    },
                    sendExitCursor: function () {
                        this.sendJSON({ type: d.EVENTS.EXIT_CURSOR });
                    },
                    sendExitControlTakeOver: function () {
                        this.sendJSON({ type: d.EVENTS.EXIT_CONTROL_TAKE_OVER });
                    },
                    sendKeyStroke: function (a, b, c, e, f) {
                        this.sendJSON({
                            type: d.EVENTS.KEY_STROKE,
                            text: a,
                            nodeId: b,
                            frameElementId: c,
                            hostElementId: e,
                            keyStrokeMetaData: f,
                        });
                    },
                    sendFocus: function (a, b, c) {
                        this.sendJSON({
                            type: d.EVENTS.FOCUS_ELEMENT,
                            nodeId: a,
                            frameElementId: b,
                            hostElementId: c,
                        });
                    },
                }),
                d
            );
        },
    ]),
    angular.module('playerApp').factory('BrokerWebSocketClient', [
        'BROKER_URL',
        function (a) {
            function b(a, e, f) {
                var g = this;
                (g.eventListeners = []),
                    (g.requestsQueue = []),
                    (g.reconnectInProgress = !1),
                    (g.isDisconnected = !0),
                    (f = f || {});
                var h = f.heartbeatInterval || b.DEFAULT_HEARTBEAT_INTERVAL,
                    i = f.retries || b.DEFAULT_AUTORECONNECT_RETRIES;
                (g.reconnectService = new c(g, h, i)), (g.connectorService = new d(a, e));
            }
            function c(a, b, c) {
                var d = this;
                (d.client = a), (d.heartbeatInterval = b), (d.maxRetries = c), (d.retries = 0), (d.interval = null);
            }
            function d(a, b) {
                var c = this;
                (c.host = a), (c.path = b);
            }
            return (
                (b.isSupported = function () {
                    return !!window.WebSocket;
                }),
                (b.createStreamingClient = function (c) {
                    return new b(a, 'sender/session/' + c);
                }),
                (b.createChatClient = function (c) {
                    return new b(a, 'player/chat/' + c);
                }),
                (b.DEFAULT_HEARTBEAT_INTERVAL = 2e3),
                (b.DEFAULT_AUTORECONNECT_RETRIES = -1),
                (b.prototype = {
                    reconnect: function (a) {
                        var b = this;
                        return (
                            (a = a || function () {}),
                            b.reconnectInProgress
                                ? a()
                                : ((b.reconnectInProgress = !0),
                                  void b.connect(function (c) {
                                      (b.reconnectInProgress = !1), a(c);
                                  }))
                        );
                    },
                    connect: function (a) {
                        var c = this;
                        return (
                            (a = a || function (a) {}),
                            b.isSupported()
                                ? (c.reconnectService.stop(),
                                  (c.isDisconnected = !1),
                                  void c.connectorService.connect(function (b, d) {
                                      return c.isDisconnected
                                          ? a()
                                          : b
                                          ? (c.reconnectService.start(), a(b))
                                          : ((c.socket = d),
                                            c.eventListeners.forEach(function (a) {
                                                c.socket.addEventListener(a.type, a.listener);
                                            }),
                                            c.isOpen()
                                                ? c.sendPendingRequests()
                                                : c.socket.addEventListener(
                                                      'open',
                                                      function () {
                                                          c.sendPendingRequests();
                                                      },
                                                      { once: !0 }
                                                  ),
                                            c.reconnectService.start(),
                                            void a());
                                  }))
                                : a()
                        );
                    },
                    disconnect: function (a) {
                        var c = this;
                        return (
                            (a = a || angular.noop),
                            !b.isSupported() || c.isDisconnected
                                ? a()
                                : (c.reconnectService.stop(),
                                  (c.isDisconnected = !0),
                                  c.socket && c.socket.close(),
                                  (c.socket = null),
                                  void (c.eventListeners = c.eventListeners.filter(function (a) {
                                      return !a.discardOnDisconnect;
                                  })))
                        );
                    },
                    send: function (a) {
                        var b = this;
                        if (!b.isDisconnected) return b.isOpen() ? void b.socket.send(a) : void b.requestsQueue.push(a);
                    },
                    addEventListener: function (a, b, c) {
                        var d = this;
                        (c = c || { discardOnDisconnect: !1 }),
                            d.eventListeners.push({
                                type: a,
                                listener: b,
                                discardOnDisconnect: c.discardOnDisconnect,
                            }),
                            d.socket && d.socket.addEventListener(a, b);
                    },
                    isOpen: function () {
                        var a = this;
                        return !!a.socket && a.socket.readyState == WebSocket.OPEN;
                    },
                    isConnecting: function () {
                        var a = this;
                        return !!a.socket && a.socket.readyState === WebSocket.CONNECTING;
                    },
                    sendPendingRequests: function () {
                        var a = this;
                        a.requestsQueue.forEach(function (b) {
                            a.socket.send(b);
                        }),
                            (a.requestsQueue = []);
                    },
                    discardPendingRequests: function () {
                        var a = this;
                        a.requestsQueue = [];
                    },
                }),
                (c.prototype = {
                    start: function () {
                        var a = this;
                        a.interval = setInterval(function () {
                            return a.client.isConnecting() || a.client.isOpen()
                                ? void (a.retries = 0)
                                : a.maxRetries !== -1 && a.retries > a.maxRetries
                                ? void a.stop()
                                : ((a.retries += 1), void a.client.reconnect());
                        }, a.heartbeatInterval);
                    },
                    stop: function () {
                        var a = this;
                        clearInterval(a.interval), (a.interval = null), (a.retries = 0);
                    },
                }),
                (d.prototype = {
                    getUrlForNode: function (a) {
                        var b = this;
                        return a + b.path;
                    },
                    connectToNode: function (a, b) {
                        var c = this,
                            d = new WebSocket(c.getUrlForNode(a)),
                            e = !1;
                        d.addEventListener(
                            'message',
                            function (a) {
                                e || ((e = !0), b(null, JSON.parse(a.data), d));
                            },
                            { once: !0 }
                        ),
                            d.addEventListener(
                                'error',
                                function (a) {
                                    e || ((e = !0), b(a));
                                },
                                { once: !0 }
                            ),
                            d.addEventListener(
                                'close',
                                function () {
                                    e || ((e = !0), b({ error: 'websocket closed' }));
                                },
                                { once: !0 }
                            );
                    },
                    initialConnect: function (a) {
                        var b = this;
                        b.connectToNode(b.host, a);
                    },
                    tryAllNodes: function (a, b, c) {
                        var d = this,
                            e = !1,
                            f = function (d, f, g, h) {
                                if (!e) {
                                    if (!d && g.isRecorderClientBrokerConnected)
                                        return (e = !0), (b[f] = !1), c(null, f, h);
                                    b[f] = !0;
                                    var i = Object.keys(b).length === a.length;
                                    return i ? ((e = !0), c({ error: 'broker unreachable' })) : void 0;
                                }
                            };
                        a.forEach(function (a) {
                            b[a] ||
                                d.connectToNode(a, function (b, c, d) {
                                    f(b, a, c, d);
                                });
                        });
                    },
                    connect: function (a) {
                        var b = this;
                        b.initialConnect(function (c, d, e) {
                            if (c) return a(c);
                            if (d.isRecorderClientBrokerConnected) return a(null, e);
                            var f = 1 === d.nodes.length;
                            if (f && !d.isRecorderClientBrokerConnected) return a({ error: 'broker unreachable' });
                            var g = {};
                            (g[d.node] = !0),
                                b.tryAllNodes(d.nodes, g, function (b, c, d) {
                                    return b ? a(b) : a(null, d);
                                });
                        });
                    },
                }),
                b
            );
        },
    ]),
    angular.module('playerApp').factory('ClicksManager', [
        'lodash',
        'UserClick',
        function (a, b) {
            function c(b, c) {
                a.remove(b.clicksQueue, function (a) {
                    return a == c;
                });
            }
            function d(a) {
                (a.visualizationIsEnabled = !1),
                    angular.forEach(a.clicksQueue, function (a) {
                        a.remove();
                    }),
                    (a.clicksQueue = []);
            }
            var e = function () {
                (this.clicksQueue = []), (this.playerSpeed = 1), (this.visualizationIsEnabled = !1);
            };
            return (
                (e.prototype.setPlayerSpeed = function (a) {
                    this.playerSpeed = a;
                }),
                (e.prototype.startClicksAnimation = function () {
                    var a = this;
                    a.visualizationIsEnabled &&
                        angular.forEach(a.clicksQueue, function (b) {
                            b.startAnimation(a.playerSpeed, function () {
                                c(a, b);
                            });
                        });
                }),
                (e.prototype.stopClicksAnimation = function () {
                    var a = this;
                    angular.forEach(a.clicksQueue, function (a) {
                        a.stopAnimation();
                    });
                }),
                (e.prototype.registerClick = function (a, d) {
                    var e = this;
                    if (e.visualizationIsEnabled) {
                        var f = new b(a, d);
                        return (
                            f.startAnimation(e.playerSpeed, function (a) {
                                c(e, a);
                            }),
                            e.clicksQueue.push(f),
                            f.element
                        );
                    }
                }),
                (e.prototype.setShouldVisualizeClicks = function (a) {
                    var b = this;
                    a ? (b.visualizationIsEnabled = !0) : d(b);
                }),
                e
            );
        },
    ]),
    angular
        .module('playerApp')
        .constant('PROPERTY_OBJECT_KEY', '__sessionstack_player__')
        .constant('NAMESPACES', {
            HTML: 'http://www.w3.org/1999/xhtml',
            SVG: 'http://www.w3.org/2000/svg',
        })
        .constant('ALLOWED_SRC_PROTOCOLS', ['http', 'https', 'ftp', 'data'])
        .constant('STYLE_ELEMENT_NAMES', ['STYLE', 'LINK'])
        .factory('DocumentNode', [
            '$timeout',
            'lodash',
            'utils',
            'sessionstackManager',
            'URLTransformer',
            'PROPERTY_OBJECT_KEY',
            'NAMESPACES',
            'ALLOWED_SRC_PROTOCOLS',
            'CROSS_ORIGIN_FRAME_BACKGROUND',
            'STYLE_ELEMENT_NAMES',
            'FULL_SCREEN_CLASS',
            function (a, b, c, d, e, f, g, h, i, j, k) {
                function l(a) {
                    var b = this;
                    a = a || {};
                    var d = a.frameElementId || a.hostElementId;
                    if (((b.documentsCollection[d] = a), (a.childDocuments = {}), !c.isUndefined(d))) {
                        var e = m.call(b, d);
                        e && (e.childDocuments[d] = !0);
                    }
                }
                function m(a) {
                    var b = this,
                        c = b.getNode(a),
                        d = K.call(b, c);
                    if (d) {
                        var e = Y(d).nodeId;
                        return b.documentsCollection[e];
                    }
                }
                function n(a, b) {
                    for (var c, d = this, e = [a]; e.length > 0; )
                        if ((c = d.documentsCollection[e.shift()])) {
                            b.call(d, c);
                            for (var f in c.childDocuments) e.push(f);
                        }
                }
                function o(a) {
                    var b = this;
                    n.call(b, a, t);
                }
                function p(a) {
                    n.call(this, a, function (a) {
                        angular.element(a.documentElement).remove();
                    });
                }
                function q(a) {
                    var b = this;
                    if (b.isAttached) {
                        var d = b.getNode(a.hostElementId);
                        if (d) {
                            var e = r(d, a);
                            if (e) {
                                c.addAdoptedStyleSheets(e, a.adoptedStyleSheets),
                                    s.call(b, e, a),
                                    e.append(a.documentElement);
                                var f = Y(a.documentElement),
                                    g = Y(e);
                                Object.assign(g, f), g.adoptedStyleSheets && (b.adoptedStyleSheetNodes[g.nodeId] = e);
                            }
                        }
                    }
                }
                function r(a, b) {
                    if (a.shadowRoot) return a.shadowRoot;
                    if (b.hasContentElements && a.createShadowRoot) return a.createShadowRoot();
                    if (!b.hasContentElements && a.attachShadow)
                        try {
                            return a.attachShadow({ mode: 'open' });
                        } catch (c) {
                            d.warn(c);
                        }
                }
                function s(a, b) {
                    var c = this,
                        d = Y(b.documentElement);
                    c.documentElementIndex[d.nodeId] = a;
                }
                function t(a) {
                    var b = this;
                    if (b.isAttached)
                        if (a.hostElementId) q.call(b, a);
                        else {
                            var d = F.call(b, a.frameElementId);
                            d &&
                                (u(d, a.docType),
                                v(d, a.documentElement),
                                c.addAdoptedStyleSheets(d, a.adoptedStyleSheets),
                                w.call(b, d.documentElement));
                        }
                }
                function u(a, b) {
                    a.open(), a.write(b || ''), a.close(), B(a);
                }
                function v(a, b) {
                    b && (a.adoptNode(b), a.appendChild(b));
                }
                function w(a) {
                    this.isAttached &&
                        (x.call(this, a, '[style]', 'style'),
                        x.call(this, a, 'link[rel="stylesheet"]', 'href'),
                        x.call(this, a, '[src]', 'src'),
                        x.call(this, a, 'img, input, iframe, canvas, embed, object, video', 'width'),
                        x.call(this, a, 'img, input, iframe, canvas, embed, object, video', 'height'));
                }
                function x(b, c, d) {
                    var e,
                        f = this;
                    b &&
                        angular
                            .element(c, b)
                            .addBack(c)
                            .each(function (b, c) {
                                (e = c.getAttribute(d)),
                                    e && (f.setAttribute(c, d, void 0), a(f.setAttribute.bind(f), 0, !0, c, d, e));
                            });
                }
                function y(a, b) {
                    var c,
                        d = this;
                    if (a.snapshot) {
                        c = d.createElement(a.snapshot, a.hostElementId, a.frameElementId);
                        var e = angular.element('head', c);
                        return (
                            e.length <= 0 &&
                                (angular.element(c).prepend('<head></head>'), (e = angular.element('head', c))),
                            z(e),
                            C(c, b),
                            G.call(d, c, a.frameElementId),
                            A.call(d, a.fullScreenNodeId),
                            c
                        );
                    }
                }
                function z(a) {
                    a.append(
                        '<style>#_ss-cto-frame, #_ss-cto-close-btn { display: none }#_ss-cursor-overlay { display: none }@keyframes _ss-pulse-ring { 0% {transform: scale(.33);} 100% {opacity: 0;} }</style>'
                    ),
                        a.append(
                            '<style>.' +
                                k +
                                ' {    object-fit: contain;   object-fit: contain;   position: fixed !important;   top: 0px !important;   right: 0px !important;   bottom: 0px !important;   left: 0px !important;   box-sizing: border-box !important;   min-width: 0px !important;   max-width: none !important;   min-height: 0px !important;   max-height: none !important;   width: 100% !important;   height: 100% !important;   transform: none !important;   z-index: 2147483647;   background: black;}</style>'
                        );
                }
                function A(a) {
                    if (a) {
                        var b = this.getNode(a);
                        angular.element(b).addClass(k), this.addFullScreenNode(a);
                    }
                }
                function B(a) {
                    var b = a.documentElement;
                    b && a.removeChild(b);
                }
                function C(a, b) {
                    var c = angular.element('base', a);
                    c.length <= 0 && ((c = angular.element('<base>')), angular.element('head', a).prepend(c)),
                        c.attr('href', b);
                }
                function D(a, b) {
                    if (b) return b;
                    var d = a.baseUrl;
                    return (
                        I(a.snapshot, function (a) {
                            if (a && 'BASE' === a.tagName && a.attributes) return (d = E(a, 'href')), !1;
                        }),
                        d ? c.evaluateAbsoluteUrl(a.origin, d) : a.origin
                    );
                }
                function E(a, b) {
                    var c;
                    return (
                        a.attributes.forEach(function (a) {
                            a.name === b && (c = a.value);
                        }),
                        c
                    );
                }
                function F(a) {
                    if (!angular.isDefined(a)) return this.documentContainer.contentWindow.document;
                    var b = this.documentElementIndex[a];
                    return b ? b.contentDocument || b.shadowRoot : void 0;
                }
                function G(a, b) {
                    var c,
                        d,
                        e = this;
                    I(a, function (a) {
                        (d = Y(a)),
                            (c = d.nodeId),
                            (d.frameElementId = b),
                            (e.documentElementIndex[c] = a),
                            d.styleRules && (e.styleRuleNodes[c] = a);
                    });
                }
                function H(a) {
                    var b,
                        c = this;
                    I(a, function (a) {
                        (b = Y(a)),
                            delete c.documentElementIndex[b.nodeId],
                            a.shadowRoot && ((b = Y(a.shadowRoot)), delete c.adoptedStyleSheetNodes[b.nodeId]);
                    });
                }
                function I(a, b) {
                    for (var c, d, e = [a]; e.length > 0; )
                        if ((c = e.pop())) {
                            if (((d = b(c)), d === !1)) return;
                            if (c.childNodes)
                                for (var f = c.childNodes.length - 1; f >= 0; f--) e.push(c.childNodes[f]);
                        }
                }
                function J(a) {
                    var b = angular.element(a).parent();
                    return b.length > 0 ? b[0] : a ? a.parentNode : void 0;
                }
                function K(a) {
                    try {
                        var b = Y(a);
                        return b && b.hostElementId
                            ? this.getNode(b.hostElementId)
                            : a.ownerDocument.defaultView.frameElement;
                    } catch (c) {}
                }
                function L(a, b, c) {
                    if (b.childNodes && b.childNodes.length > 0)
                        for (var d = b.childNodes.length - 1; d >= 0; d--) a.push({ parent: c, node: b.childNodes[d] });
                }
                function M(a, b, c) {
                    var d = {};
                    switch (a.nodeType) {
                        case Node.COMMENT_NODE:
                            d = N.call(this, a);
                            break;
                        case Node.TEXT_NODE:
                            d = O.call(this, a);
                            break;
                        case Node.DOCUMENT_FRAGMENT_NODE:
                            d = P.call(this);
                            break;
                        case Node.ELEMENT_NODE:
                            d = Q.call(this, a, c);
                    }
                    return (Y(d).nodeId = a.id), (Y(d).hostElementId = b), d;
                }
                function N(a) {
                    var b = F.call(this);
                    return b.createComment(a.textContent);
                }
                function O(a) {
                    var b = F.call(this);
                    return b.createTextNode(a.textContent);
                }
                function P() {
                    var a = F.call(this);
                    return a.createDocumentFragment();
                }
                function Q(a, b) {
                    var c = (U(a.isSvg), R.call(this, a, b));
                    return V.call(this, c, a), W.call(this, c), c;
                }
                function R(a, b) {
                    try {
                        return S.call(this, a, b);
                    } catch (c) {
                        return T.call(this, a, b);
                    }
                }
                function S(a, b) {
                    var c = this,
                        d = F.call(c),
                        e = U(a.isSvg),
                        f = a.tagName.toLowerCase(),
                        g = d.createElementNS(e, f),
                        h = Y(g);
                    return (
                        (h.frameElementId = b),
                        a.styleRules && (h.styleRules = a.styleRules.slice()),
                        a.attributes &&
                            a.attributes.forEach(function (a) {
                                c.setAttribute(g, a.name, a.value);
                            }),
                        g
                    );
                }
                function T(a, b) {
                    var d = F.call(this),
                        e = a.tagName.toLowerCase(),
                        f = (a.attributes, c.buildHtmlString(e, a.attributes)),
                        g = d.createElement('div');
                    g.innerHTML = f;
                    var h = g.firstChild;
                    return (Y(h).frameElementId = b), h;
                }
                function U(a) {
                    return a ? g.SVG : g.HTML;
                }
                function V(a, d) {
                    if (d.top || d.left) {
                        var e = Y(a);
                        (e.top = d.top), (e.left = d.left);
                    }
                    var f = d.isCrossOriginFrame,
                        g = angular.element(a);
                    c.matchesSelector(a, 'script')
                        ? g.removeAttr('src')
                        : c.matchesSelector(a, 'iframe')
                        ? (g.removeAttr('sandbox'),
                          g.removeAttr('src'),
                          f && g.css({ 'background-image': 'url(' + i + ')' }))
                        : c.matchesSelector(a, 'a')
                        ? g.attr('href', 'javascript:void(0);')
                        : c.matchesSelector(a, 'meta[http-equiv="X-Frame-Options"]') ||
                          c.matchesSelector(a, 'meta[http-equiv="Content-Security-Policy"]')
                        ? g.removeAttr('content')
                        : c.matchesSelector(a, 'link[rel="import"]') && g.attr('href', 'javascript:void(0);');
                    var j = [];
                    if (c.matchesSelector(a, '[src]')) {
                        var k = c.getUrlProtocol(g.attr('src'));
                        k && h.indexOf(k) < 0 && j.push('src');
                    }
                    for (var l = 0; l < a.attributes.length; l++) {
                        var m = a.attributes[l];
                        b.startsWith(m.name, 'on') && j.push(m.name);
                    }
                    j.forEach(function (a) {
                        g.removeAttr(a);
                    });
                }
                function W(a) {
                    this.settings.ignoreFormsAutofill() &&
                        c.matchesSelector(a, 'input') &&
                        ((a.readOnly = !0),
                        (a.onfocus = function () {
                            a.readOnly = !1;
                        }),
                        (a.onblur = function () {
                            a.readOnly = !0;
                        }));
                }
                function X(a, b, d) {
                    angular.element(a);
                    return (
                        (c.matchesSelector(a, 'script') && 'src' === b) ||
                        (c.matchesSelector(a, 'iframe') && 'src' === b) ||
                        (c.matchesSelector(a, 'meta[http-equiv="X-Frame-Options"]') && 'content' === b) ||
                        'integrity' === b ||
                        (c.matchesSelector(a, 'meta[content]') &&
                            'http-equiv' === b &&
                            ('X-Frame-Options' === d || 'Content-Security-Policy' === d))
                    );
                }
                function Y(a) {
                    var b = a[f];
                    return b || ((b = {}), (a[f] = b)), b;
                }
                var Z = function (a) {
                    (this.isAttached = !0),
                        (this.documentContainer = a),
                        (this.documentElementIndex = []),
                        (this.documentsCollection = {}),
                        (this.afterAttachCallbacks = []),
                        (this.styleRuleNodes = {}),
                        (this.adoptedStyleSheetNodes = {}),
                        (this.fullScreenNodes = []),
                        (this.settings = {});
                };
                return (
                    (Z.getNodePropertyObject = function (a) {
                        return Y(a);
                    }),
                    (Z.prototype.attach = function (b) {
                        var c = this;
                        (c.isAttached = !0), o.call(c, void 0), c.afterAttachCallbacks.push(a(b));
                    }),
                    (Z.prototype.detach = function () {
                        var b = this;
                        angular.forEach(b.afterAttachCallbacks, function (b) {
                            a.cancel(b);
                        }),
                            (b.afterAttachCallbacks = []),
                            b.isAttached && ((b.isAttached = !1), p.call(b, void 0));
                    }),
                    (Z.prototype.getNode = function (a) {
                        return this.documentElementIndex[a];
                    }),
                    (Z.prototype.write = function (a, b, c) {
                        var d = this;
                        angular.isUndefined(a.frameElementId) &&
                            angular.isUndefined(a.hostElementId) &&
                            (u(F.call(d), a.docType),
                            (d.documentElementIndex = []),
                            (d.documentsCollection = {}),
                            (d.styleRuleNodes = {}),
                            (d.adoptedStyleSheetNodes = {}));
                        var f = D(a, b),
                            g = {
                                urlTransformer: new e(f, c),
                                docType: a.docType,
                                frameElementId: a.frameElementId,
                                hostElementId: a.hostElementId,
                                hasContentElements: a.hasContentElements,
                                adoptedStyleSheets: a.adoptedStyleSheets,
                            };
                        if ((l.call(d, g), (g.documentElement = y.call(d, a, f)), a.adoptedStyleSheets)) {
                            var h = Y(g.documentElement);
                            h.adoptedStyleSheets = a.adoptedStyleSheets;
                        }
                        t.call(d, g);
                    }),
                    (Z.prototype.getDocumentElement = function (a) {
                        var b = F.call(this, a);
                        if (b) return b.documentElement;
                    }),
                    (Z.prototype.prepend = function (a, b) {
                        if (
                            (!c.matchesSelector(a, 'script') || b.nodeType !== Node.TEXT_NODE) &&
                            a &&
                            b &&
                            (a.nodeType === Node.ELEMENT_NODE || a.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
                        ) {
                            a.insertBefore(b, a.firstChild);
                            var d = Y(a).frameElementId;
                            G.call(this, b, d);
                        }
                    }),
                    (Z.prototype.replaceDocumentElement = function (a, b) {
                        var d = this,
                            e = d.documentsCollection[b];
                        c.matchesSelector(a, 'html') && e && ((e.documentElement = a), G.call(d, a, b), t.call(d, e));
                    }),
                    (Z.prototype.replaceDocType = function (a, b) {
                        var c = this,
                            d = c.documentsCollection[b];
                        a && d && (p.call(c, b), (d.docType = a), o.call(c, b));
                    }),
                    (Z.prototype.insertAfter = function (a, b) {
                        var d = J(a);
                        if (
                            (!c.matchesSelector(d, 'script') || b.nodeType !== Node.TEXT_NODE) &&
                            d &&
                            b &&
                            (d.nodeType === Node.ELEMENT_NODE || d.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
                        ) {
                            d.insertBefore(b, a.nextSibling);
                            var e = Y(d).frameElementId;
                            G.call(this, b, e);
                        }
                    }),
                    (Z.prototype.removeNode = function (a) {
                        var b = J(a);
                        b && (b.removeChild(a), H.call(this, a));
                    }),
                    (Z.prototype.traverseNode = function (a, b) {
                        I(a, b);
                    }),
                    (Z.prototype.traverseDocuments = function (a, b) {
                        n.call(this, a, b);
                    }),
                    (Z.prototype.getNodeOffset = function (a) {
                        for (var b = { top: 0, left: 0 }; a && a !== this.documentContainer; ) {
                            var c = a.getBoundingClientRect();
                            (b.top += c.top), (b.left += c.left), (a = K(a));
                        }
                        return b;
                    }),
                    (Z.prototype.createElement = function (a, b, c) {
                        var d,
                            e,
                            f,
                            g = M.call(this, a, b, c),
                            h = [];
                        if (a.childNodes && a.childNodes.length > 0)
                            for (L(h, a, g); h.length > 0; )
                                (d = h.pop()),
                                    (f = void 0),
                                    d.parent.nodeType !== Node.DOCUMENT_FRAGMENT_NODE &&
                                        (f = d.parent.tagName.toLowerCase()),
                                    'script' !== f &&
                                        'noscript' !== f &&
                                        ((e = M.call(this, d.node, b, c)), L(h, d.node, e), d.parent.appendChild(e));
                        return g;
                    }),
                    (Z.prototype.setAttribute = function (a, b, d) {
                        if (!X(a, b, d)) {
                            if (c.matchesSelector(a, 'link[rel="stylesheet"],img') && ('href' === b || 'src' === b)) {
                                var e = Y(a).frameElementId,
                                    f = this.documentsCollection[e].urlTransformer;
                                d = f.transform(d);
                            }
                            try {
                                angular.isUndefined(d) || null === d ? a.removeAttribute(b) : a.setAttribute(b, d);
                            } catch (g) {}
                        }
                    }),
                    (Z.prototype.getNodePropertyObject = function (a) {
                        return Z.getNodePropertyObject(a);
                    }),
                    (Z.prototype.getFrameElementIds = function () {
                        return b.map(this.documentsCollection, function (a) {
                            return a.frameElementId;
                        });
                    }),
                    (Z.prototype.getNodeId = function (a) {
                        if (a) {
                            var b = Y(a);
                            return b.nodeId;
                        }
                    }),
                    (Z.prototype.addFullScreenNode = function (a) {
                        this.fullScreenNodes.push(a);
                    }),
                    (Z.prototype.traverseFullScreenNodes = function (a) {
                        for (; this.fullScreenNodes.length > 0; ) {
                            var b = this.fullScreenNodes.pop();
                            if (b) {
                                var c = this.getNode(b);
                                a(c);
                            }
                        }
                    }),
                    (Z.prototype.setSettings = function (a) {
                        this.settings = a;
                    }),
                    Z
                );
            },
        ]),
    angular.module('playerApp').factory('DrawingService', [
        'BrokerWebSocketClient',
        'BROKER_URL',
        function (a, b) {
            var c = function () {};
            return (
                (c.prototype.connect = function (a) {
                    this.client = a;
                }),
                (c.prototype.draw = function (a) {
                    this.client.sendPath(a);
                }),
                (c.prototype.sendMouseMove = function (a, b, c, d) {
                    this.client.sendMouseMove(a, b, c, d);
                }),
                (c.prototype.hoverElement = function (a, b, c) {
                    this.client.sendHover(a, b, c);
                }),
                (c.prototype.scrollChange = function (a, b, c, d, e) {
                    this.client.sendScrollChange(a, b, c, d, e);
                }),
                (c.prototype.click = function (a, b, c, d) {
                    this.client.sendClick(a, b, c, d);
                }),
                (c.prototype.visualizeClick = function (a, b) {
                    this.client.sendVisualizeClick(a, b);
                }),
                (c.prototype.visualizeMouseMove = function (a, b) {
                    this.client.sendVisualizeMouseMove(a, b);
                }),
                (c.prototype.exitCursor = function () {
                    this.client.sendExitCursor();
                }),
                (c.prototype.exitControlTakeOver = function () {
                    this.client.sendExitControlTakeOver();
                }),
                (c.prototype.sendKeyStroke = function (a, b, c, d, e) {
                    this.client.sendKeyStroke(a, b, c, d, e);
                }),
                (c.prototype.sendFocus = function (a, b, c) {
                    this.client.sendFocus(a, b, c);
                }),
                c
            );
        },
    ]),
    angular
        .module('playerApp')
        .constant('LOG_OFFSET', 5e3)
        .factory('InitialSettings', [
            'LOG_OFFSET',
            function (a) {
                function b(a, b, d, e, f, g, h) {
                    (this.session = a),
                        (this.selectedLog = b),
                        (this.askUserForStreamingPermission = d),
                        (this.customOrigin = e),
                        (this.generalSettings = f),
                        (this.analytics = g),
                        (this.featureFlags = h),
                        (this.pauseAt = c(this.session, this.generalSettings.pauseAt)),
                        (this.playFrom = c(this.session, this.generalSettings.playFrom));
                }
                function c(a, b) {
                    return b ? ((b = Math.max(b, 0)), (b = Math.min(b, a.length))) : null;
                }
                return (
                    (b.prototype = {
                        getSession: function () {
                            return this.session;
                        },
                        shouldShowGoLiveButton: function () {
                            return (
                                !!this.featureFlags.captureMetadataOnly &&
                                this.generalSettings.playLive &&
                                this.session.isLive
                            );
                        },
                        isLive: function () {
                            return this.session.isLive;
                        },
                        getPauseActivity: function () {
                            return this.pauseAt ? { time: this.pauseAt } : this.selectedLog ? this.selectedLog : null;
                        },
                        getStartTime: function () {
                            return this.playFrom
                                ? this.playFrom
                                : this.getPauseActivity()
                                ? Math.max(0, this.getPauseActivity().time - a)
                                : 0;
                        },
                        shouldStartStreaming: function () {
                            return this.isLive() && this.generalSettings.playLive;
                        },
                        shouldWaitUserConfirmation: function () {
                            return (
                                this.featureFlags.captureMetadataOnly &&
                                this.generalSettings.playLive &&
                                this.askUserForStreamingPermission
                            );
                        },
                        isAssureCoWorkaroundEnabled: function () {
                            return (
                                this.generalSettings.isAssureCoWorkaroundEnabled ||
                                this.featureFlags.isAssureCoWorkaroundEnabled
                            );
                        },
                        getCustomOrigin: function () {
                            return this.customOrigin;
                        },
                        ignoreFormsAutofill: function () {
                            return this.featureFlags.ignoreFormsAutofill;
                        },
                        getAccessToken: function () {
                            return this.generalSettings.accessToken;
                        },
                        getSource: function () {
                            return this.analytics.source;
                        },
                    }),
                    b
                );
            },
        ]),
    angular.module('playerApp').factory('InstantPlayback', [
        'lodash',
        function (a) {
            function b(a, b) {
                (this._activities = a), (this._size = b);
            }
            function c(c, d, e) {
                (this._activities = c),
                    (this._render = d),
                    (this._stopped = !0),
                    (this._batches = new b(c, e.batchSize)),
                    (this._onBuffering = a.noop),
                    (this._onRendering = a.noop);
                var f = this,
                    g = function () {
                        f._onBuffering();
                    };
                this._activities.onPending(g);
            }
            return (
                (b.prototype = {
                    next: function (a) {
                        var b = this;
                        b._activities.next(function (c) {
                            if (c.done) return a({ done: !0 });
                            var d = c.value;
                            b._getNextBatch([d], a);
                        });
                    },
                    _getNextBatch: function (a, b) {
                        var c = this;
                        return a.length === c._size
                            ? b({ done: !1, value: a })
                            : void c._activities.next(function (d) {
                                  if (d.done) return b({ done: !1, value: a });
                                  var e = d.value;
                                  a.push(e), c._getNextBatch(a, b);
                              });
                    },
                }),
                (c.prototype = {
                    onBuffering: function (a) {
                        this._onBuffering = a;
                    },
                    onRendering: function (a) {
                        this._onRendering = a;
                    },
                    stop: function () {
                        (this._stopped = !0), this._activities.onPending(a.noop), clearTimeout(this._batchExecutor);
                    },
                    replay: function (b) {
                        (this._stopped = !1), this._replayLoop(b || a.noop);
                    },
                    _replayLoop: function (a) {
                        var b = this;
                        b._batches.next(function (c) {
                            if (c.done) return a();
                            var d = c.value;
                            b._onRendering(),
                                (b._batchExecutor = setTimeout(function () {
                                    b._stopped || (b._render.render(d, 'instantPlayback'), b._replayLoop(a));
                                }, 0));
                        });
                    },
                }),
                c
            );
        },
    ]),
    angular
        .module('playerApp')
        .constant('MAX_RECONNECT_RETRIES', 10)
        .constant('PERIODIC_CHECK_TIME', 1e3)
        .factory('LiveConnectionMonitor', [
            '$timeout',
            '$interval',
            'MAX_RECONNECT_RETRIES',
            'PERIODIC_CHECK_TIME',
            'CONNECTION_STATUSES',
            function (a, b, c, d, e) {
                var f = function (a) {
                    (this.brokerClient = a),
                        (this.periodicTimerPromise = null),
                        (this.lastConnectionStatus = null),
                        (this.reconnectRetries = 0);
                };
                return (
                    (f.prototype.start = function () {
                        var a = this;
                        this.stop(),
                            (this.periodicTimerPromise = b(function () {
                                var b = a.brokerClient.isConnected();
                                if (b) a.reconnectRetries = 0;
                                else {
                                    if (a.reconnectRetries < c) return a.reconnectRetries++;
                                    a.stop();
                                }
                                var d = b ? e.ONLINE : e.OFFLINE;
                                a.lastConnectionStatus !== d &&
                                    ((a.reconnectRetries = 0),
                                    (a.lastConnectionStatus = d),
                                    a.onStatusChangeCallback(d));
                            }, d));
                    }),
                    (f.prototype.stop = function () {
                        b.cancel(this.periodicTimerPromise),
                            (this.periodicTimerPromise = null),
                            (this.lastConnectionStatus = null),
                            (this.reconnectRetries = 0);
                    }),
                    (f.prototype.onStatusChange = function (a) {
                        this.onStatusChangeCallback = a;
                    }),
                    f
                );
            },
        ]),
    angular.module('playerApp').factory('LivePlayback', [
        'lodash',
        'Timer',
        function (a, b) {
            function c(a, b, c) {
                (this._millisecondsPerFrame = b), (this._maxLag = c), (this._activities = a);
            }
            function d(d, e, f, g) {
                (this._maxLag = g.maxLag),
                    (this._activities = e),
                    (this._frames = new c(e, g.millisecondsPerFrame, this._maxLag)),
                    (this._render = f),
                    (this._stopped = !0),
                    (this._delay = 0),
                    (this._speed = 4),
                    (this._timer = new b(d, g.millisecondsPerFrame)),
                    this._timer.changeSpeed(4),
                    (this._onBuffering = a.noop),
                    (this._onRendering = a.noop),
                    (this._onTimeChanged = a.noop);
                var h = this,
                    i = function (a) {
                        h._onTimeChanged(a);
                    };
                this._timer.onTimeChanged(i);
            }
            return (
                (c.prototype = {
                    next: function (a) {
                        var b = this;
                        b._activities.next(function (c) {
                            if (c.done) return { done: !0 };
                            var d = c.value,
                                e = d.time + b._getNextFrameLength(d);
                            return d === b._getLastLoadedActivity()
                                ? a({ done: !1, value: [d] })
                                : void b._getNextFrame(e, [d], a);
                        });
                    },
                    _getLastLoadedActivity: function () {
                        return this._activities.peekLast();
                    },
                    _getNextFrameLength: function (a) {
                        var b = this._activities.peekLast(),
                            c = b.time - a.time;
                        return c > this._maxLag ? 500 : this._millisecondsPerFrame * Math.ceil(c / 100);
                    },
                    _getNextFrame: function (a, b, c) {
                        var d = this;
                        d._activities.peek(function (e) {
                            if (e.done) return c({ done: !1, value: b });
                            var f = e.value;
                            return f.time > a
                                ? c({ done: !1, value: b })
                                : (b.push(f),
                                  void d._activities.next(function (e) {
                                      d._getNextFrame(a, b, c);
                                  }));
                        });
                    },
                }),
                (d.prototype = {
                    stop: function () {
                        (this._stopped = !0),
                            this._timer.stopTicking(),
                            this._timer.onTimeChanged(a.noop),
                            clearTimeout(this._frameExecutor);
                    },
                    onBuffering: function (a) {
                        this._onBuffering = a;
                    },
                    onRendering: function (a) {
                        this._onRendering = a;
                    },
                    onTimeChanged: function (a) {
                        this._onTimeChanged = a;
                    },
                    replay: function (b) {
                        (this._stopped = !1), this._onBuffering(), this._replayLoop(b || a.noop);
                    },
                    _replayLoop: function (a) {
                        var b = this;
                        b._frames.next(function (c) {
                            if (c.done) return a();
                            var d,
                                e = c.value,
                                f = e[0],
                                g = e[e.length - 1],
                                h = b._activities.peekLast().time - b._timer.time;
                            f.isFirstLiveActivity || h > b._maxLag
                                ? (d = 0)
                                : ((d = (f.time - b._timer.time) / b._speed), (d = Math.max(0, d - b._delay)));
                            var i = Date.now() + d;
                            b._onRendering(),
                                b._timer.tickTo(g.time),
                                (b._frameExecutor = setTimeout(function () {
                                    b._stopped ||
                                        (b._render.render(e, 'livePlayback'),
                                        b._timer.finishTicking(),
                                        (b._delay = i - Date.now()),
                                        b._replayLoop(a));
                                }, d));
                        });
                    },
                }),
                d
            );
        },
    ]),
    angular.module('playerApp').factory('NormalPlayback', [
        'lodash',
        'Timer',
        function (a, b) {
            function c(a, b) {
                (this._activities = a), (this._millisecondsPerFrame = b);
            }
            function d(d, e, f, g, h) {
                (this._timer = new b(d, h.millisecondsPerFrame)),
                    (this._endTime = e),
                    (this._activities = f),
                    (this._frames = new c(this._activities, h.millisecondsPerFrame)),
                    (this._render = g),
                    (this._delay = 0),
                    (this._stopped = !0),
                    (this._skipPrologedInactivity = h.skipProlongedInactivity),
                    (this._maxInactivityTime = h.maxInactivityTime),
                    (this._tabHiddenMessageTime = h.tabHiddenMessageTime),
                    (this._speed = h.speed),
                    this._timer.changeSpeed(this._speed),
                    (this._onBuffering = a.noop),
                    (this._onRendering = a.noop),
                    (this._onTimeChanged = a.noop);
                var i = this,
                    j = function () {
                        i._onBuffering();
                    },
                    k = function (a) {
                        i._onTimeChanged(a);
                    };
                this._activities.onPending(j), this._timer.onTimeChanged(k);
            }
            return (
                (c.prototype = {
                    next: function (a) {
                        var b = this;
                        b._activities.next(function (c) {
                            if (c.done) return a({ done: !0 });
                            var d = c.value,
                                e = d.time + b._millisecondsPerFrame;
                            b._getNextFrame(e, [d], a);
                        });
                    },
                    _getNextFrame: function (a, b, c) {
                        var d = this;
                        d._activities.peek(function (e) {
                            if (e.done) return c({ done: !1, value: b });
                            var f = e.value;
                            return f.time > a
                                ? c({ done: !1, value: b })
                                : (b.push(f),
                                  void d._activities.next(function (e) {
                                      d._getNextFrame(a, b, c);
                                  }));
                        });
                    },
                }),
                (d.prototype = {
                    onBuffering: function (a) {
                        this._onBuffering = a;
                    },
                    onRendering: function (a) {
                        this._onRendering = a;
                    },
                    onTimeChanged: function (a) {
                        this._onTimeChanged = a;
                    },
                    stop: function () {
                        (this._stopped = !0),
                            this._activities.onPending(a.noop),
                            this._timer.onTimeChanged(a.noop),
                            this._timer.stopTicking(),
                            clearTimeout(this._frameExecutor);
                    },
                    replay: function (b) {
                        (this._stopped = !1), this._onRendering(), this._replayLoop(b || a.noop);
                    },
                    _replayLoop: function (a) {
                        var b = this;
                        b._frames.next(function (c) {
                            if (c.done) return b._finish(a);
                            var d = c.value,
                                e = d[0],
                                f = d[d.length - 1];
                            if (e.isFirstLiveActivity) var g = 0;
                            else {
                                var g = e.time - b._timer.time;
                                g = Math.min(g, b._maxInactivityTime);
                                var h = g - b._delay;
                                h < 0 ? ((b._delay -= g), (g = 0)) : ((b._delay = 0), (g = h)),
                                    (g /= b._speed),
                                    b._skipPrologedInactivity &&
                                        b._render.isTabHidden &&
                                        (g = Math.min(g, b._tabHiddenMessageTime));
                            }
                            var i = Date.now() + g;
                            b._onRendering(),
                                b._timer.tickTo(f.time),
                                (b._frameExecutor = setTimeout(function () {
                                    b._stopped ||
                                        (b._render.render(d, 'normalPlayback'),
                                        b._timer.finishTicking(),
                                        (b._delay += Date.now() - i),
                                        b._replayLoop(a));
                                }, g));
                        });
                    },
                    _finish: function (a) {
                        var b = this,
                            c = b._endTime - b._timer.time;
                        (c = Math.max(0, c - b._delay)),
                            b._timer.tickTo(b._endTime),
                            setTimeout(function () {
                                b._timer.finishTicking(), b._stopped || (a(), b.stop());
                            }, c);
                    },
                    changeSpeed: function (a) {
                        (this._speed = a), this._timer.changeSpeed(a);
                    },
                }),
                d
            );
        },
    ]),
    angular.module('playerApp').factory('NullPlayback', [
        'lodash',
        function (a) {
            function b(a, b) {
                (this._wait = a), (this._lastPlayedActivity = b);
            }
            return (
                (b.prototype = {
                    stop: function () {
                        clearTimeout(this._executor);
                    },
                    replay: function (b) {
                        (b = b || a.noop), (this._executor = setTimeout(b, this._wait));
                    },
                    getLastPlayedActivity: function () {
                        return this._lastPlayedActivity;
                    },
                }),
                b
            );
        },
    ]),
    angular.module('playerApp').factory('player', function () {
        function a(a, b) {
            a.$broadcast(T, b);
        }
        function b(a, b) {
            a.$on(T, b);
        }
        function c(a, b) {
            a.$broadcast(S, b);
        }
        function d(a, b) {
            a.$on(S, b);
        }
        function e(a, b) {
            a.$broadcast(U, b);
        }
        function f(a, b) {
            a.$on(U, b);
        }
        function g(a, b) {
            a.$broadcast(V, b);
        }
        function h(a, b) {
            a.$on(V, b);
        }
        function i(a) {
            a.$broadcast(X);
        }
        function j(a, b) {
            a.$on(X, b);
        }
        function k(a) {
            a.$broadcast(W);
        }
        function l(a, b) {
            a.$on(W, b);
        }
        function m(a, b) {
            a.$broadcast(Y, b);
        }
        function n(a, b) {
            a.$on(Y, b);
        }
        function o(a) {
            a.$broadcast(Z);
        }
        function p(a, b) {
            a.$on(Z, b);
        }
        function q(a) {
            a.$broadcast($);
        }
        function r(a, b) {
            a.$on($, b);
        }
        function s(a) {
            a.$broadcast(_);
        }
        function t(a, b) {
            a.$on(_, b);
        }
        function u(a) {
            a.$broadcast(ca);
        }
        function v(a, b) {
            a.$on(ca, b);
        }
        function w(a) {
            a.$broadcast(da);
        }
        function x(a, b) {
            a.$on(da, b);
        }
        function y(a, b) {
            a.$emit(aa, b);
        }
        function z(a, b) {
            a.$on(aa, b);
        }
        function A(a) {
            a.$emit(ba);
        }
        function B(a, b) {
            a.$on(ba, b);
        }
        function C(a) {
            a.$emit(ea);
        }
        function D(a, b) {
            a.$on(ea, b);
        }
        function E(a) {
            a.$broadcast(fa);
        }
        function F(a, b) {
            a.$on(fa, b);
        }
        function G(a) {
            a.$broadcast(ga);
        }
        function H(a, b) {
            a.$on(ga, b);
        }
        function I(a, b) {
            a.$emit(ha, b);
        }
        function J(a, b) {
            a.$on(ha, b);
        }
        function K(a, b) {
            a.$emit(ia, b);
        }
        function L(a, b) {
            a.$on(ia, b);
        }
        function M(a, b) {
            a.$emit(ja, b);
        }
        function N(a, b) {
            a.$on(ja, b);
        }
        function O(a, b) {
            a.$emit(ka, b);
        }
        function P(a, b) {
            a.$on(ka, b);
        }
        function Q(a, b) {
            a.$emit(la, b);
        }
        function R(a, b) {
            a.$on(la, b);
        }
        var S = 'execute',
            T = 'clear',
            U = 'playerSpeedChange',
            V = 'visualizeClicks',
            W = 'playerStopped',
            X = 'playerStarted',
            Y = 'attach',
            Z = 'detach',
            $ = 'showOverlay',
            _ = 'hideOverlay',
            aa = 'startLiveStreaming',
            ba = 'stopLiveSteaming',
            ca = 'showBuffering',
            da = 'hideBuffering',
            ea = 'playerIsInitialized',
            fa = 'hideStepsBuffering',
            ga = 'hideHiddenTabOverlay',
            ha = 'userDetailsResize',
            ia = 'consoleResize',
            ja = 'openConsole',
            ka = 'userPermissionRequestSend',
            la = 'userPermissionRequestCanceled';
        return {
            fireExecuteEvent: c,
            onExecuteEvent: d,
            fireClear: a,
            onClear: b,
            firePlayerSpeedChange: e,
            onPlayerSpeedChange: f,
            fireVisualizeClicks: g,
            onVisualizeClicks: h,
            firePlayerStarted: i,
            onPlayerStarted: j,
            firePlayerStopped: k,
            onPlayerStopped: l,
            fireAttach: m,
            onAttach: n,
            fireDetach: o,
            onDetach: p,
            fireShowViewerOverlay: q,
            onShowViewerOverlay: r,
            fireHideViewerOverlay: s,
            onHideViewerOverlay: t,
            fireStartLiveStreaming: y,
            onStartLiveStreaming: z,
            fireStopLiveStreaming: A,
            onStopLiveStreaming: B,
            fireShowBuffering: u,
            onShowBuffering: v,
            fireHideBuffering: w,
            onHideBuffering: x,
            firePlayerIsInitialized: C,
            onPlayerIsInitialized: D,
            fireHideStepsBuffering: E,
            onHideStepsBuffering: F,
            fireHideHiddenTabOverlay: G,
            onHideHiddenTabOverlay: H,
            fireUserDetailsResize: I,
            onUserDetailsResize: J,
            fireConsoleResize: K,
            onConsoleResize: L,
            fireOpenConsole: M,
            onOpenConsole: N,
            fireUserPermissionRequestSend: O,
            onUserPermissionRequestSend: P,
            fireUserPermissionRequestCanceled: Q,
            onUserPermissionRequestCanceled: R,
        };
    }),
    angular
        .module('playerApp')
        .constant('PAGE_LOAD', 'page_load')
        .factory('playerSettings', [
            'settings',
            'utils',
            'EVENT_TYPE',
            'PAGE_LOAD',
            function (a, b, c, d) {
                function e(a) {
                    (a.settings = {}), f(a), g(a), h(a);
                }
                function f(a) {
                    a.settings.general = {
                        playFrom: b.getQueryParameter('play_from'),
                        pauseAt: b.getQueryParameter('pause_at'),
                        playLive: b.getQueryParameter('play_live'),
                        uiMode: b.getQueryParameter('ui_mode'),
                        accessToken: b.getQueryParameter('access_token'),
                        isDemo: b.getQueryParameter('is_demo') === !0,
                        domSnapshotsEnabled: b.getQueryParameter('dom_snapshots') === !0,
                        liveSeparatePipeline: b.getQueryParameter('live_separate_pipeline') === !0,
                        isAssureCoWorkaroundEnabled: b.getQueryParameter('assure_co_workaround') === !0,
                    };
                }
                function g(a) {
                    a.settings.analytics = { source: b.getQueryParameter('source') };
                }
                function h(a) {
                    var b = i(),
                        c = j();
                    (a.settings.playback = {}), l(a, b, c);
                }
                function i() {
                    return {
                        shouldSkipProlongedInactivity: b.getQueryParameter('skip_inactivity'),
                        shouldVisualizeClicks: b.getQueryParameter('visualize_mouse_clicks'),
                        shouldPauseOnMarker: b.getQueryParameter('pause_on_marker'),
                        speed: b.getQueryParameter('speed'),
                    };
                }
                function j() {
                    return {
                        shouldSkipProlongedInactivity: k('shouldSkipProlongedInactivity', !0),
                        shouldVisualizeClicks: k('shouldVisualizeClicks', !0),
                        shouldPauseOnMarker: k('shouldPauseOnMarker', !0),
                        speed: k('speed', 1),
                    };
                }
                function k(b, c) {
                    return a.get(b, c);
                }
                function l(a, c, d) {
                    b.forEach(d, function (d, e) {
                        var f = c[e];
                        b.isDefined(f)
                            ? (a.settings.playback[e] = f)
                            : ((a.settings.playback[e] = d), m(a, e, a.settings.playback[e]));
                    });
                }
                function m(b, c, d) {
                    var e = 'settings.playback.' + c,
                        f = 'settings.' + c;
                    a.bind(b, e, d, f);
                }
                function n() {
                    var a = b.getQueryParameter('activities');
                    if (b.isUndefined(a)) return q;
                    if (!b.isString(a)) return [];
                    var c = p(a);
                    return o(c);
                }
                function o(a) {
                    var e = [];
                    return (
                        b.forEach(a, function (a) {
                            a === d ? e.push(c.DOM_SNAPSHOT) : e.push(a);
                        }),
                        e
                    );
                }
                function p(a) {
                    var c = [];
                    return (
                        b.forEach(a.split(','), function (a) {
                            c.push(a.trim());
                        }),
                        c
                    );
                }
                var q = [c.CONSOLE_ERROR, c.MOUSE_CLICK, c.WINDOW_RESIZE, c.DOM_SNAPSHOT, c.VISIBILITY_CHANGE];
                return { init: e, getActivitiesFilterFromUrl: n };
            },
        ]),
    angular.module('playerApp').factory('Player', [
        'lodash',
        'NormalPlayback',
        'InstantPlayback',
        'LivePlayback',
        'NullPlayback',
        function (a, b, c, d, e) {
            function f(b, c, d) {
                (this._activities = b),
                    (this._render = c),
                    (this._skippingToTabShown = !1),
                    (this._pauseAt = null),
                    (this._config = {
                        batchSize: d.EVENTS_BATCH_SIZE,
                        maxProlongedInactivityTime: d.MAX_INACTIVITY_TIME,
                        millisecondsPerFrame: d.MILLISECONDS_PER_FRAME,
                        maxLag: d.LAG_TIME,
                        tabHiddenMessageTime: d.TAB_HIDDEN_MESSAGE_TIME,
                        speed: 1,
                        maxInactivityTime: d.MAX_INACTIVITY_TIME,
                        skipProlongedInactivity: !0,
                    }),
                    (this._playback = this._createNullPlayback(0)),
                    (this._onBuffering = a.noop),
                    (this._onRendering = a.noop),
                    (this._onPlaying = a.noop),
                    (this._onFinished = a.noop),
                    (this._onPaused = a.noop),
                    (this._onTimeChanged = a.noop);
                var e = this;
                this._replayFinished = function () {
                    e._stop();
                    var a = e._render.lastRenderedActivity;
                    e._activities.isLastActivity(a) ? e._onFinished() : e._onPaused();
                };
            }
            return (
                (f.prototype = {
                    play: function (a) {
                        this._stop();
                        var b = this._render.lastRenderedActivity;
                        if (this._pauseAt && a < this._pauseAt)
                            var c = this._pauseAt,
                                d = this._activities.getIteratorBetween(b, this._pauseAt);
                        else
                            var c = this._activities.getSessionLength() + 1,
                                d = this._activities.getIteratorAfter(b);
                        (this._playback = this._createNormalPlayback(a, c, d)),
                            this._playback.replay(this._replayFinished);
                    },
                    pause: function () {
                        this._stop(), this._replayFinished();
                    },
                    jumpToTime: function (a) {
                        this._stop();
                        var b = this._render.lastRenderedActivity;
                        if (a < b.time) {
                            this._render.reset();
                            var c = this._activities.getIteratorFromClosestSnapshotToTime(a);
                        } else var c = this._activities.getIteratorFromClosestSnapshotBetween(b, a);
                        (this._playback = this._createInstantPlayback(c)),
                            this._playback.replay(this.play.bind(this, a));
                    },
                    jumpToActivity: function (a) {
                        this._stop();
                        var b = this._render.lastRenderedActivity;
                        if (a.time < b.time) {
                            this._render.reset();
                            var c = this._activities.getIteratorFromClosestSnapshotToActivity(a);
                        } else var c = this._activities.getIteratorFromClosestSnapshotBetweenActivities(b, a);
                        (this._playback = this._createInstantPlayback(c)), this._playback.replay(this._replayFinished);
                    },
                    goLive: function (a) {
                        this._stop();
                        var b = this._activities.getIteratorAfterEnd();
                        (this._playback = this._createLivePlayback(a, b)), this._playback.replay();
                    },
                    skipToTabShown: function (a) {
                        var b = this;
                        if (b._isPlayingNormal() && b._config.skipProlongedInactivity && !b._skippingToTabShown) {
                            b._stop(), (b._skippingToTabShown = !0);
                            var c = b._render.lastRenderedActivity,
                                d = b._pauseAt || Number.POSITIVE_INFINITY,
                                e = b._activities.getSessionLength(),
                                f = Math.min(a + b._config.tabHiddenMessageTime, e);
                            if (a < d && d <= f) {
                                var g = b._activities.getIteratorBetween(c, d);
                                return (
                                    (b._playback = b._createNormalPlayback(a, d, g)),
                                    void b._playback.replay(b._replayFinished)
                                );
                            }
                            var g = b._activities.getIteratorBetween(c, f);
                            (b._playback = b._createNormalPlayback(a, f, g)),
                                b._playback.replay(function () {
                                    if ((b._stop(), (b._skippingToTabShown = !0), !b._render.isTabHidden))
                                        return b.play(f);
                                    var a = b._render.lastRenderedActivity;
                                    if (b._pauseAt && b._pauseAt > a.time) var c = b._pauseAt;
                                    else var c = Number.POSITIVE_INFINITY;
                                    var d = b._activities.getIteratorFromClosestSnapshotToFirstTabShown(a, c);
                                    (b._playback = b._createInstantPlayback(d)),
                                        b._playback.replay(function () {
                                            var a = b._render.lastRenderedActivity,
                                                c = Math.max(f, a.time);
                                            b.play(c);
                                        });
                                });
                        }
                    },
                    changeProlongedInactivitySetting: function (a, b) {
                        a
                            ? ((this._config.skipProlongedInactivity = !0),
                              (this._config.maxInactivityTime = this._config.maxProlongedInactivityTime))
                            : ((this._config.skipProlongedInactivity = !1),
                              (this._config.maxInactivityTime = Number.POSITIVE_INFINITY)),
                            this._isPlayingNormal() && this.play(b);
                    },
                    changeSpeedSetting: function (a, b) {
                        (this._config.speed = a), this._isPlayingNormal() && this.play(b);
                    },
                    changePauseMarker: function (a, b) {
                        (this._pauseAt = a), this._isPlayingNormal() && this.play(b);
                    },
                    onBuffering: function (a) {
                        this._onBuffering = a;
                    },
                    onRendering: function (a) {
                        this._onRendering = a;
                    },
                    onPlaying: function (a) {
                        this._onPlaying = a;
                    },
                    onFinished: function (a) {
                        this._onFinished = a;
                    },
                    onPaused: function (a) {
                        this._onPaused = a;
                    },
                    onTimeChanged: function (a) {
                        this._onTimeChanged = a;
                    },
                    _stop: function () {
                        this._playback.stop(),
                            (this._playback = this._createNullPlayback(0)),
                            (this._skippingToTabShown = !1);
                    },
                    _createNormalPlayback: function (a, c, d) {
                        var e = new b(a, c, d, this._render, this._config);
                        return (
                            e.onBuffering(this._onBuffering),
                            e.onRendering(this._onPlaying),
                            e.onTimeChanged(this._onTimeChanged),
                            e
                        );
                    },
                    _createInstantPlayback: function (a) {
                        var b = new c(a, this._render, this._config);
                        return b.onBuffering(this._onBuffering), b.onRendering(this._onRendering), b;
                    },
                    _createLivePlayback: function (a, b) {
                        var c = new d(a, b, this._render, this._config);
                        return (
                            c.onBuffering(this._onBuffering),
                            c.onRendering(this._onPlaying),
                            c.onTimeChanged(this._onTimeChanged),
                            c
                        );
                    },
                    _createNullPlayback: function (a) {
                        return new e(a, this._render.lastRenderedActivity);
                    },
                    _isPlayingNormal: function () {
                        return this._playback instanceof b;
                    },
                }),
                f
            );
        },
    ]),
    angular
        .module('playerApp')
        .constant('ACTIVITIES_POLL_WAIT_TIME', 0)
        .constant('NO_ACTIVITIES_POLL_WAIT_TIME', 500)
        .factory('SessionDataClient', [
            '$timeout',
            '$q',
            'session',
            'featureFlags',
            'utils',
            'lodash',
            'ACTIVITIES_POLL_WAIT_TIME',
            'NO_ACTIVITIES_POLL_WAIT_TIME',
            function (a, b, c, d, e, f, g, h) {
                function i(a) {
                    var d = this,
                        e = b.defer();
                    return (
                        (function f() {
                            return d.lastEventTimestamp >= d.timeLimit
                                ? e.resolve([])
                                : void c
                                      .getActivities(d.sessionId, {
                                          eventsTimestamp: d.lastEventTimestamp,
                                          eventsIndex: d.lastEventIndex,
                                      })
                                      .then(
                                          function (b) {
                                              var c = k(b, d.timeLimit);
                                              return 0 === c.activities.length
                                                  ? e.resolve(c.activities)
                                                  : ((d.lastEventTimestamp = c.lastEventTimestamp),
                                                    (d.lastEventIndex = c.lastEventIndex),
                                                    a(c.activities),
                                                    void f());
                                          },
                                          function (a) {
                                              e.reject(a);
                                          }
                                      );
                        })(),
                        e.promise
                    );
                }
                function j(a) {
                    var b = f.last(a);
                    return b ? b.time : null;
                }
                function k(a, b) {
                    var c = a.activities,
                        d = j(c);
                    return d && d > b ? l(c, b) : a;
                }
                function l(a, b) {
                    var c,
                        d,
                        e = [];
                    return (
                        f.forEach(a, function (a, f) {
                            return !(a.time > b) && (e.push(a), (c = a.timestamp), void (d = a.index));
                        }),
                        { activities: e, lastEventTimestamp: c, lastEventIndex: d }
                    );
                }
                var m = function (a, b, c) {
                    (this.sessionId = a),
                        (this.logId = b),
                        (this.isLiveStream = c),
                        (this.lastEventTimestamp = -1),
                        (this.lastEventIndex = -1),
                        (this.timeLimit = null),
                        this.loadingActivitiesPromise;
                };
                return (
                    (m.prototype.loadSession = function () {
                        var a,
                            e = this,
                            f = b.defer(),
                            g = d.getSessionFeatureFlags(e.sessionId);
                        return (
                            (a = e.logId ? c.getSessionLog(e.sessionId, e.logId) : c.getSession(e.sessionId)),
                            b.all([g, a]).then(
                                function (a) {
                                    var b = { featureFlags: a[0], sessionData: a[1] };
                                    (e.isLive = b.sessionData.session.isLive), f.resolve(b);
                                },
                                function (a) {
                                    f.reject(a);
                                }
                            ),
                            f.promise
                        );
                    }),
                    (m.prototype.loadActivitiesUntil = function (a, b) {
                        var c = this;
                        return (
                            (c.timeLimit = b),
                            c.loadingActivitiesPromise ||
                                (c.loadingActivitiesPromise = i.call(c, a).then(function (b) {
                                    (c.loadingActivitiesPromise = null), a(b);
                                })),
                            c.loadingActivitiesPromise
                        );
                    }),
                    m
                );
            },
        ]),
    angular.module('playerApp').factory('SliceIterator', [
        function () {
            function a(a, b, c) {
                (this.array = a), (this.start = b), (this.end = c), (this.index = b);
            }
            return (
                (a.prototype = {
                    next: function () {
                        return this._isDone() ? { done: !0 } : { done: !1, value: this.array[this.index++] };
                    },
                    peek: function () {
                        return this._isDone() ? { done: !0 } : { done: !1, value: this.array[this.index] };
                    },
                    peekLast: function () {
                        return this.end === -1 ? this.array[this.array.length - 1] : this.array[end - 1];
                    },
                    rewind: function (a) {
                        this.index = a;
                    },
                    _isDone: function () {
                        return this.end === -1 ? this.index >= this.array.length : this.index >= this.end;
                    },
                }),
                a
            );
        },
    ]),
    angular.module('playerApp').factory('Timer', [
        function () {
            function a(a, b) {
                (this.time = a),
                    (this._tickStep = b),
                    (this._end = a),
                    (this._speed = 1),
                    (this._interval = null),
                    (this._stopped = !1);
            }
            return (
                (a.prototype = {
                    tickTo: function (a) {
                        (this._end = a), this._startInterval();
                    },
                    finishTicking: function () {
                        this._updateTime(this._end), this._stopInterval();
                    },
                    stopTicking: function () {
                        this._stopInterval();
                    },
                    onTimeChanged: function (a) {
                        this._onTimeChanged = a;
                    },
                    changeSpeed: function (a) {
                        this._speed = a;
                    },
                    _updateTime: function (a) {
                        a !== this.time && ((this.time = a), this._onTimeChanged(a));
                    },
                    _startInterval: function () {
                        var a = this;
                        a._interval ||
                            (a._interval = setInterval(function () {
                                if (a.time < a._end) {
                                    var b = a.time + a._tickStep * a._speed;
                                    (b = Math.min(b, a._end)), a._updateTime(b);
                                } else a._stopInterval();
                            }, a._tickStep));
                    },
                    _stopInterval: function () {
                        clearInterval(this._interval), (this._interval = null);
                    },
                }),
                a
            );
        },
    ]),
    angular.module('playerApp').factory('URLTransformer', [
        'lodash',
        'utils',
        'SERVER_URL',
        function (a, b, c) {
            function d(a) {
                return encodeURIComponent(encodeURIComponent(a));
            }
            function e(a) {
                return a && c && f(a) && !g(a);
            }
            function f(b) {
                return !a.startsWith(b, 'data:') && !a.startsWith(b, 'file:');
            }
            function g(b) {
                return a.startsWith(b, h);
            }
            var h = c + 'resources',
                i = function (a, b) {
                    var c = this;
                    (c.encodedBaseUrl = d(a)), (c.sessionId = b), (c.timestamp = 0);
                };
            return (
                (i.prototype.transform = function (a) {
                    if (!e(a)) return a;
                    var b = this,
                        c = h;
                    return (
                        (c += '/' + b.sessionId),
                        (c += '/' + b.timestamp),
                        (c += '/' + b.encodedBaseUrl),
                        (c += '/' + d(a))
                    );
                }),
                i
            );
        },
    ]),
    angular
        .module('playerApp')
        .constant('MAX_WAITING_TIME', 1e3)
        .constant('MAX_FADEOUT_TIME', 2e3)
        .constant('CLICK_ELEMENT_SIZE', 10)
        .factory('UserClick', [
            'CLICK_ELEMENT_SIZE',
            'MAX_WAITING_TIME',
            'MAX_FADEOUT_TIME',
            function (a, b, c) {
                function d(b, c) {
                    var d = document.createElement('div');
                    return $(d).css({ top: b - a / 2 + 'px', left: c - a / 2 + 'px' }), $(d).css(g), d;
                }
                function e(a) {
                    var c = a.totalPlayingTime;
                    return c < b ? b - c : 0;
                }
                function f(a) {
                    var d = a.totalPlayingTime - b;
                    return d < c ? c - d : 0;
                }
                var g = {
                        background: 'red',
                        borderRadius: '50%',
                        width: a + 'px',
                        height: a + 'px',
                        position: 'absolute',
                        'z-index': 20,
                        '-moz-border-radius': '10px',
                        '-webkit-border-radius': '10px',
                    },
                    h = function (a, b) {
                        (this.element = d(a, b)), (this.lastActive = new Date().getTime()), (this.totalPlayingTime = 0);
                    };
                return (
                    (h.prototype.startAnimation = function (a, b) {
                        var c = this,
                            d = e(c);
                        d > 0 && $(c.element).animate({ opacity: 1 }, d / a);
                        var g = f(c);
                        $(c.element).fadeOut(g / a, function (a) {
                            b(c), $(this).remove();
                        }),
                            (c.lastActive = new Date().getTime());
                    }),
                    (h.prototype.stopAnimation = function () {
                        var a = this;
                        $(a.element).stop().stop();
                        var b = new Date().getTime();
                        a.totalPlayingTime = b - a.lastActive;
                    }),
                    (h.prototype.remove = function () {
                        var a = this;
                        $(a.element).remove();
                    }),
                    h
                );
            },
        ]);