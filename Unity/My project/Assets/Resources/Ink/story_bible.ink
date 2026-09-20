// KING WAS ME — 분기 구조 명세 (Ink)
// 원본: 04_story_bible.md §5.1 "분기 시스템 명세". 두 문서 구조가 어긋나면 그 섹션이 기준.
// 이 파일은 완성 대사가 아니라 "분기 로직 + 대표 텍스트"를 담은 구조 초안이다.
// Inky(https://github.com/inkle/inky, 무료)로 열면 실제로 플레이하며 분기 그래프를 검증할 수 있다.
// Major Branch 방문 루트 프로즈 반영 완료. 다국가 관계 지속 기준은 05_multi_kingdom_relationship_routes.md 참고.
//
// ── ACT 태그 ──────────────────────────────────────────────────────
// 런타임은 배경·틴트·음악을 ACT 단위로 고른다. ACT를 정하는 순서는 다음과 같다.
//   1) 그 사건 안에 `# act: N` 태그가 있으면 그것을 쓴다 (N = 1~5)
//   2) 없으면 knot 이름의 event_NN 번호로 구간을 찾는다 (기존 29사건이 이 경로)
//   3) 둘 다 없으면 직전 ACT를 유지하고 콘솔에 경고를 남긴다
//
// 루트 이름 knot(north_04, west_02, home_tax ...)에는 번호가 없으므로 1)이 유일한 방법이다.
// **태그는 반드시 본문 줄 끝에 붙인다.** knot 머리에 독립된 줄로 쓰면 런타임이 읽지 못한다.
//
//   === north_04 ===
//   국경 마을에서 양측 주민이 알아서 장을 연다. # act: 3 # title: 국경 장터
//
// ACT 구간: 1=작은 왕국 / 2=여러 이웃 / 3=흔들리는 국경 / 4=필요 없었던 전쟁 / 5=나라를 지키는 법
// (AssetCatalog.DefaultActs)

VAR initiative = 6
VAR caution = 6
VAR reciprocity = 6
VAR pressure = 0
VAR selfProtection = 6
VAR uncertainty = 6
VAR warmth = 6

VAR eastWarmth = 6
VAR eastPressure = 0
VAR northTension = 2
VAR southLeverage = 6
VAR westWarmth = 8
VAR coastalFamiliarity = 3

VAR pause_contact = false
VAR north_hardline = false
VAR north_deescalate = false
VAR south_hardline = false
VAR south_sacrifice = false
VAR watcher_unlocked = false
VAR royal_visit = false
VAR north_incident_occurred = false
VAR seran_introduced = false
VAR valen_introduced = false
VAR rian_introduced = false
VAR karden_introduced = false
VAR watcher_introduced = false
VAR chaplain_introduced = false
VAR fool_introduced = false

// 후반 대신 이름 — 가안(D9). 확정 시 이 선언만 고치면 전체에 반영된다.
// 자벨·니아·단은 사용자 확정명, 나머지는 가안(03_character_bible.md §4).
VAR name_watcher = "베이라"
VAR name_chaplain = "오르반"
VAR name_fool = "자벨"

// ── 사실 상태(D15) ───────────────────────────────────────────────
// 관계 수치와 별개로 "왕국이 실제로 어떤 상태인가"를 기록한다.
// 후속 사건의 서술이 이 값을 읽어 모순을 없앤다(예: 파견 취소 후 사절단 도착 금지).
//
// **임시 형태.** 아래 두 bool은 지금의 동부 단일 루트에서만 충분하다. 4개국 루트로 넓히면
// 사절은 준비/이동/체류/철수/취소, 왕은 준비/이동/체류/귀환처럼 단계가 필요해진다.
// 확장 시 문자열 상태로 바꾼다(east_form이 이미 그 형태다). 지금 굳히지 말 것.
VAR envoy_dispatched = true    // E18에서 사절단을 실제로 보냈는가
VAR king_abroad = false        // 왕이 지금 동부 땅에 있는가(E20 귀환 시 해제)
VAR east_form = "open"         // 동부 관계의 최종 형태: open | formal | bounded

// ── 북부 접촉 (비캐논 제안: MVP/development/NUMBERS_LEDGER_20260920.md §D) ──
// 북부는 우리가 먼저 움직여야만 오른다. 관문 2/4/6에서 다음 칸이 열린다.
// 일관된 행동은 +2, 습관과 어긋난 행동은 +1 — 정수 유지를 위해 원안(+1, 관문 1/2/3)을 2배로 옮겼다.
VAR northContact = 0
VAR north_form = "wary"        // quiet_trust | wary | frozen
VAR backlog_seen = false

// ── 1층: 선택 이력 ──
// 밖에 쓴 주의의 총량. 어느 나라든 여기로 들어간다(D14). 자원이 아니다.
VAR spent = 0
// 직전 선택의 계열. 일관성 보정에 쓴다: active | careful | hard
VAR last_family = ""

// ── 2층: 왕국 상태 ── 0~12. 밴드 0-2 위태 / 3-5 부족 / 6-8 보통 / 9-12 여유
// 국고·곡물·인력은 서재 장부에 보인다. morale은 보이지 않는다(D15).
VAR treasury = 8
VAR grain = 8
VAR labor = 7
VAR morale = 7

-> event_01

// 일관성 보정: 직전과 같은 계열이면 효과 그대로, 어긋나면 절반.
// 사람은 한 번의 행동이 아니라 패턴을 읽는다(NATION_AXES §2.2).
=== function consistent(fam) ===
~ return last_family == "" || last_family == fam

// 상태 클램프. Ink에는 대입 시 상한/하한이 없어 값이 범위를 벗어난다.
// 자원은 0~12(NUMBERS_LEDGER §E), northContact 바닥은 0(§D).
// 라우터마다 터널로 통과시킨다: -> clamp_state ->
=== clamp_state ===
{ northContact < 0:
    ~ northContact = 0
}
{ northTension < 0:
    ~ northTension = 0
}
{ northTension > 12:
    ~ northTension = 12
}
{ treasury < 0:
    ~ treasury = 0
}
{ treasury > 12:
    ~ treasury = 12
}
{ grain < 0:
    ~ grain = 0
}
{ grain > 12:
    ~ grain = 12
}
{ labor < 0:
    ~ labor = 0
}
{ labor > 12:
    ~ labor = 12
}
{ morale < 0:
    ~ morale = 0
}
{ morale > 12:
    ~ morale = 12
}
{ spent < 0:
    ~ spent = 0
}
->->


=== event_01 ===
~ seran_introduced = true
~ valen_introduced = true
// [내정] 즉위
// │ 장면: 즉위 첫날. 창고 장부와 실제 재고가 맞지 않는다. 큰 피해는 없다.
// │ 영향: 왕의 첫 판단 기준을 세운다. 이후 내정 사건의 기준선.
// │ 은유: 몸이 보내는 첫 신호. 아직 아프지는 않다.
// └ 상태: 본문 3줄 — 확장 필요
창고 장부와 실제 재고가 조금 다르다. 담당자는 기록 실수 가능성을 말한다. 당장 큰 피해는 없다.
{ seran_introduced: 세르안: 기록부터 맞춰야 합니다. }
{ valen_introduced: 발렌: 오늘 처리하면 내일 다시 안 봐도 됩니다. }
+ [기록을 다시 확인한다] -> event_02
+ [담당자를 불러 즉시 정리한다] -> event_02
+ [작은 오차로 보고 현 상태를 유지한다] -> event_02

=== event_02 ===
// [내정] 작은 분쟁
// │ 장면: 인접 마을의 물품 인도가 늦는다. 양쪽 주장이 다르다.
// │ 영향: 사실과 해석을 가르는 연습. 세르안/발렌 기능 대비.
// │ 은유: 누구 말이 맞는지 모르는 채로 정해야 하는 일.
// └ 상태: 본문 2줄 — 확장 필요
인접 마을 사이의 약속된 물품 인도가 이틀 늦어진다. 한쪽은 약속 위반, 다른 쪽은 폭우 때문이라 주장한다.
{ valen_introduced: 발렌: 그래서 다시 움직이면 되는 건 누굽니까? }
+ [원인을 추가 확인한다] -> event_03
+ [새 일정을 먼저 잡는다] -> event_03
+ [책임 소재부터 확인한다] -> event_03

=== event_03 ===
// [북부] 첫 국경 신호
// │ 장면: 국경 '밖에서' 병력 이동. 침범은 없다. 먼저 오지 않는다.
// │ 영향: northTension. 북부 루트의 시작. 먼저 움직일지 결정.
// │ 은유: 먼저 연락하지 않는 상대. 신호는 있는데 다가오지는 않는다.
// └ 상태: 본문 3줄 — 북부 메인 루트로 확장
북부 변경국 국경 밖에서 소규모 병력 이동이 관찰된다. 국경 침범은 없다.
{ seran_introduced: 세르안: 움직였다는 것과 공격한다는 것은 다릅니다. }
{ valen_introduced: 발렌: 그럼 대비만 하면 됩니다. }
+ [정찰 강화]
    ~ northTension += 1
    -> north_02
+ [수비 증강]
    ~ northTension += 1
    -> north_02
+ [외교 확인 요청] -> north_02
+ [관찰 유지] -> north_02

=== event_04 ===
// [동부] 새로운 왕국
// │ 장면: 동부 사절이 처음 도착한다. 선물 상자 하나.
// │ 영향: eastWarmth. 동부 루트 시작.
// │ 은유: 새로 생긴 연락. 크지 않은 호의.
// └ 상태: MVP 원문 이식 완료(17줄) — 기준 품질 — MVP(KINGDOM_SLICE first_envoy) 도입 대화/의견/선택 후 반응 이식 초안.
// 태그: phase(narration|advisors|exchange|aftermath), to(청자 id), stance(question|clarify|counter|support|pause). 수치/감정 단정 없음.
# scene: council
# title: 동부 왕국의 첫 사절
아침. 왕궁 바깥에서 종소리가 울린다. # phase: narration
문지기: 폐하. 동부 변경에서 사절단이 도착했습니다.
{ seran_introduced:
    세르안: 동부 왕국이라… 최근 직접적인 왕래는 없었던 곳입니다. 온 이유부터 듣지요. # phase: exchange
}
{ valen_introduced:
    발렌: 병력은? # phase: exchange
}
문지기: 호위병 여섯. 무장은 의례용 수준입니다.
{ valen_introduced:
    발렌: 위협은 아니군. # phase: exchange
}
{ seran_introduced:
    세르안: 모든 문제를 병력 수로 판단하실 겁니까? # phase: exchange # to: valen # stance: question
}
{ valen_introduced:
    발렌: 전쟁은 그렇게 시작됩니다. # phase: exchange # to: seran # stance: counter
}
왕의 허락이 떨어지자 거대한 문이 열리고 동부 왕국의 사절이 천천히 회의실 안으로 들어온다. # phase: narration # enter: east_envoy
동부 사절: 동부 왕국의 왕께서 귀국의 번영을 기원합니다. # phase: exchange
동부 사절: 앞으로 두 나라가 서로 교류할 수 있기를 희망한다는 뜻을 전하라 하셨습니다.
사절은 작은 나무 상자를 내민다. 동부 지역의 향신료와 차가 정갈하게 담겨 있다.
{ valen_introduced:
    발렌: 값은 크지 않습니다. # phase: exchange
}
{ seran_introduced:
    세르안: 값이 작다는 건 사실입니다. 의미까지 작다는 뜻은 아닙니다. # phase: exchange # to: valen # stance: clarify
}
{ valen_introduced:
    발렌: 또 해석입니까. # phase: exchange # to: seran # stance: counter
}
{ seran_introduced:
    세르안: 첫 접촉 자체가 우호적이라는 건 사실입니다. 다만 선물과 인사가 앞으로의 관계까지 약속한 것은 아닙니다. # phase: advisors
}
{ valen_introduced:
    발렌: 당장 대비할 위협은 없습니다. 어느 정도로 응답할지만 정하면 됩니다. # phase: advisors
}
+ [정식 답신]
    ~ eastWarmth += 1
    왕의 결정에 따라 사절은 정중한 환대를 받고, 동부 왕에게 감사의 뜻을 전해 받는다. # phase: aftermath
    사절의 굳어 있던 표정이 조금 누그러진다.
    { valen_introduced:
        발렌: 무난한 시작입니다.
    }
    { seran_introduced:
        세르안: 동의합니다. 아직은 그 이상을 붙일 이유도 없습니다. # to: valen # stance: support
    }
    사절단이 떠난 뒤, 왕궁 창가 너머로 동부의 깃발이 천천히 멀어진다. # exit: east_envoy
    며칠 후 — 양국은 예를 갖춘 첫 접촉을 마쳤다. # endphase
    -> event_05
