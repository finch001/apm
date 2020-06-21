import React from 'react';
import Button from './Button';

export const ButtonDownload = props => {
    return (
        <Button className="player-controls-button" {...props}>
            <svg width="16" height="14" viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg">
                <g fill="#D5D6D8" fill-rule="nonzero">
                    <path d="M15.236 6.163c-.392 0-.712.308-.712.683v5.174c0 .324-.266.563-.604.563H2.098c-.32 0-.605-.256-.605-.563V6.846c0-.375-.32-.683-.71-.683-.392 0-.712.308-.712.683v5.174c0 1.058.907 1.929 2.027 1.929H13.92c1.12 0 2.027-.871 2.027-1.93V6.847c0-.375-.32-.683-.711-.683z" />
                    <path d="M7.396 11.883l.088.085h.036l.036.034h.053c.018 0 .018 0 .035.018a.273.273 0 0 0 .125.017H8c.053 0 .089-.017.124-.017a.137.137 0 0 0 .072-.035c.017 0 .017-.017.035-.017h.036l.07-.068 3.254-2.68a.748.748 0 0 0 .249-.461.626.626 0 0 0-.16-.496c-.267-.273-.711-.307-.996-.068L8.64 9.885V.683L8.622.649A.818.818 0 0 0 7.858.05c-.391 0-.711.308-.711.683v9.134L5.084 8.195a.699.699 0 0 0-.515-.17.68.68 0 0 0-.48.238.639.639 0 0 0-.178.496.637.637 0 0 0 .249.46l3.236 2.664z" />
                </g>
            </svg>
        </Button>
    );
};

export default ButtonDownload;
