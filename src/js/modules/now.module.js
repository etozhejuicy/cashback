let nowElems = document.querySelectorAll('#currentMonth');

const nowDate = new Date();
const options = { month: 'long', year: 'numeric' };
const formattedDate = nowDate.toLocaleDateString('ru-RU', options);

class Now {
    constructor() {
        this.events();
    }

    events() {
        document.addEventListener('DOMContentLoaded', () => {
            nowElems.forEach((nowElem) => {
                nowElem.innerText = formattedDate;
            });
        });
    }
}

new Now;