document.addEventListener('DOMContentLoaded', function () {
    var faqs = {
        es: [
            {
                q: '\u00bfQu\u00e9 servicios ofrecen?',
                a: 'Ofrecemos desarrollo web, apps m\u00f3viles, consultor\u00eda IT, migraci\u00f3n a la nube, UI/UX design y SEO & marketing digital. Todos nuestros servicios est\u00e1n dise\u00f1ados para impulsar tu negocio con tecnolog\u00eda de punta.'
            },
            {
                q: '\u00bfCu\u00e1nto cuesta un proyecto?',
                a: 'El costo depende del alcance y complejidad del proyecto. Ofrecemos cotizaciones personalizadas sin compromiso. Cont\u00e1ctanos para agendar una consultor\u00eda gratuita y recibe un presupuesto ajustado a tus necesidades.'
            },
            {
                q: '\u00bfCu\u00e1nto tiempo toma el desarrollo?',
                a: 'Dependiendo del proyecto: landing pages (2-4 semanas), sitios web (4-8 semanas), apps m\u00f3viles (8-16 semanas) y plataformas complejas (3-6 meses). Te daremos un timeline claro en la cotizaci\u00f3n.'
            },
            {
                q: '\u00bfOfrecen mantenimiento?',
                a: 'S\u00ed, ofrecemos planes mensuales con actualizaciones de seguridad, soporte t\u00e9cnico, respaldo de datos y mejoras continuas para mantener tu proyecto optimizado.'
            },
            {
                q: '\u00bfQu\u00e9 tecnolog\u00edas usan?',
                a: 'Trabajamos con React, Next.js, Node.js para web; Flutter, Kotlin, Swift para m\u00f3viles; AWS, Google Cloud, Firebase para cloud. Elegimos el stack ideal para cada proyecto.'
            },
            {
                q: '\u00bfC\u00f3mo inicio un proyecto?',
                a: '1) Cont\u00e1ctanos por formulario o WhatsApp, 2) Agendamos una llamada gratuita, 3) Preparamos una propuesta personalizada, 4) Iniciamos el desarrollo con metodolog\u00edas \u00e1giles.'
            },
            {
                q: '\u00bfTrabajan internacional?',
                a: '\u00a1S\u00ed! Trabajamos con clientes de M\u00e9xico, EE.UU., Canad\u00e1 y Latinoam\u00e9rica. Reuniones virtuales, adaptaci\u00f3n de horarios y comunicaci\u00f3n en espa\u00f1ol e ingl\u00e9s.'
            },
            {
                q: '\u00bfCu\u00e1l es el proceso?',
                a: 'Seguimos Scrum: 1) Descubrimiento, 2) Dise\u00f1o UI/UX, 3) Desarrollo en sprints, 4) Pruebas QA, 5) Despliegue, 6) Mantenimiento continuo.'
            }
        ],
        en: [
            {
                q: 'What services do you offer?',
                a: 'We offer web development, mobile apps, IT consulting, cloud migration, UI/UX design, and SEO & digital marketing. All services are designed to boost your business with cutting-edge technology.'
            },
            {
                q: 'How much does a project cost?',
                a: 'Cost depends on scope and complexity. We offer free custom quotes. Contact us for a free consultation and receive a budget tailored to your needs.'
            },
            {
                q: 'How long does development take?',
                a: 'Depending on the project: landing pages (2-4 weeks), websites (4-8 weeks), mobile apps (8-16 weeks), complex platforms (3-6 months). We provide a clear timeline with your quote.'
            },
            {
                q: 'Do you offer maintenance?',
                a: 'Yes! We offer monthly plans with security updates, technical support, data backups, and continuous improvements to keep your project running smoothly.'
            },
            {
                q: 'What technologies do you use?',
                a: 'We work with React, Next.js, Node.js for web; Flutter, Kotlin, Swift for mobile; AWS, Google Cloud, Firebase for cloud. We choose the ideal stack for each project.'
            },
            {
                q: 'How do I start a project?',
                a: '1) Contact us via form or WhatsApp, 2) Schedule a free discovery call, 3) Receive a custom proposal, 4) Start development with agile methodologies.'
            },
            {
                q: 'Do you work internationally?',
                a: 'Yes! We work with clients from the US, Canada, Mexico, and Latin America. Virtual meetings, time zone adaptation, and communication in Spanish and English.'
            },
            {
                q: 'What is the development process?',
                a: 'We follow Scrum: 1) Discovery, 2) UI/UX Design, 3) Sprint development, 4) QA testing, 5) Launch, 6) Ongoing maintenance.'
            }
        ]
    };

    var chatToggle = document.getElementById('chatToggle');
    var chatPanel = document.getElementById('chatPanel');
    var chatClose = document.getElementById('chatClose');
    var chatMessages = document.getElementById('chatMessages');
    var chatFaq = document.getElementById('chatFaq');
    var answerTimer = null;

    if (!chatToggle || !chatPanel) return;

    function getLang() {
        return (typeof i18n !== 'undefined' && i18n.currentLang) || 'es';
    }

    function t(key) {
        if (typeof i18n !== 'undefined' && i18n.translations[key]) {
            return i18n.translations[key][i18n.currentLang];
        }
        return key;
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addMessage(text, type) {
        var div = document.createElement('div');
        div.className = 'chat-message ' + type;
        div.textContent = text;
        chatMessages.appendChild(div);
        scrollToBottom();
    }

    function renderFaqs() {
        chatFaq.innerHTML = '';
        var lang = getLang();
        var list = faqs[lang] || faqs.es;
        list.forEach(function (faq, index) {
            var btn = document.createElement('button');
            btn.className = 'faq-btn';
            btn.textContent = faq.q;
            btn.addEventListener('click', function () {
                handleFaqClick(index);
            });
            chatFaq.appendChild(btn);
        });
    }

    function showWelcome() {
        clearAnswerTimer();
        chatMessages.innerHTML = '';
        addMessage(t('chat.welcome'), 'bot');
        renderFaqs();
        scrollToBottom();
    }

    function handleFaqClick(index) {
        var lang = getLang();
        var list = faqs[lang] || faqs.es;
        var item = list[index];
        if (!item) return;

        clearAnswerTimer();
        chatFaq.innerHTML = '';

        addMessage(item.q, 'user');

        answerTimer = setTimeout(function () {
            answerTimer = null;
            addMessage(item.a, 'bot');

            var backBtn = document.createElement('button');
            backBtn.className = 'faq-back-btn';
            backBtn.textContent = '\u2190 ' + t('chat.back');
            backBtn.addEventListener('click', function () {
                showWelcome();
            });
            chatFaq.appendChild(backBtn);
            scrollToBottom();
        }, 400);
    }

    function openChat() {
        chatPanel.classList.add('active');
        chatToggle.classList.add('active');
        chatToggle.setAttribute('aria-label', 'Cerrar chat');
        chatPanel.setAttribute('aria-hidden', 'false');
        if (window.innerWidth <= 480) {
            if (window.bgsScrollLock) window.bgsScrollLock.acquire();
            else document.body.classList.add('no-scroll');
        }
        showWelcome();
    }

    function closeChat() {
        chatPanel.classList.remove('active');
        chatToggle.classList.remove('active');
        chatToggle.setAttribute('aria-label', 'Abrir chat');
        chatPanel.setAttribute('aria-hidden', 'true');
        if (window.bgsScrollLock) window.bgsScrollLock.release();
        document.body.classList.remove('no-scroll');
        clearAnswerTimer();
        chatMessages.innerHTML = '';
        chatFaq.innerHTML = '';
    }

    function clearAnswerTimer() {
        if (answerTimer) {
            clearTimeout(answerTimer);
            answerTimer = null;
        }
    }

    chatToggle.addEventListener('click', function () {
        if (chatPanel.classList.contains('active')) {
            closeChat();
        } else {
            openChat();
        }
    });

    chatClose.addEventListener('click', closeChat);

    if (typeof i18n !== 'undefined') {
        var originalSetLang = i18n.setLang;
        i18n.setLang = function (lang) {
            originalSetLang.call(i18n, lang);
            if (chatPanel.classList.contains('active')) {
                showWelcome();
            }
        };
    }
});
