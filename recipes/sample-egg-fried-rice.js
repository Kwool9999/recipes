recipe({
  id: 'sample-egg-fried-rice',
  title: '(예시) 대파 계란볶음밥',
  description: '화면 구성을 보기 위한 예시 레시피예요. 실제 레시피가 들어오면 지워집니다.',
  status: 'complete',
  servings: '1인분',
  time: '10분',
  tags: ['밥', '간단'],
  ingredients: [
    {
      items: [
        { name: '찬밥', amount: '1공기' },
        { name: '계란', amount: '2개' },
        { name: '대파', amount: '1/2대', note: '송송 썰기' },
        { name: '식용유', amount: '2큰술' },
      ],
    },
    {
      group: '양념',
      items: [
        { name: '간장', amount: '1큰술' },
        { name: '소금', amount: '약간' },
        { name: '참기름', amount: '1작은술' },
      ],
    },
  ],
  steps: [
    {
      text: '팬에 식용유를 두르고 대파를 넣어 **약불**에서 ==2분== 볶아 파기름을 낸다.',
      tip: '파가 노릇해지기 직전까지만 볶아야 쓴맛이 안 나요.',
    },
    {
      text: '파를 한쪽으로 밀고 계란을 풀어 넣어 스크램블한다.',
    },
    {
      text: '불을 **센불**로 올리고 밥을 넣어 주걱으로 눌러가며 볶는다.',
      warning: '갓 지은 뜨거운 밥은 질어져요. 찬밥이나 한 김 식힌 밥을 쓰세요.',
    },
    {
      text: '팬 가장자리에 간장을 둘러 ==10초== 태우듯 끓인 뒤 섞고, 소금으로 간을 맞춘다. 불을 끄고 참기름을 두른다.',
    },
  ],
  tips: ['굴소스 반 큰술을 넣으면 감칠맛이 올라가요.'],
  notes: '',
});
