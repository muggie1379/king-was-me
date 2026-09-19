// KING WAS ME — 분기 구조 명세 (Ink)
// 원본: 04_story_bible.md §5.1 "분기 시스템 명세". 두 문서 구조가 어긋나면 그 섹션이 기준.
// 이 파일은 완성 대사가 아니라 "분기 로직 + 대표 텍스트"를 담은 구조 초안이다.
// Inky(https://github.com/inkle/inky, 무료)로 열면 실제로 플레이하며 분기 그래프를 검증할 수 있다.
// TODO로 표시된 곳(Major Branch 방문 루트)은 프로즈 미작성 — 04_story_bible.md §31 TBD 참고.

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

-> event_01

=== event_01 ===
~ seran_introduced = true
~ valen_introduced = true
// [내정] 즉위
창고 장부와 실제 재고가 조금 다르다. 담당자는 기록 실수 가능성을 말한다. 당장 큰 피해는 없다.
{ seran_introduced: 세르안: 기록부터 맞춰야 합니다. }
{ valen_introduced: 발렌: 오늘 처리하면 내일 다시 안 봐도 됩니다. }
+ [기록을 다시 확인한다] -> event_02
+ [담당자를 불러 즉시 정리한다] -> event_02
+ [작은 오차로 보고 현 상태를 유지한다] -> event_02

=== event_02 ===
// [내정] 작은 분쟁
인접 마을 사이의 약속된 물품 인도가 이틀 늦어진다. 한쪽은 약속 위반, 다른 쪽은 폭우 때문이라 주장한다.
{ valen_introduced: 발렌: 그래서 다시 움직이면 되는 건 누굽니까? }
+ [원인을 추가 확인한다] -> event_03
+ [새 일정을 먼저 잡는다] -> event_03
+ [책임 소재부터 확인한다] -> event_03

=== event_03 ===
// [북부] 첫 국경 신호
북부 변경국 국경 밖에서 소규모 병력 이동이 관찰된다. 국경 침범은 없다.
{ seran_introduced: 세르안: 움직였다는 것과 공격한다는 것은 다릅니다. }
{ valen_introduced: 발렌: 그럼 대비만 하면 됩니다. }
+ [정찰 강화]
    ~ northTension += 1
    -> event_04
+ [수비 증강]
    ~ northTension += 1
    -> event_04
+ [외교 확인 요청] -> event_04
+ [관찰 유지] -> event_04

=== event_04 ===
// [동부] 새로운 왕국
동부 왕국에서 첫 사절이 온다. 구체적 요구는 없다. 최근 소식을 들었다며 가벼운 우호 인사를 보낸다.
{ seran_introduced: 세르안: 우호적인 접촉인 것은 사실입니다. }
{ valen_introduced: 발렌: 그럼 답하면 되겠군. }
+ [정식 답신]
    ~ eastWarmth += 1
    -> event_05
+ [작은 답례]
    ~ eastWarmth += 1
    -> event_05
+ [추가 정보 확인] -> event_05
+ [짧은 예의만 표시] -> event_05

=== event_05 ===
// [남부] 조건이 다른 상인
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
리안 소개: 외교관 리안이 회의에 합류한다.
// [동부] 두 번째 사절
동부가 다시 먼저 사절을 보낸다. "시간이 맞으면 다시 이야기하자"에 가까운 표현.
{ rian_introduced: 리안: 한 걸음 왔다고 우리가 두 걸음 갈 필요는 없습니다. }
+ [이전보다 적극적으로 응답]
    ~ eastWarmth += 1
    -> event_07
+ [상대가 보인 만큼 응답] -> event_07
+ [좋은 신호로 보되 더 관찰] -> event_07
+ [다음 행동은 동부에 맡김] -> event_07

=== event_07 ===
// [북부] 다시 움직인 국경 (Event 03 후속)
북부 변경국 인근에서 다시 병력 이동. 이전보다 규모가 크다. 국경 침범은 없다.
{ valen_introduced: 발렌: 이번엔 지켜만 보고 있을 때가 아닙니다. }
{ seran_introduced: 세르안: 규모가 커졌다는 것과 의도가 달라졌다는 것은 다릅니다. }
+ [수비 증강]
    ~ north_hardline = true
    ~ northTension += 2
    -> event_08 // Strong Choice — E21 발생 조건에 기여
+ [정찰 확대]
    ~ northTension += 1
    -> event_08
+ [외교 채널로 확인 요청]
    ~ north_deescalate = true
    ~ northTension -= 1
    -> event_08
+ [이전 대응 유지] -> event_08

