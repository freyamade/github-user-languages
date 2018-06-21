const btn = document.getElementById('changeBackground');

chrome.storage.sync.get('color', (data) => {
  btn.style.backgroundColor = data.color;
  btn.setAttribute('value', data.color);
  console.log(data.color);
});

btn.onclick = (e) => {
  let color = (e.target as HTMLInputElement).value;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.executeScript(
      tabs[0].id,
      { code: 'document.body.style.backgroundColor = "' + color + '";' }
    );
  });
};
