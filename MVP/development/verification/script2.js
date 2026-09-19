/* ============================================================================
   SECOND READING RUNTIME
   Independent runtime: intentionally does not mutate 1회차 state.

   UNITY IMPLEMENTATION NOTE
   -------------------------
   - Keep 1회차/2회차 UI hierarchy mostly identical.
   - Reuse the same major prefabs:
     EventPanel / AdvisorPanel / ChoicePanel / ChroniclePanel / ProgressPanel.
   - Switch visual identity through ThemeData / ScriptableObject / material/font set.
   - 1회차 Theme:
     dark / medieval / brass-gold / serif / hard borders.
   - 2회차 Theme:
     light / modern-neutral / cool-gray / muted teal / same layout.
   - Do NOT build a separate messenger-app HUD as the core 2회차 UI.
   - Phone/message/calendar should appear as scene props or short contextual overlays.
   - Camera compositions may intentionally echo each other:
       throne position -> desk chair
       royal table -> everyday table/desk
       sealed letter -> phone resting on table
       empty border -> quiet room / no notification / empty seat
   - The visual rhyme should be discoverable, not explained.
   - Cutscenes may become clearly modern, but never explain the metaphor as a fact.
   - "Reality is shown; interpretation is not."
   ============================================================================ */
(() => {
  const $2 = id => document.getElementById(id);

  // DESIGN NOTE — SECOND READING ROLE REFRAME:
  // 이름은 그대로 유지하지만 왕실 직책은 제거한다.
  // 2회차의 네 인물은 설명되는 "감정 캐릭터"가 아니라,
  // 플레이어 안에서 반복해서 등장하는 판단/행동/관계/경계의 목소리로 보이게 한다.
  const meta = {
    chancellor:{name:"세르안",role:"판단",icon:"◇"},
    marshal:{name:"발렌",role:"행동",icon:"→"},
    envoy:{name:"리안",role:"관계",icon:"◎"},
    warden:{name:"카르덴",role:"경계",icon:"□"}
  };

  // DESIGN NOTE — SECOND READING SURFACE:
  // v6.5 이후: 1회차와 UI 구성을 공유하고 밝은 표면으로 전환한다.
  // 같은 이름/기능/선택 구조만 남기고, 왕국이라는 가면은 UI에서도 제거한다.

  const makeState = () => ({
    eventIndex:0,
    stage:"intro",
    pendingAdvance:null,
    history:{},
    logs:[],
    initiated:0,
    waited:0,
    matched:0,
    reduced:0,
    timedOut:0
  });

  let s = makeState();
  let timerHandle = null;
  let timeLeft = 0;
  let timerResolved = false;

  function getSecondScene6Variant(s){
    const last = s.history?.canceled_plan_real;
    if(last === "pull_back_real") return "distance_by_me";
    return "default";
  }

  // DESIGN NOTE — SECOND READING STRONG BRANCH:
  // 1회차의 "교류 중단"처럼, 2회차에서 스스로 거리를 둔 선택도
  // 다음 장면을 실제로 바꾼다. 강한 선택이 다음 장면에서 희석되지 않도록 한다.

  // DESIGN NOTE — SECOND READING CHOICE SPECIFICITY:
  // 현실 행동은 1회차보다 구체적일 수 있지만,
  // 같은 화면의 선택지끼리는 같은 수준의 구체도를 유지한다.
  // 정확한 메시지 문구/소품은 aftermath에서 장면으로 보여준다.

  // Scene 6 is the remembered relationship state; it is never overwritten by the new conversation.
  function continuation(s){
    const id=s.history.quiet_gap_real;
    const variants={
      continue_normal_real:{summary:"평소처럼 연락을 이어가기로 했다.", scene:"가끔 안부를 보냈다. 답이 온 날도, 대화가 이어지지 않은 날도 있었다. 다음 만남의 날짜는 정해지지 않았다."},
      wait_other_real:{summary:"다음 연락은 상대가 먼저 하도록 두었다.",scene:"새로운 메시지를 보내지 않았다. 대화창의 마지막 날짜가 며칠 더 지난다. 새 약속은 잡히지 않았다."},
      lower_priority_real:{summary:"관계의 우선순위를 낮췄다.",scene:"연락을 끊지는 않았다. 대화창을 확인하는 사이에 다른 일정들이 들어왔다. 새로운 만남의 날짜는 없다."},
      keep_formal_real:{summary:"필요한 연락만 유지하기로 했다.",scene:"필요한 용건만 짧게 주고받았다. 안부와 다음 약속 이야기는 꺼내지 않았다."},
      keep_distance_real:{summary:"먼저 만든 거리를 유지했다.",scene:"먼저 연락하지 않았다. 상대에게서도 새 제안은 오지 않았다. 중단한 연락은 아직 다시 시작되지 않았다."},
      reopen_light_real:{summary:"가벼운 연락부터 다시 시작했다.",scene:"짧은 안부를 보냈고, 며칠 뒤 짧은 답을 받았다. 대화는 거기에서 멈췄다. 다음 약속은 없다."},
      reopen_direct_real:{summary:"다시 만나자고 먼저 제안했다.",scene:"다시 만나자는 메시지를 보냈다. 시간이 나면 알려주겠다는 답이 왔다. 달력에 적을 날짜는 아직 없다."}
    };
    return variants[id] || {summary:"여섯 번의 결정이 기록에 남았다.",scene:"대화창에는 지난 연락이 남아 있다. 새로운 약속은 아직 없다."};
  }

  const events2 = [
    {
      id:"first_contact_real",
      title:"먼저 온 연락",
      chapter:"다시 읽는 장면 1",
      description:"얼마 전 알게 된 사람에게서 먼저 메시지가 왔다.\n길지 않은 안부와, 다음에 또 이야기하고 싶다는 말.\n아직 아무 약속도 정해진 것은 없다.",
      phoneTime:"오늘 · 18:12",
      phone:"오늘 이야기 재밌었어\n다음에 또 얘기하자",
      intro:[
        {type:"narration",text:"예상하지 않았던 알림이 화면에 뜬다."},
        {speaker:"세르안",text:"먼저 연락이 왔다는 건 사실이야. 그 이상은 아직 몰라."},
        {speaker:"발렌",text:"답하면 돼. 어느 정도로 답할지만 정하면 되고."}
      ],
      opinions:[
        ["chancellor","먼저 연락이 왔다는 건 좋은 정보야. 다만 다음 관계까지 약속한 건 아니야."],
        ["marshal","지금 답할 수 있어. 더 이어가고 싶으면 그걸 행동으로 보여주면 되고."]
      ],
      exchange:[
        {speaker:"발렌",text:"생각만 하다가 타이밍 놓칠 필요는 없잖아."},
        {speaker:"세르안",text:"타이밍을 놓치지 않는 것과 의미를 앞서 정하는 건 다른 얘기야."}
      ],
      choices:[
        {
          id:"reply_polite_real",
          text:"편하게 답하고 대화를 마무리한다.",
          kind:"matched",
          log:"먼저 온 연락에 편하게 답했다.",
          aftermath:[
            {type:"narration",text:"가볍게 답을 주고받은 뒤 대화는 자연스럽게 끝난다."},
            {speaker:"발렌",text:"무난했네."},
            {speaker:"세르안",text:"응. 지금 확인된 것도 그 정도야."}
          ]
        },
        {
          id:"reply_forward_real",
          text:"다음에 또 보자고 먼저 제안한다.",
          kind:"initiated",
          log:"첫 연락에서 다음 만남을 먼저 제안했다.",
          aftermath:[
            {type:"narration",text:"다음에 시간이 맞으면 직접 보자는 뜻을 먼저 전한다."},
            {type:"narration",text:"상대는 좋다고 답하지만 날짜까지 정하지는 않는다."},
            {speaker:"세르안",text:"긍정적인 답이야. 확정된 약속은 아니고."}
          ]
        },
        {
          id:"reply_light_real",
          text:"짧게 답하고 다음 움직임을 지켜본다.",
          kind:"waited",
          log:"첫 연락에 짧게 답한 뒤 다음 움직임을 기다렸다.",
          aftermath:[
            {type:"narration",text:"필요한 답만 남기고 새 주제를 먼저 꺼내지는 않는다."},
            {speaker:"발렌",text:"이번엔 저쪽이 다시 오나 보는 거네."}
          ]
        },
        {
          id:"small_reply_real",
          text:"말보다 작은 호의로만 답한다.",
          kind:"matched",
          log:"긴 답 대신 작은 호의를 남겼다.",
          aftermath:[
            {type:"narration",text:"길게 말을 이어가기보다, 전에 이야기했던 작은 정보를 하나 챙겨 보낸다."},
            {speaker:"세르안",text:"이것도 답이야. 뜻까지 대신 정하진 말자."}
          ]
        }
      ]
    },
    {
      id:"second_contact_real",
      title:"두 번째 연락",
      chapter:"다시 읽는 장면 2",
      description:"며칠 뒤, 상대가 다시 먼저 연락해왔다.\n이번에는 단순한 안부보다 조금 더 길다.\n대화 끝에는 ‘언제 한번 편하게 보자’는 말이 붙어 있다.",
      phoneTime:"오늘 · 21:06",
      phone:"요즘 어때?\n시간 되면 언제 한번 보자",
      intro:[
        {type:"narration",text:"이번에도 먼저 알림이 온 쪽은 상대다."},
        {speaker:"세르안",text:"두 번 연속 먼저 연락이 왔어. 그 사실은 지난번보다 정보가 많아졌다는 뜻이야."},
        {speaker:"발렌",text:"그럼 이번에는 더 확실히 잡아도 되지 않아?"},
        {type:"narration",text:"익숙하지 않은 목소리가 끼어든다."},
        {speaker:"리안",text:"상대가 한 걸음 왔다고 우리가 두 걸음 갈 필요는 없지."}
      ],
      opinions:[
        ["chancellor","반복된 먼저 연락은 분명한 패턴이야. 다만 친근함과 약속은 여전히 달라."],
        ["envoy","저쪽이 먼저 다가왔어. 우리도 비슷한 온도로 답하면 충분해."],
        ["marshal","흐름이 있을 때 다음 만남을 실제 일정으로 만들 수 있어."]
      ],
      exchange:[
        {speaker:"세르안",text:"우호적인 건 맞아. 약속이라고 부르진 말자."},
        {speaker:"리안",text:"약속이라고 안 해도 돼. 먼저 다가온 사실까지 지울 필요도 없고."}
      ],
      choices:[
        {
          id:"warmer_reply_real",
          text:"이전보다 적극적으로 대화를 이어간다.",
          kind:"initiated",
          log:"두 번째 연락에는 이전보다 적극적으로 응답했다.",
          aftermath:[
            {type:"narration",text:"대화가 길어지고, 서로 근황을 조금 더 나눈다."},
            {speaker:"리안",text:"온도는 올라갔어. 그게 어디까지 갈지는 아직 모르고."}
          ]
        },
        {
          id:"match_reply_real",
          text:"상대가 보인 정도만큼만 응답한다.",
          kind:"matched",
          log:"두 번째 연락에 비슷한 온도로 응답했다.",
          aftermath:[
            {type:"narration",text:"상대가 보낸 길이와 비슷한 정도로 대화를 이어간다."},
            {speaker:"리안",text:"같은 속도면 충분해."}
          ]
        },
        {
          id:"observe_reply_real",
          text:"좋은 신호로 받아들이되 더 지켜본다.",
          kind:"waited",
          log:"두 번째 연락을 긍정적으로 받아들이되 속도는 높이지 않았다.",
          aftermath:[
            {type:"narration",text:"대화는 이어가지만 먼저 약속을 잡지는 않는다."},
            {speaker:"세르안",text:"정보는 늘었어. 결론을 서두를 이유는 아직 없어."}
          ]
        }
      ]
    },
    {
      id:"good_evening",
      title:"좋았던 저녁",
      chapter:"다시 읽는 장면 3",
      description:"몇 번의 연락 끝에 만난 저녁.\n원래는 밥만 먹고 헤어질 생각이었다.\n그런데 시간이 꽤 늦었는데도 상대는 먼저 자리에서 일어나지 않는다.",
      phoneTime:"오늘 · 22:41",
      phone:"오늘 재밌었어 ㅋㅋ\n다음에 또 보자",
      intro:[
        {type:"narration",text:"식당을 나온 뒤에도 대화가 끊기지 않는다."},
        {speaker:"상대",text:"시간 괜찮으면 조금 더 걸을래?"},
        {type:"narration",text:"예정에는 없던 제안이다."},
        {speaker:"리안",text:"상대가 먼저 시간을 더 쓰겠다고 했어. 좋은 신호인 건 맞아."},
        {speaker:"세르안",text:"좋은 신호라는 것과, 그 다음 의미까지 안다는 건 다른 얘기야."}
      ],
      opinions:[
        ["envoy","지금은 다음 약속을 잡기보다, 이 시간이 실제로 편한지 보는 것도 방법이야."],
        ["marshal","흐름 좋아. 다음 만남까지 잡으려면 지금이 제일 자연스러워."],
        ["chancellor","오늘 오래 함께 있었다는 사실은 남아. 미래 약속은 아직 없고."]
      ],
      exchange:[
        {speaker:"발렌",text:"기회 있을 때 잡자는 얘기야."},
        {speaker:"리안",text:"모든 좋은 순간을 다음 일정으로 바꿀 필요는 없어."}
      ],
      choices:[
        {
          id:"stay_longer",
          text:"조금 더 같이 시간을 보낸다.",
          kind:"matched",
          log:"좋았던 저녁을 조금 더 이어갔다.",
          aftermath:[
            {type:"narration",text:"둘은 근처를 한 바퀴 더 걷는다."},
            {speaker:"상대",text:"오늘 생각보다 오래 있었네."},
            {type:"narration",text:"다음 약속 이야기는 나오지 않는다. 그래도 헤어질 때 분위기는 나쁘지 않다."}
          ]
        },
        {
          id:"ask_next",
          text:"다음 만남을 먼저 물어본다.",
          kind:"initiated",
          log:"좋은 분위기 속에서 다음 만남을 먼저 물었다.",
          aftermath:[
            {type:"narration",text:"헤어지기 전 다음 주쯤 다시 볼 수 있는지 먼저 묻는다."},
            {speaker:"상대",text:"다음 주는 아직 잘 모르겠어. 일정 보고 말해줄게."},
            {speaker:"발렌",text:"적어도 물었어."},
            {speaker:"세르안",text:"답이 확정된 건 아니고."}
          ]
        },
        {
          id:"end_warmly",
          text:"좋은 분위기에서 오늘은 헤어진다.",
          kind:"waited",
          log:"좋은 분위기에서 다음을 정하지 않고 헤어졌다.",
          aftermath:[
            {type:"narration",text:"오늘 즐거웠다는 인사만 남기고 각자 집으로 향한다."},
            {speaker:"리안",text:"좋은 끝도 관계에 남아."}
          ]
        },
        {
          id:"small_gesture",
          text:"다음 얘기 대신 작은 호의만 건넨다.",
          kind:"matched",
          log:"다음 약속 대신 작은 호의를 남겼다.",
          aftermath:[
            {type:"narration",text:"헤어지기 전 작은 간식 하나를 건넨다."},
            {speaker:"상대",text:"이건 뭐야 ㅋㅋ"},
            {speaker:"리안",text:"가끔은 관계에 설명 없는 여지도 필요해."},
            {speaker:"발렌",text:"생각 끝에 간식이네."}
          ]
        }
      ]
    },
    {
      id:"late_reply_real",
      title:"늦은 답장",
      chapter:"다시 읽는 장면 4",
      description:"마지막 메시지를 보낸 지 이틀이 지났다.\n읽음 표시는 남아 있지만 답은 없다.\n평소보다 길어진 빈칸이 눈에 들어오기 시작한다.",
      phoneTime:"읽음 · 2일 전",
      phone:"오늘 들어가서 연락할게\n\n읽음",
      intro:[
        {type:"narration",text:"휴대폰을 열었다 닫는 일이 몇 번 반복된다."},
        {speaker:"발렌",text:"궁금하면 확인하면 돼."},
        {speaker:"세르안",text:"답이 없다는 건 사실이야. 이유까지 아는 건 아니고."},
        {speaker:"리안",text:"지금까지 내가 먼저 움직인 적이 많았다면 이번에는 상대 차례일 수도 있어."},
        {type:"narration",text:"이번에는 또 다른 목소리가 끼어든다."},
        {speaker:"카르덴",text:"이거 때문에 오늘 할 일을 계속 미루고 있는 것도 봐야 해."}
      ],
      opinions:[
        ["chancellor","이틀 늦었다는 사실만 있어. 관계가 달라졌다는 결론은 아직 없고."],
        ["marshal","애매한 게 문제라면 짧게 확인할 수 있어."],
        ["envoy","확인은 할 수 있지만, 상대가 먼저 움직일 공간도 남아 있어."],
        ["warden","답을 기다리는 동안 내 하루가 얼마나 묶이는지도 봐야 해."]
      ],
      exchange:[
        {speaker:"발렌",text:"확인 한 번이 그렇게 큰 일이야?"},
        {speaker:"카르덴",text:"확인 자체보다, 그게 끝이 아닐 가능성을 보는 거야."}
      ],
      choices:[
        {
          id:"wait_reply",
          text:"먼저 연락하지 않고 기다린다.",
          kind:"waited",
          log:"상대가 먼저 답할 때까지 기다리기로 했다.",
          aftermath:[
            {type:"narration",text:"메시지 창을 닫고 원래 하려던 일을 계속한다."},
            {type:"narration",text:"그날 밤까지 새 답장은 오지 않는다."},
            {speaker:"세르안",text:"아직 새로 알게 된 건 없어."},
            {speaker:"카르덴",text:"그래도 하루 전체를 멈추지는 않았어."}
          ]
        },
        {
          id:"check_in_real",
          text:"부담이 적게 안부만 확인한다.",
          kind:"matched",
          log:"짧게 안부만 확인했다.",
          aftermath:[
            {type:"narration",text:"길게 이유를 묻지 않고, 괜찮은지만 짧게 확인하는 메시지를 보낸다."},
            {type:"narration",text:"메시지는 전송된다. 답은 아직 없다."},
            {speaker:"리안",text:"확인과 추궁은 달라."}
          ]
        },
        {
          id:"ask_meet_real",
          text:"직접 만나서 이야기하자고 제안한다.",
          kind:"initiated",
          log:"답장 지연 뒤 직접 만남을 먼저 제안했다.",
          aftermath:[
            {type:"narration",text:"메시지로 추측을 이어가기보다 시간이 될 때 직접 이야기하자는 뜻을 전한다."},
            {speaker:"발렌",text:"이제 적어도 내가 뭘 원하는지는 분명해."},
            {speaker:"세르안",text:"분명해진 건 내 행동이야. 상대 답은 아직이고."}
          ]
        },
        {
          id:"step_back_real",
          text:"당분간 연락 빈도를 줄인다.",
          kind:"reduced",
          log:"당분간 연락 빈도를 줄이기로 했다.",
          aftermath:[
            {type:"narration",text:"당분간 먼저 연락하는 횟수를 줄이고, 평소처럼 내 일정을 이어간다."},
            {speaker:"카르덴",text:"관계를 끝낸 게 아니라, 내 쪽 소모를 줄인 거야."},
            {speaker:"리안",text:"그 거리가 상대에게 어떻게 보일지는 아직 몰라."}
          ]
        }
      ]
    },
    {
      id:"canceled_plan_real",
      title:"취소된 약속",
      chapter:"다시 읽는 장면 5",
      timed:true,
      timerSeconds:20,
      description:"며칠 뒤 잡혀 있던 약속을 앞두고 메시지가 온다.\n\n“미안, 오늘은 좀 어려울 것 같아.”\n\n대체 날짜는 적혀 있지 않다.\n상대는 잠시 뒤 이동해야 한다고 덧붙였다.",
      phoneTime:"방금",
      phone:"미안, 오늘은 좀 어려울 것 같아.\n나 조금 있다 이동해야 해.",
      intro:[
        {type:"narration",text:"화면에는 짧은 취소 메시지만 남아 있다."},
        {speaker:"발렌",text:"이유를 확인할 수 있어."},
        {speaker:"세르안",text:"취소됐다는 사실과 관계가 바뀌었다는 결론은 구분해야 해."},
        {speaker:"리안",text:"대체 일정이 없다는 건 보되, 그 의미까지 먼저 정하진 말자."},
        {speaker:"카르덴",text:"이번 약속 때문에 비워둔 시간도 이미 쓴 비용이야."}
      ],
      opinions:[
        ["chancellor","지금 확인된 건 오늘 약속이 취소됐다는 것뿐이야."],
        ["marshal","지금 물으면 적어도 다음 행동은 정할 수 있어."],
        ["envoy","다시 만날 의지가 있다면 상대가 다음 움직임을 보일 여지도 남길 수 있어."],
        ["warden","오늘 생긴 빈 시간을 다시 내 쪽으로 돌리는 것도 선택이야."]
      ],
      exchange:[
        {speaker:"발렌",text:"답 보내는 데 오래 걸릴 일은 아니야."},
        {speaker:"세르안",text:"그렇다고 빨리 고른 답이 더 정확하다는 뜻도 아니고."}
      ],
      choices:[
        {
          id:"offer_another_day",
          text:"다른 날을 먼저 제안한다.",
          kind:"initiated",
          log:"취소된 약속에 다른 날을 먼저 제안했다.",
          aftermath:[
            {type:"narration",text:"가능한 다른 날짜를 하나 골라 다시 만날 수 있는지 묻는다."},
            {type:"narration",text:"메시지는 전송된다. 상대의 답은 아직 오지 않는다."}
          ]
        },
        {
          id:"ask_reason_real",
          text:"취소된 이유를 직접 확인한다.",
          kind:"initiated",
          log:"약속이 취소된 이유를 직접 확인했다.",
          aftermath:[
            {type:"narration",text:"무슨 일이 있는지 짧게 묻는다."},
            {speaker:"세르안",text:"질문을 보냈다는 사실 외에는 아직 아무것도 달라진 게 없어."}
          ]
        },
        {
          id:"leave_room_real",
          text:"괜찮다고만 하고 다음 행동은 맡긴다.",
          kind:"waited",
          log:"취소를 받아들이고 다음 움직임을 상대에게 남겼다.",
          aftermath:[
            {type:"narration",text:"괜찮다는 뜻만 짧게 전하고 다음 날짜를 먼저 묻지는 않는다."},
            {speaker:"리안",text:"이번에는 상대가 움직일 공간을 남겼어."}
          ]
        },
        {
          id:"pull_back_real",
          text:"답만 하고 당분간 거리를 둔다.",
          kind:"reduced",
          log:"취소를 받아들이되 당분간 거리를 두기로 했다.",
          aftermath:[
            {type:"narration",text:"짧게 답한 뒤 휴대폰을 내려놓는다."},
            {speaker:"카르덴",text:"오늘의 빈자리를 계속 붙들고 있을 필요는 없어."}
          ]
        }
      ],
      timeoutChoices:[
        {
          id:"timeout_ack",
          text:"짧게 알겠다고만 답한다.",
          kind:"matched",
          log:"상대가 먼저 이동한 뒤 짧게 답했다.",
          aftermath:[
            {type:"narration",text:"상대가 먼저 이동한 뒤, 짧게 알겠다는 답만 남긴다."},
            {speaker:"리안",text:"처음보다 선택 폭은 줄었어. 그래도 답의 온도는 고를 수 있었고."}
          ]
        },
        {
          id:"timeout_wait",
          text:"오늘은 더 보내지 않는다.",
          kind:"waited",
          log:"상대가 이동한 뒤 그날은 더 연락하지 않았다.",
          aftermath:[
            {type:"narration",text:"상대가 이동했다는 메시지를 마지막으로 그날은 더 보내지 않는다."},
            {speaker:"발렌",text:"시간이 먼저 선택 하나를 없앴네."},
            {speaker:"세르안",text:"결론을 낸 게 아니라, 가능한 행동 일부가 지나간 거야."}
          ]
        },
        {
          id:"timeout_future",
          text:"시간 될 때 다시 알려달라고 남긴다.",
          kind:"reduced",
          log:"다음 움직임을 상대에게 남겼다.",
          aftermath:[
            {type:"narration",text:"지금 다시 일정을 잡지는 않고, 여유가 생기면 알려달라는 뜻만 남긴다."},
            {speaker:"카르덴",text:"오늘의 결정 비용은 여기서 멈췄어."}
          ]
        }
      ]
    },
    {
      id:"quiet_gap_real",

      title:(s)=> getSecondScene6Variant(s)==="distance_by_me"
        ? "내가 만든 거리"
        : "아무 일도 없는 며칠",

      chapter:"다시 읽는 장면 6",

      description:(s)=>{
        if(getSecondScene6Variant(s)==="distance_by_me"){
          return "약속이 취소된 뒤, 나는 당분간 거리를 두기로 했다.\n며칠 동안 먼저 연락하지 않았다.\n상대도 그 거리를 억지로 줄이려 하지는 않았다.\n\n새로운 거절도, 새로운 약속도 없다.\n이번 침묵에는 내가 만든 부분도 있다.";
        }
        return "며칠이 더 지났다.\n새로운 약속도, 분명한 거절도 없다.\n연락은 이전보다 뜸해졌고, 그 사실만 남아 있다.";
      },

      phoneTime:(s)=> getSecondScene6Variant(s)==="distance_by_me"
        ? "마지막 대화 · 5일 전"
        : "마지막 대화 · 4일 전",

      phone:(s)=> getSecondScene6Variant(s)==="distance_by_me"
        ? "응 알겠어\n\n그 뒤로 새 메시지는 없다"
        : "응 알겠어\n나중에 연락할게",

      intro:(s)=>{
        if(getSecondScene6Variant(s)==="distance_by_me"){
          return [
            {type:"narration",text:"휴대폰에는 새 알림이 없다."},
            {speaker:"발렌",text:"내가 먼저 거리를 뒀고, 상대도 더 들어오지 않았네."},
            {speaker:"세르안",text:"맞아. 그래서 이번 침묵을 전부 상대 행동으로 읽으면 안 돼."},
            {speaker:"리안",text:"내가 만든 거리와 상대가 지킨 거리를 구분해서 봐야 해."},
            {speaker:"카르덴",text:"그리고 그 거리가 실제로 내 하루를 덜 소모시키고 있는지도."}
          ];
        }
        return [
          {type:"narration",text:"휴대폰에는 새 알림이 없다."},
          {speaker:"발렌",text:"진전도 없고, 끝났다는 말도 없네."},
          {speaker:"세르안",text:"그래서 해석이 제일 많아지는 상태야."},
          {speaker:"카르덴",text:"확실하지 않은 걸 확실하다고 믿지 않는 것도 필요해."},
          {speaker:"리안",text:"상대가 어떻게 느끼는지는 아직 몰라. 내가 어떻게 움직일지는 정할 수 있고."}
        ];
      },

      opinions:(s)=>{
        if(getSecondScene6Variant(s)==="distance_by_me"){
          return [
            ["chancellor","이번 침묵에는 내가 먼저 만든 거리가 포함돼 있어. 상대가 왜 그 거리를 줄이지 않았는지는 아직 몰라."],
            ["envoy","상대가 경계를 존중한 것과 관계를 놓은 것은 같은 말이 아니야."],
            ["warden","거리 두기가 실제로 내 생활을 회복시키고 있다면, 그 효과도 정보야."],
            ["marshal","원하면 다시 움직일 수 있어. 이번엔 내가 만든 거리를 내가 다시 줄이는 거고."]
          ];
        }
        return [
          ["chancellor","지금도 모르는 건 모르는 채로 남아 있어. 사실과 해석을 분리하자."],
          ["envoy","관계를 이어가더라도 상대가 움직일 공간은 남길 수 있어."],
          ["warden","무엇을 선택하든 내 일상에서 어디까지 자원을 쓸지 정해야 해."],
          ["marshal","계속할 수도 있고, 물러날 수도 있어. 행동은 내 쪽에서 정하면 돼."]
        ];
      },

      exchange:(s)=>{
        if(getSecondScene6Variant(s)==="distance_by_me"){
          return [
            {speaker:"발렌",text:"내가 먼저 멈췄으면, 다시 시작하는 것도 내가 할 수 있지."},
            {speaker:"리안",text:"응. 다만 다시 시작하는 건 이전 상태로 자동 복귀한다는 뜻은 아니야."},
            {speaker:"세르안",text:"그리고 상대가 왜 가만히 있었는지는 여전히 몰라."}
          ];
        }
        return [
          {speaker:"세르안",text:"이번에도 이유까지는 몰라."},
          {speaker:"리안",text:"그래도 내가 어떤 식으로 관계를 이어왔는지는 알아."}
        ];
      },

      choices:(s)=>{
        if(getSecondScene6Variant(s)==="distance_by_me"){
          return [
            {
              id:"keep_distance_real",
              text:"지금 거리를 그대로 유지한다.",
              kind:"reduced",
              log:"내가 만든 거리를 당분간 유지했다.",
              aftermath:[
                {type:"narration",text:"먼저 연락하지 않는 흐름을 당분간 그대로 둔다."},
                {speaker:"카르덴",text:"거리를 유지하는 것도 하나의 행동이야."}
              ]
            },
            {
              id:"reopen_light_real",
              text:"가벼운 연락부터 다시 시작한다.",
              kind:"initiated",
              log:"가벼운 연락부터 다시 시작했다.",
              aftermath:[
                {type:"narration",text:"부담 없는 주제로 짧게 연락을 다시 시작한다."},
                {speaker:"세르안",text:"다시 열었어. 그 이상 의미는 아직 없어."},
                {speaker:"리안",text:"이전과 똑같이 돌아가는 게 아니라, 새 거리에서 다시 시작하는 거야."}
              ]
            },
            {
              id:"reopen_direct_real",
              text:"다시 만나자고 먼저 제안한다.",
              kind:"initiated",
              log:"내가 만든 거리를 줄이고 다시 만남을 먼저 제안했다.",
              aftermath:[
                {type:"narration",text:"당분간 멈췄던 연락 뒤, 직접 다시 만나자는 뜻을 먼저 전한다."},
                {speaker:"발렌",text:"이번엔 내가 닫았던 걸 내가 다시 연 거네."}
              ]
            }
          ];
        }

        return [
          {
            id:"continue_normal_real",
            text:"평소처럼 관계를 이어간다.",
            kind:"initiated",
            log:"평소처럼 관계를 이어가기로 했다.",
            aftermath:[
              {type:"narration",text:"특별히 의미를 확인하려 하지 않고, 자연스러운 일이 생기면 평소처럼 연락한다."},
              {speaker:"리안",text:"계속 이어간다는 것 자체가 답일 필요는 없어."}
            ]
          },
          {
            id:"wait_other_real",
            text:"다음 연락은 상대가 먼저 하게 둔다.",
            kind:"waited",
            log:"다음 연락은 상대가 먼저 하도록 두었다.",
            aftermath:[
              {type:"narration",text:"새로운 메시지를 보내지 않고 내 일상을 이어간다."},
              {speaker:"세르안",text:"기다리는 동안 새 정보가 생길 수도 있고, 안 생길 수도 있어."}
            ]
          },
          {
            id:"lower_priority_real",
            text:"관계의 우선순위를 낮춘다.",
            kind:"reduced",
            log:"관계를 유지하되 내 일상에서의 우선순위를 낮췄다.",
            aftermath:[
              {type:"narration",text:"연락을 끊지는 않지만, 하루의 중심에서 이 관계를 조금 멀리 둔다."},
              {speaker:"카르덴",text:"관계를 없애는 것과 내 삶의 중심에서 내리는 건 달라."}
            ]
          },
          {
            id:"keep_formal_real",
            text:"필요한 연락만 주고받는다.",
            kind:"reduced",
            log:"필요한 연락만 유지하기로 했다.",
            aftermath:[
              {type:"narration",text:"일상적인 안부나 먼저 건네는 연락은 줄이고, 필요한 일이 있을 때만 답한다."},
              {speaker:"리안",text:"관계를 끝낸 건 아니야. 모양을 바꾼 거지."}
            ]
          }
        ];
      }
    },
    {
      id:"facing_result_real", title:"남아 있는 날짜", chapter:"그 뒤의 날들",
      description:s=>continuation(s).scene+"\n\n다음 주말의 달력은 비어 있다. 그 주말을 어떻게 보낼지는 아직 정하지 않았다.",
      phoneTime:"몇 주 뒤", phone:s=>continuation(s).summary,
      intro:s=>[
        {type:"narration",text:continuation(s).scene},
        {speaker:"발렌",text:"날짜를 적을 수 있는 답은 아니네."},
        {speaker:"세르안",text:"응. 그렇다고 우리가 하지 않은 일까지 없었던 건 아니야."},
        {speaker:"리안",text:"한쪽에서 정한 다음 단계만으로 둘의 약속이 되지는 않으니까."}
      ],
      opinions:[
        ["chancellor","확인된 일과 아직 없는 일을 나눠 적자."],
        ["marshal","달력이 비어 있다면 다른 일을 넣을 수도 있어."],
        ["envoy","연락의 모양과 다음 만남의 유무는 따로 볼 수 있어."],
        ["warden","이 주말을 통째로 비워둘 필요가 있는지도 보자."]
      ],
      choices:[
        {id:"note_result",text:"지금까지 있었던 일을 짧게 적는다.",log:"연락과 약속의 현재 상태를 적었다.",aftermath:[
          {type:"narration",text:"보낸 연락, 받은 답, 정해지지 않은 날짜를 한 줄씩 적는다. 이유를 적는 칸은 비워둔다."},
          {speaker:"세르안",text:"지금 확인할 수 있는 건 여기까지네."}
        ]},
        {id:"close_calendar",text:"달력을 덮고 오늘 할 일을 확인한다.",log:"달력을 덮고 오늘의 일정을 확인했다.",aftermath:[
          {type:"narration",text:"달력을 덮는다. 연락 기록이 지워지지는 않는다. 책상 옆에는 오늘의 할 일이 놓여 있다."},
          {speaker:"카르덴",text:"이쪽에도 남아 있는 일이 있어."}
        ]}
      ]
    },
    {
      id:"ordinary_day_real",title:"창문을 여는 아침",chapter:"그 뒤의 날들",
      description:"주말 아침이다.\n식탁에는 어제 두고 간 컵이 있고, 창밖에서 버스가 지나간다.\n오늘은 정해진 약속이 없다. 할 수 있는 일은 몇 가지 있다.",
      phoneTime:"토요일 아침",phone:"새 약속 없음. 오늘의 시간은 남아 있다.",
      intro:[
        {type:"narration",text:"물을 끓이는 동안 창문을 연다. 방 안으로 바깥 소리가 들어온다."},
        {speaker:"발렌",text:"나가면 늦은 아침도 먹을 수 있겠네."},
        {speaker:"카르덴",text:"여기서 쉬어도 돼. 오늘 해야 하는 일은 많지 않아."},
        {speaker:"리안",text:"그 연락과 별개로 잡을 수 있는 일정도 있고."}
      ],
      opinions:[
        ["chancellor","오늘 할 일은 오늘 정하면 돼. 이전 결정의 증명일 필요는 없어."],
        ["marshal","미뤄둔 일을 하나 끝낼 시간이 있어."],
        ["envoy","밖으로 나가거나 다른 사람과 시간을 보낼 수도 있어."],
        ["warden","아무 약속 없이 쉬는 시간도 남겨두자."]
      ],
      choices:[
        {id:"walk_today",text:"밖에 나가 산책한다.",log:"주말 아침에 산책했다.",aftermath:[{type:"narration",text:"휴대폰을 주머니에 넣고 문을 나선다. 골목 끝 가게가 셔터를 올리고 있다."}]},
        {id:"finish_task_today",text:"미뤄둔 일을 하나 끝낸다.",log:"미뤄둔 일을 하나 끝냈다.",aftermath:[{type:"narration",text:"책상 위 종이를 모으고 할 일 하나에 줄을 긋는다. 창문은 열린 채다."}]},
        {id:"rest_today",text:"집에서 쉬며 시간을 보낸다.",log:"집에서 쉬며 주말 시간을 보냈다.",aftermath:[{type:"narration",text:"따뜻한 컵을 식탁에 내려놓는다. 서두르지 않고 아침을 먹는다."}]}
      ]
    },
    {
      id:"new_message_real",title:"짧은 안부",chapter:"다시 결정하는 순간",
      description:"오후에 휴대폰이 한 번 울린다.\n한동안 연락하지 않았던 다른 사람의 대화창이다.\n\n“뭐해?”\n\n짧은 메시지 하나가 도착했다.",
      phoneTime:"같은 날 오후",phone:"다른 대화창에 도착한 짧은 안부",
      intro:[
        {type:"narration",text:"화면에 익숙한 이름과 두 글자가 떠 있다."},
        {speaker:"발렌",text:"지금 답할 수 있잖아."},
        {speaker:"세르안",text:"무슨 이야기를 하려는지는 아직 몰라."},
        {speaker:"리안",text:"안부에는 안부로 답해도 돼."},
        {speaker:"카르덴",text:"지금 하던 일을 어디까지 할지도 정하자."}
      ],
      opinions:[
        ["chancellor","짧은 안부가 왔어. 다음 이야기는 답한 뒤에 생길 수도 있어."],
        ["marshal","지금 대화를 시작할 수 있어."],
        ["envoy","짧게 답하고 상대의 다음 말을 기다릴 수도 있어."],
        ["warden","하던 일을 끝낸 다음 연락해도 돼."]
      ],
      choices:[
        {id:"answer_now_real",text:"지금 안부에 답하고 대화를 시작한다.",kind:"initiated",log:"새 안부에 답하고 대화를 시작했다.",aftermath:[{type:"narration",text:"지금 하고 있는 일을 짧게 전하고 안부를 묻는다. 메시지가 전송된다."}]},
        {id:"answer_brief_real",text:"짧게 답하고 다음 말을 기다린다.",kind:"matched",log:"새 안부에 짧게 답하고 다음 말을 기다렸다.",aftermath:[{type:"narration",text:"짧은 답을 보낸다. 다음 이야기를 먼저 꺼내지는 않는다."}]},
        {id:"answer_later_real",text:"하던 일을 끝낸 뒤 답한다.",kind:"waited",log:"하던 일을 마친 뒤 새 안부에 답했다.",aftermath:[{type:"narration",text:"하던 일을 마친다. 잠시 뒤 휴대폰을 다시 들어 안부에 답한다."}]}
      ]
    },
    {
      id:"empty_throne",title:"빈 왕좌",chapter:"마지막 장면",quiet:true,
      description:"탁자 위에 기록이 놓여 있다.\n익숙한 네 자리가 있고, 그 앞의 왕좌는 비어 있다.",
      phoneTime:"남아 있는 기록",phone:s=>continuation(s).summary,
      intro:[
        {type:"narration",text:"밝은 창의 빛이 길게 늘어진다. 탁자와 네 사람의 자리는 낯설지 않다."},
        {speaker:"세르안",text:"아직 알 수 없는 건 남아 있습니다."},
        {speaker:"발렌",text:"그럼에도 다음 행동은 필요하겠죠."},
        {speaker:"리안",text:"상대가 움직일 자리도 남아 있습니다."},
        {speaker:"카르덴",text:"우리 쪽에서 감당할 범위도 봐야 합니다."},
        {type:"narration",text:"네 사람의 시선이 비어 있는 자리로 향한다."}
      ],
      opinions:[],
      choices:[{id:"take_seat",text:"왕좌로 걸어가 앉는다.",log:"왕좌에 앉았다.",aftermath:[
        {type:"narration",text:"탁자를 지나 왕좌까지 걸어간다. 시야가 낮아지고, 네 사람이 앞에 보인다."},
        {type:"narration",text:"잠시 아무도 말하지 않는다."},
        {speaker:"나",text:"내가 결정하지."}
      ]}]
    }
  ];

  function art(id){
    if(id==="empty_throne") return '<svg viewBox="0 0 900 320" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="320" fill="#e8e6df"/><path d="M565 320V120h150v200M580 122V72h120v50" fill="none" stroke="#687775" stroke-width="12"/><path d="M552 232h175M580 320v-83M700 320v-83" stroke="#687775" stroke-width="12"/><path d="M760 0l-90 320h230V0z" fill="#faf6e7" opacity=".6"/></svg>';
    if(id==="ordinary_day_real" || id==="facing_result_real") return '<svg viewBox="0 0 900 320" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="320" fill="#dfe9e8"/><rect x="560" y="35" width="210" height="175" fill="#f4f4e7" stroke="#839b99" stroke-width="6"/><path d="M665 35v175M560 124h210" stroke="#839b99" stroke-width="6"/><path d="M500 270h320M540 270v50M790 270v50" stroke="#7c918b" stroke-width="12"/><rect x="610" y="235" width="43" height="30" fill="#f9f7ed"/></svg>';

    const open = `<svg viewBox="0 0 900 320" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="s2g" x1="0" x2="1"><stop stop-color="#151a1e"/><stop offset="1" stop-color="#3b454c"/></linearGradient></defs><rect width="900" height="320" fill="url(#s2g)"/>`;
    if(id==="first_contact_real" || id==="second_contact_real"){
      return open+`<rect x="610" y="58" width="190" height="236" rx="26" fill="#f7f9fa" stroke="#9caeb4" stroke-width="3"/><rect x="630" y="92" width="150" height="55" rx="16" fill="#dff0ec"/><rect x="650" y="110" width="95" height="9" rx="5" fill="#6f8c91" opacity=".38"/><rect x="650" y="128" width="72" height="8" rx="4" fill="#6f8c91" opacity=".25"/><circle cx="705" cy="270" r="7" fill="#9aabad"/></svg>`;
    }
    if(id==="good_evening"){
      return open+`<circle cx="760" cy="70" r="70" fill="#d3b77f" opacity=".13"/><rect x="535" y="185" width="270" height="11" fill="#111518"/><rect x="570" y="196" width="14" height="124" fill="#111518"/><rect x="758" y="196" width="14" height="124" fill="#111518"/><circle cx="622" cy="155" r="24" fill="#15191c"/><path d="M590 320c5-78 17-133 32-141 16 8 29 63 35 141" fill="#15191c"/><circle cx="720" cy="155" r="24" fill="#15191c"/><path d="M686 320c7-78 19-133 34-141 16 8 28 63 35 141" fill="#15191c"/></svg>`;
    }
    if(id==="late_reply_real"){
      return open+`<rect x="610" y="56" width="190" height="236" rx="25" fill="#101417" stroke="#667078" stroke-width="3"/><rect x="628" y="84" width="154" height="174" rx="8" fill="#1e252a"/><rect x="647" y="112" width="104" height="12" rx="6" fill="#65717a" opacity=".45"/><rect x="667" y="142" width="84" height="11" rx="5" fill="#65717a" opacity=".28"/><circle cx="705" cy="273" r="7" fill="#69747b"/><circle cx="774" cy="59" r="65" fill="#b5a177" opacity=".08"/></svg>`;
    }
    if(id==="quiet_gap_real"){
      return open+`<rect x="620" y="70" width="160" height="210" rx="24" fill="#f7f9fa" stroke="#9caeb4" stroke-width="3"/><rect x="642" y="102" width="116" height="10" rx="5" fill="#879aa0" opacity=".22"/><rect x="642" y="132" width="90" height="10" rx="5" fill="#879aa0" opacity=".16"/><circle cx="700" cy="258" r="7" fill="#a7b4b8"/><path d="M520 320c24-62 62-95 112-95 48 0 86 33 110 95" fill="#d6e0e2" opacity=".45"/></svg>`;
    }
    return open+`<rect x="575" y="120" width="230" height="114" rx="11" fill="#1b2227" stroke="#667078"/><rect x="602" y="148" width="142" height="11" rx="5" fill="#7a858d" opacity=".38"/><rect x="602" y="177" width="178" height="11" rx="5" fill="#7a858d" opacity=".22"/><rect x="602" y="204" width="112" height="11" rx="5" fill="#7a858d" opacity=".20"/><path d="M522 320c18-79 45-121 80-121 34 0 60 42 77 121" fill="#121619" opacity=".95"/></svg>`;
  }

  function beatMarkup(b){
    const cls = b.type==="narration" ? "s2-beat narration" : "s2-beat";
    return `<div class="${cls}">${b.speaker?`<span class="speaker">${b.speaker}</span>`:""}${b.text}</div>`;
  }

  function renderBeats(id, beats){ $2(id).innerHTML=(beats||[]).map(beatMarkup).join(""); }

  function renderAdvisors(ev){
    $2("s2AdvisorHeading").hidden=!!ev.quiet;
    $2("s2DecisionCue").hidden=!!ev.quiet;
    $2("s2AdvisorList").hidden=!!ev.quiet;
    const opinions = typeof ev.opinions==="function" ? ev.opinions(s) : (ev.opinions||[]);
    $2("s2AdvisorList").innerHTML=opinions.map(([key,text])=>{
      const m=meta[key];
      return `<article class="s2-advisor"><div class="s2-advisor-head"><div class="s2-sigil">${m.icon}</div><div><div class="s2-advisor-name">${m.name} <span style="font-weight:500;color:#8a979c">·</span> ${m.role}</div></div></div><p>${text}</p></article>`;
    }).join("");
    const ex=typeof ev.exchange==="function" ? ev.exchange(s) : (ev.exchange||[]);
    $2("s2ExchangeWrap").hidden=!ex.length;
    renderBeats("s2Exchange",ex);
  }

  function renderChronicle(){
    $2("s2Chronicle").innerHTML=s.logs.length
      ? s.logs.map(x=>`<div class="s2-log"><strong>${x.title}</strong><br>${x.text}</div>`).join("")
      : `<div class="s2-log">아직 기록된 행동이 없다.</div>`;
  }

  function stopTimer(){
    if(timerHandle!==null){ clearInterval(timerHandle); timerHandle=null; }
  }

  function startTimer(ev){
    stopTimer();
    $2("s2DecisionTimer").classList.remove("active");
    if(!ev.timed || timerResolved) return;
    timeLeft=ev.timerSeconds||20;
    const total=timeLeft;
    const update=()=>{
      $2("s2TimerValue").textContent=`00:${String(Math.max(0,timeLeft)).padStart(2,"0")}`;
      $2("s2TimerFill").style.width=`${Math.max(0,Math.min(100,(timeLeft/total)*100))}%`;
    };
    update();
    $2("s2DecisionTimer").classList.add("active");
    timerHandle=setInterval(()=>{
      timeLeft-=1; update();
      if(timeLeft<=0) triggerTimeout(ev);
    },1000);
  }

  // DESIGN NOTE — TIMEOUT:
  // 타임아웃은 "침묵 실패"가 아니다.
  // 여기서는 상대가 먼저 이동하면서 처음의 선택지가 소멸하고,
  // 바뀐 상황에서 가능한 후속 행동만 새로 보여준다.
  function triggerTimeout(ev){
    stopTimer();
    timerResolved=true;
    s.timedOut+=1;
    $2("s2DecisionTimer").classList.remove("active");
    const timeoutList = $2("s2TimeoutChoices");
    timeoutList.innerHTML = "";
    (ev.timeoutChoices||[]).forEach((c,i)=>{
      const btn = document.createElement("button");
      btn.className = "s2-choice";
      btn.type = "button";
      btn.textContent = c.text;
      btn.dataset.s2Timeout = String(i);
      btn.addEventListener("click",()=>{
        const picked = ev.timeoutChoices[Number(btn.dataset.s2Timeout)];
        $2("s2TimeoutModal").classList.remove("open");
        choose(picked,true);
      });
      timeoutList.appendChild(btn);
    });
    $2("s2TimeoutModal").classList.add("open");
  }

  function markKind(kind){
    if(kind && Object.prototype.hasOwnProperty.call(s,kind)) s[kind]+=1;
  }

  function choose(choice,fromTimeout=false){
    stopTimer();
    $2("s2DecisionTimer").classList.remove("active");
    const ev=events2[s.eventIndex];
    s.history[ev.id]=choice.id;
    markKind(choice.kind);
    s.logs.unshift({title:(typeof ev.title === "function" ? ev.title(s) : ev.title),text:choice.log});
    s.stage="aftermath";
    s.pendingAdvance=s.eventIndex===events2.length-1?"finish":"next";
    renderBeats("s2AftermathBeats",choice.aftermath||[]);
    $2("s2IntroPanel").hidden=true;
    $2("s2DecisionPanel").hidden=true;
    $2("s2AftermathPanel").hidden=false;
    $2("s2AftermathContinueBtn").textContent=s.eventIndex===events2.length-1?"KING WAS ME":"다음";
    renderChronicle();
  }

  function renderChoices(ev){
    const list = $2("s2ChoiceList");
    list.innerHTML = "";
    const choices = typeof ev.choices==="function" ? ev.choices(s) : (ev.choices||[]);
    choices.forEach((c,i)=>{
      const btn = document.createElement("button");
      btn.className = "s2-choice";
      btn.type = "button";
      btn.textContent = c.text;
      btn.dataset.s2Choice = String(i);
      btn.addEventListener("click",()=>choose(choices[Number(btn.dataset.s2Choice)]));
      list.appendChild(btn);
    });
  }

  function render(){
    stopTimer();
    const ev=events2[s.eventIndex];
    $2("s2SceneArt").innerHTML=art(ev.id);
    $2("s2EventNo").textContent=`Scene ${s.eventIndex+1} / ${events2.length}`;
    $2("s2EventTitle").textContent=typeof ev.title==="function" ? ev.title(s) : ev.title;
    $2("s2EventDescription").textContent=typeof ev.description==="function" ? ev.description(s) : ev.description;
    $2("s2ProgressText").textContent=`${s.eventIndex+1} / ${events2.length}`;
    $2("s2ChapterText").textContent=ev.chapter;
    $2("s2ProgressBar").style.width=`${((s.eventIndex+1)/events2.length)*100}%`;
    $2("s2PhoneTime").textContent=typeof ev.phoneTime==="function" ? ev.phoneTime(s) : (ev.phoneTime||"");
    $2("s2PhoneNote").textContent=typeof ev.phone==="function" ? ev.phone(s) : (ev.phone||"");

    $2("s2IntroPanel").hidden=s.stage!=="intro";
    $2("s2DecisionPanel").hidden=s.stage!=="decision";
    $2("s2AftermathPanel").hidden=s.stage!=="aftermath";

    if(s.stage==="intro"){
      renderBeats("s2IntroBeats",typeof ev.intro==="function" ? ev.intro(s) : (ev.intro||[]));
      $2("s2IntroContinueBtn").textContent=ev.quiet?"빈 자리로 향한다":s.eventIndex===0?"장면을 계속 본다":"계속";
    }else if(s.stage==="decision"){
      renderAdvisors(ev);
      renderChoices(ev);
      startTimer(ev);
    }
    renderChronicle();
  }

  function buildRecap(){
    const rows=[
      ["기록된 결정",Object.keys(s.history).length],
      ["일상에서 내린 결정",s.history.ordinary_day_real?1:0],
      ["먼저 움직인 결정",s.initiated],
      ["기다린 결정",s.waited],
      ["상대 흐름에 맞춘 결정",s.matched],
      ["거리를 둔 결정",s.reduced],
      ["시간이 먼저 움직인 장면",s.timedOut]
    ];
    $2("s2Recap").innerHTML=`
      <div class="s2-recap-title">다시 읽은 기록</div>
      <div class="s2-recap-grid">${rows.map(([label,n])=>`<div class="s2-recap-item">${label}<strong>${n}회</strong></div>`).join("")}</div>
      <div class="s2-recap-note">기록에는 무엇을 했는지가 남았다. 그때 왜 그렇게 했는지는 여전히 한 문장으로 적히지 않는다.</div>
    `;
  }

  function finish(){
    stopTimer();
    buildRecap();
    $2("s2EndingLine1").textContent=continuation(s).summary;
    $2("s2EndingLine2").textContent=s.logs.find(x=>x.title==="짧은 안부")?.text || "새로운 안부에 답했다.";
    $2("s2GameLayout").style.display="none";
    $2("s2Ending").style.display="flex";
    document.querySelector(".s2-progress-wrap").style.visibility="hidden";
  }

  function resetSecond(){
    stopTimer();
    timerResolved=false;
    $2("s2TimeoutModal").classList.remove("open");
    s=makeState();
    $2("s2GameLayout").style.display="grid";
    $2("s2Ending").style.display="none";
    document.querySelector(".s2-progress-wrap").style.visibility="visible";
    render();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function enterSecond(){
    window.KingWasMeRound1.suspend();
    $2("s2BackBtn").textContent = window.KingWasMeRound1.isFinished()
      ? "1회차 엔딩으로 돌아가기" : "1회차 진행 화면으로 돌아가기";
    document.querySelector(".shell").style.display="none";
    $2("s2Shell").classList.add("active");
    $2("s2Shell").setAttribute("aria-hidden","false");
    resetSecond();
  }

  $2("secondPlayBtn").addEventListener("click",enterSecond);

  // DEV ONLY — direct Second Reading entry.
  // Internal iteration shortcut. Remove/disable for production builds.
  const devSecondPlayBtn = $2("devSecondPlayBtn");
  if(devSecondPlayBtn){
    devSecondPlayBtn.addEventListener("click", enterSecond);
  }

  $2("s2IntroContinueBtn").addEventListener("click",()=>{
    s.stage="decision"; render(); window.scrollTo({top:0,behavior:"smooth"});
  });

  $2("s2AftermathContinueBtn").addEventListener("click",()=>{
    if(s.pendingAdvance==="finish"){ s.pendingAdvance=null; finish(); return; }
    s.pendingAdvance=null;
    s.eventIndex+=1;
    timerResolved=false;
    s.stage="intro";
    render();
    window.scrollTo({top:0,behavior:"smooth"});
  });

  $2("s2RestartBtn").addEventListener("click",resetSecond);

  $2("s2BackBtn").addEventListener("click",()=>{
    stopTimer();
    $2("s2Shell").classList.remove("active");
    $2("s2Shell").setAttribute("aria-hidden","true");
    document.querySelector(".shell").style.display="block";
    window.KingWasMeRound1.resume();
    window.scrollTo({top:0,behavior:"smooth"});
  });
})();