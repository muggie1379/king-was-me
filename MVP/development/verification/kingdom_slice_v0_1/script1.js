(() => {
  const $ = (id) => document.getElementById(id);

  // DESIGN NOTE — FIRST READING CHARACTER LABELS:
  // 대화 화자 태그는 이름만 사용한다.
  // 의견 카드가 "이름 · 직함" 매핑을 담당한다.
  // 1회차: 세르안 · 재상 / 발렌 · 원수 / 리안 · 외교관 / 카르덴 · 수호관
  // 2회차: 세르안 · 판단 / 발렌 · 행동 / 리안 · 관계 / 카르덴 · 경계
  // 같은 카드 위치에서 라벨이 바뀌며 직함→기능 재해석이 일어나도록 한다.
  const advisorMeta = {
    chancellor:{name:"세르안",role:"재상",icon:"衡"},
    marshal:{name:"발렌",role:"원수",icon:"⚔"},
    envoy:{name:"리안",role:"외교관",icon:"✦"},
    warden:{name:"카르덴",role:"수호관",icon:"▣"}
  };

  const makeInitialState = () => ({
    eventIndex:0,
    stage:"intro",
    pendingAdvance:null,
    initiative:0,
    caution:0,
    reciprocity:0,
    pressure:0,
    selfProtection:0,
    uncertainty:0,
    warmth:0,
    choiceHistory:{},
    logs:[],
    silenceCount:0,
    reframeBleedSeen:false
  });

  let state = makeInitialState();

  // DESIGN NOTE — BRANCHING:
  // Event 4(늦은 답신)의 진입 맥락은 "history first, stats second".
  // 최근 실제 선택 이력을 우선하고, 누적 수치는 최종 fallback에서만 보조로 사용한다.
  // 과거 v5.2/v5.3에서 choice ID 불일치로 분기가 깨진 적이 있으므로
  // choice.id는 구조적 계약으로 취급하고 임의 변경하지 않는다.
  function getLateReplyVariant(s){
    const festival = s.choiceHistory && s.choiceHistory["festival"];
    const second = s.choiceHistory && s.choiceHistory["second_envoy"];

    if(festival === "propose_next") return "active";
    if(festival === "stay_longer" || festival === "festival_pastry") return "mutual";
    if(festival === "end_warmly") return "cautious";

    if(second === "warmer_welcome") return "active";
    if(second === "match_effort") return "mutual";
    if(second === "observe_more") return "cautious";

    if(s.initiative >= s.caution + 2) return "active";
    if(s.caution >= s.initiative + 2) return "cautious";
    return "mutual";
  }

  function getLateReplyBranchLabel(s){
    return {
      active:"적극형 — 최근 우리가 먼저 속도를 냈던 관계",
      mutual:"상호형 — 서로 비슷한 온도로 이어오던 관계",
      cautious:"신중형 — 좋은 분위기를 남기고 지켜보던 관계"
    }[getLateReplyVariant(s)];
  }

  function getEvent5Variant(s){
    const last = s.choiceHistory?.late_reply;

    if(last === "propose_meeting") return "active";
    if(last === "wait") return "cautious";
    if(last === "lower_contact") return "protective";
    if(last === "check_in") return "mutual";

    return "fallback";
  }

  function getEvent5BranchLabel(s){
    const variant = getEvent5Variant(s);
    return {
      active:"적극형 — 우리가 먼저 청한 회담",
      cautious:"신중형 — 상대가 먼저 꺼냈던 회담",
      protective:"자기보호형 — 이미 낮춰둔 공식 회담",
      mutual:"상호형 — 서신 왕래 중 자연스럽게 잡힌 회담",
      fallback:"기본형 — 예정되어 있던 회담"
    }[variant];
  }

  // DESIGN NOTE — STRONG BRANCH AFTER PAUSE_CONTACT:
  // Event 5의 pause_contact는 단순한 분위기 변화가 아니라
  // 관계 상태 자체를 바꾸는 강한 선택이다.
  // 따라서 Event 6은 공통 Empty Border로 바로 합류하지 않고,
  // 우리가 먼저 비공식 교류를 멈춘 상태를 별도 맥락으로 보여준다.
  // "강한 선택 → 강한 분기" 원칙.
  function getEvent6Variant(s){
    const last = s.choiceHistory?.canceled_meeting;
    if(last === "pause_contact") return "closed_by_us";
    return "default";
  }

  // DESIGN NOTE — CHOICE SPECIFICITY:
  // 선택지는 "행동의 의미" 수준으로 맞춘다.
  // 구체적인 소품/문장(예: 차, 과자)은 aftermath에서 장면으로 구체화한다.
  // 같은 선택 화면 안에서 한 선택지만 지나치게 구체적으로 보이지 않게 한다.

  const events = [
    {id:"coronation_ledger",title:"첫 장부",chapter:"작은 왕국",description:"즉위 첫날, 왕실 창고의 장부와 실제 재고가 맞지 않는다.",intro:[{speaker:"서기관",text:"곡물 스무 자루가 기록과 맞지 않습니다."},{speaker:"세르안",text:"원인은 아직 모릅니다. 오늘 배급은 별도로 결정해야 합니다."}],opinions:[["chancellor","원인을 확정하지 말고 장부와 창고를 함께 확인해야 합니다."]],choices:[{id:"audit_ration",text:"배급을 유지하며 장부를 대조한다.",effects:{caution:1},log:"배급을 유지하고 장부를 대조했다.",aftermath:[{type:"narration",text:"배급은 예정대로 나갔다. 밤에 수레 하나의 기록 착오가 드러났다."}]},{id:"seal_store",text:"창고를 봉인하고 조사한다.",effects:{selfProtection:2},log:"창고를 봉인하고 재고부터 조사했다.",aftermath:[{type:"narration",text:"재고는 보존됐지만 배급이 늦어져 시장의 빵값이 올랐다."}]},{id:"use_reserve",text:"비축분으로 부족분을 메운다.",effects:{initiative:2},log:"비축분으로 부족분을 메웠다.",aftermath:[{type:"narration",text:"배급은 흔들리지 않았다. 겨울 비축량에는 붉은 표시가 남았다."}]}]},

    {
      id:"first_envoy", title:"동부 왕국의 첫 사절", chapter:"동쪽에서 온 사절",
      description:"아침의 왕궁. 정문 쪽에서 평소보다 긴 종소리가 울렸다.\\n곧이어 문지기가 왕실 회의실로 급히 들어온다.",
      intro:[
        {type:"narration",text:"아침. 왕궁 바깥에서 종소리가 울린다."},
        {speaker:"문지기",text:"폐하. 동부 변경에서 사절단이 도착했습니다."},
        {speaker:"세르안",text:"동부 왕국이라… 최근 직접적인 왕래는 없었던 곳입니다. 온 이유부터 듣지요."},
        {speaker:"발렌",text:"병력은?"},
        {speaker:"문지기",text:"호위병 여섯. 무장은 의례용 수준입니다."},
        {speaker:"발렌",text:"위협은 아니군."},
        {speaker:"세르안",text:"모든 문제를 병력 수로 판단하실 겁니까?"},
        {speaker:"발렌",text:"전쟁은 그렇게 시작됩니다."},
        {type:"narration",text:"왕의 허락이 떨어지자 거대한 문이 열리고 동부 왕국의 사절이 천천히 회의실 안으로 들어온다."},
        {speaker:"동부 사절",text:"동부 왕국의 왕께서 귀국의 번영을 기원합니다."},
        {speaker:"동부 사절",text:"앞으로 두 나라가 서로 교류할 수 있기를 희망한다는 뜻을 전하라 하셨습니다."},
        {type:"narration",text:"사절은 작은 나무 상자를 내민다. 동부 지역의 향신료와 차가 정갈하게 담겨 있다."},
        {speaker:"발렌",text:"값은 크지 않습니다."},
        {speaker:"세르안",text:"값이 작다는 건 사실입니다. 의미까지 작다는 뜻은 아닙니다."},
        {speaker:"발렌",text:"또 해석입니까."}
      ],
      opinions:[
        ["chancellor","첫 접촉 자체가 우호적이라는 건 사실입니다. 다만 선물과 인사가 앞으로의 관계까지 약속한 것은 아닙니다."],
        ["marshal","당장 대비할 위협은 없습니다. 어느 정도로 응답할지만 정하면 됩니다."]
      ],
      choices:[
        {id:"polite_welcome",text:"정중하게 맞이한다.",effects:{reciprocity:1,caution:1,warmth:1},log:"동부 왕국의 첫 사절을 정중히 맞이했다.",aftermath:[
          {type:"narration",text:"왕의 결정에 따라 사절은 정중한 환대를 받고, 동부 왕에게 감사의 뜻을 전해 받는다."},
          {type:"narration",text:"사절의 굳어 있던 표정이 조금 누그러진다."},
          {speaker:"발렌",text:"무난한 시작입니다."},
          {speaker:"세르안",text:"동의합니다. 아직은 그 이상을 붙일 이유도 없습니다."},
          {type:"narration",text:"사절단이 떠난 뒤, 왕궁 창가 너머로 동부의 깃발이 천천히 멀어진다."},
          {type:"narration",text:"며칠 후 — 양국은 예를 갖춘 첫 접촉을 마쳤다."}
        ]},
        {id:"proactive_exchange",text:"적극적인 교류를 먼저 제안한다.",effects:{initiative:2,warmth:2,pressure:1},log:"첫 만남에서 적극적인 교류를 제안했다.",aftermath:[
          {type:"narration",text:"왕의 결정에 따라 다음에는 이쪽에서 사절을 보내겠다는 뜻이 전달된다."},
          {speaker:"발렌",text:"좋습니다. 준비하겠습니다."},
          {speaker:"세르안",text:"먼저 움직이기로 한 건 분명합니다. 그 이유까지 우리가 안다고 생각하진 맙시다."},
          {speaker:"발렌",text:"이유는 몰라도 명령은 충분합니다."},
          {type:"narration",text:"사절단이 떠난 뒤, 왕실은 동부와의 추가 교류를 준비하기 시작한다."}
        ]},
        {id:"formal_observe",text:"형식적인 답변만 보내고 상황을 본다.",effects:{caution:2,selfProtection:1,uncertainty:1},log:"필요한 예만 갖춘 뒤 상대의 다음 행동을 기다렸다.",aftermath:[
          {type:"narration",text:"왕의 결정에 따라 필요한 예만 갖춘 답신이 전달된다."},
          {type:"narration",text:"사절은 잠시 머뭇거리지만 곧 예를 갖춰 물러난다."},
          {speaker:"발렌",text:"이번에는 움직이지 않으시는군요."},
          {speaker:"세르안",text:"아니면 저쪽이 다시 움직이는지 보려는 결정일 수도 있습니다. 어느 쪽인지는 아직 모릅니다."},
          {type:"narration",text:"사절단이 떠난 뒤, 왕궁은 평소의 일정으로 돌아간다. 동쪽에서 다시 무언가 올지는 아직 알 수 없다."},
          {type:"narration",text:"며칠 후 — 동부 사절은 답신을 기다린 채 돌아갔다."}
        ]},
        {id:"tea_in_box",text:"말 대신 작은 답례만 보낸다.",effects:{reciprocity:2,warmth:1,uncertainty:1},log:"동부의 선물 상자에 왕실 차를 담아 되돌려 보냈다.",aftermath:[
          {type:"narration",text:"왕실은 별도의 긴 답신 대신, 비워진 상자에 왕실 차 한 봉을 넣어 사절에게 돌려준다."},
          {speaker:"발렌",text:"답신이 이것뿐입니까?"},
          {speaker:"세르안",text:"이것도 답신입니다. 다만 뜻은 우리가 대신 정할 수 없겠군요."},
          {type:"narration",text:"사절은 상자를 받아 들고 예를 갖춘 뒤 돌아간다. 그 행동이 어떻게 읽힐지는 아직 알 수 없다."}
        ]}
      ]
    },
    {id:"north_patrol",title:"북부의 횃불",chapter:"흔들리는 국경",description:"북부 변경에서 정체를 알 수 없는 횃불 행렬이 관측됐다.",intro:[{speaker:"경비대장",text:"병력처럼 보이는 행렬이 국경 너머에서 움직였습니다."},{speaker:"발렌",text:"정찰대를 보내겠습니다."},{speaker:"세르안",text:"병력처럼 보인다는 말과 병력이라는 말은 다릅니다."}],opinions:[["chancellor","확인된 사실은 횃불의 수와 이동 방향뿐입니다."],["marshal","확인하려면 움직여야 합니다. 아무것도 하지 않는 것도 신호입니다."]],choices:[{id:"north_scout",text:"비무장 정찰대를 보낸다.",effects:{initiative:1,caution:1},log:"북부에 비무장 정찰대를 보냈다.",aftermath:[{type:"narration",text:"행렬은 피난민을 호송하는 북부 병사로 확인됐다."}]},{id:"north_fortify",text:"초소를 보강하고 지켜본다.",effects:{selfProtection:2,pressure:1},log:"북부 초소를 보강했다.",aftermath:[{type:"narration",text:"우리 초소가 밝아지자 북부 행렬도 국경 앞에서 멈췄다."}]},{id:"north_letter",text:"북부에 목적을 묻는다.",effects:{reciprocity:1},log:"북부에 행렬의 목적을 물었다.",aftermath:[{type:"narration",text:"사흘 뒤 피난민 호송 중이었다는 답이 왔다."}]}]},
    {
      id:"second_envoy", title:"두 번째 사절", chapter:"동쪽에서 온 사절",
      description:"며칠 뒤, 동쪽 망루에서 다시 깃발이 보였다.\\n이번에는 우리가 부른 사절이 아니다.",
      intro:[
        {type:"narration",text:"아침 안개가 걷히기도 전, 망루에서 봉화가 오른다."},
        {speaker:"망루병",text:"동부 깃발입니다! 지난번과 같은 문양입니다."},
        {speaker:"발렌",text:"또 왔군."},{speaker:"세르안",text:"이번에는 우리가 부른 것이 아닙니다."},
        {speaker:"발렌",text:"좋은 뜻으로 보면 되는 겁니까?"},{speaker:"세르안",text:"우호 신호인 것은 맞습니다. 그 이상의 의미는 아직 모릅니다."},
        {type:"narration",text:"문이 열리고 지난번과 같은 사절이 들어온다. 이번에는 공식 문서 외에 작은 개인 서신도 함께 들고 있다."},
        {speaker:"동부 사절",text:"우리 왕께서 지난 환대를 기쁘게 기억하고 계십니다."},
        {speaker:"동부 사절",text:"조만간 두 나라가 조금 더 편하게 이야기를 나눌 자리를 만들 수 있기를 바란다고 하셨습니다."},
        {type:"narration",text:"회의실 한쪽에서 낯선 인물이 조용히 미소 짓는다."},
        {speaker:"리안",text:"상대가 먼저 한 걸음 왔군요."},{speaker:"발렌",text:"누구지?"},
        {speaker:"리안",text:"한 걸음을 두 걸음으로 만들지 않게 도와드릴 사람입니다."},
        {type:"narration",text:"외교관이 처음으로 왕실 회의에 합류한다."}
      ],
      opinions:[
        ["chancellor","우호적인 신호인 것은 맞습니다. 그러나 친근함과 약속은 다른 문제입니다."],
        ["envoy","저쪽이 한 걸음 왔습니다. 우리도 한 걸음이면 충분합니다. 관계는 누가 더 많이 움직였는지 겨루는 일이 아닙니다."],
        ["marshal","기회라면 잡아야 합니다. 다음 교류를 먼저 확정할 수 있습니다."]
      ],
      courtExchange:[
        {speaker:"세르안",text:"우호 신호라는 데는 동의합니다. 약속으로 읽지는 마십시오."},
        {speaker:"리안",text:"약속이라 부르지 않겠습니다. 다만 상대가 먼저 움직였다는 사실도 지우진 않겠습니다."}
      ],
      choices:[
        {id:"warmer_welcome",text:"이전보다 적극적으로 맞이한다.",effects:{initiative:2,warmth:2,pressure:1},log:"두 번째 사절을 더 적극적으로 환대했다.",aftermath:[
          {type:"narration",text:"왕실은 지난 방문을 긍정적으로 받아들였으며 앞으로의 왕래에도 열려 있다는 뜻을 전한다."},{speaker:"동부 사절",text:"기쁜 뜻으로 전하겠습니다."},
          {speaker:"발렌",text:"속도가 붙는군요. 폐하께서 결론을 앞당기고 싶으신 걸 수도 있겠습니다."},{speaker:"리안",text:"아니면 상대의 한 걸음에 같은 정도로 답하신 걸 수도 있습니다."},{speaker:"세르안",text:"둘 다 가능성입니다. 그 이상은 아직 모르지요."},
          {type:"narration",text:"동부 사절은 밝은 표정으로 돌아간다. 양국 사이의 왕래가 분명히 잦아졌다."}
        ]},
        {id:"match_effort",text:"상대가 보인 정도만큼만 응답한다.",effects:{reciprocity:2,warmth:1,caution:1},log:"상대의 온도에 맞춰 비슷한 수준으로 응답했다.",aftermath:[
          {type:"narration",text:"왕실은 상대가 보인 만큼의 온도로 화답한다."},
          {speaker:"리안",text:"좋습니다. 상대의 걸음 수를 세지 않아도 됩니다. 같은 방향이면 충분합니다."},{speaker:"세르안",text:"그리고 아직 단정하지 않는 것도 중요합니다."},
          {type:"narration",text:"양국의 다음 만남은 자연스럽게 열리기 시작한다."}
        ]},
        {id:"observe_more",text:"좋은 신호로 받아들이되 조금 더 지켜본다.",effects:{caution:2,uncertainty:1},log:"우호 신호를 인정하면서도 해석은 보류했다.",aftermath:[
          {type:"narration",text:"왕실은 호의를 받아들이되 추가 제안은 하지 않는다."},{speaker:"발렌",text:"조금 차갑지 않습니까?"},
          {speaker:"세르안",text:"서두르지 않는 것과 차가운 것은 다릅니다."},{speaker:"리안",text:"다만 상대도 우리 반응을 보고 있다는 점은 기억하십시오."},
          {type:"narration",text:"동부 왕국은 교류를 멈추지 않았지만, 다음 움직임은 조심스러워졌다."}
        ]}
      ]
    },
    {id:"south_contract",title:"남부의 수로",chapter:"서로 다른 이웃",description:"남부 상단이 수로 공사를 맡는 대신 삼 년의 통행세 우선권을 요구한다.",intro:[{speaker:"남부 상단 대표",text:"비용은 우리가 댑니다. 첫 삼 년의 통행세는 우리 몫이어야 합니다."},{speaker:"재무 담당자",text:"공사는 필요하지만 세입 공백도 작지 않습니다."},{speaker:"세르안",text:"호의가 아니라 계약입니다."}],opinions:[["chancellor","공사비와 장기 세입을 나눠 보면 조건을 다시 제안할 수 있습니다."],["marshal","결정을 늦추는 비용도 계산해야 합니다."]],choices:[{id:"south_counter",text:"비용을 분담하고 통행세 기간을 줄인다.",effects:{reciprocity:1,caution:1},log:"남부와 비용을 나누고 통행세 기간을 줄였다.",aftermath:[{type:"narration",text:"협상 끝에 양쪽이 비용을 나누는 수정안에 서명했다."}]},{id:"south_accept",text:"남부 조건으로 바로 착공한다.",effects:{initiative:2,pressure:1},log:"남부의 조건으로 공사를 시작했다.",aftermath:[{type:"narration",text:"삽은 바로 땅에 닿았다. 삼 년의 세입 칸은 비었다."}]},{id:"south_reject",text:"이번 공사를 추진하지 않는다.",effects:{selfProtection:2},log:"남부 수로 계약을 거절했다.",aftermath:[{type:"narration",text:"상단은 자재를 거두었다. 낡은 길은 그대로 남았다."}]}]},
    {
      id:"festival", title:"공동 축제", chapter:"가까워지는 두 왕국",
      description:"초여름, 두 왕국은 처음으로 국경 인근에서 공동 축제를 열었다.\\n공식 일정이 끝난 뒤에도 동부의 사절단은 바로 돌아가지 않았다.",
      intro:[
        {type:"narration",text:"음악과 시장의 소리로 국경 마을이 가득 찬다. 두 나라의 깃발이 처음으로 한 광장에 나란히 걸린다."},
        {speaker:"리안",text:"공식 일정은 거의 끝났습니다. 지금부터는 약속보다 서로가 얼마나 더 머무는지를 보시면 됩니다."},
        {speaker:"발렌",text:"아니, 분위기도 보고서에 기록합니까?"},{speaker:"세르안",text:"때로는 숫자보다 더 중요한 정보가 됩니다."},
        {type:"narration",text:"해가 지고 공식 행사가 끝난다. 왕실 사람들도 하나둘 자리에서 일어난다."},
        {speaker:"동부 사절",text:"폐하."},{speaker:"동부 사절",text:"시간이 괜찮으시다면… 조금 더 머물다 가시겠습니까?"},
        {type:"narration",text:"예정표에는 없던 제안이다."},{speaker:"발렌",text:"상대가 먼저 연장했습니다."},
        {speaker:"리안",text:"그러니까 더 중요합니다. 지금은 밀어붙일 순간인지, 그냥 즐길 순간인지."}
      ],
      opinions:[
        ["envoy","상대가 자발적으로 시간을 더 쓰겠다고 했습니다. 가까워진 신호는 맞습니다. 다만 가까워진 것과 약속한 것은 다릅니다."],
        ["chancellor","좋은 정보입니다. 다만 오늘의 분위기가 미래의 약속을 대신하지는 않습니다."],
        ["marshal","흐름이 좋을 때 다음 교류까지 잡아두는 것이 효율적입니다."]
      ],
      choices:[
        {id:"stay_longer",text:"함께 시간을 더 보낸다.",effects:{warmth:2,reciprocity:1},log:"축제가 끝난 뒤에도 동부 왕국과 시간을 더 보냈다.",aftermath:[
          {type:"narration",text:"공식 수행원 대부분이 떠난 뒤에도 작은 정원에 불이 남는다."},{speaker:"동부 사절",text:"공식 자리보다 지금이 훨씬 편하군요."},
          {type:"narration",text:"왕은 자리를 떠나지 않는다. 그 선택만으로 대답을 대신한다."},{type:"narration",text:"별다른 약속은 없었다. 하지만 돌아오는 길의 분위기는 이전과 달랐다."},
          {speaker:"리안",text:"좋은 시간은 좋은 시간으로 남겨두는 것도 기술입니다."},{speaker:"발렌",text:"적어도 더 머무는 쪽은 선택하셨군요."},{speaker:"세르안",text:"그 선택의 이유까지 붙이진 맙시다."}
        ]},
        {id:"propose_next",text:"함께 시간을 보내며 다음 교류를 먼저 제안한다.",effects:{warmth:2,initiative:2,pressure:1},log:"좋은 분위기를 이어 다음 교류까지 먼저 제안했다.",aftermath:[
          {type:"narration",text:"왕실은 다음 교류를 먼저 제안한다."},{speaker:"동부 사절",text:"좋습니다. 일정이 맞으면 꼭 가겠습니다."},
          {speaker:"발렌",text:"다음 움직임까지 확보했습니다."},{speaker:"세르안",text:"확보라는 단어를 외교에 쓰지 마십시오."},
          {speaker:"리안",text:"상대의 답이 ‘좋다’였다는 것과 일정이 확정됐다는 것은 다릅니다."}
        ]},
        {id:"end_warmly",text:"감사 인사를 전하고 좋은 분위기에서 마무리한다.",effects:{reciprocity:1,caution:1,selfProtection:1},log:"좋은 분위기를 남긴 채 축제를 마무리했다.",aftermath:[
          {type:"narration",text:"왕실은 좋은 분위기가 남아 있을 때 자리를 마무리한다."},{speaker:"동부 사절",text:"네. 다음에 또 뵙겠습니다."},
          {speaker:"발렌",text:"기회가 있었는데요."},{speaker:"리안",text:"좋은 끝도 다음 시작을 만듭니다."},
          {type:"narration",text:"양국은 아쉬움이 조금 남은 채 각자의 길로 돌아간다."}
        ]},
        {id:"festival_pastry",text:"다음 얘기는 꺼내지 않고, 작은 호의만 건넨다.",effects:{warmth:2,reciprocity:1,uncertainty:1},log:"다음 약속 대신 축제의 작은 과자를 건넸다.",aftermath:[
          {type:"narration",text:"왕실은 다음 일정 이야기를 꺼내지 않는다. 대신 축제 상인에게서 산 작은 과자 봉지가 사절에게 건너간다."},
          {speaker:"동부 사절",text:"…이건 예상하지 못했습니다."},
          {speaker:"리안",text:"가끔은 관계에 설명이 없는 여지도 필요합니다."},
          {speaker:"발렌",text:"회의까지 해서 과자를 고른 셈이군요."},
          {type:"narration",text:"별다른 약속 없이 웃음이 짧게 남고, 그날의 축제는 끝난다."}
        ]}
      ]
    },
    {id:"west_grain",title:"서부의 늦은 곡물",chapter:"오래된 우방",description:"오래된 우방인 서부가 약속한 구호 곡물을 절반만 보냈다.",intro:[{speaker:"서부 사절",text:"우리 쪽 흉작도 심했습니다."},{speaker:"서기관",text:"배급표를 다시 써야 합니다."},{speaker:"재무 담당자",text:"서부의 사정과 우리 부족분은 별개의 사실입니다."}],opinions:[["chancellor","약속이 비운 곡물 칸은 다른 계획으로 메워야 합니다."],["envoy","오래된 관계일수록 실망을 숨기면 다음 약속도 흐려집니다."]],choices:[{id:"west_renegotiate",text:"남은 물량과 시기를 다시 협상한다.",effects:{reciprocity:1,caution:1},log:"서부와 남은 곡물의 조건을 다시 협상했다.",aftermath:[{type:"narration",text:"서부는 곡물 대신 종자와 농기구를 제안했다."}]},{id:"west_adapt",text:"추가 지원 없이 배급 계획을 바꾼다.",effects:{selfProtection:2},log:"서부 지원 없이 배급 계획을 다시 짰다.",aftermath:[{type:"narration",text:"배급은 줄었지만 외부 약속 없이 겨울을 날 계산이 나왔다."}]},{id:"west_protest",text:"약속 불이행을 공식 항의한다.",effects:{pressure:2},log:"서부에 공식 항의했다.",aftermath:[{type:"narration",text:"서부 의회에 항의문이 낭독됐다. 답신은 아직 없다."}]}]},
    {
      id:"late_reply", title:"늦은 답신", chapter:"흔들리는 국경",

      description:(s)=>{
        const variant = getLateReplyVariant(s);

        if(variant === "active"){
          return "최근에는 먼저 다음 교류를 제안하는 일도 자연스러워졌다.\n그런데 늘 비슷한 시기에 오던 동부 왕국의 답신이 오늘은 오지 않았다.\n하루가 지나고, 또 하루가 지난다.";
        }

        if(variant === "cautious"){
          return "좋은 분위기를 남긴 뒤, 왕실은 동부가 다시 움직일 시간을 두고 있었다.\n그런데 기다리던 답신이 예상보다 늦는다.\n하루가 지나고, 또 하루가 지난다.";
        }

        return "지금까지 두 왕국은 대체로 비슷한 온도로 답을 주고받아 왔다.\n그 익숙한 리듬에서 처음으로 한 박자가 비었다.\n하루가 지나고, 또 하루가 지난다.";
      },

      intro:(s)=>{
        const variant = getLateReplyVariant(s);
        const b = [
          {type:"narration",text:"왕실 서기관이 빈 서신함을 확인하고 고개를 젓는다."},
          {speaker:"서기관",text:"오늘도 동부에서 온 문서는 없습니다."}
        ];

        if(variant === "active"){
          b.push(
            {speaker:"발렌",text:"평소보다 이틀 늦었습니다. 최근엔 우리가 먼저 움직이는 일이 많았으니, 이번에도 확인하는 편이 빠릅니다."},
            {speaker:"세르안",text:"최근 우리가 먼저 움직였다는 사실과, 이번 지연의 원인이 그것이라는 결론은 다릅니다."},
            {speaker:"리안",text:"좋은 흐름이 이어지고 있었던 만큼 빈자리가 더 크게 보이는 걸 수도 있습니다."}
          );
        }

        else if(variant === "cautious"){
          b.push(
            {speaker:"세르안",text:"평소보다 이틀 늦었습니다. 우리가 특별히 재촉하지 않았다는 것도 사실입니다."},
            {speaker:"발렌",text:"그러니까 더 기다리자는 겁니까?"},
            {speaker:"리안",text:"기다리는 동안 상대가 움직이는지도 하나의 정보가 됩니다."}
          );
        }

        else {
          b.push(
            {speaker:"리안",text:"평소보다 이틀 늦었습니다. 지금까지는 서로 비슷한 속도로 답을 주고받아 왔습니다."},
            {speaker:"세르안",text:"리듬이 깨졌다는 사실은 맞습니다. 이유까지 알게 된 건 아닙니다."},
            {speaker:"발렌",text:"확인이 필요하다면 사절을 보내겠습니다."}
          );
        }

        b.push(
          {type:"narration",text:"왕의 시선이 잠시 동쪽 창문에 머문다."},
          {type:"narration",text:"그때 처음 보는 인물이 회의실 뒤편에서 입을 연다."},
          {speaker:"카르덴",text:"폐하. 모두 동쪽만 보고 계시는군요."},
          {speaker:"카르덴",text:"하지만 이 나라에도 지켜야 할 것이 있습니다."},
          {speaker:"발렌",text:"누구지?"},
          {speaker:"카르덴",text:"잃기 전에 계산하는 사람입니다."},
          {type:"narration",text:"수호관이 왕실 회의에 합류한다."}
        );

        return b;
      },

      opinions:(s)=>{
        const variant = getLateReplyVariant(s);

        if(variant === "active"){
          return [
            ["chancellor","최근 우리가 먼저 움직인 적이 많습니다. 그렇다고 이번 지연을 그 결과라고 단정할 수는 없습니다."],
            ["marshal","확인이 필요하다면 움직이면 됩니다. 애매함을 오래 둘 이유는 없습니다."],
            ["envoy","지금까지 우리가 속도를 냈다면, 이번에는 상대가 움직일 공간을 남기는 것도 방법입니다."],
            ["warden","답이 늦는 동안 우리 쪽 관심과 자원이 얼마나 묶이고 있는지도 보십시오. 기다림도 공짜는 아닙니다."]
          ];
        }

        if(variant === "cautious"){
          return [
            ["chancellor","우리는 이미 상대가 움직일 시간을 남겨두고 있었습니다. 한 번의 지연만으로 정책을 바꿀 근거는 부족합니다."],
            ["marshal","그렇더라도 확인은 가능합니다. 기다림이 의무는 아닙니다."],
            ["envoy","우리가 먼저 다음을 잡지 않았던 만큼, 이번 반응은 상대의 의지를 볼 기회가 될 수도 있습니다."],
            ["warden","기다리는 선택도 소모가 있습니다. 상대의 사정만큼 우리 왕국이 감당할 수 있는 시간도 보십시오."]
          ];
        }

        return [
          ["chancellor","지금까지의 리듬에서 벗어난 것은 사실입니다. 그러나 한 번의 지연만으로 관계 변화를 판단할 수는 없습니다."],
          ["marshal","확인이 필요하다면 사절을 보내겠습니다."],
          ["envoy","서로 비슷한 온도로 오던 관계였다면, 이번 한 번은 상대의 다음 행동을 보는 것도 방법입니다."],
          ["warden","상대국 사정만큼 우리 왕국 상태도 보십시오. 불확실성을 오래 붙들고 있는 것 역시 비용입니다."]
        ];
      },

      courtExchange:(s)=>{
        const variant = getLateReplyVariant(s);

        if(variant === "active"){
          return [
            {speaker:"발렌",text:"계속 먼저 움직여왔으니 이번에도 확인할 수 있습니다."},
            {speaker:"세르안",text:"할 수 있다는 것과 해야 한다는 것은 다릅니다."}
          ];
        }

        if(variant === "cautious"){
          return [
            {speaker:"리안",text:"상대가 스스로 움직이는 것도 정보입니다."},
            {speaker:"카르덴",text:"그 정보를 기다리는 동안 우리 쪽이 얼마나 소모되는지는 제가 보겠습니다."}
          ];
        }

        return [
          {speaker:"세르안",text:"리듬이 깨졌다는 건 사실입니다. 이유는 아직 모릅니다."},
          {speaker:"리안",text:"그렇다면 저는 깨지기 전까지의 리듬도 함께 보겠습니다."}
        ];
      },

      choices:[
        {id:"wait",text:"아무것도 하지 않고 기다린다.",effects:{caution:2,selfProtection:1,uncertainty:2},log:"늦은 답신에 추가 행동을 하지 않았다.",aftermath:[
          {type:"narration",text:"첫날이 지나고, 둘째 날도 지나간다."},{speaker:"발렌",text:"아무것도 하지 않는 것도 명령입니까? 저는 폐하께서 바로 움직이실 줄 알았습니다."},{speaker:"세르안",text:"원수께서 폐하를 잘못 읽으셨군요."},{speaker:"발렌",text:"그럴 수도 있죠. 다음번엔 맞을 겁니다."},
          {speaker:"카르덴",text:"불편하더라도 상대의 다음 행동을 볼 수 있습니다."},{type:"narration",text:"답신은 아직 없다. 대신 왕국의 하루는 계속된다."}
        ]},
        {id:"check_in",text:"짧은 확인 사절을 보낸다.",effects:{initiative:1,reciprocity:1,pressure:1},log:"부담이 적은 짧은 확인 사절을 보냈다.",aftermath:[
          {type:"narration",text:"왕의 결정에 따라 답을 재촉하지 않는 짧은 확인 사절이 준비된다."},{speaker:"발렌",text:"명확합니다."},{speaker:"리안",text:"좋습니다. 확인과 추궁은 다릅니다."},
          {type:"narration",text:"짧은 안부 서신이 동쪽으로 향한다. 이제 다시 기다리는 일이 남았다."}
        ]},
        {id:"propose_meeting",text:"직접적인 회담을 제안한다.",effects:{initiative:2,pressure:3,uncertainty:-1},log:"직접 회담을 제안했다.",aftermath:[
          {type:"narration",text:"왕의 결정에 따라 직접 회담이 제안된다."},{speaker:"발렌",text:"즉시 준비하겠습니다."},{speaker:"세르안",text:"폐하. 답신 지연 하나에 비해 대응 규모가 큽니다."},
          {speaker:"카르덴",text:"명확함을 얻는 비용이 무엇인지도 생각하십시오."},{type:"narration",text:"회담 제안서가 동쪽으로 향한다."}
        ]},
        {id:"lower_contact",text:"교류 강도를 한 단계 낮춘다.",effects:{selfProtection:2,caution:1,warmth:-1},log:"교류 강도를 한 단계 낮췄다.",aftermath:[
          {type:"narration",text:"왕의 결정에 따라 동부 교류의 우선순위를 낮추고 왕국 내부 일정이 정상화된다."},{speaker:"카르덴",text:"좋은 판단입니다. 국경 밖의 침묵 때문에 국경 안의 삶까지 멈출 필요는 없습니다."},
          {speaker:"리안",text:"다만 갑작스러운 냉각으로 보이지 않게 정도는 조절하겠습니다."},{type:"narration",text:"동쪽을 향하던 관심이 조금씩 왕국 안으로 돌아온다."}
        ]}
      ]
    },
    {
      id:"canceled_meeting", title:"취소된 회담", chapter:"흔들리는 국경", timed:true, timerSeconds:20,

      description:(s)=>{
        const variant = getEvent5Variant(s);

        if(variant === "active"){
          return "우리가 먼저 요청했던 회담을 앞두고 동부 왕국에서 짧은 서신이 도착했다.\n\n“내부 사정으로 이번 회담은 어렵겠습니다.”\n\n먼저 내밀었던 손이 허공에 남는다.\n\n동부 전령은 해 지기 전에 돌아가야 한다. 답을 실어 보낼 시간은 길지 않다.";
        }

        if(variant === "cautious"){
          return "동부 왕국이 먼저 언급했던 회담을 앞두고 짧은 서신이 도착했다.\n\n“이번 자리는 어렵겠습니다.”\n\n저쪽이 먼저 꺼낸 이야기를, 저쪽이 먼저 접었다.\n\n동부 전령은 해 지기 전에 돌아가야 한다. 답을 실어 보낼 시간은 길지 않다.";
        }

        if(variant === "protective"){
          return "이미 교류 강도를 낮춘 뒤 유지하던 정례 회담에 취소 요청이 들어왔다.\n\n공식 사유는 ‘내부 사정’.\n\n충격은 크지 않다. 그 사실이 오히려 묘하게 남는다.\n\n동부 전령은 해 지기 전에 돌아가야 한다. 답을 실어 보낼 시간은 길지 않다.";
        }

        if(variant === "mutual"){
          return "짧은 확인 서신이 오간 뒤 자연스럽게 잡혔던 회담이 취소됐다.\n\n“이번 자리는 어렵겠습니다.”\n\n누구의 잘못이라고 부르기도 애매한 취소다.\n\n동부 전령은 해 지기 전에 돌아가야 한다. 답을 실어 보낼 시간은 길지 않다.";
        }

        return "예정되어 있던 회담을 앞두고 동부 왕국에서 짧은 서신이 도착했다.\n\n“내부 사정으로 이번 회담은 어렵겠습니다.”\n\n대체 일정은 적혀 있지 않다.\n\n동부 전령은 해 지기 전에 돌아가야 한다. 답을 실어 보낼 시간은 길지 않다.";
      },

      intro:(s)=>{
        const variant = getEvent5Variant(s);
        const b = [];

        if(variant === "active"){
          b.push(
            {type:"narration",text:"서기관이 서신을 들고 들어온다. 원수가 평소보다 먼저 손을 뻗어 받는다."},
            {speaker:"발렌",text:"…취소랍니다."},
            {type:"narration",text:"잠깐의 정적이 흐른다."},
            {speaker:"세르안",text:"우리가 먼저 청한 자리였습니다."},
            {speaker:"발렌",text:"예. 제가 서두르자고 말씀드렸었죠."},
            {speaker:"세르안",text:"탓하자는 게 아닙니다. 다만 이번에는 우리 쪽이 먼저 내밀었던 손이라는 것만 기억해두십시오."},
            {speaker:"리안",text:"먼저 내밀었던 손이 빈손으로 돌아왔다고 해서, 내민 것 자체가 잘못이었다는 뜻은 아닙니다."}
          );

          if(s.pressure >= 6){
            b.push({speaker:"세르안",text:"다만 최근 우리가 계속 먼저 다가섰다는 것도 함께 생각해야 합니다."});
          }

          b.push(
            {speaker:"카르덴",text:"거절당했다는 감각과 실제로 거절당했다는 사실은 아직 구분해야 합니다."},
            {type:"narration",text:"이번에는 원수가 더 이상 말을 잇지 않는다."}
          );
        }

        else if(variant === "cautious"){
          b.push(
            {type:"narration",text:"서기관이 조심스럽게 서신을 탁자 위에 내려놓는다."},
            {speaker:"서기관",text:"동부 쪽에서 지난주 언급했던 자리, 없던 일로 하자는 서신입니다."},
            {speaker:"세르안",text:"저쪽이 먼저 꺼냈던 이야기였습니다. 그리고 먼저 접은 것도 저쪽입니다."},
            {speaker:"발렌",text:"그럼 우리가 할 수 있는 게 없다는 겁니까?"},
            {speaker:"세르안",text:"할 수 있는 게 없다는 게 아니라, 우리가 먼저 잃은 약속은 없다는 겁니다."},
            {speaker:"카르덴",text:"잃은 게 없다는 말, 그대로 믿지는 마십시오. 기대도 자원입니다."}
          );

          if(s.uncertainty >= 5){
            b.push({speaker:"카르덴",text:"정보 없이 기다리는 것도 이번이 처음은 아니군요."});
          }

          b.push(
            {speaker:"리안",text:"저쪽이 움직였다가 멈췄습니다. 다음 행동이 무엇인지 보는 것도 정보가 됩니다."},
            {type:"narration",text:"회의실의 시선이 천천히 왕좌로 모인다."}
          );
        }

        else if(variant === "protective"){
          b.push(
            {type:"narration",text:"정례 외교 문서 사이에 회담 취소 요청이 끼워져 있다."},
            {speaker:"서기관",text:"정기 회담 일정, 동부 쪽에서 취소를 요청했습니다. 공식 사유는 ‘내부 사정’입니다."},
            {speaker:"카르덴",text:"예상 밖의 일은 아닙니다. 최근 저희도 거리를 두고 있었으니까요."},
            {speaker:"발렌",text:"그럼 신경 쓸 것도 없는 겁니까?"},
            {speaker:"카르덴",text:"신경 쓸 게 없다는 것과 아무 의미가 없다는 것은 다른 얘기입니다."},
            {speaker:"리안",text:"거리를 둔 건 우리 쪽이 먼저였습니다. 이번 결정이 그 거리에 대한 답인지, 단순한 내부 사정인지는 아직 모릅니다."}
          );

          if(s.warmth >= 3){
            b.push({speaker:"리안",text:"그리고 거리를 두신 이유가 마음까지 멀어졌기 때문이라고 단정할 수도 없습니다."});
          }

          b.push(
            {speaker:"세르안",text:"안도감이 먼저 든다면 그것도 하나의 정보입니다. 다만 안도감의 속도와 사실의 근거는 다른 문제입니다."},
            {type:"narration",text:"누구도 이 취소를 손실이라고도, 승리라고도 부르지 않는다."}
          );
        }

        else {
          b.push(
            {type:"narration",text:"왕실 회의실의 탁자 위에 짧은 서신 한 장이 놓인다."},
            {speaker:"리안",text:"지난 서신 왕래 중에 잡혔던 자리, 취소됐습니다. 딱히 누구 탓이라 하기도 어렵습니다."},
            {speaker:"세르안",text:"정보가 가장 적은 경우군요."},
            {speaker:"발렌",text:"그럼 그냥 모르는 채로 있는 겁니까?"},
            {speaker:"세르안",text:"지금은요."},
            {speaker:"카르덴",text:"모른다는 사실을 견디는 데도 비용은 듭니다."},
            {type:"narration",text:"회의실은 조용하다. 이번에는 누구도 상대의 의도를 확신하지 못한다."}
          );
        }

        return b;
      },

      opinions:(s)=>{
        const variant = getEvent5Variant(s);

        if(variant === "active"){
          return [
            ["marshal","제가 먼저 청했던 자리였습니다. 그래서 더 신경이 쓰입니다만 — 이유는 아직 모릅니다."],
            ["chancellor","우리가 내민 손과 상대가 거둔 손은 다른 문제입니다. 인과를 단정할 근거는 아직 없습니다."],
            ["envoy","먼저 움직인 쪽이 다시 움직일지 말지를 정하는 겁니다. 이번에는 폐하 차례가 아닐 수도 있습니다."],
            ["warden","경계를 세우는 것도 비용을 치르는 결정입니다. 무엇을 지키려는 경계인지는 분명히 해두십시오."]
          ];
        }

        if(variant === "cautious"){
          return [
            ["chancellor","저쪽이 먼저 꺼냈고 저쪽이 먼저 거뒀습니다. 우리 쪽 행동이 원인이라 볼 근거는 없습니다."],
            ["warden","근거가 없다고 대비도 필요 없는 건 아닙니다. 기대만큼은 이미 썼습니다."],
            ["envoy","이번에는 상대의 다음 행동을 볼 여지가 있습니다. 서두를 이유는 없습니다."],
            ["marshal","기다릴 수도 있습니다. 다만 기다리는 동안 무엇을 원하는지는 우리 스스로 알아야 합니다."]
          ];
        }

        if(variant === "protective"){
          return [
            ["warden","우리가 이미 거리를 두고 있었으니 큰 손실은 아닙니다. 다만 안도감을 확신으로 바꾸지는 마십시오."],
            ["envoy","우리 거리 두기에 대한 반응인지, 단순한 내부 사정인지는 아직 구분할 수 없습니다."],
            ["chancellor","정보가 적을수록 안도감은 빨리 옵니다. 안도감의 속도와 근거는 다른 문제입니다."],
            ["marshal","이미 물러나 있던 자리라면, 이번에는 더 물러날지 아니면 멈출지만 정하면 됩니다."]
          ];
        }

        return [
          ["envoy","누구 탓을 하기도 애매한 취소입니다. 다음 행동 자체가 가장 좋은 정보가 될 수 있습니다."],
          ["chancellor","취소의 이유와 관계 변화는 현재로서는 구분할 수 없습니다. 정보가 부족합니다."],
          ["marshal","직접 확인할 수도 있습니다. 모르는 상태로 남길지도 선택입니다."],
          ["warden","관계를 지키는 비용과 우리 쪽 소모를 동시에 보십시오."]
        ];
      },

      courtExchange:(s)=>{
        const variant = getEvent5Variant(s);

        if(variant === "active"){
          return [
            {speaker:"발렌",text:"이번에는 제가 너무 빨리 움직였던 걸 수도 있겠습니다."},
            {speaker:"세르안",text:"그럴 수도 있습니다. 결과가 불편하다고 당시의 판단까지 틀렸다고 하진 맙시다."}
          ];
        }

        if(variant === "cautious"){
          return [
            {speaker:"발렌",text:"이래도 계속 기다립니까?"},
            {speaker:"세르안",text:"기다리자는 게 아니라, 모르는 것을 안다고 하지 말자는 겁니다."}
          ];
        }

        if(variant === "protective"){
          return [
            {speaker:"리안",text:"관계를 남겨두면서도 거리는 둘 수 있습니다."},
            {speaker:"카르덴",text:"그 거리가 우리 왕국을 실제로 덜 소모시키는지도 보겠습니다."}
          ];
        }

        return [
          {speaker:"세르안",text:"정보가 적습니다."},
          {speaker:"발렌",text:"압니다. 그래서 아직 움직이라고 말씀드리지 않았습니다."}
        ];
      },

      choices:(s)=>{
        const variant = getEvent5Variant(s);
        const prefix = variant === "active" ? "우리가 먼저 청했던 자리였지만, " : "";

        const common = [
          {
            id:"reschedule",
            text: variant === "active"
              ? "한 번 더 대체 일정을 제안한다."
              : variant === "cautious"
                ? "이번에는 우리가 대체 일정을 제안한다."
                : variant === "protective"
                  ? "공식 회담의 대체 일정을 제안한다."
                  : "“그럼 다음 주는 가능합니까?”라고 묻는다.",
            effects:{initiative:2,pressure:2,uncertainty:-1},
            log:"취소된 회담에 대체 일정을 제안했다.",
            aftermath:[
              {type:"narration",text:prefix + "왕실은 대체 가능한 일정을 담은 짧은 서신을 보낸다."},
              {speaker:"발렌",text:"이번에는 행동을 선택하셨군요."},
              {speaker:"세르안",text:"행동했다는 사실과 그 이유는 구분해두겠습니다."},
              {speaker:"리안",text:"다음 답이 또 흐리다면 그때는 정말 저쪽이 움직일 차례입니다."},
              {type:"narration",text:"새 제안이 동쪽으로 향한다."}
            ]
          },
          {
            id:"leave_ball",
            text: variant === "cautious"
              ? "“여유가 생기면 알려주십시오.”라고만 답한다."
              : variant === "protective"
                ? "공식 채널만 열어두고 다음 제안은 기다린다."
                : "“여유가 생기면 알려주십시오.”라고 답한다.",
            effects:{reciprocity:2,caution:1,selfProtection:1},
            log:"다음 행동을 상대에게 넘기고 기다리기로 했다.",
            aftermath:[
              {type:"narration",text:"왕실은 새로운 일정을 제안하지 않고, 다음 행동을 동부 왕국에 맡긴다."},
              {speaker:"리안",text:"공을 넘겼다면 받을 시간도 줘야 합니다."},
              {speaker:"발렌",text:"이번에는 기다리는 쪽이군요."},
              {speaker:"카르덴",text:"그동안 우리 왕국은 우리 일을 하면 됩니다."},
              {type:"narration",text:"짧은 답신만 동쪽으로 향한다."}
            ]
          },
          {
            id:"ask_reason",
            text:"회담이 취소된 이유를 직접 묻는다.",
            effects:{initiative:1,pressure:2,uncertainty:-1},
            log:"왜 회담이 취소됐는지 직접 확인했다.",
            aftermath:[
              {type:"narration",text:"왕실은 대체 일정 대신 취소 이유에 대한 설명을 요청한다."},
              {speaker:"세르안",text:"합리적인 요구입니다. 다만 상대에게는 설명 압박으로 느껴질 수도 있습니다."},
              {speaker:"발렌",text:"그래도 답은 얻을 수 있겠죠."},
              {speaker:"카르덴",text:"답을 요구할 수 있는 것과, 답을 받을 권리가 있는 것은 다른 문제입니다."},
              {type:"narration",text:"상세한 설명을 요청하는 서신이 보내진다."}
            ]
          },
          {
            id:"pause_contact",
            text: variant === "protective"
              ? "이미 낮춘 교류를 당분간 완전히 멈춘다."
              : "당분간 교류를 중단한다.",
            effects:{selfProtection:3,caution:2,warmth:-2},
            log:"비공식 교류를 당분간 중단했다.",
            aftermath:[
              {type:"narration",text:"비공식 교류가 잠정 중단된다. 공식 채널만 최소한으로 남는다."},
              {speaker:"카르덴",text:"문을 닫는 것은 쉽습니다. 다시 여는 것은 더 어렵습니다."},
              {speaker:"리안",text:"완전한 단절이 아니라면 최소한의 통로는 남겨두겠습니다."},
              {speaker:"발렌",text:"적어도 이번 결정은 명확하군요."},
              {type:"narration",text:"동부로 향하던 사절 준비가 중단된다."}
            ]
          }
        ];

        if(variant === "active"){
          common.splice(3, 0, {
            id:"stop_initiating",
            text:"이번에는 대체 회담을 먼저 제안하지 않는다.",
            effects:{selfProtection:2,initiative:-1,warmth:-1},
            log:"이번 취소에는 추가 회담을 먼저 제안하지 않았다.",
            aftermath:[
              {type:"narration",text:"왕실은 이번 취소에 대체 일정을 덧붙이지 않는다. 다음 회담 제안은 동부가 먼저 꺼내도록 둔다."},
              {speaker:"발렌",text:"…알겠습니다. 이번에는 제가 먼저 움직이라고 권하지 않겠습니다."},
              {speaker:"세르안",text:"한 번의 취소를 영구적인 법으로 만들지만 않는다면, 이것도 하나의 경계가 될 수 있습니다."},
              {speaker:"리안",text:"상대가 원한다면 다음에는 저쪽이 길을 만들게 두죠."},
              {type:"narration",text:"먼저 내밀었던 손이 천천히 왕국 안으로 돌아온다."}
            ]
          });
        }

        return common;
      }
    },
    {
      id:"empty_border",

      title:(s)=> getEvent6Variant(s)==="closed_by_us"
        ? "닫힌 교류"
        : "텅 빈 국경",

      chapter:"흔들리는 국경",

      description:(s)=>{
        if(getEvent6Variant(s)==="closed_by_us"){
          return "왕실은 먼저 비공식 교류를 멈췄다.\n며칠 뒤, 동부에서 짧은 공식 서신 한 통이 도착한다.\n\n“귀국의 뜻을 존중하겠습니다. 필요한 연락은 기존 공식 경로를 이용하겠습니다.”\n\n문은 우리가 먼저 닫았다. 저쪽은 그 문을 억지로 두드리지 않았다.";
        }
        return "며칠이 더 지났다.\n동부 변경은 조용하다.\n사절도, 회담 제안도, 분명한 거절도 없다.\n왕실에는 해석할 수 있는 침묵만 남아 있다.";
      },

      intro:(s)=>{
        if(getEvent6Variant(s)==="closed_by_us"){
          return [
            {type:"narration",text:"서기관이 공식 봉인이 찍힌 얇은 서신을 탁자 위에 내려놓는다."},
            {speaker:"세르안",text:"우리가 먼저 비공식 교류를 멈췄습니다. 동부는 그 방침을 받아들였다는 뜻만 보냈습니다."},
            {speaker:"발렌",text:"붙잡지도 않았군."},
            {speaker:"리안",text:"우리가 거리를 요청했고, 저쪽은 그 거리를 지켰습니다. 그게 무관심인지 존중인지는 아직 모릅니다."},
            {speaker:"카르덴",text:"적어도 지금은 우리 쪽 경계가 실제로 작동하고 있습니다."},
            {type:"narration",text:"동부는 더 가까이 오지 않는다. 그렇다고 관계를 끝내겠다는 말도 하지 않았다."}
          ];
        }

        return [
          {type:"narration",text:"동부 변경에서 올라온 정기 보고서가 왕실 탁자 위에 놓인다."},
          {speaker:"세르안",text:"특이 동향은 없습니다."},
          {speaker:"발렌",text:"아무것도 없다는 보고군."},
          {speaker:"리안",text:"아무것도 하지 않는 것과 아무 의미가 없는 것은 다릅니다."},
          {speaker:"카르덴",text:"하지만 의미를 찾느라 우리 쪽 삶을 멈출 필요도 없습니다."},
          {type:"narration",text:"국경은 조용하다. 너무 조용해서, 각자 다른 의미를 붙이기 쉬울 정도로."}
        ];
      },

      opinions:(s)=>{
        if(getEvent6Variant(s)==="closed_by_us"){
          return [
            ["chancellor","확인된 사실은 두 가지입니다. 우리가 먼저 비공식 교류를 멈췄고, 동부는 그 방침을 받아들였습니다. 그 이상은 아직 모릅니다."],
            ["marshal","원한다면 다시 열 수 있습니다. 다만 이번에는 우리가 닫은 문을 우리가 다시 여는 겁니다."],
            ["envoy","상대가 경계를 존중한 것과 관계를 포기한 것은 같은 말이 아닙니다. 지금은 둘 다 가능성이 있습니다."],
            ["warden","우리가 요청한 거리가 실제로 생겼습니다. 그 거리가 우리 왕국에 무엇을 돌려줬는지도 보십시오."]
          ];
        }

        return [
          ["chancellor","새로운 정보가 거의 없습니다. 모르는 상태가 오래됐다고 해서 추측이 사실이 되지는 않습니다."],
          ["marshal","계속 기다릴 수도 있고, 다시 움직일 수도 있습니다. 적어도 행동은 우리가 정할 수 있습니다."],
          ["envoy","상대가 먼저 움직이지 않는 것도 관계의 한 장면입니다. 다만 그 이유는 아직 모릅니다."],
          ["warden","이 관계가 왕국 안에서 차지하는 자리를 우리가 정할 수는 있습니다."]
        ];
      },

      courtExchange:(s)=>{
        if(getEvent6Variant(s)==="closed_by_us"){
          return [
            {speaker:"발렌",text:"문을 닫았으면 결과도 받아들여야지."},
            {speaker:"리안",text:"받아들이는 것과 다시 열 수 없다는 건 다른 얘기입니다."},
            {speaker:"세르안",text:"그리고 저쪽이 왜 두드리지 않았는지는 여전히 모릅니다."}
          ];
        }
        return [
          {speaker:"세르안",text:"침묵은 정보가 적습니다."},
          {speaker:"리안",text:"그래도 그 안에서 우리가 어떻게 움직여왔는지는 남습니다."}
        ];
      },

      choices:(s)=>{
        if(getEvent6Variant(s)==="closed_by_us"){
          return [
            {
              id:"keep_closed",
              text:"비공식 교류 중단을 유지한다.",
              effects:{selfProtection:2,caution:1},
              log:"비공식 교류 중단 방침을 유지했다.",
              aftermath:[
                {type:"narration",text:"왕실은 방침을 바꾸지 않는다. 필요한 공식 연락만 기존 경로로 주고받는다."},
                {speaker:"카르덴",text:"경계가 유지됩니다. 그만큼 왕국 안쪽에 쓸 수 있는 것도 늘어납니다."},
                {speaker:"리안",text:"관계가 사라진 것은 아닙니다. 다만 지금은 거리가 관계의 형태가 됐습니다."}
              ]
            },
            {
              id:"reopen_formal",
              text:"공식 교류부터 다시 연다.",
              effects:{reciprocity:1,caution:1},
              log:"중단했던 교류 중 공식 접촉부터 다시 열었다.",
              aftermath:[
                {type:"narration",text:"왕실은 정례적인 공식 교류부터 다시 시작하겠다는 뜻을 보낸다."},
                {speaker:"세르안",text:"닫았던 문을 전부 여는 건 아닙니다. 확인 가능한 범위부터 다시 여는 겁니다."},
                {speaker:"발렌",text:"적어도 다시 움직이긴 하는군."}
              ]
            },
            {
              id:"reopen_informal",
              text:"비공식 교류까지 다시 연다.",
              effects:{initiative:2,warmth:1,pressure:1},
              log:"먼저 닫았던 비공식 교류를 다시 열었다.",
              aftermath:[
                {type:"narration",text:"왕실은 공식 연락뿐 아니라 이전처럼 편한 왕래도 다시 받아들이겠다는 뜻을 전한다."},
                {speaker:"리안",text:"이번에는 우리가 닫았던 거리를 우리가 다시 줄이는 겁니다."},
                {speaker:"카르덴",text:"다시 열기로 했다면, 이전과 같은 소모 방식으로 돌아가지는 않는지도 보겠습니다."}
              ]
            }
          ];
        }

        return [
          {
            id:"continue_contact",
            text:"평소처럼 교류를 이어간다.",
            effects:{initiative:1,warmth:1},
            log:"평소처럼 교류를 이어가기로 했다.",
            aftermath:[
              {type:"narration",text:"왕실은 특별한 해명을 요구하지 않고, 자연스러운 교류가 생기면 평소처럼 응답하기로 한다."},
              {speaker:"리안",text:"이어가는 것 자체가 어떤 결론을 의미할 필요는 없습니다."}
            ]
          },
          {
            id:"wait_their_move",
            text:"다음 움직임은 동부가 먼저 하게 둔다.",
            effects:{caution:2,uncertainty:1},
            log:"다음 움직임은 동부가 먼저 하도록 두었다.",
            aftermath:[
              {type:"narration",text:"왕실은 새 제안을 보내지 않는다. 국경은 그대로 조용하다."},
              {speaker:"세르안",text:"새 정보가 생길 수도 있고, 생기지 않을 수도 있습니다."}
            ]
          },
          {
            id:"lower_priority",
            text:"동부 교류의 우선순위를 낮춘다.",
            effects:{selfProtection:2,caution:1},
            log:"관계를 유지하되 동부 교류의 우선순위를 낮췄다.",
            aftermath:[
              {type:"narration",text:"동부 관련 일정은 왕국의 다른 업무보다 뒤로 밀린다."},
              {speaker:"카르덴",text:"관계를 없애는 것과, 왕국의 중심에서 내려놓는 것은 다릅니다."}
            ]
          },
          {
            id:"formal_only",
            text:"필요한 공식 교류만 유지한다.",
            effects:{selfProtection:2,reciprocity:1,warmth:-1},
            log:"동부와 필요한 공식 교류만 유지하기로 했다.",
            aftermath:[
              {type:"narration",text:"비공식 왕래와 추가 제안은 줄이고, 필요한 공식 서신만 오간다."},
              {speaker:"리안",text:"관계를 끊은 건 아닙니다. 형태를 바꾼 겁니다."}
            ]
          }
        ];
      }
    }  ];

  function scrollToTop(){
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clampState(){
    ["initiative","caution","reciprocity","pressure","selfProtection","uncertainty","warmth"]
      .forEach(k => state[k] = Math.max(0, Math.min(12, state[k])));
  }

  function renderBeats(containerId, beats){
    const box = $(containerId);
    box.innerHTML = "";
    (beats || []).forEach(beat => {
      const div = document.createElement("div");
      div.className = "story-beat";
      if(beat.type === "narration") div.classList.add("narration");
      if(beat.type === "throne") div.classList.add("thronebeat");
      if(beat.speaker){
        const speaker = document.createElement("span");
        speaker.className = "speaker";
        speaker.textContent = beat.speaker;
        div.appendChild(speaker);
      }
      const text = document.createElement("span");
      text.textContent = beat.text;
      div.appendChild(text);
      box.appendChild(div);
    });
  }


  // DESIGN NOTE — TIMER:
  // 타이머는 모든 사건의 공통 규칙이 아니다.
  // "시간 자체가 상황의 의미인 사건"에서만 사용한다.
  // TIMEOUT은 실패가 아니라 상황 변화로 취급하며,
  // 향후 사건별로 강제 결과 / 압박 / 새 선택 / 상대 선행 행동 등으로 변주한다.
  let decisionTimerHandle = null;
  let decisionTimeLeft = 0;
  let timerExpiredForEvent = null;

  function stopDecisionTimer(){
    if(decisionTimerHandle !== null){
      clearInterval(decisionTimerHandle);
      decisionTimerHandle = null;
    }
  }

  function updateTimerUI(total){
    const value = $("timerValue");
    const fill = $("timerFill");
    if(!value || !fill) return;
    const sec = Math.max(0, decisionTimeLeft);
    value.textContent = `00:${String(sec).padStart(2,"0")}`;
    fill.style.width = `${Math.max(0, Math.min(100, (sec/total)*100))}%`;
  }

  function openSilencePrompt(){
    stopDecisionTimer();
    $("silenceModal").classList.add("open");
  }

  function startDecisionTimer(ev){
    stopDecisionTimer();
    const wrap = $("decisionTimer");
    wrap.classList.remove("active");
    if(!ev.timed || timerExpiredForEvent === ev.id) return;

    decisionTimeLeft = ev.timerSeconds || 20;
    updateTimerUI(decisionTimeLeft);
    wrap.classList.add("active");

    const total = decisionTimeLeft;
    armDecisionTimer(total);
  }

  function armDecisionTimer(total){
    decisionTimerHandle = setInterval(() => {
      decisionTimeLeft -= 1;
      updateTimerUI(total);
      if(decisionTimeLeft <= 0){
        timerExpiredForEvent = events[state.eventIndex].id;
        openSilencePrompt();
      }
    },1000);
  }

  function sceneArtMarkup(id){
    const commonStart = `<svg viewBox="0 0 900 320" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#19120d"/><stop offset="1" stop-color="#513820"/></linearGradient><filter id="blur"><feGaussianBlur stdDeviation="5"/></filter></defs><rect width="900" height="320" fill="url(#g)"/>`;
    if(id === "first_envoy" || id === "second_envoy"){
      return commonStart + `<circle cx="720" cy="70" r="95" fill="#c59a55" opacity=".13"/><path d="M605 320V116h18V72h34v44h19v204M747 320V92h22V48h38v44h22v228" fill="#100d0a" opacity=".9"/><path d="M690 320c5-70 18-124 42-162 24 38 37 92 42 162" fill="#17110d"/><path d="M731 158l-34 47h68z" fill="#a87c42" opacity=".32"/><rect x="688" y="205" width="88" height="8" fill="#0e0b09"/></svg>`;
    }
    if(id === "festival"){
      return commonStart + `<circle cx="735" cy="86" r="64" fill="#e2b45f" opacity=".23"/><path d="M520 250 Q640 150 805 225" stroke="#d8a657" stroke-width="2" fill="none" opacity=".7"/><g fill="#d8a657" opacity=".65">${[0,1,2,3,4,5,6].map(i=>`<circle cx="${555+i*38}" cy="${220-Math.sin(i)*22}" r="4"/>`).join("")}</g><path d="M520 320l40-110 32 110m70 0 38-128 35 128m40 0 28-96 30 96" fill="#15100c"/><rect x="0" y="272" width="900" height="48" fill="#0d0a08"/></svg>`;
    }
    if(id === "late_reply"){
      return commonStart + `<rect x="575" y="82" width="245" height="160" rx="2" fill="#2a2016" stroke="#83643e"/><rect x="597" y="104" width="201" height="112" fill="#c4a875" opacity=".18"/><path d="M604 111l94 60 93-60" stroke="#9d7b4e" fill="none" opacity=".7"/><circle cx="697" cy="171" r="15" fill="#7e3d31"/><path d="M522 320c20-78 47-116 78-116s55 38 72 116" fill="#120e0b" opacity=".9"/></svg>`;
    }
    if(id === "canceled_meeting"){
      return commonStart + `<rect x="535" y="205" width="285" height="15" fill="#17110d"/><rect x="565" y="220" width="18" height="100" fill="#120e0b"/><rect x="774" y="220" width="18" height="100" fill="#120e0b"/><path d="M605 210v-68c0-18 18-32 38-32s38 14 38 32v68" stroke="#1a1410" stroke-width="18" fill="none"/><path d="M720 210v-68c0-18 18-32 38-32s38 14 38 32v68" stroke="#1a1410" stroke-width="18" fill="none" opacity=".46"/><rect x="652" y="164" width="74" height="48" fill="#b18b57" opacity=".18"/><path d="M652 164l37 26 37-26" stroke="#b18b57" opacity=".45" fill="none"/></svg>`;
    }
    if(id === "empty_border"){
      return commonStart + `<path d="M520 320l110-155 70 91 72-135 128 199z" fill="#17120e"/><path d="M540 320c60-75 104-95 169-115 66-20 108-59 163-130" stroke="#7c6c55" stroke-width="5" fill="none" opacity=".36"/><rect x="684" y="110" width="12" height="150" fill="#100d0a"/><path d="M696 118l94 28-94 30z" fill="#715333" opacity=".55"/><rect y="278" width="900" height="42" fill="#0c0907"/><circle cx="790" cy="76" r="48" fill="#c8a66a" opacity=".09"/></svg>`;
    }
    return commonStart + `<circle cx="735" cy="92" r="90" fill="#b99257" opacity=".12"/><path d="M610 320l75-175 64 175m-172 0h250" stroke="#17110d" stroke-width="20" fill="none"/></svg>`;
  }

  function renderSceneArt(ev){
    $("sceneArt").innerHTML = sceneArtMarkup(ev.id);
  }

  // DESIGN NOTE — RECAP:
  // 성향 평가가 아니라 "무엇을 했는가"만 사실로 기록한다.
  // 플레이어의 이유/감정/진짜 의도는 게임이 대신 규정하지 않는다.
  // v6.8.0 — MULTI-KINGDOM CONTINUATIONS
  // 한 국가를 최고 관계로 선정하지 않는다. 실제 선택에서 나온 후속 사실을 함께 보여준다.
  function getKingdomContinuations(){
    const h = state.choiceHistory || {};
    const lines = [];
    const north = {
      north_scout:"북부와 비무장 연락로가 열렸다.",
      north_fortify:"북부 국경의 불빛은 서로의 경계를 확인하는 신호로 남았다.",
      north_letter:"북부와 정기적으로 행렬의 목적을 알리기로 했다."
    };
    const south = {
      south_counter:"남부와 다음 수로 구간도 공동 조건으로 검토하기로 했다.",
      south_accept:"남부 상단은 착공을 이어가며 다음 공정표를 보냈다.",
      south_reject:"남부 상단은 물러났지만 다음 계절의 재협상 창구는 남았다."
    };
    const west = {
      west_renegotiate:"서부는 곡물 대신 종자와 농기구를 보내겠다고 답했다.",
      west_adapt:"서부의 지원 없이 겨울 계획을 세웠고, 오래된 우방의 답신은 아직 오지 않았다.",
      west_protest:"서부 의회가 항의문을 접수했고 공식 답신을 준비 중이다."
    };
    const east = {
      continue_contact:"동부와의 교류는 평소처럼 이어진다.",
      wait_their_move:"동부의 다음 접촉을 기다리기로 했다.",
      lower_priority:"동부와의 교류는 낮은 우선순위로 남았다.",
      formal_only:"동부와 필요한 공식 연락만 이어간다.",
      keep_closed:"동부와의 비공식 교류는 닫힌 채로 남았다.",
      reopen_formal:"동부와 공식 교류부터 다시 열었다.",
      reopen_informal:"동부와 비공식 교류까지 다시 열었다."
    };
    if(north[h.north_patrol]) lines.push(north[h.north_patrol]);
    if(south[h.south_contract]) lines.push(south[h.south_contract]);
    if(west[h.west_grain]) lines.push(west[h.west_grain]);
    if(east[h.empty_border]) lines.push(east[h.empty_border]);
    return lines;
  }
  function buildRecap(){
    const h = state.choiceHistory || {};
    const values = Object.values(h);
    const initiated = new Set(["proactive_exchange","warmer_welcome","propose_next","check_in","propose_meeting","reschedule","ask_reason","continue_contact","reopen_formal","reopen_informal"]);
    const waited = new Set(["formal_observe","observe_more","end_warmly","wait","leave_ball","wait_their_move"]);
    const matched = new Set(["polite_welcome","match_effort","stay_longer","tea_in_box","festival_pastry"]);
    const reduced = new Set(["lower_contact","pause_contact","stop_initiating","lower_priority","formal_only","keep_closed"]);
    const count = set => values.filter(v => set.has(v)).length;
    const rows = [
      ["기록된 결정", values.length],
      ["먼저 움직인 결정", count(initiated)],
      ["기다리거나 여지를 둔 결정", count(waited)],
      ["상대의 움직임에 맞춘 결정", count(matched)],
      ["교류를 줄인 결정", count(reduced)],
      ["답하지 않은 결정", state.silenceCount || 0]
    ];
    $("recap").innerHTML = `
      <div class="recap-title">이번 통치의 기록</div>
      <div class="recap-grid">${rows.map(([label,n])=>`<div class="recap-item">${label}<strong>${n}회</strong></div>`).join("")}</div>
      <div class="recap-note"><strong>이어지는 외교</strong><br>${getKingdomContinuations().join("<br>")}</div><div class="recap-note">왕실 기록에는 무엇을 했는지가 남았다. 왜 그렇게 결정했는지는 적혀 있지 않다.</div>
    `;
  }

  function renderChronicle(){
    $("chronicle").innerHTML = state.logs.length
      ? state.logs.map(l => `<div class="log"><strong>${l.title}</strong><br>${l.text}</div>`).join("")
      : `<div class="log">아직 기록된 결정이 없습니다.</div>`;
  }

  function renderDebug(){
    $("debugPanel").textContent = JSON.stringify({
      initiative:state.initiative,
      caution:state.caution,
      reciprocity:state.reciprocity,
      pressure:state.pressure,
      selfProtection:state.selfProtection,
      uncertainty:state.uncertainty,
      warmth:state.warmth,
      choiceHistory:state.choiceHistory,
      event5Variant: state.eventIndex >= 4 ? getEvent5Variant(state) : null,
      event5Branch: state.eventIndex >= 4 ? getEvent5BranchLabel(state) : null,
      lateReplyVariant: state.eventIndex >= 3 ? getLateReplyVariant(state) : null,
      lateReplyBranch: state.eventIndex >= 3 ? getLateReplyBranchLabel(state) : null
    }, null, 2);
  }

  function renderDecision(ev){
    const opinions = typeof ev.opinions === "function" ? ev.opinions(state) : ev.opinions;
    const choices = typeof ev.choices === "function" ? ev.choices(state) : ev.choices;
    const exchange = ev.courtExchange
      ? (typeof ev.courtExchange === "function" ? ev.courtExchange(state) : ev.courtExchange)
      : [];

    $("advisorList").innerHTML = "";
    opinions.forEach(([key,text]) => {
      const m = advisorMeta[key];
      const card = document.createElement("article");
      card.className = "advisor";
      card.dataset.advisorKey = key;
      card.innerHTML = `
        <div class="advisor-head">
          <div class="sigil">${m.icon}</div>
          <div>
            <div class="advisor-name">${m.name} <span style="font-weight:400;color:#9f927f">·</span> ${m.role}</div>
          </div>
        </div>
        <p>${text}</p>
      `;
      $("advisorList").appendChild(card);
    });

    if(exchange && exchange.length){
      renderBeats("courtExchange", exchange);
      $("courtExchangeWrap").hidden = false;
    }else{
      $("courtExchange").innerHTML = "";
      $("courtExchangeWrap").hidden = true;
    }

    $("choiceList").innerHTML = "";
    choices.forEach((choice, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice";
      btn.textContent = choice.text;
      btn.addEventListener("click", () => {
        choose(choice, idx);
        scrollToTop();
      });
      $("choiceList").appendChild(btn);
    });

    $("branchNote").textContent =
      state.eventIndex < events.length - 1
        ? ""
        : "";

    startDecisionTimer(ev);
    triggerReframeBleed(ev);
  }

  function triggerReframeBleed(ev){
    if(ev.id !== "late_reply" || state.reframeBleedSeen) return;
    if(typeof document.querySelectorAll !== "function") return;
    state.reframeBleedSeen = true;
    const functionRoles = {chancellor:"분석"};
    const originals = [];
    document.querySelectorAll(".advisor[data-advisor-key]").forEach(card => {
      const key = card.dataset.advisorKey;
      const label = card.querySelector(".advisor-name");
      if(!label || !functionRoles[key]) return;
      originals.push([label,label.innerHTML]);
      label.textContent = advisorMeta[key].name + " · " + functionRoles[key];
    });
    document.body.classList.add("reframe-bleed");
    setTimeout(() => {
      originals.forEach(([label,html]) => { label.innerHTML = html; });
      document.body.classList.remove("reframe-bleed");
    },1250);
  }

  function render(){
    stopDecisionTimer();
    const ev = events[state.eventIndex];
    renderSceneArt(ev);

    $("eventNo").textContent = `Event ${state.eventIndex+1} / ${events.length}`;
    // DESIGN NOTE — DYNAMIC FIELD RESOLUTION: title may be a function for structural branches.
    $("eventTitle").textContent = typeof ev.title === "function" ? ev.title(state) : ev.title;
    $("eventDescription").textContent = typeof ev.description === "function" ? ev.description(state) : ev.description;
    $("progressText").textContent = `Event ${state.eventIndex+1} / ${events.length}`;
    $("chapterText").textContent = ev.chapter;
    $("progressBar").style.width = `${((state.eventIndex+1)/events.length)*100}%`;

    $("introPanel").hidden = true;
    $("decisionPanel").hidden = true;
    $("aftermathPanel").hidden = true;
    $("courtExchangeWrap").hidden = true;

    if(state.stage === "intro" && ev.intro){
      const beats = typeof ev.intro === "function" ? ev.intro(state) : ev.intro;
      renderBeats("introBeats", beats);
      $("introPanel").hidden = false;
      $("introContinueBtn").textContent = state.eventIndex === 0 ? "사절을 맞이한다" : "회의를 계속한다";
    }else{
      renderDecision(ev);
      $("decisionPanel").hidden = false;
    }

    renderChronicle();
    renderDebug();
  }

  function choose(choice, idx){
    stopDecisionTimer();
    $("decisionTimer").classList.remove("active");
    $("silenceModal").classList.remove("open");

    Object.entries(choice.effects || {}).forEach(([k,v]) => {
      if(typeof state[k] === "number") state[k] += v;
    });
    clampState();

    const ev = events[state.eventIndex];

    if(choice.id){
      state.choiceHistory[ev.id] = choice.id;
    }
state.logs.unshift({title:(typeof ev.title === "function" ? ev.title(state) : ev.title), text:choice.log});

    if(choice.aftermath){
      state.stage = "aftermath";
      state.pendingAdvance = state.eventIndex === events.length - 1 ? "finish" : "next";
      renderBeats("aftermathBeats", choice.aftermath);
      $("introPanel").hidden = true;
      $("decisionPanel").hidden = true;
      $("aftermathPanel").hidden = false;
      $("aftermathContinueBtn").textContent = state.eventIndex === events.length - 1 ? "왕실 기록을 닫는다" : "며칠 뒤";
      renderChronicle();
      renderDebug();
      return;
    }

    if(state.eventIndex === events.length - 1){ finish(); return; }
    state.eventIndex += 1;
    state.stage = events[state.eventIndex].intro ? "intro" : "decision";
    render();
  }

  function finish(){
    stopDecisionTimer();
    const endings = {
      continue_contact:"평소처럼 동부와의 교류를 이어가기로 했다.",
      wait_their_move:"다음 접촉은 동부가 먼저 하도록 두었다.",
      lower_priority:"교류를 유지하되 동부 외교의 우선순위를 낮췄다.",
      formal_only:"필요한 공식 연락만 유지하기로 했다.",
      keep_closed:"비공식 교류 중단을 유지했다.",
      reopen_formal:"공식 교류부터 다시 시작하기로 했다.",
      reopen_informal:"중단했던 비공식 교류까지 다시 열었다."
    };
    $("endingLine1").textContent = "열 번의 결정 뒤에도 왕국의 관계들은 한 가지 결말로 닫히지 않았다.";
    $("endingLine2").textContent = getKingdomContinuations().join(" ");
    buildRecap();
    $("gameLayout").style.display = "none";
    $("ending").style.display = "flex";
    document.querySelector(".progress-wrap").style.visibility = "hidden";
  }

  $("introContinueBtn").addEventListener("click", () => {
    state.stage = "decision";
    render();
    scrollToTop();
  });

  $("aftermathContinueBtn").addEventListener("click", () => {
    if(state.pendingAdvance === "finish"){
      state.pendingAdvance = null;
      finish();
      scrollToTop();
      return;
    }
    state.pendingAdvance = null;
    state.eventIndex += 1;
    state.stage = events[state.eventIndex].intro ? "intro" : "decision";
    render();
    scrollToTop();
  });

  $("debugCheck").addEventListener("change", e => {
    $("debugPanel").style.display = e.target.checked ? "block" : "none";
  });


  $("confirmSilenceBtn").addEventListener("click", () => {
    const ev = events[state.eventIndex];
    if(ev.id !== "canceled_meeting") return;
    state.silenceCount += 1;
    choose({
      id:"silence",
      text:"침묵한다.",
      effects:{caution:1,selfProtection:1,uncertainty:2},
      log:"취소된 회담에 즉시 답하지 않았다.",
      aftermath:[
        {type:"narration",text:"해가 지고 동부 전령이 빈손으로 돌아간다. 왕실에서는 답신을 보내지 않았다."},
        {speaker:"세르안",text:"결정을 미룬 것인지, 답하지 않기로 한 것인지는 기록만으로 알 수 없습니다."},
        {speaker:"발렌",text:"저쪽에서는 답이 없었다는 사실만 보겠군요."},
        {speaker:"리안",text:"침묵에도 거리는 생깁니다. 그 의미까지 우리가 정할 수는 없습니다."},
        {speaker:"카르덴",text:"적어도 오늘 더 쓴 것은 없습니다. 그게 무엇을 뜻하는지는 별개의 문제입니다."}
      ]
    }, -1);
    scrollToTop();
  });

  $("returnDecisionBtn").addEventListener("click", () => {
    stopDecisionTimer();
    timerExpiredForEvent = events[state.eventIndex]?.id || null;
    $("silenceModal").classList.remove("open");
    $("decisionTimer").classList.remove("active");
    scrollToTop();
  });

  $("restartBtn").addEventListener("click", () => {
    stopDecisionTimer();
    timerExpiredForEvent = null;
    $("silenceModal").classList.remove("open");
    state = makeInitialState();
    $("gameLayout").style.display = "grid";
    $("ending").style.display = "none";
    document.querySelector(".progress-wrap").style.visibility = "visible";
    $("debugCheck").checked = false;
    $("debugPanel").style.display = "none";
    render();
    scrollToTop();
  });

  // Shared transition boundary: preserve Round 1 progress and remaining time.
  let suspendedTimer = false;
  let suspendedSilence = false;
  window.KingWasMeRound1 = Object.freeze({
    isFinished: () => $("ending").style.display === "flex",
    suspend(){
      suspendedTimer = decisionTimerHandle !== null;
      suspendedSilence = $("silenceModal").classList.contains("open");
      stopDecisionTimer();
      $("silenceModal").classList.remove("open");
    },
    resume(){
      if(suspendedSilence) $("silenceModal").classList.add("open");
      const ev = events[state.eventIndex];
      if(suspendedTimer && state.stage === "decision" && ev.timed
          && timerExpiredForEvent !== ev.id){
        updateTimerUI(ev.timerSeconds || 20);
        armDecisionTimer(ev.timerSeconds || 20);
      }
      suspendedTimer = false;
      suspendedSilence = false;
    }
  });

  render();
})();