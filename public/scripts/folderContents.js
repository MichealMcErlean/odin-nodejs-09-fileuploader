const deleteForm = document.getElementById('delete-form');

deleteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const isHome = deleteForm.dataset.isHome === 'true';

  if (isHome) {
    alert('You cannot delete your home directory.');
    return;
  }
  if (confirm('Do you really want to delete this folder?')) {
    deleteForm.submit();
  } else {
    return;
  }
})