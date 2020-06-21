import React from 'react';
import Button from './Button';

export const ButtonSettings = props => {
    return (
        <Button className="player-controls-button" {...props}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 15 17"
                class="player-controls-icon"
            >
                <path
                    fill-opacity=".8"
                    fill="#FFF"
                    transform="translate(-185 -155)"
                    d="M193.048 166.783c-2.007 0-3.634-1.648-3.634-3.68 0-2.034 1.627-3.682 3.634-3.682 2.007 0 3.634 1.648 3.634 3.681 0 2.033-1.627 3.68-3.634 3.68zm7.906-5.064a.796.796 0 0 0-.917-.66l-.907.157a6.44 6.44 0 0 0-1.302-2.353l.586-.695a.812.812 0 0 0-.089-1.134l-.159-.139a.789.789 0 0 0-1.12.09l-.582.69a6.275 6.275 0 0 0-2.493-.939l.011-.92a.8.8 0 0 0-.785-.814l-.21-.002a.8.8 0 0 0-.805.796l-.01.933c-.93.13-1.794.46-2.549.951l-.615-.748a.788.788 0 0 0-1.12-.103l-.161.136a.812.812 0 0 0-.102 1.134l.635.772a6.443 6.443 0 0 0-1.257 2.236l-1.019-.199a.795.795 0 0 0-.93.64l-.04.208c-.082.436.2.858.63.942l1.053.205c-.001.067-.01.132-.01.2 0 .863.172 1.687.477 2.44l-.957.558a.811.811 0 0 0-.293 1.1l.105.184a.79.79 0 0 0 1.085.296l.974-.567a6.398 6.398 0 0 0 1.871 1.61l-.402 1.067a.808.808 0 0 0 .458 1.04l.197.075c.41.158.87-.05 1.026-.465l.4-1.064a6.3 6.3 0 0 0 1.42.167 6.29 6.29 0 0 0 1.208-.12l.374 1.045a.792.792 0 0 0 1.018.483l.197-.073a.807.807 0 0 0 .477-1.03l-.365-1.024a6.385 6.385 0 0 0 1.97-1.595l.882.53a.789.789 0 0 0 1.09-.28l.107-.182a.811.811 0 0 0-.278-1.104l-.853-.514c.34-.79.533-1.66.533-2.578 0-.029-.004-.056-.004-.084l.934-.161a.804.804 0 0 0 .65-.929l-.034-.209z"
                />
            </svg>
        </Button>
    );
};

export default ButtonSettings;