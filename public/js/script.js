window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorMessage = document.querySelector('#error-message');
    const inputs = document.querySelectorAll('input');

    if (error == 'true') {
        errorMessage.style.display = 'block';
        inputs.forEach(input => {
            if (input.type != 'submit') {
                input.style.border = '1px solid red';
            }
        });
    }
}

function closeModal() {
    const modal = document.querySelector('.modal-success');
    modal.style.display = 'none';
}