console.log("Content script loaded");

function getEmailContentElement() {
  const selectors = [
    '.h7',
    '.a3S.aiL',
    '.ii gt', 
    '.gmail_quote',
    '[role="presentation"]' 
    // '.a3S.aiL',            // Gmail email body container
    // 'div[dir="ltr"]',      // Actual text node
    // '.ii.gt',              // Thread messages
    // '.gmail_quote'
  ];
  for (const selector of selectors) {
    const content = document.querySelector(selector);
    if (content) {
      console.log("Email content found using selector:", content.innerText.trim());
      return content.innerText.trim();
    }
  }
  return '';  
}

function findComposeToolbar() {
  const selectors = [
    '.aDh', // Gmail compose toolbar class
    '.btC', // Another possible Gmail compose toolbar class
    '[role="toolbar"]',
    '.gU.Up' // Toolbar within dialog
  ];
  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) {
      return toolbar;
    }
  }
  return null;  
}  


function createAIButton(){
  const button=document.createElement('div');
  button.className='T-I J-J5-Ji aoO v7 T-I-atl L3';
  button.style.marginLeft='8px';
  button.innerHTML='AI Reply';
  button.setAttribute('role','button');
  button.setAttribute('data-tooltip','generate AI Reply');
  return button;
}

function injectCustomButton() {
  const existingButton = document.querySelector('.custom-reply-button');
  if (existingButton) {
    existingButton.remove(); // Button already exists, do not inject again
  }

  const toolbar=findComposeToolbar();
  if(!toolbar) {
    console.log("Toolbar not found");
    return;
  }

  console.log("Toolbar found, Injecting custom button");
  const button=createAIButton();
  button.classList.add('custom-reply-button');

  button.addEventListener('click', async () => {
    try {
      button.innerHTML = 'Generating...';
      button.disabled = true;

      const emailContentElement = getEmailContentElement();
      // const emailText = emailContentElement?.innerText || "";
      console.log("Email content to send to backend:", emailContentElement);
      const response = await fetch('http://localhost:8080/api/email/generate',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          emailContent: emailContentElement,
          tone: "professional"
        })
      });

      if(!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const generatedReply=await response.text();

      const composeBox = document.querySelector('[g_editable="true"],[role="textbox"]');

      if(composeBox) {
        composeBox.focus();
        document.execCommand('insertText', false, generatedReply);
      } else {
        console.error("Compose box not found");
      }
    } catch (error) {
      console.error(error);
      alert('Error generating AI reply. Please try again.');
    }finally {
      button.innerHTML = 'AI Reply';
      button.disabled = false;
    }
  });

  toolbar.insertBefore(button, toolbar.firstChild); // Insert button at the start of the toolbar
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {

    // Convert NodeList of newly added DOM nodes into an array
    const addedNodes = Array.from(mutation.addedNodes);

    // Check if any added node is a compose-related element
    const hasComposeElement = addedNodes.some(node => 

    // Ensure the node is an HTML element (not text/comment)  
    node.nodeType === Node.ELEMENT_NODE && 
    ((node.matches('.aDh, .btC, [role="dialog"]')) || node.querySelector('.aDh, .btC, [role="dialog"]') // Gmail compose window classes
    ));

    if(hasComposeElement) {
      console.log("Compose window detected");
      // Perform actions when compose window is detected
      // For example, inject custom UI or modify existing elements
      setTimeout(injectCustomButton, 500); // Delay to ensure elements are fully loaded
    }
  }
});

// Start observing changes in the DOM
observer.observe(document.body, {
  childList: true, // Watch for addition or removal of child nodes
  subtree: true    // Observe the entire DOM tree, not just body’s direct children
});