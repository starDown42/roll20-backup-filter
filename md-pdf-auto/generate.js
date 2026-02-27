// generate-paged-pdf.js
const puppeteer = require("puppeteer");
const path = require("path");

(async () => {
  try {
    // 1. 브라우저 실행
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // 2. 로컬 HTML 파일 경로
    const filePath = "file://" + path.resolve("output.html");

    await page.goto(filePath, { waitUntil: "networkidle0" });

    // 3. Paged.js 렌더 완료 대기
    await page.waitForFunction(() => {
      return window.Paged && document.querySelector(".pagedjs_page");
    }, { timeout: 60000 }); // 최대 60초 대기

    console.log("Paged.js 렌더 완료, 페이지 수:", await page.evaluate(() => document.querySelectorAll(".pagedjs_page").length));

    // 4. PDF 생성
    await page.pdf({
      path: "result.pdf",
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,  // @page CSS 우선 적용
      margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" }
    });

    console.log("PDF 생성 완료: result.pdf");

    await browser.close();

  } catch (err) {
    console.error("PDF 생성 중 오류 발생:", err);
  }
})();