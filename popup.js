// popup.js

document.addEventListener("DOMContentLoaded", () => {
    const fillBtn = document.getElementById("fillInputs");
    const analyzeBtn = document.getElementById("analyzeForm");
  
    // 1. Auto-fill
    if (fillBtn) {
      fillBtn.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["content.js"]
          });
        });
      });
    }
  
    // 2. Analyze form (LLM)
    if (analyzeBtn) {
      analyzeBtn.addEventListener("click", async () => {
        try {
          // Prompt user to enter Google Generative Language API Key (Gemini)
          const userKey = prompt("Please input your Gemini API Key:");
          if (!userKey) {
            alert("No API Key was provided. Analysis cannot continue.");
            return;
          }
  
          // Get the current active tab
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (!tab?.id) {
            alert("Unable to retrieve the active tab.");
            return;
          }
  
          // Inject a script in the page to retrieve the entire HTML
          const htmlContent = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.documentElement.outerHTML
          });
  
          if (!htmlContent || !htmlContent[0]?.result) {
            alert("Unable to retrieve HTML content.");
            return;
          }
  
          // Use the retrieved HTML as the user prompt
          const user_prompt = `\`${htmlContent[0].result}\``;
  
          // Define the system prompt
          const sys_prompt = `You are a helpful assistant designed to extract information from HTML forms.
  
  Task: Analyze an HTML form snippet and determine the shortest possible XPath expressions for specific form fields. **Each XPath should locate a single, specific input or relevant element for the corresponding field name.**
  
  Input: An HTML snippet representing a web form.
  
  Output: A plain text JSON object. Keys are Japanese form field names, values are the corresponding XPath expressions that uniquely identify those fields in the HTML.
  
  Fields to find:
  *   氏名 (Full Name)
  *   姓 (Family Name/Last Name)
  *   名 (Given Name/First Name)
  *   郵便番号 (Postal Code/Zip Code)
  *   住所 (Address)
  *   ユーザー名 (Username)
  *   メールアドレス (Email Address)
  
  Constraints:
  *   **Each XPath MUST uniquely identify only one element and MUST NOT reference other fields.**
  *   XPath expressions MUST be as short and efficient as possible. Prioritize \`name\`, then \`placeholder\`, then \`aria-label\`, and lastly label text if necessary. Choose the most unique single attribute if possible.
  *   Only include fields present in the HTML.
  *   Output only the JSON object in plain text. Do not use Markdown.
  *   JSON format: \`{"field_name": "xpath", ...}\`
  
  Instructions:
  1. I will provide you with the HTML of a form.
  2. Parse the HTML.
  3. For each field, find the shortest suitable XPath that uniquely identifies it **without referencing other fields in the expression**.
  4. Output the results as a plain text JSON object in the specified format, without using any Markdown.`;
  
          // Use the user-provided Key as the request URL
          const url = `${userKey}`;
  
          // Send the request to the Google Generative Language API (example)
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              "system_instruction": {
                "parts": {
                  "text": sys_prompt
                }
              },
              "contents": {
                "parts": {
                  "text": user_prompt
                }
              },
              "generationConfig": {
                "response_mime_type": "application/json"
              }
            })
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const result = await response.json();
          // Parse the returned structure
          const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  
          if (text) {
            alert(text);
          } else {
            alert("The LLM returned no data or the response parsing failed.");
          }
  
        } catch (error) {
          console.error(error);
          alert("Failed to analyze the form. Please check the console for details.");
        }
      });
    }
  });
  