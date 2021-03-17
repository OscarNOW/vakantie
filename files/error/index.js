function onload() {
	document.getElementById('title').innerText = document.getElementById('errorCodeMessage').innerText;
	if (document.getElementById('errorFile').innerText == '|errorFile|') document.getElementById('errorFileWrapper').parentElement.removeChild(document.getElementById('errorFileWrapper'));
	if (document.getElementById('errorMessage').innerText == '|errorMessage|') document.getElementById('errorMessage').parentElement.removeChild(document.getElementById('errorMessage'));
	if (document.getElementById('errorCodeMessage').innerText == '|errorCodeMessage|') document.getElementById('errorCodeMessage').parentElement.removeChild(document.getElementById('errorCodeMessage'));
}
