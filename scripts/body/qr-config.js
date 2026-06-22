document.querySelector('body > .qr qr-code').addEventListener('codeRendered', () => {
    document.querySelector('.qr qr-code').shadowRoot.querySelector('#qr-container').style = 'margin: 7px 0 0 7px';
    document.querySelector('body > .qr qr-code').animateQRCode('MaterializeIn');
});

document.querySelector('body > .qr').addEventListener('click', () => {
    document.querySelector('body > .qr').classList.remove('show');
});

document.addEventListener('click', async (e) => {
    if (!e.target.closest('form span[type="qr"]') && !e.target.closest('form span[type="copy"]')) {return;}

    const pasted_url = document.querySelector('#pasted_url');

    if (e.target.closest('form span[type="qr"]')) {
        document.querySelector('body > .qr').classList.add('show');
        document.querySelector('.qr qr-code').setAttribute('contents', pasted_url.getAttribute('data-value'));
    }

    if (e.target.closest('form span[type="copy"]')) {
        if (pasted_url.value === pasted_url.getAttribute('data-value')) {
            try {
                if (!navigator.clipboard) {
                    throw new Error("Clipboard API not supported");
                }
                await navigator.clipboard.writeText(pasted_url.getAttribute('data-value'));
                pasted_url.value = 'copied url to clipboard';
            } catch (err) {
                console.error('Failed to copy: ', err);
                pasted_url.value = 'failed to copy url to clipboard';
            }
    
            setTimeout(() => {
                pasted_url.value = pasted_url.getAttribute('data-value');
            }, 850);
        }
    }
});