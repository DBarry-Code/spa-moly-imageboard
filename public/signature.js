var signaturePad = new SignaturePad(document.getElementById("signature-pad"), {
    backgroundColor: "rgba(255, 255, 255, 0)",
    penColor: "rgb(0, 0, 0)",
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
