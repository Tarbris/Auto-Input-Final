// content.js

// 定义默认要填写的表单字段（英文）
var inputValues_EN = {
    family_name: "Applied",
    family_name_kana: "オウヨウ",
    given_name: "Science",
    given_name_kana: "カガク",
    mail: "applied.data.science@example.com",
    phone: "080-1234-5678",
    postcode: "980-8578",
    province: "Miyagi",
    city: "sendaishi,aobaku",
    add_detailed: "1-2-3 aramakijiaoba",
    username: "applied_data_science"
  };
  
  // 定义默认要填写的表单字段（日文）
  var inputValues_JP = {
    family_name: "応用",
    family_name_kana: "オウヨウ",
    given_name: "科学",
    given_name_kana: "カガク",
    mail: "applied.data.science@example.com",
    phone: "080-1234-5678",
    postcode: "980-8578",
    province: "宮城県",
    city: "仙台市青葉区",
    add_detailed: "荒巻字青葉1-2-3",
    username: "applied_data_science"
  };
  
  function autoFillInputs() {
    // 1. 获取页面中 meta[name="page-language"] 的 content 属性
    const metaTag = document.querySelector('meta[name="page-language"]');
    // 如果没有找到，就默认为英文
    const pageLang = metaTag ? metaTag.getAttribute("content") : "en";
  
    // 2. 根据 pageLang 选择对应的 inputValues
    let inputValues;
    if (pageLang.toLowerCase() === "jp") {
      inputValues = inputValues_JP;
    } else {
      // 默认或 "en"
      inputValues = inputValues_EN;
    }
  
    // 3. 遍历每个表单字段并赋值
    for (const [name, value] of Object.entries(inputValues)) {
      const input = document.querySelector(`input[name="${name}"]`);
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }
  
  // 4. 脚本注入后，直接执行自动填表（可按需注释掉）
  autoFillInputs();
  