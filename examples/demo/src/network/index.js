import { h, useState, useEffect } from '../core';

const data = [
    {
        startedDateTime: '2019-11-04T13:33:25.255Z',
        time: 253.83299999521114,
        request: {
            method: 'GET',
            url:
                'https://www.bilibili.com/tv/index/?spm_id_from=333.6.b_7375626e6176.4',
        },
        headers: [
            {
                name: 'User-Agent',
                value:
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36',
            },
        ],
        response: { status: 200, statusText: 'OK' },
        timings: {},
        serverIPAddress: '119.3.32.96',
    },
    {
        startedDateTime: '2019-11-04T13:33:25.255Z',
        time: 253.83299999521114,
        request: {
            method: 'GET',
            url:
                'https://www.bilibili.com/tv/index/?spm_id_from=333.6.b_7375626e6176.4',
        },
        headers: [
            {
                name: 'User-Agent',
                value:
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36',
            },
        ],
        response: { status: 200, statusText: 'OK' },
        timings: {},
        serverIPAddress: '119.3.32.96',
    },
];

export default () => {
    const [state, setState] = useState([]);

    useEffect(() => {
        // setInterval(() => {
        //     setState(newState => [
        //         {
        //             startedDateTime: '2019-11-04T13:33:25.255Z',
        //             time: 253.83299999521114,
        //             request: {
        //                 method: 'GET',
        //                 url:
        //                     'https://www.bilibili.com/tv/index/?spm_id_from=333.6.b_7375626e6176.4',
        //             },
        //             headers: [
        //                 {
        //                     name: 'User-Agent',
        //                     value:
        //                         'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36',
        //                 },
        //             ],
        //             response: { status: 200, statusText: 'OK' },
        //             timings: {},
        //             serverIPAddress: '119.3.32.96',
        //         },
        //         ...newState,
        //     ]);
        // }, 1000);
    }, []);

    return (
        <div className="panel network">
            <div id="network-container no-node-selected">
                <div className="toolbar network-summary-bar">
                    Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6)
                    AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70
                    Safari/537.36
                </div>

                <div className="network-status-pane fill">
                    <div className="recording-hint">
                        <span></span>
                    </div>
                </div>
                <div className="data-grid inline network-log-grid small striped-data-grid">
                    <div className="header-container">
                        <table className="header">
                            <colgroup></colgroup>
                            <tbody>
                                <tr>
                                    <th className="sortable">
                                        Name
                                        <i className="sort-order-icon-container"></i>
                                    </th>
                                    <th className="sortable">Status</th>
                                    <th className="sortable">Type</th>
                                    <th className="sortable">Initiator</th>
                                    <th className="sortable">Size</th>
                                    <th className="sortable">Time</th>
                                    <th className="sortable">Waterfall</th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="data-container">
                        <table className="data">
                            <colgroup></colgroup>
                            <tbody>
                                <tr className="data-grid-filler-row revealed data-grid-data-grid-node">
                                    <td>Name</td>
                                    <td>Status</td>
                                    <td>Type</td>
                                    <td>Initiator</td>
                                    <td>Size</td>
                                    <td>Time</td>
                                    <td>Waterfall</td>
                                </tr>
                                <tr className="data-grid-filler-row revealed data-grid-data-grid-node">
                                    <td>Name</td>
                                    <td>Status</td>
                                    <td>Type</td>
                                    <td>Initiator</td>
                                    <td>Size</td>
                                    <td>Time</td>
                                    <td>Waterfall</td>
                                </tr>
                                <tr className="data-grid-filler-row revealed data-grid-data-grid-node">
                                    <td>Name</td>
                                    <td>Status</td>
                                    <td>Type</td>
                                    <td>Initiator</td>
                                    <td>Size</td>
                                    <td>Time</td>
                                    <td>Waterfall</td>
                                </tr>
                                <tr className="data-grid-filler-row revealed data-grid-data-grid-node">
                                    <td>Name</td>
                                    <td>Status</td>
                                    <td>Type</td>
                                    <td>Initiator</td>
                                    <td>Size</td>
                                    <td>Time</td>
                                    <td>Waterfall</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="network-overview-panel">
                    <div
                        id="network-overview-container"
                        className="network-overview"
                    >
                        <div className="toolbar-text">12345</div>
                    </div>
                </div>
            </div>

            {/* <div className="network-details-view">
                <div className="network-details-view-tall-header"></div>
            </div>

            <div className="network-item-view"></div>

            <div className="network-container">
                
            </div> */}
        </div>
    );
};
