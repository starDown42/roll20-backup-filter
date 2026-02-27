const fs = require("fs");
const { marked } = require("marked");

const md = fs.readFileSync("input.md", "utf8");
const htmlContent = marked(md);

const template = fs.readFileSync("template.html", "utf8");
const finalHtml = template.replace("{{content}}", htmlContent);

fs.writeFileSync("output.html", finalHtml);

console.log("HTML 생성 완료");