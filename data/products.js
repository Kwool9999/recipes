// 엄마 추천 탭 데이터. 엄마가 추천해 준 제품을 종류별 그룹에 추가한다.
// 엄마가 한 말은 momSays에 그대로 적고, 찾아본 내용은 tip에 따로 적는다.
//
// productGroup({
//   id: "sauce",
//   title: "장, 양념",
//   emoji: "🧂",
//   items: [
//     {
//       name: "제품 이름",            // 필수
//       brand: "브랜드",
//       summary: "한 줄 설명",
//       momSays: "엄마가 추천하며 한 말",
//       uses: ["이럴 때 써요"],
//       where: "어디서 사는지",
//       price: "가격대",
//       image: "img/products/파일.jpg",
//       tip: "찾아본 내용",
//       link: { title: "링크 이름", url: "https://..." }
//     }
//   ]
// });

productGroup({
  id: "dried",
  title: "건어물",
  emoji: "🐟",
  items: [
    {
      name: "용대리 황태채",
      brand: "황태덕장 · 바다원",
      summary: "황태를 먹기 좋게 찢어 놓은 것. 손질할 필요 없이 바로 국에 넣을 수 있어요. 한 봉지 200g.",
      momSays: "국 끓일 때 이게 제일 맛있다.",
      uses: ["황태콩나물국 (한 번에 60g 정도 들어가요)"],
      where: "롯데백화점 식품관",
      price: "200g 15,000원",
      image: "img/products/yongdaeri-hwangtaechae.jpg",
      tip: "봉지 라벨에는 **구입 후 냉동 보관**하라고 적혀 있어요. 원재료는 명태 100%(러시아산)예요.",
      link: { title: "황태콩나물국 레시피 보기", url: "#/r/hwangtae-kongnamul-guk" }
    }
  ]
});