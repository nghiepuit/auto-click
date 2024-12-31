let isClicking = false;

document.getElementById('selectElement').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: startElementSelection
  });
});

document.getElementById('startClicking').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const intervalTime = document.getElementById('intervalTime').value;
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: startAutoClicking,
    args: [parseFloat(intervalTime) * 1000] // Chuyển đổi giây thành milliseconds
  });
  
  isClicking = true;
  updateButtonStates();
});

document.getElementById('stopClicking').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: stopAutoClicking
  });
  
  isClicking = false;
  updateButtonStates();
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'ELEMENT_SELECTED') {
    document.getElementById('startClicking').disabled = false;
  }
});

function updateButtonStates() {
  document.getElementById('startClicking').disabled = isClicking;
  document.getElementById('stopClicking').disabled = !isClicking;
}

// Khởi tạo trạng thái ban đầu
updateButtonStates(); 