document.getElementById('key-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    document.getElementById('loading').style.display = 'block';
    document.getElementById('keys-container').style.display = 'none';
    document.getElementById('message-container').innerHTML = '';

    const formData = new FormData(this);
    const responsePromise = fetch('/generate_keys', {
        method: 'POST',
        body: formData
    });

    const progressBar = document.querySelector('.progress');
    const loadingPercentage = document.getElementById('loading-percentage');
    let percentage = 0;
    const interval = setInterval(() => {
        percentage += 1;
        if (percentage >= 100) percentage = 99;
        progressBar.style.width = percentage + '%';
        loadingPercentage.textContent = percentage + '%';
    }, 1200);

    const timeout = setTimeout(() => {
        clearInterval(interval);
        percentage = 99;
        progressBar.style.width = percentage + '%';
        loadingPercentage.textContent = percentage + '%';
    }, 120000);

    const result = await responsePromise.then(res => res.json());
    clearInterval(interval);
    clearTimeout(timeout);
    progressBar.style.width = '100%';
    loadingPercentage.textContent = '100%';
    document.getElementById('loading').style.display = 'none';

    if (result.keys.length > 0) {
        const keysBoard = document.getElementById('keys-board');
        keysBoard.innerHTML = '';
        keysBoard.style.minHeight = `${result.keys.length * 40}px`;
        result.keys.forEach((key, index) => {
            const keyItem = document.createElement('div');
            keyItem.classList.add('key-item');
            
            const keyText = document.createElement('span');
            keyText.textContent = key;

            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy';
            copyButton.classList.add('copy-btn');
            copyButton.addEventListener('click', () => copyToClipboard(key, index));

            keyItem.appendChild(keyText);
            keyItem.appendChild(copyButton);
            keysBoard.appendChild(keyItem);
        });
        document.getElementById('keys-container').style.display = 'block';
    } else {
        const messageContainer = document.getElementById('message-container');
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'No keys were generated.';
        errorMessage.classList.add('error');
        messageContainer.appendChild(errorMessage);
    }
});

function copyToClipboard(key, index) {
    const tempInput = document.createElement('input');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    tempInput.value = key;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    // Optional: Show feedback that the key has been copied
    const copyBtn = document.querySelectorAll('.copy-btn')[index];
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = 'Copy';
    }, 2000);
}