=== event_08 ===
// [동부] 공동 축제
두 왕국이 공동 행사에 참여한다. 동부 쪽에서 머무는 시간을 조금 늘린다.
{ seran_introduced: 세르안: 좋은 시간이었던 것과 다음 약속은 다른 사실입니다. }
+ [더 함께 시간을 보냄]
    ~ eastWarmth += 1
    -> event_09
+ [다음 만남을 먼저 제안]
    ~ eastWarmth += 1
    -> event_09
+ [좋은 분위기에서 종료] -> event_09
+ [작은 호의만 건넴] -> event_09

=== event_09 ===
// [서부] 오래된 약속
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
며칠 동안 동부에서 뚜렷한 새 제안이 없다.
+ [평소처럼 교류] -> event_16
+ [다음 움직임은 동부가 먼저 하게 둠] -> event_16
+ [우선순위 낮춤]
    ~ eastWarmth -= 1
    -> event_16
+ [공식 교류만 유지] -> event_16

=== event_15_closed ===
// [동부] 닫힌 교류 (Strong Branch 변형, E13 pause_contact=true)
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
같은 북부 국경 상황을 두고 여러 부서가 서로 다른 해석을 담은 보고를 올린다.
{ valen_introduced: 발렌: 그래서 실제로 달라진 건 뭡니까? }
+ [공통 사실만 기준] -> event_17
+ [추가 정보 수집]
    ~ watcher_unlocked = true
    -> event_17
+ [행동으로 확인] -> event_17
+ [현재 방침 유지] -> event_17

=== event_17 ===
{ watcher_unlocked:
    ~ watcher_introduced = true
    정보총관이 요청받은 추가 자료를 들고 들어온다.
    Watcher: 확인된 기록과 추정은 나누어 보고하겠습니다.
}
// [종합] 왕실 회의 — Major Branch 분기점
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
관계를 해결하거나 확인하기 위해 평소보다 큰 사절단을 준비할 수 있다.
+ [대규모 파견]
    ~ eastPressure += 1
    -> event_19
+ [규모 축소] -> event_19
+ [소규모 확인] -> event_19
+ [파견 취소] -> event_19

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
남부와 진행 중이던 수로 공사 협력이 우리 쪽의 늦은 응답 때문에 지연되고 있다는 보고.
{ karden_introduced: 카르덴: 지난 두 달 동안 동부 문제로 열린 회의가 열한 번입니다. 남부 수로 공사는 아직 첫 회의도 끝나지 않았습니다. }
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
동부가 사절단의 입국을 지연하거나 제한한다. 적대 선언은 없다.
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
왕이 실제로 동부 국경에 도착한다. 입국이 지연되거나 제한된다는 사실을 보고서가 아니라 눈으로 직접 본다. 적대 선언은 여전히 없다.
{ rian_introduced: 리안: 선이 생겼다는 것과 적이 됐다는 것은 다릅니다. 여기 직접 서 계셔도 그 사실은 바뀌지 않습니다. }
{ karden_introduced: 카르덴: 폐하를 이 자리에 이렇게 오래 세워둘 수는 없습니다. }
{ valen_introduced: 발렌: 지금이라도 돌아가실 수 있습니다. }
+ [성문 앞에서 기다린다] -> event_21
+ [수행 규모를 줄여 다시 요청한다] -> event_21
+ [돌아간다]
    ~ eastWarmth -= 1
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
우리 측 순찰과 북부 측 병력이 근접하는 사건이 발생한다. 충돌은 없었으나 양측 모두 놀란다.
{ valen_introduced: 발렌: 여기서 더 세게 나가면 진짜 전쟁이 됩니다. }
{ rian_introduced: 리안: 지금 필요한 건 확인이지 경고가 아닙니다. }
{ karden_introduced: 카르덴: 우리 병사들부터 진정시켜야 합니다. }
+ [즉시 강경 대응]
    ~ northTension += 2
    -> event_22 // Strong Branch — 이후 북부 관계 긴장 국면 전환
+ [공식 채널로 해명 요구] -> event_22
+ [현장 지휘관에 자제 지시]
    ~ northTension -= 1
    -> event_22
+ [침묵 유지] -> event_22

=== bridge_stable_border ===
// 브리지 — 안정된 국경 (E21 스킵 대체, 선택 없음)
북부 쪽에서는 며칠째 별다른 보고가 없다. 담당 서기관의 보고에는 "조용합니다"라고 적혀 있다.
-> event_22

=== event_22 ===
// 라우터: E17 royal_visit에 따라 분기
{ royal_visit:
    -> event_22_visit
- else:
    -> event_22_default
}

=== event_22_default ===
// [동부] 공물
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
// 라우터: E17 royal_visit에 따라 분기
{ royal_visit:
    -> event_23_visit
- else:
    -> event_23_default
}

