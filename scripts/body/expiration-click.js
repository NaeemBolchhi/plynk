document.addEventListener('click', (e) => {
    if (!e.target.closest('.expires span[data-value]')) {return;}

    e.target.closest('.expires').setAttribute('data-selected', e.target.closest('.expires span[data-value]').getAttribute('data-value'));
});