+ [작은 답례]
    ~ eastWarmth += 1
    왕실은 별도의 긴 답신 대신, 비워진 상자에 왕실 차 한 봉을 넣어 사절에게 돌려준다. # phase: aftermath
    { valen_introduced:
        발렌: 답신이 이것뿐입니까? # stance: question
    }
    { seran_introduced:
        세르안: 이것도 답신입니다. 다만 뜻은 우리가 대신 정할 수 없겠군요. # to: valen # stance: clarify
    }
    사절은 상자를 받아 들고 예를 갖춘 뒤 돌아간다. 그 행동이 어떻게 읽힐지는 아직 알 수 없다. # endphase # exit: east_envoy
    -> event_05
+ [추가 정보 확인]
    왕실은 답신을 정하기 전에, 사절에게 동부 왕국에 대해 몇 가지를 더 묻는다. # phase: aftermath
    { valen_introduced:
        발렌: 지금 물어서 알 수 있는 게 있습니까? # stance: question
    }
    { seran_introduced:
        세르안: 알게 되는 것도 있고, 모른다는 것을 확인하게 되는 것도 있습니다. # to: valen # stance: clarify
    }
    사절은 아는 만큼만 답한다. 답하지 않은 부분이 무엇인지도 함께 남는다. # endphase # exit: east_envoy
    -> event_05
+ [짧은 예의만 표시]
    필요한 예만 갖춘 답신이 전달된다. # phase: aftermath
    사절은 잠시 머뭇거리지만 곧 예를 갖춰 물러난다.
    { valen_introduced:
        발렌: 이번에는 움직이지 않으시는군요. # stance: question
    }
    { seran_introduced:
        세르안: 아니면 저쪽이 다시 움직이는지 보려는 결정일 수도 있습니다. 어느 쪽인지는 아직 모릅니다. # to: valen # stance: clarify
    }
    사절단이 떠난 뒤, 왕궁은 평소의 일정으로 돌아간다. 동쪽에서 다시 무언가 올지는 아직 알 수 없다. # exit: east_envoy
    며칠 후 — 동부 사절은 답신을 기다린 채 돌아갔다. # endphase
    -> event_05

=== event_05 ===
// [남부] 조건이 다른 상인
// │ 장면: 남부 상단이 관세 재협상을 '먼저' 요청한다. 정중하지만 명확하다.
// │ 영향: south_hardline → E14 결렬형, E19 스킵.
// │ 은유: 먼저 다가오는 상대의 첫 제안. 반가움과 부담이 같이 온다.
// └ 상태: 본문 3줄 — 남부 메인 루트로 확장
남부 상업국 상단이 기존 무역 협정의 관세 조건을 재협상하자고 요청한다. 정중하지만 명확하다.
{ karden_introduced: 카르덴: 문서에 대안 무역로가 언급돼 있습니다. }
{ not karden_introduced: 남부 상단 대표: 대안 무역로도 검토 중입니다. }
{ rian_introduced: 리안: 이번엔 상대가 먼저 조건을 바꿨습니다. 우리가 다시 양보할 차례는 아닙니다. }
{ not rian_introduced: 세르안: 기존 조약 위반 통보가 아니라 재협상 요청입니다. }
+ [조건을 수용한다]
    ~ southLeverage += 1
    -> event_06
+ [절충안을 제시한다] -> event_06
+ [원안을 고수한다]
    ~ south_hardline = true
    -> event_06 // Strong Choice — E14/E19 분기 결정
+ [재협상을 연기한다]
    ~ southLeverage -= 1
    -> event_06

=== event_06 ===
~ rian_introduced = true
// [동부] 두 번째 사절
// │ 장면: 동부가 다시 먼저 온다. 리안 합류.
// │ 영향: eastWarmth. 리안 소개.
// │ 은유: 상대가 한 걸음 왔다. 두 걸음 갈지 정해야 한다.
// └ 상태: MVP 원문 이식 완료(19줄) — 기준 품질 — MVP(KINGDOM_SLICE second_envoy) 도입 대화/의견/대신 간 논쟁/선택 후 반응 이식. 리안 첫 등장 사건.
// 선택지 4개 이름, eastWarmth 증감, -> event_07 연결은 기존과 동일. 「다음 행동은 동부에 맡김」의 선택 후 반응은 MVP에 없어 새로 쓴 부분.
// 참고: Unity는 다음 선택까지의 한 묶음을 읽은 뒤 소개 변수를 반영하므로 리안 좌석은 사건 시작부터 보인다(등장 서술은 그 전제로 씀).
# scene: council
# title: 두 번째 사절
아침 안개가 걷히기도 전, 망루에서 봉화가 오른다. # phase: narration
망루병: 동부 깃발입니다! 지난번과 같은 문양입니다.
{ valen_introduced:
    발렌: 또 왔군. # phase: exchange
}
{ seran_introduced:
    세르안: 이번에는 우리가 부른 것이 아닙니다. # phase: exchange # to: valen # stance: clarify
}
{ valen_introduced:
    발렌: 좋은 뜻으로 보면 되는 겁니까? # phase: exchange # to: seran # stance: question
}
{ seran_introduced:
    세르안: 우호 신호인 것은 맞습니다. 그 이상의 의미는 아직 모릅니다. # phase: exchange # to: valen # stance: clarify
}
문이 열리고 지난번과 같은 사절이 들어온다. 이번에는 공식 문서 외에 작은 개인 서신도 함께 들고 있다. # phase: narration # enter: east_envoy
동부 사절: 우리 왕께서 지난 환대를 기쁘게 기억하고 계십니다. # phase: exchange
동부 사절: 조만간 두 나라가 조금 더 편하게 이야기를 나눌 자리를 만들 수 있기를 바란다고 하셨습니다.
회의실 한쪽에서 낯선 인물이 조용히 미소 짓는다. # phase: narration
리안: 상대가 먼저 한 걸음 왔군요. # phase: exchange
{ valen_introduced:
    발렌: 누구지? # phase: exchange # to: rian # stance: question
}
리안: 한 걸음을 두 걸음으로 만들지 않게 도와드릴 사람입니다. # phase: exchange # to: valen # stance: clarify
외교관이 처음으로 왕실 회의에 합류한다. # phase: narration
{ seran_introduced:
    세르안: 우호적인 신호인 것은 맞습니다. 그러나 친근함과 약속은 다른 문제입니다. # phase: advisors
}
리안: 저쪽이 한 걸음 왔습니다. 우리도 한 걸음이면 충분합니다. 관계는 누가 더 많이 움직였는지 겨루는 일이 아닙니다. # phase: advisors
{ valen_introduced:
    발렌: 기회라면 잡아야 합니다. 다음 교류를 먼저 확정할 수 있습니다. # phase: advisors
}
{ seran_introduced:
    세르안: 우호 신호라는 데는 동의합니다. 약속으로 읽지는 마십시오. # phase: exchange # to: rian # stance: counter
}
리안: 약속이라 부르지 않겠습니다. 다만 상대가 먼저 움직였다는 사실도 지우진 않겠습니다. # phase: exchange # to: seran # stance: clarify
+ [이전보다 적극적으로 응답]
    ~ eastWarmth += 1
    왕의 결정에 따라 왕실은 지난 방문을 긍정적으로 받아들였으며, 앞으로의 왕래에도 열려 있다는 뜻을 전한다. # phase: aftermath
    동부 사절: 기쁜 뜻으로 전하겠습니다.
    { valen_introduced:
        발렌: 속도가 붙는군요. 폐하께서 결론을 앞당기고 싶으신 걸 수도 있겠습니다.
    }
    리안: 아니면 상대의 한 걸음에 같은 정도로 답하신 걸 수도 있습니다. # to: valen # stance: counter
    { seran_introduced:
        세르안: 둘 다 가능성입니다. 그 이상은 아직 모르지요. # stance: clarify
    }
    동부 사절은 밝은 표정으로 돌아간다. 양국 사이의 왕래가 분명히 잦아졌다. # endphase # exit: east_envoy
    -> event_07
+ [상대가 보인 만큼 응답]
    왕실은 상대가 보인 만큼의 온도로 화답한다. # phase: aftermath
    리안: 좋습니다. 상대의 걸음 수를 세지 않아도 됩니다. 같은 방향이면 충분합니다.
    { seran_introduced:
        세르안: 그리고 아직 단정하지 않는 것도 중요합니다. # to: rian # stance: support
    }
    양국의 다음 만남은 자연스럽게 열리기 시작한다. # endphase # exit: east_envoy
    -> event_07
+ [좋은 신호로 보되 더 관찰]
    왕실은 호의를 받아들이되 추가 제안은 하지 않는다. # phase: aftermath
    { valen_introduced:
        발렌: 조금 차갑지 않습니까? # stance: question
    }
    { seran_introduced:
        세르안: 서두르지 않는 것과 차가운 것은 다릅니다. # to: valen # stance: clarify
    }
    리안: 다만 상대도 우리 반응을 보고 있다는 점은 기억하십시오. # stance: clarify
    동부 왕국은 교류를 멈추지 않았지만, 다음 움직임은 조심스러워졌다. # endphase # exit: east_envoy
    -> event_07
+ [다음 행동은 동부에 맡김]
    왕실은 이번에는 새 제안을 더하지 않고, 다음 움직임을 동부의 몫으로 남겨 둔다. # phase: aftermath
    { valen_introduced:
        발렌: 기다리시겠다는 겁니까? # stance: question
    }
    리안: 기다리는 것도 답의 한 가지입니다. 다만 상대가 그것을 무엇으로 읽는지는 우리가 정할 수 없습니다. # to: valen # stance: clarify
    { seran_introduced:
        세르안: 맡겼다는 사실은 남습니다. 무엇을 뜻했는지는 저쪽의 다음 움직임이 보여 주겠지요. # stance: clarify
    }
    사절은 예를 갖춰 물러난다. 다음 서신이 언제 올지는 아직 알 수 없다. # endphase # exit: east_envoy
    -> event_07

=== event_07 ===
// [북부] 다시 움직인 국경
// │ 장면: 북부 병력 이동이 커진다. 여전히 침범은 없다.
// │ 영향: north_hardline → E21 충돌 조건. northTension.
// │ 은유: 답이 없는 채로 신호만 반복될 때의 조바심.
// └ 상태: 본문 3줄 — 확장 필요 (Event 03 후속)
북부 변경국 인근에서 다시 병력 이동. 이전보다 규모가 크다. 국경 침범은 없다.
{ valen_introduced: 발렌: 이번엔 지켜만 보고 있을 때가 아닙니다. }
{ seran_introduced: 세르안: 규모가 커졌다는 것과 의도가 달라졌다는 것은 다릅니다. }
+ [수비 증강]
    ~ north_hardline = true
    ~ northTension += 2
    -> north_04 // Strong Choice — E21 발생 조건에 기여
+ [정찰 확대]
    ~ northTension += 1
    -> north_04
+ [외교 채널로 확인 요청]
    ~ north_deescalate = true
    ~ northTension -= 1
    -> north_04
+ [이전 대응 유지] -> north_04

