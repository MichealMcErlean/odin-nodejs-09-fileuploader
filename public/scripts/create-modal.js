const openCreateModalBtn = document.getElementById('create-modal-open');
const closeCreateModalBtn = document.getElementById('create-modal-close')
const createModal = document.getElementById('create-modal');

openCreateModalBtn.addEventListener('click', () => {
  createModal.showModal();
})

closeCreateModalBtn.addEventListener('click', () => {
  createModal.close();
})