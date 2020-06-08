import { $window } from './resource';
import { FRONTEND_URL } from './constant';

const URL_PROTOCOL = {
    HTTP: 'http://',
    HTTPS: 'https://',
};

function e() {
    return FRONTEND_URL + 'player';
}
function f(b, c, d) {
    var e = i({
        sessionId: b,
        forceHttp: c,
    });
    (e += j({
        source: d,
    })),
        $window.open(e);
}
function g(b, c) {
    var d = i({
        sessionId: b,
        forceHttp: c,
    });
    (d += j({
        play_live: !0,
        source: 'online_users_dashboard',
    })),
        $window.open(d);
}
function h(b, c, d) {
    var e = k(b, c, d);
    (e += j({
        source: 'events_and_errors_dashboard',
    })),
        $window.open(e);
}
function i(a) {
    var b = e() + '/#/sessions/' + a.sessionId;
    return a.forceHttp && b.startsWith(URL_PROTOCOL.HTTPS) && (b = b.replace(URL_PROTOCOL.HTTPS, URL_PROTOCOL.HTTP)), b;
}
function j(a) {
    var b = '',
        c = 0;
    for (var d in a) (b += 0 === c ? '?' : '&'), (b += d + '=' + a[d]), c++;
    return b;
}
function k(a, b, c) {
    var d = i({
        sessionId: a,
        forceHttp: c,
    });
    return (d += '/logs/' + b);
}

export const navigation = {
    openSessionInNewWindow: f,
    openLiveSessionInNewWindow: g,
    openLogInNewWindow: h,
};
