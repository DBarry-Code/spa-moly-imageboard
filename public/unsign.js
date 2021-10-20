const unsignForm = document.getElementById("unsign");
if (unsignForm) {
    unsignForm.addEventListener("submit", (event) => {
        if (!confirm("Are you sure???")) {
            event.preventDefault();
        }
    });
}
