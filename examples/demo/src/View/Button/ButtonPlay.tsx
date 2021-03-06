import React from 'react';
import Button from './Button';

export const ButtonPlay = props => {
    return (
        <Button className="player-controls-button" {...props}>
            <svg
                width="14"
                height="16"
                viewBox="0 0 14 16"
                xmlns="http://www.w3.org/2000/svg"
                class="player-controls-icon ng-scope"
                ng-switch-when="false"
                style=""
            >
                <path
                    d="M12.822 6.267L3.056.301A2.014 2.014 0 0 0 1.024.25 1.902 1.902 0 0 0 0 1.95v11.933c0 .717.393 1.35 1.024 1.7a2.012 2.012 0 0 0 2.032-.05l9.766-5.967c.58-.366.939-.983.939-1.65 0-.683-.341-1.3-.939-1.65z"
                    fill="#D5D6D8"
                    fill-rule="nonzero"
                ></path>
            </svg>
        </Button>
    );
};

export default ButtonPlay;
