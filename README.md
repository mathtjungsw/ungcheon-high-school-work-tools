# 웅천고등학교 업무 웹툴 모음

교직원이 자주 사용하는 업무용 웹사이트와 웹툴을 한곳에서 관리하고 바로 열 수 있는 정적 웹페이지입니다.

## 바로가기

- [웅천고등학교 업무 웹툴 모음](https://mathtjungsw.github.io/ungcheon-high-school-work-tools/)
- [과목 선택 도우미](https://mathtjungsw.github.io/ungcheon-high-school-work-tools/course-selection.html)
- [1학년 과목 선택 도우미](https://mathtjungsw.github.io/ungcheon-high-school-work-tools/course-selection-grade1.html)
- [2학년 과목 선택 도우미](https://mathtjungsw.github.io/ungcheon-high-school-work-tools/course-selection-grade2.html)

## 주요 기능

- 코드에 등록된 학교 업무 웹툴 제공
- 제목·설명·담당 부서 실시간 검색
- 담당 부서 태그 표시
- 데스크톱·태블릿·모바일 반응형 화면

## 웹툴 관리

웹툴은 `app.js`의 `TOOLS` 목록에서 관리합니다. 방문자가 화면에서 웹툴을 추가·수정·삭제할 수는 없습니다.

## 로컬 실행

별도 빌드 과정 없이 `index.html`을 열어 사용할 수 있습니다. 로컬 웹 서버를 사용하려면 다음 명령을 실행하세요.

```bash
python -m http.server 8000
```

이후 `http://localhost:8000`으로 접속합니다.
