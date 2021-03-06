import React, { useEffect, useState } from 'react';

import ConsolePrompt from '../ConsolePrompt';
import {
    Error as ErrorIcon,
    Warning as WarnIcon,
    UserCommand as UserCommandIcon,
    CommandResult as CommandResultIcon,
} from '../../components/Icon';

const Icon = ({ type }) => {
    const spritesheet = {
        warning: '-40px 10px;',
        info: '-40px 10px',
        error: '-40px 10px',
        log: '-40px 10px',
    };

    return (
        <span
            class="command-result-icon spritesheet-smallicons smallicon-user-command"
            style={{ width: '10px', height: '10px', '--spritesheet-position': spritesheet[type] }}
        ></span>
    );
};
Icon.defaultProps = { type: 'log' };

const DevtoolsLink = ({ children, ...other }) => (
    <span class="devtools-link" role="link" tabindex="-1" {...other}>
        {children}
    </span>
);

const SourceCode = ({ children }) => <span class="source-code">{children}</span>;

const MessageText = ({ children }) => <span class="console-message-text">{children}</span>;
const MessageBadge = () => <span class="hidden console-message-badge"></span>;
const MessageAnchor = ({ children }) => (
    <span class="console-message-anchor">
        <DevtoolsLink>{children}</DevtoolsLink>
    </span>
);

const Message = ({ children }) => {
    return <div class="console-message">{children}</div>;
};

const MessageWrapper = ({ children, type, ...other }) => {
    const levelClass = type ? ` console-${type}-level` : '';
    const cls = `console-message-wrapper console-from-api${levelClass}`;

    return (
        <div tabindex="-1" class={cls} {...other}>
            {children}
        </div>
    );
};

const UserCommandResult = ({ children }) => {
    return (
        <div class="console-message console-user-command-result">
            <CommandResultIcon />
            {children}
        </div>
    );
};

const ConsoleItem = ({ text, anchor, children }) => {
    return (
        <MessageWrapper>
            <Message>
                <SourceCode>
                    <MessageAnchor>log.js?1afd:24</MessageAnchor>
                    <MessageBadge />
                    <MessageText>{text || children}</MessageText>
                </SourceCode>
            </Message>
        </MessageWrapper>
    );
};

const formatUTCDate = date => {
    const now = new Date(date);
    let hh = now.getUTCHours();
    let mm = now.getUTCMinutes();
    let ss = now.getUTCSeconds();
    let sss = now.getUTCMilliseconds();

    hh = hh <= 9 ? `0${hh}` : hh;
    mm = mm <= 9 ? `0${mm}` : mm;
    ss = ss <= 9 ? `0${ss}` : ss;
    sss = sss <= 9 ? `0${sss}` : sss;

    return `${hh}:${mm}:${ss}:${sss}`;
};

