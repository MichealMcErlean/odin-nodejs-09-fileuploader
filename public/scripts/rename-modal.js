const openRenameModalBtn = document.getElementById('rename-modal-open');
const closeRenameModalBtn = document.getElementById('rename-modal-close')
const renameModal = document.getElementById('rename-modal');


openRenameModalBtn.addEventListener('click', () => {
  renameModal.showModal();
});

closeRenameModalBtn.addEventListener('click', () => {
  renameModal.close();
})

