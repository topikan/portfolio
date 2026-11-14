// src/js/i18n-sections.js
//
// Тексты «продающих» блоков: Обо мне, Процесс, Цены, Доказательства, FAQ,
// Контакты, футер, политика конфиденциальности. Подмешиваются в общий
// словарь в i18n.js. ЦЕНЫ и СРОКИ — ориентиры, поправь под себя здесь же.

export const sectionTranslations = {
	en: {
		'about.eyebrow': 'ABOUT ME',
		'about.badge': 'Rodion · developer',
		'about.title.line1': 'I\u2019M A DEVELOPER.',
		'about.title.line2': 'I THINK ABOUT MY CLIENTS.',
		'about.p1': 'I’m Rodion, a web developer. I make landing pages and websites for small businesses and startups.',
		'about.p2':
			'For over 3 years I have been building websites for business: leading projects from idea to launch, and alongside that working as a senior analyst at a marketing agency. That is why I think not only about code, but about how a site brings in money.',
		'about.p3':
			'Today I combine that experience with neural networks: AI speeds up the routine work, while decisions and checks stay with me. That’s why sites come out faster and cheaper, with the same quality.',
		'about.f1.k':
			'years of experience',
		'about.f1.v':
			'3+',
		'about.f2.k':
			'senior analyst at a marketing agency',
		'about.f2.v': 'Senior',
		'about.f3.k': 'working in two languages',
		'about.f3.v': 'RU / EN',

		'process.eyebrow': 'HOW I WORK',
		'process.title.line1': 'FIVE STEPS',
		'process.title.line2': 'TO LAUNCH.',
		'process.1.title': 'Request',
		'process.1.text': 'You describe the task in the form or a messenger. I reply within a day with questions.',
		'process.2.title': 'Agreement',
		'process.2.text': 'We fix scope, deadline and price in writing. 50% prepayment, the rest after delivery.',
		'process.3.title': 'Design',
		'process.3.text': 'Structure and a visual draft. You approve it before any code is written.',
		'process.4.title': 'Build',
		'process.4.text': 'I build it and show intermediate results. Two rounds of edits are included.',
		'process.5.title': 'Launch',
		'process.5.text': 'Hosting, domain, analytics and a check on every screen size. 7 days of free fixes after launch.',

		'pricing.eyebrow': 'PRICING',
		'pricing.title.line1': 'CLEAR PRICES,',
		'pricing.title.line2': 'NO SURPRISES.',
		'pricing.note': 'Guide prices. The exact figure is fixed after a short chat about your task.',
		'pricing.badge': 'RECOMMENDED',
		'pricing.cta': 'Order',
		'pricing.1.name': 'Landing page',
		'pricing.1.price': 'from $100',
		'pricing.1.time': '1–3 days',
		'pricing.1.f1': 'One page: offer, benefits, form',
		'pricing.1.f2': 'Responsive on any screen',
		'pricing.1.f3': 'Basic SEO and link preview',
		'pricing.1.f4': 'Lead form to your email or Telegram',
		'pricing.2.name': 'Business website',
		'pricing.2.price': 'from $330',
		'pricing.2.time': '1–2 weeks',
		'pricing.2.f1': 'Up to 6 pages',
		'pricing.2.f2': 'Design in your brand style',
		'pricing.2.f3': 'Animations, forms, analytics',
		'pricing.2.f4': 'Handover and short training',
		'pricing.3.name': 'Figma to code',
		'pricing.3.price': 'from $13/h',
		'pricing.3.time': 'by scope',
		'pricing.3.f1': 'Pixel-accurate layout from your design',
		'pricing.3.f2': 'Clean, documented code',
		'pricing.3.f3': 'API and CMS integration',
		'pricing.3.f4': 'Fixed price after estimate',
		'pricing.t1': 'Payment: bank transfer or cryptocurrency (USDT).',
		'pricing.t2': 'Fixed price and deadline are agreed before work starts.',
		'pricing.t3': 'Hosting and domain are paid separately, to your own account.',


		'faq.eyebrow': 'FAQ',
		'faq.title.line1': 'QUESTIONS',
		'faq.title.line2': 'BEFORE WE START.',
		'faq.1.q': 'How much does a website cost?',
		'faq.1.a':
			'A landing page starts at $100, a business website at $330, Figma-to-code work from $13/hour. The final price is fixed in writing after we discuss the task.',
		'faq.2.q': 'How long does it take?',
		'faq.2.a':
			'A landing page takes 1–3 days, a business website 1–2 weeks. Deadlines depend mostly on how fast texts and feedback arrive.',
		'faq.3.q': 'Do you work with clients abroad? How do I pay?',
		'faq.3.a':
			'Yes. We can talk in English or Russian. Payment is by bank transfer or cryptocurrency (USDT). 50% upfront, 50% after delivery.',
		'faq.4.q': 'You use neural networks — what about quality?',
		'faq.4.a':
			'AI speeds up routine work, but every decision and every line is checked by me. Before delivery I test the site on different screens and in Google PageSpeed, and show you the results.',
		'faq.5.q': 'What happens after launch?',
		'faq.5.a':
			'7 days of free fixes. After that, small edits and support are available as a separate paid service, hourly or monthly.',

		'contact.eyebrow': 'LET’S TALK',
		'contact.title.line1': 'TELL ME ABOUT',
		'contact.title.line2': 'YOUR PROJECT.',
		'contact.lead': 'Leave a request or write directly — I reply within a day. Even a couple of sentences is enough to start.',
		'contact.linksLabel': 'Contacts',
		'contact.empty': 'Direct contacts will appear here soon — please use the form.',
		'form.name': 'Name',
		'form.contact': 'How to reach you',
		'form.contact.ph': '@telegram / email / WhatsApp',
		'form.type': 'Project type',
		'form.type.landing': 'Landing page',
		'form.type.site': 'Business website',
		'form.type.frontend': 'Figma to code',
		'form.type.other': 'Something else',
		'form.budget': 'Budget (optional)',
		'form.budget.none': 'Not sure yet',
		'form.budget.1': 'up to $200',
		'form.budget.2': '$200–500',
		'form.budget.3': '$500+',
		'form.message': 'About the project',
		'form.message.ph': 'What the business does, what the site should achieve, deadlines, links to examples…',
		'form.consent.pre': 'I agree to the processing of my data according to the',
		'form.consent.link': 'privacy policy',
		'form.submit': 'Send request',
		'form.sending': 'Sending…',
		'form.ok': 'Thank you! The request is sent — I’ll reply within a day.',
		'form.mailto': 'Your mail app should open with the message. If not, write to the email on the left.',
		'form.err.required': 'Please fill in the highlighted fields and tick the consent box.',
		'form.err.send': 'Could not send. Please try again or write directly.',
		'form.err.noChannel': 'The form is not connected yet. Please contact me directly.',

		'footer.faq': 'FAQ',
		'footer.privacy': 'Privacy policy',
		'footer.top': 'Back to top',
		'a11y.footer': 'Footer',

		'privacy.title': 'Privacy policy',
		'reviews.eyebrow':
			'REVIEWS',
		'reviews.title.line1':
			'WHAT CLIENTS',
		'reviews.title.line2':
			'SAY ABOUT ME.',
		'reviews.rating':
			'on YouDo, 41 reviews',
		'reviews.note':
			'Reviews are from freelance tasks on YouDo (design, video, data, support), published in the original Russian.',
		'reviews.link':
			'All reviews on YouDo',

		'privacy.p1':
			'Who processes data: Rodion Kazimov, self-employed (professional income tax payer), web developer; contacts are listed on this site. Effective from 14 November 2026.',
		'privacy.p2':
			'What I collect: only what you enter in the contact form — name, contact details (Telegram / email / WhatsApp), budget, project type and description. Nothing is collected without you sending the form.',
		'privacy.p3':
			'Why: solely to reply to your request, discuss and carry out the project. I do not sell the data and do not use it for advertising or mailing lists.',
		'privacy.p4':
			'How the form works: the request is sent through the Web3Forms service (servers outside Russia) to my email. By sending the form you agree to such transfer. Requests received through the form (and the email thread that follows) are kept while needed for the project and up to 3 years after, then deleted.',
		'privacy.p5':
			'Hosting: the site is served by GitHub Pages; like any web server it may log technical data (IP address, browser, time of visit) for security. I do not have access to or use these logs.',
		'privacy.p6':
			'Cookies and analytics: the site sets no cookies and has no analytics or ad trackers. Your language choice is stored only in your browser (localStorage) and never sent anywhere.',
		'privacy.p7':
			'Your rights: you can ask what data I hold, correct it, withdraw consent or ask me to delete it, by writing to any contact on the site. I will answer within 10 working days.',
		'privacy.p8':
			'Changes: the current version of this policy is always on this page.',
		'privacy.close': 'Close',
	},

	ru: {
		'about.eyebrow': 'ОБО МНЕ',
		'about.badge': 'Родион · разработчик',
		'about.title.line1': 'Я РАЗРАБОТЧИК.',
		'about.title.line2': 'ДУМАЮ О СВОИХ КЛИЕНТАХ.',
		'about.p1': 'Я Родион, веб-разработчик. Делаю лендинги и сайты для малого бизнеса и стартапов.',
		'about.p2':
			'Более 3 лет делаю сайты для бизнеса: веду проекты от идеи до запуска и параллельно работал старшим аналитиком в маркетинговом агентстве. Поэтому думаю не только о коде, но и о том, как сайт приносит деньги.',
		'about.p3':
			'Сейчас совмещаю этот опыт с нейросетями: ИИ ускоряет рутину, а решения и проверка остаются за мной. Поэтому сайты получаются быстрее и дешевле при том же качестве.',
		'about.f1.k':
			'лет опыта в разработке и интернет-маркетинге',
		'about.f1.v':
			'3+',
		'about.f2.k':
			'аналитик в маркетинговом агентстве',
		'about.f2.v': 'Senior',
		'about.f3.k': 'работаю на двух языках',
		'about.f3.v': 'RU / EN',

		'process.eyebrow': 'КАК Я РАБОТАЮ',
		'process.title.line1': 'ПЯТЬ ШАГОВ',
		'process.title.line2': 'ДО ЗАПУСКА.',
		'process.1.title': 'Заявка',
		'process.1.text': 'Вы описываете задачу в форме или мессенджере. В течение суток отвечаю с уточняющими вопросами.',
		'process.2.title': 'Договорённости',
		'process.2.text': 'Фиксируем объём, срок и цену письменно. Предоплата 50%, остальное после сдачи.',
		'process.3.title': 'Дизайн',
		'process.3.text': 'Структура и визуальный черновик. Вы утверждаете их до того, как я напишу код.',
		'process.4.title': 'Разработка',
		'process.4.text': 'Верстаю и показываю промежуточные результаты. Два круга правок входят в цену.',
		'process.5.title': 'Запуск',
		'process.5.text': 'Хостинг, домен, аналитика и проверка на всех экранах. 7 дней бесплатных правок после запуска.',

		'pricing.eyebrow': 'ЦЕНЫ',
		'pricing.title.line1': 'ПОНЯТНЫЕ ЦЕНЫ,',
		'pricing.title.line2': 'БЕЗ СЮРПРИЗОВ.',
		'pricing.note': 'Ориентировочные цены. Точную сумму называю после короткого разговора о вашей задаче.',
		'pricing.badge': 'РЕКОМЕНДУЮ',
		'pricing.cta': 'Заказать',
		'pricing.1.name': 'Лендинг',
		'pricing.1.price': 'от 7 500 ₽',
		'pricing.1.time': '1–3 дня',
		'pricing.1.f1': 'Одна страница: оффер, выгоды, форма',
		'pricing.1.f2': 'Адаптивность под любой экран',
		'pricing.1.f3': 'Базовое SEO и превью ссылки',
		'pricing.1.f4': 'Форма заявок на вашу почту или в Telegram',
		'pricing.2.name': 'Сайт для бизнеса',
		'pricing.2.price': 'от 25 000 ₽',
		'pricing.2.time': '1–2 недели',
		'pricing.2.f1': 'До 6 страниц',
		'pricing.2.f2': 'Дизайн в стиле вашего бренда',
		'pricing.2.f3': 'Анимации, формы, аналитика',
		'pricing.2.f4': 'Передача сайта и краткое обучение',
		'pricing.3.name': 'Вёрстка по Figma',
		'pricing.3.price': 'от 1 000 ₽/час',
		'pricing.3.time': 'по объёму',
		'pricing.3.f1': 'Точная вёрстка по вашему макету',
		'pricing.3.f2': 'Чистый код с комментариями',
		'pricing.3.f3': 'Подключение API и CMS',
		'pricing.3.f4': 'Фиксированная цена после оценки',
		'pricing.t1': 'Оплата: банковский перевод или криптовалюта (USDT).',
		'pricing.t2': 'Цена и срок фиксируются до начала работы.',
		'pricing.t3': 'Хостинг и домен оплачиваются отдельно, на ваш аккаунт.',


		'faq.eyebrow': 'ВОПРОСЫ',
		'faq.title.line1': 'ВОПРОСЫ',
		'faq.title.line2': 'ПЕРЕД СТАРТОМ.',
		'faq.1.q': 'Сколько стоит сайт?',
		'faq.1.a':
			'Лендинг — от 7 500 ₽, сайт для бизнеса — от 25 000 ₽, вёрстка по Figma — от 1 000 ₽/час. Итоговую цену фиксируем письменно после обсуждения задачи.',
		'faq.2.q': 'Как быстро будет готово?',
		'faq.2.a':
			'Лендинг — 1–3 дня, сайт для бизнеса — 1–2 недели. Срок во многом зависит от того, как быстро приходят тексты и ответы на вопросы.',
		'faq.3.q': 'Работаете с зарубежными клиентами? Как платить?',
		'faq.3.a':
			'Да, общаюсь на русском и английском. Оплата — банковским переводом или криптовалютой (USDT). 50% вперёд, 50% после сдачи.',
		'faq.4.q': 'Вы используете нейросети — что с качеством?',
		'faq.4.a':
			'ИИ ускоряет рутину, но каждое решение и каждую строку проверяю я. Перед сдачей тестирую сайт на разных экранах и в Google PageSpeed и показываю вам результаты.',
		'faq.5.q': 'Что после запуска?',
		'faq.5.a':
			'7 дней бесплатных правок. Дальше мелкие правки и поддержка — отдельной платной услугой, почасово или помесячно.',

		'contact.eyebrow': 'ДАВАЙТЕ ОБСУДИМ',
		'contact.title.line1': 'РАССКАЖИТЕ О',
		'contact.title.line2': 'ВАШЕМ ПРОЕКТЕ.',
		'contact.lead': 'Оставьте заявку или напишите напрямую — отвечаю в течение суток. Для начала хватит пары предложений.',
		'contact.linksLabel': 'Контакты',
		'contact.empty': 'Прямые контакты скоро появятся — пока воспользуйтесь формой.',
		'form.name': 'Имя',
		'form.contact': 'Как с вами связаться',
		'form.contact.ph': '@telegram / email / WhatsApp',
		'form.type': 'Тип проекта',
		'form.type.landing': 'Лендинг',
		'form.type.site': 'Сайт для бизнеса',
		'form.type.frontend': 'Вёрстка по Figma',
		'form.type.other': 'Что-то другое',
		'form.budget': 'Бюджет (необязательно)',
		'form.budget.none': 'Пока не знаю',
		'form.budget.1': 'до 15 000 ₽',
		'form.budget.2': '15 000 – 40 000 ₽',
		'form.budget.3': 'от 40 000 ₽',
		'form.message': 'О проекте',
		'form.message.ph': 'Чем занимается бизнес, какую задачу решает сайт, сроки, ссылки на примеры…',
		'form.consent.pre': 'Согласен на обработку данных в соответствии с',
		'form.consent.link': 'политикой конфиденциальности',
		'form.submit': 'Отправить заявку',
		'form.sending': 'Отправляю…',
		'form.ok': 'Спасибо! Заявка отправлена — отвечу в течение суток.',
		'form.mailto': 'Должна открыться почтовая программа с письмом. Если нет — напишите на почту слева.',
		'form.err.required': 'Заполните подсвеченные поля и поставьте галочку согласия.',
		'form.err.send': 'Не удалось отправить. Попробуйте ещё раз или напишите напрямую.',
		'form.err.noChannel': 'Форма пока не подключена. Свяжитесь со мной напрямую.',

		'footer.faq': 'Вопросы',
		'footer.privacy': 'Политика конфиденциальности',
		'footer.top': 'Наверх',
		'a11y.footer': 'Подвал сайта',

		'privacy.title': 'Политика конфиденциальности',
		'reviews.eyebrow':
			'ОТЗЫВЫ',
		'reviews.title.line1':
			'ЧТО ГОВОРЯТ',
		'reviews.title.line2':
			'КЛИЕНТЫ.',
		'reviews.rating':
			'на YouDo, 41 отзыв',
		'reviews.note':
			'Отзывы с фриланс-заданий на YouDo (дизайн, видео, данные, техподдержка).',
		'reviews.link':
			'Все отзывы на YouDo',

		'privacy.p1':
			'Кто обрабатывает данные: Родион Казимов, самозанятый (плательщик НПД), веб-разработчик; контакты указаны на сайте. Действует с 14 ноября 2026 года.',
		'privacy.p2':
			'Что собирается: только то, что вы вводите в форму заявки — имя, контакт (Telegram / email / WhatsApp), бюджет, тип проекта и описание задачи. Без отправки формы ничего не собирается.',
		'privacy.p3':
			'Зачем: только чтобы ответить на заявку, обсудить и выполнить проект. Данные не продаются и не используются для рекламы или рассылок.',
		'privacy.p4':
			'Как работает форма: заявка отправляется через сервис Web3Forms (серверы за пределами России) мне на почту. Отправляя форму, вы соглашаетесь на такую передачу. Полученные заявки (и последующая переписка по ним) хранятся, пока нужны для проекта, и до 3 лет после него, затем удаляются.',
		'privacy.p5':
			'Хостинг: сайт размещён на GitHub Pages; как любой веб-сервер, он может записывать технические данные (IP-адрес, браузер, время визита) в целях безопасности. Доступа к этим журналам и их использования у меня нет.',
		'privacy.p6':
			'Cookie и аналитика: сайт не использует cookie, на нём нет аналитики и рекламных трекеров. Выбранный язык хранится только в вашем браузере (localStorage) и никуда не отправляется.',
		'privacy.p7':
			'Ваши права: вы можете запросить, какие данные у меня есть, исправить их, отозвать согласие или потребовать удаления — напишите на любой контакт с сайта. Отвечу в течение 10 рабочих дней.',
		'privacy.p8':
			'Изменения: актуальная версия политики всегда находится на этой странице.',
		'privacy.close': 'Закрыть',
	},
};
