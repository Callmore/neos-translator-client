enum Language {
    EnglishUK = "english-uk",
    EnglishUS = "english-us",
    Japanese = "japanese",
    Korean = "korean",
    Chinese = "chinese",
    Russian = "russian",
    French = "french",
}

const languageToRecognitionLang: Record<Language, string> = {
    [Language.EnglishUK]: "en-GB",
    [Language.EnglishUS]: "en-US",
    [Language.Japanese]: "ja-JP",
    [Language.Korean]: "ko-KR",
    [Language.Chinese]: "zh",
    [Language.Russian]: "ru-RU",
    [Language.French]: "fr-FR",
};

const languageToTranslationLang: Record<Language, string> = {
    [Language.EnglishUK]: "en",
    [Language.EnglishUS]: "en",
    [Language.Japanese]: "ja",
    [Language.Korean]: "ko",
    [Language.Chinese]: "zh",
    [Language.Russian]: "ru",
    [Language.French]: "fr",
};

const languageFriendlyName: Record<Language, string> = {
    [Language.EnglishUK]: "English (UK)",
    [Language.EnglishUS]: "English (US)",
    [Language.Japanese]: "Japanese",
    [Language.Korean]: "Korean",
    [Language.Chinese]: "Chinese",
    [Language.Russian]: "Russian",
    [Language.French]: "French",
};

function setupLanguageEntries() {
    for (const lang of Object.values(Language).sort()) {
        langFromEntry.add(new Option(languageFriendlyName[lang], lang));
        langToEntry.add(new Option(languageFriendlyName[lang], lang));
    }

    // Load from webstorage
    if (window.localStorage != undefined) {
        const langFrom = window.localStorage.getItem("langFrom");
        const langTo = window.localStorage.getItem("langTo");

        if (langFrom != undefined) {
            langFromEntry.value = langFrom;
        }

        if (langTo != undefined) {
            langToEntry.value = langTo;
        }
    }
}
setupLanguageEntries();

langFromEntry.addEventListener("change", (e) => {
    e.preventDefault();

    recognition.lang =
        languageToRecognitionLang[langFromEntry.value as Language];

    if (window.localStorage != undefined) {
        window.localStorage.setItem("langFrom", langFromEntry.value);
    }
});

langToEntry.addEventListener("change", (e) => {
    e.preventDefault();

    if (window.localStorage != undefined) {
        window.localStorage.setItem("langTo", langToEntry.value);
    }
});
