var signaturePad = new SignaturePad(document.getElementById("signature-pad"), {
    penColor: "rgb(7,87,152)",
});

var saveButton = document.getElementById("submit");
var cancelButton = document.getElementById("clear");
var sigimg = document.getElementById("sigimg");

saveButton.addEventListener("click", function (event) {
    sigimg.value = signaturePad.toDataURL("image/png");
});

cancelButton.addEventListener("click", function (event) {
    signaturePad.clear();
});
