(() => {
	this.synth;
	this.voice;
	this.attempts = 0;
	this.defaultLang = 'en-GB';
	this.chunkLength = 160;

	if ('speechSynthesis' in window) {
		this.synth = window.speechSynthesis;
		loadVoice(this.defaultLang);
	}

	function loadVoice(lang = this.defaultLang) {
		this.attempts++;
		const voices = this.synth.getVoices();

		if (voices.length) {
			this.voice = voices.find(v => v.lang === lang);
		}
		if (!this.voice) {
			if (this.attempts < 10) {
				setTimeout(() => {
					loadVoice(lang);
				}, 250);
			} else {
				console.error(`${lang} voice not found.`);
			}
		}
	}

	function speak(text) {
		if (!this.synth || this.synth.speaking) {
			return;
		}
		// …,..., ___
		const output = text.replace(/(…|[._]{2,})/, '');
		const utterance = new SpeechSynthesisUtterance(output);
		utterance.addEventListener('error', error => console.error(error));
		utterance.lang = 'ja-JP';
		utterance.pitch = 1;
		utterance.rate = 1;
		utterance.voice = this.voice;
		utterance.volume = 1;

		utterance.onstart = () => { resumeInfinity() };
		utterance.onend = () => { clearTimeout(timeoutResumeInfinity) };

		this.synth.speak(utterance);
	}

	function resumeInfinity() {
		window.speechSynthesis.resume();
		timeoutResumeInfinity = setTimeout(resumeInfinity, 1000);
	}

	function populateVoiceList() {
		if (typeof speechSynthesis === 'undefined' || this.voices) {
			return;
		}

		voices = speechSynthesis.getVoices();
		this.voices = voices;
		for (i = 0; i < voices.length; i++) {
			var option = document.createElement('option');
			option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

			if (voices[i].lang === this.defaultLang) {
				option.textContent += ' -- DEFAULT';
			}

			document.querySelector('select.dropdown-content').appendChild(option);
		}
	}

	document.addEventListener('DOMContentLoaded', () => {
		const textArea = document.querySelector('textarea');
		textArea.textContent = 'Speech synthesis has come a long way since it’s first appearance in operating systems in the 1980s. In the 1990s Apple already offered system-wide text-to-speech support. Alexa, Cortana, Siri and other virtual assistants recently brought speech synthesis to the masses. In modern browsers the Web Speech API allows you to gain access to your device’s speech capabilities, so let’s start using it!'

		const speakBtn = document.querySelector('button#dumai');
		speakBtn.addEventListener('click', () => {
			const text = document.querySelector('textarea').value;
			speak(text);
		});

		const shutUpBtn = document.querySelector('button#shut-up');
		shutUpBtn.addEventListener('click', () => {
			speechSynthesis.cancel();
		});

		const select = document.querySelector('select.dropdown-content');
		select.addEventListener('change', () => {
			const langStr = select.value.match(/([a-z]{2}-[A-Z]{2})/g)[0];
			if (langStr) loadVoice(langStr);
		});

		populateVoiceList();
		if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
			speechSynthesis.onvoiceschanged = populateVoiceList;
		}
	}, false);
})();