=== event_08 ===
// [동부] 공동 축제
// │ 장면: 두 나라가 처음으로 함께 행사를 연다. 동부가 더 머문다.
// │ 영향: eastWarmth. 관계의 온도가 올라가는 지점.
// │ 은유: 예정에 없던 시간. 더 있겠냐는 제안.
// └ 상태: MVP 원문 이식 완료(13줄) — 기준 품질 — MVP(KINGDOM_SLICE festival) 도입 대화/의견/선택 후 반응 이식. 선택지 4개 이름, eastWarmth 증감, -> event_09 연결은 기존과 동일(MVP와 선택지 4개가 1:1 대응이라 새로 쓴 줄 없음). 「더 함께 시간을 보냄」은 종료 태그를 붙이려고 마지막 서술(별다른 약속은 없었다…)을 대신들 말 뒤로 옮겼다.
# scene: council
# title: 공동 축제
음악과 시장의 소리로 국경 마을이 가득 찬다. 두 나라의 깃발이 처음으로 한 광장에 나란히 걸린다. # phase: narration
{ rian_introduced:
    리안: 공식 일정은 거의 끝났습니다. 지금부터는 약속보다 서로가 얼마나 더 머무는지를 보시면 됩니다. # phase: exchange
}
{ valen_introduced:
    발렌: 아니, 분위기도 보고서에 기록합니까? # phase: exchange # to: rian # stance: question
}
{ seran_introduced:
    세르안: 때로는 숫자보다 더 중요한 정보가 됩니다. # phase: exchange # to: valen # stance: clarify
}
해가 지고 공식 행사가 끝난다. 왕실 사람들도 하나둘 자리에서 일어난다. # phase: narration # enter: east_envoy
동부 사절: 폐하. # phase: exchange
동부 사절: 시간이 괜찮으시다면… 조금 더 머물다 가시겠습니까?
예정표에는 없던 제안이다. # phase: narration
{ valen_introduced:
    발렌: 상대가 먼저 연장했습니다. # phase: exchange
}
{ rian_introduced:
    리안: 그러니까 더 중요합니다. 지금은 밀어붙일 순간인지, 그냥 즐길 순간인지. # phase: exchange # to: valen # stance: clarify
}
{ rian_introduced:
    리안: 상대가 자발적으로 시간을 더 쓰겠다고 했습니다. 가까워진 신호는 맞습니다. 다만 가까워진 것과 약속한 것은 다릅니다. # phase: advisors
}
{ seran_introduced:
    세르안: 좋은 정보입니다. 다만 오늘의 분위기가 미래의 약속을 대신하지는 않습니다. # phase: advisors
}
{ valen_introduced:
    발렌: 흐름이 좋을 때 다음 교류까지 잡아두는 것이 효율적입니다. # phase: advisors
}
+ [더 함께 시간을 보냄]
    ~ eastWarmth += 1
    공식 수행원 대부분이 떠난 뒤에도 작은 정원에 불이 남는다. # phase: aftermath
    동부 사절: 공식 자리보다 지금이 훨씬 편하군요.
    왕은 자리를 떠나지 않는다. 그 선택만으로 대답을 대신한다.
    { rian_introduced:
        리안: 좋은 시간은 좋은 시간으로 남겨두는 것도 기술입니다.
    }
    { valen_introduced:
        발렌: 적어도 더 머무는 쪽은 선택하셨군요. # stance: clarify
    }
    { seran_introduced:
        세르안: 그 선택의 이유까지 붙이진 맙시다. # to: valen # stance: clarify
    }
    별다른 약속은 없었다. 하지만 돌아오는 길의 분위기는 이전과 달랐다. # endphase # exit: east_envoy
    -> event_09
+ [다음 만남을 먼저 제안]
    ~ eastWarmth += 1
    왕실은 다음 교류를 먼저 제안한다. # phase: aftermath
    동부 사절: 좋습니다. 일정이 맞으면 꼭 가겠습니다.
    { valen_introduced:
        발렌: 다음 움직임까지 확보했습니다.
    }
    { seran_introduced:
        세르안: 확보라는 단어를 외교에 쓰지 마십시오. # to: valen # stance: counter
    }
    리안: 상대의 답이 ‘좋다’였다는 것과 일정이 확정됐다는 것은 다릅니다. # stance: clarify # endphase # exit: east_envoy
    -> event_09
+ [좋은 분위기에서 종료]
    왕실은 좋은 분위기가 남아 있을 때 자리를 마무리한다. # phase: aftermath
    동부 사절: 네. 다음에 또 뵙겠습니다.
    { valen_introduced:
        발렌: 기회가 있었는데요. # stance: question
    }
    { rian_introduced:
        리안: 좋은 끝도 다음 시작을 만듭니다. # to: valen # stance: clarify
    }
    양국은 아쉬움이 조금 남은 채 각자의 길로 돌아간다. # endphase # exit: east_envoy
    -> event_09
+ [작은 호의만 건넴]
    왕실은 다음 일정 이야기를 꺼내지 않는다. 대신 축제 상인에게서 산 작은 과자 봉지가 사절에게 건너간다. # phase: aftermath
    동부 사절: …이건 예상하지 못했습니다.
    { rian_introduced:
        리안: 가끔은 관계에 설명이 없는 여지도 필요합니다.
    }
    { valen_introduced:
        발렌: 회의까지 해서 과자를 고른 셈이군요. # to: rian # stance: question
    }
    별다른 약속 없이 웃음이 짧게 남고, 그날의 축제는 끝난다. # endphase # exit: east_envoy
    -> event_09

=== event_09 ===
// [서부] 오래된 약속
// │ 장면: 서부가 정기 지원(곡물/물자)을 줄이겠다고 통보한다. 받던 쪽은 우리다.
// │ 영향: westWarmth. 서부 루트 시작. 곡물 부족 → 내정 파급(D15).
// │ 은유: 나보다 여유 있는 상대. 아쉬운 쪽이 나라는 사실.
// └ 상태: 본문 3줄 — 서부 메인 루트로 확장(현재 서부 사건 1개뿐)
서부 연합이 정기 지원(곡물/물자)을 이번 시즌부터 줄이겠다고 통보한다. 적대적이지 않다.
{ seran_introduced: 세르안: 예전엔 물어볼 필요도 없던 일입니다. }
{ seran_introduced: 세르안: 그만큼 우리도 공급 계획을 다시 확인해야 합니다. }
+ [이유를 캐묻는다] -> event_10
+ [우리 쪽도 자연스럽게 받아들인다]
    ~ westWarmth -= 1
    -> event_10
+ [서신으로 서운함을 전한다]
    ~ westWarmth += 1
    -> event_10
+ [대체 공급망을 알아본다]
    ~ westWarmth -= 1
    -> event_10

=== event_10 ===
// [동부] 작은 선물
// │ 장면: 동부에서 소박한 선물. 공식 문구는 '감사의 표시' 정도.
// │ 영향: eastPressure(답례 크기). 이후 E25 비용 서술에 회수.
// │ 은유: 답례의 크기를 정하는 일. 많이 주면 부담, 적게 주면 서운.
// └ 상태: 본문 3줄 — 확장 필요
동부에서 소박한 선물이 도착한다. 공식 문구는 "감사의 표시" 정도다.
{ rian_introduced: 리안: 받은 만큼 돌려주는 것만으로 충분할 수 있습니다. }
{ valen_introduced: 발렌: 보낼 거면 보내죠. }
+ [비슷한 수준의 답례] -> event_11
+ [조금 더 정성 들인 답례]
    ~ eastPressure += 1
    -> event_11
+ [감사 서신만 보냄] -> event_11
+ [다음 기회에 답례] -> event_11

=== event_11 ===
~ karden_introduced = true
수호관 카르덴이 내부 일정표를 들고 회의에 합류한다.
// [동부] 늦은 답신
// │ 장면: 처음으로 동부 답신이 눈에 띄게 늦는다. 카르덴 합류.
// │ 영향: 카르덴 소개 = 내부 소모가 보이기 시작하는 지점. eastPressure.
// │ 은유: 읽고 답이 없을 때. 이유를 알 수 없는 침묵.
// └ 상태: 본문 3줄 — MVP late_reply 이식 대상(변형 3형)
처음으로 동부 답신이 평소보다 눈에 띄게 늦어진다.
{ karden_introduced: 카르덴: 이 문제 때문에 우리 쪽 일이 멈추는지도 봐야 합니다. }
+ [먼저 연락하지 않고 기다림] -> event_12
+ [부담 적게 확인] -> event_12
+ [직접 회담 제안]
    ~ eastPressure += 1
    -> event_12
+ [교류 빈도 낮춤]
    ~ eastWarmth -= 1
    -> event_12

=== event_12 ===
// [해안] 항구의 소문
// │ 장면: 해안 도시국가의 작은 축제 초대. 가볍고 형식적이다.
// │ 영향: coastalFamiliarity. 서브 루트 — 부담 없는 접촉.
// │ 은유: 큰 의미 없는 가벼운 자리. 가도 그만 안 가도 그만.
// └ 상태: 본문 3줄 — 서브 루트로 유지(양념)
해안 도시국가에서 열리는 작은 축제에 초대장이 온다. 가볍고 형식적이다.
{ rian_introduced: 리안: 이런 자리는 그냥 얼굴 한번 비추는 걸로 충분합니다. }
{ valen_introduced: 발렌: 심각하게 갈 필요 없다는 거군. }
+ [직접 참석]
    ~ coastalFamiliarity += 2
    -> event_13
+ [사절만 파견]
    ~ coastalFamiliarity += 1
    -> event_13
+ [선물만 보냄]
    ~ coastalFamiliarity += 1
    -> event_13
+ [참석하지 않음] -> event_13

=== event_13 ===
// [동부] 취소된 회담
// │ 장면: 예정된 회담이 당일 취소된다. 사절은 해 지기 전 떠난다.
// │ 영향: pause_contact → E15 닫힌 교류. **타이머 사건(D8)**.
// │ 은유: 갑자기 취소된 약속. 물어볼 시간은 짧다.
// └ 상태: 본문 5줄 — MVP canceled_meeting 이식 + 타이머 설계 대상
예정된 회담이 당일 취소된다. 사절은 해가 지기 전 떠나야 한다.
{ seran_introduced: 세르안: 확인된 건 취소됐다는 사실뿐입니다. }
{ valen_introduced: 발렌: 지금 물으면 됩니다. }
{ rian_introduced: 리안: 다음 움직임을 전부 우리가 맡을 필요는 없습니다. }
{ karden_introduced: 카르덴: 이 회담 하나 때문에 오늘 전체를 태우지 마십시오. }
+ [다른 날을 먼저 제안] -> event_14
+ [취소 이유 직접 확인] -> event_14
+ [대체 회담을 먼저 제안하지 않음] -> event_14
+ [당분간 비공식 교류 중단]
    ~ pause_contact = true
    ~ eastWarmth -= 1
    -> event_14 // Strong Choice — E15 분기 결정

=== event_14 ===
// 라우터: E05 south_hardline에 따라 분기
{ south_hardline:
    -> event_14_broken
- else:
    -> event_14_default
}

=== event_14_default ===
// [남부] 손해 보는 협상 (기본형)
// │ 장면: 남부와의 협상에서 이번엔 우리가 불리한 조건을 받아야 관계가 유지된다.
// │ 영향: south_sacrifice. 국고/세입 파급(D15).
// │ 은유: 맞추려면 내가 손해 보는 지점. 그래도 이어가고 싶은가.
// └ 상태: 본문 3줄 — 확장 필요
남부와의 협상에서 이번엔 우리 쪽이 불리한 조건을 받아들여야 관계가 유지됨을 깨닫는다.
{ karden_introduced: 카르덴: 이번엔 우리가 손해를 좀 봐야 관계가 유지됩니다. }
{ seran_introduced: 세르안: 감정과 계산은 분리해야 합니다. }
+ [손해를 감수하고 수용한다]
    ~ south_sacrifice = true
    -> event_15
+ [절충안을 재요청한다] -> event_15
+ [거절하고 관계 냉각을 감수한다]
    ~ southLeverage -= 1
    -> event_15
+ [시간을 벌며 재검토한다] -> event_15

=== event_14_broken ===
// [남부] 협상 결렬 (Strong Branch 변형, E05 south_hardline=true)
// │ 장면: 남부가 조건 제시 없이 협상을 접는다. 대안 무역로 정황.
// │ 영향: E19 스킵 → bridge_broken_trade.
// │ 은유: 한 번 세게 말한 뒤 상대가 조용히 돌아선 상태.
// └ 상태: 본문 3줄 — 강한 분기의 좋은 예. 유지
남부가 조건 제시 없이 협상 자체를 접겠다고 통보한다. 대안 무역로 이용 정황이 보인다.
{ karden_introduced: 카르덴: 이번엔 손해를 볼 기회조차 없습니다. }
{ rian_introduced: 리안: 지난번 선택의 대가입니다. 지금 할 수 있는 건 다음을 준비하는 것뿐입니다. }
+ [대안 무역로를 알아본다] -> event_15
+ [남부에 재협상을 공식 요청한다] -> event_15
+ [그대로 받아들인다] -> event_15

=== event_15 ===
// 라우터: E13 pause_contact에 따라 분기
{ pause_contact:
    -> event_15_closed
- else:
    -> event_15_default
}

=== event_15_default ===
// [동부] 빈 국경 (기본형)
// │ 장면: 며칠 동안 동부에서 새 제안이 없다.
// │ 영향: eastWarmth.
// │ 은유: 아무 일도 없는 며칠. 내가 먼저 할지 말지.
// └ 상태: 본문 1줄 · 대신 의견 0 — **최우선 확장 대상**
며칠 동안 동부에서 뚜렷한 새 제안이 없다.
+ [평소처럼 교류] -> event_16
+ [다음 움직임은 동부가 먼저 하게 둠] -> event_16
+ [우선순위 낮춤]
    ~ eastWarmth -= 1
    -> event_16
+ [공식 교류만 유지] -> event_16

=== event_15_closed ===
// [동부] 닫힌 교류 (Strong Branch 변형, E13 pause_contact=true)
// │ 장면: 우리가 먼저 멈췄기에 동부는 공식 경로만 유지한다는 짧은 서신을 보낸다.
// │ 영향: eastWarmth 재개 폭.
// │ 은유: 내가 닫은 문. 다시 열 수 있는지 시험하는 자리.
// └ 상태: 본문 1줄 — 확장 필요
우리가 먼저 비공식 교류를 멈췄기에, 동부는 공식 경로만 유지한다는 짧은 서신을 보낸다.
+ [중단 유지] -> event_16
+ [공식 교류부터 재개]
    ~ eastWarmth += 1
    -> event_16