=== event_23_default ===
// [동부] 마지막 회담
동부와 중요한 직접 회담이 열린다. 왕의 긴 대사는 없다 — 행동 의도만 고른다.
+ [오해를 정리한다] -> event_24
+ [미안했던 부분을 인정한다] -> event_24
+ [더 요구하지 않는다] -> event_24
+ [현재 관계 형태를 확인한다] -> event_24
+ [자신의 경계를 전달한다] -> event_24

=== event_23_visit ===
// [동부·방문] E23′ 그 자리에서 (2026-09-19 프로즈 작성 완료, 04_story_bible.md Event 23′ 참고)
// 기본형과 동일한 행동 의도 선택지 — 다른 것은 전달 방식(서신 vs 대면)이지 의도의 종류가 아니다.
동부와의 마지막 회담이 서신이 아니라 실제 대면으로 열린다. 대신들의 조언도 문서가 아니라 회담 직전, 그 자리에서 실시간으로 전달된다.
{ rian_introduced: 리안: 지금부터는 제가 대신 전할 수 없습니다. 표정도, 말투도 전부 폐하의 것입니다. }
{ karden_introduced: 카르덴: 물러설 자리를 남겨두십시오. 마지막에도 그건 유효합니다. }
+ [오해를 정리한다] -> event_24
+ [미안했던 부분을 인정한다] -> event_24
+ [더 요구하지 않는다] -> event_24
+ [현재 관계 형태를 확인한다] -> event_24
+ [자신의 경계를 전달한다] -> event_24

=== event_24 ===
// [동부] 조약 — 두 루트(기본/방문) 공통 수렴
향후 관계 형태가 명문화된다. Good/Bad Ending처럼 평가하지 않는다.
{ rian_introduced: 리안: 외교를 끝내는 것과 적이 되는 것은 다릅니다. }
-> event_25

=== event_25 ===
// [동부] 철수
동부에 투입했던 사절, 병력, 자원을 정리한다.
{ valen_introduced: 발렌: 패배입니까? }
{ seran_introduced: 세르안: 목표는 달성하지 못했습니다. }
{ karden_introduced: 카르덴: 하지만 나라는 살아 있습니다. }
-> event_26

=== event_26 ===
// [전체] 전후 복구 — 다국가 구조의 payoff. 설명 대신 지도로 보여준다.
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
{ chaplain_introduced: Chaplain: 이번 협력의 조건부터 함께 살펴봅시다. }
// [해안/서부] 다시 믿는 일
새로운 협력 또는 신뢰가 필요한 일이 생긴다. 동부 관계 결과를 단정하는 문구는 쓰지 않는다.
+ [다시 신뢰해봄] -> event_28
+ [천천히 확인] -> event_28
+ [아직 거리 유지] -> event_28

=== event_28 ===
~ fool_introduced = true
궁정의 광대가 처음 소개된다.
{ fool_introduced: Fool: 이 안건도 회의록 한 권을 채우겠군요. }
// [내정] 웃을 수 있는 거리
궁정이 또 하나의 사소한 사건을 지나치게 심각하게 논의한다.
+ [웃고 넘김] -> event_29
+ [그래도 확인] -> event_29
+ [잠시 둠] -> event_29
+ [중요도를 낮춤] -> event_29

=== event_29 ===
// [미정 국가] 새로운 사절 — 국가 동적 결정은 TBD, 현재는 고정 텍스트
게임 초반과 닮은 새로운 사절이 온다. 과거 동부와 동일한 관계라는 근거는 없다.
+ [성문을 연다] -> epilogue
+ [천천히 알아본다] -> epilogue
+ [공식 접촉만 시작한다] -> epilogue
+ [아직 준비되지 않았다고 알린다] -> epilogue

=== epilogue ===
// EPILOGUE — KING WAS YOU 시퀀스 (04_story_bible.md §11-18)
왕국의 밤. 왕은 혼자 있는 것처럼 보이지만 얼굴은 끝까지 명확히 보여주지 않는다.
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
{ watcher_introduced: Watcher: 확인한 기록은 여기까지입니다. }
{ chaplain_introduced: Chaplain: 다음 가능성의 조건은 아직 열려 있습니다. }
{ fool_introduced: Fool: 짧은 안부 하나에도 회의는 길어지는군요. }
-> empty_throne

=== empty_throne ===
// 빈 왕좌
카메라가 왕의 자리로 이동한다. 왕좌가 비어 있다. 설명하지 않는다.
-> first_person

=== first_person ===
// 최초의 완전한 왕 1인칭
발걸음. 카메라가 플레이어 시점으로 이동한다. 왕좌까지 걷는다. 앉는다. 대신들을 바라본다.
-> final_line

=== final_line ===
// 마지막 대사 — 게임 전체에서 유일한 왕의 직접 발화
"내가 결정하지."
암전.
KING WAS ME
-> END
