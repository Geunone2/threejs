# Three.js 시작하기


## ✔️ Installation 설치

### 프로젝트 구조

모든 Three.js 프로젝트에는 웹페이지를 정의하기 위한 HTML 파일, three.js 코드를 실행하기 위한 JavaScript 파일이 최소 하나씩 필요하다. 아래의 구조와 명명 규칙은 필수가 아니지만, 일관성을 위해 이 가이드 전반에서 사용된다.

- **index.html**

```jsx
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>My first three.js app</title>
		<style>
			body { margin: 0; }
		</style>
	</head>
	<body>
		<script type="module" src="/main.js"></script>
	</body>
</html>
```

- **main.js**

```jsx
import * as THREE from 'three';

...
```

- **public/**
    - `public/`**폴더**는 안에 있는 파일들이 변경되지 않는 상태 그대로 웹사이트로 반영되기 때문에, **`static`폴더**로도 불린다. 일반적으로 텍스터, 오디오, 3D 모델 파일들이 이곳에 저장된다.

이제 기본 프로젝트 구조를 설정하였으니, 로컬에서 프로젝트를 실행하고 웹 브라우저로 접근할 방법이 필요하다.
설치와 로컬 개발은 npm과 빌드 도구를 사용하거나, CDN에서 Three.js를 불러오는 방법으로도 가능하다.
두 가지 방법에 대해서는 아래 섹션에서 소개한다.

## ✔️ NPM & build tool로 설치

### Development

대부분은, [npm 패키지 레지스트리](https://www.npmjs.com/)에서 설치하고 빌드 도구를 사용하는 것을 권장한다.
프로젝트에 필요한 의존성이 많을수록 정적 호스팅만으로는 쉽게 해결할 수 없는 문제에 직면할 가능성이 커질 수 있다.
빌드 도구를 사용하여, 로컬 JavaScript 파일과 npm 패키지를 import maps 없이, 바로 사용할 수 있다.

1. [Node.js](https://nodejs.org/ko)를 설치한다. 의존성을 관리하고 빌드 도구를 실행하는 데 필요하다.
2. 프로젝트 폴더에서 터미널을 열고, Three.js와 빌드 도구인 [Vite](https://vite.dev/)를 설치한다. Vite는 개발 중에 사용되지만, 최종 웹페이지에는 포함되지 않는다. 다른 빌드 도구를 써도 상관없다. - 현재 ES 모듈을 가져올 수 있는 최신 빌드 도구를 지원한다.

```json
# three.js
npm install --save three

# vite
npm install --save-dev vite
```

1. 터미널에서 vite를 실행한다.

```json
npx vite
```

1. 모든 것이 잘 되었다면, 터미널에 `http://localhost:5173`와 같은 URL이 나타날 것이다.
해당 URL에서 웹 애플리케이션을 확인할 수 있다.

물론, 페이지는 비어 있을 것이다. - 이제 scene을 생성할 준비가 된 것이다.

계속 진행하기 전에, 이러한 도구에 대해 더 알고 싶다면 다음 링크를 참조.

- [**three.js journey: Local Server**](https://threejs-journey.com/lessons/first-threejs-project)
- [**Vite: Command Line Interface**](https://vite.dev/guide/cli.html)
- [**MDN: Package management basics**](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Package_management)

### Production

추후, 웹 애플리케이션을 배포할 준비가 되었다면, Vite에게 프로덕션 빌드를 실행하면 된다. - **`npx vite build`**

애플리케이션에서 사용된 모든 파일이 컴파일, 최적화된 후 **`dist/` 폴더**에 복사된다. 이 폴더의 내용은 웹사이트에서 바로 호스팅할 수 있도록 준비된 상태이다.

### 참고

Three.js에 관한 예제나 소개에 대해 지속적으로 업데이트 할 예정이니 필요하다면 들어와서 한 번씩 읽어보는 것을 추천드립니다.. !! 

[Three.js](https://www.notion.so/Three-js-1a01ece0be128002ae67d2cee4c172ba?pvs=21)
