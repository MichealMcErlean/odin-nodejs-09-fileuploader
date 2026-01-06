const form = document.getElementById('signupform');
const password = document.getElementById('password');
const confirmPW = document.getElementById('confirmPW');
const username = document.getElementById('username');

const usernameError = document.getElementById('usernameError');
const confirmPWError = document.getElementById('confirmPWError');

console.log(username);

if (username) {
  username.addEventListener('blur', async (event) => {
    try {
      console.log('About to send fetch request');
      const response = await fetch(`/check-username?username=${encodeURIComponent(username.value)}`);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json()
      if (data.isTaken) {
        usernameError.style.color = 'red';
        usernameError.textContent = 'That email is already attached to another account.'
      } else {
        usernameError.style.color = 'green'
        usernameError.textContent = 'That email is available.';
      }
    } catch(error) {
      console.error('Fetch failed:', error)
    }
  })
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (password.value !== confirmPW.value) {
      confirmPWError.style.color = 'red';
      confirmPWError.textContent = 'Password and Confirm Password must match exactly.';
      return;
    } else {
      confirmPWError.textContent = '';
    }

    if (usernameError.textContent == 'That email is already attached to another account.') {
      return;
    }

    form.submit();
  })
}