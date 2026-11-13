// src/js/sections/contact.js
//
// Контакты, форма заявки, окно политики конфиденциальности, год в футере.
// Данные — в src/config.js.
//
// Отправка формы: Web3Forms (публичный ключ, письмо приходит на твою почту).
// Если ключа нет — запасной вариант: открывается почтовая программа (mailto).
// Если нет ни ключа, ни почты — пользователю честно сообщаем, что форма не подключена.

import { CONTACTS, FORM } from '../../config.js';
import { t } from '../i18n.js';

const CHANNELS = [
	{ key: 'telegram', label: 'Telegram', href: (v) => `https://t.me/${v}`, text: (v) => `@${v}` },
	{ key: 'email', label: 'Email', href: (v) => `mailto:${v}`, text: (v) => v },
	{ key: 'whatsapp', label: 'WhatsApp', href: (v) => `https://wa.me/${v}`, text: (v) => `+${v}` },
	{ key: 'linkedin', label: 'LinkedIn', href: (v) => `https://www.linkedin.com/in/${v}`, text: () => 'linkedin.com/in' },
	{ key: 'upwork', label: 'Upwork', href: (v) => v, text: () => 'upwork.com' },
	{ key: 'github', label: 'GitHub', href: (v) => `https://github.com/${v}`, text: (v) => `github.com/${v}` },
];

function renderLinks() {
	const list = document.querySelector('[data-contact-links]');
	const empty = document.querySelector('[data-contact-empty]');
	if (!list) return;

	let shown = 0;
	CHANNELS.forEach((ch) => {
		const value = (CONTACTS[ch.key] || '').trim();
		if (!value) return;
		const li = document.createElement('li');
		const a = document.createElement('a');
		a.className = 'contact__link';
		a.href = ch.href(value);
		if (!a.href.startsWith('mailto:')) {
			a.target = '_blank';
			a.rel = 'noopener noreferrer';
		}
		const name = document.createElement('span');
		name.className = 'contact__link-name';
		name.textContent = ch.label;
		const text = document.createElement('span');
		text.className = 'contact__link-text';
		text.textContent = ch.text(value);
		a.append(name, text);
		li.append(a);
		list.append(li);
		if (ch.key !== 'github') shown++;
	});

	// GitHub — не канал для заказов, поэтому «пусто» считаем без него.
	if (empty) empty.hidden = shown > 0;
}

function initForm() {
	const form = document.querySelector('[data-form]');
	if (!form) return;
	const status = form.querySelector('[data-form-status]');
	const submit = form.querySelector('.form__submit');
	const setStatus = (key, kind) => {
		status.textContent = key ? t(key) : '';
		status.dataset.kind = kind || '';
	};

	// Кнопки «Заказать» в ценах сразу выбирают тип проекта в форме.
	document.querySelectorAll('[data-plan]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const select = form.querySelector('[data-form-type]');
			if (select) select.value = btn.getAttribute('data-plan');
		});
	});

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		// Бот заполнил скрытое поле — молча делаем вид, что всё хорошо.
		if (form.elements.botcheck.value) return setStatus('form.ok', 'ok');

		// Подсветка пустых обязательных полей (свои стили вместо браузерных всплывашек).
		let valid = true;
		form.querySelectorAll('[required]').forEach((field) => {
			const bad = field.type === 'checkbox' ? !field.checked : !field.value.trim();
			field.setAttribute('aria-invalid', String(bad));
			if (bad) valid = false;
		});
		if (!valid) {
			form.querySelector('[aria-invalid="true"]')?.focus();
			return setStatus('form.err.required', 'error');
		}

		const data = {
			name: form.elements.name.value.trim(),
			contact: form.elements.contact.value.trim(),
			type: form.elements.type.value,
			budget: form.elements.budget.value || '—',
			message: form.elements.message.value.trim(),
		};

		if (FORM.web3formsKey) {
			submit.disabled = true;
			setStatus('form.sending', '');
			try {
				const res = await fetch('https://api.web3forms.com/submit', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
					body: JSON.stringify({
						access_key: FORM.web3formsKey,
						subject: `Заявка с сайта: ${data.type} — ${data.name}`,
						from_name: 'Сайт-портфолио',
						...data,
					}),
				});
				const json = await res.json();
				if (!res.ok || !json.success) throw new Error(json.message || res.status);
				form.reset();
				setStatus('form.ok', 'ok');
			} catch (error) {
				console.error('[form]', error);
				setStatus('form.err.send', 'error');
			} finally {
				submit.disabled = false;
			}
			return;
		}

		const email = (CONTACTS.email || '').trim();
		if (!email) return setStatus('form.err.noChannel', 'error');

		const body = `${data.message}\n\n— ${data.name}\n${data.contact}\n${data.type}, ${data.budget}`;
		window.location.href = `mailto:${email}?subject=${encodeURIComponent('Заявка с сайта: ' + data.type)}&body=${encodeURIComponent(body)}`;
		setStatus('form.mailto', 'ok');
	});

	form.addEventListener('input', (event) => {
		if (event.target.hasAttribute('aria-invalid')) event.target.removeAttribute('aria-invalid');
	});
}

// Политика конфиденциальности: нативный <dialog> (Esc, фокус-ловушка и затемнение — из коробки).
function initPrivacy() {
	const dialog = document.querySelector('[data-privacy]');
	if (!dialog || typeof dialog.showModal !== 'function') return;

	const open = () => {
		if (!dialog.open) dialog.showModal();
	};
	document.querySelectorAll('[data-privacy-open]').forEach((el) =>
		el.addEventListener('click', (event) => {
			event.preventDefault();
			open();
		})
	);
	dialog.querySelector('[data-privacy-close]')?.addEventListener('click', () => dialog.close());
	// Клик по затемнению вокруг окна закрывает его.
	dialog.addEventListener('click', (event) => {
		if (event.target === dialog) dialog.close();
	});
}

function initAnalytics(config) {
	if (!config.src) return;
	const script = document.createElement('script');
	script.defer = true;
	script.src = config.src;
	Object.entries(config.attrs || {}).forEach(([k, v]) => script.setAttribute(k, v));
	document.head.append(script);
}

export function initContact() {
	renderLinks();
	initForm();
	initPrivacy();
	document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = String(new Date().getFullYear())));
}

export { initAnalytics };
