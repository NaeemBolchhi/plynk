document.querySelector('.content > form').addEventListener('submit', (e) => {
    e.preventDefault();

    async function main() {
        const response = await fetch(`${window.location.origin}/api/push`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                long_url: document.querySelector('#pasted_url').value,
                expiration: document.querySelector('form .expires').getAttribute('data-selected'),
                user_key: null
            })
        });

        const result = await response.json();

        if (result.success !== true) {
            console.error('Error:', result);
        }

        document.querySelector('.content').classList.add('shortened');
        document.querySelector('#pasted_url').value = `${window.location.origin}/#/${result.response}`;
    }

    main();
});