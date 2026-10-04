recipe({
  id: 'gyeran-guk',
  title: '계란국',
  description: '김대석 셰프 레시피. 멸치 다시마 육수에 계란을 풀고 다진 새우젓으로 시원하게 간을 해요.',
  status: 'complete',
  time: '15분',
  tags: ['국', '계란'],
  source: { url: 'https://www.youtube.com/watch?v=0BvCirgQNb8', label: '김대석 셰프 영상 보기', title: '김대석 셰프TV - 계란국' },
  ingredients: [
    {
      items: [
        { name: '계란', amount: '3개' },
        { name: '소금', amount: '2꼬집', note: '계란 풀 때' },
        { name: '물', amount: '1L', note: '5컵' },
        { name: '중멸치', amount: '반 줌' },
        { name: '건다시마', amount: '5g' },
        { name: '대파', amount: '15cm' },
      ],
    },
    {
      group: '양념',
      items: [
        { name: '새우젓', amount: '1/2스푼', note: '잘게 다져서' },
        { name: '다진 마늘', amount: '1/2스푼' },
        { name: '국간장', amount: '1/2스푼' },
      ],
    },
  ],
  steps: [
    {
      text: '끓는 물 ==1L==에 멸치와 다시마를 넣고 ==5분== 끓인다.',
      timestamp: 30,
    },
    {
      text: '끓이는 동안 계란의 알끈을 떼어내고, 소금 2꼬집을 넣어 살짝만 푼다.',
      timestamp: 50,
      tip: '오래 풀지 않아도 돼요. 살짝만 풀어요.',
    },
    {
      text: '새우젓을 잘게 다지고 대파를 썬다.',
      timestamp: 75,
      tip: '새우젓을 다져야 건더기가 돌아다니지 않고 국물이 깔끔해요. 새우젓이 들어가면 국물이 시원해져요.',
    },
    {
      text: '5분이 지나면 다시마를 먼저 건지고, 멸치는 ==2분== 더 끓인 뒤 건진다.',
      timestamp: 92,
      tip: '멸치를 조금 더 끓여야 국물이 진하게 우러나요.',
    },
    {
      text: '국물이 끓고 있을 때 계란물을 붓고, 젓지 않고 ==20초== 그대로 둔다.',
      timestamp: 110,
      warning: '계란물을 붓자마자 젓지 않아요. 그대로 둬야 계란이 몽글몽글해져요.',
    },
    {
      text: '20초가 지나면 한 번만 저어 주고, 다진 마늘과 다진 새우젓을 넣는다.',
      timestamp: 120,
    },
    {
      text: '대파를 넣고 국간장을 넣어 마무리한다.',
      timestamp: 140,
    },
  ],
  tips: [
    '참고: 컵은 200ml(종이컵 가득 1컵) 기준이에요. 영상의 나무숟가락은 집에서 쓰는 밥숟가락보다 약간 커요.',
  ],
});
