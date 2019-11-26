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
        function(a) {
            a.defaults = { scrollButtons: { enable: !1 }, axis: 'y' };
        },
    ])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        'BUILD_ENV',
        function(a, b, c) {
            b.when('', '/');
            var d = {
                url: '/',
                templateUrl: 'views/player.html',
                controller: 'PlayerController',
            };
            c.PLAYER_ONLINE_MODE && (d.url = '/sessions/:sessionId'),
                a
                    .state('sessionPlayer', d)
                    .state('logPlayer', {
                        url: '/sessions/:sessionId/logs/:logId',
                        templateUrl: 'views/player.html',
                        controller: 'PlayerController',
                    });
        },
    ])
    .config([
        '$httpProvider',
        function(a) {
            a.interceptors.push(
                'authInterceptor',
                'loadingInterceptor',
                'progressInterceptor',
            );
        },
    ])
    .run([
        'intercomManager',
        function(a) {
            a.boot();
        },
    ])
    .run([
        '$templateCache',
        function(a) {
            a.put(
                'tour/tour.tpl.html',
                '<div ng-hide="!ttContent" class="popover fade {{ ttPlacement }} in tour-popover"><div class="arrow arrow-{{ ttPlacement }}" ng-hide="centered"></div><div class="popover-title"><p ng-bind-html="ttContent"></p></div><div class="popover-content"><md-button ng-click="proceed()" ng-bind="ttNextLabel" class="md-primary md-raised dark-button"></a></div></div>',
            );
        },
    ]),
    angular
        .module('playerApp')
        .constant('PAUSE_AT_ACTIVITY_ID', 'pause_at_activity_id')
        .constant('USER_DETAILS_ANIMATION_TIME', 500),
    angular
        .module('playerApp')
        .constant('EVENT_TYPE', {
            DOM_MUTATION: 'dom_mutation',
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
        })
        .constant('SESSIONSTACK_HOVER_CLASS', '_ss-hover')
        .constant('PROCESS_HOVER_STYLES_CONFIG', {
            DELAY: 100,
            TIMES_TO_REPEAT: 0,
        })
        .constant('ERRORS', { SECURITY_ERROR: 'SecurityError' })
        .constant('VIEWER_MARGINS', { HORIZONTAL: 20, VERTICAL: 20 })
        .constant('SCROLL_POSITION_CHANGE', { MAX_RETRIES: 100, TIMEOUT: 50 })
        .constant('ELEMENTS', { HTML: 'html' })
        .constant(
            'CROSS_ORIGIN_FRAME_BACKGROUND',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAIAAACRuyQOAAAApElEQVRIib3Vyw2EMBADULNdTP+9JWVkL0gIFMh87Phs6cknH601ZGNm/vJvD9N7T0pRBrlNCSYj5ZiwlGZiUoUJSEXGK9UZl0Rh1hKLWUhE5kviMq8SnZlLCmYiiZinpGNukpS5JDVzShsYAMcYYwOD0GtUGDPzSkUGzk11xiVRmLXEYhYSkfmSuMyrRGfmkoKZSCLmKemYmyRlLknNnNIGBsAflNtr9IJvuy8AAAAASUVORK5CYII=',
        ),
    angular
        .module('playerApp')
        .constant('LOG_OFFSET', 5e3)
        .constant('LIVE_MODE_CONFIGS', {
            GO_LIVE_OFFSET_TIME: 1e3,
            MAX_ATTEMPTS: 3,
        })
        .constant('DEMO_USER_ROLE', 'demo')
        .controller('PlayerController', [
            '$scope',
            '$stateParams',
            'SessionDataClient',
            'player',
            'playerSettings',
            'auth',
            '$timeout',
            'utils',
            'sessionstackManager',
            'pendoManager',
            'intercomManager',
            'requestProgressHandlersManager',
            'LOG_OFFSET',
            'FRONTEND_URL',
            'SERVER_URL',
            'HTTP_STATUS',
            'DEMO_USER_ROLE',
            'PAUSE_AT_ACTIVITY_ID',
            'LIVE_MODE_CONFIGS',
            function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s) {
                function t(b) {
                    y.loadActivitiesUntil(u, b, C).then(function() {
                        y.getSessionStatus().then(function(b) {
                            var c = b.length;
                            a.sessionPlayerApi.setSessionLength(c),
                                D < s.MAX_ATTEMPTS &&
                                c - s.GO_LIVE_OFFSET_TIME > w
                                    ? (t(c), D++)
                                    : B &&
                                      y.activitiesPollerIsCanceled &&
                                      ((a.isCatchingUpWithLive = !1),
                                      y.startLoadingActivities(u, C),
                                      (D = 0),
                                      (C = !0));
                        });
                    });
                }
                function u(b) {
                    if (b) {
                        var c = b.activities;
                        c.length > 0 && (w = c[c.length - 1].time),
                            a.sessionPlayerApi.addActivities(c);
                    }
                }
                function v(b) {
                    if (b)
                        switch (b.status) {
                            case p.FORBIDDEN:
                            case p.UNAUTHORIZED:
                                window.location = n + '#/login';
                                break;
                            case p.BAD_REQUEST:
                                a.errors.invalidSessionId = !0;
                                break;
                            case p.NOT_FOUND:
                                a.errors.sessionNotFound = !0;
                        }
                }
                e.init(a), (a.sessionId = b.sessionId);
                var w,
                    x = b.logId,
                    y = new c(a.sessionId, x),
                    z = a.settings.general.playFrom,
                    A = a.settings.general.pauseAt,
                    B = !1,
                    C = !1,
                    D = 0;
                (a.autostart = !0),
                    (a.startTime = 0),
                    (a.errors = {}),
                    (a.activities = []),
                    f.loadCurrentUser().then(function(a) {
                        i.identify(a),
                            j.initialize(a),
                            a.role !== q && k.update(a);
                    }, v),
                    y.loadSession().then(function(b) {
                        var c = b.log;
                        (a.session = b.session),
                            (a.isLive = b.session.isLive),
                            (a.sessionWasInitiallyLive =
                                b.session.isLive && !a.settings.general.isDemo),
                            angular.isNumber(A)
                                ? ((A = Math.max(A, 0)),
                                  (A = Math.min(A, a.session.length)),
                                  (a.pauseActivity = { id: r, time: A }))
                                : c &&
                                  !a.pauseActivity &&
                                  ((a.selectedLogId = c.id),
                                  (a.pauseActivity = c)),
                            angular.isNumber(z)
                                ? ((z = Math.max(z, 0)),
                                  (z = Math.min(z, a.session.length)),
                                  (a.startTime = z))
                                : !c && a.pauseActivity
                                ? (a.startTime = Math.max(
                                      0,
                                      a.pauseActivity.time - m,
                                  ))
                                : c &&
                                  c == a.pauseActivity &&
                                  (a.startTime = Math.max(0, c.time - m));
                    }, v),
                    d.onPlayerIsInitialized(a, function() {
                        if (a.isLive && a.settings.general.playLive)
                            a.sessionPlayerApi.startLiveStreaming();
                        else {
                            var b = a.session.length;
                            a.sessionPlayerApi.setSessionLength(b),
                                y.loadActivitiesUntil(u, b).then(u, v);
                        }
                    }),
                    d.onStartLiveStreaming(a, function() {
                        (B = !0),
                            (a.isCatchingUpWithLive = !0),
                            y.getSessionStatus().then(function(b) {
                                var c = b.length;
                                a.sessionPlayerApi.setSessionLength(c), t(c);
                            });
                    }),
                    d.onStopLiveStreaming(a, function() {
                        (B = !1), y.stopLoadingActivities();
                    }),
                    y.startLoadingSessionStatus(function(b) {
                        (a.isLive = b.isLive),
                            a.isLive || y.stopLoadingSessionStatus();
                    }),
                    l.registerProgressHandler(
                        new RegExp(o + 'sessions/*'),
                        function(b) {
                            a.requestProgress = b;
                        },
                    );
            },
        ]),
    angular.module('playerApp').controller('SessionDetailsController', [
        '$scope',
        '$mdDialog',
        'sessionData',
        function(a, b, c) {
            (a.sessionData = c),
                (a.close = function() {
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
            'CONSOLE_CONSTANTS',
            'LOG_LEVEL',
            function(a, b, c, d, e, f, g) {
                return {
                    restrict: 'E',
                    replace: !0,
                    templateUrl: 'templates/console.html',
                    scope: {
                        openConsole: '=',
                        closeConsole: '=',
                        isExpanded: '=',
                        addNewLogs: '=',
                        updateConsole: '=',
                        onSelectedLog: '=',
                    },
                    link: function(h, i, j) {
                        function k() {
                            r && (a.cancel(r), (r = null)),
                                (r = a(function() {
                                    c.log('Console search used');
                                }, 2e3));
                        }
                        function l(a) {
                            if (!t.is(':hover') && h.isExpanded) {
                                var b = e.findIndex(h.filteredLogs, [
                                    'activityIndex',
                                    a,
                                ]);
                                if (!(b < 0)) {
                                    var c = (t.outerHeight(), m(a)),
                                        d = 2 * f.STEP_HEIGHT,
                                        g = c - d;
                                    u.stop().animate({ scrollTop: g }, 300);
                                }
                            }
                        }
                        function m(a) {
                            if (isNaN(a)) return 0;
                            var b = 0;
                            return (
                                h.filteredLogs.forEach(function(c) {
                                    if (c.activityIndex < a) {
                                        var d = s[c.activityIndex] || 0;
                                        b += d;
                                    }
                                }),
                                b
                            );
                        }
                        function n() {
                            i.animate({ height: 0 }, f.ANIMATION_TIME),
                                (h.isExpanded = !1),
                                a(function() {
                                    b.fireConsoleResize(h, 0);
                                }, f.ANIMATION_TIME);
                        }
                        function o() {
                            i.animate({ height: f.HEIGHT }, f.ANIMATION_TIME),
                                b.fireConsoleResize(h, f.HEIGHT),
                                (h.isExpanded = !0),
                                h.$broadcast('$md-resize'),
                                l(h.lastPlayedActivityIndex);
                        }
                        function p() {
                            d.forEach(g, function(a) {
                                h.logTypes[a] = !0;
                            });
                        }
                        (h.isExpanded = !1),
                            (h.selectedTab = 0),
                            (h.transformedLogs = []),
                            (h.logTypes = {}),
                            (h.lastPlayedActivityIndex = 0),
                            (h.selectedLogIndex = null);
                        var q,
                            r,
                            s = {},
                            t = i.find('.logs-container'),
                            u = i
                                .find('.md-virtual-repeat-container')
                                .children()
                                .eq(0);
                        p(),
                            (h.openConsole = function(a) {
                                h.isExpanded || o(),
                                    d.isNumber(a) && h.selectLog(a);
                            }),
                            (h.closeConsole = function() {
                                n();
                            }),
                            (h.selectTab = function(a) {
                                h.selectedTab = a;
                            }),
                            (h.toggleFilter = function(a) {
                                (h.logTypes[a] = !h.logTypes[a]),
                                    l(h.lastPlayedActivityIndex),
                                    k();
                            }),
                            (h.searchChanged = function() {
                                k();
                            }),
                            (h.addNewLogs = function(a) {
                                d.isArray(a) &&
                                    a.forEach(function(a) {
                                        if (a) {
                                            if (
                                                (h.transformedLogs.length > 0 &&
                                                    (q =
                                                        h.transformedLogs[
                                                            h.transformedLogs
                                                                .length - 1
                                                        ]),
                                                d.isDifferentActivity(a, q))
                                            )
                                                h.transformedLogs.push(a);
                                            else {
                                                var b =
                                                    h.transformedLogs[
                                                        h.transformedLogs
                                                            .length - 1
                                                    ];
                                                (b.activityIndex =
                                                    a.activityIndex),
                                                    b.count++;
                                            }
                                            s[a.activityIndex] = f.STEP_HEIGHT;
                                        }
                                    });
                            }),
                            (h.updateConsole = function(a) {
                                (h.lastPlayedActivityIndex = a),
                                    h.selectedLogIndex || l(a),
                                    h.selectedLogIndex < a && l(a),
                                    a >= h.selectedLogIndex &&
                                        (h.selectedLogIndex = null);
                            }),
                            (h.selectLog = function(a) {
                                (h.selectedLogIndex = a),
                                    h.onSelectedLog(a),
                                    l(a);
                            }),
                            (h.onLogToggle = function(a, b) {
                                (s[a] = s[a] || 0), (s[a] += b);
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
            function(a, b, c, d, e, f) {
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
                    link: function(b, g, h) {
                        function i() {
                            var d = j(b.log.details.message);
                            (b.log.details.formattedMessage =
                                d.formattedMessage),
                                (b.log.isMultiLine = d.isMultiLine),
                                (b.log.details.stackFrames = k(
                                    b.log.details.stackFrames,
                                )),
                                (b.log.searchLabel =
                                    b.log.searchLabel || l(b.log.details)),
                                (b.log.isMultiLine ||
                                    (b.log.details.stackFrames &&
                                        b.log.details.stackFrames.length >
                                            0)) &&
                                    (b.log.isExpandable = !0),
                                a(function() {
                                    var a = g.find(
                                        '.message-container .message',
                                    );
                                    b.log.isExpandable =
                                        b.log.isExpandable ||
                                        c.isEllipsisActive(a[0]);
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
                                return {
                                    isMultiLine: f.exec(a),
                                    formattedMessage: a,
                                };
                            }
                        }
                        function k(a) {
                            if (a && 0 !== a.length)
                                return d.map(a, function(a) {
                                    if (a) return a.trim();
                                });
                        }
                        function l(a) {
                            var b = a.stackFrames ? a.stackFrames.join('') : '';
                            return a.message + b;
                        }
                        var m = g.find('.message-container');
                        (b.toggleMessage = function(c) {
                            if ('Range' !== c.view.getSelection().type) {
                                var d = m.outerHeight();
                                (b.log.isExpanded = !b.log.isExpanded),
                                    a(function() {
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
    angular.module('playerApp').directive('draggable', function() {
        return {
            restrict: 'A',
            scope: { axis: '@', enableHandle: '=', disableHandle: '=' },
            link: function(a, b, c) {
                var d = $(b).draggable({
                    axis: a.axis,
                    containment: 'parent',
                    disabled: !0,
                });
                (a.enableHandle = function() {
                    d && d.draggable('enable');
                }),
                    (a.disableHandle = function() {
                        d && d.draggable('disable');
                    });
            },
        };
    }),
    angular.module('playerApp').directive('fitWindow', [
        '$window',
        '$timeout',
        function(a, b) {
            return function(c, d) {
                function e() {
                    b(function() {
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
        .constant(
            'INACCESSIBLE_RESOURCES_COOKIE_NAME_PREFIX',
            'sessionstack-inaccessible-resource-detected-',
        )
        .directive('inaccessibleResourcesWarning', [
            '$window',
            '$cookies',
            '$timeout',
            'CookieChangeListener',
            'INACCESSIBLE_RESOURCES_COOKIE_NAME_PREFIX',
            function(a, b, c, d, e) {
                return {
                    templateUrl: 'templates/inaccessibleResourcesWarning.html',
                    replace: !0,
                    scope: { sessionId: '=' },
                    link: function(f, g, h) {
                        function i() {
                            j || k || g.addClass('is-visible');
                        }
                        var j = !1,
                            k = 'http:' === a.location.protocol;
                        f.$watch('sessionId', function(a) {
                            if (a) {
                                var f = e + a,
                                    g = new d(f, function(a) {
                                        a &&
                                            (c(function() {
                                                i();
                                            }, 2e3),
                                            b.remove(f));
                                    });
                                g.listen();
                            }
                        }),
                            (f.closeWarning = function() {
                                (j = !0), g.removeClass('is-visible');
                            }),
                            (f.switchToHttp = function() {
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
        function(a, b, c, d, e) {
            return {
                restrict: 'E',
                templateUrl: 'templates/logDetails.html',
                replace: !0,
                scope: { log: '=' },
                link: function(f) {
                    function g() {
                        var a = b.getCurrentUser(),
                            f = { opened_from: 'step_details' };
                        c.trackEvent(a.id, e.CONSOLE_OPENED, f),
                            d.log('Console opened from step details');
                    }
                    (f.message = ''),
                        f.$watch('log', function(a) {
                            f.message = (a && a.details.message) || '';
                        }),
                        (f.openConsole = function() {
                            g(), a.fireOpenConsole(f, f.log.activityIndex);
                        });
                },
            };
        },
    ]),
    angular
        .module('playerApp')
        .constant('MIN_ACTIVITY_BLOCK_WIDTH', 2)
        .directive('playerTimeline', [
            'MIN_ACTIVITY_BLOCK_WIDTH',
            'player',
            function(a, b) {
                return {
                    templateUrl: 'templates/timeline.html',
                    replace: !0,
                    scope: {
                        min: '=',
                        max: '=',
                        value: '=',
                        isDirty: '=',
                        activities: '=',
                        enable: '=',
                        disable: '=',
                        pauseActivity: '=',
                        isLive: '=',
                        refresh: '=',
                        isCreated: '=',
                    },
                    restrict: 'E',
                    link: function(a, c, d) {
                        function e(b) {
                            var c = p.offset(),
                                d = Math.max(b.pageX - c.left, a.min + 1),
                                e = k(d);
                            j(e);
                        }
                        function f(b) {
                            var c = a.timelineValueToPercentage(b);
                            l(c);
                        }
                        function g(b) {
                            a.activities[u]
                                ? (w = a.timelineValueToPercentage(
                                      a.activities[u].time,
                                  ))
                                : b && (w = 100);
                            a.loadedBarWidth = w;
                        }
                        function h(a) {
                            for (
                                var b,
                                    c,
                                    d = [],
                                    e = o / m(),
                                    f = 0,
                                    g = a.length;
                                f < g;

                            )
                                for (
                                    b = a[f], d.push(b), c = b.time + e, f++;
                                    f < g && a[f].time < c;

                                )
                                    f++;
                            return d;
                        }
                        function i(b) {
                            (a.isDirty = b), a.$apply();
                        }
                        function j(b) {
                            var c = Math.max(b, a.min);
                            (c = Math.min(c, a.max)), (a.value = c), a.$apply();
                        }
                        function k(b) {
                            var c = m(),
                                d = b / c;
                            return a.min + d * o;
                        }
                        function l(b) {
                            (b = Math.max(b, 0)), (b = Math.min(b, 100));
                            var c = a.timelineValueToPercentage(a.value);
                            a.timelineProgressBarWidth = Math.min(c, w);
                            var d = n(s / 2),
                                e = b - d;
                            a.timelineProgressHandleOffset = e;
                        }
                        function m() {
                            return p.width();
                        }
                        function n(a) {
                            var b = m();
                            return (a / b) * 100;
                        }
                        var o,
                            p = c.find('.timeline-clickable-wrapper'),
                            q = c.find('.timeline-progress-handle'),
                            r = c.find('.timeline-pause-activity-wrapper'),
                            s = (c.find('.timeline-buffering-bar'), q.width()),
                            t = !1,
                            u = -1,
                            v = !1,
                            w = 0;
                        (a.pauseActivityOffset = -1),
                            (a.timelineProgressHandleOffset = 0),
                            (a.timelineProgressBarWidth = 0),
                            (a.enable = function() {
                                (v = !0), a.enableTimelineHandle();
                            }),
                            (a.disable = function() {
                                (v = !1), a.disableTimelineHandle();
                            }),
                            a.$watch('[max, min]', function() {
                                angular.isUndefined(a.min) ||
                                    angular.isUndefined(a.max) ||
                                    ((o = a.max - a.min), a.refresh());
                            }),
                            q.on('drag', function(b, c) {
                                if (v) {
                                    var d = Math.max(
                                            c.position.left,
                                            a.min + 1,
                                        ),
                                        e = k(d);
                                    (t = !0), j(e), (t = !1);
                                }
                            }),
                            q.on('dragstart', function() {
                                v && i(!0);
                            }),
                            q.on('dragstop', function(a) {
                                e(a), i(!1);
                            }),
                            p.on('click', function(a) {
                                v && (i(!0), e(a), i(!1));
                            }),
                            a.$watch('value', function(a) {
                                t || f(a);
                            }),
                            a.$watch('pauseActivity', function() {
                                a.pauseActivity && a.refresh();
                            }),
                            (a.refresh = function(b) {
                                if (angular.isArray(a.activities)) {
                                    var c = a.activities.slice(u + 1),
                                        d = a.activityBlocks || [];
                                    angular.forEach(c, function(a) {
                                        d.push({ time: a.time });
                                    }),
                                        (a.activityBlocks = h(d)),
                                        (u = a.activities.length - 1),
                                        g(b),
                                        f(a.value),
                                        a.pauseActivity
                                            ? (r.show(),
                                              (a.pauseActivityOffset = a.timelineValueToPercentage(
                                                  Math.max(
                                                      0,
                                                      a.pauseActivity.time,
                                                  ),
                                              )))
                                            : r.hide();
                                }
                            }),
                            a.$watch('activities.length', a.refresh),
                            (a.timelineValueToPercentage = function(a) {
                                return (a / o) * 100;
                            }),
                            b.onShowBuffering(a, function() {
                                a.isBuffering = !0;
                            }),
                            b.onHideBuffering(a, function() {
                                a.isBuffering = !1;
                            }),
                            (a.isCreated = !0);
                    },
                };
            },
        ]),
    angular.module('playerApp').directive('resize', [
        '$window',
        '$timeout',
        function(a, b) {
            return {
                link: function(c, d, e) {
                    function f() {
                        b(function() {
                            (c.containerWidth = g.width()),
                                (c.containerHeight = g.height());
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
            function(a, b) {
                return {
                    restrict: 'E',
                    templateUrl: '../templates/sections.html',
                    replace: !0,
                    scope: { sessionData: '=' },
                    link: function(c) {
                        function d(d) {
                            var e, f;
                            angular.isDefined(d.browserName) &&
                                angular.isDefined(d.browserVersion) &&
                                (e = d.browserName + ' ' + d.browserVersion),
                                angular.isDefined(d.screenWidth) &&
                                    angular.isDefined(d.screenHeight) &&
                                    (f =
                                        d.screenWidth + ' x ' + d.screenHeight),
                                (c.sections = [
                                    {
                                        name: 'Session',
                                        items: [
                                            {
                                                label: 'Length',
                                                value: a('lengthformat')(
                                                    d.length,
                                                ),
                                            },
                                            {
                                                label: 'Start',
                                                value: a('detaileddateformat')(
                                                    d.start,
                                                ),
                                            },
                                            {
                                                label: 'Last active',
                                                value: a('detaileddateformat')(
                                                    d.lastActive,
                                                ),
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
                                                value: d.layoutName || b,
                                            },
                                            { label: 'OS', value: d.os || b },
                                            {
                                                label: 'Product',
                                                value: d.product || b,
                                            },
                                            {
                                                label: 'Manufacturer',
                                                value: d.manufacturer || b,
                                            },
                                            { label: 'Screen', value: f || b },
                                        ],
                                    },
                                    {
                                        name: 'Location',
                                        items: [
                                            { label: 'IP', value: d.ip || b },
                                            {
                                                label: 'Country',
                                                value: d.country || b,
                                            },
                                            {
                                                label: 'City',
                                                value: d.city || b,
                                            },
                                        ],
                                    },
                                ]);
                        }
                        c.$watch('sessionData', function(a) {
                            a && d(a);
                        });
                    },
                };
            },
        ]),
    angular
        .module('playerApp')
        .constant('PLAYER_CONFIG', {
            PLAY_SPEED: 50,
            MAX_INACTIVITY_TIME: 3e3,
            EVENTS_BATCH_SIZE: 50,
            EVENTS_BATCH_WAIT_TIME: 0,
            TAB_HIDDEN_MESSAGE_TIME: 1e3,
            GO_LIVE_DELAY_TIME: 1500,
            LAG_TIME: 500,
            MILLISECONDS_PER_FRAME: 33,
        })
        .constant('TAB_VISIBILITY', { VISIBLE: 'visible', HIDDEN: 'hidden' })
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
            'AsyncWhile',
            'PLAYER_CONFIG',
            'ANALYTICS_EVENT_TYPES',
            'BUILD_ENV',
            'EVENT_TYPE',
            'TAB_VISIBILITY',
            'PAUSE_AT_ACTIVITY_ID',
            'UI_MODE',
            'LOG_LEVEL',
            function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r) {
                return {
                    restrict: 'E',
                    replace: !0,
                    templateUrl: 'templates/player.html',
                    scope: {
                        session: '=',
                        isLive: '=',
                        autostart: '=',
                        isTimelineDirty: '=?',
                        timelineValue: '=?',
                        startTime: '=',
                        selectedLogId: '=',
                        requestProgress: '=',
                        pauseActivity: '=',
                        settings: '=',
                        sessionWasInitiallyLive: '=',
                        errors: '=',
                        api: '=',
                        isCatchingUpWithLive: '=',
                    },
                    link: function(s, t, u) {
                        function v() {
                            return (
                                J() &&
                                !s.isPlaying &&
                                wa >= 0 &&
                                s.activities[s.activities.length - 1].time -
                                    s.activities[wa].time <
                                    k.GO_LIVE_DELAY_TIME
                            );
                        }
                        function w(a) {
                            return !!a.id && a.id !== p;
                        }
                        function x(a) {
                            var b = [],
                                d = [];
                            return (
                                angular.forEach(a, function(e, f) {
                                    var g, h, i;
                                    if (y(e)) {
                                        (h = A(e)),
                                            (g = D(e)),
                                            (i =
                                                s.activities.length -
                                                a.length +
                                                f);
                                        var j = {
                                            time: e.time,
                                            activityIndex: i,
                                            type: g,
                                            isLog: w(e),
                                            details: h,
                                        };
                                        j.isLog
                                            ? (d.push(c.cloneDeep(j)),
                                              j.details.level === r.ERROR &&
                                                  b.push(j))
                                            : b.push(j);
                                    }
                                }),
                                { steps: b, logs: d }
                            );
                        }
                        function y(a) {
                            return w(a) || z(a);
                        }
                        function z(a) {
                            return (
                                !!a.data &&
                                (a.type === n.MOUSE_CLICK ||
                                    (ua.indexOf(a.type) >= 0 &&
                                        !a.data.frameElementId))
                            );
                        }
                        function A(a) {
                            return w(a) ? B(a) : C(a);
                        }
                        function B(a) {
                            return {
                                id: a.id,
                                message: a.message,
                                isMessageTrimmed: a.isMessageTrimmed,
                                stackFrames: a.stackFrames,
                                level: a.level,
                            };
                        }
                        function C(a) {
                            var b = a.data;
                            switch (a.type) {
                                case n.MOUSE_CLICK:
                                    return {
                                        top: b.y,
                                        left: b.x,
                                        absoluteTop: b.pageY,
                                        absoluteLeft: b.pageX,
                                        selector: b.selector,
                                    };
                                case n.DOM_SNAPSHOT:
                                    return { pageUrl: b.pageUrl };
                                case n.WINDOW_RESIZE:
                                    return { width: b.width, height: b.height };
                                case n.VISIBILITY_CHANGE:
                                    return {
                                        visibilityState: b.visibilityState,
                                    };
                            }
                        }
                        function D(a) {
                            return w(a) ? a.level : a.type;
                        }
                        function E(a, b) {
                            if (I()) {
                                (s.timelineValue = a), da();
                                var d = c.findLastIndex(s.activities, function(
                                    b,
                                ) {
                                    return b.time <= a;
                                });
                                _(d, b);
                            }
                        }
                        function F() {
                            ta && ta.cancel(),
                                s.isStreamingLive
                                    ? e.fireShowBuffering(s)
                                    : e.fireShowViewerOverlay(s),
                                s.disableStepsTimeline(),
                                (s.arePlayerButtonsEnabled = !1),
                                (s.isRendering = !0),
                                e.fireVisualizeClicks(s, !1),
                                e.fireDetach(s);
                        }
                        function G(a) {
                            e.fireAttach(s, function() {
                                e.fireVisualizeClicks(
                                    s,
                                    s.settings.playback.shouldVisualizeClicks,
                                ),
                                    s.isStreamingLive &&
                                        !s.isCatchingUpWithLive &&
                                        ma(!1),
                                    e.fireHideViewerOverlay(s),
                                    s.enableStepsTimeline(),
                                    (s.isRendering = !1),
                                    (s.arePlayerButtonsEnabled = !0),
                                    pa(wa),
                                    angular.isFunction(a) && a();
                            });
                        }
                        function H() {
                            ka(), da(), ea();
                        }
                        function I() {
                            return s.autostart && J();
                        }
                        function J() {
                            return (
                                s.viewerIsCreated &&
                                s.timelineIsCreated &&
                                s.stepsTimelineIsCreated &&
                                !!s.session
                            );
                        }
                        function K(a) {
                            (s.hasFinished = !1), ea(a), e.firePlayerStarted(s);
                        }
                        function L() {
                            ka(), da(), e.firePlayerStopped(s);
                        }
                        function M(a) {
                            if (!ra) {
                                s.timeoutExecutionError = 0;
                                var c = wa + 1;
                                if (c < s.activities.length)
                                    if (
                                        s.settings.playback
                                            .shouldSkipProlongedInactivity &&
                                        ya &&
                                        !s.isStreamingLive
                                    )
                                        O();
                                    else {
                                        var d = $(
                                            s.timelineValue,
                                            s.activities[c].time,
                                        );
                                        ra = b(function() {
                                            N(c, a);
                                        }, d / s.settings.playback.speed);
                                    }
                                else V();
                            }
                        }
                        function N(a, b) {
                            var c = new Date(),
                                d = s.activities[a].time,
                                e = d;
                            for (s.timelineValue = d; Y(a, e); ) {
                                if (W(a, b))
                                    return (
                                        s.pause(),
                                        void (
                                            s.settings.general.isDemo &&
                                            s.selectedLogId &&
                                            (s.logStep = 1)
                                        )
                                    );
                                aa(a), a++;
                            }
                            s.settings.playback.shouldSkipProlongedInactivity &&
                            ya &&
                            !s.isStreamingLive
                                ? O()
                                : R(s.activities[a - 1].time - d, c);
                        }
                        function O() {
                            if (P())
                                (ya = !1), e.fireHideHiddenTabOverlay(s), R();
                            else {
                                var a;
                                s.pauseActivity && !Q()
                                    ? b(function() {
                                          E(s.pauseActivity.time, da);
                                      }, k.TAB_HIDDEN_MESSAGE_TIME)
                                    : ((a = U()),
                                      b(function() {
                                          _(a, R);
                                      }, k.TAB_HIDDEN_MESSAGE_TIME));
                            }
                        }
                        function P() {
                            for (var a = U(), b = wa; b < a; b++) {
                                var d = s.activities[b].type;
                                if (c.includes(va, d)) return !0;
                            }
                            return !1;
                        }
                        function Q() {
                            if (s.pauseActivity)
                                return s.timelineValue >= s.pauseActivity.time;
                        }
                        function R(a, c) {
                            a = a || 0;
                            var d = wa + 1;
                            if (d < s.activities.length) {
                                var e = s.activities[wa].time,
                                    f = s.activities[d].time,
                                    g = T(e, f, a);
                                (g = S(g, c)),
                                    (ra = b(function() {
                                        N(d);
                                    }, g));
                            } else V();
                        }
                        function S(a, b) {
                            if (!b) return 0;
                            var c = new Date();
                            return (
                                (s.timeoutExecutionError +=
                                    c.getTime() - b.getTime()),
                                s.timeoutExecutionError > 0 &&
                                    (s.timeoutExecutionError > a
                                        ? ((s.timeoutExecutionError =
                                              s.timeoutExecutionError - a),
                                          (a = 0))
                                        : ((a -= s.timeoutExecutionError),
                                          (s.timeoutExecutionError = 0))),
                                a
                            );
                        }
                        function T(a, b, c) {
                            var d = $(a, b),
                                e = d / s.settings.playback.speed;
                            if (s.isStreamingLive) {
                                var f =
                                        s.activities[s.activities.length - 1]
                                            .time,
                                    g = f - b;
                                if (g > k.LAG_TIME) return 0;
                            }
                            return e + c;
                        }
                        function U() {
                            for (var a = wa; a < s.activities.length; a++) {
                                var b = s.activities[a];
                                if (
                                    b.type === n.VISIBILITY_CHANGE &&
                                    b.data.visibilityState === o.VISIBLE
                                )
                                    return a;
                            }
                            return s.activities.length - 1;
                        }
                        function V() {
                            s.activities.length > 0 &&
                                (s.timelineValue =
                                    s.activities[s.activities.length - 1].time),
                                da(),
                                s.isStreamingLive || (s.hasFinished = !0);
                        }
                        function W(a, b) {
                            return (
                                !b &&
                                s.settings.playback.shouldPauseOnMarker &&
                                s.pauseActivity &&
                                s.pauseActivity.id === s.activities[a].id
                            );
                        }
                        function X() {
                            ra && (b.cancel(ra), (ra = null));
                        }
                        function Y(a, b) {
                            var c = Z(a);
                            return (
                                a < s.activities.length &&
                                s.activities[a].time >= b &&
                                s.activities[a].time <= b + c
                            );
                        }
                        function Z(a) {
                            if (!s.isStreamingLive)
                                return k.MILLISECONDS_PER_FRAME;
                            a = Math.min(a, s.activities.length - 1);
                            var b = s.activities[a].time,
                                c = s.activities[s.activities.length - 1].time,
                                d = c - b;
                            return d > k.LAG_TIME
                                ? 500
                                : k.MILLISECONDS_PER_FRAME;
                        }
                        function $(a, b) {
                            var c = b - a;
                            return (
                                s.settings.playback
                                    .shouldSkipProlongedInactivity &&
                                    (c = Math.min(c, k.MAX_INACTIVITY_TIME)),
                                c
                            );
                        }
                        function _(a, b) {
                            F(),
                                (wa > a || wa === -1) &&
                                    ((ya = !1), e.fireClear(s, s.snapshotData));
                            var c = 0;
                            wa <= a ? (c = wa + 1) : (wa = -1),
                                (a = Math.min(a, s.activities.length - 1));
                            var d = c,
                                f = function() {
                                    return d <= a;
                                },
                                g = function() {
                                    for (
                                        var b = Math.min(
                                            a,
                                            d + k.EVENTS_BATCH_SIZE,
                                        );
                                        d <= b;
                                        d++
                                    )
                                        aa(d);
                                    s.renderingProgress = {
                                        current: d - c - 1,
                                        total: a - c,
                                    };
                                },
                                h = { waitTime: k.EVENTS_BATCH_WAIT_TIME };
                            (ta = new j(f, g, h)),
                                ta.start(function() {
                                    if (wa === -1 || !s.isStreamingLive)
                                        return void G(b);
                                    var a = s.activities[wa].time;
                                    s.isStreamingLive &&
                                        s.timelineMax - a <
                                            k.GO_LIVE_DELAY_TIME &&
                                        G(b);
                                });
                        }
                        function aa(a) {
                            var b = s.activities[a];
                            w(b) || e.fireExecuteEvent(s, b),
                                (wa = a),
                                pa(a),
                                b.type === n.VISIBILITY_CHANGE &&
                                    (ya = b.data.visibilityState === o.HIDDEN);
                        }
                        function ba() {
                            sa ||
                                (sa = a(function() {
                                    var a = s.timelineValue + k.PLAY_SPEED,
                                        b = s.activities[wa + 1];
                                    b &&
                                        (s.timelineValue = Math.min(a, b.time));
                                }, k.PLAY_SPEED / s.settings.playback.speed));
                        }
                        function ca() {
                            sa && (a.cancel(sa), (sa = null));
                        }
                        function da() {
                            X(), ca(), (s.isPlaying = !1);
                        }
                        function ea(a) {
                            (s.isPlaying = !0), M(a), ba();
                        }
                        function fa() {
                            if (s.isStreamingLive && s.isRendering) {
                                var a =
                                    s.activities[s.activities.length - 1].time;
                                (s.timelineValue = Math.max(
                                    s.timelineValue,
                                    a,
                                )),
                                    _(s.activities.length, ja);
                            } else if (xa && s.timelineValue > 0) {
                                var b = c.findLastIndex(s.activities, function(
                                    a,
                                ) {
                                    return a.time <= s.timelineValue;
                                });
                                _(b, ja);
                            }
                        }
                        function ga(a) {
                            (s.timelineValue = a), ha();
                        }
                        function ha() {
                            s.loadedTime < s.timelineValue
                                ? (ma(!0),
                                  (s.arePlayerButtonsEnabled = !1),
                                  da())
                                : s.loadedTime >= s.timelineValue &&
                                  (ma(!1),
                                  (s.arePlayerButtonsEnabled = !0),
                                  ia());
                        }
                        function ia() {
                            if (Ba) (Ba = !1), E(s.timelineValue, ja);
                            else {
                                var a = !s.isStreamingLive && s.isRendering;
                                s.isPlaying ||
                                    a ||
                                    Aa ||
                                    E(s.timelineValue, ja);
                            }
                        }
                        function ja() {
                            xa || s.isTimelineDirty || K();
                        }
                        function ka() {
                            s.isStreamingLive &&
                                ((s.isStreamingLive = !1),
                                e.fireStopLiveStreaming(s));
                        }
                        function la() {
                            s.isStreamingLive ||
                                ((s.isStreamingLive = !0),
                                e.fireStartLiveStreaming(s),
                                ga(s.timelineMax));
                        }
                        function ma(a) {
                            (xa = a),
                                a
                                    ? e.fireShowBuffering(s)
                                    : e.fireHideBuffering(s);
                        }
                        function na(a) {
                            if (i.isArray(a)) {
                                a.length > 0 &&
                                    !za &&
                                    s.pauseActivity &&
                                    s.pauseActivity.id === p &&
                                    s.pauseActivity.time <
                                        a[a.length - 1].time &&
                                    ((a = i.mergeSortedArrays(
                                        a,
                                        [s.pauseActivity],
                                        'time',
                                    )),
                                    (za = !0)),
                                    (s.activities = i.concatenateArrays(
                                        s.activities,
                                        a,
                                    ));
                                var b = x(a),
                                    c = b.steps,
                                    d = b.logs;
                                i.isArray(c) &&
                                    c.length > 0 &&
                                    s.addNewSteps(c),
                                    i.isArray(d) &&
                                        d.length > 0 &&
                                        s.addNewLogs(d),
                                    s.activities.length > 0
                                        ? (s.loadedTime =
                                              s.activities[
                                                  s.activities.length - 1
                                              ].time)
                                        : (s.loadedTime = s.timelineMax),
                                    s.loadedTime > s.timelineMax &&
                                        (s.timelineMax = s.loadedTime);
                                var f = s.loadedTime === s.timelineMax;
                                f && e.fireHideStepsBuffering(s),
                                    i.isFunction(s.refreshTimeline) &&
                                        s.refreshTimeline(f);
                            }
                        }
                        function oa() {
                            i.isFunction(s.enableTimeline) &&
                                s.enableTimeline();
                        }
                        function pa(a) {
                            i.isFunction(s.updateStepsTimeline) &&
                                s.updateStepsTimeline(a),
                                i.isFunction(s.updateConsole) &&
                                    s.updateConsole(a);
                        }
                        function qa() {
                            var a = h.getCurrentUser(),
                                b = { opened_from: 'timeline_controls' };
                            g.trackEvent(a.id, l.CONSOLE_OPENED, b),
                                f.log('Console opened from time line controls');
                        }
                        var ra,
                            sa,
                            ta,
                            ua = [
                                n.DOM_SNAPSHOT,
                                n.WINDOW_RESIZE,
                                n.VISIBILITY_CHANGE,
                            ],
                            va = [n.MOUSE_CLICK, n.MOUSE_MOVE, n.WINDOW_RESIZE],
                            wa = -1,
                            xa = !1,
                            ya = !1,
                            za = !1,
                            Aa = !1,
                            Ba = !1;
                        (s.PLAYER_ONLINE_MODE = m.PLAYER_ONLINE_MODE),
                            (s.isPlaying = !1),
                            (s.timelineMin = 0),
                            (s.timelineMax = 0),
                            (s.timelineValue = 0),
                            (s.arePlayerButtonsEnabled = !0),
                            (s.sessionScreenWidth = 0),
                            (s.sessionScreenHeight = 0),
                            (s.renderingProgress = 0),
                            (s.speedOptions = [
                                { label: '0.25x', value: 0.25 },
                                { label: '0.5x', value: 0.5 },
                                { label: 'Normal', value: 1 },
                                { label: '2x', value: 2 },
                                { label: '4x', value: 4 },
                            ]),
                            (s.loadedTime = -1),
                            (s.steps = []),
                            (s.activities = []),
                            (s.detailsStep = 0),
                            (s.logStep = 0),
                            (s.isStreamingLive = !1),
                            (s.isSimpleUIMode =
                                s.settings.general.uiMode === q.SIMPLE),
                            (s.shouldShowLoadingOverlay = !0),
                            (s.settings.playback.speedOption = function(a) {
                                return arguments.length > 0
                                    ? (s.settings.playback.speed = a.value)
                                    : c.find(s.speedOptions, function(a) {
                                          return (
                                              a.value ===
                                              s.settings.playback.speed
                                          );
                                      });
                            }),
                            s.$watch('session', function(a) {
                                a
                                    ? ((wa = -1),
                                      (s.sessionId = a.id),
                                      (s.sessionScreenWidth = a.screenWidth),
                                      (s.sessionScreenHeight = a.screenHeight),
                                      (s.snapshotData = {
                                          snapshot: a.snapshot,
                                          origin: a.origin,
                                          docType: a.docType,
                                          top: a.top,
                                          left: a.left,
                                      }),
                                      s.settings.general.isDemo &&
                                          !s.selectedLogId &&
                                          (s.detailsStep = 1),
                                      (ya = a.visibilityState === o.HIDDEN))
                                    : (s.arePlayerButtonsEnabled = !1);
                            }),
                            s.$watch(J, function(a) {
                                a &&
                                    (oa(),
                                    e.firePlayerIsInitialized(s),
                                    s.hideUserDetailsMask(),
                                    s.hideStepsTimelineMask(),
                                    (s.shouldShowLoadingOverlay = !1));
                            }),
                            s.$watch('isTimelineDirty', function(a) {
                                a === !0
                                    ? L()
                                    : a === !1 &&
                                      ((Ba = !0),
                                      da(),
                                      ka(),
                                      e.firePlayerStopped(s),
                                      ga(s.timelineValue));
                            }),
                            s.$on('$destroy', function() {
                                da();
                            }),
                            s.$watch(
                                'settings.playback.shouldSkipProlongedInactivity',
                                function() {
                                    J() && s.isPlaying && H();
                                },
                            ),
                            s.$watch(
                                'settings.playback.shouldVisualizeClicks',
                                function(a) {
                                    e.fireVisualizeClicks(s, a);
                                },
                            ),
                            s.$watch('settings.playback.speed', function(a) {
                                J() &&
                                    s.isPlaying &&
                                    (H(), e.firePlayerSpeedChange(s, a));
                            }),
                            (s.togglePlaying = function() {
                                v()
                                    ? ((Aa = !0), ka())
                                    : s.isPlaying || s.isStreamingLive
                                    ? ((Aa = !0), L())
                                    : ((Aa = !1), K(!0));
                            }),
                            (s.play = function() {
                                (Aa = !1), K(!0);
                            }),
                            (s.pause = function() {
                                (Aa = !0), L();
                            }),
                            (s.repeat = function() {
                                (wa = -1), E(s.startTime, K);
                            }),
                            (s.showSessionDetails = function(a) {
                                f.log("Clicked on 'Details'"),
                                    s.pause(),
                                    d.open(a);
                            }),
                            (s.onSelectedActivity = function(a) {
                                s.hasFinished = !1;
                                var b = s.activities[a];
                                (s.timelineValue = b.time),
                                    wa + 1 !== a && (s.pause(), _(a - 1));
                            }),
                            s.$watch('isLive', function(a) {
                                a || ka();
                            }),
                            (s.goLive = function() {
                                (Ba = !0), da(), e.firePlayerStopped(s), la();
                            }),
                            (s.api = {
                                setSessionLength: function(a) {
                                    s.timelineMax = a;
                                    var b = s.timelineValue || s.startTime;
                                    s.isStreamingLive && (b = s.timelineMax),
                                        ga(b);
                                },
                                finishLoadingActivities: function() {
                                    s.isStreamingLive && ga(s.timelineMax);
                                },
                                addActivities: function(a) {
                                    var b =
                                        v() &&
                                        !s.isRendering &&
                                        s.isStreamingLive &&
                                        !xa &&
                                        a &&
                                        a.length > 0;
                                    na(a),
                                        (s.pauseActivity &&
                                            s.pauseActivity.time ===
                                                s.timelineValue) ||
                                            (fa(),
                                            b &&
                                                ((s.timelineValue = a[0].time),
                                                K()),
                                            s.isStreamingLive || ha());
                                },
                                startLiveStreaming: la,
                            }),
                            e.onUserDetailsResize(s, function(a, b) {
                                s.handleUserDetailsResize(b);
                            }),
                            e.onConsoleResize(s, function(a, b) {
                                s.handleConsoleResize(b);
                            }),
                            e.onOpenConsole(s, function(a, b) {
                                s.openConsole(b);
                            }),
                            (s.toggleConsole = function() {
                                s.isConsoleExpanded
                                    ? s.closeConsole()
                                    : (qa(), s.openConsole());
                            });
                    },
                };
            },
        ]),
    angular
        .module('playerApp')
        .constant('STYLESHEETS_SELECTOR', 'style, link[rel="stylesheet"]')
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
            function(a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/viewer.html',
                    replace: !0,
                    scope: {
                        sessionScreenWidth: '=',
                        sessionScreenHeight: '=',
                        maxWidth: '=',
                        maxHeight: '=',
                        isCreated: '=',
                        renderingProgress: '=',
                        initialVisibilityState: '=',
                        showLoadingAnimation: '=',
                        sessionId: '=',
                        handleConsoleResize: '=',
                    },
                    link: function(b, l, m) {
                        function o(a, b) {
                            fa[a] = b;
                        }
                        function p(a) {
                            return fa[a];
                        }
                        function q(a, c, d, e) {
                            var f = a - 2 * h.HORIZONTAL,
                                g = c - 2 * h.VERTICAL,
                                i = 1,
                                j = 1;
                            0 !== d && (i = d < f ? 1 : f / d),
                                0 !== e && (j = e < g ? 1 : g / e),
                                (b.scale = Math.min(i, j));
                            var k = d * b.scale,
                                l = e * b.scale;
                            f > k
                                ? (b.marginLeft = (a - k) / 2)
                                : (b.marginLeft = h.HORIZONTAL),
                                g > l
                                    ? (b.marginTop = (c - l) / 2)
                                    : (b.marginTop = h.VERTICAL),
                                ca.css({ width: d, height: e });
                        }
                        function r() {
                            aa && aa.cancel(), da.detach();
                        }
                        function s(a, b) {
                            da.attach(function() {
                                t(), u(), V(), angular.isFunction(b) && b();
                            });
                        }
                        function t() {
                            x({ top: ja.top, left: ja.left }),
                                angular.forEach(ia, function(a, b) {
                                    var c = p(b);
                                    c(a);
                                }),
                                angular.forEach(Object.keys(ka), function(a) {
                                    x(ka[a]);
                                });
                        }
                        function u() {
                            da.traverseDocuments(ea, y);
                        }
                        function v(b) {
                            var c = ha[b.id],
                                d = angular.element(z(b.id));
                            c && (c.cancel(), delete ha[b.id]);
                            var e = function() {
                                    return (
                                        d.scrollLeft() !== b.left ||
                                        d.scrollTop() !== b.top
                                    );
                                },
                                f = function() {
                                    a(function() {
                                        d.scrollTop(b.top),
                                            d.scrollLeft(b.left);
                                    });
                                },
                                h = {
                                    maxIterations: i.MAX_RETRIES,
                                    waitTime: i.TIMEOUT,
                                };
                            (ha[b.id] = new g(e, f, h)), ha[b.id].start();
                        }
                        function w(b) {
                            var c = ga[b.id],
                                d = angular.element(da.getNode(b.id));
                            if (d && !d.is(n.HTML)) {
                                c && (c.cancel(), delete ga[b.id]);
                                var e = function() {
                                        return (
                                            d.scrollTop() !== b.top ||
                                            d.scrollLeft() !== b.left
                                        );
                                    },
                                    f = function() {
                                        a(function() {
                                            d.scrollTop(b.top),
                                                d.scrollLeft(b.left);
                                        });
                                    },
                                    h = {
                                        maxIterations: i.MAX_RETRIES,
                                        waitTime: i.TIMEOUT,
                                    };
                                (ga[b.id] = new g(e, f, h)), ga[b.id].start();
                            }
                        }
                        function x(a) {
                            var b = p(j.SCROLL_POSITION_CHANGE);
                            b(a);
                        }
                        function y(a) {
                            da.traverseNode(a, function(a) {
                                var b = da.getNodePropertyObject(a);
                                if (b.top || b.left) {
                                    var c = {
                                        id: b.nodeId,
                                        top: b.top,
                                        left: b.left,
                                    };
                                    ka[c.id] || x(c);
                                }
                            });
                        }
                        function z(a) {
                            var b = A(a);
                            return (
                                (b && b.contentWindow) || (b = A()),
                                b.contentWindow
                            );
                        }
                        function A(a) {
                            return angular.isDefined(a) ? da.getNode(a) : ba[0];
                        }
                        function B(a, c, d) {
                            var e = {
                                id: d,
                                top: a,
                                left: c,
                                windowScroll: !0,
                            };
                            da.isAttached &&
                                (v(e),
                                angular.isUndefined(d) &&
                                    b.viewerOverlay &&
                                    b.viewerOverlay.setScrollPosition(a, c)),
                                angular.isUndefined(d)
                                    ? (ja = { top: a || 0, left: c || 0 })
                                    : (ka[d] = e);
                        }
                        function C(a, c) {
                            c &&
                                ((ia = {}),
                                (ka = {}),
                                (ja = { top: 0, left: 0 }),
                                E(b.initialVisibilityState),
                                G(c),
                                (b.sessionScreenWidth = $),
                                (b.sessionScreenHeight = _));
                        }
                        function D(a, b) {
                            var c = b.type,
                                d = b.data,
                                e = p(c);
                            e && d && e(d);
                        }
                        function E(a) {
                            b.viewerOverlay &&
                                ('prerender' === a || 'hidden' === a
                                    ? b.viewerOverlay.showVisibilityOverlay(a)
                                    : b.viewerOverlay.hideVisibilityOverlay(),
                                (b.visibilityState = a));
                        }
                        function F(a) {
                            d.isDefined(a.visibilityState) &&
                                b.visibilityState !== a.visibilityState &&
                                E(a.visibilityState),
                                G(a);
                        }
                        function G(a) {
                            da &&
                                (da.write(a, b.sessionId),
                                B(a.top, a.left, a.frameElementId));
                        }
                        function H(a) {
                            var b = angular.element(da.getNode(a.id));
                            b.val(a.value);
                        }
                        function I(a) {
                            if (da.isAttached && b.viewerOverlay) {
                                var c = M(a.frameElementId),
                                    d = a.y + c.top,
                                    e = a.x + c.left;
                                b.viewerOverlay.setCursorPosition({
                                    top: d,
                                    left: e,
                                });
                            } else ia[j.MOUSE_MOVE] = a;
                        }
                        function J(a) {
                            if ((I(a), da.isAttached && b.viewerOverlay)) {
                                var c = M(a.frameElementId),
                                    d = ja.top + a.y + c.top,
                                    e = ja.left + a.x + c.left;
                                b.viewerOverlay.registerClick(d, e);
                            }
                        }
                        function K(a) {
                            var b = angular.element(da.getNode(a.id));
                            b && (b.addClass(k), b.parents().addClass(k));
                        }
                        function L(a) {
                            var b = angular.element(da.getNode(a.id));
                            b && (b.removeClass(k), b.parents().removeClass(k));
                        }
                        function M(a) {
                            var b;
                            return (
                                angular.isDefined(a) && (b = da.getNode(a)),
                                da.getNodeOffset(b)
                            );
                        }
                        function N(a) {
                            a.id
                                ? (ka[a.id] = a)
                                : (ja = { top: a.top || 0, left: a.left || 0 }),
                                da.isAttached &&
                                    (a.id
                                        ? a.windowScroll
                                            ? B(a.top, a.left, a.id)
                                            : w(a)
                                        : B(a.top, a.left));
                        }
                        function O(a) {
                            da.isAttached
                                ? ((b.sessionScreenWidth = a.width),
                                  (b.sessionScreenHeight = a.height),
                                  b.viewerOverlay &&
                                      b.viewerOverlay.setScrollPosition(
                                          ja.top,
                                          ja.left,
                                      ))
                                : (ia[j.WINDOW_RESIZE] = a);
                        }
                        function P(a) {
                            var b = angular.element(da.getNode(a.id));
                            b.prop('checked', a.state);
                        }
                        function Q(a) {
                            var b = angular.element(da.getNode(a.id));
                            b.prop('checked', a.state);
                        }
                        function R(a) {
                            W(a.addedOrMoved),
                                X(a.removed),
                                Z(a.characterData),
                                Y(a.attributes);
                        }
                        function S(a) {
                            E(a.visibilityState);
                        }
                        function T(a) {
                            var b = da.getNode(a.nodeId),
                                c = da.getNodePropertyObject(b);
                            if (
                                ((da.styleRuleNodes[a.nodeId] = b),
                                (c.styleRules = c.styleRules || []),
                                isNaN(a.index)
                                    ? c.styleRules.push(a.rule)
                                    : c.styleRules.splice(a.index, 0, a.rule),
                                da.isAttached)
                            )
                                try {
                                    b.sheet.insertRule(a.rule);
                                } catch (d) {}
                        }
                        function U(a) {
                            var b = da.getNode(a.nodeId),
                                c = da.getNodePropertyObject(b);
                            if (
                                ((da.styleRuleNodes[a.nodeId] = b),
                                (c.styleRules = c.styleRules || []),
                                c.styleRules.length > a.index &&
                                    c.styleRules.splice(a.index, 1),
                                da.isAttached)
                            )
                                try {
                                    b.sheet.deleteRule(a.index);
                                } catch (d) {}
                        }
                        function V() {
                            d.forEach(da.styleRuleNodes, function(a) {
                                var b = da.getNodePropertyObject(a);
                                b.styleRules &&
                                    b.styleRules.forEach(function(b) {
                                        try {
                                            a.sheet.insertRule(b);
                                        } catch (c) {}
                                    });
                            });
                        }
                        function W(a) {
                            a &&
                                angular.forEach(a, function(a) {
                                    var b;
                                    if (
                                        ((b = a.node
                                            ? da.createElement(a.node)
                                            : da.getNode(a.id)),
                                        a.frameElementId)
                                    )
                                        a.node.nodeType === Node.ELEMENT_NODE
                                            ? da.replaceDocumentElement(
                                                  b,
                                                  a.frameElementId,
                                              )
                                            : a.node.nodeType ===
                                                  Node.DOCUMENT_TYPE_NODE &&
                                              da.replaceDocType(
                                                  a.node.docTypeString,
                                                  a.frameElementId,
                                              );
                                    else if (a.previousSiblingId) {
                                        var c = da.getNode(a.previousSiblingId);
                                        da.insertAfter(c, b), y(b);
                                    } else if (a.parentId) {
                                        var d = da.getNode(a.parentId);
                                        d
                                            ? (da.prepend(d, b), y(b))
                                            : e.warn(
                                                  'Missing parent node, id: ' +
                                                      a.parentId,
                                              );
                                    }
                                });
                        }
                        function X(a) {
                            a &&
                                angular.forEach(a, function(a) {
                                    var b = da.getNode(a.id);
                                    da.removeNode(b);
                                });
                        }
                        function Y(a) {
                            a &&
                                angular.forEach(a, function(a) {
                                    var b = da.getNode(a.id);
                                    da.setAttribute(b, a.name, a.value);
                                });
                        }
                        function Z(a) {
                            a &&
                                angular.forEach(a, function(a) {
                                    var b = da.getNode(a.id);
                                    b && (b.textContent = a.value);
                                });
                        }
                        var $,
                            _,
                            aa,
                            ba = angular.element('#viewer'),
                            ca = angular.element('#viewer-container'),
                            da = new f(ba[0]),
                            ea = void 0,
                            fa = {},
                            ga = {},
                            ha = {},
                            ia = {},
                            ja = { top: 0, left: 0 },
                            ka = {};
                        (b.scale = 1),
                            (b.marginLeft = h.HORIZONTAL),
                            (b.marginTop = h.VERTICAL),
                            o(j.DOM_ELEMENT_VALUE_CHANGE, H),
                            o(j.DOM_SNAPSHOT, F),
                            o(j.MOUSE_MOVE, I),
                            o(j.MOUSE_CLICK, J),
                            o(j.MOUSE_OVER, K),
                            o(j.MOUSE_OUT, L),
                            o(j.SCROLL_POSITION_CHANGE, N),
                            o(j.WINDOW_RESIZE, O),
                            o(j.RADIO_BUTTON_CHANGE, P),
                            o(j.CHECKBOX_CHANGE, Q),
                            o(j.DOM_MUTATION, R),
                            o(j.VISIBILITY_CHANGE, S),
                            o(j.CSS_RULE_INSERT, T),
                            o(j.CSS_RULE_DELETE, U),
                            b.$watch('maxWidth', function(a) {
                                a &&
                                    q(
                                        a,
                                        b.maxHeight,
                                        b.sessionScreenWidth,
                                        b.sessionScreenHeight,
                                    );
                            }),
                            b.$watch('maxHeight', function(a) {
                                a &&
                                    q(
                                        b.maxWidth,
                                        a,
                                        b.sessionScreenWidth,
                                        b.sessionScreenHeight,
                                    );
                            }),
                            b.$watch('sessionScreenWidth', function(a) {
                                a &&
                                    (q(
                                        b.maxWidth,
                                        b.maxHeight,
                                        a,
                                        b.sessionScreenHeight,
                                    ),
                                    $ || ($ = a));
                            }),
                            b.$watch('sessionScreenHeight', function(a) {
                                a &&
                                    (q(
                                        b.maxWidth,
                                        b.maxHeight,
                                        b.sessionScreenWidth,
                                        a,
                                    ),
                                    _ || (_ = a));
                            }),
                            b.$watch('renderingProgress', function(a) {
                                b.viewerOverlay &&
                                    b.viewerOverlay.setRenderingProgress(a);
                            }),
                            b.$watch('showLoadingAnimation', function(a) {
                                b.viewerOverlay &&
                                    b.viewerOverlay.showLoadingAnimation(a);
                            }),
                            c.onExecuteEvent(b, D),
                            c.onClear(b, C),
                            c.onPlayerSpeedChange(b, function(a, c) {
                                b.viewerOverlay &&
                                    b.viewerOverlay.setPlayerSpeed(c);
                            }),
                            c.onVisualizeClicks(b, function(a, c) {
                                b.viewerOverlay &&
                                    b.viewerOverlay.setShouldVisualizeClicks(c);
                            }),
                            c.onPlayerStarted(b, function(a) {
                                b.viewerOverlay &&
                                    b.viewerOverlay.startClicksAnimation();
                            }),
                            c.onPlayerStopped(b, function(a) {
                                b.viewerOverlay &&
                                    b.viewerOverlay.stopClicksAnimation();
                            }),
                            c.onAttach(b, s),
                            c.onDetach(b, r),
                            c.onShowViewerOverlay(b, function() {
                                b.viewerOverlay &&
                                    b.viewerOverlay.showRenderingOverlay();
                            }),
                            c.onHideViewerOverlay(b, function() {
                                b.viewerOverlay &&
                                    b.viewerOverlay.hideRenderingOverlay();
                            }),
                            c.onShowBuffering(b, function() {
                                b.viewerOverlay &&
                                    b.viewerOverlay.showBufferingOverlay();
                            }),
                            c.onHideBuffering(b, function() {
                                b.viewerOverlay &&
                                    b.viewerOverlay.hideBufferingOverlay();
                            }),
                            c.onHideHiddenTabOverlay(b, function() {
                                b.viewerOverlay &&
                                    b.viewerOverlay.hideVisibilityOverlay();
                            }),
                            b.$watchGroup(
                                ['initialVisibilityState', 'viewerOverlay'],
                                function(a) {
                                    var c = a[0],
                                        e = a[1];
                                    ((d.isDefined(e) && d.isDefined(c)) ||
                                        null === c) &&
                                        (b.isCreated = !0);
                                },
                            ),
                            (b.handleConsoleResize = function(a) {
                                var c = l.parent().height(),
                                    d = c - a;
                                q(
                                    b.maxWidth,
                                    d,
                                    b.sessionScreenWidth,
                                    b.sessionScreenHeight,
                                );
                            });
                    },
                };
            },
        ]),
    angular.module('playerApp').directive('step', [
        'utils',
        'EVENT_TYPE',
        'LOG_LEVEL',
        function(a, b, c) {
            return {
                restrict: 'E',
                replace: !0,
                templateUrl: 'templates/step.html',
                scope: {
                    data: '=',
                    selectedLogId: '=',
                    isSelected: '=',
                    isExecuted: '=',
                    isExpanded: '=',
                    onStepExpand: '&',
                    selectStep: '&',
                },
                link: function(a, b, c) {
                    a.$watch('data', function(b) {
                        b &&
                            ((a.data = b),
                            (a.modalSize = b.modalSize),
                            (a.stepStyle = b.stepStyle));
                    }),
                        a.$watch('updateHorizontalScrollbar', function() {
                            a.updateHorizontalScrollbar &&
                                a.updateHorizontalScrollbar('scrollTo', 0);
                        }),
                        (a.showDetails = function() {
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
        'EVENT_TYPE',
        'LOG_LEVEL',
        'USER_DETAILS_ANIMATION_TIME',
        function(a, b, c, d, e, f, g, h) {
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
                    selectedLogId: '=',
                    isCreated: '=',
                    handleUserDetailsResize: '=',
                    hideMask: '=',
                },
                link: function(i, j, k) {
                    function l(a, b) {
                        return d.isDifferentActivity(a, b, m);
                    }
                    function m(a) {
                        return Math.floor(d.millisecondsToSeconds(a));
                    }
                    function n(a) {
                        if (((C = a), i.isEnabled)) {
                            for (
                                var b, c = 0;
                                c < i.filteredSteps.length &&
                                i.filteredSteps[c].activityIndex <= C;

                            )
                                c++;
                            (b = i.selectedStep !== c),
                                b && ((i.selectedStep = c), o());
                        }
                    }
                    function o() {
                        if (!y.is(':hover')) {
                            var a = j
                                .find('.steps-section .step')
                                .outerHeight();
                            if (a) {
                                var b = i.selectedStep * a,
                                    c =
                                        (y.height() -
                                            y.offset().top +
                                            z.height()) /
                                        3;
                                y.stop().animate({ scrollTop: b - c }, 300);
                            }
                        }
                    }
                    function p(a, b) {
                        d.forEach(a, function(a, c) {
                            i.activityTypeStatuses[a] = b;
                        });
                    }
                    function q(a, b) {
                        b = b || 0;
                        var c = z.outerHeight();
                        void 0 === a && (a = B.outerHeight());
                        var d = i.containerHeight - c - a;
                        A.stop().animate({ height: d }, b),
                            o(),
                            i.$broadcast('$md-resize');
                    }
                    function r(a) {
                        switch (a) {
                            case f.MOUSE_CLICK:
                            case f.WINDOW_RESIZE:
                            case f.VISIBILITY_CHANGE:
                                return 'sm';
                            default:
                                return 'lg';
                        }
                    }
                    function s(a) {
                        var b = r(a.type),
                            c = t(a.type, a.details, a.isLog);
                        c.summary = u(a.type, a.details);
                        var d = c.title + ' ' + (c.summary || '');
                        return (
                            (a.modalSize = b),
                            (a.stepStyle = c),
                            (a.searchLabel = d),
                            (a.count = 1),
                            a
                        );
                    }
                    function t(a, b, c) {
                        switch (a) {
                            case f.MOUSE_CLICK:
                                return v('Click', 'ion-mouse', 'black', c);
                            case f.DOM_SNAPSHOT:
                                return v('Visit', 'ion-navigate', 'black', c);
                            case f.WINDOW_RESIZE:
                                return v(
                                    'Resize',
                                    'ion-arrow-expand',
                                    'black',
                                    c,
                                );
                            case g.INFO:
                                return v(
                                    'Info',
                                    'ion-information-circled',
                                    '#2a6ce7',
                                    c,
                                );
                            case g.ERROR:
                                return v(
                                    'Error',
                                    'ion-android-alert',
                                    '#ff0944',
                                    c,
                                );
                            case g.WARN:
                                return v(
                                    'Warn',
                                    'ion-alert-circled',
                                    '#f0ad4e',
                                    c,
                                );
                            case g.DEBUG:
                                return v('Debug', 'ion-bug', '#2a6ce7', c);
                            case f.VISIBILITY_CHANGE:
                                return 'visible' === b.visibilityState
                                    ? v(
                                          'Tab displayed',
                                          'ion-ios-albums',
                                          'black',
                                          c,
                                      )
                                    : v(
                                          'Tab hidden',
                                          'ion-ios-albums-outline',
                                          'black',
                                          c,
                                      );
                        }
                    }
                    function u(a, b) {
                        switch (a) {
                            case f.MOUSE_CLICK:
                                return w(b.selector);
                            case f.WINDOW_RESIZE:
                                return b.width + ' x ' + b.height;
                            case f.DOM_SNAPSHOT:
                                return b.pageUrl;
                            case g.INFO:
                            case g.ERROR:
                            case g.WARN:
                            case g.DEBUG:
                                return b.message;
                            case f.VISIBILITY_CHANGE:
                                return '';
                        }
                    }
                    function v(a, b, c, d) {
                        return { title: a, showTitle: !d, icon: b, color: c };
                    }
                    function w(a) {
                        var b = '';
                        return (
                            d.isArray(a) &&
                                d.forEach(d.reverse(a), function(a, c) {
                                    if ((c > 0 && (b += ' '), a.id))
                                        b += '#' + a.id;
                                    else {
                                        if (!a.tagName)
                                            return void e.warn(
                                                'Element node does not have a tag name. Element index: ' +
                                                    c,
                                            );
                                        (b += a.tagName.toLowerCase()),
                                            a.classes &&
                                                a.classes.length > 0 &&
                                                (b +=
                                                    '.' +
                                                    d.join(a.classes, '.'));
                                    }
                                }),
                            b
                        );
                    }
                    function x() {
                        i.hideFilters(), p(E, !0);
                    }
                    var y = j
                            .find('.md-virtual-repeat-container')
                            .children()
                            .eq(0),
                        z = j.find('.filter-sections'),
                        A = j.find('.steps-section'),
                        B = j.parent().find('user-identity-details');
                    q(),
                        (i.isEnabled = !0),
                        (i.shouldShowMask = !0),
                        (i.isBuffering = !0),
                        (i.transformedSteps = []),
                        (i.filteredSteps = []),
                        (i.activityTypeStatuses = {}),
                        (i.LOG_LEVEL = g),
                        (i.EVENT_TYPE = f),
                        (i.expandedStepIndex = null),
                        (i.scrollbarConfig = {
                            autoHideScrollbar: !1,
                            theme: 'light',
                            advanced: { updateOnContentResize: !0 },
                            callbacks: {
                                onBeforeUpdate: function() {
                                    $('.step.is-open').is(
                                        ':nth-last-of-type(-n+4)',
                                    ) &&
                                        i.updateScrollbar('scrollTo', 'bottom');
                                },
                            },
                            mouseWheel: { scrollAmount: 100 },
                            setHeight: 200,
                            scrollInertia: 0,
                        });
                    var C = -1,
                        D = [
                            f.MOUSE_CLICK,
                            f.WINDOW_RESIZE,
                            f.DOM_SNAPSHOT,
                            f.VISIBILITY_CHANGE,
                            g.ERROR,
                        ],
                        E = c.getActivitiesFilterFromUrl();
                    (i.updateStepsTimeline = function(a) {
                        n(a);
                    }),
                        (i.setLastPlayedActivity = function(a) {
                            n(a);
                        }),
                        (i.addNewSteps = function(a) {
                            if (d.isArray(a)) {
                                var b;
                                a.forEach(function(a) {
                                    if (a)
                                        if (
                                            (i.transformedSteps.length > 0 &&
                                                (b =
                                                    i.transformedSteps[
                                                        i.transformedSteps
                                                            .length - 1
                                                    ]),
                                            a.isLog && !l(a, b))
                                        ) {
                                            var c =
                                                i.transformedSteps[
                                                    i.transformedSteps.length -
                                                        1
                                                ];
                                            (c.activityIndex = a.activityIndex),
                                                c.count++;
                                        } else {
                                            var d = s(a);
                                            i.transformedSteps.push(d);
                                        }
                                });
                            }
                        }),
                        (i.updateSelectedStep = function() {
                            a(function() {
                                n(C);
                            }, 0);
                        }),
                        (i.selectStep = function(a) {
                            if (
                                !(
                                    i.selectedStep === a ||
                                    a < 0 ||
                                    a >= i.filteredSteps.length
                                )
                            ) {
                                var b = i.filteredSteps[a];
                                angular.isFunction(i.onSelectedStep) &&
                                    i.onSelectedStep(b.activityIndex),
                                    (i.selectedStep = a),
                                    o();
                            }
                        }),
                        (i.selectNextStep = function() {
                            i.selectStep(i.selectedStep + 1);
                        }),
                        (i.enable = function() {
                            i.isEnabled = !0;
                        }),
                        (i.disable = function() {
                            i.isEnabled = !1;
                        }),
                        b.onHideStepsBuffering(i, function() {
                            i.isBuffering = !1;
                        }),
                        (i.hasInactiveFilters = function() {
                            var a = !1;
                            return (
                                d.forEach(i.activityTypeStatuses, function(
                                    b,
                                    c,
                                ) {
                                    b || (a = !0);
                                }),
                                a
                            );
                        }),
                        (i.toggleFilter = function(a) {
                            (i.activityTypeStatuses[a] = !i
                                .activityTypeStatuses[a]),
                                i.updateSelectedStep();
                        }),
                        (i.showFilters = function() {
                            p(D, !0), i.updateSelectedStep();
                        }),
                        (i.hideFilters = function() {
                            p(D, !1), i.updateSelectedStep();
                        }),
                        i.$watch('containerHeight', function(a) {
                            a && q();
                        }),
                        (i.handleUserDetailsResize = function(a) {
                            q(a, h);
                        }),
                        (i.onStepExpand = function(a) {
                            i.expandedStepIndex === a
                                ? (i.expandedStepIndex = null)
                                : (i.expandedStepIndex = a);
                        }),
                        (i.hideMask = function() {
                            i.shouldShowMask = !1;
                        }),
                        x(),
                        (i.isCreated = !0);
                },
            };
        },
    ]),
    angular.module('playerApp').directive('userIdentityDetails', [
        'player',
        'userIdentityService',
        'NOT_AVAILABLE',
        'USER_DETAILS_ANIMATION_TIME',
        function(a, b, c, d) {
            return {
                restrict: 'E',
                templateUrl: 'templates/userIdentityDetails.html',
                scope: { userIdentityData: '=', hideMask: '=' },
                link: function(e, f, g) {
                    function h(a) {
                        a = a || {};
                        var d = b.formatCustomFields(a.customFields);
                        d.unshift({
                            label: 'User ID',
                            value: a.identifier || c,
                        }),
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
                            setTimeout(function() {
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
                        setTimeout(function() {
                            n.animate({ height: a }, d),
                                n.removeClass('collapsed');
                        });
                    }
                    (e.isExpanded = !1), (e.shouldShowMask = !0);
                    var n = f.find('.expandable-user-details'),
                        o = n.parent();
                    e.$watch('userIdentityData', function(a) {
                        h(a);
                    }),
                        (e.scrollbarConfig = {
                            autoHideScrollbar: !1,
                            theme: 'light',
                            mouseWheel: { scrollAmount: 50 },
                            scrollInertia: 0,
                        }),
                        (e.toggleUserDetails = function(a) {
                            'Range' !== a.view.getSelection().type &&
                                (e.isExpanded ? j() : i(),
                                (e.isExpanded = !e.isExpanded));
                        }),
                        (e.hideMask = function() {
                            e.shouldShowMask = !1;
                        });
                },
            };
        },
    ]),
    angular.module('playerApp').directive('viewerOverlay', [
        'ClicksManager',
        function(a) {
            return {
                restrict: 'E',
                templateUrl: 'templates/viewerOverlay.html',
                replace: !0,
                scope: { width: '=', height: '=', api: '=' },
                link: function(b, c, d) {
                    var e = new a(),
                        f = angular.element('.click-elements-overlay'),
                        g = angular.element('.cursor');
                    b.api = {
                        setCursorPosition: function(a) {
                            a && g.css({ left: a.left, top: a.top });
                        },
                        registerClick: function(a, b) {
                            var c = e.registerClick(a, b);
                            c && f.append(c);
                        },
                        setScrollPosition: function(a, b) {
                            f.css({ top: -a, left: -b });
                        },
                        setRenderingProgress: function(a) {
                            if (a) {
                                var c = (a.current / a.total) * 100;
                                b.renderingProgressPercentage = Math.round(c);
                            }
                        },
                        showRenderingOverlay: function() {
                            b.shouldShowRenderingOverlay = !0;
                        },
                        hideRenderingOverlay: function() {
                            b.shouldShowRenderingOverlay = !1;
                        },
                        setPlayerSpeed: function(a) {
                            e.setPlayerSpeed(a);
                        },
                        setShouldVisualizeClicks: function(a) {
                            e.setShouldVisualizeClicks(a);
                        },
                        startClicksAnimation: function() {
                            e.startClicksAnimation();
                        },
                        stopClicksAnimation: function() {
                            e.stopClicksAnimation();
                        },
                        showVisibilityOverlay: function(a) {
                            (b.visibilityState = a),
                                (b.shouldShowVisibilityOverlay = !0);
                        },
                        hideVisibilityOverlay: function() {
                            b.shouldShowVisibilityOverlay = !1;
                        },
                        showBufferingOverlay: function() {
                            b.shouldShowBufferingOverlay = !0;
                        },
                        hideBufferingOverlay: function() {
                            b.shouldShowBufferingOverlay = !1;
                        },
                    };
                },
            };
        },
    ]),
    angular.module('playerApp').filter('activityTypesFilter', [
        'utils',
        function(a) {
            return function(b, c) {
                if (!c) return b;
                var d = [];
                return (
                    a.forEach(b, function(a) {
                        c[a.type] && d.push(a);
                    }),
                    d
                );
            };
        },
    ]),
    angular.module('playerApp').factory('AsyncWhile', [
        '$timeout',
        function(a) {
            function b(c, d) {
                var e = this;
                if (!(e.config.maxIterations && c >= e.config.maxIterations)) {
                    if (!e.condition())
                        return void (angular.isFunction(d) && d());
                    e.body(),
                        (e.queuedLoop = a(function() {
                            b.call(e, c + 1, d);
                        }, e.config.waitTime));
                }
            }
            var c = function(a, b, c) {
                (this.condition = a), (this.body = b), (this.config = c);
            };
            return (
                (c.prototype.start = function(a) {
                    b.call(this, 0, a);
                }),
                (c.prototype.cancel = function() {
                    return a.cancel(this.queuedLoop);
                }),
                c
            );
        },
    ]),
    angular.module('playerApp').factory('ClicksManager', [
        'lodash',
        'UserClick',
        function(a, b) {
            function c(b, c) {
                a.remove(b.clicksQueue, function(a) {
                    return a == c;
                });
            }
            function d(a) {
                (a.visualizationIsEnabled = !1),
                    angular.forEach(a.clicksQueue, function(a) {
                        a.remove();
                    }),
                    (a.clicksQueue = []);
            }
            var e = function() {
                (this.clicksQueue = []),
                    (this.playerSpeed = 1),
                    (this.visualizationIsEnabled = !1);
            };
            return (
                (e.prototype.setPlayerSpeed = function(a) {
                    this.playerSpeed = a;
                }),
                (e.prototype.startClicksAnimation = function() {
                    var a = this;
                    a.visualizationIsEnabled &&
                        angular.forEach(a.clicksQueue, function(b) {
                            b.startAnimation(a.playerSpeed, function() {
                                c(a, b);
                            });
                        });
                }),
                (e.prototype.stopClicksAnimation = function() {
                    var a = this;
                    angular.forEach(a.clicksQueue, function(a) {
                        a.stopAnimation();
                    });
                }),
                (e.prototype.registerClick = function(a, d) {
                    var e = this;
                    if (e.visualizationIsEnabled) {
                        var f = new b(a, d);
                        return (
                            f.startAnimation(e.playerSpeed, function(a) {
                                c(e, a);
                            }),
                            e.clicksQueue.push(f),
                            f.element
                        );
                    }
                }),
                (e.prototype.setShouldVisualizeClicks = function(a) {
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
            'URLTransformer',
            'PROPERTY_OBJECT_KEY',
            'NAMESPACES',
            'ALLOWED_SRC_PROTOCOLS',
            'CROSS_ORIGIN_FRAME_BACKGROUND',
            'STYLE_ELEMENT_NAMES',
            function(a, b, c, d, e, f, g, h, i) {
                function j(a) {
                    a = a || {};
                    var b = a.frameElementId;
                    if (
                        ((this.documentsCollection[b] = a),
                        (a.childDocuments = {}),
                        angular.isDefined(b))
                    ) {
                        var c = k.call(this, b);
                        if (!c) return;
                        c.childDocuments[b] = !0;
                    }
                }
                function k(a) {
                    var b = this,
                        c = b.getNode(a),
                        d = E(c);
                    if (d) {
                        var e = Q(d).nodeId;
                        return b.documentsCollection[e];
                    }
                }
                function l(a, b) {
                    for (var c, d = this, e = [a]; e.length > 0; )
                        (c = d.documentsCollection[e.shift()]),
                            c &&
                                (b.call(d, c),
                                angular.forEach(c.childDocuments, function(
                                    a,
                                    b,
                                ) {
                                    e.push(b);
                                }));
                }
                function m(a) {
                    l.call(this, a, o);
                }
                function n(a) {
                    l.call(this, a, function(a) {
                        angular.element(a.documentElement).remove();
                    });
                }
                function o(a) {
                    var b = this;
                    if (b.isAttached) {
                        var c = z.call(b, a.frameElementId);
                        c &&
                            (p(c, a.docType),
                            q(c, a.documentElement),
                            r.call(b, c.documentElement));
                    }
                }
                function p(a, b) {
                    a.open(), a.write(b || ''), a.close(), u(a);
                }
                function q(a, b) {
                    b && (a.adoptNode(b), a.appendChild(b));
                }
                function r(a) {
                    this.isAttached &&
                        (s.call(this, a, '[style]', 'style'),
                        s.call(this, a, 'link[rel="stylesheet"]', 'href'),
                        s.call(this, a, '[src]', 'src'));
                }
                function s(b, c, d) {
                    var e,
                        f = this;
                    b &&
                        angular
                            .element(c, b)
                            .addBack(c)
                            .each(function(b, c) {
                                (e = c.getAttribute(d)),
                                    e &&
                                        (f.setAttribute(c, d, void 0),
                                        a(
                                            f.setAttribute.bind(f),
                                            0,
                                            !0,
                                            c,
                                            d,
                                            e,
                                        ));
                            });
                }
                function t(a, b) {
                    var c,
                        d = this;
                    if (a.snapshot) {
                        c = d.createElement(a.snapshot);
                        var e = angular.element('head', c);
                        e.length <= 0 &&
                            (angular.element(c).prepend('<head></head>'),
                            (e = angular.element('head', c))),
                            v(c, b),
                            y.call(d, c, a.frameElementId),
                            A.call(d, c, a.frameElementId);
                    }
                    return c;
                }
                function u(a) {
                    var b = a.documentElement;
                    b && a.removeChild(b);
                }
                function v(a, b) {
                    var c = angular.element('base', a);
                    c.length <= 0 &&
                        ((c = angular.element('<base>')),
                        angular.element('head', a).prepend(c)),
                        c.attr('href', b);
                }
                function w(a) {
                    var b;
                    return (
                        C(a.snapshot, function(a) {
                            if (a && 'BASE' === a.tagName && a.attributes)
                                return (b = x(a, 'href')), !1;
                        }),
                        b ? c.evaluateAbsoluteUrl(a.origin, b) : a.origin
                    );
                }
                function x(a, b) {
                    var c;
                    return (
                        angular.forEach(a.attributes, function(a) {
                            a.name === b && (c = a.value);
                        }),
                        c
                    );
                }
                function y(a, b) {
                    var c = this,
                        d = c.documentsCollection[b].urlTransformer;
                    angular
                        .element('link[rel="stylesheet"]', a)
                        .each(function(a, b) {
                            var c = angular.element(b),
                                e = c.attr('href');
                            (e = d.transform(e)), c.attr('href', e);
                        });
                }
                function z(a) {
                    if (!angular.isDefined(a))
                        return this.documentContainer.contentWindow.document;
                    var b = this.documentElementIndex[a];
                    return b ? b.contentDocument : void 0;
                }
                function A(a, b) {
                    var c,
                        d,
                        e = this;
                    C(a, function(a) {
                        (d = Q(a)),
                            (c = d.nodeId),
                            (d.frameElementId = b),
                            (e.documentElementIndex[c] = a),
                            d.styleRules && (e.styleRuleNodes[c] = a);
                    });
                }
                function B(a) {
                    var b,
                        c = this;
                    C(a, function(a) {
                        (b = Q(a).nodeId), delete c.documentElementIndex[b];
                    });
                }
                function C(a, b) {
                    for (var c, d, e = [a]; e.length > 0; )
                        if ((c = e.shift())) {
                            if (((d = b(c)), d === !1)) return;
                            angular.forEach(c.childNodes, function(a) {
                                e.push(a);
                            });
                        }
                }
                function D(a) {
                    var b = angular.element(a).parent();
                    if (b.length > 0) return b[0];
                }
                function E(a) {
                    try {
                        return a.ownerDocument.defaultView.frameElement;
                    } catch (b) {}
                }
                function F(a, b, c) {
                    b.childNodes &&
                        b.childNodes.length > 0 &&
                        angular.forEach(b.childNodes, function(b) {
                            a.push({ parent: c, node: b });
                        });
                }
                function G(a) {
                    var b = {};
                    switch (a.nodeType) {
                        case Node.COMMENT_NODE:
                            b = H.call(this, a);
                            break;
                        case Node.TEXT_NODE:
                            b = I.call(this, a);
                            break;
                        case Node.ELEMENT_NODE:
                            b = J.call(this, a);
                    }
                    return (Q(b).nodeId = a.id), b;
                }
                function H(a) {
                    var b = z.call(this);
                    return b.createComment(a.textContent);
                }
                function I(a) {
                    var b = z.call(this);
                    return b.createTextNode(a.textContent);
                }
                function J(a) {
                    var b = (N(a.isSvg), K.call(this, a));
                    return O.call(this, b, a), b;
                }
                function K(a) {
                    try {
                        return L.call(this, a);
                    } catch (b) {
                        return M.call(this, a);
                    }
                }
                function L(a) {
                    var b = this,
                        c = z.call(b),
                        d = N(a.isSvg),
                        e = a.tagName.toLowerCase(),
                        f = c.createElementNS(d, e);
                    if (a.styleRules) {
                        var g = Q(f);
                        g.styleRules = a.styleRules;
                    }
                    return (
                        a.attributes &&
                            angular.forEach(a.attributes, function(a) {
                                b.setAttribute(f, a.name, a.value);
                            }),
                        f
                    );
                }
                function M(a) {
                    var b = z.call(this),
                        d = a.tagName.toLowerCase(),
                        e = (a.attributes, c.buildHtmlString(d, a.attributes)),
                        f = b.createElement('div');
                    return (f.innerHTML = e), f.firstChild;
                }
                function N(a) {
                    return a ? f.SVG : f.HTML;
                }
                function O(a, d) {
                    if (d.top || d.left) {
                        var e = Q(a);
                        (e.top = d.top), (e.left = d.left);
                    }
                    var f = d.isCrossOriginFrame,
                        i = angular.element(a);
                    i.is('script')
                        ? i.removeAttr('src')
                        : i.is('iframe')
                        ? (i.removeAttr('sandbox'),
                          i.removeAttr('src'),
                          f && i.css({ 'background-image': 'url(' + h + ')' }))
                        : i.is('a')
                        ? i.attr('href', 'javascript:void(0);')
                        : (i.is('meta[http-equiv="X-Frame-Options"]') ||
                              i.is(
                                  'meta[http-equiv="Content-Security-Policy"]',
                              )) &&
                          i.removeAttr('content');
                    var j = [];
                    if (i.is('[src]')) {
                        var k = c.getUrlProtocol(i.attr('src'));
                        k && g.indexOf(k) < 0 && j.push('src');
                    }
                    angular.forEach(a.attributes, function(a) {
                        b.startsWith(a.name, 'on') && j.push(a.name);
                    }),
                        angular.forEach(j, function(a) {
                            i.removeAttr(a);
                        });
                }
                function P(a, b, c) {
                    var d = angular.element(a);
                    return (
                        (d.is('script') && 'src' === b) ||
                        (d.is('iframe') && 'src' === b) ||
                        (d.is('meta[http-equiv="X-Frame-Options"]') &&
                            'content' === b) ||
                        'integrity' === b ||
                        (d.is('meta[content]') &&
                            'http-equiv' === b &&
                            ('X-Frame-Options' === c ||
                                'Content-Security-Policy' === c))
                    );
                }
                function Q(a) {
                    var b = a[e];
                    return b || ((b = {}), (a[e] = b)), b;
                }
                function R(a) {
                    return angular.isNumber(Q(a).nodeId);
                }
                var S = function(a) {
                    (this.isAttached = !0),
                        (this.documentContainer = a),
                        (this.documentElementIndex = []),
                        (this.documentsCollection = {}),
                        (this.afterAttachCallbacks = []),
                        (this.styleRuleNodes = {});
                };
                return (
                    (S.prototype.detach = function() {
                        var b = this;
                        angular.forEach(b.afterAttachCallbacks, function(b) {
                            a.cancel(b);
                        }),
                            (b.afterAttachCallbacks = []),
                            b.isAttached &&
                                ((b.isAttached = !1), n.call(b, void 0));
                    }),
                    (S.prototype.attach = function(b) {
                        var c = this;
                        (c.isAttached = !0),
                            m.call(c, void 0),
                            c.afterAttachCallbacks.push(a(b));
                    }),
                    (S.prototype.write = function(a, b) {
                        var c = this;
                        angular.isUndefined(a.frameElementId) &&
                            p(z.call(c), a.docType),
                            angular.isUndefined(a.frameElementId) &&
                                ((c.documentElementIndex = []),
                                (c.documentsCollection = {}));
                        var e = w(a),
                            f = {
                                urlTransformer: new d(e, b),
                                docType: a.docType,
                                frameElementId: a.frameElementId,
                            };
                        j.call(c, f),
                            (f.documentElement = t.call(c, a, e)),
                            o.call(c, f);
                    }),
                    (S.prototype.getDocumentElement = function(a) {
                        var b = z.call(this, a);
                        if (b) return b.documentElement;
                    }),
                    (S.prototype.getNode = function(a) {
                        return this.documentElementIndex[a];
                    }),
                    (S.prototype.prepend = function(a, b) {
                        if (
                            (!angular.element(a).is('script') ||
                                b.nodeType !== Node.TEXT_NODE) &&
                            a &&
                            b &&
                            a.nodeType === Node.ELEMENT_NODE
                        ) {
                            a.insertBefore(b, a.firstChild);
                            var c = Q(a).frameElementId;
                            y.call(this, b, c), A.call(this, b, c);
                        }
                    }),
                    (S.prototype.replaceDocumentElement = function(a, b) {
                        var c = this,
                            d = c.documentsCollection[b];
                        angular.element(a).is('html') &&
                            d &&
                            ((d.documentElement = a),
                            y.call(this, a, b),
                            A.call(c, a, b),
                            o.call(c, d));
                    }),
                    (S.prototype.replaceDocType = function(a, b) {
                        var c = this,
                            d = c.documentsCollection[b];
                        a && d && (n.call(c, b), (d.docType = a), m.call(c, b));
                    }),
                    (S.prototype.insertAfter = function(a, b) {
                        var c = D(a);
                        if (
                            (!angular.element(c).is('script') ||
                                b.nodeType !== Node.TEXT_NODE) &&
                            c &&
                            b &&
                            c.nodeType === Node.ELEMENT_NODE
                        ) {
                            c.insertBefore(b, a.nextSibling);
                            var d = Q(c).frameElementId;
                            y.call(this, b, d), A.call(this, b, d);
                        }
                    }),
                    (S.prototype.removeNode = function(a) {
                        var b = D(a);
                        b && (b.removeChild(a), B.call(this, a));
                    }),
                    (S.prototype.traverseNode = function(a, b) {
                        C(a, b);
                    }),
                    (S.prototype.traverseDocuments = function(a, b) {
                        l.call(this, a, b);
                    }),
                    (S.prototype.getNodeOffset = function(a) {
                        for (
                            var b = { top: 0, left: 0 };
                            a && a !== this.documentContainer;

                        ) {
                            var c = a.getBoundingClientRect();
                            (b.top += c.top), (b.left += c.left), (a = E(a));
                        }
                        return b;
                    }),
                    (S.prototype.createElement = function(a) {
                        var b,
                            c,
                            d,
                            e = G.call(this, a),
                            f = [];
                        if (a.childNodes && a.childNodes.length > 0)
                            for (F(f, a, e); f.length > 0; )
                                (b = f.shift()),
                                    (d = b.parent.tagName.toLowerCase()),
                                    'script' !== d &&
                                        'noscript' !== d &&
                                        ((c = G.call(this, b.node)),
                                        F(f, b.node, c),
                                        b.parent.appendChild(c));
                        return e;
                    }),
                    (S.prototype.setAttribute = function(a, b, c) {
                        if (!P(a, b, c)) {
                            if (
                                angular
                                    .element(a)
                                    .is('link[rel="stylesheet"]') &&
                                R(a) &&
                                'href' === b
                            ) {
                                var d = Q(a).frameElementId,
                                    e = this.documentsCollection[d]
                                        .urlTransformer;
                                c = e.transform(c);
                            }
                            try {
                                angular.isUndefined(c) || null === c
                                    ? a.removeAttribute(b)
                                    : a.setAttribute(b, c);
                            } catch (f) {}
                        }
                    }),
                    (S.prototype.getNodePropertyObject = function(a) {
                        return Q(a);
                    }),
                    (S.prototype.getFrameElementIds = function() {
                        return b.map(this.documentsCollection, function(a) {
                            return a.frameElementId;
                        });
                    }),
                    S
                );
            },
        ]),
    angular.module('playerApp').factory('player', function() {
        function a(a, b) {
            a.$broadcast(P, b);
        }
        function b(a, b) {
            a.$on(P, b);
        }
        function c(a, b) {
            a.$broadcast(O, b);
        }
        function d(a, b) {
            a.$on(O, b);
        }
        function e(a, b) {
            a.$broadcast(Q, b);
        }
        function f(a, b) {
            a.$on(Q, b);
        }
        function g(a, b) {
            a.$broadcast(R, b);
        }
        function h(a, b) {
            a.$on(R, b);
        }
        function i(a) {
            a.$broadcast(T);
        }
        function j(a, b) {
            a.$on(T, b);
        }
        function k(a) {
            a.$broadcast(S);
        }
        function l(a, b) {
            a.$on(S, b);
        }
        function m(a, b) {
            a.$broadcast(U, b);
        }
        function n(a, b) {
            a.$on(U, b);
        }
        function o(a) {
            a.$broadcast(V);
        }
        function p(a, b) {
            a.$on(V, b);
        }
        function q(a) {
            a.$broadcast(W);
        }
        function r(a, b) {
            a.$on(W, b);
        }
        function s(a) {
            a.$broadcast(X);
        }
        function t(a, b) {
            a.$on(X, b);
        }
        function u(a) {
            a.$broadcast($);
        }
        function v(a, b) {
            a.$on($, b);
        }
        function w(a) {
            a.$broadcast(_);
        }
        function x(a, b) {
            a.$on(_, b);
        }
        function y(a) {
            a.$emit(Y);
        }
        function z(a, b) {
            a.$on(Y, b);
        }
        function A(a) {
            a.$emit(Z);
        }
        function B(a, b) {
            a.$on(Z, b);
        }
        function C(a) {
            a.$emit(aa);
        }
        function D(a, b) {
            a.$on(aa, b);
        }
        function E(a) {
            a.$broadcast(ba);
        }
        function F(a, b) {
            a.$on(ba, b);
        }
        function G(a) {
            a.$broadcast(ca);
        }
        function H(a, b) {
            a.$on(ca, b);
        }
        function I(a, b) {
            a.$emit(da, b);
        }
        function J(a, b) {
            a.$on(da, b);
        }
        function K(a, b) {
            a.$emit(ea, b);
        }
        function L(a, b) {
            a.$on(ea, b);
        }
        function M(a, b) {
            a.$emit(fa, b);
        }
        function N(a, b) {
            a.$on(fa, b);
        }
        var O = 'execute',
            P = 'clear',
            Q = 'playerSpeedChange',
            R = 'visualizeClicks',
            S = 'playerStopped',
            T = 'playerStarted',
            U = 'attach',
            V = 'detach',
            W = 'showOverlay',
            X = 'hideOverlay',
            Y = 'startLiveStreaming',
            Z = 'stopLiveSteaming',
            $ = 'showBuffering',
            _ = 'hideBuffering',
            aa = 'playerIsInitialized',
            ba = 'hideStepsBuffering',
            ca = 'hideHiddenTabOverlay',
            da = 'userDetailsResize',
            ea = 'consoleResize',
            fa = 'openConsole';
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
        };
    }),
    angular
        .module('playerApp')
        .constant('PAGE_LOAD', 'page_load')
        .factory('playerSettings', [
            'settings',
            'utils',
            'LOG_LEVEL',
            'EVENT_TYPE',
            'PAGE_LOAD',
            function(a, b, c, d, e) {
                function f(a) {
                    (a.settings = {}), g(a), h(a);
                }
                function g(a) {
                    a.settings.general = {
                        playFrom: b.getQueryParameter('play_from'),
                        pauseAt: b.getQueryParameter('pause_at'),
                        playLive: b.getQueryParameter('play_live'),
                        uiMode: b.getQueryParameter('ui_mode'),
                        isDemo: b.getQueryParameter('is_demo') === !0,
                    };
                }
                function h(a) {
                    var b = i(),
                        c = j();
                    (a.settings.playback = {}), l(a, b, c);
                }
                function i() {
                    return {
                        shouldSkipProlongedInactivity: b.getQueryParameter(
                            'skip_inactivity',
                        ),
                        shouldVisualizeClicks: b.getQueryParameter(
                            'visualize_mouse_clicks',
                        ),
                        shouldPauseOnMarker: b.getQueryParameter(
                            'pause_on_marker',
                        ),
                        speed: b.getQueryParameter('speed'),
                    };
                }
                function j() {
                    return {
                        shouldSkipProlongedInactivity: k(
                            'shouldSkipProlongedInactivity',
                            !0,
                        ),
                        shouldVisualizeClicks: k('shouldVisualizeClicks', !0),
                        shouldPauseOnMarker: k('shouldPauseOnMarker', !0),
                        speed: k('speed', 1),
                    };
                }
                function k(b, c) {
                    return a.get(b, c);
                }
                function l(a, c, d) {
                    b.forEach(d, function(d, e) {
                        var f = c[e];
                        b.isDefined(f)
                            ? (a.settings.playback[e] = f)
                            : ((a.settings.playback[e] = d),
                              m(a, e, a.settings.playback[e]));
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
                    var c = [];
                    return (
                        b.forEach(a, function(a) {
                            a === e ? c.push(d.DOM_SNAPSHOT) : c.push(a);
                        }),
                        c
                    );
                }
                function p(a) {
                    var c = [];
                    return (
                        b.forEach(a.split(','), function(a) {
                            c.push(a.trim());
                        }),
                        c
                    );
                }
                var q = [
                    c.ERROR,
                    c.WARN,
                    c.INFO,
                    c.DEBUG,
                    d.MOUSE_CLICK,
                    d.WINDOW_RESIZE,
                    d.DOM_SNAPSHOT,
                    d.VISIBILITY_CHANGE,
                ];
                return { init: f, getActivitiesFilterFromUrl: n };
            },
        ]),
    angular
        .module('playerApp')
        .constant('ACTIVITIES_POLL_WAIT_TIME', 0)
        .constant('NO_ACTIVITIES_POLL_WAIT_TIME', 500)
        .constant('SESSION_STATUS_POLL_WAIT_TIME', 3e4)
        .factory('SessionDataClient', [
            '$timeout',
            '$q',
            'session',
            'utils',
            'lodash',
            'ACTIVITIES_POLL_WAIT_TIME',
            'SESSION_STATUS_POLL_WAIT_TIME',
            'NO_ACTIVITIES_POLL_WAIT_TIME',
            function(a, b, c, d, e, f, g, h) {
                function i(a, f) {
                    var g = this,
                        h = b.defer();
                    return (
                        (function i() {
                            if (
                                (d.isFunction(a) || (a = angular.noop),
                                g.timeLimit &&
                                    g.lastLoadedActivityTime >= g.timeLimit)
                            )
                                return void h.resolve({ activities: [] });
                            var b = !!f || !e.isNumber(g.timeLimit),
                                l = {
                                    eventsTimestamp: g.lastEventTimestamp,
                                    eventsIndex: g.lastEventIndex,
                                    logsTimestamp: g.lastLogTimestamp,
                                    noCache: b,
                                };
                            c.getActivities(g.sessionId, l).then(
                                function(b) {
                                    g.isPolling = !0;
                                    var c = k(b, g.timeLimit);
                                    if (0 === c.activities.length)
                                        return void h.resolve({
                                            activities: c.activities,
                                        });
                                    (g.lastEventTimestamp =
                                        c.lastEventTimestamp ||
                                        g.lastEventTimestamp),
                                        (g.lastEventIndex =
                                            c.lastEventIndex ||
                                            g.lastEventIndex),
                                        (g.lastLogTimestamp =
                                            c.lastLogTimestamp ||
                                            g.lastLogTimestamp),
                                        (g.lastLoadedActivityTime = j(
                                            c.activities,
                                        ));
                                    var d = {
                                        activities: c.activities,
                                        isLive: g.isLive,
                                    };
                                    a(d), i();
                                },
                                function(a) {
                                    h.reject(a);
                                },
                            );
                        })(),
                        h.promise
                    );
                }
                function j(a) {
                    var b = e.last(a);
                    if (b) return b.time;
                }
                function k(a, b) {
                    var c = a.activities,
                        d = j(c);
                    return d && e.isNumber(b) && d > b ? l(c, b) : a;
                }
                function l(a, b) {
                    var c,
                        d,
                        f,
                        g = [];
                    return (
                        e.forEach(a, function(a) {
                            return (
                                !(a.time > b) &&
                                (g.push(a),
                                void (a.id
                                    ? (f = a.timestamp)
                                    : ((c = a.timestamp), (d = a.index))))
                            );
                        }),
                        {
                            activities: g,
                            lastEventTimestamp: c,
                            lastEventIndex: d,
                            lastLogTimestamp: f,
                        }
                    );
                }
                var m = function(a, b) {
                    (this.sessionId = a),
                        (this.logId = b),
                        (this.lastEventTimestamp = 0),
                        (this.lastEventIndex = 0),
                        (this.lastLogTimestamp = 0),
                        (this.timeLimit = null),
                        (this.lastLoadedActivityTime = 0),
                        this.loadingActivitiesPromise,
                        (this.activitiesPollerIsCanceled = !0);
                };
                return (
                    (m.prototype.loadSession = function() {
                        var a = this,
                            d = b.defer(),
                            e = function(b) {
                                (a.isLive = b.session.isLive), d.resolve(b);
                            },
                            f = function(a) {
                                d.reject(a);
                            };
                        return (
                            a.logId
                                ? c
                                      .getSessionLog(a.sessionId, a.logId)
                                      .then(e, f)
                                : c.getSession(a.sessionId).then(e, f),
                            d.promise
                        );
                    }),
                    (m.prototype.startLoadingActivities = function(b, c) {
                        var e = this;
                        e.stopLoadingActivities(),
                            (e.activitiesPollerIsCanceled = !1),
                            d.isFunction(b) || (b = angular.noop),
                            (function g(d) {
                                !e.activitiesPollerIsCanceled &&
                                    e.isLive &&
                                    (e.activitiesPoller = a(function() {
                                        e.loadActivitiesUntil(b, null, c).then(
                                            function(a) {
                                                g(h);
                                            },
                                        );
                                    }, d));
                            })(f);
                    }),
                    (m.prototype.stopLoadingActivities = function() {
                        this.activitiesPollerIsCanceled = !0;
                    }),
                    (m.prototype.startLoadingSessionStatus = function(b) {
                        var e = this;
                        e.stopLoadingSessionStatus(),
                            (e.sessionStatusPollerIsCanceled = !1),
                            d.isFunction(b) || (b = angular.noop),
                            (function f() {
                                e.sessionStatusPollerIsCanceled ||
                                    a(function() {
                                        c.getSessionStatus(e.sessionId).then(
                                            function(a) {
                                                b(a), f();
                                            },
                                        );
                                    }, g);
                            })();
                    }),
                    (m.prototype.stopLoadingSessionStatus = function() {
                        this.sessionStatusPollerIsCanceled = !0;
                    }),
                    (m.prototype.getSessionStatus = function() {
                        return c.getSessionStatus(this.sessionId);
                    }),
                    (m.prototype.loadActivitiesUntil = function(a, b, c) {
                        var d = this;
                        return (
                            (!b || d.lastLoadedActivityTime < b) &&
                                (d.timeLimit = b),
                            d.loadingActivitiesPromise ||
                                (d.loadingActivitiesPromise = i
                                    .call(d, a, c)
                                    .then(function(b) {
                                        (d.loadingActivitiesPromise = null),
                                            a(b);
                                    })),
                            d.loadingActivitiesPromise
                        );
                    }),
                    m
                );
            },
        ]),
    angular.module('playerApp').factory('URLTransformer', [
        'lodash',
        'utils',
        'SERVER_URL',
        function(a, b, c) {
            function d(a) {
                return a && c && e(a) && !f(a);
            }
            function e(b) {
                return !a.startsWith(b, 'data:') && !a.startsWith(b, 'file:');
            }
            function f(b) {
                return a.startsWith(b, g);
            }
            var g = c + 'resources',
                h = function(a, b) {
                    var c = this;
                    (c.encodedBaseUrl = encodeURIComponent(a)),
                        (c.sessionId = b);
                };
            return (
                (h.prototype.transform = function(a) {
                    if (!d(a)) return a;
                    var c = this,
                        e = g,
                        f = {
                            url: encodeURIComponent(a),
                            base: c.encodedBaseUrl,
                            session_id: c.sessionId,
                        };
                    return (e += b.getQueryString(f));
                }),
                h
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
            function(a, b, c) {
                function d(b, c) {
                    var d = document.createElement('div');
                    return (
                        $(d).css({
                            top: b - a / 2 + 'px',
                            left: c - a / 2 + 'px',
                        }),
                        $(d).css(g),
                        d
                    );
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
                        'z-index': 2147483645,
                        '-moz-border-radius': '10px',
                        '-webkit-border-radius': '10px',
                    },
                    h = function(a, b) {
                        (this.element = d(a, b)),
                            (this.lastActive = new Date().getTime()),
                            (this.totalPlayingTime = 0);
                    };
                return (
                    (h.prototype.startAnimation = function(a, b) {
                        var c = this,
                            d = e(c);
                        d > 0 && $(c.element).animate({ opacity: 1 }, d / a);
                        var g = f(c);
                        $(c.element).fadeOut(g / a, function(a) {
                            b(c), $(this).remove();
                        }),
                            (c.lastActive = new Date().getTime());
                    }),
                    (h.prototype.stopAnimation = function() {
                        var a = this;
                        $(a.element)
                            .stop()
                            .stop();
                        var b = new Date().getTime();
                        a.totalPlayingTime = b - a.lastActive;
                    }),
                    (h.prototype.remove = function() {
                        var a = this;
                        $(a.element).remove();
                    }),
                    h
                );
            },
        ]);
