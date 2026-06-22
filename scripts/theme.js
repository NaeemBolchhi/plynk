/* Light theme should be updated later. Delete this when done. */

// https://stackoverflow.com/a/57401891
function reShade(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2));
}

const darkTheme = `
    html, html[data-theme="default"] {
        --accent-color: #68dd48;
        --accent-lite: #f4eb43;
        --accent-deep: #0ad34c;
        --text-color: #c8c8c8;
        --text-color-h: ${reShade('#c8c8c8', -80)};
        --bg-deep: #0d0d0d;
        --bg-lite: ${reShade('#0d0d0d', 9)};
        --border-color: ${reShade('#0d0d0d', 18)};
        --shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
    }
`;

const lightTheme = `
    html, html[data-theme="default"] {
        --accent-color: #68dd48;
        --accent-lite: #f4eb43;
        --accent-deep: #0ad34c;
        --text-color: #2b2b2b;
        --text-color-h: ${reShade('#2d2d2d', 50)};
        --bg-deep: #f6f6f6;
        --bg-lite: ${reShade('#f6f6f6', -9)};
        --border-color: ${reShade('#f6f6f6', -23)};
        --shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
    }
`;

// Add Colors to CSS
function addColors() {
    let nightCSS = document.getElementById('nightCSS'),
        dayCSS = document.getElementById('dayCSS');

    nightCSS.textContent = darkTheme.replace(/\n/g,'').replace(/[\t\s]/g,'');
    dayCSS.textContent = lightTheme.replace(/\n/g,'').replace(/[\t\s]/g,'');
}

// Switch Themes
function switchColors(key) {
    let nightCSS = document.getElementById('nightCSS'),
        dayCSS = document.getElementById('dayCSS');

    let mediaNight = '(prefers-color-scheme: no-preference), (prefers-color-scheme: dark)',
        mediaDay = '(prefers-color-scheme: light)',
        typeEnabled = 'text/css',
        typeDisabled = 'null';

    if (key === 'day') {
        nightCSS.setAttribute('type',typeDisabled);
        dayCSS.setAttribute('type',typeEnabled);
        nightCSS.removeAttribute('media');
        dayCSS.removeAttribute('media');
    } else if (key === 'night') {
        nightCSS.setAttribute('type',typeEnabled);
        dayCSS.setAttribute('type',typeDisabled);
        nightCSS.removeAttribute('media');
        dayCSS.removeAttribute('media');
    } else {
        nightCSS.setAttribute('type',typeEnabled);
        dayCSS.setAttribute('type',typeEnabled);
        nightCSS.setAttribute('media',mediaNight);
        dayCSS.setAttribute('media',mediaDay);
    }
}

addColors();
switchColors(localStorage.switchState);