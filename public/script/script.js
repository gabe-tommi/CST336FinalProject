document.querySelector('#addGameForm').addEventListener('submit', async (event) => {
    const name = document.getElementById('name').value.trim();
    const genre = document.getElementById('genre').value;
    const studioName = document.getElementById('studio_name').value.trim();
    const address = document.getElementById('address').value.trim();

    // Validation for name
    if (name.length <= 3) {
        alert('Please enter a name longer than 3 characters');
        event.preventDefault(); // Prevent the default form submission
        return;
    }

    // Validation for studio name
    if (studioName.length <= 3) {
        alert('Please enter a studio name longer than 3 characters');
        event.preventDefault(); // Prevent the default form submission
        return;
    }

    // Validation for address
    if (address.length <= 3) {
        alert('Please enter an address longer than 3 characters');
        event.preventDefault(); // Prevent the default form submission
        return;
    }
});