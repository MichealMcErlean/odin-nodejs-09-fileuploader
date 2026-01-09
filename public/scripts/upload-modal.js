const openUploadModalBtn = document.getElementById('upload-modal-open')
const closeUploadModalBtn = document.getElementById('upload-modal-close');
const uploadModal = document.getElementById('upload-modal')
const fileInput = document.getElementById('fileinput')

openUploadModalBtn.addEventListener('click', () => {
  uploadModal.showModal();
})

closeUploadModalBtn.addEventListener('click', () => {
  uploadModal.close();
})

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const maxAllowedSize = 5 * 1024 * 1024; //5MB

  if (file && file.size > maxAllowedSize) {
    alert('File is more than 5MB, cannot upload.')
    fileInput.value = ''; //Reset input
  }
})