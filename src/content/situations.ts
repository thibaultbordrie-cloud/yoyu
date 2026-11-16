// Templates for the "Prepare" module. Each one is copied into an editable card: the person keeps what helps.

import type { Locale } from "../i18n.ts";

export interface CardContent {
  title: string;
  steps: string[];
  phrases: string[];
  bring: string[];
  planB: string[];
  recovery: string;
}

export interface Template {
  id: string;
  icon: string;
  text: Record<Locale, CardContent>;
}

export const TEMPLATES: Template[] = [
  {
    id: "call",
    icon: "☎",
    text: {
      fr: {
        title: "Passer un appel téléphonique",
        steps: [
          "Je choisis un moment calme et j'ai mes notes sous les yeux.",
          "Une personne ou un message enregistré répond.",
          "Je dis qui je suis et pourquoi j'appelle.",
          "On me pose des questions ; j'ai le droit de prendre le temps de répondre.",
          "Je répète ce qui a été décidé (date, heure, prochaine étape).",
          "Je dis merci et je raccroche.",
        ],
        phrases: [
          "Bonjour, je m'appelle … J'appelle pour …",
          "Pouvez-vous répéter plus lentement, s'il vous plaît ?",
          "Je préfère recevoir la confirmation par e-mail ou SMS.",
          "Je vérifie : c'est bien le … à … heures ?",
          "Je n'ai pas cette information sous la main, je vous rappelle.",
        ],
        bring: ["Numéro de dossier ou de client", "Agenda ouvert", "Papier et stylo", "Mes questions écrites"],
        planB: [
          "Si personne ne répond : je laisse un message court ou je rappelle à une heure prévue.",
          "Si c'est trop long ou trop difficile : je demande s'il existe un formulaire en ligne ou une adresse e-mail.",
          "Si je perds le fil : « Excusez-moi, je reprends mes notes. »",
        ],
        recovery: "Cinq minutes au calme après l'appel, sans écran.",
      },
      en: {
        title: "Making a phone call",
        steps: [
          "I choose a quiet moment and keep my notes in front of me.",
          "A person or a recorded message answers.",
          "I say who I am and why I am calling.",
          "They ask questions; I am allowed to take time to answer.",
          "I repeat what was decided (date, time, next step).",
          "I say thank you and hang up.",
        ],
        phrases: [
          "Hello, my name is … I am calling about …",
          "Could you repeat that more slowly, please?",
          "I would prefer to get the confirmation by e-mail or text.",
          "Let me check: that is on … at …?",
          "I do not have that information to hand; I will call you back.",
        ],
        bring: ["File or customer number", "Calendar open", "Paper and pen", "My questions, written down"],
        planB: [
          "If nobody answers: I leave a short message or call back at a set time.",
          "If it is too long or too hard: I ask whether there is an online form or an e-mail address.",
          "If I lose track: “Sorry, I am checking my notes.”",
        ],
        recovery: "Five quiet minutes after the call, away from screens.",
      },
      ja: {
        title: "電話をかける",
        steps: [
          "落ち着いた時間を選び、メモを目の前に置く。",
          "人か、録音された音声が応答する。",
          "名前と、電話した理由を伝える。",
          "質問される。答えるのに時間をかけてもいい。",
          "決まったこと（日付・時間・次にすること）をくり返して確認する。",
          "お礼を言って電話を切る。",
        ],
        phrases: [
          "もしもし、…と申します。…の件でお電話しました。",
          "もう少しゆっくり言っていただけますか。",
          "確認はメールかショートメッセージでいただけると助かります。",
          "確認させてください。…日の…時でよろしいですか。",
          "いま手元に情報がないので、あらためてお電話します。",
        ],
        bring: ["受付番号・お客様番号", "予定表", "紙とペン", "書き出した質問"],
        planB: [
          "誰も出なかったら：短い伝言を残すか、決めた時間にかけ直す。",
          "長すぎる・難しすぎるときは：ネットのフォームやメールで受け付けているか聞く。",
          "話がわからなくなったら：「すみません、メモを確認します」。",
        ],
        recovery: "電話のあと5分、画面を見ずに静かに過ごす。",
      },
      "zh-Hant": {
        title: "打一通電話",
        steps: [
          "選一個安靜的時間，把筆記放在眼前。",
          "接電話的是人，或是語音系統。",
          "說出我是誰、為什麼打來。",
          "對方會問問題；我可以慢慢回答。",
          "把決定的事（日期、時間、下一步）再說一次確認。",
          "說謝謝，掛電話。",
        ],
        phrases: [
          "您好，我是…，打來是想詢問…",
          "可以請您說慢一點嗎？",
          "我比較希望用電子郵件或簡訊收到確認。",
          "我確認一下：是…號…點，對嗎？",
          "我手邊沒有這個資料，晚點再回電給您。",
        ],
        bring: ["案件編號或客戶編號", "打開的行事曆", "紙和筆", "寫好的問題"],
        planB: [
          "如果沒人接：留一段簡短的留言，或在固定時間再打。",
          "如果太久或太難：問問看有沒有線上表單或電子郵件。",
          "如果我跟不上：「不好意思，我看一下筆記。」",
        ],
        recovery: "講完電話後，離開螢幕安靜五分鐘。",
      },
    },
  },
  {
    id: "doctor",
    icon: "✚",
    text: {
      fr: {
        title: "Rendez-vous médical",
        steps: [
          "Je pars avec de la marge pour ne pas courir.",
          "J'arrive, je me présente à l'accueil ou je m'assieds en salle d'attente.",
          "L'attente peut durer : j'ai de quoi m'occuper.",
          "Le médecin m'appelle ; je donne ma liste écrite.",
          "Examen ou questions ; je peux demander ce qui va se passer avant chaque geste.",
          "On me dit la suite (ordonnance, examen, prochain rendez-vous) ; je la note.",
          "Paiement ou carte de santé, puis je pars.",
        ],
        phrases: [
          "J'ai préparé une liste, je préfère vous la lire.",
          "Pouvez-vous me dire ce que vous allez faire avant de le faire ?",
          "Pouvez-vous me l'écrire ?",
          "La lumière (ou le bruit) me gêne, est-ce possible de la baisser ?",
          "Je voudrais être sûr d'avoir compris : je dois …",
        ],
        bring: ["Carte de santé et pièce d'identité", "Liste des symptômes, depuis quand, médicaments en cours", "Casque ou bouchons d'oreilles", "Quelque chose pour patienter", "Eau"],
        planB: [
          "Si le rendez-vous a du retard : je préviens si besoin, je sors marcher deux minutes.",
          "Si je n'arrive plus à parler : je montre ma liste écrite.",
          "Si j'oublie une question : j'envoie un message ou je la garde pour la prochaine fois.",
        ],
        recovery: "Un trajet retour au calme, puis un moment seul.",
      },
      en: {
        title: "Medical appointment",
        steps: [
          "I leave with time to spare so I do not have to rush.",
          "I arrive, check in at reception or sit in the waiting room.",
          "The wait can be long: I have something to keep me busy.",
          "The doctor calls me; I hand over my written list.",
          "Examination or questions; I can ask what will happen before each step.",
          "I am told what comes next (prescription, test, next appointment); I write it down.",
          "Payment or health card, then I leave.",
        ],
        phrases: [
          "I prepared a list; I would rather read it to you.",
          "Could you tell me what you are going to do before you do it?",
          "Could you write that down for me?",
          "The light (or the noise) bothers me; could it be turned down?",
          "I want to be sure I understood: I need to …",
        ],
        bring: ["Health card and ID", "List of symptoms, since when, current medicines", "Headphones or earplugs", "Something to pass the time", "Water"],
        planB: [
          "If the appointment runs late: I let someone know if needed and step out for a two-minute walk.",
          "If I cannot speak any more: I show my written list.",
          "If I forget a question: I send a message or keep it for next time.",
        ],
        recovery: "A quiet trip home, then some time alone.",
      },
      ja: {
        title: "病院の予約",
        steps: [
          "急がなくていいように、余裕をもって出かける。",
          "到着したら受付をするか、待合室で座る。",
          "待ち時間が長いことがある。時間をつぶすものを持っていく。",
          "名前を呼ばれたら、書いておいたメモを渡す。",
          "診察や質問。何をするのか、そのつど先に聞いてもいい。",
          "次のこと（処方箋、検査、次の予約）を聞いて、メモする。",
          "会計をして帰る。",
        ],
        phrases: [
          "メモを用意してきたので、読ませてください。",
          "何をするか、先に教えていただけますか。",
          "書いていただけますか。",
          "光（音）がつらいので、少し弱めてもらえますか。",
          "確認させてください。わたしは…すればいいですか。",
        ],
        bring: ["保険証・マイナ保険証", "症状・いつからか・飲んでいる薬のメモ", "イヤーマフや耳栓", "待ち時間に使うもの", "水"],
        planB: [
          "予定より遅れていたら：必要なら伝えて、2分ほど外を歩く。",
          "話せなくなったら：書いたメモを見せる。",
          "聞き忘れたら：メッセージで聞くか、次回にまわす。",
        ],
        recovery: "帰り道は静かに過ごし、そのあとひとりの時間をとる。",
      },
      "zh-Hant": {
        title: "看醫生",
        steps: [
          "提早出門，不用趕。",
          "到了之後掛號報到，或在候診區坐下。",
          "可能要等很久：帶點東西打發時間。",
          "叫到我的時候，把寫好的清單交給醫生。",
          "檢查或問診；每一步之前，我都可以先問要做什麼。",
          "醫生說明接下來的事（處方、檢查、下次回診），我記下來。",
          "批價領藥，然後離開。",
        ],
        phrases: [
          "我準備了一張清單，想直接唸給您聽。",
          "做之前可以先告訴我要做什麼嗎？",
          "可以幫我寫下來嗎？",
          "燈光（或聲音）讓我不舒服，可以調小一點嗎？",
          "我想確定我聽懂了：我要…",
        ],
        bring: ["健保卡和身分證", "症狀、開始的時間、正在吃的藥", "耳罩或耳塞", "等待時用的東西", "水"],
        planB: [
          "如果看診延誤：需要的話告知一聲，出去走兩分鐘。",
          "如果我說不出話：拿出寫好的清單。",
          "如果忘了問：傳訊息問，或留到下次。",
        ],
        recovery: "安靜地回家，然後給自己一段獨處時間。",
      },
    },
  },
  {
    id: "meeting",
    icon: "◫",
    text: {
      fr: {
        title: "Réunion de travail",
        steps: [
          "Je lis l'ordre du jour et je note ce que je veux dire.",
          "J'arrive un peu avant et je choisis une place qui me convient.",
          "Tour de table ou début : je peux dire une phrase préparée.",
          "Discussion : je note les décisions et ce qu'on attend de moi.",
          "Fin : je vérifie qui fait quoi et pour quand.",
        ],
        phrases: [
          "J'ai un point à ajouter sur …",
          "Pour être sûr : on attend de moi … pour le … ?",
          "Je préfère y réfléchir et vous répondre par écrit d'ici …",
          "Est-ce qu'il y aura un compte rendu ?",
          "Je n'ai pas compris ce point, pouvez-vous le reformuler ?",
        ],
        bring: ["Ordre du jour", "Mes notes et mon point principal", "De quoi écrire", "Eau"],
        planB: [
          "Si la réunion change d'horaire ou de sujet : je demande l'ordre du jour à jour.",
          "Si c'est trop bruyant ou trop long : je peux sortir un moment.",
          "Si on me pose une question imprévue : « Je vous réponds par écrit d'ici demain. »",
        ],
        recovery: "Une pause sans interaction juste après, puis une tâche simple et seul.",
      },
      en: {
        title: "Work meeting",
        steps: [
          "I read the agenda and write down what I want to say.",
          "I arrive a little early and pick a seat that suits me.",
          "Introductions or opening: I can say a prepared sentence.",
          "Discussion: I note decisions and what is expected from me.",
          "End: I check who does what, and by when.",
        ],
        phrases: [
          "I have a point to add about …",
          "To be sure: you need … from me by …?",
          "I would rather think about it and answer in writing by …",
          "Will there be minutes?",
          "I did not understand that point; could you rephrase it?",
        ],
        bring: ["Agenda", "My notes and my main point", "Something to write with", "Water"],
        planB: [
          "If the time or the topic changes: I ask for the updated agenda.",
          "If it is too loud or too long: I can step out for a moment.",
          "If I get an unexpected question: “I will answer in writing by tomorrow.”",
        ],
        recovery: "A break with no interaction right after, then a simple task on my own.",
      },
      ja: {
        title: "職場の会議",
        steps: [
          "議題を読み、言いたいことをメモしておく。",
          "少し早めに着いて、自分に合う席を選ぶ。",
          "自己紹介や冒頭では、用意した一言を話せばいい。",
          "話し合いの中で、決まったことと自分に求められていることをメモする。",
          "最後に、誰が何をいつまでにするかを確認する。",
        ],
        phrases: [
          "…について、一点追加させてください。",
          "確認です。わたしは…を…までに、ということでよろしいですか。",
          "少し考えて、…までに文書でお返事します。",
          "議事録はありますか。",
          "その点がわからなかったので、言い換えていただけますか。",
        ],
        bring: ["議題", "メモと、いちばん伝えたいこと", "筆記用具", "水"],
        planB: [
          "時間や議題が変わったら：最新の議題をもらう。",
          "うるさすぎる・長すぎるときは：少し席を外していい。",
          "予想外の質問をされたら：「明日までに文書でお答えします」。",
        ],
        recovery: "終わったらすぐ、人と話さない休憩をとり、そのあと一人でできる簡単な作業をする。",
      },
      "zh-Hant": {
        title: "工作會議",
        steps: [
          "先讀議程，寫下我想說的話。",
          "早一點到，選一個適合我的位子。",
          "自我介紹或開場時，說準備好的一句話就好。",
          "討論時，記下決議和別人期待我做的事。",
          "結束前，確認誰做什麼、什麼時候完成。",
        ],
        phrases: [
          "關於…，我想補充一點。",
          "我確認一下：您需要我在…之前完成…，對嗎？",
          "我想先想一想，在…之前用書面回覆。",
          "會有會議紀錄嗎？",
          "這一點我沒聽懂，可以換個說法嗎？",
        ],
        bring: ["議程", "我的筆記和重點", "筆", "水"],
        planB: [
          "如果時間或主題改了：要一份最新的議程。",
          "如果太吵或太久：可以暫時離開一下。",
          "如果被問到意料之外的問題：「我明天前用書面回覆您。」",
        ],
        recovery: "結束後馬上休息一下、不跟人互動，然後一個人做件簡單的事。",
      },
    },
  },
  {
    id: "trip",
    icon: "⇄",
    text: {
      fr: {
        title: "Trajet en train ou en bus",
        steps: [
          "Je vérifie l'horaire, le quai ou l'arrêt, et je garde le billet prêt.",
          "J'arrive en avance ; je repère l'écran des départs.",
          "Je monte, je trouve ma place ou un coin plus calme.",
          "Pendant le trajet : casque, musique, ou rien.",
          "Je surveille les arrêts et je me prépare un arrêt avant le mien.",
          "Je descends et je reprends mes repères.",
        ],
        phrases: [
          "Excusez-moi, c'est bien le train pour … ?",
          "Je crois que c'est ma place : voiture …, place …",
          "Pardon, je descends au prochain arrêt.",
        ],
        bring: ["Billet ou carte (et une copie)", "Téléphone chargé", "Casque ou bouchons d'oreilles", "Eau et quelque chose à manger", "L'itinéraire de secours"],
        planB: [
          "Si le train est retardé ou annulé : je regarde l'application ou l'écran, puis je suis l'itinéraire de secours.",
          "Si c'est bondé : j'attends le suivant si je peux, ou je me mets près d'une porte.",
          "Si je me sens saturé : je ferme les yeux, casque sur les oreilles, et je compte les arrêts.",
        ],
        recovery: "À l'arrivée, dix minutes pour souffler avant la suite.",
      },
      en: {
        title: "Train or bus trip",
        steps: [
          "I check the time, the platform or stop, and keep my ticket ready.",
          "I arrive early and find the departures board.",
          "I get on and find my seat or a quieter spot.",
          "During the trip: headphones, music, or nothing.",
          "I watch the stops and get ready one stop before mine.",
          "I get off and find my bearings again.",
        ],
        phrases: [
          "Excuse me, is this the train to …?",
          "I think this is my seat: coach …, seat …",
          "Sorry, I am getting off at the next stop.",
        ],
        bring: ["Ticket or pass (and a copy)", "Charged phone", "Headphones or earplugs", "Water and a snack", "The backup route"],
        planB: [
          "If the train is late or cancelled: I check the app or the board, then follow my backup route.",
          "If it is packed: I wait for the next one if I can, or stand near a door.",
          "If I feel overloaded: eyes closed, headphones on, and I count the stops.",
        ],
        recovery: "On arrival, ten minutes to breathe before the next thing.",
      },
      ja: {
        title: "電車・バスでの移動",
        steps: [
          "時刻、ホームや乗り場を確認し、切符をすぐ出せるようにしておく。",
          "早めに着いて、発車案内の表示を見つける。",
          "乗ったら、自分の席か、静かめの場所を見つける。",
          "移動中は、イヤホン、音楽、または何もしない。",
          "停車駅を見ておき、降りる一つ前の駅で準備する。",
          "降りたら、周りを確かめて落ち着く。",
        ],
        phrases: [
          "すみません、これは…行きですか。",
          "ここはわたしの席だと思います。…号車の…番です。",
          "すみません、次で降ります。",
        ],
        bring: ["切符・交通系ICカード（と控え）", "充電した携帯電話", "イヤーマフや耳栓", "水と軽食", "別ルートのメモ"],
        planB: [
          "遅延・運休のときは：アプリか表示を見て、別ルートに切り替える。",
          "混んでいたら：できれば次を待つか、ドアの近くに立つ。",
          "つらくなったら：目を閉じ、イヤホンをして、駅の数を数える。",
        ],
        recovery: "着いたら、次の予定の前に10分ひと息つく。",
      },
      "zh-Hant": {
        title: "搭火車或公車",
        steps: [
          "確認時間、月台或站牌，把車票準備好。",
          "提早到，找到發車資訊看板。",
          "上車後，找到我的位子或比較安靜的角落。",
          "車上：戴耳機、聽音樂，或什麼都不做。",
          "注意停靠站，在我下車的前一站就準備好。",
          "下車後，重新找回方向感。",
        ],
        phrases: [
          "不好意思，這班是往…的嗎？",
          "這應該是我的位子：…車…號。",
          "不好意思，我下一站下車。",
        ],
        bring: ["車票或悠遊卡（和一份備份）", "充好電的手機", "耳罩或耳塞", "水和點心", "備用路線"],
        planB: [
          "如果誤點或停駛：看 App 或看板，改走備用路線。",
          "如果很擠：可以的話等下一班，或站在門邊。",
          "如果感到超載：閉上眼睛、戴上耳機，數停靠站。",
        ],
        recovery: "到了之後，先花十分鐘喘口氣再做下一件事。",
      },
    },
  },
  {
    id: "change",
    icon: "↻",
    text: {
      fr: {
        title: "Un changement de programme",
        steps: [
          "J'apprends que le programme change (horaire, lieu, personne, annulation).",
          "Je m'accorde un temps avant de répondre.",
          "Je note ce qui change et ce qui reste pareil.",
          "Je pose les questions qui me manquent.",
          "Je refais le plan de la journée avec ce qui reste possible.",
        ],
        phrases: [
          "D'accord, j'ai besoin de quelques minutes pour réorganiser.",
          "Qu'est-ce qui change exactement, et qu'est-ce qui reste prévu ?",
          "Pouvez-vous me l'envoyer par écrit ?",
          "Ça ne me convient pas aujourd'hui ; est-ce possible de faire … à la place ?",
        ],
        bring: ["Mon planning de la journée", "Une activité de repli qui me calme"],
        planB: [
          "Si je suis submergé : je m'isole cinq minutes avant de décider quoi que ce soit.",
          "Si la journée est perdue : je garde une seule chose importante et je reporte le reste.",
        ],
        recovery: "Le soir, je note dans la batterie : « Changement imprévu ».",
      },
      en: {
        title: "A change of plan",
        steps: [
          "I learn that the plan changes (time, place, person, cancellation).",
          "I give myself time before answering.",
          "I write down what changes and what stays the same.",
          "I ask the questions I still need answered.",
          "I redo the day's plan with what is still possible.",
        ],
        phrases: [
          "All right, I need a few minutes to reorganise.",
          "What exactly changes, and what is still planned?",
          "Could you send it to me in writing?",
          "That does not work for me today; could we do … instead?",
        ],
        bring: ["My plan for the day", "A fallback activity that calms me"],
        planB: [
          "If I am overwhelmed: I take five minutes alone before deciding anything.",
          "If the day is lost: I keep one important thing and move the rest.",
        ],
        recovery: "In the evening, I log “Unexpected change” in the battery.",
      },
      ja: {
        title: "予定の変更",
        steps: [
          "予定が変わったと知る（時間・場所・人・中止）。",
          "返事をする前に、少し時間をとる。",
          "変わったことと、変わらないことを書き出す。",
          "足りない情報を質問する。",
          "できることで、一日の予定を立て直す。",
        ],
        phrases: [
          "わかりました。整理するのに数分ください。",
          "具体的に何が変わって、何はそのままですか。",
          "文書で送っていただけますか。",
          "今日はそれだと難しいので、かわりに…はできますか。",
        ],
        bring: ["今日の予定表", "落ち着ける代わりの活動"],
        planB: [
          "いっぱいいっぱいになったら：何かを決める前に、5分ひとりになる。",
          "今日はもう難しいときは：大事なことを一つだけ残し、あとは先に延ばす。",
        ],
        recovery: "夜、バッテリーに「予定外の変更」と記録する。",
      },
      "zh-Hant": {
        title: "計畫臨時改變",
        steps: [
          "得知計畫有變（時間、地點、人、取消）。",
          "回覆之前，先給自己一點時間。",
          "寫下哪些改變了、哪些沒變。",
          "問清楚還不知道的事。",
          "用還做得到的事，重新排今天的計畫。",
        ],
        phrases: [
          "好的，我需要幾分鐘重新安排。",
          "具體改了什麼？哪些還是照原計畫？",
          "可以用書面傳給我嗎？",
          "今天這樣對我不太行，可以改成…嗎？",
        ],
        bring: ["今天的計畫表", "一個能讓我平靜的替代活動"],
        planB: [
          "如果我被淹沒了：做任何決定之前，先獨處五分鐘。",
          "如果今天已經不行了：只留一件重要的事，其他的往後延。",
        ],
        recovery: "晚上在電量裡記下「計畫臨時改變」。",
      },
    },
  },
];
