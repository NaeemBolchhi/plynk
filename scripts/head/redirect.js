async function fetchLink(slug, userKey = null) {
    try {
        const response = await fetch(`${window.location.origin}/api/pull`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                slug: slug,
                user_key: userKey
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch or decrypt');
        }

        window.location.replace(data.response);
    } catch (error) {
        console.error('Frontend Fetch Error:', error.message);
        document.querySelector('.redirected').textContent = 'This link is unavailable.';
        document.querySelector('.anew').classList.add('right');
    }
}

(function() {
    const slug = window.location.pathname.replace('/','');

    if (slug.match(/[^0-9a-zA-Z]/)) {
        console.error('Frontend Fetch Error:', 'Invalid link.');
        document.querySelector('.redirected').textContent = 'This link is invalid.';
        document.querySelector('.anew').classList.add('right');
    } else {
        fetchLink(slug, null);
    }
})();