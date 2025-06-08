document.addEventListener('click', () => {
    const details = document.querySelectorAll('details');

    details.forEach((elem) => {
        console.log(elem);
        if (
            !elem.contains(event.target) &&
            !Array.from(elem).some((button) => button.contains(event.target))
        ) {
            elem.removeAttribute('open');
        }
    });
})