+ [비공식 교류까지 재개]
    ~ eastWarmth += 2
    -> event_16

=== event_16 ===
// [북부] 서로 다른 보고
// │ 장면: 같은 북부 상황을 두고 부서마다 다른 해석의 보고가 올라온다.
// │ 영향: watcher_unlocked → E17 베이라 합류.
// │ 은유: 같은 일을 두고 사람마다 다르게 말할 때.
// └ 상태: 본문 2줄 — 확장 필요
같은 북부 국경 상황을 두고 여러 부서가 서로 다른 해석을 담은 보고를 올린다.
{ valen_introduced: 발렌: 그래서 실제로 달라진 건 뭡니까? }
+ [공통 사실만 기준] -> north_06
+ [추가 정보 수집]
    ~ watcher_unlocked = true
    -> north_06
+ [행동으로 확인] -> north_06
+ [현재 방침 유지] -> north_06

=== event_17 ===
{ watcher_unlocked:
    ~ watcher_introduced = true
    정보총관이 요청받은 추가 자료를 들고 들어온다.
    {name_watcher}: 확인된 기록과 추정은 나누어 보고하겠습니다.
}
// [종합] 왕실 회의 — Major Branch 분기점
// │ 장면: 동부 문제로 4인의 의견이 처음 크게 갈린다. 북부·남부 미결도 언급.
// │ 영향: royal_visit → ACT IV 전면 교체(E18/20/22/23).
// │ 은유: 직접 갈지 기다릴지. 가장 큰 갈림길.
// └ 상태: 본문 5줄 — 분기점인데 얇다. 확장 필요
동부 문제를 두고 핵심 4인의 의견이 처음으로 크게 갈린다. 북부·남부 미결 사안도 언급된다.
{ seran_introduced: 세르안: 관찰을 권합니다. }
{ valen_introduced: 발렌: 확인하면 됩니다. }
{ rian_introduced: 리안: 상대가 움직일 자리를 남기십시오. }
{ karden_introduced: 카르덴: 우리의 손실도 생각해야 합니다. 참고로 남부 재협상 건도 아직 답을 못 드렸습니다. }
+ [기다림 지속] -> event_18
+ [직접 확인] -> event_18
+ [제한 접촉] -> event_18
+ [경계 강화] -> event_18
+ [직접 동부로 간다]
    ~ royal_visit = true
    -> event_18 // Major Branch — ACT IV 전면 교체

=== event_18 ===
// 라우터: E17 royal_visit에 따라 분기
{ royal_visit:
    -> event_18_visit
- else:
    -> event_18_default
}

=== event_18_default ===
// [동부] 대규모 사절단
// │ 장면: 관계를 풀거나 확인하기 위해 평소보다 큰 사절단을 준비할 수 있다.
// │ 영향: envoy_dispatched(D15), eastPressure.
// │ 은유: 크게 움직일지 말지. 큰 행동은 그 자체가 메시지가 된다.
// └ 상태: 본문 1줄 · 대신 의견 0 — **최우선 확장 대상**
관계를 해결하거나 확인하기 위해 평소보다 큰 사절단을 준비할 수 있다.
+ [대규모 파견]
    ~ eastPressure += 1
    -> event_19
+ [규모 축소] -> event_19
+ [소규모 확인] -> event_19
+ [파견 취소]
    ~ envoy_dispatched = false
    -> event_19

=== event_18_visit ===
// [동부·방문] E18′ 떠나는 채비 (2026-09-19 프로즈 작성 완료, 04_story_bible.md Event 18′ 참고)
왕이 직접 동부로 가기로 한 뒤, 실제 출발 준비가 시작된다. 사절을 보내는 것과 왕이 직접 떠나는 것은 준비의 규모부터 다르다.
{ seran_introduced: 세르안: 대리 통치 체계부터 정리하겠습니다. 기록에 공백을 남길 수 없습니다. }
{ valen_introduced: 발렌: 수도를 비우는 동안의 방비는 제가 맡습니다. 문제는 그쪽이 아닙니다. }
{ rian_introduced: 리안: 행렬의 규모 자체가 먼저 도착하는 전언입니다. 무엇을 보내고 싶으십니까? }
{ karden_introduced: 카르덴: 요청받지 않은 방문입니다. 그 점은 폐하께서도 아셔야 합니다. }
+ [전례에 따라 정식 행렬을 갖춰 떠난다]
    ~ eastPressure += 1
    -> event_19
+ [최소한의 수행만 데리고 떠난다] -> event_19
+ [경호만 남기고 격식을 최대한 줄여 떠난다] -> event_19
+ [일정을 미리 알리지 않고 떠난다] -> event_19

=== event_19 ===
// 라우터: E05 south_hardline에 따라 스킵
{ south_hardline:
    -> bridge_broken_trade
- else:
    -> event_19_default
}

=== event_19_default ===
// [남부] 조건을 바꾼 상대
// │ 장면: 남부 수로 협력이 우리 쪽 늦은 응답 때문에 지연되고 있다는 보고.
// │ 영향: 동부에 쏠린 대가가 남부에서 드러나는 지점(D14 원형).
// │ 은유: 한쪽에 마음 쓰는 동안 다른 쪽이 밀린다.
// └ 상태: 본문 3줄 — D14/D15의 모범 사례. 확장 가치 높음
남부와 진행 중이던 수로 공사 협력이 우리 쪽의 늦은 응답 때문에 지연되고 있다는 보고.
// 회의 횟수는 실제 동부 소모(eastPressure)를 읽는다. 고정 숫자는 E25와 충돌한다.
{ karden_introduced && eastPressure >= 3:
    카르덴: 지난 두 달 동안 동부 문제로 열린 회의가 열한 번입니다. 남부 수로 공사는 아직 첫 회의도 끝나지 않았습니다.
}
{ karden_introduced && eastPressure == 2:
    카르덴: 지난 두 달 동안 동부 문제로 회의가 여섯 번 열렸습니다. 남부 수로 공사는 아직 첫 회의도 끝나지 않았습니다.
}
{ karden_introduced && eastPressure <= 1:
    카르덴: 동부 쪽은 손이 많이 가지 않았습니다. 그런데도 남부 수로 공사는 아직 첫 회의가 끝나지 않았습니다.
}
{ south_sacrifice && karden_introduced: 카르덴: 그래도 관계는 유지되고 있습니다. }
+ [지금 바로 남부 회의를 연다] -> event_20
+ [담당자에게 위임한다] -> event_20
+ [동부 문제 정리 후로 미룬다] -> event_20
+ [남부에 지연을 알리고 양해를 구한다] -> event_20

=== bridge_broken_trade ===
// 브리지 — 끊어진 상단 (E19 스킵 대체, 선택 없음)
남부 상단은 발길을 끊었다. 수로 공사 이야기도 더 나오지 않는다.
-> event_20

=== event_20 ===
// 라우터: E17 royal_visit에 따라 분기
{ royal_visit:
    -> event_20_visit
- else:
    -> event_20_default
}

=== event_20_default ===
// [동부] 닫힌 성문
// │ 장면: 동부가 입국을 지연/제한한다. 적대 선언은 없다. (파견 안 했으면 대체 서술)
// │ 영향: eastWarmth. envoy_dispatched 조건 분기(D15 적용 완료).
// │ 은유: 문 앞까지 갔는데 열리지 않는 상태.
// └ 상태: 본문 4줄 — 확장 필요
{ envoy_dispatched:
    동부가 사절단의 입국을 지연하거나 제한한다. 적대 선언은 없다.
- else:
    // 사절단을 보내지 않은 경우: 도착할 사절이 없으므로 "지연"이 성립하지 않는다.
    동부가 국경 통행 절차를 새로 공지한다. 우리 쪽에서 보낼 사람이 없으니 당장 걸리는 것은 없다. 적대 선언도 없다.
}
{ rian_introduced: 리안: 선이 생겼다는 것과 적이 됐다는 것은 다릅니다. }
{ karden_introduced: 카르덴: 여기서 더 밀면 우리 선택이 아니라 침범이 됩니다. }
{ valen_introduced: 발렌: 돌아갈 수도 있습니다. }
+ [기다림] -> event_21
+ [규모 축소] -> event_21
+ [철수]
    ~ eastWarmth -= 1
    -> event_21
+ [공식 사유 확인] -> event_21

=== event_20_visit ===
// [동부·방문] E20′ 동부 땅에서 (2026-09-19 프로즈 작성 완료, 04_story_bible.md Event 20′ 참고)
// 핵심: 정보가 늘어난다고 해석이 사라지는 것은 아니다(§26).
~ king_abroad = true
왕이 실제로 동부 국경에 도착한다. 입국이 지연되거나 제한된다는 사실을 보고서가 아니라 눈으로 직접 본다. 적대 선언은 여전히 없다.
{ rian_introduced: 리안: 선이 생겼다는 것과 적이 됐다는 것은 다릅니다. 여기 직접 서 계셔도 그 사실은 바뀌지 않습니다. }
{ karden_introduced: 카르덴: 폐하를 이 자리에 이렇게 오래 세워둘 수는 없습니다. }
{ valen_introduced: 발렌: 지금이라도 돌아가실 수 있습니다. }
+ [성문 앞에서 기다린다] -> event_21
+ [수행 규모를 줄여 다시 요청한다] -> event_21
+ [돌아간다]
    ~ eastWarmth -= 1
    ~ king_abroad = false
    -> event_21
+ [공식 사유를 요청한다] -> event_21

=== event_21 ===
// 라우터: E07 north_hardline + northTension 임계값
{ (northTension >= 5) && north_hardline:
    -> event_21_conflict
- else:
    -> bridge_stable_border
}

=== event_21_conflict ===
~ north_incident_occurred = true
// [북부] 국경의 오해
// │ 장면: 우리 순찰과 북부 병력이 근접한다. 충돌은 없었으나 양측 모두 놀란다.
// │ 영향: north_incident_occurred, northTension.
// │ 은유: 오해가 커질 뻔한 순간. 여기서 어떻게 하느냐가 남는다.
// └ 상태: 본문 4줄 — 북부 루트의 전환점. 확장 필요
우리 측 순찰과 북부 측 병력이 근접하는 사건이 발생한다. 충돌은 없었으나 양측 모두 놀란다.
{ valen_introduced: 발렌: 여기서 더 세게 나가면 진짜 전쟁이 됩니다. }
{ rian_introduced: 리안: 지금 필요한 건 확인이지 경고가 아닙니다. }
{ karden_introduced: 카르덴: 우리 병사들부터 진정시켜야 합니다. }
+ [즉시 강경 대응]
    ~ northTension += 2
    -> north_08 // Strong Branch — 이후 북부 관계 긴장 국면 전환
+ [공식 채널로 해명 요구] -> north_08
+ [현장 지휘관에 자제 지시]
    ~ northTension -= 1
    -> north_08
+ [침묵 유지] -> north_08

=== bridge_stable_border ===
// 브리지 — 안정된 국경 (E21 스킵 대체, 선택 없음)
북부 쪽에서는 며칠째 별다른 보고가 없다. 담당 서기관의 보고에는 "조용합니다"라고 적혀 있다.
-> north_08

=== event_22 ===
// 라우터: 왕이 지금도 동부에 있을 때만 대면 장면. 귀환했으면 기본형(D15 정합성).
{ royal_visit && king_abroad:
    -> event_22_visit
- else:
    -> event_22_default
}

=== event_22_default ===
// [동부] 공물
// │ 장면: 관계 회복이나 뜻 전달을 위해 자원을 쓸 기회가 생긴다.
// │ 영향: eastPressure → E25 비용 서술에 회수.
// │ 은유: 얼마나 쓸지. 많이 쓰면 부담이 되고 안 쓰면 뜻이 안 간다.
// └ 상태: 본문 1줄 · 대신 의견 0 — **최우선 확장 대상**
관계를 회복하거나 뜻을 전하기 위해 자원을 사용할 수 있는 기회가 생긴다.
+ [작은 답례] -> event_23
+ [큰 공물]
    ~ eastPressure += 1
    -> event_23
+ [서신만 전달] -> event_23
+ [아무것도 보내지 않음] -> event_23

=== event_22_visit ===
// [동부·방문] E22′ 직접 건네는 것 (2026-09-19 프로즈 작성 완료, 04_story_bible.md Event 22′ 참고)
공물을 대리인이 아니라 왕이 직접 건넨다. 대리인을 거치지 않는다는 것 자체가 이미 다른 무게를 갖는다.
+ [작은 것만 건넨다] -> event_23
+ [준비한 만큼 그대로 건넨다]
    ~ eastPressure += 1
    -> event_23
