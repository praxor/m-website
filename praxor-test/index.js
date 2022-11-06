const reasons = {
    "Reason 1":"I wanted to see how easy it would be to fully copy a website, so I chose the one I thought it looked nice.",
    "Reason 2":"It was a tad bit easier than I thought.",
    "Reason 3":"I woke up early in the morning just to do some trickery."
};

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
};

const reasonSection = document.getElementById("reasonSection");
const qaSection = document.getElementById('QA');

try {
    Object.values(reasons).forEach(reason => {
        let reasontitle = getKeyByValue(reasons, reason);
        let entry = document.createElement("div");
        entry.setAttribute("class", "entry");
        reasonSection.appendChild(entry);

        let entrytitle = document.createElement("div");
        entrytitle.setAttribute("class", "entry-title");
        entrytitle.innerHTML = reasontitle;
        entry.appendChild(entrytitle);

        let entrycontent = document.createElement("div");
        entrycontent.setAttribute("class", "entry-content");
        entrycontent.innerHTML = reason;
        entry.appendChild(entrycontent);
    });

    document.getElementById('scroll').addEventListener('click', () => qaSection.scrollIntoView());
    document.getElementById('qaButton').addEventListener('click', () => qaSection.scrollIntoView());

    
} 

catch (toohi) {
    console.warn("Yo yo yo! What it is, motherfuckers?");
}