async function translateText(
    text: string,
    langFrom: Language,
    langTo: Language
) {
    const url = new URL(APIURLEntry.value);

    url.searchParams.append("text", text);
    url.searchParams.append("source", languageToTranslationLang[langFrom]);
    url.searchParams.append("target", languageToTranslationLang[langTo]);

    const response = await fetch(url);

    if (!response.ok) {
        throw Error(
            `Bad status while translating (Status: ${response.status})`
        );
    }

    return response.text();
}