+ [사정을 한마디 덧붙이며 건넨다] -> event_23
+ [말없이 건넨다] -> event_23

=== event_23 ===
// 라우터: 왕이 지금도 동부에 있을 때만 대면 회담. 귀환했으면 서신 회담.
{ royal_visit && king_abroad:
    -> event_23_visit
- else:
    -> event_23_default
}

=== event_23_default ===
// [동부] 마지막 회담
// │ 장면: 동부와의 직접 회담. 행동 의도만 고른다(선택지 5개).
// │ 영향: east_form(open/formal/bounded) → E24·E25 결말 3갈래(D1 적용 완료).
// │ 은유: 마지막으로 무엇을 말할지. 관계의 형태가 여기서 정해진다.
// └ 상태: 본문 1줄 · 대신 의견 0 — **클라이맥스인데 가장 얇다. 최우선**
동부와의 직접 회담이 열린다. 양측 기록관이 자리에 앉고, 탁자 위에 빈 문서가 놓인다.
+ [오해를 정리한다] -> e23_reply_clarify
+ [미안했던 부분을 인정한다] -> e23_reply_acknowledge
+ [더 요구하지 않는다] -> e23_reply_no_demand
+ [현재 관계 형태를 확인한다] -> e23_reply_form
+ [자신의 경계를 전달한다] -> e23_reply_boundary

=== event_23_visit ===
// [동부·방문] E23′ 그 자리에서 (2026-09-19 프로즈 작성 완료, 04_story_bible.md Event 23′ 참고)
// 기본형과 동일한 행동 의도 선택지 — 다른 것은 전달 방식(서신 vs 대면)이지 의도의 종류가 아니다.
동부와의 마지막 회담이 서신이 아니라 실제 대면으로 열린다. 대신들의 조언도 문서가 아니라 회담 직전, 그 자리에서 실시간으로 전달된다.
{ rian_introduced: 리안: 지금부터는 제가 대신 전할 수 없습니다. 표정도, 말투도 전부 폐하의 것입니다. }
{ karden_introduced: 카르덴: 물러설 자리를 남겨두십시오. 마지막에도 그건 유효합니다. }
+ [오해를 정리한다] -> e23_reply_clarify
+ [미안했던 부분을 인정한다] -> e23_reply_acknowledge
+ [더 요구하지 않는다] -> e23_reply_no_demand
+ [현재 관계 형태를 확인한다] -> e23_reply_form
+ [자신의 경계를 전달한다] -> e23_reply_boundary

=== e23_reply_clarify ===
~ east_form = "open"
// E23 동부 측 반응 — 관찰 가능한 말과 행동만. 속마음 서술 금지(§30 4번).
{ royal_visit:
    동부 측 대표는 마주 앉은 채 경위를 끝까지 듣는다.
    동부 측 대표: 지금 들은 내용을 저희 기록과 맞춰보겠습니다. 다른 부분이 있으면 오늘 안에 말씀드리죠.
- else:
    우리 사절이 왕이 정리한 경위를 전한다. 동부 측 대표는 서기관에게 받아 적게 한다.
    동부 측 대표: 전해 들었습니다. 저희 기록과 다른 부분은 정리해서 알려드리겠습니다.
}
-> event_24

=== e23_reply_acknowledge ===
~ east_form = "open"
{ royal_visit:
    왕이 미안했던 부분이 있었다는 뜻을 표한다. 동부 측 대표는 잠시 말이 없다.
    동부 측 대표: 그 말씀은 기록에 그대로 남기겠습니다.
- else:
    우리 사절이 왕이 미안했던 부분을 인정한다는 뜻을 전한다. 동부 측 대표는 잠시 말이 없다.
    동부 측 대표: 그 부분은 기록에 그대로 남기겠습니다.
}
-> event_24

=== e23_reply_no_demand ===
~ east_form = "bounded"
{ royal_visit:
    왕이 더 요구하지 않겠다는 뜻을 표한다.
- else:
    우리 사절이 왕이 더 요구하지 않겠다는 뜻을 전한다.
}
동부 측 대표: 요청 사항 없음으로 정리하겠습니다. 이후 일정은 공식 경로로 알려드리겠습니다.
-> event_24

=== e23_reply_form ===
~ east_form = "formal"
{ royal_visit:
    왕이 지금의 관계가 어떤 형태인지 묻는다.
- else:
    우리 사절이 지금의 관계가 어떤 형태인지 묻는다.
}
동부 측 대표: 지금 상태는 있는 그대로 문서에 옮기겠습니다. 뭐라고 부를지는 조약문에서 정하죠.
-> event_24

=== e23_reply_boundary ===
~ east_form = "bounded"
{ royal_visit:
    왕이 자신의 경계를 밝힌다.
    동부 측 대표: 알겠습니다. 저희도 저희 쪽 경계를 같은 방식으로 정리해 두겠습니다.
- else:
    우리 사절이 왕이 정한 경계를 전한다. 동부 측 대표는 서기관에게 받아 적게 한다.
    동부 측 대표: 전달받았습니다. 저희도 저희 쪽 경계를 같은 방식으로 정리해 두겠습니다.
}
-> event_24

=== event_24 ===
// [동부] 조약 — 두 루트(기본/방문) 공통 수렴
// │ 장면: 향후 관계 형태가 문서로 명문화된다. east_form에 따라 조항이 다르다.
// │ 영향: east_form 회수 지점.
// │ 은유: 관계에 이름을 붙이는 일. 뭐라 부를지 정하는 자리.
// └ 상태: D1 적용 완료 — 3갈래 서술 있음
양국의 향후 관계 형태가 문서로 명문화된다. 조항은 길지 않다.
{
- east_form == "open":
    왕래를 계속한다는 문장이 첫 줄에 들어간다. 빈도와 방식은 적지 않았다.
- east_form == "formal":
    오가는 경로와 절차만 적힌다. 그 밖의 것은 문서에 없다.
- else:
    서로 넘지 않을 선이 양쪽 조항에 나란히 들어간다.
}
{ rian_introduced: 리안: 외교를 끝내는 것과 적이 되는 것은 다릅니다. }
-> event_25

=== event_25 ===
// [동부] 정리 — 성공/실패로 평가하지 않는다. 고른 형태와 실제 치른 비용만 말한다(D1).
// │ 장면: 동부에 투입했던 사절·병력·자원을 정리한다.
// │ 영향: east_form + eastPressure 회수. 실패 평가 제거됨.
// │ 은유: 끝난 뒤 남은 것을 세어보는 시간. 잘잘못은 말하지 않는다.
// └ 상태: D1 적용 완료
동부에 투입했던 사절, 병력, 자원을 정리한다.
{ valen_introduced: 발렌: 이걸로 끝입니까? }
{
- east_form == "open":
    { seran_introduced: 세르안: 오가는 길은 남았습니다. 그 길로 무엇이 올지는 아직 모릅니다. }
- east_form == "formal":
    { seran_introduced: 세르안: 절차는 남았고 나머지는 남기지 않았습니다. 그게 이번에 정한 형태입니다. }
- else:
    { seran_introduced: 세르안: 서로의 선이 문서에 남았습니다. 그 선 안쪽은 우리 몫입니다. }
}
// E19와 같은 척도. 숫자는 겹치지 않게 쓴다(회의 횟수 ≠ 밀린 안건 수).
{ karden_introduced && eastPressure >= 4:
    카르덴: 그동안 밀어둔 안건이 열아홉 건입니다. 그건 오늘부터 처리하면 됩니다.
}
{ karden_introduced && eastPressure >= 2 && eastPressure < 4:
    카르덴: 밀어둔 안건이 아홉 건 남았습니다. 오늘부터 처리하면 됩니다.
}
{ karden_introduced && eastPressure < 2:
    카르덴: 밀린 일은 생각보다 적습니다.
}
-> event_26

=== event_26 ===
// [전체] 전후 복구 — 다국가 구조의 payoff. 설명 대신 지도로 보여준다.
// │ 장면: 동부가 중심에서 내려오자 미뤄둔 다른 나라가 눈에 들어온다.
// │ 영향: westWarmth/south_hardline/north_incident 회수.
// │ 은유: 한 사람에게 쏠렸던 시선이 주변으로 돌아오는 때.
// └ 상태: 본문 있음 — 국가 확장 후 재작성 필요
동부 문제가 중심에서 내려오자 미뤄졌던 다른 나라와의 관계가 눈에 들어온다.
{ westWarmth <= 7: 아직 데면데면하지만 서부 회담 요청은 왔다. }
{ westWarmth == 8: 서부와의 정기 지원 회담 일정이 다시 잡혔다. }
{ westWarmth >= 9: 예전처럼 편하게 서부 회담이 다시 열렸다. }
{ south_hardline: 끊어진 상단이 다시 문을 두드렸다. }
{ north_incident_occurred: 북부 국경, 그 뒤로는 조용하다. }
{ not north_incident_occurred: 북부는 원래도 별일 없었다. }
해안 도시의 축제가 다시 눈에 들어온다.
+ [내정 우선] -> event_27
+ [다른 외교 재개] -> event_27
+ [휴식/정비] -> event_27
+ [동부 최소 업무 유지] -> event_27

=== event_27 ===
~ chaplain_introduced = true
새 협력의 자리에 대사제가 소개된다.
{ chaplain_introduced: {name_chaplain}: 이번 협력의 조건부터 함께 살펴봅시다. }
// [해안/서부] 다시 믿는 일
새로운 협력이 필요한 일이 생긴다. 이번에는 상대를 먼저 믿어야 시작되는 종류다.
+ [다시 신뢰해봄] -> event_28
+ [천천히 확인] -> event_28
+ [아직 거리 유지] -> event_28

=== event_28 ===
~ fool_introduced = true
궁정의 광대가 처음 소개된다.
{ fool_introduced: {name_fool}: 이 안건도 회의록 한 권을 채우겠군요. }
// [내정] 웃을 수 있는 거리
// │ 장면: 궁정이 사소한 일을 지나치게 심각하게 논의한다. 자벨 합류.
// │ 영향: fool_introduced.
// │ 은유: 다시 웃을 여유가 생겼다는 신호.
// └ 상태: 본문 3줄 — 확장 필요
궁정이 또 하나의 사소한 사건을 지나치게 심각하게 논의한다.
+ [웃고 넘김] -> event_29
+ [그래도 확인] -> event_29
+ [잠시 둠] -> event_29
+ [중요도를 낮춤] -> event_29

=== event_29 ===
// [복수 국가] 이어지는 외교 — 한 나라의 선택이 다른 관계를 닫지 않는다.
아침 지도 위에 여러 봉인이 놓인다. 어느 것부터 열지는 정해져 있지 않다.
{ eastWarmth >= 7:
동부에서 다음 계절의 회담 가능일을 묻는 답신이 왔다.
}
{ westWarmth >= 7:
서부에서 곡물 대신 종자와 기술자를 보내겠다는 제안이 왔다.
}
{ southLeverage >= 6:
남부 상단이 다음 수로 구간을 함께 검토하자는 계약 초안을 보냈다.
}
{ north_form == "quiet_trust":
북부 변경국이 공동 통신선을 시험하자고 제안했다. 우리 쪽 답을 기다리지 않고 날짜까지 적어 보냈다.
}
{ north_form == "wary":
북부 변경국에서 국경 통행 절차를 정리한 문서가 왔다. 새로운 제안은 없다.
}
{ north_form == "frozen":
북부 국경은 조용하다. 초소도 병력도 그대로 있다.
}
{ coastalFamiliarity >= 3:
해안 도시에서 다음 축제의 빈 자리를 알리는 초대장이 왔다.
}
세르안: 무엇부터 답할지는 정할 수 있습니다. 무엇이 폐하께 가장 중요한지는 저희가 정할 수 없습니다.
+ [가장 시급한 봉인부터 연다] -> epilogue
+ [오래 기다린 답신부터 읽는다] -> epilogue
+ [각 사절에게 답할 순서를 알린다] -> epilogue
+ [오늘은 지도를 먼저 펼쳐 본다] -> epilogue
=== epilogue ===
// EPILOGUE — KING WAS YOU 시퀀스 (04_story_bible.md §11-18)
왕국의 밤. 회의장의 불이 하나씩 꺼진다.
-> king_was_you

=== king_was_you ===
// 첫 타이틀
KING WAS YOU
-> phone_message

=== phone_message ===
// "뭐해?" — 누가 보냈는지는 확정하지 않는다
휴대폰에 짧은 메시지. 뭐해?
-> court_return