export default ({ children, addNewLogs }) => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        setLogs(logs.concat(addNewLogs));
    }, addNewLogs);

    return (
        <div className="vbox flex-auto console-searchable-view">
            <div className="widget vbox">
                <div id="console-messages" className="monospace" style="overflow: auto;">
                    <div aria-hidden="true" style="height: 0px; color: transparent;">
                        &#65279;
                    </div>
                    {/* <div tabindex="0" class="console-group console-group-messages" style=""> */}
                    {/* <ConsoleItem anchor="log.js?1afd:24">[HMR] Waiting for update signal from WDS...</ConsoleItem>

                        <ConsoleItem anchor="react-dom.development.js?61bb:27705">
                            <span style="contain: paint; display: inline-block; max-width: 100%; font-weight: bold;">
                                Download the React DevTools for a better development experience:
                                <DevtoolsLink style="-webkit-text-stroke: 0px !important; text-decoration: underline !important; color: rgb(84, 84, 84) !important; background-color: rgb(255, 255, 255) !important;">
                                    https://fb.me/react-devtools
                                </DevtoolsLink>
                            </span>
                        </ConsoleItem> */}

                    {/* <div tabindex="-1" class="console-message-wrapper console-from-api console-info-level">
                            <div class="console-message">
                                <span class="source-code">
                                    <span class="console-message-anchor">
                                        <span class="devtools-link" role="link" tabindex="-1">
                                            react-dom.development.js?61bb:27705
                                        </span>
                                    </span>
                                    <span class="hidden console-message-badge"></span>
                                    <span class="console-message-text">
                                        <span style="contain: paint; display: inline-block; max-width: 100%; font-weight: bold;">
                                            Download the React DevTools for a better development experience:
                                            <span
                                                class="devtools-link"
                                                role="link"
                                                tabindex="-1"
                                                style="-webkit-text-stroke: 0px !important; text-decoration: underline !important; color: rgb(84, 84, 84) !important; background-color: rgb(255, 255, 255) !important;"
                                            >
                                                https://fb.me/react-devtools
                                            </span>
                                        </span>
                                    </span>
                                </span>
                            </div>
                        </div> */}
                    {/* </div> */}

                    {logs.map(log => {
                        if (log.type === 'console_warn') {
                            return (
                                <MessageWrapper type="warning">
                                    {formatUTCDate(log.time)}
                                    <Message>
                                        <WarnIcon />
                                        <div class="console-message-stack-trace-toggle">
                                            <div class="console-message-stack-trace-wrapper">
                                                <div tabindex="-1">
                                                    <span
                                                        is="ui-icon"
                                                        class="console-message-expand-icon spritesheet-smallicons smallicon-triangle-right icon-mask"
                                                        style="--spritesheet-position:0px 10px; width: 10px; height: 10px;"
                                                    ></span>
                                                    <SourceCode>
                                                        <MessageAnchor>
                                                            <DevtoolsLink>{log.time}</DevtoolsLink>
                                                        </MessageAnchor>
                                                        <MessageText>{log.details.message}</MessageText>
                                                    </SourceCode>
                                                </div>
                                                <div class="hidden">
                                                    <span class="monospace" style="display: inline-block;"></span>
                                                </div>
                                            </div>
                                        </div>
                                    </Message>
                                </MessageWrapper>
                            );
                        }

                        if (log.type === 'console_log') {
                            return (
                                <MessageWrapper type="info">
                                    {formatUTCDate(log.time)}
                                    <Message>
                                        <SourceCode>
                                            <MessageAnchor>
                                                <DevtoolsLink>{log.time}</DevtoolsLink>
                                            </MessageAnchor>
                                            <MessageText>{log.details.message}</MessageText>
                                        </SourceCode>
                                    </Message>
                                </MessageWrapper>
                            );
                        }

                        return (
                            <MessageWrapper type="error">
                                {formatUTCDate(log.time)}
                                <Message>
                                    <ErrorIcon />
                                    <div class="console-message-stack-trace-toggle">
                                        <div class="console-message-stack-trace-wrapper">
                                            <div tabindex="-1">
                                                <span
                                                    is="ui-icon"
                                                    class="console-message-expand-icon spritesheet-smallicons smallicon-triangle-right icon-mask"
                                                    style="--spritesheet-position:0px 10px; width: 10px; height: 10px;"
                                                ></span>
                                                <SourceCode>
                                                    <MessageAnchor>
                                                        <DevtoolsLink>{log.time}</DevtoolsLink>
                                                    </MessageAnchor>
                                                    <MessageText>{log.details.message}</MessageText>
                                                </SourceCode>
                                            </div>
                                            <div class="hidden">
                                                <span class="monospace" style="display: inline-block;"></span>
                                            </div>
                                        </div>
                                    </div>
                                </Message>
                            </MessageWrapper>
                        );
                    })}

                    {/* <MessageWrapper type="error">
                        <Message>
                            <ErrorIcon />
                            <div class="console-message-stack-trace-toggle">
                                <div class="console-message-stack-trace-wrapper">
                                    <div tabindex="-1">
                                        <span
                                            is="ui-icon"
                                            class="console-message-expand-icon spritesheet-smallicons smallicon-triangle-right icon-mask"
                                            style="--spritesheet-position:0px 10px; width: 10px; height: 10px;"
                                        ></span>
                                        <span class="source-code">
                                            <span class="console-message-anchor">
                                                <span class="devtools-link" role="link" tabindex="-1">
                                                    VM3351:1
                                                </span>
                                            </span>
                                            <span class="console-message-text">
                                                <span class="object-value-number source-code">1</span>
                                            </span>
                                        </span>
                                    </div>
                                    <div class="hidden">
                                        <span class="monospace" style="display: inline-block;"></span>
                                    </div>
                                </div>
                            </div>
                        </Message>
                    </MessageWrapper>

                    <MessageWrapper type="info">
                        <UserCommandResult>
                            <SourceCode>
                                <MessageText>
                                    <span class="object-value-undefined source-code">undefined</span>
                                </MessageText>
                            </SourceCode>
                        </UserCommandResult>
                    </MessageWrapper>

                    <MessageWrapper type="warning">
                        <UserCommandResult>
                            <SourceCode>
                                <MessageText>
                                    <span class="object-value-undefined source-code">undefined</span>
                                </MessageText>
                            </SourceCode>
                        </UserCommandResult>
                    </MessageWrapper>

                    <MessageWrapper>
                        <UserCommand>
                            <SourceCode>
                                <span class="cm-js-variable">apm</span>
                            </SourceCode>
                        </UserCommand>
                    </MessageWrapper> */}

                    {/* <div tabindex="-1" class="console-message-wrapper">
                        <div class="console-user-command">
                            <span
                                is="ui-icon"
                                class="command-result-icon spritesheet-smallicons smallicon-user-command"
                                style="--spritesheet-position:-40px 10px; width: 10px; height: 10px;"
                            ></span>
                            <span class="source-code">
                                <span class="cm-js-variable">console</span>.<span class="cm-js-property">error</span>(
                                <span class="cm-js-number">1</span>)
                            </span>
                        </div>
                    </div> */}
                    {/* <div tabindex="-1" class="console-message-wrapper console-from-api console-error-level">
                        <div class="console-message">
                            <span
                                is="ui-icon"
                                class="message-level-icon spritesheet-smallicons smallicon-error"
                                aria-label="Error"
                                style="--spritesheet-position:-40px 70px; width: 10px; height: 10px;"
                            ></span>
                            <div class="console-message-stack-trace-toggle">
                                <div class="console-message-stack-trace-wrapper">
                                    <div tabindex="-1">
                                        <span
                                            is="ui-icon"
                                            class="console-message-expand-icon spritesheet-smallicons smallicon-triangle-right icon-mask"
                                            style="--spritesheet-position:0px 10px; width: 10px; height: 10px;"
                                        ></span>
                                        <span class="source-code">
                                            <span class="console-message-anchor">
                                                <span class="devtools-link" role="link" tabindex="-1">
                                                    VM3351:1
                                                </span>
                                            </span>
                                            <span class="console-message-text">
                                                <span class="object-value-number source-code">1</span>
                                            </span>
                                        </span>
                                    </div>
                                    <div class="hidden">
                                        <span class="monospace" style="display: inline-block;"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                    {/* <div tabindex="-1" class="console-message-wrapper console-info-level">
                        <div class="console-message console-user-command-result">
                            <span
                                is="ui-icon"
                                class="command-result-icon spritesheet-smallicons smallicon-command-result"
                                style="--spritesheet-position:0px 70px; width: 10px; height: 10px;"
                            ></span>
                            <span class="source-code">
                                <span class="console-message-text">
                                    <span class="object-value-undefined source-code">undefined</span>
                                </span>
                            </span>
                        </div>
                    </div> */}
                    {/* <div tabindex="-1" class="console-message-wrapper">
                        <div class="console-user-command">
                            <span
                                is="ui-icon"
                                class="command-result-icon spritesheet-smallicons smallicon-user-command"
                                style="--spritesheet-position:-40px 10px; width: 10px; height: 10px;"
                            ></span>
                            <span class="source-code">
                                <span class="cm-js-variable">apm</span>
                            </span>
                        </div>
                    </div> */}
                    {/* <div
                        tabindex="-1"
                        class="console-message-wrapper console-error-level console-adjacent-user-command-result"
                    >
                        <div class="console-message console-user-command-result">
                            <ErrorIcon />
                            <div class="console-message-stack-trace-toggle">
                                <div class="console-message-stack-trace-wrapper">
                                    <div tabindex="-1">
                                        <span
                                            is="ui-icon"
                                            class="console-message-expand-icon spritesheet-smallicons smallicon-triangle-right icon-mask"
                                            style="--spritesheet-position:0px 10px; width: 10px; height: 10px;"
                                        ></span>
                                        <span class="source-code">
                                            <span class="console-message-anchor">
                                                <span class="devtools-link" role="link" tabindex="-1">
                                                    VM3366:1
                                                </span>
                                            </span>
                                            <span class="console-message-text">
                                                Uncaught
                                                <span class="object-value-error source-code">
                                                    ReferenceError: apm is not defined at &lt;anonymous&gt;:1:1
                                                </span>
                                            </span>
                                        </span>
                                    </div>
                                    <div class="hidden">
                                        <span class="monospace" style="display: inline-block;"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}

                    <div aria-hidden="true" style="height: 0px; color: transparent;">
                        &#65279;
                    </div>

                    <ConsolePrompt />
                </div>
                <div className="search-bar hidden"></div>
            </div>
        </div>
    );
};
