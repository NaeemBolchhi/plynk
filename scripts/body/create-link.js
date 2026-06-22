document.querySelector('.content > form').addEventListener('submit', (e) => {
    e.preventDefault();

    if (document.querySelector('body > .content').classList.contains('shortened')) {
        return;
    }

    async function main() {
        try {
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

            if (!response.ok) {
                throw new Error(result.error || 'Bad response');
            }

            if (result.success !== true) {
                throw new Error(result.response || 'Failed to create paste');
            }

            document.querySelector('.content').classList.add('shortened');
            document.querySelector('#pasted_url').value = `${window.location.origin}/${result.response}`;
            document.querySelector('#pasted_url').setAttribute('data-value', `${window.location.origin}/${result.response}`);
            document.querySelector('#pasted_url').setAttribute('readonly','');
        } catch (error) {
            console.error('Fetch Error:', error.message);
        }
    }

    main();
});