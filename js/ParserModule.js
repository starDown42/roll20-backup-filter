const ParserModule = (function () {
    // prettier 설정
    const prettierConfig = {
        arrowParens: "always",
        bracketSameLine: false,
        objectWrap: "preserve",
        bracketSpacing: true,
        semi: true,
        experimentalOperatorPosition: "end",
        experimentalTernaries: false,
        singleQuote: true,
        jsxSingleQuote: false,
        quoteProps: "as-needed",
        trailingComma: "all",
        singleAttributePerLine: false,
        htmlWhitespaceSensitivity: "css",
        vueIndentScriptAndStyle: false,
        proseWrap: "preserve",
        insertPragma: false,
        printWidth: 9999,
        requirePragma: false,
        tabWidth: 4,
        useTabs: true,
        embeddedLanguageFormatting: "off"
    };

    // 공통:: 수정 시 추가옵션 - 온점 > 말줄임표
    const edit_dotToEllipsis= (oriHtmlStr) => {
        return oriHtmlStr.replace(/\.{2,}/g, function(match) {
            var len = match.length;
            if (len <= 4) return '…';
    
            // 6개 이상일 경우
            var count = Math.floor(len / 3) + (len % 3 > 0 ? 1 : 0);
            return '…'.repeat(count);
        });
    }

    // 공통:: 수정 시 추가옵션
    const editOption = {
        "dot_to_ellipsis" : edit_dotToEllipsis // 온점 > 말줄임표
    }

    // 공통:: html 파일 파싱
    const parseHtmlFile = async (oriHtmlStr, optionForm) => {
        // Parser 선언
        const parser = new DOMParser();

        let editHtmlStr = oriHtmlStr;

        // 업로드한 html 파일에 대하여 Prettier 오토 포맷팅 적용, string 형태로 저장
        editHtmlStr = await prettier.format(editHtmlStr, {
            parser: "html",
            plugins: [prettierPlugins.html],
            ...prettierConfig,
        });

        //for(optionForm) 옵션에 따라 html 원본 str 수정
         optionForm.querySelectorAll('input').forEach(input => {
            if(input.checked && editOption[input.id]){
                editHtmlStr = editOption[input.id](editHtmlStr);
            }
        });

        // string to doc 객체
        const doc = parser.parseFromString(editHtmlStr, 'text/html');
        return doc;
    }

    // 코코포리아 추출 모듈
    const CCFParserModule = {
        outputTxt : "", // 전체 결과
        messages : "", // 메시지 개체 ("저널명":"대사 목록")
        init : function (fileInput, execBtn, optionForm, outputArea, outputCopyBtn, outputLength,
                        journalOutputArea, journalTxtCopyBtn, journalSelectBox, journalOutputLength) {

            // 텍스트 추출 결과 복사 이벤트
            outputCopyBtn.onclick = () => {
                navigator.clipboard.writeText(outputArea.value);
                alert(`전체 출력 결과가 클립보드에 복사되었습니다.`);
            };
            
            // 저널 변경 이벤트
            journalSelectBox.onchange = () => {
                let selectedKey = journalSelectBox.value;
                let message = messages[selectedKey] ? messages[selectedKey].join("\n\n") : "";
                journalOutputArea.value = message;
                journalOutputLength.innerHTML = ` (공백 포함: ${message.length} / 미포함 ${message.replace(/\s+/g, '').length})`;
            }

            // 저널별 대사 추출 결과 복사 이벤트
            journalTxtCopyBtn.onclick = () => {
                if (journalSelectBox.value != 0) {
                    navigator.clipboard.writeText(journalOutputArea.value);
                    alert(`저널별 대사 출력 결과가 클립보드에 복사되었습니다.`);
                } else {
                    alert("저널을 선택해주세요.");
                    return;
                }
            };

            // 텍스트 추출 로직
            execBtn.onclick = async () => {
                if (!fileInput.files.length) return alert('HTML 파일을 선택하세요.');

                const reader = new FileReader();
                reader.onload = async function (event) {
                    // 기존 값 초기화
                    outputArea.value = "";
                    journalOutputArea.value = "";
                    journalSelectBox.innerHTML = '<option value="0">선택</option>';

                    // 원본 html Str
                    let oriHtmlStr = event.target.result;

                    // string to doc 객체 (포맷팅 + 수정사항 적용용)
                    const doc = await parseHtmlFile(oriHtmlStr, optionForm);

                    // 결과 저장용 초기화
                    outputTxt = '';
                    messages = {};

                    // 사이트를 통해 다운로드 받은 코드는 .gap 개체 단위로 문자가 형성되므로 foreach 반복 순회
                    doc.querySelectorAll('.gap').forEach(gap => {
                        // 내부에서 span 개체 목록 저장
                        let spans = gap.querySelectorAll('p span');

                        // ─────────────저널 이름 추출────────────
                        let nameParts = [];
                        if (spans[0].textContent.trim()) { // 탭 이름(메인/비밀/정보 등) 있으면 대괄호에 집어넣기
                            nameParts.push(`[${spans[0].textContent.trim()}]`);
                        }
                        // 맨 뒤 span (대사) 제외 조회
                        for (let i = 1; i < spans.length - 1; i++) {
                            // 대사 제외한 span 값 모두 저장 (비밀 탭+이름 등의 예외사항 적용을 위함)
                            let text = spans[i].textContent.trim();
                            if (text) nameParts.push(text);
                        }
                        const name = nameParts.join(' ');
                        // ─────────────────────────


                        // 실제 대사 추출
                        let textElem = spans[spans.length - 1];
                        const text = textElem.textContent.trim();

                        // 전체 출력 결과물에 이름::(탭)대사(줄바꿈) 형식으로 추가
                        outputTxt += `${name}::\t${text}\n`;

                        // 저널별 메시지 개체에 추가가
                        if (messages[name]) {
                            messages[name].push(text);
                        } else {
                            messages[name] = [text];
                        }
                    });

                    // 파싱 작업 끝나면 전체 결과 txtArea 에 결과 추가 및 글자수 표시
                    outputArea.value = outputTxt;
                    outputLength.innerHTML = ` (공백 포함: ${outputTxt.length} / 미포함 ${outputTxt.replace(/\s+/g, '').length})`;

                    // Select box 저널목록 추가 (정렬 후)
                    Object.keys(messages)
                        .sort()
                        .forEach(key => {
                            let option = document.createElement("option");
                            option.value = key;
                            option.textContent = key;
                            journalSelectBox.appendChild(option);
                        });

                    alert("텍스트 추출이 완료되었습니다.")
                };

                reader.readAsText(fileInput.files[0]);
            }
        }
    }

    // ROLL20 추출 모듈
    const ROLL20ParserModule = {


    }

    return {
        CCFParserModule,
        ROLL20ParserModule
    }
})();
