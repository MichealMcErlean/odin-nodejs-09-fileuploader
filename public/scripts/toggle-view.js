const foldercontents = document.querySelector('.folder-contents');
const folderitems = document.querySelectorAll('.folder-item');
const toggleBtn = document.querySelector('#toggle-view');

toggleBtn.addEventListener('click', () => {
  foldercontents.classList.toggle('tile-view');
  folderitems.forEach(item => {
    item.classList.toggle('tile');
  })
})