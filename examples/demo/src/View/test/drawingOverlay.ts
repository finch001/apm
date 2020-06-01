import lodash from 'lodash';
import { ANALYTICS_EVENT_TYPES, analytics, sessionstackManager, utils, auth } from './common';
import { SUPPORT_TOOLS } from './constant';
import { player } from './Player';
import { DocumentNode } from './DocumentNode';
import { DrawingService } from './DrawingService';

const DRAWING_OPTIONS = {
    STROKE_WIDTH: 4,
    FILL: 'none',
    STROKE: '#ff9f33',
    TIMEOUT: 3e3,
};

interface IScope {
    activeTool: any;
    isCreated: boolean;
    // [key: string]: any;
}

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
        function($timeout, $stateParams) {
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
                link: function($scope: IScope, $element, j) {
                    function k() {
                        $element.off('mousedown');
                        $element.off('mousemove');
                        $element.off('mouseup');
                        $element.off('mouseleave');
                        $element.off('click');
                        P && (angular.element(P.node).off('keyup'), angular.element(P.node).off('focusout'));
                    }
                    function l() {
                        $element.on('mousedown', B);
                        $element.on('mousemove', C);
                        $element.on('mouseup', D);
                        $element.on('mouseleave', E);
                    }
                    function m() {
                        $element.on('mousemove', w);
                        $element.on('click', r);
                        $element.on('wheel', z);
                    }
                    function n() {
                        $element.on('mousemove', o);
                        $element.on('click', q);
                    }
                    function o(a) {
                        x(a, function(a) {
                            L.visualizeMouseMove(a.x, a.y);
                        });
                    }
                    function p() {
                        var a: any = document.createElement('div');
                        a.style.position = 'absolute';
                        a.style.zIndex = 2147483647;
                        a.style.top = 0;
                        a.style.left = 0;
                        a.style.width = '54px';
                        a.style.height = '54px';
                        var b = document.createElement('div');

                        b.style.content = '';
                        b.style.position = 'relative';
                        b.style.display = 'block';
                        b.style.width = self.CLICK_CIRCLE_SIZE + 'px';
                        b.style.height = self.CLICK_CIRCLE_SIZE + 'px';
                        b.style.display = 'block';
                        b.style.boxSizing = 'border-box';
                        b.style.borderRadius = '27px';
                        b.style.width = '54px';
                        b.style.height = '54px';
                        b.style.backgroundColor = '#ffa001';
                        b.style.animation = '_ss-pulse-ring 1s infinite';
                        a.appendChild(b);

                        return a;
                    }
                    function q(a) {
                        t(a, function(a, b) {
                            L.visualizeClick(a, b);
                        });
                    }
                    function r(a) {
                        t(a, function(a, b, c, d) {
                            L.click(a, b, c, d);
                        });
                    }
                    function s(a) {
                        var b = utils.matchesSelector(a.node, 'input, textarea');
                        if (b) {
                            P && (angular.element(P.node).off('keyup'), angular.element(P.node).off('focusout')),
                                (P = a),
                                $scope.focusElement(a.nodeId),
                                L.sendFocus(P.nodeId, P.frameElementId, P.hostElementId);
                            var d = angular.element(P.node);
                            d.on('keyup', u), d.on('focusout', v);
                        }
                    }
                    function t(a, b) {
                        var d = F(a),
                            e = $scope.getElement(d.relativeX, d.relativeY);
                        s(e), b(d.x, d.y, e.nodeId, e.frameElementId);
                        var f = p();
                        (f.style.top = d.y - 27 + 'px'),
                            (f.style.left = d.x - 27 + 'px'),
                            $element.append(f),
                            setTimeout(function() {
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
                            $scope.updateLastTypingTime(Date.now());
                    }
                    function v(a) {
                        var b = a.relatedTarget;
                        if (b) {
                            var c = utils.matchesSelector(b, 'input, textarea');
                            if (!c) {
                                var d = angular.element(b);
                                return void d.off('focusout').on('focusout', v);
                            }
                            var f = DocumentNode.getNodePropertyObject(b),
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
                        x(a, function(a) {
                            var b = $scope.getElement(a.relativeX, a.relativeY);
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
                        var c: any = new Date(),
                            d = F(a),
                            e = N.x !== d.x || N.y !== d.y,
                            f = c - M > Q;
                        e && f && ((M = c), (N = d), b(N));
                    }
                    function y(a, b, d) {
                        var e = { clientX: a, clientY: b };
                        if (!d) return e;
                        var f = $scope.getFrameOffset(d);
                        return (e.clientX -= f.left), (e.clientY -= f.top), e;
                    }
                    function z(a) {
                        var b = $scope.getScrollableElement(
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
                        K = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        K.setAttribute('fill', DRAWING_OPTIONS.FILL);
                        K.setAttribute('stroke', DRAWING_OPTIONS.STROKE);
                        K.setAttribute('stroke-width', DRAWING_OPTIONS.STROKE_WIDTH);
                        var b = F(a);
                        I = 'M' + b.x + ' ' + b.y;
                        K.setAttribute('d', I);
                        J.append(K);
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
                        var b = $element[0].getBoundingClientRect(),
                            d = $element.parents('#viewer-overlay')[0].getBoundingClientRect();
                        return {
                            x: (a.pageX - b.left) / $scope.scale,
                            y: (a.pageY - b.top) / $scope.scale,
                            relativeX: (a.pageX - d.left) / $scope.scale,
                            relativeY: (a.pageY - d.top) / $scope.scale,
                            relativeClientX: (a.clientX - d.left) / $scope.scale,
                            relativeClientY: (a.clientY - d.top) / $scope.scale,
                        };
                    }
                    function G(a) {
                        I += ' L' + a.x + ' ' + a.y;
                        K.setAttribute('d', I);
                    }
                    function H(b, c?) {
                        var d = c ? 0 : DRAWING_OPTIONS.TIMEOUT;
                        $timeout(function() {
                            angular.element(b).remove();
                        }, d);
                        K = null;
                    }
                    var I,
                        J = $element.find('svg'),
                        K: any = null,
                        L = new DrawingService(),
                        M = ($stateParams.sessionId, 0),
                        N: any = {},
                        O: any = null,
                        P: any = null,
                        Q = 100;

                    $scope.activeTool;
                    $scope.SUPPORT_TOOLS = SUPPORT_TOOLS;
                    $scope.api = {
                        enableDrawing: function(a) {
                            L.connect(a);
                        },
                        setToolIsActive: function(a, b) {
                            a !== SUPPORT_TOOLS.CURSOR || b || L.exitCursor();
                            a !== SUPPORT_TOOLS.CONTROL_TAKEOVER || b || L.exitControlTakeOver();
                            $scope.activeTool = b ? a : null;
                            k();
                            $scope.activeTool === SUPPORT_TOOLS.PEN
                                ? l()
                                : $scope.activeTool === SUPPORT_TOOLS.CURSOR
                                ? n()
                                : $scope.activeTool === SUPPORT_TOOLS.CONTROL_TAKEOVER && m();
                        },
                    };
                    $scope.isCreated = !0;
                },
            };
        },
    ]);