=== court_return ===
// 궁정 복귀 — 왕은 보이지 않는다
{ seran_introduced: 세르안: 정보가 부족합니다. }
{ valen_introduced: 발렌: 원한다면 움직일 수 있습니다. }
{ rian_introduced: 리안: 받은 만큼만 답해도 됩니다. }
{ karden_introduced: 카르덴: 서두를 필요는 없습니다. }
{ watcher_introduced: {name_watcher}: 확인한 기록은 여기까지입니다. }
{ chaplain_introduced: {name_chaplain}: 다음 가능성의 조건은 아직 열려 있습니다. }
{ fool_introduced: {name_fool}: 짧은 안부 하나에도 회의는 길어지는군요. }
-> empty_throne

=== empty_throne ===
// 빈 왕좌
왕좌가 비어 있다.
-> first_person

=== first_person ===
// 최초의 완전한 왕 1인칭
발걸음 소리. 누군가 왕좌까지 걸어가 앉는다. 그리고 대신들을 바라본다.
-> final_line

=== final_line ===
// 마지막 대사 — 게임 전체에서 유일한 왕의 직접 발화
// 암전·타이틀 카드는 텍스트가 아니라 엔딩 프레젠터가 연출로 처리한다(미구현).
// 그때까지 `KING WAS ME`는 임시로 텍스트로 남는다.
"내가 결정하지."
KING WAS ME
-> END


// ╔════════════════════════════════════════════════════════════════════════╗
// ║  북부 루트 — 적대로 열고, 우리가 가야만 천천히 녹는다                   ║
// ║  사용자 방향(2026-09-20). 구조·수치는 NUMBERS_LEDGER §C·§D (비캐논).     ║
// ║  관문 northContact 2/4/6. 일관된 행동 +2, 어긋난 행동 +1, 강경 -4.       ║
// ║  ⚠ 루트 이름 knot이므로 본문 줄 끝의 `# act: N` 태그가 ACT를 정한다.     ║
// ╚════════════════════════════════════════════════════════════════════════╝

=== north_02 ===
// [북부] 답 없는 서신
// │ 장면: 우리가 보낸 공식 서신에 답이 없다. 거절도 항의도 아니다.
// │ 영향: northContact의 시작점. "내가 가야만 움직인다"를 여기서 배운다.
// │ 은유: 읽었는지도 모르는 채로 기다리는 일.
// └ 상태: 북부 1번 칸. 분기 없음 — 적대 전제를 확인시키는 자리
북부 변경국에 보낸 공식 서신에 답이 없다. # act: 1 # title: 답 없는 서신
거절도 항의도 아니다. 국경은 어제와 같고, 우리 기록에는 "발송"까지만 적혀 있다.
{ valen_introduced: 발렌: 무시당한 겁니다. }
{ seran_introduced: 세르안: 답이 없는 것과 거절은 다릅니다. 우리는 아직 아무 말도 듣지 못했습니다. }
+ [같은 내용으로 한 번 더 보낸다]
    { consistent("careful"):
        ~ northContact += 2
    - else:
        ~ northContact += 1
    }
    ~ last_family = "careful"
    ~ labor -= 1
    ~ spent += 1
    ~ caution += 1
    두 번째 서신이 같은 경로로 떠난다. 필경사 한 사람이 그 일로 이틀을 썼다.
    -> event_04
+ [북부 쪽 문서 관례에 맞춰 다시 쓴다]
    { consistent("careful"):
        ~ northContact += 2
    - else:
        ~ northContact += 1
    }
    ~ last_family = "careful"
    ~ labor -= 1
    ~ spent += 1
    ~ uncertainty -= 1
    북부의 옛 문서를 찾아 형식을 맞춘다. 서두와 맺음이 우리 것과 다르다.
    { karden_introduced: 카르덴: 그쪽 서식을 쓰려고 사람 둘이 사흘을 썼습니다. }
    -> event_04
+ [답이 올 때까지 기다린다]
    ~ last_family = "careful"
    ~ caution += 1
    다음 서신은 보내지 않는다. 국경 보고는 계속 "변화 없음"이다.
    -> event_04
+ [국경 순찰 일정을 공개한다]
    ~ northTension += 1
    ~ northContact -= 4
    ~ last_family = "hard"
    ~ selfProtection += 1
    ~ spent += 1
    순찰 일정을 공개한다. 숨길 것이 없다는 뜻이기도 하고, 보라는 뜻이기도 하다.
    -> event_04

=== north_04 ===
// 라우터: 접촉이 쌓였고 강경 노선이 아닐 때만 장터가 열린다
-> clamp_state ->
{ northContact >= 2 && not north_hardline:
    -> north_04_market
- else:
    -> north_04_closed
}

=== north_04_market ===
// [북부] 국경 장터 (온)
// │ 장면: 공식 합의가 없는데 양측 주민이 알아서 장을 연다.
// │ 영향: 첫 "조용한 교류". 묵인이 곧 신호가 된다.
// │ 은유: 정해진 건 없는데 자연스럽게 생긴 접점.
// └ 상태: northContact >= 2 && not north_hardline
국경 마을에서 양측 주민이 알아서 장을 열었다는 보고. # act: 2 # title: 국경 장터
어느 쪽도 허가한 적이 없다. 북부 초소도 막지 않았다고 적혀 있다.
{ rian_introduced: 리안: 금지한 적도 없습니다. }
{ valen_introduced: 발렌: 통제 밖이라는 뜻입니다. }
+ [모른 척한다]
    { consistent("careful"):
        ~ northContact += 2
    - else:
        ~ northContact += 1
    }
    ~ last_family = "careful"
    ~ northTension -= 1
    아무 지시도 내려가지 않는다. 장은 다음 장날에도 섰다.
    -> event_08
+ [규모만 적어 오라고 지시한다]
    { consistent("careful"):
        ~ northContact += 2
    - else:
        ~ northContact += 1
    }
    ~ last_family = "careful"
    ~ labor -= 1
    ~ spent += 1
    ~ uncertainty -= 1
    장날마다 품목과 사람 수가 적혀 올라온다. 북부 쪽도 같은 날 같은 것을 적는다는 이야기가 있다.
    -> event_08
+ [정식으로 허가한다고 알린다]
    { consistent("active"):
        ~ northContact += 2
    - else:
        ~ northContact += 1
    }
    ~ last_family = "active"
    ~ spent += 1
    ~ initiative += 1
    ~ northTension += 1
    허가 문서가 국경에 붙는다. 북부 쪽에서는 그 문서를 떼지도 붙이지도 않았다.
    { seran_introduced: 세르안: 이름을 붙이면 상대도 이름을 붙여야 합니다. }
    -> event_08
+ [장터를 금지한다]
    ~ northContact -= 4
    ~ northTension += 1
    ~ last_family = "hard"
    ~ selfProtection += 1
    ~ morale -= 1
    금지령이 내려간다. 국경 마을 사람들은 항의하지 않았다. 그냥 나오지 않았다.
    -> event_08

=== north_04_closed ===
// [북부] 닫힌 장터 (냉)
// │ 장면: 같은 장터가 열렸지만 양측이 단속한다.
// │ 영향: 강경 노선에서는 접점이 생기다 만다.
// │ 은유: 생길 뻔한 접점이 양쪽 눈치 때문에 닫히는 일.
// └ 상태: northContact < 2 또는 north_hardline
국경 마을에서 장이 섰다가 하루 만에 흩어졌다는 보고. # act: 2 # title: 닫힌 장터
우리 쪽 초소가 먼저 막았고, 북부 초소도 같은 날 사람을 물렸다.
{ valen_introduced: 발렌: 잘한 일입니다. 통제 밖이었습니다. }
{ rian_introduced: 리안: 양쪽이 같은 날 같은 판단을 했습니다. 그것도 일종의 신호입니다. }
{ rian_introduced && northContact <= 0: 리안: 저쪽에서 답이 올 자리는 아직 비어 있습니다. 채울지 말지는 우리가 정합니다. }
+ [현재 방침을 유지한다]
    ~ last_family = "hard"
    ~ selfProtection += 1
    국경 통제는 그대로 간다. 다음 장날에는 아무도 나오지 않았다.
    -> event_08
+ [막은 이유를 문서로 남겨 북부에 보낸다]
    { consistent("careful"):
        ~ northContact += 2
    - else:
        ~ northContact += 1
    }
    ~ last_family = "careful"
    ~ labor -= 1
    ~ spent += 1
    ~ caution += 1
    막은 경위를 적어 보낸다. 해명도 항의도 아닌, 그냥 기록이다.
    -> event_08
+ [우리 쪽 단속만 푼다]
    { consistent("active"):
        ~ northContact += 2
    - else:
        ~ northContact += 1
    }
    ~ last_family = "active"
    ~ initiative += 1
    ~ spent += 1
    우리 초소만 물러난다. 북부 쪽은 그대로다. 며칠 동안은 우리 쪽 사람만 서 있었다.
    -> event_08
+ [국경 통제를 더 강화한다]
    ~ northContact -= 4
    ~ northTension += 1
    ~ last_family = "hard"
    ~ selfProtection += 1
    초소가 하나 더 선다. 그 다음 주, 북부 쪽에도 하나가 더 섰다.
    -> event_08

=== north_06 ===
// 라우터: 접촉이 더 쌓였을 때만 답이 온다
-> clamp_state ->
{ northContact >= 4:
    -> north_06_reply
- else:
    -> north_06_instead
}

=== north_06_reply ===
// [북부] 늦은 답신 (온)
// │ 장면: 오래전 보낸 서신에 뒤늦게 답이 온다. 짧고 사무적이다.
// │ 영향: 북부는 느리지만 끊지 않는다는 것을 처음으로 보여준다.
// │ 은유: 잊은 줄 알았는데 답이 왔을 때. 짧아서 더 크게 읽힌다.
// └ 상태: northContact >= 4
북부 변경국에서 답신이 왔다. # act: 3 # title: 늦은 답신
넉 줄이다. 인사도 없고 제안도 없다. 우리가 보낸 문서를 받았다는 것과, 국경 통행 관례를 적어 두었다는 내용뿐이다.
{ karden_introduced: 카르덴: 이게 답입니까? }
{ seran_introduced: 세르안: 넉 줄을 쓰려고 저쪽에서도 회의를 했을 겁니다. }
+ [같은 길이로 답한다]
    { consistent("careful"):
        ~ northContact += 2
    - else:
        ~ northContact += 1
    }
    ~ last_family = "careful"
    ~ labor -= 1
    ~ spent += 1
    ~ caution += 1
    넉 줄로 답한다. 받았다는 것과, 우리 쪽 관례를 적어 보낸다.
    -> north_06_after
+ [적혀 온 관례를 우리 쪽 규정에 반영한다]
    { consistent("careful"):
        ~ northContact += 2
    - else:
        ~ northContact += 1
    }
    ~ last_family = "careful"
    ~ labor -= 1
    ~ spent += 1
    ~ uncertainty -= 1
    국경 규정이 몇 줄 바뀐다. 북부에 알리지는 않았다. 다음 통행에서 알게 될 것이다.
    -> north_06_after
+ [이번엔 길게 써서 제안을 넣는다]
    { consistent("active"):
        ~ northContact += 2
    - else:
        ~ northContact += 1
    }
    ~ last_family = "active"
    ~ initiative += 1
    ~ spent += 2
    ~ labor -= 1
    긴 서신이 떠난다. 공동 순찰과 통신선 이야기가 들어 있다.
    { rian_introduced: 리안: 넉 줄에 스무 줄로 답하면, 저쪽은 우리가 급하다고 읽습니다. }
    -> north_06_after
+ [답하지 않는다]
    ~ last_family = "careful"
    ~ caution += 1
    답신은 보내지 않는다. 받았다는 기록만 남는다.
    -> north_06_after

=== north_06_instead ===
// [북부] 답 대신 온 것 (냉)
// │ 장면: 답신 자리에 병력 증강 보고가 온다.
// │ 영향: 접촉이 모자란 경로에서는 침묵이 다른 것으로 채워진다.
// │ 은유: 기다리던 답 대신 다른 소식이 오는 일.
// └ 상태: northContact < 4
북부에서 답신은 오지 않았다. 대신 국경 너머 병력이 늘었다는 보고가 올라온다. # act: 3 # title: 답 대신 온 것
침범은 없다. 늘어난 규모도 크지 않다. 다만 우리가 기다리던 것은 이것이 아니었다.
{ valen_introduced: 발렌: 답은 이미 온 겁니다. 이게 답입니다. }
{ rian_introduced: 리안: 병력과 답신은 다른 사람이 정합니다. }
// 조건부 묶음 — 참여자가 모두 있을 때만 통째로 나온다. 안에서 열고 안에서 닫는다.
// 한 명이라도 없으면 묶음 전체를 건너뛰고, 바깥은 이 묶음을 참조하지 않는다.
// 상태를 바꾸지 않는다(~ 금지). 대사만 치고 빠진다.
{ rian_introduced && karden_introduced && northContact <= 1:
    리안: 우리가 몇 통을 보냈는지는 기록에 남습니다. 답이 없었다는 것도 남고요.
    카르덴: 저쪽에 사람을 덜 쓴 만큼 이쪽은 돌아갑니다. 모든 왕국이 답을 하는 건 아닙니다.
    리안: 아직 오지 않은 것뿐일 수도 있습니다.
}
+ [문의 서신을 보낸다]
    { consistent("careful"):
        ~ northContact += 2
    - else:
        ~ northContact += 1
    }
    ~ last_family = "careful"
    ~ labor -= 1
    ~ spent += 1
    ~ caution += 1
    세 번째 서신이 떠난다. 이번에는 답을 요구하지 않고 사실만 묻는다.
    -> north_06_after
