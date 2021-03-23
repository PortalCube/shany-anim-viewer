# shany-anim-viewer

초간단 샤이니 컬러즈 스파인 애니메이션 뷰어

https://portalcube.github.io/shany-anim-viewer

## 특징

-   아주 아주 심플함
-   얼굴, 입, 눈 애니메이션을 따로 적용시키는 기능
-   드래그 앤 드롭으로 Spine 데이터를 불러오는 기능 (한번에 3개의 데이터를 모두 드롭해야함)
-   배경 색상 지정 가능

## 주의사항

-   화면이 작은 기기에서 화질이 저하되는 문제 있음
-   이 저장소는 [Spine 공식 예제](https://github.com/EsotericSoftware/spine-runtimes/tree/3.6/spine-ts/webgl/example)를 수정하여 제작되었습니다.

## 애셋에 관하여

애셋 데이터는 저장소에 직접적으로 커밋하지 않고, Release에 첨부하여 업데이트됩니다.

애셋 데이터에 대한 메타데이터는 asset.json에 담겨있으며, 메타데이터는 asset_updater.js로 생성할 수 있습니다. (Node.js가 필요합니다.)

현재는 https://shinycolors.info 에서 리소스를 받아서 사용하고 있습니다. (정말 감사합니다!)