+ [우리도 같은 규모로 늘린다]
    ~ northContact -= 4
    ~ northTension += 2
    ~ last_family = "hard"
    ~ selfProtection += 1
    ~ treasury -= 1
    ~ labor -= 1
    국경 수비가 같은 규모로 는다. 양쪽 초소가 서로를 마주 본다.
    -> north_06_after
+ [지켜보기만 한다]
    ~ last_family = "careful"
    ~ caution += 1
    추가 지시는 없다. 보고는 계속 올라온다.
    -> north_06_after
+ [국경 마을 사람들을 뒤로 물린다]
    ~ northTension += 1
    ~ morale -= 1
    ~ last_family = "hard"
    ~ selfProtection += 1
    ~ labor -= 1
    국경에서 가장 가까운 두 마을이 뒤로 물러난다. 이유는 공지되지 않았다.
    -> north_06_after

=== north_06_after ===
// 라우터: 밖에 쓴 주의가 임계를 넘으면 밀린 안건이 올라온다(D14)
// ⚠ 임계 3은 이 슬라이스 검증용 임시값이다. 최종안은 4/8/12(NUMBERS_LEDGER §F).
//   지금은 stance가 북부 4칸에만 붙어 있어 spent가 그 이상 오르기 어렵다.
-> clamp_state ->
{ spent >= 3 && not backlog_seen:
    -> home_backlog
- else:
    -> event_17
}

=== home_backlog ===
~ backlog_seen = true
// [내정] 밀린 안건
// │ 장면: 서기관이 결재가 밀린 안건 묶음을 들고 온다. 전부 사소하다.
// │ 영향: D14 회수 지점 — 밖에 쓴 주의가 안에서 청구서로 돌아온다.
// │ 은유: 한쪽에 마음 쓰는 동안 나머지가 쌓여 있던 것.
// └ 상태: spent 임계에서만 발생. 외교 소모가 내정으로 돌아오는 첫 고리
서기관이 결재가 밀린 안건 묶음을 들고 온다. # act: 3 # title: 밀린 안건
전부 사소한 것들이다. 급한 것은 하나도 없다. 그래서 여태 밀려 있었다.
{ karden_introduced: 카르덴: 국경 쪽에 사람을 보내는 동안 이쪽이 비었습니다. }
{ not karden_introduced: 서기관은 언제 처리할지만 묻고 물러난다. }
+ [오늘 안에 전부 처리한다]
    ~ labor -= 1
    ~ spent -= 2
    밤늦게까지 결재가 이어진다. 다음 날 아침, 책상 위가 비어 있다.
    -> event_17
+ [급한 것만 고르고 나머지는 미룬다]
    ~ morale -= 1
    ~ spent -= 1
    묶음이 둘로 나뉜다. 작은 쪽이 처리되고 큰 쪽은 그대로 남는다.
    -> event_17
+ [담당 부서에 일괄 위임한다]
    ~ labor -= 1
    ~ morale -= 1
    ~ spent -= 2
    안건은 부서로 내려간다. 어떻게 처리됐는지는 올라오지 않는다.
    -> event_17

=== north_08 ===
// 라우터: 형태 확정. 쌓인 접촉과 남은 긴장을 함께 본다
-> clamp_state ->
{ northContact >= 6 && northTension <= 2:
    -> north_08_line
- else:
    -> north_08_frozen
}

=== north_08_line ===
~ north_form = "quiet_trust"
// [북부] 공동 통신선 (온) — 북부가 처음으로 먼저 제안한다
// │ 장면: 북부가 먼저 제안한다. 통신선 시험 — 작고 실무적이다.
// │ 영향: north_form = quiet_trust. 느린 루트의 payoff.
// │ 은유: 오래 걸렸지만 상대가 먼저 움직인 순간. 크지 않아서 더 확실하다.
// └ 상태: northContact >= 6 && northTension <= 2
북부 변경국에서 사람이 왔다. 우리가 부르지 않았다. # act: 4 # title: 공동 통신선
제안은 작다. 국경 두 지점 사이에 신호 초소를 하나씩 두고, 급한 일이 있을 때만 쓰자는 것이다.
{ seran_introduced: 세르안: 저쪽이 먼저 온 것은 이번이 처음입니다. }
{ karden_introduced: 카르덴: 초소 둘이면 사람 넷입니다. 그 정도는 됩니다. }
+ [제안한 대로 받는다]
    ~ treasury -= 1
    ~ labor -= 1
    ~ spent += 1
    ~ last_family = "careful"
    합의는 한 장으로 끝난다. 양쪽이 같은 날 초소를 세웠다.
    -> event_22
+ [범위를 넓혀 함께 쓰자고 제안한다]
    ~ treasury -= 2
    ~ labor -= 1
    ~ spent += 2
    ~ initiative += 1
    ~ last_family = "active"
    우리 쪽에서 지점을 둘 더 제안한다. 북부는 하나만 받고 하나는 다음에 보자고 했다.
    { rian_introduced: 리안: 하나는 받고 하나는 다음에 보자고 했습니다. 저라면 다음을 남겨 둔 걸로 읽겠습니다. }
    -> event_22
+ [시험 기간을 정해 두고 받는다]
    ~ treasury -= 1
    ~ labor -= 1
    ~ spent += 1
    ~ caution += 1
    ~ last_family = "careful"
    기한이 적힌다. 기한이 지나면 다시 이야기하기로 한다. 북부는 그 조항을 그대로 옮겨 적었다.
    -> event_22

=== north_08_frozen ===
// [북부] 굳어진 선 (냉) — 실패가 아니라 거리를 둔 형태다(D1)
// │ 장면: 국경 규칙이 문서로 정리된다. 왕래는 늘지 않는다.
// │ 영향: north_form = frozen 또는 wary. 유지 비용이 국고에서 나간다.
// │ 은유: 서로 넘지 않기로 한 선. 안전하지만 아무 일도 생기지 않는다.
// └ 상태: 위 조건 밖. 냉전 결말을 실패로 쓰지 않는다
북부와의 국경 규칙이 문서로 정리된다. # act: 4 # title: 굳어진 선
왕래를 늘리는 조항은 없다. 서로 어디까지 오지 않을지만 적혀 있다.
{ valen_introduced: 발렌: 이게 제일 깔끔합니다. }
{ seran_introduced: 세르안: 다투지 않기로 한 것과 가까워지는 것은 다릅니다. 우리는 앞쪽을 골랐습니다. }
// 같은 결말을 대신마다 다르게 읽는다. 어느 쪽도 왕을 평가하지 않는다(DESIGN_INTENT §A).
{ rian_introduced: 리안: 선을 긋는 것도 관계입니다. 다만 이 선 안쪽에서는 더 볼 일이 없겠지요. }
{ karden_introduced: 카르덴: 국경 쪽에 나가던 사람이 돌아옵니다. 밀린 안건부터 봅니다. }
+ [문서대로 확정한다]
    ~ north_form = "frozen"
    ~ treasury -= 1
    ~ last_family = "hard"
    양측 기록관이 같은 문서에 서명한다. 국경 병력은 그대로 유지된다.
    -> event_22
+ [통행 절차만 한 줄 남겨 둔다]
    ~ north_form = "wary"
    ~ treasury -= 1
    ~ spent += 1
    ~ last_family = "careful"
    필요할 때 통행을 신청할 수 있다는 조항 하나가 들어간다. 쓴 적은 아직 없다.
    -> event_22
+ [병력을 줄이고 선만 남긴다]
    ~ north_form = "wary"
    ~ treasury += 1
    ~ labor += 1
    ~ northTension -= 1
    ~ last_family = "careful"
    초소 절반이 철수한다. 선은 그대로지만 지키는 사람은 줄었다.
    -> event_22

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  신규 사건 뼈대 (2026-09-20, DIRECTION_DECISIONS_20260920.md D4·D7·D13)  ║
// ║  아직 본문 없음. 주석만. 승인 후 knot으로 구현한다.                      ║
// ╚════════════════════════════════════════════════════════════════════════╝
//
// [현재 집계] 이 블록은 58사건 전체가 아니라 그 일부다. 목표까지 9건이 남아 있다.
//   세는 규칙: 논리적 사건 1건 = 1. 같은 사건의 분기 변형(E14 결렬형, E18′ 방문형 등)은
//   따로 세지 않는다. 엔딩 변형(D6 10종)도 사건 수에 넣지 않는다 — 별도 콘텐츠 단위다.
//
//                동부  남부  북부  서부  내정  해안  교차/종합   합계
//     기존         13    3     4     1     3     1      4        29
//     아래 뼈대     0    4     4     4     6     2      0        20
//     미배정        0    0     0    +3    +2    +0     +4         9   ← 아직 안 씀
//     ─────────────────────────────────────────────────────────────
//     목표         13    7     8     8    11     3      8        58
//
//   미배정 9건의 배분 근거: 동부는 이미 충분하므로 추가하지 않는다. 서부는 기존 1건뿐이라
//   메인 루트 중 가장 얇고, 내정은 D14/D16의 결과를 받아내야 하며, 교차 사건은 "여러 관계를
//   동시에 굴릴 때 치르는 값"을 보여주는 자리라 지금 구조에서 가장 비어 있다.
//
// [설계 기준]
//   D4  사건 29 → 58개 이상. 플레이어가 한 번에 다 겪지 않아도 된다.
//   D7  동·서·남·북 4개국을 각각 메인 루트로. 해안·내정은 서브.
//   D13 국가별 성향: 동부=잔잔 / 남부=적극 / 북부=소극·지속 / 서부=비대칭
//   D14 내정 사건은 외교 교류량에 따라 발생 빈도가 올라간다.
//   D15 외교 선택이 물질 상태를 바꾸고 그것이 내정 사건으로 나타난다.
//   D16 세금 = 플레이어가 스스로 태우는 대가.
//
// [경계선] 은유 주석은 개발자 전용이다(04_story_bible.md §4 대응표의 연장).
//   게임 안에서는 끝까지 왕국 사건으로만 말한다. §30-17 WORLD-FIRST METAPHOR RULE.
//   "서부 앞에서 작아지신다" 같은 대사는 선을 넘는다.
//
// [기술 주의] 해결됨(2026-09-20). ActMood가 `# act: N` 태그를 먼저 읽도록 전환했다.
//   아래 루트 이름 knot은 사건 첫 줄 끝에 `# act: N`을 붙이면 배경/음악이 정상 갱신된다.
//   붙이지 않으면 직전 ACT가 유지되고 콘솔에 경고가 남는다. 파일 머리 ACT 태그 절 참고.
//   기존 29사건은 번호 경로로 계속 동작한다(회귀 검증 200회 0건).
//
//
// ─── 남부 루트 [적극적] ──────────────────────────────────────────────────
//   아크: 먼저 옴 → 더 큰 제안 → 내 속도보다 빠름 → 조절해야 함 → 형태 확정
//   은유축: 반가움과 부담이 같이 오는 관계. 맞추려면 내가 무리해야 한다.
//   기존: E05(첫 제안) E14(손해 보는 협상) E14_broken(결렬) E19(밀린 협력)
//
// south_02  더 큰 제안
//   장면: 수로 외에 항만 공동 운영까지 제안해 온다. 우리 인력이 모자란다.
//   영향: 수락 → 국고·인력 소모(D15), 내정 사건 확률 +. 거절 → southLeverage −
//   은유: 상대의 속도가 내 속도보다 빠를 때.
//
// south_04  선불 요구
//   장면: 남부가 다음 계약의 선금을 요구한다. 조건 자체는 나쁘지 않다.
//   영향: 국고 직접 감소. 세금 사건(home_tax) 발생 조건에 기여.
//   은유: 지금 여유가 없는데 상대는 지금을 원한다.
//
// south_06  다른 왕국과의 계약
//   장면: 남부가 서부와도 같은 조건으로 거래한다는 사실이 확인된다.
//   영향: southLeverage. 서부 루트와 교차(양국 동시 진행 확인용).
//   은유: 나만의 관계가 아니라는 걸 알게 되는 순간. 배신은 아니다.
//
// south_08  속도 조절
//   장면: 남부가 다음 제안을 들고 온다. 이번엔 우리가 미룰 수 있다.
//   영향: south_form 확정(동부 east_form과 같은 구조).
//   은유: 상대를 끊지 않으면서 내 속도를 말하는 법.
//
//
// ─── 북부 루트 [소극적·조심스럽지만 지속적] ──────────────────────────────
//   아크: 신호만 → 오해 → 우리가 먼저 → 천천히 쌓임 → 끊기지 않음 → 형태 확정
//   은유축: 먼저 연락하지 않지만 답은 하는 상대. 내가 움직여야만 진전된다.
//   기존: E03(첫 신호) E07(다시 움직임) E16(엇갈린 보고) E21(국경의 오해)
//   **현재 북부는 긴장만 있고 교류가 없다. 조용한 접촉을 넣어야 성향이 성립한다.**
//
//   ⚠ 아래 north_02~08은 이 방향 이전에 쓴 것이라 지금 논의와 어긋난다.
//     사용자 방향(2026-09-20): "처음에는 적대로 일변하되, 우리의 선택에 따라
//     천천히 관계가 쌓일 수도 있는 쪽." 아래는 처음부터 미지근한 교류를 전제한다.
//     대안 구조(northContact, 라우터+냉전 변형, north_form 3형)는
//     MVP/development/NUMBERS_LEDGER_20260920.md §D에 비캐논으로 기록해 두었다.
//     확정 전까지 아래를 그대로 구현하지 말 것.
//
// north_02  답 없는 서신
//   장면: 우리가 보낸 공식 서신에 답이 없다. 적대 표시도 없다.
//   영향: northTension. 다시 보낼지 기다릴지.
//   은유: 읽었는지도 모르는 상태로 기다리는 일.
//
// north_04  국경 장터
//   장면: 국경 마을에서 양측 주민이 알아서 장을 연다. 공식 합의는 없다.
//   영향: 묵인 시 northTension −. 금지 시 +. 첫 "조용한 교류".
//   은유: 공식적으로 정해진 건 없는데 자연스럽게 생긴 접점.
//
// north_06  늦은 답신
//   장면: 오래전 보낸 서신에 뒤늦게 답이 온다. 짧고 사무적이다.
//   영향: northTension −. 북부는 느리지만 끊지 않는다는 것을 보여줌.
//   은유: 잊은 줄 알았는데 답이 왔을 때.
//
// north_08  공동 통신선
//   장면: 북부가 처음으로 먼저 제안한다. 통신선 시험 — 작고 실무적이다.
//   영향: north_form 확정. 느린 루트의 payoff.
//   은유: 오래 걸렸지만 상대가 먼저 움직인 순간.
//
//
// ─── 서부 루트 [비대칭 — 우리가 아쉬운 쪽] ───────────────────────────────
//   아크: 받던 것이 줄어듦 → 조건이 불리 → 대등해지려면 우리가 커야 → 형태 확정
//   은유축: 나보다 여유 있는 상대. 동경과 열등감이 같이 온다.
//   기존: E09(지원 축소) — **서부 사건은 현재 이것 하나뿐. 최우선 확장 루트.**
//
// west_02  대체 공급처
//   장면: 서부 없이 겨울을 나는 계산을 해 본다. 숫자가 빠듯하다.
//   영향: 곡물 부족 상태(D15) → 내정 사건(home_ration) 발생 조건.
//   은유: 혼자 해보려 했는데 잘 안 될 때.
//
// west_04  불리한 조건
//   장면: 서부가 지원 재개를 제안한다. 조건이 예전보다 우리에게 불리하다.
//   영향: 수락 → 곡물 회복, 세입 감소. 거절 → 부족 지속.
//   은유: 아쉬운 쪽이 나라서 조건을 고르기 어려운 상황.
//
// west_06  초대
//   장면: 서부 의회가 우리 사절을 초청한다. 격식이 우리보다 한참 위다.
//   영향: 참석 여부 → westWarmth. 국고 소모(의전 비용).
//   은유: 상대의 자리에 갔을 때 느끼는 격차.
//
// west_08  대등한 제안
//   장면: 우리 쪽이 먼저 줄 수 있는 것이 생긴다(종자/기술/중개).
//   영향: west_form 확정. 비대칭이 해소되거나 그대로 남는다.
//   은유: 받기만 하던 관계에서 처음으로 줄 것이 생겼을 때.
//
// west_03  묻지 못한 이유  [미배정분]
//   장면: 서부가 왜 지원을 줄이는지 직접 물을 기회가 생긴다. 물으면 격이 떨어진다는 의견이 있다.
//   영향: 묻는다 → 이유를 알게 되지만 우리 사정이 드러난다. 안 묻는다 → uncertainty 유지.
//   은유: 이유를 알고 싶은데, 묻는 것 자체가 아쉬운 쪽임을 인정하는 일이 될 때.
//
// west_05  건너서 오는 말  [미배정분]
//   장면: 서부와 직접이 아니라 남부 상단을 거쳐 조건이 전해진다.
//   영향: southLeverage 소모. 교차 사건(cross_04)의 발생 조건에 기여.
//   은유: 직접 말할 사이가 아직 아니어서 사람을 끼워 넣는 관계.
//
// west_07  갚는 방식  [미배정분]
//   장면: 받은 것을 갚으려 한다. 서부는 대수롭지 않다는 반응이다.
//   영향: 국고 소모. westWarmth는 거의 안 움직인다 — 이게 이 루트의 핵심 통증이다.
//   은유: 갚고 싶은 마음이 상대에게는 부담도 아닌 관계.
//
//
// ─── 내정 [왕국이 굴러가는 힘] ───────────────────────────────────────────
//   D17: 내정과 백성은 왕국의 일상 기능과 체력을 반영한다. 대응표 원문은 04_story_bible.md §4.
//        집필 주의: 대응 관계를 주석에도 단정형으로 적지 않는다. 적어두면 대사가 그쪽으로 끌린다.
//        보고는 사실만 담고, 판단은 하지 않는다.
//   D14: 외교 교류량(initiative/warmth 누적)이 높을수록 자주 발생한다.
//   D15: 외교 선택의 물질적 결과가 여기서 드러난다.
//   금지: 특정 NPC = 특정 장기 고정 캐스팅(DESIGN_INTENT §B).
//   기존: E01(장부) E02(마을 분쟁) E28(사소한 논의)
//
// home_ration   겨울 배급
//   장면: 창고 담당자가 배급표를 다시 가져온다. 숫자가 지난번과 다르다.
//   영향: 곡물 부족 상태에서만 발생. 4인이 같은 사실을 각자 기능으로 읽는다.
//   은유: 몸이 먼저 티를 내는 순간. 아직 아프다고는 안 한다.
//
// home_tax      세금 (D16)
//   장면: 국고가 모자란다. 세금을 올릴 수 있다. 올리면 걷히고, 대신 무언가 생긴다.
//   영향: 국고 +, 민심 −(숫자 비노출). home_arrears/home_leave 발생 조건.
//   은유: 체력을 더 써서 관계에 쏟기로 하는 결정. 강요가 아니라 내 선택이다.
//
// home_arrears  체납
//   장면: 몇몇 마을의 세금이 들어오지 않는다. 항의는 없다. 그냥 안 온다.
//   영향: 국고 회복 둔화. 세금을 올린 뒤에만 발생.
//   은유: 무리한 뒤에 오는 조용한 신호. 항의보다 침묵이 먼저다.
//
// home_leave    떠나는 사람들
//   장면: 국경 마을 몇 가구가 조용히 떠났다는 보고. 이유는 적혀 있지 않다.
//   영향: 인력 감소 → 이후 외교 행동의 규모 제한.
//   은유: 돌보지 않은 것이 조용히 줄어드는 일.
//
// home_backlog  밀린 안건
//   장면: 서기관이 처리 못 한 안건 묶음을 들고 온다. 전부 사소한 것들이다.
//   영향: 외교 교류량이 높을 때 발생(D14 핵심). 처리하면 시간 소모.
//   은유: 한 사람에게 마음 쓰는 동안 나머지가 쌓여 있던 것.
//
// home_illness  앓는 계절
//   장면: 도성에 병이 돈다. 심하지 않지만 일손이 준다.
//   영향: 인력 감소. 민심 상태와 무관하게 발생 가능.
//   은유: 예고 없이 오는 소모. 누구 탓도 아니다.
//
// home_levy     징발  [미배정분]
//   장면: 사절 의전과 호위에 쓸 인력·물자를 어디서 뺄지 정해야 한다.
//   영향: 외교 행동의 직접 비용이 내정 숫자로 나타나는 자리(D15 회수 지점).
//   은유: 밖에 쓴 것은 결국 안에서 빠져나온 것이다.
//
// home_return   돌아온 사람들  [미배정분]
//   장면: 떠났던 몇 가구가 조용히 돌아왔다는 보고. 이유는 역시 적혀 있지 않다.
//   영향: home_leave 발생 후에만. 인력 일부 회복. 내정이 하강 일변도가 되지 않게 하는 균형추.
//   은유: 돌본 것이 티 나지 않게 돌아오는 일.
//
//
// ─── 해안 [서브 · 양념] ─────────────────────────────────────────────────
//   부담 없는 접촉. 메인 루트 사이에 끼워 리듬을 바꾼다. 확장하지 않는다.
//   기존: E12(축제 초대)
//
// coast_02  물자 교환
//   장면: 해안에서 생소한 물건이 들어온다. 값은 싸고 쓸모는 애매하다.
//   영향: coastalFamiliarity. 부담 없음.
//   은유: 깊지 않지만 즐거운 관계.
//
// coast_04  들른 김에
//   장면: 해안 상인이 다른 볼일로 왔다가 들른다. 용건은 특별히 없다.
//   영향: coastalFamiliarity.
//   은유: 약속하지 않아도 만나지는 사이.
//
//
// ─── 교차 [여러 관계를 동시에 굴릴 때]  [미배정분 4건] ──────────────────
//   지금 구조에서 가장 비어 있는 칸. 한 나라와의 선택이 다른 나라에서 값을 치르게 한다.
//   두 개 이상의 루트가 일정 이상 진행됐을 때만 발생한다.
//   은유축: 여러 관계를 동시에 유지하는 데 드는 값. 어느 쪽도 잘못하지 않았는데 부딪힌다.
//   기존: E26(전후 복구) E29(이어지는 외교) — 둘 다 후반 회수용. 중반에 아무것도 없다.
//
// cross_02  같은 날 도착
//   장면: 두 나라 사절이 같은 날 도착한다. 먼저 만날 쪽을 정해야 한다.
//   영향: 뒤로 밀린 쪽의 warmth −. 미루기 선택 시 양쪽 다 −.
//   은유: 둘 다 중요한데 몸은 하나일 때. 순서가 곧 메시지가 된다.
//
// cross_04  새어 나간 조건
//   장면: 한 나라에 준 조건이 다른 나라에 알려진다. 숨긴 적은 없다.
//   영향: 상대국 leverage/warmth. west_05 경유 시 발생 확률 상승.
//   은유: 각각에게 맞춘 말이 한자리에 모였을 때.
//
// cross_06  편들기
//   장면: 두 나라가 서로 다투고, 양쪽 다 우리에게 입장을 요구한다.
//   영향: 한쪽 선택 → 다른 쪽 급락. 중립 → 양쪽 소폭 하락 + 양쪽 다 유지.
//   은유: 중립이 가장 싸 보이지만 아무도 고마워하지 않는 선택.
//
// cross_08  겹치는 약속
//   장면: 서로 다른 나라에 한 두 약속이 같은 자원을 필요로 한다는 것이 드러난다.
//   영향: 국고/인력 직접 충돌. 한쪽 연기 또는 세금 인상(home_tax 연결).
//   은유: 지킬 생각으로 한 말들이 서로를 못 지키게 만들 때.
//
//
// ─── 엔딩 [D6: 최소 10종] ───────────────────────────────────────────────
//   바깥 층(왕국의 결말) = 10종 이상으로 나눈다.
//   안쪽 층("내가 결정하지.") = 관계 결과와 무관하게 도달한다. 조건 금지.
//   국가별 form 4개(east/south/north/west) × 각 3형(open/formal/bounded)의
//   조합에서 실제로 도달 가능한 것을 골라 10종 이상을 구성한다.
//   + 내정 상태(국고/인력/민심)가 엔딩 서술의 배경을 바꾼다.
//   구체 목록은 미작성 — 루트 본문이 채워진 뒤 설계한다.
